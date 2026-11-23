const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const BASE_DIR = 'd:/SOFTWARE/laragon/www/siBisaHadir.v2';
const PORT = 9465;

async function measure() {
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

    await send('Page.navigate', { url: 'file:///' + path.join(BASE_DIR, 'Accounting/operasional/accounting_tagihan_berkala.html').replace(/\\/g, '/') });
    await new Promise(r => setTimeout(r, 1000));

    const data = await send('Runtime.evaluate', {
      expression: `(() => {
        const box = document.getElementById('app-sidebar-box');
        const ulOperasional = document.getElementById('m-acc-operasional');
        const items = Array.from(ulOperasional.querySelectorAll('a'));
        
        return {
          boxClientHeight: box.clientHeight,
          boxScrollHeight: box.scrollHeight,
          maxScrollTop: box.scrollHeight - box.clientHeight,
          items: items.map((a, idx) => {
            return {
              idx: idx + 1,
              label: a.textContent.trim(),
              offsetTop: a.offsetTop,
              height: a.clientHeight
            };
          })
        };
      })()`,
      returnByValue: true
    });

    console.log('Measurement data:', JSON.stringify(data.result?.result?.value || data.result?.value, null, 2));
    ws.close();
    chrome.kill();
  } catch(e) {
    console.error(e);
    chrome.kill();
  }
}

measure();
