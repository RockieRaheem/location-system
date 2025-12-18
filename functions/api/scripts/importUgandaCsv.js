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
    const constituency = row['Constituency']?.trim();
    const subdivision = row['Subcounty/\r\nDivision']?.trim();
    const parish = row['Parish/Ward']?.trim();
    const village = row['Village/Cell']?.trim();
    
    if (district) {
      if (!districts[district]) districts[district] = { constituencies: {} };
      if (constituency) {
        if (!districts[district].constituencies[constituency]) {
          districts[district].constituencies[constituency] = { subdivisions: {} };
        }
        if (subdivision) {
          if (!districts[district].constituencies[constituency].subdivisions[subdivision]) {
            districts[district].constituencies[constituency].subdivisions[subdivision] = { parishes: {} };
          }
          if (parish) {
            if (!districts[district].constituencies[constituency].subdivisions[subdivision].parishes[parish]) {
              districts[district].constituencies[constituency].subdivisions[subdivision].parishes[parish] = { villages: [] };
            }
            if (village && village.length > 0) {
              districts[district].constituencies[constituency].subdivisions[subdivision].parishes[parish].villages.push(village);
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
        constituencies: dData.constituencies
      });
    }
    console.log('Uganda hierarchy imported to Firestore!');
    process.exit(0);
  });
