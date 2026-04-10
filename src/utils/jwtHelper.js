const jwt = require('jsonwebtoken');

/**
 * Gera um Access Token.
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h'
  });
};

/**
 * Verifica a validade de um token.
 */
const verifyToken = (token, secret = null) => {
  try {
    const usedSecret = secret || process.env.JWT_SECRET;
    return jwt.verify(token, usedSecret);
  } catch (error) {
    return false;
  }
};

/**
 * Extrai o token do header Authorization (Bearer token).
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1];
};

module.exports = {
  generateAccessToken,
  verifyToken,
  extractTokenFromHeader
};