# ─── Postboard Frontend — Production Multi-Stage Dockerfile ───────────────────
# TanStack Start SSR application

# ──────── Stage 1: Dependencies ────────
FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ──────── Stage 2: Builder ────────
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx tsr generate && npm run build

# ──────── Stage 3: Production ────────
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 postboard

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

USER postboard

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "fetch('http://localhost:3000').then(r => {process.exit(r.ok?0:1)}).catch(()=>process.exit(1))"

CMD ["node", "dist/server/server.js"]
