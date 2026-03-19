

## Rencana: Fitur Layanan Pembuatan Website Gereja

### Ringkasan

Menambahkan section preview di landing page + halaman detail `/services` untuk menawarkan jasa pembuatan website gereja. Harga tidak ditampilkan -- pengunjung diarahkan ke WhatsApp untuk konsultasi.

---

### Komponen yang dibuat

**1. Section preview di landing page: `ChurchWebsiteTeaser.tsx`**
- Ditempatkan di Index.tsx sebelum `FinalCTA`
- Desain: background gelap, judul besar "Website untuk Gereja Anda", deskripsi singkat, dan tombol CTA "Lihat Layanan →" yang link ke `/services`
- Mengikuti style yang sama dengan section lain (framer-motion, scroll reveal, warna gold/warm)

**2. Halaman detail: `src/pages/Services.tsx`**
- Hero section dengan headline dan deskripsi layanan
- Section "Apa yang Kami Tawarkan" -- 3-4 kartu fitur (desain responsif, integrasi jadwal ibadah, donasi online, manajemen konten)
- Section "Bagaimana Prosesnya" -- 3 langkah sederhana (Konsultasi → Desain → Launch)
- Section CTA bawah dengan tombol WhatsApp (`https://wa.me/NOMOR?text=...`) -- kamu bisa ganti nomor WA nanti
- Tidak ada harga yang ditampilkan

**3. Update navigasi**
- Tambahkan "SERVICES" ke `navLinks` di Navbar.tsx
- Tambahkan route `/services` di App.tsx
- Tambahkan link di Footer.tsx

---

### Detail Teknis

- Tidak perlu database atau Supabase -- halaman ini murni statis/presentational
- Tombol CTA utama: `window.open('https://wa.me/62XXXX?text=Halo, saya tertarik dengan layanan website gereja', '_blank')`
- Nomor WhatsApp bisa di-hardcode dulu, nanti bisa dipindah ke tabel `settings` di Supabase kalau mau dikelola dari admin
- Semua animasi menggunakan framer-motion + useScrollReveal yang sudah ada
- Responsive: mobile-first seperti komponen lain

### File yang akan dibuat/diubah

| File | Aksi |
|------|------|
| `src/components/ChurchWebsiteTeaser.tsx` | Baru |
| `src/pages/Services.tsx` | Baru |
| `src/pages/Index.tsx` | Tambah import + section |
| `src/App.tsx` | Tambah route |
| `src/components/Navbar.tsx` | Tambah nav link |
| `src/components/Footer.tsx` | Tambah link |

