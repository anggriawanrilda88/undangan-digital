# syntax=docker/dockerfile:1

# ─── Stage 1: Builder ────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Install deps dulu (layer cache — hanya rebuild kalau package.json berubah)
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build Next.js standalone
# Env vars NEXT_PUBLIC_* harus tersedia saat build time karena di-inline ke JS bundle
ARG NEXT_PUBLIC_BASE_URL=https://undangan-digital.anggriawan.my.id
ARG NEXT_PUBLIC_API_URL=https://api-undangan-digital.anggriawan.my.id/api/v1
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

RUN npm run build

# ─── Stage 2: Runner ────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Non-root user untuk security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
