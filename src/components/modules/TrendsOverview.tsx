import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Droplets, 
  FlaskConical, 
  Stethoscope,
  AlertTriangle, 
  Scale, 
  Calendar, 
  Users,
  BarChart2,
  Table,
  History,
  TrendingUp,
  Clock,
  Heart,
  CheckCircle2,
  ChevronRight,
  Utensils
} from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { useAuth } from '../../context/AuthContext';
import { BloodPressureChart, BloodSugarChart, BMIWeightChart } from '../charts/HealthCharts';
import { 
  calculateBPCategory, 
  calculateGlucoseStatus, 
  calculateBMI, 
  calculateAge,
  parseDateToMs,
  formatDateLabel
} from '../../lib/medicalCalculations';

interface TrendsOverviewProps {
  onNavigateTab?: (tab: string) => void;
}

export const TrendsOverview: React.FC<TrendsOverviewProps> = ({ onNavigateTab }) => {
  const { 
    bpRecords, 
    glucoseRecords, 
    labRecords, 
    bmiRecords,
    doctorAdvices, 
    selectedPatient, 
    selectedPatientId,
    setSelectedPatientId,
    patientsList,
    latestBMI 
  } = useHealthData();
  const { profile } = useAuth();

  // View state: 'both' | 'graph' | 'table'
  const [viewMode, setViewMode] = useState<'both' | 'graph' | 'table'>('both');
  // Timeframe state: 'all' | '1m' | '3m' | '6m'
  const [timeframe, setTimeframe] = useState<'all' | '1m' | '3m' | '6m'>('all');

  // Time boundaries for filtering
  const now = new Date();
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).getTime();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()).getTime();

  const filterByTime = (records: any[]) => {
    return records.filter(r => {
      const ms = parseDateToMs(r.date || r.timestamp || r.createdAt);
      if (timeframe === '1m') return ms >= oneMonthAgo;
      if (timeframe === '3m') return ms >= threeMonthsAgo;
      if (timeframe === '6m') return ms >= sixMonthsAgo;
      return true;
    });
  };

  // Chronologically sorted records (oldest -> newest for graphs)
  const sortedBP = useMemo(() => {
    return [...bpRecords].sort((a, b) => 
      parseDateToMs(a.date || a.timestamp || a.createdAt) - parseDateToMs(b.date || b.timestamp || b.createdAt)
    );
  }, [bpRecords]);

  const sortedGlucose = useMemo(() => {
    return [...glucoseRecords].sort((a, b) => 
      parseDateToMs(a.date || a.timestamp || a.createdAt) - parseDateToMs(b.date || b.timestamp || b.createdAt)
    );
  }, [glucoseRecords]);

  const sortedBMI = useMemo(() => {
    return [...bmiRecords].sort((a, b) => 
      parseDateToMs(a.date || a.timestamp || a.createdAt) - parseDateToMs(b.date || b.timestamp || b.createdAt)
    );
  }, [bmiRecords]);

  // Filtered arrays based on active timeframe
  const filteredBP = useMemo(() => filterByTime(sortedBP), [sortedBP, timeframe]);
  const filteredGlucose = useMemo(() => filterByTime(sortedGlucose), [sortedGlucose, timeframe]);
  const filteredBMI = useMemo(() => filterByTime(sortedBMI), [sortedBMI, timeframe]);
  const filteredLabs = useMemo(() => filterByTime(labRecords), [labRecords, timeframe]);

  // Latest records
  const latestBP = sortedBP.length > 0 ? sortedBP[sortedBP.length - 1] : null;
  const latestGlucose = sortedGlucose.length > 0 ? sortedGlucose[sortedGlucose.length - 1] : null;
  const latestLab = labRecords.length > 0 ? labRecords[0] : null;

  const bpEval = latestBP ? calculateBPCategory(latestBP.systolic, latestBP.diastolic) : null;
  const gluEval = latestGlucose ? calculateGlucoseStatus(latestGlucose.value || latestGlucose.glucoseValue || 100, latestGlucose.type || latestGlucose.timing || 'fasting') : null;

  // Active user age & BMI
  const activeDOB = selectedPatient?.dateOfBirth || profile?.dateOfBirth;
  const ageObj = calculateAge(activeDOB);
  const activeAgeYears = ageObj ? ageObj.years : (selectedPatient?.age || profile?.age || null);

  const activeHeight = latestBMI?.heightCm || selectedPatient?.heightCm || profile?.heightCm || null;
  const activeWeight = latestBMI?.weightKg || selectedPatient?.weightKg || profile?.weightKg || null;
  const bmiEval = (activeWeight && activeHeight) ? calculateBMI(activeWeight, activeHeight) : null;

  // Active critical alerts
  const alerts: { title: string; desc: string; type: 'warning' | 'danger' | 'info' }[] = [];

  if (latestBP && (latestBP.systolic >= 140 || latestBP.diastolic >= 90)) {
    alerts.push({
      title: 'သွေးပေါင်ချိန် သက်မှတ်ချက်ထက် မြင့်နေပါသည်',
      desc: `အပေါ်သွေး ${latestBP.systolic} / အောက်သွေး ${latestBP.diastolic} mmHg ရှိနေပါသည်။ သွေးတိုးကျဆေး သောက်ထားခြင်း ရှိမရှိ စစ်ဆေးပါ။`,
      type: 'danger',
    });
  }

  const gluVal = latestGlucose ? (latestGlucose.value || latestGlucose.glucoseValue || 0) : 0;
  if (latestGlucose && gluVal >= 180) {
    alerts.push({
      title: 'သွေးတွင်းသကြားဓာတ် မြင့်မားနေပါသည်',
      desc: `သကြားဓာတ် ${gluVal} mg/dL ရှိနေပါသည်။ အချိုလျှော့စားပြီး ဆရာဝန်ညွှန်ကြားချက်အတိုင်း ဆီးချိုဆေး သောက်ပါ။`,
      type: 'warning',
    });
  }

  if (bmiEval && (bmiEval.category === 'obese1' || bmiEval.category === 'obese2')) {
    alerts.push({
      title: `BMI မြင့်မားနေပါသည် (${bmiEval.bmi} kg/m² - ${bmiEval.labelMm})`,
      desc: `ကိုယ်အလေးချိန် လျှော့ချခြင်းသည် သွေးပေါင်ချိန် ၅-၁၀ mmHg နှင့် ဆီးချိုထိန်းချုပ်မှုကို တိုက်ရိုက်ကောင်းမွန်စေနိုင်ပါသည်။`,
      type: 'warning',
    });
  }

  if (latestLab?.renal?.uricAcid && latestLab.renal.uricAcid > 7.2) {
    alerts.push({
      title: 'ယူရစ်အက်စစ် မြင့်မားနေသည် (Uric Acid High)',
      desc: `ယူရစ်အက်စစ် ${latestLab.renal.uricAcid} mg/dL ဖြစ်သဖြင့် အဆစ်အမြစ်ရောင်ခြင်း (ဂေါက်) မဖြစ်စေရန် အသားနီ၊ ကလီစာနှင့် ဘီယာ ရှောင်ပါ။`,
      type: 'warning',
    });
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-6 rounded-3xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
              ကျန်းမာရေးသုံးသပ်ချက် အနှစ်ချုပ် (Health Analytics & Historical Trends)
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold mt-1">
              {selectedPatient 
                ? `${selectedPatient.displayName} ၏ သမိုင်းမှတ်တမ်းနှင့် Trend Graph များ` 
                : profile?.role === 'admin' 
                  ? 'အသုံးပြုသူများ၏ ဘက်စုံ ကျန်းမာရေးသုံးသပ်ချက် (Admin Dashboard)' 
                  : `${profile?.displayName || 'အသုံးပြုသူ'} ၏ ဘက်စုံ ကျန်းမာရေး သမိုင်းမှတ်တမ်း`}
            </h2>
            <p className="text-xs text-emerald-100 mt-1 max-w-xl">
              သွေးတိုး၊ ဆီးချို၊ BMI & ခန္ဓာကိုယ်အချိုးအစားနှင့် ဓာတ်ခွဲခန်းစစ်ဆေးချက်များကို Graph & Data ဇယားများဖြင့် အချိန်နှင့်တပြေးညီ ကြည့်ရှုနိုင်ပါသည်
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2 bg-white/10 rounded-2xl backdrop-blur-xs text-center border border-white/20">
              <span className="text-[10px] text-emerald-100 block font-medium">ကျန်းမာရေးအဆင့်</span>
              <span className="text-base font-bold">
                {alerts.length === 0 ? '🟢 ပုံမှန်ကောင်းမွန်' : alerts.some(a => a.type === 'danger') ? '🔴 ဂရုပြုစောင့်ကြည့်' : '🟡 အလယ်အလတ်'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User Selector Filter Bar for Admin / Multi-user view */}
      {profile?.role === 'admin' && patientsList.length > 0 && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                အသုံးပြုသူ Filter (Select User for Trend Analysis)
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {selectedPatient 
                  ? `လက်ရှိ ပြသနေသော အသုံးပြုသူ: ${selectedPatient.displayName}` 
                  : 'အသုံးပြုသူ အားလုံး၏ ဒေတာပေါင်းချုပ် ဖော်ပြထားပါသည်'}
              </span>
            </div>
          </div>
          <select
            value={selectedPatientId || ''}
            onChange={(e) => setSelectedPatientId(e.target.value || null)}
            className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs"
          >
            <option value="">🌐 အသုံးပြုသူ အားလုံး (All Users)</option>
            {patientsList.map(p => (
              <option key={p.id} value={p.id}>
                👤 {p.displayName || 'အသုံးပြုသူ'} ({p.email || p.phone || p.id})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Alerts Banner if any */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`p-4 rounded-2xl border flex items-start gap-3 text-xs font-semibold ${
                alert.type === 'danger'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${alert.type === 'danger' ? 'text-rose-600' : 'text-amber-600'}`} />
              <div>
                <span className="font-extrabold block">{alert.title}</span>
                <span className="opacity-90 font-normal">{alert.desc}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Snapshot Cards - Pristine Pure White */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Age & Profile */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('bmi')}
          className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-teal-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold">အသက် (Age)</span>
            <Calendar className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-extrabold font-mono text-slate-900 mt-1">
            {activeAgeYears !== null ? activeAgeYears : '--'} <span className="text-xs text-slate-500 font-sans">နှစ်</span>
          </div>
          <span className="text-[11px] text-teal-700 font-semibold mt-1 block truncate">
            {ageObj ? ageObj.formattedMm : 'မွေးနေ့မှ တွက်ချက်မည်'}
          </span>
        </div>

        {/* BMI & Weight */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('bmi')}
          className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold">BMI အညွှန်း</span>
            <Scale className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-extrabold font-mono text-slate-900 mt-1">
            {bmiEval ? bmiEval.bmi : '--'} <span className="text-xs text-slate-500 font-sans">kg/m²</span>
          </div>
          {bmiEval ? (
            <span className={`text-[11px] font-bold mt-1 inline-block truncate ${bmiEval.color}`}>
              {bmiEval.labelMm}
            </span>
          ) : (
            <span className="text-[11px] text-slate-500 mt-1 block font-medium">မှတ်တမ်းမရှိသေး</span>
          )}
        </div>

        {/* BP */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('bp')}
          className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-rose-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold">သွေးပေါင်ချိန် (BP)</span>
            <Activity className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-extrabold font-mono text-slate-900 mt-1">
            {latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : '--/--'} <span className="text-xs text-slate-500 font-sans">mmHg</span>
          </div>
          {bpEval ? (
            <span className={`text-[11px] font-bold mt-1 inline-block ${bpEval.color}`}>
              {bpEval.labelMm}
            </span>
          ) : (
            <span className="text-[11px] text-slate-500 mt-1 block font-medium">မှတ်တမ်းမရှိသေး</span>
          )}
        </div>

        {/* Glucose */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('sugar')}
          className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold">သွေးတွင်းသကြားဓာတ်</span>
            <Droplets className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-extrabold font-mono text-slate-900 mt-1">
            {latestGlucose ? latestGlucose.value : '--'} <span className="text-xs text-slate-500 font-sans">{latestGlucose?.type === 'hba1c' ? '%' : 'mg/dL'}</span>
          </div>
          {gluEval ? (
            <span className={`text-[11px] font-bold mt-1 inline-block ${gluEval.color}`}>
              {gluEval.labelMm}
            </span>
          ) : (
            <span className="text-[11px] text-slate-500 mt-1 block font-medium">မှတ်တမ်းမရှိသေး</span>
          )}
        </div>

        {/* Renal & Uric Acid */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('labs')}
          className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-purple-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold">ဓာတ်ခွဲခန်းစစ်ဆေးချက်</span>
            <FlaskConical className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-sm font-extrabold font-mono text-slate-900 mt-1 truncate">
            Cr: {latestLab?.renal?.creatinine ?? '--'} | Uric: {latestLab?.renal?.uricAcid ?? '--'}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block truncate font-medium">
            {latestLab ? `ရက်စွဲ: ${latestLab.testDate}` : 'စစ်ဆေးချက်မရှိသေး'}
          </span>
        </div>
      </div>

      {/* Control Bar: View Switcher (Graph vs Table vs Both) + Timeframe Filter */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              ကျန်းမာရေး သမိုင်းမှတ်တမ်း ပြသမှု ပုံစံ (Historical View Mode)
            </h3>
            <p className="text-[11px] text-slate-500">
              Graph မျဉ်းကွေးဖြင့် ဖြစ်စေ၊ Data ဇယားဖြင့် ဖြစ်စေ ရွေးချယ် ကြည့်ရှုနိုင်ပါသည်
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setViewMode('both')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'both'
                  ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>📊 Graph & Data</span>
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'graph'
                  ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>📈 Graph View သာ</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5 text-emerald-600" />
              <span>📋 Data ဇယားသာ</span>
            </button>
          </div>

          {/* Timeframe Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setTimeframe('all')}
              className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                timeframe === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              အားလုံး
            </button>
            <button
              onClick={() => setTimeframe('1m')}
              className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                timeframe === '1m'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              ၁ လ
            </button>
            <button
              onClick={() => setTimeframe('3m')}
              className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                timeframe === '3m'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              ၃ လ
            </button>
            <button
              onClick={() => setTimeframe('6m')}
              className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                timeframe === '6m'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              ၆ လ
            </button>
          </div>
        </div>
      </div>

      {/* GRAPH VIEW SECTION (Rendered if 'both' or 'graph') */}
      {(viewMode === 'both' || viewMode === 'graph') && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <BloodPressureChart records={filteredBP} />
            </div>
            <div>
              <BloodSugarChart records={filteredGlucose} />
            </div>
          </div>

          {/* BMI & Body Weight Trend Chart */}
          {filteredBMI.length > 0 && (
            <div>
              <BMIWeightChart records={filteredBMI} />
            </div>
          )}
        </div>
      )}

      {/* DATA TABLE VIEW SECTION (Rendered if 'both' or 'table') */}
      {(viewMode === 'both' || viewMode === 'table') && (
        <div className="space-y-6">
          {viewMode === 'both' && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Table className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                ရက်စွဲအလိုက် စစ်ဆေးတိုင်းတာချက် ဒေတာဇယားများ ({timeframe === 'all' ? 'အားလုံး' : timeframe === '1m' ? '၁ လစာ' : timeframe === '3m' ? '၃ လစာ' : '၆ လစာ'}):
              </h3>
            </div>
          )}

          {/* Blood Pressure Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 bg-rose-50/60 dark:bg-rose-950/40 border-b border-rose-100 dark:border-rose-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-600" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  သွေးပေါင်ချိန် သမိုင်းမှတ်တမ်း ဇယား (Blood Pressure Log - {filteredBP.length} ကြိမ်)
                </h4>
              </div>
              <span className="text-xs text-rose-700 dark:text-rose-300 font-semibold font-mono">
                mmHg / bpm
              </span>
            </div>

            {filteredBP.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                ရွေးချယ်ထားသော ကာလအတွင်း သွေးပေါင်ချိန် မှတ်တမ်း မရှိပါ
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">ရက်စွဲ / အချိန်</th>
                      <th className="py-2.5 px-4 font-semibold">အပေါ်သွေး (SYS)</th>
                      <th className="py-2.5 px-4 font-semibold">အောက်သွေး (DIA)</th>
                      <th className="py-2.5 px-4 font-semibold">နှလုံးခုန် (Pulse)</th>
                      <th className="py-2.5 px-4 font-semibold">အခြေအနေ</th>
                      <th className="py-2.5 px-4 font-semibold">စားသုံးခဲ့သော အစားအသောက်</th>
                      <th className="py-2.5 px-4 font-semibold">မှတ်ချက်</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredBP.slice().reverse().map((r, i) => {
                      const evalB = calculateBPCategory(r.systolic, r.diastolic);
                      const dInfo = formatDateLabel(r.date || r.timestamp || r.createdAt);
                      const diet = r.dietRecord || r.dietNotes || r.foodIntake;
                      return (
                        <tr key={r.id || i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-2.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                            {dInfo.date} <span className="text-[10px] text-slate-400">{dInfo.time}</span>
                          </td>
                          <td className="py-2.5 px-4 font-extrabold text-rose-600 font-mono text-sm">
                            {r.systolic} <span className="text-[10px] text-slate-400 font-normal">mmHg</span>
                          </td>
                          <td className="py-2.5 px-4 font-extrabold text-blue-600 font-mono text-sm">
                            {r.diastolic} <span className="text-[10px] text-slate-400 font-normal">mmHg</span>
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-amber-600 font-mono">
                            {r.pulse || r.pulseRate || '--'} <span className="text-[10px] text-slate-400 font-normal">bpm</span>
                          </td>
                          <td className="py-2.5 px-4">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${evalB.bgColor} ${evalB.color} ${evalB.borderColor}`}>
                              {evalB.labelMm}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200">
                            {diet ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 font-medium text-[11px]">
                                <Utensils className="w-3 h-3 text-amber-600" />
                                {diet}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-slate-500 max-w-xs truncate">
                            {r.notes || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Blood Sugar Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  ဆီးချို/သွေးတွင်းသကြားဓာတ် သမိုင်းမှတ်တမ်း ဇယား (Glucose Log - {filteredGlucose.length} ကြိမ်)
                </h4>
              </div>
              <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold font-mono">
                mg/dL & %
              </span>
            </div>

            {filteredGlucose.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                ရွေးချယ်ထားသော ကာလအတွင်း သကြားဓာတ် မှတ်တမ်း မရှိပါ
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">ရက်စွဲ / အချိန်</th>
                      <th className="py-2.5 px-4 font-semibold">သကြားဓာတ်တန်ဖိုး</th>
                      <th className="py-2.5 px-4 font-semibold">တိုင်းတာသည့်အမျိုးအစား</th>
                      <th className="py-2.5 px-4 font-semibold">အခြေအနေ သုံးသပ်ချက်</th>
                      <th className="py-2.5 px-4 font-semibold">စားသုံးခဲ့သော အစားအသောက်</th>
                      <th className="py-2.5 px-4 font-semibold">မှတ်ချက်</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredGlucose.slice().reverse().map((r, i) => {
                      const val = r.value || r.glucoseValue || 100;
                      const type = r.type || r.timing || 'fasting';
                      const evalG = calculateGlucoseStatus(val, type);
                      const dInfo = formatDateLabel(r.date || r.timestamp || r.createdAt);
                      const diet = r.dietRecord || r.dietNotes || r.foodIntake;
                      return (
                        <tr key={r.id || i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-2.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                            {dInfo.date} <span className="text-[10px] text-slate-400">{dInfo.time}</span>
                          </td>
                          <td className="py-2.5 px-4 font-extrabold text-emerald-600 font-mono text-sm">
                            {val} <span className="text-[10px] text-slate-400 font-normal">{type === 'hba1c' ? '%' : 'mg/dL'}</span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">
                            {type === 'fasting' && 'အစာမစားမီ (Fasting)'}
                            {type === 'post_prandial' && 'အစာစားပြီး ၂ နာရီ (PP)'}
                            {type === 'random' && 'အချိန်မရွေး (Random)'}
                            {type === 'hba1c' && '၃ လပတ် (HbA1c)'}
                            {!['fasting', 'post_prandial', 'random', 'hba1c'].includes(type) && type}
                          </td>
                          <td className="py-2.5 px-4">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${evalG.bgColor} ${evalG.color} ${evalG.borderColor}`}>
                              {evalG.labelMm}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200">
                            {diet ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 font-medium text-[11px]">
                                <Utensils className="w-3 h-3 text-emerald-600" />
                                {diet}
                              </span>
                            ) : (
                              <span className="text-slate-500">{r.mealInfo || '-'}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-slate-500 max-w-xs truncate">
                            {r.notes || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* BMI Log Table */}
          {filteredBMI.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="p-4 bg-teal-50/60 dark:bg-teal-950/40 border-b border-teal-100 dark:border-teal-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-teal-600" />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    ကိုယ်အလေးချိန်နှင့် BMI သမိုင်းမှတ်တမ်း (BMI Log - {filteredBMI.length} ကြိမ်)
                  </h4>
                </div>
                <span className="text-xs text-teal-700 dark:text-teal-300 font-semibold font-mono">
                  kg & kg/m²
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">ရက်စွဲ</th>
                      <th className="py-2.5 px-4 font-semibold">အရပ် (Height)</th>
                      <th className="py-2.5 px-4 font-semibold">ကိုယ်အလေးချိန်</th>
                      <th className="py-2.5 px-4 font-semibold">BMI တန်ဖိုး</th>
                      <th className="py-2.5 px-4 font-semibold">အဆင့်သတ်မှတ်ချက်</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredBMI.slice().reverse().map((r, i) => {
                      const evalB = calculateBMI(r.weightKg, r.heightCm);
                      const dInfo = formatDateLabel(r.date || r.timestamp || r.createdAt);
                      return (
                        <tr key={r.id || i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-2.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                            {dInfo.date}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                            {r.heightCm} cm
                          </td>
                          <td className="py-2.5 px-4 font-extrabold text-teal-600 font-mono text-sm">
                            {r.weightKg} kg
                          </td>
                          <td className="py-2.5 px-4 font-extrabold text-slate-900 dark:text-white font-mono text-sm">
                            {r.bmi}
                          </td>
                          <td className="py-2.5 px-4">
                            {evalB ? (
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${evalB.bgColor} ${evalB.color} ${evalB.borderColor}`}>
                                {evalB.labelMm}
                              </span>
                            ) : (
                              r.category
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Doctor Advice Feed */}
      {doctorAdvices.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                ဆရာဝန်၏ ကျန်းမာရေးလမ်းညွှန်ချက်များနှင့် ဆေးညွှန်းများ (Doctor Consultations)
              </h3>
              <p className="text-xs text-slate-600">
                အသုံးပြုသူအတွက် ဆရာဝန်မှ အကြံပြုထားသော အစားအသောက်နှင့် ဆေးဝါးသုံးစွဲမှု လမ်းညွှန်ချက်များ
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {doctorAdvices.map((adv) => (
              <div key={adv.id} className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="font-extrabold text-indigo-950">{adv.doctorName}</span>
                  <span className="font-mono">{adv.date}</span>
                </div>
                <p className="text-slate-900 text-sm font-bold leading-relaxed">
                  {adv.advice}
                </p>
                {adv.dietRecommendation && (
                  <div className="mt-2 p-2.5 rounded-xl bg-white border border-indigo-200 text-slate-800">
                    <span className="font-bold text-indigo-700">🥗 အစားအသောက်လမ်းညွှန်: </span>
                    {adv.dietRecommendation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Latest Lab Report Quick Panel */}
      {latestLab && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-purple-600" />
                နောက်ဆုံး ဓာတ်ခွဲခန်းစစ်ဆေးချက် အနှစ်ချုပ် ({latestLab.testDate})
              </h3>
              <p className="text-xs text-slate-600">{latestLab.labName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            {/* Hb */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px] font-bold">သွေးအား (Hb)</span>
              <span className="text-base font-extrabold font-mono text-slate-900">
                {latestLab.cbc?.hemoglobin != null ? `${latestLab.cbc.hemoglobin} g/dL` : '--'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">စံ: 12 - 17</span>
            </div>

            {/* FBS */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px] font-bold">ဆီးချို (FBS)</span>
              <span className="text-base font-extrabold font-mono text-slate-900">
                {latestLab.glucose?.fbs != null ? `${latestLab.glucose.fbs} mg/dL` : '--'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">စံ: 70 - 99</span>
            </div>

            {/* ALT */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px] font-bold">အသည်း (SGPT/ALT)</span>
              <span className="text-base font-extrabold font-mono text-slate-900">
                {latestLab.liver?.alt_sgpt != null ? `${latestLab.liver.alt_sgpt} U/L` : '--'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">ပုံမှန်: 7 - 56</span>
            </div>

            {/* Creatinine */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px] font-bold">ကျောက်ကပ် (Creatinine)</span>
              <span className="text-base font-extrabold font-mono text-slate-900">
                {latestLab.renal?.creatinine != null ? `${latestLab.renal.creatinine} mg/dL` : '--'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">ပုံမှန်: 0.6 - 1.2</span>
            </div>

            {/* Uric Acid */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px] font-bold">ဂေါက်/ယူရစ် (Uric Acid)</span>
              <span className="text-base font-extrabold font-mono text-slate-900">
                {latestLab.renal?.uricAcid != null ? `${latestLab.renal.uricAcid} mg/dL` : '--'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">ပုံမှန်: 3.5 - 7.2</span>
            </div>

            {/* Cholesterol */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px] font-bold">ကိုလက်စထရော (Chol)</span>
              <span className="text-base font-extrabold font-mono text-slate-900">
                {latestLab.lipid?.totalCholesterol != null ? `${latestLab.lipid.totalCholesterol} mg/dL` : '--'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">စံနှုန်း: &lt; 200</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
