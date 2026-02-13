/**
 * @fileoverview Contrôleur d'authentification (ServiceAuth).
 * Gère l'inscription, la connexion et la gestion du profil utilisateur.
 * Pattern MVC : Controller qui orchestre la logique métier d'authentification.
 * @module controllers/authController
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const utilisateurRepository = require('../repositories/utilisateurRepository');
const appConfig = require('../config/appConfig');

/**
 * @class AuthController
 * @description Contrôleur gérant toutes les opérations d'authentification et de profil.
 */
class AuthController {
  /**
   * @async
   * @description Inscrit un nouvel utilisateur.
   * Hash le mot de passe avec bcrypt (salt rounds = 10) et crée l'utilisateur.
   * @param {import('express').Request} req - Requête avec body {email, mot_de_passe, nom_affichage}.
   * @param {import('express').Response} res - Réponse Express.
   * @returns {Promise<void>}
   */
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
      }

      const { email, mot_de_passe, nom_affichage } = req.body;

      /** Vérifier si l'email est déjà utilisé */
      const existant = await utilisateurRepository.trouverParEmail(email);
      if (existant) {
        return res.status(400).json({
          success: false,
          error: 'Un compte avec cet email existe déjà.',
        });
      }

      /** Hash du mot de passe avec bcrypt (salt rounds = 10) */
      const motDePasseHash = await bcrypt.hash(mot_de_passe, appConfig.bcryptSaltRounds);

      /** Création de l'utilisateur via le repository */
      const utilisateur = await utilisateurRepository.creer({
        email,
        nom_affichage,
        mot_de_passe_hash: motDePasseHash,
      });

      return res.status(201).json({
        success: true,
        data: {
          utilisateur: {
            id: utilisateur.id,
            email: utilisateur.email,
            nom_affichage: utilisateur.nom_affichage,
            date_creation: utilisateur.date_creation,
          },
        },
      });
    } catch (error) {
      console.error('Erreur lors de l\'inscription :', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur.',
      });
    }
  }

  /**
   * @async
   * @description Connecte un utilisateur existant.
   * Vérifie les identifiants, gère le verrouillage après 3 tentatives échouées,
   * et génère un token JWT valide 24h.
   * @param {import('express').Request} req - Requête avec body {email, mot_de_passe}.
   * @param {import('express').Response} res - Réponse Express.
   * @returns {Promise<void>}
   */
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
      }

      const { email, mot_de_passe } = req.body;

      /** Recherche de l'utilisateur par email */
      const utilisateur = await utilisateurRepository.trouverParEmail(email);
      if (!utilisateur) {
        return res.status(401).json({
          success: false,
          error: 'Identifiants invalides.',
        });
      }

      /** Vérification du verrouillage du compte (>= 3 tentatives échouées) */
      if (utilisateur.tentatives_echec >= appConfig.maxLoginAttempts) {
        return res.status(423).json({
          success: false,
          error: 'Compte verrouillé suite à trop de tentatives échouées. Contactez un administrateur.',
        });
      }

      /** Vérification du mot de passe avec bcrypt */
      const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe_hash);

      if (!motDePasseValide) {
        /** Incrémenter les tentatives échouées */
        await utilisateurRepository.incrementerTentativesEchec(utilisateur.id);

        /** Recharger pour vérifier si le compte est maintenant verrouillé */
        await utilisateur.reload();
        if (utilisateur.tentatives_echec >= appConfig.maxLoginAttempts) {
          return res.status(423).json({
            success: false,
            error: 'Compte verrouillé suite à trop de tentatives échouées. Contactez un administrateur.',
          });
        }

        return res.status(401).json({
          success: false,
          error: 'Identifiants invalides.',
        });
      }

      /** Réinitialiser les tentatives échouées après connexion réussie */
      await utilisateurRepository.reinitialiserTentativesEchec(utilisateur.id);

      /** Génération du token JWT (expire en 24h) */
      const token = jwt.sign(
        { id: utilisateur.id, email: utilisateur.email },
        appConfig.jwtSecret,
        { expiresIn: appConfig.jwtExpiration }
      );

      return res.status(200).json({
        success: true,
        data: {
          token,
          utilisateur: {
            id: utilisateur.id,
            email: utilisateur.email,
            nom_affichage: utilisateur.nom_affichage,
            date_creation: utilisateur.date_creation,
          },
        },
      });
    } catch (error) {
      console.error('Erreur lors de la connexion :', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur.',
      });
    }
  }

  /**
   * @async
   * @description Récupère les informations du profil de l'utilisateur connecté.
   * @param {import('express').Request} req - Requête avec req.utilisateur (depuis JWT).
   * @param {import('express').Response} res - Réponse Express.
   * @returns {Promise<void>}
   */
  async getProfil(req, res) {
    try {
      const utilisateur = await utilisateurRepository.trouverParId(req.utilisateur.id);

      if (!utilisateur) {
        return res.status(404).json({
          success: false,
          error: 'Utilisateur non trouvé.',
        });
      }

      return res.status(200).json({
        success: true,
        data: { utilisateur },
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du profil :', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur.',
      });
    }
  }

  /**
   * @async
   * @description Met à jour le nom d'affichage de l'utilisateur connecté.
   * @param {import('express').Request} req - Requête avec body {nom_affichage}.
   * @param {import('express').Response} res - Réponse Express.
   * @returns {Promise<void>}
   */
  async updateProfil(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
      }

      const { nom_affichage } = req.body;
      const utilisateur = await utilisateurRepository.mettreAJour(req.utilisateur.id, { nom_affichage });

      return res.status(200).json({
        success: true,
        data: { utilisateur },
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil :', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur.',
      });
    }
  }

  /**
   * @async
   * @description Change le mot de passe de l'utilisateur connecté.
   * Vérifie l'ancien mot de passe avant d'appliquer le nouveau.
   * @param {import('express').Request} req - Requête avec body {ancien_mot_de_passe, nouveau_mot_de_passe}.
   * @param {import('express').Response} res - Réponse Express.
   * @returns {Promise<void>}
   */
  async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
      }

      const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;

      /** Récupérer l'utilisateur avec le hash du mot de passe */
      const utilisateur = await utilisateurRepository.trouverParIdAvecMotDePasse(req.utilisateur.id);

      if (!utilisateur) {
        return res.status(404).json({
          success: false,
          error: 'Utilisateur non trouvé.',
        });
      }

      /** Vérifier l'ancien mot de passe */
      const ancienValide = await bcrypt.compare(ancien_mot_de_passe, utilisateur.mot_de_passe_hash);
      if (!ancienValide) {
        return res.status(400).json({
          success: false,
          error: 'L\'ancien mot de passe est incorrect.',
        });
      }

      /** Hash du nouveau mot de passe */
      const nouveauHash = await bcrypt.hash(nouveau_mot_de_passe, appConfig.bcryptSaltRounds);
      await utilisateurRepository.mettreAJourMotDePasse(req.utilisateur.id, nouveauHash);

      return res.status(200).json({
        success: true,
        data: { message: 'Mot de passe modifié avec succès.' },
      });
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe :', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur.',
      });
    }
  }
}

module.exports = new AuthController();
