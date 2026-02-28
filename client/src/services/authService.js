/**
 * @fileoverview Service d'appels API pour l'authentification.
 * Encapsule les requêtes HTTP vers les endpoints d'authentification et de profil.
 * @module services/authService
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
 * @namespace authService
 * @description Service gérant les appels API d'authentification et de profil.
 */
const authService = {
  /**
   * @async
   * @description Inscrit un nouvel utilisateur.
   * @param {string} email - Email de l'utilisateur.
   * @param {string} motDePasse - Mot de passe.
   * @param {string} nomAffichage - Nom d'affichage.
   * @returns {Promise<Object>} Réponse API avec les données utilisateur.
   */
  register: async (email, motDePasse, nomAffichage) => {
    const response = await api.post('/auth/register', {
      email,
      mot_de_passe: motDePasse,
      nom_affichage: nomAffichage,
    });
    return response.data;
  },

  /**
   * @async
   * @description Connecte un utilisateur existant.
   * @param {string} email - Email de l'utilisateur.
   * @param {string} motDePasse - Mot de passe.
   * @returns {Promise<Object>} Réponse API avec token et données utilisateur.
   */
  login: async (email, motDePasse) => {
    const response = await api.post('/auth/login', {
      email,
      mot_de_passe: motDePasse,
    });
    return response.data;
  },

  /**
   * @async
   * @description Récupère les informations du profil de l'utilisateur connecté.
   * @returns {Promise<Object>} Réponse API avec les données du profil.
   */
  getProfil: async () => {
    const response = await api.get('/profil');
    return response.data;
  },

  /**
   * @async
   * @description Met à jour le nom d'affichage de l'utilisateur.
   * @param {string} nomAffichage - Nouveau nom d'affichage.
   * @returns {Promise<Object>} Réponse API avec les données mises à jour.
   */
  updateProfil: async (nomAffichage) => {
    const response = await api.patch('/profil', { nom_affichage: nomAffichage });
    return response.data;
  },

  /**
   * @async
   * @description Change le mot de passe de l'utilisateur.
   * @param {string} ancienMotDePasse - Ancien mot de passe.
   * @param {string} nouveauMotDePasse - Nouveau mot de passe.
   * @returns {Promise<Object>} Réponse API avec message de confirmation.
   */
  changePassword: async (ancienMotDePasse, nouveauMotDePasse) => {
    const response = await api.patch('/profil/password', {
      ancien_mot_de_passe: ancienMotDePasse,
      nouveau_mot_de_passe: nouveauMotDePasse,
    });
    return response.data;
  },
};

export default authService;
