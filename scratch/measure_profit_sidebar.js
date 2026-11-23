const { spawn } = require('child_process');
const path = require('path');

const BASE_DIR = 'd:/SOFTWARE/laragon/www/siBisaHadir.v2';
const PORT = 9474;

async function measureProfitSidebar() {
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
    await send('Page.navigate', { url: testUrl });
    await new Promise(r => setTimeout(r, 1200));

    const state = await send('Runtime.evaluate', {
      expression: `(() => {
        const box = document.getElementById('app-sidebar-box');
        const active = document.querySelector('#app-sidebar .app-sub-item.is-active, #app-sidebar .app-nav-item.is-active');
        const opUl = document.getElementById('m-acc-operasional');
        const lkUl = document.getElementById('m-acc-laporan-keuangan');
        const boxR = box ? box.getBoundingClientRect() : null;
        const actR = active ? active.getBoundingClientRect() : null;

        return {
          scrollTop: box ? box.scrollTop : 0,
          boxClientHeight: box ? box.clientHeight : 0,
          boxScrollHeight: box ? box.scrollHeight : 0,
          isOperasionalExpanded: opUl ? opUl.classList.contains('is-expanded') : false,
          isLaporanExpanded: lkUl ? lkUl.classList.contains('is-expanded') : false,
          activeText: active ? active.textContent.trim() : null,
          itemTopInBox: actR && boxR ? Math.round(actR.top - boxR.top) : null,
          itemHeight: actR ? Math.round(actR.height) : null,
          savedScrollSession: sessionStorage.getItem('bm_sidebar_scroll_top')
        };
      })()`,
      returnByValue: true
    });

    console.log('Profit Project & Brand sidebar state:', JSON.stringify(state.result?.result?.value, null, 2));

    ws.close();
    chrome.kill();
  } catch (e) {
    console.error(e);
    chrome.kill();
  }
}

measureProfitSidebar();
