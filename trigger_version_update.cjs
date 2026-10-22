const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const scriptPath = __filename;
const versionFilePath = path.join(__dirname, 'src', 'constants', 'version.ts');
const modalPath = path.join(__dirname, 'src', 'components', 'modules', 'VersionHistoryModal.tsx');

try {
  console.log('🚀 Starting Version Bump & Update Trigger...');

  const NEW_VERSION = 'v2.4.4';

  // 1. Update version.ts
  if (fs.existsSync(versionFilePath)) {
    let vContent = fs.readFileSync(versionFilePath, 'utf8');
    vContent = vContent.replace(/v2\.4\.3/g, NEW_VERSION);
    fs.writeFileSync(versionFilePath, vContent, 'utf8');
    console.log(`✅ Updated system version to ${NEW_VERSION} in version.ts`);
  }

  // 2. Add new version log to VersionHistoryModal.tsx
  if (fs.existsSync(modalPath)) {
    let mContent = fs.readFileSync(modalPath, 'utf8');
    
    // Check if already updated
    if (!mContent.includes(NEW_VERSION)) {
      const newVersionData = `{
    version: '${NEW_VERSION}',
    type: 'minor',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ အောက်တိုဘာလ (ယနေ့)',
    isLatest: true,
    title: '🎨 [UI/UX & AUTH] Clean Navigation, Tactile Button Feedback & Google Auth Fix',
    badge: 'Latest Release (${NEW_VERSION})',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    highlights: [
      {
        title: '🎨 သပ်ရပ်သော Navigation နှင့် ခလုတ်များ နှိပ်ရလွယ်ကူစေခြင်း',
        icon: Sparkles,
        items: [
          'အပေါ်ပိုင်းရှိ ရှုပ်ထွေးနေသော Dropdown နှစ်ခုကို ဖယ်ရှားပြီး သန့်ရှင်းသော Module Indicator ဖြင့် အစားထိုးခြင်း',
          'ခလုတ်များ နှိပ်လိုက်ပါက ခံစားမှုရှိစေရန် (Click Feedback / Active State) စနစ်တကျ ထည့်သွင်းပေးခြင်း'
        ]
      },
      {
        title: '🔐 Google အကောင့်ဖြင့် ဝင်ရောက်မှု (Authentication) ပြင်ဆင်ခြင်း',
        icon: ShieldCheck,
        items: [
          'Firebase Authorized Domains ပြဿနာများအတွက် မြန်မာလို ရှင်းလင်းသော Error စာသားများ ထည့်သွင်းပေးခြင်း',
          'Manifest File Syntax Error များကို ပြင်ဆင်ပြီး PWA အလုပ်လုပ်မှု ပိုမိုတည်ငြိမ်စေခြင်း'
        ]
      }
    ]
  },`;

      // Insert right after the array declaration
      mContent = mContent.replace(
        /export const VERSION_HISTORY_DATA: VersionItem\[\] = \[/,
        `export const VERSION_HISTORY_DATA: VersionItem[] = [\n  ${newVersionData}`
      );

      // Update the previous latest release flag (v2.4.3) to false
      mContent = mContent.replace(/isLatest: true,/g, (match, offset) => {
        // Skip the first one we just added
        if (offset < mContent.indexOf(newVersionData) + newVersionData.length) {
          return match;
        }
        return 'isLatest: false,';
      });

      fs.writeFileSync(modalPath, mContent, 'utf8');
      console.log(`✅ Added ${NEW_VERSION} Change Log to VersionHistoryModal.tsx`);
    }
  }

  // 3. Build & Test
  console.log('🔨 Building and testing the app...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful! No errors.');

  // 4. Git Push
  console.log('📤 Pushing changes to GitHub...');
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "feat: bump version to v2.4.4 and add changelog for UI & Auth fixes"', { stdio: 'inherit' });
  execSync('git push', { stdio: 'inherit' });
  console.log('✅ Push successful!');

} catch (error) {
  console.error('❌ Process failed during build or push. Aborting to prevent errors.');
  console.error(error.message);
} finally {
  // 5. Cleanup
  if (fs.existsSync(scriptPath)) {
    fs.unlinkSync(scriptPath);
    console.log('🧹 Cleaned up trigger_version_update.cjs');
  }
}