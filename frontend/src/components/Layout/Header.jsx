// ============================================================
// Header — Barra superior de la aplicación
// ============================================================
// Muestra el título de la página actual y opcionalmente un
// botón de retroceso (←) en formularios de crear/editar.
// ============================================================

import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Header({ title, showBack = false }) {
  const navigate = useNavigate();

  return (
    <header className="app-header">
      {showBack && (
        <button
          className="app-header__back"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={20} />
        </button>
      )}
      <h1 className="app-header__title">{title}</h1>
    </header>
  );
}
