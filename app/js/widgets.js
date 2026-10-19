/* ===== widgets.js — диаграммы, логический квадрат, лаборатория, ядро тренажёров ===== */
(function () {
  'use strict';
  const L = window.L, h = L.h;
  let uid = 0;

  /* ================= круги Эйлера ================= */
  // kind: sub (S внутри P), eq, dis, cross, coord, contrary, contra, incomp
  // o: {a,b,c (подписи), shade: 'S' | 'S&P' | 'S-P', dist: {S:bool,P:bool}}
  L.euler = function (kind, o) {
    o = o || {};
    const id = 'eu' + ++uid;
    const A = o.a || 'S', B = o.b || 'P', C = o.c || '';
    const sw = (d) => (o.dist ? (d ? 4.2 : 1.4) : 2.2);
    const dS = o.dist ? o.dist.S : false, dP = o.dist ? o.dist.P : false;
    const strokeS = 'stroke="var(--accent)"', strokeP = 'stroke="var(--gold)"';
    const fillShade = 'fill="var(--accent)" fill-opacity=".38"';
    const circ = (c, extra) => `<circle cx="${c.x}" cy="${c.y}" r="${c.r}" ${extra}/>`;
    const txt = (x, y, s, cls) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Cambria,Georgia,serif" font-size="${cls === 'sm' ? 12 : 16}" font-weight="700" fill="currentColor">${s}</text>`;
    let body = '', label = '';
    let cs, cp;
    switch (kind) {
      case 'sub':
        cp = { x: 100, y: 55, r: 49 }; cs = { x: 100, y: 64, r: 25 };
        body = circ(cp, `fill="none" ${strokeP} stroke-width="${sw(dP)}"`) + circ(cs, `fill="none" ${strokeS} stroke-width="${sw(dS)}"`);
        label = txt(100, 24, B) + txt(100, 69, A);
        if (o.shade === 'S') body = circ(cs, fillShade) + body;
        if (o.shade === 'S-P') body = circ(cs, fillShade) + body;
        break;
      case 'eq':
        cp = { x: 100, y: 55, r: 44 }; cs = { x: 100, y: 55, r: 44 };
        body = (o.shade ? circ(cs, fillShade) : '') + circ(cp, `fill="none" ${strokeP} stroke-width="${sw(dP)}"`) + circ({ x: 100, y: 55, r: 38 }, `fill="none" ${strokeS} stroke-width="${sw(dS)}" stroke-dasharray="4 3"`);
        label = txt(100, 61, A + ' = ' + B);
        break;
      case 'dis':
      case 'incomp':
        cs = { x: 55, y: 55, r: 36 }; cp = { x: 145, y: 55, r: 36 };
        body = (o.shade === 'S' ? circ(cs, fillShade) : '') + circ(cs, `fill="none" ${strokeS} stroke-width="${sw(dS)}"`) + circ(cp, `fill="none" ${strokeP} stroke-width="${sw(dP)}"`);
        label = txt(55, 61, A) + txt(145, 61, B) + (kind === 'incomp' ? txt(100, 61, '?') : '');
        break;
      case 'cross':
        cs = { x: 78, y: 55, r: 40 }; cp = { x: 122, y: 55, r: 40 };
        body = '';
        if (o.shade === 'S&P') body += `<clipPath id="${id}c"><circle cx="${cp.x}" cy="${cp.y}" r="${cp.r}"/></clipPath>` + circ(cs, `${fillShade} clip-path="url(#${id}c)"`);
        else if (o.shade === 'S-P') body += `<mask id="${id}m"><rect width="200" height="110" fill="#fff"/>${circ(cp, 'fill="#000"')}</mask>` + circ(cs, `${fillShade} mask="url(#${id}m)"`);
        else if (o.shade === 'S') body += circ(cs, fillShade);
        body += circ(cs, `fill="none" ${strokeS} stroke-width="${sw(dS)}"`) + circ(cp, `fill="none" ${strokeP} stroke-width="${sw(dP)}"`);
        label = txt(56, 61, A) + txt(144, 61, B);
        break;
      case 'coord':
        body = circ({ x: 100, y: 55, r: 50 }, 'fill="none" stroke="var(--muted)" stroke-width="1.8"') +
          circ({ x: 70, y: 66, r: 21 }, `fill="none" ${strokeS} stroke-width="2.2"`) + circ({ x: 130, y: 66, r: 21 }, `fill="none" ${strokeP} stroke-width="2.2"`);
        label = txt(100, 22, C || 'A', 'sm') + txt(70, 71, A) + txt(130, 71, B);
        break;
      case 'contrary':
        body = `<clipPath id="${id}k"><ellipse cx="100" cy="55" rx="92" ry="46"/></clipPath>` +
          `<g clip-path="url(#${id}k)"><rect x="0" y="0" width="52" height="110" ${fillShade}/><rect x="148" y="0" width="52" height="110" fill="var(--gold)" fill-opacity=".4"/></g>` +
          '<ellipse cx="100" cy="55" rx="92" ry="46" fill="none" stroke="var(--muted)" stroke-width="1.8"/>' +
          '<line x1="52" y1="12" x2="52" y2="98" stroke="var(--muted)" stroke-dasharray="3 3"/><line x1="148" y1="12" x2="148" y2="98" stroke="var(--muted)" stroke-dasharray="3 3"/>';
        label = txt(30, 59, A, 'sm') + txt(170, 59, B, 'sm') + txt(100, 61, '…');
        break;
      case 'contra':
        body = `<mask id="${id}n"><rect width="200" height="110" fill="#fff"/><circle cx="62" cy="55" r="36" fill="#000"/></mask>` +
          `<rect x="4" y="4" width="192" height="102" rx="10" fill="var(--gold)" fill-opacity=".3" mask="url(#${id}n)"/>` +
          '<rect x="4" y="4" width="192" height="102" rx="10" fill="none" stroke="var(--muted)" stroke-width="1.4" stroke-dasharray="4 3"/>' +
          circ({ x: 62, y: 55, r: 36 }, `${fillShade} ${strokeS} stroke-width="2.4"`);
        label = txt(62, 61, A) + txt(142, 61, 'не-' + A);
        break;
      default:
        body = '';
    }
    return `<svg class="euler" viewBox="0 0 200 110" role="img" aria-label="Диаграмма: ${kind}">${body}${label}</svg>`;
  };
  L.eulerFig = (kind, caption, o) => h('figure', { class: 'eul-cell' }, L.html(L.euler(kind, o)), h('figcaption', null, caption));

  /* ================= логический квадрат ================= */
  const SQ = {
    A1: { E: 'f', I: 't', O: 'f' }, E1: { A: 'f', I: 'f', O: 't' }, I1: { A: 'u', E: 'f', O: 'u' }, O1: { A: 'f', E: 'u', I: 'u' },
    A0: { E: 'u', I: 'u', O: 't' }, E0: { A: 'u', I: 't', O: 'u' }, I0: { A: 'f', E: 't', O: 't' }, O0: { A: 't', E: 'f', I: 't' },
  };
  const REL = { AE: 'противность', EA: 'противность', IO: 'подпротивность', OI: 'подпротивность', AO: 'противоречие', OA: 'противоречие', EI: 'противоречие', IE: 'противоречие', AI: 'подчинение', IA: 'подчинение', EO: 'подчинение', OE: 'подчинение' };
  const SQEX = [
    { S: 'люди', P: 'честные', A: 'Все люди честны', E: 'Ни один человек не честен', I: 'Некоторые люди честны', O: 'Некоторые люди не честны' },
    { S: 'металлы', P: 'элементы', A: 'Все металлы суть элементы', E: 'Ни один металл не есть элемент', I: 'Некоторые металлы суть элементы', O: 'Некоторые металлы не суть элементы' },
    { S: 'книги', P: 'полезные', A: 'Все книги полезны', E: 'Ни одна книга не полезна', I: 'Некоторые книги полезны', O: 'Некоторые книги не полезны' },
  ];
  L.SQ = SQ; L.SQEX = SQEX; L.SQREL = REL;
  L.squareWidget = function (opts) {
    opts = opts || {};
    const st = { c: 'A', t: 1, ex: 0 };
    const root = h('div', { class: 'widget' });
    function stateOf(k) {
      if (k === st.c) return st.t ? 't' : 'f';
      return SQ[st.c + st.t][k];
    }
    function relText(from, to) {
      const r = REL[from + to];
      const t = st.t ? 'истинно' : 'ложно';
      if (r === 'противоречие') return 'Противоречие: ' + (st.t ? 'одно из двух истинно, другое ложно — значит, ложно.' : 'не могут быть оба ложными — значит, истинно.');
      if (r === 'противность') return st.t ? 'Противность: оба истинными быть не могут — значит, ложно.' : 'Противность: оба могут быть ложными, поэтому ничего определённого сказать нельзя.';
      if (r === 'подпротивность') return st.t ? 'Подпротивность: оба могут быть истинными, поэтому неопределённо.' : 'Подпротивность: оба ложными быть не могут — значит, истинно.';
      // подчинение
      const general = from === 'A' || from === 'E';
      if (general) return st.t ? 'Подчинение: из истины общего следует истина частного.' : 'Подчинение: ложность общего оставляет частное неопределённым.';
      return st.t ? 'Подчинение: истина частного не доказывает общее — неопределённо.' : 'Подчинение: ложность частного влечёт ложность общего.';
    }
    function draw() {
      const ex = SQEX[st.ex];
      const names = { t: 'ИСТИННО', f: 'ЛОЖНО', u: 'НЕОПРЕДЕЛЁННО' };
      const corner = (k) => {
        const s = stateOf(k), me = k === st.c;
        return h('button', { class: 'corner ' + s + (me ? ' sel' : ''), onclick: () => { st.c = k; draw(); }, 'aria-pressed': me },
          h('b', null, k), ex[k], h('span', { class: 'st' }, (me ? 'Допущено: ' : '') + names[s]));
      };
      const others = ['A', 'E', 'I', 'O'].filter((k) => k !== st.c);
      root.replaceChildren(
        h('h4', null, 'Интерактивный логический квадрат'),
        h('div', { class: 'row', style: { marginBottom: '12px' } },
          h('span', { class: 'small muted' }, 'Допустим, что суждение'),
          h('b', { class: 'serif' }, st.c),
          h('div', { class: 'seg' },
            h('button', { 'aria-pressed': st.t === 1, onclick: () => { st.t = 1; draw(); } }, 'истинно'),
            h('button', { 'aria-pressed': st.t === 0, onclick: () => { st.t = 0; draw(); } }, 'ложно')),
          h('select', { 'aria-label': 'Пример', onchange: (e) => { st.ex = +e.target.value; draw(); } },
            SQEX.map((e, i) => h('option', Object.assign({ value: i }, i === st.ex ? { selected: true } : {}), 'пример: ' + e.S)))),
        h('div', { class: 'sq' }, ['A', 'E', 'I', 'O'].map(corner)),
        h('div', { class: 'small', style: { marginTop: '12px' } },
          others.map((k) => h('p', { style: { margin: '0 0 4px' } }, h('b', null, st.c + ' → ' + k + ': '), relText(st.c, k)))),
        opts.hint === false ? null : h('p', { class: 'small muted', style: { marginTop: '8px' } }, 'Нажмите на угол квадрата, чтобы поменять исходное допущение. Таблицу наизусть учить не нужно — её можно вывести из четырёх отношений.'));
    }
    draw();
    return root;
  };

  /* ================= силлогизмы: движок ================= */
  const SYL = (L.syl = {});
  SYL.FIG = {
    1: { maj: ['M', 'P'], min: ['S', 'M'] },
    2: { maj: ['P', 'M'], min: ['S', 'M'] },
    3: { maj: ['M', 'P'], min: ['M', 'S'] },
    4: { maj: ['P', 'M'], min: ['M', 'S'] },
  };
  SYL.dist = (type, pos) => (type === 'A' ? pos === 0 : type === 'E' ? true : type === 'I' ? false : pos === 1);
  SYL.neg = (t) => t === 'E' || t === 'O';
  SYL.part = (t) => t === 'I' || t === 'O';
  // таблица модусов: фигура → { 'AAA': 'Barbara', ... }, weak — ослабленные
  SYL.MOODS = {
    1: { AAA: 'Barbara', EAE: 'Celarent', AII: 'Darii', EIO: 'Ferio', AAI: 'Barbari', EAO: 'Celaront' },
    2: { EAE: 'Cesare', AEE: 'Camestres', EIO: 'Festino', AOO: 'Baroko', EAO: 'Cesaro', AEO: 'Camestrop' },
    3: { AAI: 'Darapti', IAI: 'Disamis', AII: 'Datisi', EAO: 'Felapton', OAO: 'Bokardo', EIO: 'Ferison' },
    4: { AAI: 'Bramantip', AEE: 'Camenes', IAI: 'Dimaris', EAO: 'Fesapo', EIO: 'Fresison', AEO: 'Camenop' },
  };
  SYL.WEAK = { Barbari: 1, Celaront: 1, Cesaro: 1, Camestrop: 1, Camenop: 1 };
  // семантическая проверка: 8 областей диаграммы Венна, S, M, P непусты (традиционное допущение)
  SYL.semantic = function (fig, maj, min, con) {
    const f = SYL.FIG[fig];
    const bit = { S: 1, M: 2, P: 4 };
    const truth = (type, x, y, m) => {
      let some = false, noneX_notY = true, noneXY = true;
      for (let r = 0; r < 8; r++) {
        if (!(m & (1 << r))) continue;
        const inX = !!(r & bit[x]), inY = !!(r & bit[y]);
        if (inX && inY) { some = true; noneXY = false; }
        if (inX && !inY) noneX_notY = false;
      }
      if (type === 'A') return noneX_notY;
      if (type === 'E') return noneXY;
      if (type === 'I') return some;
      // O: существует x вне y
      for (let r = 0; r < 8; r++) if ((m & (1 << r)) && (r & bit[x]) && !(r & bit[y])) return true;
      return false;
    };
    for (let m = 1; m < 256; m++) {
      const nonempty = (t) => { for (let r = 0; r < 8; r++) if ((m & (1 << r)) && (r & bit[t])) return true; return false; };
      if (!nonempty('S') || !nonempty('M') || !nonempty('P')) continue;
      if (truth(maj, f.maj[0], f.maj[1], m) && truth(min, f.min[0], f.min[1], m) && !truth(con, 'S', 'P', m)) return false;
    }
    return true;
  };
  // проверка по правилам Челпанова (правила 3–8; правила 1–2 выполнены по построению)
  SYL.check = function (fig, maj, min, con) {
    const f = SYL.FIG[fig], broken = [];
    const midDist = (() => {
      const i1 = f.maj.indexOf('M'), i2 = f.min.indexOf('M');
      return SYL.dist(maj, i1) || SYL.dist(min, i2);
    })();
    if (!midDist) broken.push({ id: 3, text: 'Средний термин (M) не распределён ни в одной из посылок — он не связывает S и P.' });
    // термин в заключении распределён → должен быть распределён в посылке
    const pInMaj = SYL.dist(maj, f.maj.indexOf('P'));
    const sInMin = SYL.dist(min, f.min.indexOf('S'));
    if (SYL.dist(con, 1) && !pInMaj) broken.push({ id: 4, text: 'Больший термин (P) распределён в заключении, но не распределён в большей посылке (недозволительное расширение большего термина — illicit major).' });
    if (SYL.dist(con, 0) && !sInMin) broken.push({ id: 4, text: 'Меньший термин (S) распределён в заключении, но не распределён в меньшей посылке (недозволительное расширение меньшего термина — illicit minor).' });
    if (SYL.neg(maj) && SYL.neg(min)) broken.push({ id: 5, text: 'Обе посылки отрицательные — из двух отрицательных посылок вывода нет.' });
    const anyNeg = SYL.neg(maj) || SYL.neg(min);
    if (anyNeg && !SYL.neg(con)) broken.push({ id: 6, text: 'Одна из посылок отрицательна, а заключение утвердительное — должно быть отрицательным.' });
    if (!anyNeg && SYL.neg(con)) broken.push({ id: 6, text: 'Обе посылки утвердительны, а заключение отрицательное — отрицательное заключение требует отрицательной посылки.' });
    if (SYL.part(maj) && SYL.part(min)) broken.push({ id: 7, text: 'Обе посылки частные — из двух частных посылок вывода нет.' });
    const anyPart = SYL.part(maj) || SYL.part(min);
    if (anyPart && !SYL.part(con)) broken.push({ id: 8, text: 'Одна из посылок частная, а заключение общее — заключение должно быть частным.' });
    const sem = SYL.semantic(fig, maj, min, con);
    const name = (SYL.MOODS[fig] || {})[maj + min + con] || null;
    return { valid: broken.length === 0, sem, broken, name, weak: !!(name && SYL.WEAK[name]) };
  };
  // термины для текста
  const GEN = { m: 'один', f: 'одна', n: 'одно' };
  const asTerm = (t) => (typeof t === 'string' ? { sg: t, pl: t, g: 'n' } : t);
  SYL.sentence = function (type, S, P) {
    S = asTerm(S); P = asTerm(P);
    if (type === 'A') return 'Все ' + S.pl + ' суть ' + P.pl;
    if (type === 'E') return 'Ни ' + GEN[S.g] + ' ' + S.sg + ' не есть ' + P.sg;
    if (type === 'I') return 'Некоторые ' + S.pl + ' суть ' + P.pl;
    return 'Некоторые ' + S.pl + ' не суть ' + P.pl;
  };
  SYL.build = function (fig, maj, min, con, terms) {
    const f = SYL.FIG[fig];
    const T = terms || { S: 'S', M: 'M', P: 'P' };
    return {
      maj: SYL.sentence(maj, T[f.maj[0]], T[f.maj[1]]),
      min: SYL.sentence(min, T[f.min[0]], T[f.min[1]]),
      con: SYL.sentence(con, T.S, T.P),
    };
  };
  SYL.html = function (b, tags) {
    return `<div class="syl"><span class="l">${L.esc(b.maj)}.${tags ? '<span class="tag">большая посылка</span>' : ''}</span><span class="l">${L.esc(b.min)}.${tags ? '<span class="tag">меньшая посылка</span>' : ''}</span><span class="l c">${L.esc(b.con)}.${tags ? '<span class="tag">заключение</span>' : ''}</span></div>`;
  };

  /* ================= лаборатория силлогизмов ================= */
  L.labWidget = function () {
    const st = { fig: 1, maj: 'A', min: 'A', con: 'A' };
    const root = h('div', { class: 'widget' });
    const sel = (label, key, opts) => h('div', null, h('label', null, label),
      h('select', { onchange: (e) => { st[key] = key === 'fig' ? +e.target.value : e.target.value; draw(); } },
        opts.map(([v, t]) => h('option', Object.assign({ value: v }, String(st[key]) === String(v) ? { selected: true } : {}), t))));
    const types = [['A', 'A — все S суть P'], ['E', 'E — ни одно S не есть P'], ['I', 'I — некоторые S суть P'], ['O', 'O — некоторые S не суть P']];
    function draw() {
      const r = SYL.check(st.fig, st.maj, st.min, st.con);
      const b = SYL.build(st.fig, st.maj, st.min, st.con);
      const f = SYL.FIG[st.fig];
      let verdict;
      if (r.valid) verdict = h('div', { class: 'callout good' }, h('h4', null, 'Силлогизм правильный'),
        h('p', null, 'Это модус ', h('b', null, r.name || '—'), ' (', st.maj + st.min + st.con, ', фигура ', st.fig, ')' + (r.weak ? '. Ослабленный модус: заключение частное, хотя при этих посылках можно вывести общее.' : '.')));
      else verdict = h('div', { class: 'callout bad' }, h('h4', null, 'Силлогизм неправильный'),
        h('ul', null, r.broken.map((x) => h('li', null, h('b', null, 'Правило ' + x.id + '. '), x.text))));
      root.replaceChildren(
        h('h4', null, 'Лаборатория силлогизмов'),
        h('p', { class: 'small muted' }, 'Выберите фигуру и типы суждений — лаборатория проверит силлогизм по правилам и подскажет название модуса.'),
        h('div', { class: 'lab-sel' },
          sel('Фигура', 'fig', [[1, '1 — M·P / S·M'], [2, '2 — P·M / S·M'], [3, '3 — M·P / M·S'], [4, '4 — P·M / M·S']]),
          sel('Большая посылка', 'maj', types), sel('Меньшая посылка', 'min', types), sel('Заключение (S — P)', 'con', types)),
        L.html(SYL.html(b, true)),
        verdict,
        h('p', { class: 'small muted' }, 'В фигуре ' + st.fig + ' средний термин: в большей посылке — ' + (f.maj[0] === 'M' ? 'подлежащее' : 'сказуемое') + ', в меньшей — ' + (f.min[0] === 'M' ? 'подлежащее' : 'сказуемое') + '.'));
    }
    draw();
    return root;
  };

  /* ================= таблицы-виджеты ================= */
  function modesTable() {
    const info = {
      1: 'Фигура подчинения: общее правило применяется к частному случаю. Меньшая посылка утвердительна, большая общая.',
      2: 'Фигура различения: опровергает ложные подчинения. Одна посылка отрицательна, большая общая.',
      3: 'Фигура исключений: опровергает мнимую общность. Меньшая посылка утвердительна, заключение частное.',
      4: 'Галеновская, искусственная фигура; на практике почти не применяется.',
    };
    const rows = [1, 2, 3, 4].map((fg) => {
      const f = SYL.FIG[fg];
      const list = Object.keys(SYL.MOODS[fg]).map((k) => {
        const n = SYL.MOODS[fg][k];
        return h('span', { class: 'chip ' + (SYL.WEAK[n] ? '' : 'accent'), title: SYL.WEAK[n] ? 'ослабленный модус' : '' }, n + ' ' + k);
      });
      return h('tr', null, h('td', null, h('b', null, String(fg))), h('td', { class: 'mono' }, f.maj.join('–') + ' / ' + f.min.join('–')), h('td', null, h('div', { class: 'chips' }, list)), h('td', { class: 'small' }, info[fg]));
    });
    return h('div', { class: 'scroll-x' }, h('table', { class: 't' },
      h('thead', null, h('tr', null, h('th', null, 'Фигура'), h('th', null, 'Термины'), h('th', null, 'Модусы'), h('th', null, 'Для чего служит'))),
      h('tbody', null, rows)),
      h('p', { class: 'small muted' }, 'Цветные — 19 основных модусов, серые — 5 ослабленных (заключение частное там, где можно получить общее). Стих для запоминания: ',
        h('i', { class: 'lat' }, 'Barbara, Celarent, Darii, Ferioque prioris; Cesare, Camestres, Festino, Baroko secundae; Tertia Darapti, Disamis, Datisi, Felapton, Bokardo, Ferison habet; Quarta insuper addit Bramantip, Camenes, Dimaris, Fesapo, Fresison.')));
  }
  function transformTable() {
    const S = 'S', P = 'P';
    const rows = [
      ['A', 'Все S суть P', 'Ни одно S не есть не-P (E)', 'Некоторые P суть S (I) — по ограничению; чисто, если S и P равнозначны', 'Ни одно не-P не есть S (E)'],
      ['E', 'Ни одно S не есть P', 'Все S суть не-P (A)', 'Ни одно P не есть S (E) — чисто', 'Некоторые не-P суть S (I)'],
      ['I', 'Некоторые S суть P', 'Некоторые S не суть не-P (O)', 'Некоторые P суть S (I) — чисто', 'не допускает противопоставления'],
      ['O', 'Некоторые S не суть P', 'Некоторые S суть не-P (I)', 'не обращается', 'Некоторые не-P суть S (I)'],
    ];
    return h('div', { class: 'scroll-x' }, h('table', { class: 't' },
      h('thead', null, h('tr', null, h('th', null, ''), h('th', null, 'Исходное'), h('th', null, 'Превращение'), h('th', null, 'Обращение'), h('th', null, 'Противопоставление'))),
      h('tbody', null, rows.map((r) => h('tr', null, h('td', null, h('b', { class: 'serif' }, r[0])), r.slice(1).map((c) => h('td', null, c)))))));
  }
  function porphyry() {
    const t = [
      ['Бытие', 'высший род (summum genus)'], ['Тело', 'телесное бытие'], ['Организм', 'одушевлённое тело'], ['Чувствующий организм', 'животное'],
      ['Разумное существо', 'человек — низший вид (infima species)'],
    ];
    return h('div', { class: 'widget' }, h('h4', null, 'Дерево Порфирия'),
      t.map((x, i) => h('div', { style: { marginLeft: i * 22 + 'px', padding: '3px 0', borderLeft: i ? '2px solid var(--line)' : 'none', paddingLeft: i ? '12px' : '0' } }, h('b', { class: 'serif' }, x[0]), h('span', { class: 'muted small' }, ' — ' + x[1]))),
      h('p', { class: 'small muted', style: { marginTop: '10px' } }, 'На каждой ступени род делится на вид с признаком и вид без него: бытие — телесное / бестелесное; тело — одушевлённое / неодушевлённое; организм — чувствующий / нечувствующий (растение); чувствующий — разумный / неразумный. Спускаясь вниз, содержание растёт, а объём сужается.'));
  }
  function aeioGallery() {
    const d = {
      A: ['sub', { shade: 'S', dist: { S: true, P: false } }, 'A: все S суть P — S распределено, P нет'],
      E: ['dis', { dist: { S: true, P: true } }, 'E: ни одно S не есть P — распределены оба'],
      I: ['cross', { shade: 'S&P', dist: { S: false, P: false } }, 'I: некоторые S суть P — не распределён никто'],
      O: ['cross', { shade: 'S-P', dist: { S: false, P: true } }, 'O: некоторые S не суть P — распределено только P'],
    };
    return h('div', { class: 'widget' }, h('h4', null, 'Схемы суждений A, E, I, O (жирная линия — термин распределён)'),
      h('div', { class: 'eul-row' }, Object.keys(d).map((k) => L.eulerFig(d[k][0], d[k][2], d[k][1]))));
  }
  function relGallery() {
    return h('div', { class: 'widget' }, h('h4', null, 'Отношения между понятиями'),
      h('div', { class: 'eul-row' },
        L.eulerFig('sub', 'Подчинение: вид и род', { a: 'B', b: 'A' }),
        L.eulerFig('coord', 'Соподчинение: два вида одного рода', { a: 'B', b: 'C', c: 'A' }),
        L.eulerFig('eq', 'Равнозначность: объёмы совпадают', { a: 'A', b: 'B' }),
        L.eulerFig('cross', 'Скрещивание: объёмы пересекаются', { a: 'A', b: 'B' }),
        L.eulerFig('contrary', 'Противоположность: крайние виды', { a: 'белый', b: 'чёрный' }),
        L.eulerFig('contra', 'Противоречие: A и не-A', { a: 'A' }),
        L.eulerFig('incomp', 'Несравнимые: нет общего рода', { a: 'A', b: 'B' })));
  }
  function figuresWidget() {
    const rows = [1, 2, 3, 4].map((fg) => {
      const f = SYL.FIG[fg];
      return h('tr', null, h('td', null, h('b', null, 'Фигура ' + fg)), h('td', { class: 'mono' }, f.maj.join(' — ')), h('td', { class: 'mono' }, f.min.join(' — ')), h('td', { class: 'mono' }, 'S — P'));
    });
    return h('table', { class: 't' }, h('thead', null, h('tr', null, h('th', null, ''), h('th', null, 'Большая посылка'), h('th', null, 'Меньшая посылка'), h('th', null, 'Вывод'))), h('tbody', null, rows));
  }
  const WIDGETS = {
    square: () => L.squareWidget(),
    lab: () => L.labWidget(),
    modes: modesTable,
    transform: transformTable,
    porphyry,
    aeio: aeioGallery,
    relations: relGallery,
    figures: figuresWidget,
  };
  L.hydrate = function (root) {
    L.$$('[data-widget]', root).forEach((n) => {
      const fn = WIDGETS[n.dataset.widget];
      if (fn) n.replaceWith(fn());
    });
    // таблицы прокручиваются по горизонтали, а не раздвигают страницу на телефоне
    L.$$('table.t', root).forEach((t) => {
      if (t.parentElement && !t.parentElement.classList.contains('scroll-x')) {
        const w = document.createElement('div');
        w.className = 'scroll-x';
        t.replaceWith(w);
        w.append(t);
      }
    });
  };

  /* ================= ядро тренажёра вопросов ================= */
  // q: {prompt: html|Node, opts: [{html, ok, note}], expl: html, id?: srsKey, group?}
  L.quiz = function (cfg) {
    const total = cfg.questions.length;
    const st = { i: 0, score: 0, results: [], answered: false };
    const root = h('div', { class: 'card' });
    const letters = ['1', '2', '3', '4', '5', '6'];
    function keyHandler(e) {
      if (!root.isConnected) { document.removeEventListener('keydown', keyHandler); return; }
      if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      const n = parseInt(e.key, 10);
      if (!st.answered && n >= 1 && n <= 6) { const b = L.$$('.opt', root)[n - 1]; if (b) b.click(); }
      else if (st.answered && (e.key === 'Enter')) { const nx = L.$('[data-next]', root); if (nx) { e.preventDefault(); nx.click(); } }
    }
    document.addEventListener('keydown', keyHandler);
    function draw() {
      const q = cfg.questions[st.i];
      st.answered = false;
      const opts = (cfg.noShuffle ? q.opts : L.shuffle(q.opts)).slice();
      const box = h('div', { class: 'opts', role: 'group', 'aria-label': 'Варианты ответа' });
      const fb = h('div', { 'aria-live': 'polite' });
      const prompt = h('div', { class: 'q-prompt' });
      if (typeof q.prompt === 'string') prompt.innerHTML = q.prompt; else prompt.append(q.prompt);
      const btns = opts.map((o, k) => {
        const b = h('button', { class: 'opt', onclick: () => choose(k) }, h('span', { class: 'k' }, letters[k]), h('span', { html: o.html }));
        return b;
      });
      function choose(k) {
        if (st.answered) return;
        st.answered = true;
        const o = opts[k];
        btns.forEach((b, j) => { b.disabled = true; if (opts[j].ok) b.classList.add(j === k ? 'right' : 'missed'); });
        if (!o.ok) btns[k].classList.add('wrong');
        if (o.ok) st.score++;
        st.results.push({ q, ok: !!o.ok, picked: o });
        if (cfg.onAnswer) cfg.onAnswer(q, !!o.ok, o);
        const note = o.note ? `<p><b>Почему не так:</b> ${o.note}</p>` : '';
        fb.replaceChildren(h('div', { class: 'feedback ' + (o.ok ? 'ok' : 'no') },
          h('b', { class: 'v' }, o.ok ? 'Верно!' : 'Неверно'),
          L.html('<div>' + (o.ok ? '' : note) + (q.expl ? '<p>' + q.expl + '</p>' : '') + '</div>')),
          h('div', { style: { marginTop: '14px' } }, h('button', { class: 'btn primary', 'data-next': 1, onclick: next }, st.i + 1 < total ? 'Дальше →' : 'Результат'), h('span', { class: 'small muted', style: { marginLeft: '12px' } }, 'или Enter')));
      }
      box.append(...btns);
      root.replaceChildren(
        h('div', { class: 'q-head' }, h('span', { class: 'chip' }, (cfg.title ? cfg.title + ' · ' : '') + (st.i + 1) + ' из ' + total),
          h('div', { class: 'bar', style: { width: '120px' } }, h('i', { style: { width: Math.round((st.i / total) * 100) + '%' } }))),
        prompt, box, fb);
      if (cfg.afterDraw) cfg.afterDraw(root, q);
    }
    function next() {
      st.i++;
      if (st.i < total) { draw(); window.scrollTo({ top: 0, behavior: 'instant' }); } else finish();
    }
    function finish() {
      const pct = Math.round((st.score / total) * 100);
      if (cfg.onFinish) cfg.onFinish(st.score, total, st.results);
      const wrong = st.results.filter((r) => !r.ok);
      root.replaceChildren(
        h('div', { class: 'center' },
          h('p', { class: 'eyebrow' }, cfg.title || 'Результат'),
          h('div', { class: 'result-big' }, st.score + ' / ' + total),
          h('p', { class: 'muted' }, pct >= 90 ? 'Отлично! Это уже уверенное владение темой.' : pct >= 70 ? 'Хорошо. Загляните в разборы ошибок ниже.' : pct >= 40 ? 'Неплохое начало. Перечитайте урок и повторите.' : 'Тема пока не усвоена — это нормально. Перечитайте урок и попробуйте снова.'),
          h('div', { class: 'row', style: { justifyContent: 'center', marginTop: '18px' } },
            cfg.again ? h('button', { class: 'btn primary', onclick: cfg.again }, 'Ещё раз') : null,
            cfg.backHref ? h('a', { class: 'btn', href: cfg.backHref }, cfg.backLabel || 'Назад') : null)),
        wrong.length ? h('div', { style: { marginTop: '26px' } }, h('h3', null, 'Разбор ошибок'),
          wrong.map((r) => h('div', { class: 'card soft', style: { marginBottom: '10px' } },
            h('div', { class: 'q-prompt', html: typeof r.q.prompt === 'string' ? r.q.prompt : '' }),
            L.html('<div><p><b>Ваш ответ:</b> ' + r.picked.html + '</p><p><b>Верно:</b> ' + r.q.opts.filter((o) => o.ok).map((o) => o.html).join(' / ') + '</p>' + (r.q.expl ? '<p class="muted">' + r.q.expl + '</p>' : '') + '</div>')))) : null);
    }
    draw();
    return root;
  };

  /* ================= карточка разбора софизма ================= */
  const stripTags = (s) => s.replace(/<[^>]+>/g, '');
  L.argBody = function (a, flawIdx) {
    const box = h('div', { class: 'arg-text' });
    if (a.p) {
      a.p.forEach((s, i) => box.append(h('div', { class: 'step' + (flawIdx === i + 1 ? ' flaw' : '') }, h('span', { class: 'n' }, (i + 1) + '.'), h('span', { html: s }))));
      if (a.c) box.append(h('div', { class: 'step concl' + (flawIdx === a.p.length + 1 ? ' flaw' : '') }, h('span', { class: 'n' }, '∴'), h('span', { html: a.c })));
    } else {
      const lines = (a.t || '').split('\n');
      if (a.dlg) box.classList.add('dialog');
      lines.forEach((s) => box.append(h('p', { html: s })));
    }
    return box;
  };
  function famOf(id) { const f = L.falBy(id); return f ? f.fam : null; }
  // варианты для 2-го этапа: правильный + отвлекающие
  L.typeOptions = function (a) {
    const ids = [a.v].concat((a.o || '').split(',').map((s) => s.trim()).filter(Boolean));
    const seen = new Set(), out = [];
    ids.forEach((i) => { if (L.falBy(i) && !seen.has(i)) { seen.add(i); out.push(i); } });
    // добор до 4 вариантов из той же семьи, затем из любых
    const fam = famOf(a.v);
    const pool = L.fallacies.filter((f) => f.fam === fam && !seen.has(f.id)).concat(L.shuffle(L.fallacies.filter((f) => f.fam !== fam && !seen.has(f.id))));
    while (out.length < 4 && pool.length) { const f = pool.shift(); if (!(a.alt || []).includes(f.id)) { out.push(f.id); seen.add(f.id); } }
    return L.shuffle(out);
  };
  // cfg: {daily:bool, mode:'daily'|'train'|'review', onDone(result), note:bool, nextLabel, onNext}
  L.argCard = function (a, cfg) {
    cfg = cfg || {};
    const S = L.S.get();
    const root = h('div', { class: 'card' });
    const st = { stage: 'verdict', verdict: null, type: null, note: '' };
    const k = cfg.mode === 'daily' ? 2 : cfg.mode === 'review' ? 0.4 : 1;
    function done(verdictOk, typeOk) {
      const full = a.v === 'valid' ? verdictOk : verdictOk && typeOk;
      const r = S.args[a.id] || (S.args[a.id] = { s: 0, c: 0 });
      r.s++; if (full) r.c++; r.last = L.today();
      if (a.v !== 'valid') {
        const f = S.fal[a.v] || (S.fal[a.v] = { s: 0, c: 0 });
        f.s++; if (full) f.c++;
        if (verdictOk && !typeOk && st.type) { const key = a.v + '>' + st.type; S.conf[key] = (S.conf[key] || 0) + 1; }
      } else if (!verdictOk) {
        const key = 'valid>fallacy'; S.conf[key] = (S.conf[key] || 0) + 1;
      }
      L.S.save();
      L.srs.record('a:' + a.id, full);
      L.tick();
      const xp = Math.round((verdictOk ? 4 * k : 0) + (a.v !== 'valid' && typeOk ? 6 * k : a.v === 'valid' && verdictOk ? 6 * k : 0));
      if (xp) L.addXP(xp, 'опыта'); else L.refreshTop();
      if (cfg.mode === 'daily') {
        const d = cfg.date || L.today();
        S.daily[d] = { id: a.id, verdict: verdictOk, type: typeOk, note: st.note || '', done: true };
        L.S.save();
      }
      if (cfg.onDone) cfg.onDone({ full, verdictOk, typeOk });
    }
    function head() {
      const lv = '●'.repeat(a.lv || 1) + '○'.repeat(3 - (a.lv || 1));
      return h('div', { class: 'q-head' },
        h('div', { class: 'chips' }, cfg.label ? h('span', { class: 'chip accent' }, cfg.label) : null, h('span', { class: 'chip', title: 'Сложность' }, 'сложность ' + lv), a.cls ? h('span', { class: 'chip info' }, 'классика') : null),
        cfg.headExtra || null);
    }
    function drawVerdict() {
      root.replaceChildren(head(),
        h('p', { class: 'muted small', style: { margin: '0 0 8px' } }, 'Прочитайте внимательно. Это корректное рассуждение или в нём есть ошибка / уловка?'),
        L.argBody(a),
        h('div', { class: 'two-btns' },
          h('button', { class: 'verdict-btn', onclick: () => pick('valid') }, 'Рассуждение корректно', h('small', null, 'вывод действительно следует, основания разумны')),
          h('button', { class: 'verdict-btn', onclick: () => pick('fallacy') }, 'Здесь ошибка или уловка', h('small', null, 'вывод не следует или основание негодно'))));
    }
    function pick(v) {
      st.verdict = v;
      const isF = a.v !== 'valid';
      if (v === 'fallacy' && isF) { st.stage = 'type'; drawType(); }
      else { done(v === (isF ? 'fallacy' : 'valid'), false); reveal(v === (isF ? 'fallacy' : 'valid'), false); }
    }
    function drawType() {
      const opts = L.typeOptions(a);
      const noteBox = cfg.note ? h('textarea', { class: 'note', placeholder: 'Например: «В посылке 2 слово … употреблено в другом смысле, поэтому вывод не следует».', 'aria-label': 'Ваше объяснение', oninput: (e) => (st.note = e.target.value) }) : null;
      root.replaceChildren(head(), L.argBody(a),
        h('p', { style: { margin: '0 0 6px' } }, h('b', null, 'Верно: здесь ошибка.'), ' Определите, какая именно:'),
        h('div', { class: 'opts' }, opts.map((id) => {
          const f = L.falBy(id);
          return h('button', { class: 'opt', onclick: () => { st.type = id; const ok = id === a.v || (a.alt || []).includes(id); done(true, ok); reveal(true, ok); } },
            h('span', { class: 'k' }, '?'), h('span', null, f.name, h('small', null, f.short)));
        })),
        noteBox ? h('div', { style: { marginTop: '16px' } }, h('p', { class: 'small muted', style: { margin: '0 0 6px' } }, 'По желанию: сформулируйте своими словами, как бы вы опровергли это (потом сравните с разбором).'), noteBox) : null);
    }
    function reveal(verdictOk, typeOk) {
      const isF = a.v !== 'valid';
      const f = isF ? L.falBy(a.v) : null;
      const out = [head(), h('p', { class: 'eyebrow', style: { margin: '0 0 6px' } }, 'Разбор · ' + a.n), L.argBody(a, isF ? a.fl : 0)];
      // итог
      let title, cls;
      if (isF) {
        if (!verdictOk) { title = 'Это была уловка — «' + f.name + '»'; cls = 'no'; }
        else if (typeOk) { title = 'Верно: «' + f.name + '»'; cls = 'ok'; }
        else { title = 'Ошибка есть, но тип другой: «' + f.name + '»'; cls = 'no'; }
      } else { title = verdictOk ? 'Верно: рассуждение корректно' : 'Это корректное рассуждение — не ищите подвоха там, где его нет'; cls = verdictOk ? 'ok' : 'no'; }
      out.push(h('div', { class: 'feedback ' + cls }, h('b', { class: 'v' }, title), h('p', { html: a.ex || '' })));
      if (st.note) out.push(h('div', { class: 'callout note' }, h('h4', null, 'Ваша формулировка'), h('p', null, st.note)));
      if (isF) {
        if (a.fl) out.push(h('p', { class: 'small muted' }, 'Красным выделен шаг, на котором рассуждение ломается.'));
        out.push(h('h3', null, 'Как разрушить'));
        out.push(h('ol', { class: 'demolish' }, (a.ds || []).map((s) => {
          const parts = s.split('|');
          return h('li', null, parts.length > 1 ? h('b', null, parts[0]) : null, h('span', { html: parts.length > 1 ? parts[1] : s }));
        })));
        if (a.pr) out.push(h('div', { class: 'parallel' }, h('b', null, 'Параллельный довод (та же схема, нелепый вывод): '), h('span', { html: a.pr })));
        if (a.re) out.push(h('p', { style: { margin: '16px 0 6px' } }, h('b', null, 'Что ответить собеседнику:')), h('div', { class: 'reply', html: a.re }));
        out.push(h('div', { class: 'row', style: { marginTop: '18px' } },
          h('a', { class: 'btn sm', href: '#/fallacy/' + f.id }, 'Об уловке «' + f.name + '»'),
          a.ch ? (L.hasPdf
            ? h('a', { class: 'btn sm ghost', href: L.pdfLink((L.lessonBy(a.ch) || {}).pdf || 1), target: '_blank', rel: 'noopener' }, 'Челпанов, гл. ' + a.ch)
            : h('a', { class: 'btn sm ghost', href: '#/lesson/' + a.ch }, 'Урок по гл. ' + L.roman(a.ch))) : null));
      } else {
        if (a.ck) out.push(h('h3', null, 'Как убедиться, что это не софизм'), h('ul', { class: 'flag-list green' }, a.ck.map((s) => h('li', { html: s }))));
        if (a.lk && L.falBy(a.lk)) out.push(h('div', { class: 'callout note' }, h('h4', null, 'На что похоже'), h('p', null, 'Это легко принять за «' + L.falBy(a.lk).name + '», но здесь нет её признаков: ' + (a.lkw || ''))));
      }
      const nav = h('div', { class: 'row', style: { marginTop: '20px' } });
      if (cfg.onNext) nav.append(h('button', { class: 'btn primary', 'data-next': 1, onclick: cfg.onNext }, cfg.nextLabel || 'Дальше →'));
      if (cfg.extraActions) nav.append(cfg.extraActions);
      out.push(nav);
      root.replaceChildren(...out);
      root.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
    // если разбор уже пройден (повторный показ в архиве)
    if (cfg.revealed) { const p = cfg.past || {}; st.note = p.note || ''; st.verdict = a.v === 'valid' ? 'valid' : 'fallacy'; reveal(p.verdict !== false, p.type !== false); }
    else drawVerdict();
    return root;
  };
})();
