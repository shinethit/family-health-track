const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const scriptPath = __filename;
const versionFilePath = path.join(__dirname, 'src', 'constants', 'version.ts');
const modalPath = path.join(__dirname, 'src', 'components', 'modules', 'VersionHistoryModal.tsx');

try {
  console.log('🚀 Bumping version to v2.4.5...');
  const NEW_VERSION = 'v2.4.5';

  if (fs.existsSync(versionFilePath)) {
    let vContent = fs.readFileSync(versionFilePath, 'utf8');
    vContent = vContent.replace(/v2\.4\.4/g, NEW_VERSION).replace(/v2\.4\.3/g, NEW_VERSION);
    fs.writeFileSync(versionFilePath, vContent, 'utf8');
  }

  if (fs.existsSync(modalPath)) {
    let mContent = fs.readFileSync(modalPath, 'utf8');
    if (!mContent.includes(NEW_VERSION)) {
      const newVersionData = `{
    version: '${NEW_VERSION}',
    type: 'minor',
    releaseDate: '၂၀၂၆ ခုနှစ်၊ အောက်တိုဘာလ',
    isLatest: true,
    title: '🔐 [AUTH & DATA SYNC] Bulletproof Google Login for All Platforms & Data Migration Helper',
    badge: 'Latest Release (${NEW_VERSION})',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    highlights: [
      {
        title: '🔐 စနစ်တကျ ပြင်ဆင်ထားသော Google Login စနစ်',
        icon: ShieldCheck,
        items: [
          'iOS နှင့် Android နှစ်မျိုးလုံးတွင် အဆင်ပြေစေရန် Popup နှင့် Redirect ကို အလိုအလျောက် ရွေးချယ်အသုံးပြုသည့် စနစ်',
          'Login ပြန်လာချိန်တွင် မျက်နှာပြင် ရှုပ်ထွေးမှုမရှိစေရန် State များကို စနစ်တကျ ထိန်းချုပ်ထားခြင်း'
        ]
      },
      {
        title: '🗂️ Admin မှတဆင့် အဟောင်း Data များ ပြန်လည်ကြည့်ရှုနိုင်ခြင်း',
        icon: Database,
        items: [
          'UID အဟောင်းနှင့် အသစ် မတူညီမှုကြောင့် မပေါ်တော့သော Data များကို Admin စနစ်ဖြင့် ပြန်လည်စစ်ဆေးနိုင်ခြင်း',
          'စနစ်အသစ်တွင် User အားလုံး၏ မှတ်တမ်းများကို စနစ်တကျ စီမံခန့်ခွဲနိုင်ခြင်း'
        ]
      }
    ]
  },`;

      mContent = mContent.replace(
        /export const VERSION_HISTORY_DATA: VersionItem\[\] = \[/,
        `export const VERSION_HISTORY_DATA: VersionItem[] = [\n  ${newVersionData}`
      );
      
      mContent = mContent.replace(/isLatest: true,/g, (match, offset) => {
        if (offset < mContent.indexOf(newVersionData) + newVersionData.length) return match;
        return 'isLatest: false,';
      });

      fs.writeFileSync(modalPath, mContent, 'utf8');
    }
  }

  console.log('🔨 Building app...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('📤 Pushing to GitHub...');
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "chore: bump version to v2.4.5 and add changelog"', { stdio: 'inherit' });
  execSync('git push', { stdio: 'inherit' });
  console.log('✅ Done!');

} catch (error) {
  console.error('❌ Failed:', error.message);
} finally {
  if (fs.existsSync(scriptPath)) fs.unlinkSync(scriptPath);
}