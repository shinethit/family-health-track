import React, { useState } from 'react';
import { 
  Baby, 
  Heart, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Utensils, 
  Thermometer, 
  Droplets, 
  Clock, 
  Info,
  Smile,
  Moon,
  Search,
  ChevronRight
} from 'lucide-react';

interface ChildCareTopic {
  id: string;
  titleMm: string;
  subtitleMm: string;
  category: 'newborn' | 'feeding' | 'illness' | 'safety';
  icon: string;
  summary: string;
  keyPractices: string[];
  mistakesToAvoid: string[];
  warningSigns: string[];
  doctorGuidance: string;
}

const CHILD_CARE_TOPICS: ChildCareTopic[] = [
  {
    id: 'newborn_cord_care',
    titleMm: 'မွေးကင်းစ ချက်ကြိုး သန့်ရှင်းရေးနှင့် ပြုစုမှု',
    subtitleMm: 'ချက်ကြိုး သဘာဝအတိုင်း ခြောက်သွေ့ကြွေကျစေရန် နည်းလမ်းမှန် စောင့်ရှောက်ခြင်း',
    category: 'newborn',
    icon: '👶',
    summary: 'မွေးကင်းစကလေး၏ ချက်ကြိုးသည် မွေးဖွားပြီး ၇ ရက်မှ ၁၄ ရက်အတွင်း သဘာဝအတိုင်း ခြောက်သွေ့၍ ကြွေကျလေ့ရှိပါသည်။ ချက်ကြိုးကို ခြောက်သွေ့သန့်ရှင်းစွာ ထားရှိခြင်းသည် အသက်အန္တရာယ်ဖြစ်စေသော ပိုးဝင်ခြင်းကို ကာကွယ်ပေးပါသည်။',
    keyPractices: [
      'ချက်ကြိုးကို မကိုင်တွယ်မီ မိဘ/ပြုစုသူသည် လက်ကို ဆပ်ပြာနှင့် ရေဖြင့် စင်ကြယ်စွာ ဆေးကြောပါ',
      'ချက်ကြိုးကို ခြောက်သွေ့သန့်ရှင်းစွာ (Clean & Dry) သာ ထားပါ',
      'သေးခံ (Diaper) ဝတ်ပေးသည့်အခါ ချက်ကြိုးကို မဖုံးအုပ်ဘဲ အောက်သို့ ခေါက်ထားပါ (လေဝင်လေထွက်ကောင်းစေရန်)',
      'ချက်ကြိုးပေါ် ဆီး/ဝမ်း ပေကျံပါက သန့်ရှင်းသော ရေသန့်ဖြင့် ဆေးကြောပြီး သန့်ရှင်းသော ဂွမ်းစဖြင့် ညင်သာစွာ ခြောက်အောင် သုတ်ပါ',
      'ချက်ကြိုးသည် သဘာဝအတိုင်း ကြွေကျသည်အထိ စောင့်ပါ (အတင်းဆွဲမဖြုတ်ပါနှင့်)'
    ],
    mistakesToAvoid: [
      'ချက်ကြိုးပေါ်သို့ သနပ်ခါး၊ ဘာမီတွန်၊ ပေါင်ဒါမှုန့်၊ ဆီ သို့မဟုတ် အခြားဆေးများ လုံးဝမလိမ်းပါနှင့်',
      'အရက်ပျံ (Alcohol) သို့မဟုတ် ပိုးသတ်ရည်များကို ဆရာဝန်ညွှန်ကြားချက်မပါဘဲ အလွန်အကျွံ မသုတ်ပါနှင့် (ချက်ကြိုးခြောက်ခြင်းကို နှောင့်နှေးစေနိုင်သည်)',
      'ချက်ကြိုး မကြွေမချင်း ရေကန်ထဲ ကလေးကို နှစ်ချိုးခြင်း မပြုလုပ်ပါနှင့်'
    ],
    warningSigns: [
      'ချက်ကြိုးတစ်ဝိုက် နီမြန်းရောင်ရမ်းလာခြင်း သို့မဟုတ် ဖောင်းကြွလာခြင်း',
      'ချက်ကြိုးမှ အနံ့ဆိုးသော အဝါရောင်/အစိမ်းရောင် ပြည် သို့မဟုတ် အရည်များ စိမ့်ထွက်လာခြင်း',
      'ချက်ကြိုးကို ထိတွေ့ရုံဖြင့် ကလေးက ပြင်းထန်စွာ ငိုယိုနာကျင်ခြင်း',
      'ကလေး ကိုယ်ပူဖျားခြင်း သို့မဟုတ် နို့မစို့တော့ဘဲ မှိန်းနေခြင်း'
    ],
    doctorGuidance: 'ချက်ပိုးဝင်ခြင်း (Omphalitis) သည် မွေးကင်းစကလေးများတွင် သွေးဆိပ်တက်ခြင်းအထိ အန္တရာယ်ဖြစ်နိုင်သဖြင့် နီရဲပြည်ထွက်ပါက ဆေးရုံ/ဆေးခန်းသို့ အမြန်ဆုံး သွားရောက်ပြသပါ။'
  },
  {
    id: 'neonatal_jaundice',
    titleMm: 'မွေးကင်းစ အသားဝါခြင်း (Neonatal Jaundice)',
    subtitleMm: 'သဘာဝအသားဝါခြင်းနှင့် ရောဂါကြောင့် အသားဝါခြင်း ခွဲခြားသိရှိခြင်း',
    category: 'newborn',
    icon: '🟡',
    summary: 'မွေးကင်းစကလေး ၆၀% ခန့်တွင် သွေးတွင်း Bilirubin ဓာတ်များခြင်းကြောင့် မျက်လုံးနှင့် အသားများ ဝါတတ်ပါသည်။ အများစုမှာ သဘာဝအသားဝါခြင်းဖြစ်သော်လည်း ပြင်းထန်ပါက ဦးနှောက်ကို ထိခိုက်စေနိုင်ပါသည်။',
    keyPractices: [
      'ကလေးကို နေ့ရောညပါ ၂ နာရီမှ ၃ နာရီတစ်ကြိမ် မကြာခဏ မိခင်နို့ ဝဝလင်လင် တိုက်ကျွေးပါ (ဝမ်းနှင့် ဆီးမှတစ်ဆင့် Bilirubin များ စွန့်ထုတ်စေရန်)',
      'သဘာဝ နေရောင်ခြည် (မနက် ၇ နာရီမတိုင်မီ နူးညံ့သော နေရောင်) အနည်းငယ် ခံပေးနိုင်သော်လည်း နေလောင်ခြင်းနှင့် အအေးမိခြင်း သတိပြုပါ',
      'ကလေး၏ ရင်ဘတ်၊ ဝမ်းဗိုက်၊ လက်နှင့် ခြေထောက်တို့တွင် အသားဝါမှု အဆင့်ကို နေ့စဉ် သဘာဝအလင်းရောင်အောက်တွင် စစ်ဆေးပါ'
    ],
    mistakesToAvoid: [
      'အသားဝါသည်ဟုဆိုကာ ရေနွေး၊ ဂလူးကို့စ်ရည် သို့မဟုတ် အချိုရည်များ တိုက်ကျွေးခြင်း လုံးဝမပြုလုပ်ပါနှင့် (မိခင်နို့သာ အကောင်းဆုံးဖြစ်သည်)',
      'နေပူပြင်းသော နေ့လယ်နေရောင်အောက်တွင် ကလေးကို လုံးဝမထားပါနှင့်'
    ],
    warningSigns: [
      'မွေးဖွားပြီး ၂၄ နာရီအတွင်း ရုတ်တရက် အသားဝါလာခြင်း (Pathological Jaundice)',
      'အသားဝါခြင်းသည် ဗိုက်မှသည် ပေါင်၊ ခြေဖဝါး၊ လက်ဖဝါးအထိ ဆင်းလာခြင်း',
      'ကလေး နို့လုံးဝမစို့ခြင်း၊ ခန္ဓာကိုယ်ပျော့ခွေနေခြင်း သို့မဟုတ် အလွန်အမင်း တောင့်တင်းငိုယိုခြင်း',
      'ဝမ်းအရောင် ဖြူဖျော့ဖျော့ (Clay-colored stool) ဖြစ်နေခြင်း'
    ],
    doctorGuidance: 'Bilirubin ပမာဏ အလွန်မြင့်မားပါက ဆေးရုံတွင် အပြာရောင် အလင်းပေးကုထုံး (Phototherapy) ဖြင့် အချိန်မီ ကုသမှု ခံယူရပါမည်။'
  },
  {
    id: 'breastfeeding_weaning',
    titleMm: 'မိခင်နို့တိုက်ကျွေးခြင်းနှင့် ဖြည့်စွက်စာ အဆင့်ဆင့် ကျွေးနည်း',
    subtitleMm: 'မွေးစမှ ၆ လအထိ မိခင်နို့ သီးသန့်တိုက်ကျွေးခြင်းနှင့် ၆ လနောက်ပိုင်း အာဟာရ',
    category: 'feeding',
    icon: '🍼',
    summary: 'မွေးစမှ ၆ လအထိ ကလေးအတွက် မိခင်နို့တစ်မျိုးတည်းသာ လုံလောက်ပြီး ရေပင် တိုက်ရန် မလိုပါ။ ၆ လပြည့်ပါက မိခင်နို့အပြင် အာဟာရပြည့်ဝသော ဖြည့်စွက်စာများကို အဆင့်ဆင့် စတင်ကျွေးမွေးရပါမည်။',
    keyPractices: [
      'မွေးဖွားပြီး ပထမ ၁ နာရီအတွင်း မိခင်နို့ဦးရည် (Colostrum) ကို မဖြစ်မနေ စတင်တိုက်ကျွေးပါ (သဘာဝ ကာကွယ်ဆေးဖြစ်သည်)',
      'ကလေး နို့စို့သည့်အခါ ပါးစပ်ကျယ်ကျယ်ဟပြီး နို့သီးခေါင်းအမည်းကွင်းတစ်ခုလုံး ပါးစပ်ထဲရောက်အောင် မှန်ကန်စွာ စို့စေပါ (Good Latch)',
      '၆ လပြည့်လျှင် ဆန်ပြုတ်ပျစ်ပျစ် + ကြက်ဥအနှစ် + အသီးအရွက်ပြုတ်ထောင်း + ဆီ လက်ဖက်ရည်ဇွန်းတစ်ဝက် ထည့်သွင်းကျွေးပါ',
      'အစာအသစ်တစ်ခု စတင်ကျွေးတိုင်း ၃ ရက်ခန့် စောင့်ကြည့်ပါ (ဓာတ်မတည့်မှု ရှိ/မရှိ သိရှိရန်)'
    ],
    mistakesToAvoid: [
      'အသက် ၁ နှစ်မတိုင်မီ ကလေးကို ပျားရည် လုံးဝမကျွေးပါနှင့် (Botulism ပိုးဆိပ်သင့်နိုင်သည်)',
      'အသက် ၁ နှစ်မတိုင်မီ ကလေးအစားအစာထဲသို့ ဆား၊ သကြား၊ အချိုမှုန့် လုံးဝမထည့်ပါနှင့်',
      'နို့ဘူးတိုက်ရာတွင် နို့ဘူးစို့လျက် ကလေးကို အိပ်ပျော်စေခြင်း မပြုပါနှင့် (သွားပိုးစားခြင်းနှင့် နားပိုးဝင်ခြင်း ဖြစ်စေသည်)'
    ],
    warningSigns: [
      'ကလေး ကိုယ်အလေးချိန် ပုံမှန် မတက်လာခြင်း',
      'တစ်နေ့လျှင် သေးခံ (Diaper) ၆ ကြိမ်ထက် နည်းပါးစွာသာ စိုစွတ်ခြင်း (နို့မလုံလောက်သော လက္ခဏာ)',
      'အစားအသစ်စားပြီးနောက် နှုတ်ခမ်းဖူးရောင်ခြင်း၊ အင်ပြင်ထွက်ခြင်း သို့မဟုတ် အသက်ရှူကျပ်ခြင်း'
    ],
    doctorGuidance: 'မိခင်နို့ကို အနည်းဆုံး အသက် ၂ နှစ်အထိ ဖြည့်စွက်စာများနှင့် တွဲဖက်၍ ဆက်လက်တိုက်ကျွေးသင့်ပါသည်။'
  },
  {
    id: 'child_fever_care',
    titleMm: 'ကလေး ဖျားနာခြင်းနှင့် အဖျားကျအောင် ပြုစုနည်း',
    subtitleMm: 'ပါရာစီတမော အချိုးကျတိုက်နည်း၊ ရေပတ်တိုက်နည်းနှင့် တက်ခြင်း ကာကွယ်ခြင်း',
    category: 'illness',
    icon: '🌡️',
    summary: 'ကလေးများတွင် အဖျား (၁၀၀.၄°F / ၃၈°C နှင့်အထက်) ရှိပါက မှန်ကန်သော ရေပတ်တိုက်နည်းနှင့် ဆေးပမာဏဖြင့် အဖျားချပေးရန် လိုအပ်ပါသည်။ အထူးသဖြင့် အသက် ၆ လမှ ၅ နှစ်အတွင်း အဖျားကြီးလျှင် တက်တတ်ပါသည် (Febrile Convulsion)။',
    keyPractices: [
      'သာမိုမီတာ (Thermometer) ဖြင့် အဖျားကို စနစ်တကျ တိုင်းတာပါ',
      'ရေခဲရေ မသုံးဘဲ ရိုးရိုးရေကြက်သီးနွေးဖြင့် နဖူး၊ လည်ပင်း၊ ချိုင်း၊ ပေါင်ခြံတို့ကို ညင်သာစွာ ရေပတ်တိုက်ပေးပါ',
      'ပါရာစီတမော (Paracetamol Syrup) ကို ကလေး၏ ကိုယ်အလေးချိန်အလိုက် (10-15 mg/kg) ၄ နာရီမှ ၆ နာရီတစ်ကြိမ်သာ တိုက်ပါ',
      'ပါးလွှာပေါ့ပါးသော ချည်သားအဝတ်အစား ဝတ်ဆင်ပေးပြီး အခန်းတွင်း လေဝင်လေထွက် ကောင်းအောင် ထားပါ',
      'နို့ရည်နှင့် ရေသန့် မကြာခဏ တိုက်ပေးပါ'
    ],
    mistakesToAvoid: [
      'အဖျားတက်နေသော ကလေးကို စောင်ထူထူခြုံပေးခြင်း သို့မဟုတ် အဝတ်အစားထူထူ ဝတ်ပေးခြင်း လုံးဝမလုပ်ပါနှင့်',
      'ကလေးများအား အက်စပရင် (Aspirin) ဆေးလုံးဝမတိုက်ပါနှင့် (Reye’s syndrome ဦးနှောက်နှင့် အသည်းထိခိုက်စေနိုင်သည်)',
      'အရက်ပျံ (Alcohol) ဖြင့် ရေပတ်တိုက်ခြင်း လုံးဝမပြုလုပ်ပါနှင့်'
    ],
    warningSigns: [
      'အသက် ၃ လအောက် ကလေးငယ် အဖျားရှိခြင်း (မဖြစ်မနေ ဆေးရုံပြရမည်)',
      'ကလေး မျက်ဖြူလန် တက်ခြင်း သို့မဟုတ် သတိလစ်သွားခြင်း',
      'ကလေး အသက်ရှူ အလွန်မြန်ခြင်း၊ ရင်ဘတ်ချိုင့်ဝင်ခြင်း၊ အသက်ရှူတိုင်း တရွှီရွှီမြည်ခြင်း',
      'ခေါ်မရဘဲ အလွန်အမင်း မှိန်းနေခြင်း သို့မဟုတ် ချော့မရအောင် အဆက်မပြတ် ငိုယိုခြင်း'
    ],
    doctorGuidance: 'ဖျားပြီး ၃ ရက်ထက် ကျော်လွန်ပါက သွေးလွန်တုပ်ကွေး၊ အဆုတ်ရောင် သို့မဟုတ် အခြားရောဂါပိုး ရှိ/မရှိ စစ်ဆေးရန် ကလေးဆရာဝန်နှင့် အမြန်ဆုံး ပြသပါ။'
  },
  {
    id: 'diarrhea_ors_care',
    titleMm: 'ကလေး ဝမ်းလျှောခြင်းနှင့် ဓာတ်ဆားရည် (ORS) တိုက်ကျွေးနည်း',
    subtitleMm: 'ရေဓာတ်ခမ်းခြောက်မှု ကာကွယ်ခြင်းနှင့် ဇင့် (Zinc) သောက်ဆေး၏ အခန်းကဏ္ဍ',
    category: 'illness',
    icon: '💧',
    summary: 'ကလေးများတွင် ဝမ်းလျှောခြင်းကြောင့် အသက်အန္တရာယ်ဖြစ်စေသော အဓိကအကြောင်းရင်းမှာ ရေဓာတ်နှင့် ဆားဓာတ် ခမ်းခြောက်ခြင်းဖြစ်ပါသည်။ ဓာတ်ဆားရည်ကို စနစ်တကျ ဖျော်စပ်တိုက်ကျွေးခြင်းဖြင့် အသက်ဘေးမှ ကာကွယ်နိုင်ပါသည်။',
    keyPractices: [
      'ဓာတ်ဆားထုပ် (ORS) ညွှန်ကြားချက်ပါ ရေပမာဏ (ပုံမှန်အားဖြင့် ရေသန့် ၁ လီတာ သို့မဟုတ် ညွှန်ကြားထားသော ပမာဏအတိအကျ) ဖြင့်သာ ရောစပ်ပါ',
      'ကလေး ဝမ်းသွားပြီးတိုင်း ORS ဓာတ်ဆားရည်ကို ဇွန်းငယ်ဖြင့် တစ်ကြိမ်လျှင် နည်းနည်းချင်း မကြာခဏ တိုက်ပါ',
      'ဇင့် (Zinc) ဆေးပြားကို ဆရာဝန် ညွှန်ကြားချက်အတိုင်း ၁၀ ရက်မှ ၁၄ ရက် ဆက်တိုက် တိုက်ကျွေးပါ (အူလမ်းကြောင်း ပြန်လည်ကောင်းမွန်စေရန်)',
      'မိခင်နို့နှင့် ပျော့ပျောင်းသော အစာများကို ပုံမှန် ဆက်လက်ကျွေးပါ'
    ],
    mistakesToAvoid: [
      'ဓာတ်ဆားရည်ကို ရေအနည်းငယ်ဖြင့် ပျစ်ပျစ်ဖျော်တိုက်ခြင်း လုံးဝမပြုလုပ်ပါနှင့် (ဝမ်းပိုလျှောစေနိုင်သည်)',
      'ဆရာဝန် ညွှန်ကြားချက်မပါဘဲ ဝမ်းပိတ်ဆေး (Anti-motility drugs) လုံးဝမတိုက်ပါနှင့်',
      'အချိုရည်ဘူးများ သို့မဟုတ် ဂတ်စ်ပါသော အအေးများ မတိုက်ပါနှင့်'
    ],
    warningSigns: [
      'မျက်တွင်းချိုင့်ဝင်ခြင်း၊ ကလေးငယ်၏ ငယ်ထိပ်ချိုင့်ဝင်ခြင်း',
      'မျက်ရည်မထွက်တော့ခြင်း၊ လျှာနှင့် ပါးစပ် အလွန်ခြောက်သွေ့ခြင်း',
      '၆ နာရီကျော်သည်အထိ ဆီးလုံးဝ မသွားတော့ခြင်း',
      'ဝမ်းထဲတွင် သွေးစ သို့မဟုတ် ချွဲများ ပါလာခြင်း'
    ],
    doctorGuidance: 'ရေဓာတ်ပြင်းထန်စွာ ခမ်းခြောက်သော လက္ခဏာများ တွေ့ရှိပါက ဆေးရုံသို့ အရေးပေါ်ပို့ဆောင်၍ သွေးကြောသွင်း ဆေးရည် (IV drip) သွင်းကုသမှု ခံယူရပါမည်။'
  }
];

export const ChildCareModule: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTopic, setActiveTopic] = useState<ChildCareTopic>(CHILD_CARE_TOPICS[0]);

  // Interactive Weaning Food Guide State
  const [weaningAge, setWeaningAge] = useState<string>('6_8_months');

  // Pediatric Fever Triage State
  const [childAgeMonths, setChildAgeMonths] = useState<number>(12);
  const [feverTempF, setFeverTempF] = useState<number>(101);
  const [hasEmergencySymptoms, setHasEmergencySymptoms] = useState<{ [key: string]: boolean }>({});

  const filteredTopics = CHILD_CARE_TOPICS.filter(t => {
    const matchCat = selectedCategory === 'all' || t.category === selectedCategory;
    const matchQ = t.titleMm.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   t.subtitleMm.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   t.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQ;
  });

  const emergencySymptomList = [
    { id: 'lethargic', text: 'ကလေး ခေါ်မရဘဲ အလွန်အမင်း မှိန်းနေခြင်း / သတိမကောင်းခြင်း' },
    { id: 'breathing_fast', text: 'အသက်ရှူ အလွန်မြန်ခြင်း၊ ရင်ဘတ်ချိုင့်ဝင်ခြင်း' },
    { id: 'convulsion', text: 'တက်ခြင်း (နှုတ်ခမ်းပြာခြင်း၊ လက်ခြေတဆတ်ဆတ်တုန်ခြင်း)' },
    { id: 'rash', text: 'အရေပြားပေါ်တွင် သွေးစက်ကဲ့သို့ အနီစက်များ ထွက်လာခြင်း' },
    { id: 'vomiting_all', text: 'တိုက်သမျှ အစာနှင့် ရေ အကုန်ပြန်အန်ထွက်ခြင်း' }
  ];

  const countEmergencySymptoms = Object.values(hasEmergencySymptoms).filter(Boolean).length;

  const getFeverAssessment = () => {
    if (childAgeMonths < 3 && feverTempF >= 100.4) {
      return {
        level: 'critical',
        title: '🚨 အရေးပေါ် အဆင့် (အသက် ၃ လအောက် မွေးကင်းစဖျားခြင်း)',
        advice: 'အသက် ၃ လအောက် ကလေးငယ်များတွင် ဖျားနာခြင်းသည် အလွန်အန္တရာယ်ကြီးမားသဖြင့် အိမ်တွင်မစောင့်ဘဲ ကလေးဆေးရုံ/အထူးကုထံ ချက်ချင်း သွားရောက်ပြသပါ။'
      };
    }
    if (countEmergencySymptoms > 0 || feverTempF >= 104) {
      return {
        level: 'critical',
        title: '🚨 အရေးပေါ် ဆေးရုံပြသရန် လိုအပ်သည် (High Risk)',
        advice: 'အရေးပေါ် သတိပြုဖွယ် လက္ခဏာများ ရှိနေပါသဖြင့် ဆေးရုံအရေးပေါ်ဌာနသို့ အချိန်မဆိုင်းဘဲ သွားရောက်ပြသပါ။'
      };
    }
    if (feverTempF >= 102) {
      return {
        level: 'moderate',
        title: '⚠️ အလယ်အလတ် အဆင့် ဖျားနာမှု (Moderate Fever)',
        advice: 'ရေကြက်သီးနွေးဖြင့် ရေပတ်တိုက်ပေးပါ၊ ပါရာစီတမော ဆေးရည်ကို ကလေးကိုယ်အလေးချိန်အလိုက် တိုက်ကျွေးပါ၊ ရေနှင့် နို့ရည် များများတိုက်ပါ။ ၂၄ နာရီအတွင်း မသက်သာပါက ဆရာဝန်နှင့် ပြသပါ။'
      };
    }
    return {
      level: 'mild',
      title: '✅ အပျော့စား ကိုယ်ပူခြင်း (Mild Fever)',
      advice: 'ပါးလွှာသော အဝတ်အစား ဝတ်ဆင်ပေးပါ၊ အခန်းတွင်း လေဝင်လေထွက် ကောင်းအောင်ထားပါ၊ ရေဓာတ်ပြည့်ဝစွာ တိုက်ကျွေးပြီး အဖျားကို စောင့်ကြည့်တိုင်းတာပါ။'
    };
  };

  const feverAssessment = getFeverAssessment();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 rounded-2xl p-5 sm:p-7 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-xl">👶</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 tracking-wide uppercase">
                Child & Pediatric Care
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              ကလေးငယ် ပြုစုစောင့်ရှောက်ရေး လမ်းညွှန် (မွေးစမှ ၅ နှစ်)
            </h1>
            <p className="text-xs sm:text-sm text-sky-100 max-w-2xl leading-relaxed">
              မွေးကင်းစကလေး ပြုစုမှု၊ ချက်ကြိုးသန့်ရှင်းရေး၊ မိခင်နို့နှင့် ဖြည့်စွက်စာ အဆင့်ဆင့် ကျွေးနည်း၊ ဖျားနာခြင်း၊ ဝမ်းလျှောခြင်းနှင့် ကလေးအရေးပေါ် ရှေးဦးပြုစုမှု ဆေးပညာ လမ်းညွှန်များ။
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs border border-white/20 shrink-0">
            <Smile className="w-4 h-4 text-sky-200" />
            <span>သားသားမီးမီးတို့ ကျန်းမာဖွံ့ဖြိုးရေး</span>
          </div>
        </div>
      </div>

      {/* Interactive Tool 1: Pediatric Fever Assessment */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-800">
                🌡️ ကလေးဖျားနာမှု အဆင့်သတ်မှတ်ခြင်းနှင့် အရေးပေါ် အကဲဖြတ်ကိရိယာ
              </h2>
              <p className="text-xs text-slate-500">ကလေး၏ အသက်၊ အပူချိန်နှင့် တွဲဖက်လက္ခဏာများအပေါ် မူတည်၍ လိုက်နာရမည့် အဆင့်ကို စစ်ဆေးပါ</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">ကလေး အသက်အရွယ် (လ)</label>
            <select 
              value={childAgeMonths}
              onChange={(e) => setChildAgeMonths(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            >
              <option value={1}>၁ လအောက် (မွေးကင်းစ)</option>
              <option value={2}>၂ လအရွယ်</option>
              <option value={5}>၃ မှ ၆ လအရွယ်</option>
              <option value={10}>၆ မှ ၁၂ လအရွယ်</option>
              <option value={24}>၁ နှစ် မှ ၂ နှစ်အရွယ်</option>
              <option value={48}>၂ နှစ် မှ ၅ နှစ်အရွယ်</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">တိုင်းတာရရှိသော အဖျားအပူချိန် (°F)</label>
            <div className="flex items-center gap-2">
              <input 
                type="number"
                step="0.1"
                min="97"
                max="106"
                value={feverTempF}
                onChange={(e) => setFeverTempF(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
              <span className="text-xs font-bold text-slate-500 shrink-0">ဒီဂရီ ဖာရင်ဟိုက်</span>
            </div>
          </div>
        </div>

        {/* Emergency Symptom Checkboxes */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-700 block">
            ကလေးတွင် အောက်ပါ အရေးပေါ် လက္ခဏာများ တွဲဖက်ရှိနေပါသလား (ရှိပါက အမှန်ခြစ်ပါ) -
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {emergencySymptomList.map((s) => (
              <label 
                key={s.id}
                className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2 cursor-pointer text-xs"
              >
                <input 
                  type="checkbox"
                  checked={!!hasEmergencySymptoms[s.id]}
                  onChange={(e) => setHasEmergencySymptoms(prev => ({ ...prev, [s.id]: e.target.checked }))}
                  className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 accent-rose-600"
                />
                <span className="text-slate-800">{s.text}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Result Assessment Card */}
        <div className={`p-4 rounded-xl border space-y-1.5 ${
          feverAssessment.level === 'critical'
            ? 'bg-red-50 border-red-200 text-red-950'
            : feverAssessment.level === 'moderate'
              ? 'bg-amber-50 border-amber-200 text-amber-950'
              : 'bg-emerald-50 border-emerald-200 text-emerald-950'
        }`}>
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
            {feverAssessment.level === 'critical' ? (
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            <span>{feverAssessment.title}</span>
          </div>
          <p className="text-xs leading-relaxed">{feverAssessment.advice}</p>
        </div>
      </div>

      {/* Interactive Tool 2: Weaning & Feeding Guide by Age */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-800">
                🥣 အသက်အရွယ်အလိုက် ဖြည့်စွက်စာ ကျွေးမွေးမှု လမ်းညွှန် (Weaning Food Guide)
              </h2>
              <p className="text-xs text-slate-500">၆ လမှ စတင်၍ အသက်အလိုက် အစာအမျိုးအစား၊ ပမာဏနှင့် အကြိမ်ရေ</p>
            </div>
          </div>
        </div>

        {/* Age Selector Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: '0_6_months', label: 'မွေးစ မှ ၆ လ (မိခင်နို့သီးသန့်)' },
            { id: '6_8_months', label: '၆ လ မှ ၈ လ (စတင်ကျွေးချိန်)' },
            { id: '9_11_months', label: '၉ လ မှ ၁၁ လ (အတုံးသေးသေး)' },
            { id: '12_24_months', label: '၁ နှစ် မှ ၂ နှစ် (မိသားစုအစားအစာ)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setWeaningAge(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                weaningAge === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Feeding Details for Selected Age */}
        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-3 text-xs">
          {weaningAge === '0_6_months' && (
            <div className="space-y-2">
              <span className="font-bold text-emerald-950 block text-sm">🍼 မွေးစ မှ ၆ လ: မိခင်နို့တစ်မျိုးတည်း သီးသန့် (Exclusive Breastfeeding)</span>
              <p className="text-slate-700 leading-relaxed">
                မိခင်နို့ထဲတွင် ကလေးအတွက် လိုအပ်သော ရေဓာတ်၊ ပရိုတင်း၊ အဆီ၊ ဗီတာမင်နှင့် ရောဂါပိုးမွှားများကို တိုက်ထုတ်ပေးသော ပဋိပစ္စည်းများ (Antibodies) အပြည့်အဝ ပါဝင်ပါသည်။ ၆ လမပြည့်မီ ရေ၊ နို့မှုန့် သို့မဟုတ် မည်သည့် ဖြည့်စွက်စာမျှ တိုက်ကျွေးရန် မလိုပါ။
              </p>
            </div>
          )}

          {weaningAge === '6_8_months' && (
            <div className="space-y-2">
              <span className="font-bold text-emerald-950 block text-sm">🥣 ၆ လ မှ ၈ လ: အပျစ်ပြုတ်ထောင်း (Thick Purees & Mashed Foods)</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-lg border border-emerald-100">
                  <span className="font-bold text-slate-800 block mb-1">အကြိမ်ရေ:</span>
                  <span>တစ်နေ့လျှင် ၂ ကြိမ် မှ ၃ ကြိမ် + မိခင်နို့ မကြာခဏ</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-emerald-100">
                  <span className="font-bold text-slate-800 block mb-1">ပမာဏ:</span>
                  <span>တစ်ကြိမ်လျှင် ထမင်းစားဇွန်း ၂ ဇွန်း မှ ၃ ဇွန်း (စတင်ချိန်တွင်)</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-emerald-100">
                  <span className="font-bold text-slate-800 block mb-1">သင့်တော်သော အစားအစာ:</span>
                  <span>ဆန်ပြုတ်ပျစ်ပျစ်၊ ထောပတ်သီးထောင်း၊ မုန်လာဥနီပြုတ်၊ ကြက်ဥအနှစ်၊ ဆီလက်ဖက်ရည်ဇွန်းတစ်ဝက်</span>
                </div>
              </div>
            </div>
          )}

          {weaningAge === '9_11_months' && (
            <div className="space-y-2">
              <span className="font-bold text-emerald-950 block text-sm">🍲 ၉ လ မှ ၁၁ လ: နုပ်နုပ်စဉ်းထားသော အစာများ (Finely Chopped & Finger Foods)</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-lg border border-emerald-100">
                  <span className="font-bold text-slate-800 block mb-1">အကြိမ်ရေ:</span>
                  <span>တစ်နေ့ ၃ ကြိမ် မှ ၄ ကြိမ် + အဆာပြေ ၁ ကြိမ် မှ ၂ ကြိမ်</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-emerald-100">
                  <span className="font-bold text-slate-800 block mb-1">ပမာဏ:</span>
                  <span>တစ်ကြိမ်လျှင် ပန်းကန်လုံးတစ်ဝက် (၁၂၅ ml ခန့်)</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-emerald-100">
                  <span className="font-bold text-slate-800 block mb-1">သင့်တော်သော အစားအစာ:</span>
                  <span>ကြက်သားနုပ်နုပ်စဉ်း၊ ငါးပြုတ်အရိုးနွှာ၊ တို့ဟူး၊ ငှက်ပျောသီးစိတ်၊ အသီးအရွက်နူးနူးများ</span>
                </div>
              </div>
            </div>
          )}

          {weaningAge === '12_24_months' && (
            <div className="space-y-2">
              <span className="font-bold text-emerald-950 block text-sm">🍱 ၁ နှစ် မှ ၂ နှစ်: မိသားစု စားပွဲတင် အစားအစာများ (Family Foods)</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-lg border border-emerald-100">
                  <span className="font-bold text-slate-800 block mb-1">အကြိမ်ရေ:</span>
                  <span>တစ်နေ့ ၃ ကြိမ် ပုံမှန်ထမင်း + အာဟာရ အဆာပြေ ၂ ကြိမ်</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-emerald-100">
                  <span className="font-bold text-slate-800 block mb-1">ပမာဏ:</span>
                  <span>တစ်ကြိမ်လျှင် ပန်းကန်လုံး ၃ ပုံ ၂ ပုံ မှ ၁ လုံး</span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-emerald-100">
                  <span className="font-bold text-slate-800 block mb-1">သင့်တော်သော အစားအစာ:</span>
                  <span>မိသားစု စားသောက်သော ထမင်းဟင်းများ (အစပ်နှင့် အငန်လွန်ကဲမှု မပါဝင်သော)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Topic Articles Hub */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'all', label: 'အားလုံး' },
              { id: 'newborn', label: '👶 မွေးကင်းစ ပြုစုမှု' },
              { id: 'feeding', label: '🍼 အာဟာရနှင့် နို့တိုက်ခြင်း' },
              { id: 'illness', label: '🌡️ ဖျားနာမှုနှင့် ရောဂါများ' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-sky-600 text-white shadow-2xs'
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
              placeholder="ကလေးပြုစုနည်း ရှာဖွေရန်..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* 2-Col View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 space-y-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              ကလေးပြုစုစောင့်ရှောက်ရေး အကြောင်းအရာများ ({filteredTopics.length})
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
                        ? 'bg-sky-50 border-sky-400 shadow-xs ring-1 ring-sky-400'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl p-1.5 bg-white rounded-xl shadow-2xs shrink-0 border border-slate-100">
                      {topic.icon}
                    </span>
                    <div className="space-y-1 flex-1 min-w-0">
                      <h3 className={`text-xs font-bold truncate ${isSelected ? 'text-sky-900' : 'text-slate-800'}`}>
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
                  <p className="text-xs text-sky-600 font-semibold">{activeTopic.subtitleMm}</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                {activeTopic.summary}
              </p>
            </div>

            {/* Key Practices & Mistakes to Avoid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>မှန်ကန်သော ပြုစုနည်းများ</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {activeTopic.keyPractices.map((p, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-50/50 rounded-xl p-4 border border-red-100 space-y-2.5">
                <div className="flex items-center gap-2 text-red-900 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>ရှောင်ကြဉ်ရမည့် အမှားများ</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {activeTopic.mistakesToAvoid.map((m, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-500 font-bold mt-0.5">✕</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Warning Signs */}
            <div className="space-y-2.5 bg-red-50 rounded-xl p-4 border border-red-200">
              <div className="flex items-center gap-2 text-red-900 font-bold text-xs">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>⚠️ ဆေးရုံ/ဆေးခန်းသို့ ချက်ချင်းပြသရမည့် သတိပေးလက္ခဏာများ</span>
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

            {/* Doctor Guidance */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
              <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sky-900 block mb-0.5">ကလေးအထူးကုဆရာဝန်၏ အကြံပြုချက်:</span>
                <p className="leading-relaxed">{activeTopic.doctorGuidance}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
