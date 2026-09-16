// sidebar_engine.js - Full & Faithful Company Edition (State, Hierarchy & Responsive Standard)
(function () {
  'use strict';

  window.__bmSidebarEngineLoaded = true;

  // 1. Tentukan Root Prefix secara dinamis
  let depth = 1;
  const normalizedPath = window.location.pathname.replace(/\\/g, '/');
  const segments = normalizedPath.split('/').filter(Boolean);
  const folderIndex = segments.findIndex(s => ['bm', 'spvkol', 'staffkol'].includes(s.toLowerCase()));
  if (folderIndex !== -1) {
    depth = segments.length - folderIndex - 1;
  }
  const rootPrefix = depth > 0 ? '../'.repeat(depth) : '';
  const currentFile = normalizedPath.split('/').pop() || 'BM_dashboard.html';

  // 2. Deteksi Role Pengguna berdasarkan path halaman
  let role = 'admin';
  const lowerPath = normalizedPath.toLowerCase();
  if (lowerPath.includes('/bm/')) role = 'admin';
  else if (lowerPath.includes('/spvkol/')) role = 'spv_kol';
  else if (lowerPath.includes('/staffkol/')) role = 'staff_kol';
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
      
      { type: 'heading', label: 'Manajemen Karyawan' },
      { 
        type: 'group', label: 'Data Karyawan', icon: 'users', id: 'm-bm-karyawan',
        children: [
          { label: 'Karyawan', link: 'BM/data_karyawan/BM_karyawan.html' },
          { label: 'Kontrak Karyawan', link: 'BM/data_karyawan/BM_Kontrak.html' },
          { label: 'Kegiatan Karyawan', link: 'BM/data_karyawan/BM_kegiatan_karyawan.html' }
        ]
      },
      { 
        type: 'group', label: 'Tugas & Pekerjaan', icon: 'task', id: 'm-bm-tugas',
        children: [
          { label: 'Instruksi Tugas', link: 'BM/tugas_pekerjaan/BM_instruksi_tugas.html' },
          { label: 'RRK', link: 'BM/tugas_pekerjaan/BM_rrk.html' },
          { label: 'Report Pengerjaan', link: 'BM/tugas_pekerjaan/BM_report_pengerjaan.html' }
        ]
      },
      { 
        type: 'group', label: 'Absensi', icon: 'clock', id: 'm-bm-absensi',
        children: [
          { label: 'Kehadiran', link: 'BM/absensi/BM_kehadiran.html' },
          { label: 'Presensi Istirahat', link: 'BM/absensi/BM_presensi_istirahat.html' },
          { label: 'Presensi Lembur', link: 'BM/absensi/BM_presensi_lembur.html' },
          { label: 'Skenario Jam Kerja', link: 'BM/absensi/BM_skenario_jam_kerja.html' }
        ]
      },
      {
        type: 'group', label: 'Penilaian', icon: 'star', id: 'm-bm-penilaian',
        children: [
          { label: 'Penilaian Karyawan', link: 'BM/penilaian/BM_penilaian_karyawan.html' }
        ]
      },

      { type: 'heading', label: 'Perusahaan & Dokumen' },
      {
        type: 'group', label: 'Dokumen & Kolaborasi', icon: 'folder', id: 'm-bm-dokumen',
        children: [
          { label: 'Folder', link: 'BM/dokumen_kolaborasi/BM_folder.html' }
        ]
      },
      {
        type: 'group', label: 'Perusahaan', icon: 'buildings', id: 'm-bm-perusahaan',
        children: [
          { label: 'Profil Perusahaan', link: 'BM/perusahaan/BM_profil_perusahaan.html' },
          { label: 'Sub Perusahaan', link: 'BM/perusahaan/BM_subperusahaan.html' },
          { label: 'Divisi', link: 'BM/perusahaan/BM_divisi.html' },
          { label: 'Jabatan', link: 'BM/perusahaan/BM_jabatan.html' },
          { label: 'Struktur Perusahaan', link: 'BM/perusahaan/BM_struktur_perusahaan.html' }
        ]
      }
    ],
    spv_kol: [
      { type: 'heading', label: 'Menu Utama' },
      { type: 'item', label: 'Dashboard', icon: 'home', link: 'SpvKol/spvkol_dashboard.html' },
      { type: 'item', label: 'Kalender', icon: 'calendar', link: 'SpvKol/spvkol_kalender.html' },

      { type: 'heading', label: 'Operasional KOL' },
      { 
        type: 'group', label: 'Absensi', icon: 'clock', id: 'm-spv-absensi',
        children: [
          { label: 'Kehadiran', link: 'SpvKol/absensi/spvkol_kehadiran.html' },
          { label: 'Presensi Istirahat', link: 'SpvKol/absensi/spvkol_presensi_istirahat.html' },
          { label: 'Presensi Lembur', link: 'SpvKol/absensi/spvkol_presensi_lembur.html' }
        ]
      },
      { 
        type: 'group', label: 'Oprasional', icon: 'briefcase', id: 'm-spv-oprasional',
        children: [
          { label: 'Dashboard Campaign', link: 'SpvKol/operasional/spvkol_dashboard_campaign.html' },
          { label: 'Campaign', link: 'SpvKol/operasional/spvkol_campaign.html' },
          { label: 'Kreator', link: 'SpvKol/operasional/spvkol_kreator.html' },
          { label: 'Tracking Sampel', link: 'SpvKol/operasional/spvkol_tracking_sampel.html' },
          { label: 'Performa Kreator', link: 'SpvKol/operasional/spvkol_Performa_Kreator.html' }
        ]
      },

      { type: 'heading', label: 'Manajemen Kerja' },
      {
        type: 'group', label: 'Dokumen & Kolaborasi', icon: 'folder', id: 'm-spv-dokumen',
        children: [
          { label: 'My Folders', link: 'SpvKol/dokumen_kolaborasi/spvkol_folder.html' }
        ]
      },
      { 
        type: 'group', label: 'Perancangan Kerja', icon: 'task', id: 'm-spv-perancangan',
        children: [
          { label: 'RRK', link: 'SpvKol/perancangan_kerja/spvkol_rrk.html' },
          { label: 'Milestone', link: 'SpvKol/perancangan_kerja/spvkol_Milestone.html' },
          { label: 'Tugas', link: 'SpvKol/perancangan_kerja/spvkol_tugas.html' },
          { label: 'Project', link: 'SpvKol/perancangan_kerja/spvkol_project.html' },
          { label: 'Laporan', link: 'SpvKol/perancangan_kerja/spvkol_laporan.html' },
          { label: 'Pengaduan', link: 'SpvKol/perancangan_kerja/spvkol_pengaduan.html' }
        ]
      },
      {
        type: 'group', label: 'Kinerja', icon: 'chart', id: 'm-spv-kinerja',
        children: [
          { label: 'Evaluasi Kinerja', link: 'SpvKol/kinerja/spvkol_evaluasi_kinerja.html' },
          { label: 'Target & Capaian Kerja', link: 'SpvKol/kinerja/spvkol_target_capaian.html' },
          { label: 'Upgrade Skill', link: 'SpvKol/kinerja/spvkol_upgrade_skill.html' },
          { label: 'Rencana Karier', link: 'SpvKol/kinerja/spvkol_rencana_karier.html' }
        ]
      },
      {
        type: 'group', label: 'Data Master', icon: 'tag', id: 'm-spv-master',
        children: [
          { label: 'Brand', link: 'SpvKol/data_master/spvkol_Brand.html' },
          { label: 'Kategori Produk', link: 'SpvKol/data_master/master_pendukung/spvkol_Kategori_Produk.html' },
          { label: 'Leads Kreator', link: 'SpvKol/data_master/master_pendukung/spvkol_Leads_Kreator.html' },
          { label: 'Leveling Kreator', link: 'SpvKol/data_master/master_pendukung/spvkol_Leveling_Kreator.html' },
          { label: 'Ads Account', link: 'SpvKol/data_master/master_pendukung/spvkol_Ads_Account.html' }
        ]
      }
    ],
    staff_kol: [
      { type: 'heading', label: 'Menu Utama' },
      { type: 'item', label: 'Dashboard', icon: 'home', link: 'StaffKol/staffkol_dashboard.html' },
      { type: 'item', label: 'Kalender', icon: 'calendar', link: 'StaffKol/staffkol_kalender.html' },

      { type: 'heading', label: 'Operasional Staff' },
      { 
        type: 'group', label: 'Kehadiran', icon: 'clock', id: 'm-staff-kehadiran',
        children: [
          { label: 'Kehadiran', link: 'StaffKol/absensi/staffkol_kehadiran.html' },
          { label: 'Presensi Istirahat', link: 'StaffKol/absensi/staffkol_presensi_istirahat.html' },
          { label: 'Presensi Lembur', link: 'StaffKol/absensi/staffkol_presensi_lembur.html' }
        ]
      },
      { 
        type: 'group', label: 'Operasional', icon: 'briefcase', id: 'm-staff-operasional',
        children: [
          { label: 'Dashboard Campaign', link: 'StaffKol/operasional/staffkol_dashboard_campaign.html' },
          { label: 'Campaign', link: 'StaffKol/operasional/staffkol_campaign.html' },
          { label: 'Tracking Sampel', link: 'StaffKol/operasional/staffkol_tracking_sampel.html' },
          { label: 'Kreator', link: 'StaffKol/operasional/staffkol_kreator.html' },
          { label: 'Tracking Kreator', link: 'StaffKol/operasional/staffkol_operasional.html' },
          { label: 'Performa Kreator', link: 'StaffKol/operasional/staffkol_Performa_Kreator.html' }
        ]
      },

      { type: 'heading', label: 'Manajemen Kerja' },
      {
        type: 'group', label: 'Dokumen & Kolaborasi', icon: 'folder', id: 'm-staff-dokumen',
        children: [
          { label: 'My Folders', link: 'StaffKol/dokumen_kolaborasi/staffkol_folder.html' }
        ]
      },
      { 
        type: 'group', label: 'Perancangan Kerja', icon: 'task', id: 'm-staff-perancangan',
        children: [
          { label: 'RRK', link: 'StaffKol/perancangan_kerja/staffkol_rrk.html' },
          { label: 'Milestone', link: 'StaffKol/perancangan_kerja/staffkol_Milestone.html' },
          { label: 'Tugas', link: 'StaffKol/perancangan_kerja/staffkol_tugas.html' },
          { label: 'Project', link: 'StaffKol/perancangan_kerja/staffkol_project.html' },
          { label: 'Laporan', link: 'StaffKol/perancangan_kerja/staffkol_laporan.html' },
          { label: 'Pengaduan', link: 'StaffKol/perancangan_kerja/staffkol_pengaduan.html' }
        ]
      },
      {
        type: 'group', label: 'Kinerja', icon: 'chart', id: 'm-staff-kinerja',
        children: [
          { label: 'Evaluasi Kinerja', link: 'StaffKol/kinerja/staffkol_evaluasi_kinerja.html' },
          { label: 'Target & Capaian Kerja', link: 'StaffKol/kinerja/staffkol_target_capaian.html' },
          { label: 'Upgrade Skill', link: 'StaffKol/kinerja/staffkol_upgrade_skill.html' },
          { label: 'Rencana Karier', link: 'StaffKol/kinerja/staffkol_rencana_karier.html' }
        ]
      }
    ]
  };

  // 4. Koleksi Ikon Modern Monoline (24x24, Bold 2.2px Stroke, Corporate Style)
  const icons = {
    home: `<svg class="app-nav-icon" viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7.5" height="8.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="5.5" rx="2"/><rect x="13.5" y="11.5" width="7.5" height="9.5" rx="2"/><rect x="3" y="14.5" width="7.5" height="6.5" rx="2"/></svg>`,
    calendar: `<svg class="app-nav-icon" viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="3"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    book: `<svg class="app-nav-icon" viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 016.5 2H20v20H6.5a2.5 2.5 0 01-2.5-2.5z"/><path d="M6 6h10"/><path d="M6 10h10"/><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/></svg>`,
    spv: `<svg class="app-nav-icon" viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L3 7v6c0 5.5 3.8 10 9 11 5.2-1 9-5.5 9-11V7l-9-5z"/><circle cx="12" cy="11" r="2.5"/></svg>`,
    staff: `<svg class="app-nav-icon" viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"/><path d="M5.5 21v-2a6.5 6.5 0 0113 0v2"/></svg>`,
    users: `<svg class="app-nav-icon" viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="3.5"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a3.5 3.5 0 010 6.75"/></svg>`,
    task: `<svg class="app-nav-icon" viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>`,
    clock: `<svg class="app-nav-icon" viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>`,
    star: `<svg class="app-nav-icon" viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    folder: `<svg class="app-nav-icon" viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>`,
    buildings: `<svg class="app-nav-icon" viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2"/><path d="M10 21v-3h4v3"/></svg>`,
    briefcase: `<svg class="app-nav-icon" viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="3"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="2" y1="12" x2="22" y2="12"/></svg>`,
    chart: `<svg class="app-nav-icon" viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/><path d="M3 20h18"/></svg>`,
    tag: `<svg class="app-nav-icon" viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6"/></svg>`
  };

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
  };

  const activeList = menus[role] || menus['admin'];
  let menuHtml = '';
  let isFirstHeading = true;

  activeList.forEach(m => {
    if (m.type === 'heading') {
      menuHtml += `
        <li class="sidebar-heading-item" style="list-style:none;margin:${isFirstHeading ? '4px 6px 4px 6px' : '14px 6px 4px 6px'};padding:${isFirstHeading ? '4px 8px' : '10px 8px 4px 8px'};border-top:${isFirstHeading ? 'none' : '1px solid #f1f5f9'};font-size:9.5px;font-weight:700;color:#94a3b8;letter-spacing:0.8px;text-transform:uppercase;">
          <span>${m.label}</span>
        </li>`;
      isFirstHeading = false;
    } else if (m.type === 'item') {
      const fullLink = rootPrefix + m.link;
      const isActive = currentFile.toLowerCase() === m.link.split('/').pop().toLowerCase();
      menuHtml += `
        <li style="list-style:none;margin:0 0 3px 0;padding:0;">
          <a href="${fullLink}" class="app-nav-item ${isActive ? 'is-active' : ''}" style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:10px;font-size:13px;text-decoration:none;transition:all 0.2s cubic-bezier(0.4, 0, 0.2, 1);${isActive ? 'background-color:#0284c7;color:#ffffff;font-weight:600;box-shadow:0 3px 8px rgba(2,132,199,0.25);' : 'color:#475569;font-weight:500;'}">
            ${icons[m.icon] || ''}
            <span>${m.label}</span>
          </a>
        </li>`;
    } else if (m.type === 'group') {
      let subHtml = '';
      let isGroupActive = false;
      m.children.forEach(sub => {
        const fullSubLink = rootPrefix + sub.link;
        const isSubActive = currentFile.toLowerCase() === sub.link.split('/').pop().toLowerCase();
        if (isSubActive) isGroupActive = true;
        subHtml += `
          <li style="list-style:none;margin:1px 0;padding:0;">
            <a href="${fullSubLink}" class="app-sub-item ${isSubActive ? 'is-active' : ''}" style="display:flex;align-items:center;gap:8px;padding:6px 12px 6px 28px;font-size:12.5px;text-decoration:none;border-radius:8px;transition:all 0.2s cubic-bezier(0.4, 0, 0.2, 1);${isSubActive ? 'background-color:#0284c7;color:#ffffff;font-weight:600;box-shadow:0 2px 6px rgba(2,132,199,0.2);' : 'color:#64748b;font-weight:500;'}">
              <span style="width:4px;height:4px;border-radius:50%;background-color:${isSubActive ? '#ffffff' : '#cbd5e1'};flex-shrink:0;"></span>
              <span>${sub.label}</span>
            </a>
          </li>`;
      });

      menuHtml += `
        <li style="list-style:none;margin-top:4px;padding:0;">
          <div onclick="window.bmToggleGroup(this)" data-target="${m.id}" data-expanded="${isGroupActive ? 'true' : 'false'}"
               class="app-group-header" tabindex="0"
               style="display:flex;align-items:center;justify-content:space-between;padding:7px 10px;font-size:12.5px;font-weight:600;color:#334155;cursor:pointer;border-radius:8px;transition:all 0.2s cubic-bezier(0.4, 0, 0.2, 1);">
            <div style="display:flex;align-items:center;gap:8px;">
              ${icons[m.icon] || ''}
              <span>${m.label}</span>
            </div>
            <svg class="chev" style="width:13px;height:13px;color:#94a3b8;transition:transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);transform:${isGroupActive ? 'rotate(0deg)' : 'rotate(-90deg)'};" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
          </div>
          <ul id="${m.id}" class="sidebar-submenu ${isGroupActive ? 'is-expanded' : ''}">${subHtml}</ul>
        </li>`;
    }
  });

  let homeLink = `${rootPrefix}BM/BM_dashboard.html`;
  if (role === 'spv_kol') homeLink = `${rootPrefix}SpvKol/spvkol_dashboard.html`;
  else if (role === 'staff_kol') homeLink = `${rootPrefix}StaffKol/staffkol_dashboard.html`;

  const sidebarDOM = `
    <style>
      #app-sidebar-box {
        scroll-behavior: smooth;
      }
      #app-sidebar-box::-webkit-scrollbar { width: 4px; }
      #app-sidebar-box::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
      #app-sidebar-box::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }

      /* Animasi Halus Dropdown Submenu */
      .sidebar-submenu {
        max-height: 0;
        opacity: 0;
        overflow: hidden;
        margin: 0;
        padding: 0;
        list-style: none;
        transition: max-height 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), margin 0.25s ease;
      }
      .sidebar-submenu.is-expanded {
        max-height: 500px;
        opacity: 1;
        margin: 2px 0 4px 0;
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

      /* 1. Normal State */
      .app-nav-item,
      .app-sub-item {
        position: relative;
        outline: none;
      }

      /* 2. Hover State (HANYA untuk item yang TIDAK aktif & TIDAK disabled) */
      .app-nav-item:not(.is-active):not(.is-disabled):hover {
        background-color: #f1f5f9 !important;
        color: #0284c7 !important;
        transform: translateX(2px);
      }
      .app-sub-item:not(.is-active):not(.is-disabled):hover {
        background-color: #f8fafc !important;
        color: #0284c7 !important;
        transform: translateX(2px);
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
      .app-nav-item.is-active,
      .app-nav-item.is-active:hover,
      .app-nav-item.is-active:focus,
      .app-nav-item.is-active:active {
        background-color: #0284c7 !important;
        color: #ffffff !important;
        font-weight: 600 !important;
        box-shadow: 0 3px 8px rgba(2, 132, 199, 0.25) !important;
        cursor: default !important;
        transform: none !important;
      }
      .app-sub-item.is-active,
      .app-sub-item.is-active:hover,
      .app-sub-item.is-active:focus,
      .app-sub-item.is-active:active {
        background-color: #0284c7 !important;
        color: #ffffff !important;
        font-weight: 600 !important;
        box-shadow: 0 2px 6px rgba(2, 132, 199, 0.2) !important;
        cursor: default !important;
        transform: none !important;
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
      .sidebar-brand-header:hover .brand-logo-frame {
        transform: scale(1.05) rotate(-1deg);
        box-shadow: 0 4px 12px rgba(2, 132, 199, 0.22);
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
        #app-sidebar-inner {
          transform: translateX(-100%);
        }
        #app-sidebar.is-open #app-sidebar-inner {
          transform: translateX(0);
          box-shadow: 0 10px 40px rgba(15, 23, 42, 0.25);
        }
        .dashboard-shell,
        .layout-page {
          margin-left: 0 !important;
          width: 100% !important;
        }
      }

      /* Responsivitas: Desktop (>= 1024px) */
      @media (min-width: 1024px) {
        #app-sidebar-inner {
          transform: translateX(0) !important;
        }
        #sidebar-backdrop {
          display: none !important;
        }
      }
    </style>
    <div id="app-sidebar-inner">
      <div>
        <!-- Logo Brand (Aesthetic, Larger & Prominent) -->
        <a href="${homeLink}" class="sidebar-brand-header" style="padding:18px 16px 14px 16px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #f1f5f9;text-decoration:none;">
          <div class="brand-logo-frame" style="width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);border:1.5px solid #bae6fd;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(2, 132, 199, 0.12);flex-shrink:0;transition:all 0.25s cubic-bezier(0.4, 0, 0.2, 1);">
            <img src="${rootPrefix}media/logo.png" style="width:30px;height:30px;object-fit:contain;" alt="Logo Bisa Media" onerror="this.style.display='none'" />
          </div>
          <div style="display:flex;flex-direction:column;justify-content:center;">
            <span style="font-size:20.5px;font-weight:800;color:#0f172a;letter-spacing:-0.7px;font-family:'Plus Jakarta Sans','Outfit',system-ui,sans-serif;line-height:1.15;">Bisa Media</span>
            <span style="font-size:9.5px;font-weight:700;color:#0284c7;letter-spacing:1.1px;text-transform:uppercase;margin-top:2px;">MCN Platform</span>
          </div>
        </a>
        <!-- Scrollable Navigation Menu -->
        <div id="app-sidebar-box" style="overflow-y:auto;max-height:calc(100vh - 142px);padding:6px 10px;">
          <ul style="margin:0;padding:0;list-style:none;">${menuHtml}</ul>
        </div>
      </div>
      <!-- User Footer Card -->
      <div style="padding:10px 14px;border-top:1px solid #f1f5f9;background:#fafafa;display:flex;align-items:center;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:8px;">
          <img src="${rootPrefix}media/avatar.png" style="width:30px;height:30px;border-radius:50%;object-fit:cover;" onerror="this.style.display='none'" />
          <div>
            <div style="font-size:12.5px;font-weight:600;color:#1e293b;">Rayi</div>
            <div style="font-size:10px;color:#0284c7;font-weight:700;letter-spacing:0.5px;">${role.replace('_', ' ').toUpperCase()}</div>
          </div>
        </div>
        <a href="${rootPrefix}login.html" title="Logout" style="color:#94a3b8;display:flex;align-items:center;text-decoration:none;padding:4px;border-radius:6px;transition:color 0.15s ease;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#94a3b8'">
          <svg style="width:16px;height:16px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
        </a>
      </div>
    </div>
  `;

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
    container.innerHTML = sidebarDOM;

    // Reset & Rapikan Layout Utama (Mencegah Double Margin & Celah Lebar)
    const shell = document.querySelector('.dashboard-shell') || 
                  document.querySelector('.layout-page') || 
                  document.querySelector('.layout-container');
    if (shell) {
      if (window.innerWidth >= 1024) {
        shell.style.setProperty('margin-left', '240px', 'important');
        shell.style.setProperty('width', 'calc(100% - 240px)', 'important');
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

    document.querySelectorAll('.dashboard-shell .topbar').forEach(el => {
      el.style.setProperty('margin-left', '24px', 'important');
      el.style.setProperty('margin-right', '24px', 'important');
      el.style.setProperty('margin-top', '18px', 'important');
      el.style.setProperty('width', 'calc(100% - 48px)', 'important');
      el.style.setProperty('box-sizing', 'border-box', 'important');
    });

    // Reset Sneat BM containers
    document.querySelectorAll('.layout-page .container-xxl, .layout-page .container-p-y').forEach(el => {
      el.style.setProperty('padding-left', '1.5rem', 'important');
      el.style.setProperty('padding-right', '1.5rem', 'important');
      el.style.setProperty('max-width', '100%', 'important');
    });

    // Selesaikan animasi progress bar saat halaman baru selesai dimuat
    const existingBar = document.getElementById('bm-nav-progress');
    if (existingBar) {
      existingBar.style.width = '100%';
      setTimeout(() => {
        existingBar.style.opacity = '0';
        setTimeout(() => existingBar.remove(), 250);
      }, 150);
    }
  }

  // 6. Smooth Feature Transition Handler (Navigasi Antar-Fitur Sangat Halus & Responsif)
  document.addEventListener('click', function (e) {
    // Abaikan jika membuka di tab baru (ctrl/meta/shift atau klik non-kiri)
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;

    const link = e.target.closest('.app-nav-item:not(.is-active):not(.is-disabled), .app-sub-item:not(.is-active):not(.is-disabled)');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || link.target === '_blank' || href.startsWith('http')) return;

    // Tutup drawer jika di mobile
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar && sidebar.classList.contains('is-open')) {
      sidebar.classList.remove('is-open');
      if (backdrop) backdrop.classList.remove('is-visible');
    }

    // 1. Feedback visual seketika pada menu item yang diklik
    document.querySelectorAll('.app-nav-item.is-active, .app-sub-item.is-active').forEach(el => {
      el.classList.remove('is-active');
      el.style.backgroundColor = 'transparent';
      el.style.color = '#475569';
      el.style.boxShadow = 'none';
      el.style.fontWeight = '500';
      const dot = el.querySelector('span[style*="border-radius"]');
      if (dot) dot.style.backgroundColor = '#cbd5e1';
    });

    link.classList.add('is-active');
    link.style.backgroundColor = '#0284c7';
    link.style.color = '#ffffff';
    link.style.fontWeight = '600';
    link.style.boxShadow = '0 3px 8px rgba(2,132,199,0.25)';
    const newDot = link.querySelector('span[style*="border-radius"]');
    if (newDot) newDot.style.backgroundColor = '#ffffff';

    // 2. Progress bar ultra halus di bagian paling atas (SaaS style loading)
    let bar = document.getElementById('bm-nav-progress');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'bm-nav-progress';
      bar.style.cssText = 'position:fixed;top:0;left:0;height:2.5px;width:0%;background:linear-gradient(90deg,#0284c7,#38bdf8);z-index:99999;transition:width 0.28s cubic-bezier(0.4,0,0.2,1);box-shadow:0 0 10px rgba(56,189,248,0.7);pointer-events:none;';
      document.body.appendChild(bar);
    }
    bar.style.opacity = '1';
    bar.style.width = '35%';
    requestAnimationFrame(() => {
      bar.style.width = '80%';
    });

    // 3. Efek Outro Tenang (Tanpa pergeseran posisi / translateY)
    const content = document.querySelector('.dashboard-shell') || 
                    document.querySelector('.layout-page') || 
                    document.querySelector('main');
    if (content) {
      content.style.transition = 'opacity 0.12s ease';
      content.style.opacity = '0.9';
    }
  });

  // 7. Responsive Mobile / Tablet Drawer Toggle Handler
  document.addEventListener('click', function (e) {
    const toggleBtn = e.target.closest('#sidebarToggle, .layout-menu-toggle, [data-action="toggle-sidebar"]');
    if (toggleBtn) {
      e.preventDefault();
      const sidebar = document.getElementById('app-sidebar');
      const backdrop = document.getElementById('sidebar-backdrop');
      if (sidebar) {
        const isOpen = sidebar.classList.toggle('is-open');
        if (backdrop) {
          if (isOpen) backdrop.classList.add('is-visible');
          else backdrop.classList.remove('is-visible');
        }
      }
      return;
    }

    // Klik pada backdrop menutup drawer
    const backdropEl = e.target.closest('#sidebar-backdrop');
    if (backdropEl) {
      const sidebar = document.getElementById('app-sidebar');
      if (sidebar) sidebar.classList.remove('is-open');
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
        if (backdrop) backdrop.classList.remove('is-visible');
      }
    }
  });

  // Handle resize event untuk responsivitas dinamis
  window.addEventListener('resize', function () {
    const shell = document.querySelector('.dashboard-shell') || 
                  document.querySelector('.layout-page') || 
                  document.querySelector('.layout-container');
    if (shell) {
      if (window.innerWidth >= 1024) {
        shell.style.setProperty('margin-left', '240px', 'important');
        shell.style.setProperty('width', 'calc(100% - 240px)', 'important');
      } else {
        shell.style.setProperty('margin-left', '0', 'important');
        shell.style.setProperty('width', '100%', 'important');
      }
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAppSidebar);
  } else {
    renderAppSidebar();
  }

  window.bmRenderSidebar = renderAppSidebar;
  window.bmRenderSidebarEngine = renderAppSidebar;
})();
