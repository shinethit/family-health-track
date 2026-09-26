import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Baby, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ShoppingBag, 
  Activity, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  FileText,
  Info,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

interface TrimesterInfo {
  trimester: number;
  titleMm: string;
  weeks: string;
  babyGrowthMm: string;
  motherChangesMm: string;
  nutritionTipsMm: string[];
  medicalCheckupsMm: string[];
  dosAndDonts: { do: string; dont: string }[];
}

const TRIMESTER_DATA: TrimesterInfo[] = [
  {
    trimester: 1,
    titleMm: 'ပထမ ၃ လပတ် (First Trimester)',
    weeks: 'အပတ်စဉ် ၁ မှ ၁၂ အပတ်',
    babyGrowthMm: 'နှလုံးခုန်သံ စတင်ပေါ်ပေါက်လာပြီး ဦးနှောက်၊ ကျောရိုး၊ မျက်လုံး၊ လက်ချောင်း၊ ခြေချောင်းနှင့် အဓိက ကိုယ်တွင်းအင်္ဂါများ စတင်ဖွဲ့စည်းပါသည်။ သန္ဓေသားသည် သံပရာသီးအရွယ်ခန့် ရှိလာပါသည်။',
    motherChangesMm: 'မနက်ခင်း မအီမသာဖြစ်ခြင်း၊ အန်ခြင်း (Morning Sickness)၊ အလွန်အမင်း မောပန်းနွမ်းနယ်ခြင်း၊ ရင်သားတင်းမာနာကျင်ခြင်း၊ ဆီးခဏခဏသွားခြင်းနှင့် စိတ်ခံစားမှု အတက်အကျမြန်ခြင်းများ ဖြစ်ပေါ်တတ်ပါသည်။',
    nutritionTipsMm: [
      'ဖောလစ်အက်ဆစ် (Folic Acid 400 mcg) ကို သန္ဓေသား ဦးနှောက်နှင့် အာရုံကြောချို့ယွင်းမှု ကာကွယ်ရန် နေ့စဉ် မပျက်မကွက် သောက်ပါ',
      'မအီမသာ အန်ချင်ပါက အစာကို တစ်ခါတည်း အများကြီးမစားဘဲ နည်းနည်းနှင့် ခဏခဏ စားပါ',
      'ချင်း (Ginger) ပြုတ်ရည် သို့မဟုတ် သံပရာရည် သောက်ပေးခြင်းဖြင့် မအီမသာဖြစ်ခြင်းကို သက်သာစေနိုင်ပါသည်',
      'ရေဓာတ်မခမ်းခြောက်စေရန် တစ်နေ့လျှင် ရေ ၂ လီတာမှ ၂.၅ လီတာ သောက်ပါ'
    ],
    medicalCheckupsMm: [
      'ပထမဆုံး ကိုယ်ဝန်အပ်နှံခြင်း (First Antenatal Care - ANC Visit)',
      'အာထရာဆောင်း (Ultrasound) ရိုက်၍ သန္ဓေသား နှလုံးခုန်သံနှင့် သားအိမ်တွင်း နေရာမှန်/မမှန် စစ်ဆေးခြင်း',
      'သွေးအုပ်စု (ABO & Rh Factor)၊ သွေးအားနည်းရောဂါ (Hb)၊ အသည်းရောင်ဘီပိုး၊ HIV၊ ဆစ်ဖလစ် နှင့် ဆီးစစ်ဆေးခြင်း'
    ],
    dosAndDonts: [
      { do: 'တစ်နေ့လျှင် အနည်းဆုံး ၈ နာရီမှ ၉ နာရီ အိပ်ရေးဝဝ အိပ်စက်ပါ', dont: 'အရက်၊ ဆေးလိပ်နှင့် ကဖင်းဓာတ် အလွန်အကျွံ သောက်သုံးခြင်း လုံးဝရှောင်ပါ' },
      { do: 'လတ်ဆတ်သော သစ်သီးနှင့် အရွက်စိမ်းများ စားပါ', dont: 'အစိမ်းစား အသား/ငါး (Sushi) နှင့် မကျက်တကျက် ဥများ လုံးဝမစားပါနှင့်' },
      { do: 'သက်သောင့်သက်သာရှိသော ဖိနပ်နှင့် အဝတ်အစား ဝတ်ဆင်ပါ', dont: 'ဆရာဝန် ညွှန်ကြားချက်မပါဘဲ မည်သည့် အကိုက်အခဲပျောက်ဆေးမျှ မသောက်ပါနှင့်' }
    ]
  },
  {
    trimester: 2,
    titleMm: 'ဒုတိယ ၃ လပတ် (Second Trimester)',
    weeks: 'အပတ်စဉ် ၁၃ မှ ၂၇ အပတ်',
    babyGrowthMm: 'ကလေးငယ်သည် မျက်တောင်ခတ်နိုင်ပြီး အသံများကို စတင်ကြားနိုင်ပါသည်။ လက်သည်းခြေသည်းများ ဖွဲ့စည်းပြီး အပတ် ၂၀ ဝန်းကျင်တွင် မိခင်သည် ကလေး၏ ပထမဆုံး လှုပ်ရှားမှုကို စတင်ခံစားရပါသည် (Quickening)။',
    motherChangesMm: 'မနက်ခင်းအန်ခြင်းများ သက်သာလာပြီး အားအင်ပိုမိုပြည့်ဝလာသော ရွှေရောင်ကာလ (Golden Period) ဖြစ်ပါသည်။ ဝမ်းဗိုက်သိသာစွာ ကြီးထွားလာပြီး ဗိုက်နှင့် ပေါင်တို့တွင် အကြောပြတ်ရာများ (Stretch marks) ပေါ်လာနိုင်ပါသည်။',
    nutritionTipsMm: [
      'သံဓာတ် (Iron) နှင့် ကယ်လ်စီယမ် (Calcium) ကို ဆရာဝန် ညွှန်ကြားချက်အတိုင်း စတင် သောက်သုံးပါ',
      'ကယ်လ်စီယမ်သည် သန္ဓေသား အရိုးနှင့် သွားများ ခိုင်မာစေရန်အတွက် နို့၊ ဒိန်ချဉ်၊ တို့ဟူး၊ နှမ်း တို့မှ ရယူပါ',
      'ပရိုတင်းဓာတ် (ကြက်ဥ၊ ကြက်သား၊ ငါး၊ ပဲအမျိုးမျိုး) ပိုမိုစားသုံးပါ',
      'ဝမ်းချုပ်ခြင်း ကာကွယ်ရန် အမျှင်ဓာတ် (Fiber) ကြွယ်ဝသော သင်္ဘောသီးမှည့်၊ ငှက်ပျောသီး၊ ဟင်းသီးဟင်းရွက် စားပါ'
    ],
    medicalCheckupsMm: [
      'အပတ်စဉ် ၁၈ မှ ၂၂ အပတ်အတွင်း အသေးစိတ် ခန္ဓာကိုယ်ဖွဲ့စည်းမှု အာထရာဆောင်း စစ်ဆေးခြင်း (Anomaly Scan)',
      'ကိုယ်ဝန်ဆောင် ဆီးချို စစ်ဆေးခြင်း (OGTT - Oral Glucose Tolerance Test - 24-28 Weeks)',
      'သွေးပေါင်ချိန်နှင့် ဆီးတွင်း အသားဓာတ် (Albumin/Protein) ကို လစဉ် ပုံမှန် စစ်ဆေးခြင်း'
    ],
    dosAndDonts: [
      { do: 'ဘယ်ဘက်စောင်း အိပ်ပေးခြင်းဖြင့် ကလေးထံ သွေးလှည့်ပတ်မှု အကောင်းဆုံး ရရှိစေပါ', dont: 'ပက်လက် အကြာကြီး အိပ်ခြင်းကို ရှောင်ကြဉ်ပါ (အဓိကသွေးကြောကြီးကို ဖိမိနိုင်သည်)' },
      { do: 'ကိုယ်ဝန်ဆောင် သင့်တော်သော လမ်းလျှောက်ခြင်း၊ ရေကူးခြင်း လေ့ကျင့်ပါ', dont: 'လေးလံသော ပစ္စည်းများ မခြင်း သို့မဟုတ် ခုန်ပေါက်လှုပ်ရှားခြင်း မပြုလုပ်ပါနှင့်' },
      { do: 'ဗိုက်အရေပြား ယားယံခြင်းအတွက် အစိုဓာတ်ထိန်းခရင်မ် (Moisturizer/Bio-oil) လိမ်းပါ', dont: 'ရေနွေးပူပူဖြင့် အကြာကြီး ရေချိုးခြင်း သို့မဟုတ် Sauna ဝင်ခြင်း မပြုပါနှင့်' }
    ]
  },
  {
    trimester: 3,
    titleMm: 'တတိယ ၃ လပတ် (Third Trimester)',
    weeks: 'အပတ်စဉ် ၂၈ မှ မွေးဖွားသည်အထိ (၄၀ အပတ်)',
    babyGrowthMm: 'ကလေးသည် ကိုယ်အလေးချိန် လျင်မြန်စွာ တက်လာပြီး အဆုတ်အပါအဝင် အင်္ဂါအစိတ်အပိုင်းအားလုံး ပြီးပြည့်စုံစွာ ဖွံ့ဖြိုးလာပါသည်။ ကလေးခေါင်းသည် တင်ပါးဆုံတွင်းသို့ စတင်ဆင်းသက်လာပါသည် (Engagement)။',
    motherChangesMm: 'ရင်ပြည့်ရင်ကယ်ဖြစ်ခြင်း၊ အသက်ရှူမဝခြင်း၊ ခြေထောက်နှင့် ခြေကျင်းဝတ်များ ရောင်ရမ်းလာခြင်း၊ မကြာခဏ ဆီးသွားချင်ခြင်း၊ ခါးနာခြင်းနှင့် အိပ်မပျော်ခြင်းတို့ ဖြစ်တတ်ပါသည်။ မကြာခဏ သားအိမ်ညှစ်သလို ခံစားရနိုင်ပါသည် (Braxton Hicks Contractions)။',
    nutritionTipsMm: [
      'အိုမီဂါ-၃ ဖက်တီးအက်ဆစ် (DHA) ကြွယ်ဝသော အစားအစာများဖြင့် ကလေး ဦးနှောက်နှင့် မျက်လုံးဖွံ့ဖြိုးမှုကို အားဖြည့်ပါ',
      'ရေများများ သောက်ပေးခြင်းဖြင့် ခြေထောက်ရောင်ရမ်းခြင်းကို သက်သာစေပါ',
      'ရင်ပူရင်ကယ်ဖြစ်ခြင်း သက်သာစေရန် အဆီများသော အစားအစာများနှင့် အစပ်များကို ရှောင်ပါ',
      'ခွန်အားပြည့်ဝစေရန် စွမ်းအင်ဖြစ်စေသော အာဟာရများကို မျှတစွာ စားသုံးပါ'
    ],
    medicalCheckupsMm: [
      'အပတ်စဉ် ၂၈ မှ ၃၆ အပတ်အထိ ၂ ပတ်တစ်ကြိမ် ဆရာဝန်နှင့် ပြသခြင်း',
      'အပတ်စဉ် ၃၆ နောက်ပိုင်း မွေးဖွားသည်အထိ ၁ ပတ်တစ်ကြိမ် သို့မဟုတ် ပို၍ မကြာခဏ ပြသခြင်း',
      'ကလေး၏ တည်နေရာ (Cephalic/Breech)၊ ရေမြွှာရည်ပမာဏ (AFI) နှင့် ကလေးအလေးချိန် တိုင်းတာခြင်း'
    ],
    dosAndDonts: [
      { do: 'နေ့စဉ် ကလေးလှုပ်ရှားမှု အကြိမ်ရေကို သေချာစွာ စောင့်ကြည့်မှတ်သားပါ (Kick Count)', dont: 'ခရီးဝေး သွားလာခြင်း သို့မဟုတ် လေယာဉ်စီးခြင်းကို ဆရာဝန်ခွင့်ပြုချက်မပါဘဲ မလုပ်ပါနှင့်' },
      { do: 'ဆေးရုံသွားရန် လိုအပ်သော ပစ္စည်းများကို အိတ်ထဲသို့ ကြိုတင် ထည့်သွင်းပြင်ဆင်ထားပါ', dont: 'ရေမြွှာပေါက်ခြင်း သို့မဟုတ် သွေးဆင်းခြင်းရှိပါက အိမ်တွင် လုံးဝ မစောင့်ပါနှင့်' },
      { do: 'မွေးဖွားစဉ် အသက်ရှူလေ့ကျင့်ခန်းများ ကြိုတင်လေ့ကျင့်ပါ', dont: 'ခြေထောက်ရောင်လျှင် အကြာကြီး မတ်တပ်ရပ်ခြင်း သို့မဟုတ် ခြေထောက်တွဲလောင်းချထိုင်ခြင်း မလုပ်ပါနှင့်' }
    ]
  }
];

export const PregnancyCareModule: React.FC = () => {
  const [selectedTrimester, setSelectedTrimester] = useState<number>(1);
  
  // Interactive EDD Calculator State
  const [lmpDate, setLmpDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 70); // 10 weeks ago default
    return d.toISOString().split('T')[0];
  });
  const [eddResult, setEddResult] = useState<{
    eddFormatted: string;
    currentWeeks: number;
    currentDays: number;
    trimester: number;
    daysRemaining: number;
  } | null>(null);

  // Interactive Fetal Kick Counter State
  const [kickCount, setKickCount] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [kickLogs, setKickLogs] = useState<Array<{ id: string; time: string; kicks: number; durationMinutes: number }>>([
    { id: '1', time: 'ယနေ့ မနက် ၉:၀၀', kicks: 10, durationMinutes: 28 }
  ]);

  // Hospital Bag Checklist State
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({
    'doc1': true,
    'doc2': true,
    'mom1': true,
    'baby1': true
  });

  // Calculate EDD based on Naegele's Rule: LMP + 280 days (40 weeks)
  useEffect(() => {
    if (!lmpDate) return;
    const lmp = new Date(lmpDate);
    if (isNaN(lmp.getTime())) return;

    const edd = new Date(lmp);
    edd.setDate(edd.getDate() + 280);

    const today = new Date();
    const diffTime = today.getTime() - lmp.getTime();
    const totalDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    const currentWeeks = Math.floor(totalDays / 7);
    const currentDays = totalDays % 7;

    let tri = 1;
    if (currentWeeks >= 28) tri = 3;
    else if (currentWeeks >= 13) tri = 2;

    const remainingDays = Math.max(0, Math.ceil((edd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

    setEddResult({
      eddFormatted: edd.toLocaleDateString('my-MM', { year: 'numeric', month: 'long', day: 'numeric' }),
      currentWeeks,
      currentDays,
      trimester: tri,
      daysRemaining: remainingDays
    });
  }, [lmpDate]);

  // Kick Counter Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleAddKick = () => {
    if (!isTimerRunning) {
      setIsTimerRunning(true);
    }
    const newCount = kickCount + 1;
    setKickCount(newCount);

    if (newCount === 10) {
      setIsTimerRunning(false);
      const minutes = Math.ceil(timerSeconds / 60) || 1;
      const newLog = {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString('my-MM', { hour: '2-digit', minute: '2-digit' }),
        kicks: 10,
        durationMinutes: minutes
      };
      setKickLogs(prev => [newLog, ...prev]);
    }
  };

  const handleResetKickCounter = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
    setKickCount(0);
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleCheckItem = (id: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const hospitalBagSections = [
    {
      category: '📄 အရေးကြီး စာရွက်စာတမ်းများ',
      items: [
        { id: 'doc1', text: 'ကိုယ်ဝန်ဆောင် ဆေးမှတ်တမ်းစာအုပ် (ANC Card) နှင့် အာထရာဆောင်း အဖြေများ' },
        { id: 'doc2', text: 'မိခင်နှင့် ဖခင်၏ နိုင်ငံသားစိစစ်ရေးကတ် (NRC) / အိမ်ထောင်စုစာရင်း မိတ္တူ' },
        { id: 'doc3', text: 'ကျန်းမာရေး အာမခံကတ် သို့မဟုတ် ဆေးရုံဘောက်ချာ စာရွက်စာတမ်းများ' },
        { id: 'doc4', text: 'အရေးပေါ် ဆက်သွယ်ရမည့် ဖုန်းနံပါတ်များနှင့် ဆရာဝန်ဖုန်းနံပါတ်' }
      ]
    },
    {
      category: '🤰 မွေးလူနာ မိခင်အတွက် လိုအပ်ချက်များ',
      items: [
        { id: 'mom1', text: 'ရှေ့ကြယ်သီးတပ် သက်သောင့်သက်သာ အင်္ကျီ/ဂါဝန် (နို့တိုက်ရလွယ်ကူသော) ၃ စုံ' },
        { id: 'mom2', text: 'မွေးလူနာသုံး လစဉ်သုံးပစ္စည်း (Maternity Pads) နှင့် တစ်ခါသုံး အတွင်းခံများ' },
        { id: 'mom3', text: 'နို့တိုက် ဘရာစီယာ (Nursing Bra) နှင့် ရင်သားအစိုခံပြား (Breast Pads)' },
        { id: 'mom4', text: 'ခြေအိတ်နွေးနွေး၊ ခေါင်းစွပ်၊ စောင်ပါး နှင့် ဖိနပ်အပါး' },
        { id: 'mom5', text: 'သွားတိုက်တံ၊ မျက်နှာသုတ်ပုဝါ၊ ဆပ်ပြာ၊ နှုတ်ခမ်းအစိုဓာတ်ထိန်းဆီ (Lip balm)' },
        { id: 'mom6', text: 'ဖုန်းအားသွင်းကြိုး (Power bank) နှင့် အားဖြည့် မုန့်အချို/ရေသန့်ဘူး' }
      ]
    },
    {
      category: '👶 မွေးကင်းစ ကလေးငယ်အတွက် လိုအပ်ချက်များ',
      items: [
        { id: 'baby1', text: 'မွေးကင်းစ ကလေးဝတ် ချည်သားအင်္ကျီ ၄ စုံမှ ၅ စုံ' },
        { id: 'baby2', text: 'ကလေးသေးခံ (Newborn Diapers) ၁ ထုပ် နှင့် ရေစိုတစ်ရှူး (Baby Wipes)' },
        { id: 'baby3', text: 'ကလေးပတ် ပုဝါစောင် (Swaddle blankets) ၃ ထည်' },
        { id: 'baby4', text: 'ကလေး ခေါင်းစွပ်ဦးထုပ်၊ လက်အိတ်၊ ခြေအိတ် ၂ စုံစီ' },
        { id: 'baby5', text: 'မွေးကင်းစ အနှီးထည် (Cloth diapers/nappies) ၁၀ ထည်ခန့်' },
        { id: 'baby6', text: 'ကလေး ပြန်လည်ခေါ်ဆောင်ရန် ကားထိုင်ခုံ (Baby Car Seat) သို့မဟုတ် ပခက်ငယ်' }
      ]
    }
  ];

  const totalBagItems = hospitalBagSections.flatMap(s => s.items).length;
  const packedItemsCount = Object.values(checkedItems).filter(Boolean).length;
  const packedPercentage = Math.round((packedItemsCount / totalBagItems) * 100);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 rounded-2xl p-5 sm:p-7 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-xl">🤰</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 tracking-wide uppercase">
                Maternal & Pregnancy Care
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              ကိုယ်ဝန်ဆောင် ကျန်းမာရေးနှင့် စောင့်ရှောက်မှု လမ်းညွှန်
            </h1>
            <p className="text-xs sm:text-sm text-teal-100 max-w-2xl leading-relaxed">
              သန္ဓေဆောင်ကာလ ၃ လပတ် အဆင့်ဆင့် ပြောင်းလဲမှုများ၊ အန္တရာယ်လက္ခဏာများ၊ EDD မွေးဖွားရက် တွက်ချက်ခြင်း၊ ကလေးလှုပ်ရှားမှု ရေတွက်စနစ်နှင့် ဆေးရုံအိတ် ပြင်ဆင်မှု စစ်ဆေးလွှာ။
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs border border-white/20 shrink-0">
            <Heart className="w-4 h-4 text-rose-300" />
            <span>မိခင်နှင့် သန္ဓေသား စောင့်ရှောက်ရေး</span>
          </div>
        </div>
      </div>

      {/* Emergency Danger Signs Box (CRITICAL) */}
      <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 sm:p-5 text-red-950 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
          <span>⚠️ ကိုယ်ဝန်ဆောင်ချိန် ချက်ချင်း ဆေးရုံ/ဆေးခန်း ပြသရမည့် အရေးပေါ် အန္တရာယ်လက္ခဏာများ (Danger Signs)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs text-red-900 font-medium">
          <div className="p-2.5 bg-white/80 rounded-xl border border-red-200 flex items-start gap-2">
            <span className="text-red-600 font-bold text-base leading-none">•</span>
            <span>မိန်းမကိုယ်မှ သွေးဆင်းခြင်း သို့မဟုတ် သွေးစွန်းခြင်း (Vaginal Bleeding)</span>
          </div>
          <div className="p-2.5 bg-white/80 rounded-xl border border-red-200 flex items-start gap-2">
            <span className="text-red-600 font-bold text-base leading-none">•</span>
            <span>ပြင်းထန်စွာ ခေါင်းကိုက်ခြင်း၊ မျက်စိပြာခြင်း/ဝေဝါးခြင်း (Pre-eclampsia)</span>
          </div>
          <div className="p-2.5 bg-white/80 rounded-xl border border-red-200 flex items-start gap-2">
            <span className="text-red-600 font-bold text-base leading-none">•</span>
            <span>မျက်နှာ၊ လက်နှင့် ခြေထောက်များ ရုတ်တရက် အလွန်အမင်း ရောင်ရမ်းလာခြင်း</span>
          </div>
          <div className="p-2.5 bg-white/80 rounded-xl border border-red-200 flex items-start gap-2">
            <span className="text-red-600 font-bold text-base leading-none">•</span>
            <span>ရေမြွှာရည် စောစီးစွာ ပေါက်ခြင်း သို့မဟုတ် အရည်များ ဆင်းခြင်း (Water Leaking)</span>
          </div>
          <div className="p-2.5 bg-white/80 rounded-xl border border-red-200 flex items-start gap-2">
            <span className="text-red-600 font-bold text-base leading-none">•</span>
            <span>ကလေးလှုပ်ရှားမှု သိသာစွာ လျော့နည်းသွားခြင်း သို့မဟုတ် လုံးဝမလှုပ်တော့ခြင်း</span>
          </div>
          <div className="p-2.5 bg-white/80 rounded-xl border border-red-200 flex items-start gap-2">
            <span className="text-red-600 font-bold text-base leading-none">•</span>
            <span>ကိုယ်ပူကြီးခြင်း၊ ချမ်းတုန်ဖျားခြင်း သို့မဟုတ် ပြင်းထန်စွာ ဗိုက်အောင့်ခြင်း</span>
          </div>
        </div>
      </div>

      {/* Grid: 2 Interactive Tools (EDD Calculator & Kick Counter) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tool 1: EDD Calculator (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                📅 မွေးဖွားမည့်ရက် (EDD) တွက်ချက်ခြင်း
              </h2>
              <p className="text-[11px] text-slate-500">နောက်ဆုံး ရာသီစတင်ရက် (LMP) ဖြင့် တွက်ပါ</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">နောက်ဆုံး ရာသီစတင်ခဲ့သည့်ရက် (LMP Date)</label>
            <input 
              type="date" 
              value={lmpDate}
              onChange={(e) => setLmpDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {eddResult && (
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50/60 p-4 rounded-xl border border-teal-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-800">ခန့်မှန်း မွေးဖွားမည့်ရက် (EDD):</span>
                <span className="text-sm font-extrabold text-teal-900">{eddResult.eddFormatted}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-teal-200/50 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-teal-100">
                  <span className="text-[10px] text-slate-500 block">လက်ရှိ ကိုယ်ဝန်သက်</span>
                  <span className="font-bold text-slate-800">
                    {eddResult.currentWeeks} ပတ် + {eddResult.currentDays} ရက်
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-teal-100">
                  <span className="text-[10px] text-slate-500 block">ကာလ အဆင့်</span>
                  <span className="font-bold text-teal-700">
                    {eddResult.trimester === 1 ? 'ပထမ ၃ လပတ်' : eddResult.trimester === 2 ? 'ဒုတိယ ၃ လပတ်' : 'တတိယ ၃ လပတ်'}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 text-center font-medium bg-white/70 py-1.5 rounded-lg border border-teal-100">
                ⏳ မွေးဖွားရန် ရက်ပေါင်း <strong className="text-teal-800">{eddResult.daysRemaining}</strong> ရက် လိုပါသေးသည်
              </div>
            </div>
          )}
        </div>

        {/* Tool 2: Fetal Kick Counter (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <Baby className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  🦶 ကလေးလှုပ်ရှားမှု ရေတွက်စနစ် (Fetal Kick Counter)
                </h2>
                <p className="text-[11px] text-slate-500">၂ နာရီအတွင်း ကလေး ၁၀ ကြိမ် လှုပ်ရှားမှုကို ရေတွက်ပါ</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200">
                ⏱️ {formatTimer(timerSeconds)}
              </span>
              <button
                onClick={handleResetKickCounter}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                title="ပြန်စမည်"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-center sm:text-left space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase">လက်ရှိ လှုပ်ရှားမှု အကြိမ်ရေ</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-rose-600">{kickCount}</span>
                <span className="text-sm font-bold text-slate-400">/ ၁၀ ကြိမ်</span>
              </div>
              <p className="text-[10px] text-slate-500">
                {kickCount >= 10 
                  ? '🎉 ကောင်းမွန်ပါသည်! ၁၀ ကြိမ် ပြည့်မြောက်သွားပါပြီ။' 
                  : isTimerRunning 
                    ? 'ကလေး လှုပ်ရှားတိုင်း အောက်ပါ ခလုတ်ကို နှိပ်ပါ' 
                    : 'စတင်ရန် အောက်ပါ ခလုတ်ကို နှိပ်ပါ'}
              </p>
            </div>

            <button
              onClick={handleAddKick}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold rounded-2xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <Plus className="w-5 h-5" />
              <span>ကလေး လှုပ်ရှားသည် (+၁)</span>
            </button>
          </div>

          {/* Kick History Log */}
          {kickLogs.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500">မကြာသေးမီက ရေတွက်ထားသော မှတ်တမ်းများ:</span>
              <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                {kickLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200 text-xs">
                    <span className="text-slate-600 font-medium">{log.time}</span>
                    <span className="font-bold text-emerald-700">✓ {log.kicks} ကြိမ် ပြည့်မြောက် ({log.durationMinutes} မိနစ်ကြာ)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trimester-by-Trimester Detailed Guide */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              🌱 သန္ဓေဆောင် ကာလအလိုက် ပြည့်စုံသော စောင့်ရှောက်မှု လမ်းညွှန်
            </h2>
            <p className="text-xs text-slate-500">ပထမ၊ ဒုတိယနှင့် တတိယ ၃ လပတ်အလိုက် အပြောင်းအလဲများနှင့် လိုက်နာရန်များ</p>
          </div>

          {/* Trimester Tabs */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((tri) => (
              <button
                key={tri}
                onClick={() => setSelectedTrimester(tri)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedTrimester === tri
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tri === 1 ? '၁ မှ ၁၂ ပတ် (1st)' : tri === 2 ? '၁၃ မှ ၂၇ ပတ် (2nd)' : '၂၈ မှ ၄၀ ပတ် (3rd)'}
              </button>
            ))}
          </div>
        </div>

        {/* Active Trimester Content */}
        {(() => {
          const tri = TRIMESTER_DATA.find(t => t.trimester === selectedTrimester) || TRIMESTER_DATA[0];
          return (
            <div className="space-y-5">
              <div className="flex items-center justify-between bg-teal-50/70 p-3.5 rounded-xl border border-teal-100">
                <span className="text-sm font-bold text-teal-950">{tri.titleMm}</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white text-teal-800 border border-teal-200">
                  {tri.weeks}
                </span>
              </div>

              {/* Baby growth vs Mother's changes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                    <Baby className="w-4 h-4 text-teal-600" />
                    <span>သန္ဓေသား ကလေးငယ်၏ ကြီးထွားမှု</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{tri.babyGrowthMm}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>မိခင်၏ ခန္ဓာကိုယ်နှင့် စိတ်ပိုင်းဆိုင်ရာ ပြောင်းလဲမှုများ</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{tri.motherChangesMm}</p>
                </div>
              </div>

              {/* Nutrition & ANC Checkups */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-2">
                  <span className="text-xs font-bold text-emerald-900 block">🥗 အာဟာရနှင့် ဗီတာမင် လမ်းညွှန်ချက်များ</span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {tri.nutritionTipsMm.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-100 space-y-2">
                  <span className="text-xs font-bold text-sky-900 block">🩺 မဖြစ်မနေ စစ်ဆေးရမည့် ဆေးစစ်ချက်များ (ANC)</span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {tri.medicalCheckupsMm.map((chk, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-sky-600 font-bold">•</span>
                        <span>{chk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Do's and Don'ts */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 block">⚖️ ပြုလုပ်ရန် နှင့် ရှောင်ကြဉ်ရန်များ (Do's & Don'ts)</span>
                <div className="space-y-2">
                  {tri.dosAndDonts.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-emerald-50 text-emerald-950 rounded-lg border border-emerald-200 flex items-start gap-2">
                        <span className="text-emerald-700 font-bold shrink-0">ပြုလုပ်ရန်:</span>
                        <span>{item.do}</span>
                      </div>
                      <div className="p-2.5 bg-red-50 text-red-950 rounded-lg border border-red-200 flex items-start gap-2">
                        <span className="text-red-700 font-bold shrink-0">ရှောင်ကြဉ်ရန်:</span>
                        <span>{item.dont}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Interactive Hospital Bag Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                🧳 ဆေးရုံသွား အိတ်ပြင်ဆင်မှု စစ်ဆေးလွှာ (Hospital Bag Checklist)
              </h2>
              <p className="text-xs text-slate-500">မွေးဖွားရန် ဆေးရုံတက်ရောက်ချိန် မဖြစ်မနေ ယူဆောင်သွားရမည့် ပစ္စည်းများ</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="text-right">
              <span className="text-xs font-bold text-slate-800">{packedItemsCount} / {totalBagItems} ပြီးစီး</span>
              <span className="text-[10px] text-slate-500 block">({packedPercentage}%)</span>
            </div>
            <div className="w-20 bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
              <div 
                className="bg-emerald-600 h-2.5 transition-all duration-300"
                style={{ width: `${packedPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hospitalBagSections.map((sec, idx) => (
            <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-2">
                {sec.category}
              </h3>
              <div className="space-y-2">
                {sec.items.map((item) => {
                  const isDone = !!checkedItems[item.id];
                  return (
                    <label 
                      key={item.id}
                      onClick={() => toggleCheckItem(item.id)}
                      className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-all text-xs leading-relaxed ${
                        isDone 
                          ? 'bg-emerald-50 text-emerald-950 font-medium' 
                          : 'bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input 
                        type="checkbox"
                        checked={isDone}
                        onChange={() => {}}
                        className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-teal-500 accent-emerald-600 cursor-pointer shrink-0"
                      />
                      <span className={isDone ? 'line-through text-slate-400' : ''}>
                        {item.text}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
