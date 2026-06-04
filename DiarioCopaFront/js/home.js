/* ============================================================
   js/home.js — Diário Digital Copa 2026

   Depende de:
     js/api.js   → apiFetch(endpoint, options)
     js/auth.js  → leitura do token

   Endpoints:
     GET    /api/usuarios/perfil
     GET    /api/experiencias/listar-experiencias
     POST   /api/experiencias/criar-experiencia
     PUT    /api/experiencias/{id}
     DELETE /api/experiencias/{id}
     GET    /api/jogos
     GET    /api/favoritos
     POST   /api/favoritos/{idJogo}
     DELETE /api/favoritos/{idJogo}
     GET    /api/listas
     POST   /api/listas
   ============================================================ */

/* ============================================================
   ESTADO GLOBAL
   ============================================================ */
let _starSelected     = 0;
let _sentSelected     = '';
let _tlFiltro         = '';
let _experiencias     = [];
let _jogos            = [];
let _favoritos        = [];
let _listas           = [];

// edição
let _editId           = null;
let _editStarSelected = 0;
let _editSentSelected = '';

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) { window.location.href = 'login.html'; return; }

  await carregarPerfil();
  await carregarJogos();
  await carregarExperiencias();
  await carregarFavoritos();
  await carregarListas();

  const params = new URLSearchParams(window.location.search);
  const screenParam = params.get('screen');
  if (screenParam) showScreen(screenParam);
});

/* ============================================================
   PERFIL
   ============================================================ */
async function carregarPerfil() {
  const nome    = localStorage.getItem('nomeUsuario') || 'Torcedor';
  const iniciais = nome.split(' ').slice(0, 2).map(p => p[0].toUpperCase()).join('');
  const elNome   = document.getElementById('user-name');
  const elAvatar = document.getElementById('user-avatar');
  if (elNome)   elNome.textContent   = nome;
  if (elAvatar) elAvatar.textContent = iniciais;
}

/* ============================================================
   JOGOS
   ============================================================ */
async function carregarJogos() {
  try {
    const res = await apiFetch('/api/jogos');
    if (!res.ok || !Array.isArray(res.data)) return;
    _jogos = res.data;

    const sel = document.getElementById('sel-jogo');
    if (!sel) return;
    sel.innerHTML = '<option value="">Selecione um jogo...</option>';
    _jogos.forEach(jogo => {
      const option = document.createElement('option');
      option.value = jogo.id;
      option.textContent = `${jogo.time1} x ${jogo.time2} — ${jogo.fase}`;
      sel.appendChild(option);
    });
  } catch (err) {
    console.warn('Erro ao carregar jogos:', err);
  }
}

/* ============================================================
   EXPERIÊNCIAS
   ============================================================ */
async function carregarExperiencias() {
  try {
    const res = await apiFetch('/api/experiencias/listar-experiencias');
    if (res.status === 401) {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
      return;
    }
    _experiencias = (res.ok && Array.isArray(res.data)) ? res.data : [];
  } catch (err) {
    console.warn('Erro ao buscar experiências:', err);
    _experiencias = [];
  }
  renderFeed();
  renderTimeline(_tlFiltro);
  atualizarStats();
}

function atualizarStats() {
  const jogosVistos = _experiencias.filter(e => e.assistido).length;
  const comNota     = _experiencias.filter(e => e.nota != null);
  const mediaNota   = comNota.length
    ? (comNota.reduce((s, e) => s + notaParaEstrelas(e.nota), 0) / comNota.length).toFixed(1)
    : '—';
  const favs        = _experiencias.filter(e => e.favorito).length;

  const elJogos   = document.getElementById('stat-jogos');
  const elNota    = document.getElementById('stat-nota');
  const elFav     = document.getElementById('stat-fav');
  const elEntradas = document.getElementById('stat-entradas');

  if (elJogos)    elJogos.textContent    = jogosVistos;
  if (elNota)     elNota.textContent     = mediaNota;
  if (elFav)      elFav.textContent      = favs;
  if (elEntradas) elEntradas.textContent = _experiencias.length;
}

/* ============================================================
   FAVORITOS (RF14)
   ============================================================ */
async function carregarFavoritos() {
  try {
    const res = await apiFetch('/api/favoritos');
    _favoritos = (res.ok && Array.isArray(res.data)) ? res.data : [];
  } catch (err) {
    console.warn('Erro ao buscar favoritos:', err);
    _favoritos = [];
  }
  renderListas();
}

async function toggleFavorito(idJogo) {
  const jaFavoritou = _favoritos.some(f => f.idJogo === idJogo);
  try {
    const res = await apiFetch(`/api/favoritos/${idJogo}`, {
      method: jaFavoritou ? 'DELETE' : 'POST'
    });
    if (!res.ok) return;

    if (jaFavoritou) {
      _favoritos = _favoritos.filter(f => f.idJogo !== idJogo);
    } else {
      const jogo = _jogos.find(j => j.id === idJogo);
      if (jogo) {
        _favoritos.push({
          idJogo:      jogo.id,
          jogoTitulo:  `${jogo.time1} x ${jogo.time2}`,
          dataHora:    jogo.dataHora,
          fase:        jogo.fase,
          golsTime1:   jogo.golsTime1,
          golsTime2:   jogo.golsTime2,
          dataCriacao: new Date().toISOString()
        });
      }
    }
    renderListas();
  } catch (err) {
    console.warn('Erro ao favoritar:', err);
  }
}

/* ============================================================
   LISTAS (RF13)
   ============================================================ */
async function carregarListas() {
  try {
    const res = await apiFetch('/api/listas');
    _listas = (res.ok && Array.isArray(res.data)) ? res.data : [];
  } catch (err) {
    console.warn('Erro ao buscar listas:', err);
    _listas = [];
  }
  renderListas();
}

function abrirFormLista() {
  const form = document.getElementById('form-criar-lista');
  if (form) { form.style.display = ''; document.getElementById('lf-titulo')?.focus(); }
}
function fecharFormLista() {
  const form = document.getElementById('form-criar-lista');
  if (form) form.style.display = 'none';
  const t = document.getElementById('lf-titulo'); if (t) t.value = '';
  const d = document.getElementById('lf-desc');   if (d) d.value = '';
  const e = document.getElementById('lf-erro');   if (e) e.style.display = 'none';
}

async function salvarNovaLista() {
  const titulo    = document.getElementById('lf-titulo')?.value.trim();
  const descricao = document.getElementById('lf-desc')?.value.trim() || '';
  const erroEl    = document.getElementById('lf-erro');

  function mostrarErro(msg) { if (erroEl) { erroEl.textContent = msg; erroEl.style.display = 'block'; } }
  if (erroEl) erroEl.style.display = 'none';
  if (!titulo) { mostrarErro('Informe um título para a lista.'); return; }

  try {
    const res = await apiFetch('/api/listas', {
      method: 'POST',
      body: JSON.stringify({ tituloLista: titulo, descricao })
    });
    if (!res.ok) { mostrarErro(res.data?.mensagem || 'Erro ao criar lista.'); return; }
    _listas.push({
      idLista:         res.data.idLista,
      tituloLista:     res.data.tituloLista || titulo,
      descricao:       res.data.descricao   || descricao,
      quantidadeJogos: 0
    });
    fecharFormLista();
    renderListas();
  } catch (err) {
    mostrarErro('Erro de conexão. Tente novamente.');
  }
}

async function criarNovaLista() { abrirFormLista(); }

let _listaModalId = null;

async function abrirModalLista(idLista, titulo) {
  _listaModalId = idLista;
  const modal = document.getElementById('modal-lista');
  if (!modal) return;
  document.getElementById('lm-titulo').textContent = titulo;
  document.getElementById('lm-erro').style.display = 'none';
  modal.style.display = 'flex';

  const sel = document.getElementById('lm-sel-jogo');
  sel.innerHTML = '<option value="">Selecione um jogo para adicionar...</option>';
  _jogos.forEach(j => {
    const opt = document.createElement('option');
    opt.value = j.id;
    opt.textContent = `${j.time1} × ${j.time2} — ${j.fase || ''}`;
    sel.appendChild(opt);
  });

  await carregarJogosModal(idLista);
}

function fecharModalLista() {
  const modal = document.getElementById('modal-lista');
  if (modal) modal.style.display = 'none';
  _listaModalId = null;
}

document.addEventListener('click', e => {
  if (e.target && e.target.id === 'modal-lista') fecharModalLista();
  if (e.target && e.target.id === 'modal-editar-exp') fecharModalEditarExp();
});

async function adicionarJogoLista() {
  const jogoId = document.getElementById('lm-sel-jogo')?.value;
  const erroEl = document.getElementById('lm-erro');
  if (erroEl) erroEl.style.display = 'none';
  if (!jogoId) { if (erroEl) { erroEl.textContent = 'Selecione um jogo.'; erroEl.style.display = 'block'; } return; }

  const res = await apiFetch(`/api/listas/${_listaModalId}/jogos/${jogoId}`, { method: 'POST' });
  if (!res.ok) {
    if (erroEl) { erroEl.textContent = res.data?.mensagem || 'Erro ao adicionar jogo.'; erroEl.style.display = 'block'; }
    return;
  }
  document.getElementById('lm-sel-jogo').value = '';
  await carregarJogosModal(_listaModalId);
  const card = document.querySelector(`.list-card[data-id="${_listaModalId}"]`);
  if (card) {
    const countEl = card.querySelector('.lc-count');
    const lista   = _listas.find(l => l.idLista === _listaModalId);
    if (lista) { lista.quantidadeJogos = (lista.quantidadeJogos || 0) + 1; if (countEl) countEl.textContent = formatCount(lista.quantidadeJogos); }
  }
}

async function carregarJogosModal(idLista) {
  const container = document.getElementById('lm-jogos');
  const emptyEl   = document.getElementById('lm-empty');
  if (!container) return;
  container.innerHTML = '<p style="color:var(--gray);text-align:center;padding:1rem;font-size:13px">Carregando...</p>';

  const res = await apiFetch(`/api/listas/${idLista}`);
  if (!res.ok) { container.innerHTML = '<p style="color:var(--red);text-align:center">Erro ao carregar.</p>'; return; }

  const jogos = res.data.jogos || [];
  container.innerHTML = '';
  if (!jogos.length) { if (emptyEl) emptyEl.style.display = ''; return; }
  if (emptyEl) emptyEl.style.display = 'none';

  jogos.forEach(j => {
    const item   = document.createElement('div');
    item.className = 'lm-jogo-item';
    const data   = j.dataHora ? new Date(j.dataHora).toLocaleDateString('pt-BR') : '—';
    const placar = (j.golsTime1 != null && j.golsTime2 != null) ? `${j.golsTime1} × ${j.golsTime2}` : '— × —';
    item.innerHTML = `
      <div class="lm-jogo-info">
        <div class="lm-jogo-placar">${esc(j.time1)} × ${esc(j.time2)} <small style="font-weight:400;color:var(--gray)">${placar}</small></div>
        <div class="lm-jogo-meta">${esc(j.fase || '')} · ${data} · ${esc(j.estadio || '')}</div>
      </div>
      <button class="lm-btn-rem" data-jogo="${j.id}">Remover</button>`;
    item.querySelector('.lm-btn-rem').addEventListener('click', async e => {
      const jogoId = e.target.dataset.jogo;
      await apiFetch(`/api/listas/${_listaModalId}/jogos/${jogoId}`, { method: 'DELETE' });
      item.remove();
      const lista = _listas.find(l => l.idLista === _listaModalId);
      if (lista) lista.quantidadeJogos = Math.max(0, (lista.quantidadeJogos || 1) - 1);
      const card = document.querySelector(`.list-card[data-id="${_listaModalId}"]`);
      if (card && lista) { const c = card.querySelector('.lc-count'); if (c) c.textContent = formatCount(lista.quantidadeJogos); }
      if (!container.querySelector('.lm-jogo-item') && emptyEl) emptyEl.style.display = '';
    });
    container.appendChild(item);
  });
}

function formatCount(n) {
  return `${n} jogo${n !== 1 ? 's' : ''}`;
}

/* ============================================================
   NAVEGAÇÃO
   ============================================================ */
function showScreen(id) {
  document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.app-tab').forEach(t => t.classList.remove('active'));
  const tela = document.getElementById(`screen-${id}`);
  if (tela) tela.classList.add('active');
  document.querySelectorAll('.app-tab').forEach(t => {
    if (t.getAttribute('onclick')?.includes(`'${id}'`)) t.classList.add('active');
  });
  if (id === 'registrar') resetarFormulario();
}

/* ============================================================
   RENDER — FEED
   ============================================================ */
function renderFeed() {
  const lista = document.getElementById('feed-list');
  if (!lista) return;

  if (_experiencias.length === 0) {
    lista.innerHTML = `
      <p class="feed-vazio">
        Nenhuma experiência registrada ainda.<br>
        <button class="btn-outline-sm" style="margin-top:12px"
          onclick="showScreen('registrar')">Registrar meu primeiro jogo →</button>
      </p>`;
    return;
  }

  const recentes = [..._experiencias]
    .sort((a, b) => new Date(b.dataRegistro) - new Date(a.dataRegistro))
    .slice(0, 5);

  lista.innerHTML = recentes.map(exp => cardFeedHTML(exp)).join('');

  // eventos dos botões de ação
  lista.querySelectorAll('.fc-btn-edit').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const exp = _experiencias.find(x => x.idExperiencia === id);
      if (exp) abrirModalEditarExp(exp);
    });
  });
  lista.querySelectorAll('.fc-btn-del').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      excluirExperiencia(btn.dataset.id);
    });
  });
}

function cardFeedHTML(exp) {
  const stars     = starsHTML(notaParaEstrelas(exp.nota));
  const sentEmoji = sentiEmo(exp.sentimento);
  const data      = formatarData(exp.dataRegistro);
  const loc       = exp.localizacao
    ? `<span class="fc-loc"><span class="loc-dot"></span>${esc(exp.localizacao)}</span>`
    : '';

  return `
    <div class="feed-card">
      <div class="fc-top">
        <div class="fc-match">
          ${esc(exp.jogoTitulo || '—')}
          <span class="score-pill">${exp.golsTime1 ?? '?'} × ${exp.golsTime2 ?? '?'}</span>
        </div>
        <div class="fc-emoji">${sentEmoji}</div>
      </div>
      <div class="fc-text">${esc(exp.comentario || '')}</div>
      <div class="fc-bottom">
        <div class="stars-row">${stars}</div>
        ${loc}
        <span class="fc-date">${data}</span>
      </div>
      <div class="fc-actions">
        <button class="fc-btn-edit" data-id="${esc(exp.idExperiencia)}">✏️ Editar</button>
        <button class="fc-btn-del"  data-id="${esc(exp.idExperiencia)}">🗑️ Excluir</button>
      </div>
    </div>`;
}

/* ============================================================
   RENDER — TIMELINE (RF12)
   ============================================================ */
function renderTimeline(filtro) {
  _tlFiltro = filtro;
  const lista = document.getElementById('timeline-list');
  if (!lista) return;

  let dados = [..._experiencias].sort((a, b) => new Date(b.dataRegistro) - new Date(a.dataRegistro));
  if (filtro === 'favorito')  dados = dados.filter(e => e.favorito  === true);
  if (filtro === 'assistido') dados = dados.filter(e => e.assistido === true);

  if (dados.length === 0) {
    lista.innerHTML = '<p class="feed-vazio">Nenhuma entrada encontrada para esse filtro.</p>';
    return;
  }

  lista.innerHTML = dados.map(exp => {
    const tags = [];
    if (exp.sentimento) tags.push(`<span class="tl-tag red">${sentiEmo(exp.sentimento)} ${esc(exp.sentimento)}</span>`);
    if (exp.nota)       tags.push(`<span class="tl-tag">${starsHTML(notaParaEstrelas(exp.nota), true)}</span>`);
    if (exp.assistido)  tags.push(`<span class="tl-tag">✅ Assistido</span>`);
    if (exp.favorito)   tags.push(`<span class="tl-tag">⭐ Favorito</span>`);

    return `
      <div class="tl-item">
        <div class="tl-dot"></div>
        <div class="tl-card">
          <div class="tlc-head">
            <span>${esc(exp.jogoTitulo || '—')} · ${exp.golsTime1 ?? '?'} × ${exp.golsTime2 ?? '?'}</span>
            <span class="tlc-date">${formatarData(exp.dataRegistro)}</span>
          </div>
          <div class="tlc-body">${esc(exp.comentario || '')}</div>
          <div class="tlc-tags">${tags.join('')}</div>
          <div class="fc-actions" style="margin-top:10px">
            <button class="fc-btn-edit" data-id="${esc(exp.idExperiencia)}">✏️ Editar</button>
            <button class="fc-btn-del"  data-id="${esc(exp.idExperiencia)}">🗑️ Excluir</button>
          </div>
        </div>
      </div>`;
  }).join('');

  lista.querySelectorAll('.fc-btn-edit').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const exp = _experiencias.find(x => x.idExperiencia === btn.dataset.id);
      if (exp) abrirModalEditarExp(exp);
    });
  });
  lista.querySelectorAll('.fc-btn-del').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      excluirExperiencia(btn.dataset.id);
    });
  });
}

function selChip(el, filtro) {
  document.querySelectorAll('.fchip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  renderTimeline(filtro);
}

/* ============================================================
   RENDER — LISTAS (RF13 + RF14)
   ============================================================ */
function renderListas() {
  const grid    = document.getElementById('lists-grid');
  const emptyEl = document.getElementById('listas-empty');
  if (!grid) return;

  grid.innerHTML = '';

  // Card fixo de favoritos
  const countFav = _favoritos.length;
  const favCard  = document.createElement('div');
  favCard.className = 'list-card';
  favCard.innerHTML = `
    <div class="lc-icon">⭐</div>
    <div class="lc-name">Meus Favoritos</div>
    <div class="lc-desc">Os jogos que mais me marcaram emocionalmente durante a Copa 2026.</div>
    <div class="lc-count" id="lc-count-fav">${formatCount(countFav)}</div>`;
  grid.appendChild(favCard);

  _listas.forEach(lista => {
    const card = document.createElement('div');
    card.className = 'list-card';
    card.dataset.id = lista.idLista;
    card.innerHTML = `
      <div class="lc-icon">📋</div>
      <div class="lc-name">${esc(lista.tituloLista)}</div>
      <div class="lc-desc">${esc(lista.descricao)}</div>
      <div class="lc-count">${formatCount(lista.quantidadeJogos)}</div>
      <div class="lc-btns">
        <button class="lc-btn-ver">Ver / Editar</button>
        <button class="lc-btn-del">Excluir</button>
      </div>`;
    card.querySelector('.lc-btn-ver').addEventListener('click', e => {
      e.stopPropagation();
      abrirModalLista(lista.idLista, lista.tituloLista);
    });
    card.querySelector('.lc-btn-del').addEventListener('click', async e => {
      e.stopPropagation();
      if (!confirm(`Excluir a lista "${lista.tituloLista}"?`)) return;
      const res = await apiFetch(`/api/listas/${lista.idLista}`, { method: 'DELETE' });
      if (!res.ok) { alert('Erro ao excluir lista.'); return; }
      _listas = _listas.filter(l => l.idLista !== lista.idLista);
      renderListas();
    });
    grid.appendChild(card);
  });

  const addCard = document.createElement('div');
  addCard.className = 'list-card';
  addCard.style.cssText = 'border:2px dashed rgba(10,34,64,0.12);background:rgba(10,34,64,0.02);display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:160px;cursor:pointer';
  addCard.innerHTML = `<div style="font-size:36px;margin-bottom:8px;opacity:0.3">+</div><div style="font-size:13px;color:var(--gray);font-weight:500">Criar nova lista</div>`;
  addCard.addEventListener('click', abrirFormLista);
  grid.appendChild(addCard);

  if (emptyEl) emptyEl.style.display = 'none';
}

/* ============================================================
   REGISTRAR — SELEÇÃO DE JOGO
   ============================================================ */
function selecionarJogo(sel) {
  const id   = sel.value;
  const jogo = _jogos.find(j => j.id === id);

  const elNome   = document.getElementById('reg-jogo-nome');
  const elMeta   = document.getElementById('reg-jogo-meta');
  const elPlacar = document.getElementById('reg-jogo-placar');

  if (jogo) {
    const placar = (jogo.golsTime1 != null && jogo.golsTime2 != null)
      ? `${jogo.golsTime1} × ${jogo.golsTime2}` : '— × —';
    const data = jogo.dataHora
      ? new Date(jogo.dataHora).toLocaleDateString('pt-BR') : '—';
    if (elNome)   elNome.textContent   = `${jogo.time1} x ${jogo.time2}`;
    if (elMeta)   elMeta.textContent   = `${data} · ${jogo.estadio || '—'}`;
    if (elPlacar) elPlacar.textContent = placar;
  } else {
    if (elNome)   elNome.textContent   = 'Selecione um jogo abaixo';
    if (elMeta)   elMeta.textContent   = '—';
    if (elPlacar) elPlacar.textContent = '— × —';
  }
}

/* ============================================================
   REGISTRAR — ESTRELAS + SENTIMENTO
   ============================================================ */
function setStars(n) {
  _starSelected = n;
  document.querySelectorAll('#spicker .spick').forEach((btn, i) => {
    btn.classList.toggle('on', i < n);
  });
}

function selSent(el) {
  document.querySelectorAll('.sent-opt').forEach(b => b.classList.remove('on'));
  el.classList.add('on');
  _sentSelected = el.dataset.sent || '';
}

/* ============================================================
   REGISTRAR — SALVAR (campos opcionais)
   ============================================================ */
async function salvarExperiencia() {
  const erroEl = document.getElementById('reg-erro');
  const btnEl  = document.querySelector('.btn-primary-full');

  const jogoId      = document.getElementById('sel-jogo')?.value;
  const comentario  = document.getElementById('reg-comentario')?.value.trim();
  const localizacao = document.getElementById('reg-localizacao')?.value.trim();
  const assistido   = document.getElementById('reg-assistido')?.checked ?? true;
  const favorito    = document.getElementById('reg-favorito')?.checked ?? false;

  function mostrarErro(msg) {
    if (erroEl) { erroEl.textContent = msg; erroEl.style.display = 'block'; }
  }
  function limparErro() {
    if (erroEl) { erroEl.style.display = 'none'; erroEl.textContent = ''; }
  }

  limparErro();

  // único campo obrigatório: o jogo
  if (!jogoId) {
    mostrarErro('Selecione um jogo antes de publicar.');
    document.getElementById('sel-jogo')?.focus();
    return;
  }

  const payload = {
    idJogo:     jogoId,
    nota:       _starSelected > 0 ? converterNota(_starSelected) : null,
    sentimento: _sentSelected || null,
    comentario: comentario  || null,
    localizacao: localizacao || null,
    assistido,
    favorito,
  };

  if (btnEl) { btnEl.disabled = true; btnEl.textContent = 'Publicando...'; }

  try {
    const res = await apiFetch('/api/experiencias/criar-experiencia', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const msg = res.data?.mensagem || res.data?.message || 'Erro ao salvar experiência.';
      mostrarErro(msg);
      return;
    }

    await carregarExperiencias();
    renderListas();

    if (btnEl) { btnEl.textContent = '✓ Publicado!'; btnEl.style.background = '#16a34a'; }
    setTimeout(() => {
      showScreen('home');
      if (btnEl) {
        btnEl.disabled = false;
        btnEl.textContent = 'Publicar no meu diário →';
        btnEl.style.background = '';
      }
    }, 1200);

  } catch (err) {
    console.error('Erro ao salvar:', err);
    mostrarErro('Erro de conexão. Verifique sua internet e tente novamente.');
  } finally {
    if (btnEl && btnEl.disabled) {
      setTimeout(() => {
        if (btnEl.disabled) {
          btnEl.disabled = false;
          btnEl.textContent = 'Publicar no meu diário →';
          btnEl.style.background = '';
        }
      }, 3000);
    }
  }
}

/* ============================================================
   REGISTRAR — RESET
   ============================================================ */
function resetarFormulario() {
  const sel = document.getElementById('sel-jogo');
  if (sel) sel.value = '';
  selecionarJogo({ value: '' });

  const comentario = document.getElementById('reg-comentario');
  if (comentario) comentario.value = '';
  const loc = document.getElementById('reg-localizacao');
  if (loc) loc.value = '';
  const assistido = document.getElementById('reg-assistido');
  if (assistido) assistido.checked = true;
  const favorito = document.getElementById('reg-favorito');
  if (favorito) favorito.checked = false;

  _starSelected = 0;
  document.querySelectorAll('#spicker .spick').forEach(b => b.classList.remove('on'));
  _sentSelected = '';
  document.querySelectorAll('.sent-opt').forEach(b => b.classList.remove('on'));

  const erroEl = document.getElementById('reg-erro');
  if (erroEl) { erroEl.style.display = 'none'; erroEl.textContent = ''; }
}

/* ============================================================
   EDITAR EXPERIÊNCIA — MODAL
   ============================================================ */
function abrirModalEditarExp(exp) {
  _editId           = exp.idExperiencia;
  _editStarSelected = notaParaEstrelas(exp.nota);
  _editSentSelected = exp.sentimento || '';

  // título do jogo
  const el = document.getElementById('edit-exp-titulo');
  if (el) el.textContent = exp.jogoTitulo || '—';

  // comentário
  const comentEl = document.getElementById('edit-comentario');
  if (comentEl) comentEl.value = exp.comentario || '';

  // localização
  const locEl = document.getElementById('edit-localizacao');
  if (locEl) locEl.value = exp.localizacao || '';

  // estrelas
  document.querySelectorAll('#edit-spicker .spick').forEach((btn, i) => {
    btn.classList.toggle('on', i < _editStarSelected);
  });

  // sentimento
  document.querySelectorAll('#modal-editar-exp .sent-opt').forEach(b => {
    b.classList.toggle('on', b.dataset.sent === _editSentSelected);
  });

  // erro
  const erroEl = document.getElementById('edit-erro');
  if (erroEl) erroEl.style.display = 'none';

  const modal = document.getElementById('modal-editar-exp');
  if (modal) modal.style.display = 'flex';
}

function fecharModalEditarExp() {
  const modal = document.getElementById('modal-editar-exp');
  if (modal) modal.style.display = 'none';
  _editId = null;
}

function setEditStars(n) {
  _editStarSelected = n;
  document.querySelectorAll('#edit-spicker .spick').forEach((btn, i) => {
    btn.classList.toggle('on', i < n);
  });
}

function selEditSent(el) {
  document.querySelectorAll('#modal-editar-exp .sent-opt').forEach(b => b.classList.remove('on'));
  el.classList.add('on');
  _editSentSelected = el.dataset.sent || '';
}

async function salvarEdicaoExp() {
  if (!_editId) return;

  const comentario  = document.getElementById('edit-comentario')?.value.trim();
  const localizacao = document.getElementById('edit-localizacao')?.value.trim();
  const erroEl      = document.getElementById('edit-erro');
  const btnEl       = document.getElementById('edit-btn-salvar');

  if (erroEl) erroEl.style.display = 'none';

  const payload = {
    nota:        _editStarSelected > 0 ? converterNota(_editStarSelected) : null,
    sentimento:  _editSentSelected || null,
    comentario:  comentario  || null,
    localizacao: localizacao || null,
  };

  if (btnEl) { btnEl.disabled = true; btnEl.textContent = 'Salvando...'; }

  try {
    const res = await apiFetch(`/api/experiencias/${_editId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const msg = res.data?.mensagem || 'Erro ao editar experiência.';
      if (erroEl) { erroEl.textContent = msg; erroEl.style.display = 'block'; }
      return;
    }

    fecharModalEditarExp();
    await carregarExperiencias();

  } catch (err) {
    console.error('Erro ao editar:', err);
    if (erroEl) { erroEl.textContent = 'Erro de conexão.'; erroEl.style.display = 'block'; }
  } finally {
    if (btnEl) { btnEl.disabled = false; btnEl.textContent = 'Salvar alterações'; }
  }
}

/* ============================================================
   EXCLUIR EXPERIÊNCIA
   ============================================================ */
async function excluirExperiencia(id) {
  if (!confirm('Excluir esta experiência do seu diário?')) return;

  try {
    const res = await apiFetch(`/api/experiencias/${id}`, { method: 'DELETE' });
    if (!res.ok) { alert(res.data?.mensagem || 'Erro ao excluir.'); return; }
    await carregarExperiencias();
  } catch (err) {
    alert('Erro de conexão.');
  }
}

/* ============================================================
   UTILITÁRIOS
   ============================================================ */
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function set(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function notaParaEstrelas(nota) {
  if (nota == null) return 0;
  if (typeof nota === 'string') {
    const mapa = {
      'Zero': 0, 'Meio': 0,
      'Um': 1, 'UmEMeio': 1,
      'Dois': 2, 'DoisEMeio': 2,
      'Tres': 3, 'TresEMeio': 3,
      'Quatro': 4, 'QuatroEMeio': 4,
      'Cinco': 5,
    };
    return mapa[nota] ?? 0;
  }
  return Math.round((nota || 0) / 10);
}

function starsHTML(n, compact = false) {
  n = Math.round(n || 0);
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star-icon${i > n ? ' empty' : ''}">★</span>`;
  }
  return html;
}

function sentiEmo(sent) {
  const map = {
    'FELIZ':      '🥳',
    'TRISTE':     '😢',
    'CONFIANTE':  '😎',
    'ALIVIADO':   '😮‍💨',
    'IRRITADO':   '😤',
    'NOSTALGICO': '🥹',
    'EMPOLGADO':  '🔥',
    'ORGULHOSO':  '💪',
    'ANSIOSO':    '😬',
    'ENJOADO':    '🤢',
  };
  return map[sent] || '';
}

function formatarData(iso) {
  if (!iso) return '—';
  try {
    const d   = new Date(iso);
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch { return '—'; }
}

function converterNota(estrelas) {
  const mapa = { 1: 10, 2: 20, 3: 30, 4: 40, 5: 50 };
  return mapa[estrelas] ?? 0;
}