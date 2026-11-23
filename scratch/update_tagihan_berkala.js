const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('Accounting/operasional/accounting_tagihan_berkala.html');
let content = fs.readFileSync(targetFile, 'utf8');

console.log('Original length:', content.length);

// 1. Update CSS badges
const oldBadgeCss = `    .badge-lunas {
      background-color: #dcfce7;
      color: #15803d;
      border: 1px solid #bbf7d0;
    }

    .badge-menjelang {
      background-color: #fef3c7;
      color: #b45309;
      border: 1px solid #fde68a;
    }

    .badge-terlambat {
      background-color: #fee2e2;
      color: #b91c1c;
      border: 1px solid #fecaca;
    }`;

const newBadgeCss = `    .badge-berlangganan,
    .badge-lunas {
      background-color: #dcfce7;
      color: #15803d;
      border: 1px solid #bbf7d0;
    }

    .badge-terlewat,
    .badge-menjelang {
      background-color: #fef3c7;
      color: #b45309;
      border: 1px solid #fde68a;
    }

    .badge-berhenti,
    .badge-terlambat {
      background-color: #fee2e2;
      color: #b91c1c;
      border: 1px solid #fecaca;
    }`;

if (content.includes(oldBadgeCss)) {
  content = content.replace(oldBadgeCss, newBadgeCss);
  console.log('Updated badge CSS');
} else {
  console.log('Badge CSS not matched directly, using regex replacement');
  content = content.replace(/\.badge-lunas\s*\{[\s\S]*?\.badge-terlambat\s*\{[^}]*\}/, newBadgeCss);
}

// 2. Update KPI cards labels
content = content.replace(
  /<span class="pnd-card-label">Sudah Terbayar<\/span>/g,
  '<span class="pnd-card-label">Berlangganan</span>'
);
content = content.replace(
  /<span class="pnd-card-label">Jatuh Tempo Bulan Ini<\/span>/g,
  '<span class="pnd-card-label">Terlewat 1 - 7 Hari</span>'
);

// 3. Update Filter Umur Ekonomis & Status
const oldFiltersRegex = /<div class="pnd-filter-group">\s*<label class="pnd-filter-label" for="filterUmurEkonomis">[\s\S]*?<\/div>\s*<div class="pnd-filter-group">\s*<label class="pnd-filter-label" for="filterStatus">[\s\S]*?<\/div>/;
const newFiltersHtml = `<div class="pnd-filter-group">
                  <label class="pnd-filter-label" for="filterUmurEkonomis">Umur Ekonomis</label>
                  <select id="filterUmurEkonomis" class="pnd-filter-select">
                    <option value="">Semua Umur Ekonomis</option>
                    <option value="2 Minggu">2 Minggu</option>
                    <option value="1 Bulan">1 Bulan</option>
                    <option value="3 Bulan">3 Bulan</option>
                    <option value="6 Bulan">6 Bulan</option>
                    <option value="Costom">Costom</option>
                  </select>
                </div>

                <div class="pnd-filter-group">
                  <label class="pnd-filter-label" for="filterStatus">Status Tagihan</label>
                  <select id="filterStatus" class="pnd-filter-select">
                    <option value="">Semua Status</option>
                    <option value="Berlangganan">Berlangganan</option>
                    <option value="Terlewat 1 - 7 Hari">Terlewat 1 - 7 Hari</option>
                    <option value="Berhenti Berlangganan">Berhenti Berlangganan</option>
                  </select>
                </div>`;

if (oldFiltersRegex.test(content)) {
  content = content.replace(oldFiltersRegex, newFiltersHtml);
  console.log('Updated Toolbar Filter popover');
}

// 4. Update Table Header (Remove Keterangan Tambahan, ensure exact 8 columns + No + Aksi)
const oldTheadRegex = /<thead>\s*<tr>\s*<th[^>]*>#<\/th>[\s\S]*?<\/tr>\s*<\/thead>/;
const newTheadHtml = `<thead>
              <tr>
                <th style="width: 44px; text-align: center;">No.</th>
                <th>Item Tagihan</th>
                <th>Umur Ekonomis</th>
                <th>Akses</th>
                <th style="text-align: right;">Harga</th>
                <th style="text-align: center;">Tanggal Bayar</th>
                <th style="text-align: center;">Jatuh Tempo</th>
                <th style="text-align: center;">Status</th>
                <th>Keterangan</th>
                <th class="col-sticky-action" style="width: 60px; text-align: center;">Aksi</th>
              </tr>
            </thead>`;

if (oldTheadRegex.test(content)) {
  content = content.replace(oldTheadRegex, newTheadHtml);
  console.log('Updated Table thead');
}

// 5. Update Form Modal
const oldModalRegex = /<!-- ===== MODAL TAMBAH \/ EDIT TAGIHAN BERKALA ===== -->[\s\S]*?<\/form>\s*<\/div>\s*<\/div>/;
const newModalHtml = `<!-- ===== MODAL TAMBAH / EDIT TAGIHAN BERKALA ===== -->
  <div id="tbFormModal" class="pnd-modal-overlay">
    <div class="pnd-modal-box">
      <div class="pnd-modal-accent"></div>

      <div class="pnd-modal-header">
        <h2 class="pnd-modal-title">
          <em><span id="tbFormActionText">Tambah</span></em> Tagihan Berkala
        </h2>
        <button type="button" class="pnd-modal-close" data-close-modal="tbFormModal" aria-label="Tutup">&times;</button>
      </div>

      <div class="pnd-dashed-divider"></div>

      <form id="tbForm" autocomplete="off">
        <input type="hidden" id="editIndex" value="-1" />

        <div class="pnd-form-grid">
          <!-- 1. Item Tagihan (Input Data Mandiri) -->
          <div class="pnd-form-group">
            <label class="pnd-form-label" for="formItemTagihan">Item Tagihan <span style="color:#ef4444;">*</span></label>
            <input type="text" id="formItemTagihan" class="pnd-form-input"
              placeholder="Contoh: Sewa Server VPS / Cloud Storage" required />
          </div>

          <!-- 2. Umur Ekonomis (Dropdown: 2 Minggu, 1 Bulan, 3 Bulan, 6 bulan, Costom) -->
          <div class="pnd-form-group">
            <label class="pnd-form-label" for="formUmurEkonomis">Umur Ekonomis <span style="color:#ef4444;">*</span></label>
            <select id="formUmurEkonomis" class="pnd-form-select" required>
              <option value="" disabled selected>Pilih Umur Ekonomis</option>
              <option value="2 Minggu">2 Minggu</option>
              <option value="1 Bulan">1 Bulan</option>
              <option value="3 Bulan">3 Bulan</option>
              <option value="6 Bulan">6 Bulan</option>
              <option value="Costom">Costom</option>
            </select>
            <div id="formUmurEkonomisCustomWrap" style="display: none; margin-top: 8px;">
              <div style="display: flex; gap: 8px; align-items: center;">
                <input type="number" id="formUmurEkonomisCustomDays" class="pnd-form-input" min="1" placeholder="Durasi custom (hari)" style="flex: 1;" />
                <span style="font-size: 13px; color: #64748b; font-weight: 500;">Hari</span>
              </div>
            </div>
          </div>

          <!-- 3. Akses (Dropdown: Email, Nomor, Lainnya + Dynamic Input) -->
          <div class="pnd-form-group">
            <label class="pnd-form-label" for="formAksesType">Akses <span style="color:#ef4444;">*</span></label>
            <select id="formAksesType" class="pnd-form-select" required>
              <option value="Email" selected>Email</option>
              <option value="Nomor">Nomor</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div class="pnd-form-group">
            <label class="pnd-form-label" for="formAksesValue" id="formAksesValueLabel">Detail Akses (Email) <span style="color:#ef4444;">*</span></label>
            <input type="email" id="formAksesValue" class="pnd-form-input"
              placeholder="nama@perusahaan.com" required />
          </div>

          <!-- 4. Harga (Input Data Mandiri) -->
          <div class="pnd-form-group">
            <label class="pnd-form-label" for="formHarga">Harga <span style="color:#ef4444;">*</span></label>
            <div style="position: relative;">
              <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-weight: 600; color: #64748b; font-size: 13px;">Rp</span>
              <input type="number" id="formHarga" class="pnd-form-input" min="0" step="1000" placeholder="0" style="padding-left: 38px;" required />
            </div>
          </div>

          <!-- 5. Tanggal Bayar (Input Data Mandiri) -->
          <div class="pnd-form-group">
            <label class="pnd-form-label" for="formTanggalBayar">Tanggal Bayar <span style="color:#ef4444;">*</span></label>
            <input type="date" id="formTanggalBayar" class="pnd-form-input" required />
          </div>

          <!-- 6. Jatuh Tempo (Auto-calculated: Tanggal Bayar + Umur Ekonomis) -->
          <div class="pnd-form-group">
            <label class="pnd-form-label" for="formJatuhTempo">Jatuh Tempo <span style="font-size: 11px; font-weight: 400; color: #0284c7;">(Otomatis: Tanggal Bayar + Umur)</span></label>
            <input type="date" id="formJatuhTempo" class="pnd-form-input" required />
          </div>

          <!-- 7. Status (Auto-calculated: Belum Jatuh Tempo -> Berlangganan, 1-7 Hari -> Terlewat 1-7 Hari, > 7 Hari -> Berhenti Berlangganan) -->
          <div class="pnd-form-group">
            <label class="pnd-form-label" for="formStatus">Status <span style="font-size: 11px; font-weight: 400; color: #0284c7;">(Otomatis vs Hari Ini)</span></label>
            <select id="formStatus" class="pnd-form-select" required>
              <option value="Berlangganan">Berlangganan</option>
              <option value="Terlewat 1 - 7 Hari">Terlewat 1 - 7 Hari</option>
              <option value="Berhenti Berlangganan">Berhenti Berlangganan</option>
            </select>
          </div>

          <!-- 8. Keterangan (Input Data Mandiri) -->
          <div class="pnd-form-group pnd-col-full">
            <label class="pnd-form-label" for="formKeterangan">Keterangan <span style="color:#ef4444;">*</span></label>
            <textarea id="formKeterangan" class="pnd-form-textarea"
              placeholder="Contoh: Infrastruktur backend utama production & database..." required style="height: 80px;"></textarea>
          </div>
        </div>

        <div class="pnd-modal-footer">
          <button type="button" class="pnd-btn-cancel-modal" data-close-modal="tbFormModal"><em>Batal</em></button>
          <button type="submit" class="pnd-btn-submit-save"><em>Simpan</em></button>
        </div>
      </form>
    </div>
  </div>`;

if (oldModalRegex.test(content)) {
  content = content.replace(oldModalRegex, newModalHtml);
  console.log('Updated Form modal');
}

// 6. Update JavaScript Logic from scratch/new_script.js
const newScriptBody = fs.readFileSync(path.resolve('scratch/new_script.js'), 'utf8');

const scriptTagRegex = /<script>\s*\(function\s*\(\)\s*\{[\s\S]*?\}\)\(\);\s*<\/script>/;
if (scriptTagRegex.test(content)) {
  content = content.replace(scriptTagRegex, '<script>\n' + newScriptBody + '\n  </script>');
  console.log('Updated script tag using regex');
} else {
  console.log('Using script index slicing');
  const sStart = content.lastIndexOf('<script>');
  const sEnd = content.lastIndexOf('</script>');
  content = content.slice(0, sStart) + '<script>\n' + newScriptBody + '\n  </script>' + content.slice(sEnd + 9);
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully updated accounting_tagihan_berkala.html. New length:', content.length);
