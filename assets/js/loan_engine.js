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
        totalBayar   : 5000000,
        sisaUtang    : 0,
        jatuhTempoBerikutnya: '2026-10-31',
        jatuhTempo   : '2026-10-31',
        status       : 'Lunas',
        paidPeriods  : [],
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
        totalBayar   : 1000000,
        sisaUtang    : 2000000,
        jatuhTempoBerikutnya: '2026-12-01',
        jatuhTempo   : '2026-12-01',
        status       : 'Berjalan',
        paidPeriods  : [],
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
    loan.updatedAt = Date.now();
    writeLoanList(list);
    return true;
  }

  /* ===== SINKRONISASI OTOMATIS DENGAN PAYROLL & KAS & BANK ===== */
  function getKasBankOutflowMap() {
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
            map[ref] = (map[ref] || 0) + keluar;
          }
        });
        break;
      } catch (e) {}
    }
    return map;
  }

  function syncLoansWithPaidPayrolls() {
    var payrollKeys = ['sibisahadir_payrolls', 'bisa_payroll_data_v1', 'accounting_payroll_data_v1'];
    var payrolls = [];
    for (var i = 0; i < payrollKeys.length; i++) {
      try {
        var raw = localStorage.getItem(payrollKeys[i]);
        if (!raw) continue;
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          payrolls = parsed;
          break;
        }
      } catch (e) {}
    }
    if (payrolls.length === 0) return false;

    var kbOutflow = getKasBankOutflowMap();
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
      var kbPaid = (idPr && kbOutflow[idPr]) || (idPeng && idPeng !== '-' && kbOutflow[idPeng]) || (idDocExp && kbOutflow[idDocExp]) || 0;
      var stLower = String(row.status || row.statusPayroll || '').trim().toLowerCase();
      var isPaid = (kbPaid > 0) || (stLower === 'lunas');

      if (isPaid) {
        var periode = String(row.periode || '').trim();
        if (payLoanInstallment(idLoan, potNum, periode)) {
          anyChanged = true;
        }
      }
    });

    return anyChanged;
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
    syncLoansWithPaidPayrolls : syncLoansWithPaidPayrolls
  };

  window.LoanEngine = api;
  window.payLoanInstallment   = payLoanInstallment;
  window.pauseLoanInstallment = pauseLoanInstallment;

}(window));
