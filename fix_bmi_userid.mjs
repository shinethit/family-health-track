import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

const TARGET_EMAIL = 'khunthanshwe@gmail.com';
const NEW_UID = 'dreycbhlDacuoQxjCgEsrNc2LjU2';

async function fixData() {
  console.log('==================================================');
  console.log(`🔧 FIXING DATA FOR: ${TARGET_EMAIL}`);
  console.log(`   Setting userId to: ${NEW_UID}`);
  console.log('==================================================\n');

  try {
    console.log('--- 📂 COLLECTION: bmi ---');
    const snap = await getDocs(collection(db, 'bmi'));
    let count = 0;

    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      // Check if this document belongs to Khun Than Shwe
      if (data.patientName === 'Khun Than Shwe') {
        console.log(`📄 Found BMI record for Khun Than Shwe (ID: ${docSnap.id})`);
        console.log(`   Old userId: ${data.userId}`);
        
        // Update the document
        await updateDoc(doc(db, 'bmi', docSnap.id), {
          userId: NEW_UID,
          patientEmail: TARGET_EMAIL,
          userEmail: TARGET_EMAIL
        });
        
        console.log(`✅ Updated to userId: ${NEW_UID}, patientEmail: ${TARGET_EMAIL}`);
        count++;
      }
    }

    if (count === 0) {
      console.log('❌ No matching BMI records found for Khun Than Shwe.');
    } else {
      console.log(`\n🎉 Successfully updated ${count} BMI record(s).`);
    }

    console.log('\n==================================================');
    console.log('✅ FIX COMPLETE!');
    console.log('==================================================');

  } catch (error) {
    console.error('❌ Error fixing data:', error.message);
  }
}

fixData();