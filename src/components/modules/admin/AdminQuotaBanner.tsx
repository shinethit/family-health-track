import React from 'react';
import { Server, RefreshCw } from 'lucide-react';
import { DatabaseStats } from '../../../context/HealthDataContext';

interface AdminQuotaBannerProps {
  dbStats: DatabaseStats | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const AdminQuotaBanner: React.FC<AdminQuotaBannerProps> = ({
  dbStats,
  isRefreshing,
  onRefresh,
}) => {
  // NOTE: dbStats only knows real record counts. The old quota percentage
  // bars compared those counts against hardcoded "50,000/day" / "20,000/day"
  // limits and presented them as live Firebase usage — that was invented,
  // not measured. This banner shows only the real counts it has; exact
  // Firebase read/write usage and quota live in the Firebase Console
  // (Firestore > Usage).
  // v2.4.24: one compact card instead of 4 big stat cards. Every real
  // count is kept (total docs, Users, Vitals, BP, glucose, BMI, Lab, meds,
  // vaccines, questions, advice) plus the Online & Synced status and the
  // last-sync time. The two verbose Burmese paragraphs (header description
  // + Firebase Console footer note) are deleted, the "Live Cloud Mode"
  // pill is gone (it duplicated the Online & Synced status row), and the
  // collapse toggle is gone — the stats are always shown.
  const lastSync = dbStats?.lastSyncTime ?? '—';
  const vitals =
    (dbStats?.totalBP ?? 0) + (dbStats?.totalGlucose ?? 0) + (dbStats?.totalBMI ?? 0);

  const rows: Array<{ label: string; value: React.ReactNode }> = [
    {
      label: 'စုစုပေါင်း မှတ်တမ်း',
      value: (
        <>
          <span className="text-white">{(dbStats?.totalDocuments ?? 0).toLocaleString()}</span>{' '}
          <span className="text-[10px] font-normal text-slate-400">docs</span>
        </>
      ),
    },
    { label: 'အသုံးပြုသူများ', value: (dbStats?.totalUsers ?? 0).toLocaleString() },
    { label: 'Vitals (စုစုပေါင်း)', value: vitals.toLocaleString() },
    { label: 'သွေးပေါင်', value: (dbStats?.totalBP ?? 0).toLocaleString() },
    { label: 'သွေးချို', value: (dbStats?.totalGlucose ?? 0).toLocaleString() },
    { label: 'BMI', value: (dbStats?.totalBMI ?? 0).toLocaleString() },
    { label: 'Lab', value: (dbStats?.totalLabs ?? 0).toLocaleString() },
    { label: 'ဆေး', value: (dbStats?.totalMeds ?? 0).toLocaleString() },
    { label: 'ကာကွယ်ဆေး', value: (dbStats?.totalVaccines ?? 0).toLocaleString() },
    { label: 'ဆရာဝန် မေးခွန်း', value: (dbStats?.totalQuestions ?? 0).toLocaleString() },
    { label: 'အကြံပြုချက်', value: (dbStats?.totalAdvices ?? 0).toLocaleString() },
  ];

  return (
    <div className="bg-slate-900 text-white px-3 py-2.5 rounded-2xl border border-slate-800 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
            <Server className="w-4 h-4" />
          </div>
          <h2 className="text-[13px] font-bold text-white truncate">Firestore Database</h2>
        </div>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
          title="Database ဒေတာများ ပြန်လည်ဆွဲယူမည်"
          aria-label="Database ဒေတာများ ပြန်လည်ဆွဲယူမည်"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal-400' : ''}`} />
          <span>{isRefreshing ? 'ဒေတာဆွဲယူနေသည်...' : 'ဒေတာဆန်းသစ်မည်'}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-3 mt-2 pt-2 border-t border-slate-800/80">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-2 py-0.5">
            <span className="text-[11px] text-slate-400 truncate">{row.label}</span>
            <span className="text-xs font-bold text-white shrink-0">{row.value}</span>
          </div>
        ))}
        <div className="col-span-2 flex items-center gap-1.5 pt-1.5 mt-0.5 border-t border-slate-800/80">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-xs font-bold text-emerald-400">Online & Synced</span>
          <span className="text-[11px] text-slate-400 truncate">
            · နောက်ဆုံး စစ်ဆေးချိန်: {lastSync}
          </span>
        </div>
      </div>
    </div>
  );
};
