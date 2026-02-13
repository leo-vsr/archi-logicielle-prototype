/**
 * @fileoverview Modèle Sequelize pour la table 'historique_modifications'.
 * Enregistre chaque changement de statut d'une tâche pour traçabilité.
 * @module models/HistoriqueModification
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * @typedef {Object} HistoriqueModification
 * @property {string} id - UUID auto-généré
 * @property {string} tache_id - UUID de la tâche concernée
 * @property {string} ancien_statut - Statut avant modification
 * @property {string} nouveau_statut - Statut après modification
 * @property {Date} date_modification - Date du changement
 */
const HistoriqueModification = sequelize.define('HistoriqueModification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
    comment: 'Identifiant unique de l\'entrée d\'historique',
  },
  tache_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'taches',
      key: 'id',
    },
    comment: 'Référence vers la tâche modifiée',
  },
  ancien_statut: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Statut de la tâche avant la modification',
  },
  nouveau_statut: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Statut de la tâche après la modification',
  },
  date_modification: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Horodatage de la modification',
  },
}, {
  tableName: 'historique_modifications',
  timestamps: false,
  underscored: true,
});

module.exports = HistoriqueModification;
