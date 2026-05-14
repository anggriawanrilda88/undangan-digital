# Deployment Guide — Frontend (Next.js)

**Server:** `undangan-digital.anggriawan.my.id`  
**Stack:** Node.js v22 + PM2 + Nginx (SSL sudah aktif)  
**Port:** Next.js jalan di `localhost:3000`, Nginx proxy ke subdomain

---

## Setup Awal (sekali saja)

```bash
# 1. Clone repo
git clone https://github.com/anggriawanrilda88/undangan-digital.git
cd undangan-digital/frontend

# 2. Install dependencies
npm ci

# 3. Setup env
cp .env.local.example .env.local
nano .env.local
# Isi: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, dll.

# 4. Build
npm run build

# 5. Start via PM2
pm2 start ecosystem.config.js

# 6. Persist PM2 across reboots
pm2 save
pm2 startup  # ikuti instruksi yang muncul
```

---

## Deploy Update

```bash
cd undangan-digital/frontend

# Pull latest
git pull origin main

# Install deps (jika ada perubahan package.json)
npm ci

# Build ulang
npm run build

# Restart (zero-downtime reload)
pm2 reload undangan-digital
```

---

## Monitoring

```bash
pm2 status                    # Cek status semua apps
pm2 logs undangan-digital     # Lihat logs real-time
pm2 logs undangan-digital --lines 100  # 100 baris terakhir
```

---

## Environment Variables

| Variable | Production | Development |
|---|---|---|
| `NEXT_PUBLIC_BASE_URL` | `https://undangan-digital.anggriawan.my.id` | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | `https://undangan-digital.anggriawan.my.id/api/v1` | `http://localhost:8080/api/v1` |
| `NEXT_PUBLIC_SUPABASE_URL` | (dari Supabase project) | sama |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (dari Supabase project) | sama |

> ⚠️ Jangan commit `.env.local` ke repo. Hanya `.env.local.example` yang boleh di-commit.

---

## Nginx Config (referensi)

Nginx harus proxy `localhost:3000` untuk semua request ke frontend:

```nginx
server {
    listen 443 ssl;
    server_name undangan-digital.anggriawan.my.id;

    # SSL config (sudah aktif)

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API (Golang - Reza)
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

> Koordinasikan Nginx config dengan Reza untuk `/api/` routing ke Golang.

---

## Troubleshooting

**Next.js tidak mau start:**
```bash
pm2 logs undangan-digital --lines 50
# Pastikan build sudah ada: ls .next/
```

**Port 3000 sudah terpakai:**
```bash
lsof -i :3000
pm2 delete undangan-digital && pm2 start ecosystem.config.js
```

**Build error:**
```bash
npm run build 2>&1 | head -50
# Pastikan .env.local sudah diisi dengan benar
```
