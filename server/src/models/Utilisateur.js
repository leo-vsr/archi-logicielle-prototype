/**
 * @fileoverview Modèle Sequelize pour la table 'utilisateurs'.
 * Représente un utilisateur du gestionnaire de tâches.
 * @module models/Utilisateur
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * @typedef {Object} Utilisateur
 * @property {string} id - UUID auto-généré
 * @property {string} email - Email unique de l'utilisateur
 * @property {string} nom_affichage - Nom affiché dans l'interface
 * @property {string} mot_de_passe_hash - Hash bcrypt du mot de passe
 * @property {Date} date_creation - Date de création du compte
 * @property {boolean} actif - Indique si le compte est actif
 * @property {number} tentatives_echec - Nombre de tentatives de connexion échouées
 */
const Utilisateur = sequelize.define('Utilisateur', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
    comment: 'Identifiant unique de l\'utilisateur',
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
    comment: 'Adresse email unique de l\'utilisateur',
  },
  nom_affichage: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 100],
    },
    comment: 'Nom affiché dans l\'interface',
  },
  mot_de_passe_hash: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Hash bcrypt du mot de passe',
  },
  date_creation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Date de création du compte',
  },
  actif: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Indique si le compte est actif',
  },
  tentatives_echec: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Nombre de tentatives de connexion échouées consécutives',
  },
}, {
  tableName: 'utilisateurs',
  timestamps: false,
  underscored: true,
});

module.exports = Utilisateur;
