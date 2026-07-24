// ============================================================
// App.jsx — Componente raíz con enrutamiento
// ============================================================
// Configura React Router con todas las rutas del sistema.
// Las rutas están anidadas dentro de <AppShell /> para que
// compartan el mismo layout (Header + BottomNav).
//
// Módulos:
//   1. INVENTARIO   → /inventario, /inventario/crear, /inventario/editar/:id
//   2. BÚSQUEDA     → /                            (próximamente)
//   3. MOVIMIENTOS  → /movimientos                 (próximamente)
//   4. REPORTES     → /reportes                    (próximamente)
//   5. IMPORTACIÓN  → /importacion                 (próximamente)
// ============================================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './components/Layout/AppShell';
import InventarioPage from './pages/InventarioPage';
import ProductoFormPage from './pages/ProductoFormPage';

// Estilos globales del sistema (copiados del mockup HTML)
import './styles/variables.css';   // Tokens de diseño
import './styles/global.css';      // Reset y estilos base
import './styles/layout.css';      // App shell, header, bottom nav
import './styles/components.css';  // Componentes reutilizables
import './styles/pages.css';       // Estilos específicos por página

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          {/* Página principal — BÚSQUEDA (pendiente) */}
          <Route
            path="/"
            element={
              <div className="page-search__search">
                <p className="text-muted">Módulo de búsqueda (próximamente)</p>
              </div>
            }
          />

          {/* Módulo 1 — INVENTARIO */}
          <Route path="/inventario" element={<InventarioPage />} />
          <Route path="/inventario/crear" element={<ProductoFormPage />} />
          <Route path="/inventario/editar/:id" element={<ProductoFormPage />} />

          {/* Módulos pendientes */}
          <Route
            path="/movimientos"
            element={
              <div className="page-search__search">
                <p className="text-muted">Módulo de movimientos (próximamente)</p>
              </div>
            }
          />
          <Route
            path="/reportes"
            element={
              <div className="page-search__search">
                <p className="text-muted">Módulo de reportes (próximamente)</p>
              </div>
            }
          />
          <Route
            path="/importacion"
            element={
              <div className="page-search__search">
                <p className="text-muted">Módulo de importación (próximamente)</p>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
