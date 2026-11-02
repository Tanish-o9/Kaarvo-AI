import logging
from datetime import timedelta
from decimal import Decimal
from django.utils import timezone
from django.db import transaction
from auctions.models import (
    Auction, AuctionStatus, Bid, BidStatus,
    AuctionEvent, AuctionEventType, AuctionPayment, AuctionNotification
)

logger = logging.getLogger(__name__)


def close_auction_and_determine_winner(auction: Auction) -> Auction:
    """
    Idempotent procedure to close an auction when end_time is reached.
    1. Lock row with select_for_update().
    2. Check status (only LIVE can be closed).
    3. Evaluate bids.
    4. Set winner or RESERVE_NOT_MET or ENDED.
    5. Create payment obligation and notifications.
    """
    with transaction.atomic():
        locked = Auction.objects.select_for_update().get(id=auction.id)

        # Idempotency check: if already ended, do not re-process
        if locked.status != AuctionStatus.LIVE:
            return locked

        now = timezone.now()
        # Find highest valid bid
        highest_bid = locked.bids.filter(status__in=[BidStatus.VALID, BidStatus.WINNING]).order_by('-amount', '-bid_time').first()

        if not highest_bid:
            # No bids submitted
            locked.status = AuctionStatus.ENDED
            locked.winner = None
            locked.winning_bid = None
            locked.save(update_fields=['status', 'winner', 'winning_bid', 'updated_at'])

            AuctionEvent.objects.create(
                auction=locked,
                event_type=AuctionEventType.AUCTION_ENDED,
                event_details={'reason': 'NO_BIDS', 'bids_count': 0}
            )

            AuctionNotification.objects.create(
                recipient=locked.seller,
                auction=locked,
                notification_type='AUCTION_ENDED',
                title=f"Auction Ended (No Bids): {locked.title}",
                message=f"Your auction for '{locked.title}' has concluded with no bids received."
            )
            return locked

        # Check reserve price if configured
        if locked.reserve_price is not None and highest_bid.amount < locked.reserve_price:
            locked.status = AuctionStatus.RESERVE_NOT_MET
            locked.winner = None
            locked.winning_bid = None
            locked.save(update_fields=['status', 'winner', 'winning_bid', 'updated_at'])

            AuctionEvent.objects.create(
                auction=locked,
                event_type=AuctionEventType.RESERVE_NOT_MET,
                event_details={
                    'highest_bid': str(highest_bid.amount),
                    'reserve_price': str(locked.reserve_price)
                }
            )

            AuctionNotification.objects.create(
                recipient=locked.seller,
                auction=locked,
                notification_type='RESERVE_NOT_MET',
                title=f"Reserve Not Met: {locked.title}",
                message=f"The auction ended at ₹{highest_bid.amount}, which did not meet your reserve price of ₹{locked.reserve_price}."
            )

            AuctionNotification.objects.create(
                recipient=highest_bid.buyer,
                auction=locked,
                notification_type='RESERVE_NOT_MET',
                title=f"Auction Ended - Reserve Not Met: {locked.title}",
                message=f"You placed the highest bid of ₹{highest_bid.amount}, but the seller's reserve price was not met."
            )
            return locked

        # Valid winner declared!
        locked.winner = highest_bid.buyer
        locked.winning_bid = highest_bid
        locked.status = AuctionStatus.PAYMENT_PENDING
        locked.save(update_fields=['status', 'winner', 'winning_bid', 'updated_at'])

        # Update bid status to WINNING
        highest_bid.status = BidStatus.WINNING
        highest_bid.save(update_fields=['status'])

        # Create or update AuctionPayment obligation
        deadline = now + timedelta(hours=24)
        payment, created = AuctionPayment.objects.get_or_create(
            auction=locked,
            defaults={
                'winner': highest_bid.buyer,
                'amount': highest_bid.amount,
                'payment_deadline': deadline,
                'status': AuctionPayment.PaymentStatus.PENDING
            }
        )

        AuctionEvent.objects.create(
            auction=locked,
            event_type=AuctionEventType.WINNER_DECLARED,
            actor=highest_bid.buyer,
            event_details={
                'winner': highest_bid.buyer.username,
                'winning_bid': str(highest_bid.amount),
                'payment_deadline': str(deadline)
            }
        )

        # Notify Winner
        AuctionNotification.objects.create(
            recipient=highest_bid.buyer,
            auction=locked,
            notification_type='WINNER_ANNOUNCEMENT',
            title=f"🎉 You Won: {locked.title}!",
            message=f"Congratulations! You won the auction for '{locked.title}' with a bid of ₹{highest_bid.amount}. Please complete payment within 24 hours to confirm your order."
        )

        # Notify Seller
        AuctionNotification.objects.create(
            recipient=locked.seller,
            auction=locked,
            notification_type='AUCTION_ENDED',
            title=f"Auction Won: {locked.title}",
            message=f"Your auction for '{locked.title}' has ended with a winning bid of ₹{highest_bid.amount} by {highest_bid.buyer.username}. Awaiting buyer payment."
        )

        return locked

