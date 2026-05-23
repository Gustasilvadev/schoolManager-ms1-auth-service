const { MESSAGES } = require('./constants');

const SERVICE_NAME = 'TeacherService';

const buildUrl = (path) => {
  const base = process.env.TEACHER_SERVICE_URL;
  if (!base) {
    throw new Error('TEACHER_SERVICE_URL não configurado');
  }
  return `${base.replace(/\/$/, '')}${path}`;
};

const fetchWithTimeout = async (url, authToken) => {
  const timeoutMs = parseInt(process.env.TEACHER_SERVICE_TIMEOUT_MS, 10) || 3000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: authToken ? { Authorization: authToken } : {}
    });
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Consulta o MS3 buscando um professor pelo CPF.
 */
const findTeacherByCpf = async (cpf, authToken) => {
  const url = buildUrl(`/teachers/byCpf/${encodeURIComponent(cpf)}`);
  let response;
  try {
    response = await fetchWithTimeout(url, authToken);
  } catch (err) {
    console.error(`[MS1->${SERVICE_NAME}] Falha ao consultar byCpf:`, err.message);
    throw new Error(MESSAGES.EXTERNAL_SERVICE_UNAVAILABLE);
  }

  if (response.status === 404) return null;
  if (!response.ok) {
    console.error(`[MS1->${SERVICE_NAME}] byCpf retornou HTTP ${response.status}`);
    throw new Error(MESSAGES.EXTERNAL_SERVICE_UNAVAILABLE);
  }
  return await response.json();
};

/**
 * Consulta o MS3 buscando um professor pelo e-mail.
 */
const findTeacherByEmail = async (email, authToken) => {
  const url = buildUrl(`/teachers/byEmail/${encodeURIComponent(email)}`);
  let response;
  try {
    response = await fetchWithTimeout(url, authToken);
  } catch (err) {
    console.error(`[MS1->${SERVICE_NAME}] Falha ao consultar byEmail:`, err.message);
    throw new Error(MESSAGES.EXTERNAL_SERVICE_UNAVAILABLE);
  }

  if (response.status === 404) return null;
  if (!response.ok) {
    console.error(`[MS1->${SERVICE_NAME}] byEmail retornou HTTP ${response.status}`);
    throw new Error(MESSAGES.EXTERNAL_SERVICE_UNAVAILABLE);
  }
  return await response.json();
};

/**
 * Consulta o MS3 buscando o teacher_id pelo user_id.
 * Sem authToken porque é chamado durante o login (token ainda não foi gerado).
 * O endpoint /teachers/byUser/:userId é interno — o API Gateway DEVE bloquear acesso externo.
 */
const findTeacherIdByUserId = async (userId) => {
  const url = buildUrl(`/teachers/byUser/${encodeURIComponent(userId)}`);
  let response;
  try {
    response = await fetchWithTimeout(url);
  } catch (err) {
    console.error(`[MS1->${SERVICE_NAME}] Falha ao consultar byUser:`, err.message);
    return null;
  }

  if (response.status === 404) return null;
  if (!response.ok) return null;
  const data = await response.json();
  return data?.teacher_id ?? null;
};

/**
 * Busca os dados completos do professor autenticado via GET /teachers/me.
 */
const findMyTeacher = async (authToken) => {
  const url = buildUrl('/teachers/me');
  let response;
  try {
    response = await fetchWithTimeout(url, authToken);
  } catch (err) {
    console.error(`[MS1->${SERVICE_NAME}] Falha ao consultar /me:`, err.message);
    throw new Error(MESSAGES.EXTERNAL_SERVICE_UNAVAILABLE);
  }

  if (response.status === 404) return null;
  if (!response.ok) {
    console.error(`[MS1->${SERVICE_NAME}] /me retornou HTTP ${response.status}`);
    throw new Error(MESSAGES.EXTERNAL_SERVICE_UNAVAILABLE);
  }
  return await response.json();
};

module.exports = { findTeacherByCpf, findTeacherByEmail, findTeacherIdByUserId, findMyTeacher };
