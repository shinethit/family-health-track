const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const scriptPath = __filename;
const rulesPath = path.join(__dirname, 'firestore.rules');

try {
  console.log('🔧 Fixing Firestore Rules for List Queries (Removing OR condition)...');

  if (fs.existsSync(rulesPath)) {
    let rules = fs.readFileSync(rulesPath, 'utf8');

    // Replace medicationLogs rule with a clean, Query-compatible rule
    rules = rules.replace(
      /match \/medicationLogs\/\{id\} \{[\s\S]*?\}/,
      `match /medicationLogs/{id} { 
        allow read: if isSignedIn() && (request.auth.token.email == resource.data.patientEmail) || isAdmin(); 
        allow create: if isSignedIn() && (request.auth.token.email == request.resource.data.patientEmail) || isAdmin(); 
        allow update: if isSignedIn() && (request.auth.token.email == resource.data.patientEmail) || isAdmin(); 
        allow delete: if isSignedIn() && (request.auth.token.email == resource.data.patientEmail) || isAdmin(); 
      }`
    );

    // Replace vaccines rule with a clean, Query-compatible rule
    rules = rules.replace(
      /match \/vaccines\/\{id\} \{[\s\S]*?\}/,
      `match /vaccines/{id} { 
        allow read: if isSignedIn() && (request.auth.token.email == resource.data.patientEmail) || isAdmin(); 
        allow create: if isSignedIn() && (request.auth.token.email == request.resource.data.patientEmail) || isAdmin(); 
        allow update: if isSignedIn() && (request.auth.token.email == resource.data.patientEmail) || isAdmin(); 
        allow delete: if isSignedIn() && (request.auth.token.email == resource.data.patientEmail) || isAdmin(); 
      }`
    );

    fs.writeFileSync(rulesPath, rules, 'utf8');
    console.log('✅ Firestore Rules updated. Removed OR conditions causing query block.');
  }

  // Deploy Rules
  console.log('🚀 Deploying Firestore Rules...');
  execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });

  // Build & Push
  console.log('🔨 Building...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('📤 Pushing to GitHub...');
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "fix(rules): remove OR conditions to allow Firestore list queries by patientEmail"', { stdio: 'inherit' });
  execSync('git push', { stdio: 'inherit' });
  console.log('✅ All done successfully!');

} catch (error) {
  console.error('❌ Failed:', error.message);
} finally {
  if (fs.existsSync(scriptPath)) fs.unlinkSync(scriptPath);
}