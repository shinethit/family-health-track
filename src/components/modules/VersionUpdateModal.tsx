import React from 'react';
import { Sparkles } from 'lucide-react';
import { VERSION_HISTORY_DATA } from './VersionHistoryModal';
import { Modal } from '../common/Modal';

interface VersionUpdateModalProps {
  latestAppVersion: string;
  onClose: () => void;
  onOpenFullHistory: () => void;
}

export const VersionUpdateModal: React.FC<VersionUpdateModalProps> = ({
  latestAppVersion,
  onClose,
  onOpenFullHistory,
}) => {
  const currentVersionInfo = VERSION_HISTORY_DATA.find(v => v.version === latestAppVersion) || VERSION_HISTORY_DATA[0];

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      size="md"
      showHeader={false}
    >
      <div className="p-6">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3 mx-auto">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>

        <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white">
          🎉 အက်ပ်ဗားရှင်းအသစ်သို့ တင်မြှင့်ပြီးပါပြီ!
        </h3>
        <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-1">
          ဗားရှင်း <strong className="text-teal-600 font-bold">{latestAppVersion}</strong> သို့ အလိုအလျောက် အပ်ဒိတ်လုပ်ပြီးစီးပါပြီ။
        </p>

        {/* Dynamic highlights directly from the active version */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs text-slate-700 dark:text-slate-300 max-h-64 overflow-y-auto">
          <div className="font-bold flex items-center gap-1.5 text-teal-700 dark:text-teal-300 text-xs">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping shrink-0" />
            <span>{currentVersionInfo.title}</span>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-200/80 dark:border-slate-700">
            {currentVersionInfo.highlights.map((h, i) => (
              <div key={i} className="space-y-1">
                <p className="font-bold text-[11px] text-slate-800 dark:text-slate-200">
                  {h.title}
                </p>
                <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400 pl-2">
                  {h.items.slice(0, 3).map((item, idx) => (
                    <li key={idx} className="leading-relaxed flex items-start gap-1.5">
                      <span className="text-teal-500 shrink-0 font-bold">›</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenFullHistory();
            }}
            className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer text-center"
          >
            Change Log အပြည့်အစုံ
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer text-center"
          >
            စတင်အသုံးပြုမည်
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default VersionUpdateModal;
