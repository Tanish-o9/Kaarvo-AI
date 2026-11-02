import hmac
import hashlib
import logging
from decimal import Decimal
from django.utils import timezone
from django.db import transaction
from django.core.exceptions import ValidationError
from auctions.models import (
    Auction, AuctionStatus, AuctionPayment, AuctionOrder,
    AuctionEvent, AuctionEventType, AuctionNotification
)

logger = logging.getLogger(__name__)


class AuctionPaymentService:
    @staticmethod
    def process_winner_payment(auction_id, user, gateway_ref: str, payment_provider: str = 'razorpay_mock', shipping_address: str = "") -> AuctionPayment:
        """
        Verify and process winner payment.
        Creates an AuctionOrder and transitions auction to COMPLETED.
        """
        with transaction.atomic():
            auction = Auction.objects.select_for_update().get(id=auction_id)

            if auction.winner != user and not user.is_staff:
                raise ValidationError("Only the winning buyer can submit payment for this auction.")

            if auction.status not in [AuctionStatus.PAYMENT_PENDING, AuctionStatus.AWARDED]:
                raise ValidationError(f"Cannot process payment for auction with status {auction.status}.")

            payment = AuctionPayment.objects.select_for_update().filter(auction=auction).first()
            if not payment:
                raise ValidationError("No pending payment record found for this auction.")

            if payment.status == AuctionPayment.PaymentStatus.SUCCESS:
                logger.info(f"Idempotent payment re-submission for auction {auction.id}")
                return payment

            now = timezone.now()
            if now > payment.payment_deadline:
                payment.status = AuctionPayment.PaymentStatus.EXPIRED
                payment.save(update_fields=['status'])
                auction.status = AuctionStatus.PAYMENT_EXPIRED
                auction.save(update_fields=['status', 'updated_at'])
                raise ValidationError("The payment deadline for this auction has expired.")

            # Record success
            payment.status = AuctionPayment.PaymentStatus.SUCCESS
            payment.payment_gateway_ref = gateway_ref or f"MOCK-PAY-{str(auction.id)[:8].upper()}"
            payment.payment_provider = payment_provider
            payment.paid_at = now
            payment.save(update_fields=['status', 'payment_gateway_ref', 'payment_provider', 'paid_at'])

            auction.status = AuctionStatus.COMPLETED
            auction.save(update_fields=['status', 'updated_at'])

            # Create AuctionOrder
            order, created = AuctionOrder.objects.get_or_create(
                auction=auction,
                defaults={
                    'winning_buyer': user,
                    'seller': auction.seller,
                    'product': auction.product,
                    'final_amount': payment.amount,
                    'order_status': AuctionOrder.OrderStatus.PROCESSING,
                    'shipping_address': shipping_address or "Standard Shipping Address on File"
                }
            )

            AuctionEvent.objects.create(
                auction=auction,
                event_type=AuctionEventType.PAYMENT_COMPLETED,
                actor=user,
                event_details={
                    'gateway_ref': payment.payment_gateway_ref,
                    'amount': str(payment.amount),
                    'order_id': str(order.id)
                }
            )

            # Notifications
            AuctionNotification.objects.create(
                recipient=user,
                auction=auction,
                notification_type='PAYMENT_SUCCESS',
                title=f"Payment Confirmed for {auction.title}",
                message=f"Your payment of ₹{payment.amount} has been verified! Order #{str(order.id)[:8]} is being processed by the artisan."
            )

            AuctionNotification.objects.create(
                recipient=auction.seller,
                auction=auction,
                notification_type='PAYMENT_SUCCESS',
                title=f"Payment Received: {auction.title}",
                message=f"Winner {user.username} has paid ₹{payment.amount} for '{auction.title}'. Please prepare and ship the item."
            )

            return payment

    @staticmethod
    def expire_overdue_payments() -> int:
        """
        Background maintenance job: identify expired payments and notify parties.
        """
        now = timezone.now()
        overdue_payments = AuctionPayment.objects.filter(
            status=AuctionPayment.PaymentStatus.PENDING,
            payment_deadline__lt=now
        ).select_related('auction', 'winner')

        expired_count = 0
        for pay in overdue_payments:
            try:
                with transaction.atomic():
                    p_locked = AuctionPayment.objects.select_for_update().get(id=pay.id)
                    if p_locked.status == AuctionPayment.PaymentStatus.PENDING and p_locked.payment_deadline < now:
                        p_locked.status = AuctionPayment.PaymentStatus.EXPIRED
                        p_locked.save(update_fields=['status'])

                        auc = p_locked.auction
                        auc.status = AuctionStatus.PAYMENT_EXPIRED
                        auc.save(update_fields=['status', 'updated_at'])

                        AuctionEvent.objects.create(
                            auction=auc,
                            event_type=AuctionEventType.PAYMENT_EXPIRED,
                            actor=p_locked.winner,
                            event_details={'deadline': str(p_locked.payment_deadline)}
                        )

                        AuctionNotification.objects.create(
                            recipient=p_locked.winner,
                            auction=auc,
                            notification_type='PAYMENT_EXPIRED',
                            title=f"Payment Deadline Expired: {auc.title}",
                            message=f"The 24-hour payment deadline for '{auc.title}' has expired. Your win has been forfeited."
                        )

                        AuctionNotification.objects.create(
                            recipient=auc.seller,
                            auction=auc,
                            notification_type='PAYMENT_EXPIRED',
                            title=f"Buyer Payment Expired: {auc.title}",
                            message=f"Winner {p_locked.winner.username} did not complete payment in time. You may relist this item."
                        )
                        expired_count += 1
            except Exception as e:
                logger.error(f"Error expiring payment {pay.id}: {e}")

        return expired_count

