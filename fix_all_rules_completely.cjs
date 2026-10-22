const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const scriptPath = __filename;
const rulesPath = path.join(__dirname, 'firestore.rules');

try {
  console.log('🛡️ Overwriting Firestore Rules with completely clean, Query-friendly rules...');

  const newRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }

    function isSignedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return isSignedIn() && exists(/databases/\$(database)/documents/admins/\$(request.auth.uid));
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    match /admins/{adminId} {
      allow read: if isSignedIn();
      allow write: if false;
    }

    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isOwner(userId) && (!('role' in request.resource.data) || request.resource.data.role != 'admin');
      allow update: if (isOwner(userId) && (!('role' in request.resource.data) || request.resource.data.role != 'admin' || (resource != null && 'role' in resource.data && request.resource.data.role == resource.data.role))) || isAdmin();
      allow delete: if isOwner(userId) || isAdmin();
    }

    // Query by Email or UserID is safely allowed
    match /vitals/{vitalId} {
      allow read: if isSignedIn() && (resource.data.userId == request.auth.uid || resource.data.patientEmail == request.auth.token.email) || isAdmin();
      allow create: if isSignedIn() && (request.resource.data.userId == request.auth.uid || request.resource.data.patientEmail == request.auth.token.email) || isAdmin();
      allow update: if isSignedIn() && (resource.data.userId == request.auth.uid || resource.data.patientEmail == request.auth.token.email) || isAdmin();
      allow delete: if isSignedIn() && (resource.data.userId == request.auth.uid || resource.data.patientEmail == request.auth.token.email) || isAdmin();
    }

    match /glucose/{gluId} {
      allow read: if isSignedIn() && (resource.data.userId == request.auth.uid || resource.data.patientEmail == request.auth.token.email) || isAdmin();
      allow create: if isSignedIn() && (request.resource.data.userId == request.auth.uid || request.resource.data.patientEmail == request.auth.token.email) || isAdmin();
      allow update: if isSignedIn() && (resource.data.userId == request.auth.uid || resource.data.patientEmail == request.auth.token.email) || isAdmin();
      allow delete: if isSignedIn() && (resource.data.userId == request.auth.uid || resource.data.patientEmail == request.auth.token.email) || isAdmin();
    }

    match /bmi/{bmiId} {
      allow read: if isSignedIn() && (resource.data.userId == request.auth.uid || resource.data.patientEmail == request.auth.token.email) || isAdmin();
      allow create: if isSignedIn() && (request.resource.data.userId == request.auth.uid || request.resource.data.patientEmail == request.auth.token.email) || isAdmin();
      allow update: if isSignedIn() && (resource.data.userId == request.auth.uid || resource.data.patientEmail == request.auth.token.email) || isAdmin();
      allow delete: if isSignedIn() && (resource.data.userId == request.auth.uid || resource.data.patientEmail == request.auth.token.email) || isAdmin();
    }

    match /labTests/{testId} {
      allow read: if isSignedIn() && (resource.data.userId == request.auth.uid || resource.data.patientEmail == request.auth.token.email) || isAdmin();
      allow create: if isSignedIn() && (request.resource.data.userId == request.auth.uid || request.resource.data.patientEmail == request.auth.token.email) || isAdmin();
      allow update: if isSignedIn() && (resource.data.userId == request.auth.uid || resource.data.patientEmail == request.auth.token.email) || isAdmin();
      allow delete: if isSignedIn() && (resource.data.userId == request.auth.uid || resource.data.patientEmail == request.auth.token.email) || isAdmin();
    }

    match /medications/{medId} {
      allow read: if isSignedIn() && (resource.data.userId == request.auth.uid || resource.data.patientEmail == request.auth.token.email) || isAdmin();
      allow create: if isSignedIn() && (request.resource.data.userId == request.auth.uid || request.resource.data.patientEmail == request.auth.token.email) || isAdmin();
      allow update: if isSignedIn() && (resource.data.userId == request.auth.uid || resource.data.patientEmail == request.auth.token.email) || isAdmin();
      allow delete: if isSignedIn() && (resource.data.userId == request.auth.uid || resource.data.patientEmail == request.auth.token.email) || isAdmin();
    }

    match /familyMembers/{memberId} {
      allow read: if isSignedIn() && (resource.data.userId == request.auth.uid || resource.data.patientEmail == request.auth.token.email) || isAdmin();
      allow create: if isSignedIn() && (request.resource.data.userId == request.auth.uid || request.resource.data.patientEmail == request.auth.token.email) || isAdmin();
      allow update: if isSignedIn() && (resource.data.userId == request.auth.uid || resource.data.patientEmail == request.auth.token.email) || isAdmin();
      allow delete: if isSignedIn() && (resource.data.userId == request.auth.uid || resource.data.patientEmail == request.auth.token.email) || isAdmin();
    }

    match /medicationLogs/{logId} {
      allow read: if isSignedIn() && (resource.data.userId == request.auth.uid || resource.data.patientEmail == request.auth.token.email) || isAdmin();
      allow create: if isSignedIn() && (request.resource.data.userId == request.auth.uid || request.resource.data.patientEmail == request.auth.token.email) || isAdmin();
      allow update: if isSignedIn() && (resource.data.userId == request.auth.uid || resource.data.patientEmail == request.auth.token.email) || isAdmin();
      allow delete: if isSignedIn() && (resource.data.userId == request.auth.uid || resource.data.patientEmail == request.auth.token.email) || isAdmin();
    }

    match /vaccines/{vacId} {
      allow read: if isSignedIn() && (resource.data.userId == request.auth.uid || resource.data.patientEmail == request.auth.token.email) || isAdmin();
      allow create: if isSignedIn() && (request.resource.data.userId == request.auth.uid || request.resource.data.patientEmail == request.auth.token.email) || isAdmin();
      allow update: if isSignedIn() && (resource.data.userId == request.auth.uid || resource.data.patientEmail == request.auth.token.email) || isAdmin();
      allow delete: if isSignedIn() && (resource.data.userId == request.auth.uid || resource.data.patientEmail == request.auth.token.email) || isAdmin();
    }

    match /doctorAdvices/{adviceId} {
      allow read: if isSignedIn() && (resource.data.userId == request.auth.uid || resource.data.patientEmail == request.auth.token.email) || isAdmin();
      allow create, update: if isAdmin();
      allow delete: if isSignedIn() && (resource.data.userId == request.auth.uid || resource.data.patientEmail == request.auth.token.email) || isAdmin();
    }

    match /doctorQuestions/{questionId} {
      allow read: if isSignedIn() && (resource.data.userId == request.auth.uid || resource.data.patientEmail == request.auth.token.email) || isAdmin();
      allow create: if isSignedIn() && (request.resource.data.userId == request.auth.uid || request.resource.data.patientEmail == request.auth.token.email);
      allow update: if isAdmin() || (isSignedIn() && (resource.data.userId == request.auth.uid || resource.data.patientEmail == request.auth.token.email) && request.resource.data.userId == resource.data.userId && (!('doctorAnswer' in request.resource.data) || request.resource.data.doctorAnswer == resource.data.doctorAnswer));
      allow delete: if isSignedIn() && (resource.data.userId == request.auth.uid || resource.data.patientEmail == request.auth.token.email) || isAdmin();
    }

    match /broadcastTickers/{tickerId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }
  }
}`;
  
  fs.writeFileSync(rulesPath, newRules, 'utf8');
  console.log('✅ Cleaned and replaced Firestore Rules completely.');

  // Deploy Rules
  console.log('🚀 Deploying Firestore Rules...');
  execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });

  // Build & Push
  console.log('🔨 Building...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('📤 Pushing to GitHub...');
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "fix(rules): completely rewrite rules to support exact query constraints for email"', { stdio: 'inherit' });
  execSync('git push', { stdio: 'inherit' });
  console.log('✅ All done successfully!');

} catch (error) {
  console.error('❌ Failed:', error.message);
} finally {
  if (fs.existsSync(scriptPath)) fs.unlinkSync(scriptPath);
}