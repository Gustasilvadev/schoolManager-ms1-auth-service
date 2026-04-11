const { body, validationResult } = require('express-validator');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * Middleware genérico que verifica se há erros de validação.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ errors: errors.array() });
  }
  next();
};

// Validação para login
const validateLogin = [
  body('email').isEmail().withMessage('E-mail inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória'),
  validate
];

// Validação para registro público
const validateRegister = [
  body('email').isEmail().withMessage('E-mail inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
  validate
];

// Validação para criação de usuário (admin)
const validateCreateUser = [
  body('email').isEmail().withMessage('E-mail inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
  body('status').optional().isInt({ min: 0, max: 2 }).withMessage('Status deve ser 0, 1 ou 2'),
  body('role').optional().isIn(['ADMIN', 'TEACHER']).withMessage('Role deve ser ADMIN ou TEACHER'),
  validate
];

// Validação para atualização de usuário
const validateUpdateUser = [
  body('email').optional().isEmail().withMessage('E-mail inválido'),
  body('status').optional().isInt({ min: 0, max: 2 }).withMessage('Status deve ser 0, 1 ou 2'),
  validate
];

// Validação para troca de senha
const validateChangePassword = [
  body('oldPassword').notEmpty().withMessage('Senha atual é obrigatória'),
  body('newPassword').isLength({ min: 6 }).withMessage('Nova senha deve ter no mínimo 6 caracteres'),
  validate
];

module.exports = {
  validateLogin,
  validateRegister,
  validateCreateUser,
  validateUpdateUser,
  validateChangePassword
};