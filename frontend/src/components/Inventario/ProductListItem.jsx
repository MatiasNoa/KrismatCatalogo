// ============================================================
// ProductListItem — Fila de producto en la lista del inventario
// ============================================================
// Muestra: marca + modelo + años, tipo (badge) y estado.
// Botón de editar que redirige al formulario de edición.
// ============================================================

import { PenSquare } from 'lucide-react';

export default function ProductListItem({ producto, onEdit }) {
  return (
    <div className="product-list-item animate-in">
      <div className="product-list-item__info">
        {/* Nombre completo del producto */}
        <div className="product-list-item__name">
          {producto.marca} {producto.modelo} ({producto.anio})
        </div>

        {/* Metadata: tipo (5D/8D) y estado si es inactivo */}
        <div className="product-list-item__meta">
          <span className="badge badge--type">{producto.tipo}</span>
          {producto.estado === 'INACTIVO' && (
            <span className="badge badge--inactive">Inactivo</span>
          )}
        </div>
      </div>

      {/* Botón de editar */}
      <div className="product-list-item__actions">
        <button
          className="btn btn--ghost btn--icon"
          onClick={() => onEdit(producto)}
          aria-label="Editar"
        >
          <PenSquare size={20} />
        </button>
      </div>
    </div>
  );
}
