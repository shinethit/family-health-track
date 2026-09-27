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
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNotifications: () => void;
  onOpenUserGuide: () => void;
  onOpenPrivacyPolicy: () => void;
  onOpenVersionHistory: () => void;
  onOpenPassportModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose,
  onOpenNotifications,
  onOpenUserGuide,
  onOpenPrivacyPolicy,
  onOpenVersionHistory,
  onOpenPassportModal
}) => {
  const { profile, logout } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs" onClick={onClose} />
      )}

      <div className={`fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900">Menu</h3>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Profile & Summary */}
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                {profile?.displayName?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <p className="font-bold text-slate-900 truncate">{profile?.displayName}</p>
                <p className="text-xs text-slate-500 truncate">{profile?.email}</p>
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
               <p className="text-xs font-bold text-slate-500 mb-1">ကျန်းမာရေးအခြေနေ အကျဉ်း</p>
               <p className="text-sm font-semibold text-slate-900">ပုံမှန်</p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <MenuItem icon={FileText} label="ဆေးခန်းပြရန် PDF ထုတ်မည်" onClick={() => { onOpenPassportModal(); onClose(); }} />
            <MenuItem icon={Bell} label="သတိပေးချက်များ" badge={unreadCount} onClick={() => { onOpenNotifications(); onClose(); }} />
            <div className="border-t border-slate-100 my-2 pt-2">
                <MenuItem icon={Activity} label="ကျန်းမာရေး မှတ်တမ်းများ" onClick={() => {}} />
                <MenuItem icon={BookOpen} label="သိမှတ်ဖွယ်ရာများ" onClick={() => {}} />
                <MenuItem icon={Baby} label="မိခင်၊ ကလေး၊ သက်ကြီး" onClick={() => {}} />
                <MenuItem icon={Stethoscope} label="အထူးကုနှင့် ကုထုံးများ" onClick={() => {}} />
                <MenuItem icon={ShieldAlert} label="အရေးပေါ်နှင့် ကာကွယ်ရေး" onClick={() => {}} />
            </div>
            <div className="border-t border-slate-100 my-2 pt-2">
                <MenuItem icon={ShieldCheck} label="မူဝါဒ & ဒေတာလုံခြုံရေး" onClick={() => { onOpenPrivacyPolicy(); onClose(); }} />
                <MenuItem icon={History} label="Version History" onClick={() => { onOpenVersionHistory(); onClose(); }} />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100">
            <button onClick={logout} className="w-full flex items-center gap-3 p-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold">
              <LogOut className="w-5 h-5" />
              အကောင့်ထွက်မည်
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const MenuItem = ({ icon: Icon, label, badge, onClick }: any) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 text-slate-700 cursor-pointer">
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-emerald-600" />
      <span className="font-bold text-sm">{label}</span>
    </div>
    {badge !== undefined && badge > 0 && (
      <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</span>
    )}
    <ChevronRight className="w-4 h-4 text-slate-300" />
  </button>
);
