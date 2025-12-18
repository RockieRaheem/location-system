const http = require('http');

http.get('http://localhost:4000/api/uganda/districts', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const districts = JSON.parse(data);
    console.log('Total districts:', districts.length);
    console.log('\nFirst 5 districts:');
    districts.slice(0, 5).forEach(d => {
      console.log('-', d.id);
    });
    console.log('\nChecking first district constituencies:');
    const first = districts[0];
    if (first.constituencies) {
      console.log('Has constituencies:', Object.keys(first.constituencies).length);
      console.log('First constituency:', Object.keys(first.constituencies)[0]);
    }
    process.exit(0);
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
