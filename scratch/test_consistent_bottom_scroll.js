const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const BASE_DIR = 'd:/SOFTWARE/laragon/www/siBisaHadir.v2';
const PORT = 9466;

const bottomPages = [
  'Accounting/operasional/accounting_daftar_aset.html',
  'Accounting/operasional/accounting_mutasi_aset.html',
  'Accounting/operasional/accounting_alokasi_aset_project.html',
  'Accounting/operasional/accounting_utang_karyawan.html',
  'Accounting/operasional/accounting_piutang_karyawan.html',
  'Accounting/operasional/accounting_budget_vs_actual.html',
  'Accounting/operasional/accounting_pengajuan_barang_jasa.html',
  'Accounting/operasional/accounting_tagihan_berkala.html'
];

async function testConsistentScroll() {
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

    console.log('Testing sequential clicks through all bottom Operasional pages...');
    
    // Start at Tagihan Berkala
    let currentUrl = 'file:///' + path.join(BASE_DIR, 'Accounting/operasional/accounting_tagihan_berkala.html').replace(/\\/g, '/');
    await send('Page.navigate', { url: currentUrl });
    await new Promise(r => setTimeout(r, 1000));

    // Measure initial
    const initialRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const b = document.getElementById('app-sidebar-box');
        const a = document.querySelector('#app-sidebar .app-sub-item.is-active');
        return {
          scrollTop: b ? b.scrollTop : 0,
          label: a ? a.textContent.trim() : null
        };
      })()`,
      returnByValue: true
    });
    console.log('Start page:', initialRes.result?.result?.value);

    // Now click each of the other bottom pages in sequence using actual DOM click
    for (let i = 0; i < bottomPages.length; i++) {
      const targetFile = bottomPages[i].split('/').pop();
      console.log(`\nClicking link to: ${targetFile}...`);

      const clickRes = await send('Runtime.evaluate', {
        expression: `(() => {
          const link = Array.from(document.querySelectorAll('#app-sidebar a')).find(a => a.href.includes('${targetFile}'));
          if (link) {
            link.click();
            return true;
          }
          return false;
        })()`,
        returnByValue: true
      });

      if (!clickRes.result?.result?.value) {
        console.log('Link not found via click, navigating directly...');
        await send('Page.navigate', { url: 'file:///' + path.join(BASE_DIR, bottomPages[i]).replace(/\\/g, '/') });
      }

      await new Promise(r => setTimeout(r, 900));

      const state = await send('Runtime.evaluate', {
        expression: `(() => {
          const b = document.getElementById('app-sidebar-box');
          const a = document.querySelector('#app-sidebar .app-sub-item.is-active');
          const br = b ? b.getBoundingClientRect() : null;
          const ar = a ? a.getBoundingClientRect() : null;
          return {
            url: window.location.href.split('/').pop(),
            scrollTop: b ? b.scrollTop : 0,
            active: a ? a.textContent.trim() : null,
            isVisible: ar && br ? (ar.top >= br.top && ar.bottom <= br.bottom) : false,
            itemTopInBox: ar && br ? Math.round(ar.top - br.top) : null
          };
        })()`,
        returnByValue: true
      });

      console.log('Result:', state.result?.result?.value);
    }

    ws.close();
    chrome.kill();
  } catch(e) {
    console.error(e);
    chrome.kill();
  }
}

testConsistentScroll();
