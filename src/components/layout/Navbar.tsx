import React, { useState } from 'react';
import { 
  HeartPulse, 
  Menu,
  FileText,
  Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { ChangePasswordModal } from '../auth/ChangePasswordModal';

interface NavbarProps {
  onOpenSidebar: () => void;
  onOpenNotifications: () => void;
  onOpenPassportModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenSidebar,
  onOpenNotifications,
  onOpenPassportModal
}) => {
  const { profile, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <button onClick={onOpenSidebar} className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">
                <Menu className="w-6 h-6" />
              </button>
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-0.5 shadow-sm flex items-center justify-center shrink-0">
                <HeartPulse className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                  Family Health Track
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold font-mono">
                  v2.1.0
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
               <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 px-1 min-w-[16px] h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {onOpenPassportModal && (
                <button
                  onClick={onOpenPassportModal}
                  className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">အစီရင်ခံစာ</span>
                </button>
              )}
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
