const { spawn } = require('child_process');
const path = require('path');

const BASE_DIR = 'd:/SOFTWARE/laragon/www/siBisaHadir.v2';
const PORT = 9480;

async function testNav() {
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

    console.log('1. Start at Tagihan Berkala (Bottom Operasional)...');
    await send('Page.navigate', { url: 'file:///' + path.join(BASE_DIR, 'Accounting/operasional/accounting_tagihan_berkala.html').replace(/\\/g, '/') });
    await new Promise(r => setTimeout(r, 1000));

    let state = await send('Runtime.evaluate', {
      expression: `(() => {
        const b = document.getElementById('app-sidebar-box');
        return {
          page: 'Tagihan Berkala',
          scrollTop: b ? b.scrollTop : 0,
          session: sessionStorage.getItem('bm_sidebar_scroll_top')
        };
      })()`,
      returnByValue: true
    });
    console.log('Tagihan Berkala:', state.result?.result?.value);

    console.log('\n2. Click Profit Project & Brand link in sidebar...');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const link = Array.from(document.querySelectorAll('#app-sidebar a')).find(a => a.href.includes('accounting_profit_project_brand.html'));
        if (link) { link.click(); return true; }
        return false;
      })()`,
      returnByValue: true
    });
    await new Promise(r => setTimeout(r, 1200));

    state = await send('Runtime.evaluate', {
      expression: `(() => {
        const b = document.getElementById('app-sidebar-box');
        const a = document.querySelector('#app-sidebar .app-sub-item.is-active');
        const br = b ? b.getBoundingClientRect() : null;
        const ar = a ? a.getBoundingClientRect() : null;
        return {
          url: window.location.href.split('/').pop(),
          activeText: a ? a.textContent.trim() : null,
          scrollTop: b ? b.scrollTop : 0,
          session: sessionStorage.getItem('bm_sidebar_scroll_top'),
          itemTopInBox: ar && br ? Math.round(ar.top - br.top) : null,
          isVisible: ar && br ? (ar.top >= br.top && ar.bottom <= br.bottom) : false
        };
      })()`,
      returnByValue: true
    });
    console.log('Profit Project & Brand:', state.result?.result?.value);

    console.log('\n3. Click back to Tagihan Berkala from sidebar...');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const header = Array.from(document.querySelectorAll('.app-group-header')).find(h => h.textContent.includes('Operasional'));
        if (header && header.getAttribute('data-expanded') !== 'true') {
          header.click();
        }
        setTimeout(() => {
          const link = Array.from(document.querySelectorAll('#app-sidebar a')).find(a => a.href.includes('accounting_tagihan_berkala.html'));
          if (link) link.click();
        }, 100);
      })()`,
      returnByValue: true
    });
    await new Promise(r => setTimeout(r, 1500));

    state = await send('Runtime.evaluate', {
      expression: `(() => {
        const b = document.getElementById('app-sidebar-box');
        const a = document.querySelector('#app-sidebar .app-sub-item.is-active');
        const br = b ? b.getBoundingClientRect() : null;
        const ar = a ? a.getBoundingClientRect() : null;
        return {
          url: window.location.href.split('/').pop(),
          activeText: a ? a.textContent.trim() : null,
          scrollTop: b ? b.scrollTop : 0,
          session: sessionStorage.getItem('bm_sidebar_scroll_top'),
          itemTopInBox: ar && br ? Math.round(ar.top - br.top) : null,
          isVisible: ar && br ? (ar.top >= br.top && ar.bottom <= br.bottom) : false
        };
      })()`,
      returnByValue: true
    });
    console.log('Back to Tagihan Berkala:', state.result?.result?.value);

    ws.close();
    chrome.kill();
  } catch (e) {
    console.error(e);
    chrome.kill();
  }
}

testNav();
