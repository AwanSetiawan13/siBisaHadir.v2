    (function () {
      'use strict';

      /* ===== LOCAL STORAGE KEY & INITIAL MOCK DATA ===== */
      const STORAGE_KEY = 'accounting_tagihan_berkala_v2';

      // Mock data aligned with exact 8 specification fields
      const initialMockData = [
        {
          id: 'TB-001',
          itemTagihan: 'Sewa Server Cloud AWS EC2',
          umurEkonomis: '1 Bulan',
          aksesTipe: 'Email',
          akses: 'aws-admin@bisamedia.id',
          harga: 4850000,
          tanggalBayar: '2026-11-05',
          jatuhTempo: '2026-12-05',
          status: 'Berlangganan',
          keterangan: 'Infrastruktur backend utama production & cluster database'
        },
        {
          id: 'TB-002',
          itemTagihan: 'Internet Dedicated Office Biznet',
          umurEkonomis: '1 Bulan',
          aksesTipe: 'Nomor',
          akses: '081298452001',
          harga: 3200000,
          tanggalBayar: '2026-10-18',
          jatuhTempo: '2026-11-18',
          status: 'Terlewat 1 - 7 Hari',
          keterangan: 'Koneksi internet dedicated 150 Mbps kantor pusat lt. 2'
        },
        {
          id: 'TB-003',
          itemTagihan: 'Google Workspace Enterprise',
          umurEkonomis: '3 Bulan',
          aksesTipe: 'Email',
          akses: 'billing@bisamedia.id',
          harga: 12150000,
          tanggalBayar: '2026-10-01',
          jatuhTempo: '2027-01-01',
          status: 'Berlangganan',
          keterangan: 'Email corporate, Google Drive & Meet 45 akun karyawan'
        },
        {
          id: 'TB-004',
          itemTagihan: 'Langganan Figma Organization',
          umurEkonomis: '6 Bulan',
          aksesTipe: 'Email',
          akses: 'design-lead@bisamedia.id',
          harga: 8400000,
          tanggalBayar: '2026-05-10',
          jatuhTempo: '2026-11-10',
          status: 'Berhenti Berlangganan',
          keterangan: 'Lisensi tools desain kolaborasi tim UI/UX & Creative'
        },
        {
          id: 'TB-005',
          itemTagihan: 'Zoom Workplace Pro Business',
          umurEkonomis: '2 Minggu',
          aksesTipe: 'Email',
          akses: 'zoom-admin@bisamedia.id',
          harga: 850000,
          tanggalBayar: '2026-11-15',
          jatuhTempo: '2026-11-29',
          status: 'Berlangganan',
          keterangan: 'Akun premium video conference meeting klien & internal'
        },
        {
          id: 'TB-006',
          itemTagihan: 'Sewa Gedung & Ruang Kantor Lt. 2',
          umurEkonomis: '6 Bulan',
          aksesTipe: 'Lainnya',
          akses: 'Pengelola Gedung Wisma Bisa Lt. 2',
          harga: 45000000,
          tanggalBayar: '2026-05-30',
          jatuhTempo: '2026-11-30',
          status: 'Berlangganan',
          keterangan: 'Biaya sewa operasional ruang kantor lt. 2 dan sinking fund'
        },
        {
          id: 'TB-007',
          itemTagihan: 'Langganan API SMS Gateway & OTP',
          umurEkonomis: '2 Minggu',
          aksesTipe: 'Nomor',
          akses: '085711223344',
          harga: 650000,
          tanggalBayar: '2026-11-03',
          jatuhTempo: '2026-11-17',
          status: 'Terlewat 1 - 7 Hari',
          keterangan: 'Saldo broadcast SMS notifikasi & kode OTP aplikasi'
        },
        {
          id: 'TB-008',
          itemTagihan: 'Sewa SSL EV Wildcard Security',
          umurEkonomis: 'Costom',
          umurEkonomisCustomDays: 45,
          aksesTipe: 'Lainnya',
          akses: 'Sectigo Portal ID: 44921-SEC',
          harga: 2750000,
          tanggalBayar: '2026-09-20',
          jatuhTempo: '2026-11-04',
          status: 'Berhenti Berlangganan',
          keterangan: 'Sertifikat SSL EV enkripsi perbankan web aplikasi'
        }
      ];

      function loadData() {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return parsed;
            }
          }
        } catch (e) {
          console.error('Error loading data from localStorage', e);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMockData));
        return initialMockData;
      }

      function saveData(data) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
          console.error('Error saving data to localStorage', e);
        }
      }

      let dataList = loadData();

      /* ===== STATE VARIABLES ===== */
      let currentPage = 1;
      let perPage = 10;
      let filters = {
        search: '',
        umurEkonomis: '',
        status: '',
        startDate: '',
        endDate: ''
      };

      let activeActionId = null;

      /* ===== DOM REFERENCES ===== */
      const cardTotalTagihan = document.getElementById('cardTotalTagihan');
      const cardTerbayar = document.getElementById('cardTerbayar');
      const cardJatuhTempo = document.getElementById('cardJatuhTempo');
      const cardTotalBiaya = document.getElementById('cardTotalBiaya');

      const searchInput = document.getElementById('searchInput');
      const searchClearBtn = document.getElementById('searchClearBtn');
      const perPageSelect = document.getElementById('perPageSelect');

      const btnFilterTb = document.getElementById('btnFilterTb');
      const filterTbDropdown = document.getElementById('filterTbDropdown');
      const filterUmurEkonomis = document.getElementById('filterUmurEkonomis');
      const filterStatus = document.getElementById('filterStatus');
      const applyFilterTb = document.getElementById('applyFilterTb');
      const resetFilterTb = document.getElementById('resetFilterTb');

      const btnCalendarTb = document.getElementById('btnCalendarTb');
      const calendarTbDropdown = document.getElementById('calendarTbDropdown');
      const btnApplyCalendarTb = document.getElementById('btnApplyCalendarTb');
      const btnCancelCalendarTb = document.getElementById('btnCancelCalendarTb');
      const calendarSelectedText = document.getElementById('tbCalSelectedText');

      const tbNavPrevYear = document.getElementById('tbCalPrevYear');
      const tbNavPrevMonth = document.getElementById('tbCalPrevMonth');
      const tbNavNextMonth = document.getElementById('tbCalNextMonth');
      const tbNavNextYear = document.getElementById('tbCalNextYear');

      const tableBody = document.getElementById('tbTableBody');
      const paginationInfo = document.getElementById('paginationInfo');
      const paginationControls = document.getElementById('paginationControls');

      const btnTambahTagihan = document.getElementById('btnTambahTagihan');
      const btnExportExcel = document.getElementById('btnExportTb');
      const btnPrintTable = document.getElementById('btnPrintTable');

      // Modals
      const tbFormModal = document.getElementById('tbFormModal');
      const tbForm = document.getElementById('tbForm');
      const tbFormActionText = document.getElementById('tbFormActionText');
      const editIndex = document.getElementById('editIndex');

      const formItemTagihan = document.getElementById('formItemTagihan');
      const formUmurEkonomis = document.getElementById('formUmurEkonomis');
      const formUmurEkonomisCustomWrap = document.getElementById('formUmurEkonomisCustomWrap');
      const formUmurEkonomisCustomDays = document.getElementById('formUmurEkonomisCustomDays');
      const formAksesType = document.getElementById('formAksesType');
      const formAksesValueLabel = document.getElementById('formAksesValueLabel');
      const formAksesValue = document.getElementById('formAksesValue');
      const formHarga = document.getElementById('formHarga');
      const formTanggalBayar = document.getElementById('formTanggalBayar');
      const formJatuhTempo = document.getElementById('formJatuhTempo');
      const formStatus = document.getElementById('formStatus');
      const formKeterangan = document.getElementById('formKeterangan');

      const tbViewModal = document.getElementById('tbViewModal');
      const detailContainer = document.getElementById('detailContainer');

      const actionMenuPopover = document.getElementById('tbActionMenu');
      const actionView = document.getElementById('actionView');
      const actionEdit = document.getElementById('actionEdit');
      const actionDelete = document.getElementById('actionDelete');

      /* ===== HELPER FUNCTIONS ===== */
      function escapeHtml(text) {
        if (!text) return '';
        return String(text)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      }

      function formatRupiah(num) {
        const val = Number(num) || 0;
        return 'Rp. ' + val.toLocaleString('id-ID');
      }

      function formatDateIndo(dateStr) {
        if (!dateStr) return '-';
        const parts = String(dateStr).split('-');
        if (parts.length !== 3) return dateStr;
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        const months = [
          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        return d + ' ' + (months[m] || '') + ' ' + y;
      }

      /* ===== AUTO CALCULATION LOGIC ===== */
      // 1. Calculate Jatuh Tempo = Tanggal Bayar + Umur Ekonomis
      function calculateJatuhTempo(tanggalBayarStr, umurEkonomis, customDays) {
        if (!tanggalBayarStr || !umurEkonomis) return '';
        const base = new Date(tanggalBayarStr + 'T00:00:00');
        if (isNaN(base.getTime())) return '';

        const result = new Date(base);
        if (umurEkonomis === '2 Minggu') {
          result.setDate(result.getDate() + 14);
        } else if (umurEkonomis === '1 Bulan') {
          result.setMonth(result.getMonth() + 1);
        } else if (umurEkonomis === '3 Bulan') {
          result.setMonth(result.getMonth() + 3);
        } else if (umurEkonomis === '6 Bulan') {
          result.setMonth(result.getMonth() + 6);
        } else if (umurEkonomis === 'Costom') {
          const days = parseInt(customDays, 10);
          if (!isNaN(days) && days > 0) {
            result.setDate(result.getDate() + days);
          } else {
            return '';
          }
        }

        const yyyy = result.getFullYear();
        const mm = String(result.getMonth() + 1).padStart(2, '0');
        const dd = String(result.getDate()).padStart(2, '0');
        return yyyy + '-' + mm + '-' + dd;
      }

      // 2. Calculate Status = based on Jatuh Tempo vs Current Date
      // Belum Jatuh Tempo -> Berlangganan
      // Lewat 1 - 7 Hari -> Terlewat 1 - 7 Hari
      // Lewat > 7 Hari -> Berhenti Berlangganan
      function calculateStatus(jatuhTempoStr) {
        if (!jatuhTempoStr) return 'Berlangganan';
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const due = new Date(jatuhTempoStr + 'T00:00:00');
        if (isNaN(due.getTime())) return 'Berlangganan';

        const diffTime = today.getTime() - due.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
          return 'Berlangganan';
        } else if (diffDays >= 1 && diffDays <= 7) {
          return 'Terlewat 1 - 7 Hari';
        } else {
          return 'Berhenti Berlangganan';
        }
      }

      function recalcJatuhTempoAndStatus() {
        const tgl = formTanggalBayar.value;
        const umur = formUmurEkonomis.value;
        const custom = formUmurEkonomisCustomDays ? formUmurEkonomisCustomDays.value : '';
        const due = calculateJatuhTempo(tgl, umur, custom);
        if (due) {
          formJatuhTempo.value = due;
          formStatus.value = calculateStatus(due);
        }
      }

      function renderStatusBadge(status) {
        const s = (status || '').toLowerCase();
        let cls = 'badge-berlangganan';
        let text = 'Berlangganan';

        if (s.includes('terlewat') || s.includes('1 - 7') || s.includes('1-7') || s.includes('menjelang')) {
          cls = 'badge-terlewat';
          text = 'Terlewat 1 - 7 Hari';
        } else if (s.includes('berhenti') || s.includes('lewat') || s.includes('terlambat')) {
          cls = 'badge-berhenti';
          text = 'Berhenti Berlangganan';
        } else {
          cls = 'badge-berlangganan';
          text = 'Berlangganan';
        }

        return '<span class="pnd-status-badge ' + cls + '">' + escapeHtml(text) + '</span>';
      }

      /* ===== UPDATE KPI CARDS ===== */
      function updateKpis() {
        const total = dataList.length;
        let totalBiaya = 0;
        let berlanggananCount = 0;
        let terlewatCount = 0;

        dataList.forEach(item => {
          totalBiaya += Number(item.harga) || 0;
          const currentStatus = item.status || calculateStatus(item.jatuhTempo);
          const s = currentStatus.toLowerCase();
          if (s.includes('terlewat') || s.includes('1 - 7') || s.includes('1-7')) {
            terlewatCount++;
          } else if (s.includes('berlangganan') && !s.includes('berhenti')) {
            berlanggananCount++;
          }
        });

        if (cardTotalTagihan) cardTotalTagihan.textContent = total;
        if (cardTotalBiaya) cardTotalBiaya.textContent = formatRupiah(totalBiaya);
        if (cardTerbayar) cardTerbayar.textContent = berlanggananCount;
        if (cardJatuhTempo) cardJatuhTempo.textContent = terlewatCount;
      }

      /* ===== FILTERING & RENDERING ===== */
      function getFilteredData() {
        const q = (filters.search || '').trim().toLowerCase();

        return dataList.filter(item => {
          if (q) {
            const matchSearch =
              (item.itemTagihan || '').toLowerCase().includes(q) ||
              (item.keterangan || '').toLowerCase().includes(q) ||
              (item.akses || '').toLowerCase().includes(q) ||
              (item.aksesTipe || '').toLowerCase().includes(q) ||
              (item.umurEkonomis || '').toLowerCase().includes(q);
            if (!matchSearch) return false;
          }

          if (filters.umurEkonomis && item.umurEkonomis !== filters.umurEkonomis) return false;

          if (filters.status) {
            const currentStatus = item.status || calculateStatus(item.jatuhTempo);
            const s = currentStatus.toLowerCase();
            const f = filters.status.toLowerCase();

            if (f === 'berlangganan' && (!s.includes('berlangganan') || s.includes('berhenti'))) return false;
            if (f.includes('terlewat') && !s.includes('terlewat') && !s.includes('1 - 7')) return false;
            if (f.includes('berhenti') && !s.includes('berhenti')) return false;
          }

          if (filters.startDate) {
            const tBayar = item.tanggalBayar || '';
            const jTempo = item.jatuhTempo || '';
            const matchDate = (tBayar && tBayar >= filters.startDate) || (jTempo && jTempo >= filters.startDate);
            if (!matchDate) return false;
          }
          if (filters.endDate) {
            const tBayar = item.tanggalBayar || '';
            const jTempo = item.jatuhTempo || '';
            const matchDate = (tBayar && tBayar <= filters.endDate) || (jTempo && jTempo <= filters.endDate);
            if (!matchDate) return false;
          }

          return true;
        });
      }

      function renderTable() {
        if (!tableBody) return;
        tableBody.innerHTML = '';

        const filtered = getFilteredData();
        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / perPage) || 1;

        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        const startIndex = (currentPage - 1) * perPage;
        const endIndex = Math.min(startIndex + perPage, totalItems);
        const pageData = filtered.slice(startIndex, endIndex);

        if (pageData.length === 0) {
          tableBody.innerHTML = '<tr><td colspan="10" class="pnd-empty-cell">Tidak ada data tagihan berkala yang sesuai.</td></tr>';
          if (paginationInfo) paginationInfo.textContent = 'Menampilkan 0-0 dari 0 data';
          if (paginationControls) paginationControls.innerHTML = '';
          updateKpis();
          return;
        }

        pageData.forEach((item, idx) => {
          const rowNumber = startIndex + idx + 1;
          const tr = document.createElement('tr');

          // Akses visual formatting with badge
          const aksesBadge = item.aksesTipe ? ('<span style="display: inline-block; font-size: 10.5px; padding: 1px 6px; border-radius: 4px; background: #f1f5f9; color: #475569; margin-right: 5px; font-weight: 500;">' + escapeHtml(item.aksesTipe) + '</span>') : '';
          const aksesDisplay = aksesBadge + '<span style="color: #0284c7; font-weight: 500;">' + escapeHtml(item.akses || '-') + '</span>';

          // Umur display
          const umurDisplay = escapeHtml(item.umurEkonomis || '-') + (item.umurEkonomis === 'Costom' && item.umurEkonomisCustomDays ? (' (' + item.umurEkonomisCustomDays + ' Hari)') : '');

          // Realtime auto status if not explicitly set
          const displayStatus = item.status || calculateStatus(item.jatuhTempo);

          tr.innerHTML = [
            '<td style="text-align: center; color: #64748b; font-style: italic;">' + rowNumber + '.</td>',
            '<td class="pnd-cell-italic" style="color: #0f172a; font-weight: 600; white-space: nowrap;">' + escapeHtml(item.itemTagihan || '-') + '</td>',
            '<td class="pnd-cell-italic" style="white-space: nowrap;">' + umurDisplay + '</td>',
            '<td class="pnd-cell-italic" style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="' + escapeHtml(item.akses || '') + '">' + aksesDisplay + '</td>',
            '<td class="pnd-cell-italic" style="text-align: right; color: #16a34a; font-weight: 700; white-space: nowrap;">' + formatRupiah(item.harga) + '</td>',
            '<td class="pnd-cell-italic" style="text-align: center; white-space: nowrap;">' + formatDateIndo(item.tanggalBayar) + '</td>',
            '<td class="pnd-cell-italic" style="text-align: center; white-space: nowrap; color: #b45309; font-weight: 500;">' + formatDateIndo(item.jatuhTempo) + '</td>',
            '<td style="text-align: center; white-space: nowrap;">' + renderStatusBadge(displayStatus) + '</td>',
            '<td class="pnd-cell-italic" style="max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="' + escapeHtml(item.keterangan || '') + '">' + escapeHtml(item.keterangan || '-') + '</td>',
            '<td class="col-sticky-action" style="text-align: center;">' +
            '<button type="button" class="pnd-action-btn" data-action-toggle="' + escapeHtml(item.id) + '" aria-label="Menu Aksi" title="Opsi">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="2"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="12" cy="19" r="2"></circle></svg>' +
            '</button>' +
            '</td>'
          ].join('');

          tableBody.appendChild(tr);
        });

        if (paginationInfo) paginationInfo.textContent = 'Menampilkan ' + (startIndex + 1) + '-' + endIndex + ' dari ' + totalItems + ' data';
        renderPaginationControls(totalPages);
        updateKpis();
      }

      function renderPaginationControls(totalPages) {
        if (!paginationControls) return;
        paginationControls.innerHTML = '';

        if (totalPages <= 1) return;

        // Prev Button
        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'pnd-page-btn';
        prevBtn.innerHTML = '&laquo;';
        prevBtn.disabled = currentPage === 1;
        prevBtn.addEventListener('click', function () {
          if (currentPage > 1) {
            currentPage--;
            renderTable();
          }
        });
        paginationControls.appendChild(prevBtn);

        // Page Numbers
        for (let i = 1; i <= totalPages; i++) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'pnd-page-btn' + (i === currentPage ? ' is-active' : '');
          btn.textContent = i;
          btn.addEventListener('click', (function (page) {
            return function () {
              currentPage = page;
              renderTable();
            };
          })(i));
          paginationControls.appendChild(btn);
        }

        // Next Button
        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'pnd-page-btn';
        nextBtn.innerHTML = '&raquo;';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.addEventListener('click', function () {
          if (currentPage < totalPages) {
            currentPage++;
            renderTable();
          }
        });
        paginationControls.appendChild(nextBtn);
      }

      /* ===== POPOVER & EVENT HANDLERS ===== */
      function closeAllPopovers() {
        if (filterTbDropdown) filterTbDropdown.classList.remove('is-active');
        if (calendarTbDropdown) calendarTbDropdown.classList.remove('is-active');
        if (actionMenuPopover) actionMenuPopover.classList.remove('is-active');
      }

      document.addEventListener('click', function (e) {
        if (filterTbDropdown && !filterTbDropdown.contains(e.target) && btnFilterTb && !btnFilterTb.contains(e.target)) {
          filterTbDropdown.classList.remove('is-active');
        }
        if (calendarTbDropdown && !calendarTbDropdown.contains(e.target) && btnCalendarTb && !btnCalendarTb.contains(e.target)) {
          calendarTbDropdown.classList.remove('is-active');
        }
        if (actionMenuPopover && !actionMenuPopover.contains(e.target) && !e.target.closest('[data-action-toggle]')) {
          actionMenuPopover.classList.remove('is-active');
        }
      });

      // Search
      if (searchInput) {
        searchInput.addEventListener('input', function () {
          filters.search = this.value;
          if (searchClearBtn) {
            if (this.value) {
              searchClearBtn.classList.add('is-visible');
            } else {
              searchClearBtn.classList.remove('is-visible');
            }
          }
          currentPage = 1;
          renderTable();
        });
      }

      if (searchClearBtn && searchInput) {
        searchClearBtn.addEventListener('click', function () {
          searchInput.value = '';
          filters.search = '';
          searchClearBtn.classList.remove('is-visible');
          currentPage = 1;
          renderTable();
        });
      }

      // Per Page
      if (perPageSelect) {
        perPageSelect.addEventListener('change', function () {
          perPage = parseInt(this.value, 10) || 10;
          currentPage = 1;
          renderTable();
        });
      }

      // Filter Popover
      if (btnFilterTb && filterTbDropdown) {
        btnFilterTb.addEventListener('click', function (e) {
          e.stopPropagation();
          const isActive = filterTbDropdown.classList.contains('is-active');
          closeAllPopovers();
          if (!isActive) {
            filterTbDropdown.classList.add('is-active');
          }
        });
      }

      if (applyFilterTb && filterTbDropdown) {
        applyFilterTb.addEventListener('click', function () {
          if (filterUmurEkonomis) filters.umurEkonomis = filterUmurEkonomis.value;
          if (filterStatus) filters.status = filterStatus.value;
          currentPage = 1;
          filterTbDropdown.classList.remove('is-active');
          renderTable();
        });
      }

      if (resetFilterTb && filterTbDropdown) {
        resetFilterTb.addEventListener('click', function () {
          if (filterUmurEkonomis) filterUmurEkonomis.value = '';
          if (filterStatus) filterStatus.value = '';
          filters.umurEkonomis = '';
          filters.status = '';
          currentPage = 1;
          filterTbDropdown.classList.remove('is-active');
          renderTable();
        });
      }

      /* ===== CALENDAR FILTER SETUP ===== */
      let calViewYear = 2026;
      let calViewMonth = 10; // November (0-based)
      let calTempStart = null;
      let calTempEnd = null;

      function formatYMD(y, m, d) {
        const mm = String(m + 1).padStart(2, '0');
        const dd = String(d).padStart(2, '0');
        return y + '-' + mm + '-' + dd;
      }

      function updateCalendarSelectedText() {
        if (!calendarSelectedText) return;
        if (!calTempStart && !calTempEnd) {
          calendarSelectedText.textContent = '-';
        } else if (calTempStart && !calTempEnd) {
          calendarSelectedText.textContent = formatDateIndo(calTempStart) + ' - Pilih akhir';
        } else if (calTempStart && calTempEnd) {
          calendarSelectedText.textContent = formatDateIndo(calTempStart) + ' - ' + formatDateIndo(calTempEnd);
        }
      }

      function renderCalendarMonth(containerId, titleId, year, month) {
        const container = document.getElementById(containerId);
        const titleEl = document.getElementById(titleId);
        if (!container || !titleEl) return;

        const monthNames = [
          '01', '02', '03', '04', '05', '06',
          '07', '08', '09', '10', '11', '12'
        ];
        titleEl.textContent = year + ' - ' + monthNames[month];

        container.innerHTML = '';

        const firstDay = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
        const totalDays = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
          const empty = document.createElement('div');
          empty.className = 'pnd-cal-day empty';
          container.appendChild(empty);
        }

        for (let d = 1; d <= totalDays; d++) {
          const cell = document.createElement('div');
          cell.className = 'pnd-cal-day';
          cell.textContent = d;
          const ymd = formatYMD(year, month, d);

          if (calTempStart && ymd === calTempStart) {
            cell.classList.add('is-start');
          }
          if (calTempEnd && ymd === calTempEnd) {
            cell.classList.add('is-end');
          }
          if (calTempStart && calTempEnd && ymd > calTempStart && ymd < calTempEnd) {
            cell.classList.add('in-range');
          }

          cell.addEventListener('click', function (e) {
            e.stopPropagation();
            if (!calTempStart || (calTempStart && calTempEnd)) {
              calTempStart = ymd;
              calTempEnd = null;
            } else if (calTempStart && !calTempEnd) {
              if (ymd < calTempStart) {
                calTempEnd = calTempStart;
                calTempStart = ymd;
              } else {
                calTempEnd = ymd;
              }
            }
            updateCalendarSelectedText();
            renderDualCalendar();
          });

          container.appendChild(cell);
        }
      }

      function renderDualCalendar() {
        renderCalendarMonth('tbCalGridLeft', 'tbCalTitleLeft', calViewYear, calViewMonth);
        let nextM = calViewMonth + 1;
        let nextY = calViewYear;
        if (nextM > 11) {
          nextM = 0;
          nextY++;
        }
        renderCalendarMonth('tbCalGridRight', 'tbCalTitleRight', nextY, nextM);
      }

      if (tbNavPrevYear) tbNavPrevYear.addEventListener('click', function (e) { e.stopPropagation(); calViewYear--; renderDualCalendar(); });
      if (tbNavNextYear) tbNavNextYear.addEventListener('click', function (e) { e.stopPropagation(); calViewYear++; renderDualCalendar(); });
      if (tbNavPrevMonth) tbNavPrevMonth.addEventListener('click', function (e) {
        e.stopPropagation();
        calViewMonth--;
        if (calViewMonth < 0) {
          calViewMonth = 11;
          calViewYear--;
        }
        renderDualCalendar();
      });
      if (tbNavNextMonth) tbNavNextMonth.addEventListener('click', function (e) {
        e.stopPropagation();
        calViewMonth++;
        if (calViewMonth > 11) {
          calViewMonth = 0;
          calViewYear++;
        }
        renderDualCalendar();
      });

      document.querySelectorAll('#calendarTbDropdown .pnd-cal-preset-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          const preset = this.getAttribute('data-preset');
          document.querySelectorAll('#calendarTbDropdown .pnd-cal-preset-btn').forEach(function (b) { b.classList.remove('is-active'); });
          this.classList.add('is-active');

          const now = new Date(2026, 10, 21);
          if (preset === 'today') {
            calTempStart = formatYMD(now.getFullYear(), now.getMonth(), now.getDate());
            calTempEnd = calTempStart;
          } else if (preset === 'yesterday') {
            const y = new Date(now);
            y.setDate(y.getDate() - 1);
            calTempStart = formatYMD(y.getFullYear(), y.getMonth(), y.getDate());
            calTempEnd = calTempStart;
          } else if (preset === 'last7') {
            const past7 = new Date(now);
            past7.setDate(past7.getDate() - 6);
            calTempStart = formatYMD(past7.getFullYear(), past7.getMonth(), past7.getDate());
            calTempEnd = formatYMD(now.getFullYear(), now.getMonth(), now.getDate());
          } else if (preset === 'last30') {
            const past30 = new Date(now);
            past30.setDate(past30.getDate() - 29);
            calTempStart = formatYMD(past30.getFullYear(), past30.getMonth(), past30.getDate());
            calTempEnd = formatYMD(now.getFullYear(), now.getMonth(), now.getDate());
          } else if (preset === 'last3m') {
            const past3m = new Date(now);
            past3m.setMonth(past3m.getMonth() - 2);
            calTempStart = formatYMD(past3m.getFullYear(), past3m.getMonth(), 1);
            calTempEnd = formatYMD(now.getFullYear(), now.getMonth(), now.getDate());
          } else if (preset === 'last6m') {
            const past6m = new Date(now);
            past6m.setMonth(past6m.getMonth() - 5);
            calTempStart = formatYMD(past6m.getFullYear(), past6m.getMonth(), 1);
            calTempEnd = formatYMD(now.getFullYear(), now.getMonth(), now.getDate());
          } else if (preset === 'last12m') {
            const past12m = new Date(now);
            past12m.setMonth(past12m.getMonth() - 11);
            calTempStart = formatYMD(past12m.getFullYear(), past12m.getMonth(), 1);
            calTempEnd = formatYMD(now.getFullYear(), now.getMonth(), now.getDate());
          }
          updateCalendarSelectedText();
          renderDualCalendar();
        });
      });

      if (btnCalendarTb && calendarTbDropdown) {
        btnCalendarTb.addEventListener('click', function (e) {
          e.stopPropagation();
          const isActive = calendarTbDropdown.classList.contains('is-active');
          closeAllPopovers();
          if (!isActive) {
            calTempStart = filters.startDate || null;
            calTempEnd = filters.endDate || null;
            updateCalendarSelectedText();
            renderDualCalendar();
            calendarTbDropdown.classList.add('is-active');
          }
        });
      }

      if (btnApplyCalendarTb && calendarTbDropdown) {
        btnApplyCalendarTb.addEventListener('click', function () {
          filters.startDate = calTempStart || '';
          filters.endDate = calTempEnd || '';
          calendarTbDropdown.classList.remove('is-active');
          currentPage = 1;
          renderTable();
        });
      }

      if (btnCancelCalendarTb && calendarTbDropdown) {
        btnCancelCalendarTb.addEventListener('click', function () {
          calTempStart = null;
          calTempEnd = null;
          filters.startDate = '';
          filters.endDate = '';
          calendarTbDropdown.classList.remove('is-active');
          currentPage = 1;
          renderTable();
        });
      }

      /* ===== EXPORT & PRINT ===== */
      function exportToExcel() {
        const filtered = getFilteredData();
        if (filtered.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Tidak Ada Data',
            text: 'Tidak ada data tagihan berkala untuk diekspor.',
            confirmButtonColor: '#0076C5'
          });
          return;
        }

        const headers = [
          'No.',
          'Item Tagihan',
          'Umur Ekonomis',
          'Akses (Tipe)',
          'Detail Akses',
          'Harga',
          'Tanggal Bayar',
          'Jatuh Tempo',
          'Status',
          'Keterangan'
        ];

        const rows = filtered.map(function (item, idx) {
          return [
            idx + 1,
            item.itemTagihan || '',
            item.umurEkonomis || '',
            item.aksesTipe || '',
            item.akses || '',
            item.harga || 0,
            item.tanggalBayar || '',
            item.jatuhTempo || '',
            item.status || calculateStatus(item.jatuhTempo),
            item.keterangan || ''
          ];
        });

        if (typeof window.exportBisaExcel === 'function') {
          window.exportBisaExcel({
            title: 'Data Tagihan Berkala',
            filename: 'Laporan_Tagihan_Berkala.xlsx',
            headers: headers,
            rows: rows
          });
        } else {
          let tableHtml = '<table border="1"><thead><tr>';
          headers.forEach(function (h) { tableHtml += '<th style="background:#0076C5;color:#fff;">' + h + '</th>'; });
          tableHtml += '</tr></thead><tbody>';
          rows.forEach(function (r) {
            tableHtml += '<tr>';
            r.forEach(function (c) { tableHtml += '<td>' + String(c).replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</td>'; });
            tableHtml += '</tr>';
          });
          tableHtml += '</tbody></table>';

          const blob = new Blob(['\uFEFF' + tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'Laporan_Tagihan_Berkala.xls';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }

      if (btnExportExcel) {
        btnExportExcel.addEventListener('click', exportToExcel);
      }
      if (btnPrintTable) {
        btnPrintTable.addEventListener('click', function () {
          window.print();
        });
      }

      /* ===== ROW ACTION BUTTONS & POPOVER ===== */
      document.addEventListener('click', function (e) {
        const toggleBtn = e.target.closest('[data-action-toggle]');
        if (toggleBtn) {
          e.stopPropagation();
          const itemId = toggleBtn.getAttribute('data-action-toggle');
          if (actionMenuPopover && actionMenuPopover.classList.contains('is-active') && activeActionId === itemId) {
            actionMenuPopover.classList.remove('is-active');
            activeActionId = null;
            return;
          }

          activeActionId = itemId;
          closeAllPopovers();

          if (actionMenuPopover) {
            const rect = toggleBtn.getBoundingClientRect();
            const popoverWidth = 140;
            let left = rect.left - popoverWidth + 30;
            let top = rect.bottom + 6;

            if (left < 10) left = 10;
            if (top + 120 > window.innerHeight) {
              top = rect.top - 120;
            }

            actionMenuPopover.style.position = 'fixed';
            actionMenuPopover.style.top = top + 'px';
            actionMenuPopover.style.left = left + 'px';
            actionMenuPopover.style.zIndex = '9999';
            actionMenuPopover.classList.add('is-active');
          }
        }
      });

      // View Detail
      if (actionView) {
        actionView.addEventListener('click', function () {
          closeAllPopovers();
          if (!activeActionId) return;
          const item = dataList.find(function (d) { return d.id === activeActionId; });
          if (!item) return;

          const displayStatus = item.status || calculateStatus(item.jatuhTempo);

          if (detailContainer) {
            detailContainer.innerHTML = [
              '<div class="pnd-detail-item col-full">',
              '<span class="pnd-detail-label">Item Tagihan</span>',
              '<span class="pnd-detail-value" style="color: #0076C5; font-size: 15px; font-weight: 600;">' + escapeHtml(item.itemTagihan || '-') + '</span>',
              '</div>',
              '<div class="pnd-detail-item">',
              '<span class="pnd-detail-label">Umur Ekonomis</span>',
              '<span class="pnd-detail-value">' + escapeHtml(item.umurEkonomis || '-') + (item.umurEkonomis === 'Costom' && item.umurEkonomisCustomDays ? (' (' + item.umurEkonomisCustomDays + ' Hari)') : '') + '</span>',
              '</div>',
              '<div class="pnd-detail-item">',
              '<span class="pnd-detail-label">Akses</span>',
              '<span class="pnd-detail-value" style="color: #0284c7;">',
              (item.aksesTipe ? ('<span style="font-size: 11px; background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; margin-right: 6px;">' + escapeHtml(item.aksesTipe) + '</span>') : ''),
              escapeHtml(item.akses || '-'),
              '</span>',
              '</div>',
              '<div class="pnd-detail-item">',
              '<span class="pnd-detail-label">Harga</span>',
              '<span class="pnd-detail-value" style="color: #16a34a; font-size: 15px; font-weight: 700;">' + formatRupiah(item.harga) + '</span>',
              '</div>',
              '<div class="pnd-detail-item">',
              '<span class="pnd-detail-label">Tanggal Bayar</span>',
              '<span class="pnd-detail-value">' + formatDateIndo(item.tanggalBayar) + '</span>',
              '</div>',
              '<div class="pnd-detail-item">',
              '<span class="pnd-detail-label">Jatuh Tempo</span>',
              '<span class="pnd-detail-value" style="color: #b45309; font-weight: 600;">' + formatDateIndo(item.jatuhTempo) + '</span>',
              '</div>',
              '<div class="pnd-detail-item">',
              '<span class="pnd-detail-label">Status Tagihan</span>',
              '<span class="pnd-detail-value">' + renderStatusBadge(displayStatus) + '</span>',
              '</div>',
              '<div class="pnd-detail-item col-full">',
              '<span class="pnd-detail-label">Keterangan</span>',
              '<span class="pnd-detail-value" style="font-weight: 400; color: #334155; white-space: pre-line;">' + escapeHtml(item.keterangan || '-') + '</span>',
              '</div>'
            ].join('');
          }

          if (tbViewModal) tbViewModal.classList.add('is-active');
        });
      }

      // Edit Item
      if (actionEdit) {
        actionEdit.addEventListener('click', function () {
          closeAllPopovers();
          if (!activeActionId) return;
          const idx = dataList.findIndex(function (d) { return d.id === activeActionId; });
          if (idx === -1) return;
          const item = dataList[idx];

          if (tbFormActionText) tbFormActionText.textContent = 'Edit';
          if (editIndex) editIndex.value = idx;

          if (formItemTagihan) formItemTagihan.value = item.itemTagihan || '';
          if (formUmurEkonomis) formUmurEkonomis.value = item.umurEkonomis || '1 Bulan';

          if (item.umurEkonomis === 'Costom') {
            if (formUmurEkonomisCustomWrap) formUmurEkonomisCustomWrap.style.display = 'block';
            if (formUmurEkonomisCustomDays) {
              formUmurEkonomisCustomDays.value = item.umurEkonomisCustomDays || '';
              formUmurEkonomisCustomDays.setAttribute('required', 'required');
            }
          } else {
            if (formUmurEkonomisCustomWrap) formUmurEkonomisCustomWrap.style.display = 'none';
            if (formUmurEkonomisCustomDays) {
              formUmurEkonomisCustomDays.value = '';
              formUmurEkonomisCustomDays.removeAttribute('required');
            }
          }

          const tipe = item.aksesTipe || (item.akses && item.akses.includes('@') ? 'Email' : 'Lainnya');
          if (formAksesType) formAksesType.value = tipe;
          if (formAksesValue && formAksesValueLabel) {
            if (tipe === 'Email') {
              formAksesValue.type = 'email';
              formAksesValue.placeholder = 'nama@perusahaan.com';
              formAksesValueLabel.innerHTML = 'Detail Akses (Email) <span style="color:#ef4444;">*</span>';
            } else if (tipe === 'Nomor') {
              formAksesValue.type = 'tel';
              formAksesValue.placeholder = 'Contoh: 081234567890';
              formAksesValueLabel.innerHTML = 'Detail Akses (Nomor) <span style="color:#ef4444;">*</span>';
            } else {
              formAksesValue.type = 'text';
              formAksesValue.placeholder = 'Contoh: Username / ID Akun / Portal';
              formAksesValueLabel.innerHTML = 'Detail Akses (Teks) <span style="color:#ef4444;">*</span>';
            }
            formAksesValue.value = item.akses || '';
          }

          if (formHarga) formHarga.value = item.harga || 0;
          if (formTanggalBayar) formTanggalBayar.value = item.tanggalBayar || '';
          if (formJatuhTempo) formJatuhTempo.value = item.jatuhTempo || '';
          if (formStatus) formStatus.value = item.status || calculateStatus(item.jatuhTempo);
          if (formKeterangan) formKeterangan.value = item.keterangan || '';

          if (tbFormModal) tbFormModal.classList.add('is-active');
        });
      }

      // Delete Item
      if (actionDelete) {
        actionDelete.addEventListener('click', function () {
          closeAllPopovers();
          if (!activeActionId) return;
          const item = dataList.find(function (d) { return d.id === activeActionId; });
          if (!item) return;

          Swal.fire({
            title: 'Hapus Tagihan Berkala?',
            html: 'Apakah Anda yakin ingin menghapus tagihan <strong>' + escapeHtml(item.itemTagihan) + '</strong>?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            reverseButtons: true
          }).then(function (result) {
            if (result.isConfirmed) {
              dataList = dataList.filter(function (d) { return d.id !== activeActionId; });
              saveData(dataList);
              renderTable();

              Swal.fire({
                title: 'Berhasil Dihapus',
                text: 'Data tagihan berkala telah berhasil dihapus.',
                icon: 'success',
                timer: 1600,
                showConfirmButton: false
              });
            }
          });
        });
      }

      /* ===== TAMBAH TAGIHAN (NEW MODAL) ===== */
      if (btnTambahTagihan) {
        btnTambahTagihan.addEventListener('click', function () {
          closeAllPopovers();
          if (tbFormActionText) tbFormActionText.textContent = 'Tambah';
          if (editIndex) editIndex.value = -1;
          if (tbForm) tbForm.reset();

          if (formUmurEkonomisCustomWrap) formUmurEkonomisCustomWrap.style.display = 'none';
          if (formUmurEkonomisCustomDays) formUmurEkonomisCustomDays.removeAttribute('required');

          if (formAksesType) formAksesType.value = 'Email';
          if (formAksesValue && formAksesValueLabel) {
            formAksesValue.type = 'email';
            formAksesValue.placeholder = 'nama@perusahaan.com';
            formAksesValueLabel.innerHTML = 'Detail Akses (Email) <span style="color:#ef4444;">*</span>';
          }

          const today = new Date().toISOString().slice(0, 10);
          if (formTanggalBayar) formTanggalBayar.value = today;
          if (formUmurEkonomis) formUmurEkonomis.value = '1 Bulan';
          recalcJatuhTempoAndStatus();

          if (tbFormModal) tbFormModal.classList.add('is-active');
        });
      }

      /* ===== FORM INTERACTION LISTENERS ===== */
      // Dynamic Akses type listener
      if (formAksesType) {
        formAksesType.addEventListener('change', function () {
          const t = this.value;
          if (formAksesValue && formAksesValueLabel) {
            if (t === 'Email') {
              formAksesValue.type = 'email';
              formAksesValue.placeholder = 'nama@perusahaan.com';
              formAksesValueLabel.innerHTML = 'Detail Akses (Email) <span style="color:#ef4444;">*</span>';
            } else if (t === 'Nomor') {
              formAksesValue.type = 'tel';
              formAksesValue.placeholder = 'Contoh: 081234567890';
              formAksesValueLabel.innerHTML = 'Detail Akses (Nomor) <span style="color:#ef4444;">*</span>';
            } else {
              formAksesValue.type = 'text';
              formAksesValue.placeholder = 'Contoh: Username / ID Akun / Portal';
              formAksesValueLabel.innerHTML = 'Detail Akses (Teks) <span style="color:#ef4444;">*</span>';
            }
          }
        });
      }

      // Umur Ekonomis switch listener
      if (formUmurEkonomis) {
        formUmurEkonomis.addEventListener('change', function () {
          if (this.value === 'Costom') {
            if (formUmurEkonomisCustomWrap) formUmurEkonomisCustomWrap.style.display = 'block';
            if (formUmurEkonomisCustomDays) formUmurEkonomisCustomDays.setAttribute('required', 'required');
          } else {
            if (formUmurEkonomisCustomWrap) formUmurEkonomisCustomWrap.style.display = 'none';
            if (formUmurEkonomisCustomDays) formUmurEkonomisCustomDays.removeAttribute('required');
          }
          recalcJatuhTempoAndStatus();
        });
      }

      if (formUmurEkonomisCustomDays) {
        formUmurEkonomisCustomDays.addEventListener('input', recalcJatuhTempoAndStatus);
      }
      if (formTanggalBayar) {
        formTanggalBayar.addEventListener('change', recalcJatuhTempoAndStatus);
      }
      if (formJatuhTempo) {
        formJatuhTempo.addEventListener('change', function () {
          if (this.value && formStatus) {
            formStatus.value = calculateStatus(this.value);
          }
        });
      }

      /* ===== FORM SUBMIT (SAVE) ===== */
      if (tbForm) {
        tbForm.addEventListener('submit', function (e) {
          e.preventDefault();

          const idx = parseInt(editIndex ? editIndex.value : -1, 10);
          const umur = formUmurEkonomis ? formUmurEkonomis.value : '1 Bulan';
          const customDaysVal = umur === 'Costom' && formUmurEkonomisCustomDays ? (parseInt(formUmurEkonomisCustomDays.value, 10) || 0) : undefined;

          const newItem = {
            id: idx === -1 ? ('TB-' + String(Date.now()).slice(-5)) : dataList[idx].id,
            itemTagihan: formItemTagihan ? formItemTagihan.value.trim() : '',
            umurEkonomis: umur,
            umurEkonomisCustomDays: customDaysVal,
            aksesTipe: formAksesType ? formAksesType.value : 'Email',
            akses: formAksesValue ? formAksesValue.value.trim() : '',
            harga: formHarga ? (parseFloat(formHarga.value) || 0) : 0,
            tanggalBayar: formTanggalBayar ? formTanggalBayar.value : '',
            jatuhTempo: formJatuhTempo ? formJatuhTempo.value : '',
            status: formStatus ? formStatus.value : 'Berlangganan',
            keterangan: formKeterangan ? formKeterangan.value.trim() : ''
          };

          if (idx === -1) {
            dataList.unshift(newItem);
          } else {
            dataList[idx] = newItem;
          }

          saveData(dataList);
          if (tbFormModal) tbFormModal.classList.remove('is-active');
          renderTable();

          Swal.fire({
            title: 'Berhasil Disimpan',
            text: 'Data tagihan berkala telah berhasil ' + (idx === -1 ? 'ditambahkan' : 'diperbarui') + '.',
            icon: 'success',
            timer: 1600,
            showConfirmButton: false
          });
        });
      }

      /* ===== MODAL CLOSE EVENTS ===== */
      document.querySelectorAll('[data-close-modal]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const modalId = this.getAttribute('data-close-modal');
          const modal = document.getElementById(modalId);
          if (modal) modal.classList.remove('is-active');
        });
      });

      document.querySelectorAll('.pnd-modal-overlay').forEach(function (overlay) {
        overlay.addEventListener('click', function (e) {
          if (e.target === this) {
            this.classList.remove('is-active');
          }
        });
      });

      /* ===== INITIALIZATION ===== */
      renderTable();
    })();
