import React, { useState } from 'react';
import { Pill, Plus, Trash2, CheckCircle2, Clock, AlertCircle, Calendar, Sparkles, X, Check } from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { useAuth } from '../../context/AuthContext';
import { Medication } from '../../types/health';
import { MedicalDisclaimer } from '../common/MedicalDisclaimer';

export const MedicationsModule: React.FC = () => {
  const { 
    medications, 
    medicationLogs,
    toggleMedicationDoseTaken,
    addMedication, 
    updateMedicationStatus, 
    deleteMedication, 
    selectedPatient, 
    selectedFamilyMember 
  } = useHealthData();
  const { profile } = useAuth();

  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'completed'>('active');

  const todayStr = new Date().toISOString().split('T')[0];

  // Frequency Options
  const FREQUENCY_OPTIONS = [
    'မနက် (၁) ကြိမ်',
    'ည (၁) ကြိမ်',
    'မနက် (၁) ကြိမ် + ည (၁) ကြိမ်',
    'တရက် (၃) ကြိမ်',
    'တရက် (၄) ကြိမ်',
    'တရက် (၅) ကြိမ်',
    'မနက် (၁) ကြိမ် + နေ့လယ် (၁) ကြိမ် + ည (၁) ကြိမ်',
    'နေ့လယ် (၁) ကြိမ်',
    'ညအိပ်ရာဝင် (၁) ကြိမ်',
    'လိုအပ်သည့်အခါ (PRN / As needed)',
  ];

  // Form states
  const [tradeName, setTradeName] = useState('');
  const [chemicalNamesInput, setChemicalNamesInput] = useState('');
  const [chemicalNames, setChemicalNames] = useState<string[]>([]);
  const [chemValidationError, setChemValidationError] = useState('');
  const [dosage, setDosage] = useState('5 mg');
  const [selectedFreqOption, setSelectedFreqOption] = useState<string>('မနက် (၁) ကြိမ်');
  const [customFrequency, setCustomFrequency] = useState('');
  const [frequency, setFrequency] = useState('မနက် (၁) ကြိမ်');
  const [timing, setTiming] = useState<'before_meal' | 'after_meal' | 'with_meal' | 'bedtime' | 'anytime'>('after_meal');
  const [durationDays, setDurationDays] = useState<string>('30'); // ဆေးသောက်ရမည့်ရက်ပေါင်း
  const [prescribedFor, setPrescribedFor] = useState('သွေးတိုးရောဂါ (Hypertension)');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [prescribingDoctor, setPrescribingDoctor] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleCheckToday = (medId: string, medName?: string) => {
    const isCurrentlyTaken = medicationLogs.some(l => l.medicationId === medId && l.date === todayStr && l.taken);
    toggleMedicationDoseTaken(medId, todayStr, !isCurrentlyTaken, 0, medName);
  };

  const handleAddChemicalName = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (('key' in e && e.key === 'Enter') || e.type === 'click') {
      e.preventDefault();
      if (chemicalNamesInput.trim() && !chemicalNames.includes(chemicalNamesInput.trim())) {
        setChemicalNames([...chemicalNames, chemicalNamesInput.trim()]);
        setChemicalNamesInput('');
        setChemValidationError('');
      }
    }
  };

  const removeChemicalName = (chem: string) => {
    setChemicalNames(chemicalNames.filter(c => c !== chem));
  };

  // Filtered meds
  const filteredMeds = filterStatus === 'all'
    ? medications
    : medications.filter(m => m.status === filterStatus);

  const activeMeds = medications.filter(m => m.status === 'active');
  const activeCount = activeMeds.length;
  const takenCount = activeMeds.filter(m => medicationLogs.some(l => l.medicationId === m.id && l.date === todayStr && l.taken)).length;
  const adherencePercent = activeCount > 0 ? Math.round((takenCount / activeCount) * 100) : 0;

  // Preset drug templates
  const presets = [
    { trade: 'Biogesic', chem: ['Paracetamol'], dose: '500 mg', freq: 'လိုအပ်သည့်အခါ (PRN / As needed)', timing: 'after_meal' as const, for: 'အဖျားကျ/အကိုက်အခဲ' },
    { trade: 'Norvasc', chem: ['Amlodipine'], dose: '5 mg', freq: 'မနက် (၁) ကြိမ်', timing: 'after_meal' as const, for: 'သွေးတိုးရောဂါ' },
    { trade: 'Glucophage', chem: ['Metformin HCl'], dose: '500 mg', freq: 'မနက် (၁) ကြိမ် + ည (၁) ကြိမ်', timing: 'with_meal' as const, for: 'ဆီးချိုရောဂါ' },
    { trade: 'Lipitor', chem: ['Atorvastatin'], dose: '10 mg', freq: 'ညအိပ်ရာဝင် (၁) ကြိမ်', timing: 'bedtime' as const, for: 'သွေးတွင်းအဆီကျဆေး' },
    { trade: 'Cozaar', chem: ['Losartan Potassium'], dose: '50 mg', freq: 'မနက် (၁) ကြိမ်', timing: 'after_meal' as const, for: 'သွေးတိုးရောဂါ' },
    { trade: 'Zyloric', chem: ['Allopurinol'], dose: '100 mg', freq: 'နေ့လယ် (၁) ကြိမ်', timing: 'after_meal' as const, for: 'ယူရစ်အက်စစ်ကျဆေး' },
  ];

  const applyPreset = (p: typeof presets[0]) => {
    setTradeName(p.trade);
    setChemicalNames(p.chem);
    setDosage(p.dose);
    setSelectedFreqOption(p.freq);
    setFrequency(p.freq);
    setCustomFrequency('');
    setTiming(p.timing);
    setPrescribedFor(p.for);
    setChemValidationError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !tradeName.trim()) return;

    // Validate Chemical Name is strictly provided (မထည့်မဖြစ် ထည့်ခိုင်းခြင်း)
    const finalChems = [...chemicalNames];
    if (chemicalNamesInput.trim() && !finalChems.includes(chemicalNamesInput.trim())) {
      finalChems.push(chemicalNamesInput.trim());
    }

    if (finalChems.length === 0) {
      setChemValidationError('⚠️ Chemical Name (ဆေးအမည် အစစ် / ပါဝင်ဓာတုပစ္စည်း) ကို မထည့်မဖြစ် ထည့်သွင်းပေးပါရန် (ဥပမာ- Paracetamol, Amlodipine)');
      return;
    }

    setIsSubmitting(true);
    const effectiveFrequency = selectedFreqOption === 'custom' 
      ? (customFrequency.trim() || 'မနက် (၁) ကြိမ်') 
      : selectedFreqOption;

    try {
      await addMedication({
        userId: selectedPatient ? selectedPatient.id : (selectedFamilyMember ? selectedFamilyMember.id : profile.id),
        name: tradeName,
        genericName: finalChems.join(', '),
        dosage,
        frequency: effectiveFrequency,
        timing,
        prescribedFor,
        startDate,
        status: 'active',
        prescribingDoctor,
        notes: `သောက်ရမည့်ရက်: ${durationDays} ရက် | ${notes}`,
      });
      setIsOpenAdd(false);
      setTradeName('');
      setChemicalNames([]);
      setChemicalNamesInput('');
      setChemValidationError('');
      setNotes('');
      setSelectedFreqOption('မနက် (၁) ကြိမ်');
      setCustomFrequency('');
      setFrequency('မနက် (၁) ကြိမ်');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Pill className="w-6 h-6 text-sky-500" />
            သောက်နေသောဆေးများ စာရင်း (Current Medications)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {selectedPatient 
              ? `လူနာ ${selectedPatient.displayName} ၏ လက်ရှိသောက်နေသော ဆေးဝါးများနှင့် ဆေးချိန်ညွှန်းချက်များ`
              : 'သွေးတိုး၊ ဆီးချို၊ အဆီကျနှင့် အခြားသောက်သုံးနေသော ဆေးဝါးများကို တိကျစွာ မှတ်တမ်းတင်ပါ'}
          </p>
        </div>

        <button
          onClick={() => setIsOpenAdd(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-medium shadow-sm transition-all cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4" />
          ဆေးအသစ် ထည့်သွင်းမည်
        </button>
      </div>

      {/* Today's Pill Schedule & Compliance Box with Adherence progress */}
      <div className="bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-indigo-500/10 dark:from-sky-950/40 dark:via-blue-950/40 dark:to-indigo-950/40 p-5 rounded-3xl border border-sky-200 dark:border-sky-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                ယနေ့ ဆေးသောက်ရန် စစ်ဆေးမှု (Today's Medication Tracker)
              </h3>
              <p className="text-xs text-slate-500">
                သောက်ပြီးသော ဆေးများကို အမှန်ခြစ်၍ သောက်သုံးမှု မကျန်စေရန် စောင့်ကြည့်ပါ
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300">
              ယနေ့ ဆေးသောက်ပြီးမှု: {takenCount}/{activeCount} မျိုး ({adherencePercent}%)
            </span>
          </div>
        </div>

        {/* Adherence Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
          <div 
            className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
            style={{ width: `${adherencePercent}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {activeMeds.map((med) => {
            const isTaken = medicationLogs.some(l => l.medicationId === med.id && l.date === todayStr && l.taken);
            return (
              <div
                key={med.id}
                onClick={() => toggleCheckToday(med.id, med.name)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                  isTaken
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-sky-300'
                }`}
              >
                <div>
                  <h4 className={`text-xs font-bold ${isTaken ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                    {med.name}
                  </h4>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>{med.dosage}</span>
                    <span>•</span>
                    <span>{med.frequency}</span>
                  </div>
                </div>

                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  isTaken ? 'bg-emerald-600 text-white shadow-xs' : 'border border-slate-300 dark:border-slate-600 text-transparent hover:border-sky-500'
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterStatus('active')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            filterStatus === 'active'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          လက်ရှိသောက်နေဆဲ ({medications.filter(m => m.status === 'active').length})
        </button>
        <button
          onClick={() => setFilterStatus('paused')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            filterStatus === 'paused'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          ခေတ္တရပ်ထားသောဆေးများ ({medications.filter(m => m.status === 'paused').length})
        </button>
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            filterStatus === 'all'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          အားလုံး ({medications.length})
        </button>
      </div>

      {/* Medications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMeds.map((med) => {
          return (
            <div
              key={med.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 inline-block mb-1">
                      {med.prescribedFor}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{med.name}</span>
                    </h3>
                    {med.genericName && (
                      <div className="flex items-center gap-1 text-xs text-sky-700 dark:text-sky-300 font-semibold mt-0.5 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-100 dark:border-sky-900/40 w-fit">
                        <span>🧪 Chemical:</span>
                        <span className="font-mono">{med.genericName}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateMedicationStatus(med.id, med.status === 'active' ? 'paused' : 'active')}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border cursor-pointer ${
                        med.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-amber-50 text-amber-700 border-amber-300'
                      }`}
                    >
                      {med.status === 'active' ? 'Active သောက်ဆဲ' : 'Paused ရပ်နား'}
                    </button>
                    <button
                      onClick={() => deleteMedication(med.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md cursor-pointer"
                      title="ဖျက်မည်"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-400 text-[10px] block">ဆေးပမာဏ (Dosage)</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {med.dosage}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-400 text-[10px] block">သောက်ချိန် (Schedule)</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {med.frequency}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-400 text-[10px] block">အစားအသောက် ဆက်စပ်မှု</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {med.timing === 'before_meal' && 'အစာမစားမီ'}
                      {med.timing === 'after_meal' && 'အစာစားပြီး'}
                      {med.timing === 'with_meal' && 'အစာစားနေစဉ်'}
                      {med.timing === 'bedtime' && 'ညအိပ်ရာဝင်'}
                      {med.timing === 'anytime' && 'အချိန်မရွေး'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-400 text-[10px] block">စတင်သောက်သည့်ရက်</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {med.startDate}
                    </span>
                  </div>
                </div>

                {/* Notes & Doctor */}
                {med.notes && (
                  <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 bg-sky-50/50 dark:bg-sky-950/20 p-2.5 rounded-xl border border-sky-100 dark:border-sky-900/30">
                    <span className="font-semibold text-sky-800 dark:text-sky-300">မှတ်ချက်: </span>
                    {med.notes}
                  </p>
                )}
              </div>

              {med.prescribingDoctor && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>ဆေးညွှန်းဆရာဝန်:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{med.prescribingDoctor}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Medical Disclaimer */}
      <MedicalDisclaimer />

      {/* Add Medication Modal */}
      {isOpenAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Pill className="w-5 h-5 text-sky-500" />
                ဆေးအသစ် ထည့်သွင်းခြင်း
              </h3>
              <button
                onClick={() => setIsOpenAdd(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {/* Quick Presets */}
            <div className="mt-4">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-sky-500" />
                အသုံးများသော သွေးတိုး/ဆီးချိုဆေးများမှ ရွေးရန်:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 hover:text-sky-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    {p.trade.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Trade Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Generic / Trade Name (Company ဆေးအမည်) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ဥပမာ- Biogesic, Norvasc, Glucophage"
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium"
                />
              </div>

              {/* Chemical Names (Multiple Input Tags) - Mandatory */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Chemical Name (ဆေးအမည် အစစ် / Active Ingredient) *
                  </label>
                  <span className="text-[10px] text-rose-500 font-bold">
                    မထည့်မဖြစ် လိုအပ်သည်
                  </span>
                </div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="ဥပမာ- Paracetamol, Amlodipine (Enter နှိပ်ပါ)"
                    value={chemicalNamesInput}
                    onChange={(e) => {
                      setChemicalNamesInput(e.target.value);
                      if (chemValidationError) setChemValidationError('');
                    }}
                    onKeyDown={handleAddChemicalName}
                    className={`flex-1 px-3.5 py-2.5 rounded-xl border text-slate-900 dark:text-white text-xs ${
                      chemValidationError 
                        ? 'border-rose-400 bg-rose-50/40 dark:bg-rose-950/20' 
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleAddChemicalName}
                    className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
                  >
                    + ထည့်မည်
                  </button>
                </div>

                {chemValidationError && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold mb-2 flex items-center gap-1.5 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                    <span>{chemValidationError}</span>
                  </p>
                )}

                {chemicalNames.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                    {chemicalNames.map((chem, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300 text-[11px] font-bold">
                        <span>🧪 {chem}</span>
                        <button type="button" onClick={() => removeChemicalName(chem)} className="hover:text-rose-600 cursor-pointer ml-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Dosage & Duration Days */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ဆေးပမာဏ (Dosage) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ဥပမာ- 5 mg, 500 mg"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ဘယ်နှစ်ရက်သောက်ရန် (Duration) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ဥပမာ- 30 ရက် (သို့) တစ်လစာ"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              {/* Frequency & Timing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    သောက်ရမည့်အကြိမ် (Frequency) *
                  </label>
                  <select
                    value={selectedFreqOption}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedFreqOption(val);
                      if (val !== 'custom') {
                        setFrequency(val);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium cursor-pointer"
                  >
                    {FREQUENCY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                    <option value="custom">✏️ အခြား (စိတ်ကြိုက်ရေးသွင်းမည်)...</option>
                  </select>

                  {selectedFreqOption === 'custom' && (
                    <input
                      type="text"
                      required
                      placeholder="စိတ်ကြိုက် သောက်ရမည့် အကြိမ် ရေးပါ (ဥပမာ- ၂ ရက် ၁ ကြိမ်)"
                      value={customFrequency}
                      onChange={(e) => {
                        setCustomFrequency(e.target.value);
                        setFrequency(e.target.value);
                      }}
                      className="mt-2 w-full px-3.5 py-2 rounded-xl border border-sky-300 dark:border-sky-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    အစားအသောက် ဆက်စပ်မှု
                  </label>
                  <select
                    value={timing}
                    onChange={(e: any) => setTiming(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium cursor-pointer"
                  >
                    <option value="after_meal">အစာစားပြီး</option>
                    <option value="before_meal">အစာမစားမီ</option>
                    <option value="with_meal">အစာစားနေစဉ်</option>
                    <option value="bedtime">ညအိပ်ရာဝင်</option>
                    <option value="anytime">အချိန်မရွေး</option>
                  </select>
                </div>
              </div>

              {/* Prescribed For & Doctor */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ကုသရန် ရောဂါ (Condition)
                  </label>
                  <input
                    type="text"
                    placeholder="ဥပမာ- သွေးတိုး၊ ဆီးချို"
                    value={prescribedFor}
                    onChange={(e) => setPrescribedFor(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ဆေးညွှန်းဆရာဝန်
                  </label>
                  <input
                    type="text"
                    value={prescribingDoctor}
                    onChange={(e) => setPrescribingDoctor(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  မှတ်ချက် သို့မဟုတ် သတိပြုရန် (Notes)
                </label>
                <input
                  type="text"
                  placeholder="ဥပမာ- ရေများများသောက်ရန်"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOpenAdd(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'သိမ်းဆည်းနေသည်...' : 'ဆေးမှတ်တမ်းသိမ်းမည်'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
