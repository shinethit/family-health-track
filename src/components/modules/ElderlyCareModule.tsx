import React, { useState } from 'react';
import { 
  Heart, 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Home, 
  Pill, 
  Brain, 
  Activity, 
  Smile, 
  Clock, 
  Search,
  BookOpen,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface GeriatricTopic {
  id: string;
  titleMm: string;
  subtitleMm: string;
  category: 'chronic' | 'dementia' | 'nutrition' | 'medication' | 'daily_care';
  icon: string;
  summary: string;
  careGuidelines: string[];
  risksAndMistakes: string[];
  warningSigns: string[];
  specialistAdvice: string;
}

const ELDERLY_TOPICS: GeriatricTopic[] = [
  {
    id: 'dementia_alzheimers',
    titleMm: 'မေ့လျော့ရောဂါ (Dementia) နှင့် အယ်လ်ဇိုင်းမား (Alzheimer’s)',
    subtitleMm: 'သာမန် အသက်ကြီး၍ မေ့ခြင်းနှင့် ရောဂါကြောင့် မေ့ခြင်း ခွဲခြားခြင်းနှင့် ပြုစုစောင့်ရှောက်မှု',
    category: 'dementia',
    icon: '🧠',
    summary: 'မေ့လျော့ရောဂါသည် သာမန် သက်ကြီးမေ့လျော့ခြင်း မဟုတ်ဘဲ ဦးနှောက်ဆဲလ်များ ပျက်စီးယိုယွင်းလာမှုကြောင့် မှတ်ဉာဏ်၊ တွေးခေါ်နိုင်စွမ်း၊ စကားပြောဆိုနိုင်စွမ်းနှင့် နေ့စဉ်လုပ်ငန်းဆောင်တာများ ထိခိုက်လာသော ရောဂါဖြစ်ပါသည်။',
    careGuidelines: [
      'သက်ကြီးရွယ်အိုနှင့် စကားပြောရာတွင် မျက်လုံးချင်းဆုံ၍ ရှင်းလင်းတိုတောင်းသော ဝါကျများဖြင့် ညင်သာစွာ စိတ်ရှည်စွာ ပြောဆိုပါ',
      'နေ့စဉ် လုပ်ရိုးလုပ်စဉ်များ (အိပ်ချိန်၊ စားချိန်၊ လမ်းလျှောက်ချိန်) ကို ပုံမှန် အချိန်အတိအကျ သတ်မှတ်ထားရှိပေးပါ',
      'မှတ်ဉာဏ် လှုံ့ဆော်ပေးရန် ဓာတ်ပုံဟောင်းများ အတူကြည့်ရှုခြင်း၊ သီချင်းဟောင်းများ ဖွင့်ပြခြင်း ပြုလုပ်ပေးပါ',
      'အိမ်အပြင်သို့ တစ်ဦးတည်း ထွက်ပြေး/လမ်းပျောက်ခြင်းမှ ကာကွယ်ရန် တံခါးများကို သော့ခတ်ထားပြီး အမည်နှင့် ဖုန်းနံပါတ်ပါသော လက်ပတ် ဝတ်ဆင်ပေးထားပါ',
      'ဒေါသထွက် ဂျီကျလာပါက ငြင်းခုံခြင်းမပြုဘဲ အာရုံလွှဲပြောင်းပေးပါ'
    ],
    risksAndMistakes: [
      'အမှားများကို အတင်းအကျပ် အပြစ်တင်ခြင်း သို့မဟုတ် အမှန်ပြင်ပေးရန် ငြင်းခုံခြင်း (စိတ်ဖိစီးမှုနှင့် ဒေါသကို ပိုမိုဆိုးရွားစေသည်)',
      'လူနာကို အခန်းတွင်း တစ်ယောက်တည်း သီးသန့် အကြာကြီး ပစ်ထားခြင်း'
    ],
    warningSigns: [
      'ရင်းနှီးပြီးသား သားသမီး၊ ဆွေမျိုးများ၏ အမည်နှင့် မျက်နှာကို လုံးဝမမှတ်မိတော့ခြင်း',
      'မိမိအိမ်သို့ ပြန်ရောက်ရန် လမ်းပျောက်သွားခြင်း',
      'နေ့နှင့်ည မှားယွင်းပြီး ညဘက်တွင် ဂဏှာမငြိမ် လျှောက်သွားနေခြင်း (Sundowning Syndrome)',
      'မမြင်ရသောအရာများကို မြင်သည်ဟု ထင်ယောင်ထင်မှားဖြစ်ခြင်း (Hallucination)'
    ],
    specialistAdvice: 'မေ့လျော့ရောဂါသည် ကုသ၍ အပြီးတိုင် မပျောက်ကင်းနိုင်သော်လည်း စောစီးစွာ ဆေးဝါးနှင့် ပြုစုမှုခံယူပါက ရောဂါတိုးတက်မှုနှုန်းကို သိသိသာသာ နှေးကွေးစေနိုင်ပါသည်။'
  },
  {
    id: 'fall_prevention',
    titleMm: 'ချော်လဲခြင်း အန္တရာယ် ကာကွယ်ရေးနှင့် အရိုးကျိုးခြင်း ကာကွယ်မှု',
    subtitleMm: 'သက်ကြီးရွယ်အိုများတွင် အဖြစ်အများဆုံးသော အိပ်ရာထဲလဲစေသည့် ချော်လဲမှု ကာကွယ်ခြင်း',
    category: 'daily_care',
    icon: '🚶‍♂️',
    summary: 'သက်ကြီးရွယ်အိုများတွင် ချော်လဲခြင်းသည် ပေါင်ထိပ်ရိုးကျိုးခြင်း၊ ဦးခေါင်းထိခိုက်ခြင်းနှင့် အိပ်ရာထဲ လုံးဝလဲသွားခြင်း (Bedridden) ဖြစ်စေသော အဓိက အကြောင်းရင်း ဖြစ်ပါသည်။',
    careGuidelines: [
      'ရေချိုးခန်းနှင့် အိမ်သာတွင် ချော်မလဲစေသော ရော်ဘာဖျာ (Anti-slip mats) ခင်းထားပါ',
      'အိမ်သာနှင့် ရေချိုးခန်း နံရံများတွင် လက်ကိုင်ဘားများ (Grab Bars) တပ်ဆင်ထားပါ',
      'ညဘက် အိမ်သာသွားရာ လမ်းတစ်လျှောက်တွင် ညမီးသီး (Night lights) အလင်းရောင် လုံလောက်စွာ ဖွင့်ထားပါ',
      'ခြေထောက်နှင့် ကွက်တိတော်သော မချော်သည့် ဖိနပ်များကိုသာ အိမ်တွင်း/အပြင် စီးစေပါ',
      'အရိုးသန်မာစေရန် ကယ်လ်စီယမ်၊ ဗီတာမင် D နှင့် ပေါ့ပါးသော လမ်းလျှောက်လေ့ကျင့်ခန်း ပုံမှန် ပြုလုပ်ပေးပါ'
    ],
    risksAndMistakes: [
      'ကြမ်းပြင်ပေါ်တွင် လျှပ်စစ်ဝါယာကြိုးများ၊ ကော်ဇောစွန်းများ ခလုတ်တိုက်နိုင်အောင် ထားရှိခြင်း',
      'အမှောင်ထဲတွင် တစ်ယောက်တည်း ထ၍ အိမ်သာသွားစေခြင်း'
    ],
    warningSigns: [
      'မကြာခဏ မူးဝေခြင်း သို့မဟုတ် ထိုင်ရာမှ အထတွင် မျက်စိပြာ၍ ယိုင်သွားခြင်း (Orthostatic Hypotension)',
      'ခြေထောက်များ အားနည်းလာပြီး ခြေလှမ်းမမှန်တော့ခြင်း',
      'ချော်လဲပြီးနောက် တင်ပါး သို့မဟုတ် ပေါင် ပြင်းထန်စွာ နာကျင်၍ မတ်တပ်မရပ်နိုင်တော့ခြင်း'
    ],
    specialistAdvice: 'သက်ကြီးရွယ်အိုများ ထိုင်ရာမှထလျှင် ဖြည်းဖြည်းချင်း အရင်ထိုင်ပြီးမှ မတ်တပ်ရပ်စေရန် အမြဲ သတိပေးပါ (သွေးပေါင် ရုတ်တရက်ကျခြင်းမှ ကာကွယ်ရန်)။'
  },
  {
    id: 'bed_sore_prevention',
    titleMm: 'အိပ်ရာထဲ လဲနေသော သက်ကြီးရွယ်အိုများ ဖိအားဒဏ်ရာ (Bed Sore) ကာကွယ်နည်း',
    subtitleMm: '၂ နာရီတစ်ကြိမ် အနေအထားပြောင်းခြင်းနှင့် အရေပြား ပိုးဝင်ခြင်း ကာကွယ်ရေး',
    category: 'daily_care',
    icon: '🛏️',
    summary: 'လေဖြတ်ခြင်း သို့မဟုတ် အကြောသေခြင်းကြောင့် အိပ်ရာထဲ လဲနေရသော သက်ကြီးရွယ်အိုများတွင် တင်ပါးဆုံ၊ ဖနောင့်၊ ကျောရိုးတို့၌ အချိန်ကြာမြင့်စွာ ဖိမိရာမှ သွေးမလျှောက်ဘဲ အသားပုပ်အနာဖြစ်ခြင်း (Pressure Ulcers/Bed Sores) ဖြစ်တတ်ပါသည်။',
    careGuidelines: [
      'အနည်းဆုံး ၂ နာရီတစ်ကြိမ် ဘယ်စောင်း၊ ညာစောင်း အနေအထား ပုံမှန် ပြောင်းလဲပေးပါ',
      'လေထိုးမွေ့ယာ (Air Ripple Mattress) သို့မဟုတ် ရေမွေ့ယာ အသုံးပြုပေးပါ',
      'ဆီး/ဝမ်း သွားပြီးတိုင်း ရေနွေးနွေးဖြင့် သန့်စင်ဆေးကြောပြီး ခြောက်သွေ့အောင် သုတ်၍ Zinc Oxide ခရင်မ် လိမ်းပေးပါ',
      'အိပ်ရာခင်းကို အရေးအကြောင်းများ မရှိစေဘဲ တင်းတင်းရင်းရင်း ခင်းထားပါ',
      'အနာကျက်မြန်စေရန်နှင့် အရေပြားသန်မာစေရန် ပရိုတင်း (အသား၊ ကြက်ဥ၊ ငါး) အာဟာရ ပြည့်ဝစွာ ကျွေးပါ'
    ],
    risksAndMistakes: [
      'ဆီးစိုနေသော အနှီး/သေးခံ (Diaper) ကို အချိန်ကြာမြင့်စွာ မလဲဘဲ ထားခြင်း',
      'အနာဖြစ်နေသော နေရာကို ပြင်းထန်စွာ နှိပ်နယ်ခြင်း (တစ်ရှူးများကို ပိုမိုပျက်စီးစေသည်)'
    ],
    warningSigns: [
      'အရေပြားနေရာတစ်ခုတွင် နီမြန်းပြီး ဖိကြည့်သော်လည်း ဖြူမသွားဘဲ ဆက်လက်နီရဲနေခြင်း (အဆင့် ၁ ဒဏ်ရာ)',
      'အရေပြား ပေါက်ပြဲ၍ အရည်ကြည်ဖု သို့မဟုတ် အနာခွက် ဖြစ်လာခြင်း',
      'အနာမှ အနံ့ဆိုးထွက်ခြင်း၊ ပြည်ယိုခြင်း သို့မဟုတ် အဖျားတက်လာခြင်း'
    ],
    specialistAdvice: 'ဖိအားဒဏ်ရာသည် ဖြစ်ပြီးမှ ကုသခြင်းထက် မဖြစ်မီ ကြိုတင်ကာကွယ်ခြင်းသည် အလွန်လွယ်ကူပြီး ထိရောက်မှု အရှိဆုံး ဖြစ်ပါသည်။'
  },
  {
    id: 'polypharmacy_safety',
    titleMm: 'ဆေးဝါး ဘေးကင်းစွာ သောက်သုံးရေး (Polypharmacy Management)',
    subtitleMm: 'ဆေးများ ရောထွေးမှားယွင်းမှု ကာကွယ်ခြင်းနှင့် ဘေးထွက်ဆိုးကျိုးများ စောင့်ကြည့်ခြင်း',
    category: 'medication',
    icon: '💊',
    summary: 'သက်ကြီးရွယ်အို အများစုသည် သွေးတိုး၊ ဆီးချို၊ နှလုံး၊ ကျောက်ကပ် စသော ရောဂါများစွာအတွက် နေ့စဉ် ဆေး ၅ မျိုးထက်မနည်း သောက်သုံးနေရသဖြင့် ဆေးမှားခြင်း၊ ဆေးအာနိသင်တိုက်မိခြင်း အန္တရာယ် အလွန်ကြီးမားပါသည်။',
    careGuidelines: [
      'ရက်သတ္တပတ်အလိုက် ဆေးထည့်သေတ္တာ (Pill Organizer Box - မနက်၊ နေ့၊ ည) စနစ်တကျ အသုံးပြုပါ',
      'သောက်နေသော ဆေးအမည်၊ ပမာဏနှင့် သောက်ရမည့် အချိန်စာရင်းကို စာရွက်ပေါ်တွင် ကြီးမားရှင်းလင်းစွာ ရေးမှတ်ထားပါ',
      '၆ လတစ်ကြိမ် သောက်နေသော ဆေးအားလုံးကို ဆရာဝန်နှင့် ပြသ၍ မလိုအပ်သော ဆေးများ လျှော့ချပါ (Medication Review)',
      'ကျောက်ကပ်နှင့် အသည်း လုပ်ငန်းဆောင်တာ (LFT / RFT) ကို ပုံမှန် စစ်ဆေးပါ'
    ],
    risksAndMistakes: [
      'အကိုက်အခဲပျောက်ဆေးများ (NSAIDs) ကို ဆရာဝန်ခွင့်ပြုချက်မပါဘဲ မိမိသဘောဖြင့် မကြာခဏ သောက်ခြင်း (ကျောက်ကပ်ပျက်စီးခြင်းနှင့် အစာအိမ်သွေးယိုခြင်း ဖြစ်စေသည်)',
      'ဆေးသောက်ရက် ကျော်သွားပါက နောက်တစ်ကြိမ်တွင် နှစ်ဆ သောက်သုံးခြင်း'
    ],
    warningSigns: [
      'ဆေးအသစ်စသောက်ပြီးနောက် ရုတ်တရက် မှိန်းသွားခြင်း သို့မဟုတ် စိတ်ရှုပ်ထွေးလာခြင်း',
      'ခြေလက်များ တုန်ရီလာခြင်း သို့မဟုတ် မူးဝေ၍ လဲကျခြင်း',
      'ပျို့အန်ခြင်း၊ ဝမ်းအမည်းရောင် သွားခြင်း'
    ],
    specialistAdvice: 'သက်ကြီးရွယ်အိုများတွင် အသက်အရွယ်အရ ကျောက်ကပ်နှင့် အသည်း၏ ဆေးစွန့်ထုတ်နိုင်စွမ်း လျော့ကျသဖြင့် ဆေးပမာဏကို အထူးသတိထား ချိန်ညှိရပါမည်။'
  },
  {
    id: 'elderly_nutrition_dysphagia',
    titleMm: 'သက်ကြီးရွယ်အို အာဟာရနှင့် အစာမျိုရခက်ခြင်း (Dysphagia) စောင့်ရှောက်မှု',
    subtitleMm: 'ရေဓာတ်မခမ်းခြောက်စေရေး၊ ဝမ်းမချုပ်စေရေးနှင့် အစာသီးခြင်း ကာကွယ်နည်း',
    category: 'nutrition',
    icon: '🍲',
    summary: 'သက်ကြီးရွယ်အိုများတွင် သွားမကောင်းခြင်း၊ တံတွေးထွက်နည်းခြင်းနှင့် လည်ချောင်းကြွက်သား အားနည်းခြင်းတို့ကြောင့် အစာမျိုရခက်ခဲပြီး အဆုတ်ထဲ အစာရောက်ကာ အဆုတ်ရောင်ခြင်း (Aspiration Pneumonia) ဖြစ်တတ်ပါသည်။',
    careGuidelines: [
      'အစာကို နူးညံ့ပျော့ပျောင်းစွာ ချက်ပြုတ်ပေးပါ (ဆန်ပြုတ်၊ ဟင်းချိုနူးနူး၊ ကြက်ဥပေါင်း၊ ငါးနူးနူး)',
      'အစာစားချိန်တွင် ခန္ဓာကိုယ်ကို မတ်မတ်ထိုင်စေပါ (အိပ်လျက် အစာလုံးဝမကျွေးပါနှင့်)',
      'အစာစားပြီးနောက် အနည်းဆုံး မိနစ် ၃၀ ခန့် မတ်မတ်ဆက်ထိုင်စေပါ',
      'ရေသောက်လျှင် သီးလွယ်ပါက အရည်ပျစ်ဆေး (Food Thickener) ရောစပ်ပေးပါ',
      'ဝမ်းချုပ်ခြင်း ကာကွယ်ရန် ရေနွေးနွေး မကြာခဏ တိုက်ပေးပြီး သင်္ဘောသီးမှည့်၊ ငှက်ပျောသီး ကျွေးပါ'
    ],
    risksAndMistakes: [
      'အိပ်ရာထဲ လဲလျက် အစာ သို့မဟုတ် ဆေးတိုက်ခြင်း (အဆုတ်ထဲ အစာဝင်၍ အသက်ရှူကျပ် သေဆုံးနိုင်သည်)',
      'မာကျောခြောက်သွေ့သော အစားအစာများ ကျွေးခြင်း'
    ],
    warningSigns: [
      'အစာစားတိုင်း သို့မဟုတ် ရေသောက်တိုင်း အဆက်မပြတ် ချောင်းဆိုးသီးခြင်း',
      'အစာစားပြီးနောက် အသံအက်ရှရှ ဖြစ်သွားခြင်း (Wet voice)',
      'အကြောင်းမဲ့ ကိုယ်ပူဖျားခြင်းနှင့် အသက်ရှူမြန်လာခြင်း (အဆုတ်ရောင်ရောဂါ လက္ခဏာ)'
    ],
    specialistAdvice: 'အစာသီးခြင်း မကြာခဏ ဖြစ်ပါက အစာမျိုနိုင်စွမ်းကို ဆရာဝန်နှင့် စစ်ဆေး၍ သင့်တော်သော အစားအစာ ပျစ်ခဲမှုအဆင့်ကို သတ်မှတ်ရပါမည်။'
  }
];

export const ElderlyCareModule: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTopic, setActiveTopic] = useState<GeriatricTopic>(ELDERLY_TOPICS[0]);

  // Interactive Home Fall Risk Assessment Checklist
  const [fallRiskAnswers, setFallRiskAnswers] = useState<{ [key: string]: boolean }>({
    'r1': false,
    'r2': false,
    'r3': false,
    'r4': false,
    'r5': false,
    'r6': false
  });

  const fallRiskQuestions = [
    { id: 'r1', text: 'လွန်ခဲ့သော ၁ နှစ်အတွင်း အနည်းဆုံး ၁ ကြိမ် ချော်လဲဖူးခြင်း သို့မဟုတ် မူးဝေယိုင်နဲ့ဖူးပါသလား။', score: 2 },
    { id: 'r2', text: 'ရေချိုးခန်း/အိမ်သာတွင် လက်ကိုင်ဘား (Grab Bars) နှင့် ချော်မလဲသောဖျာ မရှိသေးပါသလား။', score: 2 },
    { id: 'r3', text: 'နေ့စဉ် သွေးတိုး/စိတ်ငြိမ်ဆေး အပါအဝင် ဆေးဝါး ၄ မျိုးထက်ပို၍ သောက်သုံးနေရပါသလား။', score: 1 },
    { id: 'r4', text: 'အိမ်တွင်း လျှောက်လမ်းများတွင် လျှပ်စစ်ကြိုးများ၊ ကော်ဇောစွန်းများ သို့မဟုတ် အလင်းရောင် အားနည်းပါသလား။', score: 1 },
    { id: 'r5', text: 'ကုလားထိုင် သို့မဟုတ် အိပ်ရာမှ ထသည့်အခါ လက်မထောက်ဘဲ မတ်တပ်ထရပ်ရန် ခက်ခဲပါသလား။', score: 2 },
    { id: 'r6', text: 'မျက်စိမှုန်ခြင်း သို့မဟုတ် မျက်မှန်ပါဝါ မမှန်ခြင်း ရှိပါသလား။', score: 1 }
  ];

  const toggleFallRisk = (id: string) => {
    setFallRiskAnswers(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const totalRiskScore = fallRiskQuestions.reduce((acc, q) => {
    return acc + (fallRiskAnswers[q.id] ? q.score : 0);
  }, 0);

  const filteredTopics = ELDERLY_TOPICS.filter(t => {
    const matchCat = selectedCategory === 'all' || t.category === selectedCategory;
    const matchQ = t.titleMm.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   t.subtitleMm.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   t.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 rounded-2xl p-5 sm:p-7 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-xl">👵</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 tracking-wide uppercase">
                Geriatric & Elderly Care
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              သက်ကြီးရွယ်အို စောင့်ရှောက်ရေး လမ်းညွှန် (Elderly Care)
            </h1>
            <p className="text-xs sm:text-sm text-teal-100 max-w-2xl leading-relaxed">
              မေ့လျော့ရောဂါ (Dementia)၊ ချော်လဲခြင်း အန္တရာယ် ကာကွယ်ရေး၊ ဖိအားဒဏ်ရာ (Bed Sore) ကာကွယ်မှု၊ ဆေးဝါးဘေးကင်းရေးနှင့် သက်ကြီးအာဟာရ ဆေးပညာ လမ်းညွှန်ချက်များ။
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs border border-white/20 shrink-0">
            <Heart className="w-4 h-4 text-rose-300" />
            <span>မိဘဘိုးဘွားများ ဂရုစိုက်ရေး</span>
          </div>
        </div>
      </div>

      {/* Interactive Tool: Home Fall Risk Assessment */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-800">
                🏠 အိမ်တွင်း ချော်လဲခြင်း အန္တရာယ် စစ်ဆေးလွှာ (Home Fall-Risk Screener)
              </h2>
              <p className="text-xs text-slate-500">သက်ကြီးရွယ်အိုများ ချော်လဲနိုင်ခြေ အန္တရာယ်အဆင့်ကို စစ်ဆေး၍ ကာကွယ်မှုများ ပြုလုပ်ပါ</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {fallRiskQuestions.map((q) => {
            const isChecked = !!fallRiskAnswers[q.id];
            return (
              <label 
                key={q.id}
                onClick={() => toggleFallRisk(q.id)}
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  isChecked 
                    ? 'bg-rose-50/70 border-rose-300 text-slate-900 font-medium' 
                    : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100/70'
                }`}
              >
                <input 
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  className="mt-0.5 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 accent-rose-600 cursor-pointer shrink-0"
                />
                <span className="text-xs leading-relaxed">{q.text}</span>
              </label>
            );
          })}
        </div>

        {/* Risk Assessment Result */}
        <div className={`p-4 rounded-xl border space-y-1.5 ${
          totalRiskScore >= 4 
            ? 'bg-red-50 border-red-200 text-red-950' 
            : totalRiskScore >= 2 
              ? 'bg-amber-50 border-amber-200 text-amber-950' 
              : 'bg-emerald-50 border-emerald-200 text-emerald-950'
        }`}>
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
            {totalRiskScore >= 4 ? (
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            ) : totalRiskScore >= 2 ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            <span>
              {totalRiskScore >= 4 
                ? `🚨 ချော်လဲနိုင်ခြေ အလွန်မြင့်မားပါသည် (ရမှတ်: ${totalRiskScore} မှတ် - High Fall Risk)`
                : totalRiskScore >= 2
                  ? `⚠️ ချော်လဲနိုင်ခြေ အလယ်အလတ် ရှိနေပါသည် (ရမှတ်: ${totalRiskScore} မှတ် - Moderate Risk)`
                  : `✅ ချော်လဲနိုင်ခြေ နည်းပါးပြီး ဘေးကင်းပါသည် (ရမှတ်: ${totalRiskScore} မှတ် - Low Risk)`}
            </span>
          </div>
          <p className="text-xs leading-relaxed">
            {totalRiskScore >= 4 
              ? 'ရေချိုးခန်းတွင် လက်ကိုင်ဘား (Grab bars) ချက်ချင်းတပ်ဆင်ပါ၊ ညမီးသီးများ ထွန်းထားပါ၊ လမ်းလျှောက်တုတ် သို့မဟုတ် အကူပစ္စည်းများ အသုံးပြုစေပြီး ဆရာဝန်နှင့် သောက်ဆေးများကို ပြန်လည်စစ်ဆေးပါ။'
              : totalRiskScore >= 2
                ? 'အိမ်တွင်း ခလုတ်တိုက်နိုင်သော ပစ္စည်းများကို ရှင်းလင်းပါ၊ ရေချိုးခန်းတွင် ရော်ဘာဖျာခင်းပြီး သက်ကြီးရွယ်အိုအား သတိထား သွားလာစေပါ။'
                : 'လက်ရှိ အိမ်တွင်းပတ်ဝန်းကျင်သည် ဘေးကင်းလုံခြုံမှု ရှိပါသည်။ ဆက်လက်ထိန်းသိမ်းပါ။'}
          </p>
        </div>
      </div>

      {/* Main Geriatric Topics Hub */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'all', label: 'အားလုံး' },
              { id: 'dementia', label: '🧠 မေ့လျော့ရောဂါ' },
              { id: 'daily_care', label: '🚶‍♂️ ချော်လဲ/အနာကာကွယ်ရေး' },
              { id: 'medication', label: '💊 ဆေးဝါးဘေးကင်းရေး' },
              { id: 'nutrition', label: '🍲 အာဟာရနှင့် မျိုရခက်ခြင်း' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input 
              type="text"
              placeholder="သက်ကြီးစောင့်ရှောက်နည်း ရှာဖွေရန်..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* 2-Col Topics View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 space-y-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              စောင့်ရှောက်ရေး အကြောင်းအရာများ ({filteredTopics.length})
            </span>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredTopics.map((topic) => {
                const isSelected = activeTopic.id === topic.id;
                return (
                  <button
                    key={topic.id}
                    onClick={() => setActiveTopic(topic)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-teal-50 border-teal-500 shadow-xs ring-1 ring-teal-500'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl p-1.5 bg-white rounded-xl shadow-2xs shrink-0 border border-slate-100">
                      {topic.icon}
                    </span>
                    <div className="space-y-1 flex-1 min-w-0">
                      <h3 className={`text-xs font-bold truncate ${isSelected ? 'text-teal-950' : 'text-slate-800'}`}>
                        {topic.titleMm}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {topic.subtitleMm}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-6">
            <div className="border-b border-slate-100 pb-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{activeTopic.icon}</span>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    {activeTopic.titleMm}
                  </h2>
                  <p className="text-xs text-teal-700 font-semibold">{activeTopic.subtitleMm}</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                {activeTopic.summary}
              </p>
            </div>

            {/* Care Guidelines & Risks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>မှန်ကန်သော ပြုစုစောင့်ရှောက်နည်းများ</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {activeTopic.careGuidelines.map((g, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-50/50 rounded-xl p-4 border border-red-100 space-y-2.5">
                <div className="flex items-center gap-2 text-red-900 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>ရှောင်ကြဉ်ရမည့် အန္တရာယ်နှင့် အမှားများ</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {activeTopic.risksAndMistakes.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-500 font-bold mt-0.5">✕</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Warning Signs */}
            <div className="space-y-2.5 bg-red-50 rounded-xl p-4 border border-red-200">
              <div className="flex items-center gap-2 text-red-900 font-bold text-xs">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>⚠️ အရေးပေါ် ဆရာဝန်ပြသရန် သတိပေးလက္ခဏာများ</span>
              </div>
              <ul className="space-y-1.5 text-xs text-red-950 font-medium">
                {activeTopic.warningSigns.map((w, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">!</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Specialist Advice */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
              <BookOpen className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-teal-900 block mb-0.5">သက်ကြီးရောဂါ အထူးကုဆရာဝန်၏ အကြံပြုချက်:</span>
                <p className="leading-relaxed">{activeTopic.specialistAdvice}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
