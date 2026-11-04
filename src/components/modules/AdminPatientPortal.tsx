import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useHealthData, isPatientOnly, resolveCleanName } from '../../context/HealthDataContext';
import { useAuth } from '../../context/AuthContext';
import { UserProfile, DoctorAnswer } from '../../types/health';
import { EditPatientModal } from './EditPatientModal';
import { DeletePatientModal } from './DeletePatientModal';

// Hardcoded Myanmar month names — never toLocaleDateString('my-MM'): the
// user's phone may lack the 'my-MM' locale and fall back to English (D-M4).
const MM_MONTHS = ['ဇန်နဝါရီ', 'ဖေဖော်ဝါရီ', 'မတ်', 'ဧပြီ', 'မေ', 'ဇွန်', 'ဇူလိုင်', 'ဩဂုတ်', 'စက်တင်ဘာ', 'အောက်တိုဘာ', 'နိုဝင်ဘာ', 'ဒီဇင်ဘာ'];
const formatMmDate = (value?: string): string => {
  if (!value) return 'ရက်စွဲ မရှိပါ';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'ရက်စွဲ မရှိပါ';
  return `${d.getFullYear()} ခုနှစ် ${MM_MONTHS[d.getMonth()]} ${d.getDate()} ရက်`;
};
import { AdminQuotaBanner } from './admin/AdminQuotaBanner';
import { AdminDataRepair } from './admin/AdminDataRepair';
import { AdminRoleManager } from './admin/AdminRoleManager';
import { AdminBroadcastManager } from './admin/AdminBroadcastManager';
import { AdminPatientList } from './admin/AdminPatientList';
import { AdminPatientDetail } from './admin/AdminPatientDetail';
import { AdminPatientComparison } from './admin/AdminPatientComparison';
import { AdminAddPatientModal } from './admin/AdminAddPatientModal';

// Collapsible wrapper for rarely-used admin tools — default collapsed so the
// daily job (the user list) is reachable without scrolling past open panels.
const CollapsibleToolPanel: React.FC<{
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ title, open, onToggle, children }) => (
  <div className="space-y-3">
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-left cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
    >
      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{title}</span>
      {open ? (
        <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
      ) : (
        <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
      )}
    </button>
    {open && children}
  </div>
);

export const AdminPatientPortal: React.FC = () => {
  const { 
    patientsList, 
    selectedPatientId, 
    setSelectedPatientId, 
    selectedPatient,
    familyMembers,
    bpRecords,
    glucoseRecords,
    labRecords,
    medications,
    vaccineRecords,
    bmiRecords,
    doctorQuestions,
    medicationLogs,
    doctorAdvices,
    addDoctorAdvice,
    answerDoctorQuestion,
    closeDoctorQuestion,
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

  // Admin tool panels — collapsed by default; the user list is the daily job.
  const [openTools, setOpenTools] = useState<{ repair: boolean; roles: boolean; broadcast: boolean }>({
    repair: false,
    roles: false,
    broadcast: false,
  });
  const toggleTool = (key: 'repair' | 'roles' | 'broadcast') =>
    setOpenTools((prev) => ({ ...prev, [key]: !prev[key] }));

  // Edit & Delete Modal States
  const [editingPatient, setEditingPatient] = useState<UserProfile | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<UserProfile | null>(null);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);

  // Patient comparison (2-4 users side by side)
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const toggleCompareSelect = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const handleStartCompare = () => {
    if (compareIds.length >= 2) setIsComparing(true);
  };
  const handleExitCompare = () => {
    setIsComparing(false);
    setCompareIds([]);
  };
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

    const isGenericName = !resolved || resolved === 'အသုံးပြုသူ' || resolved === 'အမည်မရှိ' || resolved === 'အသုံးပြုသူ' || resolved.startsWith('pat-') || resolved.startsWith('user-') || resolved.includes('6bce6599');
    const isFakeEmail = !email || email.includes('@patient.local') || email.includes('@familyhealth.local') || email.includes('demo');
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

    if (!resolved || resolved === 'အသုံးပြုသူ' || resolved === 'အမည်မရှိ' || resolved === 'အသုံးပြုသူ' || resolved.startsWith('pat-') || resolved.startsWith('user-') || resolved.includes('6bce6599')) {
      missing.push('အမည်မစုံ');
    }
    if (!email || email.includes('@patient.local') || email.includes('@familyhealth.local')) {
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
    age?: number;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    chronicConditions: string[];
    heightCm?: number;
    weightKg?: number;
    bloodType?: string;
  }) => {
    await addPatient(data);
    setActionAlert({
      type: 'success',
      message: 'အသုံးပြုသူအသစ်အား Database ထဲသို့ အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ။',
    });
    setTimeout(() => setActionAlert(null), 4000);
  };

  const handleSavePatient = async (id: string, updates: Partial<UserProfile>) => {
    try {
      await updatePatient(id, updates);
      setActionAlert({
        type: 'success',
        message: `အသုံးပြုသူ "${updates.displayName || 'အမည်'}" ၏ မှတ်တမ်းအား Cloud Database တွင် အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ။`,
      });
      setTimeout(() => setActionAlert(null), 4000);
    } catch (err: any) {
      setActionAlert({
        type: 'error',
        message: 'အသုံးပြုသူမှတ်တမ်း ပြင်ဆင်ရာတွင် အမှားဖြစ်ပေါ်ခဲ့ပါသည်: ' + (err?.message || ''),
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
        message: 'အသုံးပြုသူမှတ်တမ်းနှင့်တကွ ဆက်စပ်ဒေတာများကို Database မှ အပြီးတိုင် ဖျက်ပစ်ပြီးပါပြီ။',
      });
      setTimeout(() => setActionAlert(null), 4000);
    } catch (err: any) {
      setActionAlert({
        type: 'error',
        message: 'အသုံးပြုသူမှတ်တမ်း ဖျက်ရာတွင် အမှားဖြစ်ပေါ်ခဲ့ပါသည်: ' + (err?.message || ''),
      });
      setTimeout(() => setActionAlert(null), 5000);
      throw err;
    }
  };

  const handleSendAdvice = async (advice: string, diet: string) => {
    if (!selectedPatientId) return;
    await addDoctorAdvice(selectedPatientId, advice, diet);
  };

  const handleAnswerQuestion = async (questionId: string, answer: DoctorAnswer) => {
    try {
      await answerDoctorQuestion(questionId, answer);
      setActionAlert({
        type: 'success',
        message: 'မေးခွန်းအဖြေကို အသုံးပြုသူထံ ပေးပို့ပြီးပါပြီ။',
      });
      setTimeout(() => setActionAlert(null), 4000);
    } catch (err: any) {
      setActionAlert({
        type: 'error',
        message: 'အဖြေပေးပို့ခြင်း မအောင်မြင်ပါ: ' + (err?.message || ''),
      });
      setTimeout(() => setActionAlert(null), 5000);
      throw err;
    }
  };

  const handleCloseQuestion = async (questionId: string) => {
    try {
      await closeDoctorQuestion(questionId);
      setActionAlert({
        type: 'success',
        message: 'မေးခွန်းကို ပိတ်သိမ်းပြီးပါပြီ။',
      });
      setTimeout(() => setActionAlert(null), 4000);
    } catch (err: any) {
      setActionAlert({
        type: 'error',
        message: 'မေးခွန်း ပိတ်သိမ်းခြင်း မအောင်မြင်ပါ: ' + (err?.message || ''),
      });
      setTimeout(() => setActionAlert(null), 5000);
      throw err;
    }
  };

  // All pending doctor questions across every user (v2.4.11, audit 5.5):
  // the old admin alert only ever surfaced the first pending question.
  // Newest first; only shown on the user list (not while viewing a detail).
  const pendingQuestions = [...doctorQuestions]
    .filter((q) => q.status === 'pending')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // v2.4.16 (C-M1 / D-M2): a question's userId is the ASKER — which may be
  // a family member's doc id, not a patient id. The old code looked the
  // asker up in patientsList only, so a family member's pending question
  // had no owner and no working "ကြည့်ပြီး ဖြေမည်" button. Resolve the
  // owning patient through the family member when needed.
  const ownerPatientIdForQuestion = (questionUserId: string): string | null => {
    if (patientsList.some((p) => p.id === questionUserId)) return questionUserId;
    const member = familyMembers.find((f) => f.id === questionUserId);
    return member ? ((member as any).userId as string) || null : null;
  };
  const isFamilyMemberQuestion = (questionUserId: string): boolean =>
    !patientsList.some((p) => p.id === questionUserId) &&
    familyMembers.some((f) => f.id === questionUserId);

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

      {/* 1b. Data Repair — ရှိပြီးသား မှတ်တမ်းဟောင်းတွေရဲ့ patientEmail ပြင်ဆင်ခြင်း */}
      <CollapsibleToolPanel
        title="ဒေတာ ပြန်ပြင်ခြင်း (Data Repair)"
        open={openTools.repair}
        onToggle={() => toggleTool('repair')}
      >
        <AdminDataRepair />
      </CollapsibleToolPanel>

      {/* 1c. Admin Role Manager — အသုံးပြုသူတစ်ယောက်ကို Admin အဖြစ် ရာထူးတင်ခြင်း */}
      <CollapsibleToolPanel
        title="Admin ရာထူး စီမံခန့်ခွဲမှု"
        open={openTools.roles}
        onToggle={() => toggleTool('roles')}
      >
        <AdminRoleManager />
      </CollapsibleToolPanel>

      {/* 2. Broadcast News / Marquee Manager */}
      <CollapsibleToolPanel
        title="အရေးပေါ် ကျန်းမာရေး သတင်းလွှာ / Banner စီမံခြင်း (Broadcast News)"
        open={openTools.broadcast}
        onToggle={() => toggleTool('broadcast')}
      >
        <AdminBroadcastManager
          tickers={broadcastTickers}
          onAddTicker={addBroadcastTicker}
          onToggleTicker={toggleBroadcastTicker}
          onDeleteTicker={deleteBroadcastTicker}
        />
      </CollapsibleToolPanel>

      {/* 3. Patient Comparison / Details / List */}
      {isComparing ? (
        <AdminPatientComparison
          patientIds={compareIds}
          onBack={handleExitCompare}
        />
      ) : selectedPatientId && selectedPatient ? (
        <AdminPatientDetail
          patient={selectedPatient}
          bpRecords={bpRecords}
          glucoseRecords={glucoseRecords}
          labRecords={labRecords}
          medications={medications}
          vaccineRecords={vaccineRecords}
          bmiRecords={bmiRecords}
          doctorQuestions={doctorQuestions}
          medicationLogs={medicationLogs}
          doctorAdvices={doctorAdvices}
          onBack={() => setSelectedPatientId(null)}
          onEditPatient={setEditingPatient}
          onDeletePatient={setDeletingPatient}
          onSendAdvice={handleSendAdvice}
          onAnswerQuestion={handleAnswerQuestion}
          onCloseQuestion={handleCloseQuestion}
          getResolvedName={getResolvedName}
        />
      ) : (
        <>
          {/* Pending doctor questions — ALL of them, not just the first one */}
          {pendingQuestions.length > 0 && (
            <div className="mb-4 p-4 rounded-3xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 space-y-2">
              <p className="text-xs font-bold text-amber-800 dark:text-amber-200">
                ❓ ဖြေကြားရန် စောင့်ဆိုင်းနေသော မေးခွန်းများ ({pendingQuestions.length} ခု)
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {pendingQuestions.map((q) => {
                  const ownerPatientId = ownerPatientIdForQuestion(q.userId);
                  const owner = ownerPatientId ? patientsList.find((p) => p.id === ownerPatientId) : undefined;
                  const askedByFamilyMember = isFamilyMemberQuestion(q.userId);
                  return (
                    <div
                      key={q.id}
                      className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{q.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {q.patientName || 'အသုံးပြုသူ'}
                          {askedByFamilyMember && owner ? ` (${getResolvedName(owner)} ၏ မိသားစုဝင်)` : ''}
                          {q.urgency === 'urgent' ? ' • 🔴 အရေးကြီး' : q.urgency === 'moderate' ? ' • 🟡 အလယ်အလတ်' : ''}
                          {q.createdAt ? ` • ${formatMmDate(q.createdAt)}` : ''}
                        </p>
                      </div>
                      {owner && (
                        <button
                          type="button"
                          onClick={() => setSelectedPatientId(owner.id)}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer shrink-0"
                        >
                          ကြည့်ပြီး ဖြေမည်
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {/* Compare bar — shows once at least one user is selected */}
          {compareIds.length > 0 && (
            <div className="mb-4 p-4 rounded-3xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs font-bold text-indigo-800 dark:text-indigo-200">
                နှိုင်းယှဉ်ရန် ရွေးထားသူ: {compareIds.length} ဦး
                {compareIds.length < 2 ? ' — အနည်းဆုံး ၂ ဦး ရွေးပါ' : ''}
                {compareIds.length > 4 ? ' — ပထမ ၄ ဦးကိုသာ နှိုင်းယှဉ်ပြပါမည်' : ''}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setCompareIds([])}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  ပယ်ဖျက်မည်
                </button>
                <button
                  type="button"
                  onClick={handleStartCompare}
                  disabled={compareIds.length < 2}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                >
                  နှိုင်းယှဉ်မည်
                </button>
              </div>
            </div>
          )}
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
            selectable
            selectedIds={compareIds}
            onToggleSelect={toggleCompareSelect}
          />
        </>
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
