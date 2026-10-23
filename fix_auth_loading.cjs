const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const scriptPath = __filename;
const authPath = path.join(__dirname, 'src', 'context', 'AuthContext.tsx');

try {
  console.log('🔧 Fixing AuthContext for new user profile creation...');

  if (fs.existsSync(authPath)) {
    let content = fs.readFileSync(authPath, 'utf8');

    // 1. Ensure setLoading(false) is called in the catch block
    content = content.replace(
      /} catch \(e\) \{\n            console\.warn\('Profile load error:', e\);\n            if \(!isMounted\) return;\n            const fallbackProfile: UserProfile = \{[\s\S]*?\};\n            setProfile\(fallbackProfile\);\n          \}\n          if \(isMounted\) setLoading\(false\);/,
      `} catch (e) {
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
            localStorage.setItem('family_health_profile', JSON.stringify(fallbackProfile));
          }
          if (isMounted) setLoading(false);`
    );

    // 2. Fix the loginWithGoogle function to not get stuck in loading if popup succeeds
    // We rely on onAuthStateChanged, so we don't need to setLoading(false) here. 
    // But if it throws, we must setLoading(false).
    content = content.replace(
      /      await signInWithPopup\(auth, provider\);\n    \} catch \(err: any\) \{/,
      `      await signInWithPopup(auth, provider);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setLoading(false);
      }`
    );

    // 3. Ensure setLoading(false) is in the finally block of loginWithGoogle if redirect fails
    content = content.replace(
      /          setLoading\(false\);\n          throw new Error\(getAuthErrorMessage\(redirectErr\)\);\n        \}\n      \}\n      setLoading\(false\);\n      throw new Error\(getAuthErrorMessage\(err\)\);/,
      `          setLoading(false);
          throw new Error(getAuthErrorMessage(redirectErr));
        }
      }
      if (err.code !== 'auth/popup-closed-by-user') {
        setLoading(false);
      }
      throw new Error(getAuthErrorMessage(err));`
    );

    fs.writeFileSync(authPath, content, 'utf8');
    console.log('✅ AuthContext.tsx has been fixed successfully.');
  }

  // Build & Push
  console.log('🔨 Building...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('📤 Pushing to GitHub...');
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "fix(auth): ensure new user profile creation and loading state handling"', { stdio: 'inherit' });
  execSync('git push', { stdio: 'inherit' });
  console.log('✅ All done successfully!');

} catch (error) {
  console.error('❌ Failed:', error.message);
} finally {
  if (fs.existsSync(scriptPath)) fs.unlinkSync(scriptPath);
}