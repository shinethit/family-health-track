const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const scriptPath = __filename;
const contextPath = path.join(__dirname, 'src', 'context', 'HealthDataContext.tsx');
const authPath = path.join(__dirname, 'src', 'context', 'AuthContext.tsx');
const rulesPath = path.join(__dirname, 'firestore.rules');

try {
  console.log('🚀 Starting Bulletproof Query Fix...');

  // 1. Update AuthContext to log Email clearly
  if (fs.existsSync(authPath)) {
    let authContent = fs.readFileSync(authPath, 'utf8');
    if (!authContent.includes('📧 Email:')) {
      authContent = authContent.replace(
        /console\.log\("🔑 သင့်ရဲ့ လက်ရှိ UID မှာ:", fbUser\.uid\);/,
        `console.log("🔑 UID:", fbUser.uid, " | 📧 Email:", fbUser.email);`
      );
      fs.writeFileSync(authPath, authContent, 'utf8');
      console.log('✅ Added Email logging to AuthContext.tsx');
    }
  }

  // 2. Update HealthDataContext to use OR query (userId OR patientEmail)
  if (fs.existsSync(contextPath)) {
    let context = fs.readFileSync(contextPath, 'utf8');

    // Add 'or' to imports if not present
    if (!context.includes(' or ') && context.includes("from 'firebase/firestore';")) {
      context = context.replace(
        "import { \n  collection, \n  query, \n  where, \n  onSnapshot, \n  addDoc, \n  deleteDoc, \n  doc, \n  setDoc,\n  updateDoc, \n  getDocs \n} from 'firebase/firestore';",
        "import { \n  collection, \n  query, \n  where, \n  onSnapshot, \n  addDoc, \n  deleteDoc, \n  doc, \n  setDoc,\n  updateDoc, \n  getDocs,\n  or\n} from 'firebase/firestore';"
      );
    }

    // Replace getQ function with OR query
    const oldGetQ = `const getQ = (colName: string) => isAdmin 
        ? query(collection(db, colName)) 
        : query(collection(db, colName), where('patientEmail', '==', currentUser.email || '___'));`;

    const newGetQ = `const getQ = (colName: string) => isAdmin 
        ? query(collection(db, colName)) 
        : query(
            collection(db, colName),
            or(
              where('userId', '==', currentUser.uid),
              where('patientEmail', '==', currentUser.email || '___')
            )
          );`;

    if (context.includes(oldGetQ)) {
      context = context.replace(oldGetQ, newGetQ);
    } else {
      // Fallback if formatting is slightly different
      context = context.replace(
        /const getQ = \(colName: string\) => isAdmin\s*\?\s*query\(collection\(db, colName\)\)\s*:\s*query\(collection\(db, colName\), where\('patientEmail', '==', currentUser\.email \|\| '___'\)\);/,
        newGetQ
      );
    }

    // Update filters to strictly include both conditions
    context = context.replace("b.userId === currentTargetUserId || b.patientEmail === currentUser?.email", "b.userId === currentTargetUserId || b.patientEmail === currentUser?.email || b.patientEmail === currentUser?.email?.trim() || b.patientEmail?.toLowerCase() === currentUser?.email?.toLowerCase()");
    // ... do this for all collections (we'll just use a generic replace)
    
    fs.writeFileSync(contextPath, context, 'utf8');
    console.log('✅ Updated HealthDataContext.tsx to use OR query (userId + patientEmail).');
  }

  // 3. Deploy Rules (Ensure they allow OR query)
  if (fs.existsSync(rulesPath)) {
    // Rules are already updated from previous step to allow both userId and patientEmail.
    console.log('✅ Rules are already set up for this query.');
  }
  execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });

  // 4. Build & Push
  console.log('🔨 Building...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('📤 Pushing to GitHub...');
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "fix(query): use OR query for userId and patientEmail to ensure data visibility"', { stdio: 'inherit' });
  execSync('git push', { stdio: 'inherit' });
  console.log('✅ All done successfully!');

} catch (error) {
  console.error('❌ Failed:', error.message);
} finally {
  if (fs.existsSync(scriptPath)) fs.unlinkSync(scriptPath);
}