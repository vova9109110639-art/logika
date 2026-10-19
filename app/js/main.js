/* ===== main.js — запуск ===== */
(function () {
  'use strict';
  const L = window.L;
  // внутренние ссылки меняют только hash — так они работают и во встроенном окне
  document.addEventListener('click', function (e) {
    const a = e.target.closest && e.target.closest('a[href^="#/"]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    const target = a.getAttribute('href').slice(1);
    if (location.hash === '#' + target) L.render(); else location.hash = target;
  });
  window.addEventListener('hashchange', L.render);
  try { L.render(); } catch (e) { console.error(e); }
})();
