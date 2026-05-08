module.exports = {
  ROLES: {
    ADMIN: 'ADMIN',
    TEACHER: 'TEACHER'
  },
  USER_STATUS: {
    ACTIVE: 1,
    INACTIVE: 0,
    DELETED: 2
  },
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
  },
  MESSAGES: {
    INVALID_CREDENTIALS: 'E-mail ou senha inválidos',
    TOKEN_MISSING: 'Token não fornecido',
    TOKEN_INVALID: 'Token inválido ou expirado',
    USER_NOT_FOUND: 'Usuário não encontrado',
    EMAIL_ALREADY_EXISTS: 'E-mail já cadastrado',
    CPF_ALREADY_EXISTS: 'CPF já cadastrado',
    FORBIDDEN: 'Acesso negado: permissão insuficiente',
    ROLE_NOT_FOUND: 'Papel (role) não encontrado',
    EXTERNAL_SERVICE_UNAVAILABLE: 'Serviço externo indisponível'
  }
};