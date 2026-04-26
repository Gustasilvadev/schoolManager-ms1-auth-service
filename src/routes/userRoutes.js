const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { validateCreateUser, validateUpdateUser, validateChangePassword } = require('../middlewares/validationMiddleware');

// Todas as rotas abaixo exigem autenticação
router.use(authMiddleware);

// Rota para qualquer usuário autenticado alterar sua própria senha
router.post('/changePassword', validateChangePassword, userController.changePassword);

// A partir daqui, apenas ADMIN
router.use(roleMiddleware(['ADMIN']));

router.get('/listUsers', userController.getAllUsers);
router.get('/listUserById/:id', userController.getUserById);
router.post('/createUser', validateCreateUser, userController.createUser);
router.put('/updateUserById/:id', validateUpdateUser, userController.updateUser);
router.delete('/deleteUserById/:id', userController.deleteUser);

module.exports = router;
