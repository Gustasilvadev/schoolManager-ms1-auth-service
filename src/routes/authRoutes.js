const userRepo = require('../repositories/userRepository');
const roleRepo = require('../repositories/roleRepository');
const roleUserRepo = require('../repositories/roleUserRepository');
const { comparePassword, hashPassword } = require('../utils/passwordHelper');
const { generateAccessToken, verifyToken } = require('../utils/jwtHelper');
const { MESSAGES, ROLES } = require('../utils/constants');

/**
 * Realiza login do usuário, verificando email e senha, e retorna um token JWT se for bem-sucedido.
 */
const login = async (email, password) => {
  const user = await userRepo.findByEmail(email);
  if (!user || !comparePassword(password, user.password)) {
    throw new Error(MESSAGES.INVALID_CREDENTIALS);
  }
  const roleName = user.role_users?.role?.name;
  const payload = { id: user.id, email: user.email, role: roleName };
  const token = generateAccessToken(payload);

  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};


module.exports = { 
    login 
};