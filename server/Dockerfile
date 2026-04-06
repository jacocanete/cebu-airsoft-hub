# Build context must be repo root so prisma/ is reachable
FROM node:22-alpine AS builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/tsconfig.json ./
COPY server/src/ ./src/
COPY prisma/ /app/prisma/
RUN npx prisma generate --schema=/app/prisma/schema.prisma && npm run build

FROM node:22-alpine
WORKDIR /app/server
COPY --from=builder /app/server/package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/prisma/ /app/prisma/
RUN npx prisma generate --schema=/app/prisma/schema.prisma

EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
