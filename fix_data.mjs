import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import fs from 'fs';

// 1. Load Firebase Config
const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function runMigration() {
  console.log('🚀 Starting Data Migration (Matching by Email)...');

  try {
    // 2. Fetch all users to map Email -> UID
    console.log('📋 Fetching users from database...');
    const usersSnap = await getDocs(collection(db, 'users'));
    const emailToUid = {};
    
    usersSnap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.email) {
        emailToUid[data.email.toLowerCase()] = docSnap.id;
      }
    });
    console.log(`✅ Found ${Object.keys(emailToUid).length} users.`);

    // 3. List of collections to migrate
    const collections = ['vitals', 'glucose', 'bmi', 'labTests', 'medications', 'familyMembers', 'doctorAdvices', 'doctorQuestions', 'vaccines'];
    let totalMigrated = 0;

    for (const colName of collections) {
      console.log(`🔍 Checking ${colName}...`);
      const snap = await getDocs(collection(db, colName));
      let migratedInCol = 0;

      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        const docEmail = (data.patientEmail || data.userEmail || data.email || '').toLowerCase();
        
        // If the document has an email, find the correct UID and update
        if (docEmail && emailToUid[docEmail]) {
          const correctUid = emailToUid[docEmail];
          
          if (data.userId !== correctUid) {
            await updateDoc(doc(db, colName, docSnap.id), { userId: correctUid });
            migratedInCol++;
            totalMigrated++;
          }
        }
      }
      console.log(`   ✅ Migrated ${migratedInCol} records in ${colName}`);
    }

    console.log(`\n🎉 Migration Complete! Total records fixed: ${totalMigrated}`);
    console.log('အခုဆိုရင် User အားလုံး သူတို့ Data တွေကို ပြန်မြင်ရပါပြီ။');
    
  } catch (error) {
    console.error('❌ Error during migration:', error.message);
  }
}

runMigration();