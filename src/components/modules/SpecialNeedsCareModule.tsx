import React, { useState, useMemo, useRef } from 'react';
import { 
  Heart, 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Home, 
  Brain, 
  Activity, 
  Smile, 
  Clock, 
  Search, 
  BookOpen, 
  ChevronRight, 
  ChevronDown,
  ShieldCheck,
  Eye,
  Ear,
  EyeOff,
  VolumeX,
  Footprints,
  Accessibility,
  HeartHandshake,
  Sparkles,
  PhoneCall,
  CheckSquare,
  Square,
  HelpCircle,
  Stethoscope,
  ListFilter
} from 'lucide-react';

interface SpecialCareTopic {
  id: string;
  titleMm: string;
  subtitleMm: string;
  category: 'visual' | 'hearing' | 'stroke' | 'mobility' | 'bedridden' | 'neuro';
  icon: string;
  badge: string;
  badgeColor: string;
  summary: string;
  careGuidelines: string[];
  risksAndMistakes: string[];
  warningSigns: string[];
  homeSetupTips: string[];
  specialistAdvice: string;
}

const SPECIAL_CARE_TOPICS: SpecialCareTopic[] = [
  {
    id: 'visual_impairment',
    titleMm: 'အမြင်အာရုံ ချို့ယွင်းမှုနှင့် မျက်စိမမြင်သူများ စောင့်ရှောက်ရေး',
    subtitleMm: 'Visual Impairment & Blindness Care - နေ့စဉ်ဘဝ လွတ်လပ်စွာ ရှင်သန်နိုင်ရေးနှင့် အိမ်တွင်း ဘေးကင်းရေး',
    category: 'visual',
    icon: '👁️',
    badge: 'အမြင်အာရုံ',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    summary: 'အမြင်အာရုံ လုံးဝမရှိသူများ သို့မဟုတ် အမြင်အလွန်အားနည်းသူများ (Low Vision/Blindness) အတွက် ကိုယ်တိုင်ယုံကြည်မှုရှိစွာ သွားလာလှုပ်ရှားနိုင်စေရန်၊ ချော်လဲထိခိုက်မှု ကင်းဝေးစေရန်နှင့် ဆေးဝါးများ မှားယွင်းမသောက်စေရန် စနစ်တကျ ပြုစုစောင့်ရှောက်မှု ဖြစ်ပါသည်။',
    careGuidelines: [
      'အိမ်တွင်း ပရိဘောဂများနှင့် အသုံးအဆောင်ပစ္စည်းများကို မကြာခဏ နေရာရွှေ့ပြောင်းခြင်း လုံးဝမပြုလုပ်ပါနှင့် (ပုံသေနေရာထားရှိပေးပါ)',
      'စကားပြောဆိုရာတွင် အနားသို့ ရောက်ရှိကြောင်း ဦးစွာ နှုတ်ဆက် အသိပေးပြီး မည်သူမည်ဝါဖြစ်ကြောင်း အမြဲ အရင်ပြောပါ',
      'အခန်းထဲမှ ထွက်ခွာသွားပါကလည်း "အပြင်ခဏထွက်မယ်နော်" ဟု ရှင်းလင်းစွာ အသိပေးပါ (တစ်ယောက်တည်း စကားပြောကျန်မနေစေရန်)',
      'အစားအသောက် ကျွေးမွေးရာတွင် နာရီလက်တံ ပုံစံဖြင့် ရှင်းပြပါ (ဥပမာ- ထမင်းက ၁၂ နာရီနေရာ၊ ဟင်းက ၃ နာရီနေရာ၊ ရေခွက်က ၉ နာရီနေရာ)',
      'လမ်းလျှောက်ရာတွင် လက်ဆွဲမခေါ်ဘဲ လူနာအား ပြုစုသူ၏ တံတောင်ဆစ် သို့မဟုတ် ပခုံးကို ကိုင်တွယ်စေပြီး အနည်းငယ် ရှေ့မှ ဦးဆောင်လျှောက်ပါ'
    ],
    risksAndMistakes: [
      'တံခါးများ၊ ဗီရိုတံခါးများကို တစ်ဝက်တစ်ပျက် ဖွင့်ထားခြင်း (မျက်နှာနှင့် ဦးခေါင်း တိုက်မိ၍ ပြင်းထန်စွာ ဒဏ်ရာရတတ်သည်)',
      'ကြမ်းပြင်ပေါ်တွင် ဖိနပ်များ၊ ကြိုးများ၊ အရုပ်များ ရှုပ်ပွထားခြင်း',
      'အမြင်မမြင်နိုင်ဟုဆိုကာ လူနာမရှိသလို သဘောထား၍ တခြားသူများနှင့် လူနာရှေ့တွင် အတင်းပြောဆိုခြင်း'
    ],
    warningSigns: [
      'ရုတ်တရက် အမြင်အာရုံ ပိုမိုဆိုးရွားလာခြင်း သို့မဟုတ် မျက်လုံး ပြင်းထန်စွာ ကိုက်ခဲ နီရဲလာခြင်း',
      'ခေါင်းမူးခြင်း၊ ခြေလှမ်းမမှန်ဘဲ မကြာခဏ တိုက်မိခိုက်မိလာခြင်း',
      'စိတ်ဓာတ်ကျဆင်းခြင်း၊ အပြင်မထွက်လိုတော့ဘဲ လူအများနှင့် အဆက်အသွယ် ဖြတ်တောက်ထားခြင်း'
    ],
    homeSetupTips: [
      'ဆေးဘူးများပေါ်တွင် ထိတွေ့သိရှိနိုင်သော အမှတ်အသား (ဥပမာ- ကော်ပတ်တိပ်၊ ကြက်ပေါင်စေး အကွင်းရေ) ဖြင့် ဆေးခွဲခြားပေးထားပါ',
      'အလင်းရောင် အနည်းငယ်မြင်နိုင်သူများအတွက် မီးအလင်းရောင် အလုံအလောက် ထွန်းပေးထားပါ',
      'လှေကားအဆင်းအတက်နှင့် ကြမ်းပြင်အကူးအပြောင်းတွင် ထိတွေ့မှုကွာခြားသော ဖျာ သို့မဟုတ် တိပ်ကပ်ထားပါ'
    ],
    specialistAdvice: 'မျက်စိမမြင်သူများအား အရာရာ အစားထိုးလုပ်ပေးခြင်းထက် ဘေးကင်းသော ပတ်ဝန်းကျင် ဖန်တီးပေးပြီး မိမိဘာသာ ကိုယ်တိုင် လုပ်ကိုင်နိုင်စွမ်းကို အားပေးမြှင့်တင်ပေးခြင်းက စိတ်ပိုင်းဆိုင်ရာ အခိုင်မာဆုံး ခွန်အားဖြစ်စေပါသည်။'
  },
  {
    id: 'hearing_impairment',
    titleMm: 'အကြားအာရုံ ချို့ယွင်းမှုနှင့် နားမကြားသူများ စောင့်ရှောက်ရေး',
    subtitleMm: 'Hearing Impairment & Deafness Care - ထိရောက်သော ဆက်သွယ်ပြောဆိုမှုနှင့် ဘေးအန္တရာယ် သတိပေးစနစ်',
    category: 'hearing',
    icon: '👂',
    badge: 'အကြားအာရုံ',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    summary: 'မွေးရာပါ နားမကြားသူများ သို့မဟုတ် သက်ကြီးရွယ်အို/ရောဂါကြောင့် နားလေးသူများအတွက် ဆက်သွယ်ပြောဆိုမှု အဆင်ပြေစေရန်၊ အထီးကျန် စိတ်အားငယ်မှု မဖြစ်စေရန်နှင့် အရေးပေါ် အခြေအနေများကို အလင်းရောင်/တုန်ခါမှုဖြင့် သတိပြုနိုင်စေရန် လမ်းညွှန်ချက် ဖြစ်ပါသည်။',
    careGuidelines: [
      'စကားမပြောမီ လူနာ၏ ပခုံးကို ညင်သာစွာ ပုတ်ပါ သို့မဟုတ် လက်ပြ၍ အာရုံစိုက်လာအောင် အရင်ပြုလုပ်ပါ',
      'စကားပြောရာတွင် မျက်နှာချင်းဆိုင်၍ အလင်းရောင်ကောင်းစွာ ရရှိသော နေရာတွင် ရှိနေပါ (နှုတ်ခမ်းလှုပ်ရှားမှု ရှင်းလင်းစွာ မြင်နိုင်စေရန်)',
      'အော်ဟစ်၍ မပြောပါနှင့်၊ နှုတ်ခမ်းလှုပ်ရှားမှုကို သဘာဝအတိုင်း ဖြည်းဖြည်းနှင့် ရှင်းရှင်းလင်းလင်း ပြောဆိုပါ',
      'နားမလည်ပါက တူညီသောစကားလုံးကို ထပ်ခါတလဲလဲ မအော်ဘဲ အဓိပ္ပာယ်တူ ရိုးရှင်းသော အခြားစကားလုံးဖြင့် အစားထိုးပြောပါ သို့မဟုတ် စာရေးပြပါ',
      'နားကြားကိရိယာ (Hearing Aid) တပ်ဆင်ထားပါက နေ့စဉ် ဓာတ်ခဲနှင့် သန့်ရှင်းရေးကို စစ်ဆေးဂရုစိုက်ပေးပါ'
    ],
    risksAndMistakes: [
      'နားမကြားရကောင်းလားဟု ဒေါသထွက်၍ အော်ဟစ်ဆူပူခြင်း (ဆက်သွယ်လိုစိတ် ပျက်ပြားသွားစေသည်)',
      'နားမကြားနိုင်သူ၏ နောက်ကျောဘက်မှ ရုတ်တရက် လာရောက် ကိုင်တွယ်ခြင်း (အလွန်အမင်း ထိတ်လန့်တုန်လှုပ်စေသည်)',
      'ဆေးသောက်ချိန်နှင့် ဆရာဝန်ညွှန်ကြားချက်များကို နှုတ်ဖြင့်သာ ပြောပြီး စာဖြင့် သေချာ ရေးမပြခြင်း'
    ],
    warningSigns: [
      'နားထဲမှ အရည် သို့မဟုတ် ပြည်ထွက်ခြင်း၊ နားအလွန်အမင်း နာကျင်ခြင်း',
      'မူးဝေခြင်းနှင့် ဟန်ချက်ပျက်ခြင်း (အတွင်းနား ပြဿနာ ဖြစ်နိုင်သည်)',
      'လူအများနှင့် စကားမပြောတော့ဘဲ မိမိကိုယ်ကို သီးသန့်ခွဲထုတ်နေထိုင်လာခြင်း'
    ],
    homeSetupTips: [
      'အိမ်ရှေ့တံခါးဘဲလ်နှင့် ဖုန်းခေါ်ဆိုမှုများအတွက် အလင်းရောင် လင်းလက်သောအချက်ပြ (Flashing Light Alerts) တပ်ဆင်ထားပါ',
      'အရေးပေါ် မီးဘေး/သဘာဝဘေး သတိပေးချက်များအတွက် တုန်ခါနိုင်သော ပစ္စည်း (Vibrating Alarms) အသုံးပြုပါ',
      'အရေးကြီး ဆေးညွှန်းများနှင့် လိပ်စာများကို အမြဲ လက်ကိုင်ဖုန်း သို့မဟုတ် မှတ်စုစာအုပ်တွင် ကတ်ပြားဖြင့် ဆောင်ထားစေပါ'
    ],
    specialistAdvice: 'အကြားအာရုံ မသန်စွမ်းသူများသည် အထီးကျန်ခြင်းနှင့် စိတ်ဓာတ်ကျခြင်း အလွယ်တကူ ဖြစ်တတ်သဖြင့် မိသားစုဝင်များက စိတ်ရှည်စွာ လက်ဟန်၊ စာသားနှင့် အကြည့်များဖြင့် နွေးထွေးစွာ ဆက်သွယ်ပေးရန် အထူး အရေးကြီးပါသည်။'
  },
  {
    id: 'stroke_paralysis_care',
    titleMm: 'လေဖြတ်ခြင်းနှင့် တစ်ခြမ်းသေ/အကြောသေ ဝေဒနာရှင်များ စောင့်ရှောက်ရေး',
    subtitleMm: 'Stroke & Hemiplegia Recovery - ပြန်လည်သန်စွမ်းရေး၊ အိပ်ရာနာ ကာကွယ်မှုနှင့် အစာမျို စောင့်ရှောက်ရေး',
    category: 'stroke',
    icon: '🧠',
    badge: 'လေဖြတ်/အကြောသေ',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    summary: 'ဦးနှောက်သွေးကြောပြတ်ခြင်း သို့မဟုတ် ပိတ်ခြင်းကြောင့် ခန္ဓာကိုယ်တစ်ခြမ်း သေသွားသူများ၊ စကားပြောမရသူများအတွက် အိပ်ရာထဲလဲခြင်း၊ အဆုတ်ရောင်ခြင်းနှင့် အဆစ်များတောင့်တင်းခြင်း မဖြစ်စေရန် အထူး ကြပ်မတ် ပြုစုနည်း ဖြစ်ပါသည်။',
    careGuidelines: [
      'အိပ်ရာနာ (Pressure Ulcers) မဖြစ်စေရန် အနည်းဆုံး ၂ နာရီတစ်ကြိမ် ဘယ်စောင်း၊ ညာစောင်း ပုံမှန် ပြောင်းလဲပေးပါ',
      'အစာကျွေးရာတွင် လုံးဝ လှဲလျက် မကျွေးပါနှင့်၊ ခေါင်းနှင့် ခန္ဓာကိုယ်ကို ၆၀ မှ ၉၀ ဒီဂရီ မတ်မတ် ထိုင်စေပြီးမှ ဖြည်းညင်းစွာ ကျွေးပါ',
      'အစာမျိုရခက်သူများ (Dysphagia) အတွက် အစာကို ကြိတ်ချေ ပျော့ပျောင်းအောင် ပြုလုပ်ပြီး ရေကျွေးလျှင် သီးမသွားစေရန် ပျစ်ပျစ်ဖျော်ပါ',
      'သေနေသော လက်နှင့် ခြေထောက် အဆစ်များ မခိုင် မတောင့်သွားစေရန် နေ့စဉ် ညင်သာသော Passive Range of Motion အကြောလျှော့ လေ့ကျင့်ခန်း လုပ်ပေးပါ',
      'သွေးတိုး၊ ဆီးချိုနှင့် သွေးကျဲဆေးများကို ဆရာဝန် ညွှန်ကြားချက်အတိုင်း ရက်မပျက် တိကျစွာ ဆက်လက် တိုက်ကျွေးပါ'
    ],
    risksAndMistakes: [
      'သေနေသော လက်မောင်းမှ အတင်းဆွဲမတင်ခြင်း (ပခုံးအဆစ်ပြုတ်ထွက်ခြင်း Shoulder Subluxation ဖြစ်စေသည်)',
      'အစာကျွေးပြီး ချက်ချင်း အိပ်ရာထဲ ပြန်လှဲစေခြင်း (အစာသီး၍ အဆုတ်ရောင် Aspirative Pneumonia ဖြစ်ပြီး အသက်အန္တရာယ် ရှိသည်)',
      'သွေးပေါင်ပုံမှန်ဖြစ်သွားသည်ဟုဆိုကာ သွေးတိုးဆေးနှင့် သွေးကျဲဆေးများကို မိမိသဘောဖြင့် ရပ်တန့်ခြင်း'
    ],
    warningSigns: [
      'ရုတ်တရက် အဖျားတက်လာခြင်း၊ ချောင်းဆိုးလျှင် အဝါရောင်/အစိမ်းရောင် သလိပ်ထွက်ခြင်း (အဆုတ်ပိုးဝင်ခြင်း)',
      'တင်ပါး၊ ဖနောင့် သို့မဟုတ် ကျောကုန်းတွင် အရေပြားနီရဲလာခြင်း သို့မဟုတ် အရည်ကြည်ဖု/ပေါက်ပြဲလာခြင်း',
      'ခြေထောက်တစ်ဖက်တည်း ရုတ်တရက် ဖောရောင် နာကျင်လာခြင်း (Deep Vein Thrombosis - သွေးကြောပိတ်ခြင်း)',
      'စကားပြောပိုမိုခက်ခဲလာခြင်း သို့မဟုတ် သတိလစ်မေ့မြောခြင်း'
    ],
    homeSetupTips: [
      'လေထိုးမွေ့ယာ (Air Mattress) သို့မဟုတ် ရေမွေ့ယာ အသုံးပြုပေးပါ',
      'ခြေဖျားများ အောက်သို့ တွဲကျမသွားစေရန် ခေါင်းအုံး သို့မဟုတ် Foot Board ဖြင့် ထောက်ပေးထားပါ',
      'အိပ်ရာမှ ကုလားထိုင်သို့ ပြောင်းရွှေ့ရာတွင် အားကောင်းသော ဘက်ကို အရင် အသုံးချစေပါ'
    ],
    specialistAdvice: 'လေဖြတ်ပြီး ပထမ ၃ လ မှ ၆ လသည် ပြန်လည်သန်စွမ်းရေးအတွက် ရွှေရောင်ကာလ (Golden Window) ဖြစ်သဖြင့် ကာယကုထုံး (Physiotherapy) နှင့် စကားပြောကုထုံးကို စိတ်ရှည်လက်ရှည် နေ့စဉ် အားစိုက် လုပ်ဆောင်ပေးရပါမည်။'
  },
  {
    id: 'mobility_physical_disabilities',
    titleMm: 'ကိုယ်အင်္ဂါ ချို့ယွင်းမှုနှင့် ဘီးတပ်ကုလားထိုင် (Wheelchair) အသုံးပြုသူများ စောင့်ရှောက်ရေး',
    subtitleMm: 'Physical & Mobility Disabilities - အဆင်ပြေချောမွေ့စွာ ရွှေ့ပြောင်းခြင်းနှင့် လွတ်လပ်သော နေထိုင်မှု',
    category: 'mobility',
    icon: '🦽',
    badge: 'ကိုယ်အင်္ဂါမသန်စွမ်းမှု',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    summary: 'ခြေလက် အင်္ဂါဆုံးရှုံးထားသူများ၊ ကျောရိုးထိခိုက်သူများ၊ ကြွက်သားအားနည်းရောဂါသည်များနှင့် Wheelchair အသုံးပြုသူများအတွက် အကြောတောင့်တင်းမှု ကာကွယ်ရေး၊ လုံခြုံစွာ ကူးပြောင်းထိုင်နည်းနှင့် အဆင်ပြေသော လူနေမှု ပတ်ဝန်းကျင် ဖန်တီးနည်း ဖြစ်ပါသည်။',
    careGuidelines: [
      'Wheelchair ပေါ်မှ အိပ်ရာ/အိမ်သာသို့ ကူးပြောင်းထိုင်သည့်အခါ Wheelchair ဘရိတ် (Brakes) ကို အမြဲ အရင် သေချာ အုပ်ထားပါ',
      'ထိုင်ခုံပေါ်တွင် တစ်ချိန်လုံး ထိုင်နေရသူများအတွက် ၂၀ မိနစ် သို့မဟုတ် နာရီဝက်တစ်ကြိမ် လက်မောင်းဖြင့် ကိုယ်ကို အထက်သို့ တွန်းတင်၍ တင်ပါးဖိအားလျှော့ပါ (Pressure Relief Push-ups)',
      'အသုံးပြုသည့် ခြေတု၊ လက်တု (Prosthetics) နှင့် အထောက်အကူပြု ကိရိယာများ၏ သန့်ရှင်းရေးနှင့် ကြံ့ခိုင်မှုကို ပုံမှန် စစ်ဆေးပါ',
      'ခြေတုတပ်ဆင်မည့် ငုတ်ပိုင်း (Residual Limb) ကို နေ့စဉ် ဆပ်ပြာအပျော့စားဖြင့် သန့်စင်ပြီး အရေပြား ပွန်းပဲ့မှု ရှိမရှိ စစ်ဆေးပါ',
      'သွေးလည်ပတ်မှု ကောင်းမွန်စေရန်နှင့် ကြွက်သားများ တောင့်တင်းမသွားစေရန် သတ်မှတ်လေ့ကျင့်ခန်းများ နေ့စဉ် ပြုလုပ်ပါ'
    ],
    risksAndMistakes: [
      'ဘရိတ်မအုပ်ဘဲ ကူးပြောင်းထိုင်ရန် ကြိုးစားခြင်း (ဘီးရွေ့သွားပြီး ပြင်းထန်စွာ ပြုတ်ကျနိုင်သည်)',
      'ခြေတုတပ်ရာတွင် စိုစွတ်နေချိန် အတင်းတပ်ခြင်း သို့မဟုတ် အရွယ်အစား မတော်တော့သော ခြေတုကို အတင်းတပ်စေခြင်း',
      'အိမ်သာနှင့် ရေချိုးခန်းတွင် လက်ကိုင်ဘား မရှိဘဲ တစ်ယောက်တည်း သွားခွင့်ပြုခြင်း'
    ],
    warningSigns: [
      'တင်ပါးဆုံ သို့မဟုတ် ခြေတုတပ်သည့် နေရာတွင် အရေပြားပေါက်ပြဲ အနာဖြစ်ခြင်း',
      'လက်မောင်းနှင့် ပခုံးအဆစ်များ ပြင်းထန်စွာ ရောင်ရမ်းနာကျင်လာခြင်း',
      'ဆီးလမ်းကြောင်း ခဏခဏ ပိုးဝင်ဖျားနာခြင်း (ဆီးမထိန်းနိုင်သူများတွင် ပိုဖြစ်တတ်သည်)'
    ],
    homeSetupTips: [
      'အိမ်အဝင်နှင့် အခန်းတံခါးများတွင် လှေကားထစ်အစား လျှောစောက်ပြေပြေ (Ramps) ပြုလုပ်ထားပါ',
      'ရေချိုးခန်းနှင့် အိမ်သာနံရံများတွင် အနည်းဆုံး လက်ကိုင်ဘား ၂ ခု တပ်ဆင်ထားပါ',
      'ကြမ်းပြင်ချောမွတ်သော ကြွေပြားများပေါ်တွင် မချော်သော ဖျာများ ခင်းထားပါ'
    ],
    specialistAdvice: 'ကိုယ်အင်္ဂါမသန်စွမ်းသူများအတွက် အတားအဆီးမဲ့ ပတ်ဝန်းကျင် (Accessibility) ဖန်တီးပေးခြင်းသည် သူတို့၏ လူ့ဂုဏ်သိက္ခာနှင့် ကိုယ်ပိုင်ရပ်တည်နိုင်စွမ်းကို အမြင့်မားဆုံး အထောက်အကူပြုပါသည်။'
  },
  {
    id: 'bedridden_palliative_care',
    titleMm: 'အိပ်ရာထဲ လှဲနေရသူများနှင့် နာတာရှည် ဝေဒနာရှင်များ ပြုစုစောင့်ရှောက်ရေး',
    subtitleMm: 'Bedridden & Total Dependence Care - တစ်ကိုယ်ရေ သန့်ရှင်းရေး၊ အာဟာရနှင့် စိတ်ပိုင်းဆိုင်ရာ ပံ့ပိုးမှု',
    category: 'bedridden',
    icon: '🛏️',
    badge: 'အိပ်ရာထဲလှဲနေရသူ',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    summary: 'အသက်အရွယ်ကြီးရင့်မှု၊ ရောဂါအဆင့်လွန် သို့မဟုတ် ထိခိုက်ဒဏ်ရာကြောင့် အိပ်ရာထဲမှ လုံးဝမထနိုင်သော ဝေဒနာရှင်များအတွက် အရေပြား၊ အသက်ရှူလမ်းကြောင်း၊ အစာလမ်းကြောင်းနှင့် ဆီးစွန့်စနစ်များကို ရောဂါပိုးမဝင်စေရန် အထူးစောင့်ရှောက်နည်း ဖြစ်ပါသည်။',
    careGuidelines: [
      'တစ်ကိုယ်ရေ သန့်ရှင်းရေးအတွက် ရေပတ်တိုက်ခြင်း (Sponge Bath) ကို နေ့စဉ် ပုံမှန် ပြုလုပ်ပေးပြီး ပေါင်ခြံနှင့် အခေါက်နေရာများကို ခြောက်သွေ့အောင် ထားပါ',
      'အစာပိုက် (NG Tube) တပ်ထားပါက အစာမထည့်မီ ပိုက်နေရာမှန်မမှန် စစ်ဆေးပါ၊ အစာကျွေးပြီးတိုင်း ရေနွေးအနည်းငယ်ဖြင့် ပိုက်ကို ဆေးကြောပါ',
      'ဆီးပိုက် (Catheter) တပ်ထားပါက ဆီးအိတ်ကို ဆီးအိမ်ထက် အမြဲ နိမ့်သော နေရာတွင် ချိတ်ထားပါ (ဆီးပြန်တက်၍ ပိုးမဝင်စေရန်)',
      'ခံတွင်းသန့်ရှင်းရေး (Oral Care) ကို တစ်နေ့ ၂ ကြိမ် သန့်စင်သော ရေနွေး သို့မဟုတ် ခံတွင်းသန့်ဆေးရည်ဖြင့် ဂွမ်းစလုံးသုံး၍ သုတ်ပေးပါ',
      'အသက်ရှူလမ်းကြောင်း သလိပ်ကျပ်ခြင်း မဖြစ်စေရန် ကျောကုန်းကို ခွက်သဏ္ဌာန် လက်ဝါးဖြင့် ညင်သာစွာ ပုတ်ပေးပါ (Chest Physiotherapy)'
    ],
    risksAndMistakes: [
      'ဆီးအိတ်ကို လူနာ၏ ခါးထက် အထက်သို့ မ တင်ခြင်း (ဆီးပြန်စီးဝင်ပြီး ကျောက်ကပ် ပိုးဝင်စေသည်)',
      'အိပ်ရာခင်းများ စိုစွတ်ညစ်ပတ်နေသည်ကို အချိန်မီ မလဲလှယ်ပေးခြင်း',
      'အစာပိုက်ထဲသို့ အစာတောင့်တင်း သို့မဟုတ် ဆေးလုံးကြီးများ ကြိတ်မညက်ဘဲ ထည့်ခြင်း (ပိုက်ပိတ်စေသည်)'
    ],
    warningSigns: [
      'အဖျားတက်ခြင်း၊ ချမ်းတုန်ခြင်း၊ ဆီးနံ့ဆိုးရွားပြီး နောက်ကျိလာခြင်း',
      'အသက်ရှူ မြန်ဆန်မောဟိုက်လာခြင်း သို့မဟုတ် သလိပ်သံ တခီခီမြည်လာခြင်း',
      'သွေးပေါင်ချိန် ရုတ်တရက် အလွန်အမင်း ကျဆင်းခြင်း သို့မဟုတ် သတိလက်လွတ်ဖြစ်လာခြင်း'
    ],
    homeSetupTips: [
      'ဆေးရုံသုံး ခေါင်းမြှင့်/ခြေမြှင့်လို့ရသော လူနာတင်ကုတင် အသုံးပြုနိုင်ပါက အလွန် အဆင်ပြေသည်',
      'အရေးပေါ် အကူအညီတောင်းနိုင်ရန် လူနာလက်လှမ်းမီရာတွင် ဘဲလ်ခလုတ် ထားရှိပေးပါ',
      'အခန်းတွင်း လေဝင်လေထွက် ကောင်းမွန်စေရန် ပြတင်းပေါက် ဖွင့်ထားပေးပါ'
    ],
    specialistAdvice: 'အိပ်ရာထဲ လှဲနေရသူများ ပြုစုရာတွင် ကာယကံရှင်သာမက ပြုစုသူ (Caregiver) ၏ စိတ်ဖိစီးမှုနှင့် ပင်ပန်းနွမ်းနယ်မှုကိုလည်း ဂရုစိုက်ရန် လိုအပ်ပြီး မိသားစုဝင်များ အလှည့်ကျ ဝိုင်းဝန်းကူညီသင့်ပါသည်။'
  },
  {
    id: 'neuro_developmental_disabilities',
    titleMm: 'ဉာဏ်ရည်နှင့် ဦးနှောက်ဖွံ့ဖြိုးမှုဆိုင်ရာ အထူးလိုအပ်ချက်များ စောင့်ရှောက်ရေး',
    subtitleMm: 'Neurodiversity, Autism, Down Syndrome & Cerebral Palsy - နားလည်စာနာမှုနှင့် ဖွဲ့စည်းပုံရှိသော ပြုစုမှု',
    category: 'neuro',
    icon: '🧩',
    badge: 'အထူးဖွံ့ဖြိုးမှုလိုအပ်ချက်',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    summary: 'Autism Spectrum (အော်တစ်ဇင်)၊ Down Syndrome (ဒေါင်းဆင်ဒရုန်း)၊ Cerebral Palsy (ဦးနှောက်သန်စွမ်းမှုချို့ယွင်းခြင်း) စသည့် အထူးလိုအပ်ချက်ရှိသော ကလေးများနှင့် လူကြီးများအတွက် စိတ်ခံစားမှု တည်ငြိမ်စေရန်နှင့် လူမှုဘဝ လိုက်လျောညီထွေရှိစေရန် လမ်းညွှန်ချက် ဖြစ်ပါသည်။',
    careGuidelines: [
      'နေ့စဉ် လုပ်ရိုးလုပ်စဉ် (Daily Routine) များကို တသမတ်တည်း ပုံသေထားရှိပေးပါ (ရုတ်တရက် အပြောင်းအလဲများက စိုးရိမ်စိတ် လွန်ကဲစေသည်)',
      'ဆက်သွယ်ပြောဆိုရာတွင် ရိုးရှင်းတိုတောင်းသော စကားလုံးများနှင့် ရုပ်ပုံကတ်ပြားများ (Visual Schedules) ကို တွဲဖက် အသုံးပြုပါ',
      'အာရုံခံစားမှု လွန်ကဲသူများ (Sensory Overload) အတွက် ဆူညံသံကျယ်လောင်ခြင်း၊ မီးရောင်စူးရှခြင်းများကို တတ်နိုင်သမျှ ရှောင်ကြဉ်ပေးပါ',
      'ကောင်းမွန်သော အပြုအမူ ပြုလုပ်တိုင်း ချက်ချင်း ချီးမွမ်းခြင်းနှင့် ဆုပေးခြင်း (Positive Reinforcement) ဖြင့် အားပေးပါ',
      'တက်တတ်သော ရောဂါအခံ (Seizures/Epilepsy) ရှိမရှိ စောင့်ကြည့်ပြီး ရှေးဦးပြုစုနည်းကို မိသားစုဝင်တိုင်း ကျွမ်းကျင်စွာ တတ်မြောက်ထားပါ'
    ],
    risksAndMistakes: [
      'ဒေါသထွက် စိတ်ဆိုးချိန်တွင် အော်ဟစ်ဆူပူခြင်း သို့မဟုတ် အတင်းအကျပ် ချုပ်နှောင်ခြင်း',
      'အခြားပုံမှန်ကလေးများနှင့် ခိုင်းနှိုင်း၍ အပြစ်တင်ပြောဆိုခြင်း',
      'တက်နေစဉ် ပါးစပ်ထဲသို့ ဇွန်း သို့မဟုတ် လက်ညှိုး အတင်းထိုးထည့်ခြင်း (အသက်ရှူလမ်းကြောင်း ပိတ်စေသည်)'
    ],
    warningSigns: [
      'မိမိကိုယ်ကို အန္တရာယ်ပြုသော အပြုအမူများ (ခေါင်းဆောင့်ခြင်း၊ လက်ကိုက်ခြင်း) ပိုမိုပြင်းထန်လာခြင်း',
      'တက်သည့် အကြိမ်ရေ ပိုများလာခြင်း သို့မဟုတ် ၅ မိနစ်ထက်ပို၍ သတိမေ့ တက်နေခြင်း (အရေးပေါ် ဆေးရုံပြရန်လို)',
      'အစာစားရန် လုံးဝငြင်းဆန်ပြီး အာဟာရပြတ်လပ်လာခြင်း'
    ],
    homeSetupTips: [
      'စိတ်အေးချမ်းစေသော တိတ်ဆိတ်သည့် သီးသန့်နေရာ (Calm-down Corner) အိမ်တွင် သတ်မှတ်ပေးထားပါ',
      'ထိခိုက်ဒဏ်ရာ မရစေရန် စားပွဲထောင့်ချွန်များကို အကာအကွယ်တပ်ဆင်ထားပါ',
      'တက်ရောဂါရှိပါက အိပ်ရာဘေးတွင် ခေါင်းအုံးပျော့များ ကာရံထားပါ'
    ],
    specialistAdvice: 'အထူးလိုအပ်ချက်ရှိသူတိုင်းတွင် သူတို့ကိုယ်ပိုင် ထူးခြားသော အရည်အချင်းနှင့် အလားအလာများ ရှိကြပါသည်။ စိတ်ရှည်မှု၊ စာနာနားလည်မှုနှင့် မေတ္တာတရားတို့သည် အကောင်းဆုံး ကုထုံးဖြစ်ပါသည်။'
  }
];

const ACCESSIBILITY_CHECKLIST_ITEMS = [
  { id: '1', title: 'ရေချိုးခန်းနှင့် အိမ်သာတွင် ချော်မလဲစေသော ရော်ဘာဖျာ (Anti-slip Mat) ခင်းထားခြင်း' },
  { id: '2', title: 'အိမ်သာနှင့် ရေချိုးခန်း နံရံတွင် လက်ကိုင်ဘား (Grab Bars) တပ်ဆင်ထားခြင်း' },
  { id: '3', title: 'အခန်းအဝင်အထွက် တံခါးများတွင် လှေကားထစ်အစား လျှောစောက်ပြေပြေ (Ramps) ပြုလုပ်ထားခြင်း' },
  { id: '4', title: 'ဆေးဘူးများပေါ်တွင် ထိတွေ့သိရှိနိုင်သော တိပ် သို့မဟုတ် အမှတ်အသားဖြင့် ခွဲခြားထားခြင်း' },
  { id: '5', title: 'အရေးပေါ် အလင်းရောင် အချက်ပြ (Visual Alerts) သို့မဟုတ် တုန်ခါမှု အချက်ပေးစနစ် ထားရှိခြင်း' },
  { id: '6', title: 'လမ်းလျှောက်ရာ လမ်းတစ်လျှောက်တွင် လျှပ်စစ်ဝါယာကြိုးများနှင့် ခလုတ်တိုက်နိုင်သော ပစ္စည်းများ ရှင်းလင်းထားခြင်း' },
  { id: '7', title: 'ညဘက် အလင်းရောင် လုံလောက်စေရန် ညမီးသီး (Night Lights) များ တပ်ဆင်ထားခြင်း' },
  { id: '8', title: 'အရေးပေါ် ဖုန်းနံပါတ်များနှင့် ဆေးမှတ်တမ်းကတ်ကို အလွယ်တကူ ယူနိုင်သော နေရာတွင် ထားရှိခြင်း' }
];

export const SpecialNeedsCareModule: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTopicId, setActiveTopicId] = useState<string>(SPECIAL_CARE_TOPICS[0].id);
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('special_care_checklist');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [showChecklistModal, setShowChecklistModal] = useState<boolean>(false);
  const detailContainerRef = useRef<HTMLDivElement>(null);

  const selectTopic = (id: string) => {
    setActiveTopicId(id);
    setTimeout(() => {
      detailContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const toggleChecklist = (id: string) => {
    const updated = { ...checklistState, [id]: !checklistState[id] };
    setChecklistState(updated);
    try {
      localStorage.setItem('special_care_checklist', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTopics = useMemo(() => {
    return SPECIAL_CARE_TOPICS.filter(topic => {
      const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
      const matchesSearch = 
        topic.titleMm.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.subtitleMm.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const activeTopic = useMemo(() => {
    return SPECIAL_CARE_TOPICS.find(t => t.id === activeTopicId) || filteredTopics[0] || SPECIAL_CARE_TOPICS[0];
  }, [activeTopicId, filteredTopics]);

  const completedChecklistCount = Object.values(checklistState).filter(Boolean).length;
  const checklistPercentage = Math.round((completedChecklistCount / ACCESSIBILITY_CHECKLIST_ITEMS.length) * 100);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header Card */}
      <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-100 text-xs font-bold backdrop-blur-md border border-indigo-400/30 flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-indigo-200" />
              Special Care & Inclusion
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-100 text-xs font-bold backdrop-blur-md border border-emerald-400/30 flex items-center gap-1.5">
              <Accessibility className="w-3.5 h-3.5 text-emerald-200" />
              မသန်စွမ်းမှုဆိုင်ရာ အထူးစောင့်ရှောက်ရေး
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-3">
            မသန်စွမ်းနှင့် အထူးလိုအပ်ချက် စောင့်ရှောက်ရေး
          </h1>
          <p className="text-indigo-100/90 text-sm sm:text-base max-w-3xl leading-relaxed">
            အမြင်အာရုံ၊ အကြားအာရုံ ချို့ယွင်းသူများ၊ လေဖြတ်/အကြောသေ ဝေဒနာရှင်များ၊ Wheelchair နှင့် ကိုယ်အင်္ဂါမသန်စွမ်းသူများ၊ အိပ်ရာထဲ လှဲနေရသူများနှင့် အထူးဖွံ့ဖြိုးမှု လိုအပ်ချက်ရှိသူများအတွက် ဆေးပညာလမ်းညွှန်ချက်များနှင့် အိမ်တွင်း ဘေးကင်းလုံခြုံရေး စနစ်။
          </p>

          {/* Quick Metrics / Action Row */}
          <div className="mt-6 pt-5 border-t border-indigo-600/40 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-200 font-bold">
                {SPECIAL_CARE_TOPICS.length}
              </div>
              <div>
                <p className="text-xs text-indigo-200 font-medium">အထူးစောင့်ရှောက်မှု ကဏ္ဍကြီးများ</p>
                <p className="text-sm font-bold text-white">ပြည့်စုံသော ဆေးပညာ လမ်းညွှန်များ</p>
              </div>
            </div>

            <button
              onClick={() => setShowChecklistModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <CheckSquare className="w-4 h-4 text-emerald-100" />
              <span>အိမ်တွင်း ဘေးကင်းရေး Checklist ({completedChecklistCount}/{ACCESSIBILITY_CHECKLIST_ITEMS.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="အထူးစောင့်ရှောက်မှု ခေါင်းစဉ်များ၊ ရောဂါလက္ခဏာများ ရှာဖွေပါ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 transition-all outline-hidden"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'အားလုံး', icon: Sparkles },
            { id: 'visual', label: 'မျက်စိမမြင်/အမြင်အာရုံ', icon: EyeOff },
            { id: 'hearing', label: 'နားမကြား/အကြားအာရုံ', icon: VolumeX },
            { id: 'stroke', label: 'လေဖြတ်/အကြောသေ', icon: Brain },
            { id: 'mobility', label: 'ကိုယ်အင်္ဂါ/Wheelchair', icon: Footprints },
            { id: 'bedridden', label: 'အိပ်ရာထဲလှဲနေရသူ', icon: Activity },
            { id: 'neuro', label: 'အထူးဖွံ့ဖြိုးမှုလိုအပ်ချက်', icon: Smile }
          ].map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Topic Selector Dropdown (ဖုန်းဖြင့်ကြည့်ရှုရာတွင် ဆောင်းပါးခေါင်းစဉ် ချက်ချင်းရွေးနိုင်သော Dropdown) */}
        <div className="lg:hidden pt-2 border-t border-slate-100 flex flex-col gap-1.5">
          <label htmlFor="special-care-topic-select-mobile" className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-indigo-900 font-extrabold">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              ဆောင်းပါး ခေါင်းစဉ် ရွေးချယ်ရန်:
            </span>
            <span className="text-[11px] text-slate-500 font-normal">({filteredTopics.length} ပုဒ် ရှိသည်)</span>
          </label>
          <div className="relative w-full">
            <select
              id="special-care-topic-select-mobile"
              value={activeTopic.id}
              onChange={(e) => selectTopic(e.target.value)}
              className="w-full bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-300 text-indigo-950 text-xs sm:text-sm font-bold rounded-xl pl-3.5 pr-9 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer truncate transition-all shadow-2xs"
            >
              {filteredTopics.map(topic => (
                <option key={topic.id} value={topic.id}>
                  {topic.icon} {topic.titleMm}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-indigo-700 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" ref={detailContainerRef}>
        {/* Left Side: Topic Cards List (Hidden on mobile to show article directly, shown on desktop) */}
        <div className="hidden lg:block lg:col-span-5 space-y-2.5">
          <div className="flex items-center justify-between mb-1 px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              စောင့်ရှောက်မှု ကဏ္ဍများ ({filteredTopics.length})
            </h3>
          </div>

          {filteredTopics.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
              ရှာဖွေမှုနှင့် ကိုက်ညီသော ခေါင်းစဉ် မတွေ့ရှိပါ
            </div>
          ) : (
            filteredTopics.map((topic) => {
              const isSelected = activeTopic.id === topic.id;
              return (
                <div
                  key={topic.id}
                  onClick={() => selectTopic(topic.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden ${
                    isSelected
                      ? 'bg-indigo-50/90 border-indigo-400 shadow-sm ring-2 ring-indigo-500/20'
                      : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl p-2 rounded-xl bg-white border border-slate-100 shadow-2xs shrink-0">
                      {topic.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${topic.badgeColor}`}>
                          {topic.badge}
                        </span>
                      </div>
                      <h4 className={`text-xs sm:text-sm font-extrabold leading-snug line-clamp-1 ${
                        isSelected ? 'text-indigo-950' : 'text-slate-900'
                      }`}>
                        {topic.titleMm}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {topic.summary}
                      </p>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 mt-2 transition-transform ${
                      isSelected ? 'text-indigo-600 translate-x-1' : 'text-slate-300'
                    }`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Detailed Guide View */}
        <div className="col-span-1 lg:col-span-7">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden sticky top-36">
            {/* Topic Header & Dropdown Switcher */}
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{activeTopic.icon}</span>
                  <div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${activeTopic.badgeColor}`}>
                      {activeTopic.badge}
                    </span>
                    <h2 className="text-base sm:text-xl font-black text-slate-900 mt-1 leading-snug">
                      {activeTopic.titleMm}
                    </h2>
                  </div>
                </div>

                {/* Quick Desktop Dropdown / Indicator */}
                <div className="hidden sm:block shrink-0">
                  <select
                    value={activeTopic.id}
                    onChange={(e) => selectTopic(e.target.value)}
                    aria-label="အထူးစောင့်ရှောက်မှု ဆောင်းပါး ရွေးချယ်ရန်"
                    className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer shadow-2xs"
                  >
                    {filteredTopics.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.titleMm}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-indigo-900/80 font-medium leading-relaxed">
                {activeTopic.subtitleMm}
              </p>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Summary Box */}
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                  <Info className="w-3.5 h-3.5 text-indigo-600" />
                  အကျဉ်းချုပ် ရှင်းလင်းချက်
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {activeTopic.summary}
                </p>
              </div>

              {/* Care Guidelines (Dos) */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  လက်တွေ့ ပြုစုစောင့်ရှောက်မှု လမ်းညွှန်များ
                </h4>
                <div className="space-y-2">
                  {activeTopic.careGuidelines.map((guideline, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/70 text-xs sm:text-sm text-slate-800">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{guideline}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Home Setup & Accessibility Tips */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider flex items-center gap-2">
                  <Home className="w-4 h-4 text-indigo-600" />
                  အိမ်တွင်း ပတ်ဝန်းကျင်နှင့် အထောက်အကူပြု ပြင်ဆင်နည်း
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {activeTopic.homeSetupTips.map((tip, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-indigo-50/40 border border-indigo-100 flex items-start gap-2 text-xs sm:text-sm text-slate-800">
                      <span className="text-indigo-600 font-bold shrink-0">✦</span>
                      <span className="leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mistakes & Don'ts */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  သတိပြုရှောင်ကြဉ်ရမည့် အမှားများ
                </h4>
                <div className="space-y-2">
                  {activeTopic.risksAndMistakes.map((mistake, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs sm:text-sm text-amber-950 flex items-start gap-2">
                      <span className="text-amber-600 font-bold shrink-0">✕</span>
                      <span className="leading-relaxed">{mistake}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency / Warning Signs */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-rose-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  ချက်ချင်း ဆရာဝန်ပြသရမည့် အရေးပေါ် လက္ခဏာများ
                </h4>
                <div className="space-y-2">
                  {activeTopic.warningSigns.map((warning, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/70 text-xs sm:text-sm text-rose-950 flex items-start gap-2">
                      <span className="text-rose-600 font-bold shrink-0">⚠️</span>
                      <span className="leading-relaxed">{warning}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specialist Advice */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1.5 text-indigo-300 text-xs font-bold">
                  <Stethoscope className="w-4 h-4 text-emerald-400" />
                  အထူးကု ဆရာဝန်ကြီးများ၏ အကြံပြုချက်
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                  "{activeTopic.specialistAdvice}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accessibility Checklist Modal */}
      {showChecklistModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scaleIn">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">အိမ်တွင်း ဘေးကင်းရေး Checklist</h3>
                  <p className="text-xs text-slate-500">မသန်စွမ်းနှင့် အထူးဂရုစိုက်ရသူများအတွက် အိမ်တွင်း စစ်ဆေးချက်</p>
                </div>
              </div>
              <button
                onClick={() => setShowChecklistModal(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Progress Bar */}
            <div className="px-6 pt-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>ပြီးစီးမှု အဆင့်</span>
                <span className="text-indigo-600 font-extrabold">{completedChecklistCount} / {ACCESSIBILITY_CHECKLIST_ITEMS.length} ({checklistPercentage}%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${checklistPercentage}%` }}
                />
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {ACCESSIBILITY_CHECKLIST_ITEMS.map((item) => {
                const isChecked = !!checklistState[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isChecked
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400 shrink-0" />
                      )}
                    </div>
                    <span className={`text-xs sm:text-sm leading-relaxed ${isChecked ? 'line-through text-slate-500' : 'font-medium'}`}>
                      {item.title}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <button
                onClick={() => setShowChecklistModal(false)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
              >
                ပြီးပါပြီ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
