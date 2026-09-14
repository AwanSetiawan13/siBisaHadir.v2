/**
 * ═══════════════════════════════════════════════════════════════════════
 * Staff KOL Unified Layout Template (Sidebar & Navbar)
 * ═══════════════════════════════════════════════════════════════════════
 * File: StaffKol/staffkol_layout.js
 * Purpose: Centralized Sidebar & Navbar template for all Staff KOL pages.
 * Fully interactive with event delegation and accurate relative paths.
 */
(function () {
  'use strict';

  // 1. Detect current filename and folder depth
  const path = window.location.pathname.replace(/\\\\/g, '/');
  const pathParts = path.split('/').filter(Boolean);
  const currentFileName = pathParts.length > 0 ? pathParts[pathParts.length - 1] : 'staffkol_dashboard.html';
  
  // Find where StaffKol is in the path
  const staffKolIdx = pathParts.findIndex(p => p.toLowerCase() === 'staffkol');
  const isSubfolder = staffKolIdx !== -1 ? (pathParts.length - 1 - staffKolIdx) >= 2 : false;

  // Relative path prefixes
  const mediaPrefix = isSubfolder ? '../../media/' : '../media/';
  const bmPrefix = isSubfolder ? '../../BM/BM_dashboard.html' : '../BM/BM_dashboard.html';
  const loginPrefix = isSubfolder ? '../../login.html' : '../login.html';

  // Helper to resolve links accurately from any subfolder
  function resolveLink(targetFolder, targetFile) {
    if (!targetFolder) {
      return isSubfolder ? `../${targetFile}` : `${targetFile}`;
    }
    if (isSubfolder) {
      return `../${targetFolder}/${targetFile}`;
    }
    return `${targetFolder}/${targetFile}`;
  }

  // Page title mapping
  const titles = {
    'staffkol_dashboard.html': 'Dashboard',
    'staffkol_kalender.html': 'Kalender',
    'staffkol_kehadiran.html': 'Kehadiran',
    'staffkol_presensi_istirahat.html': 'Presensi Istirahat',
    'staffkol_presensi_lembur.html': 'Presensi Lembur',
    'staffkol_folder.html': 'My Folders',
    'staffkol_evaluasi_kinerja.html': 'Evaluasi Kinerja',
    'staffkol_rencana_karier.html': 'Rencana Karier',
    'staffkol_target_capaian.html': 'Target & Capaian Kerja',
    'staffkol_upgrade_skill.html': 'Rencana Karier',
    'staffkol_campaign.html': 'Campaign',
    'staffkol_dashboard_campaign.html': 'Dashboard Campaign',
    'staffkol_kreator.html': 'Kreator',
    'staffkol_operasional.html': 'Operasional',
    'staffkol_Performa_Kreator.html': 'Performa Kreator',
    'staffkol_tracking_sampel.html': 'Tracking Sampel',
    'staffkol_laporan.html': 'Laporan',
    'staffkol_Milestone.html': 'Milestone',
    'staffkol_pengaduan.html': 'Pengaduan',
    'staffkol_project.html': 'Project',
    'staffkol_rrk.html': 'RRK',
    'staffkol_tugas.html': 'Tugas'
  };

  const pageTitle = titles[currentFileName] || (document.title ? document.title.split('|')[0].trim() : 'Dashboard');

  // 2. Generate Sidebar Template HTML
  function getSidebarHTML() {
    function isActive(file) {
      return currentFileName.toLowerCase() === file.toLowerCase() ? 'nav-item--active' : '';
    }

    function isGroupActive(files) {
      return files.some(f => currentFileName.toLowerCase() === f.toLowerCase()) ? '' : 'is-collapsed';
    }

    return `
    <div class="sidebar-brand">
      <img class="brand-logo brand-logo--sidebar" src="${mediaPrefix}logo.png" alt="Logo Bisa Media" />
      <span class="brand-name brand-name--dark">Bisa Media</span>
    </div>

    <nav class="sidebar-nav" aria-label="Menu utama">
      <a class="nav-item ${isActive('staffkol_dashboard.html')}" href="${resolveLink('', 'staffkol_dashboard.html')}">
        <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3.5 10.5L12 3l8.5 7.5"></path>
          <path d="M5.5 9.5V21h13V9.5"></path>
          <path d="M9.5 21v-6h5v6"></path>
        </svg>
        <span>Dashboard</span>
      </a>

      <a class="nav-item ${isActive('staffkol_kalender.html')}" href="${resolveLink('', 'staffkol_kalender.html')}">
        <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span>Kalender</span>
      </a>

      <!-- 1. Kehadiran -->
      <section class="nav-group ${isGroupActive(['staffkol_kehadiran.html', 'staffkol_presensi_istirahat.html', 'staffkol_presensi_lembur.html'])}">
        <button class="nav-group__toggle" type="button">
          <span>Kehadiran</span>
          <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 9l5 5 5-5"></path>
          </svg>
        </button>

        <div class="nav-group__items">
          <a class="nav-item ${isActive('staffkol_kehadiran.html')}" href="${resolveLink('absensi', 'staffkol_kehadiran.html')}">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
            </svg>
            <span>Kehadiran</span>
          </a>

          <a class="nav-item ${isActive('staffkol_presensi_istirahat.html')}" href="${resolveLink('absensi', 'staffkol_presensi_istirahat.html')}">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M12 7v5l3 3"></path>
            </svg>
            <span>Presensi Istirahat</span>
          </a>

          <a class="nav-item ${isActive('staffkol_presensi_lembur.html')}" href="${resolveLink('absensi', 'staffkol_presensi_lembur.html')}">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
            </svg>
            <span>Presensi Lembur</span>
          </a>
        </div>
      </section>

      <!-- 2. Operasional -->
      <section class="nav-group ${isGroupActive(['staffkol_dashboard_campaign.html', 'staffkol_campaign.html', 'staffkol_tracking_sampel.html', 'staffkol_kreator.html', 'staffkol_Performa_Kreator.html', 'staffkol_operasional.html'])}">
        <button class="nav-group__toggle" type="button">
          <span>Operasional</span>
          <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 9l5 5 5-5"></path>
          </svg>
        </button>

        <div class="nav-group__items">
          <a class="nav-item ${isActive('staffkol_dashboard_campaign.html')}" href="${resolveLink('operasional', 'staffkol_dashboard_campaign.html')}">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3.5 10.5L12 3l8.5 7.5"></path>
              <path d="M5.5 9.5V21h13V9.5"></path>
              <path d="M9.5 21v-6h5v6"></path>
            </svg>
            <span>Dashboard Campaign</span>
          </a>

          <a class="nav-item ${isActive('staffkol_campaign.html')}" href="${resolveLink('operasional', 'staffkol_campaign.html')}">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 13h3l9 4V7l-9 4H4z"></path>
              <path d="M7 13l1.5 5"></path>
              <path d="M18 9.5c1 .6 1.5 1.4 1.5 2.5S19 13.9 18 14.5"></path>
            </svg>
            <span>Campaign</span>
          </a>

          <a class="nav-item ${isActive('staffkol_tracking_sampel.html')}" href="${resolveLink('operasional', 'staffkol_tracking_sampel.html')}">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10" cy="10" r="5"></circle>
              <path d="M14 14l6 6"></path>
              <path d="M8 10h4M10 8v4"></path>
            </svg>
            <span>Tracking Sampel</span>
          </a>

          <a class="nav-item ${isActive('staffkol_kreator.html')}" href="${resolveLink('operasional', 'staffkol_kreator.html')}">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="9" cy="8" r="3"></circle>
              <path d="M3.5 19c.6-3.4 2.4-5.2 5.5-5.2s4.9 1.8 5.5 5.2"></path>
              <circle cx="17" cy="9" r="2"></circle>
              <path d="M15.5 14.5c2.7-.3 4.4 1.2 5 4"></path>
            </svg>
            <span>Kreator</span>
          </a>

          <a class="nav-item ${isActive('staffkol_operasional.html')}" href="${resolveLink('operasional', 'staffkol_operasional.html')}">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="7" r="4"></circle>
              <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"></path>
              <polyline points="16 3 20 7 16 11"></polyline>
            </svg>
            <span>Tracking Kreator</span>
          </a>

          <a class="nav-item ${isActive('staffkol_Performa_Kreator.html')}" href="${resolveLink('operasional', 'staffkol_Performa_Kreator.html')}">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 19V5"></path>
              <path d="M4 19h16"></path>
              <path d="M7 15l4-4 3 2 5-6"></path>
            </svg>
            <span>Performa Kreator</span>
          </a>
        </div>
      </section>

      <!-- 3. Dokumen & Kolaborasi -->
      <section class="nav-group ${isGroupActive(['staffkol_folder.html'])}">
        <button class="nav-group__toggle" type="button">
          <span>Dokumen & Kolaborasi</span>
          <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 9l5 5 5-5"></path>
          </svg>
        </button>

        <div class="nav-group__items">
          <a class="nav-item ${isActive('staffkol_folder.html')}" href="${resolveLink('dokumen_kolaborasi', 'staffkol_folder.html')}">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>My Folders</span>
          </a>
        </div>
      </section>

      <!-- 4. Perancangan Kerja -->
      <section class="nav-group ${isGroupActive(['staffkol_rrk.html', 'staffkol_Milestone.html', 'staffkol_tugas.html', 'staffkol_project.html', 'staffkol_laporan.html', 'staffkol_pengaduan.html'])}">
        <button class="nav-group__toggle" type="button">
          <span>Perancangan Kerja</span>
          <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 9l5 5 5-5"></path>
          </svg>
        </button>

        <div class="nav-group__items">
          <a class="nav-item ${isActive('staffkol_rrk.html')}" href="${resolveLink('perancangan_kerja', 'staffkol_rrk.html')}">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 21V4"></path>
              <path d="M5 5h11l-2 4 2 4H5"></path>
            </svg>
            <span>RRK</span>
          </a>

          <a class="nav-item ${isActive('staffkol_Milestone.html')}" href="${resolveLink('perancangan_kerja', 'staffkol_Milestone.html')}">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 21V4"></path>
              <path d="M5 5h11l-2 4 2 4H5"></path>
              <circle cx="18.5" cy="17.5" r="2.5"></circle>
            </svg>
            <span>Milestone</span>
          </a>

          <a class="nav-item ${isActive('staffkol_tugas.html')}" href="${resolveLink('perancangan_kerja', 'staffkol_tugas.html')}">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="4" y="4" width="16" height="16" rx="3"></rect>
              <path d="M8 12l2.5 2.5L16 9"></path>
            </svg>
            <span>Tugas</span>
          </a>

          <a class="nav-item ${isActive('staffkol_project.html')}" href="${resolveLink('perancangan_kerja', 'staffkol_project.html')}">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            <span>Project</span>
          </a>

          <a class="nav-item ${isActive('staffkol_laporan.html')}" href="${resolveLink('perancangan_kerja', 'staffkol_laporan.html')}">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>Laporan</span>
          </a>

          <a class="nav-item ${isActive('staffkol_pengaduan.html')}" href="${resolveLink('perancangan_kerja', 'staffkol_pengaduan.html')}">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>Pengaduan</span>
          </a>
        </div>
      </section>

      <!-- 5. Kinerja -->
      <section class="nav-group ${isGroupActive(['staffkol_evaluasi_kinerja.html', 'staffkol_target_capaian.html', 'staffkol_upgrade_skill.html', 'staffkol_rencana_karier.html'])}">
        <button class="nav-group__toggle" type="button">
          <span>Kinerja</span>
          <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 9l5 5 5-5"></path>
          </svg>
        </button>

        <div class="nav-group__items">
          <a class="nav-item ${isActive('staffkol_evaluasi_kinerja.html')}" href="${resolveLink('kinerja', 'staffkol_evaluasi_kinerja.html')}">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>Evaluasi Kinerja</span>
          </a>

          <a class="nav-item ${isActive('staffkol_target_capaian.html')}" href="${resolveLink('kinerja', 'staffkol_target_capaian.html')}">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="6"></circle>
              <circle cx="12" cy="12" r="2"></circle>
            </svg>
            <span>Target & Capaian Kerja</span>
          </a>

          <a class="nav-item ${isActive('staffkol_upgrade_skill.html') || isActive('staffkol_rencana_karier.html')}" href="${resolveLink('kinerja', 'staffkol_upgrade_skill.html')}">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="18" y1="8" x2="23" y2="8"></line>
              <line x1="20.5" y1="5.5" x2="20.5" y2="10.5"></line>
            </svg>
            <span>Rencana Karier</span>
          </a>
        </div>
      </section>
    </nav>`;
  }

  // 3. Generate Topbar (Navbar) Template HTML
  function getTopbarHTML() {
    return `
      <div class="topbar__left hirezy-topbar-left">
        <button id="sidebarToggle" class="icon-button icon-button--menu" type="button"
          aria-label="Buka atau tutup sidebar">
          <span></span><span></span><span></span>
        </button>
        <h2 class="hirezy-page-title">${pageTitle}</h2>
      </div>

      <div class="topbar__actions hirezy-topbar-right">
        <!-- Search Input -->
        <div class="hirezy-search-box">
          <svg class="hirezy-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input id="menuSearch" class="hirezy-search-input" type="search" placeholder="Search candidate, vacancy, etc" />
        </div>

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
          <button id="userMenuButton" class="hirezy-user-pill" type="button" aria-label="Menu Pengguna" aria-expanded="false" title="Menu Pengguna">
            <div class="hirezy-avatar-box">
              <img src="${mediaPrefix}avatar.png" alt="Andrew Sebastian" class="hirezy-avatar-img" data-ceo-avatar="" onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'" />
            </div>
            <div class="hirezy-user-text">
              <span class="hirezy-user-name">Andrew Sebastian</span>
              <span class="hirezy-user-role">Lead HR</span>
            </div>
            <svg class="hirezy-chevron-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          <div id="userMenuDropdown" class="user-menu-dropdown">
            <div class="user-menu-dropdown__header">
              <img src="${mediaPrefix}avatar.png" alt="Avatar" class="user-menu-dropdown__avatar" data-ceo-avatar="" />
              <div class="user-menu-dropdown__info">
                <span class="user-menu-dropdown__name">Andrew Sebastian</span>
                <span class="user-menu-dropdown__role">Staff KOL &bull; PT. Bisa Media</span>
              </div>
            </div>
            <div class="user-menu-dropdown__divider"></div>
            <a href="${bmPrefix}" class="user-menu-dropdown__item">
              <svg class="user-menu-dropdown__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <div class="user-menu-dropdown__item-text">
                <span class="user-menu-dropdown__title">Kembali</span>
                <span class="user-menu-dropdown__desc">Buka dashboard utama</span>
              </div>
            </a>
            <a href="${loginPrefix}" class="user-menu-dropdown__item user-menu-dropdown__item--danger">
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

  // 4. Injects template into DOM
  function injectTemplate() {
    // A. Inject/Replace Sidebar
    let sidebarEl = document.getElementById('sidebar') || document.querySelector('.sidebar.kol-sidebar');
    if (sidebarEl) {
      sidebarEl.innerHTML = getSidebarHTML();
    }

    // B. Inject/Replace Topbar (Navbar)
    let topbarEl = document.querySelector('header.topbar');
    if (topbarEl) {
      topbarEl.className = 'topbar hirezy-topbar';
      topbarEl.innerHTML = getTopbarHTML();
    }
  }

  // 5. Global Delegated Interactive Event Handlers (Works 100% reliably)
  document.addEventListener('click', function (e) {
    // A. Sidebar Accordion Toggle
    const toggleBtn = e.target.closest('.nav-group__toggle');
    if (toggleBtn) {
      e.preventDefault();
      const group = toggleBtn.closest('.nav-group');
      if (group) {
        group.classList.toggle('is-collapsed');
      }
      return;
    }

    // B. Sidebar Mobile/Desktop Toggle
    const sidebarToggleBtn = e.target.closest('#sidebarToggle');
    if (sidebarToggleBtn) {
      e.preventDefault();
      const sidebar = document.getElementById('sidebar') || document.querySelector('.sidebar');
      if (sidebar) {
        sidebar.classList.toggle('is-open');
        sidebar.classList.toggle('is-collapsed');
      }
      return;
    }

    // C. User Profile Menu Dropdown Toggle
    const userBtn = e.target.closest('#userMenuButton');
    const dropdown = document.getElementById('userMenuDropdown');
    if (userBtn && dropdown) {
      e.preventDefault();
      e.stopPropagation();
      dropdown.classList.toggle('is-open');
      dropdown.classList.toggle('show');
      return;
    }

    // Close dropdown when clicking outside
    if (dropdown && !e.target.closest('#userMenuDropdown')) {
      dropdown.classList.remove('is-open');
      dropdown.classList.remove('show');
    }
  });

  // D. Search filter in menu
  document.addEventListener('input', function (e) {
    if (e.target && e.target.id === 'menuSearch') {
      const q = e.target.value.toLowerCase().trim();
      const items = document.querySelectorAll('.sidebar-nav .nav-item');
      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (!q || text.includes(q)) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
      // Expand groups if searching
      if (q) {
        document.querySelectorAll('.nav-group').forEach(g => g.classList.remove('is-collapsed'));
      }
    }
  });

  // Execute on DOMContentLoaded or immediately if DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectTemplate);
  } else {
    injectTemplate();
  }
})();
