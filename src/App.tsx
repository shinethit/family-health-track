import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Droplets, 
  FlaskConical, 
  Pill, 
  TrendingUp, 
  ShieldCheck, 
  Heart, 
  LogOut, 
  Scale, 
  Bell,
  Newspaper,
  MessageSquareHeart,
  Users,
  BookOpen,
  History
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HealthDataProvider, useHealthData } from './context/HealthDataContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { Navbar } from './components/layout/Navbar';
import { LoginScreen } from './components/auth/LoginScreen';
import { NotificationCenterModal } from './components/modules/NotificationCenterModal';
import { VersionHistoryModal } from './components/modules/VersionHistoryModal';
import { UserGuideModal } from './components/modules/UserGuideModal';
import { BloodPressureModule } from './components/modules/BloodPressureModule';
import { BloodSugarModule } from './components/modules/BloodSugarModule';
import { LabTestModule } from './components/modules/LabTestModule';
import { MedicationsModule } from './components/modules/MedicationsModule';
import { BMIModule } from './components/modules/BMIModule';
import { TrendsOverview } from './components/modules/TrendsOverview';
import { AdminPatientPortal } from './components/modules/AdminPatientPortal';
import { HealthNewsModule } from './components/modules/HealthNewsModule';
import { DoctorQnAModule } from './components/modules/DoctorQnAModule';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';

const MainContent: React.FC = () => {
  const { profile, isAdmin, logout, loading } = useAuth();
  const { selectedPatient, setSelectedPatientId, doctorQuestions } = useHealthData();
  const { unreadCount } = useNotifications();
  const [activeTab, setActiveTab] = useState<
    'trends' | 'bp' | 'sugar' | 'bmi' | 'labs' | 'medications' | 'news' | 'doctor_qa' | 'admin'
  >(isAdmin ? 'admin' : 'trends');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);

  // Automatically ensure Admin opens to Admin Dashboard by default
  useEffect(() => {
    if (isAdmin) {
      setActiveTab('admin');
    }
  }, [isAdmin]);

  // If loading authentication state from Firebase
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-xs font-semibold">ကျန်းမာရေးစနစ် စစ်ဆေးနေပါသည်...</p>
        </div>
      </div>
    );
  }

  // If user is NOT logged in, show the Login / Register screen
  if (!profile) {
    return <LoginScreen />;
  }

  const pendingQuestionsCount = doctorQuestions.filter(q => q.status === 'pending').length;

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar 
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenUserGuide={() => setIsUserGuideOpen(true)}
        onOpenVersionHistory={() => setIsVersionHistoryOpen(true)}
        activeTab={activeTab} 
        setActiveTab={(tab: any) => setActiveTab(tab)} 
      />

      {/* User Context Banner */}
      <div className="bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isAdmin ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-slate-500 dark:text-slate-400">{isAdmin ? 'အက်ဒမင်:' : 'အကောင့်:'}</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {profile.displayName || (isAdmin ? 'ရှိုင်းသစ်' : 'အသုံးပြုသူ')}
            </span>
            <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
              isAdmin 
                ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800' 
                : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            }`}>
              {isAdmin ? 'Admin Portal' : 'လူနာ (Patient)'}
            </span>
            {selectedPatient && isAdmin && (
              <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                ရွေးချယ်ထားသောလူနာ: {selectedPatient.displayName}
              </span>
            )}
          </div>

          {/* Quick Shortcuts: Guide / Version / Notifications / Logout */}
          <div className="flex items-center gap-2">
            {/* User Guide Shortcut */}
            <button
              onClick={() => setIsUserGuideOpen(true)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="အသုံးပြုနည်း လမ်းညွှန် (User Guide)"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>လမ်းညွှန်</span>
            </button>

            {/* Version History Shortcut */}
            <button
              onClick={() => setIsVersionHistoryOpen(true)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Version History (ဗားရှင်းမှတ်တမ်း)"
            >
              <History className="w-3.5 h-3.5" />
              <span>v1.3.3</span>
            </button>

            {/* Open Notifications */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="သတိပေးချက်များ"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>သတိပေးချက် {unreadCount > 0 ? `(${unreadCount})` : ''}</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  setSelectedPatientId(null);
                  setActiveTab('admin');
                }}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Admin Portal</span>
              </button>
            )}

            <button
              onClick={() => logout()}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 hover:bg-rose-100 transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
              title="အကောင့်ထွက်မည်"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>အကောင့်ထွက်မည်</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 shadow-xs sticky top-16 z-30 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
          <nav className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Tab: Admin Portal (Positioned first for Admin) */}
            {isAdmin && (
              <button
                onClick={() => {
                  setSelectedPatientId(null);
                  setActiveTab('admin');
                }}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>လူနာမှတ်တမ်း စီမံခန့်ခွဲမှု (Admin)</span>
              </button>
            )}

            {/* Tab: Doctor Consult Q&A */}
            <button
              onClick={() => setActiveTab('doctor_qa')}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer relative ${
                activeTab === 'doctor_qa'
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <MessageSquareHeart className="w-3.5 h-3.5 text-indigo-500" />
              <span>{isAdmin ? 'လူနာမေးခွန်းများ ဖြေကြားရန် (Q&A)' : 'ဆရာဝန် မေးမြန်းရန်'}</span>
              {pendingQuestionsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-amber-950 font-bold">
                  {pendingQuestionsCount}
                </span>
              )}
            </button>

            {/* Tab: Overview & Trends */}
            <button
              onClick={() => setActiveTab('trends')}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'trends'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{isAdmin ? 'လူနာကျန်းမာရေး သုံးသပ်ချက်' : 'သုံးသပ်ချက်'}</span>
            </button>

            {/* Tab: Blood Pressure */}
            <button
              onClick={() => setActiveTab('bp')}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'bp'
                  ? 'bg-rose-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-rose-500" />
              <span>သွေးပေါင်ချိန်</span>
            </button>

            {/* Tab: Blood Sugar */}
            <button
              onClick={() => setActiveTab('sugar')}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'sugar'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Droplets className="w-3.5 h-3.5 text-emerald-500" />
              <span>ဆီးချို</span>
            </button>

            {/* Tab: BMI & Body Metrics */}
            <button
              onClick={() => setActiveTab('bmi')}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'bmi'
                  ? 'bg-teal-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-teal-500" />
              <span>BMI & အလေးချိန်</span>
            </button>

            {/* Tab: Lab Tests */}
            <button
              onClick={() => setActiveTab('labs')}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'labs'
                  ? 'bg-purple-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5 text-purple-500" />
              <span>ဓာတ်ခွဲခန်း</span>
            </button>

            {/* Tab: Medications */}
            <button
              onClick={() => setActiveTab('medications')}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'medications'
                  ? 'bg-sky-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Pill className="w-3.5 h-3.5 text-sky-500" />
              <span>သောက်ဆေးများ</span>
            </button>

            {/* Tab: Health News & Articles */}
            <button
              onClick={() => setActiveTab('news')}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'news'
                  ? 'bg-teal-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5 text-teal-500" />
              <span>ကျန်းမာရေး သတင်း</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'admin' && <AdminPatientPortal />}
        {activeTab === 'trends' && <TrendsOverview onNavigateTab={(t: any) => setActiveTab(t)} />}
        {activeTab === 'bp' && <BloodPressureModule />}
        {activeTab === 'sugar' && <BloodSugarModule />}
        {activeTab === 'bmi' && <BMIModule />}
        {activeTab === 'labs' && <LabTestModule />}
        {activeTab === 'medications' && <MedicationsModule />}
        {activeTab === 'news' && <HealthNewsModule />}
        {activeTab === 'doctor_qa' && <DoctorQnAModule />}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              မိသားစု ကျန်းမာရေး စောင့်ရှောက်မှု စနစ် (Family Health Portal)
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setIsUserGuideOpen(true)}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>အသုံးပြုနည်း လမ်းညွှန်</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsVersionHistoryOpen(true)}
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer flex items-center gap-1"
            >
              <History className="w-3.5 h-3.5" />
              <span>Version History (v1.3.1)</span>
            </button>
          </div>

          <p className="text-slate-400">
            စနစ်အုပ်ချုပ်သူ (Admin): ရှိုင်းသစ်
          </p>
        </div>
      </footer>

      {/* Notifications Modal */}
      <NotificationCenterModal 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
      />

      {/* Version History Modal */}
      <VersionHistoryModal
        isOpen={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
      />

      {/* User Guide Modal */}
      <UserGuideModal
        isOpen={isUserGuideOpen}
        onClose={() => setIsUserGuideOpen(false)}
      />

      {/* PWA Offline Indicator */}
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
