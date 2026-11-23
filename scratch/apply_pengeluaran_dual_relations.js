const fs = require('fs');
const path = require('path');

const targetFiles = [
  path.join(__dirname, '../Accounting/operasional/accounting_pengeluaran_beban.html'),
  path.join(__dirname, '../Accounting/operasional/accounting_pengurangan_beban.html')
];

targetFiles.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Replace getLegacyApprovalList and getApprovalList
  const oldApprovalFnsPattern = /function getLegacyApprovalList\(\)[\s\S]*?function getApprovalForId\(idApproval\) \{[\s\S]*?return legList\.find\(function \(a\) \{[\s\S]*?\}\) \|\| null;\s*\}/;

  const newApprovalFns = `function getLegacyApprovalList() {
        const canonicalApprovals = [
          { id: 'apr-1', idApproval: 'APR-2609-001', tanggalRequest: '2026-09-04', pemohon: 'BCA', divisi: 'General', keperluan: 'Admin Bank BCA', nominal: 30000, jenis: 'Beban', statusManager: 'Disetujui', statusDirektur: 'Disetujui', statusFinal: 'Disetujui' },
          { id: 'apr-2', idApproval: 'APR-2609-002', tanggalRequest: '2026-09-08', pemohon: 'Meta Ads', divisi: 'Marketing', keperluan: 'Iklan Digital Campaign Meta Ads', nominal: 1665000, jenis: 'Beban', statusManager: 'Disetujui', statusDirektur: 'Disetujui', statusFinal: 'Disetujui' },
          { id: 'apr-3', idApproval: 'APR-2609-003', tanggalRequest: '2026-09-15', pemohon: 'PT Gedung Megah', divisi: 'Operasional', keperluan: 'Sewa Ruang Kantor Lt. 3', nominal: 4995000, jenis: 'Beban', statusManager: 'Disetujui', statusDirektur: 'Menunggu', statusFinal: 'Menunggu' },
          { id: 'apr-4', idApproval: 'APR-2609-004', tanggalRequest: '2026-09-20', pemohon: 'CV Berkah Office', divisi: 'Operasional', keperluan: 'Pengadaan Perlengkapan Kantor', nominal: 450000, jenis: 'Beban', statusManager: 'Ditolak', statusDirektur: 'Ditolak', statusFinal: 'Ditolak' },
          { id: 'apr-5', idApproval: 'APR-2609-005', tanggalRequest: '2026-10-18', pemohon: 'Google Cloud', divisi: 'IT', keperluan: 'Server & Cloud Hosting Database', nominal: 943500, jenis: 'Beban', statusManager: 'Disetujui', statusDirektur: 'Disetujui', statusFinal: 'Disetujui' }
        ];
        let arr = canonicalApprovals;
        try {
          const raw = localStorage.getItem(APPROVAL_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) arr = parsed;
          }
        } catch (e) {}
        return arr.map(function (it, idx) {
          const idCode = String(it.idApproval || it.id || ('APR-2609-' + String(idx + 1).padStart(3, '0'))).trim();
          return {
            id: idCode,
            idApproval: idCode,
            source: 'approval',
            tanggalRequest: it.tanggalRequest || it.tanggal || '2026-09-04',
            periodeRequest: it.tanggalRequest || it.tanggal || '2026-09-04',
            pemohon: it.pemohon || it.vendor || 'BCA',
            kategori: it.pemohon || it.vendor || 'BCA',
            divisi: it.divisi || 'General',
            pic: it.divisi || 'General',
            keperluan: it.keperluan || it.keterangan || '-',
            namaBarang: it.keperluan || it.keterangan || '-',
            nominal: Number(it.nominal !== undefined ? it.nominal : it.tagihanBruto) || 0,
            estimasiBiaya: Number(it.nominal !== undefined ? it.nominal : it.tagihanBruto) || 0,
            jenis: it.jenis || 'Beban',
            statusManager: it.statusManager || 'Disetujui',
            statusDirektur: it.statusDirektur || 'Disetujui',
            statusFinal: it.statusFinal || 'Disetujui',
            catatan: it.catatan || '-',
            createdAt: Number(it.createdAt) || 0,
            updatedAt: Number(it.updatedAt) || 0
          };
        });
      }

      function getApprovalList() {
        // Dropdown ID Approval memiliki 2 relasi:
        // 1. Modul Approval Pengeluaran (APR-...)
        // 2. Modul Pengajuan Barang & Jasa (PBJ-...)
        const aprList = getLegacyApprovalList();
        const pbjList = getPengajuanBarangJasaList();
        return aprList.concat(pbjList);
      }

      function getApprovalForId(idApproval) {
        if (!idApproval) return null;
        const target = String(idApproval).trim().toLowerCase();
        const all = getApprovalList();
        return all.find(function (a) {
          return String(a.idApproval || a.id || '').trim().toLowerCase() === target;
        }) || null;
      }`;

  if (!oldApprovalFnsPattern.test(content)) {
    console.error('Could not match oldApprovalFnsPattern in', filePath);
  } else {
    content = content.replace(oldApprovalFnsPattern, newApprovalFns);
    console.log('Replaced approval functions in', filePath);
  }

  // 2. Replace ID Approval dropdown logic in initDynamicModalDropdowns
  const oldDropdownIdApprovalPattern = /\/\/ 1\. ID Approval Dropdown[\s\S]*?dropdownApproval\.appendChild\(label\);\s*\}\);[\s\S]*?\}/;

  const newDropdownIdApproval = `// 1. ID Approval Dropdown (2 Relasi: Approval Pengeluaran & Pengajuan Barang & Jasa)
        const dropdownApproval = document.getElementById('dropdownIdApproval');
        if (dropdownApproval) {
          const usedAprIds = new Set();
          (pndData || []).forEach(function (it) {
            if (it && it.idApproval) usedAprIds.add(String(it.idApproval).trim().toLowerCase());
          });

          const STATIC_SEED_APPROVAL_CODES = new Set([
            'apr-2609-001', 'apr-2609-002', 'apr-2609-003', 'apr-2609-004', 'apr-2609-005',
            'pbj-2026-001', 'pbj-2026-002', 'pbj-2026-003', 'pbj-2026-004', 'pbj-2026-005'
          ]);

          let refUpdatesMap = {};
          try {
            if (typeof window.getAccountingReferensiUpdates === 'function') {
              refUpdatesMap = window.getAccountingReferensiUpdates() || {};
            } else {
              const rawUpd = localStorage.getItem('accounting_referensi_updates_v1');
              if (rawUpd) refUpdatesMap = JSON.parse(rawUpd) || {};
            }
          } catch (e) {}

          const rawAprs = getApprovalList();
          const enrichedAprs = rawAprs.map(function (apr, idx) {
            const code = String(apr.idApproval || apr.id || '').trim();
            const lowerCode = code.toLowerCase();
            const isUsed = usedAprIds.has(lowerCode);
            const refEntry = lowerCode ? refUpdatesMap[lowerCode] : null;
            const userSeq = (refEntry && typeof refEntry.seq === 'number') ? refEntry.seq : 0;
            let userTs = 0;
            const rawTime = apr.updatedAt || apr.createdAt;
            if (rawTime) {
              if (typeof rawTime === 'number' && rawTime > 1000000000) userTs = rawTime;
              else {
                const p = Date.parse(rawTime);
                if (!isNaN(p) && p > 1000000000) userTs = p;
              }
            }
            if (refEntry && refEntry.ts && refEntry.ts > userTs) {
              userTs = refEntry.ts;
            }

            // Real user input jika ada seq update atau bukan bagian dari seed bawaan
            const isUserInput = Boolean(userSeq > 0 || (!STATIC_SEED_APPROVAL_CODES.has(lowerCode) && (userTs > 0 || userSeq > 0)));
            // HANYA data real yang baru diinput user dan belum dipakai yang mendapat status isRealNew
            const isRealNew = isUserInput && !isUsed;

            let sortScore = 0;
            if (isRealNew) {
              sortScore = 1000000000000000 + (userSeq * 10000000000) + Math.floor(userTs / 10);
            } else if (!isUsed) {
              sortScore = 1000000000000 + (100000 - idx);
            } else {
              sortScore = 1000000000 - idx;
            }

            return {
              raw: apr,
              code: code,
              lowerCode: lowerCode,
              isUsed: isUsed,
              isRealNew: isRealNew,
              sortScore: sortScore
            };
          });

          enrichedAprs.sort(function (a, b) {
            return b.sortScore - a.sortScore;
          });

          dropdownApproval.innerHTML = '';
          enrichedAprs.forEach(function (entry) {
            const apr = entry.raw;
            const isNewApr = entry.isRealNew;
            const isUsedApr = entry.isUsed;
            const isPbj = apr.source === 'pbj' || /^PBJ-/i.test(entry.code);

            const label = document.createElement('label');
            label.className = 'pnd-select-item';
            if (isNewApr) label.style.background = '#f0f9ff';

            let statusBadge = '';
            if (isNewApr) {
              statusBadge = '<span style="margin-left: auto; padding: 1.5px 6px; border-radius: 999px; font-size: 9.5px; font-weight: 800; background: #0284c7; color: #fff; letter-spacing: 0.5px; flex-shrink: 0;">NEW</span>';
            } else if (isUsedApr) {
              statusBadge = '<span style="margin-left: auto; padding: 1.5px 6px; border-radius: 999px; font-size: 9.5px; font-weight: 600; background: #f1f5f9; color: #64748b; flex-shrink: 0;">Sudah Dipakai</span>';
            }

            const sourceBadge = isPbj
              ? '<span style="padding: 1px 5px; border-radius: 4px; font-size: 9.5px; font-weight: 700; background: #eff6ff; color: #2563eb; flex-shrink: 0;">PBJ</span>'
              : '<span style="padding: 1px 5px; border-radius: 4px; font-size: 9.5px; font-weight: 700; background: #f0fdf4; color: #16a34a; flex-shrink: 0;">APR</span>';

            const subInfo = isPbj ? (apr.namaBarang || apr.kategori || '') : (apr.keperluan || apr.pemohon || '');
            const displayLabel = subInfo ? (entry.code + ' - ' + subInfo) : entry.code;

            label.innerHTML = '<input type="radio" name="optIdApproval" value="' + escapeHtml(entry.code) + '" data-label="' + escapeHtml(entry.code) + '" />' +
              '<span class="pnd-custom-radio"></span>' +
              '<span class="pnd-item-label" style="display:flex;align-items:center;gap:6px;width:100%;min-width:0;">' +
                sourceBadge +
                '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;">' + escapeHtml(displayLabel) + '</span>' +
                statusBadge +
              '</span>';
            dropdownApproval.appendChild(label);
          });
        }`;

  if (!oldDropdownIdApprovalPattern.test(content)) {
    console.error('Could not match oldDropdownIdApprovalPattern in', filePath);
  } else {
    content = content.replace(oldDropdownIdApprovalPattern, newDropdownIdApproval);
    console.log('Replaced ID Approval dropdown in', filePath);
  }

  // 3. Replace applyIdApprovalAutoFill
  const oldApplyPattern = /function applyIdApprovalAutoFill\(val\) \{[\s\S]*?setApprovalFieldsReadonly\(\);\s*autoCalcTagihan\(\);\s*\}/;

  const newApply = `function applyIdApprovalAutoFill(val) {
        const apr = getApprovalForId(val);
        if (apr) {
          const isPbj = apr.source === 'pbj' || /^PBJ-/i.test(String(apr.idApproval || ''));
          if (isPbj) {
            // Relasi Pengajuan Barang & Jasa:
            // 3. Tanggal Pengakuan -> Periode Request
            if (pndTglPengakuan) {
              pndTglPengakuan.value = apr.tanggalRequest || normalizeDateToIso(apr.periodeRequest) || '';
              pndTglPengakuan.dispatchEvent(new Event('change'));
            }
            // 4. Vendor / Karyawan -> Kategori
            if (pndVendorKaryawan) pndVendorKaryawan.value = apr.kategori || apr.pemohon || '';
            // 5. Divisi -> PIC
            if (pndDivisi) pndDivisi.value = apr.pic || apr.divisi || '';
            // 6. Keterangan -> Nama Barang / Jasa
            if (pndKeterangan) pndKeterangan.value = apr.namaBarang || apr.keperluan || '';
            // 7. Status Approval -> Status Final
            if (pndStatusApproval) pndStatusApproval.value = apr.statusFinal || 'Menunggu';
            // 11. Tagihan Bruto -> Estimasi Biaya
            const estNominal = Number(apr.estimasiBiaya !== undefined ? apr.estimasiBiaya : apr.nominal) || 0;
            if (pndTagihanBruto) {
              pndTagihanBruto.value = formatRupiah(estNominal);
              pndTagihanBruto.setAttribute('data-nominal', estNominal);
            }
            // 16. Jenis -> Jenis (Reimburse, Purchased, Batal, Diproses)
            setJenisValue(apr.jenis || 'Diproses');
          } else {
            // Relasi Modul Approval Pengeluaran:
            // 3. Tanggal Pengakuan -> Tanggal Request
            if (pndTglPengakuan) {
              pndTglPengakuan.value = apr.tanggalRequest || '';
              pndTglPengakuan.dispatchEvent(new Event('change'));
            }
            // 4. Vendor / Karyawan -> Pemohon
            if (pndVendorKaryawan) pndVendorKaryawan.value = apr.pemohon || '';
            // 5. Divisi -> Divisi
            if (pndDivisi) pndDivisi.value = apr.divisi || '';
            // 6. Keterangan -> Keperluan
            if (pndKeterangan) pndKeterangan.value = apr.keperluan || '';
            // 7. Status Approval -> Status Final
            if (pndStatusApproval) pndStatusApproval.value = apr.statusFinal || 'Disetujui';
            // 11. Tagihan Bruto -> Nominal
            const estNominal = Number(apr.nominal !== undefined ? apr.nominal : apr.estimasiBiaya) || 0;
            if (pndTagihanBruto) {
              pndTagihanBruto.value = formatRupiah(estNominal);
              pndTagihanBruto.setAttribute('data-nominal', estNominal);
            }
            // 16. Jenis -> Jenis (Beban)
            setJenisValue(apr.jenis || 'Beban');
          }

          setApprovalFieldsReadonly();
          autoCalcTagihan();
        } else {
          if (pndTglPengakuan) pndTglPengakuan.value = '';
          if (pndVendorKaryawan) pndVendorKaryawan.value = '';
          if (pndDivisi) pndDivisi.value = '';
          if (pndKeterangan) pndKeterangan.value = '';
          if (pndStatusApproval) pndStatusApproval.value = '';
          if (pndTagihanBruto) {
            pndTagihanBruto.value = 'Rp. -';
            pndTagihanBruto.removeAttribute('data-nominal');
          }
          setJenisValue('');
          setApprovalFieldsReadonly();
          autoCalcTagihan();
        }
      }`;

  if (!oldApplyPattern.test(content)) {
    console.error('Could not match oldApplyPattern in', filePath);
  } else {
    content = content.replace(oldApplyPattern, newApply);
    console.log('Replaced applyIdApprovalAutoFill in', filePath);
  }

  // 4. Update storage listener to include accounting_referensi_updates_v1
  const oldStorageKeyCond = "e.key === DIVISI_KEY";
  const newStorageKeyCond = "e.key === DIVISI_KEY || e.key === 'accounting_referensi_updates_v1'";
  if (content.includes(oldStorageKeyCond) && !content.includes(newStorageKeyCond)) {
    content = content.replace(oldStorageKeyCond, newStorageKeyCond);
    console.log('Updated storage listener in', filePath);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully written', filePath);
});
