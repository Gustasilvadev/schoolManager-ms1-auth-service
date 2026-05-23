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


const logout = async (req, res) => {
  return res.status(HTTP_STATUS.OK).json({ message: 'Logout realizado com sucesso' });
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
    logout,
    verify
};