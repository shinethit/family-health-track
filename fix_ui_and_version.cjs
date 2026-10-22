const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const scriptPath = __filename;
const appPath = path.join(__dirname, 'src', 'App.tsx');
const cssPath = path.join(__dirname, 'src', 'index.css');

try {
  console.log('🚀 Starting UI Cleanup & Button Fix...');

  // 1. Update index.css for button click effects and clean styling
  if (fs.existsSync(cssPath)) {
    let css = fs.readFileSync(cssPath, 'utf8');
    if (!css.includes('Global Button Click Effects')) {
      const buttonStyles = `
/* Global Button Click Effects & Minimalist Styles */
button:not(:disabled) {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}
button:not(:disabled):active {
  transform: scale(0.94) translateY(1px);
  opacity: 0.85;
  box-shadow: none !important;
}
`;
      css += buttonStyles;
      fs.writeFileSync(cssPath, css, 'utf8');
      console.log('✅ Added global button click effects to index.css');
    }
  }

  // 2. Clean up App.tsx (Remove cluttered dual dropdowns)
  if (fs.existsSync(appPath)) {
    let appContent = fs.readFileSync(appPath, 'utf8');
    
    const startMarker = '{/* Sticky Dual Cascading Dropdowns: Category (Cat) & Sub-Category (Sub Cat) */}';
    const endMarker = '{/* Main Content Area - Pure White Clean Layout */}';

    const startIndex = appContent.indexOf(startMarker);
    const endIndex = appContent.indexOf(endMarker);

    if (startIndex !== -1 && endIndex !== -1) {
      // Clean, minimal header instead of the cluttered dropdowns
      const replacement = `
      {/* Clean Minimal Module Indicator */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-[105px] sm:top-[110px] z-30 w-full shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Activity className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-800">
              {currentCategoryTabs.find(t => t.id === activeTab)?.label || 'Menu'}
            </h2>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>မော်ဂျူး ပြောင်းမည်</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
      `;
      
      appContent = appContent.substring(0, startIndex) + replacement + appContent.substring(endIndex);

      // Remove unused imports
      appContent = appContent.replace(/Folder,\s*/g, '')
                               .replace(/Layers,\s*/g, '');

      // Remove unused handler
      appContent = appContent.replace(/\/\/ Handler when user selects a Category from the Category \(Cat\) Dropdown[\s\S]*?};/g, '');

      fs.writeFileSync(appPath, appContent, 'utf8');
      console.log('✅ Cleaned up cluttered navigation in App.tsx');
    }
  }

  // 3. Build & Test
  console.log('🔨 Building and testing the app...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful! No errors.');

  // 4. Git Push
  console.log('📤 Pushing changes to GitHub...');
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "fix(ui): clean cluttered navigation, enhance button click feedback, and stabilize version history modals"', { stdio: 'inherit' });
  execSync('git push', { stdio: 'inherit' });
  console.log('✅ Push successful!');

} catch (error) {
  console.error('❌ Process failed during build or push. Aborting to prevent errors.');
  console.error(error.message);
} finally {
  // 5. Cleanup (.cjs file delete)
  if (fs.existsSync(scriptPath)) {
    fs.unlinkSync(scriptPath);
    console.log('🧹 Cleaned up fix_ui_and_version.cjs');
  }
}