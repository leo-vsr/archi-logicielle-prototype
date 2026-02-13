/**
 * @fileoverview Routes des listes thématiques.
 * Pattern Façade : l'API REST comme interface simplifiée entre client et serveur.
 * Toutes les routes nécessitent un token JWT valide (authMiddleware).
 * @module routes/listRoutes
 */

const express = require('express');
const { body, param } = require('express-validator');
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');

/** @type {express.Router} Routeur Express pour les listes */
const router = express.Router();

/** Appliquer le middleware d'authentification sur toutes les routes */
router.use(authMiddleware);

/**
 * @route POST /api/listes
 * @description Crée une nouvelle liste pour l'utilisateur connecté.
 * @body {string} nom - Nom de la liste (1-100 caractères).
 * @body {string} [couleur] - Couleur hexadécimale (défaut: #3B82F6).
 * @body {number} [ordre] - Ordre d'affichage (défaut: 0).
 * @returns {Object} {success, data: {liste}}
 */
router.post(
  '/',
  [
    body('nom')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Le nom de la liste est requis (1-100 caractères).'),
    body('couleur')
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('La couleur doit être au format hexadécimal (#RRGGBB).'),
    body('ordre')
      .optional()
      .isInt({ min: 0 })
      .withMessage('L\'ordre doit être un entier positif.'),
  ],
  taskController.creerListe
);

/**
 * @route GET /api/listes
 * @description Liste toutes les listes de l'utilisateur avec COUNT des tâches.
 * @returns {Object} {success, data: {listes}}
 */
router.get('/', taskController.listerListes);

/**
 * @route PATCH /api/listes/:id
 * @description Modifie une liste (nom, couleur, ordre).
 * @param {string} id - UUID de la liste.
 * @returns {Object} {success, data: {liste}}
 */
router.patch(
  '/:id',
  [
    param('id').isUUID().withMessage('L\'identifiant doit être un UUID valide.'),
    body('nom')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Le nom de la liste doit contenir entre 1 et 100 caractères.'),
    body('couleur')
      .optional()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage('La couleur doit être au format hexadécimal (#RRGGBB).'),
    body('ordre')
      .optional()
      .isInt({ min: 0 })
      .withMessage('L\'ordre doit être un entier positif.'),
  ],
  taskController.modifierListe
);

/**
 * @route DELETE /api/listes/:id
 * @description Supprime une liste et met liste_id = NULL sur les tâches associées.
 * @param {string} id - UUID de la liste.
 * @returns {Object} {success, data: {message}}
 */
router.delete(
  '/:id',
  [param('id').isUUID().withMessage('L\'identifiant doit être un UUID valide.')],
  taskController.supprimerListe
);

module.exports = router;
