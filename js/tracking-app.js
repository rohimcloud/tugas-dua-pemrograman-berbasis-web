/* Vue app: Halaman Tracking Delivery Order */
const { createApp } = Vue;

function loadTrackingArray(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (error) {
    console.warn('Tidak dapat membaca localStorage:', error);
  }
  return JSON.parse(JSON.stringify(fallback));
}

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getLocalDateTimeString(date = new Date()) {
  return `${getLocalDateString(date)} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

createApp({
  data() {
    const initialDOs = loadTrackingArray('sittaTugas2.templateV1.deliveryOrders', dataTrackingDO);
    return {
      upbjjList: Array.isArray(upbjjList) ? [...upbjjList] : [],
      paketList: Array.isArray(paket) ? paket.map((item) => ({ ...item, kodePaket: item.kodePaket || item.kode, namaPaket: item.namaPaket || item.nama })) : [],
      ekspedisiList: Array.isArray(ekspedisiList) ? [...ekspedisiList] : ['JNE Regular', 'JNE Express'],
      dos: initialDOs,
      form: { nim: '', nama: '', upbjj: '', ekspedisi: '', kodePaket: '', tanggalKirim: getLocalDateString() },
      formError: '',
      selectedDONumber: initialDOs.length ? [...initialDOs].sort((a, b) => b.nomorDO.localeCompare(a.nomorDO))[0].nomorDO : '',
      searchTerm: '',
      searchHint: 'Daftar diperbarui otomatis saat kata kunci berubah.',
      showTips: true,
      toastMessage: '',
      toastTimer: null
    };
  },
  computed: {
    currentYear() {
      return new Date().getFullYear();
    },
    nextDONumber() {
      const year = this.currentYear;
      const prefix = `DO${year}-`;
      const highestSequence = this.dos.reduce((highest, item) => {
        const number = String(item.nomorDO || '');
        if (!number.startsWith(prefix)) return highest;
        const suffix = Number(number.slice(prefix.length));
        return Number.isInteger(suffix) && suffix > highest ? suffix : highest;
      }, 0);
      return `${prefix}${String(highestSequence + 1).padStart(3, '0')}`;
    },
    selectedPaket() {
      return this.paketList.find((item) => item.kodePaket === this.form.kodePaket) || null;
    },
    totalHarga() {
      return this.selectedPaket ? Number(this.selectedPaket.harga) : 0;
    },
    selectedDO() {
      return this.dos.find((item) => item.nomorDO === this.selectedDONumber) || null;
    },
    filteredDOs() {
      const keyword = this.searchTerm.toLocaleLowerCase('id').trim();
      if (!keyword) return [...this.dos].sort((a, b) => b.nomorDO.localeCompare(a.nomorDO));
      return this.dos.filter((item) => [item.nomorDO, item.nim, item.nama, item.upbjj, item.kodePaket]
        .some((value) => String(value ?? '').toLocaleLowerCase('id').includes(keyword)))
        .sort((a, b) => b.nomorDO.localeCompare(a.nomorDO));
    },
    processingCount() {
      return this.dos.filter((item) => ['Pesanan diterima', 'Diproses'].includes(item.status)).length;
    },
    inTransitCount() {
      return this.dos.filter((item) => item.status === 'Dalam Perjalanan').length;
    },
    completedCount() {
      return this.dos.filter((item) => item.status === 'Selesai').length;
    }
  },
  watch: {
    // Watcher 1: perubahan paket memberi umpan balik harga pada formulir.
    'form.kodePaket'(newCode) {
      const selected = this.paketList.find((item) => item.kodePaket === newCode);
      if (selected) this.formError = '';
    },
    // Watcher 2: amati kata kunci untuk memperbarui petunjuk hasil pencarian.
    searchTerm(newValue) {
      this.searchHint = newValue.trim()
        ? `Mencari “${newValue.trim()}” pada nomor DO, NIM, nama, UT-Daerah, dan kode paket.`
        : 'Daftar diperbarui otomatis saat kata kunci berubah.';
      const matches = this.filteredDOs;
      if (matches.length && !matches.some((item) => item.nomorDO === this.selectedDONumber)) {
        this.selectedDONumber = matches[0].nomorDO;
      } else if (!matches.length && newValue.trim()) {
        this.selectedDONumber = '';
      } else if (!newValue.trim() && !this.selectedDO && this.dos.length) {
        this.selectedDONumber = [...this.dos].sort((a, b) => b.nomorDO.localeCompare(a.nomorDO))[0].nomorDO;
      }
    },
    // Watcher 3: persist daftar DO setiap kali data berubah.
    dos: {
      deep: true,
      handler(newOrders) {
        try {
          localStorage.setItem('sittaTugas2.templateV1.deliveryOrders', JSON.stringify(newOrders));
        } catch (error) {
          this.showToast('Penyimpanan browser penuh atau tidak tersedia.');
          console.error('Gagal menyimpan data DO:', error);
        }
      }
    }
  },
  methods: {
    blankForm() {
      return {
        nim: '', nama: '', upbjj: '', ekspedisi: '', kodePaket: '', tanggalKirim: getLocalDateString()
      };
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value) || 0);
    },
    formatDate(value) {
      if (!value) return '—';
      const parts = String(value).split('-');
      if (parts.length !== 3) return value;
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    },
    getPackage(kodePaket) {
      return this.paketList.find((item) => item.kodePaket === kodePaket) || null;
    },
    getPackageName(kodePaket) {
      const found = this.getPackage(kodePaket);
      return found ? `${found.kodePaket} — ${found.namaPaket}` : 'Paket tidak tersedia';
    },
    getPackagePrice(kodePaket) {
      const found = this.getPackage(kodePaket);
      return found ? Number(found.harga) : 0;
    },
    getPackageItemCount(kodePaket) {
      const found = this.getPackage(kodePaket);
      return found && Array.isArray(found.isi) ? found.isi.length : 0;
    },
    statusClass(status) {
      if (status === 'Selesai') return 'status-safe';
      if (status === 'Dalam Perjalanan') return 'status-info';
      if (status === 'Diproses') return 'status-low';
      return 'status-info';
    },
    getProgress(status) {
      const progressMap = { 'Pesanan diterima': 20, 'Diproses': 40, 'Dalam Perjalanan': 75, 'Selesai': 100 };
      return progressMap[status] || 10;
    },
    selectDO(item) {
      this.selectedDONumber = item.nomorDO;
    },
    addDeliveryOrder() {
      this.formError = '';
      const form = this.form;
      if (!/^\d{8,16}$/.test(String(form.nim || '').trim())) {
        this.formError = 'NIM wajib diisi dengan 8–16 digit angka.';
        return;
      }
      if (!String(form.nama || '').trim() || String(form.nama).trim().length < 2) {
        this.formError = 'Nama mahasiswa wajib diisi minimal 2 karakter.';
        return;
      }
      if (!form.upbjj || !this.upbjjList.includes(form.upbjj)) {
        this.formError = 'Pilih UT-Daerah tujuan yang tersedia.';
        return;
      }
      if (!this.ekspedisiList.includes(form.ekspedisi)) {
        this.formError = 'Pilih ekspedisi JNE Regular atau JNE Express.';
        return;
      }
      if (!this.selectedPaket) {
        this.formError = 'Pilih paket bahan ajar yang tersedia.';
        return;
      }
      if (!form.tanggalKirim || Number.isNaN(Date.parse(form.tanggalKirim))) {
        this.formError = 'Tanggal kirim wajib diisi dengan tanggal yang valid.';
        return;
      }

      const newNumber = this.nextDONumber;
      const timestamp = getLocalDateTimeString(new Date());
      const created = {
        nomorDO: newNumber,
        nim: String(form.nim).trim(),
        nama: String(form.nama).trim(),
        upbjj: form.upbjj,
        ekspedisi: form.ekspedisi,
        kodePaket: form.kodePaket,
        tanggalKirim: form.tanggalKirim,
        status: 'Pesanan diterima',
        timeline: [{ waktu: timestamp, judul: 'Pesanan diterima', keterangan: 'Delivery Order baru berhasil dibuat melalui aplikasi SITTA.' }]
      };
      this.dos.unshift(created);
      this.selectedDONumber = newNumber;
      this.searchTerm = '';
      this.form = this.blankForm();
      this.showToast(`Delivery Order ${newNumber} berhasil dibuat.`);
    },
    showToast(message) {
      this.toastMessage = message;
      if (this.toastTimer) clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => { this.toastMessage = ''; }, 3200);
    }
  }
}).mount('#trackingApp');
