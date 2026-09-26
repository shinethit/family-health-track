import React, { useState, useMemo } from 'react';
import { 
  Newspaper, 
  Search, 
  Bookmark, 
  Share2, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Heart, 
  Activity, 
  Droplets, 
  Apple, 
  ShieldAlert, 
  Sparkles,
  ChevronRight,
  X,
  BookOpen,
  Info
} from 'lucide-react';
import { HealthArticle } from '../../types/health';

export const HEALTH_ARTICLES: HealthArticle[] = [
  {
    id: 'art-01',
    title: 'သွေးတိုးရောဂါကို ဆေးမပါဘဲ သဘာဝအတိုင်း ထိန်းညှိနိုင်မည့် DASH Diet နည်းလမ်း',
    category: 'bp',
    readingTime: '၄ မိနစ် ဖတ်ရန်',
    publishedDate: '၂၀၂၆ ခုနှစ် မတ်လ',
    author: 'ဒေါက်တာဇော်မင်း (အထွေထွေရောဂါကု ဆရာဝန်ကြီး)',
    summary: 'သွေးတိုးသမားများအတွက် ဆားလျှော့စားခြင်းအပြင် ပိုတက်စီယမ်၊ မဂ္ဂနီစီယမ် ကြွယ်ဝသော အသီးအရွက်များဖြင့် သွေးပေါင်ချိန်ကို ပုံမှန်အဆင့်သို့ ထိန်းသိမ်းနည်း။',
    tags: ['သွေးတိုး', 'DASH Diet', 'ဆားလျှော့စားနည်း', 'နှလုံး'],
    keyTakeaways: [
      'တစ်နေ့လျှင် ဆားစားသုံးမှု လက်ဖက်ရည်ဇွန်း ၁ ဇွန်း (Sodium 2,300 mg) အောက် လျှော့ချပါ။',
      'ငှက်ပျောသီး၊ ထောပတ်သီး၊ ဟင်းနုနွယ်စသည့် ပိုတက်စီယမ်ကြွယ်ဝသော အစားအစာများကို ပိုမိုစားသုံးပါ။',
      'နေ့စဉ် မိနစ် ၃၀ ခန့် လမ်းသွက်သွက်လျှောက်ခြင်းဖြင့် Systolic BP ကို ၅-၈ mmHg အထိ လျှော့ချနိုင်သည်။',
      'စိတ်ဖိစီးမှုလျှော့ချပြီး တစ်နေ့ အနည်းဆုံး ၇ နာရီ ပြည့်ဝစွာ အိပ်စက်ပါ။'
    ],
    content: [
      'သွေးတိုးရောဂါ (Hypertension) သည် ကနဦးတွင် သိသာသော လက္ခဏာမပြဘဲ နှလုံး၊ ဦးနှောက်နှင့် ကျောက်ကပ်တို့ကို တိတ်တဆိတ် ထိခိုက်စေတတ်သောကြောင့် "တိတ်တဆိတ် လူသတ်သမား" (Silent Killer) ဟု တင်စားကြပါသည်။',
      'DASH Diet (Dietary Approaches to Stop Hypertension) ဆိုသည်မှာ သွေးတိုးကို သဘာဝအတိုင်း ကျဆင်းစေရန် ကမ္ဘာ့ကျန်းမာရေးအဖွဲ့အစည်းများက ထောက်ခံထားသော အစားအသောက်ပုံစံဖြစ်ပါသည်။',
      'အဓိကအချက်မှာ အငန် (Sodium) လျှော့ချခြင်း၊ အဆီများသောအသားများအစား ငါးနှင့် ပဲအမျိုးမျိုး စားသုံးခြင်း၊ သစ်သီးဝလံနှင့် ဟင်းသီးဟင်းရွက် အမြောက်အမြား စားသုံးခြင်းတို့ ဖြစ်ပါသည်။',
      'သွေးပေါင်ချိန်ကို မနက်အိပ်ရာထချိန်နှင့် ညမအိပ်မီ ပုံမှန်တိုင်းတာမှတ်တမ်းတင်ပြီး ဆရာဝန် ညွှန်ကြားထားသော သွေးတိုးကျဆေးကို အချိန်မှန် သောက်သုံးရန် လိုအပ်ပါသည်။'
    ]
  },
  {
    id: 'art-02',
    title: 'ဆီးချိုသမားများ သွေးတွင်းသကြားဓာတ် (HbA1c) ၇% အောက် ထိန်းထားနိုင်မည့် နည်းလမ်းများ',
    category: 'diabetes',
    readingTime: '၅ မိနစ် ဖတ်ရန်',
    publishedDate: '၂၀၂၆ ခုနှစ် မတ်လ',
    author: 'ဒေါက်တာသင်းသင်း (ဆီးချိုနှင့် ဟော်မုန်းအထူးကု)',
    summary: 'မနက်စောစော Fasting Blood Sugar နှင့် အစာစားပြီး ၂ နာရီ သွေးချိုပမာဏကို တည်ငြိမ်စေမည့် အစားအသောက်ရွေးချယ်မှုနှင့် Glycemic Index (GI) နိမ့် အစားအစာများ။',
    tags: ['ဆီးချို', 'HbA1c', 'သွေးချိုထိန်းသိမ်းမှု', 'အစားအသောက်'],
    keyTakeaways: [
      'ထမင်းဖြူအစား ဆန်လုံးညို၊ အုတ်ဂျုံ (Oats)၊ သီးနှံစေ့များကို အစားထိုးစားသုံးပါ။',
      'သကြား၊ အချိုရည်၊ ကိတ်မုန့်နှင့် ကစီဓာတ်များသော အစားအစာများကို အထူးရှောင်ကြဉ်ပါ။',
      'အစာစားပြီးတိုင်း ၁၅ မိနစ်ခန့် ဖြည်းဖြည်း လမ်းလျှောက်ပေးခြင်းဖြင့် Post-meal Spike ကို တားဆီးနိုင်သည်။',
      '၃ လတစ်ကြိမ် HbA1c စစ်ဆေးပြီး ဆီးချိုထိန်းချုပ်မှု အခြေအနေကို စောင့်ကြည့်ပါ။'
    ],
    content: [
      'ဆီးချိုရောဂါရှင်များအတွက် သွေးတွင်းသကြားဓာတ် ရုတ်တရက် တက်ခြင်း/ကျခြင်း မဖြစ်စေရန် နေ့စဉ် အစားအသောက်ပုံစံသည် အရေးအကြီးဆုံး ဖြစ်ပါသည်။',
      'Glycemic Index (GI) နိမ့်သော အစားအစာများသည် အစာခြေစနစ်တွင် သကြားဓာတ်ကို ဖြည်းဖြည်းချင်းသာ သွေးထဲသို့ ထုတ်လွှတ်ပေးသောကြောင့် သွေးချိုဆောင့်တက်ခြင်းကို ကာကွယ်ပေးပါသည်။',
      'အစာစားချိန်တွင် ပန်းကန်၏ ထက်ဝက်ကို အရွက်စိမ်း၊ လေးပုံတစ်ပုံကို ပရိုတင်း (ငါး၊ ကြက်သား၊ တို့ဟူး) နှင့် ကျန်လေးပုံတစ်ပုံကိုသာ ကစီဓာတ် (ဆန်လုံးညို/ပြောင်းဖူး) ထည့်စားသည့် "Plate Method" ကို ကျင့်သုံးသင့်ပါသည်။'
    ]
  },
  {
    id: 'art-03',
    title: 'အသည်းအဆီဖုံးခြင်း (Fatty Liver) ကို သက်သာပျောက်ကင်းစေမည့် နေ့စဉ်နေထိုင်မှုပုံစံ',
    category: 'liver',
    readingTime: '၃ မိနစ် ဖတ်ရန်',
    publishedDate: '၂၀၂၆ ခုနှစ် ဖေဖော်ဝါရီလ',
    author: 'ဒေါက်တာမင်းနိုင် (အသည်းနှင့် အစာအိမ်အထူးကု)',
    summary: 'အသည်းအင်ဇိုင်းများ (ALT, AST) မြင့်တက်နေခြင်းနှင့် Fatty Liver အဆင့် (Grade 1/2) ကို ကိုယ်အလေးချိန် လျှော့ချခြင်းဖြင့် ပျောက်ကင်းအောင် ပြုပြင်နည်း။',
    tags: ['အသည်း', 'Fatty Liver', 'ALT/AST', 'ကိုယ်အလေးချိန်'],
    keyTakeaways: [
      'လက်ရှိ ကိုယ်အလေးချိန်၏ ၇% မှ ၁၀% အထိ လျှော့ချနိုင်ပါက အသည်းအဆီဖုံးခြင်း အလိုအလျောက် သိသိသာသာ လျော့ကျသွားပါသည်။',
      'အရက်သေစာ လုံးဝ ရှောင်ကြဉ်ရန်နှင့် အချိုများသော Fructose Corn Syrup အချိုရည်များကို ရှောင်ပါ။',
      'ကော်ဖီခါးခါး (သကြား/နို့စိမ်းမပါ) တစ်နေ့ ၁-၂ ခွက် သောက်သုံးခြင်းသည် အသည်းဆဲလ်များကို ကာကွယ်ပေးကြောင်း လေ့လာတွေ့ရှိရသည်။',
      '၆ လတစ်ကြိမ် Ultrasound နှင့် LFT (Liver Function Test) ပြန်လည်စစ်ဆေးပါ။'
    ],
    content: [
      'အသည်းအဆီဖုံးခြင်း (Non-Alcoholic Fatty Liver Disease - NAFLD) သည် ခေတ်လူငယ်နှင့် လူကြီးများတွင် အဝလွန်ခြင်း၊ ဆီးချိုနှင့် ကိုလက်စထရောများခြင်းတို့ကြောင့် အလွန်အဖြစ်များလာပါသည်။',
      'ကနဦးတွင် လက္ခဏာမပြသော်လည်း အချိန်ကြာလာပါက အသည်းရောင်ခြင်း (NASH) မှတစ်ဆင့် အသည်းခြောက်ခြင်းအထိ ဖြစ်ပွားနိုင်သောကြောင့် စောစီးစွာ ထိန်းသိမ်းရပါမည်။'
    ]
  },
  {
    id: 'art-04',
    title: 'ကျောက်ကပ်ကျန်းမာရေးနှင့် eGFR/Creatinine ပုံမှန်ဖြစ်စေရန် သိထားသင့်သည့် အချက်များ',
    category: 'kidney',
    readingTime: '၄ မိနစ် ဖတ်ရန်',
    publishedDate: '၂၀၂၆ ခုနှစ် ဖေဖော်ဝါရီလ',
    author: 'ဒေါက်တာလှိုင်မိုး (ကျောက်ကပ်ရောဂါ အထူးကုဆရာဝန်)',
    summary: 'အကိုက်အခဲပျောက်ဆေးများ အလွန်အကျွံ သောက်သုံးခြင်း၏ အန္တရာယ်နှင့် ရေသောက်သုံးမှု ပမာဏ မှန်ကန်စွာ ချိန်ဆနည်း။',
    tags: ['ကျောက်ကပ်', 'Creatinine', 'eGFR', 'ရေသောက်နည်း'],
    keyTakeaways: [
      'NSAID အမျိုးအစား အကိုက်အခဲပျောက်ဆေးများ (Diclofenac, Ibuprofen, Mefenamic) ကို ဆရာဝန်မပါဘဲ ဆက်တိုက်မသောက်ပါနှင့်။',
      'တစ်နေ့လျှင် ရေ ၂ လီတာမှ ၂.၅ လီတာ (ရေ ၈ ခွက်ခန့်) ညီညွတ်စွာ ခွဲသောက်ပါ။',
      'သွေးတိုးနှင့် ဆီးချိုကို တိကျစွာ ထိန်းချုပ်ပါ (ကျောက်ကပ်ပျက်စီးရခြင်း၏ ၇၀% သည် သွေးတိုးနှင့် ဆီးချိုကြောင့် ဖြစ်သည်)။',
      'ဆီးထဲတွင် အမြှုပ်များခြင်း သို့မဟုတ် ခြေထောက်ဖောယောင်ခြင်းရှိပါက ချက်ချင်း ဆေးစစ်ပါ။'
    ],
    content: [
      'ကျောက်ကပ်သည် ခန္ဓာကိုယ်အတွင်းရှိ အညစ်အကြေးများကို စစ်ထုတ်ပေးသော အဓိက အင်္ဂါအစိတ်အပိုင်း ဖြစ်ပါသည်။',
      'Creatinine မြင့်တက်ခြင်းနှင့် eGFR ကျဆင်းခြင်းသည် ကျောက်ကပ်စစ်ထုတ်နိုင်စွမ်း လျော့နည်းလာခြင်းကို ဖော်ပြနေပါသည်။ သွေးတိုးနှင့် ဆီးချိုကို ပုံမှန်ထိန်းထားခြင်းသည် ကျောက်ကပ်သက်တမ်းကို အရှည်ဆုံး ထိန်းသိမ်းပေးနိုင်သည့် နည်းလမ်းဖြစ်ပါသည်။'
    ]
  },
  {
    id: 'art-05',
    title: 'ယူရစ်အက်စစ် (Uric Acid / Gout) လျှော့ချရေးနှင့် အဆစ်ရောင်ခြင်း သက်သာစေမည့် လမ်းညွှန်',
    category: 'nutrition',
    readingTime: '၃ မိနစ် ဖတ်ရန်',
    publishedDate: '၂၀၂၆ ခုနှစ် ဇန်နဝါရီလ',
    author: 'ဒေါက်တာအောင်ကျော် (အရိုးနှင့် အဆစ်အထူးကု)',
    summary: 'ခြေမအဆစ်ရောင်ခြင်း၊ ယူရစ်အက်စစ် ၇.၀ mg/dL ထက် ကျော်လွန်နေသူများအတွက် ပျူရင်း (Purine) ဓာတ်များသော အစားအစာများ ရှောင်ကြဉ်နည်း။',
    tags: ['ယူရစ်အက်စစ်', 'ဂေါက်ရောဂါ', 'အဆစ်ရောင်', 'Purine'],
    keyTakeaways: [
      'ကလီစာ (အသည်း၊ အမြစ်၊ ကျောက်ကပ်)၊ ပင်လယ်စာအချို့နှင့် ဘီယာ/အရက် လုံးဝရှောင်ပါ။',
      'မျှစ်၊ မှို၊ ပဲပုပ်၊ ကညွတ် တို့ကို အလွန်အကျွံ မစားပါနှင့်။',
      'ဗီတာမင် စီ (Vitamin C) ကြွယ်ဝသော ချဉ်ပေါက်သီးနှံများနှင့် ချယ်ရီသီးတို့သည် ယူရစ်အက်စစ် ကျဆင်းစေရန် အထောက်အကူပြုပါသည်။',
      'ရေများများသောက်ပေးခြင်းဖြင့် ပိုလျှံနေသော ယူရစ်အက်စစ်များကို ဆီးမှတစ်ဆင့် အမြန်စွန့်ထုတ်ပေးနိုင်သည်။'
    ],
    content: [
      'ဂေါက် (Gout) ရောဂါသည် သွေးတွင်း ယူရစ်အက်စစ်ဓာတ် များပြားလာပြီး အဆစ်များ (အထူးသဖြင့် ခြေမဆစ်) တွင် Crystal ပုံဆောင်ခဲများ စုပုံလာရာမှ ပြင်းထန်စွာ ရောင်ရမ်းနာကျင်ခြင်း ဖြစ်ပါသည်။',
      'အစားအသောက် စနစ်တကျ ထိန်းသိမ်းခြင်းနှင့် ရေလုံလောက်စွာ သောက်သုံးခြင်းဖြင့် ဂေါက်ရောဂါ ပြန်လည်ဖြစ်ပွားခြင်းကို ၈၀% အထိ လျှော့ချနိုင်ပါသည်။'
    ]
  },
  {
    id: 'art-06',
    title: 'သွေးတွင်းကိုလက်စထရော (Lipid Profile) နှင့် နှလုံးသွေးကြောကျဉ်းရောဂါ ကာကွယ်နည်း',
    category: 'heart',
    readingTime: '၄ မိနစ် ဖတ်ရန်',
    publishedDate: '၂၀၂၆ ခုနှစ် ဇန်နဝါရီလ',
    author: 'ဒေါက်တာခင်မောင်လွင် (နှလုံးအထူးကု ဆရာဝန်ကြီး)',
    summary: 'မကောင်းသော အဆီ (LDL) နှင့် Triglycerides လျှော့ချပြီး ကောင်းသောအဆီ (HDL) မြှင့်တင်ရန် နှလုံးကျန်းမာရေး လေ့ကျင့်ခန်းများနှင့် အိုမီဂါ-၃။',
    tags: ['နှလုံး', 'ကိုလက်စထရော', 'LDL/HDL', 'အဆီကျစေနည်း'],
    keyTakeaways: [
      'ကြော်လှော်ထားသော အစားအစာများနှင့် ထရန်ဆီ (Trans Fat) ပါသော မုန့်များကို ရှောင်ပါ။',
      'ငါးကြီးဆီ (Omega-3 fatty acids) နှင့် သံလွင်ဆီတို့ကို အသုံးပြုပါ။',
      'တစ်ပတ်လျှင် အနည်းဆုံး ၁၅၀ မိနစ် အေရိုးဗစ် (Aerobic) လေ့ကျင့်ခန်း ပြုလုပ်ပါ။',
      'ဆေးလိပ်နှင့် ဆေးရွက်ကြီး လုံးဝ ဖြတ်ရပါမည်။'
    ],
    content: [
      'သွေးတွင်း မကောင်းသောအဆီ (LDL) များပြားလာပါက သွေးကြောနံရံများတွင် အဆီချေး (Plaque) အဖြစ် စုပုံလာပြီး သွေးကြောကျဉ်းကာ ရုတ်တရက် နှလုံးတိုက်ခိုက်ခံရခြင်း (Heart Attack) သို့မဟုတ် လေဖြတ်ခြင်း (Stroke) ဖြစ်စေနိုင်ပါသည်။',
      'ပုံမှန် သွေးတွင်းအဆီ စစ်ဆေးခြင်း (Lipid Profile) ဖြင့် LDL ကို ၁၀၀ mg/dL အောက် ထိန်းထားသင့်ပါသည်။'
    ]
  }
];

export const HealthNewsModule: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<HealthArticle | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('bookmarked_articles');
    return saved ? JSON.parse(saved) : [];
  });
  const [copiedNotification, setCopiedNotification] = useState(false);

  const toggleBookmark = (id: string) => {
    let updated: string[];
    if (bookmarkedIds.includes(id)) {
      updated = bookmarkedIds.filter(b => b !== id);
    } else {
      updated = [...bookmarkedIds, id];
    }
    setBookmarkedIds(updated);
    localStorage.setItem('bookmarked_articles', JSON.stringify(updated));
  };

  const filteredArticles = useMemo(() => {
    return HEALTH_ARTICLES.filter(art => {
      const matchCat = selectedCategory === 'all' 
        ? true 
        : selectedCategory === 'bookmarked' 
        ? bookmarkedIds.includes(art.id)
        : art.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        art.title.toLowerCase().includes(q) || 
        art.summary.toLowerCase().includes(q) || 
        art.tags.some(t => t.toLowerCase().includes(q)) ||
        art.author.toLowerCase().includes(q);

      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery, bookmarkedIds]);

  const handleShare = (article: HealthArticle) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${article.title}\n\n${article.summary}\n\n- Family Health Track Medical Tips`);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-900/40 via-emerald-900/30 to-slate-900/50 border border-emerald-500/20 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>ယုံကြည်စိတ်ချရသော ဆေးပညာ ဗဟုသုတများ</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              ကျန်းမာရေး သတင်း & ဆေးပညာ ဗဟုသုတများ
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              သွေးတိုး၊ ဆီးချို၊ အသည်း၊ ကျောက်ကပ်၊ ယူရစ်အက်စစ်နှင့် နှလုံးကျန်းမာရေးအတွက် အထူးကုဆရာဝန်ကြီးများ၏ လမ်းညွှန်အကြံပြုချက်များ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedCategory('bookmarked')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                selectedCategory === 'bookmarked'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 text-amber-400 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              <Bookmark className="w-4 h-4 fill-current" />
              <span>မှတ်သားထားသည်များ ({bookmarkedIds.length})</span>
            </button>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="mt-6 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="ဆောင်းပါး၊ ရောဂါအမည် (သွေးတိုး၊ ဆီးချို၊ အသည်း)... ရှာရန်"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {[
              { id: 'all', label: 'အားလုံး' },
              { id: 'bp', label: 'သွေးတိုး' },
              { id: 'diabetes', label: 'ဆီးချို' },
              { id: 'liver', label: 'အသည်း' },
              { id: 'kidney', label: 'ကျောက်ကပ်' },
              { id: 'heart', label: 'နှလုံး' },
              { id: 'nutrition', label: 'ယူရစ်/အာဟာရ' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {copiedNotification && (
        <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>ဆောင်းပါး အချက်အလက်ကို Clipboard သို့ ကူးယူပြီးပါပြီ။</span>
        </div>
      )}

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-400">
          <BookOpen className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="text-sm font-semibold text-slate-300">ရှာဖွေမှုနှင့် ကိုက်ညီသော ဆောင်းပါး မရှိသေးပါ</p>
          <p className="text-xs text-slate-500 mt-1">အခြား အကြောင်းအရာ သို့မဟုတ် အမျိုးအစားကို ရွေးချယ်ကြည့်ပါ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredArticles.map((article) => {
            const isBookmarked = bookmarkedIds.includes(article.id);
            return (
              <div
                key={article.id}
                className="group p-5 rounded-3xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between shadow-lg hover:shadow-emerald-500/5 relative"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {article.category === 'bp' ? 'သွေးတိုး' :
                       article.category === 'diabetes' ? 'ဆီးချို' :
                       article.category === 'liver' ? 'အသည်း' :
                       article.category === 'kidney' ? 'ကျောက်ကပ်' :
                       article.category === 'heart' ? 'နှလုံး' : 'အာဟာရ/ကျန်းမာရေး'}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleBookmark(article.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isBookmarked 
                            ? 'text-amber-400 bg-amber-400/10' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                        title="မှတ်သားထားမည်"
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleShare(article)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        title="မျှဝေမည်"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 
                    onClick={() => setActiveArticle(article)}
                    className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors leading-snug cursor-pointer line-clamp-2"
                  >
                    {article.title}
                  </h3>

                  <p className="text-xs text-slate-400 mt-2.5 line-clamp-3 leading-relaxed">
                    {article.summary}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3.5">
                    {article.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{article.readingTime}</span>
                  </div>

                  <button
                    onClick={() => setActiveArticle(article)}
                    className="font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition-transform group-hover:translate-x-0.5"
                  >
                    <span>အပြည့်အစုံဖတ်ရန်</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Article Detail Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                    {activeArticle.category}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {activeArticle.publishedDate}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                  {activeArticle.title}
                </h2>
                <p className="text-xs text-emerald-400 font-medium">
                  ရေးသားသူ: {activeArticle.author}
                </p>
              </div>

              <button
                onClick={() => setActiveArticle(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Key Takeaways Box */}
            <div className="my-5 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-300 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>အဓိက လိုက်နာဆောင်ရွက်ရန် အချက်များ (Key Action Points):</span>
              </div>
              <ul className="space-y-1.5 text-slate-300">
                {activeArticle.keyTakeaways.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Full Article Content */}
            <div className="space-y-3.5 text-xs sm:text-sm text-slate-300 leading-relaxed max-h-72 overflow-y-auto pr-2">
              {activeArticle.content.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleBookmark(activeArticle.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    bookmarkedIds.includes(activeArticle.id)
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
                  }`}
                >
                  <Bookmark className="w-4 h-4 fill-current" />
                  <span>{bookmarkedIds.includes(activeArticle.id) ? 'မှတ်သားပြီး' : 'မှတ်သားမည်'}</span>
                </button>
                <button
                  onClick={() => handleShare(activeArticle)}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>မျှဝေမည်</span>
                </button>
              </div>

              <button
                onClick={() => setActiveArticle(null)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
              >
                ပိတ်မည်
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
