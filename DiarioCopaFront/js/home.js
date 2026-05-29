/* ============================================================
   js/home.js — Diário Digital Copa 2026
   Lógica principal do feed/home autenticado

   Depende de:
     js/api.js   → apiFetch(endpoint, options)
     js/auth.js  → (apenas no login.html; aqui só le o token)

   Endpoints esperados no back-end (DiarioCopaApi):
     GET  /api/usuarios/perfil  → { nome, email }
     GET  /api/experiencias/listar-experiencias → [ ExperienciaRespostaDto ]
     POST /api/experiencias/criar-experiencia   → cria nova experiência
     GET  /api/jogos            → [ JogoDTO ] (opcional, fallback hardcoded)

   ExperienciaRespostaDto (backend real):
     {
       idExperiencia, jogoTitulo, dataJogo, fase,
       golsTime1, golsTime2, nota, sentimento,
       comentario, localizacao, dataRegistro
     }
   ============================================================ */

/* ============================================================
   ESTADO GLOBAL
   ============================================================ */
let _starSelected  = 0;       // nota selecionada (1–5)
let _sentSelected  = '';      // sentimento selecionado
let _tlFiltro      = '';      // filtro ativo na timeline
let _experiencias  = [];      // cache local das experiências

/* Mapa de jogos (fallback caso a API de jogos não esteja pronta) */
const JOGOS_MAP = {
  '1': { nome: '🇧🇷 Brasil × 🇦🇷 Argentina',  placar: '2 × 1', data: '17 Jun 2026', local: 'MetLife Stadium' },
  '2': { nome: '🇵🇹 Portugal × 🇨🇭 Suíça',    placar: '1 × 0', data: '15 Jun 2026', local: 'SoFi Stadium'    },
  '3': { nome: '🇩🇪 Alemanha × 🇫🇷 França',    placar: '1 × 1', data: '13 Jun 2026', local: 'AT&T Stadium'    },
  '4': { nome: '🇪🇸 Espanha × 🇨🇷 Costa Rica', placar: '4 × 0', data: '11 Jun 2026', local: 'Rose Bowl'       },
};

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Guarda de autenticação e redireciona se não houver token
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // 2. Carrega perfil do usuário
  await carregarPerfil();

  // 3. Carrega experiências e atualiza toda a UI
  await carregarExperiencias();
});

/* ============================================================
   PERFIL DO USUÁRIO
   ============================================================ */
async function carregarPerfil() {
  const nome = localStorage.getItem('nomeUsuario') || 'Torcedor';
  const iniciais = nome.split(' ').slice(0, 2).map(p => p[0].toUpperCase()).join('');
  const elNome = document.getElementById('user-name');
  const elAvatar = document.getElementById('user-avatar');
  if (elNome) elNome.textContent = nome;
  if (elAvatar) elAvatar.textContent = iniciais;
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
  // desativa todas as telas e abas
  document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.app-tab').forEach(t => t.classList.remove('active'));

  // ativa a tela pedida
  const tela = document.getElementById(`screen-${id}`);
  if (tela) tela.classList.add('active');

  // ativa a aba correspondente
  const tabs = document.querySelectorAll('.app-tab');
  tabs.forEach(t => {
    if (t.getAttribute('onclick')?.includes(`'${id}'`)) {
      t.classList.add('active');
    }
  });

  // ao entrar na tela de registrar, reseta o formulário
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

  // exibe as 5 mais recentes no feed
  const recentes = [..._experiencias]
    .sort((a, b) => new Date(b.dataRegistro) - new Date(a.dataRegistro))
    .slice(0, 5);

  lista.innerHTML = recentes.map(exp => cardFeedHTML(exp)).join('');
}

function cardFeedHTML(exp) {
  const stars = starsHTML(exp.nota || 0);
  const sentEmoji = sentiEmo(exp.sentimento);
  const data = formatarData(exp.dataRegistro);
  const loc = exp.localizacao
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
    if (exp.nota) tags.push(`<span class="tl-tag">${starsHTML(exp.nota, true)}</span>`);

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
  const countFav = 0; // TODO: implementar quando backend adicionar campo favorito
  const el = document.getElementById('lc-count-fav');
  if (el) el.textContent = `${countFav} jogo${countFav !== 1 ? 's' : ''}`;
}

/* ============================================================
   REGISTRAR — SELEÇÃO DE JOGO
   ============================================================ */
function selecionarJogo(sel) {
  const id   = sel.value;
  const jogo = JOGOS_MAP[id];

  const elNome   = document.getElementById('reg-jogo-nome');
  const elMeta   = document.getElementById('reg-jogo-meta');
  const elPlacar = document.getElementById('reg-jogo-placar');

  if (jogo) {
    if (elNome)   elNome.textContent   = jogo.nome;
    if (elMeta)   elMeta.textContent   = `${jogo.data} · ${jogo.local}`;
    if (elPlacar) elPlacar.textContent = jogo.placar;
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

  const jogoId     = document.getElementById('sel-jogo')?.value;
  const comentario = document.getElementById('reg-comentario')?.value.trim();
  const localizacao= document.getElementById('reg-localizacao')?.value.trim();

  // --- validações ---
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
    idJogo: jogoId,
    nota: converterNota(_starSelected),
    sentimento: _sentSelected,
    comentario,
    localizacao,
  };

  // estado de carregamento
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

    // sucesso: adiciona ao cache local e atualiza toda a UI
    if (res.data) _experiencias.unshift(res.data);
    renderFeed();
    renderTimeline(_tlFiltro);
    renderListas();

    // feedback visual de sucesso
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
      // restaura caso não tenha redirecionado (erro)
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

/** Gera HTML de estrelas preenchidas/vazias */
function starsHTML(nota, compact = false) {
  const n = Math.round(nota || 0);
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

/** Converte estrelas (1–5) para o valor do enum Nota no backend */
function converterNota(estrelas) {
  const mapa = { 1: 10, 2: 20, 3: 30, 4: 40, 5: 50 };
  return mapa[estrelas] ?? 0;
}