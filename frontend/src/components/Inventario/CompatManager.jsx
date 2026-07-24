// ============================================================
// CompatManager — Gestión de compatibilidades (editar producto)
// ============================================================
// Muestra la lista de productos compatibles actuales y permite:
//   - Buscar productos para agregar como compatibles
//   - Agregar un producto compatible
//   - Eliminar una compatibilidad existente
//
// La búsqueda tiene debounce de 300ms para no saturar la API.
// Los resultados excluyen al producto que se está editando.
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { X, Plus } from 'lucide-react';
import { productosApi } from '../../services/api';

export default function CompatManager({
  productoId,
  compatibilidades,
  onUpdate,
}) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef(null);

  // Buscar productos compatibles mientras se escribe (debounce 300ms)
  useEffect(() => {
    if (search.trim().length < 2) {
      setResults([]);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await productosApi.buscar(search);
        // Excluir el producto actual de los resultados
        setResults(data.filter((p) => p.id_producto !== productoId));
      } catch {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [search, productoId]);

  // Agregar un producto compatible
  const handleAdd = async (compatibleId) => {
    try {
      await productosApi.agregarCompatibilidad(productoId, compatibleId);
      setSearch('');
      setResults([]);
      onUpdate(); // Recargar la lista desde la API
    } catch (err) {
      alert(err.message);
    }
  };

  // Eliminar una compatibilidad
  const handleRemove = async (compatId) => {
    try {
      await productosApi.quitarCompatibilidad(productoId, compatId);
      onUpdate(); // Recargar la lista desde la API
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="compat-section">
      <h3 className="compat-section__title">Compatibilidades</h3>
      <p className="compat-section__desc">
        Productos compatibles con este modelo, confirmados físicamente.
      </p>

      {/* Lista de compatibilidades actuales */}
      {compatibilidades.length > 0 && (
        <div className="compat-list">
          {compatibilidades.map((c) => (
            <div key={c.id_compatibilidad} className="compat-item">
              <span className="compat-item__info">
                {c.marca} {c.modelo} ({c.anio})
              </span>
              <button
                className="compat-item__remove btn btn--ghost btn--icon"
                onClick={() => handleRemove(c.id_compatibilidad)}
                aria-label="Eliminar compatibilidad"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Buscador para agregar nueva compatibilidad */}
      <div className="compat-add" style={{ position: 'relative' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Buscar producto compatible..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
        />
      </div>

      {/* Resultados de la búsqueda */}
      {showResults && results.length > 0 && (
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            marginTop: 'var(--spacing-sm)',
            overflow: 'hidden',
          }}
        >
          {results.map((p) => (
            <button
              key={p.id_producto}
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: 'var(--spacing-md) var(--spacing-lg)',
                borderBottom: '1px solid var(--color-border-light)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text)',
                textAlign: 'left',
                cursor: 'pointer',
              }}
              onClick={() => handleAdd(p.id_producto)}
            >
              <span>
                {p.marca} {p.modelo} ({p.anio})
              </span>
              <Plus size={16} style={{ color: 'var(--color-primary)' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
