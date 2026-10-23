import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

// စစ်ဆေးချင်တဲ့ Collection တွေ
const collectionsToCheck = ['vitals', 'bmi', 'medications', 'glucose', 'labTests'];

async function dumpAllDocs() {
  console.log('==================================================');
  console.log('📂 DUMPING ALL DOCUMENTS (WITHOUT FILTERING)');
  console.log('==================================================\n');

  try {
    for (const colName of collectionsToCheck) {
      console.log(`\n--- 📂 COLLECTION: ${colName} ---`);
      const snap = await getDocs(collection(db, colName));
      
      if (snap.empty) {
        console.log(`⚠️ Collection is empty.`);
        continue;
      }

      let count = 0;
      snap.forEach((doc) => {
        count++;
        const data = doc.data();
        
        // သက်ဆိုင်ရာ Field တွေကို ရှာမယ်
        const userId = data.userId || '(none)';
        const patientEmail = data.patientEmail || data.userEmail || data.email || '(none)';
        const patientName = data.patientName || data.userName || '(none)';
        
        console.log(`📄 Doc ${count} (ID: ${doc.id})`);
        console.log(`   - userId: ${userId}`);
        console.log(`   - patientEmail: ${patientEmail}`);
        console.log(`   - patientName: ${patientName}`);
        
        // BMI ဆိုရင် အပိုအချက်အလက်တွေ ပြမယ်
        if (colName === 'bmi') {
          console.log(`   - weightKg: ${data.weightKg}, heightCm: ${data.heightCm}, bmi: ${data.bmi}`);
        }
        // Vitals ဆိုရင်
        if (colName === 'vitals') {
          console.log(`   - BP: ${data.systolic}/${data.diastolic}`);
        }
        // Medications ဆိုရင်
        if (colName === 'medications') {
          console.log(`   - Med Name: ${data.name}`);
        }
        console.log('   ---');
      });
      console.log(`✅ Total ${count} documents in ${colName}.`);
    }
  } catch (error) {
    console.error('❌ Error dumping data:', error.message);
  }
}

dumpAllDocs();