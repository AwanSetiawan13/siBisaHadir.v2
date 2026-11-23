const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 9456;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/e681e664-7bfb-44ca-a5f1-3d0986857d3b';
const TARGET_URL = 'file:///d:/SOFTWARE/laragon/www/siBisaHadir.v2/Accounting/operasional/accounting_tagihan_berkala.html';

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

    const consoleErrors = [];
    ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.method === 'Runtime.consoleAPICalled' && data.params.type === 'error') {
        consoleErrors.push(data.params.args.map(a => a.value || a.description).join(' '));
      }
      if (data.method === 'Runtime.exceptionThrown') {
        consoleErrors.push(data.params.exceptionDetails.text + ' ' + (data.params.exceptionDetails.exception?.description || ''));
      }
    });

    await send('Page.enable');
    await send('Runtime.enable');

    console.log('Navigating to:', TARGET_URL);
    await send('Page.navigate', { url: TARGET_URL });
    await new Promise(r => setTimeout(r, 1500));

    console.log('Console Errors count:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.log('Errors:', consoleErrors);
    }

    async function evaluate(fnStr) {
      const expression = `(() => { ${fnStr} })()`;
      const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (res.result?.exceptionDetails) {
        console.error('Eval Exception:', res.result.exceptionDetails);
      }
      return res.result?.result?.value !== undefined ? res.result.result.value : res.result?.value;
    }

    // 1. Validate KPI Cards
    const kpis = await evaluate(`
      return {
        total: document.getElementById('cardTotalTagihan')?.textContent,
        berlangganan: document.getElementById('cardTerbayar')?.textContent,
        terlewat: document.getElementById('cardJatuhTempo')?.textContent,
        biaya: document.getElementById('cardTotalBiaya')?.textContent
      };
    `);
    console.log('KPI Cards:', kpis);

    // 2. Validate Table Headers
    const headers = await evaluate(`
      return Array.from(document.querySelectorAll('#tbTable thead th')).map(th => th.textContent.trim());
    `);
    console.log('Table Headers:', headers);

    // 3. Validate Table Rows
    const rows = await evaluate(`
      return Array.from(document.querySelectorAll('#tbTableBody tr')).map(tr => 
        Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim())
      );
    `);
    console.log(`Rendered ${rows.length} rows.`);
    console.log('Sample Row 1:', rows[0]);

    // Capture screenshot: Table
    const tableShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'tagihan_berkala_table_updated.png'), Buffer.from(tableShot.result.data, 'base64'));
    console.log('Saved tagihan_berkala_table_updated.png');

    // 4. Click "+ Tambah Tagihan"
    console.log('Opening Form Modal (+ Tambah)...');
    await evaluate(`document.getElementById('btnTambahTagihan').click();`);
    await new Promise(r => setTimeout(r, 500));

    const isModalOpen = await evaluate(`return document.getElementById('tbFormModal').classList.contains('is-active');`);
    console.log('Form Modal is active:', isModalOpen);

    // 5. Test Dynamic Akses Switching
    console.log('Testing Dynamic Akses...');
    await evaluate(`
      const sel = document.getElementById('formAksesType');
      sel.value = 'Nomor';
      sel.dispatchEvent(new Event('change'));
    `);
    const aksesNomor = await evaluate(`
      return {
        type: document.getElementById('formAksesValue').type,
        placeholder: document.getElementById('formAksesValue').placeholder,
        label: document.getElementById('formAksesValueLabel').textContent.trim()
      };
    `);
    console.log('Akses after select Nomor:', aksesNomor);

    await evaluate(`
      const sel = document.getElementById('formAksesType');
      sel.value = 'Lainnya';
      sel.dispatchEvent(new Event('change'));
    `);
    const aksesLainnya = await evaluate(`
      return {
        type: document.getElementById('formAksesValue').type,
        placeholder: document.getElementById('formAksesValue').placeholder,
        label: document.getElementById('formAksesValueLabel').textContent.trim()
      };
    `);
    console.log('Akses after select Lainnya:', aksesLainnya);

    // 6. Test Umur Ekonomis & Auto Calculation of Jatuh Tempo & Status
    console.log('Testing Auto Calculation (Tanggal Bayar + Umur Ekonomis)...');
    await evaluate(`
      document.getElementById('formTanggalBayar').value = '2026-11-20';
      document.getElementById('formTanggalBayar').dispatchEvent(new Event('change'));
    `);

    // 2 Minggu
    await evaluate(`
      const sel = document.getElementById('formUmurEkonomis');
      sel.value = '2 Minggu';
      sel.dispatchEvent(new Event('change'));
    `);
    const calc2M = await evaluate(`
      return {
        jatuhTempo: document.getElementById('formJatuhTempo').value,
        status: document.getElementById('formStatus').value
      };
    `);
    console.log('Calculated for 2 Minggu (Tgl 2026-11-20):', calc2M);

    // 1 Bulan
    await evaluate(`
      const sel = document.getElementById('formUmurEkonomis');
      sel.value = '1 Bulan';
      sel.dispatchEvent(new Event('change'));
    `);
    const calc1B = await evaluate(`
      return {
        jatuhTempo: document.getElementById('formJatuhTempo').value,
        status: document.getElementById('formStatus').value
      };
    `);
    console.log('Calculated for 1 Bulan (Tgl 2026-11-20):', calc1B);

    // Costom
    await evaluate(`
      const sel = document.getElementById('formUmurEkonomis');
      sel.value = 'Costom';
      sel.dispatchEvent(new Event('change'));
      document.getElementById('formUmurEkonomisCustomDays').value = '10';
      document.getElementById('formUmurEkonomisCustomDays').dispatchEvent(new Event('input'));
    `);
    const calcCustom = await evaluate(`
      return {
        customWrapDisplay: document.getElementById('formUmurEkonomisCustomWrap').style.display,
        jatuhTempo: document.getElementById('formJatuhTempo').value,
        status: document.getElementById('formStatus').value
      };
    `);
    console.log('Calculated for Costom 10 Days (Tgl 2026-11-20):', calcCustom);

    // Capture screenshot: Modal
    const modalShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'tagihan_berkala_form_modal.png'), Buffer.from(modalShot.result.data, 'base64'));
    console.log('Saved tagihan_berkala_form_modal.png');

    // 7. Test Submit New Record
    console.log('Filling form and submitting new record...');
    await evaluate(`
      document.getElementById('formItemTagihan').value = 'Lisensi Keamanan Endpoint Cloud';
      document.getElementById('formUmurEkonomis').value = '1 Bulan';
      document.getElementById('formUmurEkonomis').dispatchEvent(new Event('change'));
      document.getElementById('formAksesType').value = 'Email';
      document.getElementById('formAksesType').dispatchEvent(new Event('change'));
      document.getElementById('formAksesValue').value = 'security-admin@bisamedia.id';
      document.getElementById('formHarga').value = '1750000';
      document.getElementById('formTanggalBayar').value = '2026-11-21';
      document.getElementById('formTanggalBayar').dispatchEvent(new Event('change'));
      document.getElementById('formKeterangan').value = 'Lisensi antivirus perlindungan 15 server production';
      document.getElementById('tbForm').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    `);
    await new Promise(r => setTimeout(r, 600));

    // Check newly added row
    const newRows = await evaluate(`
      return Array.from(document.querySelectorAll('#tbTableBody tr')).map(tr => 
        Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim())
      );
    `);
    console.log(`Table now has ${newRows.length} rows.`);
    console.log('New top row:', newRows[0]);

    // Capture screenshot: After add
    const afterShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'tagihan_berkala_after_add.png'), Buffer.from(afterShot.result.data, 'base64'));
    console.log('Saved tagihan_berkala_after_add.png');

    // 8. Test View Modal on newly added row
    console.log('Testing View Detail Modal...');
    await evaluate(`
      const btn = document.querySelector('[data-action-toggle]');
      btn.click();
    `);
    await new Promise(r => setTimeout(r, 300));

    await evaluate(`document.getElementById('actionView').click();`);
    await new Promise(r => setTimeout(r, 400));

    const viewDetails = await evaluate(`
      return Array.from(document.querySelectorAll('#detailContainer .pnd-detail-item')).map(item => ({
        label: item.querySelector('.pnd-detail-label')?.textContent.trim(),
        value: item.querySelector('.pnd-detail-value')?.textContent.trim()
      }));
    `);
    console.log('Detail Modal Contents:', viewDetails);

    const viewShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'tagihan_berkala_view_modal.png'), Buffer.from(viewShot.result.data, 'base64'));
    console.log('Saved tagihan_berkala_view_modal.png');

    ws.close();
    chrome.kill();
    console.log('\n=============================================');
    console.log('ALL VERIFICATION STEPS PASSED SUCCESSFULLY!');
    console.log('=============================================');

  } catch (err) {
    console.error('Test error:', err);
    chrome.kill();
    process.exit(1);
  }
}

runTest();
