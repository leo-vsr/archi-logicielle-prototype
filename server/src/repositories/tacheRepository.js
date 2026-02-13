/**
 * @fileoverview Repository pour l'entité Tache.
 * Pattern Repository : encapsule toutes les requêtes Sequelize liées aux tâches.
 * @module repositories/tacheRepository
 */

const { Op, literal } = require('sequelize');
const { Tache, Liste, HistoriqueModification } = require('../models');

/**
 * @class TacheRepository
 * @description Abstraction de l'accès aux données pour les tâches.
 */
class TacheRepository {
  /**
   * @async
   * @description Crée une nouvelle tâche en base de données.
   * @param {Object} donnees - Données de la tâche.
   * @returns {Promise<Tache>} La tâche créée.
   */
  async creer(donnees) {
    return await Tache.create(donnees);
  }

  /**
   * @async
   * @description Récupère une tâche par son ID avec sa liste associée.
   * @param {string} id - UUID de la tâche.
   * @returns {Promise<Tache|null>} La tâche trouvée ou null.
   */
  async trouverParId(id) {
    return await Tache.findByPk(id, {
      include: [{ model: Liste, as: 'liste', attributes: ['id', 'nom', 'couleur'] }],
    });
  }

  /**
   * @async
   * @description Liste les tâches d'un utilisateur avec pagination, filtrage et tri.
   * @param {string} utilisateurId - UUID de l'utilisateur.
   * @param {Object} options - Options de requête.
   * @param {number} options.page - Numéro de page (1-indexed).
   * @param {number} options.limit - Nombre de résultats par page.
   * @param {string} [options.statut] - Filtre par statut.
   * @param {string} [options.priorite] - Filtre par priorité.
   * @param {string} [options.liste_id] - Filtre par liste.
   * @returns {Promise<{rows: Tache[], count: number}>} Tâches paginées et total.
   */
  async listerParUtilisateur(utilisateurId, options = {}) {
    const { page = 1, limit = 20, statut, priorite, liste_id } = options;
    const offset = (page - 1) * limit;

    /** @type {Object} Conditions de filtrage Sequelize */
    const where = { utilisateur_id: utilisateurId };

    if (statut) {
      where.statut = statut;
    }
    if (priorite) {
      where.priorite = priorite;
    }
    if (liste_id) {
      where.liste_id = liste_id;
    }

    return await Tache.findAndCountAll({
      where,
      include: [{ model: Liste, as: 'liste', attributes: ['id', 'nom', 'couleur'] }],
      order: [[literal('date_echeance IS NULL'), 'ASC'], ['date_echeance', 'ASC'], ['date_creation', 'DESC']],
      limit,
      offset,
    });
  }

  /**
   * @async
   * @description Met à jour partiellement une tâche.
   * @param {string} id - UUID de la tâche.
   * @param {Object} donnees - Données à mettre à jour.
   * @returns {Promise<Tache>} La tâche mise à jour.
   */
  async mettreAJour(id, donnees) {
    await Tache.update(donnees, { where: { id } });
    return await this.trouverParId(id);
  }

  /**
   * @async
   * @description Supprime une tâche par son ID.
   * @param {string} id - UUID de la tâche.
   * @returns {Promise<number>} Nombre de lignes supprimées.
   */
  async supprimer(id) {
    return await Tache.destroy({ where: { id } });
  }

  /**
   * @async
   * @description Recherche des tâches par mot-clé dans le titre et la description.
   * @param {string} utilisateurId - UUID de l'utilisateur.
   * @param {string} recherche - Terme de recherche.
   * @returns {Promise<Tache[]>} Tâches correspondantes.
   */
  async rechercher(utilisateurId, recherche) {
    return await Tache.findAll({
      where: {
        utilisateur_id: utilisateurId,
        [Op.or]: [
          { titre: { [Op.iLike]: `%${recherche}%` } },
          { description: { [Op.iLike]: `%${recherche}%` } },
        ],
      },
      include: [{ model: Liste, as: 'liste', attributes: ['id', 'nom', 'couleur'] }],
      order: [['date_creation', 'DESC']],
    });
  }

  /**
   * @async
   * @description Enregistre un changement de statut dans l'historique.
   * @param {string} tacheId - UUID de la tâche.
   * @param {string} ancienStatut - Statut avant modification.
   * @param {string} nouveauStatut - Statut après modification.
   * @returns {Promise<HistoriqueModification>} L'entrée d'historique créée.
   */
  async enregistrerHistorique(tacheId, ancienStatut, nouveauStatut) {
    return await HistoriqueModification.create({
      tache_id: tacheId,
      ancien_statut: ancienStatut,
      nouveau_statut: nouveauStatut,
    });
  }

  /**
   * @async
   * @description Compte les tâches par statut pour un utilisateur.
   * @param {string} utilisateurId - UUID de l'utilisateur.
   * @returns {Promise<Object>} Compteurs par statut.
   */
  async compterParStatut(utilisateurId) {
    const taches = await Tache.findAll({
      where: { utilisateur_id: utilisateurId },
      attributes: ['statut'],
    });

    const compteurs = {
      total: taches.length,
      A_FAIRE: 0,
      EN_COURS: 0,
      TERMINEE: 0,
    };

    taches.forEach((t) => {
      if (compteurs[t.statut] !== undefined) {
        compteurs[t.statut]++;
      }
    });

    return compteurs;
  }

  /**
   * @async
   * @description Met à null le liste_id de toutes les tâches d'une liste.
   * Utilisé lors de la suppression d'une liste.
   * @param {string} listeId - UUID de la liste.
   * @returns {Promise<void>}
   */
  async dissocierListe(listeId) {
    await Tache.update({ liste_id: null }, { where: { liste_id: listeId } });
  }
}

module.exports = new TacheRepository();
