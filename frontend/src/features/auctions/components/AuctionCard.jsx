import React from 'react';
import { Gavel, Heart, ShieldCheck, Flame, User, CheckCircle2, Trash2 } from 'lucide-react';
import CountdownTimer from './CountdownTimer';

export default function AuctionCard({
  auction,
  onSelect,
  onToggleWatchlist,
  onDelete,
  isWatchlisted = false,
  currentUser = null
}) {
  const isLive = auction.status === 'LIVE';
  const isScheduled = auction.status === 'SCHEDULED';
  const isEnded = ['ENDED', 'AWARDED', 'PAYMENT_PENDING', 'COMPLETED', 'RESERVE_NOT_MET'].includes(auction.status);

  const currentPrice = parseFloat(auction.current_highest_bid || auction.starting_price || 0);
  const minIncrement = parseFloat(auction.min_bid_increment || 100);
  const nextMinBid = auction.current_highest_bid ? currentPrice + minIncrement : currentPrice;

  const isSeller = Boolean(currentUser && (
    auction.is_my_auction ||
    currentUser.id === auction.seller?.id ||
    currentUser.id === auction.seller_id ||
    (currentUser.username && auction.seller?.username && currentUser.username === auction.seller.username) ||
    (currentUser.username && auction.seller_username && currentUser.username === auction.seller_username)
  ));

  const isLeadingBidder = currentUser && (
    auction.current_winner?.id === currentUser.id ||
    auction.current_winner?.username === currentUser.username
  );

  return (
    <div className="group relative bg-[#141210] border border-[#2c2824] hover:border-[#c5a66a]/70 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#c5a66a]/10 flex flex-col justify-between">
      {/* Top Banner & Status Badge */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#0a0a0a]">
        <img
          src={auction.product_image || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80'}
          alt={auction.product_title || auction.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-transparent to-black/40" />

        {/* Status Pill */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {isLive && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-600/90 text-white shadow-lg backdrop-blur-sm animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              Live Auction
            </span>
          )}
          {isScheduled && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-600/90 text-white shadow-lg backdrop-blur-sm">
              Upcoming
            </span>
          )}
          {isEnded && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700">
              {auction.status === 'COMPLETED' ? 'Sold' : 'Closed'}
            </span>
          )}
          {auction.reserve_met && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/80 border border-emerald-600/60 text-emerald-300">
              <CheckCircle2 size={10} /> Reserve Met
            </span>
          )}
        </div>

        {/* Watchlist Button */}
        {onToggleWatchlist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatchlist(auction.id, isWatchlisted);
            }}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
              isWatchlisted
                ? 'bg-rose-500 text-white shadow-lg'
                : 'bg-black/50 text-white hover:text-rose-400 hover:bg-black/80'
            }`}
            title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
          >
            <Heart size={14} fill={isWatchlisted ? 'currentColor' : 'none'} />
          </button>
        )}

        {/* Anti-Sniping Countdown overlay */}
        {isLive && (
          <div className="absolute bottom-3 left-3 right-3">
            <CountdownTimer endTime={auction.end_time} compact={false} />
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Artisan & Category line */}
          <div className="flex items-center justify-between text-[11px] text-[#a39e93] mb-1.5">
            <span className="uppercase tracking-wider font-semibold text-[#c5a66a] truncate max-w-[65%]">
              {auction.product_category || 'Handcrafted Artisan Artifact'}
            </span>
            <span className="flex items-center gap-1">
              <User size={11} /> {auction.seller?.artisan_name || auction.seller?.username || 'Verified Master'}
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelect(auction)}
            className="text-base font-bold text-[#f5f2eb] line-clamp-1 group-hover:text-[#c5a66a] transition-colors cursor-pointer"
          >
            {auction.product_title || auction.title}
          </h3>

          <p className="text-xs text-[#8e8a83] line-clamp-2 mt-1">
            {auction.product_description || auction.description || 'Rare museum-grade piece created using ancestral heritage techniques.'}
          </p>
        </div>

        {/* Bidding Summary Box */}
        <div className="mt-4 pt-3 border-t border-[#262422]">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-[#0e0d0c] p-2 rounded-lg border border-[#222]">
              <span className="block text-[10px] text-[#8e8a83] uppercase tracking-wider">
                {auction.bid_count > 0 ? 'Current Highest Bid' : 'Starting Price'}
              </span>
              <span className="text-base font-black text-[#c5a66a] font-mono">
                ₹{currentPrice.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="bg-[#0e0d0c] p-2 rounded-lg border border-[#222]">
              <span className="block text-[10px] text-[#8e8a83] uppercase tracking-wider">
                Total Bids
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-[#f5f2eb] mt-0.5">
                <Flame size={12} className="text-amber-500" />
                <span>{auction.bid_count || 0} bids</span>
              </div>
            </div>
          </div>

          {/* User state alert pill */}
          {isLeadingBidder && (
            <div className="mb-2 text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 rounded px-2.5 py-1 text-center">
              👑 You are currently the highest bidder!
            </div>
          )}

          {isSeller && (
            <div className="mb-2 text-[11px] font-semibold text-amber-400 bg-amber-950/40 border border-amber-800/60 rounded px-2.5 py-1 text-center">
              🏷️ Your Auction Listing
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelect(auction)}
              className="flex-1 bg-gradient-to-r from-[#c5a66a] to-[#dfbe7d] hover:from-[#dfbe7d] hover:to-[#c5a66a] text-[#121212] font-black text-xs uppercase tracking-wider py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:shadow-[#c5a66a]/20"
            >
              <Gavel size={14} />
              {isLive ? 'Place Bid Now' : 'View Auction'}
            </button>

            {isSeller && onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(auction);
                }}
                className="p-2.5 rounded-lg bg-red-950/60 hover:bg-red-600 border border-red-800 text-red-300 hover:text-white transition-colors cursor-pointer"
                title="Delete this auction (Seller only)"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

