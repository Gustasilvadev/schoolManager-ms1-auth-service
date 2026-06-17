const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configuração única do SDK, lida das variáveis injetadas pelo Infisical em runtime.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Envia um buffer de imagem (memória) diretamente para o Cloudinary, sem tocar o disco.
 *
 * Usa public_id determinístico + overwrite para que cada entidade tenha um único
 * asset, sobrescrito a cada nova foto (sem assets órfãos e sem coluna extra de public_id).
 *
 * @param {Buffer} buffer - conteúdo do arquivo (req.file.buffer do multer em memória).
 * @param {object} options
 * @param {string} options.folder - pasta no Cloudinary (ex.: 'schoolmanager/users').
 * @param {string} options.publicId - identificador determinístico (ex.: '123').
 * @returns {Promise<object>} resultado do Cloudinary (inclui secure_url e public_id).
 */
const uploadImageBuffer = (buffer, { folder, publicId }) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: String(publicId),
        overwrite: true,
        invalidate: true,
        resource_type: 'image',
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'auto' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

module.exports = { cloudinary, uploadImageBuffer };
