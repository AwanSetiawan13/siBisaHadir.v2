import sys

def process_file(filepath, title_text, btn_call_file):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the function exportTableToCSV
    start_str = '    function exportTableToCSV(tableId, filename) {'
    start_idx = content.find(start_str)
    if start_idx == -1:
        print(f"Could not find function start in {filepath}")
        return

    # Find the end of the function. We know it ends right before:
    # "    document.addEventListener('DOMContentLoaded', () => {"
    end_str = "    document.addEventListener('DOMContentLoaded', () => {"
    end_idx = content.find(end_str, start_idx)
    if end_idx == -1:
        print(f"Could not find function end in {filepath}")
        return

    new_func = '''    function exportTableToExcel(tableId, filename, title) {
      const table = document.getElementById(tableId);
      if (!table) return;

      let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
      html += '<head><meta charset="utf-8"></head><body>';
      if (title) {
        const firstRow = table.querySelector('tr');
        const colCount = firstRow ? firstRow.querySelectorAll('th, td').length - 1 : 1;
        html += <table><tr><th colspan="" style="font-size:18px; text-align:center;"></th></tr><tr></tr></table>;
      }
      
      html += '<table border="1">';
      
      const rows = Array.from(table.querySelectorAll('tr'));
      let rowIndex = 1;
      
      rows.forEach((row, rIdx) => {
        if (row.style.display === 'none') return;
        
        html += '<tr>';
        const cells = Array.from(row.querySelectorAll('th, td'));
        cells.forEach((cell, index) => {
          if (index === cells.length - 1 && (cell.textContent.trim().toLowerCase() === 'aksi' || cell.classList.contains('tdActions'))) {
            return;
          }
          let text = cell.textContent.trim();
          
          if (index === 0 && cell.tagName.toLowerCase() === 'td' && /^\d+$/.test(text)) {
            text = String(rowIndex++);
          }
          
          if (cell.tagName.toLowerCase() === 'th') {
            html += <th style="background-color:#f2f2f2;"></th>;
          } else {
            html += <td></td>;
          }
        });
        html += '</tr>';
      });
      
      html += '</table></body></html>';
      
      const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (typeof showToast === 'function') {
        showToast("File Excel berhasil diunduh");
      }
    }

'''

    content = content[:start_idx] + new_func + content[end_idx:]

    # Replace the call
    old_call = f"exportTableToCSV('{btn_call_file[0]}', '{btn_call_file[1]}');"
    new_call = f"exportTableToExcel('{btn_call_file[0]}', '{btn_call_file[1].replace('.csv', '.xls')}', '{title_text}');"
    content = content.replace(old_call, new_call)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {filepath}")

# file 1
process_file(
    'D:\\\\2. BISA_Media\\\\siBisaSuper.App\\\\SpvKol\\\\absensi\\\\spvkol_kehadiran.html',
    'Data Kehadiran',
    ('tblKehadiranV2', 'data_kehadiran.csv')
)
# file 2
process_file(
    'D:\\\\2. BISA_Media\\\\siBisaSuper.App\\\\SpvKol\\\\absensi\\\\spvkol_presensi_istirahat.html',
    'Data Absensi Istirahat',
    ('tblIstirahatV2', 'data_absensi_istirahat.csv')
)
# file 3
process_file(
    'D:\\\\2. BISA_Media\\\\siBisaSuper.App\\\\SpvKol\\\\absensi\\\\spvkol_presensi_lembur.html',
    'Data Absensi Lembur',
    ('tblLemburV2', 'data_absensi_lembur.csv')
)
