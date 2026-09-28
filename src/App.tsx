import React, { useState, useEffect } from 'react';
import { 
  Activity, 
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
  Award
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HealthDataProvider, useHealthData } from './context/HealthDataContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { LoginScreen } from './components/auth/LoginScreen';
import { NotificationCenterModal } from './components/modules/NotificationCenterModal';
import { VersionHistoryModal, CURRENT_SYSTEM_VERSION } from './components/modules/VersionHistoryModal';
import { UserGuideModal } from './components/modules/UserGuideModal';
import { HealthPassportModal } from './components/modules/HealthPassportModal';
import { BloodPressureModule } from './components/modules/BloodPressureModule';
import { BloodSugarModule } from './components/modules/BloodSugarModule';
import { LabTestModule } from './components/modules/LabTestModule';
import { MedicationsModule } from './components/modules/MedicationsModule';
import { BMIModule } from './components/modules/BMIModule';
import { TrendsOverview } from './components/modules/TrendsOverview';
import { AdminPatientPortal } from './components/modules/AdminPatientPortal';
import { HealthNewsModule } from './components/modules/HealthNewsModule';
import { DoctorQnAModule } from './components/modules/DoctorQnAModule';
import { RemindersModule } from './components/modules/RemindersModule';
import { VaccinePassportModule } from './components/modules/VaccinePassportModule';
import { EmergencyIDModule } from './components/modules/EmergencyIDModule';
import { ClinicalDietModule } from './components/modules/ClinicalDietModule';
import { PhysiotherapyModule } from './components/modules/PhysiotherapyModule';
import { SpecialtyCareModule } from './components/modules/SpecialtyCareModule';
import { DermatologyModule } from './components/modules/DermatologyModule';
import { EmergencyFirstAidModule } from './components/modules/EmergencyFirstAidModule';
import { HomeMedicinesGuideModule } from './components/modules/HomeMedicinesGuideModule';
import { LabInvestigationGuideModule } from './components/modules/LabInvestigationGuideModule';
import { WomensHealthModule } from './components/modules/WomensHealthModule';
import { PregnancyCareModule } from './components/modules/PregnancyCareModule';
import { ChildCareModule } from './components/modules/ChildCareModule';
import { ChildMilestonesModule } from './components/modules/ChildMilestonesModule';
import { ElderlyCareModule } from './components/modules/ElderlyCareModule';
import { PrivacyPolicyModal } from './components/modules/PrivacyPolicyModal';
import { BroadcastMarqueeBanner } from './components/layout/BroadcastMarqueeBanner';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';

const MainContent: React.FC = () => {
  const { profile, isAdmin, logout, loading } = useAuth();
  const { selectedPatient, setSelectedPatientId, doctorQuestions } = useHealthData();
  const { unreadCount } = useNotifications();
  const [activeTab, setActiveTab] = useState<
    'trends' | 'bp' | 'sugar' | 'bmi' | 'labs' | 'medications' | 'otc_meds' | 'news' | 'investigations_guide' | 'doctor_qa' | 'reminders' | 'vaccine' | 'emergency' | 'diet' | 'physio' | 'specialty' | 'derma' | 'firstaid' | 'womens_health' | 'pregnancy' | 'child_care' | 'milestones' | 'elderly_care' | 'admin'
  >(isAdmin ? 'admin' : 'trends');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);
  const [showVersionUpdateModal, setShowVersionUpdateModal] = useState(false);
  const [latestAppVersion, setLatestAppVersion] = useState(CURRENT_SYSTEM_VERSION);

  // Force pure clean light theme by default ("အဖြူခံနဲ့ ရိုးရိုးလေး")
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');

    // Safe Version Check & Popup Trigger
    const lastSeenVersion = localStorage.getItem('myanmar_health_app_version');
    if (!lastSeenVersion || lastSeenVersion !== CURRENT_SYSTEM_VERSION) {
      setShowVersionUpdateModal(true);
      localStorage.setItem('myanmar_health_app_version', CURRENT_SYSTEM_VERSION);
    }
  }, []);

  // Automatically ensure Admin opens to Admin Dashboard by default
  useEffect(() => {
    if (isAdmin) {
      setActiveTab('admin');
    }
  }, [isAdmin]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 text-xs font-semibold">ကျန်းမာရေးစနစ် စစ်ဆေးနေပါသည်...</p>
        </div>
      </div>
    );
  }

  // Login Screen
  if (!profile) {
    return <LoginScreen />;
  }

  const pendingQuestionsCount = doctorQuestions.filter(q => q.status === 'pending').length;

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
      nameMm: '👶 မိခင်၊ ကလေးနှင့် သက်ကြီးစောင့်ရှောက်မှု',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      activeColor: 'bg-amber-600 text-white shadow-xs',
      tabs: [
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
        { id: 'otc_meds', label: 'အိမ်သုံးဆေးဝါးလမ်းညွှန်', icon: Pill, activeColor: 'bg-teal-700 text-white' },
        { id: 'news', label: 'ကျန်းမာရေးဆောင်းပါး', icon: Newspaper, activeColor: 'bg-teal-600 text-white' },
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
        { id: 'doctor_qa', label: isAdmin ? 'ဆရာဝန် Q&A' : 'ဆရာဝန်နှင့် တိုင်ပင်ရန်', icon: MessageSquareHeart, activeColor: 'bg-indigo-600 text-white', badge: pendingQuestionsCount },
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
        { id: 'admin', label: 'Admin Dashboard', icon: ShieldCheck, activeColor: 'bg-indigo-600 text-white' }
      ]
    }] : [])
  ];

  // Active Category Group State
  const initialGroup = moduleCategories.find(cat => cat.tabs.some(t => t.id === activeTab))?.id || 'records';
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState<string>(initialGroup);

  // Sync category group when activeTab changes
  useEffect(() => {
    const found = moduleCategories.find(cat => cat.tabs.some(t => t.id === activeTab));
    if (found) {
      setSelectedCategoryGroup(found.id);
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 flex flex-col font-sans">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenUserGuide={() => setIsUserGuideOpen(true)}
        onOpenPrivacyPolicy={() => setIsPrivacyPolicyOpen(true)}
        onOpenVersionHistory={() => setIsVersionHistoryOpen(true)}
        onOpenPassportModal={() => setIsPassportOpen(true)}
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
        />
        <BroadcastMarqueeBanner />
      </div>

      {/* Spacer to prevent content from hiding under fixed header */}
      <div className="h-[105px] sm:h-[110px] shrink-0" />

      {/* Selected Patient Banner for Admin (Simple & Crisp) */}
      {selectedPatient && isAdmin && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>လက်ရှိ ကြည့်ရှုနေသော အသုံးပြုသူ: <strong>{selectedPatient.displayName}</strong></span>
          </div>
          <button 
            onClick={() => setSelectedPatientId(null)}
            className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
          >
            အသုံးပြုသူများ စာရင်းသို့ ပြန်သွားမည် ✕
          </button>
        </div>
      )}

      {/* Sticky Active Category Title Header */}
      <div className="bg-white border-b border-slate-200 sticky top-[105px] sm:top-[110px] z-30 w-full shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-extrabold flex items-center gap-1.5">
              {moduleCategories.find(cat => cat.id === selectedCategoryGroup)?.nameMm || '📊 ကျန်းမာရေး မှတ်တမ်းများ'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold hidden sm:inline">ကဏ္ဍပြောင်းရန်:</span>
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
            >
              {moduleCategories.map(cat => (
                <optgroup key={cat.id} label={cat.nameMm}>
                  {cat.tabs.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area - Pure White Clean Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
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
        {activeTab === 'otc_meds' && <HomeMedicinesGuideModule />}
        {activeTab === 'news' && <HealthNewsModule />}
        {activeTab === 'investigations_guide' && <LabInvestigationGuideModule />}
        {activeTab === 'reminders' && <RemindersModule />}
        {activeTab === 'womens_health' && <WomensHealthModule />}
        {activeTab === 'pregnancy' && <PregnancyCareModule />}
        {activeTab === 'child_care' && <ChildCareModule />}
        {activeTab === 'milestones' && <ChildMilestonesModule />}
        {activeTab === 'elderly_care' && <ElderlyCareModule />}
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

      {/* Modals */}
      <HealthPassportModal
        isOpen={isPassportOpen}
        onClose={() => setIsPassportOpen(false)}
      />
      <NotificationCenterModal 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
      />
      <VersionHistoryModal
        isOpen={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
      />
      <UserGuideModal
        isOpen={isUserGuideOpen}
        onClose={() => setIsUserGuideOpen(false)}
      />
      <PrivacyPolicyModal
        isOpen={isPrivacyPolicyOpen}
        onClose={() => setIsPrivacyPolicyOpen(false)}
      />

      {/* Automatic Version Upgrade / Update Popup Modal */}
      {showVersionUpdateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4 mx-auto">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>

            <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white">
              🎉 အက်ပ်ဗားရှင်းအသစ်သို့ တင်မြှင့်ပြီးပါပြီ!
            </h3>
            <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-1">
              ဗားရှင်း <strong className="text-teal-600 font-bold">{latestAppVersion}</strong> သို့ အလိုအလျောက် အပ်ဒိတ်လုပ်ပြီးစီးပါပြီ။
            </p>

            <div className="mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="font-bold flex items-center gap-1.5 text-teal-700 dark:text-teal-300">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                <span>ပါဝင်လာသော အဓိက ပြောင်းလဲမှုများ:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                <li>သွေးပေါင်ချိန် တိုင်းတာချက်နှင့် Graph ကို Chronological Order အမှန်အတိုင်း ပြသခြင်း</li>
                <li>Graph တွင် သွေးပေါင်ချိန် တန်ဖိုး ဂဏန်း Label များ တိုက်ရိုက် တပ်ဆင်ထားခြင်း</li>
                <li>နောက်ဆုံး တိုင်းတာချက်ကို အတိအကျ timestamp အလိုက် ရွေးချယ်ဖော်ပြခြင်း</li>
                <li>အသုံးပြုသူများအလိုက် Filter ပြုလုပ် ရှာဖွေ/နှိုင်းယှဉ်နိုင်သော စနစ် ပါဝင်ခြင်း</li>
              </ul>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => {
                  setShowVersionUpdateModal(false);
                  setIsVersionHistoryOpen(true);
                }}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                ပြောင်းလဲမှုမှတ်တမ်း (Change Log) ကြည့်ရန်
              </button>
              <button
                onClick={() => setShowVersionUpdateModal(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                စတင်အသုံးပြုမည်
              </button>
            </div>
          </div>
        </div>
      )}

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

