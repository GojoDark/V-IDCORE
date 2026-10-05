'use strict';
const $ = (id) => document.getElementById(id);
const GAME = {
  cs2: { name: 'CS2', yaw: 0.022, dec: 4 },
  valorant: { name: 'VALORANT', yaw: 0.07, dec: 4 },
  r6: { name: 'R6 Siege', yaw: 0.02, dec: 4 },
};
const cm360 = (dpi, sens, yaw) => (dpi > 0 && sens > 0 && yaw > 0 ? 914.4 / (dpi * sens * yaw) : 0);
const sensForCm = (cm, dpi, yaw) => (cm > 0 && dpi > 0 && yaw > 0 ? 914.4 / (cm * dpi * yaw) : 0);
const fmt = (n, d = 2) => (Number.isFinite(n) ? n.toFixed(d) : '—');
let csPreviewState = 'idle',
  vPreviewState = 'idle';
function hexRgba(hex, alpha = 1) {
  const m = (hex || '#ffffff').replace('#', '').match(/.{2}/g) || ['ff', 'ff', 'ff'];
  return `rgba(${parseInt(m[0], 16)},${parseInt(m[1], 16)},${parseInt(m[2], 16)},${alpha})`;
}
function csIsDynamic(style) {
  return [
    'dynamic',
    'circleDynamic',
    'classicDynamic',
    'responsiveDynamic',
    'dynamicQuad',
  ].includes(style);
}
function csPixelCross(el, size, gap, thick, color, dot, outlineMode, style, spread) {
  if (!el) return;
  el.innerHTML = '';
  const cx = 150,
    cy = 150,
    state = csPreviewState === 'auto' ? 'idle' : csPreviewState,
    alpha = Number($('csAlpha')?.value ?? 100) / 100,
    quad = +$('csQuadrant')?.value || 0.42,
    outlineColor = $('csOutlineColor')?.value || '#000000',
    outlineAlpha = Number($('csOutlineAlpha')?.value ?? 100) / 100,
    split = Number($('csSplit')?.value ?? 7),
    innerAlpha = Number($('csInnerAlpha')?.value ?? 100) / 100,
    tstyle = $('csTStyle')?.checked;
  let extra = csIsDynamic(style)
    ? state === 'move'
      ? Math.min(spread * 0.12, 32)
      : state === 'fire'
        ? Math.min(spread * 0.2, 56)
        : 0
    : 0;
  if (style === 'responsiveDynamic' && state === 'fire') extra = Math.min(spread * 0.24, 64);
  let g = gap + extra;
  const lineColor = hexRgba(color, alpha),
    out = hexRgba(outlineColor, outlineAlpha);
  const add = (l, t, w, h, cls = '', op = 1) => {
    let i = document.createElement('i');
    i.className = cls;
    i.style.left = l + 'px';
    i.style.top = t + 'px';
    i.style.width = w + 'px';
    i.style.height = h + 'px';
    i.style.background = lineColor;
    i.style.opacity = op;
    if (outlineMode === 'full') i.style.boxShadow = `0 0 0 1px ${out}`;
    if (outlineMode === 'half') i.style.boxShadow = `1px 1px 0 ${out}`;
    el.appendChild(i);
    return i;
  };
  const addCross = (cg = g, op = 1) => {
    add(cx + cg, cy - thick / 2, size, thick, '', op);
    add(cx - cg - size, cy - thick / 2, size, thick, '', op);
    if (!tstyle) add(cx - thick / 2, cy - cg - size, thick, size, '', op);
    add(cx - thick / 2, cy + cg, thick, size, '', op);
  };
  if (style === 'circleStatic' || style === 'circleDynamic') {
    const r = Math.max(5, Math.abs(g) + thick * 2 + extra * 0.25),
      d = r * 2;
    let i = add(cx - r, cy - r, d, d, 'cross-circle');
    i.style.border = `${Math.max(1, thick)}px solid ${lineColor}`;
    i.style.borderRadius = '50%';
    i.style.background = 'transparent';
    if (outlineMode !== 'none') i.style.boxShadow = `0 0 0 1px ${out}, inset 0 0 0 1px ${out}`;
  } else if (style === 'square') {
    const d = Math.max(6, Math.abs(g) * 2 + thick * 2);
    let i = add(cx - d / 2, cy - d / 2, d, d, 'cross-square');
    i.style.border = `${Math.max(1, thick)}px solid ${lineColor}`;
    i.style.background = 'transparent';
  } else if (style === 'dotOnly') {
    const d = Math.max(2, thick * 2 + 1);
    add(cx - d / 2, cy - d / 2, d, d, 'cross-dot-only');
  } else if (style === 'staticQuad') {
    const q = Math.max(0.08, Math.min(1, +$('csQuadrant').value || 0.42)),
      r = Math.max(7, Math.abs(g) + 9),
      arc = Math.max(5, r * q);
    const mk = (x, y, borders, rad) => {
      let i = document.createElement('i');
      i.className = 'quad-corner';
      i.style.left = x + 'px';
      i.style.top = y + 'px';
      i.style.width = arc + 'px';
      i.style.height = arc + 'px';
      i.style.borderColor = lineColor;
      i.style.borderStyle = 'solid';
      i.style.borderWidth = borders;
      i.style.borderRadius = rad;
      if (outlineMode !== 'none') i.style.filter = `drop-shadow(0 0 1px ${out})`;
      el.appendChild(i);
    };
    mk(cx - r - arc, cy - r - arc, `${thick}px 0 0 ${thick}px`, '100% 0 0 0');
    mk(cx + r, cy - r - arc, `${thick}px ${thick}px 0 0`, '0 100% 0 0');
    mk(cx - r - arc, cy + r, `0 0 ${thick}px ${thick}px`, '0 0 0 100%');
    mk(cx + r, cy + r, `0 ${thick}px ${thick}px 0`, '0 0 100% 0');
  } else if (style === 'dynamicQuad') {
    const r = Math.max(12, Math.abs(g) + 18 + extra * 0.2),
      arcLen = Math.max(18, Math.min(70, size * 5));
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 300 300');
    svg.classList.add('quad-svg');
    const start = [-135, -45, 45, 135];
    start.forEach((a) => {
      let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      let a1 = ((a - arcLen / 2) * Math.PI) / 180,
        a2 = ((a + arcLen / 2) * Math.PI) / 180,
        x1 = cx + r * Math.cos(a1),
        y1 = cy + r * Math.sin(a1),
        x2 = cx + r * Math.cos(a2),
        y2 = cy + r * Math.sin(a2),
        large = arcLen > 180 ? 1 : 0;
      path.setAttribute('d', `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`);
      path.setAttribute('stroke', lineColor);
      path.setAttribute('stroke-width', Math.max(1, thick));
      path.setAttribute('fill', 'none');
      if (outlineMode !== 'none') path.style.filter = `drop-shadow(0 0 1px ${out})`;
      svg.appendChild(path);
    });
    el.appendChild(svg);
  } else if (style === 'classicDynamic') {
    addCross(g, 1);
    if (state === 'fire') {
      let ig = Math.max(0, g - split);
      addCross(ig, innerAlpha);
    }
  } else addCross();
  if (dot && style !== 'dotOnly') {
    const d = Math.max(2, thick + 1);
    add(cx - d / 2, cy - d / 2, d, d, 'cross-dot');
  }
}
function vHex8(hex) {
  return (
    String(hex || '#ffffff')
      .replace('#', '')
      .toUpperCase() + 'FF'
  );
}
function vGet() {
  return {
    color: $('vColor')?.value || '#ffffff',
    opacity: Number($('vOpacity')?.value ?? 1),
    outline: $('vOutline')?.checked || false,
    outlineOpacity: Number($('vOutlineOpacity')?.value ?? 0),
    outlineThickness: Number($('vOutlineThickness')?.value ?? 1),
    dot: $('vDot')?.checked || false,
    dotOpacity: Number($('vDotOpacity')?.value ?? 1),
    dotSize: Number($('vDotSize')?.value ?? 2),
    inner: $('vInner')?.checked || false,
    innerH: Number($('vInnerH')?.value ?? 0),
    innerV: Number($('vInnerV')?.value ?? 0),
    innerThick: Number($('vInnerThick')?.value ?? 0),
    innerGap: Number($('vInnerGap')?.value ?? 0),
    innerOpacity: Number($('vInnerOpacity')?.value ?? 0),
    moveError: $('vMoveError')?.checked || false,
    moveMult: Number($('vMoveMult')?.value ?? 0),
    fireError: $('vFireError')?.checked || false,
    fireMult: Number($('vFireMult')?.value ?? 0),
    outer: $('vOuter')?.checked || false,
    outerH: Number($('vOuterH')?.value ?? 0),
    outerV: Number($('vOuterV')?.value ?? 0),
    outerThick: Number($('vOuterThick')?.value ?? 0),
    outerGap: Number($('vOuterGap')?.value ?? 0),
    outerOpacity: Number($('vOuterOpacity')?.value ?? 0),
    outerMoveError: $('vOuterMoveError')?.checked || false,
    outerMoveMult: Number($('vOuterMoveMult')?.value ?? 0),
    outerFireError: $('vOuterFireError')?.checked || false,
    outerFireMult: Number($('vOuterFireMult')?.value ?? 0),
    usePrimaryAds: $('vUsePrimaryAds')?.checked !== false,
    sniperColor: $('vSniperColor')?.value || '#ff0000',
    sniperOpacity: Number($('vSniperOpacity')?.value ?? 0.75),
    sniperThickness: Number($('vSniperThickness')?.value ?? 1),
  };
}
function vRender(el, o) {
  if (!el) return;
  el.innerHTML = '';
  const cx = 160,
    cy = 160,
    state = vPreviewState === 'auto' ? 'idle' : vPreviewState;
  const inErr =
    (o.moveError && state === 'move' ? o.moveMult * 10 : 0) +
    (o.fireError && state === 'fire' ? o.fireMult * 12 : 0);
  const outErr =
    (o.outerMoveError && state === 'move' ? o.outerMoveMult * 11 : 0) +
    (o.outerFireError && state === 'fire' ? o.outerFireMult * 13 : 0);
  const add = (l, t, w, h, op) => {
    let i = document.createElement('i');
    i.style.left = l + 'px';
    i.style.top = t + 'px';
    i.style.width = w + 'px';
    i.style.height = h + 'px';
    i.style.background = o.color;
    i.style.opacity = op * o.opacity;
    if (o.outline && o.outlineOpacity > 0)
      i.style.boxShadow = `0 0 0 ${o.outlineThickness}px rgba(0,0,0,${o.outlineOpacity})`;
    el.appendChild(i);
  };
  if (o.inner) {
    let g = o.innerGap + inErr,
      t = o.innerThick;
    add(cx + g, cy - t / 2, o.innerH, t, o.innerOpacity);
    add(cx - g - o.innerH, cy - t / 2, o.innerH, t, o.innerOpacity);
    add(cx - t / 2, cy - g - o.innerV, t, o.innerV, o.innerOpacity);
    add(cx - t / 2, cy + g, t, o.innerV, o.innerOpacity);
  }
  if (o.outer) {
    let g = o.outerGap + outErr,
      t = o.outerThick;
    add(cx + g, cy - t / 2, o.outerH, t, o.outerOpacity);
    add(cx - g - o.outerH, cy - t / 2, o.outerH, t, o.outerOpacity);
    add(cx - t / 2, cy - g - o.outerV, t, o.outerV, o.outerOpacity);
    add(cx - t / 2, cy + g, t, o.outerV, o.outerOpacity);
  }
  if (o.dot) {
    let d = o.dotSize;
    add(cx - d / 2, cy - d / 2, d, d, o.dotOpacity);
  }
}
function vBuildCode() {
  const o = vGet();
  let x = [
    '0',
    's',
    '1',
    'p',
    o.usePrimaryAds ? 1 : 0,
    'P',
    'c',
    '8',
    'u',
    vHex8(o.color),
    'o',
    String(o.outline ? o.outlineOpacity : 0),
    't',
    String(o.outlineThickness),
    'd',
    o.dot ? 1 : 0,
    'a',
    String(o.dotOpacity),
    'z',
    String(o.dotSize),
    '0b',
    o.inner ? 1 : 0,
    '0a',
    String(o.innerOpacity),
    '0l',
    String(o.innerH),
    '0v',
    String(o.innerV),
    '0g',
    o.innerH === o.innerV ? 0 : 1,
    '0t',
    String(o.innerThick),
    '0o',
    String(o.innerGap),
    '0m',
    o.moveError ? 1 : 0,
    '0s',
    String(o.moveMult),
    '0f',
    o.fireError ? 1 : 0,
    '0e',
    String(o.fireMult),
    '1b',
    o.outer ? 1 : 0,
    '1a',
    String(o.outerOpacity),
    '1l',
    String(o.outerH),
    '1v',
    String(o.outerV),
    '1g',
    o.outerH === o.outerV ? 0 : 1,
    '1t',
    String(o.outerThick),
    '1o',
    String(o.outerGap),
    '1m',
    o.outerMoveError ? 1 : 0,
    '1s',
    String(o.outerMoveMult),
    '1f',
    o.outerFireError ? 1 : 0,
    '1e',
    String(o.outerFireMult),
  ];
  return x.join(';');
}
