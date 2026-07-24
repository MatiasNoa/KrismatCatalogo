// ============================================================
// AppShell — Layout principal (Header + contenido + BottomNav)
// ============================================================
// Este componente envuelve todas las páginas del sistema.
// Se renderiza como Route padre con <Outlet /> para que cada
// página hija se muestre en el main-content.
//
// Determina el título del Header según la ruta actual.
// Muestra el botón de retroceso en formularios (crear/editar).
// ============================================================

import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';

// Mapa de rutas → títulos del Header
const pageTitles = {
  '/': 'Búsqueda',
  '/inventario': 'Inventario',
  '/inventario/crear': 'Nuevo producto',
  '/movimientos': 'Movimientos',
  '/reportes': 'Reportes',
  '/importacion': 'Importación',
};

export default function AppShell() {
  const location = useLocation();

  // Título dinámico según la ruta actual
  const title = pageTitles[location.pathname] || 'Krismat';

  // Botón de retroceso solo en páginas de formulario
  const showBack =
    location.pathname.includes('/editar') ||
    location.pathname.includes('/crear');

  return (
    <div className="app-shell">
      <Header title={title} showBack={showBack} />
      <main className="main-content">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
