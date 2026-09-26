import React, { useState } from 'react';
import { 
  Utensils, 
  CheckCircle2, 
  XCircle, 
  Droplet, 
  Heart, 
  Activity, 
  Droplets, 
  Sparkles, 
  Apple, 
  Flame,
  Check
} from 'lucide-react';
import { DietRecommendation } from '../../types/health';

const DIET_GUIDES: DietRecommendation[] = [
  {
    category: 'hypertension',
    titleMm: 'သွေးတိုး ရောဂါရှင်များအတွက် DASH Diet အာဟာရ လမ်းညွှန်',
    subtitleMm: 'သွေးပေါင်ချိန်ကို သဘာဝအတိုင်း ထိန်းညှိပေးနိုင်သော စားသောက်ဖွယ်ရာများ',
    recommendedFoods: [
      'ပိုတက်စီယမ် ကြွယ်ဝသော ငှက်ပျောသီး၊ သီးစုံ၊ ဟင်းနုနွယ်၊ ကန်စွန်းရွက်',
      'ကြက်သွန်ဖြူ၊ ဂျင်းနှင့် သဘာဝ ဟင်းခတ်အမွှေးအကြိုင်များ',
      'ဆီနည်းသော ဟင်းသီးဟင်းရွက် စူပါစွပ်ပြုတ်များ',
      'အဆီထုတ်ထားသော နို့နှင့် ဒိန်ချဉ်',
      'အစေ့အဆန်များ (ဖရုံစေ့၊ နှမ်းစေ့၊ ဗာဒံစေ့)'
    ],
    foodsToAvoid: [
      'ငံပြာရည်၊ ငါးပိရည်၊ ငံပြာရည်ချက် နှင့် ဆားအလွန်ကဲသော အစားအစာများ (တစ်နေ့လျှင် ဆား ၁ လက်ဖက်ရည်ဇွန်းထက် မပိုရ)',
      'အချိုမှုန့် (MSG) နှင့် ကြက်သားမှုန့်များ',
      'တာရှည်ခံ အစားအစာများ၊ ဝက်ပေါင်ခြောက်နှင့် တင်းပုတ်များ',
      'အကြော်အလှော်၊ ဝက်သားသုံးထပ်သားနှင့် ပြည့်ဝဆီများ'
    ],
    myanmarMealTips: [
      'ဟင်းချက်ရာတွင် ငံပြာရည်အစား ကြက်သွန်ဖြူ၊ သံပရာသီး သဘာဝအချဉ်နှင့် ငရုတ်ကောင်းကို သုံးပါ။',
      'ငါးပိရည် တို့စရာ စားသုံးပါက ငါးပိကို ဆားလျှော့ချက်ပြီး တို့စရာ အသီးအရွက် ပိုမိုစားသုံးပါ။'
    ],
    recommendedHydrationLiters: 2.5
  },
  {
    category: 'diabetes',
    titleMm: 'ဆီးချို ရောဂါရှင်များအတွက် Glycemic Index နည်းသော အာဟာရ',
    subtitleMm: 'သွေးတွင်းသကြားဓာတ် မတက်စေရန် ထမင်းနှင့် အချိုဓာတ် ထိန်းညှိနည်း',
    recommendedFoods: [
      'လုံးတိုဆန်၊ ကောက်ညှင်းမဟုတ်သော ဆန်ကြမ်း သို့မဟုတ် စုစုပေါင်း ထမင်း ၁ ကန်စွန်းဇွန်း စာပမာဏ',
      'အခွံပါ အသီးအနှံများ (ပန်းသီး၊ မာလကာသီး၊ သီးသင်္ဘော)',
      'ပဲအမျိုးမျိုး (ပဲရာဇာ၊ ပဲနီလေး၊ ပဲပြုတ်)',
      'ငါး၊ ကြက်ရင်ပုံသားနှင့် ဥအမျိုးမျိုး',
      'သခွားသီး၊ ခရမ်းချဉ်သီး၊ ရေကန်စွန်း'
    ],
    foodsToAvoid: [
      'အချိုရည်များ၊ ကြံရည်၊ ကာဗိုဟိုက်ဒရိတ် မြင့်မားသော သကြားလုံးများ',
      'ဒူရင်းသီး၊ သရက်သီးမှည့်၊ မက္ကနိုနှင့် အချိုကဲသော သစ်သီးများ',
      'ထမင်းဖြူ အလွန်အကျွံ စားသုံးခြင်း (တစ်နပ်လျှင် ပန်းကန်လုံး ၁ လုံးထက် မပိုရ)',
      'မုန့်ဟင်းခါး ဖတ်၊ ခေါက်ဆွဲနှင့် ပေါင်မုန့်ဖြူများ'
    ],
    myanmarMealTips: [
      'ထမင်းမစားမီ ဟင်းသီးဟင်းရွက် သို့မဟုတ် ဟင်းချိုရည်ကို ဦးစွာ သောက်သုံးပါက သွေးသကြားတက်ခြင်းကို နှေးကွေးစေပါသည်။',
      'ထမင်းထဲတွင် ပဲပြုတ် သို့မဟုတ် ပြောင်းဖူး နည်းနည်း ရောချက် စားသုံးပါ။'
    ],
    recommendedHydrationLiters: 2.5
  },
  {
    category: 'kidney',
    titleMm: 'ကျောက်ကပ်နှင့် အသည်း ကျန်းမာရေးအတွက် အာဟာရ',
    subtitleMm: 'ကျောက်ကပ် နှင့် အသည်း လုပ်ဆောင်ချက် ဝန်မပိစေရန် ထိန်းသိမ်းရမည့် အချက်များ',
    recommendedFoods: [
      'ကြက်ဥအကာ (Egg whites) သန့်သန့်',
      'ပန်းဂေါ်ဖီစိမ်း၊ ဂေါ်ဖီထုတ်၊ ခရမ်းချဉ်သီး',
      'သန့်ရှင်းဆင်ကြယ်သော ရေနွေးကျက်အေး',
      'ဆီနည်းသော ငါးနှင့် ကြက်သား'
    ],
    foodsToAvoid: [
      'အစိမ်းရောင် ရင့်သော ဟင်းသီးဟင်းရွက် အလွန်အကျွံ စားခြင်း (ပိုတက်စီယမ် မြင့်မားပါက ကျောက်ကပ်အတွက် သတိပြုရန်)',
      'အနီရောင်အသား (ဝက်သား၊ အမဲသား) အလွန်အကျွံ စားခြင်း',
      'ဆေးဝါးနှင့် ဓာတုဓာတ်စိမ်းများ အလွန်အကျွံ သောက်သုံးခြင်း',
      'အရက်၊ ဘီယာ နှင့် ဆေးလိပ်'
    ],
    myanmarMealTips: [
      'ကျောက်ကပ် စစ်ဆေးချက် Creatinine မြင့်နေပါက ဆရာဝန် ညွှန်ကြားသည့် ပရိုတင်း ပမာဏအတိုင်းသာ စားသုံးပါ၊'
    ],
    recommendedHydrationLiters: 2.0
  }
];

export const ClinicalDietModule: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'hypertension' | 'diabetes' | 'kidney'>('hypertension');
  const [waterDrunkGlasses, setWaterDrunkGlasses] = useState(4);

  const activeGuide = DIET_GUIDES.find(g => g.category === selectedCategory) || DIET_GUIDES[0];

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-6 rounded-3xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs shrink-0">
            <Utensils className="w-8 h-8 text-emerald-200" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">ရောဂါအလိုက် အာဟာရနှင့် စားသောက်ဖွယ်ရာ လမ်းညွှန် (Dietary & Nutrition Guide)</h2>
            <p className="text-xs text-emerald-100 mt-1">
              သွေးတိုး၊ ဆီးချို နှင့် နာတာရှည်ရောဂါများအတွက် မြန်မာ့ရိုးရာ အစားအစာများကို ကျန်းမာရေးနှင့် ညီညွတ်စွာ စားသုံးနည်း
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl backdrop-blur-xs shrink-0">
          <Sparkles className="w-5 h-5 text-amber-300 animate-bounce" />
          <span className="text-xs font-bold text-emerald-100">DASH & GI Certified</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setSelectedCategory('hypertension')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            selectedCategory === 'hypertension'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>သွေးတိုး ရောဂါရှင် (DASH Diet)</span>
        </button>

        <button
          onClick={() => setSelectedCategory('diabetes')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            selectedCategory === 'diabetes'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Droplet className="w-4 h-4" />
          <span>ဆီးချို ရောဂါရှင် (Low GI Diet)</span>
        </button>

        <button
          onClick={() => setSelectedCategory('kidney')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            selectedCategory === 'kidney'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>ကျောက်ကပ်/အသည်း အာဟာရ</span>
        </button>
      </div>

      {/* Water Hydration Tracker Card */}
      <div className="bg-sky-50 border border-sky-200 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-500 text-white rounded-2xl shadow-xs">
            <Droplet className="w-6 h-6 fill-white" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-sky-950">နေ့စဉ် ရေလုံလောက်စွာ သောက်သုံးမှု စစ်ဆေးရန်</h3>
            <p className="text-xs text-sky-800 mt-0.5">
              တစ်နေ့လျှင် ရေ (၈) ခွက် သို့မဟုတ် {activeGuide.recommendedHydrationLiters} လီတာ သောက်သုံးပေးရန် အကြံပြုပါသည်
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((glass) => (
              <button
                key={glass}
                onClick={() => setWaterDrunkGlasses(glass)}
                className={`w-7 h-9 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                  glass <= waterDrunkGlasses
                    ? 'bg-sky-500 border-sky-600 text-white font-bold'
                    : 'bg-white border-sky-200 text-sky-300'
                }`}
                title={`ရေ ${glass} ခွက်မြောက်`}
              >
                <Droplet className="w-3.5 h-3.5 fill-current" />
              </button>
            ))}
          </div>

          <span className="text-xs font-bold text-sky-900 ml-2">
            {waterDrunkGlasses} / 8 ခွက်
          </span>
        </div>
      </div>

      {/* Recommended vs Avoid Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Foods */}
        <div className="bg-emerald-50/50 border border-emerald-200 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-900 border-b border-emerald-200 pb-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <h3 className="text-base font-bold">စားသုံးရန် အကြံပြုသော အစားအစာများ</h3>
              <p className="text-xs text-emerald-700">ကျန်းမာရေးအတွက် သင့်တော်ပြီး သွေးတိုး/ဆီးချို ထိန်းပေးနိုင်ပါသည်</p>
            </div>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-800 font-medium">
            {activeGuide.recommendedFoods.map((food, i) => (
              <li key={i} className="flex items-start gap-2 bg-white p-3 rounded-2xl border border-emerald-100 shadow-2xs">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{food}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Foods to Avoid */}
        <div className="bg-rose-50/50 border border-rose-200 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-rose-900 border-b border-rose-200 pb-3">
            <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
            <div>
              <h3 className="text-base font-bold">ရှောင်ကြဉ်ရမည့် သို့မဟုတ် လျှော့စားရမည့် အစားအစာများ</h3>
              <p className="text-xs text-rose-700">သွေးပေါင်ချိန်နှင့် သွေးသကြားဓာတ် ရုတ်တရက် တက်စေနိုင်ပါသည်</p>
            </div>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-800 font-medium">
            {activeGuide.foodsToAvoid.map((food, i) => (
              <li key={i} className="flex items-start gap-2 bg-white p-3 rounded-2xl border border-rose-100 shadow-2xs">
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{food}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Myanmar Meal Cooking Tips */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 space-y-3">
        <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
          <Utensils className="w-5 h-5 text-amber-700" />
          <span>မြန်မာ့ရိုးရာ ဟင်းလျာများ ချက်ပြုတ်ရာတွင် သတိပြုရန် အကြံပြုချက်များ</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-800">
          {activeGuide.myanmarMealTips.map((tip, i) => (
            <div key={i} className="bg-white p-3.5 rounded-2xl border border-amber-200 font-medium leading-relaxed">
              💡 {tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
