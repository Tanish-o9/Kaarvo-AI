import logging
from decimal import Decimal
from datetime import timedelta
from django.utils import timezone
from django.db import transaction
from django.core.exceptions import ValidationError
from auctions.models import (
    Auction, AuctionStatus, Bid, BidStatus,
    AuctionEvent, AuctionEventType, AuctionPayment, AuctionNotification
)

logger = logging.getLogger(__name__)


class BiddingService:
    @staticmethod
    def place_bid(auction_id, buyer, amount: Decimal, idempotency_key: str = None, ip_address: str = None) -> Bid:
        """
        Place a new bid with high-concurrency protection via row-level locking (select_for_update).
        Enforces all auction business rules:
        - Buyer is authenticated and not the seller.
        - Auction is LIVE and within active time window.
        - Bid amount meets or exceeds minimum valid next bid.
        - Previous highest bid marked OUTBID.
        - Anti-sniping window triggers automatic extension if applicable.
        - Audit trail and in-app notifications generated.
        """
        if not buyer or not buyer.is_authenticated:
            raise ValidationError("You must be logged in to place a bid.")

        if not buyer.is_active:
            raise ValidationError("Your account is not active.")

        # Decimal enforcement
        if not isinstance(amount, Decimal):
            amount = Decimal(str(amount))

        if amount <= Decimal('0.00'):
            raise ValidationError("Bid amount must be greater than zero.")

        # Idempotency check: if key already exists, return previous valid bid
        if idempotency_key:
            existing_bid = Bid.objects.filter(idempotency_key=idempotency_key, buyer=buyer).first()
            if existing_bid:
                logger.info(f"Idempotent bid replay for key {idempotency_key}, bid ID: {existing_bid.id}")
                return existing_bid

        with transaction.atomic():
            # 1. Acquire row-level lock on auction
            try:
                auction = Auction.objects.select_for_update().get(id=auction_id)
            except Auction.DoesNotExist:
                raise ValidationError("Auction not found.")

            # 2. Prevent self-bidding
            if auction.seller == buyer:
                raise ValidationError("Sellers are strictly prohibited from bidding on their own auctions.")

            now = timezone.now()

            # 3. Status check
            if auction.status != AuctionStatus.LIVE:
                raise ValidationError(f"This auction is currently {auction.status} and cannot accept bids.")

            if now < auction.start_time:
                raise ValidationError("This auction has not started yet.")

            if now > auction.end_time:
                raise ValidationError("This auction has already ended.")

            # 4. Check Buy Now instant purchase
            is_buy_now = False
            if auction.buy_now_price is not None and amount >= auction.buy_now_price:
                is_buy_now = True

            # 5. Price validation
            min_valid = auction.minimum_next_bid
            if not is_buy_now and amount < min_valid:
                raise ValidationError(
                    f"Your bid of ₹{amount} is too low. The minimum valid next bid is ₹{min_valid} "
                    f"(Current highest: ₹{auction.current_highest_bid or auction.starting_price} + Increment: ₹{auction.minimum_increment})."
                )

            # 6. Retrieve previous highest bid for outbid notifications
            prev_highest_bid = auction.bids.filter(status__in=[BidStatus.VALID, BidStatus.WINNING]).order_by('-amount', '-bid_time').first()

            # 7. Create new bid record
            new_bid = Bid.objects.create(
                auction=auction,
                buyer=buyer,
                amount=amount,
                status=BidStatus.WINNING if is_buy_now else BidStatus.VALID,
                idempotency_key=idempotency_key,
                ip_address=ip_address
            )

            # 8. Mark previous highest bid as OUTBID
            if prev_highest_bid and prev_highest_bid.buyer != buyer:
                prev_highest_bid.status = BidStatus.OUTBID
                prev_highest_bid.save(update_fields=['status'])

                # Log Outbid event & notify previous bidder
                AuctionEvent.objects.create(
                    auction=auction,
                    event_type=AuctionEventType.OUTBID,
                    actor=buyer,
                    event_details={
                        'outbid_user': prev_highest_bid.buyer.username,
                        'previous_bid': str(prev_highest_bid.amount),
                        'new_highest_bid': str(amount)
                    }
                )

                AuctionNotification.objects.create(
                    recipient=prev_highest_bid.buyer,
                    auction=auction,
                    notification_type='OUTBID',
                    title=f"You've been outbid on '{auction.title}'!",
                    message=f"Another buyer placed a higher bid of ₹{amount} on '{auction.title}'. Place a higher bid now to stay in the race!"
                )

            # 9. Update Auction state
            auction.current_highest_bid = amount
            auction.total_bids += 1

            # 10. Anti-Sniping Check: if bid placed within 2 minutes of end_time, extend by 5 minutes
            time_remaining = (auction.end_time - now).total_seconds()
            extended = False
            if auction.anti_sniping_enabled and not is_buy_now and time_remaining <= 120:
                extension_delta = timedelta(minutes=auction.anti_sniping_extension_minutes)
                auction.end_time = auction.end_time + extension_delta
                auction.extensions_count += 1
                extended = True

                AuctionEvent.objects.create(
                    auction=auction,
                    event_type=AuctionEventType.ANTI_SNIPING_EXTENDED,
                    actor=buyer,
                    event_details={
                        'extended_minutes': auction.anti_sniping_extension_minutes,
                        'new_end_time': str(auction.end_time),
                        'extensions_count': auction.extensions_count
                    }
                )

            # 11. Record BID_PLACED event
            AuctionEvent.objects.create(
                auction=auction,
                event_type=AuctionEventType.BID_PLACED,
                actor=buyer,
                event_details={
                    'bid_id': str(new_bid.id),
                    'amount': str(amount),
                    'buyer': buyer.username,
                    'is_buy_now': is_buy_now,
                    'anti_sniping_extended': extended
                }
            )

            # 12. Handle Buy Now immediate close if triggered
            if is_buy_now:
                auction.winner = buyer
                auction.winning_bid = new_bid
                auction.status = AuctionStatus.PAYMENT_PENDING
                deadline = now + timedelta(hours=24)
                AuctionPayment.objects.create(
                    auction=auction,
                    winner=buyer,
                    amount=amount,
                    payment_deadline=deadline,
                    status=AuctionPayment.PaymentStatus.PENDING
                )

                AuctionEvent.objects.create(
                    auction=auction,
                    event_type=AuctionEventType.BUY_NOW_TRIGGERED,
                    actor=buyer,
                    event_details={'price': str(amount), 'winner': buyer.username}
                )

                AuctionNotification.objects.create(
                    recipient=buyer,
                    auction=auction,
                    notification_type='WINNER_ANNOUNCEMENT',
                    title=f"Instant Purchase Confirmed: {auction.title}",
                    message=f"You purchased '{auction.title}' via Buy Now for ₹{amount}! Please complete your payment."
                )

            auction.save(update_fields=[
                'current_highest_bid', 'total_bids', 'end_time',
                'extensions_count', 'status', 'winner', 'winning_bid', 'updated_at'
            ])

            # 13. Notify bidder of confirmation
            AuctionNotification.objects.create(
                recipient=buyer,
                auction=auction,
                notification_type='BID_PLACED',
                title=f"Bid Placed: ₹{amount}",
                message=f"Your bid of ₹{amount} on '{auction.title}' was successfully recorded."
            )

            # 14. Notify seller
            AuctionNotification.objects.create(
                recipient=auction.seller,
                auction=auction,
                notification_type='BID_PLACED',
                title=f"New Bid on '{auction.title}'",
                message=f"Buyer {buyer.username} placed a new highest bid of ₹{amount} on your auction."
            )

        return new_bid

