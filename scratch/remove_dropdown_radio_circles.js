const fs = require('fs');
const path = require('path');

console.log('--- Removing radio circles from dropdowns across accounting modules ---');

// 1. Update layout.js with universal anti-radio dropdown styles
const layoutPath = path.join(__dirname, '../assets/js/layout.js');
let layoutContent = fs.readFileSync(layoutPath, 'utf8');

const universalDropdownStyleCode = `
  // Global Style: Hapus UI radio button / lingkaran di semua custom dropdown (Permintaan User)
  (function initUniversalCleanDropdownStyles() {
    if (document.getElementById('bisa-clean-dropdown-styles')) return;
    const style = document.createElement('style');
    style.id = 'bisa-clean-dropdown-styles';
    style.textContent = \`
      .pnd-custom-radio,
      .custom-radio,
      .pnd-select-option input[type="radio"],
      .pnd-select-item input[type="radio"],
      .kb-select-item input[type="radio"],
      .pnd-select-dropdown input[type="radio"],
      .kb-select-dropdown input[type="radio"] {
        display: none !important;
      }
      .pnd-select-option:has(input[type="radio"]:checked),
      .pnd-select-item:has(input[type="radio"]:checked),
      .kb-select-item:has(input[type="radio"]:checked) {
        background: #e0f2fe !important;
        color: #0076C5 !important;
        font-weight: 600 !important;
      }
    \`;
    (document.head || document.documentElement).appendChild(style);
  })();
`;

if (!layoutContent.includes('bisa-clean-dropdown-styles')) {
  layoutContent = layoutContent.replace(
    '// Validasi global untuk seluruh modul:',
    universalDropdownStyleCode + '\n  // Validasi global untuk seluruh modul:'
  );
  fs.writeFileSync(layoutPath, layoutContent, 'utf8');
  console.log('Injected clean dropdown styles into assets/js/layout.js');
}

// 2. Update files directly:
const filesToUpdate = [
  'Accounting/operasional/accounting_pengeluaran_beban.html',
  'Accounting/operasional/accounting_pengurangan_beban.html',
  'Accounting/operasional/accounting_pengajuan_barang_jasa.html',
  'Accounting/operasional/accounting_pendapatan.html',
  'Accounting/operasional/accounting_daftar_aset.html',
  'Accounting/operasional/accounting_kas_bank.html'
];

filesToUpdate.forEach(relPath => {
  const fullPath = path.join(__dirname, '..', relPath);
  if (!fs.existsSync(fullPath)) {
    console.warn('File not found:', relPath);
    return;
  }
  let content = fs.readFileSync(fullPath, 'utf8');

  // A. Hide .pnd-custom-radio in CSS
  content = content.replace(
    /\.pnd-custom-radio\s*\{[\s\S]*?box-sizing:\s*border-box;\s*\}/g,
    `.pnd-custom-radio {
      display: none !important;
    }`
  );

  // B. Hide input[type="radio"] in .pnd-select-option in CSS (for pengajuan barang jasa)
  content = content.replace(
    /\.pnd-select-option input\[type="radio"\]\s*\{[\s\S]*?flex-shrink:\s*0;\s*\}/g,
    `.pnd-select-option input[type="radio"] {
      display: none !important;
    }`
  );

  // C. Hide input[type="radio"] in .kb-select-item in CSS (for kas & bank)
  content = content.replace(
    /\.kb-select-item input\[type="radio"\],\s*\.kb-select-item input\[type="checkbox"\]\s*\{[\s\S]*?cursor:\s*pointer;\s*\}/g,
    `.kb-select-item input[type="radio"] {
      display: none !important;
    }
    .kb-select-item input[type="checkbox"] {
      width: 14px;
      height: 14px;
      accent-color: #0284c7;
      cursor: pointer;
    }`
  );

  // D. Remove '<span class="pnd-custom-radio"></span>' from markup and JS strings
  content = content.replace(/<span class="pnd-custom-radio"><\/span>\s*\+?/g, '');
  content = content.replace(/'<span class="pnd-custom-radio"><\/span>' \+/g, '');
  content = content.replace(/'<span class="pnd-custom-radio"><\/span>',/g, '');

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Cleaned radio circles in:', relPath);
});

console.log('All files updated successfully!');
