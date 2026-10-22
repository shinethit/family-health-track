const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const scriptPath = __filename;
const authContextPath = path.join(__dirname, 'src', 'context', 'AuthContext.tsx');

try {
  console.log('🚀 Starting iOS Redirect Persistence Fix...');

  if (fs.existsSync(authContextPath)) {
    let content = fs.readFileSync(authContextPath, 'utf8');

    // 1. Add imports for persistence
    if (!content.includes('setPersistence')) {
      content = content.replace(
        'signInWithRedirect,\n  getRedirectResult',
        'signInWithRedirect,\n  getRedirectResult,\n  setPersistence,\n  browserLocalPersistence'
      );
    }

    // 2. Update loginWithGoogle to set persistence and use redirect
    const startLoginIndex = content.indexOf('const loginWithGoogle = async () => {');
    const endLoginIndex = content.indexOf('const login = async (email: string, pass: string) => {');
    
    if (startLoginIndex !== -1 && endLoginIndex !== -1) {
      const newLoginWithGoogle = `const loginWithGoogle = async () => {
    setLoading(true);
    try {
      // Explicitly set persistence to survive iOS Safari redirect
      await setPersistence(auth, browserLocalPersistence);
      
      const provider = new GoogleAuthProvider();
      // Set a flag in session storage to know we are redirecting
      sessionStorage.setItem('auth_redirect_pending', 'true');
      
      await signInWithRedirect(auth, provider);
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      sessionStorage.removeItem('auth_redirect_pending');
      setLoading(false);
      throw new Error(getAuthErrorMessage(err));
    }
  };\n\n  `;
      content = content.substring(0, startLoginIndex) + newLoginWithGoogle + content.substring(endLoginIndex);
    }

    // 3. Update useEffect to handle redirect properly without flashing login screen
    const startUseEffect = content.indexOf('useEffect(() => {');
    const endUseEffect = content.indexOf('}, []);', startUseEffect) + 8; // length of '}, []);'

    if (startUseEffect !== -1 && endUseEffect !== -1) {
      const newUseEffect = `useEffect(() => {
      let isMounted = true;
      let unsubscribe = () => {};

      const initAuth = async () => {
        const isPending = sessionStorage.getItem('auth_redirect_pending');
        
        // 1. Handle redirect result FIRST before setting up listener
        try {
          const result = await getRedirectResult(auth);
          if (result && result.user) {
            console.log('Redirect login successful:', result.user.email);
          }
          if (isPending) {
            sessionStorage.removeItem('auth_redirect_pending');
          }
        } catch (error: any) {
          console.error('Redirect login error:', error);
          if (isPending) sessionStorage.removeItem('auth_redirect_pending');
          if (error.code === 'auth/unauthorized-domain') {
            showToast('ဤဝက်ဘ်ဆိုဒ်လိပ်စာကို Firebase မှ ခွင့်မပြုထားပါ။ Authorized domains တွင် ထည့်ပေးပါ။', 'error');
          }
        }

        // 2. Setup auth state listener AFTER handling redirect
        unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
          if (!isMounted) return;
          
          setLoading(true);
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
    console.log('✅ Updated AuthContext.tsx for iOS Safari Redirect handling');
  }

  // Build & Test
  console.log('🔨 Building and testing the app...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful! No errors.');

  // Git Push
  console.log('📤 Pushing changes to GitHub...');
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "fix(auth): ensure persistence and prevent login screen flash on iOS redirect"', { stdio: 'inherit' });
  execSync('git push', { stdio: 'inherit' });
  console.log('✅ Push successful!');

} catch (error) {
  console.error('❌ Process failed during build or push. Aborting to prevent errors.');
  console.error(error.message);
} finally {
  if (fs.existsSync(scriptPath)) {
    fs.unlinkSync(scriptPath);
    console.log('🧹 Cleaned up fix_ios_redirect_persistence.cjs');
  }
}