import React, { useState } from 'react';
import { 
  History, 
  Sparkles, 
  CheckCircle2, 
  Tag, 
  Calendar, 
  X, 
  ChevronRight, 
  ShieldCheck, 
  Smartphone, 
  Activity, 
  Stethoscope,
  Database
} from 'lucide-react';

interface VersionItem {
  version: string;
  releaseDate: string;
  isLatest?: boolean;
  title: string;
  badge: string;
  badgeColor: string;
  highlights: {
    title: string;
    icon: any;
    items: string[];
  }[];
}

const VERSION_HISTORY_DATA: VersionItem[] = [
  {
    version: 'v1.3.0',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာ',
    isLatest: true,
    title: 'Admin Master Portal & Version History & User Guide System',
    badge: 'လက်ရှိ ဗားရှင်း',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    highlights: [
      {
        title: '👑 Master Admin & Real-time User Tracking',
        icon: ShieldCheck,
        items: [
          'အက်ဒမင် (shinethitsmt@gmail.com) မှ လူနာများ အကောင့်သစ်ဖွင့်သည်နှင့် အချိန်နှင့်တပြေးညီ သိရှိစောင့်ကြည့်နိုင်ခြင်း',
          'လူနာတစ်ဦးချင်းစီ၏ အသက်၊ ကျား/မ၊ BMI၊ နာတာရှည်ရောဂါများနှင့် နေ့စဉ်ကျန်းမာရေး အချက်အလက်များကို Clinical Dashboard ဖြင့် စောင့်ကြည့်နိုင်ခြင်း',
          'Firestore Real-time Syncing စနစ်ဖြင့် စက်အမျိုးမျိုး (Multi-device) မှ ဝင်ရောက်အသုံးပြုနိုင်ခြင်း'
        ]
      },
      {
        title: '📜 Version History & အသုံးပြုနည်းလမ်းညွှန် (User Guide)',
        icon: History,
        items: [
          'စနစ်အတွင်း ပြောင်းလဲပြင်ဆင်မှုများအားလုံးကို အသေးစိတ် ကြည့်ရှုနိုင်သော Version History System',
          'အသုံးပြုသူ လူနာများနှင့် မိသားစုဝင်များအတွက် ပြည့်စုံသော မြန်မာဘာသာ အသုံးပြုနည်းလမ်းညွှန် (User Guide) ထည့်သွင်းခြင်း'
        ]
      },
      {
        title: '⚡ Firebase Firestore Security Rules Hardening',
        icon: Database,
        items: [
          'လူနာအချက်အလက် လုံခြုံရေးအတွက် Firestore Security Rules အဆင့်မြှင့်တင်ခြင်း',
          'အင်တာနက်လိုင်း အားနည်းချိန်တွင်လည်း ဒေတာမပျောက်ပျက်စေရန် Offline Caching ပိုမိုကောင်းမွန်အောင် ပြင်ဆင်ခြင်း'
        ]
      }
    ]
  },
  {
    version: 'v1.2.0',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာ',
    title: 'Cloudflare Pages & PWA Mobile App Support',
    badge: 'Deployment & PWA',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    highlights: [
      {
        title: '🌐 Cloudflare Pages Auto Deployment',
        icon: Smartphone,
        items: [
          'GitHub နှင့် ချိတ်ဆက်ကာ Cloudflare Pages ပေါ်တွင် အခမဲ့ မြန်ဆန်သော WebApp Hosting တင်ဆင်ခြင်း',
          'Vite React SPA အထူးပြု စနစ်ဖြင့် စက္ကန့်ပိုင်းအတွင်း ဖွင့်လှစ်နိုင်ခြင်း'
        ]
      },
      {
        title: '📱 PWA (Progressive Web App) & Custom Logo',
        icon: Sparkles,
        items: [
          'ခရမ်းရောင်နောက်ခံနှင့် ရွှေရောင် အမှတ်တံဆိပ် Logo အသစ်ဖြင့် ဖုန်းမျက်နှာပြင်ပေါ်သို့ App အဖြစ် ထည့်သွင်းနိုင်ခြင်း',
          'Android (Chrome) နှင့် iOS (Safari) နှစ်မျိုးလုံးတွင် Standalone Mobile App ကဲ့သို့ အသုံးပြုနိုင်ခြင်း'
        ]
      }
    ]
  },
  {
    version: 'v1.1.0',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာ',
    title: 'Medical Calculations & Doctor Q&A Consultation',
    badge: 'Clinical Features',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    highlights: [
      {
        title: '🩺 Medical Calculations (AHA/ADA & WHO Standards)',
        icon: Activity,
        items: [
          'သွေးပေါင်ချိန် (BP) - Normal, Elevated, Stage 1, Stage 2, Hypertensive Crisis အလိုအလျောက် ခွဲခြားသတ်မှတ်ခြင်း',
          'သွေးတွင်းသကြားဓာတ် (Glucose) - အစာမစားမီ (Fasting)၊ အစာစားပြီး ၂ နာရီ၊ အိပ်ရာမဝင်မီ စံနှုန်းများ စစ်ဆေးပေးခြင်း',
          'မွေးသက္ကရာဇ်မှ အသက်ကို အတိအကျ တွက်ချက်ခြင်းနှင့် Asian-Pacific WHO စံနှုန်းဖြင့် BMI သတ်မှတ်ခြင်း'
        ]
      },
      {
        title: '💬 Doctor Q&A & Prescription Tracker',
        icon: Stethoscope,
        items: [
          'လူနာများက ဆရာဝန်ထံ တိုက်ရိုက် မေးမြန်းနိုင်ပြီး ဆရာဝန်က ပြန်လည် အကြံပြုဖြေကြားနိုင်ခြင်း',
          'သောက်သုံးနေသော ဆေးဝါးများ (Medications) စာရင်းနှင့် ဓာတ်ခွဲခန်းစစ်ဆေးချက်များ (Lab Tests) မှတ်တမ်း'
        ]
      }
    ]
  },
  {
    version: 'v1.0.0',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာ',
    title: 'Initial Release - Family Health Track',
    badge: 'စတင် မိတ်ဆက်ခြင်း',
    badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    highlights: [
      {
        title: '🌱 Core Health Tracking System',
        icon: Activity,
        items: [
          'မိသားစုဝင်များ၏ သွေးတိုး၊ ဆီးချို နေ့စဉ်မှတ်တမ်းတင် စနစ်',
          'သတိပေးချက်စနစ် (Notification Center) နှင့် ကျန်းမာရေး သတင်းဆောင်းပါးများ'
        ]
      }
    ]
  }
];

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({ isOpen, onClose }) => {
  const [selectedVersion, setSelectedVersion] = useState<string>('v1.3.0');

  if (!isOpen) return null;

  const currentDetail = VERSION_HISTORY_DATA.find(v => v.version === selectedVersion) || VERSION_HISTORY_DATA[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-900/10 via-emerald-900/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  Version History (စနစ်ပြင်ဆင်မှု မှတ်တမ်း)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  {VERSION_HISTORY_DATA[0].version}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                စနစ်အတွင်း နောက်ဆုံး ထည့်သွင်းထားသော Features များနှင့် အဆင့်မြှင့်တင်မှုများ
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

        {/* Content Body: Left Version Nav & Right Details */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
          {/* Left Column: Version Selector */}
          <div className="md:col-span-4 p-4 space-y-2 bg-slate-50/50 dark:bg-slate-950/40">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">
              ဗားရှင်းများ စာရင်း
            </div>
            {VERSION_HISTORY_DATA.map((item) => {
              const isSelected = item.version === selectedVersion;
              return (
                <button
                  key={item.version}
                  onClick={() => setSelectedVersion(item.version)}
                  className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 hover:border-purple-300 dark:hover:border-purple-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm">{item.version}</span>
                      {item.isLatest && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        }`}>
                          Latest
                        </span>
                      )}
                    </div>
                    <p className={`text-[10px] ${isSelected ? 'text-purple-100' : 'text-slate-400'}`}>
                      {item.releaseDate}
                    </p>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                </button>
              );
            })}
          </div>

          {/* Right Column: Selected Version Details */}
          <div className="md:col-span-8 p-5 sm:p-6 space-y-6">
            {/* Version Title Card */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    {currentDetail.version}
                  </h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentDetail.badgeColor}`}>
                    {currentDetail.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  ထုတ်ဝေသည့်ရက်: {currentDetail.releaseDate}
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
                {currentDetail.title}
              </span>
            </div>

            {/* Highlights Sections */}
            <div className="space-y-5">
              {currentDetail.highlights.map((sec, idx) => {
                const IconComponent = sec.icon;
                return (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                      <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span>{sec.title}</span>
                    </div>

                    <ul className="space-y-2 pl-2">
                      {sec.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between text-xs text-slate-500">
          <span>Family Health Track v1.3.0</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-semibold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
          >
            ပိတ်မည်
          </button>
        </div>
      </div>
    </div>
  );
};
