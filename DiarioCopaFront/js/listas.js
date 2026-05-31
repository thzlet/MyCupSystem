// listas.js — RF14: Listas de Jogos

document.addEventListener('DOMContentLoaded', () => {
  verificarAuth();
  Promise.all([carregarJogos(), carregarListas()]);
});

// ── Auth ──────────────────────────────────────────────────────
function verificarAuth() {
  if (!localStorage.getItem('token')) {
    window.location.href = 'login.html';
    return;
  }
  document.getElementById('btnLogout').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });
}

// ── Estado ────────────────────────────────────────────────────
let _jogos        = [];   // todos os jogos da API
let _listaAberta  = null; // guid da lista no modal

// ── Carregar jogos (para o select do modal) ───────────────────
async function carregarJogos() {
  const res = await apiFetch('/api/jogos');
  if (!res.ok || !Array.isArray(res.data)) return;
  _jogos = res.data;

  const sel = document.getElementById('selJogoModal');
  sel.innerHTML = '<option value="">Selecione um jogo para adicionar...</option>';
  _jogos.forEach(j => {
    const opt = document.createElement('option');
    opt.value = j.id;
    opt.textContent = `${j.time1} x ${j.time2} — ${j.fase}`;
    sel.appendChild(opt);
  });
}

// ── Carregar listas ───────────────────────────────────────────
async function carregarListas() {
  const res = await apiFetch('/api/listas');
  const listas = (res.ok && Array.isArray(res.data)) ? res.data : [];
  renderGrid(listas);
}

// ── Render grid ───────────────────────────────────────────────
function renderGrid(listas) {
  const grid  = document.getElementById('gridListas');
  const empty = document.getElementById('emptyMsg');

  // remove cards anteriores (mantém o empty)
  grid.querySelectorAll('.lista-card').forEach(c => c.remove());

  if (!listas.length) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  listas.forEach(l => grid.appendChild(criarCard(l)));
}

function criarCard(lista) {
  const div = document.createElement('div');
  div.className = 'lista-card';
  div.dataset.id = lista.idLista;
  div.innerHTML = `
    <div class="lista-card__nome">${esc(lista.tituloLista)}</div>
    <div class="lista-card__desc">${esc(lista.descricao)}</div>
    <div class="lista-card__count">${lista.quantidadeJogos} jogo${lista.quantidadeJogos !== 1 ? 's' : ''}</div>
    <div class="lista-card__btns">
      <button class="btn-primary btn-ver">Ver / Editar</button>
      <button class="btn-danger  btn-del">Excluir</button>
    </div>`;

  div.querySelector('.btn-ver').addEventListener('click', () =>
    abrirModal(lista.idLista, lista.tituloLista));
  div.querySelector('.btn-del').addEventListener('click', () =>
    deletarLista(lista.idLista, lista.tituloLista, div));

  return div;
}

// ── Criar lista ───────────────────────────────────────────────
document.getElementById('btnNovaLista').addEventListener('click', () => {
  document.getElementById('formCriar').classList.toggle('hidden');
  document.getElementById('inpTitulo').focus();
});

document.getElementById('btnCancelar').addEventListener('click', fecharForm);

document.getElementById('btnSalvar').addEventListener('click', salvarLista);

document.getElementById('inpTitulo').addEventListener('keydown', e => {
  if (e.key === 'Enter') salvarLista();
  if (e.key === 'Escape') fecharForm();
});

async function salvarLista() {
  const titulo = document.getElementById('inpTitulo').value.trim();
  const desc   = document.getElementById('inpDesc').value.trim();
  const erroEl = document.getElementById('erroCriar');

  if (!titulo) {
    erroEl.textContent = 'Informe um título.';
    erroEl.classList.remove('hidden');
    return;
  }

  const res = await apiFetch('/api/listas', {
    method: 'POST',
    body: JSON.stringify({ tituloLista: titulo, descricao: desc })
  });

  if (!res.ok) {
    erroEl.textContent = res.data?.mensagem || 'Erro ao criar lista.';
    erroEl.classList.remove('hidden');
    return;
  }

  fecharForm();
  toast(`Lista "${titulo}" criada!`);
  await carregarListas();
}

function fecharForm() {
  document.getElementById('formCriar').classList.add('hidden');
  document.getElementById('inpTitulo').value = '';
  document.getElementById('inpDesc').value   = '';
  document.getElementById('erroCriar').classList.add('hidden');
}

// ── Deletar lista ─────────────────────────────────────────────
async function deletarLista(id, nome, cardEl) {
  if (!confirm(`Excluir a lista "${nome}"?`)) return;

  const res = await apiFetch(`/api/listas/${id}`, { method: 'DELETE' });
  if (!res.ok) { toast('Erro ao excluir.'); return; }

  cardEl.remove();
  toast('Lista excluída.');

  // mostra empty se não sobrou nenhum card
  if (!document.querySelector('.lista-card'))
    document.getElementById('emptyMsg').classList.remove('hidden');
}

// ── Modal ─────────────────────────────────────────────────────
async function abrirModal(id, titulo) {
  _listaAberta = id;
  document.getElementById('modalTitulo').textContent = titulo;
  document.getElementById('erroModal').classList.add('hidden');
  document.getElementById('modal').classList.remove('hidden');
  await carregarJogosModal(id);
}

document.getElementById('btnFecharModal').addEventListener('click', () => {
  document.getElementById('modal').classList.add('hidden');
  _listaAberta = null;
});

document.getElementById('modal').addEventListener('click', e => {
  if (e.target === e.currentTarget) {
    e.currentTarget.classList.add('hidden');
    _listaAberta = null;
  }
});

document.getElementById('btnAddJogo').addEventListener('click', async () => {
  const jogoId = document.getElementById('selJogoModal').value;
  const erroEl = document.getElementById('erroModal');
  erroEl.classList.add('hidden');

  if (!jogoId) {
    erroEl.textContent = 'Selecione um jogo.';
    erroEl.classList.remove('hidden');
    return;
  }

  const res = await apiFetch(`/api/listas/${_listaAberta}/jogos/${jogoId}`, { method: 'POST' });

  if (!res.ok) {
    erroEl.textContent = res.data?.mensagem || 'Erro ao adicionar jogo.';
    erroEl.classList.remove('hidden');
    return;
  }

  document.getElementById('selJogoModal').value = '';
  toast('Jogo adicionado!');
  await carregarJogosModal(_listaAberta);
  atualizarCountCard(_listaAberta);
});

async function carregarJogosModal(id) {
  const container = document.getElementById('modalJogos');
  const emptyEl   = document.getElementById('emptyModal');

  container.innerHTML = '<p style="color:#aaa;text-align:center;padding:1rem">Carregando...</p>';

  const res = await apiFetch(`/api/listas/${id}`);
  if (!res.ok) {
    container.innerHTML = '<p style="color:red;text-align:center">Erro ao carregar.</p>';
    return;
  }

  const jogos = res.data.jogos || [];
  container.innerHTML = '';

  if (!jogos.length) {
    emptyEl.classList.remove('hidden');
    return;
  }
  emptyEl.classList.add('hidden');

  jogos.forEach(j => {
    const item = document.createElement('div');
    item.className = 'jogo-item';
    const data = new Date(j.dataHora).toLocaleDateString('pt-BR');
    const placar = (j.golsTime1 != null && j.golsTime2 != null)
      ? `${j.golsTime1} × ${j.golsTime2}` : '— × —';
    item.innerHTML = `
      <div class="jogo-item__info">
        <div class="jogo-item__placar">${esc(j.time1)} × ${esc(j.time2)} <small>${placar}</small></div>
        <div class="jogo-item__meta">${esc(j.fase)} · ${data} · ${esc(j.estadio)}</div>
      </div>
      <button class="btn-danger" data-jogo="${j.id}">Remover</button>`;

    item.querySelector('button').addEventListener('click', async e => {
      const jogoId = e.target.dataset.jogo;
      await apiFetch(`/api/listas/${_listaAberta}/jogos/${jogoId}`, { method: 'DELETE' });
      item.remove();
      toast('Jogo removido.');
      atualizarCountCard(_listaAberta);
      if (!container.querySelector('.jogo-item'))
        emptyEl.classList.remove('hidden');
    });

    container.appendChild(item);
  });
}

// atualiza o contador no card sem recarregar tudo
function atualizarCountCard(listaId) {
  const card = document.querySelector(`.lista-card[data-id="${listaId}"]`);
  if (!card) return;
  const countEl = card.querySelector('.lista-card__count');
  const atual = parseInt(countEl.textContent) || 0;
  // re-busca a lista para pegar o número real
  apiFetch(`/api/listas/${listaId}`).then(res => {
    if (!res.ok) return;
    const n = (res.data.jogos || []).length;
    countEl.textContent = `${n} jogo${n !== 1 ? 's' : ''}`;
  });
}

// ── Utilitários ───────────────────────────────────────────────
function esc(str) {
  return String(str ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

let _toastTimer;
function toast(msg) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.style.cssText = `
      position:fixed;bottom:1.5rem;left:50%;
      transform:translateX(-50%) translateY(60px);
      background:#333;color:#fff;padding:.65rem 1.5rem;
      border-radius:24px;font-size:.9rem;opacity:0;
      transition:transform .3s,opacity .3s;
      z-index:999;pointer-events:none`;
    document.body.appendChild(el);
  }
  el.textContent = msg;
  requestAnimationFrame(() => {
    el.style.transform = 'translateX(-50%) translateY(0)';
    el.style.opacity   = '1';
  });
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => {
    el.style.transform = 'translateX(-50%) translateY(60px)';
    el.style.opacity   = '0';
  }, 3000);
}