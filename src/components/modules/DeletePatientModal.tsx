import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  AlertTriangle, 
  UserX, 
  Layers, 
  Activity, 
  CheckSquare, 
  Square,
  ShieldAlert
} from 'lucide-react';
import { UserProfile } from '../../types/health';

interface DeletePatientModalProps {
  isOpen: boolean;
  patient: UserProfile | null;
  onClose: () => void;
  onConfirmDelete: (id: string, cascade: boolean) => Promise<void>;
}

export const DeletePatientModal: React.FC<DeletePatientModalProps> = ({
  isOpen,
  patient,
  onClose,
  onConfirmDelete,
}) => {
  if (!isOpen || !patient) return null;

  const [cascade, setCascade] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMsg(null);
    try {
      await onConfirmDelete(patient.id, cascade);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'လူနာမှတ်တမ်း ဖျက်ရာတွင် အမှားအယွင်း ဖြစ်ပေါ်ခဲ့ပါသည်');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                လူနာမှတ်တမ်း အပြီးဖျက်ပစ်မည်
              </h3>
              <p className="text-xs text-rose-500 font-semibold">
                Permanent Patient Deletion
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Warning Box */}
        <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 dark:text-rose-200 space-y-1">
              <p className="font-bold">
                ဤလူနာမှတ်တမ်းအား အပြီးတိုင် ဖျက်ပစ်ရန် သေချာပါသလား?
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                ဖျက်ပစ်လိုက်သော အချက်အလက်များကို နောက်ပိုင်းတွင် ပြန်လည်ရယူနိုင်မည် မဟုတ်ပါ။ မှားယွင်းနေသော သို့မဟုတ် စမ်းသပ်ထည့်သွင်းထားသော မှတ်တမ်းများကို သန့်စင်ရန် ဤလုပ်ဆောင်ချက်ကို အသုံးပြုနိုင်ပါသည်။
              </p>
            </div>
          </div>

          {/* Patient Card Preview */}
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/40 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                {patient.displayName || 'အမည်မရှိ'}
              </span>
              <span className="font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                ID: {patient.id}
              </span>
            </div>
            <div className="text-slate-500 text-[11px] space-y-0.5">
              <div>အီးမေးလ်: <strong>{patient.email || '-'}</strong></div>
              <div>ဖုန်းနံပါတ်: <strong>{patient.phone || '-'}</strong></div>
              <div>အသက်: <strong>{patient.age ? `${patient.age} နှစ်` : '-'}</strong> • ကျား/မ: {patient.gender === 'female' ? 'မ' : patient.gender === 'male' ? 'ကျား' : '-'}</div>
            </div>
          </div>
        </div>

        {/* Cascade Option */}
        <div 
          onClick={() => !isDeleting && setCascade(!cascade)}
          className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        >
          <div className="mt-0.5 text-indigo-600 dark:text-indigo-400 shrink-0">
            {cascade ? (
              <CheckSquare className="w-4 h-4 text-indigo-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <div className="text-xs space-y-0.5">
            <div className="font-bold text-slate-800 dark:text-slate-200">
              ဆက်စပ် ဆေးမှတ်တမ်းများအားလုံးပါ တစ်ပြိုင်နက် ဖျက်မည် (Cascade Delete)
            </div>
            <div className="text-[11px] text-slate-500 leading-normal">
              ဤလူနာ၏ သွေးပေါင်ချိန် (BP)၊ သွေးချို (Glucose)၊ BMI၊ ဓာတ်ခွဲခန်းစစ်ဆေးချက်များနှင့် သောက်ဆေးမှတ်တမ်းများအားလုံးပါ Cloud Database မှ အပြီးတိုင် ရှင်းထုတ်ပေးမည်ဖြစ်ပါသည်။
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition-all cursor-pointer text-xs"
          >
            မဖျက်တော့ပါ (Cancel)
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-rose-600/20 text-xs"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? 'ဖျက်ပစ်နေပါသည်...' : 'အတည်ပြု ဖျက်ပစ်မည်'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
