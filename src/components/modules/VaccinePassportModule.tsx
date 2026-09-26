import React, { useState } from 'react';
import { 
  Syringe, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Calendar, 
  ShieldCheck, 
  AlertCircle, 
  Info, 
  User, 
  Baby, 
  Search,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { VaccinationRecord } from '../../types/health';

// Standard Pre-populated Recommended Vaccines for Myanmar Family
const DEFAULT_VACCINES: Omit<VaccinationRecord, 'id' | 'userId'>[] = [
  {
    vaccineName: 'ဘီပိုး ကာကွယ်ဆေး (Hepatitis B)',
    targetDisease: 'အသည်းရောင် ဘီပိုးနှင့် အသည်းကင်ဆာ',
    doseNumber: 3,
    totalDoses: 3,
    status: 'completed',
    category: 'adult',
    notes: 'အသည်းရောင် ဘီပိုး (၃) ကြိမ် အပြည့်ထိုးနှံပြီးပါက သက်တမ်းတစ်လျှောက် အကာအကွယ်ရရှိပါသည်။'
  },
  {
    vaccineName: 'တုပ်ကွေး ကာကွယ်ဆေး (Influenza / Flu)',
    targetDisease: 'ရာသီတုပ်ကွေး နှင့် အဆုတ်ရောင်',
    doseNumber: 1,
    totalDoses: 1,
    status: 'scheduled',
    category: 'adult',
    nextDueDate: '2026-11-15',
    notes: 'အသက်ကြီးသူများနှင့် နာတာရှည်ရောဂါရှိသူများ နှစ်စဉ် ၁ ကြိမ် ထိုးနှံရန် အကြံပြုပါသည်။'
  },
  {
    vaccineName: 'မေးခိုင် နှင့် ဆုံဆို့ (Tdap / Tetanus)',
    targetDisease: 'မေးခိုင်၊ ဆုံဆို့ နှင့် ကြက်ညှာချောင်းဆိုး',
    doseNumber: 1,
    totalDoses: 1,
    status: 'completed',
    category: 'adult',
    notes: '၁၀ နှစ်လျှင် ၁ ကြိမ် Booster ထိုးပေးရန် လိုအပ်ပါသည်။'
  },
  {
    vaccineName: 'ကိုဗစ်-၁၉ Booster (COVID-19)',
    targetDisease: 'COVID-19 ဗိုင်းရပ်စ်',
    doseNumber: 4,
    totalDoses: 4,
    status: 'completed',
    category: 'adult',
    notes: 'နောက်ဆုံး ထိုးနှံခဲ့သည့်ရက်စွဲ: 2025-06-10'
  },
  {
    vaccineName: 'သားအိမ်ခေါင်း ကင်ဆာ (HPV Vaccine)',
    targetDisease: 'HPV ဗိုင်းရပ်စ်နှင့် သားအိမ်ခေါင်းကင်ဆာ',
    doseNumber: 2,
    totalDoses: 2,
    status: 'scheduled',
    category: 'adult',
    nextDueDate: '2026-12-01',
    notes: 'အသက် ၉ နှစ်မှ ၂၆ နှစ်အတွင်း အမျိုးသမီးများ ထိုးနှံရန် သင့်တော်ပါသည်။'
  },
  {
    vaccineName: 'ဝက်သက် နှင့် ဂျာမန်ဝက်သက် (MMR)',
    targetDisease: 'ဝက်သက်၊ ဂျာမန်ဝက်သက်၊ ပါးချိတ်ရောင်',
    doseNumber: 2,
    totalDoses: 2,
    status: 'completed',
    category: 'child',
    notes: 'ကလေး မွေးကင်းစ အသက် ၉ လနှင့် ၁ နှစ်ခွဲတွင် ထိုးနှံခဲ့ပါသည်။'
  },
  {
    vaccineName: 'ဦးနှောက်ရောင် (Japanese Encephalitis)',
    targetDisease: 'ဂျပန်ဦးနှောက်ရောင် ရောဂါ',
    doseNumber: 1,
    totalDoses: 1,
    status: 'completed',
    category: 'child',
    notes: 'ကလေးတိုင်း ထိုးနှံရန် မဖြစ်မနေ အရေးကြီးပါသည်။'
  }
];

export const VaccinePassportModule: React.FC = () => {
  const { profile } = useAuth();
  const { selectedPatient } = useHealthData();
  const currentPatient = selectedPatient || profile;

  const [records, setRecords] = useState<VaccinationRecord[]>(() => {
    return DEFAULT_VACCINES.map((v, i) => ({
      ...v,
      id: `vac-${i + 1}`,
      userId: currentPatient?.id || 'p-1',
      patientName: currentPatient?.displayName || 'လူနာ'
    }));
  });

  const [categoryFilter, setCategoryFilter] = useState<'all' | 'adult' | 'child'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Record Form State
  const [newVaccineName, setNewVaccineName] = useState('');
  const [newTargetDisease, setNewTargetDisease] = useState('');
  const [newDoseNumber, setNewDoseNumber] = useState(1);
  const [newTotalDoses, setNewTotalDoses] = useState(1);
  const [newCategory, setNewCategory] = useState<'adult' | 'child'>('adult');
  const [newDate, setNewDate] = useState('');
  const [newNextDate, setNewNextDate] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const handleAddVaccine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVaccineName.trim()) return;

    const newRecord: VaccinationRecord = {
      id: `vac-custom-${Date.now()}`,
      userId: currentPatient?.id || 'p-1',
      patientName: currentPatient?.displayName || 'လူနာ',
      vaccineName: newVaccineName.trim(),
      targetDisease: newTargetDisease.trim() || 'ကာကွယ်ဆေး',
      doseNumber: Number(newDoseNumber),
      totalDoses: Number(newTotalDoses),
      dateAdministered: newDate || new Date().toISOString().split('T')[0],
      nextDueDate: newNextDate || undefined,
      status: newDate ? 'completed' : 'scheduled',
      category: newCategory,
      notes: newNotes.trim(),
      createdAt: new Date().toISOString()
    };

    setRecords([newRecord, ...records]);

    // Reset Form
    setNewVaccineName('');
    setNewTargetDisease('');
    setNewDoseNumber(1);
    setNewTotalDoses(1);
    setNewDate('');
    setNewNextDate('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const toggleStatus = (id: string) => {
    setRecords(records.map(r => {
      if (r.id === id) {
        const nextStatus = r.status === 'completed' ? 'scheduled' : 'completed';
        return {
          ...r,
          status: nextStatus,
          dateAdministered: nextStatus === 'completed' ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return r;
    }));
  };

  const filteredRecords = records.filter(r => {
    const matchesCat = categoryFilter === 'all' || r.category === categoryFilter;
    const matchesSearch = r.vaccineName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.targetDisease.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const completedCount = records.filter(r => r.status === 'completed').length;
  const scheduledCount = records.filter(r => r.status === 'scheduled').length;

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-emerald-800 text-white p-6 rounded-3xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs shrink-0">
            <Syringe className="w-8 h-8 text-teal-200" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">ကာကွယ်ဆေး ထိုးနှံမှု မှတ်တမ်းနှင့် အချိန်ဇယား (Vaccination Passport)</h2>
            <p className="text-xs text-teal-100 mt-1">
              မိသားစုဝင်များ၏ ကာကွယ်ဆေး ထိုးနှံပြီးစီးမှုနှင့် နောက်တစ်ကြိမ် ထိုးနှံရမည့် အချိန်ဇယားများ
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-white text-teal-800 hover:bg-teal-50 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>ကာကွယ်ဆေး အသစ်ထည့်မည်</span>
        </button>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-800">ထိုးနှံပြီးစီးခဲ့သော ကာကွယ်ဆေး</p>
            <p className="text-2xl font-black text-emerald-900 mt-0.5">{completedCount} မျိုး</p>
          </div>
          <ShieldCheck className="w-8 h-8 text-emerald-600" />
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-800">ထိုးနှံရန် အစီအစဉ်ရှိသော ကာကွယ်ဆေး</p>
            <p className="text-2xl font-black text-amber-900 mt-0.5">{scheduledCount} မျိုး</p>
          </div>
          <Clock className="w-8 h-8 text-amber-600" />
        </div>

        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-sky-800">လက်ရှိ စစ်ဆေးနေသော လူနာ</p>
            <p className="text-base font-extrabold text-sky-900 mt-0.5 truncate max-w-[160px]">
              {currentPatient?.displayName || 'မိသားစုဝင်'}
            </p>
          </div>
          <User className="w-8 h-8 text-sky-600" />
        </div>
      </div>

      {/* Controls: Search & Category Filter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              categoryFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            အားလုံး ({records.length})
          </button>
          <button
            onClick={() => setCategoryFilter('adult')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              categoryFilter === 'adult' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            လူကြီး ကာကွယ်ဆေး
          </button>
          <button
            onClick={() => setCategoryFilter('child')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              categoryFilter === 'child' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ကလေး ကာကွယ်ဆေး
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="ကာကွယ်ဆေးအမည် ရှာဖွေရန်..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 bg-slate-50"
          />
        </div>
      </div>

      {/* Vaccination Record Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecords.map((vac) => {
          const isDone = vac.status === 'completed';

          return (
            <div 
              key={vac.id}
              className={`border rounded-2xl p-4 transition-all bg-white relative ${
                isDone ? 'border-emerald-200 shadow-xs' : 'border-amber-200 bg-amber-50/20'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    <Syringe className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-slate-900">{vac.vaccineName}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        vac.category === 'adult' ? 'bg-teal-100 text-teal-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {vac.category === 'adult' ? 'လူကြီး' : 'ကလေး'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-0.5 font-medium">
                      ကာကွယ်ပေးသော ရောဂါ: <span className="font-bold text-slate-800">{vac.targetDisease}</span>
                    </p>

                    <p className="text-[11px] text-slate-500 mt-1">
                      ထိုးနှံမှု အကြိမ်: <strong>{vac.doseNumber} / {vac.totalDoses}</strong> ကြိမ်မြောက်
                    </p>
                  </div>
                </div>

                {/* Status Toggle Button */}
                <button
                  onClick={() => toggleStatus(vac.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                    isDone 
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                      : 'bg-amber-500 text-white hover:bg-amber-600'
                  }`}
                  title="အခြေအနေ ပြောင်းလဲရန် နှိပ်ပါ"
                >
                  {isDone ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ထိုးပြီး</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5" />
                      <span>ထိုးရန်ကျန်</span>
                    </>
                  )}
                </button>
              </div>

              {/* Vaccine Notes & Dates */}
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                {vac.dateAdministered && (
                  <p className="flex items-center gap-1 text-emerald-800 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>နောက်ဆုံး ထိုးနှံခဲ့သည့်ရက်: {vac.dateAdministered}</span>
                  </p>
                )}

                {vac.nextDueDate && (
                  <p className="flex items-center gap-1 text-amber-800 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>နောက်တစ်ကြိမ် ထိုးနှံရန် ရက်စွဲ: {vac.nextDueDate}</span>
                  </p>
                )}

                {vac.notes && (
                  <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg mt-1">
                    "{vac.notes}"
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Vaccine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Syringe className="w-5 h-5 text-teal-600" />
              <span>ကာကွယ်ဆေး မှတ်တမ်းအသစ် ထည့်သွင်းမည်</span>
            </h3>

            <form onSubmit={handleAddVaccine} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">ကာကွယ်ဆေး အမည် *</label>
                <input
                  type="text"
                  required
                  placeholder="ဥပမာ- ဘီပိုး / တုပ်ကွေး"
                  value={newVaccineName}
                  onChange={(e) => setNewVaccineName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">ကာကွယ်ပေးသည့် ရောဂါ</label>
                <input
                  type="text"
                  placeholder="ဥပမာ- အသည်းရောင် ဘီပိုး"
                  value={newTargetDisease}
                  onChange={(e) => setNewTargetDisease(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">လက်ရှိ အကြိမ်</label>
                  <input
                    type="number"
                    min="1"
                    value={newDoseNumber}
                    onChange={(e) => setNewDoseNumber(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">စုစုပေါင်း အကြိမ်</label>
                  <input
                    type="number"
                    min="1"
                    value={newTotalDoses}
                    onChange={(e) => setNewTotalDoses(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">အမျိုးအစား</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none bg-white"
                  >
                    <option value="adult">လူကြီး</option>
                    <option value="child">ကလေး</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ထိုးခဲ့သည့်ရက်</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">နောက်တစ်ကြိမ် ထိုးရမည့်ရက် (ရှိပါက)</label>
                <input
                  type="date"
                  value={newNextDate}
                  onChange={(e) => setNewNextDate(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">မှတ်ချက် / အကြံပြုချက်</label>
                <textarea
                  rows={2}
                  placeholder="ဆေးခန်းအမည် သို့မဟုတ် သတိပြုရန်..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 text-white font-bold rounded-xl hover:bg-teal-800 transition-colors cursor-pointer"
                >
                  သိမ်းဆည်းမည်
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
