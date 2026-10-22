const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const scriptPath = __filename;
const contextPath = path.join(__dirname, 'src', 'context', 'HealthDataContext.tsx');
const rulesPath = path.join(__dirname, 'firestore.rules');

try {
  console.log('🚀 Starting Final User Data Fix (Email-based)...');

  // 1. Update Firestore Rules
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
      return isSignedIn() && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    function isEmailOwner() {
      return isSignedIn() && (
        (resource.data.patientEmail != null && resource.data.patientEmail == request.auth.token.email) ||
        (resource.data.userEmail != null && resource.data.userEmail == request.auth.token.email)
      );
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

    match /vitals/{id} { allow read: if isSignedIn() && (resource.data.userId == request.auth.uid || isEmailOwner()) || isAdmin(); allow create: if isSignedIn() && (request.resource.data.userId == request.auth.uid || request.resource.data.patientEmail == request.auth.token.email) || isAdmin(); allow update: if isSignedIn() && (resource.data.userId == request.auth.uid || isEmailOwner()) && (request.resource.data.userId == resource.data.userId || request.resource.data.patientEmail == resource.data.patientEmail) || isAdmin(); allow delete: if isSignedIn() && (resource.data.userId == request.auth.uid || isEmailOwner()) || isAdmin(); }
    
    match /glucose/{id} { allow read: if isSignedIn() && (resource.data.userId == request.auth.uid || isEmailOwner()) || isAdmin(); allow create: if isSignedIn() && (request.resource.data.userId == request.auth.uid || request.resource.data.patientEmail == request.auth.token.email) || isAdmin(); allow update: if isSignedIn() && (resource.data.userId == request.auth.uid || isEmailOwner()) && (request.resource.data.userId == resource.data.userId || request.resource.data.patientEmail == resource.data.patientEmail) || isAdmin(); allow delete: if isSignedIn() && (resource.data.userId == request.auth.uid || isEmailOwner()) || isAdmin(); }

    match /bmi/{id} { allow read: if isSignedIn() && (resource.data.userId == request.auth.uid || isEmailOwner()) || isAdmin(); allow create: if isSignedIn() && (request.resource.data.userId == request.auth.uid || request.resource.data.patientEmail == request.auth.token.email) || isAdmin(); allow update: if isSignedIn() && (resource.data.userId == request.auth.uid || isEmailOwner()) && (request.resource.data.userId == resource.data.userId || request.resource.data.patientEmail == resource.data.patientEmail) || isAdmin(); allow delete: if isSignedIn() && (resource.data.userId == request.auth.uid || isEmailOwner()) || isAdmin(); }

    match /labTests/{id} { allow read: if isSignedIn() && (resource.data.userId == request.auth.uid || isEmailOwner()) || isAdmin(); allow create: if isSignedIn() && (request.resource.data.userId == request.auth.uid || request.resource.data.patientEmail == request.auth.token.email) || isAdmin(); allow update: if isSignedIn() && (resource.data.userId == request.auth.uid || isEmailOwner()) && (request.resource.data.userId == resource.data.userId || request.resource.data.patientEmail == resource.data.patientEmail) || isAdmin(); allow delete: if isSignedIn() && (resource.data.userId == request.auth.uid || isEmailOwner()) || isAdmin(); }

    match /medications/{id} { allow read: if isSignedIn() && (resource.data.userId == request.auth.uid || isEmailOwner()) || isAdmin(); allow create: if isSignedIn() && (request.resource.data.userId == request.auth.uid || request.resource.data.patientEmail == request.auth.token.email) || isAdmin(); allow update: if isSignedIn() && (resource.data.userId == request.auth.uid || isEmailOwner()) && (request.resource.data.userId == resource.data.userId || request.resource.data.patientEmail == resource.data.patientEmail) || isAdmin(); allow delete: if isSignedIn() && (resource.data.userId == request.auth.uid || isEmailOwner()) || isAdmin(); }

    match /familyMembers/{id} { allow read: if isSignedIn() && (resource.data.userId == request.auth.uid || isEmailOwner()) || isAdmin(); allow create: if isSignedIn() && (request.resource.data.userId == request.auth.uid || request.resource.data.patientEmail == request.auth.token.email) || isAdmin(); allow update: if isSignedIn() && (resource.data.userId == request.auth.uid || isEmailOwner()) && (request.resource.data.userId == resource.data.userId || request.resource.data.patientEmail == resource.data.patientEmail) || isAdmin(); allow delete: if isSignedIn() && (resource.data.userId == request.auth.uid || isEmailOwner()) || isAdmin(); }

    match /doctorAdvices/{id} { allow read: if isSignedIn() && (resource.data.userId == request.auth.uid || isEmailOwner()) || isAdmin(); allow create, update: if isAdmin(); allow delete: if isSignedIn() && (resource.data.userId == request.auth.uid || isEmailOwner()) || isAdmin(); }

    match /doctorQuestions/{id} { allow read: if isSignedIn() && (resource.data.userId == request.auth.uid || isEmailOwner()) || isAdmin(); allow create: if isSignedIn() && (request.resource.data.userId == request.auth.uid || request.resource.data.patientEmail == request.auth.token.email); allow update: if isAdmin() || (isSignedIn() && (resource.data.userId == request.auth.uid || isEmailOwner()) && request.resource.data.userId == resource.data.userId && (!('doctorAnswer' in request.resource.data) || request.resource.data.doctorAnswer == resource.data.doctorAnswer)); allow delete: if isSignedIn() && (resource.data.userId == request.auth.uid || isEmailOwner()) || isAdmin(); }

    match /broadcastTickers/{id} { allow read: if isSignedIn(); allow write: if isAdmin(); }
  }
}`;
  fs.writeFileSync(rulesPath, newRules, 'utf8');
  console.log('✅ Firestore Rules updated safely.');

  // 2. Update HealthDataContext.tsx
  if (fs.existsSync(contextPath)) {
    let context = fs.readFileSync(contextPath, 'utf8');

    // Replace queries
    context = context.replace(/query\(collection\(db, 'vitals'\), where\('userId', '==', currentUser\.uid\)\)/g, "query(collection(db, 'vitals'), where('patientEmail', '==', currentUser.email || '___'))");
    context = context.replace(/query\(collection\(db, 'glucose'\), where\('userId', '==', currentUser\.uid\)\)/g, "query(collection(db, 'glucose'), where('patientEmail', '==', currentUser.email || '___'))");
    context = context.replace(/query\(collection\(db, 'bmi'\), where\('userId', '==', currentUser\.uid\)\)/g, "query(collection(db, 'bmi'), where('patientEmail', '==', currentUser.email || '___'))");
    context = context.replace(/query\(collection\(db, 'labTests'\), where\('userId', '==', currentUser\.uid\)\)/g, "query(collection(db, 'labTests'), where('patientEmail', '==', currentUser.email || '___'))");
    context = context.replace(/query\(collection\(db, 'medications'\), where\('userId', '==', currentUser\.uid\)\)/g, "query(collection(db, 'medications'), where('patientEmail', '==', currentUser.email || '___'))");
    context = context.replace(/query\(collection\(db, 'doctorQuestions'\), where\('userId', '==', currentUser\.uid\)\)/g, "query(collection(db, 'doctorQuestions'), where('patientEmail', '==', currentUser.email || '___'))");
    context = context.replace(/query\(collection\(db, 'doctorAdvices'\), where\('userId', '==', currentUser\.uid\)\)/g, "query(collection(db, 'doctorAdvices'), where('patientEmail', '==', currentUser.email || '___'))");
    context = context.replace(/query\(collection\(db, 'familyMembers'\), where\('userId', '==', currentUser\.uid\)\)/g, "query(collection(db, 'familyMembers'), where('patientEmail', '==', currentUser.email || '___'))");
    context = context.replace(/query\(collection\(db, 'medicationLogs'\), where\('userId', '==', currentUser\.uid\)\)/g, "query(collection(db, 'medicationLogs'), where('patientEmail', '==', currentUser.email || '___'))");
    context = context.replace(/query\(collection\(db, 'vaccines'\), where\('userId', '==', currentUser\.uid\)\)/g, "query(collection(db, 'vaccines'), where('patientEmail', '==', currentUser.email || '___'))");

    // Replace filters for views
    context = context.replace("? allBP.filter(b => b.userId === currentTargetUserId)", "? allBP.filter(b => b.userId === currentTargetUserId || b.patientEmail === currentUser?.email)");
    context = context.replace("? allGlucose.filter(g => g.userId === currentTargetUserId)", "? allGlucose.filter(g => g.userId === currentTargetUserId || (g as any).patientEmail === currentUser?.email)");
    context = context.replace("? allLabs.filter(l => l.userId === currentTargetUserId)", "? allLabs.filter(l => l.userId === currentTargetUserId || (l as any).patientEmail === currentUser?.email)");
    context = context.replace("? allMeds.filter(m => m.userId === currentTargetUserId)", "? allMeds.filter(m => m.userId === currentTargetUserId || (m as any).patientEmail === currentUser?.email)");
    context = context.replace("? allVaccines.filter(v => v.userId === currentTargetUserId)", "? allVaccines.filter(v => v.userId === currentTargetUserId || (v as any).patientEmail === currentUser?.email)");
    context = context.replace("? allAdvices.filter(a => a.userId === currentTargetUserId)", "? allAdvices.filter(a => a.userId === currentTargetUserId || (a as any).patientEmail === currentUser?.email)");
    context = context.replace("? allBMI.filter(b => b.userId === currentTargetUserId)", "? allBMI.filter(b => b.userId === currentTargetUserId || (b as any).patientEmail === currentUser?.email)");
    context = context.replace("? allQuestions.filter(q => q.userId === currentTargetUserId)", "? allQuestions.filter(q => q.userId === currentTargetUserId || (q as any).patientEmail === currentUser?.email)");
    context = context.replace("? allMedLogs.filter(m => m.userId === currentTargetUserId)", "? allMedLogs.filter(m => m.userId === currentTargetUserId || (m as any).patientEmail === currentUser?.email)");

    // Add patientEmail to new record creation
    context = context.replace(
        "const newRecord = {\n      ...data,\n      userId: targetUid,\n      patientName: data.patientName || selectedPatient?.displayName || profile?.displayName || 'လူနာ',\n      createdAt: new Date().toISOString(),\n    };", // addVaccineRecord
        "const newRecord = {\n      ...data,\n      userId: targetUid,\n      patientName: data.patientName || selectedPatient?.displayName || profile?.displayName || 'လူနာ',\n      patientEmail: (data as any).patientEmail || profile?.email || currentUser?.email || '',\n      createdAt: new Date().toISOString(),\n    };"
    );
    context = context.replace(
        "const newMember = {\n      ...member,\n      userId: currentUser.uid,\n      avatarColor: member.gender === 'female' ? 'bg-rose-600' : 'bg-emerald-600',\n    };", // addFamilyMember
        "const newMember = {\n      ...member,\n      userId: currentUser.uid,\n      patientEmail: currentUser.email || '',\n      avatarColor: member.gender === 'female' ? 'bg-rose-600' : 'bg-emerald-600',\n    };"
    );
    context = context.replace(
        "const newLog: Omit<MedicationLog, 'id'> = {\n        userId: targetUid,\n        medicationId,\n        medicationName: medName || 'Medication',\n        date: dateStr,\n        doseIndex,\n        taken,\n        takenAt: taken ? new Date().toISOString() : undefined,\n        createdAt: new Date().toISOString(),\n      };", // toggleMedicationDoseTaken
        "const newLog: Omit<MedicationLog, 'id'> = {\n        userId: targetUid,\n        medicationId,\n        medicationName: medName || 'Medication',\n        date: dateStr,\n        doseIndex,\n        taken,\n        takenAt: taken ? new Date().toISOString() : undefined,\n        patientEmail: profile?.email || currentUser?.email || '',\n        createdAt: new Date().toISOString(),\n      };"
    );

    fs.writeFileSync(contextPath, context, 'utf8');
    console.log('✅ HealthDataContext.tsx updated for Email-based fetching and creation.');
  }

  // 3. Deploy Firestore Rules
  console.log('🚀 Deploying Firestore Rules...');
  execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });

  // 4. Build & Test
  console.log('🔨 Building the app...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful! No errors.');

  // 5. Git Push
  console.log('📤 Pushing to GitHub...');
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "fix: fetch and create user data using patientEmail instead of userId"', { stdio: 'inherit' });
  execSync('git push', { stdio: 'inherit' });
  console.log('✅ Push successful!');

} catch (error) {
  console.error('❌ Process failed during build or push. Aborting to prevent errors.');
  console.error(error.message);
} finally {
  // 6. Cleanup (.cjs file delete)
  if (fs.existsSync(scriptPath)) {
    fs.unlinkSync(scriptPath);
    console.log('🧹 Cleaned up fix_user_data_final.cjs');
  }
}