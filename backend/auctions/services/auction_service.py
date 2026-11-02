import logging
from datetime import timedelta
from decimal import Decimal
from django.utils import timezone
from django.db import transaction
from django.core.exceptions import ValidationError
from auctions.models import Auction, AuctionStatus, AuctionEvent, AuctionEventType, Bid
from auctions.services.winner_service import close_auction_and_determine_winner

logger = logging.getLogger(__name__)


class AuctionService:
    @staticmethod
    def create_auction(seller, data) -> Auction:
        """
        Validate and create a new auction listing in DRAFT or SCHEDULED status.
        """
        starting_price = Decimal(str(data.get('starting_price', '0.00')))
        if starting_price <= Decimal('0.00'):
            raise ValidationError("Starting price must be greater than zero.")

        min_increment = Decimal(str(data.get('minimum_increment', '50.00')))
        if min_increment <= Decimal('0.00'):
            raise ValidationError("Minimum increment must be greater than zero.")

        reserve_price = data.get('reserve_price')
        if reserve_price is not None and str(reserve_price).strip():
            reserve_price = Decimal(str(reserve_price))
            if reserve_price < starting_price:
                raise ValidationError("Reserve price cannot be less than the starting price.")
        else:
            reserve_price = None

        buy_now_price = data.get('buy_now_price')
        if buy_now_price is not None and str(buy_now_price).strip():
            buy_now_price = Decimal(str(buy_now_price))
            if buy_now_price <= starting_price:
                raise ValidationError("Buy Now price must be higher than the starting price.")
        else:
            buy_now_price = None

        start_time = data.get('start_time')
        end_time = data.get('end_time')

        if not start_time or not end_time:
            raise ValidationError("Both start time and end time are required.")

        if end_time <= start_time:
            raise ValidationError("Auction end time must be after start time.")

        now = timezone.now()
        # Initial status
        publish_immediately = data.get('publish_immediately', False)
        if publish_immediately:
            if start_time <= now <= end_time:
                initial_status = AuctionStatus.LIVE
            elif start_time > now:
                initial_status = AuctionStatus.SCHEDULED
            else:
                raise ValidationError("Auction end time is already in the past.")
        else:
            initial_status = AuctionStatus.DRAFT

        with transaction.atomic():
            auction = Auction.objects.create(
                seller=seller,
                product=data.get('product'),
                title=data.get('title', 'Artisan Handcrafted Auction Piece'),
                description=data.get('description', ''),
                category=data.get('category', 'Artisanal Handicrafts'),
                image_url=data.get('image_url', ''),
                starting_price=starting_price,
                current_highest_bid=None,
                minimum_increment=min_increment,
                reserve_price=reserve_price,
                buy_now_price=buy_now_price,
                start_time=start_time,
                end_time=end_time,
                status=initial_status,
                anti_sniping_enabled=data.get('anti_sniping_enabled', True),
                anti_sniping_extension_minutes=int(data.get('anti_sniping_extension_minutes', 5))
            )

            AuctionEvent.objects.create(
                auction=auction,
                event_type=AuctionEventType.AUCTION_CREATED,
                actor=seller,
                event_details={
                    'starting_price': str(starting_price),
                    'minimum_increment': str(min_increment),
                    'status': initial_status
                }
            )

            if initial_status in [AuctionStatus.SCHEDULED, AuctionStatus.LIVE]:
                AuctionEvent.objects.create(
                    auction=auction,
                    event_type=AuctionEventType.AUCTION_PUBLISHED,
                    actor=seller,
                    event_details={'published_at': str(now)}
                )

        return auction

    @staticmethod
    def publish_auction(auction: Auction, actor) -> Auction:
        """
        Publish a DRAFT auction to SCHEDULED or LIVE.
        """
        if auction.status != AuctionStatus.DRAFT:
            raise ValidationError(f"Cannot publish auction with status {auction.status}.")

        now = timezone.now()
        if auction.end_time <= now:
            raise ValidationError("Cannot publish an auction whose end time has already elapsed.")

        with transaction.atomic():
            if auction.start_time <= now:
                auction.status = AuctionStatus.LIVE
                event_type = AuctionEventType.AUCTION_STARTED
            else:
                auction.status = AuctionStatus.SCHEDULED
                event_type = AuctionEventType.AUCTION_PUBLISHED

            auction.save(update_fields=['status', 'updated_at'])

            AuctionEvent.objects.create(
                auction=auction,
                event_type=event_type,
                actor=actor,
                event_details={'new_status': auction.status}
            )

        return auction

    @staticmethod
    def cancel_auction(auction: Auction, actor, reason: str = "") -> Auction:
        """
        Cancel an auction if no valid bids have been submitted, or if actor is admin.
        """
        with transaction.atomic():
            locked = Auction.objects.select_for_update().get(id=auction.id)

            if locked.status in [AuctionStatus.COMPLETED, AuctionStatus.AWARDED, AuctionStatus.CANCELLED]:
                raise ValidationError(f"Auction is already {locked.status} and cannot be cancelled.")

            has_bids = locked.bids.filter(status__in=['VALID', 'WINNING']).exists()
            if has_bids and not actor.is_staff:
                raise ValidationError("Cannot cancel an auction after bidding has commenced unless approved by an administrator.")

            locked.status = AuctionStatus.CANCELLED
            locked.save(update_fields=['status', 'updated_at'])

            AuctionEvent.objects.create(
                auction=locked,
                event_type=AuctionEventType.AUCTION_CANCELLED,
                actor=actor,
                event_details={'reason': reason, 'actor': actor.username}
            )

        return locked

    @staticmethod
    def evaluate_all_active_auctions() -> dict:
        """
        Idempotent background job:
        1. Activates SCHEDULED auctions whose start_time has arrived.
        2. Closes LIVE auctions whose end_time has arrived.
        """
        now = timezone.now()
        activated = 0
        closed = 0

        # 1. Activate scheduled
        scheduled_to_start = Auction.objects.filter(
            status=AuctionStatus.SCHEDULED,
            start_time__lte=now
        )
        for auc in scheduled_to_start:
            try:
                with transaction.atomic():
                    locked = Auction.objects.select_for_update().get(id=auc.id)
                    if locked.status == AuctionStatus.SCHEDULED and locked.start_time <= now:
                        locked.status = AuctionStatus.LIVE
                        locked.save(update_fields=['status', 'updated_at'])
                        AuctionEvent.objects.create(
                            auction=locked,
                            event_type=AuctionEventType.AUCTION_STARTED,
                            event_details={'auto_activated': True}
                        )
                        activated += 1
            except Exception as e:
                logger.error(f"Error activating auction {auc.id}: {e}")

        # 2. Close live auctions past end_time
        live_to_close = Auction.objects.filter(
            status=AuctionStatus.LIVE,
            end_time__lte=now
        )
        for auc in live_to_close:
            try:
                close_auction_and_determine_winner(auc)
                closed += 1
            except Exception as e:
                logger.error(f"Error closing auction {auc.id}: {e}")

        return {'activated': activated, 'closed': closed}

