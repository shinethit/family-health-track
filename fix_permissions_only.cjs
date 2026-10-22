const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const scriptPath = __filename;
const rulesPath = path.join(__dirname, 'firestore.rules');

try {
  console.log('🔧 Fixing Firestore Rules for Query Permissions...');

  if (fs.existsSync(rulesPath)) {
    let rules = fs.readFileSync(rulesPath, 'utf8');

    // Fix medicationLogs
    rules = rules.replace(
      /match \/medicationLogs\/\{id\} \{[\s\S]*?\}/,
      `match /medicationLogs/{id} { 
        allow read: if isSignedIn() && (resource.data.patientEmail == request.auth.token.email || resource.data.userId == request.auth.uid) || isAdmin(); 
        allow create: if isSignedIn() && (request.resource.data.patientEmail == request.auth.token.email || request.resource.data.userId == request.auth.uid) || isAdmin(); 
        allow update: if isSignedIn() && (resource.data.patientEmail == request.auth.token.email || resource.data.userId == request.auth.uid) && (request.resource.data.userId == resource.data.userId || request.resource.data.patientEmail == resource.data.patientEmail) || isAdmin(); 
        allow delete: if isSignedIn() && (resource.data.patientEmail == request.auth.token.email || resource.data.userId == request.auth.uid) || isAdmin(); 
      }`
    );

    // Fix vaccines
    rules = rules.replace(
      /match \/vaccines\/\{id\} \{[\s\S]*?\}/,
      `match /vaccines/{id} { 
        allow read: if isSignedIn() && (resource.data.patientEmail == request.auth.token.email || resource.data.userId == request.auth.uid) || isAdmin(); 
        allow create: if isSignedIn() && (request.resource.data.patientEmail == request.auth.token.email || request.resource.data.userId == request.auth.uid) || isAdmin(); 
        allow update: if isSignedIn() && (resource.data.patientEmail == request.auth.token.email || resource.data.userId == request.auth.uid) && (request.resource.data.userId == resource.data.userId || request.resource.data.patientEmail == resource.data.patientEmail) || isAdmin(); 
        allow delete: if isSignedIn() && (resource.data.patientEmail == request.auth.token.email || resource.data.userId == request.auth.uid) || isAdmin(); 
      }`
    );

    fs.writeFileSync(rulesPath, rules, 'utf8');
    console.log('✅ Firestore Rules updated for simple queries.');
  }

  // Deploy Rules
  console.log('🚀 Deploying Firestore Rules...');
  execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });

  // Build & Push
  console.log('🔨 Building...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('📤 Pushing to GitHub...');
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "fix(rules): simplify conditions for medicationLogs and vaccines to allow queries"', { stdio: 'inherit' });
  execSync('git push', { stdio: 'inherit' });
  console.log('✅ All done successfully!');

} catch (error) {
  console.error('❌ Failed:', error.message);
} finally {
  if (fs.existsSync(scriptPath)) fs.unlinkSync(scriptPath);
}