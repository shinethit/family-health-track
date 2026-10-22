import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface MedicalDisclaimerProps {
  variant?: 'standard' | 'compact' | 'print' | 'banner';
  className?: string;
}

export const MedicalDisclaimer: React.FC<MedicalDisclaimerProps> = ({ 
  variant = 'standard',
  className = '' 
}) => {
  if (variant === 'compact') {
    return (
      <div className={`p-3 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-amber-950 text-[11px] leading-relaxed flex items-start gap-2 ${className}`}>
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-900">ဆေးဘက်ဆိုင်ရာ သတိပေးချက်: </span>
          <span>
            ဤအချက်အလက်များသည် ကျန်းမာရေး အထောက်အကူပြု ဗဟုသုတအဖြစ်သာ ရည်ရွယ်ပြီး ဆရာဝန်၏ တိုက်ရိုက် ရောဂါရှာဖွေမှုနှင့် ဆေးကုသမှုများကို အစားမထိုးနိုင်ပါ။ ဆေးဘက်ဆိုင်ရာ ဆုံးဖြတ်ချက်များအတွက် ကျွမ်းကျင်ဆရာဝန်နှင့် အမြဲမပြတ် တိုင်ပင်ဆွေးနွေးပါ။
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'print') {
    return (
      <div className={`p-3.5 rounded-xl border border-slate-300 bg-slate-50 text-[10px] text-slate-700 leading-relaxed my-3 ${className}`}>
        <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
          <span>ဆေးဘက်ဆိုင်ရာ တာဝန်ခံမှု ကင်းလွတ်ခွင့်နှင့် သတိပေးချက် (Medical Disclaimer)</span>
        </div>
        <p>
          ဤ ကျန်းမာရေး အစီရင်ခံစာနှင့် မှတ်တမ်းများသည် လူနာကိုယ်တိုင် ထည့်သွင်းထားသော အချက်အလက်များအပေါ် အခြေခံထားပြီး အထောက်အကူပြု မှတ်တမ်းအဖြစ်သာ အသုံးပြုရန် ဖြစ်ပါသည်။ ဆရာဝန်၏ တိုက်ရိုက် ဆေးစစ်ချက်၊ ရောဂါရှာဖွေမှုနှင့် ကုသမှုဆိုင်ရာ ညွှန်ကြားချက်များကို အစားမထိုးနိုင်ပါ။ ဆေးဝါးနှင့် ကျန်းမာရေးဆိုင်ရာ အရေးကြီး ဆုံးဖြတ်ချက်များအတွက် သက်ဆိုင်ရာ အထူးကုဆရာဝန်နှင့်သာ တိုက်ရိုက် ပြသဆွေးနွေးတိုင်ပင်ပါရန်။
        </p>
      </div>
    );
  }

  return (
    <div className={`mt-6 p-4 rounded-3xl bg-amber-50/70 border border-amber-200/90 text-amber-950 text-xs leading-relaxed shadow-2xs ${className}`}>
      <div className="flex items-center gap-2 font-extrabold text-amber-900 text-xs mb-1.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>⚠️ အရေးကြီး ဆေးဘက်ဆိုင်ရာ သတိပေးချက် (Medical Disclaimer)</span>
      </div>
      <p className="text-slate-700">
        ဤ အက်ပလီကေးရှင်းပါ အချက်အလက်များ၊ ကျန်းမာရေး တွက်ချက်မှုများနှင့် လမ်းညွှန်ချက်များသည် အထောက်အကူပြု ဗဟုသုတအဖြစ်သာ ရည်ရွယ်ပြီး ဆရာဝန်၏ တိုက်ရိုက် ရောဂါရှာဖွေမှုနှင့် ဆေးကုသမှုများကို အစားမထိုးနိုင်ပါ။ ဆေးဘက်ဆိုင်ရာ ဆုံးဖြတ်ချက်များအတွက် ကျွမ်းကျင်ဆရာဝန်နှင့် အမြဲမပြတ် တိုင်ပင်ဆွေးနွေးပါ။
      </p>
    </div>
  );
};
export default MedicalDisclaimer;
