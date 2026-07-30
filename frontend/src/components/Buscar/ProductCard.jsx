// ============================================================
// ProductCard — Tarjeta de producto en resultados de búsqueda
// ============================================================
// Muestra:
//   - Marca (uppercase, color primario)
//   - Modelo + tipo (badge)
//   - Rango de años
//   - Stock (verde si hay, rojo si no)
//   - Ubicación
//   - Indicador de compatible disponible (solo si stock=0 y hay)
//   - Botón "Ver detalle"
// ============================================================

import { Package, XCircle, MapPin, GitMerge } from 'lucide-react';

export default function ProductCard({ producto, onDetail }) {
  const hasStock = producto.stock > 0;
  const hasCompat = parseInt(producto.compat_count) > 0;

  return (
    <div className="product-card animate-in">
      {/* Marca */}
      <div className="product-card__brand">{producto.marca}</div>

      {/* Header: modelo + tipo badge */}
      <div className="product-card__header">
        <h3 className="product-card__model">{producto.modelo}</h3>
        <span className="badge badge--type">{producto.tipo}</span>
      </div>

      {/* Años */}
      <p className="product-card__years">{producto.anio}</p>

      <div className="product-card__divider" />

      {/* Info: stock + ubicación */}
      <div className="product-card__info">
        <div className="product-card__info-row">
          {hasStock ? <Package size={16} /> : <XCircle size={16} />}
          <span className={hasStock ? 'product-card__stock--available' : 'product-card__stock--unavailable'}>
            {hasStock ? `Stock: ${producto.stock}` : 'SIN STOCK'}
          </span>
        </div>
        <div className="product-card__info-row">
          <MapPin size={16} />
          <span>{producto.ubicacion || 'Sin ubicación'}</span>
        </div>

        {/* Compatible disponible (solo si stock=0 y hay compatibilidades) */}
        {!hasStock && hasCompat && (
          <div className="product-card__info-row">
            <GitMerge size={16} />
            <span className="badge badge--compatible">Compatible disponible</span>
          </div>
        )}
      </div>

      {/* Botón ver detalle */}
      <button
        className="btn btn--primary btn--sm btn--full"
        onClick={() => onDetail(producto)}
      >
        Ver detalle
      </button>
    </div>
  );
}
