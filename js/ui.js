/* 界面渲染层：只读引擎结果，不做数值逻辑。 */
(function (root) {
  'use strict';
  const C = root.NW.C;
  const Engine = root.NW.Engine;
  const $ = id => document.getElementById(id);
  const BAR_META = {};
  C.bars.forEach(b => { BAR_META[b.key] = b; });

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    $(id).classList.add('active');
    window.scrollTo(0, 0);
  }

  /* ---------------- 顶部 HUD ---------------- */
  function renderHUD(state) {
    $('phase-tag').textContent = '第' + ['一', '二', '三', '四', '五'][state.phaseIndex] + '阶段 · '
      + C.phases[state.phaseIndex].name;
    $('day-tag').textContent = '第 ' + state.day + ' 天';
    $('res-fans').textContent = Engine.formatFans(state.fans);
    $('res-cash').textContent = '¥' + state.cash;
    $('res-mcn').hidden = !state.flags.mcn || state.flags.mcn === 'none';
    $('res-mcn').textContent = state.flags.mcn === 'soft' ? '独立工作室合作中' : 'MCN 已签约';

    // 10 个回合格
    const pips = $('progress-pips');
    pips.innerHTML = '';
    const doneTurns = Math.floor(state.actionIndex / C.actionsPerTurn);
    for (let i = 0; i < C.turnsPerPhase * C.phases.length; i++) {
      const d = document.createElement('span');
      d.className = 'pip' + (i < doneTurns ? ' done' : i === doneTurns ? ' current' : '');
      pips.appendChild(d);
    }

    const panel = $('attrs-panel');
    panel.innerHTML = '';
    C.bars.forEach(b => {
      const row = document.createElement('div');
      row.className = 'attr-row' + (state.attrs[b.key] <= 20 ? ' attr-low' : '');
      row.innerHTML =
        '<span class="attr-icon">' + b.icon + '</span>' +
        '<span class="attr-name">' + b.name + '</span>' +
        '<span class="attr-bar"><span class="attr-fill ' + b.key + '" style="width:' + state.attrs[b.key] + '%"></span></span>' +
        '<span class="attr-val">' + Math.round(state.attrs[b.key]) + '</span>';
      panel.appendChild(row);
    });

    $('actions-left').textContent = state.actionsLeft > 0
      ? '本回合还剩 ' + state.actionsLeft + ' 次行动'
      : '本回合已结束';
  }

  /* ---------------- 动作按钮 ---------------- */
  function renderActions(state, onPick) {
    const grid = $('action-grid');
    grid.innerHTML = '';
    C.actions.forEach(a => {
      const locked = a.gate && state.fans < a.gate.fans;
      const btn = document.createElement('button');
      btn.className = 'act-btn';
      btn.disabled = !!locked || state.actionsLeft <= 0 || !!state.pending || state.finished;
      btn.innerHTML =
        '<span class="act-icon">' + a.icon + '</span>' +
        '<span class="act-name">' + a.name + '</span>' +
        '<span class="act-hint">' + (locked ? '需粉丝 ' + Engine.formatFans(a.gate.fans) : a.hint) + '</span>' +
        (locked ? '<span class="act-lock">🔒</span>' : '');
      btn.title = a.desc;
      btn.onclick = () => onPick(a.id);
      grid.appendChild(btn);
    });
  }

  /* ---------------- 场景舞台 ---------------- */
  let sceneTimer = null;
  function setScene(sceneId, mood) {
    const scene = C.SCENES[sceneId] || C.SCENES.neutral;
    const bg = $('stage-bg');
    bg.className = 'stage-bg ' + scene.bg;
    const props = $('stage-props');
    props.innerHTML = '';
    scene.props.forEach(p => {
      const el = document.createElement('span');
      el.className = 'prop';
      el.textContent = p.icon;
      el.style.left = p.x + '%';
      el.style.top = p.y + '%';
      el.style.fontSize = p.s + 'px';
      props.appendChild(el);
    });
    const frog = $('stage-frog');
    frog.classList.remove('mood-tired', 'mood-happy', 'mood-shock');
    if (mood) frog.classList.add('mood-' + mood);
  }

  function pulseScene(mood, energy) {
    setScene(lastScene, mood);
    clearTimeout(sceneTimer);
    sceneTimer = setTimeout(() => {
      setScene(lastScene, energy < C.tuning.lowEnergyLine ? 'tired' : '');
    }, 1500);
  }
  let lastScene = 'neutral';

  function floatDeltas(rec, extra) {
    const layer = $('delta-layer');
    const items = [];
    Object.keys(rec.deltas || {}).forEach(k => {
      const v = Math.round(rec.deltas[k]);
      if (v) items.push({ key: k, v });
    });
    if (rec.fansDelta) items.push({ key: 'fans', v: rec.fansDelta });
    if (rec.cashDelta) items.push({ key: 'cash', v: rec.cashDelta });
    if (extra) Object.keys(extra).forEach(k => {
      const v = Math.round(extra[k]);
      if (v) items.push({ key: k, v });
    });
    let i = 0;
    items.forEach(item => {
      const el = document.createElement('span');
      const up = item.v > 0;
      el.className = 'delta-chip ' + (up ? 'up' : 'down');
      const name = BAR_META[item.key] ? BAR_META[item.key].name
        : item.key === 'fans' ? '粉丝' : item.key === 'cash' ? '现金' : item.key;
      el.textContent = name + (up ? ' +' : ' ') + (item.key === 'cash' ? '¥' : '') + Math.abs(item.v) + (up ? '' : '');
      if (item.key === 'cash' && item.v < 0) el.textContent = name + ' -¥' + Math.abs(item.v);
      el.style.left = (14 + (i % 4) * 22) + '%';
      el.style.top = (58 - Math.floor(i / 4) * 12) + '%';
      layer.appendChild(el);
      setTimeout(() => el.remove(), 1500);
      i++;
    });
  }

  function showResult(html) { $('result-text').innerHTML = html; }
  function actionHTML(text) { return text; }

  /* ---------------- 通用弹层 ---------------- */
  function openOverlay(id) { $(id).hidden = false; }
  function closeOverlay(id) { $(id).hidden = true; }

  function modalEvent(ev) {
    return new Promise(resolve => {
      $('event-scene').textContent = ev.icon;
      $('event-cat').textContent = ev.catName;
      $('event-title').textContent = ev.title;
      $('event-desc').textContent = ev.desc;
      const box = $('event-options');
      box.innerHTML = '';
      if (ev.requireChoice) {
        ev.options.forEach((o, idx) => {
          const b = document.createElement('button');
          b.className = 'opt-btn';
          b.innerHTML = o.label + (o.effect ? '<span class="opt-effect">' + o.effect + '</span>' : '');
          b.onclick = () => { closeOverlay('overlay-event'); resolve(idx); };
          box.appendChild(b);
        });
      } else {
        const b = document.createElement('button');
        b.className = 'opt-btn btn-primary';
        b.style.textAlign = 'center';
        b.textContent = '知道了';
        b.onclick = () => { closeOverlay('overlay-event'); resolve(-1); };
        box.appendChild(b);
      }
      openOverlay('overlay-event');
    });
  }

  function modalEventResult(title, icon, catName, text) {
    return new Promise(resolve => {
      $('event-scene').textContent = icon;
      $('event-cat').textContent = catName;
      $('event-title').textContent = title;
      $('event-desc').textContent = text;
      const box = $('event-options');
      box.innerHTML = '';
      const b = document.createElement('button');
      b.className = 'opt-btn btn-primary';
      b.style.textAlign = 'center';
      b.textContent = '继续';
      b.onclick = () => { closeOverlay('overlay-event'); resolve(); };
      box.appendChild(b);
      openOverlay('overlay-event');
    });
  }

  function modalMCN(options) {
    return new Promise(resolve => {
      $('event-scene').textContent = '📣';
      $('event-cat').textContent = C.eventCatNames.decision;
      $('event-title').textContent = 'MCN 抛来橄榄枝';
      $('event-desc').textContent = '一家 MCN 机构看中了奶蛙的潜力，邀请签约。经纪人，怎么选？';
      const box = $('event-options');
      box.innerHTML = '';
      options.forEach(o => {
        const b = document.createElement('button');
        b.className = 'opt-btn' + (o.special ? ' opt-special' : '');
        b.innerHTML = '<b>' + o.label + '</b><span class="opt-effect">' + o.desc + '</span>';
        b.onclick = () => { closeOverlay('overlay-event'); resolve(o.key); };
        box.appendChild(b);
      });
      openOverlay('overlay-event');
    });
  }

  function modalPhase(data) {
    return new Promise(resolve => {
      $('phase-skip').textContent = data.skip || '一段时间过去了……';
      $('phase-title').textContent = data.name + ' · ' + data.range;
      const ul = $('phase-summary');
      ul.innerHTML = '';
      const tpl = C.phaseSummary[data.summary.bucket];
      const fansText = data.summary.fansGain > 0
        ? '+' + Engine.formatFans(data.summary.fansGain)
        : Engine.formatFans(data.summary.fansGain);
      tpl.map(line => line.replace('{fans}', fansText)).forEach(line => {
        const li = document.createElement('li');
        li.textContent = line;
        ul.appendChild(li);
      });
      data.summary.alerts.forEach(a => {
        const li = document.createElement('li');
        li.innerHTML = '<b>⚠️ ' + a + '</b>';
        ul.appendChild(li);
      });
      const intro = document.createElement('li');
      intro.style.background = '#eef8ff';
      intro.textContent = data.intro;
      ul.appendChild(intro);
      $('btn-phase-next').onclick = () => { closeOverlay('overlay-phase'); resolve(); };
      openOverlay('overlay-phase');
    });
  }

  /* ---------------- 结局 ---------------- */
  function showEnding(info) {
    $('ending-img').src = info.image;
    $('ending-img').classList.remove('img-missing');
    $('ending-img-bg').className = 'ending-img-bg ' + info.theme;
    $('ending-route').textContent = info.route + (info.hidden ? ' · 隐藏' : '');
    $('ending-name').textContent = info.name;
    $('ending-tagline').textContent = info.tagline;
    $('ending-summary').textContent = info.summary;
    const stats = $('ending-stats');
    stats.innerHTML = '';
    info.stats.forEach(s => {
      const cell = document.createElement('div');
      cell.className = 'stat-cell';
      cell.innerHTML = '<b>' + s.value + '</b><span>' + s.label + '</span>';
      stats.appendChild(cell);
    });
    showScreen('screen-ending');
  }

  /* ---------------- 图鉴 ---------------- */
  function renderGallery() {
    const data = root.NW.Storage.load();
    const unlockedCount = Object.keys(data.unlocked).length;
    $('gallery-progress').textContent = '已收集 ' + unlockedCount + ' / ' + C.endings.length + ' 个结局，再玩亿把集齐！';
    const grid = $('gallery-grid');
    grid.innerHTML = '';
    C.endings.forEach(e => {
      const got = !!data.unlocked[e.id];
      const cell = document.createElement('div');
      cell.className = 'gcell' + (got ? '' : ' gcell-locked');
      cell.innerHTML =
        '<div class="gcell-img">' +
        '<div class="ending-img-bg ' + e.theme + '" style="position:absolute;inset:0"></div>' +
        (got
          ? '<img src="' + e.image + '" alt="" onerror="this.style.display=\'none\'">'
          : '<div class="lock-mask"><span class="q">？</span><span>' + (e.hidden ? '隐藏结局' : '尚未解锁') + '</span></div>') +
        '</div>' +
        '<div class="gcell-info"><b>' + (got ? e.name : '？？？') + '</b>' +
        '<span>' + (got ? e.tagline : e.hint) + '</span></div>';
      grid.appendChild(cell);
    });
  }

  function updateGalleryCount() {
    const n = root.NW.Storage.count();
    $('gallery-count-home').textContent = n + ' / ' + C.endings.length;
  }

  /* ---------------- toast ---------------- */
  let toastTimer = null;
  function toast(msg, ms) {
    const t = $('toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, ms || 2200);
  }

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  root.NW = root.NW || {};
  root.NW.UI = {
    showScreen, renderHUD, renderActions, setScene, pulseScene,
    floatDeltas, showResult, actionHTML,
    modalEvent, modalEventResult, modalMCN, modalPhase,
    showEnding, renderGallery, updateGalleryCount, toast, sleep,
    setLastScene(s) { lastScene = s; }
  };
})(typeof self !== 'undefined' ? self : this);
