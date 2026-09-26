import React, { useState } from 'react';
import { 
  Sparkles, 
  Sun, 
  ShieldCheck, 
  AlertTriangle, 
  Droplets, 
  Flame, 
  CheckCircle2, 
  HelpCircle, 
  Search, 
  FileText,
  Info,
  ChevronRight,
  Heart
} from 'lucide-react';

export const DermatologyModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'quiz' | 'abcde' | 'conditions' | 'climate'>('quiz');

  // --- SKIN TYPE QUIZ STATE ---
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizResult, setQuizResult] = useState<string | null>(null);

  const quizQuestions = [
    {
      id: 1,
      question: 'မျက်နှာသစ်ပြီး ၁၅ မိနစ်ခန့်အကြာတွင် မည်သို့ ခံစားရပါသလဲ။',
      options: [
        { label: 'တင်းကျပ်ပြီး ခြောက်သွေ့နေသည်', type: 'dry' },
        { label: 'T-Zone (နဖူး၊ နှာခေါင်း) တွင် ဆီပြန်နေသည်', type: 'combination' },
        { label: 'မျက်နှာတစ်ခုလုံး ဆီပြန်ပြီး ပြောင်လက်နေသည်', type: 'oily' },
        { label: 'နီရဲပြီး ယားယံစပ်ဖျင်းဖျင်း ခံစားရသည်', type: 'sensitive' },
        { label: 'မခြောက်မပြောင်ဘဲ သက်သောင့်သက်သာရှိသည်', type: 'normal' }
      ]
    },
    {
      id: 2,
      question: 'ဝက်ခြံ သို့မဟုတ် အဖုအပိန့် ပေါ်ပေါက်လေ့ရှိသည့် အကြိမ်အရေအတွက်',
      options: [
        { label: 'အလွန်ရှားပါးသည် သို့မဟုတ် မရှိသလောက်ဖြစ်သည်', type: 'dry' },
        { label: 'နဖူးနှင့် နှာခေါင်းဝန်းကျင်တွင်သာ မကြာခဏ ဖြစ်သည်', type: 'combination' },
        { label: 'ပါး၊ နဖူး၊ မေးစေ့ တစ်ခုလုံးတွင် ပုံမှန် ပေါ်လေ့ရှိသည်', type: 'oily' },
        { label: 'အလှကုန်အသစ် သုံးလိုက်သည်နှင့် ချက်ချင်း သွေးနီဖုထွက်သည်', type: 'sensitive' }
      ]
    },
    {
      id: 3,
      question: 'ချွေးပေါက်များ၏ ပမာဏ သတိထားမိပုံ',
      options: [
        { label: 'ချွေးပေါက်များ သေးငယ်ပြီး တင်းရင်းနေသည်', type: 'dry' },
        { label: 'နှာခေါင်းနှင့် ပါးပြင် အလယ်တွင်သာ ချွေးပေါက်ကျယ်သည်', type: 'combination' },
        { label: 'မျက်နှာတစ်ခုလုံး ချွေးပေါက်များ ထင်ရှားစွာ ကျယ်နေသည်', type: 'oily' },
        { label: 'နီရဲသော သွေးကြောမျှင်များ ထင်ရှားနေသည်', type: 'sensitive' }
      ]
    }
  ];

  const calculateSkinType = () => {
    const counts: Record<string, number> = {};
    Object.values(quizAnswers).forEach(val => {
      counts[val] = (counts[val] || 0) + 1;
    });
    let topType = 'normal';
    let max = 0;
    Object.entries(counts).forEach(([k, v]) => {
      if (v > max) {
        max = v;
        topType = k;
      }
    });
    setQuizResult(topType);
  };

  // --- MOLE ABCDE STATE ---
  const [abcde, setAbcde] = useState({
    asymmetry: false, // A
    border: false,    // B
    color: false,     // C
    diameter: false,  // D
    evolving: false   // E
  });

  const abcdeRiskCount = Object.values(abcde).filter(Boolean).length;

  // --- COMMON SKIN CONDITIONS DIRECTORY ---
  const [searchTerm, setSearchTerm] = useState('');
  const skinConditions = [
    {
      id: 'acne',
      nameMm: 'ဝက်ခြံ (Acne Vulgaris)',
      category: 'အဆီဂလင်း ရောင်ရမ်းခြင်း',
      symptoms: 'နဖူး၊ ပါး၊ မေးစေ့တွင် အဆီဖု၊ ထိလိုက်ပါက နာကျင်သော အနီဖု သို့မဟုတ် ပြည်ဖုများ ပေါ်ထွက်ခြင်း။',
      triggers: 'အဆီပြန်ခြင်း၊ ဟော်မုန်းအပြောင်းအလဲ၊ မိတ်ကပ်မသန့်ရှင်းခြင်း၊ မြန်မာနိုင်ငံ၏ ပူအိုက်စိုစွတ်သော ရာသီဥတု။',
      treatment: 'Salicylic Acid သို့မဟုတ် Benzoyl Peroxide ပါသော သစ်ဆေးသုံးပါ။ လက်ဖြင့် ညှစ်ခြင်း ရှောင်ကြဉ်ပါ။',
      warning: 'ပြည်ဖုများ အလွန်များပြားပါက အရေပြားဆရာဝန်နှင့် ပြသ၍ Isotretinoin သို့မဟုတ် ပဋိဇီဝဆေး သောက်ရန် လိုအပ်ပါသည်။'
    },
    {
      id: 'eczema',
      nameMm: 'ကြက်သားအရေပြား / ဓာတ်မတည့် ယားယံစက် (Atopic Eczema)',
      category: 'အရေပြား ဓာတ်မတည့်မှု',
      symptoms: 'အရေပြား အလွန်ခြောက်သွေ့ခြင်း၊ နီရဲယားယံခြင်း၊ စက်ဝိုင်းပုံ ကွက်များဖြစ်ပြီး ကုတ်ပါက အကြေးခွံကွာခြင်း။',
      triggers: 'ဓာတုပစ္စည်း ပြင်းထန်သော ဆပ်ပြာ၊ ဖုန်မှုန့်၊ ရာသီဥတု အအေးလွန်ခြင်း၊ အမွှေးနံ့သာများ။',
      treatment: 'အမွှေးနံ့မပါသော အစိုဓာတ်ထိန်းခရင်မ် (Moisturizer) ပုံမှန်လိမ်းပါ၊ ဆပ်ပြာနုနု သုံးပါ။',
      warning: 'ကုတ်ဖဲ့ရာမှ ပိုးဝင်ပြီး ပြည်ယိုပါက ပဋိဇီဝဆေး လိမ်းဆေး လိုအပ်ပါသည်။'
    },
    {
      id: 'fungal',
      nameMm: 'ပွေး၊ ညှင်း၊ ခရုသင်း (Fungal Infections / Tinea)',
      category: 'မှိုပိုး ကူးစက်ခြင်း',
      symptoms: 'ရင်ဘတ်၊ ကျော၊ ပေါင်ခြံများတွင် အဖြူကွက်၊ အနီကွက် သို့မဟုတ် အနားသတ်နီရဲသော စက်ဝိုင်းပုံ ကွက်များ ယားယံခြင်း။',
      triggers: 'ချွေးထွက်လွန်ခြင်း၊ စိုစွတ်သော အဝတ်အစား ကြာရှည်ဝတ်ဆင်ခြင်း၊ သူတစ်ပါး တဘက်/အဝတ်အစား မျှဝေသုံးစွဲခြင်း။',
      treatment: 'Ketoconazole သို့မဟုတ် Clotrimazole မှိုသတ်လိမ်းဆေး မနက်/ည ၂ သီတင်း မှန်မှန်လိမ်းပါ။',
      warning: 'မှိုသတ်ဆေး လိမ်းသော်လည်း မသက်သာပါက မှိုသတ်သောက်ဆေးအတွက် ဆရာဝန်နှင့် တိုင်ပင်ပါ။'
    },
    {
      id: 'hives',
      nameMm: 'အပူဖု / အသင်းအပင်း / ဓာတ်မတည့် အဖုအပိန့် (Urticaria / Hives)',
      category: 'အလာဂျီ တုံ့ပြန်မှု',
      symptoms: 'တစ်ကိုယ်လုံးတွင် ခြင်ကိုက်သကဲ့သို့ ဖောင်းကြွနီရဲပြီး အလွန်ယားယံသော အဖုများ ရုတ်တရက် ပေါ်ပေါက်လာခြင်း။',
      triggers: 'ပင်လယ်စာ၊ ဥ၊ ဆေးဝါးများ၊ အင်းဆက်ကိုက်ခြင်း၊ အပူလွန်/အအေးလွန်ခြင်း။',
      treatment: 'Antihistamine (Cetirizine / Loratadine) သောက်ဆေး၊ ရေအေးဝတ် ကပ်ပေးပါ။',
      warning: 'နှုတ်ခမ်း၊ လျှာ ရောင်ရမ်းပြီး အသက်ရှူရပ်လာပါက (Anaphylaxis) အရေးပေါ် ဆေးရုံသို့ ချက်ချင်းသွားပါ။'
    }
  ];

  const filteredConditions = skinConditions.filter(c => 
    c.nameMm.includes(searchTerm) || c.symptoms.includes(searchTerm)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Dermatology Banner */}
      <div className="bg-gradient-to-r from-rose-700 via-pink-700 to-purple-800 rounded-2xl p-5 sm:p-7 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-400/20 text-rose-200 text-xs font-bold border border-rose-300/30 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Dermatology & Beauty Health
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              အရေပြား ကျန်းမာရေးနှင့် မြန်မာ့ရာသီဥတု အလှအပ ထိန်းသိမ်းနည်း
            </h1>
            <p className="text-rose-100 text-xs sm:text-sm mt-1 max-w-2xl">
              အမျိုးအစားအလိုက် အရေပြား ထိန်းသိမ်းနည်း၊ မှဲ့နှင့် အဖုအပိန့် ကင်ဆာသတိပေးစနစ် ABCDE၊ ဝက်ခြံနှင့် မှိုပိုး ကုသနည်းများ။
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-xl border border-white/20 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'quiz' ? 'bg-white text-rose-900 shadow-sm' : 'text-white hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-4 h-4 text-rose-500" /> အရေပြား အမျိုးအစား
            </button>
            <button
              onClick={() => setActiveTab('abcde')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'abcde' ? 'bg-white text-rose-900 shadow-sm' : 'text-white hover:bg-white/10'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" /> မှဲ့ ABCDE စစ်ဆေးမှု
            </button>
            <button
              onClick={() => setActiveTab('conditions')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'conditions' ? 'bg-white text-rose-900 shadow-sm' : 'text-white hover:bg-white/10'
              }`}
            >
              <FileText className="w-4 h-4 text-pink-300" /> ရောဂါများ
            </button>
            <button
              onClick={() => setActiveTab('climate')}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'climate' ? 'bg-white text-rose-900 shadow-sm' : 'text-white hover:bg-white/10'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-300" /> မြန်မာ့ရာသီ Skincare
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SKIN TYPE QUIZ TAB */}
      {/* ========================================================================= */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <Sparkles className="w-5 h-5 text-rose-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">မိမိ အရေပြား အမျိုးအစား စစ်ဆေးခြင်း (Skin Type Quiz)</h3>
                <p className="text-slate-500 text-xs">အောက်ပါ မေးခွန်းများကို ဖြေဆို၍ သင့်လျော်သော Skincare စနစ်ကို ရယူပါ</p>
              </div>
            </div>

            {!quizResult ? (
              <div className="space-y-5">
                {quizQuestions.map((q) => (
                  <div key={q.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <p className="font-bold text-slate-800 text-xs sm:text-sm">{q.id}။ {q.question}</p>
                    <div className="space-y-1.5">
                      {q.options.map((opt, i) => (
                        <label
                          key={i}
                          className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                            quizAnswers[q.id] === opt.type
                              ? 'bg-rose-50 border-rose-400 text-rose-900 font-bold'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q_${q.id}`}
                            value={opt.type}
                            checked={quizAnswers[q.id] === opt.type}
                            onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: opt.type })}
                            className="text-rose-600 focus:ring-rose-500"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                  onClick={calculateSkinType}
                  className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
                >
                  အဖြေကြည့်ရှုမည် ✨
                </button>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                  <Heart className="w-8 h-8 fill-rose-500" />
                </div>

                <div>
                  <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-rose-100 text-rose-800">
                    စစ်ဆေးတွေ့ရှိချက်
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                    {quizResult === 'dry' ? 'အရေပြား ခြောက်သွေ့သူ (Dry Skin)' :
                     quizResult === 'oily' ? 'အဆီပြန် အရေပြား (Oily Skin)' :
                     quizResult === 'combination' ? 'အဆီနှင့်ခြောက်သွေ့ ရောနှော အရေပြား (Combination Skin)' :
                     quizResult === 'sensitive' ? 'ဓာတ်မတည့်လွယ်သော အရေပြား (Sensitive Skin)' : 'ပုံမှန် အရေပြား (Normal Skin)'}
                  </h3>
                </div>

                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950 text-left space-y-2 max-w-xl mx-auto">
                  <p className="font-bold">အကြံပြု Skincare အစီအစဉ်:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {quizResult === 'dry' && (
                      <>
                        <li>Cream သို့မဟုတ် Lotion ပုံစံ အစိုဓာတ်ထိန်းဆေး (Moisturizer) ထူထူ လိမ်းပေးပါ။</li>
                        <li>Hyaluronic Acid ပါဝင်သော စီရမ် အသုံးပြုပါ။</li>
                        <li>ရေပူလွန်းသော ရေချိုးခြင်း ရှောင်ကြဉ်ပါ။</li>
                      </>
                    )}
                    {quizResult === 'oily' && (
                      <>
                        <li>Gel-based သို့မဟုတ် Light Lotion အဆီမပါသော Moisturizer သုံးပါ။</li>
                        <li>Salicylic Acid (BHA) ပါသော သစ်ဆေးဖြင့် တစ်နေ့ ၂ ကြိမ် သစ်ပါ။</li>
                        <li>Non-comedogenic (ချွေးပေါက်မပိတ်သော) Sunscreen ကို မဖြစ်မနေ လိမ်းပါ။</li>
                      </>
                    )}
                    {quizResult === 'combination' && (
                      <>
                        <li>T-Zone (နဖူး/နှာခေါင်း) တွင် Gentle BHA နှင့် ပါးပြင်တွင် Moisturizer ဂရုစိုက် လိမ်းပါ။</li>
                        <li>ပေါ့ပါးသော Sunscreen Lotion အမျိုးအစား ရွေးချယ်ပါ။</li>
                      </>
                    )}
                    {quizResult === 'sensitive' && (
                      <>
                        <li>အမွှေးနံ့သာ (Fragrance)၊ အရက်ပြန် (Alcohol) နှင့် ပါရာဘင် မပါသော သစ်ဆေး သုံးပါ။</li>
                        <li>Mineral/Physical Sunscreen (Zinc Oxide ပါဝင်သော) ကို အသုံးပြုပါ။</li>
                      </>
                    )}
                  </ul>
                </div>

                <button
                  onClick={() => {
                    setQuizAnswers({});
                    setQuizResult(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  ပြန်လည်စစ်ဆေးမည်
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MOLE ABCDE CHECKER TAB */}
      {/* ========================================================================= */}
      {activeTab === 'abcde' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs max-w-3xl mx-auto space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">မှဲ့နှင့် အရေပြားအဖု ကင်ဆာသတိပေးစနစ် (ABCDE Criteria)</h3>
                <p className="text-slate-500 text-xs">မိမိခန္ဓာကိုယ်ပေါ်မှ မှဲ့ သို့မဟုတ် အဖုအပိန့်များကို စစ်ဆေးပါ</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { key: 'asymmetry', letter: 'A', title: 'Asymmetry (မညီညာခြင်း)', desc: 'မှဲ့၏ တစ်ဝက်နှင့် အခြားတစ်ဝက်သည် ပုံသဏ္ဌာန် မညီမညာဖြစ်နေခြင်း။' },
                { key: 'border', letter: 'B', title: 'Border (အနားသတ် မညီခြင်း)', desc: 'မှဲ့၏ အနားသတ်သည် ချောမွေ့မှုမရှိဘဲ ခိုဝင်/ထွက်နေခြင်း။' },
                { key: 'color', letter: 'C', title: 'Color (အရောင်မညီခြင်း)', desc: 'အနက်၊ အညို၊ အနီ သို့မဟုတ် အပြာရောင် ရောနှောနေခြင်း။' },
                { key: 'diameter', letter: 'D', title: 'Diameter (အရွယ်အစားကြီးခြင်း)', desc: 'မှဲ့၏ အချင်းသည် ၆ မီလီမီတာ (ခဲတံထိပ် ရာဘာပမာဏ) ထက် ကြီးမားခြင်း။' },
                { key: 'evolving', letter: 'E', title: 'Evolving (ပြောင်းလဲလာခြင်း)', desc: 'မှဲ့သည် ရက်သတ္တပတ်အတွင်း အရွယ်အစား၊ ပုံသဏ္ဌာန်၊ အရောင် သို့မဟုတ် သွေးထွက်ယားယံမှု ပြောင်းလဲလာခြင်း။' }
              ].map(item => (
                <label
                  key={item.key}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all cursor-pointer ${
                    (abcde as any)[item.key]
                      ? 'bg-rose-50 border-rose-400 text-rose-950 font-bold'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={(abcde as any)[item.key]}
                    onChange={(e) => setAbcde({ ...abcde, [item.key]: e.target.checked })}
                    className="mt-0.5 text-rose-600 focus:ring-rose-500 rounded"
                  />
                  <div>
                    <span className="font-extrabold text-xs text-rose-700 mr-2">{item.letter} - {item.title}</span>
                    <p className="text-slate-600 font-normal mt-0.5">{item.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className={`p-4 rounded-xl border text-xs font-bold ${
              abcdeRiskCount >= 2 
                ? 'bg-rose-100 border-rose-300 text-rose-900' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>စစ်ဆေးတွေ့ရှိချက် တိကျမှု: {abcdeRiskCount} / 5 အချက် သတိပြုမိသည်</span>
              </div>
              <p className="font-normal text-slate-700 mt-1">
                {abcdeRiskCount >= 2 
                  ? 'သတိပေးချက်- အချက် ၂ ချက်နှင့်အထက် ကိုက်ညီပါက အရေပြားအထူးကု ဆရာဝန်ကြီးနှင့် မှန်ဘီလူး (Dermoscopy) ဖြင့် သေချာစွာ စစ်ဆေးသင့်ပါသည်။'
                  : 'လက်ရှိတွင် စိုးရိမ်ဖွယ်ရာ လက္ခဏာ မတွေ့ရှိပါ။ သို့ရာတွင် မှဲ့များ ရုတ်တရက် ကြီးထွားလာပါက ဆရာဝန်နှင့် ပြသပါ။'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. COMMON SKIN CONDITIONS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'conditions' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">အဖြစ်များသော အရေပြား ရောဂါများနှင့် ကုသနည်း</h3>
                <p className="text-slate-500 text-xs">ဝက်ခြံ၊ ပွေး၊ ညှင်း၊ ဓာတ်မတည့်မှုနှင့် အပူဖုများ</p>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="ရောဂါအမည် ရှာရန်..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-rose-500 w-full sm:w-56"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredConditions.map(item => (
                <div key={item.id} className="p-4 rounded-xl border border-slate-200 hover:border-rose-300 transition-all bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-slate-900 text-sm">{item.nameMm}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                      {item.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700">
                    <strong>လက္ခဏာများ:</strong> {item.symptoms}
                  </p>
                  <p className="text-xs text-slate-600">
                    <strong>ဖြစ်ပွားစေသောအကြောင်း:</strong> {item.triggers}
                  </p>
                  <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-950 text-xs font-semibold">
                    💡 <strong>ပြုစုကုသနည်း:</strong> {item.treatment}
                  </div>
                  <div className="p-2.5 rounded-lg bg-rose-50 text-rose-950 text-[11px]">
                    ⚠️ <strong>သတိပေးချက်:</strong> {item.warning}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MYANMAR CLIMATE SKINCARE TAB */}
      {/* ========================================================================= */}
      {activeTab === 'climate' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                <Sun className="w-5 h-5" /> မြန်မာ့နွေရာသီ နေရောင်ခြည် (UV) ကာကွယ်ရေး
              </div>
              <p className="text-xs text-slate-600">
                မြန်မာနိုင်ငံတွင် နွေရာသီ၌ UV Index သည် 11+ (Extreme Risk) အထိ ရောက်ရှိတတ်သဖြင့် နေလောင်ခြင်းနှင့် တင်းတိပ်များ မဖြစ်အောင် Sunscreen SPF 50+ PA++++ ကို နံနက်တိုင်း လိမ်းရန် လိုအပ်ပါသည်။
              </p>
              <ul className="text-xs space-y-1.5 text-slate-700 list-disc list-inside bg-slate-50 p-3 rounded-xl">
                <li>အပြင်မထွက်မီ မိနစ် ၂၀ ကြိုတင်၍ နေလောင်ကာခရင်မ် လိမ်းပါ။</li>
                <li>လက်နှစ်ချောင်းစာ (Two-finger rule) ပမာဏ လုံလောက်စွာ သုံးပါ။</li>
                <li>အပြင်တွင် ၂ နာရီကျော် ကြာပါက ထပ်မံ လိမ်းပေးပါ။</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <Droplets className="w-5 h-5" /> မိုးရာသီ/စိုစွတ်မှုနှင့် မှိုပိုးမဖြစ်အောင် ထိန်းသိမ်းနည်း
              </div>
              <p className="text-xs text-slate-600">
                မိုးရာသီတွင် စိုစွတ်မှုမြင့်မားသဖြင့် ပွေး၊ ညှင်းနှင့် ခြေကြားမှိုပိုး အဖြစ်များပါသည်။
              </p>
              <ul className="text-xs space-y-1.5 text-slate-700 list-disc list-inside bg-slate-50 p-3 rounded-xl">
                <li>မိုးရေစိုပါက အမြန်ဆုံး ရေချိုးသန့်စင်ပြီး အရေပြားကို ခြောက်သွေ့အောင် သုတ်ပါ။</li>
                <li>လေဝင်လေထွက်ကောင်းသော ချည်ထည် အထည်များကို ဝတ်ဆင်ပါ။</li>
                <li>ခြေအိတ်များကို နေ့စဉ် လဲလှယ်လျှော်ဖွတ်ပါ။</li>
              </ul>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
