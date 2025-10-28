# ---------- Stage 1: Build ----------
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
# Install dev dependencies too for build tools (tsc, tsc-alias)
RUN npm install

COPY . .

# Generate Prisma client and compile TypeScript
RUN npx prisma generate
RUN npm run build

# ---------- Stage 2: Production Runtime ----------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
RUN npx prisma migrate deploy

CMD ["node", "dist/server.js"]
