const userService = require('../services/userService');
const { HTTP_STATUS, MESSAGES, USER_STATUS } = require('../utils/constants');
const { formatUserResponse } = require('../utils/userFormatter');
const { findMyTeacher } = require('../utils/teachersClient');

const getMe = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user.id);
    const userFormatted = formatUserResponse(user);

    const teacher = await findMyTeacher(req.headers.authorization);

    return res.status(HTTP_STATUS.OK).json({ ...userFormatted, teacher: teacher ?? null });
  } catch (error) {
    if (error.message === MESSAGES.USER_NOT_FOUND) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: error.message });
    }
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, email, includeDeleted } = req.query;
    const filters = {};
    if (status !== undefined) filters.user_status = parseInt(status);
    if (email) filters.user_email = email;
    if (includeDeleted === 'true') filters.includeDeleted = true;

    const result = await userService.getAllUsers(filters, parseInt(page), parseInt(limit), req.user.role);
    const formattedUsers = result.users.map(formatUserResponse);
    return res.status(HTTP_STATUS.OK).json(formattedUsers);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(parseInt(id));
    return res.status(HTTP_STATUS.OK).json(formatUserResponse(user));
  } catch (error) {
    if (error.message === MESSAGES.USER_NOT_FOUND) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: error.message });
    }
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { email, password, status, role, teacher_name, teacher_cpf } = req.body;
    const userData = {
      user_email: email,
      user_password: password,
      user_status: status,
      teacher_name,
      teacher_cpf
    };
    const newUser = await userService.createUser(userData, role, req.headers.authorization);
    return res.status(HTTP_STATUS.CREATED).json(formatUserResponse(newUser));
  } catch (error) {
    if (
      error.message === MESSAGES.EMAIL_ALREADY_EXISTS ||
      error.message === MESSAGES.CPF_ALREADY_EXISTS ||
      error.message === MESSAGES.ROLE_NOT_FOUND
    ) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: error.message });
    }
    if (error.message === MESSAGES.EXTERNAL_SERVICE_UNAVAILABLE) {
      return res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({ error: error.message });
    }
    next(error);
  }
};


const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, status } = req.body;
    const updateData = {};
    if (email !== undefined) updateData.user_email = email;
    if (status !== undefined) updateData.user_status = status;

    const updated = await userService.updateUser(parseInt(id), updateData);
    return res.status(HTTP_STATUS.OK).json(formatUserResponse(updated));
  } catch (error) {
    if (error.message === MESSAGES.USER_NOT_FOUND) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: error.message });
    }
    if (error.message === MESSAGES.CANNOT_EDIT_DELETED) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: error.message });
    }
    next(error);
  }
};

const restoreUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restored = await userService.restoreUser(parseInt(id));
    return res.status(HTTP_STATUS.OK).json({
      message: MESSAGES.USER_RESTORED,
      user: formatUserResponse(restored)
    });
  } catch (error) {
    if (error.message === MESSAGES.USER_NOT_FOUND) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: error.message });
    }
    if (error.message === MESSAGES.NOT_DELETED_CANNOT_RESTORE) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: error.message });
    }
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await userService.deleteUser(parseInt(id));
    return res.status(HTTP_STATUS.OK).json({ message: USER_STATUS.DELETED });
  } catch (error) {
    if (error.message === MESSAGES.USER_NOT_FOUND) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: error.message });
    }
    next(error);
  }
};

/**
 * Lógica compartilhada de upload: o middleware handlePhotoUpload já garantiu req.file.
 */
const handleUserPhotoUpload = async (req, res, next, userId) => {
  try {
    const updated = await userService.uploadUserPhoto(userId, req.file.buffer);
    return res.status(HTTP_STATUS.OK).json(formatUserResponse(updated));
  } catch (error) {
    if (error.message === MESSAGES.USER_NOT_FOUND) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ error: error.message });
    }
    if (error.message === MESSAGES.CANNOT_EDIT_DELETED) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: error.message });
    }
    if (error.message === MESSAGES.EXTERNAL_SERVICE_UNAVAILABLE) {
      return res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({ error: error.message });
    }
    next(error);
  }
};

// Usuário autenticado troca a própria foto (id vem do token).
const uploadMyPhoto = async (req, res, next) => {
  return handleUserPhotoUpload(req, res, next, req.user.id);
};

// ADMIN troca a foto de qualquer usuário (id vem da rota).
const uploadUserPhoto = async (req, res, next) => {
  return handleUserPhotoUpload(req, res, next, parseInt(req.params.id));
};

const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;
    await userService.updatePassword(userId, oldPassword, newPassword);
    return res.status(HTTP_STATUS.OK).json({ message: USER_STATUS });
  } catch (error) {
    if (error.message === MESSAGES.USER_NOT_FOUND || error.message === MESSAGES.INVALID_CREDENTIALS) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: error.message });
    }
    next(error);
  }
};

module.exports = {
  getMe,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  restoreUser,
  changePassword,
  uploadMyPhoto,
  uploadUserPhoto
};