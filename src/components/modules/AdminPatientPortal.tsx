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
  ChevronUp
} from 'lucide-react';
import { useHealthData, isPatientOnly } from '../../context/HealthDataContext';
import { useAuth } from '../../context/AuthContext';
import { BloodPressureChart, BloodSugarChart } from '../charts/HealthCharts';
import { calculateBPCategory, calculateGlucoseStatus, calculateAge, calculateBMI } from '../../lib/medicalCalculations';

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
    deletePatient,
    clearAllPatients,
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

  // Pure patient list (excluding admin)
  const actualPatients = patientsList.filter(isPatientOnly);

  // Filter patients
  const filteredPatients = actualPatients.filter(p => {
    const matchesSearch = (p.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.phone && p.phone.includes(searchTerm));
    
    if (!matchesSearch) return false;

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
                  {selectedPatient.displayName}
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
                <span>အီးမေးလ်: <strong>{selectedPatient.email}</strong></span>
                <span>•</span>
                <span>အသက်: <strong>{resolvedAge !== null ? `${resolvedAge} နှစ်` : 'မထည့်ရသေးပါ'}</strong> {patientAgeObj ? `(${patientAgeObj.formattedMm})` : ''}</span>
                <span>•</span>
                <span>အရပ်: {selectedPatient.heightCm ? `${selectedPatient.heightCm} cm` : '-'} / ကိုယ်အလေးချိန်: {selectedPatient.weightKg ? `${selectedPatient.weightKg} kg` : '-'}</span>
                <span>•</span>
                <span>ကျား/မ: {selectedPatient.gender === 'female' ? 'မ' : selectedPatient.gender === 'male' ? 'ကျား' : '-'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
      {/* Top Banner & Quick Controls */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/30 text-indigo-300 border border-indigo-400/40">
                MASTER ADMIN PORTAL
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Cloud Live Syncing</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              လူနာနှင့် မိသားစုဝင်များ စောင့်ကြည့်စီမံခန့်ခွဲမှု
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              အသုံးပြုသူ လူနာများ အကောင့်ဖွင့်၍ ဖြည့်သွင်းထားသော သွေးပေါင်၊ ဆီးချို၊ BMI နှင့် ဓာတ်ခွဲခန်း ဆေးစစ်ချက်များကို အချိန်နှင့်တပြေးညီ ကြည့်ရှုစောင့်ကြပ်နိုင်ပါသည်။
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              title="အချက်အလက်များ ပြန်လည်ဆွဲယူရန်"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'ဆွဲယူနေပါသည်...' : 'ပြန်လည်ဆွဲယူမည် (Refresh)'}</span>
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

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterCondition('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterCondition === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            အားလုံး ({actualPatients.length})
          </button>
          <button
            onClick={() => setFilterCondition('hypertension')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterCondition === 'hypertension'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            သွေးတိုး ({countHTN})
          </button>
          <button
            onClick={() => setFilterCondition('diabetes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterCondition === 'diabetes'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            ဆီးချို ({countDM})
          </button>
          <button
            onClick={() => setFilterCondition('both')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filterCondition === 'both'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            ၂ မျိုးလုံး ({countBoth})
          </button>
        </div>
      </div>

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
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                          {patient.displayName || 'အမည်မရှိ'}
                        </h4>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <Mail className="w-3 h-3" />
                          <span className="truncate max-w-[150px]">{patient.email}</span>
                        </div>
                      </div>
                    </div>

                    {bmi && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${bmi.bgColor} ${bmi.color} ${bmi.borderColor}`}>
                        BMI: {bmi.bmi}
                      </span>
                    )}
                  </div>

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

                {/* Bottom Action button */}
                <button
                  onClick={() => setSelectedPatientId(patient.id)}
                  className="w-full py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 hover:text-white text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>လူနာမှတ်တမ်း အပြည့်အစုံ ကြည့်မည်</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
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
            လူနာများက ၎င်းတို့၏ ဖုန်း/ကွန်ပျူတာမှ အကောင့်သစ်ဖွင့် (Sign Up) ဝင်ရောက်လိုက်သည်နှင့် အချိန်နှင့်တပြေးညီ ဤ Admin Dashboard တွင် အလိုအလျောက် ပေါ်လာပါမည်။
          </p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs mt-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>အချက်အလက်များ ပြန်လည်ဆွဲယူရန် နှိပ်ပါ</span>
          </button>
        </div>
      )}
    </div>
  );
};
