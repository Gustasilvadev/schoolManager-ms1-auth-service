const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { validateCreateUser, validateUpdateUser, validateChangePassword } = require('../middlewares/validationMiddleware');

// Todas as rotas abaixo exigem autenticação
router.use(authMiddleware);

// Rotas apenas para ADMIN
router.get('/listUsers', roleMiddleware(['ADMIN']), userController.getAllUsers);
router.get('/listUserById/:id', roleMiddleware(['ADMIN']), userController.getUserById);
router.post('/createUser', roleMiddleware(['ADMIN']), validateCreateUser, userController.createUser);
router.put('/updateUserById/:id', roleMiddleware(['ADMIN']), validateUpdateUser, userController.updateUser);
router.delete('/deleteUserById/:id', roleMiddleware(['ADMIN']), userController.deleteUser);

// Rota para qualquer usuário autenticado alterar sua própria senha
router.post('/changePassword', validateChangePassword, userController.changePassword);

module.exports = router;
