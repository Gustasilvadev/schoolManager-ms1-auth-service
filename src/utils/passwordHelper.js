const bcrypt = require('bcryptjs');

/**
 * Gera um hash a partir de uma senha em texto puro.
 */
const hashPassword = (password) => {
  const saltRounds = 10;
  return bcrypt.hashSync(password, saltRounds);
};

/**
 * Compara uma senha em texto puro com um hash armazenado.
 */
const comparePassword = (password, hashedPassword) => {
  return bcrypt.compareSync(password, hashedPassword);
};

module.exports = { 
    hashPassword, 
    comparePassword 
};