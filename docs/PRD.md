# PRD: Web Undangan Digital Pernikahan

**Version:** 1.0
**Author:** Prita (Product Owner)
**Tech Reviewer:** Reza (Software Engineer) — *pending review*
**Status:** Draft
**Last Updated:** Mei 2026

---

## 🎯 Product Vision

Menjadi platform undangan digital pernikahan **tercepat, termudah, dan paling WhatsApp-friendly** di Indonesia — memungkinkan pasangan membuat undangan profesional dalam 10 menit tanpa butuh bantuan CS.

---

## 👥 Target Users

| Segment | Deskripsi | Pain Point |
|---|---|---|
| **Primary** | Pasangan 22–35 tahun yang akan menikah | Undangan existing lambat, susah custom, harga tidak transparan |
| **Secondary** | Wedding Organizer & Fotografer | Butuh tool untuk semua client mereka |
| **Tertiary** | Tamu undangan | Sulit RSVP, undangan tidak mobile-friendly |

---

## 📊 Success Metrics

| Metric | Phase 1 Target | Phase 2 Target | Phase 3 Target |
|---|---|---|---|
| Undangan dibuat | 50 | 300 | 1.000 |
| Revenue/bulan | Rp 3jt | Rp 15jt | Rp 50jt |
| RSVP rate | >60% | >70% | >75% |
| Page load time | <2 detik | <1.5 detik | <1 detik |
| NPS Score | >30 | >50 | >60 |

---

## 🏗️ Tech Stack *(reviewed & confirmed by Reza — Software Engineer)*

| Layer | Pilihan | Catatan |
|---|---|---|
| **Frontend** | Next.js (App Router) + Tailwind CSS + Framer Motion | SSR/SSG bawaan → load < 2 detik; satu codebase untuk landing + dashboard |
| **Template Engine** | React components dengan standardized `TemplateProps` interface | Opsi A dulu (hardcoded, ship cepat), rencana migrasi ke dynamic JSON renderer di Phase 2/3 saat template > 10 atau perlu non-engineer tambah template |
| **Backend** | **Golang + Gin** | REST API framework, performa tinggi, clean architecture |
| **ORM** | **GORM** | PostgreSQL ORM untuk Golang |
| **Database** | PostgreSQL via Supabase | Relational, cocok untuk guest list + RSVP |
| **Auth** | Supabase Auth | Magic link + Google OAuth, gratis, proven |
| **File Storage** | Supabase Storage + Cloudflare R2 | Supabase untuk foto/QRIS, R2 untuk media besar (10GB gratis) |
| **Realtime** | Supabase Realtime (built-in) | Untuk wish wall Phase 2, tidak perlu setup tambahan |
| **Frontend Hosting** | Vercel | Gratis s/d ~$20/bulan |
| **CDN** | Cloudflare | Free |
| **WA Notif** | Fonnte (Phase 2) → migrasi WA Cloud API official saat scale | Lokal, murah, hindari Twilio |

**Estimasi biaya infra awal: < Rp 400rb/bulan** ✅ (jauh di bawah budget Rp 3jt)
Kalau traffic naik: upgrade Supabase Pro ($25) + Vercel Pro ($20) masih aman di budget.

### 🏗️ Golang Project Structure (Clean Architecture / DDD)

```
src/
├── app/
│   ├── dto/           # Data Transfer Objects (request/response)
│   └── usecase/       # Application use cases / business logic
├── domain/
│   ├── entities/      # Core domain entities
│   ├── errors/        # Domain-specific errors
│   ├── repositories/  # Repository interfaces
│   ├── value_object/  # Value objects
│   └── ports/         # Domain ports (interfaces)
├── infra/
│   ├── models/        # GORM models
│   ├── persistence/   # Repository implementations
│   └── ports/         # Infrastructure ports
├── interface/
│   └── rest/
│       └── v1/
│           └── <name_of_context>/  # e.g. invitation, rsvp, guest
migration/             # Database migrations
```

---

## ⚠️ Red Flags Teknis *(dari Reza)*

1. **Custom domain (Phase 3)** → Wildcard DNS + auto SSL provisioning kompleks. Estimasi 3–4 minggu, jangan underestimate
2. **WA Notifikasi** → Pakai Fonnte dulu (lokal, murah). WA unofficial API bisa kena suspend — plan migrasi ke WA Cloud API official saat scale
3. **QRIS/amplop digital** → Hanya upload gambar, bukan auto-verified payment. Ekspektasi user harus diset jelas dari awal
4. **Live streaming embed** → Jangan bangun infra sendiri. Cukup embed YouTube Live/Zoom link — effort 3 hari saja
5. **White-label (Phase 3)** → Butuh multi-tenant logic yang proper (tenant isolation). Architecture review wajib sebelum build
6. **Performance HP mid-range** → Wajib test di device nyata (Redmi/Samsung A-series) sejak Phase 1. Image optimization tidak boleh diabaikan

---

## 🔴 Phase 1 — MVP

**Durasi:** 4–6 minggu
**Goal:** Bisa dijual, bisa dipakai, dapat feedback nyata

### Scope

- Auth (email + Google OAuth)
- Template picker (min 3 template)
- Form editor undangan (self-serve)
- Halaman undangan publik (shareable link)
- RSVP system
- Guest list dashboard
- Amplop digital (rekening + QRIS)

### Out of Scope Phase 1

- Notifikasi WhatsApp
- Custom domain
- Analytics
- Payment gateway terintegrasi

### Pricing

| Paket | Harga | Fitur |
|---|---|---|
| Basic | Rp 49.000 | 3 template, link standar |
| Premium | Rp 149.000 | Semua template, QRIS, export CSV |

### User Stories & Acceptance Criteria

---

#### US-01: Registrasi & Login
> *Sebagai calon pengantin, saya ingin bisa daftar dan login ke platform supaya saya bisa mengelola undangan saya.*

**Acceptance Criteria:**
- [ ] User bisa daftar dengan email + password
- [ ] User bisa login dengan Google OAuth
- [ ] Jika email sudah terdaftar, tampil pesan error yang jelas
- [ ] Setelah login, user diarahkan ke dashboard
- [ ] Session bertahan minimal 7 hari

---

#### US-02: Pilih Template
> *Sebagai pengantin, saya ingin memilih dari beberapa template undangan supaya undangan saya terlihat profesional.*

**Acceptance Criteria:**
- [ ] Tersedia minimal 3 template berbeda di MVP
- [ ] User bisa preview template sebelum memilih
- [ ] User bisa ganti template setelah dipilih (sebelum publish)
- [ ] Preview menampilkan contoh data dummy

---

#### US-03: Isi Data Undangan
> *Sebagai pengantin, saya ingin mengisi detail pernikahan (nama, tanggal, lokasi, foto) supaya undangan saya personal.*

**Acceptance Criteria:**
- [ ] Form tersedia: nama pengantin (pria & wanita), tanggal & waktu akad, tanggal & waktu resepsi, lokasi + Google Maps link, foto couple (upload)
- [ ] Semua field tervalidasi sebelum simpan
- [ ] Perubahan tersimpan otomatis (auto-save) tiap 30 detik
- [ ] User bisa preview undangan real-time saat mengisi form

---

#### US-04: Share Link Undangan
> *Sebagai pengantin, saya ingin mendapatkan link undangan yang bisa saya share ke tamu supaya mudah disebarkan.*

**Acceptance Criteria:**
- [ ] Link undangan format: `namaplatform.com/u/[slug]`
- [ ] Slug bisa dikustomisasi (jika belum dipakai orang lain)
- [ ] Tombol "Share via WhatsApp" dengan pesan default yang bisa diedit
- [ ] Link bisa di-copy dengan satu klik
- [ ] Undangan bisa di-set public/private

---

#### US-05: RSVP oleh Tamu
> *Sebagai tamu undangan, saya ingin mengkonfirmasi kehadiran saya supaya pengantin tahu berapa orang yang datang.*

**Acceptance Criteria:**
- [ ] Form RSVP tersedia: nama tamu, hadir/tidak hadir, jumlah tamu yang dibawa
- [ ] Setelah submit RSVP, tampil halaman konfirmasi yang ramah
- [ ] Tamu bisa submit RSVP tanpa perlu login
- [ ] RSVP bisa disubmit dari HP tanpa bug
- [ ] Batas waktu RSVP bisa diset oleh pengantin

---

#### US-06: Dashboard Pengantin
> *Sebagai pengantin, saya ingin melihat rekap tamu yang sudah RSVP supaya saya bisa merencanakan keperluan acara.*

**Acceptance Criteria:**
- [ ] Dashboard menampilkan: total tamu hadir, total tidak hadir, total belum konfirmasi
- [ ] List tamu dengan filter (hadir/tidak hadir/belum konfirmasi)
- [ ] List bisa di-export ke CSV
- [ ] Data real-time (tidak perlu refresh manual)

---

#### US-07: Amplop Digital
> *Sebagai pengantin, saya ingin menampilkan informasi rekening/QRIS supaya tamu bisa memberi hadiah secara digital.*

**Acceptance Criteria:**
- [ ] Pengantin bisa input nomor rekening bank + atas nama
- [ ] Pengantin bisa upload foto QRIS
- [ ] Tampil di halaman undangan dengan tombol "Salin Nomor Rekening"
- [ ] Bisa tambah multiple rekening (maks 3)

### Risiko Phase 1

| Risk | Impact | Mitigation |
|---|---|---|
| Upload foto lambat di koneksi lemah | High | Kompresi otomatis di client-side sebelum upload |
| Template tidak menarik | High | Validasi dengan user interview sebelum build |
| RSVP form tidak jalan di HP tertentu | Medium | Testing di min 5 device Android berbeda |
| Slug collision | Low | Generate slug otomatis + validasi uniqueness real-time |

### Go/No-Go ke Phase 2
✅ Minimal 30 undangan terbuat
✅ NPS > 30
✅ Tidak ada bug kritis selama 2 minggu post-launch

---

## 🟡 Phase 2 — Growth Features

**Durasi:** 6–8 minggu (setelah Phase 1 live & stabil)
**Goal:** Increase retention, reduce churn, enable viral growth

### Scope

- Notifikasi WA ke pengantin (via Fonnte/WA Cloud API)
- Wish wall (ucapan & doa dari tamu)
- Galeri foto interaktif
- Analytics dashboard (views, unique visitors, grafik per hari)
- Reminder WA otomatis H-3 & H-1 ke tamu yang belum RSVP
- Export data tamu ke Excel

### User Stories & Acceptance Criteria

---

#### US-08: Notifikasi WhatsApp ke Pengantin
> *Sebagai pengantin, saya ingin menerima notifikasi WA setiap ada tamu yang RSVP supaya saya selalu update.*

**Acceptance Criteria:**
- [ ] Setelah ada RSVP masuk, WA terkirim ke nomor pengantin dalam < 1 menit
- [ ] Format pesan: nama tamu, status kehadiran, jumlah orang
- [ ] Pengantin bisa ON/OFF notifikasi dari dashboard
- [ ] Tidak ada duplikasi notifikasi untuk RSVP yang sama

---

#### US-09: Wish Wall
> *Sebagai tamu, saya ingin meninggalkan ucapan selamat di halaman undangan supaya momen terasa lebih spesial.*

**Acceptance Criteria:**
- [ ] Form ucapan: nama + pesan (maks 300 karakter)
- [ ] Ucapan tampil secara real-time di halaman undangan
- [ ] Pengantin bisa hide/delete ucapan yang tidak pantas dari dashboard
- [ ] Ucapan tampil dalam urutan terbaru (terbaru di atas)
- [ ] Rate limit: 1 ucapan per IP per 5 menit (anti spam)

---

#### US-10: Analytics Undangan
> *Sebagai pengantin, saya ingin tahu berapa orang yang membuka undangan saya supaya saya tahu seberapa efektif penyebarannya.*

**Acceptance Criteria:**
- [ ] Dashboard menampilkan: total views, unique visitors, grafik views per hari
- [ ] Data diupdate setiap jam
- [ ] Tidak menghitung view dari pengantin sendiri (berdasarkan auth session)
- [ ] Tampil top referrer (dari WA, IG, dll.)

---

#### US-11: Reminder WA ke Tamu
> *Sebagai pengantin, saya ingin mengirim reminder otomatis ke tamu yang belum RSVP supaya saya bisa mendapat konfirmasi lebih banyak.*

**Acceptance Criteria:**
- [ ] Pengantin bisa import nomor WA tamu ke dashboard
- [ ] Sistem kirim reminder otomatis H-3 dan H-1 ke tamu yang belum RSVP
- [ ] Pengantin bisa preview & edit pesan reminder sebelum kirim
- [ ] Log pengiriman tersedia di dashboard
- [ ] Tamu bisa unsubscribe dari reminder

### Pricing Phase 2

| Paket | Harga | Fitur |
|---|---|---|
| Basic | Rp 49.000 | 3 template, link standar |
| Premium | Rp 149.000 | Semua template, QRIS, export CSV |
| Pro | Rp 299.000 | Semua fitur + WA notif + analytics + reminder |

### Risiko Phase 2

| Risk | Impact | Mitigation |
|---|---|---|
| WA API rate limit | Medium | Queue system + retry logic |
| Abuse wish wall (spam/konten tidak pantas) | Medium | Rate limiting + moderasi pengantin |
| Analytics tidak akurat | Low | Gunakan library terpercaya (Plausible/Umami self-hosted) |
| Biaya WA API melonjak | Medium | Cap per paket + monitor usage |

### Go/No-Go ke Phase 3
✅ Revenue > Rp 10jt/bulan
✅ Ada minimal 3 WO yang aktif request white-label
✅ Retention rate > 80% (undangan tidak di-cancel dalam 7 hari)

---

## 🔵 Phase 3 — Diferensiasi & Moat

**Durasi:** 8–12 minggu (setelah Phase 2 live & stabil)
**Goal:** Build defensible moat, scale revenue via B2B channel

### Scope

- Custom domain per undangan + auto SSL provisioning
- Template adat daerah (Jawa, Sunda, Batak, Minang — min 1 per adat)
- White-label untuk WO/fotografer (subdomain + branding)
- Live streaming embed (YouTube/Zoom — bukan self-host)
- Multi-language (Indonesia + English)
- Guest seating arrangement tool
- Filter & export laporan untuk WO dashboard

### User Stories & Acceptance Criteria

---

#### US-12: Custom Domain
> *Sebagai pengantin premium, saya ingin undangan saya bisa diakses dari domain custom supaya lebih personal dan berkesan.*

**Acceptance Criteria:**
- [ ] User bisa input custom domain di dashboard
- [ ] Tersedia panduan langkah-langkah setup DNS (dengan screenshot)
- [ ] SSL otomatis ter-provisioning dalam < 10 menit setelah DNS valid
- [ ] Jika DNS belum valid, tampil status terkini + troubleshooting guide
- [ ] Custom domain bisa di-remove dan dikembalikan ke link standar

---

#### US-13: White-label untuk WO
> *Sebagai Wedding Organizer, saya ingin menggunakan platform ini dengan brand saya sendiri supaya terlihat profesional di depan client saya.*

**Acceptance Criteria:**
- [ ] WO bisa upload logo sendiri (maks 2MB, format PNG/JPG/SVG)
- [ ] WO bisa set warna brand (primary & secondary color)
- [ ] URL menggunakan subdomain: `nama-wo.namaplatform.com`
- [ ] WO bisa kelola semua undangan client mereka dari satu dashboard
- [ ] Laporan per-client (total undangan, total RSVP) tersedia untuk WO
- [ ] Branding platform tidak muncul di undangan white-label

---

#### US-14: Live Streaming Embed
> *Sebagai pengantin, saya ingin menampilkan live streaming acara di halaman undangan supaya tamu yang tidak bisa hadir tetap bisa menyaksikan.*

**Acceptance Criteria:**
- [ ] Pengantin bisa input YouTube Live / Zoom link
- [ ] Embed tampil di halaman undangan dengan player yang responsif
- [ ] Embed hanya aktif pada tanggal & waktu yang ditentukan
- [ ] Fallback message tampil jika stream belum/sudah selesai
- [ ] Embed tidak memperlambat loading halaman undangan (lazy load)

### Pricing Phase 3

| Paket | Harga | Fitur |
|---|---|---|
| Basic | Rp 49.000 | 3 template, link standar |
| Premium | Rp 149.000 | Semua template, QRIS, export CSV |
| Pro | Rp 299.000 | Semua fitur + WA notif + analytics + reminder |
| Elite | Rp 449.000 | Semua fitur + custom domain + live streaming + template adat |
| B2B/WO | Rp 99.000/undangan | Min 10 undangan/bulan, white-label, WO dashboard |
| Custom Domain add-on | Rp 50.000 | Bisa ditambah ke paket apapun |

### Risiko Phase 3

| Risk | Impact | Mitigation |
|---|---|---|
| Custom domain provisioning kompleks | High | Spike 1 minggu sebelum commit ke roadmap, libatkan Reza early |
| Live streaming cost melonjak | High | Embed YouTube/Zoom saja — bukan self-host stream |
| White-label tenant isolation bocor | High | Architecture review dengan Reza sebelum build, security audit |
| Template adat tidak akurat secara budaya | Medium | Konsultasi dengan perwakilan komunitas adat |

---

## 📣 Strategi Marketing per Phase

### Phase 1 — Seed & Validate
- **Minggu 1–2:** Post WA/IG story, buat waiting list Google Form → target 50 sign-up
- **Minggu 3–4:** Onboard 5 beta tester gratis (dari circle sendiri)
- **Post-launch:** Minta review & testimoni, share di grup WO Facebook

### Phase 2 — Community-Led Growth
- Masuk ke grup Facebook Wedding Organizer → tawarkan akun reseller gratis untuk 10 WO pertama
- Kolaborasi fotografer wedding → komisi 20–30% per referral
- Konten TikTok/IG Reels: *"Cara buat undangan digital 5 menit"*
- Referral program: pasangan yang pakai bisa dapat cashback/komisi

### Phase 3 — Scale & Organic
- SEO optimization: target keyword *"undangan digital pernikahan"*, *"undangan online murah"*
- Daftarkan di Tokopedia/Shopee sebagai digital product
- Press release / kolaborasi dengan media wedding & lifestyle
- Program partnership formal dengan WO & fotografer

---

## 📌 Appendix

### Competitive Landscape

| Kompetitor | Kekuatan | Kelemahan | Peluang Kita |
|---|---|---|---|
| **Undangan.id** | Template banyak, brand kuat | UI agak lama, loading lambat | UX modern + performa |
| **Nikahku** | Fitur lengkap, komunitas besar | Kompleks, banyak fitur tidak terpakai | Simpel & fokus |
| **Canva (Link)** | Design bagus | Tidak ada RSVP, bukan dedicated | Fitur wedding-specific |
| **Freelancer custom** | Custom total | Mahal, lama, tidak scalable | Self-serve murah & cepat |
| **IG/WA biasa** | Gratis | Tidak ada RSVP, tidak profesional | Nilai lebih dengan harga terjangkau |

### Diferensiasi Utama
1. ⚡ **Performa** — buka < 2 detik di HP Android mid-range
2. 📲 **WhatsApp-first** — RSVP & notif via WA, bukan email
3. 🏪 **B2B Channel** — white-label untuk WO sebagai moat jangka panjang
