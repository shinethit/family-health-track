import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Phone, 
  AlertTriangle, 
  Flame, 
  Scissors, 
  Bug, 
  Heart, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Clock, 
  Activity, 
  Info,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const EmergencyFirstAidModule: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'bites' | 'burns' | 'cuts' | 'allergies' | 'cpr'>('bites');
  const [searchQuery, setSearchQuery] = useState('');

  // Search filter
  const matchesSearch = (text: string) => {
    if (!searchQuery.trim()) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Emergency Header Banner */}
      <div className="bg-gradient-to-r from-rose-700 via-red-700 to-amber-700 rounded-2xl p-5 sm:p-7 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-red-400/20 text-red-100 text-xs font-bold border border-red-300/30 flex items-center gap-1 animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5" /> Emergency First Aid Protocol
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              အရေးပေါ် ကျန်းမာရေးနှင့် ရှေးဦးပြုစုခြင်း (First Aid Guides)
            </h1>
            <p className="text-red-100 text-xs sm:text-sm mt-1 max-w-2xl">
              မြွေကိုက်၊ ခွေးကိုက်၊ အပူလောင်၊ ဓားရှ၊ ဓာတ်မတည့်ခြင်းနှင့် အသက်ရှူရပ်ခြင်းဆိုင်ရာ အချိန်မီ အရေးပေါ် ပြုစုနည်းလမ်းများ။
            </p>
          </div>

          {/* Rapid Emergency Call Buttons */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20 self-start md:self-auto">
            <a
              href="tel:192"
              className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Phone className="w-4 h-4 animate-bounce" /> 192 (လူနာတင်ယာဉ်)
            </a>
            <a
              href="tel:199"
              className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Phone className="w-4 h-4" /> 199 (ရဲတပ်ဖွဲ့)
            </a>
          </div>
        </div>
      </div>

      {/* Category Navigation Buttons */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
        <button
          onClick={() => setActiveCategory('bites')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeCategory === 'bites' ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Bug className="w-4 h-4 text-rose-500" /> အကောင်/တိရစ္ဆာန် ကိုက်ခြင်း
        </button>
        <button
          onClick={() => setActiveCategory('burns')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeCategory === 'burns' ? 'bg-orange-600 text-white shadow-xs' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Flame className="w-4 h-4 text-orange-500" /> အပူလောင်ခြင်း
        </button>
        <button
          onClick={() => setActiveCategory('cuts')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeCategory === 'cuts' ? 'bg-rose-700 text-white shadow-xs' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Scissors className="w-4 h-4 text-red-500" /> ဓားရှ/ဒဏ်ရာ သွေးထွက်ခြင်း
        </button>
        <button
          onClick={() => setActiveCategory('allergies')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeCategory === 'allergies' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-purple-500" /> ဓာတ်မတည့်မှုနှင့် အသက်ရှူရပ်ခြင်း
        </button>
        <button
          onClick={() => setActiveCategory('cpr')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeCategory === 'cpr' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Heart className="w-4 h-4 text-emerald-500" /> သီးခြင်း (Heimlich) & CPR
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. BITES & STINGS SECTION */}
      {/* ========================================================================= */}
      {activeCategory === 'bites' && (
        <div className="space-y-6">
          {/* Snakebite Emergency Protocol */}
          <div className="bg-white rounded-2xl border border-rose-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-rose-700 font-extrabold text-base pb-2 border-b border-rose-100">
              <Bug className="w-5 h-5" /> ၁။ မြွေကိုက်ခံရပါက အရေးပေါ် ရှေးဦးပြုစုနည်း (Snakebite First Aid)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* DOs */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                <p className="font-extrabold text-emerald-900 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> ပြုလုပ်ရမည့် အချက်များ (DOs)
                </p>
                <ul className="space-y-1.5 text-emerald-950 list-disc list-inside">
                  <li>လူနာအား စိတ်ငြိမ်အောင် ထားပါ (လှုပ်ရှားပါက မြွေဆိပ် ပိုမိုပြန့်နှံ့လွယ်သည်)။</li>
                  <li>အကိုက်ခံရသော ခြေ/လက် အဆစ်ကို မလှုပ်ရှားနိုင်အောင် ကျပ်စည်းထောက် ထားပေးပါ (Slab)။</li>
                  <li>လက်စွပ်၊ နာရီ၊ ခြေကျင်းဝတ်ပစ္စည်းများကို အမြန်ဆုံး ချွတ်ထားပါ။</li>
                  <li>မြွေဆိပ်ဖြေဆေး (Anti-venom) ရရှိနိုင်သော နီးစပ်ရာ ဆေးရုံကြီးသို့ အမြန်ဆုံး ပို့ဆောင်ပါ။</li>
                </ul>
              </div>

              {/* DON'Ts */}
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                <p className="font-extrabold text-rose-900 text-sm flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-600" /> မပြုလုပ်ရမည့် အချက်များ (DON'Ts)
                </p>
                <ul className="space-y-1.5 text-rose-950 list-disc list-inside">
                  <li>❌ ဒဏ်ရာကို ဓားဖြင့် မခွဲပါနှင့်၊ ပါးစပ်ဖြင့် မစုပ်ပါနှင့်။</li>
                  <li>❌ ဒဏ်ရာ အထက်တွင် ကြိုး သို့မဟုတ် သားရေကွင်း တင်းကျပ်စွာ မစည်းပါနှင့် (တစ်ရှူးပုပ်နိုင်သည်)။</li>
                  <li>❌ ဒဏ်ရာပေါ်သို့ ဆေးသောက်စရာ၊ အရက် သို့မဟုတ် တိုင်းရင်းဆေး မလိမ်းပါနှင့်။</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Dog / Cat Bite & Rabies Risk */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
            <h4 className="font-extrabold text-slate-900 text-sm">၂။ ခွေး/ကြောင် ကိုက်ခြစ်ခံရခြင်း (Dog/Cat Bite & Rabies Risk)</h4>
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
              <p className="font-bold text-amber-900">အရေးပေါ် ဆောင်ရွက်ရမည့် အဆင့်များ:</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-800">
                <li>ဒဏ်ရာကို စီးဆင်းနေသော ရေနွေးနွေးနှင့် ဆပ်ပြာသုံး၍ <strong>အနည်းဆုံး ၁၅ မိနစ်</strong> ကြာအောင် ချက်ချင်း ဆေးကြောပါ။</li>
                <li>ပိုးသတ်ဆေးရည် (Povidone-iodine / Betadine) လိမ်းပါ။</li>
                <li>ချက်ချင်း ဆေးရုံ/ဆေးခန်းသို့ သွား၍ ခွေးရူးပြန် ကာကွယ်ဆေး (Rabies Vaccine - Days 0, 3, 7, 14, 28) နှင့် မေးခိုင်ကာကွယ်ဆေး ထိုးနှံပါ။</li>
              </ol>
            </div>
          </div>

          {/* Bee / Scorpion / Centipede Stings */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
            <h4 className="font-extrabold text-slate-900 text-sm">၃။ ကင်းမြီးကောက်၊ ပျားနှင့် ပလူ ကိုက်ခြင်း (Scorpion / Bee Stings)</h4>
            <ul className="space-y-1.5 text-slate-700 list-disc list-inside bg-slate-50 p-3.5 rounded-xl">
              <li>ပျားတုပ်ပါက ပျားစူးဆူးတံကို ကတ်ပြား သို့မဟုတ် ဇာဂနာဖြင့် အမြန်ဆုံး ဖယ်ရှားပါ။</li>
              <li>ရေခဲဝတ် (Cold Compress) ၁၅ မိနစ်ခန့် ကပ်ပေးပါ (နာကျင်မှုနှင့် ရောင်ရမ်းမှု လျော့ကျစေရန်)။</li>
              <li>ယားယံပါက Antihistamine သောက်ဆေး သောက်သုံးနိုင်ပါသည်။</li>
            </ul>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. BURNS SECTION */}
      {/* ========================================================================= */}
      {activeCategory === 'burns' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-orange-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-orange-700 font-extrabold text-base pb-2 border-b border-orange-100">
              <Flame className="w-5 h-5" /> အပူလောင်ခြင်း ရှေးဦးပြုစုနည်း (Burn Injury Protocol)
            </div>

            <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-200 text-xs space-y-2">
              <p className="font-extrabold text-cyan-900 text-sm">💧 အဓိက သတိပြုရမည့် စည်းမျဉ်း: မိနစ် ၂၀ ရေအေး လောင်းပါ</p>
              <p className="text-slate-700">
                အပူလောင်သည်နှင့် အပူလောင်ရာနေရာကို စီးဆင်းနေသော ရေအေး (Running Tap Water) ဖြင့် <strong>မိနစ် ၂၀ ကြာအောင်</strong> ဆက်တိုက် လောင်းပေးပါ။
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="font-bold text-orange-800">၁st Degree (အရေပြားနီရဲရုံ):</p>
                <p className="text-slate-600">ရေအေးလောင်းပါ၊ Aloe Vera သို့မဟုတ် အပူလောင်ပျောက်ခရင်မ် လိမ်းပါ။</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="font-bold text-orange-800">၂nd Degree (ရေဖုထခြင်း):</p>
                <p className="text-slate-600">ရေဖုများကို မဖောက်ပါနှင့်၊ ပိုးသတ်ထားသော အဝတ်သန့် သို့မဟုတ် Gauze ဖြင့် ခပ်ဖွဖွ အုပ်ထားပါ။</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="font-bold text-orange-800">၃rd Degree (အရေပြားကျွမ်းခြင်း):</p>
                <p className="text-slate-600">အရေးပေါ် ဆေးရုံသို့ ချက်ချင်း သွားပါ။ ဒဏ်ရာပေါ် သွားတိုက်ဆေး သို့မဟုတ် ရေခဲ တိုက်ရိုက် မကပ်ပါနှင့်။</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CUTS & BLEEDING SECTION */}
      {/* ========================================================================= */}
      {activeCategory === 'cuts' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-red-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-red-700 font-extrabold text-base pb-2 border-b border-red-100">
              <Scissors className="w-5 h-5" /> ဓားရှ/ဒဏ်ရာနှင့် သွေးထွက်လွန်ခြင်း (Cuts & Severe Bleeding)
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-900">၁။ ဖိအားပေး၍ သွေးတိတ်အောင် ပြုလုပ်ခြင်း (Direct Pressure):</p>
                <p className="text-slate-700">ပိုးသတ်ထားသော Gauze သို့မဟုတ် အဝတ်သန့်ဖြင့် ဒဏ်ရာပေါ် အားထည့်၍ ၅ မိနစ် မှ ၁၀ မိနစ်ခန့် မဖယ်ဘဲ ဆက်တိုက် ဖိထားပါ။</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-900">၂။ ဒဏ်ရာကို မြှောက်ထားခြင်း (Elevation):</p>
                <p className="text-slate-700">သွေးထွက်နေသော ခြေ သို့မဟုတ် လက်ကို နှလုံး၏ အမြင့်ထက် ကျော်လွန်အောင် မြှောက်ထားပေးပါ (သွေးစီးဆင်းမှု လျော့ကျစေရန်)။</p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5">
                <p className="font-bold text-amber-900">၃။ မေးခိုင်ကာကွယ်ဆေး (Tetanus Shot) သတိပေးချက်:</p>
                <p className="text-slate-700">သံချေးတက်သော ပစ္စည်း သို့မဟုတ် ဖုန်အညစ်အကြေး ပါသော ဒဏ်ရာဖြစ်ပါက ၄၈ နာရီအတွင်း မေးခိုင်ကာကွယ်ဆေး ထိုးနှံရပါမည်။</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SEVERE ALLERGIES & ANAPHYLAXIS */}
      {/* ========================================================================= */}
      {activeCategory === 'allergies' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-purple-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-purple-700 font-extrabold text-base pb-2 border-b border-purple-100">
              <AlertTriangle className="w-5 h-5" /> ပြင်းထန် ဓာတ်မတည့်မှုနှင့် အသက်ရှူရပ်ခြင်း (Anaphylaxis)
            </div>

            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-2">
              <p className="font-extrabold text-rose-900 text-sm">⚠️ သတိပြုရမည့် အရေးပေါ် လက္ခဏာများ:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-800">
                <li>နှုတ်ခမ်း၊ လျှာနှင့် လည်ပင်း ရောင်ရမ်းလာခြင်း။</li>
                <li>အသက်ရှူရာတွင် တစီစီမြည်ခြင်း (Wheezing) နှင့် မောဟိုက်လာခြင်း။</li>
                <li>သွေးပေါင်ချိန် ထိက်နက်စွာ ထိုးကျပြီး သတိလစ်မေ့မြောခြင်း။</li>
              </ul>
            </div>

            <p className="text-xs font-bold text-slate-800">
              * အထက်ပါ လက္ခဏာများ ပေါ်ပေါက်ပါက အရေးပေါ် ဆေးရုံသို့ ချက်ချင်း ပို့ဆောင်ပါ သို့မဟုတ် EpiPen Auto-injector ရှိပါက ပေါင်ပြင်တွင် ချက်ချင်း ထိုးပေးပါ။
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CHOKING & CPR SECTION */}
      {/* ========================================================================= */}
      {activeCategory === 'cpr' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-base pb-2 border-b border-emerald-100">
              <Heart className="w-5 h-5" /> သီးခြင်း (Heimlich Maneuver) နှင့် CPR နှလုံးနှိုးဆွခြင်း
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="font-bold text-slate-900 text-sm">၁။ သီးခြင်း (Choking - Adult):</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-700">
                  <li>လူနာ၏ အနောက်မှ ရပ်၍ ခါးကို ဖက်ပါ။</li>
                  <li>လက်သီးဆုပ်ကို ချက်အထက်တွင် ထား၍ အပေါ်နှင့် အတွင်းသို့ အားစိုက်၍ ၅ ကြိမ် ဆောင့်တွန်းပါ။</li>
                </ol>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="font-bold text-slate-900 text-sm">၂။ CPR နှလုံးနှိုးဆွခြင်း စည်းဝါး (100-120 BPM):</p>
                <p className="text-slate-700">
                  ရင်ဘတ်အလယ် အစုတ်ရိုးပေါ်တွင် လက်နှစ်ဖက် ထပ်၍ ၁ မိနစ်လျှင် အကြိမ် ၁၀၀-၁၂၀ နှုန်း (၃၀ ကြိမ် ဖိပြီး ၂ ကြိမ် အသက်ရှူသွင်း) စည်းဝါးမှန်စွာ ဖိပေးပါ။
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
