# Walkthrough: Penyelarasan Total Konsistensi SPV KOL dengan Staff KOL

Telah dilakukan penyelarasan penuh pada modul **SPV KOL** sehingga tampil **100% konsisten, seragam, dan identik** dengan modul **Staff KOL** yang sudah disetujui sebelumnya.

---

## 1. Poin Penyelarasan Utama

Berdasarkan perbandingan langsung antara Staff KOL dan SPV KOL:

1. **Brand Header Sidebar**:
   - Disamakan menggunakan logo resmi dan tipografi *Bisa Media* (`.brand-name.brand-name--dark`) yang konsisten dengan Staff.
2. **Grup Menu & Toggle Header**:
   - Header akordeon grup (`Kehadiran`, `Operasional`, `Dokumen & Kolaborasi`, `Perancangan Kerja`, `Kinerja`, dan `Data Master`) kini tampil bersih dan konsisten: hanya teks judul tebal dan ikon panah (*chevron*) di sebelah kanan tanpa ikon tambahan di kiri, persis seperti pada Staff KOL.
   - Modul eksklusif SPV yaitu **Data Master** dan subgrup **Master Pendukung** (*Leveling Kreator*, *Leads Kreator*, *Kategori Produk*, *Ads Account*) telah diselaraskan dengan hierarki yang sama rapinya.
3. **Penyatuan Topbar (Unified Hirezy Topbar)**:
   - Menyelaraskan seluruh topbar pada SPV KOL dengan fitur lengkap:
     - Tombol hamburger navigasi (`#sidebarToggle`).
     - Judul dinamis halaman (`.hirezy-page-title`).
     - Kolom pencarian seragam (`Search candidate, vacancy, etc`).
     - Tombol Chat/Pesan.
     - Tombol Notifikasi dengan indikator merah (*dot*).
     - Tombol profil pengguna lengkap dengan avatar, nama (*Andrew Sebastian*), peran (*Supervisi KOL*), dan menu dropdown (*Kembali ke Dashboard Utama*, *Logout*).
4. **Dukungan Tiga Kedalaman Folder (Depth 0, 1, 2)**:
   - Root (depth 0): `spvkol_dashboard.html`, `spvkol_kalender.html`
   - Subfolder (depth 1): `absensi/`, `operasional/`, `dokumen_kolaborasi/`, `perancangan_kerja/`, `kinerja/`, `data_master/`
   - Subfolder Bertingkat (depth 2): `data_master/master_pendukung/`
   - Semua path gambar, link antar halaman, dan script teresolusi otomatis tanpa *broken link* (0 error 404).

---

## 2. File yang Dikerjakan

- [SpvKol/spvkol_layout.js](file:///d:/SOFTWARE/laragon/www/siBisaHadir.v2/SpvKol/spvkol_layout.js): Implementasi template terpadu SPV yang memuat sidebar, topbar seragam, dan *event delegation* interaktif (akordeon grup & subgrup, filter pencarian menu, dan dropdown profil).
- [build_spvkol.js](file:///d:/SOFTWARE/laragon/www/siBisaHadir.v2/build_spvkol.js): Skrip sinkronisasi otomatis untuk memastikan ke-26 file HTML pada SPV KOL memiliki struktur `<aside id="sidebar" class="sidebar kol-sidebar"></aside>`, `<header class="topbar hirezy-topbar"></header>`, dan tautan ke `spvkol_layout.js`.
- [style.css](file:///d:/SOFTWARE/laragon/www/siBisaHadir.v2/style.css): Pengembalian styling bersih native `.kol-sidebar` agar Staff dan SPV berbagi aturan tampilan yang sama tanpa *inline override* yang membingungkan.

---

## 3. Hasil Pengujian HTTP (Status 200 OK)

Seluruh tingkatan folder telah diuji langsung via server lokal Laragon (`http://sibisahadir.v2.test:8040`):

```text
200 OK - /SpvKol/spvkol_dashboard.html (Root)
200 OK - /SpvKol/spvkol_kalender.html (Root)
200 OK - /SpvKol/absensi/spvkol_kehadiran.html (Depth 1)
200 OK - /SpvKol/operasional/spvkol_Performa_Kreator.html (Depth 1)
200 OK - /SpvKol/dokumen_kolaborasi/spvkol_folder.html (Depth 1)
200 OK - /SpvKol/perancangan_kerja/spvkol_Milestone.html (Depth 1)
200 OK - /SpvKol/kinerja/spvkol_evaluasi_kinerja.html (Depth 1)
200 OK - /SpvKol/data_master/spvkol_Brand.html (Depth 1)
200 OK - /SpvKol/data_master/master_pendukung/spvkol_Ads_Account.html (Depth 2)
```

Seluruh 26 halaman SPV KOL kini berjalan dengan layout, visual sidebar, dan topbar yang sepenuhnya konsisten dengan Staff KOL.
