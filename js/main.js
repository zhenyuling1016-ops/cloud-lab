(function () {
  'use strict';

  var BUILD_TIME = '2026-09-29 08:30 (UTC+8)';
  var VISIT_KEY = 'cloudlab.visit.count';

  function $(id) { return document.getElementById(id); }

  function setText(id, value) {
    var el = $(id);
    if (el) { el.textContent = value; }
  }

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function tickClock() {
    var d = new Date();
    setText('statTime', pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()));
  }

  function readVisitCount() {
    try {
      var raw = window.localStorage.getItem(VISIT_KEY);
      var n = parseInt(raw, 10);
      if (!isFinite(n) || n < 0) { n = 0; }
      n += 1;
      window.localStorage.setItem(VISIT_KEY, String(n));
      return n;
    } catch (e) {
      return '隐私模式';
    }
  }

  function loadTiming() {
    try {
      var nav = performance.getEntriesByType('navigation')[0];
      if (!nav) { return null; }
      return {
        duration: Math.round(nav.duration),
        fromCache: nav.transferSize === 0 && nav.decodedBodySize > 0,
        type: nav.type
      };
    } catch (e) {
      return null;
    }
  }

  function repoUrl() {
    var host = location.hostname;
    var m = host.match(/^(.+)\.github\.io$/);
    if (!m) { return 'https://github.com/'; }

    var user = m[1];
    var seg = location.pathname.split('/').filter(Boolean);

    if (host === user + '.github.io' && user.indexOf('.') === -1 && seg.length === 0) {
      return 'https://github.com/' + user + '/' + user + '.github.io';
    }
    if (seg.length > 0) {
      return 'https://github.com/' + user + '/' + seg[0];
    }
    return 'https://github.com/' + user;
  }

  function init() {
    tickClock();
    setInterval(tickClock, 1000);

    setText('statVisit', readVisitCount());
    setText('statProto', location.protocol.replace(':', '').toUpperCase());
    setText('infoHost', location.hostname || 'localhost (本地预览)');
    setText('infoPath', location.pathname);
    setText('infoUA', navigator.userAgent);
    setText('buildTime', BUILD_TIME);

    var timing = loadTiming();
    setText('statLoad', timing ? timing.duration : 'N/A');
    if (timing) {
      var label = timing.fromCache ? '命中浏览器缓存' : '由服务器返回 (200)';
      if (timing.type === 'reload') { label += ' · 手动刷新'; }
      setText('infoCache', label);
    } else {
      setText('infoCache', '当前环境不支持 Performance API');
    }

    var link = $('repoLink');
    if (link) { link.href = repoUrl(); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
