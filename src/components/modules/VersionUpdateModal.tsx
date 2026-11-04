import React from 'react';
import { Sparkles } from 'lucide-react';
import { VERSION_HISTORY_DATA } from './VersionHistoryModal';
import { Modal } from '../common/Modal';
import { clearVersionUpdatePromptShown } from '../../lib/versionCheck';

interface VersionUpdateModalProps {
  // The version of the deploy being offered — null when the prompt is for
  // a pending reload whose version string is NOT known (v2.4.16, H-H1):
  // the served bundle's version cannot be derived from its hash, so the
  // modal must not invent one or show the OLD version's highlights as
  // "what's new".
  latestAppVersion: string | null;
  onClose: () => void;
  onOpenFullHistory: () => void;
  // True when a newer deploy was detected while this (old) bundle is still
  // loaded — the update is NOT installed yet, a reload is needed.
  pendingReload?: boolean;
}

export const VersionUpdateModal: React.FC<VersionUpdateModalProps> = ({
  latestAppVersion,
  onClose,
  onOpenFullHistory,
  pendingReload = false,
}) => {
  const currentVersionInfo = latestAppVersion
    ? VERSION_HISTORY_DATA.find(v => v.version === latestAppVersion) || VERSION_HISTORY_DATA[0]
    : null;

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
          {pendingReload ? '🎉 ဗားရှင်းအသစ် ရပါပြီ!' : '🎉 အက်ပ်ဗားရှင်းအသစ်သို့ တင်မြှင့်ပြီးပါပြီ!'}
        </h3>
        <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-1">
          {pendingReload ? (
            latestAppVersion ? (
              <>ဗားရှင်း <strong className="text-teal-600 font-bold">{latestAppVersion}</strong> ကို ရယူရန် စာမျက်နှာကို ပြန်ဖွင့်ပေးပါ။</>
            ) : (
              <>ဗားရှင်းအသစ် ရောက်ရှိနေပါသည် — စာမျက်နှာကို ပြန်ဖွင့်ပြီး အသစ်ရယူပါ။</>
            )
          ) : (
            <>ဗားရှင်း <strong className="text-teal-600 font-bold">{latestAppVersion}</strong> သို့ အလိုအလျောက် အပ်ဒိတ်လုပ်ပြီးစီးပါပြီ။</>
          )}
        </p>

        {/* Dynamic highlights directly from the active version — only when
            the version is actually known (v2.4.16, H-H1). For a pending
            reload with an unknown version, showing the OLD version's
            highlights as "what's new" would be a lie, so only a short note
            is shown instead. */}
        {currentVersionInfo ? (
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
        ) : (
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 text-center">
            ဗားရှင်းအသစ်မှာ ဘာတွေ ပါလဲ ဆိုတာ ပြန်ဖွင့်ပြီးမှ Version History မှာ ကြည့်နိုင်ပါသည်။
          </div>
        )}

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
            onClick={() => {
              if (pendingReload) {
                // v2.4.16 (H-H2): forget the "already shown" marker before
                // reloading, so a reload that still serves the stale bundle
                // can prompt again instead of going silent.
                clearVersionUpdatePromptShown();
                window.location.reload();
              } else {
                onClose();
              }
            }}
            className="flex-1 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer text-center"
          >
            {pendingReload ? 'ပြန်ဖွင့်မည်' : 'စတင်အသုံးပြုမည်'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default VersionUpdateModal;
