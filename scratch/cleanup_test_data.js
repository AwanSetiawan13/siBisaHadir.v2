const { spawn } = require('child_process');
const path = require('path');

const BASE_DIR = 'd:/SOFTWARE/laragon/www/siBisaHadir.v2';
const PORT = 9473;

async function cleanup() {
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

    const testUrl = 'file:///' + path.join(BASE_DIR, 'Accounting/operasional/accounting_kas_bank.html').replace(/\\/g, '/');
    await send('Page.navigate', { url: testUrl });
    await new Promise(r => setTimeout(r, 1000));

    await send('Runtime.evaluate', {
      expression: `(() => {
        // Remove INV-202611-999 from pendapatan
        const pndKey = 'accounting_pendapatan_data_v1';
        let pndList = [];
        try { pndList = JSON.parse(localStorage.getItem(pndKey) || '[]'); } catch(e){}
        if (Array.isArray(pndList)) {
          pndList = pndList.filter(p => p.noInvoice !== 'INV-202611-999');
          localStorage.setItem(pndKey, JSON.stringify(pndList));
        }

        // Remove test transaction from Kas & Bank
        const kbKey = 'accounting_kas_bank_v2';
        let kbList = [];
        try { kbList = JSON.parse(localStorage.getItem(kbKey) || '[]'); } catch(e){}
        if (Array.isArray(kbList)) {
          kbList = kbList.filter(tx => tx.referensi !== 'INV-202611-999' && !String(tx.keterangan || '').includes('INV-202611-999'));
          localStorage.setItem(kbKey, JSON.stringify(kbList));
        }
      })()`
    });

    console.log('Cleaned up test invoice and transaction from localStorage.');

    ws.close();
    chrome.kill();
  } catch (e) {
    console.error(e);
    chrome.kill();
  }
}

cleanup();
