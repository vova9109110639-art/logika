/* ===== soph.js — раздел «Софистика» ===== */
(function () {
  'use strict';
  const L = window.L, h = L.h, S = () => L.S.get(), esc = L.esc;
  const head = L.head, crumbs = L.crumbs, chip = L.chip, notFound = L.notFound;

  const plain = (a) => {
    const t = a.p ? a.p.join(' ') + (a.c ? ' ' + a.c : '') : (a.t || '');
    return t.replace(/<[^>]+>/g, '').replace(/\n/g, ' ');
  };
  const teaser = (a, n) => { const t = plain(a); return t.length > (n || 120) ? t.slice(0, (n || 120) - 1) + '…' : t; };
  const argStatus = (id) => {
    const r = S().args[id];
    if (!r || !r.s) return null;
    return r.c > 0 ? (r.c === r.s ? 'good' : 'warn') : 'bad';
  };
  const statusChip = (id) => {
    const st = argStatus(id);
    return st === 'good' ? chip('решено верно', 'good') : st === 'warn' ? chip('иногда ошибались', 'warn') : st === 'bad' ? chip('ошибались', 'bad') : chip('не пробовали');
  };
  const fam = (id) => (L.families.find((f) => f.id === id) || {}).name || '';
  const argFam = (a) => (a.v === 'valid' ? 'valid' : (L.falBy(a.v) || {}).fam);
  const lvDots = (n) => '●'.repeat(n || 1) + '○'.repeat(3 - (n || 1));

  /* ============================ ХАБ ============================ */
  L.route('/sophistry', function () {
    L.pageTitle = 'Софистика';
    const s = S(), today = L.today(), dn = L.dayNumber();
    const dDone = s.daily[today] && s.daily[today].done;
    const solved = Object.keys(s.args).filter((k) => s.args[k].c > 0).length;
    const weak = L.fallacies.map((f) => ({ f, r: s.fal[f.id] })).filter((x) => x.r && x.r.s >= 1 && x.r.c / x.r.s < 0.7).sort((a, b) => a.r.c / a.r.s - b.r.c / b.r.s).slice(0, 4);
    const el = h('div', null,
      head('Софистика', 'Научитесь отличать уловку от нормального довода', 'Софизм — рассуждение, в котором сломано одно из трёх звеньев: тезис, основания или форма вывода. Здесь вы тренируетесь замечать поломку, называть её и разрушать софизм — а также не принимать корректное рассуждение за софизм.'));
    el.append(h('div', { class: 'grid g2' },
      h('a', { class: 'card', href: '#/daily' }, h('p', { class: 'eyebrow' }, 'Каждый день'), h('h2', { style: { marginTop: 0 } }, 'Софизм дня'),
        h('p', { class: 'muted' }, dDone ? 'Сегодняшний разбор пройден. Можно открыть его ещё раз и заглянуть в архив.' : 'Новое рассуждение каждый день: решите, корректно ли оно, назовите уловку и узнайте, как её разрушить.'), chip(dDone ? 'пройден' : 'ждёт вас', dDone ? 'good' : 'accent')),
      h('a', { class: 'card', href: '#/trainer' }, h('p', { class: 'eyebrow' }, 'Тренировка'), h('h2', { style: { marginTop: 0 } }, 'Софизм или нет?'),
        h('p', { class: 'muted' }, 'Серия из 10 рассуждений: часть — уловки, часть — совершенно корректные. Учимся различать.'), chip('10 разборов')),
      h('a', { class: 'card', href: '#/catalog' }, h('p', { class: 'eyebrow' }, 'Справочник'), h('h2', { style: { marginTop: 0 } }, 'Каталог уловок'),
        h('p', { class: 'muted' }, L.fallacies.length + ' логических ошибок и приёмов: признаки, примеры, как разрушить и когда это не ошибка.'), chip(L.fallacies.length + ' уловок')),
      h('a', { class: 'card', href: '#/algorithm' }, h('p', { class: 'eyebrow' }, 'Практика'), h('h2', { style: { marginTop: 0 } }, 'Как разрушать софизмы'),
        h('p', { class: 'muted' }, 'Алгоритм из шести шагов, красные и зелёные флаги, 14 контрприёмов и готовые фразы-ответы.'), chip('шпаргалка'))));
    el.append(h('a', { class: 'card', href: '#/reference/thinkers?p=aristotle', style: { marginTop: '18px' } }, h('p', { class: 'eyebrow' }, 'История'), h('h2', { style: { marginTop: 0 } }, 'Кто изучал логику и ловил софистов'),
      h('p', { class: 'muted' }, 'Аристотель и его 13 уловок, Бэкон и «идолы», Шопенгауэр и 38 приёмов спора, Милль, Поппер и другие — по открытым источникам, со ссылками.'), chip(L.thinkers.length + ' мыслителей')));
    el.append(h('div', { class: 'grid g2', style: { marginTop: '18px' } },
      h('a', { class: 'card', href: '#/library' }, h('p', { class: 'eyebrow' }, 'Архив'), h('h2', { style: { marginTop: 0 } }, 'Библиотека разборов'), h('p', { class: 'muted' }, 'Все ' + L.args.length + ' рассуждений: фильтры по теме и сложности. Решено верно: ' + solved + '.')),
      h('div', { class: 'card' }, h('p', { class: 'eyebrow' }, 'Слабые места'),
        weak.length ? h('ul', { class: 'prose' }, weak.map(({ f, r }) => h('li', null, h('a', { href: '#/fallacy/' + f.id }, f.name), ' — ' + r.c + ' из ' + r.s + ' верно'))) : h('p', { class: 'muted' }, 'Пока нет данных. Решайте разборы — здесь появятся уловки, которые вы чаще пропускаете.'))));
    el.append(h('div', { class: 'callout good', style: { marginTop: '24px' } }, h('h4', null, 'Золотое правило'),
      h('p', null, 'Ошибка в рассуждении не делает вывод ложным — она лишь оставляет его «недоказанным». Поэтому, разбирая чужой довод, говорите: «довод не доказывает», а не «вы неправы». Это честнее, точнее и сильнее в споре.')));
    return el;
  });

  /* ============================ СОФИЗМ ДНЯ ============================ */
  L.route('/daily', function () { return dailyPage(null); });
  L.route('/daily/:n', function ({ n }) { return dailyPage(+n); });
  function dailyPage(nParam) {
    const todayN = L.dayNumber();
    let n = nParam == null || isNaN(nParam) ? todayN : Math.max(0, Math.min(nParam, todayN));
    const s = S();
    const date = L.addDays(s.start, n);
    const a = L.dailyFor(n);
    const rec = s.daily[date];
    const isToday = n === todayN;
    L.pageTitle = 'Софизм дня';
    const card = L.argCard(a, {
      mode: 'daily', date, label: 'День ' + (n + 1), note: true,
      revealed: !!(rec && rec.done), past: rec,
      onNext: () => L.go('/trainer'), nextLabel: 'Потренироваться ещё →',
      onDone: () => { /* обновим архив ниже */ drawArchive(); },
    });
    const archive = h('div', { class: 'card', style: { marginTop: '28px' } });
    function drawArchive() {
      const rows = [];
      for (let k = todayN; k >= Math.max(0, todayN - 13); k--) {
        const d = L.addDays(s.start, k), r = s.daily[d], ar = L.dailyFor(k);
        rows.push(h('a', { class: 'lrow', href: '#/daily/' + k, style: { gridTemplateColumns: '44px 1fr auto' } },
          h('span', { class: 'num' }, String(k + 1)),
          h('div', null, h('b', null, r && r.done ? ar.n : (k === todayN ? 'Сегодняшнее рассуждение' : 'Пропущенный день')), h('span', { class: 'meta' }, L.fmtDate(d, true))),
          h('div', { class: 'chips' }, r && r.done ? (r.verdict && (r.type || ar.v === 'valid') ? chip('верно', 'good') : r.verdict ? chip('тип не угадан', 'warn') : chip('ошибка', 'bad')) : chip(k === todayN ? 'ждёт вас' : 'пропущено', k === todayN ? 'accent' : ''))));
      }
      archive.replaceChildren(h('p', { class: 'eyebrow' }, 'Последние дни'), ...rows);
    }
    drawArchive();
    return h('div', { style: { maxWidth: '820px', margin: '0 auto' } },
      crumbs([['Софистика', '/sophistry'], 'Софизм дня']),
      head(isToday ? 'Софизм дня' : 'Архив', L.fmtDate(date, true) + ' · разбор № ' + (n + 1), isToday ? 'Решайте самостоятельно: верьте только логике, а не собственной интуиции.' : 'Вы смотрите разбор прошлого дня.'),
      card,
      h('div', { class: 'small muted', style: { marginTop: '10px' } }, 'Совет: прежде чем отвечать, выпишите тезис и посылки на листке, а у ключевых слов спросите «в каком смысле?».'),
      archive);
  }

  /* ============================ ТРЕНАЖЁР «СОФИЗМ ИЛИ НЕТ?» ============================ */
  L.route('/trainer', function () {
    L.pageTitle = 'Софизм или нет?';
    const q = new URLSearchParams((location.hash.split('?')[1] || ''));
    const state = { f: q.get('f') || 'all', lv: q.get('lv') || 'all', fresh: q.get('fresh') === '0' ? '0' : '1' };
    const box = h('div');
    function pool() {
      let list = L.args.slice();
      if (state.f !== 'all') list = list.filter((a) => (state.f === 'valid' ? a.v === 'valid' : argFam(a) === state.f));
      if (state.lv !== 'all') list = list.filter((a) => String(a.lv || 1) === state.lv);
      return list;
    }
    function pickSet() {
      let list = pool();
      const s = S();
      if (state.fresh === '1') {
        const fresh = list.filter((a) => !s.args[a.id] || !s.args[a.id].s);
        const old = L.shuffle(list.filter((a) => s.args[a.id] && s.args[a.id].s)).sort((a, b) => ((s.args[a.id].c / s.args[a.id].s) - (s.args[b.id].c / s.args[b.id].s)));
        list = L.shuffle(fresh).concat(old);
      } else list = L.shuffle(list);
      // примерно 30% корректных рассуждений (если не выбран фильтр)
      let set;
      if (state.f === 'all') {
        const valid = list.filter((a) => a.v === 'valid'), bad = list.filter((a) => a.v !== 'valid');
        set = bad.slice(0, 7).concat(valid.slice(0, 3));
        if (set.length < 10) set = set.concat(list.filter((a) => !set.includes(a))).slice(0, 10);
      } else set = list.slice(0, 10);
      return L.shuffle(set);
    }
    function setup() {
      const sel = (key, opts) => h('select', { 'aria-label': key, onchange: (e) => { state[key] = e.target.value; setup(); } },
        opts.map(([v, t]) => h('option', Object.assign({ value: v }, state[key] === v ? { selected: true } : {}), t)));
      const n = pool().length;
      box.replaceChildren(h('div', { class: 'card' },
        h('h2', { style: { marginTop: 0 } }, 'Настройте серию'),
        h('div', { class: 'lab-sel' },
          h('div', null, h('label', null, 'Тема'), sel('f', [['all', 'Всё вперемешку (с корректными)'], ...L.families.map((f) => [f.id, f.name]), ['valid', 'Только корректные рассуждения']])),
          h('div', null, h('label', null, 'Сложность'), sel('lv', [['all', 'любая'], ['1', '● лёгкие'], ['2', '●● средние'], ['3', '●●● трудные']])),
          h('div', null, h('label', null, 'Порядок'), sel('fresh', [['1', 'сначала новые и трудные'], ['0', 'случайный']]))),
        h('p', { class: 'muted' }, 'Подходит рассуждений: ' + n + '.'),
        h('button', { class: 'btn primary', disabled: n === 0, onclick: () => run(pickSet()) }, 'Начать серию')));
    }
    function run(list) {
      let i = 0, full = 0, verdictOk = 0;
      const wrong = [];
      function step() {
        if (i >= list.length) return summary();
        const a = list[i];
        const bar = h('div', { class: 'bar', style: { marginBottom: '14px' } }, h('i', { style: { width: Math.round((i / list.length) * 100) + '%' } }));
        const card = L.argCard(a, { mode: 'train', label: (i + 1) + ' из ' + list.length,
          onDone: (r) => { if (r.full) full++; else wrong.push(a); if (r.verdictOk) verdictOk++; },
          onNext: () => { i++; step(); window.scrollTo({ top: 0, behavior: 'instant' }); }, nextLabel: i + 1 < list.length ? 'Следующее →' : 'Результат' });
        box.replaceChildren(bar, card);
      }
      function summary() {
        box.replaceChildren(h('div', { class: 'card center' },
          h('p', { class: 'eyebrow' }, 'Серия завершена'), h('div', { class: 'result-big' }, full + ' / ' + list.length),
          h('p', { class: 'muted' }, 'Вердикт («уловка или нет») верен в ' + verdictOk + ' случаях из ' + list.length + '; полностью верно (с типом уловки) — в ' + full + '.'),
          wrong.length ? h('div', { style: { textAlign: 'left', marginTop: '16px' } }, h('h3', null, 'Над чем поработать'), h('ul', { class: 'prose' }, wrong.map((a) => h('li', null, a.n + ' — ', a.v === 'valid' ? 'корректное рассуждение' : h('a', { href: '#/fallacy/' + a.v }, L.falBy(a.v).name))))) : h('p', null, 'Ни одной ошибки — отличная работа!'),
          h('div', { class: 'row', style: { justifyContent: 'center', marginTop: '18px' } }, h('button', { class: 'btn primary', onclick: () => run(pickSet()) }, 'Ещё серия'), h('button', { class: 'btn', onclick: setup }, 'Настройки'), h('a', { class: 'btn ghost', href: '#/sophistry' }, 'К разделу'))));
        L.mark('tr');
        if (full / list.length >= 0.8) L.addXP(10, 'бонус за серию');
      }
      step();
    }
    setup();
    return h('div', { style: { maxWidth: '820px', margin: '0 auto' } }, crumbs([['Софистика', '/sophistry'], 'Софизм или нет?']), head('Тренажёр', 'Софизм или нет?', 'В серии встречаются и уловки, и корректные рассуждения. Задача — не «найти ошибку любой ценой», а поставить точный диагноз.'), box);
  });

  /* ============================ БИБЛИОТЕКА ============================ */
  L.route('/library', function () {
    L.pageTitle = 'Библиотека разборов';
    const st = { f: 'all', lv: 'all', done: 'all' };
    const list = h('div');
    function sel(key, opts) {
      return h('select', { 'aria-label': key, onchange: (e) => { st[key] = e.target.value; draw(); } }, opts.map(([v, t]) => h('option', { value: v }, t)));
    }
    function draw() {
      const s = S();
      let items = L.args.slice();
      if (st.f !== 'all') items = items.filter((a) => (st.f === 'valid' ? a.v === 'valid' : argFam(a) === st.f));
      if (st.lv !== 'all') items = items.filter((a) => String(a.lv || 1) === st.lv);
      if (st.done === 'new') items = items.filter((a) => !s.args[a.id]);
      if (st.done === 'bad') items = items.filter((a) => s.args[a.id] && s.args[a.id].c < s.args[a.id].s);
      if (st.done === 'ok') items = items.filter((a) => s.args[a.id] && s.args[a.id].c > 0);
      list.replaceChildren(h('p', { class: 'muted small' }, 'Найдено: ' + items.length), ...items.map((a) => {
        const solved = s.args[a.id] && s.args[a.id].c > 0;
        return h('a', { class: 'lrow', href: '#/arg/' + a.id },
          h('span', { class: 'num', title: 'Сложность' }, lvDots(a.lv).slice(0, 3)),
          h('div', null, h('b', null, solved ? a.n : teaser(a, 90)), h('span', { class: 'meta' }, solved ? teaser(a, 90) : (a.cls ? 'классический' : ''))),
          h('div', { class: 'chips' }, statusChip(a.id)));
      }));
    }
    draw();
    return h('div', null, crumbs([['Софистика', '/sophistry'], 'Библиотека']),
      head('Библиотека', 'Все разборы', 'Названия скрыты, пока вы не решите задачу верно — чтобы название не подсказывало ответ.'),
      h('div', { class: 'lab-sel' },
        h('div', null, h('label', null, 'Тема'), sel('f', [['all', 'все'], ...L.families.map((f) => [f.id, f.name]), ['valid', 'корректные рассуждения']])),
        h('div', null, h('label', null, 'Сложность'), sel('lv', [['all', 'любая'], ['1', '● лёгкие'], ['2', '●● средние'], ['3', '●●● трудные']])),
        h('div', null, h('label', null, 'Статус'), sel('done', [['all', 'все'], ['new', 'не пробовали'], ['bad', 'с ошибками'], ['ok', 'решены верно']]))),
      list);
  });
  L.route('/arg/:id', function ({ id }) {
    const a = L.argBy(id);
    if (!a) return notFound();
    L.pageTitle = 'Разбор';
    return h('div', { style: { maxWidth: '820px', margin: '0 auto' } }, crumbs([['Софистика', '/sophistry'], ['Библиотека', '/library'], 'Разбор']),
      L.argCard(a, { mode: 'train', label: 'Разбор', onNext: () => L.go('/library'), nextLabel: 'К библиотеке' }));
  });

  /* ============================ КАТАЛОГ УЛОВОК ============================ */
  L.route('/catalog', function () {
    L.pageTitle = 'Каталог уловок';
    const s = S();
    const inp = h('input', { type: 'search', placeholder: 'Поиск: «петиция», «причина», «авторитет»…', 'aria-label': 'Поиск по уловкам', oninput: draw });
    const out = h('div');
    function draw() {
      const q = inp.value.trim().toLowerCase();
      out.replaceChildren();
      L.families.forEach((fm) => {
        const items = L.fallacies.filter((f) => f.fam === fm.id && (!q || (f.name + ' ' + f.lat + ' ' + f.short + ' ' + f.def).toLowerCase().includes(q)));
        if (!items.length) return;
        out.append(h('div', { class: 'fam-h' }, h('h2', null, fm.name), h('span', { class: 'muted small' }, fm.desc)),
          h('div', { class: 'grid g-auto' }, items.map((f) => {
            const r = s.fal[f.id];
            return h('a', { class: 'card fcard', href: '#/fallacy/' + f.id }, h('b', null, f.name), h('span', { class: 'lat' }, f.lat), h('p', { class: 'small', style: { margin: '8px 0 10px' } }, f.short),
              h('div', { class: 'chips' }, f.src === 'ch' ? chip('Челпанов, гл. ' + L.roman(f.ch), 'accent') : chip('дополнение', 'info'), r ? chip(r.c + '/' + r.s + ' верно', r.c / r.s >= 0.7 ? 'good' : 'warn') : null));
          })));
      });
      if (!out.firstChild) out.append(h('p', { class: 'muted' }, 'Ничего не найдено.'));
    }
    draw();
    return h('div', null, crumbs([['Софистика', '/sophistry'], 'Каталог уловок']),
      head('Каталог', 'Уловки и логические ошибки', 'Метка «Челпанов» — ошибка разобрана в учебнике; «дополнение» — из общей традиции логики (в вашем PDF глава XXVI оборвана). В каждой карточке: как распознать, как разрушить и когда это вовсе не ошибка.'),
      h('div', { style: { maxWidth: '440px' } }, inp), out);
  });
  L.route('/fallacy/:id', function ({ id }) {
    const f = L.falBy(id);
    if (!f) return notFound();
    L.pageTitle = f.name;
    const s = S(), r = s.fal[f.id];
    const items = L.args.filter((a) => a.v === f.id);
    const les = L.lessonBy(f.ch);
    return h('article', { style: { maxWidth: '820px', margin: '0 auto' } },
      crumbs([['Софистика', '/sophistry'], ['Каталог', '/catalog'], f.name]),
      h('header', { class: 'page-head' }, h('p', { class: 'eyebrow' }, fam(f.fam)), h('h1', null, f.name), h('p', { style: { fontStyle: 'italic' } }, f.lat),
        h('div', { class: 'row' }, f.src === 'ch' ? chip('разобрано у Челпанова, гл. ' + L.roman(f.ch), 'accent') : chip('дополнение к учебнику', 'info'), r ? chip('ваш результат: ' + r.c + ' из ' + r.s, r.c / r.s >= 0.7 ? 'good' : 'warn') : null, les ? L.pdfA(les.pdf, 'Читать в учебнике') : null)),
      h('p', { style: { fontSize: '1.2rem', fontFamily: 'var(--serif)' } }, f.short),
      h('div', { class: 'prose', html: f.def }),
      h('div', { class: 'callout sophist' }, h('h4', null, 'Как распознать'), h('ul', { class: 'flag-list' }, f.flags.map((x) => h('li', { html: x })))),
      h('div', { class: 'ex' }, h('span', { class: 't' }, 'Пример'), h('div', { html: f.ex })),
      h('h2', null, 'Как разрушить'),
      h('ol', { class: 'demolish' }, f.fix.map((x) => h('li', null, h('span', { html: x })))),
      f.re && f.re.length ? [h('h3', null, 'Что ответить собеседнику'), f.re.map((x) => h('div', { class: 'reply', html: x }))] : null,
      f.look ? h('div', { class: 'callout good' }, h('h4', null, 'Когда это не ошибка'), h('p', { html: f.look })) : null,
      h('h2', null, 'Потренироваться'),
      items.length ? h('div', null, items.map((a) => h('a', { class: 'lrow', href: '#/arg/' + a.id }, h('span', { class: 'num' }, lvDots(a.lv).slice(0, 3)), h('div', null, h('b', null, argStatus(a.id) === 'good' ? a.n : teaser(a, 80)), h('span', { class: 'meta' }, a.cls ? 'классический' : '')), h('div', { class: 'chips' }, statusChip(a.id)))))
        : h('p', { class: 'muted' }, 'Отдельных разборов с этой уловкой пока нет, но она встречается как вариант в других заданиях.'));
  });

  /* ============================ АЛГОРИТМ ============================ */
  L.route('/algorithm', function () {
    L.pageTitle = 'Как разрушать софизмы';
    const steps = [
      ['Выделите тезис', 'Что именно утверждается? Скажите это одним предложением.', 'Подмена тезиса, «чучело», красная селёдка', 25],
      ['Проверьте слова', 'Не меняет ли ключевое слово значение по ходу рассуждения? Что оно значит в каждой посылке?', 'Омонимия, подгонка определения, «все вместе» / «каждый»', 11],
      ['Выпишите все аргументы, включая скрытые', 'Какая посылка не названа вслух? Достройте энтимему.', 'Скрытые предвзятые обобщения', 17],
      ['Проверьте основания', 'Истинны ли посылки? Нет ли контрпримера? Не опираются ли они на сам тезис?', 'Ложное основание, petitio, круг, тавтология, от условного к безусловному', 26],
      ['Проверьте форму', 'Следует ли вывод из посылок? Распределён ли средний термин? Верна ли форма условного вывода?', 'Нераспределённый средний, расширение термина, утверждение следствия', 13],
      ['Оцените силу вывода', 'Достаточно ли оснований для такого уверенного вывода? Нет ли другой причины, третьего варианта, существенного различия?', 'Поспешное обобщение, post hoc, ложная аналогия, ложная дилемма', 19],
    ];
    const red = ['Ключевое слово «плывёт»: в начале означало одно, в конце другое', 'Вывод сильнее посылок: «все», «всегда», «никогда» из нескольких наблюдений', 'Вместо доводов — эмоции, авторитет, большинство, личность оппонента', 'Уход от вопроса, подмена темы, требование ответить «да/нет» на сложный вопрос', 'Тезис нельзя опровергнуть никакими фактами', 'Цепочка «если… то… то…» без обоснования шагов', '«Это как…» вместо доказательств', 'Скрытые предпосылки в вопросах и ярлыках'];
    const green = ['Термины определены и сохраняют значение', 'Посылки названы и проверяемы', 'Вывод не сильнее посылок: «вероятно», «в большинстве случаев»', 'Названы условия и границы применимости', 'Тезис можно опровергнуть: ясно, какой факт ему противоречит', 'Исключения признаются, а не объявляются «ненастоящими»', 'Отвечают на заданный вопрос', 'Различают «доказано» и «вероятно»'];
    return h('div', { style: { maxWidth: '900px', margin: '0 auto' } }, crumbs([['Софистика', '/sophistry'], 'Как разрушать']),
      head('Практика', 'Как разрушать софизмы', 'Любое доказательство состоит из тезиса, аргументов и формы (гл. XXV). Любая уловка бьёт по одному из этих звеньев. Идите по шагам — и вы найдёте поломку, даже если не знаете её латинского названия.'),
      h('ol', { class: 'demolish' }, steps.map((x) => h('li', null, h('b', null, x[0]), h('span', null, x[1]), h('div', { class: 'small', style: { marginTop: '6px' } }, h('span', { class: 'muted' }, 'Ловит: '), x[2], ' · ', h('a', { href: '#/lesson/' + x[3] }, 'гл. ' + L.roman(x[3])))))),
      h('div', { class: 'grid g2', style: { marginTop: '24px' } },
        h('div', { class: 'callout sophist', style: { margin: 0 } }, h('h4', null, 'Красные флаги'), h('ul', { class: 'flag-list' }, red.map((x) => h('li', null, x)))),
        h('div', { class: 'callout good', style: { margin: 0 } }, h('h4', null, 'Зелёные флаги'), h('ul', { class: 'flag-list green' }, green.map((x) => h('li', null, x))))),
      h('h2', null, '14 контрприёмов'),
      h('div', { class: 'grid g-auto' }, window.COUNTERMOVES.map((m, i) => h('div', { class: 'card flat' }, h('p', { class: 'eyebrow', style: { marginBottom: '4px' } }, 'Приём ' + (i + 1)), h('b', { style: { fontFamily: 'var(--serif)', fontSize: '1.05rem' } }, m.t),
        h('p', { class: 'reply', style: { margin: '10px 0', fontSize: '.95rem' } }, '«' + m.q + '»'), h('p', { class: 'small muted', style: { margin: 0 } }, 'Против: ' + m.w + ' · ', h('a', { href: '#/lesson/' + m.ch }, 'гл. ' + L.roman(m.ch)))))),
      h('div', { class: 'callout note', style: { marginTop: '28px' } }, h('h4', null, 'Не впадайте в «ошибку ошибки»'),
        h('p', null, 'Если довод оппонента плох, это ещё не значит, что его вывод ложен. Верный вывод может быть плохо обоснован (вспомните «материально истинно, но формально ложно» из главы I). Правильная реакция: «Ваш довод не доказывает этого. Есть ли другие основания?»')),
      h('div', { class: 'callout key' }, h('h4', null, 'Метод параллельного довода'),
        h('p', null, 'Самое сильное оружие против формальных ошибок: возьмите ту же схему и подставьте содержание, где вывод заведомо нелеп. «Все собаки — млекопитающие, все киты — млекопитающие, значит, все киты — собаки». Если схема приводит к абсурду, она негодна — какой бы убедительной ни казалась в первоначальном виде.')),
      h('div', { class: 'row', style: { marginTop: '24px' } }, h('a', { class: 'btn primary', href: '#/trainer' }, 'Перейти к тренировке'), h('a', { class: 'btn', href: '#/catalog' }, 'Каталог уловок')));
  });
})();
