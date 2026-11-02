import React from 'react';
import { History, Crown, ShieldCheck, Clock } from 'lucide-react';

export default function BidHistory({ bids = [], startingPrice = 0 }) {
  if (!bids || bids.length === 0) {
    return (
      <div className="text-center py-8 px-4 rounded-xl border border-dashed border-[#2c2824] bg-[#0f0e0d]">
        <History className="mx-auto text-[#666] mb-2" size={28} />
        <p className="text-sm font-semibold text-[#f5f2eb]">No bids submitted yet</p>
        <p className="text-xs text-[#8e8a83] mt-1">
          Be the pioneer bidder! The opening bid begins at ₹{parseFloat(startingPrice).toLocaleString('en-IN')}.
        </p>
      </div>
    );
  }

  // Format date helper
  const formatTime = (ts) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch (e) {
      return 'Just now';
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-[#2a2622] bg-[#121110]">
      <div className="p-3 bg-[#181614] border-b border-[#2a2622] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History size={15} className="text-[#c5a66a]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#f5f2eb]">
            Bid History Log ({bids.length} {bids.length === 1 ? 'Bid' : 'Bids'})
          </h4>
        </div>
        <span className="text-[10px] text-[#8e8a83] flex items-center gap-1 font-mono">
          <ShieldCheck size={12} className="text-emerald-500" />
          Server-Verified Concurrency
        </span>
      </div>

      <div className="max-h-60 overflow-y-auto divide-y divide-[#222]">
        {bids.map((bid, index) => {
          const isHighest = index === 0;
          return (
            <div
              key={bid.id || `bid-${index}`}
              className={`p-3 flex items-center justify-between transition-colors ${
                isHighest
                  ? 'bg-[#c5a66a]/10 border-l-4 border-l-[#c5a66a]'
                  : 'hover:bg-[#181614]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isHighest ? (
                  <div className="w-7 h-7 rounded-full bg-[#c5a66a]/20 border border-[#c5a66a] flex items-center justify-center text-[#c5a66a]">
                    <Crown size={14} />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#222] border border-[#333] flex items-center justify-center text-[10px] font-mono text-[#888]">
                    #{bids.length - index}
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#f5f2eb] font-mono">
                      {bid.bidder_name || 'Anonymous Collector'}
                    </span>
                    {isHighest && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#c5a66a] text-[#121212]">
                        Leading Bid
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#8e8a83] flex items-center gap-1 mt-0.5">
                    <Clock size={10} /> {formatTime(bid.created_at)}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-black font-mono text-[#dfbe7d]">
                  ₹{parseFloat(bid.amount).toLocaleString('en-IN')}
                </span>
                <span className="block text-[9px] uppercase tracking-wider text-emerald-400">
                  Accepted
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

