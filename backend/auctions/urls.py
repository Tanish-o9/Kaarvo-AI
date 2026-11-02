from django.urls import path
from .views import (
    AuctionListCreateView, AuctionDetailView, AuctionPublishView, AuctionCancelView,
    AuctionBidsView, MyBidsView, AuctionWatchlistView, MyAuctionsView,
    MyWonAuctionsView, AuctionPaymentCheckoutView, AuctionNotificationsView,
    AuctionNotificationMarkReadView
)

urlpatterns = [
    # Core Auction endpoints
    path('auctions/', AuctionListCreateView.as_view(), name='auction-list-create'),
    path('auctions', AuctionListCreateView.as_view(), name='auction-list-create-noslash'),
    path('auctions/<uuid:pk>/', AuctionDetailView.as_view(), name='auction-detail'),
    path('auctions/<uuid:pk>', AuctionDetailView.as_view(), name='auction-detail-noslash'),
    path('auctions/<uuid:pk>/publish/', AuctionPublishView.as_view(), name='auction-publish'),
    path('auctions/<uuid:pk>/publish', AuctionPublishView.as_view(), name='auction-publish-noslash'),
    path('auctions/<uuid:pk>/cancel/', AuctionCancelView.as_view(), name='auction-cancel'),
    path('auctions/<uuid:pk>/cancel', AuctionCancelView.as_view(), name='auction-cancel-noslash'),
    
    # Bidding
    path('auctions/<uuid:pk>/bids/', AuctionBidsView.as_view(), name='auction-bids'),
    path('auctions/<uuid:pk>/bids', AuctionBidsView.as_view(), name='auction-bids-noslash'),
    path('my-bids/', MyBidsView.as_view(), name='my-bids'),
    path('my-bids', MyBidsView.as_view(), name='my-bids-noslash'),

    # Watchlist
    path('auction-watchlist/', AuctionWatchlistView.as_view(), name='auction-watchlist'),
    path('auction-watchlist', AuctionWatchlistView.as_view(), name='auction-watchlist-noslash'),
    path('auctions/<uuid:pk>/watchlist/', AuctionWatchlistView.as_view(), name='auction-watchlist-toggle'),
    path('auctions/<uuid:pk>/watchlist', AuctionWatchlistView.as_view(), name='auction-watchlist-toggle-noslash'),

    # Dashboard & Outcome
    path('my-auctions/', MyAuctionsView.as_view(), name='my-auctions'),
    path('my-auctions', MyAuctionsView.as_view(), name='my-auctions-noslash'),
    path('my-won-auctions/', MyWonAuctionsView.as_view(), name='my-won-auctions'),
    path('my-won-auctions', MyWonAuctionsView.as_view(), name='my-won-auctions-noslash'),
    path('auctions/<uuid:pk>/pay/', AuctionPaymentCheckoutView.as_view(), name='auction-pay'),
    path('auctions/<uuid:pk>/pay', AuctionPaymentCheckoutView.as_view(), name='auction-pay-noslash'),

    # Notifications
    path('auction-notifications/', AuctionNotificationsView.as_view(), name='auction-notifications'),
    path('auction-notifications', AuctionNotificationsView.as_view(), name='auction-notifications-noslash'),
    path('auction-notifications/<uuid:pk>/read/', AuctionNotificationMarkReadView.as_view(), name='auction-notification-read'),
    path('auction-notifications/<uuid:pk>/read', AuctionNotificationMarkReadView.as_view(), name='auction-notification-read-noslash'),
]

