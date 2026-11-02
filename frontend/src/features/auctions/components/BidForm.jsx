import React, { useState } from 'react';
import { Gavel, AlertCircle, CheckCircle, Zap, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';
import { auctionApi } from '../services/auctionApi';

export default function BidForm({
  auction,
  currentUser,
  onBidSuccess,
  onRequireAuth
}) {
  const currentPrice = parseFloat(auction.current_highest_bid || auction.starting_price || 0);
  const minIncrement = parseFloat(auction.min_bid_increment || 100);
  const hasBids = (auction.bid_count || 0) > 0;
  const minValidBid = hasBids ? currentPrice + minIncrement : currentPrice;

  const [bidAmount, setBidAmount] = useState(minValidBid);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isSeller = currentUser && (
    currentUser.id === auction.seller?.id ||
    currentUser.username === auction.seller?.username
  );

  const isHighestBidder = currentUser && (
    auction.current_winner?.id === currentUser.id ||
    auction.current_winner?.username === currentUser.username
  );

  const buyNowPrice = auction.buy_now_price ? parseFloat(auction.buy_now_price) : null;

  // Quick increment handler
  const handleQuickIncrement = (delta) => {
    setError('');
    setSuccessMsg('');
    const base = Math.max(parseFloat(bidAmount) || minValidBid, minValidBid);
    setBidAmount(base + delta);
  };

  // Submit Bid with concurrency lock
  const handleSubmitBid = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth();
      return;
    }

    if (isSeller) {
      setError('Anti-fraud rule: Sellers are strictly prohibited from bidding on their own listings.');
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount < minValidBid) {
      setError(`Your bid must be at least ₹${minValidBid.toLocaleString('en-IN')}`);
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await auctionApi.placeBid(auction.id, amount);
      setSuccessMsg(`🎉 Success! Your bid of ₹${amount.toLocaleString('en-IN')} has been officially locked and recorded.`);
      if (onBidSuccess) onBidSuccess(res);
      // Auto-update to next valid bid
      setBidAmount(amount + minIncrement);
    } catch (err) {
      const msg = err.message || 'Bid submission failed due to concurrent activity.';
      setError(msg);
      // If error indicates higher bid was placed concurrently, refresh amount
      if (msg.includes('at least') || msg.includes('higher')) {
        setBidAmount(minValidBid + minIncrement);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Buy Now Handler
  const handleBuyNow = async () => {
    if (!buyNowPrice) return;
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth();
      return;
    }

    if (isSeller) {
      setError('Sellers cannot purchase their own auctions.');
      return;
    }

    if (!window.confirm(`Confirm immediate purchase at Buy Now price of ₹${buyNowPrice.toLocaleString('en-IN')}? This will instantly close the auction.`)) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await auctionApi.placeBid(auction.id, buyNowPrice);
      setSuccessMsg(`🏆 Congratulations! You exercised Buy Now at ₹${buyNowPrice.toLocaleString('en-IN')}. Auction concluded in your favor!`);
      if (onBidSuccess) onBidSuccess(res);
    } catch (err) {
      setError(err.message || 'Failed to complete Buy Now purchase.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isSeller) {
    return (
      <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 text-amber-300 text-xs flex items-start gap-2.5">
        <ShieldAlert size={18} className="shrink-0 text-amber-400 mt-0.5" />
        <div>
          <p className="font-bold">Seller Dashboard Mode</p>
          <p className="text-amber-300/80 mt-0.5">
            You are the creator of this auction. Self-bidding is prevented by the English Auction Protocol to preserve market fairness.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-[#141210] border border-[#2c2824] p-4 sm:p-5 rounded-2xl">
      {/* Current Bid & Min Next Bid Highlights */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#0c0b0a] p-3 rounded-xl border border-[#222]">
          <span className="block text-[10px] uppercase font-bold text-[#8e8a83] tracking-wider">
            {hasBids ? 'Current Highest' : 'Opening Price'}
          </span>
          <span className="text-lg sm:text-xl font-black font-mono text-[#c5a66a]">
            ₹{currentPrice.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="bg-[#0c0b0a] p-3 rounded-xl border border-emerald-900/40">
          <span className="block text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1">
            <TrendingUp size={11} /> Min Next Bid
          </span>
          <span className="text-lg sm:text-xl font-black font-mono text-emerald-300">
            ₹{minValidBid.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {isHighestBidder && (
        <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-600/60 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <Sparkles size={14} className="text-emerald-400" />
          <span>You currently hold the highest bid on this artisan piece.</span>
        </div>
      )}

      {/* Place Bid Form */}
      <form onSubmit={handleSubmitBid} className="space-y-3">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#a39e93] mb-1.5">
            Enter Your Bid Amount (₹ INR)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-[#c5a66a]">
              ₹
            </span>
            <input
              type="number"
              step="any"
              min={minValidBid}
              value={bidAmount}
              onChange={(e) => {
                setError('');
                setSuccessMsg('');
                setBidAmount(e.target.value);
              }}
              disabled={submitting}
              className="w-full bg-[#090807] border border-[#38342e] focus:border-[#c5a66a] rounded-xl py-3 pl-8 pr-4 text-white font-mono text-lg font-bold focus:outline-none transition-colors"
              placeholder={`Min ₹${minValidBid}`}
              required
            />
          </div>
        </div>

        {/* Quick Increment Buttons */}
        <div>
          <span className="block text-[10px] text-[#8e8a83] uppercase tracking-wider mb-1.5">
            Quick Increment Chips:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[100, 250, 500, 1000, 2500].map((inc) => (
              <button
                key={inc}
                type="button"
                onClick={() => handleQuickIncrement(inc)}
                disabled={submitting}
                className="px-2.5 py-1 text-xs font-bold font-mono rounded-lg bg-[#201e1a] hover:bg-[#c5a66a] hover:text-[#121212] border border-[#38342e] text-[#dfbe7d] transition-colors cursor-pointer"
              >
                +₹{inc}
              </button>
            ))}
          </div>
        </div>

        {/* Error / Success Feedback */}
        {error && (
          <div className="p-3 rounded-lg bg-red-950/50 border border-red-700/70 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-700/70 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle size={15} className="shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gradient-to-r from-[#c5a66a] via-[#dfbe7d] to-[#c5a66a] text-[#121212] hover:opacity-95 disabled:opacity-50 font-black text-sm uppercase tracking-wider py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-[#c5a66a]/20"
        >
          <Gavel size={16} />
          {submitting ? 'Placing Concurrency-Locked Bid...' : `Submit Bid (₹${parseFloat(bidAmount || minValidBid).toLocaleString('en-IN')})`}
        </button>
      </form>

      {/* Buy Now Option */}
      {buyNowPrice && (
        <div className="pt-3 border-t border-[#262422]">
          <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-950/30 to-amber-900/20 border border-amber-600/40">
            <div>
              <span className="block text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                Instant Ownership
              </span>
              <span className="text-base font-black font-mono text-white">
                Buy Now for ₹{buyNowPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={submitting}
              className="bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider py-2 px-3.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Zap size={14} /> Buy Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

