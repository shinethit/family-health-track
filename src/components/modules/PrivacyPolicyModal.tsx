import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  Database, 
  X, 
  UserCheck, 
  KeyRound,
  Stethoscope
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      showHeader={false}
      className="max-h-[90vh]"
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-teal-50 via-emerald-50 to-transparent shrink-0">
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
            type="button"
            onClick={onClose}
            aria-label="ပိတ်မည်"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs text-slate-700 leading-relaxed">
          
          {/* Overview Box */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>ကိုယ်ရေးကိုယ်တာ အချက်အလက် ကာကွယ်ရေး မူဝါဒ</span>
            </div>
            <p className="leading-relaxed">
              Family Health Track သည် အသုံးပြုသူများ၏ ကျန်းမာရေးမှတ်တမ်းများကို လုံခြုံစိတ်ချစွာ စီမံခန့်ခွဲနိုင်ရန် တည်ဆောက်ထားပြီး ဒေတာများကို ပွင့်လင်းမြင်သာမှုရှိစွာ ထိန်းသိမ်းပါသည်။
            </p>
          </div>

          {/* Core Pillars */}
          <div className="space-y-4">
            
            {/* Pillar 1 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-teal-600" />
                <span>၁။ သိမ်းဆည်းထားသော အချက်အလက်များနှင့် သိုလှောင်မှု (Data Stored in Google Firebase)</span>
              </h4>
              <p className="text-slate-600 leading-relaxed">
                အသုံးပြုသူ ကိုယ်တိုင် ထည့်သွင်းထားသော သွေးပေါင်ချိန်၊ သွေးတွင်းသကြားဓာတ်၊ BMI ညွှန်းကိန်း၊ ဓာတ်ခွဲခန်း ဆေးစစ်ချက်များ၊ ဆေးဝါးမှတ်တမ်းများနှင့် အကောင့်အချက်အလက်များကို Google Cloud Firebase (Firestore) Cloud Database ပေါ်တွင် စနစ်တကျ လုံခြုံစွာ သိုလှောင်ထားရှိပါသည်။
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-indigo-600" />
                <span>၂။ စီမံခန့်ခွဲသူများ လူနာမှတ်တမ်း ကြည့်ရှုခွင့် (Administrator & Doctor Record Access)</span>
              </h4>
              <p className="text-slate-600 leading-relaxed">
                စနစ်တွင် သတ်မှတ်ထားသော စီမံခန့်ခွဲသူ (Admin/ဆရာဝန်) များသည် လူနာများ၏ သွေးပေါင်၊ ဆီးချို၊ ဆေးမှတ်တမ်း၊ ကာကွယ်ဆေးနှင့် ဓာတ်ခွဲခန်းမှတ်တမ်းများကို ဆေးပညာဆိုင်ရာ အကြံပြုချက်ပေးရန်၊ စောင့်ရှောက်မှုကြီးကြပ်ရန်နှင့် မေးခွန်းများကို ဖြေကြားပေးရန်အတွက် တိုက်ရိုက် ကြည့်ရှုခွင့် ရရှိပါသည်။
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-rose-600" />
                <span>၃။ ဒေတာ ထုတ်ယူခွင့်နှင့် အကောင့်ဖျက်သိမ်းခွင့် (Export & Permanent Account Deletion Rights)</span>
              </h4>
              <p className="text-slate-600 leading-relaxed">
                အသုံးပြုသူများသည် မိမိတို့၏ ကျန်းမာရေးမှတ်တမ်းအားလုံး (သွေးပေါင်၊ သွေးချို၊ ဆေးဝါး၊ ကာကွယ်ဆေး စသည်) ကို JSON နှင့် CSV ဖိုင်များအဖြစ် အချိန်မရွေး Export ဒေါင်းလုဒ်ဆွဲ ထုတ်ယူနိုင်ပါသည်။ ထို့အပြင် "အကောင့်ဖျက်သိမ်းမည် (Delete Account)" စနစ်မှတစ်ဆင့် မိမိတို့၏ မှတ်တမ်းအားလုံးနှင့် အကောင့်ကို စနစ်အတွင်းမှ လုံးဝ အပြီးတိုင် ဖျက်ပစ်နိုင်ခွင့် အပြည့်အဝ ရှိပါသည်။
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <span>၄။ အကောင့်ဝင်ရောက်မှုနှင့် စကားဝှက် လုံခြုံရေး (Firebase Authentication)</span>
              </h4>
              <p className="text-slate-600 leading-relaxed">
                အကောင့်ဝင်ရောက်မှုကို Google Firebase Authentication (Email/Password နှင့် Google Sign-In) စနစ်ဖြင့် လုံခြုံစွာ စီမံထားပါသည်။ အသုံးပြုသူ၏ Password များကို စနစ်က ရိုးရိုးစာသားဖြင့် သိမ်းဆည်းထားခြင်း မရှိပါ။
              </p>
            </div>

            {/* Pillar 5 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-emerald-600" />
                <span>၅။ အချက်အလက်များ ပြင်ပသို့ ရောင်းချခြင်း မပြုလုပ်ခြင်း</span>
              </h4>
              <p className="text-slate-600 leading-relaxed">
                လူနာများ၏ ကျန်းမာရေးနှင့် ကိုယ်ရေးကိုယ်တာ အချက်အလက်များကို ကြော်ငြာကုမ္ပဏီများ သို့မဟုတ် ပြင်ပ တတိယအဖွဲ့အစည်းများထံ ရောင်းချခြင်း သို့မဟုတ် မျှဝေခြင်း လုံးဝ မပြုလုပ်ပါ။
              </p>
            </div>

          </div>

          {/* Contact / Admin info */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>စနစ် ထိန်းသိမ်းသူ: Family Health Track Team</span>
            <span>နောက်ဆုံး မွမ်းမံမှု: ၂၀၂၆ ခုနှစ်</span>
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
    </Modal>
  );
};
