// ============================================================
// ProductList — Lista de productos con buscador
// ============================================================
// Contiene:
//   - Encabezado con título y contador de productos
//   - Barra de búsqueda
//   - Lista de ProductListItem (o estados vacío/cargando)
// ============================================================

import { Search } from 'lucide-react';
import ProductListItem from './ProductListItem';

export default function ProductList({
  productos,
  searchTerm,
  onSearchChange,
  onEdit,
  loading,
}) {
  return (
    <>
      {/* Encabezado con contador */}
      <div className="page-inventory__header">
        <h2 className="page-inventory__title">Todos los productos</h2>
        <span
          className="text-muted"
          style={{ fontSize: 'var(--font-size-sm)' }}
        >
          {productos.length} producto{productos.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Barra de búsqueda */}
      <div className="page-inventory__search">
        <div
          className={`search-bar${searchTerm ? ' search-bar--focused' : ''}`}
        >
          <span className="search-bar__icon">
            <Search size={20} />
          </span>
          <input
            type="text"
            className="search-bar__input"
            placeholder="Buscar en inventario..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de productos con 3 estados posibles */}
      <div className="page-inventory__list">
        {loading ? (
          // Estado 1: Cargando...
          <div className="loading-state">
            <div className="spin">
              <Search size={24} />
            </div>
            <span>Cargando productos...</span>
          </div>
        ) : productos.length === 0 ? (
          // Estado 2: Sin resultados
          <div className="loading-state">
            <span className="text-muted">No se encontraron productos</span>
          </div>
        ) : (
          // Estado 3: Productos cargados
          productos.map((p) => (
            <ProductListItem
              key={p.id_producto}
              producto={p}
              onEdit={onEdit}
            />
          ))
        )}
      </div>
    </>
  );
}
