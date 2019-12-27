const express = require('express');
const { create } = require('../controllers/userController');
const { login, forgotPassword, resetPassword, logout, verify} = require('../controllers/authController');
const verifyJWT = require('../middlewares/verifyJWT');

const router = express.Router();

router.post('/register', create);
router.post('/login', login);
router.post('/forgot', forgotPassword);
router.post('/reset/:id', resetPassword);
router.post('/logout', verifyJWT(['user', 'admin']), logout);
router.post('/verify', verifyJWT(['user', 'admin']), verify);

module.exports = router;
