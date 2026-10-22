const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const scriptPath = __filename;
const authContextPath = path.join(__dirname, 'src', 'context', 'AuthContext.tsx');
const appPath = path.join(__dirname, 'src', 'App.tsx');

try {
  console.log('🚀 Starting Final Auth Fix & Cleanup...');

  // 1. Fix AuthContext.tsx (Fix provider scope and fallback logic)
  if (fs.existsSync(authContextPath)) {
    let content = fs.readFileSync(authContextPath, 'utf8');
    
    const startLoginIndex = content.indexOf('const loginWithGoogle = async () => {');
    const endLoginIndex = content.indexOf('const login = async (email: string, pass: string) => {');
    
    if (startLoginIndex !== -1 && endLoginIndex !== -1) {
      const newLoginWithGoogle = `const loginWithGoogle = async () => {
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
  };\n\n  `;
      content = content.substring(0, startLoginIndex) + newLoginWithGoogle + content.substring(endLoginIndex);
      fs.writeFileSync(authContextPath, content, 'utf8');
      console.log('✅ Fixed provider scope issue in AuthContext.tsx');
    }
  }

  // 2. Remove dangerous auto-migration script from App.tsx
  if (fs.existsSync(appPath)) {
    let appContent = fs.readFileSync(appPath, 'utf8');
    
    // Remove the entire useEffect block for migration
    const migrationRegex = /\/\/ Automatically migrate old data to new UID in browser[\s\S]*?\}, \[isAdmin\]\);/g;
    if (migrationRegex.test(appContent)) {
      appContent = appContent.replace(migrationRegex, '');
      console.log('✅ Removed dangerous auto-migration script from App.tsx');
    }
    
    // Clean up unused imports if they exist (just to be safe)
    appContent = appContent.replace(/import \{ collection, query, getDocs, updateDoc, doc \} from 'firebase\/firestore';\n/g, '');
    
    fs.writeFileSync(appPath, appContent, 'utf8');
  }

  // 3. Build & Test
  console.log('🔨 Building and testing the app...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful! No errors.');

  // 4. Git Push
  console.log('📤 Pushing changes to GitHub...');
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "fix(auth): fix provider scope in redirect fallback and remove dangerous auto-migration"', { stdio: 'inherit' });
  execSync('git push', { stdio: 'inherit' });
  console.log('✅ Push successful!');

} catch (error) {
  console.error('❌ Process failed during build or push. Aborting to prevent errors.');
  console.error(error.message);
} finally {
  if (fs.existsSync(scriptPath)) {
    fs.unlinkSync(scriptPath);
    console.log('🧹 Cleaned up fix_final_auth_and_cleanup.cjs');
  }
}