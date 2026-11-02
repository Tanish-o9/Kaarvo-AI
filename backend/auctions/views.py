from decimal import Decimal
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from auctions.models import (
    Auction, AuctionStatus, Bid, AuctionWatchlist,
    AuctionPayment, AuctionOrder, AuctionNotification
)
from auctions.serializers import (
    AuctionListSerializer, AuctionDetailSerializer, AuctionCreateSerializer,
    PlaceBidSerializer, BidSerializer, AuctionPaymentSerializer,
    AuctionOrderSerializer, AuctionNotificationSerializer
)
from auctions.selectors import AuctionSelectors
from auctions.services import (
    AuctionService, BiddingService, AuctionPaymentService,
    close_auction_and_determine_winner
)
from auctions.permissions import IsSellerOrReadOnly, IsAuthenticatedBuyer
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed


class SafeJWTAuthentication(JWTAuthentication):
    """
    JWT Authentication that doesn't abort public read requests with 401
    when an expired or invalid token is supplied.
    """
    def authenticate(self, request):
        try:
            return super().authenticate(request)
        except (InvalidToken, AuthenticationFailed):
            if request.method in permissions.SAFE_METHODS:
                return None
            raise


class AuctionListCreateView(APIView):
    """
    GET /api/v1/auctions/ - List visible public auctions with filters
    POST /api/v1/auctions/ - Create a new auction listing (Authenticated)
    """
    authentication_classes = [SafeJWTAuthentication]

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get(self, request):
        # Auto-evaluate any scheduled/live auctions that need lifecycle transition
        AuctionService.evaluate_all_active_auctions()
        auctions = AuctionSelectors.get_public_auctions(request.query_params)
        serializer = AuctionListSerializer(auctions, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = AuctionCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            auction = AuctionService.create_auction(seller=request.user, data=serializer.validated_data)
            out_serializer = AuctionDetailSerializer(auction, context={'request': request})
            return Response(out_serializer.data, status=status.HTTP_201_CREATED)
        except DjangoValidationError as e:
            return Response({'detail': e.messages if hasattr(e, 'messages') else str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class AuctionDetailView(APIView):
    """
    GET /api/v1/auctions/{id}/ - Retrieve auction details
    PATCH /api/v1/auctions/{id}/ - Modify pre-bidding auction (Seller only)
    """
    authentication_classes = [SafeJWTAuthentication]

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsSellerOrReadOnly()]

    def get(self, request, pk):
        auction = get_object_or_404(Auction.objects.select_related('seller', 'product', 'winner'), id=pk)
        # Check if active status needs evaluation
        AuctionService.evaluate_all_active_auctions()
        auction.refresh_from_db()
        serializer = AuctionDetailSerializer(auction, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        auction = get_object_or_404(Auction, id=pk)
        self.check_object_permissions(request, auction)

        if auction.bids.exists():
            return Response(
                {'detail': 'Auction rules or pricing cannot be modified once bidding has started.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        allowed_fields = ['title', 'description', 'category', 'image_url', 'starting_price', 'minimum_increment', 'reserve_price', 'buy_now_price', 'end_time']
        for field in allowed_fields:
            if field in request.data:
                val = request.data[field]
                if field in ['starting_price', 'minimum_increment', 'reserve_price', 'buy_now_price'] and val is not None:
                    setattr(auction, field, Decimal(str(val)))
                else:
                    setattr(auction, field, val)

        auction.save()
        serializer = AuctionDetailSerializer(auction, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        auction = get_object_or_404(Auction, id=pk)
        self.check_object_permissions(request, auction)

        # Strictly enforce that only the seller who listed this auction (or staff) can delete it
        if auction.seller != request.user and not request.user.is_staff:
            return Response(
                {'detail': 'Permission denied: Only the seller who created this auction can delete it.'},
                status=status.HTTP_403_FORBIDDEN
            )

        title = auction.title
        auction.delete()
        return Response(
            {'detail': f"Auction '{title}' deleted successfully.", 'deleted_id': str(pk)},
            status=status.HTTP_200_OK
        )


class AuctionPublishView(APIView):
    """
    POST /api/v1/auctions/{id}/publish/ - Transition DRAFT to SCHEDULED or LIVE (Seller only)
    """
    permission_classes = [permissions.IsAuthenticated, IsSellerOrReadOnly]

    def post(self, request, pk):
        auction = get_object_or_404(Auction, id=pk)
        self.check_object_permissions(request, auction)
        try:
            published = AuctionService.publish_auction(auction, actor=request.user)
            serializer = AuctionDetailSerializer(published, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({'detail': e.messages if hasattr(e, 'messages') else str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class AuctionCancelView(APIView):
    """
    POST /api/v1/auctions/{id}/cancel/ - Cancel an auction (Seller or Admin)
    """
    permission_classes = [permissions.IsAuthenticated, IsSellerOrReadOnly]

    def post(self, request, pk):
        auction = get_object_or_404(Auction, id=pk)
        self.check_object_permissions(request, auction)
        reason = request.data.get('reason', 'Cancelled by seller.')
        try:
            cancelled = AuctionService.cancel_auction(auction, actor=request.user, reason=reason)
            serializer = AuctionDetailSerializer(cancelled, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({'detail': e.messages if hasattr(e, 'messages') else str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class AuctionBidsView(APIView):
    """
    GET /api/v1/auctions/{id}/bids/ - Retrieve bid history for this auction
    POST /api/v1/auctions/{id}/bids/ - Place a new bid (Concurrent locking protected)
    """
    authentication_classes = [SafeJWTAuthentication]

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticatedBuyer()]
        return [permissions.AllowAny()]

    def get(self, request, pk):
        auction = get_object_or_404(Auction, id=pk)
        history = AuctionSelectors.get_auction_bid_history(auction, requesting_user=request.user)
        return Response(history, status=status.HTTP_200_OK)

    def post(self, request, pk):
        serializer = PlaceBidSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        amount = serializer.validated_data['amount']
        idempotency_key = serializer.validated_data.get('idempotency_key')
        ip_addr = request.META.get('REMOTE_ADDR')

        try:
            bid = BiddingService.place_bid(
                auction_id=pk,
                buyer=request.user,
                amount=amount,
                idempotency_key=idempotency_key,
                ip_address=ip_addr
            )
            out = BidSerializer(bid, context={'request': request})
            return Response(out.data, status=status.HTTP_201_CREATED)
        except DjangoValidationError as e:
            msg = e.messages[0] if hasattr(e, 'messages') and e.messages else str(e)
            return Response({'detail': msg}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class MyBidsView(APIView):
    """
    GET /api/v1/my-bids/ - List all bids placed by the authenticated buyer
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        bids = AuctionSelectors.get_buyer_bids(request.user)
        results = []
        for b in bids:
            results.append({
                'bid_id': str(b.id),
                'amount': str(b.amount),
                'bid_time': b.bid_time,
                'status': b.status,
                'auction_id': str(b.auction.id),
                'auction_title': b.auction.title,
                'auction_image': b.auction.image_url,
                'auction_status': b.auction.status,
                'current_highest_bid': str(b.auction.current_highest_bid or b.auction.starting_price),
                'end_time': b.auction.end_time,
                'is_winning': b.auction.winner == request.user or b.status == 'WINNING'
            })
        return Response(results, status=status.HTTP_200_OK)


class AuctionWatchlistView(APIView):
    """
    GET /api/v1/auction-watchlist/ - List watchlisted auctions
    POST /api/v1/auctions/{id}/watchlist/ - Add auction to watchlist
    DELETE /api/v1/auctions/{id}/watchlist/ - Remove auction from watchlist
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        items = AuctionSelectors.get_watchlist(request.user)
        auctions = [w.auction for w in items]
        serializer = AuctionListSerializer(auctions, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, pk):
        auction = get_object_or_404(Auction, id=pk)
        entry, created = AuctionWatchlist.objects.get_or_create(buyer=request.user, auction=auction)
        return Response({'status': 'watching', 'is_watched': True}, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def delete(self, request, pk):
        auction = get_object_or_404(Auction, id=pk)
        deleted, _ = AuctionWatchlist.objects.filter(buyer=request.user, auction=auction).delete()
        return Response({'status': 'unwatched', 'is_watched': False}, status=status.HTTP_200_OK)


class MyAuctionsView(APIView):
    """
    GET /api/v1/my-auctions/ - Seller's dashboard: all auctions created by logged-in user
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        auctions = AuctionSelectors.get_seller_auctions(request.user)
        serializer = AuctionListSerializer(auctions, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class MyWonAuctionsView(APIView):
    """
    GET /api/v1/my-won-auctions/ - Buyer's won auctions
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        auctions = AuctionSelectors.get_buyer_won_auctions(request.user)
        results = []
        for a in auctions:
            pay = getattr(a, 'payment_record', None)
            order = getattr(a, 'auction_order', None)
            results.append({
                'auction_id': str(a.id),
                'title': a.title,
                'image_url': a.image_url,
                'seller_username': a.seller.username,
                'final_bid_amount': str(a.current_highest_bid or a.starting_price),
                'auction_status': a.status,
                'payment_status': pay.status if pay else 'NO_PAYMENT_RECORD',
                'payment_deadline': pay.payment_deadline if pay else None,
                'is_paid': pay.status == 'SUCCESS' if pay else False,
                'order_id': str(order.id) if order else None,
                'order_status': order.order_status if order else None
            })
        return Response(results, status=status.HTTP_200_OK)


class AuctionPaymentCheckoutView(APIView):
    """
    POST /api/v1/auctions/{id}/pay/ - Process winner payment (Razorpay Mock Sandbox & Order confirmation)
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        gateway_ref = request.data.get('gateway_ref', '')
        provider = request.data.get('provider', 'razorpay_mock')
        shipping_address = request.data.get('shipping_address', '')

        try:
            payment = AuctionPaymentService.process_winner_payment(
                auction_id=pk,
                user=request.user,
                gateway_ref=gateway_ref,
                payment_provider=provider,
                shipping_address=shipping_address
            )
            order = AuctionOrder.objects.filter(auction_id=pk).first()
            return Response({
                'status': 'SUCCESS',
                'payment_id': str(payment.id),
                'gateway_ref': payment.payment_gateway_ref,
                'order_id': str(order.id) if order else None,
                'amount': str(payment.amount),
                'message': 'Payment confirmed! The artisan is preparing your handcrafted order.'
            }, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            msg = e.messages[0] if hasattr(e, 'messages') and e.messages else str(e)
            return Response({'detail': msg}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class AuctionNotificationsView(APIView):
    """
    GET /api/v1/auction-notifications/ - List notifications for logged-in user
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        notifs = AuctionNotification.objects.filter(recipient=request.user).order_by('-created_at')[:25]
        serializer = AuctionNotificationSerializer(notifs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AuctionNotificationMarkReadView(APIView):
    """
    POST /api/v1/auction-notifications/{id}/read/ - Mark notification as read
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        notif = get_object_or_404(AuctionNotification, id=pk, recipient=request.user)
        notif.is_read = True
        notif.save(update_fields=['is_read'])
        return Response({'status': 'marked_read'}, status=status.HTTP_200_OK)

