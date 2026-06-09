/* ============================================================
   js/api.js — Configuração da API e função de fetch centralizada
   ============================================================
*/

const API_BASE_URL = 'https://diariocopa-backend.onrender.com'; // ← trocar pela nossa porta

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

/**
 * Faz upload de uma imagem para uma experiência via Cloudinary.
 * O backend recebe o idExperiencia e o arquivo, envia ao Cloudinary
 * e retorna a URL pública da imagem.
 *
 * @param {string} experienciaId  ID da experiência
 * @param {File}   arquivo        Arquivo de imagem selecionado pelo usuário
 * @returns {Promise<{ok: boolean, status: number, data: any}>}
 */
async function apiUploadImagem(experienciaId, arquivo) {
  const token = localStorage.getItem('token');

  const formData = new FormData();
  formData.append('imagem', arquivo);

  const response = await fetch(`${API_BASE_URL}/api/experiencias/${experienciaId}/imagem`, {
    method: 'POST',
    headers: {
      // NÃO definir Content-Type aqui: o browser gera automaticamente
      // o boundary correto do multipart/form-data
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: formData,
  });

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