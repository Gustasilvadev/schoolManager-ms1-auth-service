const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateLogin } = require('../middlewares/validationMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/login', validateLogin, authController.login);
router.post('/logout', authMiddleware, authController.logout);
router.get('/verify', authController.verify);

module.exports = router;