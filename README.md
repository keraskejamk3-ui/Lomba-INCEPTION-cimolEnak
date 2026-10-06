# Website SMK Telkom Malang — Tahap 1

## Menjalankan
Wajib lewat server lokal (fetch JSON/komponen tidak jalan di file://).
VS Code → ekstensi **Live Server** → klik kanan `index.html` → *Open with Live Server*.
Alternatif: `python3 -m http.server 5500` lalu buka http://localhost:5500

## Mengganti konten
- Nama, alamat, kontak, WhatsApp, medsos, peta mini: `data/site.json`
- Semua teks: `data/lang-id.json` dan `data/lang-en.json` (kunci harus sama)
- Teks baru di HTML: `<span data-i18n="grup.kunci"></span>`; atribut: `data-i18n-attr="aria-label:grup.kunci"`
- Navbar/footer: `components/` (satu file, otomatis tampil di semua halaman)
- Warna brand: variabel `:root` di `css/style.css`
- Logo: taruh di `assets/img/logo.svg`

## Status
- [x] Tahap 1: struktur, CSS global, navbar, footer, i18n, tombol WA
- [x] Tahap 2: Beranda lengkap · [ ] Tahap 3: halaman lain · [ ] Tahap 4: peta alumni, chatbot, cursor
