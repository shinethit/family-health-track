const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const scriptPath = __filename;
const authContextPath = path.join(__dirname, 'src', 'context', 'AuthContext.tsx');

try {
  console.log('🚀 Starting UID Mismatch & Data Sync Fix...');

  // 1. Add console log for UID in AuthContext.tsx to help user find their new UID
  if (fs.existsSync(authContextPath)) {
    let content = fs.readFileSync(authContextPath, 'utf8');
    
    if (!content.includes('🔑 သင့်ရဲ့ လက်ရှိ UID မှာ')) {
      content = content.replace(
        /setCurrentUser\(fbUser\);/,
        `setCurrentUser(fbUser);
        console.log("=========================================");
        console.log("🔑 သင့်ရဲ့ လက်ရှိ UID မှာ:", fbUser.uid);
        console.log("💡 Data အဟောင်းများ မပေါ်ပါက ဤ UID ကို Copy ကူးပြီး Firebase Console > Firestore > admins Collection ထဲတွင် Document ID အဖြစ် ထည့်သွင်းပါ။");
        console.log("=========================================");`
      );
      fs.writeFileSync(authContextPath, content, 'utf8');
      console.log('✅ Added UID logging to AuthContext.tsx');
    }
  }

  // 2. Build & Test
  console.log('🔨 Building and testing the app...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful! No errors.');

  // 3. Git Push
  console.log('📤 Pushing changes to GitHub...');
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "feat(auth): add console logging for current UID to help debug data sync issues"', { stdio: 'inherit' });
  execSync('git push', { stdio: 'inherit' });
  console.log('✅ Push successful!');

} catch (error) {
  console.error('❌ Process failed during build or push. Aborting to prevent errors.');
  console.error(error.message);
} finally {
  if (fs.existsSync(scriptPath)) {
    fs.unlinkSync(scriptPath);
    console.log('🧹 Cleaned up fix_uid_mismatch.cjs');
  }
}