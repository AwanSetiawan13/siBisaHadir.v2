const fs = require('fs');
const content = fs.readFileSync('Accounting/operasional/accounting_tagihan_berkala.html', 'utf8');
const lines = content.split('\n');

['calendar', 'export', 'print', 'popover', 'action', 'search'].forEach(term => {
  console.log('=== TERM: ' + term + ' ===');
  lines.forEach((l, i) => {
    if (l.toLowerCase().includes(term) && l.includes('id=')) {
      console.log((i+1) + ': ' + l.trim());
    }
  });
});
