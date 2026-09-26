import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running as an installed PWA, hide the install button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={async () => {
          setIsInstalling(true);
          try {
            await install();
          } finally {
            setIsInstalling(false);
          }
        }}
        disabled={isInstalling}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-900 hover:from-purple-600 hover:to-indigo-800 text-amber-200 border border-amber-400/40 shadow-md hover:shadow-amber-500/20 text-xs font-semibold transition-all cursor-pointer ${className}`}
        title="ဖုန်း သို့မဟုတ် ကွန်ပျူတာတွင် App အဖြစ် ထည့်သွင်းမည် (Install App)"
      >
        <div className="w-4 h-4 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-300">
          <Download className="w-2.5 h-2.5" />
        </div>
        <span className="font-myanmar font-medium">App ထည့်သွင်းမည်</span>
        <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-900 text-amber-200 border border-amber-400/30 text-xs font-semibold transition-all cursor-pointer ${className}`}
          title="iPhone / iPad တွင် App ထည့်သွင်းနည်း"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-myanmar font-medium">iOS တွင် ထည့်သွင်းမည်</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-purple-800/80 p-6 shadow-2xl text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-950 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-xs">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-amber-100 font-myanmar">
                    iPhone / iPad တွင် App ထည့်သွင်းနည်း
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300 font-myanmar">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/40">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-purple-950 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                  <p>Safari Browser ၏ အောက်ခြေရှိ <strong>Share (မျှဝေရန်)</strong> ခလုတ်ကို နှိပ်ပါ။</p>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/40">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-purple-950 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                  <p>အောက်သို့ အနည်းငယ်ဆွဲချပြီး <strong>"Add to Home Screen (ပင်မမျက်နှာပြင်သို့ ထည့်မည်)"</strong> ကို ရွေးချယ်ပါ။</p>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/40">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-purple-950 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                  <p>ညာဘက်အပေါ်ထောင့်ရှိ <strong>"Add (ထည့်သွင်းမည်)"</strong> ကို နှိပ်လိုက်ပါက ဖုန်းမျက်နှာပြင်တွင် App အဖြစ် အမြဲတမ်း အသုံးပြုနိုင်ပါပြီ။</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-amber-200 font-semibold text-xs transition-colors cursor-pointer border border-amber-400/30"
              >
                နားလည်ပါပြီ (Close)
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback if browser ambient prompt is waiting or manual instructions
  return (
    <button
      onClick={() => {
        alert('App အဖြစ် ထည့်သွင်းရန် Browser Menu (⋮) ကို နှိပ်ပြီး "Add to Home screen" သို့မဟုတ် "Install App" ကို ရွေးချယ်နိုင်ပါသည်');
      }}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-900/80 text-amber-200 border border-amber-400/30 text-xs font-semibold transition-all cursor-pointer ${className}`}
      title="App အဖြစ် ထည့်သွင်းရန်"
    >
      <Download className="w-3.5 h-3.5 text-amber-400" />
      <span className="font-myanmar text-[11px] hidden sm:inline">PWA App သွင်းမည်</span>
    </button>
  );
};
