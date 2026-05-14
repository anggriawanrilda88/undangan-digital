/**
 * PM2 Ecosystem Config — Next.js production deployment
 * Server: undangan-digital.anggriawan.my.id
 * Node: v22 | PM2 | Nginx reverse proxy
 *
 * Deploy steps:
 *   1. cd frontend/
 *   2. cp .env.local.example .env.local && nano .env.local  (isi semua secrets)
 *   3. npm ci
 *   4. npm run build
 *   5. pm2 start ecosystem.config.js
 *   6. pm2 save && pm2 startup
 */

module.exports = {
  apps: [
    {
      name: "undangan-digital",
      script: "npm",
      args: "start",
      cwd: "./",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      // Log files
      out_file: "./logs/pm2-out.log",
      error_file: "./logs/pm2-error.log",
      merge_logs: true,
      time: true,
    },
  ],
}
