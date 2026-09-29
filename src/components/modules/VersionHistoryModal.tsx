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
  Gauge,
  Pill,
  Megaphone,
  AlertTriangle,
  FileText,
  Users,
  FlaskConical,
  Droplets,
  ShieldAlert,
  Eye,
  LifeBuoy,
  Waves
} from 'lucide-react';

export const CURRENT_SYSTEM_VERSION = 'v2.3.5';

export interface VersionItem {
  version: string;
  type: 'major' | 'minor';
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

export const VERSION_HISTORY_DATA: VersionItem[] = [
  {
    version: 'v2.3.5',
    type: 'minor',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာလ (ယနေ့)',
    isLatest: true,
    title: '🛡️ [PATCH/AUDIT] Medical Article Author Integrity & Clinical Advisory Notice (ဆောင်းပါးများမှ အတည်မပြုနိုင်သော ဆရာဝန်အမည်များ ဖယ်ရှားခြင်းနှင့် ဆေးပညာ လမ်းညွှန် အသိပေးချက် စနစ်သစ်)',
    badge: 'Latest Release (v2.3.5)',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    highlights: [
      {
        title: '🩺 ဆောင်းပါးများမှ စိတ်ကူးယဉ် Placeholder ဆရာဝန် အမည်များအား အပြီးတိုင် ဖယ်ရှားရှင်းလင်းခြင်း',
        icon: ShieldCheck,
        items: [
          'မူလနမူနာ ဆောင်းပါးများတွင် ပါရှိခဲ့သော အတည်မပြုနိုင်သည့် ဆရာဝန် အမည်များကို လုံးဝ (လုံးဝ) ဖယ်ရှားရှင်းလင်းခြင်း',
          'ဆောင်းပါး အချက်အလက်များအား အများပြည်သူ ကျန်းမာရေး လမ်းညွှန်ချက်များနှင့် ဆေးပညာ ဗဟုသုတများအဖြစ် Family Health Track Editorial Reference Guide အဖြစ် သတ်မှတ်ဖော်ပြခြင်း'
        ]
      },
      {
        title: '⚖️ ဆေးပညာဆိုင်ရာ သတိပေးချက် (Medical Advisory Notice) တိကျစွာ ထည့်သွင်းခြင်း',
        icon: FileText,
        items: [
          'ဆောင်းပါးတိုင်း၏ အောက်ခြေတွင် "ဤဆောင်းပါးပါ အချက်အလက်များသည် ပြည်သူလူထု ကျန်းမာရေး အသိပညာ ဗဟုသုတ တိုးပွားစေရန် ရည်ရွယ်ပြီး၊ တိကျသော ရောဂါရှာဖွေကုသမှုများအတွက် သက်ဆိုင်ရာ ဆရာဝန်နှင့် တိုက်ရိုက် ပြသတိုင်ပင်ဆွေးနွေးရန် လိုအပ်ပါသည်" ဟူသော ဆေးပညာ စံသတ်မှတ်ချက် သတိပေးချက်အား ထည့်သွင်းထားခြင်း'
        ]
      },
      {
        title: '🔍 Search Filter & Data Schema Optimization',
        icon: Sparkles,
        items: [
          'ရှာဖွေမှု Filter မှ မလိုအပ်သော Author field ကို ဖယ်ရှားပြီး ဆောင်းပါး ခေါင်းစဉ်၊ အကျဉ်းချုပ်နှင့် Tags များဖြင့်သာ တိကျစွာ ရှာဖွေနိုင်ရန် ပြင်ဆင်ခြင်း'
        ]
      }
    ]
  },
  {
    version: 'v2.3.4',
    type: 'major',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာလ (ယနေ့)',
    isLatest: false,
    title: '🌊 [MAJOR] Flood & Health Articles Touch Scrolling Fix, Strict Category Isolation & 1/3/6-Month Historical Health Passport (ဆောင်းပါးများ Touch Scroll ပြင်ဆင်ခြင်း၊ ရေဘေးကဏ္ဍတွင် သိုင်းရွိုက်ရောနှောမှု မရှိစေဘဲ သီးသန့်ခွဲထုတ်ခြင်းနှင့် ၁ လ၊ ၃ လ၊ ၆ လ စာ သမိုင်းမှတ်တမ်း အပြည့်အစုံပါဝင်သော ကျန်းမာရေး Passport စနစ်သစ်)',
    badge: 'Previous Release (v2.3.4)',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    highlights: [
      {
        title: '📱 မိုဘိုင်းဖုန်းနှင့် ကွန်ပျူတာ အားလုံးတွင် ရေဘေးနှင့် ကျန်းမာရေး ဆောင်းပါးများ ချောမွေ့စွာ Scroll ပြုလုပ်ဖတ်ရှုနိုင်ခြင်း',
        icon: Smartphone,
        items: [
          'ရေဘေးအရေးပေါ် ဆောင်းပါးများနှင့် အထွေထွေ ကျန်းမာရေး ဆောင်းပါးများ ဖတ်ရှုသည့် Modal ပေါ့ပ်အပ်တွင် မိုဘိုင်းဖုန်း Touch Scroll (iOS WebKit / Android) မလုပ်နိုင်ဖြစ်နေသည့် ချို့ယွင်းချက်အား min-h-0, overflow-y-auto နှင့် -webkit-overflow-scrolling: touch တို့ဖြင့် အပြီးတိုင် ပြင်ဆင်ပြီးစီးခြင်း',
          'ခေါင်းစဉ် (Header) နှင့် ပိတ်ရန်ခလုတ် (Footer) များအား နေရာမရွေ့ Fixed ထားရှိပြီး ဆောင်းပါးစာသားနှင့် အဓိက လိုက်နာရန်အချက်များအား အပေါ်အောက် လွတ်လပ်စွာ ချောမွေ့စွာ Scroll ဖတ်ရှုနိုင်ခြင်း',
          'အိမ်သုံးဆေးဝါး လမ်းညွှန် (Home Medicines Guide) နှင့် အခြား လမ်းညွှန် Modal များတွင်ပါ မိုဘိုင်း Scroll စွမ်းဆောင်ရည် အဆင့်မြှင့်တင်ခြင်း'
        ]
      },
      {
        title: '🌊 ရေဘေးအရေးပေါ်ကဏ္ဍနှင့် အထွေထွေ ဆေးပညာကဏ္ဍတို့အား တိကျစွာ သီးခြားစီ ခွဲထုတ်ထားခြင်း (သိုင်းရွိုက်ဆောင်းပါး ရောနှောမှု ရှင်းလင်းခြင်း)',
        icon: Waves,
        items: [
          'ရေဘေးဆောင်းပါးများ စုစည်းထားရာနေရာတွင် သိုင်းရွိုက် (Thyroid) ဆောင်းပါးများ ရောနှောမနေစေရန် "🌊 ရေဘေး အရေးပေါ် ကျန်းမာရေး လမ်းညွှန်များ (၈ ပုဒ် သီးသန့်)" နှင့် "📚 အထွေထွေ ဆေးပညာ & ရောဂါများ ဗဟုသုတ (၇၃ ပုဒ်)" ဟူ၍ ခလုတ်ခွဲကာ သီးသန့်စီ စနစ်တကျ ခွဲထုတ်ပေးထားခြင်း',
          'ရေဘေးကဏ္ဍတွင် ရေဘေးနှင့် တိုက်ရိုက်ဆိုင်သော ဆောင်ရန်/ရှောင်ရန်၊ ကြွက်ဖျားနှင့် ရေဘေးရောဂါများ၊ CPR နှင့် ရှေးဦးပြုစုနည်း၊ သောက်ရေသန့်စင်၊ ကိုယ်ဝန်ဆောင်/ကလေး/နာတာရှည်လူနာ စောင့်ရှောက်မှု၊ ပြန်လည်ထူထောင်ရေး ဆောင်းပါး ၈ ပုဒ်သာ သီးသန့် ပြသပေးခြင်း',
          'သိုင်းရွိုက်၊ သွေးတိုး၊ ဆီးချို၊ မျက်စိ၊ သွား၊ နှလုံး၊ ကလေးကျန်းမာရေး စသည့် အထွေထွေ ရောဂါဆောင်းပါးများကို အထွေထွေ ဆေးပညာကဏ္ဍတွင် သီးခြား အမျိုးအစားအလိုက် အဆင်ပြေစွာ ရှာဖွေဖတ်ရှုနိုင်ခြင်း'
        ]
      },
      {
        title: '📑 ဆရာဝန် ကြည့်ရှုလွယ်ကူစေရန် ၁ လ ၊ ၃ လ ၊ ၆ လ စာ Historical Data အပြည့်အစုံပါဝင်သော ကျန်းမာရေးမှတ်တမ်း (Health Passport) ထုတ်ယူမှု စနစ်သစ်',
        icon: FileText,
        items: [
          'မူလက နောက်ဆုံး ၁ ကြိမ်သာ ထုတ်ပေးနေသည့် အခြေအနေမှ ပြင်ဆင်ပြီး ထိပ်ဆုံးတွင် နောက်ဆုံး ၁ ကြိမ်တိုင်းတာချက်များ (Latest Vital Signs) ကို အနှစ်ချုပ်ပြသခြင်း',
          '၎င်းနောက်တွင် ဆရာဝန် ကြည့်ရှုလွယ်ကူစေရန် နောက်ဆုံး ၁ လ၊ ၃ လ၊ ၆ လ စာ ကာလအလိုက် သွေးပေါင်ချိန် ပျမ်းမျှ၊ သွေးချို/ဆီးချို ပျမ်းမျှ၊ BMI ပျမ်းမျှတန်ဖိုးများနှင့် တိုင်းတာမှု အကြိမ်အရေအတွက် နှိုင်းယှဉ်ချက် (Historical Trends Overview) အား ဇယားဖြင့် တိကျစွာ တွက်ချက်ဖော်ပြခြင်း',
          'ရက်စွဲအလိုက် အသေးစိတ် စစ်ဆေးချက်မှတ်တမ်းများ (Blood Pressure Log, Blood Glucose Log, Weight/BMI Log, Lab Panel Results, Active Prescriptions, Doctor Advice) အား စုံလင်စွာ A4 Size Printable PDF Health Passport အဖြစ် ပုံနှိပ်ထုတ်ယူနိုင်ခြင်း'
        ]
      }
    ]
  },
  {
    version: 'v2.3.3',
    type: 'major',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာလ (ယနေ့)',
    isLatest: false,
    title: '✨ [MAJOR] Dynamic Change Log Engine & Distinct Version Audit (ဗားရှင်းအလိုက် ပြောင်းလဲမှုမှတ်တမ်း အစစ်အမှန် စနစ်သစ်နှင့် Version Update ပေါ့ပ်အပ် ပြင်ဆင်မှု)',
    badge: 'Previous Release (v2.3.3)',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    highlights: [
      {
        title: '🔄 အက်ပ် Update ပေါ့ပ်အပ်တွင် ဗားရှင်းအလိုက် ပြောင်းလဲချက် အစစ်အမှန်များ အလိုအလျောက် ချိတ်ဆက်ဖော်ပြခြင်း',
        icon: Sparkles,
        items: [
          'မူလက ဗားရှင်းနံပါတ်သာ ပြောင်းပြီး ပေါ့ပ်အပ်အတွင်း သွေးပေါင်ချိန် စာသားဟောင်းများ အသေဖြစ်နေခဲ့သည့် ချို့ယွင်းချက်ကို အပြီးတိုင် ဖယ်ရှားရှင်းလင်းခြင်း',
          'ဗားရှင်းအသစ်ထွက်တိုင်း နောက်ဆုံးဗားရှင်း၏ ခေါင်းစဉ်နှင့် ပြောင်းလဲမှု အချက်အလက်အစစ် (Dynamic Highlights) များကို တိုက်ရိုက် ရယူပြသပေးသော စနစ်သစ် ထည့်သွင်းခြင်း',
          'အသုံးပြုသူများ ဗားရှင်းတစ်ခုချင်းစီ၏ တကယ့် ကွာခြားချက်အစစ်အမှန်များကို Update ပေါ့ပ်အပ်ပေါ်တွင် ချက်ချင်း အလွယ်တကူ သိရှိဖတ်ရှုနိုင်ခြင်း'
        ]
      },
      {
        title: '📑 Version History & Change Log တစ်ခုချင်းစီ ကွဲပြားတိကျစွာ ပြန်လည်စိစစ် ပြင်ဆင်ခြင်း',
        icon: History,
        items: [
          'Change Log စာမျက်နှာအတွင်း မတူညီသော Version များကြားတွင် ထပ်ခါတလဲလဲ ဖြစ်နေခဲ့သော သွေးပေါင်ချိန် Graph နှင့် ဝေါဟာရ စာသားအဟောင်းများကို စနစ်တကျ သန့်စင်ဖယ်ရှားခြင်း',
          'Version တစ်ခုချင်းစီ (v2.3.3, v2.3.2, v2.3.1, v2.3.0 မှစ၍ ရှေးဦးဗားရှင်းများအထိ) ၏ ထူးခြားသော Feature များနှင့် ပြင်ဆင်ချက်များကို မထပ်စေဘဲ တိကျစွာ သီးခြားစီ မှတ်တမ်းတင်ပေးထားခြင်း',
          'Major နှင့် Minor ဗားရှင်း အဆင့်သတ်မှတ်ချက်များနှင့်အညီ စနစ်တကျ ခွဲခြားပြသပေးထားခြင်း'
        ]
      },
      {
        title: '🛡️ LocalStorage Version State & Dismissal Optimization',
        icon: ShieldCheck,
        items: [
          'အသုံးပြုသူ ဗားရှင်းအသစ်သို့ ရောက်ရှိချိန်တွင် Update Modal အား တစ်ကြိမ်သာ သပ်ရပ်စွာ ပြသပြီး "စတင်အသုံးပြုမည်" သို့မဟုတ် "Change Log ကြည့်ရန်" နှိပ်ပြီးပါက နောက်တစ်ကြိမ် မလိုအပ်ဘဲ ထပ်မံနှောင့်ယှက်ခြင်း မရှိစေရန် စီစဉ်ထားခြင်း'
        ]
      }
    ]
  },
  {
    version: 'v2.3.2',
    type: 'major',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာလ (ယနေ့)',
    isLatest: false,
    title: '🌊 [MAJOR] Comprehensive Flood Safety, Emergency Health & Disaster Recovery Library (ရေဘေးအန္တရာယ်၊ ရေကြီးမှု ကျန်းမာရေး၊ အရေးပေါ် အသက်ကယ်နှင့် ပြန်လည်ထူထောင်ရေး အပြည့်အစုံ)',
    badge: 'Previous Release (v2.3.2)',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    highlights: [
      {
        title: '🌊 ရေဘေး ဆောင်ရန်/ရှောင်ရန် (မကြီးမီ၊ ကြီးနေစဉ်နှင့် ရေကျပြီးချိန်)',
        icon: AlertTriangle,
        items: [
          'မကြီးမီ: အရေးပေါ် အသက်ကယ်အိတ် (Emergency Go Bag)၊ သောက်ရေသန့် ၃ ရက်စာ၊ နာတာရှည်ဆေးဝါး ၁ လစာ၊ မုန့်ခြောက်/ငါးသေတ္တာ၊ အရေးကြီးစာရွက်စာတမ်းများနှင့် ဝီစီ ကြိုတင်ထုပ်ပိုးခြင်း',
          'ကြီးနေစဉ်: လျှပ်စစ်မိန်းခလုတ် ချက်ချင်းပိတ်ခြင်း၊ ရေစီးထဲ ခြေလျင်/ကားဖြင့် မဖြတ်သန်းခြင်း ("Turn Around, Don\'t Drown")၊ ကလေးများ ရေထဲမဆော့စေခြင်းနှင့် အဆိပ်ရှိ မြွေ/ကင်းမြီးကောက် သတိပြုခြင်း',
          'ကြီးပြီး: အိမ်ပြန်ဝင်ချိန် ဓာတ်ငွေ့ယိုစိမ့်မှု စစ်ဆေးခြင်း၊ ရေမြုပ်ခဲ့သော အစားအစာအားလုံး စွန့်ပစ်ခြင်း၊ လျှပ်စစ်လိုင်းများ စစ်ဆေးပြီးမှ မီးခလုတ်ဖွင့်ခြင်းနှင့် ဘွတ်ဖိနပ်/လက်အိတ် ဝတ်ဆင်ခြင်း'
        ]
      },
      {
        title: '🦠 ရေကြီးချိန်နှင့် ရေကျပြီးနောက် အဖြစ်များဆုံး ကူးစက်ရောဂါ ၆ မျိုး ကာကွယ်ကုသနည်း',
        icon: ShieldAlert,
        items: [
          'ကြွက်သေးဖျားရောဂါ (Leptospirosis / ကြွက်ဖျား): လက္ခဏာများ (ဖျားခြင်း၊ မျက်စိနီခြင်း၊ ခြေသလုံးကြွက်သား အလွန်ကိုက်ခဲခြင်း)၊ အသားဝါ/ကျောက်ကပ်ပျက်စီးမှု ကာကွယ်ခြင်းနှင့် Doxycycline ကြိုတင်ကာကွယ်ဆေး',
          'ဝမ်းပျက်ဝမ်းလျှောနှင့် ကာလဝမ်း (Cholera): ရေဓာတ်ခမ်းခြောက်မှု မဖြစ်စေရန် ORS ဓာတ်ဆားရည် သောက်သုံးခြင်း၊ လက်ကို ဆပ်ပြာဖြင့် စက္ကန့် ၂၀ ကြာ ဆေးကြောခြင်းနှင့် အရေးပေါ် ပုလင်းချိတ်ကုသနည်း',
          'အသည်းရောင် အသားဝါ အေနှင့် အီး (Hepatitis A & E): ကိုယ်ဝန်ဆောင်မိခင်များ အသည်းရုတ်တရက် ပျက်စီးကာ အသက်အန္တရာယ် မဖြစ်စေရန် ကျိုချက်ထားသော ရေသန့်ကိုသာ သောက်သုံးရန် သတိပေးချက်',
          'ကူးစက်မြန် မျက်စိနာရောဂါ (Conjunctivitis)၊ အရေပြား ရေဝဲ/မှိုစွဲခြင်း၊ မေးခိုင်ရောဂါ (Tetanus) နှင့် ရေကျပြီးနောက် ခြင်မှတစ်ဆင့် ကူးစက်သော သွေးလွန်တုပ်ကွေး/ငှက်ဖျား ကာကွယ်နည်းများ'
        ]
      },
      {
        title: '🚨 အရေးပေါ် အသက်ကယ် အန္တရာယ်များ၊ CPR နှင့် လှေစီးနင်းမှု လုံခြုံရေး လမ်းညွှန်',
        icon: LifeBuoy,
        items: [
          'ရေနစ်သူအား ကယ်ဆယ်ပြီးနောက် သတိလစ်ပါက ဝမ်းဗိုက်မညှစ်ဘဲ ချက်ချင်း ရင်ဘတ်ဖိနှိပ်ခြင်း (CPR Hands-only compressions) စတင်ခြင်း',
          'ဓာတ်လိုက်နေသူအား တွေ့ရှိပါက မိန်းခလုတ် အရင်ပိတ်ခြင်း သို့မဟုတ် ခြောက်သွေ့သော သစ်သားတုတ်ဖြင့် လျှပ်စစ်ကြိုးမှ ခွာထုတ်ခြင်း',
          'မြွေဆိုးကိုက်ခံရပါက ကြိုးဖြင့် တင်းကျပ်စွာ မချည်ရန် (No tourniquet)၊ မခွဲမစုပ်ဘဲ ငြိမ်သက်စွာထား၍ မြွေဆိပ်ဖြေဆေး (Anti-venom) ရှိရာ ဆေးရုံအမြန်ဆုံး ပို့ဆောင်ခြင်း',
          'ကယ်ဆယ်ရေးလှေ စီးနင်းစဉ် အလုအယက် မတက်ဘဲ လှေချိန်ခွင်လျှာ ထိန်းသိမ်းခြင်း၊ SOS ဝီစီ/အလင်းရောင် အချက်ပြနည်းနှင့် သောက်ရေသန့်ဘူးခွံဖြင့် အရေးပေါ် အသက်ကယ်ဗော ပြုလုပ်နည်း'
        ]
      },
      {
        title: '🏡 ရေဘေးအပြီး အိမ်၊ သောက်သုံးရေတွင်း ပြန်လည်ထူထောင်ရေးနှင့် ပိုးသတ်သန့်စင်နည်း',
        icon: Droplets,
        items: [
          'အိမ်တွင်း အဆိပ်သင့်မှိုမည်း (Black Mold) ကို ကလိုရင်း အရောင်ချွတ်ဆေးရည် (Bleach) ဖြင့် တိုက်ချွတ်သုတ်သင် ပိုးသတ်ခြင်း',
          'သောက်သုံးရေတွင်းများ ရွှံ့နွံစုပ်ထုတ်ခြင်း၊ ထုံးသတ်ခြင်းနှင့် ကလိုရင်းဆေးမှုန့် (Bleaching Powder) ဖြင့် စနစ်တကျ ဆေးခတ်၍ ၂၄ နာရီထားကာ ပြန်စုပ်ထုတ် အသုံးပြုနည်း',
          'အိမ်တွင်း သောက်သုံးရေ သန့်စင်နည်း ၄ မျိုး (ရေဆူအောင်ကျိုချက်ခြင်း၊ Aquatabs ရေသန့်ဆေးပြား၊ Bleach အရည် အစက်ချနည်း၊ SODIS နေရောင်ခြည်သုံးနည်း)',
          'ရေစိုပျက်စီး အမှိုက်သရိုက်များနှင့် တိရစ္ဆာန်အသေကောင်များကို ထုံးဖြူး၍ စနစ်တကျ မြေမြှုပ်ပိုးသတ်ခြင်း'
        ]
      },
      {
        title: '🤰 ထိခိုက်လွယ်အုပ်စုနှင့် နာတာရှည်လူနာများ အထူးစောင့်ရှောက်မှု & PTSD စိတ်ကျန်းမာရေး',
        icon: Users,
        items: [
          'ကိုယ်ဝန်ဆောင်မိခင်များ အရေးပေါ် မီးဖွားအန္တရာယ် လက္ခဏာများ (သွေးဆင်းခြင်း၊ ရေမြွှာပေါက်ခြင်း) သတိပြုခြင်းနှင့် ရေဆိုးအန္တရာယ် ရှောင်ရှားခြင်း',
          'မွေးကင်းစနှင့် ကလေးငယ်များအတွက် အသက်ကယ်ဒိုင်းဖြစ်သော မိခင်နို့ ဆက်လက်တိုက်ကျွေးခြင်းနှင့် အအေးမိ အဆုတ်ရောင် မဖြစ်စေရန် စောင့်ရှောက်ခြင်း',
          'ဆီးချိုသမားများ အင်ဆူလင်ဆေးရည် အအေးခန်းမရှိချိန် ရေစိုအဝတ် သို့မဟုတ် မြေအိုးဖြင့် အပူမလွန်ကဲအောင် သိမ်းဆည်းနည်း',
          'သွေးတိုးနှင့် နှလုံးရောဂါသည်များ ကယ်ဆယ်ရေး ခေါက်ဆွဲခြောက်/ငါးသေတ္တာ စသည့် အငန်ဓာတ်လွန် အစားအစာများ သတိပြုခြင်းနှင့် သွေးပေါင်ထိန်းသိမ်းခြင်း',
          'ရေဘေးသင့်သူများ၏ စိတ်ဒဏ်ရာ (PTSD)၊ စိုးရိမ်ထိတ်လန့်စိတ် လျှော့ချရေးနှင့် စိတ်ပိုင်းဆိုင်ရာ ပြန်လည်ထူထောင်ရေး လမ်းညွှန်'
        ]
      }
    ]
  },
  {
    version: 'v2.3.1',
    type: 'major',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာလ (ယနေ့)',
    isLatest: false,
    title: '👁️ [MAJOR] Comprehensive Eye Health & Diseases Library (မျက်လုံးကျန်းမာရေးနှင့် ရောဂါများ ပညာပေးဆောင်းပါးစုံ အသစ်ထည့်သွင်းခြင်း)',
    badge: 'Previous Release (v2.3.1)',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    highlights: [
      {
        title: '👁️ မျက်စိတိမ်ဖြူခြင်း (Cataract) နှင့် ရေကြည်တိမ် (Glaucoma) အသေးစိတ် လမ်းညွှန်',
        icon: Eye,
        items: [
          'သဘာဝမှန်ဘီလူးနောက်ခြင်းနှင့် Phaco ခွဲစိတ်၍ မှန်ဘီလူးအတု (IOL) အစားထိုးခြင်း',
          'မျက်စိတွင်းဖိအား (IOP) တက်ကာ အသံတိတ် မျက်စိကွယ်စေသော ရေကြည်တိမ်ရောဂါ၊ အစောပိုင်းစစ်ဆေးခြင်းနှင့် နေ့စဉ် မျက်စဉ်းခတ်ရန် အရေးကြီးပုံ'
        ]
      },
      {
        title: '💻 မျက်လုံးခြောက်သွေ့ခြင်း (Dry Eye Syndrome) နှင့် ဒစ်ဂျစ်တယ် မျက်စိညောင်းညာမှု',
        icon: Smartphone,
        items: [
          'ကွန်ပျူတာ/ဖုန်း အကြည့်များသူများတွင် မျက်တောင်ခတ်နှုန်း ကျဆင်းသွားမှုနှင့် ၂၀-၂၀-၂၀ စည်းမျဉ်း',
          'Preservative-free မျက်ရည်တု အသုံးပြုနည်း၊ ရေနွေးငွေ့ဝတ်ကပ်ခြင်းနှင့် Omega-3 အာဟာရ'
        ]
      },
      {
        title: '🩸 ဆီးချိုကြောင့် မျက်စိမြင်လွှာထိခိုက်ခြင်း (Diabetic Retinopathy)',
        icon: Activity,
        items: [
          'ဆီးချိုသမားများ နှစ်စဉ် သူငယ်အိမ်ချဲ့၍ မြင်လွှာစစ်ဆေးရန် အရေးကြီးပုံ၊ Floaters အမည်းစက်များ မြင်ရခြင်း',
          'မြင်လွှာဗဟိုဖောရောင်ခြင်း (Macular Edema) အတွက် Anti-VEGF ထိုးဆေးနှင့် လေဆာဖြင့် ကုသနည်းများ'
        ]
      },
      {
        title: '🚨 မျက်စိနာရောဂါ (Pink Eye) နှင့် မျက်ကြည်လွှာ အနာဖြစ်ခြင်း/အရေးပေါ် ရှေးဦးပြုစုနည်း',
        icon: ShieldAlert,
        items: [
          'ဗိုင်းရပ်စ်၊ ဘက်တီးရီးယား၊ ဓာတ်မတည့် မျက်စိနာ ကွဲပြားချက်များနှင့် စတီးရွိုက်မျက်စဉ်း စိတ်ကြိုက်မခတ်ရန် သတိပေးချက်',
          'မျက်ကပ်မှန် (Contact lens) သုံးစွဲသူများ သတိပြုရန် စည်းကမ်းများနှင့် မျက်စိထဲ ဓာတုပစ္စည်းဝင်ပါက ချက်ချင်း ရေဆေးရန် ရှေးဦးပြုစုနည်း'
        ]
      }
    ]
  },
  {
    version: 'v2.3.0',
    type: 'major',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာလ',
    isLatest: false,
    title: '🦟 [MAJOR] Comprehensive Mosquito-Borne Diseases Library (ခြင်မှတဆင့် ကူးစက်တတ်သော ရောဂါများ ပညာပေးဆောင်းပါးတွဲများ)',
    badge: 'Previous Release (v2.3.0)',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    highlights: [
      {
        title: '🦟 ခြင်မှတဆင့် ကူးစက်တတ်သော ရောဂါများ အလုံးစုံ လမ်းညွှန် (Overview & Vector Control)',
        icon: FileText,
        items: [
          'ခြင်ကျား (Aedes)၊ အနိုဖလိစ် (Anopheles) နှင့် ကျူးလက်စ် (Culex) ခြင် ၃ မျိုး၏ ပေါက်ဖွားရာနေရာများနှင့် ကူးစက်ပုံ ကွဲပြားချက်များ',
          '"ဖုံး၊ သွန်၊ လှဲ၊ စစ်" စနစ်တကျ ပြုလုပ်ခြင်း၊ အဘိတ်ဆေးခတ်ခြင်းနှင့် ခြင်အကိုက်မခံရစေရန် အိမ်တွင်း ကာကွယ်နှိမ်နင်းနည်းများ'
        ]
      },
      {
        title: '🩸 သွေးလွန်တုပ်ကွေးရောဂါ (Dengue Fever) ပြည့်စုံသော ပညာပေးဆောင်းပါး',
        icon: Activity,
        items: [
          'ရောဂါအဆင့် ၃ ဆင့် (Febrile, Critical, Recovery)၊ အဖျားကျစတွင် သွေးလန့်ခြင်း (Shock) ဖြစ်နိုင်ခြေ သတိပေးချက်များ',
          'ဗိုက်အောင့်ခြင်း၊ သွေးယိုခြင်း၊ အလွန်မှိုင်တွေခြင်း စသည့် Warning Signs များနှင့် Aspirin/Ibuprofen ရှောင်ကြဉ်ရန် ဆေးပညာ လမ်းညွှန်ချက်များ'
        ]
      },
      {
        title: '🦟 ငှက်ဖျားရောဂါ (Malaria) ချမ်းတုန်ဖျား လက္ခဏာများနှင့် သွေးစစ်ဆေးကုသမှု',
        icon: Sparkles,
        items: [
          'ချမ်းတုန်ခြင်း၊ အဖျားတက်ခြင်းနှင့် ချွေးထွက်ခြင်း ၃ ဆင့် လက္ခဏာသံသရာလည်ပုံ၊ ဦးနှောက်ငှက်ဖျား အန္တရာယ်များ',
          'RDT သွေးစစ်ကတ်၊ မှန်ဘီလူးသွေးစစ်ဆေးခြင်းနှင့် Artemisinin (ACT) ဆေးတွဲများ သောက်သုံးကုသနည်း'
        ]
      },
      {
        title: '🐘 ဆင်ခြေထောက်ရောဂါ (Lymphatic Filariasis) နှင့် အခြားခြင်ကူးစက်ရောဂါများ',
        icon: ShieldAlert,
        items: [
          'သံကောင်မျှင်ပိုးကြောင့် ပြန်ရည်ကြောပိတ်ဆို့ ရောင်ရမ်းမှု၊ တစ်နှစ်တစ်ကြိမ် DEC ကာကွယ်ဆေး တိုက်ကျွေးခြင်းနှင့် ခြေလက်သန့်ရှင်းရေး စောင့်ရှောက်နည်း',
          'ချီကွန်ဂူးနီးယား (Chikungunya) အဆစ်ရောင်ခြင်းနှင့် ဂျပန်ဦးနှောက်ရောင် (JE) ကာကွယ်ဆေးထိုးနှံမှု အချက်အလက်များ'
        ]
      }
    ]
  },
  {
    version: 'v2.2.9',
    type: 'major',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာလ',
    isLatest: false,
    title: '🔔 [MAJOR] Patient-Specific Medication Reminders & Admin Notification Isolation (ဆေးသောက် Reminder များ သက်ဆိုင်ရာ လူနာထံသို့သာ သီးသန့် ပေးပို့ခြင်းနှင့် Admin စနစ် ခွဲထုတ်ခြင်း)',
    badge: 'Previous Release (v2.2.9)',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    highlights: [
      {
        title: '💊 ဆေးသောက်ရန် Reminder များကို သက်ဆိုင်ရာ လူနာအကောင့်ထံသို့သာ သီးသန့် ပေးပို့ခြင်း',
        icon: Pill,
        items: [
          'လူနာတစ်ဦးချင်းစီ၏ သောက်သုံးဆဲဆေးဝါးများ (Active Medications) အတွက်သာ ထိုလူနာ၏ အကောင့်ထဲတွင် နေ့စဉ် ဆေးသောက်ချိန် Noti တက်စေရန် User ID အလိုက် သီးခြား ခွဲခြားသတ်မှတ်ထားခြင်း',
          'အခြားလူနာများ၏ ဆေးသောက်သတိပေးချက်များနှင့် ရောထွေးမှုမရှိစေဘဲ မိမိသောက်ရမည့် ဆေးကိုသာ တိကျစွာ အသိပေးခြင်း'
        ]
      },
      {
        title: '🛡️ အက်မင် (Admin) အကောင့်တွင် လူနာများ၏ ဆေးသောက် Noti မတက်စေရန် သီးသန့် ကာကွယ်ခြင်း',
        icon: ShieldAlert,
        items: [
          'အက်မင် (Admin) သည် ဆေးခန်း/စနစ် စီမံခန့်ခွဲသူဖြစ်သည့်အတွက် လူနာများ၏ ဆေးသောက်ချိန် Reminder အချက်ပေးသံ သို့မဟုတ် Notification များ Admin စက်တွင် လုံးဝ မတက်စေရန် စနစ်တကျ ပိတ်ထားပေးခြင်း',
          'Notification Center Modal နှင့် Reminders Module တို့တွင် Admin များ မလိုအပ်သော ဆေးသောက် Alarm များ မမြင်တွေ့ရစေရန် သန့်ရှင်းစွာ ချိန်ညှိပေးထားခြင်း'
        ]
      },
      {
        title: '🔒 User-Scoped LocalStorage Data Isolation',
        icon: Users,
        items: [
          'အကောင့်တစ်ခုမှ အခြားအကောင့်တစ်ခုသို့ ပြောင်းလဲအသုံးပြုသည့်အခါ သတိပေးချက်များ (Notifications) နှင့် အချိန်မှတ်စနစ် (Reminders) များ မရောနှောစေရန် User ID အလိုက် သီးခြားစီ ခွဲခြားသိမ်းဆည်းပေးခြင်း'
        ]
      }
    ]
  },
  {
    version: 'v2.2.8',
    type: 'major',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာလ',
    isLatest: false,
    title: '📱 [MAJOR] Full Dropdown UI Upgrade: 100% Elimination of Mobile Horizontal Scrolls (ဘေးတိုက်ဆွဲ Scroll များကို Dropdown သို့ အပြီးတိုင် အဆင့်မြှင့်တင်ခြင်း)',
    badge: 'Previous Release (v2.2.8)',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    highlights: [
      {
        title: '🔬 ဓာတ်ခွဲခန်းစစ်ဆေးချက် အသစ်ထည့်သွင်းခြင်း (Lab Test Entry Modal) Category Dropdown သို့ ပြောင်းလဲခြင်း',
        icon: FlaskConical,
        items: [
          'မူလက ပါဝင်ခဲ့သော စစ်ဆေးချက် ကဏ္ဍ ၉ ခုပါ ဘေးတိုက်ရွေ့ရသည့် Horizontal Scroll bar အား ဖယ်ရှားပြီး မိုဘိုင်းဖုန်းတွင် လက်မတစ်ချက်တည်းဖြင့် လွယ်ကူစွာ ရွေးချယ်နိုင်သော Native Dropdown (<select>) ဖြင့် အစားထိုးခြင်း',
          'ဖုန်းမျက်နှာပြင်တွင် စာသားများ ဘေးဘက်သို့ ပြတ်တောက်ခြင်းနှင့် မလိုအပ်ဘဲ ဘေးသို့ဆွဲရသည့် အခက်အခဲကို အပြီးတိုင် ရှင်းလင်းဖြေရှင်းခြင်း'
        ]
      },
      {
        title: '📑 ဓာတ်ခွဲစစ်ဆေးချက်များ လမ်းညွှန် (Lab Investigation Guide) Category Dropdown ပြောင်းလဲခြင်း',
        icon: FileText,
        items: [
          'သွေး၊ ဆီး၊ ဝမ်း၊ ဓာတ်မှန် စစ်ဆေးမှု ကဏ္ဍများကို Horizontal scroll မပါဘဲ Dropdown ဖြင့် အလွယ်တကူ ရွေးချယ်နိုင်အောင် ပြင်ဆင်ခြင်း'
        ]
      },
      {
        title: '👶 ကလေးဖွံ့ဖြိုးမှုအဆင့်များ (Child Milestones) အသက်အရွယ်ရွေးချယ်မှု Dropdown သို့ အဆင့်မြှင့်တင်ခြင်း',
        icon: Users,
        items: [
          'အသက်အရွယ် အဆင့် ၁၀ ခုပါဝင်သော Horizontal bar အား Dropdown အဖြစ် အဆင့်မြှင့်တင်ပေးလိုက်သဖြင့် ဖုန်းစခရင်တွင် သပ်ရပ်စွာ အသုံးပြုနိုင်ခြင်း'
        ]
      },
      {
        title: '📱 မိုဘိုင်းဖုန်း Screen များတွင် Item များပြားပါက Dropdown စနစ်ဖြင့် သပ်ရပ်စွာ ပြသပေးခြင်း',
        icon: Smartphone,
        items: [
          'အိမ်တွင်းဆေးဝါး၊ သက်ကြီးစောင့်ရှောက်မှု၊ အမျိုးသမီးကျန်းမာရေး၊ အာဟာရနှင့် အိမ်တွင်းစစ်ဆေးမှု လမ်းညွှန်များတွင် ဖုန်းဖြင့်ကြည့်လျှင် Horizontal scroll မရှိစေဘဲ သပ်ရပ်သော Dropdown အလိုအလျောက် ပြသပေးခြင်း'
        ]
      }
    ]
  },
  {
    version: 'v2.2.7',
    type: 'major',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာလ',
    isLatest: false,
    title: '🩺 [MAJOR] Home Self-Testing Guide: Accurate Blood Pressure & Glucose Protocols (အိမ်တွင်း စစ်ဆေးမှု လမ်းညွှန်)',
    badge: 'Previous Release (v2.2.7)',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    highlights: [
      {
        title: '🩺 မှန်ကန်စွာ သွေးပေါင်ချိန်တိုင်းနည်း အဆင့်ဆင့်လမ်းညွှန် (Accurate Blood Pressure Protocol)',
        icon: Activity,
        items: [
          'မတိုင်းမီ ၅ မိနစ် အနားယူရန်၊ မိနစ် ၃၀ အတွင်း လက်ဖက်ရည်/ကော်ဖီ/ဆေးလိပ် ရှောင်ကြဉ်ရန်နှင့် ဆီးအောင့်မထားရန် ကြိုတင်ပြင်ဆင်မှုများ',
          'ကျောမှီပါသော ကုလားထိုင်တွင် ခြေထောက်မချိတ်ဘဲ ခါးမတ်မတ်ထိုင်ရန်၊ လက်မောင်းပတ် (Cuff) ကို တံတောင်ဆစ်အထက် ၁ လက်မအကွာတွင် နှလုံးအမြင့်နှင့် တစ်တန်းတည်း ပတ်ရန်',
          'တိုင်းနေစဉ် စကားမပြောဘဲ တိတ်ဆိတ်စွာနေရန်နှင့် ၂ မိနစ်ခြားပြီး ၂ ကြိမ်တိုင်းကာ ပျမ်းမျှတန်ဖိုးကို ယူရန် စံဆေးပညာ လမ်းညွှန်ချက်များ'
        ]
      },
      {
        title: '🩸 မှန်ကန်စွာ ဆီးချို/သွေးချို စစ်နည်း အဆင့်ဆင့်လမ်းညွှန် (Accurate Blood Glucose Protocol)',
        icon: Droplets,
        items: [
          'လက်ကို ရေနွေးနွေးနှင့် ဆပ်ပြာဖြင့် စင်ကြယ်စွာဆေးပြီး လုံးဝခြောက်သွေ့အောင် သုတ်ရန် (အသီးအနှံ/သကြားဓာတ် ကျန်ရှိနေပါက အဖြေမှားတတ်သည်)',
          'လက်ချောင်းထိပ် အလယ်မဟုတ်ဘဲ နာကျင်မှုသက်သာသည့် ဘေးဘောင်နံဘေးကို ထိုးရန်၊ ပထမဆုံးထွက်သော သွေးစက်ကို သုတ်ပစ်ပြီး ဒုတိယထွက်သော သွေးစက်ကိုသာ စတြစ်ပေါ်တင်ရန် (Golden Rule)',
          'အစာမစားမီ (Fasting FBS)၊ အစာစားပြီး ၂ နာရီ (PPBS) စစ်ဆေးချိန်များနှင့် ပန်းတိုင်စံနှုန်းများ၊ သွေးချို ၇၀ အောက်ကျဆင်းပါက ကယ်ဆယ်နိုင်မည့် Rule of 15 လမ်းညွှန်ချက်များ'
        ]
      },
      {
        title: '🌡️ ကိုယ်အပူချိန်၊ အောက်ဆီဂျင် (SpO2) နှင့် ကိုယ်အလေးချိန် စစ်ဆေးမှု လမ်းညွှန်များ',
        icon: Sparkles,
        items: [
          'ဒစ်ဂျစ်တယ်သာမိုမီတာဖြင့် လျှာအောက်နှင့် ချိုင်းကြား ကိုယ်အပူချိန် တိုင်းတာနည်းများ',
          'Pulse Oximeter လက်ထိပ်ညှပ်စက်ဖြင့် အောက်ဆီဂျင်စစ်ဆေးရာတွင် လက်သည်းဆိုးဆေးဖျက်ရန်နှင့် လက်အေးမနေစေရန် သတိပေးချက်များ',
          'ဆေးရုံ/ဆေးခန်းသို့ အရေးပေါ် သွားရောက်ပြသရမည့် Red Flag Warnings အချက်အလက်များ'
        ]
      },
      {
        title: '✅ အပြန်အလှန် တုံ့ပြန်နိုင်သော Pre-Test Checklists (Interactive Readiness Check)',
        icon: ShieldCheck,
        items: [
          'သွေးပေါင်မတိုင်းမီနှင့် ဆီးချိုမစစ်မီ မိမိကိုယ်တိုင် ပြင်ဆင်မှု ၅ ချက် အဆင်သင့်ဖြစ်မဖြစ် တိုက်ဆိုင်စစ်ဆေးနိုင်သည့် Interactive Checklists စနစ် ထည့်သွင်းပေးထားခြင်း'
        ]
      },
      {
        title: '⚡ React Rules of Hooks အစဉ်လိုက် လိုက်နာမှုနှင့် Runtime တည်ငြိမ်မှု အဆင့်မြှင့်တင်ခြင်း',
        icon: Gauge,
        items: [
          'Conditional return များ မတိုင်မီ Hooks အားလုံးကို တပြေးညီ sequential order အတိုင်း ခေါ်ယူစေပြီး Safari/iOS တွင် ဖြစ်ပေါ်တတ်သော resolveDispatcher Hook call error အား လုံးဝ အပြီးတိုင် ရှင်းလင်းဖြေရှင်းခြင်း',
          'Vite bundle deduplication ဖြင့် React 19 instance အငြင်းပွားမှု ကင်းဝေးစေရန် စနစ်ချောမွေ့အောင် ပြင်ဆင်ထားခြင်း'
        ]
      }
    ]
  },
  {
    version: 'v2.2.6',
    type: 'major',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာလ',
    isLatest: false,
    title: '🗂️ [MAJOR] Dual Cascading Category (Cat) & Sub-Category (Sub Cat) Dropdowns Navigation System',
    badge: 'Previous Release (v2.2.6)',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    highlights: [
      {
        title: '📂 အဓိကကဏ္ဍ (Cat) Dropdown စနစ်သစ် ထည့်သွင်းခြင်း (Category Dropdown)',
        icon: FileText,
        items: [
          'မူလက ဘေးတွင် စာသား Badge အဖြစ်သာရှိခဲ့သော အဓိကကဏ္ဍ (Category) ကို အသုံးပြုသူ စိတ်ကြိုက်ပြောင်းလဲနိုင်သော Dropdown အဖြစ် အဆင့်မြှင့်တင်လိုက်ခြင်း',
          'ကျန်းမာရေး မှတ်တမ်းများ၊ မိခင်/ကလေး/သက်ကြီး စောင့်ရှောက်မှု၊ သိမှတ်ဖွယ်ရာများ၊ အထူးကုနှင့် ကုထုံးများ၊ အရေးပေါ်နှင့် ကာကွယ်ရေး စသည့် ကဏ္ဍကြီးများကို အလွယ်တကူ ရွေးချယ်နိုင်ခြင်း'
        ]
      },
      {
        title: '📑 ရွေးထားသော ကဏ္ဍ၏ Sub Cat များကိုသာ Dropdown တွင် သီးသန့်ပြသခြင်း (Isolated Sub-Category Dropdown)',
        icon: Users,
        items: [
          'မူလက စနစ်တစ်ခုလုံးရှိ အခန်း ၂၅ ခုကျော် Dropdown ထဲတွင် တစ်ပြုံတည်း ရောနှောပေါ်နေ၍ မျက်စိရှုပ်ထွေးခဲ့သော ပြဿနာအား အပြီးတိုင် ဖယ်ရှားရှင်းလင်းလိုက်ခြင်း',
          'အဓိကကဏ္ဍ (Cat) တွင် "ကျန်းမာရေး မှတ်တမ်းများ" ရွေးထားပါက Sub Cat Dropdown တွင် သွေးပေါင်ချိန်၊ ဆီးချို၊ BMI၊ ဓာတ်ခွဲခန်း၊ ဆေးမှတ်တမ်း စသည့် ၎င်း၏ Sub Cat သီးသန့် ၇ မျိုးသာ ပေါ်လာမည်ဖြစ်ခြင်း',
          'အခြားကဏ္ဍ (ဥပမာ - သိမှတ်ဖွယ်ရာများ) ရွေးပါကလည်း ထိုကဏ္ဍနှင့် သက်ဆိုင်သော ဆောင်းပါး၊ အိမ်သုံးဆေးဝါး၊ ဓာတ်ခွဲစမ်းသပ်မှုလမ်းညွှန် စသည့် Sub Cat များသာ သန့်ရှင်းစွာ ပေါ်လာမည်ဖြစ်ခြင်း'
        ]
      },
      {
        title: '📱 ဖုန်းမျက်နှာပြင် အထူးသပ်ရပ်မှု (Mobile Responsive Category Selectors)',
        icon: Sparkles,
        items: [
          'ဖုန်း (iOS / Android) ပေါ်တွင် Dropdown ဖွင့်လိုက်ပါက စာမျက်နှာအပြည့် ဖုံးအုပ်ရှုပ်ထွေးနေခြင်း မရှိစေဘဲ ကဏ္ဍအလိုက် အလွန်ရှင်းလင်းစွာ ရွေးချယ်နိုင်ခြင်း',
          'ကျန်းမာရေးဆောင်းပါးများ (Health News) စာမျက်နှာတွင်လည်း ဖုန်းမျက်နှာပြင်၌ ခလုတ် ၁၈ ခု အတန်းလိုက် ရှုပ်နေခြင်းမရှိစေဘဲ Mobile Category Select Dropdown ဖြင့် သပ်ရပ်စွာ ထိန်းညှိပေးထားခြင်း'
        ]
      }
    ]
  },
  {
    version: 'v2.2.5',
    type: 'major',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာလ',
    isLatest: false,
    title: '🔬 [MAJOR] 1-Test-Per-Row Layout, Editable Lab Reference Ranges, Live Range Comparison & Selective Data Persistence',
    badge: 'Previous Release (v2.2.5)',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    highlights: [
      {
        title: '📋 စာတစ်ကြောင်းလျှင် စစ်ဆေးချက်တစ်ခုသာ ရှင်းလင်းစွာ ပြသခြင်း (1-Row-Per-Test Clean Layout)',
        icon: FileText,
        items: [
          'ကဏ္ဍပေါင်းစုံမှ စစ်ဆေးချက်များကို မျက်စိမရှုပ်စေဘဲ အတန်းတစ်တန်းလျှင် စစ်ဆေးချက် ၁ မျိုးစီ (စစ်ဆေးချက်အမည် + ရလဒ်ထည့်သွင်းရန်အကွက် + စံသတ်မှတ်ချက် + အခြေအနေပြတံဆိပ်) သပ်ရပ်ရှင်းလင်းစွာ စီစဉ်ပေးထားခြင်း',
          'အမျိုးအမည်ရှာဖွေရန် Search Bar နှင့် ကဏ္ဍခွဲ Filters များဖြင့် လွယ်ကူလျင်မြန်စွာ ရှာဖွေနိုင်ခြင်း'
        ]
      },
      {
        title: '⚙️ ဓာတ်ခွဲခန်းစံနှုန်း ယှဉ်ပြခြင်းနှင့် စိတ်ကြိုက်ပြင်ဆင်နိုင်ခြင်း (Side-by-Side & Editable Reference Ranges)',
        icon: Activity,
        items: [
          'စစ်ဆေးချက်တိုင်း၏ ဘေးတွင် Normal Lab Reference Value (ပုံမှန်စံနှုန်း) ကို ယှဉ်တွဲပြသပေးထားခြင်း',
          'အသုံးပြုသူ ပြသစစ်ဆေးခဲ့သော ဓာတ်ခွဲခန်း၏ စံသတ်မှတ်ချက်နှင့် မတူညီပါက "စံနှုန်းပြင်မည် ✏️" ခလုတ်ကို နှိပ်၍ မိမိဓာတ်ခွဲခန်း၏ Min/Max စံနှုန်းများကို စိတ်ကြိုက် ပြင်ဆင်သတ်မှတ်နိုင်ခြင်း',
          'လိုအပ်ပါက "မူလစံနှုန်းအတိုင်း ပြန်ထားမည်" ခလုတ်ဖြင့် စနစ်၏ ပုံမှန်စံနှုန်းသို့ ချက်ချင်း ပြန်လည်ပြောင်းလဲနိုင်ခြင်း'
        ]
      },
      {
        title: '⚡ စံနှုန်းနှင့်ချိန်ပြီး အချိန်နှင့်တပြေးညီ အခြေအနေပြသခြင်း (Real-Time Live Status Evaluation)',
        icon: Sparkles,
        items: [
          'ရလဒ်ဂဏန်း သို့မဟုတ် ဓာတ်ခွဲခန်းစံနှုန်း ရိုက်ထည့်လိုက်သည်နှင့် တစ်ပြိုင်နက် ပုံမှန် (Normal)၊ များနေသည် (High)၊ နည်းနေသည် (Low) သို့မဟုတ် အလွန်မြင့် (Critical) အခြေအနေများကို အရောင်နှင့် တံဆိပ်ဖြင့် တခါတည်း ချက်ချင်း တွက်ချက်ပြသပေးခြင်း'
        ]
      },
      {
        title: '💾 စစ်ဆေးထားသော အချက်အလက်များကိုသာ ရွေးချယ်သိမ်းဆည်းခြင်း (Selective Data Persistence)',
        icon: ShieldCheck,
        items: [
          'အသုံးပြုသူ မထည့်သွင်းခဲ့သော စစ်ဆေးချက်များကို Profile နှင့် Database ထဲတွင် အပိုသိမ်းဆည်းခြင်း မရှိစေဘဲ အမှန်တကယ် စစ်ဆေးဖြည့်သွင်းခဲ့သော ဓာတ်ခွဲချက်များကိုသာ (ဥပမာ ၃ မျိုးဖြည့်လျှင် ၃ မျိုးတည်းသာ) တိကျသန့်ရှင်းစွာ သိမ်းဆည်းပေးခြင်း',
          'သမိုင်းမှတ်တမ်းနှင့် အသေးစိတ်စာမျက်နှာများတွင်လည်း စစ်ဆေးခဲ့သည့် အရေအတွက်အတိုင်း ၁ ကြောင်းစီ သန့်ရှင်းစွာ ပြသပေးခြင်း'
        ]
      }
    ]
  },
  {
    version: 'v2.2.4',
    type: 'major',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာလ',
    isLatest: false,
    title: '🧪 [MAJOR] Comprehensive Lab Test Suite (8 Panels) & Zero Pre-filled Numbers Data Integrity',
    badge: 'Previous Release (v2.2.4)',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    highlights: [
      {
        title: '🧪 Comprehensive Lab Test Suite (ဓာတ်ခွဲခန်းစစ်ဆေးချက် ၈ ကဏ္ဍ အစုံအလင် တိုးမြှင့်ခြင်း)',
        icon: FlaskConical,
        items: [
          'မူလ ၄ မျိုးသာရှိခဲ့ရာမှ ဆေးပညာဆိုင်ရာ အခြေခံနှင့် အဆင့်မြင့် ဓာတ်ခွဲစစ်ဆေးချက် ၈ ကဏ္ဍစလုံးကို အပြည့်အစုံ ထည့်သွင်းပေးထားခြင်း',
          '၁။ သွေးဆဲလ်အစုံ (CBC - Hemoglobin, WBC, Platelets, RBC, PCV, ESR, Neutrophils, Lymphocytes)',
          '၂။ သွေးချို/သကြားဓာတ် (Glucose - Fasting FBS, 2-hr PPBS, RBS, 3-Month HbA1c)',
          '၃။ အသည်းလုပ်ဆောင်ချက် (LFT - SGPT/ALT, SGOT/AST, Bilirubin, ALP, Albumin, Total Protein, Globulin)',
          '၄။ ကျောက်ကပ်နှင့် ဓာတ်ဆားများ (RFT/Electrolytes - Creatinine, Uric Acid, BUN, eGFR, Sodium, Potassium, Chloride)',
          '၅။ သွေးတွင်းအဆီဓာတ် (Lipid Profile - Total Cholesterol, Triglycerides, HDL, LDL, VLDL)',
          '၆။ လည်ပင်းကြီးသိုင်းရွိုက်ဟော်မုန်း (TFT - TSH, Free T4, Free T3, Total T4, Total T3, Anti-TPO)',
          '၇။ ဆီးစစ်ဆေးခြင်း (Urine Routine & Microalbumin - Protein, Glucose, Pus Cells, RBC, Microalbumin)',
          '၈။ ရောင်ရမ်းမှုနှင့် ဗီတာမင်ဓာတ်များ (CRP, Ferritin, Vitamin D, Vitamin B12)'
        ]
      },
      {
        title: '🚫 Zero Pre-filled Numbers (ကြိုတင်ဖြည့်ဂဏန်းများ မပါရှိဘဲ သန့်ရှင်းစွာ ပြင်ဆင်ခြင်း)',
        icon: ShieldCheck,
        items: [
          'ဓာတ်ခွဲခန်း Form အကွက်များတွင် မူလက ကြိုတင်ထည့်သွင်းထားသော ဂဏန်းများ (Default pre-filled dummy numbers) အားလုံးကို လုံးဝ ဖယ်ရှားရှင်းလင်းပြီး သန့်ရှင်းသော Empty State ပြုလုပ်ပေးထားခြင်း',
          'အသုံးပြုသူ မဖျက်မိဘဲ မှားယွင်းသိမ်းဆည်းမိနိုင်သည့် ဆေးဘက်ဆိုင်ရာ အန္တရာယ်နှင့် ဒေတာမှားယွင်းမှုများကို ၁၀၀% အပြည့်အဝ ကာကွယ်ပေးထားခြင်း'
        ]
      }
    ]
  },
  {
    version: 'v2.2.3',
    type: 'minor',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာလ',
    isLatest: false,
    title: '🎨 [PATCH/MINOR] Dark Mode Heading Contrast Fix & User Name Visibility Resolution',
    badge: 'Previous Release (v2.2.3)',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    highlights: [
      {
        title: '🎨 Dark Mode Heading Contrast & User Name Fix (အသုံးပြုသူအမည် မမြင်ရခြင်း ပြဿနာ အပြီးတိုင် ပြင်ဆင်ခြင်း)',
        icon: Users,
        items: [
          'Dark Mode (အမှောင်ရောင်စနစ်) တွင် Global CSS ကြောင့် Heading စာလုံးများ အမည်းရောင်ဖြစ်ပြီး Background အမည်းနှင့် ထပ်တူကျကာ အသုံးပြုသူအမည် (ဥပမာ Mu Nwet Khint Zaw) မမြင်ရဘဲ ဖြစ်နေခဲ့သော Contrast ပြဿနာအား အပြီးတိုင် ပြင်ဆင်လိုက်ခြင်း',
          'အသုံးပြုသူကတ်များနှင့် အသုံးပြုသူ Profile Header များတွင် အသုံးပြုသူအမည်ကို Theme အားလုံး (Light & Dark) ၌ ၁၀၀% အပြည့်အဝ ထင်ရှားစွာ ပေါ်လွင်စေရန် ပြုပြင်ထားခြင်း'
        ]
      }
    ]
  },
  {
    version: 'v2.2.2',
    type: 'minor',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာလ',
    isLatest: false,
    title: '🛠️ [PATCH/MINOR] Syntax Error & Dev Server Asset Interception Fix',
    badge: 'Previous Release (v2.2.2)',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    highlights: [
      {
        title: '🛠️ Dev Server Asset Interception & Service Worker Fix (စနစ်အမှား ပြင်ဆင်ခြင်း)',
        icon: ShieldCheck,
        items: [
          'Vite Dev Server အတွင်း Service Worker မှ JS Module Asset များကို Intercept ပြုလုပ်၍ HTML ရလဒ် ပြန်ပေးမိသဖြင့် ဖြစ်ပေါ်တတ်သော SyntaxError: Unexpected token \'<\' အမှားအား အပြီးတိုင် ပြင်ဆင်ထားခြင်း',
          'Dev Server နှင့် Vite Build စနစ်၏ တည်ငြိမ်မှုကို ၁၀၀% အပြည့်အဝ အာမခံချက်ပေးနိုင်ရန် ပြုပြင်ထားခြင်း'
        ]
      }
    ]
  },
  {
    version: 'v2.2.1',
    type: 'minor',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာလ',
    isLatest: false,
    title: '👤 [PATCH/MINOR] Prominent User Display Name Formatting & Intelligent Email-Prefix Title-Case Resolution',
    badge: 'Previous Release (v2.2.1)',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    highlights: [
      {
        title: '👤 Prominent User Display Name Formatting (အသုံးပြုသူကတ်များတွင် နာမည် ထင်ရှားစွာ ဖော်ပြခြင်း)',
        icon: Users,
        items: [
          'အသုံးပြုသူကတ်ပြားများပေါ်တွင် အမည်မပါဘဲ အီးမေးလ်သီးသန့် ပေါ်နေသည့် ပြဿနာကို အပြီးတိုင် ဖြေရှင်းထားခြင်း',
          'အသုံးပြုသူကတ်တိုင်း၏ ထိပ်ဆုံးတွင် [အသုံးပြုသူ] Badge နှင့်အတူ ဖြည့်သွင်းထားသော အမည်အမှန် သို့မဟုတ် Auto-Formatted Title Case အမည် (ဥပမာ munwet -> Mu Nwet၊ khunthanshwe -> Khun Than Shwe) ကို ထင်ရှားစွာ ဖော်ပြပေးထားခြင်း'
        ]
      }
    ]
  },
  {
    version: 'v2.2.0',
    type: 'minor',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာလ',
    isLatest: false,
    title: '👤 [MINOR] System-Wide User Terminology Standardization, User Dropdown Filter & Real-Time Profile Name Sync',
    badge: 'Previous Release (v2.2.0)',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    highlights: [
      {
        title: '👤 User Terminology Standardization (စနစ်အနှံ့ အသုံးပြုသူ ဝေါဟာရ စံသတ်မှတ်ခြင်း)',
        icon: Users,
        items: [
          'Modals, Forms, Tables, Cards နှင့် Dashboard မျက်နှာပြင်များ အားလုံးတွင် "လူနာ" အစား "အသုံးပြုသူ" (User) ဟု စနစ်တကျ အစားထိုး ပြင်ဆင်ထားခြင်း'
        ]
      },
      {
        title: '🔍 User Selector Dropdown Filter (အသုံးပြုသူ သီးသန့် ရွေးချယ်မှု Filter)',
        icon: ShieldCheck,
        items: [
          'Dashboard နှင့် Trends Overview တွင် အသုံးပြုသူ ရွေးချယ်နိုင်သော Dropdown Filter ထည့်သွင်းပေးထားသဖြင့် သီးသန့် အသုံးပြုသူတစ်ဦးချင်းစီ၏ သွေးပေါင်ချိန်၊ သွေးချို၊ BMI နှင့် ဆေးမှတ်တမ်း Trend များကို လွယ်ကူစွာ စစ်ဆေးနိုင်ခြင်း'
        ]
      },
      {
        title: '✨ Real-Time Profile Name Synchronization (အသုံးပြုသူ အမည် အချိန်နှင့်တပြေးညီ ချိတ်ဆက်ခြင်း)',
        icon: Sparkles,
        items: [
          'အသုံးပြုသူ မိမိအမည် ဖြည့်သွင်းပါက Profile နှင့် Cloud Firestore ပေါ်တွင် နာမည်အမှန်အတိုင်း အချိန်နှင့်တပြေးညီ ချိတ်ဆက် ပေါ်လွင်စေခြင်း'
        ]
      }
    ]
  },
  {
    version: 'v2.1.9',
    type: 'minor',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာလ',
    isLatest: false,
    title: '📊 [MINOR] Chronological Graph Order, Data Point Numeric Value Labels & Timestamp Precision',
    badge: 'Previous Release (v2.1.9)',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    highlights: [
      {
        title: '📊 Blood Pressure Chronological Graph Order & Labels (သွေးပေါင်ချိန် Graph နှင့် ဂဏန်း Label များ)',
        icon: Gauge,
        items: [
          'သွေးပေါင်ချိန် Graph Trend ကို ရှေးကျသော ရက်စွဲမှ အသစ်ဆုံး ရက်စွဲသို့ (Chronological Ascending Order: ဥပမာ ၂၆-၉-၂၀၂၆၊ ၂၇-၉-၂၀၂၆၊ ၂၈-၉-၂၀၂၆) မှန်ကန်စွာ ရေးဆွဲပြသခြင်း',
          'Graph အမှတ်တစ်ခုချင်းစီပေါ်တွင် အပေါ်သွေး/အောက်သွေး တန်ဖိုး ဂဏန်း Label (Systolic/Diastolic Numeric Labels) များကို တိုက်ရိုက် တပ်ဆင်ဖော်ပြပေးခြင်း'
        ]
      },
      {
        title: '⏱️ Timestamp Precision for Latest BP Reading (နောက်ဆုံး သွေးပေါင်ချိန် တိကျစွာ ရွေးချယ်ခြင်း)',
        icon: ShieldCheck,
        items: [
          'နောက်ဆုံး သွေးပေါင်ချိန် (Latest Blood Pressure) ကို အမှန်တကယ် နောက်ဆုံး တိုင်းတာရရှိသော ရက်စွဲ/အချိန် timestamp အတိုင်း တိကျစွာ ရွေးချယ်ဖော်ပြခြင်း'
        ]
      }
    ]
  },
  {
    version: 'v2.1.8',
    type: 'minor',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာလ',
    isLatest: false,
    title: '🛠️ [PATCH/MINOR] TypeScript Safety, Error Boundary Protection & Offline Resilience',
    badge: 'Previous Release (v2.1.8)',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    highlights: [
      {
        title: '🛠️ TypeScript Type Safety & Null Handling (စနစ်အမှား ပြင်ဆင်ခြင်းနှင့် တည်ငြိမ်မှု)',
        icon: ShieldCheck,
        items: [
          'အပလီကေးရှင်းအတွင်း SyntaxError: Unexpected token \'<\' နှင့် TypeScript type mismatch error များကို လုံးဝရှင်းလင်း ပျောက်ကင်းအောင် ပြင်ဆင်ထားခြင်း',
          'Vitals နှင့် Lab test များတွင် ဒေတာမပြည့်စုံပါက ဖြစ်ပေါ်တတ်သော Null/Undefined value များကို Nullish coalescing ဖြင့် ချောမွေ့စွာ ထိန်းချုပ်ကာကွယ်ထားခြင်း'
        ]
      },
      {
        title: '🔒 Error Boundary & Offline State Resilience (အော့ဖ်လိုင်း တည်ငြိမ်မှု)',
        icon: Lock,
        items: [
          'အင်တာနက်ပြတ်တောက်နေချိန်တွင်လည်း ဒေတာမှတ်တမ်းများ မပျောက်ပျက်စေရန် LocalStorage မှတ်တမ်းသိုလှောင်မှုနှင့် UI Error Boundary ကို အဆင့်မြှင့်တင်ထားခြင်း',
          'Sidebar နှင့် Navigation Tab လဲလှယ်မှုများတွင် Component rendering ချောမွေ့စေရန် State Isolation စနစ် တပ်ဆင်ထားခြင်း'
        ]
      }
    ]
  },
  {
    version: 'v2.1.7',
    type: 'minor',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာလ',
    isLatest: false,
    title: '🧪 [MINOR] Chemical Name (Active Ingredient) Mandatory Field & Prescription Form Validation',
    badge: 'Previous Release (v2.1.7)',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
    highlights: [
      {
        title: '🧪 Chemical Name Mandatory Field (ဆေးအမည် အစစ် / Active Ingredient မထည့်မဖြစ် စစ်ဆေးခြင်း)',
        icon: Pill,
        items: [
          'Generic / Trade Name (Company ဆေးအမည် - ဥပမာ Biogesic, Norvasc) အပြင် Chemical Name (ဆေးအမည် အစစ် - ဥပမာ Paracetamol, Amlodipine) ကို မထည့်မဖြစ် (Required) စစ်ဆေး၍ ထည့်သွင်းစေခြင်း',
          'ဆေးမှတ်တမ်းများနှင့် အသုံးပြုသူ စာမျက်နှာများတွင် Trade Name နှင့် Chemical Name ကို သီးသန့် အသားပေး ခွဲခြားဖော်ပြပေးခြင်း'
        ]
      },
      {
        title: '🛡️ Prescription Form Validation & Input Sanitization (ဆေးဖောင် အမှားကာကွယ်ခြင်း)',
        icon: ShieldCheck,
        items: [
          'ဆေးအမည်၊ ဆေးပမာဏ (Dosage mg/ml) နှင့် သောက်သုံးပုံ ညွှန်ကြားချက်များ မပြည့်စုံဘဲ သိမ်းဆည်းမိခြင်း မရှိစေရန် Form Validation စစ်ဆေးမှု ထည့်သွင်းခြင်း',
          'အက္ခရာစာလုံးကြီး/ငယ် (Auto Title-case) စနစ်တကျ ပြုပြင်ပေးသော Auto Sanitization စနစ် ပါဝင်ခြင်း'
        ]
      }
    ]
  },
  {
    version: 'v2.1.6',
    type: 'minor',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာလ',
    isLatest: false,
    title: '📋 [MINOR] Medication Dosage & Administration Frequency Selector System',
    badge: 'Minor Release (v2.1.6)',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    highlights: [
      {
        title: '📋 Medication Frequency Dropdown (ဆေးသောက်ရမည့် အကြိမ်အရေအတွက် Dropdown)',
        icon: Pill,
        items: [
          'မနက် (၁) ကြိမ်၊ ည (၁) ကြိမ်၊ မနက် (၁) ကြိမ် + ည (၁) ကြိမ်၊ တရက် (၃) ကြိမ်၊ တရက် (၄) ကြိမ်၊ တရက် (၅) ကြိမ် စသည်တို့ကို Dropdown မှ တိုက်ရိုက်ရွေးချယ်နိုင်ခြင်း',
          'စိတ်ကြိုက် သောက်ရမည့် အကြိမ်အရေအတွက် ရေးသွင်းနိုင်သည့် Custom Option ပါဝင်ခြင်း'
        ]
      },
      {
        title: '⏰ Meal Timing & Administration Rules (အစာနှင့် ဆက်စပ် သောက်သုံးချိန် လမ်းညွှန်)',
        icon: Sparkles,
        items: [
          'အစာမစားမီ (Before Meal)၊ အစာစားပြီး (After Meal)၊ အစာနှင့်အတူ (With Meal) နှင့် အိပ်ရာဝင် (Bedtime) ဟူ၍ ဆေးသောက်ချိန် ညွှန်ကြားချက်များကို တိကျစွာ ရွေးချယ်နိုင်ခြင်း',
          'အစာအိမ် မထိခိုက်စေရန်နှင့် ဆေးအာနိသင် အပြည့်အဝ ရရှိစေရန် သောက်ချိန် စံသတ်မှတ်ချက်များ တွဲဖက် ဖော်ပြပေးထားခြင်း'
        ]
      }
    ]
  },
  {
    version: 'v2.1.5',
    type: 'minor',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာလ',
    isLatest: false,
    title: '🩺 [MINOR] Admin Medication Records Suite & Prescription Audit Portal',
    badge: 'Minor Release (v2.1.5)',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    highlights: [
      {
        title: '🩺 Admin Complete Medication Records (အသုံးပြုသူများ၏ ဆေးမှတ်တမ်း အပြည့်အစုံ ကြည့်ရှုနိုင်ခြင်း)',
        icon: Stethoscope,
        items: [
          'Admin အနေဖြင့် အသုံးပြုသူတစ်ဦးချင်းစီ၏ ဆေးအမည်၊ ဓာတ်ခွဲဓာတုအမည်၊ ဆေးပမာဏ (Dosage)၊ သောက်ချိန် (Frequency)၊ အစာနှင့် ဆက်စပ်မှု (Meal Timing)၊ စတင်သောက်သည့်ရက်နှင့် ဆေးညွှန်းဆရာဝန် မှတ်ချက်များကို အပြည့်အစုံ ကြည့်ရှုနိုင်ခြင်း'
        ]
      },
      {
        title: '📑 Prescription Audit & Historical Tracking (ဆေးညွှန်း မှတ်တမ်း စစ်ဆေးမှု)',
        icon: FileText,
        items: [
          'အသုံးပြုသူ မည်သည့်ဆေးဝါးကို မည်သည့်ကာလအထိ သောက်သုံးခဲ့သည်ကို စစ်ဆေးနိုင်သော Prescription Audit Trail စနစ်',
          'လက်ရှိသောက်ဆဲဆေးဝါး (Active) နှင့် သောက်သုံးပြီးရပ်နားထားသောဆေးဝါး (Discontinued) များ ခွဲခြားစစ်ဆေးနိုင်ခြင်း'
        ]
      }
    ]
  },
  {
    version: 'v2.1.4',
    type: 'minor',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာလ',
    isLatest: false,
    title: '🛠️ [MINOR] Admin Patient Card Name Aggregation & Multi-Source Discovery Fix',
    badge: 'Minor Release (v2.1.4)',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    highlights: [
      {
        title: '👥 Patient Card Name & Profile Aggregation Fix (လူနာကတ်များတွင် နာမည်မပေါ်ခြင်း ပြဿနာ ဖြေရှင်းခြင်း)',
        icon: Users,
        items: [
          'Admin ၏ လူနာစာရင်း (Patients Portal) တွင် Vitals, Glucose နှင့် BMI မှတ်တမ်းများမှ တစ်ဆင့် လူနာအမည်များကို အလိုအလျောက် ရှာဖွေပေါင်းစပ်ပေးခြင်း (Multi-Source Patient Discovery)',
          'အမည်မပေါ်သေးသော လူနာကတ်များအတွက် `userName` သို့မဟုတ် `patientName` မှ နာမည်အမှန်ကို အလိုအလျောက် ဖြည့်တင်းဖော်ပြပေးခြင်း'
        ]
      }
    ]
  },
  {
    version: 'v2.1.3',
    type: 'minor',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာလ',
    isLatest: false,
    title: '🚀 [MINOR] Automatic App Version Verification & Upgrade System',
    badge: 'Minor Release (v2.1.3)',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    highlights: [
      {
        title: '🔄 Automatic Version Check & Upgrade Modal (အလိုအလျောက် ဗားရှင်းစစ်ဆေးခြင်းနှင့် အဆင့်မြှင့်တင်ခြင်း)',
        icon: Sparkles,
        items: [
          'အပလီကေးရှင်းထဲသို့ ဝင်ရောက်လာသည်နှင့် တစ်ပြိုင်နက် နောက်ဆုံးထွက် ဗားရှင်း (`v2.1.3`) နှင့် ကိုက်ညီမှုရှိမရှိ အလိုအလျောက် စစ်ဆေးပေးခြင်း',
          'ဗားရှင်းအသစ်သို့ တင်မြှင့်ပြီးပါက အသစ်ပါဝင်လာသော အဓိက လုပ်ဆောင်ချက်များနှင့်အတူ အသိပေးချက် ပေါ့ပ်အပ် (Upgrade Modal) ပေါ်လာစေခြင်း',
          'Change Log ကို တိုက်ရိုက်ဝင်ရောက် ကြည့်ရှုနိုင်ပြီး အလွယ်တကူ စတင်အသုံးပြုနိုင်ခြင်း'
        ]
      }
    ]
  },
  {
    version: 'v2.1.2',
    type: 'minor',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာလ',
    isLatest: false,
    title: '🛠️ [MINOR] Sidebar Category Navigation Fix',
    badge: 'Minor Release (v2.1.2)',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    highlights: [
      {
        title: '📂 Sidebar Menu Category Navigation (ဘေးဘား မီနူးကဏ္ဍများ နှိပ်၍မရခြင်း ပြုပြင်ခြင်း)',
        icon: Activity,
        items: [
          'Sidebar ဘေးဘားရှိ ကျန်းမာရေး မှတ်တမ်းများ၊ သိမှတ်ဖွယ်ရာများ၊ မိခင်/ကလေး/သက်ကြီး၊ အထူးကုနှင့် ကုထုံးများ၊ အရေးပေါ် စသည့် ကဏ္ဍခေါင်းစဉ်များကို နှိပ်လိုက်ပါက သက်ဆိုင်ရာ ကဏ္ဍအလိုက် တိုက်ရိုက်ပြောင်းလဲ ပေါ်လာစေရန် အောင်မြင်စွာ ချိတ်ဆက်ပေးလိုက်ပါပြီ'
        ]
      }
    ]
  },
  {
    version: 'v2.1.1',
    type: 'minor',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာလ',
    isLatest: false,
    title: '🛠️ [MINOR] Weight (lb) & Height (ft/in) Tracker Units, Forgot Password Feature & Navigation UX Fixes',
    badge: 'Minor Release (v2.1.1)',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    highlights: [
      {
        title: '⚖️ BMI & Weight / Height Units Extension (ပေါင် နှင့် ပေ/လက်မ ဖြင့် ထည့်သွင်းနိုင်ခြင်း)',
        icon: Activity,
        items: [
          'ကိုယ်အလေးချိန် (Weight) ကို ကီလိုဂရမ် (kg) အပြင် ပေါင် (lb) ဖြင့်ပါ ရွေးချယ်ထည့်သွင်းနိုင်ခြင်း',
          'အရပ်အမောင်း (Height) ကို စင်တီမီတာ (cm) အပြင် ပေ နှင့် လက်မ (ft / in) ဖြင့်ပါ အလွယ်တကူ ရွေးချယ်တိုင်းတာနိုင်ခြင်း',
          'စနစ်မှ kg နှင့် cm သို့ အလိုအလျောက် တွက်ချက်ပြီး BMI ကို တိကျစွာ ಲೆಕ್ಕထုတ်ပေးခြင်း'
        ]
      },
      {
        title: '🔒 Forgot Password (စကားဝှက်မေ့နေပါသလား?) အင်္ဂါရပ်',
        icon: Lock,
        items: [
          'လော့ဂ်အင် ဝင်သည့်မျက်နှာပြင်တွင် စကားဝှက်မေ့ပါက အီးမေးလ်မှတစ်ဆင့် Password Reset လင့်ခ် တောင်းဆိုနိုင်သော ခလုတ်နှင့် Modal ထည့်သွင်းပေးခြင်း'
        ]
      },
      {
        title: '🔔 Notification Bell & Top Sticky Header Fixes',
        icon: Sparkles,
        items: [
          'အပေါ်ဆုံး Navbar ရှိ အသိပေးချက် ခေါင်းလောင်း (Bell Icon) နှိပ်မရသည့် ပြဿနာအား အပြည့်အစုံ ဖြေရှင်းပေးခြင်း',
          'Navbar နှင့် Marquee Banner တို့ကို Fixed Positioning ဖြင့် အခိုင်အမာ ချိတ်ဆက်ပေးပြီး Category Header သို့ Scroll ပြုလုပ်ရာတွင် တစ်ပါတည်း တွဲပါမသွားစေရန် စီစဉ်ပေးခြင်း'
        ]
      }
    ]
  },
  {
    version: 'v2.1.0',
    type: 'major',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာလ',
    isLatest: false,
    title: '🌟 [MAJOR] Women’s Health, Pregnancy & Maternal Care, Child Care, Developmental Milestones & Geriatric Elderly Care Suite',
    badge: 'Major Release (v2.1.0)',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    highlights: [
      {
        title: '🌸 အမျိုးသမီး ကျန်းမာရေးနှင့် ရောဂါများ ကဏ္ဍ (Women’s Health & Gynecology)',
        icon: Stethoscope,
        items: [
          'သားဥအိမ်ရေအိတ်တည်ခြင်း (PCOS) - ဟော်မုန်းမညီမျှမှု၊ လက္ခဏာများ၊ အစားအသောက်နှင့် လူနေမှုပုံစံ လမ်းညွှန်',
          'သားအိမ်အတွင်းသားနေရာလွဲရောဂါ (Endometriosis) နှင့် သားအိမ်အသားလုံး (Uterine Fibroids) အကြောင်းများ',
          'သားအိမ်ခေါင်းကင်ဆာ ကြိုတင်စစ်ဆေးမှု (Pap Smear / HPV Vaccine) နှင့် ရင်သားကင်ဆာ မိမိကိုယ်တိုင် စမ်းသပ်နည်း (BSE)',
          'သွေးဆုံးကိုင်ခြင်း (Menopause) လက္ခဏာများ၊ အရိုးပွရောဂါ ကာကွယ်ရေးနှင့် မိန်းမကိုယ် သန့်ရှင်းရေး (Hygiene)',
          'ရာသီစက်ဝန်းနှင့် သားဥကြွေရက် တွက်ချက်စနစ် (Period & Ovulation Calculator) နှင့် မီးယပ်လက္ခဏာ စစ်ဆေးလွှာ'
        ]
      },
      {
        title: '🤰 ကိုယ်ဝန်ဆောင် ကျန်းမာရေးနှင့် စောင့်ရှောက်မှု (Pregnancy & Maternal Care)',
        icon: Activity,
        items: [
          'သန္ဓေဆောင်ကာလ ၁၊ ၂၊ ၃ သုံးလပတ်အလိုက် မိခင်နှင့် သန္ဓေသား အပြောင်းအလဲများ၊ အာဟာရနှင့် ဆေးစစ်ချက်များ',
          'မဖြစ်မနေ ချက်ချင်း ဆေးရုံပြသရမည့် ကိုယ်ဝန်ဆောင် အရေးပေါ် အန္တရာယ်လက္ခဏာများ (Danger Signs)',
          'ကလေးမွေးဖွားမည့်ရက် ခန့်မှန်းတွက်ချက်စနစ် (EDD Calculator - Naegele Rule)',
          'ဗိုက်တွင်းကလေး လှုပ်ရှားမှု ရေတွက်ကိရိယာ (Interactive Fetal Kick Counter with Timer & Logs)',
          'မွေးဖွားရန် ဆေးရုံသွား အိတ်ပြင်ဆင်မှု စစ်ဆေးလွှာ (Interactive Hospital Bag Checklist)'
        ]
      },
      {
        title: '🍼 ကလေးငယ် ပြုစုစောင့်ရှောက်ရေး (Child & Pediatric Care - 0 to 5 Years)',
        icon: Pill,
        items: [
          'မွေးကင်းစကလေး ချက်ကြိုးသန့်ရှင်းရေး (Cord Care)၊ အသားဝါခြင်း (Jaundice) နှင့် လေထုတ်ပေးနည်းများ',
          'မိခင်နို့ သီးသန့်တိုက်ကျွေးခြင်း (Exclusive Breastfeeding) နှင့် အသက်အလိုက် ဖြည့်စွက်စာ အဆင့်ဆင့် ကျွေးနည်းဇယား',
          'ကလေးဖျားနာမှု အဆင့်သတ်မှတ်ခြင်းနှင့် အရေးပေါ် အကဲဖြတ်စနစ် (Pediatric Fever Triage Tool)',
          'ကလေး ဝမ်းလျှောခြင်းတွင် ဓာတ်ဆားရည် (ORS) ဖျော်စပ်တိုက်ကျွေးနည်းနှင့် ရေဓာတ်ခမ်းောက်မှု စစ်ဆေးခြင်း'
        ]
      },
      {
        title: '🏆 ကလေးဖွံ့ဖြိုးမှု မှတ်တိုင်များ စစ်ဆေးမှတ်တမ်း (Child Developmental Milestones)',
        icon: Sparkles,
        items: [
          'အသက် ၂ လ၊ ၄ လ၊ ၆ လ၊ ၉ လ၊ ၁ နှစ်၊ ၁ နှစ်ခွဲ၊ ၂ နှစ်၊ ၃ မှ ၅ နှစ် CDC & WHO မှတ်တိုင်များ',
          'ကာယလှုပ်ရှားမှု၊ ဘာသာစကား၊ တွေးခေါ်ကြံဆမှုနှင့် လူမှုဆက်ဆံရေး နယ်ပယ် ၄ ရပ်အလိုက် စစ်ဆေးနိုင်ခြင်း',
          'မိဘများ ကလေးဖွံ့ဖြိုးမှု တိုးတက်အောင် လေ့ကျင့်ပေးနိုင်သော နည်းလမ်းများနှင့် ကစားနည်းများ (Parent Tips)',
          'သတိပြုရမည့် ဖွံ့ဖြိုးမှု နှောင့်နှေးခြင်း သတိပေးလက္ခဏာများ (Developmental Red Flags)'
        ]
      },
      {
        title: '👵 သက်ကြီးရွယ်အို စောင့်ရှောက်ရေး (Geriatric & Elderly Care)',
        icon: ShieldCheck,
        items: [
          'မေ့လျော့ရောဂါ (Dementia / Alzheimer’s) နှင့် သက်ကြီးစိတ်ကျန်းမာရေး ပြုစုစောင့်ရှောက်မှု',
          'အိမ်တွင်း ချော်လဲခြင်း အန္တရာယ် စစ်ဆေးလွှာ (Interactive Home Fall-Risk Screener)',
          'အိပ်ရာထဲ လဲနေသော သက်ကြီးရွယ်အိုများ ဖိအားဒဏ်ရာ (Bed Sore) ကာကွယ်နည်း (၂ နာရီတစ်ကြိမ် စောင်းပေးခြင်း)',
          'ဆေးဝါး ဘေးကင်းစွာ သောက်သုံးရေး (Polypharmacy Management) နှင့် အစာမျိုရခက်ခြင်း (Dysphagia) အာဟာရ'
        ]
      },
      {
        title: '🔬 သိမှတ်ဖွယ်ရာများ (Health Knowledge & Guides)',
        icon: Database,
        items: [
          'ကျန်းမာရေးဆောင်းပါးများ (Health Articles) စုံလင်စွာ ထည့်သွင်းပေးထားခြင်း',
          'အိမ်သုံးဆေးဝါးလမ်းညွှန် (OTC Medicines Guide) အသုံးပြုနည်း လမ်းညွှန်များ',
          'ဓာတ်ခွဲ/စမ်းသပ်မှုလမ်းညွှန် (Investigation Guides) - သွေးစစ်၊ ဆီးစစ်၊ ဓာတ်မှန်စသည့် စစ်ဆေးချက်များ၏ ပုံမှန်စံနှုန်းများ နှင့် အဓိပ္ပာယ်များ'
        ]
      }
    ]
  },
  {
    version: 'v2.0.0',
    type: 'major',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာလ (Major Healthcare Ecosystem & Security Release)',
    isLatest: false,
    title: '🌟 [MAJOR] Speciality Health Articles, Household OTC Medicines Guide, Data Privacy & Security, Medical Disclaimer & Admin Broadcast Marquee System',
    badge: 'Major Release (v2.0.0)',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    highlights: [
      {
        title: '🩺 အထူးကု ကျန်းမာရေး ဆောင်းပါးများ စုံလင်စွာ ထည့်သွင်းခြင်း (Specialty Health Articles)',
        icon: Stethoscope,
        items: [
          'သွားနှင့် ခံတွင်း (Dental Care) - သွားဖုံးရောင်ခြင်း၊ သွားကျောက်ခြစ်ခြင်း (Scaling)၊ သွားတိုက်နည်းစနစ်နှင့် သွားပိုးစားခြင်း ကာကွယ်နည်းများ',
          'မျက်စိနှင့် အမြင်အာရုံ (Ophthalmology) - မျက်စိတိမ် (Cataract)၊ ရေကြည်တိမ် (Glaucoma) ခြားနားချက်နှင့် ဆီးချိုကြောင့် မျက်စိမထိခိုက်စေရန် စစ်ဆေးနည်းများ',
          'နား၊ နှာခေါင်း၊ လည်ချောင်း (ENT Care) - နားပြည်ယိုခြင်း၊ နားကိုက်ခြင်း၊ နားကြပ် 60/60 Rule စည်းမျဉ်းနှင့် နားစည်ထိန်းသိမ်းနည်းများ',
          'အရေပြားနှင့် အလှအပ (Dermatology) - ဝက်ခြံ၊ အမဲစက်၊ နေလောင်ကာ Sunscreen SPF 50+ နှင့် မြန်မာ့ရာသီဥတု Skincare လမ်းညွှန်',
          'အရိုးနှင့် အဆစ် (Orthopedics) - အရိုးပါးရောဂါ (Osteoporosis)၊ ကယ်လ်ဆီယမ်နှင့် ဗီတာမင်ဒီ ဖြည့်စွက်နည်းများ',
          'အာရုံကြောနှင့် ဦးနှောက် (Neurology) - ခေါင်းတစ်ခြမ်းကိုက်ခြင်း (Migraine) နှင့် စိတ်ဖိစီးမှုကြောင့် ခေါင်းကိုက်ခြင်း သက်သာစေမည့် ကုထုံးများ'
        ]
      },
      {
        title: '💊 အိမ်သုံး ဆေးဝါးများ အသုံးပြုပုံ လမ်းညွှန် (Household OTC Medicines Guide)',
        icon: Pill,
        items: [
          'ပါရာစီတမော၊ ဓာတ်ဆား (ORS)၊ အစာအိမ် လေဆေး (Antacid)၊ စတီရီဇင်း (Cetirizine)၊ ဒွန်ပါရီဒုန်း၊ ပိုဗီဒုန်း အိုင်အိုဒင်း၊ ချောင်းဆိုးသလိပ်ပျော်ဆေးနှင့် ဒဏ်ကြေလိမ်းဆေးများ စုံလင်စွာ ပါဝင်ခြင်း',
          'အသုံးပြုပုံ (Indications & Usage)၊ အနည်းဆုံး ပမာဏ (Min Dose)၊ အများဆုံး ပမာဏ (Max Dose) နှင့် ကလေးဆေးပမာဏ (Child Dose) အတိအကျ ဖော်ပြထားခြင်း',
          'ဖြစ်နိုင်သော ဘေးထွက်ဆိုးကျိုးများ (Side Effects) နှင့် လိုက်နာရန် သတိပြုချက်များ (Precautions & Warnings)',
          'မတည့်သော ဆေးဝါးများ (Drug Interactions) နှင့် မတည့်သော အစားအသောက်/အရက် (Food Interactions) အသေးစိတ် လမ်းညွှန်'
        ]
      },
      {
        title: '📢 User များထံ စာတန်းပြေးဖြင့် သတိပေးချက် လွှင့်တင်ခြင်း (Admin Broadcast Marquee Ticker)',
        icon: Megaphone,
        items: [
          'Admin Portal မှနေ၍ အသုံးပြုသူ လူနာအားလုံး မြင်တွေ့နိုင်သော ပြေးနေသော စာတန်း (Live Marquee Ticker) အသစ်များကို တိုက်ရိုက် ထည့်သွင်း/ဖွင့်/ပိတ်/ဖျက်နိုင်ခြင်း',
          'သာမန်အသိပေးချက် (Info)၊ ကျန်းမာရေး သတိပေးချက် (Warning) နှင့် အရေးပေါ် (Urgent) စာတန်းပြေး အမျိုးအစား ၃ မျိုး ခွဲခြား သတ်မှတ်နိုင်ခြင်း',
          'Pause & Play ခလုတ်နှင့် စာတန်းပြေး Hover အလိုက် ခေတ္တရပ်တန့် ဖတ်ရှုနိုင်သော UX ပါဝင်ခြင်း'
        ]
      },
      {
        title: '🛡️ မူဝါဒနှင့် ဒေတာ လုံခြုံရေး မူဘောင် (Privacy Policy & Security Framework)',
        icon: Lock,
        items: [
          'လူနာများ၏ သွေးတိုး၊ ဆီးချို၊ BMI၊ ဓာတ်ခွဲခန်း ဆေးစစ်ချက်မှတ်တမ်းများကို TLS 1.3 နှင့် AES-256 Bit Encryption စနစ်ဖြင့် Google Cloud Firestore ပေါ်တွင် လုံခြုံစွာ သိုလှောင်ထားခြင်း',
          'အချက်အလက်များကို တတိယအဖွဲ့အစည်းနှင့် စီးပွားရေး ကြော်ငြာများထံ လုံးဝ (Zero) မရောင်းချ/မမျှဝေသော 100% Confidentiality Guarantee',
          'လူနာကိုယ်တိုင် မိမိမှတ်တမ်းများကို A4 PDF ထုတ်ယူနိုင်ခြင်းနှင့် စနစ်အတွင်းမှ အပြီးတိုင် ဖျက်ပစ်နိုင်သော Data Ownership အခွင့်အရေး'
        ]
      },
      {
        title: '⚠️ ကျန်းမာရေး ဗဟုသုတ သီးသန့်ဖြစ်ကြောင်း ဆေးဘက်ဆိုင်ရာ အသိပေးချက် (Medical Knowledge Disclaimer)',
        icon: AlertTriangle,
        items: [
          'အက်ပလီကေးရှင်း၏ ထိပ်ဆုံး၊ Footer၊ ဆောင်းပါးများနှင့် အိမ်သုံးဆေးဝါး ကဏ္ဍများတွင် ဤ App သည် အထွေထွေ ကျန်းမာရေး ဗဟုသုတနှင့် မိသားစု မှတ်တမ်းတင်ရန် သီးသန့်ဖြစ်ပြီး ဆရာဝန်၏ တိုက်ရိုက်ကုသမှုကို အစားမထိုးကြောင်း ရှင်းလင်းစွာ အသိပေးထားခြင်း'
        ]
      },
      {
        title: '🏷️ Major / Minor ဗားရှင်း ခွဲခြားသတ်မှတ်ခြင်း စနစ် (Version Hierarchy Classification)',
        icon: Tag,
        items: [
          'အပြောင်းအလဲ ကြီးမားသော အဆင့်မြှင့်တင်မှုများကို [MAJOR] အဖြစ်လည်းကောင်း၊ ချို့ယွင်းချက်ပြင်ဆင်မှုနှင့် UI ပြုပြင်မှုများကို [MINOR] အဖြစ်လည်းကောင်း စနစ်တကျ ခွဲခြား၍ Change Log တွင် မှတ်တမ်းတင်ပေးထားခြင်း'
        ]
      }
    ]
  },
  {
    version: 'v1.7.0',
    type: 'minor',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာလ (Grammar Spelling, Zero Horizontal Scroll & Categorized Navigation Update)',
    isLatest: false,
    title: '🇲🇲 [MINOR] မြန်မာစာလုံးပေါင်း ပြင်ဆင်ချက်များ၊ Horizontal Scroll လုံးဝ မရှိသော UX နှင့် Categorized Sub-Navigation Bar Update',
    badge: 'Minor Release (v1.7.0)',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    highlights: [
      {
        title: '🇲🇲 မြန်မာစာလုံးပေါင်း စနစ်တကျ ပြုပြင်ပေးခြင်း (Grammar & Spelling Corrections)',
        icon: CheckCircle2,
        items: [
          'အက်ပလီကေးရှင်း တစ်ခုလုံးရှိ "ဇတ်ကြော / ဇာတ်ကြော" စာလုံးပေါင်းများကို မှန်ကန်သော မြန်မာစာလုံးပေါင်း "ဇက်ကြော" (ဇက်ကြောတက်၊ ဇက်ကြောနှိပ်) သို့ စနစ်တကျ အစားထိုး ပြင်ဆင်ပေးခြင်း',
          'ရှေးဦးပြုစုခြင်းနှင့် ကျန်းမာရေး ဆောင်းပါးများပါ "အသက်ရှူရက်တာ" ကို မှန်ကန်သော စာလုံးပေါင်း "အသက်ရှူရပ်တာ" သို့ စနစ်တကျ ပြင်ဆင်ပေးခြင်း'
        ]
      },
      {
        title: '📱 Horizontal Scroll လုံးဝ ဖြုတ်ပစ်ခြင်း (Zero Horizontal Scroll Across Entire App)',
        icon: Smartphone,
        items: [
          'မော်ဂျူး အသီးသန့် (Physiotherapy, Specialty Care, Dermatology, Emergency, Admin Patient Portal) များရှိ ရွေးချယ်မှု ဘားများနှင့် Tab chip များအား ဘေးသို့ horizontal scroll လုပ်ရန် မလိုဘဲ Flex Wrap, Responsive Category Dropdown များနှင့် Grid View ဖြင့် ရွေးချယ်နိုင်အောင် UX ပြောင်းလဲ ပေးထားခြင်း'
        ]
      },
      {
        title: '🗂️ သပ်သပ်ရပ်ရပ် Categorized Sub-Navigation & Module Selector Dropdown',
        icon: Tag,
        items: [
          'Header / Navigation တွင် ခလုတ်များ ပြန့်ကျဲ ရှုပ်ထွေးနေခြင်းကို သန့်ရှင်းသပ်ရပ်စေရန် မော်ဂျူး ၁၆ ခုလုံးကို Category ၄ ခု (အထွေထွေ ကျန်းမာရေး မှတ်တမ်း၊ အထူးကုနှင့် လူနေမှုဘဝ၊ အရေးပေါ်နှင့် ကာကွယ်ရေး၊ စနစ်စွမ်းဆောင်ရည်) ခွဲခြား၍ Dropdown နှင့် Segmented Navigation Bar အဖြစ် သပ်သပ်ရပ်ရပ် ပြန်လည် စီစဉ်ပေးထားခြင်း'
        ]
      },
      {
        title: '📋 Change Log & Version History Transparency (ပြောင်းလဲမှု မှတ်တမ်း)',
        icon: History,
        items: [
          'အသုံးပြုသူ တောင်းဆိုထားသော ပြင်ဆင်မှုများနှင့် အဆင့်မြှင့်တင်မှုများ အားလုံးကို Version History & Change Log တွင် အသေးစိတ် ပွင့်လင်းမြင်သာစွာ မှတ်တမ်းတင်ပေးထားခြင်း'
        ]
      }
    ]
  },
  {
    version: 'v1.6.0',
    type: 'major',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာလ (Dental, Eye, Ear, Skincare & Emergency First Aid Update)',
    isLatest: false,
    title: '🦷 [MAJOR] Dental, Eye, Ear Specialities, Dermatology Skincare & Emergency First Aid Protocol',
    badge: 'Major Release (v1.6.0)',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    highlights: [
      {
        title: '🦷 သွား၊ မျက်စိ နှင့် နား/အကြားအာရုံ အထူးကု မှတ်တမ်းနှင့် စစ်ဆေးမှုများ (Specialties Module)',
        icon: Stethoscope,
        items: [
          'သွားကျန်းမာရေး ပြသမှု မှတ်တမ်း၊ သွား ၃၂ ချောင်း Interactive Teeth Chart နှင့် ၂ မိနစ် သွားတိုက် နာရီစနစ် (Brushing Coach)',
          'မျက်စိ အမြင်အာရုံ စစ်ဆေးမှု (Snellen Vision Chart Simulator)၊ Ishihara ရောင်စုံ ကာလာဘလိုင်းနက် စစ်ဆေးမှုနှင့် မျက်မှန်/မျက်စိပါဝါ (OD/OS) မှတ်တမ်းများ',
          'နားနှင့် အကြားအာရုံ Sound Tone Generator (250Hz - 8000Hz) စမ်းသပ်မှုနှင့် နားစည်ကာကွယ်ရေး လမ်းညွှန်များ'
        ]
      },
      {
        title: '✨ အရေပြား ကျန်းမာရေးနှင့် မြန်မာ့ရာသီ အလှအပ (Dermatology & Skincare Module)',
        icon: Sparkles,
        items: [
          'မိမိ အရေပြား အမျိုးအစား (Dry, Oily, Combination, Sensitive, Normal) စစ်ဆေးပေးသော Interactive Quiz',
          'မှဲ့နှင့် အရေပြား ကင်ဆာ သတိပေးစနစ် (ABCDE Warning Criteria) စစ်ဆေးမှု',
          'ဝက်ခြံ၊ ကြက်သားအရေပြား/Eczema၊ ပွေး/ညှင်း၊ ဓာတ်မတည့်အဖုအပိန့်များ ပြုစုကုသနည်းနှင့် မြန်မာ့ရာသီဥတု Skincare လမ်းညွှန်များ'
        ]
      },
      {
        title: '🚨 အရေးပေါ် ကျန်းမာရေးနှင့် ရှေးဦးပြုစုခြင်း (Emergency First Aid Protocol)',
        icon: Activity,
        items: [
          'မြွေကိုက်၊ ခွေး/ကြောင်ကိုက်၊ ကင်း/ပျားတုပ်ခြင်းအတွက် အချိန်မီ သွေးအဆိပ်ဖြေပစ္စည်းနှင့် ရှေးဦးပြုစုနည်းများ',
          'အပူလောင်ခြင်း (၁st, ၂nd, ၃rd Degree) ရေအေး မိနစ် ၂၀ လောင်းခြင်း စည်းမျဉ်းနှင့် သွေးထွက်လွန်ခြင်း ဖိအားပေးနည်းများ',
          'ဓာတ်မတည့် ပြင်းထန်မှု (Anaphylaxis)၊ သီးခြင်း (Heimlich Maneuver) နှင့် CPR နှလုံးနှိုးဆွခြင်း 30:2 Rhythm လမ်းညွှန်များ'
        ]
      }
    ]
  },
  {
    version: 'v1.5.0',
    type: 'major',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာလ (Physiotherapy & Rehabilitation Update)',
    isLatest: false,
    title: '🏃 [MAJOR] Physiotherapy Exercises, Interactive Reps Timer & Physical Rehab Guides',
    badge: 'Major Release (v1.5.0)',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    highlights: [
      {
        title: '🏃 Physiotherapy & Physical Rehab Module (အရိုး၊ အကြောနှင့် ကာယကုထုံး)',
        icon: Activity,
        items: [
          'ခါးနာ၊ ဇက်ကြောတက်၊ ဒူးဆစ်အဆစ်ရောင်ခြင်း၊ လေဖြတ်ပြီး ပြန်လည်သန်စွမ်းရေး၊ Office Syndrome နှင့် သက်ကြီးရွယ်အို ဟန်ချက်ထိန်း လေ့ကျင့်ခန်းများ စနစ်တကျ ပါဝင်ခြင်း',
          'ခန္ဓာကိုယ် နာကျင်သည့်နေရာအလိုက် (Neck, Shoulder, Back, Knee, Arm) သီးသန့် ကာယကုထုံးများ ရှာဖွေနိုင်သော Interactive Body Area Selector',
          'စက္ကန့် တိုက်ရိုက် ရေတွက်စနစ် (Timer)၊ အကြောလျှော့/အကြိမ်ရေ ရေတွက်စနစ် (Reps Counter) နှင့် audio beep cue ပါရှိသော Live Exercise Runner Mode',
          'ယနေ့ ပြုလုပ်ပြီးသမျှ လေ့ကျင့်ခန်းများနှင့် နေ့စဉ် streak တိုးတက်မှုကို မှတ်တမ်းတင်ပေးသော Daily Rehab Tracker'
        ]
      },
      {
        title: '📚 Physiotherapy Health Articles (ကာယကုထုံး ကျန်းမာရေး ဆောင်းပါးများ)',
        icon: Sparkles,
        items: [
          'ခါးနာဇက်ကြောတက်သူများ၊ လေဖြတ်လူနာများ၊ ဒူးဆစ်ရောင်သူများနှင့် ရုံးဝန်ထမ်းများအတွက် အိမ်မှာတင် ပြုလုပ်နိုင်သည့် ဆေးခန်းအဆင့် ကာယကုထုံး ဆောင်းပါး ၅ ပုဒ် ထပ်မံဖြည့်သွင်းပေးခြင်း'
        ]
      }
    ]
  },
  {
    version: 'v1.4.0',
    type: 'major',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာလ (All-In-One Major Healthcare Release)',
    isLatest: false,
    title: '📄 [MAJOR] Health Passport PDF, Vaccination Tracker, Emergency ID Card & Clinical Nutrition Guide',
    badge: 'Major Release (v1.4.0)',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    highlights: [
      {
        title: '📄 Medical Health Passport / Print & PDF Summary Report',
        icon: Activity,
        items: [
          'ဆရာဝန်ပြသရန် သို့မဟုတ် ဆေးခန်းတင်ပြရန်အတွက် သွေးတိုး၊ ဆီးချို၊ BMI၊ ဓာတ်ခွဲခန်းစစ်ဆေးချက်များ၊ လက်ရှိသောက်ဆေးများနှင့် အရေးပေါ် အချက်အလက်များကို A4 Size Printable PDF Health Passport အဖြစ် ၁-ချက်နှိပ်ရုံဖြင့် ထုတ်ယူနိုင်ခြင်း'
        ]
      },
      {
        title: '💉 Vaccination Tracker & Child/Adult Immunization Passport',
        icon: Sparkles,
        items: [
          'ဘီပိုး၊ တုပ်ကွေး၊ မေးခိုင်၊ COVID-19၊ HPV၊ ဝက်သက် နှင့် ဦးနှောက်ရောင် ကာကွယ်ဆေးများ၏ ထိုးနှံပြီးစီးမှုနှင့် နောက်တစ်ကြိမ် ထိုးနှံရမည့် ရက်စွဲများကို စနစ်တကျ မှတ်တမ်းတင် ထိန်းသိမ်းနိုင်ခြင်း'
        ]
      },
      {
        title: '🚨 Emergency Medical ID / Pocket Card',
        icon: ShieldCheck,
        items: [
          'သွေးအမျိုးအစား၊ ဓာတ်မတည့်သော ဆေးဝါးများ၊ အဓိက အရေးပေါ် ဆက်သွယ်ရန် ဖုန်းနံပါတ် (Direct Click-To-Call) နှင့် ပြသနေသော ဆရာဝန်/ဆေးရုံ အချက်အလက်ပါရှိသော အရေးပေါ် ကျန်းမာရေးကတ်ပြား'
        ]
      },
      {
        title: '🥗 Clinical Diet & Nutrition Guide for Hypertension & Diabetes',
        icon: Gauge,
        items: [
          'သွေးတိုးရောဂါရှင်များအတွက် DASH Diet၊ ဆီးချိုရောဂါရှင်များအတွက် Glycemic Index နည်းသော အာဟာရနှင့် မြန်မာ့ရိုးရာ ဟင်းလျာများ ကျန်းမာရေးနှင့်ညီညွတ်စွာ ချက်ပြုတ်နည်း လမ်းညွှန်များ'
        ]
      }
    ]
  },
  {
    version: 'v1.3.7',
    type: 'minor',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာလ (Notification & Audio Alert Update)',
    isLatest: false,
    title: '🔔 [MINOR] Health Notifications & Custom Reminders Center, Alarms & Audio Push Alert System',
    badge: 'Minor Release (v1.3.7)',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
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
      }
    ]
  }
];

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({ isOpen, onClose }) => {
  const [selectedVersion, setSelectedVersion] = useState<string>(VERSION_HISTORY_DATA[0].version);
  const [filterType, setFilterType] = useState<'all' | 'major' | 'minor'>('all');

  if (!isOpen) return null;

  const filteredHistory = VERSION_HISTORY_DATA.filter(v => {
    if (filterType === 'all') return true;
    return v.type === filterType;
  });

  const currentDetail = VERSION_HISTORY_DATA.find(v => v.version === selectedVersion) || VERSION_HISTORY_DATA[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-purple-50 via-teal-50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                  Version History & Change Log (ပြောင်းလဲမှု မှတ်တမ်း)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {VERSION_HISTORY_DATA[0].version}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                စနစ်အတွင်း ပြုပြင်ခဲ့သမျှ Major / Minor ပြောင်းလဲမှု မှတ်တမ်းများ အပြည့်အစုံ
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

        {/* Content Body: Left Version Nav & Right Details */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          
          {/* Left Column: Version Selector & Filter Tabs */}
          <div className="md:col-span-4 p-4 space-y-3 bg-slate-50/70">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setFilterType('all')}
                className={`flex-1 py-1 rounded-lg transition-colors cursor-pointer text-center ${
                  filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                အားလုံး ({VERSION_HISTORY_DATA.length})
              </button>
              <button
                onClick={() => setFilterType('major')}
                className={`flex-1 py-1 rounded-lg transition-colors cursor-pointer text-center ${
                  filterType === 'major' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Major ({VERSION_HISTORY_DATA.filter(v => v.type === 'major').length})
              </button>
              <button
                onClick={() => setFilterType('minor')}
                className={`flex-1 py-1 rounded-lg transition-colors cursor-pointer text-center ${
                  filterType === 'minor' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Minor ({VERSION_HISTORY_DATA.filter(v => v.type === 'minor').length})
              </button>
            </div>

            <div className="space-y-2">
              {filteredHistory.map((item) => {
                const isSelected = item.version === selectedVersion;
                return (
                  <button
                    key={item.version}
                    onClick={() => setSelectedVersion(item.version)}
                    className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                        : 'bg-white border border-slate-200 hover:border-purple-300 text-slate-700'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm">{item.version}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                          item.type === 'major'
                            ? isSelected ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'
                            : isSelected ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-700'
                        }`}>
                          {item.type}
                        </span>
                        {item.isLatest && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            Latest
                          </span>
                        )}
                      </div>
                      <p className={`text-[10px] truncate max-w-[170px] ${isSelected ? 'text-purple-100' : 'text-slate-400'}`}>
                        {item.releaseDate}
                      </p>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Version Details */}
          <div className="md:col-span-8 p-5 sm:p-6 space-y-6">
            {/* Version Title Card */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-lg sm:text-xl font-bold text-slate-900">
                    {currentDetail.version}
                  </h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentDetail.badgeColor}`}>
                    {currentDetail.badge}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    currentDetail.type === 'major' ? 'bg-purple-100 text-purple-800' : 'bg-teal-100 text-teal-800'
                  }`}>
                    {currentDetail.type} Update
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  ထုတ်ဝေသည့်ရက်: {currentDetail.releaseDate}
                </p>
              </div>
            </div>

            {/* Version Summary Banner */}
            <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200 text-purple-950 text-xs font-medium">
              {currentDetail.title}
            </div>

            {/* Highlights Sections */}
            <div className="space-y-4">
              {currentDetail.highlights.map((sec, idx) => {
                const IconComponent = sec.icon;
                return (
                  <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                      <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span>{sec.title}</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700 pl-2">
                      {sec.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-2 leading-relaxed">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
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

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            Family Health Track • Version {VERSION_HISTORY_DATA[0].version}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer transition-colors shadow-xs"
          >
            ပိတ်မည်
          </button>
        </div>

      </div>
    </div>
  );
};
