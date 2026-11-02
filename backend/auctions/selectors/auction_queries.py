from decimal import Decimal
from django.utils import timezone
from django.db.models import Q, Max, Count
from auctions.models import Auction, AuctionStatus, Bid, AuctionWatchlist, AuctionPayment, AuctionOrder


class AuctionSelectors:
    @staticmethod
    def get_public_auctions(query_params: dict = None):
        """
        Return queryset of visible auctions (LIVE, SCHEDULED, and recently ENDED).
        Supports search, category filtering, price filtering, and custom sorting.
        """
        now = timezone.now()
        qs = Auction.objects.select_related('seller', 'product', 'winner')

        if not query_params:
            return qs.filter(status__in=[AuctionStatus.LIVE, AuctionStatus.SCHEDULED, AuctionStatus.ENDED, AuctionStatus.PAYMENT_PENDING])

        # Status filter
        status = query_params.get('status')
        if status:
            qs = qs.filter(status=status.upper())
        else:
            # By default show LIVE first, or public statuses
            status_filter = query_params.get('include_ended', 'true').lower() == 'true'
            if status_filter:
                qs = qs.filter(status__in=[
                    AuctionStatus.LIVE, AuctionStatus.SCHEDULED,
                    AuctionStatus.ENDED, AuctionStatus.PAYMENT_PENDING,
                    AuctionStatus.COMPLETED
                ])
            else:
                qs = qs.filter(status=AuctionStatus.LIVE)

        # Search term
        search = query_params.get('search')
        if search:
            qs = qs.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(category__icontains=search) |
                Q(seller__username__icontains=search)
            )

        # Category
        category = query_params.get('category')
        if category and category.lower() != 'all':
            qs = qs.filter(category__iexact=category)

        # Price range
        min_price = query_params.get('min_price')
        if min_price:
            try:
                qs = qs.filter(
                    Q(current_highest_bid__gte=Decimal(min_price)) |
                    (Q(current_highest_bid__isnull=True) & Q(starting_price__gte=Decimal(min_price)))
                )
            except Exception:
                pass

        max_price = query_params.get('max_price')
        if max_price:
            try:
                qs = qs.filter(
                    Q(current_highest_bid__lte=Decimal(max_price)) |
                    (Q(current_highest_bid__isnull=True) & Q(starting_price__lte=Decimal(max_price)))
                )
            except Exception:
                pass

        # Ending soon filter
        ending_soon = query_params.get('ending_soon', '').lower() == 'true'
        if ending_soon:
            qs = qs.filter(status=AuctionStatus.LIVE).order_by('end_time')
            return qs

        # Sorting
        sort_by = query_params.get('sort_by', 'ending_soon')
        if sort_by == 'ending_soon':
            qs = qs.order_by('end_time')
        elif sort_by == 'newest':
            qs = qs.order_by('-created_at')
        elif sort_by == 'price_low':
            qs = qs.order_by('starting_price')
        elif sort_by == 'price_high':
            qs = qs.order_by('-current_highest_bid', '-starting_price')
        elif sort_by == 'most_bids':
            qs = qs.order_by('-total_bids', '-created_at')
        else:
            qs = qs.order_by('-created_at')

        return qs

    @staticmethod
    def get_seller_auctions(seller_user):
        """All auctions created by this seller."""
        return Auction.objects.filter(seller=seller_user).select_related('winner', 'product').order_by('-created_at')

    @staticmethod
    def get_buyer_bids(buyer_user):
        """All bids placed by this buyer."""
        return Bid.objects.filter(buyer=buyer_user).select_related('auction', 'auction__seller').order_by('-bid_time')

    @staticmethod
    def get_buyer_won_auctions(buyer_user):
        """All auctions won by this buyer with payment status."""
        return Auction.objects.filter(winner=buyer_user).select_related('seller', 'payment_record', 'auction_order').order_by('-end_time')

    @staticmethod
    def get_watchlist(buyer_user):
        """User's watchlisted auctions."""
        return AuctionWatchlist.objects.filter(buyer=buyer_user).select_related('auction', 'auction__seller').order_by('-created_at')

    @staticmethod
    def get_auction_bid_history(auction: Auction, requesting_user=None):
        """
        Return public bid history with anonymized usernames unless requesting user is seller or the bidder.
        """
        bids = auction.bids.filter(status__in=['VALID', 'WINNING', 'OUTBID']).select_related('buyer').order_by('-bid_time')
        results = []
        for b in bids:
            # Mask username for public privacy
            if requesting_user and (requesting_user == b.buyer or requesting_user == auction.seller or requesting_user.is_staff):
                display_name = b.buyer.username
            else:
                uname = b.buyer.username
                if len(uname) > 2:
                    display_name = f"{uname[0]}***{uname[-1]}"
                else:
                    display_name = "Bidder"

            results.append({
                'id': str(b.id),
                'amount': b.amount,
                'bid_time': b.bid_time,
                'status': b.status,
                'bidder_display_name': display_name,
                'is_my_bid': bool(requesting_user and requesting_user == b.buyer)
            })
        return results

