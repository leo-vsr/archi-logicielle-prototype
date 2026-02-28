/**
 * @fileoverview Repository pour l'entité Liste.
 * Pattern Repository : encapsule toutes les requêtes Sequelize liées aux listes.
 * @module repositories/listeRepository
 */

const { sequelize } = require('../config/database');
const { Liste, Tache } = require('../models');

/**
 * @class ListeRepository
 * @description Abstraction de l'accès aux données pour les listes thématiques.
 */
class ListeRepository {
  /**
   * @async
   * @description Crée une nouvelle liste en base de données.
   * @param {Object} donnees - Données de la liste.
   * @param {string} donnees.nom - Nom de la liste.
   * @param {string} [donnees.couleur] - Couleur hexadécimale.
   * @param {number} [donnees.ordre] - Ordre d'affichage.
   * @param {string} donnees.utilisateur_id - UUID de l'utilisateur propriétaire.
   * @returns {Promise<Liste>} La liste créée.
   */
  async creer(donnees) {
    return await Liste.create(donnees);
  }

  /**
   * @async
   * @description Recherche une liste par son identifiant UUID.
   * @param {string} id - UUID de la liste.
   * @returns {Promise<Liste|null>} La liste trouvée ou null.
   */
  async trouverParId(id) {
    return await Liste.findByPk(id);
  }

  /**
   * @async
   * @description Liste toutes les listes d'un utilisateur avec le nombre de tâches associées.
   * @param {string} utilisateurId - UUID de l'utilisateur.
   * @returns {Promise<Liste[]>} Listes avec compteur de tâches.
   */
  async listerParUtilisateur(utilisateurId) {
    return await Liste.findAll({
      where: { utilisateur_id: utilisateurId },
      attributes: {
        include: [
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM taches WHERE taches.liste_id = `Liste`.`id`)'
            ),
            'nombre_taches',
          ],
        ],
      },
      order: [['ordre', 'ASC'], ['nom', 'ASC']],
    });
  }

  /**
   * @async
   * @description Met à jour une liste existante.
   * @param {string} id - UUID de la liste.
   * @param {Object} donnees - Données à mettre à jour (nom, couleur, ordre).
   * @returns {Promise<Liste>} La liste mise à jour.
   */
  async mettreAJour(id, donnees) {
    await Liste.update(donnees, { where: { id } });
    return await this.trouverParId(id);
  }

  /**
   * @async
   * @description Supprime une liste par son ID.
   * @param {string} id - UUID de la liste.
   * @returns {Promise<number>} Nombre de lignes supprimées.
   */
  async supprimer(id) {
    return await Liste.destroy({ where: { id } });
  }
}

module.exports = new ListeRepository();
