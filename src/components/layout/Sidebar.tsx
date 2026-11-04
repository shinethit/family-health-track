import React from 'react';
import {
  X,
  Bell,
  BookOpen,
  ShieldCheck,
  History,
  LogOut,
  ChevronRight,
  FileText,
  Activity,
  Heart,
  Baby,
  Users,
  Stethoscope,
  ShieldAlert,
  RefreshCw,
  Database,
  Trash2,
  Droplets,
  Scale,
  HelpCircle,
  Lock,
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { useNotifications } from '../../context/NotificationContext';
import { CURRENT_SYSTEM_VERSION } from '../../constants/version';
import { calculateBPCategory, calculateGlucoseStatus, calculateBMI, parseDateToMs, formatDateLabel } from '../../lib/medicalCalculations';
import { GLUCOSE_SERIES_META, normalizeGlucoseType, BP_CONDITION_META, normalizeBPCondition } from '../../lib/chartSeries';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { Modal } from '../common/Modal';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNotifications: () => void;
  onOpenUserGuide: () => void;
  onOpenPrivacyPolicy: () => void;
  onOpenVersionHistory: () => void;
  onOpenPassportModal: () => void;
  onOpenDataBackup?: () => void;
  onOpenDeleteAccount?: () => void;
  onOpenChangePassword?: () => void;
  onOpenProfileEdit?: () => void;
  onManualCheckVersion?: () => void;
  setActiveTab: (tab: string) => void;
  setCategoryGroup: (group: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose,
  onOpenNotifications,
  onOpenUserGuide,
  onOpenPrivacyPolicy,
  onOpenVersionHistory,
  onOpenPassportModal,
  onOpenDataBackup,
  onOpenDeleteAccount,
  onOpenChangePassword,
  onOpenProfileEdit,
  onManualCheckVersion,
  setActiveTab,
  setCategoryGroup
}) => {
  const { profile, logout, currentUser, isAdmin } = useAuth();
  // Logout confirm (v2.4.16, A-L5): the native confirm() was replaced by
  // the app's own Modal so the confirm looks and behaves like the rest
  // of the app (and works the same on every browser).
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
  // Change Password only works for email/password accounts — accounts
  // created with Google before v2.4.12 have no password until one is set
  // via "forgot password".
  const isPasswordUser = currentUser?.providerData?.some((p) => p.providerId === 'password') ?? false;
  const {
    selectedPatient, selectedFamilyMember, selectedFamilyMemberId,
    ownBPRecords, ownGlucoseRecords, ownBMIRecords,
    allBPRecords, allGlucoseRecords, allBMIRecords,
    dataLoading,
  } = useHealthData();
  const { unreadCount } = useNotifications();

  // WHOSE vitals does this card show? (v2.4.15) Exactly one definite
  // person — never a pooled "newest of everyone" presented as one
  // person's summary. The old code took sortByDateDesc(bpRecords)[0]
  // where bpRecords for an admin with NO patient selected was ALL users'
  // records pooled, while the header showed the admin's own name.
  //   admin + patient selected -> that patient only ('အသုံးပြုသူ')
  //   family member selected  -> that member only ('မိသားစုဝင်')
  //   anything else           -> the signed-in user's own records only
  //     (covers admin with no patient selected AND family 'all' view)
  const isPatientView = isAdmin && !!selectedPatient;
  const isMemberView = !isAdmin && !!selectedFamilyMember;

  const summaryBP = isPatientView
    ? allBPRecords.filter(r => r.userId === selectedPatient!.id || (!r.userId && !!selectedPatient!.email && r.patientEmail === selectedPatient!.email))
    : isMemberView
      ? allBPRecords.filter(r => r.userId === selectedFamilyMember!.id)
      : ownBPRecords;
  const summaryGlu = isPatientView
    ? allGlucoseRecords.filter(r => r.userId === selectedPatient!.id || (!r.userId && !!selectedPatient!.email && r.patientEmail === selectedPatient!.email))
    : isMemberView
      ? allGlucoseRecords.filter(r => r.userId === selectedFamilyMember!.id)
      : ownGlucoseRecords;
  const summaryBMI = isPatientView
    ? allBMIRecords.filter(r => r.userId === selectedPatient!.id || (!r.userId && !!selectedPatient!.email && r.patientEmail === selectedPatient!.email))
    : isMemberView
      ? allBMIRecords.filter(r => r.userId === selectedFamilyMember!.id)
      : ownBMIRecords;

  const summaryName = isPatientView
    ? selectedPatient!.displayName
    : isMemberView
      ? selectedFamilyMember!.name
      : (profile?.displayName || 'အသုံးပြုသူ');
  // Second header line: the patient's email, the member's relationship,
  // or the signed-in user's own email. In family 'all' view the card shows
  // the signed-in user's OWN records (v2.4.15), so it is labelled
  // "ကိုယ်တိုင်" (v2.4.16, D-L2) — otherwise it reads as if the pooled
  // family view were one person's summary.
  const summarySubline = isPatientView
    ? (selectedPatient!.email || '')
    : isMemberView
      ? `မိသားစုဝင် • ${selectedFamilyMember!.relationship}`
      : selectedFamilyMemberId === 'all'
        ? `ကိုယ်တိုင် • ${profile?.email || currentUser?.email || ''}`
        : (profile?.email || currentUser?.email || '');
  const summaryRoleLabel = isPatientView ? 'အသုံးပြုသူ' : isMemberView ? 'မိသားစုဝင်' : null;
  const targetAge = isPatientView
    ? selectedPatient!.age
    : isMemberView
      ? selectedFamilyMember!.age
      : profile?.age;
  const targetConditions = isPatientView
    ? selectedPatient!.chronicConditions
    : isMemberView
      ? selectedFamilyMember!.chronicConditions
      : profile?.chronicConditions;
  const isPregnant = targetConditions?.includes('ကိုယ်ဝန်ဆောင်') ?? false;

  // Compute real health status summary from the SUMMARY PERSON's latest
  // records only. Firestore returns no ordering, so sort a copy by date
  // (newest first) before taking [0] — otherwise the "latest" reading
  // can be a stale one.
  const sortByDateDesc = <T extends { date?: string; timestamp?: string; createdAt?: string }>(arr: T[]): T[] =>
    [...arr].sort((a, b) => parseDateToMs(b.date || b.timestamp || b.createdAt) - parseDateToMs(a.date || a.timestamp || a.createdAt));

  const latestBP = sortByDateDesc(summaryBP)[0] ?? null;
  const latestGlu = sortByDateDesc(summaryGlu)[0] ?? null;
  const latestBMI = sortByDateDesc(summaryBMI)[0] ?? null;

  const bpEval = latestBP ? calculateBPCategory(latestBP.systolic, latestBP.diastolic, targetAge, isPregnant) : null;
  // No fabricated fallback: a record with no glucose value has no status.
  const latestGluValue = latestGlu?.glucoseValue ?? latestGlu?.value ?? null;
  const gluEval = latestGluValue != null ? calculateGlucoseStatus(latestGluValue, latestGlu.timing || latestGlu.type || 'fasting', targetAge ?? undefined) : null;
  const bmiEval = latestBMI ? calculateBMI(latestBMI.weightKg, latestBMI.heightCm, targetAge) : null;

  const hasAnyRecords = Boolean(latestBP || latestGlu || latestBMI);

  // Plain-language status words (v2.4.15): the medical category is kept
  // in parentheses, but the words a user reads first are plain — never
  // jargon alone. Each row also shows the measurement date.
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
      case 'high': return 'မြင့်နေပါတယ်';
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
  // Medical label in parentheses only when it adds information (never
  // for a plain "normal" row, where the plain words already say it all).
  // Children: adult cut-offs do not apply, so show the guard label itself
  // ("ကလေး/ဆယ်ကျော်သက် ... ဆရာဝန်နှင့် စစ်ဆေးရန်") instead of "ပုံမှန်ပါ".
  const statusWithLabel = (plain: string, labelMm: string | undefined, isNormal: boolean, isPediatric?: boolean): string =>
    isPediatric
      ? (labelMm || plain)
      : (!isNormal && labelMm && labelMm !== plain) ? `${plain} (${labelMm})` : plain;
  // A measurement date is shown only when the record actually HAS one —
  // the old code fell back to createdAt (the entry date), presenting it
  // as if the measurement happened then (v2.4.16, D-M3).
  const recordDate = (r: { date?: string; timestamp?: string; createdAt?: string }): string => {
    const d = r.date || r.timestamp;
    return d ? formatDateLabel(d).date : 'ရက်စွဲ မရှိပါ';
  };
  // v2.4.17: summary rows show WHEN + under WHAT condition the latest
  // reading was taken (same labels as Trends). A legacy condition holding
  // an old BP category shows 'အခြေအနေ မသိပါ' — never invent one.
  const recordDateTime = (r: { date?: string; timestamp?: string }): { date: string; time: string } => {
    const d = r.date || r.timestamp;
    return d ? formatDateLabel(d) : { date: 'ရက်စွဲ မရှိပါ', time: '' };
  };
  const dateTimeLabel = (r: { date?: string; timestamp?: string }): string => {
    const dt = recordDateTime(r);
    return dt.time ? `${dt.date} · ${dt.time}` : dt.date;
  };
  const bpConditionLabel = (condition?: string | null): string =>
    BP_CONDITION_META[normalizeBPCondition(condition)].labelMm;
  const glucoseSeriesLabel = (type?: string | null): string =>
    GLUCOSE_SERIES_META[normalizeGlucoseType(type)].labelMm;

  // Open one metric's module for the SAME person the card shows: the
  // person selection (patient / family member / self) is already set in
  // context, so navigating to the tab lands on that person's data.
  const openMetricTab = (tab: 'bp' | 'sugar' | 'bmi') => {
    setActiveTab(tab);
    setCategoryGroup('records');
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs" onClick={onClose} />
      )}

      <div className={`fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900">မီနူး</h3>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Profile & Dynamic Summary — the header AND the card always
              show the SAME person (the summary person: patient / family
              member / self). The old code showed the admin's own name
              here while the card below showed a pooled stranger's vitals. */}
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                {summaryName?.charAt(0) || 'U'}
              </div>
              <div className="truncate min-w-0">
                <p className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                  <span className="truncate">{summaryName}</span>
                  {summaryRoleLabel && (
                    <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-extrabold">{summaryRoleLabel}</span>
                  )}
                </p>
                <p className="text-xs text-slate-500 truncate">{summarySubline}</p>
              </div>
            </div>
            
            {/* Real computed health summary card — one clear line per
                metric: plain-language status + measurement date, and each
                row is tappable to open that person's module view. */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5">
               <div className="flex items-center justify-between gap-2">
                 <p className="text-[11px] font-bold text-slate-500">ကျန်းမာရေးအခြေနေ အကျဉ်း</p>
               </div>
               <p className="text-[11px] text-slate-400 font-semibold">{summaryName} ၏ နောက်ဆုံး တိုင်းတာချက်များ</p>
               
               {dataLoading ? (
                 <p className="text-xs text-slate-400 font-semibold italic">တင်နေသည်…</p>
               ) : !hasAnyRecords ? (
                 <p className="text-xs text-slate-400 font-semibold italic">{summaryName} အတွက် မှတ်တမ်း မရှိသေးပါ</p>
               ) : (
                 <div className="space-y-1 text-xs">
                   {latestBP && bpEval && (
                     <button onClick={() => openMetricTab('bp')} className="w-full text-left p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                       <span className="flex items-center justify-between text-[11px]">
                         <span className="flex items-center gap-1.5 text-slate-700 font-bold">
                           <span className={`w-2 h-2 rounded-full ${
                             bpEval.category === 'normal' ? 'bg-emerald-500' :
                             bpEval.category === 'elevated' ? 'bg-yellow-500' :
                             bpEval.category === 'stage1' ? 'bg-amber-500' :
                             bpEval.category === 'stage2' ? 'bg-rose-500' :
                             bpEval.category === 'crisis' ? 'bg-red-700' : 'bg-slate-400'
                           }`} />
                           <span>သွေးပေါင်: {latestBP.systolic}/{latestBP.diastolic}</span>
                         </span>
                         <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                       </span>
                       <span className={`block text-[11px] font-bold mt-0.5 pl-3.5 ${bpEval.color}`}>
                         {statusWithLabel(plainBPStatus(bpEval.category), bpEval.labelMm, bpEval.category === 'normal', bpEval.isPediatric)}
                       </span>
                       <span className="block text-[10px] text-slate-400 font-semibold pl-3.5">တိုင်းတာတဲ့နေ့: {dateTimeLabel(latestBP)} · {bpConditionLabel(latestBP.condition)}</span>
                     </button>
                   )}

                   {latestGlu && (
                     <button onClick={() => openMetricTab('sugar')} className="w-full text-left p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                       <span className="flex items-center justify-between text-[11px]">
                         <span className="flex items-center gap-1.5 text-slate-700 font-bold">
                           <span className={`w-2 h-2 rounded-full ${
                             gluEval?.status === 'normal' ? 'bg-emerald-500' :
                             gluEval?.status === 'pre_diabetic' ? 'bg-amber-500' :
                             gluEval?.status === 'low' ? 'bg-blue-500' : 'bg-rose-500'
                           }`} />
                           <span>သွေးချို: {latestGluValue ?? '—'} {normalizeGlucoseType(latestGlu.type || latestGlu.timing) === 'hba1c' ? '%' : 'mg/dL'}</span>
                         </span>
                         <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                       </span>
                       {gluEval ? (
                         <span className={`block text-[11px] font-bold mt-0.5 pl-3.5 ${gluEval.color}`}>
                           {statusWithLabel(plainGluStatus(gluEval.status), gluEval.labelMm, gluEval.status === 'normal')}
                         </span>
                       ) : (
                         <span className="block text-[11px] font-bold mt-0.5 pl-3.5 text-slate-400">—</span>
                       )}
                       <span className="block text-[10px] text-slate-400 font-semibold pl-3.5">တိုင်းတာတဲ့နေ့: {dateTimeLabel(latestGlu)} · {glucoseSeriesLabel(latestGlu.type || latestGlu.timing)}</span>
                     </button>
                   )}

                   {latestBMI && bmiEval && (
                     <button onClick={() => openMetricTab('bmi')} className="w-full text-left p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                       <span className="flex items-center justify-between text-[11px]">
                         <span className="flex items-center gap-1.5 text-slate-700 font-bold">
                           <span className={`w-2 h-2 rounded-full ${
                             bmiEval.category === 'normal' ? 'bg-emerald-500' :
                             bmiEval.category === 'underweight' ? 'bg-blue-500' :
                             bmiEval.category === 'overweight' ? 'bg-amber-500' : 'bg-rose-500'
                           }`} />
                           <span>BMI: {latestBMI.bmi}</span>
                         </span>
                         <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                       </span>
                       <span className={`block text-[11px] font-bold mt-0.5 pl-3.5 ${bmiEval.color}`}>
                         {statusWithLabel(plainBMIStatus(bmiEval.category), bmiEval.labelMm, bmiEval.category === 'normal', bmiEval.isPediatric)}
                       </span>
                       <span className="block text-[10px] text-slate-400 font-semibold pl-3.5">တိုင်းတာတဲ့နေ့: {recordDate(latestBMI)}</span>
                     </button>
                   )}
                 </div>
               )}
            </div>
          </div>

          {/* Menu Items — grouped under small section headers (v2.4.15)
              so the list reads as 3 groups, not ~13 loose items. No item
              was removed and no onClick behaviour changed. */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <p className="px-3 pt-2 pb-1 text-[10px] font-extrabold tracking-wide text-slate-400">လုပ်ဆောင်ချက်များ</p>
            <MenuItem icon={FileText} label="ဆေးခန်းပြရန် PDF ထုတ်မည်" onClick={() => { onOpenPassportModal(); onClose(); }} />
            <MenuItem icon={Bell} label="သတိပေးချက်များ" badge={unreadCount} onClick={() => { onOpenNotifications(); onClose(); }} />
            
            {onOpenDataBackup && (
              <MenuItem 
                icon={Database} 
                label="ဒေတာ ထုတ်ယူ / ပြန်သွင်းမည်" 
                onClick={() => { onOpenDataBackup(); onClose(); }} 
              />
            )}

            <div className="border-t border-slate-100 my-2 pt-2">
                <p className="px-3 pb-1 text-[10px] font-extrabold tracking-wide text-slate-400">ကျန်းမာရေး အပိုင်းများ</p>
                <MenuItem icon={Activity} label="ကျန်းမာရေး မှတ်တမ်းများ" onClick={() => { setActiveTab('trends'); setCategoryGroup('records'); onClose(); }} />
                <MenuItem icon={BookOpen} label="သိမှတ်ဖွယ်ရာများ" onClick={() => { setActiveTab('home_testing_guide'); setCategoryGroup('knowledge'); onClose(); }} />
                <MenuItem icon={Users} label="အထူး ဂရုစိုက်ပေးရန် လိုသူများ" onClick={() => { setActiveTab('special_needs'); setCategoryGroup('family_care'); onClose(); }} />
                <MenuItem icon={Stethoscope} label="အထူးကုနှင့် ကုထုံးများ" onClick={() => { setActiveTab('physio'); setCategoryGroup('specialty'); onClose(); }} />
                <MenuItem icon={ShieldAlert} label="အရေးပေါ်နှင့် ကာကွယ်ရေး" onClick={() => { setActiveTab('firstaid'); setCategoryGroup('emergency'); onClose(); }} />
            </div>
            
            <div className="border-t border-slate-100 my-2 pt-2">
                <p className="px-3 pb-1 text-[10px] font-extrabold tracking-wide text-slate-400">အကောင့်နှင့် စနစ်</p>
                <MenuItem icon={HelpCircle} label="အသုံးပြုနည်း" onClick={() => { onOpenUserGuide(); onClose(); }} />
                {onOpenProfileEdit && (
                  <MenuItem icon={User} label="ကိုယ်ရေးအချက်အလက် ပြင်ဆင်မည်" onClick={() => { onOpenProfileEdit(); onClose(); }} />
                )}
                {isPasswordUser && onOpenChangePassword && (
                  <MenuItem icon={Lock} label="စကားဝှက် ပြောင်းမည်" onClick={() => { onOpenChangePassword(); onClose(); }} />
                )}
                <MenuItem icon={ShieldCheck} label="မူဝါဒ & ဒေတာလုံခြုံရေး" onClick={() => { onOpenPrivacyPolicy(); onClose(); }} />
                
                {onManualCheckVersion && (
                  <button 
                    onClick={() => { onManualCheckVersion(); onClose(); }} 
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50 text-emerald-900 cursor-pointer font-bold text-sm my-1 bg-emerald-50/50 border border-emerald-100/80 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <RefreshCw className="w-5 h-5 text-emerald-600" />
                      <span>စနစ်ဗားရှင်း စစ်ဆေးမည်</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold font-mono">
                      စစ်ဆေးမည်
                    </span>
                  </button>
                )}

                <button 
                  onClick={() => { onOpenVersionHistory(); onClose(); }} 
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <History className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-sm">ဗားရှင်း မှတ်တမ်း</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold font-mono">
                      {CURRENT_SYSTEM_VERSION}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </button>
            </div>

            {onOpenDeleteAccount && (
              <div className="border-t border-slate-100 my-2 pt-2">
                <button
                  onClick={() => { onOpenDeleteAccount(); onClose(); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-rose-600 hover:bg-rose-50 cursor-pointer font-bold text-xs transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  <span>အကောင့်နှင့် ဒေတာအားလုံး ဖျက်မည်</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 space-y-2">
            <PWAInstallButton className="w-full justify-center" />
            <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center gap-3 p-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold cursor-pointer">
              <LogOut className="w-5 h-5" />
              အကောင့်ထွက်မည်
            </button>
          </div>
        </div>
      </div>

      {/* Logout confirmation (v2.4.16, A-L5) */}
      <Modal isOpen={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} title="အကောင့်ထွက်မည်" size="sm">
        <p className="text-sm text-slate-700 leading-relaxed">အကောင့်ထွက်မှာ သေချာပါသလား? ထွက်လိုက်ရင် ဒီစက်ပေါ်က အကောင့်ထဲ ပြန်ဝင်ရပါမယ်။</p>
        <div className="flex gap-2 justify-end mt-5">
          <button onClick={() => setShowLogoutConfirm(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm cursor-pointer">မထွက်သေးပါ</button>
          <button onClick={() => { setShowLogoutConfirm(false); logout(); }} className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-sm cursor-pointer">အကောင့်ထွက်မည်</button>
        </div>
      </Modal>
    </>
  );
};

const MenuItem = ({ icon: Icon, label, badge, onClick }: any) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 text-slate-700 cursor-pointer">
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-emerald-600" />
      <span className="font-bold text-sm">{label}</span>
    </div>
    <div className="flex items-center gap-1.5">
      {badge !== undefined && badge > 0 && (
        <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
          {badge}
        </span>
      )}
      <ChevronRight className="w-4 h-4 text-slate-300" />
    </div>
  </button>
);
