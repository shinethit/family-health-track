const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const scriptPath = __filename;

try {
  console.log('🧹 Cleaning up secret files and resetting Git...');

  // 1. Delete the secret file locally
  const secretFile = path.join(__dirname, 'serviceAccountKey.json');
  if (fs.existsSync(secretFile)) {
    fs.unlinkSync(secretFile);
    console.log('✅ Deleted serviceAccountKey.json locally.');
  }

  // 2. Delete the temporary migration scripts from previous attempts
  const scriptsToDelete = ['migrate_data.cjs', 'migrate_data_fixed.cjs'];
  scriptsToDelete.forEach(s => {
     const p = path.join(__dirname, s);
     if(fs.existsSync(p)) fs.unlinkSync(p);
  });
  console.log('✅ Deleted temporary migration scripts.');

  // 3. Ensure .gitignore has the secret file
  const gitignorePath = path.join(__dirname, '.gitignore');
  let gitignore = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';
  if (!gitignore.includes('serviceAccountKey.json')) {
    gitignore += '\n# Secrets\nserviceAccountKey.json\n';
    fs.writeFileSync(gitignorePath, gitignore, 'utf8');
    console.log('✅ Added serviceAccountKey.json to .gitignore');
  }

  // 4. Reset the failed commit (undo the commit, but keep the file changes)
  console.log('🔄 Undoing the failed Git commit...');
  try {
    execSync('git reset --soft HEAD~1', { stdio: 'inherit' });
  } catch (e) {
    console.log('Skipping reset (might not be committed yet).');
  }

  // 5. Unstage the secret file if it was staged
  try {
    execSync('git restore --staged serviceAccountKey.json', { stdio: 'inherit' });
  } catch (e) {
     // Ignore if it wasn't staged
  }

  // 6. Re-add and commit cleanly
  console.log('📦 Re-staging changes...');
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "chore: bump version to v2.4.5, setup browser-based data migration, and secure gitignore"', { stdio: 'inherit' });

  // 7. Push
  console.log('📤 Pushing to GitHub...');
  execSync('git push', { stdio: 'inherit' });
  console.log('✅ Push successful!');

} catch (error) {
  console.error('❌ Failed to clean up and push:', error.message);
} finally {
  if (fs.existsSync(scriptPath)) {
    fs.unlinkSync(scriptPath);
    console.log('🧹 Cleaned up clean_git_and_push.cjs');
  }
}