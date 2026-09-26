import React, { useState } from 'react';
import { Pill, Plus, Trash2, CheckCircle2, Clock, AlertCircle, Calendar, Sparkles } from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { useAuth } from '../../context/AuthContext';
import { Medication } from '../../types/health';

export const MedicationsModule: React.FC = () => {
  const { medications, addMedication, updateMedicationStatus, deleteMedication, selectedPatient, selectedFamilyMember } = useHealthData();
  const { profile } = useAuth();

  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused'>('active');

  // Form states
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [dosage, setDosage] = useState('5 mg');
  const [frequency, setFrequency] = useState('မနက် ၁ ကြိမ် (၁ လုံး)');
  const [timing, setTiming] = useState<'before_meal' | 'after_meal' | 'with_meal' | 'bedtime' | 'anytime'>('after_meal');
  const [prescribedFor, setPrescribedFor] = useState('သွေးတိုးရောဂါ (Hypertension)');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [prescribingDoctor, setPrescribingDoctor] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Daily pill checklist tracker in local state
  const [todayChecked, setTodayChecked] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('health_meds_checked_today');
    return saved ? JSON.parse(saved) : {};
  });

  const toggleCheckToday = (medId: string) => {
    const updated = { ...todayChecked, [medId]: !todayChecked[medId] };
    setTodayChecked(updated);
    localStorage.setItem('health_meds_checked_today', JSON.stringify(updated));
  };

  // Filtered meds
  const filteredMeds = filterStatus === 'all'
    ? medications
    : medications.filter(m => m.status === filterStatus);

  const activeCount = medications.filter(m => m.status === 'active').length;

  // Preset drug templates
  const presets = [
    { name: 'Amlodipine (အမ်လိုဒီပင်း)', dose: '5 mg', freq: 'မနက် ၁ လုံး', timing: 'after_meal' as const, for: 'သွေးတိုးရောဂါ' },
    { name: 'Metformin (မက်ဖော်မင်)', dose: '500 mg', freq: 'မနက် ၁ လုံး၊ ည ၁ လုံး', timing: 'with_meal' as const, for: 'ဆီးချိုရောဂါ' },
    { name: 'Atorvastatin (အာတိုဗာစတာတင်)', dose: '10 mg', freq: 'ညအိပ်ရာဝင် ၁ လုံး', timing: 'bedtime' as const, for: 'သွေးတွင်းအဆီကျဆေး' },
    { name: 'Losartan (လိုဆာတန်)', dose: '50 mg', freq: 'မနက် ၁ လုံး', timing: 'after_meal' as const, for: 'သွေးတိုးရောဂါ' },
    { name: 'Allopurinol (အယ်လိုဖြူရီနော)', dose: '100 mg', freq: 'နေ့လယ် ၁ လုံး', timing: 'after_meal' as const, for: 'ယူရစ်အက်စစ်ကျဆေး' },
  ];

  const applyPreset = (p: typeof presets[0]) => {
    setName(p.name);
    setDosage(p.dose);
    setFrequency(p.freq);
    setTiming(p.timing);
    setPrescribedFor(p.for);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !name.trim()) return;
    setIsSubmitting(true);
    try {
      await addMedication({
        userId: selectedPatient ? selectedPatient.id : (selectedFamilyMember ? selectedFamilyMember.id : profile.id),
        name,
        genericName,
        dosage,
        frequency,
        timing,
        prescribedFor,
        startDate,
        status: 'active',
        prescribingDoctor,
        notes,
      });
      setIsOpenAdd(false);
      setName('');
      setNotes('');
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

      {/* Today's Pill Schedule & Compliance Box */}
      <div className="bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-indigo-500/10 dark:from-sky-950/40 dark:via-blue-950/40 dark:to-indigo-950/40 p-5 rounded-3xl border border-sky-200 dark:border-sky-800 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                ယနေ့ ဆေးသောက်ရန် စစ်ဆေးမှု (Today's Medication Tracker)
              </h3>
              <p className="text-xs text-slate-500">
                သောက်ပြီးသော ဆေးများကို အမှန်ခြစ်၍ သောက်သုံးမှု မကျန်စေရန် စောင့်ကြည့်ပါ
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300">
            လက်ရှိသောက်ဆဲ: {activeCount} မျိုး
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
          {medications.filter(m => m.status === 'active').map((med) => {
            const isTaken = !!todayChecked[med.id];
            return (
              <div
                key={med.id}
                onClick={() => toggleCheckToday(med.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
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
                  isTaken ? 'bg-emerald-600 text-white' : 'border border-slate-300 dark:border-slate-600 text-transparent hover:border-sky-500'
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
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {med.name}
                    </h3>
                    {med.genericName && (
                      <p className="text-xs text-slate-400 italic font-mono mt-0.5">
                        {med.genericName}
                      </p>
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
                    {p.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ဆေးအမည် (Medicine Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ဥပမာ- Amlodipine, Metformin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium"
                />
              </div>

              {/* Dosage & Target Condition */}
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
                    ကုသရန် ရောဂါ (Condition)
                  </label>
                  <input
                    type="text"
                    placeholder="ဥပမာ- သွေးတိုး၊ ဆီးချို၊ အဆီကျ"
                    value={prescribedFor}
                    onChange={(e) => setPrescribedFor(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              {/* Frequency & Timing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    သောက်ရမည့်အကြိမ် (Frequency)
                  </label>
                  <input
                    type="text"
                    placeholder="ဥပမာ- မနက် ၁ လုံး၊ ည ၁ လုံး"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    အစားအသောက် ဆက်စပ်မှု
                  </label>
                  <select
                    value={timing}
                    onChange={(e: any) => setTiming(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="after_meal">အစာစားပြီး</option>
                    <option value="before_meal">အစာမစားမီ</option>
                    <option value="with_meal">အစာစားနေစဉ်</option>
                    <option value="bedtime">ညအိပ်ရာဝင်</option>
                    <option value="anytime">အချိန်မရွေး</option>
                  </select>
                </div>
              </div>

              {/* Start Date & Doctor */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    စတင်သောက်သည့်ရက်
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
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
                  သတိပြုရန် သို့မဟုတ် မှတ်ချက် (Notes)
                </label>
                <input
                  type="text"
                  placeholder="ဥပမာ- ရေများများသောက်ရန်၊ ပုံမှန်မပြတ်သောက်ရန်"
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
