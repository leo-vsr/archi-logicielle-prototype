/**
 * @fileoverview Dashboard principal avec liste des tâches.
 * Affiche le header, les compteurs, la sidebar de filtres, la liste des tâches
 * avec pagination, et permet la gestion complète des tâches.
 * @module components/EcranTaches
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import taskService from '../services/taskService';
import FormulaireTache from './FormulaireTache';
import ListeNavigation from './ListeNavigation';
import ProfilUtilisateur from './ProfilUtilisateur';

/**
 * @constant {Object} LABELS_STATUT
 * @description Labels d'affichage pour chaque statut de tâche.
 */
const LABELS_STATUT = {
  A_FAIRE: 'À faire',
  EN_COURS: 'En cours',
  TERMINEE: 'Terminée',
};

/**
 * @constant {Object} COULEURS_PRIORITE
 * @description Classes CSS pour les badges de priorité.
 */
const COULEURS_PRIORITE = {
  BASSE: 'bg-green-100 text-green-800',
  MOYENNE: 'bg-blue-100 text-blue-800',
  HAUTE: 'bg-orange-100 text-orange-800',
  URGENTE: 'bg-red-100 text-red-800',
};

/**
 * @constant {Object} ICONES_STATUT
 * @description Classes CSS pour les icônes de statut.
 */
const COULEURS_STATUT = {
  A_FAIRE: 'bg-gray-100 text-gray-600',
  EN_COURS: 'bg-yellow-100 text-yellow-700',
  TERMINEE: 'bg-green-100 text-green-700',
};

/**
 * @function EcranTaches
 * @description Composant principal du dashboard de gestion des tâches.
 * @returns {JSX.Element} Le composant EcranTaches.
 */
function EcranTaches() {
  const { utilisateur, deconnexion } = useAuth();

  /** @type {Array} Liste des tâches affichées */
  const [taches, setTaches] = useState([]);

  /** @type {Object} Compteurs par statut */
  const [compteurs, setCompteurs] = useState({ total: 0, A_FAIRE: 0, EN_COURS: 0, TERMINEE: 0 });

  /** @type {Object} Informations de pagination */
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  /** @type {Array} Liste des listes thématiques */
  const [listes, setListes] = useState([]);

  /** @type {string|null} Filtre par statut actif */
  const [filtreStatut, setFiltreStatut] = useState(null);

  /** @type {string|null} Filtre par liste active */
  const [filtreListe, setFiltreListe] = useState(null);

  /** @type {string} Terme de recherche */
  const [recherche, setRecherche] = useState('');

  /** @type {boolean} Affichage du formulaire de tâche */
  const [afficherFormulaire, setAfficherFormulaire] = useState(false);

  /** @type {Object|null} Tâche en cours d'édition */
  const [tacheEdition, setTacheEdition] = useState(null);

  /** @type {boolean} Affichage du profil */
  const [afficherProfil, setAfficherProfil] = useState(false);

  /** @type {boolean} Chargement en cours */
  const [chargement, setChargement] = useState(false);

  /** @type {string|null} Message d'erreur */
  const [erreur, setErreur] = useState(null);

  /**
   * @function chargerTaches
   * @description Charge les tâches depuis l'API avec les filtres actifs.
   * @param {number} [page=1] - Numéro de page.
   */
  const chargerTaches = useCallback(async (page = 1) => {
    setChargement(true);
    setErreur(null);
    try {
      const params = { page, limit: 20 };
      if (filtreStatut) params.statut = filtreStatut;
      if (filtreListe) params.liste_id = filtreListe;

      const response = await taskService.listerTaches(params);
      setTaches(response.data.taches);
      setCompteurs(response.data.compteurs);
      setPagination(response.data.pagination);
    } catch (err) {
      setErreur('Erreur lors du chargement des tâches.');
      console.error(err);
    } finally {
      setChargement(false);
    }
  }, [filtreStatut, filtreListe]);

  /**
   * @function chargerListes
   * @description Charge les listes thématiques depuis l'API.
   */
  const chargerListes = useCallback(async () => {
    try {
      const response = await taskService.listerListes();
      setListes(response.data.listes);
    } catch (err) {
      console.error('Erreur lors du chargement des listes :', err);
    }
  }, []);

  /** Charger les données au montage et quand les filtres changent */
  useEffect(() => {
    chargerTaches(1);
  }, [chargerTaches]);

  useEffect(() => {
    chargerListes();
  }, [chargerListes]);

  /**
   * @function gererRecherche
   * @description Lance une recherche par mot-clé.
   */
  const gererRecherche = async () => {
    if (!recherche.trim()) {
      chargerTaches(1);
      return;
    }
    setChargement(true);
    try {
      const response = await taskService.rechercher(recherche.trim());
      setTaches(response.data.taches);
      setCompteurs({ total: response.data.taches.length, A_FAIRE: 0, EN_COURS: 0, TERMINEE: 0 });
      setPagination({ page: 1, limit: 20, total: response.data.taches.length, totalPages: 1 });
    } catch (err) {
      setErreur('Erreur lors de la recherche.');
    } finally {
      setChargement(false);
    }
  };

  /**
   * @function changerStatutTache
   * @description Change le statut d'une tâche directement depuis la liste.
   * @param {string} tacheId - UUID de la tâche.
   * @param {string} nouveauStatut - Nouveau statut.
   */
  const changerStatutTache = async (tacheId, nouveauStatut) => {
    try {
      await taskService.modifierTache(tacheId, { statut: nouveauStatut });
      await chargerTaches(pagination.page);
    } catch (err) {
      setErreur('Erreur lors du changement de statut.');
    }
  };

  /**
   * @function supprimerTache
   * @description Supprime une tâche après confirmation.
   * @param {string} tacheId - UUID de la tâche.
   */
  const supprimerTache = async (tacheId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;
    try {
      await taskService.supprimerTache(tacheId);
      await chargerTaches(pagination.page);
      await chargerListes();
    } catch (err) {
      setErreur('Erreur lors de la suppression.');
    }
  };

  /**
   * @function ouvrirEdition
   * @description Ouvre le formulaire en mode édition pour une tâche.
   * @param {Object} tache - Tâche à éditer.
   */
  const ouvrirEdition = (tache) => {
    setTacheEdition(tache);
    setAfficherFormulaire(true);
  };

  /**
   * @function fermerFormulaire
   * @description Ferme le formulaire et recharge les données.
   */
  const fermerFormulaire = async () => {
    setAfficherFormulaire(false);
    setTacheEdition(null);
    await chargerTaches(pagination.page);
    await chargerListes();
  };

  /**
   * @function formaterDate
   * @description Formate une date pour l'affichage.
   * @param {string} date - Date au format ISO.
   * @returns {string} Date formatée.
   */
  const formaterDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h1 className="text-lg font-bold text-gray-900">Gestionnaire de Tâches</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setAfficherProfil(true)}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                {utilisateur?.nom_affichage}
              </button>
              <button
                onClick={deconnexion}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Compteurs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900">{compteurs.total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">À faire</p>
            <p className="text-2xl font-bold text-gray-600">{compteurs.A_FAIRE}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">En cours</p>
            <p className="text-2xl font-bold text-yellow-600">{compteurs.EN_COURS}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500">Terminées</p>
            <p className="text-2xl font-bold text-green-600">{compteurs.TERMINEE}</p>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <ListeNavigation
              listes={listes}
              filtreStatut={filtreStatut}
              filtreListe={filtreListe}
              onFiltreStatut={(s) => { setFiltreStatut(s); setRecherche(''); }}
              onFiltreListe={(l) => { setFiltreListe(l); setRecherche(''); }}
              onRechargerListes={chargerListes}
            />
          </div>

          {/* Zone principale */}
          <div className="flex-1 min-w-0">
            {/* Barre de recherche et actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && gererRecherche()}
                  placeholder="Rechercher une tâche..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
                <button
                  onClick={gererRecherche}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Filtrer
                </button>
              </div>
              <button
                onClick={() => { setTacheEdition(null); setAfficherFormulaire(true); }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
              >
                + Nouvelle tâche
              </button>
            </div>

            {/* Message d'erreur */}
            {erreur && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {erreur}
                <button onClick={() => setErreur(null)} className="ml-2 text-red-500 hover:text-red-700 font-bold">&times;</button>
              </div>
            )}

            {/* Tableau des tâches */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {chargement ? (
                <div className="p-8 text-center text-gray-500">Chargement...</div>
              ) : taches.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="font-medium">Aucune tâche trouvée</p>
                  <p className="text-sm mt-1">Créez votre première tâche pour commencer</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tâche</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Priorité</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Échéance</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">État</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {taches.map((tache) => (
                        <tr key={tache.id} className="hover:bg-gray-50 transition-colors">
                          {/* Icône de statut */}
                          <td className="px-4 py-3">
                            <select
                              value={tache.statut}
                              onChange={(e) => changerStatutTache(tache.id, e.target.value)}
                              className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
                            >
                              <option value="A_FAIRE">À faire</option>
                              <option value="EN_COURS">En cours</option>
                              <option value="TERMINEE">Terminée</option>
                            </select>
                          </td>

                          {/* Titre et description */}
                          <td className="px-4 py-3">
                            <div>
                              <p className={`text-sm font-medium ${tache.statut === 'TERMINEE' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                {tache.titre}
                              </p>
                              {tache.description && (
                                <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">
                                  {tache.description}
                                </p>
                              )}
                              {tache.liste && (
                                <span
                                  className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full text-white"
                                  style={{ backgroundColor: tache.liste.couleur }}
                                >
                                  {tache.liste.nom}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Badge de priorité */}
                          <td className="px-4 py-3">
                            <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${COULEURS_PRIORITE[tache.priorite]}`}>
                              {tache.priorite}
                            </span>
                          </td>

                          {/* Date d'échéance */}
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-600">
                              {formaterDate(tache.date_echeance)}
                            </span>
                          </td>

                          {/* Badge d'état */}
                          <td className="px-4 py-3">
                            <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${COULEURS_STATUT[tache.statut]}`}>
                              {LABELS_STATUT[tache.statut]}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => ouvrirEdition(tache)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                title="Modifier"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => supprimerTache(tache.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Supprimer"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                  <p className="text-sm text-gray-600">
                    Page {pagination.page} sur {pagination.totalPages} ({pagination.total} résultats)
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => chargerTaches(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Précédent
                    </button>
                    <button
                      onClick={() => chargerTaches(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Formulaire Tâche */}
      {afficherFormulaire && (
        <FormulaireTache
          tache={tacheEdition}
          listes={listes}
          onFermer={fermerFormulaire}
        />
      )}

      {/* Modal Profil */}
      {afficherProfil && (
        <ProfilUtilisateur onFermer={() => setAfficherProfil(false)} />
      )}
    </div>
  );
}

export default EcranTaches;
