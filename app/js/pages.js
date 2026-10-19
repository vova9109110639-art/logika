/* ===== pages.js — основные страницы ===== */
(function () {
  'use strict';
  const L = window.L, h = L.h, S = () => L.S.get(), esc = L.esc;

  /* ---------- вспомогательные ---------- */
  const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV', 'XXVI'];
  L.roman = (n) => ROMAN[n] || String(n);
  const head = (eyebrow, title, desc) => h('header', { class: 'page-head' }, eyebrow ? h('p', { class: 'eyebrow' }, eyebrow) : null, h('h1', null, title), desc ? h('p', null, desc) : null);
  const crumbs = (items) => h('nav', { class: 'crumbs', 'aria-label': 'Навигация' }, items.map((it, i) => (i < items.length - 1 ? [h('a', { href: '#' + it[1] }, it[0]), ' › '] : (typeof it === 'string' ? it : it[0]))));
  const chip = (t, kind) => h('span', { class: 'chip' + (kind ? ' ' + kind : '') }, t);
  const pdfA = (page, text, cls) => (L.hasPdf
    ? h('a', { class: cls || 'btn sm ghost', href: L.pdfLink(page), target: '_blank', rel: 'noopener' }, text || 'Читать в учебнике')
    : h('span', { class: 'chip', title: 'Страница в PDF-версии учебника' }, 'PDF, стр. ' + page));
  const modName = (id) => (L.modules.find((m) => m.id === id) || {}).title || '';
  L.mark = function (kind) {
    const s = S(); const a = s.act[L.today()] || (s.act[L.today()] = { xp: 0, n: 0 });
    a[kind] = (a[kind] || 0) + 1; L.S.save();
  };
  const markedToday = (kind) => { const a = S().act[L.today()]; return !!(a && a[kind]); };
  const lessonState = (n) => S().lessons[n] || {};
  const nextLesson = () => L.lessons.find((l) => !lessonState(l.n).done) || null;
  const qs = () => new URLSearchParams((location.hash.split('?')[1] || ''));
  const notFound = () => h('div', { class: 'card' }, h('h2', null, 'Страница не найдена'), h('p', null, 'Такой страницы нет. '), h('a', { class: 'btn', href: '#/' }, 'На главную'));
  L.notFound = notFound; L.head = head; L.crumbs = crumbs; L.chip = chip; L.pdfA = pdfA;

  /* вопросы уроков */
  L.lessonQuestions = function (les) {
    return les.quiz.map((it, i) => ({
      id: 'q:' + les.n + ':' + i,
      prompt: esc(it.q),
      opts: [{ html: esc(it.a), ok: true }].concat(it.w.map((w) => ({ html: esc(w), ok: false }))),
      expl: esc(it.e),
    }));
  };
  function answerHook(q, ok) {
    if (q.id) {
      const first = !(S().q[q.id] && S().q[q.id].s);
      L.srs.record(q.id, ok);
      L.tick();
      if (ok) L.addXP(first ? 5 : 1); else L.refreshTop();
    } else { L.tick(); if (ok) L.addXP(2); }
  }

  /* ============================ ГЛАВНАЯ ============================ */
  function heatmap() {
    const s = S(), today = L.today();
    const weeks = 15;
    const dow = (L.toDate(today).getDay() + 6) % 7; // понедельник = 0
    const start = L.addDays(today, -(weeks - 1) * 7 - dow);
    const cells = [];
    for (let i = 0; i < weeks * 7; i++) {
      const d = L.addDays(start, i);
      if (d > today) { cells.push(h('i', { style: { visibility: 'hidden' } })); continue; }
      const xp = (s.act[d] && s.act[d].xp) || 0;
      const lv = xp === 0 ? '' : xp < 20 ? 'l1' : xp < 60 ? 'l2' : xp < 120 ? 'l3' : 'l4';
      cells.push(h('i', { class: lv + (d === today ? ' today' : ''), title: L.fmtDate(d) + ': ' + xp + ' XP' }));
    }
    return h('div', { class: 'heat', role: 'img', 'aria-label': 'Активность за последние недели' }, cells);
  }
  function accuracyAll() {
    const s = S();
    let tot = 0, ok = 0;
    Object.keys(s.q).forEach((k) => { tot += s.q[k].s; ok += s.q[k].c; });
    Object.keys(s.drill).forEach((k) => { tot += s.drill[k].s; ok += s.drill[k].c; });
    return { tot, ok, pct: tot ? Math.round((ok / tot) * 100) : null };
  }
  L.accuracyAll = accuracyAll;

  L.route('/', function () {
    const s = S(), today = L.today();
    L.pageTitle = 'Сегодня';
    const lv = L.level(), st = L.streak();
    const dn = L.dayNumber(today);
    const dArg = L.dailyFor(dn);
    const dDone = s.daily[today] && s.daily[today].done;
    const nl = nextLesson();
    const due = L.srs.count();
    const drill = L.DRILLS[dn % L.DRILLS.length];
    const doneL = L.lessons.filter((l) => lessonState(l.n).done).length;
    const pr = window.PRINCIPLES[dn % window.PRINCIPLES.length];
    const acc = accuracyAll();
    const el = h('div');

    if (!s.seenWelcome) {
      el.append(h('div', { class: 'card', style: { marginBottom: '20px', borderColor: 'var(--gold)' } },
        h('p', { class: 'eyebrow' }, 'Добро пожаловать'),
        h('h2', { style: { marginTop: 0 } }, 'Как здесь заниматься'),
        h('ol', { class: 'prose', style: { maxWidth: 'none' } },
          h('li', null, h('b', null, 'Каждый день — «Софизм дня».'), ' 3–5 минут: прочтите рассуждение, решите, корректно ли оно, а если нет — назовите уловку и разберите, как её разрушить.'),
          h('li', null, h('b', null, 'Идите по курсу.'), ' 26 уроков по главам Челпанова: конспект, примеры, проверочные вопросы и ссылка на нужную страницу PDF.'),
          h('li', null, h('b', null, 'Доводите до автоматизма в «Тренажёрах»'), ' — они генерируют бесконечно много новых заданий.'),
          h('li', null, h('b', null, 'Раз в день заходите в «Повторение»:'), ' ошибки возвращаются через 1, 2, 4, 8… дней, пока не закрепятся.')),
        h('button', { class: 'btn primary', onclick: () => { s.seenWelcome = true; L.S.save(); L.render(); } }, 'Понятно, начинаем')));
    }

    el.append(h('section', { class: 'hero' },
      L.html('<svg class="venn" width="260" height="200" viewBox="0 0 260 200" aria-hidden="true"><circle cx="100" cy="100" r="80" fill="#fff"/><circle cx="165" cy="100" r="80" fill="#f0cf8a"/></svg>'),
      h('p', { class: 'eyebrow' }, L.fmtDate(today, true) + ' · день ' + (dn + 1)),
      h('h1', null, 'Учимся видеть, где рассуждение ломается'),
      h('p', null, 'Логика по Челпанову: от понятия и силлогизма до разоблачения софизмов. Каждый день — один разбор, и через пару месяцев вы будете замечать уловки в споре, рекламе и новостях.'),
      h('div', { class: 'row' },
        h('a', { class: 'btn', href: '#/daily' }, dDone ? 'Посмотреть разбор дня' : 'Разобрать софизм дня'),
        nl ? h('a', { class: 'btn ghost', href: '#/lesson/' + nl.n }, 'Продолжить: урок ' + nl.n) : null)));

    // план
    const plan = [
      { done: dDone, href: '#/daily', t: 'Софизм дня', sub: '3–5 минут' },
      { done: due === 0 || markedToday('rv'), href: '#/review', t: due ? 'Повторение: ' + due + ' ' + L.plural(due, 'карточка', 'карточки', 'карточек') : 'Повторение: пока всё свежо', sub: '' },
      { done: !!(nl ? lessonState(nl.n).date === today : true) || markedToday('ls'), href: nl ? '#/lesson/' + nl.n : '#/course', t: nl ? 'Урок ' + nl.n + '. ' + nl.title : 'Курс пройден!', sub: nl ? nl.min + ' минут' : '' },
      { done: markedToday('dr'), href: '#/drill/' + drill.id, t: 'Тренажёр: ' + drill.title, sub: '10 заданий' },
    ];
    const todo = h('ul', { class: 'todo' }, plan.map((p) => h('li', { class: p.done ? 'done' : '' }, h('span', { class: 'ck' }, p.done ? '✓' : ''), h('a', { href: p.href }, p.t), p.sub ? h('span', { class: 'small muted' }, p.sub) : null)));

    el.append(h('div', { class: 'grid g2' },
      h('div', { class: 'card' },
        h('p', { class: 'eyebrow' }, 'Софизм дня'),
        dDone
          ? [h('h2', null, dArg.n), h('p', { class: 'muted' }, 'Сегодняшний разбор пройден. ' + (s.daily[today].verdict ? 'Вердикт верный' + (dArg.v !== 'valid' ? (s.daily[today].type ? ', тип определён верно' : ', тип уловки определить не удалось') : '') + '.' : 'Вердикт оказался неверным — разбор поможет.')), h('a', { class: 'btn', href: '#/daily' }, 'Открыть разбор')]
          : [h('p', { class: 'arg-text', style: { fontSize: '1.05rem' } }, teaser(dArg)), h('a', { class: 'btn primary', href: '#/daily' }, 'Разобрать')]),
      h('div', { class: 'card' }, h('p', { class: 'eyebrow' }, 'План на сегодня'), todo)));

    el.append(h('div', { class: 'stats', style: { margin: '20px 0' } },
      stat(lv.name, 'ур. ' + lv.n + ' · ' + lv.xp + ' XP', lv.pct),
      stat(String(st), L.plural(st, 'день подряд', 'дня подряд', 'дней подряд')),
      stat(doneL + ' / ' + L.lessons.length, 'уроков пройдено', Math.round((doneL / L.lessons.length) * 100)),
      stat(acc.pct == null ? '—' : acc.pct + '%', 'точность ответов')));

    el.append(h('div', { class: 'grid g2' },
      h('div', { class: 'card' }, h('p', { class: 'eyebrow' }, 'Принцип дня'),
        h('p', { class: 'serif', style: { fontFamily: 'var(--serif)', fontSize: '1.35rem', lineHeight: '1.4', margin: '0 0 12px' } }, '«' + pr[0] + '»'),
        h('p', { class: 'small muted' }, 'Гл. ' + L.roman(pr[1]) + ' · ', h('a', { href: '#/lesson/' + pr[1] }, 'открыть урок'))),
      h('div', { class: 'card' }, h('p', { class: 'eyebrow' }, 'Активность'), heatmap(), h('p', { class: 'small muted', style: { margin: '8px 0 0' } }, 'Каждая клетка — день; чем темнее, тем больше опыта.'))));
    return el;
  });
  function teaser(a) {
    const t = a.p ? a.p.join(' ') + (a.c ? ' ' + a.c : '') : (a.t || '');
    const plain = t.replace(/<[^>]+>/g, '').replace(/\n/g, ' ');
    return plain.length > 150 ? plain.slice(0, 147) + '…' : plain;
  }
  function stat(big, small, pct) {
    return h('div', { class: 'card stat' }, h('b', null, big), h('span', null, small), pct != null ? h('div', { class: 'bar', style: { marginTop: '10px' } }, h('i', { style: { width: Math.max(2, pct) + '%' } })) : null);
  }

  /* ============================ КУРС ============================ */
  L.route('/course', function () {
    L.pageTitle = 'Курс';
    const doneL = L.lessons.filter((l) => lessonState(l.n).done).length, nl = nextLesson();
    const el = h('div', null,
      head('Курс', '26 уроков по Челпанову', 'Каждый урок — конспект главы своими словами, примеры из учебника, связь с софистикой, проверочные вопросы и точная ссылка на страницу PDF. Идите по порядку: главы опираются друг на друга.'),
      h('div', { class: 'card', style: { marginBottom: '24px' } },
        h('div', { class: 'row between' }, h('div', null, h('b', null, doneL + ' из ' + L.lessons.length + ' уроков пройдено')), nl ? h('a', { class: 'btn primary', href: '#/lesson/' + nl.n }, 'Продолжить: урок ' + nl.n) : chip('Курс пройден', 'good')),
        h('div', { class: 'bar', style: { marginTop: '12px' } }, h('i', { style: { width: Math.round((doneL / L.lessons.length) * 100) + '%' } }))));
    L.modules.forEach((m) => {
      const ls = L.lessons.filter((l) => l.mod === m.id);
      if (!ls.length) return;
      el.append(h('section', { class: 'module' },
        h('div', { class: 'module-h' }, h('h2', null, m.title), h('span', { class: 'muted small' }, m.sub)),
        ls.map((l) => {
          const st = lessonState(l.n);
          return h('a', { class: 'lrow' + (st.done ? ' done' : ''), href: '#/lesson/' + l.n },
            h('span', { class: 'num' }, st.done ? '✓' : String(l.n)),
            h('div', null, h('b', null, l.title), h('span', { class: 'meta' }, 'Глава ' + L.roman(l.n) + ' · ' + l.min + ' мин · PDF, стр. ' + l.pdf)),
            h('div', { class: 'chips' }, st.best != null ? chip('тест ' + st.best + '%', st.best >= 80 ? 'good' : st.best >= 60 ? 'warn' : 'bad') : null));
        })));
    });
    return el;
  });

  /* ============================ УРОК ============================ */
  function sideNav(cur) {
    const box = h('aside', { class: 'side', 'aria-label': 'Оглавление курса' });
    L.modules.forEach((m) => {
      const ls = L.lessons.filter((l) => l.mod === m.id);
      if (!ls.length) return;
      box.append(h('h4', null, m.title), ls.map((l) => h('a', Object.assign({ href: '#/lesson/' + l.n, class: lessonState(l.n).done ? 'done' : '' }, l.n === cur ? { 'aria-current': 'page' } : {}), h('span', { class: 'n' }, String(l.n)), h('span', null, l.title))));
    });
    return box;
  }
  L.route('/lesson/:n', function ({ n }) {
    const les = L.lessonBy(n);
    if (!les) return notFound();
    L.pageTitle = 'Урок ' + les.n + '. ' + les.title;
    const i = L.lessons.indexOf(les), prev = L.lessons[i - 1], next = L.lessons[i + 1];
    const st = lessonState(les.n);
    const doneBtn = h('button', { class: 'btn' + (st.done ? '' : ' primary'), onclick: () => completeLesson(les, true) }, st.done ? 'Урок пройден ✓' : 'Отметить пройденным (+20 XP)');
    if (st.done) doneBtn.disabled = true;
    const article = h('article', null,
      crumbs([['Курс', '/course'], ['Урок ' + les.n]]),
      h('header', { class: 'page-head' },
        h('p', { class: 'eyebrow' }, 'Глава ' + L.roman(les.n) + ' · ' + modName(les.mod)),
        h('h1', null, les.title),
        h('div', { class: 'row' }, chip('≈ ' + les.min + ' мин'), pdfA(les.pdf, 'Читать в учебнике (PDF, стр. ' + les.pdf + ')'), st.done ? chip('пройден', 'good') : null, st.best != null ? chip('тест ' + st.best + '%', st.best >= 70 ? 'good' : 'warn') : null)),
      h('div', { class: 'callout key' }, h('h4', null, 'Главное'), h('ul', null, les.key.map((k) => h('li', { html: k })))),
      (function () {
        const ppl = L.thinkers.filter((t) => t.chel.includes(les.n));
        return ppl.length ? h('div', { class: 'chips', style: { margin: '-6px 0 18px', alignItems: 'center' } }, h('span', { class: 'small muted' }, 'Люди и идеи:'), ppl.map((t) => h('a', { class: 'chip accent', href: '#/reference/thinkers?p=' + t.id }, t.name.split(':')[0]))) : null;
      })(),
      h('div', { class: 'prose', html: les.body }),
      les.terms && les.terms.length ? [h('h2', null, 'Термины урока'), h('div', { class: 'terms' }, les.terms.map((t) => h('div', { class: 'term' }, h('b', null, t[0]), t[1])))] : null,
      les.soph ? h('div', { class: 'callout sophist' }, h('h4', null, 'Как это используют софисты'), h('div', { html: les.soph })) : null,
      h('div', { class: 'card', style: { marginTop: '28px' } },
        h('h2', null, 'Проверь себя'),
        h('p', { class: 'muted' }, les.quiz.length + ' вопросов. Ошибки вернутся к вам на «Повторении» — через день, потом через два, четыре и так далее.'),
        h('div', { class: 'row' }, h('a', { class: 'btn primary', href: '#/quiz/' + les.n }, 'Начать проверку'), doneBtn)),
      h('nav', { class: 'row between', style: { marginTop: '24px' }, 'aria-label': 'Соседние уроки' },
        prev ? h('a', { class: 'btn', href: '#/lesson/' + prev.n }, '← ' + prev.title) : h('span'),
        next ? h('a', { class: 'btn', href: '#/lesson/' + next.n }, next.title + ' →') : h('span')));
    return h('div', { class: 'lesson-layout' }, sideNav(les.n), article);
  });
  function completeLesson(les, manual) {
    const s = S();
    const st = s.lessons[les.n] || (s.lessons[les.n] = {});
    if (!st.done) {
      st.done = true; st.date = L.today();
      L.S.save(); L.mark('ls'); L.addXP(20, 'за урок');
    }
    if (manual) L.render();
  }
  L.route('/quiz/:n', function ({ n }) {
    const les = L.lessonBy(n);
    if (!les) return notFound();
    L.pageTitle = 'Проверка · урок ' + les.n;
    const qsn = L.lessonQuestions(les);
    const box = h('div');
    const make = () => {
      box.replaceChildren(L.quiz({
        title: 'Урок ' + les.n, questions: L.shuffle(qsn),
        onAnswer: answerHook,
        onFinish: (score, total) => {
          const pct = Math.round((score / total) * 100);
          const s = S(), st = s.lessons[les.n] || (s.lessons[les.n] = {});
          if (st.best == null || pct > st.best) st.best = pct;
          L.S.save();
          if (pct === 100) L.addXP(10, 'за безупречный тест');
          if (pct >= 60) completeLesson(les, false);
        },
        again: make, backHref: '#/lesson/' + les.n, backLabel: 'К уроку',
      }));
    };
    make();
    return h('div', { style: { maxWidth: '760px', margin: '0 auto' } }, crumbs([['Курс', '/course'], ['Урок ' + les.n, '/lesson/' + les.n], 'Проверка']), h('h1', { style: { fontSize: '1.6rem' } }, les.title), box);
  });

  /* ============================ ТРЕНАЖЁРЫ ============================ */
  L.route('/drills', function () {
    L.pageTitle = 'Тренажёры';
    const s = S();
    const groups = {};
    L.DRILLS.forEach((d) => (groups[d.group] || (groups[d.group] = [])).push(d));
    const el = h('div', null, head('Тренажёры', 'Доведите навык до автоматизма', 'Задания генерируются заново, поэтому наскучить не успеют. В тренажёрах по силлогизмам правильность проверяется автоматически — двумя способами: по правилам Челпанова и по диаграммам Венна.'));
    el.append(h('a', { class: 'card', href: '#/lab', style: { marginBottom: '22px', display: 'block' } }, h('p', { class: 'eyebrow' }, 'Инструмент'), h('b', { style: { fontFamily: 'var(--serif)', fontSize: '1.2rem' } }, 'Лаборатория силлогизмов'), h('p', { class: 'muted', style: { margin: '4px 0 0' } }, 'Составьте любой силлогизм и узнайте, правилен ли он, как называется модус и какое правило нарушено.')));
    Object.keys(groups).forEach((g) => {
      el.append(h('div', { class: 'fam-h' }, h('h2', null, g)));
      el.append(h('div', { class: 'grid g-auto' }, groups[g].map((d) => {
        const r = s.drill[d.id];
        return h('a', { class: 'card', href: '#/drill/' + d.id },
          h('b', { style: { fontFamily: 'var(--serif)', fontSize: '1.12rem', display: 'block', marginBottom: '4px' } }, d.title),
          h('p', { class: 'muted small', style: { margin: '0 0 10px' } }, d.desc),
          h('div', { class: 'chips' }, chip('гл. ' + L.roman(d.ch)), r ? chip(Math.round((r.c / r.s) * 100) + '% · ' + r.s + ' отв.', r.c / r.s >= 0.8 ? 'good' : r.c / r.s >= 0.5 ? 'warn' : 'bad') : chip('ещё не пробовали')));
      })));
    });
    return el;
  });
  L.route('/drill/:id', function ({ id }) {
    const d = L.drillBy(id);
    if (!d) return notFound();
    L.pageTitle = d.title;
    const box = h('div');
    const make = () => {
      const questions = L.buildDrill(d, 10);
      box.replaceChildren(L.quiz({
        title: d.title, questions, noShuffle: false,
        onAnswer: (q, ok) => {
          const s = S(); const r = s.drill[d.id] || (s.drill[d.id] = { s: 0, c: 0 });
          r.s++; if (ok) r.c++; L.S.save(); L.tick(); L.mark('dr');
          if (ok) L.addXP(3); else L.refreshTop();
        },
        onFinish: (score, total) => { if (score / total >= 0.8) L.addXP(10, 'бонус за серию'); },
        again: make, backHref: '#/drills', backLabel: 'К тренажёрам',
      }));
    };
    make();
    return h('div', { style: { maxWidth: '760px', margin: '0 auto' } }, crumbs([['Тренажёры', '/drills'], d.title]),
      h('h1', { style: { fontSize: '1.6rem' } }, d.title), h('p', { class: 'muted' }, d.desc + ' '), pdfA((L.lessonBy(d.ch) || {}).pdf || 1, 'Теория: глава ' + L.roman(d.ch)), h('div', { style: { height: '16px' } }), box);
  });
  L.route('/lab', function () {
    L.pageTitle = 'Лаборатория силлогизмов';
    return h('div', { style: { maxWidth: '820px', margin: '0 auto' } }, crumbs([['Тренажёры', '/drills'], 'Лаборатория']), head('Инструмент', 'Лаборатория силлогизмов', 'Правила проверки — восемь правил Челпанова; рядом работает независимая проверка по диаграмме Венна. Результаты всегда совпадают для традиционной логики, где термины непусты.'), L.labWidget());
  });

  /* ============================ ПОВТОРЕНИЕ ============================ */
  function parseKey(k) {
    if (k.startsWith('q:')) { const [, n, i] = k.split(':'); const les = L.lessonBy(n); if (!les || !les.quiz[+i]) return null; return { type: 'q', key: k, q: L.lessonQuestions(les)[+i], les }; }
    if (k.startsWith('a:')) { const a = L.argBy(k.slice(2)); return a ? { type: 'a', key: k, a } : null; }
    if (k.startsWith('g:')) { const g = L.glossary[+k.slice(2)]; return g ? { type: 'g', key: k, g } : null; }
    return null;
  }
  function flashcard(item, done) {
    const g = item.g, st = { open: false };
    const root = h('div', { class: 'card' });
    function draw() {
      root.replaceChildren(
        h('div', { class: 'q-head' }, h('span', { class: 'chip' }, 'Термин · гл. ' + L.roman(g.ch))),
        h('div', { class: 'center', style: { padding: '18px 0' } }, h('div', { style: { fontFamily: 'var(--serif)', fontSize: '1.7rem', fontWeight: 700 } }, g.t), g.lat ? h('div', { class: 'muted', style: { fontStyle: 'italic' } }, g.lat) : null),
        st.open ? h('div', null, h('p', { class: 'prose', style: { margin: '0 auto 16px' } }, g.d), h('p', { class: 'small muted center' }, 'Вы вспомнили определение?'),
          h('div', { class: 'two-btns' }, h('button', { class: 'verdict-btn', onclick: () => { L.srs.record(item.key, true); L.tick(); L.addXP(2); done(true); } }, 'Знал(а)'), h('button', { class: 'verdict-btn', onclick: () => { L.srs.record(item.key, false); L.tick(); done(false); } }, 'Не знал(а)')))
          : h('div', { class: 'center' }, h('p', { class: 'muted' }, 'Попробуйте сформулировать определение вслух или про себя.'), h('button', { class: 'btn primary', onclick: () => { st.open = true; draw(); } }, 'Показать ответ')));
    }
    draw();
    return root;
  }
  function runQueue(box, keys, title, backHref) {
    const items = keys.map(parseKey).filter(Boolean);
    let i = 0, good = 0;
    function step() {
      if (i >= items.length) {
        box.replaceChildren(h('div', { class: 'card center' }, h('p', { class: 'eyebrow' }, title), h('div', { class: 'result-big' }, good + ' / ' + items.length), h('p', { class: 'muted' }, 'Сложные карточки вернутся раньше, лёгкие — позже.'), h('a', { class: 'btn primary', href: backHref || '#/' }, 'Готово')));
        L.mark('rv');
        return;
      }
      const it = items[i];
      const bar = h('div', { class: 'bar', style: { marginBottom: '14px' } }, h('i', { style: { width: Math.round((i / items.length) * 100) + '%' } }));
      const next = () => { i++; step(); window.scrollTo({ top: 0, behavior: 'instant' }); };
      let node;
      if (it.type === 'q') {
        node = wrapSingle(it.q, (ok) => { if (ok) good++; L.mark('rv'); }, next);
      } else if (it.type === 'a') {
        node = L.argCard(it.a, { mode: 'review', label: 'Повторение', onNext: next, nextLabel: 'Дальше →', onDone: (r) => { if (r.full) good++; L.mark('rv'); } });
      } else {
        node = flashcard(it, (ok) => { if (ok) good++; L.mark('rv'); next(); });
      }
      box.replaceChildren(h('p', { class: 'small muted' }, 'Карточка ' + (i + 1) + ' из ' + items.length), bar, node);
    }
    step();
  }
  // один вопрос с кнопкой «Дальше»
  function wrapSingle(q, onAns, next) {
    const root = h('div', { class: 'card' });
    const opts = L.shuffle(q.opts);
    const fb = h('div');
    const box = h('div', { class: 'opts' });
    const btns = opts.map((o, k) => h('button', { class: 'opt', onclick: () => choose(k) }, h('span', { class: 'k' }, String(k + 1)), h('span', { html: o.html })));
    let answered = false;
    function choose(k) {
      if (answered) return; answered = true;
      const o = opts[k];
      btns.forEach((b, j) => { b.disabled = true; if (opts[j].ok) b.classList.add(j === k ? 'right' : 'missed'); });
      if (!o.ok) btns[k].classList.add('wrong');
      L.srs.record(q.id, o.ok); L.tick(); if (o.ok) L.addXP(2); else L.refreshTop();
      onAns(o.ok);
      fb.replaceChildren(h('div', { class: 'feedback ' + (o.ok ? 'ok' : 'no') }, h('b', { class: 'v' }, o.ok ? 'Верно!' : 'Неверно'), L.html('<div>' + (q.expl ? '<p>' + q.expl + '</p>' : '') + '</div>')), h('div', { style: { marginTop: '14px' } }, h('button', { class: 'btn primary', 'data-next': 1, onclick: next }, 'Дальше →')));
    }
    box.append(...btns);
    root.append(h('div', { class: 'q-prompt', html: q.prompt }), box, fb);
    return root;
  }
  L.route('/review', function () {
    L.pageTitle = 'Повторение';
    const s = S(), due = L.srs.due();
    const keys = due.filter((k) => parseKey(k));
    const box = h('div');
    const unseenTerms = () => L.glossary.map((g, i) => 'g:' + i).filter((k) => !s.q[k]);
    const el = h('div', { style: { maxWidth: '760px', margin: '0 auto' } }, head('Повторение', 'Интервальное повторение', 'Вопросы, на которые вы ошиблись, возвращаются через 1 день, затем через 2, 4, 8, 16 и 32 дня — по мере того как вы отвечаете верно. Так знание переходит в долговременную память.'));
    if (keys.length) {
      const batch = L.shuffle(keys).slice(0, 12);
      el.append(h('div', { class: 'card', style: { marginBottom: '20px' } }, h('p', { style: { marginTop: 0 } }, h('b', null, keys.length + ' ' + L.plural(keys.length, 'карточка ждёт', 'карточки ждут', 'карточек ждут') + ' повторения.')), h('button', { class: 'btn primary', onclick: () => runQueue(box, batch, 'Повторение', '#/review') }, 'Начать (' + batch.length + ')')));
    } else {
      el.append(h('div', { class: 'card', style: { marginBottom: '20px' } }, h('p', { style: { marginTop: 0 } }, h('b', null, 'Сейчас повторять нечего.')), h('p', { class: 'muted' }, 'Проходите тесты к урокам и разбирайте софизмы: неверные ответы автоматически попадут сюда.')));
    }
    const nt = unseenTerms();
    el.append(h('div', { class: 'card', style: { marginBottom: '20px' } }, h('p', { style: { marginTop: 0 } }, h('b', null, 'Карточки терминов')), h('p', { class: 'muted' }, 'Новые термины: ' + nt.length + ' из ' + L.glossary.length + '. Попробуйте вспомнить определение, затем проверьте себя.'),
      h('button', { class: 'btn', disabled: nt.length === 0, onclick: () => runQueue(box, L.shuffle(nt).slice(0, 8), 'Термины', '#/review') }, 'Освежить 8 терминов')));
    el.append(box);
    return el;
  });

  /* ============================ СПРАВОЧНИК ============================ */
  const REF_TABS = [['glossary', 'Глоссарий'], ['thinkers', 'Мыслители логики'], ['square', 'Логический квадрат'], ['syllogism', 'Силлогизм'], ['rules', 'Определение и деление'], ['methods', 'Методы Милля'], ['laws', 'Законы мышления']];
  L.route('/reference', function () { return referencePage('glossary'); }, 'reference');
  L.route('/reference/:tab', function ({ tab }) { return referencePage(tab); }, 'reference');
  function referencePage(tab) {
    L.pageTitle = 'Справочник';
    if (!REF_TABS.find((t) => t[0] === tab)) tab = 'glossary';
    const body = h('div');
    const tabs = h('div', { class: 'tabs', role: 'tablist' }, REF_TABS.map((t) => h('button', { role: 'tab', 'aria-selected': String(t[0] === tab), onclick: () => { location.hash = '/reference/' + t[0]; } }, t[1])));
    body.append(REF[tab]());
    const el = h('div', null, head('Справочник', 'Шпаргалки и словарь', 'Всё, что нужно держать перед глазами: термины, таблицы, правила.'), tabs, body);
    return el;
  }
  const REF = {
    thinkers() {
      const p = qs().get('p'), st = { g: 'all' };
      const list = h('div', { class: 'stack' });
      const bar = h('div', { class: 'chips', style: { marginBottom: '16px' } });
      const gname = (id) => (L.thinkerGroups.find((g) => g[0] === id) || [])[1] || '';
      function card(t) {
        const les = t.chel.map((n) => L.lessonBy(n)).filter(Boolean);
        return h('details', { class: 'card th', id: 'th-' + t.id, open: t.id === p },
          h('summary', null, h('div', { class: 'row between' }, h('div', null, h('b', { style: { fontFamily: 'var(--serif)', fontSize: '1.2rem' } }, t.name), h('div', { class: 'small muted' }, t.years)), chip(gname(t.g), 'accent')), h('p', { style: { margin: '6px 0 0' } }, t.role)),
          h('div', { class: 'prose' },
            h('ul', null, t.ideas.map((x) => h('li', null, x))),
            t.soph ? h('div', { class: 'callout sophist' }, h('h4', null, 'Связь с софистикой'), h('p', null, t.soph)) : null,
            t.table ? h('div', { class: 'scroll-x' }, h('table', { class: 't' }, h('thead', null, h('tr', null, h('th', null, 'Уловка по Аристотелю'), h('th', null, 'У нас в каталоге'))),
              h('tbody', null, t.table.map((r) => h('tr', null, h('td', null, r[0]), h('td', null, r[1] && L.falBy(r[1]) ? h('a', { href: '#/fallacy/' + r[1] }, L.falBy(r[1]).name) : '—')))))) : null,
            h('div', { class: 'chips', style: { margin: '12px 0 6px' } }, h('span', { class: 'small muted' }, 'В учебнике Челпанова:'), les.map((l) => h('a', { class: 'chip', href: '#/lesson/' + l.n }, 'гл. ' + L.roman(l.n)))),
            h('p', { class: 'small muted', style: { margin: '10px 0 0' } }, 'Источники: ', t.src.map((s, i) => [i ? ' · ' : '', h('a', { href: s[1], target: '_blank', rel: 'noopener' }, s[0])]))));
      }
      function draw() {
        bar.replaceChildren(...[['all', 'Все']].concat(L.thinkerGroups).map((g) => h('button', { class: 'btn sm' + (st.g === g[0] ? ' primary' : ''), onclick: () => { st.g = g[0]; draw(); } }, g[1])));
        list.replaceChildren(...L.thinkers.filter((t) => st.g === 'all' || t.g === st.g).map(card));
      }
      draw();
      if (p) setTimeout(() => { const el = document.getElementById('th-' + p); if (el) el.scrollIntoView({ block: 'start', behavior: 'instant' }); }, 30);
      return h('div', { style: { maxWidth: '860px' } },
        h('p', { class: 'muted' }, 'Кто и как строил то, что вы изучаете. Сведения собраны из открытых источников (Stanford Encyclopedia of Philosophy, Википедия) и пересказаны своими словами; у каждой карточки — ссылки на источники. Нажмите на карточку, чтобы раскрыть.'),
        bar, list);
    },
    glossary() {
      const list = h('div', { class: 'grid g-auto' });
      const inp = h('input', { type: 'search', placeholder: 'Поиск по терминам…', 'aria-label': 'Поиск', oninput: draw });
      function draw() {
        const q = inp.value.trim().toLowerCase();
        list.replaceChildren(...L.glossary.filter((g) => !q || (g.t + ' ' + (g.lat || '') + ' ' + g.d).toLowerCase().includes(q)).map((g) =>
          h('div', { class: 'card flat fcard' }, h('b', null, g.t), g.lat ? h('span', { class: 'lat' }, g.lat) : null, h('p', { class: 'small', style: { margin: '6px 0 8px' } }, g.d), h('a', { class: 'small', href: '#/lesson/' + g.ch }, 'гл. ' + L.roman(g.ch)))));
      }
      draw();
      return h('div', null, h('div', { style: { maxWidth: '420px', marginBottom: '18px' } }, inp), list);
    },
    square() { return h('div', { style: { maxWidth: '760px' } }, L.squareWidget(), h('div', { class: 'prose', html: '<p><b>Практическое правило.</b> Чтобы опровергнуть «Все S суть P», достаточно показать «Некоторые S не суть P». Чтобы опровергнуть «Ни одно S не есть P», достаточно «Некоторые S суть P».</p>' })); },
    syllogism() {
      const rules = ['Ровно три термина (иначе — учетверение терминов).', 'Ровно три суждения.', 'Средний термин распределён хотя бы в одной посылке.', 'Термин, не распределённый в посылке, не может быть распределён в заключении.', 'Из двух отрицательных посылок вывода нет.', 'Одна посылка отрицательна ⇔ заключение отрицательно.', 'Из двух частных посылок вывода нет.', 'Если одна посылка частная, заключение тоже частное.'];
      return h('div', null,
        h('div', { class: 'card', style: { marginBottom: '18px' } }, h('h3', { style: { marginTop: 0 } }, 'Восемь правил силлогизма'), h('ol', null, rules.map((r) => h('li', null, r)))),
        h('div', { class: 'card', style: { marginBottom: '18px' } }, h('h3', { style: { marginTop: 0 } }, 'Фигуры'), h('div', { 'data-widget': 'figures' })),
        h('div', { class: 'card', style: { marginBottom: '18px' } }, h('h3', { style: { marginTop: 0 } }, '19 модусов'), h('div', { 'data-widget': 'modes' })),
        L.labWidget());
    },
    rules() {
      return h('div', { class: 'grid g2' },
        h('div', { class: 'card' }, h('h3', null, 'Правила определения'), h('ol', null, ['Соразмерность: не шире и не уже определяемого', 'Не делать круга', 'Не быть тавтологией (idem per idem)', 'Не быть отрицательным (кроме отрицательных понятий)', 'Быть ясным: без метафор и двусмысленностей'].map((x) => h('li', null, x))), h('p', { class: 'small muted' }, 'Формула: definitio fit per genus proximum et differentiam specificam.')),
        h('div', { class: 'card' }, h('h3', null, 'Правила деления'), h('ol', null, ['Соразмерность: сумма видов = делимому роду (не неполное, не слишком обширное)', 'Одно основание (иначе — перекрёстное деление)', 'Члены деления исключают друг друга', 'Непрерывность: без скачков'].map((x) => h('li', null, x)))),
        h('div', { class: 'card' }, h('h3', null, 'Условные силлогизмы'), h('table', { class: 't' }, h('tbody', null, [['Modus ponens', 'A→B; A ⊢ B', 'верно'], ['Modus tollens', 'A→B; ¬B ⊢ ¬A', 'верно'], ['Утверждение следствия', 'A→B; B ⊢ A', 'ошибка'], ['Отрицание основания', 'A→B; ¬A ⊢ ¬B', 'ошибка']].map((r) => h('tr', null, r.map((c) => h('td', null, c))))))),
        h('div', { class: 'card' }, h('h3', null, 'Преобразования суждений'), h('div', { 'data-widget': 'transform' })));
    },
    methods() {
      const m = [
        ['Метод согласия', 'Если в двух или более случаях явления общее лишь одно обстоятельство, оно — причина явления.', 'ABC → abc; ADE → ade ⇒ A — причина a'],
        ['Метод разницы', 'Если случай с явлением и без него различаются лишь одним обстоятельством, оно — причина или её часть.', 'ABC → abc; BC → bc ⇒ A — причина a'],
        ['Метод остатков', 'Вычтите из явления часть, известную как действие определённых причин: остаток — действие остальных.', 'ABC → abc; A→a, B→b ⇒ C — причина c'],
        ['Метод сопутствующих изменений', 'Если изменение A всегда сопровождается изменением a, а прочее не меняется, то a связано с A причинно.', 'A₁BC → a₁bc; A₂BC → a₂bc ⇒ A — причина a'],
      ];
      return h('div', { class: 'grid g2' }, m.map((x) => h('div', { class: 'card' }, h('h3', null, x[0]), h('p', null, x[1]), h('p', { class: 'mono small' }, x[2]))));
    },
    laws() {
      const m = [['Тождество', 'A есть A. Понятие остаётся тем же в ходе рассуждения.', 'Омонимия, подгонка определения'], ['Противоречие', 'A не бывает одновременно B и не-B в одном отношении.', 'Утверждения, исключающие друг друга'], ['Исключённое третье', 'Между A и не-A третьего нет (для противоречащих, не противных).', 'Ложная дилемма'], ['Достаточное основание', 'Всякая мысль должна иметь основание.', 'Довод от незнания, бремя доказательства']];
      return h('div', { class: 'grid g2' }, m.map((x) => h('div', { class: 'card' }, h('h3', null, x[0]), h('p', null, x[1]), h('p', { class: 'small muted' }, 'Его нарушает: ' + x[2]))));
    },
  };

  /* ============================ ПРОГРЕСС ============================ */
  function bestStreak() {
    const s = S(); const days = Object.keys(s.act).filter((d) => s.act[d].xp > 0).sort();
    let best = 0, cur = 0, prev = null;
    days.forEach((d) => { cur = prev && L.dayDiff(prev, d) === 1 ? cur + 1 : 1; best = Math.max(best, cur); prev = d; });
    return best;
  }
  L.route('/progress', function () {
    L.pageTitle = 'Прогресс';
    const s = S(), lv = L.level(), acc = accuracyAll();
    const solved = Object.keys(s.args).length;
    const el = h('div', null, head('Прогресс', 'Ваши успехи и слабые места'));
    el.append(h('div', { class: 'stats', style: { marginBottom: '20px' } },
      stat(lv.name, 'уровень ' + lv.n + ' · ' + lv.xp + ' XP' + (lv.to ? ' (до след. ' + (lv.to - lv.xp) + ')' : ''), lv.pct),
      stat(String(L.streak()), 'дней подряд · рекорд ' + bestStreak()),
      stat(solved + ' / ' + L.args.length, 'софизмов разобрано', Math.round((solved / L.args.length) * 100)),
      stat(acc.pct == null ? '—' : acc.pct + '%', 'точность в тестах и тренажёрах (' + acc.tot + ' отв.)')));
    el.append(h('div', { class: 'card', style: { marginBottom: '20px' } }, h('p', { class: 'eyebrow' }, 'Активность'), heatmap()));

    // по модулям
    const mods = h('div', { class: 'card', style: { marginBottom: '20px' } }, h('p', { class: 'eyebrow' }, 'Курс по модулям'));
    L.modules.forEach((m) => {
      const ls = L.lessons.filter((l) => l.mod === m.id); if (!ls.length) return;
      const done = ls.filter((l) => lessonState(l.n).done).length;
      const bests = ls.map((l) => lessonState(l.n).best).filter((x) => x != null);
      const avg = bests.length ? Math.round(bests.reduce((a, b) => a + b, 0) / bests.length) : null;
      mods.append(h('div', { style: { margin: '12px 0' } }, h('div', { class: 'row between' }, h('b', null, m.title), h('span', { class: 'small muted' }, done + '/' + ls.length + ' уроков' + (avg != null ? ' · средний тест ' + avg + '%' : ''))), h('div', { class: 'bar', style: { marginTop: '6px' } }, h('i', { style: { width: Math.round((done / ls.length) * 100) + '%' } }))));
    });
    el.append(mods);

    // по уловкам
    const fcard = h('div', { class: 'card', style: { marginBottom: '20px' } }, h('p', { class: 'eyebrow' }, 'Уловки: как вы их распознаёте'));
    const rows = L.fallacies.map((f) => ({ f, r: s.fal[f.id] })).sort((a, b) => ((a.r ? a.r.c / a.r.s : 2) - (b.r ? b.r.c / b.r.s : 2)));
    fcard.append(h('div', { class: 'grid g2', style: { gap: '4px 24px' } }, rows.map(({ f, r }) => h('div', { style: { padding: '6px 0' } },
      h('div', { class: 'row between' }, h('a', { href: '#/fallacy/' + f.id }, f.name), h('span', { class: 'small muted' }, r ? r.c + '/' + r.s : 'не встречалась')),
      h('div', { class: 'bar' + (r && r.c / r.s >= 0.8 ? ' good' : ''), style: { marginTop: '4px', height: '6px' } }, h('i', { style: { width: r ? Math.max(3, Math.round((r.c / r.s) * 100)) + '%' : '0%' } }))))));
    el.append(fcard);

    // путаница
    const conf = Object.keys(s.conf).map((k) => ({ k, n: s.conf[k] })).sort((a, b) => b.n - a.n).slice(0, 6);
    if (conf.length) {
      el.append(h('div', { class: 'card', style: { marginBottom: '20px' } }, h('p', { class: 'eyebrow' }, 'Чаще всего вы путаете'),
        h('ul', { class: 'prose' }, conf.map(({ k, n }) => {
          const [a, b] = k.split('>');
          if (a === 'valid') return h('li', null, 'Корректное рассуждение принимаете за ошибочное — ' + n + ' ' + L.plural(n, 'раз', 'раза', 'раз') + '. Не ищите подвох там, где его нет.');
          const fa = L.falBy(a), fb = L.falBy(b);
          return h('li', null, h('b', null, fa ? fa.name : a), ' — принимаете за «' + (fb ? fb.name : b) + '» (' + n + ' ' + L.plural(n, 'раз', 'раза', 'раз') + ')');
        }))));
    }

    // резервное копирование
    const file = h('input', { type: 'file', accept: '.json,application/json', style: { display: 'none' }, onchange: (e) => {
      const f = e.target.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = () => { try { L.S.import(String(rd.result)); L.toast('Прогресс загружен'); L.render(); } catch (err) { L.toast('Не удалось: ' + err.message); } };
      rd.readAsText(f);
    } });
    el.append(h('div', { class: 'card' }, h('p', { class: 'eyebrow' }, 'Резервная копия'),
      h('p', { class: 'muted' }, 'Прогресс хранится только в этом браузере. Сохраните копию, чтобы перенести его на другой компьютер или не потерять при очистке данных.'),
      h('div', { class: 'row' },
        h('button', { class: 'btn', onclick: () => {
          const blob = new Blob([L.S.export()], { type: 'application/json' });
          const a = h('a', { href: URL.createObjectURL(blob), download: 'logika-progress-' + L.today() + '.json' });
          document.body.append(a); a.click(); a.remove();
        } }, 'Скачать копию'),
        h('button', { class: 'btn', onclick: () => file.click() }, 'Загрузить копию'), file,
        h('button', { class: 'btn ghost', onclick: () => { if (confirm('Стереть весь прогресс без возможности восстановления?')) { L.S.reset(); L.render(); } } }, 'Сбросить прогресс'))));
    return el;
  });

  /* ============================ О ПРОЕКТЕ ============================ */
  L.route('/about', function () {
    L.pageTitle = 'О проекте';
    return h('div', { class: 'prose', style: { maxWidth: '760px' } }, head('О проекте', 'Как устроен тренажёр'),
      h('div', { class: 'card', html:
        '<h3>Основа</h3><p>Курс построен на «Учебнике логики» Г. И. Челпанова (издание 1915 г., электронная версия 2010 г.). Конспекты и задания написаны заново, но примеры и порядок глав — по книге; каждый урок ведёт на нужную страницу вашего PDF. Книга находится в общественном достоянии.</p>' +
        '<h3>Что добавлено сверх учебника</h3><p>В вашем PDF глава XXVI («О логических ошибках») оборвана: ошибки индукции, «a sensu diviso ad compositum» и различие софизма и паралогизма упомянуты только в контрольных вопросах. Я дополнил их, а в каталоге уловок пометил, что принадлежит Челпанову, а что — традиции логики («дополнение к учебнику»). Так же добавлены современные уловки, которых у Челпанова нет (скользкая дорожка, сложный вопрос, довод к большинству и др.).</p>' +
        '<h3>«Софизм дня»</h3><p>Каждый день — новое рассуждение из базы из ' + L.args.length + ' разборов. Порядок идёт от простого к сложному; примерно каждый четвёртый день вам попадается <i>корректное</i> рассуждение, похожее на ошибку: так вы учитесь не только ловить уловки, но и не видеть их там, где их нет. Новые разборы можно добавлять в файл <span class="mono">app/data/daily-extra.js</span> — они встанут в очередь после уже существующих.</p>' +
        '<h3>Данные и приватность</h3><p>Всё работает локально, без интернета. Прогресс хранится в памяти браузера; на странице «Прогресс» можно скачать копию и загрузить её на другом устройстве.</p>' +
        '<h3>Принцип честности</h3><p>Ошибка в рассуждении ещё не делает его <i>вывод</i> ложным — она лишь оставляет вывод недоказанным (это и есть различие формальной и материальной истинности из главы I). Поэтому разбирая софизм, всегда говорите: «довод не доказывает», а не «вы неправы».</p>' }));
  });
})();
