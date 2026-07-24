// ============================================================
// InventarioPage — Página principal del módulo INVENTARIO
// ============================================================
// Muestra la lista de productos con buscador en tiempo real.
// Contiene un FAB (botón flotante) para crear nuevos productos.
//
// La búsqueda tiene debounce de 300ms: si el texto tiene 2+
// caracteres, se usa el endpoint de búsqueda; si está vacío,
// se listan todos los productos.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { productosApi } from '../services/api';
import ProductList from '../components/Inventario/ProductList';

export default function InventarioPage() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Cargar productos desde la API
  const loadProductos = useCallback(async (q) => {
    try {
      setLoading(true);
      const data = q
        ? await productosApi.buscar(q)
        : await productosApi.listar();
      setProductos(data);
    } catch {
      setProductos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Efecto para búsqueda con debounce
  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      const timer = setTimeout(() => loadProductos(searchTerm), 300);
      return () => clearTimeout(timer);
    }
    loadProductos('');
  }, [searchTerm, loadProductos]);

  // Navegar al formulario de edición
  const handleEdit = (producto) => {
    navigate(`/inventario/editar/${producto.id_producto}`);
  };

  return (
    <>
      <ProductList
        productos={productos}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onEdit={handleEdit}
        loading={loading}
      />

      {/* Botón flotante para crear nuevo producto */}
      <button
        className="fab"
        onClick={() => navigate('/inventario/crear')}
        aria-label="Crear producto"
      >
        <Plus size={24} />
      </button>
    </>
  );
}
