// ============================================================
// ProductoFormPage — Página de crear/editar producto
// ============================================================
// Envuelve al componente ProductForm y maneja la carga de datos
// cuando se edita un producto existente.
//
// Si la ruta tiene :id → carga el producto desde la API y lo
// pasa al formulario. Si no tiene :id → formulario vacío para
// crear un nuevo producto.
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productosApi } from '../services/api';
import ProductForm from '../components/Inventario/ProductForm';

export default function ProductoFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(isEdit);

  // Si es edición, cargar el producto al montar el componente
  useEffect(() => {
    if (isEdit) {
      productosApi
        .obtener(id)
        .then(setProducto)
        .catch(() => navigate('/inventario'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, navigate]);

  // Callback después de guardar exitosamente
  const handleSave = () => {
    navigate('/inventario');
  };

  if (loading) {
    return (
      <div className="loading-state">
        <span>Cargando producto...</span>
      </div>
    );
  }

  return (
    <>
      <h2 className="page-form__title">
        {isEdit ? 'Editar producto' : 'Nuevo producto'}
      </h2>
      <ProductForm producto={producto} onSave={handleSave} />
    </>
  );
}
