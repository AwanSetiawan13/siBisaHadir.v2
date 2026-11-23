const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const BASE_DIR = 'd:/SOFTWARE/laragon/www/siBisaHadir.v2';
const PORT = 9468;

async function verifyProfitProjectBrandSidebar() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=' + PORT,
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1440,900',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  try {
    const list = await (await fetch('http://localhost:' + PORT + '/json/list')).json();
    const ws = new WebSocket(list[0].webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    function send(m, p = {}) {
      return new Promise(res => {
        const msgId = id++;
        const h = (e) => {
          const d = JSON.parse(e.data);
          if (d.id === msgId) { ws.removeEventListener('message', h); res(d); }
        };
        ws.addEventListener('message', h);
        ws.send(JSON.stringify({ id: msgId, method: m, params: p }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');

    const testUrl = 'file:///' + path.join(BASE_DIR, 'Accounting/laporan_keuangan/accounting_profit_project_brand.html').replace(/\\/g, '/');
    console.log('Navigating to:', testUrl);
    await send('Page.navigate', { url: testUrl });
    await new Promise(r => setTimeout(r, 1200));

    // Check menu state
    const evalRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const activeItem = document.querySelector('#app-sidebar .app-sub-item.is-active, #app-sidebar .app-nav-item.is-active');
        const laporanGroup = document.getElementById('m-acc-laporan-keuangan');
        const items = laporanGroup ? Array.from(laporanGroup.querySelectorAll('.app-sub-item')).map(a => a.textContent.trim()) : [];
        const isGroupExpanded = laporanGroup ? laporanGroup.classList.contains('is-expanded') : false;

        return {
          activeLabel: activeItem ? activeItem.textContent.trim() : null,
          isGroupExpanded: isGroupExpanded,
          laporanItems: items
        };
      })()`,
      returnByValue: true
    });

    console.log('Sidebar state:', JSON.stringify(evalRes.result?.result?.value, null, 2));

    // Take screenshot of sidebar with Laporan Keuangan open and Profit Project & Brand active
    const ss = await send('Page.captureScreenshot');
    fs.writeFileSync('C:/Users/ASUS/.gemini/antigravity/brain/e681e664-7bfb-44ca-a5f1-3d0986857d3b/sidebar_profit_project_brand.png', Buffer.from(ss.result.data, 'base64'));
    console.log('Screenshot saved to sidebar_profit_project_brand.png');

    ws.close();
    chrome.kill();
  } catch (e) {
    console.error(e);
    chrome.kill();
  }
}

verifyProfitProjectBrandSidebar();
