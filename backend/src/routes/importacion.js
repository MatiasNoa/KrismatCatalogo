const { Router } = require('express');
const router = Router();
const ctrl = require('../controllers/importacionController');

router.post('/preview', ctrl.previsualizar);
router.post('/confirm', ctrl.confirmar);

module.exports = router;
