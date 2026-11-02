import React, { useState, useEffect, useMemo } from 'react';
import {
  Gavel, Flame, Clock, Heart, Award, Plus, Search, Filter,
  ShieldCheck, RefreshCw, Zap, TrendingUp, Sparkles, CheckCircle, AlertCircle
} from 'lucide-react';
import AuctionCard from '../components/AuctionCard';
import AuctionDetailsModal from '../components/AuctionDetailsModal';
import CreateAuctionModal from '../components/CreateAuctionModal';
import AuctionCheckoutModal from '../components/AuctionCheckoutModal';
import { auctionApi } from '../services/auctionApi';

const CATEGORIES = [
  'All',
  'Terracotta Pottery',
  'Handloom Textiles',
  'Brass & Metal Craft',
  'Channapatna Woodcraft',
  'Folk Art & Paintings'
];

export default function AuctionMarketplace({
  currentUser,
  onRequireAuth,
  existingProducts = []
}) {
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'my_bids' | 'watchlist' | 'won' | 'my_auctions'
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('ending_soon'); // 'ending_soon' | 'highest_bid' | 'lowest_bid' | 'most_bids'
  const [statusFilter, setStatusFilter] = useState('LIVE'); // 'ALL' | 'LIVE' | 'SCHEDULED' | 'ENDED'

  // Modal states
  const [selectedAuctionId, setSelectedAuctionId] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [checkoutAuction, setCheckoutAuction] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // User-specific states
  const [myBids, setMyBids] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [wonAuctions, setWonAuctions] = useState([]);
  const [myListings, setMyListings] = useState([]);

  // Fetch explore auctions
  const loadAuctions = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (search.trim()) params.search = search.trim();
      if (sortBy) params.sort_by = sortBy;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const data = await auctionApi.getAuctions(params);
      setAuctions(data.results || data || []);
    } catch (err) {
      setError(err.message || 'Failed to load live auctions.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user specific lists based on active sub-tab
  const loadUserData = async () => {
    if (!currentUser) return;
    try {
      if (activeTab === 'my_bids') {
        const bids = await auctionApi.getMyBids();
        setMyBids(bids || []);
      } else if (activeTab === 'watchlist') {
        const wl = await auctionApi.getWatchlist();
        setWatchlist(wl || []);
      } else if (activeTab === 'won') {
        const won = await auctionApi.getMyWonAuctions();
        setWonAuctions(won || []);
      } else if (activeTab === 'my_auctions') {
        const mine = await auctionApi.getMyAuctions();
        setMyListings(mine || []);
      }
    } catch (err) {
      console.error('Failed loading tab data:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'explore') {
      loadAuctions();
    } else {
      loadUserData();
    }
  }, [activeTab, selectedCategory, sortBy, statusFilter]);

  // Handle Search Debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      if (activeTab === 'explore') loadAuctions();
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Watchlist toggle handler
  const handleToggleWatchlist = async (auctionId, currentlyWatched) => {
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    try {
      await auctionApi.toggleWatchlist(auctionId, currentlyWatched);
      // Update local state
      setAuctions((prev) =>
        prev.map((a) => (a.id === auctionId ? { ...a, is_watchlisted: !currentlyWatched } : a))
      );
      if (activeTab === 'watchlist') {
        loadUserData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open Details Modal
  const handleSelectAuction = (auction) => {
    setSelectedAuctionId(auction.id);
    setIsDetailsOpen(true);
  };

  // Open Checkout Modal
  const handleOpenCheckout = (auction) => {
    setCheckoutAuction(auction);
    setIsCheckoutOpen(true);
  };

  // Delete auction (Creator/Seller only)
  const handleDeleteAuction = async (auctionOrId) => {
    const auctionId = typeof auctionOrId === 'object' ? auctionOrId.id : auctionOrId;
    const auctionTitle = typeof auctionOrId === 'object' ? (auctionOrId.product_title || auctionOrId.title) : 'this auction';
    
    // If called from AuctionCard directly, ask for confirmation
    if (typeof auctionOrId === 'object') {
      if (!window.confirm(`Are you sure you want to delete "${auctionTitle}"? Only you (the creator) can delete it.`)) {
        return;
      }
    }
    try {
      await auctionApi.deleteAuction(auctionId);
      setAuctions((prev) => prev.filter((a) => a.id !== auctionId));
      setMyListings((prev) => prev.filter((a) => a.id !== auctionId));
      if (selectedAuctionId === auctionId) {
        setIsDetailsOpen(false);
        setSelectedAuctionId(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete auction');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a09] text-[#f5f2eb] pb-24">
      {/* Hero Banner */}
      <div className="relative overflow-hidden border-b border-[#2a2622] bg-gradient-to-b from-[#181614] via-[#0f0e0d] to-[#0a0a09]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#c5a66a]/15 border border-[#c5a66a] text-[#dfbe7d]">
                <Flame size={14} className="text-amber-500 animate-pulse" />
                Live English Auction Protocol
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                Kaarvo <span className="text-[#c5a66a]">Masterpiece</span> Auctions
              </h1>
              <p className="text-sm sm:text-base text-[#a39e93] leading-relaxed">
                Direct forward English auctions for rare, GI-certified Indian handicrafts.
                High-concurrency row locking guarantees fair, tamper-proof bidding with server-authoritative closure.
              </p>

              {/* Guarantees Pill Strip */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono text-[#c5a66a]">
                <span className="flex items-center gap-1 bg-[#141210] border border-[#2a2622] px-2.5 py-1 rounded-md">
                  <ShieldCheck size={13} className="text-emerald-400" /> PostgreSQL Row Lock
                </span>
                <span className="flex items-center gap-1 bg-[#141210] border border-[#2a2622] px-2.5 py-1 rounded-md">
                  <Clock size={13} className="text-amber-400" /> Anti-Sniping Protection
                </span>
                <span className="flex items-center gap-1 bg-[#141210] border border-[#2a2622] px-2.5 py-1 rounded-md">
                  <Zap size={13} className="text-cyan-400" /> Razorpay Safe Settlement
                </span>
              </div>
            </div>

            {/* Seller Action Button */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={() => {
                  if (!currentUser) {
                    if (onRequireAuth) onRequireAuth();
                    return;
                  }
                  setIsCreateOpen(true);
                }}
                className="bg-gradient-to-r from-[#c5a66a] to-[#dfbe7d] hover:opacity-95 text-[#121212] font-black text-xs uppercase tracking-wider px-5 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-[#c5a66a]/20"
              >
                <Plus size={16} />
                List Artifact for Auction
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-2 border-b border-[#262422] pb-3 overflow-x-auto">
          {[
            { id: 'explore', label: 'Explore Auctions', icon: Gavel },
            { id: 'my_bids', label: 'My Bids', icon: TrendingUp, authRequired: true },
            { id: 'watchlist', label: 'Watchlist', icon: Heart, authRequired: true },
            { id: 'won', label: 'Won Auctions', icon: Award, authRequired: true },
            { id: 'my_auctions', label: 'Seller Listings', icon: Sparkles, authRequired: true }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.authRequired && !currentUser) {
                    if (onRequireAuth) onRequireAuth();
                    return;
                  }
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#c5a66a] text-[#121212] shadow-md'
                    : 'text-[#a39e93] hover:text-white hover:bg-[#181614]'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Explore Auctions */}
        {activeTab === 'explore' && (
          <div className="space-y-6 pt-6">
            {/* Filter and Search Bar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-[#121110] border border-[#2a2622] p-4 rounded-2xl">
              {/* Search */}
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search live auctions by craft, title, or artisan..."
                  className="w-full bg-[#0a0a09] border border-[#333] focus:border-[#c5a66a] rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Status & Sort Controls */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Status Toggle */}
                <div className="flex items-center bg-[#0a0a09] border border-[#333] rounded-xl p-1 text-[11px] font-bold">
                  {['ALL', 'LIVE', 'SCHEDULED', 'ENDED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        statusFilter === st ? 'bg-[#c5a66a] text-[#121212]' : 'text-[#888] hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {/* Sort dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#0a0a09] border border-[#333] focus:border-[#c5a66a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-bold"
                >
                  <option value="ending_soon">Ending Soonest</option>
                  <option value="highest_bid">Highest Bid Price</option>
                  <option value="lowest_bid">Lowest Starting Price</option>
                  <option value="most_bids">Most Popular (Bid Count)</option>
                </select>

                <button
                  onClick={loadAuctions}
                  className="p-2.5 bg-[#0a0a09] border border-[#333] hover:border-[#c5a66a] text-[#a39e93] hover:text-white rounded-xl transition-colors cursor-pointer"
                  title="Reload Live Grid"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#c5a66a]/20 border border-[#c5a66a] text-[#dfbe7d]'
                      : 'bg-[#141210] border border-[#262422] text-[#8e8a83] hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Auction Cards Grid */}
            {loading ? (
              <div className="text-center py-20">
                <RefreshCw size={36} className="mx-auto text-[#c5a66a] animate-spin mb-3" />
                <p className="text-sm font-semibold text-[#888]">Loading High-Concurrency Artisan Auctions...</p>
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-sm text-center">
                {error}
              </div>
            ) : auctions.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-[#2a2622] rounded-2xl bg-[#0f0e0d]">
                <Gavel size={36} className="mx-auto text-[#666] mb-3" />
                <h3 className="text-base font-bold text-white">No Auctions Found</h3>
                <p className="text-xs text-[#8e8a83] mt-1 max-w-sm mx-auto">
                  No active auctions match your current filters. Try searching for other mastercraft categories or list your own piece!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {auctions.map((auc) => (
                  <AuctionCard
                    key={auc.id}
                    auction={auc}
                    onSelect={handleSelectAuction}
                    onToggleWatchlist={handleToggleWatchlist}
                    onDelete={handleDeleteAuction}
                    isWatchlisted={auc.is_watchlisted}
                    currentUser={currentUser}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: My Bids */}
        {activeTab === 'my_bids' && (
          <div className="space-y-4 pt-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-[#c5a66a]" /> Bids You Have Placed
            </h2>
            {myBids.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-[#2a2622] rounded-2xl bg-[#0f0e0d]">
                <p className="text-sm text-[#888]">You have not submitted any bids yet.</p>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="mt-3 text-xs font-bold uppercase tracking-wider text-[#c5a66a] hover:underline"
                >
                  Explore Live Auctions →
                </button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-[#2a2622] bg-[#121110]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#181614] border-b border-[#2a2622] text-[#8e8a83] uppercase tracking-wider font-bold">
                    <tr>
                      <th className="p-3.5">Auction Item</th>
                      <th className="p-3.5">Your Bid</th>
                      <th className="p-3.5">Highest Bid</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Placed At</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222]">
                    {myBids.map((b) => (
                      <tr key={b.id} className="hover:bg-[#181614] transition-colors">
                        <td className="p-3.5 font-bold text-white">
                          Auction #{b.auction}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-emerald-400">
                          ₹{parseFloat(b.amount).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 font-mono text-[#c5a66a]">
                          ₹{parseFloat(b.amount).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800">
                            Accepted
                          </span>
                        </td>
                        <td className="p-3.5 text-[#888] font-mono text-[11px]">
                          {new Date(b.created_at).toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              setSelectedAuctionId(b.auction);
                              setIsDetailsOpen(true);
                            }}
                            className="text-xs font-bold text-[#c5a66a] hover:underline cursor-pointer"
                          >
                            View Room →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Watchlist */}
        {activeTab === 'watchlist' && (
          <div className="space-y-4 pt-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Heart size={18} className="text-rose-500" /> Your Watched Auctions
            </h2>
            {watchlist.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-[#2a2622] rounded-2xl bg-[#0f0e0d]">
                <p className="text-sm text-[#888]">Your watchlist is empty.</p>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="mt-3 text-xs font-bold uppercase tracking-wider text-[#c5a66a] hover:underline"
                >
                  Browse Auctions to Watch →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {watchlist.map((item) => (
                  <AuctionCard
                    key={item.id}
                    auction={item.auction}
                    onSelect={handleSelectAuction}
                    onToggleWatchlist={handleToggleWatchlist}
                    isWatchlisted={true}
                    currentUser={currentUser}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Won Auctions & Checkout */}
        {activeTab === 'won' && (
          <div className="space-y-4 pt-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Award size={18} className="text-[#c5a66a]" /> Auctions You Have Won
            </h2>
            {wonAuctions.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-[#2a2622] rounded-2xl bg-[#0f0e0d]">
                <p className="text-sm text-[#888]">You have not won any auctions yet. Place competitive bids to win!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {wonAuctions.map((auc) => {
                  const needsPayment = ['PAYMENT_PENDING', 'AWARDED'].includes(auc.status);
                  return (
                    <div
                      key={auc.id}
                      className="p-5 rounded-2xl bg-[#141210] border border-[#2e2a25] flex flex-col sm:flex-row items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={auc.product_image || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80'}
                          alt={auc.product_title || auc.title}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#c5a66a]">
                            Auction #{auc.id} • {auc.status}
                          </span>
                          <h4 className="text-base font-bold text-white">
                            {auc.product_title || auc.title}
                          </h4>
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            Winning Hammer Price: ₹{parseFloat(auc.current_highest_bid).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {needsPayment ? (
                        <button
                          onClick={() => handleOpenCheckout(auc)}
                          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg"
                        >
                          Complete Payment & Checkout →
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {auc.status === 'COMPLETED' ? 'Settled & In Transit' : auc.status}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: My Listed Auctions (Seller) */}
        {activeTab === 'my_auctions' && (
          <div className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-[#c5a66a]" /> Your Listed Auctions
              </h2>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="bg-[#c5a66a] hover:bg-[#dfbe7d] text-black font-black text-xs uppercase tracking-wider px-3.5 py-2 rounded-lg cursor-pointer"
              >
                + New Auction
              </button>
            </div>

            {myListings.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-[#2a2622] rounded-2xl bg-[#0f0e0d]">
                <p className="text-sm text-[#888]">You have not listed any handcrafted items for auction.</p>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="mt-3 text-xs font-bold uppercase tracking-wider text-[#c5a66a] hover:underline"
                >
                  Create Your First Auction Listing →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {myListings.map((auc) => (
                  <AuctionCard
                    key={auc.id}
                    auction={auc}
                    onSelect={handleSelectAuction}
                    onDelete={handleDeleteAuction}
                    currentUser={currentUser}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AuctionDetailsModal
        auctionId={selectedAuctionId}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedAuctionId(null);
        }}
        currentUser={currentUser}
        onRequireAuth={onRequireAuth}
        onDeleteAuction={(deletedId) => handleDeleteAuction(deletedId)}
        onOpenCheckout={(auc) => {
          setIsDetailsOpen(false);
          handleOpenCheckout(auc);
        }}
      />

      <CreateAuctionModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onAuctionCreated={(created) => {
          loadAuctions();
          if (activeTab === 'my_auctions') loadUserData();
        }}
        existingProducts={existingProducts}
      />

      <AuctionCheckoutModal
        auction={checkoutAuction}
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setCheckoutAuction(null);
        }}
        onPaymentSuccess={() => {
          loadAuctions();
          if (activeTab === 'won') loadUserData();
        }}
      />
    </div>
  );
}

