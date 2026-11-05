import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  updatePassword as fbUpdatePassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, runTransaction, deleteDoc, deleteField } from 'firebase/firestore';
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

// v2.4.16 (A-M6): the cached profile is keyed PER USER, never global — a
// shared phone must never show the previous user's profile to the next
// signed-in user, and a sign-out that is not a logout must not leave the
// cached profile behind. The legacy unsuffixed key is only ever READ at
// first paint (for users upgrading from an older build); every write uses
// the suffixed key, and sign-out / logout clear all of them.
const profileCacheKey = (uid?: string | null): string =>
  uid ? `family_health_profile_${uid}` : 'family_health_profile';
const clearProfileCache = (): void => {
  try {
    Object.keys(localStorage)
      .filter(k => k === 'family_health_profile' || k.startsWith('family_health_profile_'))
      .forEach(k => localStorage.removeItem(k));
  } catch {
    // ignore — cache clearing is best-effort
  }
};

// Map Firebase Auth error codes to user-friendly Burmese messages
export const getAuthErrorMessage = (error: any): string => {
  const code = error?.code || '';
  switch (code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      // Firebase returns 'auth/invalid-credential' for BOTH a wrong password
      // and an unregistered email, so this one message must cover both:
      // it tells an unregistered user where to sign up.
      return 'အီးမေးလ် သို့မဟုတ် လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်။ စကားဝှက် မှန်ကန်စွာ ရိုက်ထည့်ပါ (အကောင့်မရှိသေးပါက "အကောင့်သစ်ဖွင့်ရန်" တွင် ဖွင့်နိုင်ပါသည်)';
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
      // v2.4.16 (A-M3): never show a Firebase Console instruction to an
      // end user — they cannot fix a domain allow-list.
      return 'ဤဝက်ဘ်ဆိုဒ်မှ အကောင့်ဝင်ခြင်း ခွင့်မပြုထားပါ။ ကျေးဇူးပြု၍ နောက်မှ ပြန်လည်ကြိုးစားပါ။';
    case 'auth/invalid-action-code':
    case 'auth/expired-action-code':
      // Password-reset (or other action) link that is expired or already used.
      return 'ဤလင့်ခ် သက်တမ်းကုန်သွားပြီ သို့မဟုတ် အသုံးပြုပြီးသား ဖြစ်နေပါသည်။ စကားဝှက် ပြန်လည်ရယူရန် တောင်းဆိုမှုကို ထပ်မံ ပြုလုပ်ပါ။';
    default:
      // v2.4.16 (A-M3): an unmatched Firebase error code must never surface
      // its raw English text to the user. An error WITHOUT a Firebase code
      // is an app-thrown message (already Burmese) — keep it as-is.
      if (code.startsWith('auth/')) {
        return 'အကောင့်စစ်ဆေးမှု မအောင်မြင်ပါ။ ကျေးဇူးပြု၍ ပြန်လည်ကြိုးစားပါ။';
      }
      return error?.message || 'အကောင့်စစ်ဆေးမှု မအောင်မြင်ပါ။ ကျေးဇူးပြု၍ ပြန်လည်ကြိုးစားပါ။';
  }
};

// Re-throw an auth error keeping the Firebase error code attached, so
// callers (LoginScreen) can branch on err.code for specific messages.
// `new Error(message)` alone drops .code, which made every specific
// login / forgot-password message in LoginScreen dead code.
const throwAuthError = (err: any): never => {
  const e: any = new Error(getAuthErrorMessage(err));
  if (err?.code) e.code = err.code;
  throw e;
};

// Username (v2.4.12): login accepts an email OR a username. Usernames are
// 3–20 chars, letters / numbers / _ / ., stored lowercase, and unique —
// the `usernames` collection maps the lowercase username to { uid, email }
// so a signed-out user can resolve a username to its email before signing
// in (the /users docs themselves are owner/admin-only, so they cannot be
// used for the lookup).
// UserProfile lives in the shared types file (another agent's slice), so
// the optional username rides on this local alias instead.
export type ProfileWithUsername = UserProfile & { username?: string };

export const normalizeUsername = (raw: string): string => raw.trim().toLowerCase();

// Returns a Burmese error message when the username is invalid, else null.
export const validateUsername = (raw: string): string | null => {
  const u = normalizeUsername(raw);
  if (u.length < 3) return 'အသုံးပြုသူအမည်သည် အနည်းဆုံး ၃ လုံး ရှိရပါမည်။';
  if (u.length > 20) return 'အသုံးပြုသူအမည်သည် အများဆုံး အက္ခရာ ၂၀ အထိသာ ရပါမည်။';
  if (!/^[a-z0-9_.]+$/.test(u)) return 'အသုံးပြုသူအမည်တွင် အင်္ဂလိပ် စာလုံး၊ ဂဏန်း၊ _ နှင့် . သာ သုံးနိုင်ပါသည်။';
  return null;
};

interface AuthContextType {
  currentUser: FirebaseUser | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  // True while a login / register attempt is running. App uses it
  // to keep the login form visible during an attempt (inline spinner on
  // the button) instead of replacing the whole screen with a spinner.
  authAttempting: boolean;
  // identifier is an email OR a username (no '@' in it).
  login: (identifier: string, pass: string) => Promise<void>;
  register: (
    email: string, 
    pass: string, 
    name: string, 
    dob?: string, 
    gender?: 'male'|'female'|'other', 
    heightCm?: number, 
    weightKg?: number,
    chronicConditions?: string[],
    username?: string
  ) => Promise<void>;
  // Set (or change) the signed-in user's username. Existing users have
  // none yet — ProfileSetupModal wires an input to this.
  setUsername: (username: string) => Promise<void>;
  // Roll back a username reservation after a failed profile update, so the
  // usernames doc and the profile never diverge (v2.4.16, A-M5).
  restoreUsername: (oldUsername: string | undefined, newUsername: string) => Promise<void>;
  // Remove the signed-in user's username entirely (v2.4.16, A-L3).
  clearUsername: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>, options?: { silent?: boolean }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  // In-app password reset (reset link returns to the app itself, not the
  // Firebase hosted page): validate the oobCode, then set the new password.
  verifyResetCode: (oobCode: string) => Promise<string>;
  confirmResetPassword: (oobCode: string, newPassword: string) => Promise<void>;
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
  const [authAttempting, setAuthAttempting] = useState<boolean>(false);

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
      // Google sign-in was removed in v2.4.12 (it needed a VPN and kept
      // failing) — there is no redirect flow left to resolve here.
      // Set up the auth listener directly.
      unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (!isMounted) return;
        
        if (fbUser) {
          setCurrentUser(fbUser);
          
          const isUserAdmin = await verifyIsAdmin(fbUser.uid);
          if (!isMounted) return;
          setIsAdmin(isUserAdmin);

          try {
            const userDocRef = doc(db, 'users', fbUser.uid);
            const userSnap = await getDoc(userDocRef);
            if (!isMounted) return;
            
            if (userSnap.exists()) {
              const data = userSnap.data() as ProfileWithUsername;
              const finalProfile: UserProfile = {
                ...data,
                id: fbUser.uid,
                email: fbUser.email || data.email || '',
                role: isUserAdmin ? 'admin' : (data.role === 'admin' ? 'patient' : (data.role || 'patient')),
                displayName: data.displayName || fbUser.displayName || fbUser.email?.split('@')[0] || 'အသုံးပြုသူ',
              };
              setProfile(finalProfile);
              localStorage.setItem(profileCacheKey(fbUser.uid), JSON.stringify(finalProfile));
            } else {
              const newProfile: UserProfile = {
                id: fbUser.uid,
                email: fbUser.email || '',
                displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'အသုံးပြုသူ',
                role: isUserAdmin ? 'admin' : 'patient',
                createdAt: new Date().toISOString(),
              };
              setProfile(newProfile);
              localStorage.setItem(profileCacheKey(fbUser.uid), JSON.stringify(newProfile));
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
            localStorage.setItem(profileCacheKey(fbUser.uid), JSON.stringify(fallbackProfile));
          }
          if (isMounted) setLoading(false);
          if (isMounted) setAuthAttempting(false);
        } else {
          // Only set to null if we are truly logged out.
          setCurrentUser(null);
          setProfile(null);
          setIsAdmin(false);
          // v2.4.16 (A-M6): never leave a cached profile behind on sign-out
          // — the next user on this phone must not briefly see it.
          clearProfileCache();
          if (isMounted) setLoading(false);
          if (isMounted) setAuthAttempting(false);
        }
      });
    };

    initAuth();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // identifier is an email OR a username. A username (no '@') is resolved
  // to its email through the public `usernames` collection first — the
  // /users docs are owner/admin-only, so they cannot be read signed-out.
  const login = async (identifier: string, pass: string) => {
    setLoading(true);
    setAuthAttempting(true);
    const clean = identifier.trim();

    try {
      let cleanEmail = clean;
      if (!clean.includes('@')) {
        const nameDoc = await getDoc(doc(db, 'usernames', normalizeUsername(clean)));
        const resolvedEmail = (nameDoc.exists() ? (nameDoc.data() as { email?: string }).email : '') || '';
        if (!resolvedEmail) {
          // Deliberately vague about whether the name exists — and never
          // reveal whether an email is registered. This message is
          // identical to a wrong-password failure (A-M1).
          throw new Error('အီးမေးလ်/အသုံးပြုသူအမည် သို့မဟုတ် လျှို့ဝှက်နံပါတ် မှားနေပါသည်။');
        }
        cleanEmail = resolvedEmail;
      }

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
            const loaded = snap.data() as ProfileWithUsername;
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
        localStorage.setItem(profileCacheKey(res.user.uid), JSON.stringify(activeProf));
      }
    } catch (err: any) {
      console.error('Login error:', err);
      throwAuthError(err);
    } finally {
      setLoading(false);
      setAuthAttempting(false);
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
    chronicConditions?: string[],
    username?: string
  ) => {
    setLoading(true);
    setAuthAttempting(true);
    const cleanEmail = email.trim();

    // Validate the username and check availability BEFORE creating the
    // auth account, so a taken username never leaves a half-created
    // account behind. (The `usernames` docs are public-read, so this
    // check works while signed out.)
    const cleanUsername = username ? normalizeUsername(username) : '';
    if (username) {
      const usernameError = validateUsername(username);
      if (!cleanUsername || usernameError) {
        setLoading(false);
        setAuthAttempting(false);
        throw new Error(usernameError || 'အသုံးပြုသူအမည် မမှန်ကန်ပါ။');
      }
      let taken = false;
      try {
        const existing = await getDoc(doc(db, 'usernames', cleanUsername));
        taken = existing.exists();
      } catch {
        setLoading(false);
        setAuthAttempting(false);
        throw new Error('အင်တာနက်ချိတ်ဆက်မှု မရှိပါ သို့မဟုတ် ကွန်ရက်ချို့ယွင်းနေပါသည်။');
      }
      if (taken) {
        setLoading(false);
        setAuthAttempting(false);
        throw new Error('ဤအသုံးပြုသူအမည် သုံးပြီးသား ဖြစ်နေပါသည်။ တခြား အမည် ရွေးပါ။');
      }
    }

    try {
      // Create user strictly via Firebase Auth
      const res = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      if (!res || !res.user) {
        throw new Error('အကောင့်ဖွင့်ခြင်း မအောင်မြင်ပါ။');
      }

      setCurrentUser(res.user);
      const isUserAdmin = await verifyIsAdmin(res.user.uid);
      setIsAdmin(isUserAdmin);

      // Reserve the username atomically (a second registration racing
      // the pre-check above must not steal it). If this fails the auth
      // account already exists — the user can still log in with their
      // email and pick another username in their profile afterwards.
      if (cleanUsername) {
        try {
          await runTransaction(db, async (tx) => {
            const ref = doc(db, 'usernames', cleanUsername);
            const snap = await tx.get(ref);
            if (snap.exists()) {
              throw new Error('USERNAME_TAKEN');
            }
            tx.set(ref, { uid: res.user.uid, email: cleanEmail });
          });
        } catch (txErr: any) {
          // v2.4.16 (A-M4): the registration cannot complete without the
          // username reservation. Delete the just-created Auth account and
          // sign out, so the user is not left signed in behind a failure
          // message with a half-built account (no profile doc, no name).
          try { await deleteUser(res.user); } catch { /* best effort */ }
          try { await fbSignOut(auth); } catch { /* ignore */ }
          setCurrentUser(null);
          setProfile(null);
          setIsAdmin(false);
          if (txErr?.message === 'USERNAME_TAKEN') {
            throw new Error('ဤအသုံးပြုသူအမည် သုံးပြီးသား ဖြစ်နေပါသည်။ အကောင့်ဖွင့်ခြင်း မပြီးမြောက်ပါ — တခြား အမည် ရွေးပြီး ပြန်ဖွင့်ပါ။');
          }
          throw txErr;
        }
      }

      const calculatedAge = dob ? calculateAge(dob)?.years : undefined;
      const numH = heightCm ? Number(heightCm) : undefined;
      const numW = weightKg ? Number(weightKg) : undefined;
      const calculatedBMI = (numH && numW) ? calculateBMI(numW, numH)?.bmi : undefined;

      const newProf: ProfileWithUsername = {
        id: res.user.uid,
        email: cleanEmail,
        displayName: name.trim() || 'အသုံးပြုသူ',
        role: isUserAdmin ? 'admin' : 'patient',
        dateOfBirth: dob || undefined,
        age: calculatedAge,
        gender: gender || undefined,
        heightCm: numH,
        weightKg: numW,
        bmi: calculatedBMI,
        chronicConditions: chronicConditions || [],
        username: cleanUsername || undefined,
        createdAt: new Date().toISOString(),
      };
      
      setProfile(newProf);
      localStorage.setItem(profileCacheKey(res.user.uid), JSON.stringify(newProf));

      // Save to Firestore users collection
      await setDoc(doc(db, 'users', res.user.uid), sanitizeForFirestore(newProf), { merge: true });
    } catch (err: any) {
      console.error('Registration error:', err);
      throwAuthError(err);
    } finally {
      setLoading(false);
      setAuthAttempting(false);
    }
  };

  // Set (or change) the signed-in user's username — for existing users,
  // who signed up before usernames existed. Same validation and
  // uniqueness rules as register(). The old name (if any) is freed only
  // after the new one is reserved, inside one transaction.
  const setUsername = async (username: string): Promise<void> => {
    if (!currentUser || !profile) {
      throw new Error('အကောင့်ဝင်ထားရန် လိုအပ်ပါသည်');
    }
    const usernameError = validateUsername(username);
    const clean = normalizeUsername(username);
    if (!clean || usernameError) {
      throw new Error(usernameError || 'အသုံးပြုသူအမည် မမှန်ကန်ပါ။');
    }
    const oldUsername = (profile as ProfileWithUsername).username;
    if (oldUsername === clean) return;

    await runTransaction(db, async (tx) => {
      const ref = doc(db, 'usernames', clean);
      const snap = await tx.get(ref);
      if (snap.exists() && (snap.data() as { uid?: string }).uid !== currentUser.uid) {
        throw new Error('ဤအသုံးပြုသူအမည် သုံးပြီးသား ဖြစ်နေပါသည်။ တခြား အမည် ရွေးပါ။');
      }
      tx.set(ref, { uid: currentUser.uid, email: currentUser.email || profile.email });
      if (oldUsername) {
        tx.delete(doc(db, 'usernames', oldUsername));
      }
    });

    // Reservation succeeded — now claim the name on the profile. The
    // usernames doc is written first, so a failure here never leaves the
    // profile claiming a name it does not own.
    try {
      await updateProfile({ username: clean } as Partial<UserProfile>);
    } catch (e) {
      // v2.4.16 (A-M5): the profile update failed after the reservation —
      // roll the reservation back so the two never diverge.
      await restoreUsername(oldUsername, clean);
      throw e;
    }
  };

  // Roll back a username reservation: delete the new name's doc and
  // re-create the old one (v2.4.16, A-M5). Best-effort: a failure here is
  // logged, not thrown, so the original error is what the user sees.
  const restoreUsername = async (oldUsername: string | undefined, newUsername: string): Promise<void> => {
    if (!currentUser) return;
    try {
      await runTransaction(db, async (tx) => {
        tx.delete(doc(db, 'usernames', newUsername));
        if (oldUsername) {
          tx.set(doc(db, 'usernames', oldUsername), { uid: currentUser.uid, email: currentUser.email || profile?.email || '' });
        }
      });
    } catch (e) {
      console.warn('Failed to roll back username reservation:', e);
    }
  };

  // Remove the signed-in user's username entirely (v2.4.16, A-L3): free
  // the reserved name and clear it from the profile.
  const clearUsername = async (): Promise<void> => {
    if (!currentUser || !profile) return;
    const oldUsername = (profile as ProfileWithUsername).username;
    if (!oldUsername) return;
    await deleteDoc(doc(db, 'usernames', oldUsername));
    await updateProfile({ username: undefined } as Partial<UserProfile>);
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

    // Remove ONLY session/cache keys that are safe to lose — never wipe
    // user-data keys on logout. Dental/eye/hearing records (fht_*), physio
    // progress (physio_*), special-care checklists (special_care_*),
    // bookmarked articles, notifications/reminders
    // (family_health_notifications_* / family_health_custom_reminders_*) and
    // the last-seen version marker (myanmar_health_app_version) live ONLY in
    // localStorage — there is no cloud copy, so deleting them here would
    // destroy the user's data permanently. 'health_family_members' is also
    // kept: it is the one-time migration source that HealthDataContext
    // moves into Firestore itself (and removes) after it runs.
    // Only the keys below are removed: the cached profile (re-fetched from
    // Firestore on the next login) and legacy demo/cloud-cache keys that no
    // code in src/ reads any more. The profile cache is cleared per-user
    // (v2.4.16, A-M6) — see clearProfileCache above.
    clearProfileCache();
    const keysToRemove = [
      'health_demo_profile',
      'health_records_bp',
      'health_records_glucose',
      'health_records_labs',
      'health_records_meds',
      'health_records_advices',
      'health_records_bmi',
      'health_records_questions',
      'health_all_patients',
      'health_broadcast_tickers',
      'health_meds_checked_today',
    ];
    keysToRemove.forEach(key => localStorage.removeItem(key));
  };

  const updateProfile = async (data: Partial<UserProfile>, options?: { silent?: boolean }) => {
    if (!currentUser || !profile) return;

    // Prevent client-side role elevation to admin
    const sanitizedData = { ...data };
    if (!isAdmin && 'role' in sanitizedData) {
      delete sanitizedData.role;
    }

    // v2.4.16 (A-L2/A-L3): a field passed as explicit `undefined` means
    // "clear it" — remove it from the merged profile and delete it in
    // Firestore (sanitizeForFirestore would otherwise just drop the key
    // and the old value would survive forever).
    const clearedKeys = Object.keys(sanitizedData).filter(k => (sanitizedData as Record<string, unknown>)[k] === undefined);
    const heightCleared = clearedKeys.includes('heightCm');
    const weightCleared = clearedKeys.includes('weightKg');

    let computedAge = sanitizedData.age ?? profile.age;
    if (sanitizedData.dateOfBirth) {
      const ageRes = calculateAge(sanitizedData.dateOfBirth);
      if (ageRes) computedAge = ageRes.years;
    }

    const h = heightCleared ? undefined : (sanitizedData.heightCm ?? profile.heightCm);
    const w = weightCleared ? undefined : (sanitizedData.weightKg ?? profile.weightKg);
    let computedBMI = sanitizedData.bmi ?? profile.bmi;
    if (h && w) {
      const bmiRes = calculateBMI(w, h);
      if (bmiRes) computedBMI = bmiRes.bmi;
    } else if (heightCleared || weightCleared) {
      // One side of the BMI was cleared — the stored BMI is stale now.
      computedBMI = undefined;
      if (!clearedKeys.includes('bmi')) clearedKeys.push('bmi');
    }

    const updated: UserProfile = { 
      ...profile, 
      ...sanitizedData, 
      age: computedAge,
      bmi: computedBMI,
      updatedAt: new Date().toISOString() 
    };
    clearedKeys.forEach(k => { delete (updated as unknown as Record<string, unknown>)[k]; });

    setProfile(updated);
    localStorage.setItem(profileCacheKey(profile.id), JSON.stringify(updated));

    try {
      const payload = sanitizeForFirestore(updated);
      clearedKeys.forEach(k => { payload[k] = deleteField(); });
      await setDoc(doc(db, 'users', currentUser.uid), payload, { merge: true });
      // v2.4.11: silent refresh (e.g. Emergency ID save already toasts via
      // updatePatient) — without this the user saw two stacked success
      // toasts for one save. Errors still toast and throw.
      if (!options?.silent) {
        showToast('ပရိုဖိုင် အချက်အလက်များကို အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ', 'success');
      }
    } catch (e) {
      console.warn('Update profile error:', e);
      showToast('ပရိုဖိုင် ပြင်ဆင်ရာတွင် ချို့ယွင်းချက် ဖြစ်ပေါ်ခဲ့ပါသည်', 'error');
      throw e;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!auth.currentUser) {
      throw new Error('အကောင့်ဝင်ထားခြင်း မရှိပါ။');
    }
    if (!auth.currentUser.email) {
      throw new Error('ဤအကောင့်တွင် အီးမေးလ် မရှိပါ — စကားဝှက် ပြောင်းလဲ၍ မရပါ။');
    }
    if (newPassword.length < 6) {
      throw new Error('လျှို့ဝှက်နံပါတ် အသစ်သည် အနည်းဆုံး ၆ လုံး ရှိရပါမည်။');
    }
    try {
      // v2.4.16 (A-H2): prove the user knows the CURRENT password before
      // the password is changed — without this, anyone with an unlocked
      // phone could lock the real owner out of their own account.
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await fbUpdatePassword(auth.currentUser, newPassword);
    } catch (err: any) {
      throwAuthError(err);
    }
  };

  const resetPassword = async (email: string) => {
    if (!email || !email.trim()) {
      throw new Error('ကျေးဇူးပြု၍ သင့်အီးမေးလ်လိပ်စာကို ထည့်သွင်းပါ။');
    }
    try {
      // ActionCodeSettings with handleCodeInApp: the reset link returns to
      // this app itself (mode=resetPassword&oobCode=...), so the user sets
      // the new password in a Burmese in-app form instead of Firebase's
      // default English hosted handler page. The live origin must be in
      // Firebase Console > Authentication > Settings > Authorized domains.
      await sendPasswordResetEmail(auth, email.trim(), {
        url: 'https://family-health-track.pages.dev/',
        handleCodeInApp: true,
      });
    } catch (err: any) {
      throwAuthError(err);
    }
  };

  // Validate a password-reset oobCode from the email link and return the
  // account email it belongs to. Throws (invalid/expired action code) when
  // the link is stale or already used.
  const verifyResetCode = async (oobCode: string): Promise<string> => {
    try {
      return await verifyPasswordResetCode(auth, oobCode);
    } catch (err: any) {
      throwAuthError(err);
      throw err; // unreachable — throwAuthError always throws
    }
  };

  const confirmResetPassword = async (oobCode: string, newPassword: string) => {
    if (newPassword.length < 6) {
      throw new Error('လျှို့ဝှက်နံပါတ် အသစ်သည် အနည်းဆုံး ၆ လုံး ရှိရပါမည်။');
    }
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
    } catch (err: any) {
      throwAuthError(err);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      profile,
      isAdmin,
      loading,
      authAttempting,
      login,
      register,
      setUsername,
      restoreUsername,
      clearUsername,
      logout,
      updateProfile,
      changePassword,
      resetPassword,
      verifyResetCode,
      confirmResetPassword,
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
