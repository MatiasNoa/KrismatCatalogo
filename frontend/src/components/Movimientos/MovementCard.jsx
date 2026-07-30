import { Package, ArrowRight, Calendar } from 'lucide-react';

function formatFecha(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
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

export default function MovementCard({ movimiento, onClick }) {
  return (
    <div className="movement-card animate-in" onClick={() => onClick(movimiento)}>
      <div className="movement-card__header">
        <span className={`badge ${badgeClass(movimiento.tipo)}`}>
          {tipoLabel(movimiento.tipo)}
        </span>
        <span className="movement-card__date">
          <Calendar size={14} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
          {formatFecha(movimiento.fecha)}
        </span>
      </div>

      {movimiento.motivo && (
        <p className="movement-card__motivo">{movimiento.motivo}</p>
      )}

      <div className="movement-card__divider" />

      <div className="movement-card__stats">
        <span className="movement-card__stat">
          <Package size={14} />
          {movimiento.total_productos} producto{movimiento.total_productos !== 1 ? 's' : ''}
        </span>
        <span className="movement-card__stat">
          <ArrowRight size={14} />
          {movimiento.total_cantidad} unidad{movimiento.total_cantidad !== 1 ? 'es' : ''}
        </span>
      </div>
    </div>
  );
}
