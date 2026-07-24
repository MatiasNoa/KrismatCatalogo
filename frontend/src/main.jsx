// ============================================================
// main.jsx — Punto de entrada del frontend React
// ============================================================
// Monta la aplicación React dentro del elemento #root del HTML.
// StrictMode activa verificaciones adicionales en desarrollo.
// ============================================================

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
