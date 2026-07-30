// ============================================================
// BuscarPage — Página principal de BÚSQUEDA
// ============================================================
// Todo depende de la barra de búsqueda:
//   1. Sin query → texto de bienvenida/placeholder
//   2. Mientras escribe → debounce 300ms, busca en backend
//   3. Resultados → lista de ProductCard
//   4. Click "Ver detalle" → fetch detail + bottom sheet
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { productosApi } from '../services/api';
import SearchBar from '../components/Buscar/SearchBar';
import ProductCard from '../components/Buscar/ProductCard';
import ProductDetail from '../components/Buscar/ProductDetail';
import { Package, Search } from 'lucide-react';

export default function BuscarPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const debounceRef = useRef(null);

  // Buscar con debounce de 300ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await productosApi.buscar(query.trim());
        setResults(data);
      } catch (err) {
        console.error('Error en búsqueda:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Abrir detalle → fetch completo
  const handleDetail = useCallback(async (producto) => {
    setSelectedProduct(producto);
    setDetailLoading(true);
    setDetailData(null);

    try {
      const data = await productosApi.obtener(producto.id_producto);
      setDetailData(data);
    } catch (err) {
      console.error('Error al obtener detalle:', err);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedProduct(null);
    setDetailData(null);
  }, []);

  return (
    <div className="page page-search">
      <div className="page-search__search">
        <SearchBar value={query} onChange={setQuery} />
      </div>

      <div className="page-search__results">
        {/* Placeholder sin búsqueda */}
        {!query.trim() && !loading && (
          <div className="empty-state">
            <Search size={48} />
            <h3>Buscar productos</h3>
            <p>Escribí el nombre de una marca o modelo para comenzar</p>
          </div>
        )}

        {/* Cargando */}
        {loading && (
          <div className="empty-state">
            <p>Buscando...</p>
          </div>
        )}

        {/* Sin resultados */}
        {!loading && query.trim() && results.length === 0 && (
          <div className="empty-state">
            <Package size={48} />
            <h3>Sin resultados</h3>
            <p>No se encontraron productos para "{query}"</p>
          </div>
        )}

        {/* Resultados */}
        {!loading && results.length > 0 && (
          <>
            <p className="results-count">{results.length} resultado{results.length !== 1 ? 's' : ''}</p>
            <div className="product-grid">
              {results.map((p) => (
                <ProductCard key={p.id_producto} producto={p} onDetail={handleDetail} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom sheet de detalle */}
      {detailLoading && selectedProduct && (
        <>
          <div className="modal-overlay active" />
          <div className="bottom-sheet active">
            <div className="bottom-sheet__handle" />
            <div className="bottom-sheet__header">
              <h2 className="bottom-sheet__title">Cargando...</h2>
            </div>
            <div className="bottom-sheet__body">
              <p style={{ textAlign: 'center', padding: '2rem' }}>Obteniendo detalle...</p>
            </div>
          </div>
        </>
      )}
      {detailData && (
        <ProductDetail producto={detailData} onClose={handleCloseDetail} />
      )}
    </div>
  );
}
