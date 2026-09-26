import React, { useState } from 'react';
import { 
  HeartPulse, 
  ShieldCheck, 
  User, 
  LogOut, 
  ChevronDown, 
  Printer,
  Bell,
  Stethoscope,
  Trash2,
  KeyRound,
  BookOpen,
  History,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { useNotifications } from '../../context/NotificationContext';
import { ChangePasswordModal } from '../auth/ChangePasswordModal';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

interface NavbarProps {
  onOpenNotifications: () => void;
  onOpenUserGuide: () => void;
  onOpenVersionHistory: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenNotifications,
  onOpenUserGuide,
  onOpenVersionHistory,
  activeTab, 
  setActiveTab,
  theme = 'light',
  onToggleTheme
}) => {
  const { profile, isAdmin, logout } = useAuth();
  const { doctorAdvices, clearAllData } = useHealthData();
  const { unreadCount } = useNotifications();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleSignOut = () => {
    setShowUserMenu(false);
    logout();
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo - Fresh Bright Medical Cyan/Teal/Emerald Gradient */}
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-0.5 border border-emerald-300/80 shadow-md shadow-emerald-500/20 flex items-center justify-center overflow-hidden shrink-0">
                <img 
                  src="/icon.svg" 
                  alt="Family Health Track" 
                  className="w-full h-full object-cover rounded-2xl"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
                <HeartPulse className="w-5 h-5 text-white absolute animate-pulse opacity-90" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                    Family Health Track
                  </span>
                  <button
                    onClick={onOpenVersionHistory}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 hover:bg-emerald-200 transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                    title="Version History ကြည့်မည်"
                  >
                    <span>v1.3.5</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">
                  သွေးတိုး၊ ဆီးချို၊ BMI၊ သိုင်းရွိုက် (TFT)၊ ကာကွယ်ဆေးနှင့် ဓာတ်ခွဲခန်းစစ်ဆေးချက်များ
                </p>
              </div>
            </div>

            {/* Right User & Tools */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Theme Switcher Button - လင်းလင်းရှင်းရှင်း (Light Mode) / အမှောင် (Dark Mode) */}
              {onToggleTheme && (
                <button
                  onClick={onToggleTheme}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                    theme === 'light'
                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
                  }`}
                  title={theme === 'light' ? 'အမှောင်ရောင်သို့ ပြောင်းမည်' : 'လင်းလင်းရှင်းရှင်း သို့ ပြောင်းမည်'}
                >
                  {theme === 'light' ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      <span className="hidden sm:inline">လင်းလင်းရှင်းရှင်း</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-indigo-300 fill-indigo-300" />
                      <span className="hidden sm:inline">အမှောင်</span>
                    </>
                  )}
                </button>
              )}

              {/* User Guide Button */}
              <button
                onClick={onOpenUserGuide}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                title="အသုံးပြုနည်း လမ်းညွှန် (User Guide)"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">လမ်းညွှန်</span>
              </button>

              {/* Version History Button */}
              <button
                onClick={onOpenVersionHistory}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors cursor-pointer hidden md:flex items-center gap-1.5 shadow-xs"
                title="Version History (ဗားရှင်းမှတ်တမ်း)"
              >
                <History className="w-3.5 h-3.5" />
                <span>Version</span>
              </button>

              {/* PWA Install Button */}
              <PWAInstallButton />

              {/* Notification Bell with live unread badge */}
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="သတိပေးချက်များနှင့် Reminder များ"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <>
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="absolute top-1 right-1 px-1 min-w-[16px] h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </>
                )}
              </button>

              {/* Print Report */}
              <button
                onClick={() => window.print()}
                className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:flex items-center gap-1 text-xs cursor-pointer"
                title="ကျန်းမာရေးအစီရင်ခံစာ ထုတ်ယူရန်"
              >
                <Printer className="w-4 h-4" />
              </button>

              {/* Doctor Advice badge for Patient */}
              {!isAdmin && doctorAdvices.length > 0 && (
                <button
                  onClick={() => setActiveTab('trends')}
                  className="relative p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition-colors cursor-pointer"
                  title="အကြံပြုလမ်းညွှန်ချက်များ"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
                </button>
              )}

              {/* User Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer"
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold text-white ${
                    isAdmin ? 'bg-indigo-600' : 'bg-emerald-600'
                  }`}>
                    {profile ? profile.displayName.charAt(0) : 'U'}
                  </div>

                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[120px]">
                      {profile ? profile.displayName : 'အသုံးပြုသူ'}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      {isAdmin ? (
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Admin</span>
                      ) : (
                        <span>လူနာ (Patient)</span>
                      )}
                    </div>
                  </div>

                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Menu Popup */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 text-xs z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-bold text-slate-900 dark:text-white">{profile?.displayName || (isAdmin ? 'ရှိုင်းသစ်' : 'အသုံးပြုသူ')}</p>
                      <p className="text-slate-400 font-mono text-[11px] truncate">{profile?.email}</p>
                      <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        အခန်းကဏ္ဍ: {isAdmin ? 'Admin' : 'လူနာ (Patient)'}
                      </div>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenUserGuide();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                        အသုံးပြုနည်း လမ်းညွှန် (User Guide)
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenVersionHistory();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer"
                      >
                        <History className="w-3.5 h-3.5 text-purple-500" />
                        Version History (v1.3.0)
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowPasswordModal(true);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                        စကားဝှက် ပြောင်းမည် (Change Password)
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenNotifications();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer"
                      >
                        <Bell className="w-3.5 h-3.5 text-slate-400" />
                        သတိပေးချက် & Reminders ({unreadCount})
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          if (window.confirm('မိမိစက်တွင်းရှိ ဒေတာများကို ရှင်းလင်းဖျက်ပစ်ရန် သေချာပါသလား?')) {
                            clearAllData();
                          }
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center gap-2 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        ဒေတာ ရှင်းလင်းမည် (Clear Data)
                      </button>

                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        အကောင့်ထွက်မည် (Sign Out)
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Direct 1-Click Logout button on navbar */}
              <button
                onClick={handleSignOut}
                className="p-2 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="အကောင့်ထွက်မည် (Sign Out)"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <ChangePasswordModal 
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </>
  );
};
