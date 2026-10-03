import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useHealthData, isPatientOnly, resolveCleanName } from '../../context/HealthDataContext';
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from '../../types/health';
import { EditPatientModal } from './EditPatientModal';
import { DeletePatientModal } from './DeletePatientModal';
import { AdminQuotaBanner } from './admin/AdminQuotaBanner';
import { AdminBroadcastManager } from './admin/AdminBroadcastManager';
import { AdminPatientList } from './admin/AdminPatientList';
import { AdminPatientDetail } from './admin/AdminPatientDetail';
import { AdminAddPatientModal } from './admin/AdminAddPatientModal';

export const AdminPatientPortal: React.FC = () => {
  const { 
    patientsList, 
    selectedPatientId, 
    setSelectedPatientId, 
    selectedPatient,
    bpRecords,
    glucoseRecords,
    labRecords,
    medications,
    doctorAdvices,
    addDoctorAdvice,
    addPatient,
    updatePatient,
    deletePatient,
    broadcastTickers,
    addBroadcastTicker,
    toggleBroadcastTicker,
    deleteBroadcastTicker,
    dbStats,
    refreshAdminData
  } = useHealthData();
  const { isAdmin } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCondition, setFilterCondition] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showQuotaDetails, setShowQuotaDetails] = useState(true);

  // Edit & Delete Modal States
  const [editingPatient, setEditingPatient] = useState<UserProfile | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<UserProfile | null>(null);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm max-w-xl mx-auto my-12">
        <ShieldCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">ဝင်ရောက်ခွင့် မရှိပါ</h3>
        <p className="text-xs text-slate-500 mt-1">
          ဤကဏ္ဍသည် စနစ်စီမံခန့်ခွဲသူ (Admin / ဆရာဝန်) သာလျှင် ဝင်ရောက်ကြည့်ရှုခွင့်ရှိပါသည်။
        </p>
      </div>
    );
  }

  // Pure patient list (excluding admin)
  const actualPatients = patientsList.filter(isPatientOnly);

  // Helper to reliably resolve clean user name
  const getResolvedName = (p: Partial<UserProfile> | null | undefined): string => {
    if (!p) return 'အသုံးပြုသူ';
    return resolveCleanName(p.displayName || (p as any).name, p.email, p.phone);
  };

  // Incomplete record detector
  const isIncompletePatient = (p: UserProfile): boolean => {
    const resolved = getResolvedName(p);
    const email = (p.email || '').toLowerCase().trim();
    const phone = (p.phone || '').trim();

    const isGenericName = !resolved || resolved === 'လူနာ' || resolved === 'အမည်မရှိ' || resolved === 'အသုံးပြုသူ' || resolved.startsWith('pat-') || resolved.startsWith('user-') || resolved.includes('6bce6599');
    const isFakeEmail = !email || email.includes('@patient.local') || email.includes('demo');
    const missingPhone = !phone;
    const missingAge = (!p.age || p.age <= 0) && !p.dateOfBirth;
    const missingVitals = !p.heightCm || !p.weightKg;
    const missingConditions = !p.chronicConditions || p.chronicConditions.length === 0;

    return isGenericName || isFakeEmail || missingPhone || missingAge || missingVitals || missingConditions;
  };

  const getMissingFields = (p: UserProfile): string[] => {
    const missing: string[] = [];
    const resolved = getResolvedName(p);
    const email = (p.email || '').toLowerCase().trim();
    const phone = (p.phone || '').trim();

    if (!resolved || resolved === 'လူနာ' || resolved === 'အမည်မရှိ' || resolved === 'အသုံးပြုသူ' || resolved.startsWith('pat-') || resolved.startsWith('user-') || resolved.includes('6bce6599')) {
      missing.push('အမည်မစုံ');
    }
    if (!email || email.includes('@patient.local')) {
      missing.push('အီးမေးလ်မစုံ');
    }
    if (!phone) {
      missing.push('ဖုန်းနံပါတ်မရှိ');
    }
    if ((!p.age || p.age <= 0) && !p.dateOfBirth) {
      missing.push('အသက်မရှိ');
    }
    if (!p.heightCm || !p.weightKg) {
      missing.push('အရပ်/ဝိတ်မရှိ');
    }
    if (!p.chronicConditions || p.chronicConditions.length === 0) {
      missing.push('ရောဂါအခံမရှိ');
    }
    return missing;
  };

  const countIncomplete = actualPatients.filter(isIncompletePatient).length;

  // Filter patients
  const filteredPatients = actualPatients.filter(p => {
    const resolvedName = getResolvedName(p);
    const matchesSearch = resolvedName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.phone && p.phone.includes(searchTerm));
    
    if (!matchesSearch) return false;

    if (filterCondition === 'incomplete') {
      return isIncompletePatient(p);
    }
    if (filterCondition === 'hypertension') {
      return p.chronicConditions?.some(c => c.includes('သွေးတိုး') || c.toLowerCase().includes('hypertension'));
    }
    if (filterCondition === 'diabetes') {
      return p.chronicConditions?.some(c => c.includes('ဆီးချို') || c.toLowerCase().includes('diabetes'));
    }
    if (filterCondition === 'both') {
      const hasHTN = p.chronicConditions?.some(c => c.includes('သွေးတိုး') || c.toLowerCase().includes('hypertension'));
      const hasDM = p.chronicConditions?.some(c => c.includes('ဆီးချို') || c.toLowerCase().includes('diabetes'));
      return hasHTN && hasDM;
    }
    return true;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAdminData();
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 600);
    }
  };

  const handleCreatePatient = async (data: {
    displayName: string;
    email?: string;
    phone?: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    chronicConditions: string[];
    heightCm: number;
    weightKg: number;
    bloodType: string;
  }) => {
    await addPatient(data);
    setActionAlert({
      type: 'success',
      message: 'လူနာအသစ်အား Database ထဲသို့ အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ။',
    });
    setTimeout(() => setActionAlert(null), 4000);
  };

  const handleSavePatient = async (id: string, updates: Partial<UserProfile>) => {
    try {
      await updatePatient(id, updates);
      setActionAlert({
        type: 'success',
        message: `လူနာ "${updates.displayName || 'အမည်'}" ၏ မှတ်တမ်းအား Cloud Database တွင် အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ။`,
      });
      setTimeout(() => setActionAlert(null), 4000);
    } catch (err: any) {
      setActionAlert({
        type: 'error',
        message: 'လူနာမှတ်တမ်း ပြင်ဆင်ရာတွင် အမှားဖြစ်ပေါ်ခဲ့ပါသည်: ' + (err?.message || ''),
      });
      setTimeout(() => setActionAlert(null), 5000);
      throw err;
    }
  };

  const handleConfirmDeletePatient = async (id: string, cascade: boolean) => {
    try {
      await deletePatient(id, cascade);
      setActionAlert({
        type: 'success',
        message: 'လူနာမှတ်တမ်းနှင့်တကွ ဆက်စပ်ဒေတာများကို Database မှ အပြီးတိုင် ဖျက်ပစ်ပြီးပါပြီ။',
      });
      setTimeout(() => setActionAlert(null), 4000);
    } catch (err: any) {
      setActionAlert({
        type: 'error',
        message: 'လူနာမှတ်တမ်း ဖျက်ရာတွင် အမှားဖြစ်ပေါ်ခဲ့ပါသည်: ' + (err?.message || ''),
      });
      setTimeout(() => setActionAlert(null), 5000);
      throw err;
    }
  };

  const handleSendAdvice = async (advice: string, diet: string) => {
    if (!selectedPatientId) return;
    await addDoctorAdvice(selectedPatientId, advice, diet);
  };

  return (
    <div className="space-y-6">
      {/* Action Alert Banner */}
      {actionAlert && (
        <div className={`p-4 rounded-3xl border text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
          actionAlert.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200' 
            : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {actionAlert.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span>{actionAlert.message}</span>
          </div>
          <button 
            type="button"
            onClick={() => setActionAlert(null)}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            aria-label="ပိတ်မည်"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Firestore Quota & Live Database Statistics */}
      <AdminQuotaBanner
        dbStats={dbStats}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        showQuotaDetails={showQuotaDetails}
        onToggleQuotaDetails={() => setShowQuotaDetails(!showQuotaDetails)}
      />

      {/* 2. Broadcast News / Marquee Manager */}
      <AdminBroadcastManager
        tickers={broadcastTickers}
        onAddTicker={addBroadcastTicker}
        onToggleTicker={toggleBroadcastTicker}
        onDeleteTicker={deleteBroadcastTicker}
      />

      {/* 3. Patient Details or Patient List */}
      {selectedPatientId && selectedPatient ? (
        <AdminPatientDetail
          patient={selectedPatient}
          bpRecords={bpRecords}
          glucoseRecords={glucoseRecords}
          labRecords={labRecords}
          medications={medications}
          doctorAdvices={doctorAdvices}
          onBack={() => setSelectedPatientId(null)}
          onEditPatient={setEditingPatient}
          onDeletePatient={setDeletingPatient}
          onSendAdvice={handleSendAdvice}
          getResolvedName={getResolvedName}
        />
      ) : (
        <AdminPatientList
          patients={filteredPatients}
          allPatientsCount={actualPatients.length}
          incompleteCount={countIncomplete}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterCondition={filterCondition}
          onFilterChange={setFilterCondition}
          onSelectPatient={setSelectedPatientId}
          onOpenAddModal={() => setIsAddPatientOpen(true)}
          onEditPatient={setEditingPatient}
          onDeletePatient={setDeletingPatient}
          getResolvedName={getResolvedName}
          getMissingFields={getMissingFields}
        />
      )}

      {/* Modals */}
      <AdminAddPatientModal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        onSave={handleCreatePatient}
      />

      <EditPatientModal
        patient={editingPatient}
        isOpen={!!editingPatient}
        onClose={() => setEditingPatient(null)}
        onSave={handleSavePatient}
      />

      <DeletePatientModal
        patient={deletingPatient}
        isOpen={!!deletingPatient}
        onClose={() => setDeletingPatient(null)}
        onConfirmDelete={handleConfirmDeletePatient}
      />
    </div>
  );
};
