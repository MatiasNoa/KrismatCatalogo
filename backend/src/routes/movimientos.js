// ============================================================
// routes/movimientos.js — Rutas del módulo MOVIMIENTOS
// ============================================================
// Define los endpoints y los conecta con el controlador.
// ============================================================

const { Router } = require('express');
const router = Router();
const ctrl = require('../controllers/movimientoController');

router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtener);
router.post('/', ctrl.crear);
router.delete('/:id', ctrl.eliminar);

module.exports = router;
