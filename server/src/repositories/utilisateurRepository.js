/**
 * @fileoverview Repository pour l'entité Utilisateur.
 * Pattern Repository : encapsule toutes les requêtes Sequelize liées aux utilisateurs.
 * Aucun appel Sequelize direct ne doit être fait dans les controllers.
 * @module repositories/utilisateurRepository
 */

const { Utilisateur } = require('../models');

/**
 * @class UtilisateurRepository
 * @description Abstraction de l'accès aux données pour les utilisateurs.
 */
class UtilisateurRepository {
  /**
   * @async
   * @description Crée un nouvel utilisateur en base de données.
   * @param {Object} donnees - Données de l'utilisateur.
   * @param {string} donnees.email - Email de l'utilisateur.
   * @param {string} donnees.nom_affichage - Nom affiché.
   * @param {string} donnees.mot_de_passe_hash - Hash bcrypt du mot de passe.
   * @returns {Promise<Utilisateur>} L'utilisateur créé.
   */
  async creer(donnees) {
    return await Utilisateur.create(donnees);
  }

  /**
   * @async
   * @description Recherche un utilisateur par son email.
   * @param {string} email - Email à rechercher.
   * @returns {Promise<Utilisateur|null>} L'utilisateur trouvé ou null.
   */
  async trouverParEmail(email) {
    return await Utilisateur.findOne({ where: { email } });
  }

  /**
   * @async
   * @description Recherche un utilisateur par son identifiant UUID.
   * @param {string} id - UUID de l'utilisateur.
   * @returns {Promise<Utilisateur|null>} L'utilisateur trouvé ou null.
   */
  async trouverParId(id) {
    return await Utilisateur.findByPk(id, {
      attributes: { exclude: ['mot_de_passe_hash'] },
    });
  }

  /**
   * @async
   * @description Recherche un utilisateur par son ID avec le mot de passe hash inclus.
   * Utilisé pour la vérification de mot de passe lors du changement.
   * @param {string} id - UUID de l'utilisateur.
   * @returns {Promise<Utilisateur|null>} L'utilisateur trouvé ou null.
   */
  async trouverParIdAvecMotDePasse(id) {
    return await Utilisateur.findByPk(id);
  }

  /**
   * @async
   * @description Met à jour les données d'un utilisateur.
   * @param {string} id - UUID de l'utilisateur.
   * @param {Object} donnees - Données à mettre à jour.
   * @returns {Promise<Utilisateur>} L'utilisateur mis à jour.
   */
  async mettreAJour(id, donnees) {
    await Utilisateur.update(donnees, { where: { id } });
    return await this.trouverParId(id);
  }

  /**
   * @async
   * @description Met à jour le mot de passe hashé d'un utilisateur.
   * @param {string} id - UUID de l'utilisateur.
   * @param {string} motDePasseHash - Nouveau hash bcrypt.
   * @returns {Promise<void>}
   */
  async mettreAJourMotDePasse(id, motDePasseHash) {
    await Utilisateur.update({ mot_de_passe_hash: motDePasseHash }, { where: { id } });
  }

  /**
   * @async
   * @description Incrémente le compteur de tentatives de connexion échouées.
   * @param {string} id - UUID de l'utilisateur.
   * @returns {Promise<void>}
   */
  async incrementerTentativesEchec(id) {
    await Utilisateur.increment('tentatives_echec', { where: { id } });
  }

  /**
   * @async
   * @description Réinitialise le compteur de tentatives de connexion échouées.
   * @param {string} id - UUID de l'utilisateur.
   * @returns {Promise<void>}
   */
  async reinitialiserTentativesEchec(id) {
    await Utilisateur.update({ tentatives_echec: 0 }, { where: { id } });
  }
}

module.exports = new UtilisateurRepository();
