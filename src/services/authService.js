const bcrypt = require('bcryptjs'); 
const userRepo = require('../repositories/userRepository');
const roleRepo = require('../repositories/roleRepository');
const roleUserRepo = require('../repositories/roleUserRepository');
const { comparePassword, hashPassword } = require('../utils/passwordHelper');
const { generateAccessToken, verifyToken } = require('../utils/jwtHelper');
const { MESSAGES, ROLES, USER_STATUS } = require('../utils/constants');

/**
 * Realiza login do usuário, verificando email e senha, e retorna um token JWT se for bem-sucedido.
 */
const login = async (email, password) => {
  // Usa o findByEmail original (que já inclui user_password e role_users)
  const user = await userRepo.findByEmail(email);

  if (!user || !comparePassword(password, user.user_password)) {
    throw new Error(MESSAGES.INVALID_CREDENTIALS);
  }
  if (user.user_status !== USER_STATUS.ACTIVE) {
    throw new Error(MESSAGES.USER_NOT_FOUND);
  }

  // Extrai o nome do papel (primeiro papel associado)
  const roleName = user.role_users?.[0]?.roles?.role_name || null;
  const payload = { id: user.user_id, email: user.user_email, role: roleName };
  const token = generateAccessToken(payload);

  return {
    user: {
      user_id: user.user_id,
      user_email: user.user_email,
      role: roleName,
      user_status: user.user_status
    },
    token
  };
};

/**
 * Registra um novo usuário
 */
const register = async (userData, roleName = ROLES.TEACHER) => {
  const existing = await userRepo.findByEmail(userData.user_email);
  if (existing) throw new Error(MESSAGES.EMAIL_ALREADY_EXISTS);

  const hashedPassword = hashPassword(userData.user_password);
  const newUser = await userRepo.create({
    user_email: userData.user_email,
    user_password: hashedPassword,
    user_status: USER_STATUS.ACTIVE
  });

  const role = await roleRepo.findByName(roleName);
  if (!role) throw new Error(MESSAGES.ROLE_NOT_FOUND);
  await roleUserRepo.assignRoleToUser(newUser.user_id, role.role_id);

  return {
    user: {
      user_id: newUser.user_id,
      user_email: newUser.user_email,
      user_status: newUser.user_status
    }
  };
};

/**
 * Verifica a validade de um token JWT
 */
const verifyTokenService = (token) => {
  return verifyToken(token);
};

module.exports = { login, register, verifyToken: verifyTokenService };