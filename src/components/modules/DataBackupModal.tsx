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
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { MedicalDisclaimer } from '../common/MedicalDisclaimer';
import { Modal } from '../common/Modal';

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
    selectedPatient,
    refreshAdminData
  } = useHealthData();

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

  // 1. Export JSON Data
  const handleExportJSON = () => {
    setIsExporting(true);
    try {
      const backupPayload = {
        app: 'FamilyHealthTrack',
        version: '2.4.2',
        exportedAt: new Date().toISOString(),
        patient: {
          id: targetUid,
          displayName: targetName,
          email: selectedPatient?.email || profile?.email || '',
        },
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
    } catch (err: any) {
      console.error('Export JSON error:', err);
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

  // 2. Export Individual CSVs with UTF-8 BOM
  const handleExportAllCSVs = () => {
    const dateStr = new Date().toISOString().split('T')[0];

    // (a) BP CSV
    if (bpRecords.length > 0) {
      const headers = ['ရက်စွဲ (Date)', 'အပေါ်သွေး (Systolic)', 'အောက်သွေး (Diastolic)', 'နှလုံးခုန်နှုန်း (Pulse)', 'အဆင့်အတန်း (Category)', 'လူနာအမည် (Patient)', 'မှတ်ချက် (Notes)'];
      const rows = bpRecords.map(b => [
        `"${b.recordedAt || b.createdAt || ''}"`,
        b.systolic,
        b.diastolic,
        b.pulse,
        `"${b.category || ''}"`,
        `"${b.patientName || targetName}"`,
        `"${(b.notes || '').replace(/"/g, '""')}"`
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      downloadCSVWithBOM(csv, `BloodPressure_${targetName}_${dateStr}.csv`);
    }

    // (b) Glucose CSV
    if (glucoseRecords.length > 0) {
      const headers = ['ရက်စွဲ (Date)', 'သကြားဓာတ် (mg/dL)', 'တိုင်းတာချိန် (Type)', 'အဆင့်အတန်း (Status)', 'လူနာအမည် (Patient)', 'မှတ်ချက် (Notes)'];
      const rows = glucoseRecords.map(g => [
        `"${g.recordedAt || g.createdAt || ''}"`,
        g.glucoseValue || g.value,
        `"${g.timing || g.type || ''}"`,
        `"${g.status || ''}"`,
        `"${g.patientName || targetName}"`,
        `"${(g.notes || '').replace(/"/g, '""')}"`
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      downloadCSVWithBOM(csv, `BloodSugar_${targetName}_${dateStr}.csv`);
    }

    // (c) BMI CSV
    if (bmiRecords.length > 0) {
      const headers = ['ရက်စွဲ (Date)', 'အရပ် (cm)', 'ကိုယ်အလေးချိန် (kg)', 'BMI ညွှန်းကိန်း', 'အဆင့်အတန်း (Category)'];
      const rows = bmiRecords.map(b => [
        `"${b.date || b.timestamp || b.createdAt || ''}"`,
        b.heightCm,
        b.weightKg,
        b.bmi,
        `"${b.category || ''}"`
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      downloadCSVWithBOM(csv, `BMIRecords_${targetName}_${dateStr}.csv`);
    }

    // (d) Lab Tests CSV
    if (labRecords.length > 0) {
      const headers = ['ရက်စွဲ (Date)', 'ဓာတ်ခွဲခန်း (Lab)', 'ဆေးစစ်ချက်အမည် (Test Name)', 'အဖြေ (Result)', 'ပုံမှန်သတ်မှတ်ချက် (Normal Range)', 'အကဲဖြတ်ချက် (Status)'];
      const rows: string[][] = [];
      labRecords.forEach(l => {
        if (l.tests && l.tests.length > 0) {
          l.tests.forEach(t => {
            rows.push([
              `"${l.testDate || l.recordedAt || l.createdAt || ''}"`,
              `"${l.labName || ''}"`,
              `"${t.nameMm || t.nameEn || ''}"`,
              `"${t.value} ${t.unit || ''}"`,
              `"${t.refRangeText || `${t.refMin ?? ''} - ${t.refMax ?? ''}`}"`,
              `"${t.statusLabelMm || t.status || ''}"`
            ]);
          });
        } else {
          rows.push([
            `"${l.testDate || l.recordedAt || l.createdAt || ''}"`,
            `"${l.labName || ''}"`,
            `"${(l as any).testName || 'ဓာတ်ခွဲစစ်ဆေးချက်'}"`,
            `"${(l as any).resultValue || ''}"`,
            `"${(l as any).referenceRange || ''}"`,
            `"-"`
          ]);
        }
      });
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      downloadCSVWithBOM(csv, `LabTests_${targetName}_${dateStr}.csv`);
    }

    // (e) Medications CSV
    if (medications.length > 0) {
      const headers = ['ဆေးအမည် (Trade Name)', 'ဓာတုအမည် (Generic Name)', 'ဆေးပမာဏ (Dosage)', 'သောက်သုံးချိန် (Frequency)', 'သောက်နည်း (Timing)', 'အခြေအနေ (Status)'];
      const rows = medications.map(m => [
        `"${m.name || ''}"`,
        `"${m.genericName || ''}"`,
        `"${m.dosage || ''}"`,
        `"${m.frequency || ''}"`,
        `"${m.timing || ''}"`,
        `"${m.status || ''}"`
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      downloadCSVWithBOM(csv, `Medications_${targetName}_${dateStr}.csv`);
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

        // Validation
        if (!parsed || (!parsed.data && !parsed.vitals)) {
          throw new Error('တရားဝင်သော Backup JSON ဖိုင်ပုံစံ မဟုတ်ပါ။');
        }

        const dataObj = parsed.data || parsed;
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
        };

        const totalRecords = Object.values(counts).reduce((a, b) => a + b, 0);
        if (totalRecords === 0) {
          throw new Error('ဖိုင်အတွင်း ထည့်သွင်းနိုင်သော ကျန်းမာရေးမှတ်တမ်း မတွေ့ရှိပါ။');
        }

        setImportPreview({
          filename: file.name,
          exportedAt: parsed.exportedAt || 'မသိရှိပါ',
          counts,
          totalRecords,
          data: dataObj,
        });
      } catch (err: any) {
        setImportError(err.message || 'JSON ဖိုင်ဖတ်ရှုခြင်း မအောင်မြင်ပါ။');
      }
    };
    reader.readAsText(file);
  };

  // 4. Confirm Import with Deduplication & Forced Current UID
  const handleConfirmImport = async () => {
    if (!importPreview || !currentUser) return;
    setIsImporting(true);
    setImportError(null);

    try {
      const { data } = importPreview;
      let insertedCount = 0;
      let skippedCount = 0;

      // Helper to import collection with deduplication
      const importCollection = async (
        colName: string, 
        items: any[], 
        keyGenerator: (item: any) => string,
        transform: (item: any) => any
      ) => {
        if (!Array.isArray(items) || items.length === 0) return;

        // Fetch existing records for this user to check duplicate keys
        const q = query(collection(db, colName), where('userId', '==', currentUser.uid));
        const snap = await getDocs(q);
        const existingKeySet = new Set<string>();
        snap.forEach(d => {
          existingKeySet.add(keyGenerator(d.data()));
        });

        for (const item of items) {
          const itemKey = keyGenerator(item);
          if (existingKeySet.has(itemKey)) {
            skippedCount++;
            continue;
          }

          // Build clean payload strictly forcing owner to currentUser.uid
          const payload = {
            ...transform(item),
            userId: currentUser.uid,
            createdAt: item.createdAt || new Date().toISOString(),
          };
          delete (payload as any).id;

          await addDoc(collection(db, colName), payload);
          existingKeySet.add(itemKey);
          insertedCount++;
        }
      };

      // Vitals
      await importCollection(
        'vitals',
        data.vitals || [],
        (v) => `${v.recordedAt || v.createdAt}_${v.systolic}_${v.diastolic}`,
        (v) => ({
          systolic: Number(v.systolic),
          diastolic: Number(v.diastolic),
          pulse: Number(v.pulse || 75),
          category: v.category || 'normal',
          condition: v.condition || v.category || 'normal',
          patientName: v.patientName || profile?.displayName || 'လူနာ',
          recordedAt: v.recordedAt || v.createdAt || new Date().toISOString(),
          notes: v.notes || '',
        })
      );

      // Glucose
      await importCollection(
        'glucose',
        data.glucose || [],
        (g) => `${g.recordedAt || g.createdAt}_${g.glucoseValue || g.value}`,
        (g) => ({
          glucoseValue: Number(g.glucoseValue || g.value),
          value: Number(g.glucoseValue || g.value),
          timing: g.timing || g.type || 'fasting',
          type: g.type || g.timing || 'fasting',
          status: g.status || 'normal',
          patientName: g.patientName || profile?.displayName || 'လူနာ',
          recordedAt: g.recordedAt || g.createdAt || new Date().toISOString(),
          notes: g.notes || '',
        })
      );

      // BMI
      await importCollection(
        'bmi',
        data.bmi || [],
        (b) => `${b.date || b.timestamp || b.createdAt}_${b.weightKg}_${b.heightCm}`,
        (b) => ({
          heightCm: Number(b.heightCm),
          weightKg: Number(b.weightKg),
          bmi: Number(b.bmi),
          category: b.category || 'normal',
          userName: b.userName || profile?.displayName || 'လူနာ',
          date: b.date || b.timestamp || b.createdAt || new Date().toISOString(),
        })
      );

      // Lab Tests
      await importCollection(
        'labTests',
        data.labTests || [],
        (l) => `${l.testDate || l.createdAt}_${l.testName}`,
        (l) => ({
          testName: l.testName || 'Lab Test',
          resultValue: String(l.resultValue || ''),
          unit: l.unit || '',
          referenceRange: l.referenceRange || '',
          testDate: l.testDate || l.createdAt || new Date().toISOString(),
          labName: l.labName || '',
          notes: l.notes || '',
        })
      );

      // Medications
      await importCollection(
        'medications',
        data.medications || [],
        (m) => `${m.name}_${m.dosage}`,
        (m) => ({
          name: m.name || '',
          genericName: m.genericName || '',
          dosage: m.dosage || '',
          frequency: m.frequency || 'မနက် (၁) ကြိမ်',
          timing: m.timing || 'after_meal',
          status: m.status || 'active',
          startDate: m.startDate || new Date().toISOString().split('T')[0],
          notes: m.notes || '',
        })
      );

      // Family Members
      await importCollection(
        'familyMembers',
        data.familyMembers || [],
        (f) => `${f.name}_${f.relation}`,
        (f) => ({
          name: f.name || 'မိသားစုဝင်',
          relation: f.relation || 'အခြား',
          age: Number(f.age || 0),
          gender: f.gender || 'male',
          bloodType: f.bloodType || 'O+',
          chronicConditions: f.chronicConditions || [],
          emergencyContact: f.emergencyContact || '',
          avatarColor: f.gender === 'female' ? 'bg-rose-600' : 'bg-emerald-600',
        })
      );

      // Vaccines
      await importCollection(
        'vaccines',
        data.vaccines || [],
        (vac) => `${vac.vaccineName}_${vac.doseNumber}_${vac.dateAdministered || vac.createdAt || ''}`,
        (vac) => ({
          vaccineName: vac.vaccineName || 'ကာကွယ်ဆေး',
          targetDisease: vac.targetDisease || '',
          doseNumber: Number(vac.doseNumber || 1),
          totalDoses: Number(vac.totalDoses || 1),
          dateAdministered: vac.dateAdministered || '',
          nextDueDate: vac.nextDueDate || '',
          status: vac.status || (vac.dateAdministered ? 'completed' : 'scheduled'),
          category: vac.category || 'adult',
          notes: vac.notes || '',
          patientName: vac.patientName || targetName,
        })
      );

      setImportStatus({
        success: true,
        message: `မှတ်တမ်း အသစ် (${insertedCount}) ခု အောင်မြင်စွာ ပြန်လည်သွင်းယူပြီးပါပြီ! (ထပ်နေသော မှတ်တမ်း ${skippedCount} ခုကို ကျော်ခဲ့ပါသည်)`,
        count: insertedCount
      });
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
                  သင့် ကျန်းမာရေးမှတ်တမ်းများ (သွေးပေါင်ချိန်၊ သွေးချို၊ BMI၊ ဓာတ်ခွဲခန်း ဆေးစစ်ချက်များ၊ ဆေးဝါးများ၊ မိသားစုဝင်များ) အားလုံးကို JSON ဖိုင်အဖြစ် သို့မဟုတ် Excel ဖတ်ရှုနိုင်သော CSV (Unicode UTF-8 BOM) ဖိုင်များအဖြစ် ကူးယူသိမ်းဆည်းနိုင်ပါသည်။
                </p>
              </div>

              {/* Records count badge */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-slate-400 text-[10px] block">သွေးပေါင်ချိန်</span>
                  <span className="font-extrabold text-sm text-slate-800">{bpRecords.length} ခု</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-slate-400 text-[10px] block">သွေးချို</span>
                  <span className="font-extrabold text-sm text-slate-800">{glucoseRecords.length} ခု</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-slate-400 text-[10px] block">ဆေးဝါး & ဓာတ်ခွဲ</span>
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
                  className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-between shadow-sm cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>Excel / CSV ဇယားများအဖြစ် ဒေါင်းလုဒ်ဆွဲမည် (.csv - UTF-8)</span>
                  </div>
                  <Download className="w-4 h-4" />
                </button>
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
                  စနစ်သည် ဖိုင်ကို အလိုအလျောက် စစ်ဆေးပြီး ထပ်နေသော မှတ်တမ်းများကို ကျော်ကာ မှတ်တမ်းအသစ်များကိုသာ သင့်အကောင့်ထဲသို့ လုံခြုံစွာ သွင်းယူပေးမည် ဖြစ်ပါသည်။
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
                  <p className="text-[10px] text-slate-400">
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
                    <span className="text-[10px] text-slate-500 font-mono">{importPreview.filename}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
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
