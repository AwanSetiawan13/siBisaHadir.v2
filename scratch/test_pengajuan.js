const { spawn } = require('child_process');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9461',
  '--no-sandbox',
  '--disable-gpu',
  '--window-size=1440,900',
  'about:blank'
]);

setTimeout(async () => {
  try {
    const list = await (await fetch('http://localhost:9461/json/list')).json();
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

    await send('Page.navigate', { url: 'file:///d:/SOFTWARE/laragon/www/siBisaHadir.v2/Accounting/operasional/accounting_pengajuan_barang_jasa.html' });
    await new Promise(r => setTimeout(r, 1200));

    const res = await send('Runtime.evaluate', {
      expression: '(() => { const b = document.getElementById("app-sidebar-box"); const a = document.querySelector("#app-sidebar .app-sub-item.is-active"); const br = b ? b.getBoundingClientRect() : null; const ar = a ? a.getBoundingClientRect() : null; return { scrollTop: b.scrollTop, active: a ? a.textContent.trim() : null, isVis: ar && br ? (ar.top >= br.top && ar.bottom <= br.bottom) : false, itemTop: ar ? (ar.top - br.top) : null }; })()',
      returnByValue: true
    });

    console.log('Pengajuan Barang & Jasa result:', res.result?.value);
    ws.close();
    chrome.kill();
  } catch(e) {
    console.error(e);
    chrome.kill();
  }
}, 1500);
