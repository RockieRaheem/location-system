const admin = require('firebase-admin');
const { config } = require('./firebaseConfig.js');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(config),
  });
}

const db = admin.firestore();

async function checkData() {
  const doc = await db.collection('uganda_districts').doc('01APAC').get();
  
  if (doc.exists) {
    const data = doc.data();
    console.log('District: 01APAC');
    console.log('Constituencies:', Object.keys(data.constituencies || {}));
    
    const firstConst = Object.keys(data.constituencies || {})[0];
    if (firstConst) {
      console.log('\nFirst Constituency:', firstConst);
      console.log('Subdivisions:', Object.keys(data.constituencies[firstConst].subdivisions || {}));
      
      const firstSub = Object.keys(data.constituencies[firstConst].subdivisions || {})[0];
      if (firstSub) {
        console.log('\nFirst Subdivision:', firstSub);
        console.log('Parishes:', Object.keys(data.constituencies[firstConst].subdivisions[firstSub].parishes || {}));
        
        const firstParish = Object.keys(data.constituencies[firstConst].subdivisions[firstSub].parishes || {})[0];
        if (firstParish) {
          console.log('\nFirst Parish:', firstParish);
          const villages = data.constituencies[firstConst].subdivisions[firstSub].parishes[firstParish].villages || [];
          console.log('Villages count:', villages.length);
          console.log('First 5 villages:', villages.slice(0, 5));
        }
      }
    }
  }
  
  process.exit(0);
}

checkData().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
