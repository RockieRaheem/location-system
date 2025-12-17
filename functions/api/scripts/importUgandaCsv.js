import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import admin from 'firebase-admin';
import { config } from '../firebaseConfig.js';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(config),
  });
}
const db = admin.firestore();

const csvFilePath = path.resolve('../../ug2010.csv');

const districts = {};

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row) => {
    const district = row['District']?.trim();
    const county = row['Constituency']?.trim();
    const subcounty = row['Subcounty/\r\nDivision']?.trim();
    const parish = row['Parish/Ward']?.trim();
    const village = row['Village/Cell']?.trim();
    if (district) {
      if (!districts[district]) districts[district] = { counties: {} };
      if (county) {
        if (!districts[district].counties[county]) districts[district].counties[county] = { subcounties: {} };
        if (subcounty) {
          if (!districts[district].counties[county].subcounties[subcounty]) districts[district].counties[county].subcounties[subcounty] = { parishes: {} };
          if (parish) {
            if (!districts[district].counties[county].subcounties[subcounty].parishes[parish]) districts[district].counties[county].subcounties[subcounty].parishes[parish] = { villages: [] };
            if (village) {
              districts[district].counties[county].subcounties[subcounty].parishes[parish].villages.push(village);
            }
          }
        }
      }
    }
  })
  .on('end', async () => {
    // Upload to Firestore
    for (const [district, dData] of Object.entries(districts)) {
      await db.collection('uganda_districts').doc(district).set({
        counties: dData.counties
      });
    }
    console.log('Uganda hierarchy imported to Firestore!');
    process.exit(0);
  });
