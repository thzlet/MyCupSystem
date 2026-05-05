/* ============================================================
   js/auth.js — Login, Cadastro, Token JWT e navegação de telas
   Diário Digital Copa 2026
   ============================================================

   ENDPOINTS USADOS:
     POST /api/usuarios/login
       body:    { email, senha }
       sucesso: { mensagem, token, usuario: { idUsuario, nome } }
       erro:    401 { mensagem: "E-mail ou senha inválidos." }

     POST /api/usuarios/criar
       body:    { nome, email, senha }
       sucesso: 201 { mensagem, id }
       erro:    409 { mensagem: "Este e-mail já está cadastrado." }
*/

/* ── INICIALIZAÇÃO ─────────────────────────────────────────── */

// se já existe um token salvo e ainda é válido, vai direto para o app
document.addEventListener('DOMContentLoaded', () => {
  if (getToken()) {
    showPage('app');
  }
});

/* ── NAVEGAÇÃO ENTRE TELAS ─────────────────────────────────── */

function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
  window.scrollTo(0, 0);
}

/* ── ABAS LOGIN / CADASTRO ─────────────────────────────────── */

function switchTab(tab) {
  // atualiza botões de aba
  document.getElementById('tab-login').classList.toggle('active',    tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');

  // mostra o formulário correto
  document.getElementById('form-login').classList.toggle('active',    tab === 'login');
  document.getElementById('form-register').classList.toggle('active', tab === 'register');

  // limpa erros ao trocar de aba
  hideError('login-error');
  hideError('register-error');
}

/* ── TOGGLE MOSTRAR/ESCONDER SENHA ─────────────────────────── */

function togglePw(inputId, btn) {
  const input = document.getElementById(inputId);
  const isText = input.type === 'text';
  input.type = isText ? 'password' : 'text';
  btn.textContent = isText ? '👁' : '🙈';
}

/* ── HELPERS DE UI ─────────────────────────────────────────── */

function showError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.remove('hide');
}

function hideError(id) {
  const el = document.getElementById(id);
  el.classList.add('hide');
  el.textContent = '';
}

function setLoading(btnId, loading) {
  const btn   = document.getElementById(btnId);
  const label = btn.querySelector('.btn-label');
  const spin  = btn.querySelector('.btn-loading');
  btn.disabled = loading;
  label.classList.toggle('hide', loading);
  spin.classList.toggle('hide', !loading);
}

/* ── ARMAZENAMENTO DO TOKEN ────────────────────────────────── */

function saveToken(token, usuario) {
  localStorage.setItem('token',   token);
  localStorage.setItem('usuario', JSON.stringify(usuario));
}

function getToken() {
  return localStorage.getItem('token');
}

function getUsuario() {
  const raw = localStorage.getItem('usuario');
  return raw ? JSON.parse(raw) : null;
}

/**
 * Logout: remove o token e volta para a tela de login.
 * Chame esta função no botão "Sair" do app:
 *   <button onclick="logout()">Sair</button>
 */
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  showPage('auth');
}

/* ── LOGIN ─────────────────────────────────────────────────── */

async function handleLogin(event) {
  event.preventDefault();
  hideError('login-error');
  setLoading('btn-login', true);

  const email = document.getElementById('login-email').value.trim();
  const senha = document.getElementById('login-password').value;

  try {
    // POST /api/usuarios/login
    const { ok, status, data } = await apiFetch('/api/usuarios/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });

    if (ok) {
      // salva token e dados do usuário
      saveToken(data.token, data.usuario);
      showPage('app');
    } else if (status === 401) {
      showError('login-error', data?.mensagem || 'E-mail ou senha inválidos.');
    } else {
      showError('login-error', 'Erro inesperado. Tente novamente.');
    }

  } catch (err) {
    // erro de rede (API offline, CORS, etc.)
    showError('login-error', 'Não foi possível conectar à API. Verifique se o servidor está rodando.');
    console.error('[auth] Erro de rede no login:', err);
  } finally {
    setLoading('btn-login', false);
  }
}

/* ── CADASTRO ──────────────────────────────────────────────── */

async function handleRegister(event) {
  event.preventDefault();
  hideError('register-error');

  const nome     = document.getElementById('reg-nome').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const senha    = document.getElementById('reg-senha').value;
  const confirma = document.getElementById('reg-confirma').value;

  // validação local: senhas conferem?
  if (senha !== confirma) {
    showError('register-error', 'As senhas não coincidem.');
    return;
  }

  setLoading('btn-register', true);

  try {
    // POST /api/usuarios/criar
    const { ok, status, data } = await apiFetch('/api/usuarios/criar', {
      method: 'POST',
      body: JSON.stringify({ nome, email, senha }),
    });

    if (ok) {
      // conta criada! leva para o login com mensagem de sucesso
      switchTab('login');
      // preenche o e-mail automaticamente para facilitar
      document.getElementById('login-email').value = email;
      // mostra mensagem de sucesso no campo de erro do login (com estilo diferente)
      const el = document.getElementById('login-error');
      el.textContent = '✅ Conta criada! Agora é só entrar.';
      el.classList.remove('hide');
      el.style.background = '#e8f5e9';
      el.style.color = '#2e7d32';
      el.style.borderColor = 'rgba(46,125,50,0.25)';
    } else if (status === 409) {
      showError('register-error', data?.mensagem || 'Este e-mail já está cadastrado.');
    } else if (status === 400) {
      // erros de validação do ModelState
      const erros = data?.errors
        ? Object.values(data.errors).flat().join(' ')
        : data?.mensagem || 'Dados inválidos.';
      showError('register-error', erros);
    } else {
      showError('register-error', 'Erro inesperado. Tente novamente.');
    }

  } catch (err) {
    showError('register-error', 'Não foi possível conectar à API. Verifique se o servidor está rodando.');
    console.error('[auth] Erro de rede no cadastro:', err);
  } finally {
    setLoading('btn-register', false);
  }
}