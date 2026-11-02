from decimal import Decimal
from datetime import timedelta
from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.exceptions import ValidationError
from auctions.models import (
    Auction, AuctionStatus, Bid, BidStatus,
    AuctionPayment, AuctionOrder
)
from auctions.services import (
    AuctionService, BiddingService, close_auction_and_determine_winner,
    AuctionPaymentService
)


class AuctionCoreTestCase(TestCase):
    def setUp(self):
        # Create seller and buyers
        self.seller = User.objects.create_user(username='artisan_mohan', email='mohan@artisan.in', password='password123')
        self.buyer1 = User.objects.create_user(username='buyer_aarav', email='aarav@buyer.in', password='password123')
        self.buyer2 = User.objects.create_user(username='buyer_priya', email='priya@buyer.in', password='password123')

        self.now = timezone.now()
        # Create a LIVE auction
        self.auction = AuctionService.create_auction(
            seller=self.seller,
            data={
                'title': 'Handcrafted Royal Blue Terracotta Vase',
                'description': 'Unique wood-kiln fired heirloom pot.',
                'category': 'Pottery & Ceramics',
                'starting_price': Decimal('1000.00'),
                'minimum_increment': Decimal('100.00'),
                'reserve_price': Decimal('1500.00'),
                'buy_now_price': Decimal('5000.00'),
                'start_time': self.now - timedelta(hours=1),
                'end_time': self.now + timedelta(hours=2),
                'publish_immediately': True,
                'anti_sniping_enabled': True,
                'anti_sniping_extension_minutes': 5
            }
        )

    def test_seller_creates_auction(self):
        """Seller can create auction with valid starting price and schedule."""
        self.assertEqual(self.auction.seller, self.seller)
        self.assertEqual(self.auction.status, AuctionStatus.LIVE)
        self.assertEqual(self.auction.starting_price, Decimal('1000.00'))
        self.assertEqual(self.auction.minimum_next_bid, Decimal('1000.00'))

    def test_unauthenticated_user_cannot_bid(self):
        """Unauthenticated user cannot place a bid."""
        with self.assertRaises(ValidationError) as ctx:
            BiddingService.place_bid(self.auction.id, None, Decimal('1000.00'))
        self.assertIn("logged in", str(ctx.exception))

    def test_seller_cannot_bid_on_own_product(self):
        """Seller is strictly prevented from bidding on their own auction."""
        with self.assertRaises(ValidationError) as ctx:
            BiddingService.place_bid(self.auction.id, self.seller, Decimal('1200.00'))
        self.assertIn("Sellers are strictly prohibited", str(ctx.exception))

    def test_valid_first_bid_accepted(self):
        """Buyer places first bid meeting starting price."""
        bid = BiddingService.place_bid(self.auction.id, self.buyer1, Decimal('1000.00'))
        self.assertEqual(bid.amount, Decimal('1000.00'))
        self.assertEqual(bid.buyer, self.buyer1)

        self.auction.refresh_from_db()
        self.assertEqual(self.auction.current_highest_bid, Decimal('1000.00'))
        # Next minimum valid bid should now be highest (1000) + increment (100) = 1100
        self.assertEqual(self.auction.minimum_next_bid, Decimal('1100.00'))

    def test_lower_bid_is_rejected(self):
        """Bid lower than minimum next bid is rejected."""
        BiddingService.place_bid(self.auction.id, self.buyer1, Decimal('1000.00'))

        # Buyer 2 tries to place 1050 (needs >= 1100)
        with self.assertRaises(ValidationError) as ctx:
            BiddingService.place_bid(self.auction.id, self.buyer2, Decimal('1050.00'))
        self.assertIn("too low", str(ctx.exception))

    def test_equal_bid_is_rejected(self):
        """Bid equal to current highest bid is rejected."""
        BiddingService.place_bid(self.auction.id, self.buyer1, Decimal('1200.00'))

        with self.assertRaises(ValidationError) as ctx:
            BiddingService.place_bid(self.auction.id, self.buyer2, Decimal('1200.00'))
        self.assertIn("too low", str(ctx.exception))

    def test_higher_bid_outbids_previous_bidder(self):
        """New higher bid marks previous bid as OUTBID."""
        bid1 = BiddingService.place_bid(self.auction.id, self.buyer1, Decimal('1100.00'))
        bid2 = BiddingService.place_bid(self.auction.id, self.buyer2, Decimal('1300.00'))

        bid1.refresh_from_db()
        self.assertEqual(bid1.status, BidStatus.OUTBID)
        self.assertEqual(bid2.status, BidStatus.VALID)

        self.auction.refresh_from_db()
        self.assertEqual(self.auction.current_highest_bid, Decimal('1300.00'))

    def test_idempotent_bid_replay(self):
        """Duplicate request with same idempotency key returns existing bid."""
        key = "idemp_test_12345"
        bid1 = BiddingService.place_bid(self.auction.id, self.buyer1, Decimal('1200.00'), idempotency_key=key)
        bid2 = BiddingService.place_bid(self.auction.id, self.buyer1, Decimal('1200.00'), idempotency_key=key)
        self.assertEqual(bid1.id, bid2.id)

    def test_anti_sniping_extends_deadline(self):
        """Bid placed in final 2 minutes extends end_time."""
        # Set auction end_time to 60 seconds from now
        self.auction.end_time = timezone.now() + timedelta(seconds=60)
        self.auction.save(update_fields=['end_time'])

        original_end = self.auction.end_time
        BiddingService.place_bid(self.auction.id, self.buyer1, Decimal('1200.00'))

        self.auction.refresh_from_db()
        self.assertGreater(self.auction.end_time, original_end)
        self.assertEqual(self.auction.extensions_count, 1)

    def test_auction_cannot_receive_bids_after_closing(self):
        """Bids after end_time are rejected."""
        self.auction.end_time = timezone.now() - timedelta(minutes=5)
        self.auction.save(update_fields=['end_time'])

        with self.assertRaises(ValidationError) as ctx:
            BiddingService.place_bid(self.auction.id, self.buyer1, Decimal('1500.00'))
        self.assertIn("ended", str(ctx.exception))

    def test_no_bid_auction_closes_without_winner(self):
        """Auction with no bids closes with status ENDED and no winner."""
        closed_auc = close_auction_and_determine_winner(self.auction)
        self.assertEqual(closed_auc.status, AuctionStatus.ENDED)
        self.assertIsNone(closed_auc.winner)

    def test_reserve_not_met_leaves_auction_without_winner(self):
        """If highest bid < reserve price (1500), status becomes RESERVE_NOT_MET."""
        BiddingService.place_bid(self.auction.id, self.buyer1, Decimal('1200.00'))
        closed_auc = close_auction_and_determine_winner(self.auction)
        self.assertEqual(closed_auc.status, AuctionStatus.RESERVE_NOT_MET)
        self.assertIsNone(closed_auc.winner)

    def test_highest_bidder_wins_and_payment_obligation_created(self):
        """Highest bidder winning meeting reserve price gets PAYMENT_PENDING status."""
        BiddingService.place_bid(self.auction.id, self.buyer1, Decimal('1200.00'))
        BiddingService.place_bid(self.auction.id, self.buyer2, Decimal('1600.00'))  # >= 1500 reserve

        closed_auc = close_auction_and_determine_winner(self.auction)
        self.assertEqual(closed_auc.status, AuctionStatus.PAYMENT_PENDING)
        self.assertEqual(closed_auc.winner, self.buyer2)

        # Payment record created
        payment = AuctionPayment.objects.get(auction=closed_auc)
        self.assertEqual(payment.amount, Decimal('1600.00'))
        self.assertEqual(payment.winner, self.buyer2)
        self.assertEqual(payment.status, AuctionPayment.PaymentStatus.PENDING)

    def test_winner_payment_and_order_creation(self):
        """Winner can complete payment and generate AuctionOrder."""
        BiddingService.place_bid(self.auction.id, self.buyer1, Decimal('1600.00'))
        closed_auc = close_auction_and_determine_winner(self.auction)

        payment = AuctionPaymentService.process_winner_payment(
            auction_id=closed_auc.id,
            user=self.buyer1,
            gateway_ref='PAY_TEST_REF_8899',
            shipping_address='Civil Lines, Jaipur 302006'
        )
        self.assertEqual(payment.status, AuctionPayment.PaymentStatus.SUCCESS)

        closed_auc.refresh_from_db()
        self.assertEqual(closed_auc.status, AuctionStatus.COMPLETED)

        order = AuctionOrder.objects.get(auction=closed_auc)
        self.assertEqual(order.winning_buyer, self.buyer1)
        self.assertEqual(order.seller, self.seller)
        self.assertEqual(order.final_amount, Decimal('1600.00'))
        self.assertEqual(order.order_status, AuctionOrder.OrderStatus.PROCESSING)

