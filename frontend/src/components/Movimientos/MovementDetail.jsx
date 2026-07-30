import { X, Package } from 'lucide-react';

function pad(n) { return String(n).padStart(2, '0'); }

function formatFecha(dateStr) {
  const d = new Date(dateStr);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function badgeClass(tipo) {
  if (tipo === 'ENTRADA') return 'badge--entrada';
  if (tipo === 'SALIDA') return 'badge--salida';
  if (tipo === 'AJUSTE_POSITIVO') return 'badge--ajuste-positivo';
  return 'badge--ajuste-negativo';
}

function tipoLabel(tipo) {
  const labels = {
    ENTRADA: 'Entrada',
    SALIDA: 'Salida',
    AJUSTE_POSITIVO: 'Ajuste +',
    AJUSTE_NEGATIVO: 'Ajuste -',
  };
  return labels[tipo] || tipo;
}

export default function MovementDetail({ movimiento, onClose }) {
  if (!movimiento) return null;

  const detalles = movimiento.detalles || [];

  return (
    <>
      <div className="modal-overlay active" onClick={onClose} />
      <div className="bottom-sheet active">
        <div className="bottom-sheet__handle" />
        <div className="bottom-sheet__header">
          <h2 className="bottom-sheet__title">
            <span className={`badge ${badgeClass(movimiento.tipo)}`} style={{ marginRight: '0.5rem' }}>
              {tipoLabel(movimiento.tipo)}
            </span>
          </h2>
          <button className="bottom-sheet__close" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="bottom-sheet__body">
          <div className="detail-row">
            <span className="detail-row__label">Fecha</span>
            <span className="detail-row__value">{formatFecha(movimiento.fecha)}</span>
          </div>

          {movimiento.motivo && (
            <div className="detail-row">
              <span className="detail-row__label">Motivo</span>
              <span className="detail-row__value">{movimiento.motivo}</span>
            </div>
          )}

          <div className="detail-section">
            <div className="detail-section__title">Productos</div>
            {detalles.map((d) => (
              <div key={d.id_detalle_movimiento} className="detail-row">
                <span className="detail-row__label">
                  {d.marca} {d.modelo}
                  <span className="badge badge--type" style={{ marginLeft: '0.5rem', fontSize: '0.625rem' }}>
                    {d.tipo}
                  </span>
                </span>
                <span className="detail-row__value">
                  <span className={`badge ${['ENTRADA', 'AJUSTE_POSITIVO'].includes(movimiento.tipo) ? 'badge--stock' : 'badge--nostock'}`}>
                    {['ENTRADA', 'AJUSTE_POSITIVO'].includes(movimiento.tipo) ? '+' : '-'}{d.cantidad}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
