import React, { useState } from 'react';
import {
  Wrench,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useHealthData } from '../../../context/HealthDataContext';

interface RepairResult {
  checked: number;
  fixed: number;
  alreadyOk: number;
  errors: string[];
}

export const AdminDataRepair: React.FC = () => {
  const { isAdmin } = useAuth();
  const { repairPatientEmails } = useHealthData();

  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<RepairResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isAdmin) return null;

  const handleRepair = async () => {
    setIsRunning(true);
    setResult(null);
    setError(null);
    try {
      const res = await repairPatientEmails();
      setResult(res);
    } catch (err: any) {
      setError(err?.message || 'ပြင်ဆင်ရာတွင် အမှားဖြစ်ပေါ်ခဲ့ပါသည်။');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
          <Wrench className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">
            ဒေတာ ပြန်ပြင်ခြင်း (Data Repair)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            အရင်က patientEmail မှားနေတာ / မပါတာကြောင့် လူနာဘက်မှာ မပေါ်တဲ့ မှတ်တမ်းဟောင်းတွေကို တစ်ခါတည်း ပြန်ပြင်ပေးပါမယ်။ ပြင်ပြီးရင် လူနာဘက်က ပြန်ဖွင့်ကြည့်ရင် မှတ်တမ်းတွေ ပြန်ပေါ်လာပါမယ်။
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleRepair}
          disabled={isRunning}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          aria-label="စစ်ဆေးပြီး ပြင်မည်"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'လုပ်ဆောင်နေသည်...' : 'စစ်ဆေးပြီး ပြင်မည်'}</span>
        </button>
        <span className="text-[11px] text-slate-400">
          တစ်ခါလုပ်ပြီးရင် ထပ်လုပ်စရာ မလိုပါ။
        </span>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>ပြီးပါပြီ — လူနာဘက်က ပြန်ဖွင့်ကြည့်ပါ</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="bg-white p-3 rounded-xl border border-emerald-100">
              <div className="text-slate-500">စစ်ဆေးခဲ့သော မှတ်တမ်းများ</div>
              <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                {result.checked.toLocaleString()} <span className="text-xs font-normal text-slate-400">ခု</span>
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-emerald-100">
              <div className="text-slate-500">ပြင်ဆင်ခဲ့သော မှတ်တမ်းများ</div>
              <div className="text-lg font-extrabold text-emerald-700 mt-0.5">
                {result.fixed.toLocaleString()} <span className="text-xs font-normal text-slate-400">ခု</span>
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-emerald-100">
              <div className="text-slate-500">အဆင်ပြေပြီးသား မှတ်တမ်းများ</div>
              <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                {result.alreadyOk.toLocaleString()} <span className="text-xs font-normal text-slate-400">ခု</span>
              </div>
            </div>
          </div>
          {result.errors && result.errors.length > 0 && (
            <div className="pt-2 border-t border-emerald-100">
              <div className="text-[11px] font-bold text-rose-700 mb-1">
                ပြင်မရတဲ့ အမှားများ ({result.errors.length} ခု):
              </div>
              <ul className="space-y-1 max-h-40 overflow-y-auto">
                {result.errors.slice(0, 10).map((e, i) => (
                  <li key={i} className="text-[11px] text-rose-700 bg-white px-2.5 py-1.5 rounded-lg border border-rose-100 break-words">
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDataRepair;
