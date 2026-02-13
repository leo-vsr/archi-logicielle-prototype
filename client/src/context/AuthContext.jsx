/**
 * @fileoverview Context React pour la gestion de l'état d'authentification.
 * Stocke le token JWT et les informations utilisateur.
 * Fournit les fonctions de connexion, inscription et déconnexion.
 * @module context/AuthContext
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import authService from '../services/authService';

/**
 * @typedef {Object} AuthContextType
 * @property {Object|null} utilisateur - Informations de l'utilisateur connecté.
 * @property {string|null} token - Token JWT actif.
 * @property {boolean} estConnecte - Indique si l'utilisateur est connecté.
 * @property {boolean} chargement - Indique si une opération est en cours.
 * @property {string|null} erreur - Message d'erreur éventuel.
 * @property {Function} connexion - Fonction de connexion.
 * @property {Function} inscription - Fonction d'inscription.
 * @property {Function} deconnexion - Fonction de déconnexion.
 * @property {Function} effacerErreur - Efface le message d'erreur.
 * @property {Function} mettreAJourUtilisateur - Met à jour les infos utilisateur localement.
 */

/** @type {React.Context<AuthContextType>} */
const AuthContext = createContext(null);

/**
 * @function useAuth
 * @description Hook personnalisé pour accéder au contexte d'authentification.
 * @returns {AuthContextType} Le contexte d'authentification.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

/**
 * @function AuthProvider
 * @description Provider React qui encapsule l'état d'authentification.
 * Gère le stockage du token JWT et les opérations d'authentification.
 * @param {Object} props - Props du composant.
 * @param {React.ReactNode} props.children - Composants enfants.
 * @returns {JSX.Element} Le provider d'authentification.
 */
export const AuthProvider = ({ children }) => {
  /** Initialiser depuis le localStorage si un token existe */
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [utilisateur, setUtilisateur] = useState(() => {
    const stored = localStorage.getItem('utilisateur');
    return stored ? JSON.parse(stored) : null;
  });
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState(null);

  /**
   * @function connexion
   * @description Connecte un utilisateur avec email et mot de passe.
   * @param {string} email - Email de l'utilisateur.
   * @param {string} motDePasse - Mot de passe.
   * @returns {Promise<boolean>} true si la connexion a réussi.
   */
  const connexion = useCallback(async (email, motDePasse) => {
    setChargement(true);
    setErreur(null);
    try {
      const response = await authService.login(email, motDePasse);
      const { token: newToken, utilisateur: newUtilisateur } = response.data;

      /** Stocker le token et l'utilisateur */
      localStorage.setItem('token', newToken);
      localStorage.setItem('utilisateur', JSON.stringify(newUtilisateur));
      setToken(newToken);
      setUtilisateur(newUtilisateur);
      return true;
    } catch (err) {
      const message = err.response?.data?.error || 'Erreur lors de la connexion.';
      setErreur(message);
      return false;
    } finally {
      setChargement(false);
    }
  }, []);

  /**
   * @function inscription
   * @description Inscrit un nouvel utilisateur.
   * @param {string} email - Email.
   * @param {string} motDePasse - Mot de passe.
   * @param {string} nomAffichage - Nom d'affichage.
   * @returns {Promise<boolean>} true si l'inscription a réussi.
   */
  const inscription = useCallback(async (email, motDePasse, nomAffichage) => {
    setChargement(true);
    setErreur(null);
    try {
      await authService.register(email, motDePasse, nomAffichage);
      return true;
    } catch (err) {
      const message = err.response?.data?.error || 'Erreur lors de l\'inscription.';
      setErreur(message);
      return false;
    } finally {
      setChargement(false);
    }
  }, []);

  /**
   * @function deconnexion
   * @description Déconnecte l'utilisateur et nettoie le stockage.
   */
  const deconnexion = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur');
    setToken(null);
    setUtilisateur(null);
    setErreur(null);
  }, []);

  /**
   * @function effacerErreur
   * @description Efface le message d'erreur courant.
   */
  const effacerErreur = useCallback(() => {
    setErreur(null);
  }, []);

  /**
   * @function mettreAJourUtilisateur
   * @description Met à jour les informations utilisateur localement.
   * @param {Object} nouvelUtilisateur - Nouvelles données utilisateur.
   */
  const mettreAJourUtilisateur = useCallback((nouvelUtilisateur) => {
    setUtilisateur(nouvelUtilisateur);
    localStorage.setItem('utilisateur', JSON.stringify(nouvelUtilisateur));
  }, []);

  /** @type {AuthContextType} Valeur du contexte */
  const value = {
    utilisateur,
    token,
    estConnecte: !!token,
    chargement,
    erreur,
    connexion,
    inscription,
    deconnexion,
    effacerErreur,
    mettreAJourUtilisateur,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
