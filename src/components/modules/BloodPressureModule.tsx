import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Heart, Activity, AlertCircle, Info, Calendar, BarChart2, Table, TrendingUp, Utensils, Sparkles } from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { useAuth } from '../../context/AuthContext';
import { BloodPressureChart } from '../charts/HealthCharts';
import { calculateBPCategory, parseDateToMs } from '../../lib/medicalCalculations';

export const BloodPressureModule: React.FC = () => {
  const { bpRecords, addBPRecord, deleteBPRecord, selectedPatient, selectedFamilyMember } = useHealthData();
  const { profile, isAdmin } = useAuth();

  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [systolic, setSystolic] = useState<number>(120);
  const [diastolic, setDiastolic] = useState<number>(80);
  const [pulse, setPulse] = useState<number>(72);
  const [condition, setCondition] = useState<'resting' | 'morning' | 'night' | 'after_exercise' | 'stress'>('resting');
  const [dietRecord, setDietRecord] = useState<string>('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().substring(0, 16));
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick diet suggestions
  const quickDietPresets = [
    '🍲 အငန်/ငပိ/ငံပြာရည်ကဲသောအစားအစာ',
    '☕ ကော်ဖီ/လက်ဖက်ရည်ပြင်းပြင်း',
    '🥩 အသားနီ/ကလီစာ/ဝက်သား',
    '🍺 အရက်/ဘီယာ',
    '🥗 အသီးအရွက်/အပေါ့အစာ',
    '🍚 သာမန်အိမ်ထမင်းဟင်း',
  ];

  const handleAddDietTag = (tag: string) => {
    if (!dietRecord) {
      setDietRecord(tag);
    } else if (!dietRecord.includes(tag)) {
      setDietRecord(`${dietRecord}၊ ${tag}`);
    }
  };

  // View state: 'both' | 'graph' | 'table'
  const [viewMode, setViewMode] = useState<'both' | 'graph' | 'table'>('both');
  // Timeframe state: 'all' | '1m' | '3m' | '6m'
  const [timeframe, setTimeframe] = useState<'all' | '1m' | '3m' | '6m'>('all');

  // Time boundaries for filtering
  const now = new Date();
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).getTime();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()).getTime();

  // Ensure chronological ascending sorting for chart and latest record calculation using parseDateToMs
  const sortedBP = useMemo(() => {
    return [...bpRecords].sort((a, b) => 
      parseDateToMs(a.date || a.timestamp || a.createdAt) - parseDateToMs(b.date || b.timestamp || b.createdAt)
    );
  }, [bpRecords]);

  const filteredBP = useMemo(() => {
    return sortedBP.filter(r => {
      const ms = parseDateToMs(r.date || r.timestamp || r.createdAt);
      if (timeframe === '1m') return ms >= oneMonthAgo;
      if (timeframe === '3m') return ms >= threeMonthsAgo;
      if (timeframe === '6m') return ms >= sixMonthsAgo;
      return true;
    });
  }, [sortedBP, timeframe]);

  // Latest record (most recent date/time timestamp)
  const latestBP = sortedBP.length > 0 ? sortedBP[sortedBP.length - 1] : null;
  const latestEvaluation = latestBP ? calculateBPCategory(latestBP.systolic, latestBP.diastolic) : null;

  // Real-time evaluation for the modal input
  const currentPreview = calculateBPCategory(systolic, diastolic);

  // Averages (computed on filtered subset)
  const targetForAvg = filteredBP.length > 0 ? filteredBP : sortedBP;
  const avgSystolic = targetForAvg.length > 0
    ? Math.round(targetForAvg.reduce((acc, cur) => acc + cur.systolic, 0) / targetForAvg.length)
    : 0;
  const avgDiastolic = targetForAvg.length > 0
    ? Math.round(targetForAvg.reduce((acc, cur) => acc + cur.diastolic, 0) / targetForAvg.length)
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSubmitting(true);
    try {
      await addBPRecord({
        userId: selectedPatient ? selectedPatient.id : (selectedFamilyMember ? selectedFamilyMember.id : profile.id),
        userName: selectedPatient ? selectedPatient.displayName : (selectedFamilyMember ? selectedFamilyMember.name : profile.displayName),
        systolic: Number(systolic),
        diastolic: Number(diastolic),
        pulse: Number(pulse),
        condition,
        dietNotes: dietRecord.trim() || undefined,
        foodIntake: dietRecord.trim() || undefined,
        dietRecord: dietRecord.trim() || undefined,
        date,
        notes: notes.trim() || undefined,
      });
      setIsOpenAdd(false);
      setDietRecord('');
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-rose-500" />
            သွေးတိုး / သွေးပေါင်ချိန် မှတ်တမ်း (Blood Pressure)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {selectedPatient 
              ? `အသုံးပြုသူ ${selectedPatient.displayName} ၏ သွေးပေါင်ချိန်စောင့်ကြည့်မှု` 
              : 'နေ့စဉ် သွေးပေါင်ချိန်ကို တိကျစွာမှတ်တမ်းတင်ပြီး နှလုံးနှင့် သွေးကြောကျန်းမာရေးကို စောင့်ကြပ်ပါ'}
          </p>
        </div>

        <button
          onClick={() => setIsOpenAdd(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium shadow-sm transition-all cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4" />
          သွေးပေါင်ချိန် အသစ်ထည့်မည်
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Latest Reading */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>နောက်ဆုံးတိုင်းတာချက် (Latest)</span>
            <Activity className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : '--/--'}
            </span>
            <span className="text-xs text-slate-400">mmHg</span>
          </div>
          {latestEvaluation && (
            <div className={`mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${latestEvaluation.bgColor} ${latestEvaluation.color} ${latestEvaluation.borderColor}`}>
              {latestEvaluation.labelMm}
            </div>
          )}
        </div>

        {/* Pulse */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>နှလုံးခုန်နှုန်း (Pulse)</span>
            <Heart className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {latestBP ? (latestBP.pulse || latestBP.pulseRate || '--') : '--'}
            </span>
            <span className="text-xs text-slate-400">bpm</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {latestBP && (latestBP.pulse || latestBP.pulseRate || 0) >= 60 && (latestBP.pulse || latestBP.pulseRate || 0) <= 100 ? 'ပုံမှန် နှလုံးခုန်နှုန်း' : 'ပုံမှန်အပိုင်းအခြား (၆၀ - ၁၀၀)'}
          </p>
        </div>

        {/* Average BP */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>ပျမ်းမျှ သွေးပေါင်ချိန် (Average)</span>
            <Info className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {avgSystolic ? `${avgSystolic}/${avgDiastolic}` : '--/--'}
            </span>
            <span className="text-xs text-slate-400">mmHg</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            မှတ်တမ်း စုစုပေါင်း ({bpRecords.length}) ကြိမ်အပေါ်
          </p>
        </div>

        {/* Clinical Advice Card */}
        <div className="bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/30 dark:to-orange-950/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/40 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400 mb-1">
            <AlertCircle className="w-4 h-4" />
            ဆရာဝန် သတိပြုရန် အချက်
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-1">
            {latestEvaluation ? latestEvaluation.advice : 'သွေးပေါင်ချိန်ကို မနက်စာမစားမီနှင့် ညအိပ်ရာဝင်ချိန် ပုံမှန်တိုင်းပေးပါ။'}
          </p>
        </div>
      </div>

      {/* Control Bar: View Switcher (Graph vs Table vs Both) + Timeframe Filter */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              သွေးပေါင်ချိန် သမိုင်းမှတ်တမ်း ပြသမှု (BP History Views)
            </h3>
            <p className="text-[11px] text-slate-500">
              Graph မျဉ်းကွေးဖြင့် ဖြစ်စေ၊ Data ဇယားဖြင့် ဖြစ်စေ ကာလအလိုက် စောင့်ကြည့်နိုင်ပါသည်
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
                  ? 'bg-white dark:bg-slate-900 text-rose-800 dark:text-rose-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5 text-rose-600" />
              <span>📊 Graph & Data</span>
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'graph'
                  ? 'bg-white dark:bg-slate-900 text-rose-800 dark:text-rose-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
              <span>📈 Graph View</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-rose-800 dark:text-rose-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5 text-rose-600" />
              <span>📋 Data ဇယား</span>
            </button>
          </div>

          {/* Timeframe Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setTimeframe('all')}
              className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                timeframe === 'all'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              အားလုံး
            </button>
            <button
              onClick={() => setTimeframe('1m')}
              className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                timeframe === '1m'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              ၁ လ
            </button>
            <button
              onClick={() => setTimeframe('3m')}
              className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                timeframe === '3m'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              ၃ လ
            </button>
            <button
              onClick={() => setTimeframe('6m')}
              className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                timeframe === '6m'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              ၆ လ
            </button>
          </div>
        </div>
      </div>

      {/* GRAPH VIEW: SVG Trend Chart */}
      {(viewMode === 'both' || viewMode === 'graph') && (
        <BloodPressureChart records={filteredBP} />
      )}

      {/* DATA TABLE VIEW: History Table */}
      {(viewMode === 'both' || viewMode === 'table') && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
              သွေးပေါင်ချိန် မှတ်တမ်းများ (Blood Pressure Log - {timeframe === 'all' ? 'အားလုံး' : timeframe === '1m' ? '၁ လစာ' : timeframe === '3m' ? '၃ လစာ' : '၆ လစာ'})
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {filteredBP.length} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-medium">ရက်စွဲ / အချိန်</th>
                  <th className="py-3 px-4 font-medium">အပေါ်သွေး (Sys)</th>
                  <th className="py-3 px-4 font-medium">အောက်သွေး (Dia)</th>
                  <th className="py-3 px-4 font-medium">နှလုံးခုန် (Pulse)</th>
                  <th className="py-3 px-4 font-medium">အခြေအနေ သတ်မှတ်ချက်</th>
                  <th className="py-3 px-4 font-medium">စားသုံးခဲ့သော အစားအသောက်</th>
                  <th className="py-3 px-4 font-medium">တိုင်းတာချိန်</th>
                  <th className="py-3 px-4 font-medium">မှတ်ချက်</th>
                  <th className="py-3 px-4 font-medium text-right">လုပ်ဆောင်ချက်</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredBP.slice().reverse().map((record) => {
                  const evalInfo = calculateBPCategory(record.systolic, record.diastolic);
                  const diet = record.dietRecord || record.dietNotes || record.foodIntake;
                  return (
                    <tr key={record.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono">
                        {(record.date || record.timestamp || '').replace('T', ' ')}
                      </td>
                      <td className="py-3 px-4 font-bold text-rose-600 dark:text-rose-400 font-mono text-sm">
                        {record.systolic} <span className="text-[10px] text-slate-400 font-normal">mmHg</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400 font-mono text-sm">
                        {record.diastolic} <span className="text-[10px] text-slate-400 font-normal">mmHg</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-amber-600 dark:text-amber-400 font-mono">
                        {record.pulse} <span className="text-[10px] text-slate-400 font-normal">bpm</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${evalInfo.bgColor} ${evalInfo.color} ${evalInfo.borderColor}`}>
                          {evalInfo.labelMm}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                        {diet ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 font-medium text-[11px]">
                            <Utensils className="w-3 h-3 text-amber-600" />
                            {diet}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {record.condition === 'morning' && 'မနက်နိုးနိုးချင်း'}
                        {record.condition === 'night' && 'ညအိပ်ရာဝင်'}
                        {record.condition === 'resting' && 'နားနေချိန်'}
                        {record.condition === 'after_exercise' && 'လှုပ်ရှားပြီးစ'}
                        {record.condition === 'stress' && 'စိတ်ဖိစီးချိန်'}
                        {!record.condition && '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                        {record.notes || '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => deleteBPRecord(record.id)}
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
      )}

      {/* Add New BP Modal */}
      {isOpenAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-rose-500" />
                သွေးပေါင်ချိန် အသစ်ထည့်သွင်းခြင်း
              </h3>
              <button
                onClick={() => setIsOpenAdd(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Systolic & Diastolic Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    အပေါ်သွေး (Systolic mmHg) *
                  </label>
                  <input
                    type="number"
                    min="60"
                    max="260"
                    value={systolic}
                    onChange={(e) => setSystolic(Number(e.target.value))}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-lg font-bold focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  />
                  <span className="text-[11px] text-slate-400">စံနှုန်း: 120 အောက်</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    အောက်သွေး (Diastolic mmHg) *
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="160"
                    value={diastolic}
                    onChange={(e) => setDiastolic(Number(e.target.value))}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-lg font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                  <span className="text-[11px] text-slate-400">စံနှုန်း: 80 အောက်</span>
                </div>
              </div>

              {/* Pulse & Condition */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    နှလုံးခုန်နှုန်း (Pulse bpm) *
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="220"
                    value={pulse}
                    onChange={(e) => setPulse(Number(e.target.value))}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-base font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                  <span className="text-[11px] text-slate-400">စံနှုန်း: 60 - 100</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    တိုင်းတာသည့်အချိန် / အခြေအနေ
                  </label>
                  <select
                    value={condition}
                    onChange={(e: any) => setCondition(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  >
                    <option value="morning">မနက်နိုးနိုးချင်း</option>
                    <option value="resting">နားနေချိန်</option>
                    <option value="night">ညအိပ်ရာဝင်</option>
                    <option value="after_exercise">လှုပ်ရှားပြီးစ</option>
                    <option value="stress">စိတ်လှုပ်ရှား/ပင်ပန်းချိန်</option>
                  </select>
                </div>
              </div>

              {/* 🍲 Dedicated Diet / Food Intake Section */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-amber-600" />
                    စားသုံးခဲ့သော အစားအသောက် မှတ်တမ်း (Diet / Food Intake)
                  </label>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                    သွေးတိုး/အဆစ်ကိုက်မှု သုံးသပ်ရန်
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="ဥပမာ- ငပိရည်နှင့် အငန်များသောညစာ၊ အမဲသားဟင်း၊ ကော်ဖီ ၂ ခွက်"
                  value={dietRecord}
                  onChange={(e) => setDietRecord(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden placeholder:text-slate-400"
                />
                
                {/* Quick Pick Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {quickDietPresets.map((tag, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddDietTag(tag)}
                      className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors cursor-pointer"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  တိုင်းတာသည့် ရက်စွဲနှင့် အချိန်
                </label>
                <input
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden font-mono"
                />
              </div>

              {/* Real-time Category Preview */}
              <div className={`p-3 rounded-xl border ${currentPreview.bgColor} ${currentPreview.borderColor}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    လက်ရှိထည့်သွင်းချက် အကဲဖြတ်မှု:
                  </span>
                  <span className={`text-xs font-bold ${currentPreview.color}`}>
                    {currentPreview.labelMm} ({currentPreview.labelEn})
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                  {currentPreview.advice}
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ထပ်ဆောင်းမှတ်ချက် (General Notes)
                </label>
                <input
                  type="text"
                  placeholder="ဥပမာ- ဆေးသောက်ပြီး ၂ နာရီ၊ ခေါင်းမူးနေသည်"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOpenAdd(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
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
