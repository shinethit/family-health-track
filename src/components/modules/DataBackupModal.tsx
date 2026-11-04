import React, { useState, useRef } from 'react';
import { 
  Download, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Database, 
  X, 
  FileSpreadsheet, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw,
  Clock,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { CURRENT_SYSTEM_VERSION } from '../../constants/version';
import { collection, getDocs, query, where, doc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';
import { MedicalDisclaimer } from '../common/MedicalDisclaimer';
import { Modal } from '../common/Modal';
import { isOwnLocalKey, localKeyOwnerUid } from '../../lib/perUserStorage';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, profile } = useAuth();
  const { 
    bpRecords, 
    glucoseRecords, 
    bmiRecords, 
    labRecords, 
    medications, 
    vaccineRecords,
    familyMembers,
    doctorAdvices,
    doctorQuestions,
    medicationLogs,
    selectedPatient,
    refreshAdminData
  } = useHealthData();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<any | null>(null);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string; count?: number } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const targetName = selectedPatient?.displayName || profile?.displayName || 'user';
  const targetUid = selectedPatient?.id || currentUser?.uid;
  const targetEmail = selectedPatient?.email || profile?.email || currentUser?.email || '';
  // Phone-only (localStorage) data lives on THIS device and belongs to the
  // signed-in user. When an admin exports a selected patient's backup,
  // localData must NOT be included — it is the admin's own device data,
  // not the patient's.
  const isOwnExport = !selectedPatient;
  const exportProfile = selectedPatient || profile || null;
  // Per-user storage keys (v2.4.11): the same uid source the modules use
  // (profile.id, falling back to the auth uid).
  const storageUid = profile?.id || currentUser?.uid || '';

  // Collect phone-only (localStorage) data for export: dental/eye/hearing
  // (fht_*), physio progress (physio_*), special-care checklists
  // (special_care_*), bookmarks, and per-user notification/reminder keys.
  // Raw strings are stored so the round-trip back is exact. ONLY this
  // user's keys are collected — another user's suffixed keys on a shared
  // phone must never end up in this backup.
  const collectLocalData = (): Record<string, string> => {
    const out: Record<string, string> = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        if (!isOwnLocalKey(key, storageUid)) continue;
        const val = localStorage.getItem(key);
        if (val != null) out[key] = val;
      }
    } catch (e) {
      console.warn('Could not read local data for export:', e);
    }
    return out;
  };

  // 1. Export JSON Data
  // G-M8: the export must toast an honest summary — what was exported
  // and how many records of each type — not just "downloaded".
  const exportSummaryParts = (): string[] => {
    const parts: [string, number][] = [
      ['သွေးပေါင်ချိန်', bpRecords.length],
      ['သွေးချို', glucoseRecords.length],
      ['BMI', bmiRecords.length],
      ['ဓာတ်ခွဲ', labRecords.length],
      ['ဆေး', medications.length],
      ['ကာကွယ်ဆေး', vaccineRecords.length],
      ['မိသားစုဝင်', familyMembers.length],
      ['အကြံပြုချက်', doctorAdvices.length],
      ['မေးခွန်း', doctorQuestions.length],
      ['ဆေးသောက်မှတ်တမ်း', medicationLogs.length],
    ];
    const out = parts.filter(([, n]) => n > 0).map(([label, n]) => `${label} ${n} ခု`);
    if (exportProfile) out.push('ပရိုဖိုင် ၁ ခု');
    return out;
  };

  const handleExportJSON = () => {
    setIsExporting(true);
    try {
      // Phone-only data is collected once here (not twice) so the export
      // and the summary count agree.
      const localDataForExport = isOwnExport ? collectLocalData() : {};
      const backupPayload = {
        app: 'FamilyHealthTrack',
        version: CURRENT_SYSTEM_VERSION,
        exportedAt: new Date().toISOString(),
        patient: {
          id: targetUid,
          displayName: targetName,
          email: targetEmail,
        },
        // Profile + Emergency ID (top level so they are never lost)
        profile: exportProfile,
        emergencyProfile: exportProfile?.emergencyProfile || null,
        // Medication intake logs (top level, like the other record arrays)
        medicationLogs: medicationLogs,
        // Phone-only data — only for your own export (see isOwnExport above)
        localData: localDataForExport,
        data: {
          vitals: bpRecords,
          glucose: glucoseRecords,
          bmi: bmiRecords,
          labTests: labRecords,
          medications: medications,
          vaccines: vaccineRecords,
          familyMembers: familyMembers,
          doctorAdvices: doctorAdvices,
          doctorQuestions: doctorQuestions,
        }
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      const filename = `family_health_backup_${targetName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      const summary = exportSummaryParts();
      const localCount = Object.keys(localDataForExport).length;
      showToast(
        `JSON ထုတ်ယူပြီးပါပြီ — ${targetName}: ${summary.length > 0 ? summary.join('၊ ') : 'မှတ်တမ်း မရှိပါ'}${localCount > 0 ? `၊ ဖုန်းထဲမှတ်တမ်း ${localCount} ခု` : ''}။`,
        'success'
      );
    } catch (err: any) {
      console.error('Export JSON error:', err);
      showToast('ဒေတာ ထုတ်ယူခြင်း မအောင်မြင်ပါ။ ပြန်လည်ကြိုးစားပါ။', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Helper to trigger CSV download with UTF-8 BOM for Excel Burmese Unicode compatibility
  const downloadCSVWithBOM = (csvContent: string, filename: string) => {
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // CSV cell: always quoted, inner quotes doubled — Burmese text, commas
  // and newlines inside notes must never break the columns.
  const csvCell = (v: any): string => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csvDoc = (headers: string[], rows: any[][]): string =>
    [headers.map(csvCell).join(','), ...rows.map(r => r.map(csvCell).join(','))].join('\r\n');
  const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

  // 2. Export CSVs with UTF-8 BOM — ALL exported record types, not just
  // the 5 the old version covered. One file per type, downloaded one at a
  // time with a short delay between them: firing up to 5 downloads at once
  // made browsers block the 2nd and later files. Only types that actually
  // have records are downloaded; the button note below says so honestly.
  // Phone-only data (fht_*/physio_*/checklist/bookmarks) has no CSV form —
  // it is only in the JSON export.
  const handleExportAllCSVs = async () => {
    const dateStr = new Date().toISOString().split('T')[0];
    setIsExporting(true);
    try {
      const files: { filename: string; csv: string }[] = [];
      const safeName = targetName.replace(/\s+/g, '_');

      // (a) BP CSV
      if (bpRecords.length > 0) {
        files.push({
          filename: `BloodPressure_${safeName}_${dateStr}.csv`,
          csv: csvDoc(
            ['ရက်စွဲ (Date)', 'အပေါ်သွေး (Systolic)', 'အောက်သွေး (Diastolic)', 'နှလုံးခုန်နှုန်း (Pulse)', 'အဆင့်အတန်း (Category)', 'အသုံးပြုသူအမည် (User)', 'မှတ်ချက် (Notes)'],
            bpRecords.map(b => [b.recordedAt || b.createdAt || '', b.systolic, b.diastolic, b.pulse, b.category || '', b.patientName || targetName, b.notes || ''])
          ),
        });
      }

      // (b) Glucose CSV
      if (glucoseRecords.length > 0) {
        files.push({
          filename: `BloodSugar_${safeName}_${dateStr}.csv`,
          csv: csvDoc(
            ['ရက်စွဲ (Date)', 'သကြားဓာတ် (mg/dL)', 'တိုင်းတာချိန် (Type)', 'အဆင့်အတန်း (Status)', 'အသုံးပြုသူအမည် (User)', 'မှတ်ချက် (Notes)'],
            glucoseRecords.map(g => [g.recordedAt || g.createdAt || '', g.glucoseValue || g.value, g.timing || g.type || '', g.status || '', g.patientName || targetName, g.notes || ''])
          ),
        });
      }

      // (c) BMI CSV
      if (bmiRecords.length > 0) {
        files.push({
          filename: `BMIRecords_${safeName}_${dateStr}.csv`,
          csv: csvDoc(
            ['ရက်စွဲ (Date)', 'အရပ် (cm)', 'ကိုယ်အလေးချိန် (kg)', 'BMI ညွှန်းကိန်း', 'အဆင့်အတန်း (Category)'],
            bmiRecords.map(b => [b.date || b.timestamp || b.createdAt || '', b.heightCm, b.weightKg, b.bmi, b.category || ''])
          ),
        });
      }

      // (d) Lab Tests CSV — G-M9: a missing value must be an empty cell,
      // never the literal text 'undefined'. `${t.value}` wrote 'undefined'
      // when a hand-edited backup had no value; the ref range likewise
      // wrote ' - ' when both bounds were missing.
      if (labRecords.length > 0) {
        const rows: any[][] = [];
        labRecords.forEach(l => {
          if (l.tests && l.tests.length > 0) {
            l.tests.forEach(t => {
              const resultStr = (t.value === undefined || t.value === null)
                ? ''
                : `${t.value}${t.unit ? ` ${t.unit}` : ''}`;
              const rangeStr = t.refRangeText
                ? t.refRangeText
                : [t.refMin, t.refMax].some(v => v !== undefined && v !== null)
                  ? `${t.refMin ?? ''} - ${t.refMax ?? ''}`.replace(/^\s*-\s*|\s*-\s*$/g, '')
                  : '';
              rows.push([
                l.testDate || l.recordedAt || l.createdAt || '',
                l.labName || '',
                t.nameMm || t.nameEn || '',
                resultStr,
                rangeStr,
                t.statusLabelMm || t.status || '',
              ]);
            });
          } else {
            rows.push([
              l.testDate || l.recordedAt || l.createdAt || '',
              l.labName || '',
              (l as any).testName || 'ဓာတ်ခွဲစစ်ဆေးချက်',
              (l as any).resultValue || '',
              (l as any).referenceRange || '',
              '-',
            ]);
          }
        });
        files.push({
          filename: `LabTests_${safeName}_${dateStr}.csv`,
          csv: csvDoc(
            ['ရက်စွဲ (Date)', 'ဓာတ်ခွဲခန်း (Lab)', 'ဆေးစစ်ချက်အမည် (Test Name)', 'အဖြေ (Result)', 'ပုံမှန်သတ်မှတ်ချက် (Normal Range)', 'အကဲဖြတ်ချက် (Status)'],
            rows
          ),
        });
      }

      // (e) Medications CSV
      if (medications.length > 0) {
        files.push({
          filename: `Medications_${safeName}_${dateStr}.csv`,
          csv: csvDoc(
            ['ဆေးအမည် (Trade Name)', 'ဓာတုအမည် (Generic Name)', 'ဆေးပမာဏ (Dosage)', 'သောက်သုံးချိန် (Frequency)', 'သောက်နည်း (Timing)', 'သောက်ရမည့်အချိန် (Dose Time)', 'အခြေအနေ (Status)'],
            medications.map(m => [m.name || '', m.genericName || '', m.dosage || '', m.frequency || '', m.timing || '', m.doseTime || '', m.status || ''])
          ),
        });
      }

      // (f) Vaccines CSV
      if (vaccineRecords.length > 0) {
        files.push({
          filename: `Vaccines_${safeName}_${dateStr}.csv`,
          csv: csvDoc(
            ['ရက်စွဲ (Date)', 'ကာကွယ်ဆေး (Vaccine)', 'ကာကွယ်သည့်ရောဂါ (Disease)', 'အကြိမ်ရေ (Dose)', 'နောက်တစ်ကြိမ် (Next Due)', 'အခြေအနေ (Status)', 'မှတ်ချက် (Notes)'],
            vaccineRecords.map(v => [
              v.dateAdministered || v.createdAt || '',
              v.vaccineName || '',
              v.targetDisease || '',
              v.doseNumber != null ? `${v.doseNumber}/${v.totalDoses ?? ''}` : '',
              v.nextDueDate || '',
              v.status || '',
              v.notes || '',
            ])
          ),
        });
      }

      // (g) Family Members CSV
      if (familyMembers.length > 0) {
        files.push({
          filename: `FamilyMembers_${safeName}_${dateStr}.csv`,
          csv: csvDoc(
            ['အမည် (Name)', 'တော်စပ်ပုံ (Relationship)', 'အသက် (Age)', 'ကျား/မ (Gender)', 'သွေးအုပ်စု (Blood Type)', 'နာတာရှည် ရောဂါများ (Conditions)', 'မှတ်ချက် (Notes)'],
            familyMembers.map(f => [
              f.name || '',
              f.relationship || (f as any).relation || '',
              f.age ?? '',
              f.gender || '',
              f.bloodType || '',
              (f.chronicConditions || []).join('; '),
              f.notes || '',
            ])
          ),
        });
      }

      // (h) Doctor Advices CSV
      if (doctorAdvices.length > 0) {
        files.push({
          filename: `DoctorAdvices_${safeName}_${dateStr}.csv`,
          csv: csvDoc(
            ['ရက်စွဲ (Date)', 'အကြံပြုချက် (Advice)', 'အစားအသောက် (Diet)', 'ဆရာဝန်အမည် (Doctor)', 'အသုံးပြုသူအမည် (User)'],
            doctorAdvices.map(a => [
              a.date || a.createdAt || '',
              a.advice || '',
              a.dietRecommendation || '',
              a.doctorName || '',
              a.patientName || targetName,
            ])
          ),
        });
      }

      // (i) Doctor Questions CSV
      if (doctorQuestions.length > 0) {
        files.push({
          filename: `DoctorQuestions_${safeName}_${dateStr}.csv`,
          csv: csvDoc(
            ['ရက်စွဲ (Date)', 'အမျိုးအစား (Category)', 'ခေါင်းစဉ် (Title)', 'မေးခွန်း (Question)', 'အခြေအနေ (Status)', 'အဖြေ (Answer)', 'ဖြေကြားသူ (Answered By)'],
            doctorQuestions.map(q => [
              q.createdAt || '',
              q.category || '',
              q.title || '',
              q.questionDetails || '',
              q.status || '',
              q.doctorAnswer ? [q.doctorAnswer.answerText, (q.doctorAnswer.recommendations || []).join('; ')].filter(Boolean).join(' | ') : '',
              q.doctorAnswer?.answeredBy || '',
            ])
          ),
        });
      }

      // (j) Medication intake logs CSV
      if (medicationLogs.length > 0) {
        files.push({
          filename: `MedicationLogs_${safeName}_${dateStr}.csv`,
          csv: csvDoc(
            ['ရက်စွဲ (Date)', 'ဆေးအမည် (Medication)', 'အကြိမ်စဉ် (Dose #)', 'သောက်ပြီး (Taken)', 'သောက်ချိန် (Taken At)'],
            medicationLogs.map(m => [
              m.date || '',
              m.medicationName || '',
              (m.doseIndex ?? 0) + 1,
              m.taken ? 'သောက်ပြီး' : 'မသောက်ရသေး',
              m.takenAt || '',
            ])
          ),
        });
      }

      // (k) Profile CSV (one row: the profile + emergency contact)
      if (exportProfile) {
        const ep = exportProfile.emergencyProfile;
        files.push({
          filename: `Profile_${safeName}_${dateStr}.csv`,
          csv: csvDoc(
            ['အမည် (Name)', 'အီးမေးလ် (Email)', 'ဖုန်း (Phone)', 'မွေးသက္ကရာဇ် (DOB)', 'အသက် (Age)', 'ကျား/မ (Gender)', 'အရပ် (cm)', 'ကိုယ်အလေးချိန် (kg)', 'သွေးအုပ်စု (Blood Type)', 'နာတာရှည် ရောဂါများ (Conditions)', 'ဓာတ်မတည့်မှု (Allergies)', 'အရေးပေါ် ဆက်သွယ်ရန် (Emergency Contact)', 'ဆရာဝန်အမည် (Doctor)', 'ဆရာဝန်ဖုန်း (Doctor Phone)', 'ဆေးရုံ (Hospital)'],
            [[
              exportProfile.displayName || '',
              exportProfile.email || '',
              exportProfile.phone || '',
              exportProfile.dateOfBirth || ep?.dateOfBirth || '',
              exportProfile.age ?? '',
              exportProfile.gender || '',
              exportProfile.heightCm ?? '',
              exportProfile.weightKg ?? '',
              exportProfile.bloodType || ep?.bloodType || '',
              (exportProfile.chronicConditions || ep?.chronicConditions || []).join('; '),
              (exportProfile.allergies || ep?.allergies || []).join('; '),
              ep ? `${ep.primaryContactName || ''} ${ep.primaryContactPhone || ''}`.trim() : (exportProfile.emergencyContact || ''),
              ep?.attendingDoctorName || '',
              ep?.attendingDoctorPhone || '',
              ep?.preferredHospital || '',
            ]]
          ),
        });
      }

      if (files.length === 0) {
        showToast('CSV ထုတ်ယူရန် မှတ်တမ်း မရှိသေးပါ။', 'error');
        return;
      }
      // One download at a time, ~600ms apart — browsers block simultaneous
      // downloads after the first, so the old all-at-once version silently
      // lost files.
      for (const f of files) {
        downloadCSVWithBOM(f.csv, f.filename);
        await sleep(600);
      }
      // G-M8: honest summary — which types were exported and how many
      // records of each, not just a file count.
      showToast(`CSV ဖိုင် (${files.length}) ခု ဒေါင်းလုဒ်ဆွဲပြီးပါပြီ — ${targetName}: ${exportSummaryParts().join('၊ ')}။`, 'success');
    } catch (err: any) {
      console.error('Export CSV error:', err);
      showToast('CSV ထုတ်ယူခြင်း မအောင်မြင်ပါ။ ပြန်လည်ကြိုးစားပါ။', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // 3. Import & Validate JSON File
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportStatus(null);
    setImportPreview(null);

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        // Validation — accept the current format (data + top-level
        // profile/medicationLogs/localData) and the older format (data only).
        if (!parsed || (!parsed.data && !parsed.vitals && !parsed.localData && !parsed.profile && !parsed.medicationLogs)) {
          throw new Error('တရားဝင်သော Backup JSON ဖိုင်ပုံစံ မဟုတ်ပါ။');
        }

        const dataObj = parsed.data || parsed;
        const localDataObj = (parsed.localData && typeof parsed.localData === 'object') ? parsed.localData : {};
        const medLogsArr = Array.isArray(parsed.medicationLogs) ? parsed.medicationLogs : (Array.isArray(dataObj.medicationLogs) ? dataObj.medicationLogs : []);
        // G-H1: whose backup is this? The owner is stamped in the file
        // (patient block, falling back to the profile). The preview must
        // show it, and warn when it is NOT the person being restored into.
        const backupOwner = {
          id: parsed.patient?.id || parsed.profile?.id || '',
          name: parsed.patient?.displayName || parsed.profile?.displayName || '',
          email: parsed.patient?.email || parsed.profile?.email || '',
        };
        const ownerMismatch =
          (backupOwner.id !== '' && targetUid !== undefined && backupOwner.id !== targetUid) ||
          (backupOwner.email !== '' && targetEmail !== '' && backupOwner.email !== targetEmail);
        // G-M10: the profile is a record too — the imported total must
        // count it (1 when a profile / emergency profile is in the file),
        // or the count lies about what will be restored.
        const hasProfile = !!(parsed.profile || parsed.emergencyProfile);
        const counts = {
          vitals: Array.isArray(dataObj.vitals) ? dataObj.vitals.length : 0,
          glucose: Array.isArray(dataObj.glucose) ? dataObj.glucose.length : 0,
          bmi: Array.isArray(dataObj.bmi) ? dataObj.bmi.length : 0,
          labTests: Array.isArray(dataObj.labTests) ? dataObj.labTests.length : 0,
          medications: Array.isArray(dataObj.medications) ? dataObj.medications.length : 0,
          vaccines: Array.isArray(dataObj.vaccines) ? dataObj.vaccines.length : 0,
          familyMembers: Array.isArray(dataObj.familyMembers) ? dataObj.familyMembers.length : 0,
          doctorAdvices: Array.isArray(dataObj.doctorAdvices) ? dataObj.doctorAdvices.length : 0,
          doctorQuestions: Array.isArray(dataObj.doctorQuestions) ? dataObj.doctorQuestions.length : 0,
          medicationLogs: medLogsArr.length,
          localData: Object.keys(localDataObj).length,
          profile: hasProfile ? 1 : 0,
        };

        const totalRecords = Object.values(counts).reduce((a, b) => a + b, 0);
        if (totalRecords === 0 && !parsed.profile) {
          throw new Error('ဖိုင်အတွင်း ထည့်သွင်းနိုင်သော ကျန်းမာရေးမှတ်တမ်း မတွေ့ရှိပါ။');
        }

        setImportPreview({
          filename: file.name,
          exportedAt: parsed.exportedAt || 'မသိရှိပါ',
          counts,
          totalRecords,
          data: dataObj,
          profile: parsed.profile || null,
          emergencyProfile: parsed.emergencyProfile || null,
          medicationLogs: medLogsArr,
          localData: localDataObj,
          backupOwner,
          ownerMismatch,
          // G-H7: phone-only data can only be restored into the SAME
          // person's own browser. Restoring into someone else's account
          // (an admin restoring a patient) can never reach that person's
          // phone, so those keys are skipped, never silently written here.
          isOwnRestore: !targetUid || targetUid === currentUser?.uid,
        });
      } catch (err: any) {
        setImportError(err.message || 'JSON ဖိုင်ဖတ်ရှုခြင်း မအောင်မြင်ပါ။');
      }
    };
    reader.readAsText(file);
  };

  // 4. Confirm Import with Deduplication & Forced Target UID
  // Import goes to the current target: the admin's selected patient when
  // one is selected, otherwise the signed-in user (same target the rest of
  // the app uses). patientEmail is stamped alongside userId so the dual-key
  // listeners make the records visible to the patient too.
  const handleConfirmImport = async () => {
    if (!importPreview || !currentUser) return;
    setIsImporting(true);
    setImportError(null);

    try {
      const { data } = importPreview;
      let insertedCount = 0;
      // G-H6: invalid rows and duplicates are DIFFERENT reasons to skip —
      // the old code lumped both into one "skipped" count, so a file full
      // of broken rows was reported as "duplicates". Count them apart.
      let duplicateCount = 0;
      let invalidCount = 0;
      // Collections that failed (e.g. doctorAdvices can only be written by
      // an admin — a regular user restoring advice is denied by the rules).
      // One collection failing must not abort the rest.
      const failedKinds: string[] = [];
      const safeImport = async (label: string, run: () => Promise<void>) => {
        try {
          await run();
        } catch (e: any) {
          console.error(`Import failed for ${label}:`, e);
          failedKinds.push(label);
        }
      };

      // Stable hash of a record's content (id/userId/patientEmail excluded)
      // so the same record is recognised as a duplicate even after re-export.
      const contentHash = (item: any): string => {
        const clean: Record<string, any> = {};
        Object.keys(item || {}).sort().forEach((k) => {
          if (k === 'id' || k === 'userId' || k === 'patientEmail') return;
          clean[k] = (item as any)[k];
        });
        const str = JSON.stringify(clean);
        let h = 5381;
        for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
        return 'h' + h.toString(16);
      };

      // Number helper: keeps a real number, returns undefined when missing.
      // Never invents a value — and Firestore rejects NaN, so Number(undefined)
      // must never reach a write.
      const numOrUndef = (v: any): number | undefined => {
        if (v === undefined || v === null || v === '') return undefined;
        const n = Number(v);
        return Number.isFinite(n) ? n : undefined;
      };

      // Firestore rejects undefined field values — strip them (a missing
      // field must stay missing, never be invented).
      const stripUndefined = (obj: Record<string, any>) => {
        Object.keys(obj).forEach((k) => { if (obj[k] === undefined) delete obj[k]; });
        return obj;
      };

      // Helper to import a collection with deduplication, in atomic
      // Firestore batches (max 500 writes per batch — chunked). All payloads
      // are built and de-duplicated FIRST; then each chunk is committed as
      // one batch, so a failed chunk writes nothing at all instead of
      // leaving a half-restored collection. insertedCount only counts
      // chunks that actually committed. A failed collection is reported by
      // safeImport and the other collections still import.
      const BATCH_LIMIT = 500;
      const importCollection = async (
        colName: string,
        items: any[],
        keyGenerator: (item: any, docId?: string) => string,
        transform: (item: any) => any | null
      ) => {
        if (!Array.isArray(items) || items.length === 0) return;

        // Fetch existing records for the TARGET user to check duplicate keys.
        // Both the collection's natural key AND a content hash are tracked:
        // the natural key catches re-imports, the content hash catches
        // records whose id was lost (e.g. hand-edited backups).
        const q = query(collection(db, colName), where('userId', '==', targetUid));
        const snap = await getDocs(q);
        const existingKeySet = new Set<string>();
        snap.forEach(d => {
          existingKeySet.add(keyGenerator(d.data(), d.id));
          existingKeySet.add('content:' + contentHash(d.data()));
        });

        // Build every payload first (dedup + transform), writing nothing.
        const payloads: Record<string, any>[] = [];
        for (const item of items) {
          const transformed = transform(item);
          if (!transformed) {
            // The row is broken (missing the fields a record needs) —
            // invalid, NOT a duplicate. Reported apart below (G-H6).
            invalidCount++;
            continue;
          }
          const itemKey = keyGenerator(item, item.id);
          if (existingKeySet.has(itemKey) || existingKeySet.has('content:' + contentHash(item))) {
            duplicateCount++;
            continue;
          }

          // Build clean payload strictly forcing owner to the target user
          const payload = stripUndefined({
            ...transformed,
            userId: targetUid,
            patientEmail: targetEmail,
            createdAt: item.createdAt || new Date().toISOString(),
          });
          delete (payload as any).id;

          payloads.push(payload);
          existingKeySet.add(itemKey);
          existingKeySet.add('content:' + contentHash(item));
        }

        // Commit in batches of 500. Each batch is all-or-nothing: a failed
        // batch writes nothing. If the FIRST batch fails, nothing from this
        // collection was restored and the error throws (safeImport reports
        // the collection). If a LATER batch fails, earlier batches already
        // committed — report honestly as partial instead of claiming the
        // whole collection failed.
        const labelMm: Record<string, string> = {
          vitals: 'သွေးပေါင်ချိန်',
          glucose: 'သွေးချို',
          bmi: 'BMI',
          labTests: 'ဓာတ်ခွဲခန်း',
          medications: 'ဆေးဝါး',
          familyMembers: 'မိသားစုဝင်',
          vaccines: 'ကာကွယ်ဆေး',
          doctorAdvices: 'ဆရာဝန် အကြံပြုချက်',
          doctorQuestions: 'ဆရာဝန် မေးခွန်း',
          medicationLogs: 'ဆေးသောက်မှတ်တမ်း',
        };
        let committedHere = 0;
        for (let i = 0; i < payloads.length; i += BATCH_LIMIT) {
          const chunk = payloads.slice(i, i + BATCH_LIMIT);
          const batch = writeBatch(db);
          chunk.forEach((p) => batch.set(doc(collection(db, colName)), p));
          try {
            await batch.commit();
            committedHere += chunk.length;
            insertedCount += chunk.length;
          } catch (e) {
            console.error(`Import batch failed for ${colName} (records ${i + 1}-${i + chunk.length}):`, e);
            if (committedHere === 0) throw e;
            failedKinds.push(`${labelMm[colName] || colName} (တစ်စိတ်တစ်ပိုင်းသာ ရောက်သည် — ${committedHere} ခု ရောက်ပြီး၊ ကျန်တာ မရောက်ပါ)`);
            return;
          }
        }
      };

      // Vitals — missing pulse/category are left missing, never invented
      await safeImport('သွေးပေါင်ချိန်', () => importCollection(
        'vitals',
        data.vitals || [],
        (v) => `${v.recordedAt || v.createdAt}_${v.systolic}_${v.diastolic}`,
        (v) => {
          const sys = numOrUndef(v.systolic);
          const dia = numOrUndef(v.diastolic);
          if (sys === undefined || dia === undefined) return null;
          return {
            systolic: sys,
            diastolic: dia,
            pulse: numOrUndef(v.pulse),
            category: v.category,
            condition: v.condition,
            patientName: v.patientName || targetName,
            // G-M1 / D-M3: a missing measurement date stays missing — never
            // stamp "now" as the measurement date. The display shows
            // 'ရက်စွဲ မရှိပါ' instead of inventing one.
            recordedAt: v.recordedAt || v.createdAt,
            notes: v.notes || '',
          };
        }
      ));

      // Glucose — missing test type / status are left missing, never invented
      await safeImport('သွေးချို', () => importCollection(
        'glucose',
        data.glucose || [],
        (g) => `${g.recordedAt || g.createdAt}_${g.glucoseValue || g.value}`,
        (g) => {
          const val = numOrUndef(g.glucoseValue ?? g.value);
          if (val === undefined) return null;
          return {
            glucoseValue: val,
            value: val,
            timing: g.timing || g.type,
            type: g.type || g.timing,
            status: g.status,
            patientName: g.patientName || targetName,
            // G-M1 / D-M3: missing measurement date stays missing (see vitals).
            recordedAt: g.recordedAt || g.createdAt,
            notes: g.notes || '',
          };
        }
      ));

      // BMI
      await safeImport('BMI', () => importCollection(
        'bmi',
        data.bmi || [],
        (b) => `${b.date || b.timestamp || b.createdAt}_${b.weightKg}_${b.heightCm}`,
        (b) => {
          const h = numOrUndef(b.heightCm);
          const w = numOrUndef(b.weightKg);
          if (h === undefined || w === undefined) return null;
          return {
            heightCm: h,
            weightKg: w,
            bmi: numOrUndef(b.bmi),
            category: b.category,
            userName: b.userName || targetName,
            // G-M1 / D-M3: missing measurement date stays missing (see vitals).
            date: b.date || b.timestamp || b.createdAt,
          };
        }
      ));

      // Lab Tests — preserve the original shape exactly (tests[] + panels).
      // The old flat transform (testName/resultValue/referenceRange) wrote
      // fields LabTestRecord does not have, so imported labs rendered as
      // nothing. Dedup by record id when present, else by content hash —
      // the old `${date}_${testName}` key was `<date>_undefined` for every
      // lab, so only the first lab per date ever imported.
      await safeImport('ဓာတ်ခွဲခန်း', () => importCollection(
        'labTests',
        data.labTests || [],
        (l, docId) => (docId || l.id) ? `lab:${docId || l.id}` : `lab:${contentHash(l)}`,
        (l) => {
          const hasTests = Array.isArray(l.tests) && l.tests.length > 0;
          const hasPanel = ['cbc', 'glucose', 'liver', 'renal', 'lipid', 'thyroid', 'urine', 'inflammatory'].some((p) => l[p] != null);
          if (!hasTests && !hasPanel && !l.labName) return null;
          return {
            // G-M1 / D-M3: missing test date stays missing (see vitals).
            testDate: l.testDate || l.createdAt,
            recordedAt: l.recordedAt,
            labName: l.labName || '',
            tests: l.tests,
            cbc: l.cbc,
            glucose: l.glucose,
            liver: l.liver,
            renal: l.renal,
            lipid: l.lipid,
            thyroid: l.thyroid,
            urine: l.urine,
            inflammatory: l.inflammatory,
            notes: l.notes || '',
            doctorReview: l.doctorReview,
            patientName: l.patientName || targetName,
          };
        }
      ));

      // Medications — missing frequency/timing/startDate are left missing,
      // never invented (no fake 'မနက် (၁) ကြိမ်' / after_meal / today)
      await safeImport('ဆေးဝါး', () => importCollection(
        'medications',
        data.medications || [],
        (m) => `${m.name}_${m.dosage}`,
        (m) => {
          if (!m.name) return null;
          return {
            name: m.name,
            genericName: m.genericName || '',
            dosage: m.dosage || '',
            frequency: m.frequency,
            timing: m.timing,
            status: m.status,
            prescribedFor: m.prescribedFor,
            prescribingDoctor: m.prescribingDoctor,
            startDate: m.startDate,
            endDate: m.endDate,
            doseTime: m.doseTime,
            notes: m.notes || '',
          };
        }
      ));

      // Family Members — the real field is `relationship` (the old code
      // wrote `relation`, which the app never reads). Missing age/gender/
      // blood type are left missing — never 0 / 'male' / 'O+'.
      await safeImport('မိသားစုဝင်', () => importCollection(
        'familyMembers',
        data.familyMembers || [],
        (f) => `${f.name}_${f.relationship || f.relation}`,
        (f) => {
          if (!f.name) return null;
          return {
            name: f.name,
            relationship: f.relationship || f.relation || 'အခြား',
            age: numOrUndef(f.age),
            gender: f.gender,
            bloodType: f.bloodType,
            chronicConditions: f.chronicConditions || [],
            emergencyContact: f.emergencyContact || '',
            notes: f.notes,
            avatarColor: f.avatarColor || (f.gender === 'female' ? 'bg-rose-600' : 'bg-emerald-600'),
          };
        }
      ));

      // Vaccines
      await safeImport('ကာကွယ်ဆေး', () => importCollection(
        'vaccines',
        data.vaccines || [],
        (vac) => `${vac.vaccineName}_${vac.doseNumber}_${vac.dateAdministered || vac.createdAt || ''}`,
        (vac) => {
          if (!vac.vaccineName) return null;
          return {
            vaccineName: vac.vaccineName,
            targetDisease: vac.targetDisease || '',
            doseNumber: numOrUndef(vac.doseNumber),
            totalDoses: numOrUndef(vac.totalDoses),
            dateAdministered: vac.dateAdministered || '',
            nextDueDate: vac.nextDueDate || '',
            administeredBy: vac.administeredBy,
            batchNumber: vac.batchNumber,
            status: vac.status || (vac.dateAdministered ? 'completed' : 'scheduled'),
            category: vac.category,
            notes: vac.notes || '',
            patientName: vac.patientName || targetName,
          };
        }
      ));

      // Doctor Advices — previously counted in the preview but never
      // imported at all. Batched writes (not addDoctorAdvice) so the
      // original date/doctor are preserved; note the rules only let an
      // admin create advice, so a regular user restoring advice fails
      // honestly and is reported below instead of aborting the import.
      await safeImport('ဆရာဝန် အကြံပြုချက်', () => importCollection(
        'doctorAdvices',
        data.doctorAdvices || [],
        (a, docId) => (docId || a.id) ? `adv:${docId || a.id}` : `adv:${contentHash(a)}`,
        (a) => {
          if (!a.advice) return null;
          return {
            advice: a.advice,
            dietRecommendation: a.dietRecommendation,
            doctorName: a.doctorName,
            doctorEmail: a.doctorEmail,
            patientName: a.patientName || targetName,
            date: a.date || (a.createdAt ? String(a.createdAt).split('T')[0] : undefined),
          };
        }
      ));

      // Doctor Questions — same: previously counted, never imported.
      // Status is derived from the answer when missing, never invented.
      await safeImport('ဆရာဝန် မေးခွန်း', () => importCollection(
        'doctorQuestions',
        data.doctorQuestions || [],
        (q, docId) => (docId || q.id) ? `q:${docId || q.id}` : `q:${contentHash(q)}`,
        (q) => {
          if (!q.title && !q.questionDetails) return null;
          return {
            category: q.category,
            title: q.title || '',
            questionDetails: q.questionDetails || '',
            duration: q.duration,
            recentBP: q.recentBP,
            recentSugar: q.recentSugar,
            currentMedications: q.currentMedications,
            urgency: q.urgency,
            status: q.status || (q.doctorAnswer ? 'answered' : 'pending'),
            doctorAnswer: q.doctorAnswer,
            patientName: q.patientName || targetName,
          };
        }
      ));

      // Medication intake logs
      await safeImport('ဆေးသောက်မှတ်တမ်း', () => importCollection(
        'medicationLogs',
        importPreview.medicationLogs || [],
        (m) => `${m.medicationId || ''}_${m.date || ''}_${m.doseIndex ?? 0}`,
        (m) => {
          if (!m.medicationId || !m.date) return null;
          return {
            medicationId: m.medicationId,
            medicationName: m.medicationName,
            date: m.date,
            doseIndex: m.doseIndex ?? 0,
            taken: m.taken ?? true,
            takenAt: m.takenAt,
          };
        }
      ));

      // Profile + Emergency ID (top level in the backup). Role is never
      // restored from a file — roles are managed via the admins doc.
      // G-H1: identity fields are NEVER silently overwritten from a file.
      // A backup from another person (or an old backup of this person)
      // must not rename the account, swap its email, or change its DOB.
      // Only health data is restored — blood type, conditions, allergies,
      // phone, emergency profile — and the preview says so plainly.
      let profileRestored = false;
      const fileProfile = importPreview.profile || null;
      const fileEmergency = importPreview.emergencyProfile || null;
      if ((fileProfile || fileEmergency) && targetUid) {
        const cleanProfile: Record<string, any> = { ...(fileProfile || {}) };
        delete cleanProfile.id;
        delete cleanProfile.role;
        delete cleanProfile.displayName;
        delete cleanProfile.email;
        delete cleanProfile.dateOfBirth;
        delete cleanProfile.username;
        if (fileEmergency) cleanProfile.emergencyProfile = fileEmergency;
        try {
          await setDoc(doc(db, 'users', targetUid), stripUndefined(cleanProfile), { merge: true });
          profileRestored = true;
        } catch (e) {
          console.error('Profile restore failed:', e);
          failedKinds.push('ပရိုဖိုင်');
        }
      }

      // Phone-only data (localStorage) — G-H7: when the restore target is
      // NOT the signed-in user, localData is SKIPPED entirely. Those keys
      // live in a browser, not in the account: writing them into the
      // admin's browser would put the patient's phone-only data where the
      // patient can never see it, while looking like a successful restore.
      // The patient must restore their own backup on their own phone.
      let localRestored = 0;
      let localSkipped = 0;
      let localNotRestorable = 0;
      const localDataObj = importPreview.localData || {};
      if (!importPreview.isOwnRestore) {
        localNotRestorable = Object.keys(localDataObj).length;
      } else {
        Object.entries(localDataObj).forEach(([key, value]) => {
          const ownerUid = localKeyOwnerUid(key);
          if (ownerUid !== null && ownerUid !== targetUid) { localSkipped++; return; }
          try {
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
            localRestored++;
          } catch (e) {
            console.warn('Could not restore local key', key, e);
            localSkipped++;
          }
        });
      }

      if (insertedCount === 0 && !profileRestored && localRestored === 0 && failedKinds.length > 0) {
        setImportError(`မှတ်တမ်းများ သွင်းယူခြင်း မအောင်မြင်ပါ။ သွင်းယူလို့ မရခဲ့သော အမျိုးအစားများ: ${failedKinds.join(', ')}`);
      } else {
        // G-M10: the imported total counts the profile too when it was
        // restored; G-H6: duplicates and invalid rows are reported apart.
        const totalImported = insertedCount + (profileRestored ? 1 : 0);
        const parts = [`မှတ်တမ်း အသစ် (${totalImported}) ခု အောင်မြင်စွာ ပြန်လည်သွင်းယူပြီးပါပြီ!`];
        if (duplicateCount > 0) parts.push(`ထပ်နေသော မှတ်တမ်း ${duplicateCount} ခုကို ကျော်ခဲ့ပါသည်။`);
        if (invalidCount > 0) parts.push(`အချက်အလက် မပြည့်စုံသော မှတ်တမ်း ${invalidCount} ခုကို သွင်းမရဘဲ ကျော်ခဲ့ပါသည်။`);
        if (profileRestored) parts.push('ပရိုဖိုင် ကျန်းမာရေးအချက်အလက်သာ ပြန်ရောက်ပါပြီ (အမည်/အီးမေးလ်/မွေးသက္ကရာဇ် မပြောင်းပါ)။');
        if (localRestored > 0) parts.push(`ဖုန်းထဲမှတ်တမ်း (${localRestored}) ခု ပြန်ရောက်ပါပြီ — မြင်ရဖို့ စာမျက်နှာကို ပြန်ဖွင့်ပေးပါ။`);
        if (localNotRestorable > 0) parts.push(`ဖုန်းထဲမှတ်တမ်း (${localNotRestorable}) ခု ပြန်မရောက်ပါ — ${targetName} ၏ ဖုန်းထဲမှတ်တမ်းကို ဤဘရောက်ဇာထဲ ထည့်လို့မရပါ၊ ထိုသူ၏ ကိုယ်ပိုင်ဖုန်းထဲတွင်သာ ပြန်သွင်းနိုင်ပါသည်။`);
        if (localSkipped > 0) parts.push(`ဖုန်းထဲမှတ်တမ်း (${localSkipped}) ခုကို (ပိုင်ရှင် မတူသဖြင့်) ကျော်ခဲ့ပါသည်။`);
        if (failedKinds.length > 0) parts.push(`သွင်းယူလို့ မရခဲ့သော အမျိုးအစားများ: ${failedKinds.join(', ')} (မအောင်မြင်သော အမျိုးအစားမှ မှတ်တမ်းများ ပြန်မရောက်ပါ — တစ်စိတ်တစ်ပိုင်းဟု ရေးထားမှသာ အဲဒီအပိုင်း ရောက်ပြီး ဖြစ်ပါတယ်)`);
        setImportStatus({
          success: failedKinds.length === 0,
          message: parts.join(' '),
          count: totalImported
        });
      }
      setImportPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (refreshAdminData) refreshAdminData();
    } catch (err: any) {
      console.error('Import error:', err);
      setImportError(err.message || 'မှတ်တမ်းများ သွင်းယူရာတွင် ချို့ယွင်းချက် ဖြစ်ပေါ်ခဲ့ပါသည်။');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      showHeader={false}
      className="max-h-[90vh]"
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                ဒေတာ ထုတ်ယူခြင်း & ပြန်လည်သွင်းခြင်း (Data Backup & Restore)
              </h3>
              <p className="text-xs text-slate-500">
                {targetName} ၏ ကျန်းမာရေးမှတ်တမ်းများကို သိမ်းဆည်းရန် သို့မဟုတ် ပြန်လည်သွင်းယူရန်
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ပိတ်မည်"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => { setActiveTab('export'); setImportError(null); setImportStatus(null); }}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'export'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>ဒေတာ ထုတ်ယူမည် (Export)</span>
          </button>
          <button
            onClick={() => { setActiveTab('import'); setImportError(null); setImportStatus(null); }}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'import'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>ဒေတာ ပြန်သွင်းမည် (Restore / Import)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-700">
          
          {activeTab === 'export' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1.5">
                <p className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>လုံခြုံစိတ်ချရသော ကိုယ်ပိုင်ဒေတာ ထိန်းသိမ်းမှု</span>
                </p>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  သင့် ကျန်းမာရေးမှတ်တမ်းများ (သွေးပေါင်ချိန်၊ သွေးချို၊ BMI၊ ဓာတ်ခွဲခန်း ဆေးစစ်ချက်များ၊ ဆေးဝါးများ၊ ဆေးသောက်မှတ်တမ်း၊ မိသားစုဝင်များ၊ ဆရာဝန် အကြံပြုချက်/မေးခွန်းများ)၊ ပရိုဖိုင်၊ Emergency ID နှင့် ဖုန်းထဲမှတ်တမ်းများ (သွား/မျက်စိ/နားအကြား၊ လေ့ကျင့်ခန်း၊ Checklist၊ Bookmark၊ သတိပေးချက်များ) အားလုံးကို JSON ဖိုင်အဖြစ် သိမ်းဆည်းနိုင်ပါသည်။ Admin က အသုံးပြုသူ တစ်ယောက်အတွက် ထုတ်ယူလျှင် ဖုန်းထဲမှတ်တမ်းများ မပါဝင်ပါ — ၎င်းတို့သည် ထိုအသုံးပြုသူ၏ ကိုယ်ပိုင်ဖုန်းထဲတွင်သာ ရှိပါသည်။
                </p>
              </div>

              {/* Records count badge */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-slate-400 text-[11px] block">သွေးပေါင်ချိန်</span>
                  <span className="font-extrabold text-sm text-slate-800">{bpRecords.length} ခု</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-slate-400 text-[11px] block">သွေးချို</span>
                  <span className="font-extrabold text-sm text-slate-800">{glucoseRecords.length} ခု</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-slate-400 text-[11px] block">ဆေးဝါး & ဓာတ်ခွဲ</span>
                  <span className="font-extrabold text-sm text-slate-800">{medications.length + labRecords.length} ခု</span>
                </div>
              </div>

              {/* Export Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={handleExportJSON}
                  disabled={isExporting}
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-between shadow-md shadow-emerald-600/20 cursor-pointer transition-all disabled:opacity-50"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4" />
                    <span>JSON ဖိုင်အဖြစ် ဒေတာအားလုံး ဒေါင်းလုဒ်ဆွဲမည် (.json)</span>
                  </div>
                  <Download className="w-4 h-4" />
                </button>

                <button
                  onClick={handleExportAllCSVs}
                  disabled={isExporting}
                  className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-between shadow-sm cursor-pointer transition-all disabled:opacity-50"
                >
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>{isExporting ? 'CSV ဖိုင်များ ဒေါင်းလုဒ်ဆွဲနေသည်...' : 'Excel / CSV ဇယားများအဖြစ် ဒေါင်းလုဒ်ဆွဲမည် (.csv - UTF-8)'}</span>
                  </div>
                  <Download className="w-4 h-4" />
                </button>
                <p className="text-[11px] leading-relaxed text-slate-500 px-1">
                  CSV မှာ သွေးပေါင်၊ သွေးချို၊ BMI၊ ဓာတ်ခွဲ၊ ဆေး၊ ကာကွယ်ဆေး၊ မိသားစုဝင်၊ ဆရာဝန် အကြံပြုချက်/မေးခွန်း၊ ဆေးသောက်မှတ်တမ်း၊ ပရိုဖိုင် (၁၁ မျိုး) ပါဝင်ပြီး — မှတ်တမ်းရှိတဲ့ အမျိုးအစားတွေပဲ ဒေါင်းလုဒ်ဆွဲပေးပါမယ် (ဖိုင်တစ်ခုချင်း ခြားပြီး ဆွဲပေးတာမို့ ခဏစောင့်ပါ)။ ဖုန်းထဲမှတ်တမ်းများ (သွား/မျက်စိ/နား၊ လေ့ကျင့်ခန်း၊ Checklist၊ Bookmark) ကတော့ JSON ဖိုင်နဲ့ပဲ ထုတ်လို့ရပါတယ်။
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 space-y-1.5">
                <p className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  <span>အရင် Export လုပ်ထားသော JSON Backup ဖိုင်ကို ရွေးချယ်ပါ</span>
                </p>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  စနစ်သည် ဖိုင်ကို အလိုအလျောက် စစ်ဆေးပြီး ထပ်နေသော မှတ်တမ်းများကို ကျော်ကာ မှတ်တမ်းအသစ်များကိုသာ သင့်အကောင့်ထဲသို့ လုံခြုံစွာ သွင်းယူပေးမည် ဖြစ်ပါသည်။ ပရိုဖိုင်၏ ကျန်းမာရေးအချက်အလက်များသာ ပြန်ရောက်မည် — အမည်၊ အီးမေးလ်၊ မွေးသက္ကရာဇ်ကိုမူ လက်ရှိ အကောင့်အတိုင်း ထားပြီး မပြောင်းပါ။ ဖုန်းထဲမှတ်တမ်းများမှာ ကိုယ်ပိုင်ဖုန်းထဲတွင်သာ ပြန်သွင်းနိုင်ပါသည်။
                </p>
              </div>

              {/* File Input */}
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="backup-file-input"
                />
                <label htmlFor="backup-file-input" className="cursor-pointer block space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-slate-800 text-xs">
                    ဖိုင်ရွေးချယ်ရန် ဤနေရာကို နှိပ်ပါ
                  </p>
                  <p className="text-[11px] text-slate-400">
                    သီးသန့် .json ဖိုင်များကိုသာ လက်ခံပါသည်
                  </p>
                </label>
              </div>

              {/* Error banner */}
              {importError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Success banner */}
              {importStatus && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{importStatus.message}</span>
                </div>
              )}

              {/* Preview Box */}
              {importPreview && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      <span>ဖိုင်အချက်အလက် စစ်ဆေးပြီးမှု အကျဉ်း:</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">{importPreview.filename}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {/* G-H1: whose backup is this — shown before anything is
                        imported, with a warning when it is not the restore
                        target's own file. */}
                    <div className="p-2 bg-white rounded-lg border border-slate-200 col-span-2">
                      ဖိုင်ပိုင်ရှင်: <strong>{importPreview.backupOwner?.name || 'အမည် မသိရှိပါ'}</strong>
                      {importPreview.backupOwner?.email ? ` (${importPreview.backupOwner.email})` : ''}
                      <span className="text-slate-500"> — သွင်းမည့်အကောင့်: {targetName}</span>
                    </div>
                    {importPreview.ownerMismatch && (
                      <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-300 text-amber-900 col-span-2 leading-relaxed">
                        <strong>⚠️ သတိပေးချက်:</strong> ဤဖိုင်သည် <strong>{importPreview.backupOwner?.name || 'အခြားသူ'}</strong> ၏ backup ဖြစ်ပြီး၊ <strong>{targetName}</strong> ၏ အကောင့်ထဲသို့ သွင်းယူမည် ဖြစ်သည်။ မှတ်တမ်းများကို {targetName} ၏ အမည်ဖြင့် ပြောင်းသွင်းမည်ဖြစ်ပြီး၊ ပရိုဖိုင်၏ အမည်/အီးမေးလ်/မွေးသက္ကရာဇ်ကိုမူ မပြောင်းပါ။ မှားယွင်းသော ဖိုင်ဖြစ်ပါက မသွင်းပါနှင့်။
                      </div>
                    )}
                    {importPreview.counts.profile > 0 && (
                      <div className="p-2 bg-white rounded-lg border border-slate-200 col-span-2 text-slate-600">
                        ပရိုဖိုင် ပါဝင်သည် — ကျန်းမာရေးအချက်အလက်သာ ပြန်ရောက်မည်။ အမည်၊ အီးမေးလ်၊ မွေးသက္ကရာဇ် မပြောင်းပါ။
                      </div>
                    )}
                    {!importPreview.isOwnRestore && importPreview.counts.localData > 0 && (
                      <div className="p-2 bg-white rounded-lg border border-slate-200 col-span-2 text-slate-600">
                        ဖုန်းထဲမှတ်တမ်း ({importPreview.counts.localData}) ခု ပါသော်လည်း {targetName} ၏ ကိုယ်ပိုင်ဖုန်းထဲတွင်သာ ပြန်သွင်းနိုင်သဖြင့် ဤနေရာတွင် ပြန်မရောက်ပါ။
                      </div>
                    )}
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      သွေးပေါင်ချိန်: <strong>{importPreview.counts.vitals} ခု</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      သွေးချို/သကြားဓာတ်: <strong>{importPreview.counts.glucose} ခု</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      BMI မှတ်တမ်း: <strong>{importPreview.counts.bmi} ခု</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      ဓာတ်ခွဲစစ်ဆေးချက်: <strong>{importPreview.counts.labTests} ခု</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      ဆေးဝါးမှတ်တမ်း: <strong>{importPreview.counts.medications} ခု</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      ကာကွယ်ဆေး: <strong>{importPreview.counts.vaccines || 0} ခု</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      မိသားစုဝင်: <strong>{importPreview.counts.familyMembers} ဦး</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      ဆရာဝန် အကြံပြုချက်: <strong>{importPreview.counts.doctorAdvices} ခု</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      ဆရာဝန် မေးခွန်း: <strong>{importPreview.counts.doctorQuestions} ခု</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      ဆေးသောက်မှတ်တမ်း: <strong>{importPreview.counts.medicationLogs} ခု</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      ဖုန်းထဲမှတ်တမ်း: <strong>{importPreview.counts.localData} ခု</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      ပရိုဖိုင်: <strong>{importPreview.counts.profile} ခု</strong>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmImport}
                    disabled={isImporting}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isImporting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>မှတ်တမ်း ({importPreview.totalRecords}) ခုလုံးကို အကောင့်ထဲသို့ သွင်းယူမည်</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          <MedicalDisclaimer variant="compact" />
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer transition-colors"
          >
            ပိတ်မည်
          </button>
        </div>

      </div>
    </Modal>
  );
};
