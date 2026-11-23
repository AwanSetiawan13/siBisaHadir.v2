const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function test() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9477',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1440,900',
    'about:blank'
  ]);
  await new Promise(r => setTimeout(r, 1500));

  try {
    const list = await (await fetch('http://localhost:9477/json/list')).json();
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
        const active = document.querySelector('#app-sidebar .app-sub-item.is-active, #app-sidebar .app-nav-item.is-active');
        if (!active) return null;
        const textSpan = active.querySelector('span:not(.app-sub-icon)');
        const box = document.getElementById('app-sidebar-box');
        const boxR = box ? box.getBoundingClientRect() : null;
        const actR = active.getBoundingClientRect();
        return {
          outerHTML: active.outerHTML,
          innerText: active.innerText,
          scrollWidth: textSpan ? textSpan.scrollWidth : 0,
          clientWidth: textSpan ? textSpan.clientWidth : 0,
          isEllipsis: textSpan ? (textSpan.scrollWidth > textSpan.clientWidth) : false,
          activeRect: {
            top: actR.top,
            bottom: actR.bottom,
            left: actR.left,
            right: actR.right,
            width: actR.width,
            height: actR.height
          },
          boxScrollTop: box ? box.scrollTop : 0
        };
      })()`,
      returnByValue: true
    });
    console.log('Active info:', JSON.stringify(info.result?.result?.value, null, 2));

    const shot = await send('Page.captureScreenshot', {
      format: 'png',
      clip: {
        x: 0,
        y: 0,
        width: 320,
        height: 600,
        scale: 1
      }
    });
    fs.writeFileSync('C:/Users/ASUS/.gemini/antigravity/brain/e681e664-7bfb-44ca-a5f1-3d0986857d3b/active_pill_check.png', Buffer.from(shot.result.data, 'base64'));

    ws.close();
    chrome.kill();
  } catch(e) {
    console.error(e);
    chrome.kill();
  }
}
test();
