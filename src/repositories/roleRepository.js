const prisma = require('../config/prisma');

const findByName = async (name) => {
  return await prisma.roles.findUnique({ where: { name } });
};


module.exports = { 
    findByName
};