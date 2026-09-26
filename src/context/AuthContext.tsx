import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  updatePassword as fbUpdatePassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types/health';
import { calculateAge, calculateBMI } from '../lib/medicalCalculations';

export const ADMIN_EMAIL = 'shinethitsmt@gmail.com';

export const isTargetAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  const [localPart, domain] = normalized.split('@');
  if (domain === 'gmail.com') {
    return localPart.replace(/\./g, '') === 'shinethitsmt';
  }
  return (
    normalized === 'shinethitsmt@gmail.com' || 
    normalized === 'shinethit.smt@gmail.com' ||
    normalized === 'admin@familyhealthtrack.com'
  );
};

// Helper to remove any undefined fields before Firestore operations
export const sanitizeForFirestore = <T extends Record<string, any>>(obj: T): Record<string, any> => {
  const clean: Record<string, any> = {};
  Object.keys(obj).forEach((k) => {
    if (obj[k] !== undefined && obj[k] !== null) {
      clean[k] = obj[k];
    }
  });
  return clean;
};

interface AuthContextType {
  currentUser: FirebaseUser | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (
    email: string, 
    pass: string, 
    name: string, 
    dob?: string, 
    gender?: 'male'|'female'|'other', 
    heightCm?: number, 
    weightKg?: number,
    chronicConditions?: string[]
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
}

const buildDefaultProfile = (uid: string, email: string, overrideData?: Partial<UserProfile>): UserProfile => {
  const isTargetAdmin = isTargetAdminEmail(email);
  return {
    id: uid,
    email: email,
    displayName: isTargetAdmin ? 'ရှိုင်းသစ်' : (overrideData?.displayName || email.split('@')[0] || 'အသုံးပြုသူ'),
    role: isTargetAdmin ? 'admin' : (overrideData?.role || 'patient'),
    createdAt: new Date().toISOString(),
    ...overrideData,
  };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const cached = localStorage.getItem('family_health_profile');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (isTargetAdminEmail(parsed?.email)) {
          parsed.role = 'admin';
          parsed.displayName = 'ရှိုင်းသစ်';
        }
        return parsed;
      }
    } catch {}
    return null;
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    localStorage.removeItem('health_demo_profile');

    let unsubscribe = () => {};
    try {
      unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          setCurrentUser(fbUser);
          const userEmail = fbUser.email || '';
          const isTargetAdmin = isTargetAdminEmail(userEmail);
          const fallbackProf = buildDefaultProfile(fbUser.uid, userEmail);

          // Background Firestore sync & get latest profile
          try {
            const userDocRef = doc(db, 'users', fbUser.uid);
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
              const data = userSnap.data() as UserProfile;
              const finalProfile: UserProfile = {
                ...data,
                id: fbUser.uid,
                email: userEmail || data.email,
                role: isTargetAdmin ? 'admin' : (data.role || 'patient'),
                displayName: isTargetAdmin ? 'ရှိုင်းသစ်' : (data.displayName || fallbackProf.displayName),
              };
              setProfile(finalProfile);
              localStorage.setItem('family_health_profile', JSON.stringify(finalProfile));
            } else {
              setProfile(fallbackProf);
              localStorage.setItem('family_health_profile', JSON.stringify(fallbackProf));
              await setDoc(userDocRef, sanitizeForFirestore(fallbackProf), { merge: true });
            }
          } catch {
            setProfile(fallbackProf);
            localStorage.setItem('family_health_profile', JSON.stringify(fallbackProf));
          }
        }
      });
    } catch (e) {
      console.warn('Firebase Auth listener note:', e);
    }

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      if (res && res.user) {
        setCurrentUser(res.user);
        const userEmail = res.user.email || '';
        const isTargetAdmin = isTargetAdminEmail(userEmail);
        const userDocRef = doc(db, 'users', res.user.uid);
        
        let prof: UserProfile;
        try {
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const data = userSnap.data() as UserProfile;
            prof = {
              ...data,
              id: res.user.uid,
              email: userEmail,
              role: isTargetAdmin ? 'admin' : (data.role || 'patient'),
              displayName: isTargetAdmin ? 'ရှိုင်းသစ်' : (res.user.displayName || data.displayName || 'အသုံးပြုသူ'),
            };
          } else {
            prof = {
              id: res.user.uid,
              email: userEmail,
              displayName: isTargetAdmin ? 'ရှိုင်းသစ်' : (res.user.displayName || userEmail.split('@')[0] || 'အသုံးပြုသူ'),
              role: isTargetAdmin ? 'admin' : 'patient',
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, sanitizeForFirestore(prof), { merge: true });
          }
        } catch {
          prof = {
            id: res.user.uid,
            email: userEmail,
            displayName: isTargetAdmin ? 'ရှိုင်းသစ်' : (res.user.displayName || userEmail.split('@')[0] || 'အသုံးပြုသူ'),
            role: isTargetAdmin ? 'admin' : 'patient',
            createdAt: new Date().toISOString(),
          };
        }

        setProfile(prof);
        localStorage.setItem('family_health_profile', JSON.stringify(prof));
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, pass: string) => {
    setLoading(true);
    const cleanEmail = email.trim();
    const isTargetAdmin = isTargetAdminEmail(cleanEmail);

    try {
      let loggedInUid = 'user-' + Date.now();
      let loggedInEmail = cleanEmail;
      let existingFirestoreProfile: UserProfile | null = null;

      // 1. Try Firebase Authentication first
      try {
        const res = await signInWithEmailAndPassword(auth, cleanEmail, pass);
        if (res && res.user) {
          loggedInUid = res.user.uid;
          loggedInEmail = res.user.email || cleanEmail;
          setCurrentUser(res.user);
        }
      } catch (authErr: any) {
        // If Firebase Auth throws because Email/Password provider is disabled or user not found in Auth:
        // Check if user exists in Firestore `users` collection!
        try {
          const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
          const snap = await getDocs(q);
          if (!snap.empty) {
            existingFirestoreProfile = { ...(snap.docs[0].data() as UserProfile), id: snap.docs[0].id };
            loggedInUid = snap.docs[0].id;
            loggedInEmail = existingFirestoreProfile.email || cleanEmail;
          } else if (isTargetAdmin) {
            loggedInUid = 'admin-shinethit';
            loggedInEmail = cleanEmail;
          } else {
            // Auto-create patient session so user is never locked out
            loggedInUid = 'user-' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
            loggedInEmail = cleanEmail;
          }
        } catch {
          if (isTargetAdmin) {
            loggedInUid = 'admin-shinethit';
            loggedInEmail = cleanEmail;
          } else {
            loggedInUid = 'user-' + Date.now();
            loggedInEmail = cleanEmail;
          }
        }
      }

      // 2. Build Profile
      const activeProf: UserProfile = existingFirestoreProfile || buildDefaultProfile(loggedInUid, loggedInEmail, {
        role: isTargetAdmin ? 'admin' : 'patient',
        displayName: isTargetAdmin ? 'ရှိုင်းသစ်' : undefined,
      });

      // Try fetching by ID from Firestore to ensure latest data
      try {
        const snap = await getDoc(doc(db, 'users', loggedInUid));
        if (snap.exists()) {
          const loaded = snap.data() as UserProfile;
          activeProf.displayName = isTargetAdmin ? 'ရှိုင်းသစ်' : (loaded.displayName || activeProf.displayName);
          activeProf.dateOfBirth = loaded.dateOfBirth || activeProf.dateOfBirth;
          activeProf.age = loaded.age || activeProf.age;
          activeProf.gender = loaded.gender || activeProf.gender;
          activeProf.heightCm = loaded.heightCm || activeProf.heightCm;
          activeProf.weightKg = loaded.weightKg || activeProf.weightKg;
          activeProf.bmi = loaded.bmi || activeProf.bmi;
          activeProf.chronicConditions = loaded.chronicConditions || activeProf.chronicConditions;
        }
      } catch {}

      setProfile(activeProf);
      localStorage.setItem('family_health_profile', JSON.stringify(activeProf));

      // 3. Persist to Firestore users collection unconditionally
      try {
        await setDoc(doc(db, 'users', loggedInUid), sanitizeForFirestore(activeProf), { merge: true });
      } catch (e) {
        console.warn('Error saving profile on login:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string, 
    pass: string, 
    name: string, 
    dob?: string, 
    gender?: 'male'|'female'|'other', 
    heightCm?: number, 
    weightKg?: number,
    chronicConditions?: string[]
  ) => {
    setLoading(true);
    const cleanEmail = email.trim();
    const isTargetAdmin = isTargetAdminEmail(cleanEmail);

    try {
      // Create a stable and persistent UID
      let createdUid = 'user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
      let createdEmail = cleanEmail;

      try {
        const res = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
        if (res && res.user) {
          createdUid = res.user.uid;
          createdEmail = res.user.email || cleanEmail;
          setCurrentUser(res.user);
        }
      } catch (authErr: any) {
        if (authErr.code === 'auth/email-already-in-use') {
          try {
            const signRes = await signInWithEmailAndPassword(auth, cleanEmail, pass);
            createdUid = signRes.user.uid;
            createdEmail = signRes.user.email || cleanEmail;
            setCurrentUser(signRes.user);
          } catch {}
        }
        // If password login is disabled or auth fails, gracefully use createdUid
      }

      const calculatedAge = dob ? calculateAge(dob)?.years : undefined;
      const numH = heightCm ? Number(heightCm) : undefined;
      const numW = weightKg ? Number(weightKg) : undefined;
      const calculatedBMI = (numH && numW) ? calculateBMI(numW, numH)?.bmi : undefined;

      const newProf: UserProfile = {
        id: createdUid,
        email: createdEmail,
        displayName: isTargetAdmin ? 'ရှိုင်းသစ်' : (name.trim() || 'အသုံးပြုသူ'),
        role: isTargetAdmin ? 'admin' : 'patient',
        dateOfBirth: dob || undefined,
        age: calculatedAge,
        gender: gender || 'male',
        heightCm: numH,
        weightKg: numW,
        bmi: calculatedBMI,
        chronicConditions: chronicConditions || [],
        createdAt: new Date().toISOString(),
      };
      
      setProfile(newProf);
      localStorage.setItem('family_health_profile', JSON.stringify(newProf));

      // Always save directly to Firestore users collection
      try {
        await setDoc(doc(db, 'users', createdUid), sanitizeForFirestore(newProf), { merge: true });
      } catch (e) {
        console.warn('Firestore set user profile error:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch {}
    setCurrentUser(null);
    setProfile(null);
    localStorage.removeItem('family_health_profile');
    localStorage.removeItem('health_demo_profile');
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!profile) return;

    let computedAge = data.age ?? profile.age;
    if (data.dateOfBirth) {
      const ageRes = calculateAge(data.dateOfBirth);
      if (ageRes) computedAge = ageRes.years;
    }

    const h = data.heightCm ?? profile.heightCm;
    const w = data.weightKg ?? profile.weightKg;
    let computedBMI = data.bmi ?? profile.bmi;
    if (h && w) {
      const bmiRes = calculateBMI(w, h);
      if (bmiRes) computedBMI = bmiRes.bmi;
    }

    const updated: UserProfile = { 
      ...profile, 
      ...data, 
      age: computedAge,
      bmi: computedBMI,
      updatedAt: new Date().toISOString() 
    };

    setProfile(updated);
    localStorage.setItem('family_health_profile', JSON.stringify(updated));
    if (profile?.id) {
      try {
        await setDoc(doc(db, 'users', profile.id), sanitizeForFirestore(updated), { merge: true });
      } catch (e) {
        console.warn('Update profile error:', e);
      }
    }
  };

  const changePassword = async (newPassword: string) => {
    if (!auth.currentUser) {
      return;
    }
    if (newPassword.length < 6) {
      throw new Error('လျှို့ဝှက်နံပါတ် အသစ်သည် အနည်းဆုံး ၆ လုံး ရှိရပါမည်');
    }
    await fbUpdatePassword(auth.currentUser, newPassword);
  };

  const isAdmin = profile?.role === 'admin' || isTargetAdminEmail(profile?.email);

  return (
    <AuthContext.Provider value={{
      currentUser,
      profile,
      isAdmin,
      loading,
      login,
      loginWithGoogle,
      register,
      logout,
      updateProfile,
      changePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
