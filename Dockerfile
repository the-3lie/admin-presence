# Déploiement de l'app admin (web) + API mobile (Scanner & Agent).
# Nécessite un vrai conteneur Linux (pas de serverless "edge") à cause
# du package `canvas` utilisé pour la reconnaissance faciale côté serveur.
# Fonctionne sur Render, Railway, Fly.io, un VPS, etc.

FROM node:20-bookworm-slim AS base

# Dépendances système requises pour compiler `canvas` (node-canvas)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    pkg-config \
    python3 \
    openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
