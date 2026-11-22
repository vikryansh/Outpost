import React, { useRef, useEffect } from 'react';
import { Terminal, ShieldCheck } from 'lucide-react';

export default function EventTicker({ events }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <footer className="h-28 bg-frontier-950 border-t border-frontier-800 flex flex-col px-4 py-2 select-none z-30 font-mono shadow-2xl">
      {/* Ticker Header */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-frontier-900 pb-1 mb-1">
        <div className="flex items-center space-x-1.5 text-cyan-400 font-bold">
          <Terminal className="w-3.5 h-3.5" />
          <span>AUTHORITATIVE LIVE EVENT TICKER (SOCKET.IO FEED)</span>
        </div>
        <div className="flex items-center space-x-1.5 text-emerald-400 text-[10px]">
          <ShieldCheck className="w-3 h-3" />
          <span>PUSH-AFTER-COMMIT GUARANTEED</span>
        </div>
      </div>

      {/* Terminal Scrolling Log */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 text-xs custom-scrollbar">
        {events.length === 0 ? (
          <div className="text-slate-600 text-[11px]">Awaiting multiplayer events...</div>
        ) : (
          events.map((evt, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-slate-300">
              <span className="text-slate-600 text-[10px] whitespace-nowrap">
                {new Date(evt.timestamp || evt.created_at).toLocaleTimeString()}
              </span>
              <span className="text-cyan-400 font-bold">»</span>
              <span className="text-slate-200">
                {evt.message || `${evt.event_type} event by Player #${evt.player_id}`}
              </span>
            </div>
          ))
        )}
      </div>
    </footer>
  );
}
