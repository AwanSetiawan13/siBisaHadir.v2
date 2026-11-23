const { execSync } = require('child_process');
const path = require('path');
const puppeteer = require('puppeteer');

async function testPage() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.message);
  });

  const fileUrl = 'file:///' + path.resolve('Accounting/operasional/accounting_tagihan_berkala.html').replace(/\\/g, '/');
  console.log('Navigating to:', fileUrl);
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });

  console.log('Console errors:', consoleErrors);

  // Check KPI cards
  const kpis = await page.evaluate(() => {
    return {
      totalTagihan: document.getElementById('cardTotalTagihan')?.textContent,
      berlangganan: document.getElementById('cardTerbayar')?.textContent,
      terlewat: document.getElementById('cardJatuhTempo')?.textContent,
      totalBiaya: document.getElementById('cardTotalBiaya')?.textContent
    };
  });
  console.log('KPIs:', kpis);

  // Check Table Rows
  const rows = await page.evaluate(() => {
    const trs = document.querySelectorAll('#tbTableBody tr');
    return Array.from(trs).map(tr => {
      const tds = tr.querySelectorAll('td');
      return Array.from(tds).map(td => td.textContent.trim());
    });
  });
  console.log(`Rendered ${rows.length} rows in table.`);
  if (rows.length > 0) {
    console.log('Row 1:', rows[0]);
  }

  // Screenshot initial table
  const screenshotPathTable = path.resolve('C:/Users/ASUS/.gemini/antigravity/brain/e681e664-7bfb-44ca-a5f1-3d0986857d3b/tagihan_berkala_table_updated.png');
  await page.screenshot({ path: screenshotPathTable, fullPage: false });
  console.log('Saved table screenshot to:', screenshotPathTable);

  // Test Tambah Tagihan Modal Open
  console.log('Clicking Tambah Tagihan button...');
  await page.click('#btnTambahTagihan');
  await new Promise(r => setTimeout(r, 400));

  const modalActive = await page.evaluate(() => {
    const modal = document.getElementById('tbFormModal');
    return modal && modal.classList.contains('is-active');
  });
  console.log('Modal is active:', modalActive);

  // Screenshot modal open
  const screenshotPathModal = path.resolve('C:/Users/ASUS/.gemini/antigravity/brain/e681e664-7bfb-44ca-a5f1-3d0986857d3b/tagihan_berkala_form_modal.png');
  await page.screenshot({ path: screenshotPathModal, fullPage: false });
  console.log('Saved modal screenshot to:', screenshotPathModal);

  // Test Dynamic Akses: Change Akses from Email to Nomor, then Lainnya
  console.log('Testing Dynamic Akses...');
  await page.select('#formAksesType', 'Nomor');
  let inputTypeNomor = await page.evaluate(() => {
    const input = document.getElementById('formAksesValue');
    const label = document.getElementById('formAksesValueLabel');
    return { type: input.type, placeholder: input.placeholder, label: label.textContent };
  });
  console.log('Akses Nomor:', inputTypeNomor);

  await page.select('#formAksesType', 'Lainnya');
  let inputTypeLainnya = await page.evaluate(() => {
    const input = document.getElementById('formAksesValue');
    const label = document.getElementById('formAksesValueLabel');
    return { type: input.type, placeholder: input.placeholder, label: label.textContent };
  });
  console.log('Akses Lainnya:', inputTypeLainnya);

  // Test Umur Ekonomis & Auto Calculation of Jatuh Tempo & Status
  console.log('Testing Umur Ekonomis & Auto Calculation...');
  // Fill Tanggal Bayar: 2026-11-20
  await page.evaluate(() => {
    const tgl = document.getElementById('formTanggalBayar');
    tgl.value = '2026-11-20';
    tgl.dispatchEvent(new Event('change'));
  });

  // Select 2 Minggu
  await page.select('#formUmurEkonomis', '2 Minggu');
  let calc2Minggu = await page.evaluate(() => {
    return {
      jatuhTempo: document.getElementById('formJatuhTempo').value,
      status: document.getElementById('formStatus').value
    };
  });
  console.log('Umur 2 Minggu (Tgl 2026-11-20):', calc2Minggu);

  // Select 1 Bulan
  await page.select('#formUmurEkonomis', '1 Bulan');
  let calc1Bulan = await page.evaluate(() => {
    return {
      jatuhTempo: document.getElementById('formJatuhTempo').value,
      status: document.getElementById('formStatus').value
    };
  });
  console.log('Umur 1 Bulan (Tgl 2026-11-20):', calc1Bulan);

  // Select 3 Bulan
  await page.select('#formUmurEkonomis', '3 Bulan');
  let calc3Bulan = await page.evaluate(() => {
    return {
      jatuhTempo: document.getElementById('formJatuhTempo').value,
      status: document.getElementById('formStatus').value
    };
  });
  console.log('Umur 3 Bulan (Tgl 2026-11-20):', calc3Bulan);

  // Select Costom
  await page.select('#formUmurEkonomis', 'Costom');
  let customWrapVisible = await page.evaluate(() => {
    const wrap = document.getElementById('formUmurEkonomisCustomWrap');
    return wrap && wrap.style.display !== 'none';
  });
  console.log('Custom wrap visible when Costom selected:', customWrapVisible);

  await page.type('#formUmurEkonomisCustomDays', '10');
  let calcCustom = await page.evaluate(() => {
    return {
      jatuhTempo: document.getElementById('formJatuhTempo').value,
      status: document.getElementById('formStatus').value
    };
  });
  console.log('Umur Custom 10 Hari (Tgl 2026-11-20):', calcCustom);

  // Test adding a record and submitting
  console.log('Submitting new Tagihan Berkala record...');
  await page.type('#formItemTagihan', 'Lisensi Antivirus Server Endpoint');
  await page.select('#formUmurEkonomis', '1 Bulan');
  await page.select('#formAksesType', 'Email');
  await page.type('#formAksesValue', 'security@bisamedia.id');
  await page.type('#formHarga', '1500000');
  await page.type('#formKeterangan', 'Lisensi proteksi 10 server VM cloud production');

  await page.click('#tbForm button[type="submit"]');
  await new Promise(r => setTimeout(r, 600));

  // Check if added into table
  const afterSubmitRows = await page.evaluate(() => {
    const trs = document.querySelectorAll('#tbTableBody tr');
    return Array.from(trs).map(tr => {
      const tds = tr.querySelectorAll('td');
      return Array.from(tds).map(td => td.textContent.trim());
    });
  });
  console.log(`After submit: ${afterSubmitRows.length} rows in table.`);
  console.log('Newly inserted row 1:', afterSubmitRows[0]);

  // Screenshot updated table with new record
  const screenshotPathAfterSubmit = path.resolve('C:/Users/ASUS/.gemini/antigravity/brain/e681e664-7bfb-44ca-a5f1-3d0986857d3b/tagihan_berkala_after_add.png');
  await page.screenshot({ path: screenshotPathAfterSubmit, fullPage: false });
  console.log('Saved after submit screenshot to:', screenshotPathAfterSubmit);

  await browser.close();
  console.log('TEST COMPLETED SUCCESSFULLY!');
}

testPage().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
