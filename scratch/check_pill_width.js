const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const BASE_DIR = 'd:/SOFTWARE/laragon/www/siBisaHadir.v2';
const PORT = 9469;

async function checkPillWidth() {
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

    const pillInfo = await send('Runtime.evaluate', {
      expression: `(() => {
        const a = document.querySelector('#app-sidebar .app-sub-item.is-active');
        if (!a) return null;
        const span = a.querySelector('span:not(.app-sub-icon)');
        const rect = a.getBoundingClientRect();
        return {
          fullText: a.textContent.trim(),
          spanText: span ? span.textContent : null,
          scrollWidth: span ? span.scrollWidth : null,
          clientWidth: span ? span.clientWidth : null,
          isTruncated: span ? (span.scrollWidth > span.clientWidth) : false,
          pillWidth: Math.round(rect.width),
          pillHeight: Math.round(rect.height)
        };
      })()`,
      returnByValue: true
    });

    console.log('Pill info:', pillInfo.result?.result?.value);

    // Capture screenshot of just the active pill
    const clipRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const a = document.querySelector('#app-sidebar .app-sub-item.is-active');
        if (!a) return null;
        const r = a.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      })()`,
      returnByValue: true
    });

    const clip = clipRes.result?.result?.value;
    if (clip) {
      const ss = await send('Page.captureScreenshot', {
        clip: {
          x: Math.max(0, clip.x - 10),
          y: Math.max(0, clip.y - 10),
          width: clip.width + 20,
          height: clip.height + 20,
          scale: 1
        }
      });
      fs.writeFileSync('C:/Users/ASUS/.gemini/antigravity/brain/e681e664-7bfb-44ca-a5f1-3d0986857d3b/active_pill_profit_project_brand.png', Buffer.from(ss.result.data, 'base64'));
      console.log('Saved screenshot of active pill to active_pill_profit_project_brand.png');
    }

    ws.close();
    chrome.kill();
  } catch (e) {
    console.error(e);
    chrome.kill();
  }
}

checkPillWidth();
