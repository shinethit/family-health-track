import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  updatePassword as fbUpdatePassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types/health';
import { calculateAge, calculateBMI } from '../lib/medicalCalculations';
import { useToast } from './ToastContext';

// Helper to remove any undefined or null fields before Firestore operations
export const sanitizeForFirestore = <T extends Record<string, any>>(obj: T): Record<string, any> => {
  const clean: Record<string, any> = {};
  Object.keys(obj).forEach((k) => {
    if (obj[k] !== undefined && obj[k] !== null) {
      clean[k] = obj[k];
    }
  });
  return clean;
};

// Map Firebase Auth error codes to user-friendly Burmese messages
export const getAuthErrorMessage = (error: any): string => {
  const code = error?.code || '';
  switch (code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'အီးမေးလ် သို့မဟုတ် လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်။';
    case 'auth/user-not-found':
      return 'ဤအီးမေးလ်ဖြင့် အကောင့်ဖွင့်ထားခြင်း မရှိသေးပါ။';
    case 'auth/email-already-in-use':
      return 'ဤအီးမေးလ်ဖြင့် အကောင့်ဖွင့်ပြီးသား ဖြစ်နေပါသည်။ ကျေးဇူးပြု၍ Login ဝင်ပါ။';
    case 'auth/network-request-failed':
      return 'အင်တာနက်ချိတ်ဆက်မှု မရှိပါ သို့မဟုတ် ကွန်ရက်ချို့ယွင်းနေပါသည်။';
    case 'auth/too-many-requests':
      return 'အကြိမ်များစွာ ကြိုးစားမှုကြောင့် ခေတ္တပိတ်ထားပါသည်။ ခေတ္တစောင့်ဆိုင်းပြီးမှ ပြန်လည်ကြိုးစားပါ။';
    case 'auth/invalid-email':
      return 'အီးမေးလ် ပုံစံ မမှန်ကန်ပါ။ (ဥပမာ- user@example.com)';
    case 'auth/weak-password':
      return 'လျှို့ဝှက်နံပါတ်သည် အနည်းဆုံး ၆ လုံး ရှိရပါမည်။';
    case 'auth/unauthorized-domain':
      return 'ဤဝက်ဘ်ဆိုဒ်လိပ်စာကို Firebase မှ ခွင့်မပြုထားပါ။ Firebase Console > Authentication > Settings > Authorized domains တွင် သင့် App လိပ်စာ (localhost) ကို ထည့်သွင်းပေးပါ။';
    case 'auth/popup-closed-by-user':
      return 'Google ဖြင့် အကောင့်ဝင်ရောက်မှုကို ပယ်ဖျက်လိုက်ပါသည်။';
    default:
      return error?.message || 'အကောင့်စစ်ဆေးမှု မအောင်မြင်ပါ။ ကျေးဇူးပြု၍ ပြန်လည်ကြိုးစားပါ။';
  }
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
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const cached = localStorage.getItem('family_health_profile');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      console.warn('Failed to parse cached profile from localStorage:', err);
    }
    return null;
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Check admin status strictly by querying the /admins/{uid} collection in Firestore
  const verifyIsAdmin = async (uid: string): Promise<boolean> => {
    try {
      const adminSnap = await getDoc(doc(db, 'admins', uid));
      return adminSnap.exists();
    } catch (err) {
      console.warn('Admin status check failed:', err);
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;
    let unsubscribe = () => {};

    const initAuth = async () => {
      const isRedirectPending = sessionStorage.getItem('auth_redirect_pending');
      
      // 1. Resolve any pending redirects FIRST before doing anything else
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          console.log('Redirect login successful:', result.user.email);
        }
      } catch (error: any) {
        console.error('Redirect login error:', error);
        if (error.code === 'auth/unauthorized-domain') {
          showToast('ဤဝက်ဘ်ဆိုဒ်လိပ်စာကို Firebase မှ ခွင့်မပြုထားပါ။ Authorized domains တွင် ထည့်ပေးပါ။', 'error');
        }
      } finally {
        if (isRedirectPending) {
          sessionStorage.removeItem('auth_redirect_pending');
        }
      }

      if (!isMounted) return;

      // 2. After redirect handling is completely done, setup the auth listener
      unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (!isMounted) return;
        
        if (fbUser) {
          setCurrentUser(fbUser);
          console.log("=========================================");
          console.log("🔑 UID:", fbUser.uid, " | 📧 Email:", fbUser.email);
          console.log("=========================================");
          
          const isUserAdmin = await verifyIsAdmin(fbUser.uid);
          if (!isMounted) return;
          setIsAdmin(isUserAdmin);

          try {
            const userDocRef = doc(db, 'users', fbUser.uid);
            const userSnap = await getDoc(userDocRef);
            if (!isMounted) return;
            
            if (userSnap.exists()) {
              const data = userSnap.data() as UserProfile;
              const finalProfile: UserProfile = {
                ...data,
                id: fbUser.uid,
                email: fbUser.email || data.email || '',
                role: isUserAdmin ? 'admin' : (data.role === 'admin' ? 'patient' : (data.role || 'patient')),
                displayName: data.displayName || fbUser.displayName || fbUser.email?.split('@')[0] || 'အသုံးပြုသူ',
              };
              setProfile(finalProfile);
              localStorage.setItem('family_health_profile', JSON.stringify(finalProfile));
            } else {
              const newProfile: UserProfile = {
                id: fbUser.uid,
                email: fbUser.email || '',
                displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'အသုံးပြုသူ',
                role: isUserAdmin ? 'admin' : 'patient',
                createdAt: new Date().toISOString(),
              };
              setProfile(newProfile);
              localStorage.setItem('family_health_profile', JSON.stringify(newProfile));
              await setDoc(userDocRef, sanitizeForFirestore(newProfile), { merge: true });
            }
          } catch (e) {
            console.warn('Profile load error:', e);
            if (!isMounted) return;
            const fallbackProfile: UserProfile = {
              id: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'အသုံးပြုသူ',
              role: isUserAdmin ? 'admin' : 'patient',
              createdAt: new Date().toISOString(),
            };
            setProfile(fallbackProfile);
          }
          if (isMounted) setLoading(false);
        } else {
          // Only set to null if we are truly logged out.
          setCurrentUser(null);
          setProfile(null);
          setIsAdmin(false);
          if (isMounted) setLoading(false);
        }
      });
    };

    initAuth();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []); const loginWithGoogle = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Google Popup Sign-in failed:', err);
      
      if (
        err.code === 'auth/popup-blocked' || 
        err.code === 'auth/operation-not-supported-in-this-environment' ||
        err.code === 'auth/cancelled-popup-request'
      ) {
        try {
          console.log('Popup blocked or unsupported. Falling back to redirect...');
          sessionStorage.setItem('auth_redirect_pending', 'true');
          await signInWithRedirect(auth, provider);
          return; 
        } catch (redirectErr: any) {
          console.error('Google Redirect Sign-in failed:', redirectErr);
          sessionStorage.removeItem('auth_redirect_pending');
          setLoading(false);
          throw new Error(getAuthErrorMessage(redirectErr));
        }
      }
      setLoading(false);
      throw new Error(getAuthErrorMessage(err));
    }
  };

  const login = async (email: string, pass: string) => {
    setLoading(true);
    const cleanEmail = email.trim();

    try {
      // Authenticate strictly with Firebase Auth
      const res = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      if (res && res.user) {
        setCurrentUser(res.user);
        const isUserAdmin = await verifyIsAdmin(res.user.uid);
        setIsAdmin(isUserAdmin);

        // Fetch user document from Firestore
        let activeProf: UserProfile;
        try {
          const snap = await getDoc(doc(db, 'users', res.user.uid));
          if (snap.exists()) {
            const loaded = snap.data() as UserProfile;
            activeProf = {
              ...loaded,
              id: res.user.uid,
              email: res.user.email || cleanEmail,
              role: isUserAdmin ? 'admin' : (loaded.role === 'admin' ? 'patient' : (loaded.role || 'patient')),
              displayName: loaded.displayName || res.user.displayName || cleanEmail.split('@')[0] || 'အသုံးပြုသူ',
            };
          } else {
            activeProf = {
              id: res.user.uid,
              email: cleanEmail,
              displayName: res.user.displayName || cleanEmail.split('@')[0] || 'အသုံးပြုသူ',
              role: isUserAdmin ? 'admin' : 'patient',
              createdAt: new Date().toISOString(),
            };
            await setDoc(doc(db, 'users', res.user.uid), sanitizeForFirestore(activeProf), { merge: true });
          }
        } catch (err) {
          console.warn('Email sign-in user profile fetch error:', err);
          activeProf = {
            id: res.user.uid,
            email: cleanEmail,
            displayName: res.user.displayName || cleanEmail.split('@')[0] || 'အသုံးပြုသူ',
            role: isUserAdmin ? 'admin' : 'patient',
            createdAt: new Date().toISOString(),
          };
        }

        setProfile(activeProf);
        localStorage.setItem('family_health_profile', JSON.stringify(activeProf));
      }
    } catch (err: any) {
      console.error('Login error:', err);
      throw new Error(getAuthErrorMessage(err));
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

    try {
      // Create user strictly via Firebase Auth
      const res = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      if (!res || !res.user) {
        throw new Error('အကောင့်ဖွင့်ခြင်း မအောင်မြင်ပါ။');
      }

      setCurrentUser(res.user);
      const isUserAdmin = await verifyIsAdmin(res.user.uid);
      setIsAdmin(isUserAdmin);

      const calculatedAge = dob ? calculateAge(dob)?.years : undefined;
      const numH = heightCm ? Number(heightCm) : undefined;
      const numW = weightKg ? Number(weightKg) : undefined;
      const calculatedBMI = (numH && numW) ? calculateBMI(numW, numH)?.bmi : undefined;

      const newProf: UserProfile = {
        id: res.user.uid,
        email: cleanEmail,
        displayName: name.trim() || 'အသုံးပြုသူ',
        role: isUserAdmin ? 'admin' : 'patient',
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

      // Save to Firestore users collection
      await setDoc(doc(db, 'users', res.user.uid), sanitizeForFirestore(newProf), { merge: true });
    } catch (err: any) {
      console.error('Registration error:', err);
      throw new Error(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (err) {
      console.warn('SignOut error:', err);
    }
    setCurrentUser(null);
    setProfile(null);
    setIsAdmin(false);

    // Thoroughly remove all health_* and family_health_profile localStorage keys
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('health_') || key.startsWith('family_health_') || key.startsWith('fht_') || key.startsWith('physio_') || key.startsWith('special_care_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));

    const explicitKeys = [
      'family_health_profile',
      'health_demo_profile',
      'health_records_bp',
      'health_records_glucose',
      'health_records_labs',
      'health_records_meds',
      'health_records_advices',
      'health_records_bmi',
      'health_records_questions',
      'health_all_patients',
      'health_family_members',
      'health_broadcast_tickers',
      'health_meds_checked_today'
    ];
    explicitKeys.forEach(key => localStorage.removeItem(key));
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser || !profile) return;

    // Prevent client-side role elevation to admin
    const sanitizedData = { ...data };
    if (!isAdmin && 'role' in sanitizedData) {
      delete sanitizedData.role;
    }

    let computedAge = sanitizedData.age ?? profile.age;
    if (sanitizedData.dateOfBirth) {
      const ageRes = calculateAge(sanitizedData.dateOfBirth);
      if (ageRes) computedAge = ageRes.years;
    }

    const h = sanitizedData.heightCm ?? profile.heightCm;
    const w = sanitizedData.weightKg ?? profile.weightKg;
    let computedBMI = sanitizedData.bmi ?? profile.bmi;
    if (h && w) {
      const bmiRes = calculateBMI(w, h);
      if (bmiRes) computedBMI = bmiRes.bmi;
    }

    const updated: UserProfile = { 
      ...profile, 
      ...sanitizedData, 
      age: computedAge,
      bmi: computedBMI,
      updatedAt: new Date().toISOString() 
    };

    setProfile(updated);
    localStorage.setItem('family_health_profile', JSON.stringify(updated));

    try {
      await setDoc(doc(db, 'users', currentUser.uid), sanitizeForFirestore(updated), { merge: true });
      showToast('ပရိုဖိုင် အချက်အလက်များကို အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ', 'success');
    } catch (e) {
      console.warn('Update profile error:', e);
      showToast('ပရိုဖိုင် ပြင်ဆင်ရာတွင် ချို့ယွင်းချက် ဖြစ်ပေါ်ခဲ့ပါသည်', 'error');
      throw e;
    }
  };

  const changePassword = async (newPassword: string) => {
    if (!auth.currentUser) {
      throw new Error('အကောင့်ဝင်ထားခြင်း မရှိပါ။');
    }
    if (newPassword.length < 6) {
      throw new Error('လျှို့ဝှက်နံပါတ် အသစ်သည် အနည်းဆုံး ၆ လုံး ရှိရပါမည်။');
    }
    try {
      await fbUpdatePassword(auth.currentUser, newPassword);
    } catch (err: any) {
      throw new Error(getAuthErrorMessage(err));
    }
  };

  const resetPassword = async (email: string) => {
    if (!email || !email.trim()) {
      throw new Error('ကျေးဇူးပြု၍ သင့်အီးမေးလ်လိပ်စာကို ထည့်သွင်းပါ။');
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: any) {
      throw new Error(getAuthErrorMessage(err));
    }
  };

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
      resetPassword,
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
