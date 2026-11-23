const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 9458;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/e681e664-7bfb-44ca-a5f1-3d0986857d3b';
const TARGET_URL = 'file:///d:/SOFTWARE/laragon/www/siBisaHadir.v2/Accounting/operasional/accounting_tagihan_berkala.html';

async function testScroll() {
  console.log('Launching headless Chrome on port', PORT);
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

    console.log('Navigating to Tagihan Berkala (bottom of Operasional)...');
    await send('Page.navigate', { url: TARGET_URL });
    await new Promise(r => setTimeout(r, 1200));

    async function evaluate(fnStr) {
      const expression = `(() => { ${fnStr} })()`;
      const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      return res.result?.result?.value !== undefined ? res.result.result.value : res.result?.value;
    }

    // Check initial scroll position of sidebarBox
    const initialScroll = await evaluate(`
      const box = document.getElementById('app-sidebar-box');
      const activeLink = document.querySelector('#app-sidebar .app-sub-item.is-active');
      const boxRect = box ? box.getBoundingClientRect() : null;
      const itemRect = activeLink ? activeLink.getBoundingClientRect() : null;
      return {
        scrollTop: box ? box.scrollTop : 0,
        scrollHeight: box ? box.scrollHeight : 0,
        clientHeight: box ? box.clientHeight : 0,
        activeLabel: activeLink ? activeLink.textContent.trim() : null,
        isItemVisible: itemRect && boxRect ? (itemRect.top >= boxRect.top && itemRect.bottom <= boxRect.bottom) : false,
        itemTopRelativeToBox: itemRect && boxRect ? (itemRect.top - boxRect.top) : null
      };
    `);
    console.log('Initial Sidebar Scroll State:', initialScroll);

    // Capture screenshot of sidebar with Tagihan Berkala in view
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const shotPath = path.join(ARTIFACT_DIR, 'sidebar_scroll_positioned_at_bottom.png');
    fs.writeFileSync(shotPath, Buffer.from(shot.result.data, 'base64'));
    console.log('Saved screenshot to:', shotPath);

    // Test navigation between pages: click another item in sidebar
    console.log('Testing link click in sidebar & scroll preservation...');
    await evaluate(`
      const box = document.getElementById('app-sidebar-box');
      box.scrollTop = 350;
      box.dispatchEvent(new Event('scroll'));
    `);

    const savedScrollBeforeNav = await evaluate(`sessionStorage.getItem('bm_sidebar_scroll_top')`);
    console.log('Saved scroll in sessionStorage before reload:', savedScrollBeforeNav);

    // Reload / re-navigate
    await send('Page.navigate', { url: TARGET_URL });
    await new Promise(r => setTimeout(r, 1200));

    const restoredScroll = await evaluate(`
      const box = document.getElementById('app-sidebar-box');
      const activeLink = document.querySelector('#app-sidebar .app-sub-item.is-active');
      const boxRect = box ? box.getBoundingClientRect() : null;
      const itemRect = activeLink ? activeLink.getBoundingClientRect() : null;
      return {
        scrollTop: box ? box.scrollTop : 0,
        sessionVal: sessionStorage.getItem('bm_sidebar_scroll_top'),
        activeLabel: activeLink ? activeLink.textContent.trim() : null,
        isItemVisible: itemRect && boxRect ? (itemRect.top >= boxRect.top && itemRect.bottom <= boxRect.bottom) : false
      };
    `);
    console.log('Restored Sidebar Scroll State after reload:', restoredScroll);

    ws.close();
    chrome.kill();

    if (restoredScroll.scrollTop > 0 && restoredScroll.isItemVisible) {
      console.log('SUCCESS: Sidebar scroll is preserved and active bottom module is fully visible!');
    } else {
      console.error('FAIL: Sidebar scroll was not preserved properly!');
      process.exit(1);
    }
  } catch (err) {
    console.error('Test error:', err);
    chrome.kill();
    process.exit(1);
  }
}

testScroll();
