import { useState, useEffect, useCallback } from 'react';
import { reportesApi } from '../services/api';
import {
  Package, TrendingDown, ClipboardList, BarChart3,
  AlertTriangle, ArrowRight, Calendar,
} from 'lucide-react';

const REPORTES = [
  { key: 'resumen', label: 'Resumen general', desc: 'Estadísticas rápidas del inventario', icon: BarChart3, color: 'info' },
  { key: 'stock', label: 'Stock actual', desc: 'Productos con nivel de stock', icon: Package, color: 'warning' },
  { key: 'movimientos', label: 'Movimientos', desc: 'Historial de entradas, salidas y ajustes', icon: ClipboardList, color: 'danger' },
];

export default function ReportesPage() {
  const [activeReport, setActiveReport] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [stockData, setStockData] = useState([]);
  const [movData, setMovData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [minStock, setMinStock] = useState('');

  const cargarResumen = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reportesApi.resumen();
      setResumen(data);
    } catch (err) {
      console.error('Error al cargar resumen:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarStock = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (minStock !== '') params.minStock = minStock;
      const data = await reportesApi.stock(params);
      setStockData(data);
    } catch (err) {
      console.error('Error al cargar stock:', err);
    } finally {
      setLoading(false);
    }
  }, [minStock]);

  const cargarMovimientos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await reportesApi.movimientos({ limit: 50 });
      setMovData(data);
    } catch (err) {
      console.error('Error al cargar movimientos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeReport === 'resumen') cargarResumen();
    else if (activeReport === 'stock') cargarStock();
    else if (activeReport === 'movimientos') cargarMovimientos();
  }, [activeReport, cargarResumen, cargarStock, cargarMovimientos]);

  return (
    <div className="page">
      <h1 className="page-reports__title">Reportes</h1>

      {/* Tarjetas de reportes */}
      <div className="page-reports__grid">
        {REPORTES.map((r) => (
          <div
            key={r.key}
            className={`report-card ${activeReport === r.key ? 'report-card--active' : ''}`}
            onClick={() => setActiveReport(activeReport === r.key ? null : r.key)}
            style={activeReport === r.key ? {
              border: '2px solid var(--color-primary)',
              boxShadow: 'var(--shadow-md)',
            } : undefined}
          >
            <div className={`report-card__icon report-card__icon--${r.color}`}>
              <r.icon size={24} />
            </div>
            <div className="report-card__content">
              <div className="report-card__title">{r.label}</div>
              <div className="report-card__desc">{r.desc}</div>
            </div>
            <ArrowRight size={20} className="report-card__arrow" />
          </div>
        ))}
      </div>

      {/* Contenido del reporte activo */}
      {activeReport === 'resumen' && (
        <div className="report-table-section active" style={{ marginTop: 'var(--spacing-xl)' }}>
          <div className="report-table-section__header">
            <h2 className="report-table-section__title">Resumen general</h2>
          </div>
          {loading ? (
            <div className="loading-state"><p>Cargando...</p></div>
          ) : resumen ? (
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)',
            }}>
              {[
                { label: 'Productos activos', value: resumen.totalProductos, color: 'var(--color-primary)' },
                { label: 'Unidades en stock', value: resumen.totalStock, color: 'var(--color-success)' },
                { label: 'Sin stock', value: resumen.sinStock, color: 'var(--color-danger)' },
                { label: 'Stock bajo (≤5)', value: resumen.stockBajo, color: 'var(--color-warning)' },
                { label: 'Movimientos del mes', value: resumen.movimientosMes, color: 'var(--color-info)' },
                { label: 'Total movimientos', value: resumen.totalMovimientos, color: 'var(--color-text)' },
              ].map((item) => (
                <div key={item.label} style={{
                  background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)',
                  padding: 'var(--spacing-xl)', boxShadow: 'var(--shadow-card)',
                }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', color: item.color }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {activeReport === 'stock' && (
        <div className="report-table-section active" style={{ marginTop: 'var(--spacing-xl)' }}>
          <div className="report-table-section__header">
            <h2 className="report-table-section__title">Stock actual</h2>
            <div className="threshold-filter">
              <label>Stock ≤</label>
              <input
                type="number"
                className="form-input"
                min="0"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          {loading ? (
            <div className="loading-state"><p>Cargando...</p></div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Tipo</th>
                    <th>Stock</th>
                    <th>Ubicación</th>
                  </tr>
                </thead>
                <tbody>
                  {stockData.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--color-text-muted)' }}>Sin datos</td></tr>
                  ) : stockData.map((p) => (
                    <tr key={p.id_producto}>
                      <td style={{ fontWeight: 'var(--font-weight-semibold)' }}>{p.marca} {p.modelo} <span style={{ color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-normal)' }}>{p.anio}</span></td>
                      <td><span className="badge badge--type">{p.tipo}</span></td>
                      <td>
                        <span className={`badge ${p.stock === 0 ? 'badge--nostock' : p.stock <= 5 ? 'badge--warning' : 'badge--stock'}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td style={{ color: 'var(--color-text-secondary)' }}>{p.ubicacion || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeReport === 'movimientos' && (
        <div className="report-table-section active" style={{ marginTop: 'var(--spacing-xl)' }}>
          <div className="report-table-section__header">
            <h2 className="report-table-section__title">Movimientos</h2>
          </div>
          {loading ? (
            <div className="loading-state"><p>Cargando...</p></div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Motivo</th>
                    <th>Productos</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {movData.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--color-text-muted)' }}>Sin movimientos</td></tr>
                  ) : movData.map((m) => (
                    <tr key={m.id_movimiento}>
                      <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                        {new Date(m.fecha).toLocaleDateString('es-AR')}
                      </td>
                      <td>
                        <span className={`badge ${m.tipo === 'ENTRADA' ? 'badge--entrada' : m.tipo === 'SALIDA' ? 'badge--salida' : m.tipo === 'AJUSTE_POSITIVO' ? 'badge--ajuste-positivo' : 'badge--ajuste-negativo'}`}>
                          {m.tipo === 'ENTRADA' ? 'Entrada' : m.tipo === 'SALIDA' ? 'Salida' : m.tipo === 'AJUSTE_POSITIVO' ? 'Ajuste +' : 'Ajuste -'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--color-text-secondary)', maxWidth: '12rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.motivo || '—'}
                      </td>
                      <td>{m.total_productos}</td>
                      <td style={{ fontWeight: 'var(--font-weight-semibold)' }}>{m.total_cantidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
