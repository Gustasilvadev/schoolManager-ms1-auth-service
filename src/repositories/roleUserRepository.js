const prisma = require('../config/prisma');

const findRolesByUserId = async (userId) => {
  const roleUsers = await prisma.role_users.findMany({
    where: { user_id: userId },
    include: { role: true }
  });
  return roleUsers.map(ru => ru.role);
};

module.exports = { 
  findRolesByUserId
};