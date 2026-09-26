import React, { useState } from 'react';
import { 
  BookOpen, 
  Activity, 
  Droplets, 
  Scale, 
  Pill, 
  Stethoscope, 
  ShieldCheck, 
  Smartphone, 
  Printer, 
  X, 
  ChevronRight, 
  Search, 
  CheckCircle2, 
  AlertTriangle,
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface GuideSection {
  id: string;
  title: string;
  icon: any;
  category: string;
  summary: string;
  steps: string[];
  tips: string[];
  medicalNote?: string;
}

const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'bp',
    title: '၁။ သွေးပေါင်ချိန် (BP) မှတ်တမ်းတင်နည်း',
    icon: Activity,
    category: 'ကျန်းမာရေး ခြေရာခံခြင်း',
    summary: 'နေ့စဉ် သွေးပေါင်ချိန်နှင့် နှလုံးခုန်နှုန်း (Pulse) များကို အချိန်နှင့်တပြေးညီ မှတ်တမ်းတင်ကာ AHA စံနှုန်းဖြင့် စစ်ဆေးနည်း',
    steps: [
      'အပေါ် Tab များမှ "သွေးပေါင်ချိန် (BP)" ကို နှိပ်ပါ',
      'အပေါ်သွေး (Systolic)၊ အောက်သွေး (Diastolic) နှင့် နှလုံးခုန်နှုန်း (Pulse) တို့ကို ရိုက်ထည့်ပါ',
      'တိုင်းတာသည့် အချိန် (မနက်စာမစားမီ၊ ညအိပ်ရာမဝင်မီ စသည်) နှင့် မှတ်ချက် ရွေးချယ်ပါ',
      '"မှတ်တမ်းသိမ်းမည်" ကို နှိပ်လိုက်ပါက စနစ်က Normal, Elevated, Stage 1, Stage 2 သို့မဟုတ် Crisis အဖြစ် အလိုအလျောက် ခွဲခြားသတ်မှတ်ပေးပါသည်'
    ],
    tips: [
      'သွေးပေါင်မတိုင်းမီ အနည်းဆုံး ၅ မိနစ်ခန့် ငြိမ်သက်စွာ ထိုင်နားပါ',
      'ကော်ဖီ၊ လက်ဖက်ရည် သို့မဟုတ် ဆေးလိပ် သောက်ပြီး နာရီဝက်အတွင်း သွေးပေါင်မတိုင်းသင့်ပါ'
    ],
    medicalNote: 'AHA စံနှုန်းအရ အပေါ်သွေး ၁၂၀ အောက်နှင့် အောက်သွေး ၈၀ အောက်သည် ပုံမှန် (Normal) ဖြစ်ပါသည်။'
  },
  {
    id: 'glucose',
    title: '၂။ ဆီးချို / သွေးတွင်းသကြားဓာတ် (Glucose) မှတ်တမ်းတင်နည်း',
    icon: Droplets,
    category: 'ကျန်းမာရေး ခြေရာခံခြင်း',
    summary: 'အစာမစားမီ (Fasting)၊ အစာစားပြီး ၂ နာရီ နှင့် အိပ်ရာမဝင်မီ သွေးချိုပမာဏများကို ADA စံနှုန်းဖြင့် စစ်ဆေးခြင်း',
    steps: [
      'အပေါ် Tab များမှ "ဆီးချို (Glucose)" ကို နှိပ်ပါ',
      'သွေးတွင်းသကြားဓာတ် ပမာဏ (mg/dL) ကို ရိုက်ထည့်ပါ',
      'တိုင်းတာသည့် အခြေအနေ (အစာမစားမီ အစာငတ်ထားချိန် / အစာစားပြီး ၂ နာရီ / အိပ်ရာမဝင်မီ) ကို ရွေးချယ်ပါ',
      '"မှတ်တမ်းသိမ်းမည်" ကို နှိပ်ပါက Normal, Prediabetes, Diabetes သို့မဟုတ် Hypoglycemia (သွေးချိုကျခြင်း) သတိပေးချက်များ ပြသပေးပါသည်'
    ],
    tips: [
      'Fasting (အစာမစားမီ) တိုင်းတာရန် အနည်းဆုံး ၈ နာရီကြာ အစာမစားဘဲ နေရပါမည်',
      'Postprandial (အစာစားပြီး) တိုင်းတာရန် အစားစတင်စားသည့်အချိန်မှ ၂ နာရီတိတိ ပြည့်ချိန်တွင် တိုင်းပါ'
    ],
    medicalNote: 'Fasting သွေးချို ၇၀ မှ ၉၉ mg/dL သည် ပုံမှန်ဖြစ်ပြီး ၁၂၆ mg/dL နှင့် အထက်သည် ဆီးချိုအဆင့် ဖြစ်ပါသည်။'
  },
  {
    id: 'bmi',
    title: '၃။ BMI & ခန္ဓာကိုယ်အချိုးအစား တွက်ချက်နည်း',
    icon: Scale,
    category: 'ကျန်းမာရေး ခြေရာခံခြင်း',
    summary: 'မွေးသက္ကရာဇ်မှ အသက်ကို တိကျစွာ တွက်ချက်ခြင်းနှင့် WHO Asia-Pacific စံနှုန်းဖြင့် ခန္ဓာကိုယ် အလေးချိန် သတ်မှတ်ခြင်း',
    steps: [
      '"ခန္ဓာကိုယ်အချိုး (BMI)" Tab ကို နှိပ်ပါ',
      'အရပ် (cm သို့မဟုတ် ပေ/လက်မ) နှင့် ကိုယ်အလေးချိန် (kg သို့မဟုတ် ပေါင်) ကို ဖြည့်ပါ',
      'စနစ်က BMI တန်ဖိုးကို အလိုအလျောက် တွက်ချက်ပေးပြီး ပိန်လွန်း၊ ပုံမှန်၊ အဝလွန် အဆင့်များကို ပြသပေးပါမည်'
    ],
    tips: [
      'ကိုယ်အလေးချိန်ကို မနက်အိပ်ရာထ အပေါ့သွားပြီးချိန်တွင် ချိန်တွယ်ပါက အတိကျဆုံး ဖြစ်ပါသည်'
    ]
  },
  {
    id: 'meds',
    title: '၄။ ဆေးဝါးသောက်သုံးမှု သတိပေးချက် (Medications)',
    icon: Pill,
    category: 'ဆေးဝါးနှင့် ကုသမှု',
    summary: 'သောက်သုံးနေသော ဆေးအမည်များ၊ သောက်ရမည့် အကြိမ်ရေနှင့် အချိန်များကို စနစ်တကျ မှတ်သားခြင်း',
    steps: [
      '"ဆေးဝါးများ (Medications)" Tab သို့ သွားပါ',
      'ဆေးအမည်၊ ပမာဏ (Dosage ဥပမာ- 5mg) နှင့် သောက်ရမည့်အချိန် (မနက်/နေ့လယ်/ည) ကို ထည့်ပါ',
      'ဆေးသောက်ပြီးပါက "သောက်ပြီးကြောင်း အမှန်ခြစ်" နှိပ်နိုင်ပါသည်'
    ],
    tips: [
      'ဆေးဝါးသောက်သုံးရန် မမေ့စေရန် App ၏ Notification Center မှ အချိန်မှန် သတိပေးပါလိမ့်မည်'
    ]
  },
  {
    id: 'doctor_qa',
    title: '၅။ ဆရာဝန်ထံ မေးမြန်းခြင်း (Doctor Q&A)',
    icon: Stethoscope,
    category: 'ဆေးဝါးနှင့် ကုသမှု',
    summary: 'ကျန်းမာရေးဆိုင်ရာ မရှင်းလင်းသည်များကို ဆရာဝန်ထံ တိုက်ရိုက် မေးမြန်းပြီး အကြံဉာဏ် ရယူခြင်း',
    steps: [
      '"ဆရာဝန်မေးမြန်းမှု" Tab သို့ သွားပါ',
      'မိမိသိလိုသော ရောဂါလက္ခဏာ သို့မဟုတ် ကျန်းမာရေး မေးခွန်းကို ရိုက်ထည့်ပြီး ပေးပို့ပါ',
      'အက်ဒမင်/ဆရာဝန်မှ ပြန်လည်ဖြေကြားထားသော အကြံပြုချက်များကို ချက်ချင်း ဖတ်ရှုနိုင်ပါသည်'
    ],
    tips: [
      'အရေးပေါ် အခြေအနေများတွင် နီးစပ်ရာ ဆေးရုံ/ဆေးခန်းသို့ အမြန်ဆုံး သွားရောက်ပြသပါ'
    ]
  },
  {
    id: 'admin',
    title: '၆။ Master Admin Portal စီမံခန့်ခွဲမှု',
    icon: ShieldCheck,
    category: 'အက်ဒမင် စီမံခန့်ခွဲမှု',
    summary: 'အက်ဒမင် (Admin) မှ လူနာအားလုံး၏ စာရင်းကို အချိန်နှင့်တပြေးညီ ကြည့်ရှုစောင့်ကြည့်ခြင်း',
    steps: [
      'အက်ဒမင် အကောင့်ဖြင့် Login ဝင်ရောက်ပါ',
      'Admin Dashboard ပေါ်တွင် အကောင့်ဖွင့်ထားသော လူနာများ စာရင်းကို အချိန်နှင့်တပြေးညီ တွေ့မြင်ရပါမည်',
      'လူနာအမည်ကို နှိပ်လိုက်ပါက ထိုလူနာ၏ BP, Glucose, BMI, ဆေးဝါးများနှင့် ကျန်းမာရေးဂရပ်များကို Clinical Dashboard အဖြစ် အသေးစိတ် ကြည့်ရှုနိုင်ပါသည်',
      'လူနာထံသို့ သီးသန့် ဆေးဝါး/အစားအသောက် အကြံပြုချက်များ (Doctor Advice) ရေးသားပေးပို့နိုင်ပါသည်'
    ],
    tips: [
      'လူနာအသစ်များ ဝင်ရောက်လာပါက "အချက်အလက် ပြန်ဆွဲမည် (Refresh)" ခလုတ်ကို နှိပ်၍ အချိန်မရွေး Update လုပ်နိုင်ပါသည်'
    ]
  },
  {
    id: 'pwa',
    title: '၇။ ဖုန်းထဲသို့ Mobile App အဖြစ် ထည့်သွင်းနည်း (PWA)',
    icon: Smartphone,
    category: 'အက်ပလီကေးရှင်း အသုံးပြုမှု',
    summary: 'Play Store / App Store မလိုဘဲ ဖုန်း Screen ပေါ်သို့ တကယ့် App အဖြစ် ထည့်သွင်းအသုံးပြုနည်း',
    steps: [
      'ဖုန်း Browser (Chrome / Safari) ဖြင့် WebApp Link ကို ဖွင့်ပါ',
      'Android ဖုန်းများအတွက်: အပေါ်ဘားရှိ "App ထည့်သွင်းမည်" ခလုတ်ကို နှိပ်ပါ (သို့မဟုတ် Chrome Menu ⋮ ထဲမှ Add to Home Screen ကို နှိပ်ပါ)',
      'iPhone/iPad များအတွက်: Safari အောက်ဘက်က Share ခလုတ် (မျှားပုံ) ကို နှိပ်ပြီး "Add to Home Screen" ကို ရွေးပါ'
    ],
    tips: [
      'App ထည့်သွင်းပြီးပါက အင်တာနက်လိုင်း မရှိသည့်အချိန် (Offline) တွင်လည်း ဖွင့်လှစ် အသုံးပြုနိုင်ပါသည်'
    ]
  },
  {
    id: 'pdf',
    title: '၈။ ကျန်းမာရေး အစီရင်ခံစာ (PDF Print) ထုတ်ယူနည်း',
    icon: Printer,
    category: 'အက်ပလီကေးရှင်း အသုံးပြုမှု',
    summary: 'ဆရာဝန်ထံ သွားရောက်ပြသချိန်တွင် အလွယ်တကူ ပြသနိုင်ရန် ကျန်းမာရေးမှတ်တမ်းများကို PDF အဖြစ် ထုတ်ယူခြင်း',
    steps: [
      'Navbar ညာဘက်အပေါ်ထောင့်ရှိ ပရင်တာပုံစံ (Printer) အိုင်ကွန်ကို နှိပ်ပါ',
      'Print Preview စာမျက်နှာတွင် "Save as PDF" ကို ရွေးချယ်ပြီး ဖုန်း သို့မဟုတ် ကွန်ပျူတာထဲသို့ ဒေါင်းလုဒ်ရယူနိုင်ပါသည်'
    ],
    tips: [
      'ဆေးခန်းမသွားမီ ရက်သတ္တပတ် ၁ ပတ် သို့မဟုတ် ၁ လစာ သွေးပေါင်နှင့် ဆီးချိုမှတ်တမ်းကို PDF ထုတ်ယူသွားပါ'
    ]
  }
];

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
  const [selectedGuideId, setSelectedGuideId] = useState<string>('bp');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredGuides = GUIDE_SECTIONS.filter(g => 
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeGuide = GUIDE_SECTIONS.find(g => g.id === selectedGuideId) || GUIDE_SECTIONS[0];
  const ActiveIcon = activeGuide.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-900/10 via-teal-900/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  အသုံးပြုနည်း လမ်းညွှန် (User Guide)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  စုံလင်စွာ လမ်းညွှန်ချက်
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Family Health Track အသုံးပြုနည်းနှင့် ကျန်းမာရေး စောင့်ရှောက်မှု အဆင့်ဆင့်
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Sidebar List & Detail View */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
          {/* Left Column: Topics Search & List */}
          <div className="md:col-span-4 p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="လမ်းညွှန် ရှာဖွေရန်..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            {/* List of Guides */}
            <div className="space-y-1.5 overflow-y-auto max-h-[calc(90vh-180px)] pr-1">
              {filteredGuides.map((guide) => {
                const isSelected = guide.id === selectedGuideId;
                const Icon = guide.icon;
                return (
                  <button
                    key={guide.id}
                    onClick={() => setSelectedGuideId(guide.id)}
                    className={`w-full text-left p-2.5 sm:p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-300 dark:hover:border-emerald-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-xl shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold truncate">{guide.title}</div>
                        <div className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                          {guide.category}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Guide Details */}
          <div className="md:col-span-8 p-5 sm:p-6 space-y-6 overflow-y-auto">
            {/* Guide Header Banner */}
            <div className="flex items-start gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <ActiveIcon className="w-6 h-6" />
              </div>
              <div className="space-y-1 flex-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  {activeGuide.category}
                </span>
                <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {activeGuide.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeGuide.summary}
                </p>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>လုပ်ဆောင်ရန် အဆင့်များ</span>
              </h5>
              <div className="space-y-2.5">
                {activeGuide.steps.map((step, idx) => (
                  <div 
                    key={idx} 
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-extrabold flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Helpful Tips */}
            {activeGuide.tips.length > 0 && (
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>အထောက်အကူပြု အကြံပြုချက်များ</span>
                </h5>
                <div className="space-y-2">
                  {activeGuide.tips.map((tip, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medical Note */}
            {activeGuide.medicalNote && (
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-200">
                <AlertTriangle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">ဆေးပညာဆိုင်ရာ သတ်မှတ်ချက်: </span>
                  <span>{activeGuide.medicalNote}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between text-xs text-slate-500">
          <span>Family Health Track Manual</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-semibold text-white transition-colors cursor-pointer shadow-xs"
          >
            သိရှိပါပြီ
          </button>
        </div>
      </div>
    </div>
  );
};
