/**
 * @fileoverview Migration Sequelize pour créer les 4 tables du gestionnaire de tâches.
 * Tables : utilisateurs, listes, taches, historique_modifications.
 * @module migrations/create-tables
 */

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * @async
   * @description Crée les tables de la base de données.
   * @param {import('sequelize').QueryInterface} queryInterface - Interface de requête Sequelize.
   * @param {import('sequelize').DataTypes} Sequelize - Types de données Sequelize.
   */
  async up(queryInterface, Sequelize) {
    /** Activer l'extension uuid-ossp pour la génération d'UUID */
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    /** Création de la table utilisateurs */
    await queryInterface.createTable('utilisateurs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      nom_affichage: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      mot_de_passe_hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      date_creation: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
      actif: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      tentatives_echec: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
    });

    /** Création de la table listes */
    await queryInterface.createTable('listes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false,
      },
      nom: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      couleur: {
        type: Sequelize.STRING,
        defaultValue: '#3B82F6',
      },
      ordre: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      utilisateur_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'utilisateurs',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });

    /** Création de la table taches */
    await queryInterface.createTable('taches', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false,
      },
      titre: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      statut: {
        type: Sequelize.STRING,
        defaultValue: 'A_FAIRE',
      },
      priorite: {
        type: Sequelize.STRING,
        defaultValue: 'MOYENNE',
      },
      date_echeance: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      date_creation: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
      date_completion: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      utilisateur_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'utilisateurs',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      liste_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'listes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
    });

    /** Création de la table historique_modifications */
    await queryInterface.createTable('historique_modifications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false,
      },
      tache_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'taches',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      ancien_statut: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      nouveau_statut: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      date_modification: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    /** Index pour améliorer les performances des requêtes fréquentes */
    await queryInterface.addIndex('taches', ['utilisateur_id']);
    await queryInterface.addIndex('taches', ['liste_id']);
    await queryInterface.addIndex('taches', ['statut']);
    await queryInterface.addIndex('taches', ['priorite']);
    await queryInterface.addIndex('listes', ['utilisateur_id']);
    await queryInterface.addIndex('historique_modifications', ['tache_id']);
  },

  /**
   * @async
   * @description Supprime toutes les tables (rollback).
   * @param {import('sequelize').QueryInterface} queryInterface - Interface de requête Sequelize.
   */
  async down(queryInterface) {
    await queryInterface.dropTable('historique_modifications');
    await queryInterface.dropTable('taches');
    await queryInterface.dropTable('listes');
    await queryInterface.dropTable('utilisateurs');
  },
};
