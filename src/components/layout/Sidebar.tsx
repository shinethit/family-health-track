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
  Scale
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { useNotifications } from '../../context/NotificationContext';
import { CURRENT_SYSTEM_VERSION } from '../../constants/version';
import { calculateBPCategory, calculateGlucoseStatus, calculateBMI } from '../../lib/medicalCalculations';

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
  onManualCheckVersion,
  setActiveTab,
  setCategoryGroup
}) => {
  const { profile, logout } = useAuth();
  const { bpRecords, glucoseRecords, bmiRecords, selectedPatient } = useHealthData();
  const { unreadCount } = useNotifications();

  // Compute real health status summary from latest records
  const targetAge = selectedPatient?.age ?? profile?.age;
  const isPregnant = selectedPatient?.chronicConditions?.includes('ကိုယ်ဝန်ဆောင်') || profile?.chronicConditions?.includes('ကိုယ်ဝန်ဆောင်');

  const latestBP = bpRecords.length > 0 ? bpRecords[0] : null;
  const latestGlu = glucoseRecords.length > 0 ? glucoseRecords[0] : null;
  const latestBMI = bmiRecords.length > 0 ? bmiRecords[0] : null;

  const bpEval = latestBP ? calculateBPCategory(latestBP.systolic, latestBP.diastolic, targetAge, isPregnant) : null;
  const gluEval = latestGlu ? calculateGlucoseStatus(latestGlu.glucoseValue || latestGlu.value || 100, latestGlu.timing || latestGlu.type || 'fasting') : null;
  const bmiEval = latestBMI ? calculateBMI(latestBMI.weightKg, latestBMI.heightCm, targetAge) : null;

  const hasAnyRecords = Boolean(latestBP || latestGlu || latestBMI);

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
            <button onClick={onClose} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Profile & Dynamic Summary */}
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                {profile?.displayName?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <p className="font-bold text-slate-900 truncate">{selectedPatient?.displayName || profile?.displayName}</p>
                <p className="text-xs text-slate-500 truncate">{selectedPatient?.email || profile?.email}</p>
              </div>
            </div>
            
            {/* Real computed health summary card */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5">
               <p className="text-[11px] font-bold text-slate-500">ကျန်းမာရေးအခြေနေ အကျဉ်း</p>
               
               {!hasAnyRecords ? (
                 <p className="text-xs text-slate-400 font-semibold italic">မှတ်တမ်း မရှိသေးပါ</p>
               ) : (
                 <div className="space-y-1 text-xs">
                   {latestBP && bpEval && (
                     <div className="flex items-center justify-between text-[11px]">
                       <span className="flex items-center gap-1.5 text-slate-600">
                         <span className={`w-2 h-2 rounded-full ${
                           bpEval.category === 'normal' ? 'bg-emerald-500' :
                           bpEval.category === 'elevated' ? 'bg-yellow-500' :
                           bpEval.category === 'stage1' ? 'bg-amber-500' : 'bg-rose-500'
                         }`} />
                         <span>သွေးပေါင်: {latestBP.systolic}/{latestBP.diastolic}</span>
                       </span>
                       <span className={`font-bold text-[10px] ${bpEval.color}`}>
                         {bpEval.labelEn || bpEval.category}
                       </span>
                     </div>
                   )}

                   {latestGlu && gluEval && (
                     <div className="flex items-center justify-between text-[11px]">
                       <span className="flex items-center gap-1.5 text-slate-600">
                         <span className={`w-2 h-2 rounded-full ${
                           gluEval.status === 'normal' ? 'bg-emerald-500' :
                           gluEval.status === 'pre_diabetic' ? 'bg-amber-500' :
                           gluEval.status === 'low' ? 'bg-blue-500' : 'bg-rose-500'
                         }`} />
                         <span>သွေးချို: {latestGlu.glucoseValue || latestGlu.value} mg/dL</span>
                       </span>
                       <span className={`font-bold text-[10px] ${gluEval.color}`}>
                         {gluEval.labelEn || gluEval.status}
                       </span>
                     </div>
                   )}

                   {latestBMI && bmiEval && (
                     <div className="flex items-center justify-between text-[11px]">
                       <span className="flex items-center gap-1.5 text-slate-600">
                         <span className={`w-2 h-2 rounded-full ${
                           bmiEval.category === 'normal' ? 'bg-emerald-500' :
                           bmiEval.category === 'underweight' ? 'bg-blue-500' :
                           bmiEval.category === 'overweight' ? 'bg-amber-500' : 'bg-rose-500'
                         }`} />
                         <span>BMI: {latestBMI.bmi}</span>
                       </span>
                       <span className={`font-bold text-[10px] ${bmiEval.color}`}>
                         {bmiEval.labelEn || bmiEval.category}
                       </span>
                     </div>
                   )}
                 </div>
               )}
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
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
                <MenuItem icon={Activity} label="ကျန်းမာရေး မှတ်တမ်းများ" onClick={() => { setActiveTab('trends'); setCategoryGroup('records'); onClose(); }} />
                <MenuItem icon={BookOpen} label="သိမှတ်ဖွယ်ရာများ" onClick={() => { setActiveTab('home_testing_guide'); setCategoryGroup('knowledge'); onClose(); }} />
                <MenuItem icon={Users} label="အထူး ဂရုစိုက်ပေးရန် လိုသူများ" onClick={() => { setActiveTab('special_needs'); setCategoryGroup('family_care'); onClose(); }} />
                <MenuItem icon={Stethoscope} label="အထူးကုနှင့် ကုထုံးများ" onClick={() => { setActiveTab('physio'); setCategoryGroup('specialty'); onClose(); }} />
                <MenuItem icon={ShieldAlert} label="အရေးပေါ်နှင့် ကာကွယ်ရေး" onClick={() => { setActiveTab('firstaid'); setCategoryGroup('emergency'); onClose(); }} />
            </div>
            
            <div className="border-t border-slate-100 my-2 pt-2">
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
                      Check
                    </span>
                  </button>
                )}

                <button 
                  onClick={() => { onOpenVersionHistory(); onClose(); }} 
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 text-slate-700 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <History className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-sm">Version History</span>
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
          <div className="p-4 border-t border-slate-100">
            <button onClick={logout} className="w-full flex items-center gap-3 p-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold cursor-pointer">
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
