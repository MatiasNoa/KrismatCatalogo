const { Router } = require('express');
const router = Router();
const ctrl = require('../controllers/reporteController');

router.get('/resumen', ctrl.resumen);
router.get('/stock', ctrl.stock);
router.get('/movimientos', ctrl.movimientos);

module.exports = router;
