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
  Flame
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
import { OfflineIndicator } from './components/pwa/OfflineIndicator';

const MainContent: React.FC = () => {
  const { profile, isAdmin, logout, loading } = useAuth();
  const { selectedPatient, setSelectedPatientId, doctorQuestions } = useHealthData();
  const { unreadCount } = useNotifications();
  const [activeTab, setActiveTab] = useState<
    'trends' | 'bp' | 'sugar' | 'bmi' | 'labs' | 'medications' | 'news' | 'doctor_qa' | 'reminders' | 'vaccine' | 'emergency' | 'diet' | 'physio' | 'specialty' | 'derma' | 'firstaid' | 'admin'
  >(isAdmin ? 'admin' : 'trends');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);
  const [isPassportOpen, setIsPassportOpen] = useState(false);

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

      {/* Main Tab Navigation - ZERO Horizontal Scroll */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 w-full max-w-full overflow-hidden shadow-xs">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2">
          <nav className="flex flex-wrap items-center justify-center sm:justify-start gap-1 sm:gap-1.5 text-center">
            {/* Tab: Admin Portal */}
            {isAdmin && (
              <button
                onClick={() => {
                  setSelectedPatientId(null);
                  setActiveTab('admin');
                }}
                className={`flex items-center justify-center gap-1 py-2 px-1.5 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            )}

            {/* Tab: Doctor Consult Q&A */}
            <button
              onClick={() => setActiveTab('doctor_qa')}
              className={`flex items-center justify-center gap-1 py-2 px-1.5 sm:px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer relative ${
                activeTab === 'doctor_qa'
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <MessageSquareHeart className="w-3.5 h-3.5 text-indigo-500" />
              <span>{isAdmin ? 'Q&A' : 'ဆရာဝန်'}</span>
              {pendingQuestionsCount > 0 && (
                <span className="px-1 py-0.2 rounded-full text-[10px] bg-amber-400 text-amber-950 font-bold">
                  {pendingQuestionsCount}
                </span>
              )}
            </button>

            {/* Tab: Overview & Trends */}
            <button
              onClick={() => setActiveTab('trends')}
              className={`flex items-center justify-center gap-1 py-2 px-1.5 sm:px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'trends'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>သုံးသပ်ချက်</span>
            </button>

            {/* Tab: Blood Pressure */}
            <button
              onClick={() => setActiveTab('bp')}
              className={`flex items-center justify-center gap-1 py-2 px-1.5 sm:px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'bp'
                  ? 'bg-rose-600 text-white shadow-xs font-bold'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-rose-500" />
              <span>သွေးပေါင်</span>
            </button>

            {/* Tab: Blood Sugar */}
            <button
              onClick={() => setActiveTab('sugar')}
              className={`flex items-center justify-center gap-1 py-2 px-1.5 sm:px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'sugar'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Droplets className="w-3.5 h-3.5 text-emerald-500" />
              <span>ဆီးချို</span>
            </button>

            {/* Tab: BMI & Body Metrics */}
            <button
              onClick={() => setActiveTab('bmi')}
              className={`flex items-center justify-center gap-1 py-2 px-1.5 sm:px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'bmi'
                  ? 'bg-teal-600 text-white shadow-xs font-bold'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-teal-500" />
              <span>BMI</span>
            </button>

            {/* Tab: Lab Tests */}
            <button
              onClick={() => setActiveTab('labs')}
              className={`flex items-center justify-center gap-1 py-2 px-1.5 sm:px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'labs'
                  ? 'bg-purple-600 text-white shadow-xs font-bold'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5 text-purple-500" />
              <span>ဓာတ်ခွဲခန်း</span>
            </button>

            {/* Tab: Medications */}
            <button
              onClick={() => setActiveTab('medications')}
              className={`flex items-center justify-center gap-1 py-2 px-1.5 sm:px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'medications'
                  ? 'bg-sky-600 text-white shadow-xs font-bold'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Pill className="w-3.5 h-3.5 text-sky-500" />
              <span>ဆေးမှတ်တမ်း</span>
            </button>

            {/* Tab: Vaccination Passport */}
            <button
              onClick={() => setActiveTab('vaccine')}
              className={`flex items-center justify-center gap-1 py-2 px-1.5 sm:px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'vaccine'
                  ? 'bg-teal-700 text-white shadow-xs font-bold'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Syringe className="w-3.5 h-3.5 text-teal-600" />
              <span>ကာကွယ်ဆေး</span>
            </button>

            {/* Tab: Emergency ID */}
            <button
              onClick={() => setActiveTab('emergency')}
              className={`flex items-center justify-center gap-1 py-2 px-1.5 sm:px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'emergency'
                  ? 'bg-rose-700 text-white shadow-xs font-bold'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>အရေးပေါ် ID</span>
            </button>

            {/* Tab: Dietary & Nutrition Guide */}
            <button
              onClick={() => setActiveTab('diet')}
              className={`flex items-center justify-center gap-1 py-2 px-1.5 sm:px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'diet'
                  ? 'bg-emerald-700 text-white shadow-xs font-bold'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Utensils className="w-3.5 h-3.5 text-emerald-600" />
              <span>အာဟာရ</span>
            </button>

            {/* Tab: Physiotherapy & Physical Rehab */}
            <button
              onClick={() => setActiveTab('physio')}
              className={`flex items-center justify-center gap-1 py-2 px-1.5 sm:px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'physio'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>ကာယကုထုံး</span>
            </button>

            {/* Tab: Speciality Care (Dental, Eye, Ear) */}
            <button
              onClick={() => setActiveTab('specialty')}
              className={`flex items-center justify-center gap-1 py-2 px-1.5 sm:px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'specialty'
                  ? 'bg-teal-700 text-white shadow-xs font-bold'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Smile className="w-3.5 h-3.5 text-teal-600" />
              <span>သွား/မျက်စိ/နား</span>
            </button>

            {/* Tab: Dermatology & Skincare */}
            <button
              onClick={() => setActiveTab('derma')}
              className={`flex items-center justify-center gap-1 py-2 px-1.5 sm:px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'derma'
                  ? 'bg-rose-600 text-white shadow-xs font-bold'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>အရေပြား/အလှအပ</span>
            </button>

            {/* Tab: First Aid & Emergency Care */}
            <button
              onClick={() => setActiveTab('firstaid')}
              className={`flex items-center justify-center gap-1 py-2 px-1.5 sm:px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'firstaid'
                  ? 'bg-red-600 text-white shadow-xs font-bold'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
              <span>ရှေးဦးပြုစုခြင်း</span>
            </button>

            {/* Tab: Health News & Articles */}
            <button
              onClick={() => setActiveTab('news')}
              className={`flex items-center justify-center gap-1 py-2 px-1.5 sm:px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'news'
                  ? 'bg-teal-600 text-white shadow-xs font-bold'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5 text-teal-500" />
              <span>ဆောင်းပါးများ</span>
            </button>

            {/* Tab: Reminders & Notifications */}
            <button
              onClick={() => setActiveTab('reminders')}
              className={`flex items-center justify-center gap-1 py-2 px-1.5 sm:px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer relative ${
                activeTab === 'reminders'
                  ? 'bg-amber-500 text-white shadow-xs font-bold'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <BellRing className="w-3.5 h-3.5 text-amber-500" />
              <span>သတိပေးချက်များ</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-600 text-white font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          </nav>
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
        {activeTab === 'news' && <HealthNewsModule />}
        {activeTab === 'reminders' && <RemindersModule />}
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

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setIsUserGuideOpen(true)}
              className="hover:text-emerald-600 transition-colors cursor-pointer flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>အသုံးပြုနည်း လမ်းညွှန်</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsVersionHistoryOpen(true)}
              className="hover:text-purple-600 transition-colors cursor-pointer flex items-center gap-1"
            >
              <History className="w-3.5 h-3.5" />
              <span>Version History (v1.4.0)</span>
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

