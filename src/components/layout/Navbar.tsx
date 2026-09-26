import React, { useState } from 'react';
import { 
  HeartPulse, 
  ChevronDown, 
  Bell, 
  BookOpen, 
  History, 
  KeyRound, 
  LogOut,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { ChangePasswordModal } from '../auth/ChangePasswordModal';

interface NavbarProps {
  onOpenNotifications: () => void;
  onOpenUserGuide: () => void;
  onOpenVersionHistory: () => void;
  onOpenPassportModal?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenNotifications,
  onOpenUserGuide,
  onOpenVersionHistory,
  onOpenPassportModal
}) => {
  const { profile, isAdmin, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleSignOut = () => {
    setShowUserMenu(false);
    logout();
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo - Pure Clean Teal Medical Emblem */}
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-0.5 shadow-sm flex items-center justify-center shrink-0">
                <img 
                  src="/icon.svg" 
                  alt="Family Health Track" 
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
                <HeartPulse className="w-5 h-5 text-white absolute animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                    Family Health Track
                  </span>
                  <button
                    onClick={onOpenVersionHistory}
                    className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition-colors cursor-pointer"
                    title="Version History ကြည့်မည်"
                  >
                    v1.7.0
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 hidden md:block">
                  သွား၊ မျက်စိ၊ နား၊ အရေပြား၊ ရှေးဦးပြုစုခြင်း၊ သွေးတိုး၊ ဆီးချို၊ BMI၊ ကာကွယ်ဆေးနှင့် အာဟာရ
                </p>
              </div>
            </div>

            {/* Right Tools & Profile - Pristine Single Flex Row */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Health Passport PDF Export Button */}
              {onOpenPassportModal && (
                <button
                  onClick={onOpenPassportModal}
                  className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                  title="ဆရာဝန်ပြသရန် ကျန်းမာရေး အစီရင်ခံစာ PDF / Print"
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">အစီရင်ခံစာ PDF</span>
                </button>
              )}

              {/* User Guide Button */}
              <button
                onClick={onOpenUserGuide}
                className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1"
                title="အသုံးပြုနည်း လမ်းညွှန် (User Guide)"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">လမ်းညွှန်</span>
              </button>


              {/* Notification Bell */}
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="သတိပေးချက်များ"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 px-1 min-w-[16px] h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white ${
                    isAdmin ? 'bg-indigo-600' : 'bg-emerald-600'
                  }`}>
                    {profile ? profile.displayName.charAt(0) : 'U'}
                  </div>

                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">
                      {profile ? profile.displayName : 'အသုံးပြုသူ'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {isAdmin ? 'Admin' : 'လူနာ'}
                    </div>
                  </div>

                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Menu Popup */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 text-xs z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900">{profile?.displayName || (isAdmin ? 'ရှိုင်းသစ်' : 'အသုံးပြုသူ')}</p>
                      <p className="text-slate-400 font-mono text-[11px] truncate">{profile?.email}</p>
                      <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {isAdmin ? 'Admin Portal' : 'လူနာ (Patient)'}
                      </div>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenVersionHistory();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                      >
                        <History className="w-4 h-4 text-purple-600" />
                        <span>ဗားရှင်း မှတ်တမ်း (v1.4.0)</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowPasswordModal(true);
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4 text-indigo-600" />
                        <span>စကားဝှက် ပြောင်းမည်</span>
                      </button>

                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 font-bold flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>အကောင့်ထွက်မည်</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
