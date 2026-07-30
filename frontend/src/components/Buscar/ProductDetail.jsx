// ============================================================
// ProductDetail — Bottom sheet con detalle completo del producto
// ============================================================
// Modal que se desliza desde abajo mostrando:
//   - Marca, modelo, años, tipo, stock, ubicación
//   - Compatibilidades (si tiene)
//   - Observaciones
// ============================================================

import { X, Package, XCircle, MapPin } from 'lucide-react';

export default function ProductDetail({ producto, onClose }) {
  if (!producto) return null;

  const hasStock = producto.stock > 0;
  const compat = producto.compatibilidades || [];

  return (
    <>
      {/* Overlay */}
      <div className="modal-overlay active" onClick={onClose} />

      {/* Bottom sheet */}
      <div className="bottom-sheet active">
        <div className="bottom-sheet__handle" />
        <div className="bottom-sheet__header">
          <h2 className="bottom-sheet__title">
            {producto.marca} {producto.modelo}
          </h2>
          <button className="bottom-sheet__close" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="bottom-sheet__body">
          {/* Marca */}
          <div className="detail-row">
            <span className="detail-row__label">Marca</span>
            <span className="detail-row__value">{producto.marca}</span>
          </div>

          {/* Modelo */}
          <div className="detail-row">
            <span className="detail-row__label">Modelo</span>
            <span className="detail-row__value">{producto.modelo}</span>
          </div>

          {/* Años */}
          <div className="detail-row">
            <span className="detail-row__label">Años</span>
            <span className="detail-row__value">{producto.anio}</span>
          </div>

          {/* Tipo */}
          <div className="detail-row">
            <span className="detail-row__label">Tipo</span>
            <span className="detail-row__value">
              <span className="badge badge--type">{producto.tipo}</span>
            </span>
          </div>

          {/* Stock */}
          <div className="detail-row">
            <span className="detail-row__label">Stock</span>
            <span className="detail-row__value">
              <span className={`badge ${hasStock ? 'badge--stock' : 'badge--nostock'}`}>
                {hasStock ? `${producto.stock} unidades` : 'SIN STOCK'}
              </span>
            </span>
          </div>

          {/* Ubicación */}
          <div className="detail-row">
            <span className="detail-row__label">Ubicación</span>
            <span className="detail-row__value">{producto.ubicacion || '—'}</span>
          </div>

          {/* Proveedor */}
          <div className="detail-row">
            <span className="detail-row__label">Proveedor</span>
            <span className="detail-row__value">{producto.proveedor || '—'}</span>
          </div>

          {/* Compatibilidades */}
          {compat.length > 0 && (
            <div className="detail-section">
              <div className="detail-section__title">Compatibilidades</div>
              {compat.map((c) => (
                <div key={c.id_compatibilidad} className="detail-row">
                  <span className="detail-row__label">
                    {c.marca} {c.modelo}
                  </span>
                  <span className="detail-row__value">{c.anio}</span>
                </div>
              ))}
            </div>
          )}

          {/* Observaciones */}
          {producto.observaciones && (
            <div className="detail-section">
              <div className="detail-section__title">Observaciones</div>
              <p style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
                marginTop: 'var(--spacing-sm)',
              }}>
                {producto.observaciones}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
