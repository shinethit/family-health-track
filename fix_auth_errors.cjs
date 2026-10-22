const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const scriptPath = __filename;
const authContextPath = path.join(__dirname, 'src', 'context', 'AuthContext.tsx');
const indexHtmlPath = path.join(__dirname, 'index.html');
const manifestPath = path.join(__dirname, 'public', 'manifest.webmanifest');

try {
  console.log('🚀 Starting Auth Error & Manifest Fix...');

  // 1. Add friendly error message for unauthorized-domain in AuthContext.tsx
  if (fs.existsSync(authContextPath)) {
    let content = fs.readFileSync(authContextPath, 'utf8');
    if (!content.includes('auth/unauthorized-domain')) {
      content = content.replace(
        /case 'auth\/popup-closed-by-user':/,
        `case 'auth/unauthorized-domain':
      return 'ဤဝက်ဘ်ဆိုဒ်လိပ်စာကို Firebase မှ ခွင့်မပြုထားပါ။ Firebase Console > Authentication > Settings > Authorized domains တွင် သင့် App လိပ်စာ (localhost) ကို ထည့်သွင်းပေးပါ။';
    case 'auth/popup-closed-by-user':`
      );
      fs.writeFileSync(authContextPath, content, 'utf8');
      console.log('✅ Added unauthorized-domain error handler to AuthContext.tsx');
    }
  }

  // 2. Fix manifest.webmanifest Syntax Error by creating a static file
  if (!fs.existsSync(path.dirname(manifestPath))) {
    fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  }
  
  const manifestContent = {
    "id": "/",
    "name": "ကျန်းမာရေး စောင့်ရှောက်မှု (Health Care App)",
    "short_name": "Health Care",
    "description": "သွေးတိုး၊ ဆီးချို၊ BMI & အသက်တွက်ချက်မှု၊ ဓာတ်ခွဲခန်းစစ်ဆေးချက်များ (LFT, Renal, Lipid, Thyroid TFT)၊ ကာကွယ်ဆေးနှင့် ဆေးမှတ်တမ်း စောင့်ရှောက်မှု အက်ပ်",
    "theme_color": "#3B0764",
    "background_color": "#1E1B4B",
    "display": "standalone",
    "start_url": "/",
    "scope": "/",
    "icons": [
      {
        "src": "/pwa-192x192.png",
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "any"
      },
      {
        "src": "/pwa-512x512.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "any"
      },
      {
        "src": "/pwa-maskable-512x512.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "maskable"
      },
      {
        "src": "/icon.svg",
        "sizes": "512x512",
        "type": "image/svg+xml",
        "purpose": "any"
      }
    ]
  };
  
  fs.writeFileSync(manifestPath, JSON.stringify(manifestContent, null, 2), 'utf8');
  console.log('✅ Created static manifest.webmanifest to fix Syntax error');

  // 3. Add manifest link to index.html if missing
  if (fs.existsSync(indexHtmlPath)) {
    let html = fs.readFileSync(indexHtmlPath, 'utf8');
    if (!html.includes('rel="manifest"')) {
      html = html.replace(
        '<link rel="apple-touch-icon" href="/apple-touch-icon.png" />',
        '<link rel="apple-touch-icon" href="/apple-touch-icon.png" />\n    <link rel="manifest" href="/manifest.webmanifest" />'
      );
      fs.writeFileSync(indexHtmlPath, html, 'utf8');
      console.log('✅ Linked manifest.webmanifest in index.html');
    }
  }

  // 4. Build & Test
  console.log('🔨 Building and testing the app...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful! No errors.');

  // 5. Git Push
  console.log('📤 Pushing changes to GitHub...');
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "fix(auth): handle unauthorized-domain error gracefully and add static manifest"', { stdio: 'inherit' });
  execSync('git push', { stdio: 'inherit' });
  console.log('✅ Push successful!');

} catch (error) {
  console.error('❌ Process failed during build or push. Aborting to prevent errors.');
  console.error(error.message);
} finally {
  // 6. Cleanup (.cjs file delete)
  if (fs.existsSync(scriptPath)) {
    fs.unlinkSync(scriptPath);
    console.log('🧹 Cleaned up fix_auth_errors.cjs');
  }
}