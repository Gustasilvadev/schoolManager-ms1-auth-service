const { MESSAGES } = require('./constants');

const SERVICE_NAME = 'TeacherService';

const buildUrl = (path) => {
  const base = process.env.TEACHER_SERVICE_URL;
  if (!base) {
    throw new Error('TEACHER_SERVICE_URL não configurado');
  }
  return `${base.replace(/\/$/, '')}${path}`;
};

const fetchWithTimeout = async (url) => {
  const timeoutMs = parseInt(process.env.TEACHER_SERVICE_TIMEOUT_MS, 10) || 3000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { method: 'GET', signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Consulta o MS3 buscando um professor pelo CPF.
 */
const findTeacherByCpf = async (cpf) => {
  const url = buildUrl(`/teachers/byCpf/${encodeURIComponent(cpf)}`);
  let response;
  try {
    response = await fetchWithTimeout(url);
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
const findTeacherByEmail = async (email) => {
  const url = buildUrl(`/teachers/byEmail/${encodeURIComponent(email)}`);
  let response;
  try {
    response = await fetchWithTimeout(url);
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

module.exports = { findTeacherByCpf, findTeacherByEmail };
