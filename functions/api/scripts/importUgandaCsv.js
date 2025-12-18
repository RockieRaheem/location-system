const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const admin = require('firebase-admin');
const { config } = require('../firebaseConfig.js');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(config),
  });
}
const db = admin.firestore();

const csvFilePath = path.resolve('../../ug2010.csv');

const districts = {};

// Keep track of current context for rows with empty cells
let currentDistrict = null;
let currentConstituency = null;
let currentSubdivision = null;
let currentParish = null;

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row) => {
    const district = row['District']?.trim();
    const constituency = row['Constituency']?.trim();
    const subdivision = row['Subcounty/\rDivision']?.trim();  // Note: \r not \r\n
    const parish = row['Parish/Ward']?.trim();
    const village = row['Village/Cell']?.trim();
    
    // Update current context only if values are present
    if (district && district.length > 0) currentDistrict = district;
    if (constituency && constituency.length > 0) currentConstituency = constituency;
    if (subdivision && subdivision.length > 0) currentSubdivision = subdivision;
    if (parish && parish.length > 0) currentParish = parish;
    
    // Build hierarchy using current context
    if (currentDistrict) {
      if (!districts[currentDistrict]) districts[currentDistrict] = { constituencies: {} };
      
      if (currentConstituency) {
        if (!districts[currentDistrict].constituencies[currentConstituency]) {
          districts[currentDistrict].constituencies[currentConstituency] = { subdivisions: {} };
        }
        
        if (currentSubdivision) {
          if (!districts[currentDistrict].constituencies[currentConstituency].subdivisions[currentSubdivision]) {
            districts[currentDistrict].constituencies[currentConstituency].subdivisions[currentSubdivision] = { parishes: {} };
          }
          
          if (currentParish) {
            if (!districts[currentDistrict].constituencies[currentConstituency].subdivisions[currentSubdivision].parishes[currentParish]) {
              districts[currentDistrict].constituencies[currentConstituency].subdivisions[currentSubdivision].parishes[currentParish] = { villages: [] };
            }
            
            if (village && village.length > 0) {
              districts[currentDistrict].constituencies[currentConstituency].subdivisions[currentSubdivision].parishes[currentParish].villages.push(village);
            }
          }
        }
      }
    }
  })
  .on('end', async () => {
    // Upload to Firestore - Sort districts alphabetically
    const sortedDistricts = Object.keys(districts).sort();
    
    for (const district of sortedDistricts) {
      const dData = districts[district];
      await db.collection('uganda_districts').doc(district).set({
        constituencies: dData.constituencies
      });
      console.log(`Imported: ${district}`);
    }
    console.log('\nUganda hierarchy imported to Firestore!');
    process.exit(0);
  });
