const authService = require('../services/authService');
const { HTTP_STATUS, MESSAGES } = require('../utils/constants');


const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    if (error.message === MESSAGES.INVALID_CREDENTIALS) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: error.message });
    }
    if (error.message === MESSAGES.USER_NOT_FOUND) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: error.message });
    }
    next(error);
  }
};


const register = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const result = await authService.register({ user_email: email, user_password: password }, role);
    return res.status(HTTP_STATUS.CREATED).json(result);
  } catch (error) {
    if (error.message === MESSAGES.EMAIL_ALREADY_EXISTS) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: error.message });
    }
    if (error.message === MESSAGES.ROLE_NOT_FOUND) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: error.message });
    }
    next(error);
  }
};


const verify = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: MESSAGES.TOKEN_MISSING });
    }
    const token = authHeader.split(' ')[1];
    const payload = authService.verifyToken(token);
    if (!payload) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: MESSAGES.TOKEN_INVALID });
    }
    return res.status(HTTP_STATUS.OK).json({ valid: true, payload });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
    login, 
    register, 
    verify 
};