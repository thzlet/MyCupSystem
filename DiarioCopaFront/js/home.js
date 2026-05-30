/* ============================================================
   js/home.js — Diário Digital Copa 2026
   Lógica principal do feed/home autenticado.

   Depende de:
     js/api.js   → apiFetch(endpoint, options)
     js/auth.js  → (apenas no login.html; aqui só lemos o token)

   Endpoints esperados no back-end (DiarioCopaApi):
     GET  /api/usuarios/perfil                  → PerfilUsuarioDto
     GET  /api/experiencias/listar-experiencias → [ ExperienciaRespostaDto ]
     POST /api/experiencias/criar-experiencia   → ExperienciaRespostaDto
     GET  /api/jogos                            → [ JogoRespostaDto ]

   ExperienciaRespostaDto (backend real):
     { idExperiencia, jogoTitulo, dataJogo, fase,
       golsTime1, golsTime2, nota, sentimento,
       comentario, localizacao, dataRegistro }

   JogoRespostaDto (backend real):
     { id, time1, time2, dataHora, estadio, fase, golsTime1, golsTime2 }
   ============================================================ */

/* ============================================================
   ESTADO GLOBAL
   ============================================================ */
let _starSelected = 0;    // nota selecionada (1–5)
let _sentSelected = '';   // sentimento selecionado
let _tlFiltro     = '';   // filtro ativo na timeline
let _experiencias = [];   // cache local das experiências
let _jogos        = [];   // cache dos jogos carregados da API

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  await carregarPerfil();
  await carregarJogos();
  await carregarExperiencias();
});

/* ============================================================
   PERFIL DO USUÁRIO
   ============================================================ */
async function carregarPerfil() {
  const nome = localStorage.getItem('nomeUsuario') || 'Torcedor';
  const iniciais = nome.split(' ').slice(0, 2).map(p => p[0].toUpperCase()).join('');
  const elNome   = document.getElementById('user-name');
  const elAvatar = document.getElementById('user-avatar');
  if (elNome)   elNome.textContent   = nome;
  if (elAvatar) elAvatar.textContent = iniciais;
}

/* ============================================================
   CARREGAR JOGOS (popula o <select> de registro)
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
   CARREGAR EXPERIÊNCIAS (feed + timeline + listas)
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
  renderListas();
}

/* ============================================================
   NAVEGAÇÃO ENTRE TELAS
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
}

function cardFeedHTML(exp) {
  const stars    = starsHTML(notaParaEstrelas(exp.nota));
  const sentEmoji = sentiEmo(exp.sentimento);
  const data     = formatarData(exp.dataRegistro);
  const loc      = exp.localizacao
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
    </div>`;
}

/* ============================================================
   RENDER — TIMELINE
   ============================================================ */
function renderTimeline(filtro) {
  _tlFiltro = filtro;
  const lista = document.getElementById('timeline-list');
  if (!lista) return;

  let dados = [..._experiencias].sort((a, b) => new Date(b.dataRegistro) - new Date(a.dataRegistro));

  if (dados.length === 0) {
    lista.innerHTML = '<p class="feed-vazio">Nenhuma entrada encontrada para esse filtro.</p>';
    return;
  }

  lista.innerHTML = dados.map(exp => {
    const tags = [];
    if (exp.sentimento) tags.push(`<span class="tl-tag red">${sentiEmo(exp.sentimento)} ${esc(exp.sentimento)}</span>`);
    if (exp.nota)       tags.push(`<span class="tl-tag">${starsHTML(notaParaEstrelas(exp.nota), true)}</span>`);

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
        </div>
      </div>`;
  }).join('');
}

function selChip(el, filtro) {
  document.querySelectorAll('.fchip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  renderTimeline(filtro);
}

/* ============================================================
   RENDER — LISTAS
   ============================================================ */
function renderListas() {
  const countFav = 0; // ExperienciaRespostaDto ainda não inclui favorito na resposta
  const el = document.getElementById('lc-count-fav');
  if (el) el.textContent = `${countFav} jogo${countFav !== 1 ? 's' : ''}`;
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
      ? `${jogo.golsTime1} × ${jogo.golsTime2}`
      : '— × —';
    const data = jogo.dataHora
      ? new Date(jogo.dataHora).toLocaleDateString('pt-BR')
      : '—';
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
   REGISTRAR — ESTRELAS
   ============================================================ */
function setStars(n) {
  _starSelected = n;
  document.querySelectorAll('#spicker .spick').forEach((btn, i) => {
    btn.classList.toggle('on', i < n);
  });
}

/* ============================================================
   REGISTRAR — SENTIMENTO
   ============================================================ */
function selSent(el) {
  document.querySelectorAll('.sent-opt').forEach(b => b.classList.remove('on'));
  el.classList.add('on');
  _sentSelected = el.dataset.sent || '';
}

/* ============================================================
   REGISTRAR — SALVAR EXPERIÊNCIA
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

  if (!jogoId) {
    mostrarErro('Selecione um jogo antes de publicar.');
    document.getElementById('sel-jogo')?.focus();
    return;
  }
  if (!comentario) {
    mostrarErro('Escreva um comentário sobre o jogo.');
    document.getElementById('reg-comentario')?.focus();
    return;
  }
  if (_starSelected === 0) {
    mostrarErro('Selecione uma nota de 1 a 5 estrelas.');
    return;
  }

  const payload = {
    idJogo:     jogoId,
    nota:       converterNota(_starSelected),
    sentimento: _sentSelected,
    comentario,
    localizacao,
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

    if (res.data) _experiencias.unshift(res.data);
    renderFeed();
    renderTimeline(_tlFiltro);
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
   REGISTRAR — RESET DO FORMULÁRIO
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
   UTILITÁRIOS
   ============================================================ */

/** Escapa HTML para evitar XSS */
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Define o textContent de um elemento pelo id */
function set(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/** Converte o enum Nota (string ou int) para estrelas 1–5 */
function notaParaEstrelas(nota) {
  // com JsonStringEnumConverter: chega como "Tres", "Quatro", etc.
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
  // sem o conversor: chega como int (10, 20, 30...)
  return Math.round((nota || 0) / 10);
}

/** Gera HTML de estrelas preenchidas/vazias (espera valor 1–5) */
function starsHTML(n, compact = false) {
  n = Math.round(n || 0);
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star-icon${i > n ? ' empty' : ''}">★</span>`;
  }
  return html;
}

/** Emoji por sentimento */
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

/** Formata ISO date para dd/mm/yyyy hh:mm */
function formatarData(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '—';
  }
}

/** Converte estrelas (1–5) para o valor int do enum Nota esperado pelo backend */
function converterNota(estrelas) {
  const mapa = { 1: 10, 2: 20, 3: 30, 4: 40, 5: 50 };
  return mapa[estrelas] ?? 0;
}