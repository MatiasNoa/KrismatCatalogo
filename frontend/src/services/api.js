// ============================================================
// api.js — Cliente HTTP para consumir el backend
// ============================================================
// Funciones para cada endpoint del módulo INVENTARIO.
// Todas las peticiones apuntan a /api (el proxy de Vite redirige
// a http://localhost:3000 en desarrollo).
//
// Uso:
//   import { productosApi } from '../services/api';
//   const productos = await productosApi.listar();
//   const producto = await productosApi.obtener(1);
// ============================================================

const BASE_URL = '/api';

// ------------------------------------------------------------
// request — función base para llamadas HTTP
// ------------------------------------------------------------
// Todas las funciones de api.js usan esta función internamente.
// Configura el Content-Type: application/json y parsea la
// respuesta. Si el backend devuelve error HTTP, lanza una
// excepción con el mensaje del servidor.
// ------------------------------------------------------------
async function request(url, options = {}) {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || 'Error de conexión');
  }

  return res.json();
}

// ------------------------------------------------------------
// productosApi — funciones para el módulo INVENTARIO
// ------------------------------------------------------------
export const productosApi = {
  // GET /api/productos — listar con filtros opcionales
  listar: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/productos${qs ? `?${qs}` : ''}`);
  },

  // GET /api/productos/buscar?q= — búsqueda en tiempo real
  buscar: (q) => request(`/productos/buscar?q=${encodeURIComponent(q)}`),

  // GET /api/productos/:id — detalle + compatibilidades
  obtener: (id) => request(`/productos/${id}`),

  // POST /api/productos — crear nuevo producto
  crear: (data) =>
    request('/productos', { method: 'POST', body: JSON.stringify(data) }),

  // PUT /api/productos/:id — actualizar producto existente
  actualizar: (id, data) =>
    request(`/productos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // PATCH /api/productos/:id/estado — activar o desactivar
  cambiarEstado: (id, estado) =>
    request(`/productos/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    }),

  // DELETE /api/productos/:id — eliminar (con protección)
  eliminar: (id) => request(`/productos/${id}`, { method: 'DELETE' }),

  // POST /api/productos/:id/compatibilidades — agregar compatible
  agregarCompatibilidad: (id, productoCompatibleId) =>
    request(`/productos/${id}/compatibilidades`, {
      method: 'POST',
      body: JSON.stringify({ producto_compatible_id: productoCompatibleId }),
    }),

  // DELETE /api/productos/:id/compatibilidades/:compatId — quitar compatible
  quitarCompatibilidad: (id, compatId) =>
    request(`/productos/${id}/compatibilidades/${compatId}`, {
      method: 'DELETE',
    }),
};
