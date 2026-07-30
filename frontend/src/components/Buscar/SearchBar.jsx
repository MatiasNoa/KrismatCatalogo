// ============================================================
// SearchBar — Barra de búsqueda principal
// ============================================================
// Input grande con icono de lupa. La búsqueda se dispara en
// tiempo real mientras el usuario escribe (sin Enter).
// El debounce de 300ms lo maneja la página (BuscarPage).
// ============================================================

import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange }) {
  return (
    <div className={`search-bar${value ? ' search-bar--focused' : ''}`}>
      <span className="search-bar__icon">
        <Search size={20} />
      </span>
      <input
        type="text"
        className="search-bar__input"
        placeholder="Buscar por marca o modelo..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
      />
    </div>
  );
}
