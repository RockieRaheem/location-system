// Node.js script to convert Kenya CSV to hierarchical JSON
const fs = require('fs');
const path = require('path');
const csvPath = path.join(__dirname, 'csv-Kenya-Counties-Constituencies-Wards.csv');
const outPath = path.join(__dirname, '..', 'mobile-app', 'src', 'data', 'kenya_counties.json');

function parseCSVLine(line) {
  // Split by comma, but handle commas in names
  // (no quotes in this file, so simple split works)
  return line.split(',');
}

const raw = fs.readFileSync(csvPath, 'utf8');
const lines = raw.trim().split(/\r?\n/);
console.log('Total lines:', lines.length);
console.log('Header:', lines[0]);
console.log('First data line:', lines[1]);
const header = lines[0].split(',');
const data = lines.slice(1);

const counties = {};

for (const line of data) {
  const [countyId, countyName, constituencyId, constituencyName, wardId, wardName] = parseCSVLine(line);
  if (!counties[countyName]) {
    counties[countyName] = {
      id: countyId,
      name: countyName,
      constituencies: {}
    };
  }
  const county = counties[countyName];
  if (!county.constituencies[constituencyName]) {
    county.constituencies[constituencyName] = {
      id: constituencyId,
      name: constituencyName,
      wards: []
    };
  }
  const constituency = county.constituencies[constituencyName];
  constituency.wards.push({
    id: wardId,
    name: wardName
  });
}

// Convert nested objects to arrays
const result = Object.values(counties).map(county => ({
  id: county.id,
  name: county.name,
  constituencies: Object.values(county.constituencies)
}));

console.log('Counties parsed:', result.length);
if (result.length > 0) {
  console.log('First county:', JSON.stringify(result[0], null, 2));
}

fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
console.log('Kenya counties JSON written to', outPath);
