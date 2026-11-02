const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const accountingDir = path.join(rootDir, 'Accounting');

const cloneFiles = [
  { src: 'SpvKol/spvkol_kalender.html', dest: 'Accounting/accounting_kalender.html', title: 'Kalender Accounting' },
  { src: 'SpvKol/absensi/spvkol_kehadiran.html', dest: 'Accounting/absensi/accounting_kehadiran.html', title: 'Kehadiran Accounting' },
  { src: 'SpvKol/absensi/spvkol_presensi_istirahat.html', dest: 'Accounting/absensi/accounting_presensi_istirahat.html', title: 'Presensi Istirahat Accounting' },
  { src: 'SpvKol/absensi/spvkol_presensi_lembur.html', dest: 'Accounting/absensi/accounting_presensi_lembur.html', title: 'Presensi Lembur Accounting' },
  { src: 'SpvKol/dokumen_kolaborasi/spvkol_folder.html', dest: 'Accounting/dokumen_kolaborasi/accounting_folder.html', title: 'My Folders Accounting' },
  { src: 'SpvKol/perancangan_kerja/spvkol_rrk.html', dest: 'Accounting/perancangan_kerja/accounting_rrk.html', title: 'RRK Accounting' },
  { src: 'SpvKol/perancangan_kerja/spvkol_Milestone.html', dest: 'Accounting/perancangan_kerja/accounting_Milestone.html', title: 'Milestone Accounting' },
  { src: 'SpvKol/perancangan_kerja/spvkol_tugas.html', dest: 'Accounting/perancangan_kerja/accounting_tugas.html', title: 'Tugas Accounting' },
  { src: 'SpvKol/perancangan_kerja/spvkol_project.html', dest: 'Accounting/perancangan_kerja/accounting_project.html', title: 'Projects Accounting' },
  { src: 'SpvKol/perancangan_kerja/spvkol_laporan.html', dest: 'Accounting/perancangan_kerja/accounting_laporan.html', title: 'Laporan Accounting' },
  { src: 'SpvKol/perancangan_kerja/spvkol_pengaduan.html', dest: 'Accounting/perancangan_kerja/accounting_pengaduan.html', title: 'Pengaduan Accounting' }
];

const blankFiles = [
  { dest: 'Accounting/accounting_dashboard.html', title: 'Dashboard Accounting' },
  { dest: 'Accounting/operasional/accounting_operasional_dashboard.html', title: 'Dashboard Operasional' },
  { dest: 'Accounting/operasional/accounting_kas_bank.html', title: 'Kas & Bank' },
  { dest: 'Accounting/operasional/accounting_pendapatan.html', title: 'Pendapatan' },
  { dest: 'Accounting/operasional/accounting_pengurangan_beban.html', title: 'Pengurangan & Beban' },
  { dest: 'Accounting/operasional/accounting_approval_pengeluaran.html', title: 'Approval Pengeluaran' },
  { dest: 'Accounting/operasional/accounting_profit_project_brand.html', title: 'Profit Project & Brand' },
  { dest: 'Accounting/operasional/accounting_arus_kas.html', title: 'Arus Kas' },
  { dest: 'Accounting/operasional/accounting_piutang.html', title: 'Piutang' },
  { dest: 'Accounting/operasional/accounting_utang.html', title: 'Utang' },
  { dest: 'Accounting/operasional/accounting_payroll.html', title: 'Payroll' },
  { dest: 'Accounting/operasional/accounting_pajak.html', title: 'Pajak' },
  { dest: 'Accounting/operasional/accounting_daftar_aset.html', title: 'Daftar Aset' },
  { dest: 'Accounting/operasional/accounting_penyusutan_aset.html', title: 'Penyusutan Aset' },
  { dest: 'Accounting/operasional/accounting_mutasi_aset.html', title: 'Mutasi Aset' },
  { dest: 'Accounting/operasional/accounting_alokasi_aset_project.html', title: 'Alokasi Aset Project' },
  { dest: 'Accounting/operasional/accounting_laba_rugi.html', title: 'Laba Rugi' },
  { dest: 'Accounting/operasional/accounting_neraca.html', title: 'Neraca' },
  { dest: 'Accounting/operasional/accounting_rekap_divisi.html', title: 'Rekap Divisi' },
  { dest: 'Accounting/operasional/accounting_piutang_karyawan.html', title: 'Piutang Karyawan' },
  { dest: 'Accounting/operasional/accounting_budget_vs_actual.html', title: 'Budget vs Actual' },
  { dest: 'Accounting/data_master/accounting_master_coa.html', title: 'Master COA' },
  { dest: 'Accounting/data_master/accounting_bank_lama.html', title: 'Bank Lama' }
];

const storageKeys = [
  'bisa_kalender_schedule_v1',
  'bisa_rrk_data_v3',
  'bisa_rrk_reset_v3',
  'bisa_rrk_data_clean_v1',
  'bisa_rrk_database',
  'bisa_rrk_list_v3',
  'bisa_rrk_list_v2',
  'bisa_rrk_list_v1',
  'bisa_rrk_data',
  'bisa_milestone_data_v3',
  'bisa_milestone_reset_v3',
  'bisa_milestone_data_v2',
  'bisa_milestone_data',
  'bisa_tugas_data_v6',
  'bisa_tugas_reset_v6',
  'bisa_tugas_data_v3',
  'bisa_tugas_data',
  'bisa_project_data_v5',
  'bisa_project_reset_v4',
  'bisa_project_data_v3',
  'bisa_project_data_v2',
  'bisa_project_data_v1',
  'bisa_project_data',
  'bisa_pengaduan_data_v1',
  'bisa_pengaduan_reset_v1',
  'bisa_pengaduan_data'
];

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceStorageKeys(content) {
  storageKeys.forEach((key) => {
    const pattern = new RegExp('\\b' + escapeRegExp(key) + '\\b', 'g');
    content = content.replace(pattern, key.replace(/^bisa_/, 'accounting_'));
  });
  return content;
}

function replaceTitle(content, title) {
  return content.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title} | Bisa Media</title>`);
}

function cloneFile(item) {
  const srcPath = path.join(rootDir, item.src);
  const destPath = path.join(rootDir, item.dest);
  let content = fs.readFileSync(srcPath, 'utf8');

  content = content.replace(/spvkol_/g, 'accounting_');
  content = replaceStorageKeys(content);
  content = content.replace(/(<span class="user-menu-dropdown__name">)Supervisi KOL(<\/span>)/g, '$1Accounting$2');
  content = content.replace(/(<span class="user-menu-dropdown__name">)Setiawan(<\/span>)/g, '$1Accounting$2');
  content = content.replace(/(<span class="user-menu-dropdown__role">)SPV KOL(<\/span>)/g, '$1Accounting$2');
  content = replaceTitle(content, item.title);
  content = content.replace(/layout\.js\?v=\d+/g, 'layout.js?v=1008');
  content = content.replace(/app\.js\?v=\d+/g, 'app.js?v=3');

  ensureDir(destPath);
  fs.writeFileSync(destPath, content, 'utf8');
  console.log('[CLONE] ' + item.dest);
}

function createBlankFile(item) {
  const destPath = path.join(rootDir, item.dest);
  if (item.dest === 'Accounting/accounting_dashboard.html' && fs.existsSync(destPath)) {
    console.log('[SKIP] ' + item.dest);
    return;
  }
  const relative = path.relative(accountingDir, path.dirname(destPath)).replace(/\\/g, '/');
  const depth = relative ? relative.split('/').filter(Boolean).length : 0;
  const rootPrefix = '../'.repeat(depth + 1);

  const content = `<!DOCTYPE html>
<html lang="id">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${item.title} | Bisa Media</title>
  <link rel="stylesheet" href="${rootPrefix}assets/css/style.css?v=20261031" />
  <link rel="icon" type="image/png" href="${rootPrefix}media/logo.png" />
</head>

<body class="dashboard-body">
  <aside id="app-sidebar"></aside>

  <div class="dashboard-shell">
    <header class="topbar"></header>
    <main class="dashboard-content"></main>
  </div>

  <script src="${rootPrefix}assets/js/layout.js?v=1008"></script>
</body>

</html>
`;

  ensureDir(destPath);
  fs.writeFileSync(destPath, content, 'utf8');
  console.log('[BLANK] ' + item.dest);
}

cloneFiles.forEach(cloneFile);
blankFiles.forEach(createBlankFile);

console.log('Accounting pages generated: ' + (cloneFiles.length + blankFiles.length));
