/**
 * @fileoverview Composant de connexion et d'inscription.
 * Affiche un formulaire avec deux modes : Connexion et Inscription (toggle).
 * Gère la validation côté client et l'affichage des erreurs.
 * @module components/EcranConnexion
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * @function EcranConnexion
 * @description Page de connexion/inscription avec toggle entre les deux modes.
 * Après succès de connexion : stockage JWT dans AuthContext et redirection vers dashboard.
 * Après succès d'inscription : bascule automatique vers le mode connexion.
 * @returns {JSX.Element} Le composant EcranConnexion.
 */
function EcranConnexion() {
  /** @type {boolean} Mode inscription (true) ou connexion (false) */
  const [modeInscription, setModeInscription] = useState(false);

  /** @type {string} Email saisi */
  const [email, setEmail] = useState('');

  /** @type {string} Mot de passe saisi */
  const [motDePasse, setMotDePasse] = useState('');

  /** @type {string} Nom d'affichage (inscription uniquement) */
  const [nomAffichage, setNomAffichage] = useState('');

  /** @type {string|null} Message de succès */
  const [messageSucces, setMessageSucces] = useState(null);

  /** @type {string|null} Erreur de validation locale */
  const [erreurLocale, setErreurLocale] = useState(null);

  const { connexion, inscription, chargement, erreur, effacerErreur } = useAuth();

  /**
   * @function validerFormulaire
   * @description Valide les champs du formulaire côté client.
   * @returns {boolean} true si le formulaire est valide.
   */
  const validerFormulaire = () => {
    setErreurLocale(null);

    if (!email || !email.includes('@')) {
      setErreurLocale('Veuillez saisir un email valide.');
      return false;
    }

    if (!motDePasse || motDePasse.length < 6) {
      setErreurLocale('Le mot de passe doit contenir au moins 6 caractères.');
      return false;
    }

    if (modeInscription && (!nomAffichage || nomAffichage.trim().length === 0)) {
      setErreurLocale('Le nom d\'affichage est requis.');
      return false;
    }

    return true;
  };

  /**
   * @function gererSoumission
   * @description Gère la soumission du formulaire (connexion ou inscription).
   * @param {React.FormEvent} e - Événement de soumission.
   */
  const gererSoumission = async (e) => {
    e.preventDefault();
    effacerErreur();
    setMessageSucces(null);

    if (!validerFormulaire()) return;

    if (modeInscription) {
      const succes = await inscription(email, motDePasse, nomAffichage.trim());
      if (succes) {
        setMessageSucces('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        setModeInscription(false);
        setNomAffichage('');
        setMotDePasse('');
      }
    } else {
      await connexion(email, motDePasse);
    }
  };

  /**
   * @function basculerMode
   * @description Bascule entre le mode connexion et inscription.
   */
  const basculerMode = () => {
    setModeInscription(!modeInscription);
    effacerErreur();
    setErreurLocale(null);
    setMessageSucces(null);
    setMotDePasse('');
    setNomAffichage('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Gestionnaire de Tâches</h1>
          <p className="text-gray-500 mt-2">Organisez vos tâches efficacement</p>
        </div>

        {/* Carte du formulaire */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {modeInscription ? 'Créer un compte' : 'Se connecter'}
          </h2>

          {/* Messages d'erreur et de succès */}
          {(erreur || erreurLocale) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {erreurLocale || erreur}
            </div>
          )}

          {messageSucces && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {messageSucces}
            </div>
          )}

          <form onSubmit={gererSoumission} className="space-y-4">
            {/* Champ nom d'affichage (inscription uniquement) */}
            {modeInscription && (
              <div>
                <label htmlFor="nomAffichage" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom d'affichage
                </label>
                <input
                  id="nomAffichage"
                  type="text"
                  value={nomAffichage}
                  onChange={(e) => setNomAffichage(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="Votre nom"
                  maxLength={100}
                />
              </div>
            )}

            {/* Champ email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="vous@exemple.com"
                required
              />
            </div>

            {/* Champ mot de passe */}
            <div>
              <label htmlFor="motDePasse" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                id="motDePasse"
                type="password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="Minimum 6 caractères"
                minLength={6}
                required
              />
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={chargement}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              {chargement
                ? 'Chargement...'
                : modeInscription
                  ? 'S\'inscrire'
                  : 'Se connecter'
              }
            </button>
          </form>

          {/* Toggle connexion/inscription */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {modeInscription ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}
              <button
                onClick={basculerMode}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                {modeInscription ? 'Se connecter' : 'S\'inscrire'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EcranConnexion;
