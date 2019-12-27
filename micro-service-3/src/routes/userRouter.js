const express = require('express');
const { index, create, retrieve, update, destroy }  = require('../controllers/userController');
const verifyJWT  = require('../middlewares/verifyJWT');

const router = express.Router();

router.use(verifyJWT(['admin']));

router.get('/', index);
router.post('/', create);
router.get('/:id', retrieve);
router.put('/:id', update);
router.delete('/:id', destroy);

module.exports = router;
