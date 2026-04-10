const prisma = require('../config/prisma');

const findByEmail = async (email) => {
  return await prisma.users.findUnique({
    where: { email },
    include: { role_users: { include: { role: true } } } 
  });
};

const findById = async (id) => {
  return await prisma.users.findUnique({
    where: { id },
    include: { role_users: { include: { role: true } } }
  });
};

const create = async (data) => {
  return await prisma.users.create({ data });
};

const update = async (id, data) => {
  return await prisma.users.update({
    where: { id },
    data
  });
};

const softDelete = async (id) => {
  return await prisma.users.update({
    where: { id },
    data: { status: 0 }
  });
};

module.exports = { 
    findByEmail, 
    findById, 
    create, 
    update, 
    softDelete 
};