import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Droplets, 
  FlaskConical, 
  Stethoscope,
  AlertTriangle, 
  Scale, 
  Calendar, 
  Users,
  BarChart2,
  Table,
  History,
  Loader2,
  TrendingUp,
  Clock,
  Heart,
  CheckCircle2,
  ChevronRight,
  Utensils
} from 'lucide-react';
import { useHealthData } from '../../context/HealthDataContext';
import { useAuth } from '../../context/AuthContext';
import { BloodPressureChart, BloodSugarChart, BMIWeightChart } from '../charts/HealthCharts';
import { 
  calculateBPCategory, 
  calculateGlucoseStatus, 
  calculateBMI, 
  calculateAge,
  parseDateToMs,
  formatDateLabel
} from '../../lib/medicalCalculations';

interface TrendsOverviewProps {
  onNavigateTab?: (tab: string) => void;
}

export const TrendsOverview: React.FC<TrendsOverviewProps> = ({ onNavigateTab }) => {
  const {
    allBPRecords,
    allGlucoseRecords,
    allBMIRecords,
    allLabRecords,
    allDoctorAdvices,
    ownBPRecords,
    ownGlucoseRecords,
    ownBMIRecords,
    ownLabRecords,
    selectedPatient,
    selectedPatientId,
    selectedFamilyMember,
    selectedFamilyMemberId,
    setSelectedPatientId,
    patientsList,
    dataLoading
  } = useHealthData();
  const { profile, currentUser, isAdmin } = useAuth();

  // WHOSE records does this screen show? (v2.4.16, E-H3/E-H4) Exactly ONE
  // named person — never a pooled "everyone" summary presented as one
  // person's log. Same rule as the Sidebar summary (v2.4.15):
  //   admin + patient selected -> that patient only
  //   family member selected  -> that member only
  //   anything else           -> the signed-in user's own records only
  // (covers admin with no patient selected AND family 'all' view, which
  // is labelled "ကိုယ်တိုင်" below). The admin filter bar therefore has
  // no "All Users" option: it selects exactly one person, default self.
  const isPatientView = isAdmin && !!selectedPatient;
  const isMemberView = !isAdmin && !!selectedFamilyMember;
  const viewName = isPatientView
    ? selectedPatient!.displayName
    : isMemberView
      ? selectedFamilyMember!.name
      : (profile?.displayName || 'အသုံးပြုသူ');
  const viewRoleLabel = isPatientView
    ? 'အသုံးပြုသူ'
    : isMemberView
      ? 'မိသားစုဝင်'
      : (selectedFamilyMemberId === 'all' ? 'ကိုယ်တိုင်' : null);
  const isPatientRecord = (r: { userId?: string; patientEmail?: string }): boolean =>
    !!selectedPatient && (r.userId === selectedPatient.id ||
      (!r.userId && !!selectedPatient.email && r.patientEmail === selectedPatient.email));
  const viewBPRecords = useMemo(() => isPatientView
    ? allBPRecords.filter(isPatientRecord)
    : isMemberView
      ? allBPRecords.filter(r => r.userId === selectedFamilyMember!.id)
      : ownBPRecords,
    [isPatientView, isMemberView, allBPRecords, ownBPRecords, selectedPatient, selectedFamilyMember]);
  const viewGlucoseRecords = useMemo(() => isPatientView
    ? allGlucoseRecords.filter(isPatientRecord)
    : isMemberView
      ? allGlucoseRecords.filter(r => r.userId === selectedFamilyMember!.id)
      : ownGlucoseRecords,
    [isPatientView, isMemberView, allGlucoseRecords, ownGlucoseRecords, selectedPatient, selectedFamilyMember]);
  const viewBMIRecords = useMemo(() => isPatientView
    ? allBMIRecords.filter(isPatientRecord)
    : isMemberView
      ? allBMIRecords.filter(r => r.userId === selectedFamilyMember!.id)
      : ownBMIRecords,
    [isPatientView, isMemberView, allBMIRecords, ownBMIRecords, selectedPatient, selectedFamilyMember]);
  const viewLabRecords = useMemo(() => isPatientView
    ? allLabRecords.filter(isPatientRecord)
    : isMemberView
      ? allLabRecords.filter(r => r.userId === selectedFamilyMember!.id)
      : ownLabRecords,
    [isPatientView, isMemberView, allLabRecords, ownLabRecords, selectedPatient, selectedFamilyMember]);
  const viewAdvices = useMemo(() => isPatientView
    ? allDoctorAdvices.filter(a => a.userId === selectedPatient!.id)
    : isMemberView
      ? allDoctorAdvices.filter(a => a.userId === selectedFamilyMember!.id)
      : allDoctorAdvices.filter(a => a.userId === currentUser?.uid),
    [isPatientView, isMemberView, allDoctorAdvices, selectedPatient, selectedFamilyMember, currentUser]);

  // A measurement date is shown only when the record actually HAS one —
  // never fall back to createdAt (the entry date) in display (D-M3).
  // createdAt is still used for sort keys only.
  const displayDate = (d?: string | null): string => (d ? formatDateLabel(d).date : 'ရက်စွဲ မရှိပါ');
  const recordDateTime = (r: { date?: string; timestamp?: string }): { date: string; time: string } =>
    (r.date || r.timestamp) ? formatDateLabel(r.date || r.timestamp) : { date: 'ရက်စွဲ မရှိပါ', time: '' };

  // Plain-language status words (same pattern as the Sidebar): the medical
  // category is kept in parentheses, but the words a user reads first are
  // plain — never jargon alone. A paediatric guard result shows the guard
  // label itself, never "ပုံမှန်ပါ".
  const plainBPStatus = (category: string): string => {
    switch (category) {
      case 'normal': return 'ပုံမှန်ပါ';
      case 'elevated': return 'အနည်းငယ် မြင့်နေပါတယ်';
      case 'stage1': return 'အနည်းငယ် မြင့်နေပါတယ်';
      case 'stage2': return 'တော်တော် မြင့်နေပါတယ်';
      case 'crisis': return 'အရမ်း မြင့်နေပါတယ် — ဆရာဝန်နှင့် အမြန်ပြပါ';
      default: return 'စစ်ဆေးရန် လိုပါတယ်';
    }
  };
  const plainGluStatus = (status: string): string => {
    switch (status) {
      case 'normal': return 'ပုံမှန်ပါ';
      case 'pre_diabetic': return 'ပုံမှန်ထက် အနည်းငယ် မြင့်နေပါတယ်';
      case 'diabetic': return 'ဆီးချိုအဆင့်မှာ ရှိနေပါတယ်';
      case 'high': return 'မြင့်နေပါတယ်';
      case 'high_danger': return 'အလွန်မြင့်နေပါတယ် — ဆရာဝန်နှင့် အမြန်ပြပါ';
      case 'critical': return 'အလွန်မြင့်နေပါတယ် — ဆရာဝန်နှင့် အမြန်ပြပါ';
      case 'low': return 'နည်းနေပါတယ်';
      default: return 'စစ်ဆေးရန် လိုပါတယ်';
    }
  };
  const plainBMIStatus = (category: string): string => {
    switch (category) {
      case 'underweight': return 'ပိန်လွန်းနေပါတယ်';
      case 'normal': return 'ပုံမှန်ပါ';
      case 'overweight': return 'အလေးချိန် အနည်းငယ် များနေပါတယ်';
      case 'obese1': return 'အလေးချိန် များနေပါတယ်';
      case 'obese2': return 'အလေးချိန် အရမ်း များနေပါတယ်';
      default: return 'စစ်ဆေးရန် လိုပါတယ်';
    }
  };
  const statusWithLabel = (plain: string, labelMm: string | undefined, isNormal: boolean, isPediatric?: boolean): string =>
    isPediatric
      ? (labelMm || plain)
      : (!isNormal && labelMm && labelMm !== plain) ? `${plain} (${labelMm})` : plain;

  // Lab range flag (E-M4): words, never colour alone. With only `limit`
  // given, the value must stay BELOW it (e.g. cholesterol < 200).
  const labFlag = (value: number | null | undefined, min: number, max?: number): string | null => {
    if (value == null) return null;
    if (max === undefined) return value < min ? '✅ စံနှုန်းအတွင်း' : '⚠️ စံနှုန်းထက် မြင့်နေပါတယ်';
    if (value < min) return '⚠️ စံနှုန်းထက် နည်းနေပါတယ်';
    if (value > max) return '⚠️ စံနှုန်းထက် မြင့်နေပါတယ်';
    return '✅ စံနှုန်းအတွင်း';
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

  const filterByTime = (records: any[]) => {
    return records.filter(r => {
      const ms = parseDateToMs(r.date || r.timestamp || r.createdAt);
      if (timeframe === '1m') return ms >= oneMonthAgo;
      if (timeframe === '3m') return ms >= threeMonthsAgo;
      if (timeframe === '6m') return ms >= sixMonthsAgo;
      return true;
    });
  };

  // Chronologically sorted records (oldest -> newest for graphs)
  const sortedBP = useMemo(() => {
    return [...viewBPRecords].sort((a, b) => 
      parseDateToMs(a.date || a.timestamp || a.createdAt) - parseDateToMs(b.date || b.timestamp || b.createdAt)
    );
  }, [viewBPRecords]);

  const sortedGlucose = useMemo(() => {
    return [...viewGlucoseRecords].sort((a, b) => 
      parseDateToMs(a.date || a.timestamp || a.createdAt) - parseDateToMs(b.date || b.timestamp || b.createdAt)
    );
  }, [viewGlucoseRecords]);

  const sortedBMI = useMemo(() => {
    return [...viewBMIRecords].sort((a, b) => 
      parseDateToMs(a.date || a.timestamp || a.createdAt) - parseDateToMs(b.date || b.timestamp || b.createdAt)
    );
  }, [viewBMIRecords]);

  // Labs sorted the same way (oldest -> newest) — Firestore returns no
  // ordering, so taking labRecords[0] as "latest" could pick a stale test.
  const sortedLabs = useMemo(() => {
    return [...viewLabRecords].sort((a, b) =>
      parseDateToMs(a.testDate || a.recordedAt || a.createdAt) - parseDateToMs(b.testDate || b.recordedAt || b.createdAt)
    );
  }, [viewLabRecords]);

  // Filtered arrays based on active timeframe
  const filteredBP = useMemo(() => filterByTime(sortedBP), [sortedBP, timeframe]);
  const filteredGlucose = useMemo(() => filterByTime(sortedGlucose), [sortedGlucose, timeframe]);
  const filteredBMI = useMemo(() => filterByTime(sortedBMI), [sortedBMI, timeframe]);
  const filteredLabs = useMemo(() => filterByTime(sortedLabs), [sortedLabs, timeframe]);

  // Latest records — from the FILTERED arrays (E-M2): the timeframe
  // filter must filter the snapshot values too, not just the chart.
  const latestBP = filteredBP.length > 0 ? filteredBP[filteredBP.length - 1] : null;
  const latestGlucose = filteredGlucose.length > 0 ? filteredGlucose[filteredGlucose.length - 1] : null;
  const latestLab = filteredLabs.length > 0 ? filteredLabs[filteredLabs.length - 1] : null;
  const latestBMIRecord = filteredBMI.length > 0 ? filteredBMI[filteredBMI.length - 1] : null;

  // Active user age & BMI
  // v2.4.14: family-member view — the age must come from THAT member (a
  // FamilyMember has an age but no dateOfBirth), never the owner's DOB.
  // And pass the age into calculateBMI so its category matches the BMI
  // module (pediatric guard for under-18s) instead of adult cutoffs.
  const activeDOB = selectedFamilyMember ? undefined : (selectedPatient?.dateOfBirth || profile?.dateOfBirth);
  const ageObj = calculateAge(activeDOB);
  const activeAgeYears = ageObj ? ageObj.years : (selectedPatient?.age || selectedFamilyMember?.age || profile?.age || null);
  // Pregnancy flag from the VIEWED person's conditions (same source the
  // Sidebar and BP module use) — needed by calculateBPCategory.
  const activePerson = selectedPatient || selectedFamilyMember || profile;
  const isPregnant = ((activePerson as any)?.isPregnant as boolean | undefined) ||
    (selectedPatient?.chronicConditions || selectedFamilyMember?.chronicConditions || profile?.chronicConditions || []).includes('ကိုယ်ဝန်ဆောင်');

  // E-H1: pass the viewed person's age (and pregnancy flag) into every
  // classifier, headline and table alike — adult cut-offs must never be
  // applied to an under-18. Glucose previously had no guard at all.
  const bpEval = latestBP ? calculateBPCategory(latestBP.systolic, latestBP.diastolic, activeAgeYears ?? undefined, isPregnant) : null;
  // No fabricated fallback: a record with no glucose value has no status.
  const latestGluValue = latestGlucose?.value ?? latestGlucose?.glucoseValue ?? null;
  const gluEval = latestGlucose && latestGluValue != null ? calculateGlucoseStatus(latestGluValue, latestGlucose.type || latestGlucose.timing || 'fasting', activeAgeYears ?? undefined) : null;

  // BMI comes ONLY from a real BMI record (E-M1): a profile-derived
  // height/weight must never be presented as a measured BMI. The record's
  // own age at measurement wins; otherwise the viewed person's age.
  const bmiEval = latestBMIRecord
    ? calculateBMI(latestBMIRecord.weightKg, latestBMIRecord.heightCm, latestBMIRecord.ageYears ?? activeAgeYears ?? undefined)
    : null;

  // Active critical alerts
  const alerts: { title: string; desc: string; type: 'warning' | 'danger' | 'info' }[] = [];

  if (latestBP && (latestBP.systolic >= 140 || latestBP.diastolic >= 90)) {
    alerts.push({
      title: 'သွေးပေါင်ချိန် သက်မှတ်ချက်ထက် မြင့်နေပါသည်',
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

  // "No data" must never be presented as "healthy": with zero records
  // there is nothing to assess. The banner badge below shows the honest
  // no-data state instead of '🟢 ပုံမှန်ကောင်းမွန်' in that case.
  const hasAnyHealthData =
    viewBPRecords.length + viewGlucoseRecords.length + viewBMIRecords.length + viewLabRecords.length > 0;

  // Headline badge (E-H2): derived from the actual latest categories,
  // NEVER from alerts alone — stage-1 hypertension and pre-diabetes
  // produce no alert, so an alerts-only badge contradicted the numbers
  // on the same screen. A paediatric guard result is never "normal".
  const isPediatricResult = !!(bpEval?.isPediatric || gluEval?.isPediatric || bmiEval?.isPediatric);
  const badgeReasons: string[] = [];
  if (bpEval && !bpEval.isPediatric) {
    if (bpEval.category === 'crisis') badgeReasons.push('သွေးပေါင် အရေးပေါ် အဆင့်');
    else if (bpEval.category === 'stage2') badgeReasons.push('သွေးပေါင် အဆင့် ၂ သွေးတိုး');
    else if (bpEval.category === 'stage1') badgeReasons.push('သွေးပေါင် အဆင့် ၁ သွေးတိုး');
    else if (bpEval.category === 'elevated') badgeReasons.push('သွေးပေါင် အနည်းငယ် မြင့်နေပါတယ်');
  }
  if (bpEval?.isPregnancyAlert) badgeReasons.push('ကိုယ်ဝန်ဆောင် သွေးတိုး သတိပေးချက်');
  if (gluEval && !gluEval.isPediatric) {
    if (gluEval.status === 'critical' || gluEval.status === 'high_danger') badgeReasons.push('သွေးတွင်းသကြားဓာတ် အလွန်မြင့်နေပါတယ်');
    else if (gluEval.status === 'diabetic' || gluEval.status === 'high') badgeReasons.push('သွေးတွင်းသကြား ဆီးချိုအဆင့်');
    else if (gluEval.status === 'pre_diabetic') badgeReasons.push('သွေးတွင်းသကြား ဆီးချိုအကြိုအဆင့်');
    else if (gluEval.status === 'low') badgeReasons.push('သွေးတွင်းသကြားဓာတ် နည်းနေပါတယ်');
  }
  if (bmiEval && !bmiEval.isPediatric) {
    if (bmiEval.category === 'obese2') badgeReasons.push('BMI အဝလွန်အဆင့် ၂');
    else if (bmiEval.category === 'obese1') badgeReasons.push('BMI အဝလွန်အဆင့် ၁');
    else if (bmiEval.category === 'underweight') badgeReasons.push('BMI ပိန်လွန်းနေပါတယ်');
    else if (bmiEval.category === 'overweight') badgeReasons.push('BMI အလေးချိန် အနည်းငယ် များနေပါတယ်');
  }
  const badgeDanger = !!(bpEval && !bpEval.isPediatric && (bpEval.category === 'crisis' || bpEval.category === 'stage2')) ||
    !!bpEval?.isPregnancyAlert ||
    !!(gluEval && !gluEval.isPediatric && (gluEval.status === 'critical' || gluEval.status === 'high_danger'));
  const healthBadge = !hasAnyHealthData
    ? { text: '📋 မှတ်တမ်း မရှိသေးပါ', reason: '' }
    : isPediatricResult
      ? { text: '🔵 ကလေးဆရာဝန်နှင့် စစ်ဆေးရန် လိုပါတယ်', reason: 'အသက် ၁၈ နှစ်အောက် ဖြစ်သဖြင့် လူကြီးစံနှုန်းဖြင့် မသတ်မှတ်ပါ' }
      : badgeReasons.length === 0
        ? { text: '🟢 ပုံမှန်ကောင်းမွန်', reason: '' }
        : { text: badgeDanger ? '🔴 ဂရုပြုစောင့်ကြည့်' : '🟡 သတိထားရန် လိုပါတယ်', reason: badgeReasons.join(' • ') };

  // While the first Firestore snapshot is still on its way, show a loading
  // state instead of the empty-data messages and charts — otherwise a slow
  // connection looks like all records have vanished.
  if (dataLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          <p className="text-sm font-bold text-slate-900 dark:text-white mt-4">ဒေတာ ရယူနေပါသည်...</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">ခဏစောင့်ပေးပါ</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-6 rounded-3xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
              ကျန်းမာရေးသုံးသပ်ချက် အနှစ်ချုပ် (Health Analytics & Historical Trends)
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold mt-1">
              {viewName} ၏ ဘက်စုံ ကျန်းမာရေး သမိုင်းမှတ်တမ်း
            </h2>
            <p className="text-xs text-emerald-100 mt-1">
              ပြသနေသူ: {viewName}{viewRoleLabel ? ` (${viewRoleLabel})` : ''}{isMemberView ? ` • ${selectedFamilyMember!.relationship}` : ''}
            </p>
            <p className="text-xs text-emerald-100 mt-1 max-w-xl">
              သွေးတိုး၊ ဆီးချို၊ BMI & ခန္ဓာကိုယ်အချိုးအစားနှင့် ဓာတ်ခွဲခန်းစစ်ဆေးချက်များကို Graph & Data ဇယားများဖြင့် အချိန်နှင့်တပြေးညီ ကြည့်ရှုနိုင်ပါသည်
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2 bg-white/10 rounded-2xl backdrop-blur-xs text-center border border-white/20">
              <span className="text-[11px] text-emerald-100 block font-medium">ကျန်းမာရေးအဆင့်</span>
              <span className="text-base font-bold">
                {healthBadge.text}
              </span>
              {healthBadge.reason && (
                <span className="text-[11px] text-emerald-100 block font-normal mt-0.5">
                  {healthBadge.reason}
                </span>
              )}
              {!hasAnyHealthData && (
                <span className="text-[11px] text-emerald-100 block font-normal mt-0.5">
                  မှတ်တမ်းထည့်ပြီးမှ ကျန်းမာရေး အခြေအနေ ပြပေးပါမယ်
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User Selector Filter Bar for Admin / Multi-user view */}
      {profile?.role === 'admin' && patientsList.length > 0 && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                အသုံးပြုသူ Filter (Select User for Trend Analysis)
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                လက်ရှိ ပြသနေသော အသုံးပြုသူ: {viewName}{viewRoleLabel ? ` (${viewRoleLabel})` : ''}
              </span>
            </div>
          </div>
          <select
            value={selectedPatientId || '__self__'}
            onChange={(e) => setSelectedPatientId(e.target.value === '__self__' ? null : e.target.value)}
            className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs"
          >
            {/* E-H3: no pooled "All Users" option — the filter selects
                exactly ONE person; no selection means the admin's own data. */}
            <option value="__self__">👤 ကိုယ်တိုင် ({profile?.displayName || 'အသုံးပြုသူ'})</option>
            {patientsList.map(p => (
              <option key={p.id} value={p.id}>
                👤 {p.displayName || 'အသုံးပြုသူ'} ({p.email || p.phone || p.id})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Alerts Banner if any */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`p-4 rounded-2xl border flex items-start gap-3 text-xs font-semibold ${
                alert.type === 'danger'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${alert.type === 'danger' ? 'text-rose-600' : 'text-amber-600'}`} />
              <div>
                <span className="font-extrabold block">{alert.title}</span>
                <span className="opacity-90 font-normal">{alert.desc}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state (E-L10): zero records is never "all good" — say so
          plainly and point at adding the first record. */}
      {!hasAnyHealthData && (
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs text-center">
          <p className="text-sm font-bold text-slate-900 dark:text-white">မှတ်တမ်း မရှိသေးပါ</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {viewName} ၏ သွေးပေါင်၊ သကြားဓာတ်၊ BMI သို့မဟုတ် ဓာတ်ခွဲခန်း မှတ်တမ်း တစ်ခုမှ မရှိသေးပါ။ မှတ်တမ်း တစ်ခုထည့်လိုက်မှ Trend Graph နှင့် သုံးသပ်ချက် ပြပေးပါမယ်။
          </p>
          <button
            onClick={() => onNavigateTab && onNavigateTab('bp')}
            className="mt-3 px-4 py-2 rounded-2xl bg-teal-600 text-white text-xs font-bold cursor-pointer hover:bg-teal-700 transition-colors"
          >
            ➕ သွေးပေါင်ချိန် မှတ်တမ်း ထည့်မယ်
          </button>
        </div>
      )}

      {/* Snapshot Cards - Pristine Pure White */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Age & Profile — E-L3: age is not a BMI shortcut; no navigation. */}
        <div 
          className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold">အသက် (Age)</span>
            <Calendar className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-extrabold font-mono text-slate-900 mt-1">
            {activeAgeYears !== null ? activeAgeYears : '--'} <span className="text-xs text-slate-500 font-sans">နှစ်</span>
          </div>
          <span className="text-[11px] text-teal-700 font-semibold mt-1 block truncate">
            {ageObj ? ageObj.formattedMm : 'မွေးနေ့မှ တွက်ချက်မည်'}
          </span>
        </div>

        {/* BMI & Weight */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('bmi')}
          className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold">BMI အညွှန်း</span>
            <Scale className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-extrabold font-mono text-slate-900 mt-1">
            {bmiEval ? bmiEval.bmi : '--'} <span className="text-xs text-slate-500 font-sans">kg/m²</span>
          </div>
          {bmiEval ? (
            <span className={`text-[11px] font-bold mt-1 inline-block truncate ${bmiEval.color}`}>
              {statusWithLabel(plainBMIStatus(bmiEval.category), bmiEval.labelMm, bmiEval.category === 'normal', bmiEval.isPediatric)}
            </span>
          ) : (
            <span className="text-[11px] text-slate-500 mt-1 block font-medium">မှတ်တမ်းမရှိသေး</span>
          )}
          <span className="text-[11px] text-slate-400 mt-0.5 block font-medium">
            📅 {latestBMIRecord ? displayDate(latestBMIRecord.date || latestBMIRecord.timestamp) : 'ရက်စွဲ မရှိပါ'}
          </span>
        </div>

        {/* BP */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('bp')}
          className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-rose-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold">သွေးပေါင်ချိန် (BP)</span>
            <Activity className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-extrabold font-mono text-slate-900 mt-1">
            {latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : '--/--'} <span className="text-xs text-slate-500 font-sans">mmHg</span>
          </div>
          {bpEval ? (
            <span className={`text-[11px] font-bold mt-1 inline-block ${bpEval.color}`}>
              {statusWithLabel(plainBPStatus(bpEval.category), bpEval.labelMm, bpEval.category === 'normal', bpEval.isPediatric)}
            </span>
          ) : (
            <span className="text-[11px] text-slate-500 mt-1 block font-medium">မှတ်တမ်းမရှိသေး</span>
          )}
          <span className="text-[11px] text-slate-400 mt-0.5 block font-medium">
            📅 {latestBP ? displayDate(latestBP.date || latestBP.timestamp) : 'ရက်စွဲ မရှိပါ'}
          </span>
        </div>

        {/* Glucose */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('sugar')}
          className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold">သွေးတွင်းသကြားဓာတ်</span>
            <Droplets className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-extrabold font-mono text-slate-900 mt-1">
            {latestGlucose ? latestGlucose.value : '--'} <span className="text-xs text-slate-500 font-sans">{latestGlucose?.type === 'hba1c' ? '%' : 'mg/dL'}</span>
          </div>
          {gluEval ? (
            <span className={`text-[11px] font-bold mt-1 inline-block ${gluEval.color}`}>
              {statusWithLabel(plainGluStatus(gluEval.status), gluEval.labelMm, gluEval.status === 'normal', gluEval.isPediatric)}
            </span>
          ) : (
            <span className="text-[11px] text-slate-500 mt-1 block font-medium">မှတ်တမ်းမရှိသေး</span>
          )}
          <span className="text-[11px] text-slate-400 mt-0.5 block font-medium">
            📅 {latestGlucose ? displayDate(latestGlucose.date || latestGlucose.timestamp) : 'ရက်စွဲ မရှိပါ'}
          </span>
        </div>

        {/* Renal & Uric Acid */}
        <div 
          onClick={() => onNavigateTab && onNavigateTab('labs')}
          className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-purple-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold">ဓာတ်ခွဲခန်းစစ်ဆေးချက်</span>
            <FlaskConical className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-sm font-extrabold font-mono text-slate-900 mt-1 truncate">
            Cr: {latestLab?.renal?.creatinine ?? '--'} | Uric: {latestLab?.renal?.uricAcid ?? '--'}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block truncate font-medium">
            📅 {latestLab ? displayDate(latestLab.testDate || latestLab.recordedAt) : 'စစ်ဆေးချက်မရှိသေး'}
          </span>
          {latestLab?.renal?.uricAcid != null && (
            <span className="text-[11px] mt-0.5 block font-bold">
              {labFlag(latestLab.renal.uricAcid, 3.5, 7.2)}
            </span>
          )}
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
              ကျန်းမာရေး သမိုင်းမှတ်တမ်း ပြသမှု ပုံစံ (Historical View Mode)
            </h3>
            <p className="text-[11px] text-slate-500">
              Graph မျဉ်းကွေးဖြင့် ဖြစ်စေ၊ Data ဇယားဖြင့် ဖြစ်စေ ရွေးချယ် ကြည့်ရှုနိုင်ပါသည်
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
              <span>📈 Graph View သာ</span>
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
              <span>📋 Data ဇယားသာ</span>
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

      {/* GRAPH VIEW SECTION (Rendered if 'both' or 'graph') */}
      {(viewMode === 'both' || viewMode === 'graph') && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <BloodPressureChart records={filteredBP} />
            </div>
            <div>
              <BloodSugarChart records={filteredGlucose} />
            </div>
          </div>

          {/* BMI & Body Weight Trend Chart */}
          {filteredBMI.length > 0 && (
            <div>
              <BMIWeightChart records={filteredBMI} />
            </div>
          )}
        </div>
      )}

      {/* DATA TABLE VIEW SECTION (Rendered if 'both' or 'table') */}
      {(viewMode === 'both' || viewMode === 'table') && (
        <div className="space-y-6">
          {viewMode === 'both' && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Table className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                ရက်စွဲအလိုက် စစ်ဆေးတိုင်းတာချက် ဒေတာဇယားများ ({timeframe === 'all' ? 'အားလုံး' : timeframe === '1m' ? '၁ လစာ' : timeframe === '3m' ? '၃ လစာ' : '၆ လစာ'}):
              </h3>
            </div>
          )}

          {/* Blood Pressure Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 bg-rose-50/60 dark:bg-rose-950/40 border-b border-rose-100 dark:border-rose-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-rose-600" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  သွေးပေါင်ချိန် သမိုင်းမှတ်တမ်း ဇယား (Blood Pressure Log - {filteredBP.length} ကြိမ်)
                </h4>
              </div>
              <span className="text-xs text-rose-700 dark:text-rose-300 font-semibold font-mono">
                mmHg / bpm
              </span>
            </div>

            {filteredBP.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                ရွေးချယ်ထားသော ကာလအတွင်း သွေးပေါင်ချိန် မှတ်တမ်း မရှိပါ
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">ရက်စွဲ / အချိန်</th>
                      <th className="py-2.5 px-4 font-semibold">အပေါ်သွေး (SYS)</th>
                      <th className="py-2.5 px-4 font-semibold">အောက်သွေး (DIA)</th>
                      <th className="py-2.5 px-4 font-semibold">နှလုံးခုန် (Pulse)</th>
                      <th className="py-2.5 px-4 font-semibold">အခြေအနေ</th>
                      <th className="py-2.5 px-4 font-semibold">စားသုံးခဲ့သော အစားအသောက်</th>
                      <th className="py-2.5 px-4 font-semibold">မှတ်ချက်</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredBP.slice().reverse().map((r, i) => {
                      const evalB = calculateBPCategory(r.systolic, r.diastolic, activeAgeYears ?? undefined, isPregnant);
                      const dInfo = recordDateTime(r);
                      const diet = r.dietRecord || r.dietNotes || r.foodIntake;
                      return (
                        <tr key={r.id || i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-2.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                            {dInfo.date} <span className="text-[11px] text-slate-400">{dInfo.time}</span>
                          </td>
                          <td className="py-2.5 px-4 font-extrabold text-rose-600 font-mono text-sm">
                            {r.systolic} <span className="text-[11px] text-slate-400 font-normal">mmHg</span>
                          </td>
                          <td className="py-2.5 px-4 font-extrabold text-blue-600 font-mono text-sm">
                            {r.diastolic} <span className="text-[11px] text-slate-400 font-normal">mmHg</span>
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-amber-600 font-mono">
                            {r.pulse || r.pulseRate || '--'} <span className="text-[11px] text-slate-400 font-normal">bpm</span>
                          </td>
                          <td className="py-2.5 px-4">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${evalB.bgColor} ${evalB.color} ${evalB.borderColor}`}>
                              {statusWithLabel(plainBPStatus(evalB.category), evalB.labelMm, evalB.category === 'normal', evalB.isPediatric)}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200">
                            {diet ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 font-medium text-[11px]">
                                <Utensils className="w-3 h-3 text-amber-600" />
                                {diet}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-slate-500 max-w-xs truncate">
                            {r.notes || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Blood Sugar Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/40 border-b border-emerald-100 dark:border-emerald-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  ဆီးချို/သွေးတွင်းသကြားဓာတ် သမိုင်းမှတ်တမ်း ဇယား (Glucose Log - {filteredGlucose.length} ကြိမ်)
                </h4>
              </div>
              <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold font-mono">
                mg/dL & %
              </span>
            </div>

            {filteredGlucose.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                ရွေးချယ်ထားသော ကာလအတွင်း သကြားဓာတ် မှတ်တမ်း မရှိပါ
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">ရက်စွဲ / အချိန်</th>
                      <th className="py-2.5 px-4 font-semibold">သကြားဓာတ်တန်ဖိုး</th>
                      <th className="py-2.5 px-4 font-semibold">တိုင်းတာသည့်အမျိုးအစား</th>
                      <th className="py-2.5 px-4 font-semibold">အခြေအနေ သုံးသပ်ချက်</th>
                      <th className="py-2.5 px-4 font-semibold">စားသုံးခဲ့သော အစားအသောက်</th>
                      <th className="py-2.5 px-4 font-semibold">မှတ်ချက်</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredGlucose.slice().reverse().map((r, i) => {
                      const val = r.value ?? r.glucoseValue ?? null;
                      const type = r.type || r.timing || 'fasting';
                      const evalG = val != null ? calculateGlucoseStatus(val, type, activeAgeYears ?? undefined) : null;
                      const dInfo = recordDateTime(r);
                      const diet = r.dietRecord || r.dietNotes || r.foodIntake;
                      return (
                        <tr key={r.id || i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-2.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                            {dInfo.date} <span className="text-[11px] text-slate-400">{dInfo.time}</span>
                          </td>
                          <td className="py-2.5 px-4 font-extrabold text-emerald-600 font-mono text-sm">
                            {val ?? '—'} <span className="text-[11px] text-slate-400 font-normal">{type === 'hba1c' ? '%' : 'mg/dL'}</span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">
                            {type === 'fasting' && 'အစာမစားမီ (Fasting)'}
                            {type === 'post_prandial' && 'အစာစားပြီး ၂ နာရီ (PP)'}
                            {type === 'random' && 'အချိန်မရွေး (Random)'}
                            {type === 'hba1c' && '၃ လပတ် (HbA1c)'}
                            {!['fasting', 'post_prandial', 'random', 'hba1c'].includes(type) && type}
                          </td>
                          <td className="py-2.5 px-4">
                            {evalG ? (
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${evalG.bgColor} ${evalG.color} ${evalG.borderColor}`}>
                                {statusWithLabel(plainGluStatus(evalG.status), evalG.labelMm, evalG.status === 'normal', evalG.isPediatric)}
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200">
                            {diet ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 font-medium text-[11px]">
                                <Utensils className="w-3 h-3 text-emerald-600" />
                                {diet}
                              </span>
                            ) : (
                              <span className="text-slate-500">{r.mealInfo || '-'}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-slate-500 max-w-xs truncate">
                            {r.notes || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* BMI Log Table */}
          {filteredBMI.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="p-4 bg-teal-50/60 dark:bg-teal-950/40 border-b border-teal-100 dark:border-teal-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-teal-600" />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    ကိုယ်အလေးချိန်နှင့် BMI သမိုင်းမှတ်တမ်း (BMI Log - {filteredBMI.length} ကြိမ်)
                  </h4>
                </div>
                <span className="text-xs text-teal-700 dark:text-teal-300 font-semibold font-mono">
                  kg & kg/m²
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">ရက်စွဲ</th>
                      <th className="py-2.5 px-4 font-semibold">အရပ် (Height)</th>
                      <th className="py-2.5 px-4 font-semibold">ကိုယ်အလေးချိန်</th>
                      <th className="py-2.5 px-4 font-semibold">BMI တန်ဖိုး</th>
                      <th className="py-2.5 px-4 font-semibold">အဆင့်သတ်မှတ်ချက်</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredBMI.slice().reverse().map((r, i) => {
                      const evalB = calculateBMI(r.weightKg, r.heightCm, r.ageYears ?? activeAgeYears ?? undefined);
                      const dInfo = recordDateTime(r);
                      return (
                        <tr key={r.id || i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-2.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                            {dInfo.date}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                            {r.heightCm} cm
                          </td>
                          <td className="py-2.5 px-4 font-extrabold text-teal-600 font-mono text-sm">
                            {r.weightKg} kg
                          </td>
                          <td className="py-2.5 px-4 font-extrabold text-slate-900 dark:text-white font-mono text-sm">
                            {r.bmi}
                          </td>
                          <td className="py-2.5 px-4">
                            {evalB ? (
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${evalB.bgColor} ${evalB.color} ${evalB.borderColor}`}>
                                {statusWithLabel(plainBMIStatus(evalB.category), evalB.labelMm, evalB.category === 'normal', evalB.isPediatric)}
                              </span>
                            ) : (
                              r.category
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Doctor Advice Feed */}
      {viewAdvices.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                ဆရာဝန်၏ ကျန်းမာရေးလမ်းညွှန်ချက်များနှင့် ဆေးညွှန်းများ (Doctor Consultations)
              </h3>
              <p className="text-xs text-slate-600">
                {viewName} အတွက် ဆရာဝန်မှ အကြံပြုထားသော အစားအသောက်နှင့် ဆေးဝါးသုံးစွဲမှု လမ်းညွှန်ချက်များ
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {viewAdvices.map((adv) => (
              <div key={adv.id} className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="font-extrabold text-indigo-950">{adv.doctorName}</span>
                  <span className="font-mono">{displayDate(adv.date)}</span>
                </div>
                <p className="text-slate-900 text-sm font-bold leading-relaxed">
                  {adv.advice}
                </p>
                {adv.dietRecommendation && (
                  <div className="mt-2 p-2.5 rounded-xl bg-white border border-indigo-200 text-slate-800">
                    <span className="font-bold text-indigo-700">🥗 အစားအသောက်လမ်းညွှန်: </span>
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
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-purple-600" />
                နောက်ဆုံး ဓာတ်ခွဲခန်းစစ်ဆေးချက် အနှစ်ချုပ် ({displayDate(latestLab.testDate || latestLab.recordedAt)})
              </h3>
              <p className="text-xs text-slate-600">{latestLab.labName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            {/* Hb */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px] font-bold">သွေးအား (Hb)</span>
              <span className="text-base font-extrabold font-mono text-slate-900">
                {latestLab.cbc?.hemoglobin != null ? `${latestLab.cbc.hemoglobin} g/dL` : '--'}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">စံ: 12 - 17</span>
              {latestLab.cbc?.hemoglobin != null && (
                <span className="text-[11px] block mt-0.5 font-bold">{labFlag(latestLab.cbc.hemoglobin, 12, 17)}</span>
              )}
            </div>

            {/* FBS */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px] font-bold">ဆီးချို (FBS)</span>
              <span className="text-base font-extrabold font-mono text-slate-900">
                {latestLab.glucose?.fbs != null ? `${latestLab.glucose.fbs} mg/dL` : '--'}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">စံ: 70 - 99</span>
              {latestLab.glucose?.fbs != null && (
                <span className="text-[11px] block mt-0.5 font-bold">{labFlag(latestLab.glucose.fbs, 70, 99)}</span>
              )}
            </div>

            {/* ALT */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px] font-bold">အသည်း (SGPT/ALT)</span>
              <span className="text-base font-extrabold font-mono text-slate-900">
                {latestLab.liver?.alt_sgpt != null ? `${latestLab.liver.alt_sgpt} U/L` : '--'}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">ပုံမှန်: 7 - 56</span>
              {latestLab.liver?.alt_sgpt != null && (
                <span className="text-[11px] block mt-0.5 font-bold">{labFlag(latestLab.liver.alt_sgpt, 7, 56)}</span>
              )}
            </div>

            {/* Creatinine */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px] font-bold">ကျောက်ကပ် (Creatinine)</span>
              <span className="text-base font-extrabold font-mono text-slate-900">
                {latestLab.renal?.creatinine != null ? `${latestLab.renal.creatinine} mg/dL` : '--'}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">ပုံမှန်: 0.6 - 1.2</span>
              {latestLab.renal?.creatinine != null && (
                <span className="text-[11px] block mt-0.5 font-bold">{labFlag(latestLab.renal.creatinine, 0.6, 1.2)}</span>
              )}
            </div>

            {/* Uric Acid */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px] font-bold">ဂေါက်/ယူရစ် (Uric Acid)</span>
              <span className="text-base font-extrabold font-mono text-slate-900">
                {latestLab.renal?.uricAcid != null ? `${latestLab.renal.uricAcid} mg/dL` : '--'}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">ပုံမှန်: 3.5 - 7.2</span>
              {latestLab.renal?.uricAcid != null && (
                <span className="text-[11px] block mt-0.5 font-bold">{labFlag(latestLab.renal.uricAcid, 3.5, 7.2)}</span>
              )}
            </div>

            {/* Cholesterol */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[11px] font-bold">ကိုလက်စထရော (Chol)</span>
              <span className="text-base font-extrabold font-mono text-slate-900">
                {latestLab.lipid?.totalCholesterol != null ? `${latestLab.lipid.totalCholesterol} mg/dL` : '--'}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">စံနှုန်း: &lt; 200</span>
              {latestLab.lipid?.totalCholesterol != null && (
                <span className="text-[11px] block mt-0.5 font-bold">{labFlag(latestLab.lipid.totalCholesterol, 200)}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
