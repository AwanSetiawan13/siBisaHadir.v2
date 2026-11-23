const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 9457;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/e681e664-7bfb-44ca-a5f1-3d0986857d3b';
const TARGET_URL = 'file:///d:/SOFTWARE/laragon/www/siBisaHadir.v2/Accounting/operasional/accounting_tagihan_berkala.html';

async function testSidebar() {
  const chrome = spawn(CHROME_PATH, [
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
    function send(method, params = {}) {
      return new Promise(resolve => {
        const msgId = id++;
        const handler = (event) => {
          const data = JSON.parse(event.data);
          if (data.id === msgId) {
            ws.removeEventListener('message', handler);
            resolve(data);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');

    await send('Page.navigate', { url: TARGET_URL });
    await new Promise(r => setTimeout(r, 1500));

    async function evaluate(fnStr) {
      const expression = `(() => { ${fnStr} })()`;
      const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      return res.result?.result?.value !== undefined ? res.result.result.value : res.result?.value;
    }

    // Inspect all group headers in the sidebar
    const headers = await evaluate(`
      return Array.from(document.querySelectorAll('.app-group-header')).map(el => {
        return {
          text: el.innerText.trim().replace(/\\n/g, ' '),
          html: el.innerHTML
        };
      });
    `);

    console.log('Group headers in sidebar:');
    headers.forEach((h, i) => {
      console.log(`[${i+1}] ${h.text}`);
    });

    const anyNumberBadge = headers.some(h => /\d+/.test(h.text));
    console.log('Any number found in group headers:', anyNumberBadge);

    // Capture screenshot of sidebar
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const shotPath = path.join(ARTIFACT_DIR, 'sidebar_no_numbers.png');
    fs.writeFileSync(shotPath, Buffer.from(shot.result.data, 'base64'));
    console.log('Saved screenshot to:', shotPath);

    ws.close();
    chrome.kill();

    if (anyNumberBadge) {
      console.error('FAIL: Still found numbers in group headers!');
      process.exit(1);
    } else {
      console.log('SUCCESS: All numbers have been removed from the sidebar!');
    }
  } catch (err) {
    console.error('Test error:', err);
    chrome.kill();
    process.exit(1);
  }
}

testSidebar();
