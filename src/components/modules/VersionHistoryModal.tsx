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
  FileText
} from 'lucide-react';

interface VersionItem {
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

const VERSION_HISTORY_DATA: VersionItem[] = [
  {
    version: 'v2.1.0',
    type: 'major',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ မတ်လ (ယနေ့ - Major Family & Life Stage Healthcare Suite)',
    isLatest: true,
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
          'ကလေး ဝမ်းလျှောခြင်းတွင် ဓာတ်ဆားရည် (ORS) ဖျော်စပ်တိုက်ကျွေးနည်းနှင့် ရေဓာတ်ခမ်းခြောက်မှု စစ်ဆေးခြင်း'
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
      }
    ]
  },
  {
    version: 'v2.0.0',
    type: 'major',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ မတ်လ (Major Healthcare Ecosystem & Security Release)',
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
    releaseDate: '၂၀၂၆ ခုနှစ်၊ မတ်လ (Grammar Spelling, Zero Horizontal Scroll & Categorized Navigation Update)',
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
    releaseDate: '၂၀၂၆ ခုနှစ်၊ မတ်လ (Dental, Eye, Ear, Skincare & Emergency First Aid Update)',
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
    releaseDate: '၂၀၂၆ ခုနှစ်၊ မတ်လ (Physiotherapy & Rehabilitation Update)',
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
    releaseDate: '၂၀၂၆ ခုနှစ်၊ မတ်လ (All-In-One Major Healthcare Release)',
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
    releaseDate: '၂၀၂၆ ခုနှစ်၊ မတ်လ (Notification & Audio Alert Update)',
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
