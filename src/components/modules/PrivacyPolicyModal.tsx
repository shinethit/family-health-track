import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  Database, 
  CheckCircle2, 
  X, 
  FileText, 
  UserCheck, 
  HardDrive,
  Globe,
  KeyRound
} from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-teal-50 via-emerald-50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                မူဝါဒ နှင့် ဒေတာ လုံခြုံရေး (Privacy Policy & Security)
              </h3>
              <p className="text-xs text-slate-500">
                လူနာများ၏ ကျန်းမာရေး မှတ်တမ်းများနှင့် ကိုယ်ရေးကိုယ်တာ ကာကွယ်စောင့်ရှောက်မှု
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs text-slate-700 leading-relaxed">
          
          {/* Security Guarantee Box */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>ဒေတာ လုံခြုံရေး ကတိကဝတ် (100% Confidentiality Guarantee):</span>
            </div>
            <p className="leading-relaxed">
              Family Health Track သည် အသုံးပြုသူ လူနာများနှင့် မိသားစုဝင်များ၏ သွေးပေါင်ချိန်၊ ဆီးချို၊ BMI၊ ဓာတ်ခွဲခန်း စစ်ဆေးချက်များနှင့် ဆရာဝန် တိုင်ပင်ချက်များကို လျှို့ဝှက်ချက်အဖြစ် အပြည့်အဝ ထိန်းသိမ်းစောင့်ရှောက်ပေးပါသည်။
            </p>
          </div>

          {/* Core Pillars */}
          <div className="space-y-4">
            
            {/* Pillar 1 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-teal-600" />
                <span>၁။ Cloud Encryption & HIPAA Standards (ဒေတာ ကုဒ်ဝှက်စနစ်)</span>
              </h4>
              <p className="text-slate-600">
                အချက်အလက်များ အားလုံးကို Google Cloud Firestore Server တွင် TLS 1.3 သွေးကြောသုံး ချိတ်ဆက်မှုနှင့် AES-256 Bit Encryption စနစ်ဖြင့် သိုလှောင်ထားပါသည်။ သုံးစွဲသူ အကောင့်ပိုင်ရှင်နှင့် တရားဝင် ဆရာဝန်/Admin မှလွဲ၍ မည်သူမျှ ရယူကြည့်ရှုနိုင်ခြင်း မရှိပါ။
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-rose-600" />
                <span>၂။ အချက်အလက်များ ရောင်းချခြင်း/မျှဝေခြင်း လုံးဝ မပြုလုပ်ခြင်း</span>
              </h4>
              <p className="text-slate-600">
                မိမိတို့ စနစ်သည် လူနာများ၏ မည်သည့် ကိုယ်ရေးကိုယ်တာ အချက်အလက်နှင့် ကျန်းမာရေး မှတ်တမ်းကိုမျှ စီးပွားရေး ကြော်ငြာ ကုမ္ပဏီများ၊ တတိယ အဖွဲ့အစည်း (Third-party) များထံ ရောင်းချခြင်း သို့မဟုတ် လွှဲပြောင်းပေးခြင်း လုံးဝ (လုံးဝ) မပြုလုပ်ပါ။
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span>၃။ လူနာမှ အပြည့်အဝ စီမံခန့်ခွဲခွင့် (Full Data Ownership & Erasure)</span>
              </h4>
              <p className="text-slate-600">
                လူနာသည် မိမိ၏ ကျန်းမာရေး မှတ်တမ်းများကို A4 PDF / Health Passport အဖြစ် ထုတ်ယူနိုင်သည့်အပြင်၊ မလိုအပ်တော့သော မှတ်တမ်းများကို ၁-ချက်နှိပ်ရုံဖြင့် စနစ်အတွင်းမှ အပြီးတိုင် ဖျက်ပစ်နိုင်သော (Cascading Delete) အခွင့်အရေးကို ရရှိပါသည်။
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <span>၄။ Google Sign-In & Secure Authentication</span>
              </h4>
              <p className="text-slate-600">
                Google Firebase Authentication စနစ်ဖြင့် လုံခြုံစိတ်ချစွာ အကောင့်ဝင်ရောက်နိုင်ပြီး Password များအား သိမ်းဆည်းထားခြင်း မရှိဘဲ OAuth Token စနစ်ဖြင့်သာ စိတ်ချစွာ အသုံးပြုနိုင်ပါသည်။
              </p>
            </div>

          </div>

          {/* Contact / Admin info */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>စနစ် ထိန်းသိမ်းသူ: Family Health Portal Team</span>
            <span>နောက်ဆုံး မွမ်းမံမှု: ၂၀၂၆ ခုနှစ် မတ်လ</span>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer transition-colors shadow-xs"
          >
            လက်ခံပါသည်
          </button>
        </div>

      </div>
    </div>
  );
};
