import React from 'react';
import { 
  Server, 
  Sparkles, 
  RefreshCw, 
  ChevronUp, 
  ChevronDown, 
  HardDrive, 
  Layers, 
  Clock, 
  Info 
} from 'lucide-react';
import { DatabaseStats } from '../../../context/HealthDataContext';

interface AdminQuotaBannerProps {
  dbStats: DatabaseStats | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  showQuotaDetails: boolean;
  onToggleQuotaDetails: () => void;
}

export const AdminQuotaBanner: React.FC<AdminQuotaBannerProps> = ({
  dbStats,
  isRefreshing,
  onRefresh,
  showQuotaDetails,
  onToggleQuotaDetails,
}) => {
  const reads = dbStats?.totalDocuments ?? 0;
  const writes = dbStats ? (dbStats.totalBP + dbStats.totalGlucose + dbStats.totalBMI) : 0;
  const readsMax = dbStats?.dailyReadQuota ?? 50000;
  const writesMax = dbStats?.dailyWriteQuota ?? 20000;

  const readsPercent = Math.min(100, Math.round((reads / readsMax) * 100));
  const writesPercent = Math.min(100, Math.round((writes / writesMax) * 100));

  return (
    <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                Google Firestore Cloud Database (အသုံးပြုမှု & Quota)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Live Cloud Mode
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              စနစ်တစ်ခုလုံးရှိ လူနာမှတ်တမ်းများ၊ သွေးပေါင်၊ သကြားဓာတ်၊ ဆေးမှတ်တမ်းများ Cloud ဒေတာဘေ့စ် စာရင်းအင်း
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Database ဒေတာများ ပြန်လည်ဆွဲယူမည်"
            aria-label="Database ဒေတာများ ပြန်လည်ဆွဲယူမည်"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal-400' : ''}`} />
            <span>{isRefreshing ? 'ဒေတာဆွဲယူနေသည်...' : 'ဒေတာဆန်းသစ်မည်'}</span>
          </button>

          <button
            onClick={onToggleQuotaDetails}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            title={showQuotaDetails ? 'အသေးစိတ် ဝှက်မည်' : 'အသေးစိတ် ကြည့်မည်'}
            aria-label={showQuotaDetails ? 'အသေးစိတ် ဝှက်မည်' : 'အသေးစိတ် ကြည့်မည်'}
          >
            {showQuotaDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {showQuotaDetails && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
          {/* Total Documents */}
          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>စုစုပေါင်း မှတ်တမ်းများ</span>
              <HardDrive className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-xl font-extrabold text-white mt-1">
              {(dbStats?.totalDocuments ?? 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">docs</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Users: {dbStats?.totalUsers ?? 0} | Vitals: {(dbStats?.totalBP ?? 0) + (dbStats?.totalGlucose ?? 0) + (dbStats?.totalBMI ?? 0)}
            </div>
          </div>

          {/* Daily Reads Quota */}
          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>နေ့စဉ် Read Quota</span>
              <span className="text-xs font-bold text-teal-400">{readsPercent}%</span>
            </div>
            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${readsPercent > 80 ? 'bg-rose-500' : readsPercent > 50 ? 'bg-amber-400' : 'bg-teal-400'}`}
                style={{ width: `${readsPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{reads.toLocaleString()} / {readsMax.toLocaleString()}</span>
              <span>အခမဲ့ 50,000/day</span>
            </div>
          </div>

          {/* Daily Writes Quota */}
          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>နေ့စဉ် Write Quota</span>
              <span className="text-xs font-bold text-amber-400">{writesPercent}%</span>
            </div>
            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${writesPercent > 80 ? 'bg-rose-500' : writesPercent > 50 ? 'bg-amber-400' : 'bg-amber-400'}`}
                style={{ width: `${writesPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{writes.toLocaleString()} / {writesMax.toLocaleString()}</span>
              <span>အခမဲ့ 20,000/day</span>
            </div>
          </div>

          {/* Storage & Sync Status */}
          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Database Status</span>
              <Layers className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Online & Synced</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>နောက်ဆုံး စစ်ဆေးချိန်: {new Date().toLocaleTimeString('my-MM')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
