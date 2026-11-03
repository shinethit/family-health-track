import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { 
  Activity, 
  AlertTriangle,
  Droplets, 
  FlaskConical, 
  Pill, 
  TrendingUp, 
  ShieldCheck, 
  Heart, 
  Scale, 
  Newspaper,
  MessageSquareHeart,
  BookOpen,
  History,
  BellRing,
  Syringe,
  ShieldAlert,
  Utensils,
  Smile,
  Sparkles,
  Flame,
  Baby,
  Users,
  Award,
  ChevronDown,
  HeartPulse,
  CheckCircle2,
  RefreshCw,
  X
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HealthDataProvider, useHealthData } from './context/HealthDataContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { LoginScreen } from './components/auth/LoginScreen';
import { CURRENT_SYSTEM_VERSION } from './constants/version';
import { db } from './lib/firebase';

// Lazy-loaded Modals
const NotificationCenterModal = lazy(() => import('./components/modules/NotificationCenterModal').then(m => ({ default: m.NotificationCenterModal })));
const VersionHistoryModal = lazy(() => import('./components/modules/VersionHistoryModal').then(m => ({ default: m.VersionHistoryModal })));
const VersionUpdateModal = lazy(() => import('./components/modules/VersionUpdateModal'));
const UserGuideModal = lazy(() => import('./components/modules/UserGuideModal').then(m => ({ default: m.UserGuideModal })));
const HealthPassportModal = lazy(() => import('./components/modules/HealthPassportModal').then(m => ({ default: m.HealthPassportModal })));
const PrivacyPolicyModal = lazy(() => import('./components/modules/PrivacyPolicyModal').then(m => ({ default: m.PrivacyPolicyModal })));
const DataBackupModal = lazy(() => import('./components/modules/DataBackupModal').then(m => ({ default: m.DataBackupModal })));
const DeleteAccountModal = lazy(() => import('./components/modules/DeleteAccountModal').then(m => ({ default: m.DeleteAccountModal })));

// Lazy-loaded Health Modules
const BloodPressureModule = lazy(() => import('./components/modules/BloodPressureModule').then(m => ({ default: m.BloodPressureModule })));
const BloodSugarModule = lazy(() => import('./components/modules/BloodSugarModule').then(m => ({ default: m.BloodSugarModule })));
const LabTestModule = lazy(() => import('./components/modules/LabTestModule').then(m => ({ default: m.LabTestModule })));
const MedicationsModule = lazy(() => import('./components/modules/MedicationsModule').then(m => ({ default: m.MedicationsModule })));
const BMIModule = lazy(() => import('./components/modules/BMIModule').then(m => ({ default: m.BMIModule })));
const TrendsOverview = lazy(() => import('./components/modules/TrendsOverview').then(m => ({ default: m.TrendsOverview })));
const AdminPatientPortal = lazy(() => import('./components/modules/AdminPatientPortal').then(m => ({ default: m.AdminPatientPortal })));
const HealthNewsModule = lazy(() => import('./components/modules/HealthNewsModule').then(m => ({ default: m.HealthNewsModule })));
const DoctorQnAModule = lazy(() => import('./components/modules/DoctorQnAModule').then(m => ({ default: m.DoctorQnAModule })));
const RemindersModule = lazy(() => import('./components/modules/RemindersModule').then(m => ({ default: m.RemindersModule })));
const VaccinePassportModule = lazy(() => import('./components/modules/VaccinePassportModule').then(m => ({ default: m.VaccinePassportModule })));
const EmergencyIDModule = lazy(() => import('./components/modules/EmergencyIDModule').then(m => ({ default: m.EmergencyIDModule })));
const ClinicalDietModule = lazy(() => import('./components/modules/ClinicalDietModule').then(m => ({ default: m.ClinicalDietModule })));
const PhysiotherapyModule = lazy(() => import('./components/modules/PhysiotherapyModule').then(m => ({ default: m.PhysiotherapyModule })));
const SpecialtyCareModule = lazy(() => import('./components/modules/SpecialtyCareModule').then(m => ({ default: m.SpecialtyCareModule })));
const DermatologyModule = lazy(() => import('./components/modules/DermatologyModule').then(m => ({ default: m.DermatologyModule })));
const EmergencyFirstAidModule = lazy(() => import('./components/modules/EmergencyFirstAidModule').then(m => ({ default: m.EmergencyFirstAidModule })));
const HomeMedicinesGuideModule = lazy(() => import('./components/modules/HomeMedicinesGuideModule').then(m => ({ default: m.HomeMedicinesGuideModule })));
const HomeTestingGuideModule = lazy(() => import('./components/modules/HomeTestingGuideModule').then(m => ({ default: m.HomeTestingGuideModule })));
const LabInvestigationGuideModule = lazy(() => import('./components/modules/LabInvestigationGuideModule').then(m => ({ default: m.LabInvestigationGuideModule })));
const WomensHealthModule = lazy(() => import('./components/modules/WomensHealthModule').then(m => ({ default: m.WomensHealthModule })));
const PregnancyCareModule = lazy(() => import('./components/modules/PregnancyCareModule').then(m => ({ default: m.PregnancyCareModule })));
const ChildCareModule = lazy(() => import('./components/modules/ChildCareModule').then(m => ({ default: m.ChildCareModule })));
const ChildMilestonesModule = lazy(() => import('./components/modules/ChildMilestonesModule').then(m => ({ default: m.ChildMilestonesModule })));
const ElderlyCareModule = lazy(() => import('./components/modules/ElderlyCareModule').then(m => ({ default: m.ElderlyCareModule })));
const SpecialNeedsCareModule = lazy(() => import('./components/modules/SpecialNeedsCareModule').then(m => ({ default: m.SpecialNeedsCareModule })));
import { BroadcastMarqueeBanner } from './components/layout/BroadcastMarqueeBanner';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { FamilyMembersBar } from './components/family/FamilyMembersBar';
import { ChangePasswordModal } from './components/auth/ChangePasswordModal';
import { ProfileSetupModal } from './components/modules/ProfileSetupModal';

const MainContent: React.FC = () => {
  const { currentUser, profile, isAdmin, logout, loading, authAttempting } = useAuth();
  const { selectedPatient, setSelectedPatientId, doctorQuestions, allDoctorQuestions, broadcastTickers, bpRecords, glucoseRecords, bmiRecords, labRecords, medications, dataLoading } = useHealthData();
  const { unreadCount, notifications } = useNotifications();
  const [activeTab, setActiveTab] = useState<
    'trends' | 'bp' | 'sugar' | 'bmi' | 'labs' | 'medications' | 'otc_meds' | 'news' | 'home_testing_guide' | 'investigations_guide' | 'doctor_qa' | 'reminders' | 'vaccine' | 'emergency' | 'diet' | 'physio' | 'specialty' | 'derma' | 'firstaid' | 'special_needs' | 'womens_health' | 'pregnancy' | 'child_care' | 'milestones' | 'elderly_care' | 'admin'
  >(isAdmin ? 'admin' : 'trends');
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState<string>('records');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);
  const [isDataBackupOpen, setIsDataBackupOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isProfileSetupOpen, setIsProfileSetupOpen] = useState(false);
  const [showVersionUpdateModal, setShowVersionUpdateModal] = useState(false);
  const [versionUpdatePendingReload, setVersionUpdatePendingReload] = useState(false);
  const [latestAppVersion, setLatestAppVersion] = useState(CURRENT_SYSTEM_VERSION);
  const [versionToast, setVersionToast] = useState<{ message: string; type: 'checking' | 'success' | 'updated' | 'error' } | null>(null);
  const [isCheckingVersion, setIsCheckingVersion] = useState(false);

  // Q&A badge: the context's doctorQuestions list is filtered to the
  // selected patient, so counting it undercounted while an admin had a
  // user selected. Admins now count ALL pending questions; a normal user
  // sees their own pending questions plus any unread Q&A-answer
  // notifications (v2.4.10 cross-device 'qa_answered') waiting for them.
  const unreadQaAnsweredCount = notifications.filter(n => n.type === 'qa_answered' && !n.read).length;
  const qaBadgeCount = isAdmin
    ? allDoctorQuestions.filter(q => q.status === 'pending').length
    : doctorQuestions.filter(q => q.status === 'pending').length + unreadQaAnsweredCount;

  // The broadcast banner only renders when an active ticker exists — the
  // spacer / sticky offset below must match, or a dead white gap appears.
  const hasActiveBroadcast = (broadcastTickers ?? []).some((t) => t.isActive);
  // Dismiss state lives here (not in the banner) so the spacer / sticky
  // offset shrink as soon as the user dismisses the banner. A new or
  // changed set of active tickers clears the dismissal.
  const [broadcastDismissed, setBroadcastDismissed] = useState(false);
  const activeBroadcastKey = (broadcastTickers ?? [])
    .filter((t) => t.isActive)
    .map((t) => t.id)
    .sort()
    .join(',');
  useEffect(() => {
    setBroadcastDismissed(false);
  }, [activeBroadcastKey]);
  const showBroadcast = hasActiveBroadcast && !broadcastDismissed;

  // Ask once for missing profile basics after login — never mandatory:
  // the modal can always be skipped. A real SAVE stops the reminders for
  // good; a SKIP only postpones them — remind again on the next login, at
  // most twice, then stop nagging. Previously ANY close (including skip)
  // set the seen flag, so a first-time user who skipped once was
  // never reminded again and their profile stayed mostly empty.
  const profileSetupSavedRef = useRef(false);
  const markProfileSetupSeen = () => {
    if (!currentUser) return;
    try {
      localStorage.setItem(`profile_setup_seen_${currentUser.uid}`, '1');
    } catch {}
  };
  const handleProfileSetupSaved = () => {
    profileSetupSavedRef.current = true;
    markProfileSetupSeen();
  };
  const closeProfileSetup = () => {
    setIsProfileSetupOpen(false);
    if (profileSetupSavedRef.current) {
      // The close came right after a save — nothing more to do.
      profileSetupSavedRef.current = false;
      return;
    }
    if (!currentUser) return;
    try {
      const key = `profile_setup_skips_${currentUser.uid}`;
      const skips = Number(localStorage.getItem(key) || '0') + 1;
      localStorage.setItem(key, String(skips));
      if (skips >= 2) markProfileSetupSeen();
    } catch {}
  };
  useEffect(() => {
    if (loading || !currentUser || !profile) return;
    try {
      if (localStorage.getItem(`profile_setup_seen_${currentUser.uid}`)) return;
      if (Number(localStorage.getItem(`profile_setup_skips_${currentUser.uid}`) || '0') >= 2) {
        localStorage.setItem(`profile_setup_seen_${currentUser.uid}`, '1');
        return;
      }
    } catch {}
    const missingBasics = !profile.dateOfBirth && !profile.heightCm && !profile.weightKg;
    if (missingBasics) setIsProfileSetupOpen(true);
  }, [loading, currentUser, profile]);

  // First-run welcome: a brand-new user (no records at all yet) gets a
  // short 3-step checklist on the Trends tab. Dismissing it once sets the
  // flag so it never shows again; it never blocks the app.
  const hasAnyRecord =
    bpRecords.length + glucoseRecords.length + bmiRecords.length + labRecords.length + medications.length > 0;
  const [showFirstRunWelcome, setShowFirstRunWelcome] = useState(false);
  useEffect(() => {
    if (loading || dataLoading || !currentUser || isAdmin) return;
    if (hasAnyRecord) return;
    try {
      if (localStorage.getItem(`first_run_seen_${currentUser.uid}`)) return;
    } catch {}
    setShowFirstRunWelcome(true);
  }, [loading, dataLoading, currentUser, isAdmin, hasAnyRecord]);
  const dismissFirstRunWelcome = () => {
    setShowFirstRunWelcome(false);
    try {
      if (currentUser) localStorage.setItem(`first_run_seen_${currentUser.uid}`, '1');
    } catch {}
  };

  // Group Categories for Clean Navigation
  const moduleCategories = [
    {
      id: 'records',
      nameMm: '📊 ကျန်းမာရေး မှတ်တမ်းများ',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      activeColor: 'bg-emerald-600 text-white shadow-xs',
      tabs: [
        { id: 'trends', label: 'သုံးသပ်ချက်/အနှစ်ချုပ်', icon: TrendingUp, activeColor: 'bg-emerald-600 text-white' },
        { id: 'bp', label: 'သွေးပေါင်ချိန်', icon: Activity, activeColor: 'bg-rose-600 text-white' },
        { id: 'sugar', label: 'ဆီးချို/သွေးချို', icon: Droplets, activeColor: 'bg-emerald-600 text-white' },
        { id: 'bmi', label: 'BMI ညွှန်းကိန်း', icon: Scale, activeColor: 'bg-teal-600 text-white' },
        { id: 'labs', label: 'ဓာတ်ခွဲခန်း', icon: FlaskConical, activeColor: 'bg-purple-600 text-white' },
        { id: 'medications', label: 'ဆေးမှတ်တမ်း', icon: Pill, activeColor: 'bg-sky-600 text-white' },
        { id: 'reminders', label: 'သတိပေးချက်များ', icon: BellRing, activeColor: 'bg-amber-500 text-white', badge: unreadCount },
      ]
    },
    {
      id: 'family_care',
      nameMm: '🤝 အထူး ဂရုစိုက်ပေးရန် လိုသူများ',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      activeColor: 'bg-amber-600 text-white shadow-xs',
      tabs: [
        { id: 'special_needs', label: 'မသန်စွမ်းနှင့် အထူးလိုအပ်ချက်', icon: Users, activeColor: 'bg-indigo-600 text-white' },
        { id: 'womens_health', label: 'အမျိုးသမီးကျန်းမာရေး', icon: Sparkles, activeColor: 'bg-rose-600 text-white' },
        { id: 'pregnancy', label: 'ကိုယ်ဝန်ဆောင်စောင့်ရှောက်မှု', icon: Heart, activeColor: 'bg-teal-700 text-white' },
        { id: 'child_care', label: 'ကလေးငယ်ပြုစုရေး', icon: Baby, activeColor: 'bg-sky-600 text-white' },
        { id: 'milestones', label: 'ကလေးဖွံ့ဖြိုးမှုမှတ်တိုင်', icon: Award, activeColor: 'bg-amber-600 text-white' },
        { id: 'elderly_care', label: 'သက်ကြီးရွယ်အိုစောင့်ရှောက်ရေး', icon: Users, activeColor: 'bg-emerald-700 text-white' },
      ]
    },
    {
      id: 'knowledge',
      nameMm: '📚 သိမှတ်ဖွယ်ရာများ',
      badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      activeColor: 'bg-indigo-600 text-white shadow-xs',
      tabs: [
        { id: 'home_testing_guide', label: 'အိမ်တွင်းစစ်ဆေးမှုလမ်းညွှန်', icon: HeartPulse, activeColor: 'bg-rose-600 text-white' },
        { id: 'news', label: 'ကျန်းမာရေးဆောင်းပါး', icon: Newspaper, activeColor: 'bg-teal-600 text-white' },
        { id: 'otc_meds', label: 'အိမ်သုံးဆေးဝါးလမ်းညွှန်', icon: Pill, activeColor: 'bg-teal-700 text-white' },
        { id: 'investigations_guide', label: 'ဓာတ်ခွဲ/စမ်းသပ်မှုလမ်းညွှန်', icon: FlaskConical, activeColor: 'bg-indigo-600 text-white' },
      ]
    },
    {
      id: 'specialty',
      nameMm: '🩺 အထူးကုနှင့် ကုထုံးများ',
      badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
      activeColor: 'bg-teal-700 text-white shadow-xs',
      tabs: [
        { id: 'physio', label: 'ကာယကုထုံး', icon: Activity, activeColor: 'bg-emerald-600 text-white' },
        { id: 'specialty', label: 'သွား/မျက်စိ/နား', icon: Smile, activeColor: 'bg-teal-700 text-white' },
        { id: 'derma', label: 'အရေပြား/အလှအပ', icon: Sparkles, activeColor: 'bg-rose-600 text-white' },
        { id: 'diet', label: 'အာဟာရလမ်းညွှန်', icon: Utensils, activeColor: 'bg-emerald-700 text-white' },
        { id: 'doctor_qa', label: isAdmin ? 'ဆရာဝန် Q&A' : 'ဆရာဝန်နှင့် တိုင်ပင်ရန်', icon: MessageSquareHeart, activeColor: 'bg-indigo-600 text-white', badge: qaBadgeCount },
      ]
    },
    {
      id: 'emergency',
      nameMm: '🚨 အရေးပေါ်နှင့် ကာကွယ်ရေး',
      badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
      activeColor: 'bg-rose-600 text-white shadow-xs',
      tabs: [
        { id: 'firstaid', label: 'ရှေးဦးပြုစုခြင်း', icon: ShieldAlert, activeColor: 'bg-red-600 text-white' },
        { id: 'emergency', label: 'အရေးပေါ် ID', icon: ShieldAlert, activeColor: 'bg-rose-700 text-white' },
        { id: 'vaccine', label: 'ကာကွယ်ဆေး', icon: Syringe, activeColor: 'bg-teal-700 text-white' },
      ]
    },
    ...(isAdmin ? [{
      id: 'admin',
      nameMm: '🛡️ စနစ်စီမံခန့်ခွဲမှု',
      badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      activeColor: 'bg-indigo-600 text-white shadow-xs',
      tabs: [
        { id: 'admin', label: 'Admin ဒက်ရှ်ဘုတ်', icon: ShieldCheck, activeColor: 'bg-indigo-600 text-white' }
      ]
    }] : [])
  ];

  // Sync category group and scroll cleanly to top when activeTab changes
  useEffect(() => {
    const found = moduleCategories.find(cat => cat.tabs.some(t => t.id === activeTab));
    if (found) {
      setSelectedCategoryGroup(found.id);
    }
    // Instantly scroll window to top so user always lands at the top of the selected tab
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // Bundle hash this page actually loaded (production build only).
  // Returns null on the dev server, where scripts are served from /src.
  const getLoadedBundleHash = (): string | null => {
    const script = document.querySelector('script[src*="/assets/index-"]');
    const match = script?.getAttribute('src')?.match(/\/assets\/index-([A-Za-z0-9_-]+)\.js/);
    return match ? match[1] : null;
  };

  // Real Version Check: compares the bundle hash this page loaded with the
  // bundle hash the live server is currently serving. The old check only
  // compared a localStorage value with CURRENT_SYSTEM_VERSION, so it always
  // reported success and could never tell that a new deploy had arrived.
  const handleCheckVersion = async (isManual = false) => {
    if (isCheckingVersion) return;
    setIsCheckingVersion(true);
    if (isManual) {
      setVersionToast({ message: 'စနစ်ဗားရှင်း စစ်ဆေးနေပါသည်...', type: 'checking' });
    }
    try {
      const loadedHash = getLoadedBundleHash();
      if (!loadedHash) {
        // Dev server / non-bundled page: no bundle hash to compare.
        // Fall back to the old localStorage behaviour.
        const lastSeen = localStorage.getItem('myanmar_health_app_version');
        if (!lastSeen || lastSeen !== CURRENT_SYSTEM_VERSION) {
          localStorage.setItem('myanmar_health_app_version', CURRENT_SYSTEM_VERSION);
          setVersionUpdatePendingReload(false);
          setShowVersionUpdateModal(true);
          setVersionToast({
            message: `🔄 စနစ်ဗားရှင်းသစ် ${CURRENT_SYSTEM_VERSION} သို့ အောင်မြင်စွာ အဆင့်မြှင့်လိုက်ပါပြီ!`,
            type: 'updated',
          });
        } else if (isManual) {
          setVersionToast({
            message: `✅ သင်သည် နောက်ဆုံးပေါ် စနစ်ဗားရှင်း ${CURRENT_SYSTEM_VERSION} ကို အသုံးပြုနေပါသည်!`,
            type: 'success',
          });
        }
        return;
      }

      // Cache-buster + no-store so the service worker / edge cache cannot
      // answer with the stale index page this device already has.
      const res = await fetch(`/?_v=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      const servedMatch = html.match(/\/assets\/index-([A-Za-z0-9_-]+)\.js/);
      if (!servedMatch) throw new Error('No bundle hash in served page');
      const servedHash = servedMatch[1];

      if (servedHash !== loadedHash) {
        // A newer deploy is live on the server — this page is stale.
        setLatestAppVersion(CURRENT_SYSTEM_VERSION);
        setVersionUpdatePendingReload(true);
        setShowVersionUpdateModal(true);
        setVersionToast({
          message: '🔄 ဗားရှင်းအသစ် ရောက်ရှိနေပါသည် — စာမျက်နှာကို ပြန်ဖွင့်ပြီး (Reload) အသစ်ရယူပါ။',
          type: 'updated',
        });
      } else if (isManual) {
        setVersionToast({
          message: `✅ သင်သည် နောက်ဆုံးပေါ် စနစ်ဗားရှင်း ${CURRENT_SYSTEM_VERSION} ကို အသုံးပြုနေပါသည်!`,
          type: 'success',
        });
      }
    } catch (e) {
      console.warn('Version check failed:', e);
      if (isManual) {
        setVersionToast({
          message: '⚠️ ဗားရှင်း စစ်ဆေးခြင်း မအောင်မြင်ပါ — အင်တာနက် ချိတ်ဆက်မှု စစ်ပြီး ပြန်ကြိုးစားပါ။',
          type: 'error',
        });
      }
      // Auto check stays silent on failure — never claim up-to-date.
    } finally {
      setIsCheckingVersion(false);
      setTimeout(() => setVersionToast(null), 3500);
    }
  };

  // Background Auto-Check Version Engine (on load + on focus/visibility change)
  // No 30-second polling interval any more: a real server check whenever
  // the user returns to the app is enough, and polling was needless chatter.
  useEffect(() => {
    handleCheckVersion(false);

    const handleFocus = () => handleCheckVersion(false);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  // Force pure clean light theme by default ("အဖြူခံနဲ့ ရိုးရိုးလေး")
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }, []);

  // Automatically ensure Admin opens to Admin Dashboard by default
  useEffect(() => {
    if (isAdmin) {
      setActiveTab('admin');
    }
  }, [isAdmin]);
  
  


  

  // Loading state: full-screen spinner ONLY for the initial app boot.
  // During a login / register / Google attempt the login form must stay
  // visible (it shows its own inline button spinner) so the user can see
  // what is happening and retry — previously the form vanished behind
  // this spinner for the whole attempt.
  if (loading && !authAttempting) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 text-xs font-semibold">ကျန်းမာရေးစနစ် စစ်ဆေးနေပါသည်...</p>
        </div>
      </div>
    );
  }

  // Show Login Screen strictly when no Firebase currentUser is authenticated
  if (!currentUser) {
    return <LoginScreen />;
  }

  // Get current active Category and ONLY its sub-category tabs
  const currentCategory = moduleCategories.find(cat => cat.id === selectedCategoryGroup) || moduleCategories[0];
  const currentCategoryTabs = currentCategory.tabs;

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 flex flex-col font-sans">
      {/* Live Version Check Toast Notification */}
      {versionToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-xl border border-indigo-200 bg-white/95 text-slate-900 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-2 backdrop-blur-md">
          {versionToast.type === 'checking' && (
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0" />
          )}
          {versionToast.type === 'success' && (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          {versionToast.type === 'updated' && (
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 animate-bounce" />
          )}
          {versionToast.type === 'error' && (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className={
            versionToast.type === 'updated' 
              ? 'text-indigo-950 font-extrabold' 
              : versionToast.type === 'success' 
              ? 'text-emerald-900' 
              : versionToast.type === 'error'
              ? 'text-rose-900'
              : 'text-indigo-900'
          }>
            {versionToast.message}
          </span>
        </div>
      )}

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenUserGuide={() => setIsUserGuideOpen(true)}
        onOpenPrivacyPolicy={() => setIsPrivacyPolicyOpen(true)}
        onOpenVersionHistory={() => setIsVersionHistoryOpen(true)}
        onOpenPassportModal={() => setIsPassportOpen(true)}
        onOpenDataBackup={() => setIsDataBackupOpen(true)}
        onOpenDeleteAccount={() => setIsDeleteAccountOpen(true)}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
        onOpenProfileEdit={() => setIsProfileSetupOpen(true)}
        onManualCheckVersion={() => handleCheckVersion(true)}
        setActiveTab={(tab) => setActiveTab(tab as any)}
        setCategoryGroup={setSelectedCategoryGroup}
      />
      {/* Fixed Top Section: Navbar & Marquee */}
      <div className="fixed top-0 left-0 right-0 z-40 w-full bg-white shadow-md">
        <Navbar 
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenPassportModal={() => setIsPassportOpen(true)}
          onOpenVersionHistory={() => setIsVersionHistoryOpen(true)}
          onManualCheckVersion={() => handleCheckVersion(true)}
        />
        <BroadcastMarqueeBanner dismissed={broadcastDismissed} onDismiss={() => setBroadcastDismissed(true)} />
      </div>

      {/* Spacer to prevent content from hiding under fixed header.
          Only as tall as the header + banner when a broadcast is showing;
          otherwise the banner renders null and the tall spacer leaves a
          dead white gap under the navbar. */}
      <div className={showBroadcast ? "h-[105px] sm:h-[110px] shrink-0" : "h-16 shrink-0"} />

      {/* Selected Patient Banner for Admin (Simple & Crisp) */}
      {selectedPatient && isAdmin && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>လက်ရှိ ကြည့်ရှုနေသော အသုံးပြုသူ: <strong>{selectedPatient.displayName}</strong></span>
          </div>
          <button
            onClick={() => { setSelectedPatientId(null); setActiveTab('admin'); }}
            className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
          >
            အသုံးပြုသူများ စာရင်းသို့ ပြန်သွားမည် ✕
          </button>
        </div>
      )}

      
      {/* Clean Minimal Module Indicator */}
      <div className={`bg-white/95 backdrop-blur-md border-b border-slate-200 sticky ${showBroadcast ? 'top-[105px] sm:top-[110px]' : 'top-16'} z-30 w-full shadow-xs`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Activity className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-800">
              {currentCategoryTabs.find(t => t.id === activeTab)?.label || 'Menu'}
            </h2>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>မော်ဂျူး ပြောင်းမည်</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
        {/* Tab strip — one-tap switching between the current category's tabs */}
        {currentCategoryTabs.length > 1 && (
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-2.5">
            <div className="flex gap-1.5 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {currentCategoryTabs.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${isActive ? tab.activeColor : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  >
                    <TabIcon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {(tab as { badge?: number }).badge !== undefined && (tab as { badge?: number }).badge! > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                        {(tab as { badge?: number }).badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {/* Main Content Area - Pure White Clean Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* First-run welcome — 3-step checklist for a brand-new user with
            no records yet. Small and dismissible; never blocks the app. */}
        {showFirstRunWelcome && activeTab === 'trends' && (
          <div className="mb-4 p-4 rounded-3xl bg-emerald-50 border border-emerald-200 shadow-xs">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-emerald-900">🎉 Family Health Track မှ ကြိုဆိုပါသည်!</h3>
                <p className="text-xs text-emerald-800 mt-1">စတင်ရန် အဆင့် ၃ ခု — တစ်ခုချင်း နှိပ်ပြီး လုပ်လို့ရပါတယ်။</p>
              </div>
              <button
                onClick={dismissFirstRunWelcome}
                aria-label="ပိတ်မည်"
                className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => setIsProfileSetupOpen(true)}
                className="px-3 py-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-900 text-xs font-bold text-left hover:bg-emerald-100/60 cursor-pointer"
              >
                ① ကိုယ်ရေးအချက်အလက် ဖြည့်ပါ
              </button>
              <button
                onClick={() => setActiveTab('bp')}
                className="px-3 py-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-900 text-xs font-bold text-left hover:bg-emerald-100/60 cursor-pointer"
              >
                ② ပထမဆုံး သွေးပေါင်ချိန် ထည့်ပါ
              </button>
              <button
                onClick={() => setActiveTab('medications')}
                className="px-3 py-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-900 text-xs font-bold text-left hover:bg-emerald-100/60 cursor-pointer"
              >
                ③ ဆေး ထည့်ပါ
              </button>
            </div>
          </div>
        )}
        {/* Family member switcher — only on the record tabs it applies to.
            (Admins see the full user directory instead; the bar hides itself.) */}
        {['bp', 'sugar', 'bmi', 'labs', 'medications'].includes(activeTab) && <FamilyMembersBar />}
        <Suspense fallback={<div className="flex items-center justify-center py-16 text-slate-500 font-medium text-sm">ဖွင့်နေသည်...</div>}>
          {activeTab === 'admin' && isAdmin && <AdminPatientPortal />}
          {activeTab === 'doctor_qa' && <DoctorQnAModule />}
          {activeTab === 'trends' && <TrendsOverview onNavigateTab={(t: any) => setActiveTab(t)} />}
          {activeTab === 'bp' && <BloodPressureModule />}
          {activeTab === 'sugar' && <BloodSugarModule />}
          {activeTab === 'bmi' && <BMIModule />}
          {activeTab === 'labs' && <LabTestModule />}
          {activeTab === 'medications' && <MedicationsModule />}
          {activeTab === 'vaccine' && <VaccinePassportModule />}
          {activeTab === 'emergency' && <EmergencyIDModule />}
          {activeTab === 'diet' && <ClinicalDietModule />}
          {activeTab === 'physio' && <PhysiotherapyModule />}
          {activeTab === 'specialty' && <SpecialtyCareModule />}
          {activeTab === 'derma' && <DermatologyModule />}
          {activeTab === 'firstaid' && <EmergencyFirstAidModule />}
          {activeTab === 'home_testing_guide' && <HomeTestingGuideModule onNavigateTab={(t: any) => setActiveTab(t)} />}
          {activeTab === 'otc_meds' && <HomeMedicinesGuideModule />}
          {activeTab === 'news' && <HealthNewsModule />}
          {activeTab === 'investigations_guide' && <LabInvestigationGuideModule />}
          {activeTab === 'reminders' && <RemindersModule />}
          {activeTab === 'special_needs' && <SpecialNeedsCareModule />}
          {activeTab === 'womens_health' && <WomensHealthModule />}
          {activeTab === 'pregnancy' && <PregnancyCareModule />}
          {activeTab === 'child_care' && <ChildCareModule />}
          {activeTab === 'milestones' && <ChildMilestonesModule />}
          {activeTab === 'elderly_care' && <ElderlyCareModule />}
        </Suspense>
      </main>

      {/* Simple Clean Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            <span className="font-semibold text-slate-800">
              မိသားစု ကျန်းမာရေး စောင့်ရှောက်မှု စနစ် (Family Health Portal)
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            <span className="text-slate-400">© 2026 Family Health Portal</span>
          </div>

          <p className="text-slate-400">
            မိသားစု ကျန်းမာရေး စောင့်ရှောက်မှု စနစ်
          </p>
        </div>
      </footer>

      {/* Modals with Suspense */}
      <Suspense fallback={null}>
        {isPassportOpen && (
          <HealthPassportModal
            isOpen={isPassportOpen}
            onClose={() => setIsPassportOpen(false)}
          />
        )}
        {isNotificationsOpen && (
          <NotificationCenterModal 
            isOpen={isNotificationsOpen} 
            onClose={() => setIsNotificationsOpen(false)} 
          />
        )}
        {isVersionHistoryOpen && (
          <VersionHistoryModal
            isOpen={isVersionHistoryOpen}
            onClose={() => setIsVersionHistoryOpen(false)}
            onManualCheckVersion={() => handleCheckVersion(true)}
          />
        )}
        {isUserGuideOpen && (
          <UserGuideModal
            isOpen={isUserGuideOpen}
            onClose={() => setIsUserGuideOpen(false)}
          />
        )}
        {isPrivacyPolicyOpen && (
          <PrivacyPolicyModal
            isOpen={isPrivacyPolicyOpen}
            onClose={() => setIsPrivacyPolicyOpen(false)}
          />
        )}
        {isDataBackupOpen && (
          <DataBackupModal
            isOpen={isDataBackupOpen}
            onClose={() => setIsDataBackupOpen(false)}
          />
        )}
        {isDeleteAccountOpen && (
          <DeleteAccountModal
            isOpen={isDeleteAccountOpen}
            onClose={() => setIsDeleteAccountOpen(false)}
          />
        )}
        {isChangePasswordOpen && (
          <ChangePasswordModal
            isOpen={isChangePasswordOpen}
            onClose={() => setIsChangePasswordOpen(false)}
          />
        )}
        {isProfileSetupOpen && (
          <ProfileSetupModal
            isOpen={isProfileSetupOpen}
            onClose={closeProfileSetup}
            onSaved={handleProfileSetupSaved}
          />
        )}
        {/* Order: the profile-setup modal goes FIRST. The version-update
            modal waits until it is closed, so the two never compete on
            first load. */}
        {showVersionUpdateModal && !isProfileSetupOpen && (
          <VersionUpdateModal
            latestAppVersion={latestAppVersion}
            pendingReload={versionUpdatePendingReload}
            onClose={() => setShowVersionUpdateModal(false)}
            onOpenFullHistory={() => {
              setShowVersionUpdateModal(false);
              setIsVersionHistoryOpen(true);
            }}
          />
        )}
      </Suspense>

      <OfflineIndicator />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <HealthDataProvider>
        <NotificationProvider>
          <MainContent />
        </NotificationProvider>
      </HealthDataProvider>
    </AuthProvider>
  );
}

export default App;

