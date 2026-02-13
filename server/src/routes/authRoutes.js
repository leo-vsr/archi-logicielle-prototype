/**
 * @fileoverview Routes d'authentification et de gestion du profil.
 * Pattern Façade : l'API REST comme interface simplifiée entre client et serveur.
 * @module routes/authRoutes
 */

const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');

/** @type {express.Router} Routeur Express pour l'authentification */
const router = express.Router();

// ==================== ROUTES PUBLIQUES ====================

/**
 * @route POST /api/auth/register
 * @description Inscription d'un nouvel utilisateur.
 * @body {string} email - Email valide.
 * @body {string} mot_de_passe - Mot de passe (min 6 caractères).
 * @body {string} nom_affichage - Nom affiché (1-100 caractères).
 * @returns {Object} {success, data: {utilisateur}}
 */
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .withMessage('L\'email doit être valide.')
      .normalizeEmail(),
    body('mot_de_passe')
      .isLength({ min: 6 })
      .withMessage('Le mot de passe doit contenir au moins 6 caractères.'),
    body('nom_affichage')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Le nom d\'affichage est requis (1-100 caractères).'),
  ],
  authController.register
);

/**
 * @route POST /api/auth/login
 * @description Connexion d'un utilisateur existant.
 * @body {string} email - Email valide.
 * @body {string} mot_de_passe - Mot de passe.
 * @returns {Object} {success, data: {token, utilisateur}}
 */
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('L\'email doit être valide.')
      .normalizeEmail(),
    body('mot_de_passe')
      .notEmpty()
      .withMessage('Le mot de passe est requis.'),
  ],
  authController.login
);

module.exports = router;
