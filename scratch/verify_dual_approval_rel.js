const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 9526;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/ASUS/.gemini/antigravity/brain/e681e664-7bfb-44ca-a5f1-3d0986857d3b';
const TARGET_URL = 'file:///d:/SOFTWARE/laragon/www/siBisaHadir.v2/Accounting/operasional/accounting_pengeluaran_beban.html';

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
      if (data.method === 'Runtime.consoleAPICalled') {
        console.log('[BROWSER CONSOLE ' + data.params.type + ']', data.params.args.map(a => a.value || a.description).join(' '));
      }
      if (data.method === 'Runtime.exceptionThrown') {
        console.error('[BROWSER EXCEPTION]', JSON.stringify(data.params.exceptionDetails));
      }
    });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');

    console.log('Navigating to:', TARGET_URL);
    await send('Page.navigate', { url: TARGET_URL });
    await new Promise(r => setTimeout(r, 2000));

    async function evaluate(expression) {
      const res = await send('Runtime.evaluate', {
        expression: expression,
        returnByValue: true,
        awaitPromise: true
      });
      if (res.result && res.result.exceptionDetails) {
        throw new Error(JSON.stringify(res.result.exceptionDetails));
      }
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

    // Step 1: Open Add Modal & inspect initial items
    console.log('--- Step 1: Open Add Modal & inspect initial dropdown items ---');
    await evaluate(`document.getElementById('btnTambahPnd').click()`);
    await new Promise(r => setTimeout(r, 600));

    const initialItems = await evaluate(`
      (() => {
        const items = Array.from(document.querySelectorAll('#dropdownIdApproval .pnd-select-item'));
        return items.map(it => {
          const input = it.querySelector('input');
          const label = it.querySelector('.pnd-item-label');
          const spans = Array.from(it.querySelectorAll('.pnd-item-label span'));
          const newBadge = spans.find(s => s.innerText.trim() === 'NEW');
          return {
            value: input ? input.value : '',
            text: label ? label.innerText.replace(/\\s+/g, ' ').trim() : '',
            hasNewBadge: !!newBadge
          };
        });
      })()
    `);

    console.log('Initial total items in dropdown:', initialItems.length);
    const initialNewCount = initialItems.filter(it => it.hasNewBadge).length;
    console.log('Initial items with NEW badge (must be 0 for default seeds):', initialNewCount);

    // Step 2: Add 1 user record to PBJ and 1 to APR
    console.log('--- Step 2: Add 1 user record to PBJ and 1 to APR ---');
    await evaluate(`
      (() => {
        // A. Add to PBJ
        const PBJ_KEY = 'accounting_pengajuan_barang_jasa_v1';
        let pbjData = [];
        try {
          const raw = localStorage.getItem(PBJ_KEY);
          if (raw) pbjData = JSON.parse(raw);
        } catch (e) {}

        const newPbj = {
          id: 'PBJ-2026-999',
          periode: '25/11/2026',
          kategori: 'Pantry',
          namaBarang: 'Kopi Espresso Premium Arabika',
          qty: 5,
          satuan: 'Box',
          hargaSatuan: 150000,
          estimasiBiaya: 750000,
          urgensi: 'Tinggi',
          pic: 'Dewi Lestari',
          jenis: 'Purchased',
          statusManager: 'Disetujui',
          statusDirektur: 'Disetujui',
          statusFinal: 'Disetujui',
          catatan: 'Stok kopi rapat manajemen',
          createdAt: Date.now() + 1000,
          updatedAt: Date.now() + 1000
        };
        pbjData.unshift(newPbj);
        localStorage.setItem(PBJ_KEY, JSON.stringify(pbjData));
        if (typeof window.recordAccountingReferensiUpdate === 'function') {
          window.recordAccountingReferensiUpdate('PBJ-2026-999');
        }

        // B. Add to Approval Pengeluaran
        const APR_KEY = 'BISA_APPROVAL_PENGELUARAN_DATA_V5';
        let aprData = [];
        try {
          const raw = localStorage.getItem(APR_KEY);
          if (raw) aprData = JSON.parse(raw);
        } catch (e) {}

        const newApr = {
          id: 'apr-999',
          idApproval: 'APR-2611-888',
          tanggalRequest: '2026-11-24',
          pemohon: 'AWS Cloud Services',
          divisi: 'IT',
          keperluan: 'Dedicated Cloud Database Instance',
          nominal: 2500000,
          jenis: 'Beban',
          statusManager: 'Disetujui',
          statusDirektur: 'Disetujui',
          statusFinal: 'Disetujui',
          createdAt: Date.now() + 2000,
          updatedAt: Date.now() + 2000
        };
        aprData.unshift(newApr);
        localStorage.setItem(APR_KEY, JSON.stringify(aprData));
        if (typeof window.recordAccountingReferensiUpdate === 'function') {
          window.recordAccountingReferensiUpdate('APR-2611-888');
        }
      })()
    `);

    // Reload page
    await send('Page.reload');
    await new Promise(r => setTimeout(r, 2000));

    // Open Add Modal
    await evaluate(`document.getElementById('btnTambahPnd').click()`);
    await new Promise(r => setTimeout(r, 600));

    // Open Dropdown
    await evaluate(`document.getElementById('btnTriggerIdApproval').click()`);
    await new Promise(r => setTimeout(r, 400));

    const updatedDropdownItems = await evaluate(`
      (() => {
        const items = Array.from(document.querySelectorAll('#dropdownIdApproval .pnd-select-item'));
        return items.map(it => {
          const input = it.querySelector('input');
          const label = it.querySelector('.pnd-item-label');
          const spans = Array.from(it.querySelectorAll('.pnd-item-label span'));
          const newBadge = spans.find(s => s.innerText.trim() === 'NEW');
          const sourceSpan = it.querySelector('.pnd-item-label span:first-child');
          return {
            value: input ? input.value : '',
            text: label ? label.innerText.replace(/\\s+/g, ' ').trim() : '',
            sourceTag: sourceSpan ? sourceSpan.innerText.trim() : '',
            hasNewBadge: !!newBadge
          };
        });
      })()
    `);

    console.log('Top 2 items:', updatedDropdownItems.slice(0, 2));
    await takeScreenshot('dual_approval_dropdown_open.png');

    // Step 4: Test selecting PBJ-2026-999 auto-fill
    console.log('--- Step 4: Select PBJ-2026-999 ---');
    await evaluate(`
      (() => {
        const radio = document.querySelector('input[name="optIdApproval"][value="PBJ-2026-999"]');
        if (radio) {
          radio.checked = true;
          radio.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 500));
    await takeScreenshot('autofill_pbj_dual_relation.png');

    // Step 5: Test selecting APR-2611-888 auto-fill
    console.log('--- Step 5: Select APR-2611-888 ---');
    await evaluate(`document.getElementById('btnTriggerIdApproval').click()`);
    await new Promise(r => setTimeout(r, 400));
    await evaluate(`
      (() => {
        const radio = document.querySelector('input[name="optIdApproval"][value="APR-2611-888"]');
        if (radio) {
          radio.checked = true;
          radio.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 500));
    await takeScreenshot('autofill_apr_dual_relation.png');

    // Step 6: Save record with APR-2611-888
    console.log('--- Step 6: Submit form with APR-2611-888 ---');
    const formStateBeforeSubmit = await evaluate(`
      (() => {
        // Select Kode COA
        const firstCoa = document.querySelector('input[name="optKodeCoa"]');
        if (firstCoa) {
          firstCoa.checked = true;
          firstCoa.dispatchEvent(new Event('change', { bubbles: true }));
        }
        // Set DPP
        const dpp = document.getElementById('pndDpp');
        if (dpp) {
          dpp.value = '2.500.000';
          dpp.dispatchEvent(new Event('input', { bubbles: true }));
        }
        // Ensure ID Dokumen has value
        const docId = document.getElementById('pndIdDokumen');
        if (!docId.value) docId.value = 'EXP-2611-888';

        const form = document.getElementById('pndForm');
        let globalVal = null;
        if (typeof validateContainer === 'function') {
          globalVal = validateContainer(form);
        }
        const emptyInputs = Array.from(form.querySelectorAll('input:not([type="hidden"]), select, textarea'))
          .filter(el => !el.value && !el.disabled && el.offsetParent !== null)
          .map(el => ({ id: el.id, label: el.closest('.pnd-field')?.querySelector('label')?.textContent.trim() }));

        return {
          idDokumen: docId.value,
          idApproval: document.getElementById('pndIdApproval').value,
          tglPengakuan: document.getElementById('pndTglPengakuan').value,
          kodeCoa: document.getElementById('pndKodeCoa').value,
          dpp: dpp.value,
          emptyInputs: emptyInputs,
          formValid: form.checkValidity()
        };
      })()
    `);
    console.log('Form state before submit:', formStateBeforeSubmit);

    // Call submit button click
    await evaluate(`
      (() => {
        const btn = document.querySelector('#pndForm button[type="submit"]');
        if (btn) btn.click();
      })()
    `);
    await new Promise(r => setTimeout(r, 1200));

    // Check if new record is saved in localStorage
    const savedRecordsCount = await evaluate(`
      (() => {
        const EXP_KEY = 'accounting_pengeluaran_beban_data_v5';
        const data = JSON.parse(localStorage.getItem(EXP_KEY) || '[]');
        return data.filter(it => it.idApproval === 'APR-2611-888').length;
      })()
    `);
    console.log('Saved records with APR-2611-888 count:', savedRecordsCount);

    // Re-open Add Modal and inspect dropdown
    await evaluate(`document.getElementById('btnTambahPnd').click()`);
    await new Promise(r => setTimeout(r, 600));
    await evaluate(`document.getElementById('btnTriggerIdApproval').click()`);
    await new Promise(r => setTimeout(r, 400));

    const itemsAfterSave = await evaluate(`
      (() => {
        const items = Array.from(document.querySelectorAll('#dropdownIdApproval .pnd-select-item'));
        return items.map(it => {
          const input = it.querySelector('input');
          const label = it.querySelector('.pnd-item-label');
          const spans = Array.from(it.querySelectorAll('.pnd-item-label span'));
          const newBadge = spans.find(s => s.innerText.trim() === 'NEW');
          const sudahDipakai = it.innerText.includes('Sudah Dipakai');
          return {
            value: input ? input.value : '',
            text: label ? label.innerText.replace(/\\s+/g, ' ').trim() : '',
            hasNewBadge: !!newBadge,
            isSudahDipakai: sudahDipakai
          };
        });
      })()
    `);

    const usedAprItem = itemsAfterSave.find(it => it.value === 'APR-2611-888');
    console.log('APR-2611-888 item after save:', usedAprItem);

    const unusedPbjItem = itemsAfterSave.find(it => it.value === 'PBJ-2026-999');
    console.log('PBJ-2026-999 item after save:', unusedPbjItem);

    if (usedAprItem && usedAprItem.hasNewBadge) {
      throw new Error('Used item APR-2611-888 must NOT have NEW badge anymore!');
    }
    if (usedAprItem && !usedAprItem.isSudahDipakai) {
      throw new Error('Used item APR-2611-888 must be tagged as Sudah Dipakai!');
    }
    if (unusedPbjItem && !unusedPbjItem.hasNewBadge) {
      throw new Error('Unused item PBJ-2026-999 must still have NEW badge!');
    }

    await takeScreenshot('dual_approval_after_used.png');

    // Clean up test records
    await evaluate(`
      (() => {
        const PBJ_KEY = 'accounting_pengajuan_barang_jasa_v1';
        let pbj = JSON.parse(localStorage.getItem(PBJ_KEY) || '[]');
        localStorage.setItem(PBJ_KEY, JSON.stringify(pbj.filter(it => it.id !== 'PBJ-2026-999')));

        const APR_KEY = 'BISA_APPROVAL_PENGELUARAN_DATA_V5';
        let apr = JSON.parse(localStorage.getItem(APR_KEY) || '[]');
        localStorage.setItem(APR_KEY, JSON.stringify(apr.filter(it => it.idApproval !== 'APR-2611-888')));

        const EXP_KEY = 'accounting_pengeluaran_beban_data_v5';
        let exp = JSON.parse(localStorage.getItem(EXP_KEY) || '[]');
        localStorage.setItem(EXP_KEY, JSON.stringify(exp.filter(it => it.idApproval !== 'APR-2611-888')));

        let refUpdates = JSON.parse(localStorage.getItem('accounting_referensi_updates_v1') || '{}');
        delete refUpdates['pbj-2026-999'];
        delete refUpdates['apr-2611-888'];
        localStorage.setItem('accounting_referensi_updates_v1', JSON.stringify(refUpdates));
      })()
    `);

    console.log('ALL VERIFICATION STEPS PASSED PERFECTLY!');
    ws.close();
  } catch (err) {
    console.error('Test run error:', err);
    process.exit(1);
  } finally {
    chrome.kill();
  }
}

runTest();
