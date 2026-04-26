const prisma = require('../config/prisma');

const findRolesByUserId = async (userId) => {
  const roleUsers = await prisma.role_users.findMany({
    where: { user_id: userId },
    include: { role_id: true }
  });
  return roleUsers.map(ru => ru.role);
};

const findOne = async (userId, roleId) => {
  return await prisma.role_users.findFirst({
    where: { user_id: userId, role_id: roleId }
  });
};

const assignRoleToUser = async (userId, roleId) => {
  const existing = await findOne(userId, roleId);
  if (existing) return existing;
  return await prisma.role_users.create({
    data: {
      user_id: userId,
      role_id: roleId
    }
  });
};

module.exports = {
  findRolesByUserId,
  assignRoleToUser
};