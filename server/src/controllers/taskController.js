/**
 * @fileoverview Contrôleur des tâches et listes (ServiceTâches).
 * Gère les opérations CRUD sur les tâches et les listes thématiques.
 * Pattern MVC : Controller qui orchestre la logique métier des tâches.
 * @module controllers/taskController
 */

const { validationResult } = require('express-validator');
const tacheRepository = require('../repositories/tacheRepository');
const listeRepository = require('../repositories/listeRepository');
const appConfig = require('../config/appConfig');

/**
 * @class TaskController
 * @description Contrôleur gérant toutes les opérations sur les tâches et les listes.
 */
class TaskController {
  // ==================== TÂCHES ====================

  /**
   * @async
   * @description Crée une nouvelle tâche pour l'utilisateur connecté.
   * Le statut initial est toujours A_FAIRE, l'utilisateur_id est extrait du JWT.
   * @param {import('express').Request} req - Requête avec body {titre, description, priorite, date_echeance, liste_id}.
   * @param {import('express').Response} res - Réponse Express.
   * @returns {Promise<void>}
   */
  async creerTache(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
      }

      const { titre, description, priorite, date_echeance, liste_id } = req.body;

      /** Vérifier que la liste appartient à l'utilisateur si spécifiée */
      if (liste_id) {
        const liste = await listeRepository.trouverParId(liste_id);
        if (!liste || liste.utilisateur_id !== req.utilisateur.id) {
          return res.status(403).json({
            success: false,
            error: 'Liste non trouvée ou non autorisée.',
          });
        }
      }

      /** Création de la tâche via le repository */
      const tache = await tacheRepository.creer({
        titre,
        description: description || null,
        priorite: priorite || 'MOYENNE',
        date_echeance: date_echeance || null,
        liste_id: liste_id || null,
        statut: 'A_FAIRE',
        utilisateur_id: req.utilisateur.id,
      });

      /** Recharger avec les associations */
      const tacheComplete = await tacheRepository.trouverParId(tache.id);

      return res.status(201).json({
        success: true,
        data: { tache: tacheComplete },
      });
    } catch (error) {
      console.error('Erreur lors de la création de la tâche :', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur.',
      });
    }
  }

  /**
   * @async
   * @description Liste les tâches de l'utilisateur connecté avec pagination et filtres.
   * Supporte les query params : page, limit, statut, priorite, liste_id.
   * Tri par date_echeance ASC (nulls last), puis date_creation DESC.
   * @param {import('express').Request} req - Requête avec query params.
   * @param {import('express').Response} res - Réponse Express.
   * @returns {Promise<void>}
   */
  async listerTaches(req, res) {
    try {
      const page = parseInt(req.query.page, 10) || appConfig.defaultPage;
      const limit = parseInt(req.query.limit, 10) || appConfig.defaultPageLimit;
      const { statut, priorite, liste_id } = req.query;

      const { rows: taches, count: total } = await tacheRepository.listerParUtilisateur(
        req.utilisateur.id,
        { page, limit, statut, priorite, liste_id }
      );

      /** Récupérer les compteurs par statut */
      const compteurs = await tacheRepository.compterParStatut(req.utilisateur.id);

      return res.status(200).json({
        success: true,
        data: {
          taches,
          compteurs,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error('Erreur lors de la liste des tâches :', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur.',
      });
    }
  }

  /**
   * @async
   * @description Récupère le détail d'une tâche par son ID.
   * Vérifie que l'utilisateur est bien le propriétaire.
   * @param {import('express').Request} req - Requête avec params.id.
   * @param {import('express').Response} res - Réponse Express.
   * @returns {Promise<void>}
   */
  async detailTache(req, res) {
    try {
      const tache = await tacheRepository.trouverParId(req.params.id);

      if (!tache) {
        return res.status(404).json({
          success: false,
          error: 'Tâche non trouvée.',
        });
      }

      /** Vérification de propriété */
      if (tache.utilisateur_id !== req.utilisateur.id) {
        return res.status(403).json({
          success: false,
          error: 'Accès non autorisé à cette tâche.',
        });
      }

      return res.status(200).json({
        success: true,
        data: { tache },
      });
    } catch (error) {
      console.error('Erreur lors de la récupération de la tâche :', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur.',
      });
    }
  }

  /**
   * @async
   * @description Modifie partiellement une tâche.
   * Si le statut change, enregistre dans l'historique des modifications.
   * Si le nouveau statut est TERMINEE, définit date_completion = NOW().
   * @param {import('express').Request} req - Requête avec params.id et body partiel.
   * @param {import('express').Response} res - Réponse Express.
   * @returns {Promise<void>}
   */
  async modifierTache(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
      }

      const tache = await tacheRepository.trouverParId(req.params.id);

      if (!tache) {
        return res.status(404).json({
          success: false,
          error: 'Tâche non trouvée.',
        });
      }

      /** Vérification de propriété */
      if (tache.utilisateur_id !== req.utilisateur.id) {
        return res.status(403).json({
          success: false,
          error: 'Accès non autorisé à cette tâche.',
        });
      }

      const { titre, description, statut, priorite, date_echeance, liste_id } = req.body;

      /** @type {Object} Données à mettre à jour */
      const donneesMAJ = {};

      if (titre !== undefined) donneesMAJ.titre = titre;
      if (description !== undefined) donneesMAJ.description = description;
      if (priorite !== undefined) donneesMAJ.priorite = priorite;
      if (date_echeance !== undefined) donneesMAJ.date_echeance = date_echeance;
      if (liste_id !== undefined) {
        /** Vérifier que la liste appartient à l'utilisateur si spécifiée */
        if (liste_id !== null) {
          const liste = await listeRepository.trouverParId(liste_id);
          if (!liste || liste.utilisateur_id !== req.utilisateur.id) {
            return res.status(403).json({
              success: false,
              error: 'Liste non trouvée ou non autorisée.',
            });
          }
        }
        donneesMAJ.liste_id = liste_id;
      }

      /** Gestion du changement de statut */
      if (statut !== undefined && statut !== tache.statut) {
        /** Enregistrer dans l'historique des modifications */
        await tacheRepository.enregistrerHistorique(tache.id, tache.statut, statut);

        donneesMAJ.statut = statut;

        /** Si le nouveau statut est TERMINEE, définir la date de complétion */
        if (statut === 'TERMINEE') {
          donneesMAJ.date_completion = new Date();
        } else if (tache.statut === 'TERMINEE') {
          /** Si on quitte le statut TERMINEE, réinitialiser la date de complétion */
          donneesMAJ.date_completion = null;
        }
      }

      const tacheMAJ = await tacheRepository.mettreAJour(req.params.id, donneesMAJ);

      return res.status(200).json({
        success: true,
        data: { tache: tacheMAJ },
      });
    } catch (error) {
      console.error('Erreur lors de la modification de la tâche :', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur.',
      });
    }
  }

  /**
   * @async
   * @description Supprime une tâche après vérification du propriétaire.
   * @param {import('express').Request} req - Requête avec params.id.
   * @param {import('express').Response} res - Réponse Express.
   * @returns {Promise<void>}
   */
  async supprimerTache(req, res) {
    try {
      const tache = await tacheRepository.trouverParId(req.params.id);

      if (!tache) {
        return res.status(404).json({
          success: false,
          error: 'Tâche non trouvée.',
        });
      }

      /** Vérification de propriété */
      if (tache.utilisateur_id !== req.utilisateur.id) {
        return res.status(403).json({
          success: false,
          error: 'Accès non autorisé à cette tâche.',
        });
      }

      await tacheRepository.supprimer(req.params.id);

      return res.status(200).json({
        success: true,
        data: { message: 'Tâche supprimée avec succès.' },
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche :', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur.',
      });
    }
  }

  /**
   * @async
   * @description Recherche des tâches par mot-clé (LIKE sur titre et description).
   * @param {import('express').Request} req - Requête avec query param q.
   * @param {import('express').Response} res - Réponse Express.
   * @returns {Promise<void>}
   */
  async rechercher(req, res) {
    try {
      const { q } = req.query;

      if (!q || q.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Le paramètre de recherche "q" est requis.',
        });
      }

      const taches = await tacheRepository.rechercher(req.utilisateur.id, q.trim());

      return res.status(200).json({
        success: true,
        data: { taches },
      });
    } catch (error) {
      console.error('Erreur lors de la recherche :', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur.',
      });
    }
  }

  // ==================== LISTES ====================

  /**
   * @async
   * @description Crée une nouvelle liste thématique pour l'utilisateur connecté.
   * @param {import('express').Request} req - Requête avec body {nom, couleur, ordre}.
   * @param {import('express').Response} res - Réponse Express.
   * @returns {Promise<void>}
   */
  async creerListe(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
      }

      const { nom, couleur, ordre } = req.body;

      const liste = await listeRepository.creer({
        nom,
        couleur: couleur || '#3B82F6',
        ordre: ordre || 0,
        utilisateur_id: req.utilisateur.id,
      });

      return res.status(201).json({
        success: true,
        data: { liste },
      });
    } catch (error) {
      console.error('Erreur lors de la création de la liste :', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur.',
      });
    }
  }

  /**
   * @async
   * @description Liste toutes les listes de l'utilisateur avec le nombre de tâches.
   * @param {import('express').Request} req - Requête Express.
   * @param {import('express').Response} res - Réponse Express.
   * @returns {Promise<void>}
   */
  async listerListes(req, res) {
    try {
      const listes = await listeRepository.listerParUtilisateur(req.utilisateur.id);

      return res.status(200).json({
        success: true,
        data: { listes },
      });
    } catch (error) {
      console.error('Erreur lors de la liste des listes :', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur.',
      });
    }
  }

  /**
   * @async
   * @description Modifie une liste existante (nom, couleur, ordre).
   * Vérifie que l'utilisateur est le propriétaire.
   * @param {import('express').Request} req - Requête avec params.id et body partiel.
   * @param {import('express').Response} res - Réponse Express.
   * @returns {Promise<void>}
   */
  async modifierListe(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
      }

      const liste = await listeRepository.trouverParId(req.params.id);

      if (!liste) {
        return res.status(404).json({
          success: false,
          error: 'Liste non trouvée.',
        });
      }

      /** Vérification de propriété */
      if (liste.utilisateur_id !== req.utilisateur.id) {
        return res.status(403).json({
          success: false,
          error: 'Accès non autorisé à cette liste.',
        });
      }

      const { nom, couleur, ordre } = req.body;
      const donneesMAJ = {};

      if (nom !== undefined) donneesMAJ.nom = nom;
      if (couleur !== undefined) donneesMAJ.couleur = couleur;
      if (ordre !== undefined) donneesMAJ.ordre = ordre;

      const listeMAJ = await listeRepository.mettreAJour(req.params.id, donneesMAJ);

      return res.status(200).json({
        success: true,
        data: { liste: listeMAJ },
      });
    } catch (error) {
      console.error('Erreur lors de la modification de la liste :', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur.',
      });
    }
  }

  /**
   * @async
   * @description Supprime une liste et dissocie les tâches associées (liste_id = NULL).
   * Vérifie que l'utilisateur est le propriétaire.
   * @param {import('express').Request} req - Requête avec params.id.
   * @param {import('express').Response} res - Réponse Express.
   * @returns {Promise<void>}
   */
  async supprimerListe(req, res) {
    try {
      const liste = await listeRepository.trouverParId(req.params.id);

      if (!liste) {
        return res.status(404).json({
          success: false,
          error: 'Liste non trouvée.',
        });
      }

      /** Vérification de propriété */
      if (liste.utilisateur_id !== req.utilisateur.id) {
        return res.status(403).json({
          success: false,
          error: 'Accès non autorisé à cette liste.',
        });
      }

      /** Dissocier les tâches de la liste avant suppression */
      await tacheRepository.dissocierListe(req.params.id);

      /** Supprimer la liste */
      await listeRepository.supprimer(req.params.id);

      return res.status(200).json({
        success: true,
        data: { message: 'Liste supprimée avec succès.' },
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la liste :', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur.',
      });
    }
  }
}

module.exports = new TaskController();
