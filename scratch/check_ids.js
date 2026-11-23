const fs = require('fs');
const content = fs.readFileSync('Accounting/operasional/accounting_tagihan_berkala.html', 'utf8');
const script = fs.readFileSync('scratch/new_script.js', 'utf8');

const idRegex = /document\.getElementById\('([^']+)'\)/g;
let m;
const missing = [];
while ((m = idRegex.exec(script)) !== null) {
  const id = m[1];
  const target = 'id="' + id + '"';
  if (!content.includes(target)) {
    missing.push(id);
  } else {
    console.log(id + ': OK');
  }
}

console.log('=== MISSING IDS ===');
console.log(missing);
