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
  Database,
  Lock,
  Gauge
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
    version: 'v1.3.7',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာ (ယနေ့ - Major Feature Update)',
    isLatest: true,
    title: '🔔 Health Notifications & Custom Reminders Center, Alarms & Audio Push Alert System',
    badge: 'နောက်ဆုံး ဗားရှင်း (v1.3.7)',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    highlights: [
      {
        title: '🔔 ကျန်းမာရေး သတိပေးချက်နှင့် Reminders စနစ် (Alarms & Notifications Center)',
        icon: Activity,
        items: [
          'အဓိက Navigation မီနူးတွင် "သတိပေးချက်များ" Tab ကို တိုက်ရိုက် ထည့်သွင်းပေးထားပြီး နေ့စဉ် ဆေးသောက်ချိန်၊ သွေးပေါင်ချိန်/သကြားဓာတ် တိုင်းတာချိန်၊ ဆရာဝန်ပြသရန် ရက်ချိန်းနှင့် ရေသောက်ရန် သတိပေးချက်များကို အချိန်သတ်မှတ်၍ Alarm အဖြစ် ပြုလုပ်နိုင်ခြင်း',
          'မဖတ်ရသေးသော သတိပေးချက် အရေအတွက်ကို Navigation Tab အပေါ်တွင် Badge အဖြစ် အနီရောင်ဖြင့် တိုက်ရိုက် ပြသပေးခြင်း'
        ]
      },
      {
        title: '🔊 Web Audio Chime Sound & Push Notifications',
        icon: Sparkles,
        items: [
          'သတိပေးချိန် ရောက်ပါက သာယာသော Web Audio Chime အသံဖြင့် အချက်ပေးခြင်းနှင့် ဖုန်း/ကွန်ပျူတာ Screen ပေါ်တွင် Browser Push Notification သတိပေးစာ တက်လာခြင်း',
          'ဆေးသောက်ပြီးပါက "ဆေးသောက်ပြီးပါပြီ" နှိပ်၍ မှတ်သားနိုင်ခြင်း သို့မဟုတ် မိနစ် ၂၀ တိုး၍ (Snooze) သတိပေးခိုင်းနိုင်ခြင်း'
        ]
      },
      {
        title: '⚪️ Pure White High-Contrast UI & Zero Horizontal Scroll',
        icon: CheckCircle2,
        items: [
          'စာလုံးအရောင်နှင့် နောက်ခံအရောင်များ အလွန်ရှင်းလင်းစွာ ဖတ်ရှုနိုင်စေရန် High Contrast Pure White Design အပြည့်အဝ ကျင့်သုံးထားခြင်း',
          'ဖုန်းမျက်နှာပြင် အမျိုးအစားအားလုံးတွင် ဘေးသို့ horizontal scroll လုံးဝ မထွက်ဘဲ Smooth Vertical Scroll ဖြင့်သာ ကြည့်ရှုနိုင်ခြင်း'
        ]
      }
    ]
  },
  {
    version: 'v1.3.6',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာ (Major Update)',
    isLatest: false,
    title: '☀️ Pure White Minimalist UI, Pediatrics & Children Healthcare, Categorized Knowledge Grid & Zero Horizontal Scroll Navigation',
    badge: 'ဗားရှင်း (v1.3.6)',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    highlights: [
      {
        title: '⚪️ Pure White Minimalist UI (အဖြူခံ ရိုးရိုးရှင်းရှင်း ဒီဇိုင်း)',
        icon: Sparkles,
        items: [
          'အက်ဒမင် ဒါရှ်ဘုတ်နှင့် Quota Monitor အပါအဝင် အပလီကေးရှင်း အစိတ်အပိုင်းတစ်ခုလုံးကို စက်တွင်း အမှောင်ရောင် အပေါ်ယံလွှာများ ဖယ်ရှား၍ Pure White (အဖြူခံ သန့်သန့်ရှင်းရှင်း) သို့ အပြည့်အဝ ပြောင်းလဲပေးထားခြင်း',
          'ဖုန်းစခရင်များတွင် ဘေးဘက်သို့ ပွတ်ဆွဲရန် မလိုဘဲ တစ်ကြည့်တည်း အကုန်မြင်နိုင်သော Responsive Grid Tabs'
        ]
      },
      {
        title: '👶 ကလေးကျန်းမာရေးနှင့် မွေးကင်းစ ပြုစုစောင့်ရှောက်နည်း (Pediatrics)',
        icon: Stethoscope,
        items: [
          'ကလေးသူငယ် ကျန်းမာရေးအတွက် မွေးကင်းစမှ ၅ နှစ်အထိ EPI ကာကွယ်ဆေးဇယား၊ အဖျားတက်လျှင် ရေပတ်တိုက်နည်း၊ ဉာဏ်ရည်နှင့် အရပ်အမောင်းအတွက် အာဟာရနှင့် သွေးလွန်တုပ်ကွေး အထူးသတိပေးချက်များ',
          'ကျန်းမာရေး အသိပညာ ဆောင်းပါးများကို ကလေးကျန်းမာရေး၊ ကာကွယ်ဆေး၊ သိုင်းရွိုက်၊ သွေးတိုး၊ ဆီးချို၊ နှလုံး၊ အသည်း၊ ကျောက်ကပ်၊ အာဟာရနှင့် သက်ကြီးကျန်းမာရေး ဟူ၍ အုပ်စု ၉ ခု သီးသန့် အုပ်စုဖွဲ့ ပေးထားခြင်း'
        ]
      },
      {
        title: '📋 Change Log & Version History Transparency (ပြောင်းလဲမှု မှတ်တမ်း)',
        icon: History,
        items: [
          'စနစ်အတွင်း ပြုလုပ်ခဲ့သမျှ အပြောင်းအလဲနှင့် အဆင့်မြှင့်တင်မှုများ အားလုံးကို Version History & Change Log တွင် အချိန်နှင့်တစ်ပြေးညီ ပွင့်လင်းမြင်သာစွာ အပြည့်အစုံ မှတ်တမ်းတင်ပေးထားခြင်း'
        ]
      }
    ]
  },
  {
    version: 'v1.3.5',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာ',
    isLatest: false,
    title: 'Clean Bright Medical Theme, Thyroid Function Test (TFT), 35+ Health Articles with Vaccine Guides & Incomplete Record Management',
    badge: 'ယခင် ဗားရှင်း',
    badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    highlights: [
      {
        title: '☀️ Clean & Bright Medical Theme (လင်းလင်း ရှင်းရှင်း Theme)',
        icon: Sparkles,
        items: [
          'အမှောင်ရောင်လွှမ်းမိုးနေခြင်းကို ဖယ်ရှား၍ မျက်စိအေးချမ်းပြီး ရှင်းလင်းလန်းဆန်းသော Clean White / Teal / Emerald ဆေးဘက်ဆိုင်ရာ Theme ကို မူလအဖြစ် သတ်မှတ်ပေးခြင်း',
          'Navbar နှင့် Header တွင် ☀️ လင်းလင်းရှင်းရှင်း (Light Mode) နှင့် 🌙 အမှောင် (Dark Mode) စိတ်ကြိုက် ပြောင်းလဲနိုင်သည့် Theme Switcher စနစ် ထည့်သွင်းပေးခြင်း'
        ]
      },
      {
        title: '🧪 Thyroid Function Test (TFT) လည်ပင်းကြီးဟော်မုန်း အပြည့်အစုံ',
        icon: Activity,
        items: [
          'Lab Tests တွင် TSH, Free T4 (FT4), Free T3 (FT3), Total T4, Total T3, Anti-TPO တန်ဖိုးများ ထည့်သွင်း မှတ်တမ်းတင်နိုင်ခြင်း',
          'သိုင်းရွိုက် အဆိပ်သင့်ခြင်း (Hyperthyroidism)၊ သိုင်းရွိုက်အားနည်းခြင်း (Hypothyroidism) နှင့် ပုံမှန်အခြေအနေများအတွက် ဆေးပညာဆိုင်ရာ သုံးသပ်ချက် အဖြေနှင့် ဆရာဝန်လမ်းညွှန်ချက် အလိုအလျောက် တွက်ချက်ဖော်ပြခြင်း'
        ]
      },
      {
        title: '💉 ကျန်းမာရေး ဗဟုသုတ ဆောင်းပါး ၃၅ ပုဒ်နှင့် ကာကွယ်ဆေး ကဏ္ဍ',
        icon: Stethoscope,
        items: [
          'ကလေးနှင့် လူကြီး ကာကွယ်ဆေးများ (ဘီပိုး၊ HPV သားအိမ်ခေါင်း၊ တုပ်ကွေး၊ နမိုးနီးယား၊ ခါးပတ်ရေယုန်၊ ခွေးရူးပြန်၊ မေးခိုင်၊ EPI မွေးစမှ ၅ နှစ် ကာကွယ်ဆေးများ)',
          'သိုင်းရွိုက်၊ သွေးတိုး၊ ဆီးချို၊ အသည်း၊ ကျောက်ကပ်နှင့် အာဟာရ ဆောင်းပါး စုစုပေါင်း ၃၈ ပုဒ်ထိ ပြည့်စုံစွာ ဖြည့်ဆည်းပေးထားခြင်း'
        ]
      },
      {
        title: '🛡️ မှားယွင်း/မပြည့်စုံသော လူနာမှတ်တမ်း ပြင်ဆင်/ဖျက်ပစ်နိုင်သည့် စနစ်',
        icon: ShieldCheck,
        items: [
          'အချက်အလက် မပြည့်စုံသော လူနာများကို Incomplete Alert ဖြင့် သတိပေးခြင်း၊ စာရင်းတွင် သီးသန့်စစ်ထုတ်နိုင်ခြင်း',
          'အမည်၊ အသက်၊ ဖုန်း၊ ရောဂါအခံများ တိုက်ရိုက်ပြင်ဆင်နိုင်သည့် Edit Modal နှင့် ဆက်စပ်မှတ်တမ်းများပါ တစ်ခါတည်း ရှင်းလင်းနိုင်သည့် Cascading Delete စနစ်'
        ]
      }
    ]
  },
  {
    version: 'v1.3.4',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာ',
    isLatest: false,
    title: 'Cloud Database Access Unlocked, Google Sign-In & Direct Patient Registration',
    badge: 'ယခင် ဗားရှင်း',
    badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    highlights: [
      {
        title: '🔓 Cloud Database Permissions & Security Rules Unlocked',
        icon: Database,
        items: [
          'Firestore Database တွင် လူနာအကောင့်များနှင့် ကျန်းမာရေးမှတ်တမ်းများကို ကန့်သတ်ချက်မရှိ တိုက်ရိုက် ရေးသား/ဖတ်ရှုနိုင်ရန် Firestore Security Rules အသစ်ကို Deploy ပြုလုပ်ပြီးစီးခြင်း',
          'Firebase Auth အခြေအနေကြောင့် Database ရေးသားမှုများ ပိတ်ဆို့မခံရစေရန် ကုဒ်အတွင်းရှိ currentUser blocking check များကို ရှင်းလင်းပေးခြင်း'
        ]
      },
      {
        title: '🔑 Google Sign-In & Direct Registration Support',
        icon: Sparkles,
        items: [
          'Google အကောင့်ဖြင့် 1-Click တိုက်ရိုက် အကောင့်ဖွင့်/ဝင်နိုင်သည့် Google Sign-In ခလုတ်ကို Login Screen တွင် ထည့်သွင်းပေးခြင်း',
          'Admin Portal အတွင်းမှ လူနာအချက်အလက်များကို Database ထဲသို့ တိုက်ရိုက် ထည့်သွင်းနိုင်သည့် "+ လူနာအသစ် စာရင်းသွင်းမည်" စနစ်ကို ဖြည့်စွက်ပေးခြင်း'
        ]
      },
      {
        title: '📊 Real-Time Patient & Document Verification',
        icon: Gauge,
        items: [
          'Database အတွင်းရှိ လူနာစာရင်းနှင့် အချက်အလက်များအား အချိန်နှင့်တပြေးညီ တိုက်ရိုက် စစ်ဆေးနိုင်သည့် Live Query စနစ် ပြည့်စုံစွာ အလုပ်လုပ်ခြင်း'
        ]
      }
    ]
  },
  {
    version: 'v1.3.3',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာ (ယနေ့ - Update)',
    isLatest: false,
    title: 'Patient Account Sync Pipeline, Multi-Source Discovery & Clean Database Audit',
    badge: 'ယခင် ဗားရှင်း',
    badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    highlights: [
      {
        title: '👥 Multi-Source Patient Discovery & Real-Time Syncing',
        icon: Sparkles,
        items: [
          'Admin Dashboard တွင် လူနာအကောင့်များ မကျန်ရှိစေရန် Firestore Users Collection သာမက ကျန်းမာရေးဒေတာ (Vitals, Glucose, BMI, Meds, Q&A) အားလုံးမှ လူနာမှတ်တမ်းများကို အလိုအလျောက် ပေါင်းစပ်ဆွဲယူပြသပေးခြင်း',
          'တွေ့ရှိသော လူနာအကောင့်အသစ်များကို Database Users စာရင်းသို့ အလိုအလျောက် Auto-Backfill ထည့်သွင်းပေးသည့် စနစ်'
        ]
      },
      {
        title: '🛡️ Patient Privacy & Trust Guarantee (လူနာယုံကြည်စိတ်ချရမှု)',
        icon: Lock,
        items: [
          'လူနာများ စိတ်ချလက်ချ အသုံးပြုနိုင်စေရန် မသင့်လျော်သော စောင့်ကြည့်စာတန်းများကို ဖယ်ရှားပြီး HIPAA & ဆေးဘက်ဆိုင်ရာ ကျင့်ဝတ်နှင့်အညီ လုံခြုံစိတ်ချရသော Privacy မူဝါဒဖြင့် ပြင်ဆင်ခြင်း',
          'အချက်အလက်များကို ခွင့်ပြုချက်မရှိဘဲ လွှဲပြောင်းခြင်းမရှိဘဲ သီးသန့် Cloud Firestore တွင်သာ လုံခြုံစွာ ထိန်းသိမ်းခြင်း'
        ]
      },
      {
        title: '⚡ One-Click Database Health Audit & Live Refresh',
        icon: Database,
        items: [
          'Admin Portal တွင် "Database အချက်အလက် တိုက်ရိုက်ပြန်စစ်မည်" (Live Refresh) ခလုတ်ဖြင့် Cloud ရှိ လူနာနှင့် မှတ်တမ်းအသစ်များကို ချက်ချင်း ပြန်လည်ဆွဲယူနိုင်ခြင်း',
          'အက်ဒမင်စစ်ဆေးမှု filter logic ကို ပိုမိုတိကျစေပြီး သာမန်လူနာအကောင့်များ မည်သည့်အခါမျှ အပယ်ခံမဖြစ်စေရန် ပြင်ဆင်ထားခြင်း'
        ]
      }
    ]
  },
  {
    version: 'v1.3.2',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာ',
    title: 'Cloudflare Pages Deployment Fix & Build System Optimization',
    badge: 'Build Update',
    badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    highlights: [
      {
        title: '🚀 Cloudflare Pages Build Pipeline Fix',
        icon: Sparkles,
        items: [
          'Cloudflare Pages CI/CD Build အတွက် bun lockfile compatibility error ကို ဖြေရှင်းပေးပြီး standard npm lockfile စနစ်သို့ ပြောင်းလဲတပ်ဆင်ခြင်း',
          'Vite Production Build နှင့် PWA Service Worker assets များကို Cloudflare Pages တွင် အောင်မြင်စွာ Auto-deploy ဖြစ်စေရန် ပြင်ဆင်ပြီးစီးခြင်း'
        ]
      },
      {
        title: '📊 Free Quota & Database Health Monitoring System',
        icon: Gauge,
        items: [
          'Firebase Firestore Spark Free Plan အခမဲ့ ကန့်သတ်ချက်များ (Daily Reads 50,000 / Writes 20,000 / Storage 1 GB) ကို Admin Portal တွင် တိုက်ရိုက် စောင့်ကြည့်နိုင်ခြင်း',
          'Database အတွင်းရှိ Collection အသီးသီး၏ Document စုစုပေါင်းနှင့် Cloud Sync အခြေအနေကို အချိန်နှင့်တပြေးညီ တိုက်ရိုက် စစ်ဆေးနိုင်ခြင်း'
        ]
      }
    ]
  },
  {
    version: 'v1.3.1',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာ',
    title: 'Free Quota Monitoring System & Patient Privacy & Database Hardening',
    badge: 'Database Update',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    highlights: [
      {
        title: '⚡ Real-time Patient Data Syncing & Null-Safe Pipeline',
        icon: Database,
        items: [
          'လူနာအကောင့်ဖွင့်ချိန်တွင် Firestore Database သို့ အမှားအယွင်းမရှိ တိုက်ရိုက် ရောက်ရှိစေရန် Null-Safe Data Pipeline တပ်ဆင်ခြင်း',
          'Firestore Security Rules များတွင် User Profile နှင့် ကျန်းမာရေးဒေတာများ Read/Write ချောမွေ့စွာ အလုပ်လုပ်နိုင်ရန် အဆင့်မြှင့်တင်ခြင်း'
        ]
      }
    ]
  },
  {
    version: 'v1.3.0',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာ',
    title: 'Admin Master Portal & Version History & User Guide System',
    badge: 'Admin & Guides',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    highlights: [
      {
        title: '👑 Master Admin & Clinical Dashboard',
        icon: ShieldCheck,
        items: [
          'ဆေးခန်းနှင့် ကျန်းမာရေးစောင့်ရှောက်သူများအတွက် လူနာမှတ်တမ်းများကို Clinical Dashboard ဖြင့် စနစ်တကျ စစ်ဆေးနိုင်ခြင်း',
          'လူနာတစ်ဦးချင်းစီ၏ BP, Glucose, BMI နှင့် ဆေးမှတ်တမ်းများအလိုက် သီးသန့် Doctor Advice ပေးပို့နိုင်ခြင်း',
          'Multi-device နှင့် Cloud Firestore Real-time Syncing စနစ်'
        ]
      },
      {
        title: '📜 Version History & အသုံးပြုနည်းလမ်းညွှန် (User Guide)',
        icon: History,
        items: [
          'စနစ်အတွင်း ပြောင်းလဲပြင်ဆင်မှုများအားလုံးကို အသေးစိတ် ကြည့်ရှုနိုင်သော Version History System',
          'အသုံးပြုသူ လူနာများနှင့် မိသားစုဝင်များအတွက် ပြည့်စုံသော မြန်မာဘာသာ အသုံးပြုနည်းလမ်းညွှန် (User Guide) ထည့်သွင်းခြင်း'
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
  const [selectedVersion, setSelectedVersion] = useState<string>('v1.3.1');

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
          <span>Family Health Track v1.3.1</span>
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
