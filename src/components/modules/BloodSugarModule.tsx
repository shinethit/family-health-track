import React, { useState } from 'react';
import { Plus, Trash2, Droplets, AlertCircle, Info, Calendar, Utensils } from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { useAuth } from '../../context/AuthContext';
import { BloodSugarChart } from '../charts/HealthCharts';
import { calculateGlucoseStatus } from '../../lib/medicalCalculations';
import { BloodSugarType } from '../../types/health';

export const BloodSugarModule: React.FC = () => {
  const { glucoseRecords, addGlucoseRecord, deleteGlucoseRecord, selectedPatient, selectedFamilyMember } = useHealthData();
  const { profile } = useAuth();

  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [value, setValue] = useState<number>(110);
  const [type, setType] = useState<BloodSugarType>('fasting');
  const [mealInfo, setMealInfo] = useState<string>('မနက်အစာမစားမီ');
  const [date, setDate] = useState<string>(() => new Date().toISOString().substring(0, 16));
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Latest records
  const latestRecord = glucoseRecords.length > 0 ? glucoseRecords[glucoseRecords.length - 1] : null;
  const latestEvaluation = latestRecord ? calculateGlucoseStatus(latestRecord.value || latestRecord.glucoseValue || 100, latestRecord.type || latestRecord.timing || 'fasting') : null;

  // Latest HbA1c
  const hba1cRecords = glucoseRecords.filter(r => (r.type || r.timing) === 'hba1c');
  const latestHbA1c = hba1cRecords.length > 0 ? hba1cRecords[hba1cRecords.length - 1] : null;

  // Fasting records avg
  const fastingRecords = glucoseRecords.filter(r => (r.type || r.timing) === 'fasting');
  const avgFasting = fastingRecords.length > 0
    ? Math.round(fastingRecords.reduce((acc, c) => acc + (c.value || c.glucoseValue || 0), 0) / fastingRecords.length)
    : 0;

  // Real-time evaluation in modal
  const currentPreview = calculateGlucoseStatus(value, type);

  const handleTypeChange = (newType: BloodSugarType) => {
    setType(newType);
    if (newType === 'fasting') {
      setValue(105);
      setMealInfo('မနက်အစာမစားမီ ၈ နာရီအစာငတ်');
    } else if (newType === 'post_prandial') {
      setValue(145);
      setMealInfo('နေ့လယ်စာစားပြီး ၂ နာရီ');
    } else if (newType === 'hba1c') {
      setValue(6.5);
      setMealInfo('ဓာတ်ခွဲခန်း ၃ လပတ်စစ်ဆေးချက်');
    } else {
      setValue(130);
      setMealInfo('နေ့လယ်ပိုင်း အချိန်မရွေးစစ်ဆေးခြင်း');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSubmitting(true);
    try {
      await addGlucoseRecord({
        userId: selectedPatient ? selectedPatient.id : (selectedFamilyMember ? selectedFamilyMember.id : profile.id),
        userName: selectedPatient ? selectedPatient.displayName : (selectedFamilyMember ? selectedFamilyMember.name : profile.displayName),
        value: Number(value),
        type,
        mealInfo,
        date,
        notes,
      });
      setIsOpenAdd(false);
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner / Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Droplets className="w-6 h-6 text-emerald-500" />
            ဆီးချို / သွေးတွင်းသကြားဓာတ် မှတ်တမ်း (Blood Glucose & HbA1c)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {selectedPatient 
              ? `လူနာ ${selectedPatient.displayName} ၏ သကြားဓာတ်စောင့်ကြည့်မှု`
              : 'အစာမစားမီ၊ အစာစားပြီး ၂ နာရီနှင့် ၃ လပတ် သကြားဓာတ်တို့ကို စနစ်တကျ မှတ်တမ်းတင်ပါ'}
          </p>
        </div>

        <button
          onClick={() => setIsOpenAdd(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-sm transition-all cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4" />
          သကြားဓာတ် အသစ်ထည့်မည်
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Latest Reading */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>နောက်ဆုံးတိုင်းတာချက် (Latest)</span>
            <Droplets className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {latestRecord ? latestRecord.value : '--'}
            </span>
            <span className="text-xs text-slate-400">
              {latestRecord?.type === 'hba1c' ? '%' : 'mg/dL'}
            </span>
          </div>
          {latestEvaluation && (
            <div className={`mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${latestEvaluation.bgColor} ${latestEvaluation.color} ${latestEvaluation.borderColor}`}>
              {latestEvaluation.labelMm}
            </div>
          )}
        </div>

        {/* 3-Month HbA1c */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>၃ လပတ် ပျမ်းမျှ (HbA1c)</span>
            <span className="text-xs font-semibold px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded">Lab</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {latestHbA1c ? `${latestHbA1c.value}` : '--'}
            </span>
            <span className="text-xs text-slate-400">%</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {latestHbA1c ? ((latestHbA1c.value || latestHbA1c.glucoseValue || 0) < 5.7 ? 'ပုံမှန်အဆင့်' : (latestHbA1c.value || latestHbA1c.glucoseValue || 0) <= 6.4 ? 'ဆီးချိုအကြိုအဆင့်' : 'ဆီးချိုထိန်းချုပ်မှု လိုအပ်') : 'စံနှုန်း: ၅.၇% အောက်'}
          </p>
        </div>

        {/* Average Fasting */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>အစာမစားမီ ပျမ်းမျှ (Fasting Avg)</span>
            <Info className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {avgFasting || '--'}
            </span>
            <span className="text-xs text-slate-400">mg/dL</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            ပန်းတိုင်: ၇၀ မှ ၉၉ mg/dL အတွင်း
          </p>
        </div>

        {/* Nutrition advice */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-400 mb-1">
            <AlertCircle className="w-4 h-4" />
            အစားအသောက် အကြံပြုချက်
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-1">
            {latestEvaluation ? latestEvaluation.advice : 'ထမင်း၊ သကြား၊ အချိုရည်နှင့် အသီးချိုများ လျှော့စားပါ၊ အမျှင်ဓာတ်များသော အသီးအရွက် ပိုစားပါ။'}
          </p>
        </div>
      </div>

      {/* SVG Trend Chart */}
      <BloodSugarChart records={glucoseRecords} />

      {/* History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
            သကြားဓာတ် စစ်ဆေးမှုမှတ်တမ်းများ (Glucose Logs)
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {glucoseRecords.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-medium">ရက်စွဲ / အချိန်</th>
                <th className="py-3 px-4 font-medium">အမျိုးအစား (Type)</th>
                <th className="py-3 px-4 font-medium">ပမာဏ (Reading)</th>
                <th className="py-3 px-4 font-medium">အခြေအနေ</th>
                <th className="py-3 px-4 font-medium">အစားအသောက် ဆက်စပ်မှု</th>
                <th className="py-3 px-4 font-medium">မှတ်ချက်</th>
                <th className="py-3 px-4 font-medium text-right">လုပ်ဆောင်ချက်</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {glucoseRecords.slice().reverse().map((record) => {
                const rVal = record.value || record.glucoseValue || 100;
                const rType = record.type || record.timing || 'fasting';
                const evalInfo = calculateGlucoseStatus(rVal, rType);
                const rDate = record.date || record.timestamp || '';
                return (
                  <tr key={record.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono">
                      {rDate.replace('T', ' ')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {rType === 'fasting' && 'အစာမစားမီ (Fasting)'}
                        {rType === 'post_prandial' && 'အစာစားပြီး ၂ နာရီ'}
                        {rType === 'random' && 'အချိန်မရွေး (Random)'}
                        {rType === 'hba1c' && 'HbA1c (၃ လပတ်)'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white font-mono text-sm">
                      {rVal}{' '}
                      <span className="text-[10px] text-slate-400 font-normal">
                        {rType === 'hba1c' ? '%' : 'mg/dL'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${evalInfo.bgColor} ${evalInfo.color} ${evalInfo.borderColor}`}>
                        {evalInfo.labelMm}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {record.mealInfo || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {record.notes || '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => deleteGlucoseRecord(record.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                        title="ဖျက်မည်"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isOpenAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Droplets className="w-5 h-5 text-emerald-500" />
                သကြားဓာတ် အသစ်ထည့်သွင်းခြင်း
              </h3>
              <button
                onClick={() => setIsOpenAdd(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Type Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  စစ်ဆေးသည့် အမျိုးအစား (Test Type) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'fasting', label: 'အစာမစားမီ' },
                    { id: 'post_prandial', label: 'အစာစားပြီး' },
                    { id: 'random', label: 'အချိန်မရွေး' },
                    { id: 'hba1c', label: 'HbA1c (၃လ)' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleTypeChange(t.id as BloodSugarType)}
                      className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                        type === t.id
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Value Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {type === 'hba1c' ? 'HbA1c တန်ဖိုး (%) *' : 'သွေးတွင်းသကြားဓာတ် တန်ဖိုး (mg/dL) *'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step={type === 'hba1c' ? '0.1' : '1'}
                    min={type === 'hba1c' ? '3' : '20'}
                    max={type === 'hba1c' ? '20' : '600'}
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xl font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <span className="absolute right-3.5 top-3 text-xs text-slate-400 font-medium">
                    {type === 'hba1c' ? '%' : 'mg/dL'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {type === 'fasting' && 'ပုံမှန်: 70 - 99 mg/dL'}
                  {type === 'post_prandial' && 'ပုံမှန်: 140 mg/dL အောက်'}
                  {type === 'random' && 'ပုံမှန်: 140 mg/dL အောက်'}
                  {type === 'hba1c' && 'ပုံမှန်: 5.7% အောက်'}
                </span>
              </div>

              {/* Meal & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Utensils className="w-3.5 h-3.5 text-slate-400" />
                    အစားအသောက် အခြေအနေ
                  </label>
                  <input
                    type="text"
                    value={mealInfo}
                    onChange={(e) => setMealInfo(e.target.value)}
                    placeholder="ဥပမာ- ညစာစားပြီး ၈ နာရီအကြာ"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    စစ်ဆေးသည့် ရက်စွဲ
                  </label>
                  <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Status Preview */}
              <div className={`p-3 rounded-xl border ${currentPreview.bgColor} ${currentPreview.borderColor}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    အကဲဖြတ်ချက်:
                  </span>
                  <span className={`text-xs font-bold ${currentPreview.color}`}>
                    {currentPreview.labelMm}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                  {currentPreview.advice}
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ထပ်ဆောင်းမှတ်ချက် (Notes)
                </label>
                <input
                  type="text"
                  placeholder="ဥပမာ- ဆီးချိုဆေး မနက်စာမစားမီ သောက်ခဲ့သည်"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'သိမ်းဆည်းနေသည်...' : 'မှတ်တမ်းသိမ်းမည်'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
