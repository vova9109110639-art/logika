/* ===== drills.js — генераторы заданий ===== */
(function () {
  'use strict';
  const L = window.L, D = window.DRILL, SYL = L.syl;
  const esc = L.esc, pick = L.pick, shuffle = L.shuffle;

  const opt = (html, ok, note) => ({ html, ok: !!ok, note: note || '' });
  const q = (prompt, opts, expl) => ({ prompt, opts, expl });
  const strong = (s) => '<b>' + esc(s) + '</b>';
  const lastWordsFix = (s) => s;

  /* ---- диаграммы для пояснений ---- */
  const svg = (kind, o) => '<div style="max-width:200px;margin:8px 0">' + L.euler(kind, o) + '</div>';

  /* =============== 1. отношения между понятиями =============== */
  function mkRelation(it) {
    const keys = Object.keys(D.relNames);
    const wrongs = shuffle(keys.filter((k) => k !== it.r)).slice(0, 3);
    const opts = [opt(esc(D.relNames[it.r]), true)].concat(wrongs.map((k) => opt(esc(D.relNames[k]), false)));
    const kind = it.r, g = it.g;
    const diag = svg(kind, { a: 'A', b: 'B', c: 'G' });
    let legend = 'A = «' + it.a + '», B = «' + it.b + '»' + (g ? ', G = «' + g + '»' : '');
    return q('Как соотносятся понятия <b>«' + esc(it.a) + '»</b> и <b>«' + esc(it.b) + '»</b>?', opts,
      '<b>' + esc(D.relNames[it.r]) + '.</b> ' + esc(it.e) + '<div class="small muted">' + esc(legend) + '</div>' + diag);
  }

  /* =============== 2. определения =============== */
  function mkCat(item, cats, intro) {
    const keys = Object.keys(cats);
    const wrongs = shuffle(keys.filter((k) => k !== item.a));
    if (item.a !== 'ok' && !wrongs.slice(0, 3).includes('ok')) wrongs.splice(2, 1, 'ok');
    const opts = [opt(esc(cats[item.a]), true)].concat(wrongs.slice(0, 3).map((k) => opt(esc(cats[k]), false)));
    return q(intro + '<div class="syl"><span class="l">' + esc(item.s) + '</span></div>', opts, '<b>' + esc(cats[item.a]) + '.</b> ' + esc(item.e));
  }

  /* =============== 3. тип суждения и распределённость =============== */
  const TYPE_NAMES = { A: 'A — общеутвердительное (все S суть P)', E: 'E — общеотрицательное (ни одно S не есть P)', I: 'I — частноутвердительное (некоторые S суть P)', O: 'O — частноотрицательное (некоторые S не суть P)' };
  const DIST = {
    A: ['Только подлежащее S', 'S распределено, P — нет.', 'sub', { S: true, P: false }, 'S'],
    E: ['Оба термина (S и P)', 'В E распределены и S, и P.', 'dis', { S: true, P: true }, null],
    I: ['Ни один термин', 'В I не распределён ни S, ни P.', 'cross', { S: false, P: false }, 'S&P'],
    O: ['Только сказуемое P', 'В O распределено только P.', 'cross', { S: false, P: true }, 'S-P'],
  };
  function mkPtype(it) {
    const opts = ['A', 'E', 'I', 'O'].map((t) => opt(esc(TYPE_NAMES[t]), t === it.t));
    return q('Определите тип суждения:<div class="syl"><span class="l">' + esc(it.s) + '</span></div>', opts,
      '<b>' + it.t + '.</b> Признак — слова «' + { A: 'все / всякий / каждый (утверждение)', E: 'ни один / никакой / не… (общее отрицание)', I: 'некоторые / есть / кое-кто', O: 'не все / некоторые не…' }[it.t] + '». Суждения без количественного слова об общем понятии считаются общими. Единичные суждения приравниваются к общим.');
  }
  function mkDistrib(it) {
    const keys = ['A', 'E', 'I', 'O'];
    const opts = keys.map((t) => opt(esc(DIST[t][0]), t === it.t));
    const d = DIST[it.t];
    return q('Какие термины распределены в суждении?<div class="syl"><span class="l">' + esc(it.s) + '</span></div>', opts,
      '<b>' + it.t + '.</b> ' + d[1] + svg(d[2], { shade: d[4] || undefined, dist: d[3] }));
  }

  /* =============== 4. логический квадрат =============== */
  const SQN = { t: 'Истинно', f: 'Ложно', u: 'Неопределённо' };
  function mkSquare() {
    const ex = pick(L.SQEX);
    const from = pick(['A', 'E', 'I', 'O']), tv = pick([1, 0]);
    const to = pick(['A', 'E', 'I', 'O'].filter((k) => k !== from));
    if (Math.random() < 0.2) {
      // как лучше опровергнуть общее суждение
      const gen = pick(['A', 'E']);
      const bestOpp = gen === 'A' ? 'O' : 'I';
      const otherOpp = gen === 'A' ? 'E' : 'A';
      const opts = [opt(esc(ex[bestOpp]), true), opt(esc(ex[otherOpp]), false, 'Это противное суждение: опровергать им рискованно — чтобы его обосновать, придётся доказывать больше, чем нужно.'),
        opt(esc(ex[gen === 'A' ? 'I' : 'O']), false, 'Это подчинённое частное суждение, оно совместимо с исходным и ничего не опровергает.'), opt('Повторить утверждение с другой интонацией', false, '')];
      return q('Вам говорят: <b>«' + esc(ex[gen]) + '»</b>. Какое суждение лучше всего подходит, чтобы это опровергнуть?', shuffle(opts),
        'Достаточно противоречащего суждения (' + bestOpp + '): оно минимально рискованно. Гл. X: «гораздо меньше риска утверждать O, чем E» — и наоборот для опровержения E.');
    }
    const res = L.SQ[from + tv][to];
    const opts = ['t', 'f', 'u'].map((k) => opt(SQN[k], k === res));
    const rel = L.SQREL[from + to];
    return q('Допустим, суждение <b>' + from + ' («' + esc(ex[from]) + '»)</b> ' + (tv ? '<b>ИСТИННО</b>' : '<b>ЛОЖНО</b>') + '. Что можно сказать о суждении <b>' + to + ' («' + esc(ex[to]) + '»)</b>?', opts,
      'Отношение ' + from + '—' + to + ': <b>' + rel + '</b>. Итог: <b>' + SQN[res].toLowerCase() + '</b>.');
  }

  /* =============== 5. непосредственные умозаключения =============== */
  const T = (sg, pl, g) => ({ sg, pl, g });
  const PAIRS = {
    A: [[T('птица', 'птицы', 'f'), T('животное', 'животные', 'n')], [T('металл', 'металлы', 'm'), T('элемент', 'элементы', 'm')], [T('рыба', 'рыбы', 'f'), T('позвоночное', 'позвоночные', 'n')], [T('кит', 'киты', 'm'), T('млекопитающее', 'млекопитающие', 'n')], [T('сосна', 'сосны', 'f'), T('растение', 'растения', 'n')]],
    E: [[T('насекомое', 'насекомые', 'n'), T('позвоночное', 'позвоночные', 'n')], [T('металл', 'металлы', 'm'), T('газ', 'газы', 'm')], [T('планета', 'планеты', 'f'), T('звезда', 'звёзды', 'f')], [T('кит', 'киты', 'm'), T('рыба', 'рыбы', 'f')]],
    I: [[T('книга', 'книги', 'f'), T('полезная вещь', 'полезные вещи', 'f')], [T('писатель', 'писатели', 'm'), T('учёный', 'учёные', 'm')], [T('студент', 'студенты', 'm'), T('спортсмен', 'спортсмены', 'm')]],
    O: [[T('человек', 'люди', 'm'), T('богач', 'богачи', 'm')], [T('птица', 'птицы', 'f'), T('летающее существо', 'летающие существа', 'n')], [T('металл', 'металлы', 'm'), T('тяжёлое тело', 'тяжёлые тела', 'n')], [T('книга', 'книги', 'f'), T('полезная вещь', 'полезные вещи', 'f')]],
  };
  const nonT = (t) => ({ sg: 'не-' + t.sg, pl: 'не-' + t.pl, g: t.g });
  const sent = (t, S, P) => SYL.sentence(t, S, P);
  const OPNAME = { obv: 'превращение (obversio)', conv: 'обращение (conversio)', contra: 'противопоставление' };
  function mkImmediate() {
    const op = pick(['obv', 'conv', 'contra']);
    const t = pick(['A', 'E', 'I', 'O']);
    const [S, P] = pick(PAIRS[t]);
    const nP = nonT(P);
    const base = sent(t, S, P);
    let right, wrongs, rule;
    const NO_CONV = 'Не обращается', NO_CP = 'Не допускает противопоставления';
    if (op === 'obv') {
      const R = { A: 'E', E: 'A', I: 'O', O: 'I' }[t];
      right = sent(R, S, nP);
      // типичные ошибки: забыли отрицать предикат; отрицали лишь предикат; перепутали тип
      wrongs = [sent(R, S, P), sent(t, S, nP), sent({ A: 'O', E: 'I', I: 'E', O: 'A' }[t], S, nP)];
      rule = 'Превращение: меняем качество (A↔E, I↔O) и берём противоречащий предикат (не-P). Смысл суждения не меняется.';
    } else if (op === 'conv') {
      if (t === 'A') { right = sent('I', P, S); wrongs = [sent('A', P, S), sent('E', P, S), sent('O', P, S)]; rule = 'A обращается в I (по ограничению): предикат в A не распределён, поэтому «все P» говорить нельзя. Чисто — лишь если S и P равнозначны.'; }
      else if (t === 'E') { right = sent('E', P, S); wrongs = [sent('A', P, S), sent('I', P, S), NO_CONV]; rule = 'E обращается чисто: оба термина распределены, поэтому можно поменять их местами.'; }
      else if (t === 'I') { right = sent('I', P, S); wrongs = [sent('A', P, S), sent('E', P, S), NO_CONV]; rule = 'I обращается чисто: оба термина нераспределены и остаются таковыми.'; }
      else { right = NO_CONV; wrongs = [sent('O', P, S), sent('I', P, S), sent('A', P, S)]; rule = 'O не обращается: в обращённом (отрицательном) суждении P стало бы подлежащим, а в исходном O оно было распределено, S — нет. Получилось бы расширение.'; }
    } else {
      if (t === 'A') { right = sent('E', nP, S); wrongs = [sent('A', nP, S), sent('E', P, S), sent('I', nP, S)]; rule = 'Противопоставление A: сначала превращение (ни одно S не есть не-P), затем чистое обращение: ни одно не-P не есть S.'; }
      else if (t === 'E') { right = sent('I', nP, S); wrongs = [sent('E', nP, S), sent('A', nP, S), NO_CP]; rule = 'Противопоставление E: превращение (все S суть не-P), затем обращение по ограничению: некоторые не-P суть S.'; }
      else if (t === 'O') { right = sent('I', nP, S); wrongs = [sent('O', nP, S), sent('E', nP, S), NO_CP]; rule = 'Противопоставление O: превращение (некоторые S суть не-P), затем чистое обращение: некоторые не-P суть S.'; }
      else { right = NO_CP; wrongs = [sent('I', nP, S), sent('O', nP, S), sent('A', nP, S)]; rule = 'Суждение I не допускает противопоставления: превращение даёт O, а O не обращается.'; }
    }
    const opts = [opt(esc(right), true)].concat(wrongs.filter((w, i, arr) => w !== right && arr.indexOf(w) === i).slice(0, 3).map((w) => opt(esc(w), false)));
    return q('Выполните <b>' + OPNAME[op] + '</b> суждения:<div class="syl"><span class="l">' + esc(base) + ' <span class="tag">' + t + '</span></span></div>', opts, esc(rule));
  }

  /* =============== 6. силлогизмы =============== */
  const ALL = [];
  [1, 2, 3, 4].forEach((fig) => ['A', 'E', 'I', 'O'].forEach((a) => ['A', 'E', 'I', 'O'].forEach((b) => ['A', 'E', 'I', 'O'].forEach((c) => {
    ALL.push({ fig, maj: a, min: b, con: c, chk: SYL.check(fig, a, b, c) });
  }))));
  L.sylAll = ALL;
  const GROUP = (id) => (id === 3 ? 'g3' : id === 4 ? 'g4' : id === 5 || id === 7 ? 'g57' : 'g68');
  const GNAME = {
    ok: 'Правильный силлогизм',
    g3: 'Неправильный: средний термин не распределён (правило 3)',
    g4: 'Неправильный: термин распределён в заключении, но не в посылке (правило 4)',
    g57: 'Неправильный: обе посылки отрицательные или обе частные (правила 5, 7)',
    g68: 'Неправильный: качество или количество заключения не согласовано с посылками (правила 6, 8)',
  };
  function termsFor(rnd) {
    if (rnd < 0.3) return null;
    const t = pick(D.synTerms);
    return { S: t.S, M: t.M, P: t.P };
  }
  function sylPrompt(b, intro) {
    return intro + SYL.html(b, false);
  }
  const VALID19 = ALL.filter((x) => x.chk.valid && !x.chk.weak);
  const VALIDALL = ALL.filter((x) => x.chk.valid);
  const INVALID1 = ALL.filter((x) => !x.chk.valid && new Set(x.chk.broken.map((r) => GROUP(r.id))).size === 1);
  function mkValidity() {
    const wantValid = Math.random() < 0.45;
    const it = wantValid ? pick(VALIDALL) : pick(INVALID1);
    const terms = termsFor(Math.random());
    const b = SYL.build(it.fig, it.maj, it.min, it.con, terms);
    const corr = it.chk.valid ? 'ok' : GROUP(it.chk.broken[0].id);
    const opts = Object.keys(GNAME).map((k) => opt(esc(GNAME[k]), k === corr));
    let expl;
    if (it.chk.valid) expl = 'Это модус <b>' + it.chk.name + '</b> (' + it.maj + it.min + it.con + ', фигура ' + it.fig + ').' + (it.chk.weak ? ' Ослабленный модус: заключение частное, хотя при этих посылках можно было вывести общее.' : '');
    else expl = it.chk.broken.map((r) => '<p><b>Правило ' + r.id + '.</b> ' + esc(r.text) + '</p>').join('');
    expl += '<p class="small muted">Фигура ' + it.fig + ': большая посылка — ' + SYL.FIG[it.fig].maj.join('–') + ', меньшая — ' + SYL.FIG[it.fig].min.join('–') + '. Правильность определяется формой, а не истинностью посылок.</p>';
    return q(sylPrompt(b, 'Правилен ли силлогизм? Если нет — какое правило нарушено?<div class="small muted">Истинность посылок не важна — оцените только форму. Подлежащее заключения — меньший термин (S), его сказуемое — больший (P), общий термин посылок — средний (M).</div>'), shuffle(opts), expl);
  }
  function mkFigmood() {
    const it = pick(VALID19);
    const terms = termsFor(Math.random());
    const b = SYL.build(it.fig, it.maj, it.min, it.con, terms);
    const lab = (x) => 'Фигура ' + x.fig + ', ' + x.chk.name + ' (' + x.maj + x.min + x.con + ')';
    const sameLetters = VALID19.filter((x) => x !== it && x.maj + x.min + x.con === it.maj + it.min + it.con);
    const others = shuffle(VALID19.filter((x) => x !== it && !sameLetters.includes(x)));
    const wrongs = sameLetters.concat(others).slice(0, 3);
    const opts = [opt(esc(lab(it)), true)].concat(wrongs.map((x) => opt(esc(lab(x)), false)));
    const f = SYL.FIG[it.fig];
    const where = (p) => (p === 'M' ? '' : '');
    const expl = 'Средний термин M в большей посылке — ' + (f.maj[0] === 'M' ? 'подлежащее' : 'сказуемое') + ', в меньшей — ' + (f.min[0] === 'M' ? 'подлежащее' : 'сказуемое') + ' ⇒ <b>фигура ' + it.fig + '</b>. Типы суждений ' + it.maj + ' + ' + it.min + ' ⇒ ' + it.con + ' ⇒ модус <b>' + it.chk.name + '</b>.';
    return q(sylPrompt(b, 'Определите фигуру и модус силлогизма.'), shuffle(opts), expl);
  }

  /* =============== 7. условные силлогизмы =============== */
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function mkConditional() {
    const c = pick(D.conditionals);
    const form = pick(['mp', 'mt', 'ac', 'da']);
    const major = 'Если ' + c.A + ', то ' + c.B + '.';
    let minor, con, expl;
    if (form === 'mp') { minor = cap(c.A) + '.'; con = 'Следовательно, ' + c.B + '.'; expl = 'Утверждаем основание — утверждаем следствие: <b>modus ponens</b>, верная форма.'; }
    else if (form === 'mt') { minor = cap(c.nB) + '.'; con = 'Следовательно, ' + c.nA + '.'; expl = 'Отрицаем следствие — отрицаем основание: <b>modus tollens</b>, верная форма.'; }
    else if (form === 'ac') { minor = cap(c.B) + '.'; con = 'Следовательно, ' + c.A + '.'; expl = 'Утверждение следствия — ошибка: ' + c.alt + '. Одно и то же действие может иметь разные причины.'; }
    else { minor = cap(c.nA) + '.'; con = 'Следовательно, ' + c.nB + '.'; expl = 'Отрицание основания — ошибка: ' + c.alt + '. Следствие могло возникнуть и по другой причине.'; }
    const syl = '<div class="syl"><span class="l">' + esc(major) + '</span><span class="l">' + esc(minor) + '</span><span class="l c">' + esc(con) + '</span></div>';
    const opts = Object.keys(D.condForms).map((k) => opt(esc(D.condForms[k].label), k === form));
    return q('Как оценить это рассуждение?' + syl, opts, expl);
  }

  /* =============== 8. энтимемы =============== */
  function mkEnthymeme(it) {
    const opts = [opt(esc(it.h), true)].concat(it.w.map((w) => opt(esc(w), false)));
    return q('Какая скрытая посылка стоит за этим рассуждением?<div class="syl"><span class="l">' + esc(it.s) + '</span></div>', opts,
      '<b>Скрытая посылка:</b> «' + esc(it.h) + '» ' + esc(it.e) + '<p class="small muted">Привычка №1: прежде чем принять вывод, восстановите пропущенную посылку и оцените её отдельно.</p>');
  }

  /* =============== реестр тренажёров =============== */
  const sampleBank = (bank, n) => shuffle(bank).slice(0, n);
  L.DRILLS = [
    { id: 'relations', group: 'Понятие', title: 'Отношения между понятиями', desc: 'Подчинение, соподчинение, равнозначность, пересечение, противоположность, противоречие.', ch: 4, bank: D.relations, item: mkRelation },
    { id: 'definitions', group: 'Определение и деление', title: 'Ошибки в определениях', desc: 'Слишком широкое, слишком узкое, круг, тавтология, отрицательное, образное.', ch: 5, bank: D.definitions, item: (it) => mkCat(it, D.defCats, 'Оцените определение:') },
    { id: 'division', group: 'Определение и деление', title: 'Ошибки в делении', desc: 'Неполное, слишком обширное, смена основания, скачок.', ch: 6, bank: D.divisions, item: (it) => mkCat(it, D.divCats, 'Оцените деление:') },
    { id: 'ptype', group: 'Суждение', title: 'Тип суждения: A, E, I, O', desc: 'Определите тип суждения по формулировке.', ch: 8, bank: D.props, item: mkPtype },
    { id: 'distrib', group: 'Суждение', title: 'Распределённость терминов', desc: 'Какие термины взяты во всём объёме в суждениях A, E, I, O.', ch: 9, bank: D.props, item: mkDistrib },
    { id: 'square', group: 'Суждение', title: 'Логический квадрат', desc: 'Из истинности (ложности) одного суждения — к остальным.', ch: 10, make: mkSquare },
    { id: 'immediate', group: 'Прямые выводы', title: 'Превращение, обращение, противопоставление', desc: 'Выполните преобразование суждения верно.', ch: 12, make: mkImmediate },
    { id: 'laws', group: 'Законы мышления', title: 'Законы мышления', desc: 'Какой закон нарушен или применён.', ch: 11, bank: D.laws, item: (it) => mkCat(it, D.lawCats, 'Какой закон мышления здесь нарушен или применён?') },
    { id: 'validity', group: 'Силлогизм', title: 'Правильный ли силлогизм?', desc: 'Проверка по правилам: распределённость, число терминов, качество и количество.', ch: 13, make: mkValidity },
    { id: 'figmood', group: 'Силлогизм', title: 'Фигура и модус', desc: 'Определите фигуру и название модуса.', ch: 14, make: mkFigmood },
    { id: 'conditional', group: 'Силлогизм', title: 'Условные силлогизмы', desc: 'Modus ponens, modus tollens и две запрещённые формы.', ch: 16, make: mkConditional },
    { id: 'enthymeme', group: 'Силлогизм', title: 'Восстановите энтимему', desc: 'Найдите скрытую посылку и оцените её.', ch: 17, bank: D.enthymemes, item: mkEnthymeme },
    { id: 'mill', group: 'Индукция', title: 'Методы Милля', desc: 'Согласия, разницы, остатков, сопутствующих изменений.', ch: 20, bank: D.mill, item: (it) => mkCat(it, D.millCats, 'Какой метод индуктивного исследования здесь применён?') },
    { id: 'induct', group: 'Индукция', title: 'Виды индукции', desc: 'Полная, популярная и научная индукция.', ch: 19, bank: D.induct.items, item: (it) => mkCat(it, D.induct.cats, 'Какой вид индукции перед вами?') },
  ];
  L.drillBy = (id) => L.DRILLS.find((d) => d.id === id);
  L.buildDrill = function (d, n) {
    n = n || 10;
    if (d.bank) return sampleBank(d.bank, Math.min(n, d.bank.length)).map(d.item);
    const out = [], seen = new Set();
    let guard = 0;
    while (out.length < n && guard++ < 200) {
      const qq = d.make();
      const key = typeof qq.prompt === 'string' ? qq.prompt : String(out.length);
      if (!seen.has(key)) { seen.add(key); out.push(qq); }
    }
    return out;
  };
})();
