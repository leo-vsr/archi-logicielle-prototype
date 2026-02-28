/**
 * @fileoverview Service d'appels API pour les tâches et les listes.
 * Encapsule les requêtes HTTP vers les endpoints de tâches, listes et recherche.
 * @module services/taskService
 */

import axios from 'axios';

/** @type {string} URL de base de l'API */
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * @description Instance Axios configurée avec intercepteur pour le token JWT.
 */
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * @description Intercepteur de requête pour ajouter le token JWT automatiquement.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * @description Intercepteur de réponse : déconnexion automatique si le token est invalide ou expiré (401).
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('utilisateur');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

/**
 * @namespace taskService
 * @description Service gérant les appels API des tâches et des listes.
 */
const taskService = {
  // ==================== TÂCHES ====================

  /**
   * @async
   * @description Crée une nouvelle tâche.
   * @param {Object} donnees - Données de la tâche.
   * @param {string} donnees.titre - Titre (3-100 caractères).
   * @param {string} [donnees.description] - Description (max 2000).
   * @param {string} [donnees.priorite] - BASSE, MOYENNE, HAUTE, URGENTE.
   * @param {string} [donnees.date_echeance] - Date au format YYYY-MM-DD.
   * @param {string} [donnees.liste_id] - UUID de la liste.
   * @returns {Promise<Object>} Réponse API avec la tâche créée.
   */
  creerTache: async (donnees) => {
    const response = await api.post('/taches', donnees);
    return response.data;
  },

  /**
   * @async
   * @description Liste les tâches avec pagination et filtres.
   * @param {Object} [params] - Paramètres de requête.
   * @param {number} [params.page=1] - Numéro de page.
   * @param {number} [params.limit=20] - Nombre par page.
   * @param {string} [params.statut] - Filtre par statut.
   * @param {string} [params.priorite] - Filtre par priorité.
   * @param {string} [params.liste_id] - Filtre par liste.
   * @returns {Promise<Object>} Réponse API avec tâches, compteurs et pagination.
   */
  listerTaches: async (params = {}) => {
    const response = await api.get('/taches', { params });
    return response.data;
  },

  /**
   * @async
   * @description Récupère le détail d'une tâche.
   * @param {string} id - UUID de la tâche.
   * @returns {Promise<Object>} Réponse API avec la tâche.
   */
  detailTache: async (id) => {
    const response = await api.get(`/taches/${id}`);
    return response.data;
  },

  /**
   * @async
   * @description Modifie partiellement une tâche.
   * @param {string} id - UUID de la tâche.
   * @param {Object} donnees - Données à modifier.
   * @returns {Promise<Object>} Réponse API avec la tâche mise à jour.
   */
  modifierTache: async (id, donnees) => {
    const response = await api.patch(`/taches/${id}`, donnees);
    return response.data;
  },

  /**
   * @async
   * @description Supprime une tâche.
   * @param {string} id - UUID de la tâche.
   * @returns {Promise<Object>} Réponse API avec message de confirmation.
   */
  supprimerTache: async (id) => {
    const response = await api.delete(`/taches/${id}`);
    return response.data;
  },

  /**
   * @async
   * @description Recherche des tâches par mot-clé.
   * @param {string} query - Terme de recherche.
   * @returns {Promise<Object>} Réponse API avec les tâches trouvées.
   */
  rechercher: async (query) => {
    const response = await api.get('/search', { params: { q: query } });
    return response.data;
  },

  // ==================== LISTES ====================

  /**
   * @async
   * @description Crée une nouvelle liste thématique.
   * @param {Object} donnees - Données de la liste.
   * @param {string} donnees.nom - Nom de la liste.
   * @param {string} [donnees.couleur] - Couleur hexadécimale.
   * @param {number} [donnees.ordre] - Ordre d'affichage.
   * @returns {Promise<Object>} Réponse API avec la liste créée.
   */
  creerListe: async (donnees) => {
    const response = await api.post('/listes', donnees);
    return response.data;
  },

  /**
   * @async
   * @description Liste toutes les listes de l'utilisateur avec compteurs.
   * @returns {Promise<Object>} Réponse API avec les listes.
   */
  listerListes: async () => {
    const response = await api.get('/listes');
    return response.data;
  },

  /**
   * @async
   * @description Modifie une liste existante.
   * @param {string} id - UUID de la liste.
   * @param {Object} donnees - Données à modifier (nom, couleur, ordre).
   * @returns {Promise<Object>} Réponse API avec la liste mise à jour.
   */
  modifierListe: async (id, donnees) => {
    const response = await api.patch(`/listes/${id}`, donnees);
    return response.data;
  },

  /**
   * @async
   * @description Supprime une liste.
   * @param {string} id - UUID de la liste.
   * @returns {Promise<Object>} Réponse API avec message de confirmation.
   */
  supprimerListe: async (id) => {
    const response = await api.delete(`/listes/${id}`);
    return response.data;
  },
};

export default taskService;
