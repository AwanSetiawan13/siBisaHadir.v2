/**
 * ═══════════════════════════════════════════════════════════════════════
 * SPV KOL Unified Navbar Layout
 * ═══════════════════════════════════════════════════════════════════════
 * File: SpvKol/spvkol_layout.js
 * Purpose: Centralized Navbar template for all SPV KOL pages.
 * Matches the hirezy-topbar style used in StaffKol.
 */
(function () {
  'use strict';

  const path = window.location.pathname.replace(/\\\\/g, '/');
  const pathParts = path.split('/').filter(Boolean);
  const currentFileName = pathParts.length > 0 ? pathParts[pathParts.length - 1] : 'spvkol_dashboard.html';

  const spvKolIdx = pathParts.findIndex(p => p.toLowerCase() === 'spvkol');
  const isSubfolder = spvKolIdx !== -1 ? (pathParts.length - 1 - spvKolIdx) >= 2 : false;

  const mediaPrefix = isSubfolder ? '../../media/' : '../media/';
  const bmPrefix = isSubfolder ? '../../BM/BM_dashboard.html' : '../BM/BM_dashboard.html';
  const loginPrefix = isSubfolder ? '../../login.html' : '../login.html';

  const titles = {
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
  };

  const pageTitle = titles[currentFileName] || (document.title ? document.title.split('|')[0].trim() : 'Dashboard');

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
        <div class="hirezy-search-box">
          <svg class="hirezy-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input id="menuSearch" class="hirezy-search-input" type="search" placeholder="Cari menu atau fitur..." />
        </div>

        <button class="hirezy-icon-btn" type="button" aria-label="Pesan" title="Pesan">
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
          <button id="userMenuButton" class="hirezy-user-pill" type="button" aria-label="Menu Pengguna" aria-expanded="false">
            <div class="hirezy-avatar-box">
              <img src="${mediaPrefix}avatar.png" alt="SPV KOL" class="hirezy-avatar-img" data-ceo-avatar=""
                onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'" />
            </div>
            <div class="hirezy-user-text">
              <span class="hirezy-user-name">Supervisi KOL</span>
              <span class="hirezy-user-role">SPV &bull; Bisa Media</span>
            </div>
            <svg class="hirezy-chevron-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          <div id="userMenuDropdown" class="user-menu-dropdown">
            <div class="user-menu-dropdown__header">
              <img src="${mediaPrefix}avatar.png" alt="Avatar" class="user-menu-dropdown__avatar" data-ceo-avatar="" />
              <div class="user-menu-dropdown__info">
                <span class="user-menu-dropdown__name">Supervisi KOL</span>
                <span class="user-menu-dropdown__role">SPV KOL &bull; PT. Bisa Media</span>
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

  function injectNavbar() {
    let topbarEl = document.querySelector('header.topbar');
    if (topbarEl) {
      topbarEl.classList.add('hirezy-topbar');
      topbarEl.innerHTML = getTopbarHTML();
    }

    setTimeout(function () {
      const userBtn = document.getElementById('userMenuButton');
      const userDrop = document.getElementById('userMenuDropdown');
      if (userBtn && userDrop) {
        userBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          const isOpen = userDrop.classList.toggle('is-open');
          userBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
        document.addEventListener('click', function () {
          userDrop.classList.remove('is-open');
          userBtn.setAttribute('aria-expanded', 'false');
        });
      }

      const searchInput = document.getElementById('menuSearch');
      if (searchInput) {
        searchInput.addEventListener('input', function () {
          const q = this.value.toLowerCase().trim();
          document.querySelectorAll('.app-nav-item, .app-sub-item').forEach(function (item) {
            const text = item.textContent.toLowerCase();
            item.style.display = (!q || text.includes(q)) ? '' : 'none';
          });
        });
      }
    }, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectNavbar);
  } else {
    injectNavbar();
  }

})();
