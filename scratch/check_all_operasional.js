const fs = require('fs');
const path = require('path');

const dir = 'Accounting/operasional';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  const hasLayout = content.includes('layout.js');
  const hasAppSidebar = content.includes('id="app-sidebar"') || content.includes("id='app-sidebar'");
  const hasSidebarTag = content.includes('<aside');
  console.log(`${f.padEnd(45)}: layout=${hasLayout}, app-sidebar=${hasAppSidebar}, aside=${hasSidebarTag}`);
});
