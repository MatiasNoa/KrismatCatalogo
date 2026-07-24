// ============================================================
// productos.js — Definición de rutas del módulo INVENTARIO
// ============================================================
//
// Cada ruta solo define:
//   - Método HTTP (GET, POST, PUT, PATCH, DELETE)
//   - Path relativo (/)
//   - Controlador que maneja la lógica
//
// La lógica de negocio y las consultas SQL están en:
//   controllers/productoController.js
//
// Endpoints:
//
//   GET    /                            Listar (con filtros)
//   GET    /buscar?q=texto              Búsqueda por marca/modelo
//   GET    /:id                         Obtener uno + compatibilidades
//   POST   /                            Crear
//   PUT    /:id                         Editar
//   PATCH  /:id/estado                  Activar/Desactivar
//   DELETE /:id                         Eliminar (solo sin movimientos)
//   POST   /:id/compatibilidades        Agregar compatibilidad
//   DELETE /:id/compatibilidades/:cid   Quitar compatibilidad
// ============================================================

const { Router } = require('express');
const controller = require('../controllers/productoController');

const router = Router();

router.get('/',                  controller.listar);
router.get('/buscar',            controller.buscar);
router.get('/:id',               controller.obtener);
router.post('/',                 controller.crear);
router.put('/:id',               controller.actualizar);
router.patch('/:id/estado',      controller.cambiarEstado);
router.delete('/:id',            controller.eliminar);
router.post('/:id/compatibilidades',        controller.agregarCompatibilidad);
router.delete('/:id/compatibilidades/:cid', controller.quitarCompatibilidad);

module.exports = router;
