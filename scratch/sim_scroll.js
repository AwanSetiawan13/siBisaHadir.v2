const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const BASE_DIR = 'd:/SOFTWARE/laragon/www/siBisaHadir.v2';
const PORT = 9464;

const bottomOperasionalPages = [
  'Accounting/operasional/accounting_mutasi_aset.html',
  'Accounting/operasional/accounting_alokasi_aset_project.html',
  'Accounting/operasional/accounting_utang_karyawan.html',
  'Accounting/operasional/accounting_piutang_karyawan.html',
  'Accounting/operasional/accounting_budget_vs_actual.html',
  'Accounting/operasional/accounting_pengajuan_barang_jasa.html',
  'Accounting/operasional/accounting_tagihan_berkala.html'
];

// Let's test how this formula behaves across all bottom modules
console.log('Testing formula simulation...');
bottomOperasionalPages.forEach(p => {
  console.log('Target:', p.split('/').pop());
});
