/*
 * Data dummy acuan SITTA untuk Tugas Praktik 2.
 * Struktur data diselaraskan dari file dataBahanAjar.js pada project yang dilampirkan.
 * Data ini merupakan seed awal untuk kedua aplikasi Vue.js; perubahan runtime
 * disimpan oleh masing-masing halaman ke localStorage karena tidak ada backend.
 */

var upbjjList = ["Jakarta", "Surabaya", "Makassar", "Padang", "Denpasar"];

var kategoriList = ["MK Wajib", "MK Pilihan", "Praktikum", "Problem-Based"];

var pengirimanList = [
  { kode: "REG", nama: "Reguler (3-5 hari)" },
  { kode: "EXP", nama: "Ekspres (1-2 hari)" }
];

var paket = [
  { kode: "PAKET-UT-001", nama: "PAKET IPS Dasar", isi: ["EKMA4116", "EKMA4115"], harga: 120000 },
  { kode: "PAKET-UT-002", nama: "PAKET IPA Dasar", isi: ["BIOL4201", "FISIP4001"], harga: 140000 }
];

var stok = [
  {
    kode: "EKMA4116",
    judul: "Pengantar Manajemen",
    kategori: "MK Wajib",
    upbjj: "Jakarta",
    lokasiRak: "R1-A3",
    harga: 65000,
    qty: 28,
    safety: 20,
    catatanHTML: "<em>Edisi 2024, cetak ulang</em>"
  },
  {
    kode: "EKMA4115",
    judul: "Pengantar Akuntansi",
    kategori: "MK Wajib",
    upbjj: "Jakarta",
    lokasiRak: "R1-A4",
    harga: 60000,
    qty: 7,
    safety: 15,
    catatanHTML: "<strong>Cover baru</strong>"
  },
  {
    kode: "BIOL4201",
    judul: "Biologi Umum (Praktikum)",
    kategori: "Praktikum",
    upbjj: "Surabaya",
    lokasiRak: "R3-B2",
    harga: 80000,
    qty: 12,
    safety: 10,
    catatanHTML: "Butuh <u>pendingin</u> untuk kit basah"
  },
  {
    kode: "FISIP4001",
    judul: "Dasar-Dasar Sosiologi",
    kategori: "MK Pilihan",
    upbjj: "Makassar",
    lokasiRak: "R2-C1",
    harga: 55000,
    qty: 2,
    safety: 8,
    catatanHTML: "Stok <i>menipis</i>, prioritaskan reorder"
  }
];

/* Alias agar nama data jelas ketika dibaca pada halaman stok. */
var dataBahanAjar = stok;

/* Data tracking acuan dari file yang dilampirkan, dinormalisasi untuk Vue 3. */
var tracking = {
  "DO2025-0001": {
    nim: "123456789",
    nama: "Rina Wulandari",
    status: "Dalam Perjalanan",
    ekspedisi: "JNE",
    tanggalKirim: "2025-08-25",
    paket: "PAKET-UT-001",
    total: 120000,
    perjalanan: [
      { waktu: "2025-08-25 10:12:20", keterangan: "Penerimaan di Loket: TANGSEL" },
      { waktu: "2025-08-25 14:07:56", keterangan: "Tiba di Hub: JAKSEL" },
      { waktu: "2025-08-26 08:44:01", keterangan: "Diteruskan ke Kantor Tujuan" }
    ]
  }
};

/* Aplikasi membutuhkan array agar mudah dirender dan ditambah dengan v-for. */
var dataTrackingDO = Object.entries(tracking).map(function ([nomorDO, item]) {
  return {
    nomorDO: nomorDO,
    nim: item.nim,
    nama: item.nama,
    status: item.status,
    ekspedisi: item.ekspedisi,
    upbjj: item.upbjj || "",
    kodePaket: item.paket,
    tanggalKirim: item.tanggalKirim,
    total: item.total,
    timeline: (item.perjalanan || []).map(function (event) {
      var description = String(event.keterangan || "");
      var title = "Pembaruan pengiriman";
      if (/loket|penerimaan/i.test(description)) title = "Pesanan diterima";
      else if (/hub/i.test(description)) title = "Tiba di hub";
      else if (/diteruskan|kantor tujuan/i.test(description)) title = "Dalam perjalanan";
      else if (/selesai|penerima/i.test(description)) title = "Paket diterima";
      return { waktu: event.waktu, judul: title, keterangan: description };
    })
  };
});

/* Menggunakan daftar layanan dari data acuan dan menyesuaikan label ke soal. */
var ekspedisiList = pengirimanList.map(function (item) {
  return item.kode === "EXP" ? "JNE Express" : "JNE Regular";
});
