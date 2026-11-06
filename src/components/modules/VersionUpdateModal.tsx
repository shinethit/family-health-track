import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { VERSION_HISTORY_DATA } from './VersionHistoryModal';
import { Modal } from '../common/Modal';

import type { ServedVersionHighlights } from '../../lib/versionCheck';
import { markVersionUpdateReloadAttempted, reloadForUpdate } from '../../lib/versionCheck';

interface VersionUpdateModalProps {
  // The version of the deploy being offered — null when the prompt is for
  // a pending reload whose version string could NOT be read from the
  // served bundle (v2.4.16, H-H1; v2.4.20 extracts it from the served
  // bundle, so null now only means the extraction failed). The modal
  // must not invent a version or show the OLD version's highlights as
  // "what's new".
  latestAppVersion: string | null;
  // v2.4.21: the served version's change summary (title + up to 4
  // bullets) extracted from the served bundle itself. Shown IN the modal
  // so the user sees WHAT was fixed without opening Version History.
  // Null when it could not be extracted — the modal then falls back to
  // the honest note. Never the OLD version's highlights.
  servedHighlights?: ServedVersionHighlights | null;
  onClose: () => void;
  onOpenFullHistory: () => void;
  // True when a newer deploy was detected while this (old) bundle is still
  // loaded — the update is NOT installed yet, a reload is needed.
  pendingReload?: boolean;
  // v2.4.25: the served bundle hash of the pending update, so the reload
  // button can record the reload attempt for THIS deploy (the re-prompt
  // guard is keyed by hash). Null when unknown — the reload still works,
  // only the re-prompt record is skipped.
  servedHash?: string | null;
}

export const VersionUpdateModal: React.FC<VersionUpdateModalProps> = ({
  latestAppVersion,
  servedHighlights = null,
  onClose,
  onOpenFullHistory,
  pendingReload = false,
  servedHash = null,
}) => {
  // v2.4.25: honest in-modal progress while the service-worker update is
  // in flight after the user taps "ပြန်ဖွင့်မည်" — on slow mobile data
  // the SW download may take seconds, and the tap must not look dead.
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStage, setUpdateStage] = useState<'checking' | 'activating' | null>(null);
  // v2.4.20: when the offered version is NOT in this (old) bundle's
  // history — i.e. it is a genuinely newer deploy — there are NO
  // highlights to show, only the honest note below. The old
  // `|| VERSION_HISTORY_DATA[0]` fallback showed the OLD version's
  // highlights as "what's new", the exact H-H1 lie v2.4.16 fixed.
  const currentVersionInfo = latestAppVersion
    ? VERSION_HISTORY_DATA.find(v => v.version === latestAppVersion) ?? null
    : null;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      size="md"
      showHeader={false}
    >
      <div className="p-3">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3 mx-auto">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>

        <h3 className="text-base font-bold text-center text-slate-900 dark:text-white">
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

        {/* What was fixed, IN the modal (v2.4.21). Priority:
            1. the SERVED version's summary, extracted from its own bundle
               — this is what the user asked for ("at least a summary of
               what was fixed, like the other apps");
            2. this bundle's own history entry — only when the offered
               version IS in this bundle's history (the post-upgrade case);
            3. the honest note — never the OLD version's highlights as the
               new version's (v2.4.16, H-H1; v2.4.20 ?? null rule). */}
        {servedHighlights ? (
          <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs text-slate-700 dark:text-slate-300 max-h-64 overflow-y-auto">
            <div className="font-bold flex items-center gap-1.5 text-teal-700 dark:text-teal-300 text-xs">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping shrink-0" />
              <span>{servedHighlights.title}</span>
            </div>

            <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400 pl-2 pt-2 border-t border-slate-200/80 dark:border-slate-700">
              {servedHighlights.items.slice(0, 4).map((item, idx) => (
                <li key={idx} className="leading-relaxed flex items-start gap-1.5">
                  <span className="text-teal-500 shrink-0 font-bold">›</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : currentVersionInfo ? (
          <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs text-slate-700 dark:text-slate-300 max-h-64 overflow-y-auto">
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
          <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 text-center">
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
            onClick={async () => {
              if (pendingReload) {
                // v2.4.25: ONE tap must actually land the new version.
                // A plain window.location.reload() asks the OLD service
                // worker for the page, and the old SW serves the OLD
                // precached bundle — the user stayed on the old version
                // until a LATER reload. reloadForUpdate() forces the SW
                // to fetch the new deploy now, waits for it to activate,
                // and only then reloads. The attempt is recorded FIRST,
                // so if this reload still serves the old bundle, the
                // once-per-deploy guard allows ONE more prompt for this
                // deploy (bounded — never on every focus event).
                if (isUpdating) return;
                if (servedHash) markVersionUpdateReloadAttempted(servedHash);
                setIsUpdating(true);
                await reloadForUpdate({
                  onProgress: (stage) => setUpdateStage(stage),
                });
                // reloadForUpdate always reloads (or the new SW's
                // activation does) — reaching here means the reload did
                // not happen, so reset the button for another tap.
                setIsUpdating(false);
                setUpdateStage(null);
              } else {
                onClose();
              }
            }}
            disabled={isUpdating}
            className={`flex-1 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer text-center ${isUpdating ? 'opacity-60 cursor-wait' : ''}`}
          >
            {pendingReload
              ? isUpdating
                ? updateStage === 'activating'
                  ? 'အသစ်ရယူနေသည်...'
                  : 'အသစ်စစ်ဆေးနေသည်...'
                : 'ပြန်ဖွင့်မည်'
              : 'စတင်အသုံးပြုမည်'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default VersionUpdateModal;
