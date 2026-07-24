# Krismat — Plan de Desarrollo

Sistema de inventario para pisos para autos (5D y 8D).

---

## Stack

- Frontend: React 19 + Vite 8
- Backend: Express 5 + pg (PostgreSQL)
- Base de datos: PostgreSQL
- Iconos: lucide-react
- Fuente: Inter

---

## Orden de desarrollo por módulo

Cada módulo se desarrolla completo (backend → probar con Bruno → frontend → conectar → probar) antes de pasar al siguiente.

| Orden | Módulo | Depende de |
|-------|--------|------------|
| 1 | **INVENTARIO** | — |
| 2 | **BÚSQUEDA** | INVENTARIO |
| 3 | **MOVIMIENTOS** | INVENTARIO |
| 4 | **REPORTES** | INVENTARIO + MOVIMIENTOS |
| 5 | **IMPORTACIÓN** | INVENTARIO + MOVIMIENTOS |

### Alternativa (quick win visible)
1. BÚSQUEDA + INVENTARIO (creás producto → lo ves al instante)
2. MOVIMIENTOS → 3. REPORTES → 4. IMPORTACIÓN

---

## Flujo de trabajo por módulo

```
1. Backend: rutas + controladores + queries SQL
2. Probar endpoints con Bruno
3. Frontend: componentes + página
4. Conectar frontend con API
5. Prueba de caja negra (flujo completo)
```

## Convenciones

- Backend: CommonJS (`require`/`module.exports`)
- Frontend: ES Modules (`import`/`export`)
- Sin ORM — SQL directo con `pg`
- Sin TypeScript — JavaScript vanilla
- Nombres de rutas API: plurales, minúsculas, sin espacios

---

## Módulo 1 — INVENTARIO

**Backend:**
- CRUD productos (crear, editar, listar, buscar, activar/desactivar, eliminar)
- CRUD compatibilidades (agregar, quitar)

**Frontend:**
- InventarioPage: lista de productos con buscador y FAB
- ProductoFormPage: formulario reutilizable crear/editar
  - Campos: marca, modelo, rango de años, tipo (5D/8D), ubicación, observaciones, estado
  - En editar: sección de compatibilidades con buscador + agregar/eliminar

---

## Módulo 2 — BÚSQUEDA

**Backend:**
- GET /productos/buscar?q= — búsqueda en tiempo real por marca/modelo

**Frontend:**
- SearchBar con búsqueda mientras se escribe (debounce ~300ms)
- ProductCard: nombre, años, tipo, stock, ubicación, "Ver detalle"
  - Si stock = 0 y hay compatibilidad: muestra "Compatible disponible"
- ProductDetail (bottom sheet): info completa + compatibilidades + observaciones

---

## Módulo 3 — MOVIMIENTOS

**Backend:**
- POST /movimientos — registrar entrada/salida/ajuste con items
- Actualización automática de stock
- Validaciones: stock suficiente en salidas, motivo obligatorio en ajustes

**Frontend:**
- MovementTabs: Entrada / Salida / Ajuste
- Entrada/Salida: selector múltiple de productos con cantidad
- Ajuste: selector único + tipo (positivo/negativo) + motivo
- ProductPreview al seleccionar un producto

---

## Módulo 4 — REPORTES

**Backend:**
- GET /reportes/stock-bajo?umbral=N
- GET /reportes/sin-stock
- GET /reportes/inventario
- Solo productos activos

**Frontend:**
- ReportCard: 3 tarjetas seleccionables
- ThresholdFilter: input de umbral + botón filtrar
- ReportTable con resultados

---

## Módulo 5 — IMPORTACIÓN

**Backend:**
- POST /importacion/productos (carga inicial, crea productos si no existen)
- POST /importacion/movimientos (solo productos activos existentes)
- GET /importacion/plantilla/productos
- GET /importacion/plantilla/movimientos
- Validación de archivo antes de importar

**Frontend:**
- ImportSection: descargar plantilla → upload Excel → preview → importar
- FileUpload: drag & drop o click
- ImportPreview: tabla con datos parseados
