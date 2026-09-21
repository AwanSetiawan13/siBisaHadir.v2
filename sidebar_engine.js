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
        type: 'group', label: 'Operasional', icon: 'briefcase', id: 'm-spv-operasional',
        children: [
          { label: 'Dashboard Campaign', link: 'SpvKol/operasional/spvkol_dashboard_campaign.html' },
          { label: 'Campaign', link: 'SpvKol/operasional/spvkol_campaign.html' },
          { label: 'Kreator', link: 'SpvKol/operasional/spvkol_kreator.html' },
          { label: 'Tracking Sampel', link: 'SpvKol/operasional/spvkol_tracking_sampel.html' },
          { label: 'Performa Kreator', link: 'SpvKol/operasional/spvkol_Performa_Kreator.html' }
        ]
      },
      { 
        type: 'group', label: 'Brands', icon: 'brand', id: 'm-spv-brands',
        children: [
          { label: 'Dashboard Brands', link: 'SpvKol/brand/spvkol_dashboard_brand.html' },
          { label: 'Data Brands', link: 'SpvKol/brand/spvkol_data_brand.html' },
          { label: 'Produk & Brands', link: 'SpvKol/brand/spvkol_produk_brand.html' }
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

  // 4. Koleksi Mapping Ikon Lucide Modern (24x24, Clean & Consistent)
  const lucideIconMap = {
    home: 'layout-dashboard',
    calendar: 'calendar-days',
    book: 'book-open',
    spv: 'user-check',
    staff: 'users',
    users: 'users',
    task: 'clipboard-list',
    clock: 'clock',
    star: 'star',
    folder: 'folder',
    buildings: 'building-2',
    briefcase: 'package-check',
    chart: 'trending-up',
    tag: 'tags',
    brand: 'sparkles'
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
            ${renderLucideIcon(m.icon)}
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
              ${renderLucideIcon(m.icon)}
              <span>${m.label}</span>
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
    <div id="app-sidebar-inner" style="height:100vh;max-height:100vh;display:flex;flex-direction:column;box-sizing:border-box;overflow:hidden;">
      <!-- Logo Brand (Aesthetic, Larger & Prominent) -->
      <a href="${homeLink}" class="sidebar-brand-header" style="padding:18px 16px 14px 16px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #f1f5f9;text-decoration:none;flex-shrink:0;">
        <div class="brand-logo-frame" style="width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);border:1.5px solid #bae6fd;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(2, 132, 199, 0.12);flex-shrink:0;transition:all 0.25s cubic-bezier(0.4, 0, 0.2, 1);">
          <img src="${rootPrefix}media/logo.png" style="width:30px;height:30px;object-fit:contain;" alt="Logo Bisa Media" onerror="this.style.display='none'" />
        </div>
        <div style="display:flex;flex-direction:column;justify-content:center;">
          <span style="font-size:20.5px;font-weight:800;color:#0f172a;letter-spacing:-0.7px;font-family:'Plus Jakarta Sans','Outfit',system-ui,sans-serif;line-height:1.15;">Bisa Media</span>
          <span style="font-size:9.5px;font-weight:700;color:#0284c7;letter-spacing:1.1px;text-transform:uppercase;margin-top:2px;">MCN Platform</span>
        </div>
      </a>
      <!-- Scrollable Navigation Menu (Direct flex child: takes available height) -->
      <div id="app-sidebar-box" style="overflow-y:auto;overflow-x:hidden;flex:1 1 auto;min-height:0;padding:6px 10px;scrollbar-width:thin;">
        <ul style="margin:0;padding:0;list-style:none;">${menuHtml}</ul>
      </div>
      <!-- Sidebar Footer (Profile & Logout - Neatly docked at bottom of sidebar) -->
      <div style="padding:12px 14px;border-top:1px solid #f1f5f9;background:#fafafa;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
        <div style="display:flex;align-items:center;gap:8px;">
          <img src="${rootPrefix}media/avatar.png" style="width:34px;height:34px;border-radius:50%;object-fit:cover;border:2px solid #e0f2fe;" onerror="this.style.display='none'" />
          <div>
            <div style="font-size:12.5px;font-weight:700;color:#1e293b;line-height:1.3;">Rayi</div>
            <div style="font-size:9.5px;color:#0284c7;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;">${role.replace(/_/g, ' ')}</div>
          </div>
        </div>
        <a href="${rootPrefix}login.html" title="Logout" style="color:#94a3b8;display:flex;align-items:center;text-decoration:none;padding:6px;border-radius:8px;transition:background 0.15s,color 0.15s;" onmouseover="this.style.color='#ef4444';this.style.background='#fef2f2'" onmouseout="this.style.color='#94a3b8';this.style.background='transparent'">
          <i data-lucide="log-out" style="width: 17px; height: 17px; flex-shrink: 0;"></i>
        </a>
      </div>
    </div>
  `;

  // ── Sidebar smooth transition style injection ───────────────────────
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
        background: rgba(0,0,0,0.35);
        z-index: 1039;
        opacity: 0; pointer-events: none;
        transition: opacity 0.25s ease;
        backdrop-filter: blur(2px);
      }
      #sidebar-backdrop.is-visible { opacity: 1; pointer-events: auto; }
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
    container.innerHTML = sidebarDOM;

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

    // 5b. SPV KOL Unified Navbar Upgrade (Mirrors StaffKol Hirezy Topbar)
    if (role === 'spv_kol') {
      renderSpvKolNavbar();
      initSpvTablePagination();
    }

    // 5c. Render Dedicated Consistent Footer Template
    renderAppFooter();
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
      const tables = document.querySelectorAll('.dashboard-shell table:not(.db-calendar-table):not(.db-topk-table):not(#tableLeaderboard), main table:not(.db-calendar-table):not(.db-topk-table):not(#tableLeaderboard)');
      tables.forEach(table => {
        const scrollWrap = table.closest('.table-wrap') || table.closest('.table-responsive') || table.closest('.campaign-scroll-table-wrap');
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

        let pageSize = 10;
        let currentPage = 1;

        const pagWrap = document.createElement('div');
        pagWrap.className = 'hirezy-pagination-wrap';

        function renderPaginationUI() {
          const allRows = tbody ? Array.from(tbody.querySelectorAll('tr:not(.db-empty-row):not(.hirezy-empty-search-row)')) : [];
          const activeRows = allRows.filter(r => r.getAttribute('data-search-hidden') !== 'true');
          const currentTotal = activeRows.length;
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

          pagWrap.innerHTML = `
            <div class="hirezy-pagination-left">
              <div class="hirezy-pagination-info">
                Menampilkan <b>${start}</b> - <b>${end}</b> dari <b>${currentTotal}</b> data
              </div>
              <div class="hirezy-pagination-size">
                <span class="hirezy-size-label">Tampilkan:</span>
                <select class="hirezy-page-size-select" aria-label="Pilih jumlah data per halaman">
                  <option value="10" ${pageSize === 10 ? 'selected' : ''}>10</option>
                  <option value="30" ${pageSize === 30 ? 'selected' : ''}>30</option>
                  <option value="50" ${pageSize === 50 ? 'selected' : ''}>50</option>
                </select>
                <span class="hirezy-size-unit">data</span>
              </div>
            </div>
            ${totalPages > 1 ? `<div class="hirezy-pagination-btns">${buttonsHtml}</div>` : ''}
          `;

          const sizeSelect = pagWrap.querySelector('.hirezy-page-size-select');
          if (sizeSelect) {
            sizeSelect.addEventListener('change', function () {
              pageSize = parseInt(this.value, 10) || 10;
              currentPage = 1;
              renderPaginationUI();
            });
          }
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

        if (tbody && window.MutationObserver) {
          const observer = new MutationObserver(function (mutations) {
            const hasChildChanges = mutations.some(m => m.type === 'childList');
            if (hasChildChanges) {
              renderPaginationUI();
            }
          });
          observer.observe(tbody, { childList: true });
        }

        renderPaginationUI();
        if (scrollWrap) {
          scrollWrap.after(pagWrap);
        } else {
          parent.appendChild(pagWrap);
        }
      });
    }, 150);
  }

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
      'spvkol_dashboard.html': 'Dashboard',
      'spvkol_kalender.html': 'Kalender',
      'spvkol_kehadiran.html': 'Kehadiran',
      'spvkol_presensi_istirahat.html': 'Presensi Istirahat',
      'spvkol_presensi_lembur.html': 'Presensi Lembur',
      'spvkol_skenario_jam_kerja.html': 'Skenario Jam Kerja',
      'spvkol_karyawan.html': 'Data Karyawan',
      'spvkol_kreator.html': 'Data Kreator',
      'spvkol_folder.html': 'My Folders',
      'spvkol_evaluasi_kinerja.html': 'Evaluasi Kinerja',
      'spvkol_target_capaian.html': 'Target & Capaian',
      'spvkol_campaign.html': 'Campaign',
      'spvkol_dashboard_campaign.html': 'Dashboard Campaign',
      'spvkol_operasional.html': 'Operasional',
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
        <div class="hirezy-search-box">
          <i data-lucide="search" class="hirezy-search-icon" style="width: 17px; height: 17px; stroke: #94a3b8; flex-shrink: 0;"></i>
          <input id="menuSearch" class="hirezy-search-input" type="search" placeholder="Cari menu atau fitur..." />
        </div>

        <button class="hirezy-icon-btn" type="button" aria-label="Pesan" title="Pesan">
          <i data-lucide="message-square" style="width: 18px; height: 18px; stroke: #64748b;"></i>
        </button>

        <button class="hirezy-icon-btn" type="button" aria-label="Notifikasi" title="Notifikasi">
          <i data-lucide="bell" style="width: 18px; height: 18px; stroke: #64748b;"></i>
          <span class="hirezy-notif-dot"></span>
        </button>

        <div class="topbar-user-dropdown-wrap">
          <button id="userMenuButton" class="hirezy-user-pill" type="button" aria-label="Menu Pengguna" aria-expanded="false">
            <div class="hirezy-avatar-box">
              <img src="${rootPrefix}media/avatar.png" alt="SPV KOL" class="hirezy-avatar-img" data-ceo-avatar=""
                onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'" />
            </div>
            <div class="hirezy-user-text">
              <span class="hirezy-user-name">Supervisi KOL</span>
              <span class="hirezy-user-role">SPV &bull; Bisa Media</span>
            </div>
            <i data-lucide="chevron-down" class="hirezy-chevron-down" style="width: 15px; height: 15px; stroke: #64748b; flex-shrink: 0;"></i>
          </button>

          <div id="userMenuDropdown" class="user-menu-dropdown">
            <div class="user-menu-dropdown__header">
              <img src="${rootPrefix}media/avatar.png" alt="Avatar" class="user-menu-dropdown__avatar" data-ceo-avatar="" />
              <div class="user-menu-dropdown__info">
                <span class="user-menu-dropdown__name">Supervisi KOL</span>
                <span class="user-menu-dropdown__role">SPV KOL &bull; PT. Bisa Media</span>
              </div>
            </div>
            <div class="user-menu-dropdown__divider"></div>
            <a href="${rootPrefix}BM/BM_dashboard.html" class="user-menu-dropdown__item">
              <i data-lucide="home" class="user-menu-dropdown__icon" style="width: 18px; height: 18px;"></i>
              <div class="user-menu-dropdown__item-text">
                <span class="user-menu-dropdown__title">Kembali</span>
                <span class="user-menu-dropdown__desc">Buka dashboard utama</span>
              </div>
            </a>
            <a href="${rootPrefix}login.html" class="user-menu-dropdown__item user-menu-dropdown__item--danger">
              <i data-lucide="log-out" class="user-menu-dropdown__icon" style="width: 18px; height: 18px;"></i>
              <div class="user-menu-dropdown__item-text">
                <span class="user-menu-dropdown__title">Logout</span>
                <span class="user-menu-dropdown__desc">Keluar dari aplikasi</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    `;
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

  // 8. User Menu Dropdown Toggle (Topbar Profile)
  document.addEventListener('click', function (e) {
    const userBtn = e.target.closest('#userMenuButton');
    const dropdown = document.getElementById('userMenuDropdown');
    if (userBtn && dropdown) {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = dropdown.classList.toggle('is-open');
      dropdown.classList.toggle('show', isOpen);
      userBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      return;
    }
    if (dropdown && !e.target.closest('#userMenuDropdown')) {
      dropdown.classList.remove('is-open');
      dropdown.classList.remove('show');
      const btn = document.getElementById('userMenuButton');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
  });

  // 9. Instant Topbar Menu Search
  document.addEventListener('input', function (e) {
    if (e.target && e.target.id === 'menuSearch') {
      const q = e.target.value.toLowerCase().trim();
      document.querySelectorAll('#app-sidebar .app-nav-item, #app-sidebar .app-sub-item, .sidebar-nav .nav-item').forEach(function (item) {
        const text = item.textContent.toLowerCase();
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAppSidebar);
  } else {
    renderAppSidebar();
  }

  // Helper Global Minimalist Empty State Component (Sesuai Referensi Pengguna)
  window.getAppEmptyStateHTML = function(title, subtitle) {
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

    window.bmToggleEmptyState = function(emptyEl, wrapperEl, isEmpty) {
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

    window.bmUpdateEmptyState = function(target) {
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
