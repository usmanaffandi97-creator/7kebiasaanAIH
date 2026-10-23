# 📘 Panduan Lengkap: Aplikasi 7 Kebiasaan Anak Indonesia Hebat

Aplikasi rekap harian karakter **7 Kebiasaan Anak Indonesia Hebat** berbasis Web & Mobile Android (PWA) dengan basis data **Google Spreadsheet** dan penyimpanan foto di **Google Drive**, dilengkapi **kompresi foto otomatis**, **pengingat notifikasi**, **kamera langsung anti-galeri**, dan **rekap siswa belum lapor untuk Guru Wali**.

---

## 🌟 Fitur Unggulan Terbaru

1. **Pengisian Laporan Super Simpel (10-15 Detik):**
   - 🌅 **Bangun Pagi:** Tombol saklar Ya/Tidak + tombol cepat jam bangun (04:15, 04:30, 04:45).
   - 🕌 **Beribadah (Shalat 5 Waktu bagi Muslim):** Grid 5 tombol shalat (*Subuh, Dzuhur, Ashar, Maghrib, Isya*) dengan 1 kali klik per waktu, tombol *Pilih Semua*, atau opsi ibadah rutin bagi non-muslim.
   - 🏃 **Berolahraga, 🥗 Makan Sehat, 📚 Gemar Belajar, 🤝 Gotong Royong:** Cukup 1 sentuhan saklar Ya/Tidak tanpa perlu mengetik panjang.
   - 🌙 **Tidur Cepat (Malam):** Saklar Ya/Tidak + tombol cepat jam tidur (20:30, 21:00).

2. **Pengingat Notifikasi Otomatis untuk Anak:**
   - Banner notifikasi cerdas menyesuaikan waktu hari secara berkala:
     - *04.00 - 06.00:* Pengingat Bangun Pagi & Shalat Subuh
     - *11.45 - 13.00:* Pengingat Shalat Dzuhur & Makan Siang Sehat
     - *15.15 - 16.30:* Pengingat Shalat Ashar & Olahraga Sore
     - *17.50 - 18.30:* Pengingat Shalat Maghrib & Belajar/Literasi
     - *19.10 - 20.30:* Pengingat Shalat Isya & Membantu Orang Tua
     - *20.45 - 21.30:* Pengingat Istirahat Malam & Tidur Cepat
   - Dilengkapi tombol **Aktifkan Notif di HP** berbasis *Web Notification API*.

3. **Foto Bukti Khusus Kamera Langsung (Anti-Galeri):**
   - Tombol kamera dikunci dengan `capture="environment"`, sehingga saat disentuh di HP Android, **otomatis langsung membuka kamera HP** dan **tidak mengizinkan mengambil foto lama dari galeri/penyimpanan**.
   - Foto otomatis diberi **stempel air (watermark) tanggal dan jam pengambilan secara realtime**.
   - Foto kamera 5-10 MB otomatis diciutkan menjadi **~100 KB** (hemat kuota & ruang Google Drive).

4. **Monitoring Guru Wali: Daftar Siswa yang BELUM Mengisi Laporan:**
   - Dasbor Guru Wali memiliki tab khusus: **"Belum Lapor"**.
   - Menampilkan daftar nama siswa binaan yang belum mengirim laporan pada tanggal yang dipilih.
   - Tombol **"📲 Ingatkan WA"** untuk langsung mengirim pesan pengingat otomatis ke nomor WhatsApp siswa/orang tua siswa dalam 1 klik.

---

## 📁 Struktur Berkas Proyek

Semua berkas berada di folder: `F:\aplikasi-7kebiasaan-anak-hebat\`
* `index.html` : Aplikasi antarmuka Web & Android PWA.
* `Code.gs` : Kode backend Google Apps Script (Spreadsheet, Drive Foto, Kontak WA, & Filter Siswa Belum Lapor).
* `manifest.json` : Konfigurasi instalasi aplikasi Android.
* `sw.js` : Service worker mode offline dan caching.
* `icon.svg` : Ikon resmi aplikasi.
* `PANDUAN_LENGKAP.md` : Dokumen panduan ini.

---

## 🚀 Langkah 1: Mencoba Aplikasi Secara Langsung (Mode Demo)

1. Buka File Explorer di Windows, lalu masuk ke folder `F:\aplikasi-7kebiasaan-anak-hebat`.
2. Klik dua kali pada berkas `index.html` (akan terbuka di browser Google Chrome / Edge).
3. Pada halaman Login, Anda bisa langsung memilih **Akun Demo Cepat**:
   - **Muhammad Rizky (Siswa)**: Coba centang 5 waktu shalat, bangun pagi, dan jepret kamera langsung.
   - **Bpk. Ahmad Hidayat (Guru Wali)**: Masuk sebagai Guru Wali. Klik tab **"Belum Lapor"** untuk melihat siswa yang lalai belum lapor dan coba tombol pengingat WhatsApp.
   - **Admin**: Masuk untuk mengelola data siswa, no WhatsApp, dan menetapkan Guru Wali.

---

## ☁️ Langkah 2: Menghubungkan ke Google Spreadsheet & Google Drive Sekolah

1. Buat Spreadsheet baru di [Google Drive](https://drive.google.com/), beri judul misalnya: **Database 7 Kebiasaan Siswa**.
2. Klik menu **Ekstensi (Extensions)** $\rightarrow$ **Apps Script**.
3. Hapus kode bawaan, lalu salin seluruh isi berkas `F:\aplikasi-7kebiasaan-anak-hebat\Code.gs` ke editor.
4. Di bilah fungsi atas, pilih fungsi **`initialSetup`**, lalu klik **Run (Jalankan)** dan berikan izin akses (*Review permissions* $\rightarrow$ *Advanced* $\rightarrow$ *Allow*).
5. Klik **Deploy** di kanan atas $\rightarrow$ **New deployment** $\rightarrow$ pilih **Web app**.
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
6. Salin **Web App URL** yang didapat.
7. Buka kembali aplikasi `index.html`, klik tombol **Mode Lokal** di pojok kanan atas, ubah ke **Mode Live**, tempelkan URL tersebut, dan klik **Simpan Pengaturan**.

---

## 📱 Langkah 3: Memasang di HP Android (Siswa & Guru)

1. Unggah folder aplikasi ke hosting web gratis (seperti GitHub Pages, Vercel, Netlify, atau Firebase).
2. Kirim link web ke siswa dan guru melalui WhatsApp.
3. Buka link tersebut di browser **Google Chrome HP Android**.
4. Klik tombol **"Install Aplikasi"** pada bilah notifikasi atas, atau klik menu titik tiga Chrome $\rightarrow$ pilih **"Tambahkan ke Layar Utama" / "Install Aplikasi"**.
5. Ikon **Anak Hebat** akan muncul di layar utama HP siswa dan dapat dibuka seperti aplikasi native tanpa bilah browser.
