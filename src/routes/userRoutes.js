const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { validateCreateUser, validateUpdateUser, validateChangePassword } = require('../middlewares/validationMiddleware');

router.use(authMiddleware);

const ADMIN_ONLY = roleMiddleware(['ADMIN']);
const ADMIN_OR_TEACHER = roleMiddleware(['ADMIN', 'TEACHER']);

router.post('/changePassword', ADMIN_OR_TEACHER, validateChangePassword, userController.changePassword);

router.get('/listUsers', ADMIN_ONLY, userController.getAllUsers);
router.get('/listUserById/:id', ADMIN_ONLY, userController.getUserById);
router.post('/createUser', ADMIN_ONLY, validateCreateUser, userController.createUser);
router.put('/updateUserById/:id', ADMIN_ONLY, validateUpdateUser, userController.updateUser);
router.delete('/deleteUserById/:id', ADMIN_ONLY, userController.deleteUser);
router.post('/restoreUserById/:id', ADMIN_ONLY, userController.restoreUser);

module.exports = router;
