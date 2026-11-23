const fs = require('fs');
const path = require('path');

function walk(dir) {
  let res = [];
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      if (f !== 'node_modules' && f !== '.git') res = res.concat(walk(p));
    } else if (f.endsWith('.html')) res.push(p);
  });
  return res;
}

const files = walk('d:/SOFTWARE/laragon/www/siBisaHadir.v2');
let updatedCount = 0;

files.forEach(p => {
  let content = fs.readFileSync(p, 'utf8');
  if (content.includes('layout.js?v=20261119_v1')) {
    content = content.replace(/layout\.js\?v=20261119_v1/g, 'layout.js?v=20261123_v1');
    fs.writeFileSync(p, content, 'utf8');
    updatedCount++;
  }
});

console.log(`Updated ${updatedCount} HTML files to layout.js?v=20261123_v1`);
