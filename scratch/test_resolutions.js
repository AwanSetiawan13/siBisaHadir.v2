const { spawn } = require('child_process');
const path = require('path');

async function testResolution(w, h) {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9479',
    '--no-sandbox',
    '--disable-gpu',
    `--window-size=${w},${h}`,
    'about:blank'
  ]);
  await new Promise(r => setTimeout(r, 1500));

  try {
    const list = await (await fetch('http://localhost:9479/json/list')).json();
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

    const testUrl = 'file:///d:/SOFTWARE/laragon/www/siBisaHadir.v2/Accounting/laporan_keuangan/accounting_profit_project_brand.html';
    await send('Page.navigate', { url: testUrl });
    await new Promise(r => setTimeout(r, 1500));

    const info = await send('Runtime.evaluate', {
      expression: `(() => {
        const active = document.querySelector('#app-sidebar .app-sub-item.is-active');
        if (!active) return null;
        const span = active.querySelector('span:not(.app-sub-icon)');
        return {
          scrollWidth: span ? span.scrollWidth : 0,
          clientWidth: span ? span.clientWidth : 0,
          isEllipsis: span ? (span.scrollWidth > span.clientWidth) : false,
          text: span ? span.textContent : '',
          sidebarWidth: document.getElementById('app-sidebar')?.offsetWidth
        };
      })()`,
      returnByValue: true
    });
    console.log(`Resolution ${w}x${h}:`, info.result?.result?.value);

    ws.close();
    chrome.kill();
  } catch(e) {
    console.error(e);
    chrome.kill();
  }
}

async function run() {
  await testResolution(1366, 768);
  await testResolution(1280, 800);
  await testResolution(1024, 768);
}
run();
