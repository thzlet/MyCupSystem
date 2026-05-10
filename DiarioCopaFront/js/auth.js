/**
 * auth.js — Diário Digital Copa 2026
 * Controla as telas de Login e Cadastro.
 *
 * Depende de: auth.css
 * Referenciado pelo href dos botões ENTRAR / CRIAR CONTA na landing (index.html)
 *
 * URL de uso:
 *   login.html          → abre aba "Entrar" por padrão
 *   login.html?tab=register → abre aba "Criar conta"
 */

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // lê parâmetro de URL para determinar aba inicial
  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab') || 'login';
  switchTab(tab);

  // foca o primeiro campo visível
  const firstInput = document.querySelector('.auth-form:not(.hidden) input');
  if (firstInput) firstInput.focus();
});

/* ============================================================
   TROCAR ABA (login ↔ register)
   ============================================================ */
function switchTab(tab) {
  const tabLogin    = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const formLogin   = document.getElementById('form-login');
  const formRegister= document.getElementById('form-register');

  if (!tabLogin || !tabRegister || !formLogin || !formRegister) return;

  const isLogin = tab === 'login';

  tabLogin.classList.toggle('active', isLogin);
  tabRegister.classList.toggle('active', !isLogin);
  formLogin.classList.toggle('hidden', !isLogin);
  formRegister.classList.toggle('hidden', isLogin);

  // atualiza URL sem recarregar (para bookmarks/back button)
  const url = new URL(window.location);
  url.searchParams.set('tab', tab);
  window.history.replaceState({}, '', url);

  // foca primeiro campo da aba ativa
  const firstInput = document.querySelector(`#${isLogin ? 'form-login' : 'form-register'} input`);
  if (firstInput) setTimeout(() => firstInput.focus(), 50);

  // limpa mensagens de erro ao trocar de aba
  clearMessages();
}

/* ============================================================
   MOSTRAR / OCULTAR SENHA
   ============================================================ */
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const btn   = input?.parentElement?.querySelector('.toggle-pw');
  if (!input) return;

  if (input.type === 'password') {
    input.type = 'text';
    if (btn) btn.textContent = '🙈';
  } else {
    input.type = 'password';
    if (btn) btn.textContent = '👁';
  }
}

/* ============================================================
   VALIDAÇÃO
   ============================================================ */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(pw) {
  return pw.length >= 8;
}

/* ============================================================
   MENSAGENS DE FEEDBACK
   ============================================================ */
function showError(formId, message) {
  const el = document.getElementById(`${formId}-error`);
  if (!el) return;
  el.textContent = message;
  el.classList.add('visible');
}

function showSuccess(formId, message) {
  const el = document.getElementById(`${formId}-success`);
  if (!el) return;
  el.textContent = message;
  el.classList.add('visible');
}

function clearMessages() {
  document.querySelectorAll('.auth-error, .auth-success').forEach(el => {
    el.classList.remove('visible');
    el.textContent = '';
  });
}

/* ============================================================
   SUBMIT — LOGIN
   ============================================================ */
function handleLogin(event) {
  event.preventDefault();
  clearMessages();

  const email = document.getElementById('login-email')?.value.trim();
  const password = document.getElementById('login-password')?.value;
  const btn = document.getElementById('btn-login');

  // validações básicas
  if (!email) { showError('login', 'Informe seu e-mail.'); return; }
  if (!validateEmail(email)) { showError('login', 'E-mail inválido.'); return; }
  if (!password) { showError('login', 'Informe sua senha.'); return; }

  // estado de loading
  btn.classList.add('loading');
  btn.textContent = 'Entrando';

  // -------------------------------------------------------
  // INTEGRAÇÃO COM BACK-END
  // SUBSTITUI AQUI GALERA !!!!!!!!!!!!!!
  // tipo:
  //   const res = await fetch('/api/auth/login', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ email, password })
  //   });
  //   if (!res.ok) { const err = await res.json(); showError('login', err.message); return; }
  //   const { token } = await res.json();
  //   localStorage.setItem('auth_token', token);
  //   window.location.href = 'app.html';
  // -------------------------------------------------------
  setTimeout(() => {
    btn.classList.remove('loading');
    btn.textContent = 'Entrar no Diário';

    // simula credenciais inválidas para demonstração
    if (password === 'errado') {
      showError('login', 'E-mail ou senha incorretos. Tente novamente.');
      return;
    }

    // sucesso: redireciona para o app
    window.location.href = 'app.html'; // ajustar para a rota real
  }, 1200);
}

/* ============================================================
   SUBMIT — CADASTRO
   ============================================================ */
function handleRegister(event) {
  event.preventDefault();
  clearMessages();

  const name     = document.getElementById('reg-name')?.value.trim();
  const email    = document.getElementById('reg-email')?.value.trim();
  const password = document.getElementById('reg-password')?.value;
  const confirm  = document.getElementById('reg-confirm')?.value;
  const btn      = document.getElementById('btn-register');

  // validações
  if (!name || name.length < 2) { showError('register', 'Informe seu nome completo.'); return; }
  if (!validateEmail(email))     { showError('register', 'E-mail inválido.'); return; }
  if (!validatePassword(password)) { showError('register', 'A senha deve ter no mínimo 8 caracteres.'); return; }
  if (password !== confirm)       { showError('register', 'As senhas não coincidem.'); return; }

  // estado de loading
  btn.classList.add('loading');
  btn.textContent = 'Criando conta';

  // -------------------------------------------------------
  // INTEGRAÇÃO COM BACK-END
  // SUBSTITUI AQUI TAMBEM GALERA !!!!!!!!!!!!!!!
  // tipo:
  //   const res = await fetch('/api/auth/register', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ name, email, password })
  //   });
  //   if (!res.ok) { const err = await res.json(); showError('register', err.message); return; }
  //   showSuccess('register', 'Conta criada! Redirecionando...');
  //   setTimeout(() => window.location.href = 'app.html', 1500);
  // -------------------------------------------------------
  setTimeout(() => {
    btn.classList.remove('loading');
    btn.textContent = 'Criar minha conta';
    showSuccess('register', 'Conta criada com sucesso! Redirecionando...');
    setTimeout(() => window.location.href = 'app.html', 1500); // ajuste para a rota real
  }, 1400);
}

/* ============================================================
   LINK "ESQUECI MINHA SENHA" (placeholder)
   ============================================================ */
function handleForgotPassword(event) {
  event.preventDefault();
  const email = document.getElementById('login-email')?.value.trim();

  if (!email || !validateEmail(email)) {
    showError('login', 'Informe seu e-mail antes de solicitar a redefinição.');
    document.getElementById('login-email')?.focus();
    return;
  }

  // TODO: chamar endpoint /api/auth/forgot-password
  showSuccess('login', `Link de redefinição enviado para ${email}. Verifique sua caixa de entrada.`);
}