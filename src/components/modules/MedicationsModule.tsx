import React, { useState, useMemo, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Pill, Plus, Trash2, Clock, Sparkles, X, Check, Pencil } from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  SAVE_LATE_CONFIRM_MESSAGE,
  SAVE_TIMEOUT_MESSAGE,
  isSaveTimeoutError,
} from '../../lib/saveConfirmation';
import { Medication } from '../../types/health';
import { MedicalDisclaimer } from '../common/MedicalDisclaimer';

// Local (Asia/Rangoon) date (YYYY-MM-DD) — new Date().toISOString() is UTC,
// so a record entered early in the morning got yesterday's date (v2.4.11 F4).
const localDateStr = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const toLatinDigits = (s: string): string =>
  s.replace(/[၀-၉]/g, (d) => String('၀၁၂၃၄၅၆၇၈၉'.indexOf(d)));

// Dose slots for a medication: one checkbox per expected dose per day,
// parsed the same way AdminPatientDetail computes doses/day (v2.4.11 6.4).
// e.g. 'မနက် (၁) ကြိမ် + ည (၁) ကြိမ်' → ['မနက်', 'ည'];
// 'တရက် (၃) ကြိမ်' → ['တရက် ၁', 'တရက် ၂', 'တရက် ၃'].
// PRN (လိုအပ်သည့်အခါ) meds have no daily schedule, so they keep one slot.
const doseSlots = (med: Medication): { doseIndex: number; label: string }[] => {
  if (/လိုအပ်သည့်အခါ|PRN/i.test(med.frequency || '')) {
    return [{ doseIndex: 0, label: 'လိုအပ်သည့်အခါ' }];
  }
  const segments = (med.frequency || '').split('+').map(s => s.trim()).filter(Boolean);
  const slots: { doseIndex: number; label: string }[] = [];
  segments.forEach(seg => {
    const m = seg.match(/([၀-၉0-9]+)\s*\)?\s*ကြိမ်/);
    const count = m ? parseInt(toLatinDigits(m[1]), 10) || 1 : 1;
    const prefix = seg.replace(/\(?\s*[၀-၉0-9]+\s*\)?\s*ကြိမ်.*$/, '').trim();
    for (let i = 0; i < count; i++) {
      slots.push({
        doseIndex: slots.length,
        label: count === 1 ? (prefix || `ကြိမ် ${slots.length + 1}`) : `${prefix || 'ကြိမ်'} ${i + 1}`,
      });
    }
  });
  return slots.length > 0 ? slots : [{ doseIndex: 0, label: 'ကြိမ် ၁' }];
};

export const MedicationsModule: React.FC = () => {
  const {
    medications,
    medicationLogs,
    toggleMedicationDoseTaken,
    addMedication,
    updateMedication,
    updateMedicationStatus,
    deleteMedication,
    selectedPatient,
    selectedFamilyMember,
    isPooledView,
    dataLoading
  } = useHealthData();
  const { profile } = useAuth();
  const { showToast } = useToast();

  const [isOpenAdd, setIsOpenAdd] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'completed'>('active');
  // Medication list search + paging (latest 20 by default)
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllMeds, setShowAllMeds] = useState(false);
  // v2.4.16: status-toggle + delete confirms use the app Modal, never
  // window.confirm.
  const [pendingToggleMed, setPendingToggleMed] = useState<Medication | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const todayStr = localDateStr(new Date());

  // Frequency Options
  const FREQUENCY_OPTIONS = [
    'မနက် (၁) ကြိမ်',
    'ည (၁) ကြိမ်',
    'မနက် (၁) ကြိမ် + ည (၁) ကြိမ်',
    'တရက် (၃) ကြိမ်',
    'တရက် (၄) ကြိမ်',
    'တရက် (၅) ကြိမ်',
    'မနက် (၁) ကြိမ် + နေ့လယ် (၁) ကြိမ် + ည (၁) ကြိမ်',
    'နေ့လယ် (၁) ကြိမ်',
    'ညအိပ်ရာဝင် (၁) ကြိမ်',
    'လိုအပ်သည့်အခါ (PRN / As needed)',
  ];

  // Form states — no prefilled values: dosage '5 mg', duration '30' and
  // condition 'သွေးတိုး' invited fake-normal records (v2.4.11 F5).
  const [tradeName, setTradeName] = useState('');
  const [chemicalNamesInput, setChemicalNamesInput] = useState('');
  const [chemicalNames, setChemicalNames] = useState<string[]>([]);
  const [dosage, setDosage] = useState('');
  const [selectedFreqOption, setSelectedFreqOption] = useState<string>('မနက် (၁) ကြိမ်');
  const [customFrequency, setCustomFrequency] = useState('');
  const [frequency, setFrequency] = useState('မနက် (၁) ကြိမ်');
  const [timing, setTiming] = useState<'before_meal' | 'after_meal' | 'with_meal' | 'bedtime' | 'anytime'>('after_meal');
  const [durationDays, setDurationDays] = useState<string>(''); // ဆေးသောက်ရမည့်ရက်ပေါင်း (မဖြည့်လည်းရသည်)
  const [prescribedFor, setPrescribedFor] = useState('');
  const [startDate, setStartDate] = useState(() => localDateStr(new Date()));
  // v2.4.10: optional dose clock-time (HH:MM) for dose-time reminders, and
  // optional end date after which no reminders fire. Both may stay empty.
  const [doseTime, setDoseTime] = useState('');
  // F-H4: second daily dose time (HH:MM) for twice-daily meds — the
  // Medication type already has doseTime2 and the reminder ticker already
  // fires it; this wires the form field and the display.
  const [doseTime2, setDoseTime2] = useState('');
  const [endDate, setEndDate] = useState('');
  const [prescribingDoctor, setPrescribingDoctor] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // v2.4.22 (Bug A): set when a save times out — the next submit is a
  // retry, and the context must check the list first so it never writes a
  // second copy of the same record.
  const saveTimedOutRef = useRef(false);

  // v2.4.13 edit: id of the medication being edited, null in add mode.
  // The same modal/form is reused, prefilled from the record.
  const [editingId, setEditingId] = useState<string | null>(null);

  // Split the duration merged into notes back into duration + notes (the
  // add path writes `သောက်ရမည့်ရက်: X ရက် | notes` into one notes field).
  const parseDurationNotes = (notesValue: string | undefined): { durationDays: string; notes: string } => {
    const m = (notesValue || '').match(/^သောက်ရမည့်ရက်: (.+?) ရက်(?: \| (.*))?$/s);
    if (!m) return { durationDays: '', notes: notesValue || '' };
    return { durationDays: m[1], notes: m[2] || '' };
  };

  // Fresh add-mode defaults (used when leaving edit mode so the next Add
  // never shows the edited medication's values).
  const resetMedForm = () => {
    setTradeName('');
    setChemicalNames([]);
    setChemicalNamesInput('');
    setDosage('');
    setDurationDays('');
    setPrescribedFor('');
    setStartDate(localDateStr(new Date()));
    setPrescribingDoctor('');
    setTiming('after_meal');
    setNotes('');
    setDoseTime('');
    setDoseTime2('');
    setEndDate('');
    setSelectedFreqOption('မနက် (၁) ကြိမ်');
    setCustomFrequency('');
    setFrequency('မနက် (၁) ကြိမ်');
  };

  // Open the form prefilled with an existing medication for editing.
  const startEdit = (med: typeof medications[number]) => {
    setEditingId(med.id);
    setTradeName(med.name);
    setChemicalNames(med.genericName ? med.genericName.split(', ').filter(Boolean) : []);
    setChemicalNamesInput('');
    setDosage(med.dosage || '');
    if (FREQUENCY_OPTIONS.includes(med.frequency)) {
      setSelectedFreqOption(med.frequency);
      setCustomFrequency('');
    } else {
      setSelectedFreqOption('custom');
      setCustomFrequency(med.frequency || '');
    }
    setFrequency(med.frequency || 'မနက် (၁) ကြိမ်');
    setTiming(med.timing || 'after_meal');
    const parsed = parseDurationNotes(med.notes);
    setDurationDays(parsed.durationDays);
    setNotes(parsed.notes);
    setPrescribedFor(med.prescribedFor || '');
    setStartDate(med.startDate || localDateStr(new Date()));
    setDoseTime(med.doseTime || '');
    setDoseTime2(med.doseTime2 || '');
    setEndDate(med.endDate || '');
    setPrescribingDoctor(med.prescribingDoctor || '');
    setIsOpenAdd(true);
  };

  // Close the form. In edit mode the prefilled values are cleared back to
  // fresh add defaults so a later Add never inherits them.
  const closeForm = () => {
    if (editingId) {
      resetMedForm();
      setEditingId(null);
    }
    setIsOpenAdd(false);
  };

  // Open the form in add mode (defensive: never carry an edit id in).
  const openAdd = () => {
    if (editingId) {
      resetMedForm();
      setEditingId(null);
    }
    setIsOpenAdd(true);
  };

  // Toggle one dose slot for today (v2.4.11 6.4): a twice-daily med has two
  // checkboxes (one per doseIndex), so it can reach 100%, not just 50%.
  const toggleDoseSlot = (medId: string, doseIndex: number, medName?: string) => {
    const isCurrentlyTaken = medicationLogs.some(
      l => l.medicationId === medId && l.date === todayStr && (l.doseIndex ?? 0) === doseIndex && l.taken
    );
    toggleMedicationDoseTaken(medId, todayStr, !isCurrentlyTaken, doseIndex, medName);
  };

  // B-M5: toggling a medication's status asks first, and a failed toggle
  // rolls the UI back — updateMedicationStatus in the context already
  // restores the old value and toasts on failure, so no second toast here.
  // v2.4.16: the ask is the app Modal, not window.confirm.
  const handleToggleStatus = (med: Medication) => {
    setPendingToggleMed(med);
  };
  const confirmToggleStatus = async () => {
    const med = pendingToggleMed;
    setPendingToggleMed(null);
    if (!med) return;
    const nextStatus = med.status === 'active' ? 'paused' : 'active';
    try {
      await updateMedicationStatus(med.id, nextStatus);
      showToast(`"${med.name}" ဆေးကို ${nextStatus === 'paused' ? 'ခေတ္တရပ်နားထားပါပြီ' : 'ပြန်လည်သောက်သုံးရန် ပြောင်းထားပါပြီ'}`, 'success');
    } catch (err) {
      // Context already rolled the UI back and showed its failure toast.
      console.warn('Failed to toggle medication status:', err);
    }
  };

  const isDoseTaken = (medId: string, doseIndex: number) =>
    medicationLogs.some(
      l => l.medicationId === medId && l.date === todayStr && (l.doseIndex ?? 0) === doseIndex && l.taken
    );

  const handleAddChemicalName = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (('key' in e && e.key === 'Enter') || e.type === 'click') {
      e.preventDefault();
      if (chemicalNamesInput.trim() && !chemicalNames.includes(chemicalNamesInput.trim())) {
        setChemicalNames([...chemicalNames, chemicalNamesInput.trim()]);
        setChemicalNamesInput('');
      }
    }
  };

  const removeChemicalName = (chem: string) => {
    setChemicalNames(chemicalNames.filter(c => c !== chem));
  };

  // Filtered meds
  const filteredMeds = filterStatus === 'all'
    ? medications
    : medications.filter(m => m.status === filterStatus);

  // Search the medication list by name, chemical name, condition or notes
  const searchedMeds = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return filteredMeds;
    return filteredMeds.filter((m) => {
      const hay = `${m.name || ''} ${m.genericName || ''} ${m.prescribedFor || ''} ${m.notes || ''} ${m.dosage || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [filteredMeds, searchQuery]);

  // Newest first (by start date); show only the latest 20 unless expanded
  const displayMeds = useMemo(() => {
    const sorted = [...searchedMeds].sort((a, b) =>
      (Date.parse(b.startDate || '') || 0) - (Date.parse(a.startDate || '') || 0)
    );
    return showAllMeds ? sorted : sorted.slice(0, 20);
  }, [searchedMeds, showAllMeds]);

  const activeMeds = medications.filter(m => m.status === 'active');
  // F-H7: today's denominator must respect startDate/endDate — a med that
  // has not started yet, or already ended, does not count for today.
  const inDateWindow = (m: Medication): boolean => {
    if (m.startDate && m.startDate > todayStr) return false;
    if (m.endDate && m.endDate < todayStr) return false;
    return true;
  };
  const dueTodayMeds = activeMeds.filter(inDateWindow);
  // Today's adherence counts expected DOSES, not meds (v2.4.11 6.4): a
  // twice-daily med contributes 2 slots, so it can reach 100%. PRN
  // (လိုအပ်သည့်အခါ) meds have no daily schedule and count for neither side.
  const isPrnMedication = (m: Medication): boolean =>
    /လိုအပ်သည့်အခါ|PRN/i.test(m.frequency || '');
  const scheduledActiveMeds = dueTodayMeds.filter((m) => !isPrnMedication(m));
  const todaySlots = scheduledActiveMeds.flatMap((m) =>
    doseSlots(m).map((slot) => ({ med: m, slot }))
  );
  const activeCount = todaySlots.length;
  const takenCount = todaySlots.filter(({ med, slot }) => isDoseTaken(med.id, slot.doseIndex)).length;
  // F-L5: the percentage is capped at 100% (taken slots can never exceed
  // expected slots — each slot is counted once via isDoseTaken — but the
  // cap is explicit so a duplicate dose log can never inflate it).
  const adherencePercent = activeCount > 0 ? Math.min(100, Math.round((takenCount / activeCount) * 100)) : 0;

  // Preset drug templates
  const presets = [
    { trade: 'Biogesic', chem: ['Paracetamol'], dose: '500 mg', freq: 'လိုအပ်သည့်အခါ (PRN / As needed)', timing: 'after_meal' as const, for: 'အဖျားကျ/အကိုက်အခဲ' },
    { trade: 'Norvasc', chem: ['Amlodipine'], dose: '5 mg', freq: 'မနက် (၁) ကြိမ်', timing: 'after_meal' as const, for: 'သွေးတိုးရောဂါ' },
    { trade: 'Glucophage', chem: ['Metformin HCl'], dose: '500 mg', freq: 'မနက် (၁) ကြိမ် + ည (၁) ကြိမ်', timing: 'with_meal' as const, for: 'ဆီးချိုရောဂါ' },
    { trade: 'Lipitor', chem: ['Atorvastatin'], dose: '10 mg', freq: 'ညအိပ်ရာဝင် (၁) ကြိမ်', timing: 'bedtime' as const, for: 'သွေးတွင်းအဆီကျဆေး' },
    { trade: 'Cozaar', chem: ['Losartan Potassium'], dose: '50 mg', freq: 'မနက် (၁) ကြိမ်', timing: 'after_meal' as const, for: 'သွေးတိုးရောဂါ' },
    { trade: 'Zyloric', chem: ['Allopurinol'], dose: '100 mg', freq: 'နေ့လယ် (၁) ကြိမ်', timing: 'after_meal' as const, for: 'ယူရစ်အက်စစ်ကျဆေး' },
  ];

  const applyPreset = (p: typeof presets[0]) => {
    setTradeName(p.trade);
    setChemicalNames(p.chem);
    setDosage(p.dose);
    setSelectedFreqOption(p.freq);
    setFrequency(p.freq);
    setCustomFrequency('');
    setTiming(p.timing);
    setPrescribedFor(p.for);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !tradeName.trim()) return;

    // Chemical Name is OPTIONAL (v2.4.11): a user who only knows the brand
    // name must still be able to save. Include it when given, omit it when not.
    const finalChems = [...chemicalNames];
    if (chemicalNamesInput.trim() && !finalChems.includes(chemicalNamesInput.trim())) {
      finalChems.push(chemicalNamesInput.trim());
    }

    setIsSubmitting(true);
    // v2.4.22 (Bug A): retry after a timeout? Pass it through so the
    // context checks the list first and never writes a second copy.
    const isRetry = saveTimedOutRef.current;
    saveTimedOutRef.current = false;
    const effectiveFrequency = selectedFreqOption === 'custom' 
      ? (customFrequency.trim() || 'မနက် (၁) ကြိမ်') 
      : selectedFreqOption;

    // Duration is not a stored field on the medication (v2.4.11 F13), so it
    // is optional and, when given, is written into the notes text — the label
    // says so. Nothing is silently required or silently merged.
    const durationText = durationDays.trim();
    const notesText = notes.trim();
    const combinedNotes = durationText
      ? `သောက်ရမည့်ရက်: ${durationText} ရက်${notesText ? ' | ' + notesText : ''}`
      : (notesText || undefined);

    try {
      if (editingId) {
        // v2.4.13 edit: same fields as add, but NO status (a paused or
        // completed medication must not reset to 'active') and no userId.
        await updateMedication(editingId, {
          name: tradeName,
          genericName: finalChems.length > 0 ? finalChems.join(', ') : undefined,
          dosage,
          frequency: effectiveFrequency,
          timing,
          prescribedFor,
          startDate,
          doseTime: doseTime || undefined,
          doseTime2: doseTime2 || undefined,
          endDate: endDate || undefined,
          prescribingDoctor,
          notes: combinedNotes,
        });
        setIsOpenAdd(false);
        setEditingId(null);
        resetMedForm();
        showToast('ဆေးမှတ်တမ်း ပြင်ဆင်ပြီးပါပြီ', 'success');
        return;
      }
      const saveResult = await addMedication({
        userId: selectedPatient ? selectedPatient.id : (selectedFamilyMember ? selectedFamilyMember.id : profile.id),
        name: tradeName,
        genericName: finalChems.length > 0 ? finalChems.join(', ') : undefined,
        dosage,
        frequency: effectiveFrequency,
        timing,
        prescribedFor,
        startDate,
        doseTime: doseTime || undefined,
        doseTime2: doseTime2 || undefined,
        endDate: endDate || undefined,
        status: 'active',
        prescribingDoctor,
        notes: combinedNotes,
      }, { isRetry });
      setIsOpenAdd(false);
      // Clear ALL form fields after a successful save (v2.4.11 F14) — the
      // old code left dosage, duration, prescribedFor, startDate, doctor
      // and timing behind, leaking them into the next add.
      setTradeName('');
      setChemicalNames([]);
      setChemicalNamesInput('');
      setDosage('');
      setDurationDays('');
      setPrescribedFor('');
      setStartDate(localDateStr(new Date()));
      setPrescribingDoctor('');
      setTiming('after_meal');
      setNotes('');
      setDoseTime('');
      setDoseTime2('');
      setEndDate('');
      setSelectedFreqOption('မနက် (၁) ကြိမ်');
      setCustomFrequency('');
      setFrequency('မနက် (၁) ကြိမ်');
      showToast(saveResult.confirmedLate ? SAVE_LATE_CONFIRM_MESSAGE : 'ဆေးမှတ်တမ်းကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ', 'success');
    } catch (err) {
      // Save failed: keep the form open with all values intact so the user
      // can retry (v2.4.11 F3 — saves used to fail silently). In edit mode
      // the context already shows its own failure toast, so no second one.
      console.warn('Error saving medication:', err);
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
        showToast('ဆေးမှတ်တမ်း သိမ်းဆည်းခြင်း မအောင်မြင်ပါ — အင်တာနက် ချိတ်ဆက်မှု စစ်ပြီး ပြန်ကြိုးစားပါ။', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // While the first Firestore snapshot is still loading, show a loading
  // state instead of an empty medication list.
  if (dataLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-sky-600 animate-spin" aria-label="ဒေတာ ရယူနေပါသည်" />
        <p className="text-sm text-slate-500">ဒေတာ ရယူနေပါသည်...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Pill className="w-6 h-6 text-sky-500" />
            သောက်နေသောဆေးများ စာရင်း (Current Medications)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {selectedPatient
              ? `အသုံးပြုသူ ${selectedPatient.displayName} ၏ လက်ရှိသောက်နေသော ဆေးဝါးများနှင့် ဆေးချိန်ညွှန်းချက်များ`
              : selectedFamilyMember
                ? `အသုံးပြုသူ ${selectedFamilyMember.name} ၏ လက်ရှိသောက်နေသော ဆေးဝါးများနှင့် ဆေးချိန်ညွှန်းချက်များ`
                : 'သွေးတိုး၊ ဆီးချို၊ အဆီကျနှင့် အခြားသောက်သုံးနေသော ဆေးဝါးများကို တိကျစွာ မှတ်တမ်းတင်ပါ'}
          </p>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-medium shadow-sm transition-all cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4" />
          ဆေးအသစ် ထည့်သွင်းမည်
        </button>
      </div>

      {/* Today's Pill Schedule & Compliance Box with Adherence progress */}
      <div className="bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-indigo-500/10 dark:from-sky-950/40 dark:via-blue-950/40 dark:to-indigo-950/40 p-5 rounded-3xl border border-sky-200 dark:border-sky-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                ယနေ့ ဆေးသောက်ရန် စစ်ဆေးမှု (Today's Medication Tracker)
              </h3>
              <p className="text-xs text-slate-500">
                သောက်ပြီးသော ဆေးများကို အမှန်ခြစ်၍ သောက်သုံးမှု မကျန်စေရန် စောင့်ကြည့်ပါ
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300">
              {/* F-H6: never fabricate '0/0 ကြိမ် (0%)' when there are no
                  meds at all — say so honestly instead. */}
              {medications.length === 0
                ? 'ဆေး မရှိသေးပါ'
                : activeCount === 0
                  ? 'ယနေ့ အချိန်ဇယားရှိ ဆေး မရှိပါ'
                  : `ယနေ့ ဆေးသောက်ပြီးမှု: ${takenCount}/${activeCount} ကြိမ် (${adherencePercent}%)`}
            </span>
          </div>
        </div>

        {/* Adherence Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
          <div 
            className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
            style={{ width: `${adherencePercent}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {dueTodayMeds.map((med) => {
            const slots = doseSlots(med);
            const allTaken = slots.every(s => isDoseTaken(med.id, s.doseIndex));
            return (
              <div
                key={med.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  allTaken
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-sky-300'
                }`}
              >
                <div>
                  <h4 className={`text-xs font-bold ${allTaken ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                    {med.name}
                  </h4>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>{med.dosage}</span>
                    <span>•</span>
                    <span>{med.frequency}</span>
                  </div>
                </div>

                {/* One checkbox per expected dose today (v2.4.11 6.4) */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {slots.map((slot) => {
                    const taken = isDoseTaken(med.id, slot.doseIndex);
                    return (
                      <button
                        key={slot.doseIndex}
                        type="button"
                        onClick={() => toggleDoseSlot(med.id, slot.doseIndex, med.name)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                          taken
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-sky-400'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded flex items-center justify-center ${
                          taken ? 'bg-white/25 text-white' : 'border border-slate-400 dark:border-slate-500 text-transparent'
                        }`}>
                          <Check className="w-3 h-3" />
                        </span>
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterStatus('active')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            filterStatus === 'active'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          လက်ရှိသောက်နေဆဲ ({medications.filter(m => m.status === 'active').length})
        </button>
        <button
          onClick={() => setFilterStatus('paused')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            filterStatus === 'paused'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          ခေတ္တရပ်ထားသောဆေးများ ({medications.filter(m => m.status === 'paused').length})
        </button>
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            filterStatus === 'all'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          အားလုံး ({medications.length})
        </button>
      </div>

      {/* Medication search */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="ရှာဖွေမည် — ဆေးအမည်၊ ရောဂါ (သို့) မှတ်ချက်"
        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden placeholder:text-slate-400"
      />

      {/* Medications Grid */}
      {searchedMeds.length === 0 && (
        <p className="text-xs text-slate-500 text-center py-8">
          {searchQuery.trim() ? 'ရှာဖွေမှုနှင့် ကိုက်ညီသော ဆေး မရှိပါ' : 'ဆေး မှတ်တမ်း မရှိသေးပါ'}
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayMeds.map((med) => {
          return (
            <div
              key={med.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 inline-block mb-1">
                      {med.prescribedFor}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{med.name}</span>
                    </h3>
                    {med.genericName && (
                      <div className="flex items-center gap-1 text-xs text-sky-700 dark:text-sky-300 font-semibold mt-0.5 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-100 dark:border-sky-900/40 w-fit">
                        <span>🧪 Chemical:</span>
                        <span className="font-mono">{med.genericName}</span>
                      </div>
                    )}
                    {/* D-H5: owner name in the pooled view. */}
                    {isPooledView && (
                      <p className="text-[11px] text-slate-500 mt-1">
                        ပိုင်ရှင်: <span className="font-semibold text-slate-700 dark:text-slate-300">{med.userName || med.patientName || '—'}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(med)}
                      className="text-slate-400 hover:text-sky-600 p-2 rounded-md cursor-pointer"
                      title="ပြင်ဆင်မည်"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(med)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border cursor-pointer ${
                        med.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-amber-50 text-amber-700 border-amber-300'
                      }`}
                    >
                      {med.status === 'active' ? 'Active သောက်ဆဲ' : 'Paused ရပ်နား'}
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(med.id)}
                      className="text-slate-400 hover:text-rose-600 p-2 rounded-md cursor-pointer"
                      title="ဖျက်မည်"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-400 text-[11px] block">ဆေးပမာဏ (Dosage)</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {med.dosage}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-400 text-[11px] block">သောက်ချိန် (Schedule)</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {med.frequency}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-400 text-[11px] block">အစားအသောက် ဆက်စပ်မှု</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {med.timing === 'before_meal' && 'အစာမစားမီ'}
                      {med.timing === 'after_meal' && 'အစာစားပြီး'}
                      {med.timing === 'with_meal' && 'အစာစားနေစဉ်'}
                      {med.timing === 'bedtime' && 'ညအိပ်ရာဝင်'}
                      {med.timing === 'anytime' && 'အချိန်မရွေး'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-400 text-[11px] block">စတင်သောက်သည့်ရက်</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {med.startDate}{med.endDate ? ` → ${med.endDate}` : ''}
                    </span>
                  </div>

                  {(med.doseTime || med.doseTime2) && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                      <span className="text-slate-400 text-[11px] block">သောက်ရမည့်အချိန်</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {[med.doseTime, med.doseTime2].filter(Boolean).join('၊ ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Notes & Doctor */}
                {med.notes && (
                  <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 bg-sky-50/50 dark:bg-sky-950/20 p-2.5 rounded-xl border border-sky-100 dark:border-sky-900/30">
                    <span className="font-semibold text-sky-800 dark:text-sky-300">မှတ်ချက်: </span>
                    {med.notes}
                  </p>
                )}
              </div>

              {med.prescribingDoctor && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>ဆေးညွှန်းဆရာဝန်:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{med.prescribingDoctor}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {searchedMeds.length > 20 && (
        <div className="text-center">
          <button
            onClick={() => setShowAllMeds(!showAllMeds)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            {showAllMeds ? 'အနည်းငယ်သာ ပြမည်' : `အားလုံး ကြည့်မည် (${searchedMeds.length} ခု)`}
          </button>
        </div>
      )}

      {/* Medical Disclaimer */}
      <MedicalDisclaimer />

      {/* Add Medication Modal */}
      {isOpenAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Pill className="w-5 h-5 text-sky-500" />
                {editingId ? 'ဆေး မှတ်တမ်း ပြင်ဆင်မည်' : 'ဆေးအသစ် ထည့်သွင်းခြင်း'}
              </h3>
              <button
                onClick={closeForm}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {/* Quick Presets */}
            <div className="mt-4">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-sky-500" />
                အသုံးများသော သွေးတိုး/ဆီးချိုဆေးများမှ ရွေးရန်:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 hover:text-sky-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    {p.trade.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Trade Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Generic / Trade Name (Company ဆေးအမည်) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ဥပမာ- Biogesic, Norvasc, Glucophage"
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium"
                />
              </div>

              {/* Chemical Names (Multiple Input Tags) — optional: brand name
                  alone is enough to save (v2.4.11). */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Chemical Name (ဆေးအမည် အစစ် / Active Ingredient)
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    မဖြည့်လည်းရသည်
                  </span>
                </div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="ဥပမာ- Paracetamol, Amlodipine (Enter နှိပ်ပါ)"
                    value={chemicalNamesInput}
                    onChange={(e) => {
                      setChemicalNamesInput(e.target.value);
                    }}
                    onKeyDown={handleAddChemicalName}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border text-slate-900 dark:text-white text-xs border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddChemicalName}
                    className="px-3.5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
                  >
                    + ထည့်မည်
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 mb-2">
                  Brand အမည်ပဲ သိရင်လည်း သိမ်းလို့ရပါတယ် — Chemical Name သိရင် ထည့်ပေးပါ။
                </p>

                {chemicalNames.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                    {chemicalNames.map((chem, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300 text-[11px] font-bold">
                        <span>🧪 {chem}</span>
                        <button type="button" onClick={() => removeChemicalName(chem)} className="hover:text-rose-600 cursor-pointer ml-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Dosage & Duration Days */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ဆေးပမာဏ (Dosage) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ဥပမာ- 5 mg, 500 mg"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ဘယ်နှစ်ရက်သောက်ရန် (Duration)
                  </label>
                  <input
                    type="text"
                    placeholder="ဥပမာ- 30 ရက် (သို့) တစ်လစာ"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    မဖြည့်လည်းရသည် — ဖြည့်ထားရင် မှတ်ချက်ထဲ ထည့်သိမ်းပါမယ်။
                  </p>
                </div>
              </div>

              {/* Frequency & Timing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    သောက်ရမည့်အကြိမ် (Frequency) *
                  </label>
                  <select
                    value={selectedFreqOption}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedFreqOption(val);
                      if (val !== 'custom') {
                        setFrequency(val);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium cursor-pointer"
                  >
                    {FREQUENCY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                    <option value="custom">✏️ အခြား (စိတ်ကြိုက်ရေးသွင်းမည်)...</option>
                  </select>

                  {selectedFreqOption === 'custom' && (
                    <input
                      type="text"
                      required
                      placeholder="စိတ်ကြိုက် သောက်ရမည့် အကြိမ် ရေးပါ (ဥပမာ- ၂ ရက် ၁ ကြိမ်)"
                      value={customFrequency}
                      onChange={(e) => {
                        setCustomFrequency(e.target.value);
                        setFrequency(e.target.value);
                      }}
                      className="mt-2 w-full px-3.5 py-2.5 rounded-xl border border-sky-300 dark:border-sky-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    အစားအသောက် ဆက်စပ်မှု
                  </label>
                  <select
                    value={timing}
                    onChange={(e: any) => setTiming(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium cursor-pointer"
                  >
                    <option value="after_meal">အစာစားပြီး</option>
                    <option value="before_meal">အစာမစားမီ</option>
                    <option value="with_meal">အစာစားနေစဉ်</option>
                    <option value="bedtime">ညအိပ်ရာဝင်</option>
                    <option value="anytime">အချိန်မရွေး</option>
                  </select>
                </div>
              </div>

              {/* Start Date & End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    စတင်သောက်သည့်ရက် (Start Date)
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    ဒီရက်မရောက်သေးရင် ယနေ့ဆေးစာရင်းမှာ မပါပါ။
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    သောက်ပြီးဆုံးမည့်ရက် (မဖြည့်လည်းရသည်)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    ဒီရက်ကျော်ရင် သတိပေးချက် မထွက်တော့ပါ။
                  </p>
                </div>
              </div>

              {/* Dose Times (both optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    သောက်ရမည့်အချိန် (မဖြည့်လည်းရသည်)
                  </label>
                  <input
                    type="time"
                    value={doseTime}
                    onChange={(e) => setDoseTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    အချိန်ထည့်ထားရင် အဲဒီအချိန်ရောက်မှ သတိပေးမယ်။ မထည့်ထားရင် App ဖွင့်ချိန်မှ သတိပေးမယ်။
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ဒုတိယ အကြိမ် သောက်ရမည့်အချိန် (မဖြည့်လည်းရသည်)
                  </label>
                  <input
                    type="time"
                    value={doseTime2}
                    onChange={(e) => setDoseTime2(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    တစ်နေ့ ၂ ကြိမ် သောက်ရသော ဆေးအတွက် — ဒုတိယ အကြိမ် အချိန်ရောက်မှ သတိပေးမယ်။
                  </p>
                </div>
              </div>

              {/* Prescribed For & Doctor */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ကုသရန် ရောဂါ (Condition)
                  </label>
                  <input
                    type="text"
                    placeholder="ဥပမာ- သွေးတိုး၊ ဆီးချို"
                    value={prescribedFor}
                    onChange={(e) => setPrescribedFor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ဆေးညွှန်းဆရာဝန်
                  </label>
                  <input
                    type="text"
                    value={prescribingDoctor}
                    onChange={(e) => setPrescribingDoctor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  မှတ်ချက် သို့မဟုတ် သတိပြုရန် (Notes)
                </label>
                <input
                  type="text"
                  placeholder="ဥပမာ- ရေများများသောက်ရန်"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  ပိတ်မည်
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'သိမ်းဆည်းနေသည်...' : editingId ? 'ပြင်ဆင်မှုကို သိမ်းဆည်းမည်' : 'ဆေးမှတ်တမ်းသိမ်းမည်'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Status-toggle confirmation (v2.4.16, B-M5) */}
      <Modal isOpen={pendingToggleMed !== null} onClose={() => setPendingToggleMed(null)} title="ဆေး အခြေအနေ ပြောင်းမည်" size="sm">
        <p className="text-sm text-slate-700 leading-relaxed">
          "{pendingToggleMed?.name}" ဆေးကို {pendingToggleMed?.status === 'active' ? 'ခေတ္တရပ်နားမည်' : 'ပြန်လည်သောက်သုံးမည်'} — သေချာပါသလား?
        </p>
        <div className="flex gap-2 justify-end mt-5">
          <button onClick={() => setPendingToggleMed(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm cursor-pointer">မလုပ်သေးပါ</button>
          <button onClick={confirmToggleStatus} className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-sm cursor-pointer">ပြောင်းမည်</button>
        </div>
      </Modal>
      {/* Delete confirmation (v2.4.16) */}
      <Modal isOpen={deleteTargetId !== null} onClose={() => setDeleteTargetId(null)} title="မှတ်တမ်း ဖျက်မည်" size="sm">
        <p className="text-sm text-slate-700 leading-relaxed">ဤဆေးမှတ်တမ်းကို ဖျက်မှာ သေချာပါသလား? ဖျက်လိုက်ရင် ပြန်မရတော့ပါ။</p>
        <div className="flex gap-2 justify-end mt-5">
          <button onClick={() => setDeleteTargetId(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm cursor-pointer">မဖျက်သေးပါ</button>
          <button onClick={() => { const id = deleteTargetId; setDeleteTargetId(null); if (id) deleteMedication(id); }} className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-sm cursor-pointer">ဖျက်မည်</button>
        </div>
      </Modal>
    </div>
  );
};
