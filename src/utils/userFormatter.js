/**
 * Formata o objeto de usuário retornado pelo banco para o contrato da API.
 */
const formatUserResponse = (user) => {
  const { user_password, role_users, ...userData } = user;
  const roles = role_users 
    ? role_users.map(ru => ru.roles) 
    : [];

  return {
    ...userData,
    roles
  };
};

module.exports = { formatUserResponse };
