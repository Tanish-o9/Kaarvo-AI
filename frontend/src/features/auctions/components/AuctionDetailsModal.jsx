import React, { useState, useEffect } from 'react';
import { X, Gavel, RefreshCw, ShieldCheck, Heart, User, MapPin, Tag, Award, Sparkles, CreditCard, ExternalLink, Trash2 } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import BidForm from './BidForm';
import BidHistory from './BidHistory';
import { auctionApi } from '../services/auctionApi';

export default function AuctionDetailsModal({
  auctionId,
  isOpen,
  onClose,
  currentUser,
  onRequireAuth,
  onOpenCheckout,
  onDeleteAuction
}) {
  const [auction, setAuction] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  // Fetch full details
  const fetchDetails = async (showSpinner = false) => {
    if (!auctionId) return;
    if (showSpinner) setRefreshing(true);

    try {
      const data = await auctionApi.getAuction(auctionId);
      setAuction(data);
      if (!activeImage) {
        const initialImg = (data.images && data.images.length > 0)
          ? data.images[0]
          : (data.product_image || data.image_url);
        setActiveImage(initialImg);
      }
      setIsWatchlisted(data.is_watchlisted || false);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch auction details.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen && auctionId) {
      setLoading(true);
      fetchDetails();

      // Auto poll every 4 seconds if auction is LIVE
      const interval = setInterval(() => {
        fetchDetails(false);
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [isOpen, auctionId]);

  if (!isOpen) return null;

  const handleToggleWatchlist = async () => {
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    try {
      await auctionApi.toggleWatchlist(auction.id, isWatchlisted);
      setIsWatchlisted(!isWatchlisted);
    } catch (e) {
      console.error(e);
    }
  };

  const isLive = auction?.status === 'LIVE';
  const isSeller = Boolean(currentUser && auction && (
    auction.is_my_auction ||
    currentUser.id === auction.seller?.id ||
    currentUser.id === auction.seller_id ||
    (currentUser.username && auction.seller?.username && currentUser.username === auction.seller.username) ||
    (currentUser.username && auction.seller_username && currentUser.username === auction.seller_username) ||
    currentUser.is_staff
  ));

  const handleDeleteAuction = async () => {
    if (!window.confirm(`Are you sure you want to delete auction "${auction.product_title || auction.title}"? Only you (the creator) can perform this action.`)) {
      return;
    }
    setDeleting(true);
    try {
      await auctionApi.deleteAuction(auction.id);
      if (onDeleteAuction) onDeleteAuction(auction.id);
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to delete auction');
    } finally {
      setDeleting(false);
    }
  };

  const isWinner = currentUser && auction && (
    (auction.winner?.id === currentUser.id || auction.winner?.username === currentUser.username) ||
    (auction.current_winner?.id === currentUser.id || auction.current_winner?.username === currentUser.username)
  );

  const canPay = isWinner && ['PAYMENT_PENDING', 'AWARDED'].includes(auction?.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#141210] border border-[#38342e] rounded-2xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1c1916] to-[#121110] border-b border-[#2e2a25] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#c5a66a]/20 border border-[#c5a66a] text-[#dfbe7d]">
              Auction #{auctionId}
            </span>
            {isLive && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-600/90 text-white animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span> Live Bidding Active
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Seller-only delete button */}
            {isSeller && (
              <button
                onClick={handleDeleteAuction}
                disabled={deleting}
                className="px-2.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-800 border border-red-800 text-red-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                title="Delete this auction (Seller only)"
              >
                <Trash2 size={14} />
                <span className="hidden sm:inline">{deleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            )}

            <button
              onClick={() => fetchDetails(true)}
              className="p-2 rounded-lg bg-[#201e1a] hover:bg-[#2e2a25] text-[#a39e93] hover:text-white transition-colors cursor-pointer"
              title="Refresh Bids"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            </button>

            {auction && (
              <button
                onClick={handleToggleWatchlist}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  isWatchlisted ? 'bg-rose-950/60 text-rose-400 border border-rose-800' : 'bg-[#201e1a] text-[#a39e93] hover:text-rose-400'
                }`}
                title="Watchlist"
              >
                <Heart size={15} fill={isWatchlisted ? 'currentColor' : 'none'} />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#201e1a] hover:bg-[#2e2a25] text-[#888] hover:text-white transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          {loading && !auction ? (
            <div className="text-center py-20 text-[#888]">
              <RefreshCw size={32} className="mx-auto animate-spin mb-3 text-[#c5a66a]" />
              <p className="text-sm">Retrieving Live Bidding Room & Provenance Ledger...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-950/40 border border-red-800 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          ) : auction ? (
            <>
              {/* Winner Payment Banner */}
              {canPay && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/70 to-[#121110] border-2 border-emerald-500 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Award size={22} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        🏆 Congratulations! You Won This Handcrafted Artifact
                      </h4>
                      <p className="text-xs text-emerald-300">
                        Please settle the winning bid of ₹{parseFloat(auction.current_highest_bid).toLocaleString('en-IN')} to confirm your order and schedule dispatch.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenCheckout(auction)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <CreditCard size={15} /> Complete Settlement
                  </button>
                </div>
              )}

              {/* Main Grid: Media & Info Left, Bidding & History Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column (6 cols): Product Card & Story */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#0c0b0a] border border-[#2a2622]">
                    <img
                      src={activeImage || auction.product_image || auction.image_url || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80'}
                      alt={auction.product_title || auction.title}
                      className="w-full h-full object-cover transition-all duration-200"
                    />
                    {isLive && (
                      <div className="absolute bottom-3 left-3 right-3">
                        <CountdownTimer endTime={auction.end_time} />
                      </div>
                    )}
                  </div>

                  {/* Multi-Image Thumbnails if more than 1 image */}
                  {auction.images && auction.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5">
                      {auction.images.map((imgUrl, idx) => {
                        const isSelected = (activeImage || auction.product_image) === imgUrl;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveImage(imgUrl)}
                            className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#c5a66a] shadow-md shadow-[#c5a66a]/40 scale-105'
                                : 'border-[#333] hover:border-[#777] opacity-75 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={imgUrl}
                              alt={`Thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Title & Category */}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#c5a66a]">
                      {auction.product_category || 'Handcrafted Artisan Artifact'}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-[#f5f2eb] mt-1">
                      {auction.product_title || auction.title}
                    </h2>
                    <p className="text-xs text-[#a39e93] mt-2 leading-relaxed whitespace-pre-line">
                      {auction.product_description || auction.description || 'Museum-grade heritage piece made with ancestral handcrafted traditions.'}
                    </p>

                    {/* Catalog Link if present in description */}
                    {(() => {
                      const desc = auction.product_description || auction.description || '';
                      const match = desc.match(/Catalog Reference:\s*(https?:\/\/[^\s]+)/i);
                      if (match && match[1]) {
                        return (
                          <div className="mt-3">
                            <a
                              href={match[1]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e1c18] border border-[#c5a66a]/40 text-[#dfbe7d] hover:text-white hover:border-[#c5a66a] text-xs font-semibold transition-colors"
                            >
                              <ExternalLink size={13} /> View Catalog Reference
                            </a>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  {/* Artisan Seller Card */}
                  <div className="p-4 rounded-xl bg-[#0e0d0c] border border-[#262422] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#c5a66a]/20 border border-[#c5a66a] flex items-center justify-center text-[#c5a66a]">
                        <User size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#f5f2eb]">
                          {auction.seller?.artisan_name || auction.seller?.username || 'Master Artisan'}
                        </h4>
                        <span className="text-[10px] text-[#8e8a83] flex items-center gap-1">
                          <MapPin size={10} /> Certified Heritage Creator
                        </span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                      <ShieldCheck size={12} /> GI Verified
                    </span>
                  </div>
                </div>

                {/* Right Column (6 cols): Bidding Panel & Bid History */}
                <div className="lg:col-span-6 space-y-4">
                  {/* Bidding Panel */}
                  {isLive ? (
                    <BidForm
                      auction={auction}
                      currentUser={currentUser}
                      onBidSuccess={() => fetchDetails(true)}
                      onRequireAuth={onRequireAuth}
                    />
                  ) : (
                    <div className="p-5 rounded-2xl bg-[#121110] border border-[#2c2824] text-center space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-full bg-[#201e1a] border border-[#333] flex items-center justify-center text-[#c5a66a]">
                        <Gavel size={22} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#f5f2eb]">
                          {auction.status === 'COMPLETED' ? 'Auction Sold & Completed' : 'Auction Not Currently Open for Bids'}
                        </h4>
                        <p className="text-xs text-[#8e8a83] mt-1">
                          Status: <span className="font-mono text-[#c5a66a]">{auction.status}</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Masked Bid History Log */}
                  <BidHistory
                    bids={auction.bids || []}
                    startingPrice={auction.starting_price}
                  />
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

