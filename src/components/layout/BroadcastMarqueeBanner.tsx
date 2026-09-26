import React, { useState } from 'react';
import { 
  Volume2, 
  AlertTriangle, 
  Info, 
  Flame, 
  X, 
  ShieldCheck, 
  Sparkles,
  Pause,
  Play
} from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';

export const BroadcastMarqueeBanner: React.FC = () => {
  const { broadcastTickers } = useHealthData();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const activeTickers = broadcastTickers?.filter(t => t.isActive) || [];

  if (isDismissed || activeTickers.length === 0) {
    return null;
  }

  // Combine all active ticker messages
  const combinedMessage = activeTickers.map(t => t.message).join('  ✦✦✦  ');
  const hasUrgent = activeTickers.some(t => t.type === 'urgent');
  const hasWarning = activeTickers.some(t => t.type === 'warning');

  const bannerStyle = hasUrgent
    ? 'bg-rose-600 text-white border-b border-rose-700'
    : hasWarning
    ? 'bg-amber-500 text-slate-950 border-b border-amber-600 font-semibold'
    : 'bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 text-white border-b border-teal-900';

  const badgeStyle = hasUrgent
    ? 'bg-white text-rose-700'
    : hasWarning
    ? 'bg-slate-900 text-amber-300'
    : 'bg-white/20 text-white border border-white/30';

  return (
    <div className={`w-full text-xs py-2 px-3 sm:px-4 ${bannerStyle} shadow-xs relative z-30 transition-all flex items-center justify-between gap-3 overflow-hidden`}>
      {/* Left Badge */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 uppercase tracking-wider ${badgeStyle}`}>
          {hasUrgent ? (
            <>
              <Flame className="w-3 h-3 text-rose-600 animate-bounce" />
              <span>အရေးပေါ် အသိပေးချက်</span>
            </>
          ) : hasWarning ? (
            <>
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              <span>ကျန်းမာရေး သတိပေးချက်</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3 h-3" />
              <span>တိုက်ရိုက် အသိပေးစာတန်း</span>
            </>
          )}
        </span>
      </div>

      {/* Center Marquee Content */}
      <div className="flex-1 overflow-hidden relative cursor-default">
        <div 
          className={`whitespace-nowrap flex items-center gap-8 ${isPaused ? '' : 'animate-marquee'}`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <span className="font-medium tracking-wide">
            {combinedMessage}
          </span>
          <span className="font-medium tracking-wide" aria-hidden="true">
            ✦✦✦  {combinedMessage}
          </span>
        </div>
      </div>

      {/* Right Controls (Pause & Dismiss) */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="p-1 rounded-md hover:bg-white/20 transition-colors cursor-pointer text-[10px] font-bold"
          title={isPaused ? "ပြန်ဖွင့်မည် (Play)" : "ခေတ္တရပ်မည် (Pause)"}
        >
          {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 rounded-md hover:bg-white/20 transition-colors cursor-pointer"
          title="ပိတ်မည်"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
