/**
 * @fileoverview Singleton AppConfig - Configuration centralisée de l'application.
 * Pattern Singleton : une seule instance de configuration partagée dans toute l'application.
 * @module config/appConfig
 */

/**
 * @class AppConfig
 * @description Singleton contenant toutes les variables de configuration de l'application.
 * Charge les variables d'environnement et fournit des valeurs par défaut.
 */
class AppConfig {
  /**
   * @constructor
   * @description Initialise la configuration à partir des variables d'environnement.
   */
  constructor() {
    if (AppConfig._instance) {
      return AppConfig._instance;
    }

    /** @type {number} Port du serveur Express */
    this.port = parseInt(process.env.PORT, 10) || 3001;

    /** @type {string} Secret pour la signature des tokens JWT */
    this.jwtSecret = process.env.JWT_SECRET || 'change_me_with_a_strong_random_string_of_at_least_32_chars';

    /** @type {string} Durée de validité des tokens JWT */
    this.jwtExpiration = '24h';

    /** @type {number} Nombre de salt rounds pour bcrypt */
    this.bcryptSaltRounds = 10;

    /** @type {number} Nombre maximum de tentatives de connexion avant verrouillage */
    this.maxLoginAttempts = 3;

    /** @type {string} URL du client autorisé pour CORS */
    this.clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

    /** @type {Object} Configuration de la base de données */
    this.database = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      name: process.env.DB_NAME || 'gestionnaire_taches',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    };

    /** @type {number} Limite par défaut pour la pagination */
    this.defaultPageLimit = 20;

    /** @type {number} Page par défaut pour la pagination */
    this.defaultPage = 1;

    AppConfig._instance = this;
  }
}

/** @type {AppConfig} Instance unique de la configuration */
const appConfig = new AppConfig();

module.exports = appConfig;
