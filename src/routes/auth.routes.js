const express = require('express');
const router = express.Router();
const { validateRegister } = require('../validations/auth.validation');

const authController = require('../controllers/auth.controller');

router.post('/register', validateRegister, authController.register);
router.post('/login', authController.login);

module.exports = router;
