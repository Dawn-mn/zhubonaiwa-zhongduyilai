/* 本地图鉴存储：能力探测 + 失败降级，绝不假装保存成功。 */
(function (root) {
  'use strict';
  const KEY = 'naiwa_debut_v1';

  const available = (function () {
    try {
      const t = '__naiwa_test__';
      window.localStorage.setItem(t, '1');
      window.localStorage.removeItem(t);
      return true;
    } catch (e) { return false; }
  })();

  function load() {
    if (!available) return { unlocked: {} };
    try {
      const raw = window.localStorage.getItem(KEY);
      const data = raw ? JSON.parse(raw) : {};
      return { unlocked: data.unlocked || {} };
    } catch (e) { return { unlocked: {} }; }
  }

  function save(data) {
    if (!available) return false;
    try { window.localStorage.setItem(KEY, JSON.stringify(data)); return true; }
    catch (e) { return false; }
  }

  root.NW = root.NW || {};
  root.NW.Storage = {
    available,
    load() { return load(); },
    unlock(endingId, stats) {
      const data = load();
      if (!data.unlocked[endingId]) {
        data.unlocked[endingId] = { ts: Date.now(), stats: stats || null };
        return save(data) ? 'saved' : 'failed';
      }
      return 'exists';
    },
    count() { return Object.keys(load().unlocked).length; }
  };
})(typeof self !== 'undefined' ? self : this);
