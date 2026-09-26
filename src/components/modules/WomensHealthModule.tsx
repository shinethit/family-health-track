import React, { useState } from 'react';
import { 
  Heart, 
  Sparkles, 
  Calendar, 
  ShieldAlert, 
  CheckCircle2, 
  Info, 
  Activity, 
  AlertTriangle, 
  HelpCircle, 
  ChevronRight,
  RefreshCw,
  Search,
  BookOpen
} from 'lucide-react';

interface HealthTopic {
  id: string;
  titleMm: string;
  subtitleMm: string;
  category: 'gynecology' | 'periods' | 'cancer_screening' | 'menopause' | 'hygiene';
  icon: string;
  tagColor: string;
  summary: string;
  symptoms: string[];
  causes: string[];
  preventionAndCare: string[];
  warningSigns: string[];
  medicalAdvice: string;
}

const WOMENS_TOPICS: HealthTopic[] = [
  {
    id: 'pcos',
    titleMm: 'သားဥအိမ် ရေအိတ်တည်ခြင်း (PCOS)',
    subtitleMm: 'Polycystic Ovary Syndrome - မျိုးပွားဟော်မုန်း မညီမျှမှု',
    category: 'gynecology',
    icon: '🌸',
    tagColor: 'bg-rose-50 text-rose-700 border-rose-200',
    summary: 'PCOS သည် မျိုးပွားအရွယ် အမျိုးသမီးများတွင် အဖြစ်အများဆုံးသော ဟော်မုန်းမညီမျှမှုရောဂါဖြစ်ပြီး သားဥကြွေခြင်း မမှန်ခြင်း၊ ယောက်ျားဟော်မုန်း (Androgen) များပြားခြင်းနှင့် သားဥအိမ်တွင် ရေအိတ်ငယ်များစွာ ဖြစ်ပေါ်စေပါသည်။',
    symptoms: [
      'ရာသီမမှန်ခြင်း၊ ရာသီလကျော်ခြင်း သို့မဟုတ် လုံးဝမလာခြင်း',
      'မျက်နှာ၊ မေးစေ့၊ ရင်ဘတ်နှင့် ကျောတို့တွင် အမွေးအမျှင်များ ထူထပ်စွာ ပေါက်ခြင်း (Hirsutism)',
      'မျက်နှာတွင် ဝက်ခြံဆိုးရွားစွာ ပေါက်ခြင်းနှင့် အဆီပြန်ခြင်း',
      'ကိုယ်အလေးချိန် ရုတ်တရက်တက်လာခြင်းနှင့် ကျရန်ခက်ခဲခြင်း',
      'ဦးခေါင်းထိပ်ပိုင်း ဆံပင်ကျွတ်ခြင်း၊ ပါးလာခြင်း',
      'လည်ပင်း၊ ချိုင်းနှင့် ပေါင်ခြံတို့တွင် အရေပြားမည်းညစ်လာခြင်း (Acanthosis Nigricans)'
    ],
    causes: [
      'အင်ဆူလင် ခုခံအားတက်ခြင်း (Insulin Resistance) ကြောင့် အင်ဆူလင်ဟော်မုန်း မြင့်တက်လာခြင်း',
      'မျိုးရိုးဗီဇဆိုင်ရာ သက်ရောက်မှုများ',
      'ခန္ဓာကိုယ်တွင်း နာတာရှည် ရောင်ရမ်းမှုများ (Low-grade chronic inflammation)',
      'ယောက်ျားဟော်မုန်း (Androgens) ပမာဏ ပုံမှန်ထက် များပြားနေခြင်း'
    ],
    preventionAndCare: [
      'ကာဗိုဟိုက်ဒရိတ် (ကစီဓာတ်) နှင့် သကြားစားသုံးမှု လျှော့ချပြီး အမျှင်ဓာတ်များသော အစားအစာများ စားပါ',
      'တစ်ပတ်လျှင် အနည်းဆုံး မိနစ် ၁၅၀ အလယ်အလတ် ကိုယ်လက်လှုပ်ရှားမှု (လမ်းလျှောက်၊ ရွရွပြေး) ပြုလုပ်ပါ',
      'ကိုယ်အလေးချိန် ၅% မှ ၁၀% ခန့် လျှော့ချခြင်းသည် သားဥပုံမှန် ပြန်ကြွေစေရန် များစွာ အထောက်အကူပြုပါသည်',
      'စိတ်ဖိစီးမှု လျှော့ချပြီး ညစဉ် အိပ်ရေးဝဝ အိပ်စက်ပါ',
      'ဆရာဝန် ညွှန်ကြားသော ဟော်မုန်းညှိဆေး သို့မဟုတ် သွေးတွင်းသကြားဓာတ် ထိန်းဆေးများကို စနစ်တကျ သောက်သုံးပါ'
    ],
    warningSigns: [
      'ရာသီ ၃ လထက်ပို၍ လုံးဝမလာတော့ခြင်း',
      'သွေးဆင်းလွန်ကဲ၍ ရက်သတ္တပတ် ၂ ပတ်ကျော် ဆက်တိုက်ဆင်းခြင်း',
      'ဆီးချိုရောဂါ သို့မဟုတ် သွေးတိုးရောဂါ အတူတကွ ပူးတွဲခံစားရခြင်း'
    ],
    medicalAdvice: 'PCOS သည် အချိန်မီ မကုသပါက နောင်တွင် သားသမီးရရန် ခက်ခဲခြင်း၊ ဆီးချိုရောဂါနှင့် သားအိမ်ကင်ဆာ ဖြစ်နိုင်ခြေ မြင့်တက်စေသဖြင့် မီးယပ်အထူးကုဆရာဝန်နှင့် ပြသတိုင်ပင်သင့်ပါသည်။'
  },
  {
    id: 'endometriosis',
    titleMm: 'သားအိမ်အတွင်းသား နေရာလွဲရောဂါ (Endometriosis)',
    subtitleMm: 'ရာသီလာစဉ် ပြင်းထန်စွာ ကိုက်ခဲနာကျင်မှုနှင့် သားအိမ်အပြင်ဘက် အသားစများ ကြီးထွားခြင်း',
    category: 'gynecology',
    icon: '🩸',
    tagColor: 'bg-red-50 text-red-700 border-red-200',
    summary: 'သားအိမ်အတွင်းတွင်သာ ရှိသင့်သော သားအိမ်အတွင်းနံရံအသားစများ (Endometrial tissue) သည် သားဥအိမ်၊ သားဥပြွန်နှင့် တင်ပါးဆုံတွင်း ကလီစာများပေါ်သို့ နေရာလွဲမှား ကပ်တွယ်ပေါက်ဖွားကာ ရာသီလာတိုင်း ပြင်းထန်စွာ ရောင်ရမ်းနာကျင်စေသော ရောဂါဖြစ်ပါသည်။',
    symptoms: [
      'ရာသီလာစဉ် တင်ပါးဆုံနှင့် ဝမ်းဗိုက်အောက်ပိုင်း ပြင်းထန်စွာ ကိုက်ခဲခြင်း (Dysmenorrhea)',
      'လိင်ဆက်ဆံစဉ် သို့မဟုတ် ဆက်ဆံပြီးနောက်ပိုင်း နာကျင်ခြင်း',
      'ဆီးသွားစဉ် သို့မဟုတ် ဝမ်းသွားစဉ် အထူးသဖြင့် ရာသီကာလတွင် နာကျင်ခြင်း',
      'ရာသီသွေး အဆမတန် ဆင်းခြင်း သို့မဟုတ် ရာသီမတိုင်မီ သွေးစွန်းခြင်း',
      'နာတာရှည် ပင်ပန်းနွမ်းနယ်ခြင်း၊ မအီမသာဖြစ်ခြင်း၊ ဝမ်းချုပ်ခြင်း သို့မဟုတ် ဝမ်းလျှောခြင်း'
    ],
    causes: [
      'ရာသီသွေး နောက်ပြန်စီးခြင်း (Retrograde Menstruation)',
      'ကိုယ်ခံအားစနစ် ချို့ယွင်းချက်ကြောင့် နေရာလွဲ အသားစများကို မဖျက်ဆီးနိုင်ခြင်း',
      'ခွဲစိတ်ဒဏ်ရာများတွင် ဆဲလ်များ ကပ်ငြိကျန်ရစ်ခြင်း',
      'မျိုးရိုးဗီဇနှင့် ဟော်မုန်းပြောင်းလဲမှုများ'
    ],
    preventionAndCare: [
      'ဝမ်းဗိုက်ပေါ်တွင် ရေနွေးအိတ် ကပ်ပေးခြင်းဖြင့် ကြွက်သားများ ပြေလျော့စေပါ',
      'ရောင်ရမ်းမှုကို ဆန့်ကျင်သော အစားအစာများ (အိုမီဂါ-၃၊ ဟင်းသီးဟင်းရွက်စိမ်း၊ သစ်သီး) များများစားပါ',
      'ကဖင်းဓာတ်နှင့် အရက်သေစာ ရှောင်ကြဉ်ပါ',
      'ဆရာဝန်ညွှန်ကြားသော အကိုက်အခဲပျောက်ဆေးများနှင့် ဟော်မုန်းကုထုံးများကို လိုက်နာပါ'
    ],
    warningSigns: [
      'အကိုက်အခဲပျောက်ဆေး သောက်သော်လည်း နာကျင်မှု လုံးဝမသက်သာခြင်း',
      'အလွန်အမင်း မူးမေ့လဲခြင်း၊ သွေးအားနည်း ရောဂါဖြစ်လာခြင်း',
      'ကလေးယူရန် ကြိုးစားသော်လည်း ၁ နှစ်ကျော်အထိ ကလေးမရနိုင်ခြင်း'
    ],
    medicalAdvice: 'ပြင်းထန်သော ရာသီကိုက်ခဲမှုကို သာမန်ဟု သဘောမထားဘဲ အာထရာဆောင်း (Ultrasound) သို့မဟုတ် အထူးကုနှင့် တိုင်ပင်၍ အစောဆုံး ရောဂါရှာဖွေကုသမှု ခံယူပါ။'
  },
  {
    id: 'uterine_fibroids',
    titleMm: 'သားအိမ် အသားလုံး (Uterine Fibroids)',
    subtitleMm: 'ကင်ဆာမဟုတ်သော သားအိမ်ကြွက်သားလုံး ကြီးထွားခြင်း',
    category: 'gynecology',
    icon: '🔬',
    tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
    summary: 'သားအိမ်နံရံရှိ ချောမွေ့ကြွက်သားမျှင်များ ပုံမှန်မဟုတ်ဘဲ အစုလိုက် ကြီးထွားလာခြင်းဖြစ်ပြီး ကင်ဆာအကျိတ် မဟုတ်ပါ။ အရွယ်အစား သေးငယ်သည်မှ ဘောလုံးအရွယ်အထိ အမျိုးမျိုး ရှိနိုင်ပါသည်။',
    symptoms: [
      'ရာသီသွေး ပမာဏ အလွန်များပြားစွာ ဆင်းခြင်းနှင့် သွေးခဲကြီးများ ပါလာခြင်း',
      'ရာသီလာချိန် တစ်ပတ်ထက် ပိုမိုကြာမြင့်ခြင်း',
      'ဆီးခဏခဏ သွားချင်ခြင်း သို့မဟုတ် ဆီးသွားရ ခက်ခဲခြင်း (အသားလုံးက ဆီးအိမ်ကို ဖိမိခြင်း)',
      'ဝမ်းချုပ်ခြင်းနှင့် စအိုဝဖိခံရသလို ခံစားရခြင်း',
      'ခါးအောက်ပိုင်းနှင့် တင်ပါးဆုံ နာကျင်ကိုက်ခဲခြင်း',
      'ဝမ်းဗိုက်အောက်ပိုင်း ဖောင်းကားလာခြင်း'
    ],
    causes: [
      'အီစထရိုဂျင် (Estrogen) နှင့် ပရိုဂျက်စထရုန်း (Progesterone) ဟော်မုန်း လှုံ့ဆော်မှုများ',
      'မျိုးရိုးဗီဇ (မိခင်၊ အမ များတွင် ဖြစ်ဖူးပါက ဖြစ်နိုင်ခြေ ပိုများ)',
      'အဝလွန်ခြင်းနှင့် အသက် ၃၀ မှ ၅၀ ကြား အမျိုးသမီးများတွင် အဖြစ်များခြင်း'
    ],
    preventionAndCare: [
      'သံဓာတ်ကြွယ်ဝသော အစားအစာများ (အသည်း၊ အမဲသား၊ အစိမ်းရင့်ရောင် အရွက်) စားသုံးပြီး သွေးအားနည်းခြင်းကို ကာကွယ်ပါ',
      'အနီရောင်အသား စားသုံးမှုကို လျှော့ချပြီး လတ်ဆတ်သော ဟင်းသီးဟင်းရွက် သစ်သီးများ ပိုမိုစားပါ',
      'ကိုယ်အလေးချိန် ပုံမှန်ဖြစ်အောင် ထိန်းသိမ်းပါ',
      'ပုံမှန် သားဖွားမီးယပ်စစ်ဆေးမှု ပြုလုပ်ပြီး အသားလုံးအရွယ်အစား စောင့်ကြည့်ပါ'
    ],
    warningSigns: [
      'သွေးဆင်းများလွန်း၍ မူးဝေခြင်း၊ နှလုံးတုန်ခြင်း၊ အသားဖြူဖပ်ဖြူရော် ဖြစ်လာခြင်း',
      'ရုတ်တရက် ဝမ်းဗိုက် ပြင်းထန်စွာ ထိုးအောင့်နာကျင်ခြင်း',
      'ဆီးလုံးဝ သွားမရတော့ခြင်း'
    ],
    medicalAdvice: 'အသားလုံးတိုင်း ခွဲစိတ်ရန် မလိုပါ။ လက္ခဏာပြင်းထန်မှု၊ အသက်အရွယ်နှင့် ကလေးယူလိုမှုအပေါ် မူတည်၍ ဆေးကုထုံး သို့မဟုတ် ခွဲစိတ်ကုထုံးကို မီးယပ်အထူးကုနှင့် တိုင်ပင်ဆုံးဖြတ်ပါ။'
  },
  {
    id: 'cervical_cancer_screening',
    titleMm: 'သားအိမ်ခေါင်းကင်ဆာနှင့် ကြိုတင်ကာကွယ်စစ်ဆေးခြင်း',
    subtitleMm: 'HPV ပိုးစစ်ဆေးခြင်း၊ Pap Smear နှင့် HPV ကာကွယ်ဆေး ထိုးနှံခြင်း',
    category: 'cancer_screening',
    icon: '🛡️',
    tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    summary: 'သားအိမ်ခေါင်းကင်ဆာသည် ကြိုတင်ကာကွယ်ဆေးထိုးခြင်းနှင့် Pap Smear ပုံမှန်စစ်ဆေးခြင်းဖြင့် ၉၀% ကျော် ကြိုတင်ကာကွယ် တားဆီးနိုင်သော ကင်ဆာရောဂါ ဖြစ်ပါသည်။',
    symptoms: [
      'အစောပိုင်းအဆင့်တွင် မည်သည့် လက္ခဏာမျှ မပြတတ်ပါ (ကြိုတင်စစ်ဆေးမှု အရေးကြီးပါသည်)',
      'အမျိုးသားနှင့် အတူနေပြီးနောက် သွေးဆင်းခြင်း',
      'ရာသီလာချိန် မဟုတ်ဘဲ ကြားရက်များတွင် သွေးဆင်းခြင်း',
      'သွေးဆုံးပြီးမှ မိန်းမကိုယ်မှ သွေးပြန်ဆင်းခြင်း',
      'အနံ့ဆိုးသော သို့မဟုတ် သွေးစပါသော မိန်းမကိုယ် အဖြူဆင်းခြင်း',
      'တင်ပါးဆုံနှင့် ခါးအောက်ပိုင်း အကြောင်းမဲ့ နာကျင်ခြင်း'
    ],
    causes: [
      'Human Papillomavirus (HPV အမျိုးအစား 16, 18) ပိုး ကူးစက်ခံရခြင်း (အဓိကအကြောင်းရင်း)',
      'အသက်ငယ်ရွယ်စဉ် လိင်ဆက်ဆံခြင်းနှင့် အကာအကွယ်မဲ့ လိင်ဆက်ဆံခြင်း',
      'ဆေးလိပ်သောက်ခြင်း (သားအိမ်ခေါင်းဆဲလ်များကို ပျက်စီးစေပါသည်)',
      'ကိုယ်ခံအားစနစ် အားနည်းခြင်း'
    ],
    preventionAndCare: [
      'HPV ကာကွယ်ဆေး (HPV Vaccine - Gardasil-9) ကို အသက် ၉ နှစ်မှ ၄၅ နှစ်အတွင်း မဖြစ်မနေ ထိုးနှံပါ',
      'အသက် ၂၁ နှစ်မှ စတင်၍ ၃ နှစ်တစ်ကြိမ် Pap Smear သို့မဟုတ် ၅ နှစ်တစ်ကြိမ် HPV DNA စစ်ဆေးပါ',
      'တစ်လင်တစ်မယားစနစ် ကျင့်သုံးပြီး အကာအကွယ် (Condom) အသုံးပြုပါ',
      'ဆေးလိပ်နှင့် ဆေးရွက်ကြီး လုံးဝရှောင်ကြဉ်ပါ'
    ],
    warningSigns: [
      'သွေးဆုံးပြီး အမျိုးသမီးတွင် သွေးပြန်ဆင်းခြင်း (မဖြစ်မနေ ချက်ချင်းပြသရပါမည်)',
      'အနံ့ဆိုးသော အညိုရောင်/သွေးရောင် အဖြူဆင်းခြင်း မရပ်စဲခြင်း',
      'အကြောင်းမဲ့ ကိုယ်အလေးချိန် အလွန်အကျွံ ကျဆင်းခြင်း'
    ],
    medicalAdvice: 'အိမ်ထောင်ရှိသူ သို့မဟုတ် လိင်ဆက်ဆံဖူးသူ အမျိုးသမီးတိုင်း လက္ခဏာမပြမီအချိန်ကတည်းက Pap Smear ကို ပုံမှန် စစ်ဆေးသင့်ပါသည်။'
  },
  {
    id: 'breast_self_exam',
    titleMm: 'ရင်သားကင်ဆာနှင့် မိမိကိုယ်တိုင် ရင်သားစစ်ဆေးနည်း',
    subtitleMm: 'လစဉ် ရင်သားစစ်ဆေးခြင်း (BSE) နှင့် Mammogram ဓာတ်မှန်ရိုက်ခြင်း',
    category: 'cancer_screening',
    icon: '🎀',
    tagColor: 'bg-pink-50 text-pink-700 border-pink-200',
    summary: 'ရင်သားကင်ဆာသည် အမျိုးသမီးများတွင် အဖြစ်အများဆုံး ကင်ဆာဖြစ်ပြီး အစောပိုင်းအဆင့်တွင် သိရှိပါက အပြီးတိုင် ပျောက်ကင်းအောင် ကုသနိုင်ခြေ အလွန်မြင့်မားပါသည်။',
    symptoms: [
      'ရင်သား သို့မဟုတ် ချိုင်းအောက်တွင် နာကျင်မှုမရှိသော အကျိတ်/အဖု စမ်းမိခြင်း',
      'ရင်သား အရွယ်အစား သို့မဟုတ် ပုံသဏ္ဌာန် ရုတ်တရက် ပြောင်းလဲသွားခြင်း',
      'ရင်သား အရေပြား ချိုင့်ဝင်ခြင်း၊ လိမ္မော်ခွံကဲ့သို့ အပေါက်ငယ်များ ဖြစ်လာခြင်း',
      'နို့သီးခေါင်း အတွင်းသို့ ချိုင့်ဝင်သွားခြင်း',
      'နို့သီးခေါင်းမှ သွေး သို့မဟုတ် အရည်ကြည်များ အလိုအလျောက် ထွက်ကျလာခြင်း',
      'နို့သီးခေါင်းတစ်ဝိုက် နီမြန်းခြင်း၊ အနာဖြစ်ခြင်း သို့မဟုတ် အကြေးခွံကွာခြင်း'
    ],
    causes: [
      'အသက် ၄၀ ကျော်လာခြင်း',
      'မိခင်၊ ညီအစ်မများတွင် ရင်သားကင်ဆာ ဖြစ်ဖူးသော မျိုးရိုးရှိခြင်း (BRCA1, BRCA2 မျိုးရိုးဗီဇ)',
      'ရာသီစတင်လာချိန် အလွန်စောခြင်း (အသက် ၁၂ နှစ်မတိုင်မီ) သို့မဟုတ် သွေးဆုံးချိန် နောက်ကျခြင်း (အသက် ၅၅ နှစ်ကျော်)',
      'အရက်သောက်သုံးခြင်း၊ ကိုယ်လက်လှုပ်ရှားမှု မရှိခြင်းနှင့် အဝလွန်ခြင်း'
    ],
    preventionAndCare: [
      'လစဉ် ရာသီပြီးဆုံးပြီး ၃ ရက်မှ ၅ ရက်အတွင်း မိမိကိုယ်တိုင် ရင်သားကို စနစ်တကျ စမ်းသပ်ပါ (BSE)',
      'အသက် ၄၀ ကျော်ပါက ၁ နှစ် သို့မဟုတ် ၂ နှစ်တစ်ကြိမ် Mammogram ရင်သားဓာတ်မှန် စစ်ဆေးပါ',
      'အယ်လ်ကိုဟော သောက်သုံးမှု ရှောင်ကြဉ်ပြီး ကိုယ်အလေးချိန် ထိန်းသိမ်းပါ',
      'ကလေးကို မိခင်နို့တိုက်ကျွေးခြင်းသည် ရင်သားကင်ဆာ ဖြစ်နိုင်ခြေကို လျှော့ချပေးပါသည်'
    ],
    warningSigns: [
      'အကျိတ်အဖုသည် မာကျောပြီး ရွေ့လျား၍ မရဘဲ ကပ်ငြိနေခြင်း',
      'နို့သီးခေါင်းမှ သွေးထွက်ခြင်း',
      'ချိုင်းအောက်တွင် အကျိတ်ကြီးလာခြင်း'
    ],
    medicalAdvice: 'ရင်သားတွင် မသင်္ကာဖွယ် အဖုအကျိတ် စမ်းမိပါက မကြောက်ပါနှင့်။ အကျိတ် ၈၀% သည် ကင်ဆာမဟုတ်သော ရိုးရိုးအကျိတ်များ (Fibroadenoma/Cyst) သာ ဖြစ်တတ်သော်လည်း ဆရာဝန်နှင့် သေချာစစ်ဆေးသင့်ပါသည်။'
  },
  {
    id: 'menopause_care',
    titleMm: 'သွေးဆုံးကိုင်ခြင်းနှင့် သွေးဆုံးချိန် ကျန်းမာရေး (Menopause)',
    subtitleMm: 'ဟော်မုန်းပြောင်းလဲမှု၊ အရိုးပွရောဂါ ကာကွယ်ရေးနှင့် စိတ်ပိုင်းဆိုင်ရာ ပြုစုစောင့်ရှောက်မှု',
    category: 'menopause',
    icon: '🍂',
    tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
    summary: 'အမျိုးသမီးများ အသက် ၄၅ မှ ၅၅ နှစ်ကြားတွင် သားဥအိမ်၏ လုပ်ငန်းဆောင်တာ ရပ်တန့်သွားပြီး မီးယပ်ရာသီ ၁၂ လ ဆက်တိုက် လုံးဝမလာတော့သော သဘာဝ အဆင့်ဖြစ်ပါသည်။',
    symptoms: [
      'ရုတ်တရက် ရင်ဘတ်နှင့် မျက်နှာ ပူနွေးနီမြန်းလာခြင်း (Hot Flashes) နှင့် ညဘက် ချွေးထွက်လွန်ခြင်း',
      'စိတ်ဆတ်ခြင်း၊ စိတ်တိုလွယ်ခြင်း၊ စိတ်ဓာတ်ကျလွယ်ခြင်းနှင့် အိပ်မပျော်ခြင်း',
      'မိန်းမကိုယ် ခြောက်သွေ့ခြင်းနှင့် လိင်ဆက်ဆံစဉ် နာကျင်ခြင်း',
      'ဆီးမထိန်းနိုင်ခြင်း သို့မဟုတ် ဆီးခဏခဏ သွားချင်ခြင်း',
      'အသားအရေ ခြောက်သွေ့ခြင်း၊ ဆံပင်ကျွတ်ခြင်းနှင့် အဆစ်အမြစ်များ ကိုက်ခဲခြင်း',
      'မေ့လွယ်ခြင်းနှင့် အာရုံစူးစိုက်ရ ခက်ခဲခြင်း'
    ],
    causes: [
      'သဘာဝအရ သားဥအိမ်မှ အီစထရိုဂျင် (Estrogen) နှင့် ပရိုဂျက်စထရုန်း ဟော်မုန်းများ ထုတ်လုပ်မှု ရပ်တန့်သွားခြင်း',
      'သားအိမ်နှင့် သားဥအိမ် ခွဲစိတ်ဖြတ်ထုတ်ထားရခြင်း (Surgical Menopause)'
    ],
    preventionAndCare: [
      'ကယ်လ်စီယမ် (Calcium) နှင့် ဗီတာမင် D ကြွယ်ဝသော အစားအစာများ (နို့၊ ဒိန်ချဉ်၊ နှမ်း၊ အရိုးပါဝါးစားနိုင်သော ငါးလေးများ) နေ့စဉ် စားပါ',
      'အရိုးပွရောဂါ ကာကွယ်ရန် ကိုယ်အလေးချိန်ခံ လေ့ကျင့်ခန်းများ (လမ်းလျှောက်ခြင်း၊ အလေးမခြင်း) ပုံမှန် ပြုလုပ်ပါ',
      'ချည်သား ပွပွချောင်ချောင် ဝတ်ဆင်ပြီး အခန်းတွင်း လေဝင်လေထွက် ကောင်းမွန်အောင် ထားပါ',
      'ပဲပိစပ်၊ တို့ဟူး ကဲ့သို့သော သဘာဝ အပင်ထွက် အီစထရိုဂျင် (Phytoestrogens) ပါဝင်သော အစားအစာများ စားသုံးပါ',
      'ရေများများသောက်ပြီး ကဖင်းဓာတ်နှင့် အစပ်အဟပ် လျှော့စားပါ'
    ],
    warningSigns: [
      'သွေးဆုံးပြီး ၁ နှစ်ကျော်မှ သွေးပြန်ဆင်းခြင်း (မဖြစ်မနေ သားအိမ်ကင်ဆာ ရှိ/မရှိ စစ်ဆေးရမည်)',
      'အလွန်အမင်း စိတ်ဓာတ်ကျပြီး လူနေမှုဘဝ ထိခိုက်လာခြင်း',
      'အနည်းငယ် ထိခိုက်မိရုံဖြင့် အရိုးကျိုးလွယ်ခြင်း'
    ],
    medicalAdvice: 'သွေးဆုံးကိုင် လက္ခဏာများ အလွန်ပြင်းထန်ပါက မီးယပ်ဆရာဝန်နှင့် တိုင်ပင်၍ ဟော်မုန်းအစားထိုးကုထုံး (HRT) သို့မဟုတ် သဘာဝ ကုထုံးများကို ရွေးချယ်နိုင်ပါသည်။'
  },
  {
    id: 'vaginal_hygiene',
    titleMm: 'မိန်းမကိုယ် သန့်ရှင်းရေးနှင့် ပိုးဝင်ခြင်း ကာကွယ်နည်း',
    subtitleMm: 'မှိုပိုးဝင်ခြင်း (Yeast Infection) နှင့် ဘက်တီးရီးယား ပိုးဝင်ခြင်း (BV) ခွဲခြားသိရှိခြင်း',
    category: 'hygiene',
    icon: '✨',
    tagColor: 'bg-teal-50 text-teal-700 border-teal-200',
    summary: 'မိန်းမကိုယ်သည် မိမိကိုယ်တိုင် သန့်စင်နိုင်သော သဘာဝစနစ် (Self-cleaning) ရှိပြီး သဘာဝ pH (၃.၈ - ၄.၅) အက်ဆစ်ဓာတ်ကို ထိန်းသိမ်းထားရန် မှန်ကန်သော သန့်ရှင်းရေး အလေ့အကျင့် လိုအပ်ပါသည်။',
    symptoms: [
      'မှိုပိုးဝင်ခြင်း (Candidiasis): ဒိန်ချဉ်ဖတ်ကဲ့သို့ အဖြူဆင်းခြင်း၊ အလွန်ယားယံခြင်း၊ နီမြန်းရောင်ရမ်းခြင်း',
      'ဘက်တီးရီးယား ပိုးဝင်ခြင်း (BV): ငါးညှီနံ့ကဲ့သို့ အနံ့ဆိုးထွက်ခြင်း၊ မီးခိုးရောင် သို့မဟုတ် စိမ်းဝါရောင် အဖြူဆင်းခြင်း',
      'ဆီးသွားစဉ် စပ်ဖျဉ်းဖျဉ်း နာကျင်ခြင်း',
      'မိန်းမကိုယ် နီမြန်း ရောင်ရမ်းပြီး ပူလောင်နေခြင်း'
    ],
    causes: [
      'အနံ့ပြင်းသော ဆပ်ပြာများ၊ ရေမွှေးဆနွင်းများ၊ မိန်းမကိုယ်အတွင်းသို့ ရေထိုးဆေးခြင်း (Douching)',
      'ပိုးသတ်ဆေး (Antibiotics) အလွန်အကျွံ သောက်သုံးမှုကြောင့် အကျိုးပြု ဘက်တီးရီးယားများ သေဆုံးခြင်း',
      'ကြပ်လွန်းသော နိုင်လွန်အတွင်းခံများ ဝတ်ဆင်ခြင်းကြောင့် စိုထိုင်းပူအိုက်ခြင်း',
      'ရာသီလာစဉ် လစဉ်သုံးပစ္စည်းကို ၄ နာရီထက် ပိုမိုကြာမြင့်စွာ မလဲလှယ်ဘဲ ထားခြင်း'
    ],
    preventionAndCare: [
      'ရေဆေးလျှင် သန့်ရှင်းသော ရိုးရိုးရေနွေးနွေးဖြင့်သာ အပြင်ဘက်ကို ဆေးကြောပါ (အတွင်းသို့ မဆေးပါနှင့်)',
      'ဝမ်းသွားပြီးတိုင်း ရှေ့မှ နောက်သို့သာ သုတ်ပါ (စအိုမှ ပိုးများ မိန်းမကိုယ်သို့ မကူးစက်စေရန်)',
      '၁၀၀% ချည်သား (Cotton) အတွင်းခံများကိုသာ ဝတ်ဆင်ပါ',
      'ဒိန်ချဉ် (Yogurt) ကဲ့သို့သော အကျိုးပြု ပရိုဘိုင်အိုတစ် (Probiotics) များ စားသုံးပေးပါ',
      'ရာသီလာစဉ် လစဉ်သုံးပစ္စည်း (Pad/Tampon) ကို ၄ နာရီမှ ၆ နာရီတစ်ကြိမ် ပုံမှန် လဲလှယ်ပါ'
    ],
    warningSigns: [
      'မိန်းမကိုယ်မှ အနံ့ဆိုးလွန်ကဲသော အစိမ်းရောင် အညိုရောင် ပြည်ဆင်းခြင်း',
      'ဝမ်းဗိုက်အောက်ပိုင်း ပြင်းထန်စွာ နာကျင်ပြီး ဖျားခြင်း',
      'မိန်းမကိုယ်တစ်ဝိုက် အရည်ကြည်ဖုများ သို့မဟုတ် အနာများ ဖြစ်ပေါ်လာခြင်း'
    ],
    medicalAdvice: 'အဖြူဆင်းတိုင်း ပိုးသတ်ဆေးကို မိမိသဘောဖြင့် မသောက်ပါနှင့်။ မှိုပိုး (Fungal) သို့မဟုတ် ဘက်တီးရီးယား (Bacterial) သို့မဟုတ် Trichomoniasis ဖြစ်သည်ကို ဆရာဝန်ထံ စစ်ဆေး၍ မှန်ကန်သော ဆေးဝါးကိုသာ အသုံးပြုပါ။'
  }
];

export const WomensHealthModule: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState<HealthTopic>(WOMENS_TOPICS[0]);

  // Interactive Period & Ovulation Calculator State
  const [lastPeriodDate, setLastPeriodDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return d.toISOString().split('T')[0];
  });
  const [cycleLength, setCycleLength] = useState<number>(28);
  const [periodDuration, setPeriodDuration] = useState<number>(5);

  // Self-Assessment Checklist State
  const [assessmentAnswers, setAssessmentAnswers] = useState<{ [key: string]: boolean }>({});

  const filteredTopics = WOMENS_TOPICS.filter(topic => {
    const matchCategory = selectedCategory === 'all' || topic.category === selectedCategory;
    const matchQuery = topic.titleMm.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       topic.subtitleMm.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       topic.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchQuery;
  });

  // Calculate Ovulation & Next Period
  const calculateCycleInfo = () => {
    if (!lastPeriodDate) return null;
    const lmp = new Date(lastPeriodDate);
    if (isNaN(lmp.getTime())) return null;

    // Next Period Date
    const nextPeriod = new Date(lmp);
    nextPeriod.setDate(nextPeriod.getDate() + cycleLength);

    // Ovulation Date (typically 14 days before next period)
    const ovulationDate = new Date(nextPeriod);
    ovulationDate.setDate(ovulationDate.getDate() - 14);

    // Fertile Window (5 days before ovulation + ovulation day + 1 day after)
    const fertileStart = new Date(ovulationDate);
    fertileStart.setDate(fertileStart.getDate() - 5);

    const fertileEnd = new Date(ovulationDate);
    fertileEnd.setDate(fertileEnd.getDate() + 1);

    return {
      nextPeriod: nextPeriod.toLocaleDateString('my-MM', { year: 'numeric', month: 'long', day: 'numeric' }),
      ovulationDate: ovulationDate.toLocaleDateString('my-MM', { year: 'numeric', month: 'long', day: 'numeric' }),
      fertileWindow: `${fertileStart.toLocaleDateString('my-MM', { month: 'short', day: 'numeric' })} မှ ${fertileEnd.toLocaleDateString('my-MM', { month: 'short', day: 'numeric' })} ထိ`,
      daysUntilNextPeriod: Math.ceil((nextPeriod.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    };
  };

  const cycleResults = calculateCycleInfo();

  const assessmentQuestions = [
    { id: 'q1', text: 'လွန်ခဲ့သော ၃ လအတွင်း ရာသီလာရက် ပုံမှန်မဟုတ်ဘဲ အလွန်စောခြင်း သို့မဟုတ် နောက်ကျခြင်း ရှိပါသလား။' },
    { id: 'q2', text: 'ရာသီလာစဉ် အလုပ်မလုပ်နိုင်လောက်အောင် ဝမ်းဗိုက်နှင့် ခါး ပြင်းထန်စွာ ကိုက်ခဲလေ့ ရှိပါသလား။' },
    { id: 'q3', text: 'လစဉ်သုံးပစ္စည်း (Pad) ကို ၁ နာရီ သို့မဟုတ် ၂ နာရီတစ်ကြိမ် မကြာခဏ ပြည့်လျှံ၍ လဲလှယ်နေရပါသလား။' },
    { id: 'q4', text: 'မိန်းမကိုယ်မှ အနံ့ဆိုးထွက်ခြင်း၊ ယားယံခြင်း သို့မဟုတ် ပုံမှန်မဟုတ်သော အဖြူဆင်းခြင်း ရှိပါသလား။' },
    { id: 'q5', text: 'ရင်သား သို့မဟုတ် ချိုင်းအောက်တွင် အဖုအကျိတ် စမ်းမိခြင်း သို့မဟုတ် နို့သီးခေါင်းမှ အရည်ထွက်ခြင်း ရှိပါသလား။' },
    { id: 'q6', text: 'မျက်နှာ/မေးစေ့တွင် အမွေးကြမ်းများ ပေါက်ခြင်း သို့မဟုတ် ဆံပင်ထိပ်ပိုင်း သိသာစွာ ကျွတ်ပါသလား။' }
  ];

  const handleToggleAnswer = (id: string) => {
    setAssessmentAnswers(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const positiveAnswersCount = Object.values(assessmentAnswers).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 rounded-2xl p-5 sm:p-7 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-xl">🌸</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 tracking-wide uppercase">
                Women's Health & Gynecology
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              အမျိုးသမီး ကျန်းမာရေးနှင့် ရောဂါများ လမ်းညွှန်
            </h1>
            <p className="text-xs sm:text-sm text-rose-100 max-w-2xl leading-relaxed">
              ရာသီစက်ဝန်း၊ သားဥအိမ်ရေအိတ် (PCOS)၊ သားအိမ်အသားလုံး၊ သားအိမ်ခေါင်းနှင့် ရင်သားကင်ဆာ ကြိုတင်စစ်ဆေးမှု၊ သွေးဆုံးကိုင်ခြင်းနှင့် မိန်းမကိုယ် ကျန်းမာရေးဆိုင်ရာ ပြည့်စုံသော ဆေးပညာ လမ်းညွှန်ချက်များ။
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs border border-white/20 shrink-0">
            <Activity className="w-4 h-4 text-rose-200" />
            <span>အမျိုးသမီးများအတွက် သီးသန့်</span>
          </div>
        </div>
      </div>

      {/* Interactive Tool 1: Period & Ovulation Calculator */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-800">
                🩸 ရာသီစက်ဝန်းနှင့် သားဥကြွေရက် တွက်ချက်ခြင်း (Period & Ovulation Calculator)
              </h2>
              <p className="text-xs text-slate-500">နောက်တစ်ကြိမ် ရာသီလာမည့်ရက်နှင့် ကိုယ်ဝန်ရနိုင်ခြေ အမြင့်ဆုံးရက်များကို ခန့်မှန်းတွက်ချက်ပါ</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">နောက်ဆုံး ရာသီစတင်လာခဲ့သည့်ရက် (LMP)</label>
            <input 
              type="date" 
              value={lastPeriodDate}
              onChange={(e) => setLastPeriodDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">ရာသီစက်ဝန်း ကြာမြင့်ချိန် (ရက်ပေါင်း)</label>
            <select 
              value={cycleLength}
              onChange={(e) => setCycleLength(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            >
              {[21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35].map(days => (
                <option key={days} value={days}>{days} ရက် (ပုံမှန်ပျမ်းမျှ: ၂၈ ရက်)</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">ရာသီသွေး ဆင်းသည့်ရက်</label>
            <select 
              value={periodDuration}
              onChange={(e) => setPeriodDuration(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            >
              {[3, 4, 5, 6, 7].map(days => (
                <option key={days} value={days}>{days} ရက်ကြာဆင်းသည်</option>
              ))}
            </select>
          </div>
        </div>

        {cycleResults && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gradient-to-br from-rose-50/70 via-pink-50/50 to-amber-50/40 p-4 rounded-xl border border-rose-100">
            <div className="bg-white p-3.5 rounded-xl border border-rose-100 shadow-2xs">
              <span className="text-[11px] font-bold text-rose-600 block mb-1">နောက်တစ်ကြိမ် ရာသီလာမည့်ရက်</span>
              <p className="text-sm font-bold text-slate-800">{cycleResults.nextPeriod}</p>
              <span className="text-[10px] text-slate-500">
                {cycleResults.daysUntilNextPeriod > 0 
                  ? `(နောက်ထပ် ${cycleResults.daysUntilNextPeriod} ရက်အလို)` 
                  : `(ရက်စေ့ရောက်ရှိနေပါသည်)`}
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-pink-100 shadow-2xs">
              <span className="text-[11px] font-bold text-pink-600 block mb-1">ခန့်မှန်း သားဥကြွေမည့်ရက်</span>
              <p className="text-sm font-bold text-slate-800">{cycleResults.ovulationDate}</p>
              <span className="text-[10px] text-slate-500">သားဥကြွေချိန်တွင် သန္ဓေတည်နိုင်ခြေ အမြင့်ဆုံးဖြစ်သည်</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-amber-100 shadow-2xs">
              <span className="text-[11px] font-bold text-amber-700 block mb-1">ကိုယ်ဝန်ရနိုင်ခြေ မြင့်မားသောကာလ</span>
              <p className="text-xs font-bold text-slate-800">{cycleResults.fertileWindow}</p>
              <span className="text-[10px] text-slate-500">Fertile Window (ကလေးယူရန် သို့မဟုတ် သန္ဓေတားရန်)</span>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Tool 2: Self-Check Symptom Screener */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-pink-50 text-pink-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-800">
                🩺 အမျိုးသမီး ကျန်းမာရေး လက္ခဏာများ မိမိကိုယ်တိုင် စစ်ဆေးခြင်း
              </h2>
              <p className="text-xs text-slate-500">မိမိတွင် အောက်ပါ လက္ခဏာများ ရှိပါက အမှန်ခြစ်၍ ဆရာဝန်နှင့် ပြသရန် လို/မလို စစ်ဆေးပါ</p>
            </div>
          </div>
          {positiveAnswersCount > 0 && (
            <button 
              onClick={() => setAssessmentAnswers({})}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> အသစ်ပြန်စစ်မည်
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {assessmentQuestions.map((q) => {
            const isChecked = !!assessmentAnswers[q.id];
            return (
              <label 
                key={q.id}
                onClick={() => handleToggleAnswer(q.id)}
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  isChecked 
                    ? 'bg-rose-50/80 border-rose-300 text-rose-950 font-medium shadow-2xs' 
                    : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100/60'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={isChecked}
                  onChange={() => {}}
                  className="mt-0.5 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 accent-rose-600 cursor-pointer"
                />
                <span className="text-xs leading-relaxed">{q.text}</span>
              </label>
            );
          })}
        </div>

        {/* Screening Feedback Box */}
        {positiveAnswersCount > 0 ? (
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            positiveAnswersCount >= 3 
              ? 'bg-red-50 border-red-200 text-red-900' 
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${positiveAnswersCount >= 3 ? 'text-red-600' : 'text-amber-600'}`} />
            <div className="space-y-1 text-xs leading-relaxed">
              <p className="font-bold">
                {positiveAnswersCount >= 3 
                  ? `⚠️ သတိပြုဖွယ် လက္ခဏာ (${positiveAnswersCount}) ချက် စစ်ဆေးတွေ့ရှိရပါသည်။`
                  : `ℹ️ သတိပြုရန် လက္ခဏာ (${positiveAnswersCount}) ချက် ရှိနေပါသည်။`}
              </p>
              <p>
                {positiveAnswersCount >= 3 
                  ? 'အထက်ပါ လက္ခဏာများသည် သားအိမ်အသားလုံး၊ PCOS၊ သားအိမ်အတွင်းသားနေရာလွဲရောဂါ သို့မဟုတ် ပိုးဝင်ခြင်းတို့၏ လက္ခဏာဖြစ်နိုင်သဖြင့် သားဖွားမီးယပ် အထူးကုဆရာဝန်နှင့် အာထရာဆောင်း (Ultrasound) ရိုက်၍ သေချာစွာ စစ်ဆေးကုသမှု ခံယူသင့်ပါသည်။'
                  : 'လက္ခဏာများကို စောင့်ကြည့်ပြီး သက်သာမှုမရှိဘဲ ဆက်လက်ဖြစ်ပေါ်နေပါက ဆရာဝန်ထံ ပြသတိုင်ပင်ဆွေးနွေးပါ။'}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>လက်ရှိတွင် မီးယပ်ဆိုင်ရာ သတိပြုဖွယ် လက္ခဏာများ မတွေ့ရှိရသေးပါ။ ပုံမှန် တစ်ကိုယ်ရေသန့်ရှင်းရေးနှင့် နှစ်စဉ် ကျန်းမာရေး စစ်ဆေးမှုများ ပြုလုပ်ပါ။</span>
          </div>
        )}
      </div>

      {/* Main Knowledge Hub & Topics */}
      <div className="space-y-4">
        {/* Search & Filter Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'all', label: 'အားလုံး' },
              { id: 'gynecology', label: '🌸 သားအိမ်/သားဥအိမ်' },
              { id: 'cancer_screening', label: '🛡️ ကင်ဆာကြိုတင်စစ်ဆေးမှု' },
              { id: 'menopause', label: '🍂 သွေးဆုံးကိုင်ခြင်း' },
              { id: 'hygiene', label: '✨ မိန်းမကိုယ်သန့်ရှင်းရေး' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input 
              type="text"
              placeholder="ရောဂါခေါင်းစဉ် ရှာဖွေရန်..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* 2-Column Knowledge View: Topic Selector & Detailed View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Topics List (4 Cols) */}
          <div className="lg:col-span-4 space-y-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              ဆောင်းပါး ခေါင်းစဉ်များ ({filteredTopics.length})
            </span>
            <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
              {filteredTopics.map((topic) => {
                const isSelected = activeTopic.id === topic.id;
                return (
                  <button
                    key={topic.id}
                    onClick={() => setActiveTopic(topic)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-rose-50 border-rose-400 shadow-xs ring-1 ring-rose-400'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl p-1.5 bg-white rounded-xl shadow-2xs shrink-0 border border-slate-100">
                      {topic.icon}
                    </span>
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${topic.tagColor}`}>
                          {topic.category === 'gynecology' ? 'မီးယပ်ရောဂါ' :
                           topic.category === 'cancer_screening' ? 'ကင်ဆာစစ်ဆေးမှု' :
                           topic.category === 'menopause' ? 'သွေးဆုံးချိန်' : 'သန့်ရှင်းရေး'}
                        </span>
                        <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-rose-600' : 'text-slate-300'}`} />
                      </div>
                      <h3 className={`text-xs font-bold truncate ${isSelected ? 'text-rose-900' : 'text-slate-800'}`}>
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

          {/* Right Column: Detailed Topic View (8 Cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-6">
            {/* Header of Active Topic */}
            <div className="border-b border-slate-100 pb-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{activeTopic.icon}</span>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    {activeTopic.titleMm}
                  </h2>
                  <p className="text-xs text-rose-600 font-semibold">{activeTopic.subtitleMm}</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                {activeTopic.summary}
              </p>
            </div>

            {/* Symptoms & Causes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Symptoms */}
              <div className="bg-rose-50/50 rounded-xl p-4 border border-rose-100 space-y-2.5">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>အဖြစ်များသော လက္ခဏာများ</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {activeTopic.symptoms.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-500 font-bold mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Causes */}
              <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-100 space-y-2.5">
                <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
                  <Info className="w-4 h-4 text-purple-600" />
                  <span>ဖြစ်ပွားရသော အကြောင်းရင်းများ</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {activeTopic.causes.map((c, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-purple-500 font-bold mt-0.5">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Prevention & Daily Care */}
            <div className="space-y-3 bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>ကာကွယ်ရန်နှင့် နေထိုင်စားသောက်မှု လမ်းညွှန်ချက်များ</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                {activeTopic.preventionAndCare.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Warning Red Flags */}
            <div className="space-y-2.5 bg-red-50 rounded-xl p-4 border border-red-200">
              <div className="flex items-center gap-2 text-red-900 font-bold text-xs">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>⚠️ အရေးပေါ် သတိပြုရမည့် အန္တရာယ်လက္ခဏာများ (Red Flags)</span>
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

            {/* Medical Advice Footer */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-3">
              <BookOpen className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-slate-700">
                <span className="font-bold text-teal-900">ဆရာဝန်၏ ဆေးပညာဆိုင်ရာ အကြံပြုချက်:</span>
                <p className="leading-relaxed">{activeTopic.medicalAdvice}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
