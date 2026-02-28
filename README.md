# Gestionnaire de Tâches (To-Do List)

Prototype fonctionnel d'un gestionnaire de tâches basé sur une architecture 3-Tiers (Layered Architecture).

> **Note** : Ce prototype utilise **SQLite** comme base de données par souci de simplicité, afin de pouvoir présenter et tester l'application rapidement sur n'importe quelle machine, sans infrastructure supplémentaire. A terme, le déploiement en production est prévu avec **PostgreSQL** et **Docker** (Compose), comme décrit dans la documentation technique.

## Architecture

- **Tier 1 (Présentation)** : React.js 18 (SPA) avec Tailwind CSS
- **Tier 2 (Métier)** : Node.js 18 + Express.js 4 (API REST)
- **Tier 3 (Données)** : SQLite (via Sequelize ORM)

### Patterns de conception

- **MVC** : Model (Sequelize) / View (React) / Controller (Express)
- **Repository** : Abstraction de l'accès aux données
- **Facade** : API REST comme interface simplifiée
- **Singleton** : Connexion BDD et configuration

---

## Prérequis

Installer les outils suivants sur votre machine :

1. **Git** : https://git-scm.com/downloads
2. **Node.js 18+** : https://nodejs.org/ (choisir la version LTS)

> Node.js inclut **npm** automatiquement. Vérifiez l'installation avec `node -v` et `npm -v` dans un terminal.

---

## Installation et lancement

### 1. Cloner le projet

```bash
git clone https://github.com/leo-vsr/archi-logicielle-prototype.git
cd archi-logicielle-prototype
```

### 2. Configurer les variables d'environnement

```bash
# macOS / Git Bash
cp .env.example .env
```

```powershell
# Windows (PowerShell)
Copy-Item .env.example .env
```

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `JWT_SECRET` | Clé secrète pour les tokens JWT | A personnaliser |
| `PORT` | Port de l'API Express | `3001` |
| `CLIENT_URL` | URL du frontend (CORS) | `http://localhost:3000` |

> Les valeurs par défaut fonctionnent telles quelles. Rien à modifier pour tester.

### 3. Installer les dépendances et lancer le serveur (API)

```bash
cd server
npm install
npm start
```

Vous devriez voir :

```
[OK] Connexion à SQLite établie avec succès.
[OK] Serveur démarré sur le port 3001
[OK] API disponible sur http://localhost:3001/api
[OK] Client autorisé : http://localhost:3000
```

> La base de données SQLite (`server/data/database.sqlite`) est créée automatiquement au premier lancement. Aucune configuration supplémentaire n'est nécessaire.

### 4. Installer les dépendances et lancer le client (Frontend)

Ouvrez un **second terminal** :

```bash
cd client
npm install
npm start
```

Le navigateur s'ouvre automatiquement sur http://localhost:3000.

### 5. Créer un compte et utiliser l'application

1. Sur la page de connexion, cliquez sur **"Créer un compte"**
2. Remplissez le formulaire (nom, email, mot de passe)
3. Vous serez automatiquement connecté

---

## Arrêter l'application

Appuyez sur `Ctrl + C` dans chaque terminal (serveur et client).

Pour **repartir de zéro** (supprimer toutes les données), supprimez le fichier de base de données :

```bash
# macOS / Git Bash
rm server/data/database.sqlite
```

```powershell
# Windows (PowerShell)
Remove-Item server\data\database.sqlite
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
│   ├── package.json                 # Dépendances npm du serveur
│   ├── data/                        # Base de données SQLite (auto-générée)
│   ├── migrations/
│   │   └── 20240101000001-create-tables.js  # Migration initiale (4 tables)
│   └── src/
│       ├── app.js                   # Point d'entrée Express (routes, middlewares)
│       ├── config/
│       │   ├── appConfig.js         # Configuration applicative (Singleton)
│       │   └── database.js          # Connexion Sequelize SQLite (Singleton)
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
├── docker-compose.yml               # Orchestration Docker (option production)
├── .env.example                     # Variables d'environnement (template)
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
| Base de données | SQLite | 3 |
| Authentification | JWT (jsonwebtoken) | 9.0 |
| Hachage mots de passe | bcrypt | 5.1 |
| Validation | express-validator | 7.0 |
| Runtime | Node.js | 18+ |
