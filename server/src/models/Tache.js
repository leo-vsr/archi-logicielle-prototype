/**
 * @fileoverview Modèle Sequelize pour la table 'taches'.
 * Représente une tâche appartenant à un utilisateur, potentiellement liée à une liste.
 * @module models/Tache
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * @typedef {Object} Tache
 * @property {string} id - UUID auto-généré
 * @property {string} titre - Titre de la tâche (3-100 caractères)
 * @property {string} description - Description optionnelle (max 2000 caractères)
 * @property {string} statut - Statut : A_FAIRE, EN_COURS, TERMINEE
 * @property {string} priorite - Priorité : BASSE, MOYENNE, HAUTE, URGENTE
 * @property {Date|null} date_echeance - Date d'échéance optionnelle
 * @property {Date} date_creation - Date de création
 * @property {Date|null} date_completion - Date de complétion (quand statut = TERMINEE)
 * @property {string} utilisateur_id - UUID de l'utilisateur propriétaire
 * @property {string|null} liste_id - UUID de la liste associée (optionnel)
 */
const Tache = sequelize.define('Tache', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
    comment: 'Identifiant unique de la tâche',
  },
  titre: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 100],
    },
    comment: 'Titre de la tâche (3-100 caractères)',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 2000],
    },
    comment: 'Description détaillée (max 2000 caractères)',
  },
  statut: {
    type: DataTypes.STRING,
    defaultValue: 'A_FAIRE',
    validate: {
      isIn: [['A_FAIRE', 'EN_COURS', 'TERMINEE']],
    },
    comment: 'Statut actuel de la tâche',
  },
  priorite: {
    type: DataTypes.STRING,
    defaultValue: 'MOYENNE',
    validate: {
      isIn: [['BASSE', 'MOYENNE', 'HAUTE', 'URGENTE']],
    },
    comment: 'Niveau de priorité de la tâche',
  },
  date_echeance: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Date d\'échéance optionnelle',
  },
  date_creation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Date de création de la tâche',
  },
  date_completion: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date de complétion (remplie quand statut = TERMINEE)',
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
  liste_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'listes',
      key: 'id',
    },
    comment: 'Référence optionnelle vers une liste thématique',
  },
}, {
  tableName: 'taches',
  timestamps: false,
  underscored: true,
});

module.exports = Tache;
