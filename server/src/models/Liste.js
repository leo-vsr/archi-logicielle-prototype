/**
 * @fileoverview Modèle Sequelize pour la table 'listes'.
 * Représente une liste thématique de tâches appartenant à un utilisateur.
 * @module models/Liste
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * @typedef {Object} Liste
 * @property {string} id - UUID auto-généré
 * @property {string} nom - Nom de la liste
 * @property {string} couleur - Couleur hexadécimale de la liste
 * @property {number} ordre - Ordre d'affichage de la liste
 * @property {string} utilisateur_id - UUID de l'utilisateur propriétaire
 */
const Liste = sequelize.define('Liste', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
    comment: 'Identifiant unique de la liste',
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 100],
    },
    comment: 'Nom de la liste thématique',
  },
  couleur: {
    type: DataTypes.STRING,
    defaultValue: '#3B82F6',
    comment: 'Couleur hexadécimale pour l\'affichage',
  },
  ordre: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Ordre d\'affichage dans la sidebar',
  },
  utilisateur_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'utilisateurs',
      key: 'id',
    },
    comment: 'Référence vers l\'utilisateur propriétaire',
  },
}, {
  tableName: 'listes',
  timestamps: false,
  underscored: true,
});

module.exports = Liste;
