/* Owner custom JS (Sneat)
 *
 * Fitur:
 * 1) Footer year otomatis.
 * 2) Tombol Aksi (Lihat / Edit / Hapus) berfungsi untuk  (tanpa backend):
 *    - Lihat: buka modal detail (khusus link yang href="#")
 *    - Edit: buka modal form, simpan akan update row
 *    - Hapus: konfirmasi lalu hapus row dan re-number kolom "#"
 * 3) Tombol Tambah berfungsi (button ditulis di HTML).
 * 4) Mini Calendar (khusus halaman Kalender) tetap jalan.
 */
(function () {
  'use strict';

  // ==============================================================
  // Theme (Light / Dark) - custom for Sneat FREE
  // - FREE version doesn't ship dark theme css, so we override via our style.css
  // - Persist selection in localStorage
  // ==============================================================
  const THEME_KEY = 'ceoTheme';
  const htmlEl = document.documentElement;

  function getSystemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function getSavedTheme() {
    const t = (localStorage.getItem(THEME_KEY) || '').trim();
    return (t === 'dark' || t === 'light') ? t : '';
  }

  function applyTheme(theme) {
    const t = (theme === 'dark') ? 'dark' : 'light';
    htmlEl.setAttribute('data-ceo-theme', t);

    // optional: keep Sneat's own class for compatibility (even if free css is light-only)
    htmlEl.classList.toggle('dark-style', t === 'dark');
    htmlEl.classList.toggle('light-style', t !== 'dark');

    const btn = document.getElementById('ceoThemeToggle');
    if (btn) {
      btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('title', t === 'dark' ? 'Light mode' : 'Dark mode');
      const icon = btn.querySelector('i');
      if (icon) icon.className = t === 'dark' ? 'bx bx-sun' : 'bx bx-moon';
    }
  }

  function ensureThemeToggle() {
    // Sneat navbar right area
    const ul = document.querySelector('.navbar-nav.flex-row.align-items-center.ms-auto');
    if (!ul) return;
    if (document.getElementById('ceoThemeToggle')) return;

    const li = document.createElement('li');
    li.className = 'nav-item me-2';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'ceoThemeToggle';
    btn.className = 'btn btn-icon btn-outline-secondary btn-sm';
    btn.innerHTML = '<i class="bx bx-moon"></i>';
    btn.addEventListener('click', () => {
      const current = htmlEl.getAttribute('data-ceo-theme') === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });

    li.appendChild(btn);
    // inject before user dropdown (last item usually avatar)
    ul.insertBefore(li, ul.firstElementChild);
  }

  // init theme ASAP (before heavy init)
  const savedTheme = getSavedTheme();
  applyTheme(savedTheme || getSystemTheme());
  ensureThemeToggle();

  // If user never chooses manually, follow system changes
  if (!savedTheme && window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener?.('change', () => applyTheme(getSystemTheme()));
  }

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  // expose for other modules (avoid duplicated helpers)
  window.ceo$ = $;
  window.ceo$$ = $$;

  // Fallback ringan agar modal CRUD tetap bisa dibuka saat file HTML dijalankan offline
  // dan CDN Bootstrap belum berhasil termuat. Jika Bootstrap asli tersedia, bagian ini tidak mengubah apa pun.
  if (!window.bootstrap) window.bootstrap = {};
  if (!window.bootstrap.Modal) {
    const modalStore = new WeakMap();
    window.bootstrap.Modal = class {
      constructor(el) { this.el = el; }
      static getOrCreateInstance(el) {
        if (!el) return { show() { }, hide() { } };
        if (!modalStore.has(el)) modalStore.set(el, new window.bootstrap.Modal(el));
        return modalStore.get(el);
      }
      show() {
        const el = this.el;
        if (!el) return;
        el.classList.add('show');
        el.style.display = 'block';
        el.removeAttribute('aria-hidden');
        el.setAttribute('aria-modal', 'true');
        document.body.classList.add('modal-open');
      }
      hide() {
        const el = this.el;
        if (!el) return;
        el.classList.remove('show');
        el.style.display = 'none';
        el.setAttribute('aria-hidden', 'true');
        el.removeAttribute('aria-modal');
        document.body.classList.remove('modal-open');
        el.dispatchEvent(new Event('hidden.bs.modal'));
      }
    };
  }

  document.addEventListener('click', (e) => {
    const closeBtn = e.target?.closest?.('[data-bs-dismiss="modal"]');
    if (!closeBtn) return;
    const modalEl = closeBtn.closest('.modal');
    if (!modalEl || !window.bootstrap?.Modal) return;
    window.bootstrap.Modal.getOrCreateInstance(modalEl).hide();
  });

  function ensureCeoToastContainer() {
    let el = document.getElementById('ceoToastStack');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'ceoToastStack';
    el.className = 'ceo-toast-stack';
    document.body.appendChild(el);
    return el;
  }

  function showCeoToast(message, variant = 'success') {
    const stack = ensureCeoToastContainer();
    const toast = document.createElement('div');
    toast.className = `ceo-toast ceo-toast--${variant}`;
    toast.innerHTML = `
      <div class="ceo-toast__icon"><i class="bx ${variant === 'danger' ? 'bx-x-circle' : variant === 'warning' ? 'bx-error-circle' : 'bx-check-circle'}"></i></div>
      <div class="ceo-toast__body">
        <div class="ceo-toast__title">${variant === 'danger' ? 'Gagal' : variant === 'warning' ? 'Perhatian' : 'Berhasil'}</div>
        <div class="ceo-toast__text">${escapeHtml(message || '')}</div>
      </div>
      <button type="button" class="ceo-toast__close" aria-label="Tutup"><i class="bx bx-x"></i></button>
    `;
    stack.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('is-show'));
    const remove = () => {
      toast.classList.remove('is-show');
      setTimeout(() => toast.remove(), 180);
    };
    toast.querySelector('.ceo-toast__close')?.addEventListener('click', remove);
    setTimeout(remove, 2400);
  }

  window.ceoToast = showCeoToast;

  function normalizeFeatureTitle(title = '') {
    const raw = String(title || '').replace(/\s+/g, ' ').trim();
    if (!raw) return '';

    return raw
      .replace(/^(lihat|view|edit|ubah|tambah|add|hapus|delete|delate)\s*/i, '')
      .replace(/^data\s+dari\s+/i, '')
      .replace(/^\((.*)\)$/, '$1')
      .replace(/^data\s+/i, '')
      .replace(/^"(.*)"$/, '$1')
      .replace(/^'(.*)'$/, '$1')
      .replace(/\s*ini\??$/i, '')
      .replace(/\s*\([^)]*\)\s*$/g, '')
      .trim();
  }

  function getModalActionTitle(mode, featureTitle = '') {
    const action = mode === 'view' ? 'Lihat' : (mode === 'edit' ? 'Edit' : 'Tambah');
    const feature = normalizeFeatureTitle(featureTitle);
    return feature ? `${action} ${feature}` : action;
  }

  function getDeleteActionTitle(featureTitle = '') {
    const feature = normalizeFeatureTitle(featureTitle);
    return feature ? `Hapus ${feature}` : 'Hapus';
  }

  function inferFeatureFromDeleteMessage(message = '') {
    const text = String(message || '').replace(/\s+/g, ' ').trim();
    if (!text) return '';

    const quoted = text.match(/["“”]([^"“”]+)["“”]/);
    if (quoted && quoted[1]) return normalizeFeatureTitle(quoted[1]);

    return normalizeFeatureTitle(
      text
        .replace(/^yakin\s+ingin\s+menghapus\s+/i, '')
        .replace(/^hapus\s+/i, '')
        .replace(/^delete\s+/i, '')
        .replace(/^delate\s+/i, '')
        .replace(/^data\s+/i, '')
        .replace(/\s+ini\??$/i, '')
        .replace(/\?$/g, '')
    );
  }

  function isCrudFieldFullWidth(label = '') {
    const t = String(label || '').trim().toLowerCase();
    return ['alamat', 'catatan', 'keterangan', 'deskripsi', 'peserta', 'preview sampul', 'gambar sampul', 'peraturan perusahaan'].some((x) => t.includes(x));
  }

  function isCrudFieldTextarea(label = '') {
    const t = String(label || '').trim().toLowerCase();
    return ['alamat', 'catatan', 'keterangan', 'deskripsi', 'peraturan perusahaan'].some((x) => t.includes(x));
  }

  function setModalActionTitle(el, mode, featureTitle = '') {
    if (!el) return;
    const baseTitle = normalizeFeatureTitle(featureTitle || el.dataset.ceoFeatureTitle || el.textContent || '');
    if (baseTitle) el.dataset.ceoFeatureTitle = baseTitle;
    el.textContent = getModalActionTitle(mode, baseTitle);
  }


  // ==============================================================
  // Footer year
  // ==============================================================
  const yn = $('#yearNow');
  if (yn) yn.textContent = String(new Date().getFullYear());


  // ==============================================================
  // Sidebar Toggle (Hamburger)
  // IMPORTANT:
  // - Sneat sudah punya menu.js + main.js yang meng-handle `.layout-menu-toggle`.
  // - Jika kita toggle lagi via custom JS, klik hamburger bisa DOUBLE-trigger
  //   (efeknya: layout "geser ke samping" aneh lalu balik).
  // - Jadi di sini kita HANYA:
  //   (a) restore state collapse desktop dari localStorage,
  //   (b) listen pasca-click untuk menyimpan state terbaru.
  // ==============================================================
  const MENU_KEY = 'ceoMenuCollapsed';

  function isDesktop() {
    return window.innerWidth >= 1200; // Bootstrap xl breakpoint
  }

  function applyMenuCollapsed(collapsed) {
    htmlEl.classList.toggle('layout-menu-collapsed', !!collapsed);
  }

  // restore saved state (desktop only)
  const savedMenu = localStorage.getItem(MENU_KEY);
  if (savedMenu === '1' && isDesktop()) applyMenuCollapsed(true);

  // After Sneat handles the toggle, persist the result.
  document.addEventListener(
    'click',
    (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      if (!t.closest('a.layout-menu-toggle, .layout-menu-toggle a, .layout-menu-toggle')) return;

      // delay: wait Sneat's handler to finish first
      window.setTimeout(() => {
        if (!isDesktop()) return;
        const collapsed = htmlEl.classList.contains('layout-menu-collapsed');
        localStorage.setItem(MENU_KEY, collapsed ? '1' : '0');
      }, 0);
    },
    true // capture phase
  );

  // keep state sane when resizing
  window.addEventListener('resize', () => {
    if (!isDesktop()) {
      htmlEl.classList.remove('layout-menu-collapsed');
    } else if (localStorage.getItem(MENU_KEY) === '1') {
      applyMenuCollapsed(true);
    }
  });

  // ==============================================================
  // Feature flags / removed pages
  // ==============================================================
  const Owner_REMOVED_HREFS = new Set(['BM_staff.html', 'BM_Lihat_staff.html', 'BM_payroll.html', 'BM_penugasan_rrk.html']);

  function normalizeHref(href) {
    const h = String(href || '').trim();
    if (!h) return '';
    return h.split('#')[0].split('?')[0].trim();
  }

  function pruneRemovedMenuItems() {
    // Remove Staff menu item (feature removed)
    $$('#layout-menu a.menu-link[href]').forEach((a) => {
      const href = normalizeHref(a.getAttribute('href'));
      if (!Owner_REMOVED_HREFS.has(href)) return;
      const li = a.closest('li.menu-item');
      if (li) li.remove();
    });

    // Redirect if user opened removed page directly
    const cur = normalizeHref((window.location.pathname || '').split('/').pop());
    if (Owner_REMOVED_HREFS.has(cur)) {
      window.location.replace(cur === 'BM_payroll.html' ? 'BM_kehadiran.html' : 'BM_jabatan.html');
    }
  }

  // ==============================================================
  // Sidebar text overrides
  // ==============================================================
  const SIDEBAR_MENU_TEXT = {
    headers: {
      'Data SDM': 'Data Karyawan',
    },
    items: {
      'Data Karyawan': 'Karyawan',
    },
  };

  function applySidebarTextOverrides() {
    const menuRoot = document.getElementById('layout-menu');
    if (!menuRoot) return;

    $$('.menu-header-text', menuRoot).forEach((el) => {
      const raw = String(el.textContent || '').trim();
      const next = SIDEBAR_MENU_TEXT.headers[raw];
      if (next) el.textContent = next;
    });

    $$('.menu-item > a.menu-link > div', menuRoot).forEach((el) => {
      const raw = String(el.textContent || '').trim();
      const next = SIDEBAR_MENU_TEXT.items[raw];
      if (next) el.textContent = next;
    });
  }

  // ==============================================================
  // Sidebar Menu Header "Dropdown" (collapse per section)
  // ==============================================================
  const MENU_HDR_KEY = 'ceoMenuHeaderCollapsedV1';

  function initMenuHeaderDropdowns() {
    const headers = $$('#layout-menu .menu-inner > li.menu-header');
    if (!headers.length) return;

    const state = (() => {
      try { return JSON.parse(localStorage.getItem(MENU_HDR_KEY) || '{}') || {}; }
      catch { return {}; }
    })();

    const saveState = () => {
      try { localStorage.setItem(MENU_HDR_KEY, JSON.stringify(state)); } catch { }
    };

    headers.forEach((hdr) => {
      const title = (hdr.querySelector('.menu-header-text')?.textContent || hdr.textContent || '').trim();
      if (!title) return;

      hdr.classList.add('bm-mh');
      hdr.setAttribute('role', 'button');
      hdr.tabIndex = 0;

      if (!hdr.querySelector('.bm-mh__chev')) {
        const chev = document.createElement('i');
        chev.className = 'bx bx-chevron-down bm-mh__chev';
        hdr.appendChild(chev);
      }

      // collect section items until next header
      const sectionItems = [];
      let n = hdr.nextElementSibling;
      while (n && !n.classList.contains('menu-header')) {
        if (n.classList.contains('menu-item')) sectionItems.push(n);
        n = n.nextElementSibling;
      }

      const hasActiveItem = sectionItems.some((it) => it.classList.contains('active'));

      const apply = (collapsed) => {
        // Section yang sedang aktif tetap dibuka agar user tidak kehilangan posisi menu.
        const nextCollapsed = hasActiveItem ? false : !!collapsed;
        hdr.classList.toggle('is-collapsed', nextCollapsed);
        sectionItems.forEach((it) => { it.style.display = nextCollapsed ? 'none' : ''; });
      };

      apply(!!state[title]);

      const toggle = () => {
        state[title] = !state[title];
        apply(!!state[title]);
        saveState();
      };

      hdr.addEventListener('click', toggle);
      hdr.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });
    });
  }


  function ensureSidebarFeatureExtensions() {
    return;
  }

  // Run before building MENU_INDEX
  pruneRemovedMenuItems();
  applySidebarTextOverrides();
  ensureSidebarFeatureExtensions();
  initMenuHeaderDropdowns();

  // ==============================================================
  // Navbar Search (search menu items in sidebar)
  // ==============================================================
  function buildMenuIndex() {
    return $$('#layout-menu a.menu-link[href]').map((a) => {
      const title = (a.querySelector('div')?.textContent || a.textContent || '').trim();
      const href = (a.getAttribute('href') || '').trim();
      const icon = a.querySelector('i')?.className || 'bx bx-right-arrow-alt';
      return {
        title,
        href,
        icon,
        hay: (title + ' ' + href).toLowerCase(),
      };
    }).filter((x) => x.title && x.href && !x.href.startsWith('javascript') && !Owner_REMOVED_HREFS.has(normalizeHref(x.href)));
  }

  const MENU_INDEX = buildMenuIndex();

  function initNavbarSearch() {
    const input = $('#ceoNavSearch');
    if (!input) return;

    const menuEl = input.parentElement?.querySelector('.ceo-search-menu');
    if (!menuEl) return;

    let activeIndex = -1;
    let currentResults = [];

    function close() {
      menuEl.classList.remove('show');
      menuEl.innerHTML = '';
      activeIndex = -1;
      currentResults = [];
    }

    function open(results) {
      currentResults = results;
      menuEl.innerHTML = results.map((r, i) => `
        <a class="dropdown-item d-flex align-items-center gap-2 ${i === 0 ? 'active' : ''}" href="${r.href}" data-idx="${i}">
          <i class="${r.icon}"></i>
          <span class="flex-grow-1">${r.title}</span>
        </a>
      `).join('');

      activeIndex = results.length ? 0 : -1;
      if (results.length) menuEl.classList.add('show');
      else close();
    }

    function setActive(next) {
      const items = $$('a.dropdown-item', menuEl);
      if (!items.length) return;
      activeIndex = Math.max(0, Math.min(items.length - 1, next));
      items.forEach((it, idx) => it.classList.toggle('active', idx === activeIndex));
      items[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }

    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      if (!q) return close();
      const results = MENU_INDEX
        .filter((m) => m.hay.includes(q))
        .slice(0, 8);
      open(results);
    });

    input.addEventListener('keydown', (e) => {
      if (!menuEl.classList.contains('show')) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive(activeIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive(activeIndex - 1);
      } else if (e.key === 'Enter') {
        const pick = currentResults[activeIndex] || currentResults[0];
        if (pick) {
          e.preventDefault();
          window.location.href = pick.href;
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    });

    // click on suggestion
    menuEl.addEventListener('click', (e) => {
      const a = e.target.closest('a.dropdown-item');
      if (!a) return;
      // normal navigation will happen
      close();
    });

    // close when clicking outside
    document.addEventListener('click', (e) => {
      if (e.target === input) return;
      if (menuEl.contains(e.target)) return;
      close();
    });

    // close on blur (after click)
    input.addEventListener('blur', () => setTimeout(close, 120));
  }

  initNavbarSearch();

  // ==============================================================
  // Mark tables that already have their own custom modal handler
  // so generic CRUD modal does not open twice.
  // ==============================================================
  function markCustomCrudTables() {
    [
      'tblSubPerusahaan',
      'tblDivisi',
      'tblJabatan',
      'tblKaryawan',
      'tblKontrak',
      'tblKaryawanDivisi',
      'tblKegiatanKaryawan',
      'tblRrk',
      'tblReportPengerjaan',
      'tblKunjunganKaryawan',
      'tblAkunKaryawan',
      'tblSkenarioJamKerja'
    ].forEach((id) => {
      const tableEl = document.getElementById(id);
      if (tableEl) tableEl.dataset.ceoCustomCrud = '1';
    });
  }

  markCustomCrudTables();

  // ==============================================================
  // CRUD Tables (Static)
  // ==============================================================
  function getTableMeta(table) {
    // Root yang dikirim sudah berupa elemen <table>, jadi selector tidak boleh diawali `.table`.
    // Kalau memakai `.table thead th`, browser mencari tabel lain di dalam tabel ini dan hasilnya kosong.
    const ths = $$('thead th', table).map((th) => th.textContent.trim());
    const aksiIdx = ths.findIndex((t) => t.toLowerCase() === 'aksi');
    return { ths, aksiIdx };
  }

  function getCardTitleFromTable(table) {
    const card = table.closest('.card');
    const header = card ? card.querySelector('.card-header') : null;
    const heading = header ? header.querySelector('h1, h2, h3, h4, h5, h6, .card-title') : null;
    const title = heading ? heading.textContent.trim() : (header ? header.textContent.trim() : '');
    return normalizeFeatureTitle(title) || 'Data';
  }

  const CEO_CUSTOM_CRUD_IDS = new Set([
    'tblInstruksiTugas',
    'tblPenilaianKaryawan',
    'tblKehadiranV2',
    'tblIstirahatV2',
    'tblLemburV2',
    'tblSubPerusahaan',
    'tblDivisi',
    'tblJabatan',
    'tblKaryawan',
    'tblKontrak',
    'tblKaryawanDivisi',
    'tblKegiatanKaryawan',
    'tblKunjunganKaryawan',
    'tblAkunKaryawan',
    'tblAkunUser',
    'tblSkenarioJamKerja',
    'tblWaktuLibur',
    'tblRrk',
    'tblReportPengerjaan',
  ]);

  // Tabel absensi hanya boleh punya aksi Lihat + Hapus.
  // Jangan biarkan auto-sync CRUD menambahkan tombol Edit lagi.
  const BM_NO_EDIT_TABLE_IDS = new Set([
    'tblKehadiranV2',
    'tblIstirahatV2',
    'tblLemburV2',
  ]);

  function removeEditButtonsForNoEditTables(root = document) {
    BM_NO_EDIT_TABLE_IDS.forEach((tableId) => {
      const table = root.getElementById ? root.getElementById(tableId) : document.getElementById(tableId);
      if (!table) return;
      $$('button, a', table).forEach((control) => {
        const iconClass = control.querySelector('i')?.className || '';
        if (isActionButton(control, ['edit']) || iconClass.includes('bx-edit-alt')) control.remove();
      });
    });
  }

  function getActionFeatureFromActionsCell(actionsCell) {
    const table = actionsCell?.closest?.('table');
    if (!table) return 'Data';
    return getCardTitleFromTable(table);
  }

  function isActionButton(control, words = []) {
    const title = String(control?.getAttribute?.('title') || '').toLowerCase();
    const aria = String(control?.getAttribute?.('aria-label') || '').toLowerCase();
    const hay = `${title} ${aria}`;
    return words.some((word) => hay.includes(word));
  }

  function ensureCrudActionButtons(root = document) {
    $$('.tdActions', root).forEach((cell) => {
      const table = cell.closest('table');
      if (!table) return;
      const tableId = String(table.id || '').trim();
      if (table.dataset.ceoCustomCrud === '1' || CEO_CUSTOM_CRUD_IDS.has(tableId)) return;

      if (BM_NO_EDIT_TABLE_IDS.has(tableId)) {
        removeEditButtonsForNoEditTables(document);
        return;
      }

      const box = cell.querySelector('.d-flex') || cell;
      const approvalIds = new Set(['tblCutiPengajuan', 'tblIzinTerlambatPulangCepat', 'tblPengajuanLembur', 'tblPembiayaan', 'tblReimbursement', 'tblPerjalananDinas']);
      const isApprovalTable = approvalIds.has(tableId);
      const setApprovalBtn = (btn) => {
        btn.dataset.ceoApprovalAction = '1';
        btn.className = 'btn btn-sm btn-outline-primary';
        btn.setAttribute('title', 'Persetujuan');
        btn.setAttribute('aria-label', 'Persetujuan');
        btn.innerHTML = '<i class="bx bx-check-shield me-1"></i>Persetujuan';
      };
      if (isApprovalTable) {
        Array.from(cell.querySelectorAll('button')).filter((btn) => isActionButton(btn, ['edit']) || !!btn.querySelector('.bx-edit-alt')).forEach(setApprovalBtn);
      }
      const hasEdit = !!cell.querySelector('button[title*="Edit"], button[aria-label*="Edit"], .bx-edit-alt');
      const hasApproval = !!cell.querySelector('button[data-ceo-approval-action], button[title*="Persetujuan"], button[aria-label*="Persetujuan"]');
      if ((!isApprovalTable && hasEdit) || (isApprovalTable && hasApproval)) return;

      const deleteBtn = Array.from(cell.querySelectorAll('button, a')).find((btn) => {
        return isActionButton(btn, ['hapus', 'delete', 'delate']) || !!btn.querySelector('.bx-trash');
      });

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      if (isApprovalTable) {
        editBtn.dataset.ceoApprovalAction = '1';
        editBtn.className = 'btn btn-sm btn-outline-primary';
        editBtn.setAttribute('title', 'Persetujuan');
        editBtn.setAttribute('aria-label', 'Persetujuan');
        editBtn.innerHTML = '<i class="bx bx-check-shield me-1"></i>Persetujuan';
      } else {
        editBtn.className = 'btn btn-sm btn-icon btn-outline-primary';
        editBtn.setAttribute('title', 'Edit');
        editBtn.setAttribute('aria-label', 'Edit');
        editBtn.innerHTML = '<i class="bx bx-edit-alt"></i>';
      }

      if (deleteBtn && deleteBtn.parentElement === box) box.insertBefore(editBtn, deleteBtn);
      else box.appendChild(editBtn);
    });
  }

  function applyActionLabelsToTables(root = document) {
    $$('.tdActions', root).forEach((cell) => {
      const feature = getActionFeatureFromActionsCell(cell);

      cell.querySelectorAll('a, button').forEach((control) => {
        const iconClass = control.querySelector('i')?.className || '';
        const isView = isActionButton(control, ['lihat', 'view']) || iconClass.includes('bx-show');
        const isEdit = isActionButton(control, ['edit']) || iconClass.includes('bx-edit-alt');
        const isDelete = isActionButton(control, ['hapus', 'delete', 'delate']) || iconClass.includes('bx-trash');

        let label = '';
        if (isView) label = getModalActionTitle('view', feature);
        else if (isEdit) label = getModalActionTitle('edit', feature);
        else if (isDelete) label = getDeleteActionTitle(feature);
        if (!label) return;

        control.setAttribute('title', label);
        control.setAttribute('aria-label', label);
      });
    });
  }

  function refreshCrudActions(root = document) {
    removeEditButtonsForNoEditTables(root);
    ensureCrudActionButtons(root);
    removeEditButtonsForNoEditTables(root);
    applyActionLabelsToTables(root);
  }

  window.ceoApplyActionLabels = applyActionLabelsToTables;
  window.ceoRefreshCrudActions = refreshCrudActions;
  window.ceoGetDeleteActionTitle = getDeleteActionTitle;

  function ensureCrudModal() {
    let el = $('#crudModal');
    if (el) return el;

    el = document.createElement('div');
    el.className = 'modal fade';
    el.id = 'crudModal';
    el.tabIndex = -1;
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="crudModalTitle">Lihat</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" id="crudModalBody"></div>
          <div class="modal-footer" id="crudModalFooter">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Tutup</button>
            <button type="button" class="btn btn-primary" id="crudModalSaveBtn">Simpan</button>
          </div>
        </div>
      </div>
    `.trim();
    document.body.appendChild(el);
    return el;
  }

  function ensureDeleteModal() {
    let el = document.getElementById('ceoDeleteModal');
    if (el) return el;

    el = document.createElement('div');
    el.className = 'modal fade';
    el.id = 'ceoDeleteModal';
    el.tabIndex = -1;
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="ceoDeleteModalTitle">Hapus</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="ceo-crud-view-note" id="ceoDeleteModalMessage">Yakin ingin menghapus data ini?</div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-danger" id="ceoDeleteModalConfirm">Hapus</button>
          </div>
        </div>
      </div>
    `.trim();
    document.body.appendChild(el);
    return el;
  }

  function confirmDelete(message, onConfirm, featureTitle = '') {
    const modalEl = ensureDeleteModal();
    const titleEl = document.getElementById('ceoDeleteModalTitle');
    const msgEl = document.getElementById('ceoDeleteModalMessage');
    const confirmBtn = document.getElementById('ceoDeleteModalConfirm');
    const feature = normalizeFeatureTitle(featureTitle) || inferFeatureFromDeleteMessage(message);
    const actionTitle = getDeleteActionTitle(feature);

    if (titleEl) titleEl.textContent = actionTitle;
    if (msgEl) msgEl.textContent = message || `${actionTitle} ini?`;
    if (confirmBtn) confirmBtn.textContent = 'Hapus';

    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    confirmBtn.onclick = () => {
      modal.hide();
      onConfirm?.();
    };
    modal.show();
  }

  function resetCrudModalFooter(footerEl) {
    if (!footerEl) return;
    footerEl.classList.remove('d-none');
    footerEl.innerHTML = `
      <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Tutup</button>
      <button type="button" class="btn btn-primary" id="crudModalSaveBtn">Simpan</button>
    `.trim();
  }

  function openModal({ mode, title, fields, onSave, viewActions }) {
    const modalEl = ensureCrudModal();
    const titleEl = $('#crudModalTitle', modalEl);
    const bodyEl = $('#crudModalBody', modalEl);
    const footerEl = $('#crudModalFooter', modalEl);
    const crudTableId = fields.find((field) => field && field._tableId)?._tableId || '';
    fields = fields.map((field) => decorateCrudField(field, crudTableId, mode));

    modalEl.dataset.crudTable = crudTableId;
    titleEl.textContent = title || getModalActionTitle(mode);
    bodyEl.innerHTML = '';
    resetCrudModalFooter(footerEl);

    const form = document.createElement('form');
    form.id = 'crudForm';
    form.className = 'ceo-crud-form-grid';

    fields.forEach((f, idx) => {
      const wrap = document.createElement('div');
      const extraFieldClasses = [];
      if (f?.fullWidth || isCrudFieldFullWidth(f.label)) extraFieldClasses.push('ceo-crud-field--full');
      if (Number(f?.span) === 2) extraFieldClasses.push('ceo-crud-field--span-2');
      if (Number(f?.span) === 3) extraFieldClasses.push('ceo-crud-field--span-3');
      if (f?.className) extraFieldClasses.push(String(f.className));
      wrap.className = ['ceo-crud-field', ...extraFieldClasses].join(' ');
      const label = document.createElement('label');
      label.className = 'form-label';
      label.textContent = f.label;

      const useSelect = f?.type === 'select' || Array.isArray(f?.options);
      const useTextarea = !useSelect && isCrudFieldTextarea(f.label);
      let control;

      if (useSelect) {
        control = document.createElement('select');
        control.className = 'form-select';
        const options = Array.isArray(f?.options) ? f.options : [];
        options.forEach((opt) => {
          const optionEl = document.createElement('option');
          if (opt && typeof opt === 'object') {
            optionEl.value = String(opt.value ?? opt.label ?? '');
            optionEl.textContent = String(opt.label ?? opt.value ?? '');
          } else {
            optionEl.value = String(opt ?? '');
            optionEl.textContent = String(opt ?? '');
          }
          if (String(optionEl.value) === String(f.value ?? '')) optionEl.selected = true;
          control.appendChild(optionEl);
        });
      } else if (useTextarea) {
        control = document.createElement('textarea');
        control.className = 'form-control';
        control.rows = mode === 'view' ? 4 : 3;
        control.value = f.value ?? '';
      } else {
        control = document.createElement('input');
        control.className = 'form-control';
        control.type = f?.inputType || 'text';
        control.value = f.value ?? '';
      }

      control.dataset.index = String(idx);
      control.dataset.fieldLabel = String(f.label || '');
      if (f.placeholder && !useSelect) control.placeholder = f.placeholder;
      if (f.required) control.required = true;
      if (f.inputMode) control.inputMode = f.inputMode;
      if (mode === 'view') {
        if (useSelect) {
          control.disabled = !f?.editableInView;
        } else {
          control.readOnly = !f?.editableInView;
        }
      }

      wrap.appendChild(label);
      wrap.appendChild(control);
      if (f.help && mode !== 'view') {
        const help = document.createElement('div');
        help.className = 'form-text bm-field-example';
        help.textContent = f.help;
        wrap.appendChild(help);
      }
      form.appendChild(wrap);
    });

    bodyEl.appendChild(form);

    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);

    if (mode === 'view' && viewActions) {
      footerEl.innerHTML = `
        <div class="w-100 d-flex justify-content-between align-items-center gap-2 flex-wrap">
          <div class="d-flex gap-2" id="crudModalFooterLeft"></div>
          <div class="d-flex gap-2 ms-auto" id="crudModalFooterRight"></div>
        </div>
      `.trim();

      const leftEl = $('#crudModalFooterLeft', footerEl);
      const rightEl = $('#crudModalFooterRight', footerEl);
      const makeBtn = (cfg = {}) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = cfg.className || 'btn btn-outline-secondary';
        btn.textContent = cfg.label || 'Tutup';
        btn.addEventListener('click', () => {
          const result = typeof cfg.onClick === 'function' ? cfg.onClick(modalEl, modal) : undefined;
          if (result !== false && cfg.dismiss !== false) modal.hide();
        });
        return btn;
      };

      (viewActions.left || []).forEach((cfg) => leftEl?.appendChild(makeBtn(cfg)));
      (viewActions.right || []).forEach((cfg) => rightEl?.appendChild(makeBtn(cfg)));
      modal.show();
      return modal;
    }

    const saveBtn = $('#crudModalSaveBtn', modalEl);
    saveBtn.classList.toggle('d-none', mode === 'view');
    saveBtn.onclick = () => {
      if (mode === 'view') return;
      const inputs = $$('input.form-control, textarea.form-control, select.form-select', bodyEl);
      const values = fields.map((f, i) => ({
        ...f,
        value: inputs[i] ? inputs[i].value.trim() : (f.value ?? ''),
      }));
      if (!validateCrudFields(values)) return;
      const result = onSave(values);
      if (result !== false) {
        showCeoToast(mode === 'edit' ? 'Perubahan berhasil disimpan.' : 'Data berhasil disimpan.');
        modal.hide();
      }
    };

    modal.show();
    return modal;
  }

  function isApprovalFlowTable(table) {
    const id = String(table?.id || '').trim();
    return [
      'tblCutiPengajuan',
      'tblIzinTerlambatPulangCepat',
      'tblPengajuanLembur',
      'tblIzinKeluar',
      'tblPembiayaan',
      'tblReimbursement',
      'tblPerjalananDinas',
      'tblKlaimKesehatan'
    ].includes(id);
  }

  function getApprovalEditableLabels(table) {
    const id = String(table?.id || '').trim();
    if (['tblReimbursement', 'tblKlaimKesehatan'].includes(id)) return ['Persetujuan'];
    return [];
  }


  function normalizeCrudFieldLabel(label) {
    const raw = String(label || '').trim().toLowerCase();
    if (raw.includes('penerima') && raw.includes('karyawan')) return 'nama karyawan';
    if (raw === 'pemberi tugas/pic' || raw === 'pemberi tugas' || raw === 'pic') return 'pemberi tugas/pic';
    if (raw.includes('deskripsi') && raw.includes('tugas')) return 'deskripsi tugas';
    if (raw === 'rancangan rencana') return 'rancangan rencana';
    if (raw === 'tingkat urgensi') return 'tingkat urgensi';
    return raw.replace(/\s+/g, ' ');
  }

  function getCrudExampleValue(tableId, label, mode) {
    const tableKey = String(tableId || '').trim();
    const key = normalizeCrudFieldLabel(label);
    const common = {
      'tanggal': '',
      'deadline': '',
      'status': '',
      'catatan': '',
      'keterangan': '',
      'link': '',
    };
    const byTable = {
      tblInstruksiTugas: {
        'judul tugas': '',
        'pemberi tugas/pic': '',
        'nama karyawan': '',
        'deskripsi tugas': '',
        'catatan': '',
      },
      tblRrk: {
        'rancangan rencana': '',
        'tingkat urgensi': '',
      },
      tblReportPengerjaan: {
        'pekerjaan yang dilakukan': '',
        'kendala': '',
        'keterangan': '',
        'status': '',
      },
      tblKegiatanKaryawan: {
        'nama kegiatan': '',
        'kategori': '',
        'penyelenggara/pic': '',
      },
      tblKontrak: {
        'no kontrak': '',
        'status': '',
      },
    };
    return (byTable[tableKey] && byTable[tableKey][key]) || common[key] || '';
  }

  function getCrudPlaceholder(tableId, label, mode) {
    const value = getCrudExampleValue(tableId, label, mode);
    if (value) return `Isi ${String(label || 'data').trim()}`;
    const key = normalizeCrudFieldLabel(label);
    const map = {
      'nama karyawan': '',
      'sub perusahaan': 'Pilih sub perusahaan',
      'divisi': 'Pilih divisi',
      'jabatan': 'Pilih jabatan',
      'rrk': 'Pilih RRK',
      'deskripsi tugas': '',
      'rancangan rencana': '',
      'tingkat urgensi': '',
    };
    return map[key] || `Isi ${String(label || 'data').trim()}`;
  }

  function inferCrudInputType(label) {
    const key = normalizeCrudFieldLabel(label);
    if (key === 'tanggal' || key.includes('tanggal')) return 'date';
    if (key.includes('deadline')) return 'date';
    if (key === 'link' || key.includes('url')) return 'url';
    if (key.includes('email')) return 'email';
    if (key.includes('telepon') || key.includes('telp') || key.includes('phone')) return 'tel';
    if (key.includes('jumlah') || key.includes('nominal')) return 'number';
    return 'text';
  }

  function decorateCrudField(field, tableId, mode) {
    const next = { ...(field || {}) };
    const key = normalizeCrudFieldLabel(next.label);
    next._tableId = next._tableId || tableId || '';
    if (!next.placeholder) next.placeholder = getCrudPlaceholder(next._tableId, next.label, mode);
    if (!next.inputType && !next.type && !Array.isArray(next.options)) next.inputType = inferCrudInputType(next.label);
    if (mode === 'add' && !next.value && !next.noAutoFill) {
      // Saat tambah, field tetap kosong supaya user mengisi data asli.
      // Tanggal/deadline juga tidak diisi otomatis agar tidak terlihat sebagai data contoh.
    }
    const optional = ['catatan', 'keterangan', 'kendala', 'link', 'berkas kontrak', 'foto karyawan', 'kartu keluarga', 'ktp'];
    next.required = next.required ?? !optional.includes(key);
    if (!next.help && next.placeholder && !String(next.placeholder).toLowerCase().startsWith('pilih')) {
      next.help = next.placeholder;
    }
    return next;
  }

  function serializeCrudFields(fields) {
    return (Array.isArray(fields) ? fields : []).map((field) => {
      const copy = { ...field };
      delete copy._cell;
      delete copy._badge;
      return copy;
    });
  }

  function storeCrudRowFields(row, fields) {
    if (!row) return;
    row.dataset.bmCrudFields = JSON.stringify(serializeCrudFields(fields));
  }

  function validateCrudFields(fields) {
    const firstEmpty = (Array.isArray(fields) ? fields : []).find((field) => field?.required && !String(field.value || '').trim());
    if (firstEmpty) {
      window.alert(`${firstEmpty.label || 'Data'} wajib diisi.`);
      return false;
    }
    return true;
  }

  function configureFieldsForTable(table, fields, mode) {
    const tableId = String(table?.id || '').trim();

    if (tableId === 'tblPenilaianKaryawan') {
      return fields.map((field) => {
        const next = { ...field };
        const label = String(next.label || '').trim().toLowerCase();

        if (label === 'no karyawan' || label === 'nomor karyawan') next.label = 'ID Karyawan';
        if (label === 'periode') {
          next.type = 'select';
          next.options = ['Januari 2026', 'Februari 2026', 'Maret 2026', 'April 2026', 'Mei 2026', 'Juni 2026', 'Juli 2026', 'Agustus 2026', 'September 2026', 'Oktober 2026', 'November 2026', 'Desember 2026'];
          if (!next.value) next.value = 'April 2026';
        }
        if (label === 'jabatan') {
          next.type = 'select';
          next.options = ['IT Programmer', 'IT Support', 'Marketing Communication', 'Content Creator', 'Finance', 'HR'];
        }
        if (label === 'indeks prestasi') {
          next.inputType = 'number';
        }
        return next;
      });
    }

    if (tableId === 'tblInstruksiTugas') {
      const findField = (...labels) => {
        const wanted = labels.map((label) => normalizeCrudFieldLabel(label));
        return fields.find((field) => wanted.includes(normalizeCrudFieldLabel(field?.label))) || {};
      };
      const withTable = (field) => ({ ...field, _tableId: tableId });
      const subOptions = readList(LS.SUB, []).map((row) => row.name || row.code || '-');
      const divisiOptions = readList(LS.DIVISI, []).map((row) => row.name || row.code || '-');
      const jabatanOptions = readList(LS.JABATAN, []).map((row) => row.name || row.code || '-');
      const employeeOptions = readList(LS.KAR, []).map((row) => row.name || row.employee_no || '-');
      const judul = findField('Judul Tugas');
      const pic = findField('Pemberi tugas/PIC');
      const penerima = findField('Penerima/Nama karyawan', 'Nama Karyawan');
      const sub = findField('Sub Perusahaan');
      const divisi = findField('Divisi');
      const jabatan = findField('Jabatan');
      const tanggal = findField('Tanggal');
      const deadline = findField('Deadline');
      const deskripsi = findField('Deskripsi Tugas');
      const status = findField('Status');
      const catatan = findField('Catatan');

      // Revisi BM v5: Tambah/Lihat/Edit Instruksi Tugas memakai field yang sama.
      // Saat tambah, field tidak diisi otomatis agar user mengisi data asli.
      const isAdd = mode === 'add';
      const selectOptions = (placeholder, arr) => [{ value: '', label: placeholder }, ...arr.map((x) => ({ value: x, label: x }))];
      return [
        withTable({ label: 'Judul Tugas', value: isAdd ? '' : (judul.value || ''), _cell: judul._cell, span: 3, noAutoFill: true }),
        withTable({ label: 'Pemberi tugas/PIC', value: isAdd ? '' : (pic.value || ''), excludeFromTable: true, noAutoFill: true }),
        withTable({ label: 'Penerima/Nama karyawan', value: isAdd ? '' : (penerima.value || ''), _cell: penerima._cell, type: employeeOptions.length ? 'select' : 'text', options: employeeOptions.length ? selectOptions('Pilih nama karyawan', employeeOptions) : undefined, noAutoFill: true }),
        withTable({ label: 'Sub Perusahaan', value: isAdd ? '' : (sub.value || ''), type: subOptions.length ? 'select' : 'text', options: subOptions.length ? selectOptions('Pilih sub perusahaan', subOptions) : undefined, excludeFromTable: true, noAutoFill: true }),
        withTable({ label: 'Divisi', value: isAdd ? '' : (divisi.value || ''), type: divisiOptions.length ? 'select' : 'text', options: divisiOptions.length ? selectOptions('Pilih divisi', divisiOptions) : undefined, excludeFromTable: true, noAutoFill: true }),
        withTable({ label: 'Jabatan', value: isAdd ? '' : (jabatan.value || ''), type: jabatanOptions.length ? 'select' : 'text', options: jabatanOptions.length ? selectOptions('Pilih jabatan', jabatanOptions) : undefined, excludeFromTable: true, noAutoFill: true }),
        withTable({ label: 'Tanggal', value: isAdd ? '' : (tanggal.value || ''), _cell: tanggal._cell, inputType: 'date', noAutoFill: true }),
        withTable({ label: 'Deadline', value: isAdd ? '' : (deadline.value || ''), _cell: deadline._cell, inputType: 'date', noAutoFill: true }),
        withTable({ label: 'Deskripsi Tugas', value: isAdd ? '' : (deskripsi.value || ''), excludeFromTable: true, span: 3, noAutoFill: true }),
        withTable({ label: 'Status', value: isAdd ? '' : (status.value || ''), type: 'select', options: [{ value: '', label: 'Pilih status' }, 'Pending', 'Proses', 'Selesai', 'Revisi'], excludeFromTable: true, noAutoFill: true }),
        withTable({ label: 'Catatan', value: isAdd ? '' : (catatan.value || ''), excludeFromTable: true, span: 3, noAutoFill: true }),
      ];
    }

    const editableLabels = getApprovalEditableLabels(table).map((label) => String(label || '').trim().toLowerCase());

    return fields.map((field) => {
      const next = { ...field };
      const fieldLabel = String(next.label || '').trim().toLowerCase();

      if (mode === 'view' && editableLabels.includes(fieldLabel)) {
        next.editableInView = true;
      }

      if (tableId === 'tblPerjalananDinas' && fieldLabel === 'status') {
        next.type = 'select';
        next.options = ['Pending', 'Disetujui', 'Tolak'];
      }

      return next;
    });
  }

  function syncEditableViewFields(modalEl, fields) {
    const bodyEl = $('#crudModalBody', modalEl || document);
    if (!bodyEl || !Array.isArray(fields)) return;
    const inputs = $$('input.form-control, textarea.form-control, select.form-select', bodyEl);

    fields.forEach((field, idx) => {
      if (!field?.editableInView) return;
      const input = inputs[idx];
      if (!input) return;
      const nextValue = String(input.value ?? '').trim();
      field.value = nextValue;
      if (field._cell) {
        renderTableCellValue(field._cell, { ...field, value: nextValue });
      }
    });
  }

  function setApprovalStatus(row, statusText, variant) {
    const badge = row?.querySelector('.badge');
    if (!badge) return;
    badge.textContent = statusText;
    badge.className = `badge bg-label-${variant || 'warning'}`;
  }

  function getRowFields(row, table) {
    const { ths, aksiIdx } = getTableMeta(table);
    const tds = $$('td', row);
    const tableId = String(table?.id || '').trim();

    const fields = [];
    for (let i = 0; i < tds.length; i++) {
      if (i === 0) continue; // skip "#"
      if (aksiIdx !== -1 && i === aksiIdx) continue; // skip "Aksi"

      const cell = tds[i];
      const badge = cell.querySelector('.badge');
      const photoBtn = cell.querySelector('[data-photo-preview]');
      fields.push({
        key: String(i),
        label: ths[i] || `Kolom ${i + 1}`,
        value: badge ? badge.textContent.trim() : (photoBtn ? photoBtn.textContent.trim() : cell.textContent.trim()),
        _cell: cell,
        _badge: badge,
        _tableId: tableId,
      });
    }

    const stored = safeJsonParse(row?.dataset?.bmCrudFields || '', null);
    if (Array.isArray(stored) && stored.length) {
      const visibleByLabel = new Map(fields.map((field) => [normalizeCrudFieldLabel(field.label), field]));
      return stored.map((field) => {
        const visible = visibleByLabel.get(normalizeCrudFieldLabel(field.label));
        return {
          ...field,
          _cell: visible?._cell,
          _badge: visible?._badge,
          _tableId: tableId || field._tableId || '',
        };
      });
    }

    return fields;
  }

  function renumber(table) {
    const rows = $$('tbody tr', table);
    rows.forEach((tr, idx) => {
      const first = tr.querySelector('td');
      if (first) first.textContent = String(idx + 1);
    });
  }

  function buildActionsCell(viewHref) {
    const td = document.createElement('td');
    td.className = 'tdActions';
    td.innerHTML = `
      <div class="d-flex justify-content-center gap-2">
        <a aria-label="Lihat" class="btn btn-sm btn-icon btn-primary" href="${viewHref || '#'}" title="Lihat">
          <i class="bx bx-show"></i>
        </a>
        <button aria-label="Edit" class="btn btn-sm btn-icon btn-outline-primary" title="Edit" type="button">
          <i class="bx bx-edit-alt"></i>
        </button>
        <button aria-label="Hapus" class="btn btn-sm btn-icon btn-outline-danger" title="Hapus" type="button">
          <i class="bx bx-trash"></i>
        </button>
      </div>
    `.trim();
    return td;
  }


  function isPhotoPreviewLabel(label) {
    const t = String(label || '').trim().toLowerCase();
    return t === 'photo check in' || t === 'photo check out';
  }

  function buildPhotoPreviewCellHtml(label, textValue) {
    const safeText = escapeHtml(String(textValue || '').trim() || 'Lihat Foto');
    const kind = String(label || '').trim().toLowerCase().includes('out') ? 'check-out' : 'check-in';
    return `<button class="btn btn-sm btn-outline-primary" type="button" data-photo-preview="1" data-photo-kind="${kind}" data-preview-src="">${safeText}</button>`;
  }

  function renderTableCellValue(cell, field) {
    if (!cell) return;
    if (field?._badge) {
      field._badge.textContent = field.value;
      return;
    }
    if (isPhotoPreviewLabel(field?.label)) {
      cell.innerHTML = buildPhotoPreviewCellHtml(field.label, field.value);
      return;
    }
    cell.textContent = field?.value ?? '';
  }

  function ensurePhotoPreviewModal() {
    let el = document.getElementById('ceoPhotoPreviewModal');
    if (el) return el;

    el = document.createElement('div');
    el.className = 'modal fade';
    el.id = 'ceoPhotoPreviewModal';
    el.style.zIndex = '2005';
    el.tabIndex = -1;
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="ceoPhotoPreviewTitle">Lihat Foto</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" id="ceoPhotoPreviewBody"></div>
        </div>
      </div>
    `.trim();
    document.body.appendChild(el);
    return el;
  }

  function openPhotoPreview(options = {}) {
    const modalEl = ensurePhotoPreviewModal();
    const titleEl = document.getElementById('ceoPhotoPreviewTitle');
    const bodyEl = document.getElementById('ceoPhotoPreviewBody');
    const src = String(options.src || '').trim();
    const title = String(options.title || 'Lihat Foto').trim() || 'Lihat Foto';

    if (titleEl) titleEl.textContent = title;
    if (bodyEl) {
      const lower = src.toLowerCase();
      if (lower.endsWith('.pdf')) {
        bodyEl.innerHTML = `<iframe src="${escapeHtml(src)}" title="${escapeHtml(title)}" style="width:100%;min-height:70vh;border:0;border-radius:.75rem;"></iframe>`;
      } else {
        bodyEl.innerHTML = `<div class="text-center"><img src="${escapeHtml(src)}" alt="${escapeHtml(title)}" style="max-width:100%;border-radius:.75rem;" /></div>`;
      }
    }

    bootstrap.Modal.getOrCreateInstance(modalEl).show();
    window.setTimeout(() => {
      modalEl.style.zIndex = '2005';
      const backdrops = Array.from(document.querySelectorAll('.modal-backdrop'));
      const lastBackdrop = backdrops[backdrops.length - 1];
      if (lastBackdrop) lastBackdrop.style.zIndex = '2000';
    }, 0);
  }

  function ensureDocumentPreviewModal() {
    let el = document.getElementById('ceoDocumentPreviewModal');
    if (el) return el;

    el = document.createElement('div');
    el.className = 'modal fade';
    el.id = 'ceoDocumentPreviewModal';
    el.tabIndex = -1;
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="ceoDocumentPreviewTitle">Lihat Berkas</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" id="ceoDocumentPreviewBody"></div>
        </div>
      </div>
    `.trim();
    document.body.appendChild(el);
    return el;
  }

  function isImageFileSrc(src) {
    return /\.(png|jpe?g|gif|webp|bmp|svg)(?:[#?].*)?$/i.test(String(src || '').trim());
  }

  function isPdfFileSrc(src) {
    return /\.pdf(?:[#?].*)?$/i.test(String(src || '').trim());
  }

  function openDocumentPreview(options = {}) {
    const modalEl = ensureDocumentPreviewModal();
    const titleEl = document.getElementById('ceoDocumentPreviewTitle');
    const bodyEl = document.getElementById('ceoDocumentPreviewBody');
    const rawSrc = String(options.src || '').trim();
    const title = String(options.title || 'Lihat Berkas').trim() || 'Lihat Berkas';
    const emptyMessage = String(options.emptyMessage || `Tidak ada ${title.toLowerCase()}.`).trim();

    if (titleEl) titleEl.textContent = title;
    if (bodyEl) {
      if (!rawSrc) {
        bodyEl.innerHTML = `
          <div class="d-flex flex-column align-items-center justify-content-center text-center py-5" style="min-height:55vh;">
            <div class="avatar avatar-xl mb-3">
              <span class="avatar-initial rounded bg-label-secondary"><i class="bx bx-file fs-2"></i></span>
            </div>
            <h6 class="mb-1">Tidak ada data</h6>
            <p class="text-muted mb-0">${escapeHtml(emptyMessage)}</p>
          </div>
        `.trim();
      } else if (isImageFileSrc(rawSrc)) {
        bodyEl.innerHTML = `
          <div class="text-center">
            <img src="${escapeHtml(rawSrc)}" alt="${escapeHtml(title)}" style="max-width:100%;max-height:75vh;border-radius:.75rem;" />
          </div>
        `.trim();
      } else {
        const frameSrc = isPdfFileSrc(rawSrc) && !rawSrc.includes('#')
          ? `${rawSrc}#toolbar=0&navpanes=0&scrollbar=1`
          : rawSrc;
        bodyEl.innerHTML = `
          <div class="ratio ratio-16x9" style="min-height:72vh;">
            <iframe src="${escapeHtml(frameSrc)}" title="${escapeHtml(title)}" style="width:100%;height:100%;border:0;border-radius:.75rem;"></iframe>
          </div>
        `.trim();
      }
    }

    bootstrap.Modal.getOrCreateInstance(modalEl).show();
  }

  function initCrudTables() {
    const CUSTOM_MODAL_TABLE_IDS = new Set([
      'tblInstruksiTugas',
      'tblPenilaianKaryawan',
      'tblKehadiranV2',
      'tblIstirahatV2',
      'tblLemburV2',
      'tblSubPerusahaan',
      'tblDivisi',
      'tblJabatan',
      'tblKaryawan',
      'tblKontrak',
      'tblKaryawanDivisi',
      'tblKegiatanKaryawan',
      'tblRrk',
      'tblReportPengerjaan',
      'tblKunjunganKaryawan',
      'tblAkunKaryawan',
      'tblAkunUser',
      'tblSkenarioJamKerja',
      'tblWaktuLibur',
    ]);

    // delegated click
    document.addEventListener('click', (e) => {
      const target = e.target.closest('button, a');
      if (!target) return;
      const ownerTable = target.closest('table');
      if (ownerTable && CUSTOM_MODAL_TABLE_IDS.has(String(ownerTable.id || '').trim())) return;
      if (target.closest('[data-ceo-custom-crud="1"]')) return;

      // Tambah
      if (target.matches('button.crud-add-btn')) {
        const card = target.closest('.card');
        const table = card ? card.querySelector('table.table') : null;
        const tableId = String(table?.id || '').trim();

        // Jangan buka modal CRUD generic untuk tabel yang punya handler khusus
        // seperti Sub Perusahaan, Divisi, dan Jabatan.
        if (target.closest('[data-ceo-custom-crud="1"]') || target.dataset.ceoCustomCrud === '1') return;
        if (table && (table.dataset.ceoCustomCrud === '1' || CEO_CUSTOM_CRUD_IDS.has(tableId))) return;
        if (!table) return;

        const title = getCardTitleFromTable(table);
        const { ths, aksiIdx } = getTableMeta(table);

        let fields = [];
        for (let i = 1; i < ths.length; i++) {
          if (aksiIdx !== -1 && i === aksiIdx) continue;
          fields.push({ key: String(i), label: ths[i], value: '', _tableId: String(table.id || '') });
        }
        fields = configureFieldsForTable(table, fields, 'add');

        openModal({
          mode: 'add',
          title: getModalActionTitle('add', title),
          fields,
          onSave: (values) => {
            const tbody = table.querySelector('tbody');
            if (!tbody) return;

            const tr = document.createElement('tr');
            const tdIndex = document.createElement('td');
            tdIndex.textContent = String((tbody.querySelectorAll('tr').length || 0) + 1);
            tr.appendChild(tdIndex);

            values.forEach((v) => {
              if (v?.excludeFromTable) return;
              const td = document.createElement('td');
              renderTableCellValue(td, v);
              tr.appendChild(td);
            });

            storeCrudRowFields(tr, values);
            tr.appendChild(buildActionsCell('#'));
            tbody.appendChild(tr);
          },
        });
        return;
      }

      // aksi per-row
      const actionsCell = target.closest('.tdActions');
      if (!actionsCell) return;

      const row = target.closest('tr');
      const table = target.closest('table');
      if (!row || !table) return;

      const label = (target.getAttribute('aria-label') || target.getAttribute('title') || '').toLowerCase();
      const isAnchor = target.tagName.toLowerCase() === 'a';
      const href = isAnchor ? (target.getAttribute('href') || '') : '';

      // Lihat
      if (label.includes('lihat') || label.includes('view') || label.includes('persetujuan')) {
        // kalau href bukan #, biarkan pindah halaman (detail page memang ada)
        if (isAnchor && href && href !== '#') return;
        e.preventDefault();

        const title = getCardTitleFromTable(table);
        const fields = configureFieldsForTable(table, getRowFields(row, table), 'view');

        if (isApprovalFlowTable(table)) {
          openModal({
            mode: 'view',
            title: label.includes('persetujuan') ? `Persetujuan (${normalizeFeatureTitle(title)})` : getModalActionTitle('view', title),
            fields,
            onSave: () => { },
            viewActions: {
              left: [
                {
                  label: 'Tutup',
                  className: 'btn btn-outline-secondary',
                  onClick: (modalEl) => {
                    syncEditableViewFields(modalEl, fields);
                  }
                }
              ],
              right: [
                {
                  label: 'Disetujui',
                  className: 'btn btn-primary',
                  onClick: (modalEl) => {
                    syncEditableViewFields(modalEl, fields);
                    setApprovalStatus(row, 'Disetujui', 'success');
                    showCeoToast('Pengajuan berhasil disetujui.');
                  }
                },
                {
                  label: 'Ditolak',
                  className: 'btn btn-outline-danger',
                  onClick: (modalEl) => {
                    syncEditableViewFields(modalEl, fields);
                    setApprovalStatus(row, 'Ditolak', 'danger');
                    showCeoToast('Pengajuan berhasil ditolak.', 'warning');
                  }
                }
              ]
            }
          });
          return;
        }

        openModal({ mode: 'view', title: getModalActionTitle('view', title), fields, onSave: () => { } });
        return;
      }

      // Edit
      if (label.includes('edit')) {
        e.preventDefault();
        const title = getCardTitleFromTable(table);
        const fields = configureFieldsForTable(table, getRowFields(row, table), 'edit');

        openModal({
          mode: 'edit',
          title: getModalActionTitle('edit', title),
          fields,
          onSave: (values) => {
            values.forEach((v) => {
              if (!v._cell) return;
              renderTableCellValue(v._cell, v);
            });
            storeCrudRowFields(row, values);
          },
        });
        return;
      }

      // Hapus
      if (label.includes('hapus') || label.includes('delete') || label.includes('delate')) {
        e.preventDefault();
        const title = getCardTitleFromTable(table);
        confirmDelete(`${getDeleteActionTitle(title)} ini?`, () => {
          row.remove();
          renumber(table);
        }, title);
      }
    });
  }


  initCrudTables();
  document.addEventListener('click', (e) => {
    const photoBtn = e.target.closest('[data-photo-preview]');
    if (!photoBtn) return;
    e.preventDefault();
    const kind = String(photoBtn.getAttribute('data-photo-kind') || '').trim().toLowerCase();
    const title = kind === 'check-out' ? 'Lihat Photo Check Out' : 'Lihat Photo Check In';
    openPhotoPreview({
      src: photoBtn.getAttribute('data-preview-src') || '',
      title,
    });
  });

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('a,button');
    if (!trigger) return;
    if (trigger.matches('[data-photo-preview], [data-kon-preview], [data-wa-preview], .tdActions a, .tdActions button')) return;

    const textValue = String(trigger.textContent || '').trim().toLowerCase();
    const titleValue = String(trigger.getAttribute('title') || '').trim().toLowerCase();
    const ariaValue = String(trigger.getAttribute('aria-label') || '').trim().toLowerCase();
    const combined = `${textValue} ${titleValue} ${ariaValue}`;

    if (!/(lihat\s+(berkas|dokumen|slip|file)|preview\s+(berkas|dokumen|slip|file))/i.test(combined)) return;

    const src = String(
      trigger.getAttribute('data-preview-src') ||
      trigger.getAttribute('href') ||
      ''
    ).trim();

    if (!src || src === '#' || src.toLowerCase().startsWith('javascript:')) return;

    e.preventDefault();

    let popupTitle = 'Lihat Berkas';
    if (combined.includes('dokumen')) popupTitle = 'Lihat Dokumen';
    else if (combined.includes('slip')) popupTitle = 'Lihat Slip';

    openDocumentPreview({
      src,
      title: popupTitle,
    });
  });

  function escapeHtml(s) {
    return String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  window.ceoEscapeHtml = escapeHtml;
  window.ceoNormalizeFeatureTitle = normalizeFeatureTitle;
  window.ceoGetModalActionTitle = getModalActionTitle;
  window.ceoGetDeleteActionTitle = getDeleteActionTitle;
  window.ceoSetModalActionTitle = setModalActionTitle;
  window.ceoIsCrudFieldFullWidth = isCrudFieldFullWidth;
  window.ceoIsCrudFieldTextarea = isCrudFieldTextarea;

  // ==============================================================
  // Mini Calendar (optional)
  // ==============================================================
  const daysEl = $('#bmcalMiniDays');
  if (daysEl) {
    const labelEl = $('#bmcalMiniLabel');
    const prevBtn = $('#bmcalPrev');
    const nextBtn = $('#bmcalNext');

    const state = {
      view: new Date(),
      selected: new Date(),
    };

    function startOfMonth(d) {
      return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    function endOfMonth(d) {
      return new Date(d.getFullYear(), d.getMonth() + 1, 0);
    }
    function fmtMonth(d) {
      return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase('id-ID');
    }

    function render() {
      const view = state.view;
      const start = startOfMonth(view);
      const end = endOfMonth(view);

      if (labelEl) labelEl.textContent = fmtMonth(view);
      daysEl.innerHTML = '';

      const padStart = start.getDay();
      const totalDays = end.getDate();

      const today = new Date();
      const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
      const sel = state.selected;
      const selKey = `${sel.getFullYear()}-${sel.getMonth()}-${sel.getDate()}`;

      const prevEnd = new Date(view.getFullYear(), view.getMonth(), 0);
      for (let i = padStart; i > 0; i--) {
        const d = new Date(view.getFullYear(), view.getMonth() - 1, prevEnd.getDate() - i + 1);
        const cell = document.createElement('div');
        cell.className = 'bmcalDay is-muted';
        cell.textContent = String(d.getDate());
        daysEl.appendChild(cell);
      }

      for (let day = 1; day <= totalDays; day++) {
        const d = new Date(view.getFullYear(), view.getMonth(), day);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        const cell = document.createElement('div');
        cell.className = 'bmcalDay';
        if (key === todayKey) cell.classList.add('is-today');
        if (key === selKey) cell.classList.add('is-selected');
        cell.textContent = String(day);
        cell.addEventListener('click', () => {
          state.selected = d;
          render();
        });
        daysEl.appendChild(cell);
      }

      const cellsNow = daysEl.children.length;
      const padEnd = (7 - (cellsNow % 7)) % 7;
      for (let i = 1; i <= padEnd; i++) {
        const cell = document.createElement('div');
        cell.className = 'bmcalDay is-muted';
        cell.textContent = String(i);
        daysEl.appendChild(cell);
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        state.view = new Date(state.view.getFullYear(), state.view.getMonth() - 1, 1);
        render();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        state.view = new Date(state.view.getFullYear(), state.view.getMonth() + 1, 1);
        render();
      });
    }

    render();
  }
})();


/* =========================================================
 * BM_TABLE_FILTERS_V10
 * - Search & Month filter for all tables (like Notifikasi, better)
 * ========================================================= */
(() => {
  const $ = window.ceo$ || ((sel, root = document) => root.querySelector(sel));
  const $$ = window.ceo$$ || ((sel, root = document) => Array.from(root.querySelectorAll(sel)));
  // expose for other modules (avoid duplicated helpers)
  window.ceo$ = $;
  window.ceo$$ = $$;


  const MONTH_ID = {
    januari: '01', februari: '02', maret: '03', april: '04', mei: '05', juni: '06',
    juli: '07', agustus: '08', september: '09', oktober: '10', november: '11', desember: '12'
  };

  const norm = (s) => (s ?? '').toString().toLowerCase().replace(/\s+/g, ' ').trim();

  function parseMonth(text) {
    const t = norm(text);
    if (!t) return null;

    // dd/mm/yyyy
    const dmy = t.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (dmy) {
      const mm = String(dmy[2]).padStart(2, '0');
      return `${dmy[3]}-${mm}`;
    }

    // yyyy-mm / yyyy-mm-dd / yyyy/mm
    const ym = t.match(/(\d{4})[\/\-](\d{2})/);
    if (ym) return `${ym[1]}-${ym[2]}`;

    // "januari 2026"
    const words = t.split(' ');
    if (words.length >= 2 && MONTH_ID[words[0]] && /^\d{4}$/.test(words[1])) {
      return `${words[1]}-${MONTH_ID[words[0]]}`;
    }

    return null;
  }

  function parseDateISO(text) {
    const t = String(text || '').trim();
    if (!t) return null;

    // yyyy-mm-dd
    const iso = t.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

    // dd/mm/yyyy atau dd-mm-yyyy
    const dmy = t.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (dmy) {
      const dd = String(dmy[1]).padStart(2, '0');
      const mm = String(dmy[2]).padStart(2, '0');
      return `${dmy[3]}-${mm}-${dd}`;
    }

    return null;
  }

  function formatDMYFromISO(iso) {
    if (!iso) return '';
    const m = String(iso).match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return '';
    return `${m[3]}/${m[2]}/${m[1]}`;
  }

  function formatDMYRangeFromISO(startIso, endIso) {
    const s = (startIso || '').trim();
    const e = (endIso || '').trim();
    if (!s && !e) return '';
    if (s && !e) return formatDMYFromISO(s);
    if (!s && e) return formatDMYFromISO(e);
    if (s === e) return formatDMYFromISO(s);
    return `${formatDMYFromISO(s)} - ${formatDMYFromISO(e)}`;
  }

  function renumberVisibleRows(table) {
    const rows = $$('tbody tr', table);
    let n = 1;
    for (const tr of rows) {
      if (tr.classList.contains('d-none') || tr.style.display === 'none') continue;
      const first = tr.querySelector('td');
      if (!first) continue;
      const val = norm(first.textContent);
      if (/^\d+$/.test(val)) first.textContent = String(n++);
    }
  }

  function applyFilters(table, state) {
    const q = norm(state.query);
    const month = state.month || '';
    const date = state.date || '';
    const dateStart = state.dateStart || '';
    const dateEnd = state.dateEnd || '';

    const rows = $$('tbody tr', table);

    for (const tr of rows) {
      const rowText = norm(tr.textContent);
      const okQuery = !q || rowText.includes(q);

      let okMonth = true;
      if (month) {
        let rowMonth = tr.dataset.month || null;
        if (!rowMonth) {
          // try parse from specific column
          const colIdx = Number(state.dateCol ?? tr.closest('table')?.dataset?.dateCol ?? NaN);
          if (!Number.isNaN(colIdx)) {
            const td = tr.querySelectorAll('td')[colIdx];
            rowMonth = td ? parseMonth(td.textContent) : null;
          } else {
            // fallback: parse from whole row
            rowMonth = parseMonth(tr.textContent);
          }
        }
        okMonth = rowMonth === month;
      }

      let okDate = true;
      // Date exact / range filter
      const wantExact = (date || '').trim();
      const wantStart = (dateStart || '').trim();
      const wantEnd = (dateEnd || '').trim();
      if (wantExact || wantStart || wantEnd) {
        let rowDate = tr.dataset.date || null;
        if (!rowDate) {
          const colIdx = Number(state.dateCol ?? tr.closest('table')?.dataset?.dateCol ?? NaN);
          if (!Number.isNaN(colIdx)) {
            const td = tr.querySelectorAll('td')[colIdx];
            rowDate = td ? parseDateISO(td.textContent) : null;
          } else {
            rowDate = parseDateISO(tr.textContent);
          }
        }
        if (!rowDate) {
          okDate = false;
        } else if (wantExact) {
          okDate = rowDate === wantExact;
        } else {
          // range: inclusive
          const afterStart = !wantStart || rowDate >= wantStart;
          const beforeEnd = !wantEnd || rowDate <= wantEnd;
          okDate = afterStart && beforeEnd;
        }
      }

      const ok = okQuery && okMonth && okDate;
      tr.style.display = ok ? '' : 'none';
    }

    renumberVisibleRows(table);
  }

  function getTableFromSelector(sel) {
    if (!sel) return null;
    try { return document.querySelector(sel); } catch { return null; }
  }

  // ============================================================
  // Date filter popup (Rekap Absensi)
  // Target UX:
  // - Klik input tanggal => langsung muncul UI popup.html (tanpa tab baru)
  // - Tidak ada "popup di dalam popup" => backdrop hanya dari host, popup.html backdrop dibuat transparan via host=1
  // - Ukuran popup lebih kecil (scale) tapi tampilannya sama seperti popup.html
  // ============================================================
  let __activeDateFilterCtx = null;

  function ensurePopupHost() {
    const id = 'ceoPopupHost';
    let host = document.getElementById(id);
    if (host) return host;

    host = document.createElement('div');
    host.id = id;
    host.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:9999',
      'display:none',
      'align-items:center',
      'justify-content:center',
      'padding:14px',
      'background: rgba(17,24,39,.40)',
    ].join(';');

    host.innerHTML = `
      <div id="ceoPopupHostBox" style="
        width: min(860px, 96vw);
        height: min(560px, 86vh);
        border-radius: 14px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0,0,0,.18);
        background: transparent;
      ">
        <iframe
          id="ceoPopupHostFrame"
          src="about:blank"
          style="width:100%;height:100%;border:0;background:transparent;"
          title="Popup"
        ></iframe>
      </div>
    `.trim();

    document.body.appendChild(host);

    // Klik backdrop => close (klik di box jangan close)
    host.addEventListener('click', (e) => {
      if (e.target === host) {
        closePopupHost();
        __activeDateFilterCtx = null;
      }
    });

    // ESC => close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && host.style.display !== 'none') {
        closePopupHost();
        __activeDateFilterCtx = null;
      }
    });

    return host;
  }

  function closePopupHost() {
    const host = document.getElementById('ceoPopupHost');
    if (!host) return;
    const frame = host.querySelector('#ceoPopupHostFrame');
    host.style.display = 'none';
    if (frame) frame.src = 'about:blank';
  }

  function openPopupFrame({ url, ctx }) {
    const host = ensurePopupHost();
    const frame = host.querySelector('#ceoPopupHostFrame');

    const baseUrl = url || 'popup.html';
    const sep = baseUrl.includes('?') ? '&' : '?';
    // host=1 => popup.html tidak bikin backdrop gelap sendiri (biar gak dobel)
    const finalUrl = `${baseUrl}${sep}embed=1&host=1&scale=0.90`;

    if (frame) frame.src = finalUrl;
    host.style.display = 'flex';
    __activeDateFilterCtx = ctx || null;
  }

  window.addEventListener('message', (ev) => {
    const data = ev?.data || {};
    if (!data || typeof data !== 'object') return;

    if (data.type === 'ceo:popup-close') {
      closePopupHost();
      __activeDateFilterCtx = null;
      return;
    }

    if (data.type === 'ceo:rekap-date-apply') {
      // backward-compat: single date
      const iso = String(data.date || '').trim();

      if (__activeDateFilterCtx?.table && __activeDateFilterCtx?.input) {
        const { table, input } = __activeDateFilterCtx;
        table._bmFilterState = table._bmFilterState || { query: '', month: '', date: '', dateStart: '', dateEnd: '', dateCol: null };
        table._bmFilterState.date = iso || '';
        table._bmFilterState.dateStart = '';
        table._bmFilterState.dateEnd = '';
        input.value = iso ? formatDMYFromISO(iso) : '';
        applyFilters(table, table._bmFilterState);
        try { localStorage.setItem(`bmDateRangeFilter:${table.id || 'tbl'}`, JSON.stringify({ date: iso || '' })); } catch { }
      }

      closePopupHost();
      __activeDateFilterCtx = null;
      return;
    }

    if (data.type === 'ceo:rekap-range-apply') {
      const startIso = String(data.start || '').trim();
      const endIso = String(data.end || '').trim();

      if (__activeDateFilterCtx?.table && __activeDateFilterCtx?.input) {
        const { table, input } = __activeDateFilterCtx;
        table._bmFilterState = table._bmFilterState || { query: '', month: '', date: '', dateStart: '', dateEnd: '', dateCol: null };
        table._bmFilterState.date = '';
        table._bmFilterState.dateStart = startIso || '';
        table._bmFilterState.dateEnd = endIso || '';
        input.value = formatDMYRangeFromISO(startIso || '', endIso || '');
        applyFilters(table, table._bmFilterState);
        try { localStorage.setItem(`bmDateRangeFilter:${table.id || 'tbl'}`, JSON.stringify({ start: startIso || '', end: endIso || '' })); } catch { }
      }

      closePopupHost();
      __activeDateFilterCtx = null;
      return;
    }
  });

  function initTools() {
    // Search inputs
    $$('#bm-root [data-search-table], [data-search-table]').forEach((input) => {
      const table = getTableFromSelector(input.getAttribute('data-search-table'));
      if (!table) return;

      // state per table
      table._bmFilterState = table._bmFilterState || { query: '', month: '', date: '', dateCol: null };

      // default: apply once
      applyFilters(table, table._bmFilterState);

      input.addEventListener('input', () => {
        table._bmFilterState.query = input.value || '';
        applyFilters(table, table._bmFilterState);
      });

      // clear btn in same input-group
      const group = input.closest('.input-group');
      const clear = group?.querySelector('.bm-clear');
      clear?.addEventListener('click', () => {
        input.value = '';
        table._bmFilterState.query = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
      });
    });



    // Date filters (popup: range)
    $$('[data-filter-date]').forEach((inp) => {
      const table = getTableFromSelector(inp.getAttribute('data-filter-table'));
      if (!table) return;

      table._bmFilterState = table._bmFilterState || { query: '', month: '', date: '', dateStart: '', dateEnd: '', dateCol: null };

      const dateCol = inp.getAttribute('data-date-col');
      if (dateCol !== null && dateCol !== '') table._bmFilterState.dateCol = Number(dateCol);

      // restore persisted range (or legacy single date)
      try {
        const raw = localStorage.getItem(`bmDateRangeFilter:${table.id || 'tbl'}`) || '';
        if (raw) {
          const obj = JSON.parse(raw);
          if (obj && typeof obj === 'object') {
            if (obj.date) {
              table._bmFilterState.date = String(obj.date || '');
              table._bmFilterState.dateStart = '';
              table._bmFilterState.dateEnd = '';
              inp.value = table._bmFilterState.date ? formatDMYFromISO(table._bmFilterState.date) : '';
            } else {
              table._bmFilterState.date = '';
              table._bmFilterState.dateStart = String(obj.start || '');
              table._bmFilterState.dateEnd = String(obj.end || '');
              inp.value = formatDMYRangeFromISO(table._bmFilterState.dateStart, table._bmFilterState.dateEnd);
            }
            applyFilters(table, table._bmFilterState);
          }
        } else {
          // legacy
          const legacy = localStorage.getItem(`bmDateFilter:${table.id || 'tbl'}`) || '';
          if (legacy) {
            table._bmFilterState.date = legacy;
            inp.value = formatDMYFromISO(legacy);
            applyFilters(table, table._bmFilterState);
          }
        }
      } catch { }

      inp.addEventListener('click', () => {
        const url = inp.getAttribute('data-popup-url') || 'popup.html';
        const curStart = table._bmFilterState.dateStart || table._bmFilterState.date || '';
        const curEnd = table._bmFilterState.dateEnd || table._bmFilterState.date || '';
        openPopupFrame({
          title: 'Pilih Tanggal',
          url: `${url}?start=${encodeURIComponent(curStart)}&end=${encodeURIComponent(curEnd)}`,
          ctx: { table, input: inp },
        });
      });

      const group = inp.closest('.input-group');
      const clear = group?.querySelector('[data-clear-date]');
      clear?.addEventListener('click', () => {
        inp.value = '';
        table._bmFilterState.date = '';
        table._bmFilterState.dateStart = '';
        table._bmFilterState.dateEnd = '';
        applyFilters(table, table._bmFilterState);
        try {
          localStorage.removeItem(`bmDateFilter:${table.id || 'tbl'}`);
          localStorage.removeItem(`bmDateRangeFilter:${table.id || 'tbl'}`);
        } catch { }
      });
    });
    // Month filters
    $$('[data-filter-month]').forEach((minp) => {
      const table = getTableFromSelector(minp.getAttribute('data-filter-table'));
      if (!table) return;

      table._bmFilterState = table._bmFilterState || { query: '', month: '', date: '', dateCol: null };

      const dateCol = minp.getAttribute('data-date-col');
      if (dateCol !== null && dateCol !== '') table._bmFilterState.dateCol = Number(dateCol);

      // Set default month: first visible row month if exists, else current month
      if (!minp.value) {
        const firstRow = table.querySelector('tbody tr');
        const dsm = firstRow?.dataset?.month;
        minp.value = dsm || new Date().toISOString().slice(0, 7);
      }
      table._bmFilterState.month = minp.value || '';
      applyFilters(table, table._bmFilterState);

      minp.addEventListener('change', () => {
        table._bmFilterState.month = minp.value || '';
        applyFilters(table, table._bmFilterState);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', initTools);
})();

/* ==============================================================
 * Owner Extensions (Calendar events + Sub Perusahaan + Divisi)
 * - Menambah tanda event di kalender (dashboard & halaman kalender)
 * - CRUD sederhana (localStorage) untuk Sub Perusahaan & Divisi
 * - Logout selalu redirect ke index.html
 * ============================================================ */
(function () {
  'use strict';

  const $ = window.ceo$ || ((sel, root = document) => root.querySelector(sel));
  const $$ = window.ceo$$ || ((sel, root = document) => Array.from(root.querySelectorAll(sel)));
  // expose for other modules (avoid duplicated helpers)
  window.ceo$ = $;
  window.ceo$$ = $$;

  const showCeoToast = window.ceoToast || (() => { });
  const setModalActionTitle = window.ceoSetModalActionTitle || ((el, mode, featureTitle = '') => {
    if (!el) return;
    const baseTitle = String(featureTitle || el.dataset.ceoFeatureTitle || el.textContent || '').replace(/\s+/g, ' ').trim();
    if (baseTitle) el.dataset.ceoFeatureTitle = baseTitle;
    el.textContent = window.ceoGetModalActionTitle ? window.ceoGetModalActionTitle(mode, baseTitle) : `${mode === 'view' ? 'Lihat' : (mode === 'edit' ? 'Edit' : 'Tambah')} ${baseTitle}`.trim();
  });
  const escapeHtml = window.ceoEscapeHtml || ((value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;'));


  // --------------------------------------------------------------
  // Logout -> index.html
  // --------------------------------------------------------------
  function initLogoutRedirect() {
    document.addEventListener('click', (e) => {
      const a = e.target?.closest?.('a');
      if (!a) return;

      // match by icon or text
      const hasIcon = !!a.querySelector('i.bx.bx-power-off');
      const text = (a.textContent || '').trim().toLowerCase();
      const isLogout = hasIcon || text === 'logout';
      if (!isLogout) return;

      // prevent '#' / javascript:void(0)
      e.preventDefault();
      window.location.href = 'index.html';
    });
  }

  // --------------------------------------------------------------
  // Storage helpers
  // --------------------------------------------------------------
  const LS = {
    // master
    SUB: 'ceoSubCompaniesV1',

    // legacy (v1) - sebelumnya 1 tabel Divisi yang bercampur (divisi + jabatan + staff)
    DIV_LEGACY: 'ceoDivisionsV1',

    // Struktur Organisasi (V2)
    DIVISI: 'ceoDivisiV2',       // {id, sub_id, name, status}
    JABATAN: 'ceoJabatanV2',     // {id, sub_id, divisi_id, name, staff_names?: string[], status}
    STAFF: 'ceoStaffV2',         // {id, sub_id, divisi_id, jabatan_id, name, status}

    // lainnya
    CAL: 'ceoCalendarEventsV1',  // {id, date, start, end, title, type, note, people_ids?: string[]}
    KAR: 'ceoEmployeesV2',       // {id, ..., sub_ids, divisi_ids, jabatan_ids, staff_names?: string[]}
    KONTRAK: 'ceoEmployeeContractsV1', // {id, employee_id, no_contract, jabatan_id, contract_date, start_date, end_date, status_contract, file_name, contract_note}
    ABSEN: 'ceoAttendanceV1',    // {date, by_emp: { [empId]: {status, in, out} } }
    ABSEN_DEMO: 'bmAttendanceDemoRowsV1', // sinkron data demo dari halaman Kehadiran ke dashboard
    PROFIL: 'ceoProfilPerusahaanV1', // {name,..., logo_data_url?, avatar_data_url?}

    // fitur tambahan SDM / master data
    KARYAWAN_DIVISI: 'ceoEmployeeDivisionV1',
    KEGIATAN_KARYAWAN: 'ceoEmployeeActivitiesV1',
    KUNJUNGAN_KARYAWAN: 'ceoEmployeeVisitsV1',
    AKUN_KARYAWAN: 'ceoEmployeeAccountsV1',
    AKUN_USER: 'ceoUserAccountsV1',
    SKENARIO_JAM_KERJA: 'ceoWorkShiftScenariosV1',
    WAKTU_LIBUR: 'ceoWorkHolidayDatesV1',
  };

  const BM_NO_DEMO_PURGE_KEY = 'bmNoDemoPurgeV4';

  function purgeOldDemoStorageOnce() {
    try {
      if (localStorage.getItem(BM_NO_DEMO_PURGE_KEY) === '1') return;
      Object.values(LS).forEach((key) => {
        try { localStorage.removeItem(key); } catch (e) { }
      });
      [
        'ceoEmployeesV1',
        'ceoEmployeesV2',
        'ceoDivisionsV1',
        'ceoDivisiV2',
        'ceoJabatanV2',
        'ceoStaffV2',
        'ceoCalendarEventsV1',
        'ceoEmployeeContractsV1',
        'ceoAttendanceV1',
        'bmAttendanceDemoRowsV1',
        'ceoEmployeeDivisionV1',
        'ceoEmployeeActivitiesV1',
        'ceoEmployeeVisitsV1',
        'ceoEmployeeAccountsV1',
        'ceoUserAccountsV1',
        'ceoWorkShiftScenariosV1',
        'ceoWorkHolidayDatesV1',
        'bmRrkRowsV1',
        'bmReportPengerjaanRowsV1',
        'bmStrukturPerusahaanImageV1',
        'bmNoDemoPurgeV1',
        'bmNoDemoPurgeV2',
        'bmNoDemoPurgeV3'
      ].forEach((key) => {
        try { localStorage.removeItem(key); } catch (e) { }
      });
      localStorage.setItem(BM_NO_DEMO_PURGE_KEY, '1');
    } catch (e) { }
  }

  purgeOldDemoStorageOnce();

  // Pastikan tombol Tambah tetap aktif setelah data dikosongkan.
  function bmEnsureAddButtonsEnabled() {
    [
      '.crud-add-btn',
      '#btnAddSubPerusahaan',
      '#btnAddDivisi',
      '#btnAddJabatan',
      '#btnAddKaryawan',
      '#btnAddKontrak',
      '#btnAddKegiatanKaryawan',
      '#btnAddSkenarioJamKerja'
    ].forEach((selector) => {
      document.querySelectorAll(selector).forEach((btn) => {
        btn.disabled = false;
        btn.removeAttribute('disabled');
        btn.classList.remove('disabled');
        btn.style.pointerEvents = '';
      });
    });
  }

  bmEnsureAddButtonsEnabled();

  // ================================
  // Permissions metadata (Jabatan)
  // Sumber referensi: halaman "Modul Role" & "User Role".
  // ================================
  const Owner_PERM_MODULES = [
    { key: 'dashboard', label: 'Dashboard', feature: 'Dashboard' },
    { key: 'payroll', label: 'Payroll', feature: 'Payroll' },
    { key: 'kpi', label: 'Penilaian Kinerja', feature: 'Penilaian Kinerja' },
    { key: 'discipline', label: 'Disiplin & Peringatan', feature: 'Disiplin & Peringatan' },
    { key: 'karyawan', label: 'Data Karyawan', feature: 'Data Karyawan' },
    { key: 'inventaris', label: 'Inventaris', feature: 'Inventaris' },
    { key: 'dokumen', label: 'Dokumen Digital', feature: 'Dokumen Digital' },
    { key: 'notif', label: 'Notifikasi', feature: 'Notifikasi' },
    { key: 'diskusi', label: 'Diskusi', feature: 'Diskusi' },
    { key: 'roles', label: 'Pengaturan Role', feature: 'Pengaturan Role' },
  ];

  const Owner_ROLE_LIST = [
    'Owner',
    'Manajer Operasional',
    'Admin Umum',
    'Marketing Komunikasi',
    'KOL Management',
    'Social Media',
    'IT Programmer',
    'UI/UX',
    'Guest',
  ];

  /** @type {Record<string, Record<string, boolean>>} */
  const Owner_ROLE_MATRIX = {
    'Owner': {
      'Dashboard': true, 'Payroll': true, 'Penilaian Kinerja': true, 'Disiplin & Peringatan': true,
      'Data Karyawan': true, 'Inventaris': true, 'Dokumen Digital': true, 'Notifikasi': true,
      'Diskusi': true, 'Pengaturan Role': true,
    },
    'Manajer Operasional': {
      'Dashboard': true, 'Payroll': true, 'Penilaian Kinerja': true, 'Disiplin & Peringatan': true,
      'Data Karyawan': true, 'Inventaris': true, 'Dokumen Digital': true, 'Notifikasi': true,
      'Diskusi': true, 'Pengaturan Role': false,
    },
    'Admin Umum': {
      'Dashboard': true, 'Payroll': true, 'Penilaian Kinerja': true, 'Disiplin & Peringatan': true,
      'Data Karyawan': true, 'Inventaris': true, 'Dokumen Digital': true, 'Notifikasi': true,
      'Diskusi': true, 'Pengaturan Role': false,
    },
    'Marketing Komunikasi': {
      'Dashboard': true, 'Payroll': false, 'Penilaian Kinerja': false, 'Disiplin & Peringatan': false,
      'Data Karyawan': false, 'Inventaris': false, 'Dokumen Digital': true, 'Notifikasi': true,
      'Diskusi': true, 'Pengaturan Role': false,
    },
    'KOL Management': {
      'Dashboard': true, 'Payroll': false, 'Penilaian Kinerja': false, 'Disiplin & Peringatan': false,
      'Data Karyawan': false, 'Inventaris': false, 'Dokumen Digital': true, 'Notifikasi': true,
      'Diskusi': true, 'Pengaturan Role': false,
    },
    'Social Media': {
      'Dashboard': true, 'Payroll': false, 'Penilaian Kinerja': false, 'Disiplin & Peringatan': false,
      'Data Karyawan': false, 'Inventaris': false, 'Dokumen Digital': true, 'Notifikasi': true,
      'Diskusi': true, 'Pengaturan Role': false,
    },
    'IT Programmer': {
      'Dashboard': true, 'Payroll': false, 'Penilaian Kinerja': false, 'Disiplin & Peringatan': false,
      'Data Karyawan': false, 'Inventaris': false, 'Dokumen Digital': true, 'Notifikasi': true,
      'Diskusi': true, 'Pengaturan Role': true,
    },
    'UI/UX': {
      'Dashboard': true, 'Payroll': false, 'Penilaian Kinerja': false, 'Disiplin & Peringatan': false,
      'Data Karyawan': false, 'Inventaris': false, 'Dokumen Digital': true, 'Notifikasi': true,
      'Diskusi': true, 'Pengaturan Role': false,
    },
    'Guest': {
      'Dashboard': false, 'Payroll': false, 'Penilaian Kinerja': false, 'Disiplin & Peringatan': false,
      'Data Karyawan': false, 'Inventaris': false, 'Dokumen Digital': false, 'Notifikasi': false,
      'Diskusi': false, 'Pengaturan Role': false,
    },
  };



  function safeJsonParse(s, fallback) {
    try {
      const v = JSON.parse(String(s || ''));
      return v ?? fallback;
    } catch {
      return fallback;
    }
  }

  function readList(key, fallback) {
    return safeJsonParse(localStorage.getItem(key), fallback);
  }

  function writeList(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // --------------------------------------------------------------
  // Branding (logo + avatar) dari Profil Perusahaan
  // --------------------------------------------------------------
  function applyCompanyBranding() {
    const prof = readList(LS.PROFIL, {});
    const name = String(prof?.name || 'Bisa Media').trim() || 'Bisa Media';

    // teks brand
    document.querySelectorAll('.app-brand-text').forEach((el) => {
      if (el) el.textContent = name;
    });
    document.querySelectorAll('[data-ceo-company-name]').forEach((el) => {
      if (el) el.textContent = name;
    });

    // logo + avatar
    const logo = String(prof?.logo_data_url || '').trim();
    const avatar = String(prof?.avatar_data_url || '').trim();

    const logoSrc = logo || './media/logo.png';
    const avatarSrc = avatar || './media/avatar.png';

    document.querySelectorAll('img[data-ceo-brand-logo]').forEach((img) => {
      if (img && img.getAttribute('src') !== logoSrc) img.setAttribute('src', logoSrc);
    });
    document.querySelectorAll('img[data-ceo-avatar]').forEach((img) => {
      if (img && img.getAttribute('src') !== avatarSrc) img.setAttribute('src', avatarSrc);
    });
  }

  function uid(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function toISODate(d) {
    const dt = (d instanceof Date) ? d : new Date(d);
    return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
  }

  function todayISO() {
    return toISODate(new Date());
  }

  function addDaysISO(baseIso, plusDays) {
    const [y, m, d] = String(baseIso).split('-').map((x) => Number(x));
    const dt = new Date(y, (m || 1) - 1, d || 1);
    dt.setDate(dt.getDate() + Number(plusDays || 0));
    return toISODate(dt);
  }

  // --------------------------------------------------------------
  // Seed data
  // --------------------------------------------------------------
  function ensureSeeds() {
    const emptyListKeys = [
      LS.SUB,
      LS.DIV_LEGACY,
      LS.DIVISI,
      LS.JABATAN,
      LS.STAFF,
      LS.CAL,
      LS.KAR,
      LS.KONTRAK,
      LS.ABSEN,
      LS.ABSEN_DEMO,
      LS.KARYAWAN_DIVISI,
      LS.KEGIATAN_KARYAWAN,
      LS.KUNJUNGAN_KARYAWAN,
      LS.AKUN_KARYAWAN,
      LS.AKUN_USER,
      LS.SKENARIO_JAM_KERJA,
      LS.WAKTU_LIBUR,
    ];

    emptyListKeys.forEach((key) => {
      const current = readList(key, null);
      if (!Array.isArray(current)) writeList(key, []);
    });

    const prof = readList(LS.PROFIL, null);
    if (!prof || typeof prof !== 'object' || Array.isArray(prof)) {
      writeList(LS.PROFIL, {
        name: '',
        tagline: '',
        email: '',
        phone: '',
        website: '',
        address: '',
        about: '',
        logo_data_url: '',
        avatar_data_url: '',
      });
    } else {
      if (!('logo_data_url' in prof)) prof.logo_data_url = '';
      if (!('avatar_data_url' in prof)) prof.avatar_data_url = '';
      writeList(LS.PROFIL, prof);
    }
  }



  // ===== Data awal dikosongkan =====
  [
    LS.KARYAWAN_DIVISI,
    LS.KEGIATAN_KARYAWAN,
    LS.KUNJUNGAN_KARYAWAN,
    LS.SKENARIO_JAM_KERJA,
    LS.WAKTU_LIBUR,
  ].forEach((key) => {
    const rows = readList(key, null);
    if (!Array.isArray(rows)) writeList(key, []);
  });

  syncEmployeeAccounts();

  // --------------------------------------------------------------
  // Bootstrap modal helper
  // --------------------------------------------------------------
  function ensureModal(id, html) {
    let el = document.getElementById(id);
    if (el) return el;
    el = document.createElement('div');
    el.className = 'modal fade';
    el.id = id;
    el.tabIndex = -1;
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = html;
    document.body.appendChild(el);
    return el;
  }

  function showModal(id) {
    const el = document.getElementById(id);
    if (!el) return null;
    const modal = bootstrap.Modal.getOrCreateInstance(el);
    modal.show();
    return modal;
  }

  function setModalBodyReadOnly(modalEl, isReadOnly) {
    if (!modalEl) return;
    const body = modalEl.querySelector('.modal-body');
    if (!body) return;
    $$('input, textarea, select', body).forEach((el) => {
      const tag = (el.tagName || '').toLowerCase();
      const type = String(el.type || '').toLowerCase();
      if (tag === 'select') {
        el.disabled = !!isReadOnly;
        return;
      }
      if (type === 'file' || type === 'checkbox' || type === 'radio') {
        el.disabled = !!isReadOnly;
        return;
      }
      el.readOnly = !!isReadOnly;
    });
  }

  // --------------------------------------------------------------
  // Calendar events
  // --------------------------------------------------------------
  const HOLIDAY_COUNTRY_CODE = 'ID';
  const HOLIDAY_CACHE_PREFIX = 'ceoHolidayCacheV3::';
  const HOLIDAY_API_BASE = 'https://date.nager.at/api/v3/PublicHolidays';
  const OFFICIAL_HOLIDAY_FALLBACK = {
    2026: [
      { date: '2026-01-01', title: 'Tahun Baru 2026 Masehi', note: 'Libur nasional 2026' },
      { date: '2026-01-16', title: 'Isra Mikraj Nabi Muhammad SAW', note: 'Libur nasional 2026' },
      { date: '2026-02-16', title: 'Cuti Bersama Tahun Baru Imlek 2577 Kongzili', note: 'Cuti bersama 2026' },
      { date: '2026-02-17', title: 'Tahun Baru Imlek 2577 Kongzili', note: 'Libur nasional 2026' },
      { date: '2026-03-18', title: 'Cuti Bersama Hari Suci Nyepi', note: 'Cuti bersama 2026' },
      { date: '2026-03-19', title: 'Hari Suci Nyepi (Tahun Baru Saka 1948)', note: 'Libur nasional 2026' },
      { date: '2026-03-20', title: 'Cuti Bersama Idul Fitri 1447 H', note: 'Cuti bersama 2026' },
      { date: '2026-03-21', title: 'Hari Raya Idul Fitri 1447 H', note: 'Libur nasional 2026' },
      { date: '2026-03-22', title: 'Hari Raya Idul Fitri 1447 H', note: 'Libur nasional 2026' },
      { date: '2026-03-23', title: 'Cuti Bersama Idul Fitri 1447 H', note: 'Cuti bersama 2026' },
      { date: '2026-03-24', title: 'Cuti Bersama Idul Fitri 1447 H', note: 'Cuti bersama 2026' },
      { date: '2026-04-03', title: 'Wafat Yesus Kristus', note: 'Libur nasional 2026' },
      { date: '2026-04-05', title: 'Hari Kebangkitan Yesus Kristus (Paskah)', note: 'Libur nasional 2026' },
      { date: '2026-05-01', title: 'Hari Buruh Internasional', note: 'Libur nasional 2026' },
      { date: '2026-05-14', title: 'Kenaikan Yesus Kristus', note: 'Libur nasional 2026' },
      { date: '2026-05-15', title: 'Cuti Bersama Kenaikan Yesus Kristus', note: 'Cuti bersama 2026' },
      { date: '2026-05-27', title: 'Hari Raya Idul Adha 1447 H', note: 'Libur nasional 2026' },
      { date: '2026-05-28', title: 'Cuti Bersama Idul Adha 1447 H', note: 'Cuti bersama 2026' },
      { date: '2026-05-31', title: 'Hari Raya Waisak 2570 BE', note: 'Libur nasional 2026' },
      { date: '2026-06-01', title: 'Hari Lahir Pancasila', note: 'Libur nasional 2026' },
      { date: '2026-06-16', title: '1 Muharam 1448 H (Tahun Baru Islam)', note: 'Libur nasional 2026' },
      { date: '2026-08-17', title: 'Hari Proklamasi Kemerdekaan', note: 'Libur nasional 2026' },
      { date: '2026-08-25', title: 'Maulid Nabi Muhammad SAW', note: 'Libur nasional 2026' },
      { date: '2026-12-24', title: 'Cuti Bersama Kelahiran Yesus Kristus', note: 'Cuti bersama 2026' },
      { date: '2026-12-25', title: 'Kelahiran Yesus Kristus', note: 'Libur nasional 2026' },
    ],
  };
  const holidayState = {
    loadedYears: new Set(),
    loadingYears: new Set(),
  };

  function getEventTypeKey(type) {
    const raw = String(type || '').trim().toLowerCase();
    if (!raw) return 'other';
    if (raw.includes('tanggal merah') || raw.includes('libur') || raw.includes('holiday')) return 'holiday';
    if (raw.includes('visit')) return 'visit';
    if (raw.includes('meeting') || raw.includes('rapat')) return 'meeting';
    if (raw.includes('deadline')) return 'deadline';
    if (raw === 'hr' || raw.includes('human resource')) return 'hr';
    return 'other';
  }

  function getEventTypeLabel(type) {
    const key = getEventTypeKey(type);
    if (key === 'holiday') return 'Tanggal Merah';
    if (key === 'visit') return 'Visit';
    if (key === 'meeting') return 'Meeting';
    if (key === 'deadline') return 'Deadline';
    if (key === 'hr') return 'HR';
    return 'Umum';
  }

  function getEventTypeBadgeHtml(type) {
    const key = getEventTypeKey(type);
    const label = getEventTypeLabel(type);
    return `<span class="bm-event-badge bm-event-badge--${escapeHtml(key)}">${escapeHtml(label)}</span>`;
  }

  function buildHolidayEvent(year, idx, item) {
    const date = String(item?.date || '').trim();
    if (!date) return null;
    const source = String(item?.source || '').trim() || 'holiday';
    const note = String(item?.note || '').trim() || 'Hari libur nasional';
    return {
      id: `holiday_${year}_${idx}_${date}_${source}`,
      date,
      start: '',
      end: '',
      title: String(item?.localName || item?.name || item?.title || 'Hari Libur').trim(),
      type: 'Tanggal Merah',
      note,
      people_ids: [],
      source,
      isHoliday: true,
    };
  }

  function getFallbackHolidayRows(year) {
    return ensureArr(OFFICIAL_HOLIDAY_FALLBACK[year]).map((item, idx) => ({
      ...item,
      source: 'official-fallback',
    })).map((item, idx) => buildHolidayEvent(year, idx, item)).filter(Boolean);
  }

  function uniqHolidayRows(rows) {
    const map = new Map();
    ensureArr(rows).forEach((item) => {
      const ev = item && item.date ? item : null;
      if (!ev) return;
      const key = `${String(ev.date).trim()}::${String(ev.title || '').trim()}`;
      if (!map.has(key)) map.set(key, ev);
    });
    return Array.from(map.values()).sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')) || String(a.title || '').localeCompare(String(b.title || '')));
  }

  function readHolidayCache(year) {
    const key = `${HOLIDAY_CACHE_PREFIX}${HOLIDAY_COUNTRY_CODE}::${year}`;
    const cached = readList(key, []);
    return Array.isArray(cached) ? cached : [];
  }

  function writeHolidayCache(year, holidays) {
    const key = `${HOLIDAY_CACHE_PREFIX}${HOLIDAY_COUNTRY_CODE}::${year}`;
    writeList(key, uniqHolidayRows(Array.isArray(holidays) ? holidays : []));
  }

  function getLoadedHolidayEvents() {
    const out = [];
    Array.from(holidayState.loadedYears).forEach((year) => {
      out.push(...readHolidayCache(year));
    });
    return out;
  }

  function ensureHolidayYearsLoaded(years) {
    const wanted = Array.from(new Set(ensureArr(years).map((x) => Number(x)).filter((x) => Number.isFinite(x) && x > 1900)));
    wanted.forEach((year) => {
      if (holidayState.loadedYears.has(year) || holidayState.loadingYears.has(year)) return;

      const cached = uniqHolidayRows([...readHolidayCache(year), ...getFallbackHolidayRows(year)]);
      if (cached.length) {
        writeHolidayCache(year, cached);
        holidayState.loadedYears.add(year);
        window.dispatchEvent(new Event('ceo:calendar:changed'));
        return;
      }

      holidayState.loadingYears.add(year);
      fetch(`${HOLIDAY_API_BASE}/${year}/${HOLIDAY_COUNTRY_CODE}`)
        .then((res) => {
          if (!res.ok) throw new Error(`Holiday API ${res.status}`);
          return res.json();
        })
        .then((rows) => {
          const apiRows = (Array.isArray(rows) ? rows : []).map((item, idx) => buildHolidayEvent(year, idx, item)).filter(Boolean);
          const holidays = uniqHolidayRows([...apiRows, ...getFallbackHolidayRows(year)]);
          writeHolidayCache(year, holidays);
          holidayState.loadedYears.add(year);
          holidayState.loadingYears.delete(year);
          window.dispatchEvent(new Event('ceo:calendar:changed'));
        })
        .catch(() => {
          const fallbackRows = getFallbackHolidayRows(year);
          if (fallbackRows.length) {
            writeHolidayCache(year, fallbackRows);
            holidayState.loadedYears.add(year);
            window.dispatchEvent(new Event('ceo:calendar:changed'));
          }
          holidayState.loadingYears.delete(year);
        });
    });
  }

  function readEvents() {
    const localEvents = readList(LS.CAL, []);
    const manual = Array.isArray(localEvents) ? localEvents : [];
    return [...manual, ...getLoadedHolidayEvents()];
  }

  function writeEvents(evs) {
    const safe = (Array.isArray(evs) ? evs : []).filter((ev) => !ev?.isHoliday && ev?.source !== 'holiday');
    writeList(LS.CAL, safe);
  }

  function syncKegiatanKaryawanCalendarEvent(activity) {
    const id = String(activity?.id || '').trim();
    if (!id) return;

    const rows = readList(LS.CAL, []);
    const safeRows = (Array.isArray(rows) ? rows : []).filter((ev) => String(ev?.activity_id || '') !== id);
    const date = String(activity?.tanggal_kegiatan || '').trim();

    if (date) {
      safeRows.push({
        id: `kgt_${id}`,
        date,
        start: String(activity?.waktu_kegiatan || '').trim(),
        end: '',
        title: String(activity?.nama_kegiatan || 'Kegiatan Karyawan').trim() || 'Kegiatan Karyawan',
        type: String(activity?.kategori || 'Umum').trim() || 'Umum',
        note: String(activity?.deskripsi || activity?.peserta || '').trim(),
        people_ids: [],
        location: '',
        gps: '',
        source: 'kegiatan_karyawan',
        activity_id: id,
      });
    }

    writeEvents(safeRows);
    window.dispatchEvent(new Event('ceo:calendar:changed'));
  }

  function removeKegiatanKaryawanCalendarEvent(activityId) {
    const id = String(activityId || '').trim();
    if (!id) return;
    const rows = readList(LS.CAL, []);
    writeEvents((Array.isArray(rows) ? rows : []).filter((ev) => String(ev?.activity_id || '') !== id));
    window.dispatchEvent(new Event('ceo:calendar:changed'));
  }

  function indexEvents(evs) {
    const map = Object.create(null);
    evs.forEach((ev) => {
      const k = String(ev?.date || '').trim();
      if (!k) return;
      map[k] = map[k] || [];
      map[k].push(ev);
    });

    Object.keys(map).forEach((k) => {
      map[k].sort((a, b) => {
        const aHoliday = a?.isHoliday || a?.source === 'holiday';
        const bHoliday = b?.isHoliday || b?.source === 'holiday';
        if (aHoliday !== bHoliday) return aHoliday ? -1 : 1;
        return String(a?.start || '').localeCompare(String(b?.start || ''));
      });
    });

    return map;
  }

  function fmtLongDate(iso) {

    const [y, m, d] = String(iso).split('-').map((x) => Number(x));
    const dt = new Date(y, (m || 1) - 1, d || 1);
    return dt.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  function getEmployeeNameById(id) {
    const rows = readList(LS.KAR, []);
    const it = (Array.isArray(rows) ? rows : []).find((x) => String(x?.id || '') === String(id || ''));
    return it?.name ? String(it.name) : '';
  }

  function formatPeopleBadge(ids) {
    const arr = ensureArr(ids).map((x) => String(x || '').trim()).filter(Boolean);
    if (!arr.length) return '';

    const names = arr.map(getEmployeeNameById).map((x) => String(x || '').trim()).filter(Boolean);
    if (!names.length) return '';

    const shown = names.slice(0, 3);
    const remain = names.length - shown.length;
    const suffix = remain > 0 ? ` +${remain}` : '';
    return `<small class="text-muted d-block mt-1">Untuk: ${escapeHtml(shown.join(', '))}${escapeHtml(suffix)}</small>`;
  }

  function renderEventList({ listEl, emptyEl, dateIso, mode }) {
    if (!listEl) return;

    const evs = readEvents();
    const map = indexEvents(evs);

    const k = String(dateIso || todayISO());
    let items = map[k] || [];

    if (mode === 'dashboard') {
      items = items.slice(0, 6);
    }

    listEl.innerHTML = '';

    if (!items.length) {
      emptyEl?.classList?.remove('d-none');
      return;
    }

    emptyEl?.classList?.add('d-none');

    items.forEach((ev) => {
      const title = String(ev?.title || '-').trim() || '-';
      const isHoliday = !!(ev?.isHoliday || ev?.source === 'holiday');
      const start = String(ev?.start || '').trim();
      const end = String(ev?.end || '').trim();
      const time = isHoliday
        ? 'Libur nasional'
        : (start || end ? `${start || '--:--'}${end ? ` - ${end}` : ''}` : 'Jadwal fleksibel');
      const peopleHtml = isHoliday ? '' : formatPeopleBadge(ev?.people_ids);
      const location = String(ev?.location || '').trim();
      const gps = String(ev?.gps || '').trim();

      const item = document.createElement('div');
      item.className = 'list-group-item d-flex justify-content-between align-items-start';
      item.innerHTML = `
        <div class="pe-2">
          <div class="fw-semibold">${escapeHtml(title)}</div>
          <small class="text-muted">${escapeHtml(time)}</small>
          ${peopleHtml}
          ${location ? `<small class="text-muted d-block mt-1">Lokasi: ${escapeHtml(location)}</small>` : ``}
          ${gps ? `<small class="text-muted d-block mt-1">Titik GPS: ${escapeHtml(gps)}</small>` : ``}
          ${ev?.note ? `<small class="text-muted d-block mt-1">${escapeHtml(ev.note)}</small>` : ``}
        </div>
        <div class="d-flex align-items-center gap-2 flex-wrap justify-content-end">
          ${getEventTypeBadgeHtml(ev?.type)}
          ${mode === 'calendar' && !isHoliday ? `<button type="button" class="btn btn-icon btn-sm btn-outline-danger" data-ev-del="${escapeHtml(ev.id)}" title="Hapus"><i class="bx bx-trash"></i></button>` : ''}
        </div>
      `.trim();
      listEl.appendChild(item);
    });
  }

  function initEventDelete(listEl) {
    if (!listEl) return;
    listEl.addEventListener('click', (e) => {
      const btn = e.target?.closest?.('button[data-ev-del]');
      if (!btn) return;
      const id = btn.getAttribute('data-ev-del');
      if (!id) return;
      e.preventDefault();
      e.stopPropagation();
      confirmDelete('Hapus Jadwal ini?', () => {
        const evs = readEvents().filter((x) => String(x.id) !== String(id));
        writeEvents(evs);
        window.dispatchEvent(new Event('ceo:calendar:changed'));
        showCeoToast('Jadwal berhasil dihapus.', 'warning');
      }, 'Jadwal');
    });
  }

  function initCalendarMini({
    daysEl,
    labelEl,
    prevBtn,
    nextBtn,
    selectedLabelEl,
    listEl,
    emptyEl,
    addBtn,
    mode,
  }) {
    if (!daysEl) return;

    const state = {
      view: new Date(),
      selectedIso: todayISO(),
    };

    // Dashboard tidak lagi memakai legenda kategori kalender
    // (Meeting, Tanggal Merah, Visit, HR, Deadline, Lainnya).
    daysEl.closest('.card')?.querySelectorAll('.bmcal-legend').forEach((el) => el.remove());

    function fmtMonth(d) {
      return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase('id-ID');
    }

    function startOfMonth(d) {
      return new Date(d.getFullYear(), d.getMonth(), 1);
    }

    function endOfMonth(d) {
      return new Date(d.getFullYear(), d.getMonth() + 1, 0);
    }

    function hasHolidayEvent(items) {
      const rows = Array.isArray(items) ? items : [];
      return rows.some((ev) => !!ev?.isHoliday || String(ev?.source || '').trim() === 'holiday' || getEventTypeKey(ev?.type) === 'holiday');
    }

    function buildMarkerDots(items) {
      // Revisi BM: tanda/label "Tanggal Merah" pada kotak tanggal dihapus.
      // Data tanggal merah tetap dipakai untuk daftar/keterangan jadwal, tetapi tidak diberi marker di angka kalender.
      return '';
    }

    function isManualCalendarEvent(ev) {
      return !!ev && !ev.isHoliday && String(ev.source || '').trim() !== 'holiday';
    }

    function isSameViewedMonth(dateIso, viewDate) {
      const parts = String(dateIso || '').split('-').map((x) => Number(x));
      if (parts.length < 3 || !Number.isFinite(parts[0]) || !Number.isFinite(parts[1])) return false;
      return parts[0] === viewDate.getFullYear() && parts[1] === (viewDate.getMonth() + 1);
    }

    function renderMonthScheduleSummary(viewDate) {
      if (mode !== 'calendar') return;

      const monthListEl = document.getElementById('bmcalMonthScheduleList');
      const monthEmptyEl = document.getElementById('bmcalMonthEmpty');
      const monthCountEl = document.getElementById('bmcalMonthCount');
      const monthInfoEl = document.getElementById('bmcalMonthInfo');
      if (!monthListEl) return;

      // Ambil semua agenda pada bulan aktif: manual, tanggal merah/libur nasional, Meeting, Visit, HR, Deadline, dan Umum.
      const events = readEvents()
        .filter((ev) => isSameViewedMonth(ev?.date, viewDate))
        .sort((a, b) => String(a?.date || '').localeCompare(String(b?.date || '')) || String(a?.start || '').localeCompare(String(b?.start || '')) || String(a?.title || '').localeCompare(String(b?.title || '')));

      if (monthInfoEl) {
        monthInfoEl.textContent = '';
        monthInfoEl.classList.add('d-none');
      }

      if (monthCountEl) {
        monthCountEl.textContent = `${events.length} Jadwal`;
      }

      monthListEl.innerHTML = '';
      if (monthEmptyEl) monthEmptyEl.classList.toggle('d-none', events.length > 0);
      if (!events.length) return;

      const groups = new Map();
      events.forEach((ev) => {
        const dateKey = String(ev?.date || '').trim();
        if (!groups.has(dateKey)) groups.set(dateKey, []);
        groups.get(dateKey).push(ev);
      });

      Array.from(groups.entries()).forEach(([dateIso, rows]) => {
        const groupEl = document.createElement('div');
        groupEl.className = 'bmcal-month-group';
        groupEl.innerHTML = `
          <div class="bmcal-month-date">${escapeHtml(fmtLongDate(dateIso))}</div>
          <div class="bmcal-month-items"></div>
        `.trim();

        const itemsEl = groupEl.querySelector('.bmcal-month-items');
        rows.forEach((ev) => {
          const isHoliday = !!(ev?.isHoliday || ev?.source === 'holiday');
          const time = isHoliday ? 'Libur nasional' : ([ev?.start, ev?.end].filter(Boolean).join(' - ') || 'Tanpa jam');
          const peopleHtml = isHoliday ? '' : formatPeopleBadge(ev?.people_ids || []);
          const location = String(ev?.location || '').trim();
          const gps = String(ev?.gps || '').trim();
          const itemEl = document.createElement('div');
          itemEl.className = `bmcal-month-item bmcal-month-item--${escapeHtml(getEventTypeKey(ev?.type))}`;
          itemEl.innerHTML = `
            <div class="bmcal-month-item__main">
              <span class="bmcal-month-item__title">${escapeHtml(ev?.title || 'Jadwal')}</span>
              <span class="d-flex align-items-center gap-2 flex-wrap justify-content-end">
                <small class="text-muted">${escapeHtml(time)}</small>
                ${getEventTypeBadgeHtml(ev?.type)}
                ${!isHoliday ? `<button type="button" class="btn btn-icon btn-sm btn-outline-danger" data-ev-del="${escapeHtml(ev.id)}" title="Hapus"><i class="bx bx-trash"></i></button>` : ''}
              </span>
            </div>
            ${peopleHtml}
            ${location ? `<small class="text-muted d-block mt-1">Lokasi: ${escapeHtml(location)}</small>` : ''}
            ${gps ? `<small class="text-muted d-block mt-1">Titik GPS: ${escapeHtml(gps)}</small>` : ''}
            ${ev?.note ? `<small class="text-muted d-block mt-1">${escapeHtml(ev.note)}</small>` : ''}
          `.trim();
          itemsEl?.appendChild(itemEl);
        });

        monthListEl.appendChild(groupEl);
      });
    }

    function render() {
      ensureHolidayYearsLoaded([
        state.view.getFullYear() - 1,
        state.view.getFullYear(),
        state.view.getFullYear() + 1,
      ]);

      const evs = readEvents();
      const map = indexEvents(evs);

      const view = state.view;
      const start = startOfMonth(view);
      const end = endOfMonth(view);

      if (labelEl) labelEl.textContent = fmtMonth(view);
      daysEl.innerHTML = '';

      const padStart = start.getDay();
      const totalDays = end.getDate();
      const today = todayISO();

      const prevEnd = new Date(view.getFullYear(), view.getMonth(), 0);
      for (let i = padStart; i > 0; i--) {
        const d = new Date(view.getFullYear(), view.getMonth() - 1, prevEnd.getDate() - i + 1);
        const iso = toISODate(d);
        const items = map[iso] || [];
        const cell = document.createElement('div');
        cell.className = 'bmcalDay is-muted';
        if (d.getDay() === 0) cell.classList.add('is-sunday');
        if (items.length) cell.classList.add('has-event');
        if (hasHolidayEvent(items)) cell.classList.add('is-holiday');
        cell.dataset.iso = iso;
        cell.title = items.length ? items.map((ev) => String(ev?.title || '')).filter(Boolean).join(', ') : '';
        cell.innerHTML = `<span class="bmcalDay__num">${d.getDate()}</span>${buildMarkerDots(items)}`;
        daysEl.appendChild(cell);
      }

      for (let day = 1; day <= totalDays; day++) {
        const d = new Date(view.getFullYear(), view.getMonth(), day);
        const iso = toISODate(d);
        const items = map[iso] || [];
        const cell = document.createElement('div');
        cell.className = 'bmcalDay';
        if (d.getDay() === 0) cell.classList.add('is-sunday');
        if (iso === today) cell.classList.add('is-today');
        if (iso === state.selectedIso) cell.classList.add('is-selected');
        if (items.length) cell.classList.add('has-event');
        if (hasHolidayEvent(items)) cell.classList.add('is-holiday');
        cell.dataset.iso = iso;
        cell.title = items.length ? items.map((ev) => String(ev?.title || '')).filter(Boolean).join(', ') : '';
        cell.innerHTML = `<span class="bmcalDay__num">${day}</span>${buildMarkerDots(items)}`;
        cell.addEventListener('click', () => {
          state.selectedIso = iso;
          render();
          if (selectedLabelEl && mode === 'calendar') {
            selectedLabelEl.textContent = fmtLongDate(iso);
          }
          if (mode === 'dashboard' && selectedLabelEl) {
            const t = todayISO();
            selectedLabelEl.textContent = (iso === t) ? 'Jadwal Hari Ini' : `Jadwal: ${fmtLongDate(iso)}`;
          }
          renderEventList({ listEl, emptyEl, dateIso: iso, mode: mode === 'dashboard' ? 'dashboard' : 'calendar' });
        });
        daysEl.appendChild(cell);
      }

      const cellsNow = daysEl.children.length;
      const padEnd = (7 - (cellsNow % 7)) % 7;
      for (let i = 1; i <= padEnd; i++) {
        const d = new Date(view.getFullYear(), view.getMonth() + 1, i);
        const iso = toISODate(d);
        const items = map[iso] || [];
        const cell = document.createElement('div');
        cell.className = 'bmcalDay is-muted';
        if (d.getDay() === 0) cell.classList.add('is-sunday');
        if (items.length) cell.classList.add('has-event');
        if (hasHolidayEvent(items)) cell.classList.add('is-holiday');
        cell.dataset.iso = iso;
        cell.title = items.length ? items.map((ev) => String(ev?.title || '')).filter(Boolean).join(', ') : '';
        cell.innerHTML = `<span class="bmcalDay__num">${i}</span>${buildMarkerDots(items)}`;
        daysEl.appendChild(cell);
      }

      if (mode === 'calendar') {
        if (selectedLabelEl) selectedLabelEl.textContent = fmtLongDate(state.selectedIso);
        renderEventList({ listEl, emptyEl, dateIso: state.selectedIso, mode: 'calendar' });
        renderMonthScheduleSummary(view);
      } else {
        const t = todayISO();
        if (selectedLabelEl) selectedLabelEl.textContent = (state.selectedIso === t) ? 'Jadwal Hari Ini' : `Jadwal: ${fmtLongDate(state.selectedIso)}`;
        renderEventList({ listEl, emptyEl, dateIso: state.selectedIso, mode: 'dashboard' });
      }
    }

    prevBtn?.addEventListener('click', () => {
      state.view = new Date(state.view.getFullYear(), state.view.getMonth() - 1, 1);
      render();
    });

    nextBtn?.addEventListener('click', () => {
      state.view = new Date(state.view.getFullYear(), state.view.getMonth() + 1, 1);
      render();
    });

    if (addBtn && mode === 'calendar' && !addBtn.dataset.boundCalendarAdd) {
      addBtn.dataset.boundCalendarAdd = '1';
      addBtn.addEventListener('click', () => openAddEventModal(state.selectedIso));
    }

    window.addEventListener('ceo:calendar:changed', render);

    render();
  }


  function createMultiSelect(root, config) {
    if (!root) return null;

    const options = Array.isArray(config?.options) ? config.options : [];
    const getValue = typeof config?.getValue === 'function' ? config.getValue : ((o) => o?.value);
    const getLabel = typeof config?.getLabel === 'function' ? config.getLabel : ((o) => o?.label);
    const placeholder = String(config?.placeholder || 'Pilih data...');
    const selected = new Set(Array.isArray(config?.selected) ? config.selected.map((v) => String(v)) : []);

    root.innerHTML = `
      <div class="bm-ms">
        <button type="button" class="form-control text-start bm-ms__btn d-flex align-items-center justify-content-between">
          <span class="bm-ms__text text-truncate"></span>
          <i class="bx bx-chevron-down ms-2"></i>
        </button>
        <div class="bm-ms__menu shadow-sm">
          <div class="p-2 border-bottom">
            <input type="text" class="form-control form-control-sm bm-ms__search" placeholder="Cari karyawan..." />
          </div>
          <div class="bm-ms__list p-2"></div>
        </div>
      </div>
    `.trim();

    const wrap = root.querySelector('.bm-ms');
    const btn = root.querySelector('.bm-ms__btn');
    const textEl = root.querySelector('.bm-ms__text');
    const menu = root.querySelector('.bm-ms__menu');
    const listEl = root.querySelector('.bm-ms__list');
    const searchEl = root.querySelector('.bm-ms__search');

    function getSelectedLabels() {
      return options
        .filter((opt) => selected.has(String(getValue(opt))))
        .map((opt) => String(getLabel(opt) || '').trim())
        .filter(Boolean);
    }

    function renderButtonText() {
      const labels = getSelectedLabels();
      if (!labels.length) {
        textEl.textContent = placeholder;
        textEl.classList.add('text-muted');
        return;
      }
      textEl.classList.remove('text-muted');
      textEl.textContent = labels.join(', ');
    }

    function renderList() {
      const q = String(searchEl?.value || '').trim().toLowerCase();
      const rows = options.filter((opt) => {
        const label = String(getLabel(opt) || '').trim();
        return !q || label.toLowerCase().includes(q);
      });

      if (!rows.length) {
        listEl.innerHTML = '<div class="text-muted small px-2 py-1">Data tidak ditemukan.</div>';
        return;
      }

      listEl.innerHTML = rows.map((opt, idx) => {
        const value = String(getValue(opt));
        const label = String(getLabel(opt) || '').trim() || '-';
        const cid = `bm-ms-${idx}-${value.replace(/[^a-zA-Z0-9_-]+/g, '_')}`;
        return `
          <label class="bm-ms__opt d-flex align-items-center gap-2 px-2 py-1 rounded" for="${escapeHtml(cid)}">
            <input class="form-check-input m-0" type="checkbox" id="${escapeHtml(cid)}" value="${escapeHtml(value)}" ${selected.has(value) ? 'checked' : ''} />
            <span>${escapeHtml(label)}</span>
          </label>
        `;
      }).join('');
    }

    function openMenu() {
      menu.classList.add('is-open');
      searchEl?.focus?.();
    }

    function closeMenu() {
      menu.classList.remove('is-open');
      if (searchEl) searchEl.value = '';
      renderList();
    }

    btn?.addEventListener('click', (e) => {
      e.preventDefault();
      menu.classList.contains('is-open') ? closeMenu() : openMenu();
    });

    searchEl?.addEventListener('input', renderList);

    listEl?.addEventListener('change', (e) => {
      const input = e.target.closest('input[type="checkbox"]');
      if (!input) return;
      const value = String(input.value || '');
      if (!value) return;
      if (input.checked) selected.add(value);
      else selected.delete(value);
      renderButtonText();
    });

    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) closeMenu();
    });

    renderButtonText();
    renderList();

    return {
      getSelected() {
        return Array.from(selected);
      },
      setSelected(values) {
        selected.clear();
        (Array.isArray(values) ? values : []).forEach((v) => selected.add(String(v)));
        renderButtonText();
        renderList();
      },
    };
  }

  function openAddEventModal(defaultDateIso) {

    const id = 'ceoCalEventModal';
    const modalEl = ensureModal(
      id,
      `
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Tambah</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="vstack gap-3">
              <div>
                <label class="form-label">Judul</label>
                <input id="ceoEvTitle" class="form-control" type="text" placeholder="Contoh: Rapat Mingguan" />
              </div>
              <div class="row g-2">
                <div class="col-md-6">
                  <label class="form-label">Tanggal</label>
                  <input id="ceoEvDate" class="form-control" type="date" />
                </div>
                <div class="col-md-3">
                  <label class="form-label">Mulai</label>
                  <input id="ceoEvStart" class="form-control" type="time" value="09:00" />
                </div>
                <div class="col-md-3">
                  <label class="form-label">Selesai</label>
                  <input id="ceoEvEnd" class="form-control" type="time" value="10:00" />
                </div>
              </div>
              <div class="row g-2">
                <div class="col-md-6">
                  <label class="form-label">Tipe</label>
                  <select id="ceoEvType" class="form-select">
                    <option value="Meeting">Meeting</option>
                    <option value="Tanggal Merah">Tanggal Merah</option>
                    <option value="Visit">Visit</option>
                    <option value="HR">HR</option>
                    <option value="Deadline">Deadline</option>
                    <option value="Umum">Umum</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Catatan (opsional)</label>
                  <input id="ceoEvNote" class="form-control" type="text" placeholder="Contoh: Internal / Zoom" />
                </div>
              </div>
              <div class="row g-2 d-none" id="ceoEvVisitFields">
                <div class="col-md-6">
                  <label class="form-label">Lokasi</label>
                  <input id="ceoEvLocation" class="form-control" type="text" placeholder="Contoh: Kantor klien / alamat visit" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Titik GPS (Opsional)</label>
                  <input id="ceoEvGps" class="form-control" type="text" placeholder="Contoh: -6.200000, 106.816666" />
                </div>
              </div>
              <div>
                <label class="form-label">Untuk (Karyawan)</label>
                <div id="ceoEvPeopleMs" class="bm-mselect" data-placeholder="Pilih karyawan..."></div>
                <div class="form-text">Bisa pilih 2 atau lebih.</div>
              </div>
              <div class="alert alert-info mb-0">
                jadwal disimpan di <b>localStorage</b>.
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-primary" id="ceoEvSave">Simpan</button>
          </div>
        </div>
      </div>
      `.trim()
    );

    const dateEl = $('#ceoEvDate', modalEl);
    if (dateEl) dateEl.value = String(defaultDateIso || todayISO());

    const typeEl = $('#ceoEvType', modalEl);
    const visitFieldsEl = $('#ceoEvVisitFields', modalEl);
    const syncVisitFields = () => {
      const isVisit = String(typeEl?.value || '').trim().toLowerCase() === 'visit';
      visitFieldsEl?.classList.toggle('d-none', !isVisit);
    };
    typeEl?.addEventListener('change', syncVisitFields);
    syncVisitFields();

    // pilih karyawan (multi) untuk siapa jadwal ini
    const people = readList(LS.KAR, []);
    const peopleMs = createMultiSelect($('#ceoEvPeopleMs', modalEl), {
      placeholder: 'Pilih karyawan...',
      options: Array.isArray(people) ? people : [],
      getValue: (o) => String(o.id),
      getLabel: (o) => String(o.name),
    });

    const saveBtn = $('#ceoEvSave', modalEl);
    saveBtn.onclick = () => {
      const title = ($('#ceoEvTitle', modalEl)?.value || '').trim();
      const date = ($('#ceoEvDate', modalEl)?.value || '').trim();
      const start = ($('#ceoEvStart', modalEl)?.value || '').trim();
      const end = ($('#ceoEvEnd', modalEl)?.value || '').trim();
      const type = ($('#ceoEvType', modalEl)?.value || 'Umum').trim();
      const note = ($('#ceoEvNote', modalEl)?.value || '').trim();
      const location = ($('#ceoEvLocation', modalEl)?.value || '').trim();
      const gps = ($('#ceoEvGps', modalEl)?.value || '').trim();

      if (!title) {
        window.alert('Judul wajib diisi.');
        return;
      }
      if (!date) {
        window.alert('Tanggal wajib diisi.');
        return;
      }

      const evs = readEvents();
      const people_ids = peopleMs ? peopleMs.getSelected() : [];
      evs.push({ id: uid('ev'), date, start, end, title, type, note, people_ids, location, gps, source: 'manual' });
      writeEvents(evs);

      bootstrap.Modal.getOrCreateInstance(modalEl).hide();
      window.dispatchEvent(new Event('ceo:calendar:changed'));
    };

    showModal(id);
    const titleInput = modalEl.querySelector('.modal-body input, .modal-body select, .modal-body textarea');
    window.setTimeout(() => titleInput?.focus?.(), 120);
  }

  // --------------------------------------------------------------
  // Sub Perusahaan page
  // --------------------------------------------------------------
  function getSubCompanyInitials(name) {
    return String(name || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((x) => x.charAt(0).toUpperCase())
      .join('') || 'SP';
  }

  function getSubCompanyLogoMarkup(sp) {
    const initials = escapeHtml(getSubCompanyInitials(sp?.name));
    if (sp?.logo) {
      return `<img src="${escapeHtml(sp.logo)}" alt="${escapeHtml(sp?.name || 'Logo Sub Perusahaan')}" style="width:42px;height:42px;object-fit:cover;border-radius:12px;border:1px solid rgba(67,89,113,.12);background:#fff" />`;
    }
    return `<div class="d-inline-flex align-items-center justify-content-center fw-semibold text-primary" style="width:42px;height:42px;border-radius:12px;background:rgba(57,172,215,.12);border:1px solid rgba(57,172,215,.18)">${initials}</div>`;
  }

  function renderSubCompanies() {
    const table = $('#tblSubPerusahaan');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const subs = readList(LS.SUB, []);
    tbody.innerHTML = '';

    subs.forEach((sp, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td><button class="btn p-0 border-0 bg-transparent ceo-logo-click" type="button" data-sp-logo="${escapeHtml(sp.id)}" title="Lihat logo">${getSubCompanyLogoMarkup(sp)}</button></td>
        <td>${escapeHtml(sp.code || `SP-${String(idx + 1).padStart(3, '0')}`)}</td>
        <td>${escapeHtml(sp.name || '-')}</td>
        <td>${escapeHtml(sp.category || '-')}</td>
        <td>${escapeHtml(sp.location || '-')}</td>
        <td class="text-start">${escapeHtml(sp.address || '-')}</td>
        <td>${escapeHtml(sp.phone || '-')}</td>
        <td>${escapeHtml(sp.email || '-')}</td>
        <td class="text-start">${escapeHtml(sp.note || '-')}</td>
        <td class="tdActions">
          <div class="d-flex justify-content-center gap-2">
            <button class="btn btn-sm btn-icon btn-primary" type="button" data-sp-view="${escapeHtml(sp.id)}" title="Lihat" aria-label="Lihat"><i class="bx bx-show"></i></button>
            <button class="btn btn-sm btn-icon btn-outline-primary" type="button" data-sp-edit="${escapeHtml(sp.id)}" title="Edit" aria-label="Edit"><i class="bx bx-edit-alt"></i></button>
            <button class="btn btn-sm btn-icon btn-outline-danger" type="button" data-sp-del="${escapeHtml(sp.id)}" title="Hapus" aria-label="Hapus"><i class="bx bx-trash"></i></button>
          </div>
        </td>
      `.trim();
      tbody.appendChild(tr);
    });

    // trigger existing filter recalculation
    table._bmFilterState && window.dispatchEvent(new Event('input'));
  }

  function openSubCompanyModal(mode, data) {
    const id = 'ceoSubCompanyModal';
    const modalEl = ensureModal(
      id,
      `
      <div class="modal-dialog modal-dialog-scrollable modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="ceoSpTitle">Sub Perusahaan</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label">Logo</label>
                <input id="ceoSpLogo" class="form-control" type="file" accept="image/*" />
                <div class="form-text">Opsional. Logo akan disimpan sebagai data di localStorage.</div>
                <div class="mt-2">
                  <img id="ceoSpLogoPreview" alt="Preview Logo" src="" style="width:64px;height:64px;object-fit:cover;border-radius:16px;border:1px solid rgba(67,89,113,.12);background:#f5f5f9" />
                </div>
              </div>
              <div class="col-md-4">
                <label class="form-label">Kode Sub Perusahaan</label>
                <input id="ceoSpCode" class="form-control" type="text" placeholder="Contoh: SP-001" />
              </div>
              <div class="col-md-4">
                <label class="form-label">Sub Perusahaan</label>
                <input id="ceoSpName" class="form-control" type="text" placeholder="Contoh: Bisa Media Academy" />
              </div>
              <div class="col-md-4">
                <label class="form-label">Kategori</label>
                <input id="ceoSpCategory" class="form-control" type="text" placeholder="Contoh: Agency / Academy / Holding" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Lokasi</label>
                <input id="ceoSpLocation" class="form-control" type="text" placeholder="Contoh: Bandung" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Alamat</label>
                <input id="ceoSpAddress" class="form-control" type="text" placeholder="Contoh: Jl. Soekarno Hatta No. 10" />
              </div>
              <div class="col-md-6">
                <label class="form-label">No Telp</label>
                <input id="ceoSpPhone" class="form-control" type="text" placeholder="Contoh: 022-000000 / 08xxxxxxxxxx" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Email</label>
                <input id="ceoSpEmail" class="form-control" type="email" placeholder="Contoh: info@bisamedia.com" />
              </div>
              <div class="col-12">
                <label class="form-label">Keterangan</label>
                <textarea id="ceoSpNote" class="form-control" rows="3" placeholder="Keterangan tambahan"></textarea>
              </div>
              <div class="col-12">
                <div class="alert alert-info mb-0">data disimpan di <b>localStorage</b>.</div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-primary" id="ceoSpSave">Simpan</button>
          </div>
        </div>
      </div>
      `.trim()
    );

    let currentLogo = data?.logo || '';
    const isView = mode === 'view';
    setModalActionTitle($('#ceoSpTitle', modalEl), mode);
    $('#ceoSpCode', modalEl).value = data?.code || '';
    $('#ceoSpName', modalEl).value = data?.name || '';
    $('#ceoSpCategory', modalEl).value = data?.category || '';
    $('#ceoSpLocation', modalEl).value = data?.location || '';
    $('#ceoSpPhone', modalEl).value = data?.phone || '';
    $('#ceoSpEmail', modalEl).value = data?.email || '';
    $('#ceoSpAddress', modalEl).value = data?.address || '';
    $('#ceoSpNote', modalEl).value = data?.note || '';
    $('#ceoSpLogoPreview', modalEl).src = currentLogo || '';

    const fileInput = $('#ceoSpLogo', modalEl);
    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        currentLogo = String(reader.result || '');
        $('#ceoSpLogoPreview', modalEl).src = currentLogo;
      };
      reader.readAsDataURL(file);
    });

    setModalBodyReadOnly(modalEl, isView);
    $('#ceoSpSave', modalEl).classList.toggle('d-none', isView);

    $('#ceoSpSave', modalEl).onclick = () => {
      const code = ($('#ceoSpCode', modalEl).value || '').trim();
      const name = ($('#ceoSpName', modalEl).value || '').trim();
      const category = ($('#ceoSpCategory', modalEl).value || '').trim();
      const location = ($('#ceoSpLocation', modalEl).value || '').trim();
      const phone = ($('#ceoSpPhone', modalEl).value || '').trim();
      const email = ($('#ceoSpEmail', modalEl).value || '').trim();
      const address = ($('#ceoSpAddress', modalEl).value || '').trim();
      const note = ($('#ceoSpNote', modalEl).value || '').trim();

      if (!name) {
        window.alert('Sub perusahaan wajib diisi.');
        return;
      }

      const payload = { code, name, category, location, phone, email, address, note, logo: currentLogo };

      const subs = readList(LS.SUB, []);
      if (mode === 'edit') {
        const i = subs.findIndex((x) => x.id === data.id);
        if (i >= 0) subs[i] = { ...subs[i], ...payload };
      } else {
        subs.push({ id: uid('sp'), ...payload });
      }
      writeList(LS.SUB, subs);
      bootstrap.Modal.getOrCreateInstance(modalEl).hide();
      renderSubCompanies();
      window.dispatchEvent(new Event('ceo:org:changed'));
    };

    showModal(id);
    const titleInput = modalEl.querySelector('.modal-body input, .modal-body select, .modal-body textarea');
    window.setTimeout(() => titleInput?.focus?.(), 120);
  }

  function initSubCompanyPage() {
    const table = $('#tblSubPerusahaan');
    const addBtn = $('#btnAddSubPerusahaan');
    if (!table || !addBtn) return;

    table.dataset.ceoCustomCrud = '1';
    addBtn.dataset.ceoCustomCrud = '1';

    renderSubCompanies();
    addBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      openSubCompanyModal('add', null);
    });

    table.addEventListener('click', (e) => {
      const view = e.target?.closest?.('button[data-sp-view]');
      const del = e.target?.closest?.('button[data-sp-del]');
      const edit = e.target?.closest?.('button[data-sp-edit]');
      const logoBtn = e.target?.closest?.('button[data-sp-logo]');

      if (logoBtn) {
        const id = logoBtn.getAttribute('data-sp-logo');
        const subs = readList(LS.SUB, []);
        const cur = subs.find((x) => x.id === id);
        if (!cur?.logo) {
          window.alert('Logo belum tersedia.');
          return;
        }
        const modalId = 'ceoSubCompanyLogoModal';
        const modalEl = ensureModal(modalId, `
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="ceoSubCompanyLogoTitle">Logo Sub Perusahaan</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body text-center">
                <img id="ceoSubCompanyLogoImage" src="" alt="Logo Sub Perusahaan" class="img-fluid rounded-4 border" style="max-height:70vh;object-fit:contain;background:#fff;" />
              </div>
            </div>
          </div>
        `);
        const titleEl = $('#ceoSubCompanyLogoTitle', modalEl);
        const imgEl = $('#ceoSubCompanyLogoImage', modalEl);
        if (titleEl) titleEl.textContent = `Logo - ${String(cur.name || 'Sub Perusahaan').trim()}`;
        if (imgEl) {
          imgEl.src = cur.logo;
          imgEl.alt = `Logo ${String(cur.name || 'Sub Perusahaan').trim()}`;
        }
        showModal(modalId);
        return;
      }

      if (view) {
        const id = view.getAttribute('data-sp-view');
        const subs = readList(LS.SUB, []);
        const cur = subs.find((x) => x.id === id);
        if (!cur) return;
        openSubCompanyModal('view', cur);
        return;
      }

      if (del) {
        const id = del.getAttribute('data-sp-del');
        if (!id) return;
        confirmDelete('Delete Sub Perusahaan ini?', () => {
          const subs = readList(LS.SUB, []).filter((x) => x.id !== id);
          writeList(LS.SUB, subs);
          renderSubCompanies();
          window.dispatchEvent(new Event('ceo:org:changed'));
        });
        return;
      }

      if (edit) {
        const id = edit.getAttribute('data-sp-edit');
        const subs = readList(LS.SUB, []);
        const cur = subs.find((x) => x.id === id);
        if (!cur) return;
        openSubCompanyModal('edit', cur);
      }
    });
  }


  // --------------------------------------------------------------
  // Struktur Organisasi (V3)
  // - Divisi:   { sub_perusahaan, kode_divisi, induk, divisi }
  // - Jabatan:  { sub_perusahaan, divisi, kode_jabatan, nama_jabatan, presensi, denda }
  // - Karyawan: form lengkap sesuai kebutuhan halaman Data Karyawan
  // --------------------------------------------------------------
  function getSubCompanyName(id) {
    const subs = readList(LS.SUB, []);
    return subs.find((x) => x.id === id)?.name || '-';
  }

  function getDivisiName(id) {
    const rows = readList(LS.DIVISI, []);
    return rows.find((x) => x.id === id)?.name || '-';
  }

  function getDivisiCode(id) {
    const rows = readList(LS.DIVISI, []);
    return rows.find((x) => x.id === id)?.code || '-';
  }

  function getDivisiParentName(parentId) {
    if (!parentId) return '-';
    return getDivisiName(parentId);
  }

  function getJabatanName(id) {
    const rows = readList(LS.JABATAN, []);
    return rows.find((x) => x.id === id)?.name || '-';
  }

  function getStaffName(id) {
    const rows = readList(LS.STAFF, []);
    return rows.find((x) => x.id === id)?.name || '-';
  }

  // Helper: Staff di dalam Jabatan (rename dari "Staff" -> "Staff" di UI)
  function getJabatanStaffNames(jb) {
    if (!jb) return [];
    // prefer staff_names, fallback staff_ids (legacy)
    let names = ensureArr(jb?.staff_names || [])
      .map((x) => String(x || '').trim())
      .filter(Boolean);

    if (!names.length && Array.isArray(jb?.staff_ids) && jb.staff_ids.length) {
      names = jb.staff_ids
        .map((sid) => getStaffName(sid))
        .map((x) => String(x || '').trim())
        .filter((x) => x && x !== '-');
    }

    // unique case-insensitive
    const out = [];
    const seen = new Set();
    names.forEach((n) => {
      const k = n.toLowerCase();
      if (seen.has(k)) return;
      seen.add(k);
      out.push(n);
    });
    return out;
  }


  function filterDivisiBySubs(subIds) {
    const all = readList(LS.DIVISI, []);
    const s = new Set((Array.isArray(subIds) ? subIds : []).filter(Boolean));
    if (!s.size) return all;
    return all.filter((d) => s.has(d.sub_id));
  }

  function filterJabatan(subIds, divisiIds) {
    const all = readList(LS.JABATAN, []);
    const s = new Set((Array.isArray(subIds) ? subIds : []).filter(Boolean));
    const d = new Set((Array.isArray(divisiIds) ? divisiIds : []).filter(Boolean));
    return all.filter((j) => (s.size ? s.has(j.sub_id) : true) && (d.size ? d.has(j.divisi_id) : true));
  }

  function filterStaff(subIds, divisiIds, jabatanIds) {
    const all = readList(LS.STAFF, []);
    const s = new Set((Array.isArray(subIds) ? subIds : []).filter(Boolean));
    const d = new Set((Array.isArray(divisiIds) ? divisiIds : []).filter(Boolean));
    const j = new Set((Array.isArray(jabatanIds) ? jabatanIds : []).filter(Boolean));
    return all.filter((st) =>
      (s.size ? s.has(st.sub_id) : true) &&
      (d.size ? d.has(st.divisi_id) : true) &&
      (j.size ? j.has(st.jabatan_id) : true)
    );
  }

  function fireOrgChanged() {
    window.dispatchEvent(new Event('ceo:org:changed'));
  }

  // ---------------------------
  // Divisi CRUD page
  // ---------------------------
  function renderDivisi() {
    const table = $('#tblDivisi');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const rows = readList(LS.DIVISI, []);
    tbody.innerHTML = '';

    rows.forEach((dv, idx) => {
      const spName = getSubCompanyName(dv.sub_id);
      const parentName = getDivisiParentName(dv.parent_id);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${escapeHtml(spName)}</td>
        <td>${escapeHtml(dv.code || '-')}</td>
        <td>${escapeHtml(dv.name || '-')}</td>
        <td>${escapeHtml(parentName)}</td>
        <td class="tdActions">
          <div class="d-flex justify-content-center gap-2">
            <button class="btn btn-sm btn-icon btn-primary" type="button" data-dv-view="${escapeHtml(dv.id)}" title="Lihat" aria-label="Lihat"><i class="bx bx-show"></i></button>
            <button class="btn btn-sm btn-icon btn-outline-primary" type="button" data-dv-edit="${escapeHtml(dv.id)}" title="Edit" aria-label="Edit"><i class="bx bx-edit-alt"></i></button>
            <button class="btn btn-sm btn-icon btn-outline-danger" type="button" data-dv-del="${escapeHtml(dv.id)}" title="Hapus" aria-label="Hapus"><i class="bx bx-trash"></i></button>
          </div>
        </td>
      `.trim();
      tbody.appendChild(tr);
    });
  }

  function openDivisiModal(mode, data) {
    const id = 'ceoDivisiModal';
    const modalEl = ensureModal(
      id,
      `
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="ceoDvTitle">Divisi</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="vstack gap-3">
              <div>
                <label class="form-label">Sub Perusahaan</label>
                <select id="ceoDvSub" class="form-select"></select>
              </div>

              <div>
                <label class="form-label">Kode Divisi</label>
                <input id="ceoDvCode" class="form-control" type="text" placeholder="Contoh: DIV-001" />
              </div>

              <div>
                <label class="form-label">Divisi</label>
                <input id="ceoDvName" class="form-control" type="text" placeholder="Contoh: IT, HR, Social Media..." />
              </div>

              <div>
                <label class="form-label">Induk</label>
                <select id="ceoDvParent" class="form-select"></select>
                <div class="form-text">Opsional. Pilih divisi induk bila divisi ini berada di bawah divisi lain.</div>
              </div>

              <div class="alert alert-info mb-0">data disimpan di <b>localStorage</b>.</div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-primary" id="ceoDvSave">Simpan</button>
          </div>
        </div>
      </div>
      `.trim()
    );

    const isView = mode === 'view';
    setModalActionTitle($('#ceoDvTitle', modalEl), mode);

    const subs = readList(LS.SUB, []);
    const rows = readList(LS.DIVISI, []);
    const subSel = $('#ceoDvSub', modalEl);
    const codeEl = $('#ceoDvCode', modalEl);
    const parentSel = $('#ceoDvParent', modalEl);
    const nameEl = $('#ceoDvName', modalEl);

    const refreshParentOptions = () => {
      const subId = String(subSel.value || '').trim();
      const opts = rows.filter((dv) => dv.sub_id === subId && dv.id !== data?.id);
      parentSel.innerHTML = `
        <option value="">Tanpa Induk</option>
        ${opts.map((dv) => `<option value="${escapeHtml(dv.id)}">${escapeHtml(dv.code || '-')} - ${escapeHtml(dv.name || '-')}</option>`).join('')}
      `.trim();
    };

    subSel.innerHTML =
      '<option value="">Pilih Sub Perusahaan</option>' +
      (subs.map((sp) => `<option value="${escapeHtml(sp.id)}">${escapeHtml(sp.name)}</option>`).join('') ||
        '<option value="" disabled>(Belum ada sub perusahaan)</option>');

    subSel.addEventListener('change', refreshParentOptions);

    if (data) {
      subSel.value = data.sub_id || subSel.value;
      codeEl.value = data.code || '';
      nameEl.value = data.name || '';
      refreshParentOptions();
      parentSel.value = data.parent_id || '';
    } else {
      subSel.value = '';
      codeEl.value = '';
      refreshParentOptions();
      parentSel.value = '';
      nameEl.value = '';
    }

    setModalBodyReadOnly(modalEl, isView);
    $('#ceoDvSave', modalEl).classList.toggle('d-none', isView);

    $('#ceoDvSave', modalEl).onclick = () => {
      const sub_id = String(subSel.value || '').trim();
      const code = String(codeEl.value || '').trim();
      const parent_id = String(parentSel.value || '').trim();
      const name = String(nameEl.value || '').trim();

      if (!sub_id) return window.alert('Sub perusahaan wajib dipilih.');
      if (!code) return window.alert('Kode divisi wajib diisi.');
      if (!name) return window.alert('Nama divisi wajib diisi.');

      const rows = readList(LS.DIVISI, []);
      if (mode === 'edit') {
        const i = rows.findIndex((x) => x.id === data.id);
        if (i >= 0) rows[i] = { ...rows[i], sub_id, code, parent_id, name, status: rows[i].status || 'Aktif' };
      } else {
        rows.push({ id: uid('dv2'), sub_id, code, parent_id, name, status: 'Aktif' });
      }
      writeList(LS.DIVISI, rows);

      bootstrap.Modal.getOrCreateInstance(modalEl).hide();
      renderDivisi();
      fireOrgChanged();
    };

    showModal(id);
    const titleInput = modalEl.querySelector('.modal-body input, .modal-body select, .modal-body textarea');
    window.setTimeout(() => titleInput?.focus?.(), 120);
  }

  function initDivisiPage() {
    const table = $('#tblDivisi');
    const addBtn = $('#btnAddDivisi');
    if (!table || !addBtn) return;

    table.dataset.ceoCustomCrud = '1';
    addBtn.dataset.ceoCustomCrud = '1';

    renderDivisi();
    addBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      openDivisiModal('add', null);
    });

    table.addEventListener('click', (e) => {
      const view = e.target?.closest?.('button[data-dv-view]');
      const del = e.target?.closest?.('button[data-dv-del]');
      const edit = e.target?.closest?.('button[data-dv-edit]');

      if (view) {
        const id = view.getAttribute('data-dv-view');
        const rows = readList(LS.DIVISI, []);
        const cur = rows.find((x) => x.id === id);
        if (!cur) return;
        openDivisiModal('view', cur);
        return;
      }

      if (del) {
        const id = del.getAttribute('data-dv-del');
        if (!id) return;
        confirmDelete('Delete Divisi ini?', () => {
          const rows = readList(LS.DIVISI, []).filter((x) => x.id !== id);
          writeList(LS.DIVISI, rows);
          renderDivisi();
          fireOrgChanged();
        });
        return;
      }

      if (edit) {
        const id = edit.getAttribute('data-dv-edit');
        const rows = readList(LS.DIVISI, []);
        const cur = rows.find((x) => x.id === id);
        if (!cur) return;
        openDivisiModal('edit', cur);
      }
    });
  }

  // ---------------------------
  // Jabatan CRUD page
  // ---------------------------

  const JABATAN_PRESENCE_OPTS = ['Ya', 'Tidak'];
  const YES_NO_OPTS = ['Ya', 'Tidak'];
  const ACTIVE_INACTIVE_OPTS = ['Aktif', 'Tidak Aktif'];
  function normalizePresenceScope(value, fallback = 'Tidak') {
    const raw = String(value || '').trim().toLowerCase();
    if (!raw) return fallback;
    if (raw === 'ya' || raw === 'yes' || raw === 'true' || raw === '1' || raw.includes('semua')) return 'Ya';
    if (raw === 'tidak' || raw === 'no' || raw === 'false' || raw === '0' || raw.includes('kantor') || raw.includes('lokasi')) return 'Tidak';
    return fallback;
  }

  function makeDefaultJabatanGradeRow(name = 'A') {
    return {
      id: uid('jbg'),
      name: String(name || 'A').trim() || 'A',
      overtime_per_hour: '0',
      fine_per_hour: '0',
      fine_per_minute: '0',
    };
  }

  function getNextJabatanGradeName(rows) {
    const used = new Set((Array.isArray(rows) ? rows : []).map((row) => String(row?.name || '').trim().toUpperCase()).filter(Boolean));
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const nextAlpha = alphabet.find((letter) => !used.has(letter));
    if (nextAlpha) return nextAlpha;
    return `Grade ${(Array.isArray(rows) ? rows.length : 0) + 1}`;
  }

  function normalizeJabatanGradeRows(input) {
    const rows = Array.isArray(input) ? input : [];
    const out = rows.map((row, idx) => ({
      id: String(row?.id || uid('jbg')).trim(),
      name: String(row?.name || getNextJabatanGradeName(rows.slice(0, idx)) || 'A').trim() || 'A',
      overtime_per_hour: String(row?.overtime_per_hour ?? row?.overtime ?? row?.uang_lembur_per_jam ?? '0').trim() || '0',
      fine_per_hour: String(row?.fine_per_hour ?? row?.tier_fine_per_hour ?? row?.denda_per_jam ?? '0').trim() || '0',
      fine_per_minute: String(row?.fine_per_minute ?? row?.tier_fine_per_minute ?? row?.denda_per_menit ?? '0').trim() || '0',
    }));

    if (!out.length) out.push(makeDefaultJabatanGradeRow('A'));
    return out;
  }

  function normalizeActiveInactive(value, fallback = 'Tidak Aktif') {
    const raw = String(value || '').trim().toLowerCase();
    if (!raw) return fallback;
    if (raw === 'ya' || raw === 'aktif' || raw === 'true' || raw === '1') return 'Aktif';
    if (raw === 'tidak' || raw === 'tidak aktif' || raw === 'false' || raw === '0') return 'Tidak Aktif';
    return fallback;
  }

  function renderJabatan() {
    const table = $('#tblJabatan');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const rows = readList(LS.JABATAN, []);
    tbody.innerHTML = '';

    rows.forEach((jb, idx) => {
      const spName = getSubCompanyName(jb.sub_id);
      const dvName = getDivisiName(jb.divisi_id);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${escapeHtml(spName)}</td>
        <td>${escapeHtml(dvName)}</td>
        <td>${escapeHtml(jb.code || '-')}</td>
        <td>${escapeHtml(jb.name || '-')}</td>
        <td>${escapeHtml(jb.presence_scope || '-')}</td>
        <td class="tdActions">
          <div class="d-flex justify-content-center gap-2">
            <button class="btn btn-sm btn-icon btn-primary" type="button" data-jb-view="${escapeHtml(jb.id)}" title="Lihat" aria-label="Lihat"><i class="bx bx-show"></i></button>
            <button class="btn btn-sm btn-icon btn-outline-primary" type="button" data-jb-edit="${escapeHtml(jb.id)}" title="Edit" aria-label="Edit"><i class="bx bx-edit-alt"></i></button>
            <button class="btn btn-sm btn-icon btn-outline-danger" type="button" data-jb-del="${escapeHtml(jb.id)}" title="Hapus" aria-label="Hapus"><i class="bx bx-trash"></i></button>
          </div>
        </td>
      `.trim();
      tbody.appendChild(tr);
    });
  }

  function openJabatanModal(mode, data) {
    const id = 'ceoJabatanModal';

    const modalEl = ensureModal(
      id,
      `
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="ceoJbTitle">Jabatan</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Sub Perusahaan</label>
                <select id="ceoJbSub" class="form-select"></select>
              </div>

              <div class="col-md-6">
                <label class="form-label">Divisi</label>
                <select id="ceoJbDiv" class="form-select"></select>
              </div>

              <div class="col-md-6">
                <label class="form-label">Kode Jabatan</label>
                <input id="ceoJbCode" class="form-control" type="text" placeholder="Contoh: JBT-001" />
              </div>

              <div class="col-md-6">
                <label class="form-label">Nama Jabatan</label>
                <input id="ceoJbName" class="form-control" type="text" placeholder="Contoh: Manajer Operasional" />
              </div>

              <div class="col-md-6">
                <label class="form-label">Bebas Presensi Dimana Saja</label>
                <select id="ceoJbPresence" class="form-select"></select>
              </div>

              <div class="col-md-6">
                <label class="form-label">Denda Pulang Cepat</label>
                <select id="ceoJbFineEarly" class="form-select"></select>
              </div>

              <div class="col-12">
                <label class="form-label">Implementasi Denda Pada Tiap Grade</label>
                <select id="ceoJbFineGrade" class="form-select"></select>
              </div>

              <div class="col-md-6" id="ceoJbFineHourWrap">
                <label class="form-label">Nominal denda (per jam)</label>
                <input id="ceoJbFineHour" class="form-control" type="number" min="0" step="1" placeholder="0" />
              </div>

              <div class="col-md-6" id="ceoJbFineMinuteWrap">
                <label class="form-label">Nominal denda (per menit)</label>
                <input id="ceoJbFineMinute" class="form-control" type="number" min="0" step="1" placeholder="0" />
              </div>

              <div class="col-12" id="ceoJbGradeSection">
                <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
                  <div class="fw-semibold">GRADE</div>
                  <button type="button" class="btn btn-info btn-sm rounded-pill" id="ceoJbAddGrade"><i class="bx bx-plus"></i> Tambah</button>
                </div>
                <div class="table-responsive mt-3">
                  <table class="table table-bordered align-middle mb-0" id="ceoJbGradeTable">
                    <thead></thead>
                    <tbody></tbody>
                  </table>
                </div>
              </div>

              <div class="col-12">
                <div class="alert alert-info mb-0">data disimpan di <b>localStorage</b>.</div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-primary" id="ceoJbSave">Simpan</button>
          </div>
        </div>
      </div>
      `.trim()
    );

    const isView = mode === 'view';
    setModalActionTitle($('#ceoJbTitle', modalEl), mode);

    const subs = readList(LS.SUB, []);
    const rows = readList(LS.JABATAN, []);
    const subSel = $('#ceoJbSub', modalEl);
    const divSel = $('#ceoJbDiv', modalEl);
    const codeEl = $('#ceoJbCode', modalEl);
    const nameEl = $('#ceoJbName', modalEl);
    const presenceEl = $('#ceoJbPresence', modalEl);
    const fineEarlyEl = $('#ceoJbFineEarly', modalEl);
    const fineGradeEl = $('#ceoJbFineGrade', modalEl);
    const fineHourEl = $('#ceoJbFineHour', modalEl);
    const fineMinuteEl = $('#ceoJbFineMinute', modalEl);
    const fineHourWrapEl = $('#ceoJbFineHourWrap', modalEl);
    const fineMinuteWrapEl = $('#ceoJbFineMinuteWrap', modalEl);
    const gradeSectionEl = $('#ceoJbGradeSection', modalEl);
    const gradeTableEl = $('#ceoJbGradeTable', modalEl);
    const addGradeBtn = $('#ceoJbAddGrade', modalEl);
    let gradeRows = normalizeJabatanGradeRows(data?.grade_rows || data?.grades);

    const refreshDivOpts = () => {
      const subId = String(subSel.value || '').trim();
      const divs = filterDivisiBySubs([subId]);
      divSel.innerHTML =
        '<option value="">Pilih Divisi</option>' +
        (divs.map((d) => `<option value="${escapeHtml(d.id)}">${escapeHtml(d.code || '-')} - ${escapeHtml(d.name)}</option>`).join('') ||
          '<option value="" disabled>(Belum ada divisi)</option>');
    };

    subSel.innerHTML =
      '<option value="">Pilih Sub Perusahaan</option>' +
      (subs.map((sp) => `<option value="${escapeHtml(sp.id)}">${escapeHtml(sp.name)}</option>`).join('') ||
        '<option value="" disabled>(Belum ada sub perusahaan)</option>');
    presenceEl.innerHTML = JABATAN_PRESENCE_OPTS.map((x) => `<option value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join('');
    fineEarlyEl.innerHTML = YES_NO_STATUS_OPTS.map((x) => `<option value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join('');
    fineGradeEl.innerHTML = YES_NO_STATUS_OPTS.map((x) => `<option value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join('');

    const renderGradeTable = () => {
      if (!gradeTableEl) return;
      const isTierFineActive = String(fineGradeEl.value || '').trim() === 'Ya';
      const thead = gradeTableEl.querySelector('thead');
      const tbody = gradeTableEl.querySelector('tbody');
      if (!thead || !tbody) return;

      thead.innerHTML = isTierFineActive
        ? `
          <tr>
            <th>Nama Grade</th>
            <th>Uang Lembur Per Jam</th>
            <th>Denda Pulang Cepat Bertingkat<br><small class="text-muted">*Nominal denda (per jam)</small></th>
            <th>Denda Pulang Cepat Bertingkat<br><small class="text-muted">*Nominal denda (per menit)</small></th>
            <th style="width:84px">Aksi</th>
          </tr>
        `
        : `
          <tr>
            <th>Nama Grade</th>
            <th>Uang Lembur Per Jam</th>
            <th style="width:84px">Aksi</th>
          </tr>
        `;

      tbody.innerHTML = gradeRows.map((row, idx) => {
        const commonCells = `
          <td><input class="form-control" type="text" data-grade-idx="${idx}" data-grade-field="name" value="${escapeHtml(row?.name || '')}" placeholder="A" /></td>
          <td><input class="form-control" type="number" min="0" step="1" data-grade-idx="${idx}" data-grade-field="overtime_per_hour" value="${escapeHtml(String(row?.overtime_per_hour ?? '0'))}" placeholder="0" /></td>
        `;
        const fineCells = isTierFineActive
          ? `
            <td><input class="form-control" type="number" min="0" step="1" data-grade-idx="${idx}" data-grade-field="fine_per_hour" value="${escapeHtml(String(row?.fine_per_hour ?? '0'))}" placeholder="0" /></td>
            <td><input class="form-control" type="number" min="0" step="1" data-grade-idx="${idx}" data-grade-field="fine_per_minute" value="${escapeHtml(String(row?.fine_per_minute ?? '0'))}" placeholder="0" /></td>
          `
          : '';
        return `
          <tr>
            ${commonCells}
            ${fineCells}
            <td class="text-center">
              <button type="button" class="btn btn-danger btn-sm btn-icon rounded-pill" data-grade-del="${idx}" aria-label="Hapus grade"><i class="bx bx-trash"></i></button>
            </td>
          </tr>
        `;
      }).join('');
    };

    const syncFineVisibility = () => {
      const isTierFineActive = String(fineGradeEl.value || '').trim() === 'Ya';
      if (fineHourWrapEl) fineHourWrapEl.style.display = isTierFineActive ? 'none' : '';
      if (fineMinuteWrapEl) fineMinuteWrapEl.style.display = isTierFineActive ? 'none' : '';
      if (gradeSectionEl) gradeSectionEl.style.display = '';
      renderGradeTable();
    };

    subSel.addEventListener('change', refreshDivOpts);
    fineGradeEl.addEventListener('change', syncFineVisibility);

    addGradeBtn?.addEventListener('click', () => {
      gradeRows.push(makeDefaultJabatanGradeRow(getNextJabatanGradeName(gradeRows)));
      renderGradeTable();
    });

    gradeTableEl?.addEventListener('input', (e) => {
      const input = e.target?.closest?.('[data-grade-idx][data-grade-field]');
      if (!input) return;
      const idx = Number(input.getAttribute('data-grade-idx'));
      const field = String(input.getAttribute('data-grade-field') || '').trim();
      if (!Number.isInteger(idx) || !gradeRows[idx] || !field) return;
      gradeRows[idx][field] = String(input.value || '');
    });

    gradeTableEl?.addEventListener('click', (e) => {
      const btn = e.target?.closest?.('[data-grade-del]');
      if (!btn) return;
      const idx = Number(btn.getAttribute('data-grade-del'));
      if (!Number.isInteger(idx) || !gradeRows[idx]) return;
      gradeRows.splice(idx, 1);
      if (!gradeRows.length) gradeRows = normalizeJabatanGradeRows([]);
      renderGradeTable();
    });

    if (data) {
      subSel.value = data.sub_id || subSel.value;
      refreshDivOpts();
      divSel.value = data.divisi_id || divSel.value;
      codeEl.value = data.code || '';
      nameEl.value = data.name || '';
      presenceEl.value = normalizePresenceScope(data.presence_scope, 'Tidak');
      fineEarlyEl.value = /aktif|ya/i.test(String(data.early_leave_fine || '')) ? 'Ya' : 'Tidak';
      fineGradeEl.value = /aktif|ya/i.test(String(data.grade_fine_enabled || '')) ? 'Ya' : 'Tidak';
      fineHourEl.value = String(data.fine_per_hour ?? '0');
      fineMinuteEl.value = String(data.fine_per_minute ?? '0');
      gradeRows = normalizeJabatanGradeRows(data.grade_rows || data.grades);
      syncFineVisibility();
    } else {
      subSel.value = '';
      codeEl.value = '';
      refreshDivOpts();
      divSel.value = '';
      presenceEl.value = 'Tidak';
      fineEarlyEl.value = 'Tidak';
      fineGradeEl.value = 'Tidak';
      fineHourEl.value = '0';
      fineMinuteEl.value = '0';
      gradeRows = normalizeJabatanGradeRows([]);
      syncFineVisibility();
    }

    setModalBodyReadOnly(modalEl, isView);
    $('#ceoJbSave', modalEl).classList.toggle('d-none', isView);
    addGradeBtn?.classList.toggle('d-none', isView);
    $$('.ceo-kr-placement-remove, [data-grade-del]', modalEl).forEach((btn) => btn.classList.toggle('d-none', isView));

    $('#ceoJbSave', modalEl).onclick = () => {
      const sub_id = String(subSel.value || '').trim();
      const divisi_id = String(divSel.value || '').trim();
      const code = String(codeEl.value || '').trim();
      const name = String(nameEl.value || '').trim();
      const presence_scope = normalizePresenceScope(presenceEl.value, 'Tidak');
      const early_leave_fine = String(fineEarlyEl.value || 'Tidak').trim();
      const grade_fine_enabled = String(fineGradeEl.value || 'Tidak').trim();
      const isTierFineActive = grade_fine_enabled === 'Ya';
      const fine_per_hour = isTierFineActive ? '0' : (String(fineHourEl.value || '0').trim() || '0');
      const fine_per_minute = isTierFineActive ? '0' : (String(fineMinuteEl.value || '0').trim() || '0');
      const grade_rows = normalizeJabatanGradeRows(gradeRows).map((row) => ({
        ...row,
        name: String(row?.name || '').trim() || getNextJabatanGradeName([]),
        overtime_per_hour: String(row?.overtime_per_hour ?? '0').trim() || '0',
        fine_per_hour: isTierFineActive ? (String(row?.fine_per_hour ?? '0').trim() || '0') : '0',
        fine_per_minute: isTierFineActive ? (String(row?.fine_per_minute ?? '0').trim() || '0') : '0',
      }));

      if (!sub_id) return window.alert('Sub perusahaan wajib dipilih.');
      if (!divisi_id) return window.alert('Divisi wajib dipilih.');
      if (!code) return window.alert('Kode jabatan wajib diisi.');
      if (!name) return window.alert('Nama jabatan wajib diisi.');

      const rows = readList(LS.JABATAN, []);
      const payload = {
        sub_id,
        divisi_id,
        code,
        name,
        presence_scope,
        early_leave_fine,
        grade_fine_enabled,
        fine_per_hour,
        fine_per_minute,
        grade_rows,
        status: 'Aktif',
      };

      if (mode === 'edit') {
        const i = rows.findIndex((x) => x.id === data.id);
        if (i >= 0) rows[i] = { ...rows[i], ...payload };
      } else {
        rows.push({ id: uid('jb'), ...payload });
      }

      writeList(LS.JABATAN, rows);
      bootstrap.Modal.getOrCreateInstance(modalEl).hide();
      renderJabatan();
      fireOrgChanged();
    };

    showModal(id);
    const titleInput = modalEl.querySelector('.modal-body input, .modal-body select, .modal-body textarea');
    window.setTimeout(() => titleInput?.focus?.(), 120);
  }

  function initJabatanPage() {
    const table = $('#tblJabatan');
    const addBtn = $('#btnAddJabatan');
    if (!table || !addBtn) return;

    table.dataset.ceoCustomCrud = '1';
    addBtn.dataset.ceoCustomCrud = '1';

    renderJabatan();
    addBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      openJabatanModal('add', null);
    });

    table.addEventListener('click', (e) => {
      const view = e.target?.closest?.('button[data-jb-view]');
      const del = e.target?.closest?.('button[data-jb-del]');
      const edit = e.target?.closest?.('button[data-jb-edit]');

      if (view) {
        const id = view.getAttribute('data-jb-view');
        const rows = readList(LS.JABATAN, []);
        const cur = rows.find((x) => x.id === id);
        if (!cur) return;
        openJabatanModal('view', cur);
        return;
      }

      if (del) {
        const id = del.getAttribute('data-jb-del');
        if (!id) return;
        confirmDelete('Delete Jabatan ini?', () => {
          const rows = readList(LS.JABATAN, []).filter((x) => x.id !== id);
          writeList(LS.JABATAN, rows);
          renderJabatan();
          fireOrgChanged();
        });
        return;
      }

      if (edit) {
        const id = edit.getAttribute('data-jb-edit');
        const rows = readList(LS.JABATAN, []);
        const cur = rows.find((x) => x.id === id);
        if (!cur) return;
        openJabatanModal('edit', cur);
      }
    });
  }


  // --------------------------------------------------------------
  // Struktur Perusahaan page (upload gambar + preview)
  // --------------------------------------------------------------
  const BM_STRUCTURE_IMAGE_KEY = 'bmStrukturPerusahaanImageV1';

  function openStructureImageModal(src) {
    const raw = String(src || '').trim();
    if (!raw) return;
    const modalId = 'bmStructureImageModal';
    const modalEl = ensureModal(modalId, `
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Lihat Struktur Perusahaan</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body text-center bg-light">
            <img id="bmStructureImageModalPreview" src="" alt="Struktur Perusahaan" class="img-fluid rounded-4 border bg-white" style="max-height:78vh;object-fit:contain;" />
          </div>
        </div>
      </div>
    `.trim());
    const img = $('#bmStructureImageModalPreview', modalEl);
    if (img) img.src = raw;
    modalEl.style.zIndex = '3005';
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
    window.setTimeout(() => {
      const backdrops = Array.from(document.querySelectorAll('.modal-backdrop'));
      const topBackdrop = backdrops[backdrops.length - 1];
      if (topBackdrop) topBackdrop.style.zIndex = '3000';
    }, 0);
  }

  function initStrukturPerusahaanPage() {
    const input = $('#bmStructureUpload');
    const preview = $('#bmStructurePreview');
    const empty = $('#bmStructureEmpty');
    const fileName = $('#bmStructureFileName');
    const viewBtn = $('#bmStructureViewBtn');
    const resetBtn = $('#bmStructureResetBtn');
    const dropArea = $('#bmStructureDropArea');
    let runtimeImageSrc = '';

    if (!input || !preview) return;

    const getCurrentImage = () => String(runtimeImageSrc || localStorage.getItem(BM_STRUCTURE_IMAGE_KEY) || '').trim();

    const render = () => {
      const saved = getCurrentImage();
      const hasImage = !!saved;
      preview.src = saved || '';
      preview.classList.toggle('d-none', !hasImage);
      preview.style.display = hasImage ? 'block' : 'none';
      empty?.classList.toggle('d-none', hasImage);
      viewBtn?.classList.toggle('d-none', !hasImage);
      resetBtn?.classList.toggle('d-none', !hasImage);
      if (fileName) fileName.textContent = hasImage ? 'Gambar struktur perusahaan tersimpan.' : 'Belum ada gambar yang diupload.';
    };

    const saveFile = (file) => {
      if (!file) return;
      if (!String(file.type || '').startsWith('image/')) {
        window.alert('File harus berupa gambar. Gunakan PNG, JPG, JPEG, WEBP, atau SVG.');
        return;
      }

      // Preview langsung tampil setelah user memilih file. Ini tetap aman walaupun file terlalu besar untuk localStorage.
      if (runtimeImageSrc && runtimeImageSrc.startsWith('blob:')) {
        try { URL.revokeObjectURL(runtimeImageSrc); } catch (e) { }
      }
      runtimeImageSrc = URL.createObjectURL(file);
      if (fileName) fileName.textContent = file.name || 'Gambar struktur perusahaan tersimpan.';
      render();

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || '');
        if (!dataUrl) return;
        try {
          localStorage.setItem(BM_STRUCTURE_IMAGE_KEY, dataUrl);
          runtimeImageSrc = dataUrl;
          render();
          showCeoToast('Gambar Struktur Perusahaan berhasil diupload.');
        } catch (e) {
          showCeoToast('Gambar berhasil ditampilkan. Jika file terlalu besar, gambar mungkin tidak tersimpan setelah browser ditutup.', 'warning');
        }
      };
      reader.readAsDataURL(file);
    };

    input.addEventListener('change', () => saveFile(input.files?.[0]));

    dropArea?.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropArea.classList.add('is-dragover');
    });

    dropArea?.addEventListener('dragleave', () => {
      dropArea.classList.remove('is-dragover');
    });

    dropArea?.addEventListener('drop', (e) => {
      e.preventDefault();
      dropArea.classList.remove('is-dragover');
      saveFile(e.dataTransfer?.files?.[0]);
    });

    viewBtn?.addEventListener('click', () => openStructureImageModal(getCurrentImage()));
    preview.addEventListener('click', () => openStructureImageModal(getCurrentImage()));

    resetBtn?.addEventListener('click', () => {
      confirmDelete('Hapus gambar Struktur Perusahaan?', () => {
        if (runtimeImageSrc && runtimeImageSrc.startsWith('blob:')) {
          try { URL.revokeObjectURL(runtimeImageSrc); } catch (e) { }
        }
        runtimeImageSrc = '';
        localStorage.removeItem(BM_STRUCTURE_IMAGE_KEY);
        input.value = '';
        render();
        showCeoToast('Gambar Struktur Perusahaan berhasil dihapus.');
      });
    });

    render();
  }

  // --------------------------------------------------------------
  // Karyawan page (CRUD localStorage) - form lengkap
  // --------------------------------------------------------------
  const WORK_STATUS_OPTS = [
    'Freelance',
    'Interns',
    'Training',
    'PKWT 1',
    'PKWT 2',
    'PKWT 3',
    'Karyawan Kontrak / Tetap',
  ];
  const EMPLOYEE_STATUS_OPTS = ['Tetap', 'Kontrak', 'Magang', 'Freelance'];
  const ACTIVE_STATUS_OPTS = ['Aktif', 'Nonaktif'];
  const EDUCATION_OPTS = ['Tidak Sekolah', 'SD', 'SMP', 'SMA/SMK', 'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3'];
  const GENDER_OPTS = ['Laki - Laki', 'Perempuan'];
  const GRADE_JABATAN_OPTS = ['A', 'B', 'C', 'D', 'E'];
  const WORK_HOUR_TYPE_OPTS = []; // Opsi 'Reguler' dihapus sesuai revisi

  function getShiftScenarioOptions() {
    const rows = readList(LS.SKENARIO_JAM_KERJA, []);
    const out = [];
    const seen = new Set();
    (Array.isArray(rows) ? rows : []).forEach((row) => {
      const name = String(row?.nama_shift || '').trim();
      const key = name.toLowerCase();
      if (!name || seen.has(key)) return;
      seen.add(key);
      out.push(name);
    });
    return out;
  }
  function normalizeWorkHourType(value, fallback = '') {
    const raw = String(value || '').trim();
    const opts = [...WORK_HOUR_TYPE_OPTS, ...getShiftScenarioOptions()].filter(Boolean);
    if (!raw) return opts[0] || fallback || '';
    const found = opts.find((x) => x.toLowerCase() === raw.toLowerCase());
    if (found) return found;
    if (raw.toLowerCase().includes('reg')) return opts[0] || fallback || '';
    return raw || opts[0] || fallback || '';
  }
  const PAYROLL_PERIOD_OPTS = ['Bulanan', 'Mingguan'];
  const PAYROLL_TYPE_OPTS = ['Transfer Bank', 'Tunai'];
  const YES_NO_STATUS_OPTS = ['Ya', 'Tidak'];
  const ACCOUNT_ACTIVATION_OPTS = ['Aktif', 'Belum Aktif'];

  function normalizeWorkStatus(value) {
    const raw = String(value || '').trim().toLowerCase();
    if (!raw) return 'PKWT 1';
    if (raw === 'pkwt') return 'PKWT 1';
    if (raw === 'pkwtt') return 'Karyawan Kontrak / Tetap';
    if (raw.includes('magang') || raw.includes('intern')) return 'Interns';
    if (raw.includes('training')) return 'Training';
    if (raw.includes('freelance')) return 'Freelance';
    if (raw.includes('pkwt 2')) return 'PKWT 2';
    if (raw.includes('pkwt 3')) return 'PKWT 3';
    if (raw.includes('tetap') || raw.includes('kontrak')) return 'Karyawan Kontrak / Tetap';
    return WORK_STATUS_OPTS.find((x) => x.toLowerCase() === raw) || 'PKWT 1';
  }

  function getWorkStatusBadgeClass(value) {
    const status = normalizeWorkStatus(value).toLowerCase();
    if (status.includes('freelance')) return 'secondary';
    if (status.includes('intern')) return 'warning';
    if (status.includes('training')) return 'info';
    if (status.includes('tetap')) return 'success';
    if (status.includes('pkwt 3')) return 'danger';
    if (status.includes('pkwt 2')) return 'primary';
    return 'primary';
  }

  function ensureArr(v) {
    if (Array.isArray(v)) return v.filter(Boolean);
    if (v === null || v === undefined || v === '') return [];
    return [v].filter(Boolean);
  }

  function empSubIds(kr) {
    return ensureArr(kr?.sub_ids ?? kr?.sub_id);
  }
  function empDivisiIds(kr) {
    return ensureArr(kr?.divisi_ids ?? kr?.divisi_id);
  }
  function empJabatanIds(kr) {
    return ensureArr(kr?.jabatan_ids ?? kr?.jabatan_id);
  }

  function getSelectedValues(el) {
    if (!el) return [];
    return Array.from(el.selectedOptions || [])
      .map((opt) => String(opt.value || '').trim())
      .filter(Boolean);
  }

  function setSelectedValues(el, values) {
    if (!el) return;
    const picked = new Set(ensureArr(values).map((x) => String(x || '').trim()).filter(Boolean));
    Array.from(el.options || []).forEach((opt) => {
      opt.selected = picked.has(String(opt.value || '').trim());
    });
  }

  function getSubCompanyNames(ids) {
    return ensureArr(ids).map((id) => getSubCompanyName(id)).filter(Boolean);
  }

  function getDivisiNames(ids) {
    return ensureArr(ids).map((id) => getDivisiName(id)).filter(Boolean);
  }

  function getJabatanNames(ids) {
    return ensureArr(ids).map((id) => getJabatanName(id)).filter(Boolean);
  }

  function getEmployeeSingleSubId(kr) {
    return String(kr?.sub_id || empSubIds(kr)[0] || '').trim();
  }
  function getEmployeeSingleDivisiId(kr) {
    return String(kr?.divisi_id || empDivisiIds(kr)[0] || '').trim();
  }
  function getEmployeeSingleJabatanId(kr) {
    return String(kr?.jabatan_id || empJabatanIds(kr)[0] || '').trim();
  }

  function renderEmployees() {
    const table = $('#tblKaryawan');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const rows = readList(LS.KAR, []);
    tbody.innerHTML = '';

    rows.forEach((kr, idx) => {
      const subName = getSubCompanyNames(empSubIds(kr)).join(', ') || getSubCompanyName(getEmployeeSingleSubId(kr));
      const divName = getDivisiNames(empDivisiIds(kr)).join(', ') || getDivisiName(getEmployeeSingleDivisiId(kr));
      const jbName = getJabatanNames(empJabatanIds(kr)).join(', ') || getJabatanName(getEmployeeSingleJabatanId(kr));

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${escapeHtml(kr.employee_no || '-')}</td>
        <td>${escapeHtml(kr.name || '-')}</td>
        <td>${escapeHtml(subName)}</td>
        <td>${escapeHtml(divName)}</td>
        <td>${escapeHtml(jbName)}</td>
        <td><span class="badge bg-label-${String(kr.active_status || '').toLowerCase() === 'aktif' ? 'success' : 'secondary'}">${escapeHtml(kr.active_status || '-')}</span></td>
        <td class="tdActions">
          <div class="d-flex justify-content-center gap-2">
            <button class="btn btn-sm btn-icon btn-primary" type="button" data-kr-view="${escapeHtml(kr.id)}" title="Lihat" aria-label="Lihat"><i class="bx bx-show"></i></button>
            <button class="btn btn-sm btn-icon btn-outline-primary" type="button" data-kr-edit="${escapeHtml(kr.id)}" title="Edit" aria-label="Edit"><i class="bx bx-edit-alt"></i></button>
            <button class="btn btn-sm btn-icon btn-outline-danger" type="button" data-kr-del="${escapeHtml(kr.id)}" title="Hapus" aria-label="Hapus"><i class="bx bx-trash"></i></button>
          </div>
        </td>
      `.trim();
      tbody.appendChild(tr);
    });
  }

  function fillSelectOptions(el, opts, placeholder = '') {
    if (!el) return;
    el.innerHTML = `${placeholder ? `<option value="">${escapeHtml(placeholder)}</option>` : ''}${opts.map((x) => `<option value="${escapeHtml(x.value)}">${escapeHtml(x.label)}</option>`).join('')}`;
  }

  function openKaryawanModal(mode, data) {
    const id = 'ceoKaryawanModal';
    const modalEl = ensureModal(
      id,
      `
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="ceoKrTitle">Karyawan</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-4"><label class="form-label">ID Karyawan</label><input id="ceoKrEmployeeNo" class="form-control" type="text" placeholder="Otomatis jika dikosongkan" /></div>
              <div class="col-md-4"><label class="form-label">Nama</label><input id="ceoKrName" class="form-control" type="text" placeholder="Nama lengkap" /></div>
              <div class="col-md-4"><label class="form-label">Titel Awal</label><input id="ceoKrTitlePrefix" class="form-control" type="text" placeholder="Dr / H / Ir ..." /></div>

              <div class="col-md-4"><label class="form-label">Titel Akhir</label><input id="ceoKrTitleSuffix" class="form-control" type="text" placeholder="S.Kom / S.E / M.M ..." /></div>
              <div class="col-md-4"><label class="form-label">NIK</label><input id="ceoKrNik" class="form-control" type="text" placeholder="NIK" /></div>
              <div class="col-md-4"><label class="form-label">NPWP</label><input id="ceoKrNpwp" class="form-control" type="text" placeholder="NPWP" /></div>

              <div class="col-md-6"><label class="form-label">Email</label><input id="ceoKrEmail" class="form-control" type="email" placeholder="email@domain.com" /></div>
              <div class="col-md-6"><label class="form-label">Alamat</label><input id="ceoKrAddr" class="form-control" type="text" placeholder="Alamat" /></div>

              <div class="col-md-4"><label class="form-label">Tanggal Lahir</label><input id="ceoKrBirth" class="form-control" type="date" /></div>
              <div class="col-md-4"><label class="form-label">No. Telp</label><input id="ceoKrPhone" class="form-control" type="text" placeholder="08xxxxxxxxxx" /></div>
              <div class="col-md-4"><label class="form-label">Jenis Kelamin</label><select id="ceoKrGender" class="form-select"></select></div>

              <div class="col-md-6"><label class="form-label">Pendidikan Terakhir</label><select id="ceoKrEdu" class="form-select"></select></div>
              <div class="col-md-6"><label class="form-label">Status Keaktifan</label><select id="ceoKrActiveStatus" class="form-select"></select></div>

              <div class="col-12">
                <div class="border rounded-2 p-3">
                  <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                    <div>
                      <label class="form-label mb-0">Sub Perusahaan / Divisi / Jabatan</label>
                      <div class="form-text">Bisa menambahkan lebih dari 1 penempatan, dengan tampilan dropdown seperti Tambah Jabatan.</div>
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-primary" id="ceoKrAddPlacement"><i class="bx bx-plus"></i> Tambah Penempatan</button>
                  </div>
                  <div id="ceoKrPlacementList" class="vstack gap-2"></div>
                </div>
              </div>

                            <div class="col-md-4"><label class="form-label">Nama Ibu</label><input id="ceoKrFather" class="form-control" type="text" placeholder="Nama ibu" /></div>

              <div class="col-md-4"><label class="form-label">Anak ke</label><input id="ceoKrChildNo" class="form-control" type="text" placeholder="1" /></div>
              <div class="col-md-4"><label class="form-label">Dari</label><input id="ceoKrChildFrom" class="form-control" type="text" placeholder="3" /></div>
              <div class="col-md-4"><label class="form-label">Tanggal masuk</label><input id="ceoKrJoin" class="form-control" type="date" /></div>

              <div class="col-md-4"><label class="form-label">Atasan</label><input id="ceoKrSupervisor" class="form-control" type="text" placeholder="Nama atasan" /></div>
              <div class="col-md-4"><label class="form-label">Nama Bank</label><input id="ceoKrBankCode" class="form-control" type="text" placeholder="BCA / BRI / BNI" /></div>

              <div class="col-md-4"><label class="form-label">Bank Rekening</label><input id="ceoKrBankAccount" class="form-control" type="text" placeholder="Nomor rekening" /></div>
              <div class="col-md-4"><label class="form-label">Nama Akun Rekening</label><input id="ceoKrBankAccountName" class="form-control" type="text" placeholder="Nama pemilik rekening" /></div>
              <div class="col-md-4"><label class="form-label">Foto Karyawan</label><input id="ceoKrPhotoName" class="form-control" type="file" accept="image/*,.pdf" /><div id="ceoKrPhotoView" class="bm-file-preview mt-2 d-none"></div></div>

              <div class="col-md-4"><label class="form-label">Kartu Keluarga</label><input id="ceoKrFileKk" class="form-control" type="file" accept=".pdf,image/*" /><div id="ceoKrFileKkView" class="bm-file-preview mt-2 d-none"></div></div>
              <div class="col-md-4"><label class="form-label">KTP</label><input id="ceoKrFileIdentity" class="form-control" type="file" accept=".pdf,image/*" /><div id="ceoKrFileIdentityView" class="bm-file-preview mt-2 d-none"></div></div>
              <div class="col-md-4"><label class="form-label">Tipe Jam Kerja</label><select id="ceoKrWorkHourType" class="form-select"></select></div>
              <div class="col-md-4"><label class="form-label">Aktifkan Status Area Presensi</label><select id="ceoKrPresenceAreaActive" class="form-select"></select></div>

              <div class="col-md-4"><label class="form-label">Aktivasi Akun</label><select id="ceoKrAccountActivation" class="form-select"></select></div>
              <div class="col-md-4"><label class="form-label">Password</label><input id="ceoKrPass" class="form-control" type="text" placeholder="Password" /></div>

              <div class="col-12"><label class="form-label">Catatan</label><textarea id="ceoKrNotes" class="form-control" rows="3" placeholder="Catatan tambahan"></textarea></div>

              <div class="col-12">
                <div class="alert alert-info mb-0">data disimpan di <b>localStorage</b>.</div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-primary" id="ceoKrSave">Simpan</button>
          </div>
        </div>
      </div>
      `.trim()
    );

    const isView = mode === 'view';
    setModalActionTitle($('#ceoKrTitle', modalEl), mode);

    const subs = readList(LS.SUB, []);
    const allDivs = readList(LS.DIVISI, []);
    const allJobs = readList(LS.JABATAN, []);
    const emps = readList(LS.KAR, []);

    const employeeNoEl = $('#ceoKrEmployeeNo', modalEl);
    const nameEl = $('#ceoKrName', modalEl);
    const titlePrefixEl = $('#ceoKrTitlePrefix', modalEl);
    const titleSuffixEl = $('#ceoKrTitleSuffix', modalEl);
    const nikEl = $('#ceoKrNik', modalEl);
    const npwpEl = $('#ceoKrNpwp', modalEl);
    const emailEl = $('#ceoKrEmail', modalEl);
    const addrEl = $('#ceoKrAddr', modalEl);
    const birthEl = $('#ceoKrBirth', modalEl);
    const phoneEl = $('#ceoKrPhone', modalEl);
    const genderEl = $('#ceoKrGender', modalEl);
    const eduEl = $('#ceoKrEdu', modalEl);
    const activeStatusEl = $('#ceoKrActiveStatus', modalEl);
    const placementListEl = $('#ceoKrPlacementList', modalEl);
    const addPlacementEl = $('#ceoKrAddPlacement', modalEl);
    const fatherEl = $('#ceoKrFather', modalEl);
    const childNoEl = $('#ceoKrChildNo', modalEl);
    const childFromEl = $('#ceoKrChildFrom', modalEl);
    const joinEl = $('#ceoKrJoin', modalEl);
    const supervisorEl = $('#ceoKrSupervisor', modalEl);
    const bankCodeEl = $('#ceoKrBankCode', modalEl);
    const bankAccountEl = $('#ceoKrBankAccount', modalEl);
    const bankAccountNameEl = $('#ceoKrBankAccountName', modalEl);
    const photoNameEl = $('#ceoKrPhotoName', modalEl);
    const fileKkEl = $('#ceoKrFileKk', modalEl);
    const fileIdentityEl = $('#ceoKrFileIdentity', modalEl);
    const workHourTypeEl = $('#ceoKrWorkHourType', modalEl);
    const branchOfficeEl = $('#ceoKrBranchOffice', modalEl);
    const headOfficeEl = $('#ceoKrHeadOffice', modalEl);
    const payrollPeriodEl = $('#ceoKrPayrollPeriod', modalEl);
    const payrollTypeEl = $('#ceoKrPayrollType', modalEl);
    const presenceAreaActiveEl = $('#ceoKrPresenceAreaActive', modalEl);
    const accountActivationEl = $('#ceoKrAccountActivation', modalEl);
    const passwordEl = $('#ceoKrPass', modalEl);
    const notesEl = $('#ceoKrNotes', modalEl);
    const photoPreviewBtnEl = $('#ceoKrPhotoPreviewBtn', modalEl);
    const fileKkPreviewBtnEl = $('#ceoKrFileKkPreviewBtn', modalEl);
    const fileIdentityPreviewBtnEl = $('#ceoKrFileIdentityPreviewBtn', modalEl);

    function bindLocalPreview(inputEl, triggerEl, existingDataUrl = '', previewTitle = 'Lihat Berkas') {
      if (!inputEl || !triggerEl) return;
      let currentUrl = String(existingDataUrl || '').trim();
      const emptyMessage = `Tidak ada ${String(previewTitle || 'berkas').toLowerCase()}.`;
      const apply = (url) => {
        currentUrl = String(url || '').trim();
        triggerEl.dataset.previewSrc = currentUrl;
        triggerEl.classList.remove('d-none');
        triggerEl.disabled = false;
      };
      if (!triggerEl.dataset.previewBound) {
        triggerEl.dataset.previewBound = '1';
        triggerEl.addEventListener('click', () => {
          const src = String(triggerEl.dataset.previewSrc || '').trim();
          openDocumentPreview({ src, title: previewTitle, emptyMessage });
        });
      }
      apply(currentUrl);
      inputEl.addEventListener('change', () => {
        const file = inputEl.files?.[0];
        if (!file) return apply(existingDataUrl);
        const reader = new FileReader();
        reader.onload = () => apply(String(reader.result || ''));
        reader.onerror = () => apply(existingDataUrl);
        reader.readAsDataURL(file);
      });
    }

    function makeEmployeeFilePlaceholder(label, fileName) {
      const safeLabel = String(label || 'Berkas');
      const safeName = String(fileName || 'Belum ada file');
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
          <rect width="640" height="400" rx="28" fill="#f5f7fb"/>
          <rect x="28" y="28" width="584" height="344" rx="22" fill="#ffffff" stroke="#d9dee7" stroke-width="3"/>
          <text x="320" y="175" text-anchor="middle" font-family="Public Sans, Arial, sans-serif" font-size="34" font-weight="700" fill="#566a7f">${safeLabel.replace(/[<>&]/g, '')}</text>
          <text x="320" y="225" text-anchor="middle" font-family="Public Sans, Arial, sans-serif" font-size="22" fill="#8592a3">${safeName.replace(/[<>&]/g, '')}</text>
        </svg>
      `.trim();
      return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
    }

    function renderEmployeeFilePreview(targetEl, src, fileName, label) {
      if (!targetEl) return;
      const rawSrc = String(src || '').trim();
      const rawName = String(fileName || '').trim();
      const title = String(label || 'Berkas').trim();
      targetEl.classList.remove('d-none');

      if (rawSrc && (/^data:application\/pdf/i.test(rawSrc) || isPdfFileSrc(rawSrc))) {
        const frameSrc = rawSrc.includes('#') ? rawSrc : `${rawSrc}#toolbar=0&navpanes=0&scrollbar=1`;
        targetEl.innerHTML = `
          <div class="small fw-semibold mb-2">${escapeHtml(title)}</div>
          <iframe class="bm-file-preview__frame" src="${escapeHtml(frameSrc)}" title="${escapeHtml(title)}"></iframe>
        `.trim();
        return;
      }

      const imgSrc = rawSrc && (/^data:image\//i.test(rawSrc) || isImageFileSrc(rawSrc))
        ? rawSrc
        : makeEmployeeFilePlaceholder(title, rawName);
      targetEl.innerHTML = `
        <div class="small fw-semibold mb-2">${escapeHtml(title)}</div>
        <img class="bm-file-preview__img" src="${escapeHtml(imgSrc)}" alt="${escapeHtml(title)}" />
        ${rawName ? `<div class="small text-muted mt-2 text-truncate">${escapeHtml(rawName)}</div>` : ''}
      `.trim();
    }

    function syncEmployeeFilePreviews() {
      const viewOnly = mode === 'view';
      const previewVisible = mode === 'view' || mode === 'edit';
      const fileRows = [
        [
          '#ceoKrPhotoName',
          '#ceoKrPhotoView',
          data?.photo_data_url || data?.foto_karyawan_data_url || data?.foto_data_url || data?.photo_url || data?.foto_karyawan || data?.photo,
          data?.photo_name || data?.foto_karyawan_name || data?.foto_name || data?.foto_karyawan || data?.photo,
          'Foto Karyawan'
        ],
        [
          '#ceoKrFileKk',
          '#ceoKrFileKkView',
          data?.file_kk_data_url || data?.kartu_keluarga_data_url || data?.kk_data_url || data?.file_kk_url || data?.kartu_keluarga,
          data?.file_kk || data?.kartu_keluarga_name || data?.kk_name || data?.kartu_keluarga,
          'Kartu Keluarga'
        ],
        [
          '#ceoKrFileIdentity',
          '#ceoKrFileIdentityView',
          data?.file_identity_data_url || data?.ktp_data_url || data?.file_ktp_data_url || data?.identity_data_url || data?.ktp,
          data?.file_identity || data?.ktp_name || data?.file_ktp || data?.ktp,
          'KTP'
        ],
      ];

      fileRows.forEach(([inputSelector, previewSelector, src, fileName, label]) => {
        const inputEl = $(inputSelector, modalEl);
        const target = $(previewSelector, modalEl);
        if (inputEl) inputEl.classList.toggle('d-none', viewOnly);
        if (!target) return;
        if (!previewVisible) {
          target.classList.add('d-none');
          target.innerHTML = '';
        } else {
          renderEmployeeFilePreview(target, src, fileName, label);
        }

        if (inputEl && !inputEl.dataset.bmEmployeePreviewBound) {
          inputEl.dataset.bmEmployeePreviewBound = '1';
          inputEl.addEventListener('change', () => {
            const file = inputEl.files?.[0];
            if (!file || !target) return;
            const reader = new FileReader();
            reader.onload = () => renderEmployeeFilePreview(target, String(reader.result || ''), file.name || fileName, label);
            reader.onerror = () => renderEmployeeFilePreview(target, src, fileName, label);
            reader.readAsDataURL(file);
          });
        }
      });
    }

    const makeSimpleOpts = (arr) => arr.map((x) => ({ value: x, label: x }));
    fillSelectOptions(genderEl, makeSimpleOpts(GENDER_OPTS), 'Pilih jenis kelamin');
    fillSelectOptions(eduEl, makeSimpleOpts(EDUCATION_OPTS), 'Pilih pendidikan');
    fillSelectOptions(activeStatusEl, makeSimpleOpts(ACTIVE_STATUS_OPTS), 'Pilih status keaktifan');
    fillSelectOptions(workHourTypeEl, makeSimpleOpts(getShiftScenarioOptions()), 'Pilih tipe jam kerja');
    fillSelectOptions(payrollPeriodEl, makeSimpleOpts(PAYROLL_PERIOD_OPTS), 'Pilih periode payroll');
    fillSelectOptions(payrollTypeEl, makeSimpleOpts(PAYROLL_TYPE_OPTS), 'Pilih tipe payroll');
    fillSelectOptions(presenceAreaActiveEl, makeSimpleOpts(YES_NO_STATUS_OPTS), 'Pilih status area presensi');
    fillSelectOptions(accountActivationEl, makeSimpleOpts(ACCOUNT_ACTIVATION_OPTS), 'Pilih aktivasi akun');
    fillSelectOptions(branchOfficeEl, subs.map((sp) => ({ value: sp.name, label: sp.name })), 'Pilih kantor cabang/aktif');
    fillSelectOptions(headOfficeEl, subs.map((sp) => ({ value: sp.name, label: sp.name })), 'Pilih kantor utama');

    function buildPlacementRow(initial = {}) {
      const wrap = document.createElement('div');
      wrap.className = 'row g-2 align-items-end ceo-kr-placement-row';
      wrap.innerHTML = `
        <div class="col-lg-3 col-md-6">
          <label class="form-label">Sub Perusahaan</label>
          <select class="form-select ceo-kr-placement-sub"></select>
        </div>
        <div class="col-lg-3 col-md-6">
          <label class="form-label">Divisi</label>
          <select class="form-select ceo-kr-placement-div"></select>
        </div>
        <div class="col-lg-3 col-md-6">
          <label class="form-label">Jabatan</label>
          <select class="form-select ceo-kr-placement-job"></select>
        </div>
        <div class="col-lg-2 col-md-4">
          <label class="form-label">Grade Jabatan</label>
          <select class="form-select ceo-kr-placement-grade"></select>
        </div>
        <div class="col-lg-1 col-md-2 d-grid">
          <label class="form-label d-none d-md-block">&nbsp;</label>
          <button type="button" class="btn btn-outline-danger ceo-kr-placement-remove" title="Hapus penempatan" aria-label="Hapus penempatan"><i class="bx bx-trash"></i></button>
        </div>
      `.trim();

      const subSelect = wrap.querySelector('.ceo-kr-placement-sub');
      const divSelect = wrap.querySelector('.ceo-kr-placement-div');
      const jobSelect = wrap.querySelector('.ceo-kr-placement-job');
      const gradeSelect = wrap.querySelector('.ceo-kr-placement-grade');
      const removeBtn = wrap.querySelector('.ceo-kr-placement-remove');

      fillSelectOptions(subSelect, subs.map((sp) => ({ value: sp.id, label: sp.name })), 'Pilih sub perusahaan');
      fillSelectOptions(gradeSelect, makeSimpleOpts(GRADE_JABATAN_OPTS), 'Pilih grade');

      const refreshDivs = () => {
        const subId = String(subSelect.value || '').trim();
        const divs = allDivs.filter((dv) => !subId || String(dv.sub_id || '').trim() === subId);
        const current = String(divSelect.value || '').trim();
        fillSelectOptions(divSelect, divs.map((dv) => ({ value: dv.id, label: `${dv.code || '-'} - ${dv.name}` })), 'Pilih divisi');
        divSelect.value = divs.some((dv) => dv.id === current) ? current : '';
      };

      const refreshJobs = () => {
        const subId = String(subSelect.value || '').trim();
        const divId = String(divSelect.value || '').trim();
        const jobs = allJobs.filter((jb) => {
          const bySub = !subId || String(jb.sub_id || '').trim() === subId;
          const byDiv = !divId || String(jb.divisi_id || '').trim() === divId;
          return bySub && byDiv;
        });
        const current = String(jobSelect.value || '').trim();
        fillSelectOptions(jobSelect, jobs.map((jb) => ({ value: jb.id, label: `${jb.code || '-'} - ${jb.name}` })), 'Pilih jabatan');
        jobSelect.value = jobs.some((jb) => jb.id === current) ? current : '';
      };

      subSelect.addEventListener('change', () => {
        refreshDivs();
        refreshJobs();
      });
      divSelect.addEventListener('change', refreshJobs);
      removeBtn.addEventListener('click', () => {
        if (placementListEl.children.length <= 1) return;
        wrap.remove();
      });

      if (initial.sub_id) subSelect.value = initial.sub_id;
      refreshDivs();
      if (initial.divisi_id) divSelect.value = initial.divisi_id;
      refreshJobs();
      if (initial.jabatan_id) jobSelect.value = initial.jabatan_id;
      gradeSelect.value = String(initial.grade_jabatan || '').trim();

      placementListEl.appendChild(wrap);
      return wrap;
    }

    function getPlacementRowsFromData(row) {
      const subIds = empSubIds(row);
      const divIds = empDivisiIds(row);
      const jobIds = empJabatanIds(row);
      const out = [];
      const seen = new Set();

      jobIds.forEach((jobId) => {
        const jb = allJobs.find((x) => x.id === jobId);
        const item = {
          sub_id: String(jb?.sub_id || subIds[0] || '').trim(),
          divisi_id: String(jb?.divisi_id || divIds[0] || '').trim(),
          jabatan_id: String(jobId || '').trim(),
          grade_jabatan: String((row?.placement_rows || [])[0]?.grade_jabatan || row?.grade_jabatan || '').trim(),
        };
        const key = `${item.sub_id}|${item.divisi_id}|${item.jabatan_id}`;
        if (!seen.has(key) && (item.sub_id || item.divisi_id || item.jabatan_id)) {
          seen.add(key);
          out.push(item);
        }
      });

      const maxLen = Math.max(subIds.length, divIds.length, 0);
      for (let i = 0; i < maxLen; i += 1) {
        const item = {
          sub_id: String(subIds[i] || subIds[0] || '').trim(),
          divisi_id: String(divIds[i] || divIds[0] || '').trim(),
          jabatan_id: '',
          grade_jabatan: String((row?.placement_rows || [])[i]?.grade_jabatan || row?.grade_jabatan || '').trim(),
        };
        const key = `${item.sub_id}|${item.divisi_id}|${item.jabatan_id}`;
        if (!seen.has(key) && (item.sub_id || item.divisi_id)) {
          seen.add(key);
          out.push(item);
        }
      }

      return out.length ? out : [{}];
    }

    function getPlacementSelections() {
      const subIds = [];
      const divIds = [];
      const jobIds = [];
      const placement_rows = [];
      const pushUnique = (arr, value) => {
        const v = String(value || '').trim();
        if (!v || arr.includes(v)) return;
        arr.push(v);
      };

      Array.from(placementListEl.querySelectorAll('.ceo-kr-placement-row')).forEach((rowEl) => {
        const sub_id = String(rowEl.querySelector('.ceo-kr-placement-sub')?.value || '').trim();
        const divisi_id = String(rowEl.querySelector('.ceo-kr-placement-div')?.value || '').trim();
        const jabatan_id = String(rowEl.querySelector('.ceo-kr-placement-job')?.value || '').trim();
        const grade_jabatan = String(rowEl.querySelector('.ceo-kr-placement-grade')?.value || '').trim();
        pushUnique(subIds, sub_id);
        pushUnique(divIds, divisi_id);
        pushUnique(jobIds, jabatan_id);
        if (sub_id || divisi_id || jabatan_id || grade_jabatan) placement_rows.push({ sub_id, divisi_id, jabatan_id, grade_jabatan });
      });

      return { sub_ids: subIds, divisi_ids: divIds, jabatan_ids: jobIds, placement_rows };
    }

    addPlacementEl?.addEventListener('click', () => buildPlacementRow({}));

    if (data) {
      employeeNoEl.value = data.employee_no || '';
      nameEl.value = data.name || '';
      titlePrefixEl.value = data.title_prefix || '';
      titleSuffixEl.value = data.title_suffix || '';
      nikEl.value = data.nik || '';
      npwpEl.value = data.npwp || '';
      emailEl.value = data.email || '';
      addrEl.value = data.address || '';
      birthEl.value = (data.birth && data.birth !== '-') ? data.birth : '';
      phoneEl.value = data.phone || '';
      genderEl.value = data.gender || GENDER_OPTS[0];
      eduEl.value = data.education || '';
      activeStatusEl.value = data.active_status || ACTIVE_STATUS_OPTS[0];
      placementListEl.innerHTML = '';
      getPlacementRowsFromData(data).forEach((item) => buildPlacementRow(item));
      fatherEl.value = data.mother_name || data.mother || data.father_name || data.father || '';
      childNoEl.value = data.child_no || '';
      childFromEl.value = data.child_from || data.child_of || '';
      joinEl.value = data.join_date || todayISO();
      supervisorEl.value = data.supervisor || '';
      bankCodeEl.value = data.bank_code || '';
      bankAccountEl.value = data.bank_account || data.bank_acc || '';
      bankAccountNameEl.value = data.bank_account_name || '';
      fillSelectOptions(workHourTypeEl, makeSimpleOpts([...WORK_HOUR_TYPE_OPTS, ...getShiftScenarioOptions()]), 'Pilih tipe jam kerja');
      workHourTypeEl.value = normalizeWorkHourType(data.work_hour_type, [...WORK_HOUR_TYPE_OPTS, ...getShiftScenarioOptions()].filter(Boolean)[0] || '');
      if (branchOfficeEl) branchOfficeEl.value = data.branch_office || '';
      if (headOfficeEl) headOfficeEl.value = data.head_office || '';
      if (payrollPeriodEl) payrollPeriodEl.value = data.payroll_period || PAYROLL_PERIOD_OPTS[0];
      if (payrollTypeEl) payrollTypeEl.value = data.payroll_type || PAYROLL_TYPE_OPTS[0];
      presenceAreaActiveEl.value = data.presence_area_active || YES_NO_STATUS_OPTS[1];
      accountActivationEl.value = data.account_activation || ACCOUNT_ACTIVATION_OPTS[0];
      passwordEl.value = data.password || '';
      notesEl.value = data.notes || '';
    } else {
      // Form tambah harus kosong. Contoh data cukup tampil sebagai placeholder pada input/select.
      employeeNoEl.value = '';
      nameEl.value = '';
      titlePrefixEl.value = '';
      titleSuffixEl.value = '';
      nikEl.value = '';
      npwpEl.value = '';
      emailEl.value = '';
      addrEl.value = '';
      birthEl.value = '';
      phoneEl.value = '';
      genderEl.value = '';
      eduEl.value = '';
      activeStatusEl.value = '';
      placementListEl.innerHTML = '';
      buildPlacementRow({});
      fatherEl.value = '';
      childNoEl.value = '';
      childFromEl.value = '';
      joinEl.value = '';
      supervisorEl.value = '';
      bankCodeEl.value = '';
      bankAccountEl.value = '';
      bankAccountNameEl.value = '';
      if (branchOfficeEl) branchOfficeEl.value = '';
      if (headOfficeEl) headOfficeEl.value = '';
      if (payrollPeriodEl) payrollPeriodEl.value = '';
      if (payrollTypeEl) payrollTypeEl.value = '';
      workHourTypeEl.value = '';
      presenceAreaActiveEl.value = '';
      accountActivationEl.value = '';
      passwordEl.value = '';
      notesEl.value = '';
    }

    bindLocalPreview(photoNameEl, photoPreviewBtnEl, String(data?.photo_data_url || ''), 'Foto Karyawan');
    bindLocalPreview(fileKkEl, fileKkPreviewBtnEl, String(data?.file_kk_data_url || ''), 'Kartu Keluarga');
    bindLocalPreview(fileIdentityEl, fileIdentityPreviewBtnEl, String(data?.file_identity_data_url || ''), 'KTP');
    syncEmployeeFilePreviews();

    setModalBodyReadOnly(modalEl, isView);
    $('#ceoKrSave', modalEl).classList.toggle('d-none', isView);
    addPlacementEl?.classList.toggle('d-none', isView);
    $$('.ceo-kr-placement-remove', modalEl).forEach((btn) => btn.classList.toggle('d-none', isView));

    $('#ceoKrSave', modalEl).onclick = async () => {
      const saveBtn = $('#ceoKrSave', modalEl);
      const safeValue = (el, fallback = '') => String(el?.value ?? fallback ?? '').trim();
      const readArray = (key) => {
        const rows = readList(key, []);
        return Array.isArray(rows) ? rows : [];
      };
      const nextEmployeeNo = () => {
        const rows = readArray(LS.KAR);
        const maxNo = rows.reduce((max, row) => {
          const raw = String(row?.employee_no || '').trim();
          const match = raw.match(/(\d+)$/);
          return match ? Math.max(max, Number(match[1]) || 0) : max;
        }, 0);
        return `KRY-${String(maxNo + 1).padStart(3, '0')}`;
      };
      const getFileName = (inputEl, oldName = '') => String(inputEl?.files?.[0]?.name || oldName || '').trim();
      const readEmployeeFileSafe = async (inputEl, oldName = '', oldDataUrl = '') => {
        const file = inputEl?.files?.[0];
        if (!file) {
          return {
            name: String(oldName || '').trim(),
            data_url: String(oldDataUrl || '').trim(),
          };
        }

        const name = String(file.name || oldName || '').trim();

        // PDF / dokumen tidak dimasukkan base64 ke localStorage agar Simpan tidak gagal.
        if (!String(file.type || '').startsWith('image/')) {
          return { name, data_url: '' };
        }

        try {
          const dataUrl = await compressImageFileToDataUrl(file, { maxSide: 700, quality: 0.58 });
          return { name, data_url: String(dataUrl || '').trim() };
        } catch (err) {
          console.warn('File karyawan dilewati agar data teks tetap tersimpan.', err);
          return { name, data_url: '' };
        }
      };
      const persistEmployees = (rows) => {
        const list = Array.isArray(rows) ? rows : [];
        try {
          writeList(LS.KAR, list);
          return { ok: true, rows: list, stripped: false };
        } catch (err) {
          console.warn('Simpan karyawan gagal pada data lengkap. Mencoba tanpa file preview.', err);
        }

        const slimRows = list.map(stripEmployeeFileData);
        try {
          writeList(LS.KAR, slimRows);
          return { ok: true, rows: slimRows, stripped: true };
        } catch (err) {
          console.warn('Simpan karyawan tanpa file masih gagal. Storage karyawan akan di-reset.', err);
        }

        try {
          localStorage.removeItem(LS.KAR);
          writeList(LS.KAR, slimRows);
          return { ok: true, rows: slimRows, stripped: true };
        } catch (err) {
          console.warn('Reset storage karyawan gagal. Data akan ditampilkan sementara pada tabel.', err);
          window.__bmKaryawanFallbackRows = slimRows;
          return { ok: false, rows: slimRows, stripped: true };
        }
      };
      const renderFallbackEmployees = (rows) => {
        const table = $('#tblKaryawan');
        const tbody = table?.querySelector('tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        (Array.isArray(rows) ? rows : []).forEach((kr, idx) => {
          const subName = getSubCompanyNames(empSubIds(kr)).join(', ') || getSubCompanyName(getEmployeeSingleSubId(kr));
          const divName = getDivisiNames(empDivisiIds(kr)).join(', ') || getDivisiName(getEmployeeSingleDivisiId(kr));
          const jbName = getJabatanNames(empJabatanIds(kr)).join(', ') || getJabatanName(getEmployeeSingleJabatanId(kr));
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${idx + 1}</td>
            <td>${escapeHtml(kr.employee_no || '-')}</td>
            <td>${escapeHtml(kr.name || '-')}</td>
            <td>${escapeHtml(subName)}</td>
            <td>${escapeHtml(divName)}</td>
            <td>${escapeHtml(jbName)}</td>
            <td><span class="badge bg-label-${String(kr.active_status || '').toLowerCase() === 'aktif' ? 'success' : 'secondary'}">${escapeHtml(kr.active_status || '-')}</span></td>
            <td class="tdActions">
              <div class="d-flex justify-content-center gap-2">
                <button class="btn btn-sm btn-icon btn-primary" type="button" data-kr-view="${escapeHtml(kr.id)}" title="Lihat" aria-label="Lihat"><i class="bx bx-show"></i></button>
                <button class="btn btn-sm btn-icon btn-outline-primary" type="button" data-kr-edit="${escapeHtml(kr.id)}" title="Edit" aria-label="Edit"><i class="bx bx-edit-alt"></i></button>
                <button class="btn btn-sm btn-icon btn-outline-danger" type="button" data-kr-del="${escapeHtml(kr.id)}" title="Hapus" aria-label="Hapus"><i class="bx bx-trash"></i></button>
              </div>
            </td>
          `.trim();
          tbody.appendChild(tr);
        });
      };

      if (saveBtn) saveBtn.disabled = true;

      try {
        const name = safeValue(nameEl);
        if (!name) {
          window.alert('Nama wajib diisi.');
          nameEl?.focus?.();
          return;
        }

        const employee_no = safeValue(employeeNoEl) || nextEmployeeNo();
        if (employeeNoEl && !safeValue(employeeNoEl)) employeeNoEl.value = employee_no;

        let sub_ids = [];
        let divisi_ids = [];
        let jabatan_ids = [];
        let placement_rows = [];
        try {
          const selected = getPlacementSelections();
          sub_ids = Array.isArray(selected?.sub_ids) ? selected.sub_ids : [];
          divisi_ids = Array.isArray(selected?.divisi_ids) ? selected.divisi_ids : [];
          jabatan_ids = Array.isArray(selected?.jabatan_ids) ? selected.jabatan_ids : [];
          placement_rows = Array.isArray(selected?.placement_rows) ? selected.placement_rows : [];
        } catch (err) {
          console.warn('Penempatan karyawan dilewati karena belum lengkap.', err);
        }

        const hiddenWorkStatus = normalizeWorkStatus(String(data?.work_status || data?.employee_status || 'PKWT 1').trim());
        const [photoPayload, kkPayload, identityPayload] = await Promise.all([
          readEmployeeFileSafe(photoNameEl, data?.photo_name || data?.foto_karyawan_name, data?.photo_data_url || data?.foto_karyawan_data_url),
          readEmployeeFileSafe(fileKkEl, data?.file_kk || data?.kartu_keluarga_name, data?.file_kk_data_url || data?.kartu_keluarga_data_url),
          readEmployeeFileSafe(fileIdentityEl, data?.file_identity || data?.ktp_name || data?.file_ktp, data?.file_identity_data_url || data?.ktp_data_url || data?.file_ktp_data_url),
        ]);

        const payload = {
          id: data?.id || uid('kr'),
          employee_no,
          name,
          title_prefix: safeValue(titlePrefixEl),
          title_suffix: safeValue(titleSuffixEl),
          nik: safeValue(nikEl),
          npwp: safeValue(npwpEl),
          email: safeValue(emailEl),
          address: safeValue(addrEl),
          birth: safeValue(birthEl),
          phone: safeValue(phoneEl),
          gender: safeValue(genderEl),
          education: safeValue(eduEl),
          employee_status: String(data?.employee_status || hiddenWorkStatus).trim(),
          active_status: safeValue(activeStatusEl, ACTIVE_STATUS_OPTS[0]) || ACTIVE_STATUS_OPTS[0],
          sub_id: String(sub_ids[0] || '').trim(),
          divisi_id: String(divisi_ids[0] || '').trim(),
          jabatan_id: String(jabatan_ids[0] || '').trim(),
          sub_ids,
          divisi_ids,
          jabatan_ids,
          placement_rows,
          grade_jabatan: String(placement_rows?.[0]?.grade_jabatan || data?.grade_jabatan || '').trim(),
          mother_name: safeValue(fatherEl),
          mother: safeValue(fatherEl),
          father_name: String(data?.father_name || '').trim(),
          father: String(data?.father || '').trim(),
          child_no: safeValue(childNoEl),
          child_from: safeValue(childFromEl),
          child_of: safeValue(childFromEl),
          join_date: safeValue(joinEl),
          work_status: hiddenWorkStatus,
          supervisor: safeValue(supervisorEl),
          bank_code: safeValue(bankCodeEl),
          bank_account: safeValue(bankAccountEl),
          bank_acc: safeValue(bankAccountEl),
          bank_account_name: safeValue(bankAccountNameEl),
          retirement_date: String(data?.retirement_date || '').trim(),
          photo_name: String(photoPayload?.name || getFileName(photoNameEl, data?.photo_name || data?.foto_karyawan_name) || '').trim(),
          photo_data_url: String(photoPayload?.data_url || '').trim(),
          foto_karyawan_name: String(photoPayload?.name || getFileName(photoNameEl, data?.foto_karyawan_name || data?.photo_name) || '').trim(),
          foto_karyawan_data_url: String(photoPayload?.data_url || '').trim(),
          file_kk: String(kkPayload?.name || getFileName(fileKkEl, data?.file_kk || data?.kartu_keluarga_name) || '').trim(),
          file_kk_data_url: String(kkPayload?.data_url || '').trim(),
          kartu_keluarga_name: String(kkPayload?.name || getFileName(fileKkEl, data?.kartu_keluarga_name || data?.file_kk) || '').trim(),
          kartu_keluarga_data_url: String(kkPayload?.data_url || '').trim(),
          file_identity: String(identityPayload?.name || getFileName(fileIdentityEl, data?.file_identity || data?.ktp_name || data?.file_ktp) || '').trim(),
          file_identity_data_url: String(identityPayload?.data_url || '').trim(),
          ktp_name: String(identityPayload?.name || getFileName(fileIdentityEl, data?.ktp_name || data?.file_identity || data?.file_ktp) || '').trim(),
          ktp_data_url: String(identityPayload?.data_url || '').trim(),
          work_hour_type: safeValue(workHourTypeEl),
          branch_office: safeValue(branchOfficeEl, data?.branch_office || ''),
          head_office: safeValue(headOfficeEl, data?.head_office || ''),
          payroll_period: safeValue(payrollPeriodEl, data?.payroll_period || ''),
          payroll_type: safeValue(payrollTypeEl, data?.payroll_type || ''),
          presence_area_active: safeValue(presenceAreaActiveEl),
          account_activation: safeValue(accountActivationEl),
          password: safeValue(passwordEl),
          notes: safeValue(notesEl),
        };

        const rows = readArray(LS.KAR);
        const existingIdx = rows.findIndex((x) => String(x?.id || '') === String(payload.id));
        if (existingIdx >= 0) rows[existingIdx] = { ...rows[existingIdx], ...payload };
        else rows.unshift(payload);

        const saved = persistEmployees(rows);
        if (saved.ok) renderEmployees();
        else renderFallbackEmployees(saved.rows);

        try { fireOrgChanged(); } catch (err) { console.warn('Sinkronisasi data organisasi dilewati.', err); }
        try { bootstrap.Modal.getOrCreateInstance(modalEl).hide(); } catch (err) { modalEl.classList.remove('show'); modalEl.style.display = 'none'; }
        showCeoToast(
          saved.stripped
            ? 'Data karyawan berhasil disimpan. File preview dilewati agar penyimpanan aman.'
            : (mode === 'edit' ? 'Data karyawan berhasil diperbarui.' : 'Data karyawan berhasil disimpan.'),
          saved.stripped ? 'warning' : 'success'
        );
      } catch (err) {
        console.error('Gagal menyimpan karyawan:', err);

        // Fallback terakhir: simpan data minimum supaya user tetap bisa menambahkan karyawan.
        try {
          const name = safeValue(nameEl);
          if (!name) {
            window.alert('Nama wajib diisi.');
            return;
          }
          const payload = {
            id: data?.id || uid('kr'),
            employee_no: safeValue(employeeNoEl) || nextEmployeeNo(),
            name,
            active_status: safeValue(activeStatusEl, ACTIVE_STATUS_OPTS[0]) || ACTIVE_STATUS_OPTS[0],
            sub_id: '', divisi_id: '', jabatan_id: '', sub_ids: [], divisi_ids: [], jabatan_ids: [], placement_rows: [],
          };
          const rows = readArray(LS.KAR).filter((x) => String(x?.id || '') !== String(payload.id));
          rows.unshift(payload);
          const saved = persistEmployees(rows);
          if (saved.ok) renderEmployees();
          else renderFallbackEmployees(saved.rows);
          try { bootstrap.Modal.getOrCreateInstance(modalEl).hide(); } catch (hideErr) { modalEl.classList.remove('show'); modalEl.style.display = 'none'; }
          showCeoToast('Data karyawan berhasil disimpan dengan data minimum.', 'warning');
        } catch (fallbackErr) {
          console.error('Fallback simpan karyawan juga gagal:', fallbackErr);
          window.alert('Data belum bisa disimpan karena storage browser bermasalah. Bersihkan cache/localStorage lalu coba lagi. Detail ada di Console browser.');
        }
      } finally {
        if (saveBtn) saveBtn.disabled = false;
      }
    };

    showModal(id);
    const titleInput = modalEl.querySelector('.modal-body input, .modal-body select, .modal-body textarea');
    window.setTimeout(() => titleInput?.focus?.(), 120);
  }

  function initEmployeePage() {
    const table = $('#tblKaryawan');
    const addBtn = $('#btnAddKaryawan');
    if (!table || !addBtn) return;

    renderEmployees();
    addBtn.addEventListener('click', () => openKaryawanModal('add', null));

    table.addEventListener('click', (e) => {
      const view = e.target?.closest?.('button[data-kr-view]');
      const del = e.target?.closest?.('button[data-kr-del]');
      const edit = e.target?.closest?.('button[data-kr-edit]');

      if (view) {
        const id = view.getAttribute('data-kr-view');
        const rows = readList(LS.KAR, []);
        const cur = rows.find((x) => x.id === id);
        if (!cur) return;
        openKaryawanModal('view', cur);
        return;
      }

      if (del) {
        const id = del.getAttribute('data-kr-del');
        if (!id) return;
        confirmDelete('Delete Karyawan ini?', () => {
          const rows = readList(LS.KAR, []).filter((x) => x.id !== id);
          writeList(LS.KAR, rows);
          renderEmployees();
        });
        return;
      }

      if (edit) {
        const id = edit.getAttribute('data-kr-edit');
        const rows = readList(LS.KAR, []);
        const cur = rows.find((x) => x.id === id);
        if (!cur) return;
        openKaryawanModal('edit', cur);
      }
    });
  }

  // Kontrak Karyawan page (CRUD localStorage)
  function getEmployeeNameById(id) {
    const rows = readList(LS.KAR, []);
    return rows.find((x) => x.id === id)?.name || '-';
  }

  function getEmployeeJabatanIdById(id) {
    const rows = readList(LS.KAR, []);
    const emp = rows.find((x) => x.id === id);
    return getEmployeeSingleJabatanId(emp);
  }

  function getContractPreviewUrl(item) {
    return String(item?.file_preview_url || './').trim() || './';
  }

  function renderContractFileCell(item) {
    const preview = escapeHtml(getContractPreviewUrl(item));
    const label = escapeHtml(String(item?.file_name || '').trim() || '');
    return `<button class="btn btn-sm btn-outline-primary" type="button" data-kon-preview="${escapeHtml(item?.id || '')}" data-kon-pdf="${preview}" title="Lihat berkas: ${label}" aria-label="Lihat berkas kontrak"><i class="bx bx-file"></i></button>`;
  }

  function openContractPdfPreview(item) {
    const id = 'ceoKontrakPdfPreview';
    const modalEl = ensureModal(
      id,
      `
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="ceoKontrakPdfTitle">Preview Berkas Kontrak</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="ratio ratio-16x9" style="min-height:70vh;">
              <iframe id="ceoKontrakPdfFrame" src="" title="Preview Berkas Kontrak" style="width:100%;height:100%;border:0;"></iframe>
            </div>
          </div>
        </div>
      </div>
      `.trim()
    );
    const fileName = String(item?.file_name || '').trim() || '';
    const frame = $('#ceoKontrakPdfFrame', modalEl);
    const title = $('#ceoKontrakPdfTitle', modalEl);
    if (title) title.textContent = `Preview Berkas Kontrak - ${fileName}`;
    if (frame) frame.src = `${getContractPreviewUrl(item)}#toolbar=0&navpanes=0&scrollbar=1`;
    showModal(id);
    const titleInput = modalEl.querySelector('.modal-body input, .modal-body select, .modal-body textarea');
    window.setTimeout(() => titleInput?.focus?.(), 120);
  }

  function renderContracts() {
    const table = $('#tblKontrak');
    if (!table) return;
    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const rows = readList(LS.KONTRAK, []);
    tbody.innerHTML = '';

    rows.forEach((item, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${escapeHtml(getEmployeeNameById(item.employee_id))}</td>
        <td>${escapeHtml(item.no_contract || '-')}</td>
        <td>${escapeHtml(item.contract_date || '-')}</td>
        <td>${escapeHtml(item.start_date || '-')}</td>
        <td>${escapeHtml(item.end_date || '-')}</td>
        <td>${renderContractFileCell(item)}</td>
        <td><span class="badge bg-label-${String(item.status_contract || '').toLowerCase() === 'aktif' ? 'success' : 'secondary'}">${escapeHtml(item.status_contract || '-')}</span></td>
        <td class="tdActions">
          <div class="d-flex justify-content-center gap-2">
            <button class="btn btn-sm btn-icon btn-primary" type="button" data-kon-view="${escapeHtml(item.id)}" title="Lihat" aria-label="Lihat"><i class="bx bx-show"></i></button>
            <button class="btn btn-sm btn-icon btn-outline-primary" type="button" data-kon-edit="${escapeHtml(item.id)}" title="Edit" aria-label="Edit"><i class="bx bx-edit-alt"></i></button>
            <button class="btn btn-sm btn-icon btn-outline-danger" type="button" data-kon-del="${escapeHtml(item.id)}" title="Hapus" aria-label="Hapus"><i class="bx bx-trash"></i></button>
          </div>
        </td>
      `.trim();
      tbody.appendChild(tr);
    });
  }

  function openContractModal(mode, data) {
    const id = 'ceoKontrakModal';
    let modalEl = document.getElementById(id);
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.className = 'modal fade';
      modalEl.id = id;
      modalEl.tabIndex = -1;
      modalEl.setAttribute('aria-hidden', 'true');
      document.body.appendChild(modalEl);
    }

    modalEl.innerHTML = `
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="ceoKontrakTitle">Kontrak Karyawan</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div id="ceoKontrakStepForm">
              <div class="alert alert-info mb-3">
                Isi data kontrak terlebih dahulu, klik <b>Selanjutnya</b>, lalu template kontrak akan muncul seperti dokumen Word.
              </div>
              <div class="row g-3">
                <div class="col-12"><label class="form-label">Nama Karyawan</label><select id="ceoKontrakEmployee" class="form-select"></select></div>
                <div class="col-md-4"><label class="form-label">Sub Perusahaan</label><select id="ceoKontrakSub" class="form-select"></select></div>
                <div class="col-md-4"><label class="form-label">Divisi</label><select id="ceoKontrakDivisi" class="form-select"></select></div>
                <div class="col-md-4"><label class="form-label">Jabatan</label><select id="ceoKontrakJabatan" class="form-select"></select></div>
                <div class="col-md-4"><label class="form-label">Tanggal Kontrak</label><input id="ceoKontrakDate" class="form-control" type="date" /></div>
                <div class="col-md-4"><label class="form-label">Dari Tanggal</label><input id="ceoKontrakStart" class="form-control" type="date" /></div>
                <div class="col-md-4"><label class="form-label">Berakhir Tanggal</label><input id="ceoKontrakEnd" class="form-control" type="date" /></div>
                <div class="col-12 bm-contract-status-field"><label class="form-label">Status</label><select id="ceoKontrakStatus" class="form-select"></select></div>
              </div>
            </div>
            <div id="ceoKontrakStepTemplate" class="d-none">
              <div class="bm-contract-paper" id="ceoKontrakTemplatePaper"></div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal" id="ceoKontrakCancel">Batal</button>
            <button type="button" class="btn btn-outline-secondary d-none" id="ceoKontrakBack">Kembali</button>
            <button type="button" class="btn btn-primary" id="ceoKontrakNext">Selanjutnya</button>
            <button type="button" class="btn btn-primary d-none" id="ceoKontrakSave">Simpan</button>
          </div>
        </div>
      </div>
    `.trim();

    const isView = mode === 'view';
    setModalActionTitle($('#ceoKontrakTitle', modalEl), mode, 'Kontrak Karyawan');

    const emps = readList(LS.KAR, []);
    const subs = readList(LS.SUB, []);
    const divs = readList(LS.DIVISI, []);
    const jobs = readList(LS.JABATAN, []);

    const employeeEl = $('#ceoKontrakEmployee', modalEl);
    const subEl = $('#ceoKontrakSub', modalEl);
    const divisiEl = $('#ceoKontrakDivisi', modalEl);
    const jabatanEl = $('#ceoKontrakJabatan', modalEl);
    const contractDateEl = $('#ceoKontrakDate', modalEl);
    const startEl = $('#ceoKontrakStart', modalEl);
    const endEl = $('#ceoKontrakEnd', modalEl);
    const statusEl = $('#ceoKontrakStatus', modalEl);
    const formStepEl = $('#ceoKontrakStepForm', modalEl);
    const templateStepEl = $('#ceoKontrakStepTemplate', modalEl);
    const templatePaperEl = $('#ceoKontrakTemplatePaper', modalEl);
    const cancelBtn = $('#ceoKontrakCancel', modalEl);
    const backBtn = $('#ceoKontrakBack', modalEl);
    const nextBtn = $('#ceoKontrakNext', modalEl);
    const saveBtn = $('#ceoKontrakSave', modalEl);

    function nextContractNo() {
      if (data?.no_contract) return String(data.no_contract);
      const rows = readList(LS.KONTRAK, []);
      const nums = rows.map((row) => {
        const m = String(row?.no_contract || '').match(/(\d+)/);
        return m ? Number(m[1]) : 0;
      });
      const next = Math.max(0, ...nums) + 1;
      return `CTR-${String(next).padStart(3, '0')}`;
    }

    function employeeLabel(row) {
      return [row?.employee_no, row?.name].filter(Boolean).join(' - ') || row?.name || row?.employee_no || '-';
    }

    fillSelectOptions(employeeEl, emps.map((kr) => ({ value: kr.id, label: employeeLabel(kr) })), 'Pilih nama karyawan');
    fillSelectOptions(subEl, subs.map((sp) => ({ value: sp.id, label: sp.name || sp.code || '-' })), 'Pilih sub perusahaan');
    fillSelectOptions(statusEl, [
      { value: 'Freelance', label: 'Freelance' },
      { value: 'Interns', label: 'Interns' },
      { value: 'Training', label: 'Training' },
      { value: 'PKWT 1', label: 'PKWT 1' },
      { value: 'PKWT 2', label: 'PKWT 2' },
      { value: 'PKWT 3', label: 'PKWT 3' },
      { value: 'Karyawan Kontrak/tetap', label: 'Karyawan Kontrak/tetap' },
    ], 'Pilih status');

    // Sub Perusahaan, Divisi, dan Jabatan kontrak tidak bisa diedit manual.
    // Nilainya otomatis mengikuti karyawan yang dipilih dari fitur Karyawan.
    [subEl, divisiEl, jabatanEl].forEach((el) => {
      if (!el) return;
      el.disabled = true;
      el.classList.add('bm-readonly-select');
      el.title = 'Otomatis mengikuti data karyawan';
    });

    function refreshDivisi(keep = true) {
      const subId = String(subEl.value || '').trim();
      const current = keep ? String(divisiEl.value || data?.divisi_id || '').trim() : '';
      const opts = divs.filter((dv) => !subId || String(dv.sub_id || '') === subId);
      fillSelectOptions(divisiEl, opts.map((dv) => ({ value: dv.id, label: dv.name || dv.code || '-' })), 'Pilih divisi');
      if (opts.some((dv) => String(dv.id) === current)) divisiEl.value = current;
      refreshJabatan(keep);
    }

    function refreshJabatan(keep = true) {
      const subId = String(subEl.value || '').trim();
      const divId = String(divisiEl.value || '').trim();
      const current = keep ? String(jabatanEl.value || data?.jabatan_id || '').trim() : '';
      const opts = jobs.filter((jb) => {
        const bySub = !subId || String(jb.sub_id || '') === subId;
        const byDiv = !divId || String(jb.divisi_id || '') === divId;
        return bySub && byDiv;
      });
      fillSelectOptions(jabatanEl, opts.map((jb) => ({ value: jb.id, label: jb.name || jb.code || '-' })), 'Pilih jabatan');
      if (opts.some((jb) => String(jb.id) === current)) jabatanEl.value = current;
    }

    function applyEmployeeOrg() {
      const emp = emps.find((kr) => String(kr.id) === String(employeeEl.value));
      if (!emp) return;
      const subId = String(emp.sub_id || empSubIds(emp)[0] || '').trim();
      const divId = String(emp.divisi_id || empDivisiIds(emp)[0] || '').trim();
      const jobId = String(emp.jabatan_id || empJabatanIds(emp)[0] || '').trim();
      if (subId) subEl.value = subId;
      refreshDivisi(true);
      if (divId) divisiEl.value = divId;
      refreshJabatan(true);
      if (jobId) jabatanEl.value = jobId;
    }

    employeeEl.addEventListener('change', applyEmployeeOrg);

    if (data) {
      employeeEl.value = data.employee_id || '';
      subEl.value = data.sub_id || '';
      refreshDivisi(true);
      divisiEl.value = data.divisi_id || '';
      refreshJabatan(true);
      jabatanEl.value = data.jabatan_id || getEmployeeJabatanIdById(data.employee_id) || '';
      contractDateEl.value = data.contract_date || '';
      startEl.value = data.start_date || '';
      endEl.value = data.end_date || '';
      statusEl.value = data.status_contract || '';
    } else {
      refreshDivisi(false);
      contractDateEl.value = '';
      startEl.value = '';
      endEl.value = '';
      statusEl.value = '';
    }

    function collectPayload(validate = true) {
      const employee_id = String(employeeEl.value || '').trim();
      const sub_id = String(subEl.value || '').trim();
      const divisi_id = String(divisiEl.value || '').trim();
      const jabatan_id = String(jabatanEl.value || '').trim();
      const contract_date = String(contractDateEl.value || '').trim();
      const start_date = String(startEl.value || '').trim();
      const end_date = String(endEl.value || '').trim();
      const status_contract = String(statusEl.value || '').trim();
      if (validate) {
        if (!employee_id) return window.alert('Nama karyawan wajib dipilih.'), null;
        // Sub Perusahaan, Divisi, dan Jabatan otomatis dari karyawan.
        // Jika data karyawan belum memiliki penempatan, kontrak tetap boleh disimpan.
        if (!contract_date) return window.alert('Tanggal kontrak wajib diisi.'), null;
        if (!start_date) return window.alert('Dari tanggal wajib diisi.'), null;
        if (!end_date) return window.alert('Berakhir tanggal wajib diisi.'), null;
        if (!status_contract) return window.alert('Status wajib dipilih.'), null;
      }
      return {
        id: data?.id || uid('kon'),
        employee_id,
        sub_id,
        divisi_id,
        jabatan_id,
        no_contract: nextContractNo(),
        contract_date,
        start_date,
        end_date,
        status_contract,
      };
    }

    function buildContractTemplate(payload) {
      const emp = emps.find((kr) => String(kr.id) === String(payload.employee_id));
      const employeeName = emp?.name || '-';
      const no = payload.no_contract || nextContractNo();
      const subName = getSubCompanyName(payload.sub_id) || '-';
      const divName = getDivisiName(payload.divisi_id) || '-';
      const jobName = getJabatanName(payload.jabatan_id) || '-';
      return `
        <div class="bm-contract-paper__head">
          <h3>KONTRAK KARYAWAN</h3>
          <p>No: ${escapeHtml(no)}</p>
        </div>
        <div class="bm-contract-paper__section">
          <p>Pada tanggal <b>${escapeHtml(payload.contract_date || '-')}</b>, dibuat perjanjian kontrak kerja antara <b>PT Bisa Media</b> dengan karyawan berikut:</p>
          <table class="bm-contract-paper__table">
            <tr><td>Nama Karyawan</td><td>${escapeHtml(employeeName)}</td></tr>
            <tr><td>Sub Perusahaan</td><td>${escapeHtml(subName)}</td></tr>
            <tr><td>Divisi</td><td>${escapeHtml(divName)}</td></tr>
            <tr><td>Jabatan</td><td>${escapeHtml(jobName)}</td></tr>
            <tr><td>Dari Tanggal</td><td>${escapeHtml(payload.start_date || '-')}</td></tr>
            <tr><td>Berakhir Tanggal</td><td>${escapeHtml(payload.end_date || '-')}</td></tr>
            <tr><td>Status</td><td>${escapeHtml(payload.status_contract || '-')}</td></tr>
          </table>
          <p>Karyawan bersedia menjalankan tugas dan tanggung jawab sesuai jabatan, aturan perusahaan, serta ketentuan kerja yang berlaku di lingkungan PT Bisa Media.</p>
          <p>Belum ada dokumen yang diunggah.</p>
        </div>
        <div class="bm-contract-paper__sign">
          <div><p>Perusahaan</p><strong>PT Bisa Media</strong></div>
          <div><p>Karyawan</p><strong>${escapeHtml(employeeName)}</strong></div>
        </div>
      `.trim();
    }

    function toContractDataUrl(templateHtml) {
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>Kontrak Karyawan</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#222}.doc{max-width:760px;margin:auto;border:1px solid #ddd;padding:36px}.head{text-align:center;border-bottom:3px solid #2563eb;margin-bottom:24px}.head h1{margin:0 0 8px}.table{width:100%;border-collapse:collapse;margin:20px 0}.table td{border:1px solid #ddd;padding:10px}.table td:first-child{width:220px;font-weight:bold;background:#f8fafc}.sign{display:flex;justify-content:space-between;margin-top:80px;text-align:center}.sign div{width:40%;border-top:1px solid #333;padding-top:10px}</style></head><body><div class="doc">${templateHtml.replaceAll('bm-contract-paper__head', 'head').replaceAll('bm-contract-paper__table', 'table').replaceAll('bm-contract-paper__sign', 'sign').replaceAll('bm-contract-paper__section', 'section')}</div></body></html>`;
      return `data:text/html;charset=UTF-8,${encodeURIComponent(html)}`;
    }

    function showTemplateStep() {
      const payload = collectPayload(true);
      if (!payload) return null;
      templatePaperEl.innerHTML = buildContractTemplate(payload);
      formStepEl.classList.add('d-none');
      templateStepEl.classList.remove('d-none');
      cancelBtn.classList.add('d-none');
      backBtn.classList.remove('d-none');
      nextBtn.classList.add('d-none');
      saveBtn.classList.toggle('d-none', isView);
      return payload;
    }

    let latestPayload = null;
    nextBtn.textContent = isView ? 'Lihat Template' : 'Selanjutnya';
    nextBtn.onclick = () => { latestPayload = showTemplateStep(); };
    backBtn.onclick = () => {
      templateStepEl.classList.add('d-none');
      formStepEl.classList.remove('d-none');
      cancelBtn.classList.remove('d-none');
      backBtn.classList.add('d-none');
      nextBtn.classList.remove('d-none');
      saveBtn.classList.add('d-none');
    };

    saveBtn.onclick = () => {
      const payload = latestPayload || collectPayload(true);
      if (!payload) return;
      const templateHtml = buildContractTemplate(payload);
      const rows = readList(LS.KONTRAK, []);
      const idx = rows.findIndex((x) => String(x.id) === String(payload.id));
      const saved = {
        ...payload,
        file_name: `${String(payload.no_contract || 'kontrak').toLowerCase()}-kontrak-karyawan.html`,
        file_preview_url: toContractDataUrl(templateHtml),
        contract_note: 'Template kontrak karyawan dibuat dari form sistem.',
      };
      if (idx >= 0) rows[idx] = { ...rows[idx], ...saved };
      else rows.unshift(saved);
      writeList(LS.KONTRAK, rows);
      bootstrap.Modal.getOrCreateInstance(modalEl).hide();
      showCeoToast(mode === 'edit' ? 'Kontrak karyawan berhasil diperbarui.' : 'Kontrak karyawan berhasil disimpan.');
      renderContracts();
    };

    setModalBodyReadOnly(modalEl, isView);
    [subEl, divisiEl, jabatanEl].forEach((el) => {
      if (!el) return;
      el.disabled = true;
      el.classList.add('bm-readonly-select');
      el.title = 'Otomatis mengikuti data karyawan';
    });
    showModal(id);
    window.setTimeout(() => employeeEl?.focus?.(), 120);
  }

  function initContractPage() {
    const table = $('#tblKontrak');
    const addBtn = $('#btnAddKontrak');
    if (!table || !addBtn) return;

    renderContracts();
    addBtn.addEventListener('click', () => openContractModal('add', null));

    table.addEventListener('click', (e) => {
      const view = e.target?.closest?.('button[data-kon-view]');
      const del = e.target?.closest?.('button[data-kon-del]');
      const edit = e.target?.closest?.('button[data-kon-edit]');
      const preview = e.target?.closest?.('button[data-kon-preview]');

      if (view) {
        const id = view.getAttribute('data-kon-view');
        const rows = readList(LS.KONTRAK, []);
        const cur = rows.find((x) => x.id === id);
        if (!cur) return;
        openContractModal('view', cur);
        return;
      }

      if (preview) {
        const id = preview.getAttribute('data-kon-preview');
        const rows = readList(LS.KONTRAK, []);
        const cur = rows.find((x) => x.id === id);
        if (cur) openContractPdfPreview(cur);
        return;
      }

      if (del) {
        const id = del.getAttribute('data-kon-del');
        if (!id) return;
        confirmDelete('Delete Kontrak Karyawan ini?', () => {
          writeList(LS.KONTRAK, readList(LS.KONTRAK, []).filter((x) => x.id !== id));
          renderContracts();
        });
        return;
      }

      if (edit) {
        const id = edit.getAttribute('data-kon-edit');
        const cur = readList(LS.KONTRAK, []).find((x) => x.id === id);
        if (!cur) return;
        openContractModal('edit', cur);
      }
    });
  }

  function initContractDetailPage() {
    const root = $('#konEmployee');
    if (!root) return;

    const id = getQueryParam('id');
    const rows = readList(LS.KONTRAK, []);
    const item = rows.find((x) => x.id === id) || rows[0] || null;
    if (!item) return;

    const setVal = (id, value) => {
      const el = document.getElementById(id);
      if (!el) return;
      const v = (value === null || value === undefined || value === '') ? '-' : String(value);
      if ((el.tagName || '').toLowerCase() === 'textarea') el.value = v;
      else el.value = v;
    };

    setVal('konEmployee', getEmployeeNameById(item.employee_id));
    setVal('konNo', item.no_contract);
    setVal('konJabatan', getJabatanName(item.jabatan_id) || '-');
    setVal('konContractDate', item.contract_date);
    setVal('konStartDate', item.start_date);
    setVal('konEndDate', item.end_date);
    setVal('konStatus', item.status_contract);
    setVal('konFile', item.file_name);
    setVal('konNote', item.contract_note);
  }


  // Detail page helper
  function findControlByLabel(labelText) {
    const want = String(labelText || '').trim().toLowerCase();
    const labels = $$('label.form-label');
    for (const lb of labels) {
      const got = (lb.textContent || '').trim().toLowerCase();
      if (got === want) {
        return lb.parentElement?.querySelector?.('input, select, textarea') || null;
      }
    }
    return null;
  }

  function setControlValue(ctrl, value) {
    if (!ctrl) return;
    const v = (value === null || value === undefined || value === '') ? '-' : String(value);
    const tag = (ctrl.tagName || '').toLowerCase();
    if (tag === 'select') {
      ctrl.innerHTML = `<option selected>${escapeHtml(v)}</option>`;
      return;
    }
    ctrl.value = v;
  }

  function initEmployeeDetailPage() {
    const root = $('#krName');
    if (!root) return;

    const id = getQueryParam('id');
    const rows = readList(LS.KAR, []);
    const kr = rows.find((x) => x.id === id) || rows[0] || null;
    if (!kr) return;

    const subName = getSubCompanyNames(empSubIds(kr)).join(', ') || getSubCompanyName(getEmployeeSingleSubId(kr));
    const divName = getDivisiNames(empDivisiIds(kr)).join(', ') || getDivisiName(getEmployeeSingleDivisiId(kr));
    const jbName = getJabatanNames(empJabatanIds(kr)).join(', ') || getJabatanName(getEmployeeSingleJabatanId(kr));

    const setVal = (id, value) => {
      const el = document.getElementById(id);
      if (!el) return;
      const v = (value === null || value === undefined || value === '') ? '-' : String(value);
      if ((el.tagName || '').toLowerCase() === 'textarea') el.value = v;
      else el.value = v;
    };

    setVal('krEmployeeNo', kr.employee_no);
    setVal('krName', kr.name);
    setVal('krTitlePrefix', kr.title_prefix);
    setVal('krTitleSuffix', kr.title_suffix);
    setVal('krNik', kr.nik);
    setVal('krNpwp', kr.npwp);
    setVal('krEmail', kr.email);
    setVal('krAddress', kr.address);
    setVal('krBirth', kr.birth);
    setVal('krPhone', kr.phone);
    setVal('krGender', kr.gender);
    setVal('krEducation', kr.education);
    setVal('krEmploymentStart', kr.employment_start);
    setVal('krActiveStatus', kr.active_status);
    setVal('krSub', subName);
    setVal('krJabatan', jbName);
    setVal('krGradeJabatan', kr.grade_jabatan);
    setVal('krDivisi', divName);
    setVal('krFather', kr.father_name || kr.father);
    setVal('krChildNo', kr.child_no);
    setVal('krChildFrom', kr.child_from || kr.child_of);
    setVal('krJoinDate', kr.join_date);
    setVal('krWorkStatus', normalizeWorkStatus(kr.work_status || '-'));
    setVal('krSupervisor', kr.supervisor);
    setVal('krBankCode', kr.bank_code);
    setVal('krBankAccount', kr.bank_account || kr.bank_acc);
    setVal('krBankAccountName', kr.bank_account_name);
    setVal('krPhotoName', kr.photo_name);
    setVal('krFileKk', kr.file_kk);
    setVal('krFileIdentity', kr.file_identity);
    const photoInput = document.getElementById('krPhotoName'); if (photoInput) photoInput.dataset.fileUrl = String(kr.photo_data_url || '');
    const kkInput = document.getElementById('krFileKk'); if (kkInput) kkInput.dataset.fileUrl = String(kr.file_kk_data_url || '');
    const idInput = document.getElementById('krFileIdentity'); if (idInput) idInput.dataset.fileUrl = String(kr.file_identity_data_url || '');
    ensureFilePreviewControl('krPhotoName', 'krPhotoPreviewBtn');
    ensureFilePreviewControl('krFileKk', 'krFileKkPreviewBtn');
    ensureFilePreviewControl('krFileIdentity', 'krFileIdentityPreviewBtn');
    setVal('krWorkHourType', normalizeWorkHourType(kr.work_hour_type, [...WORK_HOUR_TYPE_OPTS, ...getShiftScenarioOptions()].filter(Boolean)[0] || ''));
    setVal('krBranchOffice', kr.branch_office);
    setVal('krHeadOffice', kr.head_office);
    setVal('krPayrollPeriod', kr.payroll_period);
    setVal('krPayrollType', kr.payroll_type);
    setVal('krPresenceAreaActive', kr.presence_area_active);
    setVal('krAccountActivation', kr.account_activation);
    setVal('krPassword', kr.password);
    setVal('krNotes', kr.notes);
  }



  // --------------------------------------------------------------
  // Detail pages (read from querystring)
  // --------------------------------------------------------------
  function getQueryParam(key) {
    const params = new URLSearchParams(window.location.search || '');
    return params.get(key) || '';
  }

  function initSubCompanyDetailPage() {
    const nameEl = $('#spNama');
    if (!nameEl) return;

    const id = getQueryParam('id');
    const subs = readList(LS.SUB, []);
    const sp = subs.find((x) => x.id === id) || subs[0] || null;

    $('#spNama').value = sp?.name || '-';
    $('#spKategori').value = sp?.category || '-';
    $('#spLokasi').value = sp?.location || '-';
    $('#spTelp').value = sp?.phone || '-';
    $('#spEmail').value = sp?.email || '-';
    $('#spAlamat').value = sp?.address || '-';
    $('#spKet').value = sp?.note || '-';

    const logoEl = $('#spLogoPreview');
    const fallback = $('#spLogoFallback');
    if (logoEl) {
      logoEl.src = sp?.logo || '';
      logoEl.style.display = sp?.logo ? '' : 'none';
    }
    if (fallback) {
      fallback.textContent = sp?.logo ? 'Preview logo sub perusahaan' : getSubCompanyInitials(sp?.name || 'SP');
      fallback.classList.toggle('fw-semibold', !sp?.logo);
      fallback.classList.toggle('text-primary', !sp?.logo);
    }
  }

  function initDivisiDetailPage() {
    const divEl = $('#dvDivisi');
    if (!divEl) return;

    const id = getQueryParam('id');
    const rows = readList(LS.DIVISI, []);
    const dv = rows.find((x) => x.id === id) || rows[0] || null;

    $('#dvSub').value = dv ? getSubCompanyName(dv.sub_id) : '-';
    const codeEl = $('#dvCode');
    if (codeEl) codeEl.value = dv?.code || '-';
    const parentEl = $('#dvParent');
    if (parentEl) parentEl.value = dv ? getDivisiParentName(dv.parent_id) : '-';
    $('#dvDivisi').value = dv?.name || '-';
  }


  function initJabatanDetailPage() {
    const el = $('#jbName');
    if (!el) return;

    const id = getQueryParam('id');
    const rows = readList(LS.JABATAN, []);
    const jb = rows.find((x) => x.id === id) || rows[0] || null;

    $('#jbSub').value = jb ? getSubCompanyName(jb.sub_id) : '-';
    $('#jbDiv').value = jb ? getDivisiName(jb.divisi_id) : '-';
    const codeEl = $('#jbCode');
    if (codeEl) codeEl.value = jb?.code || '-';
    $('#jbName').value = jb?.name || '-';
    const presenceEl = $('#jbPresence');
    if (presenceEl) presenceEl.value = jb ? normalizePresenceScope(jb?.presence_scope, 'Tidak') : '-';
    const fineEarlyStatus = /aktif|ya/i.test(String(jb?.early_leave_fine || '')) ? 'Ya' : 'Tidak';
    const fineEarlyEl = $('#jbFineEarly');
    if (fineEarlyEl) fineEarlyEl.value = jb ? fineEarlyStatus : '-';
    const fineGradeStatus = /aktif|ya/i.test(String(jb?.grade_fine_enabled || '')) ? 'Ya' : 'Tidak';
    const fineGradeEl = $('#jbFineGrade');
    if (fineGradeEl) fineGradeEl.value = jb ? fineGradeStatus : '-';
    const fineHourEl = $('#jbFineHour');
    if (fineHourEl) fineHourEl.value = jb && fineGradeStatus === 'Aktif' ? (jb?.fine_per_hour ?? '-') : '-';
    const fineMinuteEl = $('#jbFineMinute');
    if (fineMinuteEl) fineMinuteEl.value = jb && fineGradeStatus === 'Aktif' ? (jb?.fine_per_minute ?? '-') : '-';
  }

  function initCompanyProfilePage() {
    const nameEl = $('#cpName');
    if (!nameEl) return;

    const prof = readList(LS.PROFIL, {});

    // text fields
    $('#cpName').value = prof?.name || 'Bisa Media';
    $('#cpTagline').value = prof?.tagline || '';
    $('#cpEmail').value = prof?.email || '';
    $('#cpPhone').value = prof?.phone || '';
    $('#cpWebsite').value = prof?.website || '';
    if ($('#cpLocation')) $('#cpLocation').value = prof?.location || '';
    $('#cpAddress').value = prof?.address || '';
    if ($('#cpBankNo')) $('#cpBankNo').value = prof?.bank_no || '';
    $('#cpAbout').value = prof?.about || '';

    // logo field (foto profil dihapus)
    let logoDataUrl = String(prof?.logo_data_url || '').trim();
    let signatureDataUrl = String(prof?.signature_data_url || '').trim();
    let signatureName = String(prof?.signature_name || '').trim();

    const logoPrev = $('#cpLogoPreview');
    const logoFile = $('#cpLogoFile');
    const signatureFile = $('#cpSignatureFile');

    const setPrev = () => {
      if (logoPrev) logoPrev.src = logoDataUrl || './media/logo.png';
    };

    const fileToDataUrl = (file) => new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result || ''));
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });

    setPrev();

    logoFile?.addEventListener?.('change', async () => {
      const f = logoFile.files && logoFile.files[0];
      if (!f) return;
      try {
        logoDataUrl = await fileToDataUrl(f);
        setPrev();
      } catch {
        window.alert('Gagal membaca file logo.');
      }
    });

    signatureFile?.addEventListener?.('change', async () => {
      const f = signatureFile.files && signatureFile.files[0];
      if (!f) return;
      try {
        signatureName = f.name || '';
        signatureDataUrl = await fileToDataUrl(f);
      } catch {
        window.alert('Gagal membaca file TTD.');
      }
    });

    const btn = $('#cpSave');
    if (btn) {
      btn.addEventListener('click', () => {
        const next = {
          name: String($('#cpName').value || '').trim() || 'Bisa Media',
          tagline: String($('#cpTagline').value || '').trim(),
          email: String($('#cpEmail').value || '').trim(),
          phone: String($('#cpPhone').value || '').trim(),
          location: String($('#cpLocation')?.value || '').trim(),
          website: String($('#cpWebsite').value || '').trim(),
          address: String($('#cpAddress').value || '').trim(),
          bank_no: String($('#cpBankNo')?.value || '').trim(),
          about: String($('#cpAbout').value || '').trim(),
          signature_name: String(signatureName || '').trim(),
          signature_data_url: String(signatureDataUrl || '').trim(),
          logo_data_url: String(logoDataUrl || '').trim(),
          // avatar_data_url sengaja tidak digunakan (foto profil dihapus)
          avatar_data_url: '',
        };
        writeList(LS.PROFIL, next);
        applyCompanyBranding();
        showCeoToast('Profil perusahaan berhasil disimpan.');
      });
    }
  }


  // --------------------------------------------------------------
  // Init calendar for pages
  // --------------------------------------------------------------
  function initCalendarPages() {
    // Kalender page
    const calDays = $('#bmcalMiniDays');
    if (calDays) {
      initCalendarMini({
        daysEl: calDays,
        labelEl: $('#bmcalMiniLabel'),
        prevBtn: $('#bmcalPrev'),
        nextBtn: $('#bmcalNext'),
        selectedLabelEl: $('#bmcalSelectedLabel'),
        listEl: $('#bmcalEventList'),
        emptyEl: $('#bmcalEmpty'),
        addBtn: $('#bmcalAddEvent'),
        mode: 'calendar',
      });
      initEventDelete($('#bmcalEventList'));
      initEventDelete($('#bmcalMonthScheduleList'));
    }

    // Dashboard mini calendar
    const dashDays = $('#dashCalDays');
    if (dashDays) {
      initCalendarMini({
        daysEl: dashDays,
        labelEl: $('#dashCalLabel'),
        prevBtn: $('#dashCalPrev'),
        nextBtn: $('#dashCalNext'),
        selectedLabelEl: $('#dashSelectedLabel'),
        listEl: $('#dashEventList'),
        emptyEl: $('#dashEmpty'),
        addBtn: null,
        mode: 'dashboard',
      });
    }
  }


  // --------------------------------------------------------------
  // Dashboard dynamic numbers (biar lebih hidup)
  // --------------------------------------------------------------
  function initDashboardStats() {
    const emps = readList(LS.KAR, []);
    const subs = readList(LS.SUB, []);
    const events = readList(LS.CAL, []);
    const t = todayISO();

    const totalEmp = Array.isArray(emps) ? emps.length : 0;
    const totalSub = Array.isArray(subs) ? subs.length : 0;
    const allEvents = Array.isArray(events) ? events : [];
    const todayEvents = allEvents
      .filter((e) => String(e?.date || '') === t)
      .sort((a, b) => String(a.start || '').localeCompare(String(b.start || '')));
    const nextEvents = allEvents
      .filter((e) => String(e?.date || '') >= t)
      .sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')) || String(a.start || '').localeCompare(String(b.start || '')));

    const setText = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(v);
    };

    const setStatByTitle = (title, value) => {
      const wanted = String(title || '').trim().toLowerCase();
      document.querySelectorAll('.bm-stat-card').forEach((card) => {
        const titleEl = card.querySelector('.bm-stat-title');
        const valueEl = card.querySelector('.bm-stat-value');
        if (!titleEl || !valueEl) return;
        const current = String(titleEl.textContent || '').trim().toLowerCase();
        if (current === wanted) valueEl.textContent = String(value);
      });
    };

    const formatEventTime = (ev) => {
      if (!ev) return '-';
      const start = String(ev.start || '').trim();
      const end = String(ev.end || '').trim();
      const type = String(ev.type || '').trim();
      const time = start || end ? `${start || '--:--'}${end ? ` - ${end}` : ''}` : 'Jadwal fleksibel';
      return type ? `${time} • ${type}` : time;
    };

    setText('dashTotalEmployees', totalEmp);
    setText('dashTotalSubCompanies', totalSub);
    setText('dashTodayEvents', todayEvents.length);
    setText('dashUpcomingCount', nextEvents.length);

    setStatByTitle('Total Karyawan', totalEmp);
    setStatByTitle('Sub Perusahaan', totalSub);
    setStatByTitle('Jadwal Terdekat', nextEvents.length);

    const todayEvent = todayEvents[0] || null;
    const dashTodayTitle = document.getElementById('dashTodayTitle');
    const dashTodayTime = document.getElementById('dashTodayTime');
    if (dashTodayTitle) dashTodayTitle.textContent = todayEvent ? String(todayEvent.title || 'Jadwal') : 'Belum ada kegiatan';
    if (dashTodayTime) dashTodayTime.textContent = todayEvent ? formatEventTime(todayEvent) : '-';

    const nextEl = document.getElementById('dashNextEvent');
    const heroEvent = nextEvents[0] || null;
    if (nextEl) {
      nextEl.textContent = heroEvent ? `${heroEvent.date || '-'} • ${formatEventTime(heroEvent)} • ${heroEvent.title || 'Jadwal'}` : '-';
    }

    const heroTitleEl = document.getElementById('dashHeroNextTitle');
    const heroMetaEl = document.getElementById('dashHeroNextMeta');
    const heroTypeEl = document.getElementById('dashHeroNextType');
    const heroNoteEl = document.getElementById('dashHeroNextNote');
    if (heroTitleEl) heroTitleEl.textContent = heroEvent?.title || 'Belum ada jadwal';
    if (heroMetaEl) heroMetaEl.textContent = heroEvent ? `${heroEvent.date || '-'} • ${formatEventTime(heroEvent)}` : '-';
    if (heroTypeEl) heroTypeEl.textContent = heroEvent?.type || '-';
    if (heroNoteEl) heroNoteEl.textContent = heroEvent?.note || 'Belum ada catatan';

    initDashboardAttendance();
  }




  // --------------------------------------------------------------
  // Sinkron data demo Kehadiran ke Dashboard
  // --------------------------------------------------------------
  function normalizeNameKey(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  }

  function getDefaultAttendanceDemoRows() {
    const today = todayISO();
    return [
      { name: 'Setiawan', date: today, status: 'Hadir', in: '08:00', out: '17:00', sub: '-', divisi: '-' },
      { name: 'Raka Wijaya', date: today, status: 'Terlambat', in: '08:18', out: '17:03', sub: '-', divisi: '-' },
    ];
  }

  function getAttendanceDemoRows() {
    const rows = readList(LS.ABSEN_DEMO, null);
    if (Array.isArray(rows) && rows.length) return rows;
    return getDefaultAttendanceDemoRows();
  }

  function inferDashboardAttendanceStatus(statusText, checkIn) {
    const raw = String(statusText || '').trim().toLowerCase();
    if (raw.includes('terlambat')) return 'Terlambat';
    if (raw.includes('izin') || raw.includes('cuti') || raw.includes('sakit')) return 'Izin / Cuti';
    if (raw.includes('tidak') || raw.includes('alpha')) return 'Tidak Hadir';
    if (String(checkIn || '').trim()) return 'Hadir';
    return 'Belum Presensi';
  }

  function syncAttendanceDemoRowsFromTable() {
    const table = document.getElementById('tblKehadiranV2');
    if (!table) return;

    const rows = Array.from(table.querySelectorAll('tbody tr'))
      .map((tr) => {
        const tds = Array.from(tr.querySelectorAll('td'));
        const name = String(tds[1]?.textContent || '').trim();
        if (!name) return null;

        const date = String(tds[2]?.textContent || todayISO()).trim() || todayISO();
        const checkIn = String(tds[3]?.textContent || '').trim();
        const statusText = String(tds[5]?.textContent || '').trim();
        const checkOut = String(tds[6]?.textContent || '').trim();

        return {
          name,
          date,
          status: inferDashboardAttendanceStatus(statusText, checkIn),
          in: checkIn,
          out: checkOut,
          sub: '-',
          divisi: '-',
        };
      })
      .filter(Boolean);

    if (rows.length) writeList(LS.ABSEN_DEMO, rows);
  }

  // --------------------------------------------------------------
  // Dashboard: Kehadiran Hari Ini
  // - Isi tabel otomatis dari data Karyawan.
  // - Status hadir tetap mengikuti data presensi lokal jika sudah ada.
  // --------------------------------------------------------------
  function initDashboardAttendance() {
    const tbody = document.getElementById('dashAttendanceBody');
    if (!tbody) return;

    const card = tbody.closest('.card');
    if (!card) return;

    const employees = Array.isArray(readList(LS.KAR, [])) ? readList(LS.KAR, []) : [];
    const today = todayISO();
    const demoAttendanceRows = getAttendanceDemoRows().filter((row) => !row?.date || row.date === today);
    const demoAttendanceByName = demoAttendanceRows.reduce((acc, row) => {
      const key = normalizeNameKey(row?.name);
      if (key) acc[key] = row;
      return acc;
    }, {});
    const displayEmployees = employees.length
      ? employees
      : demoAttendanceRows.map((row, index) => ({
        id: `demo-attendance-${index + 1}`,
        name: row.name,
        sub_demo: row.sub || '-',
        divisi_demo: row.divisi || '-',
        __attendanceDemoOnly: true,
      }));
    const total = displayEmployees.length;

    let attendance = readList(LS.ABSEN, null);
    if (!attendance || typeof attendance !== 'object' || attendance.date !== today || typeof attendance.by_emp !== 'object') {
      attendance = { date: today, by_emp: {} };
      writeList(LS.ABSEN, attendance);
    }

    const normalizeStatusKey = (value) => {
      const text = String(value || '').trim().toLowerCase();
      if (!text || text.includes('belum')) return '';
      if (text.includes('tidak') || text.includes('alpha') || text.includes('absen')) return 'tidak';
      if (text.includes('izin') || text.includes('cuti') || text.includes('sakit')) return 'izin';
      if (text.includes('terlambat')) return 'terlambat';
      if (text.includes('hadir') || text.includes('masuk')) return 'hadir';
      return '';
    };

    const statusBadge = (value) => {
      const key = normalizeStatusKey(value);
      const cls = key === 'hadir' ? 'success' : key === 'terlambat' ? 'warning' : key === 'izin' ? 'info' : key === 'tidak' ? 'danger' : 'secondary';
      const label = String(value || '').trim() || 'Belum Presensi';
      return `<span class="badge bg-label-${cls}">${escapeHtml(label)}</span>`;
    };

    const counts = { hadir: 0, terlambat: 0, izin: 0, tidak: 0 };

    tbody.innerHTML = '';
    if (!displayEmployees.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">Belum ada data karyawan. Tambahkan karyawan terlebih dahulu.</td></tr>';
    } else {
      displayEmployees.forEach((employee, index) => {
        const matchedDemo = demoAttendanceByName[normalizeNameKey(employee.name || employee.employee_no)] || {};
        const state = attendance.by_emp?.[employee.id] || matchedDemo || {};
        const status = String(state.status || '').trim() || 'Belum Presensi';
        const key = normalizeStatusKey(status);
        if (key && Object.prototype.hasOwnProperty.call(counts, key)) counts[key] += 1;

        const subName = employee.__attendanceDemoOnly
          ? (employee.sub_demo || '-')
          : (getSubCompanyNames(empSubIds(employee)).join(', ') || getSubCompanyName(getEmployeeSingleSubId(employee)) || matchedDemo.sub || '-');
        const divName = employee.__attendanceDemoOnly
          ? (employee.divisi_demo || '-')
          : (getDivisiNames(empDivisiIds(employee)).join(', ') || getDivisiName(getEmployeeSingleDivisiId(employee)) || matchedDemo.divisi || '-');

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${index + 1}</td>
          <td>${escapeHtml(employee.name || employee.employee_no || '-')}</td>
          <td>${escapeHtml(subName || '-')}</td>
          <td>${escapeHtml(divName || '-')}</td>
          <td>${statusBadge(status)}</td>
          <td>${escapeHtml(state.in || state.check_in || '-')}</td>
          <td>${escapeHtml(state.out || state.check_out || '-')}</td>
        `.trim();
        tbody.appendChild(tr);
      });
    }

    const blocks = Array.from(card.querySelectorAll('.row.g-3.mb-4 > .col-md-6, .row.g-3 > .col-md-6'));
    blocks.forEach((block) => {
      const labelEl = block.querySelector('.d-flex span');
      const countEl = block.querySelector('.d-flex small');
      const barEl = block.querySelector('.bm-progress > span, .progress-bar');
      const label = String(labelEl?.textContent || '').trim().toLowerCase();
      let key = '';
      if (label.includes('tidak')) key = 'tidak';
      else if (label.includes('izin') || label.includes('cuti')) key = 'izin';
      else if (label.includes('terlambat')) key = 'terlambat';
      else if (label.includes('hadir')) key = 'hadir';
      if (!key) return;

      const count = counts[key] || 0;
      const pct = total ? Math.round((count / total) * 100) : 0;
      if (countEl) countEl.textContent = `${count}/${total}`;
      if (barEl) {
        barEl.style.width = `${pct}%`;
        barEl.setAttribute('aria-valuenow', String(pct));
      }
    });
  }


  function syncEmployeeAccounts() {
    const employees = Array.isArray(readList(LS.KAR, [])) ? readList(LS.KAR, []) : [];

    if (!employees.length) {
      writeList(LS.AKUN_KARYAWAN, []);
      return [];
    }

    const metaRows = Array.isArray(readList(LS.AKUN_KARYAWAN, [])) ? readList(LS.AKUN_KARYAWAN, []) : [];
    const map = new Map(metaRows.map((row) => [String(row?.employee_id || ''), row]));
    const mergedMeta = employees.map((emp, idx) => {
      const key = String(emp?.id || '');
      const prev = map.get(key) || {};
      return {
        employee_id: key,
        password: String(prev.password || emp?.password || ''),
        created_at: String(prev.created_at || emp?.join_date || todayISO()),
        status_akun: String(prev.status_akun || emp?.active_status || 'Aktif'),
      };
    });
    writeList(LS.AKUN_KARYAWAN, mergedMeta);
    return employees.map((emp) => {
      const meta = mergedMeta.find((row) => String(row.employee_id) === String(emp.id)) || {};
      return {
        employee_id: String(emp.id || ''),
        employee_no: String(emp.employee_no || '-'),
        nama_karyawan: String(emp.name || '-'),
        email: String(emp.email || '-'),
        password: String(meta.password || ''),
        dibuat_pada: String(meta.created_at || todayISO()),
        status_akun: String(meta.status_akun || 'Aktif'),
      };
    });
  }

  function ceoSetReadonlyFields(root, readonly) {
    Array.from(root.querySelectorAll('input, select, textarea, button[data-role="picker"]')).forEach((el) => {
      if (el.id && /Save$/i.test(el.id)) return;
      if (el.type === 'file') {
        el.disabled = !!readonly;
        return;
      }
      if (el.tagName === 'SELECT' || el.tagName === 'BUTTON') el.disabled = !!readonly;
      else el.readOnly = !!readonly;
    });
  }

  function initEmployeeActivitiesPage() {
    const table = $('#tblKegiatanKaryawan');
    if (!table) return;
    const addBtn = $('#btnAddKegiatanKaryawan');
    const tbody = table.querySelector('tbody');

    function getEmployeePicOptions(extraValues = []) {
      const employeeRows = Array.isArray(readList(LS.KAR, [])) ? readList(LS.KAR, []) : [];
      const names = employeeRows.map((row) => String(row?.name || '').trim()).filter(Boolean);
      const extra = Array.isArray(extraValues) ? extraValues.map((value) => String(value || '').trim()).filter(Boolean) : [];
      const merged = Array.from(new Set([...names, ...extra]));
      return merged.map((name) => ({ value: name, label: name }));
    }


    function render() {
      const rows = readList(LS.KEGIATAN_KARYAWAN, []);
      tbody.innerHTML = '';
      rows.forEach((item, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${escapeHtml(item.nama_kegiatan || '-')}</td>
        <td>${escapeHtml(item.tanggal_kegiatan || '-')}</td>
        <td>${escapeHtml(item.kategori || '-')}</td>
        <td>${escapeHtml(item.penyelenggara || '-')}</td>
        <td class="tdActions">
          <div class="d-flex justify-content-center gap-2">
            <button class="btn btn-sm btn-icon btn-primary" type="button" data-kgt-view="${escapeHtml(item.id)}" title="Lihat"><i class="bx bx-show"></i></button>
            <button class="btn btn-sm btn-icon btn-outline-primary" type="button" data-kgt-edit="${escapeHtml(item.id)}" title="Edit"><i class="bx bx-edit-alt"></i></button>
            <button class="btn btn-sm btn-icon btn-outline-danger" type="button" data-kgt-del="${escapeHtml(item.id)}" title="Hapus"><i class="bx bx-trash"></i></button>
          </div>
        </td>
      `.trim();
        tbody.appendChild(tr);
      });
    }

    function openModal(mode, data) {
      const id = 'ceoKegiatanKaryawanModal';
      const modalEl = ensureModal(id, `
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="ceoKgtTitle">Kegiatan Karyawan</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6"><label class="form-label">Nama Kegiatan</label><input id="ceoKgtNama" class="form-control" type="text" placeholder="Nama kegiatan" /></div>
              <div class="col-md-6"><label class="form-label">Penyelenggara/PIC</label><select id="ceoKgtPenyelenggara" class="form-select"></select></div>
              <div class="col-md-6"><label class="form-label">Peserta</label><input id="ceoKgtPeserta" class="form-control" type="text" placeholder="Nama peserta / divisi" /></div>
              <div class="col-md-6"><label class="form-label">Kategori</label><input id="ceoKgtKategori" class="form-control" type="text" placeholder="Training / Meeting / Workshop" /></div>
              <div class="col-md-6"><label class="form-label">Tanggal Kegiatan</label><input id="ceoKgtTanggal" class="form-control" type="date" /></div>
              <div class="col-md-6"><label class="form-label">Waktu Kegiatan</label><input id="ceoKgtWaktu" class="form-control" type="time" /></div>
              <input id="ceoKgtZona" type="hidden" value="WIB" />
              <div class="col-md-6"><label class="form-label">Gambar Sampul</label><input id="ceoKgtCover" class="form-control" type="file" accept="image/*" /></div>
              <div class="col-md-6"><label class="form-label">Preview Sampul</label><div class="border rounded-3 p-2 text-center bg-light-subtle"><img id="ceoKgtPreview" alt="Preview Sampul" src="" style="max-width:100%;max-height:180px;object-fit:cover;border-radius:12px;display:none;" /><div id="ceoKgtPreviewEmpty" class="text-muted small">Belum ada gambar</div></div></div>
              <div class="col-12"><label class="form-label">Deskripsi</label><textarea id="ceoKgtDeskripsi" class="form-control" rows="4" placeholder="Deskripsi kegiatan"></textarea></div>
              <div class="col-12"><div class="alert alert-info mb-0">Form tambah / edit / lihat tetap lengkap sesuai kebutuhan.</div></div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Tutup</button>
            <button type="button" class="btn btn-primary" id="ceoKgtSave">Simpan</button>
          </div>
        </div>
      </div>
    `);
      let currentCover = String(data?.gambar_sampul || '');
      const namaEl = $('#ceoKgtNama', modalEl);
      const penyelenggaraEl = $('#ceoKgtPenyelenggara', modalEl);
      const pesertaEl = $('#ceoKgtPeserta', modalEl);
      const kategoriEl = $('#ceoKgtKategori', modalEl);
      const tanggalEl = $('#ceoKgtTanggal', modalEl);
      const waktuEl = $('#ceoKgtWaktu', modalEl);
      const zonaEl = $('#ceoKgtZona', modalEl);
      const deskripsiEl = $('#ceoKgtDeskripsi', modalEl);
      const coverEl = $('#ceoKgtCover', modalEl);
      const previewEl = $('#ceoKgtPreview', modalEl);
      const previewEmptyEl = $('#ceoKgtPreviewEmpty', modalEl);
      const saveBtn = $('#ceoKgtSave', modalEl);
      setModalActionTitle($('#ceoKgtTitle', modalEl), mode);

      fillSelectOptions(
        penyelenggaraEl,
        getEmployeePicOptions([data?.penyelenggara]),
        'Pilih penyelenggara / PIC'
      );

      namaEl.value = String(data?.nama_kegiatan || '');
      penyelenggaraEl.value = String(data?.penyelenggara || '');
      pesertaEl.value = String(data?.peserta || '');
      kategoriEl.value = String(data?.kategori || '');
      tanggalEl.value = String(data?.tanggal_kegiatan || '');
      waktuEl.value = String(data?.waktu_kegiatan || '');
      zonaEl.value = String(data?.zona_waktu || 'WIB');
      deskripsiEl.value = String(data?.deskripsi || '');

      function updatePreview() {
        if (currentCover) {
          previewEl.src = currentCover;
          previewEl.style.display = '';
          previewEmptyEl.classList.add('d-none');
        } else {
          previewEl.removeAttribute('src');
          previewEl.style.display = 'none';
          previewEmptyEl.classList.remove('d-none');
        }
      }
      updatePreview();
      coverEl.onchange = () => {
        const file = coverEl.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          currentCover = String(reader.result || '');
          updatePreview();
        };
        reader.readAsDataURL(file);
      };

      if (mode === 'view') {
        ceoSetReadonlyFields(modalEl, true);
        saveBtn.classList.add('d-none');
      } else {
        ceoSetReadonlyFields(modalEl, false);
        saveBtn.classList.remove('d-none');
      }

      saveBtn.onclick = (event) => {
        event?.preventDefault?.();
        try {
          const payload = {
            id: data?.id || uid('kgt'),
            nama_kegiatan: String(namaEl.value || '').trim(),
            penyelenggara: String(penyelenggaraEl.value || '').trim(),
            peserta: String(pesertaEl.value || '').trim(),
            gambar_sampul: currentCover,
            kategori: String(kategoriEl.value || '').trim(),
            tanggal_kegiatan: String(tanggalEl.value || '').trim(),
            waktu_kegiatan: String(waktuEl.value || '').trim(),
            zona_waktu: String(zonaEl.value || 'WIB').trim(),
            deskripsi: String(deskripsiEl.value || '').trim(),
          };
          if (!payload.nama_kegiatan) {
            namaEl?.focus?.();
            return window.alert('Nama kegiatan wajib diisi.');
          }
          // Penyelenggara/PIC, tanggal, kategori, gambar, dan deskripsi dibuat opsional
          // agar Tambah Kegiatan tetap bisa disimpan walaupun master karyawan masih kosong.
          const rows = readList(LS.KEGIATAN_KARYAWAN, []);
          const safeRows = Array.isArray(rows) ? rows : [];
          const idx = safeRows.findIndex((x) => String(x.id) === String(payload.id));
          if (idx >= 0) safeRows[idx] = { ...safeRows[idx], ...payload };
          else safeRows.unshift(payload);
          writeList(LS.KEGIATAN_KARYAWAN, safeRows);
          syncKegiatanKaryawanCalendarEvent(payload);
          render();
          try { bootstrap.Modal.getOrCreateInstance(modalEl).hide(); } catch (err) { modalEl.classList.remove('show'); modalEl.style.display = 'none'; }
          if (typeof window.ceoToast === 'function') window.ceoToast(mode === 'edit' ? 'Kegiatan karyawan berhasil diperbarui.' : 'Kegiatan karyawan berhasil disimpan.');
        } catch (error) {
          console.error('Gagal menyimpan kegiatan karyawan:', error);
          window.alert('Gagal menyimpan kegiatan karyawan. Cek Console browser untuk detail error.');
        }
      };
      showModal(id);
      const titleInput = modalEl.querySelector('.modal-body input, .modal-body select, .modal-body textarea');
      window.setTimeout(() => titleInput?.focus?.(), 120);
    }

    addBtn?.addEventListener('click', () => openModal('add', null));
    table.addEventListener('click', (e) => {
      const rows = readList(LS.KEGIATAN_KARYAWAN, []);
      const viewBtn = e.target?.closest?.('button[data-kgt-view]');
      const editBtn = e.target?.closest?.('button[data-kgt-edit]');
      const delBtn = e.target?.closest?.('button[data-kgt-del]');
      if (viewBtn) {
        const cur = rows.find((x) => String(x.id) === String(viewBtn.getAttribute('data-kgt-view') || ''));
        if (cur) openModal('view', cur);
        return;
      }
      if (editBtn) {
        const cur = rows.find((x) => String(x.id) === String(editBtn.getAttribute('data-kgt-edit') || ''));
        if (cur) openModal('edit', cur);
        return;
      }
      if (delBtn) {
        const id = String(delBtn.getAttribute('data-kgt-del') || '');
        confirmDelete('Delete Kegiatan Karyawan ini?', () => {
          writeList(LS.KEGIATAN_KARYAWAN, rows.filter((x) => String(x.id) !== id));
          removeKegiatanKaryawanCalendarEvent(id);
          render();
        });
      }
    });
    render();
  }

  function initWorkShiftScenarioPage() {
    const table = $('#tblSkenarioJamKerja');
    if (!table) return;
    const addBtn = $('#btnAddSkenarioJamKerja');
    const tbody = table.querySelector('tbody');
    const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    function render() {
      const rows = readList(LS.SKENARIO_JAM_KERJA, []);
      tbody.innerHTML = '';
      rows.forEach((item, idx) => {
        const status = String(item.aktif || '').toLowerCase() === 'aktif' ? 'success' : 'secondary';
        const tr = document.createElement('tr');
        tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${escapeHtml(item.nama_shift || '-')}</td>
        <td><span class="badge bg-label-${status}">${escapeHtml(item.aktif || '-')}</span></td>
        <td class="tdActions">
          <div class="d-flex justify-content-center gap-2">
            <button class="btn btn-sm btn-icon btn-primary" type="button" data-shift-view="${escapeHtml(item.id)}" title="Lihat"><i class="bx bx-show"></i></button>
            <button class="btn btn-sm btn-icon btn-outline-primary" type="button" data-shift-edit="${escapeHtml(item.id)}" title="Edit"><i class="bx bx-edit-alt"></i></button>
            <button class="btn btn-sm btn-icon btn-outline-danger" type="button" data-shift-del="${escapeHtml(item.id)}" title="Hapus"><i class="bx bx-trash"></i></button>
          </div>
        </td>
      `.trim();
        tbody.appendChild(tr);
      });
    }

    function normalizeSchedules(data) {
      const legacyDays = new Set(ensureArr(data?.hari));
      const rawSchedules = ensureArr(data?.jadwal_hari);
      return DAY_NAMES.map((day) => {
        const existing = rawSchedules.find((item) => String(item?.hari || '') === day) || {};
        const aktif = typeof existing.aktif === 'boolean'
          ? existing.aktif
          : legacyDays.has(day);
        return {
          hari: day,
          aktif,
          jam_check_in: String(existing.jam_check_in || (aktif ? data?.jam_check_in || '' : '')).trim(),
          jam_check_out: String(existing.jam_check_out || (aktif ? data?.jam_check_out || '' : '')).trim(),
          jam_istirahat: String(existing.jam_istirahat || (aktif ? data?.jam_istirahat || '' : '')).trim(),
          selesai_istirahat: String(existing.selesai_istirahat || (aktif ? data?.selesai_istirahat || '' : '')).trim(),
          toleransi_keterlambatan: String(existing.toleransi_keterlambatan || (aktif ? data?.toleransi_keterlambatan || '' : '')).trim(),
          denda_keterlambatan: String(existing.denda_keterlambatan || (aktif ? data?.denda_keterlambatan || '' : '')).trim(),
        };
      });
    }

    function rowFieldValue(tr, selector) {
      return String($(selector, tr)?.value || '').trim();
    }

    function readFileAsDataUrl(file) {
      return new Promise((resolve) => {
        if (!file) return resolve('');
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      });
    }

    function compressImageFileToDataUrl(file, options = {}) {
      const maxSide = Number(options.maxSide || 900);
      const quality = Number(options.quality || 0.72);

      return new Promise((resolve) => {
        if (!file || !String(file.type || '').startsWith('image/')) return resolve('');

        const reader = new FileReader();
        reader.onerror = () => resolve('');
        reader.onload = () => {
          const img = new Image();
          img.onerror = () => resolve('');
          img.onload = () => {
            try {
              const ratio = Math.min(1, maxSide / Math.max(img.width || 1, img.height || 1));
              const width = Math.max(1, Math.round((img.width || 1) * ratio));
              const height = Math.max(1, Math.round((img.height || 1) * ratio));

              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;

              const ctx = canvas.getContext('2d');
              if (!ctx) return resolve('');

              ctx.drawImage(img, 0, 0, width, height);
              let dataUrl = canvas.toDataURL('image/jpeg', quality);

              // Batas aman localStorage. Kalau masih terlalu besar, turunkan ukuran lagi.
              if (dataUrl.length > 450000) {
                const smallerRatio = Math.min(1, 650 / Math.max(img.width || 1, img.height || 1));
                canvas.width = Math.max(1, Math.round((img.width || 1) * smallerRatio));
                canvas.height = Math.max(1, Math.round((img.height || 1) * smallerRatio));
                const ctx2 = canvas.getContext('2d');
                if (!ctx2) return resolve('');
                ctx2.drawImage(img, 0, 0, canvas.width, canvas.height);
                dataUrl = canvas.toDataURL('image/jpeg', 0.62);
              }

              resolve(dataUrl.length <= 450000 ? dataUrl : '');
            } catch (err) {
              console.warn('Gagal kompres gambar, file dilewati agar data karyawan tetap tersimpan.', err);
              resolve('');
            }
          };
          img.src = String(reader.result || '');
        };
        reader.readAsDataURL(file);
      });
    }

    function createStoredFilePayload(file, fallbackName = '') {
      if (!file) return Promise.resolve({ name: String(fallbackName || '').trim(), data_url: '' });

      const fileName = String(file.name || fallbackName || '').trim();

      // PDF/file besar tidak disimpan sebagai base64 ke localStorage supaya Simpan Karyawan tidak gagal.
      if (!String(file.type || '').startsWith('image/')) {
        return Promise.resolve({ name: fileName, data_url: '' });
      }

      return compressImageFileToDataUrl(file).then((dataUrl) => ({
        name: fileName,
        data_url: dataUrl,
      }));
    }

    function stripEmployeeFileData(row) {
      const next = { ...(row || {}) };
      [
        'photo_data_url',
        'foto_karyawan_data_url',
        'foto_data_url',
        'file_kk_data_url',
        'kartu_keluarga_data_url',
        'kk_data_url',
        'file_identity_data_url',
        'ktp_data_url',
        'file_ktp_data_url'
      ].forEach((key) => {
        if (key in next) next[key] = '';
      });
      return next;
    }

    function safeWriteEmployees(rows) {
      try {
        writeList(LS.KAR, rows);
        return { rows, stripped: false };
      } catch (err) {
        console.warn('localStorage penuh / gagal menyimpan file karyawan. Data teks tetap disimpan tanpa preview file.', err);
        const slimRows = (Array.isArray(rows) ? rows : []).map(stripEmployeeFileData);
        writeList(LS.KAR, slimRows);
        return { rows: slimRows, stripped: true };
      }
    }

    function maskPassword(value) {
      return String(value || '').trim() ? '••••••••' : '-';
    }

    function ensureFilePreviewControl(inputId, linkId) {
      const input = document.getElementById(inputId);
      const link = document.getElementById(linkId);
      if (!input || !link) return;
      const dataUrl = String(input.dataset.fileUrl || '').trim();
      if (!dataUrl) {
        link.classList.add('d-none');
        return;
      }
      link.classList.remove('d-none');
      link.href = dataUrl;
      link.target = '_blank';
      link.rel = 'noopener';
    }

    function setScheduleRowState(tr, readOnly) {
      const isActive = !!$('.ceo-shift-day-active', tr)?.checked;
      Array.from(tr.querySelectorAll('.ceo-shift-row-input')).forEach((input) => {
        input.disabled = readOnly || !isActive;
      });
      tr.classList.toggle('opacity-75', !isActive);
    }

    function renderScheduleRows(tbodyEl, schedules, readOnly) {
      tbodyEl.innerHTML = schedules.map((item, idx) => `
      <tr data-day="${escapeHtml(item.hari)}">
        <td class="text-center align-middle">
          <div class="form-check d-inline-flex justify-content-center m-0">
            <input class="form-check-input ceo-shift-day-active" type="checkbox" id="ceoShiftDayActive_${idx}" ${item.aktif ? 'checked' : ''} ${readOnly ? 'disabled' : ''} />
          </div>
        </td>
        <td class="align-middle fw-semibold">${escapeHtml(item.hari)}</td>
        <td><input class="form-control form-control-sm ceo-shift-row-input" type="time" value="${escapeHtml(item.jam_check_in)}" ${readOnly ? 'disabled' : ''} /></td>
        <td><input class="form-control form-control-sm ceo-shift-row-input" type="time" value="${escapeHtml(item.jam_check_out)}" ${readOnly ? 'disabled' : ''} /></td>
        <td><input class="form-control form-control-sm ceo-shift-row-input" type="time" value="${escapeHtml(item.jam_istirahat)}" ${readOnly ? 'disabled' : ''} /></td>
        <td><input class="form-control form-control-sm ceo-shift-row-input" type="time" value="${escapeHtml(item.selesai_istirahat)}" ${readOnly ? 'disabled' : ''} /></td>
        <td><input class="form-control form-control-sm ceo-shift-row-input" type="number" min="0" placeholder="0" value="${escapeHtml(item.toleransi_keterlambatan)}" ${readOnly ? 'disabled' : ''} /></td>
        <td><input class="form-control form-control-sm ceo-shift-row-input" type="number" min="0" placeholder="0" value="${escapeHtml(item.denda_keterlambatan)}" ${readOnly ? 'disabled' : ''} /></td>
      </tr>
    `).join('');

      Array.from(tbodyEl.querySelectorAll('tr')).forEach((tr) => {
        const checkbox = $('.ceo-shift-day-active', tr);
        setScheduleRowState(tr, readOnly);
        checkbox?.addEventListener('change', () => setScheduleRowState(tr, readOnly));
      });
    }

    function collectSchedules(tbodyEl) {
      return Array.from(tbodyEl.querySelectorAll('tr')).map((tr) => ({
        hari: String(tr.getAttribute('data-day') || '').trim(),
        aktif: !!$('.ceo-shift-day-active', tr)?.checked,
        jam_check_in: rowFieldValue(tr, 'td:nth-child(3) input'),
        jam_check_out: rowFieldValue(tr, 'td:nth-child(4) input'),
        jam_istirahat: rowFieldValue(tr, 'td:nth-child(5) input'),
        selesai_istirahat: rowFieldValue(tr, 'td:nth-child(6) input'),
        toleransi_keterlambatan: rowFieldValue(tr, 'td:nth-child(7) input'),
        denda_keterlambatan: rowFieldValue(tr, 'td:nth-child(8) input'),
      }));
    }

    function openModal(mode, data) {
      const id = 'ceoShiftScenarioModal';
      const modalEl = ensureModal(id, `
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="ceoShiftTitle">Skenario Jam Kerja</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-8"><label class="form-label">Nama Shift</label><input id="ceoShiftName" class="form-control" type="text" placeholder="Contoh: Shift Pagi" /></div>
              <div class="col-md-4"><label class="form-label">Status</label><select id="ceoShiftActive" class="form-select"><option value="Aktif">Aktif</option><option value="Nonaktif">Nonaktif</option></select></div>
              <div class="col-12">
                <label class="form-label d-block mb-2">Pengaturan Hari</label>
                <div class="table-responsive">
                  <table class="table table-bordered align-middle bm-shift-config-table mb-0">
                    <thead>
                      <tr>
                        <th class="text-center" style="width:88px">Aktif</th>
                        <th style="min-width:120px">Hari</th>
                        <th style="min-width:140px">Jam Check In</th>
                        <th style="min-width:140px">Jam Check Out</th>
                        <th style="min-width:140px">Jam Istirahat</th>
                        <th style="min-width:160px">Selesai Istirahat</th>
                        <th style="min-width:180px">Toleransi Keterlambatan (Menit)</th>
                        <th style="min-width:170px">Denda Keterlambatan</th>
                      </tr>
                    </thead>
                    <tbody id="ceoShiftScheduleRows"></tbody>
                  </table>
                </div>
              </div>
              <div class="col-12"><div class="alert alert-info mb-0">Hari ditampilkan dari <b>Minggu sampai Sabtu</b> ke bawah. Status aktif tiap hari menggunakan <b>tombol ceklis</b>, sesuai contoh yang Anda minta.</div></div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Tutup</button>
            <button type="button" class="btn btn-primary" id="ceoShiftSave">Simpan</button>
          </div>
        </div>
      </div>
    `);
      const nameEl = $('#ceoShiftName', modalEl);
      const activeEl = $('#ceoShiftActive', modalEl);
      const scheduleBody = $('#ceoShiftScheduleRows', modalEl);
      const saveBtn = $('#ceoShiftSave', modalEl);
      setModalActionTitle($('#ceoShiftTitle', modalEl), mode);
      nameEl.value = String(data?.nama_shift || '');
      activeEl.value = String(data?.aktif || 'Aktif');
      renderScheduleRows(scheduleBody, normalizeSchedules(data), mode === 'view');
      if (mode === 'view') {
        ceoSetReadonlyFields(modalEl, true);
        saveBtn.classList.add('d-none');
      } else {
        ceoSetReadonlyFields(modalEl, false);
        saveBtn.classList.remove('d-none');
      }
      saveBtn.onclick = () => {
        const jadwalHari = collectSchedules(scheduleBody);
        const hariAktif = jadwalHari.filter((item) => item.aktif);
        if (!String(nameEl.value || '').trim()) return window.alert('Nama shift wajib diisi.');
        if (!hariAktif.length) return window.alert('Pilih minimal satu hari aktif.');

        const firstActive = hariAktif[0] || {};
        const payload = {
          id: data?.id || uid('shift'),
          nama_shift: String(nameEl.value || '').trim(),
          aktif: String(activeEl.value || 'Aktif').trim(),
          hari: hariAktif.map((item) => item.hari),
          jadwal_hari: jadwalHari,
          jam_check_in: String(firstActive.jam_check_in || '').trim(),
          jam_check_out: String(firstActive.jam_check_out || '').trim(),
          jam_istirahat: String(firstActive.jam_istirahat || '').trim(),
          selesai_istirahat: String(firstActive.selesai_istirahat || '').trim(),
          toleransi_keterlambatan: String(firstActive.toleransi_keterlambatan || '').trim(),
          denda_keterlambatan: String(firstActive.denda_keterlambatan || '').trim(),
        };
        const rows = readList(LS.SKENARIO_JAM_KERJA, []);
        const idx = rows.findIndex((x) => String(x.id) === String(payload.id));
        if (idx >= 0) rows[idx] = { ...rows[idx], ...payload };
        else rows.unshift(payload);
        writeList(LS.SKENARIO_JAM_KERJA, rows);
        bootstrap.Modal.getOrCreateInstance(modalEl).hide();
        render();
      };
      showModal(id);
      const titleInput = modalEl.querySelector('.modal-body input, .modal-body select, .modal-body textarea');
      window.setTimeout(() => titleInput?.focus?.(), 120);
    }

    addBtn?.addEventListener('click', () => openModal('add', null));
    table.addEventListener('click', (e) => {
      const rows = readList(LS.SKENARIO_JAM_KERJA, []);
      const viewBtn = e.target?.closest?.('button[data-shift-view]');
      const editBtn = e.target?.closest?.('button[data-shift-edit]');
      const delBtn = e.target?.closest?.('button[data-shift-del]');
      if (viewBtn) {
        const cur = rows.find((x) => String(x.id) === String(viewBtn.getAttribute('data-shift-view') || ''));
        if (cur) openModal('view', cur);
        return;
      }
      if (editBtn) {
        const cur = rows.find((x) => String(x.id) === String(editBtn.getAttribute('data-shift-edit') || ''));
        if (cur) openModal('edit', cur);
        return;
      }
      if (delBtn) {
        const id = String(delBtn.getAttribute('data-shift-del') || '');
        confirmDelete('Delete Skenario Jam Kerja ini?', () => {
          writeList(LS.SKENARIO_JAM_KERJA, rows.filter((x) => String(x.id) !== id));
          render();
        });
      }
    });
    render();
  }





  // --------------------------------------------------------------
  // BM RRK / Report Pengerjaan - Gate bertahap organisasi
  // Alur: Sub Perusahaan -> Divisi -> Jabatan (+ nama karyawan) -> Tabel fitur
  // --------------------------------------------------------------
  const BM_RRK_KEY = 'bmRrkRowsV1';
  const BM_REPORT_KEY = 'bmReportPengerjaanRowsV1';

  function bmStatusBadgeClass(value) {
    const raw = String(value || '').trim().toLowerCase();
    if (!raw) return 'secondary';
    if (raw.includes('selesai') || raw.includes('disetujui')) return 'success';
    if (raw.includes('proses') || raw.includes('sedang')) return 'primary';
    if (raw.includes('pending') || raw.includes('revisi') || raw.includes('rendah')) return 'warning';
    if (raw.includes('tinggi') || raw.includes('mendesak') || raw.includes('tolak')) return 'danger';
    return 'secondary';
  }

  function bmActiveRows(rows) {
    return (Array.isArray(rows) ? rows : []).filter((row) => {
      const status = String(row?.status || row?.active_status || 'Aktif').trim().toLowerCase();
      return !status || status === 'aktif' || status === 'active';
    });
  }

  function bmEmployeesForJabatan(jabatanId) {
    const id = String(jabatanId || '').trim();
    if (!id) return [];
    return bmActiveRows(readList(LS.KAR, [])).filter((emp) => {
      const ids = empJabatanIds(emp).map((x) => String(x || '').trim());
      return ids.includes(id);
    });
  }

  function bmEmployeeNamesForJabatan(jabatanId) {
    const names = bmEmployeesForJabatan(jabatanId)
      .map((emp) => String(emp?.name || emp?.nama_karyawan || emp?.employee_no || '').trim())
      .filter(Boolean);

    if (names.length) return names;

    const job = readList(LS.JABATAN, []).find((row) => String(row?.id || '') === String(jabatanId || ''));
    return getJabatanStaffNames(job).map((name) => String(name || '').trim()).filter(Boolean);
  }

  function bmJabatanNameWithEmployeeHtml(jabatanId) {
    const jobName = getJabatanName(jabatanId) || '-';
    const names = bmEmployeeNamesForJabatan(jabatanId);
    const employeeText = names.length ? names.join(', ') : 'Belum ada karyawan';
    return `
      <span class="bm-jabatan-employee">
        <strong>${escapeHtml(jobName)}</strong>
        <small>${escapeHtml(employeeText)}</small>
      </span>
    `.trim();
  }

  function bmGetRrkTitle(rrk) {
    const text = String(rrk?.rancangan_rencana || '').replace(/\s+/g, ' ').trim();
    if (!text) return '-';
    return text.length > 58 ? `${text.slice(0, 58)}...` : text;
  }

  function bmFirstOrgPath() {
    const subs = bmActiveRows(readList(LS.SUB, []));
    const divs = bmActiveRows(readList(LS.DIVISI, []));
    const jobs = bmActiveRows(readList(LS.JABATAN, []));
    const sub = subs[0] || null;
    const div = sub ? (divs.find((row) => String(row.sub_id || '') === String(sub.id || '')) || divs[0]) : (divs[0] || null);
    const job = div ? (jobs.find((row) => String(row.divisi_id || '') === String(div.id || '')) || jobs[0]) : (jobs[0] || null);
    return {
      sub_id: sub?.id || job?.sub_id || div?.sub_id || '',
      divisi_id: div?.id || job?.divisi_id || '',
      jabatan_id: job?.id || '',
    };
  }

  function bmOrgPathFromJob(job) {
    const fallback = bmFirstOrgPath();
    return {
      sub_id: String(job?.sub_id || fallback.sub_id || '').trim(),
      divisi_id: String(job?.divisi_id || fallback.divisi_id || '').trim(),
      jabatan_id: String(job?.id || fallback.jabatan_id || '').trim(),
    };
  }

  function bmEnsureRrkRows() {
    const stored = readList(BM_RRK_KEY, null);
    if (Array.isArray(stored)) return stored;
    const org = bmFirstOrgPath();
    const demoRows = [
      {
        id: 'rrk_demo_1',
        ...org,
        rancangan_rencana: 'Menyusun rencana kerja mingguan untuk monitoring progres tim.',
        tingkat_urgensi: 'Tinggi',
      },
      {
        id: 'rrk_demo_2',
        ...org,
        rancangan_rencana: 'Melakukan evaluasi hasil pekerjaan dan menyiapkan laporan follow up.',
        tingkat_urgensi: 'Sedang',
      },
    ];
    writeList(BM_RRK_KEY, demoRows);
    return demoRows;
  }

  function bmEnsureReportRows() {
    const stored = readList(BM_REPORT_KEY, null);
    if (Array.isArray(stored)) return stored;
    const org = bmFirstOrgPath();
    const rrkRows = bmEnsureRrkRows();
    const demoRows = [
      {
        id: 'report_demo_1',
        ...org,
        tanggal: todayISO(),
        rrk_id: rrkRows[0]?.id || '',
        pekerjaan: 'Mengecek progres pekerjaan harian dan memastikan tugas prioritas berjalan.',
        kendala: 'Tidak ada kendala besar.',
        keterangan: 'Progress berjalan sesuai rencana.',
        link: '',
        status: 'Proses',
      },
      {
        id: 'report_demo_2',
        ...org,
        tanggal: addDaysISO(todayISO(), -1),
        rrk_id: rrkRows[1]?.id || rrkRows[0]?.id || '',
        pekerjaan: 'Merapihkan hasil pengerjaan dan menyiapkan bahan evaluasi.',
        kendala: 'Butuh konfirmasi minor dari PIC.',
        keterangan: 'Menunggu feedback lanjutan.',
        link: '',
        status: 'Pending',
      },
    ];
    writeList(BM_REPORT_KEY, demoRows);
    return demoRows;
  }

  function bmEnsureRrkRowsForPath(path) {
    const rows = bmEnsureRrkRows();
    const jabatanId = String(path?.jabatan_id || '').trim();
    if (!jabatanId) return rows;
    const hasRowsForPath = rows.some((row) => String(row?.jabatan_id || '') === jabatanId);
    if (hasRowsForPath) return rows;

    const demoRows = [
      {
        id: `rrk_demo_${jabatanId}_1`,
        sub_id: String(path?.sub_id || '').trim(),
        divisi_id: String(path?.divisi_id || '').trim(),
        jabatan_id: jabatanId,
        rancangan_rencana: 'Menyusun rencana kerja mingguan untuk monitoring progres tim.',
        tingkat_urgensi: 'Tinggi',
      },
      {
        id: `rrk_demo_${jabatanId}_2`,
        sub_id: String(path?.sub_id || '').trim(),
        divisi_id: String(path?.divisi_id || '').trim(),
        jabatan_id: jabatanId,
        rancangan_rencana: 'Melakukan evaluasi hasil pekerjaan dan menyiapkan laporan follow up.',
        tingkat_urgensi: 'Sedang',
      },
    ];
    const nextRows = [...demoRows, ...rows];
    writeList(BM_RRK_KEY, nextRows);
    return nextRows;
  }

  function bmEnsureReportRowsForPath(path) {
    const rows = bmEnsureReportRows();
    const jabatanId = String(path?.jabatan_id || '').trim();
    if (!jabatanId) return rows;
    const hasRowsForPath = rows.some((row) => String(row?.jabatan_id || '') === jabatanId);
    if (hasRowsForPath) return rows;

    const rrkRows = bmEnsureRrkRowsForPath(path).filter((rrk) => String(rrk?.jabatan_id || '') === jabatanId);
    const demoRows = [
      {
        id: `report_demo_${jabatanId}_1`,
        sub_id: String(path?.sub_id || '').trim(),
        divisi_id: String(path?.divisi_id || '').trim(),
        jabatan_id: jabatanId,
        tanggal: todayISO(),
        rrk_id: rrkRows[0]?.id || '',
        pekerjaan: 'Mengecek progres pekerjaan harian dan memastikan tugas prioritas berjalan.',
        kendala: 'Tidak ada kendala besar.',
        keterangan: 'Progress berjalan sesuai rencana.',
        link: '',
        status: 'Proses',
      },
      {
        id: `report_demo_${jabatanId}_2`,
        sub_id: String(path?.sub_id || '').trim(),
        divisi_id: String(path?.divisi_id || '').trim(),
        jabatan_id: jabatanId,
        tanggal: addDaysISO(todayISO(), -1),
        rrk_id: rrkRows[1]?.id || rrkRows[0]?.id || '',
        pekerjaan: 'Merapihkan hasil pengerjaan dan menyiapkan bahan evaluasi.',
        kendala: 'Butuh konfirmasi minor dari PIC.',
        keterangan: 'Menunggu feedback lanjutan.',
        link: '',
        status: 'Pending',
      },
    ];
    const nextRows = [...demoRows, ...rows];
    writeList(BM_REPORT_KEY, nextRows);
    return nextRows;
  }


  function bmOptionLabel(row, fallback = '-') {
    const code = String(row?.code || '').trim();
    const name = String(row?.name || row?.nama || '').trim() || fallback;
    return code ? `${code} - ${name}` : name;
  }

  function bmFillOrgCascade(root, data = {}, onChange) {
    const subEl = $('.bmCascadeSub', root);
    const divEl = $('.bmCascadeDivisi', root);
    const jabEl = $('.bmCascadeJabatan', root);
    const subs = bmActiveRows(readList(LS.SUB, []));
    const divs = bmActiveRows(readList(LS.DIVISI, []));
    const jobs = bmActiveRows(readList(LS.JABATAN, []));

    const initial = {
      sub_id: String(data?.sub_id || '').trim(),
      divisi_id: String(data?.divisi_id || '').trim(),
      jabatan_id: String(data?.jabatan_id || '').trim(),
    };

    function fillSubs() {
      fillSelectOptions(subEl, subs.map((row) => ({ value: row.id, label: bmOptionLabel(row, 'Sub Perusahaan') })), 'Pilih sub perusahaan');
      if (initial.sub_id && subs.some((row) => String(row.id) === initial.sub_id)) subEl.value = initial.sub_id;
      else if (subs[0]) subEl.value = subs[0].id;
    }

    function fillDivs() {
      const subId = String(subEl?.value || '').trim();
      const filtered = divs.filter((row) => !subId || String(row.sub_id || '') === subId);
      fillSelectOptions(divEl, filtered.map((row) => ({ value: row.id, label: bmOptionLabel(row, 'Divisi') })), 'Pilih divisi');
      if (initial.divisi_id && filtered.some((row) => String(row.id) === initial.divisi_id)) divEl.value = initial.divisi_id;
      else if (filtered[0]) divEl.value = filtered[0].id;
    }

    function fillJobs() {
      const subId = String(subEl?.value || '').trim();
      const divId = String(divEl?.value || '').trim();
      const filtered = jobs.filter((row) => {
        const okSub = !subId || String(row.sub_id || '') === subId;
        const okDiv = !divId || String(row.divisi_id || '') === divId;
        return okSub && okDiv;
      });
      fillSelectOptions(jabEl, filtered.map((row) => ({
        value: row.id,
        label: `${bmOptionLabel(row, 'Jabatan')} — ${bmEmployeeNamesForJabatan(row.id).join(', ') || 'Belum ada karyawan'}`,
      })), 'Pilih jabatan');
      if (initial.jabatan_id && filtered.some((row) => String(row.id) === initial.jabatan_id)) jabEl.value = initial.jabatan_id;
      else if (filtered[0]) jabEl.value = filtered[0].id;
      if (typeof onChange === 'function') onChange();
    }

    fillSubs();
    fillDivs();
    fillJobs();

    subEl?.addEventListener('change', () => {
      initial.divisi_id = '';
      initial.jabatan_id = '';
      fillDivs();
      fillJobs();
    });
    divEl?.addEventListener('change', () => {
      initial.jabatan_id = '';
      fillJobs();
    });
    jabEl?.addEventListener('change', () => {
      if (typeof onChange === 'function') onChange();
    });

    return { subEl, divEl, jabEl };
  }

  function bmInitFeatureGate({ tableCard, featureTitle = 'Fitur', onSelect, onReset } = {}) {
    if (!tableCard) return null;

    tableCard.classList.add('bm-gated-table-card');

    let selectedSubId = '';
    let selectedDivId = '';
    let selectedJabatanId = '';

    const gate = document.createElement('div');
    gate.className = 'card bm-feature-gate mb-4';
    gate.innerHTML = `
      <div class="card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <h5 class="mb-0">Pilih Akses ${escapeHtml(featureTitle)}</h5>
          <small class="text-muted">Pilih bertahap: Sub Perusahaan → Divisi → Jabatan.</small>
        </div>
        <button class="btn btn-sm btn-outline-secondary d-none" type="button" data-bm-gate-reset>Ganti Pilihan</button>
      </div>
      <div class="card-body">
        <div class="bm-feature-gate__selected mb-3" data-bm-gate-summary></div>
        <div class="bm-feature-gate__choice-panel" data-bm-gate-choice-panel>
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <div>
              <span class="badge bg-label-primary mb-1">Pilih Tahapan</span>
              <h6 class="mb-0" data-bm-gate-step-title>Pilih data</h6>
            </div>
            <small class="text-muted">Klik pilihan di bawah, lalu lanjut ke tahap berikutnya.</small>
          </div>
          <div class="bm-feature-gate__grid" data-bm-gate-grid></div>
          <div class="bm-feature-gate__empty d-none" data-bm-gate-empty></div>
        </div>
      </div>
    `.trim();

    tableCard.parentNode?.insertBefore(gate, tableCard);

    const grid = $('[data-bm-gate-grid]', gate);
    const empty = $('[data-bm-gate-empty]', gate);
    const summary = $('[data-bm-gate-summary]', gate);
    const choicePanel = $('[data-bm-gate-choice-panel]', gate);
    const stepTitleEl = $('[data-bm-gate-step-title]', gate);
    const resetBtn = $('[data-bm-gate-reset]', gate);

    function rows() {
      return {
        subs: bmActiveRows(readList(LS.SUB, [])),
        divs: bmActiveRows(readList(LS.DIVISI, [])),
        jobs: bmActiveRows(readList(LS.JABATAN, [])),
      };
    }

    function selectedPath() {
      return {
        sub_id: selectedSubId,
        divisi_id: selectedDivId,
        jabatan_id: selectedJabatanId,
      };
    }

    function showTable(show) {
      tableCard.classList.toggle('d-none', !show);
    }

    function renderSummary() {
      const steps = [
        {
          no: 1,
          key: 'sub',
          label: 'Sub Perusahaan',
          done: !!selectedSubId,
          clickable: true,
          valueHtml: escapeHtml(selectedSubId ? getSubCompanyName(selectedSubId) : 'Pilih sub perusahaan'),
        },
        {
          no: 2,
          key: 'divisi',
          label: 'Divisi',
          done: !!selectedDivId,
          clickable: !!selectedSubId,
          valueHtml: escapeHtml(selectedDivId ? getDivisiName(selectedDivId) : 'Pilih divisi'),
        },
        {
          no: 3,
          key: 'jabatan',
          label: 'Jabatan / Karyawan',
          done: !!selectedJabatanId,
          clickable: !!selectedDivId,
          valueHtml: selectedJabatanId ? bmJabatanNameWithEmployeeHtml(selectedJabatanId) : 'Pilih jabatan / karyawan',
        },
      ];

      summary.innerHTML = steps.map((step) => `
        <div class="${step.done ? 'is-done' : 'is-pending'} ${step.clickable ? 'is-clickable' : 'is-disabled'}" role="${step.clickable ? 'button' : 'presentation'}" tabindex="${step.clickable ? '0' : '-1'}" data-bm-gate-jump="${step.clickable ? step.key : ''}">
          <span class="bm-feature-gate__step-badge">${step.done ? '<i class="bx bx-check"></i>' : step.no}</span>
          <span class="bm-feature-gate__step-label">${escapeHtml(step.label)}</span>
          <strong>${step.valueHtml}</strong>
        </div>
      `).join('');
    }

    function buttonHtml(kind, id, titleHtml, subtitle = '') {
      return `
        <button class="bm-feature-gate__btn" type="button" data-bm-gate-kind="${escapeHtml(kind)}" data-bm-gate-id="${escapeHtml(id)}">
          <span>${titleHtml}</span>
          ${subtitle ? `<small>${escapeHtml(subtitle)}</small>` : ''}
        </button>
      `.trim();
    }

    function render() {
      const data = rows();
      let html = '';
      let stepTitle = '';

      resetBtn.classList.toggle('d-none', !(selectedSubId || selectedDivId || selectedJabatanId));
      renderSummary();

      if (!selectedSubId) {
        showTable(false);
        stepTitle = '1. Pilih Sub Perusahaan';
        html = data.subs.map((sub) => {
          const totalDivisi = data.divs.filter((div) => String(div.sub_id || '') === String(sub.id || '')).length;
          return buttonHtml('sub', sub.id, escapeHtml(sub.name || 'Sub Perusahaan'), `${totalDivisi} divisi tersedia`);
        }).join('');
      } else if (!selectedDivId) {
        showTable(false);
        stepTitle = '2. Pilih Divisi';
        const filtered = data.divs.filter((div) => String(div.sub_id || '') === String(selectedSubId));
        html = filtered.map((div) => {
          const totalJabatan = data.jobs.filter((job) => String(job.divisi_id || '') === String(div.id || '')).length;
          return buttonHtml('divisi', div.id, escapeHtml(div.name || 'Divisi'), `${totalJabatan} jabatan tersedia`);
        }).join('');
      } else if (!selectedJabatanId) {
        showTable(false);
        stepTitle = '3. Pilih Jabatan';
        const filtered = data.jobs.filter((job) => String(job.divisi_id || '') === String(selectedDivId));
        html = filtered.map((job) => {
          const count = bmEmployeeNamesForJabatan(job.id).length;
          return buttonHtml('jabatan', job.id, bmJabatanNameWithEmployeeHtml(job.id), `${count || 0} karyawan`);
        }).join('');
      } else {
        showTable(true);
        stepTitle = `4. ${featureTitle} siap ditampilkan`;
        html = '';
        if (typeof onSelect === 'function') onSelect(selectedPath());
      }

      const headerSmall = gate.querySelector('.card-header small');
      if (headerSmall) headerSmall.textContent = stepTitle;
      if (stepTitleEl) stepTitleEl.textContent = stepTitle;
      choicePanel?.classList.toggle('d-none', !!selectedJabatanId);
      grid.classList.toggle('d-none', !html);
      grid.innerHTML = html;
      empty.classList.toggle('d-none', !!html || !!selectedJabatanId);
      if (!html && !selectedJabatanId) {
        empty.textContent = 'Data belum tersedia untuk pilihan ini. Silakan tambahkan data Sub Perusahaan, Divisi, Jabatan, dan Karyawan terlebih dahulu.';
      }
    }

    function jumpToStep(step) {
      const key = String(step || '').trim();
      if (key === 'sub') {
        selectedSubId = '';
        selectedDivId = '';
        selectedJabatanId = '';
      } else if (key === 'divisi' && selectedSubId) {
        selectedDivId = '';
        selectedJabatanId = '';
      } else if (key === 'jabatan' && selectedDivId) {
        selectedJabatanId = '';
      } else {
        return;
      }
      showTable(false);
      if (typeof onReset === 'function') onReset();
      render();
    }

    summary?.addEventListener('click', (event) => {
      const card = event.target.closest('[data-bm-gate-jump]');
      if (!card) return;
      jumpToStep(card.getAttribute('data-bm-gate-jump'));
    });

    summary?.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const card = event.target.closest('[data-bm-gate-jump]');
      if (!card) return;
      event.preventDefault();
      jumpToStep(card.getAttribute('data-bm-gate-jump'));
    });

    grid.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-bm-gate-kind]');
      if (!btn) return;
      const kind = String(btn.getAttribute('data-bm-gate-kind') || '');
      const id = String(btn.getAttribute('data-bm-gate-id') || '');
      if (kind === 'sub') {
        selectedSubId = id;
        selectedDivId = '';
        selectedJabatanId = '';
      } else if (kind === 'divisi') {
        selectedDivId = id;
        selectedJabatanId = '';
      } else if (kind === 'jabatan') {
        selectedJabatanId = id;
      }
      render();
    });

    resetBtn?.addEventListener('click', () => {
      selectedSubId = '';
      selectedDivId = '';
      selectedJabatanId = '';
      showTable(false);
      if (typeof onReset === 'function') onReset();
      render();
    });

    showTable(false);
    render();
    return {
      element: gate,
      reset() {
        selectedSubId = '';
        selectedDivId = '';
        selectedJabatanId = '';
        if (typeof onReset === 'function') onReset();
        render();
      },
      getPath: selectedPath,
    };
  }

  function initBmRrkPage() {
    const table = document.getElementById('tblRrk');
    if (!table) return;
    const tableCard = table.closest('.card');
    const addBtn = tableCard?.querySelector('.crud-add-btn');
    const tbody = table.querySelector('tbody');
    let activePath = null;

    function visibleRows(rows) {
      if (!activePath?.jabatan_id) return [];
      return rows.filter((row) => String(row.jabatan_id || '') === String(activePath.jabatan_id));
    }

    function render() {
      const rows = visibleRows(bmEnsureRrkRowsForPath(activePath));
      if (!rows.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">Belum ada data RRK untuk jabatan ini.</td></tr>';
        return;
      }
      tbody.innerHTML = rows.map((row, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td class="text-start">${escapeHtml(row.rancangan_rencana || '-')}</td>
          <td><span class="badge bg-label-${bmStatusBadgeClass(row.tingkat_urgensi)}">${escapeHtml(row.tingkat_urgensi || '-')}</span></td>
          <td class="tdActions">
            <div class="d-flex justify-content-center gap-2">
              <button class="btn btn-sm btn-icon btn-primary" type="button" data-bm-rrk-view="${escapeHtml(row.id)}" title="Lihat" aria-label="Lihat"><i class="bx bx-show"></i></button>
              <button class="btn btn-sm btn-icon btn-outline-danger" type="button" data-bm-rrk-del="${escapeHtml(row.id)}" title="Hapus" aria-label="Hapus"><i class="bx bx-trash"></i></button>
            </div>
          </td>
        </tr>
      `.trim()).join('');
      (window.ceoRefreshCrudActions || function () { })(table);
    }

    function openRrkModal(mode, data = {}) {
      const modalEl = ensureModal('bmRrkModal', `
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="bmRrkModalTitle">RRK</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-12">
                  <div class="alert alert-info mb-0">
                    RRK dibuat untuk jabatan yang sudah dipilih dari alur Sub Perusahaan → Divisi → Jabatan.
                  </div>
                </div>
                <div class="col-12"><label class="form-label">Rancangan Rencana Kerja</label><textarea id="bmRrkRancangan" class="form-control" rows="4" placeholder="Isi rancangan rencana kerja"></textarea></div>
                <div class="col-md-6"><label class="form-label">Tingkat Urgensi</label><select id="bmRrkUrgensi" class="form-select"><option value="">Pilih tingkat urgensi</option><option>Rendah</option><option>Sedang</option><option>Tinggi</option><option>Mendesak</option></select></div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Tutup</button>
              <button type="button" class="btn btn-primary" id="bmRrkSave">Simpan</button>
            </div>
          </div>
        </div>
      `);
      setModalActionTitle($('#bmRrkModalTitle', modalEl), mode, 'RRK');
      const org = {
        sub_id: String(data?.sub_id || activePath?.sub_id || '').trim(),
        divisi_id: String(data?.divisi_id || activePath?.divisi_id || '').trim(),
        jabatan_id: String(data?.jabatan_id || activePath?.jabatan_id || '').trim(),
      };
      const rancanganEl = $('#bmRrkRancangan', modalEl);
      const urgensiEl = $('#bmRrkUrgensi', modalEl);
      const saveBtn = $('#bmRrkSave', modalEl);
      rancanganEl.value = String(data?.rancangan_rencana || '');
      urgensiEl.value = String(data?.tingkat_urgensi || '');
      ceoSetReadonlyFields(modalEl, mode === 'view');
      saveBtn.classList.toggle('d-none', mode === 'view');
      saveBtn.onclick = () => {
        const payload = {
          id: data?.id || uid('rrk'),
          sub_id: org.sub_id,
          divisi_id: org.divisi_id,
          jabatan_id: org.jabatan_id,
          rancangan_rencana: String(rancanganEl.value || '').trim(),
          tingkat_urgensi: String(urgensiEl.value || '').trim(),
        };
        if (!payload.sub_id) return window.alert('Sub perusahaan wajib dipilih.');
        if (!payload.divisi_id) return window.alert('Divisi wajib dipilih.');
        if (!payload.jabatan_id) return window.alert('Jabatan wajib dipilih.');
        if (!payload.rancangan_rencana) return window.alert('Rancangan rencana kerja wajib diisi.');
        if (!payload.tingkat_urgensi) return window.alert('Tingkat urgensi wajib dipilih.');
        const rows = bmEnsureRrkRows();
        const idx = rows.findIndex((x) => String(x.id) === String(payload.id));
        if (idx >= 0) rows[idx] = { ...rows[idx], ...payload };
        else rows.unshift(payload);
        writeList(BM_RRK_KEY, rows);
        bootstrap.Modal.getOrCreateInstance(modalEl).hide();
        showCeoToast(mode === 'edit' ? 'RRK berhasil diperbarui.' : 'RRK berhasil ditambahkan.');
        render();
      };
      showModal('bmRrkModal');
    }

    const gate = bmInitFeatureGate({
      tableCard,
      featureTitle: 'RRK',
      onSelect: (path) => {
        activePath = path;
        render();
      },
      onReset: () => {
        activePath = null;
        render();
      }
    });

    addBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      openRrkModal('add', activePath?.jabatan_id ? { ...activePath } : {});
    });
    table.addEventListener('click', (e) => {
      const rows = bmEnsureRrkRows();
      const viewBtn = e.target?.closest?.('[data-bm-rrk-view]');
      const editBtn = e.target?.closest?.('[data-bm-rrk-edit]');
      const delBtn = e.target?.closest?.('[data-bm-rrk-del]');
      if (viewBtn) {
        const cur = rows.find((x) => String(x.id) === String(viewBtn.getAttribute('data-bm-rrk-view')));
        if (cur) openRrkModal('view', cur);
        return;
      }
      if (editBtn) {
        const cur = rows.find((x) => String(x.id) === String(editBtn.getAttribute('data-bm-rrk-edit')));
        if (cur) openRrkModal('edit', cur);
        return;
      }
      if (delBtn) {
        const id = String(delBtn.getAttribute('data-bm-rrk-del') || '');
        confirmDelete('Hapus RRK ini?', () => {
          writeList(BM_RRK_KEY, rows.filter((x) => String(x.id) !== id));
          showCeoToast('RRK berhasil dihapus.', 'warning');
          render();
        }, 'RRK');
      }
    });
    render();
  }

  function initBmReportPengerjaanPage() {
    const table = document.getElementById('tblReportPengerjaan');
    if (!table) return;
    const tableCard = table.closest('.card');
    const addBtn = tableCard?.querySelector('.crud-add-btn');
    const tbody = table.querySelector('tbody');
    let activePath = null;

    function visibleRows(rows) {
      if (!activePath?.jabatan_id) return [];
      return rows.filter((row) => String(row.jabatan_id || '') === String(activePath.jabatan_id));
    }

    function render() {
      const rows = visibleRows(bmEnsureReportRowsForPath(activePath));
      const rrks = bmEnsureRrkRows();
      if (!rows.length) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-4">Belum ada data Report Pengerjaan untuk jabatan ini.</td></tr>';
        return;
      }
      tbody.innerHTML = rows.map((row, idx) => {
        const rrk = rrks.find((x) => String(x.id) === String(row.rrk_id));
        const link = String(row.link || '').trim();
        return `
          <tr>
            <td>${idx + 1}</td>
            <td>${escapeHtml(row.tanggal || '-')}</td>
            <td>${escapeHtml(bmGetRrkTitle(rrk) || '-')}</td>
            <td class="text-start">${escapeHtml(row.pekerjaan || '-')}</td>
            <td class="text-start">${escapeHtml(row.kendala || '-')}</td>
            <td class="text-start">${escapeHtml(row.keterangan || '-')}</td>
            <td>${link ? `<a href="${escapeHtml(link)}" target="_blank" rel="noopener">Link</a>` : '-'}</td>
            <td><span class="badge bg-label-${bmStatusBadgeClass(row.status)}">${escapeHtml(row.status || '-')}</span></td>
            <td class="tdActions">
              <div class="d-flex justify-content-center gap-2">
                <button class="btn btn-sm btn-icon btn-primary" type="button" data-bm-report-view="${escapeHtml(row.id)}" title="Lihat" aria-label="Lihat"><i class="bx bx-show"></i></button>
                <button class="btn btn-sm btn-icon btn-outline-danger" type="button" data-bm-report-del="${escapeHtml(row.id)}" title="Hapus" aria-label="Hapus"><i class="bx bx-trash"></i></button>
              </div>
            </td>
          </tr>
        `.trim();
      }).join('');
      (window.ceoRefreshCrudActions || function () { })(table);
    }

    function openReportModal(mode, data = {}) {
      const modalEl = ensureModal('bmReportPengerjaanModal', `
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="bmReportModalTitle">Report Pengerjaan</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-12">
                  <div class="alert alert-info mb-0">
                    Report dibuat untuk jabatan yang sudah dipilih dari alur Sub Perusahaan → Divisi → Jabatan.
                  </div>
                </div>
                <div class="col-md-4"><label class="form-label">Tanggal</label><input id="bmReportTanggal" class="form-control" type="date" /></div>
                <div class="col-md-8"><label class="form-label">RRK</label><select id="bmReportRrk" class="form-select"></select></div>
                <div class="col-12"><label class="form-label">Pekerjaan yang Dilakukan</label><textarea id="bmReportPekerjaan" class="form-control" rows="3" placeholder="Isi pekerjaan yang dilakukan"></textarea></div>
                <div class="col-md-6"><label class="form-label">Kendala</label><textarea id="bmReportKendala" class="form-control" rows="3" placeholder="Isi kendala jika ada"></textarea></div>
                <div class="col-md-6"><label class="form-label">Keterangan</label><textarea id="bmReportKeterangan" class="form-control" rows="3" placeholder="Isi keterangan tambahan"></textarea></div>
                <div class="col-md-8"><label class="form-label">Link</label><input id="bmReportLink" class="form-control" type="url" placeholder="https://..." /></div>
                <div class="col-md-4"><label class="form-label">Status</label><select id="bmReportStatus" class="form-select"><option>Pending</option><option>Proses</option><option>Selesai</option><option>Revisi</option></select></div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Tutup</button>
              <button type="button" class="btn btn-primary" id="bmReportSave">Simpan</button>
            </div>
          </div>
        </div>
      `);
      setModalActionTitle($('#bmReportModalTitle', modalEl), mode, 'Report Pengerjaan');
      const rrkEl = $('#bmReportRrk', modalEl);
      const org = {
        sub_id: String(data?.sub_id || activePath?.sub_id || '').trim(),
        divisi_id: String(data?.divisi_id || activePath?.divisi_id || '').trim(),
        jabatan_id: String(data?.jabatan_id || activePath?.jabatan_id || '').trim(),
      };
      const refreshRrkOptions = () => {
        const jabatanId = String(org.jabatan_id || '').trim();
        const all = bmEnsureRrkRows().filter((rrk) => !jabatanId || String(rrk.jabatan_id) === jabatanId);
        fillSelectOptions(rrkEl, all.map((rrk) => ({ value: rrk.id, label: bmGetRrkTitle(rrk) })), 'Pilih RRK');
        if (all.some((rrk) => String(rrk.id) === String(data?.rrk_id))) rrkEl.value = String(data.rrk_id);
      };
      const tanggalEl = $('#bmReportTanggal', modalEl);
      const pekerjaanEl = $('#bmReportPekerjaan', modalEl);
      const kendalaEl = $('#bmReportKendala', modalEl);
      const keteranganEl = $('#bmReportKeterangan', modalEl);
      const linkEl = $('#bmReportLink', modalEl);
      const statusEl = $('#bmReportStatus', modalEl);
      const saveBtn = $('#bmReportSave', modalEl);
      tanggalEl.value = String(data?.tanggal || '');
      pekerjaanEl.value = String(data?.pekerjaan || '');
      kendalaEl.value = String(data?.kendala || '');
      keteranganEl.value = String(data?.keterangan || '');
      linkEl.value = String(data?.link || '');
      statusEl.value = String(data?.status || 'Pending');
      refreshRrkOptions();
      if (data?.rrk_id) rrkEl.value = String(data.rrk_id);
      ceoSetReadonlyFields(modalEl, mode === 'view');
      saveBtn.classList.toggle('d-none', mode === 'view');
      saveBtn.onclick = () => {
        const payload = {
          id: data?.id || uid('rpt'),
          sub_id: org.sub_id,
          divisi_id: org.divisi_id,
          jabatan_id: org.jabatan_id,
          tanggal: String(tanggalEl.value || '').trim(),
          rrk_id: String(rrkEl.value || '').trim(),
          pekerjaan: String(pekerjaanEl.value || '').trim(),
          kendala: String(kendalaEl.value || '').trim(),
          keterangan: String(keteranganEl.value || '').trim(),
          link: String(linkEl.value || '').trim(),
          status: String(statusEl.value || '').trim(),
        };
        if (!payload.sub_id) return window.alert('Sub perusahaan wajib dipilih.');
        if (!payload.divisi_id) return window.alert('Divisi wajib dipilih.');
        if (!payload.jabatan_id) return window.alert('Jabatan wajib dipilih.');
        if (!payload.tanggal) return window.alert('Tanggal wajib diisi.');
        // RRK boleh kosong agar fitur Tambah tetap bisa dipakai meskipun data RRK belum dibuat.
        if (!payload.pekerjaan) return window.alert('Pekerjaan yang dilakukan wajib diisi.');
        const rows = bmEnsureReportRows();
        const idx = rows.findIndex((x) => String(x.id) === String(payload.id));
        if (idx >= 0) rows[idx] = { ...rows[idx], ...payload };
        else rows.unshift(payload);
        writeList(BM_REPORT_KEY, rows);
        bootstrap.Modal.getOrCreateInstance(modalEl).hide();
        showCeoToast(mode === 'edit' ? 'Report Pengerjaan berhasil diperbarui.' : 'Report Pengerjaan berhasil ditambahkan.');
        render();
      };
      showModal('bmReportPengerjaanModal');
    }

    const gate = bmInitFeatureGate({
      tableCard,
      featureTitle: 'Report Pengerjaan',
      onSelect: (path) => {
        activePath = path;
        render();
      },
      onReset: () => {
        activePath = null;
        render();
      }
    });

    addBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      openReportModal('add', activePath?.jabatan_id ? { ...activePath } : {});
    });
    table.addEventListener('click', (e) => {
      const rows = bmEnsureReportRows();
      const viewBtn = e.target?.closest?.('[data-bm-report-view]');
      const editBtn = e.target?.closest?.('[data-bm-report-edit]');
      const delBtn = e.target?.closest?.('[data-bm-report-del]');
      if (viewBtn) {
        const cur = rows.find((x) => String(x.id) === String(viewBtn.getAttribute('data-bm-report-view')));
        if (cur) openReportModal('view', cur);
        return;
      }
      if (editBtn) {
        const cur = rows.find((x) => String(x.id) === String(editBtn.getAttribute('data-bm-report-edit')));
        if (cur) openReportModal('edit', cur);
        return;
      }
      if (delBtn) {
        const id = String(delBtn.getAttribute('data-bm-report-del') || '');
        confirmDelete('Hapus Report Pengerjaan ini?', () => {
          writeList(BM_REPORT_KEY, rows.filter((x) => String(x.id) !== id));
          showCeoToast('Report Pengerjaan berhasil dihapus.', 'warning');
          render();
        }, 'Report Pengerjaan');
      }
    });
    render();
  }

  // --------------------------------------------------------------
  // Run
  // --------------------------------------------------------------
  function boot() {
    initLogoutRedirect();

    // Reset data lokal (optional): tambahkan ?reset_data=1 di URL lalu refresh
    try {
      const u = new URL(window.location.href);
      if (u.searchParams.get('reset_data') === '1') {
        Object.values(LS).forEach((k) => { try { localStorage.removeItem(k); } catch (e) { } });
        // legacy keys
        try { localStorage.removeItem('ceoEmployeesV1'); } catch (e) { }
        try { localStorage.removeItem('ceoDivisionsV1'); } catch (e) { }
      }
    } catch (e) { }

    ensureSeeds();
    applyCompanyBranding();

    // list pages
    initCompanyProfilePage();
    initSubCompanyPage();
    initDivisiPage();
    initJabatanPage();
    initStrukturPerusahaanPage();
    initEmployeePage();
    initContractPage();
    initEmployeeActivitiesPage();
    initWorkShiftScenarioPage();
    initBmRrkPage();
    initBmReportPengerjaanPage();
    syncAttendanceDemoRowsFromTable();

    // detail pages
    initSubCompanyDetailPage();
    initDivisiDetailPage();
    initJabatanDetailPage();
    initEmployeeDetailPage();
    initContractDetailPage();

    // dashboard + kalender widgets
    initDashboardStats();
    initCalendarPages();
    if (!window.__bmDashboardStatsBound) {
      window.__bmDashboardStatsBound = true;
      window.addEventListener('ceo:calendar:changed', initDashboardStats);
      window.addEventListener('storage', (event) => {
        if (!event || event.key === LS.CAL || event.key === LS.KAR || event.key === LS.SUB || event.key === LS.ABSEN || event.key === LS.ABSEN_DEMO) initDashboardStats();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();


(function () {
  'use strict';

  // Helper lokal untuk IIFE dashboard/overview.
  // Di bagian atas file helper escapeHtml ada di IIFE lain, jadi perlu fallback di sini
  // agar chart dashboard dan daftar karyawan terbaik tidak berhenti karena ReferenceError.
  function escapeHtml(value) {
    if (typeof window !== 'undefined' && typeof window.ceoEscapeHtml === 'function') {
      return window.ceoEscapeHtml(value);
    }
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function parseTimeToMinutes(value) {
    const raw = String(value || '').trim();
    const m = raw.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return 0;
    return Number(m[1]) * 60 + Number(m[2]);
  }

  function formatMinutes(totalMinutes) {
    const safeMinutes = Math.max(0, Number(totalMinutes) || 0);
    const hours = Math.floor(safeMinutes / 60);
    const minutes = safeMinutes % 60;

    if (hours && minutes) return `${hours} Jam ${minutes} Menit`;
    if (hours) return `${hours} Jam`;
    if (minutes) return `${minutes} Menit`;
    return '0 Menit';
  }

  function fillText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = String(value);
  }

  function setLemburOverviewCopy() {
    const labels = document.querySelectorAll('.ceo-overview-row[data-overview-page="lembur"] .text-muted.small');
    if (labels[1]) labels[1].textContent = 'Akumulasi Durasi';
    if (labels[2]) labels[2].textContent = 'Rata-rata Durasi';
  }

  function initAttendanceOverviewCards() {
    const kehTable = document.getElementById('tblKehadiranV2');
    if (kehTable) {
      const rows = Array.from(kehTable.querySelectorAll('tbody tr'));
      const total = rows.length;
      let attention = 0;
      let complete = 0;
      rows.forEach((tr) => {
        const text = tr.textContent.toLowerCase();
        if (text.includes('terlambat') || text.includes('visit')) attention += 1;
        if (text.includes('lengkap')) complete += 1;
      });
      fillText('ovKehadiranTotal', total);
      fillText('ovKehadiranAttention', attention);
      fillText('ovKehadiranComplete', complete);
    }

    const istTable = document.getElementById('tblIstirahatV2');
    if (istTable) {
      const rows = Array.from(istTable.querySelectorAll('tbody tr'));
      const total = rows.length;
      let ontime = 0;
      let late = 0;
      rows.forEach((tr) => {
        const status = String(tr.children[6]?.textContent || '').toLowerCase();
        if (status.includes('tepat waktu') || status === 'kembali') ontime += 1;
        if (status.includes('terlambat')) late += 1;
      });
      fillText('ovIstirahatTotal', total);
      fillText('ovIstirahatOntime', ontime);
      fillText('ovIstirahatLate', late);
    }

    const lemTable = document.getElementById('tblLemburV2');
    if (lemTable) {
      const rows = Array.from(lemTable.querySelectorAll('tbody tr'));
      const total = rows.length;
      let totalMinutes = 0;
      rows.forEach((tr) => {
        const checkIn = parseTimeToMinutes(tr.children[3]?.textContent);
        const checkOut = parseTimeToMinutes(tr.children[4]?.textContent);
        const diff = Math.max(0, checkOut - checkIn);
        totalMinutes += diff;
      });
      const averageMinutes = total ? Math.round(totalMinutes / total) : 0;
      fillText('ovLemburTotal', total);
      fillText('ovLemburHours', formatMinutes(totalMinutes));
      fillText('ovLemburLong', formatMinutes(averageMinutes));
    }
  }

  function patchDashboardCopy() {
    const title = document.getElementById('dashHeroNextTitle');
    const meta = document.getElementById('dashHeroNextMeta');
    const type = document.getElementById('dashHeroNextType');
    const note = document.getElementById('dashHeroNextNote');
    const next = document.getElementById('dashNextEvent');

    if (title && title.textContent.trim().toLowerCase() === 'belum ada jadwal') {
      title.textContent = 'Belum ada jadwal';
    }
    if (meta && meta.textContent.trim().toLowerCase().includes('pilih tanggal')) {
      meta.textContent = '-';
    }
    if (type && type.textContent.trim() === '-') {
      type.textContent = '-';
    }
    if (note && note.textContent.trim().toLowerCase() === 'belum ada catatan') {
      note.textContent = 'Belum ada catatan';
    }
    if (next && next.textContent.trim() === '-') {
      next.textContent = '-';
    }
  }



  // ==============================================================
  // BM Dashboard Dynamic Widgets - FINAL
  // - TOP Kreator: klik nama kreator -> grafik GMV berubah sesuai nama.
  // - Rekap Penilaian Karyawan 2026: dropdown nama -> grafik nilai berubah.
  // - Karyawan Terbaik: dropdown bulan -> ranking karyawan terbaik berubah.
  // ==============================================================
  function initBmDashboardWidgets() {
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

    const creatorList = document.getElementById('creatorList');
    const creatorChart = document.getElementById('creatorGmvChart');
    const creatorTitle = document.getElementById('creatorChartTitle');
    const employeeSelect = document.getElementById('employeeEvalSelect');
    const evalChart = document.getElementById('employeeEvalChart');
    const bestMonth = document.getElementById('bestEmployeeMonth');
    const bestList = document.getElementById('bestEmployeeList');

    if (!creatorList && !creatorChart && !employeeSelect && !evalChart && !bestMonth && !bestList) return;

    const PENILAIAN_KEY = 'bmPenilaianKaryawanV1';

    function readStorageArray(key) {
      try {
        const parsed = JSON.parse(localStorage.getItem(key) || '[]');
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        return [];
      }
    }

    function readStorageObject(key) {
      try {
        const parsed = JSON.parse(localStorage.getItem(key) || 'null');
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
      } catch (error) {
        return {};
      }
    }

    function lookupStorageName(key, id) {
      const wanted = String(id || '').trim();
      if (!wanted) return '';
      return readStorageArray(key).find((row) => String(row?.id || '') === wanted)?.name || '';
    }

    function normalizeScore(value) {
      const num = Number(String(value || '').replace('%', '').replace(',', '.').trim());
      return Number.isFinite(num) ? Math.max(0, Math.round(num * 100) / 100) : 0;
    }

    function monthIndexFromPeriod(value) {
      const text = String(value || '').toLowerCase();
      const map = [
        ['jan', 0], ['feb', 1], ['mar', 2], ['apr', 3], ['mei', 4], ['may', 4], ['jun', 5],
        ['jul', 6], ['ags', 7], ['agu', 7], ['aug', 7], ['sep', 8], ['okt', 9], ['oct', 9],
        ['nov', 10], ['des', 11], ['dec', 11],
      ];
      const found = map.find(([key]) => text.includes(key));
      return found ? found[1] : -1;
    }

    function getDashboardEmployees() {
      return readStorageArray('ceoEmployeesV2')
        .map((emp) => {
          const subIds = Array.isArray(emp?.sub_ids) ? emp.sub_ids : [emp?.sub_id].filter(Boolean);
          const divisiIds = Array.isArray(emp?.divisi_ids) ? emp.divisi_ids : [emp?.divisi_id].filter(Boolean);
          const jabatanIds = Array.isArray(emp?.jabatan_ids) ? emp.jabatan_ids : [emp?.jabatan_id].filter(Boolean);
          const jabatan = jabatanIds.map((id) => lookupStorageName('ceoJabatanV2', id)).filter(Boolean).join(', ');
          return {
            key: String(emp?.employee_no || emp?.id || '').trim(),
            raw_id: String(emp?.id || '').trim(),
            name: String(emp?.name || '').trim(),
            sub: subIds.map((id) => lookupStorageName('ceoSubCompaniesV1', id)).filter(Boolean).join(', '),
            divisi: divisiIds.map((id) => lookupStorageName('ceoDivisiV2', id)).filter(Boolean).join(', '),
            jabatan: jabatan || String(emp?.jabatan || '').trim() || '-',
          };
        })
        .filter((emp) => emp.key || emp.name);
    }

    function getDashboardPenilaianRows() {
      return readStorageArray(PENILAIAN_KEY).map((row) => ({
        employeeKey: String(row?.id || row?.employee_no || row?.raw_id || '').trim(),
        name: String(row?.name || '').trim(),
        periode: String(row?.periode || '').trim(),
        jabatan: String(row?.jabatan || '').trim(),
        total: normalizeScore(row?.total),
      }));
    }

    function buildEmployeeEvalData(employees, penilaianRows) {
      const byKey = {};
      employees.forEach((emp) => {
        const key = emp.key || emp.raw_id || emp.name;
        if (!key) return;
        byKey[key] = { name: emp.name || key, values: monthLabels.map(() => 0), jabatan: emp.jabatan || '-' };
      });

      penilaianRows.forEach((row) => {
        const employee = employees.find((emp) => emp.key === row.employeeKey || emp.raw_id === row.employeeKey || emp.name === row.name);
        const key = employee?.key || row.employeeKey || row.name;
        if (!key) return;
        if (!byKey[key]) byKey[key] = { name: row.name || key, values: monthLabels.map(() => 0), jabatan: row.jabatan || '-' };
        const monthIdx = monthIndexFromPeriod(row.periode);
        if (monthIdx >= 0) byKey[key].values[monthIdx] = row.total;
      });

      return byKey;
    }

    function buildBestEmployeeByMonth(employees, penilaianRows, evalData) {
      const result = {};
      monthLabels.forEach((month, idx) => {
        const rows = employees.map((emp) => {
          const key = emp.key || emp.raw_id || emp.name;
          const score = normalizeScore(evalData[key]?.values?.[idx] || 0);
          return [emp.name || key, emp.jabatan || '-', score ? `${score}%` : '0%'];
        }).sort((a, b) => normalizeScore(b[2]) - normalizeScore(a[2]) || String(a[0]).localeCompare(String(b[0])));

        if (!rows.length) {
          const fallbackRows = penilaianRows
            .filter((row) => monthIndexFromPeriod(row.periode) === idx)
            .sort((a, b) => b.total - a.total)
            .map((row) => [row.name || row.employeeKey || '-', row.jabatan || '-', `${row.total}%`]);
          result[month] = fallbackRows;
        } else {
          result[month] = rows;
        }
      });
      return result;
    }

    const creatorData = {
      alya: {
        name: 'Alya Ramadhani',
        category: 'Beauty & Lifestyle',
        photo: './media/creator-alya.svg',
        values: [12, 14, 17, 19, 22, 25, 27, 29, 31, 34, 36, 39],
      },
      bima: {
        name: 'Bima Pratama',
        category: 'Tech Review & Gadget',
        photo: './media/creator-bima.svg',
        values: [9, 11, 13, 15, 18, 21, 23, 26, 28, 30, 32, 35],
      },
      caca: {
        name: 'Caca Maharani',
        category: 'Food & Daily Vlog',
        photo: './media/creator-caca.svg',
        values: [8, 10, 12, 14, 16, 18, 20, 22, 24, 27, 29, 33],
      },
    };

    if (creatorList) {
      creatorList.innerHTML = Object.entries(creatorData).map(([key, data], index) => `
        <button type="button" class="bm-creator-row ${index === 0 ? 'active' : ''}" data-creator="${escapeHtml(key)}" aria-pressed="${index === 0 ? 'true' : 'false'}">
          <span class="bm-rank-no">#${index + 1}</span>
          <img class="bm-creator-photo" src="${escapeHtml(data.photo)}" alt="${escapeHtml(data.name)}" />
          <span class="bm-creator-meta">
            <strong>${escapeHtml(data.name)}</strong>
            <small>${escapeHtml(data.category)}</small>
          </span>
        </button>
      `.trim()).join('');
    }

    const dashboardEmployees = getDashboardEmployees();
    const dashboardPenilaianRows = getDashboardPenilaianRows();
    const employeeEvalData = buildEmployeeEvalData(dashboardEmployees, dashboardPenilaianRows);
    const bestEmployeeByMonth = buildBestEmployeeByMonth(dashboardEmployees, dashboardPenilaianRows, employeeEvalData);

    if (employeeSelect) {
      const keys = Object.keys(employeeEvalData);
      employeeSelect.innerHTML = keys.length
        ? keys.map((key) => `<option value="${escapeHtml(key)}">${escapeHtml(employeeEvalData[key].name || key)}</option>`).join('')
        : '<option value="">Belum ada karyawan</option>';
    }

    function renderDashboardBars(container, values, labels, suffix = '') {
      if (!container || !Array.isArray(values)) return;
      const numericValues = values.map((value) => Number(value) || 0);
      const max = Math.max(...numericValues, 1);

      container.innerHTML = numericValues.map((value, index) => {
        const label = labels[index] || '';
        const height = Math.max(10, Math.round((value / max) * 100));
        const displayValue = suffix ? `${value}${suffix}` : String(value);

        return `
          <div class="bm-chart-bar" title="${escapeHtml(label)}: ${escapeHtml(displayValue)}" aria-label="${escapeHtml(label)}: ${escapeHtml(displayValue)}">
            <div class="bm-chart-bar__value">${escapeHtml(displayValue)}</div>
            <div class="bm-chart-bar__fill" style="height:${height}%"></div>
            <div class="bm-chart-bar__label">${escapeHtml(label)}</div>
          </div>
        `.trim();
      }).join('');
    }

    function syncCreatorBadges() {
      if (!creatorList) return;

      creatorList.querySelectorAll('.bm-creator-row').forEach((row) => {
        const key = row.getAttribute('data-creator') || '';
        const data = creatorData[key];
        if (!data) return;

        const meta = row.querySelector('.bm-creator-meta');
        const nameEl = meta?.querySelector('strong');
        if (!meta || !nameEl) return;

        let line = meta.querySelector('.bm-creator-name-line');
        if (!line) {
          line = document.createElement('span');
          line.className = 'bm-creator-name-line';
          meta.insertBefore(line, meta.firstChild);
          line.appendChild(nameEl);
        } else if (!line.contains(nameEl)) {
          line.insertBefore(nameEl, line.firstChild);
        }

        let badge = line.querySelector('.bm-creator-gmv');
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'bm-creator-gmv';
          line.appendChild(badge);
        }

        const latestGmv = data.values[data.values.length - 1] || 0;
        badge.textContent = `GMV ${latestGmv}jt`;
        row.setAttribute('aria-pressed', row.classList.contains('active') ? 'true' : 'false');
      });
    }

    function setCreatorChart(key) {
      const keys = Object.keys(creatorData);
      if (!keys.length) {
        if (creatorTitle) creatorTitle.textContent = 'Grafik GMV 2026';
        if (creatorChart) creatorChart.innerHTML = '<div class="bm-empty-widget text-muted">Belum ada data kreator.</div>';
        if (creatorList && !creatorList.children.length) creatorList.innerHTML = '<div class="bm-empty-widget text-muted">Belum ada data kreator.</div>';
        return;
      }

      const nextKey = creatorData[key] ? key : keys[0];
      const data = creatorData[nextKey];

      if (creatorTitle) creatorTitle.textContent = `Grafik GMV ${data.name} 2026`;
      renderDashboardBars(creatorChart, data.values, monthLabels, 'jt');

      if (creatorList) {
        creatorList.querySelectorAll('.bm-creator-row').forEach((row) => {
          const active = row.getAttribute('data-creator') === nextKey;
          row.classList.toggle('active', active);
          row.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
      }

      syncCreatorBadges();
    }

    function setEmployeeEvalChart(key) {
      const keys = Object.keys(employeeEvalData);
      if (!keys.length) {
        if (evalChart) evalChart.innerHTML = '<div class="bm-empty-widget text-muted">Belum ada data penilaian.</div>';
        return;
      }

      const nextKey = employeeEvalData[key] ? key : keys[0];
      const data = employeeEvalData[nextKey];
      renderDashboardBars(evalChart, data.values, monthLabels, '');

      if (employeeSelect && employeeSelect.value !== nextKey) {
        employeeSelect.value = nextKey;
      }
    }

    function renderBestEmployees(month) {
      if (!bestList) return;
      const rows = bestEmployeeByMonth[month] || [];
      if (!rows.length) {
        bestList.innerHTML = '<div class="bm-empty-widget text-muted">Belum ada data karyawan terbaik.</div>';
        return;
      }

      bestList.innerHTML = rows.map((row, index) => `
        <div class="bm-best-row">
          <div class="bm-best-left">
            <span class="bm-best-rank">${index + 1}</span>
            <span>
              <div class="bm-best-name">${escapeHtml(row[0])}</div>
              <div class="bm-best-role">${escapeHtml(row[1])}</div>
            </span>
          </div>
          <div class="bm-best-score">${escapeHtml(row[2])}</div>
        </div>
      `.trim()).join('');
    }

    creatorList?.addEventListener('click', (event) => {
      const row = event.target.closest('.bm-creator-row');
      if (!row) return;
      setCreatorChart(row.getAttribute('data-creator') || 'alya');
    });

    employeeSelect?.addEventListener('change', () => {
      setEmployeeEvalChart(employeeSelect.value);
    });

    bestMonth?.addEventListener('change', () => {
      renderBestEmployees(bestMonth.value);
    });

    syncCreatorBadges();
    setCreatorChart(creatorList?.querySelector('.bm-creator-row.active')?.getAttribute('data-creator') || 'alya');
    setEmployeeEvalChart(employeeSelect?.value || 'sinta');
    renderBestEmployees(bestMonth?.value || 'Mei');
  }

  function bootAwanPatch() {
    initBmDashboardWidgets();
    setLemburOverviewCopy();
    initAttendanceOverviewCards();
    patchDashboardCopy();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootAwanPatch);
  } else {
    bootAwanPatch();
  }
})();




/* CRUD action label + active state sync */
(function () {
  'use strict';

  function sync(root) {
    if (typeof window.ceoRefreshCrudActions === 'function') {
      window.ceoRefreshCrudActions(root || document);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => sync(document));
  } else {
    sync(document);
  }

  window.addEventListener('load', () => sync(document), { once: true });

  const body = document.body;
  if (body && window.MutationObserver) {
    let queued = false;
    const observer = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(() => {
        queued = false;
        sync(document);
      });
    });
    observer.observe(body, { childList: true, subtree: true });
  }
})();


/* ==============================================================
   BM Current CRUD Module v9
   Modul tunggal untuk CRUD halaman target.
   Digabung ke script.js agar tidak ada file handler dobel.

   Target perbaikan:
   - BM_instruksi_tugas.html: Tambah, Lihat, Edit, Hapus + form lengkap
   - BM_kehadiran.html: Lihat, Hapus + popup foto check in/out di modal lihat
   - BM_presensi_istirahat.html: Lihat, Hapus
   - BM_presensi_lembur.html: Lihat, Hapus + Total Waktu tetap muncul
   - BM_penilaian_karyawan.html: Tambah, Lihat, Edit, Hapus + KPI readonly kecuali Aktual/Tercapai
   ============================================================== */
(function () {
  'use strict';

  const TABLE_CONFIG = {
    tblInstruksiTugas: {
      title: 'Instruksi Tugas',
      add: true,
      view: true,
      edit: true,
      delete: true,
    },
    tblPenilaianKaryawan: {
      title: 'Penilaian Karyawan',
      add: true,
      view: true,
      edit: true,
      delete: true,
    },
    tblKehadiranV2: {
      title: 'Kehadiran',
      add: false,
      view: true,
      edit: false,
      delete: true,
    },
    tblIstirahatV2: {
      title: 'Presensi Istirahat',
      add: false,
      view: true,
      edit: false,
      delete: true,
    },
    tblLemburV2: {
      title: 'Presensi Lembur',
      add: false,
      view: true,
      edit: false,
      delete: true,
    },
  };

  const EMPLOYEE_OPTIONS = [];

  function readBmCrudStorage(key, fallback = []) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || 'null');
      return parsed ?? fallback;
    } catch (error) {
      return fallback;
    }
  }

  function ensureArrayValue(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (value === null || value === undefined || value === '') return [];
    return [value].filter(Boolean);
  }

  function bmLookupName(storageKey, id) {
    const key = String(id || '').trim();
    if (!key) return '';
    const rows = readBmCrudStorage(storageKey, []);
    const found = Array.isArray(rows) ? rows.find((row) => String(row?.id || '') === key) : null;
    return String(found?.name || found?.code || '').trim();
  }

  function getBmEmployeeOptions() {
    const employees = readBmCrudStorage('ceoEmployeesV2', []);
    if (!Array.isArray(employees)) return [];

    return employees
      .map((emp) => {
        const name = String(emp?.name || '').trim();
        const idKaryawan = String(emp?.employee_no || emp?.id || '').trim();
        const subIds = ensureArrayValue(emp?.sub_ids ?? emp?.sub_id);
        const divisiIds = ensureArrayValue(emp?.divisi_ids ?? emp?.divisi_id);
        const jabatanIds = ensureArrayValue(emp?.jabatan_ids ?? emp?.jabatan_id);
        return {
          id: idKaryawan,
          raw_id: String(emp?.id || '').trim(),
          name,
          sub: subIds.map((id) => bmLookupName('ceoSubCompaniesV1', id)).filter(Boolean).join(', '),
          divisi: divisiIds.map((id) => bmLookupName('ceoDivisiV2', id)).filter(Boolean).join(', '),
          jabatan: jabatanIds.map((id) => bmLookupName('ceoJabatanV2', id)).filter(Boolean).join(', '),
        };
      })
      .filter((emp) => emp.name || emp.id);
  }

  function hydrateEmployeeDropdownFields(fields) {
    const employees = getBmEmployeeOptions();
    return (fields || []).map((field) => {
      const label = String(field?.label || '').trim().toLowerCase();
      if (field?.autoEmployee || label === 'penerima / nama karyawan') {
        return {
          ...field,
          type: 'select',
          options: ['', ...employees.map((item) => item.name).filter(Boolean)],
        };
      }
      return field;
    });
  }

  const PERIOD_OPTIONS = ['April 2026', 'Mei 2026', 'Juni 2026', 'Juli 2026', 'Agustus 2026'];
  const PENILAIAN_STORAGE_KEY = 'bmPenilaianKaryawanV1';
  const FORCE_TABLE_STORAGE_KEYS = {
    tblInstruksiTugas: 'bmInstruksiTugasV1',
  };

  function bmUid(prefix = 'bm') {
    return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  function readStorageArray(key) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function writeStorageArray(key, rows) {
    try {
      localStorage.setItem(key, JSON.stringify(Array.isArray(rows) ? rows : []));
    } catch (error) {
      console.warn('Gagal menyimpan data lokal:', key, error);
    }
  }

  const DEFAULT_KPI_ROWS = [
    { no: 1, kpi: 'Meningkatkan jumlah followers', bobot: '20%', target: '1000', aktual: '', skor_akhir: '' },
    { no: 2, kpi: 'Membuat konten statis dalam satu bulan', bobot: '15%', target: '25', aktual: '', skor_akhir: '' },
    { no: 3, kpi: 'Membuat short video reels dalam satu bulan', bobot: '15%', target: '5', aktual: '', skor_akhir: '' },
    { no: 4, kpi: 'Kepuasan pelanggan terhadap jawaban atas solusi yang diberikan melalui kolom komentar dan DM (skor 1-5)', bobot: '5%', target: '5', aktual: '', skor_akhir: '' },
    { no: 5, kpi: 'Optimisasi traffic penjualan dan kunjungan website perusahaan', bobot: '10%', target: '100', aktual: '', skor_akhir: '' },
    { no: 6, kpi: 'Engagement Rate (likes, comments, share, saves, dan favorites) skor 1-3%', bobot: '15%', target: '3', aktual: '', skor_akhir: '' },
    { no: 7, kpi: 'Kedisiplinan dan ketepatan waktu penyelesaian tugas', bobot: '20%', target: '100', aktual: '', skor_akhir: '' },
  ];

  const INSTRUKSI_BLUEPRINT = [
    { label: 'Judul Tugas', value: '', placeholder: '', cellIndex: 1, colClass: 'col-md-6' },
    { label: 'Pemberi Tugas / PIC', value: '', placeholder: '', excludeFromTable: true, colClass: 'col-md-6' },
    { label: 'Penerima / Nama Karyawan', value: '', placeholder: 'Pilih nama karyawan', options: [], cellIndex: 2, colClass: 'col-12', autoEmployee: true },
    { label: 'Sub Perusahaan', value: '', placeholder: 'Otomatis dari karyawan', excludeFromTable: true, colClass: 'col-md-4', readonly: true, autoField: 'sub' },
    { label: 'Divisi', value: '', placeholder: 'Otomatis dari karyawan', excludeFromTable: true, colClass: 'col-md-4', readonly: true, autoField: 'divisi' },
    { label: 'Jabatan', value: '', placeholder: 'Otomatis dari karyawan', excludeFromTable: true, colClass: 'col-md-4', readonly: true, autoField: 'jabatan' },
    { label: 'Tanggal', value: '', placeholder: '', inputType: 'date', cellIndex: 3, colClass: 'col-md-6' },
    { label: 'Deadline', value: '', placeholder: '', inputType: 'date', cellIndex: 4, colClass: 'col-md-6' },
    { label: 'Deskripsi Tugas', value: '', placeholder: '', textarea: true, excludeFromTable: true, colClass: 'col-md-8' },
    { label: 'Status', value: '', placeholder: 'Pilih status tugas', options: ['', 'Pending', 'Proses', 'Selesai', 'Revisi'], excludeFromTable: true, colClass: 'col-md-4' },
    { label: 'Catatan', value: '', placeholder: '', textarea: true, excludeFromTable: true, colClass: 'col-12' },
  ];

  const ADD_FIELD_EXAMPLES = {
    tblPenilaianKaryawan: {
      'ID Karyawan': '',
      'No Karyawan': '',
      'Nama': '',
      'Periode': '',
      'Jabatan': '',
      'Indeks Prestasi': '',
    },
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function normalizeText(value) {
    return String(value || '').trim().replace(/\s+/g, ' ');
  }

  function injectForceStyle() {
    if (document.getElementById('bmForceCrudStyle')) return;
    const style = document.createElement('style');
    style.id = 'bmForceCrudStyle';
    style.textContent = `
      #bmPenilaianModal .modal-dialog { max-width: 1120px; }
      #bmPenilaianModal .modal-content { border-radius: .5rem; }
      #bmPenilaianModal .bm-penilaian-label { font-weight:600; color:#566a7f; margin-bottom:.35rem; }
      #bmPenilaianModal .bm-penilaian-control { min-height:38px; box-shadow:none; border:1px solid #d9dee3; border-radius:.375rem; background:#fff; }
      #bmPenilaianModal select.bm-penilaian-control,
      #bmPenilaianModal .bm-penilaian-select {
        appearance:auto !important;
        -webkit-appearance:auto !important;
        -moz-appearance:auto !important;
        padding-right:2.25rem;
        background-color:#fff;
        cursor:pointer;
      }
      #bmPenilaianModal .bm-penilaian-control[readonly],
      #bmPenilaianModal .bm-penilaian-control:disabled { background:#f5f5f9; color:#566a7f; opacity:1; }
      #bmPenilaianModal .bm-penilaian-table { border:1px solid #d9dee3; border-radius:.5rem; overflow:auto; box-shadow:none; background:#fff; }
      #bmPenilaianModal .bm-penilaian-table table { margin:0; table-layout:fixed; border-collapse:collapse; min-width:860px; }
      #bmPenilaianModal .bm-penilaian-table th { background:#9dc3e6; color:#111; font-weight:700; text-align:center; }
      #bmPenilaianModal .bm-penilaian-table th,
      #bmPenilaianModal .bm-penilaian-table td { border:1px solid #7f8fa6; vertical-align:middle; padding:4px 6px; }
      #bmPenilaianModal .bm-penilaian-table .bm-kpi-no { width:56px; }
      #bmPenilaianModal .bm-penilaian-table .bm-kpi-name { width:36%; }
      #bmPenilaianModal .bm-penilaian-table .bm-kpi-small { width:11%; }
      #bmPenilaianModal .bm-penilaian-table input,
      #bmPenilaianModal .bm-penilaian-table textarea { border:0; background:transparent; text-align:center; box-shadow:none; padding:2px 4px; min-height:32px; }
      #bmPenilaianModal .bm-penilaian-table textarea { text-align:left; resize:vertical; overflow:hidden; line-height:1.25; }
      #bmPenilaianModal .bm-penilaian-table input[readonly],
      #bmPenilaianModal .bm-penilaian-table textarea[readonly] { background:#f8f9fa; color:#333; cursor:default; }
      #bmPenilaianModal .bm-penilaian-table input:focus,
      #bmPenilaianModal .bm-penilaian-table textarea:focus { box-shadow: inset 0 -2px 0 rgba(3,169,244,.35); background:#fff; }
      #bmPenilaianModal .bm-penilaian-table input[readonly]:focus,
      #bmPenilaianModal .bm-penilaian-table textarea[readonly]:focus { box-shadow:none; background:#f8f9fa; }
      #bmPenilaianModal .bm-penilaian-table tfoot td { font-weight:700; background:#fff; }
      #bmPenilaianModal .bm-penilaian-table tfoot [data-penilaian-bobot-total],
      #bmPenilaianModal .bm-penilaian-table tfoot [data-penilaian-total] { background:#b4c7e7; text-align:right; }
      #bmPenilaianModal .bm-penilaian-note { min-height:105px; box-shadow:none; border:1px solid #d9dee3; }
      #bmPhotoModal { position:fixed; inset:0; z-index:3005; display:none; align-items:center; justify-content:center; padding:24px; background:rgba(0,0,0,.45); }
      #bmPhotoModal.bm-show { display:flex; }
      #bmPhotoModal .bm-photo-box { width:min(620px, 96vw); background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 16px 40px rgba(0,0,0,.35); }
      #bmPhotoModal .bm-photo-head { display:flex; align-items:center; justify-content:space-between; padding:14px 18px; border-bottom:1px solid #e5e7eb; }
      #bmPhotoModal .bm-photo-head h5 { margin:0; font-weight:700; }
      #bmPhotoModal .bm-photo-body { padding:18px; text-align:center; }
      #bmPhotoModal img { width:min(420px, 100%); max-height:430px; object-fit:cover; border-radius:10px; border:1px solid #e5e7eb; }
      #bmPhotoModal .bm-photo-meta { margin-top:12px; color:#555; }
    `;
    document.head.appendChild(style);
  }

  function getTableMeta(table) {
    const headers = $$('thead th', table).map((th) => normalizeText(th.textContent));
    const actionIndex = headers.findIndex((text) => text.toLowerCase() === 'aksi');
    return { headers, actionIndex };
  }

  function isAction(control, names) {
    const hay = [
      control?.getAttribute?.('title') || '',
      control?.getAttribute?.('aria-label') || '',
      control?.textContent || '',
      control?.querySelector?.('i')?.className || '',
    ].join(' ').toLowerCase();

    return names.some((name) => hay.includes(String(name).toLowerCase()));
  }

  function ensureActionCell(row, config) {
    let cell = row.querySelector('.tdActions');
    if (!cell) {
      cell = document.createElement('td');
      cell.className = 'tdActions';
      row.appendChild(cell);
    }

    cell.innerHTML = `
      <div class="d-flex justify-content-center gap-2">
        ${config.view ? '<button aria-label="Lihat" class="btn btn-sm btn-icon btn-primary" title="Lihat" type="button"><i class="bx bx-show"></i></button>' : ''}
        ${config.edit ? '<button aria-label="Edit" class="btn btn-sm btn-icon btn-outline-primary" title="Edit" type="button"><i class="bx bx-edit-alt"></i></button>' : ''}
        ${config.delete ? '<button aria-label="Hapus" class="btn btn-sm btn-icon btn-outline-danger" title="Hapus" type="button"><i class="bx bx-trash"></i></button>' : ''}
      </div>
    `.trim();
  }

  function prepareTargetTables() {
    Object.entries(TABLE_CONFIG).forEach(([tableId, config]) => {
      const table = document.getElementById(tableId);
      if (!table) return;

      table.dataset.bmForceCrud = '1';
      table.dataset.ceoCustomCrud = '1';

      const card = table.closest('.card');
      if (card) card.dataset.ceoCustomCrud = '1';
      const addButton = card?.querySelector('.crud-add-btn');
      if (addButton) addButton.dataset.ceoCustomCrud = '1';

      $$('tbody tr', table).forEach((row) => ensureActionCell(row, config));

      if (!config.edit) {
        $$('button, a', table).forEach((control) => {
          if (isAction(control, ['edit', 'bx-edit-alt'])) control.remove();
        });
      }
    });
  }

  function ensureBackdrop() {
    let backdrop = document.getElementById('bmForceCrudBackdrop');
    if (backdrop) return backdrop;

    backdrop = document.createElement('div');
    backdrop.id = 'bmForceCrudBackdrop';
    backdrop.className = 'modal-backdrop fade show';
    backdrop.style.display = 'none';
    document.body.appendChild(backdrop);
    return backdrop;
  }

  function ensureCrudModal() {
    let modal = document.getElementById('bmForceCrudModal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'bmForceCrudModal';
    modal.className = 'modal fade';
    modal.tabIndex = -1;
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Form</h5>
            <button aria-label="Close" class="btn-close" data-bm-force-close="1" type="button"></button>
          </div>
          <div class="modal-body"></div>
          <div class="modal-footer">
            <button class="btn btn-outline-secondary" data-bm-force-close="1" type="button">Tutup</button>
            <button class="btn btn-primary" data-bm-force-save="1" type="button">Simpan</button>
          </div>
        </div>
      </div>
    `.trim();
    document.body.appendChild(modal);
    return modal;
  }

  function showModal(modal) {
    const backdrop = ensureBackdrop();
    backdrop.style.display = 'block';
    modal.style.display = 'block';
    modal.classList.add('show');
    modal.removeAttribute('aria-hidden');
    modal.setAttribute('aria-modal', 'true');
    document.body.classList.add('modal-open');
  }

  function hideModal() {
    ['bmForceCrudModal', 'bmForceDeleteModal', 'bmPenilaianModal'].forEach((id) => {
      const modal = document.getElementById(id);
      if (!modal) return;
      modal.style.display = 'none';
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
      modal.removeAttribute('aria-modal');
    });

    const backdrop = document.getElementById('bmForceCrudBackdrop');
    if (backdrop) backdrop.style.display = 'none';
    document.body.classList.remove('modal-open');
  }

  function readStoredFields(row) {
    try {
      const raw = row?.dataset?.bmForceCrudFields || row?.dataset?.bmCrudFields || '';
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function storeFields(row, fields) {
    row.dataset.bmForceCrudFields = JSON.stringify((fields || []).map((field) => {
      const copy = { ...field };
      delete copy.cellIndex;
      return copy;
    }));
  }

  function getForceTableStorageKey(table) {
    return FORCE_TABLE_STORAGE_KEYS[String(table?.id || '').trim()] || '';
  }

  function appendRowFromStoredFields(table, config, fields) {
    const tbody = table?.querySelector?.('tbody');
    if (!tbody) return null;
    const tr = document.createElement('tr');
    const visibleFields = (fields || []).filter((field) => !field.excludeFromTable && field.type !== 'photo');
    tr.innerHTML = `<td></td>${visibleFields.map((field) => `<td>${escapeHtml(field.value || '')}</td>`).join('')}`;
    ensureActionCell(tr, config);
    storeFields(tr, fields || []);
    tbody.appendChild(tr);
    return tr;
  }

  function persistForceCrudTable(table) {
    const key = getForceTableStorageKey(table);
    if (!key) return;
    const rows = $$('tbody tr', table).map((row) => readStoredFields(row)).filter((fields) => fields.length);
    writeStorageArray(key, rows);
  }

  function restoreForceCrudTableRows() {
    Object.entries(FORCE_TABLE_STORAGE_KEYS).forEach(([tableId, storageKey]) => {
      const table = document.getElementById(tableId);
      const config = TABLE_CONFIG[tableId];
      if (!table || !config) return;
      const tbody = table.querySelector('tbody');
      if (!tbody) return;
      const rows = readStorageArray(storageKey);
      if (!rows.length) return;
      tbody.innerHTML = '';
      rows.forEach((fields) => appendRowFromStoredFields(table, config, tableId === 'tblInstruksiTugas' ? hydrateEmployeeDropdownFields(fields) : fields));
      renumber(table);
    });
  }

  function cloneFields(fields) {
    return JSON.parse(JSON.stringify(fields || []));
  }

  function isImagePath(src) {
    return /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(String(src || ''));
  }

  function fallbackPhotoSrc() {
    return 'media/avatar.png';
  }

  function fieldFromCell(cell, header, index, table, row) {
    const photoBtn = cell.querySelector('[data-photo-preview], [data-preview-src], [data-photo-src]');
    if (table.id === 'tblKehadiranV2' && /photo|foto/i.test(header) && photoBtn) {
      const rawSrc = photoBtn.dataset.photoSrc || photoBtn.dataset.previewSrc || '';
      const employeeName = normalizeText(row?.children?.[1]?.textContent || 'Pegawai');
      const dateText = normalizeText(row?.children?.[2]?.textContent || '');
      const kind = /out/i.test(header) ? 'Check Out' : 'Check In';
      return {
        label: header,
        value: 'Lihat Foto',
        type: 'photo',
        photoSrc: isImagePath(rawSrc) ? rawSrc : fallbackPhotoSrc(),
        photoTitle: `${header} - ${employeeName}`,
        photoMeta: `${employeeName}${dateText ? ' · ' + dateText : ''} · ${kind}`,
        excludeFromTable: false,
        cellIndex: index,
      };
    }

    return {
      label: header || `Kolom ${index + 1}`,
      value: normalizeText(cell.textContent),
      excludeFromTable: false,
      cellIndex: index,
    };
  }

  function computeDurationLabel(start, end) {
    const parse = (value) => {
      const match = String(value || '').match(/(\d{1,2})[:.](\d{2})/);
      if (!match) return null;
      return Number(match[1]) * 60 + Number(match[2]);
    };
    const a = parse(start);
    const b = parse(end);
    if (a === null || b === null) return '';
    let diff = b - a;
    if (diff < 0) diff += 24 * 60;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    if (h && m) return `${h} Jam ${m} Menit`;
    if (h) return `${h} Jam`;
    return `${m} Menit`;
  }

  function normalizeLemburFields(fields) {
    const checkIn = fields.find((field) => /check in/i.test(field.label));
    const checkOut = fields.find((field) => /check out/i.test(field.label));
    let total = fields.find((field) => /total waktu/i.test(field.label));
    if (!total) {
      total = { label: 'Total Waktu', value: '', excludeFromTable: false };
      fields.push(total);
    }
    total.fullWidth = true;
    total.colClass = 'col-12';
    if (!total.value) total.value = computeDurationLabel(checkIn?.value, checkOut?.value);
    return fields;
  }

  function fieldsFromInstruksiRow(row) {
    const cells = $$('td', row);
    const fields = cloneFields(INSTRUKSI_BLUEPRINT);
    fields.forEach((field) => {
      if (Number.isInteger(field.cellIndex) && cells[field.cellIndex]) {
        field.value = normalizeText(cells[field.cellIndex].textContent);
      }
    });
    return hydrateEmployeeDropdownFields(fields);
  }

  function fieldsFromRow(row, table) {
    const stored = readStoredFields(row);
    if (stored.length) return table.id === 'tblInstruksiTugas' ? hydrateEmployeeDropdownFields(stored) : stored;

    if (table.id === 'tblInstruksiTugas') return fieldsFromInstruksiRow(row);

    const { headers, actionIndex } = getTableMeta(table);
    const cells = $$('td', row);
    const fields = [];

    cells.forEach((cell, index) => {
      if (index === 0) return;
      if (index === actionIndex) return;
      fields.push(fieldFromCell(cell, headers[index], index, table, row));
    });

    if (table.id === 'tblLemburV2') return normalizeLemburFields(fields);
    return fields;
  }

  function applyFieldPlaceholder(tableId, field) {
    const examples = ADD_FIELD_EXAMPLES[tableId] || {};
    const label = String(field.label || '');
    return {
      ...field,
      placeholder: field.placeholder || examples[label] || `Contoh: isi ${label.toLowerCase()}`,
    };
  }

  function fieldsForAdd(table, config) {
    if (table.id === 'tblInstruksiTugas') return hydrateEmployeeDropdownFields(cloneFields(INSTRUKSI_BLUEPRINT));

    const { headers, actionIndex } = getTableMeta(table);
    const fields = [];

    headers.forEach((header, index) => {
      if (index === 0) return;
      if (index === actionIndex) return;
      const label = header === 'No Karyawan' ? 'ID Karyawan' : header;
      fields.push(applyFieldPlaceholder(table.id, { label, value: '', excludeFromTable: false, cellIndex: index }));
    });

    return fields;
  }

  function renderFieldControl(field, index, readonly) {
    const label = escapeHtml(field.label || `Field ${index + 1}`);
    const value = String(field.value ?? '');
    const placeholder = escapeHtml(field.placeholder || '');
    const isReadonly = !!readonly || !!field.readonly;
    const disabled = isReadonly ? 'disabled' : '';
    const colClass = field.colClass || (field.fullWidth ? 'col-12' : 'col-md-6');

    if (field.type === 'photo') {
      return `
        <div class="${colClass}">
          <label class="form-label">${label}</label>
          <button class="btn btn-outline-primary w-100" type="button" data-bm-force-photo-open="1" data-photo-src="${escapeHtml(field.photoSrc || fallbackPhotoSrc())}" data-photo-title="${escapeHtml(field.photoTitle || field.label || 'Foto')}" data-photo-meta="${escapeHtml(field.photoMeta || '')}">
            <i class="bx bx-image-alt me-1"></i> Lihat Foto
          </button>
        </div>
      `.trim();
    }

    if (Array.isArray(field.options)) {
      const options = field.options.map((option) => {
        const optionValue = typeof option === 'object' ? String(option.value ?? option.label ?? '') : String(option ?? '');
        let optionLabel = typeof option === 'object' ? String(option.label ?? option.value ?? '') : String(option ?? '');
        if (!optionValue && !optionLabel && field.placeholder) optionLabel = field.placeholder;
        const selected = optionValue === value ? 'selected' : '';
        return `<option value="${escapeHtml(optionValue)}" ${selected}>${escapeHtml(optionLabel)}</option>`;
      }).join('');

      return `
        <div class="${colClass}">
          <label class="form-label">${label}</label>
          <select class="form-select" data-bm-force-field="${index}" ${disabled}>${options}</select>
        </div>
      `.trim();
    }

    if (field.textarea) {
      return `
        <div class="${colClass}">
          <label class="form-label">${label}</label>
          <textarea class="form-control" data-bm-force-field="${index}" rows="3" placeholder="${placeholder}" ${isReadonly ? 'readonly' : ''}>${escapeHtml(value)}</textarea>
        </div>
      `.trim();
    }

    const inputType = field.inputType || 'text';
    return `
      <div class="${colClass}">
        <label class="form-label">${label}</label>
        <input class="form-control" data-bm-force-field="${index}" type="${escapeHtml(inputType)}" value="${escapeHtml(value)}" placeholder="${placeholder}" ${isReadonly ? 'readonly' : ''} />
      </div>
    `.trim();
  }

  function collectFields(modal, fields) {
    return fields.map((field, index) => {
      if (field.type === 'photo') return { ...field };
      const control = modal.querySelector(`[data-bm-force-field="${index}"]`);
      return { ...field, value: control ? control.value : field.value };
    });
  }

  function syncInstruksiEmployeeFields(modal, fields) {
    const penerimaIndex = fields.findIndex((field) => field.autoEmployee);
    if (penerimaIndex === -1) return;

    const penerimaControl = modal.querySelector(`[data-bm-force-field="${penerimaIndex}"]`);
    if (!penerimaControl) return;

    const apply = () => {
      const employee = getBmEmployeeOptions().find((item) => item.name === penerimaControl.value);
      if (!employee) return;
      fields.forEach((field, index) => {
        if (!field.autoField) return;
        const control = modal.querySelector(`[data-bm-force-field="${index}"]`);
        if (control) control.value = employee[field.autoField] || '';
      });
    };

    penerimaControl.addEventListener('change', apply);
    apply();
  }

  function renderCellsFromFields(row, table, fields) {
    const { actionIndex } = getTableMeta(table);
    const visibleFields = (fields || []).filter((field) => !field.excludeFromTable && field.type !== 'photo');
    const cells = $$('td', row);

    visibleFields.forEach((field, visibleIndex) => {
      let cellIndex = Number.isInteger(field.cellIndex) ? field.cellIndex : visibleIndex + 1;
      if (actionIndex !== -1 && cellIndex >= actionIndex) cellIndex = visibleIndex + 1;
      const cell = cells[cellIndex];
      if (cell) cell.textContent = field.value || '';
    });
  }

  function renumber(table) {
    $$('tbody tr', table).forEach((row, index) => {
      const first = row.querySelector('td');
      if (first) first.textContent = String(index + 1);
    });
  }

  function openCrud(mode, table, row) {
    const config = TABLE_CONFIG[table.id];
    if (!config) return;

    if (table.id === 'tblPenilaianKaryawan') {
      openPenilaianCrud(mode, table, row);
      return;
    }

    const readonly = mode === 'view';
    const fields = mode === 'add' ? fieldsForAdd(table, config) : fieldsFromRow(row, table);
    const modal = ensureCrudModal();
    const title = mode === 'add' ? `Tambah ${config.title}` : mode === 'edit' ? `Edit ${config.title}` : `Lihat ${config.title}`;

    $('.modal-title', modal).textContent = title;
    const helperText = mode === 'add'
      ? '<div class="alert alert-primary py-2 small mb-3">Isi data baru pada kolom yang tersedia.</div>'
      : '';
    $('.modal-body', modal).innerHTML = `${helperText}<div class="row g-3">${fields.map((field, index) => renderFieldControl(field, index, readonly)).join('')}</div>`;
    if (table.id === 'tblInstruksiTugas' && !readonly) syncInstruksiEmployeeFields(modal, fields);
    const saveBtn = $('[data-bm-force-save]', modal);
    saveBtn.style.display = readonly ? 'none' : '';
    saveBtn.onclick = null;

    if (!readonly) {
      saveBtn.onclick = function () {
        const savedFields = collectFields(modal, fields);
        if (mode === 'add') {
          const tbody = table.querySelector('tbody');
          const tr = document.createElement('tr');
          const visibleFields = savedFields.filter((field) => !field.excludeFromTable && field.type !== 'photo');
          tr.innerHTML = `<td></td>${visibleFields.map((field) => `<td>${escapeHtml(field.value || '')}</td>`).join('')}`;
          ensureActionCell(tr, config);
          storeFields(tr, savedFields);
          tbody.appendChild(tr);
          renumber(table);
          persistForceCrudTable(table);
        } else if (row) {
          renderCellsFromFields(row, table, savedFields);
          ensureActionCell(row, config);
          storeFields(row, savedFields);
          persistForceCrudTable(table);
        }
        hideModal();
      };
    }

    showModal(modal);
  }

  function ensureDeleteModal() {
    let modal = document.getElementById('bmForceDeleteModal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'bmForceDeleteModal';
    modal.className = 'modal fade';
    modal.tabIndex = -1;
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Hapus Data</h5>
            <button aria-label="Close" class="btn-close" data-bm-force-close="1" type="button"></button>
          </div>
          <div class="modal-body">
            <p class="mb-0">Yakin ingin menghapus data ini?</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline-secondary" data-bm-force-close="1" type="button">Batal</button>
            <button class="btn btn-danger" data-bm-force-delete-confirm="1" type="button">Hapus</button>
          </div>
        </div>
      </div>
    `.trim();
    document.body.appendChild(modal);
    return modal;
  }

  function openDelete(table, row) {
    const config = TABLE_CONFIG[table.id];
    const modal = ensureDeleteModal();
    $('.modal-title', modal).textContent = `Hapus ${config?.title || 'Data'}`;
    $('[data-bm-force-delete-confirm]', modal).onclick = function () {
      if (table?.id === 'tblPenilaianKaryawan') {
        const recordId = String(row?.dataset?.bmPenilaianId || '').trim();
        if (recordId) {
          writeStorageArray(PENILAIAN_STORAGE_KEY, readStorageArray(PENILAIAN_STORAGE_KEY).filter((item) => String(item?.record_id || '') !== recordId));
        }
      }
      row.remove();
      renumber(table);
      persistForceCrudTable(table);
      hideModal();
    };
    showModal(modal);
  }

  function ensurePhotoModal() {
    let modal = document.getElementById('bmPhotoModal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'bmPhotoModal';
    modal.innerHTML = `
      <div class="bm-photo-box">
        <div class="bm-photo-head">
          <h5>Preview Foto</h5>
          <button class="btn btn-sm btn-outline-secondary" type="button" data-bm-photo-close="1">Tutup</button>
        </div>
        <div class="bm-photo-body">
          <img alt="Preview Foto" src="${fallbackPhotoSrc()}" />
          <div class="bm-photo-meta"></div>
        </div>
      </div>
    `.trim();
    document.body.appendChild(modal);
    return modal;
  }

  function openPhotoModal(src, title, meta) {
    const modal = ensurePhotoModal();
    modal.style.zIndex = '3005';
    $('h5', modal).textContent = title || 'Preview Foto';
    $('img', modal).src = isImagePath(src) ? src : fallbackPhotoSrc();
    $('.bm-photo-meta', modal).textContent = meta || '';
    modal.classList.add('bm-show');
  }

  function closePhotoModal() {
    const modal = document.getElementById('bmPhotoModal');
    if (modal) modal.classList.remove('bm-show');
  }

  function savePenilaianRecord(data) {
    if (!data) return;
    const next = { ...data, record_id: String(data.record_id || '').trim() || bmUid('pn') };
    const rows = readStorageArray(PENILAIAN_STORAGE_KEY);
    const idx = rows.findIndex((item) => String(item?.record_id || '') === String(next.record_id));
    if (idx >= 0) rows[idx] = next;
    else rows.unshift(next);
    writeStorageArray(PENILAIAN_STORAGE_KEY, rows);
  }

  function restorePenilaianRows() {
    const table = document.getElementById('tblPenilaianKaryawan');
    const config = TABLE_CONFIG.tblPenilaianKaryawan;
    const tbody = table?.querySelector?.('tbody');
    if (!table || !config || !tbody) return;
    const rows = readStorageArray(PENILAIAN_STORAGE_KEY);
    if (!rows.length) return;
    tbody.innerHTML = '';
    rows.forEach((item) => writePenilaianRow(table, null, item, 'restore'));
    renumber(table);
  }

  function rowToPenilaianData(row) {
    const storedRaw = row?.dataset?.bmPenilaianData || '';
    if (storedRaw) {
      try {
        const parsed = JSON.parse(storedRaw);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch (error) { }
    }

    const cells = row ? $$('td', row) : [];
    const id = normalizeText(cells[1]?.textContent || '');
    const name = normalizeText(cells[2]?.textContent || '');
    const periode = normalizeText(cells[3]?.textContent || '');
    const jabatan = normalizeText(cells[4]?.textContent || '');
    const score = normalizeText(cells[5]?.textContent || '');
    const employee = getBmEmployeeOptions().find((item) => item.id === id || item.name === name) || {};

    return {
      record_id: String(row?.dataset?.bmPenilaianId || '').trim(),
      id,
      name,
      periode,
      sub: employee.sub || 'PT Bisa Media Grup',
      divisi: employee.divisi || jabatan || '',
      jabatan,
      catatan: '',
      kpiRows: [{ no: 1, kpi: 'Indeks Prestasi', bobot: '100%', target: '100', aktual: score, skor_akhir: String(score || '').includes('%') ? score : (score ? `${score}%` : '') }],
      total: String(score || '').includes('%') ? score : (score ? `${score}%` : ''),
    };
  }

  function blankPenilaianData() {
    return {
      record_id: '',
      id: '',
      name: '',
      periode: '',
      sub: '',
      divisi: '',
      jabatan: '',
      catatan: '',
      kpiRows: cloneFields(DEFAULT_KPI_ROWS),
      total: '',
    };
  }

  function ensurePenilaianModal() {
    let modal = document.getElementById('bmPenilaianModal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'bmPenilaianModal';
    modal.className = 'modal fade';
    modal.tabIndex = -1;
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Tambah Penilaian Karyawan</h5>
            <button aria-label="Close" class="btn-close" data-bm-force-close="1" type="button"></button>
          </div>
          <div class="modal-body bm-penilaian-body"></div>
          <div class="modal-footer">
            <button class="btn btn-outline-secondary" data-bm-force-close="1" type="button">Batal</button>
            <button class="btn btn-primary" data-penilaian-save="1" type="button">Simpan</button>
          </div>
        </div>
      </div>
    `.trim();
    document.body.appendChild(modal);
    return modal;
  }

  function optionList(values, selected, placeholder) {
    const opts = [`<option value="">${escapeHtml(placeholder || 'Pilih')}</option>`];
    values.forEach((item) => {
      const value = typeof item === 'object' ? String(item.value ?? item.id ?? item.name ?? '') : String(item || '');
      const label = typeof item === 'object' ? String(item.label ?? item.name ?? item.id ?? '') : String(item || '');
      opts.push(`<option value="${escapeHtml(value)}" ${String(selected || '') === value ? 'selected' : ''}>${escapeHtml(label)}</option>`);
    });
    return opts.join('');
  }

  function penilaianKpiRowsHtml(rows, readonly) {
    const aktualDisabled = readonly ? 'readonly disabled' : '';
    const lockedAttr = 'readonly tabindex="-1" aria-readonly="true"';
    const finalRows = rows?.length ? rows : cloneFields(DEFAULT_KPI_ROWS);
    return finalRows.map((row, index) => `
      <tr data-kpi-row="${index}">
        <td class="bm-kpi-no"><input class="form-control" data-kpi-field="no" value="${escapeHtml(row.no || index + 1)}" ${lockedAttr}></td>
        <td class="bm-kpi-name"><textarea class="form-control" rows="2" data-kpi-field="kpi" placeholder="Nama KPI" ${lockedAttr}>${escapeHtml(row.kpi || '')}</textarea></td>
        <td class="bm-kpi-small"><input class="form-control" data-kpi-field="target" value="${escapeHtml(row.target || '')}" placeholder="Target" ${lockedAttr}></td>
        <td class="bm-kpi-small"><input class="form-control" data-kpi-field="bobot" value="${escapeHtml(row.bobot || '')}" placeholder="Bobot (%)" ${lockedAttr}></td>
        <td class="bm-kpi-small"><input class="form-control" data-kpi-field="aktual" value="${escapeHtml(row.aktual || '')}" placeholder="Aktual / Tercapai" ${aktualDisabled}></td>
        <td class="bm-kpi-small"><input class="form-control" data-kpi-field="skor_akhir" value="${escapeHtml(row.skor_akhir || '')}" placeholder="Otomatis" readonly tabindex="-1" aria-readonly="true"></td>
      </tr>
    `).join('');
  }

  function parsePenilaianNumber(value) {
    const cleaned = String(value || '').replace('%', '').replace(',', '.').trim();
    if (!cleaned) return NaN;
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : NaN;
  }

  function formatPenilaianPercent(value) {
    if (!Number.isFinite(value)) return '';
    const rounded = Math.round(value * 100) / 100;
    return `${Number.isInteger(rounded) ? String(rounded) : String(rounded).replace('.', ',')}%`;
  }

  function calculatePenilaianSkorAkhir(bobot, target, aktual) {
    if (!Number.isFinite(bobot) || !Number.isFinite(target) || !Number.isFinite(aktual) || target <= 0) return NaN;
    return (aktual / target) * bobot;
  }

  function recalcPenilaianTotal(modal) {
    let bobotTotal = 0;
    let skorAkhirTotal = 0;

    $$('[data-kpi-row]', modal).forEach((row) => {
      const bobotInput = $('[data-kpi-field="bobot"]', row);
      const targetInput = $('[data-kpi-field="target"]', row);
      const aktualInput = $('[data-kpi-field="aktual"]', row);
      const skorAkhirInput = $('[data-kpi-field="skor_akhir"]', row);

      const bobot = parsePenilaianNumber(bobotInput?.value);
      const target = parsePenilaianNumber(targetInput?.value);
      const aktual = parsePenilaianNumber(aktualInput?.value);
      const skorAkhir = calculatePenilaianSkorAkhir(bobot, target, aktual);

      if (skorAkhirInput) skorAkhirInput.value = Number.isFinite(skorAkhir) ? formatPenilaianPercent(skorAkhir) : '';
      if (Number.isFinite(bobot)) bobotTotal += bobot;
      if (Number.isFinite(skorAkhir)) skorAkhirTotal += skorAkhir;
    });

    const bobotEl = $('[data-penilaian-bobot-total]', modal);
    const totalEl = $('[data-penilaian-total]', modal);
    const bobotText = bobotTotal ? formatPenilaianPercent(bobotTotal) : '-';
    const skorAkhirText = skorAkhirTotal ? formatPenilaianPercent(skorAkhirTotal) : '-';

    if (bobotEl) bobotEl.textContent = bobotText;
    if (totalEl) totalEl.textContent = skorAkhirText;
    return skorAkhirTotal ? skorAkhirText : '';
  }

  function applyPenilaianEmployee(modal, source) {
    const idEl = $('[data-penilaian-field="id"]', modal);
    const nameEl = $('[data-penilaian-field="name"]', modal);
    const subEl = $('[data-penilaian-field="sub"]', modal);
    const divEl = $('[data-penilaian-field="divisi"]', modal);
    const jabatanEl = $('[data-penilaian-field="jabatan"]', modal);

    let employee = null;
    const employeeOptions = getBmEmployeeOptions();
    if (source === 'name') employee = employeeOptions.find((item) => item.name === nameEl.value);
    else employee = employeeOptions.find((item) => item.id === idEl.value);
    if (!employee) return;

    idEl.value = employee.id;
    nameEl.value = employee.name;
    subEl.value = employee.sub;
    divEl.value = employee.divisi;
    jabatanEl.value = employee.jabatan;
  }

  function collectPenilaianData(modal) {
    const read = (name) => String($(`[data-penilaian-field="${name}"]`, modal)?.value || '').trim();
    const kpiRows = $$('[data-kpi-row]', modal).map((row) => {
      const get = (field) => String($(`[data-kpi-field="${field}"]`, row)?.value || '').trim();
      return {
        no: get('no'),
        kpi: get('kpi'),
        target: get('target'),
        bobot: get('bobot'),
        aktual: get('aktual'),
        skor_akhir: get('skor_akhir'),
      };
    });
    const total = recalcPenilaianTotal(modal);
    return {
      id: read('id'),
      name: read('name'),
      periode: read('periode'),
      sub: read('sub'),
      divisi: read('divisi'),
      jabatan: read('jabatan'),
      catatan: read('catatan'),
      kpiRows,
      total,
    };
  }

  function writePenilaianRow(table, row, data, mode) {
    const config = TABLE_CONFIG[table.id];
    const tr = row || document.createElement('tr');
    const recordId = String(data?.record_id || row?.dataset?.bmPenilaianId || '').trim() || bmUid('pn');
    const payload = { ...data, record_id: recordId };
    tr.innerHTML = `
      <td></td>
      <td>${escapeHtml(payload.id || '')}</td>
      <td>${escapeHtml(payload.name || '')}</td>
      <td>${escapeHtml(payload.periode || '')}</td>
      <td>${escapeHtml(payload.jabatan || '')}</td>
      <td>${escapeHtml(payload.total || '')}</td>
    `.trim();
    ensureActionCell(tr, config);
    tr.dataset.bmPenilaianId = recordId;
    tr.dataset.bmPenilaianData = JSON.stringify(payload);
    if (mode === 'add' || mode === 'restore') table.querySelector('tbody').appendChild(tr);
    if (mode !== 'restore') savePenilaianRecord(payload);
    renumber(table);
  }

  function openPenilaianCrud(mode, table, row) {
    const modal = ensurePenilaianModal();
    const readonly = mode === 'view';
    const data = mode === 'add' ? blankPenilaianData() : rowToPenilaianData(row);
    const titlePrefix = mode === 'add' ? 'Tambah' : mode === 'edit' ? 'Edit' : 'Lihat';
    $('.modal-title', modal).textContent = `${titlePrefix} Penilaian Karyawan`;

    const disabled = readonly ? 'disabled' : '';
    const readonlyAttr = readonly ? 'readonly disabled' : '';
    $('.bm-penilaian-body', modal).innerHTML = `
      <div class="row g-3">
        <div class="col-md-4">
          <label class="bm-penilaian-label">ID Karyawan</label>
          <select class="form-select bm-penilaian-control bm-penilaian-select" data-penilaian-field="id" ${disabled}>${optionList(getBmEmployeeOptions().map((item) => ({ value: item.id, label: item.id })), data.id, 'Pilih ID Karyawan')}</select>
        </div>
        <div class="col-md-4">
          <label class="bm-penilaian-label">Nama Karyawan</label>
          <select class="form-select bm-penilaian-control bm-penilaian-select" data-penilaian-field="name" ${disabled}>${optionList(getBmEmployeeOptions().map((item) => ({ value: item.name, label: item.name })), data.name, 'Pilih Nama Karyawan')}</select>
        </div>
        <div class="col-md-4">
          <label class="bm-penilaian-label">Periode</label>
          <select class="form-select bm-penilaian-control bm-penilaian-select" data-penilaian-field="periode" ${disabled}>${optionList(PERIOD_OPTIONS, data.periode, 'Pilih Periode')}</select>
        </div>
        <div class="col-md-4">
          <label class="bm-penilaian-label">Sub Perusahaan</label>
          <input class="form-control bm-penilaian-control" data-penilaian-field="sub" value="${escapeHtml(data.sub || '')}" readonly>
        </div>
        <div class="col-md-4">
          <label class="bm-penilaian-label">Divisi</label>
          <input class="form-control bm-penilaian-control" data-penilaian-field="divisi" value="${escapeHtml(data.divisi || '')}" readonly>
        </div>
        <div class="col-md-4">
          <label class="bm-penilaian-label">Jabatan</label>
          <input class="form-control bm-penilaian-control" data-penilaian-field="jabatan" value="${escapeHtml(data.jabatan || '')}" readonly>
        </div>
        <div class="col-12 mt-4">
          <div class="bm-penilaian-table">
            <table class="table text-center align-middle">
              <thead>
                <tr><th>No</th><th>KPI</th><th>Target</th><th>Bobot (%)</th><th>Aktual / Tercapai</th><th>Skor Akhir</th></tr>
              </thead>
              <tbody>${penilaianKpiRowsHtml(data.kpiRows, readonly)}</tbody>
              <tfoot>
                <tr>
                  <td colspan="3" class="text-end fw-bold pe-3">Jumlah</td>
                  <td class="fw-bold" data-penilaian-bobot-total>100%</td>
                  <td></td>
                  <td class="fw-bold" data-penilaian-total>${escapeHtml(data.total || '-')}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        <div class="col-12">
          <label class="bm-penilaian-label">Catatan</label>
          <textarea class="form-control bm-penilaian-note" data-penilaian-field="catatan" ${readonlyAttr}>${escapeHtml(data.catatan || '')}</textarea>
        </div>
      </div>
    `.trim();

    const penilaianSaveBtn = $('[data-penilaian-save]', modal);
    if (penilaianSaveBtn) {
      penilaianSaveBtn.style.display = readonly ? 'none' : '';
      penilaianSaveBtn.onclick = null;
    }

    if (!readonly) {
      $('[data-penilaian-field="id"]', modal).addEventListener('change', () => applyPenilaianEmployee(modal, 'id'));
      $('[data-penilaian-field="name"]', modal).addEventListener('change', () => applyPenilaianEmployee(modal, 'name'));
      $$('[data-kpi-field]', modal).forEach((input) => input.addEventListener('input', () => recalcPenilaianTotal(modal)));
      if (penilaianSaveBtn) penilaianSaveBtn.onclick = function () {
        const payload = collectPenilaianData(modal);
        payload.record_id = String(data?.record_id || row?.dataset?.bmPenilaianId || '').trim();
        if (!payload.id) return window.alert('ID Karyawan wajib dipilih.');
        if (!payload.name) return window.alert('Nama Karyawan wajib dipilih.');
        if (!payload.periode) return window.alert('Periode wajib dipilih.');
        writePenilaianRow(table, mode === 'edit' ? row : null, payload, mode);
        hideModal();
      };
    }

    recalcPenilaianTotal(modal);
    showModal(modal);
  }

  function bindEvents() {
    document.addEventListener('click', function (event) {
      const photoClose = event.target.closest('[data-bm-photo-close]');
      if (photoClose) {
        event.preventDefault();
        closePhotoModal();
        return;
      }

      const rawPhotoPreview = event.target.closest('[data-photo-preview]');
      if (rawPhotoPreview) {
        event.preventDefault();
        event.stopImmediatePropagation();
        const kind = String(rawPhotoPreview.dataset.photoKind || '').toLowerCase();
        const title = kind.includes('out') ? 'Lihat Photo Check Out' : 'Lihat Photo Check In';
        const src = rawPhotoPreview.dataset.photoSrc || rawPhotoPreview.dataset.previewSrc || fallbackPhotoSrc();
        openPhotoModal(src, title, 'Preview foto absensi');
        return;
      }

      const photoOpen = event.target.closest('[data-bm-force-photo-open]');
      if (photoOpen) {
        event.preventDefault();
        event.stopImmediatePropagation();
        openPhotoModal(photoOpen.dataset.photoSrc, photoOpen.dataset.photoTitle, photoOpen.dataset.photoMeta);
        return;
      }

      const close = event.target.closest('[data-bm-force-close]');
      if (close) {
        event.preventDefault();
        hideModal();
        return;
      }

      const addButton = event.target.closest('.crud-add-btn');
      if (addButton) {
        const card = addButton.closest('.card');
        const table = card?.querySelector('table');
        const config = table ? TABLE_CONFIG[table.id] : null;
        if (table && config?.add) {
          event.preventDefault();
          event.stopImmediatePropagation();
          openCrud('add', table, null);
        }
        return;
      }

      const action = event.target.closest('.tdActions button, .tdActions a');
      if (!action) return;

      const table = action.closest('table');
      const row = action.closest('tr');
      const config = table ? TABLE_CONFIG[table.id] : null;
      if (!table || !row || !config) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      if (isAction(action, ['lihat', 'view', 'bx-show']) && config.view) {
        openCrud('view', table, row);
        return;
      }

      if (isAction(action, ['edit', 'bx-edit-alt']) && config.edit) {
        openCrud('edit', table, row);
        return;
      }

      if (isAction(action, ['hapus', 'delete', 'delate', 'bx-trash']) && config.delete) {
        openDelete(table, row);
      }
    }, true);

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closePhotoModal();
        hideModal();
      }
    });
  }

  function boot() {
    injectForceStyle();
    restoreForceCrudTableRows();
    restorePenilaianRows();
    prepareTargetTables();
    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();


/* ==============================================================
   BM Universal Delete Fallback
   Tujuan: memastikan semua tombol Hapus/ikon trash pada fitur BM aktif.
   Mekanisme ini hanya bekerja jika handler asli halaman tidak membuka modal hapus.
   Jadi handler custom yang sudah ada tetap menjadi prioritas utama.
   ============================================================== */
(function () {
  'use strict';

  const DELETE_STORAGE_MAP = [
    { attr: 'spDel', key: 'ceoSubCompaniesV1', eventName: 'ceo:org:changed', label: 'Sub Perusahaan' },
    { attr: 'dvDel', key: 'ceoDivisiV2', eventName: 'ceo:org:changed', label: 'Divisi' },
    { attr: 'jbDel', key: 'ceoJabatanV2', eventName: 'ceo:org:changed', label: 'Jabatan' },
    { attr: 'krDel', key: 'ceoEmployeesV2', eventName: 'ceo:employees:changed', label: 'Karyawan' },
    { attr: 'konDel', key: 'ceoEmployeeContractsV1', label: 'Kontrak Karyawan' },
    { attr: 'kgtDel', key: 'ceoEmployeeActivitiesV1', label: 'Kegiatan Karyawan' },
    { attr: 'shiftDel', key: 'ceoWorkShiftScenariosV1', label: 'Skenario Jam Kerja' },
    { attr: 'bmRrkDel', key: 'bmRrkRowsV1', label: 'RRK' },
    { attr: 'bmReportDel', key: 'bmReportPengerjaanRowsV1', label: 'Report Pengerjaan' },
    { attr: 'evDel', key: 'ceoCalendarEventsV1', eventName: 'ceo:calendar:changed', label: 'Jadwal' },
  ];

  function qs(sel, root = document) { return root.querySelector(sel); }
  function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

  function readArray(key) {
    if (!key) return [];
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function writeArray(key, rows) {
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(Array.isArray(rows) ? rows : []));
  }

  function getDeleteMeta(btn) {
    for (const meta of DELETE_STORAGE_MAP) {
      const id = String(btn?.dataset?.[meta.attr] || '').trim();
      if (id) return { ...meta, id };
    }
    return null;
  }

  function isDeleteButton(btn) {
    if (!btn) return false;
    if (getDeleteMeta(btn)) return true;
    const icon = btn.querySelector?.('i')?.className || '';
    const hay = [
      btn.getAttribute?.('title') || '',
      btn.getAttribute?.('aria-label') || '',
      btn.textContent || '',
      icon,
    ].join(' ').toLowerCase();
    return hay.includes('hapus') || hay.includes('delete') || hay.includes('delate') || hay.includes('bx-trash');
  }

  function isInsideDeleteModal(btn) {
    return !!btn.closest?.('#ceoDeleteModal, #bmForceDeleteModal, [data-bm-force-delete-confirm], .modal-footer');
  }

  function isAnyDeleteModalOpen() {
    return !!document.querySelector(
      '#ceoDeleteModal.show, #bmForceDeleteModal.bm-show, #bmForceDeleteModal.show, .modal.show, .modal[style*="display: block"]'
    );
  }

  function renumber(table) {
    if (!table) return;
    qsa('tbody tr', table).forEach((tr, index) => {
      const firstCell = tr.querySelector('td');
      if (!firstCell) return;
      if (firstCell.hasAttribute('colspan')) return;
      firstCell.textContent = String(index + 1);
    });
  }

  function getFeatureLabel(table, meta) {
    if (meta?.label) return meta.label;
    const title = table?.closest?.('.card')?.querySelector?.('.card-title, h1, h2, h3, h4, h5, h6')?.textContent?.trim();
    if (title) return title.replace(/^(data|tabel)\s+/i, '').trim();
    return 'Data';
  }

  function removeFromStorage(meta) {
    if (!meta?.key || !meta?.id) return false;
    const before = readArray(meta.key);
    const after = before.filter((item) => String(item?.id || item?.record_id || '') !== String(meta.id));
    writeArray(meta.key, after);
    if (meta.eventName) window.dispatchEvent(new Event(meta.eventName));
    return before.length !== after.length;
  }

  function removeGenericStoredRow(table, row) {
    // Untuk row generic yang menyimpan field di dataset, refresh localStorage jika ada key tabel sederhana.
    const storageByTable = {
      tblInstruksiTugas: 'bmInstruksiTugasV1',
      tblPenilaianKaryawan: 'bmPenilaianKaryawanV1',
      tblRrk: 'bmRrkRowsV1',
      tblReportPengerjaan: 'bmReportPengerjaanRowsV1',
    };
    const key = storageByTable[String(table?.id || '')];
    if (!key) return;

    const rowId = String(
      row?.dataset?.bmPenilaianId ||
      row?.dataset?.bmRrkId ||
      row?.dataset?.bmReportId ||
      ''
    ).trim();

    if (rowId) {
      writeArray(key, readArray(key).filter((item) => String(item?.id || item?.record_id || '') !== rowId));
    } else if (table.id === 'tblInstruksiTugas') {
      const rows = qsa('tbody tr', table)
        .filter((tr) => tr !== row)
        .map((tr) => {
          try { return JSON.parse(tr.dataset.bmForceCrudFields || tr.dataset.bmCrudFields || '[]'); }
          catch (_) { return []; }
        })
        .filter((fields) => Array.isArray(fields) && fields.length);
      writeArray(key, rows);
    }
  }

  function showDeletedToast(label) {
    if (typeof window.ceoToast === 'function') {
      window.ceoToast(`${label} berhasil dihapus.`, 'warning');
    }
  }

  function fallbackDelete(btn, row, table) {
    const meta = getDeleteMeta(btn);
    const label = getFeatureLabel(table, meta);
    const ok = window.confirm(`Hapus ${label} ini?`);
    if (!ok) return;

    removeFromStorage(meta);
    removeGenericStoredRow(table, row);

    row?.remove?.();
    renumber(table);
    showDeletedToast(label);
  }

  document.addEventListener('click', function (event) {
    const btn = event.target?.closest?.('button, a');
    if (!btn || isInsideDeleteModal(btn) || !isDeleteButton(btn)) return;

    const row = btn.closest('tr');
    const table = btn.closest('table');
    if (!row || !table) return;

    // Beri kesempatan handler asli halaman bekerja dulu.
    window.setTimeout(() => {
      if (!row.isConnected) return;
      if (isAnyDeleteModalOpen()) return;
      fallbackDelete(btn, row, table);
    }, 120);
  }, true);
})();


/* ==============================================================
   BM Kalender - fallback hapus jadwal minimal final
   Memastikan icon hapus jadwal aktif tanpa mengubah tampilan/data lain.
   ============================================================== */
(function () {
  'use strict';
  const CALENDAR_STORAGE_KEY = 'ceoCalendarEventsV1';

  function readCalendarEvents() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CALENDAR_STORAGE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function writeCalendarEvents(events) {
    localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(Array.isArray(events) ? events : []));
  }

  function removeCalendarEvent(eventId) {
    const id = String(eventId || '').trim();
    if (!id) return;
    const after = readCalendarEvents().filter((item) => String(item?.id || item?.record_id || '').trim() !== id);
    writeCalendarEvents(after);
    window.dispatchEvent(new Event('ceo:calendar:changed'));
    if (typeof window.ceoToast === 'function') window.ceoToast('Jadwal berhasil dihapus.', 'warning');
  }

  document.addEventListener('click', function (event) {
    const btn = event.target?.closest?.('[data-ev-del]');
    if (!btn) return;
    const eventId = btn.getAttribute('data-ev-del');
    if (!eventId) return;

    window.setTimeout(() => {
      if (!document.body.contains(btn)) return;
      const hasModal = !!document.querySelector('#ceoDeleteModal.show, .modal.show, .modal[style*="display: block"]');
      if (hasModal) return;
      if (!window.confirm('Hapus Jadwal ini?')) return;
      removeCalendarEvent(eventId);
    }, 180);
  }, false);
})();

/* =========================================================
   Dokumen & Kolaborasi - Foldering
   Desain dan perilaku mengikuti layout Sneat/Bisa Media
   ========================================================= */
(function () {
  'use strict';

  if (window.__dokumenKolaborasiLoaded) return;
  window.__dokumenKolaborasiLoaded = true;

  const folderPage = 'BM_folder.html';
  let activeFolderTab = 'my';
  let activeFolderKeyword = '';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function textOf(element) {
    return (element && element.textContent ? element.textContent : '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function isFolderPage() {
    return location.pathname.toLowerCase().endsWith(folderPage.toLowerCase());
  }

  function injectDocsMenu() {
    const menu = document.querySelector('#layout-menu .menu-inner');
    if (!menu || menu.querySelector('[data-docs-menu="true"], [data-docs-menu-item="folder"]')) return;

    const header = document.createElement('li');
    header.className = 'menu-header small text-uppercase';
    header.setAttribute('data-docs-menu', 'true');
    header.innerHTML = '<span class="menu-header-text">Dokumen &amp; Kolaborasi</span>';

    const item = document.createElement('li');
    item.className = 'menu-item' + (isFolderPage() ? ' active' : '');
    item.setAttribute('data-docs-menu-item', 'folder');
    item.innerHTML = '<a class="menu-link" href="' + folderPage + '"><i class="menu-icon bx bx-folder"></i><div>Folder</div></a>';

    const perusahaanHeader = Array.from(menu.querySelectorAll('.menu-header')).find(function (node) {
      return textOf(node).includes('perusahaan');
    });

    if (perusahaanHeader) {
      menu.insertBefore(header, perusahaanHeader);
      menu.insertBefore(item, perusahaanHeader);
      return;
    }

    const penilaianLink = Array.from(menu.querySelectorAll('a.menu-link')).find(function (link) {
      const href = (link.getAttribute('href') || '').toLowerCase();
      return href.includes('penilaian') || textOf(link).includes('penilaian');
    });

    if (penilaianLink && penilaianLink.closest('li')) {
      penilaianLink.closest('li').insertAdjacentElement('afterend', item);
      item.insertAdjacentElement('beforebegin', header);
      return;
    }

    menu.appendChild(header);
    menu.appendChild(item);
  }

  function today() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return day + '/' + month + '/' + year;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function makeFolderId(name) {
    const base = String(name || 'folder')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'folder';
    return base + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function buildFolderActionMenu(folderId) {
    const safeId = escapeHtml(folderId);
    return [
      '<div class="dropdown">',
      '  <button class="btn btn-sm btn-icon btn-text-secondary rounded-pill dropdown-toggle hide-arrow" data-folder-dots="true" type="button" aria-expanded="false" aria-label="Aksi folder">',
      '    <iconify-icon icon="mdi:dots-vertical"></iconify-icon>',
      '  </button>',
      '  <ul class="dropdown-menu dropdown-menu-end">',
      '    <li><button class="dropdown-item" type="button" data-folder-action="open" data-folder-id="' + safeId + '"><span class="bm-menu-iconify"><iconify-icon icon="solar:folder-open-bold"></iconify-icon></span>Buka</button></li>',
      '    <li><button class="dropdown-item" type="button" data-folder-action="favorite" data-folder-id="' + safeId + '"><span class="bm-menu-iconify"><iconify-icon icon="material-symbols:star-rounded"></iconify-icon></span>Tambahkan ke favorites</button></li>',
      '    <li><button class="dropdown-item" type="button" data-folder-action="share" data-folder-id="' + safeId + '"><span class="bm-menu-iconify"><iconify-icon icon="solar:share-bold"></iconify-icon></span>Berbagi</button></li>',
      '    <li><button class="dropdown-item" type="button" data-folder-action="details" data-folder-id="' + safeId + '"><span class="bm-menu-iconify"><iconify-icon icon="material-symbols:list-alt-rounded"></iconify-icon></span>Details</button></li>',
      '    <li><button class="dropdown-item" type="button" data-folder-action="copy" data-folder-id="' + safeId + '"><span class="bm-menu-iconify"><iconify-icon icon="material-symbols:content-copy-rounded"></iconify-icon></span>Buat salinan</button></li>',
      '    <li><button class="dropdown-item" type="button" data-folder-action="rename" data-folder-id="' + safeId + '"><span class="bm-menu-iconify"><iconify-icon icon="material-symbols:edit-square-outline-rounded"></iconify-icon></span>Rename</button></li>',
      '    <li><hr class="dropdown-divider" /></li>',
      '    <li><button class="dropdown-item text-danger" type="button" data-folder-action="delete" data-folder-id="' + safeId + '"><span class="bm-menu-iconify"><iconify-icon icon="material-symbols:delete-rounded"></iconify-icon></span>Hapus</button></li>',
      '  </ul>',
      '</div>'
    ].join('');
  }

  function folderItemsById(folderId) {
    return Array.from(document.querySelectorAll('[data-folder-row][data-folder-id]')).filter(function (item) {
      return item.getAttribute('data-folder-id') === folderId;
    });
  }

  let bmFavoriteOrderCounter = Date.now();

  function getFavoriteContainer(item) {
    if (!item) return null;
    if (item.tagName && item.tagName.toLowerCase() === 'tr') return document.getElementById('folderTableBody');
    if (item.parentElement && item.parentElement.matches && item.parentElement.matches('#folderGridView .row')) return item.parentElement;
    return item.parentElement || null;
  }

  function numberAttr(item, attr, fallback) {
    const raw = item ? Number(item.getAttribute(attr)) : NaN;
    return Number.isFinite(raw) ? raw : fallback;
  }

  function getSiblingOriginalOrder(item, direction) {
    let current = item ? item[direction] : null;
    while (current) {
      if (current.matches && current.matches('[data-folder-row]')) {
        const value = Number(current.getAttribute('data-original-order'));
        if (Number.isFinite(value)) return value;
      }
      current = current[direction];
    }
    return null;
  }

  function ensureOriginalOrder(item) {
    if (!item || item.getAttribute('data-original-order')) return;

    const prevOrder = getSiblingOriginalOrder(item, 'previousElementSibling');
    const nextOrder = getSiblingOriginalOrder(item, 'nextElementSibling');
    let order;

    if (prevOrder !== null && nextOrder !== null) {
      order = (prevOrder + nextOrder) / 2;
    } else if (nextOrder !== null) {
      order = nextOrder - 1;
    } else if (prevOrder !== null) {
      order = prevOrder + 1;
    } else {
      order = bmFavoriteOrderCounter++;
    }

    item.setAttribute('data-original-order', String(order));
  }

  function ensureFavoriteOrders() {
    document.querySelectorAll('[data-folder-row]').forEach(function (item) {
      ensureOriginalOrder(item);
      if (item.getAttribute('data-favorite') === 'true' && !item.getAttribute('data-favorite-order')) {
        item.setAttribute('data-favorite-order', String(++bmFavoriteOrderCounter));
      }
    });
  }

  function compareFavoriteItems(a, b) {
    const aFav = a.getAttribute('data-favorite') === 'true';
    const bFav = b.getAttribute('data-favorite') === 'true';

    // Semua item berbintang selalu masuk grup paling atas.
    if (aFav !== bFav) return aFav ? -1 : 1;

    // Di dalam grup berbintang, urutan tetap mengikuti posisi awal.
    // Jadi jika item berbintang pertama dibatalkan, item berbintang berikutnya otomatis naik ke posisi 1.
    const aOrder = numberAttr(a, 'data-original-order', 0);
    const bOrder = numberAttr(b, 'data-original-order', 0);
    if (aOrder !== bOrder) return aOrder - bOrder;

    return String(a.getAttribute('data-name') || '').localeCompare(String(b.getAttribute('data-name') || ''));
  }

  function reorderFavoriteContainer(container) {
    if (!container) return;

    const items = Array.from(container.children || []).filter(function (item) {
      return item.matches && item.matches('[data-folder-row]');
    });

    if (!items.length) return;

    ensureFavoriteOrders();
    items.sort(compareFavoriteItems);
    items.forEach(function (item) { container.appendChild(item); });
  }

  function reorderFavoriteContainers() {
    reorderFavoriteContainer(document.getElementById('folderTableBody'));
    reorderFavoriteContainer(document.querySelector('#folderGridView .row'));
  }

  function moveFolderToTop(folderId) {
    folderItemsById(folderId).forEach(function (item) {
      ensureOriginalOrder(item);
      item.setAttribute('data-favorite', 'true');
      item.setAttribute('data-favorite-order', String(++bmFavoriteOrderCounter));
    });

    reorderFavoriteContainers();
    refreshFolderFilter();
  }

  function restoreFolderFromFavorite(folderId) {
    folderItemsById(folderId).forEach(function (item) {
      item.setAttribute('data-favorite', 'false');
      item.removeAttribute('data-favorite-order');
    });

    reorderFavoriteContainers();
    refreshFolderFilter();
  }

  function ensureStaticGridActions() {
    document.querySelectorAll('#folderGridView [data-folder-row]').forEach(function (item) {
      const folderId = item.getAttribute('data-folder-id');
      const card = item.querySelector('.card');
      if (!folderId || !card || card.querySelector('[data-folder-action]')) return;

      card.classList.add('bm-folder-grid-card', 'position-relative');
      card.insertAdjacentHTML('afterbegin', '<div class="position-absolute top-0 end-0 m-2">' + buildFolderActionMenu(folderId) + '</div>');
    });
  }

  function getFolderName(folderId) {
    const item = folderItemsById(folderId)[0];
    return item ? (item.getAttribute('data-name') || textOf(item)) : 'Folder';
  }

  function setFolderName(folderId, name) {
    folderItemsById(folderId).forEach(function (item) {
      item.setAttribute('data-name', name);
      const title = item.querySelector('.bm-folder-title-text');
      if (title) title.textContent = name;
    });
    refreshFolderFilter();
  }

  function toggleFolderFavorite(folderId) {
    const items = folderItemsById(folderId);
    const current = items.some(function (item) { return item.getAttribute('data-favorite') === 'true'; });
    const next = !current;

    items.forEach(function (item) {
      item.setAttribute('data-favorite', String(next));
      const title = item.querySelector('.bm-folder-title');
      if (!title) return;

      let star = title.querySelector('.bm-folder-star');
      if (next && !star) {
        star = document.createElement('i');
        star.className = 'bx bxs-star text-warning align-middle bm-folder-star';
        title.appendChild(document.createTextNode(' '));
        title.appendChild(star);
      } else if (!next && star) {
        star.remove();
      }
    });

    if (next) {
      moveFolderToTop(folderId);
    } else {
      restoreFolderFromFavorite(folderId);
    }
  }

  function showFolderFeedback(message, type) {
    if (typeof window.ceoToast === 'function') {
      window.ceoToast(message, type || 'info');
      return;
    }
    if (message) window.alert(message);
  }

  function handleFolderAction(action, folderId) {
    if (!action || !folderId) return;

    const name = getFolderName(folderId);

    if (action === 'open') {
      if (typeof window.bmOpenDriveItemById === 'function' && window.bmOpenDriveItemById(folderId)) {
        return;
      }

      const firstItem = folderItemsById(folderId)[0];
      const link = firstItem ? firstItem.getAttribute('data-link') : '';
      if (link) {
        window.open(link, '_blank', 'noopener,noreferrer');
      } else {
        showFolderFeedback('Membuka folder: ' + name, 'info');
      }
      return;
    }

    if (action === 'favorite') {
      toggleFolderFavorite(folderId);
      showFolderFeedback('Status favorit folder diperbarui.', 'success');
      return;
    }

    if (action === 'share') {
      showFolderFeedback('Popup berbagi untuk "' + name + '" siap dihubungkan.', 'info');
      return;
    }

    if (action === 'details') {
      if (typeof window.bmOpenDriveDetailsPanel === 'function' && window.bmOpenDriveDetailsPanel(folderId)) return;
      showFolderFeedback('Details: ' + name, 'info');
      return;
    }

    if (action === 'copy') {
      const firstItem = folderItemsById(folderId)[0];
      const itemType = firstItem ? (firstItem.getAttribute('data-item-type') || 'folder') : 'folder';
      const link = firstItem ? (firstItem.getAttribute('data-link') || '') : '';
      addDriveItemRow(name + ' - Salinan', { itemType: itemType, link: link });
      showFolderFeedback('Salinan berhasil dibuat.', 'success');
      return;
    }

    if (action === 'rename') {
      if (typeof window.bmOpenRenameDialog === 'function') {
        window.bmOpenRenameDialog({
          value: name,
          onConfirm: function (nextName) {
            setFolderName(folderId, nextName);
            showFolderFeedback('Nama berhasil diperbarui.', 'success');
          }
        });
        return;
      }

      const nextName = window.prompt('Masukkan nama baru:', name);
      if (nextName && nextName.trim()) {
        setFolderName(folderId, nextName.trim());
        showFolderFeedback('Nama berhasil diperbarui.', 'success');
      }
      return;
    }

    if (action === 'delete') {
      if (typeof window.bmOpenDeleteDialog === 'function') {
        window.bmOpenDeleteDialog({
          name: name,
          onConfirm: function () {
            folderItemsById(folderId).forEach(function (item) { item.remove(); });
            showFolderFeedback('Data berhasil dihapus.', 'warning');
          }
        });
        return;
      }
      if (!window.confirm('Hapus "' + name + '"?')) return;
      folderItemsById(folderId).forEach(function (item) { item.remove(); });
      showFolderFeedback('Data berhasil dihapus.', 'warning');
      return;
    }
  }

  function refreshFolderFilter() {
    if (typeof reorderFavoriteContainers === 'function') reorderFavoriteContainers();
    const keyword = activeFolderKeyword;
    document.querySelectorAll('[data-folder-row]').forEach(function (row) {
      const type = row.getAttribute('data-folder-type') || 'my';
      const name = (row.getAttribute('data-name') || textOf(row)).toLowerCase();
      const matchTab = activeFolderTab === 'shared' ? type === 'shared' : type !== 'shared';
      const matchKeyword = keyword ? name.includes(keyword) : true;
      row.hidden = !(matchTab && matchKeyword);
    });
  }

  function getItemMeta(itemType, link, name, fileKind) {
    const type = itemType || 'folder';
    const kind = String(fileKind || '').toLowerCase();
    const source = String((name || '') + ' ' + (link || '')).toLowerCase();

    if (type === 'folder' || kind === 'folder') {
      return { icon: 'solar:folder-open-bold', subLabel: 'Folder pribadi', gridLabel: 'Tipe: Folder' };
    }

    if (type === 'google-forms' || type === 'google-form' || /\/forms\//i.test(link || '') || kind === 'google-form' || kind === 'google-forms' || kind === 'form') {
      return { icon: 'mdi:form-select', subLabel: 'Google Forms', gridLabel: 'Tipe: Google Form' };
    }

    if (kind === 'sheet' || kind === 'spreadsheet' || type === 'google-sheet' || /\/spreadsheets\//i.test(link || '') || /\.(xls|xlsx|csv)$/i.test(source)) {
      return { icon: 'mdi:file-table-outline', subLabel: 'Spreadsheet', gridLabel: 'Tipe: Spreadsheet' };
    }

    if (kind === 'word' || kind === 'docx' || /\.(doc|docx)$/i.test(source)) {
      return { icon: 'mdi:microsoft-word', subLabel: 'File Word', gridLabel: 'Tipe: Word' };
    }

    if (kind === 'doc' || kind === 'docs' || type === 'google-doc' || /\/document\//i.test(link || '')) {
      return { icon: 'solar:document-bold', subLabel: 'Google Docs', gridLabel: 'Tipe: Google Docs' };
    }

    if (kind === 'pdf' || /\.pdf$/i.test(source)) {
      return { icon: 'mdi:file-pdf-box', subLabel: 'File PDF', gridLabel: 'Tipe: PDF' };
    }

    if (kind === 'image' || /\.(png|jpe?g|webp|gif|svg)$/i.test(source)) {
      return { icon: 'solar:gallery-bold', subLabel: 'File Gambar', gridLabel: 'Tipe: Gambar' };
    }

    if (type === 'google-link') {
      return { icon: 'fa6-brands:google-drive', subLabel: 'Google Docs / Sheet', gridLabel: 'Tipe: Link Dokumen' };
    }

    if (type === 'file') {
      return { icon: 'solar:upload-square-bold', subLabel: 'File diupload', gridLabel: 'Tipe: File' };
    }

    return { icon: 'solar:folder-open-bold', subLabel: 'Folder pribadi', gridLabel: 'Tipe: Folder' };
  }

  function inferGoogleType(link) {
    if (/\/spreadsheets\//i.test(link)) return 'google-sheet';
    if (/\/document\//i.test(link)) return 'google-doc';
    if (/\/forms\//i.test(link)) return 'google-forms';
    return 'google-link';
  }

  function inferGoogleName(link, fallbackName) {
    const value = (fallbackName || '').trim();
    if (value) return value;
    if (/\/spreadsheets\//i.test(link)) return 'Google Sheet';
    if (/\/document\//i.test(link)) return 'Google Docs';
    if (/\/forms\//i.test(link)) return 'Google Form';
    return 'Google Docs / Sheet';
  }

  function addDriveItemRow(name, options) {
    const opts = options || {};
    const itemType = opts.itemType || 'folder';
    const link = opts.link || '';
    const safeName = escapeHtml(name);
    const safeLink = escapeHtml(link);
    const date = today();
    const folderId = makeFolderId(name);
    const parentId = Object.prototype.hasOwnProperty.call(opts, 'parentId') ? String(opts.parentId || '') : null;
    const documentPreviewHtml = opts.documentPreviewHtml || '';
    const templateName = opts.templateName || name;
    const fileKind = String(opts.fileKind || '').toLowerCase();
    if (documentPreviewHtml) {
      window.bmDriveDocumentPreviews = window.bmDriveDocumentPreviews || {};
      window.bmDriveDocumentPreviews[folderId] = {
        title: name,
        templateName: templateName,
        html: documentPreviewHtml
      };
    }
    const actionMenu = buildFolderActionMenu(folderId);
    const tableBody = document.getElementById('folderTableBody');
    const gridRow = document.querySelector('#folderGridView .row');
    const meta = getItemMeta(itemType, link, name, fileKind);

    if (tableBody) {
      const tr = document.createElement('tr');
      tr.setAttribute('data-folder-row', '');
      tr.setAttribute('data-folder-id', folderId);
      tr.setAttribute('data-name', name);
      tr.setAttribute('data-folder-type', 'my');
      tr.setAttribute('data-item-type', itemType);
      if (fileKind) tr.setAttribute('data-file-kind', fileKind);
      if (parentId !== null) tr.setAttribute('data-parent-id', parentId);
      if (documentPreviewHtml) {
        tr.setAttribute('data-document-popup', 'true');
        tr.setAttribute('data-template-name', templateName);
      }
      if (link) tr.setAttribute('data-link', link);
      tr.innerHTML = [
        '<td>',
        '  <div class="d-flex align-items-center gap-3">',
        '    <span class="bm-folder-icon"><iconify-icon icon="' + meta.icon + '"></iconify-icon></span>',
        '    <div><div class="fw-semibold bm-folder-title"><span class="bm-folder-title-text">' + safeName + '</span></div><small class="text-muted">' + meta.subLabel + '</small></div>',
        '  </div>',
        '</td>',
        '<td>Setiawan</td>',
        '<td>' + date + '</td>',
        '<td class="text-center">' + actionMenu + '</td>'
      ].join('');
      tableBody.prepend(tr);
    }

    if (gridRow) {
      const col = document.createElement('div');
      col.className = 'col-sm-6 col-lg-4 col-xl-3';
      col.setAttribute('data-folder-row', '');
      col.setAttribute('data-folder-id', folderId);
      col.setAttribute('data-name', name);
      col.setAttribute('data-folder-type', 'my');
      col.setAttribute('data-item-type', itemType);
      if (fileKind) col.setAttribute('data-file-kind', fileKind);
      if (parentId !== null) col.setAttribute('data-parent-id', parentId);
      if (documentPreviewHtml) {
        col.setAttribute('data-document-popup', 'true');
        col.setAttribute('data-template-name', templateName);
      }
      if (link) col.setAttribute('data-link', link);
      col.innerHTML = [
        '<div class="card border shadow-none h-100 bm-folder-grid-card position-relative">',
        '  <div class="position-absolute top-0 end-0 m-2">' + actionMenu + '</div>',
        '  <div class="card-body d-flex flex-column gap-2">',
        '    <span class="bm-folder-icon bm-folder-icon-lg"><iconify-icon icon="' + meta.icon + '"></iconify-icon></span>',
        '    <div class="fw-semibold bm-folder-title"><span class="bm-folder-title-text">' + safeName + '</span></div>',
        '    <div class="text-muted bm-folder-date">' + date + '</div>',
        link ? '    <small class="text-muted text-truncate" title="' + safeLink + '">Link: tersedia</small>' : '    <small class="text-muted">' + meta.gridLabel + '</small>',
        '  </div>',
        '</div>'
      ].join('');
      gridRow.prepend(col);
    }

    refreshFolderFilter();
    return folderId;
  }

  function addFolderRow(name) {
    addDriveItemRow(name, { itemType: 'folder' });
  }

  function getModal(id) {
    const modalEl = document.getElementById(id);
    if (!modalEl || !window.bootstrap || !window.bootstrap.Modal) return null;
    return window.bootstrap.Modal.getOrCreateInstance(modalEl);
  }

  function openCreateFolderPopup() {
    const modal = getModal('dkFolderModal');
    const input = document.getElementById('dkFolderNameInput');
    if (!modal || !input) {
      const name = window.prompt('Masukkan nama folder baru:');
      if (name && name.trim()) addFolderRow(name.trim());
      return;
    }
    input.value = '';
    modal.show();
    window.setTimeout(function () { input.focus(); }, 150);
  }

  function saveCreateFolderPopup() {
    const input = document.getElementById('dkFolderNameInput');
    const name = input ? input.value.trim() : '';
    if (!name) {
      if (input) input.focus();
      return;
    }
    addFolderRow(name);
    const modal = getModal('dkFolderModal');
    if (modal) modal.hide();
    showFolderFeedback('Folder berhasil ditambahkan.', 'success');
  }

  function openFormPopup() {
    const modal = getModal('dkFormModal');
    const input = document.getElementById('dkFormNameInput');
    if (!modal || !input) {
      const name = window.prompt('Masukkan nama form baru:');
      if (name && name.trim()) {
        addGoogleFormItem(name.trim());
        window.open('https://docs.google.com/forms/create', '_blank', 'noopener,noreferrer');
      }
      return;
    }
    input.value = '';
    modal.show();
    window.setTimeout(function () { input.focus(); }, 150);
  }

  function saveFormPopup() {
    const input = document.getElementById('dkFormNameInput');
    const name = input ? input.value.trim() : '';
    if (!name) {
      if (input) input.focus();
      return;
    }
    addGoogleFormItem(name);
    const modal = getModal('dkFormModal');
    if (modal) modal.hide();
    showFolderFeedback('Google Form berhasil dibuat.', 'success');
    window.open('https://docs.google.com/forms/create', '_blank', 'noopener,noreferrer');
  }

  function addGoogleFormItem(name) {
    addDriveItemRow(name, {
      itemType: 'google-forms',
      link: 'https://docs.google.com/forms'
    });
  }

  const docsSheetTitleState = {
    link: '',
    title: '',
    typeLabel: '',
    loading: false,
    error: '',
    requestId: 0,
    debounceTimer: null
  };

  function isValidDocsSheetLink(link) {
    const cleanLink = String(link || '').trim();
    if (!/^https:\/\//i.test(cleanLink)) return false;

    try {
      const url = new URL(cleanLink);
      const host = url.hostname.toLowerCase();
      const isDocsHost = host === 'docs.google.com' || host.endsWith('.docs.google.com');
      const isDocsPath = /^\/document\/d\//i.test(url.pathname);
      const isSheetPath = /^\/spreadsheets\/d\//i.test(url.pathname);
      return isDocsHost && (isDocsPath || isSheetPath);
    } catch (error) {
      return false;
    }
  }

  function inferGoogleTypeLabel(link) {
    const type = inferGoogleType(link || '');
    if (type === 'google-sheet') return 'Google Sheet';
    if (type === 'google-doc') return 'Google Docs';
    if (type === 'google-forms' || type === 'google-form') return 'Google Form';
    return 'Google Docs / Sheet';
  }

  function inferGooglePreviewIcon(link) {
    const type = inferGoogleType(link || '');
    if (type === 'google-sheet') return 'bx bx-spreadsheet';
    if (type === 'google-doc') return 'bx bx-file';
    return 'bx bx-link-alt';
  }

  function getGoogleFileId(link) {
    try {
      const url = new URL(String(link || '').trim());
      const match = url.pathname.match(/\/(document|spreadsheets)\/d\/([^/]+)/i);
      return match ? decodeURIComponent(match[2]) : '';
    } catch (error) {
      return '';
    }
  }

  function decodeHtmlEntity(value) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = value || '';
    return textarea.value;
  }

  function cleanGoogleTitle(title, link) {
    let clean = decodeHtmlEntity(String(title || ''))
      .replace(/\s+/g, ' ')
      .replace(/\s[-–|]\sGoogle\s+(Docs|Sheets|Drive).*$/i, '')
      .replace(/\s[-–|]\sGoogle.*$/i, '')
      .trim();

    const blockedTitles = [
      'google docs',
      'google sheets',
      'google drive',
      'sign in',
      'sign in - google accounts',
      'docs',
      'sheets'
    ];

    if (!clean || blockedTitles.includes(clean.toLowerCase())) return '';
    if (/^error\s+\d+/i.test(clean)) return '';
    if (/accounts\.google\.com/i.test(clean)) return '';
    return clean;
  }

  function extractTitleFromHtml(html, link) {
    const source = String(html || '');
    const patterns = [
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["'][^>]*>/i,
      /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:title["'][^>]*>/i,
      /<title[^>]*>([\s\S]*?)<\/title>/i,
      /"title"\s*:\s*"((?:\\"|[^"])*)"/i
    ];

    for (const pattern of patterns) {
      const match = source.match(pattern);
      if (match && match[1]) {
        const title = cleanGoogleTitle(match[1].replace(/\\"/g, '"'), link);
        if (title) return title;
      }
    }

    return '';
  }

  function getPreviewUrlsForTitle(link) {
    const cleanLink = String(link || '').trim();
    const fileId = getGoogleFileId(cleanLink);
    const type = inferGoogleType(cleanLink);
    const urls = [];

    if (fileId && type === 'google-sheet') {
      urls.push('https://docs.google.com/spreadsheets/d/' + encodeURIComponent(fileId) + '/edit');
      urls.push('https://docs.google.com/spreadsheets/d/' + encodeURIComponent(fileId) + '/preview');
    } else if (fileId && type === 'google-doc') {
      urls.push('https://docs.google.com/document/d/' + encodeURIComponent(fileId) + '/edit');
      urls.push('https://docs.google.com/document/d/' + encodeURIComponent(fileId) + '/preview');
    }

    urls.push(cleanLink);
    return Array.from(new Set(urls));
  }

  function fetchTextWithTimeout(url, timeoutMs) {
    const controller = window.AbortController ? new AbortController() : null;
    const timer = window.setTimeout(function () {
      if (controller) controller.abort();
    }, timeoutMs || 9000);

    return fetch(url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      signal: controller ? controller.signal : undefined
    })
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.text();
      })
      .finally(function () {
        window.clearTimeout(timer);
      });
  }

  function fetchGoogleTitleThroughProxy(link) {
    const urls = getPreviewUrlsForTitle(link);
    let chain = Promise.resolve('');

    urls.forEach(function (targetUrl) {
      chain = chain.then(function (existingTitle) {
        if (existingTitle) return existingTitle;
        const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(targetUrl);
        return fetchTextWithTimeout(proxyUrl, 10000)
          .then(function (html) { return extractTitleFromHtml(html, link); })
          .catch(function () { return ''; });
      });
    });

    return chain;
  }

  function setDocumentNameValue(value, lockAuto) {
    const nameInput = document.getElementById('dkDocumentNameInput');
    if (!nameInput) return;
    nameInput.value = value || '';
    nameInput.readOnly = !!lockAuto;
    nameInput.classList.toggle('bg-light', !!lockAuto);
  }

  function resetDocsSheetTitleState() {
    docsSheetTitleState.link = '';
    docsSheetTitleState.title = '';
    docsSheetTitleState.typeLabel = '';
    docsSheetTitleState.loading = false;
    docsSheetTitleState.error = '';
    docsSheetTitleState.requestId += 1;
    if (docsSheetTitleState.debounceTimer) {
      window.clearTimeout(docsSheetTitleState.debounceTimer);
      docsSheetTitleState.debounceTimer = null;
    }
  }

  function getDocsSheetPreviewTitle(link) {
    const cleanLink = String(link || '').trim();
    const nameInput = document.getElementById('dkDocumentNameInput');
    const typedName = nameInput ? nameInput.value.trim() : '';

    if (docsSheetTitleState.link === cleanLink && docsSheetTitleState.title) return docsSheetTitleState.title;
    if (typedName) return typedName;
    if (docsSheetTitleState.link === cleanLink && docsSheetTitleState.loading) return 'Mengambil judul dokumen...';
    return inferGoogleTypeLabel(cleanLink || '');
  }

  function setDocsSheetPreview(link, visible, customTitle, customTypeLabel) {
    const preview = document.getElementById('dkDocTitlePreview');
    const previewIcon = document.getElementById('dkDocPreviewIcon');
    const previewIconInner = previewIcon ? previewIcon.querySelector('i') : null;
    const titleText = document.getElementById('dkDocTitleText');
    const typeText = document.getElementById('dkDocTypeText');

    if (!preview) return;

    if (!visible) {
      preview.hidden = true;
      if (titleText) titleText.textContent = '-';
      if (typeText) typeText.textContent = '-';
      if (previewIconInner) previewIconInner.className = 'bx bx-file';
      return;
    }

    preview.hidden = false;
    if (titleText) titleText.textContent = customTitle || getDocsSheetPreviewTitle(link);
    if (typeText) typeText.textContent = customTypeLabel || inferGoogleTypeLabel(link);
    if (previewIconInner) previewIconInner.className = inferGooglePreviewIcon(link);
  }

  function startDocsSheetTitleLookup(link) {
    const cleanLink = String(link || '').trim();
    if (!cleanLink || !isValidDocsSheetLink(cleanLink)) return;

    if (docsSheetTitleState.debounceTimer) {
      window.clearTimeout(docsSheetTitleState.debounceTimer);
      docsSheetTitleState.debounceTimer = null;
    }

    const requestId = docsSheetTitleState.requestId + 1;
    docsSheetTitleState.requestId = requestId;
    docsSheetTitleState.link = cleanLink;
    docsSheetTitleState.title = '';
    docsSheetTitleState.typeLabel = inferGoogleTypeLabel(cleanLink);
    docsSheetTitleState.loading = true;
    docsSheetTitleState.error = '';

    setDocumentNameValue('Mengambil judul dokumen...', true);
    setDocsSheetPreview(cleanLink, true, 'Mengambil judul dokumen...', docsSheetTitleState.typeLabel);

    docsSheetTitleState.debounceTimer = window.setTimeout(function () {
      fetchGoogleTitleThroughProxy(cleanLink).then(function (title) {
        if (docsSheetTitleState.requestId !== requestId) return;

        docsSheetTitleState.loading = false;
        docsSheetTitleState.title = cleanGoogleTitle(title, cleanLink);
        docsSheetTitleState.error = docsSheetTitleState.title ? '' : 'Judul tidak dapat dibaca otomatis.';

        if (docsSheetTitleState.title) {
          setDocumentNameValue(docsSheetTitleState.title, true);
          setDocsSheetPreview(cleanLink, true, docsSheetTitleState.title, docsSheetTitleState.typeLabel);
          const statusText = document.getElementById('dkLinkStatusText');
          if (statusText) {
            statusText.classList.remove('text-danger');
            statusText.classList.add('text-success');
            statusText.textContent = 'Link valid. Judul berhasil terbaca otomatis.';
          }
          return;
        }

        setDocumentNameValue('', false);
        const nameInput = document.getElementById('dkDocumentNameInput');
        if (nameInput) nameInput.placeholder = 'Judul tidak terbaca otomatis, isi manual jika dokumen private';
        setDocsSheetPreview(cleanLink, true, 'Judul tidak terbaca otomatis', docsSheetTitleState.typeLabel);
        const statusText = document.getElementById('dkLinkStatusText');
        if (statusText) {
          statusText.classList.remove('text-success');
          statusText.classList.add('text-danger');
          statusText.textContent = 'Link valid, tetapi judul tidak bisa dibaca otomatis. Pastikan link dapat diakses publik atau isi nama manual.';
        }
      });
    }, 450);
  }

  function updateDocsSheetValidation(showEmptyAsInvalid) {
    const linkInput = document.getElementById('dkDocumentLinkInput');
    const statusIcon = document.getElementById('dkLinkStatusIcon');
    const statusIconInner = statusIcon ? statusIcon.querySelector('i') : null;
    const statusText = document.getElementById('dkLinkStatusText');
    const value = linkInput ? linkInput.value.trim() : '';

    if (!linkInput || !statusIcon || !statusIconInner) return false;

    linkInput.classList.remove('is-valid', 'is-invalid');
    statusIcon.classList.remove('is-valid', 'is-invalid');
    statusIconInner.className = 'bx';
    setDocsSheetPreview('', false);
    if (statusText) {
      statusText.classList.remove('text-success', 'text-danger');
      statusText.textContent = 'Masukkan link Google Docs atau Google Sheet.';
    }

    if (!value && !showEmptyAsInvalid) {
      resetDocsSheetTitleState();
      setDocumentNameValue('', false);
      statusIcon.hidden = true;
      return false;
    }

    const valid = isValidDocsSheetLink(value);
    statusIcon.hidden = false;

    if (valid) {
      const typeLabel = inferGoogleTypeLabel(value);
      linkInput.classList.add('is-valid');
      statusIcon.classList.add('is-valid');
      statusIconInner.className = 'bx bx-check-circle';

      if (docsSheetTitleState.link === value && docsSheetTitleState.title) {
        setDocsSheetPreview(value, true, docsSheetTitleState.title, typeLabel);
        if (statusText) {
          statusText.classList.add('text-success');
          statusText.textContent = 'Link valid. Judul berhasil terbaca otomatis.';
        }
        return true;
      }

      if (docsSheetTitleState.link === value && docsSheetTitleState.loading) {
        setDocsSheetPreview(value, true, 'Mengambil judul dokumen...', typeLabel);
        if (statusText) {
          statusText.classList.add('text-success');
          statusText.textContent = 'Link ' + typeLabel + ' valid. Mengambil judul otomatis...';
        }
        return true;
      }

      setDocsSheetPreview(value, true, 'Mengambil judul dokumen...', typeLabel);
      if (statusText) {
        statusText.classList.add('text-success');
        statusText.textContent = 'Link ' + typeLabel + ' valid. Mengambil judul otomatis...';
      }
      startDocsSheetTitleLookup(value);
      return true;
    }

    resetDocsSheetTitleState();
    setDocumentNameValue('', false);
    linkInput.classList.add('is-invalid');
    statusIcon.classList.add('is-invalid');
    statusIconInner.className = 'bx bx-x-circle';
    setDocsSheetPreview('', false);
    if (statusText) {
      statusText.classList.add('text-danger');
      statusText.textContent = 'Link tidak valid. Gunakan link Google Docs atau Google Sheet.';
    }
    return false;
  }

  function openDocsSheetPopup() {
    const modal = getModal('dkLinkModal');
    const nameInput = document.getElementById('dkDocumentNameInput');
    const linkInput = document.getElementById('dkDocumentLinkInput');
    if (!modal || !linkInput) {
      const link = window.prompt('Masukkan link Google Docs / Sheet:');
      if (link && link.trim()) addDocsSheetLink(link.trim(), '');
      return;
    }
    resetDocsSheetTitleState();
    if (nameInput) {
      nameInput.value = '';
      nameInput.readOnly = false;
      nameInput.placeholder = 'Judul akan terbaca otomatis dari link';
    }
    linkInput.value = '';
    updateDocsSheetValidation(false);
    modal.show();
    window.setTimeout(function () {
      linkInput.focus();
    }, 150);
  }

  function addDocsSheetLink(link, name) {
    const cleanLink = String(link || '').trim();
    if (!cleanLink) return false;

    if (!isValidDocsSheetLink(cleanLink)) {
      updateDocsSheetValidation(true);
      showFolderFeedback('Link harus berupa URL Google Docs atau Google Sheet yang valid.', 'warning');
      return false;
    }

    const itemType = inferGoogleType(cleanLink);
    const autoTitle = docsSheetTitleState.link === cleanLink ? docsSheetTitleState.title : '';
    const itemName = autoTitle || inferGoogleName(cleanLink, name);
    addDriveItemRow(itemName, { itemType: itemType, link: cleanLink });
    return true;
  }

  function saveDocsSheetPopup() {
    const nameInput = document.getElementById('dkDocumentNameInput');
    const linkInput = document.getElementById('dkDocumentLinkInput');
    const name = nameInput ? nameInput.value.trim() : '';
    const link = linkInput ? linkInput.value.trim() : '';

    if (!link) {
      updateDocsSheetValidation(true);
      if (linkInput) linkInput.focus();
      return;
    }

    if (!updateDocsSheetValidation(true)) {
      if (linkInput) linkInput.focus();
      return;
    }

    if (docsSheetTitleState.link === link && docsSheetTitleState.loading) {
      showFolderFeedback('Tunggu sebentar, sistem sedang membaca judul dokumen.', 'info');
      return;
    }

    if (!addDocsSheetLink(link, name)) {
      if (linkInput) linkInput.focus();
      return;
    }

    const modal = getModal('dkLinkModal');
    if (modal) modal.hide();
    showFolderFeedback('Link dokumen berhasil ditambahkan.', 'success');
  }


  // Revisi: validasi Google Docs / Sheet hanya menampilkan icon valid/salah.
  // Preview judul Docs/Sheet dan auto-tracking judul dihilangkan sesuai kebutuhan UI.
  function hideDocsSheetTitlePreview() {
    const preview = document.getElementById('dkDocTitlePreview');
    if (preview) preview.hidden = true;
  }

  function updateDocsSheetValidation(showEmptyAsInvalid) {
    const linkInput = document.getElementById('dkDocumentLinkInput');
    const statusIcon = document.getElementById('dkLinkStatusIcon');
    const statusIconInner = statusIcon ? statusIcon.querySelector('i') : null;
    const statusText = document.getElementById('dkLinkStatusText');
    const nameInput = document.getElementById('dkDocumentNameInput');
    const value = linkInput ? linkInput.value.trim() : '';

    if (!linkInput || !statusIcon || !statusIconInner) return false;

    linkInput.classList.remove('is-valid', 'is-invalid');
    statusIcon.classList.remove('is-valid', 'is-invalid');
    statusIconInner.className = 'bx';
    hideDocsSheetTitlePreview();

    if (nameInput) {
      nameInput.readOnly = false;
      nameInput.classList.remove('bg-light');
      nameInput.placeholder = 'Masukkan nama dokumen';
    }

    if (statusText) {
      statusText.classList.remove('text-success', 'text-danger');
      statusText.textContent = 'Masukkan link Google Docs atau Google Sheet.';
    }

    if (!value && !showEmptyAsInvalid) {
      resetDocsSheetTitleState();
      statusIcon.hidden = true;
      return false;
    }

    const valid = isValidDocsSheetLink(value);
    statusIcon.hidden = false;

    if (valid) {
      const typeLabel = inferGoogleTypeLabel(value);
      resetDocsSheetTitleState();
      linkInput.classList.add('is-valid');
      statusIcon.classList.add('is-valid');
      statusIconInner.className = 'bx bx-check-circle';
      if (statusText) {
        statusText.classList.add('text-success');
        statusText.textContent = 'Link ' + typeLabel + ' valid.';
      }
      return true;
    }

    resetDocsSheetTitleState();
    linkInput.classList.add('is-invalid');
    statusIcon.classList.add('is-invalid');
    statusIconInner.className = 'bx bx-x-circle';
    if (statusText) {
      statusText.classList.add('text-danger');
      statusText.textContent = 'Link tidak valid. Gunakan link Google Docs atau Google Sheet.';
    }
    return false;
  }

  function openDocsSheetPopup() {
    const modal = getModal('dkLinkModal');
    const nameInput = document.getElementById('dkDocumentNameInput');
    const linkInput = document.getElementById('dkDocumentLinkInput');
    if (!modal || !linkInput) {
      const link = window.prompt('Masukkan link Google Docs / Sheet:');
      if (link && link.trim()) addDocsSheetLink(link.trim(), '');
      return;
    }
    resetDocsSheetTitleState();
    hideDocsSheetTitlePreview();
    if (nameInput) {
      nameInput.value = '';
      nameInput.readOnly = false;
      nameInput.classList.remove('bg-light');
      nameInput.placeholder = 'Masukkan nama dokumen';
    }
    linkInput.value = '';
    updateDocsSheetValidation(false);
    modal.show();
    window.setTimeout(function () {
      if (nameInput) nameInput.focus();
      else linkInput.focus();
    }, 150);
  }

  function addDocsSheetLink(link, name) {
    const cleanLink = String(link || '').trim();
    if (!cleanLink) return false;

    if (!isValidDocsSheetLink(cleanLink)) {
      updateDocsSheetValidation(true);
      showFolderFeedback('Link harus berupa URL Google Docs atau Google Sheet yang valid.', 'warning');
      return false;
    }

    const itemType = inferGoogleType(cleanLink);
    const itemName = inferGoogleName(cleanLink, name);
    addDriveItemRow(itemName, { itemType: itemType, link: cleanLink });
    return true;
  }

  function saveDocsSheetPopup() {
    const nameInput = document.getElementById('dkDocumentNameInput');
    const linkInput = document.getElementById('dkDocumentLinkInput');
    const name = nameInput ? nameInput.value.trim() : '';
    const link = linkInput ? linkInput.value.trim() : '';

    if (!link) {
      updateDocsSheetValidation(true);
      if (linkInput) linkInput.focus();
      return;
    }

    if (!updateDocsSheetValidation(true)) {
      if (linkInput) linkInput.focus();
      return;
    }

    if (!addDocsSheetLink(link, name)) {
      if (linkInput) linkInput.focus();
      return;
    }

    const modal = getModal('dkLinkModal');
    if (modal) modal.hide();
    showFolderFeedback('Link dokumen berhasil ditambahkan.', 'success');
  }

  function handleUploadedFiles(files) {
    const list = Array.from(files || []);
    if (!list.length) return;
    list.forEach(function (file) {
      addDriveItemRow(file.name || 'File Baru', { itemType: 'file' });
    });
    showFolderFeedback(list.length + ' file berhasil ditambahkan.', 'success');
  }

  function handleUploadedFolders(files) {
    const list = Array.from(files || []);
    if (!list.length) return;

    const folderNames = new Set();
    list.forEach(function (file) {
      const path = file.webkitRelativePath || file.name || '';
      const folderName = path.includes('/') ? path.split('/')[0] : '';
      if (folderName) folderNames.add(folderName);
    });

    if (!folderNames.size) {
      showFolderFeedback('Browser belum mengirim nama folder. Gunakan Upload File untuk file biasa.', 'warning');
      return;
    }

    folderNames.forEach(function (folderName) {
      addFolderRow(folderName);
    });
    showFolderFeedback(folderNames.size + ' folder berhasil ditambahkan.', 'success');
  }


  function ensureUploadFolderModal() {
    var modalEl = document.getElementById('dkUploadFolderModal');
    if (modalEl) return modalEl;

    modalEl = document.createElement('div');
    modalEl.className = 'modal fade';
    modalEl.id = 'dkUploadFolderModal';
    modalEl.tabIndex = -1;
    modalEl.setAttribute('aria-hidden', 'true');
    modalEl.innerHTML = [
      '<div class="modal-dialog modal-dialog-centered">',
      '<div class="modal-content">',
      '<div class="bm-rename-shell bm-upload-folder-shell">',
      '<h4 class="bm-rename-title">Upload Folder</h4>',
      '<div class="bm-rename-field bm-upload-folder-info">',
      '<label>Pilih Folder</label>',
      '<div class="bm-upload-folder-box">',
      '<span class="bm-upload-folder-icon"><iconify-icon icon="material-symbols:drive-folder-upload-rounded"></iconify-icon></span>',
      '<div>',
      '<strong>Upload seluruh isi folder</strong>',
      '<small>Folder, subfolder, PDF, Word, gambar, dan file lain akan ikut masuk.</small>',
      '</div>',
      '</div>',
      '</div>',
      '<div class="bm-rename-actions">',
      '<button class="btn bm-rename-btn bm-rename-btn-cancel" type="button" data-bs-dismiss="modal">Batal</button>',
      '<button class="btn bm-rename-btn bm-rename-btn-ok" type="button" id="dkUploadFolderChooseBtn">Pilih Folder</button>',
      '</div>',
      '</div>',
      '</div>',
      '</div>'
    ].join('');

    document.body.appendChild(modalEl);

    var chooseBtn = modalEl.querySelector('#dkUploadFolderChooseBtn');
    if (chooseBtn) {
      chooseBtn.addEventListener('click', function () {
        var inputFolder = document.getElementById('dkUploadFolder');
        if (window.bootstrap && window.bootstrap.Modal) {
          window.bootstrap.Modal.getOrCreateInstance(modalEl).hide();
        }
        if (inputFolder) {
          window.setTimeout(function () { inputFolder.click(); }, 180);
        }
      });
    }

    return modalEl;
  }

  function openUploadFolderPopup() {
    var modalEl = ensureUploadFolderModal();
    if (!modalEl) {
      var inputFolder = document.getElementById('dkUploadFolder');
      if (inputFolder) inputFolder.click();
      return;
    }

    if (window.bootstrap && window.bootstrap.Modal) {
      window.bootstrap.Modal.getOrCreateInstance(modalEl, { backdrop: true, keyboard: true }).show();
      return;
    }

    modalEl.classList.add('show');
    modalEl.style.display = 'block';
    modalEl.removeAttribute('aria-hidden');
  }

  function handleDocumentAction(action) {
    if (action === 'google-docs-sheet') {
      openDocsSheetPopup();
      return;
    }

    if (action === 'google-forms') {
      openFormPopup();
      return;
    }

    if (action === 'create-folder') {
      openCreateFolderPopup();
      return;
    }

    if (action === 'upload-file') {
      const inputFile = document.getElementById('dkUploadFile');
      if (inputFile) inputFile.click();
      return;
    }

    if (action === 'upload-folder') {
      const inputFolder = document.getElementById('dkUploadFolder');
      if (inputFolder) inputFolder.click();
      return;
    }

    if (action === 'template') {
      openTemplateModal();
      return;
    }
  }




  const bmDemoTemplateEmployees = {
    'Setiawan': {
      name: 'Setiawan',
      employeeNo: 'BM-001',
      position: 'Staff IT',
      division: 'Information Technology',
      company: 'PT Bisa Media Grup',
      email: 'setiawan@bisamedia.id'
    },
    'Setia': {
      name: 'Setia',
      employeeNo: 'BM-002',
      position: 'Staff Administrasi',
      division: 'Operasional',
      company: 'PT Bisa Media Grup',
      email: 'setia@bisamedia.id'
    },
    'Nama Karyawan': {
      name: 'Nama Karyawan',
      employeeNo: 'BM-003',
      position: 'Staff',
      division: 'Divisi Terkait',
      company: 'PT Bisa Media Grup',
      email: 'karyawan@bisamedia.id'
    }
  };

  const bmDemoTemplates = {
    'Kontrak Kerja': {
      label: 'Template Kontrak Kerja',
      title: 'PERJANJIAN KERJA WAKTU TERTENTU',
      documentTitle: 'PERJANJIAN KERJA WAKTU TERTENTU',
      kind: 'contract'
    },
    'Surat': {
      label: 'Template Surat Umum',
      title: 'SURAT RESMI',
      documentTitle: 'SURAT RESMI',
      kind: 'letter'
    },
    'Dokumen Bebas': {
      label: 'Template Dokumen Bebas',
      title: 'DOKUMEN BEBAS',
      documentTitle: 'DOKUMEN BEBAS',
      kind: 'free'
    }
  };

  let bmActiveTemplateName = 'Kontrak Kerja';

  function escapeTemplateValue(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[char];
    });
  }

  function readTemplateStorageArray(key) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function lookupTemplateStorageName(key, id) {
    const wanted = String(id || '').trim();
    if (!wanted) return '';
    const rows = readTemplateStorageArray(key);
    const found = rows.find(function (row) {
      return String(row && (row.id || row.value || row.key) || '').trim() === wanted;
    });
    return found ? String(found.name || found.title || found.label || '').trim() : '';
  }

  function normalizeTemplateEmployeeRow(row) {
    if (!row || typeof row !== 'object') return null;

    const subIds = Array.isArray(row.sub_ids) ? row.sub_ids : [row.sub_id, row.sub_company_id, row.company_id].filter(Boolean);
    const divisiIds = Array.isArray(row.divisi_ids) ? row.divisi_ids : [row.divisi_id, row.division_id].filter(Boolean);
    const jabatanIds = Array.isArray(row.jabatan_ids) ? row.jabatan_ids : [row.jabatan_id, row.position_id].filter(Boolean);

    const name = String(row.name || row.full_name || row.fullName || row.employee_name || row.nama || '').trim();
    const employeeNo = String(row.employee_no || row.employeeNo || row.nik || row.id || '').trim();
    if (!name && !employeeNo) return null;

    const position = jabatanIds.map(function (id) {
      return lookupTemplateStorageName('ceoJabatanV2', id);
    }).filter(Boolean).join(', ') || String(row.jabatan || row.position || row.position_name || row.job_title || '').trim() || '-';

    const division = divisiIds.map(function (id) {
      return lookupTemplateStorageName('ceoDivisiV2', id);
    }).filter(Boolean).join(', ') || String(row.divisi || row.division || row.division_name || '').trim() || '-';

    const company = subIds.map(function (id) {
      return lookupTemplateStorageName('ceoSubCompaniesV1', id);
    }).filter(Boolean).join(', ') || String(row.sub_perusahaan || row.sub_company || row.company || row.company_name || '').trim() || 'PT Bisa Media Grup';

    return {
      name: name || employeeNo,
      employeeNo: employeeNo || '-',
      position: position,
      division: division,
      company: company,
      email: String(row.email || row.work_email || row.personal_email || row.mail || '').trim() || '-',
      isCustom: false
    };
  }

  function getTemplateEmployeeMap() {
    const map = Object.assign({}, bmDemoTemplateEmployees);

    const storageEmployees = []
      .concat(readTemplateStorageArray('ceoEmployeesV2'))
      .concat(readTemplateStorageArray('employees'))
      .concat(readTemplateStorageArray('bmEmployeesV1'))
      .concat(readTemplateStorageArray('bmEmployeesV2'));

    storageEmployees.forEach(function (row) {
      const employee = normalizeTemplateEmployeeRow(row);
      if (!employee) return;
      map[employee.name] = employee;
    });

    return map;
  }

  function populateTemplateEmployeeSelect() {
    const employeeSelect = document.getElementById('dkTemplateEmployee');
    if (!employeeSelect) return;

    const currentValue = employeeSelect.value || '';
    const employees = getTemplateEmployeeMap();
    const employeeOptions = Object.keys(employees).sort(function (a, b) {
      return String(a).localeCompare(String(b));
    }).map(function (name) {
      return '<option value="' + escapeTemplateValue(name) + '">' + escapeTemplateValue(employees[name].name || name) + '</option>';
    }).join('');

    employeeSelect.innerHTML = [
      '<option value="">Pilih Karyawan</option>',
      employeeOptions,
      '<option value="__custom">Bukan karyawan / isi sendiri</option>'
    ].join('');

    if (currentValue && Array.from(employeeSelect.options).some(function (option) { return option.value === currentValue; })) {
      employeeSelect.value = currentValue;
    } else {
      employeeSelect.value = '';
    }

    employeeSelect.disabled = false;
    employeeSelect.removeAttribute('disabled');
    employeeSelect.style.pointerEvents = 'auto';
  }

  function getSelectedTemplateEmployee() {
    const employeeSelect = document.getElementById('dkTemplateEmployee');
    const customInput = document.getElementById('dkTemplateCustomRecipient');
    const selectedName = employeeSelect ? employeeSelect.value : '';
    const customName = customInput ? customInput.value.trim() : '';

    if (selectedName === '__custom') {
      return {
        name: customName || 'Nama Penerima',
        employeeNo: '-',
        position: '-',
        division: '-',
        company: 'PT Bisa Media Grup',
        email: '-',
        isCustom: true
      };
    }

    const employees = getTemplateEmployeeMap();
    return employees[selectedName] || {
      name: 'Pilih Karyawan',
      employeeNo: '-',
      position: '-',
      division: '-',
      company: 'PT Bisa Media Grup',
      email: '-',
      isCustom: false
    };
  }

  function getTemplateNumber() {
    const docNumberInput = document.getElementById('dkTemplateDocNumber');
    const value = docNumberInput ? docNumberInput.value.trim() : '';
    return value || 'Nomor dokumen otomatis / belum diisi';
  }

  function syncTemplateEmployeeQuickPicker() {
    // Dropdown "Untuk" sekarang memakai select asli agar pilihan karyawan bisa dibuka langsung.
    return;
  }

  function ensureTemplateEmployeeQuickPicker() {
    populateTemplateEmployeeSelect();

    const employeeSelect = document.getElementById('dkTemplateEmployee');
    if (!employeeSelect) return;

    employeeSelect.disabled = false;
    employeeSelect.removeAttribute('disabled');
    employeeSelect.style.pointerEvents = 'auto';
    employeeSelect.style.opacity = '1';
  }

  function getTemplateVariableMap() {
    const recipient = getSelectedTemplateEmployee();
    const docNumber = getTemplateNumber();
    const todayText = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    return {
      nama: recipient.name,
      nama_karyawan: recipient.name,
      nama_penerima: recipient.name,
      nik: recipient.employeeNo,
      nik_karyawan: recipient.employeeNo,
      id_karyawan: recipient.employeeNo,
      nomor_karyawan: recipient.employeeNo,
      jabatan: recipient.position,
      posisi: recipient.position,
      divisi: recipient.division,
      sub_perusahaan: recipient.company,
      perusahaan: recipient.company,
      company: recipient.company,
      email: recipient.email,
      email_karyawan: recipient.email,
      nomor_dokumen: docNumber,
      no_dokumen: docNumber,
      tanggal_dokumen: todayText,
      tanggal: todayText,
      tanggal_hari_ini: todayText,
      tanggal_masuk: '-',
      status_karyawan: '-',
      alamat: '-'
    };
  }

  function renderTemplateVariablesInHtml(html) {
    const variables = getTemplateVariableMap();
    return String(html || '').replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, function (full, key) {
      const normalized = String(key || '').trim().toLowerCase().replace(/[.\-\s]+/g, '_');
      if (Object.prototype.hasOwnProperty.call(variables, normalized)) {
        return escapeTemplateValue(variables[normalized]);
      }
      return '';
    });
  }

  function buildTemplatePreviewHtml(templateName) {
    const template = bmDemoTemplates[templateName] || bmDemoTemplates['Kontrak Kerja'];
    if (template && template.html) return renderTemplateVariablesInHtml(template.html);
    const recipient = getSelectedTemplateEmployee();
    const docNumber = getTemplateNumber();
    const todayText = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const recipientTitle = recipient.isCustom ? 'Pihak/Penerima' : 'Data Karyawan';
    const recipientRows = [
      '<div class="bm-template-preview-section-title">' + recipientTitle + '</div>',
      '<div class="bm-template-preview-box">',
      '<div class="bm-template-preview-row"><span>Nama</span><span>:</span><strong>' + escapeTemplateValue(recipient.name) + '</strong></div>',
      recipient.isCustom ? '' : '<div class="bm-template-preview-row"><span>NIK/ID</span><span>:</span><span>' + escapeTemplateValue(recipient.employeeNo) + '</span></div>',
      recipient.isCustom ? '' : '<div class="bm-template-preview-row"><span>Jabatan</span><span>:</span><span>' + escapeTemplateValue(recipient.position) + '</span></div>',
      recipient.isCustom ? '' : '<div class="bm-template-preview-row"><span>Divisi</span><span>:</span><span>' + escapeTemplateValue(recipient.division) + '</span></div>',
      '<div class="bm-template-preview-row"><span>Perusahaan</span><span>:</span><span>' + escapeTemplateValue(recipient.company) + '</span></div>',
      '</div>'
    ].join('');

    if (template.kind === 'letter') {
      return [
        '<div class="bm-template-preview-a4-stack">',
        '<section class="bm-template-preview-document bm-template-preview-a4-page">',
        '<div class="bm-template-preview-doc-head">',
        '<h5>SURAT RESMI</h5>',
        '<div class="bm-template-preview-doc-number">No: ' + escapeTemplateValue(docNumber) + '</div>',
        '</div>',
        '<p class="mb-1">Tasikmalaya, ' + escapeTemplateValue(todayText) + '</p>',
        '<p>Kepada Yth.<br><strong>' + escapeTemplateValue(recipient.name || 'Nama Tujuan') + '</strong><br>di Tempat</p>',
        '<p>Dengan hormat,</p>',
        '<p>Melalui surat ini, PT Bisa Media Grup menyampaikan pemberitahuan atau informasi resmi yang berkaitan dengan kebutuhan administrasi, pekerjaan, atau koordinasi perusahaan.</p>',
        '<p>Adapun isi surat dapat disesuaikan kembali berdasarkan kebutuhan, nama penerima, jabatan, dan konteks dokumen yang akan digunakan.</p>',
        '<p>Demikian surat ini dibuat untuk digunakan sebagaimana mestinya. Atas perhatian dan kerja samanya, kami ucapkan terima kasih.</p>',
        '<div class="bm-template-preview-sign">',
        '<div><div>Hormat kami,</div><div class="bm-template-preview-line">PT Bisa Media Grup</div></div>',
        '<div><div>Penerima</div><div class="bm-template-preview-line">' + escapeTemplateValue(recipient.name) + '</div></div>',
        '</div>',
        '<div class="bm-template-preview-page-number">Hal. 1</div>',
        '</section>',
        '</div>'
      ].join('');
    }

    if (template.kind === 'free') {
      return [
        '<div class="bm-template-preview-a4-stack">',
        '<section class="bm-template-preview-document bm-template-preview-a4-page">',
        '<div class="bm-template-preview-doc-head">',
        '<h5>DOKUMEN BEBAS</h5>',
        '<div class="bm-template-preview-doc-number">No: ' + escapeTemplateValue(docNumber) + '</div>',
        '</div>',
        recipientRows,
        '<div class="bm-template-preview-section-title">Isi Dokumen</div>',
        '<p>Template ini disediakan untuk kebutuhan dokumen umum yang formatnya dapat disesuaikan sendiri, seperti berita acara, memo internal, catatan kerja, pengajuan, atau dokumen administratif lainnya.</p>',
        '<p>Bagian isi dapat diedit sesuai kebutuhan perusahaan, unit kerja, maupun pihak penerima dokumen.</p>',
        '<div class="bm-template-preview-sign">',
        '<div><div>Tasikmalaya, ' + escapeTemplateValue(todayText) + '</div><div class="bm-template-preview-line">Pembuat Dokumen</div></div>',
        '<div><div>Penerima</div><div class="bm-template-preview-line">' + escapeTemplateValue(recipient.name) + '</div></div>',
        '</div>',
        '<div class="bm-template-preview-page-number">Hal. 1</div>',
        '</section>',
        '</div>'
      ].join('');
    }

    return [
      '<div class="bm-template-preview-a4-stack bm-template-preview-contract-stack">',
      '<section class="bm-template-preview-document bm-template-preview-a4-page">',
      '<div class="bm-template-preview-doc-head">',
      '<h5>PERJANJIAN KERJA WAKTU TERTENTU</h5>',
      '<div class="bm-template-preview-doc-number">No: ' + escapeTemplateValue(docNumber) + '</div>',
      '</div>',
      '<p>Pada hari ini, ' + escapeTemplateValue(todayText) + ', bertempat di Tasikmalaya, yang bertanda tangan di bawah ini:</p>',
      '<ol class="bm-template-preview-ordered">',
      '<li><strong>PT Bisa Media Grup</strong>, selanjutnya disebut sebagai <strong>PIHAK PERTAMA</strong>.</li>',
      '<li><strong>' + escapeTemplateValue(recipient.name) + '</strong>, selanjutnya disebut sebagai <strong>PIHAK KEDUA</strong>.</li>',
      '</ol>',
      recipientRows,
      '<div class="bm-template-preview-section-title">Pasal 1 - Ruang Lingkup Pekerjaan</div>',
      '<p>PIHAK KEDUA bersedia melaksanakan pekerjaan sesuai jabatan, penempatan, arahan kerja, target, dan standar operasional yang ditetapkan oleh PIHAK PERTAMA.</p>',
      '<div class="bm-template-preview-section-title">Pasal 2 - Masa Perjanjian</div>',
      '<p>Perjanjian kerja ini berlaku untuk jangka waktu tertentu sesuai kesepakatan para pihak dan dapat diperpanjang berdasarkan kebutuhan perusahaan serta hasil evaluasi kinerja.</p>',
      '<div class="bm-template-preview-section-title">Pasal 3 - Waktu Kerja</div>',
      '<p>Waktu kerja mengikuti ketentuan perusahaan. Penyesuaian jadwal dapat dilakukan sesuai kebutuhan operasional, sistem kerja, dan arahan atasan langsung.</p>',
      '<div class="bm-template-preview-page-number">Hal. 1</div>',
      '</section>',

      '<section class="bm-template-preview-document bm-template-preview-a4-page">',
      '<div class="bm-template-preview-section-title">Pasal 4 - Hak dan Kewajiban</div>',
      '<p>PIHAK KEDUA wajib menjaga kedisiplinan, menjalankan pekerjaan dengan penuh tanggung jawab, menjaga etika kerja, serta mematuhi seluruh kebijakan dan peraturan perusahaan.</p>',
      '<p>PIHAK PERTAMA wajib memberikan arahan kerja, fasilitas kerja yang diperlukan, serta hak-hak PIHAK KEDUA sesuai ketentuan perusahaan dan kesepakatan yang berlaku.</p>',
      '<div class="bm-template-preview-section-title">Pasal 5 - Kompensasi</div>',
      '<p>Ketentuan mengenai gaji, tunjangan, insentif, benefit, dan pembayaran lainnya ditetapkan berdasarkan kebijakan perusahaan serta dapat disesuaikan dengan hasil evaluasi dan kebutuhan operasional.</p>',
      '<div class="bm-template-preview-section-title">Pasal 6 - Kerahasiaan</div>',
      '<p>PIHAK KEDUA wajib menjaga seluruh informasi perusahaan, data klien, data kreator, strategi bisnis, dokumen internal, sistem kerja, serta informasi lain yang bersifat rahasia.</p>',
      '<div class="bm-template-preview-section-title">Pasal 7 - Larangan</div>',
      '<p>PIHAK KEDUA dilarang menggunakan aset, data, dokumen, maupun akses perusahaan untuk kepentingan pribadi atau pihak lain tanpa persetujuan tertulis dari PIHAK PERTAMA.</p>',
      '<div class="bm-template-preview-page-number">Hal. 2</div>',
      '</section>',

      '<section class="bm-template-preview-document bm-template-preview-a4-page">',
      '<div class="bm-template-preview-section-title">Pasal 8 - Evaluasi dan Pemutusan Perjanjian</div>',
      '<p>PIHAK PERTAMA berhak melakukan evaluasi terhadap kinerja PIHAK KEDUA. Apabila ditemukan pelanggaran, ketidaksesuaian kinerja, atau kebutuhan organisasi berubah, maka perjanjian dapat ditinjau kembali sesuai ketentuan yang berlaku.</p>',
      '<div class="bm-template-preview-section-title">Pasal 9 - Penyelesaian Perselisihan</div>',
      '<p>Apabila terjadi perselisihan, para pihak sepakat untuk menyelesaikan terlebih dahulu melalui musyawarah secara baik-baik. Apabila tidak tercapai kesepakatan, penyelesaian dilakukan sesuai ketentuan hukum yang berlaku.</p>',
      '<div class="bm-template-preview-section-title">Pasal 10 - Penutup</div>',
      '<p>Perjanjian ini dibuat dengan itikad baik dan dipahami oleh para pihak. Hal-hal yang belum diatur dalam perjanjian ini akan diatur kemudian berdasarkan kesepakatan tertulis.</p>',
      '<div class="bm-template-preview-sign">',
      '<div><div>PIHAK PERTAMA</div><div class="bm-template-preview-line">PT Bisa Media Grup</div></div>',
      '<div><div>PIHAK KEDUA</div><div class="bm-template-preview-line">' + escapeTemplateValue(recipient.name) + '</div></div>',
      '</div>',
      '<div class="bm-template-preview-page-number">Hal. 3</div>',
      '</section>',
      '</div>'
    ].join('');
  }

  function renameTemplateName(oldName, nextName, showFeedback) {
    nextName = String(nextName || '').trim();
    if (!nextName || !oldName || nextName === oldName) return false;

    const oldTemplate = bmDemoTemplates[oldName] || bmDemoTemplates['Kontrak Kerja'];
    bmDemoTemplates[nextName] = Object.assign({}, oldTemplate, { documentTitle: oldTemplate.documentTitle || oldTemplate.title });

    if (oldName !== nextName && bmDemoTemplates[oldName]) {
      delete bmDemoTemplates[oldName];
    }

    document.querySelectorAll('[data-template-card][data-template-name="' + cssEscapeSelector(oldName) + '"]').forEach(function (card) {
      card.setAttribute('data-template-name', nextName);
      const title = card.querySelector('.bm-template-card-title');
      if (title) title.textContent = nextName;
    });

    if (bmActiveTemplateName === oldName) {
      bmActiveTemplateName = nextName;
      const nameInput = document.getElementById('dkTemplateDetailNameInput');
      if (nameInput && nameInput.value !== nextName) nameInput.value = nextName;
    }

    if (showFeedback) showFolderFeedback('Template berhasil direname.', 'success');
    return true;
  }

  function syncActiveTemplateNameFromInput() {
    // Input nama di popup Preview as template hanya untuk tampilan lokal.
    // Tidak mengubah nama template di daftar Document dan tidak mengubah judul di kotak preview.
    return;
  }

  function cssEscapeSelector(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value);
    return String(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  function updateTemplatePreview() {
    const previewPaper = document.getElementById('dkTemplatePreviewPaper');
    if (previewPaper) previewPaper.innerHTML = buildTemplatePreviewHtml(bmActiveTemplateName || 'Kontrak Kerja');
  }

  function openTemplateModal() {
    const modal = getModal('dkTemplateModal');
    const input = document.getElementById('dkTemplateSearchInput');
    if (!modal) return;
    if (input) input.value = '';
    filterTemplateCards('');
    modal.show();
    window.setTimeout(function () { if (input) input.focus(); }, 150);
  }

  function openTemplateDetailModal(templateName) {
    const detailModal = getModal('dkTemplateDetailModal');
    const listModal = getModal('dkTemplateModal');
    const docNumberInput = document.getElementById('dkTemplateDocNumber');
    const employeeSelect = document.getElementById('dkTemplateEmployee');
    const nameInput = document.getElementById('dkTemplateDetailNameInput');

    bmActiveTemplateName = templateName || 'Kontrak Kerja';
    if (nameInput) nameInput.value = bmActiveTemplateName;
    if (docNumberInput) docNumberInput.value = 'DOC/' + bmActiveTemplateName.replace(/\s+/g, '-').toUpperCase() + '/' + new Date().getFullYear();
    populateTemplateEmployeeSelect();
    if (employeeSelect) {
      employeeSelect.disabled = false;
      employeeSelect.removeAttribute('disabled');
      employeeSelect.style.pointerEvents = 'auto';
      employeeSelect.value = '';
    }
    ensureTemplateEmployeeQuickPicker();
    const templateDetailMeta = document.querySelector('#dkTemplateDetailModal .bm-template-detail-meta');
    if (templateDetailMeta && !document.getElementById('bmTemplateVariableUsageHint')) {
      const hint = document.createElement('div');
      hint.id = 'bmTemplateVariableUsageHint';
      hint.className = 'bm-template-variable-usage-hint';
      hint.innerHTML = '<i class="bx bx-info-circle"></i><span>Pilih karyawan pada bagian <strong>Untuk</strong>, lalu variable seperti <code>{{nama_karyawan}}</code>, <code>{{jabatan}}</code>, dan <code>{{divisi}}</code> akan otomatis menjadi data karyawan.</span>';
      const employeeField = document.getElementById('dkTemplateEmployee')?.closest('.bm-template-detail-field');
      if (employeeField) employeeField.insertAdjacentElement('afterend', hint);
      else templateDetailMeta.appendChild(hint);
    }
    const customRecipientInput = document.getElementById('dkTemplateCustomRecipient');
    const customRecipientWrap = document.getElementById('dkTemplateCustomRecipientWrap');
    if (customRecipientInput) customRecipientInput.value = '';
    if (customRecipientWrap) customRecipientWrap.hidden = true;
    updateTemplatePreview();

    if (!detailModal) return;
    if (listModal) {
      const listModalEl = document.getElementById('dkTemplateModal');
      const handleHidden = function () {
        listModalEl.removeEventListener('hidden.bs.modal', handleHidden);
        detailModal.show();
        window.setTimeout(updateTemplatePreview, 150);
      };
      listModalEl.addEventListener('hidden.bs.modal', handleHidden);
      listModal.hide();
      return;
    }
    detailModal.show();
  }

  function filterTemplateCards(keyword) {
    const cards = document.querySelectorAll('[data-template-card]');
    const empty = document.getElementById('dkTemplateEmpty');
    const normalized = String(keyword || '').trim().toLowerCase();
    let visible = 0;
    cards.forEach(function (card) {
      const name = (card.getAttribute('data-template-name') || card.textContent || '').trim().toLowerCase();
      const match = !normalized || name.indexOf(normalized) !== -1;
      card.hidden = !match;
      if (match) visible += 1;
    });
    if (empty) empty.style.display = visible ? 'none' : 'block';
  }


  function setTemplateUploadStep(step) {
    const step1Panel = document.getElementById('dkTemplateUploadStep1');
    const step2Panel = document.getElementById('dkTemplateUploadStep2');
    const step1Indicator = document.getElementById('dkTemplateUploadStepIndicator1');
    const step2Indicator = document.getElementById('dkTemplateUploadStepIndicator2');
    if (step1Panel) step1Panel.classList.toggle('is-active', step === 1);
    if (step2Panel) step2Panel.classList.toggle('is-active', step === 2);
    if (step1Indicator) step1Indicator.classList.toggle('is-active', step === 1);
    if (step2Indicator) step2Indicator.classList.toggle('is-active', step === 2);
  }

  function ensureTemplateCardExists(templateName) {
    const grid = document.getElementById('dkTemplateGrid');
    if (!grid) return;
    const safeName = String(templateName || '').trim();
    if (!safeName) return;
    const existing = grid.querySelector('[data-template-card][data-template-name="' + safeName.replace(/"/g, '\\"') + '"]');
    if (existing) return;

    const card = document.createElement('div');
    card.className = 'bm-template-card';
    card.setAttribute('data-template-card', '');
    card.setAttribute('data-template-name', safeName);
    card.innerHTML = [
      '<div class="bm-template-card-head">',
      '<h5 class="bm-template-card-title">' + escapeTemplateValue(safeName) + '</h5>',
      '<button class="bm-template-card-dots" type="button" data-template-dots aria-label="Aksi template"><iconify-icon icon="mdi:dots-vertical"></iconify-icon></button>',
      '</div>',
      '<div class="bm-template-card-body"><iconify-icon class="bm-template-doc-icon" icon="solar:folder-open-bold"></iconify-icon></div>'
    ].join('');
    grid.appendChild(card);
  }

  function openTemplateUploadModal() {
    const listModal = getModal('dkTemplateModal');
    const uploadModal = getModal('dkTemplateUploadModal');
    const listModalEl = document.getElementById('dkTemplateModal');
    const uploadModalEl = document.getElementById('dkTemplateUploadModal');
    const titleInput = document.getElementById('dkTemplateUploadTitle');
    const fileInput = document.getElementById('dkTemplateUploadFile');
    const previewName = document.getElementById('dkTemplateUploadPreviewName');
    const fileNameHint = document.getElementById('dkTemplateUploadFileName');

    if (titleInput) titleInput.value = '';
    if (fileInput) fileInput.value = '';
    if (previewName) previewName.textContent = 'Contoh_Template.docx';
    if (fileNameHint) fileNameHint.textContent = 'Belum ada file dipilih.';
    setTemplateUploadStep(1);
    if (!uploadModal) return;

    const showUpload = function () {
      if (uploadModalEl && listModal) {
        const returnList = function () {
          uploadModalEl.removeEventListener('hidden.bs.modal', returnList);
          if (listModal) listModal.show();
        };
        uploadModalEl.addEventListener('hidden.bs.modal', returnList);
      }

      uploadModal.show();
      window.setTimeout(function () {
        if (titleInput) titleInput.focus();
      }, 150);
    };

    if (listModal && listModalEl && listModalEl.classList.contains('show')) {
      const handleHidden = function () {
        listModalEl.removeEventListener('hidden.bs.modal', handleHidden);
        showUpload();
      };
      listModalEl.addEventListener('hidden.bs.modal', handleHidden);
      listModal.hide();
      return;
    }

    showUpload();
  }

  function createTemplateExtraInput(type, value) {
    const row = document.createElement('div');
    row.className = 'bm-template-create-extra-row bm-template-create-extra-row--image';
    row.setAttribute('data-template-image-row', type);
    row.innerHTML = [
      '<input class="d-none" type="file" accept="image/*" data-template-create-extra="' + type + '" />',
      '<button class="bm-template-create-image-pick" type="button"><i class="bx bx-image-add"></i><span>Pilih Foto</span></button>',
      '<button class="bm-template-create-extra-remove" type="button" aria-label="Hapus foto"><i class="bx bx-x"></i></button>'
    ].join('');

    const input = row.querySelector('input[type="file"]');
    const pickBtn = row.querySelector('.bm-template-create-image-pick');

    function setPreviewImage(src) {
      if (!src || !input || !pickBtn) return;
      input.setAttribute('data-image-src', src);
      input.removeAttribute('data-dropped');
      row.classList.add('has-image');
      row.setAttribute('draggable', 'true');
      pickBtn.innerHTML = '<img src="' + src + '" alt="Foto ' + type + '" /><span class="bm-template-create-drag-hint">Tarik ke ' + (type === 'header' ? 'Header' : 'Footer') + '</span>';
      syncTemplateCreatePreview();
    }

    if (value) setPreviewImage(value);

    if (input) {
      input.addEventListener('change', function () {
        const file = input.files && input.files[0] ? input.files[0] : null;
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function () {
          setPreviewImage(String(reader.result || ''));
        };
        reader.readAsDataURL(file);
      });
    }

    if (pickBtn && input) {
      pickBtn.addEventListener('click', function () {
        input.click();
      });
    }

    row.addEventListener('dragstart', function (event) {
      const src = input ? input.getAttribute('data-image-src') : '';
      if (!src) {
        event.preventDefault();
        return;
      }
      row.classList.add('is-dragging');
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'copy';
        event.dataTransfer.setData('text/plain', src);
        event.dataTransfer.setData('application/x-bm-template-image-type', type);
      }
    });

    row.addEventListener('dragend', function () {
      row.classList.remove('is-dragging');
    });

    const removeBtn = row.querySelector('.bm-template-create-extra-remove');
    if (removeBtn) {
      removeBtn.addEventListener('click', function () {
        row.remove();
        syncTemplateCreateExtraRemovableState(type);
        syncTemplateCreatePreview();
      });
    }

    return row;
  }

  function getTemplateCreateExtraValues(type) {
    return Array.from(document.querySelectorAll('[data-template-create-extra="' + type + '"]')).map(function (input) {
      return input.getAttribute('data-dropped') === 'true' ? (input.getAttribute('data-image-src') || '') : '';
    }).filter(Boolean);
  }

  function syncTemplateCreateExtraRemovableState(type) {
    const rows = Array.from(document.querySelectorAll('[data-template-create-extra="' + type + '"]')).map(function (input) {
      return input.closest('.bm-template-create-extra-row');
    }).filter(Boolean);
    rows.forEach(function (row, index) {
      row.classList.toggle('is-removable', index > 0);
    });
  }

  function renderTemplateCreateExtraChips(targetId, values) {
    const target = document.getElementById(targetId);
    if (!target) return;
    if (!values.length) {
      target.innerHTML = '';
      return;
    }
    target.innerHTML = values.map(function (value) {
      return '<img class="bm-template-create-preview-image" src="' + value + '" alt="Foto template" />';
    }).join('');
  }

  function syncTemplateCreatePreview() {
    const previewBody = document.getElementById('dkTemplateCreatePreviewBody');
    const headerValues = getTemplateCreateExtraValues('header');
    const footerValues = getTemplateCreateExtraValues('footer');

    if (previewBody) {
      previewBody.setAttribute('contenteditable', 'true');
      previewBody.setAttribute('data-placeholder', 'Tulis isi template di sini seperti mengetik di Word...');
      if (!previewBody.innerHTML.trim()) previewBody.innerHTML = '';
    }

    renderTemplateCreateExtraChips('dkTemplateCreatePreviewHeader', headerValues);
    renderTemplateCreateExtraChips('dkTemplateCreatePreviewFooter', footerValues);
  }

  function resetTemplateCreateModal() {
    const docInput = document.getElementById('dkTemplateCreateDocNumber');
    const titleInput = document.getElementById('dkTemplateCreateTitle');
    const codeInput = document.getElementById('dkTemplateCreateCodeInput');
    const extrasWrap = document.getElementById('dkTemplateCreateExtrasWrap');
    const toggleBtn = document.getElementById('dkTemplateCreateToggleExtras');
    const headerMain = document.getElementById('dkTemplateCreateHeaderMain');
    const footerMain = document.getElementById('dkTemplateCreateFooterMain');
    const headerList = document.getElementById('dkTemplateCreateHeaderList');
    const footerList = document.getElementById('dkTemplateCreateFooterList');

    if (docInput) docInput.value = '';
    if (titleInput) titleInput.value = '';
    if (codeInput) codeInput.value = '';
    if (headerMain) {
      headerMain.innerHTML = '';
      headerMain.appendChild(createTemplateExtraInput('header', ''));
    }
    if (footerMain) {
      footerMain.innerHTML = '';
      footerMain.appendChild(createTemplateExtraInput('footer', ''));
    }
    if (headerList) headerList.innerHTML = '';
    if (footerList) footerList.innerHTML = '';
    const previewBody = document.getElementById('dkTemplateCreatePreviewBody');
    if (previewBody) {
      previewBody.innerHTML = '';
      previewBody.setAttribute('contenteditable', 'true');
      previewBody.setAttribute('data-placeholder', 'Tulis isi template di sini seperti mengetik di Word...');
    }
    if (extrasWrap) extrasWrap.hidden = false;
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
    syncTemplateCreateExtraRemovableState('header');
    syncTemplateCreateExtraRemovableState('footer');
    syncTemplateCreatePreview();
  }

  function clearModalStateAfterInlineTemplate() {
    document.querySelectorAll('.modal-backdrop').forEach(function (backdrop) { backdrop.remove(); });
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');
  }

  function reopenTemplateDocumentModal() {
    const templateModal = getModal('dkTemplateModal');
    if (!templateModal) return;

    window.setTimeout(function () {
      clearModalStateAfterInlineTemplate();
      templateModal.show();
    }, 80);
  }

  function restoreFolderMainViewFromTemplateEditor(returnToDocumentModal) {
    const editor = document.getElementById('bmTemplateInlineEditor');
    if (editor) editor.remove();

    document.querySelectorAll('[data-bm-template-hidden="true"]').forEach(function (el) {
      el.hidden = false;
      el.removeAttribute('data-bm-template-hidden');
    });

    bmEditingTemplateName = null;

    if (returnToDocumentModal) reopenTemplateDocumentModal();
  }

  function buildInlineTemplatePreviewHtml(title, bodyHtml) {
    const cleanTitle = String(title || 'Dokumen Template').trim() || 'Dokumen Template';
    const html = bodyHtml || '<p>Isi template dapat disesuaikan melalui editor.</p>';
    const renderedHtml = renderTemplateVariablesInHtml(html);

    if (String(renderedHtml).indexOf('bm-template-inline-saved-page') >= 0) {
      return [
        '<div class="bm-template-preview-a4-stack bm-template-preview-a4-stack--inline">',
        renderedHtml,
        '</div>'
      ].join('');
    }

    return [
      '<div class="bm-template-preview-document">',
      '<h4>' + escapeHtml(cleanTitle.toUpperCase()) + '</h4>',
      '<div class="bm-template-preview-section">',
      renderedHtml,
      '</div>',
      '</div>'
    ].join('');
  }

  function createInlineTemplatePage(pageNumber, bodyHtml) {
    const page = document.createElement('article');
    page.className = 'bm-template-inline-paper';
    page.setAttribute('data-inline-page', String(pageNumber || 1));
    page.innerHTML = [
      '<div class="bm-template-inline-page-label">Halaman ' + String(pageNumber || 1) + '</div>',
      '<div class="bm-template-inline-doc-header">Header</div>',
      '<div class="bm-template-inline-body" contenteditable="true" spellcheck="false" data-placeholder="Tulis template dokumen di sini...">',
      bodyHtml || '<p><br></p>',
      '</div>',
      '<div class="bm-template-inline-doc-footer">Footer</div>'
    ].join('');
    return page;
  }

  function renumberInlineTemplatePages() {
    document.querySelectorAll('#bmTemplateInlinePages [data-inline-page]').forEach(function (page, index) {
      const number = index + 1;
      page.setAttribute('data-inline-page', String(number));
      const label = page.querySelector('.bm-template-inline-page-label');
      if (label) label.textContent = 'Halaman ' + number;
    });
  }

  function getInlineTemplateBodies() {
    return Array.from(document.querySelectorAll('#bmTemplateInlinePages .bm-template-inline-body'));
  }

  function ensureInlineTemplateNextPage(body) {
    const page = body ? body.closest('[data-inline-page]') : null;
    const container = document.getElementById('bmTemplateInlinePages');
    if (!page || !container) return null;

    let nextPage = page.nextElementSibling;
    if (!nextPage || !nextPage.matches('[data-inline-page]')) {
      nextPage = createInlineTemplatePage(container.querySelectorAll('[data-inline-page]').length + 1, '');
      container.insertBefore(nextPage, page.nextElementSibling);
      bindInlineTemplatePage(nextPage);
      renumberInlineTemplatePages();
    }

    return nextPage.querySelector('.bm-template-inline-body');
  }

  function splitInlineTemplateBlockToNext(body, nextBody) {
    const node = body && body.lastChild ? body.lastChild : null;
    if (!node || !nextBody) return false;

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (text.length < 24) return false;
      const cut = Math.max(12, Math.floor(text.length * .68));
      const left = text.slice(0, cut);
      const right = text.slice(cut);
      node.textContent = left;
      nextBody.insertBefore(document.createTextNode(right), nextBody.firstChild);
      return true;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const text = node.textContent || '';
      if (text.length < 32) return false;
      const cut = Math.max(16, Math.floor(text.length * .68));
      const clone = node.cloneNode(false);
      clone.textContent = text.slice(cut).trimStart() || '\u00a0';
      node.textContent = text.slice(0, cut).trimEnd() || '\u00a0';
      nextBody.insertBefore(clone, nextBody.firstChild);
      return true;
    }

    return false;
  }

  function isInlineBodyOverflowing(body) {
    if (!body) return false;
    return body.scrollHeight > body.clientHeight + 8;
  }

  function cleanEmptyInlineTemplatePages() {
    const pages = Array.from(document.querySelectorAll('#bmTemplateInlinePages [data-inline-page]'));
    pages.slice(1).reverse().forEach(function (page) {
      const body = page.querySelector('.bm-template-inline-body');
      const text = body ? String(body.innerText || body.textContent || '').replace(/\u200b/g, '').trim() : '';
      const hasMedia = body && body.querySelector('img, table, iframe');
      if (!text && !hasMedia) page.remove();
    });
    renumberInlineTemplatePages();
  }

  function paginateInlineTemplatePages(activeBody) {
    const bodies = getInlineTemplateBodies();
    bodies.forEach(function (body) {
      let safety = 0;
      while (isInlineBodyOverflowing(body) && safety < 60) {
        safety += 1;
        const nextBody = ensureInlineTemplateNextPage(body);
        if (!nextBody) break;

        if (body.childNodes.length > 1) {
          nextBody.insertBefore(body.lastChild, nextBody.firstChild);
          continue;
        }

        if (!splitInlineTemplateBlockToNext(body, nextBody)) break;
      }
    });

    cleanEmptyInlineTemplatePages();

    if (activeBody && isInlineBodyOverflowing(activeBody)) {
      const next = ensureInlineTemplateNextPage(activeBody);
      if (next) {
        next.focus();
      }
    }
  }

  function bindInlineTemplatePage(page) {
    if (!page || page.getAttribute('data-inline-page-bound') === 'true') return;
    page.setAttribute('data-inline-page-bound', 'true');

    const body = page.querySelector('.bm-template-inline-body');
    if (!body) return;

    body.addEventListener('input', function () {
      window.clearTimeout(window.__bmTemplateInlinePaginateTimer);
      window.__bmTemplateInlinePaginateTimer = window.setTimeout(function () {
        paginateInlineTemplatePages(body);
      }, 80);
    });

    body.addEventListener('keydown', function (event) {
      if (event.key === 'Tab') {
        event.preventDefault();
        try { document.execCommand('insertText', false, '    '); } catch (error) { }
      }

      if (event.key === 'Enter' && body.scrollHeight >= body.clientHeight - 24) {
        window.setTimeout(function () {
          paginateInlineTemplatePages(body);
        }, 0);
      }
    });
  }

  function getInlineTemplateSavedPagesHtml() {
    const bodies = getInlineTemplateBodies();
    const pagesHtml = bodies.map(function (body, index) {
      const content = String(body.innerHTML || '').trim() || '<p><br></p>';
      return [
        '<section class="bm-template-preview-document bm-template-preview-a4-page bm-template-inline-saved-page">',
        '<div class="bm-template-preview-page-number">Halaman ' + String(index + 1) + '</div>',
        '<div class="bm-template-preview-section">',
        content,
        '</div>',
        '</section>'
      ].join('');
    }).join('');

    return pagesHtml || '<p>Isi template dapat disesuaikan melalui editor.</p>';
  }

  function getInlineTemplatePlainText() {
    return getInlineTemplateBodies().map(function (body) {
      return String(body.innerText || body.textContent || '').trim();
    }).filter(Boolean).join('\n\n');
  }

  function saveInlineTemplateEditor() {
    const titleInput = document.getElementById('bmTemplateInlineTitle');
    const body = document.querySelector('#bmTemplateInlinePages .bm-template-inline-body');
    paginateInlineTemplatePages(body);
    const title = String(titleInput && titleInput.value ? titleInput.value : '').trim() || 'Template Baru';
    const bodyHtml = getInlineTemplateSavedPagesHtml();
    const bodyText = getInlineTemplatePlainText();

    if (bmEditingTemplateName && bmEditingTemplateName !== title) {
      if (bmDemoTemplates[bmEditingTemplateName]) {
        delete bmDemoTemplates[bmEditingTemplateName];
      }
      const oldCard = document.getElementById('dkTemplateGrid')?.querySelector('[data-template-card][data-template-name="' + bmEditingTemplateName.replace(/"/g, '\\"') + '"]');
      if (oldCard) oldCard.remove();
    }

    bmDemoTemplates[title] = {
      label: title,
      title: title.toUpperCase(),
      documentTitle: title.toUpperCase(),
      kind: 'free',
      intro: 'Template dibuat dari editor dokumen.',
      objective: bodyText || 'Isi template dapat disesuaikan melalui editor dokumen.',
      closing: 'Template siap digunakan untuk dokumen internal perusahaan.',
      html: buildInlineTemplatePreviewHtml(title, bodyHtml)
    };

    ensureTemplateCardExists(title);
    filterTemplateCards(document.getElementById('dkTemplateSearchInput')?.value || '');

    restoreFolderMainViewFromTemplateEditor(true);
    showFolderFeedback('Template berhasil disimpan.', 'success');
  }

  let bmEditingTemplateName = null;

  function openTemplateEditModal(templateName) {
    bmEditingTemplateName = templateName;
    const listModal = getModal('dkTemplateModal');
    const listModalEl = document.getElementById('dkTemplateModal');

    if (listModal) listModal.hide();
    if (listModalEl) listModalEl.classList.remove('show');
    clearModalStateAfterInlineTemplate();

    restoreFolderMainViewFromTemplateEditor();

    const card = document.querySelector('.bm-folder-card-page');
    if (!card) return;

    const hideTargets = [
      document.getElementById('bmDrivePathbar'),
      card
    ].filter(Boolean);

    hideTargets.forEach(function (el) {
      el.hidden = true;
      el.setAttribute('data-bm-template-hidden', 'true');
    });

    const template = bmDemoTemplates[templateName] || bmDemoTemplates['Kontrak Kerja'];
    let bodyHtml = '';
    if (template && template.html) {
      const temp = document.createElement('div');
      temp.innerHTML = template.html;
      const sections = temp.querySelectorAll('.bm-template-preview-section');
      if (sections.length > 0) {
        bodyHtml = Array.prototype.map.call(sections, function (sec) {
          return sec.innerHTML;
        }).join('<p><br></p>');
      } else {
        bodyHtml = template.html;
      }
    } else {
      if (templateName === 'Surat') {
        bodyHtml = [
          '<h1>SURAT RESMI</h1>',
          '<p>Tasikmalaya, {{tanggal_dokumen}}</p>',
          '<p>Kepada Yth.<br><strong>{{nama_karyawan}}</strong><br>di Tempat</p>',
          '<p>Dengan hormat,</p>',
          '<p>Melalui surat ini, PT Bisa Media Grup menyampaikan pemberitahuan atau informasi resmi yang berkaitan dengan kebutuhan administrasi, pekerjaan, atau koordinasi perusahaan.</p>',
          '<p>Adapun isi surat dapat disesuaikan kembali berdasarkan kebutuhan, nama penerima, jabatan, dan konteks dokumen yang akan digunakan.</p>',
          '<p>Demikian surat ini dibuat untuk digunakan sebagaimana mestinya. Atas perhatian dan kerja samanya, kami ucapkan terima kasih.</p>'
        ].join('');
      } else if (templateName === 'Dokumen Bebas') {
        bodyHtml = [
          '<h1>DOKUMEN BEBAS</h1>',
          '<p>Tulis isi dokumen bebas di sini. Anda dapat menggunakan format teks tebal, miring, garis bawah, serta memasukkan variabel karyawan.</p>'
        ].join('');
      } else {
        bodyHtml = [
          '<h1>PERJANJIAN KERJA WAKTU TERTENTU</h1>',
          '<p>Bahwa Perjanjian Kerja Waktu Tertentu ini dibuat oleh dan antara pihak perusahaan dengan karyawan:</p>',
          '<p>Nama: {{nama_karyawan}}<br>Jabatan: {{jabatan}}<br>Divisi: {{divisi}}</p>',
          '<p>Kedua belah pihak telah sepakat untuk mengikatkan diri dalam hubungan kerja dengan ketentuan-ketentuan perjanjian kerja yang telah ditentukan.</p>'
        ].join('');
      }
    }

    const editor = document.createElement('div');
    editor.id = 'bmTemplateInlineEditor';
    editor.className = 'bm-template-inline-docs';
    editor.innerHTML = [
      '<div class="bm-template-inline-topbar">',
      '<button class="btn btn-sm btn-outline-secondary bm-template-inline-back" type="button" id="bmTemplateInlineBack">',
      '<i class="bx bx-arrow-back me-1"></i>Kembali',
      '</button>',
      '<div class="bm-template-inline-file">',
      '<span class="bm-template-inline-file-icon"><iconify-icon icon="mdi:file-document-edit-outline"></iconify-icon></span>',
      '<div class="bm-template-inline-file-main">',
      '<input class="bm-template-inline-title" id="bmTemplateInlineTitle" value="' + escapeTemplateValue(templateName) + '" aria-label="Judul template" />',
      '<div class="bm-template-inline-url">docs.google.com/document/d/template-edit/edit</div>',
      '</div>',
      '</div>',
      '<button class="btn btn-primary btn-sm bm-template-inline-save" type="button" id="bmTemplateInlineSave">Simpan Template</button>',
      '</div>',
      '<div class="bm-template-inline-toolbar" aria-label="Toolbar dokumen">',
      '<button type="button" data-inline-command="bold"><strong>B</strong></button>',
      '<button type="button" data-inline-command="italic"><em>I</em></button>',
      '<button type="button" data-inline-command="underline"><u>U</u></button>',
      '<span class="bm-template-inline-separator"></span>',
      '<button type="button" data-inline-command="insertUnorderedList"><i class="bx bx-list-ul"></i></button>',
      '<button type="button" data-inline-command="insertOrderedList"><i class="bx bx-list-ol"></i></button>',
      '<span class="bm-template-inline-separator"></span>',
      '<button type="button" data-inline-command="justifyLeft"><i class="bx bx-align-left"></i></button>',
      '<button type="button" data-inline-command="justifyCenter"><i class="bx bx-align-middle"></i></button>',
      '<button type="button" data-inline-command="justifyRight"><i class="bx bx-align-right"></i></button>',
      '<span class="bm-template-inline-separator"></span>',
      '<div class="bm-template-inline-variable-wrap">',
      '<select class="bm-template-inline-variable-select" id="bmTemplateInlineVariableSelect" aria-label="Pilih variable karyawan">',
      '<option value="">Variable Karyawan</option>',
      '<option value="{{nama_karyawan}}">Nama Karyawan</option>',
      '<option value="{{nik}}">NIK / ID Karyawan</option>',
      '<option value="{{jabatan}}">Jabatan</option>',
      '<option value="{{divisi}}">Divisi</option>',
      '<option value="{{sub_perusahaan}}">Sub Perusahaan</option>',
      '<option value="{{email_karyawan}}">Email</option>',
      '<option value="{{nomor_dokumen}}">Nomor Dokumen</option>',
      '<option value="{{tanggal_dokumen}}">Tanggal Dokumen</option>',
      '</select>',
      '<button class="bm-template-inline-variable-btn" type="button" id="bmTemplateInlineInsertVariable">Masukkan</button>',
      '</div>',
      '</div>',
      '<div class="bm-template-inline-workspace">',
      '<div class="bm-template-inline-pages" id="bmTemplateInlinePages">',
      '<article class="bm-template-inline-paper" data-inline-page="1">',
      '<div class="bm-template-inline-page-label">Halaman 1</div>',
      '<div class="bm-template-inline-doc-header">Header</div>',
      '<div class="bm-template-inline-body" id="bmTemplateInlineBody" contenteditable="true" spellcheck="false" data-placeholder="Tulis template dokumen di sini...">',
      bodyHtml,
      '</div>',
      '<div class="bm-template-inline-doc-footer">Footer</div>',
      '</article>',
      '</div>',
      '</div>'
    ].join('');

    card.insertAdjacentElement('afterend', editor);

    const titleInput = document.getElementById('bmTemplateInlineTitle');
    const body = document.querySelector('#bmTemplateInlinePages .bm-template-inline-body');
    const firstPage = document.querySelector('#bmTemplateInlinePages [data-inline-page]');
    if (firstPage) bindInlineTemplatePage(firstPage);
    const backBtn = document.getElementById('bmTemplateInlineBack');
    const saveBtn = document.getElementById('bmTemplateInlineSave');

    if (titleInput && body) {
      window.setTimeout(function () {
        titleInput.focus();
      }, 120);
    }

    editor.querySelectorAll('[data-inline-command]').forEach(function (button) {
      button.addEventListener('click', function () {
        const command = button.getAttribute('data-inline-command');
        if (!command) return;
        const activeEditable = document.activeElement && document.activeElement.closest
          ? document.activeElement.closest('#bmTemplateInlinePages .bm-template-inline-body')
          : null;
        const targetBody = activeEditable || body;
        if (targetBody) targetBody.focus();
        try { document.execCommand(command, false, null); } catch (error) { }
        window.setTimeout(function () { paginateInlineTemplatePages(targetBody); }, 0);
      });
    });

    const variableSelect = document.getElementById('bmTemplateInlineVariableSelect');
    const insertVariableBtn = document.getElementById('bmTemplateInlineInsertVariable');

    function insertInlineTemplateVariable() {
      const value = variableSelect ? String(variableSelect.value || '') : '';
      if (!value) {
        showFolderFeedback('Pilih variable karyawan terlebih dahulu.', 'warning');
        return;
      }

      const activeEditable = document.activeElement && document.activeElement.closest
        ? document.activeElement.closest('#bmTemplateInlinePages .bm-template-inline-body')
        : null;
      const targetBody = activeEditable || body;
      if (targetBody) targetBody.focus();

      try {
        document.execCommand('insertText', false, value);
      } catch (error) {
        const selection = window.getSelection ? window.getSelection() : null;
        if (selection && selection.rangeCount) {
          selection.getRangeAt(0).insertNode(document.createTextNode(value));
        } else if (targetBody) {
          targetBody.appendChild(document.createTextNode(value));
        }
      }

      if (variableSelect) variableSelect.value = '';
      window.setTimeout(function () { paginateInlineTemplatePages(targetBody); }, 0);
    }

    if (insertVariableBtn) {
      insertVariableBtn.addEventListener('click', insertInlineTemplateVariable);
    }

    if (variableSelect) {
      variableSelect.addEventListener('change', function () {
        if (variableSelect.value) insertInlineTemplateVariable();
      });
    }

    if (backBtn) {
      backBtn.addEventListener('click', function () {
        restoreFolderMainViewFromTemplateEditor(true);
      });
    }
    if (saveBtn) saveBtn.addEventListener('click', saveInlineTemplateEditor);
  }

  function openTemplateCreateModal() {
    const listModal = getModal('dkTemplateModal');
    const listModalEl = document.getElementById('dkTemplateModal');

    if (listModal) listModal.hide();
    if (listModalEl) listModalEl.classList.remove('show');
    clearModalStateAfterInlineTemplate();

    restoreFolderMainViewFromTemplateEditor();

    const card = document.querySelector('.bm-folder-card-page');
    if (!card) return;

    const hideTargets = [
      document.getElementById('bmDrivePathbar'),
      card
    ].filter(Boolean);

    hideTargets.forEach(function (el) {
      el.hidden = true;
      el.setAttribute('data-bm-template-hidden', 'true');
    });

    const editor = document.createElement('div');
    editor.id = 'bmTemplateInlineEditor';
    editor.className = 'bm-template-inline-docs';
    editor.innerHTML = [
      '<div class="bm-template-inline-topbar">',
      '<button class="btn btn-sm btn-outline-secondary bm-template-inline-back" type="button" id="bmTemplateInlineBack">',
      '<i class="bx bx-arrow-back me-1"></i>Kembali',
      '</button>',
      '<div class="bm-template-inline-file">',
      '<span class="bm-template-inline-file-icon"><iconify-icon icon="mdi:file-document-edit-outline"></iconify-icon></span>',
      '<div class="bm-template-inline-file-main">',
      '<input class="bm-template-inline-title" id="bmTemplateInlineTitle" value="Untitled document" aria-label="Judul template" />',
      '<div class="bm-template-inline-url">docs.google.com/document/d/template-baru/edit</div>',
      '</div>',
      '</div>',
      '<button class="btn btn-primary btn-sm bm-template-inline-save" type="button" id="bmTemplateInlineSave">Simpan Template</button>',
      '</div>',
      '<div class="bm-template-inline-toolbar" aria-label="Toolbar dokumen">',
      '<button type="button" data-inline-command="bold"><strong>B</strong></button>',
      '<button type="button" data-inline-command="italic"><em>I</em></button>',
      '<button type="button" data-inline-command="underline"><u>U</u></button>',
      '<span class="bm-template-inline-separator"></span>',
      '<button type="button" data-inline-command="insertUnorderedList"><i class="bx bx-list-ul"></i></button>',
      '<button type="button" data-inline-command="insertOrderedList"><i class="bx bx-list-ol"></i></button>',
      '<span class="bm-template-inline-separator"></span>',
      '<button type="button" data-inline-command="justifyLeft"><i class="bx bx-align-left"></i></button>',
      '<button type="button" data-inline-command="justifyCenter"><i class="bx bx-align-middle"></i></button>',
      '<button type="button" data-inline-command="justifyRight"><i class="bx bx-align-right"></i></button>',
      '<span class="bm-template-inline-separator"></span>',
      '<div class="bm-template-inline-variable-wrap">',
      '<select class="bm-template-inline-variable-select" id="bmTemplateInlineVariableSelect" aria-label="Pilih variable karyawan">',
      '<option value="">Variable Karyawan</option>',
      '<option value="{{nama_karyawan}}">Nama Karyawan</option>',
      '<option value="{{nik}}">NIK / ID Karyawan</option>',
      '<option value="{{jabatan}}">Jabatan</option>',
      '<option value="{{divisi}}">Divisi</option>',
      '<option value="{{sub_perusahaan}}">Sub Perusahaan</option>',
      '<option value="{{email_karyawan}}">Email</option>',
      '<option value="{{nomor_dokumen}}">Nomor Dokumen</option>',
      '<option value="{{tanggal_dokumen}}">Tanggal Dokumen</option>',
      '</select>',
      '<button class="bm-template-inline-variable-btn" type="button" id="bmTemplateInlineInsertVariable">Masukkan</button>',
      '</div>',
      '</div>',
      '<div class="bm-template-inline-workspace">',
      '<div class="bm-template-inline-pages" id="bmTemplateInlinePages">',
      '<article class="bm-template-inline-paper" data-inline-page="1">',
      '<div class="bm-template-inline-page-label">Halaman 1</div>',
      '<div class="bm-template-inline-doc-header">Header</div>',
      '<div class="bm-template-inline-body" id="bmTemplateInlineBody" contenteditable="true" spellcheck="false" data-placeholder="Tulis template dokumen di sini...">',
      '<h1>Untitled document</h1>',
      '<p>Mulai tulis isi template seperti di Google Docs.</p>',
      '</div>',
      '<div class="bm-template-inline-doc-footer">Footer</div>',
      '</article>',
      '</div>',
      '</div>'
    ].join('');

    card.insertAdjacentElement('afterend', editor);

    const titleInput = document.getElementById('bmTemplateInlineTitle');
    const body = document.querySelector('#bmTemplateInlinePages .bm-template-inline-body');
    const firstPage = document.querySelector('#bmTemplateInlinePages [data-inline-page]');
    if (firstPage) bindInlineTemplatePage(firstPage);
    const backBtn = document.getElementById('bmTemplateInlineBack');
    const saveBtn = document.getElementById('bmTemplateInlineSave');

    if (titleInput && body) {
      titleInput.addEventListener('input', function () {
        const h1 = body.querySelector('h1');
        if (h1) h1.textContent = titleInput.value || 'Untitled document';
      });
      window.setTimeout(function () {
        titleInput.focus();
        titleInput.select();
      }, 120);
    }

    editor.querySelectorAll('[data-inline-command]').forEach(function (button) {
      button.addEventListener('click', function () {
        const command = button.getAttribute('data-inline-command');
        if (!command) return;
        const activeEditable = document.activeElement && document.activeElement.closest
          ? document.activeElement.closest('#bmTemplateInlinePages .bm-template-inline-body')
          : null;
        const targetBody = activeEditable || body;
        if (targetBody) targetBody.focus();
        try { document.execCommand(command, false, null); } catch (error) { }
        window.setTimeout(function () { paginateInlineTemplatePages(targetBody); }, 0);
      });
    });

    const variableSelect = document.getElementById('bmTemplateInlineVariableSelect');
    const insertVariableBtn = document.getElementById('bmTemplateInlineInsertVariable');

    function insertInlineTemplateVariable() {
      const value = variableSelect ? String(variableSelect.value || '') : '';
      if (!value) {
        showFolderFeedback('Pilih variable karyawan terlebih dahulu.', 'warning');
        return;
      }

      const activeEditable = document.activeElement && document.activeElement.closest
        ? document.activeElement.closest('#bmTemplateInlinePages .bm-template-inline-body')
        : null;
      const targetBody = activeEditable || body;
      if (targetBody) targetBody.focus();

      try {
        document.execCommand('insertText', false, value);
      } catch (error) {
        const selection = window.getSelection ? window.getSelection() : null;
        if (selection && selection.rangeCount) {
          selection.getRangeAt(0).insertNode(document.createTextNode(value));
        } else if (targetBody) {
          targetBody.appendChild(document.createTextNode(value));
        }
      }

      if (variableSelect) variableSelect.value = '';
      window.setTimeout(function () { paginateInlineTemplatePages(targetBody); }, 0);
    }

    if (insertVariableBtn) {
      insertVariableBtn.addEventListener('click', insertInlineTemplateVariable);
    }

    if (variableSelect) {
      variableSelect.addEventListener('change', function () {
        if (variableSelect.value) insertInlineTemplateVariable();
      });
    }

    if (backBtn) {
      backBtn.addEventListener('click', function () {
        restoreFolderMainViewFromTemplateEditor(true);
      });
    }
    if (saveBtn) saveBtn.addEventListener('click', saveInlineTemplateEditor);
  }

  function saveCreatedTemplateDemo() {
    const titleInput = document.getElementById('dkTemplateCreateTitle');
    const docInput = document.getElementById('dkTemplateCreateDocNumber');
    const previewBody = document.getElementById('dkTemplateCreatePreviewBody');
    const createModal = getModal('dkTemplateCreateModal');
    const title = titleInput ? String(titleInput.value || '').trim() : '';
    const docNumber = docInput ? String(docInput.value || '').trim() : '';
    const bodyText = previewBody ? String(previewBody.innerText || previewBody.textContent || '').trim() : '';
    const headerValues = getTemplateCreateExtraValues('header');
    const footerValues = getTemplateCreateExtraValues('footer');

    if (!title) {
      showFolderFeedback('Judul template harus diisi.', 'danger');
      return;
    }

    bmDemoTemplates[title] = {
      label: title,
      title: title.toUpperCase(),
      documentTitle: title.toUpperCase(),
      kind: 'free',
      intro: docNumber ? 'Nomor dokumen: ' + docNumber + '.' : 'Template dibuat dari fitur New Template.',
      objective: bodyText || 'Isi template dapat disesuaikan melalui editor template.',
      closing: (headerValues.length || footerValues.length) ? 'Header/footer gambar sudah disiapkan pada template.' : 'Template siap digunakan untuk dokumen internal perusahaan.'
    };

    ensureTemplateCardExists(title);
    filterTemplateCards(document.getElementById('dkTemplateSearchInput')?.value || '');

    if (createModal) createModal.hide();
    showFolderFeedback('Template baru berhasil disimpan.', 'success');
  }


  function saveUploadedTemplateDemo() {
    const titleInput = document.getElementById('dkTemplateUploadTitle');
    const fileInput = document.getElementById('dkTemplateUploadFile');
    const uploadModal = getModal('dkTemplateUploadModal');
    const listModal = getModal('dkTemplateModal');
    const templateName = titleInput ? String(titleInput.value || '').trim() : '';
    const selectedFileName = fileInput && fileInput.files && fileInput.files[0] ? fileInput.files[0].name : '';

    if (!templateName) {
      showFolderFeedback('Judul template harus diisi.', 'danger');
      setTemplateUploadStep(1);
      return;
    }
    if (!selectedFileName) {
      showFolderFeedback('Silakan pilih file template terlebih dahulu.', 'danger');
      setTemplateUploadStep(2);
      return;
    }

    bmDemoTemplates[templateName] = bmDemoTemplates[templateName] || {
      label: 'Template Upload',
      title: templateName.toUpperCase(),
      documentTitle: templateName.toUpperCase(),
      intro: 'Ini adalah contoh template yang diupload melalui popup Upload Template.',
      objective: 'Template ini dapat digunakan sebagai dasar dokumen dan menyesuaikan data karyawan yang dipilih.',
      closing: 'Silakan lanjutkan proses penyimpanan atau penggunaan template sesuai kebutuhan.'
    };

    ensureTemplateCardExists(templateName);
    filterTemplateCards('');

    if (uploadModal) {
      uploadModal.hide();
    } else if (listModal) {
      listModal.show();
    }
    showFolderFeedback('Template berhasil diupload.', 'success');
  }


  let bmTemplateDeleteTarget = null;

  function getTemplateDeleteMenu() {
    let menu = document.getElementById('bmTemplateDeleteMenu');
    if (!menu) {
      menu = document.createElement('div');
      menu.id = 'bmTemplateDeleteMenu';
      menu.className = 'bm-template-delete-menu';
      menu.innerHTML = [
        '<button type="button" data-template-rename-confirm><span class="bm-menu-iconify"><iconify-icon icon="material-symbols:drive-file-rename-outline-rounded"></iconify-icon></span>Rename</button>',
        '<button type="button" data-template-edit-confirm><span class="bm-menu-iconify"><iconify-icon icon="material-symbols:edit-note-rounded"></iconify-icon></span>Edit</button>',
        '<button type="button" data-template-delete-confirm><span class="bm-menu-iconify"><iconify-icon icon="material-symbols:delete-rounded"></iconify-icon></span>Hapus</button>'
      ].join('');
      document.body.appendChild(menu);
    }
    return menu;
  }

  function closeTemplateDeleteMenu() {
    const menu = document.getElementById('bmTemplateDeleteMenu');
    if (menu) menu.classList.remove('show');
    bmTemplateDeleteTarget = null;
  }

  function openTemplateDeleteMenu(button) {
    const card = button.closest('[data-template-card]');
    if (!card) return;
    bmTemplateDeleteTarget = card;
    const menu = getTemplateDeleteMenu();
    const rect = button.getBoundingClientRect();
    const width = 130;
    let left = rect.right - width;
    let top = rect.bottom + 6;
    if (left < 12) left = 12;
    const menuHeight = menu.offsetHeight || 115;
    if (top + menuHeight > window.innerHeight - 12) top = rect.top - menuHeight - 6;
    menu.style.left = left + 'px';
    menu.style.top = top + 'px';
    menu.classList.add('show');
  }

  function deleteTemplateCard(card) {
    if (!card) return;
    const name = card.getAttribute('data-template-name') || 'Template';

    const performDelete = function () {
      if (bmDemoTemplates[name]) delete bmDemoTemplates[name];
      card.remove();
      filterTemplateCards(document.getElementById('dkTemplateSearchInput')?.value || '');
      showFolderFeedback('Template berhasil dihapus.', 'success');
    };

    if (typeof window.bmOpenDeleteDialog === 'function') {
      window.bmOpenDeleteDialog({ name: name, onConfirm: performDelete });
      return;
    }

    if (!window.confirm('Hapus template "' + name + '"?')) return;
    performDelete();
  }

  function bindTemplateModal() {
    if (window.__bmTemplateModalBound) return;
    window.__bmTemplateModalBound = true;

    const searchInput = document.getElementById('dkTemplateSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        filterTemplateCards(searchInput.value || '');
      });
    }

    const docNumberInput = document.getElementById('dkTemplateDocNumber');
    if (docNumberInput) {
      docNumberInput.addEventListener('input', updateTemplatePreview);
    }

    const templateNameInput = document.getElementById('dkTemplateDetailNameInput');
    if (templateNameInput) {
      templateNameInput.addEventListener('input', function () {
        // Sengaja tidak melakukan perubahan ke daftar Document atau preview.
      });
    }

    const templateBackBtn = document.getElementById('dkTemplateDetailBackBtn');
    if (templateBackBtn) {
      templateBackBtn.addEventListener('click', function () {
        const detailModal = getModal('dkTemplateDetailModal');
        const listModal = getModal('dkTemplateModal');
        if (detailModal) {
          const detailModalEl = document.getElementById('dkTemplateDetailModal');
          const handleHidden = function () {
            detailModalEl.removeEventListener('hidden.bs.modal', handleHidden);
            if (listModal) listModal.show();
          };
          detailModalEl.addEventListener('hidden.bs.modal', handleHidden);
          detailModal.hide();
        } else if (listModal) {
          listModal.show();
        }
      });
    }

    const employeeSelect = document.getElementById('dkTemplateEmployee');
    const customRecipientInput = document.getElementById('dkTemplateCustomRecipient');
    const customRecipientWrap = document.getElementById('dkTemplateCustomRecipientWrap');
    function syncCustomRecipientField() {
      if (customRecipientWrap && employeeSelect) customRecipientWrap.hidden = employeeSelect.value !== '__custom';
      syncTemplateEmployeeQuickPicker();
      updateTemplatePreview();
    }
    if (employeeSelect) {
      employeeSelect.disabled = false;
      employeeSelect.removeAttribute('disabled');
      employeeSelect.style.pointerEvents = 'auto';
      employeeSelect.addEventListener('click', function (event) {
        event.stopPropagation();
      });
      employeeSelect.addEventListener('mousedown', function (event) {
        event.stopPropagation();
      });
      employeeSelect.addEventListener('change', syncCustomRecipientField);
    }
    if (customRecipientInput) {
      customRecipientInput.addEventListener('input', updateTemplatePreview);
    }

    const createDocInput = document.getElementById('dkTemplateCreateDocNumber');
    const createTitleInput = document.getElementById('dkTemplateCreateTitle');
    const createCodeInput = document.getElementById('dkTemplateCreateCodeInput');
    const createToggleBtn = document.getElementById('dkTemplateCreateToggleExtras');
    const createExtrasWrap = document.getElementById('dkTemplateCreateExtrasWrap');
    const createAddHeaderBtn = document.getElementById('dkTemplateCreateAddHeader');
    const createAddFooterBtn = document.getElementById('dkTemplateCreateAddFooter');
    const createHeaderList = document.getElementById('dkTemplateCreateHeaderList');
    const createFooterList = document.getElementById('dkTemplateCreateFooterList');
    const createSaveBtn = document.getElementById('dkTemplateCreateSaveBtn');

    [createDocInput, createTitleInput, createCodeInput].forEach(function (input) {
      if (input) input.addEventListener('input', syncTemplateCreatePreview);
    });

    if (createToggleBtn) {
      createToggleBtn.addEventListener('click', function () {
        const expanded = createToggleBtn.getAttribute('aria-expanded') !== 'false';
        createToggleBtn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        if (createExtrasWrap) createExtrasWrap.hidden = expanded;
      });
    }

    if (createAddHeaderBtn && createHeaderList) {
      createAddHeaderBtn.addEventListener('click', function () {
        const row = createTemplateExtraInput('header', '');
        createHeaderList.appendChild(row);
        syncTemplateCreateExtraRemovableState('header');
        const input = row.querySelector('input[type="file"]');
        if (input) input.click();
      });
    }

    if (createAddFooterBtn && createFooterList) {
      createAddFooterBtn.addEventListener('click', function () {
        const row = createTemplateExtraInput('footer', '');
        createFooterList.appendChild(row);
        syncTemplateCreateExtraRemovableState('footer');
        const input = row.querySelector('input[type="file"]');
        if (input) input.click();
      });
    }

    if (createSaveBtn) {
      createSaveBtn.addEventListener('click', saveCreatedTemplateDemo);
    }

    function bindCreateImageDropZone(zoneId, type) {
      const zone = document.getElementById(zoneId);
      if (!zone || zone.getAttribute('data-drop-bound') === 'true') return;
      zone.setAttribute('data-drop-bound', 'true');

      zone.addEventListener('dragover', function (event) {
        const dragType = event.dataTransfer ? event.dataTransfer.getData('application/x-bm-template-image-type') : '';
        if (dragType && dragType !== type) return;
        event.preventDefault();
        zone.classList.add('is-drop-ready');
      });

      zone.addEventListener('dragleave', function () {
        zone.classList.remove('is-drop-ready');
      });

      zone.addEventListener('drop', function (event) {
        event.preventDefault();
        zone.classList.remove('is-drop-ready');

        const src = event.dataTransfer ? event.dataTransfer.getData('text/plain') : '';
        const dragType = event.dataTransfer ? event.dataTransfer.getData('application/x-bm-template-image-type') : '';
        if (!src || (dragType && dragType !== type)) return;

        document.querySelectorAll('[data-template-create-extra="' + type + '"]').forEach(function (input) {
          input.removeAttribute('data-dropped');
          const row = input.closest('.bm-template-create-extra-row');
          if (row) row.classList.remove('is-dropped');
        });

        const input = Array.from(document.querySelectorAll('[data-template-create-extra="' + type + '"]')).find(function (candidate) {
          return candidate.getAttribute('data-image-src') === src;
        });

        if (input) {
          input.setAttribute('data-dropped', 'true');
          const row = input.closest('.bm-template-create-extra-row');
          if (row) row.classList.add('is-dropped');
        }

        syncTemplateCreatePreview();
      });
    }

    bindCreateImageDropZone('dkTemplateCreatePreviewHeader', 'header');
    bindCreateImageDropZone('dkTemplateCreatePreviewFooter', 'footer');

    resetTemplateCreateModal();

    const uploadTitleInput = document.getElementById('dkTemplateUploadTitle');
    const uploadFileInput = document.getElementById('dkTemplateUploadFile');
    const uploadNextBtn = document.getElementById('dkTemplateUploadNextBtn');
    const uploadSaveBtn = document.getElementById('dkTemplateUploadSaveBtn');
    const uploadStep1Btn = document.getElementById('dkTemplateUploadStepIndicator1');
    const uploadStep2Btn = document.getElementById('dkTemplateUploadStepIndicator2');
    const uploadDownloadExample = document.getElementById('dkTemplateDownloadExample');
    const uploadPreviewName = document.getElementById('dkTemplateUploadPreviewName');
    const uploadFileNameHint = document.getElementById('dkTemplateUploadFileName');

    if (uploadTitleInput) {
      uploadTitleInput.addEventListener('input', function () {
        const title = String(uploadTitleInput.value || '').trim();
        if (uploadPreviewName) {
          uploadPreviewName.textContent = 'Contoh_Template.docx';
        }
      });
    }

    if (uploadFileInput) {
      uploadFileInput.addEventListener('change', function () {
        const fileName = uploadFileInput.files && uploadFileInput.files[0] ? uploadFileInput.files[0].name : '';
        if (uploadFileNameHint) {
          uploadFileNameHint.textContent = fileName || 'Belum ada file dipilih.';
        }
      });
    }

    if (uploadNextBtn) {
      uploadNextBtn.addEventListener('click', function () {
        const title = uploadTitleInput ? String(uploadTitleInput.value || '').trim() : '';
        if (!title) {
          showFolderFeedback('Silakan isi judul template terlebih dahulu.', 'danger');
          return;
        }
        if (uploadPreviewName) {
          uploadPreviewName.textContent = 'Contoh_Template.docx';
        }
        setTemplateUploadStep(2);
      });
    }

    if (uploadStep1Btn) {
      uploadStep1Btn.addEventListener('click', function () {
        setTemplateUploadStep(1);
      });
    }

    if (uploadStep2Btn) {
      uploadStep2Btn.addEventListener('click', function () {
        const title = uploadTitleInput ? String(uploadTitleInput.value || '').trim() : '';
        if (!title) {
          showFolderFeedback('Silakan isi judul template terlebih dahulu.', 'danger');
          return;
        }
        setTemplateUploadStep(2);
      });
    }

    if (uploadDownloadExample) {
      uploadDownloadExample.addEventListener('click', function () {
        const exampleText = [
          'CONTOH TEMPLATE DOKUMEN',
          '',
          'Nama Karyawan: {{nama_karyawan}}',
          'Jabatan: {{jabatan}}',
          'Divisi: {{divisi}}',
          'Nomor Dokumen: {{nomor_dokumen}}',
          '',
          'Isi dokumen dapat disesuaikan dengan kebutuhan perusahaan.'
        ].join('\n');
        const blob = new Blob([exampleText], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        const url = URL.createObjectURL(blob);
        uploadDownloadExample.href = url;
        window.setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
      });
    }

    if (uploadSaveBtn) {
      uploadSaveBtn.addEventListener('click', function () {
        saveUploadedTemplateDemo();
      });
    }

    document.addEventListener('click', function (event) {
      const templateActionButton = event.target.closest('[data-template-action]');
      if (templateActionButton) {
        const action = templateActionButton.getAttribute('data-template-action');
        if (action === 'create') {
          openTemplateCreateModal();
          return;
        }
        if (action === 'upload') {
          openTemplateUploadModal();
          return;
        }
        if (action === 'close') {
          const templateModal = getModal('dkTemplateModal');
          if (templateModal) templateModal.hide();
          return;
        }
      }

      const renameConfirm = event.target.closest('[data-template-rename-confirm]');
      if (renameConfirm) {
        event.preventDefault();
        event.stopPropagation();
        const target = bmTemplateDeleteTarget;
        const oldName = target ? (target.getAttribute('data-template-name') || 'Template') : 'Template';
        closeTemplateDeleteMenu();

        if (typeof window.bmOpenRenameDialog === 'function') {
          window.bmOpenRenameDialog({
            value: oldName,
            onConfirm: function (nextName) {
              renameTemplateName(oldName, nextName, true);
            }
          });
          return;
        }

        const nextName = window.prompt('Masukkan nama template baru:', oldName);
        if (nextName && nextName.trim()) {
          renameTemplateName(oldName, nextName.trim(), true);
        }
        return;
      }

      const editConfirm = event.target.closest('[data-template-edit-confirm]');
      if (editConfirm) {
        event.preventDefault();
        event.stopPropagation();
        const target = bmTemplateDeleteTarget;
        const templateName = target ? (target.getAttribute('data-template-name') || 'Template') : 'Template';
        closeTemplateDeleteMenu();
        openTemplateEditModal(templateName);
        return;
      }

      const deleteConfirm = event.target.closest('[data-template-delete-confirm]');
      if (deleteConfirm) {
        event.preventDefault();
        event.stopPropagation();
        const target = bmTemplateDeleteTarget;
        closeTemplateDeleteMenu();
        deleteTemplateCard(target);
        return;
      }

      const templateDots = event.target.closest('[data-template-dots]');
      if (templateDots) {
        event.preventDefault();
        event.stopPropagation();
        openTemplateDeleteMenu(templateDots);
        return;
      }

      const templateCard = event.target.closest('[data-template-card]');
      if (templateCard) {
        event.preventDefault();
        closeTemplateDeleteMenu();
        const templateName = templateCard.getAttribute('data-template-name') || 'Kontrak Kerja';
        openTemplateDetailModal(templateName);
        return;
      }

      const saveButton = event.target.closest('#dkTemplateDetailSave');
      if (saveButton) {
        event.preventDefault();
        const modal = getModal('dkTemplateDetailModal');
        const nameInput = document.getElementById('dkTemplateDetailNameInput');
        const previewPaper = document.getElementById('dkTemplatePreviewPaper');
        const itemName = String((nameInput && nameInput.value) || bmActiveTemplateName || 'Dokumen Template').trim() || 'Dokumen Template';
        const previewHtml = previewPaper && previewPaper.innerHTML ? previewPaper.innerHTML : buildTemplatePreviewHtml(bmActiveTemplateName || itemName);
        const targetParentId = typeof window.bmGetCurrentDriveParentId === 'function'
          ? window.bmGetCurrentDriveParentId()
          : '';
        addDriveItemRow(itemName, {
          itemType: 'google-doc',
          parentId: targetParentId,
          templateName: bmActiveTemplateName || itemName,
          documentPreviewHtml: previewHtml
        });
        if (typeof window.bmRefreshDriveFolderVisibility === 'function') {
          window.bmRefreshDriveFolderVisibility();
        }
        if (modal) modal.hide();
        showFolderFeedback(targetParentId ? 'Dokumen berhasil ditambahkan di folder yang sedang dibuka.' : 'Dokumen berhasil ditambahkan ke My Folder dan bisa dibuka sebagai popup.', 'success');
      }
    });
  }


  document.addEventListener('click', function (event) {
    if (!event.target.closest('[data-template-dots]') && !event.target.closest('#bmTemplateDeleteMenu')) {
      closeTemplateDeleteMenu();
    }
  });

  window.addEventListener('resize', closeTemplateDeleteMenu);
  window.addEventListener('scroll', closeTemplateDeleteMenu, true);

  function bindFolderActionDropdownLayer() {
    const page = document.querySelector('.bm-folder-card-page');
    if (!page || window.__bmFolderActionDropdownLayerBound) return;
    window.__bmFolderActionDropdownLayerBound = true;

    function isFolderActionDropdown(dropdown) {
      return dropdown && !!dropdown.querySelector('[data-folder-action]');
    }

    function positionFloatingMenu(dropdown, menu) {
      const button = dropdown ? dropdown.querySelector('[data-bs-toggle="dropdown"]') : null;
      if (!button || !menu) return;

      const rect = button.getBoundingClientRect();
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      menu.style.position = 'fixed';
      menu.style.zIndex = '7000';
      menu.style.margin = '0';
      menu.style.transform = 'none';
      menu.style.inset = 'auto';
      menu.style.display = 'block';

      const menuWidth = menu.offsetWidth || 220;
      const menuHeight = menu.offsetHeight || 300;
      let left = rect.right - menuWidth;
      let top = rect.bottom + 6;

      if (left < 12) left = 12;
      if (left + menuWidth > viewportWidth - 12) left = Math.max(12, viewportWidth - menuWidth - 12);

      if (top + menuHeight > viewportHeight - 12) {
        const topAbove = rect.top - menuHeight - 6;
        top = (topAbove >= 12) ? topAbove : (rect.top + (rect.height / 2) - (menuHeight / 2));
      }
      top = Math.max(12, Math.min(top, viewportHeight - menuHeight - 12));

      menu.style.left = left + 'px';
      menu.style.top = top + 'px';
    }

    document.addEventListener('shown.bs.dropdown', function (event) {
      const dropdown = event.target && event.target.closest ? event.target.closest('.dropdown') : null;
      if (!dropdown || !page.contains(dropdown) || !isFolderActionDropdown(dropdown)) return;

      const menu = dropdown.querySelector('.dropdown-menu');
      if (!menu) return;

      const placeholder = document.createComment('bm-folder-action-dropdown-placeholder');
      const originalParent = menu.parentElement;
      const nextSibling = menu.nextSibling;
      originalParent.insertBefore(placeholder, menu);

      dropdown.__bmFolderFloatingMenu = menu;
      dropdown.__bmFolderFloatingState = {
        originalParent: originalParent,
        nextSibling: nextSibling,
        placeholder: placeholder
      };

      document.body.appendChild(menu);
      menu.classList.add('bm-folder-floating-action-menu', 'show');

      const reposition = function () { positionFloatingMenu(dropdown, menu); };
      dropdown.__bmFolderFloatingReposition = reposition;
      reposition();
      window.addEventListener('resize', reposition);
      window.addEventListener('scroll', reposition, true);
    });

    document.addEventListener('hide.bs.dropdown', function (event) {
      const dropdown = event.target && event.target.closest ? event.target.closest('.dropdown') : null;
      const menu = dropdown ? dropdown.__bmFolderFloatingMenu : null;
      const reposition = dropdown ? dropdown.__bmFolderFloatingReposition : null;
      if (reposition) {
        window.removeEventListener('resize', reposition);
        window.removeEventListener('scroll', reposition, true);
      }
      if (menu) menu.classList.remove('show');
    });

    document.addEventListener('hidden.bs.dropdown', function (event) {
      const dropdown = event.target && event.target.closest ? event.target.closest('.dropdown') : null;
      if (!dropdown || !dropdown.__bmFolderFloatingMenu) return;

      const menu = dropdown.__bmFolderFloatingMenu;
      const state = dropdown.__bmFolderFloatingState || {};
      menu.classList.remove('bm-folder-floating-action-menu', 'show');
      menu.removeAttribute('style');

      if (state.placeholder && state.placeholder.parentNode) {
        state.placeholder.parentNode.insertBefore(menu, state.placeholder);
        state.placeholder.remove();
      } else if (state.originalParent) {
        state.originalParent.insertBefore(menu, state.nextSibling || null);
      }

      delete dropdown.__bmFolderFloatingMenu;
      delete dropdown.__bmFolderFloatingState;
      delete dropdown.__bmFolderFloatingReposition;
    });
  }

  function bindFolderPage() {
    ensureStaticGridActions();
    bindFolderActionDropdownLayer();
    bindTemplateModal();

    document.addEventListener('click', function (event) {
      const folderActionButton = event.target.closest('[data-folder-action]');
      if (folderActionButton) {
        handleFolderAction(folderActionButton.getAttribute('data-folder-action'), folderActionButton.getAttribute('data-folder-id'));
        return;
      }

      const actionButton = event.target.closest('[data-doc-action]');
      if (!actionButton) return;
      handleDocumentAction(actionButton.getAttribute('data-doc-action'));
    });

    const folderSearch = document.getElementById('folderSearch');
    if (folderSearch) {
      folderSearch.addEventListener('input', function () {
        activeFolderKeyword = folderSearch.value.trim().toLowerCase();
        refreshFolderFilter();
      });
    }

    const clearButton = document.querySelector('.bm-folder-clear');
    if (clearButton && folderSearch) {
      clearButton.addEventListener('click', function () {
        folderSearch.value = '';
        activeFolderKeyword = '';
        refreshFolderFilter();
        folderSearch.focus();
      });
    }

    document.querySelectorAll('[data-view]').forEach(function (button) {
      button.addEventListener('click', function () {
        const view = button.getAttribute('data-view');
        document.querySelectorAll('[data-view]').forEach(function (item) {
          item.classList.toggle('active', item === button);
        });

        const tableView = document.querySelector('.bm-folder-table-view');
        const gridView = document.querySelector('.bm-folder-grid-view');
        if (tableView) tableView.hidden = view !== 'list';
        if (gridView) gridView.hidden = view !== 'grid';
      });
    });

    document.querySelectorAll('.bm-folder-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        activeFolderTab = tab.getAttribute('data-tab') || 'my';
        document.querySelectorAll('.bm-folder-tab').forEach(function (item) {
          const active = item === tab;
          item.classList.toggle('active', active);
          item.setAttribute('aria-selected', String(active));
        });
        refreshFolderFilter();
      });
    });

    const saveFolderButton = document.getElementById('dkSaveFolderBtn');
    if (saveFolderButton) saveFolderButton.addEventListener('click', saveCreateFolderPopup);

    const folderNameInput = document.getElementById('dkFolderNameInput');
    if (folderNameInput) {
      folderNameInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') saveCreateFolderPopup();
      });
    }

    const saveFormButton = document.getElementById('dkSaveFormBtn');
    if (saveFormButton) saveFormButton.addEventListener('click', saveFormPopup);

    const formNameInput = document.getElementById('dkFormNameInput');
    if (formNameInput) {
      formNameInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') saveFormPopup();
      });
    }

    const saveLinkButton = document.getElementById('dkSaveLinkBtn');
    if (saveLinkButton) saveLinkButton.addEventListener('click', saveDocsSheetPopup);

    const linkInput = document.getElementById('dkDocumentLinkInput');
    if (linkInput) {
      linkInput.addEventListener('input', function () {
        updateDocsSheetValidation(false);
      });
      linkInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') saveDocsSheetPopup();
      });
    }

    const documentNameInput = document.getElementById('dkDocumentNameInput');
    if (documentNameInput) {
      documentNameInput.addEventListener('input', function () {
        if (linkInput && linkInput.value.trim()) updateDocsSheetValidation(false);
      });
      documentNameInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          if (linkInput) linkInput.focus();
        }
      });
    }

    const inputFile = document.getElementById('dkUploadFile');
    if (inputFile) {
      inputFile.addEventListener('change', function () {
        handleUploadedFiles(inputFile.files);
        inputFile.value = '';
      });
    }

    const inputFolder = document.getElementById('dkUploadFolder');
    if (inputFolder) {
      inputFolder.addEventListener('change', function () {
        handleUploadedFolders(inputFolder.files);
        inputFolder.value = '';
      });
    }

    refreshFolderFilter();
  }

  window.bmReorderDriveFavorites = function () {
    if (typeof reorderFavoriteContainers === 'function') reorderFavoriteContainers();
    if (typeof refreshFolderFilter === 'function') refreshFolderFilter();
    return true;
  };

  ready(function () {
    injectDocsMenu();
    bindFolderPage();
  });
})();

/* =========================================================
   Patch Folder: dropdown titik tiga aksi selalu muncul
   - Menu titik tiga dibuat floating ke body supaya tidak ketutup table/card
   - Isi menu dipastikan: Buka, Tambah ke Favorit, Berbagi, Details, Buat Salinan, Rename, Hapus
   - Icon titik tiga dan icon di dalam menu titik tiga tidak memakai kotak biru
   ========================================================= */
(function () {
  'use strict';

  if (window.__bmFolderActionMenuFinalPatch) return;
  window.__bmFolderActionMenuFinalPatch = true;

  var activeButton = null;
  var actionMenu = null;

  function hasFolderPage() {
    return !!document.querySelector('.bm-folder-card-page');
  }

  function isDotsButton(button) {
    return !!(
      button &&
      button.closest &&
      button.closest('.bm-folder-card-page') &&
      button.querySelector('.bx-dots-vertical-rounded')
    );
  }

  function getFolderId(button) {
    var row = button.closest('[data-folder-row]');
    if (row && row.getAttribute('data-folder-id')) return row.getAttribute('data-folder-id');

    var dropdown = button.closest('.dropdown');
    var action = dropdown ? dropdown.querySelector('[data-folder-action][data-folder-id]') : null;
    if (action) return action.getAttribute('data-folder-id');

    return '';
  }

  function buildActionMenu() {
    var menu = document.getElementById('bmFolderThreeDotsGlobalMenu');
    if (!menu) {
      menu = document.createElement('div');
      menu.id = 'bmFolderThreeDotsGlobalMenu';
      menu.className = 'dropdown-menu dropdown-menu-end bm-folder-three-dots-menu-show bm-folder-floating-action-menu';
      menu.setAttribute('role', 'menu');
      document.body.appendChild(menu);
    }

    menu.innerHTML = [
      '<button class="dropdown-item" type="button" data-folder-action="open"><span class="bm-menu-iconify"><iconify-icon icon="solar:folder-open-bold"></iconify-icon></span>Buka</button>',
      '<button class="dropdown-item" type="button" data-folder-action="favorite"><span class="bm-menu-iconify"><iconify-icon icon="material-symbols:star-rounded"></iconify-icon></span>Tambahkan ke favorites</button>',
      '<button class="dropdown-item" type="button" data-folder-action="share"><span class="bm-menu-iconify"><iconify-icon icon="solar:share-bold"></iconify-icon></span>Berbagi</button>',
      '<button class="dropdown-item" type="button" data-folder-action="details"><span class="bm-menu-iconify"><iconify-icon icon="material-symbols:list-alt-rounded"></iconify-icon></span>Details</button>',
      '<button class="dropdown-item" type="button" data-folder-action="copy"><span class="bm-menu-iconify"><iconify-icon icon="material-symbols:content-copy-rounded"></iconify-icon></span>Buat salinan</button>',
      '<button class="dropdown-item" type="button" data-folder-action="rename"><span class="bm-menu-iconify"><iconify-icon icon="material-symbols:edit-square-outline-rounded"></iconify-icon></span>Rename</button>',
      '<div class="dropdown-divider"></div>',
      '<button class="dropdown-item text-danger" type="button" data-folder-action="delete"><span class="bm-menu-iconify"><iconify-icon icon="material-symbols:delete-rounded"></iconify-icon></span>Hapus</button>'
    ].join('');

    return menu;
  }

  function applyFolderId(menu, folderId) {
    menu.querySelectorAll('[data-folder-action]').forEach(function (item) {
      item.setAttribute('data-folder-id', folderId || '');
    });
  }

  function closeActionMenu() {
    if (actionMenu) {
      actionMenu.classList.remove('show');
      actionMenu.style.display = 'none';
      actionMenu.style.visibility = 'hidden';
      actionMenu.style.opacity = '0';
    }

    if (activeButton) {
      activeButton.classList.remove('show');
      activeButton.setAttribute('aria-expanded', 'false');
      var dropdown = activeButton.closest('.dropdown');
      if (dropdown) dropdown.classList.remove('show');
    }

    activeButton = null;
  }

  function positionActionMenu(button, menu) {
    menu.style.position = 'fixed';
    menu.style.display = 'block';
    menu.style.visibility = 'visible';
    menu.style.opacity = '1';
    menu.style.zIndex = '99999';
    menu.style.margin = '0';
    menu.style.transform = 'none';
    menu.style.inset = 'auto';
    menu.style.minWidth = '13.75rem';

    // Force layout reflow to ensure offsetHeight is calculated
    void menu.offsetHeight;

    var rect = button.getBoundingClientRect();
    var vw = window.innerWidth || document.documentElement.clientWidth;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var width = menu.offsetWidth || 224;
    var height = menu.offsetHeight || 380;

    var left = rect.right - width;
    var top = rect.bottom + 8;

    if (top + height > vh - 12) {
      top = rect.top - height - 8;
    }

    if (left < 12) left = 12;
    if (left + width > vw - 12) left = Math.max(12, vw - width - 12);
    if (top < 12) top = 12;

    menu.style.left = left + 'px';
    menu.style.top = top + 'px';
  }

  function openActionMenu(button) {
    var sameButton = activeButton === button && actionMenu && actionMenu.classList.contains('show');
    closeActionMenu();
    if (sameButton) return;

    var folderId = getFolderId(button);
    var menu = buildActionMenu();
    applyFolderId(menu, folderId);

    activeButton = button;
    actionMenu = menu;

    var dropdown = button.closest('.dropdown');
    if (dropdown) dropdown.classList.add('show');
    button.classList.add('show');
    button.setAttribute('aria-expanded', 'true');

    menu.classList.add('show', 'bm-folder-three-dots-menu-show', 'bm-folder-floating-action-menu');
    positionActionMenu(button, menu);
  }

  function bindActionMenuPatch() {
    if (!hasFolderPage() || window.__bmFolderActionMenuFinalPatchBound) return;
    window.__bmFolderActionMenuFinalPatchBound = true;

    document.addEventListener('click', function (event) {
      var button = event.target && event.target.closest ? event.target.closest('.bm-folder-card-page [data-bs-toggle="dropdown"]') : null;
      if (!button || !isDotsButton(button)) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openActionMenu(button);
    }, true);

    document.addEventListener('click', function (event) {
      if (!actionMenu || !actionMenu.classList.contains('show')) return;

      var actionItem = event.target && event.target.closest ? event.target.closest('#bmFolderThreeDotsGlobalMenu [data-folder-action]') : null;
      if (actionItem) {
        window.setTimeout(closeActionMenu, 120);
        return;
      }

      var clickedInsideMenu = event.target && event.target.closest ? event.target.closest('#bmFolderThreeDotsGlobalMenu') : null;
      var clickedDotsButton = event.target && event.target.closest ? event.target.closest('.bm-folder-card-page [data-bs-toggle="dropdown"]') : null;
      if (!clickedInsideMenu && !clickedDotsButton) closeActionMenu();
    });

    window.addEventListener('resize', closeActionMenu);
    window.addEventListener('scroll', closeActionMenu, true);
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeActionMenu();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindActionMenuPatch);
  } else {
    bindActionMenuPatch();
  }
})();


/* =========================================================
   Patch Dokumen & Kolaborasi: buka folder/file seperti Drive
   - Klik folder membuka isi folder di halaman yang sama
   - Klik file/link membuka file langsung
   - Breadcrumb tetap di halaman Folder, tanpa pindah halaman baru
   ========================================================= */
(function () {
  'use strict';

  if (window.__bmFolderOpenInPlacePatch) return;
  window.__bmFolderOpenInPlacePatch = true;

  var currentParentId = '';
  var observer = null;

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function hasFolderPage() {
    return !!document.querySelector('.bm-folder-card-page');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value);
    return String(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  function today() {
    var now = new Date();
    return String(now.getDate()).padStart(2, '0') + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();
  }

  function makeId(name) {
    var base = String(name || 'item')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'item';
    return base + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function getRowsById(itemId) {
    if (!itemId) return [];
    return Array.prototype.slice.call(document.querySelectorAll('[data-folder-row][data-folder-id="' + cssEscape(itemId) + '"]'));
  }

  function getFirstRow(itemId) {
    return getRowsById(itemId)[0] || null;
  }

  function getItemName(itemId) {
    var row = getFirstRow(itemId);
    if (!row) return 'Folder';
    var title = row.querySelector('.bm-folder-title-text');
    return (row.getAttribute('data-name') || (title ? title.textContent : '') || 'Folder').replace(/\s+/g, ' ').trim();
  }

  function getItemType(row) {
    if (!row) return 'folder';
    var type = row.getAttribute('data-item-type') || '';
    if (type) return type;
    var iconNode = row.querySelector('.bm-folder-icon iconify-icon, .bm-folder-icon-lg iconify-icon, .bm-folder-icon i, .bm-folder-icon-lg i');
    if (iconNode) {
      var iconName = iconNode.getAttribute ? (iconNode.getAttribute('icon') || '') : '';
      var className = iconNode.className || '';
      var combined = String(iconName || className).toLowerCase();
      if (combined.indexOf('folder') >= 0) return 'folder';
    }
    return 'file';
  }

  function showFeedback(message, type) {
    if (typeof window.ceoToast === 'function') {
      window.ceoToast(message, type || 'info');
    } else if (message) {
      window.alert(message);
    }
  }

  function normalizeExistingItems(parentIdForNewItems) {
    var parent = typeof parentIdForNewItems === 'string' ? parentIdForNewItems : currentParentId;
    document.querySelectorAll('[data-folder-row]').forEach(function (row) {
      if (!row.hasAttribute('data-parent-id')) row.setAttribute('data-parent-id', parent || '');
      if (!row.getAttribute('data-item-type')) row.setAttribute('data-item-type', 'folder');
      row.classList.add('bm-drive-openable-item');
    });
  }

  function buildActionMenu(itemId) {
    var safeId = escapeHtml(itemId);
    return [
      '<div class="dropdown">',
      '  <button class="btn btn-sm btn-icon btn-text-secondary rounded-pill dropdown-toggle hide-arrow" data-bs-toggle="dropdown" data-folder-dots="true" type="button" aria-expanded="false" aria-label="Aksi folder">',
      '    <iconify-icon icon="mdi:dots-vertical"></iconify-icon>',
      '  </button>',
      '  <ul class="dropdown-menu dropdown-menu-end">',
      '    <li><button class="dropdown-item" type="button" data-folder-action="open" data-folder-id="' + safeId + '"><span class="bm-menu-iconify"><iconify-icon icon="solar:folder-open-bold"></iconify-icon></span>Buka</button></li>',
      '    <li><button class="dropdown-item" type="button" data-folder-action="favorite" data-folder-id="' + safeId + '"><span class="bm-menu-iconify"><iconify-icon icon="material-symbols:star-rounded"></iconify-icon></span>Tambahkan ke favorites</button></li>',
      '    <li><button class="dropdown-item" type="button" data-folder-action="share" data-folder-id="' + safeId + '"><span class="bm-menu-iconify"><iconify-icon icon="solar:share-bold"></iconify-icon></span>Berbagi</button></li>',
      '    <li><button class="dropdown-item" type="button" data-folder-action="details" data-folder-id="' + safeId + '"><span class="bm-menu-iconify"><iconify-icon icon="material-symbols:list-alt-rounded"></iconify-icon></span>Details</button></li>',
      '    <li><button class="dropdown-item" type="button" data-folder-action="copy" data-folder-id="' + safeId + '"><span class="bm-menu-iconify"><iconify-icon icon="material-symbols:content-copy-rounded"></iconify-icon></span>Buat salinan</button></li>',
      '    <li><button class="dropdown-item" type="button" data-folder-action="rename" data-folder-id="' + safeId + '"><span class="bm-menu-iconify"><iconify-icon icon="material-symbols:edit-square-outline-rounded"></iconify-icon></span>Rename</button></li>',
      '    <li><hr class="dropdown-divider" /></li>',
      '    <li><button class="dropdown-item text-danger" type="button" data-folder-action="delete" data-folder-id="' + safeId + '"><span class="bm-menu-iconify"><iconify-icon icon="material-symbols:delete-rounded"></iconify-icon></span>Hapus</button></li>',
      '  </ul>',
      '</div>'
    ].join('');
  }

  function getMeta(itemType, link) {
    var type = itemType || 'folder';
    var source = String(link || '').toLowerCase();

    if (type === 'folder' || source === 'folder') {
      return { icon: 'solar:folder-open-bold', sub: 'Folder pribadi', grid: 'Tipe: Folder' };
    }

    if (type === 'google-forms' || type === 'google-form' || /\/forms\//i.test(link || '') || source === 'form' || source === 'forms') {
      return { icon: 'mdi:form-select', sub: 'Google Forms', grid: 'Tipe: Google Form' };
    }

    if (type === 'google-sheet' || source === 'sheet' || source === 'spreadsheet' || /\/spreadsheets\//i.test(link || '') || /\.(xls|xlsx|csv)(?:$|[\s?#])/.test(source)) {
      return { icon: 'mdi:file-table-outline', sub: 'Spreadsheet', grid: 'Tipe: Spreadsheet' };
    }

    if (source === 'word' || source === 'docx' || /\.(doc|docx)(?:$|[\s?#])/.test(source)) {
      return { icon: 'mdi:microsoft-word', sub: 'File Word', grid: 'Tipe: Word' };
    }

    if (type === 'google-doc' || source === 'doc' || source === 'docs' || /\/document\//i.test(link || '')) {
      return { icon: 'solar:document-bold', sub: 'Google Docs', grid: 'Tipe: Google Docs' };
    }

    if (source === 'pdf' || /\.pdf(?:$|[\s?#])/.test(source)) {
      return { icon: 'mdi:file-pdf-box', sub: 'File PDF', grid: 'Tipe: PDF' };
    }

    if (source === 'image' || /\.(png|jpe?g|webp|gif|svg)(?:$|[\s?#])/.test(source)) {
      return { icon: 'solar:gallery-bold', sub: 'File Gambar', grid: 'Tipe: Gambar' };
    }

    if (type === 'google-link') {
      return { icon: 'fa6-brands:google-drive', sub: 'Google Docs / Sheet', grid: 'Tipe: Link Dokumen' };
    }

    if (type === 'file') {
      return { icon: 'solar:upload-square-bold', sub: 'File diupload', grid: 'Tipe: File' };
    }

    return { icon: 'solar:folder-open-bold', sub: 'Folder pribadi', grid: 'Tipe: Folder' };
  }

  function addDriveItem(name, options) {
    var opts = options || {};
    var itemType = opts.itemType || 'folder';
    var link = opts.link || '';
    var objectUrl = opts.objectUrl || '';
    var itemId = makeId(name);
    var date = today();
    var safeName = escapeHtml(name);
    var safeLink = escapeHtml(link || objectUrl);
    var parentId = Object.prototype.hasOwnProperty.call(opts, 'parentId') ? String(opts.parentId || '') : (currentParentId || '');
    var documentPreviewHtml = opts.documentPreviewHtml || '';
    var templateName = opts.templateName || name;
    var fileKind = String(opts.fileKind || '').toLowerCase();
    if (documentPreviewHtml) {
      window.bmDriveDocumentPreviews = window.bmDriveDocumentPreviews || {};
      window.bmDriveDocumentPreviews[itemId] = {
        title: name,
        templateName: templateName,
        html: documentPreviewHtml
      };
    }
    var meta = getMeta(itemType, fileKind || name || link || objectUrl);
    var actionMenu = buildActionMenu(itemId);
    var tableBody = document.getElementById('folderTableBody');
    var gridRow = document.querySelector('#folderGridView .row');

    if (tableBody) {
      var tr = document.createElement('tr');
      tr.setAttribute('data-folder-row', '');
      tr.setAttribute('data-folder-id', itemId);
      tr.setAttribute('data-parent-id', parentId);
      tr.setAttribute('data-name', name);
      tr.setAttribute('data-folder-type', 'my');
      tr.setAttribute('data-item-type', itemType);
      if (fileKind) tr.setAttribute('data-file-kind', fileKind);
      if (link) tr.setAttribute('data-link', link);
      if (objectUrl) tr.setAttribute('data-object-url', objectUrl);
      if (documentPreviewHtml) {
        tr.setAttribute('data-document-popup', 'true');
        tr.setAttribute('data-template-name', templateName);
      }
      tr.classList.add('bm-drive-openable-item');
      tr.innerHTML = [
        '<td>',
        '  <div class="d-flex align-items-center gap-3">',
        '    <span class="bm-folder-icon"><iconify-icon icon="' + meta.icon + '"></iconify-icon></span>',
        '    <div><div class="fw-semibold bm-folder-title"><span class="bm-folder-title-text">' + safeName + '</span></div><small class="text-muted">' + meta.sub + '</small></div>',
        '  </div>',
        '</td>',
        '<td>Setiawan</td>',
        '<td>' + date + '</td>',
        '<td class="text-center">' + actionMenu + '</td>'
      ].join('');
      tableBody.prepend(tr);
    }

    if (gridRow) {
      var col = document.createElement('div');
      col.className = 'col-sm-6 col-lg-4 col-xl-3 bm-drive-openable-item';
      col.setAttribute('data-folder-row', '');
      col.setAttribute('data-folder-id', itemId);
      col.setAttribute('data-parent-id', parentId);
      col.setAttribute('data-name', name);
      col.setAttribute('data-folder-type', 'my');
      col.setAttribute('data-item-type', itemType);
      if (fileKind) col.setAttribute('data-file-kind', fileKind);
      if (link) col.setAttribute('data-link', link);
      if (objectUrl) col.setAttribute('data-object-url', objectUrl);
      if (documentPreviewHtml) {
        col.setAttribute('data-document-popup', 'true');
        col.setAttribute('data-template-name', templateName);
      }
      col.innerHTML = [
        '<div class="card border shadow-none h-100 bm-folder-grid-card position-relative">',
        '  <div class="position-absolute top-0 end-0 m-2">' + actionMenu + '</div>',
        '  <div class="card-body d-flex flex-column gap-2">',
        '    <span class="bm-folder-icon bm-folder-icon-lg"><iconify-icon icon="' + meta.icon + '"></iconify-icon></span>',
        '    <div class="fw-semibold bm-folder-title"><span class="bm-folder-title-text">' + safeName + '</span></div>',
        '    <div class="text-muted bm-folder-date">' + date + '</div>',
        link || objectUrl ? '    <small class="text-muted text-truncate" title="' + safeLink + '">Link: tersedia</small>' : '    <small class="text-muted">' + meta.grid + '</small>',
        '  </div>',
        '</div>'
      ].join('');
      gridRow.prepend(col);
    }

    if (typeof window.bmReorderDriveFavorites === 'function') {
      window.bmReorderDriveFavorites();
    }
    applyFolderVisibility();
    return itemId;
  }

  function ensureNavigationUi() {
    if (document.getElementById('bmDrivePathbar')) return;

    var tools = document.querySelector('.bm-folder-card-page .bm-table-tools');
    if (!tools) return;

    var pathbar = document.createElement('div');
    pathbar.className = 'card-body bm-folder-pathbar py-2';
    pathbar.id = 'bmDrivePathbar';
    pathbar.innerHTML = [
      '<div class="d-flex flex-wrap gap-2 align-items-center justify-content-between">',
      '  <nav class="bm-folder-breadcrumb" aria-label="Breadcrumb folder" id="bmFolderBreadcrumb"></nav>',
      '  <button class="btn btn-sm btn-outline-secondary" type="button" id="bmFolderBackBtn" hidden><i class="bx bx-arrow-back me-1"></i>Kembali</button>',
      '</div>'
    ].join('');
    tools.insertAdjacentElement('afterend', pathbar);

    var card = document.querySelector('.bm-folder-card-page');
    if (card && !document.getElementById('bmFolderEmptyState')) {
      var empty = document.createElement('div');
      empty.className = 'card-body bm-folder-empty-state text-center';
      empty.id = 'bmFolderEmptyState';
      empty.hidden = true;
      empty.innerHTML = [
        '<div class="py-4">',
        '  <span class="bm-folder-empty-icon"><iconify-icon icon="solar:folder-open-bold"></iconify-icon></span>',
        '  <div class="fw-semibold mt-2">Folder ini masih kosong</div>',
        '  <small class="text-muted">Tambahkan file, link Docs/Sheet, atau buat folder baru di lokasi ini.</small>',
        '</div>'
      ].join('');
      card.appendChild(empty);
    }
  }

  function getBreadcrumbPath(folderId) {
    var path = [];
    var current = folderId || '';
    var guard = 0;

    while (current && guard < 30) {
      var row = getFirstRow(current);
      if (!row) break;
      path.unshift({ id: current, name: getItemName(current) });
      current = row.getAttribute('data-parent-id') || '';
      guard += 1;
    }

    return path;
  }

  function updatePathbar() {
    ensureNavigationUi();

    var breadcrumb = document.getElementById('bmFolderBreadcrumb');
    var backBtn = document.getElementById('bmFolderBackBtn');
    if (!breadcrumb) return;

    var path = getBreadcrumbPath(currentParentId);
    var html = [
      '<button class="btn btn-sm btn-link px-0 bm-folder-breadcrumb-link" type="button" data-folder-breadcrumb-id=""><i class="bx bx-home-alt me-1"></i>My Folders</button>'
    ];

    path.forEach(function (item) {
      html.push('<span class="bm-folder-breadcrumb-separator">/</span>');
      html.push('<button class="btn btn-sm btn-link px-0 bm-folder-breadcrumb-link" type="button" data-folder-breadcrumb-id="' + escapeHtml(item.id) + '">' + escapeHtml(item.name) + '</button>');
    });

    breadcrumb.innerHTML = html.join('');

    if (backBtn) {
      backBtn.hidden = !currentParentId;
      backBtn.setAttribute('data-folder-back-parent', getParentOf(currentParentId));
    }
  }

  function getParentOf(itemId) {
    var row = getFirstRow(itemId);
    return row ? (row.getAttribute('data-parent-id') || '') : '';
  }

  function getActiveTab() {
    var active = document.querySelector('.bm-folder-tab.active');
    return active ? (active.getAttribute('data-tab') || 'my') : 'my';
  }

  function getKeyword() {
    var search = document.getElementById('folderSearch');
    return search ? search.value.trim().toLowerCase() : '';
  }

  function rowMatchesCurrentFolder(row) {
    var parentId = row.getAttribute('data-parent-id') || '';
    var tab = getActiveTab();
    var folderType = row.getAttribute('data-folder-type') || 'my';
    var keyword = getKeyword();
    var name = (row.getAttribute('data-name') || row.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
    var matchParent = parentId === (currentParentId || '');
    var matchTab = tab === 'shared' ? folderType === 'shared' : folderType !== 'shared';
    var matchKeyword = keyword ? name.indexOf(keyword) >= 0 : true;
    return matchParent && matchTab && matchKeyword;
  }

  function applyFolderVisibility() {
    normalizeExistingItems(currentParentId || '');
    updatePathbar();

    var visibleTableCount = 0;
    document.querySelectorAll('[data-folder-row]').forEach(function (row) {
      var visible = rowMatchesCurrentFolder(row);
      row.hidden = !visible;
      if (visible && row.tagName && row.tagName.toLowerCase() === 'tr') visibleTableCount += 1;
    });

    var empty = document.getElementById('bmFolderEmptyState');
    if (empty) empty.hidden = visibleTableCount > 0;
  }

  function openFolder(itemId) {
    if (!itemId) return false;
    var row = getFirstRow(itemId);
    if (!row) return false;
    currentParentId = itemId;
    applyFolderVisibility();
    showFeedback('Folder dibuka: ' + getItemName(itemId), 'info');
    return true;
  }

  function openFile(itemId) {
    var row = getFirstRow(itemId);
    if (!row) return false;
    var name = getItemName(itemId);
    var link = row.getAttribute('data-link') || row.getAttribute('data-object-url') || '';

    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
      return true;
    }

    showFeedback('File dibuka: ' + name, 'info');
    return true;
  }

  function openItemById(itemId) {
    var row = getFirstRow(itemId);
    if (!row) return false;
    var type = getItemType(row);
    if (type === 'folder') return openFolder(itemId);
    if (row.getAttribute('data-document-popup') === 'true' && typeof window.bmOpenDriveDocumentPopup === 'function') {
      return window.bmOpenDriveDocumentPopup(itemId);
    }
    return openFile(itemId);
  }

  function openParent(parentId) {
    currentParentId = parentId || '';
    applyFolderVisibility();
    return true;
  }

  function isNonOpeningTarget(target) {
    return !!(target && target.closest && target.closest([
      'button',
      'a',
      'input',
      'textarea',
      'select',
      '.dropdown',
      '.dropdown-menu',
      '[data-folder-action]',
      '[data-aksi-folder]',
      '[data-doc-action]',
      '.bm-folder-action-tile',
      '.nav-link',
      '.btn-group'
    ].join(',')));
  }

  function bindOpenEvents() {
    document.addEventListener('click', function (event) {
      if (!hasFolderPage()) return;

      var breadcrumbButton = event.target.closest('[data-folder-breadcrumb-id]');
      if (breadcrumbButton) {
        event.preventDefault();
        event.stopPropagation();
        if (event.stopImmediatePropagation) event.stopImmediatePropagation();
        openParent(breadcrumbButton.getAttribute('data-folder-breadcrumb-id') || '');
        return;
      }

      var backBtn = event.target.closest('#bmFolderBackBtn');
      if (backBtn) {
        event.preventDefault();
        event.stopPropagation();
        if (event.stopImmediatePropagation) event.stopImmediatePropagation();
        openParent(backBtn.getAttribute('data-folder-back-parent') || '');
        return;
      }

      var openAction = event.target.closest('[data-folder-action="open"], [data-aksi-folder="open"]');
      if (openAction) {
        var actionId = openAction.getAttribute('data-folder-id') || '';
        if (actionId && openItemById(actionId)) {
          event.preventDefault();
          event.stopPropagation();
          if (event.stopImmediatePropagation) event.stopImmediatePropagation();
        }
        return;
      }

      if (isNonOpeningTarget(event.target)) return;

      var item = event.target.closest('.bm-folder-card-page [data-folder-row]');
      if (!item) return;
      var itemId = item.getAttribute('data-folder-id') || '';
      if (!itemId) return;

      event.preventDefault();
      event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
      openItemById(itemId);
    }, true);

    var folderSearch = document.getElementById('folderSearch');
    if (folderSearch) folderSearch.addEventListener('input', function () { window.setTimeout(applyFolderVisibility, 0); });

    document.querySelectorAll('.bm-folder-tab, [data-view]').forEach(function (el) {
      el.addEventListener('click', function () { window.setTimeout(applyFolderVisibility, 0); });
    });
  }


  function getUploadedFileType(file) {
    var name = String(file && file.name ? file.name : '').toLowerCase();
    var type = String(file && file.type ? file.type : '').toLowerCase();

    if (type.indexOf('pdf') >= 0 || /\.pdf$/i.test(name)) return 'pdf';
    if (/\.docx?$/i.test(name) || type.indexOf('word') >= 0 || type.indexOf('officedocument.wordprocessingml') >= 0) return 'word';
    if (/\.(xls|xlsx|csv)$/i.test(name) || type.indexOf('spreadsheet') >= 0 || type.indexOf('csv') >= 0) return 'sheet';
    if (/\.(png|jpe?g|gif|webp|svg)$/i.test(name) || type.indexOf('image/') === 0) return 'image';
    return 'file';
  }

  function formatFileSize(bytes) {
    var size = Number(bytes || 0);
    if (!size) return '-';
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return Math.round(size / 1024) + ' KB';
    return (size / (1024 * 1024)).toFixed(size >= 10 * 1024 * 1024 ? 0 : 1) + ' MB';
  }

  function createUploadedFilePreviewHtml(file, objectUrl) {
    var name = escapeHtml(file && file.name ? file.name : 'File');
    var size = escapeHtml(formatFileSize(file && file.size ? file.size : 0));
    var type = getUploadedFileType(file);
    var src = escapeHtml(objectUrl || '');
    var todayText = today();

    if (type === 'pdf') {
      return [
        '<div class="bm-upload-file-popup bm-upload-file-popup--pdf">',
        '<div class="bm-upload-file-popup-head">',
        '<div>',
        '<h5>' + name + '</h5>',
        '<small>PDF Preview • ' + size + ' • ' + escapeHtml(todayText) + '</small>',
        '</div>',
        '</div>',
        '<iframe class="bm-upload-file-frame" src="' + src + '" title="' + name + '"></iframe>',
        '</div>'
      ].join('');
    }

    if (type === 'image') {
      return [
        '<div class="bm-upload-file-popup bm-upload-file-popup--image">',
        '<div class="bm-upload-file-popup-head">',
        '<div>',
        '<h5>' + name + '</h5>',
        '<small>Image Preview • ' + size + ' • ' + escapeHtml(todayText) + '</small>',
        '</div>',
        '</div>',
        '<div class="bm-upload-file-image-wrap"><img src="' + src + '" alt="' + name + '" /></div>',
        '</div>'
      ].join('');
    }

    var label = type === 'word' ? 'Dokumen Word' : (type === 'sheet' ? 'Spreadsheet' : 'File');
    var icon = type === 'sheet' ? 'mdi:file-table-outline' : (type === 'word' ? 'solar:document-bold' : 'solar:file-text-bold');

    return [
      '<div class="bm-upload-file-popup bm-upload-file-popup--document">',
      '<div class="bm-upload-file-popup-head">',
      '<div>',
      '<h5>' + name + '</h5>',
      '<small>' + escapeHtml(label) + ' • ' + size + ' • ' + escapeHtml(todayText) + '</small>',
      '</div>',
      '</div>',
      '<div class="bm-upload-file-placeholder">',
      '<iconify-icon icon="' + icon + '"></iconify-icon>',
      '<h6>' + name + '</h6>',
      '<p>File ini dibuka tetap di popup ini. Untuk format DOC/DOCX atau file Office, browser belum selalu bisa menampilkan isi asli secara langsung dari file lokal.</p>',
      '</div>',
      '</div>'
    ].join('');
  }


  function bindUploadInputs() {
    var inputFile = document.getElementById('dkUploadFile');
    if (inputFile) {
      inputFile.addEventListener('change', function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (event.stopImmediatePropagation) event.stopImmediatePropagation();

        var files = Array.prototype.slice.call(inputFile.files || []);
        files.forEach(function (file) {
          var objectUrl = URL.createObjectURL(file);
          addDriveItem(file.name || 'File Baru', {
            itemType: 'file',
            objectUrl: objectUrl,
            fileKind: getUploadedFileType(file),
            documentPreviewHtml: createUploadedFilePreviewHtml(file, objectUrl),
            templateName: file.name || 'File Baru'
          });
        });
        if (files.length) showFeedback(files.length + ' file berhasil ditambahkan dan bisa dibuka lewat popup.', 'success');
        inputFile.value = '';
      }, true);
    }

    var inputFolder = document.getElementById('dkUploadFolder');
    if (inputFolder) {
      inputFolder.addEventListener('change', function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (event.stopImmediatePropagation) event.stopImmediatePropagation();

        var files = Array.prototype.slice.call(inputFolder.files || []);
        if (!files.length) {
          showFeedback('Pilih folder terlebih dahulu.', 'warning');
          inputFolder.value = '';
          return;
        }

        function normalizePath(file) {
          return String((file && file.webkitRelativePath) || (file && file.name) || '')
            .replace(/\\/g, '/')
            .replace(/^\/+|\/+$/g, '');
        }

        var folderIds = {};
        var folderCount = 0;
        var fileCount = 0;
        var baseParentId = currentParentId || '';

        function ensureFolder(folderPath) {
          var parts = String(folderPath || '').split('/').filter(Boolean);
          var parentId = baseParentId;
          var currentPath = '';

          parts.forEach(function (part) {
            currentPath = currentPath ? currentPath + '/' + part : part;
            if (!folderIds[currentPath]) {
              folderIds[currentPath] = addDriveItem(part, {
                itemType: 'folder',
                parentId: parentId
              });
              folderCount += 1;
            }
            parentId = folderIds[currentPath];
          });

          return parentId;
        }

        files.forEach(function (file) {
          var path = normalizePath(file);
          if (!path) return;

          var parts = path.split('/').filter(Boolean);
          var fileName = parts.pop() || (file.name || 'File Baru');
          var parentPath = parts.join('/');
          var parentId = ensureFolder(parentPath);
          var objectUrl = URL.createObjectURL(file);

          addDriveItem(fileName, {
            itemType: 'file',
            objectUrl: objectUrl,
            parentId: parentId,
            fileKind: getUploadedFileType(file),
            documentPreviewHtml: createUploadedFilePreviewHtml(file, objectUrl),
            templateName: fileName
          });
          fileCount += 1;
        });

        applyFolderVisibility();

        if (folderCount || fileCount) {
          showFeedback(folderCount + ' folder dan ' + fileCount + ' file berhasil ditambahkan beserta isi foldernya.', 'success');
        } else {
          showFeedback('Browser belum mengirim isi folder. Coba pilih folder ulang.', 'warning');
        }

        inputFolder.value = '';
      }, true);
    }
  }

  function observeNewItems() {
    var card = document.querySelector('.bm-folder-card-page');
    if (!card || observer) return;

    observer = new MutationObserver(function (mutations) {
      var hasNewItem = false;
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (!node || node.nodeType !== 1) return;
          if (node.matches && node.matches('[data-folder-row]')) hasNewItem = true;
          if (node.querySelector && node.querySelector('[data-folder-row]')) hasNewItem = true;
        });
      });

      if (hasNewItem) {
        normalizeExistingItems(currentParentId || '');
        window.setTimeout(applyFolderVisibility, 0);
      }
    });

    observer.observe(card, { childList: true, subtree: true });
  }

  function init() {
    if (!hasFolderPage()) return;
    ensureNavigationUi();
    normalizeExistingItems('');
    bindOpenEvents();
    bindUploadInputs();
    observeNewItems();
    applyFolderVisibility();
  }

  window.bmOpenDriveItemById = openItemById;
  window.bmOpenDriveFolderRoot = function () { return openParent(''); };
  window.bmGetCurrentDriveParentId = function () { return currentParentId || ''; };
  window.bmRefreshDriveFolderVisibility = function () {
    applyFolderVisibility();
    return true;
  };

  ready(init);
})();


/* =========================================================
   Patch Dokumen & Kolaborasi: panel Detail Item dari kanan
   ========================================================= */
(function () {
  'use strict';

  if (window.__bmItemDetailDrawerPatch) return;
  window.__bmItemDetailDrawerPatch = true;

  function ready(callback) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', callback);
    else callback();
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value);
    return String(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  function text(value, fallback) {
    var clean = String(value || '').replace(/\s+/g, ' ').trim();
    return clean || fallback || '-';
  }

  function escapeText(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function queryItemRows(itemId) {
    if (!itemId) return [];
    return Array.prototype.slice.call(document.querySelectorAll('[data-folder-row][data-folder-id="' + cssEscape(itemId) + '"]'));
  }

  function firstItemRow(itemId) {
    return queryItemRows(itemId)[0] || null;
  }

  function getIconClass(row) {
    if (!row) return 'solar:folder-open-bold';
    var icon = row.querySelector('.bm-folder-icon iconify-icon, .bm-folder-icon-lg iconify-icon, .bm-folder-icon i, .bm-folder-icon-lg i');
    if (!icon) return 'solar:folder-open-bold';
    var iconName = icon.getAttribute ? (icon.getAttribute('icon') || '') : '';
    var className = icon.className || '';
    return text(iconName || className, 'solar:folder-open-bold');
  }

  function getItemKind(row) {
    if (!row) return 'Item';
    var type = row.getAttribute('data-item-type') || '';
    var link = row.getAttribute('data-link') || '';
    if (type === 'folder' || getIconClass(row).toLowerCase().indexOf('folder') >= 0) return 'Folder';
    if (type === 'google-sheet' || /\/spreadsheets\//i.test(link)) return 'Google Sheet';
    if (type === 'google-doc' || /\/document\//i.test(link)) return 'Google Docs';
    if (type === 'file') return 'File';
    return 'Dokumen';
  }

  function getName(row) {
    if (!row) return '-';
    var title = row.querySelector('.bm-folder-title-text');
    return text(row.getAttribute('data-name') || (title ? title.textContent : ''), '-');
  }

  function getOwner(row) {
    if (!row) return '-';
    if (row.hasAttribute('data-owner')) return text(row.getAttribute('data-owner'), '-');
    if (row.tagName && row.tagName.toLowerCase() === 'tr') {
      var cells = row.querySelectorAll('td');
      if (cells[1]) return text(cells[1].textContent, '-');
    }
    var smalls = Array.prototype.slice.call(row.querySelectorAll('small'));
    for (var i = 0; i < smalls.length; i += 1) {
      var value = text(smalls[i].textContent, '');
      if (/^owner\s*:/i.test(value)) return text(value.replace(/^owner\s*:\s*/i, ''), '-');
    }
    return '-';
  }

  function getLocation(row) {
    if (!row) return '-';
    if (row.hasAttribute('data-location')) return text(row.getAttribute('data-location'), '-');
    var breadcrumb = document.getElementById('bmFolderBreadcrumb');
    if (breadcrumb) {
      var value = text(breadcrumb.textContent, '');
      if (value) return value.replace(/\s*\/\s*/g, ' / ');
    }
    var type = row.getAttribute('data-folder-type') || '';
    if (type === 'shared') return 'Shared Folders';
    return 'My Folders';
  }

  function getCreated(row) {
    if (!row) return '-';
    if (row.hasAttribute('data-created')) return text(row.getAttribute('data-created'), '-');
    if (row.tagName && row.tagName.toLowerCase() === 'tr') {
      var cells = row.querySelectorAll('td');
      if (cells[2]) return text(cells[2].textContent, '-');
    }
    var smalls = Array.prototype.slice.call(row.querySelectorAll('small'));
    for (var i = 0; i < smalls.length; i += 1) {
      var value = text(smalls[i].textContent, '');
      if (/^created\s*:/i.test(value)) return text(value.replace(/^created\s*:\s*/i, ''), '-');
    }
    return '-';
  }

  function getSize(row) {
    if (!row) return '-';
    return text(row.getAttribute('data-size') || row.getAttribute('data-file-size') || '', '-');
  }

  function getLog(row, name) {
    if (!row) return '-';
    return text(row.getAttribute('data-log') || row.getAttribute('data-created') || getCreated(row), '-');
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function setIcon(id, iconClass) {
    var el = document.getElementById(id);
    if (!el) return;
    var safeIcon = String(iconClass || 'solar:folder-open-bold').replace(/"/g, '');
    if (safeIcon.indexOf('bx ') === 0 || safeIcon.indexOf('bx-') >= 0) {
      el.innerHTML = '<i class="' + safeIcon + '"></i>';
      return;
    }
    el.innerHTML = '<iconify-icon icon="' + safeIcon + '"></iconify-icon>';
  }

  function getShareEntries(row) {
    if (!row) return [];
    var raw = row.getAttribute('data-share-list') || '';
    if (raw) {
      try {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.filter(function (entry) { return entry && entry.name; });
        }
      } catch (err) { }
    }

    var employee = text(row.getAttribute('data-share-name'), '');
    var date = text(row.getAttribute('data-share-date'), '');
    if (!employee) return [];

    return employee.split(',').map(function (name, idx) {
      return {
        id: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || ('share-' + idx),
        name: name.trim(),
        date: date || 'Dikirim pada tanggal'
      };
    }).filter(function (entry) { return entry.name; });
  }

  function renderShareHistory(row) {
    var container = document.getElementById('bmItemDetailShareHistory');
    if (!container) return;

    var entries = getShareEntries(row);
    if (!entries.length) {
      container.innerHTML = '<li class="bm-item-share-empty">Belum dibagikan.</li>';
      return;
    }

    container.innerHTML = entries.map(function (entry) {
      return [
        '<li class="bm-item-share-entry" data-share-entry-id="' + escapeText(entry.id || entry.name) + '">',
        '  <div class="bm-item-share-info">',
        '    <div class="bm-item-share-name">' + escapeText(entry.name) + '</div>',
        '    <small>' + escapeText(entry.date || 'Dikirim pada tanggal') + '</small>',
        '  </div>',
        '  <button class="bm-item-share-remove" type="button" data-share-remove-id="' + escapeText(entry.id || entry.name) + '">remove</button>',
        '</li>'
      ].join('');
    }).join('');
  }

  function repositionDrawer() {
    var drawer = document.getElementById('bmItemDetailDrawer');
    if (!drawer) return;

    if (!drawer.classList.contains('is-open')) {
      drawer.style.top = '';
      drawer.style.height = '';
      drawer.style.bottom = '';
      drawer.style.left = '';
      drawer.style.right = '';
      return;
    }

    var vw = window.innerWidth || document.documentElement.clientWidth;
    if (vw < 992) {
      drawer.style.top = '';
      drawer.style.height = '';
      drawer.style.bottom = '';
      drawer.style.left = '';
      drawer.style.right = '';
      return;
    }

    var card = document.querySelector('.bm-folder-card-page');
    if (!card) return;

    var cardRect = card.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;

    // Start aligned with card (a bit lower), but clamp to 22px (1.35rem) at the top when scrolling
    var top = Math.max(22, cardRect.top);
    var bottom = Math.min(vh - 22, cardRect.bottom);
    var height = bottom - top;

    if (height < 100) {
      height = 100;
    }

    drawer.style.top = top + 'px';
    drawer.style.height = height + 'px';
    drawer.style.bottom = 'auto';
    drawer.style.left = (cardRect.right + 16) + 'px';
    drawer.style.right = 'auto';
  }

  function openDrawer(itemId) {
    var row = firstItemRow(itemId);
    if (!row) return false;

    var drawer = document.getElementById('bmItemDetailDrawer');
    var backdrop = document.getElementById('bmItemDetailBackdrop');
    if (!drawer) return false;

    var name = getName(row);
    var iconClass = getIconClass(row);
    var kind = getItemKind(row);

    setText('bmItemDetailNameTop', name);
    setText('bmItemDetailTypeTop', kind);
    setText('bmItemDetailOwner', getOwner(row));
    setText('bmItemDetailLocation', getLocation(row));
    setText('bmItemDetailSize', getSize(row));
    setText('bmItemDetailCreated', getCreated(row));
    setText('bmItemDetailLog', getLog(row, name));
    setIcon('bmItemDetailPhoto', iconClass);
    drawer.setAttribute('data-current-item-id', itemId);
    renderShareHistory(row);

    if (backdrop) backdrop.hidden = false;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('bm-item-detail-open');
    repositionDrawer();
    return true;
  }

  function closeDrawer() {
    var drawer = document.getElementById('bmItemDetailDrawer');
    var backdrop = document.getElementById('bmItemDetailBackdrop');
    if (drawer) {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      drawer.style.top = '';
      drawer.style.height = '';
      drawer.style.bottom = '';
      drawer.style.left = '';
      drawer.style.right = '';
    }
    if (backdrop) backdrop.hidden = true;
    document.body.classList.remove('bm-item-detail-open');
  }

  window.bmOpenDriveDetailsPanel = openDrawer;
  window.bmCloseDriveDetailsPanel = closeDrawer;

  ready(function () {
    var close = document.getElementById('bmItemDetailClose');
    var backdrop = document.getElementById('bmItemDetailBackdrop');
    var drawer = document.getElementById('bmItemDetailDrawer');
    var history = document.getElementById('bmItemDetailShareHistory');

    if (close) close.addEventListener('click', closeDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);

    window.addEventListener('scroll', repositionDrawer, true);
    window.addEventListener('resize', repositionDrawer);

    if (history) {
      history.addEventListener('click', function (event) {
        var remove = event.target.closest('[data-share-remove-id]');
        if (!remove || !drawer) return;

        var itemId = drawer.getAttribute('data-current-item-id') || '';
        var removeId = remove.getAttribute('data-share-remove-id') || '';
        var row = firstItemRow(itemId);
        var entries = getShareEntries(row).filter(function (entry) {
          return String(entry.id || entry.name) !== removeId;
        });

        queryItemRows(itemId).forEach(function (itemRow) {
          if (entries.length) {
            itemRow.setAttribute('data-share-list', JSON.stringify(entries));
            itemRow.setAttribute('data-share-name', entries.map(function (entry) { return entry.name; }).join(', '));
            itemRow.setAttribute('data-share-date', entries[entries.length - 1].date || '');
          } else {
            itemRow.removeAttribute('data-share-list');
            itemRow.removeAttribute('data-share-name');
            itemRow.removeAttribute('data-share-date');
          }
        });

        if (typeof window.bmApplyDriveShareSelection === 'function') {
          window.bmApplyDriveShareSelection(itemId, entries.map(function (entry) { return entry.id; }));
        }

        renderShareHistory(firstItemRow(itemId));
      });
    }

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeDrawer();
    });
  });
})();

/* =========================================================
   Revisi Folder: pastikan popup Docs/Sheet dan Buat Folder tidak tertutup dropdown
   ========================================================= */
(function () {
  function closeFolderActionDropdowns() {
    document.querySelectorAll('.bm-folder-action-section [data-bs-toggle="dropdown"], .bm-folder-action-section .dropdown-toggle').forEach(function (button) {
      try {
        if (window.bootstrap && window.bootstrap.Dropdown) {
          var instance = window.bootstrap.Dropdown.getInstance(button);
          if (instance) instance.hide();
        }
      } catch (error) { }
      button.classList.remove('show');
      button.setAttribute('aria-expanded', 'false');
    });

    document.querySelectorAll('.bm-folder-action-section .dropdown-menu.show, .bm-folder-action-section .dropdown.show').forEach(function (element) {
      element.classList.remove('show');
    });
  }

  function bringFolderModalToFront(modal) {
    if (!modal || !/^(dkLinkModal|dkFolderModal|dkFormModal)$/.test(modal.id || '')) return;
    closeFolderActionDropdowns();
    modal.style.zIndex = '2147483600';
    var dialog = modal.querySelector('.modal-dialog');
    var content = modal.querySelector('.modal-content');
    if (dialog) dialog.style.zIndex = '2147483601';
    if (content) content.style.zIndex = '2147483601';
    document.querySelectorAll('.modal-backdrop').forEach(function (backdrop) {
      backdrop.style.zIndex = '2147483500';
    });
  }

  document.addEventListener('click', function (event) {
    var trigger = event.target && event.target.closest ? event.target.closest('[data-doc-action="google-docs-sheet"], [data-doc-action="create-folder"], [data-doc-action="google-forms"]') : null;
    if (!trigger) return;
    window.setTimeout(function () {
      var modal = document.querySelector('#dkLinkModal.show, #dkFolderModal.show, #dkFormModal.show');
      bringFolderModalToFront(modal);
    }, 0);
  }, true);

  document.addEventListener('shown.bs.modal', function (event) {
    bringFolderModalToFront(event.target);
  });
})();



(function () {
  'use strict';

  function initRenameDialog() {
    var modalEl = document.getElementById('dkRenameModal');
    var input = document.getElementById('dkRenameInput');
    var okBtn = document.getElementById('dkRenameOkBtn');

    if (!modalEl || !input || !okBtn || !window.bootstrap || !window.bootstrap.Modal) return;

    var modal = window.bootstrap.Modal.getOrCreateInstance(modalEl, { backdrop: true, keyboard: true });
    var submitHandler = null;

    window.bmOpenRenameDialog = function (options) {
      options = options || {};
      submitHandler = typeof options.onConfirm === 'function' ? options.onConfirm : null;

      var value = String(options.value || '').trim();
      input.value = value;
      input.placeholder = value || 'Perubahan Judul';

      modal.show();
    };

    function submitRename() {
      var nextName = String(input.value || '').trim();
      if (!nextName) {
        input.focus();
        return;
      }

      if (submitHandler) submitHandler(nextName);
      modal.hide();
    }

    okBtn.addEventListener('click', submitRename);

    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        submitRename();
      }
    });

    modalEl.addEventListener('shown.bs.modal', function () {
      modalEl.style.zIndex = '2147483600';

      var backdrops = document.querySelectorAll('.modal-backdrop');
      var lastBackdrop = backdrops[backdrops.length - 1];
      if (lastBackdrop) lastBackdrop.style.zIndex = '2147483500';

      input.focus();
      input.select();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRenameDialog);
  } else {
    initRenameDialog();
  }
})();


(function () {
  'use strict';

  function initDeleteDialog() {
    var modalEl = document.getElementById('dkDeleteModal');
    var messageEl = document.getElementById('dkDeleteMessage');
    var okBtn = document.getElementById('dkDeleteOkBtn');

    if (!modalEl || !messageEl || !okBtn || !window.bootstrap || !window.bootstrap.Modal) return;

    var modal = window.bootstrap.Modal.getOrCreateInstance(modalEl, { backdrop: true, keyboard: true });
    var submitHandler = null;

    window.bmOpenDeleteDialog = function (options) {
      options = options || {};
      submitHandler = typeof options.onConfirm === 'function' ? options.onConfirm : null;
      var name = String(options.name || '').trim();
      messageEl.textContent = name ? ('Apakah Anda yakin ingin menghapus "' + name + '"?') : 'Apakah Anda yakin ingin menghapus data ini?';
      modal.show();
    };

    okBtn.addEventListener('click', function () {
      if (submitHandler) submitHandler();
      modal.hide();
    });

    modalEl.addEventListener('shown.bs.modal', function () {
      modalEl.style.zIndex = '2147483600';

      var backdrops = document.querySelectorAll('.modal-backdrop');
      var lastBackdrop = backdrops[backdrops.length - 1];
      if (lastBackdrop) lastBackdrop.style.zIndex = '2147483500';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDeleteDialog);
  } else {
    initDeleteDialog();
  }
})();


/* =========================================================
   Revisi lanjutan: struktur grid Folder disamakan dengan grid Document
   ========================================================= */
(function () {
  'use strict';

  if (window.__bmFolderGridDocumentStylePatch) return;
  window.__bmFolderGridDocumentStylePatch = true;

  function directChildByClass(parent, className) {
    if (!parent) return null;
    return Array.prototype.find.call(parent.children || [], function (child) {
      return child.classList && child.classList.contains(className);
    }) || null;
  }

  function normalizeCard(card) {
    if (!card || card.classList.contains('bm-folder-document-card')) return;

    var oldMenuWrap = directChildByClass(card, 'position-absolute');
    var oldBody = directChildByClass(card, 'card-body');
    if (!oldBody) return;

    var title = oldBody.querySelector('.bm-folder-title');
    var icon = oldBody.querySelector('.bm-folder-icon, .bm-folder-icon-lg');
    var small = oldBody.querySelector('small');
    var dateEl = oldBody.querySelector('.bm-folder-date');

    var header = document.createElement('div');
    header.className = 'bm-folder-document-card-head';

    var titleSection = document.createElement('div');
    titleSection.style.minWidth = '0';
    titleSection.style.flex = '1';

    var titleWrap = document.createElement('div');
    titleWrap.className = 'fw-semibold bm-folder-title bm-folder-document-card-title';

    if (title) {
      titleWrap.innerHTML = title.innerHTML;
    } else {
      var row = card.closest('[data-folder-row]');
      var name = row ? (row.getAttribute('data-name') || 'Folder') : 'Folder';
      titleWrap.innerHTML = '<span class="bm-folder-title-text"></span>';
      var titleText = titleWrap.querySelector('.bm-folder-title-text');
      if (titleText) titleText.textContent = name;
    }

    titleSection.appendChild(titleWrap);

    if (!dateEl) {
      var row = card.closest('[data-folder-row]');
      var rowDate = '';
      if (row) {
        rowDate = row.getAttribute('data-created');
        if (!rowDate && row.tagName && row.tagName.toLowerCase() === 'tr') {
          var cells = row.querySelectorAll('td');
          if (cells[2]) rowDate = cells[2].textContent.trim();
        }
      }
      if (!rowDate) {
        var now = new Date();
        rowDate = String(now.getDate()).padStart(2, '0') + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear();
      }
      dateEl = document.createElement('div');
      dateEl.className = 'text-muted bm-folder-date';
      dateEl.textContent = rowDate;
    }
    titleSection.appendChild(dateEl);

    var dotsWrap = document.createElement('div');
    dotsWrap.className = 'bm-folder-document-card-dots';

    if (oldMenuWrap) {
      while (oldMenuWrap.firstChild) dotsWrap.appendChild(oldMenuWrap.firstChild);
      oldMenuWrap.remove();
    }

    header.appendChild(titleSection);
    header.appendChild(dotsWrap);

    var body = document.createElement('div');
    body.className = 'card-body bm-folder-document-card-body';

    if (icon) {
      body.appendChild(icon);
    }

    if (small) {
      body.appendChild(small);
    }

    oldBody.remove();
    card.insertBefore(header, card.firstChild);
    card.appendChild(body);
    card.classList.add('bm-folder-document-card');
  }

  function normalizeAll() {
    document.querySelectorAll('#folderGridView .bm-folder-grid-card').forEach(normalizeCard);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', normalizeAll);
  } else {
    normalizeAll();
  }

  var grid = document.getElementById('folderGridView');
  if (grid && window.MutationObserver) {
    var observer = new MutationObserver(function () {
      normalizeAll();
    });
    observer.observe(grid, { childList: true, subtree: true });
  }
})();


/* =========================================================
   Patch Folder: pindahkan Google Sheet/File dengan drag & drop
   ========================================================= */
(function () {
  'use strict';

  if (window.__bmDriveDragDropMovePatch) return;
  window.__bmDriveDragDropMovePatch = true;

  var draggedItemId = '';

  function ready(callback) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', callback);
    else callback();
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value);
    return String(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  function rowsById(itemId) {
    if (!itemId) return [];
    return Array.prototype.slice.call(document.querySelectorAll('[data-folder-row][data-folder-id="' + cssEscape(itemId) + '"]'));
  }

  function firstRow(itemId) {
    return rowsById(itemId)[0] || null;
  }

  function getItemType(row) {
    if (!row) return 'folder';
    var type = row.getAttribute('data-item-type') || '';
    if (type) return type;
    var icon = row.querySelector('.bm-folder-icon iconify-icon, .bm-folder-icon-lg iconify-icon');
    var iconName = icon ? (icon.getAttribute('icon') || '') : '';
    return iconName.toLowerCase().indexOf('folder') >= 0 ? 'folder' : 'file';
  }

  function getItemName(itemId) {
    var row = firstRow(itemId);
    var title = row ? row.querySelector('.bm-folder-title-text') : null;
    return (row ? (row.getAttribute('data-name') || (title ? title.textContent : '')) : '') || 'Item';
  }

  function isDraggableItem(row) {
    if (!row) return false;
    var type = getItemType(row);
    return type !== 'folder';
  }

  function isDropFolder(row) {
    if (!row || !draggedItemId) return false;
    if (row.getAttribute('data-folder-id') === draggedItemId) return false;
    return getItemType(row) === 'folder';
  }

  function markDraggable() {
    document.querySelectorAll('.bm-folder-card-page [data-folder-row]').forEach(function (row) {
      row.setAttribute('draggable', isDraggableItem(row) ? 'true' : 'false');
      row.classList.toggle('bm-drive-drop-folder', getItemType(row) === 'folder');
    });
  }

  function clearDropState() {
    document.querySelectorAll('.bm-drive-drop-target, .bm-drive-dragging').forEach(function (row) {
      row.classList.remove('bm-drive-drop-target', 'bm-drive-dragging');
    });
  }

  function hideMovedRows(itemId) {
    rowsById(itemId).forEach(function (row) {
      row.hidden = true;
    });
  }

  function moveItemToFolder(itemId, folderId) {
    rowsById(itemId).forEach(function (row) {
      row.setAttribute('data-parent-id', folderId || '');
    });

    hideMovedRows(itemId);

    if (typeof window.ceoToast === 'function') {
      window.ceoToast(getItemName(itemId) + ' berhasil dipindahkan ke ' + getItemName(folderId) + '.', 'success');
    }
  }

  ready(function () {
    var page = document.querySelector('.bm-folder-card-page');
    if (!page) return;

    markDraggable();

    if (window.MutationObserver) {
      new MutationObserver(function () {
        window.setTimeout(markDraggable, 0);
      }).observe(page, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-item-type'] });
    }

    page.addEventListener('dragstart', function (event) {
      var row = event.target.closest('[data-folder-row]');
      if (!row || !isDraggableItem(row) || event.target.closest('button, a, input, .dropdown')) {
        event.preventDefault();
        return;
      }

      draggedItemId = row.getAttribute('data-folder-id') || '';
      if (!draggedItemId) {
        event.preventDefault();
        return;
      }

      row.classList.add('bm-drive-dragging');
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', draggedItemId);
      }
    }, true);

    page.addEventListener('dragover', function (event) {
      var target = event.target.closest('[data-folder-row]');
      if (!isDropFolder(target)) return;
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
      target.classList.add('bm-drive-drop-target');
    }, true);

    page.addEventListener('dragleave', function (event) {
      var target = event.target.closest('[data-folder-row]');
      if (target) target.classList.remove('bm-drive-drop-target');
    }, true);

    page.addEventListener('drop', function (event) {
      var target = event.target.closest('[data-folder-row]');
      if (!isDropFolder(target)) return;

      event.preventDefault();
      event.stopPropagation();

      var itemId = draggedItemId || (event.dataTransfer ? event.dataTransfer.getData('text/plain') : '');
      var folderId = target.getAttribute('data-folder-id') || '';
      clearDropState();

      if (itemId && folderId) moveItemToFolder(itemId, folderId);
      draggedItemId = '';
    }, true);

    page.addEventListener('dragend', function () {
      clearDropState();
      draggedItemId = '';
    }, true);
  });
})();


/* =========================================================
   Patch Folder: kembalikan file/spreadsheet dengan drag ke Home / folder sebelumnya
   ========================================================= */
(function () {
  'use strict';

  if (window.__bmDriveDropToBreadcrumbPatch) return;
  window.__bmDriveDropToBreadcrumbPatch = true;

  var draggedItemId = '';

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value);
    return String(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  function rowsById(itemId) {
    if (!itemId) return [];
    return Array.prototype.slice.call(document.querySelectorAll('[data-folder-row][data-folder-id="' + cssEscape(itemId) + '"]'));
  }

  function firstRow(itemId) {
    return rowsById(itemId)[0] || null;
  }

  function getItemName(itemId) {
    var row = firstRow(itemId);
    var title = row ? row.querySelector('.bm-folder-title-text') : null;
    return (row ? (row.getAttribute('data-name') || (title ? title.textContent : '')) : '') || 'Item';
  }

  function getItemType(row) {
    if (!row) return 'folder';
    var type = row.getAttribute('data-item-type') || '';
    if (type) return type;
    var icon = row.querySelector('.bm-folder-icon iconify-icon, .bm-folder-icon-lg iconify-icon');
    var iconName = icon ? (icon.getAttribute('icon') || '') : '';
    return iconName.toLowerCase().indexOf('folder') >= 0 ? 'folder' : 'file';
  }

  function isDraggableFile(row) {
    return row && getItemType(row) !== 'folder';
  }

  function getDropParentId(target) {
    if (!target || !target.closest) return null;

    var breadcrumb = target.closest('[data-folder-breadcrumb-id]');
    if (breadcrumb) return breadcrumb.getAttribute('data-folder-breadcrumb-id') || '';

    var back = target.closest('#bmFolderBackBtn');
    if (back) return back.getAttribute('data-folder-back-parent') || '';

    return null;
  }

  function moveItemToParent(itemId, parentId) {
    rowsById(itemId).forEach(function (row) {
      row.setAttribute('data-parent-id', parentId || '');
      row.hidden = true;
    });

    var destination = parentId ? getItemName(parentId) : 'My Folder';
    if (typeof window.ceoToast === 'function') {
      window.ceoToast(getItemName(itemId) + ' berhasil dipindahkan ke ' + destination + '.', 'success');
    }
  }

  document.addEventListener('dragstart', function (event) {
    var row = event.target && event.target.closest ? event.target.closest('.bm-folder-card-page [data-folder-row]') : null;
    if (!isDraggableFile(row)) return;
    draggedItemId = row.getAttribute('data-folder-id') || '';
  }, true);

  document.addEventListener('dragover', function (event) {
    if (!draggedItemId) return;
    var parentId = getDropParentId(event.target);
    if (parentId === null) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';

    var target = event.target.closest('[data-folder-breadcrumb-id], #bmFolderBackBtn');
    if (target) target.classList.add('bm-drive-breadcrumb-drop-target');
  }, true);

  document.addEventListener('dragleave', function (event) {
    var target = event.target && event.target.closest ? event.target.closest('[data-folder-breadcrumb-id], #bmFolderBackBtn') : null;
    if (target) target.classList.remove('bm-drive-breadcrumb-drop-target');
  }, true);

  document.addEventListener('drop', function (event) {
    if (!draggedItemId) return;
    var parentId = getDropParentId(event.target);
    if (parentId === null) return;

    event.preventDefault();
    event.stopPropagation();

    document.querySelectorAll('.bm-drive-breadcrumb-drop-target').forEach(function (el) {
      el.classList.remove('bm-drive-breadcrumb-drop-target');
    });

    moveItemToParent(draggedItemId, parentId);
    draggedItemId = '';
  }, true);

  document.addEventListener('dragend', function () {
    document.querySelectorAll('.bm-drive-breadcrumb-drop-target').forEach(function (el) {
      el.classList.remove('bm-drive-breadcrumb-drop-target');
    });
    draggedItemId = '';
  }, true);
})();


/* =========================================================
   Patch New Template: editor kertas tengah seperti Word
   ========================================================= */
(function () {
  'use strict';

  if (window.__bmNewTemplateWordEditorPatch) return;
  window.__bmNewTemplateWordEditorPatch = true;

  function ready(callback) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', callback);
    else callback();
  }

  function focusEditor() {
    var editor = document.getElementById('dkTemplateCreatePreviewBody');
    if (editor) editor.focus();
    return editor;
  }

  ready(function () {
    var modal = document.getElementById('dkTemplateCreateModal');
    if (!modal) return;

    var editor = document.getElementById('dkTemplateCreatePreviewBody');
    if (editor) {
      editor.setAttribute('contenteditable', 'true');
      editor.setAttribute('data-placeholder', 'Tulis isi template di sini seperti mengetik di Word...');
    }

    modal.querySelectorAll('.bm-template-create-tool').forEach(function (btn) {
      btn.setAttribute('role', 'button');
      btn.setAttribute('tabindex', '0');
    });

    modal.addEventListener('click', function (event) {
      var tool = event.target.closest('.bm-template-create-tool');
      if (!tool) return;

      var icon = tool.querySelector('i');
      var cls = icon ? icon.className : '';
      var command = '';

      if (cls.indexOf('bx-bold') >= 0) command = 'bold';
      else if (cls.indexOf('bx-italic') >= 0) command = 'italic';
      else if (cls.indexOf('bx-underline') >= 0) command = 'underline';
      else if (cls.indexOf('bx-list-ul') >= 0) command = 'insertUnorderedList';
      else if (cls.indexOf('bx-align-left') >= 0) command = 'justifyLeft';
      else if (cls.indexOf('bx-align-middle') >= 0) command = 'justifyCenter';
      else if (cls.indexOf('bx-align-right') >= 0) command = 'justifyRight';
      else if (cls.indexOf('bx-undo') >= 0) command = 'undo';
      else if (cls.indexOf('bx-redo') >= 0) command = 'redo';

      if (!command) return;
      event.preventDefault();
      focusEditor();
      document.execCommand(command, false, null);
    });
  });
})();


/* =========================================================
   Patch Folder: dokumen dari Template bisa dibuka kembali sebagai popup
   ========================================================= */
(function () {
  'use strict';

  if (window.__bmDriveDocumentPopupPatch) return;
  window.__bmDriveDocumentPopupPatch = true;
  window.bmDriveDocumentPreviews = window.bmDriveDocumentPreviews || {};

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value);
    return String(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  function rowsById(itemId) {
    if (!itemId) return [];
    return Array.prototype.slice.call(document.querySelectorAll('[data-folder-row][data-folder-id="' + cssEscape(itemId) + '"]'));
  }

  function firstRow(itemId) {
    return rowsById(itemId)[0] || null;
  }

  function getRowName(row) {
    if (!row) return 'Dokumen';
    var title = row.querySelector('.bm-folder-title-text');
    return (row.getAttribute('data-name') || (title ? title.textContent : '') || 'Dokumen').replace(/\s+/g, ' ').trim();
  }

  function ensureModal() {
    var modalEl = document.getElementById('dkDocumentViewModal');
    if (modalEl) return modalEl;

    modalEl = document.createElement('div');
    modalEl.className = 'modal fade';
    modalEl.id = 'dkDocumentViewModal';
    modalEl.tabIndex = -1;
    modalEl.setAttribute('aria-hidden', 'true');
    modalEl.innerHTML = [
      '<div class="modal-dialog modal-dialog-centered modal-xl">',
      '<div class="modal-content position-relative">',
      '<button type="button" class="bm-document-view-close" data-bs-dismiss="modal" aria-label="Tutup">x</button>',
      '<div class="bm-document-view-shell">',
      '<div class="bm-document-view-head">',
      '<h4 class="bm-document-view-title" id="dkDocumentViewTitle">Dokumen</h4>',
      '<span class="bm-document-view-badge">Document Preview</span>',
      '</div>',
      '<div class="bm-document-view-paper-wrap" id="dkDocumentViewPaper"></div>',
      '</div>',
      '</div>',
      '</div>'
    ].join('');
    document.body.appendChild(modalEl);
    return modalEl;
  }

  function fallbackHtml(title) {
    return [
      '<div class="bm-template-preview-a4-stack">',
      '<section class="bm-template-preview-document bm-template-preview-a4-page">',
      '<div class="bm-template-preview-doc-head">',
      '<h5>' + String(title || 'DOKUMEN').replace(/[&<>"']/g, function (char) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char];
      }) + '</h5>',
      '</div>',
      '<p>Dokumen ini dibuat dari Template dan siap untuk dibuka kembali melalui popup.</p>',
      '<div class="bm-template-preview-page-number">Hal. 1</div>',
      '</section>',
      '</div>'
    ].join('');
  }

  window.bmOpenDriveDocumentPopup = function (itemId) {
    var row = firstRow(itemId);
    if (!row) return false;

    var data = window.bmDriveDocumentPreviews[itemId] || {};
    var title = data.title || getRowName(row);
    var html = data.html || fallbackHtml(title);

    var modalEl = ensureModal();
    var titleEl = modalEl.querySelector('#dkDocumentViewTitle');
    var paper = modalEl.querySelector('#dkDocumentViewPaper');

    if (titleEl) titleEl.textContent = title;
    if (paper) paper.innerHTML = html;

    if (window.bootstrap && window.bootstrap.Modal) {
      window.bootstrap.Modal.getOrCreateInstance(modalEl, { backdrop: true, keyboard: true }).show();
    } else {
      modalEl.classList.add('show');
      modalEl.style.display = 'block';
      modalEl.removeAttribute('aria-hidden');
    }

    return true;
  };
})();


/* =========================================================
   Patch stabilitas icon folder/navbar:
   Meminta Iconify merender ulang icon setelah DOM berubah agar tidak kosong/flicker.
   ========================================================= */
(function () {
  if (window.__bmStableIconRefreshPatch) return;
  window.__bmStableIconRefreshPatch = true;

  function refreshIcons() {
    try {
      if (window.Iconify && typeof window.Iconify.scan === 'function') {
        window.Iconify.scan(document.body);
      }
    } catch (error) { }
  }

  document.addEventListener('DOMContentLoaded', function () {
    refreshIcons();
    window.setTimeout(refreshIcons, 120);
    window.setTimeout(refreshIcons, 600);
  });

  document.addEventListener('click', function () {
    window.setTimeout(refreshIcons, 80);
  }, true);

  const observer = new MutationObserver(function (mutations) {
    if (!mutations.some(function (mutation) { return mutation.addedNodes && mutation.addedNodes.length; })) return;
    window.clearTimeout(window.__bmStableIconRefreshTimer);
    window.__bmStableIconRefreshTimer = window.setTimeout(refreshIcons, 80);
  });

  try {
    observer.observe(document.body, { childList: true, subtree: true });
  } catch (error) { }
})();


/* =========================================================
   Revisi final:
   1) Icon folder/navbar/menu dibuat stabil dengan fallback.
   2) Detail Item dibuat benar-benar mengikuti item yang dipilih.
   ========================================================= */
(function () {
  if (window.__bmStableIconAndDynamicDetailFinalPatch) return;
  window.__bmStableIconAndDynamicDetailFinalPatch = true;

  function ready(callback) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', callback);
    else callback();
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value);
    return String(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  function cleanText(value, fallback) {
    var text = String(value || '').replace(/\s+/g, ' ').trim();
    return text || fallback || '-';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function iconFallback(icon) {
    var value = String(icon || '').toLowerCase();
    if (value.indexOf('folder') >= 0) return '📁';
    if (value.indexOf('excel') >= 0 || value.indexOf('sheet') >= 0 || value.indexOf('spreadsheet') >= 0) return '▦';
    if (value.indexOf('word') >= 0) return 'W';
    if (value.indexOf('pdf') >= 0) return 'PDF';
    if (value.indexOf('image') >= 0 || value.indexOf('gallery') >= 0) return '▧';
    if (value.indexOf('google') >= 0 || value.indexOf('drive') >= 0) return 'G';
    if (value.indexOf('share') >= 0) return '↗';
    if (value.indexOf('star') >= 0) return '★';
    if (value.indexOf('delete') >= 0) return '×';
    if (value.indexOf('edit') >= 0 || value.indexOf('rename') >= 0) return '✎';
    if (value.indexOf('copy') >= 0) return '⧉';
    if (value.indexOf('dots') >= 0) return '⋮';
    return '•';
  }

  function applyIconFallbacks(scope) {
    var root = scope || document;
    root.querySelectorAll('iconify-icon').forEach(function (icon) {
      var iconName = icon.getAttribute('icon') || '';
      icon.classList.add('bm-icon-stable');
      if (!icon.getAttribute('data-bm-icon-fallback')) {
        icon.setAttribute('data-bm-icon-fallback', iconFallback(iconName));
      }

      var rendered = false;
      try {
        rendered = !!(icon.shadowRoot && icon.shadowRoot.querySelector('svg'));
      } catch (error) { }

      icon.classList.toggle('bm-icon-fallback-visible', !rendered);
    });

    root.querySelectorAll('.bx, [class*="bx-"]').forEach(function (icon) {
      icon.classList.add('bm-icon-stable');
    });

    try {
      if (window.Iconify && typeof window.Iconify.scan === 'function') {
        window.Iconify.scan(root === document ? document.body : root);
      }
    } catch (error) { }
  }

  function scheduleIconFallbacks(scope) {
    window.clearTimeout(window.__bmStableIconAndDynamicDetailFinalTimer);
    window.__bmStableIconAndDynamicDetailFinalTimer = window.setTimeout(function () {
      applyIconFallbacks(scope || document);
    }, 60);
  }

  function rowsById(itemId) {
    if (!itemId) return [];
    return Array.prototype.slice.call(document.querySelectorAll('[data-folder-row][data-folder-id="' + cssEscape(itemId) + '"]'));
  }

  function firstUsefulRow(itemId) {
    var rows = rowsById(itemId);
    if (!rows.length) return null;

    var visible = rows.find(function (row) {
      return !row.hidden && row.offsetParent !== null;
    });
    return visible || rows[0];
  }

  function selectedIconHtml(row) {
    if (!row) return '<iconify-icon icon="solar:folder-open-bold"></iconify-icon>';

    var iconBox = row.querySelector('.bm-folder-icon, .bm-folder-icon-lg, .bm-menu-iconify');
    if (iconBox && cleanText(iconBox.innerHTML, '')) {
      return iconBox.innerHTML;
    }

    var icon = row.querySelector('iconify-icon');
    if (icon) {
      var iconName = icon.getAttribute('icon') || 'solar:folder-open-bold';
      return '<iconify-icon icon="' + escapeHtml(iconName) + '"></iconify-icon>';
    }

    var bx = row.querySelector('i[class*="bx"]');
    if (bx) return '<i class="' + escapeHtml(bx.className || 'bx bx-file') + '"></i>';

    return '<iconify-icon icon="solar:folder-open-bold"></iconify-icon>';
  }

  function rowIconName(row) {
    if (!row) return 'solar:folder-open-bold';
    var icon = row.querySelector('.bm-folder-icon iconify-icon, .bm-folder-icon-lg iconify-icon, iconify-icon');
    if (icon) return icon.getAttribute('icon') || 'solar:folder-open-bold';
    var bx = row.querySelector('.bm-folder-icon i, .bm-folder-icon-lg i, i[class*="bx"]');
    if (bx) return bx.className || 'bx bx-file';
    return 'solar:folder-open-bold';
  }

  function itemName(row) {
    if (!row) return '-';
    var title = row.querySelector('.bm-folder-title-text');
    return cleanText(row.getAttribute('data-name') || (title ? title.textContent : ''), '-');
  }

  function itemOwner(row) {
    if (!row) return '-';
    if (row.hasAttribute('data-owner')) return cleanText(row.getAttribute('data-owner'), '-');

    if (row.tagName && row.tagName.toLowerCase() === 'tr') {
      var cells = row.querySelectorAll('td');
      if (cells[1]) return cleanText(cells[1].textContent, '-');
    }

    var ownerSmall = Array.prototype.slice.call(row.querySelectorAll('small')).find(function (small) {
      return /^owner\s*:/i.test(cleanText(small.textContent, ''));
    });

    return ownerSmall ? cleanText(ownerSmall.textContent.replace(/^owner\s*:\s*/i, ''), '-') : '-';
  }

  function itemCreated(row) {
    if (!row) return '-';
    if (row.hasAttribute('data-created')) return cleanText(row.getAttribute('data-created'), '-');

    if (row.tagName && row.tagName.toLowerCase() === 'tr') {
      var cells = row.querySelectorAll('td');
      if (cells[2]) return cleanText(cells[2].textContent, '-');
    }

    var createdSmall = Array.prototype.slice.call(row.querySelectorAll('small')).find(function (small) {
      return /^created\s*:/i.test(cleanText(small.textContent, ''));
    });

    return createdSmall ? cleanText(createdSmall.textContent.replace(/^created\s*:\s*/i, ''), '-') : '-';
  }

  function itemLocation(row) {
    if (!row) return '-';
    if (row.hasAttribute('data-location')) return cleanText(row.getAttribute('data-location'), '-');

    var breadcrumb = document.getElementById('bmFolderBreadcrumb');
    var breadcrumbText = breadcrumb ? cleanText(breadcrumb.textContent, '') : '';
    if (breadcrumbText) return breadcrumbText.replace(/\s*\/\s*/g, ' / ');

    return (row.getAttribute('data-folder-type') || '') === 'shared' ? 'Shared Folders' : 'My Folders';
  }

  function itemType(row) {
    if (!row) return 'Item';

    var type = String(row.getAttribute('data-item-type') || '').toLowerCase();
    var kind = String(row.getAttribute('data-file-kind') || '').toLowerCase();
    var link = row.getAttribute('data-link') || '';
    var icon = rowIconName(row).toLowerCase();
    var name = itemName(row).toLowerCase();

    if (type === 'folder' || kind === 'folder' || icon.indexOf('folder') >= 0) return 'Folder';
    if (type === 'google-sheet' || kind === 'sheet' || kind === 'spreadsheet' || /\/spreadsheets\//i.test(link) || /\.(xls|xlsx|csv)$/i.test(name)) return 'Spreadsheet';
    if (type === 'google-doc' || kind === 'doc' || kind === 'docs' || /\/document\//i.test(link)) return 'Google Docs';
    if (kind === 'word' || kind === 'docx' || /\.(doc|docx)$/i.test(name)) return 'Word';
    if (kind === 'pdf' || /\.pdf$/i.test(name)) return 'PDF';
    if (kind === 'image' || /\.(png|jpg|jpeg|webp|gif)$/i.test(name)) return 'Gambar';
    if (type === 'file') return 'File';
    if (type === 'google-link') return 'Link Google';
    return 'Dokumen';
  }

  function itemFormat(row) {
    if (!row) return '-';
    var kind = cleanText(row.getAttribute('data-file-kind') || '', '');
    if (kind) return kind.toUpperCase();
    var name = itemName(row);
    var match = name.match(/\.([a-z0-9]{2,6})$/i);
    if (match) return match[1].toUpperCase();
    return itemType(row);
  }

  function itemSize(row) {
    if (!row) return '-';
    var direct = cleanText(row.getAttribute('data-size') || row.getAttribute('data-file-size') || '', '');
    if (direct) return direct;
    var type = itemType(row);
    if (type === 'Folder') {
      var id = row.getAttribute('data-folder-id') || '';
      var children = document.querySelectorAll('[data-folder-row][data-parent-id="' + cssEscape(id) + '"]').length;
      return children ? children + ' item' : '-';
    }
    return '-';
  }

  function itemShareSummary(row) {
    if (!row) return '-';
    var raw = row.getAttribute('data-share-list') || '';
    if (raw) {
      try {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          return parsed.map(function (entry) { return cleanText(entry && entry.name, ''); }).filter(Boolean).join(', ');
        }
      } catch (error) { }
    }
    return cleanText(row.getAttribute('data-share-name') || '', '-');
  }

  function buildFields(row) {
    var type = itemType(row);
    var link = cleanText(row.getAttribute('data-link') || row.getAttribute('data-object-url') || '', '');
    var fields = [
      ['Tipe', type],
      ['Pemilik', itemOwner(row)],
      ['Lokasi', itemLocation(row)],
      ['Dibuat', itemCreated(row)]
    ];

    if (type === 'Folder') {
      fields.push(['Isi', itemSize(row)]);
      fields.push(['Dibagikan', itemShareSummary(row)]);
    } else {
      fields.push(['Format', itemFormat(row)]);
      fields.push(['Size', itemSize(row)]);
      if (link) fields.push(['Link', link]);
    }

    var log = cleanText(row.getAttribute('data-log') || '', '');
    if (log) fields.push(['Log', log]);

    return fields.filter(function (pair) {
      return pair[1] && pair[1] !== '-';
    });
  }

  function renderFields(row) {
    var list = document.querySelector('#bmItemDetailDrawer .bm-item-detail-list');
    if (!list) return;

    var fields = buildFields(row);
    list.innerHTML = fields.map(function (pair) {
      return [
        '<div class="bm-item-detail-field">',
        '  <dt>' + escapeHtml(pair[0]) + '</dt>',
        '  <dd><span class="bm-item-detail-separator">:</span><span>' + escapeHtml(pair[1]) + '</span></dd>',
        '</div>'
      ].join('');
    }).join('');
  }

  function shareEntries(row) {
    if (!row) return [];

    var raw = row.getAttribute('data-share-list') || '';
    if (raw) {
      try {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.filter(function (entry) { return entry && entry.name; });
        }
      } catch (error) { }
    }

    var names = cleanText(row.getAttribute('data-share-name') || '', '');
    var date = cleanText(row.getAttribute('data-share-date') || '', 'Dikirim pada tanggal');
    if (!names) return [];

    return names.split(',').map(function (name, index) {
      name = cleanText(name, '');
      return name ? {
        id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || ('share-' + index),
        name: name,
        date: date
      } : null;
    }).filter(Boolean);
  }

  function renderShare(row) {
    var container = document.getElementById('bmItemDetailShareHistory');
    if (!container) return;

    var entries = shareEntries(row);
    if (!entries.length) {
      container.innerHTML = '<li class="bm-item-share-empty">Belum dibagikan.</li>';
      return;
    }

    container.innerHTML = entries.map(function (entry) {
      return [
        '<li class="bm-item-share-entry" data-share-entry-id="' + escapeHtml(entry.id || entry.name) + '">',
        '  <div class="bm-item-share-info">',
        '    <div class="bm-item-share-name">' + escapeHtml(entry.name) + '</div>',
        '    <small>' + escapeHtml(entry.date || 'Dikirim pada tanggal') + '</small>',
        '  </div>',
        '  <button class="bm-item-share-remove" type="button" data-share-remove-id="' + escapeHtml(entry.id || entry.name) + '">remove</button>',
        '</li>'
      ].join('');
    }).join('');
  }

  function openDynamicDetail(itemId) {
    var row = firstUsefulRow(itemId);
    if (!row) return false;

    var drawer = document.getElementById('bmItemDetailDrawer');
    var backdrop = document.getElementById('bmItemDetailBackdrop');
    if (!drawer) return false;

    var type = itemType(row);
    var name = itemName(row);
    var iconTarget = document.getElementById('bmItemDetailPhoto');

    var title = document.getElementById('bmItemDetailTitle');
    if (title) title.textContent = 'Detail ' + type;

    var topName = document.getElementById('bmItemDetailNameTop');
    if (topName) topName.textContent = name;

    var topType = document.getElementById('bmItemDetailTypeTop');
    if (topType) topType.textContent = type;

    if (iconTarget) {
      iconTarget.innerHTML = selectedIconHtml(row);
      applyIconFallbacks(iconTarget);
    }

    drawer.setAttribute('data-current-item-id', itemId);
    drawer.setAttribute('data-item-kind', type.toLowerCase().replace(/\s+/g, '-'));

    renderFields(row);
    renderShare(row);

    if (backdrop) backdrop.hidden = false;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('bm-item-detail-open');

    scheduleIconFallbacks(drawer);
    return true;
  }

  window.bmOpenDriveDetailsPanel = openDynamicDetail;

  ready(function () {
    applyIconFallbacks(document);

    document.addEventListener('click', function () {
      scheduleIconFallbacks(document);
    }, true);

    var observer = new MutationObserver(function (mutations) {
      var shouldRefresh = mutations.some(function (mutation) {
        return mutation.addedNodes && mutation.addedNodes.length;
      });
      if (shouldRefresh) scheduleIconFallbacks(document);
    });

    try {
      observer.observe(document.body, { childList: true, subtree: true });
    } catch (error) { }

    window.setInterval(function () {
      applyIconFallbacks(document);
    }, 1200);
  });
})();


/* =========================================================
   Revisi icon tabel isi:
   Folder, Spreadsheet, Doc, Word, PDF, Gambar, dan file lain
   hanya memiliki satu icon dan warnanya tidak berubah jadi putih.
   ========================================================= */
(function () {
  if (window.__bmColoredSingleContentIconPatch) return;
  window.__bmColoredSingleContentIconPatch = true;

  function ready(callback) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', callback);
    else callback();
  }

  function detectKind(row) {
    if (!row) return 'folder';

    var itemType = String(row.getAttribute('data-item-type') || '').toLowerCase();
    var fileKind = String(row.getAttribute('data-file-kind') || '').toLowerCase();
    var link = String(row.getAttribute('data-link') || '').toLowerCase();

    // Treat static rows with data-folder-row and no link as folder
    if (!itemType && row.hasAttribute('data-folder-row') && !link) {
      itemType = 'folder';
    }

    var name = String(row.getAttribute('data-name') || row.textContent || '').toLowerCase();
    var source = [itemType, fileKind, link, name].join(' ');

    if (itemType === 'folder' || fileKind === 'folder') return 'folder';
    if (source.indexOf('/spreadsheets/') >= 0 || /\b(sheet|spreadsheet|xlsx|xls|csv)\b/.test(source) || /\.(xlsx|xls|csv)(?:$|[\s?#])/.test(source)) return 'spreadsheet';
    if (/\b(word|docx)\b/.test(source) || /\.(doc|docx)(?:$|[\s?#])/.test(source)) return 'word';
    if (source.indexOf('/document/') >= 0 || /\b(google-doc|docs|doc)\b/.test(source)) return 'doc';
    if (/\bpdf\b/.test(source) || /\.pdf(?:$|[\s?#])/.test(source)) return 'pdf';
    if (/\bimage\b/.test(source) || /\.(png|jpe?g|webp|gif|svg)(?:$|[\s?#])/.test(source)) return 'image';
    if (itemType === 'google-link') return 'google-link';
    return itemType === 'file' ? 'file' : 'folder';
  }

  function iconForKind(kind) {
    var map = {
      folder: 'bx bxs-folder-open',
      spreadsheet: 'bx bxs-spreadsheet',
      doc: 'bx bxs-file',
      word: 'bx bxs-file-doc',
      pdf: 'bx bxs-file-pdf',
      image: 'bx bxs-image',
      'google-link': 'bx bxl-google',
      file: 'bx bxs-file'
    };
    return map[kind] || map.file;
  }

  function normalizeRowIcon(row) {
    if (!row || row.nodeType !== 1) return;

    var kind = detectKind(row);
    var iconName = iconForKind(kind);

    var currentKind = row.getAttribute('data-icon-kind');
    var needsUpdate = (currentKind !== kind);

    row.querySelectorAll('.bm-folder-icon, .bm-folder-icon-lg').forEach(function (holder) {
      var currentHolderKind = holder.getAttribute('data-icon-kind');
      var iconEl = holder.querySelector('i');
      if (currentHolderKind !== kind || !iconEl || !iconEl.className.includes(iconName)) {
        needsUpdate = true;
      }
    });

    if (!needsUpdate) return;

    row.setAttribute('data-icon-kind', kind);

    row.querySelectorAll('.bm-folder-icon, .bm-folder-icon-lg').forEach(function (holder) {
      holder.setAttribute('data-icon-kind', kind);
      holder.innerHTML = '<i class="' + iconName + '"></i>';
    });
  }

  function normalizeAllIcons(scope) {
    var root = scope || document;
    root.querySelectorAll('[data-folder-row]').forEach(normalizeRowIcon);

    try {
      if (window.Iconify && typeof window.Iconify.scan === 'function') {
        window.Iconify.scan(root === document ? document.body : root);
      }
    } catch (error) { }
  }

  ready(function () {
    normalizeAllIcons(document);
    window.setTimeout(function () { normalizeAllIcons(document); }, 150);
    window.setTimeout(function () { normalizeAllIcons(document); }, 700);

    document.addEventListener('click', function () {
      window.setTimeout(function () { normalizeAllIcons(document); }, 80);
    }, true);

    var observer = new MutationObserver(function (mutations) {
      var shouldNormalize = mutations.some(function (mutation) {
        return mutation.addedNodes && mutation.addedNodes.length;
      });
      if (!shouldNormalize) return;
      window.clearTimeout(window.__bmColoredSingleContentIconTimer);
      window.__bmColoredSingleContentIconTimer = window.setTimeout(function () {
        normalizeAllIcons(document);
      }, 80);
    });

    try {
      observer.observe(document.body, { childList: true, subtree: true });
    } catch (error) { }
  });
})();


/* ===== APPENDED FROM siKOL ===== */
(() => {
  "use strict";

  const toast = document.getElementById("toast");

  function showToast(message) {
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toast.classList.remove("show");
    }, 2000);
  }

  /* ------------------------- Login ------------------------- */

  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    const username = document.getElementById("username");
    const password = document.getElementById("password");
    const rememberMe = document.getElementById("rememberMe");
    const loginMessage = document.getElementById("loginMessage");
    const togglePassword = document.getElementById("togglePassword");
    const forgotPassword = document.getElementById("forgotPassword");

    const rememberedUser = localStorage.getItem("bisaMediaRememberedUser");

    if (rememberedUser) {
      username.value = rememberedUser;
      rememberMe.checked = true;
    }

    togglePassword.addEventListener("click", () => {
      const isVisible = password.type === "text";

      password.type = isVisible ? "password" : "text";
      togglePassword.setAttribute(
        "aria-label",
        isVisible ? "Tampilkan password" : "Sembunyikan password"
      );
    });

    forgotPassword.addEventListener("click", () => {
      showToast("Fitur lupa password siap dihubungkan ke backend.");
    });

    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!username.value.trim()) {
        loginMessage.textContent = "Email / username wajib diisi.";
        username.focus();
        return;
      }

      if (!password.value) {
        loginMessage.textContent = "Password wajib diisi.";
        password.focus();
        return;
      }

      loginMessage.textContent = "";

      if (rememberMe.checked) {
        localStorage.setItem("bisaMediaRememberedUser", username.value.trim());
      } else {
        localStorage.removeItem("bisaMediaRememberedUser");
      }

      window.location.href = "dashboard.html";
    });
  }

  /* ----------------------- Dashboard ----------------------- */

  const sidebarToggle = document.getElementById("sidebarToggle");
  const logoutButton = document.getElementById("logoutButton");
  const monthSelect = document.getElementById("monthSelect");
  const menuSearch = document.getElementById("menuSearch");

  sidebarToggle?.addEventListener("click", () => {
    document.body.classList.toggle("sidebar-collapsed");
  });

  logoutButton?.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  monthSelect?.addEventListener("change", () => {
    showToast(`Dashboard bulan ${monthSelect.value}`);
  });

  // Load sidebar toggle state from localStorage
  document.querySelectorAll(".nav-group").forEach((group, index) => {
    const isCollapsed = localStorage.getItem(`nav-group-collapsed-${index}`);
    if (isCollapsed !== null) {
      if (isCollapsed === "true") {
        group.classList.add("is-collapsed");
      } else {
        group.classList.remove("is-collapsed");
      }
    }
  });

  document.querySelectorAll(".nav-group__toggle").forEach((button, index) => {
    button.addEventListener("click", () => {
      const group = button.closest(".nav-group");
      if (group) {
        group.classList.toggle("is-collapsed");
        const collapsed = group.classList.contains("is-collapsed");
        localStorage.setItem(`nav-group-collapsed-${index}`, collapsed);
      }
    });
  });

  // Load subgroup toggle state from localStorage
  document.querySelectorAll(".nav-subgroup").forEach((subgroup, index) => {
    const isCollapsed = localStorage.getItem(`nav-subgroup-collapsed-${index}`);
    if (isCollapsed !== null) {
      if (isCollapsed === "true") {
        subgroup.classList.add("is-collapsed");
      } else {
        subgroup.classList.remove("is-collapsed");
      }
    }
  });

  document.querySelectorAll(".nav-subgroup__toggle").forEach((button, index) => {
    button.addEventListener("click", () => {
      const subgroup = button.closest(".nav-subgroup");
      if (subgroup) {
        subgroup.classList.toggle("is-collapsed");
        const collapsed = subgroup.classList.contains("is-collapsed");
        localStorage.setItem(`nav-subgroup-collapsed-${index}`, collapsed);
      }
    });
  });

  // Reveal sidebar once state is fully restored on page load to prevent flicker
  document.getElementById("sidebar")?.classList.add("is-ready");

  document.querySelectorAll(".nav-group__items .nav-item").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#" || href.startsWith("#")) {
        event.preventDefault();
        showToast(`${link.textContent.trim()} dipilih`);
      }
    });
  });


  menuSearch?.addEventListener("input", () => {
    const keyword = menuSearch.value.trim().toLowerCase();

    document.querySelectorAll(".nav-group__items .nav-item").forEach((item) => {
      const matches = item.textContent.toLowerCase().includes(keyword);
      item.style.display = keyword === "" || matches ? "" : "none";
    });
  });

  /* ----------------------- Campaign Modal ----------------------- */
  const campaignModal = document.getElementById("campaignModal");
  const openModalBtn = document.querySelector(".btn-tambah");
  const closeModalBtn = document.getElementById("closeModal");
  const campaignForm = document.getElementById("campaignForm");

  if (campaignModal) {
    // Open modal
    openModalBtn?.addEventListener("click", () => {
      campaignModal.classList.add("is-active");
    });

    // Close modal
    closeModalBtn?.addEventListener("click", () => {
      campaignModal.classList.remove("is-active");
    });

    // Close modal when clicking on overlay background
    campaignModal.addEventListener("click", (e) => {
      if (e.target === campaignModal) {
        campaignModal.classList.remove("is-active");
      }
    });

    // Form submit
    campaignForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      showToast("Campaign berhasil ditambahkan");
      campaignModal.classList.remove("is-active");
      campaignForm.reset();
    });
  }

  /* ----------------------- Kreator Modal ----------------------- */
  const kreatorModal = document.getElementById("kreatorModal");
  const openKreatorModalBtn = document.querySelector(".btn-tambah");
  const closeKreatorModalBtn = document.getElementById("closeKreatorModal");
  const kreatorForm = document.getElementById("kreatorForm");
  const toggleKreatorPassword = document.getElementById("toggleKreatorPassword");
  const kreatorPassword = document.getElementById("kreatorPassword");

  if (kreatorModal) {
    // Open modal
    openKreatorModalBtn?.addEventListener("click", () => {
      kreatorModal.classList.add("is-active");
    });

    // Close modal
    closeKreatorModalBtn?.addEventListener("click", () => {
      kreatorModal.classList.remove("is-active");
    });

    // Close modal when clicking on overlay background
    kreatorModal.addEventListener("click", (e) => {
      if (e.target === kreatorModal) {
        kreatorModal.classList.remove("is-active");
      }
    });

    // Toggle password visibility
    toggleKreatorPassword?.addEventListener("click", () => {
      const isPassword = kreatorPassword.type === "password";
      kreatorPassword.type = isPassword ? "text" : "password";
    });

    // Form submit
    kreatorForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      showToast("Kreator berhasil ditambahkan");
      kreatorModal.classList.remove("is-active");
      kreatorForm.reset();
    });
  }

  /* ------------------- Performa Kreator Toggle View & Upload ------------------- */
  const btnTambahPerforma = document.getElementById("btnTambahPerforma");
  const tablePanel = document.getElementById("tablePanel");
  const formPanel = document.getElementById("formPanel");
  const pageHeading = document.getElementById("pageHeading");
  const performaForm = document.getElementById("performaForm");
  const fileUploadContainer = document.getElementById("fileUploadContainer");
  const performaFileInput = document.getElementById("performaFileInput");
  const previewBox = document.getElementById("previewBox");

  if (btnTambahPerforma && tablePanel && formPanel && performaForm) {
    // Toggle to Add Form view
    btnTambahPerforma.addEventListener("click", () => {
      tablePanel.style.display = "none";
      formPanel.style.display = "block";
      btnTambahPerforma.style.display = "none";
      if (pageHeading) {
        pageHeading.innerHTML = '<span style="font-weight: 700; font-style: normal; color: #17171a;">TAMBAH</span> Performa Kreator';
      }
    });

    // Handle Choose File click behavior
    fileUploadContainer?.addEventListener("click", () => {
      performaFileInput.click();
    });

    // Handle File input changes & Preview updates
    performaFileInput?.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        previewBox.innerHTML = `
          <div class="preview-file-info">
            <svg class="preview-file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <strong style="font-size: 15px; margin-top: 8px;">${file.name}</strong>
            <span style="font-size: 12px; color: var(--muted);">${(file.size / 1024).toFixed(1)} KB</span>
          </div>
        `;
      } else {
        previewBox.innerHTML = "";
      }
    });

    // Handle form submit
    performaForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Submit logic/feedback
      showToast("Performa Kreator berhasil ditambahkan");

      // Revert view to main dashboard table
      performaForm.reset();
      previewBox.innerHTML = "";
      formPanel.style.display = "none";
      tablePanel.style.display = "block";
      btnTambahPerforma.style.display = "";
      if (pageHeading) {
        pageHeading.innerHTML = "Performa Kreator";
      }
    });
  }

  /* ----------------------- Leads Kreator Modal ----------------------- */
  const leadsKreatorModal = document.getElementById("leadsKreatorModal");
  const btnTambahLeads = document.getElementById("btnTambahLeads");
  const closeLeadsKreatorModal = document.getElementById("closeLeadsKreatorModal");
  const leadsKreatorForm = document.getElementById("leadsKreatorForm");

  if (leadsKreatorModal) {
    // Open modal
    btnTambahLeads?.addEventListener("click", () => {
      leadsKreatorModal.classList.add("is-active");
    });

    // Close modal
    closeLeadsKreatorModal?.addEventListener("click", () => {
      leadsKreatorModal.classList.remove("is-active");
    });

    // Close modal when clicking on overlay background
    leadsKreatorModal.addEventListener("click", (e) => {
      if (e.target === leadsKreatorModal) {
        leadsKreatorModal.classList.remove("is-active");
      }
    });

    // Form submit
    leadsKreatorForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      showToast("Leads Kreator berhasil ditambahkan");
      leadsKreatorModal.classList.remove("is-active");
      leadsKreatorForm.reset();
    });
  }

  /* ---------------------- Leveling Kreator Modal ---------------------- */
  const levelingKreatorModal = document.getElementById("levelingKreatorModal");
  const btnTambahLeveling = document.getElementById("btnTambahLeveling");
  const closeLevelingKreatorModal = document.getElementById("closeLevelingKreatorModal");
  const levelingKreatorForm = document.getElementById("levelingKreatorForm");

  if (levelingKreatorModal) {
    // Open modal
    btnTambahLeveling?.addEventListener("click", () => {
      levelingKreatorModal.classList.add("is-active");
    });

    // Close modal
    closeLevelingKreatorModal?.addEventListener("click", () => {
      levelingKreatorModal.classList.remove("is-active");
    });

    // Close modal when clicking on overlay background
    levelingKreatorModal.addEventListener("click", (e) => {
      if (e.target === levelingKreatorModal) {
        levelingKreatorModal.classList.remove("is-active");
      }
    });

    // Form submit
    levelingKreatorForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      showToast("Leveling Kreator berhasil ditambahkan");
      levelingKreatorModal.classList.remove("is-active");
      levelingKreatorForm.reset();
    });
  }

  /* ------------------- Dashboard Filter Dropdown & Calendar Modal ------------------- */
  const filterCampaignDropdown = document.getElementById("filterCampaignDropdown");
  const btnFilterCampaign = document.getElementById("btnFilterCampaign");
  const filterCampaignForm = document.getElementById("filterCampaignForm");

  if (filterCampaignDropdown && btnFilterCampaign) {
    // Toggle popover on click
    btnFilterCampaign.addEventListener("click", (e) => {
      e.stopPropagation();
      filterCampaignDropdown.classList.toggle("is-active");
    });

    // Close popover when clicking elsewhere on the page
    document.addEventListener("click", (e) => {
      if (!filterCampaignDropdown.contains(e.target) && e.target !== btnFilterCampaign) {
        filterCampaignDropdown.classList.remove("is-active");
      }
    });

    // Submit Filter Form
    filterCampaignForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      showToast("Filter berhasil diterapkan");
      filterCampaignDropdown.classList.remove("is-active");
    });
  }

  const calendarCampaignModal = document.getElementById("calendarCampaignModal");
  const btnCalendarCampaign = document.getElementById("btnCalendarCampaign");
  const closeCalendarModal = document.getElementById("closeCalendarModal");
  const btnCancelCalendar = document.getElementById("btnCancelCalendar");
  const btnApplyCalendar = document.getElementById("btnApplyCalendar");

  if (calendarCampaignModal) {
    // Open Calendar Modal
    btnCalendarCampaign?.addEventListener("click", () => {
      calendarCampaignModal.classList.add("is-active");
    });

    // Close Calendar Modal
    closeCalendarModal?.addEventListener("click", () => {
      calendarCampaignModal.classList.remove("is-active");
    });

    btnCancelCalendar?.addEventListener("click", () => {
      calendarCampaignModal.classList.remove("is-active");
    });

    // Close when clicking overlay background
    calendarCampaignModal.addEventListener("click", (e) => {
      if (e.target === calendarCampaignModal) {
        calendarCampaignModal.classList.remove("is-active");
      }
    });

    // Apply Calendar Selection
    btnApplyCalendar?.addEventListener("click", () => {
      showToast("Periode tanggal berhasil diterapkan");
      calendarCampaignModal.classList.remove("is-active");
    });
  }

  /* ------------------- Export Excel Performa & Campaign ------------------- */
  const btnExportExcel = document.getElementById("btnExportExcel");
  if (btnExportExcel) {
    btnExportExcel.addEventListener("click", () => {
      const pageHeading = document.getElementById("pageHeading")?.innerText || "";

      let csvData = [];
      let filename = "export.csv";

      if (pageHeading.includes("Performa")) {
        filename = "performa_kreator.csv";
        csvData = [
          ["Tanggal", "Username", "GMV Afiliasi", "Pesanan Afiliasi", "Est Komisi"],
          ["11/08/2026", "kreator.kece", "Rp 50.000.000", "120", "Rp 5.000.000"],
          ["10/08/2026", "kreator.super", "Rp 75.000.000", "180", "Rp 7.500.000"],
          ["09/08/2026", "kreator.top", "Rp 120.000.000", "300", "Rp 12.000.000"]
        ];
      } else {
        filename = "campaign_data.csv";
        csvData = [
          ["Brand/Seller", "Kategori", "Kreator", "Jenis Campaign", "Tanggal"],
          ["Brand A", "Fashion", "Kreator A", "Live", "11/08/2026"],
          ["Brand B", "Beauty", "Kreator B", "Video", "10/08/2026"],
          ["Brand C", "Food", "Kreator C", "Live + Video", "09/08/2026"]
        ];
      }

      const csvContent = "data:text/csv;charset=utf-8,"
        + csvData.map(row => row.join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", filename);
      document.body.appendChild(link);

      link.click();
      document.body.removeChild(link);

      showToast("File Excel berhasil diunduh");
    });
  }

  /* ------------------- Milestone Actions ------------------- */
  const btnTambahMilestone = document.getElementById("btnTambahMilestone");
  btnTambahMilestone?.addEventListener("click", () => {
    showToast("Fitur Tambah Milestone siap dihubungkan ke backend.");
  });
})();

// Custom script notes for SpV KOL dropdown toggle verification (Added safely at the bottom)

