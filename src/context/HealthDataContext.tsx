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
import { useAuth, isTargetAdminEmail, sanitizeForFirestore } from './AuthContext';
import { 
  BloodPressureRecord, 
  BloodSugarRecord, 
  LabTestRecord, 
  Medication, 
  DoctorAdvice, 
  UserProfile,
  FamilyMember,
  BMIRecord,
  DoctorQuestion,
  DoctorAnswer
} from '../types/health';
import { calculateBPCategory, calculateGlucoseStatus, calculateBMI } from '../lib/medicalCalculations';

export const isPatientOnly = (p?: UserProfile | null): boolean => {
  if (!p) return false;
  if (p.role === 'admin') return false;
  if (isTargetAdminEmail(p.email)) return false;
  const name = (p.displayName || '').trim();
  const mail = (p.email || '').toLowerCase().trim();
  if (name === 'ရှိုင်းသစ်' || name.toLowerCase().includes('admin') || mail.includes('shinethit')) return false;
  if (p.id?.startsWith('admin-')) return false;
  return true;
};

// Clean Slate: No demo data pre-populated
export const INITIAL_FAMILY_MEMBERS: FamilyMember[] = [];
export const INITIAL_PATIENTS: UserProfile[] = [];

// Helper to sanitize any legacy cached demo records from previous sessions
const sanitizeDemoRecords = <T extends { id?: string; userId?: string }>(records: T[]): T[] => {
  if (!Array.isArray(records)) return [];
  return records.filter(item => {
    const id = String(item.id || '');
    const uid = String(item.userId || '');
    const anyItem = item as any;
    if (
      id.startsWith('bp-00') || 
      id.startsWith('glu-00') || 
      id.startsWith('lab-00') || 
      id.startsWith('med-00') || 
      id.startsWith('adv-00') || 
      id.startsWith('fam-00') || 
      id.startsWith('bmi-00') ||
      id.includes('demo') || 
      uid.includes('demo') ||
      anyItem.email?.includes('demo') ||
      anyItem.displayName?.includes('မောင်မောင်') ||
      anyItem.patientName?.includes('မောင်မောင်')
    ) {
      return false;
    }
    return true;
  });
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
  doctorAdvices: DoctorAdvice[];
  patientsList: UserProfile[];
  bmiRecords: BMIRecord[];
  latestBMI: BMIRecord | null;
  doctorQuestions: DoctorQuestion[];
  allDoctorQuestions: DoctorQuestion[];
  dbStats: DatabaseStats;
  refreshAdminData: () => Promise<void>;
  
  // Family Members Management
  familyMembers: FamilyMember[];
  selectedFamilyMemberId: string | null;
  setSelectedFamilyMemberId: (id: string | null) => void;
  selectedFamilyMember: FamilyMember | null;
  addFamilyMember: (member: Omit<FamilyMember, 'id'>) => void;
  deleteFamilyMember: (id: string) => void;

  // Selected Patient for Admin view
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
  selectedPatient: UserProfile | null;
  addPatient: (data: Partial<UserProfile> & { displayName: string }) => Promise<UserProfile>;
  deletePatient: (id: string) => Promise<void>;
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

  const [allBP, setAllBP] = useState<BloodPressureRecord[]>(() => {
    const saved = localStorage.getItem('health_records_bp');
    return saved ? sanitizeDemoRecords(JSON.parse(saved)) : [];
  });

  const [allGlucose, setAllGlucose] = useState<BloodSugarRecord[]>(() => {
    const saved = localStorage.getItem('health_records_glucose');
    return saved ? sanitizeDemoRecords(JSON.parse(saved)) : [];
  });

  const [allLabs, setAllLabs] = useState<LabTestRecord[]>(() => {
    const saved = localStorage.getItem('health_records_labs');
    return saved ? sanitizeDemoRecords(JSON.parse(saved)) : [];
  });

  const [allMeds, setAllMeds] = useState<Medication[]>(() => {
    const saved = localStorage.getItem('health_records_meds');
    return saved ? sanitizeDemoRecords(JSON.parse(saved)) : [];
  });

  const [allAdvices, setAllAdvices] = useState<DoctorAdvice[]>(() => {
    const saved = localStorage.getItem('health_records_advices');
    return saved ? sanitizeDemoRecords(JSON.parse(saved)) : [];
  });

  const [allBMI, setAllBMI] = useState<BMIRecord[]>(() => {
    const saved = localStorage.getItem('health_records_bmi');
    return saved ? sanitizeDemoRecords(JSON.parse(saved)) : [];
  });

  const [allQuestions, setAllQuestions] = useState<DoctorQuestion[]>(() => {
    const saved = localStorage.getItem('health_records_questions');
    return saved ? sanitizeDemoRecords(JSON.parse(saved)) : [];
  });

  const [patientsList, setPatientsList] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('health_all_patients');
    return saved ? sanitizeDemoRecords<UserProfile>(JSON.parse(saved)).filter(isPatientOnly) : [];
  });

  // Family Members Management
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
    const saved = localStorage.getItem('health_family_members');
    return saved ? sanitizeDemoRecords(JSON.parse(saved)) : [];
  });

  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState<string | null>(() => {
    const saved = localStorage.getItem('health_family_members');
    const parsed = saved ? sanitizeDemoRecords(JSON.parse(saved)) : [];
    return parsed.length > 0 && parsed[0]?.id ? String(parsed[0].id) : null;
  });

  // For Admin drill-down
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('health_family_members', JSON.stringify(familyMembers));
  }, [familyMembers]);
  useEffect(() => {
    localStorage.setItem('health_records_bp', JSON.stringify(allBP));
  }, [allBP]);
  useEffect(() => {
    localStorage.setItem('health_records_glucose', JSON.stringify(allGlucose));
  }, [allGlucose]);
  useEffect(() => {
    localStorage.setItem('health_records_labs', JSON.stringify(allLabs));
  }, [allLabs]);
  useEffect(() => {
    localStorage.setItem('health_records_meds', JSON.stringify(allMeds));
  }, [allMeds]);
  useEffect(() => {
    localStorage.setItem('health_records_advices', JSON.stringify(allAdvices));
  }, [allAdvices]);
  useEffect(() => {
    localStorage.setItem('health_records_bmi', JSON.stringify(allBMI));
  }, [allBMI]);
  useEffect(() => {
    localStorage.setItem('health_records_questions', JSON.stringify(allQuestions));
  }, [allQuestions]);
  useEffect(() => {
    localStorage.setItem('health_all_patients', JSON.stringify(patientsList.filter(isPatientOnly)));
  }, [patientsList]);

  // Keep patients list updated if current profile is a patient
  useEffect(() => {
    if (profile && profile.role === 'patient' && isPatientOnly(profile)) {
      setPatientsList(prev => {
        const filtered = prev.filter(isPatientOnly);
        const idx = filtered.findIndex(p => p.id === profile.id);
        if (idx >= 0) {
          const updated = [...filtered];
          updated[idx] = { ...updated[idx], ...profile };
          return updated;
        } else {
          return [profile, ...filtered];
        }
      });
    }
  }, [profile]);

  // Firestore Live Listeners when real Firebase user is authenticated
  useEffect(() => {
    if (!currentUser || !currentUser.uid) return;

    try {
      // 1. Users list for Admin
      let unsubscribeUsers = () => {};
      if (isAdmin) {
        const usersQuery = query(collection(db, 'users'));
        unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
          const list: UserProfile[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as UserProfile;
            const prof: UserProfile = { ...data, id: docSnap.id };
            if (isPatientOnly(prof)) {
              list.push(prof);
            }
          });
          setPatientsList(list);
        }, (err) => console.warn('Users listener:', err));
      }

      // 2. Vitals
      const vitalsQuery = isAdmin
        ? query(collection(db, 'vitals'))
        : query(collection(db, 'vitals'), where('userId', '==', currentUser.uid));
      const unsubscribeVitals = onSnapshot(vitalsQuery, (snapshot) => {
        const items: BloodPressureRecord[] = [];
        snapshot.forEach(docSnap => {
          items.push({ ...(docSnap.data() as BloodPressureRecord), id: docSnap.id });
        });
        if (items.length > 0 || !isAdmin) setAllBP(items);
      }, (e) => console.warn('Vitals snapshot:', e));

      // 3. Glucose
      const gluQuery = isAdmin
        ? query(collection(db, 'glucose'))
        : query(collection(db, 'glucose'), where('userId', '==', currentUser.uid));
      const unsubscribeGlu = onSnapshot(gluQuery, (snapshot) => {
        const items: BloodSugarRecord[] = [];
        snapshot.forEach(docSnap => {
          items.push({ ...(docSnap.data() as BloodSugarRecord), id: docSnap.id });
        });
        if (items.length > 0 || !isAdmin) setAllGlucose(items);
      }, (e) => console.warn('Glucose snapshot:', e));

      // 4. BMI
      const bmiQuery = isAdmin
        ? query(collection(db, 'bmi'))
        : query(collection(db, 'bmi'), where('userId', '==', currentUser.uid));
      const unsubscribeBMI = onSnapshot(bmiQuery, (snapshot) => {
        const items: BMIRecord[] = [];
        snapshot.forEach(docSnap => {
          items.push({ ...(docSnap.data() as BMIRecord), id: docSnap.id });
        });
        if (items.length > 0 || !isAdmin) setAllBMI(items);
      }, (e) => console.warn('BMI snapshot:', e));

      // 5. Labs
      const labsQuery = isAdmin
        ? query(collection(db, 'labTests'))
        : query(collection(db, 'labTests'), where('userId', '==', currentUser.uid));
      const unsubscribeLabs = onSnapshot(labsQuery, (snapshot) => {
        const items: LabTestRecord[] = [];
        snapshot.forEach(docSnap => {
          items.push({ ...(docSnap.data() as LabTestRecord), id: docSnap.id });
        });
        if (items.length > 0 || !isAdmin) setAllLabs(items);
      }, (e) => console.warn('Labs snapshot:', e));

      // 6. Meds
      const medsQuery = isAdmin
        ? query(collection(db, 'medications'))
        : query(collection(db, 'medications'), where('userId', '==', currentUser.uid));
      const unsubscribeMeds = onSnapshot(medsQuery, (snapshot) => {
        const items: Medication[] = [];
        snapshot.forEach(docSnap => {
          items.push({ ...(docSnap.data() as Medication), id: docSnap.id });
        });
        if (items.length > 0 || !isAdmin) setAllMeds(items);
      }, (e) => console.warn('Meds snapshot:', e));

      // 7. Doctor Questions
      const questionsQuery = isAdmin
        ? query(collection(db, 'doctorQuestions'))
        : query(collection(db, 'doctorQuestions'), where('userId', '==', currentUser.uid));
      const unsubscribeQuestions = onSnapshot(questionsQuery, (snapshot) => {
        const items: DoctorQuestion[] = [];
        snapshot.forEach(docSnap => {
          items.push({ ...(docSnap.data() as DoctorQuestion), id: docSnap.id });
        });
        setAllQuestions(items);
      }, (e) => console.warn('DoctorQuestions snapshot:', e));

      return () => {
        unsubscribeUsers();
        unsubscribeVitals();
        unsubscribeGlu();
        unsubscribeBMI();
        unsubscribeLabs();
        unsubscribeMeds();
        unsubscribeQuestions();
      };
    } catch (e) {
      console.warn('Firestore initialization warning:', e);
    }
  }, [currentUser, isAdmin]);

  const [lastSyncTime, setLastSyncTime] = useState<string>(() => new Date().toLocaleTimeString('my-MM'));

  const refreshAdminData = async () => {
    try {
      const [uSnap, vSnap, gSnap, bSnap, lSnap, mSnap, qSnap, aSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'vitals')),
        getDocs(collection(db, 'glucose')),
        getDocs(collection(db, 'bmi')),
        getDocs(collection(db, 'labTests')),
        getDocs(collection(db, 'medications')),
        getDocs(collection(db, 'doctorQuestions')),
        getDocs(collection(db, 'doctorAdvices')),
      ]);

      const uList: UserProfile[] = [];
      uSnap.forEach(d => {
        const prof = { ...(d.data() as UserProfile), id: d.id };
        if (isPatientOnly(prof)) uList.push(prof);
      });
      setPatientsList(uList);

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

      setLastSyncTime(new Date().toLocaleTimeString('my-MM'));
    } catch (err) {
      console.warn('Manual refresh err:', err);
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
  const totalDocuments = totalUsers + totalBP + totalGlucose + totalBMI + totalLabs + totalMeds + totalQuestions + totalAdvices;
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
    : (profile?.id || 'current-user');

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

  const doctorAdvices = currentTargetUserId 
    ? allAdvices.filter(a => a.userId === currentTargetUserId) 
    : (isAdmin ? allAdvices : []);

  const bmiRecords = currentTargetUserId 
    ? allBMI.filter(b => b.userId === currentTargetUserId) 
    : (isAdmin ? allBMI : []);

  const doctorQuestions = currentTargetUserId
    ? allQuestions.filter(q => q.userId === currentTargetUserId)
    : (isAdmin ? allQuestions : allQuestions.filter(q => q.userId === profile?.id));

  const latestBMI = bmiRecords.length > 0 
    ? [...bmiRecords].sort((a, b) => new Date(b.timestamp || b.date || b.createdAt || '').getTime() - new Date(a.timestamp || a.date || a.createdAt || '').getTime())[0] 
    : null;

  const selectedPatient = selectedPatientId 
    ? patientsList.find(p => p.id === selectedPatientId) || null 
    : null;

  // Actions
  const addPatient = async (patientData: Partial<UserProfile> & { displayName: string }): Promise<UserProfile> => {
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

    if (currentUser?.uid) {
      try {
        await setDoc(doc(db, 'users', newId), sanitizeForFirestore(newPatient));
      } catch (e) {
        console.warn('Error saving patient to firestore:', e);
      }
    }

    return newPatient;
  };

  const deletePatient = async (id: string) => {
    setPatientsList(prev => prev.filter(p => p.id !== id));
    setAllBP(prev => prev.filter(b => b.userId !== id));
    setAllGlucose(prev => prev.filter(g => g.userId !== id));
    setAllLabs(prev => prev.filter(l => l.userId !== id));
    setAllMeds(prev => prev.filter(m => m.userId !== id));
    setAllAdvices(prev => prev.filter(a => a.userId !== id));
    setAllBMI(prev => prev.filter(b => b.userId !== id));
    setAllQuestions(prev => prev.filter(q => q.userId !== id));
    if (selectedPatientId === id) {
      setSelectedPatientId(null);
    }
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch {}
  };

  const clearAllPatients = async () => {
    setPatientsList([]);
    localStorage.removeItem('health_all_patients');
    localStorage.removeItem('health_records_bp');
    localStorage.removeItem('health_records_glucose');
    localStorage.removeItem('health_records_labs');
    localStorage.removeItem('health_records_meds');
    localStorage.removeItem('health_records_advices');
    localStorage.removeItem('health_records_bmi');
    localStorage.removeItem('health_records_questions');
    setAllBP([]);
    setAllGlucose([]);
    setAllLabs([]);
    setAllMeds([]);
    setAllAdvices([]);
    setAllBMI([]);
    setAllQuestions([]);
    setSelectedPatientId(null);

    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      usersSnap.forEach(async (docSnap) => {
        const data = docSnap.data() as UserProfile;
        if (isPatientOnly({ ...data, id: docSnap.id })) {
          await deleteDoc(doc(db, 'users', docSnap.id));
        }
      });
    } catch (e) {
      console.warn('Firestore purge error:', e);
    }
  };

  const addBPRecord = async (data: Omit<BloodPressureRecord, 'id' | 'category' | 'createdAt'>) => {
    const evalRes = calculateBPCategory(data.systolic, data.diastolic);
    const category = evalRes.category;
    const newRecord: BloodPressureRecord = {
      ...data,
      id: 'bp-' + Date.now(),
      category,
      condition: category,
      createdAt: new Date().toISOString(),
    };

    setAllBP(prev => [newRecord, ...prev]);

    if (currentUser?.uid) {
      try {
        await addDoc(collection(db, 'vitals'), sanitizeForFirestore(newRecord));
      } catch (e) {
        console.warn('Error saving vital to firestore:', e);
      }
    }
  };

  const deleteBPRecord = async (id: string) => {
    setAllBP(prev => prev.filter(b => b.id !== id));
    if (currentUser?.uid) {
      try {
        await deleteDoc(doc(db, 'vitals', id));
      } catch (e) {
        console.warn('Error deleting vital from firestore:', e);
      }
    }
  };

  const addGlucoseRecord = async (data: Omit<BloodSugarRecord, 'id' | 'status' | 'createdAt'>) => {
    const glucoseVal = data.glucoseValue || data.value || 100;
    const timingVal = data.timing || data.type || 'fasting';
    const evalRes = calculateGlucoseStatus(glucoseVal, timingVal);
    const status = evalRes.status;
    const newRecord: BloodSugarRecord = {
      ...data,
      id: 'glu-' + Date.now(),
      glucoseValue: glucoseVal,
      value: glucoseVal,
      timing: timingVal,
      type: timingVal,
      status,
      createdAt: new Date().toISOString(),
    };

    setAllGlucose(prev => [newRecord, ...prev]);

    if (currentUser?.uid) {
      try {
        await addDoc(collection(db, 'glucose'), sanitizeForFirestore(newRecord));
      } catch (e) {
        console.warn('Error saving glucose to firestore:', e);
      }
    }
  };

  const deleteGlucoseRecord = async (id: string) => {
    setAllGlucose(prev => prev.filter(g => g.id !== id));
    if (currentUser?.uid) {
      try {
        await deleteDoc(doc(db, 'glucose', id));
      } catch (e) {
        console.warn('Error deleting glucose from firestore:', e);
      }
    }
  };

  const addLabRecord = async (data: Omit<LabTestRecord, 'id' | 'createdAt'>) => {
    const newRecord: LabTestRecord = {
      ...data,
      id: 'lab-' + Date.now(),
      createdAt: new Date().toISOString(),
    };

    setAllLabs(prev => [newRecord, ...prev]);

    if (currentUser?.uid) {
      try {
        await addDoc(collection(db, 'labTests'), sanitizeForFirestore(newRecord));
      } catch (e) {
        console.warn('Error saving lab test to firestore:', e);
      }
    }
  };

  const deleteLabRecord = async (id: string) => {
    setAllLabs(prev => prev.filter(l => l.id !== id));
    if (currentUser?.uid) {
      try {
        await deleteDoc(doc(db, 'labTests', id));
      } catch (e) {
        console.warn('Error deleting lab test from firestore:', e);
      }
    }
  };

  const addMedication = async (data: Omit<Medication, 'id' | 'createdAt'>) => {
    const newMed: Medication = {
      ...data,
      id: 'med-' + Date.now(),
      createdAt: new Date().toISOString(),
    };

    setAllMeds(prev => [newMed, ...prev]);

    if (currentUser?.uid) {
      try {
        await addDoc(collection(db, 'medications'), sanitizeForFirestore(newMed));
      } catch (e) {
        console.warn('Error saving medication to firestore:', e);
      }
    }
  };

  const updateMedicationStatus = async (id: string, status: Medication['status']) => {
    setAllMeds(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    if (currentUser?.uid) {
      try {
        await updateDoc(doc(db, 'medications', id), { status });
      } catch (e) {
        console.warn('Error updating medication in firestore:', e);
      }
    }
  };

  const deleteMedication = async (id: string) => {
    setAllMeds(prev => prev.filter(m => m.id !== id));
    if (currentUser?.uid) {
      try {
        await deleteDoc(doc(db, 'medications', id));
      } catch (e) {
        console.warn('Error deleting medication from firestore:', e);
      }
    }
  };

  const addDoctorAdvice = async (patientId: string, adviceText: string, diet?: string) => {
    const targetPatient = patientsList.find(p => p.id === patientId);
    const newAdvice: DoctorAdvice = {
      id: 'adv-' + Date.now(),
      userId: patientId,
      patientName: targetPatient?.displayName || 'လူနာ',
      doctorEmail: profile?.email || 'admin@healthtrack.com',
      doctorName: profile?.displayName || 'Admin (ရှိုင်းသစ်)',
      advice: adviceText,
      dietRecommendation: diet,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    setAllAdvices(prev => [newAdvice, ...prev]);

    if (currentUser?.uid) {
      try {
        await addDoc(collection(db, 'doctorAdvices'), sanitizeForFirestore(newAdvice));
      } catch (e) {
        console.warn('Error saving doctor advice to firestore:', e);
      }
    }
  };

  const deleteDoctorAdvice = async (id: string) => {
    setAllAdvices(prev => prev.filter(a => a.id !== id));
  };

  const addBMIRecord = async (data: Omit<BMIRecord, 'id' | 'category' | 'bmi' | 'createdAt'> & { bmi?: number; category?: any }) => {
    const bmiEval = calculateBMI(data.weightKg, data.heightCm);
    const bmiValue = data.bmi || (bmiEval ? bmiEval.bmi : 22);
    const category = data.category || (bmiEval ? bmiEval.category : 'normal');

    const newRecord: BMIRecord = {
      ...data,
      id: 'bmi-' + Date.now(),
      bmi: bmiValue,
      category,
      createdAt: new Date().toISOString(),
    };

    setAllBMI(prev => [newRecord, ...prev]);

    if (currentUser?.uid) {
      try {
        await addDoc(collection(db, 'bmi'), sanitizeForFirestore(newRecord));
      } catch (e) {
        console.warn('Error saving BMI record to firestore:', e);
      }
    }
  };

  const deleteBMIRecord = async (id: string) => {
    setAllBMI(prev => prev.filter(b => b.id !== id));
    if (currentUser?.uid) {
      try {
        await deleteDoc(doc(db, 'bmi', id));
      } catch (e) {
        console.warn('Error deleting BMI record from firestore:', e);
      }
    }
  };

  // Doctor Q&A Actions
  const addDoctorQuestion = async (data: Omit<DoctorQuestion, 'id' | 'createdAt' | 'status'>) => {
    const newQuestion: DoctorQuestion = {
      ...data,
      id: 'q-' + Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setAllQuestions(prev => [newQuestion, ...prev]);

    if (currentUser?.uid) {
      try {
        await addDoc(collection(db, 'doctorQuestions'), sanitizeForFirestore(newQuestion));
      } catch (e) {
        console.warn('Error saving doctor question to firestore:', e);
      }
    }
  };

  const answerDoctorQuestion = async (questionId: string, answer: DoctorAnswer) => {
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

    if (currentUser?.uid) {
      try {
        await updateDoc(doc(db, 'doctorQuestions', questionId), sanitizeForFirestore({
          status: 'answered',
          doctorAnswer: answer,
          updatedAt: new Date().toISOString(),
        }));
      } catch (e) {
        console.warn('Error updating doctor question in firestore:', e);
      }
    }
  };

  const closeDoctorQuestion = async (questionId: string) => {
    setAllQuestions(prev => prev.map(q => q.id === questionId ? { ...q, status: 'closed' } : q));
    if (currentUser?.uid) {
      try {
        await updateDoc(doc(db, 'doctorQuestions', questionId), { status: 'closed' });
      } catch (e) {
        console.warn('Error closing doctor question in firestore:', e);
      }
    }
  };

  const deleteDoctorQuestion = async (id: string) => {
    setAllQuestions(prev => prev.filter(q => q.id !== id));
    if (currentUser?.uid) {
      try {
        await deleteDoc(doc(db, 'doctorQuestions', id));
      } catch (e) {
        console.warn('Error deleting doctor question from firestore:', e);
      }
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
    localStorage.removeItem('health_records_bp');
    localStorage.removeItem('health_records_glucose');
    localStorage.removeItem('health_records_labs');
    localStorage.removeItem('health_records_meds');
    localStorage.removeItem('health_records_advices');
    localStorage.removeItem('health_records_bmi');
    localStorage.removeItem('health_records_questions');
    localStorage.removeItem('health_family_members');
  };

  const selectedFamilyMember = familyMembers.find(f => f.id === selectedFamilyMemberId) || (familyMembers.length > 0 ? familyMembers[0] : null);

  const addFamilyMember = (member: Omit<FamilyMember, 'id'>) => {
    const newMember: FamilyMember = {
      ...member,
      id: 'fam-' + Date.now(),
      avatarColor: member.gender === 'female' ? 'bg-rose-600' : 'bg-emerald-600',
    };
    setFamilyMembers(prev => [...prev, newMember]);
    setSelectedFamilyMemberId(newMember.id);
  };

  const deleteFamilyMember = (id: string) => {
    setFamilyMembers(prev => prev.filter(f => f.id !== id));
    if (selectedFamilyMemberId === id) {
      setSelectedFamilyMemberId(familyMembers[0]?.id || null);
    }
  };

  return (
    <HealthDataContext.Provider value={{
      bpRecords,
      glucoseRecords,
      labRecords,
      medications,
      doctorAdvices,
      patientsList,
      bmiRecords,
      latestBMI,
      doctorQuestions,
      allDoctorQuestions: allQuestions,
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
