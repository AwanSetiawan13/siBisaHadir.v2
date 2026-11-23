const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const BASE_DIR = 'd:/SOFTWARE/laragon/www/siBisaHadir.v2';
const PORT = 9472;

async function testReferensiSortingAndNewBadge() {
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

    const testUrl = 'file:///' + path.join(BASE_DIR, 'Accounting/operasional/accounting_kas_bank.html').replace(/\\/g, '/');
    await send('Page.navigate', { url: testUrl });
    await new Promise(r => setTimeout(r, 1200));

    console.log('--- Step 1: Add a brand new invoice with current timestamp ---');
    await send('Runtime.evaluate', {
      expression: `(() => {
        const pndKey = 'accounting_pendapatan_data_v1';
        let list = [];
        try { list = JSON.parse(localStorage.getItem(pndKey) || '[]'); } catch(e){}
        if (!Array.isArray(list)) list = [];

        // Add a brand new invoice created right now
        const newInvoice = {
          id: 'pnd-test-' + Date.now(),
          idPendapatan: 'PND-TEST-001',
          noInvoice: 'INV-202611-999',
          tanggalPengakuan: '2026-11-23',
          customer: 'Klien Prioritas Baru',
          keterangan: 'Jasa Live Streaming Q4 2026',
          totalTagihan: 25000000,
          sisaPiutang: 25000000,
          statusLama: 'Belum Lunas',
          projectBrand: 'Campaign Mega Star',
          divisi: 'MCN',
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        list.unshift(newInvoice);
        localStorage.setItem(pndKey, JSON.stringify(list));
      })()`
    });

    // Refresh or re-open Kas & Bank to see updated list
    await send('Page.navigate', { url: testUrl });
    await new Promise(r => setTimeout(r, 1200));

    // Open Tambah Transaksi modal and open dropdown
    const step1State = await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.getElementById('btnTambahKb');
        if (btn) btn.click();
        const trigger = document.getElementById('btnTriggerReferensi');
        if (trigger) trigger.click();

        const container = document.getElementById('listReferensiDokumen');
        const items = Array.from(container.querySelectorAll('.kb-select-item')).map(item => {
          const input = item.querySelector('input');
          const hasNew = Boolean(item.querySelector('.ref-badge-new'));
          const hasUsed = Boolean(item.querySelector('.ref-badge-used'));
          return {
            code: input ? input.value : '',
            hasNew: hasNew,
            hasUsed: hasUsed,
            text: item.textContent.replace(/\\s+/g, ' ').trim()
          };
        });

        return {
          top5: items.slice(0, 6)
        };
      })()`,
      returnByValue: true
    });

    console.log('Step 1 (Dropdown Top Items after adding INV-202611-999):', JSON.stringify(step1State.result?.result?.value, null, 2));

    // Take screenshot of open dropdown showing new item at top with NEW badge
    const ss1 = await send('Page.captureScreenshot');
    fs.writeFileSync('C:/Users/ASUS/.gemini/antigravity/brain/e681e664-7bfb-44ca-a5f1-3d0986857d3b/referensi_dokumen_with_new_badge.png', Buffer.from(ss1.result.data, 'base64'));
    console.log('Screenshot saved to referensi_dokumen_with_new_badge.png');

    console.log('\n--- Step 2: Use INV-202611-999 in a transaction and save ---');
    await send('Runtime.evaluate', {
      expression: `(() => {
        // Select INV-202611-999
        const radio = Array.from(document.querySelectorAll('input[name="optReferensi"]')).find(r => r.value === 'INV-202611-999');
        if (radio) {
          radio.checked = true;
          radio.dispatchEvent(new Event('change'));
        }

        // Fill required fields
        document.getElementById('kbTanggal').value = '23/11/2026';
        document.getElementById('kbUangMasuk').value = '25.000.000';
        document.getElementById('kbKeterangan').value = 'Pelunasan INV-202611-999';

        // Submit form
        document.getElementById('kbForm').dispatchEvent(new Event('submit', { cancelable: true }));
      })()`
    });

    await new Promise(r => setTimeout(r, 800));

    console.log('\n--- Step 3: Re-open Tambah Transaksi and check if NEW is removed from INV-202611-999 ---');
    const step3State = await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.getElementById('btnTambahKb');
        if (btn) btn.click();
        const trigger = document.getElementById('btnTriggerReferensi');
        if (trigger) trigger.click();

        const container = document.getElementById('listReferensiDokumen');
        const items = Array.from(container.querySelectorAll('.kb-select-item')).map(item => {
          const input = item.querySelector('input');
          const hasNew = Boolean(item.querySelector('.ref-badge-new'));
          const hasUsed = Boolean(item.querySelector('.ref-badge-used'));
          return {
            code: input ? input.value : '',
            hasNew: hasNew,
            hasUsed: hasUsed,
            text: item.textContent.replace(/\\s+/g, ' ').trim()
          };
        });

        const target = items.find(it => it.code === 'INV-202611-999');
        return {
          targetItem: target,
          top5: items.slice(0, 6)
        };
      })()`,
      returnByValue: true
    });

    console.log('Step 3 (Status of INV-202611-999 after being used):', JSON.stringify(step3State.result?.result?.value, null, 2));

    const ss2 = await send('Page.captureScreenshot');
    fs.writeFileSync('C:/Users/ASUS/.gemini/antigravity/brain/e681e664-7bfb-44ca-a5f1-3d0986857d3b/referensi_dokumen_after_used.png', Buffer.from(ss2.result.data, 'base64'));
    console.log('Screenshot saved to referensi_dokumen_after_used.png');

    ws.close();
    chrome.kill();
  } catch (e) {
    console.error(e);
    chrome.kill();
  }
}

testReferensiSortingAndNewBadge();
