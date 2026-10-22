const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const scriptPath = __filename;
const authContextPath = path.join(__dirname, 'src', 'context', 'AuthContext.tsx');

try {
  console.log('🚀 Starting iOS Google Login Fix (Popup to Redirect)...');

  if (fs.existsSync(authContextPath)) {
    let content = fs.readFileSync(authContextPath, 'utf8');

    // 1. Update imports
    if (content.includes('signInWithPopup')) {
      content = content.replace(
        'signInWithPopup',
        'signInWithRedirect,\n  getRedirectResult'
      );
      // Handle if getRedirectResult is already imported somehow
      content = content.replace(
        'signInWithRedirect,\n  getRedirectResult,\n  signInWithRedirect,',
        'signInWithRedirect,\n  getRedirectResult,'
      );
    }

    // 2. Add getRedirectResult handler in useEffect
    if (!content.includes('getRedirectResult(auth)')) {
      const redirectHandler = `
    // Handle redirect result for mobile (iOS)
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          console.log('Redirect login successful:', result.user.email);
          // onAuthStateChanged will handle the rest of the state updates
        }
      })
      .catch((error) => {
        console.error('Redirect login error:', error);
        if (error.code === 'auth/unauthorized-domain') {
          showToast('ဤဝက်ဘ်ဆိုဒ်လိပ်စာကို Firebase မှ ခွင့်မပြုထားပါ။ Authorized domains တွင် ထည့်ပေးပါ။', 'error');
        }
      });

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {`;
      
      content = content.replace(
        /const unsubscribe = onAuthStateChanged\(auth, async \(fbUser\) => \{/,
        redirectHandler
      );
    }

    // 3. Replace loginWithGoogle implementation
    const oldLoginRegex = /const loginWithGoogle = async \(\) => \{[\s\S]*?catch \(err: any\) \{[\s\S]*?throw new Error\(getAuthErrorMessage\(err\)\);\n    \} finally \{\n      setLoading\(false\);\n    \}\n  \};/;
    
    // Instead of regex, let's just find the exact block and replace the popup part
    if (content.includes('const res = await signInWithPopup(auth, provider);')) {
      // The code inside loginWithGoogle relies on 'res' and immediate state update. 
      // With redirect, the page reloads, so the immediate code block won't execute.
      // We can simplify loginWithGoogle to just trigger the redirect.
      
      const newLoginWithGoogle = `const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // Use redirect instead of popup for iOS Safari compatibility
      await signInWithRedirect(auth, provider);
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      setLoading(false);
      throw new Error(getAuthErrorMessage(err));
    }
  };`;

      // We need to replace the whole function block carefully
      const startIndex = content.indexOf('const loginWithGoogle = async () => {');
      const endIndex = content.indexOf('const login = async (email: string, pass: string) => {');
      
      if (startIndex !== -1 && endIndex !== -1) {
        content = content.substring(0, startIndex) + newLoginWithGoogle + '\n\n  ' + content.substring(endIndex);
      }
    }

    fs.writeFileSync(authContextPath, content, 'utf8');
    console.log('✅ Updated AuthContext.tsx for iOS Redirect Flow');
  }

  // 4. Build & Test
  console.log('🔨 Building and testing the app...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful! No errors.');

  // 5. Git Push
  console.log('📤 Pushing changes to GitHub...');
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "fix(auth): switch google sign-in from popup to redirect for iOS compatibility"', { stdio: 'inherit' });
  execSync('git push', { stdio: 'inherit' });
  console.log('✅ Push successful!');

} catch (error) {
  console.error('❌ Process failed during build or push. Aborting to prevent errors.');
  console.error(error.message);
} finally {
  if (fs.existsSync(scriptPath)) {
    fs.unlinkSync(scriptPath);
    console.log('🧹 Cleaned up fix_ios_google_login.cjs');
  }
}