/**
 * ============================================================================
 * PAYROLL & EXPENSE INTEGRATION ENGINE (Vanilla JS - Shared State Store)
 * Project: siBisaHadir.v2 (Bisa Media Accounting)
 * ============================================================================
 * Menyinkronkan state real-time antara:
 * - Modul Payroll (`sibisahadir_payrolls` <-> `bisa_payroll_data_v1` / `accounting_payroll_data_v1`)
 * - Modul Pengeluaran & Beban (`sibisahadir_expenses` <-> `accounting_pengeluaran_beban_data_v5`)
 * - Modul Kas & Bank (`accounting_kas_bank_v2`)
 */
(function (window) {
  'use strict';

  const PAYROLL_KEYS = [
    'sibisahadir_payrolls',
    'bisa_payroll_data_v1',
    'accounting_payroll_data_v1'
  ];

  const EXPENSE_KEYS = [
    'sibisahadir_expenses',
    'accounting_pengeluaran_beban_data_v5'
  ];

  const KAS_BANK_KEYS = [
    'accounting_kas_bank_v2',
    'accounting_kas_bank_data',
    'bisa_kas_bank_data'
  ];

  const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const MONTH_SHORT = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  function parseNumber(val) {
    if (typeof val === 'number') return Number.isFinite(val) ? Math.round(val) : 0;
    if (!val) return 0;
    const str = String(val).trim();
    const isNeg = str.startsWith('-');
    const digits = str.replace(/[^0-9]/g, '');
    if (!digits) return 0;
    const num = parseInt(digits, 10) || 0;
    return isNeg ? -num : num;
  }

  function formatRupiah(num, prefixStyle) {
    const val = Math.round(Number(num) || 0);
    const absFormatted = Math.abs(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const prefix = prefixStyle === 'no-dot' ? 'Rp ' : 'Rp. ';
    return (val < 0 ? '-' + prefix : prefix) + absFormatted;
  }

  function formatBulanTahun(val) {
    if (!val) return '';
    const str = String(val).trim();
    if (!str) return '';
    for (let i = 0; i < MONTH_NAMES.length; i++) {
      const mName = MONTH_NAMES[i];
      const mShort = MONTH_SHORT[i];
      const regex = new RegExp('(?:^|\\b)(?:\\d{1,2}\\s+)?(?:' + mName + '|' + mShort + ')\\s+(\\d{4})\\b', 'i');
      const match = str.match(regex);
      if (match) return mName + ' ' + match[1];
    }
    const isoMatch = str.match(/^(\d{4})[-/](\d{1,2})/);
    if (isoMatch) {
      const y = isoMatch[1];
      const mIdx = parseInt(isoMatch[2], 10) - 1;
      if (mIdx >= 0 && mIdx < 12) return MONTH_NAMES[mIdx] + ' ' + y;
    }
    return str;
  }

  function extractYymmFromPeriode(periodeStr) {
    const clean = formatBulanTahun(periodeStr);
    for (let i = 0; i < MONTH_NAMES.length; i++) {
      const regex = new RegExp('^' + MONTH_NAMES[i] + '\\s+(\\d{4})$', 'i');
      const m = clean.match(regex);
      if (m) {
        return m[1].slice(-2) + String(i + 1).padStart(2, '0');
      }
    }
    const now = new Date();
    return String(now.getFullYear()).slice(-2) + String(now.getMonth() + 1).padStart(2, '0');
  }

  /* ===== INITIAL SEED DATA ===== */
  function getInitialPayrollSeed() {
    return [
      {
        id: 'PAY-NOV-001',
        idKaryawan: 'KRY-001',
        periode: 'November 2026',
        nik: 'BM-2024-001',
        nama: 'Ahmad Fauzi',
        divisi: 'MCN',
        gajiPokok: 5500000,
        tunjangan: 1000000,
        bonusLembur: 500000,
        perjalananDinas: 250000,
        penerimaanLainnya: 0,
        keterlambatan: 0,
        penguranganLainnya: 0,
        potonganLain: 0,
        idPinjaman: '-',
        potonganPiutang: 0,
        idPayroll: 'PR-202611-001',
        projectBrand: 'Seluruh Kreator MCN',
        bebanBruto: 7250000,
        takeHomePay: 7250000,
        terbayarKas: 0,
        sisaPayroll: 7250000,
        status: 'Draft',
        statusPayroll: 'Draft',
        idPengeluaran: '-',
        id_pengeluaran: '-',
        bukti: 'Lihat',
        buktiName: 'Bukti Payroll',
        createdAt: 1795400001000,
        updatedAt: 1795400001000
      },
      {
        id: 'PAY-NOV-002',
        idKaryawan: 'KRY-002',
        periode: 'November 2026',
        nik: 'BM-2024-002',
        nama: 'Raka Wijaya',
        divisi: 'Marketing & Brand',
        gajiPokok: 4800000,
        tunjangan: 850000,
        bonusLembur: 350000,
        perjalananDinas: 0,
        penerimaanLainnya: 150000,
        keterlambatan: 50000,
        penguranganLainnya: 0,
        potonganLain: 0,
        idPinjaman: '-',
        potonganPiutang: 0,
        idPayroll: 'PR-202611-002',
        projectBrand: 'Campaign Brand A',
        bebanBruto: 6150000,
        takeHomePay: 6100000,
        terbayarKas: 0,
        sisaPayroll: 6100000,
        status: 'Draft',
        statusPayroll: 'Draft',
        idPengeluaran: '-',
        id_pengeluaran: '-',
        bukti: 'Lihat',
        buktiName: 'Bukti Payroll',
        createdAt: 1795400002000,
        updatedAt: 1795400002000
      },
      {
        id: 'PAY-NOV-003',
        idKaryawan: 'KRY-003',
        periode: 'November 2026',
        nik: 'BM-2024-003',
        nama: 'Dewi Lestari',
        divisi: 'Finance & Accounting',
        gajiPokok: 5000000,
        tunjangan: 900000,
        bonusLembur: 300000,
        perjalananDinas: 0,
        penerimaanLainnya: 0,
        keterlambatan: 0,
        penguranganLainnya: 0,
        potonganLain: 0,
        idPinjaman: '-',
        potonganPiutang: 0,
        idPayroll: 'PR-202611-003',
        projectBrand: 'Shopee Mega Sale',
        bebanBruto: 6200000,
        takeHomePay: 6200000,
        terbayarKas: 0,
        sisaPayroll: 6200000,
        status: 'Draft',
        statusPayroll: 'Draft',
        idPengeluaran: '-',
        id_pengeluaran: '-',
        bukti: 'Lihat',
        buktiName: 'Bukti Payroll',
        createdAt: 1795400003000,
        updatedAt: 1795400003000
      },
      {
        id: 'PAY-001',
        idKaryawan: 'KRY-001',
        periode: 'Oktober 2026',
        nik: 'BM-2024-001',
        nama: 'Ahmad Fauzi',
        divisi: 'MCN',
        gajiPokok: 5000000,
        tunjangan: 1000000,
        bonusLembur: 500000,
        perjalananDinas: 0,
        penerimaanLainnya: 0,
        keterlambatan: 0,
        penguranganLainnya: 150000,
        potonganLain: 150000,
        idPinjaman: '-',
        potonganPiutang: 0,
        idPayroll: 'PR-202610-001',
        projectBrand: 'Seluruh Kreator MCN',
        bebanBruto: 6500000,
        takeHomePay: 6350000,
        terbayarKas: 6350000,
        sisaPayroll: 0,
        status: 'Lunas',
        statusPayroll: 'Lunas',
        idPengeluaran: 'PR-REKAP-2610',
        id_pengeluaran: 'PR-REKAP-2610',
        bukti: 'Lihat',
        buktiName: 'Bukti Payroll',
        createdAt: 1792800001000,
        updatedAt: 1792800001000
      },
      {
        id: 'PAY-002',
        idKaryawan: 'KRY-002',
        periode: 'Oktober 2026',
        nik: 'BM-2024-002',
        nama: 'Raka Wijaya',
        divisi: 'Marketing & Brand',
        gajiPokok: 4500000,
        tunjangan: 750000,
        bonusLembur: 250000,
        perjalananDinas: 0,
        penerimaanLainnya: 0,
        keterlambatan: 0,
        penguranganLainnya: 0,
        potonganLain: 0,
        idPinjaman: '-',
        potonganPiutang: 0,
        idPayroll: 'PR-202610-002',
        projectBrand: 'Campaign Brand A',
        bebanBruto: 5500000,
        takeHomePay: 5500000,
        terbayarKas: 5500000,
        sisaPayroll: 0,
        status: 'Lunas',
        statusPayroll: 'Lunas',
        idPengeluaran: 'PR-REKAP-2610',
        id_pengeluaran: 'PR-REKAP-2610',
        bukti: 'Lihat',
        buktiName: 'Bukti Payroll',
        createdAt: 1792800002000,
        updatedAt: 1792800002000
      }
    ];
  }

  function getInitialExpenseSeed() {
    return [
      {
        id: 'exp-1',
        idDokumen: 'EXP-2609-001',
        id_dokumen: 'EXP-2609-001',
        idApproval: 'APR-2609-001',
        tanggalPengakuan: '2026-09-04',
        tanggal_pengakuan: '2026-09-04',
        vendorKaryawan: 'BCA',
        vendor_karyawan: 'BCA',
        divisi: 'General',
        keterangan: 'Admin Bank BCA',
        statusApproval: 'Disetujui',
        status_approval: 'Disetujui',
        kodeCoa: '5009',
        kode_coa: '5009',
        namaAkunCoa: 'Beban Administrasi Bank',
        kelompokCoa: 'Beban Operasional',
        statusCoa: 'Aktif',
        dpp: 30000,
        dpp_beban: 30000,
        ppn: 0,
        tagihanBruto: 30000,
        tagihan_bruto: 30000,
        statusBayarLama: 'Lunas',
        tanggalBayarLama: '2026-09-05',
        akunLama: 'Bank BCA - 2092026028',
        projectBrand: 'Shopee Mega Sale',
        jenis: 'Beban',
        bebanDiAkui: 30000,
        beban_diakui: 30000,
        terbayarKas: 30000,
        terbayar_kas: 30000,
        sisaUtang: 0,
        sisa_utang: 0,
        jatuhTempo: '2026-09-05',
        buktiUrl: 'detail_tracking_jualan.png',
        buktiDataUrl: '',
        invoice: '',
        catatan: 'Biaya admin transfer bulanan',
        divisiPengecualian: '',
        needsCompletion: false,
        isEditedInPengeluaran: true
      },
      {
        id: 'exp-2',
        idDokumen: 'EXP-2609-002',
        id_dokumen: 'EXP-2609-002',
        idApproval: 'APR-2609-002',
        tanggalPengakuan: '2026-09-08',
        tanggal_pengakuan: '2026-09-08',
        vendorKaryawan: 'Meta Ads',
        vendor_karyawan: 'Meta Ads',
        divisi: 'Marketing',
        keterangan: 'Iklan Digital Campaign Meta Ads',
        statusApproval: 'Disetujui',
        status_approval: 'Disetujui',
        kodeCoa: '5001',
        kode_coa: '5001',
        namaAkunCoa: 'Beban Pemasaran & Iklan',
        kelompokCoa: 'Beban Pemasaran',
        statusCoa: 'Aktif',
        dpp: 1500000,
        dpp_beban: 1500000,
        ppn: 165000,
        tagihanBruto: 1665000,
        tagihan_bruto: 1665000,
        statusBayarLama: 'Lunas',
        tanggalBayarLama: '2026-09-10',
        akunLama: 'SEABANK - 901631003438',
        projectBrand: 'Shopee Mega Sale',
        jenis: 'Beban',
        bebanDiAkui: 1500000,
        beban_diakui: 1500000,
        terbayarKas: 1665000,
        terbayar_kas: 1665000,
        sisaUtang: 0,
        sisa_utang: 0,
        jatuhTempo: '2026-09-25',
        buktiUrl: 'detail_tracking_jualan.png',
        buktiDataUrl: '',
        invoice: 'INV-FB-202610',
        catatan: 'Pengajuan campaign Facebook & Instagram Ads',
        divisiPengecualian: '',
        needsCompletion: false,
        isEditedInPengeluaran: true
      },
      {
        id: 'exp-5',
        idDokumen: 'EXP-2609-005',
        id_dokumen: 'EXP-2609-005',
        idApproval: 'APR-2609-005',
        tanggalPengakuan: '2026-10-18',
        tanggal_pengakuan: '2026-10-18',
        vendorKaryawan: 'Google Cloud',
        vendor_karyawan: 'Google Cloud',
        divisi: 'IT',
        keterangan: 'Server & Cloud Hosting Database',
        statusApproval: 'Disetujui',
        status_approval: 'Disetujui',
        kodeCoa: '5010',
        kode_coa: '5010',
        namaAkunCoa: 'Beban Server & IT',
        kelompokCoa: 'Beban Operasional',
        statusCoa: 'Aktif',
        dpp: 850000,
        dpp_beban: 850000,
        ppn: 93500,
        tagihanBruto: 943500,
        tagihan_bruto: 943500,
        statusBayarLama: 'Lunas',
        tanggalBayarLama: '2026-10-19',
        akunLama: 'BCA (Bank Central Asia)',
        projectBrand: 'Seluruh Kreator MCN',
        jenis: 'Beban',
        bebanDiAkui: 850000,
        beban_diakui: 850000,
        terbayarKas: 943500,
        terbayar_kas: 943500,
        sisaUtang: 0,
        sisa_utang: 0,
        jatuhTempo: '2026-10-25',
        buktiUrl: 'detail_tracking_jualan.png',
        buktiDataUrl: '',
        invoice: 'INV-GCP-8831',
        catatan: 'Langganan server cloud kuartal 4',
        divisiPengecualian: '',
        needsCompletion: false,
        isEditedInPengeluaran: true
      }
    ];
  }

  /* ===== KAS & BANK CHECK ===== */
  function getKasBankOutflowForRef(refCode) {
    if (!refCode || refCode === '-') return 0;
    const target = String(refCode).trim().toLowerCase();
    const targetNorm = target.replace(/[\s_\-./]/g, '');
    let total = 0;

    for (let i = 0; i < KAS_BANK_KEYS.length; i++) {
      try {
        const raw = localStorage.getItem(KAS_BANK_KEYS[i]);
        if (!raw) continue;
        const list = JSON.parse(raw);
        if (!Array.isArray(list)) continue;
        let found = false;
        list.forEach(function (tx) {
          if (!tx || typeof tx !== 'object') return;
          const ref = String(tx.referensi || tx.referensiDokumen || tx.idReferensi || '').trim().toLowerCase();
          if (!ref) return;
          const refNorm = ref.replace(/[\s_\-./]/g, '');
          const altRef = ref.startsWith('exp-') ? ('pb-' + ref.slice(4)) : (ref.startsWith('pb-') ? ('exp-' + ref.slice(3)) : ref);
          const altRefNorm = altRef.replace(/[\s_\-./]/g, '');
          if (ref === target || altRef === target || refNorm === targetNorm || altRefNorm === targetNorm) {
            found = true;
            total += parseNumber(tx.uangKeluar !== undefined ? tx.uangKeluar : (tx.nominalKeluar || tx.nominal || 0));
          }
        });
        if (found) return total;
      } catch (e) {}
    }
    return total;
  }

  /* ===== NORMALIZE PAYROLL ITEM ===== */
  function normalizePayrollItem(item) {
    if (!item || typeof item !== 'object') return null;

    const gapok = parseNumber(item.gajiPokok);
    const tunjangan = parseNumber(item.tunjangan);
    const bonus = parseNumber(item.bonusLembur);
    const dinas = parseNumber(item.perjalananDinas);
    const penerimaanLain = parseNumber(item.penerimaanLainnya);
    const keterlambatan = parseNumber(item.keterlambatan);
    const pengLain = parseNumber(item.penguranganLainnya !== undefined ? item.penguranganLainnya : item.potonganLain);
    const potPiutang = parseNumber(item.potonganPiutang);

    // Rumus Beban Bruto = Gaji Pokok + Tunjangan + Bonus/Lembur + Perjalanan Dinas + Penerimaan Lainnya
    const calcBruto = gapok + tunjangan + bonus + dinas + penerimaanLain;
    // Rumus Take Home Pay = Beban Bruto - (Keterlambatan + Pengurangan Lainnya + Potongan Piutang)
    const calcThp = calcBruto - (keterlambatan + pengLain + potPiutang);

    item.periode = formatBulanTahun(item.periode || 'November 2026');
    item.gajiPokok = gapok;
    item.tunjangan = tunjangan;
    item.bonusLembur = bonus;
    item.perjalananDinas = dinas;
    item.penerimaanLainnya = penerimaanLain;
    item.keterlambatan = keterlambatan;
    item.penguranganLainnya = pengLain;
    item.potonganLain = pengLain;
    item.potonganPiutang = potPiutang;
    item.jedaUtang = Boolean(item.jedaUtang);
    item.bebanBruto = calcBruto;
    item.takeHomePay = calcThp;

    let idPeng = String(item.idPengeluaran || item.id_pengeluaran || '-').trim();
    if (!idPeng) idPeng = '-';
    if (idPeng !== '-' && /^EXP-/i.test(idPeng)) {
      if (!item.idDokumenExpense) item.idDokumenExpense = idPeng;
      idPeng = 'PR-REKAP-' + extractYymmFromPeriode(item.periode);
    }
    item.idPengeluaran = idPeng;
    item.id_pengeluaran = idPeng;

    let status = String(item.status || item.statusPayroll || '').trim();
    if (!status) {
      if (idPeng !== '-') {
        status = 'Posted ke Beban';
      } else if (parseNumber(item.terbayarKas) >= calcThp && calcThp > 0) {
        status = 'Lunas';
      } else {
        status = 'Draft';
      }
    }

    // Cek pelunasan dari Kas & Bank baik lewat ID Pengeluaran kolektif (PR-REKAP-YYMM / EXP-YYMM-XXX) maupun ID Payroll individu
    const kbByExp = idPeng !== '-' ? getKasBankOutflowForRef(idPeng) : 0;
    const kbByDocExp = item.idDokumenExpense ? getKasBankOutflowForRef(item.idDokumenExpense) : 0;
    const kbByPr = item.idPayroll ? getKasBankOutflowForRef(item.idPayroll) : 0;
    const totalKbOut = kbByExp + kbByDocExp + kbByPr;

    if (totalKbOut > 0 || status === 'Lunas') {
      if (kbByExp > 0 || kbByDocExp > 0 || kbByPr >= calcThp || status === 'Lunas') {
        status = 'Lunas';
        item.terbayarKas = calcThp;
        item.sisaPayroll = 0;
      } else if (kbByPr > 0) {
        item.terbayarKas = kbByPr;
        item.sisaPayroll = Math.max(0, calcThp - kbByPr);
      }
    } else if (status === 'Draft' || status === 'Posted ke Beban') {
      item.terbayarKas = 0;
      item.sisaPayroll = Math.max(0, calcThp);
    }

    item.status = status;
    item.statusPayroll = status;

    return item;
  }

  /* ===== NORMALIZE EXPENSE ITEM ===== */
  function normalizeExpenseItem(item) {
    if (!item || typeof item !== 'object') return null;

    const idDok = String(item.idDokumen || item.id_dokumen || '').trim();
    const tgl = String(item.tanggalPengakuan || item.tanggal_pengakuan || '').trim();
    const vendor = String(item.vendorKaryawan || item.vendor_karyawan || '').trim();
    const stApp = String(item.statusApproval || item.status_approval || 'Disetujui').trim();
    const rawCoa = String(item.kodeCoa || item.kode_coa || '').trim();
    const coaCodeOnly = rawCoa.includes(' - ') ? rawCoa.split(' - ')[0].trim() : (rawCoa.includes(' | ') ? rawCoa.split(' | ')[0].trim() : rawCoa);
    const coaNameOnly = item.namaAkunCoa || (rawCoa.includes(' - ') ? rawCoa.split(' - ').slice(1).join(' - ').trim() : (rawCoa.includes(' | ') ? rawCoa.split(' | ').slice(1).join(' | ').trim() : ''));

    const dppVal = parseNumber(item.dpp !== undefined ? item.dpp : item.dpp_beban);
    const ppnVal = parseNumber(item.ppn);
    const brutoVal = parseNumber(item.tagihanBruto !== undefined ? item.tagihanBruto : (item.tagihan_bruto !== undefined ? item.tagihan_bruto : (dppVal + ppnVal)));
    const bebanVal = parseNumber(item.bebanDiAkui !== undefined ? item.bebanDiAkui : (item.beban_diakui !== undefined ? item.beban_diakui : dppVal));

    const kbOut = getKasBankOutflowForRef(idDok);
    const terbayarVal = kbOut > 0 ? kbOut : parseNumber(item.terbayarKas !== undefined ? item.terbayarKas : item.terbayar_kas);
    const sisaVal = Math.max(0, brutoVal - terbayarVal);

    item.id = item.id || ('exp-' + idDok.toLowerCase().replace(/[^a-z0-9]/g, ''));
    item.idDokumen = idDok;
    item.id_dokumen = idDok;
    item.tanggalPengakuan = tgl;
    item.tanggal_pengakuan = tgl;
    item.vendorKaryawan = vendor;
    item.vendor_karyawan = vendor;
    item.statusApproval = stApp;
    item.status_approval = stApp;
    item.kodeCoa = coaCodeOnly || rawCoa;
    item.kode_coa = rawCoa || coaCodeOnly;
    if (coaNameOnly && !item.namaAkunCoa) item.namaAkunCoa = coaNameOnly;
    if (!item.kelompokCoa) item.kelompokCoa = 'Beban Operasional';
    if (!item.statusCoa) item.statusCoa = 'Aktif';

    item.dpp = dppVal;
    item.dpp_beban = dppVal;
    item.tagihanBruto = brutoVal;
    item.tagihan_bruto = brutoVal;
    item.bebanDiAkui = bebanVal;
    item.beban_diakui = bebanVal;
    item.terbayarKas = terbayarVal;
    item.terbayar_kas = terbayarVal;
    item.sisaUtang = sisaVal;
    item.sisa_utang = sisaVal;

    if (item.source_type === 'payroll' || item.sourceType === 'payroll') {
      item.source_type = 'payroll';
      item.sourceType = 'payroll';
      const rekapId = 'PR-REKAP-' + extractYymmFromPeriode(item.payroll_period || item.payrollPeriod || '');
      item.idApproval = (item.idApproval && /^PR-REKAP-/i.test(String(item.idApproval))) ? item.idApproval : rekapId;
      item.jenis = item.jenis || 'Beban Payroll';
      if (!item.isManuallyEditedCoa) {
        item.kodeCoa = '';
        item.kode_coa = '';
        item.namaAkunCoa = '';
        item.kelompokCoa = '';
        item.statusCoa = '';
        item.needsCompletion = true;
        item.isEditedInPengeluaran = false;
      } else {
        item.needsCompletion = false;
        item.isEditedInPengeluaran = true;
      }
    }

    return item;
  }

  /* ===== LOAD & SAVE PAYROLLS ===== */
  function getPayrolls() {
    let list = null;
    for (let i = 0; i < PAYROLL_KEYS.length; i++) {
      try {
        const raw = localStorage.getItem(PAYROLL_KEYS[i]);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            list = parsed;
            break;
          }
        }
      } catch (e) {}
    }

    if (!list || list.length === 0) {
      list = getInitialPayrollSeed();
      savePayrolls(list, true);
    } else {
      // Pastikan ada data November 2026 Draft jika dari seed lama hanya ada 2 record Oktober 2026
      const hasNov = list.some(function (it) {
        return it && formatBulanTahun(it.periode).toLowerCase() === 'november 2026';
      });
      const isLegacyOnlyOct = list.length === 2 && list.every(function (it) {
        return it && formatBulanTahun(it.periode).toLowerCase() === 'oktober 2026' && !it.status && !it.statusPayroll;
      });
      if (!hasNov && isLegacyOnlyOct) {
        const novSeeds = getInitialPayrollSeed().filter(function (s) {
          return s.periode === 'November 2026';
        });
        list = novSeeds.concat(list);
      }
      list = list.map(normalizePayrollItem).filter(Boolean);
      savePayrolls(list, true);
    }
    return list;
  }

  function savePayrolls(list, silent) {
    const normalized = (Array.isArray(list) ? list : []).map(normalizePayrollItem).filter(Boolean);
    const json = JSON.stringify(normalized);
    PAYROLL_KEYS.forEach(function (k) {
      try {
        localStorage.setItem(k, json);
      } catch (e) {
        // Fallback strip large base64 images if quota exceeded
        try {
          const stripped = normalized.map(function (it) {
            const c = Object.assign({}, it);
            if (c.buktiImg && c.buktiImg.length > 40000) c.buktiImg = '';
            if (c.slipGajiImg && c.slipGajiImg.length > 40000) c.slipGajiImg = '';
            return c;
          });
          localStorage.setItem(k, JSON.stringify(stripped));
        } catch (e2) {}
      }
    });
    if (!silent) {
      // Sinkronkan projectBrand dari Payroll ke item PR-REKAP-... yang sudah ada di Pengeluaran & Beban
      try {
        const expList = getExpenses();
        let expChanged = false;
        expList.forEach(function (ex) {
          if (!ex) return;
          const isPr = String(ex.source_type || ex.sourceType || '').toLowerCase() === 'payroll' || /^PR-/i.test(String(ex.idApproval || ''));
          if (!isPr) return;
          const exApr = String(ex.idApproval || '').trim().toLowerCase();
          const exDoc = String(ex.idDokumen || '').trim().toLowerCase();
          const exPeriod = String(ex.payroll_period || ex.payrollPeriod || '').trim().toLowerCase();
          const matchedPayrolls = normalized.filter(function (py) {
            if (!py) return false;
            const pyPeng = String(py.idPengeluaran || py.id_pengeluaran || '').trim().toLowerCase();
            const pyDoc = String(py.idDokumenExpense || '').trim().toLowerCase();
            const pyPeriod = String(py.periode || '').trim().toLowerCase();
            return (exApr && pyPeng === exApr) || (exDoc && pyDoc === exDoc) || (exPeriod && pyPeriod === exPeriod);
          });
          if (matchedPayrolls.length === 0) return;

          const empMap = new Map();
          const pbList = [];
          const pbSeen = new Set();
          matchedPayrolls.forEach(function (py) {
            const pb = String(py.projectBrand || '').trim();
            if (pb && pb !== '-' && pb.toLowerCase() !== '- tanpa project / brand -') {
              if (py.idPayroll) empMap.set(String(py.idPayroll).trim().toLowerCase(), pb);
              if (py.id) empMap.set(String(py.id).trim().toLowerCase(), pb);
              if (!pbSeen.has(pb.toLowerCase())) {
                pbSeen.add(pb.toLowerCase());
                pbList.push(pb);
              }
            }
          });
          if (Array.isArray(ex.payroll_employees) && empMap.size > 0) {
            ex.payroll_employees.forEach(function (emp) {
              if (!emp) return;
              const k1 = String(emp.idPayroll || '').trim().toLowerCase();
              const k2 = String(emp.id || '').trim().toLowerCase();
              const foundPb = (k1 && empMap.get(k1)) || (k2 && empMap.get(k2)) || '';
              if (foundPb && emp.projectBrand !== foundPb) {
                emp.projectBrand = foundPb;
                expChanged = true;
              }
            });
          }
          const nextPb = pbList.join(', ');
          if (nextPb && ex.projectBrand !== nextPb) {
            ex.projectBrand = nextPb;
            expChanged = true;
          }
        });
        if (expChanged) {
          saveExpenses(expList, false);
        }
      } catch (eSyncPb) {}

      try {
        window.dispatchEvent(new CustomEvent('payroll_data_changed', { detail: normalized }));
      } catch (e) {}
    }
    return normalized;
  }

  /* ===== LOAD & SAVE EXPENSES ===== */
  function getExpenses() {
    let primaryList = [];
    let legacyList = [];

    try {
      const raw1 = localStorage.getItem('sibisahadir_expenses');
      if (raw1) {
        const p1 = JSON.parse(raw1);
        if (Array.isArray(p1)) primaryList = p1;
      }
    } catch (e) {}

    try {
      const raw2 = localStorage.getItem('accounting_pengeluaran_beban_data_v5');
      if (raw2) {
        const p2 = JSON.parse(raw2);
        if (Array.isArray(p2)) legacyList = p2;
      }
    } catch (e) {}

    let merged = [];
    const seenDocs = new Set();

    function addItems(arr) {
      (arr || []).forEach(function (it) {
        if (!it || typeof it !== 'object') return;
        const norm = normalizeExpenseItem(Object.assign({}, it));
        if (!norm) return;
        const key = String(norm.idDokumen || norm.id || '').trim().toLowerCase();
        if (key && !seenDocs.has(key)) {
          seenDocs.add(key);
          merged.push(norm);
        }
      });
    }

    // Prioritaskan item payroll kolektif agar berada di baris paling atas
    addItems(primaryList.filter(function (x) { return x && (x.source_type === 'payroll' || x.sourceType === 'payroll'); }));
    addItems(legacyList.filter(function (x) { return x && (x.source_type === 'payroll' || x.sourceType === 'payroll'); }));
    addItems(legacyList);
    addItems(primaryList);

    if (merged.length === 0) {
      merged = getInitialExpenseSeed().map(normalizeExpenseItem);
    }

    saveExpenses(merged, true);
    return merged;
  }

  function saveExpenses(list, silent) {
    const normalized = (Array.isArray(list) ? list : []).map(normalizeExpenseItem).filter(Boolean);
    const json = JSON.stringify(normalized);
    EXPENSE_KEYS.forEach(function (k) {
      try {
        localStorage.setItem(k, json);
      } catch (e) {}
    });
    if (!silent) {
      try {
        window.dispatchEvent(new CustomEvent('pengeluaranBebanUpdated', { detail: normalized }));
      } catch (e) {}
    }
    return normalized;
  }

  /* ===== GENERATE NEXT EXPENSE DOCUMENT ID ===== */
  function generateNextExpenseDocId(periodeStr, existingExpenses) {
    const yymm = extractYymmFromPeriode(periodeStr);
    const prefix = 'EXP-' + yymm + '-';
    const list = Array.isArray(existingExpenses) ? existingExpenses : getExpenses();
    let maxNum = 0;

    list.forEach(function (it) {
      if (!it) return;
      const docId = String(it.idDokumen || it.id_dokumen || '').trim();
      if (docId.toUpperCase().startsWith(prefix.toUpperCase())) {
        const num = parseInt(docId.slice(prefix.length), 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });

    const nextSeq = maxNum + 1;
    return prefix + String(nextSeq).padStart(3, '0');
  }

  /* ===== POST COLLECTIVE PAYROLL FOR PERIOD ===== */
  function postPayrollPeriodToExpenses(periodeStr) {
    const cleanPeriod = formatBulanTahun(periodeStr);
    const allPayrolls = getPayrolls();
    const draftItems = allPayrolls.filter(function (it) {
      return formatBulanTahun(it.periode).toLowerCase() === cleanPeriod.toLowerCase() &&
             String(it.status || it.statusPayroll || 'Draft').toLowerCase() === 'draft';
    });

    if (draftItems.length === 0) {
      return {
        ok: false,
        message: 'Tidak ada data payroll berstatus Draft pada periode ' + cleanPeriod + '.'
      };
    }

    const expenses = getExpenses();
    const newDocId = generateNextExpenseDocId(cleanPeriod, expenses);
    const todayIso = new Date().toISOString().slice(0, 10);

    let totalBruto = 0;
    let totalThp = 0;
    const employeeDetails = [];
    const pbSet = [];
    const pbSeen = new Set();

    draftItems.forEach(function (item) {
      const bruto = parseNumber(item.bebanBruto);
      const thp = parseNumber(item.takeHomePay);
      const rawPb = String(item.projectBrand || '').trim();
      if (rawPb && rawPb !== '-' && rawPb.toLowerCase() !== '- tanpa project / brand -') {
        const pbKey = rawPb.toLowerCase();
        if (!pbSeen.has(pbKey)) {
          pbSeen.add(pbKey);
          pbSet.push(rawPb);
        }
      }
      totalBruto += bruto;
      totalThp += thp;
      employeeDetails.push({
        id: item.id,
        idPayroll: item.idPayroll || '-',
        idKaryawan: item.idKaryawan || '-',
        nik: item.nik || '-',
        nama: item.nama || '-',
        divisi: item.divisi || '-',
        projectBrand: rawPb || '-',
        bebanBruto: bruto,
        takeHomePay: thp
      });
    });

    const collectiveProjectBrand = pbSet.length > 0 ? pbSet.join(', ') : '-';

    const empCount = draftItems.length;
    const yymm = extractYymmFromPeriode(cleanPeriod);
    const rekapApprovalId = 'PR-REKAP-' + yymm;

    const newExpenseObj = normalizeExpenseItem({
      id: 'exp-payroll-' + Date.now(),
      id_dokumen: newDocId,
      idDokumen: newDocId,
      idApproval: rekapApprovalId,
      source_type: 'payroll',
      sourceType: 'payroll',
      payroll_period: cleanPeriod,
      payrollPeriod: cleanPeriod,
      payroll_count: empCount,
      payroll_employees: employeeDetails,
      total_beban_bruto: totalBruto,
      total_take_home_pay: totalThp,
      tanggal_pengakuan: todayIso,
      tanggalPengakuan: todayIso,
      vendor_karyawan: 'Kolektif Payroll - ' + cleanPeriod + ' (' + empCount + ' Karyawan)',
      vendorKaryawan: 'Kolektif Payroll - ' + cleanPeriod + ' (' + empCount + ' Karyawan)',
      divisi: 'Multi-Divisi',
      keterangan: 'Pembayaran Payroll Periode ' + cleanPeriod,
      kode_coa: '',
      kodeCoa: '',
      namaAkunCoa: '',
      kelompokCoa: '',
      statusCoa: '',
      isManuallyEditedCoa: false,
      dpp_beban: totalThp,
      dpp: totalThp,
      ppn: 0,
      ppnType: '',
      totalPpn: 0,
      tagihan_bruto: totalThp,
      tagihanBruto: totalThp,
      beban_diakui: totalThp,
      bebanDiAkui: totalThp,
      terbayar_kas: 0,
      terbayarKas: 0,
      sisa_utang: totalThp,
      sisaUtang: totalThp,
      status_approval: 'Disetujui',
      statusApproval: 'Disetujui',
      statusBayarLama: 'Belum Lunas',
      tanggalBayarLama: '',
      akunLama: '-',
      projectBrand: collectiveProjectBrand,
      jenis: 'Beban Payroll',
      jatuhTempo: todayIso,
      buktiUrl: 'rekap_payroll_' + yymm + '.pdf',
      invoice: 'REKAP-' + rekapApprovalId,
      catatan: 'Posting kolektif otomatis dari modul Payroll (' + empCount + ' karyawan, Total Beban Bruto: ' + formatRupiah(totalBruto) + ')',
      divisiPengecualian: '',
      needsCompletion: true,
      isEditedInPengeluaran: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    // Update seluruh item payroll Draft pada periode tersebut (konsisten menggunakan ID PR-REKAP-YYMM seperti di ID Approval Pengeluaran & Beban)
    const updatedPayrolls = allPayrolls.map(function (it) {
      if (formatBulanTahun(it.periode).toLowerCase() === cleanPeriod.toLowerCase() &&
          String(it.status || it.statusPayroll || 'Draft').toLowerCase() === 'draft') {
        it.status = 'Posted ke Beban';
        it.statusPayroll = 'Posted ke Beban';
        it.idPengeluaran = rekapApprovalId;
        it.id_pengeluaran = rekapApprovalId;
        it.idDokumenExpense = newDocId;
        it.updatedAt = Date.now();
        if (it.idPinjaman && it.idPinjaman !== '-' && it.jedaUtang === true &&
            window.LoanEngine && typeof window.LoanEngine.pauseLoanInstallment === 'function') {
          window.LoanEngine.pauseLoanInstallment(it.idPinjaman, cleanPeriod);
        }
      }
      return it;
    });

    // Taruh transaksi pengeluaran payroll baru di baris paling atas
    expenses.unshift(newExpenseObj);

    savePayrolls(updatedPayrolls, false);
    saveExpenses(expenses, false);

    if (typeof window.recordAccountingReferensiUpdate === 'function') {
      window.recordAccountingReferensiUpdate(newDocId);
      window.recordAccountingReferensiUpdate(rekapApprovalId);
    }

    return {
      ok: true,
      idDokumen: newDocId,
      idPengeluaran: rekapApprovalId,
      periode: cleanPeriod,
      count: empCount,
      totalBebanBruto: totalBruto,
      totalTakeHomePay: totalThp,
      expense: newExpenseObj
    };
  }

  /* ===== GET EMPLOYEES FOR POSTED EXPENSE ===== */
  function getPayrollEmployeesForExpense(expenseItem) {
    if (!expenseItem) return [];
    const docId = String(expenseItem.idDokumen || expenseItem.id_dokumen || '').trim();
    const aprId = String(expenseItem.idApproval || '').trim();
    const period = formatBulanTahun(expenseItem.payroll_period || expenseItem.payrollPeriod || '');
    const allPayrolls = getPayrolls();

    const matched = allPayrolls.filter(function (p) {
      if (!p) return false;
      const pExpId = String(p.idPengeluaran || p.id_pengeluaran || '').trim();
      const pDocExp = String(p.idDokumenExpense || '').trim();
      if (aprId && pExpId && pExpId.toLowerCase() === aprId.toLowerCase()) return true;
      if (docId && ((pExpId && pExpId.toLowerCase() === docId.toLowerCase()) || (pDocExp && pDocExp.toLowerCase() === docId.toLowerCase()))) return true;
      if (period && formatBulanTahun(p.periode).toLowerCase() === period.toLowerCase() && pExpId !== '-') return true;
      return false;
    });

    if (matched.length > 0) return matched;
    if (Array.isArray(expenseItem.payroll_employees)) return expenseItem.payroll_employees;
    return [];
  }

  /* ===== RESET DEMO DATA ===== */
  function resetDemoData() {
    const seedPayrolls = getInitialPayrollSeed();
    const seedExpenses = getInitialExpenseSeed();
    savePayrolls(seedPayrolls, false);
    saveExpenses(seedExpenses, false);
    return {
      payrolls: seedPayrolls,
      expenses: seedExpenses
    };
  }

  window.BisaPayrollEngine = {
    PAYROLL_KEYS: PAYROLL_KEYS,
    EXPENSE_KEYS: EXPENSE_KEYS,
    parseNumber: parseNumber,
    formatRupiah: formatRupiah,
    formatBulanTahun: formatBulanTahun,
    extractYymmFromPeriode: extractYymmFromPeriode,
    getPayrolls: getPayrolls,
    savePayrolls: savePayrolls,
    getExpenses: getExpenses,
    saveExpenses: saveExpenses,
    normalizePayrollItem: normalizePayrollItem,
    normalizeExpenseItem: normalizeExpenseItem,
    generateNextExpenseDocId: generateNextExpenseDocId,
    postPayrollPeriodToExpenses: postPayrollPeriodToExpenses,
    getPayrollEmployeesForExpense: getPayrollEmployeesForExpense,
    getKasBankOutflowForRef: getKasBankOutflowForRef,
    resetDemoData: resetDemoData
  };
})(window);
