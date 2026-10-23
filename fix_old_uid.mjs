import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

const NEW_UID = 'dreycbhlDacuoQxjCgEsrNc2LjU2';
const NEW_EMAIL = 'khunthanshwe@gmail.com';
const OLD_UID = 'user-1790442426703-p8ilq'; // သင့် Data အဟောင်းရဲ့ UID

async function fixData() {
  console.log('==================================================');
  console.log(`🔧 FIXING DATA BY OLD UID: ${OLD_UID}`);
  console.log(`   Setting userId to: ${NEW_UID}`);
  console.log(`   Setting patientEmail to: ${NEW_EMAIL}`);
  console.log('==================================================\n');

  const collections = ['vitals', 'glucose', 'bmi', 'labTests', 'medications', 'familyMembers', 'doctorAdvices', 'doctorQuestions', 'vaccines', 'medicationLogs'];
  let totalFixed = 0;

  try {
    for (const colName of collections) {
      console.log(`--- 📂 COLLECTION: ${colName} ---`);
      const snap = await getDocs(collection(db, colName));
      
      if (snap.empty) {
        console.log(`⚠️ Collection is empty.`);
        continue;
      }

      let fixedInCol = 0;

      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        
        // UID အဟောင်းနဲ့ ကိုက်ညီရင် (သို့) နာမည်နဲ့ ကိုက်ညီရင် Update လုပ်မယ်
        if (
          data.userId === OLD_UID || 
          data.patientName === 'Khun Than Shwe' || 
          data.userName === 'Khun Than Shwe' ||
          data.patientEmail === NEW_EMAIL
        ) {
          await updateDoc(doc(db, colName, docSnap.id), {
            userId: NEW_UID,
            patientEmail: NEW_EMAIL,
            userEmail: NEW_EMAIL
          });
          fixedInCol++;
          totalFixed++;
        }
      }

      if (fixedInCol > 0) {
        console.log(`✅ Fixed ${fixedInCol} records.`);
      } else {
        console.log(`- No records found for this user.`);
      }
    }

    console.log('\n==================================================');
    console.log(`🎉 SUCCESS! Total records fixed: ${totalFixed}`);
    console.log('==================================================');

  } catch (error) {
    console.error('❌ Error fixing data:', error.message);
  }
}

fixData();