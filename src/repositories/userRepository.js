const prisma = require('../config/prisma');
const { USER_STATUS } = require('../utils/constants');

const findByEmail = async (email) => {
  return await prisma.users.findUnique({
    where: { user_email: email },
    include: { role_users: { include: { roles: true } } }
  });
};

const findById = async (id) => {
  return await prisma.users.findUnique({
    where: { user_id: id },
    include: { role_users: { include: { roles: true } } }
  });
};

const create = async (data) => {
  return await prisma.users.create({
    data: {
      user_email: data.user_email,
      user_password: data.user_password,
      user_status: data.user_status !== undefined ? data.user_status : USER_STATUS.ACTIVE,
    }
  });
};

const update = async (id, data) => {
  const updateData = {};
  if (data.user_email !== undefined) updateData.user_email = data.user_email;
  if (data.user_password !== undefined) updateData.user_password = data.user_password;
  if (data.user_status !== undefined) updateData.user_status = data.user_status;
  return await prisma.users.update({
    where: { user_id: id },
    data: updateData
  });
};

const softDelete = async (id) => {
  return await prisma.users.update({
    where: { user_id: id },
    data: { user_status: USER_STATUS.DELETED }
  });
};

module.exports = { 
    findByEmail, 
    findById, 
    create, 
    update, 
    softDelete
};