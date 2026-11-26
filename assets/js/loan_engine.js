/**
 * ============================================================================
 * LOAN ENGINE (Piutang Karyawan) — Vanilla JS Shared State Store
 * Project : siBisaHadir.v2 (Bisa Media Accounting)
 * Storage : sibisahadir_loans  (array of loan objects)
 * ============================================================================
 * Alur Bisnis:
 *  - Pinjaman karyawan langsung berstatus `Berjalan` saat diinput (`sisaUtang > 0`)
 *  - Tidak ada relasi ke Pengeluaran & Beban maupun Kas & Bank
 *  - Cicilan otomatis dipotong di modul Payroll (`Potong Gaji`) sesuai pokok & tenor
 *  - Otomatis berubah menjadi `Lunas` saat `sisaUtang === 0`
 */
(function (window) {
  'use strict';

  var LOAN_KEY = 'sibisahadir_loans';

  var STATUS = {
    BERJALAN : 'Berjalan',
    LUNAS    : 'Lunas'
  };

  function parseNum(v) {
    if (typeof v === 'number') return isFinite(v) ? Math.round(v) : 0;
    return parseInt(String(v || '0').replace(/[^0-9]/g, ''), 10) || 0;
  }

  function formatRupiah(n) {
    var v = Math.round(Number(n) || 0);
    return 'Rp. ' + Math.abs(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function todayISO() {
    return new Date().toISOString().split('T')[0];
  }

  function addMonths(isoDateStr, months) {
    if (!isoDateStr || isoDateStr === '-') return '-';
    var parts = String(isoDateStr).split('-');
    if (parts.length !== 3) return isoDateStr;
    var y = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10) - 1;
    var d = parseInt(parts[2], 10);
    var dt = new Date(y, m + months, d);
    if (dt.getMonth() !== ((m + months) % 12 + 12) % 12) {
      dt = new Date(y, m + months + 1, 0);
    }
    return dt.getFullYear() + '-' +
      String(dt.getMonth() + 1).padStart(2, '0') + '-' +
      String(dt.getDate()).padStart(2, '0');
  }

  function deriveStatus(loan) {
    var sisa = parseNum(loan && loan.sisaUtang);
    return sisa <= 0 ? STATUS.LUNAS : STATUS.BERJALAN;
  }

  function generateLoanId(list) {
    var now = new Date();
    var yymm = now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0');
    var prefix = 'LOAN-' + yymm + '-';
    var maxNum = 0;
    (list || []).forEach(function (it) {
      var id = String(it.idPinjaman || it.idPinjam || '');
      if (id.startsWith(prefix)) {
        var n = parseInt(id.replace(prefix, ''), 10);
        if (!isNaN(n) && n > maxNum) maxNum = n;
      }
    });
    return prefix + String(maxNum + 1).padStart(3, '0');
  }

  function readLoanList() {
    try {
      var raw = localStorage.getItem(LOAN_KEY);
      if (raw) {
        var arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length > 0) return arr;
      }
    } catch (e) {}
    return null;
  }

  function writeLoanList(list) {
    try {
      localStorage.setItem(LOAN_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('utang_karyawan_data_changed', { detail: list }));
      window.dispatchEvent(new CustomEvent('piutang_karyawan_data_changed', { detail: list }));
    } catch (e) {}
  }

  function getSeedData() {
    return [
      {
        idPinjaman   : 'LOAN-202610-001',
        idPinjam     : 'LOAN-202610-001',
        tglPinjam    : '2026-10-01',
        tanggalPinjam: '2026-10-01',
        idKaryawan   : 'KRY-001',
        nik          : 'BM-2024-001',
        namaKaryawan : 'Ahmad Fauzi',
        nama         : 'Ahmad Fauzi',
        divisi       : 'MCN',
        selesaiKontrak: '2027-08-01',
        pokokPinjaman : 5000000,
        tenorBulan   : 10,
        tenor        : 10,
        cicilanBulan : 500000,
        totalBayar   : 0,
        sisaUtang    : 5000000,
        jatuhTempoBerikutnya: '2026-11-01',
        jatuhTempo   : '2026-11-01',
        status       : 'Berjalan',
        paidPeriods  : [],
        paymentHistory: [],
        createdAt    : Date.now() - 7776000000,
        updatedAt    : Date.now() - 2592000000
      },
      {
        idPinjaman   : 'LOAN-202611-001',
        idPinjam     : 'LOAN-202611-001',
        tglPinjam    : '2026-11-01',
        tanggalPinjam: '2026-11-01',
        idKaryawan   : 'KRY-002',
        nik          : 'BM-2024-002',
        namaKaryawan : 'Raka Wijaya',
        nama         : 'Raka Wijaya',
        divisi       : 'Marketing & Brand',
        selesaiKontrak: '2027-05-01',
        pokokPinjaman : 3000000,
        tenorBulan   : 6,
        tenor        : 6,
        cicilanBulan : 500000,
        totalBayar   : 0,
        sisaUtang    : 3000000,
        jatuhTempoBerikutnya: '2026-12-01',
        jatuhTempo   : '2026-12-01',
        status       : 'Berjalan',
        paidPeriods  : [],
        paymentHistory: [],
        createdAt    : Date.now() - 2592000000,
        updatedAt    : Date.now() - 86400000
      },
      {
        idPinjaman   : 'LOAN-202611-002',
        idPinjam     : 'LOAN-202611-002',
        tglPinjam    : '2026-11-10',
        tanggalPinjam: '2026-11-10',
        idKaryawan   : 'KRY-003',
        nik          : 'BM-2024-003',
        namaKaryawan : 'Dewi Lestari',
        nama         : 'Dewi Lestari',
        divisi       : 'Finance & Accounting',
        selesaiKontrak: '2027-03-10',
        pokokPinjaman : 2000000,
        tenorBulan   : 4,
        tenor        : 4,
        cicilanBulan : 500000,
        totalBayar   : 0,
        sisaUtang    : 2000000,
        jatuhTempoBerikutnya: '2026-12-10',
        jatuhTempo   : '2026-12-10',
        status       : 'Berjalan',
        paidPeriods  : [],
        createdAt    : Date.now() - 1296000000,
        updatedAt    : Date.now() - 86400000
      }
    ];
  }

  function getOrInitLoans() {
    var list = readLoanList();
    if (list) {
      // Normalize legacy statuses (Menunggu/Disetujui) -> Berjalan
      var normalized = false;
      list.forEach(function (it) {
        var st = deriveStatus(it);
        if (it.status !== st) {
          it.status = st;
          normalized = true;
        }
      });
      if (normalized) writeLoanList(list);
      return list;
    }
    var seed = getSeedData();
    writeLoanList(seed);
    return seed;
  }

  /* ===== POTONG GAJI DARI PAYROLL ===== */
  function payLoanInstallment(loanId, amount, periodLabel) {
    var list = getOrInitLoans();
    var loan = list.find(function (it) {
      return (it.idPinjaman || it.idPinjam) === loanId;
    });
    if (!loan) return false;
    var curSisa = parseNum(loan.sisaUtang);
    if (curSisa <= 0) return false;

    if (periodLabel) {
      var normPeriod = String(periodLabel).trim().toLowerCase();
      loan.paidPeriods = Array.isArray(loan.paidPeriods) ? loan.paidPeriods : [];
      if (loan.paidPeriods.indexOf(normPeriod) !== -1) {
        return false; // Sudah dipotong di periode ini
      }
      loan.paidPeriods.push(normPeriod);
    }

    var amt = Math.min(curSisa, parseNum(amount));
    if (amt <= 0) return false;

    var sisa = Math.max(0, curSisa - amt);
    loan.totalBayar = parseNum(loan.totalBayar) + amt;
    loan.sisaUtang  = sisa;
    loan.sisa_utang = sisa;
    loan.status     = sisa <= 0 ? STATUS.LUNAS : STATUS.BERJALAN;
    if (sisa > 0 && loan.jatuhTempoBerikutnya && loan.jatuhTempoBerikutnya !== '-') {
      var nextJt = addMonths(loan.jatuhTempoBerikutnya, 1);
      loan.jatuhTempoBerikutnya = nextJt;
      loan.jatuhTempo = nextJt;
    }
    loan.paymentHistory = Array.isArray(loan.paymentHistory) ? loan.paymentHistory : [];
    loan.paymentHistory.push({
      periode: periodLabel || '-',
      tanggal: todayISO(),
      metode: 'Potong Gaji (Payroll & Kas Bank)',
      nominal: amt,
      sisaSetelah: sisa,
      statusSetelah: sisa <= 0 ? STATUS.LUNAS : STATUS.BERJALAN
    });
    loan.updatedAt = Date.now();
    writeLoanList(list);
    return true;
  }

  /* ===== JEDA UTANG DARI PAYROLL (GAJI FULL, JATUH TEMPO +1 BULAN, UTANG TIDAK BERKURANG) ===== */
  function pauseLoanInstallment(loanId, periodLabel) {
    var list = getOrInitLoans();
    var loan = list.find(function (it) {
      return (it.idPinjaman || it.idPinjam) === loanId;
    });
    if (!loan) return false;
    var curSisa = parseNum(loan.sisaUtang);
    if (curSisa <= 0) return false;

    if (periodLabel) {
      var normPeriod = String(periodLabel).trim().toLowerCase();
      loan.pausedPeriods = Array.isArray(loan.pausedPeriods) ? loan.pausedPeriods : [];
      if (loan.pausedPeriods.indexOf(normPeriod) !== -1) {
        return false; // Sudah dijeda di periode ini
      }
      loan.pausedPeriods.push(normPeriod);
    }

    if (loan.jatuhTempoBerikutnya && loan.jatuhTempoBerikutnya !== '-') {
      var nextJt = addMonths(loan.jatuhTempoBerikutnya, 1);
      loan.jatuhTempoBerikutnya = nextJt;
      loan.jatuhTempo = nextJt;
    }
    if (loan.selesaiKontrak && loan.selesaiKontrak !== '-') {
      loan.selesaiKontrak = addMonths(loan.selesaiKontrak, 1);
    }
    loan.paymentHistory = Array.isArray(loan.paymentHistory) ? loan.paymentHistory : [];
    loan.paymentHistory.push({
      periode: periodLabel || '-',
      tanggal: todayISO(),
      metode: 'Jeda Utang (Payroll — Jatuh Tempo +1 Bln)',
      nominal: 0,
      sisaSetelah: curSisa,
      statusSetelah: 'Dijeda'
    });
    loan.updatedAt = Date.now();
    writeLoanList(list);
    return true;
  }

  /* ===== SINKRONISASI OTOMATIS DENGAN PAYROLL & KAS & BANK ===== */
  function getKasBankOutflowDetails() {
    var map = {};
    var kbKeys = ['accounting_kas_bank_v2', 'accounting_kas_bank_data', 'bisa_kas_bank_data'];
    for (var i = 0; i < kbKeys.length; i++) {
      try {
        var raw = localStorage.getItem(kbKeys[i]);
        if (!raw) continue;
        var list = JSON.parse(raw);
        if (!Array.isArray(list) || list.length === 0) continue;
        list.forEach(function (tx) {
          if (!tx || typeof tx !== 'object') return;
          var ref = String(tx.referensi || tx.kodeReferensi || tx.refDokumen || tx.idRef || '').trim().toLowerCase();
          var keluar = parseNum(tx.uangKeluar !== undefined ? tx.uangKeluar : (tx.nominal || 0));
          if (ref && keluar > 0) {
            if (!map[ref]) {
              map[ref] = { total: 0, tanggal: tx.tanggal || tx.tglTransaksi || '', idTransaksi: tx.idTransaksi || tx.id || '' };
            }
            map[ref].total += keluar;
            if (!map[ref].tanggal && (tx.tanggal || tx.tglTransaksi)) {
              map[ref].tanggal = tx.tanggal || tx.tglTransaksi;
            }
          }
        });
        break;
      } catch (e) {}
    }
    return map;
  }

  function readAllPayrolls() {
    var payrollKeys = ['sibisahadir_payrolls', 'bisa_payroll_data_v1', 'accounting_payroll_data_v1'];
    for (var i = 0; i < payrollKeys.length; i++) {
      try {
        var raw = localStorage.getItem(payrollKeys[i]);
        if (!raw) continue;
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [];
  }

  function getRealPayrollHistoryForLoan(loan) {
    if (!loan || typeof loan !== 'object') return [];
    var idLoan = String(loan.idPinjaman || loan.idPinjam || '').trim().toLowerCase();
    var loanNik = String(loan.nik || '').trim().toLowerCase();
    var loanIdKry = String(loan.idKaryawan || '').trim().toLowerCase();
    if (!idLoan && !loanNik && !loanIdKry) return [];

    var payrolls = readAllPayrolls();
    var kbMap = getKasBankOutflowDetails();
    var pokok = parseNum(loan.pokokPinjaman);
    var runningSisa = pokok;
    var entries = [];

    // Sort oldest -> newest so sisaSetelah calculates chronologically
    var matched = payrolls.filter(function (row) {
      if (!row || typeof row !== 'object') return false;
      var rLoan = String(row.idPinjaman || '').trim().toLowerCase();
      var rNik = String(row.nik || '').trim().toLowerCase();
      var rKry = String(row.idKaryawan || '').trim().toLowerCase();
      if (idLoan && rLoan && rLoan !== '-') return rLoan === idLoan;
      return (loanIdKry && rKry === loanIdKry) || (loanNik && rNik === loanNik);
    }).slice().sort(function (a, b) {
      return (Number(a.createdAt) || 0) - (Number(b.createdAt) || 0);
    });

    matched.forEach(function (row) {
      var idPr = String(row.idPayroll || '').trim();
      var idPeng = String(row.idPengeluaran || row.id_pengeluaran || '').trim();
      var idDocExp = String(row.idDokumenExpense || '').trim();
      var kbHit = kbMap[idPr.toLowerCase()] ||
                  (idPeng && idPeng !== '-' ? kbMap[idPeng.toLowerCase()] : null) ||
                  (idDocExp ? kbMap[idDocExp.toLowerCase()] : null);
      var stLower = String(row.status || row.statusPayroll || '').trim().toLowerCase();
      var isPaid = Boolean(kbHit && kbHit.total > 0) || stLower === 'lunas';
      if (!isPaid) return;

      var tgl = (kbHit && kbHit.tanggal) || (row.updatedAt ? new Date(row.updatedAt).toISOString().split('T')[0] : todayISO());
      var kbRefText = (kbHit && kbHit.idTransaksi) ? (' (' + kbHit.idTransaksi + ')') : '';

      if (row.jedaUtang === true) {
        entries.push({
          periode: row.periode || '-',
          tanggal: tgl,
          metode: 'Jeda Utang — ' + (idPr || 'Payroll') + kbRefText,
          nominal: 0,
          sisaSetelah: runningSisa,
          statusSetelah: 'Dijeda'
        });
      } else {
        var pot = parseNum(row.potonganPiutang);
        if (pot <= 0) return;
        var paidAmt = Math.min(runningSisa, pot);
        runningSisa = Math.max(0, runningSisa - paidAmt);
        entries.push({
          periode: row.periode || '-',
          tanggal: tgl,
          metode: 'Potong Gaji — ' + (idPr || 'Payroll') + kbRefText,
          nominal: paidAmt,
          sisaSetelah: runningSisa,
          statusSetelah: runningSisa <= 0 ? STATUS.LUNAS : STATUS.BERJALAN
        });
      }
    });

    return entries;
  }

  function syncLoansWithPaidPayrolls() {
    var payrolls = readAllPayrolls();
    if (payrolls.length === 0) return false;

    var kbOutflow = getKasBankOutflowDetails();
    var anyChanged = false;

    payrolls.forEach(function (row) {
      if (!row || typeof row !== 'object') return;
      if (row.jedaUtang === true) return;
      var idLoan = String(row.idPinjaman || '').trim();
      var potNum = parseNum(row.potonganPiutang);
      if (!idLoan || idLoan === '-' || potNum <= 0) return;

      var idPr = String(row.idPayroll || '').trim().toLowerCase();
      var idPeng = String(row.idPengeluaran || row.id_pengeluaran || '').trim().toLowerCase();
      var idDocExp = String(row.idDokumenExpense || '').trim().toLowerCase();
      var kbHit = (idPr && kbOutflow[idPr]) || (idPeng && idPeng !== '-' && kbOutflow[idPeng]) || (idDocExp && kbOutflow[idDocExp]) || null;
      var stLower = String(row.status || row.statusPayroll || '').trim().toLowerCase();
      var isPaid = (kbHit && kbHit.total > 0) || (stLower === 'lunas');

      if (isPaid) {
        var periode = String(row.periode || '').trim();
        if (payLoanInstallment(idLoan, potNum, periode)) {
          anyChanged = true;
        }
      }
    });

    return anyChanged;
  }

  var MONTH_NAMES_ID = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  function formatBulanTahun(isoDateStr) {
    if (!isoDateStr || isoDateStr === '-') return '-';
    var str = String(isoDateStr).trim();
    var m = str.match(/^(\d{4})[-/](\d{1,2})/);
    if (m) {
      var idx = parseInt(m[2], 10) - 1;
      if (idx >= 0 && idx < 12) return MONTH_NAMES_ID[idx] + ' ' + m[1];
    }
    var d = new Date(str);
    if (!isNaN(d.getTime())) {
      return MONTH_NAMES_ID[d.getMonth()] + ' ' + d.getFullYear();
    }
    return '-';
  }

  function getLoanHistory(loan) {
    if (!loan || typeof loan !== 'object') return [];
    var idLoan = String(loan.idPinjaman || loan.idPinjam || '-').trim();
    var pokok = parseNum(loan.pokokPinjaman);
    var tenor = parseInt(loan.tenorBulan || loan.tenor || 0, 10) || 0;
    var tglPinjam = loan.tglPinjam || loan.tanggalPinjam || '-';
    var initialEntry = {
      periode: formatBulanTahun(tglPinjam),
      tanggal: tglPinjam,
      metode: 'Utang Awal (' + idLoan + (tenor > 0 ? ' • Tenor ' + tenor + ' Bln' : '') + ')',
      nominal: 0,
      sisaSetelah: pokok,
      statusSetelah: 'Pinjaman Awal',
      isInitial: true
    };

    // Gabungkan Utang Awal + riwayat REAL dari Payroll + Kas & Bank
    var realEntries = getRealPayrollHistoryForLoan(loan);
    if (realEntries.length > 0) {
      return [initialEntry].concat(realEntries);
    }
    if (Array.isArray(loan.paymentHistory) && loan.paymentHistory.length > 0) {
      return [initialEntry].concat(loan.paymentHistory);
    }
    return [initialEntry];
  }

  var api = {
    STATUS                    : STATUS,
    LOAN_KEY                  : LOAN_KEY,
    formatRupiah              : formatRupiah,
    parseNum                  : parseNum,
    addMonths                 : addMonths,
    todayISO                  : todayISO,
    deriveStatus              : deriveStatus,
    generateLoanId            : generateLoanId,
    getOrInitLoans            : getOrInitLoans,
    readLoanList              : readLoanList,
    writeLoanList             : writeLoanList,
    payLoanInstallment        : payLoanInstallment,
    pauseLoanInstallment      : pauseLoanInstallment,
    syncLoansWithPaidPayrolls : syncLoansWithPaidPayrolls,
    getLoanHistory            : getLoanHistory
  };

  window.LoanEngine = api;
  window.payLoanInstallment   = payLoanInstallment;
  window.pauseLoanInstallment = pauseLoanInstallment;

}(window));
