import React, { useState } from 'react';
import {
  Activity,
  Droplets,
  Heart,
  Thermometer,
  Wind,
  Scale,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Search,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  BookOpen,
  HelpCircle,
  CheckSquare
} from 'lucide-react';
import { MedicalDisclaimer } from '../common/MedicalDisclaimer';

interface HomeTestingGuideModuleProps {
  onNavigateTab?: (tab: string) => void;
}

export const HomeTestingGuideModule: React.FC<HomeTestingGuideModuleProps> = ({ onNavigateTab }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'bp' | 'sugar' | 'temp' | 'oximeter' | 'weight'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>('bp_steps');

  // Interactive Checklist states for BP & Sugar
  const [bpChecklist, setBpChecklist] = useState<Record<string, boolean>>({
    rested5mins: false,
    noCoffeeSmoking: false,
    emptyBladder: false,
    cuffAtHeartLevel: false,
    noTalking: false
  });

  const [sugarChecklist, setSugarChecklist] = useState<Record<string, boolean>>({
    washedHandsSoap: false,
    driedHands: false,
    checkedStripExpiry: false,
    sideOfFinger: false,
    wipeFirstDrop: false
  });

  const toggleBpCheck = (key: string) => {
    setBpChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSugarCheck = (key: string) => {
    setSugarChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const bpReadyScore = Object.values(bpChecklist).filter(Boolean).length;
  const sugarReadyScore = Object.values(sugarChecklist).filter(Boolean).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner - Medical White & Teal Gradient */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50/70 to-indigo-50 border border-emerald-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>လက်တွေ့အသုံးချ ဆေးပညာလမ်းညွှန် (Clinical Home Self-Monitoring Guide)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              အိမ်တွင်း ကျန်းမာရေး စစ်ဆေးမှု လမ်းညွှန်
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              သွေးပေါင်ချိန် တိုင်းတာခြင်းနှင့် သွေးတွင်းသကြားဓာတ် (ဆီးချို) စစ်ဆေးရာတွင် အမှားအယွင်းမရှိ တိကျမှန်ကန်သော အဖြေရရှိစေရန် ဆရာဝန်များ အကြံပြုထားသော အဆင့်ဆင့် စနစ်တကျ လမ်းညွှန်ချက်များ
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onNavigateTab && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => onNavigateTab('bp')}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>သွေးပေါင်မှတ်တမ်း ➜</span>
                </button>
                <button
                  onClick={() => onNavigateTab('sugar')}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Droplets className="w-3.5 h-3.5" />
                  <span>ဆီးချိုမှတ်တမ်း ➜</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Selector (No Horizontal Scroll on Mobile) */}
        <div className="mt-4 sm:hidden">
          <label className="block text-xs font-bold text-slate-800 mb-1">
            စစ်ဆေးမှု လမ်းညွှန် ရွေးချယ်ပါ:
          </label>
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as any)}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-800 border border-emerald-300 shadow-2xs focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">အားလုံး (All Guides)</option>
            <option value="bp">🩺 မှန်ကန်စွာ သွေးပေါင်ချိန်တိုင်းနည်း</option>
            <option value="sugar">🩸 မှန်ကန်စွာ ဆီးချိုစစ်နည်း</option>
            <option value="temp">🌡️ ကိုယ်အပူချိန်တိုင်းနည်း</option>
            <option value="oximeter">💨 အောက်ဆီဂျင် (SpO2) တိုင်းနည်း</option>
            <option value="weight">⚖️ ကိုယ်အလေးချိန် & BMI</option>
          </select>
        </div>

        {/* Desktop Filter Navigation Pills */}
        <div className="mt-6 hidden sm:flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer shadow-xs ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
            }`}
          >
            အားလုံး (All Guides)
          </button>
          <button
            onClick={() => setActiveTab('bp')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
              activeTab === 'bp'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white hover:bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>မှန်ကန်စွာ သွေးပေါင်ချိန်တိုင်းနည်း</span>
          </button>
          <button
            onClick={() => setActiveTab('sugar')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
              activeTab === 'sugar'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            <Droplets className="w-4 h-4" />
            <span>မှန်ကန်စွာ ဆီးချိုစစ်နည်း</span>
          </button>
          <button
            onClick={() => setActiveTab('temp')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
              activeTab === 'temp'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white hover:bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            <Thermometer className="w-4 h-4" />
            <span>ကိုယ်အပူချိန်တိုင်းနည်း</span>
          </button>
          <button
            onClick={() => setActiveTab('oximeter')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
              activeTab === 'oximeter'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white hover:bg-sky-50 text-sky-700 border border-sky-200'
            }`}
          >
            <Wind className="w-4 h-4" />
            <span>အောက်ဆီဂျင် (SpO2) တိုင်းနည်း</span>
          </button>
          <button
            onClick={() => setActiveTab('weight')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
              activeTab === 'weight'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white hover:bg-purple-50 text-purple-700 border border-purple-200'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>ကိုယ်အလေးချိန် & BMI</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: မှန်ကန်စွာ သွေးပေါင်ချိန်တိုင်းနည်း (Detailed Guide) */}
      {(activeTab === 'all' || activeTab === 'bp') && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-6 p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  သွေးတိုးရောဂါ ထိန်းချုပ်မှု
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  မှန်ကန်စွာ သွေးပေါင်ချိန်တိုင်းနည်း (How to Accurately Measure Blood Pressure)
                </h3>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">စံသတ်မှတ်ချက်:</span>
              <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
                &lt; 120/80 mmHg
              </span>
            </div>
          </div>

          {/* Quick Pre-measurement Readiness Checklist */}
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-rose-950 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-rose-600" />
                <span>သွေးပေါင်မတိုင်းမီ အဆင်သင့်ဖြစ်မှု စစ်ဆေးချက် (Pre-Test Checklist):</span>
              </h4>
              <span className="text-[11px] font-bold text-rose-800 bg-white px-2 py-0.5 rounded-md border border-rose-200">
                {bpReadyScore} / 5 အချက် အဆင်သင့်ဖြစ်
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
              <label 
                onClick={() => toggleBpCheck('rested5mins')}
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  bpChecklist.rested5mins ? 'bg-white border-rose-400 font-bold text-rose-950 shadow-2xs' : 'bg-rose-50/40 border-rose-100 text-slate-700'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={bpChecklist.rested5mins} 
                  onChange={() => {}}
                  className="rounded text-rose-600 focus:ring-rose-500" 
                />
                <span>၅ မိနစ် သက်တောင့်သက်သာ ငြိမ်သက်စွာ ထိုင်ပြီးပြီ</span>
              </label>

              <label 
                onClick={() => toggleBpCheck('noCoffeeSmoking')}
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  bpChecklist.noCoffeeSmoking ? 'bg-white border-rose-400 font-bold text-rose-950 shadow-2xs' : 'bg-rose-50/40 border-rose-100 text-slate-700'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={bpChecklist.noCoffeeSmoking} 
                  onChange={() => {}}
                  className="rounded text-rose-600 focus:ring-rose-500" 
                />
                <span>မိနစ် ၃၀ အတွင်း ကော်ဖီ/လက်ဖက်ရည်/ဆေးလိပ် မသောက်ထားပါ</span>
              </label>

              <label 
                onClick={() => toggleBpCheck('emptyBladder')}
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  bpChecklist.emptyBladder ? 'bg-white border-rose-400 font-bold text-rose-950 shadow-2xs' : 'bg-rose-50/40 border-rose-100 text-slate-700'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={bpChecklist.emptyBladder} 
                  onChange={() => {}}
                  className="rounded text-rose-600 focus:ring-rose-500" 
                />
                <span>ဆီးအောင့်မထားပါ (ဆီးသွားပြီးမှ တိုင်းခြင်းဖြစ်သည်)</span>
              </label>

              <label 
                onClick={() => toggleBpCheck('cuffAtHeartLevel')}
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  bpChecklist.cuffAtHeartLevel ? 'bg-white border-rose-400 font-bold text-rose-950 shadow-2xs' : 'bg-rose-50/40 border-rose-100 text-slate-700'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={bpChecklist.cuffAtHeartLevel} 
                  onChange={() => {}}
                  className="rounded text-rose-600 focus:ring-rose-500" 
                />
                <span>လက်မောင်းသည် နှလုံးနှင့် တစ်တန်းတည်း အမြင့်တွင်ရှိသည်</span>
              </label>

              <label 
                onClick={() => toggleBpCheck('noTalking')}
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  bpChecklist.noTalking ? 'bg-white border-rose-400 font-bold text-rose-950 shadow-2xs' : 'bg-rose-50/40 border-rose-100 text-slate-700'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={bpChecklist.noTalking} 
                  onChange={() => {}}
                  className="rounded text-rose-600 focus:ring-rose-500" 
                />
                <span>တိုင်းနေစဉ် စကားမပြောဘဲ တိတ်ဆိတ်စွာ နေမည်</span>
              </label>
            </div>
          </div>

          {/* 4 Step Sequential Guide */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-rose-600" />
              <span>တိကျသော အဆင့် ၄ ဆင့်ဖြင့် တိုင်းတာနည်း (4-Step Standard Protocol)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Step 1 */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center">
                    ၁
                  </span>
                  <h5 className="font-bold text-xs text-slate-900">
                    ခန္ဓာကိုယ် အနေအထား ပြင်ဆင်ထိုင်ပါ (Proper Sitting Posture)
                  </h5>
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 pl-8 list-disc">
                  <li>ကျောမှီပါသော ကုလားထိုင်တွင် ခါးမတ်မတ် သက်တောင့်သက်သာ ထိုင်ပါ။</li>
                  <li><strong>ခြေထောက်ချိတ် မထိုင်ရပါ</strong> (ခြေဖဝါးနှစ်ဖက်လုံး ကြမ်းပြင်ပေါ် ပြားပြားညီညာစွာ ထားပါ)။</li>
                  <li>တိုင်းမည့် လက်မောင်းကို စားပွဲခုံပေါ် သက်တောင့်သက်သာ တင်ထားပါ။</li>
                </ul>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center">
                    ၂
                  </span>
                  <h5 className="font-bold text-xs text-slate-900">
                    လက်မောင်းပတ် (Cuff) မှန်ကန်စွာ ပတ်ပါ (Cuff Placement)
                  </h5>
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 pl-8 list-disc">
                  <li>လက်မောင်းပတ်ကို <strong>တံတောင်ဆစ်အကွေး အထက် ၁ လက်မခန့်</strong> (၂ စင်တီမီတာခန့်) အကွာတွင် ပတ်ပါ။</li>
                  <li>လက်မောင်းပတ်အတွင်းသို့ လက်ညှိုး ၁ ချောင်း လျှိုသွင်းနိုင်ရုံမျှ တင်းကျပ်မှု ရှိပါစေ။</li>
                  <li>လေပိုက်ခေါင်းသည် လက်ဖဝါးအလယ်တည့်တည့်သို့ ဦးတည်နေရပါမည်။</li>
                </ul>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center">
                    ၃
                  </span>
                  <h5 className="font-bold text-xs text-slate-900">
                    တိုင်းတာနေစဉ် ငြိမ်သက်စွာ နေပါ (During Measurement)
                  </h5>
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 pl-8 list-disc">
                  <li>Start ခလုတ်နှိပ်ပြီးနောက် စက်လည်ပတ်နေစဉ် <strong>လုံးဝ စကားမပြောရပါ၊ မလှုပ်ရှားရပါ</strong>။</li>
                  <li>စိတ်အေးချမ်းစွာထားပြီး ပုံမှန်အတိုင်း အသက်ရှူနေပါ။</li>
                  <li>မျက်စိမှိတ်၍ အသက်ပြင်းပြင်း သက်တောင့်သက်သာ ရှူသွင်းရှူထုတ်နိုင်ပါသည်။</li>
                </ul>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center">
                    ၄
                  </span>
                  <h5 className="font-bold text-xs text-slate-900">
                    ၂ ကြိမ်တိုင်းပြီး ပျမ်းမျှတန်ဖိုးယူပါ (Double Measurement Rule)
                  </h5>
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 pl-8 list-disc">
                  <li>ပထမအကြိမ် တိုင်းပြီးပါက <strong>၁ မိနစ်မှ ၂ မိနစ်ခန့်</strong> အနားယူပါ။</li>
                  <li>ထို့နောက် ဒုတိယအကြိမ် ထပ်မံတိုင်းတာပြီး ရရှိလာသော ရလဒ် ၂ ခု၏ ပျမ်းမျှတန်ဖိုးကို မှတ်တမ်းတင်ပါ။</li>
                  <li>ရလဒ် ၂ ခု အလွန်ကွာဟနေပါက ၃ ကြိမ်မြောက် ထပ်တိုင်း၍ နောက်ဆုံး ၂ ကြိမ်၏ ပျမ်းမျှကို ယူပါ။</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Do's & Don'ts Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
              <h5 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>လုပ်ဆောင်သင့်သည့် အချက်များ (DO)</span>
              </h5>
              <ul className="text-xs text-emerald-950 space-y-1.5 pl-5 list-disc">
                <li>နေ့စဉ် <strong>တူညီသော အချိန်</strong> (မနက် အိပ်ရာထ မနက်စာမစားမီ နှင့် ညအိပ်ရာမဝင်မီ) တွင် ပုံမှန်တိုင်းပါ။</li>
                <li>လက်ဖဝါးကို အပေါ်သို့ လှန်ထားပါ။</li>
                <li>လက်မောင်းပတ် အဝတ်ကို သားရေမျှင်ကျပ်သော အင်္ကျီပေါ်မှ မပတ်ဘဲ အင်္ကျီလက်ပါးပေါ်မှ သို့မဟုတ် လက်မောင်းဗလာပေါ်တွင် တိုက်ရိုက်ပတ်ပါ။</li>
                <li>တိုင်းတာရရှိသော သွေးပေါင်နှင့် နှလုံးခုန်နှုန်း (Pulse) ကို အက်ပ်ထဲတွင် ချက်ချင်း မှတ်တမ်းတင်ပါ။</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2">
              <h5 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>လုံးဝ ရှောင်ကြဉ်ရမည့် အချက်များ (DON'T)</span>
              </h5>
              <ul className="text-xs text-rose-950 space-y-1.5 pl-5 list-disc">
                <li><strong>ဆီးအောင့်မထားရပါ</strong> (ဆီးအောင့်ထားပါက သွေးပေါင် ၁၀ မှ ၁၅ mmHg အထိ မှားယွင်းတက်နိုင်ပါသည်)။</li>
                <li>တင်းကျပ်လွန်းသော အင်္ကျီလက်မောင်းကို အတင်းလိပ်တင်၍ မတိုင်းရပါ (သွေးကြောကို ညှစ်ထားသကဲ့သို့ ဖြစ်စေသည်)။</li>
                <li>လှုပ်ရှားအမောတကော ဖြစ်နေစဉ် သို့မဟုတ် စိတ်ဆိုးဒေါသထွက်နေစဉ် ချက်ချင်း မတိုင်းရပါ။</li>
                <li>လက်မောင်းပတ်ကို နှလုံးထက် နိမ့်သော သို့မဟုတ် မြင့်သောနေရာတွင် မထားရပါ။</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: မှန်ကန်စွာ ဆီးချို စစ်နည်း (Blood Glucose Testing Detailed Guide) */}
      {(activeTab === 'all' || activeTab === 'sugar') && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-6 p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ဆီးချိုရောဂါ စောင့်ရှောက်မှု
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  မှန်ကန်စွာ ဆီးချို စစ်နည်း (How to Accurately Test Blood Glucose at Home)
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">အစာမစားမီ ပုံမှန်ပန်းတိုင်:</span>
              <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
                70 - 99 mg/dL
              </span>
            </div>
          </div>

          {/* Quick Pre-test Readiness Checklist */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <span>ဆီးချိုမစစ်မီ အဆင်သင့်ဖြစ်မှု စစ်ဆေးချက် (Pre-Test Checklist):</span>
              </h4>
              <span className="text-[11px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                {sugarReadyScore} / 5 အချက် အဆင်သင့်ဖြစ်
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
              <label 
                onClick={() => toggleSugarCheck('washedHandsSoap')}
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  sugarChecklist.washedHandsSoap ? 'bg-white border-emerald-400 font-bold text-emerald-950 shadow-2xs' : 'bg-emerald-50/40 border-emerald-100 text-slate-700'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={sugarChecklist.washedHandsSoap} 
                  onChange={() => {}}
                  className="rounded text-emerald-600 focus:ring-emerald-500" 
                />
                <span>လက်ကို ရေနွေးနွေးနှင့် ဆပ်ပြာဖြင့် သေချာဆေးပြီးပြီ</span>
              </label>

              <label 
                onClick={() => toggleSugarCheck('driedHands')}
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  sugarChecklist.driedHands ? 'bg-white border-emerald-400 font-bold text-emerald-950 shadow-2xs' : 'bg-emerald-50/40 border-emerald-100 text-slate-700'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={sugarChecklist.driedHands} 
                  onChange={() => {}}
                  className="rounded text-emerald-600 focus:ring-emerald-500" 
                />
                <span>လက်ကို ခြောက်သွေ့အောင် သုတ်ထားပြီးဖြစ်သည်</span>
              </label>

              <label 
                onClick={() => toggleSugarCheck('checkedStripExpiry')}
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  sugarChecklist.checkedStripExpiry ? 'bg-white border-emerald-400 font-bold text-emerald-950 shadow-2xs' : 'bg-emerald-50/40 border-emerald-100 text-slate-700'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={sugarChecklist.checkedStripExpiry} 
                  onChange={() => {}}
                  className="rounded text-emerald-600 focus:ring-emerald-500" 
                />
                <span>စတြစ် (Strip) သက်တမ်းမလွန်သေးကြောင်း စစ်ဆေးပြီးပြီ</span>
              </label>

              <label 
                onClick={() => toggleSugarCheck('sideOfFinger')}
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  sugarChecklist.sideOfFinger ? 'bg-white border-emerald-400 font-bold text-emerald-950 shadow-2xs' : 'bg-emerald-50/40 border-emerald-100 text-slate-700'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={sugarChecklist.sideOfFinger} 
                  onChange={() => {}}
                  className="rounded text-emerald-600 focus:ring-emerald-500" 
                />
                <span>လက်ချောင်းအလယ်မဟုတ်ဘဲ ဘေးဘောင်ကို ထိုးမည်</span>
              </label>

              <label 
                onClick={() => toggleSugarCheck('wipeFirstDrop')}
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  sugarChecklist.wipeFirstDrop ? 'bg-white border-emerald-400 font-bold text-emerald-950 shadow-2xs' : 'bg-emerald-50/40 border-emerald-100 text-slate-700'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={sugarChecklist.wipeFirstDrop} 
                  onChange={() => {}}
                  className="rounded text-emerald-600 focus:ring-emerald-500" 
                />
                <span>ပထမဆုံးထွက်သော သွေးစက်ကို သုတ်ပစ်ပြီး ဒုတိယစက်ကိုသုံးမည်</span>
              </label>
            </div>
          </div>

          {/* 5-Step Glucometer Protocol */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>စက်ဖြင့် မှန်ကန်စွာ သွေးဖောက်စစ်ဆေးနည်း အဆင့် ၅ ဆင့်</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Step 1 */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    ၁
                  </span>
                  <h5 className="font-bold text-xs text-slate-900">
                    လက်ကို ရေနွေးနှင့် ဆပ်ပြာဖြင့် ဆေးပါ
                  </h5>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  လက်တွင် သစ်သီး သို့မဟုတ် သကြားဓာတ်များ ကျန်ရှိနေပါက အဖြေမှားယွင်းစွာ မြင့်တက်စေပါသည်။ ရေနွေးနွေးဖြင့် ဆေးခြင်းသည် သွေးလည်ပတ်မှုကောင်းစေပြီး သွေးဖောက်ရ ပိုမိုလွယ်ကူစေပါသည်။
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    ၂
                  </span>
                  <h5 className="font-bold text-xs text-slate-900">
                    လက်ကို လုံးဝ ခြောက်သွေ့အောင် သုတ်ပါ
                  </h5>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  လက်တွင် ရေ သို့မဟုတ် အရက်ပြန်စိုစွတ်နေပါက ထွက်လာသော သွေးစက်ပျော့သွားပြီး သွေးချိုအဖြေ မှားယွင်းစွာ လျော့ကျသွားစေနိုင်ပါသည်။ ထို့ကြောင့် လုံးဝ ခြောက်သွေ့မှသာ ထိုးပါ။
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    ၃
                  </span>
                  <h5 className="font-bold text-xs text-slate-900">
                    လက်ချောင်း၏ ဘေးဘောင်ကို ထိုးပါ
                  </h5>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  လက်ချောင်းထိပ် အလယ်တည့်တည့်သည် အာရုံကြောများသဖြင့် နာကျင်လွယ်ပါသည်။ <strong>လက်ချောင်း၏ ဘေးဘောင်နံဘေး (Side of fingertip)</strong> ကို ထိုးပါက နာကျင်မှု သက်သာပြီး သွေးထွက်ကောင်းပါသည်။
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    ၄
                  </span>
                  <h5 className="font-bold text-xs text-slate-900">
                    ပထမစက်ကို သုတ်ပစ်ပါ (Golden Rule)
                  </h5>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ပထမဆုံး ထွက်လာသော သွေးစက်တွင် အရေပြားဆဲလ်အရည်များ (Tissue fluid) ရောနှောနေနိုင်သဖြင့် ဂွမ်းသန့်ဖြင့် သုတ်ပစ်ပြီး <strong>ဒုတိယထွက်လာသော သွေးစက်ကိုသာ</strong> Strip ပေါ် တင်ပါ။
                </p>
              </div>

              {/* Step 5 */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    ၅
                  </span>
                  <h5 className="font-bold text-xs text-slate-900">
                    လက်ချောင်းကို အတင်းမညှစ်ရပါ
                  </h5>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  သွေးထွက်စေရန် လက်ချောင်းကို အတင်းဖိညှစ်ပါက အရေပြားအတွင်းမှ ဆဲလ်အရည်များ ထွက်လာပြီး သွေးချိုအဖြေ လျော့နည်းသွားစေနိုင်ပါသည်။ လက်မောင်းမှ လက်ချောင်းဆီသို့ အသာအယာ သွေးပို့ပေးပါ။
                </p>
              </div>

              {/* Step 6 */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    ၆
                  </span>
                  <h5 className="font-bold text-xs text-slate-900">
                    စတြစ်ဘူးကို ချက်ချင်း အဖုံးပြန်ပိတ်ပါ
                  </h5>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Test Strip များသည် လေထုထဲရှိ အစိုဓာတ်ကို စုပ်ယူလွယ်သဖြင့် Strip ထုတ်ပြီးသည်နှင့် ဘူးအဖုံးကို ချက်ချင်း လုံခြုံစွာ ပြန်ပိတ်ရပါမည်။ သက်တမ်းကုန်ပြီး စတြစ်များကို လုံးဝ မသုံးရပါ။
                </p>
              </div>
            </div>
          </div>

          {/* Blood Sugar Testing Schedule & Target Matrix */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h5 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>စစ်ဆေးရမည့် အချိန်နှင့် ပစ်မှတ်စံနှုန်းများ (Clinical Target Ranges):</span>
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">၁။ အစာမစားမီ (Fasting FBS)</span>
                <p className="text-[11px] text-slate-500 mb-2">မနက်ခင်း အိပ်ရာထ (အနည်းဆုံး ၈ နာရီ အစာငတ်ပြီး)</p>
                <div className="space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-600">ပုံမှန်လူ:</span>
                    <strong className="text-emerald-700">70 - 99 mg/dL</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">ဆီးချိုလူနာပန်းတိုင်:</span>
                    <strong className="text-teal-700">80 - 130 mg/dL</strong>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">၂။ အစာစားပြီး ၂ နာရီ (Postprandial)</span>
                <p className="text-[11px] text-slate-500 mb-2">အစာပထမလုတ် စားသည့်အချိန်မှ စတင်ရေတွက်ပါ</p>
                <div className="space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-600">ပုံမှန်လူ:</span>
                    <strong className="text-emerald-700">&lt; 140 mg/dL</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">ဆီးချိုလူနာပန်းတိုင်:</span>
                    <strong className="text-teal-700">&lt; 180 mg/dL</strong>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">၃။ အိပ်ရာမဝင်မီ (Bedtime)</span>
                <p className="text-[11px] text-slate-500 mb-2">ညဘက် သွေးချိုကျခြင်း မဖြစ်စေရန် စစ်ဆေးခြင်း</p>
                <div className="space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-600">ဆီးချိုလူနာပန်းတိုင်:</span>
                    <strong className="text-teal-700">100 - 140 mg/dL</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-rose-600">သွေးချိုကျသတိပေးချက်:</span>
                    <strong className="text-rose-700">&lt; 70 mg/dL</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Alert Box: Rule of 15 */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>သွေးချိုလွန်စွာကျဆင်းခြင်း (Hypoglycemia &lt; 70 mg/dL) အတွက် Rule of 15 ကယ်ဆယ်နည်း:</span>
            </div>
            <p className="text-amber-950 leading-relaxed">
              သွေးတွင်းသကြားဓာတ် <strong>70 mg/dL အောက်</strong> ကျဆင်းသွားပါက သို့မဟုတ် ချွေးစေးပြန်ခြင်း၊ တုန်ယင်ခြင်း၊ ရင်တုန်ခြင်း ဖြစ်ပါက ချက်ချင်း <strong>သကြား ၁၅ ဂရမ်</strong> (သကြားရည် စားပွဲတင်ဇွန်း ၁ ဇွန်း သို့မဟုတ် သစ်သီးဖျော်ရည် ခွက်တစ်ဝက် သို့မဟုတ် သကြားလုံး ၃-၄ လုံး) သောက်သုံးပါ။ ထို့နောက် <strong>၁၅ မိနစ် စောင့်ပြီး သွေးချို ပြန်စစ်ပါ</strong>။ ပုံမှန်မရောက်သေးပါက နောက်ထပ် ၁၅ ဂရမ် ထပ်မံသောက်သုံးပါ။
            </p>
          </div>
        </div>
      )}

      {/* SECTION 3: ကိုယ်အပူချိန် နှင့် အောက်ဆီဂျင် တိုင်းတာနည်းများ (Other Essential Home Tests) */}
      {(activeTab === 'all' || activeTab === 'temp' || activeTab === 'oximeter' || activeTab === 'weight') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Temperature Guide */}
          {(activeTab === 'all' || activeTab === 'temp') && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                  <Thermometer className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    မှန်ကန်စွာ ကိုယ်အပူချိန်တိုင်းနည်း (Digital Thermometer)
                  </h4>
                  <span className="text-[11px] text-slate-500">လျှာအောက် နှင့် ချိုင်းကြား တိုင်းတာမှု</span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <strong className="text-slate-900 block mb-1">၁။ လျှာအောက် တိုင်းနည်း (Oral):</strong>
                  <span>သာမိုမီတာထိပ်ဖူးကို လျှာအောက်တွင်ထားပြီး နှုတ်ခမ်းကို လုံအောင်ပိတ်ထားပါ။ တိုင်းမီ မိနစ် ၂၀ အတွင်း ရေခဲရေ သို့မဟုတ် ရေနွေး မသောက်ရပါ။ (ပုံမှန်: 97.6°F - 99.0°F)။</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <strong className="text-slate-900 block mb-1">၂။ ချိုင်းကြား တိုင်းနည်း (Axillary):</strong>
                  <span>ချိုင်းကြား ချွေးစိုနေပါက ခြောက်သွေ့အောင် အရင်သုတ်ပါ။ သာမိုမီတာထိပ်ဖူးကို ချိုင်းကြားလယ်တွင် ကပ်ထားပြီး လက်မောင်းကို ခန္ဓာကိုယ်နှင့် ကပ်ထားပါ။ ချိုင်းကြားအပူချိန်သည် လျှာအောက်ထက် 1°F ခန့် နိမ့်နိုင်ပါသည်။</span>
                </div>

                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                  <strong>ဖျားနာမှု သတ်မှတ်ချက်:</strong> 99.5°F (37.5°C) အထက်သည် ကိုယ်ပူခြင်း ဖြစ်ပြီး 100.4°F (38.0°C) အထက်သည် ဖျားနာခြင်း (Fever) ဖြစ်ပါသည်။
                </div>
              </div>
            </div>
          )}

          {/* Pulse Oximeter Guide */}
          {(activeTab === 'all' || activeTab === 'oximeter') && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                  <Wind className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    သွေးတွင်းအောက်ဆီဂျင် တိုင်းတာနည်း (Pulse Oximeter SpO2)
                  </h4>
                  <span className="text-[11px] text-slate-500">လက်ထိပ်ညှပ်စက်ဖြင့် မှန်ကန်စွာ စစ်ဆေးခြင်း</span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <strong className="text-slate-900 block mb-1">လက်သည်းဆိုးဆေး ဖျက်ထားပါ:</strong>
                  <span>လက်သည်းနီ သို့မဟုတ် ဆိုးဆေးများ ရှိနေပါက စက်မှ အလင်းရောင်ဖြတ်သန်းမှုကို ပိတ်ပင်ပြီး SpO2 အဖြေ မှားယွင်းစွာ လျော့နည်းနိုင်ပါသည်။</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <strong className="text-slate-900 block mb-1">လက်အေးမနေပါစေနှင့်:</strong>
                  <span>လက်ချောင်းများ အေးစက်နေပါက သွေးကြောကျဉ်းသဖြင့် သွေးငြိမ်အောင် လက်ကို ပွတ်နွေးပေးပြီးမှ တိုင်းပါ။ လက်ညှိုး သို့မဟုတ် လက်ခလယ်တွင် ညှပ်ပါ။</span>
                </div>

                <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-950 font-mono">
                  <div className="flex justify-between mb-1">
                    <span>ပုံမှန် အောက်ဆီဂျင်:</span>
                    <strong className="text-emerald-700">95% - 100%</strong>
                  </div>
                  <div className="flex justify-between text-rose-700">
                    <span>ဆရာဝန်ပြရန် အရေးပေါ်:</span>
                    <strong>&lt; 92% (သို့မဟုတ် အမောဖောက်လျှင်)</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Weight & BMI Guide */}
          {(activeTab === 'all' || activeTab === 'weight') && (
            <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    မှန်ကန်စွာ ကိုယ်အလေးချိန် & BMI တိုင်းတာနည်း (Accurate Weight & BMI Monitoring)
                  </h4>
                  <span className="text-[11px] text-slate-500">နှလုံးရောဂါနှင့် သွေးတိုး/ဆီးချို ကာကွယ်ရေး</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-200">
                  <strong className="text-purple-950 block mb-1">၁။ မနက်တိုင်း အချိန်တူ ချိန်ပါ:</strong>
                  <span className="text-slate-600">မနက် အိပ်ရာထ ဆီးသွားပြီးနောက် မနက်စာ မစားမီ အဝတ်အစားပါးပါးဖြင့် ချိန်ခြင်းသည် အတိကျဆုံး အလေးချိန်ဖြစ်ပါသည်။</span>
                </div>

                <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-200">
                  <strong className="text-purple-950 block mb-1">၂။ မာကျောညီညာသော ကြမ်းပြင်:</strong>
                  <span className="text-slate-600">ပေါင်ချိန်စက်ကို ကော်ဇော၊ ဖျာ သို့မဟုတ် မညီညာသော နေရာတွင် မထားရပါ။ ကြွေပြား သို့မဟုတ် သစ်သားကြမ်းပြင်မာတွင် ထားပါ။</span>
                </div>

                <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-200">
                  <strong className="text-purple-950 block mb-1">၃။ ခြေထောက်နှစ်ဖက် အညီထားပါ:</strong>
                  <span className="text-slate-600">စက်၏ အလယ်ဗဟိုတွင် မတ်မတ်ရပ်ပြီး ခန္ဓာကိုယ်အလေးချိန်ကို ဘယ်ညာ ညီတူမျှတူ သက်ရောက်ပါစေ။</span>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Emergency Red Flag Notice Banner */}
      <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 text-rose-950 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-rose-900">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>ဆေးရုံ / ဆေးခန်းသို့ အရေးပေါ် သွားရောက်ပြသရမည့် အခြေအနေများ (Red Flag Warnings):</span>
        </div>
        <p className="leading-relaxed pl-7">
          အိမ်တွင် တိုင်းတာစစ်ဆေးစဉ် <strong>သွေးပေါင်ချိန် 180/120 mmHg အထက်</strong> ရောက်ရှိနေပြီး ခေါင်းအလွန်ကိုက်ခြင်း၊ မျက်စိပြာခြင်း၊ ရင်ဘတ်အောင့်ခြင်း၊ <strong>သွေးချို 400 mg/dL အထက်</strong> ရောက်ရှိခြင်း သို့မဟုတ် သွေးချိုကျသော်လည်း ပြန်မတက်ဘဲ သတိလစ်မူးဝေခြင်း၊ <strong>အောက်ဆီဂျင် 92% အောက်</strong> ကျဆင်းပြီး အသက်ရှူကျပ်ခြင်းများ ဖြစ်ပေါ်ပါက အိမ်တွင်စောင့်မနေဘဲ အရေးပေါ် ဆေးကုသမှု ချက်ချင်း ခံယူရပါမည်။
        </p>
      </div>

      {/* Medical Disclaimer */}
      <MedicalDisclaimer />
    </div>
  );
};
