FROM node:20-bookworm

# Définir le répertoire de travail dans le conteneur
WORKDIR /usr/src/app

# Installer les dépendances système requises pour canvas (si besoin)
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances du projet
RUN npm install

# Copier le reste des fichiers du projet
COPY . .

# Lancer le bot
CMD ["node", "index.js"]
