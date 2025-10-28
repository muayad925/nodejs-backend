# ---------- Dev environment ----------
FROM node:22-alpine
WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install ALL dependencies (including dev)
RUN npm install

# Copy everything else
COPY . .

# Expose your app port
EXPOSE 3000

# Default command for dev mode (hot reload)
CMD ["npm", "run", "dev"]
