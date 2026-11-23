const fs = require('fs');
const content = fs.readFileSync('assets/js/layout.js', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('renderAppSidebar') || l.includes('DOMContentLoaded')) {
    console.log((i+1) + ': ' + l.trim());
  }
});
