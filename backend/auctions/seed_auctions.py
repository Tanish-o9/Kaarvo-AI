import os, sys
from pathlib import Path
from decimal import Decimal
from datetime import timedelta

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'artisan_backend.settings')

import django
django.setup()

from django.utils import timezone
from django.contrib.auth.models import User
from artisan_api.models import Product
from auctions.models import Auction, AuctionStatus, Bid, BidStatus, AuctionEvent, AuctionEventType
from auctions.services import BiddingService

def seed_sample_auctions():
    print("Seeding authentic artisan auctions into Neon Cloud PostgreSQL...")

    # Get or create demo seller and buyers
    seller = User.objects.filter(username='artisan_demo').first()
    if not seller:
        seller = User.objects.create_user('artisan_demo', 'demo@artisan.in', 'demo123')

    buyer1 = User.objects.filter(username='tanish').first()
    buyer2 = User.objects.filter(username='sidd').first()

    now = timezone.now()

    sample_data = [
        {
            'title': 'Ancestral 18th Century Jaipuri Blue Pottery Kiln Urn',
            'description': 'Unique hand-thrown quartz stone & copper oxide cobalt glaze urn. Single wood-fired kiln finish by master artisan Mohan Lal Sanganer guild.',
            'category': 'Pottery & Ceramics',
            'image_url': 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
            'starting_price': Decimal('2500.00'),
            'minimum_increment': Decimal('150.00'),
            'reserve_price': Decimal('3500.00'),
            'buy_now_price': Decimal('8500.00'),
            'start_time': now - timedelta(hours=3),
            'end_time': now + timedelta(hours=8),
            'status': AuctionStatus.LIVE,
            'initial_bids': [
                (buyer1, Decimal('2500.00')),
                (buyer2, Decimal('2800.00'))
            ]
        },
        {
            'title': 'Masterpiece Banarasi Katan Silk Royal Zari Weave Saree',
            'description': 'Heirloom gossamer pure mulberry silk handwoven on traditional pit looms in Varanasi. Features 24-carat gold electroplated electro-zari motifs.',
            'category': 'Textiles / Handloom',
            'image_url': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
            'starting_price': Decimal('6000.00'),
            'minimum_increment': Decimal('250.00'),
            'reserve_price': Decimal('8000.00'),
            'buy_now_price': Decimal('18000.00'),
            'start_time': now - timedelta(hours=1),
            'end_time': now + timedelta(hours=14),
            'status': AuctionStatus.LIVE,
            'initial_bids': [
                (buyer2, Decimal('6000.00')),
                (buyer1, Decimal('6500.00'))
            ]
        },
        {
            'title': 'Bastar Dhokra Lost-Wax Bell Metal Ceremonial Horned Diya',
            'description': '4,000-year-old Indus Valley cire-perdue bronze alloy sculpture by Bastar tribal guilds. Hand-twisted beeswax coil construction.',
            'category': 'Metal Craft',
            'image_url': 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=800&q=80',
            'starting_price': Decimal('1800.00'),
            'minimum_increment': Decimal('100.00'),
            'reserve_price': Decimal('2200.00'),
            'buy_now_price': Decimal('5500.00'),
            'start_time': now - timedelta(minutes=45),
            'end_time': now + timedelta(hours=5),
            'status': AuctionStatus.LIVE,
            'initial_bids': [
                (buyer1, Decimal('1800.00'))
            ]
        },
        {
            'title': 'Imperial Kashmiri Walnut Wood Hand-Carved Jewelry Casket',
            'description': 'Seasoned high-altitude Kashmir walnut fretwork carved with chinar leaf motifs and secret double-locking wooden latch mechanism.',
            'category': 'Woodcraft',
            'image_url': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
            'starting_price': Decimal('3200.00'),
            'minimum_increment': Decimal('200.00'),
            'reserve_price': Decimal('4500.00'),
            'buy_now_price': Decimal('9000.00'),
            'start_time': now + timedelta(hours=2),
            'end_time': now + timedelta(days=2),
            'status': AuctionStatus.SCHEDULED,
            'initial_bids': []
        }
    ]

    for item in sample_data:
        exists = Auction.objects.filter(title=item['title']).first()
        if exists:
            print(f"Auction already exists: {item['title']}")
            continue

        prod = Product.objects.filter(title__icontains=item['category'][:6]).first()

        auc = Auction.objects.create(
            product=prod,
            seller=seller,
            title=item['title'],
            description=item['description'],
            category=item['category'],
            image_url=item['image_url'],
            starting_price=item['starting_price'],
            minimum_increment=item['minimum_increment'],
            reserve_price=item['reserve_price'],
            buy_now_price=item['buy_now_price'],
            start_time=item['start_time'],
            end_time=item['end_time'],
            status=item['status'],
            anti_sniping_enabled=True,
            anti_sniping_extension_minutes=5
        )

        AuctionEvent.objects.create(
            auction=auc,
            event_type=AuctionEventType.AUCTION_CREATED,
            actor=seller,
            event_details={'starting_price': str(item['starting_price'])}
        )

        if item['status'] == AuctionStatus.LIVE:
            AuctionEvent.objects.create(
                auction=auc,
                event_type=AuctionEventType.AUCTION_STARTED,
                actor=seller,
                event_details={'started_at': str(item['start_time'])}
            )

        # Place initial bids if any
        for bidder, b_amt in item['initial_bids']:
            if bidder:
                try:
                    BiddingService.place_bid(auc.id, bidder, b_amt)
                    print(f"  Placed seed bid: Rs.{b_amt} by {bidder.username}")
                except Exception as e:
                    print(f"  Seed bid notice: {e}")

        print(f"Created auction: {auc.title} [{auc.status}]")

    print(f"\nTotal Auctions in Neon DB: {Auction.objects.count()}")

if __name__ == '__main__':
    seed_sample_auctions()

