const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const scriptPath = __filename;
const rulesPath = path.join(__dirname, 'firestore.rules');

try {
  console.log('🔧 Fixing Firestore Rules for MedicationLogs and Vaccines...');

  if (fs.existsSync(rulesPath)) {
    let rules = fs.readFileSync(rulesPath, 'utf8');

    // 1. Update medicationLogs rule
    rules = rules.replace(
      /match \/medicationLogs\/\{id\} \{[\s\S]*?\}/,
      `match /medicationLogs/{id} { 
        allow read: if isSignedIn() && (resource.data.userId == request.auth.uid || isEmailOwner() || request.auth.token.email == resource.data.patientEmail) || isAdmin(); 
        allow create: if isSignedIn() && (request.resource.data.userId == request.auth.uid || request.resource.data.patientEmail == request.auth.token.email) || isAdmin(); 
        allow update: if isSignedIn() && (resource.data.userId == request.auth.uid || isEmailOwner() || request.auth.token.email == resource.data.patientEmail) && (request.resource.data.userId == resource.data.userId || request.resource.data.patientEmail == resource.data.patientEmail) || isAdmin(); 
        allow delete: if isSignedIn() && (resource.data.userId == request.auth.uid || isEmailOwner() || request.auth.token.email == resource.data.patientEmail) || isAdmin(); 
      }`
    );

    // 2. Update vaccines rule
    rules = rules.replace(
      /match \/vaccines\/\{id\} \{[\s\S]*?\}/,
      `match /vaccines/{id} { 
        allow read: if isSignedIn() && (resource.data.userId == request.auth.uid || isEmailOwner() || request.auth.token.email == resource.data.patientEmail) || isAdmin(); 
        allow create: if isSignedIn() && (request.resource.data.userId == request.auth.uid || request.resource.data.patientEmail == request.auth.token.email) || isAdmin(); 
        allow update: if isSignedIn() && (resource.data.userId == request.auth.uid || isEmailOwner() || request.auth.token.email == resource.data.patientEmail) && (request.resource.data.userId == resource.data.userId || request.resource.data.patientEmail == resource.data.patientEmail) || isAdmin(); 
        allow delete: if isSignedIn() && (resource.data.userId == request.auth.uid || isEmailOwner() || request.auth.token.email == resource.data.patientEmail) || isAdmin(); 
      }`
    );

    // 3. Update addFamilyMember to include patientEmail in HealthDataContext.tsx (if not already)
    const contextPath = path.join(__dirname, 'src', 'context', 'HealthDataContext.tsx');
    if (fs.existsSync(contextPath)) {
      let context = fs.readFileSync(contextPath, 'utf8');
      if (!context.includes('patientEmail: currentUser.email || \'\',')) {
        context = context.replace(
          "const newMember = {\n      ...member,\n      userId: currentUser.uid,",
          "const newMember = {\n      ...member,\n      userId: currentUser.uid,\n      patientEmail: currentUser.email || '',"
        );
        fs.writeFileSync(contextPath, context, 'utf8');
        console.log('✅ Added patientEmail to family members creation.');
      }
    }

    fs.writeFileSync(rulesPath, rules, 'utf8');
    console.log('✅ Firestore Rules updated successfully for specific collections.');
  }

  // Deploy Rules
  console.log('🚀 Deploying Firestore Rules...');
  execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });

  // Build & Push
  console.log('🔨 Building...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('📤 Pushing to GitHub...');
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "fix(rules): allow query by patientEmail for medicationLogs and vaccines"', { stdio: 'inherit' });
  execSync('git push', { stdio: 'inherit' });
  console.log('✅ All done successfully!');

} catch (error) {
  console.error('❌ Failed:', error.message);
} finally {
  if (fs.existsSync(scriptPath)) fs.unlinkSync(scriptPath);
}