import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initStorage } from './services/storageService';

// Initialize mock data in local storage if not exists
initStorage();

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
