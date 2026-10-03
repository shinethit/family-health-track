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
  getDocs 
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

// Helper to resolve clean display name for users
export const resolveCleanName = (name?: string, email?: string, phone?: string): string => {
  const trimmed = (name || '').trim();
  if (
    trimmed && 
    trimmed !== 'လူနာ' && 
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
export const aggregatePatientsFromRecords = (
  existingUsers: UserProfile[],
  vitals: BloodPressureRecord[] = [],
  glucoses: BloodSugarRecord[] = [],
  bmis: BMIRecord[] = [],
  labs: LabTestRecord[] = [],
  meds: Medication[] = [],
  questions: DoctorQuestion[] = [],
  advices: DoctorAdvice[] = []
): UserProfile[] => {
  const patientMap = new Map<string, UserProfile>();

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
    if (v.userId && !patientMap.has(v.userId)) {
      const discovered: UserProfile = {
        id: v.userId,
        displayName: resolveCleanName(v.userName || v.patientName, v.patientEmail),
        email: v.patientEmail || `${v.userId}@patient.local`,
        role: 'patient',
        chronicConditions: ['သွေးတိုး'],
        createdAt: v.recordedAt || v.createdAt || new Date().toISOString()
      };
      patientMap.set(v.userId, discovered);
    } else if (v.userId && patientMap.has(v.userId)) {
      const p = patientMap.get(v.userId)!;
      if ((!p.displayName || p.displayName === 'လူနာ' || p.displayName === 'အမည်မရှိ' || p.displayName === 'အသုံးပြုသူ') && (v.userName || v.patientName)) {
        p.displayName = resolveCleanName(v.userName || v.patientName, v.patientEmail || p.email);
      }
    }
  });

  // 3. Discover from Glucose
  glucoses.forEach(g => {
    if (g.userId && !patientMap.has(g.userId)) {
      const discovered: UserProfile = {
        id: g.userId,
        displayName: resolveCleanName(g.userName || g.patientName, (g as any).patientEmail),
        email: (g as any).patientEmail || `${g.userId}@patient.local`,
        role: 'patient',
        chronicConditions: ['ဆီးချို'],
        createdAt: g.recordedAt || g.createdAt || new Date().toISOString()
      };
      patientMap.set(g.userId, discovered);
    } else if (g.userId && patientMap.has(g.userId)) {
      const p = patientMap.get(g.userId)!;
      if ((!p.displayName || p.displayName === 'လူနာ' || p.displayName === 'အမည်မရှိ' || p.displayName === 'အသုံးပြုသူ') && (g.userName || g.patientName)) {
        p.displayName = resolveCleanName(g.userName || g.patientName, (g as any).patientEmail || p.email);
      }
    }
  });

  // 4. Discover from BMI Records
  bmis.forEach(b => {
    if (b.userId && !patientMap.has(b.userId)) {
      const discovered: UserProfile = {
        id: b.userId,
        displayName: resolveCleanName(b.userName, undefined),
        email: `${b.userId}@patient.local`,
        role: 'patient',
        heightCm: b.heightCm,
        weightKg: b.weightKg,
        waistCm: b.waistCm,
        createdAt: b.date || b.createdAt || new Date().toISOString()
      };
      patientMap.set(b.userId, discovered);
    } else if (b.userId && patientMap.has(b.userId)) {
      const p = patientMap.get(b.userId)!;
      if ((!p.displayName || p.displayName === 'လူနာ' || p.displayName === 'အမည်မရှိ' || p.displayName === 'အသုံးပြုသူ') && b.userName) {
        p.displayName = resolveCleanName(b.userName, p.email);
      }
      if (!p.heightCm && b.heightCm) p.heightCm = b.heightCm;
      if (!p.weightKg && b.weightKg) p.weightKg = b.weightKg;
      if (!p.waistCm && b.waistCm) p.waistCm = b.waistCm;
    }
  });

  // 5. Discover from Medications Records
  meds.forEach(m => {
    if (m.userId && !patientMap.has(m.userId)) {
      const discovered: UserProfile = {
        id: m.userId,
        displayName: resolveCleanName((m as any).userName || (m as any).patientName, (m as any).patientEmail),
        email: (m as any).patientEmail || `${m.userId}@patient.local`,
        role: 'patient',
        createdAt: m.startDate || (m as any).createdAt || new Date().toISOString()
      };
      patientMap.set(m.userId, discovered);
    } else if (m.userId && patientMap.has(m.userId)) {
      const p = patientMap.get(m.userId)!;
      if ((!p.displayName || p.displayName === 'လူနာ' || p.displayName === 'အမည်မရှိ' || p.displayName === 'အသုံးပြုသူ') && ((m as any).userName || (m as any).patientName)) {
        p.displayName = resolveCleanName((m as any).userName || (m as any).patientName, (m as any).patientEmail || p.email);
      }
    }
  });

  // 6. Discover from Doctor Questions
  questions.forEach(q => {
    if (q.userId && !patientMap.has(q.userId)) {
      const discovered: UserProfile = {
        id: q.userId,
        displayName: q.patientName || 'မေးမြန်းသူ လူနာ',
        email: q.patientEmail || `${q.userId}@patient.local`,
        role: 'patient',
        createdAt: q.createdAt || new Date().toISOString()
      };
      patientMap.set(q.userId, discovered);
    }
  });

  // 7. Discover from Advices
  advices.forEach(a => {
    if (a.userId && !patientMap.has(a.userId)) {
      const discovered: UserProfile = {
        id: a.userId,
        displayName: a.patientName || 'လူနာ',
        email: (a as any).patientEmail || `${a.userId}@patient.local`,
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
  broadcastTickers: BroadcastTicker[];
  dbStats: DatabaseStats;
  refreshAdminData: () => Promise<void>;

  // Broadcast Marquee Ticker Actions
  addBroadcastTicker: (message: string, type?: 'info' | 'warning' | 'urgent') => Promise<void>;
  toggleBroadcastTicker: (id: string, isActive: boolean) => Promise<void>;
  deleteBroadcastTicker: (id: string) => Promise<void>;
  
  // Family Members Management
  familyMembers: FamilyMember[];
  selectedFamilyMemberId: string | null;
  setSelectedFamilyMemberId: (id: string | null) => void;
  selectedFamilyMember: FamilyMember | null;
  addFamilyMember: (member: Omit<FamilyMember, 'id'>) => Promise<void>;
  deleteFamilyMember: (id: string) => Promise<void>;

  // Medication Intake Logs & Adherence
  medicationLogs: MedicationLog[];
  toggleMedicationDoseTaken: (medicationId: string, dateStr: string, taken: boolean, doseIndex?: number, medName?: string) => Promise<void>;

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
  deleteBPRecord: (id: string) => Promise<void>;
  
  addGlucoseRecord: (data: Omit<BloodSugarRecord, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  deleteGlucoseRecord: (id: string) => Promise<void>;

  addLabRecord: (data: Omit<LabTestRecord, 'id' | 'createdAt'>) => Promise<void>;
  deleteLabRecord: (id: string) => Promise<void>;

  addMedication: (data: Omit<Medication, 'id' | 'createdAt'>) => Promise<void>;
  updateMedicationStatus: (id: string, status: Medication['status']) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;

  addVaccineRecord: (data: Omit<VaccinationRecord, 'id' | 'createdAt'>) => Promise<void>;
  updateVaccineRecord: (id: string, updates: Partial<VaccinationRecord>) => Promise<void>;
  deleteVaccineRecord: (id: string) => Promise<void>;

  addBMIRecord: (data: Omit<BMIRecord, 'id' | 'category' | 'bmi' | 'createdAt'> & { bmi?: number; category?: any }) => Promise<void>;
  deleteBMIRecord: (id: string) => Promise<void>;

  addDoctorAdvice: (patientId: string, adviceText: string, diet?: string) => Promise<void>;
  deleteDoctorAdvice: (id: string) => Promise<void>;

  addDoctorQuestion: (data: Omit<DoctorQuestion, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  answerDoctorQuestion: (questionId: string, answer: DoctorAnswer) => Promise<void>;
  deleteDoctorQuestion: (id: string) => Promise<void>;
  closeDoctorQuestion: (id: string) => Promise<void>;

  clearAllData: () => void;
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

  // Firestore Live Listeners attached strictly when authenticated
  useEffect(() => {
    if (!currentUser) {
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
          showToast('လူနာစာရင်း ရယူရာတွင် ချို့ယွင်းချက် ဖြစ်ပေါ်ခဲ့ပါသည်', 'warning');
        });
      }

      // 2. Vitals
      const vitalsQuery = isAdmin
        ? query(collection(db, 'vitals'))
        : query(collection(db, 'vitals'), where('userId', '==', currentUser.uid));
      unsubscribeVitals = onSnapshot(vitalsQuery, (snapshot) => {
        const items: BloodPressureRecord[] = [];
        snapshot.forEach(docSnap => {
          items.push({ ...(docSnap.data() as BloodPressureRecord), id: docSnap.id });
        });
        setAllBP(items);
      }, (e) => {
        console.warn('Vitals snapshot:', e);
        showToast('သွေးပေါင်ချိန် မှတ်တမ်းများ ချိတ်ဆက်ရယူရာတွင် ချို့ယွင်းချက် ရှိနေပါသည်', 'warning');
      });

      // 3. Glucose
      const gluQuery = isAdmin
        ? query(collection(db, 'glucose'))
        : query(collection(db, 'glucose'), where('userId', '==', currentUser.uid));
      unsubscribeGlu = onSnapshot(gluQuery, (snapshot) => {
        const items: BloodSugarRecord[] = [];
        snapshot.forEach(docSnap => {
          items.push({ ...(docSnap.data() as BloodSugarRecord), id: docSnap.id });
        });
        setAllGlucose(items);
      }, (e) => {
        console.warn('Glucose snapshot:', e);
        showToast('ဆီးချို မှတ်တမ်းများ ချိတ်ဆက်ရယူရာတွင် ချို့ယွင်းချက် ရှိနေပါသည်', 'warning');
      });

      // 4. BMI
      const bmiQuery = isAdmin
        ? query(collection(db, 'bmi'))
        : query(collection(db, 'bmi'), where('userId', '==', currentUser.uid));
      unsubscribeBMI = onSnapshot(bmiQuery, (snapshot) => {
        const items: BMIRecord[] = [];
        snapshot.forEach(docSnap => {
          items.push({ ...(docSnap.data() as BMIRecord), id: docSnap.id });
        });
        setAllBMI(items);
      }, (e) => {
        console.warn('BMI snapshot:', e);
        showToast('BMI မှတ်တမ်းများ ချိတ်ဆက်ရယူရာတွင် ချို့ယွင်းချက် ရှိနေပါသည်', 'warning');
      });

      // 5. Labs
      const labsQuery = isAdmin
        ? query(collection(db, 'labTests'))
        : query(collection(db, 'labTests'), where('userId', '==', currentUser.uid));
      unsubscribeLabs = onSnapshot(labsQuery, (snapshot) => {
        const items: LabTestRecord[] = [];
        snapshot.forEach(docSnap => {
          items.push({ ...(docSnap.data() as LabTestRecord), id: docSnap.id });
        });
        setAllLabs(items);
      }, (e) => {
        console.warn('Labs snapshot:', e);
        showToast('ဓာတ်ခွဲခန်း မှတ်တမ်းများ ချိတ်ဆက်ရယူရာတွင် ချို့ယွင်းချက် ရှိနေပါသည်', 'warning');
      });

      // 6. Meds
      const medsQuery = isAdmin
        ? query(collection(db, 'medications'))
        : query(collection(db, 'medications'), where('userId', '==', currentUser.uid));
      unsubscribeMeds = onSnapshot(medsQuery, (snapshot) => {
        const items: Medication[] = [];
        snapshot.forEach(docSnap => {
          items.push({ ...(docSnap.data() as Medication), id: docSnap.id });
        });
        setAllMeds(items);
      }, (e) => {
        console.warn('Meds snapshot:', e);
        showToast('ဆေးမှတ်တမ်းများ ချိတ်ဆက်ရယူရာတွင် ချို့ယွင်းချက် ရှိနေပါသည်', 'warning');
      });

      // 7. Doctor Questions
      const questionsQuery = isAdmin
        ? query(collection(db, 'doctorQuestions'))
        : query(collection(db, 'doctorQuestions'), where('userId', '==', currentUser.uid));
      unsubscribeQuestions = onSnapshot(questionsQuery, (snapshot) => {
        const items: DoctorQuestion[] = [];
        snapshot.forEach(docSnap => {
          items.push({ ...(docSnap.data() as DoctorQuestion), id: docSnap.id });
        });
        setAllQuestions(items);
      }, (e) => {
        console.warn('DoctorQuestions snapshot:', e);
        showToast('ဆရာဝန် မေးခွန်းများ ချိတ်ဆက်ရယူရာတွင် ချို့ယွင်းချက် ရှိနေပါသည်', 'warning');
      });

      // 8. Doctor Advices
      const advicesQuery = isAdmin
        ? query(collection(db, 'doctorAdvices'))
        : query(collection(db, 'doctorAdvices'), where('userId', '==', currentUser.uid));
      unsubscribeAdvices = onSnapshot(advicesQuery, (snapshot) => {
        const items: DoctorAdvice[] = [];
        snapshot.forEach(docSnap => {
          items.push({ ...(docSnap.data() as DoctorAdvice), id: docSnap.id });
        });
        setAllAdvices(items);
      }, (e) => {
        console.warn('DoctorAdvices snapshot:', e);
        showToast('ဆရာဝန် အကြံပြုချက်များ ချိတ်ဆက်ရယူရာတွင် ချို့ယွင်းချက် ရှိနေပါသည်', 'warning');
      });

      // 9. Family Members
      const famQuery = isAdmin
        ? query(collection(db, 'familyMembers'))
        : query(collection(db, 'familyMembers'), where('userId', '==', currentUser.uid));
      unsubscribeFam = onSnapshot(famQuery, (snapshot) => {
        const items: FamilyMember[] = [];
        snapshot.forEach(docSnap => {
          items.push({ ...(docSnap.data() as FamilyMember), id: docSnap.id });
        });
        setFamilyMembers(items);
        if (items.length > 0 && !selectedFamilyMemberId) {
          setSelectedFamilyMemberId(items[0].id);
        }
      }, (e) => {
        console.warn('FamilyMembers snapshot:', e);
        showToast('မိသားစုဝင် မှတ်တမ်းများ ချိတ်ဆက်ရယူရာတွင် ချို့ယွင်းချက် ရှိနေပါသည်', 'warning');
      });

      // 10. Medication Intake Logs
      const medLogsQuery = isAdmin
        ? query(collection(db, 'medicationLogs'))
        : query(collection(db, 'medicationLogs'), where('userId', '==', currentUser.uid));
      const unsubscribeMedLogs = onSnapshot(medLogsQuery, (snapshot) => {
        const items: MedicationLog[] = [];
        snapshot.forEach(docSnap => {
          items.push({ ...(docSnap.data() as MedicationLog), id: docSnap.id });
        });
        setAllMedLogs(items);
      }, (e) => {
        console.warn('MedicationLogs snapshot:', e);
        showToast('ဆေးသောက်ပြီး မှတ်တမ်းများ ချိတ်ဆက်ရယူရာတွင် ချို့ယွင်းချက် ရှိနေပါသည်', 'warning');
      });

      // 11. Vaccines
      const vacQuery = isAdmin
        ? query(collection(db, 'vaccines'))
        : query(collection(db, 'vaccines'), where('userId', '==', currentUser.uid));
      unsubscribeVaccines = onSnapshot(vacQuery, (snapshot) => {
        const items: VaccinationRecord[] = [];
        snapshot.forEach(docSnap => {
          items.push({ ...(docSnap.data() as VaccinationRecord), id: docSnap.id });
        });
        setAllVaccines(items);
      }, (e) => {
        console.warn('Vaccines snapshot:', e);
        showToast('ကာကွယ်ဆေး မှတ်တမ်းများ ချိတ်ဆက်ရယူရာတွင် ချို့ယွင်းချက် ရှိနေပါသည်', 'warning');
      });

      // 12. Broadcast Tickers
      unsubscribeTickers = onSnapshot(collection(db, 'broadcastTickers'), (snapshot) => {
        const items: BroadcastTicker[] = [];
        snapshot.forEach(docSnap => {
          items.push({ ...(docSnap.data() as BroadcastTicker), id: docSnap.id });
        });
        if (items.length > 0) {
          setBroadcastTickers(items);
        }
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
      const [uSnap, vSnap, gSnap, bSnap, lSnap, mSnap, qSnap, aSnap, vacSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'vitals')),
        getDocs(collection(db, 'glucose')),
        getDocs(collection(db, 'bmi')),
        getDocs(collection(db, 'labTests')),
        getDocs(collection(db, 'medications')),
        getDocs(collection(db, 'doctorQuestions')),
        getDocs(collection(db, 'doctorAdvices')),
        getDocs(collection(db, 'vaccines')),
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
      const combinedPatients = aggregatePatientsFromRecords(rawUsers, vList, gList, bList, lList, mList, qList, aList);
      setPatientsList(combinedPatients);

      setLastSyncTime(new Date().toLocaleTimeString('my-MM'));
    } catch (err) {
      console.warn('Admin refresh err:', err);
    }
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

  // Filtered views
  const bpRecords = currentTargetUserId 
    ? allBP.filter(b => b.userId === currentTargetUserId) 
    : (isAdmin ? allBP : []);

  const glucoseRecords = currentTargetUserId 
    ? allGlucose.filter(g => g.userId === currentTargetUserId) 
    : (isAdmin ? allGlucose : []);

  const labRecords = currentTargetUserId 
    ? allLabs.filter(l => l.userId === currentTargetUserId) 
    : (isAdmin ? allLabs : []);

  const medications = currentTargetUserId 
    ? allMeds.filter(m => m.userId === currentTargetUserId) 
    : (isAdmin ? allMeds : []);

  const vaccineRecords = currentTargetUserId
    ? allVaccines.filter(v => v.userId === currentTargetUserId)
    : (isAdmin ? allVaccines : []);

  const doctorAdvices = currentTargetUserId 
    ? allAdvices.filter(a => a.userId === currentTargetUserId) 
    : (isAdmin ? allAdvices : []);

  const bmiRecords = currentTargetUserId 
    ? allBMI.filter(b => b.userId === currentTargetUserId) 
    : (isAdmin ? allBMI : []);

  const doctorQuestions = currentTargetUserId
    ? allQuestions.filter(q => q.userId === currentTargetUserId)
    : (isAdmin ? allQuestions : allQuestions.filter(q => q.userId === currentUser?.uid));

  const latestBMI = bmiRecords.length > 0 
    ? [...bmiRecords].sort((a, b) => new Date(b.timestamp || b.date || b.createdAt || '').getTime() - new Date(a.timestamp || a.date || a.createdAt || '').getTime())[0] 
    : null;

  const selectedPatient = selectedPatientId 
    ? patientsList.find(p => p.id === selectedPatientId) || null 
    : null;

  // Actions
  const addPatient = async (patientData: Partial<UserProfile> & { displayName: string }): Promise<UserProfile> => {
    if (!isAdmin) {
      throw new Error('စီမံခန့်ခွဲသူသာလျှင် လူနာအသစ် ထည့်သွင်းနိုင်ပါသည်');
    }
    const newId = 'pat-' + Date.now();
    const newPatient: UserProfile = {
      id: newId,
      email: patientData.email || `${newId}@familyhealth.local`,
      displayName: patientData.displayName,
      role: 'patient',
      age: patientData.age || 45,
      gender: patientData.gender || 'male',
      chronicConditions: patientData.chronicConditions || ['သွေးတိုး'],
      heightCm: patientData.heightCm || 165,
      weightKg: patientData.weightKg || 65,
      bloodType: patientData.bloodType || 'O+',
      emergencyContact: patientData.emergencyContact || '09-12345678',
      createdAt: new Date().toISOString(),
    };

    setPatientsList(prev => [newPatient, ...prev]);
    setSelectedPatientId(newId);

    try {
      await setDoc(doc(db, 'users', newId), sanitizeForFirestore(newPatient));
      showToast('လူနာမှတ်တမ်း အသစ်ကို အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ', 'success');
    } catch (e) {
      console.warn('Error saving patient to firestore:', e);
      showToast('လူနာမှတ်တမ်း သိမ်းဆည်းခြင်း မအောင်မြင်ပါ', 'error');
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

    setPatientsList(prev => prev.map(p => (p.id === id ? { ...p, ...cleanUpdates } : p)));

    try {
      await setDoc(doc(db, 'users', id), sanitizeForFirestore(cleanUpdates), { merge: true });
      showToast('လူနာမှတ်တမ်းကို အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ', 'success');
    } catch (e) {
      console.warn('Error updating patient in firestore:', e);
      showToast('လူနာမှတ်တမ်း ပြင်ဆင်ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  const deletePatient = async (id: string, deleteAssociatedData: boolean = true) => {
    if (!isAdmin) {
      throw new Error('စီမံခန့်ခွဲသူသာလျှင် ဖျက်ပစ်နိုင်ပါသည်');
    }

    setPatientsList(prev => prev.filter(p => p.id !== id));
    if (selectedPatientId === id) {
      setSelectedPatientId(null);
    }

    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (e) {
      console.warn('Error deleting patient from firestore users collection:', e);
      showToast('လူနာပရိုဖိုင် ဖျက်ခြင်း မအောင်မြင်ပါ', 'error');
    }

    if (deleteAssociatedData) {
      try {
        await Promise.all(
          USER_DATA_COLLECTIONS.map(async (colName) => {
            try {
              const q = query(collection(db, colName), where('userId', '==', id));
              const snap = await getDocs(q);
              const deletes = snap.docs.map(d => deleteDoc(doc(db, colName, d.id)));
              await Promise.all(deletes);
            } catch (err) {
              console.warn(`Error deleting ${colName} for user ${id}:`, err);
            }
          })
        );
        showToast('လူနာမှတ်တမ်းနှင့် ဆက်စပ်အချက်အလက်များကို အောင်မြင်စွာ ဖျက်သိမ်းပြီးပါပြီ', 'success');
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
    setPatientsList([]);
    setAllBP([]);
    setAllGlucose([]);
    setAllLabs([]);
    setAllMeds([]);
    setAllAdvices([]);
    setAllBMI([]);
    setAllQuestions([]);
    setAllVaccines([]);
    setSelectedPatientId(null);

    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      usersSnap.forEach(async (docSnap) => {
        const data = docSnap.data() as UserProfile;
        if (data.role !== 'admin') {
          await deleteDoc(doc(db, 'users', docSnap.id));
        }
      });
    } catch (e) {
      console.warn('Firestore purge error:', e);
    }
  };

  const addBPRecord = async (data: Omit<BloodPressureRecord, 'id' | 'category' | 'createdAt'>) => {
    if (!currentUser) throw new Error('အကောင့်ဝင်ထားရန် လိုအပ်ပါသည်');

    const evalRes = calculateBPCategory(data.systolic, data.diastolic);
    const category = evalRes.category;
    const targetUid = (isAdmin && selectedPatientId) ? selectedPatientId : currentUser.uid;

    const newRecord = {
      ...data,
      userId: targetUid,
      patientName: data.patientName || profile?.displayName || 'လူနာ',
      patientEmail: (data as any).patientEmail || profile?.email || '',
      category,
      condition: category,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'vitals'), sanitizeForFirestore(newRecord));
    setAllBP(prev => [{ ...newRecord, id: docRef.id }, ...prev]);
  };

  const deleteBPRecord = async (id: string) => {
    setAllBP(prev => prev.filter(b => b.id !== id));
    try {
      await deleteDoc(doc(db, 'vitals', id));
    } catch (e) {
      console.warn('Error deleting vital from firestore:', e);
      showToast('သွေးပေါင်ချိန် မှတ်တမ်း ဖျက်ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  const addGlucoseRecord = async (data: Omit<BloodSugarRecord, 'id' | 'status' | 'createdAt'>) => {
    if (!currentUser) throw new Error('အကောင့်ဝင်ထားရန် လိုအပ်ပါသည်');

    const glucoseVal = data.glucoseValue || data.value || 100;
    const timingVal = data.timing || data.type || 'fasting';
    const evalRes = calculateGlucoseStatus(glucoseVal, timingVal);
    const status = evalRes.status;
    const targetUid = (isAdmin && selectedPatientId) ? selectedPatientId : currentUser.uid;

    const newRecord = {
      ...data,
      userId: targetUid,
      patientName: data.patientName || profile?.displayName || 'လူနာ',
      patientEmail: (data as any).patientEmail || profile?.email || '',
      glucoseValue: glucoseVal,
      value: glucoseVal,
      timing: timingVal,
      type: timingVal,
      status,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'glucose'), sanitizeForFirestore(newRecord));
    setAllGlucose(prev => [{ ...newRecord, id: docRef.id }, ...prev]);
  };

  const deleteGlucoseRecord = async (id: string) => {
    setAllGlucose(prev => prev.filter(g => g.id !== id));
    try {
      await deleteDoc(doc(db, 'glucose', id));
    } catch (e) {
      console.warn('Error deleting glucose from firestore:', e);
      showToast('ဆီးချို မှတ်တမ်း ဖျက်ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  const addLabRecord = async (data: Omit<LabTestRecord, 'id' | 'createdAt'>) => {
    if (!currentUser) throw new Error('အကောင့်ဝင်ထားရန် လိုအပ်ပါသည်');

    const targetUid = (isAdmin && selectedPatientId) ? selectedPatientId : currentUser.uid;
    const newRecord = {
      ...data,
      userId: targetUid,
      patientName: (data as any).patientName || profile?.displayName || 'လူနာ',
      patientEmail: (data as any).patientEmail || profile?.email || '',
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'labTests'), sanitizeForFirestore(newRecord));
    setAllLabs(prev => [{ ...newRecord, id: docRef.id }, ...prev]);
  };

  const deleteLabRecord = async (id: string) => {
    setAllLabs(prev => prev.filter(l => l.id !== id));
    try {
      await deleteDoc(doc(db, 'labTests', id));
    } catch (e) {
      console.warn('Error deleting lab test from firestore:', e);
      showToast('ဓာတ်ခွဲခန်း မှတ်တမ်း ဖျက်ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  const addMedication = async (data: Omit<Medication, 'id' | 'createdAt'>) => {
    if (!currentUser) throw new Error('အကောင့်ဝင်ထားရန် လိုအပ်ပါသည်');

    const targetUid = (isAdmin && selectedPatientId) ? selectedPatientId : currentUser.uid;
    const newMed = {
      ...data,
      userId: targetUid,
      patientName: (data as any).patientName || profile?.displayName || 'လူနာ',
      patientEmail: (data as any).patientEmail || profile?.email || '',
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'medications'), sanitizeForFirestore(newMed));
    setAllMeds(prev => [{ ...newMed, id: docRef.id }, ...prev]);
  };

  const updateMedicationStatus = async (id: string, status: Medication['status']) => {
    setAllMeds(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    try {
      await updateDoc(doc(db, 'medications', id), { status });
    } catch (e) {
      console.warn('Error updating medication in firestore:', e);
      showToast('ဆေးအခြေအနေ ပြင်ဆင်ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  const deleteMedication = async (id: string) => {
    setAllMeds(prev => prev.filter(m => m.id !== id));
    try {
      await deleteDoc(doc(db, 'medications', id));
    } catch (e) {
      console.warn('Error deleting medication from firestore:', e);
      showToast('ဆေးမှတ်တမ်း ဖျက်ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  const addVaccineRecord = async (data: Omit<VaccinationRecord, 'id' | 'createdAt'>) => {
    if (!currentUser) throw new Error('အကောင့်ဝင်ထားရန် လိုအပ်ပါသည်');

    const targetUid = (isAdmin && selectedPatientId) ? selectedPatientId : currentUser.uid;
    const newRecord = {
      ...data,
      userId: targetUid,
      patientName: data.patientName || selectedPatient?.displayName || profile?.displayName || 'လူနာ',
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'vaccines'), sanitizeForFirestore(newRecord));
    setAllVaccines(prev => [{ ...newRecord, id: docRef.id }, ...prev]);
  };

  const updateVaccineRecord = async (id: string, updates: Partial<VaccinationRecord>) => {
    setAllVaccines(prev => prev.map(v => (v.id === id ? { ...v, ...updates } : v)));
    try {
      await setDoc(doc(db, 'vaccines', id), sanitizeForFirestore(updates), { merge: true });
    } catch (e) {
      console.warn('Error updating vaccine record in firestore:', e);
      showToast('ကာကွယ်ဆေး မှတ်တမ်း ပြင်ဆင်ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  const deleteVaccineRecord = async (id: string) => {
    setAllVaccines(prev => prev.filter(v => v.id !== id));
    try {
      await deleteDoc(doc(db, 'vaccines', id));
    } catch (e) {
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
    const newAdvice: DoctorAdvice = {
      id: 'adv-' + Date.now(),
      userId: patientId,
      patientName: targetPatient?.displayName || 'လူနာ',
      doctorEmail: profile?.email || currentUser?.email || 'admin@healthtrack.com',
      doctorName: profile?.displayName || 'ဆရာဝန် (Admin)',
      advice: adviceText,
      dietRecommendation: diet,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'doctorAdvices'), sanitizeForFirestore(newAdvice));
    setAllAdvices(prev => [{ ...newAdvice, id: docRef.id }, ...prev]);
  };

  const deleteDoctorAdvice = async (id: string) => {
    if (!isAdmin) {
      throw new Error('လုပ်ဆောင်ခွင့် မရှိပါ');
    }
    setAllAdvices(prev => prev.filter(a => a.id !== id));
    try {
      await deleteDoc(doc(db, 'doctorAdvices', id));
    } catch (e) {
      console.warn('Error deleting doctor advice from firestore:', e);
      showToast('ဆရာဝန် အကြံပြုချက် ဖျက်ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  const addBMIRecord = async (data: Omit<BMIRecord, 'id' | 'category' | 'bmi' | 'createdAt'> & { bmi?: number; category?: any }) => {
    if (!currentUser) throw new Error('အကောင့်ဝင်ထားရန် လိုအပ်ပါသည်');

    const bmiEval = calculateBMI(data.weightKg, data.heightCm);
    const bmiValue = data.bmi || (bmiEval ? bmiEval.bmi : 22);
    const category = data.category || (bmiEval ? bmiEval.category : 'normal');
    const targetUid = (isAdmin && selectedPatientId) ? selectedPatientId : currentUser.uid;

    const newRecord = {
      ...data,
      userId: targetUid,
      userName: data.userName || profile?.displayName || 'လူနာ',
      bmi: bmiValue,
      category,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'bmi'), sanitizeForFirestore(newRecord));
    setAllBMI(prev => [{ ...newRecord, id: docRef.id }, ...prev]);
  };

  const deleteBMIRecord = async (id: string) => {
    setAllBMI(prev => prev.filter(b => b.id !== id));
    try {
      await deleteDoc(doc(db, 'bmi', id));
    } catch (e) {
      console.warn('Error deleting BMI record from firestore:', e);
      showToast('BMI မှတ်တမ်း ဖျက်ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  // Doctor Q&A Actions
  const addDoctorQuestion = async (data: Omit<DoctorQuestion, 'id' | 'createdAt' | 'status'>) => {
    if (!currentUser) throw new Error('အကောင့်ဝင်ထားရန် လိုအပ်ပါသည်');

    const newQuestion = {
      ...data,
      userId: currentUser.uid,
      patientName: data.patientName || profile?.displayName || 'လူနာ',
      patientEmail: data.patientEmail || profile?.email || currentUser.email || '',
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'doctorQuestions'), sanitizeForFirestore(newQuestion));
    setAllQuestions(prev => [{ ...newQuestion, id: docRef.id }, ...prev]);
  };

  const answerDoctorQuestion = async (questionId: string, answer: DoctorAnswer) => {
    if (!isAdmin) {
      throw new Error('ဆရာဝန်/Admin သာလျှင် ဖြေကြားခွင့်ရှိပါသည်');
    }

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
      console.warn('Error updating doctor question in firestore:', e);
      showToast('မေးခွန်း အဖြေပေးပို့ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  const closeDoctorQuestion = async (questionId: string) => {
    setAllQuestions(prev => prev.map(q => q.id === questionId ? { ...q, status: 'closed' } : q));
    try {
      await updateDoc(doc(db, 'doctorQuestions', questionId), { status: 'closed' });
    } catch (e) {
      console.warn('Error closing doctor question in firestore:', e);
      showToast('မေးခွန်း ပိတ်သိမ်းခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  const deleteDoctorQuestion = async (id: string) => {
    setAllQuestions(prev => prev.filter(q => q.id !== id));
    try {
      await deleteDoc(doc(db, 'doctorQuestions', id));
    } catch (e) {
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
    setBroadcastTickers(prev => [{ ...newTicker, id: docRef.id }, ...prev]);
  };

  const toggleBroadcastTicker = async (id: string, isActive: boolean) => {
    if (!isAdmin) throw new Error('စီမံခန့်ခွဲသူသာလျှင် ပြင်ဆင်နိုင်ပါသည်');

    setBroadcastTickers(prev => prev.map(t => t.id === id ? { ...t, isActive } : t));
    try {
      await updateDoc(doc(db, 'broadcastTickers', id), { isActive });
    } catch (e) {
      console.warn('Error updating broadcast ticker in firestore:', e);
      showToast('သတိပေးစာတန်း ပြင်ဆင်ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  const deleteBroadcastTicker = async (id: string) => {
    if (!isAdmin) throw new Error('စီမံခန့်ခွဲသူသာလျှင် ဖျက်ပစ်နိုင်ပါသည်');

    setBroadcastTickers(prev => prev.filter(t => t.id !== id));
    try {
      await deleteDoc(doc(db, 'broadcastTickers', id));
    } catch (e) {
      console.warn('Error deleting broadcast ticker from firestore:', e);
      showToast('သတိပေးစာတန်း ဖျက်ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  const clearAllData = () => {
    setAllBP([]);
    setAllGlucose([]);
    setAllLabs([]);
    setAllMeds([]);
    setAllAdvices([]);
    setAllBMI([]);
    setAllQuestions([]);
    setFamilyMembers([]);
    setSelectedFamilyMemberId(null);
  };

  const selectedFamilyMember = familyMembers.find(f => f.id === selectedFamilyMemberId) || (familyMembers.length > 0 ? familyMembers[0] : null);

  const addFamilyMember = async (member: Omit<FamilyMember, 'id'>) => {
    if (!currentUser) return;
    const newMember = {
      ...member,
      userId: currentUser.uid,
      avatarColor: member.gender === 'female' ? 'bg-rose-600' : 'bg-emerald-600',
    };

    const docRef = await addDoc(collection(db, 'familyMembers'), sanitizeForFirestore(newMember));
    const created = { ...newMember, id: docRef.id };
    setFamilyMembers(prev => [...prev, created]);
    setSelectedFamilyMemberId(created.id);
  };

  const deleteFamilyMember = async (id: string) => {
    setFamilyMembers(prev => prev.filter(f => f.id !== id));
    if (selectedFamilyMemberId === id) {
      setSelectedFamilyMemberId(familyMembers[0]?.id || null);
    }
    try {
      await deleteDoc(doc(db, 'familyMembers', id));
    } catch (e) {
      console.warn('Error deleting family member from firestore:', e);
      showToast('မိသားစုဝင် မှတ်တမ်း ဖျက်ခြင်း မအောင်မြင်ပါ', 'error');
      throw e;
    }
  };

  const toggleMedicationDoseTaken = async (
    medicationId: string, 
    dateStr: string, 
    taken: boolean, 
    doseIndex: number = 0,
    medName?: string
  ) => {
    if (!currentUser) return;
    const targetUid = (isAdmin && selectedPatientId) ? selectedPatientId : currentUser.uid;
    const existingLog = allMedLogs.find(l => l.medicationId === medicationId && l.date === dateStr && (l.doseIndex ?? 0) === doseIndex && l.userId === targetUid);

    if (existingLog) {
      setAllMedLogs(prev => prev.map(l => l.id === existingLog.id ? { ...l, taken, takenAt: taken ? new Date().toISOString() : undefined } : l));
      try {
        await updateDoc(doc(db, 'medicationLogs', existingLog.id), {
          taken,
          takenAt: taken ? new Date().toISOString() : null,
        });
      } catch (err) {
        console.warn('Error updating med log:', err);
      }
    } else {
      const newLog: Omit<MedicationLog, 'id'> = {
        userId: targetUid,
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
        setAllMedLogs(prev => [{ ...newLog, id: docRef.id }, ...prev]);
      } catch (err) {
        console.warn('Error adding med log:', err);
      }
    }
  };

  const medicationLogs = currentTargetUserId
    ? allMedLogs.filter(m => m.userId === currentTargetUserId)
    : (isAdmin ? allMedLogs : []);

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
      broadcastTickers,
      addBroadcastTicker,
      toggleBroadcastTicker,
      deleteBroadcastTicker,
      dbStats,
      refreshAdminData,
      familyMembers,
      selectedFamilyMemberId,
      setSelectedFamilyMemberId,
      selectedFamilyMember,
      addFamilyMember,
      deleteFamilyMember,
      selectedPatientId,
      setSelectedPatientId,
      selectedPatient,
      addPatient,
      updatePatient,
      deletePatient,
      clearAllPatients,
      addBPRecord,
      deleteBPRecord,
      addGlucoseRecord,
      deleteGlucoseRecord,
      addLabRecord,
      deleteLabRecord,
      addMedication,
      updateMedicationStatus,
      deleteMedication,
      addVaccineRecord,
      updateVaccineRecord,
      deleteVaccineRecord,
      addBMIRecord,
      deleteBMIRecord,
      addDoctorAdvice,
      deleteDoctorAdvice,
      addDoctorQuestion,
      answerDoctorQuestion,
      deleteDoctorQuestion,
      closeDoctorQuestion,
      clearAllData,
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
