const prisma = require('../config/prisma');
const userRepo = require('../repositories/userRepository');
const roleRepo = require('../repositories/roleRepository');
const roleUserRepo = require('../repositories/roleUserRepository');
const { hashPassword, comparePassword } = require('../utils/passwordHelper');
const { MESSAGES, ROLES, USER_STATUS, HTTP_STATUS } = require('../utils/constants');

const createUser = async (userData, roleName = ROLES.TEACHER) => {
  const existing = await userRepo.findByEmail(userData.user_email);
  if (existing) {
    throw new Error(MESSAGES.EMAIL_ALREADY_EXISTS);
  }
  const hashedPassword = hashPassword(userData.user_password);
  const newUser = await userRepo.create({
    user_email: userData.user_email,
    user_password: hashedPassword,
    user_status: userData.user_status !== undefined ? userData.user_status : USER_STATUS.ACTIVE
  });

  const role = await roleRepo.findByName(roleName);

  if (!role) {
    throw new Error(MESSAGES.ROLE_NOT_FOUND);
  }
  await roleUserRepo.assignRoleToUser(newUser.user_id, role.role_id);
  return newUser;
};

const getAllUsers = async (filters = {}, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const where = {};
  if (filters.user_status !== undefined) where.user_status = filters.user_status;
  if (filters.user_email) where.user_email = { contains: filters.user_email };

  const users = await prisma.users.findMany({
    where,
    skip,
    take: limit,
    include: {
      role_users: {
        include: { roles: true }
      }
    }
  });

  const total = await prisma.users.count({ where });
  return { users, total, page, limit };
};

const getUserById = async (id) => {
  const user = await userRepo.findById(id);
  if (!user) throw new Error(MESSAGES.USER_NOT_FOUND);
  return user;
};

const updateUser = async (id, updateData) => {
  if (updateData.user_password) delete updateData.user_password;
  const updated = await userRepo.update(id, updateData);
  if (!updated) throw new Error(MESSAGES.USER_NOT_FOUND);
  return updated;
};

const deleteUser = async (id) => {
  const user = await userRepo.findById(id);
  if (!user) throw new Error(MESSAGES.USER_NOT_FOUND);
  await userRepo.softDelete(id);
  return true;
};

const updatePassword = async (id, oldPassword, newPassword) => {
  const user = await userRepo.findById(id);
  if (!user) throw new Error(MESSAGES.USER_NOT_FOUND);
  if (!comparePassword(oldPassword, user.user_password)) {
    throw new Error(MESSAGES.INVALID_CREDENTIALS);
  }
  const hashedNew = hashPassword(newPassword);
  await userRepo.update(id, { user_password: hashedNew });
  return true;
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updatePassword
};