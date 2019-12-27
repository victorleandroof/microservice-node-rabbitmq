const express = require('express');
const router = express.Router();
const UsuairoController = require('./controllers/UsuarioController');


router.post('/usuario',UsuairoController.store);
router.get('/usuario',UsuairoController.index);

module.exports = router;