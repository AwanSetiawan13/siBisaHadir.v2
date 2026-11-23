const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, '../Accounting/operasional/accounting_pengeluaran_beban.html'),
  path.join(__dirname, '../Accounting/operasional/accounting_pengurangan_beban.html')
];

files.forEach(p => {
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace('<label class="pnd-label" for="pndPpn">PPN</label>', '<label class="pnd-label" for="pndPpn">PPN (Opsional)</label>');
  c = c.replace('<label class="pnd-label" for="pndTanggalBayarLama">Tanggal Bayar Lama</label>', '<label class="pnd-label" for="pndTanggalBayarLama">Tanggal Bayar Lama (Opsional)</label>');
  c = c.replace('<label class="pnd-label" for="pndJatuhTempo">Jatuh Tempo</label>', '<label class="pnd-label" for="pndJatuhTempo">Jatuh Tempo (Opsional)</label>');
  c = c.replace('<label class="pnd-label" for="pndCatatan">Catatan</label>', '<label class="pnd-label" for="pndCatatan">Catatan (Opsional)</label>');
  fs.writeFileSync(p, c, 'utf8');
  console.log('Fixed optional labels in:', p);
});
