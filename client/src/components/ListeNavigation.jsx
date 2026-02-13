/**
 * @fileoverview Sidebar de navigation avec filtres par statut et listes thématiques.
 * Permet de filtrer les tâches par statut (Toutes, À faire, En cours, Terminées)
 * et par liste thématique. Inclut la gestion des listes (création, suppression).
 * @module components/ListeNavigation
 */

import React, { useState } from 'react';
import taskService from '../services/taskService';

/**
 * @constant {Array} FILTRES_STATUT
 * @description Options de filtrage par statut.
 */
/**
 * @function IconeToutes
 * @description Icône SVG pour le filtre "Toutes les tâches".
 */
const IconeToutes = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

/**
 * @function IconeAFaire
 * @description Icône SVG pour le filtre "À faire".
 */
const IconeAFaire = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

/**
 * @function IconeEnCours
 * @description Icône SVG pour le filtre "En cours".
 */
const IconeEnCours = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

/**
 * @function IconeTerminee
 * @description Icône SVG pour le filtre "Terminées".
 */
const IconeTerminee = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const FILTRES_STATUT = [
  { valeur: null, label: 'Toutes', icone: IconeToutes },
  { valeur: 'A_FAIRE', label: 'À faire', icone: IconeAFaire },
  { valeur: 'EN_COURS', label: 'En cours', icone: IconeEnCours },
  { valeur: 'TERMINEE', label: 'Terminées', icone: IconeTerminee },
];

/**
 * @constant {Array} COULEURS_DISPONIBLES
 * @description Couleurs disponibles pour les listes thématiques.
 */
const COULEURS_DISPONIBLES = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
];

/**
 * @function ListeNavigation
 * @description Sidebar avec filtres par statut et gestion des listes thématiques.
 * @param {Object} props - Props du composant.
 * @param {Array} props.listes - Listes thématiques de l'utilisateur.
 * @param {string|null} props.filtreStatut - Filtre par statut actif.
 * @param {string|null} props.filtreListe - Filtre par liste actif.
 * @param {Function} props.onFiltreStatut - Callback pour changer le filtre statut.
 * @param {Function} props.onFiltreListe - Callback pour changer le filtre liste.
 * @param {Function} props.onRechargerListes - Callback pour recharger les listes.
 * @returns {JSX.Element} Le composant ListeNavigation.
 */
function ListeNavigation({ listes, filtreStatut, filtreListe, onFiltreStatut, onFiltreListe, onRechargerListes }) {
  /** @type {boolean} Affichage du formulaire de création de liste */
  const [afficherFormulaire, setAfficherFormulaire] = useState(false);

  /** @type {string} Nom de la nouvelle liste */
  const [nomNouvelleListe, setNomNouvelleListe] = useState('');

  /** @type {string} Couleur sélectionnée pour la nouvelle liste */
  const [couleurNouvelleListe, setCouleurNouvelleListe] = useState('#3B82F6');

  /** @type {boolean} Chargement en cours */
  const [chargement, setChargement] = useState(false);

  /**
   * @function creerListe
   * @description Crée une nouvelle liste thématique.
   * @param {React.FormEvent} e - Événement de soumission.
   */
  const creerListe = async (e) => {
    e.preventDefault();
    if (!nomNouvelleListe.trim()) return;

    setChargement(true);
    try {
      await taskService.creerListe({
        nom: nomNouvelleListe.trim(),
        couleur: couleurNouvelleListe,
      });
      setNomNouvelleListe('');
      setCouleurNouvelleListe('#3B82F6');
      setAfficherFormulaire(false);
      await onRechargerListes();
    } catch (err) {
      console.error('Erreur lors de la création de la liste :', err);
    } finally {
      setChargement(false);
    }
  };

  /**
   * @function supprimerListe
   * @description Supprime une liste après confirmation.
   * @param {string} listeId - UUID de la liste.
   */
  const supprimerListe = async (listeId) => {
    if (!window.confirm('Supprimer cette liste ? Les tâches associées seront conservées.')) return;
    try {
      await taskService.supprimerListe(listeId);
      if (filtreListe === listeId) {
        onFiltreListe(null);
      }
      await onRechargerListes();
    } catch (err) {
      console.error('Erreur lors de la suppression de la liste :', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtres par statut */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Filtrer par statut
        </h3>
        <nav className="space-y-1">
          {FILTRES_STATUT.map((filtre) => (
            <button
              key={filtre.label}
              onClick={() => { onFiltreStatut(filtre.valeur); onFiltreListe(null); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtreStatut === filtre.valeur && !filtreListe
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <filtre.icone />
              {filtre.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Listes thématiques */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Mes listes
          </h3>
          <button
            onClick={() => setAfficherFormulaire(!afficherFormulaire)}
            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Ajouter une liste"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Formulaire de création de liste */}
        {afficherFormulaire && (
          <form onSubmit={creerListe} className="mb-3 p-3 bg-gray-50 rounded-lg space-y-2">
            <input
              type="text"
              value={nomNouvelleListe}
              onChange={(e) => setNomNouvelleListe(e.target.value)}
              placeholder="Nom de la liste"
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              maxLength={100}
              required
            />
            <div className="flex flex-wrap gap-1.5">
              {COULEURS_DISPONIBLES.map((couleur) => (
                <button
                  key={couleur}
                  type="button"
                  onClick={() => setCouleurNouvelleListe(couleur)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    couleurNouvelleListe === couleur ? 'border-gray-800 scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: couleur }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={chargement}
                className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                {chargement ? '...' : 'Créer'}
              </button>
              <button
                type="button"
                onClick={() => setAfficherFormulaire(false)}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        )}

        {/* Liste des listes thématiques */}
        <nav className="space-y-1">
          {listes.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-2">Aucune liste créée</p>
          ) : (
            listes.map((liste) => (
              <div
                key={liste.id}
                className={`flex items-center justify-between group rounded-lg transition-colors ${
                  filtreListe === liste.id
                    ? 'bg-blue-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <button
                  onClick={() => { onFiltreListe(liste.id); onFiltreStatut(null); }}
                  className={`flex-1 flex items-center gap-2.5 px-3 py-2 text-sm font-medium ${
                    filtreListe === liste.id ? 'text-blue-700' : 'text-gray-600'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: liste.couleur }}
                  />
                  <span className="truncate">{liste.nom}</span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {liste.nombre_taches || 0}
                  </span>
                </button>
                <button
                  onClick={() => supprimerListe(liste.id)}
                  className="p-1 mr-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  title="Supprimer la liste"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </nav>
      </div>
    </div>
  );
}

export default ListeNavigation;
