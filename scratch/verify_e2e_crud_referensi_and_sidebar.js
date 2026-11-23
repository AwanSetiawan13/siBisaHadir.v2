const { spawn } = require('child_process');
const path = require('path');

const BASE_DIR = 'd:/SOFTWARE/laragon/www/siBisaHadir.v2';
const PORT = 9489;

async function runVerification() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=' + PORT,
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1440,900',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1200));

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

    const toUrl = (rel) => 'file:///' + path.join(BASE_DIR, rel).replace(/\\/g, '/');

    console.log('=== STEP 1: Add new Pendapatan via CRUD form ===');
    await send('Page.navigate', { url: toUrl('Accounting/operasional/accounting_pendapatan.html') });
    await new Promise(r => setTimeout(r, 900));

    const pndAdd = await send('Runtime.evaluate', {
      expression: `(() => {
        window.alert = (m) => { window.__lastAlert = m; };
        const btnTambah = document.getElementById('btnTambahPnd') || document.getElementById('btnTambahPendapatan');
        if (btnTambah) btnTambah.click();

        const generatedInv = document.getElementById('pndNoInvoice').value;
        document.getElementById('pndCustomer').value = 'PT Klien Prioritas Baru';
        document.getElementById('pndKeterangan').value = 'Project Kampanye Eksklusif';
        const dpp = document.getElementById('pndDpp');
        dpp.value = '18500000';
        dpp.dispatchEvent(new Event('input', { bubbles: true }));
        document.getElementById('pndJatuhTempo').value = '01/12/2026';
        document.getElementById('pndJatuhTempo').dataset.isoValue = '2026-12-01';
        document.getElementById('pndProjectBrand').value = 'Brand Eksklusif 2026';
        document.getElementById('pndDivisi').value = 'MCN';

        const form = document.getElementById('pndForm');
        form.setAttribute('data-skip-required-alert', 'true');
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

        const savedList = JSON.parse(localStorage.getItem('accounting_pendapatan_data_v1') || '[]');
        return {
          generatedInv,
          topSavedInv: savedList[0] ? savedList[0].noInvoice : null,
          updatesMap: JSON.parse(localStorage.getItem('accounting_referensi_updates_v1') || '{}')
        };
      })()`,
      returnByValue: true
    });
    const addedInv = pndAdd.result?.result?.value?.generatedInv;
    console.log('Pendapatan CRUD Result:', JSON.stringify(pndAdd.result?.result?.value));

    console.log('\n=== STEP 2: Verify in Kas & Bank Referensi Dokumen that new Invoice is #1 with NEW ===');
    await send('Page.navigate', { url: toUrl('Accounting/operasional/accounting_kas_bank.html') });
    await new Promise(r => setTimeout(r, 900));

    const kbCheck1 = await send('Runtime.evaluate', {
      expression: `(() => {
        window.alert = (m) => { window.__lastAlert = m; };
        document.getElementById('btnTambahKb').click();
        document.getElementById('btnTriggerReferensi').click();

        const items = Array.from(document.querySelectorAll('#listReferensiDokumen .kb-select-item')).map(el => {
          const inp = el.querySelector('input[name="optReferensi"]');
          return {
            code: inp ? inp.value : '',
            hasNew: !!el.querySelector('.ref-badge-new'),
            hasUsed: !!el.querySelector('.ref-badge-used'),
            text: el.textContent.replace(/\\s+/g, ' ').trim()
          };
        });
        return items.slice(0, 5);
      })()`,
      returnByValue: true
    });
    console.log('Top 5 Referensi Dokumen after Pendapatan CRUD:', JSON.stringify(kbCheck1.result?.result?.value, null, 2));

    console.log('\n=== STEP 3: Add new Pengeluaran & Beban via CRUD form ===');
    await send('Page.navigate', { url: toUrl('Accounting/operasional/accounting_pengeluaran_beban.html') });
    await new Promise(r => setTimeout(r, 900));

    const expAdd = await send('Runtime.evaluate', {
      expression: `(() => {
        window.alert = (m) => { window.__lastAlert = m; };
        const btn = document.getElementById('btnTambahPnd') || document.getElementById('btnTambahPengeluaran');
        if (btn) btn.click();

        const docId = document.getElementById('pndIdDokumen').value;
        const aprRadio = document.querySelector('input[name="optIdApproval"]');
        if (aprRadio) {
          aprRadio.checked = true;
          aprRadio.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          document.getElementById('pndIdApproval').value = 'APR-2609-001';
        }
        document.getElementById('pndVendorKaryawan').value = 'PT Vendor Cloud Baru';
        document.getElementById('pndDivisi').value = 'IT';
        document.getElementById('pndKeterangan').value = 'Upgrade Cluster Database Baru';
        const dpp = document.getElementById('pndDpp');
        if (dpp) {
          dpp.value = '4200000';
          dpp.dispatchEvent(new Event('input', { bubbles: true }));
        }

        const form = document.getElementById('pndForm');
        form.setAttribute('data-skip-required-alert', 'true');
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

        return {
          docId,
          updatesMap: JSON.parse(localStorage.getItem('accounting_referensi_updates_v1') || '{}')
        };
      })()`,
      returnByValue: true
    });
    const addedExp = expAdd.result?.result?.value?.docId;
    console.log('Pengeluaran CRUD Result:', JSON.stringify(expAdd.result?.result?.value));

    console.log('\n=== STEP 4: Verify in Kas & Bank that new Pengeluaran is #1 (NEW) and new Invoice is #2 (NEW) ===');
    await send('Page.navigate', { url: toUrl('Accounting/operasional/accounting_kas_bank.html') });
    await new Promise(r => setTimeout(r, 900));

    const kbCheck2 = await send('Runtime.evaluate', {
      expression: `(() => {
        window.alert = (m) => { window.__lastAlert = m; };
        document.getElementById('btnTambahKb').click();
        document.getElementById('btnTriggerReferensi').click();

        const items = Array.from(document.querySelectorAll('#listReferensiDokumen .kb-select-item')).map(el => {
          const inp = el.querySelector('input[name="optReferensi"]');
          return {
            code: inp ? inp.value : '',
            hasNew: !!el.querySelector('.ref-badge-new'),
            hasUsed: !!el.querySelector('.ref-badge-used'),
            text: el.textContent.replace(/\\s+/g, ' ').trim()
          };
        });
        return items.slice(0, 5);
      })()`,
      returnByValue: true
    });
    console.log('Top 5 Referensi Dokumen after Pengeluaran CRUD:', JSON.stringify(kbCheck2.result?.result?.value, null, 2));

    console.log('\n=== STEP 5: Use the #1 Reference (' + addedExp + ') in Kas & Bank and verify NEW badge is removed ===');
    const kbUse = await send('Runtime.evaluate', {
      expression: `(() => {
        const targetCode = ${JSON.stringify(addedExp)};
        const radio = Array.from(document.querySelectorAll('input[name="optReferensi"]')).find(r => r.value === targetCode);
        if (radio) {
          radio.checked = true;
          radio.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const coaRadio = Array.from(document.querySelectorAll('input[name="optKodeCoa"]')).find(r => r.value === '1002');
        if (coaRadio) {
          coaRadio.checked = true;
          coaRadio.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const form = document.getElementById('kbForm');
        form.setAttribute('data-skip-required-alert', 'true');
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

        document.getElementById('btnTambahKb').click();
        document.getElementById('btnTriggerReferensi').click();

        const items = Array.from(document.querySelectorAll('#listReferensiDokumen .kb-select-item')).map(el => {
          const inp = el.querySelector('input[name="optReferensi"]');
          return {
            code: inp ? inp.value : '',
            hasNew: !!el.querySelector('.ref-badge-new'),
            hasUsed: !!el.querySelector('.ref-badge-used')
          };
        });
        const usedItem = items.find(i => i.code === targetCode);
        return {
          top3: items.slice(0, 4),
          usedItemState: usedItem
        };
      })()`,
      returnByValue: true
    });
    console.log('After using ' + addedExp + ' in Kas & Bank:', JSON.stringify(kbUse.result?.result?.value, null, 2));

    console.log('\n=== STEP 6: Verify Sidebar "Profit Project & Brand" label, anti-translate guard, and bold styling across modules ===');
    const modulesToCheck = [
      'Accounting/operasional/accounting_kas_bank.html',
      'Accounting/operasional/accounting_pendapatan.html',
      'Accounting/laporan_keuangan/accounting_profit_project_brand.html'
    ];

    for (const mod of modulesToCheck) {
      await send('Page.navigate', { url: toUrl(mod) });
      await new Promise(r => setTimeout(r, 700));
      const sbState = await send('Runtime.evaluate', {
        expression: `(() => {
          const link = document.querySelector('#app-sidebar a[href*="accounting_profit_project_brand.html"]');
          const span = link ? link.querySelector('.app-menu-label') : null;
          if (span) {
            span.textContent = 'Proyek Keuntungan & Merek';
          }
          return new Promise(resolve => {
            setTimeout(() => {
              const cs = span ? window.getComputedStyle(span) : null;
              const linkCs = link ? window.getComputedStyle(link) : null;
              resolve({
                module: window.location.pathname.split('/').pop(),
                restoredLabel: span ? span.textContent : null,
                translateAttr: link ? link.getAttribute('translate') : null,
                hasNotranslate: link ? link.classList.contains('notranslate') : false,
                fontWeight: cs ? cs.fontWeight : null,
                color: cs ? cs.color : null,
                isActive: link ? link.classList.contains('is-active') : false,
                bgColor: linkCs ? linkCs.backgroundColor : null
              });
            }, 60);
          });
        })()`,
        awaitPromise: true,
        returnByValue: true
      });
      console.log('Sidebar check:', JSON.stringify(sbState.result?.result?.value));
    }

    await send('Runtime.evaluate', { expression: 'localStorage.clear();' });

    ws.close();
    chrome.kill();
  } catch (e) {
    console.error(e);
    chrome.kill();
  }
}

runVerification();
