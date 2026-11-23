const { spawn } = require('child_process');
const path = require('path');

const BASE_DIR = 'd:/SOFTWARE/laragon/www/siBisaHadir.v2';
const PORT = 9471;

async function inspectReferensiDOM() {
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

        const container = document.getElementById('listReferensiDokumen');
        if (!container) return { error: 'no container' };

        const items = Array.from(container.querySelectorAll('.kb-select-item')).map(item => {
          const input = item.querySelector('input');
          const hasNew = Boolean(item.querySelector('.ref-badge-new'));
          return {
            val: input ? input.value : null,
            text: item.textContent.replace(/\\s+/g, ' ').trim(),
            hasNewBadge: hasNew
          };
        });

        return {
          total: items.length,
          items: items
        };
      })()`,
      returnByValue: true
    });

    console.log('Referensi DOM State:', JSON.stringify(data.result?.result?.value, null, 2));

    ws.close();
    chrome.kill();
  } catch (e) {
    console.error(e);
    chrome.kill();
  }
}

inspectReferensiDOM();
