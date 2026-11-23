const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 9528;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/e681e664-7bfb-44ca-a5f1-3d0986857d3b';

async function runTest() {
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
    await send('DOM.enable');

    async function evaluate(expression) {
      const res = await send('Runtime.evaluate', {
        expression: expression,
        returnByValue: true,
        awaitPromise: true
      });
      if (res.result && res.result.result) {
        return res.result.result.value;
      }
      return null;
    }

    async function takeScreenshot(filename) {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      if (res.result && res.result.data) {
        const filePath = path.join(ARTIFACT_DIR, filename);
        fs.writeFileSync(filePath, Buffer.from(res.result.data, 'base64'));
        console.log('Saved screenshot:', filename);
      }
    }

    // 1. Test Pengeluaran & Beban
    const URL_PND = 'file:///d:/SOFTWARE/laragon/www/siBisaHadir.v2/Accounting/operasional/accounting_pengeluaran_beban.html';
    console.log('Navigating to Pengeluaran & Beban:', URL_PND);
    await send('Page.navigate', { url: URL_PND });
    await new Promise(r => setTimeout(r, 1500));

    await evaluate(`document.getElementById('btnTambahPnd').click()`);
    await new Promise(r => setTimeout(r, 500));
    await evaluate(`document.getElementById('btnTriggerIdApproval').click()`);
    await new Promise(r => setTimeout(r, 400));

    // Check if any visible radio circles exist inside #dropdownIdApproval
    const visibleRadiosInPnd = await evaluate(`
      (() => {
        const dd = document.getElementById('dropdownIdApproval');
        const customRadios = Array.from(dd.querySelectorAll('.pnd-custom-radio, input[type="radio"]'));
        const visible = customRadios.filter(el => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetWidth > 0;
        });
        return visible.length;
      })()
    `);
    console.log('Visible radio circles in Pengeluaran & Beban ID Approval dropdown:', visibleRadiosInPnd);
    await takeScreenshot('clean_dropdown_pengeluaran_beban.png');

    // 2. Test Pengajuan Barang & Jasa
    const URL_PBJ = 'file:///d:/SOFTWARE/laragon/www/siBisaHadir.v2/Accounting/operasional/accounting_pengajuan_barang_jasa.html';
    console.log('Navigating to Pengajuan Barang & Jasa:', URL_PBJ);
    await send('Page.navigate', { url: URL_PBJ });
    await new Promise(r => setTimeout(r, 1500));

    await evaluate(`document.getElementById('btnTambahPbj').click()`);
    await new Promise(r => setTimeout(r, 500));
    await evaluate(`document.getElementById('btnTriggerKategori').click()`);
    await new Promise(r => setTimeout(r, 400));

    // Check if any visible radio circles exist inside #dropdownKategori
    const visibleRadiosInPbj = await evaluate(`
      (() => {
        const dd = document.getElementById('dropdownKategori');
        const radios = Array.from(dd.querySelectorAll('input[type="radio"], .pnd-custom-radio'));
        const visible = radios.filter(el => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetWidth > 0;
        });
        return visible.length;
      })()
    `);
    console.log('Visible radio circles in Pengajuan Barang & Jasa Kategori dropdown:', visibleRadiosInPbj);
    await takeScreenshot('clean_dropdown_pengajuan_barang_jasa.png');

    // 3. Test Kas & Bank
    const URL_KB = 'file:///d:/SOFTWARE/laragon/www/siBisaHadir.v2/Accounting/operasional/accounting_kas_bank.html';
    console.log('Navigating to Kas & Bank:', URL_KB);
    await send('Page.navigate', { url: URL_KB });
    await new Promise(r => setTimeout(r, 1500));

    await evaluate(`document.getElementById('btnTambahTransaksi').click()`);
    await new Promise(r => setTimeout(r, 500));
    await evaluate(`document.getElementById('btnTriggerAkunCoa').click()`);
    await new Promise(r => setTimeout(r, 400));

    const visibleRadiosInKb = await evaluate(`
      (() => {
        const dd = document.getElementById('dropdownAkunCoa');
        if (!dd) return 0;
        const radios = Array.from(dd.querySelectorAll('input[type="radio"], .custom-radio, .kb-custom-radio'));
        const visible = radios.filter(el => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetWidth > 0;
        });
        return visible.length;
      })()
    `);
    console.log('Visible radio circles in Kas & Bank Akun COA dropdown:', visibleRadiosInKb);
    await takeScreenshot('clean_dropdown_kas_bank.png');

    console.log('ALL DROPDOWN CIRCLE REMOVAL TESTS COMPLETED!');
    ws.close();
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  } finally {
    chrome.kill();
  }
}

runTest();
