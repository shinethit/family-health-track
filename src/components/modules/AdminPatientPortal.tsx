import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Activity, 
  Droplets, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  UserPlus, 
  Stethoscope, 
  Send, 
  Calendar, 
  Pill, 
  FlaskConical, 
  X,
  Trash2,
  RotateCcw,
  RefreshCw,
  Mail,
  Clock,
  Sparkles,
  Database,
  Server,
  Gauge,
  HardDrive,
  Cpu,
  Zap,
  Wifi,
  Layers,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit3,
  UserX,
  AlertCircle,
  Phone,
  Info,
  Volume2,
  Megaphone,
  ToggleLeft,
  ToggleRight,
  Radio
} from 'lucide-react';
import { useHealthData, isPatientOnly } from '../../context/HealthDataContext';
import { useAuth } from '../../context/AuthContext';
import { UserProfile, BroadcastTicker } from '../../types/health';
import { BloodPressureChart, BloodSugarChart } from '../charts/HealthCharts';
import { calculateBPCategory, calculateGlucoseStatus, calculateAge, calculateBMI } from '../../lib/medicalCalculations';
import { EditPatientModal } from './EditPatientModal';
import { DeletePatientModal } from './DeletePatientModal';

export const AdminPatientPortal: React.FC = () => {
  const { 
    patientsList, 
    selectedPatientId, 
    setSelectedPatientId, 
    selectedPatient,
    bpRecords,
    glucoseRecords,
    labRecords,
    medications,
    doctorAdvices,
    addDoctorAdvice,
    addPatient,
    updatePatient,
    deletePatient,
    clearAllPatients,
    broadcastTickers,
    addBroadcastTicker,
    toggleBroadcastTicker,
    deleteBroadcastTicker,
    dbStats,
    refreshAdminData
  } = useHealthData();
  const { profile } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCondition, setFilterCondition] = useState<string>('all');
  const [newAdvice, setNewAdvice] = useState('');
  const [dietAdvice, setDietAdvice] = useState('');
  const [isSendingAdvice, setIsSendingAdvice] = useState(false);
  const [adviceSuccess, setAdviceSuccess] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showQuotaDetails, setShowQuotaDetails] = useState(true);

  // Broadcast Ticker state
  const [newTickerMessage, setNewTickerMessage] = useState('');
  const [newTickerType, setNewTickerType] = useState<'info' | 'warning' | 'urgent'>('info');
  const [isAddingTicker, setIsAddingTicker] = useState(false);

  // Edit & Delete Modal States
  const [editingPatient, setEditingPatient] = useState<UserProfile | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<UserProfile | null>(null);
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Add Patient Modal States
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState<number | string>('');
  const [patientGender, setPatientGender] = useState<'male' | 'female' | 'other'>('male');
  const [patientConditions, setPatientConditions] = useState<string[]>(['သွေးတိုး']);
  const [patientHeight, setPatientHeight] = useState<number | string>('165');
  const [patientWeight, setPatientWeight] = useState<number | string>('65');
  const [patientBloodType, setPatientBloodType] = useState('O+');
  const [isSavingPatient, setIsSavingPatient] = useState(false);

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) return;
    setIsSavingPatient(true);
    try {
      await addPatient({
        displayName: patientName.trim(),
        email: patientEmail.trim() || undefined,
        phone: patientPhone.trim() || undefined,
        age: patientAge ? Number(patientAge) : 45,
        gender: patientGender,
        chronicConditions: patientConditions,
        heightCm: patientHeight ? Number(patientHeight) : 165,
        weightKg: patientWeight ? Number(patientWeight) : 65,
        bloodType: patientBloodType,
      });
      setPatientName('');
      setPatientEmail('');
      setPatientPhone('');
      setPatientAge('');
      setIsAddPatientOpen(false);
      setActionAlert({
        type: 'success',
        message: 'လူနာအသစ်အား Database ထဲသို့ အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ။',
      });
      setTimeout(() => setActionAlert(null), 4000);
    } finally {
      setIsSavingPatient(false);
    }
  };

  const handleSavePatient = async (id: string, updates: Partial<UserProfile>) => {
    try {
      await updatePatient(id, updates);
      setActionAlert({
        type: 'success',
        message: `လူနာ "${updates.displayName || 'အမည်'}" ၏ မှတ်တမ်းအား Cloud Database တွင် အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ။`,
      });
      setTimeout(() => setActionAlert(null), 4000);
    } catch (err: any) {
      setActionAlert({
        type: 'error',
        message: 'လူနာမှတ်တမ်း ပြင်ဆင်ရာတွင် အမှားဖြစ်ပေါ်ခဲ့ပါသည်: ' + (err?.message || ''),
      });
      setTimeout(() => setActionAlert(null), 5000);
      throw err;
    }
  };

  const handleConfirmDeletePatient = async (id: string, cascade: boolean) => {
    try {
      await deletePatient(id, cascade);
      setActionAlert({
        type: 'success',
        message: 'လူနာမှတ်တမ်းနှင့်တကွ ဆက်စပ်ဒေတာများကို Database မှ အပြီးတိုင် ဖျက်ပစ်ပြီးပါပြီ။',
      });
      setTimeout(() => setActionAlert(null), 4000);
    } catch (err: any) {
      setActionAlert({
        type: 'error',
        message: 'လူနာမှတ်တမ်း ဖျက်ရာတွင် အမှားဖြစ်ပေါ်ခဲ့ပါသည်: ' + (err?.message || ''),
      });
      setTimeout(() => setActionAlert(null), 5000);
      throw err;
    }
  };

  // Pure patient list (excluding admin)
  const actualPatients = patientsList.filter(isPatientOnly);

  // Incomplete record detector
  const isIncompletePatient = (p: UserProfile): boolean => {
    const name = (p.displayName || '').trim();
    const email = (p.email || '').toLowerCase().trim();
    const phone = (p.phone || '').trim();

    const isGenericName = !name || name === 'လူနာ' || name === 'အမည်မရှိ' || name.startsWith('pat-') || name.startsWith('user-') || name.includes('6bce6599');
    const isFakeEmail = !email || email.includes('@patient.local') || email.includes('demo');
    const missingPhone = !phone;
    const missingAge = (!p.age || p.age <= 0) && !p.dateOfBirth;
    const missingVitals = !p.heightCm || !p.weightKg;
    const missingConditions = !p.chronicConditions || p.chronicConditions.length === 0;

    return isGenericName || isFakeEmail || missingPhone || missingAge || missingVitals || missingConditions;
  };

  const getMissingFields = (p: UserProfile): string[] => {
    const missing: string[] = [];
    const name = (p.displayName || '').trim();
    const email = (p.email || '').toLowerCase().trim();
    const phone = (p.phone || '').trim();

    if (!name || name === 'လူနာ' || name === 'အမည်မရှိ' || name.startsWith('pat-') || name.startsWith('user-') || name.includes('6bce6599')) {
      missing.push('အမည်မစုံ');
    }
    if (!email || email.includes('@patient.local')) {
      missing.push('အီးမေးလ်မစုံ');
    }
    if (!phone) {
      missing.push('ဖုန်းနံပါတ်မရှိ');
    }
    if ((!p.age || p.age <= 0) && !p.dateOfBirth) {
      missing.push('အသက်မရှိ');
    }
    if (!p.heightCm || !p.weightKg) {
      missing.push('အရပ်/ဝိတ်မရှိ');
    }
    if (!p.chronicConditions || p.chronicConditions.length === 0) {
      missing.push('ရောဂါအခံမရှိ');
    }
    return missing;
  };

  const countIncomplete = actualPatients.filter(isIncompletePatient).length;

  // Filter patients
  const filteredPatients = actualPatients.filter(p => {
    const matchesSearch = (p.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.phone && p.phone.includes(searchTerm));
    
    if (!matchesSearch) return false;

    if (filterCondition === 'incomplete') {
      return isIncompletePatient(p);
    }
    if (filterCondition === 'hypertension') {
      return p.chronicConditions?.some(c => c.includes('သွေးတိုး') || c.toLowerCase().includes('hypertension'));
    }
    if (filterCondition === 'diabetes') {
      return p.chronicConditions?.some(c => c.includes('ဆီးချို') || c.toLowerCase().includes('diabetes'));
    }
    if (filterCondition === 'both') {
      const hasHTN = p.chronicConditions?.some(c => c.includes('သွေးတိုး') || c.toLowerCase().includes('hypertension'));
      const hasDM = p.chronicConditions?.some(c => c.includes('ဆီးချို') || c.toLowerCase().includes('diabetes'));
      return hasHTN && hasDM;
    }
    return true;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAdminData();
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 600);
    }
  };

  const handleSendAdvice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !newAdvice.trim()) return;
    setIsSendingAdvice(true);
    try {
      await addDoctorAdvice(selectedPatientId, newAdvice, dietAdvice);
      setNewAdvice('');
      setDietAdvice('');
      setAdviceSuccess(true);
      setTimeout(() => setAdviceSuccess(false), 3000);
    } finally {
      setIsSendingAdvice(false);
    }
  };

  // If a patient is selected, display their comprehensive clinical dashboard!
  if (selectedPatientId && selectedPatient) {
    const latestBP = bpRecords.length > 0 ? bpRecords[bpRecords.length - 1] : null;
    const latestGlucose = glucoseRecords.length > 0 ? glucoseRecords[glucoseRecords.length - 1] : null;
    const latestLab = labRecords.length > 0 ? labRecords[0] : null;

    const patientAgeObj = calculateAge(selectedPatient.dateOfBirth);
    const resolvedAge = patientAgeObj ? patientAgeObj.years : (selectedPatient.age || null);
    const patientBMI = (selectedPatient.weightKg && selectedPatient.heightCm)
      ? calculateBMI(selectedPatient.weightKg, selectedPatient.heightCm)
      : null;

    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Action Alert Banner */}
        {actionAlert && (
          <div className={`p-4 rounded-3xl border text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
            actionAlert.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200' 
              : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}>
            <div className="flex items-center gap-2">
              {actionAlert.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              <span>{actionAlert.message}</span>
            </div>
            <button 
              onClick={() => setActionAlert(null)}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Back navigation & Patient header */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedPatientId(null)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="လူနာစာရင်းသို့ ပြန်သွားမည်"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedPatient.displayName || 'အမည်မရှိ'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                  လူနာမှတ်တမ်း (Patient Record)
                </span>
                {patientBMI && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${patientBMI.bgColor} ${patientBMI.color} ${patientBMI.borderColor}`}>
                    BMI: {patientBMI.bmi} ({patientBMI.labelMm})
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                <span>အီးမေးလ်: <strong>{selectedPatient.email || '-'}</strong></span>
                <span>•</span>
                <span>ဖုန်း: <strong>{selectedPatient.phone || '-'}</strong></span>
                <span>•</span>
                <span>အသက်: <strong>{resolvedAge !== null ? `${resolvedAge} နှစ်` : 'မထည့်ရသေးပါ'}</strong> {patientAgeObj ? `(${patientAgeObj.formattedMm})` : ''}</span>
                <span>•</span>
                <span>အရပ်: {selectedPatient.heightCm ? `${selectedPatient.heightCm} cm` : '-'} / ကိုယ်အလေးချိန်: {selectedPatient.weightKg ? `${selectedPatient.weightKg} kg` : '-'}</span>
                <span>•</span>
                <span>ကျား/မ: {selectedPatient.gender === 'female' ? 'မ' : selectedPatient.gender === 'male' ? 'ကျား' : '-'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setEditingPatient(selectedPatient)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="လူနာအချက်အလက်များ ပြင်ဆင်မည်"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>ပြင်ဆင်မည်</span>
            </button>
            <button
              onClick={() => setDeletingPatient(selectedPatient)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/80 hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer flex items-center gap-1.5"
              title="လူနာမှတ်တမ်း ဖျက်ပစ်မည်"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>လူနာဖျက်မည်</span>
            </button>
            <button
              onClick={() => setSelectedPatientId(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              လူနာများစာရင်းသို့ ပြန်သွားမည်
            </button>
          </div>
        </div>

        {/* Clinical Quick Snapshot Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* BP Card */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                <Activity className="w-5 h-5" />
                <span>နောက်ဆုံး သွေးပေါင်ချိန် (BP)</span>
              </div>
              {latestBP && (
                <span className="text-[10px] text-slate-400">
                  {new Date(latestBP.createdAt || latestBP.timestamp || latestBP.date || Date.now()).toLocaleDateString('my-MM')}
                </span>
              )}
            </div>
            {latestBP ? (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {latestBP.systolic}/{latestBP.diastolic}
                  </span>
                  <span className="text-xs text-slate-400">mmHg</span>
                  <span className="text-xs text-slate-400 ml-auto">Pulse: {latestBP.pulse || latestBP.pulseRate || '-'} bpm</span>
                </div>
                {(() => {
                  const cat = calculateBPCategory(latestBP.systolic, latestBP.diastolic);
                  return (
                    <div className="mt-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${cat.bgColor} ${cat.color} ${cat.borderColor}`}>
                        {cat.labelMm}
                      </span>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3">သွေးပေါင်ချိန် မှတ်တမ်း မရှိသေးပါ</p>
            )}
          </div>

          {/* Glucose Card */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <Droplets className="w-5 h-5" />
                <span>နောက်ဆုံး သွေးချို (Glucose)</span>
              </div>
              {latestGlucose && (
                <span className="text-[10px] text-slate-400">
                  {new Date(latestGlucose.createdAt || latestGlucose.timestamp || latestGlucose.date || Date.now()).toLocaleDateString('my-MM')}
                </span>
              )}
            </div>
            {latestGlucose ? (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {latestGlucose.glucoseValue ?? latestGlucose.value ?? 0}
                  </span>
                  <span className="text-xs text-slate-400">mg/dL</span>
                  <span className="text-xs text-slate-400 ml-auto">
                    {latestGlucose.type === 'fasting' ? 'အစာမစားမီ' : latestGlucose.type === 'postprandial' ? 'အစာစားပြီး' : 'အိပ်ရာမဝင်မီ'}
                  </span>
                </div>
                {(() => {
                  const gluVal = latestGlucose.glucoseValue ?? latestGlucose.value ?? 0;
                  const gluType = String(latestGlucose.type || latestGlucose.timing || 'random');
                  const status = calculateGlucoseStatus(gluVal, gluType);
                  return (
                    <div className="mt-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${status.bgColor} ${status.color} ${status.borderColor}`}>
                        {status.labelMm}
                      </span>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3">သွေးတွင်းသကြားဓာတ် မှတ်တမ်း မရှိသေးပါ</p>
            )}
          </div>

          {/* Active Medications & Chronic condition */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                <Pill className="w-5 h-5" />
                <span>သောက်ဆေးနှင့် ရောဂါအခံ</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                {medications.length} မျိုး
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {selectedPatient.chronicConditions && selectedPatient.chronicConditions.length > 0 ? (
                  selectedPatient.chronicConditions.map((c, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                      {c}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">ရောဂါအခံ မရှိပါ</span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                {medications.length > 0
                  ? medications.map(m => m.name).join(', ')
                  : 'သောက်သုံးနေသော ဆေးဝါးမရှိပါ'}
              </p>
            </div>
          </div>
        </div>

        {/* Charts & Trends for Selected Patient */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-500" />
              <span>သွေးပေါင်ချိန် ပြောင်းလဲမှု ဂရပ် (BP Trend)</span>
            </h3>
            {bpRecords.length > 0 ? (
              <BloodPressureChart records={bpRecords} />
            ) : (
              <div className="h-64 flex items-center justify-center text-xs text-slate-400">မှတ်တမ်းမရှိပါ</div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-emerald-500" />
              <span>သွေးတွင်းသကြားဓာတ် ဂရပ် (Glucose Trend)</span>
            </h3>
            {glucoseRecords.length > 0 ? (
              <BloodSugarChart records={glucoseRecords} />
            ) : (
              <div className="h-64 flex items-center justify-center text-xs text-slate-400">မှတ်တမ်းမရှိပါ</div>
            )}
          </div>
        </div>

        {/* Doctor Clinical Advice Composer */}
        <div className="bg-gradient-to-br from-indigo-900/10 via-purple-900/10 to-transparent bg-white dark:bg-slate-900 p-6 rounded-3xl border border-indigo-200 dark:border-indigo-900/60 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 text-indigo-700 dark:text-indigo-300 font-bold text-base">
            <Stethoscope className="w-5 h-5" />
            <span>လူနာထံသို့ ဆေးပညာဆိုင်ရာ အကြံပြုချက် ပေးပို့မည် (Doctor Advice)</span>
          </div>

          <form onSubmit={handleSendAdvice} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  ဆေးဝါး/ကုသမှု အကြံပြုချက်
                </label>
                <textarea
                  rows={3}
                  value={newAdvice}
                  onChange={(e) => setNewAdvice(e.target.value)}
                  placeholder="ဥပမာ- သွေးပေါင်အနည်းငယ် မြင့်နေသဖြင့် ဆားလျှော့စားပါ၊ ဆေးကို နေ့စဉ် အချိန်မှန် သောက်ပါ..."
                  className="w-full p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  အစားအသောက်နှင့် နေထိုင်မှု လမ်းညွှန် (Diet & Lifestyle)
                </label>
                <textarea
                  rows={3}
                  value={dietAdvice}
                  onChange={(e) => setDietAdvice(e.target.value)}
                  placeholder="ဥပမာ- အဆီအအိမ့်၊ အချိုလျှော့စားရန်၊ နေ့စဉ် လမ်းမိနစ် ၃၀ လျှောက်ရန်..."
                  className="w-full p-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              {adviceSuccess && (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                  <CheckCircle className="w-4 h-4" />
                  <span>လူနာထံသို့ အကြံပြုချက် အောင်မြင်စွာ ပေးပို့ပြီးပါပြီ!</span>
                </div>
              )}
              <button
                type="submit"
                disabled={isSendingAdvice || !newAdvice.trim()}
                className="ml-auto px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isSendingAdvice ? 'ပေးပို့နေပါသည်...' : 'အကြံပြုချက် ပေးပို့မည်'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Edit & Delete Modals for Detail View */}
        <EditPatientModal
          isOpen={editingPatient !== null}
          patient={editingPatient}
          onClose={() => setEditingPatient(null)}
          onSave={handleSavePatient}
        />
        <DeletePatientModal
          isOpen={deletingPatient !== null}
          patient={deletingPatient}
          onClose={() => setDeletingPatient(null)}
          onConfirmDelete={handleConfirmDeletePatient}
        />
      </div>
    );
  }

  // Calculate statistics
  const countHTN = actualPatients.filter(p => p.chronicConditions?.some(c => c.includes('သွေးတိုး') || c.toLowerCase().includes('hypertension'))).length;
  const countDM = actualPatients.filter(p => p.chronicConditions?.some(c => c.includes('ဆီးချို') || c.toLowerCase().includes('diabetes'))).length;
  const countBoth = actualPatients.filter(p => {
    const hasHTN = p.chronicConditions?.some(c => c.includes('သွေးတိုး') || c.toLowerCase().includes('hypertension'));
    const hasDM = p.chronicConditions?.some(c => c.includes('ဆီးချို') || c.toLowerCase().includes('diabetes'));
    return hasHTN && hasDM;
  }).length;

  return (
    <div className="space-y-6">
      {/* Action Alert Notification */}
      {actionAlert && (
        <div className={`p-4 rounded-3xl border text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
          actionAlert.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200' 
            : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {actionAlert.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span>{actionAlert.message}</span>
          </div>
          <button 
            onClick={() => setActionAlert(null)}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Banner & Quick Controls - Pure White Clean Style */}
      <div className="bg-white border border-slate-200/90 p-6 rounded-3xl text-slate-900 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                ADMIN PORTAL
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Cloud Live Syncing</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              ဆေးခန်းနှင့် လူနာမှတ်တမ်း စီမံခန့်ခွဲမှု (Admin Portal)
            </h1>
            <p className="text-xs text-slate-600 max-w-2xl">
              လူနာများ၏ သွေးပေါင်၊ ဆီးချို၊ BMI နှင့် ဓာတ်ခွဲခန်း ဆေးစစ်ချက် မှတ်တမ်းများကို သီးသန့် လုံခြုံစွာ စီမံခန့်ခွဲပြီး ဆေးပညာဆိုင်ရာ အကြံပြုချက်များ ပေးပို့နိုင်ပါသည်။
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAddPatientOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ လူနာအသစ် စာရင်းသွင်းမည်</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition-all flex items-center gap-2 cursor-pointer"
              title="အချက်အလက်များ ပြန်လည်ဆွဲယူရန်"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'ဆွဲယူနေပါသည်...' : 'ပြန်လည်ဆွဲယူမည်'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Patients */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {actualPatients.length}
            </div>
            <div className="text-xs text-slate-500">စုစုပေါင်း လူနာအကောင့်</div>
          </div>
        </div>

        {/* Hypertension Count */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
              {countHTN}
            </div>
            <div className="text-xs text-slate-500">သွေးတိုးရှိသူ</div>
          </div>
        </div>

        {/* Diabetes Count */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {countDM}
            </div>
            <div className="text-xs text-slate-500">ဆီးချိုရှိသူ</div>
          </div>
        </div>

        {/* Both Conditions */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              {countBoth}
            </div>
            <div className="text-xs text-slate-500">သွေးတိုး + ဆီးချို ၂ မျိုးလုံး</div>
          </div>
        </div>
      </div>

      {/* 🚀 Free Quota & Database Health Monitoring System */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 p-5 sm:p-6 rounded-3xl border border-indigo-500/30 text-white shadow-xl space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  Firestore Free Quota & System Health (အခမဲ့ သုံးစွဲမှု စောင့်ကြည့်စနစ်)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Spark Free Plan ($0.00)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Firebase Database အခမဲ့ Quota ကန့်သတ်ချက်များနှင့် Cloud စနစ် အခြေအနေကို စောင့်ကြည့်ခြင်း
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>နောက်ဆုံး Sync: <strong>{dbStats?.lastSyncTime || 'လက်ရှိ'}</strong></span>
            </div>
            <button
              onClick={() => setShowQuotaDetails(!showQuotaDetails)}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="အသေးစိတ် အဖွင့်/အပိတ်"
            >
              {showQuotaDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Quota Metrics Grid */}
        {showQuotaDetails && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Daily Reads Quota */}
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-indigo-400" />
                    <span>နေ့စဉ် ဖတ်ရှုမှု (Reads)</span>
                  </span>
                  <span className="text-emerald-400 font-bold text-[11px]">Safe</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-lg font-bold text-white">
                    {Math.max(1, (dbStats?.totalDocuments || 0) * 2)} <span className="text-xs font-normal text-slate-400">/ 50,000</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {(((Math.max(1, (dbStats?.totalDocuments || 0) * 2) / 50000) * 100)).toFixed(2)}%
                  </span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(1, ((Math.max(1, (dbStats?.totalDocuments || 0) * 2) / 50000) * 100)))}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Spark Plan အခမဲ့ ကန့်သတ်ချက် - တစ်နေ့လျှင် 50,000 ကြိမ်
                </p>
              </div>

              {/* Daily Writes Quota */}
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>နေ့စဉ် ရေးသွင်းမှု (Writes)</span>
                  </span>
                  <span className="text-emerald-400 font-bold text-[11px]">Safe</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-lg font-bold text-white">
                    {Math.max(1, dbStats?.totalDocuments || 0)} <span className="text-xs font-normal text-slate-400">/ 20,000</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {(((Math.max(1, dbStats?.totalDocuments || 0) / 20000) * 100)).toFixed(2)}%
                  </span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(1, ((Math.max(1, dbStats?.totalDocuments || 0) / 20000) * 100)))}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Spark Plan အခမဲ့ ကန့်သတ်ချက် - တစ်နေ့လျှင် 20,000 ကြိမ်
                </p>
              </div>

              {/* Storage Quota */}
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                    <span>ဒေတာ သိမ်းဆည်းမှု</span>
                  </span>
                  <span className="text-emerald-400 font-bold text-[11px]">0.01%</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-lg font-bold text-white">
                    ~ {dbStats?.estimatedStorageKB || 1} KB <span className="text-xs font-normal text-slate-400">/ 1 GB</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    1,024 MB Limit
                  </span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: '1%' }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Spark Plan အခမဲ့ ကန့်သတ်ချက် - စုစုပေါင်း 1 GB (1,024 MB)
                </p>
              </div>

              {/* Total Documents in Database */}
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    <span>စုစုပေါင်း မှတ်တမ်းများ</span>
                  </span>
                  <span className="text-indigo-300 font-bold text-[11px]">Cloud Data</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-lg font-bold text-white">
                    {dbStats?.totalDocuments || 0} <span className="text-xs font-normal text-slate-400">Docs</span>
                  </div>
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Sync OK</span>
                  </span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full w-full" />
                </div>
                <p className="text-[10px] text-slate-400">
                  လူနာအချက်အလက်၊ BP၊ Glucose နှင့် ဆေးမှတ်တမ်းများ
                </p>
              </div>
            </div>

            {/* Detailed Collections Breakdown Pills & Diagnostics */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-400 font-semibold">Collections အသေးစိတ်:</span>
                <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px]">
                  Users: <strong>{dbStats?.totalUsers || 0}</strong>
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px]">
                  BP: <strong>{dbStats?.totalBP || 0}</strong>
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px]">
                  Glucose: <strong>{dbStats?.totalGlucose || 0}</strong>
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px]">
                  BMI: <strong>{dbStats?.totalBMI || 0}</strong>
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px]">
                  Labs: <strong>{dbStats?.totalLabs || 0}</strong>
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px]">
                  Meds: <strong>{dbStats?.totalMeds || 0}</strong>
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[11px]">
                  Q&A: <strong>{dbStats?.totalQuestions || 0}</strong>
                </span>
              </div>

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ml-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Database အချက်အလက် တိုက်ရိုက်ပြန်စစ်မည်</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 📢 User Broadcast Running Text (Marquee Ticker) Manager */}
      <div className="bg-white border border-slate-200/90 p-5 sm:p-6 rounded-3xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900">
                  User များထံ စာတန်းပြေး သတိပေးချက် ပို့ရန် (Broadcast Marquee Ticker)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  Live Marquee
                </span>
              </div>
              <p className="text-xs text-slate-500">
                အက်ပလီကေးရှင်း၏ ထိပ်ဆုံးတွင် အသုံးပြုသူ လူနာအားလုံး မြင်တွေ့ရမည့် ပြေးနေသော စာတန်းများ ထည့်သွင်း/စီမံခြင်း
              </p>
            </div>
          </div>
        </div>

        {/* Create New Broadcast Ticker Form */}
        <form 
          onSubmit={async (e) => {
            e.preventDefault();
            if (!newTickerMessage.trim()) return;
            setIsAddingTicker(true);
            try {
              await addBroadcastTicker(newTickerMessage.trim(), newTickerType);
              setNewTickerMessage('');
              setActionAlert({
                type: 'success',
                message: 'စာတန်းပြေး သတိပေးချက်အား အောင်မြင်စွာ ထုတ်လွှင့်လိုက်ပါပြီ။',
              });
              setTimeout(() => setActionAlert(null), 3000);
            } finally {
              setIsAddingTicker(false);
            }
          }}
          className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3"
        >
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="အသိပေးချက် စာတန်း ရေးသားပါ (ဥပမာ- ⚠️ ရာသီတုပ်ကွေး ရာသီ ရောက်ရှိလာသဖြင့် တုပ်ကွေး ကာကွယ်ဆေး ကြိုတင် ထိုးနှံကြပါရန်...)"
                value={newTickerMessage}
                onChange={(e) => setNewTickerMessage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden placeholder:text-slate-400 shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={newTickerType}
                onChange={(e) => setNewTickerType(e.target.value as any)}
                className="px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:outline-hidden cursor-pointer shadow-xs"
              >
                <option value="info">📢 သာမန် အသိပေးချက် (Info)</option>
                <option value="warning">⚠️ သတိပေးချက် (Warning)</option>
                <option value="urgent">🚨 အရေးပေါ် (Urgent)</option>
              </select>

              <button
                type="submit"
                disabled={isAddingTicker || !newTickerMessage.trim()}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isAddingTicker ? 'ထုတ်လွှင့်နေပါသည်...' : 'စာတန်းပြေး လွှင့်မည်'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Existing Tickers List */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            လက်ရှိ ထုတ်လွှင့်ထားသော စာတန်းများ ({broadcastTickers?.length || 0}):
          </div>

          {(!broadcastTickers || broadcastTickers.length === 0) ? (
            <p className="text-xs text-slate-400 italic">စာတန်းပြေး သတိပေးချက်များ မရှိသေးပါ</p>
          ) : (
            <div className="space-y-2">
              {broadcastTickers.map((t) => (
                <div 
                  key={t.id} 
                  className={`p-3 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                    t.isActive
                      ? t.type === 'urgent'
                        ? 'bg-rose-50 border-rose-200 text-rose-950'
                        : t.type === 'warning'
                        ? 'bg-amber-50 border-amber-200 text-amber-950'
                        : 'bg-teal-50 border-teal-200 text-teal-950'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold shrink-0 uppercase ${
                      t.type === 'urgent' ? 'bg-rose-600 text-white' : t.type === 'warning' ? 'bg-amber-500 text-slate-900' : 'bg-teal-700 text-white'
                    }`}>
                      {t.type}
                    </span>
                    <span className={`font-medium ${t.isActive ? 'text-slate-900' : 'line-through text-slate-400'}`}>
                      {t.message}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => toggleBroadcastTicker(t.id, !t.isActive)}
                      className={`px-3 py-1 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border ${
                        t.isActive
                          ? 'bg-emerald-600 text-white border-emerald-700'
                          : 'bg-slate-200 text-slate-600 border-slate-300'
                      }`}
                      title={t.isActive ? "ပိတ်ထားမည်" : "ဖွင့်မည်"}
                    >
                      {t.isActive ? 'Active (ဖွင့်ထား)' : 'Inactive (ပိတ်ထား)'}
                    </button>

                    <button
                      onClick={() => deleteBroadcastTicker(t.id)}
                      className="p-1.5 rounded-xl bg-white text-rose-600 hover:bg-rose-100 border border-slate-200 transition-colors cursor-pointer"
                      title="ဖျက်ပစ်မည်"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="လူနာအမည်၊ အီးမေးလ် သို့မဟုတ် ဖုန်းနံပါတ်ဖြင့် ရှာဖွေပါ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterCondition('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              filterCondition === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            အားလုံး ({actualPatients.length})
          </button>
          <button
            onClick={() => setFilterCondition('hypertension')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              filterCondition === 'hypertension'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            သွေးတိုး ({countHTN})
          </button>
          <button
            onClick={() => setFilterCondition('diabetes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              filterCondition === 'diabetes'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            ဆီးချို ({countDM})
          </button>
          <button
            onClick={() => setFilterCondition('both')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              filterCondition === 'both'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            ၂ မျိုးလုံး ({countBoth})
          </button>
          <button
            onClick={() => setFilterCondition('incomplete')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              filterCondition === 'incomplete'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>အချက်အလက်မစုံသူများ ({countIncomplete})</span>
          </button>
        </div>
      </div>

      {/* Incomplete Records Advisory Banner */}
      {filterCondition === 'incomplete' && (
        <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">
              အချက်အလက်မစုံလင်သော သို့မဟုတ် စမ်းသပ်ထည့်သွင်းထားသော မှတ်တမ်းများ ({filteredPatients.length} ဦး)
            </p>
            <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
              ဖုန်းနံပါတ်၊ အသက်၊ အရပ်/ကိုယ်အလေးချိန် မပြည့်စုံသော သို့မဟုတ် မှားယွင်းစာရင်းသွင်းမိသော လူနာမှတ်တမ်းများကို အောက်ပါကတ်ပြားများရှိ <strong>"ပြင်ဆင်မည်"</strong> ခလုတ်ဖြင့် အချက်အလက်ဖြည့်စွက်နိုင်သည် သို့မဟုတ် <strong>"ဖျက်မည်"</strong> ခလုတ်ဖြင့် Database ထဲမှ အပြီးတိုင် ရှင်းထုတ်နိုင်ပါသည် ခင်ဗျာ။
            </p>
          </div>
        </div>
      )}

      {/* Patient Cards List */}
      {filteredPatients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => {
            const ageObj = calculateAge(patient.dateOfBirth);
            const resolvedAge = ageObj ? ageObj.years : (patient.age || null);
            const bmi = (patient.weightKg && patient.heightCm)
              ? calculateBMI(patient.weightKg, patient.heightCm)
              : null;

            return (
              <div
                key={patient.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col justify-between gap-4 relative group"
              >
                <div>
                  {/* Top info */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20">
                        {patient.displayName ? patient.displayName.charAt(0) : 'P'}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                          <span>{patient.displayName || 'အမည်မရှိ'}</span>
                        </h4>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[130px]">{patient.email || '-'}</span>
                        </div>
                        {patient.phone ? (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{patient.phone}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[10px] text-amber-500 font-medium mt-0.5">
                            <Phone className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>ဖုန်းနံပါတ် မရှိပါ</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {bmi && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${bmi.bgColor} ${bmi.color} ${bmi.borderColor}`}>
                        BMI: {bmi.bmi}
                      </span>
                    )}
                  </div>

                  {/* Incomplete Record Warning Pill */}
                  {isIncompletePatient(patient) && (
                    <div className="mb-2 p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 text-[10px] text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="font-semibold truncate">
                        အချက်အလက်မစုံ: {getMissingFields(patient).join('၊ ')}
                      </span>
                    </div>
                  )}

                  {/* Vitals summary tags */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 py-2 border-y border-slate-100 dark:border-slate-800/80">
                    <span>အသက်: <strong>{resolvedAge !== null ? `${resolvedAge} နှစ်` : '-'}</strong></span>
                    <span>•</span>
                    <span>ကျား/မ: {patient.gender === 'female' ? 'မ' : patient.gender === 'male' ? 'ကျား' : '-'}</span>
                    <span>•</span>
                    <span>အရပ်: {patient.heightCm ? `${patient.heightCm} cm` : '-'}</span>
                    <span>•</span>
                    <span>အလေးချိန်: {patient.weightKg ? `${patient.weightKg} kg` : '-'}</span>
                  </div>

                  {/* Conditions */}
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {patient.chronicConditions && patient.chronicConditions.length > 0 ? (
                      patient.chronicConditions.map((cond, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
                        >
                          {cond}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400">ရောဂါအခံ မရှိပါ</span>
                    )}
                  </div>

                  {/* Registered Timestamp */}
                  {patient.createdAt && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>ဖွင့်လှစ်သည့်ရက်: {new Date(patient.createdAt).toLocaleDateString('my-MM')}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Action buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                  <button
                    onClick={() => setSelectedPatientId(patient.id)}
                    className="w-full py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 hover:text-white text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>လူနာမှတ်တမ်း အပြည့်အစုံ ကြည့်မည်</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setEditingPatient(patient)}
                      className="py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-200 hover:text-indigo-700 dark:hover:text-indigo-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
                      title="လူနာအချက်အလက် ပြင်ဆင်မည်"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>ပြင်ဆင်မည်</span>
                    </button>
                    <button
                      onClick={() => setDeletingPatient(patient)}
                      className="py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
                      title="လူနာမှတ်တမ်း ဖျက်ပစ်မည်"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      <span>ဖျက်မည်</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 mx-auto flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            လူနာစာရင်း မရှိသေးပါ (သို့မဟုတ် ရှာမတွေ့ပါ)
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            လူနာအကောင့်များနှင့် ကျန်းမာရေးမှတ်တမ်းများကို Database မှ စနစ်တကျ လုံခြုံစွာ စစ်ဆေးနိုင်ပါသည်။ အောက်ပါ "အချက်အလက်များ ပြန်လည်ဆွဲယူမည်" ခလုတ်ကို နှိပ်၍လည်း နောက်ဆုံးရဒေတာများကို တိုက်ရိုက် Sync ပြုလုပ်နိုင်ပါသည်။
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsAddPatientOpen(true)}
              className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>လူနာအသစ် စာရင်းသွင်းမည်</span>
            </button>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-4 h-4" />
              <span>အချက်အလက်များ ပြန်လည်ဆွဲယူရန် နှိပ်ပါ</span>
            </button>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {isAddPatientOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    လူနာအသစ် စာရင်းသွင်းရန်
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Firestore Database ထဲသို့ တိုက်ရိုက် အချိန်နှင့်တပြေးညီ သိမ်းဆည်းပေးမည်ဖြစ်ပါသည်
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddPatientOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  လူနာအမည် *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ဥပမာ- ဦးမြဦး"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    အီးမေးလ်
                  </label>
                  <input
                    type="email"
                    placeholder="patient@example.com"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ဖုန်းနံပါတ်
                  </label>
                  <input
                    type="tel"
                    placeholder="0912345678"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    အသက်
                  </label>
                  <input
                    type="number"
                    placeholder="45"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ကျား / မ
                  </label>
                  <select
                    value={patientGender}
                    onChange={(e: any) => setPatientGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="male">ကျား (Male)</option>
                    <option value="female">မ (Female)</option>
                    <option value="other">အခြား (Other)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  ရောဂါအခံများ
                </label>
                <div className="flex flex-wrap gap-2">
                  {['သွေးတိုး', 'ဆီးချို', 'အသည်းအဆီဖုံး', 'နှလုံး', 'ကျောက်ကပ်', 'ယူရစ်အက်စစ်'].map((cond) => {
                    const isSelected = patientConditions.includes(cond);
                    return (
                      <button
                        type="button"
                        key={cond}
                        onClick={() => {
                          if (isSelected) {
                            setPatientConditions(patientConditions.filter(c => c !== cond));
                          } else {
                            setPatientConditions([...patientConditions, cond]);
                          }
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {cond}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    အရပ် (cm)
                  </label>
                  <input
                    type="number"
                    placeholder="165"
                    value={patientHeight}
                    onChange={(e) => setPatientHeight(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ဝိတ် (kg)
                  </label>
                  <input
                    type="number"
                    placeholder="65"
                    value={patientWeight}
                    onChange={(e) => setPatientWeight(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    သွေးအုပ်စု
                  </label>
                  <select
                    value={patientBloodType}
                    onChange={(e) => setPatientBloodType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden"
                  >
                    <option value="O+">O+</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddPatientOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition-all cursor-pointer"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  disabled={isSavingPatient}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isSavingPatient ? 'သိမ်းဆည်းနေပါသည်...' : 'လူနာစာရင်း သိမ်းဆည်းမည်'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit & Delete Modals for Main List View */}
      <EditPatientModal
        isOpen={editingPatient !== null}
        patient={editingPatient}
        onClose={() => setEditingPatient(null)}
        onSave={handleSavePatient}
      />
      <DeletePatientModal
        isOpen={deletingPatient !== null}
        patient={deletingPatient}
        onClose={() => setDeletingPatient(null)}
        onConfirmDelete={handleConfirmDeletePatient}
      />
    </div>
  );
};
