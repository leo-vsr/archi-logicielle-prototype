/**
 * @fileoverview Point d'entrée des modèles Sequelize.
 * Définit les associations entre les modèles et les exporte.
 * @module models/index
 */

const Utilisateur = require('./Utilisateur');
const Liste = require('./Liste');
const Tache = require('./Tache');
const HistoriqueModification = require('./HistoriqueModification');

// === ASSOCIATIONS ===

/**
 * Un utilisateur possède plusieurs listes.
 * Une liste appartient à un utilisateur.
 */
Utilisateur.hasMany(Liste, { foreignKey: 'utilisateur_id', as: 'listes' });
Liste.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id', as: 'utilisateur' });

/**
 * Un utilisateur possède plusieurs tâches.
 * Une tâche appartient à un utilisateur.
 */
Utilisateur.hasMany(Tache, { foreignKey: 'utilisateur_id', as: 'taches' });
Tache.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id', as: 'utilisateur' });

/**
 * Une liste contient plusieurs tâches.
 * Une tâche peut appartenir à une liste (optionnel).
 */
Liste.hasMany(Tache, { foreignKey: 'liste_id', as: 'taches' });
Tache.belongsTo(Liste, { foreignKey: 'liste_id', as: 'liste' });

/**
 * Une tâche possède un historique de modifications de statut.
 */
Tache.hasMany(HistoriqueModification, { foreignKey: 'tache_id', as: 'historique' });
HistoriqueModification.belongsTo(Tache, { foreignKey: 'tache_id', as: 'tache' });

module.exports = {
  Utilisateur,
  Liste,
  Tache,
  HistoriqueModification,
};
