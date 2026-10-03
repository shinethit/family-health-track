import React from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  Phone, 
  Mail, 
  Calendar, 
  Edit3, 
  Trash2, 
  ArrowRight,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { UserProfile } from '../../../types/health';
import { calculateAge, calculateBMI } from '../../../lib/medicalCalculations';

interface AdminPatientListProps {
  patients: UserProfile[];
  allPatientsCount: number;
  incompleteCount: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterCondition: string;
  onFilterChange: (condition: string) => void;
  onSelectPatient: (id: string) => void;
  onOpenAddModal: () => void;
  onEditPatient: (patient: UserProfile) => void;
  onDeletePatient: (patient: UserProfile) => void;
  getResolvedName: (p: Partial<UserProfile> | null | undefined) => string;
  getMissingFields: (p: UserProfile) => string[];
}

export const AdminPatientList: React.FC<AdminPatientListProps> = ({
  patients,
  allPatientsCount,
  incompleteCount,
  searchTerm,
  onSearchChange,
  filterCondition,
  onFilterChange,
  onSelectPatient,
  onOpenAddModal,
  onEditPatient,
  onDeletePatient,
  getResolvedName,
  getMissingFields,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>လူနာနှင့် အသုံးပြုသူများ စာရင်း ({allPatientsCount} ဦး)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                အသုံးပြုသူတစ်ဦးချင်းစီ၏ မှတ်တမ်းအသေးစိတ်၊ သွေးပေါင်၊ ဆီးချိုနှင့် ဆရာဝန်အကြံပြုချက်များကို ကြည့်ရှုစီမံပါ
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ လူနာအသစ် ထည့်သွင်းမည်</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <label htmlFor="admin-patient-search" className="sr-only">လူနာအမည်၊ အီးမေးလ် သို့မဟုတ် ဖုန်းနံပါတ်ဖြင့် ရှာဖွေပါ</label>
          <input
            id="admin-patient-search"
            type="text"
            placeholder="လူနာအမည်၊ အီးမေးလ် သို့မဟုတ် ဖုန်းနံပါတ်ဖြင့် ရှာဖွေပါ..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4 text-slate-400" />
          <label htmlFor="admin-patient-filter" className="sr-only">ရောဂါအခံ အလိုက် စစ်ထုတ်ပါ</label>
          <select
            id="admin-patient-filter"
            value={filterCondition}
            onChange={(e) => onFilterChange(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden"
          >
            <option value="all">အားလုံး ({allPatientsCount})</option>
            <option value="hypertension">သွေးတိုး ရောဂါရှင်များ</option>
            <option value="diabetes">ဆီးချို ရောဂါရှင်များ</option>
            <option value="both">သွေးတိုး + ဆီးချို နှစ်မျိုးလုံး</option>
            {incompleteCount > 0 && (
              <option value="incomplete">⚠️ အချက်အလက်မစုံသူများ ({incompleteCount})</option>
            )}
          </select>
        </div>
      </div>

      {/* Patient Cards / Table */}
      {patients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {patients.map((p) => {
            const ageObj = calculateAge(p.dateOfBirth);
            const resolvedAge = ageObj ? ageObj.years : (p.age || null);
            const missing = getMissingFields(p);
            const cleanName = getResolvedName(p);
            const bmi = (p.weightKg && p.heightCm) ? calculateBMI(p.weightKg, p.heightCm) : null;

            return (
              <div 
                key={p.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all bg-white dark:bg-slate-900 shadow-2xs flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                        {cleanName}
                      </h4>
                      <div className="text-[11px] text-slate-400 mt-0.5 space-y-0.5">
                        {p.email && <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-400" /> <span className="truncate max-w-[180px]">{p.email}</span></div>}
                        {p.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-400" /> <span>{p.phone}</span></div>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditPatient(p);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="အချက်အလက် ပြင်ဆင်မည်"
                        aria-label={`${cleanName} ၏ အချက်အလက် ပြင်ဆင်မည်`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePatient(p);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="လူနာမှတ်တမ်း ဖျက်မည်"
                        aria-label={`${cleanName} ၏ လူနာမှတ်တမ်း ဖျက်မည်`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Conditions & Details */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {resolvedAge !== null && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {resolvedAge} နှစ်
                      </span>
                    )}
                    {p.gender && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {p.gender === 'female' ? 'မ' : p.gender === 'male' ? 'ကျား' : 'အခြား'}
                      </span>
                    )}
                    {bmi && (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${bmi.bgColor} ${bmi.color} ${bmi.borderColor}`}>
                        BMI: {bmi.bmi}
                      </span>
                    )}
                    {p.chronicConditions && p.chronicConditions.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {c}
                      </span>
                    ))}
                  </div>

                  {/* Incomplete warning if any */}
                  {missing.length > 0 && (
                    <div className="mt-2 text-[10px] text-amber-700 bg-amber-50 dark:bg-amber-950/30 p-1.5 rounded-lg border border-amber-200 flex items-center gap-1 font-semibold">
                      <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>ဖြည့်ရန်လို: {missing.join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* View Profile Action */}
                <button
                  type="button"
                  onClick={() => onSelectPatient(p.id)}
                  className="w-full mt-1 py-2 rounded-xl bg-slate-50 hover:bg-emerald-600 dark:bg-slate-800 dark:hover:bg-emerald-600 text-slate-700 hover:text-white dark:text-slate-300 dark:hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  aria-label={`${cleanName} ၏ မှတ်တမ်းအပြည့်အစုံ ကြည့်မည်`}
                >
                  <span>မှတ်တမ်းအပြည့်အစုံ ကြည့်မည်</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700 text-slate-500 text-xs">
          ရှာဖွေမှုနှင့် ကိုက်ညီသော လူနာမှတ်တမ်း မတွေ့ရှိပါ။
        </div>
      )}
    </div>
  );
};
