import React, { useState } from 'react';
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Radio, 
  Volume2 
} from 'lucide-react';
import { BroadcastTicker } from '../../../types/health';

interface AdminBroadcastManagerProps {
  tickers: BroadcastTicker[];
  onAddTicker: (message: string, type: 'info' | 'warning' | 'urgent') => Promise<void>;
  onToggleTicker: (id: string, isActive: boolean) => Promise<void>;
  onDeleteTicker: (id: string) => Promise<void>;
}

export const AdminBroadcastManager: React.FC<AdminBroadcastManagerProps> = ({
  tickers,
  onAddTicker,
  onToggleTicker,
  onDeleteTicker,
}) => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'warning' | 'urgent'>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddTicker(message.trim(), type);
      setMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>အရေးပေါ် ကျန်းမာရေး သတင်းလွှာ / Banner စီမံခြင်း (Broadcast News)</span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                {tickers.filter(t => t.isActive).length} ခု လွှင့်နေသည်
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              အပေါ်ဆုံး Marquee Ticker တွင် အသုံးပြုသူအားလုံး မြင်တွေ့နိုင်မည့် ကျန်းမာရေးသတိပေးစာများကို စီမံပါ
            </p>
          </div>
        </div>
      </div>

      {/* Add New Ticker Form */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <label htmlFor="admin-broadcast-message" className="sr-only">သတင်းစကား / သတိပေးချက် ရေးသားပါ</label>
          <input
            id="admin-broadcast-message"
            type="text"
            placeholder="ဥပမာ- ရာသီတုပ်ကွေး ကာကွယ်ဆေး စတင်ထိုးနှံနိုင်ပါပြီ..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="admin-broadcast-type" className="sr-only">သတင်းအမျိုးအစား</label>
          <select
            id="admin-broadcast-type"
            value={type}
            onChange={(e: any) => setType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden"
          >
            <option value="info">ℹ️ အသိပေးချက် (Info)</option>
            <option value="warning">⚠️ သတိပေးချက် (Warning)</option>
            <option value="urgent">🚨 အရေးပေါ် (Urgent)</option>
          </select>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'တင်နေသည်...' : 'သတင်းတင်မည်'}</span>
          </button>
        </div>
      </form>

      {/* Existing Tickers List */}
      {tickers.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {tickers.map((t) => (
            <div 
              key={t.id}
              className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                t.isActive 
                  ? t.type === 'urgent' 
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-200' 
                    : t.type === 'warning'
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200'
                    : 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800 text-teal-950 dark:text-teal-200'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="shrink-0">
                  {t.type === 'urgent' ? '🚨' : t.type === 'warning' ? '⚠️' : '📢'}
                </span>
                <span className={`truncate font-medium ${t.isActive ? '' : 'line-through'}`}>
                  {t.message}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onToggleTicker(t.id, !t.isActive)}
                  className="p-1 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 cursor-pointer"
                  title={t.isActive ? 'ပိတ်မည်' : 'ဖွင့်မည်'}
                  aria-label={t.isActive ? 'သတင်းလွှာ ပိတ်မည်' : 'သတင်းလွှာ ဖွင့်မည်'}
                >
                  {t.isActive ? (
                    <ToggleRight className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteTicker(t.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="ဖျက်မည်"
                  aria-label="သတင်းလွှာ ဖျက်မည်"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
