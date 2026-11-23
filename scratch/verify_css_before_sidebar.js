const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const BASE_DIR = 'd:/SOFTWARE/laragon/www/siBisaHadir.v2';
const PORT = 9490;

async function verifySidebar() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=' + PORT,
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1440,900',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1200));

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
    const toUrl = (rel) => 'file:///' + path.join(BASE_DIR, rel).replace(/\\/g, '/');

    // 1. Check on accounting_pendapatan.html (another module, expanding Laporan Keuangan)
    await send('Page.navigate', { url: toUrl('Accounting/operasional/accounting_pendapatan.html') });
    await new Promise(r => setTimeout(r, 900));

    const inactiveCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        // Expand Laporan Keuangan group on Pendapatan page so we can see Profit Project & Brand when inactive
        const hdr = document.querySelector('.app-group-header[data-target="m-acc-laporan-keuangan"]');
        if (hdr && hdr.getAttribute('data-expanded') !== 'true') hdr.click();

        const link = document.querySelector('#app-sidebar a[href*="accounting_profit_project_brand.html"]');
        const span = link ? link.querySelector('.app-menu-label') : null;
        // Simulate Google Translate trying to inject <font>Proyek Keuntungan & Merek</font> into span
        if (span) {
          span.innerHTML = '<font>Proyek Keuntungan & Merek</font>';
        }
        return new Promise(resolve => {
          setTimeout(() => {
            const beforeCs = span ? window.getComputedStyle(span, '::before') : null;
            resolve({
              page: 'accounting_pendapatan.html (Inactive state)',
              domTextContent: span ? span.textContent : null,
              cssBeforeContent: beforeCs ? beforeCs.content : null,
              fontWeight: beforeCs ? beforeCs.fontWeight : null,
              color: beforeCs ? beforeCs.color : null,
              href: link ? link.getAttribute('href') : null
            });
          }, 80);
        });
      })()`,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Check 1:', JSON.stringify(inactiveCheck.result?.result?.value, null, 2));

    const shot1 = await send('Page.captureScreenshot', {
      format: 'png',
      clip: { x: 0, y: 0, width: 260, height: 700, scale: 1 }
    });
    fs.writeFileSync('C:/Users/ASUS/.gemini/antigravity/brain/e681e664-7bfb-44ca-a5f1-3d0986857d3b/sidebar_profit_from_other_module.png', Buffer.from(shot1.result.data, 'base64'));

    // 2. Check on accounting_profit_project_brand.html (Active state)
    await send('Page.navigate', { url: toUrl('Accounting/laporan_keuangan/accounting_profit_project_brand.html') });
    await new Promise(r => setTimeout(r, 900));

    const activeCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const link = document.querySelector('#app-sidebar a[href*="accounting_profit_project_brand.html"]');
        const span = link ? link.querySelector('.app-menu-label') : null;
        const beforeCs = span ? window.getComputedStyle(span, '::before') : null;
        return {
          page: 'accounting_profit_project_brand.html (Active state)',
          domTextContent: span ? span.textContent : null,
          cssBeforeContent: beforeCs ? beforeCs.content : null,
          fontWeight: beforeCs ? beforeCs.fontWeight : null,
          color: beforeCs ? beforeCs.color : null
        };
      })()`,
      returnByValue: true
    });
    console.log('Check 2:', JSON.stringify(activeCheck.result?.result?.value, null, 2));

    ws.close();
    chrome.kill();
  } catch (e) {
    console.error(e);
    chrome.kill();
  }
}

verifySidebar();
