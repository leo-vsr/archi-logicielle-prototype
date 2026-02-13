FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 3001

# Lancer les migrations puis démarrer le serveur
CMD ["sh", "-c", "npx sequelize-cli db:migrate && node src/app.js"]
