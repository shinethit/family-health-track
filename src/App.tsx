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
import { Navbar } from './components/layout/Navbar';
import { LoginScreen } from './components/auth/LoginScreen';
import { NotificationCenterModal } from './components/modules/NotificationCenterModal';
import { VersionHistoryModal } from './components/modules/VersionHistoryModal';
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
    'trends' | 'bp' | 'sugar' | 'bmi' | 'labs' | 'medications' | 'otc_meds' | 'news' | 'doctor_qa' | 'reminders' | 'vaccine' | 'emergency' | 'diet' | 'physio' | 'specialty' | 'derma' | 'firstaid' | 'womens_health' | 'pregnancy' | 'child_care' | 'milestones' | 'elderly_care' | 'admin'
  >(isAdmin ? 'admin' : 'trends');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);

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
        { id: 'otc_meds', label: 'အိမ်သုံးဆေးဝါးလမ်းညွှန်', icon: Pill, activeColor: 'bg-teal-700 text-white' },
        { id: 'emergency', label: 'အရေးပေါ် ID', icon: ShieldAlert, activeColor: 'bg-rose-700 text-white' },
        { id: 'vaccine', label: 'ကာကွယ်ဆေး', icon: Syringe, activeColor: 'bg-teal-700 text-white' },
        { id: 'news', label: 'ကျန်းမာရေးဆောင်းပါး', icon: Newspaper, activeColor: 'bg-teal-600 text-white' },
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
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-white text-slate-900 flex flex-col font-sans">
      {/* Top Navbar - Clean, Pristine White */}
      <Navbar 
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenUserGuide={() => setIsUserGuideOpen(true)}
        onOpenVersionHistory={() => setIsVersionHistoryOpen(true)}
        onOpenPassportModal={() => setIsPassportOpen(true)}
        activeTab={activeTab} 
        setActiveTab={(tab: any) => setActiveTab(tab)} 
      />

      {/* 📢 Live Broadcast Running Text (Marquee Ticker) */}
      <BroadcastMarqueeBanner />

      {/* Medical Knowledge Notice Banner (ဗဟုသုတ သီးသန့် အသိပေးချက်) */}
      <div className="bg-slate-50 border-b border-slate-200 px-3 sm:px-6 py-1.5 text-[11px] text-slate-600 flex items-center justify-between gap-2">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded text-[10px]">အသိပေးချက်</span>
            <span className="truncate">ဤ App သည် အထွေထွေ ကျန်းမာရေး ဗဟုသုတနှင့် မိသားစု မှတ်တမ်းတင်ရန် သီးသန့် ဖြစ်ပါသည်။ ဆရာဝန်၏ တိုက်ရိုက် ကုသမှုကို အစားမထိုးပါ။</span>
          </div>
          <button 
            onClick={() => setIsPrivacyPolicyOpen(true)}
            className="text-teal-700 hover:text-teal-800 font-bold shrink-0 underline ml-2 cursor-pointer"
          >
            မူဝါဒ & ဒေတာလုံခြုံရေး
          </button>
        </div>
      </div>

      {/* Selected Patient Banner for Admin (Simple & Crisp) */}
      {selectedPatient && isAdmin && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>လက်ရှိ ကြည့်ရှုနေသော လူနာ: <strong>{selectedPatient.displayName}</strong></span>
          </div>
          <button 
            onClick={() => setSelectedPatientId(null)}
            className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
          >
            လူနာစာရင်းသို့ ပြန်သွားမည် ✕
          </button>
        </div>
      )}

      {/* Main Tab Navigation - Clean Grouped Navigation & Dropdown */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 w-full max-w-full shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 space-y-2">
          
          {/* Top Row: Category Segmented Tabs & Quick Dropdown Select */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            
            {/* Category Segmented Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {moduleCategories.map(cat => {
                const isCatActive = selectedCategoryGroup === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategoryGroup(cat.id);
                      if (!cat.tabs.some(t => t.id === activeTab)) {
                        setActiveTab(cat.tabs[0].id as any);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isCatActive
                        ? `${cat.activeColor} border-transparent shadow-xs`
                        : `bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200`
                    }`}
                  >
                    {cat.nameMm}
                  </button>
                );
              })}
            </div>

            {/* Direct Jump Dropdown Select */}
            <div className="flex items-center gap-1.5 min-w-[220px]">
              <span className="text-[11px] font-bold text-slate-500 shrink-0 hidden md:inline">တိုက်ရိုက် ရွေးရန်:</span>
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as any)}
                className="w-full bg-emerald-50/90 border border-emerald-300 text-emerald-950 text-xs font-bold rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
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

          {/* Bottom Row: Sub-Module Buttons for Current Selected Category */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
            {moduleCategories
              .find(cat => cat.id === selectedCategoryGroup)
              ?.tabs.map(t => {
                const Icon = t.icon;
                const isTabActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer relative ${
                      isTabActive
                        ? `${t.activeColor} font-bold shadow-xs`
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/90'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isTabActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{t.label}</span>
                    {t.badge && t.badge > 0 ? (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-600 text-white font-bold ml-0.5">
                        {t.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
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

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <button
              onClick={() => setIsUserGuideOpen(true)}
              className="hover:text-emerald-600 transition-colors cursor-pointer flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>အသုံးပြုနည်း လမ်းညွှန်</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsPrivacyPolicyOpen(true)}
              className="hover:text-teal-600 transition-colors cursor-pointer flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>မူဝါဒ & ဒေတာလုံခြုံရေး</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsVersionHistoryOpen(true)}
              className="hover:text-purple-600 transition-colors cursor-pointer flex items-center gap-1"
            >
              <History className="w-3.5 h-3.5" />
              <span>Version History (v2.1.0)</span>
            </button>
          </div>

          <p className="text-slate-400">
            စနစ်အုပ်ချုပ်သူ (Admin): ရှိုင်းသစ်
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

