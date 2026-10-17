# SITTA — Tugas Praktik 2 Vue.js

Project ini menggunakan kembali identitas visual SITTA dari Tugas Praktik 1 (logo UT, palet biru, typography Inter, topbar, sidebar, panel dan gaya tabel), kemudian menyesuaikan fitur serta logic menjadi Vue.js sesuai soal Tugas Praktik 2.

## Struktur folder

```text
tugas2-vue-ut/
├── index.html              # Beranda dan navigasi dua modul wajib
├── stok.html               # Stok bahan ajar (Vue.js 3)
├── tracking.html           # Tracking / pembuatan DO (Vue.js 3)
├── css/
│   ├── style.css            # Design system template SITTA sebelumnya
│   └── vue-task2.css        # Komponen tambahan untuk kebutuhan Vue Tugas 2
├── js/
│   ├── dataBahanAjar.js     # Data dummy acuan
│   ├── stok-app.js          # Logic Vue untuk stok
│   └── tracking-app.js      # Logic Vue untuk tracking DO
└── img/                    # Logo UT dan gambar dari template sebelumnya
```

## Data dummy

`dataBahanAjar.js` menggunakan data acuan dari arsip project yang dilampirkan: `upbjjList`, `kategoriList`, `pengirimanList`, `paket`, `stok`, dan tracking `DO2025-0001`. Field stok meliputi `kode`, `judul`, `kategori`, `upbjj`, `lokasiRak`, `harga`, `qty`, `safety`, dan `catatanHTML`. Untuk Vue 3, data tracking diubah ke array agar dapat ditampilkan melalui `v-for`.

## Fitur halaman Stok

- Daftar stok dengan status Aman, Menipis, dan Kosong.
- Pencarian dan filter UT-Daerah. Pilihan kategori bergantung pada UT-Daerah yang dipilih.
- Filter qty di bawah safety stock dan qty = 0.
- Sort berdasarkan judul, stok, dan harga serta arah sort naik/turun.
- Reset filter.
- Form tambah dan edit stok dengan validasi.
- `v-for`, mustache, `v-text`, `v-html`, `v-if`, `v-else-if`, `v-else`, `v-show`, `v-bind`, `v-model`, computed, methods, dan watchers.

## Fitur halaman Tracking DO

- Nomor DO dihasilkan otomatis dengan format `DO<TAHUN>-<URUTAN>` berdasarkan tahun lokal dan nomor urut terbesar pada tahun berjalan.
- Form input NIM, nama, UT-Daerah, ekspedisi, paket, dan tanggal kirim.
- Detail paket dan total harga muncul berdasarkan paket yang dipilih. Harga diambil dari data paket.
- Daftar DO yang bisa dicari dan dipilih untuk melihat detail status, progress, dan timeline.
- Watchers digunakan untuk memantau perubahan paket, pencarian, dan data DO.

## Cara menjalankan

1. Ekstrak ZIP ke folder lokal.
2. Buka folder di Visual Studio Code.
3. Jalankan `index.html` menggunakan Live Server.
4. Buka menu **Stok Bahan Ajar** atau **Tracking Delivery Order**.

Vue.js dimuat melalui CDN, jadi koneksi internet diperlukan untuk mengakses framework.

## Penyimpanan perubahan

Perubahan tambah/edit stok dan pembuatan DO disimpan di `localStorage` browser supaya tetap tersedia setelah refresh. Karena tugas ini hanya meminta front-end, data tidak dikirim ke backend atau database dan file dummy di disk tidak ditulis ulang oleh browser.

Jika ingin mengulang pengujian dari data awal, buka DevTools Console dan jalankan:

```javascript
localStorage.removeItem('sittaTugas2.templateV1.stocks');
localStorage.removeItem('sittaTugas2.templateV1.deliveryOrders');
location.reload();
```

## Catatan teknis

Vue 3 digunakan tanpa template component, sesuai petunjuk Tugas Praktik 2. Validasi form merupakan validasi front-end untuk kebutuhan demonstrasi; project ini belum memiliki autentikasi server, backend, maupun database.
