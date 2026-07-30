import { useState, useRef } from 'react';
import { productosApi } from '../../services/api';
import { Plus, X, MapPin, Package, Search } from 'lucide-react';

const TABS = [
  { key: 'ENTRADA', label: 'Entrada' },
  { key: 'SALIDA', label: 'Salida' },
  { key: 'AJUSTE', label: 'Ajuste' },
];

const AJUSTE_SUBTABS = [
  { key: 'AJUSTE_POSITIVO', label: 'Positivo' },
  { key: 'AJUSTE_NEGATIVO', label: 'Negativo' },
];

export default function MovementForm({ onSubmit, loading }) {
  const [tab, setTab] = useState(null);
  const [subtipo, setSubtipo] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [detalles, setDetalles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  const tipo = tab === 'AJUSTE' ? subtipo : tab;

  const handleSearch = (q) => {
    setSearchQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!q.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await productosApi.buscar(q.trim());
        setSearchResults(data);
      } catch (err) {
        console.error('Error en búsqueda:', err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const handleTabClick = (key) => {
    setTab(key);
    setSubtipo(null);
  };

  const esSalida = tipo === 'SALIDA' || tipo === 'AJUSTE_NEGATIVO';

  const stockSuficiente = (d) => !esSalida || d.cantidad <= d.stock;

  const agregarProducto = (producto) => {
    if (detalles.some((d) => d.producto_id === producto.id_producto)) return;
    setDetalles([
      ...detalles,
      {
        producto_id: producto.id_producto,
        marca: producto.marca,
        modelo: producto.modelo,
        anio: producto.anio,
        tipo: producto.tipo,
        ubicacion: producto.ubicacion,
        stock: producto.stock,
        cantidad: 1,
      },
    ]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const cambiarCantidad = (productoId, cantidad) => {
    const val = parseInt(cantidad) || 1;
    setDetalles(detalles.map((d) =>
      d.producto_id === productoId ? { ...d, cantidad: Math.max(1, val) } : d
    ));
  };

  const quitarProducto = (productoId) => {
    setDetalles(detalles.filter((d) => d.producto_id !== productoId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tipo || detalles.length === 0) return;
    onSubmit({
      tipo,
      motivo: motivo || undefined,
      detalles: detalles.map((d) => ({ producto_id: d.producto_id, cantidad: d.cantidad })),
    });
  };

  const isFormValid = tipo && detalles.length > 0 && detalles.every(stockSuficiente);

  return (
    <form className="page-form" onSubmit={handleSubmit}>
      <h1 className="page-form__title">Nuevo movimiento</h1>

      {/* Tabs de tipo */}
      <div className="form-group">
        <label className="form-label">Tipo de movimiento</label>
        <div className="tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`tab ${tab === t.key ? 'active' : ''}`}
              onClick={() => handleTabClick(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'AJUSTE' && (
          <div className="tabs tabs--subtabs" style={{ marginTop: 'var(--spacing-sm)' }}>
            {AJUSTE_SUBTABS.map((st) => (
              <button
                key={st.key}
                type="button"
                className={`tab ${subtipo === st.key ? 'active' : ''}`}
                onClick={() => setSubtipo(st.key)}
              >
                {st.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Motivo */}
      <div className="form-group">
        <label className="form-label">Motivo (opcional)</label>
        <textarea
          className="form-textarea"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          rows={3}
          placeholder="Ej: Compra a proveedor, devolución, ajuste de inventario..."
        />
      </div>

      {/* Buscador de productos */}
      <div className="form-group">
        <label className="form-label">Agregar productos</label>
        <div className="search-bar" style={{ marginBottom: 'var(--spacing-md)' }}>
          <span className="search-bar__icon">
            <Search size={20} />
          </span>
          <input
            type="text"
            className="search-bar__input"
            placeholder="Buscar por marca o modelo..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {searching && (
          <div style={{ padding: 'var(--spacing-lg)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
            Buscando...
          </div>
        )}

        {!searching && searchQuery && searchResults.length === 0 && (
          <div style={{ padding: 'var(--spacing-lg)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
            Sin resultados para "{searchQuery}"
          </div>
        )}

        {!searching && searchResults.length > 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)',
            marginBottom: 'var(--spacing-lg)',
          }}>
            {searchResults.map((p) => (
              <div key={p.id_producto}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)',
                  padding: 'var(--spacing-lg)',
                  background: 'var(--color-background-alt)',
                  borderRadius: 'var(--radius-xl)',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                    {p.marca} {p.modelo}
                    <span style={{ color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-normal)', marginLeft: '0.5rem' }}>
                      {p.anio}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    <span className="badge badge--type">{p.tipo}</span>
                    {p.ubicacion && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={12} /> {p.ubicacion}
                      </span>
                    )}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Package size={12} /> Stock: {p.stock}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                  onClick={() => agregarProducto(p)}
                >
                  <Plus size={14} /> Agregar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lista de productos agregados */}
      {detalles.length > 0 && (
        <div className="form-group">
          <label className="form-label">Productos seleccionados ({detalles.length})</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {detalles.map((d) => {
              const ok = stockSuficiente(d);
              return (
                <div key={d.producto_id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)',
                    padding: 'var(--spacing-lg)',
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-card)',
                    border: ok ? 'none' : '2px solid var(--color-danger)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                      {d.marca} {d.modelo}
                      <span style={{ color: 'var(--color-text-secondary)', fontWeight: 'var(--font-weight-normal)', marginLeft: '0.5rem' }}>
                        {d.anio}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                      <span className="badge badge--type">{d.tipo}</span>
                      {d.ubicacion && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin size={12} /> {d.ubicacion}
                        </span>
                      )}
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Package size={12} /> Stock: {d.stock}
                      </span>
                      {!ok && (
                        <span className="badge badge--nostock">Stock insuficiente</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                    <input
                      type="number"
                      className="form-input"
                      min="1"
                      max={esSalida ? d.stock : undefined}
                      value={d.cantidad}
                      onChange={(e) => cambiarCantidad(d.producto_id, e.target.value)}
                      style={{
                        width: '4rem', textAlign: 'center', padding: 'var(--spacing-sm) var(--spacing-md)',
                        borderColor: ok ? undefined : 'var(--color-danger)',
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn--ghost btn--icon"
                      onClick={() => quitarProducto(d.producto_id)}
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="form-actions" style={{ marginTop: 'var(--spacing-2xl)' }}>
        <button
          type="submit"
          className="btn btn--primary btn--full btn--lg"
          disabled={!isFormValid || loading}
        >
          {loading ? 'Guardando...' : 'Registrar movimiento'}
        </button>
      </div>
    </form>
  );
}
