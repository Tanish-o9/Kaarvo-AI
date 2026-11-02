import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export default function CountdownTimer({ endTime, onExpire, compact = false }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const end = new Date(endTime).getTime();
    const now = Date.now();
    const diff = end - now;

    if (diff <= 0) {
      return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    return { total: diff, days, hours, minutes, seconds, expired: false };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const updated = calculateTimeLeft();
      setTimeLeft(updated);
      if (updated.expired) {
        clearInterval(timer);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  if (timeLeft.expired) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase bg-red-900/30 border border-red-800/60 text-red-400">
        Auction Closed
      </span>
    );
  }

  const isUrgent = timeLeft.total <= 300000; // less than 5 minutes
  const pad = (n) => String(n).padStart(2, '0');

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 font-mono text-[11px] font-bold ${
        isUrgent ? 'text-red-400 animate-pulse' : 'text-[#dfbe7d]'
      }`}>
        <Clock size={12} />
        {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
        {pad(timeLeft.hours)}h:{pad(timeLeft.minutes)}m:{pad(timeLeft.seconds)}s
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all ${
      isUrgent 
        ? 'bg-red-950/40 border-red-600/80 text-red-300' 
        : 'bg-[#181614] border-[#38342e] text-[#f5f2eb]'
    }`}>
      {isUrgent ? (
        <AlertTriangle size={16} className="text-red-400 animate-bounce" />
      ) : (
        <Clock size={16} className="text-[#c5a66a]" />
      )}

      <div className="flex items-center gap-1.5 font-mono text-sm font-bold tracking-wider">
        {timeLeft.days > 0 && (
          <>
            <div className="flex flex-col items-center">
              <span>{pad(timeLeft.days)}</span>
              <span className="text-[9px] text-[#8e8a83] uppercase -mt-1">days</span>
            </div>
            <span>:</span>
          </>
        )}
        <div className="flex flex-col items-center">
          <span>{pad(timeLeft.hours)}</span>
          <span className="text-[9px] text-[#8e8a83] uppercase -mt-1">hrs</span>
        </div>
        <span>:</span>
        <div className="flex flex-col items-center">
          <span>{pad(timeLeft.minutes)}</span>
          <span className="text-[9px] text-[#8e8a83] uppercase -mt-1">min</span>
        </div>
        <span>:</span>
        <div className="flex flex-col items-center">
          <span className={isUrgent ? 'text-red-400 font-extrabold' : 'text-[#dfbe7d]'}>{pad(timeLeft.seconds)}</span>
          <span className="text-[9px] text-[#8e8a83] uppercase -mt-1">sec</span>
        </div>
      </div>

      {isUrgent && (
        <span className="ml-auto text-[10px] uppercase font-bold text-red-400 tracking-wider animate-pulse">
          ⚡ Anti-Sniping Active
        </span>
      )}
    </div>
  );
}

