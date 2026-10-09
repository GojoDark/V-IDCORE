'use strict';
const pageName = location.pathname.split('/').pop().replace('.html', '') || 'index';
const page = ['cs2', 'valorant', 'r6', 'sensi', 'lab'].includes(pageName)
  ? pageName === 'lab'
    ? 'sensi'
    : pageName
  : 'home';
const query = new URLSearchParams(location.search);
const allowedModules = page === 'cs2' ? ['crosshair','sensitivity','viewmodel','configs'] : page === 'valorant' ? ['crosshair','sensitivity','configs'] : ['sensitivity'];
const moduleName = allowedModules.includes(query.get('module')) ? query.get('module') : allowedModules[0];
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
let toastTimer;
function notify(message) {
  $('toast').textContent = message;
  $('toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 3200);
}
function storageRead(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) ?? fallback) : fallback;
  } catch {
    notify('Não foi possível ler os dados locais.');
    return fallback;
  }
}
function storageWrite(key, value) {
  try {
    const previous = localStorage.getItem(key);
    if (previous !== null) localStorage.setItem(key + '_backup', previous);
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    notify('O navegador não permitiu salvar. Exporte uma cópia.');
    return false;
  }
}
async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.append(el);
      el.select();
      const ok = document.execCommand('copy');
      el.remove();
      if (!ok) throw Error();
    }
    notify('Copiado para a área de transferência.');
  } catch {
    notify('Não foi possível copiar. Selecione o texto e copie manualmente.');
  }
}
function download(name, text, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
const gameOptions = [
  ['cs2', 'Counter-Strike 2'],
  ['valorant', 'VALORANT'],
  ['r6', 'Rainbow Six Siege · hipfire'],
];
function field(id, label, type = 'number', value = '', opts = {}) {
  const help = opts.help
    ? `<button type="button" class="help" aria-label="${esc(label)}: ${esc(opts.help)}" data-help="${esc(opts.help)}">ⓘ</button>`
    : '';
  const head = `<span class="field-head"><label for="${id}">${esc(label)}</label>${type === 'range' ? `<output for="${id}" id="${id}V">${value}</output>` : help}</span>`;
  let input;
  if (type === 'select') {
    input = `<select id="${id}">${opts.options.map(([v, t]) => `<option value="${v}" ${String(v) === String(value) ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>`;
  } else {
    input = `<input id="${id}" type="${type}" ${type === 'checkbox' ? (value ? 'checked' : '') : `value="${esc(value)}"`} ${opts.min !== undefined ? `min="${opts.min}"` : ''} ${opts.max !== undefined ? `max="${opts.max}"` : ''} ${opts.step !== undefined ? `step="${opts.step}"` : ''} ${type === 'number' ? 'inputmode="decimal"' : ''}>`;
  }
  return `<div class="field ${type === 'checkbox' ? 'check' : ''}" id="${id}Row">${head}${input}</div>`;
}
const range = (id, label, val, min, max, step = 1) =>
  field(id, label, 'range', val, { min, max, step });
const check = (id, label, val = false) => field(id, label, 'checkbox', val);
const select = (id, label, val, options) => field(id, label, 'select', val, { options });
const number = (id, label, val, min = 0.000001, step = 'any', help = '') =>
  field(id, label, 'number', val, { min, step, help });
const details = (title, content) => `<details><summary>${title}</summary>${content}</details>`;
function setupBackup() {
  const dialog = document.createElement('dialog');
  dialog.className='backup-dialog';
  dialog.innerHTML='<div class="section-heading"><h2>Seu workspace, com você.</h2><button id="backupClose" class="ghost" aria-label="Fechar backup">✕</button></div><p class="hint">Exporte miras, setups e histórico deste navegador. Ao restaurar, apenas as chaves do arquivo são atualizadas; uma cópia dos valores anteriores fica guardada.</p><div class="actions"><button class="primary" id="backupExport">Exportar backup JSON</button><label class="button" for="backupFile">Restaurar arquivo</label><input hidden type="file" id="backupFile" accept="application/json,.json"></div><p id="backupStatus" role="status"></p>';
  document.body.append(dialog);
  $('backupOpen').onclick=()=>dialog.showModal();
  $('backupClose').onclick=()=>dialog.close();
  $('backupExport').onclick=()=>{
    try {
      const data={};
      for(let i=0;i<localStorage.length;i++) { const key=localStorage.key(i); if(key.startsWith('voidcore_') && !key.endsWith('_backup')) data[key]=JSON.parse(localStorage.getItem(key)); }
      download('voidcore-workspace-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify({format:'voidcore-workspace',version:1,data},null,2),'application/json');
      $('backupStatus').textContent='Backup exportado.';
    } catch { $('backupStatus').textContent='Falha ao exportar. Os dados locais foram preservados.'; }
  };
  $('backupFile').onchange=async e=>{
    try {
      const file=e.target.files[0]; if(!file) return;
      if(file.size>2000000) throw Error('Arquivo muito grande.');
      const pack=JSON.parse(await file.text());
      if(pack.format!=='voidcore-workspace'||pack.version!==1||!pack.data||Array.isArray(pack.data)||typeof pack.data!=='object') throw Error('Formato inválido.');
      const entries=Object.entries(pack.data);
      if(!entries.length||entries.length>100) throw Error('Quantidade de dados inválida.');
      const keys=['voidcore_cs2_crosshair_v4','voidcore_val_crosshair_v4','voidcore_cs2_viewmodel_v4','voidcore_cs2_sensitivity_v4','voidcore_valorant_sensitivity_v4','voidcore_r6_sensitivity_v4','voidcore_val_presets','voidcore_sensi_history','voidcore_converter_draft_v4','voidcore_calibration_v4','voidcore_cs2_crosshair_v3'];
      for(const [key,value] of entries) {
        if(!keys.includes(key)||!value||typeof value!=='object') throw Error('Chave ou conteúdo incompatível: '+key);
        if(key==='voidcore_val_presets'||key==='voidcore_sensi_history') { if(!Array.isArray(value)||value.length>1000) throw Error('Lista inválida: '+key); }
        else if(Array.isArray(value)) throw Error('Perfil inválido: '+key);
        if(key==='voidcore_cs2_viewmodel_v4') vmCode(value);
        if(key==='voidcore_cs2_crosshair_v4') csCommands(value);
        if(key.endsWith('_sensitivity_v4')) { if(!Number.isFinite(Number(value.dpi))||Number(value.dpi)<=0||!Number.isFinite(Number(value.sens))||Number(value.sens)<=0) throw Error('Setup inválido: '+key); }
      }
      const before=Object.fromEntries(entries.map(([k])=>[k,localStorage.getItem(k)]));
      try {
        localStorage.setItem('voidcore_restore_backup',JSON.stringify(before));
        for(const [k,v] of entries) localStorage.setItem(k,JSON.stringify(v));
      } catch(err) { for(const [k,v] of Object.entries(before)) { if(v===null)localStorage.removeItem(k); else localStorage.setItem(k,v); } throw err; }
      $('backupStatus').textContent='Backup restaurado. Reabra o módulo para carregar os valores.';
    } catch(err) { $('backupStatus').textContent='Falha: '+err.message; }
    e.target.value='';
  };
}

function shell(content) {
  const nav = [
    ['home', 'index.html', '⌂', 'Visão geral'],
    ['cs2', 'cs2.html', '01', 'Counter-Strike 2'],
    ['valorant', 'valorant.html', '02', 'VALORANT'],
    ['r6', 'r6.html', '03', 'Rainbow Six Siege'],
    ['sensi', 'sensi.html', '◎', 'Sensi Hub'],
  ];
  $('app').innerHTML =
    `<aside class="sidebar" id="sidebar"><a href="index.html" class="brand" aria-label="VØIDCORE início"><img class="brand-wordmark" src="assets/wordmark.svg" alt="VØIDCORE"></a><div class="nav-caption">WORKSPACE / V4.3</div><nav class="nav" aria-label="Navegação principal">${nav.map(([p, url, icon, title]) => `<a href="${url}" class="${page === p ? 'current' : ''}" ${page === p ? 'aria-current="page"' : ''}><span class="nav-icon" aria-hidden="true">${icon}</span>${title}</a>`).join('')}</nav><div class="sidebar-foot"><span class="status-dot"></span>Ferramentas locais<br><span class="hint">TOOLS FOR A HIGHER STANDARD</span></div></aside><div class="shell"><header class="topbar"><div class="actions"><button class="menu-toggle ghost" aria-expanded="false" aria-controls="sidebar" aria-label="Abrir navegação">☰</button><span>Workspace <span class="muted">/</span> <b>${page === 'home' ? 'Visão geral' : page === 'sensi' ? 'Sensi Hub' : GAME[page].name}</b></span></div><div class="top-right"><span class="tag">PRECISION TOOLKIT</span><button class="small ghost" id="backupOpen">Backup</button><span class="version">V4.3</span></div></header><main id="main">${content}</main><footer><span>VØIDCORE © 2026</span><span>PRECISION. PERFORMANCE. CONTROL.</span><span>LOCAL FIRST / V4.3</span></footer></div>`;
  document.querySelector('.menu-toggle').onclick = function () {
    const on = $('sidebar').classList.toggle('open');
    this.setAttribute('aria-expanded', on);
    this.setAttribute('aria-label', on ? 'Fechar navegação' : 'Abrir navegação');
    document.body.classList.toggle('nav-open', on);
  };
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      $('sidebar').classList.remove('open');
      document.body.classList.remove('nav-open');
      document.querySelector('.menu-toggle').setAttribute('aria-expanded', 'false');
    }
  });
  setupBackup();
  document.title = `${page === 'home' ? 'Tools for a higher standard' : page === 'sensi' ? 'Sensi Hub' : GAME[page].name} — VØIDCORE V4.3`;
}
function pageHead(kicker, title, subtitle, tag = 'LOCAL WORKSPACE') {
  return `<div class="page-head"><div><div class="eyebrow">${kicker}</div><h1>${title}</h1><p>${subtitle}</p></div><span class="tag">${tag}</span></div>`;
}
function tabs() {
  const modules =
    page === 'cs2'
      ? [
          ['crosshair', 'Mira'],
          ['sensitivity', 'Sensibilidade'],
          ['viewmodel', 'Viewmodel'],
          ['configs', 'Configurações'],
        ]
      : page === 'valorant'
        ? [
            ['crosshair', 'Mira'],
            ['sensitivity', 'Sensibilidade'],
            ['configs', 'Configurações'],
          ]
        : [['sensitivity', 'Sensibilidade']];
  return `<nav class="tabs" aria-label="Módulos ${GAME[page].name}">${modules.map(([key, label]) => `<a href="${page}.html?module=${key}" class="${moduleName === key ? 'active' : ''}" ${moduleName === key ? 'aria-current="page"' : ''}>${label}</a>`).join('')}</nav>`;
}
function dashboard() {
  return '<div class="section-heading dashboard-title"><h2>Seu setup em um olhar</h2><span>NESTE NAVEGADOR</span></div><div class="setup-grid">'+['cs2','valorant','r6'].map(game=>{
    const s=storageRead('voidcore_'+game+'_sensitivity_v4',null);
    const valid=s && Number.isFinite(+s.dpi) && +s.dpi>0 && Number.isFinite(+s.sens) && +s.sens>0;
    const cm=valid ? game==='r6' ? +s.measuredCm : cm360(+s.dpi,+s.sens,game==='cs2' ? +(s.yaw || 0.022) : 0.07) : 0;
    return `<a class="setup-card" href="${game}.html?module=sensitivity"><span class="eyebrow">${GAME[game].name}</span><strong>${cm>0 ? fmt(cm)+' <small>cm/360°</small>' : 'Configure seu setup'}</strong><span class="hint">${valid ? esc(s.dpi)+' DPI · '+esc(s.sens)+' sens' : 'Salve a sensibilidade para ver aqui.'}</span><span class="setup-link">${valid ? 'Ajustar setup' : 'Começar'} ↗</span></a>`;
  }).join('')+'</div>';
}

function home() {
  shell(
    `<section class="hero"><div><div class="eyebrow">COMPETITIVE TOOLS / V4</div><h1>Seu próximo nível.<br><em>Em cada detalhe.</em></h1><p>Menos distração. Mais controle. Um workspace para ajustar sua mira, calibrar sua sensibilidade e refinar o que importa.</p><div class="actions"><a class="button primary" href="cs2.html">Abrir CS2 workspace <span aria-hidden="true">↗</span></a><a class="button ghost" href="sensi.html">Calibrar sensibilidade</a></div></div><div class="hero-visual" aria-hidden="true"><div class="orbit"></div><div class="orbit inner"></div><img src="assets/symbol.svg" alt=""><span class="visual-label">THE CORE OF YOUR CONTROL</span></div></section><section><div class="section-heading"><h2>Escolha seu workspace</h2><span>01 — 04</span></div><div class="game-list">${[
      ['01', 'cs2.html', 'Counter-Strike 2', 'Mira, sensibilidade, viewmodel e configurações.'],
      ['02', 'valorant.html', 'VALORANT', 'Mira, códigos de perfil e sensibilidade.'],
      ['03', 'r6.html', 'Rainbow Six Siege', 'Hipfire e escala física com seu multiplier.'],
      ['04', 'sensi.html', 'Sensi Hub', 'Calibre, converta e compare em um passo de cada vez.'],
    ]
      .map(
        ([n, url, title, desc]) =>
          `<a class="game-entry" href="${url}"><span class="game-number">${n}</span><strong>${title}</strong><p>${desc}</p><span class="arrow" aria-hidden="true">↗</span></a>`,
      )
      .join(
        '',
      )}</div></section><div class="principle"><span class="metric">cm / 360°</span><div><h3>Uma referência física. Entre jogos.</h3><p>Sensibilidades iguais podem produzir movimentos diferentes. Use a distância física para comparar hipfire; use o teste no jogo para encontrar seu controle.</p></div></div>${dashboard()}`,
  );
}
const sceneArt = '<img class="scene-image" src="assets/range-render.png" alt="" aria-hidden="true">';
function preview(kind = 'cs2') {
  return `<div class="canvas-panel"><div class="panel-bar"><h3>${kind === 'vm' ? 'Viewmodel Studio' : 'Crosshair Studio'}</h3><small>PREVIEW INTERATIVO</small></div><div class="preview" id="preview" data-scene="dark" data-kind="${kind}">${sceneArt}<div class="preview-meta"><span id="resolutionLabel">1920 × 1080 · referência</span><span id="stateLabel">PARADO</span></div>${kind === 'vm' ? '<div id="model" class="weapon-model"><img src="assets/viewmodel-ak47.png" alt="AK-47 em perspectiva de primeira pessoa"></div><div class="aim-marker"></div><span class="model-caption">RIFLE / ENQUADRAMENTO</span>' : `<div id="${kind === 'cs2' ? 'csCross' : 'vCross'}" class="crosshair ${kind === 'valorant' ? 'valorant' : ''}" aria-label="Prévia visual da mira"></div>`}<div class="preview-foot"><span>${kind === 'vm' ? 'ENQUADRAMENTO APROXIMADO' : 'FOCUS / CENTER'}</span><span>VØIDCORE STUDIO</span></div></div>${
    kind === 'vm'
      ? ''
      : `<div class="panel-bar"><div class="states" aria-label="Estado do preview">${[
          ['idle', 'Parado'],
          ['move', 'Movimento'],
          ['fire', 'Disparo'],
        ]
          .map(
            ([s, label]) =>
              `<button data-state="${s}" class="${s === 'idle' ? 'active' : ''}" aria-pressed="${s === 'idle'}">${label}</button>`,
          )
          .join('')}</div><div class="preview-zoom" aria-label="Ampliação do preview"><span>Zoom</span><button data-zoom="1" class="active" aria-pressed="true">1×</button><button data-zoom="2" aria-pressed="false">2×</button><button data-zoom="4" aria-pressed="false">4×</button></div></div>`
  }<div class="preview-note">${kind === 'vm' ? 'AK-47 em perspectiva de primeira pessoa, com FOV e offsets ajustáveis. Referência ilustrativa; confira o resultado final no CS2.' : 'Mira renderizada sobre cenário ilustrativo. Use 1× para a escala base ou amplie para inspecionar os detalhes.'}</div></div>`;
}
function bindInputs(update) {
  document.querySelectorAll('main input,main select').forEach((el) => {
    el.addEventListener('input', update);
    el.addEventListener('change', update);
  });
  update();
}
function outputs() {
  document.querySelectorAll('input[type=range]').forEach((e) => {
    const out = $(e.id + 'V');
    if (out) out.textContent = e.value;
  });
}
function show(id, on) {
  const el = $(id);
  if (el) el.hidden = !on;
}
function localControls(title) {
  return `<div class="divider"></div><div class="actions"><button class="small" id="saveLocal">Salvar preset</button><button class="small ghost" id="loadLocal">Carregar salvo</button></div><p class="save-status" id="saveStatus" role="status">${title}</p>`;
}
function captureFields() {
  return Object.fromEntries(
    [...document.querySelectorAll('main input[id],main select[id]')].filter(e => e.type !== 'file').map((e) => [
      e.id,
      e.type === 'checkbox' ? e.checked : e.value,
    ]),
  );
}
function validateFields(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw Error('Preset inválido.');
  const changes = [];
  for (const [id, v] of Object.entries(data)) {
    const el = $(id);
    if (!el || !el.matches('main input,main select') || el.type === 'file') continue;
    if (el.type === 'checkbox') {
      if (typeof v !== 'boolean') throw Error('Estado inválido: ' + id);
    } else if (el.tagName === 'SELECT') {
      if (![...el.options].some((o) => o.value === v)) throw Error('Opção inválida: ' + id);
    } else if (el.type === 'color') {
      if (!/^#[0-9a-f]{6}$/i.test(v)) throw Error('Cor inválida.');
    } else if (['range', 'number'].includes(el.type)) {
      if (
        (typeof v !== 'number' && typeof v !== 'string') || v === '' ||
        !Number.isFinite(+v) ||
        (el.min !== '' && +v < +el.min) ||
        (el.max !== '' && +v > +el.max)
      )
        throw Error('Valor fora da faixa: ' + id);
    }
    changes.push([el, v]);
  }
  if (!changes.length) throw Error('Nenhum campo compatível.');
  return changes;
}
function applyFields(data) {
  validateFields(data).forEach(([el, v]) => {
    if (el.type === 'checkbox') el.checked = v;
    else el.value = v;
  });
}
function presetStorage(key, update, legacy) {
  $('saveLocal').onclick = () => {
    if (storageWrite(key, captureFields())) {
      $('saveStatus').textContent = 'Preset salvo neste navegador.';
      if (key === 'voidcore_val_crosshair_v4') {
        let library = storageRead('voidcore_val_presets', []);
        if (!Array.isArray(library)) library = [];
        library.unshift({
          name: 'Preset V4 · ' + new Date().toLocaleString('pt-BR'),
          code: vBuildCode(),
        });
        storageWrite('voidcore_val_presets', library.slice(0, 15));
      }
    }
  };
  $('loadLocal').onclick = () => {
    let data = storageRead(key, null);
    if (!data && legacy) {
      data = storageRead(legacy, null);
      if (data?.dot !== undefined) {
        data.csDot = data.dot;
        delete data.dot;
      }
      if (data?.scopeColor !== undefined) {
        data.csScopeColor = data.scopeColor;
        delete data.scopeColor;
      }
    }
    if (!data) {
      $('saveStatus').textContent = 'Nenhum preset salvo ainda.';
      return;
    }
    try {
      applyFields(data);
      update();
      $('saveStatus').textContent = 'Preset carregado.';
    } catch (e) {
      $('saveStatus').textContent = e.message;
    }
  };
}
function crosshair() {
  const cs = page === 'cs2';
  const styles = [
    ['static', 'Cruz estática'],
    ['circleStatic', 'Círculo estático'],
    ['square', 'Quadrado estático'],
    ['dotOnly', 'Apenas ponto'],
    ['staticQuad', 'Static Quadrant'],
    ['dynamic', 'Cruz dinâmica'],
    ['circleDynamic', 'Círculo dinâmico'],
    ['classicDynamic', 'Dinâmica clássica'],
    ['responsiveDynamic', 'Disparo responsivo'],
    ['dynamicQuad', 'Dynamic Quadrant'],
  ];
  const commonScene = select('scene', 'Cenário', 'dark', [
    ['dark', 'Estúdio · noite'],
    ['dust', 'Estúdio · luz quente'],
    ['mirage', 'Estúdio · luz fria'],
    ['inferno', 'Estúdio · natural'],
  ]);
  let controls = cs
    ? select('csStyle', 'Geometria', 'static', styles) +
      range('csSize', 'Tamanho', 8, 0, 36, 0.5) +
      range('csGap', 'Espaçamento', 4, -10, 30, 0.5) +
      range('csThick', 'Espessura', 2, 0, 8, 0.5) +
      range('csQuadrant', 'Quadrant size', 0.42, 0.08, 1, 0.01) +
      field('csColor', 'Cor', 'color', '#a393ff') +
      check('csDot', 'Ponto central') +
      details(
        'Ajustes avançados',
        range('csAlpha', 'Opacidade', 100, 0, 100) +
          select('csOutlineMode', 'Contorno', 'full', [
            ['full', 'Completo'],
            ['half', 'Parcial · visual'],
            ['none', 'Sem contorno'],
          ]) +
          field('csOutlineColor', 'Cor do contorno', 'color', '#000000') +
          range('csOutlineAlpha', 'Opacidade do contorno', 100, 0, 100) +
          range('csSpread', 'Variação dinâmica', 242, 64, 320) +
          range('csSplit', 'Separação no disparo', 7, 0, 20) +
          range('csInnerAlpha', 'Opacidade interna', 100, 0, 100) +
          check('csTStyle', 'Formato T') +
          check('csScopeColor', 'Manter cor na luneta', true) +
          range('csScopeScale', 'Escala da luneta', 0.16, 0.05, 1, 0.01) +
          check('csFollowRecoil', 'Seguir coice · referência') +
          select('csResolution', 'Resolução de referência', '1920x1080', [
            ['1280x720', '1280 × 720'],
            ['1280x960', '1280 × 960'],
            ['1440x1080', '1440 × 1080'],
            ['1920x1080', '1920 × 1080'],
            ['2560x1440', '2560 × 1440'],
          ]) +
          commonScene,
      )
    : field('vColor', 'Cor', 'color', '#a393ff') +
      check('vInner', 'Linhas internas', true) +
      range('vInnerH', 'Comprimento horizontal', 4, 0, 20) +
      range('vInnerV', 'Comprimento vertical', 4, 0, 20) +
      range('vInnerThick', 'Espessura', 2, 0, 10) +
      range('vInnerGap', 'Espaçamento', 2, 0, 20) +
      check('vDot', 'Ponto central') +
      range('vDotSize', 'Tamanho do ponto', 2, 1, 6) +
      details(
        'Ajustes avançados',
        range('vOpacity', 'Opacidade geral · preview', 1, 0, 1, 0.05) +
          range('vInnerOpacity', 'Opacidade interna', 1, 0, 1, 0.05) +
          check('vOutline', 'Contorno', true) +
          range('vOutlineOpacity', 'Opacidade do contorno', 0.5, 0, 1, 0.05) +
          range('vOutlineThickness', 'Espessura do contorno', 1, 1, 6) +
          range('vDotOpacity', 'Opacidade do ponto', 1, 0, 1, 0.05) +
          check('vMoveError', 'Erro de movimento') +
          range('vMoveMult', 'Multiplicador de movimento', 0.2, 0, 3, 0.01) +
          check('vFireError', 'Erro de disparo') +
          range('vFireMult', 'Multiplicador de disparo', 0.2, 0, 3, 0.01) +
          check('vOuter', 'Linhas externas') +
          range('vOuterH', 'Comprimento externo H', 2, 0, 20) +
          range('vOuterV', 'Comprimento externo V', 2, 0, 20) +
          range('vOuterThick', 'Espessura externa', 2, 0, 10) +
          range('vOuterGap', 'Espaçamento externo', 10, 0, 40) +
          range('vOuterOpacity', 'Opacidade externa', 1, 0, 1, 0.05) +
          check('vOuterMoveError', 'Erro externo de movimento') +
          range('vOuterMoveMult', 'Multiplicador externo de movimento', 0.2, 0, 3, 0.01) +
          check('vOuterFireError', 'Erro externo de disparo') +
          range('vOuterFireMult', 'Multiplicador externo de disparo', 0.2, 0, 3, 0.01) +
          check('vUsePrimaryAds', 'Usar principal em ADS', true) +
          details(
            'Sniper · referência visual',
            field('vSniperColor', 'Cor do ponto', 'color', '#ff0000') +
              range('vSniperOpacity', 'Opacidade do ponto sniper', 0.75, 0, 1, 0.05) +
              range('vSniperThickness', 'Espessura do ponto sniper', 1, 1, 6) +
              '<div class="sniper-sample" aria-label="Referência visual do ponto sniper"><span id="vSniperDot"></span></div><p class="hint">Referência separada. Estes campos não entram no código principal.</p>',
          ) +
          commonScene,
      );
  shell(
    pageHead(
      cs ? 'COUNTER-STRIKE 2 / STUDIO' : 'VALORANT / STUDIO',
      'A precisão começa aqui.',
      'Ajuste sua mira com espaço para ver. Revele os detalhes quando precisar.',
    ) +
      tabs() +
      `<div class="workspace studio"><section>${preview(page)}<div class="under-preview"><div class="section-heading"><h3>Pontos de partida</h3><span>PRESETS DO WORKSPACE</span></div><div class="presets">${(cs
        ? [
            ['precision', 'Precisão'],
            ['spray', 'Spray'],
            ['dot', 'Ponto'],
            ['quadrant', 'Quadrant'],
          ]
        : [
            ['micro', 'Micro'],
            ['classic', 'Clássica'],
            ['dot', 'Ponto'],
            ['dynamic', 'Dinâmica'],
          ]
      )
        .map(([k, l]) => `<button data-preset="${k}">${l}</button>`)
        .join(
          '',
        )}</div><div class="notice" id="compatibility"></div><div class="io"><div class="section-heading"><h3>${cs ? 'Comandos compatíveis' : 'Código de perfil'}</h3><button class="small ghost" id="copyCode">Copiar ${cs ? 'comandos' : 'código'}</button></div><pre class="codebox" id="crossCode" tabindex="0"></pre>${details('Importar / exportar', `<label for="importCode" class="hint">${cs ? 'Comandos cl_crosshair separados por ponto e vírgula' : 'Código VALORANT 0;…;P;…'}</label><textarea class="import-area" id="importCode" placeholder="Cole seu ${cs ? 'conjunto de comandos' : 'código'} aqui"></textarea><div class="actions"><button class="small primary" id="importBtn">Aplicar</button><button class="small" id="exportJSON">Exportar preset JSON</button><label class="button small ghost" for="importFile">Abrir JSON</label><input type="file" id="importFile" accept=".json,application/json" hidden></div><p class="save-status" id="importStatus" role="status"></p>`)}</div></div></section><aside class="control-panel" aria-label="Controles da mira"><div class="control-title"><h3>Configurar mira</h3><span>01 / ${cs ? 'CS2' : 'VAL'}</span></div>${controls}${localControls('Salvo apenas neste navegador.')}</aside></div>`,
  );
  const update = () => {
    outputs();
    $('preview').dataset.scene = $('scene').value;
    if (cs) {
      const s = $('csStyle').value,
        circle = s.startsWith('circle'),
        quad = s.includes('Quad'),
        dot = s === 'dotOnly',
        classic = s === 'classicDynamic';
      show('csSizeRow', !(circle || s === 'square' || dot || s === 'staticQuad'));
      show('csGapRow', !dot);
      show('csQuadrantRow', quad);
      show('csDotRow', !dot);
      show('csTStyleRow', !circle && !quad && !dot && s !== 'square');
      show('csSpreadRow', ['dynamic', 'dynamicQuad', 'circleDynamic'].includes(s));
      show('csSplitRow', classic);
      show('csInnerAlphaRow', classic);
      show('csScopeColorRow', circle || quad || dot || s === 'square');
      show('csScopeScaleRow', circle || quad || dot || s === 'square');
      show('csFollowRecoilRow', dot);
      $('resolutionLabel').textContent =
        $('csResolution').value.replace('x', ' × ') + ' · referência';
      csPixelCross(
        $('csCross'),
        +$('csSize').value,
        +$('csGap').value,
        +$('csThick').value,
        $('csColor').value,
        $('csDot').checked,
        $('csOutlineMode').value,
        s,
        +$('csSpread').value,
      );
      $('crossCode').textContent = csCommands();
      $('compatibility').textContent = ['static', 'classicDynamic', 'responsiveDynamic'].includes(s)
        ? 'A geometria usa comandos existentes. Cor e opacidade do contorno, separação e escala visual podem diferir no jogo.'
        : 'Geometria visual de referência. A exportação contém apenas ajustes compatíveis; esse formato não é reproduzido por cvars confirmadas.';
    } else {
      const o = vGet();
      vRender($('vCross'), o);
      const sniper = $('vSniperDot');
      if (sniper) {
        sniper.style.width = sniper.style.height = 4 + o.sniperThickness * 3 + 'px';
        sniper.style.background = o.sniperColor;
        sniper.style.opacity = o.sniperOpacity;
      }
      ['H', 'V', 'Thick', 'Gap', 'Opacity'].forEach((k) => {
        show('vInner' + k + 'Row', o.inner);
        show('vOuter' + k + 'Row', o.outer);
      });
      show('vDotSizeRow', o.dot);
      show('vDotOpacityRow', o.dot);
      show('vOutlineOpacityRow', o.outline);
      show('vOutlineThicknessRow', o.outline);
      show('vMoveErrorRow', o.inner);
      show('vFireErrorRow', o.inner);
      show('vMoveMultRow', o.inner && o.moveError);
      show('vFireMultRow', o.inner && o.fireError);
      show('vOuterMoveErrorRow', o.outer);
      show('vOuterFireErrorRow', o.outer);
      show('vOuterMoveMultRow', o.outer && o.outerMoveError);
      show('vOuterFireMultRow', o.outer && o.outerFireError);
      $('crossCode').textContent = vBuildCode();
      $('compatibility').textContent =
        'Código principal baseado no mapeamento presente na V3. Opacidade geral e cenário afetam somente o preview. ADS independente e sniper não são sobrescritos.';
    }
  };
  bindInputs(update);
  document.querySelectorAll('[data-zoom]').forEach(button=>button.onclick=()=>{
    $('preview').style.setProperty('--reticle-zoom',button.dataset.zoom);
    document.querySelectorAll('[data-zoom]').forEach(other=>{other.classList.toggle('active',other===button);other.setAttribute('aria-pressed',other===button);});
  });
  presetStorage(
    cs ? 'voidcore_cs2_crosshair_v4' : 'voidcore_val_crosshair_v4',
    update,
    cs ? 'voidcore_cs2_crosshair_v3' : null,
  );
  document.querySelectorAll('[data-state]').forEach(
    (b) =>
      (b.onclick = () => {
        csPreviewState = vPreviewState = b.dataset.state;
        document.querySelectorAll('[data-state]').forEach((x) => {
          x.classList.toggle('active', x === b);
          x.setAttribute('aria-pressed', x === b);
        });
        $('stateLabel').textContent = b.textContent.toUpperCase();
        update();
      }),
  );
  document.querySelectorAll('[data-preset]').forEach(
    (b) =>
      (b.onclick = () => {
        if (cs) {
          const p = {
            precision: ['static', 5, 3, 1, false, '#55ff88'],
            spray: ['classicDynamic', 7, 4, 2, false, '#00e5ff'],
            dot: ['dotOnly', 2, 0, 3, true, '#ff3355'],
            quadrant: ['staticQuad', 8, 5, 2, false, '#a393ff'],
          }[b.dataset.preset];
          applyFields(
            Object.fromEntries(
              ['csStyle', 'csSize', 'csGap', 'csThick', 'csDot', 'csColor'].map((k, i) => [
                k,
                p[i],
              ]),
            ),
          );
        } else {
          const p = {
            micro: {
              vColor: '#00ffff',
              vOutline: false,
              vDot: false,
              vInner: true,
              vInnerH: 2,
              vInnerV: 2,
              vInnerThick: 1,
              vInnerGap: 1,
              vInnerOpacity: 1,
              vOuter: false,
              vMoveError: false,
              vFireError: false,
            },
            classic: {
              vColor: '#ffffff',
              vOutline: true,
              vOutlineOpacity: 0.5,
              vOutlineThickness: 1,
              vDot: false,
              vInner: true,
              vInnerH: 4,
              vInnerV: 4,
              vInnerThick: 2,
              vInnerGap: 2,
              vInnerOpacity: 1,
              vOuter: false,
              vMoveError: false,
              vFireError: false,
            },
            dot: {
              vColor: '#ffffff',
              vOutline: true,
              vOutlineOpacity: 0.5,
              vOutlineThickness: 1,
              vDot: true,
              vDotOpacity: 1,
              vDotSize: 2,
              vInner: false,
              vOuter: false,
            },
            dynamic: {
              vColor: '#00ff7f',
              vOutline: false,
              vDot: false,
              vInner: true,
              vInnerH: 3,
              vInnerV: 3,
              vInnerThick: 1,
              vInnerGap: 2,
              vInnerOpacity: 1,
              vOuter: false,
              vMoveError: true,
              vMoveMult: 0.2,
              vFireError: true,
              vFireMult: 0.2,
            },
          }[b.dataset.preset];
          applyFields(p);
        }
        update();
      }),
  );
  $('copyCode').onclick = () => copyText($('crossCode').textContent);
  $('exportJSON').onclick = () =>
    download(
      'voidcore-' + page + '-crosshair.json',
      JSON.stringify({ version: 4, game: page, fields: captureFields() }, null, 2),
      'application/json',
    );
  $('importFile').onchange = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 100000) throw Error('Arquivo muito grande.');
      const data = JSON.parse(await file.text());
      if (data.game !== page || data.version !== 4) throw Error('Preset de outro jogo ou versão.');
      applyFields(data.fields);
      update();
      $('importStatus').textContent = 'Preset JSON importado.';
    } catch (err) {
      $('importStatus').textContent = 'Falha: ' + err.message;
    }
    e.target.value = '';
  };
  $('importBtn').onclick = () => {
    try {
      const message = cs ? importCS($('importCode').value) : importVAL($('importCode').value);
      update();
      $('importStatus').textContent = message;
    } catch (err) {
      $('importStatus').textContent = 'Falha: ' + err.message;
    }
  };
}
function csCommands(values) {
  const s = values || captureFields();
  const defaults = {csStyle:'static',csSize:8,csGap:4,csThick:2,csColor:'#a393ff',csDot:false,csOutlineMode:'full',csAlpha:100,csTStyle:false};
  const o = {...defaults,...s};
  for (const [id,min,max] of [['csSize',0,36],['csGap',-10,30],['csThick',0,8],['csAlpha',0,100]]) {
    if (!Number.isFinite(Number(o[id])) || Number(o[id]) < min || Number(o[id]) > max) throw Error('Preset CS2 inválido: '+id);
  }
  if (!/^#[0-9a-f]{6}$/i.test(o.csColor)) throw Error('Cor CS2 inválida.');
  const rgb = o.csColor.slice(1).match(/../g).map(v=>parseInt(v,16));
  const dot = o.csStyle === 'dotOnly';
  return [
    `cl_crosshairstyle ${o.csStyle === 'classicDynamic' ? 2 : o.csStyle === 'responsiveDynamic' || o.csStyle === 'dynamic' ? 3 : 4}`,
    `cl_crosshairsize ${dot ? 0 : Number(o.csSize)}`,
    `cl_crosshairgap ${Number(o.csGap)}`,
    `cl_crosshairthickness ${Number(o.csThick)}`,
    `cl_crosshairdot ${o.csDot || dot ? 1 : 0}`,
    `cl_crosshair_drawoutline ${o.csOutlineMode === 'none' ? 0 : 1}`,
    'cl_crosshairusealpha 1',
    `cl_crosshairalpha ${Math.round(Number(o.csAlpha)*255/100)}`,
    'cl_crosshaircolor 5',
    ...rgb.map((v,i)=>`cl_crosshaircolor_${['r','g','b'][i]} ${v}`),
    `cl_crosshair_t ${o.csTStyle ? 1 : 0}`
  ].join('; ')+';';
}
function importCS(raw) {
  const mapping = {
    cl_crosshairsize: 'csSize',
    cl_crosshairgap: 'csGap',
    cl_crosshairthickness: 'csThick',
  };
  const data = {},
    rgb = {};
  let count = 0;
  for (const line of raw.split(/[;\n]+/)) {
    const m = line.trim().match(/^(cl_crosshair\S+)\s+"?([^"\s]+)"?$/i);
    if (!m) continue;
    const k = m[1].toLowerCase(),
      v = m[2];
    if (!Number.isFinite(+v)) throw Error('Vale apenas valor numérico: ' + k);
    if (mapping[k]) data[mapping[k]] = v;
    else if (k === 'cl_crosshairstyle') {
      if (![2, 3, 4].includes(+v)) throw Error('Estilo não suportado.');
      data.csStyle = +v === 2 ? 'classicDynamic' : +v === 3 ? 'responsiveDynamic' : 'static';
    } else if (k === 'cl_crosshairusealpha') {
      if (![0,1].includes(+v)) throw Error('Estado alfa inválido.');
      data.csUseAlpha = +v;
    } else if (k === 'cl_crosshairalpha') {
      if (+v < 0 || +v > 255) throw Error('Alfa fora de 0–255.');
      data.csAlpha = Math.round(+v / 2.55);
    } else if (['cl_crosshairdot', 'cl_crosshair_t', 'cl_crosshair_drawoutline'].includes(k)) {
      if (![0, 1].includes(+v)) throw Error('Estado deve ser 0 ou 1.');
      if (k === 'cl_crosshairdot') data.csDot = +v === 1;
      else if (k === 'cl_crosshair_t') data.csTStyle = +v === 1;
      else data.csOutlineMode = +v === 1 ? 'full' : 'none';
    } else if (/^cl_crosshaircolor_[rgb]$/.test(k)) {
      if (+v < 0 || +v > 255) throw Error('RGB fora de 0–255.');
      rgb[k.slice(-1)] = Math.round(+v);
    } else if (k === 'cl_crosshaircolor') {
      const palette = ['#ff0000','#00ff00','#ffff00','#0000ff','#00ffff'];
      if (![0,1,2,3,4,5].includes(+v)) throw Error('Cor desconhecida.');
      if (+v !== 5) data.csColor = palette[+v];
    } else continue;
    count++;
  }
  if (['r', 'g', 'b'].every((k) => rgb[k] !== undefined))
    data.csColor = '#' + ['r', 'g', 'b'].map((k) => rgb[k].toString(16).padStart(2, '0')).join('');
  if (data.csUseAlpha === 0) data.csAlpha = 100;
  delete data.csUseAlpha;
  if (data.csSize !== undefined && +data.csSize === 0 && data.csDot === true) data.csStyle = 'dotOnly';
  if (!count) throw Error('Nenhum comando compatível encontrado.');
  applyFields(data);
  return `${count} comandos reconhecidos. Outros comandos não foram aplicados.`;
}
function importVAL(raw) {
  const tokens = raw.trim().split(';');
  if (tokens[0] !== '0' || !tokens.includes('P')) throw Error('Código principal não reconhecido.');
  let section = 'G',
    map = {},
    unknown = 0;
  for (let i = 1; i < tokens.length;) {
    if (['P', 'A', 'S'].includes(tokens[i])) {
      section = tokens[i++];
      continue;
    }
    const k = tokens[i++],
      v = tokens[i++];
    if (v === undefined || ['P', 'A', 'S'].includes(v)) throw Error('Código incompleto.');
    if (map[section + ':' + k] !== undefined) throw Error('Campo duplicado: '+k);
    map[section + ':' + k] = v;
  }
  const data = {vColor:'#ffffff',vOpacity:1,vOutline:true,vOutlineOpacity:0.5,vOutlineThickness:1,vDot:false,vDotOpacity:1,vDotSize:2,vInner:true,vInnerH:6,vInnerV:6,vInnerThick:2,vInnerGap:3,vInnerOpacity:0.8,vMoveError:true,vMoveMult:1,vFireError:true,vFireMult:1,vOuter:true,vOuterH:2,vOuterV:2,vOuterThick:2,vOuterGap:10,vOuterOpacity:0.35,vOuterMoveError:true,vOuterMoveMult:1,vOuterFireError:true,vOuterFireMult:1,vUsePrimaryAds:true};
  const mapping = {
    o: 'vOutlineOpacity',
    t: 'vOutlineThickness',
    d: 'vDot',
    a: 'vDotOpacity',
    z: 'vDotSize',
    '0b': 'vInner',
    '0a': 'vInnerOpacity',
    '0l': 'vInnerH',
    '0v': 'vInnerV',
    '0t': 'vInnerThick',
    '0o': 'vInnerGap',
    '0m': 'vMoveError',
    '0s': 'vMoveMult',
    '0f': 'vFireError',
    '0e': 'vFireMult',
    '1b': 'vOuter',
    '1a': 'vOuterOpacity',
    '1l': 'vOuterH',
    '1v': 'vOuterV',
    '1t': 'vOuterThick',
    '1o': 'vOuterGap',
    '1m': 'vOuterMoveError',
    '1s': 'vOuterMoveMult',
    '1f': 'vOuterFireError',
    '1e': 'vOuterFireMult',
  };
  for (const [k, v] of Object.entries(map)) {
    if (k === 'P:u') {
      if (!/^[a-f\d]{6}([a-f\d]{2})?$/i.test(v)) throw Error('Cor inválida.');
      data.vColor = '#' + v.slice(0, 6);
    } else if (k === 'P:c') {
      const palette = [
        '#ffffff',
        '#00ff00',
        '#7fff00',
        '#dfff00',
        '#ffff00',
        '#00ffff',
        '#ff00ff',
        '#ff0000',
      ];
      if (+v !== 8) {
        if (!palette[+v]) throw Error('Cor desconhecida.');
        data.vColor = palette[+v];
      }
    } else if (k === 'G:p') {
      if (!['0', '1'].includes(v)) throw Error('Estado ADS inválido.');
      data.vUsePrimaryAds = v === '1';
    } else if (k.startsWith('P:') && mapping[k.slice(2)]) {
      const id = mapping[k.slice(2)];
      if ($(id).type === 'checkbox') {
        if (!['0', '1'].includes(v)) throw Error('Estado inválido.');
        data[id] = v === '1';
      } else data[id] = v;
    } else if (!['P:0g', 'P:1g', 'G:s'].includes(k)) unknown++;
  }
  if (map['P:o'] !== undefined) data.vOutline = +map['P:o'] > 0;
  if (map['P:0l'] !== undefined && map['P:0g'] !== '1') data.vInnerV = map['P:0l'];
  if (map['P:1l'] !== undefined && map['P:1g'] !== '1') data.vOuterV = map['P:1l'];
  for (const flag of ['0g','1g']) if (map['P:'+flag] !== undefined && !['0','1'].includes(map['P:'+flag])) throw Error('Estado inválido: '+flag);
  applyFields(data);
  return `Perfil principal importado.${unknown ? ' ' + unknown + ' campos de ADS/sniper ou não mapeados não foram importados.' : ''}`;
}
function positive(ids) {
  let ok = true;
  ids.forEach((id) => {
    const e = $(id);
    const valid =
      e &&
      e.value !== '' &&
      Number.isFinite(+e.value) &&
      +e.value > 0 &&
      (!e.min || +e.value >= +e.min) &&
      (!e.max || +e.value <= +e.max);
    if (e) e.setAttribute('aria-invalid', !valid);
    if (!valid) ok = false;
  });
  return ok;
}
function sensitivity() {
  const r6 = page === 'r6',
    saved = storageRead('voidcore_' + page + '_sensitivity_v4', {});
  shell(
    pageHead(
      r6 ? 'RAINBOW SIX SIEGE / HIPFIRE' : GAME[page].name.toUpperCase() + ' / SENSITIVITY',
      'Conheça seu movimento.',
      'Uma referência clara para o seu ajuste. Use o teste no jogo para confirmar.',
    ) +
      tabs() +
      `<div class="workspace"><section><div class="canvas-panel"><div class="panel-bar"><h3>${r6 ? 'Escala de hipfire' : 'Distância física'}</h3><small>${r6 ? 'MULTIPLIER' : 'HIPFIRE / 360°'}</small></div><div class="measure-stage"><div class="measure-label">${r6 ? 'MODIFICADOR DE ENTRADA' : 'UM GIRO COMPLETO'}</div><div class="measure" id="distance">—</div><div class="ruler" aria-hidden="true"></div><span class="hint" id="sensitivityMeta"></span></div><div class="stats"><div><small>${r6 ? 'GAME eDPI' : 'eDPI'}</small><b id="edpi">—</b></div><div><small>${r6 ? 'MEDIDA NO JOGO' : 'ESCALA ANGULAR'}</small><b id="yawStat">—</b></div><div><small>REFERÊNCIA</small><b>${r6 ? 'Hipfire' : '360°'}</b></div></div></div>${r6 ? `<div class="notice">O multiplier modifica a entrada; ele não é, por si só, a escala angular em graus. A V4 remove a distância absoluta não validada da V3. Informe uma medida real de 360° para usar R6 nas comparações físicas.</div><p class="hint" style="margin-top:14px">Referência: <a href="https://www.ubisoft.com/en-gb/game/rainbow-six/siege/news-updates/6kY6b5JByBY3P6vQWWinla/fov-and-input-sensitivity" target="_blank" rel="noopener">Ubisoft — FOV and Input Sensitivity ↗</a></p>` : `<div class="under-preview"><div class="eyebrow">FAIXA DE TESTE / ADVISOR</div><h2 id="adviceRange">—</h2><p class="notice" id="adviceText"></p></div>`}<div class="under-preview actions"><a class="button primary" href="sensi.html">Iniciar calibração ↗</a><a class="button ghost" href="sensi.html?mode=convert">Converter entre jogos</a></div></section><aside class="control-panel"><div class="control-title"><h3>Seu setup</h3><span>HIPFIRE</span></div>${number('dpi', 'DPI do mouse', saved.dpi || 800, 1, 1)}${number('sens', 'Sensibilidade ' + (r6 ? 'horizontal' : 'no jogo'), saved.sens || (r6 ? 10 : page === 'cs2' ? 0.8 : 0.2514), r6 ? 1 : 0.000001, r6 ? 1 : 'any')}${page === 'cs2' ? number('yaw','m_yaw do seu CS2',saved.yaw || 0.022,0.000001,'any','Padrão 0.022. Use o valor real do console se sua configuração o alterou.') : ''}${
        r6
          ? number(
              'mult',
              'MouseSensitivityMultiplierUnit',
              saved.mult || 0.02,
              0.000001,
              'any',
              'Use o valor do seu GameSettings.ini.',
            ) +
            number(
              'measuredCm',
              'Distância medida · cm/360°',
              saved.measuredCm || '',
              0.000001,
              'any',
              'Opcional. Meça a distância do mouse para um giro completo no jogo.',
            )
          : details(
              'Objetivo do teste',
              select('goal', 'Prioridade', 'balanced', [
                ['balanced', 'Aim geral'],
                ['recoil', 'Recoil / microajuste'],
                ['flick', 'Flick'],
                ['tracking', 'Tracking'],
              ]) +
                select('aimStyle', 'Movimento', 'hybrid', [
                  ['hybrid', 'Braço + pulso'],
                  ['arm', 'Braço'],
                  ['wrist', 'Pulso'],
                ]) +
                select('pad', 'Mousepad útil', 'medium', [
                  ['small', 'Pequeno · menos de 30 cm'],
                  ['medium', 'Médio · 30–39 cm'],
                  ['large', 'Grande · 40+ cm'],
                ]),
            )
      }<p class="hint error" id="sensError" role="status"></p><div class="divider"></div><button class="small" id="saveSensitivity">Salvar setup</button></aside></div>`,
  );
  if(r6) ['dpi','sens','mult'].forEach(id => $(id).addEventListener('input',()=>{ $('measuredCm').value=''; }));
  const update = () => {
    const valid = positive(r6 ? ['dpi', 'sens', 'mult'] : page === 'cs2' ? ['dpi','sens','yaw'] : ['dpi','sens']) && (!r6 || (+$('sens').value <= 100 && Number.isInteger(+$('sens').value) && ($('measuredCm').value === '' || (Number.isFinite(+$('measuredCm').value) && +$('measuredCm').value > 0))));
    $('saveSensitivity').disabled = !valid;
    $('sensError').textContent = valid ? '' : 'Informe valores maiores que zero.';
    if (!valid) {
      ['distance', 'edpi', 'yawStat'].forEach((id) => ($(id).textContent = '—'));
      if (!r6) $('adviceRange').textContent = '—';
      return;
    }
    const dpi = +$('dpi').value,
      s = +$('sens').value;
    $('edpi').textContent = fmt(dpi * s, 0);
    if (r6) {
      $('distance').textContent = fmt(s * +$('mult').value, 4);
      const measured = +$('measuredCm').value;
      $('yawStat').textContent = measured > 0 ? fmt(measured) + ' cm' : 'Não informada';
      $('sensitivityMeta').textContent = 'sens horizontal × multiplier';
    } else {
      const yaw = page === 'cs2' ? +$('yaw').value : GAME[page].yaw;
      const cm = cm360(dpi, s, yaw);
      $('distance').innerHTML = fmt(cm) + ' <span>cm / 360°</span>';
      $('yawStat').textContent = yaw;
      $('sensitivityMeta').textContent = 'Uma referência física, sem aceleração de mouse.';
      const range = adviceRange(page, $('goal').value, $('aimStyle').value, $('pad').value);
      $('adviceRange').textContent =
        fmt(sensForCm(range[1], dpi, yaw), 4) +
        ' – ' +
        fmt(sensForCm(range[0], dpi, yaw), 4) +
        ' sens';
      $('adviceText').textContent =
        `${range[0]}–${range[1]} cm/360°. ${cm < range[0] ? 'Seu ajuste é mais rápido que esta faixa.' : cm > range[1] ? 'Seu ajuste é mais lento que esta faixa.' : 'Seu ajuste está nesta faixa.'} Faixa heurística herdada do Advisor: teste mudanças pequenas; não é uma sensibilidade ideal universal.`;
    }
  };
  bindInputs(update);
  $('saveSensitivity').onclick = () => {
    if (
      !$('saveSensitivity').disabled &&
      storageWrite('voidcore_' + page + '_sensitivity_v4', captureFields())
    )
      notify('Setup salvo neste navegador.');
  };
}
function adviceRange(game, goal, style = 'hybrid', pad = 'medium') {
  let a = (
    game === 'cs2'
      ? { balanced: [27, 45], recoil: [32, 52], flick: [22, 38], tracking: [27, 46] }
      : { balanced: [25, 45], recoil: [30, 50], flick: [20, 38], tracking: [25, 45] }
  )[goal].slice();
  if (game === 'cs2') {
    if (style === 'arm') {
      a[0] += 3;
      a[1] += 5;
    }
    if (style === 'wrist') {
      a[0] = Math.max(16, a[0] - 5);
      a[1] -= 5;
    }
    if (pad === 'small') {
      a[0] = Math.max(16, a[0] - 6);
      a[1] = Math.min(a[1], 36);
    }
    if (pad === 'large' && style !== 'wrist') a[1] += 3;
  }
  return a;
}
function vmCode(values) {
  const s = values || storageRead('voidcore_cs2_viewmodel_v4', {vmFov:68,vmX:2.5,vmY:0,vmZ:-1.5});
  for (const [id,min,max] of [['vmFov',54,68],['vmX',-2.5,2.5],['vmY',-2,2],['vmZ',-2,2]]) {
    if (s[id] === '' || !Number.isFinite(Number(s[id])) || Number(s[id]) < min || Number(s[id]) > max) throw Error('Viewmodel salvo inválido: '+id);
  }
  return `viewmodel_presetpos 0; viewmodel_fov ${Number(s.vmFov)}; viewmodel_offset_x ${Number(s.vmX).toFixed(1)}; viewmodel_offset_y ${Number(s.vmY).toFixed(1)}; viewmodel_offset_z ${Number(s.vmZ).toFixed(1)};`;
}
function viewmodel() {
  shell(
    pageHead(
      'COUNTER-STRIKE 2 / VIEWMODEL',
      'Abra espaço para o jogo.',
      'Explore FOV e offsets em um estudo de enquadramento limpo.',
    ) +
      tabs() +
      `<div class="workspace studio"><section>${preview('vm')}<div class="under-preview"><div class="section-heading"><h3>Pontos de partida</h3><span>VIEWMODEL</span></div><div class="presets">${[
        ['classic', 'Clássico'],
        ['wide', 'Aberto'],
        ['compact', 'Compacto'],
        ['center', 'Central'],
      ]
        .map(([k, l]) => `<button data-vm="${k}">${l}</button>`)
        .join(
          '',
        )}</div><div class="notice">FOV aqui é o do viewmodel, não o do mundo. Mãos, proporção e rifle são referências visuais; os comandos exportam apenas FOV e offsets.</div><pre class="codebox" id="vmCode"></pre><div class="actions"><button id="copyVM">Copiar comandos</button><button id="exportVM" class="ghost">Exportar .cfg</button></div></div></section><aside class="control-panel"><div class="control-title"><h3>Enquadramento</h3><span>CS2</span></div>${range('vmFov', 'FOV · 54 menor / 68 maior', 68, 54, 68)}${range('vmX', 'X · esquerda / direita', 2.5, -2.5, 2.5, 0.1)}${range('vmY', 'Y · profundidade', 0, -2, 2, 0.1)}${range('vmZ', 'Z · baixo / cima', -1.5, -2, 2, 0.1)}${details(
        'Referências de tela',
        select('vmAspect', 'Aspecto', '16-9', [
          ['16-9', '16:9'],
          ['16-10', '16:10'],
          ['4-3-stretched', '4:3 stretched'],
          ['4-3-bars', '4:3 black bars'],
          ['5-4-stretched', '5:4 stretched'],
        ]) +
          select('vmHand', 'Mão visual', 'right', [
            ['right', 'Direita'],
            ['left', 'Esquerda'],
          ]) +
          select('scene', 'Cenário', 'dark', [
            ['dark', 'Estúdio · noite'],
            ['dust', 'Estúdio · luz quente'],
            ['mirage', 'Estúdio · luz fria'],
            ['inferno', 'Estúdio · natural'],
          ]),
      )}${localControls('Salve para incluir no autoexec.')}</aside></div>`,
  );
  const update = () => {
    outputs();
    const f = +$('vmFov').value,
      x = +$('vmX').value,
      y = +$('vmY').value,
      z = +$('vmZ').value,
      hand = $('vmHand').value === 'left' ? -1 : 1;
    const aspect = $('vmAspect').value;
    const stretch = aspect === '5-4-stretched' ? (16/9)/(5/4) : aspect === '4-3-stretched' ? (16/9)/(4/3) : 1;
    const scale = Math.tan(68 * Math.PI / 360) / Math.tan(f * Math.PI / 360);
    const w=$('preview').clientWidth, h=$('preview').clientHeight;
    $('model').style.left='0%';
    $('model').style.transform =
      `translate(${hand * x * w * 0.022}px,${-z * h * 0.022 + y * h * 0.006}px) scale(${hand * stretch * scale * (1 - y * 0.035)},${scale * (1 - y * 0.035)})`;
    $('preview').classList.toggle('black-bars', aspect === '4-3-bars');
    $('preview').dataset.scene = $('scene').value;
    $('resolutionLabel').textContent = aspect.replaceAll('-', ':');
    $('stateLabel').textContent = 'FOV '+f+'°';
    $('vmCode').textContent = vmCode(captureFields());
  };
  bindInputs(update);
  new ResizeObserver(update).observe($('preview'));
  presetStorage('voidcore_cs2_viewmodel_v4', update);
  document.querySelectorAll('[data-vm]').forEach(
    (b) =>
      (b.onclick = () => {
        const p = {
          classic: [68, 2.5, 0, -1.5],
          wide: [68, 2.5, 2, -2],
          compact: [60, 1.4, -1, -1.8],
          center: [62, 0.2, -0.5, -1],
        }[b.dataset.vm];
        applyFields(Object.fromEntries(['vmFov', 'vmX', 'vmY', 'vmZ'].map((id, i) => [id, p[i]])));
        update();
      }),
  );
  $('copyVM').onclick = () => copyText($('vmCode').textContent);
  $('exportVM').onclick = () => download('voidcore-viewmodel.cfg', $('vmCode').textContent);
}
function configs() {
  if (page === 'valorant') return valConfigs();
  const sens = storageRead('voidcore_cs2_sensitivity_v4', { sens: 0.8 });
  shell(
    pageHead(
      'COUNTER-STRIKE 2 / CONFIGS',
      'Seu ajuste. Pronto para usar.',
      'Gere um autoexec enxuto com os valores salvos no workspace.',
    ) +
      tabs() +
      `<div class="workspace"><section><div class="canvas-panel"><div class="panel-bar"><h3>autoexec.cfg</h3><small>GENERATED / CS2</small></div><div style="padding:22px"><pre class="codebox" id="configCode"></pre><div class="actions"><button class="primary" id="downloadConfig">Baixar .cfg ↓</button><button class="ghost" id="copyConfig">Copiar conteúdo</button></div><p class="hint" style="margin-top:18px">Coloque o arquivo na pasta game/csgo/cfg. Execute com <code>exec autoexec</code> no console.</p></div></div><div class="notice">Sensibilidade salva: ${esc(sens.sens)}. O viewmodel usa seu preset salvo ou o preset clássico. Revise o conteúdo antes de aplicar.</div>${details(
        'Performance Advisor · orientações de teste',
        select('perfGpu', 'GPU', 'mid', [
          ['low', 'Entrada / antiga'],
          ['mid', 'Intermediária'],
          ['high', 'Alta'],
        ]) +
          select('perfCpu', 'CPU', 'modern', [
            ['old', '6c/6t ou similar'],
            ['modern', '6c/12t+ moderna'],
            ['high', 'High-end'],
          ]) +
          select('perfHz', 'Monitor · Hz', '180', [
            ['60', '60'],
            ['144', '144'],
            ['180', '180'],
            ['240', '240'],
            ['360', '360'],
          ]) +
          select('perfGoal', 'Prioridade', 'fps', [
            ['fps', 'FPS / competitivo'],
            ['balanced', 'Equilibrado'],
            ['quality', 'Qualidade'],
          ]) +
          '<p class="notice" id="perfAdvice"></p>',
      )}</section><aside class="control-panel"><div class="control-title"><h3>Autoexec</h3><span>.CFG</span></div>${number('aeFps', 'FPS máximo · 0 ilimitado', 300, 0, 1)}${number('aeFpsUi', 'FPS no menu', 120, 0, 1)}${select(
        'aeConsole',
        'Tecla do console',
        'F10',
        [
          ['F10', 'F10'],
          ['F11', 'F11'],
          ['F12', 'F12'],
        ],
      )}${check('aeSens', 'Incluir sensibilidade salva', true)}${check('aeVm', 'Incluir viewmodel salvo', true)}${check('aeCross', 'Incluir mira salva', true)}${details(
        'Adicionar um bind',
        check('includeBind', 'Incluir bind') +
          field('bindKey', 'Tecla', 'text', 'j') +
          select('bindAction', 'Ação', '+jump', [
            ['+jump', 'Pular'],
            ['slot1', 'Arma primária'],
            ['slot2', 'Pistola'],
            ['slot3', 'Faca'],
            ['lastinv', 'Última arma'],
            ['drop', 'Dropar arma'],
            ['+use', 'Usar'],
            ['buymenu', 'Menu de compra'],
            ['player_ping', 'Ping'],
            ['toggleconsole', 'Console'],
          ]),
      )}<p id="configError" class="hint error" role="status"></p></aside></div>`,
  );
  const update = () => {
    let valid = true;
    ['aeFps', 'aeFpsUi'].forEach((id) => {
      const e = $(id);
      const ok = e.value !== '' && Number.isInteger(+e.value) && +e.value >= 0;
      e.setAttribute('aria-invalid', !ok);
      valid &&= ok;
    });
    const key = $('bindKey').value.trim();
    if ($('includeBind').checked && !/^[a-z0-9_+-]{1,12}$/i.test(key)) valid = false;
    $('configError').textContent = valid ? '' : 'Informe FPS inteiro ≥ 0 e uma tecla válida.';
    let lines = [
      '// VØIDCORE V4 — CS2 autoexec',
      `fps_max ${$('aeFps').value}`,
      `fps_max_ui ${$('aeFpsUi').value}`,
      `bind "${$('aeConsole').value}" "toggleconsole"`,
    ];
    try {
      if ($('aeSens').checked) {
        if (!Number.isFinite(Number(sens.sens)) || Number(sens.sens) <= 0) throw Error('Sensibilidade salva inválida.');
        lines.push(`sensitivity ${Number(sens.sens)}`);
        if(sens.yaw !== undefined) { if(!Number.isFinite(Number(sens.yaw))||Number(sens.yaw)<=0) throw Error('m_yaw salvo inválido.'); lines.push(`m_yaw ${Number(sens.yaw)}`); }
      }
      if ($('aeVm').checked) lines.push(vmCode().replaceAll('; ', ';\n'));
      const cross = storageRead('voidcore_cs2_crosshair_v4', null);
      if ($('aeCross').checked && cross) lines.push(csCommands(cross).replaceAll('; ', ';\n'));
    } catch (err) { valid = false; $('configError').textContent = err.message + ' Repare o preset no editor ou desative sua inclusão.'; }
    if ($('includeBind').checked) lines.push(`bind "${key}" "${$('bindAction').value}"`);
    lines.push('echo "VØIDCORE autoexec loaded"');
    $('configCode').textContent = valid
      ? lines.join('\n')
      : 'Corrija os valores para gerar o arquivo.';
    $('downloadConfig').disabled = $('copyConfig').disabled = !valid;
    const hz = +$('perfHz').value,
      goal = $('perfGoal').value,
      cpu = $('perfCpu').value,
      gpu = $('perfGpu').value;
    let cap =
      cpu === 'old'
        ? Math.max(180, Math.round((hz * 1.35) / 10) * 10)
        : Math.round((hz * 1.7) / 10) * 10;
    if (goal === 'quality') cap = Math.max(hz, Math.round((hz * 1.15) / 10) * 10);
    if (gpu === 'low') cap = Math.min(cap, 240);
    $('perfAdvice').textContent =
      `Cap de teste herdado do Advisor: ${cap} FPS. É uma heurística, não um benchmark. Compare estabilidade de frametime no seu computador. ` +
      (goal === 'fps'
        ? 'Preserve sombras úteis para leitura e reduza efeitos que custem FPS.'
        : 'Ajuste qualidade mantendo folga acima da taxa do monitor.') +
      (cpu === 'old' ? ' Feche processos em segundo plano antes de reduzir resolução.' : '') +
      (gpu === 'low' ? ' Teste reduzir MSAA se a GPU ficar perto de 100%.' : '');
  };
  bindInputs(update);
  $('downloadConfig').onclick = () => download('autoexec.cfg', $('configCode').textContent);
  $('copyConfig').onclick = () => copyText($('configCode').textContent);
}
function valConfigs() {
  shell(
    pageHead(
      'VALORANT / CONFIGS',
      'Sua biblioteca de miras.',
      'Perfis salvos no navegador, prontos para copiar e aplicar.',
    ) +
      tabs() +
      `<div class="canvas-panel"><div class="panel-bar"><h3>Perfis locais</h3><a class="button small primary" href="valorant.html">Abrir Crosshair ↗</a></div><div style="padding:24px"><div id="valLibrary" class="saved-list"></div><p class="hint" style="margin-top:22px">Salve um preset no editor para adicioná-lo à biblioteca. Perfis da V3 continuam disponíveis neste navegador.</p></div></div>`,
  );
  let arr = storageRead('voidcore_val_presets', []);
  if (!Array.isArray(arr)) arr = [];
  const current = storageRead('voidcore_val_crosshair_v4', null);
  if (current) arr.unshift({ name: 'Workspace V4 · último preset', fields: current });
  const host = $('valLibrary');
  if (!arr.length) {
    host.innerHTML =
      '<div class="measure-stage"><div class="eyebrow">NENHUM PERFIL AINDA</div><h2>Sua próxima mira começa no editor.</h2><a class="button" href="valorant.html">Configurar mira ↗</a></div>';
    return;
  }
  arr.filter(item=>item && typeof item === 'object').forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'saved-item';
    const label = document.createElement('span');
    label.textContent = item.name || 'Preset ' + (i + 1);
    const button = document.createElement('button');
    button.className = 'small';
    button.textContent = item.fields ? 'Abrir no editor' : 'Copiar código';
    button.onclick = () => {
      if (item.fields) location.href = 'valorant.html?load=1';
      else if (typeof item.code === 'string') copyText(item.code);
      else notify('Este perfil não tem um código válido.');
    };
    div.append(label, button);
    if (typeof item.code === 'string') {
      const edit = document.createElement('a'); edit.className='button small ghost'; edit.textContent='Editar'; edit.href='valorant.html#code='+encodeURIComponent(item.code); div.append(edit);
    }
    host.append(div);
  });
}
let hubMode = ['convert', 'compare'].includes(query.get('mode')) ? query.get('mode') : 'calibrate';
let wizardStep = 1,
  finder = { lo: null, hi: null, mid: null, trials: 0 },
  hubSetup = { game: 'cs2', dpi: 800, sens: 0.8, yaw:0.022, goal: 'balanced' },
  hubDraft = {};
function hubTabs() {
  return `<nav class="tabs" aria-label="Intenção do Sensi Hub">${[
    ['calibrate', 'Calibrar'],
    ['convert', 'Converter'],
    ['compare', 'Comparar'],
  ]
    .map(
      ([m, l]) =>
        `<a href="sensi.html${m === 'calibrate' ? '' : '?mode=' + m}" class="${hubMode === m ? 'active' : ''}" ${hubMode === m ? 'aria-current="page"' : ''}>${l}</a>`,
    )
    .join('')}</nav>`;
}
function sensi() {
  shell(
    pageHead(
      'SENSI HUB / CALIBRATION',
      'Encontre seu ponto de controle.',
      'Uma intenção por vez. Meça, teste e refine com consistência.',
    ) +
      hubTabs() +
      '<div id="hubContent"></div>',
  );
  const session=storageRead('voidcore_calibration_v4',null);
  if(session && [1,2,3].includes(session.wizardStep) && ['cs2','valorant'].includes(session.hubSetup?.game) && Number.isFinite(session.hubSetup.dpi) && session.hubSetup.dpi>0 && Number.isFinite(session.hubSetup.sens) && session.hubSetup.sens>0 && Number.isFinite(session.finder?.mid) && session.finder.mid>0 && Number.isFinite(session.finder.lo) && session.finder.lo>0 && Number.isFinite(session.finder.hi) && session.finder.hi>=session.finder.lo) { wizardStep=session.wizardStep; finder=session.finder; hubSetup=session.hubSetup; }
  if (hubMode === 'calibrate') renderWizard();
  else if (hubMode === 'convert') renderConverter();
  else renderCompare();
}
function saveCalibration() { storageWrite('voidcore_calibration_v4',{wizardStep,finder,hubSetup}); }
function renderWizard() {
  saveCalibration();
  const host = $('hubContent');
  host.innerHTML = `<section class="wizard"><div class="wizard-progress" aria-label="Etapa da calibração">${['Seu setup', 'Teste no jogo', 'Seu resultado'].map((s, i) => `<span class="${wizardStep === i + 1 ? 'active' : ''}" ${wizardStep === i + 1 ? 'aria-current="step"' : ''}><b>${i + 1}</b>${s}</span>`).join('')}</div><div id="wizardBody"></div></section>`;
  const body = $('wizardBody');
  if (wizardStep === 1) {
    body.innerHTML = `<div class="wizard-heading"><h2>Comece de um ajuste conhecido.</h2><p>Use a sensibilidade atual como ponto de partida. O teste refina uma faixa a partir da sua percepção.</p></div><div class="canvas-panel" style="padding:24px"><div class="wizard-form">${select('sfGame', 'Jogo', hubSetup.game, gameOptions.slice(0, 2))}${number('sfDpi', 'DPI do mouse', hubSetup.dpi, 1, 1)}${number('sfStart', 'Sensibilidade atual', hubSetup.sens)}${number('sfYaw','CS2 · m_yaw',hubSetup.yaw || 0.022)}${select(
      'sfGoal',
      'Prioridade do teste',
      hubSetup.goal,
      [
        ['balanced', 'Aim geral'],
        ['recoil', 'Recoil / microajuste'],
        ['flick', 'Flick'],
        ['tracking', 'Tracking'],
      ],
    )}<p id="wizardError" class="error hint" role="status"></p><div class="step-actions"><span class="hint">Prepare um mapa de treino.</span><button class="primary" id="startCalibration">Começar teste →</button></div></div></div>`;
    show('sfYawRow',$('sfGame').value === 'cs2');
    $('sfGame').onchange = () => {
      show('sfYawRow',$('sfGame').value === 'cs2');
      $('sfStart').value = $('sfGame').value === 'cs2' ? 0.8 : 0.2514;
    };
    $('startCalibration').onclick = () => {
      if (!positive($('sfGame').value === 'cs2' ? ['sfDpi','sfStart','sfYaw'] : ['sfDpi','sfStart'])) {
        $('wizardError').textContent = 'Informe DPI e sensibilidade maiores que zero.';
        return;
      }
      hubSetup = {
        game: $('sfGame').value,
        dpi: +$('sfDpi').value,
        sens: +$('sfStart').value,
        yaw: $('sfGame').value === 'cs2' ? +$('sfYaw').value : 0.07,
        goal: $('sfGoal').value,
      };
      finder = {
        lo: hubSetup.sens * 0.55,
        hi: hubSetup.sens * 1.45,
        mid: hubSetup.sens,
        trials: 0,
      };
      wizardStep = 2;
      renderWizard();
    };
  } else if (wizardStep === 2) {
    body.innerHTML = `<div class="wizard-heading"><h2>Teste. Sinta. Refine.</h2><p>Faça a mesma sequência de microajustes, tracking e giros a cada tentativa. Responda depois de testar no jogo.</p></div><div class="canvas-panel"><div class="panel-bar"><h3>${GAME[hubSetup.game].name} · ${hubSetup.dpi} DPI</h3><small>CALIBRAÇÃO GUIADA</small></div><div class="measure-stage"><span class="measure-label">TESTE ESTA SENSIBILIDADE</span><div class="measure" id="trialValue"></div><span class="hint" id="trialRange"></span><div class="ruler" aria-hidden="true"></div><p class="hint" id="trialDistance"></p></div><div style="padding:24px"><p class="calibrate-instructions">Teste por alguns minutos. Sua mira ultrapassa o alvo ou exige deslocamento demais?</p><div class="actions trial-controls"><button data-choice="slow">Muito lenta</button><button class="primary" data-choice="good">Boa para mim</button><button data-choice="fast">Muito rápida</button></div><p class="trial-count" id="trialCount"></p><div class="step-actions"><button class="ghost" id="restartCalibration">Reiniciar</button><button id="finishCalibration">Ver resultado →</button></div></div></div>`;
    const updateTrial = () => {
      $('trialValue').innerHTML = fmt(finder.mid, GAME[hubSetup.game].dec) + ' <span>sens</span>';
      $('trialRange').textContent = `Faixa: ${fmt(finder.lo, 4)} – ${fmt(finder.hi, 4)}`;
      $('trialDistance').textContent =
        fmt(cm360(hubSetup.dpi, finder.mid, hubSetup.yaw || GAME[hubSetup.game].yaw)) + ' cm/360°';
      $('trialCount').textContent =
        finder.trials +
        ' RESPOSTAS / ' +
        (finder.trials ? 'CONTINUE ATÉ SENTIR CONSISTÊNCIA' : 'TESTE PRIMEIRO O VALOR CENTRAL');
      $('finishCalibration').disabled = finder.trials === 0;
    };
    document.querySelectorAll('[data-choice]').forEach(
      (b) =>
        (b.onclick = () => {
          const kind = b.dataset.choice;
          if (kind === 'slow') finder.lo = finder.mid;
          else if (kind === 'fast') finder.hi = finder.mid;
          else {
            finder.lo = finder.mid * 0.94;
            finder.hi = finder.mid * 1.06;
          }
          finder.mid = (finder.lo + finder.hi) / 2;
          finder.trials++;
          saveCalibration();
          updateTrial();
        }),
    );
    $('restartCalibration').onclick = () => {
      wizardStep = 1;
      renderWizard();
    };
    $('finishCalibration').onclick = () => {
      wizardStep = 3;
      renderWizard();
    };
    updateTrial();
  } else {
    const cm = cm360(hubSetup.dpi, finder.mid, hubSetup.yaw || GAME[hubSetup.game].yaw);
    body.innerHTML = `<div class="wizard-heading"><h2>Um ponto de partida seu.</h2><p>Este resultado resume o teste. Confirme em sessões diferentes antes de adotar uma mudança permanente.</p></div><div class="canvas-panel"><div class="measure-stage"><span class="measure-label">${GAME[hubSetup.game].name} / ${hubSetup.dpi} DPI</span><div class="measure">${fmt(finder.mid, 4)} <span>sens</span></div><span class="hint">Faixa refinada: ${fmt(finder.lo, 4)} – ${fmt(finder.hi, 4)}</span><div class="ruler" aria-hidden="true"></div></div><div class="stats"><div><small>DISTÂNCIA</small><b>${fmt(cm)} cm</b></div><div><small>RESPOSTAS</small><b>${finder.trials}</b></div><div><small>VARIAÇÃO INICIAL</small><b>${fmt((finder.mid / hubSetup.sens - 1) * 100, 1)}%</b></div></div><div style="padding:24px"><p class="notice">A faixa é iterativa e baseada na sua percepção. As sugestões do Advisor são heurísticas; mantenha o DPI e o setup iguais durante o teste.</p><div class="step-actions"><button class="ghost" id="backTrial">Continuar teste</button><div class="actions"><button id="copyResult">Copiar resultado</button><button class="primary" id="saveResult">Salvar setup</button></div></div></div></div>`;
    $('backTrial').onclick = () => {
      wizardStep = 2;
      renderWizard();
    };
    $('copyResult').onclick = () =>
      copyText(
        `${GAME[hubSetup.game].name} | ${hubSetup.dpi} DPI | sens ${fmt(finder.mid, 4)} | ${fmt(cm)} cm/360° | faixa ${fmt(finder.lo, 4)}–${fmt(finder.hi, 4)}`,
      );
    $('saveResult').onclick = () => {
      if (
        storageWrite('voidcore_' + hubSetup.game + '_sensitivity_v4', {
          dpi: hubSetup.dpi,
          sens: finder.mid,
          ...(hubSetup.game === 'cs2' ? {yaw:hubSetup.yaw || 0.022} : {}),
        })
      )
        notify('Resultado salvo no workspace ' + GAME[hubSetup.game].name + '.');
    };
  }
}
function shareFields(fields) {
  fields = Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== ''));
  const bytes = new TextEncoder().encode(JSON.stringify({ version: 4, mode: hubMode, fields }));
  const raw = btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '');
  copyText(location.href.split('#')[0] + '#preset=' + raw);
}
function loadShared() {
  if (!location.hash.startsWith('#preset=')) return;
  try {
    const raw = location.hash.slice(8);
    if (raw.length > 10000) throw Error('Link muito grande.');
    const str = atob(raw.replaceAll('-', '+').replaceAll('_', '/'));
    const data = JSON.parse(new TextDecoder().decode(Uint8Array.from(str, (c) => c.charCodeAt(0))));
    if (data.version === 4) {
      if (data.mode !== hubMode) {
        const url = new URL(location.href);
        url.searchParams.set('mode', data.mode);
        if (!['compare', 'convert'].includes(data.mode)) throw Error('Modo desconhecido.');
        location.replace(url.href);
        return;
      }
      applyFields(data.fields);
    } else {
      const map = {
        fromGame: 'fromGame',
        toGame: 'toGame',
        convDpi: 'convDpi',
        convDpiTo: 'convDpiTo',
        convSens: 'convSens',
      };
      const fields = {};
      Object.keys(map).forEach((k) => {
        if (data[k] !== undefined) fields[map[k]] = data[k];
      });
      applyFields(fields);
    }
    notify('Valores do link carregados.');
  } catch {
    notify('Não foi possível ler este preset compartilhado.');
  }
}
function renderConverter() {
  const r6 = storageRead('voidcore_r6_sensitivity_v4', {});
  $('hubContent').innerHTML =
    `<div class="workspace"><section><div class="canvas-panel"><div class="panel-bar"><h3>Seu ajuste no destino</h3><small>MESMA DISTÂNCIA / HIPFIRE</small></div><div class="measure-stage"><span class="measure-label" id="targetGame">VALORANT</span><div class="measure" id="convResult">—</div><span class="hint" id="convMeta"></span><div class="ruler" aria-hidden="true"></div></div><div class="stats"><div><small>cm/360°</small><b id="convCm">—</b></div><div><small>ORIGEM / eDPI</small><b id="convEdpiFrom">—</b></div><div><small>DESTINO / eDPI</small><b id="convEdpiTo">—</b></div></div></div><div class="notice">Preserva a distância física de um giro completo. FOV, zoom e ADS podem produzir percepções diferentes mesmo com o mesmo cm/360°.</div><div class="under-preview actions"><button id="copyConversion" class="primary">Copiar conversão</button><button id="shareConversion" class="ghost">Copiar link</button><button id="saveConversion">Salvar no destino</button></div>${details('Como calculamos', '<p class="hint">CS2: yaw 0.022. VALORANT: yaw 0.07, como no Hub original.</p><pre class="codebox">cm/360 = 914.4 / (DPI × sens × yaw)\nsens destino = 914.4 / (cm/360 × DPI destino × yaw destino)</pre><p class="hint">R6 usa uma medida física informada para calibrar a referência. O multiplier precisa permanecer igual durante a conversão.</p>')}</section><aside class="control-panel"><div class="control-title"><h3>1. Sua origem</h3><span>CONVERSÃO</span></div>${select('fromGame', 'Jogo atual', 'cs2', gameOptions)}${number('convDpi', 'DPI atual', 800, 1, 1)}${number('convSens', 'Sensibilidade atual', 0.8)}${number('sourceYaw','CS2 · m_yaw de origem',0.022)}${number('sourceCm', 'R6 · cm/360° medidos', r6.measuredCm || '')}<div class="divider"></div><div class="control-title"><h3>2. Seu destino</h3></div>${select('toGame', 'Jogo de destino', 'valorant', gameOptions)}${number('convDpiTo', 'DPI de destino', 800, 1, 1)}${number('targetYaw','CS2 · m_yaw de destino',0.022)}<div id="r6Reference">${number('r6Dpi', 'R6 · DPI da referência', r6.dpi || 800, 1, 1)}${number('r6Sens', 'R6 · sens da referência', r6.sens || 10, 1, 1)}${number('r6Cm', 'R6 · cm/360° da referência', r6.measuredCm || '')}<p class="hint">Use uma medição feita com esses valores e mantenha o multiplier. O resultado pode exigir arredondamento no jogo.</p></div><p class="save-status error" id="convError" role="status"></p></aside></div>`;
  const initialDraft = storageRead('voidcore_converter_draft_v4', null);
  if (initialDraft) { try { applyFields(initialDraft); } catch {} }
  const update = () => {
    const from = $('fromGame').value,
      to = $('toGame').value;
    show('sourceCmRow', from === 'r6');
    show('sourceYawRow', from === 'cs2'); show('targetYawRow', to === 'cs2');
    show('r6Reference', to === 'r6');
    let ids = ['convDpi', 'convSens', 'convDpiTo'];
    if (from === 'r6') ids.push('sourceCm');
    if (from === 'cs2') ids.push('sourceYaw'); if(to === 'cs2') ids.push('targetYaw');
    if (to === 'r6') ids.push('r6Dpi', 'r6Sens', 'r6Cm');
    $('targetGame').textContent = GAME[to].name;
    const valid = positive(ids);
    $('copyConversion').disabled = $('shareConversion').disabled = $('saveConversion').disabled = !valid;
    if (!valid) {
      ['convResult', 'convCm', 'convEdpiFrom', 'convEdpiTo'].forEach(
        (id) => ($(id).textContent = '—'),
      );
      $('convMeta').textContent = '';
      $('convError').textContent =
        'Preencha os valores positivos e as medidas de R6 quando necessárias.';
      return;
    }
    $('convError').textContent = '';
    const dpi = +$('convDpi').value,
      s = +$('convSens').value,
      destDpi = +$('convDpiTo').value;
    const cm = from === 'r6' ? +$('sourceCm').value : cm360(dpi, s, from === 'cs2' ? +$('sourceYaw').value : GAME[from].yaw);
    const out =
      to === 'r6'
        ? (+$('r6Sens').value * +$('r6Dpi').value * +$('r6Cm').value) / (destDpi * cm)
        : sensForCm(cm, destDpi, to === 'cs2' ? +$('targetYaw').value : GAME[to].yaw);
    $('convResult').innerHTML = fmt(out, 4) + ' <span>sens</span>';
    $('convCm').textContent = fmt(cm) + ' cm';
    $('convEdpiFrom').textContent = fmt(dpi * s, 0);
    $('convEdpiTo').textContent = fmt(destDpi * out, 0);
    $('convMeta').textContent = `${GAME[from].name} ${s} @ ${dpi} DPI → ${GAME[to].name} @ ${destDpi} DPI`;
    if(to === 'r6') {
      const rounded=Math.round(out);
      $('saveConversion').disabled = rounded < 1 || rounded > 100;
      $('convMeta').textContent += rounded >= 1 && rounded <= 100 ? ` · Slider ${rounded}: ${fmt(cm*out/rounded)} cm/360° (estimado)` : ' · Fora do slider 1–100: ajuste o multiplier e meça novamente.';
    }
    hubDraft = { from, to, dpi, s, destDpi, cm, out };
    storageWrite('voidcore_converter_draft_v4', Object.fromEntries(Object.entries(captureFields()).filter(([,v])=>v!=='')));
  };
  bindInputs(update);
  $('fromGame').addEventListener('change', () => {
    $('convSens').value =
      $('fromGame').value === 'cs2' ? 0.8 : $('fromGame').value === 'valorant' ? 0.2514 : 10;
    update();
  });
  $('copyConversion').onclick = () =>
    copyText(
      `${GAME[hubDraft.from].name} ${hubDraft.s} @ ${hubDraft.dpi} DPI → ${GAME[hubDraft.to].name} ${fmt(hubDraft.out, 4)} @ ${hubDraft.destDpi} DPI | ${fmt(hubDraft.cm)} cm/360°`,
    );
  $('shareConversion').onclick = () => shareFields(captureFields());
  $('saveConversion').onclick = () => {
    const data = {dpi:hubDraft.destDpi,sens:hubDraft.to === 'r6' ? Math.round(hubDraft.out) : hubDraft.out};
    if(hubDraft.to === 'cs2') data.yaw = +$('targetYaw').value;
    if (hubDraft.to === 'r6') { data.mult = r6.mult || 0.02; data.measuredCm = hubDraft.cm * hubDraft.out / data.sens; }
    if (storageWrite('voidcore_'+hubDraft.to+'_sensitivity_v4',data)) notify('Conversão salva no workspace '+GAME[hubDraft.to].name+'.');
  };
  try { const draft = storageRead('voidcore_converter_draft_v4',null); if (draft) applyFields(draft); } catch {}
  loadShared();
  update();
}
function renderCompare() {
  function side(letter, game, sens) {
    return `<div><div class="eyebrow">SETUP ${letter}</div>${select('abGame' + letter, 'Jogo', game, gameOptions)}${number('abDpi' + letter, 'DPI', 800, 1, 1)}${number('abSens' + letter, 'Sensibilidade', sens)}${number('abYaw'+letter,'CS2 · m_yaw',0.022)}${number('abMeasured' + letter, 'R6 · cm/360° medidos', '')}</div>`;
  }
  $('hubContent').innerHTML =
    `<div class="wizard"><div class="wizard-heading"><h2>Compare o movimento físico.</h2><p>Valores de eDPI de jogos diferentes não são uma referência equivalente. Compare a distância.</p></div><div class="compare-grid">${side('A', 'cs2', 0.8)}${side('B', 'valorant', 0.2514)}</div><div class="canvas-panel" style="margin-top:24px"><div class="stats"><div><small>A / cm/360°</small><b id="abCmA">—</b></div><div><small>B / cm/360°</small><b id="abCmB">—</b></div><div><small>DIFERENÇA</small><b id="abDiff">—</b></div></div><div style="padding:24px"><p id="abVerdict" class="hint" role="status"></p><div class="actions" style="margin-top:20px"><button id="abSave" class="primary">Salvar comparação</button><button id="abShare" class="ghost">Copiar link</button></div></div></div>${details('Histórico neste navegador', '<div class="saved-list" id="historyList"></div>')}</div>`;
  const update = () => {
    const a = $('abGameA').value,
      b = $('abGameB').value;
    show('abMeasuredARow', a === 'r6');
    show('abMeasuredBRow', b === 'r6');
    show('abYawARow', a === 'cs2'); show('abYawBRow', b === 'cs2');
    const ids = ['abDpiA', 'abSensA', 'abDpiB', 'abSensB'];
    if (a === 'cs2') ids.push('abYawA'); if(b === 'cs2') ids.push('abYawB');
    if (a === 'r6') ids.push('abMeasuredA');
    if (b === 'r6') ids.push('abMeasuredB');
    const valid = positive(ids);
    $('abSave').disabled = $('abShare').disabled = !valid;
    if (!valid) {
      ['abCmA', 'abCmB', 'abDiff'].forEach((id) => ($(id).textContent = '—'));
      $('abVerdict').textContent =
        'Informe valores positivos. R6 precisa de uma medida real para este setup.';
      return;
    }
    const ca =
        a === 'r6'
          ? +$('abMeasuredA').value
          : cm360(+$('abDpiA').value, +$('abSensA').value, a === 'cs2' ? +$('abYawA').value : GAME[a].yaw),
      cb =
        b === 'r6'
          ? +$('abMeasuredB').value
          : cm360(+$('abDpiB').value, +$('abSensB').value, b === 'cs2' ? +$('abYawB').value : GAME[b].yaw);
    const diff = ((cb - ca) / ca) * 100;
    $('abCmA').textContent = fmt(ca) + ' cm';
    $('abCmB').textContent = fmt(cb) + ' cm';
    $('abDiff').textContent = (diff >= 0 ? '+' : '') + fmt(diff, 1) + '%';
    $('abVerdict').textContent =
      Math.abs(diff) < 1
        ? 'Distâncias praticamente equivalentes (diferença menor que 1%).'
        : diff > 0
          ? 'B exige mais deslocamento de mouse: é fisicamente mais lenta.'
          : 'B exige menos deslocamento de mouse: é fisicamente mais rápida.';
  };
  bindInputs(update);
  ['A', 'B'].forEach((letter) =>
    $('abGame' + letter).addEventListener('change', () => {
      const g = $('abGame' + letter).value;
      $('abSens' + letter).value = g === 'cs2' ? 0.8 : g === 'valorant' ? 0.2514 : 10;
      update();
    }),
  );
  function history() {
    let arr = storageRead('voidcore_sensi_history', []);
    if (!Array.isArray(arr)) arr = [];
    const host = $('historyList');
    host.replaceChildren();
    if (!arr.length) {
      host.textContent = 'Nenhuma comparação salva ainda.';
      host.classList.add('hint');
      return;
    }
    arr.filter(item=>item && typeof item === 'object').forEach((item) => {
      const row = document.createElement('div');
      row.className = 'saved-item';
      row.textContent = `${item.a?.game || 'A'} ${item.a?.sens || ''} @ ${item.a?.dpi || ''} DPI → ${item.b?.game || 'B'} ${item.b?.sens || ''} @ ${item.b?.dpi || ''} DPI`;
      const reopen=document.createElement('button'); reopen.className='small ghost'; reopen.textContent='Reabrir';
      reopen.onclick=()=>{ try { applyFields({abGameA:item.a.game,abDpiA:item.a.dpi,abSensA:item.a.sens,abGameB:item.b.game,abDpiB:item.b.dpi,abSensB:item.b.sens,abYawA:item.a.yaw || 0.022,abYawB:item.b.yaw || 0.022,...(item.a.measured ? {abMeasuredA:item.a.measured}:{}),...(item.b.measured ? {abMeasuredB:item.b.measured}:{})}); update(); notify('Comparação carregada.'); } catch(err) { notify(err.message); } };
      row.append(reopen); host.append(row);
    });
  }
  $('abSave').onclick = () => {
    let arr = storageRead('voidcore_sensi_history', []);
    if (!Array.isArray(arr)) arr = [];
    arr.unshift({
      at: new Date().toISOString(),
      a: {
        game: $('abGameA').value,
        dpi: $('abDpiA').value,
        sens: $('abSensA').value,
        measured: $('abMeasuredA').value,
        yaw: $('abYawA').value,
      },
      b: {
        game: $('abGameB').value,
        dpi: $('abDpiB').value,
        sens: $('abSensB').value,
        measured: $('abMeasuredB').value,
        yaw: $('abYawB').value,
      },
    });
    if (storageWrite('voidcore_sensi_history', arr.slice(0, 12))) {
      history();
      notify('Comparação salva · histórico de até 12 testes.');
    }
  };
  $('abShare').onclick = () => shareFields(captureFields());
  history();
  loadShared();
  update();
}
if (page === 'home') home();
else if (page === 'sensi') sensi();
else if (page === 'r6' || moduleName === 'sensitivity') sensitivity();
else if (page === 'cs2' && moduleName === 'viewmodel') viewmodel();
else if (moduleName === 'configs') configs();
else crosshair();
if (page === 'valorant' && moduleName === 'crosshair' && location.hash.startsWith('#code=')) {
  try { importVAL(decodeURIComponent(location.hash.slice(6))); $('importStatus').textContent='Perfil aberto para edição.'; $('vColor').dispatchEvent(new Event('input')); } catch (err) { notify(err.message); }
}
if (page === 'valorant' && query.get('load') === '1' && $('loadLocal')) $('loadLocal').click();
