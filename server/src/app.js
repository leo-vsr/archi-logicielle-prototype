/**
 * @fileoverview Point d'entrée de l'application Express.js (Tier 2 - Métier).
 * Configure le serveur Express, les middlewares, les routes et la connexion BDD.
 * Pattern Façade : l'API REST sert d'interface simplifiée entre le client et le serveur.
 * @module app
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const appConfig = require('./config/appConfig');
const { databasePool } = require('./config/database');

// Import des modèles (initialise les associations)
require('./models');

// Import des routes
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const listRoutes = require('./routes/listRoutes');

/** @type {express.Application} Instance Express */
const app = express();

// ==================== MIDDLEWARES GLOBAUX ====================

/**
 * @description Configuration CORS pour autoriser le client React (localhost:3000).
 */
app.use(cors({
  origin: appConfig.clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

/**
 * @description Parser JSON pour les requêtes entrantes.
 */
app.use(express.json({ limit: '10mb' }));

/**
 * @description Parser URL-encoded pour les formulaires.
 */
app.use(express.urlencoded({ extended: true }));

// ==================== ROUTES ====================

/**
 * @description Route de santé pour vérifier que le serveur fonctionne.
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, data: { status: 'OK', timestamp: new Date() } });
});

/** Routes d'authentification (publiques) */
app.use('/api/auth', authRoutes);

/** Routes des tâches (protégées par JWT) */
app.use('/api/taches', taskRoutes);

/** Routes de recherche (protégées par JWT) */
const authMiddleware = require('./middlewares/authMiddleware');
const authController = require('./controllers/authController');
const taskController = require('./controllers/taskController');
app.get('/api/search', authMiddleware, taskController.rechercher);

/** Routes du profil (protégées par JWT) */
const { body } = require('express-validator');
app.get('/api/profil', authMiddleware, authController.getProfil);
app.patch('/api/profil',
  authMiddleware,
  [body('nom_affichage').trim().isLength({ min: 1, max: 100 }).withMessage('Le nom d\'affichage est requis (1-100 caractères).')],
  authController.updateProfil
);
app.patch('/api/profil/password',
  authMiddleware,
  [
    body('ancien_mot_de_passe').notEmpty().withMessage('L\'ancien mot de passe est requis.'),
    body('nouveau_mot_de_passe').isLength({ min: 6 }).withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères.'),
  ],
  authController.changePassword
);

/** Routes des listes (protégées par JWT) */
app.use('/api/listes', listRoutes);

// ==================== GESTION D'ERREURS ====================

/**
 * @description Middleware pour les routes non trouvées (404).
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} non trouvée.`,
  });
});

/**
 * @description Middleware global de gestion d'erreurs.
 * Capture toutes les erreurs non gérées et retourne une réponse JSON cohérente.
 * @param {Error} err - Erreur capturée.
 * @param {import('express').Request} req - Requête Express.
 * @param {import('express').Response} res - Réponse Express.
 * @param {import('express').NextFunction} next - Fonction next.
 */
app.use((err, req, res, next) => {
  console.error('Erreur non gérée :', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Erreur interne du serveur.',
  });
});

// ==================== DÉMARRAGE DU SERVEUR ====================

/**
 * @async
 * @description Démarre le serveur Express après avoir vérifié la connexion BDD.
 */
const startServer = async () => {
  try {
    /** Tester la connexion à SQLite */
    await databasePool.testConnection();

    /** Synchroniser les modèles (crée les tables automatiquement si elles n'existent pas) */
    const { sequelize } = require('./config/database');
    await sequelize.sync({ alter: true });

    /** Démarrer le serveur HTTP */
    app.listen(appConfig.port, () => {
      console.log(`[OK] Serveur démarré sur le port ${appConfig.port}`);
      console.log(`[OK] API disponible sur http://localhost:${appConfig.port}/api`);
      console.log(`[OK] Client autorisé : ${appConfig.clientUrl}`);
    });
  } catch (error) {
    console.error('[ERREUR] Impossible de démarrer le serveur :', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
