const fs = require('fs');
const path = require('path');

const rootDir = 'd:/SOFTWARE/laragon/www/siBisaHadir.v2';
const spvKolDir = path.join(rootDir, 'SpvKol');
const staffKolDir = path.join(rootDir, 'StaffKol');

function getFullSidebar(prefix, activePage) {
  const isDash = activePage === 'staffkol_dashboard.html' ? ' nav-item--active' : '';
  const isKalender = activePage === 'staffkol_kalender.html' ? ' nav-item--active' : '';
  
  const isKehadiran = activePage === 'staffkol_kehadiran.html' ? ' nav-item--active' : '';
  const isIstirahat = activePage === 'staffkol_presensi_istirahat.html' ? ' nav-item--active' : '';
  const isLembur = activePage === 'staffkol_presensi_lembur.html' ? ' nav-item--active' : '';
  const isAbsensiGroup = (isKehadiran || isIstirahat || isLembur) ? '' : ' is-collapsed';

  const isDashCampaign = activePage === 'staffkol_dashboard_campaign.html' ? ' nav-item--active' : '';
  const isCampaign = activePage === 'staffkol_campaign.html' ? ' nav-item--active' : '';
  const isTrackingSampel = activePage === 'staffkol_tracking_sampel.html' ? ' nav-item--active' : '';
  const isKreator = activePage === 'staffkol_kreator.html' ? ' nav-item--active' : '';
  const isPerformaKreator = activePage === 'staffkol_Performa_Kreator.html' ? ' nav-item--active' : '';
  const isOprasionalGroup = (isDashCampaign || isCampaign || isTrackingSampel || isKreator || isPerformaKreator) ? '' : ' is-collapsed';

  const isFolder = activePage === 'staffkol_folder.html' ? ' nav-item--active' : '';
  const isDokumenGroup = isFolder ? '' : ' is-collapsed';

  const isRrk = activePage === 'staffkol_rrk.html' ? ' nav-item--active' : '';
  const isMilestone = activePage === 'staffkol_Milestone.html' ? ' nav-item--active' : '';
  const isTugas = activePage === 'staffkol_tugas.html' ? ' nav-item--active' : '';
  const isProject = activePage === 'staffkol_project.html' ? ' nav-item--active' : '';
  const isLaporan = activePage === 'staffkol_laporan.html' ? ' nav-item--active' : '';
  const isPengaduan = activePage === 'staffkol_pengaduan.html' ? ' nav-item--active' : '';
  const isPerancanganGroup = (isRrk || isMilestone || isTugas || isProject || isLaporan || isPengaduan) ? '' : ' is-collapsed';

  const isEvaluasi = activePage === 'staffkol_evaluasi_kinerja.html' ? ' nav-item--active' : '';
  const isTarget = activePage === 'staffkol_target_capaian.html' ? ' nav-item--active' : '';
  const isUpgrade = (activePage === 'staffkol_upgrade_skill.html' || activePage === 'staffkol_rencana_karier.html') ? ' nav-item--active' : '';
  const isKinerjaGroup = (isEvaluasi || isTarget || isUpgrade) ? '' : ' is-collapsed';

  return `  <aside id="sidebar" class="sidebar kol-sidebar">
    <div class="sidebar-brand">
      <img class="brand-logo brand-logo--sidebar" src="${prefix}media/logo.png" alt="Logo Bisa Media" />
      <span class="brand-name brand-name--dark">Bisa Media</span>
    </div>

    <nav class="sidebar-nav" aria-label="Menu utama">
      <a class="nav-item${isDash}" href="${prefix}staffkol_dashboard.html">
        <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3.5 10.5L12 3l8.5 7.5"></path>
          <path d="M5.5 9.5V21h13V9.5"></path>
          <path d="M9.5 21v-6h5v6"></path>
        </svg>
        <span>Dashboard</span>
      </a>

      <a class="nav-item${isKalender}" href="${prefix}staffkol_kalender.html">
        <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span>Kalender</span>
      </a>

      <section class="nav-group${isAbsensiGroup}">
        <button class="nav-group__toggle" type="button">
          <span>Kehadiran</span>
          <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 9l5 5 5-5"></path>
          </svg>
        </button>

        <div class="nav-group__items">
          <a class="nav-item${isKehadiran}" href="${prefix}absensi/staffkol_kehadiran.html">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>Kehadiran</span>
          </a>

          <a class="nav-item${isIstirahat}" href="${prefix}absensi/staffkol_presensi_istirahat.html">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
              <line x1="6" y1="1" x2="6" y2="4"></line>
              <line x1="10" y1="1" x2="10" y2="4"></line>
              <line x1="14" y1="1" x2="14" y2="4"></line>
            </svg>
            <span>Absensi Istirahat</span>
          </a>

          <a class="nav-item${isLembur}" href="${prefix}absensi/staffkol_presensi_lembur.html">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Absensi Lembur</span>
          </a>
        </div>
      </section>

      <section class="nav-group${isOprasionalGroup}">
        <button class="nav-group__toggle" type="button">
          <span>Oprasional</span>
          <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 9l5 5 5-5"></path>
          </svg>
        </button>

        <div class="nav-group__items">
          <a class="nav-item${isDashCampaign}" href="${prefix}operasional/staffkol_dashboard_campaign.html">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3.5 10.5L12 3l8.5 7.5"></path>
              <path d="M5.5 9.5V21h13V9.5"></path>
              <path d="M9.5 21v-6h5v6"></path>
            </svg>
            <span>Dashboard Campaign</span>
          </a>

          <a class="nav-item${isCampaign}" href="${prefix}operasional/staffkol_campaign.html">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 13h3l9 4V7l-9 4H4z"></path>
              <path d="M7 13l1.5 5"></path>
              <path d="M18 9.5c1 .6 1.5 1.4 1.5 2.5S19 13.9 18 14.5"></path>
            </svg>
            <span>Campaign</span>
          </a>

          <a class="nav-item${isTrackingSampel}" href="${prefix}operasional/staffkol_tracking_sampel.html">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10" cy="10" r="5"></circle>
              <path d="M14 14l6 6"></path>
              <path d="M8 10h4M10 8v4"></path>
            </svg>
            <span>Tracking Sampel</span>
          </a>

          <a class="nav-item${isKreator}" href="${prefix}operasional/staffkol_kreator.html">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="9" cy="8" r="3"></circle>
              <path d="M3.5 19c.6-3.4 2.4-5.2 5.5-5.2s4.9 1.8 5.5 5.2"></path>
              <circle cx="17" cy="9" r="2"></circle>
              <path d="M15.5 14.5c2.7-.3 4.4 1.2 5 4"></path>
            </svg>
            <span>Kreator</span>
          </a>

          <a class="nav-item" href="#">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="7" r="4"></circle>
              <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"></path>
              <polyline points="16 3 20 7 16 11"></polyline>
            </svg>
            <span>Tracking Kreator</span>
          </a>

          <a class="nav-item${isPerformaKreator}" href="${prefix}operasional/staffkol_Performa_Kreator.html">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
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
          <span>Dokumen & Kolaborasi</span>
          <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 9l5 5 5-5"></path>
          </svg>
        </button>

        <div class="nav-group__items">
          <a class="nav-item${isFolder}" href="${prefix}dokumen_kolaborasi/staffkol_folder.html">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>My Folders</span>
          </a>
        </div>
      </section>

      <section class="nav-group${isPerancanganGroup}">
        <button class="nav-group__toggle" type="button">
          <span>Perancangan Kerja</span>
          <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 9l5 5 5-5"></path>
          </svg>
        </button>

        <div class="nav-group__items">
          <a class="nav-item${isRrk}" href="${prefix}perancangan_kerja/staffkol_rrk.html">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 21V4"></path>
              <path d="M5 5h11l-2 4 2 4H5"></path>
            </svg>
            <span>RRK</span>
          </a>

          <a class="nav-item${isMilestone}" href="${prefix}perancangan_kerja/staffkol_Milestone.html">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 21V4"></path>
              <path d="M5 5h11l-2 4 2 4H5"></path>
              <circle cx="18.5" cy="17.5" r="2.5"></circle>
            </svg>
            <span>Milestone</span>
          </a>

          <a class="nav-item${isTugas}" href="${prefix}perancangan_kerja/staffkol_tugas.html">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="4" y="4" width="16" height="16" rx="3"></rect>
              <path d="M8 12l2.5 2.5L16 9"></path>
            </svg>
            <span>Tugas</span>
          </a>

          <a class="nav-item${isProject}" href="${prefix}perancangan_kerja/staffkol_project.html">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            <span>Project</span>
          </a>

          <a class="nav-item${isLaporan}" href="${prefix}perancangan_kerja/staffkol_laporan.html">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>Laporan</span>
          </a>

          <a class="nav-item${isPengaduan}" href="${prefix}perancangan_kerja/staffkol_pengaduan.html">
            <svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>Pengaduan</span>
          </a>
        </div>
      </section>

      <section class="nav-group${isKinerjaGroup}">
        <button class="nav-group__toggle" type="button">
          <span>Kinerja</span>
          <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 9l5 5 5-5"></path>
          </svg>
        </button>

        <div class="nav-group__items">
          <a class="nav-item${isEvaluasi}" href="${prefix}kinerja/staffkol_evaluasi_kinerja.html">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>Evaluasi Kinerja</span>
          </a>

          <a class="nav-item${isTarget}" href="${prefix}kinerja/staffkol_target_capaian.html">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="6"></circle>
              <circle cx="12" cy="12" r="2"></circle>
            </svg>
            <span>Target & Capaian Kerja</span>
          </a>

          <a class="nav-item${isUpgrade}" href="${prefix}kinerja/staffkol_upgrade_skill.html">
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
    </nav>
  </aside>`;
}

function processHtmlFile(filePath, isRoot, fileName) {
  let content = fs.readFileSync(filePath, 'utf8');
  const prefix = isRoot ? '' : '../';

  // Replace entire <aside ...> ... </aside>
  const sidebarRegex = /<aside id="sidebar"[\s\S]*?<\/aside>/i;
  const newSidebar = getFullSidebar(prefix, fileName);

  if (sidebarRegex.test(content)) {
    content = content.replace(sidebarRegex, newSidebar);
  }

  // Update topbar user title to "Staff KOL"
  content = content.replace(/Supervisi KOL/g, 'Staff KOL');
  content = content.replace(/Spv KOL/g, 'Staff KOL');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Cleanly updated: ${filePath}`);
}

// 1. Process all subfolders
const subfolders = ['absensi', 'dokumen_kolaborasi', 'perancangan_kerja', 'kinerja', 'operasional'];

subfolders.forEach(sub => {
  const dirPath = path.join(staffKolDir, sub);
  if (!fs.existsSync(dirPath)) return;

  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    if (!file.endsWith('.html')) return;
    const fullPath = path.join(dirPath, file);
    processHtmlFile(fullPath, false, file);
  });
});

// 2. Process root files
['staffkol_dashboard.html', 'staffkol_kalender.html'].forEach(file => {
  const fullPath = path.join(staffKolDir, file);
  if (fs.existsSync(fullPath)) {
    processHtmlFile(fullPath, true, file);
  }
});

console.log('Finished updating all Staff KOL sidebars seamlessly!');
