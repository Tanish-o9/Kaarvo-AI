from django.contrib import admin
from .models import (
    Auction, Bid, AuctionWatchlist, AuctionEvent,
    AuctionPayment, AuctionOrder, AuctionNotification
)


class BidInline(admin.TabularInline):
    model = Bid
    extra = 0
    readonly_fields = ('buyer', 'amount', 'bid_time', 'status', 'idempotency_key', 'ip_address')
    can_delete = False


class AuctionEventInline(admin.TabularInline):
    model = AuctionEvent
    extra = 0
    readonly_fields = ('event_type', 'actor', 'event_details', 'timestamp')
    can_delete = False


@admin.register(Auction)
class AuctionAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'seller', 'status', 'starting_price',
        'current_highest_bid', 'winner', 'start_time', 'end_time', 'total_bids'
    )
    list_filter = ('status', 'category', 'anti_sniping_enabled', 'created_at')
    search_fields = ('title', 'description', 'seller__username', 'winner__username')
    readonly_fields = ('total_bids', 'extensions_count', 'created_at', 'updated_at')
    inlines = [BidInline, AuctionEventInline]
    actions = ['activate_selected_auctions', 'cancel_selected_auctions']

    @admin.action(description="Force-activate selected auctions (set LIVE)")
    def activate_selected_auctions(self, request, queryset):
        queryset.update(status='LIVE')

    @admin.action(description="Cancel selected auctions")
    def cancel_selected_auctions(self, request, queryset):
        queryset.update(status='CANCELLED')


@admin.register(Bid)
class BidAdmin(admin.ModelAdmin):
    list_display = ('auction', 'buyer', 'amount', 'bid_time', 'status', 'idempotency_key')
    list_filter = ('status', 'bid_time')
    search_fields = ('auction__title', 'buyer__username', 'idempotency_key')
    readonly_fields = ('id', 'auction', 'buyer', 'amount', 'bid_time', 'status', 'idempotency_key', 'ip_address')


@admin.register(AuctionWatchlist)
class AuctionWatchlistAdmin(admin.ModelAdmin):
    list_display = ('buyer', 'auction', 'created_at')
    search_fields = ('buyer__username', 'auction__title')


@admin.register(AuctionEvent)
class AuctionEventAdmin(admin.ModelAdmin):
    list_display = ('auction', 'event_type', 'actor', 'timestamp')
    list_filter = ('event_type', 'timestamp')
    search_fields = ('auction__title', 'actor__username', 'event_type')
    readonly_fields = ('id', 'auction', 'event_type', 'actor', 'event_details', 'timestamp')


@admin.register(AuctionPayment)
class AuctionPaymentAdmin(admin.ModelAdmin):
    list_display = ('auction', 'winner', 'amount', 'status', 'payment_deadline', 'paid_at')
    list_filter = ('status', 'payment_provider')
    search_fields = ('auction__title', 'winner__username', 'payment_gateway_ref')


@admin.register(AuctionOrder)
class AuctionOrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'auction', 'winning_buyer', 'seller', 'final_amount', 'order_status', 'created_at')
    list_filter = ('order_status', 'created_at')
    search_fields = ('auction__title', 'winning_buyer__username', 'seller__username', 'tracking_number')


@admin.register(AuctionNotification)
class AuctionNotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'notification_type', 'title', 'is_read', 'created_at')
    list_filter = ('is_read', 'notification_type', 'created_at')
    search_fields = ('recipient__username', 'title', 'message')

