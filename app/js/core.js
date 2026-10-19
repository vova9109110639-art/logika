/* ===== core.js — утилиты, хранилище, повторение, маршрутизатор ===== */
(function () {
  'use strict';
  const L = (window.L = window.L || {});

  /* ---------- DOM ---------- */
  L.h = function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const k of Object.keys(attrs)) {
        const v = attrs[k];
        if (typeof v === 'boolean' && k.slice(0, 5) === 'aria-') { el.setAttribute(k, String(v)); continue; }
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
        else if (k === 'dataset') Object.assign(el.dataset, v);
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    const add = (kid) => {
      if (kid == null || kid === false) return;
      if (Array.isArray(kid)) kid.forEach(add);
      else el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    };
    kids.forEach(add);
    return el;
  };
  L.html = function (str) {
    const t = document.createElement('template');
    t.innerHTML = str.trim();
    return t.content.firstElementChild;
  };
  L.esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  L.$ = (sel, el) => (el || document).querySelector(sel);
  L.$$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));

  /* ---------- случайность ---------- */
  L.mulberry = function (seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  L.shuffle = function (arr, rnd) {
    rnd = rnd || Math.random;
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  L.pick = (arr, rnd) => arr[Math.floor((rnd || Math.random)() * arr.length)];
  L.sample = (arr, n, rnd) => L.shuffle(arr, rnd).slice(0, n);

  /* ---------- даты ---------- */
  const pad = (n) => (n < 10 ? '0' + n : '' + n);
  L.dstr = (d) => { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  L.today = () => L.dstr(new Date());
  L.toDate = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12); };
  L.addDays = (s, n) => { const d = L.toDate(s); d.setDate(d.getDate() + n); return L.dstr(d); };
  L.dayDiff = (a, b) => Math.round((L.toDate(b) - L.toDate(a)) / 86400000);
  const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const WDAYS = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
  L.fmtDate = (s, withDay) => { const d = L.toDate(s); return d.getDate() + ' ' + MONTHS[d.getMonth()] + (withDay ? ', ' + WDAYS[d.getDay()] : ''); };

  /* ---------- склонение ---------- */
  L.plural = function (n, one, few, many) {
    const a = Math.abs(n) % 100, b = a % 10;
    if (a > 10 && a < 20) return many;
    if (b > 1 && b < 5) return few;
    if (b === 1) return one;
    return many;
  };

  /* ---------- хранилище ---------- */
  const KEY = 'logika.trainer.v1';
  let mem = null;
  const fresh = () => ({ v: 1, start: L.today(), theme: 'auto', xp: 0, lessons: {}, q: {}, act: {}, daily: {}, args: {}, fal: {}, conf: {}, drill: {}, seenWelcome: false });
  function load() {
    if (mem) return mem;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { mem = Object.assign(fresh(), JSON.parse(raw)); return mem; }
    } catch (e) { /* хранилище недоступно */ }
    mem = fresh();
    return mem;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* ничего */ }
  }
  L.S = {
    get: load,
    save,
    reset() { mem = fresh(); save(); },
    export() { return JSON.stringify(load(), null, 1); },
    import(text) {
      const o = JSON.parse(text);
      if (!o || typeof o !== 'object' || !o.v) throw new Error('Это не файл прогресса');
      mem = Object.assign(fresh(), o);
      save();
    },
  };

  /* ---------- опыт, активность, серия ---------- */
  const LEVELS = [
    [0, 'Ученик'], [100, 'Слушатель'], [250, 'Рассуждающий'], [500, 'Диалектик'], [900, 'Логик'],
    [1500, 'Критик'], [2300, 'Искатель ошибок'], [3400, 'Мастер возражения'], [5000, 'Ловец софистов'], [7500, 'Магистр логики'],
  ];
  L.level = function () {
    const xp = load().xp;
    let i = 0;
    while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1][0]) i++;
    const next = LEVELS[i + 1];
    return { n: i + 1, name: LEVELS[i][1], xp, from: LEVELS[i][0], to: next ? next[0] : null, pct: next ? Math.round(((xp - LEVELS[i][0]) / (next[0] - LEVELS[i][0])) * 100) : 100 };
  };
  L.addXP = function (n, label) {
    const s = load();
    const before = L.level().n;
    s.xp += n;
    const d = L.today();
    const a = s.act[d] || (s.act[d] = { xp: 0, n: 0 });
    a.xp += n;
    save();
    refreshTop();
    const after = L.level();
    if (after.n > before) L.toast('Новый уровень: ' + after.name + ' 🎉');
    else if (label) L.toast('+' + n + ' ' + label);
  };
  L.tick = function (k) { // посчитать ответ в дневной активности
    const s = load();
    const a = s.act[L.today()] || (s.act[L.today()] = { xp: 0, n: 0 });
    a.n += k || 1;
    save();
  };
  L.streak = function () {
    const s = load();
    let d = L.today();
    if (!(s.act[d] && s.act[d].xp > 0)) d = L.addDays(d, -1);
    let n = 0;
    while (s.act[d] && s.act[d].xp > 0) { n++; d = L.addDays(d, -1); }
    return n;
  };
  L.doneToday = () => { const a = load().act[L.today()]; return !!(a && a.xp > 0); };

  /* ---------- интервальное повторение (коробки Лейтнера) ---------- */
  const INTERVALS = [1, 2, 4, 8, 16, 32];
  L.srs = {
    record(key, ok) {
      const s = load();
      const r = s.q[key] || (s.q[key] = { b: 0, d: L.today(), s: 0, c: 0 });
      r.s++;
      if (ok) { r.c++; r.b = Math.min(r.b + 1, INTERVALS.length - 1); } else r.b = 0;
      r.d = L.addDays(L.today(), INTERVALS[r.b]);
      save();
    },
    due() {
      const s = load(), t = L.today();
      return Object.keys(s.q).filter((k) => s.q[k].d <= t);
    },
    count() { return L.srs.due().length; },
    box(key) { const r = load().q[key]; return r ? r.b : -1; },
  };

  /* ---------- выдача уведомлений ---------- */
  L.toast = function (msg) {
    const box = document.getElementById('toasts');
    if (!box) return;
    const t = L.h('div', { class: 'toast' }, msg);
    box.append(t);
    setTimeout(() => t.remove(), 2600);
  };

  /* ---------- данные: сборка ---------- */
  L.lessons = (window.LESSONS || []).slice().sort((a, b) => a.n - b.n);
  L.lessonBy = (n) => L.lessons.find((x) => x.n === +n);
  L.modules = [
    { id: 1, title: 'Введение', sub: 'Что такое логика и зачем она' },
    { id: 2, title: 'Понятие', sub: 'Из чего строится мысль' },
    { id: 3, title: 'Определение и деление', sub: 'Как объяснять и раскладывать по полочкам' },
    { id: 4, title: 'Суждение', sub: 'Утверждение и отрицание, логический квадрат' },
    { id: 5, title: 'Законы мышления и прямые выводы', sub: 'Тождество, противоречие и преобразования суждений' },
    { id: 6, title: 'Силлогизм', sub: 'Сердце дедукции' },
    { id: 7, title: 'Индукция и научный метод', sub: 'Как рождаются общие истины' },
    { id: 8, title: 'Логические ошибки', sub: 'Софизмы и паралогизмы' },
  ];
  L.fallacies = window.FALLACIES || [];
  L.families = window.FAMILIES || [];
  L.falBy = (id) => L.fallacies.find((f) => f.id === id);
  L.args = (window.ARGS || []).concat(window.DAILY_EXTRA || []);
  L.argBy = (id) => L.args.find((a) => a.id === id);
  L.glossary = window.GLOSSARY || [];
  L.thinkers = window.THINKERS || [];
  L.thinkerGroups = window.THINKER_GROUPS || [];

  // порядок «софизма дня»
  (function buildDaily() {
    const order = (window.DAILY_ORDER || []).filter((id) => L.argBy(id));
    const rest = L.args.map((a) => a.id).filter((id) => order.indexOf(id) < 0);
    L.dailyIds = order.concat(rest);
  })();
  L.dayNumber = (dateStr) => Math.max(0, L.dayDiff(load().start, dateStr || L.today()));
  L.dailyFor = (n) => L.argBy(L.dailyIds[n % L.dailyIds.length]);
  L.pdfLink = (page) => 'chelpanov_logika.pdf#page=' + page;
  L.hasPdf = !window.NO_PDF; // в веб-копии PDF учебника не публикуется

  /* ---------- маршрутизатор ---------- */
  const routes = [];
  const NAVMAP = { '': 'home', review: 'home', about: 'home', course: 'course', lesson: 'course', quiz: 'course', drills: 'drills', drill: 'drills', lab: 'drills', sophistry: 'sophistry', daily: 'sophistry', trainer: 'sophistry', library: 'sophistry', arg: 'sophistry', catalog: 'sophistry', fallacy: 'sophistry', algorithm: 'sophistry', reference: 'reference', progress: 'progress' };
  L.route = (pattern, fn, navKey) => {
    navKey = navKey || NAVMAP[pattern.split('/')[1] || ''];
    const keys = [];
    const re = new RegExp('^' + pattern.replace(/:([a-z]+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '$');
    routes.push({ re, keys, fn, navKey });
  };
  L.go = (hash) => { if (location.hash === '#' + hash) L.render(); else location.hash = hash; };
  L.render = function () {
    const raw = decodeURIComponent((location.hash || '#/').slice(1)) || '/';
    const path = raw.split('?')[0].replace(/\/+$/, '') || '/';
    const main = document.getElementById('main');
    let hit = null, params = {};
    for (const r of routes) {
      const m = r.re.exec(path);
      if (m) { hit = r; r.keys.forEach((k, i) => (params[k] = m[i + 1])); break; }
    }
    if (!hit) { hit = routes.find((r) => r.re.test('/')); params = {}; }
    L.navKey = hit.navKey;
    main.replaceChildren();
    try {
      const node = hit.fn(params);
      if (node) main.append(node);
      L.hydrate(main);
    } catch (e) {
      console.error(e);
      main.append(L.h('div', { class: 'card' }, L.h('h2', null, 'Что-то пошло не так'), L.h('pre', { class: 'mono' }, String(e && e.stack || e))));
    }
    refreshTop();
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = (L.pageTitle ? L.pageTitle + ' · ' : '') + 'Логика — тренажёр по Челпанову';
    L.pageTitle = '';
  };

  /* ---------- шапка ---------- */
  const NAV = [
    ['/', 'Сегодня', 'home'],
    ['/course', 'Курс', 'course'],
    ['/drills', 'Тренажёры', 'drills'],
    ['/sophistry', 'Софистика', 'sophistry'],
    ['/reference', 'Справочник', 'reference'],
    ['/progress', 'Прогресс', 'progress'],
  ];
  const flame = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 2s1 3-1.5 6c-2 2.4-5 4.4-5 8.5A6.5 6.5 0 0 0 13.5 23 6.5 6.5 0 0 0 20 16.5c0-3.3-2-5-3.2-6.6-.9 1.4-1.8 1.9-2.6 1.9 1.2-3.2.3-6.1-.7-9.8z"/></svg>';
  const moon = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  function refreshTop() {
    const bar = document.getElementById('topbar');
    if (!bar) return;
    const st = L.streak(), lv = L.level();
    bar.replaceChildren(
      L.h('div', { class: 'topbar-in' },
        L.h('a', { class: 'brand', href: '#/', 'aria-label': 'Логика — на главную' },
          L.html('<svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true"><circle cx="13" cy="17" r="10" fill="#7a1f2b" fill-opacity=".88"/><circle cx="21" cy="17" r="10" fill="#c89b3c" fill-opacity=".78"/></svg>'),
          L.h('span', null, 'Логика', L.h('small', null, 'по Челпанову'))),
        L.h('nav', { class: 'nav', 'aria-label': 'Разделы' },
          NAV.map(([href, label, key]) => L.h('a', Object.assign({ href: '#' + href }, L.navKey === key ? { 'aria-current': 'page' } : {}), label))),
        L.h('div', { class: 'top-tools' },
          L.h('a', { class: 'pill', href: '#/progress', title: 'Дней подряд' }, L.html(flame), String(st)),
          L.h('a', { class: 'pill', href: '#/progress', title: 'Уровень ' + lv.n + ' · ' + lv.xp + ' XP' }, 'ур. ' + lv.n),
          L.h('button', { class: 'icon-btn', title: 'Тема: светлая / тёмная', 'aria-label': 'Сменить тему', onclick: toggleTheme }, L.html(moon)))));
    const foot = document.getElementById('foot');
    if (foot && !foot.firstChild) {
      foot.append(L.h('p', null, 'Основа курса — «Учебник логики» Г. И. Челпанова (издание 1915 г.). Прогресс хранится только в вашем браузере. ',
        L.h('a', { href: '#/about' }, 'О проекте'), L.hasPdf ? [' · ', L.h('a', { href: L.pdfLink(1), target: '_blank', rel: 'noopener' }, 'Открыть PDF учебника')] : null));
    }
  }
  L.refreshTop = refreshTop;
  function toggleTheme() {
    const s = load();
    const dark = document.documentElement.getAttribute('data-theme') === 'dark' ||
      (!document.documentElement.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
    s.theme = dark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', s.theme);
    save();
  }

  L.hydrate = function () { /* переопределяется в widgets.js */ };
})();
