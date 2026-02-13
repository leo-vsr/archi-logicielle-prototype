/**
 * @fileoverview Composant principal de l'application React.
 * Gère le routage conditionnel entre l'écran de connexion et le dashboard.
 * @module App
 */

import React from 'react';
import { useAuth } from './context/AuthContext';
import EcranConnexion from './components/EcranConnexion';
import EcranTaches from './components/EcranTaches';

/**
 * @function App
 * @description Composant racine de l'application.
 * Affiche l'écran de connexion si l'utilisateur n'est pas authentifié,
 * sinon affiche le dashboard des tâches.
 * @returns {JSX.Element} Le composant App.
 */
function App() {
  const { estConnecte } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {estConnecte ? <EcranTaches /> : <EcranConnexion />}
    </div>
  );
}

export default App;
