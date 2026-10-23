import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function fixAllUsersData() {
  console.log('==================================================');
  console.log('🚀 STARTING GLOBAL DATA FIX (ALL USERS)');
  console.log('==================================================\n');

  try {
    // 1. Fetch all users to create Email -> UID and Name -> UID mappings
    console.log('📋 Fetching users list...');
    const usersSnap = await getDocs(collection(db, 'users'));
    const emailToUid = {};
    const nameToUid = {};

    usersSnap.forEach(docSnap => {
      const data = docSnap.data();
      if (data.email) {
        emailToUid[data.email.toLowerCase().trim()] = docSnap.id;
      }
      if (data.displayName) {
        nameToUid[data.displayName.trim()] = docSnap.id;
      }
    });

    console.log(`✅ Found ${Object.keys(emailToUid).length} unique emails.`);
    console.log(`✅ Found ${Object.keys(nameToUid).length} unique names.\n`);

    const collections = [
      'vitals', 'glucose', 'bmi', 'labTests', 'medications', 
      'familyMembers', 'doctorAdvices', 'doctorQuestions', 'vaccines', 'medicationLogs'
    ];
    
    let totalFixed = 0;

    // 2. Loop through all collections
    for (const colName of collections) {
      console.log(`--- 📂 Checking COLLECTION: ${colName} ---`);
      const snap = await getDocs(collection(db, colName));
      
      if (snap.empty) {
        console.log(`   ⚠️ Empty.`);
        continue;
      }

      let fixedInCol = 0;

      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        let correctUid = null;
        let matchedEmail = null;

        // Try to match by patientEmail first
        if (data.patientEmail) {
          const emailKey = data.patientEmail.toLowerCase().trim();
          if (emailToUid[emailKey]) {
            correctUid = emailToUid[emailKey];
            matchedEmail = emailKey;
          }
        }
        
        // If no email match, try userEmail
        if (!correctUid && data.userEmail) {
          const emailKey = data.userEmail.toLowerCase().trim();
          if (emailToUid[emailKey]) {
            correctUid = emailToUid[emailKey];
            matchedEmail = emailKey;
          }
        }

        // If still no match, try patientName / userName
        if (!correctUid) {
          const nameStr = data.patientName || data.userName;
          if (nameStr && nameToUid[nameStr.trim()]) {
            correctUid = nameToUid[nameStr.trim()];
            // Find email for this UID to update the record
            for (const [e, uid] of Object.entries(emailToUid)) {
              if (uid === correctUid) {
                matchedEmail = e;
                break;
              }
            }
          }
        }

        // 3. If a correct UID is found and differs from current, update it
        if (correctUid && data.userId !== correctUid) {
          await updateDoc(doc(db, colName, docSnap.id), {
            userId: correctUid,
            patientEmail: matchedEmail || data.patientEmail || data.userEmail || null
          });
          fixedInCol++;
          totalFixed++;
        }
      }

      if (fixedInCol > 0) {
        console.log(`   ✅ Fixed ${fixedInCol} records.`);
      } else {
        console.log(`   - No records needed fixing.`);
      }
    }

    console.log('\n==================================================');
    console.log(`🎉 MIGRATION COMPLETE!`);
    console.log(`Total records fixed across all users: ${totalFixed}`);
    console.log('==================================================');

  } catch (error) {
    console.error('❌ Error during global fix:', error.message);
  }
}

fixAllUsersData();