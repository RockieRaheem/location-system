const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const csvFilePath = path.resolve('../../ug2010.csv');

let rowCount = 0;

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row) => {
    rowCount++;
    if (rowCount === 2) {
      console.log('Column names:');
      console.log(Object.keys(row));
      console.log('\nRow 2 values:');
      console.log(JSON.stringify(row, null, 2));
      process.exit(0);
    }
  });
