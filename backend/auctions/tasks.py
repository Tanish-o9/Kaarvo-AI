import logging
from auctions.services import AuctionService, AuctionPaymentService

logger = logging.getLogger(__name__)


def run_auction_lifecycle_job():
    """
    Scheduled job:
    1. Activate SCHEDULED auctions that have reached start_time.
    2. Close LIVE auctions that have reached end_time and declare winners.
    3. Expire overdue payments past the 24-hour deadline.
    """
    res = AuctionService.evaluate_all_active_auctions()
    expired_payments = AuctionPaymentService.expire_overdue_payments()
    logger.info(f"Auction lifecycle job completed: {res}, expired payments: {expired_payments}")
    return {**res, 'expired_payments': expired_payments}

