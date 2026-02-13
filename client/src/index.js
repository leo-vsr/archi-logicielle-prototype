/**
 * @fileoverview Point d'entrée de l'application React (Tier 1 - Présentation).
 * Monte le composant App dans le DOM avec le AuthProvider.
 * @module index
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';

/** @type {ReactDOM.Root} Racine React */
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
