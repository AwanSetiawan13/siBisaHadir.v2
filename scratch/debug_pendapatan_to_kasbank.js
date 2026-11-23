const { spawn } = require('child_process');
const path = require('path');

const BASE_DIR = 'd:/SOFTWARE/laragon/www/siBisaHadir.v2';
const PORT = 9483;

async function debugFlow() {
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

    console.log('1. Navigate to accounting_pendapatan.html...');
    await send('Page.navigate', { url: 'file:///' + path.join(BASE_DIR, 'Accounting/operasional/accounting_pendapatan.html').replace(/\\/g, '/') });
    await new Promise(r => setTimeout(r, 1200));

    // Inspect what is currently in localStorage for pendapatan
    const currentStorage = await send('Runtime.evaluate', {
      expression: `(() => {
        const raw = localStorage.getItem('accounting_pendapatan_data_v1');
        const list = raw ? JSON.parse(raw) : [];
        return list.map(it => ({ id: it.id, noInvoice: it.noInvoice, customer: it.customer, createdAt: it.createdAt, updatedAt: it.updatedAt }));
      })()`,
      returnByValue: true
    });
    console.log('Current in pendapatan storage:', currentStorage.result?.result?.value);

    // Now let's simulate user filling pndForm properly
    const addResult = await send('Runtime.evaluate', {
      expression: `(() => {
        const form = document.getElementById('pndForm');
        document.getElementById('pndEditId').value = '';
        document.getElementById('pndIdPendapatan').value = 'PND-' + Date.now();
        document.getElementById('pndCustomer').value = 'PT Klien Terupdate';
        document.getElementById('pndNoInvoice').value = 'INV-202611-BARU';
        document.getElementById('pndKeterangan').value = 'Invoice Terbaru dari User';
        document.getElementById('pndDpp').value = '25000000';
        document.getElementById('pndDpp').dispatchEvent(new Event('input'));
        document.getElementById('pndProjectBrand').value = 'Brand Baru';
        document.getElementById('pndDivisi').value = 'Operasional';

        form.dispatchEvent(new Event('submit', { cancelable: true }));

        const rawAfter = localStorage.getItem('accounting_pendapatan_data_v1');
        const listAfter = rawAfter ? JSON.parse(rawAfter) : [];
        return {
          firstItem: listAfter[0],
          secondItem: listAfter[1],
          count: listAfter.length
        };
      })()`,
      returnByValue: true
    });
    console.log('After adding new item in pendapatan:', addResult.result?.result?.value);

    console.log('\n2. Navigate to accounting_kas_bank.html...');
    await send('Page.navigate', { url: 'file:///' + path.join(BASE_DIR, 'Accounting/operasional/accounting_kas_bank.html').replace(/\\/g, '/') });
    await new Promise(r => setTimeout(r, 1500));

    const kbEval = await send('Runtime.evaluate', {
      expression: `(() => {
        try {
          const list = getAllDokumenReferensiList();
          return {
            total: list.length,
            top10: list.slice(0, 10).map(it => ({
              kode: it.kode,
              tipe: it.tipe,
              labelTipe: it.labelTipe,
              isNew: it.isNew,
              isUnused: it.isUnused,
              sortTime: it.sortTime,
              keterangan: it.keterangan
            }))
          };
        } catch(e) {
          return { error: e.toString() };
        }
      })()`,
      returnByValue: true
    });
    console.log('Kas & Bank Referensi result:', JSON.stringify(kbEval.result?.result?.value, null, 2));

    ws.close();
    chrome.kill();
  } catch(e) {
    console.error(e);
    chrome.kill();
  }
}

debugFlow();
