// layout.js - Unified Layout Engine (Sidebar, Navbar & State per Role)
(function () {
  'use strict';

  window.__bmSidebarEngineLoaded = true;

  // Fail-safe: konten tidak boleh tetap tersembunyi jika render sidebar gagal.
  function markSidebarReady() {
    if (document.body) document.body.classList.add('sidebar-ready');
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', markSidebarReady, { once: true });
  }
  markSidebarReady();
  window.setTimeout(markSidebarReady, 0);
  window.setTimeout(markSidebarReady, 600);

  // 1. Tentukan Root Prefix secara dinamis
  let depth = 1;
  const normalizedPath = window.location.pathname.replace(/\\/g, '/');
  const segments = normalizedPath.split('/').filter(Boolean);
  const folderIndex = segments.findIndex(s => ['bm', 'spvkol', 'staffkol', 'accounting'].includes(s.toLowerCase()));
  if (folderIndex !== -1) {
    depth = segments.length - folderIndex - 1;
  }
  const rootPrefix = depth > 0 ? '../'.repeat(depth) : '';
  const currentFile = normalizedPath.split('/').pop() || 'BM_dashboard.html';

  // Preload SweetAlert2 (Local vendor first, fallback ke CDN) agar selalu siap seketika saat dibutuhkan
  (function preloadSweetAlert() {
    if (!window.Swal && !document.querySelector('script[src*="sweetalert2"]')) {
      const swalScript = document.createElement('script');
      swalScript.src = (rootPrefix || '') + 'vendor/sweetalert2.min.js';
      swalScript.onerror = function () {
        const cdnScript = document.createElement('script');
        cdnScript.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
        document.head.appendChild(cdnScript);
      };
      document.head.appendChild(swalScript);
    }
  })();

  // Preload Bisa Excel Engine agar seluruh fitur export otomatis menghasilkan Excel rapi bertabel & berwarna
  (function preloadExcelEngine() {
    if (!window.ExcelJS && !document.querySelector('script[src*="exceljs"]')) {
      const excelJsScript = document.createElement('script');
      excelJsScript.src = rootPrefix + 'vendor/exceljs.min.js';
      document.head.appendChild(excelJsScript);
    }
    if (!window.exportBisaExcel && !document.querySelector('script[src*="excel_engine"]')) {
      const excelScript = document.createElement('script');
      excelScript.src = rootPrefix + 'assets/js/excel_engine.js?v=20261103_grup';
      document.head.appendChild(excelScript);
    }
  })();

  // 2. Deteksi Role Pengguna berdasarkan path halaman
  let role = 'admin';
  const lowerPath = normalizedPath.toLowerCase();
  const lowerFile = currentFile.toLowerCase();
  if (lowerPath.includes('/bm/')) role = 'admin';
  else if (lowerPath.includes('/spvkol/') || lowerFile.startsWith('spvkol_')) role = 'spv_kol';
  else if (lowerPath.includes('/staffkol/') || lowerFile.startsWith('staffkol_')) role = 'staff_kol';
  else if (lowerPath.includes('/accounting/') || lowerFile.startsWith('accounting_')) role = 'accounting';
  else role = localStorage.getItem('user_role') || 'admin';

  // 3. Konfigurasi Menu & Hierarki (Heading Kategori, 100% Lengkap Sesuai Alur Perusahaan)
  const menus = {
    admin: [
      { type: 'heading', label: 'Menu Utama' },
      { type: 'item', label: 'Beranda', icon: 'home', link: 'BM/BM_dashboard.html' },
      { type: 'item', label: 'Kalender', icon: 'calendar', link: 'BM/BM_kalender.html' },
      { type: 'item', label: 'Isi dengan Panduan', icon: 'book', link: 'BM/BM_panduan.html' },
      { type: 'item', label: 'Spv KOL', icon: 'spv', link: 'SpvKol/spvkol_dashboard.html' },
      { type: 'item', label: 'Staff KOL', icon: 'staff', link: 'StaffKol/staffkol_dashboard.html' },
      { type: 'item', label: 'Accounting', icon: 'accounting', link: 'Accounting/accounting_dashboard.html' },

      { type: 'heading', label: 'Manajemen Karyawan' },
      {
        type: 'group', label: 'Data Karyawan', icon: 'users', id: 'm-bm-karyawan',
        children: [
          { label: 'Karyawan', link: 'BM/data_karyawan/BM_karyawan.html', icon: 'users' },
          { label: 'Kontrak Karyawan', link: 'BM/data_karyawan/BM_Kontrak.html', icon: 'file-text' },
          { label: 'Kegiatan Karyawan', link: 'BM/data_karyawan/BM_kegiatan_karyawan.html', icon: 'calendar-check' }
        ]
      },
      {
        type: 'group', label: 'Tugas & Pekerjaan', icon: 'task', id: 'm-bm-tugas',
        children: [
          { label: 'Instruksi Tugas', link: 'BM/tugas_pekerjaan/BM_instruksi_tugas.html', icon: 'check-square' },
          { label: 'RRK', link: 'BM/tugas_pekerjaan/BM_rrk.html', icon: 'file-text' },
          { label: 'Report Pengerjaan', link: 'BM/tugas_pekerjaan/BM_report_pengerjaan.html', icon: 'file-bar-chart' }
        ]
      },
      {
        type: 'group', label: 'Absensi', icon: 'clock', id: 'm-bm-absensi',
        children: [
          { label: 'Kehadiran', link: 'BM/absensi/BM_kehadiran.html', icon: 'calendar-check' },
          { label: 'Presensi Istirahat', link: 'BM/absensi/BM_presensi_istirahat.html', icon: 'coffee' },
          { label: 'Presensi Lembur', link: 'BM/absensi/BM_presensi_lembur.html', icon: 'clock-alert' },
          { label: 'Skenario Jam Kerja', link: 'BM/absensi/BM_skenario_jam_kerja.html', icon: 'binary' }
        ]
      },
      {
        type: 'group', label: 'Penilaian', icon: 'star', id: 'm-bm-penilaian',
        children: [
          { label: 'Penilaian Karyawan', link: 'BM/penilaian/BM_penilaian_karyawan.html', icon: 'award' }
        ]
      },

      { type: 'heading', label: 'Perusahaan & Dokumen' },
      {
        type: 'group', label: 'Dokumen & Kolaborasi', icon: 'folder', id: 'm-bm-dokumen',
        children: [
          { label: 'Folder', link: 'BM/dokumen_kolaborasi/BM_folder.html', icon: 'folder-open' }
        ]
      },
      {
        type: 'group', label: 'Perusahaan', icon: 'buildings', id: 'm-bm-perusahaan',
        children: [
          { label: 'Profil Perusahaan', link: 'BM/perusahaan/BM_profil_perusahaan.html', icon: 'building-2' },
          { label: 'Sub Perusahaan', link: 'BM/perusahaan/BM_subperusahaan.html', icon: 'layers' },
          { label: 'Divisi', link: 'BM/perusahaan/BM_divisi.html', icon: 'layout-grid' },
          { label: 'Jabatan', link: 'BM/perusahaan/BM_jabatan.html', icon: 'user-check' },
          { label: 'Struktur Perusahaan', link: 'BM/perusahaan/BM_struktur_perusahaan.html', icon: 'binary' }
        ]
      }
    ],
    spv_kol: [
      { type: 'heading', label: 'Menu Utama' },
      { type: 'item', label: 'Beranda SPVKOL', icon: 'home', link: 'SpvKol/spvkol_dashboard.html' },
      { type: 'item', label: 'Kalender', icon: 'calendar', link: 'SpvKol/spvkol_kalender.html' },

      { type: 'heading', label: 'Operasional KOL' },
      {
        type: 'group', label: 'Absensi', icon: 'clock', id: 'm-spv-absensi',
        children: [
          { label: 'Absensi', link: 'SpvKol/absensi/spvkol_kehadiran.html', icon: 'calendar-check' },
          { label: 'Presensi Istirahat', link: 'SpvKol/absensi/spvkol_presensi_istirahat.html', icon: 'coffee' },
          { label: 'Presensi Lembur', link: 'SpvKol/absensi/spvkol_presensi_lembur.html', icon: 'clock-alert' }
        ]
      },
      {
        type: 'group', label: 'Operasional', icon: 'briefcase', id: 'm-spv-operasional',
        children: [
          { label: 'Dashboard Campaign', link: 'SpvKol/operasional/spvkol_dashboard_campaign.html', icon: 'layout-dashboard' },
          { label: 'Campaign', link: 'SpvKol/operasional/spvkol_campaign.html', icon: 'flag' },
          { label: 'Data Kreator', link: 'SpvKol/operasional/spvkol_kreator.html', icon: 'users' },
          { label: 'Tracking Kreator', link: 'SpvKol/operasional/spvkol_tracking_kreator.html', icon: 'user-check' },
          { label: 'Tracking Sampel', link: 'SpvKol/operasional/spvkol_tracking_sampel.html', icon: 'package' },
          { label: 'Performa Kreator', link: 'SpvKol/operasional/spvkol_Performa_Kreator.html', icon: 'trending-up' }
        ]
      },
      {
        type: 'group', label: 'Brands', icon: 'brand', id: 'm-spv-brands',
        children: [
          { label: 'Dashboard Brands', link: 'SpvKol/brand/spvkol_dashboard_brand.html', icon: 'layout-dashboard' },
          { label: 'Produk & Brands', link: 'SpvKol/brand/spvkol_produk_brand.html', icon: 'boxes' },
          { label: 'Data Brands', link: 'SpvKol/brand/spvkol_data_brand.html', icon: 'sparkles' },
          { label: 'Laporan Brand', link: 'SpvKol/brand/spvkol_laporan_brand.html', icon: 'file-bar-chart' }
        ]
      },

      { type: 'heading', label: 'Manajemen Kerja' },
      {
        type: 'group', label: 'Dokumen & Kolaborasi', icon: 'folder', id: 'm-spv-dokumen',
        children: [
          { label: 'My Folders', link: 'SpvKol/dokumen_kolaborasi/spvkol_folder.html', icon: 'folder-open' }
        ]
      },
      {
        type: 'group', label: 'Perancangan Kerja', icon: 'task', id: 'm-spv-perancangan',
        children: [
          { label: 'RRK', link: 'SpvKol/perancangan_kerja/spvkol_rrk.html', icon: 'file-text' },
          { label: 'Milestone', link: 'SpvKol/perancangan_kerja/spvkol_Milestone.html', icon: 'flag' },
          { label: 'Tugas', link: 'SpvKol/perancangan_kerja/spvkol_tugas.html', icon: 'check-square' },
          { label: 'Project', link: 'SpvKol/perancangan_kerja/spvkol_project.html', icon: 'kanban' },
          { label: 'Laporan', link: 'SpvKol/perancangan_kerja/spvkol_laporan.html', icon: 'file-bar-chart' },
          { label: 'Pengaduan', link: 'SpvKol/perancangan_kerja/spvkol_pengaduan.html', icon: 'alert-circle' }
        ]
      },
      {
        type: 'group', label: 'Kinerja', icon: 'chart', id: 'm-spv-kinerja',
        children: [
          { label: 'Evaluasi Kinerja', link: 'SpvKol/kinerja/spvkol_evaluasi_kinerja.html', icon: 'award' },
          { label: 'Target & Capaian Kerja', link: 'SpvKol/kinerja/spvkol_target_capaian.html', icon: 'target' },
          { label: 'Upgrade Skill', link: 'SpvKol/kinerja/spvkol_upgrade_skill.html', icon: 'trending-up' }
        ]
      },
      {
        type: 'group', label: 'Data Master', icon: 'tag', id: 'm-spv-master',
        children: [
          { label: 'Kategori Produk', link: 'SpvKol/data_master/master_pendukung/spvkol_Kategori_Produk.html', icon: 'layers' },
          { label: 'Leads Kreator', link: 'SpvKol/data_master/master_pendukung/spvkol_Leads_Kreator.html', icon: 'users' },
          { label: 'Leveling Kreator', link: 'SpvKol/data_master/master_pendukung/spvkol_Leveling_Kreator.html', icon: 'layout-grid' },
          { label: 'Ads Account', link: 'SpvKol/data_master/master_pendukung/spvkol_Ads_Account.html', icon: 'credit-card' }
        ]
      }
    ],
    staff_kol: [
      { type: 'heading', label: 'Menu Utama' },
      { type: 'item', label: 'Dashboard', icon: 'home', link: 'StaffKol/staffkol_dashboard.html' },
      { type: 'item', label: 'Kalender', icon: 'calendar', link: 'StaffKol/staffkol_kalender.html' },

      { type: 'heading', label: 'Operasional Staff' },
      {
        type: 'group', label: 'Absensi', icon: 'clock', id: 'm-staff-absensi',
        children: [
          { label: 'Absensi', link: 'StaffKol/absensi/staffkol_kehadiran.html', icon: 'calendar-check' },
          { label: 'Presensi Istirahat', link: 'StaffKol/absensi/staffkol_presensi_istirahat.html', icon: 'coffee' },
          { label: 'Presensi Lembur', link: 'StaffKol/absensi/staffkol_presensi_lembur.html', icon: 'clock-alert' }
        ]
      },
      {
        type: 'group', label: 'Operasional', icon: 'briefcase', id: 'm-staff-operasional',
        children: [
          { label: 'Dashboard Campaign', link: 'StaffKol/operasional/staffkol_dashboard_campaign.html', icon: 'layout-dashboard' },
          { label: 'Campaign', link: 'StaffKol/operasional/staffkol_campaign.html', icon: 'flag' },
          { label: 'Laporan Campaign', link: 'StaffKol/operasional/staffkol_laporan_campaign.html', icon: 'file-bar-chart' },
          { label: 'Data Kreator', link: 'StaffKol/operasional/staffkol_kreator.html', icon: 'users' },
          { label: 'Tracking Kreator', link: 'StaffKol/operasional/staffkol_tracking_kreator.html', icon: 'user-check' },
          { label: 'Tracking Sampel', link: 'StaffKol/operasional/staffkol_tracking_sampel.html', icon: 'package' },
          { label: 'Performa Kreator', link: 'StaffKol/operasional/staffkol_Performa_Kreator.html', icon: 'trending-up' }
        ]
      },
      {
        type: 'group', label: 'Brands', icon: 'brand', id: 'm-staff-brands',
        children: [
          { label: 'Dashboard Brands', link: 'StaffKol/brand/staffkol_dashboard_brand.html', icon: 'layout-dashboard' },
          { label: 'Produk & Brands', link: 'StaffKol/brand/staffkol_produk_brand.html', icon: 'boxes' },
          { label: 'Data Brands', link: 'StaffKol/brand/staffkol_data_brand.html', icon: 'sparkles' },
          { label: 'Laporan Brand', link: 'StaffKol/brand/staffkol_laporan_brand.html', icon: 'file-bar-chart' }
        ]
      },

      { type: 'heading', label: 'Manajemen Kerja' },
      {
        type: 'group', label: 'Dokumen & Kolaborasi', icon: 'folder', id: 'm-staff-dokumen',
        children: [
          { label: 'My Folders', link: 'StaffKol/dokumen_kolaborasi/staffkol_folder.html', icon: 'folder-open' }
        ]
      },
      {
        type: 'group', label: 'Perancangan Kerja', icon: 'task', id: 'm-staff-perancangan',
        children: [
          { label: 'RRK', link: 'StaffKol/perancangan_kerja/staffkol_rrk.html', icon: 'file-text' },
          { label: 'Milestone', link: 'StaffKol/perancangan_kerja/staffkol_Milestone.html', icon: 'flag' },
          { label: 'Tugas', link: 'StaffKol/perancangan_kerja/staffkol_tugas.html', icon: 'check-square' },
          { label: 'Project', link: 'StaffKol/perancangan_kerja/staffkol_project.html', icon: 'kanban' },
          { label: 'Laporan', link: 'StaffKol/perancangan_kerja/staffkol_laporan.html', icon: 'file-bar-chart' },
          { label: 'Pengaduan', link: 'StaffKol/perancangan_kerja/staffkol_pengaduan.html', icon: 'alert-circle' }
        ]
      },
      {
        type: 'group', label: 'Kinerja', icon: 'chart', id: 'm-staff-kinerja',
        children: [
          { label: 'Evaluasi Kinerja', link: 'StaffKol/kinerja/staffkol_evaluasi_kinerja.html', icon: 'award' },
          { label: 'Target & Capaian Kerja', link: 'StaffKol/kinerja/staffkol_target_capaian.html', icon: 'target' },
          { label: 'Upgrade Skill', link: 'StaffKol/kinerja/staffkol_upgrade_skill.html', icon: 'trending-up' }
        ]
      }
    ],
    accounting: [
      { type: 'heading', label: 'Menu Utama' },
      { type: 'item', label: 'Dashboard', icon: 'home', link: 'Accounting/accounting_dashboard.html' },
      { type: 'item', label: 'Kalender', icon: 'calendar', link: 'Accounting/accounting_kalender.html' },

      { type: 'heading', label: 'Aktivitas Keuangan' },
      {
        type: 'group', label: 'Kehadiran', icon: 'clock', id: 'm-acc-kehadiran',
        children: [
          { label: 'Kehadiran', link: 'Accounting/absensi/accounting_kehadiran.html', icon: 'calendar-check' },
          { label: 'Absensi Istirahat', link: 'Accounting/absensi/accounting_presensi_istirahat.html', icon: 'coffee' },
          { label: 'Absensi Lembur', link: 'Accounting/absensi/accounting_presensi_lembur.html', icon: 'clock-alert' }
        ]
      },
      {
        type: 'group', label: 'Operasional', icon: 'briefcase', id: 'm-acc-operasional',
        children: [
          { label: 'Dashboard', link: 'Accounting/operasional/accounting_operasional_dashboard.html', icon: 'layout-dashboard' },
          { label: 'Kas & Bank', link: 'Accounting/operasional/accounting_kas_bank.html', icon: 'wallet' },
          { label: 'Pendapatan', link: 'Accounting/operasional/accounting_pendapatan.html', icon: 'arrow-down-left' },
          { label: 'Approval Pengeluaran', link: 'Accounting/operasional/accounting_approval_pengeluaran.html', icon: 'check-check' },
          { label: 'Pengeluaran & Beban', link: 'Accounting/operasional/accounting_pengeluaran_beban.html', icon: 'receipt' },
          { label: 'Payroll', link: 'Accounting/operasional/accounting_payroll.html', icon: 'badge-dollar-sign' },
          { label: 'Pajak', link: 'Accounting/operasional/accounting_pajak.html', icon: 'percent' },
          { label: 'Daftar Aset', link: 'Accounting/operasional/accounting_daftar_aset.html', icon: 'boxes' },
          { label: 'Mutasi Aset', link: 'Accounting/operasional/accounting_mutasi_aset.html', icon: 'arrow-left-right' },
          { label: 'Alokasi Aset Project', link: 'Accounting/operasional/accounting_alokasi_aset_project.html', icon: 'layers' },
          { label: 'Utang Karyawan', link: 'Accounting/operasional/accounting_utang_karyawan.html', icon: 'file-minus' },
          { label: 'Piutang Karyawan', link: 'Accounting/operasional/accounting_piutang_karyawan.html', icon: 'file-plus' },
          { label: 'Budget vs Actual', link: 'Accounting/operasional/accounting_budget_vs_actual.html', icon: 'scale-balance' },
          { label: 'Pengajuan Barang & Jasa', link: 'Accounting/operasional/accounting_pengajuan_barang_jasa.html', icon: 'shopping-cart' },
          { label: 'Tagihan Berkala', link: 'Accounting/operasional/accounting_tagihan_berkala.html', icon: 'repeat' }
          // { label: 'History Dokumen', link: 'Accounting/operasional/accounting_history_dokumen.html' } /* Dihapus sementara */
        ]
      },
      {
        type: 'group', label: 'Laporan Keuangan', icon: 'spreadsheet', id: 'm-acc-laporan-keuangan',
        children: [
          { label: 'Profit Project & Brand', link: 'Accounting/laporan_keuangan/accounting_profit_project_brand.html', icon: 'trending-up' },
          { label: 'Arus Kas', link: 'Accounting/laporan_keuangan/accounting_arus_kas.html', icon: 'banknote' },
          { label: 'Piutang', link: 'Accounting/laporan_keuangan/accounting_piutang.html', icon: 'hand-coins' },
          { label: 'Utang', link: 'Accounting/laporan_keuangan/accounting_utang.html', icon: 'credit-card' },
          { label: 'Penyusutan Aset', link: 'Accounting/laporan_keuangan/accounting_penyusutan_aset.html', icon: 'calculator' },
          { label: 'Laba Rugi', link: 'Accounting/laporan_keuangan/accounting_laba_rugi.html', icon: 'scale' },
          { label: 'Neraca', link: 'Accounting/laporan_keuangan/accounting_neraca.html', icon: 'landmark' },
          { label: 'Rekap Divisi', link: 'Accounting/laporan_keuangan/accounting_rekap_divisi.html', icon: 'layout-grid' }
        ]
      },
      { type: 'heading', label: 'Perancangan & Dokumen' },
      {
        type: 'group', label: 'Dokumen & Kolaborasi', icon: 'folder', id: 'm-acc-dokumen',
        children: [
          { label: 'My Folders', link: 'Accounting/dokumen_kolaborasi/accounting_folder.html', icon: 'folder-open' }
        ]
      },
      {
        type: 'group', label: 'Perancangan Kerja', icon: 'task', id: 'm-acc-perancangan',
        children: [
          { label: 'RRK', link: 'Accounting/perancangan_kerja/accounting_rrk.html', icon: 'file-text' },
          { label: 'Milestone', link: 'Accounting/perancangan_kerja/accounting_Milestone.html', icon: 'flag' },
          { label: 'Tugas', link: 'Accounting/perancangan_kerja/accounting_tugas.html', icon: 'check-square' },
          { label: 'Projects', link: 'Accounting/perancangan_kerja/accounting_project.html', icon: 'kanban' },
          { label: 'Laporan', link: 'Accounting/perancangan_kerja/accounting_laporan.html', icon: 'file-bar-chart' },
          { label: 'Pengaduan', link: 'Accounting/perancangan_kerja/accounting_pengaduan.html', icon: 'alert-circle' }
        ]
      },
      { type: 'heading', label: 'Data Master' },
      {
        type: 'group', label: 'Data Master', icon: 'tag', id: 'm-acc-master',
        children: [
          { label: 'Master COA', link: 'Accounting/data_master/accounting_master_coa.html', icon: 'binary' },
          { label: 'Penanggung Jawab', link: 'Accounting/data_master/accounting_penanggung_jawab.html', icon: 'user-check' },
          { label: 'Divisi', link: 'Accounting/data_master/accounting_divisi.html', icon: 'building-2' },
          { label: 'Jenis Transaksi', link: 'Accounting/data_master/accounting_jenis_transaksi.html', icon: 'tags' },
          { label: 'Data Karyawan', link: 'Accounting/data_master/accounting_data_karyawan.html', icon: 'users' }
        ]
      }
    ]
  };

  // 4. Koleksi Mapping Ikon Lucide Modern (24x24, Clean & Consistent)
  const lucideIconMap = {
    home: 'layout-dashboard',
    calendar: 'calendar-days',
    book: 'book-open',
    spv: 'user-check',
    staff: 'users',
    accounting: 'calculator',
    users: 'users',
    task: 'clipboard-list',
    clock: 'clock',
    star: 'star',
    folder: 'folder',
    buildings: 'building-2',
    briefcase: 'package-check',
    chart: 'trending-up',
    tag: 'tags',
    brand: 'sparkles',
    report: 'file-text',
    spreadsheet: 'file-spreadsheet'
  };

  // Koleksi SVG Submenu Berkualitas Tinggi (Inline SVG: 100% Reliable, Zero Dependency Bug)
  const SUBMENU_SVGS = {
    // ── Laporan Keuangan ──
    'trending-up': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
    'banknote': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>`,
    'hand-coins': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17"/><path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/><circle cx="18" cy="6" r="3"/></svg>`,
    'credit-card': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>`,
    'calculator': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01"/></svg>`,
    'scale': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>`,
    'landmark': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>`,
    'layout-grid': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>`,

    // ── Kehadiran ──
    'calendar-check': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="m9 16 2 2 4-4"/></svg>`,
    'coffee': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h12Z"/><path d="M6 2v2"/><path d="M17 12h2a2 2 0 0 0 2-2 2 2 0 0 0-2-2h-2"/></svg>`,
    'clock-alert': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/><path d="M12 18h.01"/></svg>`,

    // ── Operasional ──
    'layout-dashboard': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
    'wallet': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>`,
    'arrow-down-left': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="17" x2="7" y1="7" y2="17"/><polyline points="17 17 7 17 7 7"/></svg>`,
    'check-check': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg>`,
    'receipt': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/></svg>`,
    'badge-dollar-sign': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>`,
    'percent': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>`,
    'boxes': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l6 3.43a2 2 0 0 0 2.06 0l6-3.43a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71l-6-3.43a2 2 0 0 0-2.06 0l-6 3.43Z"/><path d="m12 12.5 6 3.43"/><path d="m12 12.5-6 3.43"/><path d="M12 12.5V23"/></svg>`,
    'arrow-left-right': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>`,
    'layers': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
    'file-minus': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 15h6"/></svg>`,
    'file-plus': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 15h6"/><path d="M12 12v6"/></svg>`,
    'scale-balance': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>`,
    'shopping-cart': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`,
    'repeat': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>`,

    // ── Dokumen & Kolaborasi ──
    'folder-open': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/></svg>`,

    // ── Perancangan Kerja ──
    'file-text': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`,
    'flag': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>`,
    'check-square': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
    'kanban': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 5v11"/><path d="M12 5v6"/><path d="M18 5v14"/></svg>`,
    'file-bar-chart': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 18v-2"/><path d="M12 18v-4"/><path d="M16 18v-6"/></svg>`,
    'alert-circle': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`,

    // ── Data Master ──
    'binary': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="14" width="4" height="6" rx="2"/><rect x="6" y="4" width="4" height="6" rx="2"/><path d="M6 20h4"/><path d="M14 10h4"/><path d="M6 14h2v6"/><path d="M14 4h2v6"/></svg>`,
    'user-check': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>`,
    'building-2': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>`,
    'tags': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19"/><path d="M9.586 5.586A2 2 0 0 0 8.172 5H3a1 1 0 0 0-1 1v5.172a2 2 0 0 0 .586 1.414L8.29 18.29a2.4 2.4 0 0 0 3.414 0l4.586-4.586a2.4 2.4 0 0 0 0-3.414l-5.704-5.704a2 2 0 0 0-1-.586Z"/><circle cx="6.5" cy="6.5" r="1.5"/></svg>`,
    'users': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    'target': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
    'package': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
    'award': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>`,
    'sparkles': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>`,
    'star': `<svg style="width:15px;height:15px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
  };

  function renderLucideIcon(key) {
    const iconName = lucideIconMap[key] || key || 'circle';
    return `<i data-lucide="${iconName}" class="app-nav-icon" style="width: 18px; height: 18px; flex-shrink: 0;"></i>`;
  }

  function triggerLucideIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    } else {
      let script = document.querySelector('script[src*="lucide"]');
      if (!script) {
        script = document.createElement('script');
        script.src = 'https://unpkg.com/lucide@latest';
        document.head.appendChild(script);
      }
      script.addEventListener('load', function () {
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
          window.lucide.createIcons();
        }
      });
    }
  }

  // Toggle Group Handler dengan Animasi Halus
  window.bmToggleGroup = function (el) {
    const targetId = el.getAttribute('data-target');
    const ul = document.getElementById(targetId);
    const chev = el.querySelector('.chev');
    if (!ul) return;
    const isExpanded = ul.classList.contains('is-expanded');
    if (isExpanded) {
      ul.classList.remove('is-expanded');
      el.setAttribute('data-expanded', 'false');
      if (chev) chev.style.transform = 'rotate(-90deg)';
    } else {
      ul.classList.add('is-expanded');
      el.setAttribute('data-expanded', 'true');
      if (chev) chev.style.transform = 'rotate(0deg)';
    }

    // Pertahankan posisi scroll sidebar setelah grup dibuka/ditutup
    const sidebarBox = document.getElementById('app-sidebar-box');
    if (sidebarBox) {
      sessionStorage.setItem('bm_sidebar_scroll_top', String(sidebarBox.scrollTop));
    }
  };

  const activeList = menus[role] || menus['admin'];
  // Global Tracker untuk Urutan Update Referensi Dokumen Accounting (Single Source of Truth)
  window.recordAccountingReferensiUpdate = function (kode) {
    if (!kode) return;
    const clean = String(kode).trim().toLowerCase();
    if (!clean || clean === '-' || clean === 'tambah reverensi') return;
    try {
      const KEY = 'accounting_referensi_updates_v1';
      const raw = localStorage.getItem(KEY);
      const map = (raw && typeof JSON.parse(raw) === 'object' && JSON.parse(raw) !== null) ? JSON.parse(raw) : {};
      let maxSeq = 0;
      Object.keys(map).forEach(function (k) {
        if (map[k] && typeof map[k].seq === 'number' && map[k].seq > maxSeq) {
          maxSeq = map[k].seq;
        }
      });
      const entry = { seq: maxSeq + 1, ts: Date.now() };
      map[clean] = entry;
      if (clean.startsWith('exp-')) map['pb-' + clean.slice(4)] = entry;
      if (clean.startsWith('pb-')) map['exp-' + clean.slice(3)] = entry;
      localStorage.setItem(KEY, JSON.stringify(map));
    } catch (e) {}
  };

  window.getAccountingReferensiUpdates = function () {
    try {
      const raw = localStorage.getItem('accounting_referensi_updates_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {}
    return {};
  };

  // Cegah browser auto-translate mengubah istilah menu seperti "Profit Project & Brand" menjadi "Proyek Keuntungan & Merek"
  (function disableBrowserAutoTranslateOnSidebar() {
    try {
      if (document.documentElement) {
        document.documentElement.setAttribute('translate', 'no');
      }
      if (document.head && !document.querySelector('meta[name="google"][content="notranslate"]')) {
        const meta = document.createElement('meta');
        meta.name = 'google';
        meta.content = 'notranslate';
        document.head.appendChild(meta);
      }
    } catch (e) {}
  })();

  const NAV_CACHE_VER = 'v=20261123_v6';
  let menuHtml = '';
  let isFirstHeading = true;

  activeList.forEach(m => {
    if (m.type === 'heading') {
      menuHtml += `
        <li class="sidebar-heading-item notranslate" translate="no" style="list-style:none;margin:${isFirstHeading ? '4px 6px 4px 6px' : '14px 6px 4px 6px'};padding:${isFirstHeading ? '4px 8px' : '10px 8px 4px 8px'};border-top:${isFirstHeading ? 'none' : '1px solid #f1f5f9'};font-size:9.5px;font-weight:700;color:#94a3b8;letter-spacing:0.8px;text-transform:uppercase;">
          <span class="app-heading-label notranslate" translate="no" data-fixed-label="${m.label}" aria-label="${m.label}"></span>
        </li>`;
      isFirstHeading = false;
    } else if (m.type === 'item') {
      const fullLink = rootPrefix + m.link + (m.link.includes('?') ? '&' : '?') + NAV_CACHE_VER;
      const isActive = currentFile.toLowerCase() === m.link.split('/').pop().toLowerCase();
      menuHtml += `
        <li style="list-style:none;margin:0 0 3px 0;padding:0;">
          <a href="${fullLink}" class="app-nav-item notranslate ${isActive ? 'is-active' : ''}" translate="no" data-exact-label="${m.label}" style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:10px;font-size:13px;text-decoration:none;transition:all 0.2s cubic-bezier(0.4, 0, 0.2, 1);${isActive ? 'background-color:#0284c7;color:#ffffff;font-weight:700;box-shadow:0 3px 8px rgba(2,132,199,0.25);' : 'color:#334155;font-weight:700;'}">
            ${renderLucideIcon(m.icon)}
            <span class="app-menu-label notranslate" translate="no" data-fixed-label="${m.label}" aria-label="${m.label}" style="font-weight:700;color:inherit;"></span>
          </a>
        </li>`;
    } else if (m.type === 'group') {
      let subHtml = '';
      let isGroupActive = false;
      // Deteksi folder grup — jika semua child berada di folder yang sama, deteksi per folder
      const groupFolder = m.children.length > 0
        ? m.children[0].link.split('/').slice(0, -1).join('/').toLowerCase()
        : '';
      const currentPathLower = normalizedPath.toLowerCase();
      m.children.forEach(sub => {
        const fullSubLink = rootPrefix + sub.link + (sub.link.includes('?') ? '&' : '?') + NAV_CACHE_VER;
        const subFileName = sub.link.split('/').pop().toLowerCase();
        // Cocokkan nama file ATAU full path mengandung link sub-item
        const subLinkLower = sub.link.toLowerCase();
        const isSubActive = currentFile.toLowerCase() === subFileName
          || currentPathLower.endsWith('/' + subLinkLower)
          || currentPathLower.includes('/' + subLinkLower);
        if (isSubActive) isGroupActive = true;

        const hasCustomIcon = Boolean(sub.icon && SUBMENU_SVGS[sub.icon]);
        const iconMarkup = hasCustomIcon
          ? `<span class="app-sub-icon">${SUBMENU_SVGS[sub.icon]}</span>`
          : `<span style="width:4px;height:4px;border-radius:50%;background-color:${isSubActive ? '#ffffff' : '#cbd5e1'};flex-shrink:0;"></span>`;

        const padGap = hasCustomIcon
          ? 'gap:10px;padding:7px 12px 7px 16px;'
          : 'gap:8px;padding:6px 12px 6px 28px;';

        const fixedSubLabel = subFileName === 'accounting_profit_project_brand.html' ? 'Profit Project & Brand' : sub.label;

        subHtml += `
          <li style="list-style:none;margin:2px 0;padding:0;">
            <a href="${fullSubLink}" class="app-sub-item notranslate ${isSubActive ? 'is-active' : ''}" translate="no" data-exact-label="${fixedSubLabel}" style="display:flex;align-items:center;${padGap}font-size:12.5px;text-decoration:none;border-radius:9px;transition:all 0.18s cubic-bezier(0.4, 0, 0.2, 1);${isSubActive ? 'background-color:#0284c7;color:#ffffff;font-weight:700;box-shadow:0 2px 6px rgba(2,132,199,0.22);' : 'color:#334155;font-weight:700;'}">
              ${iconMarkup}
              <span class="app-menu-label notranslate" translate="no" data-fixed-label="${fixedSubLabel}" aria-label="${fixedSubLabel}" title="${fixedSubLabel}" style="flex:1 1 auto;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:700;color:inherit;"></span>
              ${hasCustomIcon && isSubActive ? '<span style="width:5px;height:5px;border-radius:50%;background-color:#ffffff;flex-shrink:0;margin-left:auto;"></span>' : ''}
            </a>
          </li>`;
      });

      // Jika grup punya folder, aktifkan juga berdasarkan path folder (untuk halaman di subfolder yang sama)
      if (!isGroupActive && groupFolder) {
        isGroupActive = currentPathLower.includes('/' + groupFolder + '/');
      }

      menuHtml += `
        <li style="list-style:none;margin-top:4px;padding:0;">
          <div onclick="window.bmToggleGroup(this)" data-target="${m.id}" data-expanded="${isGroupActive ? 'true' : 'false'}"
               class="app-group-header notranslate" translate="no" data-exact-label="${m.label}" tabindex="0"
               style="display:flex;align-items:center;justify-content:space-between;padding:7px 10px;font-size:12.5px;font-weight:700;color:#334155;cursor:pointer;border-radius:8px;transition:all 0.2s cubic-bezier(0.4, 0, 0.2, 1);">
            <div style="display:flex;align-items:center;gap:8px;">
              ${renderLucideIcon(m.icon)}
              <span class="app-menu-label notranslate" translate="no" data-fixed-label="${m.label}" aria-label="${m.label}" style="font-weight:700;color:inherit;"></span>
            </div>
            <i data-lucide="chevron-down" class="chev" style="width:14px;height:14px;color:#94a3b8;transition:transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);transform:${isGroupActive ? 'rotate(0deg)' : 'rotate(-90deg)'};flex-shrink:0;"></i>
          </div>
          <ul id="${m.id}" class="sidebar-submenu ${isGroupActive ? 'is-expanded' : ''}">${subHtml}</ul>
        </li>`;
    }
  });

  let homeLink = `${rootPrefix}BM/BM_dashboard.html`;
  if (role === 'spv_kol') homeLink = `${rootPrefix}SpvKol/spvkol_dashboard.html`;
  else if (role === 'staff_kol') homeLink = `${rootPrefix}StaffKol/staffkol_dashboard.html`;
  else if (role === 'accounting') homeLink = `${rootPrefix}Accounting/accounting_dashboard.html`;

  // Info Akun & Keterangan Portal Sesuai Login dan Halaman yang Dibuka
  const roleDisplayNames = {
    admin: 'Rayi (Admin)',
    spv_kol: 'Rayi',
    staff_kol: 'Rayi (Staff)',
    accounting: 'Ridha Ayu'
  };
  const portalLabels = {
    admin: 'Beranda Admin',
    spv_kol: 'Beranda SPVKOL',
    staff_kol: 'Beranda Staff KOL',
    accounting: 'Beranda Accounting'
  };

  const currentUserPic = role === 'staff_kol' ? String(localStorage.getItem('user_pic') || '').trim() : '';
  const storedUserName = String(localStorage.getItem('user_name') || '').trim();
  const currentUserName = role === 'staff_kol'
    ? (currentUserPic || storedUserName || 'Staff KOL')
    : role === 'spv_kol'
      ? 'Rayi'
      : role === 'accounting'
        ? (storedUserName === 'Rida' ? 'Ridha Ayu' : (storedUserName || 'Ridha Ayu'))
        : (storedUserName || roleDisplayNames[role] || 'Rayi (Admin)');
  const currentPortalLabel = portalLabels[role] || 'Beranda SPVKOL';
  const currentRoleLabel = role === 'spv_kol'
    ? 'SPV KOL'
    : role === 'staff_kol'
      ? ('Staff KOL' + (currentUserPic ? ' — PIC ' + currentUserPic : ''))
      : role === 'accounting'
        ? 'Accounting'
        : 'Admin';
  const rawAvatar = localStorage.getItem('user_avatar');
  const currentAvatar = (rawAvatar && !rawAvatar.includes('undefined'))
    ? (rawAvatar.startsWith('http') ? rawAvatar : rootPrefix + rawAvatar.replace(/^\/+/, ''))
    : `${rootPrefix}media/avatar.png`;

  const sidebarDOM = `
    <style>
      #app-sidebar-box {
        scroll-behavior: auto;
      }
      #app-sidebar-box::-webkit-scrollbar { width: 4px; }
      #app-sidebar-box::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
      #app-sidebar-box::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }

      /* Animasi Halus Dropdown Submenu (Instan pada Load Awal, Halus saat Diklik) */
      .sidebar-submenu {
        max-height: 0;
        opacity: 0;
        overflow: hidden;
        margin: 0;
        padding: 0;
        list-style: none;
      }
      .sidebar-submenu.is-expanded {
        max-height: none !important;
        opacity: 1 !important;
        margin: 2px 0 4px 0 !important;
      }
      #app-sidebar.sidebar-animated .sidebar-submenu {
        transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), margin 0.25s ease;
      }
      #app-sidebar.sidebar-animated .sidebar-submenu:not(.is-expanded) {
        max-height: 0 !important;
        opacity: 0 !important;
        margin: 0 !important;
      }
      #app-sidebar.sidebar-animated .sidebar-submenu.is-expanded {
        max-height: 2000px !important;
        opacity: 1 !important;
        margin: 2px 0 4px 0 !important;
      }

      /* Topbar User Profile Dropdown Display Guarantee */
      .topbar-user-dropdown-wrap {
        position: relative !important;
        z-index: 1001 !important;
      }
      .hirezy-user-pill {
        cursor: pointer !important;
      }
      .topbar-user-dropdown-wrap.is-open .user-menu-dropdown,
      .user-menu-dropdown.is-open,
      .user-menu-dropdown.show {
        display: block !important;
        opacity: 1 !important;
        visibility: visible !important;
        transform: translateY(0) !important;
        pointer-events: auto !important;
      }
      .topbar-user-dropdown-wrap.is-open .hirezy-chevron-down,
      .hirezy-user-pill[aria-expanded="true"] .hirezy-chevron-down {
        transform: rotate(180deg) !important;
      }

      /* Hover Header Grup */
      .app-group-header:hover {
        background-color: #f8fafc;
        color: #0284c7 !important;
      }

      /* Icon Monoline Styling (#1E40AF Enterprise Dark Blue - Bolder & More Prominent) */
      .app-nav-icon {
        width: 18.5px;
        height: 18.5px;
        flex-shrink: 0;
        stroke: #1e40af;
        stroke-width: 2.25px !important;
        transition: stroke 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .app-nav-item.is-active .app-nav-icon,
      .app-sub-item.is-active .app-nav-icon {
        stroke: #ffffff !important;
      }
      .app-nav-item:not(.is-active):hover .app-nav-icon,
      .app-group-header:hover .app-nav-icon {
        stroke: #0284c7;
      }

      /* Submenu Custom Icon Styling (Monoline, Stroke Transition) */
      .app-sub-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }
      .app-sub-icon svg {
        width: 15px;
        height: 15px;
        stroke: #64748b;
        stroke-width: 2;
        transition: stroke 0.18s ease;
      }
      .app-sub-item.is-active .app-sub-icon svg {
        stroke: #ffffff !important;
      }
      .app-sub-item:not(.is-active):hover .app-sub-icon svg {
        stroke: #0284c7 !important;
      }

      /* Render seluruh teks label menu melalui CSS ::before agar 100% KEBAL terhadap Chrome Google Translate */
      #app-sidebar .app-menu-label[data-fixed-label],
      #app-sidebar .app-heading-label[data-fixed-label] {
        font-size: 0 !important;
      }
      #app-sidebar .app-heading-label[data-fixed-label]::before {
        content: attr(data-fixed-label) !important;
        font-size: 9.5px !important;
        font-weight: 700 !important;
        color: #94a3b8 !important;
        letter-spacing: 0.8px !important;
        text-transform: uppercase !important;
      }
      #app-sidebar .app-menu-label[data-fixed-label]::before {
        content: attr(data-fixed-label) !important;
        font-size: 12.5px !important;
        font-weight: 700 !important;
        color: inherit !important;
        font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      }
      #app-sidebar .app-nav-item .app-menu-label[data-fixed-label]::before {
        font-size: 13px !important;
      }
      #app-sidebar a[href*="accounting_profit_project_brand.html"] .app-menu-label::before {
        content: "Profit Project & Brand" !important;
      }

      /* Konsistensi Tipografi Sidebar: semua label selalu bold (700) dengan warna seragam (#334155) di setiap modul */
      #app-sidebar,
      #app-sidebar .app-nav-item,
      #app-sidebar .app-sub-item,
      #app-sidebar .app-group-header,
      #app-sidebar .app-menu-label,
      #app-sidebar .app-nav-item span,
      #app-sidebar .app-sub-item span,
      #app-sidebar .app-group-header span,
      #app-sidebar .app-nav-item font,
      #app-sidebar .app-sub-item font,
      #app-sidebar .app-group-header font {
        font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        font-weight: 700 !important;
      }
      #app-sidebar .app-nav-item:not(.is-active),
      #app-sidebar .app-sub-item:not(.is-active),
      #app-sidebar .app-group-header,
      #app-sidebar .app-nav-item:not(.is-active) span,
      #app-sidebar .app-sub-item:not(.is-active) span,
      #app-sidebar .app-group-header span,
      #app-sidebar .app-nav-item:not(.is-active) font,
      #app-sidebar .app-sub-item:not(.is-active) font,
      #app-sidebar .app-group-header font {
        color: #334155 !important;
        font-weight: 700 !important;
      }

      /* 1. Normal State */
      .app-nav-item,
      .app-sub-item {
        position: relative;
        outline: none;
      }

      /* 2. Hover State (HANYA untuk item yang TIDAK aktif & TIDAK disabled) */
      #app-sidebar .app-nav-item:not(.is-active):not(.is-disabled):hover,
      #app-sidebar .app-nav-item:not(.is-active):not(.is-disabled):hover span,
      #app-sidebar .app-nav-item:not(.is-active):not(.is-disabled):hover font {
        background-color: #f1f5f9 !important;
        color: #0284c7 !important;
      }
      #app-sidebar .app-nav-item:not(.is-active):not(.is-disabled):hover {
        transform: translateX(2px);
      }
      #app-sidebar .app-sub-item:not(.is-active):not(.is-disabled):hover,
      #app-sidebar .app-sub-item:not(.is-active):not(.is-disabled):hover span,
      #app-sidebar .app-sub-item:not(.is-active):not(.is-disabled):hover font {
        background-color: #f8fafc !important;
        color: #0284c7 !important;
      }
      #app-sidebar .app-sub-item:not(.is-active):not(.is-disabled):hover {
        transform: translateX(2px);
      }
      #app-sidebar .app-group-header:hover,
      #app-sidebar .app-group-header:hover span,
      #app-sidebar .app-group-header:hover font {
        background-color: #f8fafc !important;
        color: #0284c7 !important;
      }

      /* 3. Focus State (Aksesibilitas Keyboard Navigasi Tab) */
      .app-nav-item:focus-visible,
      .app-sub-item:focus-visible,
      .app-group-header:focus-visible {
        outline: 2px solid #38bdf8 !important;
        outline-offset: 2px !important;
        border-radius: 8px !important;
      }

      /* 4. Active State (Sedang Diakses - Solid, Tenang & Bebas Kedipan) */
      #app-sidebar .app-nav-item.is-active,
      #app-sidebar .app-nav-item.is-active:hover,
      #app-sidebar .app-nav-item.is-active:focus,
      #app-sidebar .app-nav-item.is-active:active {
        background-color: #0284c7 !important;
        color: #ffffff !important;
        font-weight: 700 !important;
        box-shadow: 0 3px 8px rgba(2, 132, 199, 0.25) !important;
        cursor: default !important;
        transform: none !important;
      }
      #app-sidebar .app-sub-item.is-active,
      #app-sidebar .app-sub-item.is-active:hover,
      #app-sidebar .app-sub-item.is-active:focus,
      #app-sidebar .app-sub-item.is-active:active {
        background-color: #0284c7 !important;
        color: #ffffff !important;
        font-weight: 700 !important;
        box-shadow: 0 2px 6px rgba(2, 132, 199, 0.2) !important;
        cursor: default !important;
        transform: none !important;
      }
      #app-sidebar .app-nav-item.is-active span,
      #app-sidebar .app-nav-item.is-active font,
      #app-sidebar .app-sub-item.is-active span,
      #app-sidebar .app-sub-item.is-active font {
        color: #ffffff !important;
        font-weight: 700 !important;
        background: transparent !important;
      }

      /* 5. Disabled State */
      .app-nav-item.is-disabled,
      .app-sub-item.is-disabled,
      .app-nav-item[aria-disabled="true"],
      .app-sub-item[aria-disabled="true"] {
        opacity: 0.45 !important;
        color: #94a3b8 !important;
        cursor: not-allowed !important;
        pointer-events: none !important;
        background-color: transparent !important;
        transform: none !important;
        box-shadow: none !important;
      }

      .sidebar-brand-header {
        text-decoration: none;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .sidebar-brand-header:hover {
        background-color: #f8fafc;
      }
      .sidebar-brand-header:hover .brand-logo-img {
        transform: scale(1.06);
      }

      /* Layout Sidebar Shell */
      #app-sidebar-inner {
        width: 240px;
        min-width: 240px;
        max-width: 240px;
        height: 100vh;
        position: fixed;
        left: 0;
        top: 0;
        background: #ffffff;
        border-right: 1px solid #f1f5f9;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        z-index: 999;
        box-sizing: border-box;
        transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.28s ease;
      }

      /* Backdrop Mobile & Tablet */
      #sidebar-backdrop {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.4);
        backdrop-filter: blur(3px);
        -webkit-backdrop-filter: blur(3px);
        z-index: 998;
        opacity: 0;
        transition: opacity 0.25s ease;
      }
      #sidebar-backdrop.is-visible {
        display: block;
        opacity: 1;
      }

      /* Responsivitas: Tablet & Mobile (< 1024px) */
      @media (max-width: 1023px) {
        #app-sidebar,
        aside#app-sidebar {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          bottom: 0 !important;
          width: 0 !important;
          z-index: 1050 !important;
          pointer-events: none !important;
        }
        #app-sidebar.is-open,
        aside#app-sidebar.is-open,
        body.sidebar-open #app-sidebar,
        body.sidebar-open aside#app-sidebar {
          width: 240px !important;
          pointer-events: auto !important;
          transform: translateX(0) !important;
        }
        #app-sidebar-inner {
          z-index: 1050 !important;
          transform: translateX(-100%);
        }
        #app-sidebar.is-open #app-sidebar-inner,
        body.sidebar-open #app-sidebar-inner {
          transform: translateX(0) !important;
          box-shadow: 0 10px 40px rgba(15, 23, 42, 0.25) !important;
        }
        .dashboard-shell,
        .layout-page {
          margin-left: 0 !important;
          width: 100% !important;
        }
      }

      /* Responsivitas: Desktop (>= 1024px) */
      /* Logout Button Styling at the bottom of sidebar */
      .sidebar-logout-btn {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 8px !important;
        width: 100% !important;
        padding: 8px 12px !important;
        border-radius: 8px !important;
        border: 1px solid #fee2e2 !important;
        background: #fff5f5 !important;
        color: #ef4444 !important;
        text-decoration: none !important;
        font-size: 12.5px !important;
        font-weight: 600 !important;
        cursor: pointer !important;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        box-sizing: border-box !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      .sidebar-logout-btn:hover {
        background: #fee2e2 !important;
        border-color: #fca5a5 !important;
        color: #dc2626 !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 2px 6px rgba(239, 68, 68, 0.15) !important;
      }
      .sidebar-logout-btn:active {
        transform: translateY(0) !important;
      }
      .sidebar-logout-btn svg {
        transition: transform 0.2s ease;
        stroke: currentColor !important;
        fill: none !important;
      }
      .sidebar-logout-btn:hover svg {
        transform: translateX(2px);
      }

      @media (min-width: 1024px) {
        #app-sidebar-inner {
          transform: translateX(0) !important;
        }
        #sidebar-backdrop {
          display: none !important;
        }
      }
    </style>
    <div id="app-sidebar-inner" style="height:100vh;max-height:100vh;display:flex;flex-direction:column;box-sizing:border-box;overflow:hidden;">
      <!-- Logo Brand (Clean Logo, No Blue Box, No MCN Platform Subtitle) -->
      <a href="${homeLink}" class="sidebar-brand-header" style="padding:16px 16px 14px 16px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #f1f5f9;text-decoration:none;flex-shrink:0;">
        <img src="${rootPrefix}media/logo.png" class="brand-logo-img" style="width:38px;height:38px;object-fit:contain;flex-shrink:0;display:block;transition:transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);" alt="Logo Bisa Media" onerror="this.style.display='none'" />
        <div style="display:flex;flex-direction:column;">
          <span style="font-size:23px;font-weight:800;color:#0f172a;letter-spacing:-0.7px;font-family:'Plus Jakarta Sans','Outfit',system-ui,sans-serif;line-height:1.15;white-space:nowrap;">Bisa Media</span>
          <span style="font-size:10px;font-weight:700;color:#0284c7;letter-spacing:0.8px;text-transform:uppercase;line-height:1.2;margin-top:1px;">${
            role === 'accounting' ? 'Accounting' :
            role === 'spv_kol' ? 'SPV KOL' :
            role === 'staff_kol' ? 'Staff KOL' :
            'Admin'
          }</span>
        </div>
      </a>
      <!-- Scrollable Navigation Menu (Direct flex child: takes available height) -->
      <div id="app-sidebar-box" style="overflow-y:auto;overflow-x:hidden;flex:1 1 auto;min-height:0;padding:6px 10px;scrollbar-width:thin;">
        <ul style="margin:0;padding:0;list-style:none;">${menuHtml}</ul>
      </div>
    </div>
  `;

  // ── Sidebar smooth transition & SweetAlert2 style injection ─────────
  (function injectSidebarTransitionCSS() {
    if (document.getElementById('bm-sidebar-transition-css')) return;
    const s = document.createElement('style');
    s.id = 'bm-sidebar-transition-css';
    s.textContent = `
      #app-sidebar {
        transition: transform 0.28s cubic-bezier(0.4,0,0.2,1), width 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.22s ease;
        will-change: transform, width;
      }
      body.sidebar-collapsed #app-sidebar {
        width: 0 !important;
        overflow: hidden !important;
        transform: translateX(-100%) !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
      .dashboard-shell, .layout-page, .layout-container {
        transition: margin-left 0.28s cubic-bezier(0.4,0,0.2,1), width 0.28s cubic-bezier(0.4,0,0.2,1) !important;
      }
      body.sidebar-collapsed .dashboard-shell,
      body.sidebar-collapsed .layout-page,
      body.sidebar-collapsed .layout-container {
        margin-left: 0 !important;
        width: 100% !important;
      }
      #app-sidebar .app-nav-item, #app-sidebar .app-sub-item {
        transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease !important;
      }
      .icon-button--menu span {
        display: block;
        width: 20px;
        height: 2px;
        background: currentColor;
        border-radius: 2px;
        transition: transform 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease;
        transform-origin: center;
      }
      body.sidebar-collapsed .icon-button--menu span:nth-child(1) { transform: translateY(8px) rotate(45deg); }
      body.sidebar-collapsed .icon-button--menu span:nth-child(2) { opacity: 0; transform: scaleX(0); }
      body.sidebar-collapsed .icon-button--menu span:nth-child(3) { transform: translateY(-8px) rotate(-45deg); }
      #sidebar-backdrop {
        position: fixed; inset: 0;
        background: rgba(15,23,42,0.45);
        z-index: 1040 !important;
        opacity: 0; pointer-events: none;
        transition: opacity 0.25s ease;
        backdrop-filter: blur(3px);
        -webkit-backdrop-filter: blur(3px);
      }
      #sidebar-backdrop.is-visible { opacity: 1; pointer-events: auto; }

      /* Sticky Fixed Floating Topbar Navbar */
      html, body {
        overflow-x: clip !important;
      }
      .dashboard-shell,
      .layout-page,
      .layout-container {
        overflow: visible !important;
      }
      .topbar,
      header.topbar,
      .topbar.hirezy-topbar,
      header.topbar.hirezy-topbar {
        position: sticky !important;
        top: 14px !important;
        z-index: 990 !important;
        background: rgba(255, 255, 255, 0.98) !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
        border: 1px solid #e2e8f0 !important;
        border-radius: 12px !important;
        box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08) !important;
      }

      /* SweetAlert2 Theme Customization for Bisa Media */
      .swal2-bisa-popup {
        font-family: 'Plus Jakarta Sans', 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        border-radius: 16px !important;
        box-shadow: 0 20px 40px rgba(15, 23, 42, 0.16) !important;
        padding: 26px 24px !important;
      }
      .swal2-bisa-popup .swal2-title {
        font-family: 'Plus Jakarta Sans', 'Outfit', sans-serif !important;
        font-size: 19px !important;
        font-weight: 700 !important;
        color: #0f172a !important;
        margin-top: 10px !important;
      }
      .swal2-bisa-popup .swal2-html-container {
        font-family: 'Plus Jakarta Sans', 'Outfit', sans-serif !important;
        font-size: 13.5px !important;
        color: #64748b !important;
        line-height: 1.55 !important;
        margin-top: 8px !important;
      }
      .swal2-bisa-popup .swal2-actions {
        gap: 10px !important;
        margin-top: 20px !important;
      }
      .swal2-bisa-popup .swal2-confirm,
      .swal2-bisa-popup .swal2-cancel {
        font-family: 'Plus Jakarta Sans', 'Outfit', sans-serif !important;
        font-size: 13px !important;
        font-weight: 600 !important;
        border-radius: 10px !important;
        padding: 10px 22px !important;
        box-shadow: none !important;
        transition: all 0.18s ease !important;
        cursor: pointer !important;
      }
      .swal2-bisa-popup .swal2-confirm:hover {
        background-color: #dc2626 !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25) !important;
      }
      .swal2-bisa-popup .swal2-cancel:hover {
        background-color: #64748b !important;
        color: #ffffff !important;
      }
      .swal2-container {
        z-index: 9999999 !important;
      }

      /* SweetAlert2 Validation Redesign for Incomplete Data */
      .swal2-validation-popup {
        font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        border-radius: 16px !important;
        box-shadow: 0 20px 45px rgba(15, 23, 42, 0.16) !important;
      }
      .swal2-validation-popup .swal2-icon.swal2-warning {
        border-color: #f59e0b !important;
        color: #f59e0b !important;
        margin: 8px auto 14px auto !important;
        width: 64px !important;
        height: 64px !important;
      }
      .swal2-validation-popup .swal2-icon.swal2-warning .swal2-icon-content {
        font-size: 40px !important;
      }
      .swal2-validation-popup .swal2-title {
        padding: 0 0 2px 0 !important;
        margin: 0 !important;
      }
      .swal2-validation-popup .swal2-html-container {
        margin: 0 !important;
        padding: 0 4px !important;
        overflow: visible !important;
      }
      .swal2-validation-confirm-btn {
        font-family: 'Outfit', sans-serif !important;
        font-size: 13.5px !important;
        font-weight: 600 !important;
        border-radius: 8px !important;
        padding: 10px 28px !important;
        background-color: #0076C5 !important;
        color: #ffffff !important;
        border: none !important;
        box-shadow: 0 4px 14px rgba(0, 118, 197, 0.25) !important;
        transition: all 0.18s ease !important;
        cursor: pointer !important;
        display: inline-flex !important;
        align-items: center !important;
        gap: 8px !important;
      }
      .swal2-validation-confirm-btn:hover {
        background-color: #00609f !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 6px 18px rgba(0, 118, 197, 0.35) !important;
      }
    `;
    document.head.appendChild(s);
  })();

  // 5. Render Sidebar & Layout Offset
  function renderAppSidebar() {
    // Pastikan backdrop container ada di body
    let backdrop = document.getElementById('sidebar-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'sidebar-backdrop';
      document.body.appendChild(backdrop);
    }

    let container = document.getElementById('app-sidebar') || document.getElementById('sidebar');
    if (!container) {
      container = document.createElement('aside');
      container.id = 'app-sidebar';
      document.body.prepend(container);
    }
    container.setAttribute('translate', 'no');
    container.classList.add('notranslate');
    container.innerHTML = sidebarDOM;

    // Pastikan nama label sidebar (khususnya "Profit Project & Brand") tetap 100% konsisten, bold, dan tidak diubah oleh auto-translate browser di modul mana pun
    let isEnforcingLabels = false;
    function enforceSidebarExactLabels() {
      if (isEnforcingLabels || !container) return;
      isEnforcingLabels = true;
      try {
        container.querySelectorAll('[data-exact-label]').forEach(function (el) {
          const exact = el.getAttribute('data-exact-label');
          const labelSpan = el.querySelector('.app-menu-label');
          if (exact && labelSpan) {
            if (labelSpan.getAttribute('data-fixed-label') !== exact) {
              labelSpan.setAttribute('data-fixed-label', exact);
            }
            if (labelSpan.textContent !== '') {
              labelSpan.textContent = '';
            }
          }
        });
        container.querySelectorAll('a[href*="accounting_profit_project_brand.html"]').forEach(function (link) {
          if (link.getAttribute('data-exact-label') !== 'Profit Project & Brand') {
            link.setAttribute('data-exact-label', 'Profit Project & Brand');
          }
          const labelSpan = link.querySelector('.app-menu-label') || link.querySelector('span:not(.app-sub-icon)');
          if (labelSpan) {
            if (labelSpan.getAttribute('data-fixed-label') !== 'Profit Project & Brand') {
              labelSpan.setAttribute('data-fixed-label', 'Profit Project & Brand');
            }
            if (labelSpan.textContent !== '') {
              labelSpan.textContent = '';
            }
          }
        });
      } catch (e) {}
      isEnforcingLabels = false;
    }
    enforceSidebarExactLabels();
    setTimeout(enforceSidebarExactLabels, 150);
    setTimeout(enforceSidebarExactLabels, 600);
    setTimeout(enforceSidebarExactLabels, 1500);
    if (typeof MutationObserver !== 'undefined') {
      const labelObserver = new MutationObserver(function () {
        enforceSidebarExactLabels();
      });
      labelObserver.observe(container, { childList: true, subtree: true, characterData: true });
    }

    // Sinkronisasi dan pertahankan posisi scroll sidebar agar tidak reset ke atas
    const sidebarBox = document.getElementById('app-sidebar-box');
    const SCROLL_STORAGE_KEY = 'bm_sidebar_scroll_top';

    const BOTTOM_OPERASIONAL_PAGES = [
      'accounting_pajak.html',
      'accounting_daftar_aset.html',
      'accounting_mutasi_aset.html',
      'accounting_alokasi_aset_project.html',
      'accounting_utang_karyawan.html',
      'accounting_piutang_karyawan.html',
      'accounting_budget_vs_actual.html',
      'accounting_pengajuan_barang_jasa.html',
      'accounting_tagihan_berkala.html',
      'spvkol_performa_kreator.html',
      'spvkol_tracking_sampel.html',
      'staffkol_performa_kreator.html',
      'staffkol_tracking_sampel.html'
    ];

    function syncSidebarScrollPosition() {
      if (!sidebarBox) return;
      const savedRaw = sessionStorage.getItem(SCROLL_STORAGE_KEY);
      const savedScroll = savedRaw !== null ? parseInt(savedRaw, 10) : null;
      const activeLink = container.querySelector('.app-nav-item.is-active, .app-sub-item.is-active');
      const currentFileName = window.location.pathname.split('/').pop().toLowerCase();
      const isBottomOperasional = BOTTOM_OPERASIONAL_PAGES.some(f => currentFileName.includes(f.toLowerCase()));

      if (isBottomOperasional) {
        if (savedScroll !== null && !isNaN(savedScroll) && savedScroll >= 150) {
          sidebarBox.scrollTop = savedScroll;
        } else {
          const targetBottomScroll = 200;
          sidebarBox.scrollTop = targetBottomScroll;
          sessionStorage.setItem(SCROLL_STORAGE_KEY, String(targetBottomScroll));
        }
        return;
      }

      if (currentFileName.includes('accounting_profit_project_brand.html')) {
        sidebarBox.scrollTop = 0;
        sessionStorage.setItem(SCROLL_STORAGE_KEY, '0');
        return;
      }

      if (savedScroll !== null && !isNaN(savedScroll)) {
        if (savedScroll >= 150) {
          sidebarBox.scrollTop = 0;
          sessionStorage.setItem(SCROLL_STORAGE_KEY, '0');
        } else {
          sidebarBox.scrollTop = savedScroll;
        }
      }

      // Jika item menu aktif berada di luar area pandang, gulirkan agar terlihat.
      if (activeLink) {
        const boxRect = sidebarBox.getBoundingClientRect();
        const itemRect = activeLink.getBoundingClientRect();
        const isItemVisible = (itemRect.top >= boxRect.top + 8) && (itemRect.bottom <= boxRect.bottom - 8);

        if (!isItemVisible) {
          const itemRelativeTop = sidebarBox.scrollTop + (itemRect.top - boxRect.top);
          const boxHeight = sidebarBox.clientHeight;
          const targetScroll = Math.max(0, itemRelativeTop - (boxHeight * 0.4));
          sidebarBox.scrollTop = targetScroll;
          sessionStorage.setItem(SCROLL_STORAGE_KEY, String(targetScroll));
        }
      }
    }

    if (sidebarBox) {
      // Terapkan posisi scroll secara instan tanpa delay visual
      syncSidebarScrollPosition();
      requestAnimationFrame(syncSidebarScrollPosition);
      setTimeout(syncSidebarScrollPosition, 80);

      // Simpan posisi scroll setiap kali pengguna menggulir sidebar
      sidebarBox.addEventListener('scroll', function () {
        sessionStorage.setItem(SCROLL_STORAGE_KEY, String(sidebarBox.scrollTop));
      }, { passive: true });

      // Simpan posisi scroll sebelum halaman berpindah ketika link diklik
      sidebarBox.addEventListener('click', function (e) {
        const link = e.target.closest('a');
        if (link) {
          const href = (link.getAttribute('href') || '').toLowerCase();
          if (href.includes('accounting_profit_project_brand.html')) {
            sessionStorage.setItem(SCROLL_STORAGE_KEY, '0');
          } else {
            sessionStorage.setItem(SCROLL_STORAGE_KEY, String(sidebarBox.scrollTop));
          }
        }
      });

      // Aktifkan animasi smooth toggle setelah inisialisasi awal selesai
      setTimeout(function () {
        if (container) container.classList.add('sidebar-animated');
      }, 120);
    }

    // Render Lucide Icons untuk elemen menu sidebar
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      lucide.createIcons();
    } else {
      triggerLucideIcons();
    }

    // Restore sidebar collapsed state from localStorage
    const wasCollapsed = localStorage.getItem('bm-sidebar-collapsed') === 'true';
    if (wasCollapsed && window.innerWidth >= 1024) {
      document.body.classList.add('sidebar-collapsed');
    }

    // Reset & Rapikan Layout Utama
    const shell = document.querySelector('.dashboard-shell') ||
      document.querySelector('.layout-page') ||
      document.querySelector('.layout-container');
    if (shell) {
      const collapsed = document.body.classList.contains('sidebar-collapsed');
      if (window.innerWidth >= 1024) {
        shell.style.setProperty('margin-left', collapsed ? '0' : '240px', 'important');
        shell.style.setProperty('width', collapsed ? '100%' : 'calc(100% - 240px)', 'important');
      } else {
        shell.style.setProperty('margin-left', '0', 'important');
        shell.style.setProperty('width', '100%', 'important');
      }
      shell.style.setProperty('padding-left', '0', 'important');
      shell.style.setProperty('padding-right', '0', 'important');
      shell.style.setProperty('min-width', '0', 'important');
      shell.style.setProperty('box-sizing', 'border-box', 'important');
    } else {
      const standaloneMain = document.querySelector('main') || document.querySelector('.main-content');
      if (standaloneMain && !standaloneMain.closest('.dashboard-shell') && !standaloneMain.closest('.layout-page')) {
        if (window.innerWidth >= 1024) {
          standaloneMain.style.setProperty('margin-left', '240px', 'important');
          standaloneMain.style.setProperty('width', 'calc(100% - 240px)', 'important');
        } else {
          standaloneMain.style.setProperty('margin-left', '0', 'important');
          standaloneMain.style.setProperty('width', '100%', 'important');
        }
        standaloneMain.style.setProperty('padding-left', '1.5rem', 'important');
        standaloneMain.style.setProperty('padding-right', '1.5rem', 'important');
      }
    }

    // Reset kontainer dalam dashboard-shell agar rapat dengan topbar dan rapi
    document.querySelectorAll('.dashboard-shell main, .dashboard-shell .dashboard-content, main.dashboard-content').forEach(el => {
      el.style.setProperty('margin-left', '24px', 'important');
      el.style.setProperty('margin-right', '24px', 'important');
      el.style.setProperty('margin-top', '18px', 'important');
      el.style.setProperty('padding-left', '0', 'important');
      el.style.setProperty('padding-right', '0', 'important');
      el.style.setProperty('width', 'calc(100% - 48px)', 'important');
      el.style.setProperty('box-sizing', 'border-box', 'important');
    });

    document.querySelectorAll('.dashboard-shell .topbar, header.topbar, .topbar').forEach(el => {
      el.style.setProperty('position', 'sticky', 'important');
      el.style.setProperty('top', '14px', 'important');
      el.style.setProperty('z-index', '990', 'important');
      el.style.setProperty('background', 'rgba(255, 255, 255, 0.96)', 'important');
      el.style.setProperty('backdrop-filter', 'blur(12px)', 'important');
      el.style.setProperty('-webkit-backdrop-filter', 'blur(12px)', 'important');
      el.style.setProperty('box-shadow', '0 4px 20px rgba(15, 23, 42, 0.07)', 'important');
      el.style.setProperty('margin-left', '24px', 'important');
      el.style.setProperty('margin-right', '24px', 'important');
      el.style.setProperty('margin-top', '14px', 'important');
      el.style.setProperty('width', 'calc(100% - 48px)', 'important');
      el.style.setProperty('box-sizing', 'border-box', 'important');
    });

    // Reset Sneat BM containers
    document.querySelectorAll('.layout-page .container-xxl, .layout-page .container-p-y').forEach(el => {
      el.style.setProperty('padding-left', '1.5rem', 'important');
      el.style.setProperty('padding-right', '1.5rem', 'important');
      el.style.setProperty('max-width', '100%', 'important');
    });

    // 5b. Role-based Unified Navbar (SPV KOL & Staff KOL)
    if (role === 'spv_kol') {
      renderSpvKolNavbar();
      initSpvTablePagination();
    } else if (role === 'staff_kol') {
      renderStaffKolNavbar();
    } else if (role === 'accounting') {
      renderAccountingNavbar();
      initSpvTablePagination();
    }

    // 5c. Render Dedicated Consistent Footer Template
    renderAppFooter();

    // Prevent flicker
    document.body.classList.add('sidebar-ready');
  }

  // Helper: Dedicated App Footer Template
  function renderAppFooter() {
    const shell = document.querySelector('.dashboard-shell') ||
      document.querySelector('.layout-page') ||
      document.querySelector('.layout-container');
    if (!shell) return;

    // Pastikan container utama adalah flex column dengan min-height: 100vh
    shell.style.setProperty('min-height', '100vh', 'important');
    shell.style.setProperty('display', 'flex', 'important');
    shell.style.setProperty('flex-direction', 'column', 'important');
    shell.style.setProperty('box-sizing', 'border-box', 'important');

    const main = shell.querySelector('main') || shell.querySelector('.dashboard-content') || shell.querySelector('.content-wrapper');
    if (main) {
      main.style.setProperty('flex', '1 0 auto', 'important');
    }

    const footerTemplateHTML = `
      <footer class="app-footer-template" style="margin-top:auto !important;flex-shrink:0 !important;width:100% !important;padding:18px 24px !important;border-top:1px solid #eef2f6 !important;text-align:center !important;font-family:'Plus Jakarta Sans',system-ui,sans-serif !important;color:#94a3b8 !important;font-size:12px !important;font-weight:500 !important;letter-spacing:0.2px !important;background:transparent !important;box-sizing:border-box !important;">
        &copy; 2026&nbsp; <strong>PT. Bisa Media Grup</strong> &nbsp;&bull;&nbsp; All rights reserved.
      </footer>
    `;

    // Hapus footer lama agar tidak duplikat atau bertumpuk
    shell.querySelectorAll('footer.dashboard-footer, footer.app-footer, footer.footer, .app-footer-template').forEach(el => el.remove());
    shell.insertAdjacentHTML('beforeend', footerTemplateHTML);
  }

  // Helper: SPV KOL Dynamic Table Pagination
  function initSpvTablePagination() {
    setTimeout(function () {
      const tables = document.querySelectorAll('.dashboard-shell table:not(.db-calendar-table):not(.db-topk-table):not(#tableLeaderboard):not(.mini-table):not(.no-pagination), main table:not(.db-calendar-table):not(.db-topk-table):not(#tableLeaderboard):not(.mini-table):not(.no-pagination)');
      tables.forEach(table => {
        if (table.closest('.analytics-card') || table.classList.contains('mini-table') || table.classList.contains('no-pagination')) return;
        const scrollWrap = table.closest('.table-wrap') || table.closest('.table-responsive') || table.closest('.campaign-scroll-table-wrap') || table.closest('[class*="-table-wrap"]');
        const parent = scrollWrap || table.parentElement;

        if (!parent) return;

        // Jika pagination sebelumnya terlanjur dimasukkan di dalam scroll container, pindahkan ke luar
        if (scrollWrap) {
          const insidePag = scrollWrap.querySelector(':scope > .hirezy-pagination-wrap');
          if (insidePag) {
            scrollWrap.after(insidePag);
            return;
          }
        }

        // Jangan buat duplikat jika pagination sudah ada setelah scroll container atau di dalam parent
        if ((scrollWrap && scrollWrap.nextElementSibling && scrollWrap.nextElementSibling.classList.contains('hirezy-pagination-wrap')) ||
          parent.querySelector(':scope > .hirezy-pagination-wrap')) {
          return;
        }

        const tbody = table.querySelector('tbody');
        const rows = tbody ? Array.from(tbody.querySelectorAll('tr:not(.db-empty-row)')) : [];
        const total = rows.length;
        if (total === 0 && !table.id) return;

        const customSizesAttr = table.getAttribute('data-page-sizes');
        const customSizeAttr = table.getAttribute('data-page-size');

        let pageSizes = [5, 10, 25, 50];
        let pageSize = 10;

        if (customSizesAttr) {
          pageSizes = customSizesAttr.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n) && n > 0);
          if (pageSizes.length > 0) pageSize = pageSizes[0];
        } else if (table.classList.contains('dash-table') && table.closest('.dash-lower-stack')) {
          pageSizes = [5, 10];
          pageSize = 5;
        }

        if (customSizeAttr) {
          const parsed = parseInt(customSizeAttr, 10);
          if (!isNaN(parsed) && parsed > 0) pageSize = parsed;
        } else if (!customSizesAttr && rows.length <= 5 && rows.length > 0) {
          pageSize = 5;
        }

        if (!pageSizes.includes(pageSize)) {
          pageSizes.push(pageSize);
        }
        pageSizes = Array.from(new Set(pageSizes)).sort((a, b) => a - b);

        let currentPage = 1;

        const pagWrap = document.createElement('div');
        pagWrap.className = 'hirezy-pagination-wrap';

        function renderPaginationUI() {
          const allRows = tbody ? Array.from(tbody.querySelectorAll('tr:not(.db-empty-row):not(.hirezy-empty-search-row)')) : [];
          const activeRows = allRows.filter(r => r.getAttribute('data-search-hidden') !== 'true');
          const currentTotal = activeRows.length;

          // Jika user belum pernah mengubah ukuran halaman manual dan data <= 5, selaraskan pageSize ke 5
          if (!table.__userChangedPageSize && !customSizeAttr && currentTotal > 0 && currentTotal <= 5 && pageSizes.includes(5)) {
            pageSize = 5;
          }

          const totalPages = Math.max(1, Math.ceil(currentTotal / pageSize));

          if (currentPage > totalPages) currentPage = totalPages;
          if (currentPage < 1) currentPage = 1;

          const start = currentTotal === 0 ? 0 : (currentPage - 1) * pageSize + 1;
          const end = Math.min(currentPage * pageSize, currentTotal);

          // Sembunyikan baris yang tidak lolos pencarian
          allRows.forEach(row => {
            if (row.getAttribute('data-search-hidden') === 'true') {
              row.style.display = 'none';
            }
          });

          // Atur visibilitas baris aktif sesuai halaman saat ini
          activeRows.forEach((row, idx) => {
            const shouldShow = (idx >= (currentPage - 1) * pageSize && idx < currentPage * pageSize);
            row.style.display = shouldShow ? '' : 'none';
          });

          // Tampilkan pesan kosong jika pencarian tidak menemukan data sama sekali
          let emptySearchRow = tbody.querySelector('.hirezy-empty-search-row');
          if (allRows.length > 0 && currentTotal === 0) {
            if (!emptySearchRow) {
              emptySearchRow = document.createElement('tr');
              emptySearchRow.className = 'hirezy-empty-search-row';
              const colCount = (table.querySelector('thead tr') ? table.querySelector('thead tr').children.length : 8) || 8;
              emptySearchRow.innerHTML = `<td colspan="${colCount}" style="text-align:center;padding:32px 16px;color:#94a3b8;font-weight:500;">Tidak ditemukan data yang sesuai dengan pencarian</td>`;
              tbody.appendChild(emptySearchRow);
            }
            emptySearchRow.style.display = '';
          } else if (emptySearchRow) {
            emptySearchRow.style.display = 'none';
          }

          // Tombol nomor halaman 1, 2, 3 dst HANYA muncul jika data lebih dari 1 lembar (totalPages > 1)
          let buttonsHtml = '';
          if (totalPages > 1) {
            buttonsHtml += `
              <button class="hirezy-page-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="prev" aria-label="Sebelumnya" title="Sebelumnya">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
            `;

            if (totalPages <= 7) {
              for (let p = 1; p <= totalPages; p++) {
                buttonsHtml += `<button class="hirezy-page-btn ${p === currentPage ? 'is-active' : ''}" data-page="${p}">${p}</button>`;
              }
            } else {
              // Standard 5-page sliding window with ellipsis
              let pages = [];
              if (currentPage <= 4) {
                pages = [1, 2, 3, 4, 5, '...', totalPages];
              } else if (currentPage >= totalPages - 3) {
                pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
              } else {
                pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
              }

              pages.forEach(p => {
                if (p === '...') {
                  buttonsHtml += `<span class="hirezy-page-dots">&hellip;</span>`;
                } else {
                  buttonsHtml += `<button class="hirezy-page-btn ${p === currentPage ? 'is-active' : ''}" data-page="${p}">${p}</button>`;
                }
              });
            }

            buttonsHtml += `
              <button class="hirezy-page-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="next" aria-label="Berikutnya" title="Berikutnya">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            `;
          }

          const unit = table.getAttribute('data-unit') || 'data';
          const optionsHtml = pageSizes.map(sz => `<option value="${sz}" ${pageSize === sz ? 'selected' : ''}>${sz}</option>`).join('');

          pagWrap.innerHTML = `
            <div class="hirezy-pagination-left">
              <div class="hirezy-pagination-info">
                Menampilkan <b>${start}</b> - <b>${end}</b> dari <b>${currentTotal}</b> data
              </div>
              <div class="hirezy-pagination-size">
                <span class="hirezy-size-label">Tampilkan:</span>
                <select class="hirezy-page-size-select" aria-label="Pilih jumlah data per halaman">
                  ${optionsHtml}
                </select>
                <span class="hirezy-size-unit">${unit}</span>
              </div>
            </div>
            ${totalPages > 1 ? `<div class="hirezy-pagination-btns">${buttonsHtml}</div>` : ''}
          `;

          const sizeSelect = pagWrap.querySelector('.hirezy-page-size-select');
          if (sizeSelect) {
            sizeSelect.addEventListener('change', function () {
              table.__userChangedPageSize = true;
              pageSize = parseInt(this.value, 10) || pageSizes[0] || 10;
              currentPage = 1;
              renderPaginationUI();
            });
          }
        }

        // Amati perubahan isi tbody agar saat data di-render secara dinamis, pagination UI ikut diperbarui
        if (tbody && !table.__paginationObserved) {
          table.__paginationObserved = true;
          const obs = new MutationObserver(function () {
            renderPaginationUI();
          });
          obs.observe(tbody, { childList: true });
        }

        // Integrasi instan dengan Search Bar tabel lokal jika ada
        const tableContainer = table.closest('section') || table.closest('.dashboard-content') || table.closest('main') || parent;
        const searchInput = tableContainer.querySelector('.campaign-search input, .table-search input, input[type="search"]:not(#menuSearch)');
        if (searchInput && !searchInput.__paginationBound) {
          searchInput.__paginationBound = true;
          searchInput.addEventListener('input', function () {
            const q = this.value.toLowerCase().trim();
            const allRows = tbody ? Array.from(tbody.querySelectorAll('tr:not(.db-empty-row):not(.hirezy-empty-search-row)')) : [];
            allRows.forEach(row => {
              const text = row.textContent.toLowerCase();
              if (!q || text.includes(q)) {
                row.removeAttribute('data-search-hidden');
              } else {
                row.setAttribute('data-search-hidden', 'true');
              }
            });
            currentPage = 1;
            renderPaginationUI();
          });
        }

        pagWrap.addEventListener('click', function (e) {
          const btn = e.target.closest('.hirezy-page-btn');
          if (!btn || btn.disabled) return;
          const action = btn.getAttribute('data-page');
          const allRows = tbody ? Array.from(tbody.querySelectorAll('tr:not(.db-empty-row):not(.hirezy-empty-search-row)')) : [];
          const activeRows = allRows.filter(r => r.getAttribute('data-search-hidden') !== 'true');
          const currentTotal = activeRows.length;
          const totalPages = Math.max(1, Math.ceil(currentTotal / pageSize));

          if (action === 'prev') {
            if (currentPage > 1) { currentPage--; renderPaginationUI(); }
          } else if (action === 'next') {
            if (currentPage < totalPages) { currentPage++; renderPaginationUI(); }
          } else {
            const p = parseInt(action, 10);
            if (p && p !== currentPage) {
              currentPage = p;
              renderPaginationUI();
            }
          }
        });

        table.addEventListener('tableDataUpdated', function () {
          renderPaginationUI();
        });

        renderPaginationUI();
        if (scrollWrap) {
          scrollWrap.after(pagWrap);
        } else {
          parent.appendChild(pagWrap);
        }
      });
    }, 150);
  }

  const CAMPAIGN_NOTIFICATION_KEY = 'bisa_notifikasi_campaign_v1';

  function getCampaignNotifications() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CAMPAIGN_NOTIFICATION_KEY) || '[]');
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter(function (item) { return item && item.targetRole === 'spv_kol'; })
        .sort(function (a, b) { return (Number(b.timestamp) || 0) - (Number(a.timestamp) || 0); });
    } catch (error) {
      return [];
    }
  }

  function saveCampaignNotifications(list) {
    const safeList = (Array.isArray(list) ? list : [])
      .sort(function (a, b) { return (Number(b.timestamp) || 0) - (Number(a.timestamp) || 0); })
      .slice(0, 100);
    localStorage.setItem(CAMPAIGN_NOTIFICATION_KEY, JSON.stringify(safeList));
  }

  function escapeNotificationText(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatNotificationDate(value) {
    const date = value ? new Date(value) : new Date();
    const safeDate = isNaN(date.getTime()) ? new Date() : date;
    try {
      const text = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(safeDate);
      return text.replace(/\./g, ':');
    } catch (error) {
      return safeDate.toLocaleString('id-ID');
    }
  }

  function renderSpvNotifications() {
    const dropdown = document.getElementById('notifMenuDropdown');
    if (!dropdown) return;
    const notifications = getCampaignNotifications();
    const unreadCount = notifications.filter(function (item) { return !item.dibaca; }).length;
    const dot = document.querySelector('#notifMenuButton .hirezy-notif-dot');
    if (dot) dot.style.display = unreadCount > 0 ? '' : 'none';

    const items = notifications.slice(0, 8).map(function (item) {
      const isUnread = !item.dibaca;
      const type = String(item.tipe || '');
      const iconBg = type === 'keluarkan_kreator' ? '#fee2e2' : (type === 'tambah_kreator' ? '#dcfce7' : '#e0f2fe');
      const iconColor = type === 'keluarkan_kreator' ? '#dc2626' : (type === 'tambah_kreator' ? '#16a34a' : '#0284c7');
      return `
        <div class="hirezy-dropdown-notif-item" data-notif-id="${escapeNotificationText(item.id)}" data-campaign-id="${escapeNotificationText(item.campaignId)}" style="display: flex; gap: 12px; padding: 10px 16px; cursor: pointer; transition: background 0.15s ease; background: ${isUnread ? '#f0f9ff' : 'transparent'};" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='${isUnread ? '#f0f9ff' : 'transparent'}'">
          <div style="width: 32px; height: 32px; border-radius: 8px; background: ${iconBg}; color: ${iconColor}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
              <div style="font-size: 12.5px; font-weight: ${isUnread ? '700' : '600'}; color: #1e293b;">${escapeNotificationText(item.judul || 'Pemberitahuan')}</div>
              ${isUnread ? '<span style="width: 7px; height: 7px; border-radius: 50%; background: #0284c7; flex-shrink: 0;"></span>' : ''}
            </div>
            <p style="font-size: 11.5px; color: #64748b; margin: 0; line-height: 1.35;">${escapeNotificationText(item.pesan || '')}</p>
            <span style="font-size: 10px; color: #94a3b8; display: inline-block; margin-top: 4px;">${escapeNotificationText(formatNotificationDate(item.timestamp))}</span>
          </div>
        </div>
      `;
    }).join('');

    dropdown.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid #f1f5f9; background: #ffffff;">
        <div style="font-size: 14px; font-weight: 700; color: #0f172a; font-family: 'Outfit', sans-serif;">Pemberitahuan</div>
        <span style="font-size: 11px; font-weight: 600; color: ${unreadCount > 0 ? '#0284c7' : '#16a34a'}; background: ${unreadCount > 0 ? '#e0f2fe' : '#dcfce7'}; padding: 2px 8px; border-radius: 12px;">${unreadCount > 0 ? unreadCount + ' Baru' : 'Aktif'}</span>
      </div>
      <div style="max-height: 320px; overflow-y: auto; padding: 6px 0;">
        ${items || '<div style="padding: 26px 18px; text-align: center; color: #94a3b8; font-size: 12.5px; font-family: \'Outfit\', sans-serif;">Belum ada pemberitahuan campaign.</div>'}
      </div>
      <div style="padding: 10px 16px; border-top: 1px solid #f1f5f9; background: #fafafa; text-align: center;">
        <button type="button" data-notif-action="read-all" style="border: none; background: transparent; font-size: 12px; font-weight: 600; color: ${unreadCount > 0 ? '#0284c7' : '#94a3b8'}; cursor: ${unreadCount > 0 ? 'pointer' : 'default'}; font-family: \'Outfit\', sans-serif;">Tandai Semua Telah Dibaca</button>
      </div>
    `;
  }

  document.addEventListener('click', function (event) {
    const notifItem = event.target.closest('#notifMenuDropdown [data-notif-id]');
    if (notifItem) {
      event.preventDefault();
      const notifId = notifItem.getAttribute('data-notif-id');
      const campaignId = notifItem.getAttribute('data-campaign-id');
      const list = getCampaignNotifications();
      const target = list.find(function (item) { return String(item.id) === String(notifId); });
      if (target && !target.dibaca) {
        target.dibaca = true;
        saveCampaignNotifications(list);
      }
      const dropdown = document.getElementById('notifMenuDropdown');
      if (dropdown) dropdown.classList.remove('is-open', 'show');
      document.getElementById('notifMenuButton')?.setAttribute('aria-expanded', 'false');
      if (campaignId) {
        window.location.href = rootPrefix + 'SpvKol/operasional/spvkol_campaign.html?campaign=' + encodeURIComponent(campaignId);
      } else {
        renderSpvNotifications();
      }
      return;
    }

    const readAllButton = event.target.closest('#notifMenuDropdown [data-notif-action="read-all"]');
    if (readAllButton) {
      event.preventDefault();
      const list = getCampaignNotifications();
      let changed = false;
      list.forEach(function (item) {
        if (!item.dibaca) {
          item.dibaca = true;
          changed = true;
        }
      });
      if (changed) saveCampaignNotifications(list);
      renderSpvNotifications();
    }
  });

  window.addEventListener('storage', function (event) {
    if (event.key === CAMPAIGN_NOTIFICATION_KEY) renderSpvNotifications();
  });

  // Helper: Render SPV KOL Unified Topbar
  function renderSpvKolNavbar() {
    let topbarEl = document.querySelector('header.topbar');
    if (!topbarEl) {
      const shell = document.querySelector('.dashboard-shell');
      if (shell) {
        topbarEl = document.createElement('header');
        topbarEl.className = 'topbar hirezy-topbar';
        shell.prepend(topbarEl);
      }
    }
    if (!topbarEl) return;

    topbarEl.classList.add('hirezy-topbar');

    const spvTitles = {
      'spvkol_dashboard.html': 'Beranda SPVKOL',
      'spvkol_kalender.html': 'Kalender',
      'spvkol_kehadiran.html': 'Kehadiran',
      'spvkol_presensi_istirahat.html': 'Presensi Istirahat',
      'spvkol_presensi_lembur.html': 'Presensi Lembur',
      'spvkol_kreator.html': 'Data Kreator',
      'spvkol_tracking_kreator.html': 'Tracking Kreator',
      'spvkol_folder.html': 'My Folders',
      'spvkol_evaluasi_kinerja.html': 'Evaluasi Kinerja',
      'spvkol_target_capaian.html': 'Target & Capaian',
      'spvkol_campaign.html': 'Campaign',
      'spvkol_dashboard_campaign.html': 'Dashboard Campaign',
      'staffkol_dashboard_campaign.html': 'Dashboard Campaign',
      'staffkol_laporan_campaign.html': 'Laporan Campaign',
      'spvkol_tracking_sampel.html': 'Tracking Sampel',
      'spvkol_Performa_Kreator.html': 'Performa Kreator',
      'spvkol_rrk.html': 'RRK',
      'spvkol_Milestone.html': 'Milestone',
      'spvkol_tugas.html': 'Tugas',
      'spvkol_project.html': 'Project',
      'spvkol_laporan.html': 'Laporan',
      'spvkol_pengaduan.html': 'Pengaduan',
      'spvkol_Brand.html': 'Data Brands',
      'spvkol_dashboard_brand.html': 'Dashboard Brands',
      'spvkol_data_brand.html': 'Data Brands',
      'spvkol_produk_brand.html': 'Produk & Brands',
      'spvkol_laporan_brand.html': 'Laporan Brand',
      'spvkol_Ads_Account.html': 'Ads Account',
      'spvkol_Kategori_Produk.html': 'Kategori Produk',
      'spvkol_Leads_Kreator.html': 'Leads Kreator',
      'spvkol_Leveling_Kreator.html': 'Leveling Kreator',
      'spvkol_rencana_karier.html': 'Rencana Karier',
      'spvkol_upgrade_skill.html': 'Upgrade Skill'
    };

    const pageTitle = spvTitles[currentFile] || (document.title ? document.title.split('|')[0].trim() : 'Dashboard');

    topbarEl.innerHTML = `
      <div class="topbar__left hirezy-topbar-left">
        <button id="sidebarToggle" class="icon-button icon-button--menu" type="button"
          aria-label="Buka atau tutup sidebar">
          <span></span><span></span><span></span>
        </button>
        <h2 class="hirezy-page-title">${pageTitle}</h2>
      </div>

      <div class="topbar__actions hirezy-topbar-right">
        <!-- Search Input or Calendar -->
        ${(currentFile === 'spvkol_dashboard_campaign.html' || currentFile === 'staffkol_dashboard_campaign.html' || currentFile === 'spvkol_dashboard_brand.html' || currentFile === 'staffkol_dashboard_brand.html') ? `
        <button id="btnCalendarTop" type="button" aria-label="Pilih tanggal" title="Pilih Tanggal" style="display: flex; align-items: center; gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 16px; border-radius: 8px; color: #64748b; font-size: 13px; font-weight: 500; cursor: pointer; height: 38px; outline: none; transition: all 0.2s;" onmouseover="this.style.borderColor='#cbd5e1'; this.style.background='#f1f5f9';" onmouseout="this.style.borderColor='#e2e8f0'; this.style.background='#f8fafc';" onclick="(document.getElementById('calendarBrandModal') || document.getElementById('calendarCampaignModal'))?.classList.add('is-active')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span id="txtCalendarTop">Oktober</span>
        </button>
        ` : `
        <div class="hirezy-search-box">
          <svg class="hirezy-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; stroke: #94a3b8; flex-shrink: 0;">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input id="menuSearch" class="hirezy-search-input" type="search" placeholder="Cari menu atau fitur..." />
        </div>
        `}

        <!-- Chat / Message Icon & Dropdown -->
        <div class="topbar-chat-dropdown-wrap" style="position: relative;">
          <button id="chatMenuButton" class="hirezy-icon-btn" type="button" aria-label="Pesan / Chat" title="Pesan" aria-expanded="false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px; stroke: #64748b;">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          </button>
          <div id="chatMenuDropdown" class="user-menu-dropdown" style="width: 320px; padding: 0; border-radius: 12px; overflow: hidden;">
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid #f1f5f9; background: #ffffff;">
              <div style="font-size: 14px; font-weight: 700; color: #0f172a; font-family: 'Outfit', sans-serif;">Pesan & Diskusi</div>
              <span style="font-size: 11px; font-weight: 600; color: #0284c7; background: #e0f2fe; padding: 2px 8px; border-radius: 12px;">3 Baru</span>
            </div>
            <div style="max-height: 280px; overflow-y: auto; padding: 6px 0;">
              <div class="hirezy-dropdown-msg-item" style="display: flex; gap: 10px; padding: 10px 16px; cursor: pointer; transition: background 0.15s ease;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <img src="${rootPrefix}media/avatar.png" style="width: 34px; height: 34px; border-radius: 50%; object-fit: cover; flex-shrink: 0;" />
                <div style="flex: 1; min-width: 0;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                    <span style="font-size: 12.5px; font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Aura Cantika</span>
                    <span style="font-size: 10px; color: #94a3b8;">10m lalu</span>
                  </div>
                  <p style="font-size: 11.5px; color: #64748b; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3;">Halo kak, konten draft video campaign sudah siap di-review yaa...</p>
                </div>
              </div>
              <div class="hirezy-dropdown-msg-item" style="display: flex; gap: 10px; padding: 10px 16px; cursor: pointer; transition: background 0.15s ease;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <div style="width: 34px; height: 34px; border-radius: 50%; background: #dcfce7; color: #16a34a; font-weight: 700; font-size: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">DP</div>
                <div style="flex: 1; min-width: 0;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                    <span style="font-size: 12.5px; font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Dinda Pratama</span>
                    <span style="font-size: 10px; color: #94a3b8;">35m lalu</span>
                  </div>
                  <p style="font-size: 11.5px; color: #64748b; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3;">Brand Bisa Hijab request penambahan slot live malam ini.</p>
                </div>
              </div>
              <div class="hirezy-dropdown-msg-item" style="display: flex; gap: 10px; padding: 10px 16px; cursor: pointer; transition: background 0.15s ease;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <div style="width: 34px; height: 34px; border-radius: 50%; background: #fef3c7; color: #d97706; font-weight: 700; font-size: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">FS</div>
                <div style="flex: 1; min-width: 0;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                    <span style="font-size: 12.5px; font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Fauzan Syahrul</span>
                    <span style="font-size: 10px; color: #94a3b8;">2j lalu</span>
                  </div>
                  <p style="font-size: 11.5px; color: #64748b; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3;">Data rekap tracking sampel sudah selesai diinput kak.</p>
                </div>
              </div>
            </div>
            <div style="padding: 10px 16px; border-top: 1px solid #f1f5f9; background: #fafafa; text-align: center;">
              <span style="font-size: 12px; font-weight: 600; color: #0284c7; cursor: pointer;">Buka Semua Pesan</span>
            </div>
          </div>
        </div>

        <!-- Notification Bell Icon & Dropdown -->
        <div class="topbar-notif-dropdown-wrap" style="position: relative;">
          <button id="notifMenuButton" class="hirezy-icon-btn" type="button" aria-label="Notifikasi" title="Notifikasi" aria-expanded="false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px; stroke: #64748b;">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span class="hirezy-notif-dot"></span>
          </button>
          <div id="notifMenuDropdown" class="user-menu-dropdown" style="width: 330px; padding: 0; border-radius: 12px; overflow: hidden;">
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid #f1f5f9; background: #ffffff;">
              <div style="font-size: 14px; font-weight: 700; color: #0f172a; font-family: 'Outfit', sans-serif;">Pemberitahuan</div>
              <span style="font-size: 11px; font-weight: 600; color: #16a34a; background: #dcfce7; padding: 2px 8px; border-radius: 12px;">Aktif</span>
            </div>
            <div style="max-height: 280px; overflow-y: auto; padding: 6px 0;">
              <div class="hirezy-dropdown-notif-item" style="display: flex; gap: 12px; padding: 10px 16px; cursor: pointer; transition: background 0.15s ease;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <div style="width: 32px; height: 32px; border-radius: 8px; background: #dcfce7; color: #16a34a; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-size: 12.5px; font-weight: 600; color: #1e293b; margin-bottom: 2px;">Presensi Masuk Berhasil</div>
                  <p style="font-size: 11.5px; color: #64748b; margin: 0; line-height: 1.3;">Absensi kehadiran hari ini tercatat pukul 08:45 WIB (Tepat Waktu).</p>
                  <span style="font-size: 10px; color: #94a3b8; display: inline-block; margin-top: 3px;">Hari ini &bull; 08:45</span>
                </div>
              </div>
              <div class="hirezy-dropdown-notif-item" style="display: flex; gap: 12px; padding: 10px 16px; cursor: pointer; transition: background 0.15s ease;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <div style="width: 32px; height: 32px; border-radius: 8px; background: #e0f2fe; color: #0284c7; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </div>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-size: 12.5px; font-weight: 600; color: #1e293b; margin-bottom: 2px;">Campaign Baru Aktif</div>
                  <p style="font-size: 11.5px; color: #64748b; margin: 0; line-height: 1.3;">Campaign 'PayDay Bisa Hijab' telah masuk ke tahap Running.</p>
                  <span style="font-size: 10px; color: #94a3b8; display: inline-block; margin-top: 3px;">Kemarin &bull; 14:20</span>
                </div>
              </div>
              <div class="hirezy-dropdown-notif-item" style="display: flex; gap: 12px; padding: 10px 16px; cursor: pointer; transition: background 0.15s ease;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <div style="width: 32px; height: 32px; border-radius: 8px; background: #fef3c7; color: #d97706; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
                </div>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-size: 12.5px; font-weight: 600; color: #1e293b; margin-bottom: 2px;">Pengajuan Lembur Disetujui</div>
                  <p style="font-size: 11.5px; color: #64748b; margin: 0; line-height: 1.3;">Pengajuan lembur tanggal 21 Mei telah disetujui (2 Jam).</p>
                  <span style="font-size: 10px; color: #94a3b8; display: inline-block; margin-top: 3px;">2 hari lalu</span>
                </div>
              </div>
            </div>
            <div style="padding: 10px 16px; border-top: 1px solid #f1f5f9; background: #fafafa; text-align: center;">
              <span style="font-size: 12px; font-weight: 600; color: #0284c7; cursor: pointer;">Tandai Semua Telah Dibaca</span>
            </div>
          </div>
        </div>

        <!-- User Profile Pill & Dropdown -->
        <div class="topbar-user-dropdown-wrap" style="position: relative;">
          <button id="userMenuButton" class="hirezy-user-pill" type="button" aria-label="Menu Pengguna" aria-expanded="false" onclick="window.__toggleHirezyUserDropdown(event)">
            <div class="hirezy-avatar-box">
              <img src="${currentAvatar}" alt="${currentUserName}" class="hirezy-avatar-img" data-ceo-avatar=""
                onerror="this.src='${rootPrefix}media/avatar.png'" />
            </div>
            <div class="hirezy-user-text">
              <span class="hirezy-user-name">${currentUserName}</span>
              <span class="hirezy-user-role">${currentRoleLabel}</span>
            </div>
            <svg class="hirezy-chevron-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; stroke: #64748b; flex-shrink: 0;">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          <div id="userMenuDropdown" class="user-menu-dropdown">
            <div class="user-menu-dropdown__header">
              <img src="${currentAvatar}" alt="${currentUserName}" class="user-menu-dropdown__avatar" data-ceo-avatar="" />
              <div class="user-menu-dropdown__info">
                <span class="user-menu-dropdown__name">${currentUserName}</span>
                <span class="user-menu-dropdown__role">${currentRoleLabel}</span>
              </div>
            </div>
            <div class="user-menu-dropdown__divider"></div>
            <a href="${rootPrefix}BM/BM_dashboard.html" class="user-menu-dropdown__item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px; stroke: #64748b; margin-right: 8px;">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <div class="user-menu-dropdown__item-text">
                <span class="user-menu-dropdown__title">Kembali</span>
                <span class="user-menu-dropdown__desc">Buka dashboard utama</span>
              </div>
            </a>
            <a href="${rootPrefix}login.html" class="user-menu-dropdown__item user-menu-dropdown__item--danger">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px; stroke: #ef4444; margin-right: 8px;">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <div class="user-menu-dropdown__item-text">
                <span class="user-menu-dropdown__title">Logout</span>
                <span class="user-menu-dropdown__desc">Keluar dari aplikasi</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    `;

    renderSpvNotifications();
  }

  // Helper: Render Staff KOL Unified Topbar
  function renderStaffKolNavbar() {
    const staffTitles = {
      'staffkol_dashboard.html': 'Dashboard',
      'staffkol_kalender.html': 'Kalender',
      'staffkol_kehadiran.html': 'Absensi',
      'staffkol_presensi_istirahat.html': 'Presensi Istirahat',
      'staffkol_presensi_lembur.html': 'Presensi Lembur',
      'staffkol_folder.html': 'My Folders',
      'staffkol_evaluasi_kinerja.html': 'Evaluasi Kinerja',
      'staffkol_target_capaian.html': 'Target & Capaian Kerja',
      'staffkol_upgrade_skill.html': 'Upgrade Skill',
      'staffkol_campaign.html': 'Campaign',
      'staffkol_dashboard_campaign.html': 'Dashboard Campaign',
      'staffkol_laporan_campaign.html': 'Laporan Campaign',
      'staffkol_kreator.html': 'Data Kreator',
      'staffkol_tracking_kreator.html': 'Tracking Kreator',
      'staffkol_operasional.html': 'Operasional',
      'staffkol_Performa_Kreator.html': 'Performa Kreator',
      'staffkol_tracking_sampel.html': 'Tracking Sampel',
      'staffkol_dashboard_brand.html': 'Dashboard Brands',
      'staffkol_produk_brand.html': 'Produk & Brands',
      'staffkol_data_brand.html': 'Data Brands',
      'staffkol_laporan_brand.html': 'Laporan Brand',
      'staffkol_laporan.html': 'Laporan',
      'staffkol_Milestone.html': 'Milestone',
      'staffkol_pengaduan.html': 'Pengaduan',
      'staffkol_project.html': 'Project',
      'staffkol_rrk.html': 'RRK',
      'staffkol_tugas.html': 'Tugas'
    };

    const staffPageTitle = staffTitles[currentFile] || (document.title ? document.title.split('|')[0].trim() : 'Dashboard');

    let topbarEl = document.querySelector('header.topbar');
    if (!topbarEl) return;

    topbarEl.className = 'topbar hirezy-topbar';
    topbarEl.innerHTML = `
      <div class="topbar__left hirezy-topbar-left">
        <button id="sidebarToggle" class="icon-button icon-button--menu" type="button"
          aria-label="Buka atau tutup sidebar">
          <span></span><span></span><span></span>
        </button>
        <h2 class="hirezy-page-title">${staffPageTitle}</h2>
      </div>

      <div class="topbar__actions hirezy-topbar-right">
        <!-- Search Input or Calendar Button -->
        ${(currentFile === 'staffkol_dashboard_brand.html' || currentFile === 'staffkol_dashboard_campaign.html') ? `
        <button id="btnCalendarTop" type="button" aria-label="Pilih tanggal" title="Pilih Tanggal" style="display: flex; align-items: center; gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 16px; border-radius: 8px; color: #64748b; font-size: 13px; font-weight: 500; cursor: pointer; height: 38px; outline: none; transition: all 0.2s;" onmouseover="this.style.borderColor='#cbd5e1'; this.style.background='#f1f5f9';" onmouseout="this.style.borderColor='#e2e8f0'; this.style.background='#f8fafc';" onclick="(document.getElementById('calendarBrandModal') || document.getElementById('calendarCampaignModal'))?.classList.add('is-active')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span id="txtCalendarTop">Oktober</span>
        </button>
        ` : `
        <!-- Search Input -->
        <div class="hirezy-search-box">
          <svg class="hirezy-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input id="menuSearch" class="hirezy-search-input" type="search" placeholder="Search candidate, vacancy, etc" />
        </div>
        `}

        <!-- Chat / Message Icon -->
        <button class="hirezy-icon-btn" type="button" aria-label="Pesan / Chat" title="Pesan">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
        </button>

        <!-- Notification Bell Icon with Red Dot Badge -->
        <button class="hirezy-icon-btn" type="button" aria-label="Notifikasi" title="Notifikasi">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span class="hirezy-notif-dot"></span>
        </button>

        <!-- User Profile Pill & Dropdown -->
        <div class="topbar-user-dropdown-wrap">
          <button id="userMenuButton" class="hirezy-user-pill" type="button" aria-label="Menu Pengguna" aria-expanded="false" title="Menu Pengguna" onclick="window.__toggleHirezyUserDropdown(event)">
            <div class="hirezy-avatar-box">
              <img src="${currentAvatar}" alt="${currentUserName}" class="hirezy-avatar-img" data-ceo-avatar="" onerror="this.src='${rootPrefix}media/avatar.png'" />
            </div>
            <div class="hirezy-user-text">
              <span class="hirezy-user-name">${currentUserName}</span>
              <span class="hirezy-user-role">${currentRoleLabel}</span>
            </div>
            <svg class="hirezy-chevron-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          <div id="userMenuDropdown" class="user-menu-dropdown">
            <div class="user-menu-dropdown__header">
              <img src="${currentAvatar}" alt="${currentUserName}" class="user-menu-dropdown__avatar" data-ceo-avatar="" />
              <div class="user-menu-dropdown__info">
                <span class="user-menu-dropdown__name">${currentUserName}</span>
                <span class="user-menu-dropdown__role">${currentRoleLabel}</span>
              </div>
            </div>
            <div class="user-menu-dropdown__divider"></div>
            <a href="${rootPrefix}BM/BM_dashboard.html" class="user-menu-dropdown__item">
              <svg class="user-menu-dropdown__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <div class="user-menu-dropdown__item-text">
                <span class="user-menu-dropdown__title">Kembali</span>
                <span class="user-menu-dropdown__desc">Buka dashboard utama</span>
              </div>
            </a>
            <a href="${rootPrefix}login.html" class="user-menu-dropdown__item user-menu-dropdown__item--danger">
              <svg class="user-menu-dropdown__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <div class="user-menu-dropdown__item-text">
                <span class="user-menu-dropdown__title">Logout</span>
                <span class="user-menu-dropdown__desc">Keluar dari aplikasi</span>
              </div>
            </a>
          </div>
        </div>
      </div>`;
  }

  function renderAccountingNavbar() {
    const accountingTitles = {
      'accounting_dashboard.html': 'Dashboard',
      'accounting_kalender.html': 'Kalender',
      'accounting_kehadiran.html': 'Kehadiran',
      'accounting_presensi_istirahat.html': 'Absensi Istirahat',
      'accounting_presensi_lembur.html': 'Absensi Lembur',
      'accounting_operasional_dashboard.html': 'Dashboard',
      'accounting_kas_bank.html': 'Kas & Bank',
      'accounting_pendapatan.html': 'Pendapatan',
      'accounting_pengeluaran_beban.html': 'Pengeluaran & Beban',
      'accounting_pengurangan_beban.html': 'Pengeluaran & Beban',
      'accounting_approval_pengeluaran.html': 'Approval Pengeluaran',
      'accounting_profit_project_brand.html': 'Profit Project & Brand',
      'accounting_arus_kas.html': 'Arus Kas',
      'accounting_piutang.html': 'Piutang',
      'accounting_utang.html': 'Utang',
      'accounting_payroll.html': 'Payroll',
      'accounting_pajak.html': 'Pajak',
      'accounting_daftar_aset.html': 'Daftar Aset',
      'accounting_penyusutan_aset.html': 'Penyusutan Aset',
      'accounting_mutasi_aset.html': 'Mutasi Aset',
      'accounting_alokasi_aset_project.html': 'Alokasi Aset Project',
      'accounting_laba_rugi.html': 'Laba Rugi',
      'accounting_neraca.html': 'Neraca',
      'accounting_rekap_divisi.html': 'Rekap Divisi',
      'accounting_utang_karyawan.html': 'Utang Karyawan',
      'accounting_piutang_karyawan.html': 'Piutang Karyawan',
      'accounting_budget_vs_actual.html': 'Budget vs Actual',
      'accounting_history_dokumen.html': 'History Dokumen',
      'accounting_folder.html': 'My Folders',
      'accounting_rrk.html': 'RRK',
      'accounting_Milestone.html': 'Milestone',
      'accounting_tugas.html': 'Tugas',
      'accounting_project.html': 'Projects',
      'accounting_laporan.html': 'Laporan',
      'accounting_pengaduan.html': 'Pengaduan',
      'accounting_master_coa.html': 'Master COA',
      'accounting_penanggung_jawab.html': 'Penanggung Jawab',
      'accounting_divisi.html': 'Divisi',
      'accounting_jenis_transaksi.html': 'Jenis Transaksi',
      'accounting_customer_project.html': 'Customer | Project',
      'accounting_data_karyawan.html': 'Data Karyawan',
      'accounting_pengajuan_barang_jasa.html': 'Pengajuan Barang & Jasa',
      'accounting_tagihan_berkala.html': 'Tagihan Berkala'
    };

    const accountingPageTitle = accountingTitles[currentFile] || (document.title ? document.title.split('|')[0].trim() : 'Dashboard');

    let topbarEl = document.querySelector('header.topbar');
    if (!topbarEl) return;

    topbarEl.className = 'topbar hirezy-topbar';
    topbarEl.innerHTML = `
      <div class="topbar__left hirezy-topbar-left">
        <button id="sidebarToggle" class="icon-button icon-button--menu" type="button"
          aria-label="Buka atau tutup sidebar">
          <span></span><span></span><span></span>
        </button>
        <h2 class="hirezy-page-title notranslate" translate="no">${accountingPageTitle}</h2>
      </div>

      <div class="topbar__actions hirezy-topbar-right">
        <div class="hirezy-search-box">
          <svg class="hirezy-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input id="menuSearch" class="hirezy-search-input" type="search" placeholder="Cari menu atau fitur..." />
        </div>

        <button class="hirezy-icon-btn" type="button" aria-label="Pesan / Chat" title="Pesan">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
        </button>

        <button class="hirezy-icon-btn" type="button" aria-label="Notifikasi" title="Notifikasi">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span class="hirezy-notif-dot"></span>
        </button>

        <div class="topbar-user-dropdown-wrap">
          <button id="userMenuButton" class="hirezy-user-pill" type="button" aria-label="Menu Pengguna" aria-expanded="false" title="Menu Pengguna" onclick="window.__toggleHirezyUserDropdown(event)">
            <div class="hirezy-avatar-box">
              <img src="${currentAvatar}" alt="${currentUserName}" class="hirezy-avatar-img" data-ceo-avatar="" onerror="this.src='${rootPrefix}media/avatar.png'" />
            </div>
            <div class="hirezy-user-text">
              <span class="hirezy-user-name">${currentUserName}</span>
              <span class="hirezy-user-role">${currentRoleLabel}</span>
            </div>
            <svg class="hirezy-chevron-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          <div id="userMenuDropdown" class="user-menu-dropdown">
            <div class="user-menu-dropdown__header">
              <img src="${currentAvatar}" alt="${currentUserName}" class="user-menu-dropdown__avatar" data-ceo-avatar="" />
              <div class="user-menu-dropdown__info">
                <span class="user-menu-dropdown__name">${currentUserName}</span>
                <span class="user-menu-dropdown__role">${currentRoleLabel}</span>
              </div>
            </div>
            <div class="user-menu-dropdown__divider"></div>
            <a href="${rootPrefix}BM/BM_dashboard.html" class="user-menu-dropdown__item">
              <svg class="user-menu-dropdown__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <div class="user-menu-dropdown__item-text">
                <span class="user-menu-dropdown__title">Kembali</span>
                <span class="user-menu-dropdown__desc">Buka dashboard utama</span>
              </div>
            </a>
            <a href="${rootPrefix}login.html" class="user-menu-dropdown__item user-menu-dropdown__item--danger">
              <svg class="user-menu-dropdown__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <div class="user-menu-dropdown__item-text">
                <span class="user-menu-dropdown__title">Logout</span>
                <span class="user-menu-dropdown__desc">Keluar dari aplikasi</span>
              </div>
            </a>
          </div>
        </div>
      </div>`;
  }

  // 6. Navigation Link Handler (Tutup drawer mobile saat link diklik)
  document.addEventListener('click', function (e) {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;

    const link = e.target.closest('.app-nav-item, .app-sub-item');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

    // Tutup drawer jika di mobile
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar && sidebar.classList.contains('is-open')) {
      sidebar.classList.remove('is-open');
      document.body.classList.remove('sidebar-open');
      if (backdrop) backdrop.classList.remove('is-visible');
    }
  });

  // 7. Sidebar Toggle Handler — Desktop: Fullscreen Collapse | Mobile: Drawer
  document.addEventListener('click', function (e) {
    const toggleBtn = e.target.closest('#sidebarToggle, .layout-menu-toggle, [data-action="toggle-sidebar"]');
    if (toggleBtn) {
      e.preventDefault();

      if (window.innerWidth >= 1024) {
        // ── Desktop: Toggle fullscreen collapse ────────────────────
        const isCollapsed = document.body.classList.toggle('sidebar-collapsed');
        localStorage.setItem('bm-sidebar-collapsed', isCollapsed ? 'true' : 'false');

        // Update shell margin/width with smooth transition
        const shell = document.querySelector('.dashboard-shell') ||
          document.querySelector('.layout-page') ||
          document.querySelector('.layout-container');
        if (shell) {
          shell.style.setProperty('margin-left', isCollapsed ? '0' : '240px', 'important');
          shell.style.setProperty('width', isCollapsed ? '100%' : 'calc(100% - 240px)', 'important');
        }

        // Update topbar width too
        document.querySelectorAll('.dashboard-shell .topbar').forEach(el => {
          el.style.setProperty('margin-left', '24px', 'important');
          el.style.setProperty('width', 'calc(100% - 48px)', 'important');
        });

      } else {
        // ── Mobile: Drawer toggle ──────────────────────────────────
        const sidebar = document.getElementById('app-sidebar');
        const backdrop = document.getElementById('sidebar-backdrop');
        if (sidebar) {
          const isOpen = sidebar.classList.toggle('is-open');
          document.body.classList.toggle('sidebar-open', isOpen);
          if (backdrop) {
            if (isOpen) backdrop.classList.add('is-visible');
            else backdrop.classList.remove('is-visible');
          }
        }
      }
      return;
    }

    // Klik pada backdrop menutup drawer (mobile)
    const backdropEl = e.target.closest('#sidebar-backdrop');
    if (backdropEl) {
      const sidebar = document.getElementById('app-sidebar');
      if (sidebar) sidebar.classList.remove('is-open');
      document.body.classList.remove('sidebar-open');
      backdropEl.classList.remove('is-visible');
    }
  });

  // Tutup drawer saat tombol Escape ditekan
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      const sidebar = document.getElementById('app-sidebar');
      const backdrop = document.getElementById('sidebar-backdrop');
      if (sidebar && sidebar.classList.contains('is-open')) {
        sidebar.classList.remove('is-open');
        document.body.classList.remove('sidebar-open');
        if (backdrop) backdrop.classList.remove('is-visible');
      }
    }
  });

  // 8. Topbar Dropdowns Toggle (Chat, Notification, & User Profile)
  window.__toggleHirezyUserDropdown = function (event, forceOpen) {
    if (event) {
      if (typeof event.preventDefault === 'function') event.preventDefault();
      if (typeof event.stopPropagation === 'function') event.stopPropagation();
    }
    const userBtn = document.getElementById('userMenuButton') || document.querySelector('.hirezy-user-pill');
    const wrap = userBtn ? userBtn.closest('.topbar-user-dropdown-wrap') : document.querySelector('.topbar-user-dropdown-wrap');
    const userDrop = document.getElementById('userMenuDropdown') || (wrap ? wrap.querySelector('.user-menu-dropdown') : null);
    if (!userDrop) return;

    const isOpen = userDrop.classList.contains('is-open') || (wrap && wrap.classList.contains('is-open'));
    const shouldOpen = (forceOpen !== undefined) ? forceOpen : !isOpen;

    // Close any other open dropdowns first
    const chatDrop = document.getElementById('chatMenuDropdown');
    if (chatDrop) {
      chatDrop.classList.remove('is-open', 'show');
      chatDrop.closest('.topbar-user-dropdown-wrap, .topbar-dropdown-wrap')?.classList.remove('is-open');
      document.getElementById('chatMenuButton')?.setAttribute('aria-expanded', 'false');
    }
    const notifDrop = document.getElementById('notifMenuDropdown');
    if (notifDrop) {
      notifDrop.classList.remove('is-open', 'show');
      notifDrop.closest('.topbar-user-dropdown-wrap, .topbar-dropdown-wrap')?.classList.remove('is-open');
      document.getElementById('notifMenuButton')?.setAttribute('aria-expanded', 'false');
    }

    if (shouldOpen) {
      userDrop.classList.add('is-open', 'show');
      if (wrap) wrap.classList.add('is-open');
      if (userBtn) userBtn.setAttribute('aria-expanded', 'true');
    } else {
      userDrop.classList.remove('is-open', 'show');
      if (wrap) wrap.classList.remove('is-open');
      if (userBtn) userBtn.setAttribute('aria-expanded', 'false');
    }
  };

  document.addEventListener('click', function (e) {
    const chatBtn = e.target.closest('#chatMenuButton');
    const notifBtn = e.target.closest('#notifMenuButton');
    const userBtn = e.target.closest('#userMenuButton, .hirezy-user-pill');

    const chatDrop = document.getElementById('chatMenuDropdown');
    const notifDrop = document.getElementById('notifMenuDropdown');

    if (chatBtn && chatDrop) {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = chatDrop.classList.toggle('is-open');
      chatDrop.classList.toggle('show', isOpen);
      chatBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      chatBtn.closest('.topbar-user-dropdown-wrap, .topbar-dropdown-wrap')?.classList.toggle('is-open', isOpen);
      if (notifDrop) {
        notifDrop.classList.remove('is-open', 'show');
        notifDrop.closest('.topbar-user-dropdown-wrap, .topbar-dropdown-wrap')?.classList.remove('is-open');
        document.getElementById('notifMenuButton')?.setAttribute('aria-expanded', 'false');
      }
      window.__toggleHirezyUserDropdown(null, false);
      return;
    }

    if (notifBtn && notifDrop) {
      e.preventDefault();
      e.stopPropagation();
      renderSpvNotifications();
      const isOpen = notifDrop.classList.toggle('is-open');
      notifDrop.classList.toggle('show', isOpen);
      notifBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      notifBtn.closest('.topbar-user-dropdown-wrap, .topbar-dropdown-wrap')?.classList.toggle('is-open', isOpen);
      if (chatDrop) {
        chatDrop.classList.remove('is-open', 'show');
        chatDrop.closest('.topbar-user-dropdown-wrap, .topbar-dropdown-wrap')?.classList.remove('is-open');
        document.getElementById('chatMenuButton')?.setAttribute('aria-expanded', 'false');
      }
      window.__toggleHirezyUserDropdown(null, false);
      return;
    }

    if (userBtn) {
      window.__toggleHirezyUserDropdown(e);
      return;
    }

    // Close all dropdowns if clicking outside
    if (!e.target.closest('#chatMenuDropdown') && !e.target.closest('#chatMenuButton') && chatDrop) {
      chatDrop.classList.remove('is-open', 'show');
      chatDrop.closest('.topbar-user-dropdown-wrap, .topbar-dropdown-wrap')?.classList.remove('is-open');
      document.getElementById('chatMenuButton')?.setAttribute('aria-expanded', 'false');
    }
    if (!e.target.closest('#notifMenuDropdown') && !e.target.closest('#notifMenuButton') && notifDrop) {
      notifDrop.classList.remove('is-open', 'show');
      notifDrop.closest('.topbar-user-dropdown-wrap, .topbar-dropdown-wrap')?.classList.remove('is-open');
      document.getElementById('notifMenuButton')?.setAttribute('aria-expanded', 'false');
    }
    if (!e.target.closest('#userMenuDropdown') && !e.target.closest('#userMenuButton') && !e.target.closest('.hirezy-user-pill')) {
      window.__toggleHirezyUserDropdown(null, false);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      window.__toggleHirezyUserDropdown(null, false);
    }
  });

  // 9. Instant Topbar Menu Search
  document.addEventListener('input', function (e) {
    if (e.target && e.target.id === 'menuSearch') {
      const q = e.target.value.toLowerCase().trim();
      document.querySelectorAll('#app-sidebar .app-nav-item, #app-sidebar .app-sub-item, .sidebar-nav .nav-item').forEach(function (item) {
        const text = ((item.getAttribute('data-exact-label') || '') + ' ' + item.textContent).toLowerCase();
        item.style.display = (!q || text.includes(q)) ? '' : 'none';
      });
      if (q) {
        document.querySelectorAll('#app-sidebar .app-nav-group, .sidebar-nav .nav-group').forEach(function (g) {
          g.classList.add('is-open');
          g.classList.remove('is-collapsed');
        });
      }
    }
  });

  // 10. Universal SweetAlert2 Logout Confirmation
  window.bmConfirmLogout = function (logoutUrl) {
    const targetUrl = logoutUrl || (rootPrefix + 'login.html');

    function executeSwal() {
      if (!window.Swal) {
        if (confirm('Apakah Anda yakin ingin logout dari sistem Bisa Media?')) {
          window.location.href = targetUrl;
        }
        return;
      }

      Swal.fire({
        title: 'Konfirmasi Logout',
        text: 'Apakah Anda yakin ingin keluar dari sistem Bisa Media?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#94a3b8',
        confirmButtonText: 'Ya, Logout',
        cancelButtonText: 'Batal',
        reverseButtons: true,
        focusCancel: true,
        customClass: {
          popup: 'swal2-bisa-popup'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: 'Berhasil Logout',
            text: 'Mengarahkan ke halaman login...',
            icon: 'success',
            showConfirmButton: false,
            timer: 900,
            timerProgressBar: true,
            customClass: {
              popup: 'swal2-bisa-popup'
            }
          }).then(() => {
            window.location.href = targetUrl;
          });
        }
      });
    }

    if (window.Swal && typeof window.Swal.fire === 'function') {
      executeSwal();
    } else {
      let script = document.querySelector('script[src*="sweetalert2"]');
      if (!script) {
        script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
        document.head.appendChild(script);
      }
      script.addEventListener('load', executeSwal);
      setTimeout(function () {
        if (!window.Swal) executeSwal();
      }, 800);
    }
  };

  // Intercept all clicks to logout elements across the application
  document.addEventListener('click', function (e) {
    const logoutEl = e.target.closest('.sidebar-logout-btn, #sidebar-logout-link, .user-menu-dropdown__item--danger, a[href$="login.html"], a[href*="login.html"], [data-action="logout"], .btn-logout, a.dropdown-item[href*="login.html"]');
    if (logoutEl) {
      e.preventDefault();
      e.stopPropagation();
      const href = logoutEl.getAttribute('href') || (rootPrefix + 'login.html');
      window.bmConfirmLogout(href);
    }
  }, true);

  // Handle resize event untuk responsivitas dinamis
  window.addEventListener('resize', function () {
    const shell = document.querySelector('.dashboard-shell') ||
      document.querySelector('.layout-page') ||
      document.querySelector('.layout-container');
    if (shell) {
      if (window.innerWidth >= 1024) {
        const isCollapsed = document.body.classList.contains('sidebar-collapsed');
        shell.style.setProperty('margin-left', isCollapsed ? '0' : '240px', 'important');
        shell.style.setProperty('width', isCollapsed ? '100%' : 'calc(100% - 240px)', 'important');
      } else {
        shell.style.setProperty('margin-left', '0', 'important');
        shell.style.setProperty('width', '100%', 'important');
      }
    }
  });

  function renderAppSidebarSafe() {
    try {
      renderAppSidebar();
    } catch (error) {
      console.error('renderAppSidebar failed:', error);
    } finally {
      markSidebarReady();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAppSidebarSafe);
  } else {
    renderAppSidebarSafe();
  }

  // Helper Global Minimalist Empty State Component (Sesuai Referensi Pengguna)
  window.getAppEmptyStateHTML = function (title, subtitle) {
    return `
      <div class="app-empty-state">
        <svg class="app-empty-state__icon" viewBox="0 0 24 24">
          <rect x="5" y="2" width="14" height="20" rx="3.5" fill="#94a3b8"/>
          <rect x="7.5" y="5" width="9" height="3.2" rx="1" fill="#ffffff"/>
          <circle cx="8.8" cy="11.5" r="1.1" fill="#ffffff"/>
          <circle cx="12" cy="11.5" r="1.1" fill="#ffffff"/>
          <circle cx="15.2" cy="11.5" r="1.1" fill="#ffffff"/>
          <circle cx="8.8" cy="14.8" r="1.1" fill="#ffffff"/>
          <circle cx="12" cy="14.8" r="1.1" fill="#ffffff"/>
          <circle cx="15.2" cy="14.8" r="1.1" fill="#ffffff"/>
          <circle cx="8.8" cy="18" r="1.1" fill="#ffffff"/>
          <circle cx="12" cy="18" r="1.1" fill="#ffffff"/>
          <circle cx="15.2" cy="18" r="1.1" fill="#ffffff"/>
        </svg>
        <div class="app-empty-state__title">${title}</div>
        <div class="app-empty-state__subtitle">${subtitle || ''}</div>
      </div>
    `.trim();
  };

  // Universal Empty State Supervisor
  function initAppEmptyStateSupervisor() {
    function getContextTitle(card, table) {
      if (table && table.getAttribute('data-empty-title')) {
        return table.getAttribute('data-empty-title');
      }
      const headerTitle = card ? card.querySelector('.card-header h5, .card-header h4, .campaign-panel__title, .dashboard-heading h1, .db-attendance-header h2, .db-topk-header h2, .card-title-italic, .card-title-caps, .brand-card-title, h1, h2, h3, h4, h5') : null;
      if (headerTitle) {
        let text = headerTitle.textContent.trim();
        // Bersihkan prefix atau counter (misal: BM / Data Karyawan)
        text = text.replace(/^[A-Z0-9_-]+\s*\/\s*/i, '').replace(/\([0-9]+\)/g, '').trim();
        if (text) {
          if (/^belum ada/i.test(text)) return text;
          if (/kehadiran/i.test(text)) return 'Belum ada data kehadiran';
          if (/^data /i.test(text)) return 'Belum ada ' + text;
          return 'Belum ada data ' + text;
        }
      }
      const docTitle = document.title.split('-')[0].split('|')[0].trim();
      if (docTitle) {
        if (/^data /i.test(docTitle)) return 'Belum ada ' + docTitle;
        return 'Belum ada data ' + docTitle;
      }
      return 'Belum ada data';
    }

    function getContextSubtitle(title, card) {
      const addBtn = card ? card.querySelector('.btn-tambah, #btnAddKaryawan, button.crud-add-btn, [id*="btnTambah"], [id*="btnAdd"]') : null;
      let btnLabel = '+ Tambah';
      if (addBtn) {
        const t = addBtn.textContent.trim();
        if (t) btnLabel = t.startsWith('+') ? t : '+ ' + t;
      }
      const cleanTitle = title.replace(/^Belum ada (data )?/i, '').toLowerCase();
      return `Klik tombol "${btnLabel}" di atas untuk menambahkan ${cleanTitle} baru.`;
    }

    function isCardSearching(card, table) {
      const inputs = card ? Array.from(card.querySelectorAll('input[type="search"], input.menu-search, input[data-search-table], .bm-searchbox input, .campaign-search input, input[placeholder*="Cari"]')) : [];
      return inputs.some(inp => inp.value && inp.value.trim() !== '');
    }

    function updateEmptyStateForTable(table) {
      if (!table || table.closest('#app-calendar, .flatpickr-calendar, .datepicker, .mini-table, .modal, .modal-box, .db-calendar-table, .db-calendar-card')) return;

      const parentWrap = table.closest('.table-wrap, .table-responsive, #tableContainerWrapper, .campaign-scroll-table-wrap, .db-attendance-table-wrap, .db-topk-table-wrap, .table-scroll-wrap') || table.parentElement;
      const card = parentWrap ? (parentWrap.closest('.card, .campaign-panel, .panel, section, main, .db-attendance-card, .db-top-kreator-card, .brand-card-box, .campaign-white-card') || parentWrap.parentElement) : null;
      if (!card) return;

      const isDashboardTable = !!(
        window.location.pathname.toLowerCase().includes('dashboard') ||
        table.closest('.db-attendance-table-wrap, .db-topk-table-wrap, .brand-leaderboard-grid, .brand-card-box, [class*="dashboard"], [id*="dashboard"], .campaign-white-card, .db-attendance-card, .db-top-kreator-card') ||
        table.classList.contains('db-attendance-table') ||
        table.classList.contains('db-topk-table') ||
        table.classList.contains('brand-table-clean') ||
        table.classList.contains('bm-att-table') ||
        table.classList.contains('dotted-table') ||
        table.getAttribute('data-preserve-header') === 'true' ||
        table.getAttribute('data-inline-empty') === 'true'
      );

      let emptyEl = card.querySelector(':scope > #emptyTableState, :scope > .app-empty-state') || card.querySelector('#emptyTableState, .app-empty-state');
      const pag = card.querySelector('.hirezy-pagination-wrap');
      const tbody = table.querySelector('tbody');
      const rows = tbody ? Array.from(tbody.querySelectorAll('tr')) : [];

      let hasSearchRow = false;
      const validRows = rows.filter(r => {
        if (r.classList.contains('hirezy-empty-search-row') || r.classList.contains('db-empty-row') || r.classList.contains('app-empty-table-row')) {
          if (r.classList.contains('hirezy-empty-search-row')) hasSearchRow = true;
          return false;
        }
        const tds = r.querySelectorAll('td');
        if (tds.length === 1 && r.querySelector('td[colspan]')) {
          const txt = r.textContent.trim().toLowerCase();
          if (txt.includes('sesuai') || txt.includes('pencarian') || txt.includes('filter') || txt.includes('tidak ditemukan')) {
            hasSearchRow = true;
            return false;
          }
          if (txt.includes('belum ada') || txt.includes('tidak ada') || txt.includes('kosong')) return false;
        }
        return true;
      });

      const searching = hasSearchRow || isCardSearching(card, table);

      if (isDashboardTable) {
        // UNTUK DASHBOARD: Pastikan parentWrap dan urutan header tabel (thead) selalu tampil utuh
        parentWrap.style.removeProperty('display');
        if (parentWrap.style.display === 'none') parentWrap.style.display = '';
        table.style.removeProperty('display');
        if (table.style.display === 'none') table.style.display = '';

        // Sembunyikan emptyEl eksternal di luar tabel jika ada
        if (emptyEl) {
          emptyEl.classList.add('is-hidden');
          emptyEl.classList.remove('is-visible');
          emptyEl.style.setProperty('display', 'none', 'important');
        }

        if (validRows.length > 0) {
          // Ada data: hapus baris empty state internal dalam tbody
          if (tbody) {
            tbody.querySelectorAll('.app-empty-table-row, .db-empty-row').forEach(row => row.remove());
          }
          if (pag) pag.style.removeProperty('display');
        } else if (searching) {
          // Sedang memfilter/mencari
          if (tbody) {
            tbody.querySelectorAll('.app-empty-table-row').forEach(row => row.remove());
          }
          if (pag) pag.style.setProperty('display', 'none', 'important');
        } else {
          // Benar-benar kosong (0 record) di dashboard: Tampilkan urutan tabel (thead) + baris empty state dalam tbody
          if (tbody) {
            const ths = table.querySelectorAll('thead tr:first-child > th, thead tr:first-child > td');
            const colCount = ths.length || 7;
            const title = getContextTitle(card, table);
            let emptyRow = tbody.querySelector('.app-empty-table-row, .db-empty-row');
            const innerHtml = `
              <td colspan="${colCount}">
                <div class="app-empty-table-box">
                  <svg viewBox="0 0 24 24">
                    <rect x="5" y="2" width="14" height="20" rx="3.5" fill="#94a3b8"/>
                    <rect x="7.5" y="5" width="9" height="3.2" rx="1" fill="#ffffff"/>
                    <circle cx="8.8" cy="11.5" r="1.1" fill="#ffffff"/>
                    <circle cx="12" cy="11.5" r="1.1" fill="#ffffff"/>
                    <circle cx="15.2" cy="11.5" r="1.1" fill="#ffffff"/>
                    <circle cx="8.8" cy="14.8" r="1.1" fill="#ffffff"/>
                    <circle cx="12" cy="14.8" r="1.1" fill="#ffffff"/>
                    <circle cx="15.2" cy="14.8" r="1.1" fill="#ffffff"/>
                    <circle cx="8.8" cy="18" r="1.1" fill="#ffffff"/>
                    <circle cx="12" cy="18" r="1.1" fill="#ffffff"/>
                    <circle cx="15.2" cy="18" r="1.1" fill="#ffffff"/>
                  </svg>
                  <div class="app-empty-table-title">${title}</div>
                  <div class="app-empty-table-subtitle">Belum ada data yang tercatat saat ini.</div>
                </div>
              </td>
            `;
            if (!emptyRow) {
              emptyRow = document.createElement('tr');
              emptyRow.className = 'app-empty-table-row db-empty-row';
              emptyRow.innerHTML = innerHtml;
              tbody.appendChild(emptyRow);
            } else {
              emptyRow.className = 'app-empty-table-row db-empty-row';
              emptyRow.innerHTML = innerHtml;
              emptyRow.style.removeProperty('display');
            }
          }
          if (pag) pag.style.setProperty('display', 'none', 'important');
        }
        return;
      }

      if (validRows.length > 0) {
        // Data ada! Pastikan empty state tersembunyi sepenuhnya dan tabel tampil
        if (emptyEl) {
          emptyEl.classList.add('is-hidden');
          emptyEl.classList.remove('is-visible');
          emptyEl.style.setProperty('display', 'none', 'important');
        }
        parentWrap.style.removeProperty('display');
        if (parentWrap.style.display === 'none') parentWrap.style.display = '';
        if (pag) pag.style.removeProperty('display');
      } else if (searching) {
        // Sedang memfilter atau mencari: jangan tampilkan empty state database global
        if (emptyEl) {
          emptyEl.classList.add('is-hidden');
          emptyEl.classList.remove('is-visible');
          emptyEl.style.setProperty('display', 'none', 'important');
        }
        parentWrap.style.removeProperty('display');
        if (parentWrap.style.display === 'none') parentWrap.style.display = '';
        if (pag) pag.style.setProperty('display', 'none', 'important');
      } else {
        // Benar-benar kosong (0 record)
        if (!emptyEl) {
          emptyEl = document.createElement('div');
          emptyEl.id = 'emptyTableState';
          emptyEl.className = 'app-empty-state';
          const title = getContextTitle(card, table);
          const sub = getContextSubtitle(title, card);
          emptyEl.innerHTML = `
            <svg class="app-empty-state__icon" viewBox="0 0 24 24">
              <rect x="5" y="2" width="14" height="20" rx="3.5" fill="#94a3b8"/>
              <rect x="7.5" y="5" width="9" height="3.2" rx="1" fill="#ffffff"/>
              <circle cx="8.8" cy="11.5" r="1.1" fill="#ffffff"/>
              <circle cx="12" cy="11.5" r="1.1" fill="#ffffff"/>
              <circle cx="15.2" cy="11.5" r="1.1" fill="#ffffff"/>
              <circle cx="8.8" cy="14.8" r="1.1" fill="#ffffff"/>
              <circle cx="12" cy="14.8" r="1.1" fill="#ffffff"/>
              <circle cx="15.2" cy="14.8" r="1.1" fill="#ffffff"/>
              <circle cx="8.8" cy="18" r="1.1" fill="#ffffff"/>
              <circle cx="12" cy="18" r="1.1" fill="#ffffff"/>
              <circle cx="15.2" cy="18" r="1.1" fill="#ffffff"/>
            </svg>
            <div class="app-empty-state__title">${title}</div>
            <div class="app-empty-state__subtitle">${sub}</div>
          `;
          parentWrap.before(emptyEl);
        }
        emptyEl.classList.remove('is-hidden');
        emptyEl.classList.add('is-visible');
        emptyEl.style.setProperty('display', 'flex', 'important');
        parentWrap.style.setProperty('display', 'none', 'important');
        if (pag) pag.style.setProperty('display', 'none', 'important');
      }
    }

    function updateEmptyStateForGrid(cardGrid) {
      if (!cardGrid) return;
      const card = cardGrid.closest('.card, .campaign-panel, .panel, section, main') || cardGrid.parentElement;
      if (!card) return;

      let emptyEl = card.querySelector(':scope > #emptyTableState, :scope > .app-empty-state') || card.querySelector('#emptyTableState, .app-empty-state');
      const cards = Array.from(cardGrid.children).filter(c => !c.classList.contains('app-empty-state') && !c.id.includes('empty'));
      const searching = isCardSearching(card, null);

      if (cards.length > 0) {
        if (emptyEl) {
          emptyEl.classList.add('is-hidden');
          emptyEl.classList.remove('is-visible');
          emptyEl.style.setProperty('display', 'none', 'important');
        }
        cardGrid.style.removeProperty('display');
        if (cardGrid.style.display === 'none') cardGrid.style.display = '';
      } else if (searching) {
        if (emptyEl) {
          emptyEl.classList.add('is-hidden');
          emptyEl.classList.remove('is-visible');
          emptyEl.style.setProperty('display', 'none', 'important');
        }
        cardGrid.style.removeProperty('display');
      } else {
        if (!emptyEl) {
          emptyEl = document.createElement('div');
          emptyEl.id = 'emptyTableState';
          emptyEl.className = 'app-empty-state';
          const title = getContextTitle(card, null);
          const sub = getContextSubtitle(title, card);
          emptyEl.innerHTML = `
            <svg class="app-empty-state__icon" viewBox="0 0 24 24">
              <rect x="5" y="2" width="14" height="20" rx="3.5" fill="#94a3b8"/>
              <rect x="7.5" y="5" width="9" height="3.2" rx="1" fill="#ffffff"/>
              <circle cx="8.8" cy="11.5" r="1.1" fill="#ffffff"/>
              <circle cx="12" cy="11.5" r="1.1" fill="#ffffff"/>
              <circle cx="15.2" cy="11.5" r="1.1" fill="#ffffff"/>
              <circle cx="8.8" cy="14.8" r="1.1" fill="#ffffff"/>
              <circle cx="12" cy="14.8" r="1.1" fill="#ffffff"/>
              <circle cx="15.2" cy="14.8" r="1.1" fill="#ffffff"/>
              <circle cx="8.8" cy="18" r="1.1" fill="#ffffff"/>
              <circle cx="12" cy="18" r="1.1" fill="#ffffff"/>
              <circle cx="15.2" cy="18" r="1.1" fill="#ffffff"/>
            </svg>
            <div class="app-empty-state__title">${title}</div>
            <div class="app-empty-state__subtitle">${sub}</div>
          `;
          cardGrid.before(emptyEl);
        }
        emptyEl.classList.remove('is-hidden');
        emptyEl.classList.add('is-visible');
        emptyEl.style.setProperty('display', 'flex', 'important');
        cardGrid.style.setProperty('display', 'none', 'important');
      }
    }

    function checkAll() {
      document.querySelectorAll('table:not(.mini-table)').forEach(updateEmptyStateForTable);
      document.querySelectorAll('.milestone-card-grid, #tugasCardGrid, #milestoneCardGrid').forEach(updateEmptyStateForGrid);
    }

    window.bmToggleEmptyState = function (emptyEl, wrapperEl, isEmpty) {
      const empty = typeof emptyEl === 'string' ? document.querySelector(emptyEl) : emptyEl;
      const wrap = typeof wrapperEl === 'string' ? document.querySelector(wrapperEl) : wrapperEl;
      if (isEmpty) {
        if (wrap) wrap.style.setProperty('display', 'none', 'important');
        if (empty) {
          empty.classList.remove('is-hidden');
          empty.classList.add('is-visible');
          empty.style.setProperty('display', 'flex', 'important');
        }
      } else {
        if (wrap) {
          wrap.style.removeProperty('display');
          if (wrap.style.display === 'none') wrap.style.display = '';
        }
        if (empty) {
          empty.classList.add('is-hidden');
          empty.classList.remove('is-visible');
          empty.style.setProperty('display', 'none', 'important');
        }
      }
    };

    window.bmUpdateEmptyState = function (target) {
      if (!target) {
        checkAll();
      } else if (target.tagName === 'TABLE') {
        updateEmptyStateForTable(target);
      } else if (target.classList && target.classList.contains('milestone-card-grid')) {
        updateEmptyStateForGrid(target);
      } else {
        checkAll();
      }
    };

    // Eksekusi awal dan bertahap
    checkAll();
    window.addEventListener('load', checkAll);
    setTimeout(checkAll, 150);
    setTimeout(checkAll, 600);

    if (window.MutationObserver) {
      const observer = new MutationObserver(function (mutations) {
        let needsCheck = false;
        for (let i = 0; i < mutations.length; i++) {
          const m = mutations[i];
          if (m.type === 'childList') {
            const target = m.target;
            if (target && (target.tagName === 'TBODY' || (target.classList && (target.classList.contains('milestone-card-grid') || target.classList.contains('table-responsive') || target.classList.contains('table-wrap'))))) {
              needsCheck = true;
              break;
            }
          }
        }
        if (needsCheck) {
          checkAll();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAppEmptyStateSupervisor);
  } else {
    initAppEmptyStateSupervisor();
  }

    /* ===== GLOBAL ACCOUNTING MASTER DIVISI SYNCHRONIZER ===== */
  const ACCOUNTING_DIVISI_STORAGE_KEY = 'accounting_master_divisi_v1';
  const DEFAULT_ACCOUNTING_DIVISI_DATA = [
    { id: 'div-1', nama: 'Accounting', subPerusahaan: 'MCN' },
    { id: 'div-2', nama: 'Agency', subPerusahaan: 'TAP' },
    { id: 'div-3', nama: 'CEO Office', subPerusahaan: 'MCN' },
    { id: 'div-4', nama: 'Clining Service', subPerusahaan: 'TSP' },
    { id: 'div-5', nama: 'COO Office', subPerusahaan: 'TAP' },
    { id: 'div-6', nama: 'Event', subPerusahaan: 'MCN' },
    { id: 'div-7', nama: 'General', subPerusahaan: 'TSP' },
    { id: 'div-8', nama: 'Head Of Finance', subPerusahaan: 'MCN' },
    { id: 'div-9', nama: 'Head Of Human Resource', subPerusahaan: 'TAP' },
    { id: 'div-10', nama: 'Head Of IT', subPerusahaan: 'TSP' },
    { id: 'div-11', nama: 'Head Of Marketing', subPerusahaan: 'MCN' },
    { id: 'div-12', nama: 'HR', subPerusahaan: 'TAP' },
    { id: 'div-13', nama: 'Live HUB', subPerusahaan: 'MCN' },
    { id: 'div-14', nama: 'Manager Operation', subPerusahaan: 'TAP' },
    { id: 'div-15', nama: 'Manager TAP', subPerusahaan: 'TAP' },
    { id: 'div-16', nama: 'Manager TSP', subPerusahaan: 'TSP' },
    { id: 'div-17', nama: 'Marketing', subPerusahaan: 'MCN' },
    { id: 'div-18', nama: 'MCN', subPerusahaan: 'MCN' },
    { id: 'div-19', nama: 'Pentry', subPerusahaan: 'TSP' },
    { id: 'div-20', nama: 'Probability', subPerusahaan: 'TSP' },
    { id: 'div-21', nama: 'Produksi', subPerusahaan: 'TSP' },
    { id: 'div-22', nama: 'SPV Account Management', subPerusahaan: 'TAP' },
    { id: 'div-23', nama: 'SPV Advertiser', subPerusahaan: 'TAP' },
    { id: 'div-24', nama: 'SPV Content Management', subPerusahaan: 'MCN' },
    { id: 'div-25', nama: 'SPV Creative', subPerusahaan: 'TSP' },
    { id: 'div-26', nama: 'SPV IT Programer', subPerusahaan: 'TSP' },
    { id: 'div-27', nama: 'SPV KOL Management', subPerusahaan: 'MCN' },
    { id: 'div-28', nama: 'SPV Live Management', subPerusahaan: 'MCN' },
    { id: 'div-29', nama: 'SPV Marketing', subPerusahaan: 'MCN' },
    { id: 'div-30', nama: 'Staf Account Management', subPerusahaan: 'TAP' },
    { id: 'div-31', nama: 'Staf Administrasi Umum', subPerusahaan: 'TSP' },
    { id: 'div-32', nama: 'Staf Advertiser', subPerusahaan: 'TAP' },
    { id: 'div-33', nama: 'Staf Content Management', subPerusahaan: 'MCN' },
    { id: 'div-34', nama: 'Staf Creative', subPerusahaan: 'TSP' },
    { id: 'div-35', nama: 'Staf Information Technology', subPerusahaan: 'TSP' },
    { id: 'div-36', nama: 'Staf KOL Management', subPerusahaan: 'MCN' },
    { id: 'div-37', nama: 'Staf Live Management', subPerusahaan: 'MCN' },
    { id: 'div-38', nama: 'Staf Marketing Communication', subPerusahaan: 'MCN' },
    { id: 'div-39', nama: 'Staf Public Relation', subPerusahaan: 'MCN' },
    { id: 'div-40', nama: 'TAP', subPerusahaan: 'TAP' },
    { id: 'div-41', nama: 'TSP', subPerusahaan: 'TSP' },
    { id: 'div-42', nama: 'Finance & Accounting', subPerusahaan: 'MCN' },
    { id: 'div-43', nama: 'Operasional', subPerusahaan: 'TAP' },
    { id: 'div-44', nama: 'Marketing & Brand', subPerusahaan: 'TAP' },
    { id: 'div-45', nama: 'Creative & Design', subPerusahaan: 'TSP' },
    { id: 'div-46', nama: 'General Affair', subPerusahaan: 'TSP' },
    { id: 'div-47', nama: 'Human Resource (HR)', subPerusahaan: 'TAP' },
    { id: 'div-48', nama: 'IT & Development', subPerusahaan: 'TSP' }
  ];

  function getAccountingDivisiList() {
    try {
      const raw = localStorage.getItem(ACCOUNTING_DIVISI_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(ACCOUNTING_DIVISI_STORAGE_KEY, JSON.stringify(DEFAULT_ACCOUNTING_DIVISI_DATA));
        return DEFAULT_ACCOUNTING_DIVISI_DATA.map(function (d) { return d.nama; });
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const list = parsed.map(function (d) {
          if (typeof d === 'string') return d.trim();
          return (d && (d.nama || d.divisi) ? (d.nama || d.divisi) : '').trim();
        }).filter(Boolean);
        if (list.length > 0) return list;
      }
    } catch (e) {
      console.warn('Error reading master divisi:', e);
    }
    return DEFAULT_ACCOUNTING_DIVISI_DATA.map(function (d) { return d.nama; });
  }

  function syncAccountingDivisiDatalists() {
    if (!document.body) return;
    const divisions = getAccountingDivisiList();

    // 1. Datalist Global Divisi
    let globalDatalist = document.getElementById('globalAccountingDivisiList');
    if (!globalDatalist) {
      globalDatalist = document.createElement('datalist');
      globalDatalist.id = 'globalAccountingDivisiList';
      document.body.appendChild(globalDatalist);
    }

    const optionsHtml = divisions.map(function (name) {
      return '<option value="' + String(name).replace(/"/g, '&quot;') + '"></option>';
    }).join('');

    globalDatalist.innerHTML = optionsHtml;

    // 2. Sinkronisasi datalist lokal yang sudah ada di modul
    ['listDivisiPengecualian', 'divisiList'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.innerHTML = optionsHtml;
    });

    // 3. Hubungkan ke semua input Divisi & Divisi Pengecualian di form modul
    const divisiInputSelectors = [
      '#pndDivisiPengecualian',
      '#crudDivisiPengecualian',
      '#crudDivisi:not([readonly])',
      '#pjDivisi',
      '#coaDevisDefault',
      '#kbDivisi',
      '#pndDivisi:not([readonly])'
    ];

    divisiInputSelectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (inp) {
        if (inp.id === 'karyawanDivisi' || (inp.dataset && inp.dataset.manualInput === 'true')) {
          inp.removeAttribute('list');
          return;
        }
        if (!inp.hasAttribute('list') || inp.getAttribute('list') === 'globalAccountingDivisiList') {
          inp.setAttribute('list', 'globalAccountingDivisiList');
        }
      });
    });
    const manualKryDiv = document.getElementById('karyawanDivisi');
    if (manualKryDiv) manualKryDiv.removeAttribute('list');
  }

  window.getAccountingDivisiList = getAccountingDivisiList;
  window.syncAccountingDivisiDatalists = syncAccountingDivisiDatalists;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncAccountingDivisiDatalists);
  } else {
    syncAccountingDivisiDatalists();
  }
  window.addEventListener('load', syncAccountingDivisiDatalists);

  window.addEventListener('storage', function (e) {
    if (e.key === ACCOUNTING_DIVISI_STORAGE_KEY) {
      syncAccountingDivisiDatalists();
    }
  });

  window.addEventListener('accounting_divisi_changed', function () {
    syncAccountingDivisiDatalists();
  });

  // Delegasi fokus otomatis untuk semua input divisi yang dinamis / baru dirender
  document.addEventListener('focusin', function (e) {
    const target = e.target;
    if (target && target.tagName === 'INPUT' && !target.readOnly) {
      const id = target.id || '';
      if (id === 'karyawanDivisi' || (target.dataset && target.dataset.manualInput === 'true')) return;
      const name = target.name || '';
      const placeholder = target.placeholder || '';
      if (id.toLowerCase().includes('divisi') || name.toLowerCase().includes('divisi') || placeholder.toLowerCase().includes('divisi')) {
        if (!target.hasAttribute('list') || target.getAttribute('list') === 'globalAccountingDivisiList') {
          target.setAttribute('list', 'globalAccountingDivisiList');
        }
      }
    }
  });

  
  // Global Style: Hapus UI radio button / lingkaran di semua custom dropdown (Permintaan User)
  (function initUniversalCleanDropdownStyles() {
    if (document.getElementById('bisa-clean-dropdown-styles')) return;
    const style = document.createElement('style');
    style.id = 'bisa-clean-dropdown-styles';
    style.textContent = `
      .pnd-custom-radio,
      .custom-radio,
      .pnd-select-option input[type="radio"],
      .pnd-select-item input[type="radio"],
      .kb-select-item input[type="radio"],
      .pnd-select-dropdown input[type="radio"],
      .kb-select-dropdown input[type="radio"] {
        display: none !important;
      }
      .pnd-select-option:has(input[type="radio"]:checked),
      .pnd-select-item:has(input[type="radio"]:checked),
      .kb-select-item:has(input[type="radio"]:checked) {
        background: #e0f2fe !important;
        color: #0076C5 !important;
        font-weight: 600 !important;
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  })();

  // Validasi global untuk seluruh modul:
  // Semua field form data yang BUKAN opsional (tanpa label/placeholder 'opsional' / 'optional') wajib diisi.
  // Jika disubmit dalam keadaan kosong, memunculkan SweetAlert "Data Belum Diisi" dan mencegah submit bawaan browser.
  (function initGlobalRequiredFormValidation() {
    function getFieldLabel(el) {
      if (!el) return '';
      if (el.id) {
        const lbl = document.querySelector('label[for="' + el.id + '"]');
        if (lbl && lbl.textContent) {
          return lbl.textContent.replace(/\*/g, '').replace(/\(opsional\)|\(optional\)/gi, '').trim();
        }
      }
      const fieldWrap = el.closest ? el.closest('.pnd-field, .pnd-form-group, .modal-field, .kb-form-group, .form-group, .field-group, .karyawan-form-field, .col-form-group') : null;
      if (fieldWrap) {
        const lbl = fieldWrap.querySelector('label, .pnd-label, .pnd-form-label, .modal-field-label, .karyawan-form-label, .kb-form-label, .form-label');
        if (lbl && lbl.textContent) {
          return lbl.textContent.replace(/\*/g, '').replace(/\(opsional\)|\(optional\)/gi, '').trim();
        }
      }
      if (el.getAttribute && el.getAttribute('aria-label')) {
        return el.getAttribute('aria-label').replace(/\(opsional\)|\(optional\)/gi, '').trim();
      }
      if (el.placeholder && !el.placeholder.toLowerCase().includes('cari') && !el.placeholder.toLowerCase().includes('search')) {
        return String(el.placeholder).replace(/\(opsional\)|\(optional\)/gi, '').trim();
      }
      return el.name || el.id || 'Kolom';
    }

    function isFieldOptional(el) {
      if (!el) return false;
      const placeholder = (el.placeholder || '').toLowerCase();
      const ariaLabel = (el.getAttribute && el.getAttribute('aria-label') ? el.getAttribute('aria-label') : '').toLowerCase();
      const title = (el.title || '').toLowerCase();

      let labelText = '';
      if (el.id) {
        const lbl = document.querySelector('label[for="' + el.id + '"]');
        if (lbl) labelText += ' ' + lbl.textContent;
      }
      const fieldWrap = el.closest ? el.closest('.pnd-field, .modal-field, .kb-form-group, .form-group, .field-group, .karyawan-form-field, .col-form-group') : null;
      if (fieldWrap) {
        const lbl = fieldWrap.querySelector('label, .modal-field-label, .karyawan-form-label, .kb-form-label, .form-label, small, .form-text');
        if (lbl) labelText += ' ' + lbl.textContent;
      }
      labelText = labelText.toLowerCase();

      const optionalRegex = /\b(opsional|optional)\b/i;
      return optionalRegex.test(placeholder) ||
             optionalRegex.test(ariaLabel) ||
             optionalRegex.test(title) ||
             optionalRegex.test(labelText) ||
             el.hasAttribute('data-optional');
    }

    function isFieldVisible(el) {
      if (!el || el.disabled || el.readOnly || el.type === 'hidden') return false;
      if (el.hidden || (el.closest && el.closest('[hidden]'))) return false;
      if (typeof window.getComputedStyle === 'function') {
        let cur = el;
        while (cur && cur.nodeType === 1 && cur !== document.body && cur !== document.documentElement) {
          const st = window.getComputedStyle(cur);
          if (st.display === 'none' || st.visibility === 'hidden') return false;
          cur = cur.parentElement;
        }
      }
      if (el.offsetWidth === 0 && el.offsetHeight === 0 && el.getClientRects().length === 0) {
        return false;
      }
      return true;
    }

    function isInsideFilterOrSearch(el) {
      if (!el) return false;
      // Cek apakah elemen ada di search box atau container filter tabel
      if (el.closest) {
        if (el.closest('.filter-box, .table-filters, .filter-container, .search-box, .dataTables_filter, .table-search, .toolbar-filter, .ak-trend-toolbar, .navbar, .sidebar, header, nav')) {
          return true;
        }
      }
      const id = (el.id || '').toLowerCase();
      const name = (el.name || '').toLowerCase();
      const ph = (el.placeholder || '').toLowerCase();
      if (id.includes('search') || id.includes('filter') || id.includes('cari')) return true;
      if (name.includes('search') || name.includes('filter') || name.includes('cari')) return true;
      if (ph.includes('cari') || ph.includes('search') || ph.includes('filter')) return true;
      return false;
    }

    function isMoneyInput(el) {
      if (!el || (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA')) return false;
      const type = (el.type || '').toLowerCase();
      if (type === 'file' || type === 'checkbox' || type === 'radio' || type === 'button' || type === 'submit' || type === 'reset' || type === 'date' || type === 'search') return false;
      if (el.classList && el.classList.contains('bisa-datepicker-input')) return false;

      const id = (el.id || '').toLowerCase();
      const name = (el.name || '').toLowerCase();
      const cls = (el.className || '').toLowerCase();
      const ph = (el.placeholder || '').toLowerCase();

      let labelText = '';
      if (el.id) {
        const lbl = document.querySelector('label[for="' + el.id + '"]');
        if (lbl) labelText += ' ' + lbl.textContent;
      }
      const wrap = el.closest ? el.closest('.form-group, .field, .modal-field, .col-form-group, [class*="-field"], [class*="-group"]') : null;
      if (wrap) {
        const lbl = wrap.querySelector('label, [class*="-label"]');
        if (lbl) labelText += ' ' + lbl.textContent;
      }
      labelText = labelText.toLowerCase().trim();

      // Jangan pernah anggap kolom NIK, ID, Nama, Tanggal, Rekening, Tenor, Keterangan, Status, Divisi, Project/Brand sebagai kolom Rupiah
      const nonMoneyExclude = [
        'nik', 'nip', 'nama', 'kode', 'nomor', 'rekening', 'telepon', 'telp', 'email',
        'alamat', 'catatan', 'keterangan', 'deskripsi', 'divisi', 'jabatan', 'status',
        'periode', 'tanggal', 'tgl', 'tenor', 'pic', 'vendor', 'customer', 'project', 'brand'
      ];
      if (nonMoneyExclude.some(function (ex) {
        return id.includes(ex) || name.includes(ex) || labelText === ex || labelText.startsWith(ex + ' ');
      })) {
        return false;
      }
      if (id.startsWith('id') || id.includes('idpinjam') || id.includes('idkaryawan') || id.includes('idpayroll') || id.includes('idpembayaran') || id.includes('idtransaksi')) {
        return false;
      }

      const moneyKeywords = [
        'uangmasuk', 'uangkeluar', 'uang_masuk', 'uang_keluar', 'nominal', 'rupiah',
        'biaya', 'budget', 'tarif', 'gaji', 'harga', 'saldo', 'tagihan', 'dpp', 'ppn', 'pph',
        'sisa', 'tunjangan', 'potongan', 'terbayar', 'pokokpinjaman', 'cicilan',
        'takehomepay', 'bebanbruto', 'keterlambatan', 'pengurangan', 'penerimaan',
        'perjalanandinas', 'bonus', 'price', 'amount', 'fee', 'cost'
      ];

      return moneyKeywords.some(function (k) {
        return id.includes(k) || name.includes(k) || labelText.includes(k);
      }) || ph.startsWith('rp') || cls.includes('format-rupiah') || cls.includes('money');
    }

    function isFieldEmpty(el) {
      const tag = (el.tagName || '').toUpperCase();
      const type = (el.type || '').toLowerCase();
      if (type === 'checkbox') return !el.checked;
      if (type === 'radio') {
        const form = el.form || document;
        const name = el.name;
        if (!name) return !el.checked;
        return !form.querySelector('input[type="radio"][name="' + name + '"]:checked');
      }
      if (type === 'file') {
        return !el.value && (!el.files || el.files.length === 0);
      }
      if (tag === 'SELECT') {
        const val = String(el.value || '').trim();
        if (!val) return true;
        if (el.selectedIndex === 0 && (val === '0' || val === '')) {
          const optText = (el.options[0] && el.options[0].text) ? el.options[0].text.toLowerCase() : '';
          if (optText.includes('pilih') || optText.includes('select') || optText.includes('--') || optText === '-') {
            return true;
          }
        }
        return false;
      }
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        const raw = String(el.value || '').trim();
        if (raw === '') return true;

        // Jika kolom uang bernilai 0 / Rp 0 / Rp. 0 / Rp -
        // Angka 0 tetap dapat dimasukkan dan diakui sebagai data yang valid (TIDAK KOSONG)
        if (isMoneyInput(el)) {
          const digits = raw.replace(/\D/g, '');
          const lower = raw.toLowerCase();
          if (digits === '0' || lower === '0' || lower === 'rp 0' || lower === 'rp. 0' || lower === 'rp -' || lower === 'rp. -') {
            return false;
          }
        }
        return false;
      }
      return false;
    }

    function disableNativeValidation(form) {
      if (form && !form.noValidate && !form.hasAttribute('data-use-native-validation')) {
        form.noValidate = true;
      }
    }

    function cleanNikString(val) {
      if (val === null || val === undefined) return val;
      const str = String(val).trim();
      if (/^-?rp\.?\s*/i.test(str)) {
        return str.replace(/^-?rp\.?\s*/i, '').trim() || '0';
      }
      return str;
    }

    function sanitizeStoredNikFields() {
      const storageKeysToClean = [
        'accounting_master_karyawan_v1',
        'bisa_master_karyawan_v1',
        'master_karyawan_data',
        'bisa_payroll_data_v1',
        'accounting_payroll_data_v1',
        'accounting_payroll_data',
        'accounting_utang_karyawan_data',
        'accounting_piutang_karyawan_data'
      ];
      storageKeysToClean.forEach(function (key) {
        try {
          const raw = localStorage.getItem(key);
          if (!raw) return;
          const parsed = JSON.parse(raw);
          if (!Array.isArray(parsed)) return;
          let changed = false;
          parsed.forEach(function (item) {
            if (!item || typeof item !== 'object') return;
            ['nik', 'nikBayar', 'nikKaryawan'].forEach(function (field) {
              if (typeof item[field] === 'string' && /^-?rp\.?\s*/i.test(item[field].trim())) {
                item[field] = cleanNikString(item[field]);
                changed = true;
              }
            });
          });
          if (changed) {
            localStorage.setItem(key, JSON.stringify(parsed));
          }
        } catch (e) {}
      });
    }

    // Jalankan pembersihan NIK segera saat layout.js dieksekusi (sebelum script halaman membaca localStorage)
    sanitizeStoredNikFields();

    function scanForms() {
      sanitizeStoredNikFields();
      document.querySelectorAll('form').forEach(disableNativeValidation);
      document.querySelectorAll('input[id*="Nik" i], input[name*="nik" i]').forEach(function (inp) {
        if (inp.value && /^-?rp\.?\s*/i.test(inp.value.trim())) {
          inp.value = cleanNikString(inp.value);
        }
      });
    }

    // Blokir tooltip validasi bawaan browser (e.g. "Please fill out this field")
    document.addEventListener('invalid', function (e) {
      e.preventDefault();
    }, true);

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', scanForms);
    } else {
      scanForms();
    }
    window.addEventListener('load', scanForms);

    let isAlertShowing = false;

    function highlightErrorField(el) {
      if (!el) return;
      el.classList.add('has-error-mandatory');
      const originalBorder = el.style.borderColor;
      const originalBoxShadow = el.style.boxShadow;
      el.style.borderColor = '#ef4444';
      el.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.2)';

      function removeHighlight() {
        el.style.borderColor = originalBorder;
        el.style.boxShadow = originalBoxShadow;
        el.classList.remove('has-error-mandatory');
        el.removeEventListener('input', removeHighlight);
        el.removeEventListener('change', removeHighlight);
      }
      el.addEventListener('input', removeHighlight);
      el.addEventListener('change', removeHighlight);
    }

    function validateContainer(container) {
      if (!container) return { isValid: true };

      // Untuk semua modul yang memiliki data uang yang wajib diisi:
      // Angka 0 tetap dapat dimasukkan dan jika data uang kosong saat disubmit, otomatis diisi Rp 0 / 0 agar valid
      const moneyInputs = Array.from(container.querySelectorAll('input:not([type="hidden"]):not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly])'));
      moneyInputs.forEach(function (inp) {
        if (isMoneyInput(inp) && isFieldEmpty(inp) && !isFieldOptional(inp) && !isInsideFilterOrSearch(inp)) {
          if (inp.type === 'number') {
            inp.value = '0';
          } else {
            inp.value = 'Rp 0';
          }
          try {
            inp.dispatchEvent(new Event('input', { bubbles: true }));
            inp.dispatchEvent(new Event('change', { bubbles: true }));
          } catch (e) {}
        }
      });

      const inputs = Array.from(container.querySelectorAll('input, select, textarea'));
      const missingLabels = [];
      let firstEmpty = null;
      const seenRadio = new Set();

      for (let i = 0; i < inputs.length; i++) {
        const el = inputs[i];
        const isExplicitRequired = el.hasAttribute('required');
        const isOptional = isFieldOptional(el);

        // Jika ada penanda opsional, jangan wajibkan!
        if (isOptional) continue;

        // Checkbox dan radio hanya divalidasi jika ada atribut required eksplisit
        const type = (el.type || '').toLowerCase();
        if ((type === 'checkbox' || type === 'radio') && !isExplicitRequired) continue;

        if (type === 'radio' && el.name) {
          if (seenRadio.has(el.name)) continue;
          seenRadio.add(el.name);
        }

        // Validasi custom dropdown (.pnd-select-wrap / .kb-select-wrap) yang menyimpan nilai pada input[type="hidden"][required]
        if (el.tagName === 'INPUT' && type === 'hidden') {
          if (!isExplicitRequired || el.disabled) continue;
          const wrap = el.closest ? el.closest('.pnd-select-wrap, .kb-select-wrap') : null;
          if (!wrap) continue;
          const triggerBtn = wrap.querySelector('.pnd-select-btn, .kb-select-btn');
          if (!triggerBtn || !isFieldVisible(triggerBtn)) continue;
          if (!String(el.value || '').trim()) {
            if (!firstEmpty) firstEmpty = triggerBtn;
            highlightErrorField(triggerBtn);
            const label = getFieldLabel(el);
            if (label && missingLabels.indexOf(label) === -1) {
              missingLabels.push(label);
            }
          }
          continue;
        }

        if (!isFieldVisible(el)) continue;
        if (isInsideFilterOrSearch(el)) continue;

        if (isFieldEmpty(el)) {
          if (!firstEmpty) firstEmpty = el;
          highlightErrorField(el);
          const label = getFieldLabel(el);
          if (label && missingLabels.indexOf(label) === -1) {
            missingLabels.push(label);
          }
        }
      }

      if (firstEmpty) {
        return {
          isValid: false,
          firstEmpty: firstEmpty,
          missingLabels: missingLabels
        };
      }
      return { isValid: true };
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function showAlert(result) {
      if (isAlertShowing) return;
      isAlertShowing = true;

      const labels = result.missingLabels || [];
      let htmlMessage = '<p style="font-size: 14px; color: #64748b; margin: 0 0 10px 0; line-height: 1.5;">Harap lengkapi semua data wajib yang masih kosong sebelum menyimpan formulir.</p>';

      if (labels.length > 0) {
        const count = labels.length;
        const gridCols = count === 1 ? '1fr' : 'repeat(2, minmax(0, 1fr))';
        const cardsHtml = labels.map(function (lbl, idx) {
          return '<div style="background: #ffffff; border: 1px solid #fee2e2; border-left: 3.5px solid #ef4444; border-radius: 8px; padding: 8px 12px; display: flex; align-items: center; gap: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); box-sizing: border-box; min-width: 0;">' +
            '<span style="display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 50%; background: #fee2e2; color: #ef4444; font-size: 11px; font-weight: 800; flex-shrink: 0;">' + (idx + 1) + '</span>' +
            '<span style="font-family: \'Outfit\', sans-serif; font-size: 13px; font-weight: 600; color: #1e293b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: left;" title="' + escapeHtml(lbl) + '">' + escapeHtml(lbl) + '</span>' +
          '</div>';
        }).join('');

        htmlMessage = '<div style="font-family: \'Outfit\', sans-serif; text-align: left; margin: 4px 0 0 0;">' +
          '<p style="font-size: 13.5px; color: #64748b; margin: 0 0 14px 0; text-align: center; line-height: 1.5;">' +
            'Terdapat <b style="color: #0076C5;">' + count + ' kolom wajib</b> yang masih kosong.<br/>Silakan lengkapi kolom berikut sebelum menyimpan:' +
          '</p>' +
          '<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; box-shadow: inset 0 1px 2px rgba(0,0,0,0.02);">' +
            '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px dashed #e2e8f0;">' +
              '<span style="font-size: 11.5px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; display: inline-flex; align-items: center; gap: 6px;">' +
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
                  '<circle cx="12" cy="12" r="10"></circle>' +
                  '<line x1="12" y1="8" x2="12" y2="12"></line>' +
                  '<line x1="12" y1="16" x2="12.01" y2="16"></line>' +
                '</svg>' +
                'Kolom Belum Terisi' +
              '</span>' +
              '<span style="background: #fee2e2; color: #b91c1c; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 20px;">' +
                count + ' Wajib Diisi' +
              '</span>' +
            '</div>' +
            '<div style="display: grid; grid-template-columns: ' + gridCols + '; gap: 8px; max-height: 190px; overflow-y: auto; padding-right: 2px;">' +
              cardsHtml +
            '</div>' +
          '</div>' +
          '<p style="margin: 12px 0 0 0; font-size: 12px; color: #94a3b8; text-align: center; font-style: italic;">' +
            'Klik tombol di bawah untuk langsung menuju kolom yang perlu diisi' +
          '</p>' +
        '</div>';
      }

      function onAlertClosed() {
        isAlertShowing = false;
        if (result.firstEmpty) {
          try {
            if (typeof result.firstEmpty.focus === 'function') {
              result.firstEmpty.focus();
            }
            if (typeof result.firstEmpty.scrollIntoView === 'function') {
              result.firstEmpty.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          } catch (errFocus) {}
        }
      }

      if (typeof window.Swal !== 'undefined') {
        window.Swal.fire({
          icon: 'warning',
          title: '<span style="font-family: \'Outfit\', sans-serif; font-size: 20px; font-weight: 700; color: #1e293b;">Data Belum Lengkap</span>',
          html: htmlMessage,
          confirmButtonText: '<span style="display: inline-flex; align-items: center; gap: 8px;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg> Lengkapi Data</span>',
          confirmButtonColor: '#0076C5',
          width: 480,
          padding: '24px 20px 22px 20px',
          customClass: {
            popup: 'swal2-validation-popup',
            confirmButton: 'swal2-validation-confirm-btn'
          }
        }).then(onAlertClosed);
      } else {
        const textMsg = labels.length > 0
          ? 'Data Belum Lengkap:\n- ' + labels.join('\n- ')
          : 'Harap lengkapi semua kolom yang wajib diisi.';
        window.alert(textMsg);
        onAlertClosed();
      }
    }

    // Intercept form submit event (capture phase)
    document.addEventListener('submit', function (e) {
      const form = e.target;
      if (!form || form.tagName !== 'FORM' || form.hasAttribute('data-skip-required-alert')) return;
      if (isInsideFilterOrSearch(form)) return;
      disableNativeValidation(form);

      const validation = validateContainer(form);
      if (!validation.isValid) {
        e.preventDefault();
        e.stopImmediatePropagation();
        showAlert(validation);
      }
    }, true);

    // Intercept klik pada tombol simpan / submit (capture phase) untuk form & modal
    document.addEventListener('click', function (e) {
      const btn = e.target && e.target.closest ? e.target.closest('button, input[type="submit"], a.btn') : null;
      if (!btn) return;

      // Cek apakah tombol adalah tombol simpan / submit
      const type = (btn.type || '').toLowerCase();
      const txt = (btn.textContent || '').trim().toLowerCase();
      const cls = (btn.className || '').toLowerCase();

      const isSaveBtn = type === 'submit' ||
                        cls.includes('simpan') ||
                        cls.includes('btn-save') ||
                        cls.includes('btn-submit') ||
                        txt === 'simpan' ||
                        txt === 'submit' ||
                        txt.startsWith('simpan ') ||
                        txt.startsWith('submit ') ||
                        txt === 'tambah data' ||
                        txt === 'simpan data';

      if (!isSaveBtn) return;

      const container = btn.form || (btn.closest ? btn.closest('form, .modal-box, .modal-dialog, .modal-content, .karyawan-modal-box, .kb-modal-box, .modal-overlay') : null);
      if (!container || isInsideFilterOrSearch(container) || container.hasAttribute('data-skip-required-alert')) return;

      if (container.tagName === 'FORM') {
        disableNativeValidation(container);
      }

      const validation = validateContainer(container);
      if (!validation.isValid) {
        e.preventDefault();
        e.stopImmediatePropagation();
        showAlert(validation);
      }
    }, true);

    // Memastikan angka 0 tetap dapat diketik dan tersimpan di semua kolom uang
    document.addEventListener('input', function (e) {
      const el = e.target;
      if (!el || el.tagName !== 'INPUT' || !isMoneyInput(el)) return;
      const raw = String(el.value || '').trim();
      const digits = raw.replace(/\D/g, '');
      if (raw === '0' || (digits === '0' && raw.length > 0)) {
        if (el.type === 'number') {
          el.value = '0';
        } else if (!raw.toLowerCase().startsWith('rp')) {
          el.value = 'Rp 0';
        }
      }
    }, true);

    document.addEventListener('blur', function (e) {
      const el = e.target;
      if (!el || el.tagName !== 'INPUT' || !isMoneyInput(el)) return;
      const raw = String(el.value || '').trim();
      const digits = raw.replace(/\D/g, '');
      if (digits === '0' || raw === '0') {
        if (el.type === 'number') {
          el.value = '0';
        } else {
          el.value = 'Rp 0';
        }
      }
    }, true);
  })();

  /* ============================================================================
     UNIVERSAL BISA CUSTOM DATEPICKER ENGINE (KONSISTEN DENGAN MODUL PENDAPATAN)
     ============================================================================ */
  (function initUniversalBisaDatePicker() {
    const DP_MONTH_NAMES = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const CALENDAR_ICON_SVG =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>' +
        '<line x1="16" y1="2" x2="16" y2="6"></line>' +
        '<line x1="8" y1="2" x2="8" y2="6"></line>' +
        '<line x1="3" y1="10" x2="21" y2="10"></line>' +
      '</svg>';

    const nativeInputValueDesc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');

    function formatYMD(y, m, d) {
      return String(y) + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    }

    function isoToDisplay(iso) {
      if (!iso) return '';
      const s = String(iso).trim();
      const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      if (m) {
        return m[3].padStart(2, '0') + '/' + m[2].padStart(2, '0') + '/' + m[1];
      }
      return s;
    }

    function displayToIso(display) {
      if (!display) return '';
      const s = String(display).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
      const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
      if (m) {
        return m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0');
      }
      return '';
    }

    function injectBisaDatePickerStyles() {
      if (document.getElementById('bisa-universal-datepicker-styles')) return;
      const style = document.createElement('style');
      style.id = 'bisa-universal-datepicker-styles';
      style.textContent = `
        .bisa-datepicker-wrap {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
        }
        .bisa-datepicker-wrap.is-compact {
          width: auto;
          display: inline-flex;
        }
        .bisa-datepicker-wrap .bisa-datepicker-input {
          width: 100%;
          padding-right: 34px !important;
          cursor: pointer;
          box-sizing: border-box;
        }
        .bisa-datepicker-wrap.is-compact .bisa-datepicker-input {
          width: 130px;
          padding-right: 28px !important;
        }
        .bisa-datepicker-icon {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          cursor: pointer;
          pointer-events: auto;
          transition: color 0.15s ease;
          z-index: 2;
        }
        .bisa-datepicker-wrap.is-compact .bisa-datepicker-icon {
          right: 6px;
          width: 16px;
          height: 16px;
        }
        .bisa-datepicker-wrap:focus-within .bisa-datepicker-icon,
        .bisa-datepicker-icon:hover {
          color: #0076C5;
        }
        .bisa-datepicker-icon svg {
          width: 16px;
          height: 16px;
          stroke: currentColor;
        }
        .bisa-datepicker-wrap.is-compact .bisa-datepicker-icon svg {
          width: 13.5px;
          height: 13.5px;
        }
        .bisa-dp-popover {
          position: fixed;
          display: none;
          z-index: 2147483600;
          width: 290px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 14px;
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.14), 0 2px 6px rgba(0, 0, 0, 0.04);
          padding: 16px 16px 12px 16px;
          box-sizing: border-box;
          font-family: 'Outfit', sans-serif;
          user-select: none;
          animation: bisaDpFadeIn 0.15s ease-out;
        }
        @keyframes bisaDpFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .bisa-dp-popover.is-open {
          display: block;
        }
        .bisa-dp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .bisa-dp-title {
          font-size: 14.5px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.2px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .bisa-dp-month-text {
          color: #0f172a;
          font-weight: 700;
        }
        .bisa-dp-year-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #f0f9ff;
          color: #0076C5;
          border: 1px solid #bae6fd;
          border-radius: 7px;
          padding: 2px 8px;
          font-family: 'Outfit', sans-serif;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .bisa-dp-year-btn:hover,
        .bisa-dp-year-btn.is-active {
          background: #0076C5;
          color: #ffffff;
          border-color: #0076C5;
        }
        .bisa-dp-year-btn svg {
          width: 12px;
          height: 12px;
          stroke: currentColor;
          stroke-width: 2.5;
          fill: none;
          transition: transform 0.15s ease;
        }
        .bisa-dp-year-btn.is-active svg {
          transform: rotate(180deg);
        }
        .bisa-dp-year-panel {
          display: none;
          margin-bottom: 6px;
          animation: bisaDpFadeIn 0.12s ease-out;
        }
        .bisa-dp-year-panel.is-open {
          display: block;
        }
        .bisa-dp-year-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
          padding: 0 2px;
        }
        .bisa-dp-year-range-label {
          font-size: 12.5px;
          font-weight: 700;
          color: #475569;
        }
        .bisa-dp-year-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }
        .bisa-dp-year-cell {
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 1px solid #f1f5f9;
          background: #f8fafc;
          font-size: 13px;
          font-weight: 600;
          color: #1e293b;
          cursor: pointer;
          transition: all 0.12s ease;
        }
        .bisa-dp-year-cell:hover {
          background: #e0f2fe;
          color: #0076C5;
          border-color: #bae6fd;
        }
        .bisa-dp-year-cell.is-current-year {
          border: 1.5px solid #38bdf8;
          color: #0284c7;
        }
        .bisa-dp-year-cell.is-selected {
          background: #0076C5 !important;
          color: #ffffff !important;
          border-color: #0076C5 !important;
          box-shadow: 0 2px 6px rgba(0, 118, 197, 0.3);
        }
        .bisa-dp-navs {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .bisa-dp-nav-btn {
          width: 28px;
          height: 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          border-radius: 7px;
          color: #475569;
          cursor: pointer;
          transition: all 0.15s ease;
          padding: 0;
        }
        .bisa-dp-nav-btn:hover {
          background: #f1f5f9;
          color: #0076C5;
          border-color: #cbd5e1;
        }
        .bisa-dp-nav-btn svg {
          width: 14px;
          height: 14px;
          stroke: currentColor;
          stroke-width: 2.4;
          fill: none;
        }
        .bisa-dp-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
          margin-bottom: 6px;
          text-align: center;
        }
        .bisa-dp-weekday {
          font-size: 11px;
          font-weight: 600;
          color: #94a3b8;
          padding: 4px 0;
          text-transform: uppercase;
        }
        .bisa-dp-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 3px;
        }
        .bisa-dp-day {
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          font-size: 13px;
          font-weight: 500;
          color: #1e293b;
          cursor: pointer;
          transition: all 0.12s ease;
          position: relative;
        }
        .bisa-dp-day:hover {
          background: #f0f9ff;
          color: #0284c7;
          font-weight: 600;
        }
        .bisa-dp-day.is-other-month {
          color: #cbd5e1;
        }
        .bisa-dp-day.is-today {
          border: 1.5px solid #38bdf8;
          color: #0284c7;
          font-weight: 700;
        }
        .bisa-dp-day.is-selected {
          background: #0076C5 !important;
          color: #ffffff !important;
          font-weight: 700;
          box-shadow: 0 2px 6px rgba(0, 118, 197, 0.35);
          border: none;
        }
        .bisa-dp-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 10px;
          padding-top: 8px;
          border-top: 1px solid #f1f5f9;
        }
        .bisa-dp-action-btn {
          background: transparent;
          border: none;
          font-family: 'Outfit', sans-serif;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          transition: all 0.12s ease;
        }
        .bisa-dp-btn-clear {
          color: #64748b;
        }
        .bisa-dp-btn-clear:hover {
          background: #fef2f2;
          color: #dc2626;
        }
        .bisa-dp-btn-today {
          color: #0076C5;
          font-weight: 700;
        }
        .bisa-dp-btn-today:hover {
          background: #f0f9ff;
          color: #0284c7;
        }
      `;
      document.head.appendChild(style);
    }

    let dpPopover = null;
    let dpTitle = null;
    let dpMonthText = null;
    let dpYearBtn = null;
    let dpYearText = null;
    let dpYearPanel = null;
    let dpYearRangeLabel = null;
    let dpYearGrid = null;
    let dpYearPrevRange = null;
    let dpYearNextRange = null;
    let dpCalendarBody = null;
    let dpGrid = null;
    let dpPrev = null;
    let dpNext = null;
    let dpClear = null;
    let dpToday = null;
    let dpActiveInput = null;
    let dpViewYear = new Date().getFullYear();
    let dpViewMonth = new Date().getMonth() + 1;
    let dpYearPageStart = dpViewYear - 4;
    let isYearPanelOpen = false;

    function toggleYearPanel(forceState) {
      isYearPanelOpen = typeof forceState === 'boolean' ? forceState : !isYearPanelOpen;
      if (isYearPanelOpen) {
        dpYearPageStart = dpViewYear - 4;
        renderYearGrid();
      }
      if (dpYearPanel) {
        dpYearPanel.classList.toggle('is-open', isYearPanelOpen);
      }
      if (dpYearBtn) {
        dpYearBtn.classList.toggle('is-active', isYearPanelOpen);
      }
      if (dpCalendarBody) {
        dpCalendarBody.style.display = isYearPanelOpen ? 'none' : 'block';
      }
    }

    function renderYearGrid() {
      if (!dpYearGrid || !dpYearRangeLabel) return;
      const startY = dpYearPageStart;
      const endY = startY + 11;
      dpYearRangeLabel.textContent = startY + ' - ' + endY;
      dpYearGrid.innerHTML = '';

      const currentRealYear = new Date().getFullYear();
      for (let y = startY; y <= endY; y++) {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'bisa-dp-year-cell';
        if (y === currentRealYear) cell.classList.add('is-current-year');
        if (y === dpViewYear) cell.classList.add('is-selected');
        cell.textContent = String(y);
        cell.setAttribute('data-year', String(y));
        dpYearGrid.appendChild(cell);
      }
    }

    function ensurePopoverElement() {
      let existing = document.getElementById('bisaDatePickerPopover');
      if (existing && !existing.__bisaUniversalBound) {
        // Replace legacy inline popover so all pages get the easy Year Picker
        const replacement = document.createElement('div');
        replacement.id = 'bisaDatePickerPopover';
        replacement.className = 'bisa-dp-popover';
        existing.parentNode.replaceChild(replacement, existing);
        existing = replacement;
      }

      dpPopover = existing;
      if (!dpPopover) {
        dpPopover = document.createElement('div');
        dpPopover.id = 'bisaDatePickerPopover';
        dpPopover.className = 'bisa-dp-popover';
        document.body.appendChild(dpPopover);
      }

      if (!dpPopover.__bisaUniversalBound) {
        dpPopover.__bisaUniversalBound = true;
        dpPopover.setAttribute('role', 'dialog');
        dpPopover.setAttribute('aria-modal', 'true');
        dpPopover.innerHTML =
          '<div class="bisa-dp-header">' +
            '<div class="bisa-dp-title" id="bisaDpTitle">' +
              '<span class="bisa-dp-month-text" id="bisaDpMonthText">Oktober</span>' +
              '<button type="button" class="bisa-dp-year-btn" id="bisaDpYearBtn" title="Klik untuk memilih tahun">' +
                '<span id="bisaDpYearText">2026</span>' +
                '<svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>' +
              '</button>' +
            '</div>' +
            '<div class="bisa-dp-navs">' +
              '<button type="button" class="bisa-dp-nav-btn" id="bisaDpPrev" aria-label="Bulan sebelumnya" title="Bulan sebelumnya">' +
                '<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg>' +
              '</button>' +
              '<button type="button" class="bisa-dp-nav-btn" id="bisaDpNext" aria-label="Bulan berikutnya" title="Bulan berikutnya">' +
                '<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>' +
              '</button>' +
            '</div>' +
          '</div>' +
          '<div class="bisa-dp-year-panel" id="bisaDpYearPanel">' +
            '<div class="bisa-dp-year-panel-header">' +
              '<button type="button" class="bisa-dp-nav-btn" id="bisaDpYearPrevRange" title="12 Tahun Sebelumnya">' +
                '<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg>' +
              '</button>' +
              '<span class="bisa-dp-year-range-label" id="bisaDpYearRangeLabel">2022 - 2033</span>' +
              '<button type="button" class="bisa-dp-nav-btn" id="bisaDpYearNextRange" title="12 Tahun Berikutnya">' +
                '<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>' +
              '</button>' +
            '</div>' +
            '<div class="bisa-dp-year-grid" id="bisaDpYearGrid"></div>' +
          '</div>' +
          '<div id="bisaDpCalendarBody">' +
            '<div class="bisa-dp-weekdays">' +
              '<div class="bisa-dp-weekday">Min</div>' +
              '<div class="bisa-dp-weekday">Sen</div>' +
              '<div class="bisa-dp-weekday">Sel</div>' +
              '<div class="bisa-dp-weekday">Rab</div>' +
              '<div class="bisa-dp-weekday">Kam</div>' +
              '<div class="bisa-dp-weekday">Jum</div>' +
              '<div class="bisa-dp-weekday">Sab</div>' +
            '</div>' +
            '<div class="bisa-dp-grid" id="bisaDpGrid"></div>' +
          '</div>' +
          '<div class="bisa-dp-footer">' +
            '<button type="button" class="bisa-dp-action-btn bisa-dp-btn-clear" id="bisaDpClear">Clear</button>' +
            '<button type="button" class="bisa-dp-action-btn bisa-dp-btn-today" id="bisaDpToday">Today</button>' +
          '</div>';

        dpTitle = document.getElementById('bisaDpTitle');
        dpMonthText = document.getElementById('bisaDpMonthText');
        dpYearBtn = document.getElementById('bisaDpYearBtn');
        dpYearText = document.getElementById('bisaDpYearText');
        dpYearPanel = document.getElementById('bisaDpYearPanel');
        dpYearRangeLabel = document.getElementById('bisaDpYearRangeLabel');
        dpYearGrid = document.getElementById('bisaDpYearGrid');
        dpYearPrevRange = document.getElementById('bisaDpYearPrevRange');
        dpYearNextRange = document.getElementById('bisaDpYearNextRange');
        dpCalendarBody = document.getElementById('bisaDpCalendarBody');
        dpGrid = document.getElementById('bisaDpGrid');
        dpPrev = document.getElementById('bisaDpPrev');
        dpNext = document.getElementById('bisaDpNext');
        dpClear = document.getElementById('bisaDpClear');
        dpToday = document.getElementById('bisaDpToday');

        if (dpYearBtn) {
          dpYearBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            toggleYearPanel();
          });
        }

        if (dpYearPrevRange) {
          dpYearPrevRange.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            dpYearPageStart -= 12;
            renderYearGrid();
          });
        }

        if (dpYearNextRange) {
          dpYearNextRange.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            dpYearPageStart += 12;
            renderYearGrid();
          });
        }

        if (dpYearGrid) {
          dpYearGrid.addEventListener('click', function (e) {
            e.stopPropagation();
            const cell = e.target.closest('.bisa-dp-year-cell');
            if (!cell) return;
            const chosenY = parseInt(cell.getAttribute('data-year'), 10);
            if (!isNaN(chosenY)) {
              dpViewYear = chosenY;
              toggleYearPanel(false);
              renderCalendarGrid();
            }
          });
        }

        if (dpPrev) {
          dpPrev.addEventListener('click', function (e) {
            e.stopPropagation();
            if (isYearPanelOpen) {
              dpYearPageStart -= 12;
              renderYearGrid();
              return;
            }
            dpViewMonth--;
            if (dpViewMonth < 1) { dpViewMonth = 12; dpViewYear--; }
            renderCalendarGrid();
          });
        }

        if (dpNext) {
          dpNext.addEventListener('click', function (e) {
            e.stopPropagation();
            if (isYearPanelOpen) {
              dpYearPageStart += 12;
              renderYearGrid();
              return;
            }
            dpViewMonth++;
            if (dpViewMonth > 12) { dpViewMonth = 1; dpViewYear++; }
            renderCalendarGrid();
          });
        }

        if (dpGrid) {
          dpGrid.addEventListener('click', function (e) {
            const dayCell = e.target.closest('.bisa-dp-day');
            if (!dayCell || !dpActiveInput) return;
            const chosenIso = dayCell.getAttribute('data-date');
            applyDateToInput(dpActiveInput, chosenIso);
            dpActiveInput.dispatchEvent(new Event('input', { bubbles: true }));
            dpActiveInput.dispatchEvent(new Event('change', { bubbles: true }));
            closePopover();
          });
        }

        if (dpClear) {
          dpClear.addEventListener('click', function (e) {
            e.stopPropagation();
            if (dpActiveInput) {
              applyDateToInput(dpActiveInput, '');
              dpActiveInput.dispatchEvent(new Event('input', { bubbles: true }));
              dpActiveInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
            closePopover();
          });
        }

        if (dpToday) {
          dpToday.addEventListener('click', function (e) {
            e.stopPropagation();
            if (dpActiveInput) {
              const todayIso = new Date().toISOString().split('T')[0];
              applyDateToInput(dpActiveInput, todayIso);
              dpActiveInput.dispatchEvent(new Event('input', { bubbles: true }));
              dpActiveInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
            closePopover();
          });
        }

        document.addEventListener('click', function (e) {
          if (!dpPopover || !dpPopover.classList.contains('is-open')) return;
          if (!e.target.closest('#bisaDatePickerPopover') && !e.target.closest('.bisa-datepicker-wrap')) {
            closePopover();
          }
        });

        window.addEventListener('resize', closePopover);
        window.addEventListener('scroll', function (e) {
          if (dpPopover && dpPopover.classList.contains('is-open')) {
            if (e.target && e.target.closest && e.target.closest('#bisaDatePickerPopover')) return;
            closePopover();
          }
        }, true);

        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape') closePopover();
        });
      }
    }

    function getRawVisibleValue(inputEl) {
      if (!inputEl) return '';
      if (nativeInputValueDesc && nativeInputValueDesc.get) {
        return String(nativeInputValueDesc.get.call(inputEl) || '').trim();
      }
      return String(inputEl.value || '').trim();
    }

    function setRawVisibleValue(inputEl, str) {
      if (!inputEl) return;
      if (nativeInputValueDesc && nativeInputValueDesc.set) {
        nativeInputValueDesc.set.call(inputEl, str);
      } else {
        inputEl.setAttribute('value', str);
      }
    }

    function getIsoFromInput(inputEl) {
      if (!inputEl) return '';
      if (inputEl.dataset.isoValue && /^\d{4}-\d{2}-\d{2}$/.test(inputEl.dataset.isoValue)) {
        return inputEl.dataset.isoValue;
      }
      if (inputEl.dataset.iso && /^\d{4}-\d{2}-\d{2}$/.test(inputEl.dataset.iso)) {
        return inputEl.dataset.iso;
      }
      const raw = getRawVisibleValue(inputEl);
      return displayToIso(raw);
    }

    function applyDateToInput(inputEl, isoOrDisplay) {
      if (!inputEl) return;
      const str = String(isoOrDisplay || '').trim();
      if (!str) {
        inputEl.dataset.isoValue = '';
        inputEl.dataset.iso = '';
        setRawVisibleValue(inputEl, '');
        return;
      }
      let iso = '';
      let disp = '';
      if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(str)) {
        const parts = str.split('-');
        iso = formatYMD(parts[0], parts[1], parts[2]);
        disp = isoToDisplay(iso);
      } else if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(str)) {
        iso = displayToIso(str);
        disp = isoToDisplay(iso);
      } else {
        iso = str;
        disp = str;
      }
      inputEl.dataset.isoValue = iso;
      inputEl.dataset.iso = iso;
      setRawVisibleValue(inputEl, disp);
    }

    function renderCalendarGrid() {
      if (!dpPopover || !dpGrid) return;
      if (dpMonthText && dpYearText) {
        dpMonthText.textContent = DP_MONTH_NAMES[dpViewMonth - 1];
        dpYearText.textContent = String(dpViewYear);
      } else if (dpTitle) {
        dpTitle.textContent = DP_MONTH_NAMES[dpViewMonth - 1] + ' ' + dpViewYear;
      }

      const firstDay = new Date(dpViewYear, dpViewMonth - 1, 1).getDay();
      const daysInMonth = new Date(dpViewYear, dpViewMonth, 0).getDate();
      const daysInPrevMonth = new Date(dpViewYear, dpViewMonth - 1, 0).getDate();

      const todayIso = new Date().toISOString().split('T')[0];
      const selectedIso = dpActiveInput ? getIsoFromInput(dpActiveInput) : '';

      dpGrid.innerHTML = '';

      for (let i = firstDay - 1; i >= 0; i--) {
        const d = daysInPrevMonth - i;
        let prevM = dpViewMonth - 1;
        let prevY = dpViewYear;
        if (prevM < 1) { prevM = 12; prevY--; }
        const iso = formatYMD(prevY, prevM, d);
        const cell = document.createElement('div');
        cell.className = 'bisa-dp-day is-other-month';
        cell.textContent = d;
        cell.setAttribute('data-date', iso);
        if (iso === selectedIso) cell.classList.add('is-selected');
        if (iso === todayIso) cell.classList.add('is-today');
        dpGrid.appendChild(cell);
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const iso = formatYMD(dpViewYear, dpViewMonth, d);
        const cell = document.createElement('div');
        cell.className = 'bisa-dp-day';
        cell.textContent = d;
        cell.setAttribute('data-date', iso);
        if (iso === selectedIso) cell.classList.add('is-selected');
        if (iso === todayIso) cell.classList.add('is-today');
        dpGrid.appendChild(cell);
      }

      const totalRendered = firstDay + daysInMonth;
      const totalCells = totalRendered > 35 ? 42 : 35;
      const remaining = totalCells - totalRendered;
      for (let d = 1; d <= remaining; d++) {
        let nextM = dpViewMonth + 1;
        let nextY = dpViewYear;
        if (nextM > 12) { nextM = 1; nextY++; }
        const iso = formatYMD(nextY, nextM, d);
        const cell = document.createElement('div');
        cell.className = 'bisa-dp-day is-other-month';
        cell.textContent = d;
        cell.setAttribute('data-date', iso);
        if (iso === selectedIso) cell.classList.add('is-selected');
        if (iso === todayIso) cell.classList.add('is-today');
        dpGrid.appendChild(cell);
      }
    }

    function openPopoverForInput(inputEl) {
      if (!inputEl || inputEl.disabled) return;
      ensurePopoverElement();
      dpActiveInput = inputEl;

      const currentIso = getIsoFromInput(inputEl);
      if (currentIso && /^\d{4}-\d{2}-\d{2}$/.test(currentIso)) {
        const parts = currentIso.split('-');
        dpViewYear = parseInt(parts[0], 10);
        dpViewMonth = parseInt(parts[1], 10);
      } else {
        const now = new Date();
        dpViewYear = now.getFullYear();
        dpViewMonth = now.getMonth() + 1;
      }

      toggleYearPanel(false);
      renderCalendarGrid();

      const rect = inputEl.getBoundingClientRect();
      let top = rect.bottom + 6;
      let left = rect.left;
      const popoverWidth = 290;
      const popoverHeight = 330;

      if (left + popoverWidth > window.innerWidth - 12) {
        left = window.innerWidth - popoverWidth - 12;
      }
      if (top + popoverHeight > window.innerHeight - 12) {
        top = Math.max(12, rect.top - popoverHeight - 6);
      }

      dpPopover.style.top = top + 'px';
      dpPopover.style.left = Math.max(12, left) + 'px';
      dpPopover.classList.add('is-open');
    }

    function closePopover() {
      if (dpPopover) {
        dpPopover.classList.remove('is-open');
      }
      toggleYearPanel(false);
      dpActiveInput = null;
    }

    function installValueAndTypeBridge(inputEl, isIsoMode) {
      if (inputEl.__bisaBridgeInstalled) return;
      inputEl.__bisaBridgeInstalled = true;

      // Prevent dynamic script assignment like input.type = 'date'
      try {
        Object.defineProperty(inputEl, 'type', {
          configurable: true,
          get: function () { return 'text'; },
          set: function (v) {
            if (String(v).toLowerCase() !== 'date') {
              inputEl.setAttribute('type', v);
            }
          }
        });
      } catch (e) {}

      // Seamless value getter/setter: displays dd/mm/yyyy on screen while returning YYYY-MM-DD to ISO scripts
      try {
        Object.defineProperty(inputEl, 'value', {
          configurable: true,
          get: function () {
            const raw = getRawVisibleValue(inputEl);
            if (!raw) return '';
            if (isIsoMode) {
              const iso = inputEl.dataset.isoValue || displayToIso(raw);
              return iso || raw;
            }
            return raw;
          },
          set: function (val) {
            applyDateToInput(inputEl, val);
          }
        });
      } catch (e) {}
    }

    function upgradeDateInput(inputEl) {
      if (!inputEl || inputEl.__bisaDatePickerUpgraded) return;
      // Ensure universal popover with Year Selector replaces any legacy inline popover
      ensurePopoverElement();

      const wasNativeWrapped = Boolean(inputEl.closest('.bisa-datepicker-wrap'));

      // Skip readonly calculated display fields (like view modals or automatic readonly fields)
      const id = inputEl.id || '';
      if (id.toLowerCase().startsWith('view') || inputEl.classList.contains('is-muted') || inputEl.classList.contains('is-calc')) {
        return;
      }
      // Skip payroll custom month picker #crudPeriode in accounting_payroll.html
      if (id === 'crudPeriode' && (document.getElementById('payrollMonthModal') || document.getElementById('payrollMonthPickerPopover'))) {
        return;
      }

      inputEl.__bisaDatePickerUpgraded = true;

      const origType = (inputEl.getAttribute('type') || '').toLowerCase();
      const origOnFocus = inputEl.getAttribute('onfocus') || '';
      const origVal = getRawVisibleValue(inputEl);
      const isIsoMode = !wasNativeWrapped && (origType === 'date' || origOnFocus.includes('date') || /^\d{4}-\d{2}-\d{2}$/.test(origVal));

      inputEl.removeAttribute('onfocus');
      inputEl.removeAttribute('onblur');
      inputEl.setAttribute('type', 'text');
      inputEl.setAttribute('autocomplete', 'off');
      if (!inputEl.getAttribute('placeholder')) {
        inputEl.setAttribute('placeholder', 'dd/mm/yyyy');
      }
      inputEl.classList.add('bisa-datepicker-input');

      if (!wasNativeWrapped) {
        installValueAndTypeBridge(inputEl, isIsoMode);
        if (origVal) {
          applyDateToInput(inputEl, origVal);
        }
      }

      let wrap = inputEl.closest('.bisa-datepicker-wrap');
      if (!wrap) {
        wrap = document.createElement('div');
        const isCompact = inputEl.classList.contains('dash-date-input') ||
                          inputEl.classList.contains('lr-date-input') ||
                          inputEl.classList.contains('ak-date-input');
        wrap.className = 'bisa-datepicker-wrap' + (isCompact ? ' is-compact' : '');
        inputEl.parentNode.insertBefore(wrap, inputEl);
        wrap.appendChild(inputEl);

        const iconSpan = document.createElement('span');
        iconSpan.className = 'bisa-datepicker-icon';
        iconSpan.innerHTML = CALENDAR_ICON_SVG;
        wrap.appendChild(iconSpan);
      }

      const iconEl = wrap.querySelector('.bisa-datepicker-icon');
      if (iconEl && !iconEl.__bisaUniversalIconBound) {
        iconEl.__bisaUniversalIconBound = true;
        iconEl.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          openPopoverForInput(inputEl);
        }, true);
      }

      inputEl.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        openPopoverForInput(inputEl);
      }, true);

      inputEl.addEventListener('blur', function () {
        const raw = getRawVisibleValue(inputEl);
        const iso = displayToIso(raw);
        if (iso) {
          applyDateToInput(inputEl, iso);
        }
      });
    }

    function scanAndUpgradeAllDateInputs() {
      injectBisaDatePickerStyles();
      const selector = [
        'input[type="date"]',
        'input[onfocus*="date"]',
        'input.bisa-datepicker-input',
        '#formTanggalBayar',
        '#formJatuhTempo',
        '#formPeriode',
        '#crudTglPinjam',
        '#crudJatuhTempo',
        '#crudTanggalBayar',
        '#crudTanggalBeli',
        '#crudMulaiDiPakai',
        '#crudTanggalPelepasan',
        '#crudTanggal',
        '#crudTanggalMulai',
        '#crudTanggalSelesai',
        '#crudTanggalStorLama',
        '#crudPeriode',
        '#customDateStart',
        '#customDateEnd',
        '#karyawanSelesaiKontrak',
        '#schedDateInput',
        '#inputTimelineMulai',
        '#inputTimelineSelesai'
      ].join(',');

      document.querySelectorAll(selector).forEach(upgradeDateInput);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', scanAndUpgradeAllDateInputs);
    } else {
      scanAndUpgradeAllDateInputs();
    }
    setTimeout(scanAndUpgradeAllDateInputs, 150);
  })();

  // Jaminan body selalu visible dan ready
  markSidebarReady();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', markSidebarReady);
  }

  window.bmRenderSidebar = renderAppSidebar;
  window.bmRenderSidebarEngine = renderAppSidebar;
  window.renderAppFooter = renderAppFooter;
  window.initHirezyPagination = initSpvTablePagination;

  // Inisialisasi Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  } else {
    triggerLucideIcons();
  }
})();

