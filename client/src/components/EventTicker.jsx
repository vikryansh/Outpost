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
    <footer className="h-28 bg-[#020617] border-t-2 border-frontier-800 flex flex-col px-5 py-2.5 select-none z-40 font-mono shadow-2xl relative scanlines">
      {/* Ticker Header */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-frontier-900 pb-1.5 mb-1.5">
        <div className="flex items-center space-x-2 text-cyan-400 font-extrabold tracking-wider">
          <Terminal className="w-4 h-4 animate-pulse text-cyan-400" />
          <span>AUTHORITATIVE LIVE EVENT TICKER // COMMITTED POSTGRES STREAM</span>
        </div>
        <div className="flex items-center space-x-1.5 text-emerald-400 text-[10px] font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>PUSH-AFTER-COMMIT GUARANTEE</span>
        </div>
      </div>

      {/* Terminal Scrolling Log */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1.5 text-xs custom-scrollbar pr-2">
        {events.length === 0 ? (
          <div className="text-slate-600 text-xs">Awaiting multiplayer actions...</div>
        ) : (
          events.map((evt, idx) => (
            <div key={idx} className="flex items-start space-x-2.5 text-slate-300">
              <span className="text-slate-600 text-[10px] whitespace-nowrap font-semibold">
                [{new Date(evt.timestamp || evt.created_at).toLocaleTimeString()}]
              </span>
              <span className="text-cyan-400 font-extrabold">»</span>
              <span className="text-slate-200 tracking-wide">
                {evt.message || `${evt.event_type} event by Player #${evt.player_id}`}
              </span>
            </div>
          ))
        )}
      </div>
    </footer>
  );
}
