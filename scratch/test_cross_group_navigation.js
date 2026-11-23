const { spawn } = require('child_process');
const path = require('path');

const BASE_DIR = 'd:/SOFTWARE/laragon/www/siBisaHadir.v2';
const PORT = 9467;

async function testCrossNavigation() {
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

    console.log('Testing cross navigation: Top -> Bottom -> Top...');

    // 1. Start at Kas & Bank (top item)
    await send('Page.navigate', { url: 'file:///' + path.join(BASE_DIR, 'Accounting/operasional/accounting_kas_bank.html').replace(/\\/g, '/') });
    await new Promise(r => setTimeout(r, 900));

    let res = await send('Runtime.evaluate', {
      expression: `(() => {
        const b = document.getElementById('app-sidebar-box');
        const a = document.querySelector('#app-sidebar .app-sub-item.is-active, #app-sidebar .app-nav-item.is-active');
        return {
          page: 'Kas & Bank',
          scrollTop: b ? b.scrollTop : 0,
          active: a ? a.textContent.trim() : null
        };
      })()`,
      returnByValue: true
    });
    console.log('1. At Kas & Bank:', res.result?.result?.value);

    // 2. Click Tagihan Berkala (bottom item)
    await send('Runtime.evaluate', {
      expression: `(() => {
        const link = Array.from(document.querySelectorAll('#app-sidebar a')).find(a => a.href.includes('accounting_tagihan_berkala.html'));
        if (link) link.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 900));

    res = await send('Runtime.evaluate', {
      expression: `(() => {
        const b = document.getElementById('app-sidebar-box');
        const a = document.querySelector('#app-sidebar .app-sub-item.is-active, #app-sidebar .app-nav-item.is-active');
        const br = b ? b.getBoundingClientRect() : null;
        const ar = a ? a.getBoundingClientRect() : null;
        return {
          page: 'Tagihan Berkala',
          scrollTop: b ? b.scrollTop : 0,
          active: a ? a.textContent.trim() : null,
          isVisible: ar && br ? (ar.top >= br.top && ar.bottom <= br.bottom) : false,
          itemTopInBox: ar && br ? Math.round(ar.top - br.top) : null
        };
      })()`,
      returnByValue: true
    });
    console.log('2. After clicking Tagihan Berkala:', res.result?.result?.value);

    // 3. Click Pengajuan Barang & Jasa (another bottom item)
    await send('Runtime.evaluate', {
      expression: `(() => {
        const link = Array.from(document.querySelectorAll('#app-sidebar a')).find(a => a.href.includes('accounting_pengajuan_barang_jasa.html'));
        if (link) link.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 900));

    res = await send('Runtime.evaluate', {
      expression: `(() => {
        const b = document.getElementById('app-sidebar-box');
        const a = document.querySelector('#app-sidebar .app-sub-item.is-active, #app-sidebar .app-nav-item.is-active');
        return {
          page: 'Pengajuan Barang & Jasa',
          scrollTop: b ? b.scrollTop : 0,
          active: a ? a.textContent.trim() : null
        };
      })()`,
      returnByValue: true
    });
    console.log('3. After clicking Pengajuan Barang & Jasa:', res.result?.result?.value);

    // 4. Click Dashboard (top item in sidebar)
    await send('Runtime.evaluate', {
      expression: `(() => {
        const link = Array.from(document.querySelectorAll('#app-sidebar a')).find(a => a.href.includes('accounting_dashboard.html'));
        if (link) link.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 900));

    res = await send('Runtime.evaluate', {
      expression: `(() => {
        const b = document.getElementById('app-sidebar-box');
        const a = document.querySelector('#app-sidebar .app-sub-item.is-active, #app-sidebar .app-nav-item.is-active');
        const br = b ? b.getBoundingClientRect() : null;
        const ar = a ? a.getBoundingClientRect() : null;
        return {
          page: 'Dashboard',
          scrollTop: b ? b.scrollTop : 0,
          active: a ? a.textContent.trim() : null,
          isVisible: ar && br ? (ar.top >= br.top && ar.bottom <= br.bottom) : false
        };
      })()`,
      returnByValue: true
    });
    console.log('4. After clicking Dashboard:', res.result?.result?.value);

    // Take screenshot of Tagihan Berkala with stable sidebar scroll
    await send('Page.navigate', { url: 'file:///' + path.join(BASE_DIR, 'Accounting/operasional/accounting_tagihan_berkala.html').replace(/\\/g, '/') });
    await new Promise(r => setTimeout(r, 1000));
    const ss = await send('Page.captureScreenshot');
    require('fs').writeFileSync('C:/Users/ASUS/.gemini/antigravity/brain/e681e664-7bfb-44ca-a5f1-3d0986857d3b/sidebar_scroll_consistent_bottom.png', Buffer.from(ss.result.data, 'base64'));
    console.log('Screenshot saved to sidebar_scroll_consistent_bottom.png');

    ws.close();
    chrome.kill();
  } catch (e) {
    console.error(e);
    chrome.kill();
  }
}

testCrossNavigation();
