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

const versions = new Set();
walk('d:/SOFTWARE/laragon/www/siBisaHadir.v2').forEach(p => {
  const content = fs.readFileSync(p, 'utf8');
  const m = content.match(/layout\.js(\?[^"']*)?/g);
  if (m) m.forEach(v => versions.add(v));
});

console.log('Layout versions:', Array.from(versions));
