const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateLogin, validateRegister } = require('../middlewares/validationMiddleware');

router.post('/login', validateLogin, authController.login);
router.post('/register', validateRegister, authController.register);
router.get('/verify', authController.verify);

module.exports = router;