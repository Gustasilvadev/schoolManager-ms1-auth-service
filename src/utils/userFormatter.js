/**
 * Formata o usuário do banco removendo a senha e expondo apenas o nome do papel.
 */
const formatUserResponse = (user) => {
  const { user_password, role_users, ...userData } = user;
  const role = role_users?.[0]?.roles?.role_name ?? null;

  return {
    ...userData,
    role
  };
};

module.exports = { formatUserResponse };
