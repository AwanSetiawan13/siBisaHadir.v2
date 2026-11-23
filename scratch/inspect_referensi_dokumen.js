const { spawn } = require('child_process');
const path = require('path');

const BASE_DIR = 'd:/SOFTWARE/laragon/www/siBisaHadir.v2';
const PORT = 9470;

async function inspectReferensiDokumen() {
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
    await new Promise(r => setTimeout(r, 1200));

    // Open Tambah Transaksi modal and trigger referensi dropdown
    const data = await send('Runtime.evaluate', {
      expression: `(() => {
        const btnTambah = document.getElementById('btnTambah');
        if (btnTambah) btnTambah.click();

        const trigger = document.getElementById('btnTriggerReferensi');
        if (trigger) trigger.click();

        const items = getAllDokumenReferensiList();
        const kbUsed = [];
        kbData.forEach(tx => { if (tx.referensi) kbUsed.push(tx.referensi); });

        return {
          totalRefs: items.length,
          kbUsed: kbUsed,
          refs: items.map(it => ({
            kode: it.kode,
            tipe: it.tipe,
            isNew: it.isNew,
            isUnused: it.isUnused,
            sortTime: it.sortTime,
            keterangan: it.keterangan
          }))
        };
      })()`,
      returnByValue: true
    });

    console.log('Referensi Dokumen State:', JSON.stringify(data.result?.result?.value, null, 2));

    ws.close();
    chrome.kill();
  } catch (e) {
    console.error(e);
    chrome.kill();
  }
}

inspectReferensiDokumen();
