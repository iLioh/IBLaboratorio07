# syntax=docker/dockerfile:1

# Stage 1: Install all dependencies for building
FROM node:24-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
RUN npm ci

# Stage 2: Compile backend and frontend
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=dependencies /app ./
COPY apps/web ./apps/web
COPY apps/api ./apps/api
RUN npm run build

# Stage 3: Install only production dependencies
FROM node:24-alpine AS prod-deps
WORKDIR /app
COPY package*.json ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
RUN npm ci --omit=dev

# Stage 4: Minimal production runtime
FROM node:24-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy production dependencies and module declarations
COPY --from=prod-deps /app/package.json ./package.json
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/apps/api/package.json ./apps/api/package.json

# Copy compiled backend and frontend SPA assets
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/web/dist ./apps/web/dist

# Use non-root user provided by node:alpine
USER node

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "apps/api/dist/server.js"]
