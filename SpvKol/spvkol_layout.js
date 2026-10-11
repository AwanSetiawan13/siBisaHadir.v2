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
    'spvkol_tracking_kreator.html': 'Tracking Kreator',
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
        <!-- Search Input -->
        <div class="hirezy-search-box">
          <svg class="hirezy-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px; stroke: #94a3b8; flex-shrink: 0;">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input id="menuSearch" class="hirezy-search-input" type="search" placeholder="Cari menu atau fitur..." />
        </div>

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
                <img src="${mediaPrefix}avatar.png" style="width: 34px; height: 34px; border-radius: 50%; object-fit: cover; flex-shrink: 0;" />
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
          <button id="userMenuButton" class="hirezy-user-pill" type="button" aria-label="Menu Pengguna" aria-expanded="false">
            <div class="hirezy-avatar-box">
              <img src="${mediaPrefix}avatar.png" alt="SPV KOL" class="hirezy-avatar-img" data-ceo-avatar=""
                onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'" />
            </div>
            <div class="hirezy-user-text">
              <span class="hirezy-user-name">Setiawan</span>
              <span class="hirezy-user-role">SPV KOL</span>
            </div>
            <svg class="hirezy-chevron-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; stroke: #64748b; flex-shrink: 0;">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          <div id="userMenuDropdown" class="user-menu-dropdown">
            <div class="user-menu-dropdown__header">
              <img src="${mediaPrefix}avatar.png" alt="Avatar" class="user-menu-dropdown__avatar" data-ceo-avatar="" />
              <div class="user-menu-dropdown__info">
                <span class="user-menu-dropdown__name">Setiawan</span>
                <span class="user-menu-dropdown__role">SPV KOL &bull; PT. Bisa Media</span>
              </div>
            </div>
            <div class="user-menu-dropdown__divider"></div>
            <a href="${bmPrefix}" class="user-menu-dropdown__item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px; stroke: #64748b; margin-right: 8px;">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <div class="user-menu-dropdown__item-text">
                <span class="user-menu-dropdown__title">Kembali</span>
                <span class="user-menu-dropdown__desc">Buka dashboard utama</span>
              </div>
            </a>
            <a href="${loginPrefix}" class="user-menu-dropdown__item user-menu-dropdown__item--danger">
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
      </div>`;
  }

  function injectNavbar() {
    let topbarEl = document.querySelector('header.topbar');
    if (topbarEl) {
      topbarEl.classList.add('hirezy-topbar');
      topbarEl.innerHTML = getTopbarHTML();
    }

    setTimeout(function () {
      document.addEventListener('click', function (e) {
        const chatBtn = e.target.closest('#chatMenuButton');
        const notifBtn = e.target.closest('#notifMenuButton');
        const userBtn = e.target.closest('#userMenuButton');

        const chatDrop = document.getElementById('chatMenuDropdown');
        const notifDrop = document.getElementById('notifMenuDropdown');
        const userDrop = document.getElementById('userMenuDropdown');

        if (chatBtn && chatDrop) {
          e.preventDefault();
          e.stopPropagation();
          const isOpen = chatDrop.classList.toggle('is-open');
          chatDrop.classList.toggle('show', isOpen);
          chatBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
          if (notifDrop) { notifDrop.classList.remove('is-open', 'show'); document.getElementById('notifMenuButton')?.setAttribute('aria-expanded', 'false'); }
          if (userDrop) { userDrop.classList.remove('is-open', 'show'); document.getElementById('userMenuButton')?.setAttribute('aria-expanded', 'false'); }
          return;
        }

        if (notifBtn && notifDrop) {
          e.preventDefault();
          e.stopPropagation();
          const isOpen = notifDrop.classList.toggle('is-open');
          notifDrop.classList.toggle('show', isOpen);
          notifBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
          if (chatDrop) { chatDrop.classList.remove('is-open', 'show'); document.getElementById('chatMenuButton')?.setAttribute('aria-expanded', 'false'); }
          if (userDrop) { userDrop.classList.remove('is-open', 'show'); document.getElementById('userMenuButton')?.setAttribute('aria-expanded', 'false'); }
          return;
        }

        if (userBtn && userDrop) {
          e.preventDefault();
          e.stopPropagation();
          const isOpen = userDrop.classList.toggle('is-open');
          userDrop.classList.toggle('show', isOpen);
          userBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
          if (chatDrop) { chatDrop.classList.remove('is-open', 'show'); document.getElementById('chatMenuButton')?.setAttribute('aria-expanded', 'false'); }
          if (notifDrop) { notifDrop.classList.remove('is-open', 'show'); document.getElementById('notifMenuButton')?.setAttribute('aria-expanded', 'false'); }
          return;
        }

        // Close all dropdowns if clicking outside
        if (!e.target.closest('#chatMenuDropdown') && chatDrop) {
          chatDrop.classList.remove('is-open', 'show');
          document.getElementById('chatMenuButton')?.setAttribute('aria-expanded', 'false');
        }
        if (!e.target.closest('#notifMenuDropdown') && notifDrop) {
          notifDrop.classList.remove('is-open', 'show');
          document.getElementById('notifMenuButton')?.setAttribute('aria-expanded', 'false');
        }
        if (!e.target.closest('#userMenuDropdown') && userDrop) {
          userDrop.classList.remove('is-open', 'show');
          document.getElementById('userMenuButton')?.setAttribute('aria-expanded', 'false');
        }
      });

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
