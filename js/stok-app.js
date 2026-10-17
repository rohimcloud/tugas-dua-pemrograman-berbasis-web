/* Vue app: Halaman Stok Bahan Ajar */
const { createApp } = Vue;

function loadStoredArray(key, fallback) {
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

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function plainTextFromHTML(value) {
  return String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

createApp({
  data() {
    return {
      upbjjList: Array.isArray(upbjjList) ? [...upbjjList] : [],
      kategoriList: Array.isArray(kategoriList) ? [...kategoriList] : [],
      stocks: loadStoredArray('sittaTugas2.templateV1.stocks', dataBahanAjar),
      filters: { search: '', upbjj: '', kategori: '', lowStockOnly: false, emptyOnly: false },
      sortBy: 'judul',
      sortDirection: 'asc',
      isFormOpen: false,
      isEditing: false,
      editingOriginalKode: null,
      form: { kode: '', judul: '', kategori: '', upbjj: '', lokasiRak: '', qty: 0, safety: 0, harga: 0, catatan: '' },
      formError: '',
      filterMessage: 'Tip: pilih UT-Daerah untuk melihat kategori yang tersedia khusus pada daerah tersebut.',
      showTips: true,
      toastMessage: '',
      toastTimer: null
    };
  },
  computed: {
    availableCategories() {
      const rows = this.filters.upbjj
        ? this.stocks.filter((item) => item.upbjj === this.filters.upbjj)
        : this.stocks;
      return [...new Set(rows.map((item) => item.kategori).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, 'id'));
    },
    filteredStocks() {
      const keyword = this.filters.search.toLocaleLowerCase('id').trim();
      let rows = this.stocks.filter((item) => {
        const matchKeyword = !keyword || [item.kode, item.judul, item.kategori, item.upbjj, item.lokasiRak]
          .some((value) => String(value ?? '').toLocaleLowerCase('id').includes(keyword));
        const matchArea = !this.filters.upbjj || item.upbjj === this.filters.upbjj;
        const matchCategory = !this.filters.kategori || item.kategori === this.filters.kategori;
        const matchLow = !this.filters.lowStockOnly || Number(item.qty) < Number(item.safety);
        const matchEmpty = !this.filters.emptyOnly || Number(item.qty) === 0;
        // Jika kedua checkbox dipilih, tampilkan baris yang memenuhi salah satu kondisi peringatan.
        const matchCondition = this.filters.lowStockOnly && this.filters.emptyOnly
          ? (Number(item.qty) < Number(item.safety) || Number(item.qty) === 0)
          : matchLow && matchEmpty;
        return matchKeyword && matchArea && matchCategory && matchCondition;
      });

      rows = [...rows].sort((first, second) => {
        let result = 0;
        if (this.sortBy === 'qty' || this.sortBy === 'harga') {
          result = Number(first[this.sortBy] || 0) - Number(second[this.sortBy] || 0);
        } else {
          result = String(first.judul || '').localeCompare(String(second.judul || ''), 'id', { sensitivity: 'base' });
        }
        return this.sortDirection === 'desc' ? result * -1 : result;
      });
      return rows;
    },
    safeStockCount() {
      return this.stocks.filter((item) => Number(item.qty) >= Number(item.safety) && Number(item.qty) !== 0).length;
    },
    lowStockCount() {
      return this.stocks.filter((item) => Number(item.qty) > 0 && Number(item.qty) < Number(item.safety)).length;
    },
    emptyStockCount() {
      return this.stocks.filter((item) => Number(item.qty) === 0).length;
    }
  },
  watch: {
    // Watcher 1: opsi kategori mengikuti UT-Daerah yang dipilih.
    'filters.upbjj'(newArea) {
      this.filters.kategori = '';
      this.updateFilterMessage();
    },
    // Watcher 2: perubahan filter reorder langsung memperbarui petunjuk pengguna.
    'filters.kategori'() {
      this.updateFilterMessage();
    },
    'filters.lowStockOnly'() {
      this.updateFilterMessage();
    },
    'filters.emptyOnly'() {
      this.updateFilterMessage();
    },
    // Watcher 3: setiap perubahan array stok disimpan ke localStorage.
    stocks: {
      deep: true,
      handler(newStocks) {
        try {
          localStorage.setItem('sittaTugas2.templateV1.stocks', JSON.stringify(newStocks));
        } catch (error) {
          this.showToast('Penyimpanan browser penuh atau tidak tersedia.');
          console.error('Gagal menyimpan data stok:', error);
        }
      }
    }
  },
  methods: {
    blankForm() {
      return { kode: '', judul: '', kategori: '', upbjj: '', lokasiRak: '', qty: 0, safety: 0, harga: 0, catatan: '' };
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value) || 0);
    },
    stockStatus(item) {
      if (Number(item.qty) === 0) return 'Kosong';
      if (Number(item.qty) < Number(item.safety)) return 'Menipis';
      return 'Aman';
    },
    stockPercent(item) {
      const qty = Number(item.qty) || 0;
      const safety = Number(item.safety) || 0;
      if (qty === 0) return 0;
      if (safety === 0) return 100;
      return Math.max(5, Math.min(100, Math.round((qty / (safety * 2)) * 100)));
    },
    meterClass(item) {
      if (Number(item.qty) === 0) return 'meter-red';
      if (Number(item.qty) < Number(item.safety)) return 'meter-orange';
      return 'meter-green';
    },
    updateFilterMessage() {
      const active = [];
      if (this.filters.upbjj) active.push(this.filters.upbjj);
      if (this.filters.kategori) active.push(this.filters.kategori);
      if (this.filters.lowStockOnly) active.push('qty < safety stock');
      if (this.filters.emptyOnly) active.push('qty = 0');
      this.filterMessage = active.length
        ? `Filter aktif: ${active.join(' · ')}. Hasil diperbarui otomatis oleh computed property.`
        : 'Tip: pilih UT-Daerah untuk melihat kategori yang tersedia khusus pada daerah tersebut.';
    },
    resetFilters() {
      this.filters = { search: '', upbjj: '', kategori: '', lowStockOnly: false, emptyOnly: false };
      this.sortBy = 'judul';
      this.sortDirection = 'asc';
      this.updateFilterMessage();
      this.showToast('Filter dan pengurutan berhasil direset.');
    },
    openAddForm() {
      this.isEditing = false;
      this.editingOriginalKode = null;
      this.form = { ...this.blankForm(), upbjj: this.upbjjList[0] || '', kategori: this.kategoriList[0] || '' };
      this.formError = '';
      this.isFormOpen = true;
    },
    openEditForm(item) {
      this.isEditing = true;
      this.editingOriginalKode = item.kode;
      this.form = {
        kode: item.kode,
        judul: item.judul,
        kategori: item.kategori,
        upbjj: item.upbjj,
        lokasiRak: item.lokasiRak,
        qty: Number(item.qty),
        safety: Number(item.safety),
        harga: Number(item.harga),
        catatan: plainTextFromHTML(item.catatanHTML)
      };
      this.formError = '';
      this.isFormOpen = true;
    },
    closeForm() {
      this.isFormOpen = false;
      this.formError = '';
    },
    buildNoteHTML(note) {
      const safeText = escapeHTML(String(note ?? '').trim());
      if (!safeText) return '<span class="note-label">Tidak ada catatan</span>';
      let cssClass = 'note-label';
      if (/habis|kosong|urgent/i.test(note)) cssClass += ' note-danger';
      else if (/reorder|menipis|bawah|rendah|pantau/i.test(note)) cssClass += ' note-warning';
      else if (/aman|tersedia|cukup/i.test(note)) cssClass += ' note-success';
      return `<span class="${cssClass}">${safeText}</span>`;
    },
    saveStock() {
      const form = this.form;
      if (!form.kode || !form.judul || !form.kategori || !form.upbjj || !form.lokasiRak) {
        this.formError = 'Lengkapi kode, judul, kategori, UT-Daerah, dan lokasi rak.';
        return;
      }
      if (!Number.isInteger(Number(form.qty)) || Number(form.qty) < 0) {
        this.formError = 'Jumlah stok harus berupa bilangan bulat dan tidak boleh negatif.';
        return;
      }
      if (!Number.isInteger(Number(form.safety)) || Number(form.safety) < 0) {
        this.formError = 'Safety stock harus berupa bilangan bulat dan tidak boleh negatif.';
        return;
      }
      if (!Number.isFinite(Number(form.harga)) || Number(form.harga) <= 0) {
        this.formError = 'Harga harus lebih besar dari nol.';
        return;
      }
      const normalizedCode = String(form.kode).trim().toUpperCase();
      const duplicate = this.stocks.some((item) => String(item.kode).toUpperCase() === normalizedCode && item.kode !== this.editingOriginalKode);
      if (duplicate) {
        this.formError = `Kode ${normalizedCode} sudah digunakan. Gunakan kode mata kuliah yang berbeda.`;
        return;
      }

      const payload = {
        kode: normalizedCode,
        judul: String(form.judul).trim(),
        kategori: form.kategori,
        upbjj: form.upbjj,
        lokasiRak: String(form.lokasiRak).trim().toUpperCase(),
        qty: Number(form.qty),
        safety: Number(form.safety),
        harga: Number(form.harga),
        catatanHTML: this.buildNoteHTML(form.catatan)
      };

      if (this.isEditing) {
        const index = this.stocks.findIndex((item) => item.kode === this.editingOriginalKode);
        if (index < 0) {
          this.formError = 'Data yang akan diedit tidak ditemukan. Tutup form dan coba kembali.';
          return;
        }
        this.stocks.splice(index, 1, payload);
        this.showToast(`Data ${payload.kode} berhasil diperbarui.`);
      } else {
        this.stocks.push(payload);
        this.showToast(`Bahan ajar ${payload.kode} berhasil ditambahkan.`);
      }
      this.closeForm();
    },
    deleteStock(item) {
      const confirmed = window.confirm(`Hapus data ${item.kode} — ${item.judul}?`);
      if (!confirmed) return;
      this.stocks = this.stocks.filter((row) => row.kode !== item.kode);
      this.showToast(`Data ${item.kode} telah dihapus.`);
    },
    showToast(message) {
      this.toastMessage = message;
      if (this.toastTimer) clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => { this.toastMessage = ''; }, 3000);
    }
  }
}).mount('#stokApp');
