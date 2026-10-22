const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const scriptPath = __filename;

try {
  console.log('🚀 Starting recovery process...');

  // 1. Check for node_modules and install dependencies (Fixes the 'vite' error)
  if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
    console.log('📦 node_modules not found. Running npm install (this might take a minute)...');
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully.');
  } else {
    console.log('✅ node_modules already exists.');
  }

  // 2. Build & Test
  console.log('🔨 Building the app...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful! No errors.');

  // 3. Git Add & Commit
  console.log('📦 Staging changes...');
  execSync('git add .', { stdio: 'inherit' });
  
  try {
    execSync('git commit -m "fix(ui): add global button click effects and fix active scale classes"', { stdio: 'inherit' });
    console.log('✅ Changes committed.');
  } catch (commitError) {
    console.log('ℹ️ No changes to commit or already committed. Proceeding...');
  }
  
  // 4. Git Push
  console.log('📤 Pushing changes to GitHub...');
  execSync('git push', { stdio: 'inherit' });
  console.log('✅ Push successful!');

} catch (error) {
  console.error('❌ Process failed. Aborting to prevent errors.');
  console.error(error.message);
} finally {
  // 5. Cleanup (.cjs file delete)
  if (fs.existsSync(scriptPath)) {
    fs.unlinkSync(scriptPath);
    console.log('🧹 Cleaned up fix_and_push.cjs');
  }
}