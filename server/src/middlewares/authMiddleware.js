/**
 * @fileoverview Middleware d'authentification JWT.
 * Vérifie la présence et la validité du token JWT dans le header Authorization.
 * Protège toutes les routes nécessitant une authentification.
 * @module middlewares/authMiddleware
 */

const jwt = require('jsonwebtoken');
const appConfig = require('../config/appConfig');

/**
 * @function authMiddleware
 * @description Middleware Express qui vérifie le token JWT.
 * Extrait le token du header Authorization: Bearer <token>.
 * Si valide, ajoute l'utilisateur décodé à req.utilisateur.
 * @param {import('express').Request} req - Requête Express.
 * @param {import('express').Response} res - Réponse Express.
 * @param {import('express').NextFunction} next - Fonction next.
 * @returns {void}
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token d\'authentification manquant ou invalide.',
      });
    }

    /** @type {string} Token JWT extrait du header */
    const token = authHeader.split(' ')[1];

    /** @type {Object} Payload décodé du token JWT */
    const decoded = jwt.verify(token, appConfig.jwtSecret);

    /** @type {Object} Informations utilisateur extraites du JWT */
    req.utilisateur = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Le token a expiré. Veuillez vous reconnecter.',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token invalide.',
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification du token.',
    });
  }
};

module.exports = authMiddleware;
