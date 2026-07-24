// ============================================================
// BottomNav — Barra de navegación inferior (5 tabs)
// ============================================================
// Navegación principal con iconos + texto. Usa NavLink de
// react-router-dom para resaltar automáticamente la página
// activa con la clase CSS "active".
//
// Íconos de lucide-react:
//   Buscar      → / (página principal)
//   Inventario  → /inventario
//   Movimientos → /movimientos
//   Reportes    → /reportes
//   Importación → /importacion
// ============================================================

import { NavLink } from 'react-router-dom';
import { Search, Package, ReplaceAll, BarChart3, Upload } from 'lucide-react';

// Definición de las 5 secciones del sistema
const navItems = [
  { to: '/', icon: Search, label: 'Buscar' },
  { to: '/inventario', icon: Package, label: 'Inventario' },
  { to: '/movimientos', icon: ReplaceAll, label: 'Movimientos' },
  { to: '/reportes', icon: BarChart3, label: 'Reportes' },
  { to: '/importacion', icon: Upload, label: 'Importación' },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <div className="nav-container">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
