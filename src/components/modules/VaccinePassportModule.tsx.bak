import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  Trash2,
  BookmarkPlus,
  BookOpen,
  X,
  FileCheck2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { useToast } from '../../context/ToastContext';
import { VaccinationRecord } from '../../types/health';
import { MedicalDisclaimer } from '../common/MedicalDisclaimer';
import { Modal } from '../common/Modal';

// Standard Read-Only Recommended Vaccines Reference Guide for Myanmar Families
export interface RecommendedVaccine {
  id: string;
  vaccineName: string;
  targetDisease: string;
  doseNumber: number;
  totalDoses: number;
  category: 'adult' | 'child' | 'travel';
  notes: string;
}

export const RECOMMENDED_VACCINES: RecommendedVaccine[] = [
  {
    id: 'rec-hepb',
    vaccineName: 'ဘီပိုး ကာကွယ်ဆေး (Hepatitis B)',
    targetDisease: 'အသည်းရောင် ဘီပိုးနှင့် အသည်းကင်ဆာ',
    doseNumber: 1,
    totalDoses: 3,
    category: 'adult',
    notes: 'အသည်းရောင် ဘီပိုး (၃) ကြိမ် အပြည့်ထိုးနှံပြီးပါက သက်တမ်းတစ်လျှောက် အကာအကွယ်ရရှိပါသည်။'
  },
  {
    id: 'rec-flu',
    vaccineName: 'တုပ်ကွေး ကာကွယ်ဆေး (Influenza / Flu)',
    targetDisease: 'ရာသီတုပ်ကွေး နှင့် အဆုတ်ရောင်',
    doseNumber: 1,
    totalDoses: 1,
    category: 'adult',
    notes: 'အသက်ကြီးသူများနှင့် နာတာရှည်ရောဂါရှိသူများ နှစ်စဉ် ၁ ကြိမ် ထိုးနှံရန် အကြံပြုပါသည်။'
  },
  {
    id: 'rec-tdap',
    vaccineName: 'မေးခိုင် နှင့် ဆုံဆို့ (Tdap / Tetanus)',
    targetDisease: 'မေးခိုင်၊ ဆုံဆို့ နှင့် ကြက်ညှာချောင်းဆိုး',
    doseNumber: 1,
    totalDoses: 1,
    category: 'adult',
    notes: '၁၀ နှစ်လျှင် ၁ ကြိမ် Booster ထိုးပေးရန် လိုအပ်ပါသည်။'
  },
  {
    id: 'rec-covid',
    vaccineName: 'ကိုဗစ်-၁၉ Booster (COVID-19)',
    targetDisease: 'COVID-19 ဗိုင်းရပ်စ်',
    doseNumber: 1,
    totalDoses: 4,
    category: 'adult',
    notes: 'အသက်အရွယ်နှင့် ကျန်းမာရေးအခြေအနေအရ လိုအပ်ပါက ထပ်ဆောင်းထိုးနှံရန်။'
  },
  {
    id: 'rec-hpv',
    vaccineName: 'သားအိမ်ခေါင်း ကင်ဆာ (HPV Vaccine)',
    targetDisease: 'HPV ဗိုင်းရပ်စ်နှင့် သားအိမ်ခေါင်းကင်ဆာ',
    doseNumber: 1,
    totalDoses: 2,
    category: 'adult',
    notes: 'အသက် ၉ နှစ်မှ ၂၆ နှစ်အတွင်း အမျိုးသမီးများ ထိုးနှံရန် သင့်တော်ပါသည်။'
  },
  {
    id: 'rec-mmr',
    vaccineName: 'ဝက်သက် နှင့် ဂျာမန်ဝက်သက် (MMR)',
    targetDisease: 'ဝက်သက်၊ ဂျာမန်ဝက်သက်၊ ပါးချိတ်ရောင်',
    doseNumber: 1,
    totalDoses: 2,
    category: 'child',
    notes: 'ကလေး မွေးကင်းစ အသက် ၉ လနှင့် ၁ နှစ်ခွဲတွင် ထိုးနှံရန် အကြံပြုပါသည်။'
  },
  {
    id: 'rec-je',
    vaccineName: 'ဦးနှောက်ရောင် (Japanese Encephalitis)',
    targetDisease: 'ဂျပန်ဦးနှောက်ရောင် ရောဂါ',
    doseNumber: 1,
    totalDoses: 1,
    category: 'child',
    notes: 'ကလေးတိုင်း ထိုးနှံရန် မဖြစ်မနေ အရေးကြီးပါသည်။'
  }
];

export const VaccinePassportModule: React.FC = () => {
  const { profile } = useAuth();
  const { 
    selectedPatient, 
    vaccineRecords, 
    addVaccineRecord, 
    updateVaccineRecord, 
    deleteVaccineRecord 
  } = useHealthData();
  const { showToast } = useToast();
  const currentPatient = selectedPatient || profile;

  // View tabs: 'records' for real user records, 'recommendations' for reference guide
  const [activeView, setActiveView] = useState<'records' | 'recommendations'>('records');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'adult' | 'child'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // New / Edit Record Form State
  const [newVaccineName, setNewVaccineName] = useState('');
  const [newTargetDisease, setNewTargetDisease] = useState('');
  const [newDoseNumber, setNewDoseNumber] = useState(1);
  const [newTotalDoses, setNewTotalDoses] = useState(1);
  const [newCategory, setNewCategory] = useState<'adult' | 'child' | 'travel'>('adult');
  const [newDate, setNewDate] = useState('');
  const [newNextDate, setNewNextDate] = useState('');
  const [newAdministeredBy, setNewAdministeredBy] = useState('');
  const [newBatchNumber, setNewBatchNumber] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Open modal pre-filled from Recommended Vaccine
  const handlePreFillFromRecommendation = (rec: RecommendedVaccine) => {
    setNewVaccineName(rec.vaccineName);
    setNewTargetDisease(rec.targetDisease);
    setNewDoseNumber(rec.doseNumber);
    setNewTotalDoses(rec.totalDoses);
    setNewCategory(rec.category);
    setNewDate(new Date().toISOString().split('T')[0]);
    setNewNextDate('');
    setNewAdministeredBy('');
    setNewBatchNumber('');
    setNewNotes(rec.notes);
    setShowAddModal(true);
  };

  const handleOpenBlankModal = () => {
    setNewVaccineName('');
    setNewTargetDisease('');
    setNewDoseNumber(1);
    setNewTotalDoses(1);
    setNewCategory('adult');
    setNewDate(new Date().toISOString().split('T')[0]);
    setNewNextDate('');
    setNewAdministeredBy('');
    setNewBatchNumber('');
    setNewNotes('');
    setShowAddModal(true);
  };

  const handleAddVaccine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVaccineName.trim()) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      await addVaccineRecord({
        userId: currentPatient?.id || '',
        patientName: currentPatient?.displayName || 'လူနာ',
        vaccineName: newVaccineName.trim(),
        targetDisease: newTargetDisease.trim() || 'ကာကွယ်ဆေး',
        doseNumber: Number(newDoseNumber),
        totalDoses: Number(newTotalDoses),
        dateAdministered: newDate || new Date().toISOString().split('T')[0],
        nextDueDate: newNextDate || undefined,
        administeredBy: newAdministeredBy.trim() || undefined,
        batchNumber: newBatchNumber.trim() || undefined,
        status: newDate ? 'completed' : 'scheduled',
        category: newCategory,
        notes: newNotes.trim() || undefined,
      });

      setShowAddModal(false);
      setActiveView('records');
      setStatusMessage('ကာကွယ်ဆေး မှတ်တမ်းကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ');
      showToast('ကာကွယ်ဆေး မှတ်တမ်းကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ', 'success');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      console.error('Failed to save vaccine record:', err);
      setStatusMessage('ကာကွယ်ဆေး သိမ်းဆည်းရာတွင် အမှားဖြစ်ပေါ်ခဲ့ပါသည်');
      showToast('ကာကွယ်ဆေး သိမ်းဆည်းရာတွင် အမှားဖြစ်ပေါ်ခဲ့ပါသည်', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (record: VaccinationRecord) => {
    const nextStatus = record.status === 'completed' ? 'scheduled' : 'completed';
    try {
      await updateVaccineRecord(record.id, {
        status: nextStatus,
        dateAdministered: nextStatus === 'completed' 
          ? (record.dateAdministered || new Date().toISOString().split('T')[0]) 
          : undefined
      });
      showToast(nextStatus === 'completed' ? 'ကာကွယ်ဆေး ထိုးပြီးအဖြစ် မှတ်သားပြီးပါပြီ' : 'ကာကွယ်ဆေး မထိုးရသေးအဖြစ် ပြောင်းလဲပြီးပါပြီ', 'success');
    } catch (err) {
      console.error('Failed to toggle vaccine status:', err);
      showToast('ကာကွယ်ဆေး အခြေအနေ ပြောင်းလဲခြင်း မအောင်မြင်ပါ', 'error');
    }
  };

  const handleDeleteRecord = async (id: string, name: string) => {
    if (!window.confirm(`"${name}" ကာကွယ်ဆေးမှတ်တမ်းကို အပြီးတိုင် ဖျက်ပစ်ရန် သေချာပါသလား?`)) {
      return;
    }
    try {
      await deleteVaccineRecord(id);
      showToast(`"${name}" ကာကွယ်ဆေးမှတ်တမ်းကို ဖျက်ပစ်ပြီးပါပြီ`, 'success');
    } catch (err) {
      console.error('Failed to delete vaccine record:', err);
      showToast('ကာကွယ်ဆေး မှတ်တမ်း ဖျက်ပစ်ခြင်း မအောင်မြင်ပါ', 'error');
    }
  };

  // Filter actual user records
  const filteredRecords = vaccineRecords.filter(r => {
    const matchesCat = categoryFilter === 'all' || r.category === categoryFilter;
    const matchesSearch = r.vaccineName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.targetDisease.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Filter recommended vaccines reference
  const filteredRecommendations = RECOMMENDED_VACCINES.filter(r => {
    const matchesCat = categoryFilter === 'all' || r.category === categoryFilter;
    const matchesSearch = r.vaccineName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.targetDisease.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const completedCount = vaccineRecords.filter(r => r.status === 'completed').length;
  const scheduledCount = vaccineRecords.filter(r => r.status === 'scheduled').length;

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
              {currentPatient?.displayName || 'မိသားစုဝင်'} ၏ တရားဝင် ကာကွယ်ဆေး ထိုးနှံပြီးစီးမှု မှတ်တမ်းများနှင့် အကြံပြုချက်များ
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenBlankModal}
          className="px-4 py-2.5 bg-white text-teal-800 hover:bg-teal-50 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>ကာကွယ်ဆေး အသစ်ထည့်မည်</span>
        </button>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

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
            <p className="text-xs font-bold text-sky-800">လက်ရှိ လူနာ / မိသားစုဝင်</p>
            <p className="text-base font-extrabold text-sky-900 mt-0.5 truncate max-w-[160px]">
              {currentPatient?.displayName || 'မိသားစုဝင်'}
            </p>
          </div>
          <User className="w-8 h-8 text-sky-600" />
        </div>
      </div>

      {/* Controls: View Tabs, Search & Category Filter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Main View Toggle: My Records vs Recommended Guide */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveView('records')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'records' 
                  ? 'bg-teal-700 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>ထိုးနှံထားသော မှတ်တမ်းများ ({vaccineRecords.length})</span>
            </button>
            <button
              onClick={() => setActiveView('recommendations')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'recommendations' 
                  ? 'bg-teal-700 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>အကြံပြု ကာကွယ်ဆေး လမ်းညွှန် ({RECOMMENDED_VACCINES.length})</span>
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
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-teal-500 bg-slate-50"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-semibold text-[11px] mr-1">ကဏ္ဍ:</span>
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              categoryFilter === 'all' ? 'bg-slate-200 text-slate-900 font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            အားလုံး
          </button>
          <button
            onClick={() => setCategoryFilter('adult')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              categoryFilter === 'adult' ? 'bg-teal-100 text-teal-800 font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            လူကြီး ကာကွယ်ဆေး
          </button>
          <button
            onClick={() => setCategoryFilter('child')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              categoryFilter === 'child' ? 'bg-purple-100 text-purple-800 font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ကလေး ကာကွယ်ဆေး
          </button>
        </div>
      </div>

      {/* 1. VIEW: Real Patient Records */}
      {activeView === 'records' && (
        <div>
          {filteredRecords.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                <Syringe className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                {currentPatient?.displayName} အတွက် ကာကွယ်ဆေး မှတ်တမ်း မရှိသေးပါ
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                အောက်ပါ အကြံပြုထားသော စံပြကာကွယ်ဆေးများမှ ရွေးချယ်၍ဖြစ်စေ၊ ကာကွယ်ဆေး အသစ်ထည့်သွင်း၍ဖြစ်စေ တိုက်ရိုက် မှတ်တမ်းတင်နိုင်ပါသည်။
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleOpenBlankModal}
                  className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>ကာကွယ်ဆေး အသစ်ထည့်မည်</span>
                </button>
                <button
                  onClick={() => setActiveView('recommendations')}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4 text-teal-600" />
                  <span>အကြံပြု ကာကွယ်ဆေးများ ကြည့်မည်</span>
                </button>
              </div>
            </div>
          ) : (
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

                      {/* Status Toggle & Delete Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleToggleStatus(vac)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
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

                        <button
                          onClick={() => handleDeleteRecord(vac.id, vac.vaccineName)}
                          aria-label={`${vac.vaccineName} ဖျက်မည်`}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="မှတ်တမ်း ဖျက်မည်"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Vaccine Notes & Dates */}
                    <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                      {vac.dateAdministered && (
                        <p className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>ထိုးနှံခဲ့သည့်ရက်စွဲ: {vac.dateAdministered}</span>
                        </p>
                      )}

                      {vac.nextDueDate && (
                        <p className="flex items-center gap-1.5 text-amber-800 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>နောက်တစ်ကြိမ် ထိုးနှံရန် ရက်စွဲ: {vac.nextDueDate}</span>
                        </p>
                      )}

                      {vac.administeredBy && (
                        <p className="text-[11px] text-slate-500">
                          ထိုးနှံပေးသူ/ဆေးခန်း: <span className="font-medium text-slate-700">{vac.administeredBy}</span>
                        </p>
                      )}

                      {vac.batchNumber && (
                        <p className="text-[11px] text-slate-500">
                          Batch No: <span className="font-mono text-slate-700">{vac.batchNumber}</span>
                        </p>
                      )}

                      {vac.notes && (
                        <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-lg mt-1">
                          "{vac.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. VIEW: Recommended Vaccines Reference Guide (Read-Only reference, status: 'မှတ်တမ်းမရှိသေး') */}
      {activeView === 'recommendations' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-950 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">မြန်မာမိသားစုများအတွက် ထိုးနှံရန် အကြံပြုထားသော စံပြကာကွယ်ဆေးများ လမ်းညွှန်</p>
              <p className="text-slate-600 leading-relaxed">
                ဤစာရင်းသည် ဆေးပညာဆိုင်ရာ လမ်းညွှန်ချက်ဖြစ်ပါသည်။ ထိုးနှံပြီးပါက သို့မဟုတ် ထိုးနှံရန် အစီအစဉ်ရှိပါက <strong>"မှတ်တမ်းတင်မည်"</strong> ကို နှိပ်၍ သင့်လူနာမှတ်တမ်းထဲသို့ ရက်စွဲနှင့် အကြိမ်ရေကို တိုက်ရိုက် ထည့်သွင်းသိမ်းဆည်းနိုင်ပါသည်။
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRecommendations.map((rec) => {
              // Check if patient already recorded this vaccine
              const existingRecord = vaccineRecords.find(r => 
                r.vaccineName.toLowerCase().includes(rec.vaccineName.toLowerCase().split(' ')[0])
              );

              return (
                <div 
                  key={rec.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                        <Syringe className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-slate-900">{rec.vaccineName}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            rec.category === 'adult' ? 'bg-teal-100 text-teal-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {rec.category === 'adult' ? 'လူကြီး' : 'ကလေး'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 font-medium">
                          ကာကွယ်ပေးသော ရောဂါ: <span className="font-bold text-slate-800">{rec.targetDisease}</span>
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          အကြံပြု အကြိမ်အရေအတွက်: <strong>{rec.totalDoses} ကြိမ်</strong>
                        </p>
                      </div>
                    </div>

                    {/* Status Badge: Not Recorded yet / Already has record */}
                    <div className="shrink-0 text-right">
                      {existingRecord ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>မှတ်တမ်းတင်ပြီး</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>မှတ်တမ်းမရှိသေး</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl leading-relaxed">
                    💡 {rec.notes}
                  </p>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                    <span className="text-[11px] text-slate-400 font-medium">စံသတ်မှတ်ချက် လမ်းညွှန်</span>
                    <button
                      onClick={() => handlePreFillFromRecommendation(rec)}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      <span>{existingRecord ? 'ထပ်မံထိုးနှံမှု မှတ်တမ်းတင်မည်' : 'မှတ်တမ်းတင်မည်'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Medical Disclaimer */}
      <MedicalDisclaimer />

      {/* Add / Edit Vaccine Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        size="md"
        title={
          <span className="flex items-center gap-2">
            <Syringe className="w-5 h-5 text-teal-600" />
            <span>ကာကွယ်ဆေး မှတ်တမ်းအသစ် ထည့်သွင်းမည်</span>
          </span>
        }
      >
        <div className="p-5 sm:p-6">
          <form onSubmit={handleAddVaccine} className="space-y-3.5 text-xs">
            <div>
              <label htmlFor="vac-name" className="font-semibold text-slate-700 block mb-1">
                ကာကွယ်ဆေး အမည် *
              </label>
              <input
                id="vac-name"
                type="text"
                required
                placeholder="ဥပမာ- ဘီပိုး / တုပ်ကွေး / MMR"
                value={newVaccineName}
                onChange={(e) => setNewVaccineName(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-hidden bg-slate-50"
              />
            </div>

            <div>
              <label htmlFor="vac-target" className="font-semibold text-slate-700 block mb-1">
                ကာကွယ်ပေးသည့် ရောဂါ
              </label>
              <input
                id="vac-target"
                type="text"
                placeholder="ဥပမာ- အသည်းရောင် ဘီပိုးနှင့် အသည်းကင်ဆာ"
                value={newTargetDisease}
                onChange={(e) => setNewTargetDisease(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-hidden bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="vac-dose-num" className="font-semibold text-slate-700 block mb-1">
                  လက်ရှိ အကြိမ်မြောက်
                </label>
                <input
                  id="vac-dose-num"
                  type="number"
                  min="1"
                  value={newDoseNumber}
                  onChange={(e) => setNewDoseNumber(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-hidden bg-slate-50"
                />
              </div>
              <div>
                <label htmlFor="vac-total-doses" className="font-semibold text-slate-700 block mb-1">
                  စုစုပေါင်း အကြိမ်ရေ
                </label>
                <input
                  id="vac-total-doses"
                  type="number"
                  min="1"
                  value={newTotalDoses}
                  onChange={(e) => setNewTotalDoses(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-hidden bg-slate-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="vac-category" className="font-semibold text-slate-700 block mb-1">
                  အမျိုးအစား
                </label>
                <select
                  id="vac-category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-hidden bg-white"
                >
                  <option value="adult">လူကြီး</option>
                  <option value="child">ကလေး</option>
                  <option value="travel">ခရီးသွား/အထူး</option>
                </select>
              </div>
              <div>
                <label htmlFor="vac-date" className="font-semibold text-slate-700 block mb-1">
                  ထိုးနှံခဲ့သည့်ရက်
                </label>
                <input
                  id="vac-date"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-hidden bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="vac-next-date" className="font-semibold text-slate-700 block mb-1">
                နောက်တစ်ကြိမ် ထိုးရမည့်ရက် (ရှိပါက)
              </label>
              <input
                id="vac-next-date"
                type="date"
                value={newNextDate}
                onChange={(e) => setNewNextDate(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-hidden bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="vac-admin-by" className="font-semibold text-slate-700 block mb-1">
                  ထိုးပေးသူ/ဆေးရုံဆေးခန်း
                </label>
                <input
                  id="vac-admin-by"
                  type="text"
                  placeholder="ဥပမာ- ရန်ကုန်ပြည်သူ့ဆေးရုံ"
                  value={newAdministeredBy}
                  onChange={(e) => setNewAdministeredBy(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-hidden bg-slate-50"
                />
              </div>
              <div>
                <label htmlFor="vac-batch" className="font-semibold text-slate-700 block mb-1">
                  Batch / Lot No.
                </label>
                <input
                  id="vac-batch"
                  type="text"
                  placeholder="ဥပမာ- BTH-2026-09"
                  value={newBatchNumber}
                  onChange={(e) => setNewBatchNumber(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-hidden bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="vac-notes" className="font-semibold text-slate-700 block mb-1">
                မှတ်ချက် / အကြံပြုချက်
              </label>
              <textarea
                id="vac-notes"
                rows={2}
                placeholder="သတိပြုရန်၊ ဘေးထွက်ဆိုးကျိုး သို့မဟုတ် ဆရာဝန်ညွှန်ကြားချက်..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-teal-500 focus:outline-hidden bg-slate-50"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl font-semibold hover:bg-slate-100 cursor-pointer"
              >
                မလုပ်တော့ပါ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-teal-700 text-white font-bold rounded-xl hover:bg-teal-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>သိမ်းဆည်းနေသည်...</span>
                  </>
                ) : (
                  <span>သိမ်းဆည်းမည်</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};
