/* ============================================================
   js/api.js — Configuração da API e função de fetch centralizada
   ============================================================
*/

const API_BASE_URL = 'http://localhost:5225'; // ← trocar pela nossa porta

/**
 * faz uma requisição autenticada (ou não) para a API.
 *
 * @param {string} endpoint  Ex: '/api/usuarios/login'
 * @param {object} options   Opções do fetch (method, body, etc.)
 * @returns {Promise<{ok: boolean, status: number, data: any}>}
 */
async function apiFetch(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // se houver token salvo, inclui no header Authorization
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // tenta parsear o JSON de resposta (pode estar vazio em alguns casos)
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}