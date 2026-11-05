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
  // NOTE: dbStats only knows real record counts. The old quota percentage
  // bars compared those counts against hardcoded "50,000/day" / "20,000/day"
  // limits and presented them as live Firebase usage — that was invented,
  // not measured. This banner now shows only the real counts it has; exact
  // Firebase read/write usage and quota live in the Firebase Console
  // (Firestore > Usage), as noted below.
  const lastSync = dbStats?.lastSyncTime ?? '—';

  return (
    <div className="bg-slate-900 text-white p-4 rounded-3xl border border-slate-800 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                Google Firestore Cloud Database (မှတ်တမ်း စာရင်းအင်း)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Live Cloud Mode
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              စနစ်တစ်ခုလုံးရှိ အသုံးပြုသူမှတ်တမ်းများ၊ သွေးပေါင်၊ သကြားဓာတ်၊ ဆေးမှတ်တမ်းများ Cloud ဒေတာဘေ့စ် စာရင်းအင်း
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
          {/* Total Documents */}
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>စုစုပေါင်း မှတ်တမ်းများ</span>
              <HardDrive className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-lg font-extrabold text-white mt-1">
              {(dbStats?.totalDocuments ?? 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">docs</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Users: {dbStats?.totalUsers ?? 0} | Vitals: {(dbStats?.totalBP ?? 0) + (dbStats?.totalGlucose ?? 0) + (dbStats?.totalBMI ?? 0)}
            </div>
          </div>

          {/* Records by type — real counts only */}
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>မှတ်တမ်း အမျိုးအစား</span>
              <Layers className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-[11px] text-slate-300 leading-relaxed">
              <div>သွေးပေါင်: <strong className="text-white">{(dbStats?.totalBP ?? 0).toLocaleString()}</strong> | သွေးချို: <strong className="text-white">{(dbStats?.totalGlucose ?? 0).toLocaleString()}</strong> | BMI: <strong className="text-white">{(dbStats?.totalBMI ?? 0).toLocaleString()}</strong></div>
              <div>Lab: <strong className="text-white">{(dbStats?.totalLabs ?? 0).toLocaleString()}</strong> | ဆေး: <strong className="text-white">{(dbStats?.totalMeds ?? 0).toLocaleString()}</strong> | ကာကွယ်ဆေး: <strong className="text-white">{(dbStats?.totalVaccines ?? 0).toLocaleString()}</strong></div>
            </div>
          </div>

          {/* Users, questions & advice — real counts only */}
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>အသုံးပြုသူနှင့် ဆက်သွယ်မှု</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-[11px] text-slate-300 leading-relaxed">
              <div>အသုံးပြုသူများ: <strong className="text-white">{(dbStats?.totalUsers ?? 0).toLocaleString()}</strong></div>
              <div>ဆရာဝန် မေးခွန်း: <strong className="text-white">{(dbStats?.totalQuestions ?? 0).toLocaleString()}</strong> | အကြံပြုချက်: <strong className="text-white">{(dbStats?.totalAdvices ?? 0).toLocaleString()}</strong></div>
            </div>
          </div>

          {/* Sync Status */}
          <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Database Status</span>
              <Layers className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Online & Synced</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>နောက်ဆုံး စစ်ဆေးချိန်: {lastSync}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-400">
        <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
        <span>Firebase ရဲ့ အတိအကျ အသုံးပြုမှု (read/write အရေအတွက်) နဲ့ quota ကို Firebase Console &gt; Firestore &gt; Usage မှာ ကြည့်နိုင်ပါသည် — ဒီစာမျက်နှာက မှတ်တမ်းအရေအတွက်ကိုသာ ပြထားပါသည်။</span>
      </div>
    </div>
  );
};
