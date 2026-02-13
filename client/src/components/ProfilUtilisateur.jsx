/**
 * @fileoverview Composant modal de gestion du profil utilisateur.
 * Permet de modifier le nom d'affichage et de changer le mot de passe.
 * @module components/ProfilUtilisateur
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

/**
 * @function ProfilUtilisateur
 * @description Modal de gestion du profil utilisateur.
 * Deux sections : modification du nom d'affichage et changement de mot de passe.
 * @param {Object} props - Props du composant.
 * @param {Function} props.onFermer - Callback appelé à la fermeture du modal.
 * @returns {JSX.Element} Le composant ProfilUtilisateur.
 */
function ProfilUtilisateur({ onFermer }) {
  const { utilisateur, mettreAJourUtilisateur } = useAuth();

  /** @type {string} Nom d'affichage modifiable */
  const [nomAffichage, setNomAffichage] = useState(utilisateur?.nom_affichage || '');

  /** @type {string} Ancien mot de passe */
  const [ancienMotDePasse, setAncienMotDePasse] = useState('');

  /** @type {string} Nouveau mot de passe */
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');

  /** @type {boolean} Chargement en cours pour le profil */
  const [chargementProfil, setChargementProfil] = useState(false);

  /** @type {boolean} Chargement en cours pour le mot de passe */
  const [chargementMdp, setChargementMdp] = useState(false);

  /** @type {string|null} Message de succès */
  const [messageSucces, setMessageSucces] = useState(null);

  /** @type {string|null} Message d'erreur */
  const [erreur, setErreur] = useState(null);

  /**
   * @function gererModificationProfil
   * @description Met à jour le nom d'affichage de l'utilisateur.
   * @param {React.FormEvent} e - Événement de soumission.
   */
  const gererModificationProfil = async (e) => {
    e.preventDefault();
    setErreur(null);
    setMessageSucces(null);

    if (!nomAffichage.trim()) {
      setErreur('Le nom d\'affichage est requis.');
      return;
    }

    setChargementProfil(true);
    try {
      const response = await authService.updateProfil(nomAffichage.trim());
      mettreAJourUtilisateur(response.data.utilisateur);
      setMessageSucces('Profil mis à jour avec succès.');
    } catch (err) {
      const message = err.response?.data?.error || 'Erreur lors de la mise à jour du profil.';
      setErreur(message);
    } finally {
      setChargementProfil(false);
    }
  };

  /**
   * @function gererChangementMotDePasse
   * @description Change le mot de passe de l'utilisateur.
   * @param {React.FormEvent} e - Événement de soumission.
   */
  const gererChangementMotDePasse = async (e) => {
    e.preventDefault();
    setErreur(null);
    setMessageSucces(null);

    if (!ancienMotDePasse) {
      setErreur('L\'ancien mot de passe est requis.');
      return;
    }

    if (!nouveauMotDePasse || nouveauMotDePasse.length < 6) {
      setErreur('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setChargementMdp(true);
    try {
      await authService.changePassword(ancienMotDePasse, nouveauMotDePasse);
      setMessageSucces('Mot de passe modifié avec succès.');
      setAncienMotDePasse('');
      setNouveauMotDePasse('');
    } catch (err) {
      const message = err.response?.data?.error || 'Erreur lors du changement de mot de passe.';
      setErreur(message);
    } finally {
      setChargementMdp(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Mon profil</h2>
          <button
            onClick={onFermer}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Messages */}
          {erreur && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {erreur}
            </div>
          )}
          {messageSucces && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {messageSucces}
            </div>
          )}

          {/* Informations du compte */}
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-sm font-medium text-gray-900">{utilisateur?.email}</p>
          </div>

          {/* Modification du nom d'affichage */}
          <form onSubmit={gererModificationProfil} className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Nom d'affichage</h3>
            <input
              type="text"
              value={nomAffichage}
              onChange={(e) => setNomAffichage(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
              placeholder="Votre nom d'affichage"
              maxLength={100}
              required
            />
            <button
              type="submit"
              disabled={chargementProfil}
              className="w-full py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors"
            >
              {chargementProfil ? 'Enregistrement...' : 'Mettre à jour le nom'}
            </button>
          </form>

          {/* Séparateur */}
          <hr className="border-gray-200" />

          {/* Changement de mot de passe */}
          <form onSubmit={gererChangementMotDePasse} className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Changer le mot de passe</h3>
            <input
              type="password"
              value={ancienMotDePasse}
              onChange={(e) => setAncienMotDePasse(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
              placeholder="Ancien mot de passe"
              required
            />
            <input
              type="password"
              value={nouveauMotDePasse}
              onChange={(e) => setNouveauMotDePasse(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
              placeholder="Nouveau mot de passe (min. 6 caractères)"
              minLength={6}
              required
            />
            <button
              type="submit"
              disabled={chargementMdp}
              className="w-full py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 disabled:bg-gray-500 rounded-lg transition-colors"
            >
              {chargementMdp ? 'Modification...' : 'Changer le mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfilUtilisateur;
