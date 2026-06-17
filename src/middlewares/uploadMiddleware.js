const multer = require('multer');
const { HTTP_STATUS, MESSAGES } = require('../utils/constants');

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// memoryStorage mantém o arquivo em req.file.buffer (RAM) — nunca grava no disco do container.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(null, true);
  }
  const error = new Error(MESSAGES.INVALID_FILE_TYPE);
  error.code = 'INVALID_FILE_TYPE';
  return cb(error, false);
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter
});

// Aceita um único arquivo no campo 'photo' do multipart/form-data.
const uploadSinglePhoto = upload.single('photo');

/**
 * Executa o multer e traduz seus erros em respostas JSON padronizadas (HTTP_STATUS/MESSAGES),
 * evitando que o erro "vaze" para o errorHandler genérico. Em sucesso, garante que um arquivo
 * foi de fato enviado antes de seguir para o controller.
 */
const handlePhotoUpload = (req, res, next) => {
  uploadSinglePhoto(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(HTTP_STATUS.PAYLOAD_TOO_LARGE).json({ error: MESSAGES.FILE_TOO_LARGE });
      }
      if (err.code === 'INVALID_FILE_TYPE') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: MESSAGES.INVALID_FILE_TYPE });
      }
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: MESSAGES.UPLOAD_ERROR });
    }

    if (!req.file) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: MESSAGES.NO_FILE_PROVIDED });
    }

    next();
  });
};

module.exports = { handlePhotoUpload };
