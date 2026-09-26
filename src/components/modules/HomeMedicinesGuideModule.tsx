import React, { useState, useMemo } from 'react';
import { 
  Pill, 
  Search, 
  ShieldAlert, 
  Info, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  X, 
  ChevronRight, 
  Utensils, 
  HeartHandshake,
  Activity,
  Flame,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { OTCMedicine } from '../../types/health';
import { OTC_MEDICINES_DATA } from '../../data/otcMedicines';

export const HomeMedicinesGuideModule: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeMedicine, setActiveMedicine] = useState<OTCMedicine | null>(null);

  const categories = [
    { id: 'all', label: `အားလုံး (${OTC_MEDICINES_DATA.length})` },
    { id: 'fever_pain', label: 'အဖျား/အကိုက်အခဲ' },
    { id: 'stomach_gas', label: 'အစာအိမ်/လေဆေး' },
    { id: 'allergy_cold', label: 'အာလဂျီ/နှာစေး' },
    { id: 'diarrhea_ors', label: 'ဝမ်းလျှော/ဓာတ်ဆား' },
    { id: 'firstaid_topical', label: 'အနာကပ်/ဒဏ်ကြေ' },
    { id: 'cough_phlegm', label: 'ချောင်းဆိုး/သလိပ်ပျော်' },
  ];

  const filteredMedicines = useMemo(() => {
    return OTC_MEDICINES_DATA.filter(med => {
      const matchCat = selectedCategory === 'all' || med.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        med.nameMm.toLowerCase().includes(q) || 
        med.genericName.toLowerCase().includes(q) || 
        med.indications.some(i => i.toLowerCase().includes(q)) ||
        med.categoryLabelMm.toLowerCase().includes(q);

      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Medical Disclaimer */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-teal-50 via-sky-50 to-emerald-50 border border-teal-200 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-teal-200 text-teal-800 text-xs font-bold mb-2 shadow-xs">
              <Pill className="w-3.5 h-3.5 text-teal-600" />
              <span>အိမ်သုံး ဆေးဝါးများ အသုံးပြုပုံနှင့် လုံခြုံရေး လမ်းညွှန်</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              အိမ်သုံး ဆေးဝါးများ လမ်းညွှန် (Household OTC Guide)
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              အသုံးများသော အိမ်သုံး ဆေးဝါးများ၏ သောက်သုံးရန် ပမာဏ (Min/Max Dose)၊ ဘေးထွက်ဆိုးကျိုးများ၊ သတိပြုရန်များနှင့် မတည့်သော ဆေးဝါး/အစားအသောက်များ အပြည့်အစုံ
            </p>
          </div>
        </div>

        {/* Medical Disclaimer Callout */}
        <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 flex items-start gap-2.5 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-bold">⚠️ ဆေးဘက်ဆိုင်ရာ အသိပေးချက် (Medical Disclaimer):</strong> ဤ အိမ်သုံး ဆေးဝါး လမ်းညွှန်သည် အိမ်တွင် ရှေးဦးပြုစုရန်နှင့် ကျန်းမာရေး ဗဟုသုတအလို့ငှာ သီးသန့် ဖြစ်ပါသည်။ ဆရာဝန်၏ တိုက်ရိုက် ဆေးညွှန်းကို အစားမထိုးပါ။ ရောဂါပြင်းထန်ပါက သို့မဟုတ် ၂-၃ ရက်အတွင်း မသက်သာပါက တတ်ကျွမ်းသော ဆရာဝန်/ဆေးခန်းသို့ အမြန်ဆုံး သွားရောက် ပြသပါ။
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="mt-5 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ဆေးအမည် (ပါရာစီတမော၊ ဓာတ်ဆား၊ စတီရီဇင်း)၊ ရောဂါလက္ခဏာ ရှာရန်..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-teal-200 text-slate-900 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden placeholder:text-slate-400 shadow-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer shadow-xs ${
                  selectedCategory === cat.id
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Medicines Cards Grid */}
      {filteredMedicines.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Pill className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">ဆေးဝါး ရှာမတွေ့ပါ</h3>
          <p className="text-xs text-slate-500">ရှာဖွေမှု စကားလုံး သို့မဟုတ် Category ကို ပြောင်းလဲကြည့်ပါ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMedicines.map((med) => (
            <div 
              key={med.id}
              className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${med.badgeColor || 'bg-teal-50 text-teal-800 border-teal-200'}`}>
                    {med.categoryLabelMm}
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-slate-400">
                    {med.genericName}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                  {med.nameMm}
                </h3>

                {/* Indications Badges */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-500">အသုံးပြုနိုင်သော ရောဂါများ:</span>
                  <div className="flex flex-wrap gap-1">
                    {med.indications.map((ind, i) => (
                      <span key={i} className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium">
                        • {ind}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quick Dosage Info */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 block uppercase">အနည်းဆုံး ပမာဏ (Min):</span>
                    <p className="font-semibold text-slate-800 text-[11px]">{med.minDose}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-rose-700 block uppercase">အများဆုံး ပမာဏ (Max):</span>
                    <p className="font-semibold text-slate-800 text-[11px]">{med.maxDose}</p>
                  </div>
                </div>
              </div>

              {/* Card Footer Button */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  Side effects & Interactions ပါရှိသည်
                </span>
                <button
                  onClick={() => setActiveMedicine(med)}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <span>အသေးစိတ် လမ်းညွှန်</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Medicine Detail Modal */}
      {activeMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl my-6 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${activeMedicine.badgeColor || 'bg-teal-50 text-teal-800 border-teal-200'}`}>
                    {activeMedicine.categoryLabelMm}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {activeMedicine.genericName}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  {activeMedicine.nameMm}
                </h3>
              </div>

              <button
                onClick={() => setActiveMedicine(null)}
                className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 cursor-pointer transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs pr-1">
              
              {/* Indications */}
              <div className="bg-teal-50/60 p-3.5 rounded-2xl border border-teal-200/80 space-y-1.5">
                <h4 className="font-bold text-teal-900 flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>အသုံးပြုနိုင်သော ရောဂါများ (Indications):</span>
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
                  {activeMedicine.indications.map((ind, idx) => (
                    <li key={idx}>{ind}</li>
                  ))}
                </ul>
              </div>

              {/* Usage & Dose Box */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Clock className="w-4 h-4 text-sky-600" />
                  <span>သောက်သုံးပုံနှင့် ဆေးပမာဏ (Dosage & Instructions):</span>
                </h4>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {activeMedicine.usage}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                  <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    <span className="font-bold text-emerald-900 block text-[11px]">အနည်းဆုံး ပမာဏ (Min Dose):</span>
                    <p className="text-slate-800 font-semibold">{activeMedicine.minDose}</p>
                  </div>
                  <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                    <span className="font-bold text-rose-900 block text-[11px]">အများဆုံး ပမာဏ (Max Dose):</span>
                    <p className="text-slate-800 font-semibold">{activeMedicine.maxDose}</p>
                  </div>
                </div>
                {activeMedicine.childDose && (
                  <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-950 font-medium">
                    <strong className="font-bold text-amber-900">ကလေးများ ပမာဏ (Child Dose):</strong> {activeMedicine.childDose}
                  </div>
                )}
              </div>

              {/* Side Effects */}
              <div className="bg-rose-50/70 p-3.5 rounded-2xl border border-rose-200/80 space-y-1.5">
                <h4 className="font-bold text-rose-900 flex items-center gap-1.5 text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>ဖြစ်နိုင်သော ဘေးထွက်ဆိုးကျိုးများ (Side Effects):</span>
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
                  {activeMedicine.sideEffects.map((se, idx) => (
                    <li key={idx}>{se}</li>
                  ))}
                </ul>
              </div>

              {/* Precautions */}
              <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/80 space-y-1.5">
                <h4 className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>သတိပြုရန် အချက်များ (Precautions & Warnings):</span>
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
                  {activeMedicine.precautions.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>

              {/* Drug & Food Interactions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-purple-50/80 p-3.5 rounded-2xl border border-purple-200 text-xs space-y-1.5">
                  <h4 className="font-bold text-purple-900 flex items-center gap-1">
                    <Pill className="w-3.5 h-3.5 text-purple-600" />
                    <span>မတည့်သော ဆေးများ (Drug Interactions):</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {activeMedicine.drugInteractions.map((di, idx) => (
                      <li key={idx}>{di}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200 text-xs space-y-1.5">
                  <h4 className="font-bold text-emerald-900 flex items-center gap-1">
                    <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                    <span>မတည့်သော အစားအသောက် (Food Interactions):</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {activeMedicine.foodInteractions.map((fi, idx) => (
                      <li key={idx}>{fi}</li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end shrink-0">
              <button
                onClick={() => setActiveMedicine(null)}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer shadow-xs"
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
