# ─── Postboard API — Production Multi-Stage Dockerfile ────────────────────────
# Express + Prisma + BullMQ API server

FROM node:20-slim AS base

WORKDIR /app

COPY package*.json ./

# ─────────────── deps (ALL dependencies incl dev) ───────────────
FROM base AS deps
RUN npm ci

# ─────────────── builder ───────────────
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

# ─────────────── production deps only ───────────────
FROM base AS production

ENV NODE_ENV=production
ENV PORT=5000

RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY package*.json ./

USER appuser

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))"

CMD ["node", "dist/src/server.js"]
