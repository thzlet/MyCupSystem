/**
 * alterar-senha.js — Diário Digital Copa 2026
 * Controla a tela de Alteração de Senha (RF02).
 *
 * Depende de: api.js, auth.css
 * Endpoint: PUT /api/usuarios/alterar-senha
 * Requer: token JWT salvo no localStorage
 */

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Redireciona para login se não estiver autenticado
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // Foca no primeiro campo
  const firstInput = document.querySelector('#form-alterar-senha input');
  if (firstInput) firstInput.focus();

  // Barra de força da senha em tempo real
  const novaSenhaInput = document.getElementById('nova-senha');
  if (novaSenhaInput) {
    novaSenhaInput.addEventListener('input', () => {
      atualizarForcaSenha(novaSenhaInput.value);
    });
  }
});

/* ============================================================
   VOLTAR À PÁGINA ANTERIOR (home ou login)
   ============================================================ */
function voltarAnterior() {
  const token = localStorage.getItem('token');
  window.location.href = token ? 'home.html' : 'login.html';
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
   FORÇA DA SENHA
   ============================================================ */
function atualizarForcaSenha(senha) {
  const fill  = document.getElementById('pw-strength-fill');
  const label = document.getElementById('pw-strength-label');
  if (!fill || !label) return;

  let score = 0;
  if (senha.length >= 8)  score++;
  if (senha.length >= 12) score++;
  if (/[A-Z]/.test(senha)) score++;
  if (/[0-9]/.test(senha)) score++;
  if (/[^A-Za-z0-9]/.test(senha)) score++;

  const niveis = [
    { label: '',         width: '0%',   color: 'transparent' },
    { label: 'Fraca',    width: '25%',  color: '#C8102E' },
    { label: 'Razoável', width: '50%',  color: '#E8A012' },
    { label: 'Boa',      width: '75%',  color: '#2F9E44' },
    { label: 'Forte',    width: '100%', color: '#2F9E44' },
  ];

  const nivel = niveis[Math.min(score, 4)];
  fill.style.width           = nivel.width;
  fill.style.backgroundColor = nivel.color;
  label.textContent          = nivel.label;
  label.style.color          = nivel.color;
}

/* ============================================================
   MENSAGENS DE FEEDBACK
   ============================================================ */
function showError(message) {
  const el = document.getElementById('alterar-error');
  if (!el) return;
  el.textContent = message;
  el.classList.add('visible');
  document.getElementById('alterar-success')?.classList.remove('visible');
}

function showSuccess(message) {
  const el = document.getElementById('alterar-success');
  if (!el) return;
  el.textContent = message;
  el.classList.add('visible');
  document.getElementById('alterar-error')?.classList.remove('visible');
}

function clearMessages() {
  document.querySelectorAll('.auth-error, .auth-success').forEach(el => {
    el.classList.remove('visible');
    el.textContent = '';
  });
}

/* ============================================================
   SUBMIT — ALTERAR SENHA
   ============================================================ */
async function handleAlterarSenha(event) {
  event.preventDefault();
  clearMessages();

  const senhaAtual         = document.getElementById('senha-atual')?.value;
  const novaSenha          = document.getElementById('nova-senha')?.value;
  const confirmarNovaSenha = document.getElementById('confirmar-nova-senha')?.value;
  const btn                = document.getElementById('btn-alterar');

  // Validações locais
  if (!senhaAtual) {
    showError('Informe sua senha atual.');
    return;
  }
  if (!novaSenha || novaSenha.length < 8) {
    showError('A nova senha deve ter no mínimo 8 caracteres.');
    return;
  }
  if (novaSenha === senhaAtual) {
    showError('A nova senha deve ser diferente da senha atual.');
    return;
  }
  if (novaSenha !== confirmarNovaSenha) {
    showError('As senhas não coincidem.');
    return;
  }

  // Estado de loading
  btn.classList.add('loading');
  btn.textContent = 'Salvando';

  // Chamada à API — PUT /api/usuarios/alterar-senha (requer JWT)
  const res = await apiFetch('/api/usuarios/alterar-senha', {
    method: 'PUT',
    body: JSON.stringify({
      senhaAtual,
      novaSenha,
      confirmarNovaSenha,
    }),
  });

  btn.classList.remove('loading');
  btn.textContent = 'Salvar Nova Senha';

  if (!res.ok) {
    const mensagemErro = res.data?.mensagem || 'Erro ao alterar senha.';
    showError(mensagemErro);
    return;
  }

  // Sucesso: informa o usuário e redireciona
  showSuccess('Senha alterada com sucesso! Redirecionando...');

  // Limpa os campos
  document.getElementById('senha-atual').value = '';
  document.getElementById('nova-senha').value = '';
  document.getElementById('confirmar-nova-senha').value = '';
  atualizarForcaSenha('');

  // Redireciona para home após 2s
  setTimeout(() => {
    window.location.href = 'home.html';
  }, 2000);
}