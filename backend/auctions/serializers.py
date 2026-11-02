from decimal import Decimal
from rest_framework import serializers
from django.utils import timezone
from auctions.models import (
    Auction, AuctionStatus, Bid, BidStatus, AuctionWatchlist,
    AuctionEvent, AuctionPayment, AuctionOrder, AuctionNotification
)
from artisan_api.models import Product


class BidSerializer(serializers.ModelSerializer):
    bidder_display_name = serializers.SerializerMethodField()
    is_my_bid = serializers.SerializerMethodField()

    class Meta:
        model = Bid
        fields = [
            'id', 'amount', 'bid_time', 'status',
            'bidder_display_name', 'is_my_bid'
        ]

    def get_bidder_display_name(self, obj):
        request = self.context.get('request')
        user = request.user if request else None
        if user and (user == obj.buyer or user == obj.auction.seller or user.is_staff):
            return obj.buyer.username
        uname = obj.buyer.username
        if len(uname) > 2:
            return f"{uname[0]}***{uname[-1]}"
        return "Bidder"

    def get_is_my_bid(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.buyer == request.user
        return False


class AuctionListSerializer(serializers.ModelSerializer):
    minimum_next_bid = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    time_remaining_seconds = serializers.IntegerField(read_only=True)
    seller_username = serializers.CharField(source='seller.username', read_only=True)
    seller_id = serializers.IntegerField(source='seller.id', read_only=True)
    is_watched = serializers.SerializerMethodField()
    is_my_auction = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()

    class Meta:
        model = Auction
        fields = [
            'id', 'title', 'category', 'image_url', 'images', 'starting_price',
            'current_highest_bid', 'minimum_next_bid', 'minimum_increment',
            'buy_now_price', 'status', 'start_time', 'end_time',
            'time_remaining_seconds', 'total_bids', 'seller_username', 'seller_id',
            'is_watched', 'is_my_auction', 'created_at'
        ]

    def get_images(self, obj):
        if not obj.image_url:
            return []
        try:
            import json
            if obj.image_url.startswith('[') and obj.image_url.endswith(']'):
                parsed = json.loads(obj.image_url)
                if isinstance(parsed, list):
                    return parsed
        except Exception:
            pass
        return [obj.image_url]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        images = self.get_images(instance)
        data['images'] = images
        primary = images[0] if images else ''
        data['image_url'] = primary
        data['product_image'] = primary
        return data

    def get_is_watched(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return AuctionWatchlist.objects.filter(buyer=request.user, auction=obj).exists()
        return False

    def get_is_my_auction(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.seller == request.user
        return False


class AuctionDetailSerializer(serializers.ModelSerializer):
    minimum_next_bid = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    time_remaining_seconds = serializers.IntegerField(read_only=True)
    seller_username = serializers.CharField(source='seller.username', read_only=True)
    seller_id = serializers.IntegerField(source='seller.id', read_only=True)
    seller = serializers.SerializerMethodField()
    winner_username = serializers.SerializerMethodField()
    has_reserve_price = serializers.SerializerMethodField()
    reserve_met = serializers.SerializerMethodField()
    is_watched = serializers.SerializerMethodField()
    is_my_auction = serializers.SerializerMethodField()
    bids = serializers.SerializerMethodField()
    server_time = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()

    class Meta:
        model = Auction
        fields = [
            'id', 'title', 'description', 'category', 'image_url', 'images',
            'starting_price', 'current_highest_bid', 'minimum_next_bid',
            'minimum_increment', 'buy_now_price', 'has_reserve_price', 'reserve_met',
            'start_time', 'end_time', 'time_remaining_seconds', 'status',
            'total_bids', 'anti_sniping_enabled', 'anti_sniping_extension_minutes',
            'extensions_count', 'seller_username', 'seller_id', 'seller', 'winner_username',
            'is_watched', 'is_my_auction', 'bids', 'server_time',
            'created_at', 'updated_at'
        ]

    def get_seller(self, obj):
        artisan_profile = getattr(obj.seller, 'artisanprofile', None)
        return {
            'id': obj.seller.id,
            'username': obj.seller.username,
            'artisan_name': getattr(artisan_profile, 'business_name', obj.seller.username) if artisan_profile else obj.seller.username
        }

    def get_images(self, obj):
        if not obj.image_url:
            return []
        try:
            import json
            if obj.image_url.startswith('[') and obj.image_url.endswith(']'):
                parsed = json.loads(obj.image_url)
                if isinstance(parsed, list):
                    return parsed
        except Exception:
            pass
        return [obj.image_url]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        images = self.get_images(instance)
        data['images'] = images
        primary = images[0] if images else ''
        data['image_url'] = primary
        data['product_image'] = primary
        return data

    def get_server_time(self, obj):
        return timezone.now()

    def get_has_reserve_price(self, obj):
        return obj.reserve_price is not None

    def get_reserve_met(self, obj):
        if obj.reserve_price is None:
            return True
        if obj.current_highest_bid is None:
            return False
        return obj.current_highest_bid >= obj.reserve_price

    def get_winner_username(self, obj):
        if obj.winner:
            request = self.context.get('request')
            if request and (request.user == obj.winner or request.user == obj.seller or request.user.is_staff):
                return obj.winner.username
            uname = obj.winner.username
            return f"{uname[0]}***{uname[-1]}" if len(uname) > 2 else "Winner"
        return None

    def get_is_watched(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return AuctionWatchlist.objects.filter(buyer=request.user, auction=obj).exists()
        return False

    def get_is_my_auction(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.seller == request.user
        return False

    def get_bids(self, obj):
        bids_qs = obj.bids.filter(status__in=[BidStatus.VALID, BidStatus.WINNING, BidStatus.OUTBID]).order_by('-bid_time')[:30]
        return BidSerializer(bids_qs, many=True, context=self.context).data


class AuctionCreateSerializer(serializers.ModelSerializer):
    publish_immediately = serializers.BooleanField(default=True, write_only=True)
    product_id = serializers.CharField(required=False, allow_blank=True, allow_null=True, write_only=True)
    catalog_link = serializers.CharField(required=False, allow_blank=True, allow_null=True, write_only=True)
    images = serializers.ListField(child=serializers.CharField(), required=False, allow_empty=True, write_only=True)
    min_bid_increment = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True, write_only=True)
    minimum_increment = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, default=Decimal('50.00'))
    reserve_price = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
    buy_now_price = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
    start_time = serializers.DateTimeField(required=False, allow_null=True)
    end_time = serializers.DateTimeField(required=False, allow_null=True)

    class Meta:
        model = Auction
        fields = [
            'id', 'title', 'description', 'category', 'image_url', 'images', 'catalog_link',
            'starting_price', 'minimum_increment', 'min_bid_increment', 'reserve_price',
            'buy_now_price', 'start_time', 'end_time', 'anti_sniping_enabled',
            'anti_sniping_extension_minutes', 'publish_immediately', 'product_id'
        ]

    def validate(self, attrs):
        import json
        from django.utils import timezone
        from datetime import timedelta

        # 0. Handle multiple images
        images = attrs.pop('images', None)
        if images and isinstance(images, list) and len(images) > 0:
            attrs['image_url'] = json.dumps(images)

        # 1. Product mapping
        product_id = attrs.pop('product_id', None)
        if product_id:
            try:
                from artisan_api.models import Product
                prod = Product.objects.filter(id=product_id).first()
                if prod:
                    attrs['product'] = prod
            except Exception:
                pass

        # 1b. Catalog link (if provided, append cleanly or save)
        catalog_link = attrs.pop('catalog_link', None)
        if catalog_link and catalog_link.strip():
            desc = attrs.get('description', '')
            if catalog_link not in desc:
                attrs['description'] = f"{desc}\n\nCatalog Reference: {catalog_link.strip()}".strip()

        # 2. Minimum increment alias
        min_inc = attrs.pop('min_bid_increment', None)
        if min_inc is not None and ('minimum_increment' not in attrs or attrs['minimum_increment'] is None):
            attrs['minimum_increment'] = min_inc
        elif 'minimum_increment' not in attrs or attrs['minimum_increment'] is None:
            attrs['minimum_increment'] = Decimal('50.00')

        # 3. Starting price
        starting_price = attrs.get('starting_price')
        if starting_price is not None and starting_price <= Decimal('0.00'):
            raise serializers.ValidationError({"starting_price": "Starting price must be greater than zero."})

        min_increment = attrs.get('minimum_increment', Decimal('50.00'))
        if min_increment <= Decimal('0.00'):
            raise serializers.ValidationError({"minimum_increment": "Minimum increment must be greater than zero."})

        # 4. Reserve & Buy Now
        reserve_price = attrs.get('reserve_price')
        if reserve_price is not None and starting_price is not None and reserve_price < starting_price:
            raise serializers.ValidationError({"reserve_price": "Reserve price cannot be lower than starting price."})

        buy_now_price = attrs.get('buy_now_price')
        if buy_now_price is not None and starting_price is not None and buy_now_price <= starting_price:
            raise serializers.ValidationError({"buy_now_price": "Buy Now price must be higher than starting price."})

        # 5. Times default
        now = timezone.now()
        start_time = attrs.get('start_time') or now
        end_time = attrs.get('end_time')
        if not end_time:
            end_time = start_time + timedelta(hours=24)

        if end_time <= start_time:
            raise serializers.ValidationError({"end_time": "Auction end time must be after start time."})

        attrs['start_time'] = start_time
        attrs['end_time'] = end_time

        return attrs


class PlaceBidSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    idempotency_key = serializers.CharField(max_length=120, required=False, allow_blank=True)


class AuctionPaymentSerializer(serializers.ModelSerializer):
    auction_title = serializers.CharField(source='auction.title', read_only=True)
    winner_username = serializers.CharField(source='winner.username', read_only=True)

    class Meta:
        model = AuctionPayment
        fields = [
            'id', 'auction', 'auction_title', 'winner_username', 'amount',
            'payment_gateway_ref', 'payment_provider', 'status',
            'payment_deadline', 'paid_at', 'created_at'
        ]


class AuctionOrderSerializer(serializers.ModelSerializer):
    auction_title = serializers.CharField(source='auction.title', read_only=True)
    seller_username = serializers.CharField(source='seller.username', read_only=True)
    buyer_username = serializers.CharField(source='winning_buyer.username', read_only=True)

    class Meta:
        model = AuctionOrder
        fields = [
            'id', 'auction', 'auction_title', 'seller_username', 'buyer_username',
            'final_amount', 'order_status', 'shipping_address', 'tracking_number',
            'created_at', 'updated_at'
        ]


class AuctionNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuctionNotification
        fields = [
            'id', 'notification_type', 'title', 'message',
            'is_read', 'created_at', 'auction'
        ]

