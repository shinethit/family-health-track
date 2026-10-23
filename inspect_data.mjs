import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit, query } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function inspectData() {
  console.log('==================================================');
  console.log('🔍 INSPECTING DATABASE DATA (READ-ONLY)');
  console.log('==================================================\n');

  try {
    // 1. Check Users Collection
    console.log('--- 👤 USERS COLLECTION (First 3) ---');
    const usersSnap = await getDocs(query(collection(db, 'users'), limit(3)));
    if (usersSnap.empty) {
      console.log('⚠️ Users collection is empty.');
    } else {
      usersSnap.forEach((doc) => {
        const data = doc.data();
        console.log(`UID: ${doc.id}`);
        console.log(`Email: ${data.email}`);
        console.log(`Name: ${data.displayName}`);
        console.log('---');
      });
    }

    // 2. Check Vitals Collection
    console.log('\n--- 🩸 VITALS COLLECTION (First 3) ---');
    const vitalsSnap = await getDocs(query(collection(db, 'vitals'), limit(3)));
    if (vitalsSnap.empty) {
      console.log('⚠️ Vitals collection is empty.');
    } else {
      vitalsSnap.forEach((doc) => {
        const data = doc.data();
        console.log(`Doc ID: ${doc.id}`);
        console.log(`userId: ${data.userId}`);
        console.log(`patientEmail: ${data.patientEmail}`);
        console.log(`userEmail: ${data.userEmail}`);
        console.log(`patientName: ${data.patientName}`);
        console.log('---');
      });
    }

    // 3. Check Current Auth User (cannot get from here directly, but we know the UID)
    console.log('\n==================================================');
    console.log('💡 Note: Your logged-in Email is: khunthanshwe@gmail.com');
    console.log('==================================================');
    
  } catch (error) {
    console.error('❌ Error inspecting data:', error.message);
  }
}

inspectData();