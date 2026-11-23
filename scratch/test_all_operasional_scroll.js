const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const BASE_DIR = 'd:/SOFTWARE/laragon/www/siBisaHadir.v2';
const PORT = 9463;

const operasionalPages = [
  'Accounting/operasional/accounting_operasional_dashboard.html',
  'Accounting/operasional/accounting_kas_bank.html',
  'Accounting/operasional/accounting_pendapatan.html',
  'Accounting/operasional/accounting_approval_pengeluaran.html',
  'Accounting/operasional/accounting_pengeluaran_beban.html',
  'Accounting/operasional/accounting_payroll.html',
  'Accounting/operasional/accounting_pajak.html',
  'Accounting/operasional/accounting_daftar_aset.html',
  'Accounting/operasional/accounting_mutasi_aset.html',
  'Accounting/operasional/accounting_alokasi_aset_project.html',
  'Accounting/operasional/accounting_utang_karyawan.html',
  'Accounting/operasional/accounting_piutang_karyawan.html',
  'Accounting/operasional/accounting_budget_vs_actual.html',
  'Accounting/operasional/accounting_pengajuan_barang_jasa.html',
  'Accounting/operasional/accounting_tagihan_berkala.html'
];

async function testAll() {
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

    console.log('Testing all 15 Operasional pages...');

    for (let i = 0; i < operasionalPages.length; i++) {
      const p = operasionalPages[i];
      const fullUrl = 'file:///' + path.join(BASE_DIR, p).replace(/\\/g, '/');
      await send('Page.navigate', { url: fullUrl });
      await new Promise(r => setTimeout(r, 800));

      const res = await send('Runtime.evaluate', {
        expression: `(() => {
          const b = document.getElementById('app-sidebar-box');
          const a = document.querySelector('#app-sidebar .app-sub-item.is-active, #app-sidebar .app-nav-item.is-active');
          const br = b ? b.getBoundingClientRect() : null;
          const ar = a ? a.getBoundingClientRect() : null;
          return {
            scrollTop: b ? b.scrollTop : 0,
            scrollHeight: b ? b.scrollHeight : 0,
            clientHeight: b ? b.clientHeight : 0,
            active: a ? a.textContent.trim() : null,
            isVisible: ar && br ? (ar.top >= br.top && ar.bottom <= br.bottom) : false,
            itemTop: ar && br ? Math.round(ar.top - br.top) : null
          };
        })()`,
        returnByValue: true
      });

      const data = res.result?.result?.value || res.result?.value;
      const fileName = p.split('/').pop();
      console.log(`[${i+1}/15] ${fileName.padEnd(42)} -> Active: ${String(data?.active).padEnd(25)} | ScrollTop: ${String(data?.scrollTop).padEnd(5)} | Visible: ${data?.isVisible} | Top: ${data?.itemTop}px`);
    }

    ws.close();
    chrome.kill();
  } catch (e) {
    console.error(e);
    chrome.kill();
  }
}

testAll();
