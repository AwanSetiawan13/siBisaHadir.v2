const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 9459;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/e681e664-7bfb-44ca-a5f1-3d0986857d3b';
const BASE_URL = 'file:///d:/SOFTWARE/laragon/www/siBisaHadir.v2/Accounting/operasional/';

async function testUserFlow() {
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

    async function evaluate(fnStr) {
      const expression = `(() => { ${fnStr} })()`;
      const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      return res.result?.result?.value !== undefined ? res.result.result.value : res.result?.value;
    }

    // Step 1: Open Kas & Bank
    console.log('Step 1: Open accounting_kas_bank.html...');
    await send('Page.navigate', { url: BASE_URL + 'accounting_kas_bank.html' });
    await new Promise(r => setTimeout(r, 1200));

    // Step 2: User scrolls sidebar down to see bottom of Operasional
    console.log('Step 2: Scroll sidebar down to see bottom of Operasional...');
    await evaluate(`
      const box = document.getElementById('app-sidebar-box');
      box.scrollTop = 220;
      box.dispatchEvent(new Event('scroll'));
    `);

    const scrollBeforeClick = await evaluate(`return document.getElementById('app-sidebar-box').scrollTop;`);
    console.log('Sidebar scrollTop before clicking Tagihan Berkala:', scrollBeforeClick);

    // Step 3: Click Tagihan Berkala link in sidebar
    console.log('Step 3: User clicks Tagihan Berkala link in sidebar...');
    await evaluate(`
      const tagihanLink = Array.from(document.querySelectorAll('#app-sidebar a')).find(a => a.textContent.includes('Tagihan Berkala'));
      tagihanLink.click();
    `);
    await new Promise(r => setTimeout(r, 1200));

    // Step 4: Verify on the new page (Tagihan Berkala)
    const pageUrl = await evaluate(`return window.location.href;`);
    console.log('Navigated to page URL:', pageUrl);

    const scrollAfterNav = await evaluate(`
      const box = document.getElementById('app-sidebar-box');
      const activeItem = document.querySelector('#app-sidebar .app-sub-item.is-active');
      const boxRect = box ? box.getBoundingClientRect() : null;
      const itemRect = activeItem ? activeLink = activeItem.getBoundingClientRect() : null;
      return {
        scrollTop: box.scrollTop,
        activeLabel: activeItem ? activeItem.textContent.trim() : null,
        isItemVisible: itemRect && boxRect ? (itemRect.top >= boxRect.top && itemRect.bottom <= boxRect.bottom) : false,
        itemTop: itemRect ? (itemRect.top - boxRect.top) : null
      };
    `);
    console.log('Sidebar State on Tagihan Berkala page:', scrollAfterNav);

    // Capture screenshot: Tagihan Berkala with sidebar scrolled
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const shotPath = path.join(ARTIFACT_DIR, 'sidebar_scroll_user_flow.png');
    fs.writeFileSync(shotPath, Buffer.from(shot.result.data, 'base64'));
    console.log('Saved screenshot to:', shotPath);

    ws.close();
    chrome.kill();

    if (scrollAfterNav.scrollTop >= 200 && scrollAfterNav.isItemVisible && scrollAfterNav.activeLabel === 'Tagihan Berkala') {
      console.log('TEST PASSED! Sidebar kept its position and did not jump to the top!');
    } else {
      console.error('TEST FAILED: Sidebar position was not kept as expected.', scrollAfterNav);
      process.exit(1);
    }
  } catch (err) {
    console.error('Test error:', err);
    chrome.kill();
    process.exit(1);
  }
}

testUserFlow();
