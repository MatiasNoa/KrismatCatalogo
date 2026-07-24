// ============================================================
// ProductForm — Formulario de crear/editar producto
// ============================================================
// Componente reutilizable para crear y editar productos.
// Recibe "producto" como prop: si existe → modo edición,
// si es null → modo creación.
//
// En modo edición muestra:
//   - Todos los campos precargados
//   - Sección de compatibilidades (CompatManager)
//   - Botón para activar/desactivar
//
// En modo creación:
//   - Campos vacíos
//   - Select de estado (ACTIVO/INACTIVO)
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import { productosApi } from '../../services/api';
import CompatManager from './CompatManager';

export default function ProductForm({ producto, onSave }) {
  const navigate = useNavigate();
  const isEdit = !!producto; // Si tiene datos → está editando

  // Estado del formulario
  const [form, setForm] = useState({
    marca: producto?.marca || '',
    modelo: producto?.modelo || '',
    anio: producto?.anio || '',
    tipo: producto?.tipo || '',
    ubicacion: producto?.ubicacion || '',
    observaciones: producto?.observaciones || '',
    estado: producto?.estado || 'ACTIVO',
  });

  const [saving, setSaving] = useState(false);
  const [compatibilidades, setCompatibilidades] = useState(
    producto?.compatibilidades || []
  );
  const [error, setError] = useState('');

  // Actualiza un campo del formulario según su name
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Enviar formulario (crear o actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validar campos obligatorios
    if (!form.marca || !form.modelo || !form.anio || !form.tipo) {
      setError('Completa los campos obligatorios: marca, modelo, años y tipo');
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await productosApi.actualizar(producto.id_producto, form);
      } else {
        await productosApi.crear(form);
      }
      onSave(); // Callback para redirigir después de guardar
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Alternar entre ACTIVO e INACTIVO (solo en edición)
  const handleToggleEstado = async () => {
    const nuevoEstado = form.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    try {
      await productosApi.cambiarEstado(producto.id_producto, nuevoEstado);
      setForm({ ...form, estado: nuevoEstado });
    } catch (err) {
      alert(err.message);
    }
  };

  // Recargar compatibilidades desde la API
  const reloadCompatibilidades = async () => {
    try {
      const data = await productosApi.obtener(producto.id_producto);
      setCompatibilidades(data.compatibilidades || []);
    } catch {
      // Si falla, mantener la lista actual
    }
  };

  return (
    <form className="page-form" onSubmit={handleSubmit}>
      {/* Mensaje de error */}
      {error && (
        <div
          style={{
            color: 'var(--color-danger)',
            fontSize: 'var(--font-size-sm)',
            marginBottom: 'var(--spacing-lg)',
          }}
        >
          {error}
        </div>
      )}

      {/* Marca */}
      <div className="form-group">
        <label className="form-label" htmlFor="marca">
          Marca
        </label>
        <input
          type="text"
          className="form-input"
          id="marca"
          name="marca"
          placeholder="Ej: Toyota"
          value={form.marca}
          onChange={handleChange}
        />
      </div>

      {/* Modelo */}
      <div className="form-group">
        <label className="form-label" htmlFor="modelo">
          Modelo
        </label>
        <input
          type="text"
          className="form-input"
          id="modelo"
          name="modelo"
          placeholder="Ej: Corolla"
          value={form.modelo}
          onChange={handleChange}
        />
      </div>

      {/* Años */}
      <div className="form-group">
        <label className="form-label" htmlFor="anio">
          Años
        </label>
        <input
          type="text"
          className="form-input"
          id="anio"
          name="anio"
          placeholder="Ej: 2015–2020"
          value={form.anio}
          onChange={handleChange}
        />
      </div>

      {/* Tipo (5D / 8D) */}
      <div className="form-group">
        <label className="form-label" htmlFor="tipo">
          Tipo
        </label>
        <select
          className="form-select"
          id="tipo"
          name="tipo"
          value={form.tipo}
          onChange={handleChange}
        >
          <option value="">Seleccionar tipo...</option>
          <option value="5D">5D</option>
          <option value="8D">8D</option>
        </select>
      </div>

      {/* Ubicación */}
      <div className="form-group">
        <label className="form-label" htmlFor="ubicacion">
          Ubicación
        </label>
        <input
          type="text"
          className="form-input"
          id="ubicacion"
          name="ubicacion"
          placeholder="Ej: A1-02"
          value={form.ubicacion}
          onChange={handleChange}
        />
      </div>

      {/* Observaciones */}
      <div className="form-group">
        <label className="form-label" htmlFor="observaciones">
          Observaciones
        </label>
        <textarea
          className="form-textarea"
          id="observaciones"
          name="observaciones"
          rows="3"
          placeholder="Notas adicionales..."
          value={form.observaciones}
          onChange={handleChange}
        />
      </div>

      {/* Estado — solo en creación (select) */}
      {!isEdit && (
        <div className="form-group">
          <label className="form-label" htmlFor="estado">
            Estado
          </label>
          <select
            className="form-select"
            id="estado"
            name="estado"
            value={form.estado}
            onChange={handleChange}
          >
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
          </select>
        </div>
      )}

      {/* Estado — solo en edición (badge + botón toggle) */}
      {isEdit && (
        <div className="form-group">
          <label className="form-label">Estado</label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-md)',
            }}
          >
            <span
              className={`badge ${
                form.estado === 'ACTIVO' ? 'badge--stock' : 'badge--inactive'
              }`}
            >
              {form.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
            </span>
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={handleToggleEstado}
            >
              {form.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        </div>
      )}

      {/* Sección de compatibilidades (solo en edición) */}
      {isEdit && (
        <CompatManager
          productoId={producto.id_producto}
          compatibilidades={compatibilidades}
          onUpdate={reloadCompatibilidades}
        />
      )}

      {/* Botones: Cancelar y Guardar */}
      <div className="form-actions">
        <button
          type="button"
          className="btn btn--secondary btn--lg"
          onClick={() => navigate(-1)}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn--primary btn--lg"
          disabled={saving}
        >
          <Save size={16} />
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
