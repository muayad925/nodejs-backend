# ---------- Stage 1: Base ----------
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./

# ---------- Stage 2: Development ----------
FROM base AS dev
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

# ---------- Stage 3: Build ----------
FROM base AS builder
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# ---------- Stage 4: Production ----------
FROM node:22-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
