import React from 'react';
import { 
  TrendingUp, 
  Activity, 
  Droplets, 
  FlaskConical, 
  Pill, 
  AlertTriangle, 
  CheckCircle2, 
  Heart, 
  Stethoscope,
  ShieldAlert,
  ArrowUpRight,
  Info,
  Scale,
  Calendar,
  Ruler,
  ChevronRight
} from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { useAuth } from '../../context/AuthContext';
import { BloodPressureChart, BloodSugarChart } from '../charts/HealthCharts';
import { 
  calculateBPCategory, 
  calculateGlucoseStatus, 
  evaluateLabParam, 
  calculateBMI, 
  calculateAge 
} from '../../lib/medicalCalculations';

interface TrendsOverviewProps {
  onNavigateTab?: (tab: string) => void;
}

export const TrendsOverview: React.FC<TrendsOverviewProps> = ({ onNavigateTab }) => {
  const { bpRecords, glucoseRecords, labRecords, medications, doctorAdvices, selectedPatient, latestBMI } = useHealthData();
  const { profile } = useAuth();

  const latestBP = bpRecords.length > 0 ? bpRecords[bpRecords.length - 1] : null;
  const latestGlucose = glucoseRecords.length > 0 ? glucoseRecords[glucoseRecords.length - 1] : null;
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
      title: 'သွေးပေါင်ချိန် သတ်မှတ်ချက်ထက် မြင့်နေပါသည်',
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

  if (latestLab?.renal?.creatinine && latestLab.renal.creatinine > 1.2) {
    alerts.push({
      title: 'ကျောက်ကပ်လုပ်ဆောင်ချက် သတိပြုရန် (Creatinine Elevated)',
      desc: `Creatinine ${latestLab.renal.creatinine} mg/dL ဖြစ်နေပါသည်။ ရေလုံလောက်စွာသောက်ပါ၊ အကိုက်အခဲပျောက်ဆေးများ အလွန်အကျွံမသောက်ပါနှင့်။`,
      type: 'warning',
    });
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-6 rounded-3xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              ကျန်းမာရေးသုံးသပ်ချက် အနှစ်ချုပ် (Health Analytics)
            </span>
            <h2 className="text-xl font-bold mt-1">
              {selectedPatient 
                ? `${selectedPatient.displayName} ၏ ကျန်းမာရေးအခြေအနေ` 
                : profile?.role === 'admin' 
                  ? 'လူနာများ၏ ဘက်စုံ ကျန်းမာရေးသုံးသပ်ချက် (Admin Portal)' 
                  : `${profile?.displayName || 'လူနာ'} ၏ ဘက်စုံ ကျန်းမာရေးအခြေအနေ`}
            </h2>
            <p className="text-xs text-emerald-100 mt-1 max-w-xl">
              သွေးတိုး၊ ဆီးချို၊ BMI & ခန္ဓာကိုယ်အချိုးအစား၊ အသည်း၊ ကျောက်ကပ်နှင့် အဆီဓာတ် ပေါင်းစပ်စောင့်ကြပ်မှု
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 bg-white/10 rounded-2xl backdrop-blur-xs text-center">
              <span className="text-xs text-emerald-100 block">ကျန်းမာရေးအဆင့်</span>
              <span className="text-lg font-bold">
                {alerts.length === 0 ? '🟢 ပုံမှန်ကောင်းမွန်' : alerts.some(a => a.type === 'danger') ? '🔴 ဂရုပြုစောင့်ကြည့်' : '🟡 အလယ်အလတ်'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Banner if any */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
                alert.type === 'danger'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200'
              }`}
            >
              <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${alert.type === 'danger' ? 'text-rose-600' : 'text-amber-600'}`} />
              <div>
                <span className="font-bold block">{alert.title}</span>
                <span className="opacity-90">{alert.desc}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Age & Profile */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('bmi')}
          className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-400 dark:hover:border-teal-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">အသက် (Age)</span>
            <Calendar className="w-4 h-4 text-teal-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {activeAgeYears !== null ? activeAgeYears : '--'} <span className="text-xs text-slate-400 font-sans">နှစ်</span>
          </div>
          <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium mt-1 block truncate">
            {ageObj ? ageObj.formattedMm : 'မွေးနေ့မှ တွက်ချက်မည်'}
          </span>
        </div>

        {/* BMI & Weight */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('bmi')}
          className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-400 dark:hover:border-teal-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">BMI အညွှန်း</span>
            <Scale className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {bmiEval ? bmiEval.bmi : '--'} <span className="text-xs text-slate-400 font-sans">kg/m²</span>
          </div>
          {bmiEval ? (
            <span className={`text-[11px] font-semibold mt-1 inline-block truncate ${bmiEval.color}`}>
              {bmiEval.labelMm}
            </span>
          ) : (
            <span className="text-[11px] text-slate-400 mt-1 block">မှတ်တမ်းမရှိသေး</span>
          )}
        </div>

        {/* BP */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('bp')}
          className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-rose-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">သွေးပေါင်ချိန် (BP)</span>
            <Activity className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : '--/--'} <span className="text-xs text-slate-400 font-sans">mmHg</span>
          </div>
          {bpEval ? (
            <span className={`text-[11px] font-semibold mt-1 inline-block ${bpEval.color}`}>
              {bpEval.labelMm}
            </span>
          ) : (
            <span className="text-[11px] text-slate-400 mt-1 block">မှတ်တမ်းမရှိသေး</span>
          )}
        </div>

        {/* Glucose */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('sugar')}
          className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">သွေးတွင်းသကြားဓာတ်</span>
            <Droplets className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {latestGlucose ? latestGlucose.value : '--'} <span className="text-xs text-slate-400 font-sans">{latestGlucose?.type === 'hba1c' ? '%' : 'mg/dL'}</span>
          </div>
          {gluEval ? (
            <span className={`text-[11px] font-semibold mt-1 inline-block ${gluEval.color}`}>
              {gluEval.labelMm}
            </span>
          ) : (
            <span className="text-[11px] text-slate-400 mt-1 block">မှတ်တမ်းမရှိသေး</span>
          )}
        </div>

        {/* Renal & Uric Acid */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('labs')}
          className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-purple-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">ဓာတ်ခွဲခန်းစစ်ဆေးချက်</span>
            <FlaskConical className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-1 truncate">
            Cr: {latestLab?.renal?.creatinine ?? '--'} | Uric: {latestLab?.renal?.uricAcid ?? '--'}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block truncate">
            {latestLab ? `ရက်စွဲ: ${latestLab.testDate}` : 'စစ်ဆေးချက်မရှိသေး'}
          </span>
        </div>
      </div>

      {/* Main Dual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <BloodPressureChart records={bpRecords} />
        </div>
        <div>
          <BloodSugarChart records={glucoseRecords} />
        </div>
      </div>

      {/* Doctor Advice Feed */}
      {doctorAdvices.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                ဆရာဝန်၏ ကျန်းမာရေးလမ်းညွှန်ချက်များနှင့် ဆေးညွှန်းများ (Doctor Consultations)
              </h3>
              <p className="text-xs text-slate-500">
                လူနာအတွက် ဆရာဝန်မှ အကြံပြုထားသော အစားအသောက်နှင့် ဆေးဝါးသုံးစွဲမှု လမ်းညွှန်ချက်များ
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {doctorAdvices.map((adv) => (
              <div key={adv.id} className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="font-bold text-indigo-900 dark:text-indigo-300">{adv.doctorName}</span>
                  <span className="font-mono">{adv.date}</span>
                </div>
                <p className="text-slate-800 dark:text-slate-200 text-sm font-medium leading-relaxed">
                  {adv.advice}
                </p>
                {adv.dietRecommendation && (
                  <div className="mt-2 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-950 text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-indigo-700 dark:text-indigo-400">🥗 အစားအသောက်လမ်းညွှန်: </span>
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
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-purple-600" />
                နောက်ဆုံး ဓာတ်ခွဲခန်းစစ်ဆေးချက် အနှစ်ချုပ် ({latestLab.testDate})
              </h3>
              <p className="text-xs text-slate-500">{latestLab.labName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* ALT */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">အသည်း (SGPT/ALT)</span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                {latestLab.liver?.alt_sgpt ?? '--'} U/L
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">ပုံမှန်: 7 - 56</span>
            </div>

            {/* Creatinine */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">ကျောက်ကပ် (Creatinine)</span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                {latestLab.renal?.creatinine ?? '--'} mg/dL
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">ပုံမှန်: 0.6 - 1.2</span>
            </div>

            {/* Uric Acid */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">ဂေါက်/ယူရစ် (Uric Acid)</span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                {latestLab.renal?.uricAcid ?? '--'} mg/dL
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">ပုံမှန်: 3.5 - 7.2</span>
            </div>

            {/* Cholesterol */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px]">ကိုလက်စထရော (Total Chol)</span>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                {latestLab.lipid?.totalCholesterol ?? '--'} mg/dL
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">စံနှုန်း: &lt; 200</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
