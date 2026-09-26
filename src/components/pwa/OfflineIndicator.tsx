import React, { useEffect, useState } from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3500);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (showReconnected) {
    return (
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-2xl bg-emerald-600 text-white px-3.5 py-2 text-xs font-semibold shadow-xl animate-in slide-in-from-bottom duration-300">
        <CheckCircle2 className="w-4 h-4 text-emerald-200" />
        <span>အင်တာနက် ပြန်လည် ချိတ်ဆက်မိပါပြီ (Online)</span>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-2xl bg-amber-600 text-white px-3.5 py-2 text-xs font-semibold shadow-xl animate-in slide-in-from-bottom duration-300">
        <span className="h-2 w-2 rounded-full bg-white animate-ping" />
        <WifiOff className="w-4 h-4 text-amber-200" />
        <span>အော့ဖ်လိုင်း အခြေအနေ (Offline Mode - သိမ်းဆည်းထားသော အချက်အလက်များကို ကြည့်ရှုနေပါသည်)</span>
      </div>
    );
  }

  return null;
};
