/**
 * @fileoverview Formulaire de création et d'édition de tâche (modal).
 * Supporte deux modes : création (tache = null) et édition (tache fournie).
 * Valide les champs côté client avant soumission.
 * @module components/FormulaireTache
 */

import React, { useState } from 'react';
import taskService from '../services/taskService';

/**
 * @function FormulaireTache
 * @description Modal/formulaire pour créer ou éditer une tâche.
 * @param {Object} props - Props du composant.
 * @param {Object|null} props.tache - Tâche à éditer (null pour création).
 * @param {Array} props.listes - Liste des listes thématiques disponibles.
 * @param {Function} props.onFermer - Callback appelé à la fermeture du formulaire.
 * @returns {JSX.Element} Le composant FormulaireTache.
 */
function FormulaireTache({ tache, listes, onFermer }) {
  /** @type {boolean} Mode édition si une tâche est fournie */
  const modeEdition = !!tache;

  /** @type {string} Titre de la tâche */
  const [titre, setTitre] = useState(tache?.titre || '');

  /** @type {string} Description de la tâche */
  const [description, setDescription] = useState(tache?.description || '');

  /** @type {string} Priorité sélectionnée */
  const [priorite, setPriorite] = useState(tache?.priorite || 'MOYENNE');

  /** @type {string} Date d'échéance */
  const [dateEcheance, setDateEcheance] = useState(tache?.date_echeance || '');

  /** @type {string} ID de la liste sélectionnée */
  const [listeId, setListeId] = useState(tache?.liste_id || '');

  /** @type {boolean} Chargement en cours */
  const [chargement, setChargement] = useState(false);

  /** @type {string|null} Message d'erreur */
  const [erreur, setErreur] = useState(null);

  /**
   * @function validerFormulaire
   * @description Valide les champs du formulaire côté client.
   * @returns {boolean} true si le formulaire est valide.
   */
  const validerFormulaire = () => {
    if (!titre.trim() || titre.trim().length < 3 || titre.trim().length > 100) {
      setErreur('Le titre doit contenir entre 3 et 100 caractères.');
      return false;
    }
    if (description && description.length > 2000) {
      setErreur('La description ne peut pas dépasser 2000 caractères.');
      return false;
    }
    return true;
  };

  /**
   * @function gererSoumission
   * @description Gère la soumission du formulaire (création ou édition).
   * @param {React.FormEvent} e - Événement de soumission.
   */
  const gererSoumission = async (e) => {
    e.preventDefault();
    setErreur(null);

    if (!validerFormulaire()) return;

    setChargement(true);
    try {
      /** @type {Object} Données à envoyer à l'API */
      const donnees = {
        titre: titre.trim(),
        description: description.trim() || null,
        priorite,
        date_echeance: dateEcheance || null,
        liste_id: listeId || null,
      };

      if (modeEdition) {
        await taskService.modifierTache(tache.id, donnees);
      } else {
        await taskService.creerTache(donnees);
      }

      onFermer();
    } catch (err) {
      const message = err.response?.data?.error || 'Erreur lors de l\'enregistrement.';
      setErreur(message);
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* En-tête du modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {modeEdition ? 'Modifier la tâche' : 'Nouvelle tâche'}
          </h2>
          <button
            onClick={onFermer}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Corps du formulaire */}
        <form onSubmit={gererSoumission} className="p-6 space-y-4">
          {/* Message d'erreur */}
          {erreur && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {erreur}
            </div>
          )}

          {/* Titre (obligatoire, 3-100 caractères) */}
          <div>
            <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-1">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              id="titre"
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
              placeholder="Titre de la tâche (3-100 caractères)"
              minLength={3}
              maxLength={100}
              required
            />
            <p className="text-xs text-gray-400 mt-1">{titre.length}/100 caractères</p>
          </div>

          {/* Description (optionnelle, max 2000 caractères) */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm resize-none"
              placeholder="Description détaillée (optionnelle)"
              rows={3}
              maxLength={2000}
            />
            <p className="text-xs text-gray-400 mt-1">{description.length}/2000 caractères</p>
          </div>

          {/* Priorité (select) */}
          <div>
            <label htmlFor="priorite" className="block text-sm font-medium text-gray-700 mb-1">
              Priorité
            </label>
            <select
              id="priorite"
              value={priorite}
              onChange={(e) => setPriorite(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm bg-white"
            >
              <option value="BASSE">Basse</option>
              <option value="MOYENNE">Moyenne</option>
              <option value="HAUTE">Haute</option>
              <option value="URGENTE">Urgente</option>
            </select>
          </div>

          {/* Date d'échéance (date picker) */}
          <div>
            <label htmlFor="dateEcheance" className="block text-sm font-medium text-gray-700 mb-1">
              Date d'échéance
            </label>
            <input
              id="dateEcheance"
              type="date"
              value={dateEcheance}
              onChange={(e) => setDateEcheance(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
            />
          </div>

          {/* Liste (select optionnel) */}
          <div>
            <label htmlFor="listeId" className="block text-sm font-medium text-gray-700 mb-1">
              Liste
            </label>
            <select
              id="listeId"
              value={listeId}
              onChange={(e) => setListeId(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm bg-white"
            >
              <option value="">Aucune liste</option>
              {listes.map((liste) => (
                <option key={liste.id} value={liste.id}>
                  {liste.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onFermer}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={chargement}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors shadow-sm"
            >
              {chargement
                ? 'Enregistrement...'
                : modeEdition
                  ? 'Modifier'
                  : 'Créer'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormulaireTache;
