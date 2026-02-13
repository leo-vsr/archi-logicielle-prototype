/**
 * @fileoverview Routes des tâches.
 * Pattern Façade : l'API REST comme interface simplifiée entre client et serveur.
 * Toutes les routes nécessitent un token JWT valide (authMiddleware).
 * @module routes/taskRoutes
 */

const express = require('express');
const { body, param } = require('express-validator');
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');

/** @type {express.Router} Routeur Express pour les tâches */
const router = express.Router();

/** Appliquer le middleware d'authentification sur toutes les routes */
router.use(authMiddleware);

/**
 * @route POST /api/taches
 * @description Crée une nouvelle tâche (statut initial = A_FAIRE).
 * @body {string} titre - Titre (3-100 caractères).
 * @body {string} [description] - Description (max 2000 caractères).
 * @body {string} [priorite] - BASSE, MOYENNE, HAUTE, URGENTE.
 * @body {string} [date_echeance] - Date au format YYYY-MM-DD.
 * @body {string} [liste_id] - UUID de la liste.
 * @returns {Object} {success, data: {tache}}
 */
router.post(
  '/',
  [
    body('titre')
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Le titre doit contenir entre 3 et 100 caractères.'),
    body('description')
      .optional({ nullable: true })
      .isLength({ max: 2000 })
      .withMessage('La description ne peut pas dépasser 2000 caractères.'),
    body('priorite')
      .optional()
      .isIn(['BASSE', 'MOYENNE', 'HAUTE', 'URGENTE'])
      .withMessage('La priorité doit être BASSE, MOYENNE, HAUTE ou URGENTE.'),
    body('date_echeance')
      .optional({ nullable: true })
      .isISO8601()
      .withMessage('La date d\'échéance doit être au format valide (YYYY-MM-DD).'),
    body('liste_id')
      .optional({ nullable: true })
      .isUUID()
      .withMessage('L\'identifiant de liste doit être un UUID valide.'),
  ],
  taskController.creerTache
);

/**
 * @route GET /api/taches
 * @description Liste paginée des tâches de l'utilisateur.
 * @query {number} [page=1] - Numéro de page.
 * @query {number} [limit=20] - Nombre de résultats par page.
 * @query {string} [statut] - Filtre par statut.
 * @query {string} [priorite] - Filtre par priorité.
 * @query {string} [liste_id] - Filtre par liste.
 * @returns {Object} {success, data: {taches, compteurs, pagination}}
 */
router.get('/', taskController.listerTaches);

/**
 * @route GET /api/taches/:id
 * @description Détail d'une tâche (vérifie propriétaire).
 * @param {string} id - UUID de la tâche.
 * @returns {Object} {success, data: {tache}}
 */
router.get(
  '/:id',
  [param('id').isUUID().withMessage('L\'identifiant doit être un UUID valide.')],
  taskController.detailTache
);

/**
 * @route PATCH /api/taches/:id
 * @description Modification partielle d'une tâche.
 * @param {string} id - UUID de la tâche.
 * @returns {Object} {success, data: {tache}}
 */
router.patch(
  '/:id',
  [
    param('id').isUUID().withMessage('L\'identifiant doit être un UUID valide.'),
    body('titre')
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Le titre doit contenir entre 3 et 100 caractères.'),
    body('description')
      .optional({ nullable: true })
      .isLength({ max: 2000 })
      .withMessage('La description ne peut pas dépasser 2000 caractères.'),
    body('statut')
      .optional()
      .isIn(['A_FAIRE', 'EN_COURS', 'TERMINEE'])
      .withMessage('Le statut doit être A_FAIRE, EN_COURS ou TERMINEE.'),
    body('priorite')
      .optional()
      .isIn(['BASSE', 'MOYENNE', 'HAUTE', 'URGENTE'])
      .withMessage('La priorité doit être BASSE, MOYENNE, HAUTE ou URGENTE.'),
    body('date_echeance')
      .optional({ nullable: true })
      .isISO8601()
      .withMessage('La date d\'échéance doit être au format valide.'),
    body('liste_id')
      .optional({ nullable: true })
      .isUUID()
      .withMessage('L\'identifiant de liste doit être un UUID valide.'),
  ],
  taskController.modifierTache
);

/**
 * @route DELETE /api/taches/:id
 * @description Supprime une tâche (vérifie propriétaire).
 * @param {string} id - UUID de la tâche.
 * @returns {Object} {success, data: {message}}
 */
router.delete(
  '/:id',
  [param('id').isUUID().withMessage('L\'identifiant doit être un UUID valide.')],
  taskController.supprimerTache
);

module.exports = router;
