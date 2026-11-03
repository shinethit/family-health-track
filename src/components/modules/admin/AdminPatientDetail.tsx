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
  Heart,
  Syringe,
  Scale,
  HelpCircle
} from 'lucide-react';
import {
  UserProfile,
  BloodPressureRecord,
  BloodSugarRecord,
  LabTestRecord,
  Medication,
  VaccinationRecord,
  BMIRecord,
  DoctorQuestion,
  MedicationLog,
  DoctorAdvice,
  DoctorAnswer
} from '../../../types/health';
import { BloodPressureChart, BloodSugarChart } from '../../charts/HealthCharts';
import { useAuth } from '../../../context/AuthContext';
import { useHealthData } from '../../../context/HealthDataContext';
import { 
  calculateAge, 
  calculateBMI, 
  calculateBPCategory, 
  calculateGlucoseStatus,
  evaluateCustomLabValue,
  parseDateToMs 
} from '../../../lib/medicalCalculations';

// --- 30-day medication adherence helpers (v2.4.10 6.3) ---
// Denominator = EXPECTED doses, not log entries that happen to exist: for
// each active, scheduled (non-PRN) medication, days active inside the last
// 30 days (from startDate — or the window start when there is no startDate
// — up to min(endDate, today)) × doses per day parsed from the frequency
// text. A med the user never touches therefore counts against adherence,
// instead of being invisible in the denominator.
const MYANMAR_DIGITS: Record<string, string> = {
  '၀': '0', '၁': '1', '၂': '2', '၃': '3', '၄': '4',
  '၅': '5', '၆': '6', '၇': '7', '၈': '8', '၉': '9',
};
const toLatinDigits = (s: string): string =>
  s.replace(/[၀-၉]/g, (d) => MYANMAR_DIGITS[d] || d);
const dosesPerDay = (frequency: string): number => {
  // Sum every "(N) ကြိမ်" in the frequency text: 'မနက် (၁) ကြိမ် + ည (၁) ကြိမ်' → 2,
  // 'တရက် (၃) ကြိမ်' → 3. Defaults to 1 when nothing parses.
  const matches = [...(frequency || '').matchAll(/([၀-၉0-9]+)\s*\)?\s*ကြိမ်/g)];
  if (matches.length === 0) return 1;
  const total = matches.reduce((sum, m) => sum + (parseInt(toLatinDigits(m[1]), 10) || 0), 0);
  return total > 0 ? total : 1;
};
const isPrnMedication = (m: Medication): boolean =>
  /လိုအပ်သည့်အခါ|PRN/i.test(m.frequency || '');
const localDateStr = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
// Local (Asia/Rangoon) date-time for a datetime-local input —
// new Date().toISOString() is UTC, so a record entered early in the morning
// got yesterday's date (v2.4.11 F4). Same helper the patient modules use.
const localDateTimeStr = (d: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
// v2.4.12 (A): measurement date + time, the same way the patient modules
// render it — 'YYYY-MM-DD HH:MM' when the record carries a time, date only
// for old date-only records. createdAt is only the last fallback when the
// record has no measurement date at all — never substitute the save time
// for a past measurement date.
const showRecordDateTime = (value?: string): string => {
  if (!value) return '—';
  const m = value.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/);
  return m ? `${m[1]} ${m[2]}` : value;
};

interface AdminPatientDetailProps {
  patient: UserProfile;
  bpRecords: BloodPressureRecord[];
  glucoseRecords: BloodSugarRecord[];
  labRecords: LabTestRecord[];
  medications: Medication[];
  vaccineRecords?: VaccinationRecord[];
  bmiRecords?: BMIRecord[];
  doctorQuestions?: DoctorQuestion[];
  medicationLogs?: MedicationLog[];
  doctorAdvices: DoctorAdvice[];
  onBack: () => void;
  onEditPatient: (patient: UserProfile) => void;
  onDeletePatient: (patient: UserProfile) => void;
  onSendAdvice: (advice: string, diet: string) => Promise<void>;
  onAnswerQuestion: (questionId: string, answer: DoctorAnswer) => Promise<void>;
  onCloseQuestion: (questionId: string) => Promise<void>;
  getResolvedName: (p: Partial<UserProfile> | null | undefined) => string;
}

export const AdminPatientDetail: React.FC<AdminPatientDetailProps> = ({
  patient,
  bpRecords,
  glucoseRecords,
  labRecords,
  medications,
  vaccineRecords = [],
  bmiRecords = [],
  doctorQuestions = [],
  medicationLogs = [],
  doctorAdvices,
  onBack,
  onEditPatient,
  onDeletePatient,
  onSendAdvice,
  onAnswerQuestion,
  onCloseQuestion,
  getResolvedName,
}) => {
  const { profile } = useAuth();
  const {
    addBPRecord, addGlucoseRecord, addLabRecord, addMedication, addVaccineRecord, addBMIRecord,
    // v2.4.13: edit support — added by the sibling HealthDataContext work;
    // these are called here, never defined here.
    updateBPRecord, updateGlucoseRecord, updateBMIRecord, updateLabRecord, updateMedication, updateVaccineRecord,
  } = useHealthData();
  // The answer is attributed to the admin who actually writes it — never
  // the patient's name, and never an invented doctor name. No display name
  // on the admin's profile → the honest role label 'Admin'.
  const adminAnswerName = profile?.displayName?.trim() || 'Admin';

  const [newAdvice, setNewAdvice] = useState('');
  const [dietAdvice, setDietAdvice] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [adviceSuccess, setAdviceSuccess] = useState(false);

  // Inline Q&A answer form (v2.4.11, audit 5.2): one pending question open
  // at a time; the answer goes through onAnswerQuestion → the context's
  // answerDoctorQuestion, which also notifies the patient.
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [answerRecs, setAnswerRecs] = useState('');
  const [answerSending, setAnswerSending] = useState(false);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [qaNotice, setQaNotice] = useState<string | null>(null);

  // On-behalf record entry (v2.4.11, audit 7.2): compact add forms for this
  // patient. They call the same context add functions the modules use, and
  // resolveTarget() files the record under the selected patient (the admin
  // has this patient selected while viewing this detail page). One form
  // open at a time.
  type RecordFormKind = 'bp' | 'sugar' | 'lab' | 'med' | 'vaccine' | 'bmi';
  const [openRecordForm, setOpenRecordForm] = useState<RecordFormKind | null>(null);
  const [recordMsg, setRecordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [recordSaving, setRecordSaving] = useState(false);
  const [bpSys, setBpSys] = useState('');
  const [bpDia, setBpDia] = useState('');
  const [bpPulse, setBpPulse] = useState('');
  const [bpDate, setBpDate] = useState(localDateTimeStr(new Date()));
  const [gluValue, setGluValue] = useState('');
  const [gluType, setGluType] = useState('fasting');
  const [gluDate, setGluDate] = useState(localDateTimeStr(new Date()));
  const [labName, setLabName] = useState('');
  const [labDate, setLabDate] = useState(localDateTimeStr(new Date()));
  const [labTestName, setLabTestName] = useState('');
  const [labTestValue, setLabTestValue] = useState('');
  const [labTestUnit, setLabTestUnit] = useState('');
  const [labRefMin, setLabRefMin] = useState('');
  const [labRefMax, setLabRefMax] = useState('');
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medFrequency, setMedFrequency] = useState('');
  const [medTiming, setMedTiming] = useState<Medication['timing']>('after_meal');
  const [medFor, setMedFor] = useState('');
  const [medStart, setMedStart] = useState(localDateStr(new Date()));
  const [medDoseTime, setMedDoseTime] = useState('');
  const [medDoctor, setMedDoctor] = useState('');
  const [vaxName, setVaxName] = useState('');
  const [vaxDisease, setVaxDisease] = useState('');
  const [vaxDose, setVaxDose] = useState('1');
  const [vaxTotal, setVaxTotal] = useState('1');
  const [vaxDate, setVaxDate] = useState(localDateTimeStr(new Date()));
  const [vaxCategory, setVaxCategory] = useState<'adult' | 'child' | 'travel'>('adult');

  // v2.4.13: admin forms collect the SAME fields as the patient forms, so a
  // medical record is complete whichever side enters it.
  const [bpCondition, setBpCondition] = useState<'resting' | 'morning' | 'night' | 'after_exercise' | 'stress'>('resting');
  const [bpNotes, setBpNotes] = useState('');
  const [bpDiet, setBpDiet] = useState('');
  const [gluMealInfo, setGluMealInfo] = useState('');
  const [gluDiet, setGluDiet] = useState('');
  const [gluNotes, setGluNotes] = useState('');
  const [labNotes, setLabNotes] = useState('');
  const [labDoctorReview, setLabDoctorReview] = useState('');
  const [medChemical, setMedChemical] = useState('');
  const [medEndDate, setMedEndDate] = useState('');
  const [medDuration, setMedDuration] = useState('');
  const [medNotes, setMedNotes] = useState('');
  const [medStatus, setMedStatus] = useState<Medication['status']>('active');
  const [vaxNextDate, setVaxNextDate] = useState('');
  const [vaxAdminBy, setVaxAdminBy] = useState('');
  const [vaxBatch, setVaxBatch] = useState('');
  const [vaxNotes, setVaxNotes] = useState('');
  const [vaxStatus, setVaxStatus] = useState<'completed' | 'scheduled'>('completed');
  const [bmiHeight, setBmiHeight] = useState('');
  const [bmiWeight, setBmiWeight] = useState('');
  const [bmiWaist, setBmiWaist] = useState('');
  const [bmiDate, setBmiDate] = useState(localDateStr(new Date()));
  const [bmiNotes, setBmiNotes] = useState('');
  // Edit mode (v2.4.13): which record the open form is editing, if any.
  // null = add mode. Tapping ✏️ on a list row prefills the form and
  // switches it to edit mode.
  const [editingRecord, setEditingRecord] = useState<{ kind: RecordFormKind; id: string } | null>(null);

  // Normalize a stored date for a datetime-local input: a date-only value
  // ('2026-11-03') would show as empty, so it becomes midnight that day;
  // a full ISO value is trimmed to minutes.
  const toDateTimeLocal = (value?: string): string => {
    if (!value) return localDateTimeStr(new Date());
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${value}T00:00`;
    const m = value.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/);
    return m ? `${m[1]}T${m[2]}` : localDateTimeStr(new Date());
  };
  const toDateOnly = (value?: string): string => (value ? value.slice(0, 10) : '');

  // Blank each form back to its defaults (v2.4.13: every field, including
  // the new ones, is reset after a successful save).
  const resetBpForm = () => {
    setBpSys(''); setBpDia(''); setBpPulse('');
    setBpCondition('resting'); setBpNotes(''); setBpDiet('');
    setBpDate(localDateTimeStr(new Date()));
  };
  const resetSugarForm = () => {
    setGluValue(''); setGluType('fasting'); setGluMealInfo('');
    setGluDiet(''); setGluNotes(''); setGluDate(localDateTimeStr(new Date()));
  };
  const resetLabForm = () => {
    setLabName(''); setLabTestName(''); setLabTestValue(''); setLabTestUnit('');
    setLabRefMin(''); setLabRefMax(''); setLabNotes(''); setLabDoctorReview('');
    setLabDate(localDateTimeStr(new Date()));
  };
  const resetMedForm = () => {
    setMedName(''); setMedChemical(''); setMedDosage(''); setMedFrequency('');
    setMedTiming('after_meal'); setMedFor(''); setMedStart(localDateStr(new Date()));
    setMedDoseTime(''); setMedEndDate(''); setMedDuration(''); setMedNotes('');
    setMedDoctor(''); setMedStatus('active');
  };
  const resetVaccineForm = () => {
    setVaxName(''); setVaxDisease(''); setVaxDose('1'); setVaxTotal('1');
    setVaxDate(localDateTimeStr(new Date())); setVaxCategory('adult');
    setVaxNextDate(''); setVaxAdminBy(''); setVaxBatch(''); setVaxNotes('');
    setVaxStatus('completed');
  };
  const resetBmiForm = () => {
    setBmiHeight(''); setBmiWeight(''); setBmiWaist('');
    setBmiDate(localDateStr(new Date())); setBmiNotes('');
  };
  const resetRecordForm = (kind: RecordFormKind) => {
    if (kind === 'bp') resetBpForm();
    else if (kind === 'sugar') resetSugarForm();
    else if (kind === 'lab') resetLabForm();
    else if (kind === 'med') resetMedForm();
    else if (kind === 'vaccine') resetVaccineForm();
    else resetBmiForm();
  };
  // Back to add mode: clear the edit target and blank the form.
  const cancelEdit = () => {
    if (openRecordForm) resetRecordForm(openRecordForm);
    setEditingRecord(null);
  };

  // Prefill a form from an existing record and switch it to edit mode.
  const BP_CONDITIONS = ['resting', 'morning', 'night', 'after_exercise', 'stress'] as const;
  const startEditBp = (r: BloodPressureRecord) => {
    setBpSys(String(r.systolic));
    setBpDia(String(r.diastolic));
    setBpPulse(r.pulse ?? r.pulseRate ? String(r.pulse ?? r.pulseRate) : '');
    // Old records may carry a BP category in `condition` (pre-v2.4.11
    // overwrite bug) — only a real measurement condition is kept.
    setBpCondition(
      (BP_CONDITIONS as readonly string[]).includes(r.condition || '')
        ? (r.condition as typeof bpCondition)
        : 'resting'
    );
    setBpNotes(r.notes || '');
    setBpDiet(r.dietRecord || r.dietNotes || r.foodIntake || '');
    setBpDate(toDateTimeLocal(r.date || r.timestamp));
    setEditingRecord({ kind: 'bp', id: r.id });
    setOpenRecordForm('bp');
  };
  const startEditSugar = (r: BloodSugarRecord) => {
    setGluValue(String(r.glucoseValue ?? r.value ?? ''));
    setGluType(r.type || r.timing || 'fasting');
    setGluMealInfo(r.mealInfo || '');
    setGluDiet(r.dietRecord || r.dietNotes || r.foodIntake || '');
    setGluNotes(r.notes || '');
    setGluDate(toDateTimeLocal(r.date || r.timestamp));
    setEditingRecord({ kind: 'sugar', id: r.id });
    setOpenRecordForm('sugar');
  };
  const startEditLab = (recordId: string) => {
    const rec = labRecords.find((x) => x.id === recordId);
    if (!rec) return;
    setLabName(rec.labName || '');
    setLabDate(toDateTimeLocal(rec.testDate || rec.recordedAt));
    setLabNotes(rec.notes || '');
    setLabDoctorReview(rec.doctorReview || '');
    const first = rec.tests && rec.tests.length > 0 ? rec.tests[0] : null;
    setLabTestName(first ? (first.nameMm || first.nameEn || '') : '');
    setLabTestValue(first && first.value !== null && first.value !== undefined ? String(first.value) : '');
    setLabTestUnit(first ? (first.unit || '') : '');
    setLabRefMin(first && first.refMin !== undefined ? String(first.refMin) : '');
    setLabRefMax(first && first.refMax !== undefined ? String(first.refMax) : '');
    setEditingRecord({ kind: 'lab', id: rec.id });
    setOpenRecordForm('lab');
  };
  const startEditMed = (m: Medication) => {
    setMedName(m.name);
    setMedChemical(m.genericName || '');
    setMedDosage(m.dosage);
    setMedFrequency(m.frequency);
    setMedTiming(m.timing);
    setMedFor(m.prescribedFor);
    setMedStart(toDateOnly(m.startDate) || localDateStr(new Date()));
    setMedEndDate(toDateOnly(m.endDate));
    setMedDoseTime(m.doseTime || '');
    setMedDoctor(m.prescribingDoctor || '');
    setMedNotes(m.notes || '');
    // The stored notes may already carry a "သောက်ရမည့်ရက်: N ရက်" prefix
    // from a previous save; it stays inside the notes text and is not
    // parsed back into the duration box.
    setMedDuration('');
    setMedStatus(m.status);
    setEditingRecord({ kind: 'med', id: m.id });
    setOpenRecordForm('med');
  };
  const startEditVaccine = (v: VaccinationRecord) => {
    setVaxName(v.vaccineName);
    setVaxDisease(v.targetDisease || '');
    setVaxDose(String(v.doseNumber || 1));
    setVaxTotal(String(v.totalDoses || 1));
    setVaxCategory(v.category || 'adult');
    const status = v.status === 'scheduled' ? 'scheduled' : 'completed';
    setVaxStatus(status);
    // Completed: the date is when it was given. Scheduled: there is no
    // administered date — the picked date is the planned (next due) date.
    setVaxDate(toDateTimeLocal(status === 'completed' ? (v.dateAdministered || v.nextDueDate) : v.nextDueDate));
    setVaxNextDate(toDateOnly(v.nextDueDate));
    setVaxAdminBy(v.administeredBy || '');
    setVaxBatch(v.batchNumber || '');
    setVaxNotes(v.notes || '');
    setEditingRecord({ kind: 'vaccine', id: v.id });
    setOpenRecordForm('vaccine');
  };
  const startEditBmi = (b: BMIRecord) => {
    setBmiHeight(String(b.heightCm));
    setBmiWeight(String(b.weightKg));
    setBmiWaist(b.waistCm ? String(b.waistCm) : '');
    setBmiDate(toDateOnly(b.date) || localDateStr(new Date()));
    setBmiNotes(b.notes || '');
    setEditingRecord({ kind: 'bmi', id: b.id });
    setOpenRecordForm('bmi');
  };

  const sortedUserBP = [...bpRecords].sort((a, b) => 
    parseDateToMs(a.date || a.timestamp || a.createdAt) - parseDateToMs(b.date || b.timestamp || b.createdAt)
  );
  const sortedUserGlu = [...glucoseRecords].sort((a, b) => 
    parseDateToMs(a.date || a.timestamp || a.createdAt) - parseDateToMs(b.date || b.timestamp || b.createdAt)
  );

  const latestBP = sortedUserBP.length > 0 ? sortedUserBP[sortedUserBP.length - 1] : null;
  const latestGlucose = sortedUserGlu.length > 0 ? sortedUserGlu[sortedUserGlu.length - 1] : null;

  // Latest 5 lab test items (flattened from the newest lab records)
  const latestLabItems = [...labRecords]
    .sort((a, b) =>
      parseDateToMs(b.testDate || b.recordedAt || b.createdAt) -
      parseDateToMs(a.testDate || a.recordedAt || a.createdAt)
    )
    .slice(0, 5)
    .flatMap((rec) => {
      const date = rec.testDate || rec.recordedAt || rec.createdAt;
      if (rec.tests && rec.tests.length > 0) {
        return rec.tests.map((t) => ({
          key: `${rec.id}-${t.id}`,
          recordId: rec.id,
          name: t.nameMm || t.nameEn || 'ဓာတ်ခွဲစစ်ဆေးမှု',
          value: t.value as number | null,
          unit: t.unit || '',
          date,
        }));
      }
      return [{ key: rec.id, recordId: rec.id, name: rec.labName || 'ဓာတ်ခွဲစစ်ဆေးမှု', value: null as number | null, unit: '', date }];
    })
    .slice(0, 5);

  // Latest 5 BMI records (newest first)
  const latestBMIHistory = [...bmiRecords]
    .sort((a, b) =>
      parseDateToMs(b.date || b.timestamp || b.createdAt) -
      parseDateToMs(a.date || a.timestamp || a.createdAt)
    )
    .slice(0, 5);

  // Medication adherence — last 30 days (local dates; YYYY-MM-DD strings
  // compare lexicographically). Expected doses, not log entries that exist.
  const adherenceTodayStr = localDateStr(new Date());
  const adherenceWindowStart = new Date();
  adherenceWindowStart.setDate(adherenceWindowStart.getDate() - 29);
  const adherenceWindowStartStr = localDateStr(adherenceWindowStart);
  const adherenceMeds = medications.filter(
    (m) => m.status === 'active' && !isPrnMedication(m)
  );
  const adherenceExpected = adherenceMeds.reduce((sum, m) => {
    const start = m.startDate && m.startDate < adherenceWindowStartStr
      ? adherenceWindowStartStr
      : (m.startDate || adherenceWindowStartStr);
    const end = m.endDate && m.endDate < adherenceTodayStr ? m.endDate : adherenceTodayStr;
    if (end < start) return sum;
    const days = Math.round((Date.parse(end) - Date.parse(start)) / 86400000) + 1;
    return sum + days * dosesPerDay(m.frequency);
  }, 0);
  const adherenceMedIds = new Set(adherenceMeds.map((m) => m.id));
  const adherenceTaken = medicationLogs.filter(
    (l) => l.taken && l.date >= adherenceWindowStartStr && l.date <= adherenceTodayStr && adherenceMedIds.has(l.medicationId)
  ).length;
  const adherencePercent = adherenceExpected > 0
    ? Math.round((adherenceTaken / adherenceExpected) * 100)
    : 0;

  const medicationStatusLabel = (status: Medication['status']): string =>
    status === 'active' ? 'သောက်နေဆဲ' : status === 'completed' ? 'ပြီးဆုံး' : 'ခဏရပ်ထား';

  const ageObj = calculateAge(patient.dateOfBirth);
  const resolvedAge = ageObj ? ageObj.years : (patient.age || null);
  // v2.4.14: the header BMI badge must not depend on the profile alone —
  // a patient whose height/weight live only in BMI records (added by the
  // doctor, family or import) still has a current BMI. Fall back to the
  // latest BMI record first, same pattern as TrendsOverview / BMIModule.
  // Before this, the badge simply vanished for such a patient.
  const latestPatientBMI = latestBMIHistory[0] || null;
  const patientBMI = (latestPatientBMI?.heightCm && latestPatientBMI?.weightKg)
    ? calculateBMI(latestPatientBMI.weightKg, latestPatientBMI.heightCm)
    : (patient.weightKg && patient.heightCm)
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

  const handleAnswerSubmit = async (qId: string) => {
    if (!answerText.trim()) return;
    setAnswerSending(true);
    setAnswerError(null);
    try {
      const recs = answerRecs.split('\n').map((r) => r.trim()).filter(Boolean);
      await onAnswerQuestion(qId, {
        answeredBy: adminAnswerName,
        answerText: answerText.trim(),
        recommendations: recs.length > 0 ? recs : ['ဆရာဝန် ညွှန်ကြားချက်အတိုင်း ဆေးကို ဆက်လက်သောက်သုံးပါ'],
        answeredAt: new Date().toISOString(),
      });
      setAnsweringId(null);
      setAnswerText('');
      setAnswerRecs('');
      setQaNotice('အဖြေကို အသုံးပြုသူထံ ပေးပို့ပြီးပါပြီ။');
      setTimeout(() => setQaNotice(null), 4000);
    } catch (err: any) {
      setAnswerError(err?.message || 'အဖြေပေးပို့ခြင်း မအောင်မြင်ပါ');
    } finally {
      setAnswerSending(false);
    }
  };

  const handleCloseQuestion = async (qId: string) => {
    if (!window.confirm('ဤမေးခွန်းကို ပိတ်သိမ်းမှာသေချာပါသလား? အဖြေရပြီးဖြစ်ကြောင်း မှတ်သားပါမည်။')) return;
    try {
      await onCloseQuestion(qId);
      setQaNotice('မေးခွန်းကို ပိတ်သိမ်းပြီးပါပြီ။');
      setTimeout(() => setQaNotice(null), 4000);
    } catch {
      // The portal shows the error alert.
    }
  };

  const submitRecord = async (kind: RecordFormKind) => {
    setRecordSaving(true);
    setRecordMsg(null);
    try {
      // Edit mode: the open form is editing an existing record. On success
      // the form is blanked back to add mode and stays open; on failure the
      // error shows and the form keeps its values.
      const isEditing = editingRecord?.kind === kind;
      if (kind === 'bp') {
        const sys = Number(bpSys);
        const dia = Number(bpDia);
        if (!sys || !dia || sys < 40 || sys > 300 || dia < 20 || dia > 200) {
          throw new Error('သွေးပေါင်ချိန် တန်ဖိုး မှန်ကန်စွာ ဖြည့်ပါ');
        }
        const diet = bpDiet.trim() || undefined;
        if (isEditing) {
          await updateBPRecord(editingRecord!.id, {
            systolic: sys,
            diastolic: dia,
            pulse: bpPulse ? Number(bpPulse) : undefined,
            condition: bpCondition,
            date: bpDate,
            notes: bpNotes.trim() || undefined,
            dietNotes: diet,
            foodIntake: diet,
            dietRecord: diet,
            category: calculateBPCategory(sys, dia).category,
          });
        } else {
          await addBPRecord({
            userId: patient.id,
            userName: cleanName,
            systolic: sys,
            diastolic: dia,
            pulse: bpPulse ? Number(bpPulse) : undefined,
            condition: bpCondition,
            date: bpDate,
            notes: bpNotes.trim() || undefined,
            dietNotes: diet,
            foodIntake: diet,
            dietRecord: diet,
          });
        }
      } else if (kind === 'sugar') {
        const v = Number(gluValue);
        if (!v || v < 20 || v > 900) {
          throw new Error('သွေးချို တန်ဖိုး မှန်ကန်စွာ ဖြည့်ပါ');
        }
        const diet = gluDiet.trim() || undefined;
        const payload = {
          value: v,
          type: gluType,
          mealInfo: gluMealInfo.trim() || undefined,
          dietNotes: diet,
          foodIntake: diet,
          dietRecord: diet,
          date: gluDate,
          notes: gluNotes.trim() || undefined,
        };
        if (isEditing) {
          await updateGlucoseRecord(editingRecord!.id, {
            ...payload,
            status: calculateGlucoseStatus(v, gluType as any).status,
          });
        } else {
          await addGlucoseRecord({
            userId: patient.id,
            userName: cleanName,
            ...payload,
          });
        }
      } else if (kind === 'lab') {
        if (!labName.trim()) {
          throw new Error('ဓာတ်ခွဲခန်း အမည် ဖြည့်ပါ');
        }
        const testVal = labTestValue ? Number(labTestValue) : NaN;
        let tests: LabTestRecord['tests'];
        let notes: string | undefined;
        if (labTestName.trim() && !Number.isNaN(testVal)) {
          const refMin = labRefMin ? Number(labRefMin) : undefined;
          const refMax = labRefMax ? Number(labRefMax) : undefined;
          // Status comes from the shared helper: with a reference range it
          // is a real low/normal/high assessment; without one it is just
          // "Recorded", never an invented normal result.
          const evalRes = evaluateCustomLabValue(testVal, refMin, refMax);
          tests = [{
            id: 'custom-' + Date.now(),
            nameMm: labTestName.trim(),
            nameEn: labTestName.trim(),
            category: 'general',
            categoryLabelMm: 'အထွေထွေ',
            value: testVal,
            unit: labTestUnit.trim(),
            refMin,
            refMax,
            refRangeText: refMin !== undefined && refMax !== undefined ? `${refMin} - ${refMax}` : '-',
            isCustomRef: refMin !== undefined || refMax !== undefined,
            status: evalRes.status,
            statusLabelMm: evalRes.labelMm,
          }];
        } else if (labTestName.trim()) {
          notes = `စစ်ဆေးချက်: ${labTestName.trim()}${labTestValue ? ` = ${labTestValue} ${labTestUnit.trim()}` : ''}`;
        }
        // Edit mode with no test typed in: keep the record's existing tests
        // — editing the lab name/notes must not wipe the saved results.
        if (isEditing && !tests) {
          const existing = labRecords.find((x) => x.id === editingRecord!.id);
          if (existing?.tests) tests = existing.tests;
        }
        const labNotesValue = labNotes.trim() || notes;
        if (isEditing) {
          await updateLabRecord(editingRecord!.id, {
            testDate: labDate,
            labName: labName.trim(),
            tests,
            notes: labNotesValue,
            doctorReview: labDoctorReview.trim() || undefined,
          });
        } else {
          await addLabRecord({
            userId: patient.id,
            userName: cleanName,
            testDate: labDate,
            labName: labName.trim(),
            tests,
            notes: labNotesValue,
            doctorReview: labDoctorReview.trim() || undefined,
          });
        }
      } else if (kind === 'med') {
        if (!medName.trim() || !medDosage.trim() || !medFrequency.trim() || !medFor.trim()) {
          throw new Error('ဆေးအမည်၊ ပမာဏ၊ ကြိမ်နှုန်းနှင့် ရောဂါ ဖြည့်ပါ');
        }
        // Duration is not a real field on the record — same as the patient
        // module, it is stored at the front of the notes.
        const durationText = medDuration.trim();
        const notesText = medNotes.trim();
        const combinedNotes = durationText
          ? `သောက်ရမည့်ရက်: ${durationText} ရက်${notesText ? ' | ' + notesText : ''}`
          : (notesText || undefined);
        const payload = {
          name: medName.trim(),
          genericName: medChemical.trim() || undefined,
          dosage: medDosage.trim(),
          frequency: medFrequency.trim(),
          timing: medTiming,
          prescribedFor: medFor.trim(),
          startDate: medStart,
          endDate: medEndDate || undefined,
          doseTime: medDoseTime || undefined,
          prescribingDoctor: medDoctor.trim() || undefined,
          notes: combinedNotes,
        };
        if (isEditing) {
          await updateMedication(editingRecord!.id, {
            ...payload,
            status: medStatus,
          });
        } else {
          await addMedication({
            userId: patient.id,
            ...payload,
            status: 'active',
          });
        }
      } else if (kind === 'vaccine') {
        if (!vaxName.trim()) {
          throw new Error('ကာကွယ်ဆေး အမည် ဖြည့်ပါ');
        }
        const isScheduled = vaxStatus === 'scheduled';
        const payload = {
          vaccineName: vaxName.trim(),
          targetDisease: vaxDisease.trim() || 'ကာကွယ်ဆေး',
          doseNumber: Number(vaxDose) || 1,
          totalDoses: Number(vaxTotal) || 1,
          // Completed: the date is when it was given. Scheduled: there is
          // no administered date — the picked date is the planned date.
          dateAdministered: !isScheduled ? (vaxDate || undefined) : undefined,
          nextDueDate: isScheduled ? (vaxDate || vaxNextDate || undefined) : (vaxNextDate || undefined),
          administeredBy: vaxAdminBy.trim() || undefined,
          batchNumber: vaxBatch.trim() || undefined,
          status: vaxStatus,
          category: vaxCategory,
          notes: vaxNotes.trim() || undefined,
        };
        if (isEditing) {
          await updateVaccineRecord(editingRecord!.id, payload);
        } else {
          await addVaccineRecord({
            userId: patient.id,
            patientName: cleanName,
            ...payload,
          });
        }
      } else {
        // BMI — the admin had no form for this before (v2.4.13). BMI and
        // its category are computed from height/weight with the same
        // calculateBMI helper the patient module uses.
        const h = Number(bmiHeight);
        const w = Number(bmiWeight);
        if (!h || !w || h < 50 || h > 250 || w < 1 || w > 500) {
          throw new Error('အရပ်/ကိုယ်အလေးချိန် မှန်ကန်စွာ ဖြည့်ပါ');
        }
        if (isEditing) {
          const calc = calculateBMI(w, h);
          if (!calc) throw new Error('BMI တွက်ရန် ကိုယ်အလေးချိန်/အရပ် လိုအပ်ပါသည်');
          await updateBMIRecord(editingRecord!.id, {
            heightCm: h,
            weightKg: w,
            waistCm: bmiWaist ? Number(bmiWaist) : undefined,
            date: bmiDate,
            notes: bmiNotes.trim() || undefined,
            bmi: calc.bmi,
            category: calc.category,
          });
        } else {
          await addBMIRecord({
            userId: patient.id,
            userName: cleanName,
            heightCm: h,
            weightKg: w,
            waistCm: bmiWaist ? Number(bmiWaist) : undefined,
            date: bmiDate,
            notes: bmiNotes.trim() || undefined,
          });
        }
      }
      resetRecordForm(kind);
      if (isEditing) {
        setRecordMsg({ type: 'success', text: 'မှတ်တမ်း ပြင်ဆင်ပြီးပါပြီ — အသုံးပြုသူဘက်က မြင်ရပါမည်။' });
        setEditingRecord(null);
        // The form stays open, blank, in add mode.
      } else {
        setRecordMsg({ type: 'success', text: 'မှတ်တမ်း ထည့်သွင်းပြီးပါပြီ — အသုံးပြုသူဘက်က မြင်ရပါမည်။' });
        setOpenRecordForm(null);
      }
      setTimeout(() => setRecordMsg(null), 4000);
    } catch (err: any) {
      setRecordMsg({
        type: 'error',
        text: err?.message || (editingRecord?.kind === kind ? 'မှတ်တမ်း ပြင်ဆင်ခြင်း မအောင်မြင်ပါ' : 'မှတ်တမ်း ထည့်သွင်းခြင်း မအောင်မြင်ပါ'),
      });
    } finally {
      setRecordSaving(false);
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
            title="အသုံးပြုသူမှတ်တမ်း ဖျက်မည်"
            aria-label={`${cleanName} ၏ အသုံးပြုသူမှတ်တမ်း ဖျက်မည်`}
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

      {/* Add Record for this patient (v2.4.11, audit 7.2) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              မှတ်တမ်း ထည့်မည် — {cleanName} အတွက်
            </h3>
            <p className="text-[11px] text-slate-500">
              ဆရာဝန်/Admin က အသုံးပြုသူကိုယ်စား မှတ်တမ်း ထည့်ပေးခြင်း — ထည့်ပြီးရင် အသုံးပြုသူဘက်က မြင်ရပါမည်။
            </p>
          </div>
        </div>

        {recordMsg && (
          <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
            recordMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}>
            {recordMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{recordMsg.text}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {([
            { kind: 'bp', label: 'သွေးပေါင်ချိန်', Icon: Activity },
            { kind: 'sugar', label: 'သွေးချို', Icon: Droplets },
            { kind: 'lab', label: 'ဓာတ်ခွဲခန်း', Icon: FlaskConical },
            { kind: 'med', label: 'ဆေး', Icon: Pill },
            { kind: 'vaccine', label: 'ကာကွယ်ဆေး', Icon: Syringe },
            { kind: 'bmi', label: 'BMI', Icon: Scale },
          ] as const).map(({ kind, label, Icon }) => (
            <button
              key={kind}
              type="button"
              onClick={() => {
                if (openRecordForm === kind) {
                  // Closing an edit form also leaves edit mode and blanks
                  // it, so reopening never shows stale edit values.
                  if (editingRecord?.kind === kind) {
                    resetRecordForm(kind);
                    setEditingRecord(null);
                  }
                  setOpenRecordForm(null);
                } else {
                  setOpenRecordForm(kind);
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                openRecordForm === kind
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {editingRecord && openRecordForm && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-200 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" />
              <span>
                ✏️ ပြင်ဆင်နေသည် — {
                  openRecordForm === 'bp' ? 'သွေးပေါင်ချိန်' :
                  openRecordForm === 'sugar' ? 'သွေးချို' :
                  openRecordForm === 'lab' ? 'ဓာတ်ခွဲခန်း' :
                  openRecordForm === 'med' ? 'ဆေး' :
                  openRecordForm === 'vaccine' ? 'ကာကွယ်ဆေး' : 'BMI'
                } မှတ်တမ်း
              </span>
            </span>
            <button
              type="button"
              onClick={cancelEdit}
              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer shrink-0"
            >
              ပယ်ဖျက်မည်
            </button>
          </div>
        )}

        {openRecordForm === 'bp' && (
          <form onSubmit={(e) => { e.preventDefault(); submitRecord('bp'); }} className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <input type="number" required placeholder="Systolic (အပေါ်) *" value={bpSys} onChange={(e) => setBpSys(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <input type="number" required placeholder="Diastolic (အောက်) *" value={bpDia} onChange={(e) => setBpDia(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <input type="number" placeholder="Pulse (bpm)" value={bpPulse} onChange={(e) => setBpPulse(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <input type="datetime-local" required value={bpDate} onChange={(e) => setBpDate(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <select value={bpCondition} onChange={(e) => setBpCondition(e.target.value as typeof bpCondition)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold">
              <option value="resting">တိုင်းချိန် — နားနေချိန်</option>
              <option value="morning">တိုင်းချိန် — မနက်နိုးနိုးချင်း</option>
              <option value="night">တိုင်းချိန် — ညအိပ်ရာဝင်</option>
              <option value="after_exercise">တိုင်းချိန် — လှုပ်ရှားပြီးစ</option>
              <option value="stress">တိုင်းချိန် — စိတ်ဖိစီးချိန်</option>
            </select>
            <input type="text" placeholder="အစားအသောက် မှတ်တမ်း (ဥပမာ- ဆားများများစားခဲ့သည်)" value={bpDiet} onChange={(e) => setBpDiet(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <input type="text" placeholder="မှတ်ချက် (မဖြည့်လည်းရသည်)" value={bpNotes} onChange={(e) => setBpNotes(e.target.value)} className="col-span-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <div className="col-span-2 sm:col-span-4 flex justify-end">
              <button type="submit" disabled={recordSaving} className="btn-primary px-4 py-2 rounded-xl text-white text-xs font-bold cursor-pointer disabled:opacity-50">
                {recordSaving ? (editingRecord?.kind === 'bp' ? 'သိမ်းဆည်းနေသည်...' : 'ထည့်နေသည်...') : (editingRecord?.kind === 'bp' ? 'သိမ်းဆည်းမည်' : 'သွေးပေါင်ချိန် ထည့်မည်')}
              </button>
            </div>
          </form>
        )}

        {openRecordForm === 'sugar' && (
          <form onSubmit={(e) => { e.preventDefault(); submitRecord('sugar'); }} className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <input type="number" required placeholder="သွေးချို (mg/dL) *" value={gluValue} onChange={(e) => setGluValue(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <select value={gluType} onChange={(e) => setGluType(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold">
              <option value="fasting">အစာမစားမီ (Fasting)</option>
              <option value="before_meal">အစာမစားမီ</option>
              <option value="post_meal_2h">အစာစားပြီး ၂ နာရီ</option>
              <option value="random">အချိန်မရွေး (Random)</option>
              <option value="bedtime">ညအိပ်ရာဝင်</option>
            </select>
            <input type="datetime-local" required value={gluDate} onChange={(e) => setGluDate(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <input type="text" placeholder="အစာအကြောင်း (ဥပမာ- မနက်အစာမစားမီ ၈ နာရီအစာငတ်)" value={gluMealInfo} onChange={(e) => setGluMealInfo(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <input type="text" placeholder="အစားအသောက် မှတ်တမ်း (မဖြည့်လည်းရသည်)" value={gluDiet} onChange={(e) => setGluDiet(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <input type="text" placeholder="မှတ်ချက် (မဖြည့်လည်းရသည်)" value={gluNotes} onChange={(e) => setGluNotes(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <div className="col-span-2 sm:col-span-3 flex justify-end">
              <button type="submit" disabled={recordSaving} className="btn-primary px-4 py-2 rounded-xl text-white text-xs font-bold cursor-pointer disabled:opacity-50">
                {recordSaving ? (editingRecord?.kind === 'sugar' ? 'သိမ်းဆည်းနေသည်...' : 'ထည့်နေသည်...') : (editingRecord?.kind === 'sugar' ? 'သိမ်းဆည်းမည်' : 'သွေးချို ထည့်မည်')}
              </button>
            </div>
          </form>
        )}

        {openRecordForm === 'lab' && (
          <form onSubmit={(e) => { e.preventDefault(); submitRecord('lab'); }} className="grid grid-cols-2 gap-2">
            <input type="text" required placeholder="ဓာတ်ခွဲခန်း အမည် * (ဥပမာ- ABC Lab)" value={labName} onChange={(e) => setLabName(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <input type="datetime-local" required value={labDate} onChange={(e) => setLabDate(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <input type="text" placeholder="စစ်ဆေးချက် အမည် (ဥပမာ- FBS)" value={labTestName} onChange={(e) => setLabTestName(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <input type="number" step="any" placeholder="ရလဒ် တန်ဖိုး" value={labTestValue} onChange={(e) => setLabTestValue(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <input type="text" placeholder="ယူနစ် (ဥပမာ- mg/dL)" value={labTestUnit} onChange={(e) => setLabTestUnit(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <div className="flex gap-2">
              <input type="number" step="any" placeholder="စံသတ်မှတ်ချက် အနိမ့်ဆုံး" value={labRefMin} onChange={(e) => setLabRefMin(e.target.value)} className="w-1/2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
              <input type="number" step="any" placeholder="အမြင့်ဆုံး" value={labRefMax} onChange={(e) => setLabRefMax(e.target.value)} className="w-1/2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            </div>
            <p className="col-span-2 text-[11px] text-slate-400">စံသတ်မှတ်ချက် ဖြည့်ရင် ရလဒ်ကို အနိမ့်/ပုံမှန်/မြင့် လို့ အကဲဖြတ်ပြပါမည်။ မဖြည့်ရင် "မှတ်တမ်းတင်ထားသည်" လို့သာ ပြပါမည်။</p>
            <textarea rows={2} placeholder="မှတ်ချက် (မဖြည့်လည်းရသည်)" value={labNotes} onChange={(e) => setLabNotes(e.target.value)} className="col-span-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <textarea rows={2} placeholder="ဆရာဝန်၏ သုံးသပ်ချက် (မဖြည့်လည်းရသည်)" value={labDoctorReview} onChange={(e) => setLabDoctorReview(e.target.value)} className="col-span-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <div className="col-span-2 flex justify-end">
              <button type="submit" disabled={recordSaving} className="btn-primary px-4 py-2 rounded-xl text-white text-xs font-bold cursor-pointer disabled:opacity-50">
                {recordSaving ? (editingRecord?.kind === 'lab' ? 'သိမ်းဆည်းနေသည်...' : 'ထည့်နေသည်...') : (editingRecord?.kind === 'lab' ? 'သိမ်းဆည်းမည်' : 'ဓာတ်ခွဲခန်း မှတ်တမ်း ထည့်မည်')}
              </button>
            </div>
          </form>
        )}

        {openRecordForm === 'med' && (
          <form onSubmit={(e) => { e.preventDefault(); submitRecord('med'); }} className="grid grid-cols-2 gap-2">
            <input type="text" required placeholder="ဆေးအမည် * (Brand နာမည်)" value={medName} onChange={(e) => setMedName(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <input type="text" required placeholder="ပမာဏ * (ဥပမာ- 5 mg)" value={medDosage} onChange={(e) => setMedDosage(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <input type="text" placeholder="Chemical နာမည် (မဖြည့်လည်းရသည် — ဥပမာ- Amlodipine)" value={medChemical} onChange={(e) => setMedChemical(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <input type="text" required placeholder="ကြိမ်နှုန်း * (ဥပမာ- မနက် (၁) ကြိမ်)" value={medFrequency} onChange={(e) => setMedFrequency(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <select value={medTiming} onChange={(e) => setMedTiming(e.target.value as Medication['timing'])} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold">
              <option value="after_meal">အစာစားပြီး</option>
              <option value="before_meal">အစာမစားမီ</option>
              <option value="with_meal">အစာစားနေစဉ်</option>
              <option value="bedtime">ညအိပ်ရာဝင်</option>
              <option value="anytime">အချိန်မရွေး</option>
            </select>
            <input type="text" required placeholder="ရောဂါ * (ဥပမာ- သွေးတိုး)" value={medFor} onChange={(e) => setMedFor(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <input type="date" required value={medStart} onChange={(e) => setMedStart(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <input type="date" placeholder="ပြီးဆုံးမည့်ရက် (မဖြည့်လည်းရသည်)" value={medEndDate} onChange={(e) => setMedEndDate(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <input type="time" placeholder="သောက်ရမည့်အချိန် (မဖြည့်လည်းရသည်)" value={medDoseTime} onChange={(e) => setMedDoseTime(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <input type="number" min={1} placeholder="သောက်ရမည့်ရက် (ရက် — မဖြည့်လည်းရသည်)" value={medDuration} onChange={(e) => setMedDuration(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <input type="text" placeholder="ညွှန်ကြားသော ဆရာဝန် (မဖြည့်လည်းရသည်)" value={medDoctor} onChange={(e) => setMedDoctor(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <select value={medStatus} onChange={(e) => setMedStatus(e.target.value as Medication['status'])} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold">
              <option value="active">သောက်နေဆဲ</option>
              <option value="paused">ခဏရပ်ထား</option>
              <option value="completed">ပြီးဆုံး</option>
            </select>
            <input type="text" placeholder="မှတ်ချက် (မဖြည့်လည်းရသည်)" value={medNotes} onChange={(e) => setMedNotes(e.target.value)} className="col-span-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <div className="col-span-2 flex justify-end">
              <button type="submit" disabled={recordSaving} className="btn-primary px-4 py-2 rounded-xl text-white text-xs font-bold cursor-pointer disabled:opacity-50">
                {recordSaving ? (editingRecord?.kind === 'med' ? 'သိမ်းဆည်းနေသည်...' : 'ထည့်နေသည်...') : (editingRecord?.kind === 'med' ? 'သိမ်းဆည်းမည်' : 'ဆေး ထည့်မည်')}
              </button>
            </div>
          </form>
        )}

        {openRecordForm === 'vaccine' && (
          <form onSubmit={(e) => { e.preventDefault(); submitRecord('vaccine'); }} className="grid grid-cols-2 gap-2">
            <input type="text" required placeholder="ကာကွယ်ဆေး အမည် * (ဥပမာ- Flu Vaccine)" value={vaxName} onChange={(e) => setVaxName(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <input type="text" placeholder="ကာကွယ်သော ရောဂါ (ဥပမာ- တုပ်ကွေး)" value={vaxDisease} onChange={(e) => setVaxDisease(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <input type="number" min={1} placeholder="အကြိမ် (ဥပမာ- 1)" value={vaxDose} onChange={(e) => setVaxDose(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <input type="number" min={1} placeholder="စုစုပေါင်း အကြိမ် (ဥပမာ- 1)" value={vaxTotal} onChange={(e) => setVaxTotal(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <input type="datetime-local" required value={vaxDate} onChange={(e) => setVaxDate(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <select value={vaxCategory} onChange={(e) => setVaxCategory(e.target.value as 'adult' | 'child' | 'travel')} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold">
              <option value="adult">လူကြီး</option>
              <option value="child">ကလေး</option>
              <option value="travel">ခရီးသွား</option>
            </select>
            <select value={vaxStatus} onChange={(e) => setVaxStatus(e.target.value as 'completed' | 'scheduled')} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold">
              <option value="completed">ထိုးပြီးသား</option>
              <option value="scheduled">ထိုးရန် စီစဉ်ထား (မထိုးရသေး)</option>
            </select>
            <input type="date" placeholder="နောက်တစ်ကြိမ် ထိုးရမည့်ရက် (မဖြည့်လည်းရသည်)" value={vaxNextDate} onChange={(e) => setVaxNextDate(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <input type="text" placeholder="ထိုးပေးသူ (မဖြည့်လည်းရသည်)" value={vaxAdminBy} onChange={(e) => setVaxAdminBy(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <input type="text" placeholder="Batch နံပါတ် (မဖြည့်လည်းရသည်)" value={vaxBatch} onChange={(e) => setVaxBatch(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <input type="text" placeholder="မှတ်ချက် (မဖြည့်လည်းရသည်)" value={vaxNotes} onChange={(e) => setVaxNotes(e.target.value)} className="col-span-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <div className="col-span-2 flex justify-end">
              <button type="submit" disabled={recordSaving} className="btn-primary px-4 py-2 rounded-xl text-white text-xs font-bold cursor-pointer disabled:opacity-50">
                {recordSaving ? (editingRecord?.kind === 'vaccine' ? 'သိမ်းဆည်းနေသည်...' : 'ထည့်နေသည်...') : (editingRecord?.kind === 'vaccine' ? 'သိမ်းဆည်းမည်' : 'ကာကွယ်ဆေး ထည့်မည်')}
              </button>
            </div>
          </form>
        )}

        {openRecordForm === 'bmi' && (
          <form onSubmit={(e) => { e.preventDefault(); submitRecord('bmi'); }} className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <input type="number" step="any" required placeholder="အရပ် (cm) *" value={bmiHeight} onChange={(e) => setBmiHeight(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <input type="number" step="any" required placeholder="ကိုယ်အလေးချိန် (kg) *" value={bmiWeight} onChange={(e) => setBmiWeight(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <input type="number" step="any" placeholder="ခါးပတ်လည် (cm — မဖြည့်လည်းရသည်)" value={bmiWaist} onChange={(e) => setBmiWaist(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <input type="date" required value={bmiDate} onChange={(e) => setBmiDate(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <input type="text" placeholder="မှတ်ချက် (မဖြည့်လည်းရသည်)" value={bmiNotes} onChange={(e) => setBmiNotes(e.target.value)} className="col-span-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs" />
            <div className="col-span-2 sm:col-span-3 flex justify-end">
              <button type="submit" disabled={recordSaving} className="btn-primary px-4 py-2 rounded-xl text-white text-xs font-bold cursor-pointer disabled:opacity-50">
                {recordSaving ? (editingRecord?.kind === 'bmi' ? 'သိမ်းဆည်းနေသည်...' : 'ထည့်နေသည်...') : (editingRecord?.kind === 'bmi' ? 'သိမ်းဆည်းမည်' : 'BMI ထည့်မည်')}
              </button>
            </div>
          </form>
        )}
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
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">
                  {showRecordDateTime(latestBP.date || latestBP.timestamp || latestBP.createdAt)}
                </span>
                <button
                  type="button"
                  onClick={() => startEditBp(latestBP)}
                  className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>ပြင်ဆင်မည်</span>
                </button>
              </div>
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
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">
                  {showRecordDateTime(latestGlucose.date || latestGlucose.timestamp || latestGlucose.createdAt)}
                </span>
                <button
                  type="button"
                  onClick={() => startEditSugar(latestGlucose)}
                  className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>ပြင်ဆင်မည်</span>
                </button>
              </div>
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

      {/* Lab Tests & Medications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-sky-500" />
            <span>ဓာတ်ခွဲခန်း စစ်ဆေးချက်များ (နောက်ဆုံး ၅ ခု)</span>
          </h3>
          {latestLabItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
                    <th className="text-left font-semibold py-2 pr-2">စစ်ဆေးချက်</th>
                    <th className="text-left font-semibold py-2 pr-2">တန်ဖိုး</th>
                    <th className="text-left font-semibold py-2 pr-2">ရက်စွဲ</th>
                    <th className="py-2" aria-label="ပြင်ဆင်မည်" />
                  </tr>
                </thead>
                <tbody>
                  {latestLabItems.map((item) => (
                    <tr key={item.key} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-2 pr-2 font-semibold text-slate-800 dark:text-slate-200">{item.name}</td>
                      <td className="py-2 pr-2 text-slate-800 dark:text-slate-200">
                        {item.value !== null ? (
                          <span className="font-bold">{item.value} <span className="text-slate-400 font-semibold">{item.unit}</span></span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-2 pr-2 text-slate-500">{showRecordDateTime(item.date)}</td>
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          onClick={() => startEditLab(item.recordId)}
                          className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 hover:underline cursor-pointer whitespace-nowrap"
                          title="ဓာတ်ခွဲခန်း မှတ်တမ်း ပြင်ဆင်မည်"
                        >
                          ✏️ ပြင်ဆင်မည်
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-3">ဓာတ်ခွဲခန်း မှတ်တမ်း မရှိသေးပါ</p>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Pill className="w-4 h-4 text-violet-500" />
            <span>သောက်ဆေးများ ({medications.length} မျိုး)</span>
          </h3>
          {medications.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {medications.map((m) => (
                <div key={m.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{m.name}</p>
                    <p className="text-slate-500 mt-0.5">
                      {m.dosage || '—'} • {m.frequency || '—'}
                      {m.prescribedFor ? ` • ${m.prescribedFor}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      m.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : m.status === 'completed'
                          ? 'bg-slate-100 text-slate-600 border border-slate-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {medicationStatusLabel(m.status)}
                    </span>
                    <button
                      type="button"
                      onClick={() => startEditMed(m)}
                      className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 hover:underline cursor-pointer whitespace-nowrap"
                      title="ဆေးမှတ်တမ်း ပြင်ဆင်မည်"
                    >
                      ✏️ ပြင်ဆင်မည်
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-3">ဆေးမှတ်တမ်း မရှိသေးပါ</p>
          )}
        </div>
      </div>

      {/* Vaccines & BMI History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Syringe className="w-4 h-4 text-teal-500" />
            <span>ကာကွယ်ဆေးများ ({vaccineRecords.length} ကြိမ်)</span>
          </h3>
          {vaccineRecords.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {[...vaccineRecords]
                .sort((a, b) =>
                  parseDateToMs(b.dateAdministered || b.createdAt) -
                  parseDateToMs(a.dateAdministered || a.createdAt)
                )
                .map((v) => (
                  <div key={v.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{v.vaccineName}</p>
                      <p className="text-slate-500 mt-0.5">
                        {v.targetDisease || ''}{v.doseNumber && v.totalDoses ? ` • အကြိမ် ${v.doseNumber}/${v.totalDoses}` : ''}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-slate-500 font-semibold">
                        {showRecordDateTime(v.dateAdministered)}
                      </span>
                      <button
                        type="button"
                        onClick={() => startEditVaccine(v)}
                        className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 hover:underline cursor-pointer whitespace-nowrap"
                        title="ကာကွယ်ဆေး မှတ်တမ်း ပြင်ဆင်မည်"
                      >
                        ✏️ ပြင်ဆင်မည်
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-3">ကာကွယ်ဆေး မှတ်တမ်း မရှိသေးပါ</p>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Scale className="w-4 h-4 text-indigo-500" />
            <span>BMI မှတ်တမ်း (နောက်ဆုံး ၅ ခု)</span>
          </h3>
          {latestBMIHistory.length > 0 ? (
            <div className="space-y-2">
              {latestBMIHistory.map((b) => (
                <div key={b.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between gap-2">
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">BMI {b.bmi}</span>
                  <span className="text-slate-500">
                    {b.weightKg ? `${b.weightKg} kg` : ''}{b.weightKg && b.heightCm ? ' • ' : ''}{b.heightCm ? `${b.heightCm} cm` : ''}
                  </span>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-slate-400">
                      {showRecordDateTime(b.date || b.timestamp || b.createdAt)}
                    </span>
                    <button
                      type="button"
                      onClick={() => startEditBmi(b)}
                      className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 hover:underline cursor-pointer whitespace-nowrap"
                      title="BMI မှတ်တမ်း ပြင်ဆင်မည်"
                    >
                      ✏️ ပြင်ဆင်မည်
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-3">BMI မှတ်တမ်း မရှိသေးပါ</p>
          )}
        </div>
      </div>

      {/* Doctor Q&A — admin can answer inline here (v2.4.11, audit 5.2) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-500" />
          <span>ဆရာဝန် မေးခွန်းများ ({doctorQuestions.length} ခု)</span>
        </h3>
        {qaNotice && (
          <div className="mb-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{qaNotice}</span>
          </div>
        )}
        {doctorQuestions.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {[...doctorQuestions]
              .sort((a, b) => parseDateToMs(b.createdAt) - parseDateToMs(a.createdAt))
              .map((q) => (
                <div key={q.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-slate-900 dark:text-white">{q.title}</p>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {q.createdAt ? new Date(q.createdAt).toLocaleDateString('my-MM') : ''}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      q.status === 'answered'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : q.status === 'closed'
                          ? 'bg-slate-100 text-slate-600 border border-slate-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {q.status === 'answered' ? '✅ ဖြေကြားပြီး' : q.status === 'closed' ? 'ပိတ်သိမ်းပြီး' : '⏳ မဖြေရသေးပါ'}
                    </span>
                    {q.urgency === 'urgent' && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                        အရေးကြီး
                      </span>
                    )}
                    {q.urgency === 'moderate' && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        အလယ်အလတ်
                      </span>
                    )}
                  </div>
                  {q.questionDetails && <p className="text-slate-600 dark:text-slate-300">{q.questionDetails}</p>}
                  {q.status === 'answered' && q.doctorAnswer ? (
                    <div className="space-y-1">
                      <p className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg p-2">
                        <span className="font-bold">အဖြေ: </span>{q.doctorAnswer.answerText}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] text-slate-500">
                          ဖြေကြားသူ: <strong className="text-slate-700 dark:text-slate-300">{q.doctorAnswer.answeredBy}</strong>
                          {q.doctorAnswer.answeredAt ? ` • ${new Date(q.doctorAnswer.answeredAt).toLocaleDateString('my-MM')}` : ''}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleCloseQuestion(q.id)}
                          className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer shrink-0"
                        >
                          ပိတ်သိမ်းမည်
                        </button>
                      </div>
                    </div>
                  ) : q.status === 'closed' ? (
                    <p className="text-slate-500 font-semibold">ပိတ်သိမ်းပြီး</p>
                  ) : answeringId === q.id ? (
                    <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2">
                      <textarea
                        rows={3}
                        placeholder="ဆရာဝန်၏ အဖြေနှင့် အကြံပြုချက်ကို အသေးစိတ် ရေးသားပါ..."
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                      <textarea
                        rows={2}
                        placeholder="လိုက်နာရန် အချက်များ (တစ်ကြောင်းလျှင် တစ်ခု — မဖြည့်လည်းရသည်)"
                        value={answerRecs}
                        onChange={(e) => setAnswerRecs(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                      <p className="text-[11px] text-slate-500">
                        ဖြေကြားသူ: <strong>{adminAnswerName}</strong> အဖြစ် ပေးပို့ပါမည်။
                      </p>
                      {answerError && (
                        <p className="text-[11px] font-bold text-rose-700 dark:text-rose-300">{answerError}</p>
                      )}
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => { setAnsweringId(null); setAnswerText(''); setAnswerRecs(''); setAnswerError(null); }}
                          className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
                        >
                          ပယ်ဖျက်မည်
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAnswerSubmit(q.id)}
                          disabled={answerSending || !answerText.trim()}
                          className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{answerSending ? 'ပေးပို့နေသည်...' : 'အဖြေ ပေးပို့မည်'}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setAnsweringId(q.id); setAnswerText(''); setAnswerRecs(''); setAnswerError(null); }}
                      className="text-xs font-bold text-indigo-700 dark:text-indigo-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <Stethoscope className="w-4 h-4" />
                      <span>ဆရာဝန်အဖြစ် ဖြေကြားမည်</span>
                    </button>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-3">မေးခွန်း မရှိသေးပါ</p>
        )}
      </div>

      {/* Medication Adherence — last 30 days */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>ဆေးသောက်မှန်ကန်မှု — နောက်ဆုံး ရက် ၃၀</span>
        </h3>
        {adherenceMeds.length > 0 ? (
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {adherenceTaken}/{adherenceExpected}
              </span>
              <span className="text-xs text-slate-400">ကြိမ် သောက်ပြီး</span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 ml-auto">
                {adherencePercent}%
              </span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${Math.min(adherencePercent, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              နောက်ဆုံး ရက် ၃၀ အတွင်း သောက်ရမည့် အကြိမ်ရေ {adherenceExpected} ကြိမ် ထဲမှ {adherenceTaken} ကြိမ် သောက်ပြီးပါပြီ
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-3">ဆေး မရှိသေးပါ</p>
        )}
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
            <span>အကြံပြုချက်အား အသုံးပြုသူထံ အောင်မြင်စွာ ပေးပို့ပြီးပါပြီ။</span>
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
              <span>{isSending ? 'ပေးပို့နေသည်...' : 'အသုံးပြုသူထံ အကြံပြုချက် ပို့မည်'}</span>
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
