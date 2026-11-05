import React, { useState, useMemo, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Plus, Trash2, Droplets, AlertCircle, Info, Calendar, Utensils, BarChart2, Table, TrendingUp, Pencil } from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  SAVE_LATE_CONFIRM_MESSAGE,
  SAVE_TIMEOUT_MESSAGE,
  isSaveTimeoutError,
} from '../../lib/saveConfirmation';
import { BloodSugarChart } from '../charts/HealthCharts';
import { calculateGlucoseStatus, parseDateToMs, formatDateLabel } from '../../lib/medicalCalculations';
import { BloodSugarType } from '../../types/health';
import { MedicalDisclaimer } from '../common/MedicalDisclaimer';

// Measurement date + time for display (D-M3): never substitute createdAt
// for a measurement date — a record with no date shows 'ရက်စွဲ မရှိပါ'.
// formatDateLabel is the hardcoded Myanmar date helper (no 'my-MM').
const recordDateTime = (record: { date?: string; timestamp?: string }): string => {
  const raw = record.date || record.timestamp || '';
  if (!raw) return 'ရက်စွဲ မရှိပါ';
  const d = formatDateLabel(raw);
  return d.time ? `${d.date} ${d.time}` : d.date;
};

// Local (Asia/Rangoon) date-time for a datetime-local input —
// new Date().toISOString() is UTC, so a record entered early in the morning
// got yesterday's date (v2.4.11 F4).
const localDateTimeStr = (d: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Convert a stored date value into a datetime-local input value (v2.4.13
// edit). Stored values may be date-only ('2026-11-03', old records) or
// full ('2026-11-03T14:30'); a date-only value gets the current local time
// so the user can adjust it instead of the field showing blank.
const toDateTimeLocal = (value: string | undefined): string => {
  if (!value) return localDateTimeStr(new Date());
  if (/T\d{2}:\d{2}/.test(value)) return value.slice(0, 16);
  return `${value}T${localDateTimeStr(new Date()).slice(11, 16)}`;
};

export const BloodSugarModule: React.FC = () => {
  const { glucoseRecords, addGlucoseRecord, updateGlucoseRecord, deleteGlucoseRecord, selectedPatient, selectedFamilyMember, isPooledView, dataLoading } = useHealthData();
  const { profile } = useAuth();
  const { showToast } = useToast();

  const [isOpenAdd, setIsOpenAdd] = useState(false);
  // v2.4.13 edit: id of the record being edited, null in add mode. The
  // same modal/form is reused, prefilled from the record.
  const [editingId, setEditingId] = useState<string | null>(null);
  // v2.4.16: delete confirm uses the app Modal, never window.confirm.
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  // No prefilled value: 110 invited fake-normal records (v2.4.11 F5).
  // The input starts empty; the user must enter their own real reading.
  const [value, setValue] = useState<number | ''>('');
  const [type, setType] = useState<BloodSugarType>('fasting');
  const [mealInfo, setMealInfo] = useState<string>('မနက်အစာမစားမီ ၈ နာရီအစာငတ်');
  const [dietRecord, setDietRecord] = useState<string>('');
  const [date, setDate] = useState<string>(() => localDateTimeStr(new Date()));
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // v2.4.22 (Bug A): set when a save times out — the next submit is a
  // retry, and the context must check the list first so it never writes a
  // second copy of the same record.
  const saveTimedOutRef = useRef(false);

  // Fresh add-mode defaults (used when leaving edit mode so the next Add
  // never shows the edited record's values).
  const resetForm = () => {
    setValue('');
    setType('fasting');
    setMealInfo('မနက်အစာမစားမီ ၈ နာရီအစာငတ်');
    setDietRecord('');
    setDate(localDateTimeStr(new Date()));
    setNotes('');
  };

  // Open the form prefilled with an existing record for editing.
  // v2.4.17: legacy stored types 'post_prandial'/'postprandial' map to
  // 'post_meal_2h'; a missing/unknown type falls back to 'fasting'.
  // Stored data is NOT rewritten here — the record is saved with the
  // new type only on the next save.
  const startEdit = (record: typeof glucoseRecords[number]) => {
    setEditingId(record.id);
    setValue(record.value ?? record.glucoseValue ?? '');
    const rawType = record.type || record.timing || 'fasting';
    const knownTypes: BloodSugarType[] = ['fasting', 'before_meal', 'post_meal_2h', 'random', 'bedtime', 'hba1c'];
    setType(rawType === 'post_prandial' || rawType === 'postprandial' ? 'post_meal_2h' : knownTypes.includes(rawType) ? rawType : 'fasting');
    setMealInfo(record.mealInfo || '');
    setDietRecord(record.dietRecord || record.dietNotes || record.foodIntake || '');
    setDate(toDateTimeLocal(record.date || record.timestamp));
    setNotes(record.notes || '');
    setIsOpenAdd(true);
  };

  // Close the form. In edit mode the prefilled values are cleared back to
  // fresh add defaults so a later Add never inherits them.
  const closeForm = () => {
    if (editingId) {
      resetForm();
      setEditingId(null);
    }
    setIsOpenAdd(false);
  };

  // Open the form in add mode (defensive: never carry an edit id in).
  const openAdd = () => {
    if (editingId) {
      resetForm();
      setEditingId(null);
    }
    setIsOpenAdd(true);
  };

  // Quick food/diet suggestions for blood sugar tracking
  const quickSugarDietPresets = [
    '🍚 ထမင်းဖြူ/ကောက်ညှင်း/ခေါက်ဆွဲ',
    '🥤 သကြားပါသောအချိုရည်/လက်ဖက်ရည်',
    '🥭 အသီးချို/ဒူးရင်း/သရက်/ငှက်ပျော',
    '🍲 မုန့်ဟင်းခါး/မုန့်တီ/အကြော်စုံ',
    '🥖 ပေါင်မုန့်/ကိတ်မုန့်/ဘီစကွတ်',
    '🥗 ဟင်းသီးဟင်းရွက်/သခွား/ပဲသီး',
    '🥩 အသား/ငါး/ကြက်ဥ အဆီနည်းဟင်း',
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
  // History search + paging (latest 20 by default)
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllHistory, setShowAllHistory] = useState(false);

  // Time boundaries for filtering
  const now = new Date();
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).getTime();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()).getTime();

  const sortedGlucose = useMemo(() => {
    return [...glucoseRecords].sort((a, b) => 
      parseDateToMs(a.date || a.timestamp || a.createdAt) - parseDateToMs(b.date || b.timestamp || b.createdAt)
    );
  }, [glucoseRecords]);

  const filteredGlucose = useMemo(() => {
    return sortedGlucose.filter(r => {
      const ms = parseDateToMs(r.date || r.timestamp || r.createdAt);
      if (timeframe === '1m') return ms >= oneMonthAgo;
      if (timeframe === '3m') return ms >= threeMonthsAgo;
      if (timeframe === '6m') return ms >= sixMonthsAgo;
      return true;
    });
  }, [sortedGlucose, timeframe]);

  // Search the history list by date, notes, meal info or food record —
  // or by VALUE (B-M7): searching "120" must find a 120 mg/dL reading.
  const searchedGlucose = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return filteredGlucose;
    return filteredGlucose.filter((r) => {
      const hay = `${r.date || ''} ${r.timestamp || ''} ${r.notes || ''} ${r.mealInfo || ''} ${r.dietRecord || ''} ${r.dietNotes || ''} ${r.foodIntake || ''} ${r.value ?? r.glucoseValue ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [filteredGlucose, searchQuery]);

  // Newest first; show only the latest 20 unless expanded
  const displayGlucose = showAllHistory ? [...searchedGlucose].reverse() : [...searchedGlucose].slice(-20).reverse();

  // Latest records
  const latestRecord = sortedGlucose.length > 0 ? sortedGlucose[sortedGlucose.length - 1] : null;
  // No fabricated fallback: a record with no glucose value has no status.
  const latestGluValue = latestRecord?.value ?? latestRecord?.glucoseValue ?? null;
  // The age of the person whose records these are (paediatric guard in
  // calculateGlucoseStatus: under 18 gets no adult cut-offs).
  const targetPerson = selectedPatient || selectedFamilyMember || profile;
  const personAge = (targetPerson as { age?: number } | null)?.age;
  const latestEvaluation = latestRecord && latestGluValue != null ? calculateGlucoseStatus(latestGluValue, latestRecord.type || latestRecord.timing || 'fasting', personAge) : null;

  // Latest HbA1c
  const hba1cRecords = sortedGlucose.filter(r => (r.type || r.timing) === 'hba1c');
  const latestHbA1c = hba1cRecords.length > 0 ? hba1cRecords[hba1cRecords.length - 1] : null;
  // D-M6: a legacy glucoseValue-only record must still show here.
  const latestHbA1cValue = latestHbA1c?.value ?? latestHbA1c?.glucoseValue ?? null;

  // Fasting records avg
  const fastingRecords = filteredGlucose.filter(r => (r.type || r.timing) === 'fasting');
  const avgFasting = fastingRecords.length > 0
    ? Math.round(fastingRecords.reduce((acc, c) => acc + (c.value || c.glucoseValue || 0), 0) / fastingRecords.length)
    : 0;

  // Real-time evaluation in modal — only once a real value exists.
  // B-L6 (HbA1c preview guard): an HbA1c verdict only applies to a value
  // in the HbA1c range (3–20%). A mg/dL-sized number typed while HbA1c is
  // selected (e.g. 110) must NOT show a "ဆီးချိုအဆင့်" HbA1c verdict.
  const hba1cOutOfRange = type === 'hba1c' && value !== '' && (value < 3 || value > 20);
  const currentPreview = value !== '' && !hba1cOutOfRange ? calculateGlucoseStatus(value, type, personAge) : null;

  const handleTypeChange = (newType: BloodSugarType) => {
    setType(newType);
    // Switching the test type must NOT wipe the value the user already
    // typed (v2.4.11 F8). Only the per-type description changes.
    if (newType === 'fasting') {
      setMealInfo('မနက်အစာမစားမီ ၈ နာရီအစာငတ်');
    } else if (newType === 'before_meal') {
      setMealInfo('အစာမစားမီ');
    } else if (newType === 'post_meal_2h') {
      setMealInfo('အစာစားပြီး ၂ နာရီ');
    } else if (newType === 'random') {
      setMealInfo('အချိန်မရွေးစစ်ဆေးခြင်း');
    } else if (newType === 'bedtime') {
      setMealInfo('ညအိပ်ရာဝင်');
    } else if (newType === 'hba1c') {
      setMealInfo('ဓာတ်ခွဲခန်း ၃ လပတ်စစ်ဆေးချက်');
    } else {
      setMealInfo('နေ့လယ်ပိုင်း အချိန်မရွေးစစ်ဆေးခြင်း');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (value === '' || Number(value) <= 0) {
      showToast('သွေးတွင်းသကြားဓာတ် တန်ဖိုး ထည့်ပေးပါ', 'error');
      return;
    }
    setIsSubmitting(true);
    // v2.4.22 (Bug A): retry after a timeout? Pass it through so the
    // context checks the list first and never writes a second copy.
    const isRetry = saveTimedOutRef.current;
    saveTimedOutRef.current = false;
    try {
      if (editingId) {
        // v2.4.13 edit: only the editable fields; the context recomputes
        // the status from the new value/type. userId/userName never change.
        await updateGlucoseRecord(editingId, {
          value: Number(value),
          type,
          mealInfo: mealInfo.trim() || undefined,
          dietNotes: dietRecord.trim() || undefined,
          foodIntake: dietRecord.trim() || undefined,
          dietRecord: dietRecord.trim() || undefined,
          date,
          notes: notes.trim() || undefined,
        });
        setIsOpenAdd(false);
        setEditingId(null);
        resetForm();
        showToast('သကြားဓာတ် မှတ်တမ်း ပြင်ဆင်ပြီးပါပြီ', 'success');
        return;
      }
      const saveResult = await addGlucoseRecord({
        userId: selectedPatient ? selectedPatient.id : (selectedFamilyMember ? selectedFamilyMember.id : profile.id),
        userName: selectedPatient ? selectedPatient.displayName : (selectedFamilyMember ? selectedFamilyMember.name : profile.displayName),
        value: Number(value),
        type,
        mealInfo: mealInfo.trim() || undefined,
        dietNotes: dietRecord.trim() || undefined,
        foodIntake: dietRecord.trim() || undefined,
        dietRecord: dietRecord.trim() || undefined,
        date,
        notes: notes.trim() || undefined,
      }, { isRetry });
      setIsOpenAdd(false);
      setValue('');
      setDietRecord('');
      setNotes('');
      setDate(localDateTimeStr(new Date()));
      showToast(saveResult.confirmedLate ? SAVE_LATE_CONFIRM_MESSAGE : 'သကြားဓာတ် မှတ်တမ်းကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ', 'success');
    } catch (err) {
      // Save failed: keep the form open with all values intact so the user
      // can retry (v2.4.11 F3 — saves used to fail silently). In edit mode
      // the context already shows its own failure toast, so no second one.
      console.warn('Error saving glucose record:', err);
      // v2.4.22 (Bug A): on timeout the context already checked the list —
      // absent means it really did not save (as far as the app can see),
      // so the values stay and the user retries. In edit mode the context
      // already toasted, so no second one here.
      if (isSaveTimeoutError(err)) {
        saveTimedOutRef.current = true;
        if (!editingId) {
          showToast(SAVE_TIMEOUT_MESSAGE, 'error');
        }
      } else if (!editingId) {
        showToast('သကြားဓာတ် မှတ်တမ်း သိမ်းဆည်းခြင်း မအောင်မြင်ပါ — အင်တာနက် ချိတ်ဆက်မှု စစ်ပြီး ပြန်ကြိုးစားပါ။', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // While the first Firestore snapshot is still loading, show a loading
  // state instead of empty charts / "no records" messages.
  if (dataLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-emerald-600 animate-spin" aria-label="ဒေတာ ရယူနေပါသည်" />
        <p className="text-sm text-slate-500">ဒေတာ ရယူနေပါသည်...</p>
      </div>
    );
  }

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
              ? `အသုံးပြုသူ ${selectedPatient.displayName} ၏ သကြားဓာတ်စောင့်ကြည့်မှု`
              : selectedFamilyMember
                ? `အသုံးပြုသူ ${selectedFamilyMember.name} ၏ သကြားဓာတ်စောင့်ကြည့်မှု`
                : 'အစာမစားမီ၊ အစာစားပြီး ၂ နာရီနှင့် ၃ လပတ် သကြားဓာတ်တို့ကို စနစ်တကျ မှတ်တမ်းတင်ပါ'}
          </p>
        </div>

        <button
          onClick={openAdd}
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
              {/* D-M6: legacy glucoseValue-only records must show, not '--'. */}
              {latestGluValue ?? '--'}
            </span>
            <span className="text-xs text-slate-400">
              {latestRecord?.type === 'hba1c' ? '%' : 'mg/dL'}
            </span>
          </div>
          {/* D-H5: a "Latest" value with no date and no owner cannot be
              trusted — show when it was measured and whose it is. */}
          {latestRecord && (
            <p className="text-[11px] text-slate-400 mt-1.5">
              {recordDateTime(latestRecord)}
              {isPooledView && latestRecord.userName ? ` • ${latestRecord.userName}` : isPooledView && latestRecord.patientName ? ` • ${latestRecord.patientName}` : ''}
            </p>
          )}
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
              {/* D-M6: legacy glucoseValue-only records must show, not '--'. */}
              {latestHbA1cValue ?? '--'}
            </span>
            <span className="text-xs text-slate-400">%</span>
          </div>
          {latestHbA1c && (
            <p className="text-[11px] text-slate-400 mt-1.5">
              {recordDateTime(latestHbA1c)}
              {isPooledView && latestHbA1c.userName ? ` • ${latestHbA1c.userName}` : isPooledView && latestHbA1c.patientName ? ` • ${latestHbA1c.patientName}` : ''}
            </p>
          )}
          <p className="text-xs text-slate-400 mt-2">
            {latestHbA1c ? ((latestHbA1cValue || 0) < 5.7 ? 'ပုံမှန်အဆင့်' : (latestHbA1cValue || 0) <= 6.4 ? 'ဆီးချိုအကြိုအဆင့်' : 'ဆီးချိုထိန်းချုပ်မှု လိုအပ်') : 'စံနှုန်း: ၅.၇% အောက်'}
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

      {/* Control Bar: View Switcher (Graph vs Table vs Both) + Timeframe Filter */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              ဆီးချို / သကြားဓာတ် သမိုင်းမှတ်တမ်း ပြသမှု (Glucose History Views)
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
              <span>📈 Graph View</span>
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
              <span>📋 Data ဇယား</span>
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

      {/* GRAPH VIEW: SVG Trend Chart */}
      {(viewMode === 'both' || viewMode === 'graph') && (
        <BloodSugarChart records={filteredGlucose} />
      )}

      {/* DATA TABLE VIEW: History Table */}
      {(viewMode === 'both' || viewMode === 'table') && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
              သကြားဓာတ် စစ်ဆေးမှုမှတ်တမ်းများ (Glucose Logs - {timeframe === 'all' ? 'အားလုံး' : timeframe === '1m' ? '၁ လစာ' : timeframe === '3m' ? '၃ လစာ' : '၆ လစာ'})
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {searchedGlucose.length} records
            </span>
          </div>

          {/* History search */}
          <div className="px-4 pt-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ရှာဖွေမည် — ရက်စွဲ (သို့) မှတ်ချက်"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden placeholder:text-slate-400"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-medium">ရက်စွဲ / အချိန်</th>
                  {isPooledView && <th className="py-3 px-4 font-medium">ပိုင်ရှင်</th>}
                  <th className="py-3 px-4 font-medium">အမျိုးအစား (Type)</th>
                  <th className="py-3 px-4 font-medium">ပမာဏ (Reading)</th>
                  <th className="py-3 px-4 font-medium">အခြေအနေ</th>
                  <th className="py-3 px-4 font-medium">စားသုံးခဲ့သော အစားအသောက်</th>
                  <th className="py-3 px-4 font-medium">စစ်ဆေးချိန် ဆက်စပ်မှု</th>
                  <th className="py-3 px-4 font-medium">မှတ်ချက်</th>
                  <th className="py-3 px-4 font-medium text-right">လုပ်ဆောင်ချက်</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {displayGlucose.length === 0 && (
                  <tr>
                    <td colSpan={isPooledView ? 9 : 8} className="py-8 px-4 text-center text-slate-400">
                      မှတ်တမ်း မရှိသေးပါ — အထက်ပါ ခလုတ်ဖြင့် ပထမဆုံး သကြားဓာတ် ထည့်သွင်းနိုင်ပါသည်
                    </td>
                  </tr>
                )}
                {displayGlucose.map((record) => {
                  const rVal = record.value ?? record.glucoseValue ?? null;
                  const rType = record.type || record.timing || 'fasting';
                  const evalInfo = rVal != null ? calculateGlucoseStatus(rVal, rType) : null;
                  const diet = record.dietRecord || record.dietNotes || record.foodIntake;
                  return (
                    <tr key={record.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono">
                        {recordDateTime(record)}
                      </td>
                      {isPooledView && (
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {record.userName || record.patientName || '—'}
                        </td>
                      )}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {rType === 'fasting' && 'အစာမစားမီ (Fasting)'}
                          {rType === 'post_prandial' && 'အစာစားပြီး ၂ နာရီ'}
                          {rType === 'random' && 'အချိန်မရွေး (Random)'}
                          {rType === 'hba1c' && 'HbA1c (၃ လပတ်)'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white font-mono text-sm">
                        {rVal ?? '—'}{' '}
                        <span className="text-[11px] text-slate-400 font-normal">
                          {rType === 'hba1c' ? '%' : 'mg/dL'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {evalInfo ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${evalInfo.bgColor} ${evalInfo.color} ${evalInfo.borderColor}`}>
                            {evalInfo.labelMm}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                        {diet ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 font-medium text-[11px]">
                            <Utensils className="w-3 h-3 text-emerald-600" />
                            {diet}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {record.mealInfo || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                        {record.notes || '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => startEdit(record)}
                          className="text-slate-400 hover:text-emerald-600 transition-colors p-2 cursor-pointer"
                          title="ပြင်ဆင်မည်"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(record.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-2 cursor-pointer"
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
          {searchedGlucose.length > 20 && (
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-center">
              <button
                onClick={() => setShowAllHistory(!showAllHistory)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                {showAllHistory ? 'အနည်းငယ်သာ ပြမည်' : `အားလုံး ကြည့်မည် (${searchedGlucose.length} ခု)`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Medical Disclaimer */}
      <MedicalDisclaimer />

      {/* Add Modal */}
      {isOpenAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-x-hidden overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md sm:max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-auto shrink-0 max-h-[90vh] overflow-y-auto overflow-x-hidden">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Droplets className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>{editingId ? 'သကြားဓာတ် မှတ်တမ်း ပြင်ဆင်မည်' : 'သကြားဓာတ် အသစ်ထည့်သွင်းခြင်း'}</span>
              </h3>
              <button
                type="button"
                onClick={closeForm}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center justify-center text-sm font-bold cursor-pointer transition-colors shrink-0"
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'fasting', label: 'FBS (မနက်အစာမစားမီ)' },
                    { id: 'before_meal', label: 'အစာမစားမီ' },
                    { id: 'post_meal_2h', label: 'အစာစားပြီး ၂ နာရီ' },
                    { id: 'random', label: 'အချိန်မရွေး (RBS)' },
                    { id: 'bedtime', label: 'အိပ်ရာဝင်' },
                    { id: 'hba1c', label: 'HbA1c (၃လ)' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleTypeChange(t.id as BloodSugarType)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
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
                    onChange={(e) => setValue(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    placeholder={type === 'hba1c' ? 'ဥပမာ- 5.7' : 'ဥပမာ- 110'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xl font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <span className="absolute right-3.5 top-3 text-xs text-slate-400 font-medium">
                    {type === 'hba1c' ? '%' : 'mg/dL'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {type === 'fasting' && 'ပုံမှန်: 70 - 99 mg/dL'}
                  {type === 'before_meal' && 'ပုံမှန်: 140 mg/dL အောက်'}
                  {type === 'post_meal_2h' && 'ပုံမှန်: 140 mg/dL အောက်'}
                  {type === 'random' && 'ပုံမှန်: 140 mg/dL အောက်'}
                  {type === 'bedtime' && 'ပုံမှန်: 140 mg/dL အောက်'}
                  {type === 'hba1c' && 'ပုံမှန်: 5.7% အောက်'}
                </span>
              </div>

              {/* 🥗 Dedicated Diet / Food Intake Section */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                    စားသုံးခဲ့သော အစားအသောက် မှတ်တမ်း (Diet / Food Intake)
                  </label>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                    ဆီးချိုတက်မှု အကြောင်းရင်း သုံးသပ်ရန်
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="ဥပမာ- ထမင်းဖြူ ၂ ပန်းကန်၊ ဒူးရင်းသီး ၂ မြွှာ၊ သကြားပါ လက်ဖက်ရည်"
                  value={dietRecord}
                  onChange={(e) => setDietRecord(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden placeholder:text-slate-400"
                />
                
                {/* Quick Pick Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {quickSugarDietPresets.map((tag, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddDietTag(tag)}
                      className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-800 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Meal Timing & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Utensils className="w-3.5 h-3.5 text-slate-400" />
                    တိုင်းတာသည့် အခြေအနေ / အချိန်
                  </label>
                  <input
                    type="text"
                    value={mealInfo}
                    onChange={(e) => setMealInfo(e.target.value)}
                    placeholder="ဥပမာ- နေ့လယ်စာစားပြီး ၂ နာရီ၊ ညအိပ်ရာဝင်"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              {/* Status Preview (only once a real value exists) */}
              {hba1cOutOfRange ? (
                <div className="p-3 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40">
                  <p className="text-[11px] text-amber-800 dark:text-amber-300">
                    ထည့်ထားသော တန်ဖိုး ({value}) သည် HbA1c အတိုင်းအတာ (3–20%) အတွင်း မရှိပါ — mg/dL တန်ဖိုးကို HbA1c အဖြစ် မှားထည့်မိခြင်း ဖြစ်နိုင်ပါသည်။ HbA1c အမျိုးအစား ရွေးထားပါက % တန်ဖိုး ထည့်ပေးပါ။
                  </p>
                </div>
              ) : currentPreview ? (
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
              ) : (
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    သကြားဓာတ် တန်ဖိုး ထည့်ပေးပါ — ထည့်ပြီးတာနဲ့ အကဲဖြတ်ချက် ပြပေးပါမယ်။
                  </p>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ထပ်ဆောင်းမှတ်ချက် (General Notes)
                </label>
                <input
                  type="text"
                  placeholder="ဥပမာ- ဆီးချိုဆေး မနက်စာမစားမီ သောက်ခဲ့သည်"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  ပိတ်မည်
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'သိမ်းဆည်းနေသည်...' : editingId ? 'ပြင်ဆင်မှုကို သိမ်းဆည်းမည်' : 'မှတ်တမ်းသိမ်းမည်'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete confirmation (v2.4.16) */}
      <Modal isOpen={deleteTargetId !== null} onClose={() => setDeleteTargetId(null)} title="မှတ်တမ်း ဖျက်မည်" size="sm">
        <p className="text-sm text-slate-700 leading-relaxed">ဤသကြားဓာတ် မှတ်တမ်းကို ဖျက်မှာ သေချာပါသလား? ဖျက်လိုက်ရင် ပြန်မရတော့ပါ။</p>
        <div className="flex gap-2 justify-end mt-5">
          <button onClick={() => setDeleteTargetId(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm cursor-pointer">မဖျက်သေးပါ</button>
          <button onClick={() => { const id = deleteTargetId; setDeleteTargetId(null); if (id) deleteGlucoseRecord(id); }} className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-sm cursor-pointer">ဖျက်မည်</button>
        </div>
      </Modal>
    </div>
  );
};
