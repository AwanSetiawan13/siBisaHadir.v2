const fs = require('fs');
const path = require('path');

const rootDir = 'd:/SOFTWARE/laragon/www/siBisaHadir.v2';
const spvKolDir = path.join(rootDir, 'SpvKol');

function getSpvSidebar(prefix, mediaPrefix, logoutHref, activePage) {
  // UTAMA
  const isDash = activePage === 'spvkol_dashboard.html' ? ' nav-item--active' : '';
  const isKalender = activePage === 'spvkol_kalender.html' ? ' nav-item--active' : '';

  // OPERASIONAL KOL - Absensi
  const isKehadiran = activePage === 'spvkol_kehadiran.html' ? ' nav-item--active' : '';
  const isIstirahat = activePage === 'spvkol_presensi_istirahat.html' ? ' nav-item--active' : '';
  const isLembur = activePage === 'spvkol_presensi_lembur.html' ? ' nav-item--active' : '';
  const isAbsensiGroup = (isKehadiran || isIstirahat || isLembur) ? '' : ' is-collapsed';

  // OPERASIONAL KOL - Operasional
  const isDashCampaign = activePage === 'spvkol_dashboard_campaign.html' ? ' nav-item--active' : '';
  const isCampaign = activePage === 'spvkol_campaign.html' ? ' nav-item--active' : '';
  const isKreator = activePage === 'spvkol_kreator.html' ? ' nav-item--active' : '';
  const isTrackingKreator = activePage === 'spvkol_tracking_kreator.html' ? ' nav-item--active' : '';
  const isTrackingSampel = activePage === 'spvkol_tracking_sampel.html' ? ' nav-item--active' : '';
  const isPerformaKreator = activePage === 'spvkol_Performa_Kreator.html' ? ' nav-item--active' : '';
  const isOperasionalGroup = (isDashCampaign || isCampaign || isKreator || isTrackingKreator || isTrackingSampel || isPerformaKreator) ? '' : ' is-collapsed';

  // OPERASIONAL KOL - Dokumen & Kolaborasi
  const isFolder = activePage === 'spvkol_folder.html' ? ' nav-item--active' : '';
  const isDokumenGroup = isFolder ? '' : ' is-collapsed';

  // MANAJEMEN & KINERJA - Perancangan Kerja
  const isRrk = activePage === 'spvkol_rrk.html' ? ' nav-item--active' : '';
  const isMilestone = activePage === 'spvkol_Milestone.html' ? ' nav-item--active' : '';
  const isTugas = activePage === 'spvkol_tugas.html' ? ' nav-item--active' : '';
  const isProject = activePage === 'spvkol_project.html' ? ' nav-item--active' : '';
  const isLaporan = activePage === 'spvkol_laporan.html' ? ' nav-item--active' : '';
  const isPengaduan = activePage === 'spvkol_pengaduan.html' ? ' nav-item--active' : '';
  const isPerancanganGroup = (isRrk || isMilestone || isTugas || isProject || isLaporan || isPengaduan) ? '' : ' is-collapsed';

  // MANAJEMEN & KINERJA - Kinerja
  const isEvaluasi = activePage === 'spvkol_evaluasi_kinerja.html' ? ' nav-item--active' : '';
  const isTarget = activePage === 'spvkol_target_capaian.html' ? ' nav-item--active' : '';
  const isUpgrade = activePage === 'spvkol_upgrade_skill.html' ? ' nav-item--active' : '';
  const isRencanaKarier = activePage === 'spvkol_rencana_karier.html' ? ' nav-item--active' : '';
  const isKinerjaGroup = (isEvaluasi || isTarget || isUpgrade || isRencanaKarier) ? '' : ' is-collapsed';

  // MANAJEMEN & KINERJA - Data Master
  const isBrand = activePage === 'spvkol_Brand.html' ? ' nav-item--active' : '';
  const isKategori = activePage === 'spvkol_Kategori_Produk.html' ? ' nav-item--active' : '';
  const isLeads = activePage === 'spvkol_Leads_Kreator.html' ? ' nav-item--active' : '';
  const isLeveling = activePage === 'spvkol_Leveling_Kreator.html' ? ' nav-item--active' : '';
  const isAds = activePage === 'spvkol_Ads_Account.html' ? ' nav-item--active' : '';
  const isMasterPendukung = (isKategori || isLeads || isLeveling || isAds);
  const isDataMasterGroup = (isBrand || isMasterPendukung) ? '' : ' is-collapsed';
  const isMasterPendukungSubgroup = isMasterPendukung ? '' : ' is-collapsed';

  return `  <aside id="sidebar" class="sidebar kol-sidebar">
    <div class="sidebar-header">
      <div class="sidebar-brand">
        <div class="sidebar-brand__logo-wrap">
          <img class="brand-logo brand-logo--sidebar" src="${mediaPrefix}logo.png" alt="Logo Bisa Media" />
        </div>
        <div class="sidebar-brand__text">
          <span class="brand-name brand-name--dark">Bisa Media</span>
          <span class="sidebar-brand__badge">MCN Management</span>
        </div>
      </div>
    </div>

    <nav class="sidebar-nav" aria-label="Menu utama">
      <div class="sidebar-group-label">UTAMA</div>

      <a class="nav-item${isDash}" href="${prefix}spvkol_dashboard.html">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span>Dashboard</span>
      </a>

      <a class="nav-item${isKalender}" href="${prefix}spvkol_kalender.html">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span>Kalender</span>
      </a>

      <div class="sidebar-group-label">OPERASIONAL KOL</div>

      <section class="nav-group${isAbsensiGroup}">
        <button class="nav-group__toggle" type="button">
          <div class="nav-group__title-wrap">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            <span>Absensi</span>
          </div>
          <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 9l5 5 5-5"></path>
          </svg>
        </button>

        <div class="nav-group__items">
          <a class="nav-item${isKehadiran}" href="${prefix}absensi/spvkol_kehadiran.html">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>Kehadiran</span>
          </a>

          <a class="nav-item${isIstirahat}" href="${prefix}absensi/spvkol_presensi_istirahat.html">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
              <line x1="6" y1="1" x2="6" y2="4"></line>
              <line x1="10" y1="1" x2="10" y2="4"></line>
              <line x1="14" y1="1" x2="14" y2="4"></line>
            </svg>
            <span>Presensi Istirahat</span>
          </a>

          <a class="nav-item${isLembur}" href="${prefix}absensi/spvkol_presensi_lembur.html">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Presensi Lembur</span>
          </a>
        </div>
      </section>

      <section class="nav-group${isOperasionalGroup}">
        <button class="nav-group__toggle" type="button">
          <div class="nav-group__title-wrap">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
            <span>Operasional</span>
          </div>
          <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 9l5 5 5-5"></path>
          </svg>
        </button>

        <div class="nav-group__items">
          <a class="nav-item${isDashCampaign}" href="${prefix}operasional/spvkol_dashboard_campaign.html">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3.5 10.5L12 3l8.5 7.5"></path>
              <path d="M5.5 9.5V21h13V9.5"></path>
              <path d="M9.5 21v-6h5v6"></path>
            </svg>
            <span>Dashboard Campaign</span>
          </a>

          <a class="nav-item${isCampaign}" href="${prefix}operasional/spvkol_campaign.html">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 13h3l9 4V7l-9 4H4z"></path>
              <path d="M7 13l1.5 5"></path>
              <path d="M18 9.5c1 .6 1.5 1.4 1.5 2.5S19 13.9 18 14.5"></path>
            </svg>
            <span>Campaign</span>
          </a>

          <a class="nav-item${isKreator}" href="${prefix}operasional/spvkol_kreator.html">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="8" r="3"></circle>
              <path d="M3.5 19c.6-3.4 2.4-5.2 5.5-5.2s4.9 1.8 5.5 5.2"></path>
              <circle cx="17" cy="9" r="2"></circle>
              <path d="M15.5 14.5c2.7-.3 4.4 1.2 5 4"></path>
            </svg>
            <span>Data Creator</span>
          </a>

          <a class="nav-item${isTrackingKreator}" href="${prefix}operasional/spvkol_tracking_kreator.html">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>Tracking Kreator</span>
          </a>

          <a class="nav-item${isTrackingSampel}" href="${prefix}operasional/spvkol_tracking_sampel.html">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="10" cy="10" r="5"></circle>
              <path d="M14 14l6 6"></path>
              <path d="M8 10h4M10 8v4"></path>
            </svg>
            <span>Tracking Sampel</span>
          </a>

          <a class="nav-item${isPerformaKreator}" href="${prefix}operasional/spvkol_Performa_Kreator.html">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19V5"></path>
              <path d="M4 19h16"></path>
              <path d="M7 15l4-4 3 2 5-6"></path>
            </svg>
            <span>Performa Kreator</span>
          </a>
        </div>
      </section>

      <section class="nav-group${isDokumenGroup}">
        <button class="nav-group__toggle" type="button">
          <div class="nav-group__title-wrap">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>Dokumen & Kolaborasi</span>
          </div>
          <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 9l5 5 5-5"></path>
          </svg>
        </button>

        <div class="nav-group__items">
          <a class="nav-item${isFolder}" href="${prefix}dokumen_kolaborasi/spvkol_folder.html">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>My Folders</span>
          </a>
        </div>
      </section>

      <div class="sidebar-group-label">MANAJEMEN & KINERJA</div>

      <section class="nav-group${isPerancanganGroup}">
        <button class="nav-group__toggle" type="button">
          <div class="nav-group__title-wrap">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            <span>Perancangan Kerja</span>
          </div>
          <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 9l5 5 5-5"></path>
          </svg>
        </button>

        <div class="nav-group__items">
          <a class="nav-item${isRrk}" href="${prefix}perancangan_kerja/spvkol_rrk.html">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 21V4"></path>
              <path d="M5 5h11l-2 4 2 4H5"></path>
            </svg>
            <span>RRK</span>
          </a>

          <a class="nav-item${isMilestone}" href="${prefix}perancangan_kerja/spvkol_Milestone.html">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 21V4"></path>
              <path d="M5 5h11l-2 4 2 4H5"></path>
              <circle cx="18.5" cy="17.5" r="2.5"></circle>
            </svg>
            <span>Milestone</span>
          </a>

          <a class="nav-item${isTugas}" href="${prefix}perancangan_kerja/spvkol_tugas.html">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="3"></rect>
              <path d="M8 12l2.5 2.5L16 9"></path>
            </svg>
            <span>Tugas</span>
          </a>

          <a class="nav-item${isProject}" href="${prefix}perancangan_kerja/spvkol_project.html">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            <span>Project</span>
          </a>

          <a class="nav-item${isLaporan}" href="${prefix}perancangan_kerja/spvkol_laporan.html">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>Laporan</span>
          </a>

          <a class="nav-item${isPengaduan}" href="${prefix}perancangan_kerja/spvkol_pengaduan.html">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>Pengaduan</span>
          </a>
        </div>
      </section>

      <section class="nav-group${isKinerjaGroup}">
        <button class="nav-group__toggle" type="button">
          <div class="nav-group__title-wrap">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            <span>Kinerja</span>
          </div>
          <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 9l5 5 5-5"></path>
          </svg>
        </button>

        <div class="nav-group__items">
          <a class="nav-item${isEvaluasi}" href="${prefix}kinerja/spvkol_evaluasi_kinerja.html">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>Evaluasi Kinerja</span>
          </a>

          <a class="nav-item${isTarget}" href="${prefix}kinerja/spvkol_target_capaian.html">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="6"></circle>
              <circle cx="12" cy="12" r="2"></circle>
            </svg>
            <span>Target & Capaian Kerja</span>
          </a>

          <a class="nav-item${isUpgrade}" href="${prefix}kinerja/spvkol_upgrade_skill.html">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="18" y1="8" x2="23" y2="8"></line>
              <line x1="20.5" y1="5.5" x2="20.5" y2="10.5"></line>
            </svg>
            <span>Upgrade Skill</span>
          </a>

          <a class="nav-item${isRencanaKarier}" href="${prefix}kinerja/spvkol_rencana_karier.html">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
            <span>Rencana Karier</span>
          </a>
        </div>
      </section>

      <section class="nav-group${isDataMasterGroup}">
        <button class="nav-group__toggle" type="button">
          <div class="nav-group__title-wrap">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
            </svg>
            <span>Data Master</span>
          </div>
          <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 9l5 5 5-5"></path>
          </svg>
        </button>

        <div class="nav-group__items">
          <a class="nav-item${isBrand}" href="${prefix}data_master/spvkol_Brand.html">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3l8 8-8 8-8-8z"></path>
              <path d="M8.5 11.5l3 3 4.5-5"></path>
            </svg>
            <span>Brand</span>
          </a>

          <div class="nav-subgroup${isMasterPendukungSubgroup}">
            <button class="nav-subgroup__toggle" type="button">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="4" y1="6" x2="20" y2="6"></line>
                <line x1="4" y1="12" x2="20" y2="12"></line>
                <line x1="4" y1="18" x2="20" y2="18"></line>
              </svg>
              <span>Master Pendukung</span>
              <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 9l5 5 5-5"></path>
              </svg>
            </button>
            <div class="nav-subgroup__items">
              <a class="nav-item${isKategori}" href="${prefix}data_master/master_pendukung/spvkol_Kategori_Produk.html">
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M8 6h12M8 12h12M8 18h12"></path>
                  <circle cx="4" cy="6" r="1"></circle>
                  <circle cx="4" cy="12" r="1"></circle>
                  <circle cx="4" cy="18" r="1"></circle>
                </svg>
                <span>Kategori Produk</span>
              </a>
              <a class="nav-item${isLeads}" href="${prefix}data_master/master_pendukung/spvkol_Leads_Kreator.html">
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="9" cy="8" r="3"></circle>
                  <path d="M3.5 19c.6-3.4 2.4-5.2 5.5-5.2s4.9 1.8 5.5 5.2"></path>
                  <path d="M17 6v6M14 9h6"></path>
                </svg>
                <span>Leads Kreator</span>
              </a>
              <a class="nav-item${isLeveling}" href="${prefix}data_master/master_pendukung/spvkol_Leveling_Kreator.html">
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <span>Leveling Kreator</span>
              </a>
              <a class="nav-item${isAds}" href="${prefix}data_master/master_pendukung/spvkol_Ads_Account.html">
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="8" cy="9" r="3"></circle>
                  <circle cx="16" cy="9" r="3"></circle>
                  <path d="M2.5 20c.6-3.2 2.4-5 5.5-5 1.5 0 2.7.4 3.6 1.1"></path>
                  <path d="M12.4 16.1c.9-.7 2.1-1.1 3.6-1.1 3.1 0 4.9 1.8 5.5 5"></path>
                </svg>
                <span>Ads Account</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </nav>

    <div class="sidebar-footer">
      <div class="sidebar-user-card">
        <img src="${mediaPrefix}avatar.png" alt="Rayi" class="sidebar-user-avatar" />
        <div class="sidebar-user-info">
          <span class="sidebar-user-name">Rayi</span>
          <span class="sidebar-user-role">SPV KOL</span>
        </div>
        <a href="${logoutHref}" class="sidebar-logout-btn" title="Logout" aria-label="Logout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sidebar-logout-icon">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </a>
      </div>
    </div>
  </aside>`;
}

function processFile(filePath, depth, fileName) {
  let content = fs.readFileSync(filePath, 'utf8');
  let prefix, mediaPrefix, logoutHref;

  if (depth === 0) {
    prefix = '';
    mediaPrefix = '../media/';
    logoutHref = '../index.html';
  } else if (depth === 1) {
    prefix = '../';
    mediaPrefix = '../../media/';
    logoutHref = '../../index.html';
  } else if (depth === 2) {
    prefix = '../../';
    mediaPrefix = '../../../media/';
    logoutHref = '../../../index.html';
  }

  const sidebarRegex = /<aside id="sidebar"[\s\S]*?<\/aside>/i;
  const newSidebar = getSpvSidebar(prefix, mediaPrefix, logoutHref, fileName);

  if (sidebarRegex.test(content)) {
    content = content.replace(sidebarRegex, newSidebar);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[UPDATED] Depth ${depth}: ${fileName}`);
  } else {
    console.warn(`[WARNING] No sidebar found in: ${filePath}`);
  }
}

// 1. Root files (Depth 0)
const rootFiles = ['spvkol_dashboard.html', 'spvkol_kalender.html'];
rootFiles.forEach(f => {
  const p = path.join(spvKolDir, f);
  if (fs.existsSync(p)) processFile(p, 0, f);
});

// 2. Subfolders (Depth 1)
const depth1Folders = ['absensi', 'dokumen_kolaborasi', 'perancangan_kerja', 'kinerja', 'operasional', 'data_master'];
depth1Folders.forEach(sub => {
  const d = path.join(spvKolDir, sub);
  if (!fs.existsSync(d)) return;
  fs.readdirSync(d).forEach(f => {
    if (!f.endsWith('.html')) return;
    processFile(path.join(d, f), 1, f);
  });
});

// 3. Nested Subfolder (Depth 2: data_master/master_pendukung)
const depth2Dir = path.join(spvKolDir, 'data_master', 'master_pendukung');
if (fs.existsSync(depth2Dir)) {
  fs.readdirSync(depth2Dir).forEach(f => {
    if (!f.endsWith('.html')) return;
    processFile(path.join(depth2Dir, f), 2, f);
  });
}

console.log('Finished updating all 26 SPV KOL sidebars seamlessly!');
