import React, { useState } from 'react';
import { 
  X, 
  Edit3, 
  Trash2, 
  Activity, 
  Droplets, 
  Pill, 
  FlaskConical, 
  Send, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  AlertCircle,
  Stethoscope,
  Heart
} from 'lucide-react';
import { 
  UserProfile, 
  BloodPressureRecord, 
  BloodSugarRecord, 
  LabTestRecord, 
  Medication, 
  DoctorAdvice 
} from '../../../types/health';
import { BloodPressureChart, BloodSugarChart } from '../../charts/HealthCharts';
import { 
  calculateAge, 
  calculateBMI, 
  calculateBPCategory, 
  calculateGlucoseStatus,
  parseDateToMs 
} from '../../../lib/medicalCalculations';

interface AdminPatientDetailProps {
  patient: UserProfile;
  bpRecords: BloodPressureRecord[];
  glucoseRecords: BloodSugarRecord[];
  labRecords: LabTestRecord[];
  medications: Medication[];
  doctorAdvices: DoctorAdvice[];
  onBack: () => void;
  onEditPatient: (patient: UserProfile) => void;
  onDeletePatient: (patient: UserProfile) => void;
  onSendAdvice: (advice: string, diet: string) => Promise<void>;
  getResolvedName: (p: Partial<UserProfile> | null | undefined) => string;
}

export const AdminPatientDetail: React.FC<AdminPatientDetailProps> = ({
  patient,
  bpRecords,
  glucoseRecords,
  labRecords,
  medications,
  doctorAdvices,
  onBack,
  onEditPatient,
  onDeletePatient,
  onSendAdvice,
  getResolvedName,
}) => {
  const [newAdvice, setNewAdvice] = useState('');
  const [dietAdvice, setDietAdvice] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [adviceSuccess, setAdviceSuccess] = useState(false);

  const sortedUserBP = [...bpRecords].sort((a, b) => 
    parseDateToMs(a.date || a.timestamp || a.createdAt) - parseDateToMs(b.date || b.timestamp || b.createdAt)
  );
  const sortedUserGlu = [...glucoseRecords].sort((a, b) => 
    parseDateToMs(a.date || a.timestamp || a.createdAt) - parseDateToMs(b.date || b.timestamp || b.createdAt)
  );

  const latestBP = sortedUserBP.length > 0 ? sortedUserBP[sortedUserBP.length - 1] : null;
  const latestGlucose = sortedUserGlu.length > 0 ? sortedUserGlu[sortedUserGlu.length - 1] : null;

  const ageObj = calculateAge(patient.dateOfBirth);
  const resolvedAge = ageObj ? ageObj.years : (patient.age || null);
  const patientBMI = (patient.weightKg && patient.heightCm)
    ? calculateBMI(patient.weightKg, patient.heightCm)
    : null;

  const cleanName = getResolvedName(patient);

  const handleAdviceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdvice.trim()) return;
    setIsSending(true);
    try {
      await onSendAdvice(newAdvice.trim(), dietAdvice.trim());
      setNewAdvice('');
      setDietAdvice('');
      setAdviceSuccess(true);
      setTimeout(() => setAdviceSuccess(false), 3000);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            title="အသုံးပြုသူများ စာရင်းသို့ ပြန်သွားမည်"
            aria-label="အသုံးပြုသူများ စာရင်းသို့ ပြန်သွားမည်"
          >
            <X className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {cleanName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                အသုံးပြုသူမှတ်တမ်း (User Profile)
              </span>
              {patientBMI && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${patientBMI.bgColor} ${patientBMI.color} ${patientBMI.borderColor}`}>
                  BMI: {patientBMI.bmi} ({patientBMI.labelMm})
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span>အီးမေးလ်: <strong>{patient.email || '-'}</strong></span>
              <span>•</span>
              <span>ဖုန်း: <strong>{patient.phone || '-'}</strong></span>
              <span>•</span>
              <span>အသက်: <strong>{resolvedAge !== null ? `${resolvedAge} နှစ်` : 'မထည့်ရသေးပါ'}</strong> {ageObj ? `(${ageObj.formattedMm})` : ''}</span>
              <span>•</span>
              <span>အရပ်: {patient.heightCm ? `${patient.heightCm} cm` : '-'} / ကိုယ်အလေးချိန်: {patient.weightKg ? `${patient.weightKg} kg` : '-'}</span>
              <span>•</span>
              <span>ကျား/မ: {patient.gender === 'female' ? 'မ' : patient.gender === 'male' ? 'ကျား' : '-'}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onEditPatient(patient)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            title="အချက်အလက် ပြင်ဆင်မည်"
            aria-label={`${cleanName} ၏ အချက်အလက် ပြင်ဆင်မည်`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>ပြင်ဆင်မည်</span>
          </button>
          <button
            type="button"
            onClick={() => onDeletePatient(patient)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/80 hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer flex items-center gap-1.5"
            title="လူနာမှတ်တမ်း ဖျက်မည်"
            aria-label={`${cleanName} ၏ လူနာမှတ်တမ်း ဖျက်မည်`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>ဖျက်မည်</span>
          </button>
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            အသုံးပြုသူများ စာရင်းသို့ ပြန်သွားမည်
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Latest BP */}
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

        {/* Latest Glucose */}
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
                  {latestGlucose.glucoseValue || latestGlucose.value}
                </span>
                <span className="text-xs text-slate-400">mg/dL</span>
                <span className="text-xs text-slate-400 ml-auto">({latestGlucose.type || latestGlucose.timing || 'random'})</span>
              </div>
              {(() => {
                const gluVal = latestGlucose.glucoseValue || latestGlucose.value || 0;
                const gluType = latestGlucose.type || latestGlucose.timing || 'fasting';
                const status = calculateGlucoseStatus(gluVal, gluType as any);
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
            <p className="text-xs text-slate-400 py-3">သွေးချို မှတ်တမ်း မရှိသေးပါ</p>
          )}
        </div>
      </div>

      {/* Interactive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-500" />
            <span>သွေးပေါင်ချိန် ပြောင်းလဲမှု ဂရပ်</span>
          </h3>
          <BloodPressureChart records={sortedUserBP} />
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-emerald-500" />
            <span>သွေးချို ပြောင်းလဲမှု ဂရပ်</span>
          </h3>
          <BloodSugarChart records={sortedUserGlu} />
        </div>
      </div>

      {/* Doctor Advice Composer */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              ဆရာဝန် ဆေးပညာဆိုင်ရာ အကြံပြုချက် ရေးသားပေးပို့ခြင်း
            </h3>
            <p className="text-[11px] text-slate-500">
              {cleanName} ၏ ဖုန်း/အက်ပ် screen ပေါ်တွင် တိုက်ရိုက်မြင်တွေ့ရမည့် အကြံပြုချက်
            </p>
          </div>
        </div>

        {adviceSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>အကြံပြုချက်အား လူနာထံ အောင်မြင်စွာ ပေးပို့ပြီးပါပြီ။</span>
          </div>
        )}

        <form onSubmit={handleAdviceSubmit} className="space-y-3">
          <div>
            <label htmlFor="admin-doctor-advice-text" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ကျန်းမာရေးနှင့် ဆေးဝါး လမ်းညွှန်ချက် *
            </label>
            <textarea
              id="admin-doctor-advice-text"
              required
              rows={3}
              placeholder="ဥပမာ- သွေးပေါင်ချိန် ပုံမှန်ထက် အနည်းငယ်မြင့်နေပါသဖြင့် ဆားလျှော့စားရန်နှင့် သွေးပေါင်ဆေး ပုံမှန်သောက်ပေးပါ..."
              value={newAdvice}
              onChange={(e) => setNewAdvice(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label htmlFor="admin-doctor-diet-text" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              အစားအသောက် / Diet အကြံပြုချက် (ရွေးချယ်ရန်)
            </label>
            <input
              id="admin-doctor-diet-text"
              type="text"
              placeholder="ဥပမာ- ငပိရည်၊ ငံပြာရည် လုံးဝရှောင်ရန်၊ ငှက်ပျောသီးနှင့် ဟင်းသီးဟင်းရွက် ပိုစားရန်"
              value={dietAdvice}
              onChange={(e) => setDietAdvice(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSending}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'ပေးပို့နေသည်...' : 'လူနာထံ အကြံပြုချက် ပို့မည်'}</span>
            </button>
          </div>
        </form>

        {/* Previous Advices */}
        {doctorAdvices.length > 0 && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              ယခင် ပေးပို့ခဲ့သော အကြံပြုချက်များ ({doctorAdvices.length} ခု):
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {doctorAdvices.map((a) => (
                <div key={a.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                    <span>ဆရာဝန်: {a.doctorName || 'Admin ဆရာဝန်'}</span>
                    <span>{a.date || (a.createdAt ? new Date(a.createdAt).toLocaleDateString('my-MM') : '')}</span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200">{a.advice}</p>
                  {a.dietRecommendation && (
                    <p className="text-emerald-700 dark:text-emerald-400 text-[11px]">
                      🥗 Diet: {a.dietRecommendation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
