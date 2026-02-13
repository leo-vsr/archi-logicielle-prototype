# Gestionnaire de Tâches (To-Do List)

Prototype fonctionnel d'un gestionnaire de tâches basé sur une architecture 3-Tiers (Layered Architecture).

## Architecture

- **Tier 1 (Présentation)** : React.js 18 (SPA) avec Tailwind CSS
- **Tier 2 (Métier)** : Node.js 18 + Express.js 4 (API REST)
- **Tier 3 (Données)** : PostgreSQL 15

### Patterns de conception

- **MVC** : Model (Sequelize) / View (React) / Controller (Express)
- **Repository** : Abstraction de l'accès aux données
- **Facade** : API REST comme interface simplifiée
- **Singleton** : Pool de connexions BDD et configuration

---

## Guide d'installation complet (depuis zéro)

Ce guide part du principe que vous avez une machine vierge (macOS, Linux ou Windows).
La seule dépendance à installer manuellement est **Docker Desktop**, qui embarque Docker Engine et Docker Compose.

### Etape 1 : Installer Git

Git est nécessaire pour cloner le projet (ou vous pouvez télécharger le ZIP directement).

#### macOS

Ouvrez un terminal (`Terminal.app` ou iTerm2) et tapez :

```bash
git --version
```

Si Git n'est pas installé, macOS vous proposera automatiquement d'installer les **Xcode Command Line Tools**. Acceptez et attendez la fin de l'installation. Sinon, vous pouvez l'installer manuellement :

```bash
xcode-select --install
```

#### Linux (Ubuntu / Debian)

```bash
sudo apt update
sudo apt install -y git
```

#### Linux (Fedora / RHEL)

```bash
sudo dnf install -y git
```

#### Windows

Téléchargez l'installeur depuis : https://git-scm.com/download/win

Lancez l'installeur et suivez les étapes par défaut. Une fois installé, ouvrez **Git Bash** (installé avec Git) ou **PowerShell** pour exécuter les commandes suivantes.

#### Vérification

```bash
git --version
```

Résultat attendu (la version peut varier) :

```
git version 2.43.0
```

---

### Etape 2 : Installer Docker Desktop

Docker permet de lancer l'application entière (base de données, API, frontend) sans installer Node.js, PostgreSQL, ou quoi que ce soit d'autre sur votre machine.

#### macOS

1. Allez sur : https://www.docker.com/products/docker-desktop/
2. Cliquez sur **Download for Mac**
   - Choisissez **Apple Silicon** si vous avez un Mac M1/M2/M3/M4
   - Choisissez **Intel** si vous avez un Mac Intel
3. Ouvrez le fichier `.dmg` téléchargé
4. Glissez l'icône **Docker** dans le dossier **Applications**
5. Lancez **Docker Desktop** depuis le Launchpad ou le dossier Applications
6. Attendez que Docker démarre (l'icône Docker dans la barre de menu en haut doit indiquer "Docker Desktop is running")

#### Linux (Ubuntu / Debian)

```bash
# Mettre à jour les paquets
sudo apt update

# Installer les dépendances nécessaires
sudo apt install -y ca-certificates curl gnupg

# Ajouter la clé GPG officielle de Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Ajouter le dépôt Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installer Docker Engine et Docker Compose
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Ajouter votre utilisateur au groupe docker (pour ne pas avoir à utiliser sudo)
sudo usermod -aG docker $USER

# IMPORTANT : déconnectez-vous puis reconnectez-vous pour que le changement de groupe prenne effet
# Ou exécutez :
newgrp docker
```

#### Windows

1. Allez sur : https://www.docker.com/products/docker-desktop/
2. Cliquez sur **Download for Windows**
3. Lancez l'installeur `Docker Desktop Installer.exe`
4. Cochez **Use WSL 2 instead of Hyper-V** (recommandé)
5. Suivez les étapes d'installation et redémarrez si demandé
6. Lancez **Docker Desktop** depuis le menu Démarrer
7. Attendez que Docker démarre (l'icône dans la barre des tâches doit indiquer "Docker Desktop is running")

> **Note Windows** : Si WSL 2 n'est pas installé, Docker Desktop vous guidera pour l'activer. Suivez les instructions affichées.

#### Vérification (tous les OS)

Ouvrez un terminal et tapez :

```bash
docker --version
```

Résultat attendu (la version peut varier) :

```
Docker version 27.x.x, build xxxxxxx
```

Puis vérifiez Docker Compose :

```bash
docker compose version
```

Résultat attendu :

```
Docker Compose version v2.x.x
```

> **Important** : Si la commande `docker compose` (sans tiret) ne fonctionne pas, essayez `docker-compose` (avec tiret). Les deux fonctionnent, mais la version sans tiret est la plus récente.

---

### Etape 3 : Récupérer le projet

#### Option A : Cloner avec Git

```bash
git clone <URL_DU_DEPOT>
cd gestionnaire-taches
```

#### Option B : Télécharger le ZIP

Si vous avez reçu le projet sous forme de ZIP :

1. Décompressez le fichier ZIP
2. Ouvrez un terminal et naviguez dans le dossier du projet :

```bash
cd /chemin/vers/gestionnaire-taches
```

#### Vérification

Vérifiez que vous êtes bien dans le bon dossier en listant les fichiers :

```bash
ls -la
```

Vous devez voir au minimum :

```
docker-compose.yml
.env.example
README.md
client/
server/
```

---

### Etape 4 : Configurer les variables d'environnement

Le projet utilise un fichier `.env` pour stocker la configuration (identifiants base de données, clé JWT, etc.). Un fichier d'exemple `.env.example` est fourni.

```bash
cp .env.example .env
```

> **Sur Windows (PowerShell)** :
> ```powershell
> Copy-Item .env.example .env
> ```

Le fichier `.env` contient les variables suivantes :

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `DB_HOST` | Hôte de la base de données | `db` (nom du service Docker) |
| `DB_PORT` | Port interne PostgreSQL | `5432` |
| `DB_NAME` | Nom de la base de données | `gestionnaire_taches` |
| `DB_USER` | Utilisateur PostgreSQL | `postgres` |
| `DB_PASSWORD` | Mot de passe PostgreSQL | `postgres` |
| `JWT_SECRET` | Clé secrète pour les tokens JWT | A changer en production |
| `PORT` | Port de l'API Express | `3001` |
| `CLIENT_URL` | URL du frontend (pour CORS) | `http://localhost:3000` |

> **Note** : Les valeurs par défaut fonctionnent telles quelles pour le développement local. Vous n'avez rien à modifier pour tester le projet.

---

### Etape 5 : Lancer l'application

Assurez-vous que **Docker Desktop est bien lancé et en cours d'exécution** avant de continuer.

```bash
docker compose up --build
```

> Si `docker compose` ne fonctionne pas, utilisez `docker-compose up --build` (avec tiret).

Cette commande va :

1. **Télécharger les images Docker** nécessaires (PostgreSQL 15, Node.js 18) — uniquement au premier lancement
2. **Construire les images** du client et du serveur à partir des Dockerfiles
3. **Démarrer 3 conteneurs** :
   - `gestionnaire_taches_db` — Base de données PostgreSQL
   - `gestionnaire_taches_server` — API REST Express.js (attend que la BDD soit prête)
   - `gestionnaire_taches_client` — Application React.js (attend que l'API soit prête)
4. **Exécuter les migrations** de base de données automatiquement (création des tables)

Le premier lancement peut prendre **2 à 5 minutes** selon votre connexion internet (téléchargement des images et des dépendances npm).

#### Logs attendus en cas de succès

Vous devriez voir dans le terminal :

```
gestionnaire_taches_db      | database system is ready to accept connections
gestionnaire_taches_server  | [OK] Connexion à PostgreSQL établie avec succès.
gestionnaire_taches_server  | [OK] Serveur démarré sur le port 3001
gestionnaire_taches_server  | [OK] API disponible sur http://localhost:3001/api
gestionnaire_taches_server  | [OK] Client autorisé : http://localhost:3000
gestionnaire_taches_client  | Compiled successfully!
```

---

### Etape 6 : Accéder à l'application

Une fois les 3 conteneurs démarrés, ouvrez votre navigateur web :

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Interface utilisateur React |
| **API** | http://localhost:3001/api | API REST (pour tests avec Postman/curl) |

#### Créer un compte

1. Ouvrez http://localhost:3000
2. Sur la page de connexion, cliquez sur **"Créer un compte"**
3. Remplissez le formulaire d'inscription (nom, email, mot de passe)
4. Vous serez automatiquement connecté après l'inscription

---

### Etape 7 : Arrêter l'application

Pour arrêter tous les conteneurs, appuyez sur `Ctrl + C` dans le terminal où Docker tourne, puis :

```bash
docker compose down
```

Pour arrêter **et supprimer les données** de la base de données (repart de zéro) :

```bash
docker compose down -v
```

> Le flag `-v` supprime le volume Docker `pgdata` qui contient les données PostgreSQL.

---

### Relancer l'application (après le premier lancement)

Si vous avez déjà construit les images une première fois et que vous n'avez pas modifié le code :

```bash
docker compose up
```

Si vous avez modifié le code source et souhaitez reconstruire :

```bash
docker compose up --build
```

---

## Résolution de problèmes courants

### Le port 3000 ou 3001 est déjà utilisé

**Erreur** : `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solution** : Un autre programme utilise déjà ce port. Arrêtez-le ou changez le port dans `docker-compose.yml`.

Pour trouver quel programme utilise le port :

```bash
# macOS / Linux
lsof -i :3000

# Windows (PowerShell)
netstat -ano | findstr :3000
```

### Le port 5433 (PostgreSQL) est déjà utilisé

**Erreur** : `Bind for 0.0.0.0:5433 failed: port is already allocated`

**Solution** : Si vous avez PostgreSQL installé localement, il utilise peut-être ce port. Changez le port dans `docker-compose.yml` (ligne `"5433:5432"`) par un autre port libre, par exemple `"5434:5432"`.

### Le serveur ne démarre pas (erreur de connexion à la BDD)

**Cause probable** : La base de données n'est pas encore prête quand le serveur essaie de se connecter.

**Solution** : Arrêtez tout et relancez :

```bash
docker compose down
docker compose up --build
```

Le `healthcheck` dans `docker-compose.yml` s'assure normalement que le serveur attend que PostgreSQL soit prêt.

### Les modifications du code ne sont pas prises en compte

**Solution** : Reconstruisez les images :

```bash
docker compose up --build
```

### Repartir de zéro (reset complet)

```bash
# Arrêter et supprimer conteneurs, volumes et images
docker compose down -v --rmi all

# Relancer depuis zéro
docker compose up --build
```

---

## Endpoints API

### Authentification (publics)
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |

### Tâches (JWT requis)
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/taches` | Créer une tâche |
| GET | `/api/taches` | Lister (paginé, filtrable) |
| GET | `/api/taches/:id` | Détail d'une tâche |
| PATCH | `/api/taches/:id` | Modifier une tâche |
| DELETE | `/api/taches/:id` | Supprimer une tâche |
| GET | `/api/search?q=mot` | Recherche |

### Listes (JWT requis)
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/listes` | Créer une liste |
| GET | `/api/listes` | Lister avec compteurs |
| PATCH | `/api/listes/:id` | Modifier une liste |
| DELETE | `/api/listes/:id` | Supprimer une liste |

### Profil (JWT requis)
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/profil` | Infos utilisateur |
| PATCH | `/api/profil` | Modifier le profil |
| PATCH | `/api/profil/password` | Changer le mot de passe |

---

## Structure du projet

```
gestionnaire-taches/
├── client/                          # Tier 1 - Présentation (React.js 18)
│   ├── Dockerfile                   # Image Docker du client
│   ├── package.json                 # Dépendances npm du client
│   ├── public/
│   │   └── index.html               # Page HTML racine
│   └── src/
│       ├── index.js                 # Point d'entrée React
│       ├── App.jsx                  # Composant racine (routing auth)
│       ├── context/
│       │   └── AuthContext.jsx      # Contexte d'authentification (JWT)
│       ├── services/
│       │   ├── authService.js       # Appels API authentification
│       │   └── taskService.js       # Appels API tâches / listes
│       └── components/
│           ├── EcranConnexion.jsx   # Page login / inscription
│           ├── EcranTaches.jsx      # Dashboard principal
│           ├── FormulaireTache.jsx  # Modal création / édition de tâche
│           ├── ListeNavigation.jsx  # Sidebar filtres et listes
│           └── ProfilUtilisateur.jsx # Modal gestion du profil
│
├── server/                          # Tier 2 - Métier (Express.js 4)
│   ├── Dockerfile                   # Image Docker du serveur
│   ├── package.json                 # Dépendances npm du serveur
│   ├── .sequelizerc                 # Configuration Sequelize CLI
│   ├── migrations/
│   │   └── 20240101000001-create-tables.js  # Migration initiale (4 tables)
│   └── src/
│       ├── app.js                   # Point d'entrée Express (routes, middlewares)
│       ├── config/
│       │   ├── appConfig.js         # Configuration applicative (Singleton)
│       │   └── database.js          # Pool Sequelize (Singleton)
│       ├── models/
│       │   ├── index.js             # Associations entre modèles
│       │   ├── Utilisateur.js       # Modèle utilisateur
│       │   ├── Liste.js             # Modèle liste thématique
│       │   ├── Tache.js             # Modèle tâche
│       │   └── HistoriqueModification.js  # Modèle historique
│       ├── repositories/
│       │   ├── utilisateurRepository.js   # Accès données utilisateurs
│       │   ├── listeRepository.js         # Accès données listes
│       │   └── tacheRepository.js         # Accès données tâches
│       ├── controllers/
│       │   ├── authController.js    # Logique auth (login, register, profil)
│       │   └── taskController.js    # Logique tâches et listes
│       ├── middlewares/
│       │   └── authMiddleware.js    # Vérification JWT
│       └── routes/
│           ├── authRoutes.js        # Routes publiques (login, register)
│           ├── taskRoutes.js        # Routes tâches (CRUD)
│           └── listRoutes.js        # Routes listes (CRUD)
│
├── docker-compose.yml               # Orchestration des 3 services
├── .env.example                     # Variables d'environnement (template)
├── .env                             # Variables d'environnement (local, non versionné)
└── README.md                        # Ce fichier
```

---

## Technologies utilisées

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Frontend | React.js | 18.2 |
| Styling | Tailwind CSS | (via CDN) |
| HTTP Client | Axios | 1.6 |
| Backend | Express.js | 4.18 |
| ORM | Sequelize | 6.35 |
| Base de données | PostgreSQL | 15 |
| Authentification | JWT (jsonwebtoken) | 9.0 |
| Hachage mots de passe | bcrypt | 5.1 |
| Validation | express-validator | 7.0 |
| Conteneurisation | Docker + Docker Compose | 27.x / 2.x |
| Runtime | Node.js | 18 (Alpine) |
