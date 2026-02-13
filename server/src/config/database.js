/**
 * @fileoverview Singleton DatabasePool - Pool de connexions Sequelize vers PostgreSQL.
 * Pattern Singleton : une seule instance Sequelize partagée dans toute l'application.
 * Sert aussi de fichier de configuration pour sequelize-cli (migrations).
 * @module config/database
 */

const { Sequelize } = require('sequelize');

/**
 * @description Configuration de la base de données pour sequelize-cli.
 * Utilisé par les migrations et le seeder.
 */
const dbConfig = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'gestionnaire_taches',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    dialect: 'postgres',
    logging: false,
  },
  production: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'gestionnaire_taches',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    dialect: 'postgres',
    logging: false,
  },
};

/**
 * @class DatabasePool
 * @description Singleton gérant le pool de connexions Sequelize.
 * Garantit qu'une seule instance de connexion existe dans l'application.
 */
class DatabasePool {
  /**
   * @constructor
   * @description Crée l'instance Sequelize si elle n'existe pas encore.
   */
  constructor() {
    if (DatabasePool._instance) {
      return DatabasePool._instance;
    }

    const env = process.env.NODE_ENV || 'development';
    const config = dbConfig[env];

    /** @type {Sequelize} Instance Sequelize unique */
    this.sequelize = new Sequelize(
      config.database,
      config.username,
      config.password,
      {
        host: config.host,
        port: config.port,
        dialect: config.dialect,
        logging: config.logging,
        pool: {
          max: 10,
          min: 2,
          acquire: 30000,
          idle: 10000,
        },
        define: {
          timestamps: false,
          underscored: true,
        },
      }
    );

    DatabasePool._instance = this;
  }

  /**
   * @async
   * @description Teste la connexion à la base de données.
   * @returns {Promise<void>}
   * @throws {Error} Si la connexion échoue.
   */
  async testConnection() {
    try {
      await this.sequelize.authenticate();
      console.log('[OK] Connexion à PostgreSQL établie avec succès.');
    } catch (error) {
      console.error('[ERREUR] Impossible de se connecter à PostgreSQL :', error.message);
      throw error;
    }
  }

  /**
   * @description Retourne l'instance Sequelize.
   * @returns {Sequelize} Instance Sequelize.
   */
  getSequelize() {
    return this.sequelize;
  }
}

/** @type {DatabasePool} Instance unique du pool de connexions */
const databasePool = new DatabasePool();

// Export pour sequelize-cli (migrations)
module.exports = dbConfig;
// Export de l'instance singleton pour l'application
module.exports.databasePool = databasePool;
module.exports.sequelize = databasePool.getSequelize();
