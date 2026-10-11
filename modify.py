import re
import os

files = [
    r'D:\2. BISA_Media\siBisaSuper.App\SpvKol\absensi\spvkol_kehadiran.html',
    r'D:\2. BISA_Media\siBisaSuper.App\SpvKol\absensi\spvkol_presensi_istirahat.html',
    r'D:\2. BISA_Media\siBisaSuper.App\SpvKol\absensi\spvkol_presensi_lembur.html'
]

th_replacement = '''<th class="th-pinnable" data-col="karyawan">
                  <div class="th-pin-wrapper">
                    <span>Nama Karyawan</span>
                    <label class="pin-check-btn" title="Kunci / Pin kolom Nama Karyawan agar tetap terlihat saat scroll">
                      <input type="checkbox" class="chk-pin-col" data-col="karyawan" />
                      <span class="pin-check-indicator">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </span>
                    </label>
                  </div>
                </th>'''

css_insert = '''
    /* Checkbox Pin/Fix Column Header Button */
    .th-pin-wrapper { display: inline-flex; align-items: center; gap: 8px; white-space: nowrap; }
    .pin-check-btn { display: inline-flex; align-items: center; cursor: pointer; margin: 0; padding: 0; position: relative; }
    .pin-check-btn input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; pointer-events: none; }
    .pin-check-indicator { width: 17px; height: 17px; border-radius: 4px; border: 1.5px solid #cbd5e1; background: #ffffff; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
    .pin-check-indicator svg { width: 11px; height: 11px; stroke: #ffffff; opacity: 0; transform: scale(0.6); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
    .pin-check-btn:hover .pin-check-indicator { border-color: #0284c7; background: #f0f9ff; }
    .pin-check-btn input[type="checkbox"]:checked+.pin-check-indicator { background: #0284c7; border-color: #0284c7; box-shadow: 0 1px 4px rgba(2, 132, 199, 0.35); }
    .pin-check-btn input[type="checkbox"]:checked+.pin-check-indicator svg { opacity: 1; transform: scale(1); }
    /* Fixed/Pinned Left Columns */
    .campaign-table th:first-child, .campaign-table td:first-child { position: sticky; left: 0; z-index: 11; background: #f8fafc; text-align: center; min-width: 44px; max-width: 48px; }
    .campaign-table td:first-child { background: #ffffff; }
    .campaign-table tr:hover td:first-child { background: #f8fafc; }
    .campaign-table th.col-pinned-sticky { position: sticky; z-index: 10; background: #f8fafc !important; }
    .campaign-table td.col-pinned-sticky { position: sticky; z-index: 9; background: #ffffff !important; }
    .campaign-table tr:hover td.col-pinned-sticky { background: #f8fafc !important; }
    .campaign-table th.col-pinned-last, .campaign-table td.col-pinned-last { box-shadow: 5px 0 12px rgba(0, 0, 0, 0.06) !important; border-right: 1px solid #cbd5e1 !important; }
'''

js_insert = '''
  <script>
    (function(){
      const PIN_STORAGE_KEY = "bisa_karyawan_pinned_cols_v1";
      function getSavedPinnedCols() {
        try { const saved = localStorage.getItem(PIN_STORAGE_KEY); return saved ? JSON.parse(saved) : {}; } catch (e) { return {}; }
      }
      function savePinnedCols(map) {
        try { localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(map)); } catch (e) { }
      }
      function updatePinnedColumns() {
        const table = document.querySelector(".campaign-table table");
        if (!table) return;
        const colConfig = [{ key: "karyawan", colIdx: 1 }];
        const thFirst = table.querySelector("thead tr th:first-child");
        let currentLeft = thFirst ? thFirst.getBoundingClientRect().width : 46;
        colConfig.forEach(cfg => {
          const chk = document.querySelector(.chk-pin-col[data-col=""]);
          const isPinned = chk ? chk.checked : false;
          const th = table.querySelector(	head tr th:nth-child());
          const tds = table.querySelectorAll(	body tr td:nth-child());
          if (isPinned) {
            const width = th ? th.getBoundingClientRect().width : 110;
            if (th) { th.classList.add("col-pinned-sticky"); th.style.left = currentLeft + "px"; }
            tds.forEach(td => { td.classList.add("col-pinned-sticky"); td.style.left = currentLeft + "px"; });
            currentLeft += width;
          } else {
            if (th) { th.classList.remove("col-pinned-sticky"); th.style.left = ""; }
            tds.forEach(td => { td.classList.remove("col-pinned-sticky"); td.style.left = ""; });
          }
        });
        table.querySelectorAll(".col-pinned-last").forEach(el => el.classList.remove("col-pinned-last"));
        const pinnedThs = table.querySelectorAll("thead tr th.col-pinned-sticky");
        if (pinnedThs.length > 0) {
          pinnedThs[pinnedThs.length - 1].classList.add("col-pinned-last");
          table.querySelectorAll("tbody tr").forEach(r => {
            const pinnedTds = r.querySelectorAll("td.col-pinned-sticky");
            if (pinnedTds.length > 0) { pinnedTds[pinnedTds.length - 1].classList.add("col-pinned-last"); }
          });
        }
      }
      function initPinnedColsEvents() {
        const saved = getSavedPinnedCols();
        document.querySelectorAll(".chk-pin-col").forEach(chk => {
          const col = chk.getAttribute("data-col");
          if (saved && saved[col]) { chk.checked = true; }
          chk.addEventListener("change", () => {
            const currentSaved = getSavedPinnedCols();
            currentSaved[col] = chk.checked;
            savePinnedCols(currentSaved);
            updatePinnedColumns();
          });
        });
        window.addEventListener("resize", updatePinnedColumns);
        updatePinnedColumns();
      }
      document.addEventListener("DOMContentLoaded", initPinnedColsEvents);
      // Run once immediately in case DOM is already loaded
      setTimeout(initPinnedColsEvents, 500);
    })();
  </script>
'''

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Replace TH
    content = content.replace('<th>Nama Karyawan</th>', th_replacement)

    # 2. Add CSS before last </style>
    if css_insert not in content:
        parts = content.rsplit('</style>', 1)
        if len(parts) == 2:
            content = parts[0] + css_insert + '</style>' + parts[1]

    # 3. Add JS before </body>
    if 'bisa_karyawan_pinned_cols_v1' not in content:
        parts = content.rsplit('</body>', 1)
        if len(parts) == 2:
            content = parts[0] + js_insert + '</body>' + parts[1]

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Processed {os.path.basename(file_path)}')
