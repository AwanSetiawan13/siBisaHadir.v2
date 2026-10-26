/**
 * excel_engine.js - PT Bisa Media Group
 * Universal Styled Excel (.xlsx) Exporter with Professional Table Design
 * Features:
 * - Real .xlsx binary generation via ExcelJS
 * - Beautiful brand header banner & metadata (Date, Total Rows)
 * - Styled Table Headers (Excel Green #107C41 / White Bold / Thin borders)
 * - Auto-filter dropdowns enabled on header row
 * - Alternating row colors (Zebra striping #FFFFFF / #F8FAFC)
 * - Auto-fit column widths (no clipped or ### cells)
 * - Smart status badge colors:
 *     Green (#DCFCE7/#166534) for Bind, Aktif, Selesai, Approved, Hadir, Tepat Waktu
 *     Amber (#FEF3C7/#92400E) for Tenggang, Pending, Dalam Proses, Review, Menunggu
 *     Red   (#FEE2E2/#991B1B) for Berhenti, Ditolak, Cancel, Batal, Terlambat, Alpa
 *     Blue  (#E0F2FE/#0369A1) for Izin, Sakit
 * - Robust fallback to Styled Spreadsheet XML/HTML if offline or ExcelJS unavailable
 */

(function (window, document) {
  'use strict';

  // Determine root prefix dynamically
  function getRootPrefix() {
    let depth = 1;
    const normalizedPath = (window.location.pathname || '').replace(/\\/g, '/');
    const segments = normalizedPath.split('/').filter(Boolean);
    const folderIndex = segments.findIndex(s => ['bm', 'spvkol', 'staffkol'].includes(s.toLowerCase()));
    if (folderIndex !== -1) {
      depth = segments.length - folderIndex - 1;
    }
    return depth > 0 ? '../'.repeat(depth) : '';
  }

  // Preload ExcelJS library if not already present
  let excelJsLoadingPromise = null;
  function ensureExcelJs() {
    if (window.ExcelJS && window.ExcelJS.Workbook) {
      return Promise.resolve(window.ExcelJS);
    }
    if (excelJsLoadingPromise) {
      return excelJsLoadingPromise;
    }

    excelJsLoadingPromise = new Promise((resolve) => {
      const rootPrefix = getRootPrefix();
      const localSrc = rootPrefix + 'vendor/exceljs.min.js';
      const cdnSrc = 'https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js';

      function tryLoadScript(src, onSuccess, onError) {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
          if (window.ExcelJS && window.ExcelJS.Workbook) {
            onSuccess(window.ExcelJS);
          } else {
            onError();
          }
        };
        script.onerror = onError;
        document.head.appendChild(script);
      }

      // First try local copy
      tryLoadScript(localSrc, (lib) => {
        resolve(lib);
      }, () => {
        // Fallback to CDN
        tryLoadScript(cdnSrc, (lib) => {
          resolve(lib);
        }, () => {
          console.warn('[BisaExcel] ExcelJS could not be loaded, using fallback HTML/XML spreadsheet engine.');
          resolve(null);
        });
      });
    });

    return excelJsLoadingPromise;
  }

  // Status classifier helper
  function getStatusStyle(val) {
    if (val == null) return null;
    const s = String(val).trim().toLowerCase();
    if (!s) return null;

    // Green / Positive
    if (['bind', 'aktif', 'selesai', 'approved', 'disetujui', 'hadir', 'tepat waktu', 'berhasil', 'normal', 'high', 'terkirim', 'lunas', 'clear'].includes(s)) {
      return {
        bg: 'FFDCFCE7',
        fontColor: 'FF166534',
        border: 'FF86EFAC',
        htmlBg: '#dcfce7',
        htmlColor: '#166534',
        htmlBorder: '#86efac'
      };
    }

    // Amber / Warning / Process
    if (['tenggang', 'pending', 'menunggu', 'dalam proses', 'review', 'sedang diproses', 'medium', 'warning', 'revisi', 'draft', 'follow up'].includes(s)) {
      return {
        bg: 'FFFEF3C7',
        fontColor: 'FF92400E',
        border: 'FFFDE68A',
        htmlBg: '#fef3c7',
        htmlColor: '#92400e',
        htmlBorder: '#fde68a'
      };
    }

    // Red / Danger / Inactive
    if (['berhenti', 'ditolak', 'rejected', 'cancel', 'batal', 'terlambat', 'alpa', 'low', 'gagal', 'hilang', 'rusak', 'non-aktif', 'nonaktif'].includes(s)) {
      return {
        bg: 'FFFEE2E2',
        fontColor: 'FF991B1B',
        border: 'FFFCA5A5',
        htmlBg: '#fee2e2',
        htmlColor: '#991b1b',
        htmlBorder: '#fca5a5'
      };
    }

    // Blue / Info
    if (['izin', 'sakit', 'vip', 'khusus', 'superstar', 'top tier'].includes(s)) {
      return {
        bg: 'FFE0F2FE',
        fontColor: 'FF0369A1',
        border: 'FFBAE6FD',
        htmlBg: '#e0f2fe',
        htmlColor: '#0369a1',
        htmlBorder: '#bae6fd'
      };
    }

    return null;
  }

  /**
   * Safe file downloader that guarantees correct filename & extension (.xlsx/.xls)
   * Prevents Chrome from downloading as a raw UUID without extension, especially on file:/// protocol.
   */
  function downloadBlobSafely(blob, filename) {
    let cleanFilename = (filename || 'laporan_data.xlsx').trim();
    if (!/\.(xlsx|xls)$/i.test(cleanFilename)) {
      cleanFilename += '.xlsx';
    }

    const isXlsx = cleanFilename.toLowerCase().endsWith('.xlsx');
    const mimeType = isXlsx
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'application/vnd.ms-excel;charset=utf-8';

    // Ensure valid Blob with accurate MIME type
    let safeBlob = blob;
    if (!(safeBlob instanceof Blob)) {
      safeBlob = new Blob([blob], { type: mimeType });
    }

    // Method 1: IE / legacy Edge
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(safeBlob, cleanFilename);
      return;
    }

    // Helper to trigger anchor download
    function triggerDownload(href) {
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = href;
      link.download = cleanFilename;
      link.setAttribute('download', cleanFilename);
      document.body.appendChild(link);
      link.click();
      setTimeout(function () {
        if (link.parentNode) link.parentNode.removeChild(link);
      }, 1500);
    }

    // Method 2: On file:/// protocol, Chrome treats blob: URLs as opaque-origin, which forces
    // Chrome to disregard the download filename attribute and save files as raw UUID blobs without extension.
    // Converting the blob to a base64 Data URL completely solves this in Chrome, forcing the exact .xlsx filename!
    if (window.location.protocol === 'file:' || !window.URL || !window.URL.createObjectURL) {
      const reader = new FileReader();
      reader.onloadend = function () {
        triggerDownload(reader.result);
      };
      reader.readAsDataURL(safeBlob);
      return;
    }

    // Method 3: Standard Object URL with fallback to Data URL
    try {
      const url = URL.createObjectURL(safeBlob);
      triggerDownload(url);
      setTimeout(function () {
        try { URL.revokeObjectURL(url); } catch (e) { }
      }, 60000);
    } catch (err) {
      const reader = new FileReader();
      reader.onloadend = function () {
        triggerDownload(reader.result);
      };
      reader.readAsDataURL(safeBlob);
    }
  }

  // Toast / SweetAlert notification helper
  function showExportSuccessNotification(message) {
    if (typeof Swal !== 'undefined' && Swal.fire) {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil Diekspor',
        text: message || 'Data berhasil diunduh dalam format Excel (.xlsx) dengan tabel rapi.',
        timer: 2300,
        showConfirmButton: false,
        customClass: { popup: 'swal2-bisa-popup' }
      });
      return;
    }

    if (typeof showToast === 'function') {
      showToast(message || 'File Excel (.xlsx) berhasil diekspor!', 'success');
      return;
    }

    let container = document.getElementById('bisaExcelToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'bisaExcelToastContainer';
      container.style.cssText = 'position:fixed;top:24px;right:24px;z-index:9999999;display:flex;flex-direction:column;gap:10px;pointer-events:none;font-family:Outfit,sans-serif;';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.cssText = 'background:#107C41;color:#ffffff;padding:12px 20px;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,0.18);display:flex;align-items:center;gap:10px;font-size:13.5px;font-weight:600;opacity:0;transform:translateY(-10px);transition:all 0.3s ease;pointer-events:auto;';
    toast.innerHTML = `<svg style="width:20px;height:20px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg><span>${message || 'File Excel (.xlsx) berhasil diunduh!'}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 350);
    }, 3000);
  }

  // Fallback exporter: Generates a styled HTML spreadsheet that Excel opens with complete formatting
  function exportFallbackHtmlSpreadsheet(options) {
    const {
      title = 'LAPORAN DATA',
      filename = 'export_data.xls',
      headers = [],
      rows = []
    } = options;

    const totalCols = headers.length || 1;
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:x="urn:schemas-microsoft-com:office:excel"
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>${options.sheetName || 'Data'}</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          .title-row {
            background-color: #1E87B7;
            color: #FFFFFF;
            font-size: 14pt;
            font-weight: bold;
            text-align: center;
            height: 38px;
            vertical-align: middle;
          }
          .sub-row {
            background-color: #F1F5F9;
            color: #475569;
            font-size: 9.5pt;
            font-style: italic;
            text-align: center;
            height: 22px;
            vertical-align: middle;
          }
          .blank-row { height: 10px; }
          .th-header {
            background-color: #107C41;
            color: #FFFFFF;
            font-weight: bold;
            font-size: 10.5pt;
            text-align: center;
            vertical-align: middle;
            border: 1px solid #0D6133;
            padding: 8px 12px;
            white-space: nowrap;
          }
          .td-cell {
            font-size: 10pt;
            color: #1E293B;
            border: 1px solid #CBD5E1;
            padding: 6px 10px;
            vertical-align: middle;
          }
          .td-even { background-color: #F8FAFC; }
          .td-odd { background-color: #FFFFFF; }
          .align-center { text-align: center; }
          .align-right { text-align: right; }
          .align-left { text-align: left; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <th colspan="${totalCols}" class="title-row">PT BISA MEDIA GROUP - ${title.toUpperCase()}</th>
          </tr>
          <tr>
            <td colspan="${totalCols}" class="sub-row">
              Diekspor pada: ${new Date().toLocaleString('id-ID')} | Total: ${rows.length} Baris Data
            </td>
          </tr>
          <tr class="blank-row"><td colspan="${totalCols}"></td></tr>
          <tr>
            ${headers.map(h => `<th class="th-header">${h}</th>`).join('')}
          </tr>
    `;

    rows.forEach((row, rIdx) => {
      const zebraClass = rIdx % 2 === 1 ? 'td-even' : 'td-odd';
      html += '<tr>';
      row.forEach((cellVal, cIdx) => {
        const rawStr = String(cellVal != null ? cellVal : '').trim().replace(/^"(.*)"$/, '$1');
        const stStyle = getStatusStyle(rawStr);

        let cellStyle = '';
        let alignClass = 'align-left';

        if (cIdx === 0 || rawStr.length <= 4 || /^\d{4}-\d{2}-\d{2}/.test(rawStr)) {
          alignClass = 'align-center';
        } else if (rawStr.startsWith('Rp') || rawStr.endsWith('%') || /^[0-9.,]+$/.test(rawStr) && rawStr.length > 5) {
          alignClass = 'align-right';
        }

        if (stStyle) {
          cellStyle = `background-color: ${stStyle.htmlBg}; color: ${stStyle.htmlColor}; font-weight: bold; text-align: center; border: 1px solid ${stStyle.htmlBorder};`;
        }

        html += `<td class="td-cell ${zebraClass} ${alignClass}" style="${cellStyle}">${rawStr}</td>`;
      });
      html += '</tr>';
    });

    html += `
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const finalFilename = filename.endsWith('.xls') || filename.endsWith('.xlsx') ? filename.replace(/\.xlsx$/, '.xls') : `${filename}.xls`;
    if (typeof window.downloadBlobSafely === 'function') {
      window.downloadBlobSafely(blob, finalFilename);
    } else if (typeof downloadBlobSafely === 'function') {
      downloadBlobSafely(blob, finalFilename);
    }
  }

  /**
   * Main Styled Excel Export Function
   * @param {Object} options
   *   - title: String (e.g. 'DATA KREATOR')
   *   - filename: String (e.g. 'data_kreator_2026-10-22.xlsx')
   *   - sheetName: String (e.g. 'Data Kreator')
   *   - headers: Array<String>
   *   - rows: Array<Array<any>>
   *   - statusColIndices: Array<Number> (optional)
   */
  async function exportBisaExcel(options) {
    if (!options) {
      console.error('[BisaExcel] Missing options for exportBisaExcel');
      return;
    }

    const title = options.title || 'LAPORAN DATA';
    let filename = options.filename || 'export_data.xlsx';
    if (!filename.toLowerCase().endsWith('.xlsx') && !filename.toLowerCase().endsWith('.xls')) {
      filename += '.xlsx';
    }
    const sheetName = (options.sheetName || title || 'Sheet1').substring(0, 31);
    const headers = options.headers || [];
    const rows = options.rows || [];

    if (headers.length === 0 && rows.length === 0) {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'info',
          title: 'Data Kosong',
          text: 'Tidak ada data untuk diekspor.',
          confirmButtonColor: '#29A3D8',
          confirmButtonText: 'Tutup'
        });
      } else {
        alert('Tidak ada data untuk diekspor.');
      }
      return;
    }

    // Try ExcelJS
    const ExcelJS = await ensureExcelJs();
    if (!ExcelJS || !ExcelJS.Workbook) {
      // Use fallback HTML/XML spreadsheet
      exportFallbackHtmlSpreadsheet({
        title,
        filename,
        sheetName,
        headers,
        rows
      });
      return;
    }

    try {
      const wb = new ExcelJS.Workbook();
      wb.creator = 'PT Bisa Media Group - SI BISA HADIR';
      wb.lastModifiedBy = 'PT Bisa Media Group';
      wb.created = new Date();
      wb.modified = new Date();

      const ws = wb.addWorksheet(sheetName, {
        views: [{ state: 'frozen', ySplit: 4, showGridLines: true }],
        pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
      });

      const totalCols = Math.max(headers.length, 1);

      // Row 1: Company & Title Banner
      ws.mergeCells(1, 1, 1, totalCols);
      const titleCell = ws.getCell(1, 1);
      titleCell.value = 'PT BISA MEDIA GROUP - ' + title.toUpperCase();
      titleCell.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
      titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E87B7' } };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
      ws.getRow(1).height = 32;

      // Row 2: Subtitle Info
      ws.mergeCells(2, 1, 2, totalCols);
      const subCell = ws.getCell(2, 1);
      subCell.value = `Diekspor pada: ${new Date().toLocaleString('id-ID')} | Total: ${rows.length} Baris Data`;
      subCell.font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF475569' } };
      subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
      subCell.alignment = { vertical: 'middle', horizontal: 'center' };
      ws.getRow(2).height = 20;

      // Row 3: Blank Separator
      ws.getRow(3).height = 8;

      // Row 4: Column Headers
      const headerRow = ws.getRow(4);
      headerRow.height = 26;
      headers.forEach((h, idx) => {
        const colNum = idx + 1;
        const cell = headerRow.getCell(colNum);
        cell.value = h;
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
        // Excel Green #107C41
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF107C41' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF0D6133' } },
          bottom: { style: 'medium', color: { argb: 'FF0D6133' } },
          left: { style: 'thin', color: { argb: 'FF0D6133' } },
          right: { style: 'thin', color: { argb: 'FF0D6133' } }
        };
      });

      // Enable native AutoFilter on headers
      ws.autoFilter = {
        from: { row: 4, column: 1 },
        to: { row: 4, column: totalCols }
      };

      // ===== Force TEXT format pada kolom yang mengandung @ atau nilai khusus =====
      // Kunci: gunakan column.style (bukan hanya numFmt) + set numFmt SETELAH semua style cell
      const TEXT_HEADER_KEYWORDS = ['username', 'uid', 'handle', 'user', 'akun', 'no hp', 'nomor wa', 'whatsapp', 'no. wa', 'tiktok', 'instagram', 'sosmed'];
      const callerTextCols = new Set((options.textColumnIndices || []).map(i => i + 1)); // 0-based → 1-based
      const textColSet = new Set(); // kolom yang perlu dipaksa Text

      headers.forEach((h, idx) => {
        const colNum = idx + 1;
        const hLower = String(h).toLowerCase().trim();
        const isTextCol = callerTextCols.has(colNum) || TEXT_HEADER_KEYWORDS.some(kw => hLower.includes(kw));
        if (isTextCol) {
          // Gunakan .style (bukan hanya .numFmt) agar ExcelJS menulis format teks ke <col> XML
          ws.getColumn(colNum).style = { numFmt: '@', font: { name: 'Calibri', size: 10 } };
          textColSet.add(colNum);
        }
      });

      // Add Data Rows starting at Row 5
      rows.forEach((rowValues, rIdx) => {
        const rowNum = 5 + rIdx;
        const row = ws.getRow(rowNum);
        row.height = 22;
        const isEven = rIdx % 2 === 1;
        const zebraBg = isEven ? 'FFF8FAFC' : 'FFFFFFFF';

        rowValues.forEach((val, cIdx) => {
          const colNum = cIdx + 1;
          const cell = row.getCell(colNum);

          // Clean string if wrapped in double quotes
          let cleanVal = val;
          if (typeof cleanVal === 'string') {
            cleanVal = cleanVal.trim().replace(/^"(.*)"$/, '$1').replace(/""/g, '"');
          }

          // Set value terlebih dahulu
          cell.value = (cleanVal != null ? cleanVal : '');

          // Style dasar
          cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF1E293B' } };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
          };

          const valStr = String(cleanVal != null ? cleanVal : '').trim();
          const stStyle = getStatusStyle(valStr);

          if (stStyle) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: stStyle.bg } };
            cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: stStyle.fontColor } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          } else {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: zebraBg } };
            if (colNum === 1 || valStr.length <= 4 || /^\d{4}-\d{2}-\d{2}/.test(valStr)) {
              cell.alignment = { vertical: 'middle', horizontal: 'center' };
            } else if (valStr.startsWith('Rp') || valStr.endsWith('%') || (/^[0-9.,]+$/.test(valStr) && valStr.length > 5)) {
              cell.alignment = { vertical: 'middle', horizontal: 'right' };
            } else {
              cell.alignment = { vertical: 'middle', horizontal: 'left' };
            }
          }

          // ===== KUNCI FIX: set numFmt='@' SETELAH semua style lain =====
          // Ini memastikan format Text tidak tertimpa oleh assignment fill/font/border di atas
          if (textColSet.has(colNum)) {
            cell.numFmt = '@';
            cell.value = String(cleanVal != null ? cleanVal : ''); // pastikan tipe string
          }
        });
      });


      // Auto-fit column widths
      headers.forEach((h, idx) => {
        const colNum = idx + 1;
        let maxLen = String(h || '').length;

        rows.forEach(r => {
          const cellVal = String(r[idx] != null ? r[idx] : '').replace(/^"(.*)"$/, '$1');
          if (cellVal.length > maxLen) {
            maxLen = cellVal.length;
          }
        });

        // Set width with padding and reasonable bounds
        const computedWidth = Math.min(Math.max(maxLen + 4, colNum === 1 ? 8 : 12), 48);
        ws.getColumn(colNum).width = computedWidth;
      });

      // Write and download using bulletproof downloader
      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      if (typeof window.downloadBlobSafely === 'function') {
        window.downloadBlobSafely(blob, filename);
      } else if (typeof downloadBlobSafely === 'function') {
        downloadBlobSafely(blob, filename);
      }

      showExportSuccessNotification(options.successMessage || `File ${filename} berhasil diunduh dengan format tabel rapi (.xlsx).`);

    } catch (err) {
      console.error('[BisaExcel] Error building .xlsx, falling back:', err);
      exportFallbackHtmlSpreadsheet({
        title,
        filename,
        sheetName,
        headers,
        rows
      });
      showExportSuccessNotification(options.successMessage || `File ${filename} berhasil diunduh dengan format tabel rapi.`);
    }
  }

  /**
   * Helper to export an HTML table directly (e.g. for Kehadiran, Lembur, Istirahat)
   * @param {String} tableId
   * @param {String} filename
   * @param {String} title
   */
  async function exportTableToExcel(tableId, filename, title) {
    const table = document.getElementById(tableId);
    if (!table) {
      console.warn('[BisaExcel] Table with id not found:', tableId);
      return;
    }

    const headerCells = Array.from(table.querySelectorAll('thead th, tr:first-child th'));
    const headers = [];
    const ignoreColIndices = new Set();

    headerCells.forEach((th, idx) => {
      const text = th.textContent.trim();
      if (text.toLowerCase() === 'aksi' || th.classList.contains('col-sticky-action') || th.classList.contains('tdActions')) {
        ignoreColIndices.add(idx);
      } else {
        headers.push(text);
      }
    });

    const tbodyRows = Array.from(table.querySelectorAll('tbody tr'));
    const rows = [];

    tbodyRows.forEach(tr => {
      if (tr.style.display === 'none') return; // skip filtered out rows
      const cells = Array.from(tr.querySelectorAll('td'));
      if (cells.length === 0) return;

      const rowData = [];
      cells.forEach((td, idx) => {
        if (ignoreColIndices.has(idx) || td.classList.contains('tdActions') || td.classList.contains('col-sticky-action')) {
          return;
        }
        // Extract text, ignoring nested hidden tags if any
        let val = td.textContent.trim().replace(/\s+/g, ' ');
        rowData.push(val);
      });

      if (rowData.length > 0) {
        rows.push(rowData);
      }
    });

    const finalTitle = title || (filename ? filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' ') : 'DATA TABEL');

    await exportBisaExcel({
      title: finalTitle,
      filename: filename || `${finalTitle.toLowerCase().replace(/\s+/g, '_')}.xlsx`,
      sheetName: finalTitle.substring(0, 31),
      headers,
      rows
    });

    if (typeof showToast === 'function') {
      showToast('File Excel berhasil diekspor dengan format tabel rapi', 'success');
    }
  }

  // Expose globally
  window.exportBisaExcel = exportBisaExcel;
  window.exportTableToExcel = exportTableToExcel;
  window.ensureExcelJs = ensureExcelJs;
  window.downloadBlobSafely = downloadBlobSafely;

  // Immediately kick off preload in the background
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureExcelJs);
  } else {
    ensureExcelJs();
  }

})(window, document);
