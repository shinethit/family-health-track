import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  updateDoc, 
  getDocs,
  deleteField 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth, sanitizeForFirestore } from './AuthContext';
import { useToast } from './ToastContext';
import { USER_DATA_COLLECTIONS } from '../constants/collections';
import { 
  BloodPressureRecord, 
  BloodSugarRecord, 
  LabTestRecord, 
  Medication, 
  MedicationLog,
  DoctorAdvice, 
  UserProfile,
  FamilyMember,
  BMIRecord,
  DoctorQuestion,
  DoctorAnswer,
  BroadcastTicker,
  VaccinationRecord
} from '../types/health';
import { calculateBPCategory, calculateGlucoseStatus, calculateBMI } from '../lib/medicalCalculations';

// v2.4.12 (B): dedupe helper for post-write inserts. Firestore's local
// listener delivers a newly written doc immediately, and the manual prepend
// after addDoc resolves then adds a SECOND copy with the same id (the
// server-ack snapshot does not re-fire, so the duplicate stays until
// refresh). Every insert below skips when the id is already present — the
// optimistic insert itself stays (the listener can lag), it just never
// duplicates.
const prependUnique = <T extends { id: string }>(prev: T[], item: T): T[] =>
  prev.some(x => x.id === item.id) ? prev : [item, ...prev];

// Rollback helper for failed deletes: restore ONLY the deleted item (and
// only if the listener has not already delivered it), instead of
// restoring a stale whole-list snapshot that would drop records the
// listener delivered meanwhile. Returns a state updater.
const restoreDeleted = <T extends { id: string }>(prev: T[], id: string) => (cur: T[]): T[] => {
  const deleted = prev.find(x => x.id === id);
  if (!deleted || cur.some(x => x.id === id)) return cur;
  return [deleted, ...cur];
};

// Helper to resolve clean display name for users
export const resolveCleanName = (name?: string, email?: string, phone?: string): string => {
  const trimmed = (name || '').trim();
  if (
    trimmed && 
    trimmed !== 'အသုံးပြုသူ' && 
    trimmed !== 'အမည်မရှိ' && 
    trimmed !== 'Patient' && 
    trimmed !== 'အသုံးပြုသူ' &&
    !trimmed.startsWith('pat-') && 
    !trimmed.startsWith('user-')
  ) {
    return trimmed;
  }
  if (email && email.includes('@')) {
    const rawPrefix = email.split('@')[0];
    if (rawPrefix && !rawPrefix.startsWith('pat-') && !rawPrefix.startsWith('user-')) {
      const formatted = rawPrefix
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[._\-\d]+/g, ' ')
        .trim();
      if (formatted) {
        return formatted.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      }
      return rawPrefix.charAt(0).toUpperCase() + rawPrefix.slice(1);
    }
  }
  if (phone) {
    return `အသုံးပြုသူ (${phone})`;
  }
  return 'အသုံးပြုသူ';
};

// Filter to ensure profile is a patient, not an admin
export const isPatientOnly = (p: UserProfile): boolean => p?.role !== 'admin';

// Aggregates patient profiles from the users collection and record collections for admin dashboard
// v2.4.16 (D-C4): family member doc ids are NEVER invented into "patients"
// — a member's records carry the member doc id as userId, and the old code
// turned every such member into a phantom patient sharing the owner's
// email, with a fabricated `${userId}@patient.local` address and an
// invented chronic condition. Discovered profiles now carry only what the
// records actually say (email '' and no conditions when unknown).
export const aggregatePatientsFromRecords = (
  existingUsers: UserProfile[],
  vitals: BloodPressureRecord[] = [],
  glucoses: BloodSugarRecord[] = [],
  bmis: BMIRecord[] = [],
  labs: LabTestRecord[] = [],
  meds: Medication[] = [],
  questions: DoctorQuestion[] = [],
  advices: DoctorAdvice[] = [],
  familyMemberIds: Set<string> = new Set()
): UserProfile[] => {
  const patientMap = new Map<string, UserProfile>();
  // A record whose userId is a family member doc id belongs to that member,
  // not to a standalone patient — never discover a patient from it.
  const isFamilyMemberId = (id?: string): boolean => !!id && familyMemberIds.has(id);

  // 1. Add from existing users collection (excluding admin users)
  existingUsers.forEach(u => {
    if (u && u.id && u.role !== 'admin') {
      const cleanUser = {
        ...u,
        displayName: resolveCleanName(u.displayName, u.email),
      };
      patientMap.set(u.id, cleanUser);
    }
  });

  // 2. Discover from Vitals
  vitals.forEach(v => {
    if (v.userId && !patientMap.has(v.userId) && !isFamilyMemberId(v.userId)) {
      const discovered: UserProfile = {
        id: v.userId,
        displayName: resolveCleanName(v.userName || v.patientName, v.patientEmail),
        email: v.patientEmail || '',
        role: 'patient',
        chronicConditions: [],
        createdAt: v.recordedAt || v.createdAt || new Date().toISOString()
      };
      patientMap.set(v.userId, discovered);
    } else if (v.userId && patientMap.has(v.userId)) {
      const p = patientMap.get(v.userId)!;
      if ((!p.displayName || p.displayName === 'အသုံးပြုသူ' || p.displayName === 'အမည်မရှိ' || p.displayName === 'အသုံးပြုသူ') && (v.userName || v.patientName)) {
        p.displayName = resolveCleanName(v.userName || v.patientName, v.patientEmail || p.email);
      }
    }
  });

  // 3. Discover from Glucose
  glucoses.forEach(g => {
    if (g.userId && !patientMap.has(g.userId) && !isFamilyMemberId(g.userId)) {
      const discovered: UserProfile = {
        id: g.userId,
        displayName: resolveCleanName(g.userName || g.patientName, (g as any).patientEmail),
        email: (g as any).patientEmail || '',
        role: 'patient',
        chronicConditions: [],
        createdAt: g.recordedAt || g.createdAt || new Date().toISOString()
      };
      patientMap.set(g.userId, discovered);
    } else if (g.userId && patientMap.has(g.userId)) {
      const p = patientMap.get(g.userId)!;
      if ((!p.displayName || p.displayName === 'အသုံးပြုသူ' || p.displayName === 'အမည်မရှိ' || p.displayName === 'အသုံးပြုသူ') && (g.userName || g.patientName)) {
        p.displayName = resolveCleanName(g.userName || g.patientName, (g as any).patientEmail || p.email);
      }
    }
  });

  // 4. Discover from BMI Records
  bmis.forEach(b => {
    if (b.userId && !patientMap.has(b.userId) && !isFamilyMemberId(b.userId)) {
      const discovered: UserProfile = {
        id: b.userId,
        displayName: resolveCleanName(b.userName, undefined),
        email: '',
        role: 'patient',
        heightCm: b.heightCm,
        weightKg: b.weightKg,
        waistCm: b.waistCm,
        createdAt: b.date || b.createdAt || new Date().toISOString()
      };
      patientMap.set(b.userId, discovered);
    } else if (b.userId && patientMap.has(b.userId)) {
      const p = patientMap.get(b.userId)!;
      if ((!p.displayName || p.displayName === 'အသုံးပြုသူ' || p.displayName === 'အမည်မရှိ' || p.displayName === 'အသုံးပြုသူ') && b.userName) {
        p.displayName = resolveCleanName(b.userName, p.email);
      }
      if (!p.heightCm && b.heightCm) p.heightCm = b.heightCm;
      if (!p.weightKg && b.weightKg) p.weightKg = b.weightKg;
      if (!p.waistCm && b.waistCm) p.waistCm = b.waistCm;
    }
  });

  // 5. Discover from Medications Records
  meds.forEach(m => {
    if (m.userId && !patientMap.has(m.userId) && !isFamilyMemberId(m.userId)) {
      const discovered: UserProfile = {
        id: m.userId,
        displayName: resolveCleanName((m as any).userName || (m as any).patientName, (m as any).patientEmail),
        email: (m as any).patientEmail || '',
        role: 'patient',
        createdAt: m.startDate || (m as any).createdAt || new Date().toISOString()
      };
      patientMap.set(m.userId, discovered);
    } else if (m.userId && patientMap.has(m.userId)) {
      const p = patientMap.get(m.userId)!;
      if ((!p.displayName || p.displayName === 'အသုံးပြုသူ' || p.displayName === 'အမည်မရှိ' || p.displayName === 'အသုံးပြုသူ') && ((m as any).userName || (m as any).patientName)) {
        p.displayName = resolveCleanName((m as any).userName || (m as any).patientName, (m as any).patientEmail || p.email);
      }
    }
  });

  // 6. Discover from Doctor Questions
  questions.forEach(q => {
    if (q.userId && !patientMap.has(q.userId) && !isFamilyMemberId(q.userId)) {
      const discovered: UserProfile = {
        id: q.userId,
        displayName: q.patientName || 'မေးမြန်းသူ အသုံးပြုသူ',
        email: q.patientEmail || '',
        role: 'patient',
        createdAt: q.createdAt || new Date().toISOString()
      };
      patientMap.set(q.userId, discovered);
    }
  });

  // 7. Discover from Advices
  advices.forEach(a => {
    if (a.userId && !patientMap.has(a.userId) && !isFamilyMemberId(a.userId)) {
      const discovered: UserProfile = {
        id: a.userId,
        displayName: a.patientName || 'အသုံးပြုသူ',
        email: (a as any).patientEmail || '',
        role: 'patient',
        createdAt: a.createdAt || new Date().toISOString()
      };
      patientMap.set(a.userId, discovered);
    }
  });

  return Array.from(patientMap.values()).filter(p => p.role !== 'admin');
};

export interface DatabaseStats {
  totalUsers: number;
  totalBP: number;
  totalGlucose: number;
  totalBMI: number;
  totalLabs: number;
  totalMeds: number;
  totalQuestions: number;
  totalAdvices: number;
  totalVaccines: number;
  totalDocuments: number;
  estimatedStorageKB: number;
  dailyReadQuota: number;
  dailyWriteQuota: number;
  storageQuotaMB: number;
  lastSyncTime: string;
}

interface HealthDataContextType {
  // State
  bpRecords: BloodPressureRecord[];
  glucoseRecords: BloodSugarRecord[];
  labRecords: LabTestRecord[];
  medications: Medication[];
  vaccineRecords: VaccinationRecord[];
  doctorAdvices: DoctorAdvice[];
  patientsList: UserProfile[];
  bmiRecords: BMIRecord[];
  latestBMI: BMIRecord | null;
  doctorQuestions: DoctorQuestion[];
  allDoctorQuestions: DoctorQuestion[];
  // Unfiltered arrays (complete for admins; own records only for patients)
  allBPRecords: BloodPressureRecord[];
  allGlucoseRecords: BloodSugarRecord[];
  allBMIRecords: BMIRecord[];
  // The signed-in user's OWN records only — never pooled. The sidebar
  // summary uses these so an admin with no patient selected (or a user in
  // family 'all' view) sees their own latest vitals, never a stranger's
  // newest record presented as their own.
  ownBPRecords: BloodPressureRecord[];
  ownGlucoseRecords: BloodSugarRecord[];
  ownBMIRecords: BMIRecord[];
  ownLabRecords: LabTestRecord[];
  ownMedications: Medication[];
  ownVaccineRecords: VaccinationRecord[];
  ownMedicationLogs: MedicationLog[];
  // True when the current view pools more than one person's records
  // (family 'all' view, or an admin viewing a patient + their family).
  // History tables show an owner column when this is true.
  isPooledView: boolean;
  allLabRecords: LabTestRecord[];
  allMedicationRecords: Medication[];
  allVaccineRecords: VaccinationRecord[];
  allMedicationLogs: MedicationLog[];
  allDoctorAdvices: DoctorAdvice[];
  broadcastTickers: BroadcastTicker[];
  dbStats: DatabaseStats;
  // True until the first Firestore snapshot arrives, so modules can show a
  // loading state instead of a false "no records yet" empty state.
  dataLoading: boolean;
  refreshAdminData: () => Promise<void>;
  // One-time repair: backfill patientEmail on existing records (admin only)
  repairPatientEmails: () => Promise<{ checked: number; fixed: number; alreadyOk: number; unfixable: number; unfixableReasons: string[]; errors: string[] }>;
  // Admin role management (admin only)
  promoteToAdmin: (userId: string) => Promise<void>;
  revokeAdmin: (adminId: string) => Promise<void>;

  // Broadcast Marquee Ticker Actions
  addBroadcastTicker: (message: string, type?: 'info' | 'warning' | 'urgent') => Promise<void>;
  toggleBroadcastTicker: (id: string, isActive: boolean) => Promise<void>;
  deleteBroadcastTicker: (id: string) => Promise<void>;
  
  // Family Members Management
  familyMembers: FamilyMember[];
  // Family view selection: 'self' (default — the signed-in user's own
  // records only), 'all' (self + every family member, pooled) or one family
  // member's doc id (only that member's records). null behaves like 'self'.
  selectedFamilyMemberId: string | null;
  setSelectedFamilyMemberId: (id: string | null) => void;
  selectedFamilyMember: FamilyMember | null;
  addFamilyMember: (member: Omit<FamilyMember, 'id'>) => Promise<void>;
  updateFamilyMember: (id: string, updates: Partial<FamilyMember>) => Promise<void>;
  deleteFamilyMember: (id: string) => Promise<void>;

  // Medication Intake Logs & Adherence
  medicationLogs: MedicationLog[];
  toggleMedicationDoseTaken: (medicationId: string, dateStr: string, taken: boolean, doseIndex?: number, medName?: string, owner?: { uid: string; email: string }) => Promise<boolean>;

  // Selected Patient for Admin view
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
  selectedPatient: UserProfile | null;
  addPatient: (data: Partial<UserProfile> & { displayName: string }) => Promise<UserProfile>;
  updatePatient: (id: string, updates: Partial<UserProfile>) => Promise<void>;
  deletePatient: (id: string, deleteAssociatedData?: boolean) => Promise<void>;
  clearAllPatients: () => Promise<void>;

  // Actions
  addBPRecord: (data: Omit<BloodPressureRecord, 'id' | 'category' | 'createdAt'>) => Promise<void>;
  updateBPRecord: (id: string, updates: Partial<BloodPressureRecord>) => Promise<void>;
  deleteBPRecord: (id: string) => Promise<void>;
  
  addGlucoseRecord: (data: Omit<BloodSugarRecord, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  updateGlucoseRecord: (id: string, updates: Partial<BloodSugarRecord>) => Promise<void>;
  deleteGlucoseRecord: (id: string) => Promise<void>;

  addLabRecord: (data: Omit<LabTestRecord, 'id' | 'createdAt'>) => Promise<void>;
  updateLabRecord: (id: string, updates: Partial<LabTestRecord>) => Promise<void>;
  deleteLabRecord: (id: string) => Promise<void>;

  addMedication: (data: Omit<Medication, 'id' | 'createdAt'>) => Promise<void>;
  updateMedication: (id: string, updates: Partial<Medication>) => Promise<void>;
  updateMedicationStatus: (id: string, status: Medication['status']) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;

  addVaccineRecord: (data: Omit<VaccinationRecord, 'id' | 'createdAt'>) => Promise<void>;
  updateVaccineRecord: (id: string, updates: Partial<VaccinationRecord>) => Promise<void>;
  deleteVaccineRecord: (id: string) => Promise<void>;

  addBMIRecord: (data: Omit<BMIRecord, 'id' | 'category' | 'bmi' | 'createdAt'> & { bmi?: number; category?: any }) => Promise<void>;
  updateBMIRecord: (id: string, updates: Partial<BMIRecord>) => Promise<void>;
  deleteBMIRecord: (id: string) => Promise<void>;

  addDoctorAdvice: (patientId: string, adviceText: string, diet?: string) => Promise<void>;
  deleteDoctorAdvice: (id: string) => Promise<void>;

  addDoctorQuestion: (data: Omit<DoctorQuestion, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  answerDoctorQuestion: (questionId: string, answer: DoctorAnswer) => Promise<void>;
  deleteDoctorQuestion: (id: string) => Promise<void>;
  closeDoctorQuestion: (id: string) => Promise<void>;

}

const HealthDataContext = createContext<HealthDataContextType | undefined>(undefined);

export const HealthDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, profile, isAdmin } = useAuth();
  const { showToast } = useToast();

  // Pure in-memory state - persistent storage is handled directly by Firestore's persistentLocalCache
  const [allBP, setAllBP] = useState<BloodPressureRecord[]>([]);
  const [allGlucose, setAllGlucose] = useState<BloodSugarRecord[]>([]);
  const [allLabs, setAllLabs] = useState<LabTestRecord[]>([]);
  const [allMeds, setAllMeds] = useState<Medication[]>([]);
  const [allMedLogs, setAllMedLogs] = useState<MedicationLog[]>([]);
  const [allAdvices, setAllAdvices] = useState<DoctorAdvice[]>([]);
  const [allBMI, setAllBMI] = useState<BMIRecord[]>([]);
  const [allQuestions, setAllQuestions] = useState<DoctorQuestion[]>([]);
  const [allVaccines, setAllVaccines] = useState<VaccinationRecord[]>([]);
  const [broadcastTickers, setBroadcastTickers] = useState<BroadcastTicker[]>([
    {
      id: 'ticker-01',
      message: '📢 အသိပေးချက်: ဤ အက်ပလီကေးရှင်းပါ အချက်အလက်များသည် ကျန်းမာရေး ဗဟုသုတနှင့် ကိုယ်ရေးကိုယ်တာ မှတ်တမ်းတင်ရန် သီးသန့် ဖြစ်ပါသည်။ ဆရာဝန်၏ တိုက်ရိုက် ကုသမှုကို အစားမထိုးပါ။',
      isActive: true,
      type: 'info',
      createdAt: new Date().toISOString()
    }
  ]);

  const [patientsList, setPatientsList] = useState<UserProfile[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => new Date().toLocaleTimeString('my-MM'));

  // True until the first Firestore snapshot arrives. A fallback timeout
  // clears it so it can never stick on true forever (e.g. a listener error).
  const [dataLoading, setDataLoading] = useState(true);

  // Firestore Live Listeners attached strictly when authenticated
  useEffect(() => {
    if (!currentUser) {
      setDataLoading(true);
      setAllBP([]);
      setAllGlucose([]);
      setAllLabs([]);
      setAllMeds([]);
      setAllAdvices([]);
      setAllBMI([]);
      setAllQuestions([]);
      setAllVaccines([]);
      setPatientsList([]);
      setFamilyMembers([]);
      setSelectedFamilyMemberId(null);
      setSelectedPatientId(null);
      return;
    }

    let unsubscribeUsers = () => {};
    let unsubscribeVitals = () => {};
    let unsubscribeGlu = () => {};
    let unsubscribeBMI = () => {};
    let unsubscribeLabs = () => {};
    let unsubscribeMeds = () => {};
    let unsubscribeVaccines = () => {};
    let unsubscribeQuestions = () => {};
    let unsubscribeAdvices = () => {};
    let unsubscribeFam = () => {};
    let unsubscribeTickers = () => {};

    try {
      // Safety net: never leave the UI stuck on "loading" if a snapshot
      // never arrives (e.g. a listener error). Cleared on unmount.
      const loadFallback = setTimeout(() => setDataLoading(false), 10000);

      // Dual-key merged subscription: a non-admin sees a document when EITHER
      // its userId is their uid OR its patientEmail is their email (older
      // records may carry only one of the two keys). The two single-field
      // equality queries are merged by document id, so a doc present in both
      // appears once, and a doc disappearing from one query stays visible
      // while the other query still returns it. Admins keep one unfiltered
      // query over the whole collection. No new indexes needed — both are
      // single-field equality queries, already allowed by firestore.rules.
      const subscribeMerged = <T,>(
        collectionName: string,
        setItems: (items: T[]) => void,
        warnLabel: string,
        toastMessage: string,
        onFirstSnapshot?: () => void,
      ): (() => void) => {
        const queries = isAdmin
          ? [query(collection(db, collectionName))]
          : [
              query(collection(db, collectionName), where('userId', '==', currentUser.uid)),
              query(collection(db, collectionName), where('patientEmail', '==', currentUser.email || '___')),
            ];
        const perQuery = queries.map(() => new Map<string, T>());
        const emit = () => {
          const merged = new Map<string, T>();
          perQuery.forEach(m => m.forEach((v, k) => merged.set(k, v)));
          setItems(Array.from(merged.values()));
        };
        let firstSnapshotDone = false;
        const unsubs = queries.map((q, idx) =>
          onSnapshot(q, (snapshot) => {
            const m = new Map<string, T>();
            snapshot.forEach(docSnap => {
              m.set(docSnap.id, { ...(docSnap.data() as T), id: docSnap.id } as T);
            });
            perQuery[idx] = m;
            emit();
            if (!firstSnapshotDone) {
              firstSnapshotDone = true;
              onFirstSnapshot?.();
            }
          }, (e) => {
            console.warn(warnLabel, e);
            showToast(toastMessage, 'warning');
          })
        );
        return () => unsubs.forEach(u => u());
      };

      // 1. Users list (Only admins can query all users)
      if (isAdmin) {
        const usersQuery = query(collection(db, 'users'));
        unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
          const list: UserProfile[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as UserProfile;
            if (data.role !== 'admin') {
              list.push({ ...data, id: docSnap.id });
            }
          });
          setPatientsList(list);
        }, (err) => {
          console.warn('Users listener:', err);
          showToast('အသုံးပြုသူစာရင်း ရယူရာတွင် ချို့ယွင်းချက် ဖြစ်ပေါ်ခဲ့ပါသည်', 'warning');
        });
      }

      // 2. Vitals — its first snapshot is the signal that the core data
      // has arrived, so the loading state can be cleared.
      unsubscribeVitals = subscribeMerged<BloodPressureRecord>(
        'vitals',
        setAllBP,
        'Vitals snapshot:',
        'သွေးပေါင်ချိန် မှတ်တမ်းများ ချိတ်ဆက်ရယူရာတွင် ချို့ယွင်းချက် ရှိနေပါသည်',
        () => setDataLoading(false),
      );

      // 3. Glucose
      unsubscribeGlu = subscribeMerged<BloodSugarRecord>(
        'glucose',
        setAllGlucose,
        'Glucose snapshot:',
        'ဆီးချို မှတ်တမ်းများ ချိတ်ဆက်ရယူရာတွင် ချို့ယွင်းချက် ရှိနေပါသည်',
      );

      // 4. BMI
      unsubscribeBMI = subscribeMerged<BMIRecord>(
        'bmi',
        setAllBMI,
        'BMI snapshot:',
        'BMI မှတ်တမ်းများ ချိတ်ဆက်ရယူရာတွင် ချို့ယွင်းချက် ရှိနေပါသည်',
      );

      // 5. Labs
      unsubscribeLabs = subscribeMerged<LabTestRecord>(
        'labTests',
        setAllLabs,
        'Labs snapshot:',
        'ဓာတ်ခွဲခန်း မှတ်တမ်းများ ချိတ်ဆက်ရယူရာတွင် ချို့ယွင်းချက် ရှိနေပါသည်',
      );

      // 6. Meds
      unsubscribeMeds = subscribeMerged<Medication>(
        'medications',
        setAllMeds,
        'Meds snapshot:',
        'ဆေးမှတ်တမ်းများ ချိတ်ဆက်ရယူရာတွင် ချို့ယွင်းချက် ရှိနေပါသည်',
      );

      // 7. Doctor Questions
      unsubscribeQuestions = subscribeMerged<DoctorQuestion>(
        'doctorQuestions',
        setAllQuestions,
        'DoctorQuestions snapshot:',
        'ဆရာဝန် မေးခွန်းများ ချိတ်ဆက်ရယူရာတွင် ချို့ယွင်းချက် ရှိနေပါသည်',
      );

      // 8. Doctor Advices
      unsubscribeAdvices = subscribeMerged<DoctorAdvice>(
        'doctorAdvices',
        setAllAdvices,
        'DoctorAdvices snapshot:',
        'ဆရာဝန် အကြံပြုချက်များ ချိတ်ဆက်ရယူရာတွင် ချို့ယွင်းချက် ရှိနေပါသည်',
      );

      // 9. Family Members
      unsubscribeFam = subscribeMerged<FamilyMember>(
        'familyMembers',
        (items) => {
          setFamilyMembers(items);
          // Default the family view to 'self' (the signed-in user's own
          // records only) the first time members load — never auto-select
          // the first member, or the user could never view only their own
          // records again. Functional update: this listener closure is stale
          // (the effect only re-runs on currentUser/isAdmin), so read the
          // current value instead of the captured one.
          setSelectedFamilyMemberId(prev => prev ?? 'self');
        },
        'FamilyMembers snapshot:',
        'မိသားစုဝင် မှတ်တမ်းများ ချိတ်ဆက်ရယူရာတွင် ချို့ယွင်းချက် ရှိနေပါသည်',
      );

      // 10. Medication Intake Logs
      const unsubscribeMedLogs = subscribeMerged<MedicationLog>(
        'medicationLogs',
        setAllMedLogs,
        'MedicationLogs snapshot:',
        'ဆေးသောက်ပြီး မှတ်တမ်းများ ချိတ်ဆက်ရယူရာတွင် ချို့ယွင်းချက် ရှိနေပါသည်',
      );

      // 11. Vaccines
      unsubscribeVaccines = subscribeMerged<VaccinationRecord>(
        'vaccines',
        setAllVaccines,
        'Vaccines snapshot:',
        'ကာကွယ်ဆေး မှတ်တမ်းများ ချိတ်ဆက်ရယူရာတွင် ချို့ယွင်းချက် ရှိနေပါသည်',
      );

      // 12. Broadcast Tickers
      unsubscribeTickers = onSnapshot(collection(db, 'broadcastTickers'), (snapshot) => {
        const items: BroadcastTicker[] = [];
        snapshot.forEach(docSnap => {
          items.push({ ...(docSnap.data() as BroadcastTicker), id: docSnap.id });
        });
        // Always set — even when empty. The old `if (items.length > 0)`
        // guard meant deleting the LAST ticker left a ghost banner behind,
        // because the listener never cleared the list.
        setBroadcastTickers(items);
      }, (e) => console.warn('BroadcastTickers snapshot:', e));

      // One-time migration of legacy localStorage family members into Firestore
      const legacyFamStr = localStorage.getItem('health_family_members');
      if (legacyFamStr) {
        try {
          const parsedFam = JSON.parse(legacyFamStr);
          if (Array.isArray(parsedFam) && parsedFam.length > 0) {
            parsedFam.forEach(async (member: any) => {
              try {
                const migratedMember = {
                  name: member.name || 'မိသားစုဝင်',
                  relation: member.relation || 'အခြား',
                  age: Number(member.age || 0),
                  gender: member.gender || 'male',
                  bloodType: member.bloodType || 'O+',
                  chronicConditions: member.chronicConditions || [],
                  emergencyContact: member.emergencyContact || '',
                  userId: currentUser.uid,
                  patientEmail: profile?.email || currentUser.email || '',
                  avatarColor: member.gender === 'female' ? 'bg-rose-600' : 'bg-emerald-600',
                  createdAt: new Date().toISOString(),
                };
                await addDoc(collection(db, 'familyMembers'), sanitizeForFirestore(migratedMember));
              } catch (err) {
                console.warn('Error migrating member:', err);
              }
            });
          }
        } catch (e) {
          console.warn('Failed to parse health_family_members migration data:', e);
        } finally {
          localStorage.removeItem('health_family_members');
        }
      }

      if (isAdmin) {
        refreshAdminData();
      }

      return () => {
        clearTimeout(loadFallback);
        unsubscribeUsers();
        unsubscribeVitals();
        unsubscribeGlu();
        unsubscribeBMI();
        unsubscribeLabs();
        unsubscribeMeds();
        unsubscribeMedLogs();
        unsubscribeVaccines();
        unsubscribeQuestions();
        unsubscribeAdvices();
        unsubscribeFam();
        unsubscribeTickers();
      };
    } catch (e) {
      console.warn('Firestore initialization warning:', e);
    }
  }, [currentUser, isAdmin]);

  const refreshAdminData = async () => {
    if (!isAdmin) return;
    try {
      const [uSnap, vSnap, gSnap, bSnap, lSnap, mSnap, qSnap, aSnap, vacSnap, famSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'vitals')),
        getDocs(collection(db, 'glucose')),
        getDocs(collection(db, 'bmi')),
        getDocs(collection(db, 'labTests')),
        getDocs(collection(db, 'medications')),
        getDocs(collection(db, 'doctorQuestions')),
        getDocs(collection(db, 'doctorAdvices')),
        getDocs(collection(db, 'vaccines')),
        // v2.4.16 (D-C4): every family member doc id, so the aggregator
        // never invents a phantom "patient" out of a member's records.
        getDocs(collection(db, 'familyMembers')),
      ]);

      const rawUsers: UserProfile[] = [];
      uSnap.forEach(d => {
        const prof = { ...(d.data() as UserProfile), id: d.id };
        if (prof.role !== 'admin') rawUsers.push(prof);
      });

      const vList: BloodPressureRecord[] = [];
      vSnap.forEach(d => vList.push({ ...(d.data() as BloodPressureRecord), id: d.id }));
      setAllBP(vList);

      const gList: BloodSugarRecord[] = [];
      gSnap.forEach(d => gList.push({ ...(d.data() as BloodSugarRecord), id: d.id }));
      setAllGlucose(gList);

      const bList: BMIRecord[] = [];
      bSnap.forEach(d => bList.push({ ...(d.data() as BMIRecord), id: d.id }));
      setAllBMI(bList);

      const lList: LabTestRecord[] = [];
      lSnap.forEach(d => lList.push({ ...(d.data() as LabTestRecord), id: d.id }));
      setAllLabs(lList);

      const mList: Medication[] = [];
      mSnap.forEach(d => mList.push({ ...(d.data() as Medication), id: d.id }));
      setAllMeds(mList);

      const qList: DoctorQuestion[] = [];
      qSnap.forEach(d => qList.push({ ...(d.data() as DoctorQuestion), id: d.id }));
      setAllQuestions(qList);

      const aList: DoctorAdvice[] = [];
      aSnap.forEach(d => aList.push({ ...(d.data() as DoctorAdvice), id: d.id }));
      setAllAdvices(aList);

      const vacList: VaccinationRecord[] = [];
      vacSnap.forEach(d => vacList.push({ ...(d.data() as VaccinationRecord), id: d.id }));
      setAllVaccines(vacList);

      // Aggregate all discovered patient profiles
      const familyMemberIds = new Set<string>(famSnap.docs.map(d => d.id));
      const combinedPatients = aggregatePatientsFromRecords(rawUsers, vList, gList, bList, lList, mList, qList, aList, familyMemberIds);
      setPatientsList(combinedPatients);

      setLastSyncTime(new Date().toLocaleTimeString('my-MM'));
    } catch (err) {
      console.warn('Admin refresh err:', err);
    }
  };

  // Admin role management (admin only): promote a user to Admin, or remove
  // another admin. Removing yourself is never allowed (enforced here and in
  // firestore.rules). The promoted user must sign in again before the Admin
  // role takes effect (AuthContext loads isAdmin on sign-in).
  const promoteToAdmin = async (userId: string): Promise<void> => {
    if (!isAdmin) {
      throw new Error('စီမံခန့်ခွဲသူသာလျှင် Admin ရာထူး တင်ပေးနိုင်ပါသည်');
    }
    const target = patientsList.find(p => p.id === userId);
    await setDoc(doc(db, 'admins', userId), {
      email: target?.email || '',
      displayName: target?.displayName || '',
      grantedAt: new Date().toISOString(),
      grantedBy: currentUser?.uid || '',
    }, { merge: true });
  };

  const revokeAdmin = async (adminId: string): Promise<void> => {
    if (!isAdmin) {
      throw new Error('စီမံခန့်ခွဲသူသာလျှင် Admin ရာထူး ဖြုတ်နိုင်ပါသည်');
    }
    if (adminId === currentUser?.uid) {
      throw new Error('ကိုယ့်ကိုယ်ကို Admin ရာထူး ဖြုတ်လို့ မရပါ');
    }
    await deleteDoc(doc(db, 'admins', adminId));
  };

  // One-time repair (admin only): backfill patientEmail on existing records.
  // Older records may carry a wrong or missing patientEmail (e.g. stamped
  // with the admin's email on on-behalf writes, or omitted entirely), which
  // makes them invisible to the patient's listeners. This walks every
  // user-data collection and sets patientEmail from the owning user's profile
  // (or the family member holder's email) wherever it differs. Docs whose
  // owner cannot be resolved are left untouched and counted as `unfixable`
  // (v2.4.11 7.6 — they were wrongly counted in alreadyOk, so the UI could
  // never tell them apart); the reasons list names each such doc.
  const repairPatientEmails = async (): Promise<{ checked: number; fixed: number; alreadyOk: number; unfixable: number; unfixableReasons: string[]; errors: string[] }> => {
    if (!isAdmin) {
      throw new Error('စီမံခန့်ခွဲသူသာလျှင် ဤပြင်ဆင်မှုကို လုပ်ဆောင်နိုင်ပါသည်');
    }
    let checked = 0;
    let fixed = 0;
    let alreadyOk = 0;
    let unfixable = 0;
    const unfixableReasons: string[] = [];
    const errors: string[] = [];

    const usersById = new Map<string, string>();
    const famById = new Map<string, string>();
    try {
      const [usersSnap, famSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'familyMembers')),
      ]);
      usersSnap.forEach(d => {
        const data = d.data() as UserProfile;
        if (data.email) usersById.set(d.id, data.email);
      });
      famSnap.forEach(d => {
        const data = d.data() as any;
        const holderEmail: string | undefined = data.patientEmail || usersById.get(data.userId);
        if (holderEmail) famById.set(d.id, holderEmail);
      });
    } catch (e) {
      errors.push(`users/familyMembers စာရင်း ရယူရာတွင် ချို့ယွင်းချက်: ${e instanceof Error ? e.message : String(e)}`);
      return { checked, fixed, alreadyOk, unfixable, unfixableReasons, errors };
    }

    for (const colName of USER_DATA_COLLECTIONS) {
      try {
        const snap = await getDocs(collection(db, colName));
        for (const docSnap of snap.docs) {
          checked++;
          const data = docSnap.data() as any;
          const correctEmail: string | null =
            (data.userId && usersById.get(data.userId)) ||
            (data.userId && famById.get(data.userId)) ||
            null;
          // No owner found at all: nothing correct to write, so this doc
          // can never be fixed by this repair — count it separately with
          // a reason, never as "already OK".
          if (!correctEmail) {
            unfixable++;
            if (unfixableReasons.length < 10) unfixableReasons.push(`${colName}/${docSnap.id}: ပိုင်ရှင် ရှာမတွေ့ပါ`);
            continue;
          }
          if (data.patientEmail === correctEmail) {
            alreadyOk++;
            continue;
          }
          try {
            await updateDoc(doc(db, colName, docSnap.id), { patientEmail: correctEmail });
            fixed++;
          } catch (e) {
            if (errors.length < 10) errors.push(`${colName}/${docSnap.id}: ${e instanceof Error ? e.message : String(e)}`);
          }
        }
      } catch (e) {
        if (errors.length < 10) errors.push(`${colName} ရယူရာတွင် ချို့ယွင်းချက်: ${e instanceof Error ? e.message : String(e)}`);
        continue;
      }
    }

    return { checked, fixed, alreadyOk, unfixable, unfixableReasons, errors };
  };

  const totalUsers = patientsList.length;
  const totalBP = allBP.length;
  const totalGlucose = allGlucose.length;
  const totalBMI = allBMI.length;
  const totalLabs = allLabs.length;
  const totalMeds = allMeds.length;
  const totalQuestions = allQuestions.length;
  const totalAdvices = allAdvices.length;
  const totalVaccines = allVaccines.length;
  const totalDocuments = totalUsers + totalBP + totalGlucose + totalBMI + totalLabs + totalMeds + totalQuestions + totalAdvices + totalVaccines;
  const estimatedStorageKB = Math.max(1, Math.round(totalDocuments * 0.85));

  const dbStats: DatabaseStats = {
    totalUsers,
    totalBP,
    totalGlucose,
    totalBMI,
    totalLabs,
    totalMeds,
    totalQuestions,
    totalAdvices,
    totalVaccines,
    totalDocuments,
    estimatedStorageKB,
    dailyReadQuota: 50000,
    dailyWriteQuota: 20000,
    storageQuotaMB: 1024,
    lastSyncTime,
  };

  // Target Active User ID for filtering
  const currentTargetUserId = isAdmin
    ? (selectedPatientId || null)
    : (currentUser?.uid || null);

  // The family member currently selected in the FamilyMembersBar, if any.
  // selectedFamilyMemberId is 'self' (default: the signed-in user's own
  // records only), 'all' (self + every family member, pooled) or one family
  // member's doc id. There is deliberately NO fallback to the first member:
  // once any member exists, the user must still be able to view only their
  // own records. (Defined here, before visibleUserIds/resolveTarget use it.)
  const selectedFamilyMember = selectedFamilyMemberId
    ? familyMembers.find(f => f.id === selectedFamilyMemberId) || null
    : null;

  // Records in the current view belong to the target user or to a family
  // member filed under that user (a family member doc belongs to a patient
  // when its userId === that patient's id). Matched on userId only — the old
  // filter also matched patientEmail === the SIGNED-IN user's email, which
  // mixed the admin's own records into a selected patient's view.
  // Which ids are visible follows the family view selection (non-admin):
  // 'self'/unset shows only the signed-in user's records, 'all' pools self
  // + every family member, and a selected member shows only that member.
  // Admins do not use the family view: their target is the selected patient
  // plus that patient's family members.
  const familyIdsOfTarget: string[] = currentTargetUserId
    ? familyMembers.filter(f => (f as any).userId === currentTargetUserId).map(f => f.id)
    : [];
  const visibleUserIds: string[] = !currentTargetUserId
    ? []
    : isAdmin
      ? [currentTargetUserId, ...familyIdsOfTarget]
      : selectedFamilyMemberId === 'all'
        ? [currentTargetUserId, ...familyIdsOfTarget]
        : selectedFamilyMember
          ? [selectedFamilyMember.id]
          : [currentTargetUserId];
  const inVisibleScope = (userId?: string): boolean => !!userId && visibleUserIds.includes(userId);

  // The signed-in user's OWN records only (v2.4.15). userId is the primary
  // match; the no-userId + own-email fallback covers legacy records written
  // before userId stamping. Family records always carry their member doc id
  // as userId, so they can never leak in here.
  const ownEmail = profile?.email || currentUser?.email || '';
  const isOwnRecord = (r: { userId?: string; patientEmail?: string }): boolean =>
    !!currentUser?.uid && (r.userId === currentUser.uid || (!r.userId && !!ownEmail && r.patientEmail === ownEmail));
  const ownBPRecords = allBP.filter(isOwnRecord);
  const ownGlucoseRecords = allGlucose.filter(isOwnRecord);
  const ownBMIRecords = allBMI.filter(isOwnRecord);
  const ownLabRecords = allLabs.filter(isOwnRecord);
  const ownMedications = allMeds.filter(isOwnRecord);
  const ownVaccineRecords = allVaccines.filter(isOwnRecord);
  const ownMedicationLogs = allMedLogs.filter(isOwnRecord);

  // True when the current view pools more than one person's records
  // (family 'all' view, or an admin viewing a patient + their family).
  // History tables show an owner column when this is true.
  const isPooledView = selectedFamilyMemberId === 'all' || (isAdmin && !!selectedPatientId);

  // Filtered views.
  // v2.4.16 (D-C1 / E-H3 / G-C1): when an admin has NO patient selected,
  // these show the admin's OWN records only. The old fallback pooled EVERY
  // user's records and every module, Trends, the Passport and the backup
  // export presented that pool as if it were one person's log — with no
  // owner label anywhere. doctorQuestions / doctorAdvices deliberately keep
  // the pooled fallback for an admin with no patient selected: they are the
  // admin's work queue, and every item carries its asker's name.
  const bpRecords = currentTargetUserId
    ? allBP.filter(b => inVisibleScope(b.userId))
    : (isAdmin ? ownBPRecords : []);

  const glucoseRecords = currentTargetUserId
    ? allGlucose.filter(g => inVisibleScope(g.userId))
    : (isAdmin ? ownGlucoseRecords : []);

  const labRecords = currentTargetUserId
    ? allLabs.filter(l => inVisibleScope(l.userId))
    : (isAdmin ? ownLabRecords : []);

  const medications = currentTargetUserId
    ? allMeds.filter(m => inVisibleScope(m.userId))
    : (isAdmin ? ownMedications : []);

  const vaccineRecords = currentTargetUserId
    ? allVaccines.filter(v => inVisibleScope(v.userId))
    : (isAdmin ? ownVaccineRecords : []);

  const doctorAdvices = currentTargetUserId
    ? allAdvices.filter(a => inVisibleScope(a.userId))
    : (isAdmin ? allAdvices : []);

  const bmiRecords = currentTargetUserId
    ? allBMI.filter(b => inVisibleScope(b.userId))
    : (isAdmin ? ownBMIRecords : []);

  const doctorQuestions = currentTargetUserId
    ? allQuestions.filter(q => inVisibleScope(q.userId))
    : (isAdmin ? allQuestions : allQuestions.filter(q => q.userId === currentUser?.uid));

  const latestBMI = bmiRecords.length > 0 
    ? [...bmiRecords].sort((a, b) => new Date(b.timestamp || b.date || b.createdAt || '').getTime() - new Date(a.timestamp || a.date || a.createdAt || '').getTime())[0] 
    : null;

  const selectedPatient = selectedPatientId 
    ? patientsList.find(p => p.id === selectedPatientId) || null 
    : null;

  // Resolve the patient a new record belongs to: when an admin has a patient
  // selected, records are filed under THAT patient (userId + patientEmail +
  // patientName all from the selected patient's profile); when a family
  // member is selected (non-admin), records are filed under THAT family
  // member's doc id; otherwise they belong to the signed-in user.
  // patientEmail must come from the TARGET patient — using the writer's own
  // profile email here is what made admin-entered records invisible to the
  // patient. Family members have no login/email of their own, so a family
  // member's record is stamped with the OWNER's email: that is what lets the
  // owner's merged listener (userId OR patientEmail) find the record again
  // afterwards, since a family doc id can never match a userId query.
  const resolveTarget = (): { uid: string; email: string; name: string } => {
    if (isAdmin && selectedPatientId) {
      return {
        uid: selectedPatientId,
        email: selectedPatient?.email || '',
        name: selectedPatient?.displayName || 'အသုံးပြုသူ',
      };
    }
    if (!isAdmin && selectedFamilyMember) {
      return {
        uid: selectedFamilyMember.id,
        email: profile?.email || currentUser?.email || '',
        name: selectedFamilyMember.name,
      };
    }
    return {
      uid: currentUser?.uid || '',
      email: profile?.email || currentUser?.email || '',
      name: profile?.displayName || 'အသုံးပြုသူ',
    };
  };

  // Actions
  const addPatient = async (patientData: Partial<UserProfile> & { displayName: string }): Promise<UserProfile> => {
    if (!isAdmin) {
      throw new Error('စီမံခန့်ခွဲသူသာလျှင် အသုံးပြုသူအသစ် ထည့်သွင်းနိုင်ပါသည်');
    }
    const newId = 'pat-' + Date.now();
    // No fabricated defaults: fields the caller did not provide stay
    // undefined (sanitizeForFirestore strips them) instead of inventing
    // an age, gender, condition, height, weight, blood type or phone number.
    const newPatient: UserProfile = {
      ...patientData,
      id: newId,
      email: patientData.email || `${newId}@familyhealth.local`,
      displayName: patientData.displayName,
      role: 'patient',
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', newId), sanitizeForFirestore(newPatient));
      // Only show the new user (and open their detail view) once the save
      // has actually succeeded. Inserting optimistically before the write
      // left a phantom user in the list when the save failed (e.g. rules
      // deny) and dropped the admin into the detail view of a user that
      // does not exist in Firestore. (v2.4.12 B: dedupe — the users
      // listener may already have delivered this user.)
      setPatientsList(prev => prependUnique(prev, newPatient));
      setSelectedPatientId(newId);
      showToast('အသုံးပြုသူမှတ်တမ်း အသစ်ကို အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ', 'success');
    } catch (e) {
      console.warn('Error saving patient to firestore:', e);
      showToast('အသုံးပြုသူမှတ်တမ်း သိမ်းဆည်းခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }

    return newPatient;
  };

  const updatePatient = async (id: string, updates: Partial<UserProfile>): Promise<void> => {
    if (!isAdmin && currentUser?.uid !== id) {
      throw new Error('လုပ်ဆောင်ခွင့် မရှိပါ');
    }

    const cleanUpdates = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    if (!isAdmin && 'role' in cleanUpdates) {
      delete cleanUpdates.role;
    }

    const prevPatientsList = patientsList;
    setPatientsList(prev => prev.map(p => (p.id === id ? { ...p, ...cleanUpdates } : p)));

    try {
      await setDoc(doc(db, 'users', id), sanitizeForFirestore(cleanUpdates), { merge: true });
      showToast('အသုံးပြုသူမှတ်တမ်းကို အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ', 'success');
    } catch (e) {
      // v2.4.16 (C-M6): roll back the optimistic patient update on failure.
      setPatientsList(prevPatientsList);
      console.warn('Error updating patient in firestore:', e);
      showToast('အသုံးပြုသူမှတ်တမ်း ပြင်ဆင်ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  // Delete EVERYTHING that belongs to a user (v2.4.16, D-C2/D-C3): their own
  // records (userId), legacy email-only records (patientEmail), their
  // family members' records (member doc ids — the old cascade queried only
  // userId, so a deleted user's family records survived and the aggregator
  // re-discovered them as phantom patients), their reserved username and
  // their notifications. For a family-member delete, pass ONLY the member
  // id and no email — member records carry the OWNER's email, and deleting
  // by it would wipe the owner's own records too.
  const deleteDocsForUserIds = async (userIds: string[], email?: string): Promise<void> => {
    const docRefs = new Map<string, any>();
    const collect = async (colName: string, field: 'userId' | 'patientEmail' | 'uid' | 'recipientEmail', value: string) => {
      try {
        const snap = await getDocs(query(collection(db, colName), where(field, '==', value)));
        snap.docs.forEach(d => docRefs.set(`${colName}/${d.id}`, doc(db, colName, d.id)));
      } catch (err) {
        console.warn(`Error collecting ${colName} for deletion (${field}=${value}):`, err);
      }
    };
    for (const uid of userIds) {
      for (const colName of USER_DATA_COLLECTIONS) {
        await collect(colName, 'userId', uid);
      }
      await collect('notifications', 'userId', uid);
    }
    if (email) {
      for (const colName of USER_DATA_COLLECTIONS) {
        await collect(colName, 'patientEmail', email);
      }
      await collect('notifications', 'recipientEmail', email);
    }
    // Free the main user's reserved username (family members never have one).
    await collect('usernames', 'uid', userIds[0]);
    await Promise.all([...docRefs.values()].map(d => deleteDoc(d)));
  };

  // The family member doc ids owned by a user (for a full cascade delete).
  const getFamilyMemberIdsOf = async (ownerUid: string): Promise<string[]> => {
    try {
      const snap = await getDocs(query(collection(db, 'familyMembers'), where('userId', '==', ownerUid)));
      return snap.docs.map(d => d.id);
    } catch (err) {
      console.warn('Error listing family members for cascade delete:', err);
      return [];
    }
  };

  const deletePatient = async (id: string, deleteAssociatedData: boolean = true) => {
    if (!isAdmin) {
      throw new Error('စီမံခန့်ခွဲသူသာလျှင် ဖျက်ပစ်နိုင်ပါသည်');
    }

    const prevPatients = patientsList;
    const prevSelected = selectedPatientId;
    const patientEmail = patientsList.find(p => p.id === id)?.email || '';
    setPatientsList(prev => prev.filter(p => p.id !== id));
    if (selectedPatientId === id) {
      setSelectedPatientId(null);
    }

    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (e) {
      setPatientsList(restoreDeleted(prevPatients, id));
      setSelectedPatientId(prevSelected);
      console.warn('Error deleting patient from firestore users collection:', e);
      showToast('အသုံးပြုသူပရိုဖိုင် ဖျက်ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }

    if (deleteAssociatedData) {
      try {
        const memberIds = await getFamilyMemberIdsOf(id);
        await deleteDocsForUserIds([id, ...memberIds], patientEmail || undefined);
        showToast('အသုံးပြုသူမှတ်တမ်းနှင့် ဆက်စပ်အချက်အလက်များကို အောင်မြင်စွာ ဖျက်သိမ်းပြီးပါပြီ', 'success');
      } catch (err) {
        console.warn('Error cascading patient records deletion:', err);
        showToast('ဆက်စပ်မှတ်တမ်းများ ဖျက်ရာတွင် အချို့ချို့ယွင်းချက် ဖြစ်ပေါ်ခဲ့ပါသည်', 'warning');
      }
    }
  };

  const clearAllPatients = async () => {
    if (!isAdmin) {
      throw new Error('စီမံခန့်ခွဲသူသာလျှင် လုပ်ဆောင်နိုင်ပါသည်');
    }

    // Delete from Firestore FIRST (awaited), and only clear local state
    // once every patient is gone. The old version used forEach(async...)
    // so deletions were unawaited, and it deleted only the users docs —
    // the patients' health records survived.
    const usersSnap = await getDocs(collection(db, 'users'));
    const emailById = new Map<string, string>();
    const idsFromUsers = usersSnap.docs
      .filter(d => (d.data() as UserProfile).role !== 'admin')
      .map(d => {
        emailById.set(d.id, (d.data() as UserProfile).email || '');
        return d.id;
      });
    patientsList.forEach(p => { if (p.email && !emailById.has(p.id)) emailById.set(p.id, p.email); });
    const allIds = Array.from(new Set([...idsFromUsers, ...patientsList.map(p => p.id)]));

    const results = await Promise.allSettled(allIds.map(async (pid) => {
      await deleteDoc(doc(db, 'users', pid));
      const memberIds = await getFamilyMemberIdsOf(pid);
      await deleteDocsForUserIds([pid, ...memberIds], emailById.get(pid) || undefined);
    }));
    const failedCount = results.filter(r => r.status === 'rejected').length;
    if (failedCount > 0) {
      showToast(`အသုံးပြုသူအားလုံး ဖျက်ရာတွင် ${failedCount} ဦး ဖျက်ခြင်း မအောင်မြင်ပါ`, 'error');
      throw new Error(`အသုံးပြုသူ ${failedCount} ဦး ဖျက်ခြင်း မအောင်မြင်ပါ`);
    }

    setPatientsList([]);
    setAllBP([]);
    setAllGlucose([]);
    setAllLabs([]);
    setAllMeds([]);
    setAllAdvices([]);
    setAllBMI([]);
    setAllQuestions([]);
    setAllVaccines([]);
    setAllMedLogs([]);
    setFamilyMembers([]);
    setSelectedPatientId(null);
    showToast('အသုံးပြုသူအားလုံးနှင့် ဆက်စပ်မှတ်တမ်းများကို ဖျက်သိမ်းပြီးပါပြီ', 'success');
  };

  const addBPRecord = async (data: Omit<BloodPressureRecord, 'id' | 'category' | 'createdAt'>) => {
    if (!currentUser) throw new Error('အကောင့်ဝင်ထားရန် လိုအပ်ပါသည်');

    const evalRes = calculateBPCategory(data.systolic, data.diastolic);
    const category = evalRes.category;
    const target = resolveTarget();

    const newRecord = {
      ...data,
      userId: target.uid,
      patientName: data.patientName || target.name,
      patientEmail: target.email,
      category,
      // v2.4.11 (k): keep the module's measurement condition (e.g. morning /
      // resting) — the old `condition: category` overwrote it with the BP
      // classification, so the တိုင်းတာချိန် column was always the category.
      condition: data.condition || category,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'vitals'), sanitizeForFirestore(newRecord));
    setAllBP(prev => prependUnique(prev, { ...newRecord, id: docRef.id }));
  };

  // v2.4.13: edit an already-saved BP record (e.g. add the time to an old
  // date-only record, or correct a reading). Mirrors updateVaccineRecord:
  // optimistic local update first, setDoc merge, deleteField() for any key
  // passed as `undefined` so a field can be cleared, rollback on failure.
  const updateBPRecord = async (id: string, updates: Partial<BloodPressureRecord>) => {
    const prev = allBP;
    // Keep the derived category in sync — an edit that changes the readings
    // must not leave the old classification on the record. The measurement
    // `condition` (e.g. morning/resting) is never touched here.
    const merged: Partial<BloodPressureRecord> = { ...updates };
    if (updates.systolic !== undefined || updates.diastolic !== undefined) {
      const current = prev.find(r => r.id === id);
      const sys = updates.systolic ?? current?.systolic;
      const dia = updates.diastolic ?? current?.diastolic;
      if (typeof sys === 'number' && typeof dia === 'number') {
        merged.category = calculateBPCategory(sys, dia).category;
      }
    }
    setAllBP(prev => prev.map(r => (r.id === id ? { ...r, ...merged } : r)));
    try {
      const payload: Record<string, any> = sanitizeForFirestore(merged);
      Object.keys(merged).forEach(k => {
        if ((merged as Record<string, any>)[k] === undefined) payload[k] = deleteField();
      });
      await setDoc(doc(db, 'vitals', id), payload, { merge: true });
    } catch (e) {
      setAllBP(prev);
      console.warn('Error updating blood pressure record in firestore:', e);
      showToast('သွေးပေါင်ချိန် မှတ်တမ်း ပြင်ဆင်ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  const deleteBPRecord = async (id: string) => {
    const prev = allBP;
    setAllBP(prev.filter(b => b.id !== id));
    try {
      await deleteDoc(doc(db, 'vitals', id));
    } catch (e) {
      setAllBP(restoreDeleted(prev, id));
      console.warn('Error deleting vital from firestore:', e);
      showToast('သွေးပေါင်ချိန် မှတ်တမ်း ဖျက်ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  const addGlucoseRecord = async (data: Omit<BloodSugarRecord, 'id' | 'status' | 'createdAt'>) => {
    if (!currentUser) throw new Error('အကောင့်ဝင်ထားရန် လိုအပ်ပါသည်');

    // No fabricated default: a missing/invalid glucose value is an error,
    // not 100 mg/dL. (The only caller, BloodSugarModule, always passes a
    // value from a required number input, so this never triggers in normal use.)
    const glucoseVal =
      (typeof data.glucoseValue === 'number' && Number.isFinite(data.glucoseValue) && data.glucoseValue > 0)
        ? data.glucoseValue
        : (typeof data.value === 'number' && Number.isFinite(data.value) && data.value > 0)
          ? data.value
          : NaN;
    if (!Number.isFinite(glucoseVal)) {
      throw new Error('သွေးချို တန်ဖိုး ထည့်ပေးပါ');
    }
    const timingVal = data.timing || data.type || 'fasting';
    const evalRes = calculateGlucoseStatus(glucoseVal, timingVal);
    const status = evalRes.status;
    const target = resolveTarget();

    const newRecord = {
      ...data,
      userId: target.uid,
      patientName: data.patientName || target.name,
      patientEmail: target.email,
      glucoseValue: glucoseVal,
      value: glucoseVal,
      timing: timingVal,
      type: timingVal,
      status,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'glucose'), sanitizeForFirestore(newRecord));
    setAllGlucose(prev => prependUnique(prev, { ...newRecord, id: docRef.id }));
  };

  // v2.4.13: edit an already-saved glucose record. Same pattern as
  // updateBPRecord — optimistic update, setDoc merge, deleteField() for
  // cleared fields, rollback on failure. Value/timing aliases stay in sync
  // the way addGlucoseRecord keeps them, and the status is recomputed when
  // the value or timing changes.
  const updateGlucoseRecord = async (id: string, updates: Partial<BloodSugarRecord>) => {
    const prev = allGlucose;
    const merged: Partial<BloodSugarRecord> = { ...updates };
    if (updates.value !== undefined || updates.glucoseValue !== undefined || updates.timing !== undefined || updates.type !== undefined) {
      const current = prev.find(r => r.id === id);
      const val = updates.glucoseValue ?? updates.value ?? current?.glucoseValue ?? current?.value;
      const timing = updates.timing ?? updates.type ?? current?.timing ?? current?.type ?? 'fasting';
      if (typeof val === 'number' && Number.isFinite(val) && val > 0) {
        merged.glucoseValue = val;
        merged.value = val;
        merged.timing = timing;
        merged.type = timing;
        merged.status = calculateGlucoseStatus(val, timing).status;
      }
    }
    setAllGlucose(prev => prev.map(r => (r.id === id ? { ...r, ...merged } : r)));
    try {
      const payload: Record<string, any> = sanitizeForFirestore(merged);
      Object.keys(merged).forEach(k => {
        if ((merged as Record<string, any>)[k] === undefined) payload[k] = deleteField();
      });
      await setDoc(doc(db, 'glucose', id), payload, { merge: true });
    } catch (e) {
      setAllGlucose(prev);
      console.warn('Error updating glucose record in firestore:', e);
      showToast('သွေးချို မှတ်တမ်း ပြင်ဆင်ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  const deleteGlucoseRecord = async (id: string) => {
    const prev = allGlucose;
    setAllGlucose(prev.filter(g => g.id !== id));
    try {
      await deleteDoc(doc(db, 'glucose', id));
    } catch (e) {
      setAllGlucose(restoreDeleted(prev, id));
      console.warn('Error deleting glucose from firestore:', e);
      showToast('ဆီးချို မှတ်တမ်း ဖျက်ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  const addLabRecord = async (data: Omit<LabTestRecord, 'id' | 'createdAt'>) => {
    if (!currentUser) throw new Error('အကောင့်ဝင်ထားရန် လိုအပ်ပါသည်');

    const target = resolveTarget();
    const newRecord = {
      ...data,
      userId: target.uid,
      patientName: (data as any).patientName || target.name,
      patientEmail: target.email,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'labTests'), sanitizeForFirestore(newRecord));
    setAllLabs(prev => prependUnique(prev, { ...newRecord, id: docRef.id }));
  };

  // v2.4.13: edit an already-saved lab record (e.g. correct a test value
  // or the test date/time). Same pattern as updateVaccineRecord — optimistic
  // update, setDoc merge, deleteField() for cleared fields, rollback on
  // failure. The tests[] array is replaced whole when passed.
  const updateLabRecord = async (id: string, updates: Partial<LabTestRecord>) => {
    const prev = allLabs;
    setAllLabs(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
    try {
      const payload: Record<string, any> = sanitizeForFirestore(updates);
      Object.keys(updates).forEach(k => {
        if ((updates as Record<string, any>)[k] === undefined) payload[k] = deleteField();
      });
      await setDoc(doc(db, 'labTests', id), payload, { merge: true });
    } catch (e) {
      setAllLabs(prev);
      console.warn('Error updating lab test record in firestore:', e);
      showToast('ဓာတ်ခွဲခန်း မှတ်တမ်း ပြင်ဆင်ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  const deleteLabRecord = async (id: string) => {
    const prev = allLabs;
    setAllLabs(prev.filter(l => l.id !== id));
    try {
      await deleteDoc(doc(db, 'labTests', id));
    } catch (e) {
      setAllLabs(restoreDeleted(prev, id));
      console.warn('Error deleting lab test from firestore:', e);
      showToast('ဓာတ်ခွဲခန်း မှတ်တမ်း ဖျက်ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  const addMedication = async (data: Omit<Medication, 'id' | 'createdAt'>) => {
    if (!currentUser) throw new Error('အကောင့်ဝင်ထားရန် လိုအပ်ပါသည်');

    const target = resolveTarget();
    const newMed = {
      ...data,
      userId: target.uid,
      patientName: (data as any).patientName || target.name,
      patientEmail: target.email,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'medications'), sanitizeForFirestore(newMed));
    setAllMeds(prev => prependUnique(prev, { ...newMed, id: docRef.id }));
  };

  const updateMedicationStatus = async (id: string, status: Medication['status']) => {
    const prev = allMeds;
    setAllMeds(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    try {
      await updateDoc(doc(db, 'medications', id), { status });
    } catch (e) {
      // v2.4.16 (B-H4): roll back the optimistic status change on failure.
      setAllMeds(prev);
      console.warn('Error updating medication in firestore:', e);
      showToast('ဆေးအခြေအနေ ပြင်ဆင်ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  // v2.4.13: edit an already-saved medication (dose, frequency, dates,
  // notes…). Same pattern as updateVaccineRecord — optimistic update,
  // setDoc merge, deleteField() for cleared fields, rollback on failure.
  // (updateMedicationStatus stays for status-only toggles.)
  const updateMedication = async (id: string, updates: Partial<Medication>) => {
    const prev = allMeds;
    setAllMeds(prev => prev.map(m => (m.id === id ? { ...m, ...updates } : m)));
    try {
      const payload: Record<string, any> = sanitizeForFirestore(updates);
      Object.keys(updates).forEach(k => {
        if ((updates as Record<string, any>)[k] === undefined) payload[k] = deleteField();
      });
      await setDoc(doc(db, 'medications', id), payload, { merge: true });
    } catch (e) {
      setAllMeds(prev);
      console.warn('Error updating medication in firestore:', e);
      showToast('ဆေးမှတ်တမ်း ပြင်ဆင်ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  const deleteMedication = async (id: string) => {
    const prev = allMeds;
    setAllMeds(prev.filter(m => m.id !== id));
    try {
      await deleteDoc(doc(db, 'medications', id));
    } catch (e) {
      setAllMeds(restoreDeleted(prev, id));
      console.warn('Error deleting medication from firestore:', e);
      showToast('ဆေးမှတ်တမ်း ဖျက်ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  const addVaccineRecord = async (data: Omit<VaccinationRecord, 'id' | 'createdAt'>) => {
    if (!currentUser) throw new Error('အကောင့်ဝင်ထားရန် လိုအပ်ပါသည်');

    const target = resolveTarget();
    const newRecord = {
      ...data,
      userId: target.uid,
      patientName: data.patientName || target.name,
      patientEmail: target.email,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'vaccines'), sanitizeForFirestore(newRecord));
    setAllVaccines(prev => prependUnique(prev, { ...newRecord, id: docRef.id }));
  };

  const updateVaccineRecord = async (id: string, updates: Partial<VaccinationRecord>) => {
    const prev = allVaccines;
    setAllVaccines(prev => prev.map(v => (v.id === id ? { ...v, ...updates } : v)));
    try {
      // v2.4.11 (F17): a field passed as `undefined` means "clear it" (e.g.
      // toggling a vaccine back to 'scheduled' clears dateAdministered).
      // sanitizeForFirestore strips undefined, so the old merge silently
      // kept the stale value in Firestore. Re-add those keys as
      // deleteField() AFTER sanitizing, so the clear actually lands.
      const payload: Record<string, any> = sanitizeForFirestore(updates);
      Object.keys(updates).forEach(k => {
        if ((updates as Record<string, any>)[k] === undefined) payload[k] = deleteField();
      });
      await setDoc(doc(db, 'vaccines', id), payload, { merge: true });
    } catch (e) {
      // v2.4.16 (B-H4): roll back the optimistic update — the old code left
      // the edited values on screen after a failed save.
      setAllVaccines(prev);
      console.warn('Error updating vaccine record in firestore:', e);
      showToast('ကာကွယ်ဆေး မှတ်တမ်း ပြင်ဆင်ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  const deleteVaccineRecord = async (id: string) => {
    const prev = allVaccines;
    setAllVaccines(prev.filter(v => v.id !== id));
    try {
      await deleteDoc(doc(db, 'vaccines', id));
    } catch (e) {
      setAllVaccines(restoreDeleted(prev, id));
      console.warn('Error deleting vaccine record from firestore:', e);
      showToast('ကာကွယ်ဆေး မှတ်တမ်း ဖျက်ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  const addDoctorAdvice = async (patientId: string, adviceText: string, diet?: string) => {
    if (!isAdmin) {
      throw new Error('စီမံခန့်ခွဲသူ/ဆရာဝန်သာလျှင် အကြံပြုချက် ပေးပို့နိုင်ပါသည်');
    }

    const targetPatient = patientsList.find(p => p.id === patientId);
    const newAdvice: DoctorAdvice & { patientEmail: string } = {
      id: 'adv-' + Date.now(),
      userId: patientId,
      patientName: targetPatient?.displayName || 'အသုံးပြုသူ',
      patientEmail: targetPatient?.email || '',
      // No invented fallback email: if the admin has no email on file,
      // the field stays empty (v2.4.11 — the old fallback was a made-up
      // address that could never receive anything).
      doctorEmail: profile?.email || currentUser?.email || '',
      doctorName: profile?.displayName || 'ဆရာဝန် (Admin)',
      advice: adviceText,
      dietRecommendation: diet,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'doctorAdvices'), sanitizeForFirestore(newAdvice));
    setAllAdvices(prev => prependUnique(prev, { ...newAdvice, id: docRef.id }));
  };

  const deleteDoctorAdvice = async (id: string) => {
    if (!isAdmin) {
      throw new Error('လုပ်ဆောင်ခွင့် မရှိပါ');
    }
    const prev = allAdvices;
    setAllAdvices(prev.filter(a => a.id !== id));
    try {
      await deleteDoc(doc(db, 'doctorAdvices', id));
    } catch (e) {
      setAllAdvices(restoreDeleted(prev, id));
      console.warn('Error deleting doctor advice from firestore:', e);
      showToast('ဆရာဝန် အကြံပြုချက် ဖျက်ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  const addBMIRecord = async (data: Omit<BMIRecord, 'id' | 'category' | 'bmi' | 'createdAt'> & { bmi?: number; category?: any }) => {
    if (!currentUser) throw new Error('အကောင့်ဝင်ထားရန် လိုအပ်ပါသည်');

    const bmiEval = calculateBMI(data.weightKg, data.heightCm);
    // No fabricated default: use a passed BMI value, else compute it from
    // weight + height; if neither is available, refuse instead of saving 22.
    // (The only caller, BMIModule, returns early without height/weight and
    // always passes a computed BMI, so this never triggers in normal use.)
    const bmiValue =
      (typeof data.bmi === 'number' && Number.isFinite(data.bmi) && data.bmi > 0)
        ? data.bmi
        : (bmiEval ? bmiEval.bmi : NaN);
    if (!Number.isFinite(bmiValue)) {
      throw new Error('BMI တွက်ရန် ကိုယ်အလေးချိန်/အရပ် လိုအပ်ပါသည်');
    }
    const category = data.category || (bmiEval ? bmiEval.category : 'normal');
    const target = resolveTarget();

    const newRecord = {
      ...data,
      userId: target.uid,
      userName: data.userName || target.name,
      patientEmail: target.email,
      bmi: bmiValue,
      category,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'bmi'), sanitizeForFirestore(newRecord));
    setAllBMI(prev => prependUnique(prev, { ...newRecord, id: docRef.id }));
  };

  // v2.4.13: edit an already-saved BMI record (e.g. correct the weight or
  // the date). Same pattern as updateBPRecord — optimistic update, setDoc
  // merge, deleteField() for cleared fields, rollback on failure. BMI and
  // category are recomputed when weight/height change (mirroring
  // addBMIRecord: an explicitly passed valid BMI wins, else compute).
  const updateBMIRecord = async (id: string, updates: Partial<BMIRecord>) => {
    const prev = allBMI;
    const merged: Partial<BMIRecord> = { ...updates };
    if (updates.weightKg !== undefined || updates.heightCm !== undefined) {
      const current = prev.find(r => r.id === id);
      const w = updates.weightKg ?? current?.weightKg;
      const h = updates.heightCm ?? current?.heightCm;
      if (typeof w === 'number' && typeof h === 'number' && w > 0 && h > 0) {
        const bmiEval = calculateBMI(w, h);
        if (bmiEval) {
          // Mirror addBMIRecord: an explicitly passed valid BMI wins, else compute.
          if (!(typeof updates.bmi === 'number' && Number.isFinite(updates.bmi) && updates.bmi > 0)) {
            merged.bmi = bmiEval.bmi;
          }
          if (updates.category === undefined) {
            merged.category = bmiEval.category;
          }
        }
      }
    }
    setAllBMI(prev => prev.map(r => (r.id === id ? { ...r, ...merged } : r)));
    try {
      const payload: Record<string, any> = sanitizeForFirestore(merged);
      Object.keys(merged).forEach(k => {
        if ((merged as Record<string, any>)[k] === undefined) payload[k] = deleteField();
      });
      await setDoc(doc(db, 'bmi', id), payload, { merge: true });
    } catch (e) {
      setAllBMI(prev);
      console.warn('Error updating BMI record in firestore:', e);
      showToast('BMI မှတ်တမ်း ပြင်ဆင်ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  const deleteBMIRecord = async (id: string) => {
    const prev = allBMI;
    setAllBMI(prev.filter(b => b.id !== id));
    try {
      await deleteDoc(doc(db, 'bmi', id));
    } catch (e) {
      setAllBMI(restoreDeleted(prev, id));
      console.warn('Error deleting BMI record from firestore:', e);
      showToast('BMI မှတ်တမ်း ဖျက်ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  // Doctor Q&A Actions
  const addDoctorQuestion = async (data: Omit<DoctorQuestion, 'id' | 'createdAt' | 'status'>) => {
    if (!currentUser) throw new Error('အကောင့်ဝင်ထားရန် လိုအပ်ပါသည်');

    const target = resolveTarget();
    const newQuestion = {
      ...data,
      userId: target.uid,
      patientName: data.patientName || target.name,
      patientEmail: target.email,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'doctorQuestions'), sanitizeForFirestore(newQuestion));
    setAllQuestions(prev => prependUnique(prev, { ...newQuestion, id: docRef.id }));
  };

  const answerDoctorQuestion = async (questionId: string, answer: DoctorAnswer) => {
    if (!isAdmin) {
      throw new Error('ဆရာဝန်/Admin သာလျှင် ဖြေကြားခွင့်ရှိပါသည်');
    }

    const prevQuestions = allQuestions;
    setAllQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          status: 'answered',
          doctorAnswer: answer,
          updatedAt: new Date().toISOString(),
        };
      }
      return q;
    }));

    try {
      await updateDoc(doc(db, 'doctorQuestions', questionId), sanitizeForFirestore({
        status: 'answered',
        doctorAnswer: answer,
        updatedAt: new Date().toISOString(),
      }));
    } catch (e) {
      // v2.4.16 (C-M6): roll back the optimistic answer on failure.
      setAllQuestions(prevQuestions);
      console.warn('Error updating doctor question in firestore:', e);
      showToast('မေးခွန်း အဖြေပေးပို့ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }

    // v2.4.10 (audit 10): notify the patient that their question was
    // answered. The answer was visible in the Q&A module but no notification
    // ever arrived, so the user never knew. This must be a Firestore doc —
    // localStorage notifications live only on the admin's own device and
    // can never reach the patient. A failure here must never break the
    // answer itself, so it is best-effort only.
    try {
      const q = allQuestions.find(x => x.id === questionId);
      if (q) {
        // v2.4.16 (F-M4): include a short excerpt of the ANSWER itself —
        // the old notification only repeated the question text, so the user
        // had to open the app to learn anything.
        const answerExcerpt = answer.answerText.length > 140
          ? `${answer.answerText.slice(0, 140)}…`
          : answer.answerText;
        await addDoc(collection(db, 'notifications'), sanitizeForFirestore({
          userId: q.userId,
          recipientEmail: q.patientEmail,
          type: 'qa_answered',
          title: '✅ ဆရာဝန်က သင့်မေးခွန်းကို ဖြေကြားပြီးပါပြီ',
          message: answerExcerpt,
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          read: false,
          priority: 'normal',
          data: { questionId, userId: q.userId },
        }));
      }
    } catch (e) {
      console.warn('Error sending answer notification:', e);
    }
  };

  const closeDoctorQuestion = async (questionId: string) => {
    if (!isAdmin) {
      throw new Error('ဆရာဝန်/Admin သာလျှင် မေးခွန်း ပိတ်သိမ်းခွင့်ရှိပါသည်');
    }
    const prev = allQuestions;
    setAllQuestions(prev => prev.map(q => q.id === questionId ? { ...q, status: 'closed' } : q));
    try {
      await updateDoc(doc(db, 'doctorQuestions', questionId), { status: 'closed' });
    } catch (e) {
      setAllQuestions(prev);
      console.warn('Error closing doctor question in firestore:', e);
      showToast('မေးခွန်း ပိတ်သိမ်းခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  const deleteDoctorQuestion = async (id: string) => {
    if (!isAdmin) {
      throw new Error('ဆရာဝန်/Admin သာလျှင် မေးခွန်း ဖျက်ခွင့်ရှိပါသည်');
    }
    const prev = allQuestions;
    setAllQuestions(prev.filter(q => q.id !== id));
    try {
      await deleteDoc(doc(db, 'doctorQuestions', id));
    } catch (e) {
      setAllQuestions(restoreDeleted(prev, id));
      console.warn('Error deleting doctor question from firestore:', e);
      showToast('မေးခွန်း ဖျက်ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  const addBroadcastTicker = async (message: string, type: 'info' | 'warning' | 'urgent' = 'info') => {
    if (!isAdmin) throw new Error('စီမံခန့်ခွဲသူသာလျှင် ထည့်သွင်းနိုင်ပါသည်');

    const newTicker = {
      message,
      isActive: true,
      type,
      createdAt: new Date().toISOString(),
      createdBy: profile?.displayName || 'Admin',
    };

    const docRef = await addDoc(collection(db, 'broadcastTickers'), sanitizeForFirestore(newTicker));
    setBroadcastTickers(prev => prependUnique(prev, { ...newTicker, id: docRef.id }));
  };

  const toggleBroadcastTicker = async (id: string, isActive: boolean) => {
    if (!isAdmin) throw new Error('စီမံခန့်ခွဲသူသာလျှင် ပြင်ဆင်နိုင်ပါသည်');

    const prev = broadcastTickers;
    setBroadcastTickers(prev => prev.map(t => t.id === id ? { ...t, isActive } : t));
    try {
      await updateDoc(doc(db, 'broadcastTickers', id), { isActive });
    } catch (e) {
      // v2.4.16 (C-M6): roll back the optimistic toggle on failure.
      setBroadcastTickers(prev);
      console.warn('Error updating broadcast ticker in firestore:', e);
      showToast('သတိပေးစာတန်း ပြင်ဆင်ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  const deleteBroadcastTicker = async (id: string) => {
    if (!isAdmin) throw new Error('စီမံခန့်ခွဲသူသာလျှင် ဖျက်ပစ်နိုင်ပါသည်');

    const prev = broadcastTickers;
    setBroadcastTickers(prev.filter(t => t.id !== id));
    try {
      await deleteDoc(doc(db, 'broadcastTickers', id));
    } catch (e) {
      setBroadcastTickers(restoreDeleted(prev, id));
      console.warn('Error deleting broadcast ticker from firestore:', e);
      showToast('သတိပေးစာတန်း ဖျက်ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  const addFamilyMember = async (member: Omit<FamilyMember, 'id'>) => {
    if (!currentUser) return;
    // A new family member belongs to the OWNER — the admin's selected patient
    // when one is selected, otherwise the signed-in user. Never to the
    // currently selected family member: members do not own members.
    const ownerUid = (isAdmin && selectedPatientId) ? selectedPatientId : currentUser.uid;
    const ownerEmail = (isAdmin && selectedPatientId)
      ? (selectedPatient?.email || '')
      : (profile?.email || currentUser.email || '');
    const newMember = {
      ...member,
      userId: ownerUid,
      patientEmail: ownerEmail,
      avatarColor: member.gender === 'female' ? 'bg-rose-600' : 'bg-emerald-600',
    };

    const docRef = await addDoc(collection(db, 'familyMembers'), sanitizeForFirestore(newMember));
    const created = { ...newMember, id: docRef.id };
    // v2.4.12 (B): the family-members listener may already have delivered
    // this doc — never append a second copy with the same id.
    setFamilyMembers(prev => prev.some(f => f.id === created.id) ? prev : [...prev, created]);
    setSelectedFamilyMemberId(created.id);
  };

  const deleteFamilyMember = async (id: string) => {
    const prev = familyMembers;
    const prevSelected = selectedFamilyMemberId;
    setFamilyMembers(prev.filter(f => f.id !== id));
    if (selectedFamilyMemberId === id) {
      // Back to viewing the user's own records — not another member.
      setSelectedFamilyMemberId('self');
    }
    try {
      await deleteDoc(doc(db, 'familyMembers', id));
      // v2.4.16 (D-C3): the member's health records must go with them —
      // the old code deleted only the member doc, leaving orphaned records
      // that the aggregator later re-discovered as a phantom patient.
      // No email is passed: member records carry the OWNER's email, and
      // deleting by it would wipe the owner's own records too.
      await deleteDocsForUserIds([id]);
    } catch (e) {
      setFamilyMembers(restoreDeleted(prev, id));
      setSelectedFamilyMemberId(prevSelected);
      console.warn('Error deleting family member from firestore:', e);
      showToast('မိသားစုဝင် မှတ်တမ်း ဖျက်ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  // Edit a family member's details (v2.4.16, D-M1) — previously the only
  // way to fix a wrong age / relationship / blood type was delete + re-add,
  // which orphaned all of their records under the old doc id.
  const updateFamilyMember = async (id: string, updates: Partial<FamilyMember>) => {
    if (!currentUser) throw new Error('အကောင့်ဝင်ထားရန် လိုအပ်ပါသည်');
    const prev = familyMembers;
    setFamilyMembers(prev => prev.map(f => (f.id === id ? { ...f, ...updates } : f)));
    try {
      await setDoc(doc(db, 'familyMembers', id), sanitizeForFirestore(updates), { merge: true });
      showToast('မိသားစုဝင် အချက်အလက် ပြင်ဆင်ပြီးပါပြီ', 'success');
    } catch (e) {
      setFamilyMembers(prev);
      console.warn('Error updating family member in firestore:', e);
      showToast('မိသားစုဝင် အချက်အလက် ပြင်ဆင်ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  // Returns true when the dose write actually reached Firestore, false
  // when it failed. Callers that confirm the dose to the user (e.g. the
  // notification "သောက်ပြီးပါပြီ" button) must check the return value —
  // the old version swallowed Firestore errors and always looked
  // successful, so a failed write was falsely shown as taken. The
  // optimistic UI update is rolled back on failure.
  const toggleMedicationDoseTaken = async (
    medicationId: string, 
    dateStr: string, 
    taken: boolean, 
    doseIndex: number = 0,
    medName?: string,
    // v2.4.16 (F-H5): the person the DOSE belongs to. The old code always
    // used resolveTarget() — the VIEWED person — so in family 'all' view a
    // member's evening dose was logged against the signed-in user, and in
    // admin+patient view against the admin. Callers that know the med's
    // owner (e.g. the reminder ticker) pass it explicitly.
    owner?: { uid: string; email: string }
  ): Promise<boolean> => {
    if (!currentUser) return false;
    const target = owner ?? resolveTarget();
    const existingLog = allMedLogs.find(l => l.medicationId === medicationId && l.date === dateStr && (l.doseIndex ?? 0) === doseIndex && l.userId === target.uid);

    if (existingLog) {
      const prevTaken = existingLog.taken;
      const prevTakenAt = existingLog.takenAt;
      setAllMedLogs(prev => prev.map(l => l.id === existingLog.id ? { ...l, taken, takenAt: taken ? new Date().toISOString() : undefined } : l));
      try {
        await updateDoc(doc(db, 'medicationLogs', existingLog.id), {
          taken,
          takenAt: taken ? new Date().toISOString() : null,
        });
        return true;
      } catch (err) {
        console.warn('Error updating med log:', err);
        setAllMedLogs(prev => prev.map(l => l.id === existingLog.id ? { ...l, taken: prevTaken, takenAt: prevTakenAt } : l));
        return false;
      }
    } else {
      const newLog: Omit<MedicationLog, 'id'> & { patientEmail: string } = {
        userId: target.uid,
        patientEmail: target.email,
        medicationId,
        medicationName: medName || 'Medication',
        date: dateStr,
        doseIndex,
        taken,
        takenAt: taken ? new Date().toISOString() : undefined,
        createdAt: new Date().toISOString(),
      };
      try {
        const docRef = await addDoc(collection(db, 'medicationLogs'), sanitizeForFirestore(newLog));
        setAllMedLogs(prev => prependUnique(prev, { ...newLog, id: docRef.id }));
        return true;
      } catch (err) {
        console.warn('Error adding med log:', err);
        return false;
      }
    }
  };

  const medicationLogs = currentTargetUserId
    ? allMedLogs.filter(m => inVisibleScope(m.userId))
    : (isAdmin ? ownMedicationLogs : []);

  return (
    <HealthDataContext.Provider value={{
      bpRecords,
      glucoseRecords,
      labRecords,
      medications,
      vaccineRecords,
      medicationLogs,
      toggleMedicationDoseTaken,
      doctorAdvices,
      patientsList,
      bmiRecords,
      latestBMI,
      doctorQuestions,
      allDoctorQuestions: allQuestions,
      allBPRecords: allBP,
      allGlucoseRecords: allGlucose,
      allBMIRecords: allBMI,
      ownBPRecords,
      ownGlucoseRecords,
      ownBMIRecords,
      ownLabRecords,
      ownMedications,
      ownVaccineRecords,
      ownMedicationLogs,
      isPooledView,
      allLabRecords: allLabs,
      allMedicationRecords: allMeds,
      allVaccineRecords: allVaccines,
      allMedicationLogs: allMedLogs,
      allDoctorAdvices: allAdvices,
      broadcastTickers,
      addBroadcastTicker,
      toggleBroadcastTicker,
      deleteBroadcastTicker,
      dbStats,
      dataLoading,
      refreshAdminData,
      repairPatientEmails,
      promoteToAdmin,
      revokeAdmin,
      familyMembers,
      selectedFamilyMemberId,
      setSelectedFamilyMemberId,
      selectedFamilyMember,
      addFamilyMember,
      updateFamilyMember,
      deleteFamilyMember,
      selectedPatientId,
      setSelectedPatientId,
      selectedPatient,
      addPatient,
      updatePatient,
      deletePatient,
      clearAllPatients,
      addBPRecord,
      updateBPRecord,
      deleteBPRecord,
      addGlucoseRecord,
      updateGlucoseRecord,
      deleteGlucoseRecord,
      addLabRecord,
      updateLabRecord,
      deleteLabRecord,
      addMedication,
      updateMedication,
      updateMedicationStatus,
      deleteMedication,
      addVaccineRecord,
      updateVaccineRecord,
      deleteVaccineRecord,
      addBMIRecord,
      updateBMIRecord,
      deleteBMIRecord,
      addDoctorAdvice,
      deleteDoctorAdvice,
      addDoctorQuestion,
      answerDoctorQuestion,
      deleteDoctorQuestion,
      closeDoctorQuestion,
    }}>
      {children}
    </HealthDataContext.Provider>
  );
};

export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  if (!context) throw new Error('useHealthData must be used within a HealthDataProvider');
  return context;
};
