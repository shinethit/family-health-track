import React, { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  FileDown,
  FileText, 
  Heart, 
  Activity, 
  Droplets, 
  FlaskConical, 
  Pill, 
  UserCheck, 
  PhoneCall, 
  AlertTriangle,
  Calendar,
  ShieldCheck,
  Stethoscope,
  TrendingUp,
  History,
  Scale,
  CheckCircle2,
  Clock,
  BarChart2,
  Table
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { BloodPressureChart, BloodSugarChart, BMIWeightChart } from '../charts/HealthCharts';
import { MedicalDisclaimer } from '../common/MedicalDisclaimer';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import { formatDateLabel } from '../../lib/medicalCalculations';
import { resolveBMIDisplay } from '../../lib/bmiDisplay';
import {
  buildPdfFilename,
  exportElementToPdf,
  isStandalonePwa,
} from '../../lib/pdfExport';

interface HealthPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HealthPassportModal: React.FC<HealthPassportModalProps> = ({ isOpen, onClose }) => {
  const { profile, isAdmin } = useAuth();
  const { 
    selectedPatient, 
    selectedFamilyMember,
    bpRecords, 
    glucoseRecords, 
    bmiRecords, 
    labRecords, 
    medications, 
    vaccineRecords,
    doctorAdvices,
    doctorQuestions
  } = useHealthData();

  const [historyTimeframe, setHistoryTimeframe] = useState<'all' | '1m' | '3m' | '6m'>('all');
  const [displayMode, setDisplayMode] = useState<'both' | 'graph' | 'table'>('both');
  // G-H2: printing must show EVERYTHING — all rows and both sections —
  // regardless of the on-screen toggles. printMode is set before
  // window.print() runs (desktop button path) or before a PDF capture,
  // and by the browser's beforeprint event (Ctrl+P / menu path), and
  // cleared on afterprint. printMode is "render full content" ONLY — it
  // no longer auto-fires window.print(): the old effect did that, which
  // meant every printMode trigger (including beforeprint) re-entered
  // window.print(), and on a phone PWA that call silently does nothing.
  const [printMode, setPrintMode] = useState(false);
  // v2.4.18: the PDF download is the PRIMARY output on every device —
  // window.print() does nothing in an installed PWA. While a PDF is
  // being built the button is disabled so a double-tap cannot start
  // a second capture.
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  // Desktop Print is hidden in standalone PWA mode, where window.print()
  // cannot work at all — showing it there would be a dead button. The
  // PDF button is primary on all devices instead.
  const [isStandalone] = useState(() => isStandalonePwa());
  const { showToast } = useToast();
  // Ctrl+P / browser-menu printing still works on desktop: beforeprint
  // renders the full view, afterprint clears it again.
  useEffect(() => {
    const onBeforePrint = () => setPrintMode(true);
    const onAfterPrint = () => setPrintMode(false);
    window.addEventListener('beforeprint', onBeforePrint);
    window.addEventListener('afterprint', onAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', onBeforePrint);
      window.removeEventListener('afterprint', onAfterPrint);
    };
  }, []);

  if (!isOpen) return null;

  // D-H2: the passport must follow the selected FAMILY MEMBER, not just
  // the selected patient / signed-in user. The old code used
  // selectedPatient || profile and then required r.userId === that id, so
  // with a member selected the passport showed the OWNER's identity with
  // an empty history (member records carry the member doc id as userId).
  // A member has no login/email/DOB of their own: email shows '-', DOB
  // comes only from their emergency profile when one was saved, and age
  // from the member record.
  const isFamilyMemberView = !isAdmin && !!selectedFamilyMember;
  const memberAsPatient = isFamilyMemberView && selectedFamilyMember ? {
    id: selectedFamilyMember.id,
    displayName: selectedFamilyMember.name,
    email: '',
    dateOfBirth: selectedFamilyMember.emergencyProfile?.dateOfBirth,
    age: selectedFamilyMember.age,
    bloodType: selectedFamilyMember.bloodType,
    chronicConditions: selectedFamilyMember.chronicConditions,
    allergies: selectedFamilyMember.emergencyProfile?.allergies,
    emergencyProfile: selectedFamilyMember.emergencyProfile,
    emergencyContact: '',
  } : null;
  // Determine active patient data
  const currentPatient = memberAsPatient || selectedPatient || profile;
  const patientName = currentPatient?.displayName || 'အသုံးပြုသူအမည် မသတ်မှတ်ရသေးပါ';
  const patientEmail = currentPatient?.email || '-';

  // G-H4: DOB / age in the header. Age is the stored age when present,
  // otherwise computed from a real DOB — never invented.
  const calcAgeFromDob = (dob?: string): number | null => {
    if (!dob) return null;
    const d = new Date(dob);
    if (Number.isNaN(d.getTime())) return null;
    const nowD = new Date();
    let a = nowD.getFullYear() - d.getFullYear();
    const m = nowD.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && nowD.getDate() < d.getDate())) a--;
    return a >= 0 ? a : null;
  };
  const patientAge = currentPatient?.age ?? calcAgeFromDob(currentPatient?.dateOfBirth);
  const patientDobLabel = currentPatient?.dateOfBirth
    ? (formatDateLabel(currentPatient.dateOfBirth).date || currentPatient.dateOfBirth)
    : 'မထည့်ရသေးပါ';

  // Emergency contact: read it from the saved emergencyProfile first
  // (primaryContactPhone + name); fall back to the legacy emergencyContact
  // field, which is only ever set from the admin EditPatientModal.
  const emergencyProfile = currentPatient?.emergencyProfile;
  const emergencyContactDisplay = emergencyProfile?.primaryContactPhone
    ? `${emergencyProfile.primaryContactPhone}${emergencyProfile.primaryContactName ? ` (${emergencyProfile.primaryContactName})` : ''}`
    : (currentPatient?.emergencyContact || 'မထည့်ရသေးပါ');

  // G-H5: blood type / conditions / allergies fall back to the Emergency
  // Profile when the profile itself lacks them — the emergency card is
  // often the only place they were entered. The source is labelled so a
  // reader knows where the value came from.
  const bloodTypeValue = currentPatient?.bloodType || emergencyProfile?.bloodType || '';
  const bloodTypeSource: 'profile' | 'emergency' | null = currentPatient?.bloodType
    ? 'profile'
    : (emergencyProfile?.bloodType ? 'emergency' : null);
  const conditionsValue = (currentPatient?.chronicConditions && currentPatient.chronicConditions.length > 0)
    ? currentPatient.chronicConditions
    : (emergencyProfile?.chronicConditions || []);
  const conditionsSource: 'profile' | 'emergency' | null = (currentPatient?.chronicConditions && currentPatient.chronicConditions.length > 0)
    ? 'profile'
    : ((emergencyProfile?.chronicConditions && emergencyProfile.chronicConditions.length > 0) ? 'emergency' : null);
  const allergiesValue = (currentPatient?.allergies && currentPatient.allergies.length > 0)
    ? currentPatient.allergies
    : (emergencyProfile?.allergies || []);
  const allergiesSource: 'profile' | 'emergency' | null = (currentPatient?.allergies && currentPatient.allergies.length > 0)
    ? 'profile'
    : ((emergencyProfile?.allergies && emergencyProfile.allergies.length > 0) ? 'emergency' : null);
  const epSourceNote = '(Emergency ID ကတ်မှ)';

  // Helper to parse dates reliably
  const parseRecordDate = (r: any): Date => {
    const raw = r.date || r.timestamp || r.dateAdministered || r.recordedAt || r.createdAt;
    if (!raw) return new Date(0);
    const d = new Date(raw);
    return isNaN(d.getTime()) ? new Date(0) : d;
  };

  // D-M3 / D-M4: never substitute createdAt for a measurement date, and
  // never toLocaleDateString('my-MM') (missing on the user's phone).
  // No date at all → 'ရက်စွဲ မရှိပါ', never a fabricated one.
  const formatRecordDate = (r: any): string => {
    const raw = r.date || r.timestamp || r.dateAdministered || r.recordedAt || r.createdAt;
    if (!raw) return 'ရက်စွဲ မရှိပါ';
    const d = parseRecordDate(r);
    if (d.getTime() === 0) return String(raw);
    return formatDateLabel(raw).date || 'ရက်စွဲ မရှိပါ';
  };

  // G-H3: a lab's date is its TEST date, not when the record was created.
  // The old code sorted/filtered labs by createdAt (parseRecordDate never
  // looked at testDate), so the "latest" lab and the timeframe filters
  // were wrong whenever a lab was entered late.
  const parseLabDate = (lab: any): Date => {
    const raw = lab?.testDate || lab?.recordedAt || lab?.createdAt;
    if (!raw) return new Date(0);
    const d = new Date(raw);
    return isNaN(d.getTime()) ? new Date(0) : d;
  };

  // Lab records carry their date in testDate, not in date/timestamp.
  const formatLabDate = (lab: any): string => {
    if (lab?.testDate) {
      const d = new Date(lab.testDate);
      if (!Number.isNaN(d.getTime())) {
        return formatDateLabel(lab.testDate).date || lab.testDate;
      }
      return lab.testDate;
    }
    return formatRecordDate(lab);
  };

  // Does the latest lab have any of the legacy panel values this passport
  // actually renders? (urine/inflammatory panels exist in the type but are
  // not rendered here, so they do not count.)
  const hasAnyLabPanelValue = (lab: any): boolean => {
    if (!lab) return false;
    const panels = [lab.cbc, lab.glucose, lab.liver, lab.renal, lab.lipid, lab.thyroid, lab.urine, lab.inflammatory];
    return panels.some((p) => p && Object.values(p).some((v) => v !== undefined && v !== null && v !== ''));
  };

  // Filter and sort patient specific data (Newest first)
  const patientBP = [...bpRecords]
    .filter((r: any) => !currentPatient?.id || r.userId === currentPatient.id)
    .sort((a, b) => parseRecordDate(b).getTime() - parseRecordDate(a).getTime());

  const patientSugar = [...glucoseRecords]
    .filter((r: any) => !currentPatient?.id || r.userId === currentPatient.id)
    .sort((a, b) => parseRecordDate(b).getTime() - parseRecordDate(a).getTime());

  const patientBMI = [...bmiRecords]
    .filter((r: any) => !currentPatient?.id || r.userId === currentPatient.id)
    .sort((a, b) => parseRecordDate(b).getTime() - parseRecordDate(a).getTime());

  const patientLabs = [...labRecords]
    .filter((r: any) => !currentPatient?.id || r.userId === currentPatient.id)
    // G-H3: sorted by TEST date, not creation date.
    .sort((a, b) => parseLabDate(b).getTime() - parseLabDate(a).getTime());

  const patientMeds = medications.filter((r: any) => (!currentPatient?.id || r.userId === currentPatient.id) && r.status === 'active');
  // G-H4: vaccines were entirely absent from the passport.
  const patientVaccines = [...vaccineRecords]
    .filter((r: any) => !currentPatient?.id || r.userId === currentPatient.id)
    .sort((a, b) => parseRecordDate(b).getTime() - parseRecordDate(a).getTime());
  const patientAdvices = doctorAdvices.filter((r: any) => !currentPatient?.id || r.userId === currentPatient.id);
  const patientQuestions = doctorQuestions.filter((r: any) => (!currentPatient?.id || r.userId === currentPatient.id) && r.status === 'answered');

  // Compute Latest Single Readings for Top Overview
  const latestBP = patientBP[0];
  const latestSugar = patientSugar[0];
  const latestBMI = patientBMI[0];

  // v2.4.19: the passport BMI summary falls back to the person's profile
  // height/weight when they have no BMI record — a record always wins.
  // The fallback is labelled "Profile အရ" and never carries a measurement
  // date. A family member carries no height/weight, so a member view has
  // no profile fallback (never borrow the owner's profile).
  const passportBmiProfileWeightKg = isFamilyMemberView ? undefined : (selectedPatient?.weightKg ?? profile?.weightKg);
  const passportBmiProfileHeightCm = isFamilyMemberView ? undefined : (selectedPatient?.heightCm ?? profile?.heightCm);
  const passportBmi = resolveBMIDisplay({
    record: latestBMI ?? null,
    profileWeightKg: passportBmiProfileWeightKg ?? null,
    profileHeightCm: passportBmiProfileHeightCm ?? null,
    age: patientAge ?? null,
  });
  const passportBmiWeightKg = passportBmi?.record?.weightKg ?? passportBmiProfileWeightKg;
  const passportBmiHeightCm = passportBmi?.record?.heightCm ?? passportBmiProfileHeightCm;
  const latestLab = patientLabs[0];

  // Time boundaries for 1 Month, 3 Months, 6 Months
  const now = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setDate(now.getDate() - 30);
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setDate(now.getDate() - 90);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setDate(now.getDate() - 180);

  // Timeframe calculation for BP
  const bp1m = patientBP.filter(r => parseRecordDate(r) >= oneMonthAgo);
  const bp3m = patientBP.filter(r => parseRecordDate(r) >= threeMonthsAgo);
  const bp6m = patientBP.filter(r => parseRecordDate(r) >= sixMonthsAgo);

  const calcBPAvg = (records: any[]) => {
    if (records.length === 0) return null;
    const avgSys = Math.round(records.reduce((acc, r) => acc + (r.systolic || 0), 0) / records.length);
    const avgDia = Math.round(records.reduce((acc, r) => acc + (r.diastolic || 0), 0) / records.length);
    const avgPulse = Math.round(records.reduce((acc, r) => acc + (r.pulseRate || r.pulse || 72), 0) / records.length);
    return { avgSys, avgDia, avgPulse, count: records.length };
  };

  const bpStats1m = calcBPAvg(bp1m);
  const bpStats3m = calcBPAvg(bp3m);
  const bpStats6m = calcBPAvg(bp6m);

  // Timeframe calculation for Glucose
  const sugar1m = patientSugar.filter(r => parseRecordDate(r) >= oneMonthAgo);
  const sugar3m = patientSugar.filter(r => parseRecordDate(r) >= threeMonthsAgo);
  const sugar6m = patientSugar.filter(r => parseRecordDate(r) >= sixMonthsAgo);

  const calcSugarAvg = (records: any[]) => {
    if (records.length === 0) return null;
    const values = records.map(r => r.glucoseValue || r.value || 0).filter(v => v > 0);
    if (values.length === 0) return null;
    const avg = Math.round(values.reduce((acc, v) => acc + v, 0) / values.length);
    return { avg, count: records.length };
  };

  const sugarStats1m = calcSugarAvg(sugar1m);
  const sugarStats3m = calcSugarAvg(sugar3m);
  const sugarStats6m = calcSugarAvg(sugar6m);

  // Timeframe calculation for BMI
  const bmi1m = patientBMI.filter(r => parseRecordDate(r) >= oneMonthAgo);
  const bmi3m = patientBMI.filter(r => parseRecordDate(r) >= threeMonthsAgo);
  const bmi6m = patientBMI.filter(r => parseRecordDate(r) >= sixMonthsAgo);

  const calcBMIAvg = (records: any[]) => {
    if (records.length === 0) return null;
    const avgBmi = (records.reduce((acc, r) => acc + (r.bmi || 0), 0) / records.length).toFixed(1);
    const avgWeight = (records.reduce((acc, r) => acc + (r.weightKg || 0), 0) / records.length).toFixed(1);
    return { avgBmi, avgWeight, count: records.length };
  };

  const bmiStats1m = calcBMIAvg(bmi1m);
  const bmiStats3m = calcBMIAvg(bmi3m);
  const bmiStats6m = calcBMIAvg(bmi6m);

  // Filtered tables by selected timeframe — G-H2: when printing, the
  // timeframe filter is ignored so the printout always holds everything.
  // Labs are filtered by TEST date (G-H3), not creation date.
  const effectiveTimeframe = printMode ? 'all' : historyTimeframe;
  const effectiveDisplayMode = printMode ? 'both' : displayMode;
  const getFilteredRecords = (records: any[], dateOf: (r: any) => Date = parseRecordDate) => {
    if (effectiveTimeframe === '1m') return records.filter(r => dateOf(r) >= oneMonthAgo);
    if (effectiveTimeframe === '3m') return records.filter(r => dateOf(r) >= threeMonthsAgo);
    if (effectiveTimeframe === '6m') return records.filter(r => dateOf(r) >= sixMonthsAgo);
    return records;
  };

  const displayedBP = getFilteredRecords(patientBP);
  const displayedSugar = getFilteredRecords(patientSugar);
  const displayedBMI = getFilteredRecords(patientBMI);
  const displayedLabs = getFilteredRecords(patientLabs, parseLabDate);
  const displayedVaccines = getFilteredRecords(patientVaccines);

  // v2.4.18: desktop-only Print. window.print() is called only after the
  // full (printMode) view has rendered, and printMode is cleared once the
  // print dialog closes (window.print() blocks until then on desktop).
  // This button is never rendered in standalone PWA mode (see header),
  // where window.print() silently does nothing.
  const handlePrint = () => {
    setPrintMode(true);
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.print();
        setPrintMode(false);
      }, 150);
    });
  };

  // v2.4.18: the PRIMARY output — a real PDF file. Sets printMode so the
  // capture holds ALL sections and rows (G-H2), waits for the full
  // content to render, captures #printable-health-passport at its full
  // scroll height (not the visible slice of the scroll container), then
  // shares (mobile share sheet) or downloads it. Honest toasts only:
  // success names the file, any failure says so, a dismissed share
  // sheet is neither.
  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    const element = document.getElementById('printable-health-passport');
    if (!element) {
      showToast('PDF ထုတ်ရန် အကြောင်းအရာ မတွေ့ပါ — ပြန်ကြိုးစားပါ။', 'error');
      return;
    }
    const filename = buildPdfFilename('health-passport', patientName);
    setIsGeneratingPdf(true);
    // Expand every scroll container for the capture: the print stylesheet
    // only does this under @media print, which a screen capture ignores.
    element.classList.add('pdf-capture');
    setPrintMode(true);
    try {
      const result = await exportElementToPdf(element, { filename });
      if (result.outcome === 'cancelled') return;
      showToast(
        result.outcome === 'shared'
          ? `PDF ဖိုင် (${result.filename}) ထုတ်ပြီးပါပြီ — မျှဝေရန် ရွေးချယ်နိုင်ပါသည်။`
          : `PDF ဖိုင် (${result.filename}) ဒေါင်းလုဒ်ဆွဲပြီးပါပြီ။`,
        'success',
      );
    } catch {
      showToast('PDF ထုတ်ယူခြင်း မအောင်မြင်ပါ — အင်တာနက် ချိတ်ဆက်မှု စစ်ပြီး ပြန်ကြိုးစားပါ။', 'error');
    } finally {
      element.classList.remove('pdf-capture');
      setPrintMode(false);
      setIsGeneratingPdf(false);
    }
  };

  const printDate = formatDateLabel(Date.now()).date || new Date().toISOString().split('T')[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      showHeader={false}
      className="max-h-[90vh]"
    >
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-health-passport, #printable-health-passport * {
            visibility: visible;
          }
          #printable-health-passport {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
            /* G-H2: the on-screen scroll containers must not cut the
               printout off — unset their height/overflow for print. */
            overflow: visible !important;
            max-height: none !important;
          }
          #printable-health-passport .max-h-60 {
            max-height: none !important;
            overflow: visible !important;
          }
          #printable-health-passport .overflow-y-auto {
            overflow: visible !important;
          }
          .no-print {
            display: none !important;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
        /* v2.4.18: screen-capture rules for the PDF export. The print
           stylesheet above only applies under @media print, but the PDF
           capture renders on screen — so the same unsetting (full height,
           no inner scrollers, no on-screen toggles, static table headers)
           is applied while the .pdf-capture class is on the element. */
        .pdf-capture, .pdf-capture .max-h-60, .pdf-capture .overflow-y-auto {
          max-height: none !important;
          overflow: visible !important;
          height: auto !important;
        }
        .pdf-capture .no-print {
          display: none !important;
        }
        .pdf-capture thead {
          position: static !important;
        }
      `}</style>

      <div className="flex flex-col h-full overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-xs">
              <FileText className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">ကျန်းမာရေး အစီရင်ခံစာ PDF / Print Passport</h2>
              <p className="text-xs text-emerald-100">နောက်ဆုံးအခြေအနေနှင့် ၁ လ ၊ ၃ လ ၊ ၆ လ စာ သမိုင်းမှတ်တမ်း အပြည့်အစုံ</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* v2.4.18: PDF is the PRIMARY button on every device — it
                produces a real file, which window.print() cannot do in a
                phone PWA. Desktop Print stays only where it can work. */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <FileDown className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'PDF ထုတ်နေသည်…' : 'PDF ထုတ်မည်'}</span>
            </button>

            {!isStandalone && (
              <button
                type="button"
                onClick={handlePrint}
                title="ကွန်ပျူတာပေါ်တွင် Print ထုတ်ရန်"
                className="px-4 py-2 bg-white/10 text-white hover:bg-white/20 rounded-xl text-xs font-bold transition-all border border-white/20 flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print (ကွန်ပျူတာ)</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="ပိတ်မည်"
              className="p-2 rounded-xl text-emerald-100 hover:bg-emerald-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Passport Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 bg-white" id="printable-health-passport">
          
          {/* Header Banner for Printed Document */}
          <div className="border-b-2 border-emerald-600 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xl shrink-0">
                FHT
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Family Health Track</h1>
                <p className="text-xs text-slate-600 font-medium">
                  မိသားစု ကျန်းမာရေးနှင့် ဆေးမှတ်တမ်း အစီရင်ခံစာ (Medical Health Passport & Historical Trends)
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-600">
              <p><span className="font-semibold text-slate-800">ထုတ်ယူသည့်ရက်စွဲ:</span> {printDate}</p>
              <p><span className="font-semibold text-slate-800">စနစ် ID:</span> FHT-PASSPORT-{currentPatient?.id?.slice(0, 8) || 'GEN'}</p>
            </div>
          </div>

          {/* Patient Personal Information Card */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">အသုံးပြုသူ / အသုံးပြုသူအမည်</p>
              <p className="text-base font-extrabold text-slate-900">{patientName}</p>
              {isFamilyMemberView && (
                <p className="text-[11px] text-emerald-700 font-semibold">မိသားစုဝင် (ရွေးချယ်ထားသူ)</p>
              )}
            </div>

            <div>
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">အီးမေးလ် / သက်သေခံ</p>
              <p className="text-sm font-semibold text-slate-800 truncate">{patientEmail}</p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">အရေးပေါ် ဆက်သွယ်ရန်</p>
              <p className="text-sm font-bold text-rose-700 flex items-center gap-1">
                <PhoneCall className="w-3.5 h-3.5" />
                {emergencyContactDisplay}
              </p>
            </div>

            {/* G-H4: DOB / age were missing from the passport header. */}
            <div>
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">မွေးသက္ကရာဇ်</p>
              <p className="text-sm font-bold text-slate-800">{patientDobLabel}</p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">အသက်</p>
              <p className="text-sm font-bold text-slate-800">{patientAge !== null && patientAge !== undefined ? `${patientAge} နှစ်` : 'မထည့်ရသေးပါ'}</p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">သွေးအမျိုးအစား</p>
              <p className="text-sm font-bold text-slate-800">
                {bloodTypeValue || 'မထည့်ရသေးပါ'}
                {bloodTypeSource === 'emergency' && <span className="block text-[11px] font-semibold text-slate-500">{epSourceNote}</span>}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">နာတာရှည် ရောဂါများ</p>
              <p className="text-sm font-semibold text-slate-800">
                {conditionsValue.length > 0
                  ? conditionsValue.join(', ')
                  : 'မရှိပါ / မထည့်ရသေးပါ'}
                {conditionsSource === 'emergency' && <span className="block text-[11px] font-semibold text-slate-500">{epSourceNote}</span>}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">ဓာတ်မတည့်သည်များ (Allergies)</p>
              <p className="text-sm font-bold text-amber-700">
                {allergiesValue.length > 0
                  ? allergiesValue.join(', ')
                  : 'မရှိပါ / မထည့်ရသေးပါ'}
                {allergiesSource === 'emergency' && <span className="block text-[11px] font-semibold text-slate-500">{epSourceNote}</span>}
              </p>
            </div>
          </div>

          {/* SECTION 1: Latest Vital Signs at a Glance (နောက်ဆုံး တိုင်းတာချက်များ အနှစ်ချုပ်) */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>၁။ လက်ရှိ နောက်ဆုံး တိုင်းတာချက်များ (Latest Vital Signs at a Glance)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* BP Summary */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                  <span>နောက်ဆုံး သွေးပေါင်ချိန်</span>
                  <span className="text-[11px] text-slate-400">{latestBP ? formatRecordDate(latestBP) : '-'}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-rose-600">
                    {latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : '--/--'}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">mmHg</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-2 font-medium">
                  {latestBP 
                    ? (latestBP.pulseRate || latestBP.pulse ? `နှလုံးခုန်နှုန်း: ${latestBP.pulseRate || latestBP.pulse} bpm` : (latestBP.category ? `အဆင့်: ${latestBP.category}` : 'နှလုံးခုန်နှုန်း မထည့်ရသေးပါ'))
                    : 'မှတ်တမ်းမရှိသေးပါ'}
                </p>
              </div>

              {/* Glucose Summary */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                  <span>နောက်ဆုံး ဆီးချို/သွေးချို</span>
                  <span className="text-[11px] text-slate-400">{latestSugar ? formatRecordDate(latestSugar) : '-'}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-600">
                    {latestSugar ? `${latestSugar.glucoseValue || latestSugar.value}` : '--'}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">mg/dL</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-2 font-medium">
                  {latestSugar 
                    ? (latestSugar.hba1c ? `HbA1c: ${latestSugar.hba1c}%` : latestSugar.status ? `အဆင့်: ${latestSugar.status}` : latestSugar.timing === 'fasting' ? 'မနက်စာမစားမီ စစ်ဆေးချက်' : 'အဆင့် မထည့်ရသေးပါ')
                    : 'မှတ်တမ်းမရှိသေးပါ'}
                </p>
              </div>

              {/* BMI Summary */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                  <span>ကိုယ်အလေးချိန် & BMI</span>
                  <span className="text-[11px] text-slate-400">{passportBmi?.record ? formatRecordDate(passportBmi.record) : '-'}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-teal-600">
                    {passportBmi ? passportBmi.eval.bmi.toFixed(1) : '--'}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">kg/m²</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-2 font-medium">
                  {passportBmi ? `အလေးချိန်: ${passportBmiWeightKg} kg | အရပ်: ${passportBmiHeightCm} cm${passportBmi.source === 'profile' ? ' (Profile အရ)' : ''}` : 'မှတ်တမ်းမရှိသေး'}
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 2: Historical Trends Summary (၁ လ ၊ ၃ လ ၊ ၆ လ စာ ကျန်းမာရေး အနှစ်ချုပ်နှင့် ပျမ်းမျှတန်ဖိုးများ) */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  ၂။ ၁ လ ၊ ၃ လ ၊ ၆ လ စာ ကျန်းမာရေး အနှစ်ချုပ်နှင့် နှိုင်းယှဉ်ချက် (Historical Trends Overview)
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                ဆရာဝန် ကြည့်ရှုလွယ်ကူစေရန် ကာလအလိုက် ပျမ်းမျှတန်ဖိုးများ
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* 1 Month Summary Card */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
                <div className="flex items-center justify-between font-bold text-slate-900 pb-1.5 border-b border-slate-100">
                  <span className="text-emerald-700">နောက်ဆုံး ၁ လအတွင်း</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">1 Month</span>
                </div>
                <div className="space-y-1.5 text-slate-700">
                  <p className="flex justify-between">
                    <span>သွေးပေါင်ချိန် ပျမ်းမျှ:</span>
                    <strong className="text-rose-600">
                      {bpStats1m ? `${bpStats1m.avgSys}/${bpStats1m.avgDia} mmHg (${bpStats1m.count} ကြိမ်)` : 'မှတ်တမ်းမရှိ'}
                    </strong>
                  </p>
                  <p className="flex justify-between">
                    <span>သွေးချို ပျမ်းမျှ:</span>
                    <strong className="text-emerald-600">
                      {sugarStats1m ? `${sugarStats1m.avg} mg/dL (${sugarStats1m.count} ကြိမ်)` : 'မှတ်တမ်းမရှိ'}
                    </strong>
                  </p>
                  <p className="flex justify-between">
                    <span>BMI ပျမ်းမျှ:</span>
                    <strong className="text-teal-600">
                      {bmiStats1m ? `${bmiStats1m.avgBmi} (${bmiStats1m.avgWeight} kg)` : 'မှတ်တမ်းမရှိ'}
                    </strong>
                  </p>
                </div>
              </div>

              {/* 3 Months Summary Card */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
                <div className="flex items-center justify-between font-bold text-slate-900 pb-1.5 border-b border-slate-100">
                  <span className="text-indigo-700">နောက်ဆုံး ၃ လအတွင်း</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">3 Months</span>
                </div>
                <div className="space-y-1.5 text-slate-700">
                  <p className="flex justify-between">
                    <span>သွေးပေါင်ချိန် ပျမ်းမျှ:</span>
                    <strong className="text-rose-600">
                      {bpStats3m ? `${bpStats3m.avgSys}/${bpStats3m.avgDia} mmHg (${bpStats3m.count} ကြိမ်)` : 'မှတ်တမ်းမရှိ'}
                    </strong>
                  </p>
                  <p className="flex justify-between">
                    <span>သွေးချို ပျမ်းမျှ:</span>
                    <strong className="text-emerald-600">
                      {sugarStats3m ? `${sugarStats3m.avg} mg/dL (${sugarStats3m.count} ကြိမ်)` : 'မှတ်တမ်းမရှိ'}
                    </strong>
                  </p>
                  <p className="flex justify-between">
                    <span>BMI ပျမ်းမျှ:</span>
                    <strong className="text-teal-600">
                      {bmiStats3m ? `${bmiStats3m.avgBmi} (${bmiStats3m.avgWeight} kg)` : 'မှတ်တမ်းမရှိ'}
                    </strong>
                  </p>
                </div>
              </div>

              {/* 6 Months Summary Card */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
                <div className="flex items-center justify-between font-bold text-slate-900 pb-1.5 border-b border-slate-100">
                  <span className="text-purple-700">နောက်ဆုံး ၆ လအတွင်း</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">6 Months</span>
                </div>
                <div className="space-y-1.5 text-slate-700">
                  <p className="flex justify-between">
                    <span>သွေးပေါင်ချိန် ပျမ်းမျှ:</span>
                    <strong className="text-rose-600">
                      {bpStats6m ? `${bpStats6m.avgSys}/${bpStats6m.avgDia} mmHg (${bpStats6m.count} ကြိမ်)` : 'မှတ်တမ်းမရှိ'}
                    </strong>
                  </p>
                  <p className="flex justify-between">
                    <span>သွေးချို ပျမ်းမျှ:</span>
                    <strong className="text-emerald-600">
                      {sugarStats6m ? `${sugarStats6m.avg} mg/dL (${sugarStats6m.count} ကြိမ်)` : 'မှတ်တမ်းမရှိ'}
                    </strong>
                  </p>
                  <p className="flex justify-between">
                    <span>BMI ပျမ်းမျှ:</span>
                    <strong className="text-teal-600">
                      {bmiStats6m ? `${bmiStats6m.avgBmi} (${bmiStats6m.avgWeight} kg)` : 'မှတ်တမ်းမရှိ'}
                    </strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Detailed Historical Data, Trend Graphs & Logs */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  ၃။ ရက်စွဲအလိုက် စစ်ဆေးတိုင်းတာမှု သမိုင်းမှတ်တမ်းနှင့် Trend Graph များ (Historical Data & Trend Charts)
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2 no-print">
                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setDisplayMode('both')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      displayMode === 'both' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📊 Graph & Table (နှစ်မျိုးလုံး)
                  </button>
                  <button
                    onClick={() => setDisplayMode('graph')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      displayMode === 'graph' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📈 Graph သာ
                  </button>
                  <button
                    onClick={() => setDisplayMode('table')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      displayMode === 'table' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📋 Table ဇယားသာ
                  </button>
                </div>

                {/* Timeframe Filter Tabs */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setHistoryTimeframe('all')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      historyTimeframe === 'all' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    မှတ်တမ်းအားလုံး
                  </button>
                  <button
                    onClick={() => setHistoryTimeframe('1m')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      historyTimeframe === '1m' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ၁ လ
                  </button>
                  <button
                    onClick={() => setHistoryTimeframe('3m')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      historyTimeframe === '3m' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ၃ လ
                  </button>
                  <button
                    onClick={() => setHistoryTimeframe('6m')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      historyTimeframe === '6m' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ၆ လ
                  </button>
                </div>
              </div>
            </div>

            {/* Visual Trend Graphs (Rendered when displayMode === 'both' or 'graph', and in print) */}
            {(effectiveDisplayMode === 'both' || effectiveDisplayMode === 'graph') && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <BarChart2 className="w-4 h-4 text-emerald-600" />
                  <span>ကာလအလိုက် ပြောင်းလဲမှု Trend Graphs (Visual Curves & Target Zones):</span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {displayedBP.length > 0 && (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                      <BloodPressureChart records={displayedBP} />
                    </div>
                  )}

                  {displayedSugar.length > 0 && (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                      <BloodSugarChart records={displayedSugar} />
                    </div>
                  )}

                  {displayedBMI.length > 0 && (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                      <BMIWeightChart records={displayedBMI} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Detailed Data Table Logs (Rendered when displayMode === 'both' or 'table', and in print) */}
            {(effectiveDisplayMode === 'both' || effectiveDisplayMode === 'table') && (
              <div className="space-y-4">
                {(effectiveDisplayMode === 'both') && (
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200 mt-2">
                    <Table className="w-4 h-4 text-emerald-600" />
                    <span>ရက်စွဲအလိုက် အသေးစိတ် စစ်ဆေးတိုင်းတာချက် ဇယားများ (Data Table Logs):</span>
                  </div>
                )}

                {/* Blood Pressure Historical Log Table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  <div className="bg-rose-50 px-3.5 py-2 font-bold text-rose-950 flex items-center justify-between border-b border-rose-200">
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-rose-600" />
                      <span>သွေးပေါင်ချိန် သမိုင်းမှတ်တမ်း (Blood Pressure Log - {displayedBP.length} ကြိမ်)</span>
                    </span>
                    <span className="text-[11px] text-rose-700 font-semibold">mmHg / bpm</span>
                  </div>
                  {displayedBP.length === 0 ? (
                    <p className="p-3 text-slate-500 italic bg-white">ဤကာလအတွင်း သွေးပေါင်ချိန် မှတ်တမ်း မရှိပါ။</p>
                  ) : (
                    <div className="max-h-60 overflow-y-auto overflow-x-auto">
                      <table className="w-full min-w-[560px] text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                          <tr>
                            <th className="p-2.5">ရက်စွဲ</th>
                            <th className="p-2.5">သွေးပေါင်ချိန် (BP)</th>
                            <th className="p-2.5">နှလုံးခုန် (Pulse)</th>
                            <th className="p-2.5">အဆင့်</th>
                            <th className="p-2.5">စားသုံးခဲ့သော အစားအသောက် / မှတ်ချက်</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-800 bg-white">
                          {displayedBP.map((r: any) => {
                            const diet = r.dietRecord || r.dietNotes || r.foodIntake;
                            return (
                              <tr key={r.id}>
                                <td className="p-2.5 whitespace-nowrap text-slate-600 font-semibold">{formatRecordDate(r)}</td>
                                <td className="p-2.5 font-bold text-rose-600">{r.systolic} / {r.diastolic} mmHg</td>
                                <td className="p-2.5">{r.pulseRate || r.pulse || '-'} bpm</td>
                                <td className="p-2.5">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                    {r.category || (r.systolic >= 140 || r.diastolic >= 90 ? 'သွေးတိုး' : 'ပုံမှန်')}
                                  </span>
                                </td>
                                <td className="p-2.5 text-slate-700 text-[11px] max-w-[200px]">
                                  {diet && (
                                    <span className="block font-semibold text-amber-800">
                                      🍲 {diet}
                                    </span>
                                  )}
                                  <span className="text-slate-500">{r.notes || (!diet ? '-' : '')}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Blood Sugar Historical Log Table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  <div className="bg-emerald-50 px-3.5 py-2 font-bold text-emerald-950 flex items-center justify-between border-b border-emerald-200">
                    <span className="flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ဆီးချို/သွေးချို သမိုင်းမှတ်တမ်း (Blood Sugar Log - {displayedSugar.length} ကြိမ်)</span>
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold">mg/dL</span>
                  </div>
                  {displayedSugar.length === 0 ? (
                    <p className="p-3 text-slate-500 italic bg-white">ဤကာလအတွင်း သွေးချို မှတ်တမ်း မရှိပါ။</p>
                  ) : (
                    <div className="max-h-60 overflow-y-auto overflow-x-auto">
                      <table className="w-full min-w-[560px] text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                          <tr>
                            <th className="p-2.5">ရက်စွဲ</th>
                            <th className="p-2.5">သွေးသကြားဓာတ်</th>
                            <th className="p-2.5">စစ်ဆေးချိန် (Timing)</th>
                            <th className="p-2.5">အဆင့်</th>
                            <th className="p-2.5">စားသုံးခဲ့သော အစားအသောက် / မှတ်ချက်</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-800 bg-white">
                          {displayedSugar.map((r: any) => {
                            const diet = r.dietRecord || r.dietNotes || r.foodIntake;
                            return (
                              <tr key={r.id}>
                                <td className="p-2.5 whitespace-nowrap text-slate-600 font-semibold">{formatRecordDate(r)}</td>
                                <td className="p-2.5 font-bold text-emerald-700">{r.glucoseValue || r.value} mg/dL</td>
                                <td className="p-2.5">
                                  {r.timing === 'fasting' ? 'မနက်စာမစားမီ (Fasting)' : 
                                   r.timing === 'post_meal_2h' || r.timing === 'post_prandial' ? 'အစာစားပြီး ၂ နာရီ' : 
                                   r.timing === 'random' ? 'ကျပန်းစစ်ဆေးမှု' : (r.timing || 'မထည့်ရသေးပါ')}
                                </td>
                                <td className="p-2.5">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    {r.status || 'မထည့်ရသေးပါ'}
                                  </span>
                                </td>
                                <td className="p-2.5 text-slate-700 text-[11px] max-w-[200px]">
                                  {diet && (
                                    <span className="block font-semibold text-emerald-800">
                                      🥗 {diet}
                                    </span>
                                  )}
                                  <span className="text-slate-500">{r.notes || r.mealInfo || (!diet ? '-' : '')}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* BMI & Weight Historical Log Table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  <div className="bg-teal-50 px-3.5 py-2 font-bold text-teal-950 flex items-center justify-between border-b border-teal-200">
                    <span className="flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-teal-600" />
                      <span>ကိုယ်အလေးချိန်နှင့် BMI သမိုင်းမှတ်တမ်း (Weight & BMI Log - {displayedBMI.length} ကြိမ်)</span>
                    </span>
                    <span className="text-[11px] text-teal-700 font-semibold">kg / kg/m²</span>
                  </div>
                  {displayedBMI.length === 0 ? (
                    <p className="p-3 text-slate-500 italic bg-white">ဤကာလအတွင်း ကိုယ်အလေးချိန် မှတ်တမ်း မရှိပါ။</p>
                  ) : (
                    <div className="max-h-60 overflow-y-auto overflow-x-auto">
                      <table className="w-full min-w-[560px] text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                          <tr>
                            <th className="p-2.5">ရက်စွဲ</th>
                            <th className="p-2.5">ကိုယ်အလေးချိန်</th>
                            <th className="p-2.5">အရပ်</th>
                            <th className="p-2.5">BMI</th>
                            <th className="p-2.5">အဆင့်</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-800 bg-white">
                          {displayedBMI.map((r: any) => (
                            <tr key={r.id}>
                              <td className="p-2.5 whitespace-nowrap text-slate-600 font-semibold">{formatRecordDate(r)}</td>
                              <td className="p-2.5 font-bold text-slate-900">{r.weightKg} kg</td>
                              <td className="p-2.5">{r.heightCm} cm</td>
                              <td className="p-2.5 font-bold text-teal-600">{r.bmi.toFixed(1)}</td>
                              <td className="p-2.5">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                                  {r.category === 'normal' ? 'ပုံမှန်' : r.category === 'overweight' ? 'အဝလွန်' : (r.category || 'မထည့်ရသေးပါ')}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Active Medications List */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Pill className="w-4 h-4 text-sky-600" />
              <span>၄။ လက်ရှိ သောက်သုံးနေသော ဆေးဝါးများ (Active Medications)</span>
            </h3>

            {patientMeds.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl">
                လက်ရှိ သောက်သုံးနေသော ဆေးဝါးမှတ်တမ်း ထည့်သွင်းထားခြင်း မရှိသေးပါ။
              </p>
            ) : (
              <div className="border border-slate-200 rounded-2xl overflow-x-auto text-xs">
                <table className="w-full min-w-[560px] text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">ဆေးအမည်</th>
                      <th className="p-2.5">ပမာဏ (Dosage)</th>
                      <th className="p-2.5">သောက်သုံးရန် သက်မှတ်ချက်</th>
                      <th className="p-2.5">အချိန်</th>
                      <th className="p-2.5">ညွှန်ကြားသူ ဆရာဝန်</th>
                      {/* G-M4: a medication row without a date cannot be
                          placed in time — show the start date, or say so. */}
                      <th className="p-2.5">စတင်သည့်ရက်စွဲ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                    {patientMeds.map((m) => (
                      <tr key={m.id}>
                        <td className="p-2.5 font-bold text-slate-900">{m.name}</td>
                        <td className="p-2.5">{m.dosage}</td>
                        <td className="p-2.5">{m.frequency}</td>
                        <td className="p-2.5">{m.timing === 'before_meal' ? 'အစာမစားမီ' : 'အစာစားပြီး'}</td>
                        <td className="p-2.5">{m.prescribingDoctor || 'မထည့်ရသေးပါ'}</td>
                        <td className="p-2.5 whitespace-nowrap text-slate-600 font-semibold">
                          {m.startDate ? (formatDateLabel(m.startDate).date || m.startDate) : 'ရက်စွဲ မရှိပါ'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Latest Lab Tests */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2 border-b border-slate-200 pb-2">
              <FlaskConical className="w-4 h-4 text-purple-600" />
              <span>၅။ ဓာတ်ခွဲခန်း စစ်ဆေးချက်မှတ်တမ်း (Recent Lab Results)</span>
            </h3>

            {latestLab ? (
              <div className="bg-purple-50/50 border border-purple-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {/* Current-format tests[] (the format labs are saved in now) */}
                {latestLab.tests && latestLab.tests.length > 0 && (
                  <div className="sm:col-span-2 lg:col-span-3">
                    <p className="font-bold text-purple-900 border-b border-purple-200 pb-1 mb-1">
                      စစ်ဆေးချက် ရလဒ်များ (Lab Tests) — {formatLabDate(latestLab)}
                    </p>
                    <div className="space-y-0.5">
                      {latestLab.tests.map((t: any) => (
                        <p key={t.id}>
                          {t.nameMm || t.nameEn || t.id}: <strong>{t.value} {t.unit || ''}</strong>
                          {t.refRangeText ? ` (စံ: ${t.refRangeText})` : (t.refMin !== undefined && t.refMax !== undefined ? ` (စံ: ${t.refMin} - ${t.refMax} ${t.unit || ''})` : '')}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* CBC if available */}
                {(latestLab.cbc?.hemoglobin !== undefined || latestLab.cbc?.wbc !== undefined || latestLab.cbc?.platelets !== undefined) && (
                  <div>
                    <p className="font-bold text-purple-900 border-b border-purple-200 pb-1 mb-1">
                      သွေးဆဲလ်အစုံ (CBC)
                    </p>
                    {latestLab.cbc?.hemoglobin !== undefined && <p>Hb (သွေးအား): <strong>{latestLab.cbc.hemoglobin} g/dL</strong> (Ref: 12 - 17)</p>}
                    {latestLab.cbc?.wbc !== undefined && <p>WBC (သွေးဖြူဥ): <strong>{latestLab.cbc.wbc} /µL</strong> (Ref: 4,000 - 11,000)</p>}
                    {latestLab.cbc?.platelets !== undefined && <p>Platelet (သွေးဥမွှား): <strong>{latestLab.cbc.platelets} /µL</strong> (Ref: 150k - 450k)</p>}
                  </div>
                )}

                {/* Glucose if available */}
                {(latestLab.glucose?.fbs !== undefined || latestLab.glucose?.hba1c !== undefined) && (
                  <div>
                    <p className="font-bold text-purple-900 border-b border-purple-200 pb-1 mb-1">
                      သွေးချို/သကြားဓာတ် (Glucose & HbA1c)
                    </p>
                    {latestLab.glucose?.fbs !== undefined && <p>FBS: <strong>{latestLab.glucose.fbs} mg/dL</strong> (Ref: 70 - 99)</p>}
                    {latestLab.glucose?.hba1c !== undefined && <p>HbA1c: <strong>{latestLab.glucose.hba1c} %</strong> (Ref: &lt; 5.7)</p>}
                  </div>
                )}

                {/* Liver */}
                {(latestLab.liver?.alt_sgpt !== undefined || latestLab.liver?.ast_sgot !== undefined || latestLab.liver?.alt !== undefined || latestLab.liver?.ast !== undefined) && (
                  <div>
                    <p className="font-bold text-purple-900 border-b border-purple-200 pb-1 mb-1">
                      အသည်းလုပ်ဆောင်ချက် (Liver Function)
                    </p>
                    {(latestLab.liver?.alt_sgpt !== undefined || latestLab.liver?.alt !== undefined) && (
                      <p>ALT (SGPT): <strong>{latestLab.liver.alt_sgpt ?? latestLab.liver.alt} U/L</strong> (Ref: 7 - 56)</p>
                    )}
                    {(latestLab.liver?.ast_sgot !== undefined || latestLab.liver?.ast !== undefined) && (
                      <p>AST (SGOT): <strong>{latestLab.liver.ast_sgot ?? latestLab.liver.ast} U/L</strong> (Ref: 10 - 40)</p>
                    )}
                  </div>
                )}

                {/* Renal */}
                {(latestLab.renal?.creatinine !== undefined || latestLab.renal?.uricAcid !== undefined) && (
                  <div>
                    <p className="font-bold text-purple-900 border-b border-purple-200 pb-1 mb-1">
                      ကျောက်ကပ်နှင့် ဂေါက် (Renal & Uric Acid)
                    </p>
                    {latestLab.renal?.creatinine !== undefined && (
                      <p>Creatinine: <strong>{latestLab.renal.creatinine} mg/dL</strong> (Ref: 0.6 - 1.2)</p>
                    )}
                    {latestLab.renal?.uricAcid !== undefined && (
                      <p>Uric Acid: <strong>{latestLab.renal.uricAcid} mg/dL</strong> (Ref: 3.5 - 7.2)</p>
                    )}
                  </div>
                )}

                {/* Lipid */}
                {(latestLab.lipid?.totalCholesterol !== undefined || latestLab.lipid?.triglycerides !== undefined) && (
                  <div>
                    <p className="font-bold text-purple-900 border-b border-purple-200 pb-1 mb-1">
                      သွေးတွင်းအဆီဓာတ် (Lipid Profile)
                    </p>
                    {latestLab.lipid?.totalCholesterol !== undefined && (
                      <p>Cholesterol: <strong>{latestLab.lipid.totalCholesterol} mg/dL</strong> (Ref: &lt; 200)</p>
                    )}
                    {latestLab.lipid?.triglycerides !== undefined && (
                      <p>Triglyceride: <strong>{latestLab.lipid.triglycerides} mg/dL</strong> (Ref: &lt; 150)</p>
                    )}
                  </div>
                )}

                {/* Thyroid */}
                {(latestLab.thyroid?.tsh !== undefined || latestLab.thyroid?.ft4 !== undefined) && (
                  <div>
                    <p className="font-bold text-purple-900 border-b border-purple-200 pb-1 mb-1">
                      သိုင်းရွိုက်ဟော်မုန်း (TFT)
                    </p>
                    {latestLab.thyroid?.tsh !== undefined && (
                      <p>TSH: <strong>{latestLab.thyroid.tsh} µIU/mL</strong> (Ref: 0.4 - 4.0)</p>
                    )}
                    {latestLab.thyroid?.ft4 !== undefined && (
                      <p>FT4: <strong>{latestLab.thyroid.ft4} ng/dL</strong> (Ref: 0.8 - 1.8)</p>
                    )}
                  </div>
                )}

                {/* G-M3: Urine routine — existed in the type but was never
                    rendered in the passport. */}
                {(latestLab.urine?.protein !== undefined || latestLab.urine?.glucose !== undefined || latestLab.urine?.pusCells !== undefined || latestLab.urine?.rbc !== undefined || latestLab.urine?.epithelial !== undefined || latestLab.urine?.microalbumin !== undefined) && (
                  <div>
                    <p className="font-bold text-purple-900 border-b border-purple-200 pb-1 mb-1">
                      ဆီးစစ်ဆေးချက် (Urine Routine)
                    </p>
                    {latestLab.urine?.protein !== undefined && <p>Protein: <strong>{latestLab.urine.protein}</strong> (Ref: Negative)</p>}
                    {latestLab.urine?.glucose !== undefined && <p>Glucose: <strong>{latestLab.urine.glucose}</strong> (Ref: Negative)</p>}
                    {latestLab.urine?.pusCells !== undefined && <p>Pus Cells: <strong>{latestLab.urine.pusCells} /HPF</strong> (Ref: 0 - 5)</p>}
                    {latestLab.urine?.rbc !== undefined && <p>RBC: <strong>{latestLab.urine.rbc} /HPF</strong> (Ref: 0 - 2)</p>}
                    {latestLab.urine?.epithelial !== undefined && <p>Epithelial Cells: <strong>{latestLab.urine.epithelial} /HPF</strong> (Ref: 0 - 5)</p>}
                    {latestLab.urine?.microalbumin !== undefined && <p>Microalbumin: <strong>{latestLab.urine.microalbumin} mg/g Cr</strong> (Ref: &lt; 30)</p>}
                  </div>
                )}

                {/* G-M3: Inflammatory markers & vitamins — same, never rendered. */}
                {(latestLab.inflammatory?.crp !== undefined || latestLab.inflammatory?.ferritin !== undefined || latestLab.inflammatory?.vitaminD !== undefined || latestLab.inflammatory?.vitaminB12 !== undefined) && (
                  <div>
                    <p className="font-bold text-purple-900 border-b border-purple-200 pb-1 mb-1">
                      ရောင်ရမ်းမှုနှင့် ဗီတာမင် (Inflammatory & Vitamins)
                    </p>
                    {latestLab.inflammatory?.crp !== undefined && <p>CRP: <strong>{latestLab.inflammatory.crp} mg/L</strong> (Ref: &lt; 5.0)</p>}
                    {latestLab.inflammatory?.ferritin !== undefined && <p>Ferritin: <strong>{latestLab.inflammatory.ferritin} ng/mL</strong> (Ref: 20 - 250)</p>}
                    {latestLab.inflammatory?.vitaminD !== undefined && <p>Vitamin D: <strong>{latestLab.inflammatory.vitaminD} ng/mL</strong> (Ref: 30 - 100)</p>}
                    {latestLab.inflammatory?.vitaminB12 !== undefined && <p>Vitamin B12: <strong>{latestLab.inflammatory.vitaminB12} pg/mL</strong> (Ref: 200 - 900)</p>}
                  </div>
                )}
                {(!latestLab.tests?.length && !hasAnyLabPanelValue(latestLab)) && (
                  <p className="text-slate-500 italic sm:col-span-2 lg:col-span-3">စစ်ဆေးချက် အသေးစိတ် မရှိသေးပါ။</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl">
                ဓာတ်ခွဲခန်းစစ်ဆေးချက် အချက်အလက်များ ထည့်သွင်းထားခြင်း မရှိသေးပါ။
              </p>
            )}

            {/* Lab History Table — uses the filtered lab list (was computed but never rendered) */}
            <div className="mt-4 border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <div className="bg-purple-50 px-3.5 py-2 font-bold text-purple-950 flex items-center justify-between border-b border-purple-200">
                <span className="flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
                  <span>ဓာတ်ခွဲခန်း စစ်ဆေးချက် သမိုင်းမှတ်တမ်း (Lab History - {displayedLabs.length} ခု)</span>
                </span>
              </div>
              {displayedLabs.length === 0 ? (
                <p className="p-3 text-slate-500 italic bg-white">ဤကာလအတွင်း ဓာတ်ခွဲခန်း စစ်ဆေးချက် မှတ်တမ်း မရှိပါ။</p>
              ) : (
                <div className="max-h-60 overflow-y-auto overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="p-2.5">ရက်စွဲ</th>
                        <th className="p-2.5">ဓာတ်ခွဲခန်း</th>
                        <th className="p-2.5">စစ်ဆေးချက်</th>
                        <th className="p-2.5">ရလဒ်</th>
                        <th className="p-2.5">စံသတ်မှတ်ချက်</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800 bg-white">
                      {displayedLabs.flatMap((lab: any) => {
                        const tests = lab.tests || [];
                        if (tests.length === 0) {
                          return (
                            <tr key={lab.id}>
                              <td className="p-2.5 whitespace-nowrap text-slate-600 font-semibold">{formatLabDate(lab)}</td>
                              <td className="p-2.5">{lab.labName || '-'}</td>
                              <td className="p-2.5 text-slate-500">—</td>
                              <td className="p-2.5 text-slate-500">—</td>
                              <td className="p-2.5 text-slate-500">—</td>
                            </tr>
                          );
                        }
                        return tests.map((t: any) => (
                          <tr key={`${lab.id}-${t.id}`}>
                            <td className="p-2.5 whitespace-nowrap text-slate-600 font-semibold">{formatLabDate(lab)}</td>
                            <td className="p-2.5">{lab.labName || '-'}</td>
                            <td className="p-2.5 font-bold text-slate-900">{t.nameMm || t.nameEn || t.id}</td>
                            <td className="p-2.5 font-bold text-purple-700">{t.value} {t.unit || ''}</td>
                            <td className="p-2.5 text-slate-600">{t.refRangeText || (t.refMin !== undefined && t.refMax !== undefined ? `${t.refMin} - ${t.refMax} ${t.unit || ''}` : '-')}</td>
                          </tr>
                        ));
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Doctor Advice & Q&A Summary */}
          {(patientAdvices.length > 0 || patientQuestions.length > 0) && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2 border-b border-slate-200 pb-2">
                <Stethoscope className="w-4 h-4 text-indigo-600" />
                <span>၆။ ဆရာဝန် အကြံပြုချက်နှင့် လမ်းညွှန်ချက်များ (Doctor Consult Summary)</span>
              </h3>

              <div className="space-y-2 text-xs">
                {patientAdvices.map((a) => (
                  <div key={a.id} className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                    <div className="flex items-center justify-between font-bold text-indigo-950 mb-1">
                      <span>ဆရာဝန်: {a.doctorName}</span>
                      {/* G-M4: advice rows carry a date — formatted, or
                          'ရက်စွဲ မရှိပါ' when none was saved (D-M3). */}
                      <span>{a.date ? (formatDateLabel(a.date).date || a.date) : 'ရက်စွဲ မရှိပါ'}</span>
                    </div>
                    <p className="text-slate-800">{a.advice}</p>
                  </div>
                ))}

                {patientQuestions.map((q) => (
                  <div key={q.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                      <span>မေးခွန်း: {q.title}</span>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        {q.createdAt ? (formatDateLabel(q.createdAt).date || q.createdAt) : 'ရက်စွဲ မရှိပါ'}
                      </span>
                    </div>
                    <p className="text-slate-700 italic">"{q.doctorAnswer?.answerText}"</p>
                    <p className="text-[11px] text-slate-500 mt-1 font-semibold">
                      ဖြေကြားသူ: {q.doctorAnswer?.answeredBy} ({q.doctorAnswer?.answeredAt ? (formatDateLabel(q.doctorAnswer.answeredAt).date || q.doctorAnswer.answeredAt) : 'ရက်စွဲ မရှိပါ'})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* G-H4: Vaccines — entirely absent from the passport before. */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2 border-b border-slate-200 pb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>၇။ ကာကွယ်ဆေး ထိုးနှံမှု မှတ်တမ်း (Vaccination Records)</span>
            </h3>

            {displayedVaccines.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl">
                ကာကွယ်ဆေး ထိုးနှံမှု မှတ်တမ်း ထည့်သွင်းထားခြင်း မရှိသေးပါ။
              </p>
            ) : (
              <div className="border border-slate-200 rounded-2xl overflow-x-auto text-xs">
                <table className="w-full min-w-[560px] text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">ထိုးသည့်ရက်စွဲ</th>
                      <th className="p-2.5">ကာကွယ်ဆေး</th>
                      <th className="p-2.5">ကာကွယ်သည့်ရောဂါ</th>
                      <th className="p-2.5">အကြိမ်ရေ</th>
                      <th className="p-2.5">နောက်တစ်ကြိမ်</th>
                      <th className="p-2.5">အခြေအနေ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium text-slate-800 bg-white">
                    {displayedVaccines.map((v: any) => (
                      <tr key={v.id}>
                        <td className="p-2.5 whitespace-nowrap text-slate-600 font-semibold">
                          {v.dateAdministered ? (formatDateLabel(v.dateAdministered).date || v.dateAdministered) : 'ရက်စွဲ မရှိပါ'}
                        </td>
                        <td className="p-2.5 font-bold text-slate-900">{v.vaccineName || 'မထည့်ရသေးပါ'}</td>
                        <td className="p-2.5">{v.targetDisease || 'မထည့်ရသေးပါ'}</td>
                        <td className="p-2.5">{v.doseNumber != null ? `${v.doseNumber}${v.totalDoses != null ? `/${v.totalDoses}` : ''}` : 'မထည့်ရသေးပါ'}</td>
                        <td className="p-2.5 whitespace-nowrap">{v.nextDueDate ? (formatDateLabel(v.nextDueDate).date || v.nextDueDate) : 'မထည့်ရသေးပါ'}</td>
                        <td className="p-2.5">{v.status || 'မထည့်ရသေးပါ'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer Medical Disclaimer */}
          <div className="border-t border-slate-200 pt-4">
            <MedicalDisclaimer variant="print" />
          </div>

        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between no-print shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            A4 Size Layout ဖြင့် ပုံနှိပ်ထုတ်ယူရန် အဆင်သင့်ဖြစ်ပါသည်။
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ပိတ်မည် ✕
            </button>
            {!isStandalone && (
              <button
                onClick={handlePrint}
                title="ကွန်ပျူတာပေါ်တွင် Print ထုတ်ရန်"
                className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print (ကွန်ပျူတာ)</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </Modal>
  );
};

