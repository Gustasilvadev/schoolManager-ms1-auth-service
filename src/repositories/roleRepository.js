const prisma = require('../config/prisma');

/**
 * Busca um papel pelo nome (role_name)
 */
const findByName = async (name) => {
  return await prisma.roles.findUnique({
    where: { role_name: name }
  });
};


module.exports = { 
    findByName
};