$files = @("SpvKol/absensi/spvkol_presensi_istirahat.html", "SpvKol/absensi/spvkol_presensi_lembur.html")

$modalHtml = @"
  <!-- Modal PopUp Kalender Campaign -->
  <div id="calendarKehadiranModal" class="modal-overlay">
    <div class="modal-box modal-box--large" style="width: 820px; max-width: 95%;">
      <div class="modal-header">
        <h2 class="modal-title">Pilih Tanggal</h2>
        <button id="closeCalendarKehadiranModal" class="modal-close" type="button" aria-label="Tutup popup">&times;</button>
      </div>
      <div class="modal-divider"></div>
      <div class="calendar-picker-body">
        <div class="calendar-quick-options">
          <button type="button" class="quick-option-btn is-active" data-range="all">Semua Tanggal</button>
          <button type="button" class="quick-option-btn" data-range="today">Hari ini</button>
          <button type="button" class="quick-option-btn" data-range="yesterday">Kemarin</button>
          <button type="button" class="quick-option-btn" data-range="7days">7 hari terakhir</button>
          <button type="button" class="quick-option-btn" data-range="30days">30 hari terakhir</button>
          <button type="button" class="quick-option-btn" data-range="thisMonth">Bulan ini</button>
          <button type="button" class="quick-option-btn" data-range="lastMonth">Bulan lalu</button>
        </div>
        <div class="calendar-months-container">
          <div class="calendar-month-box">
            <div class="calendar-month-header">
              <span class="nav-arrow">&laquo;</span>
              <span class="month-title">2026 - 08</span>
              <span class="nav-arrow">&lsaquo;</span>
            </div>
            <div class="calendar-weekdays">
              <span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span class="weekend">Sab</span><span class="weekend">Min</span>
            </div>
            <div class="calendar-days">
              <span class="day-muted">27</span><span class="day-muted">28</span><span class="day-muted">29</span><span class="day-muted">30</span><span class="day-muted">31</span>
              <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>10</span>
              <span>11</span><span>12</span><span>13</span><span>14</span><span>15</span><span>16</span><span>17</span><span>18</span><span>19</span><span>20</span>
              <span>21</span><span>22</span><span>23</span><span>24</span><span>25</span><span>26</span><span>27</span><span>28</span><span>29</span><span>30</span><span>31</span>
              <span class="day-muted">1</span><span class="day-muted">2</span><span class="day-muted">3</span><span class="day-muted">4</span><span class="day-muted">5</span><span class="day-muted">6</span>
            </div>
          </div>
          <div class="calendar-month-box">
            <div class="calendar-month-header">
              <span class="nav-arrow">&rsaquo;</span>
              <span class="month-title">2026 - 09</span>
              <span class="nav-arrow">&raquo;</span>
            </div>
            <div class="calendar-weekdays">
              <span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span class="weekend">Sab</span><span class="weekend">Min</span>
            </div>
            <div class="calendar-days">
              <span class="day-muted">31</span>
              <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>10</span>
              <span>11</span><span>12</span><span>13</span><span>14</span><span>15</span><span>16</span><span>17</span><span>18</span><span>19</span><span>20</span>
              <span>21</span><span>22</span><span>23</span><span>24</span><span>25</span><span>26</span><span>27</span><span>28</span><span>29</span><span>30</span>
              <span class="day-muted">1</span><span class="day-muted">2</span><span class="day-muted">3</span><span class="day-muted">4</span><span class="day-muted">5</span><span class="day-muted">6</span>
              <span class="day-muted">7</span><span class="day-muted">8</span><span class="day-muted">9</span><span class="day-muted">10</span><span class="day-muted">11</span>
            </div>
          </div>
        </div>
      </div>
      <div class="calendar-picker-footer">
        <div class="selected-range-info">Dipilih: <span id="selectedRangeTextKehadiran">Semua Tanggal</span></div>
        <div class="calendar-footer-buttons">
          <button type="button" class="btn-calendar-cancel" id="btnCancelCalendarKehadiran">Batal</button>
          <button type="button" class="btn-calendar-apply" id="btnApplyCalendarKehadiran">Terapkan</button>
        </div>
      </div>
    </div>
  </div>
"@

$jsCode = @"
      // Trigger modal calendar
      const filterBtn = document.querySelector(".btn-outline-primary"); // The filter button
      const calendarKehadiranModal = document.getElementById("calendarKehadiranModal");
      const closeCalendarKehadiranModal = document.getElementById("closeCalendarKehadiranModal");
      const btnCancelCalendarKehadiran = document.getElementById("btnCancelCalendarKehadiran");
      const btnApplyCalendarKehadiran = document.getElementById("btnApplyCalendarKehadiran");

      let calTempStart = null;
      let calTempEnd = null;

      if (filterBtn && calendarKehadiranModal) {
        filterBtn.addEventListener("click", function(e) {
          e.preventDefault();
          calendarKehadiranModal.classList.add("is-active");
          updateCalendarHighlight();
        });
      }

      if (closeCalendarKehadiranModal && calendarKehadiranModal) {
        closeCalendarKehadiranModal.addEventListener("click", () => {
          calendarKehadiranModal.classList.remove("is-active");
        });
      }

      if (btnCancelCalendarKehadiran && calendarKehadiranModal) {
        btnCancelCalendarKehadiran.addEventListener("click", () => {
          calendarKehadiranModal.classList.remove("is-active");
        });
      }

      function updateCalendarHighlight() {
        const month1Box = calendarKehadiranModal?.querySelectorAll(".calendar-month-box")[0];
        const month2Box = calendarKehadiranModal?.querySelectorAll(".calendar-month-box")[1];

        [month1Box, month2Box].forEach((box, bIdx) => {
          if (!box) return;
          const monthIdx = bIdx === 0 ? 7 : 8; // Agustus (7), September (8)
          const year = 2026;
          const daySpans = box.querySelectorAll(".calendar-days span:not(.day-muted)");

          daySpans.forEach(s => {
            const d = parseInt(s.textContent.trim(), 10);
            if (isNaN(d)) return;
            const curDate = new Date(year, monthIdx, d);

            s.classList.remove("selected-start", "selected-end", "day-selected-range", "day-active");

            if (calTempStart && !calTempEnd) {
              if (curDate.getTime() === calTempStart.getTime()) {
                s.classList.add("selected-start");
              }
            } else if (calTempStart && calTempEnd) {
              if (curDate.getTime() === calTempStart.getTime()) {
                s.classList.add("selected-start");
              } else if (curDate.getTime() === calTempEnd.getTime()) {
                s.classList.add("selected-end");
              } else if (curDate > calTempStart && curDate < calTempEnd) {
                s.classList.add("day-selected-range");
              }
            }
          });
        });
      }

      const quickOptionBtns = calendarKehadiranModal?.querySelectorAll(".quick-option-btn");
      quickOptionBtns?.forEach(btn => {
        btn.addEventListener("click", () => {
          quickOptionBtns.forEach(b => b.classList.remove("is-active"));
          btn.classList.add("is-active");

          const rangeType = btn.getAttribute("data-range");
          const now = new Date(2026, 8, 17); // Fixed anchor date

          if (rangeType === "all") {
            calTempStart = null;
            calTempEnd = null;
          } else if (rangeType === "today") {
            calTempStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            calTempEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          } else if (rangeType === "yesterday") {
            calTempStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            calTempEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          } else if (rangeType === "7days") {
            calTempStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
            calTempEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          } else if (rangeType === "30days") {
            calTempStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
            calTempEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          } else if (rangeType === "thisMonth") {
            calTempStart = new Date(now.getFullYear(), now.getMonth(), 1);
            calTempEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          } else if (rangeType === "lastMonth") {
            calTempStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            calTempEnd = new Date(now.getFullYear(), now.getMonth(), 0);
          }
          updateCalendarHighlight();
        });
      });

      const month1Box = calendarKehadiranModal?.querySelectorAll(".calendar-month-box")[0];
      const month2Box = calendarKehadiranModal?.querySelectorAll(".calendar-month-box")[1];

      function handleCalendarDayClick(year, monthIdx, dayNum) {
        const clickedDate = new Date(year, monthIdx, dayNum);
        quickOptionBtns?.forEach(b => b.classList.remove("is-active"));

        if (!calTempStart || (calTempStart && calTempEnd)) {
          calTempStart = clickedDate;
          calTempEnd = null;
        } else if (calTempStart && !calTempEnd) {
          if (clickedDate.getTime() >= calTempStart.getTime()) {
            calTempEnd = clickedDate;
          } else {
            calTempEnd = calTempStart;
            calTempStart = clickedDate;
          }
        }
        updateCalendarHighlight();
      }

      if (month1Box) {
        month1Box.querySelectorAll(".calendar-days span:not(.day-muted)").forEach(s => {
          s.addEventListener("click", () => handleCalendarDayClick(2026, 7, parseInt(s.textContent.trim(), 10)));
        });
      }
      if (month2Box) {
        month2Box.querySelectorAll(".calendar-days span:not(.day-muted)").forEach(s => {
          s.addEventListener("click", () => handleCalendarDayClick(2026, 8, parseInt(s.textContent.trim(), 10)));
        });
      }

      if (btnApplyCalendarKehadiran) {
        btnApplyCalendarKehadiran.addEventListener("click", () => {
          calendarKehadiranModal.classList.remove("is-active");
          alert("Filter diterapkan untuk tanggal terpilih!");
        });
      }
"@

foreach ($file in $files) {
    $content = Get-Content $file -Raw
    
    # 1. Remove the old popup input
    $content = $content -replace '<input id="dateFilter[^>]+/>', ''
    
    # 2. Append modal HTML before </body> (or you can insert before <script src="../../sidebar_engine.js">)
    if ($content -notmatch 'id="calendarKehadiranModal"') {
        $content = $content -replace '</body>', "$modalHtml`n</body>"
    }

    # 3. Append JS logic before </script> of the main inline script block
    if ($content -notmatch 'const filterBtn = document.querySelector') {
        # find the last inline </script> tag
        $content = $content -replace '(?s)(</script>\s*<script src="../../sidebar_engine\.js\?v=\d+"></script>)', "`n$jsCode`n`$1"
    }

    Set-Content $file $content
}
