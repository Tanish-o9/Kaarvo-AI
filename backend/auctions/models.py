import uuid
from decimal import Decimal
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from artisan_api.models import Product


class AuctionStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft'
    PENDING_APPROVAL = 'PENDING_APPROVAL', 'Pending Approval'
    SCHEDULED = 'SCHEDULED', 'Scheduled'
    LIVE = 'LIVE', 'Live'
    ENDED = 'ENDED', 'Ended'
    RESERVE_NOT_MET = 'RESERVE_NOT_MET', 'Reserve Price Not Met'
    PAYMENT_PENDING = 'PAYMENT_PENDING', 'Payment Pending'
    PAYMENT_EXPIRED = 'PAYMENT_EXPIRED', 'Payment Expired'
    AWARDED = 'AWARDED', 'Awarded'
    COMPLETED = 'COMPLETED', 'Completed'
    CANCELLED = 'CANCELLED', 'Cancelled'


class BidStatus(models.TextChoices):
    VALID = 'VALID', 'Valid'
    OUTBID = 'OUTBID', 'Outbid'
    WINNING = 'WINNING', 'Winning'
    REJECTED = 'REJECTED', 'Rejected'
    CANCELLED = 'CANCELLED', 'Cancelled'


class AuctionEventType(models.TextChoices):
    AUCTION_CREATED = 'AUCTION_CREATED', 'Auction Created'
    AUCTION_PUBLISHED = 'AUCTION_PUBLISHED', 'Auction Published'
    AUCTION_STARTED = 'AUCTION_STARTED', 'Auction Started'
    BID_PLACED = 'BID_PLACED', 'Bid Placed'
    OUTBID = 'OUTBID', 'Bidder Outbid'
    ANTI_SNIPING_EXTENDED = 'ANTI_SNIPING_EXTENDED', 'Anti-Sniping Deadline Extended'
    AUCTION_ENDED = 'AUCTION_ENDED', 'Auction Ended'
    WINNER_DECLARED = 'WINNER_DECLARED', 'Winner Declared'
    RESERVE_NOT_MET = 'RESERVE_NOT_MET', 'Reserve Price Not Met'
    BUY_NOW_TRIGGERED = 'BUY_NOW_TRIGGERED', 'Buy Now Triggered'
    PAYMENT_CREATED = 'PAYMENT_CREATED', 'Payment Created'
    PAYMENT_COMPLETED = 'PAYMENT_COMPLETED', 'Payment Completed'
    PAYMENT_EXPIRED = 'PAYMENT_EXPIRED', 'Payment Expired'
    AUCTION_CANCELLED = 'AUCTION_CANCELLED', 'Auction Cancelled'


class Auction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name='auctions')
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='auctions')
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, default='Artisanal Handicrafts')
    image_url = models.TextField(blank=True)
    
    # Financial rules (Decimal only, strictly no floating-point values)
    starting_price = models.DecimalField(max_digits=12, decimal_places=2)
    current_highest_bid = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    minimum_increment = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('50.00'))
    reserve_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    buy_now_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    # Scheduling & Status
    start_time = models.DateTimeField(db_index=True)
    end_time = models.DateTimeField(db_index=True)
    status = models.CharField(max_length=30, choices=AuctionStatus.choices, default=AuctionStatus.DRAFT, db_index=True)
    
    # Result
    winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='won_auctions')
    winning_bid = models.ForeignKey('Bid', on_delete=models.SET_NULL, null=True, blank=True, related_name='won_auction_record')
    
    # Anti-sniping protection: if a valid bid arrives in the last 2 minutes, extend deadline by 5 minutes
    anti_sniping_enabled = models.BooleanField(default=True)
    anti_sniping_extension_minutes = models.IntegerField(default=5)
    extensions_count = models.IntegerField(default=0)
    total_bids = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'end_time']),
            models.Index(fields=['seller', 'status']),
        ]

    def __str__(self):
        return f"{self.title} ({self.status}) - High: ₹{self.current_highest_bid or self.starting_price}"

    @property
    def minimum_next_bid(self) -> Decimal:
        """Calculate minimum valid next bid."""
        if self.current_highest_bid is not None and self.current_highest_bid > Decimal('0.00'):
            return self.current_highest_bid + self.minimum_increment
        return self.starting_price

    @property
    def is_active(self) -> bool:
        now = timezone.now()
        return self.status == AuctionStatus.LIVE and self.start_time <= now <= self.end_time

    @property
    def time_remaining_seconds(self) -> int:
        now = timezone.now()
        if now >= self.end_time:
            return 0
        return int((self.end_time - now).total_seconds())


class Bid(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    auction = models.ForeignKey(Auction, on_delete=models.CASCADE, related_name='bids')
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bids')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    bid_time = models.DateTimeField(auto_now_add=True, db_index=True)
    status = models.CharField(max_length=20, choices=BidStatus.choices, default=BidStatus.VALID)
    idempotency_key = models.CharField(max_length=120, null=True, blank=True, unique=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        ordering = ['-amount', '-bid_time']
        indexes = [
            models.Index(fields=['auction', '-amount']),
            models.Index(fields=['buyer', '-bid_time']),
        ]

    def __str__(self):
        return f"₹{self.amount} by {self.buyer.username} on {self.auction.title}"


class AuctionWatchlist(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='auction_watchlist')
    auction = models.ForeignKey(Auction, on_delete=models.CASCADE, related_name='watchlist_entries')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('buyer', 'auction')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.buyer.username} watching {self.auction.title}"


class AuctionEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    auction = models.ForeignKey(Auction, on_delete=models.CASCADE, related_name='events')
    event_type = models.CharField(max_length=50, choices=AuctionEventType.choices)
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    event_details = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}] {self.event_type} on {self.auction.title}"


class AuctionPayment(models.Model):
    class PaymentStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        SUCCESS = 'SUCCESS', 'Success'
        FAILED = 'FAILED', 'Failed'
        EXPIRED = 'EXPIRED', 'Expired'
        REFUNDED = 'REFUNDED', 'Refunded'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    auction = models.OneToOneField(Auction, on_delete=models.CASCADE, related_name='payment_record')
    winner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='auction_payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_gateway_ref = models.CharField(max_length=120, blank=True)
    payment_provider = models.CharField(max_length=50, default='razorpay_mock')
    status = models.CharField(max_length=30, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    payment_deadline = models.DateTimeField()
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self) -> bool:
        return self.status == self.PaymentStatus.PENDING and timezone.now() > self.payment_deadline

    def __str__(self):
        return f"Payment ₹{self.amount} for {self.auction.title} - {self.status}"


class AuctionOrder(models.Model):
    class OrderStatus(models.TextChoices):
        PAYMENT_PENDING = 'PAYMENT_PENDING', 'Payment Pending'
        PROCESSING = 'PROCESSING', 'Processing'
        SHIPPED = 'SHIPPED', 'Shipped'
        DELIVERED = 'DELIVERED', 'Delivered'
        CANCELLED = 'CANCELLED', 'Cancelled'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    auction = models.OneToOneField(Auction, on_delete=models.CASCADE, related_name='auction_order')
    winning_buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='auction_orders')
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='seller_auction_orders')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    final_amount = models.DecimalField(max_digits=12, decimal_places=2)
    order_status = models.CharField(max_length=30, choices=OrderStatus.choices, default=OrderStatus.PROCESSING)
    shipping_address = models.TextField()
    tracking_number = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{str(self.id)[:8]} - {self.auction.title} (₹{self.final_amount})"


class AuctionNotification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='auction_notifications')
    auction = models.ForeignKey(Auction, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    notification_type = models.CharField(max_length=50)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.recipient.username}: {self.title}"

