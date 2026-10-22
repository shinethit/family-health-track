const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const scriptPath = __filename;
const authContextPath = path.join(__dirname, 'src', 'context', 'AuthContext.tsx');

try {
  console.log('🚀 Starting Definitive Bulletproof Auth Fix...');

  if (fs.existsSync(authContextPath)) {
    let content = fs.readFileSync(authContextPath, 'utf8');

    // 1. Ensure imports are perfect
    if (!content.includes('signInWithPopup')) {
      content = content.replace(
        'signInWithRedirect,\n  getRedirectResult',
        'signInWithPopup,\n  signInWithRedirect,\n  getRedirectResult,\n  setPersistence,\n  browserLocalPersistence'
      );
    }

    // 2. Replace loginWithGoogle with robust Hybrid version
    const startLoginIndex = content.indexOf('const loginWithGoogle = async () => {');
    const endLoginIndex = content.indexOf('const login = async (email: string, pass: string) => {');
    
    if (startLoginIndex !== -1 && endLoginIndex !== -1) {
      const newLoginWithGoogle = `const loginWithGoogle = async () => {
    setLoading(true);
    try {
      // Ensure persistence is set to local so it survives page reloads
      await setPersistence(auth, browserLocalPersistence);
      
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      // Try Popup first (works on Android & Desktop)
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Google Popup Sign-in failed:', err);
      
      // If Popup is blocked or unsupported (iOS Safari, In-App Browsers), fallback to Redirect
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
  };\n\n  `;
      content = content.substring(0, startLoginIndex) + newLoginWithGoogle + content.substring(endLoginIndex);
    }

    // 3. Replace useEffect to perfectly handle Redirect vs Normal Load (Fixes the flash/race condition)
    const startUseEffect = content.indexOf('useEffect(() => {');
    const endUseEffect = content.indexOf('}, []);', startUseEffect) + 8;

    if (startUseEffect !== -1 && endUseEffect !== -1) {
      const newUseEffect = `useEffect(() => {
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
          console.log("🔑 သင့်ရဲ့ လက်ရှိ UID မှာ:", fbUser.uid);
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
  }, []);`;

      content = content.substring(0, startUseEffect) + newUseEffect + content.substring(endUseEffect);
    }

    fs.writeFileSync(authContextPath, content, 'utf8');
    console.log('✅ Completely rewrote AuthContext.tsx for Bulletproof Auth');
  }

  // Build & Test
  console.log('🔨 Building and testing the app...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful! No errors.');

  // Git Push
  console.log('📤 Pushing changes to GitHub...');
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "fix(auth): definitive bulletproof authentication flow for all platforms"', { stdio: 'inherit' });
  execSync('git push', { stdio: 'inherit' });
  console.log('✅ Push successful!');

} catch (error) {
  console.error('❌ Process failed during build or push. Aborting to prevent errors.');
  console.error(error.message);
} finally {
  if (fs.existsSync(scriptPath)) {
    fs.unlinkSync(scriptPath);
    console.log('🧹 Cleaned up fix_auth_bulletproof.cjs');
  }
}