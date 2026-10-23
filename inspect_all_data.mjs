import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

const TARGET_EMAIL = 'khunthanshwe@gmail.com';
const TARGET_UID = 'dreycbhlDacuoQxjCgEsrNc2LjU2';

async function inspectAllData() {
  console.log('==================================================');
  console.log(`🔍 DEEP INSPECTION FOR: ${TARGET_EMAIL} / ${TARGET_UID}`);
  console.log('==================================================\n');

  const collections = [
    'vitals', 'glucose', 'bmi', 'labTests', 'medications', 
    'familyMembers', 'doctorAdvices', 'doctorQuestions', 'vaccines', 'medicationLogs'
  ];

  try {
    for (const colName of collections) {
      console.log(`--- 📂 COLLECTION: ${colName} ---`);
      const snap = await getDocs(collection(db, colName));
      
      let foundCount = 0;
      let totalCount = snap.size;
      
      snap.forEach((doc) => {
        const data = doc.data();
        // သင့် UID သို့မဟုတ် Email ပါလား စစ်ဆေးခြင်း
        if (data.userId === TARGET_UID || data.patientEmail === TARGET_EMAIL || data.userEmail === TARGET_EMAIL) {
          foundCount++;
          console.log(`✅ FOUND MATCH! (Doc ID: ${doc.id})`);
          console.log(`   userId: ${data.userId}`);
          console.log(`   patientEmail: ${data.patientEmail}`);
          console.log(`   userEmail: ${data.userEmail}`);
          // အဓိက အချက်အလက်တွေကို ပြမယ်
          if (colName === 'bmi') console.log(`   BMI Data: weight=${data.weightKg}, height=${data.heightCm}, bmi=${data.bmi}`);
          if (colName === 'vitals') console.log(`   BP Data: sys=${data.systolic}, dia=${data.diastolic}`);
          if (colName === 'glucose') console.log(`   Glucose Data: val=${data.glucoseValue || data.value}`);
          console.log('   ---');
        }
      });

      if (foundCount === 0) {
        console.log(`❌ No data found for ${TARGET_EMAIL} in this collection. (Total records in collection: ${totalCount})`);
      } else {
        console.log(`🎉 Total ${foundCount} records found for this user in ${colName}.`);
      }
      console.log('');
    }
  } catch (error) {
    console.error('❌ Error inspecting data:', error.message);
  }
}

inspectAllData();