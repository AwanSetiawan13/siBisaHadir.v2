const fs = require('fs');
const path = require('path');

function walk(dir) {
  let files = [];
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        files = files.concat(walk(full));
      }
    } else if (file.endsWith('.html')) {
      files.push(full);
    }
  });
  return files;
}

const htmlFiles = walk('.');
let count = 0;
htmlFiles.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  let changed = false;
  if (c.includes('layout.js?v=')) {
    const next = c.replace(/layout\.js\?v=[a-zA-Z0-9_]+/g, 'layout.js?v=20261123_v4');
    if (next !== c) { c = next; changed = true; }
  }
  if (!c.includes('content="notranslate"')) {
    const next = c.replace(/<head>/i, '<head>\n  <meta name="google" content="notranslate" />');
    if (next !== c) { c = next; changed = true; }
  }
  if (/<html\s+lang="id"\s*>/i.test(c)) {
    const next = c.replace(/<html\s+lang="id"\s*>/i, '<html lang="id" translate="no" class="notranslate">');
    if (next !== c) { c = next; changed = true; }
  }
  if (changed) {
    fs.writeFileSync(f, c, 'utf8');
    count++;
  }
});
console.log('Updated', count, 'HTML files with notranslate meta, html translate=no, and v20261123_v4.');
