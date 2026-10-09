/* 游戏引擎：唯一的数值结算出口。配置只读，引擎做所有计算与状态推进。 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    const C = Object.assign({},
      require('./config/attributes.js'),
      require('./config/scenes.js'),
      require('./config/actions.js'),
      require('./config/phases.js'),
      require('./config/events.js'),
      require('./config/endings.js')
    );
    module.exports = factory(C);
  } else {
    root.NW = root.NW || {};
    root.NW.Engine = factory(root.NW.C);
  }
})(typeof self !== 'undefined' ? self : this, function (C) {
  'use strict';

  const T = C.tuning;
  const BAR_KEYS = C.bars.map(b => b.key);
  const ACTION_MAP = {};
  C.actions.forEach(a => { ACTION_MAP[a.id] = a; });

  /* ---------------- 工具 ---------------- */
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function rand(lo, hi) { return lo + Math.random() * (hi - lo); }
  function randInt(lo, hi) { return Math.floor(rand(lo, hi + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function mcnStatus(s) { return s.flags.mcn || 'none'; }

  /* ---------------- 建局 ---------------- */
  function createState() {
    const attrs = {};
    C.bars.forEach(b => { attrs[b.key] = b.initial; });
    const state = {
      phaseIndex: 0, turn: 0, actionsLeft: C.actionsPerTurn, actionIndex: 0, day: 1,
      attrs,
      fans: C.resources.fans.initial,
      cash: C.resources.cash.initial,
      counts: { video: 0, live: 0, train: 0, sponsor: 0, rest: 0, meme: 0 },
      flags: {},
      once: {}, lastFired: {},
      phaseStartFans: C.resources.fans.initial,
      phaseStartAttrs: Object.assign({}, attrs),
      pending: null,
      finished: false, endingId: null
    };
    return state;
  }

  /* ---------------- 属性变化（含上下限保护） ---------------- */
  function applyBar(state, key, delta) {
    const def = C.bars.find(b => b.key === key);
    const before = state.attrs[key];
    state.attrs[key] = clamp(before + delta, def.min, def.max);
    return Math.round(state.attrs[key] - before);
  }
  function applyFans(state, delta) {
    const before = state.fans;
    state.fans = Math.max(0, Math.round(state.fans + delta));
    return state.fans - before;
  }
  function applyCash(state, delta) {
    const before = state.cash;
    state.cash = Math.round(clamp(state.cash + delta, C.resources.cash.min, 1e9));
    return state.cash - before;
  }

  /* ---------------- 派生收益公式 ---------------- */
  const GAINS = {
    videoFans: (s, q) => Math.round((30 + s.attrs.heat * 5.2 + s.attrs.content * 1.2) * q),
    liveCash: (s, q) => Math.round((25 + s.fans * 0.012 + s.attrs.heat * 0.9) * q),
    liveFans: (s, q) => Math.round((10 + s.fans * 0.008 + s.attrs.heat * 1.2) * q),
    sponsorCash: (s, q) => Math.round((220 + s.attrs.commercial * 6 + s.fans * 0.025) * q),
    memeFans: (s, q, ctx) => {
      if (ctx.heatDelta >= 13) return Math.round((150 + ctx.heatDelta * 140 + s.attrs.heat * 8) * q);
      if (ctx.heatDelta > 0) return Math.round((25 + s.attrs.heat * 2.5) * q);
      return -Math.round((-ctx.heatDelta) * 8 * q);
    }
  };

  /* ---------------- 动作结算 ---------------- */
  function performAction(state, actionId) {
    const action = ACTION_MAP[actionId];
    if (!action) return { error: '未知动作' };
    if (state.actionsLeft <= 0 || state.pending || state.finished) return { error: '当前无法行动' };
    if (action.gate && state.fans < action.gate.fans) {
      return { error: '粉丝达到 ' + action.gate.fans + ' 后才能接品牌赞助' };
    }

    state.day = C.dayMap[state.actionIndex] || 30;
    const lowEnergy = actionId !== 'rest' && state.attrs.energy < T.lowEnergyLine;
    const signed = mcnStatus(state);
    const gainMult = (lowEnergy ? T.lowEnergyGainMult : 1)
      * (signed === 'signed' && (actionId === 'live' || actionId === 'sponsor') ? T.mcnSponsorBonus : 1)
      * (signed === 'soft' && actionId === 'sponsor' ? 1.15 : 1);
    const q = rand(0.75, 1.25);

    const deltas = {};
    let fansDelta = 0, cashDelta = 0, heatDelta = 0;

    // 精力消耗（签约额外代价；休息动作 energy 字段为 0，由 effects 回血）
    let energyCost = action.energy || 0;
    if (energyCost < 0 && signed === 'signed') energyCost -= T.mcnEnergyExtra;
    if (energyCost) applyBar(state, 'energy', energyCost);
    deltas.energy = energyCost;

    // 属性效果
    Object.keys(action.effects || {}).forEach(k => {
      const spec = action.effects[k];
      let d = spec.base + spec.rand * Math.random();
      if (d > 0 && lowEnergy) d *= T.lowEnergyGainMult;
      const real = applyBar(state, k, d);
      deltas[k] = real;
      if (k === 'heat') heatDelta += real;
    });

    // 派生收益
    if (action.gain === 'videoFans') fansDelta = applyFans(state, GAINS.videoFans(state, q * gainMult));
    if (action.gain === 'liveCash') {
      cashDelta = applyCash(state, GAINS.liveCash(state, q * gainMult));
      fansDelta = applyFans(state, GAINS.liveFans(state, q * gainMult));
    }
    if (action.gain === 'sponsorCash') cashDelta = applyCash(state, GAINS.sponsorCash(state, q * gainMult));
    if (action.gain === 'memeFans') fansDelta = applyFans(state, GAINS.memeFans(state, q * gainMult, { heatDelta }));

    state.counts[actionId]++;
    state.actionIndex++;
    state.actionsLeft--;

    // 文案分档
    const bucket = bucketFor(actionId, { q, heatDelta, fansDelta, cashDelta, contentDelta: deltas.content, energyDelta: deltas.energy, energyAfter: state.attrs.energy });
    const resultText = pick(action.texts[bucket] || action.texts.normal);

    const rec = {
      actionId, scene: action.scene, icon: action.icon, name: action.name,
      deltas, fansDelta, cashDelta, heatDelta, bucket, resultText, lowEnergy,
      event: null, after: null
    };

    // 事件抽取
    const ev = rollEvent(state, actionId);
    if (ev) {
      rec.event = ev;
      if (ev.requireChoice) {
        state.pending = { type: 'event', eventId: ev.id };
        return rec;
      }
    }

    rec.after = settle(state);
    return rec;
  }

  function bucketFor(actionId, ctx) {
    switch (actionId) {
      case 'video': return ctx.q >= 1.03 ? 'good' : ctx.q <= 0.87 ? 'bad' : 'normal';
      case 'live': return ctx.q >= 1.05 ? 'good' : ctx.q <= 0.85 ? 'bad' : 'normal';
      case 'sponsor': return ctx.q >= 1.05 ? 'good' : ctx.q <= 0.9 ? 'bad' : 'normal';
      case 'meme': return ctx.heatDelta >= 13 ? 'good' : ctx.heatDelta < 0 ? 'bad' : 'normal';
      case 'train': return ctx.contentDelta >= 11 ? 'good' : ctx.contentDelta >= 9 ? 'normal' : 'bad';
      case 'rest': return ctx.energyAfter >= 90 ? 'good' : ctx.energyAfter >= 70 ? 'normal' : 'bad';
      default: return 'normal';
    }
  }

  /* ---------------- 选项抉择 ---------------- */
  function chooseOption(state, optionIndex) {
    const pend = state.pending;
    if (!pend || pend.type !== 'event') return { error: '没有待抉择事件' };
    const evDef = C.events.find(e => e.id === pend.eventId);
    const opt = evDef.choice.options[optionIndex];
    if (!opt) return { error: '选项不存在' };

    const applied = applyOptionEffects(state, opt);
    state.pending = null;
    const after = settle(state);
    return { resultText: opt.result, ...applied, after };
  }

  function applyOptionEffects(state, opt) {
    const deltas = {};
    let fansDelta = 0, cashDelta = 0;
    Object.keys(opt.effects || {}).forEach(k => { deltas[k] = applyBar(state, k, opt.effects[k]); });
    if (opt.gain) {
      Object.keys(opt.gain).forEach(k => {
        const [lo, hi] = opt.gain[k];
        const v = randInt(lo, hi);
        if (k === 'fans') fansDelta = applyFans(state, v);
        if (k === 'cash') cashDelta = applyCash(state, v);
      });
    }
    if (opt.flags) Object.assign(state.flags, opt.flags);
    if (opt.flagIf && condMatch(opt.flagIf.when, state)) {
      state.flags[opt.flagIf.flag] = true;
    }
    return { deltas, fansDelta, cashDelta };
  }

  /* ---------------- 回合 / 阶段推进 ---------------- */
  function settle(state) {
    const out = { turnDone: false, phaseAdvance: null, mcnOffer: false, finished: false, endingId: null };
    if (state.actionsLeft > 0) return out;

    state.turn++;
    if (state.turn < C.turnsPerPhase) {
      // 回合结束，未跨阶段
      state.actionsLeft = C.actionsPerTurn;
      out.turnDone = true;
      return out;
    }

    // 阶段结束
    if (state.phaseIndex >= C.phases.length - 1) {
      out.finished = true;
      finishGame(state);
      out.endingId = state.endingId;
      return out;
    }

    const summary = buildPhaseSummary(state);
    state.phaseIndex++;
    state.turn = 0;
    state.actionsLeft = C.actionsPerTurn;
    state.phaseStartFans = state.fans;
    state.phaseStartAttrs = Object.assign({}, state.attrs);

    // 时间跳跃的自然变化
    applyBar(state, 'energy', T.phaseRestEnergy);
    applyBar(state, 'heat', -T.phaseHeatDecay);

    out.phaseAdvance = {
      to: state.phaseIndex,
      name: C.phases[state.phaseIndex].name,
      intro: C.phases[state.phaseIndex].intro,
      range: C.phases[state.phaseIndex].range,
      skip: C.phases[state.phaseIndex - 1].skip,
      summary
    };

    // MCN 邀约：进入第 3、4 阶段时仍未决定且粉丝达标
    if (!state.flags.mcnDecided && (state.phaseIndex === 2 || state.phaseIndex === 3)
      && state.fans >= T.mcnFansGate) {
      state.pending = { type: 'mcn' };
      out.mcnOffer = true;
    }
    return out;
  }

  function buildPhaseSummary(state) {
    const gain = state.fans - state.phaseStartFans;
    const bucket = gain >= 800 ? 'good' : gain >= 200 ? 'normal' : 'bad';
    const alerts = [];
    if (state.attrs.energy < 25) alerts.push('奶蛙精力告急，再硬撑可能出事。');
    if (state.cash < 0) alerts.push('账上现金为负，得想办法赚钱了。');
    if (state.flags.controversy) alerts.push('争议尚未平息，舆论仍在发酵。');
    return { bucket, fansGain: gain, energy: state.attrs.energy, alerts };
  }

  function resolveMcn(state, choice) {
    if (!state.pending || state.pending.type !== 'mcn') return { error: '没有待处理的邀约' };
    const deltas = {};
    let cashDelta = 0, fansDelta = 0;
    const record = {
      accept: { mcn: 'signed', text: '奶蛙在合约上按下一个圆圆的手印。资源、流量、KPI，从此绑在了一起。' },
      soft: { mcn: 'soft', text: '奶蛙选择了「合作不签约」——资源要拿，自由也要，成年人全都要。' },
      reject: { mcn: 'rejected', text: '奶蛙把合约推了回去：我的笑声，不接受排班。' }
    };
    const r = record[choice];
    if (!r) return { error: '未知选择' };
    state.flags.mcn = r.mcn;
    state.flags.mcnDecided = true;
    if (choice === 'accept') {
      cashDelta = applyCash(state, 800);
      deltas.commercial = applyBar(state, 'commercial', 12);
      deltas.heat = applyBar(state, 'heat', 8);
    } else if (choice === 'soft') {
      cashDelta = applyCash(state, 300);
      deltas.commercial = applyBar(state, 'commercial', 6);
      deltas.loyalty = applyBar(state, 'loyalty', 4);
    } else {
      deltas.loyalty = applyBar(state, 'loyalty', 8);
      deltas.favor = applyBar(state, 'favor', 5);
    }
    state.pending = null;
    return { resultText: r.text, deltas, cashDelta, fansDelta };
  }

  function mcnOptions(state) {
    const opts = [
      { key: 'accept', label: '签约 MCN', desc: '现金 +800、商业价值与热度大涨；之后商务收益 +30%，但工作强度和舆论风险上升。' },
      { key: 'reject', label: '拒绝签约', desc: '保持独立：粉丝忠诚度、路人缘提升，自主玩梗更容易爆。' }
    ];
    if (!state.flags.riskyAd && state.attrs.favor >= 60) {
      opts.push({ key: 'soft', label: '独立工作室软合作', desc: '不签卖身契：拿少量资源，保留自主权。需要好口碑且没接过离谱代言。', special: true });
    }
    return opts;
  }

  /* ---------------- 事件系统 ---------------- */
  function condMatch(cond, state, actionId) {
    if (!cond) return true;
    if (cond.phases && cond.phases.indexOf(state.phaseIndex) === -1) return false;
    if (cond.afterAction && cond.afterAction !== actionId) return false;
    if (cond.min) { for (const k in cond.min) if (state.attrs[k] < cond.min[k]) return false; }
    if (cond.max) { for (const k in cond.max) if (state.attrs[k] > cond.max[k]) return false; }
    if (cond.resMin) { for (const k in cond.resMin) if (state[k] < cond.resMin[k]) return false; }
    if (cond.resMax) { for (const k in cond.resMax) if (state[k] > cond.resMax[k]) return false; }
    if (cond.flags) { for (const f in cond.flags) if (!!state.flags[f] !== !!cond.flags[f]) return false; }
    if (cond.counts) { for (const a in cond.counts) if ((state.counts[a] || 0) < cond.counts[a]) return false; }
    if (cond.mcn) {
      const want = Array.isArray(cond.mcn) ? cond.mcn : [cond.mcn];
      if (want.indexOf(mcnStatus(state)) === -1) return false;
    }
    return true;
  }

  function rollEvent(state, actionId) {
    const chance = Math.min(0.75, T.eventBaseChance + state.phaseIndex * T.eventChancePerPhase);
    if (Math.random() > chance) return null;

    const pool = [];
    C.events.forEach(ev => {
      if (ev.once && state.once[ev.id]) return;
      if (ev.gap && state.lastFired[ev.id] !== undefined
        && state.actionIndex - state.lastFired[ev.id] < ev.gap) return;
      if (!condMatch(ev, state, actionId)) return;
      let w = ev.weight || 10;
      if (state.attrs.energy < T.lowEnergyLine && ev.cat === 'status') w += T.tiredEventWeightBonus;
      if (ev.id === 'major_viral' && mcnStatus(state) === 'rejected') w += 4;
      pool.push({ ev, w });
    });
    if (!pool.length) return null;

    let total = 0;
    pool.forEach(p => { total += p.w; });
    let roll = Math.random() * total;
    let chosen = pool[0].ev;
    for (const p of pool) { roll -= p.w; if (roll <= 0) { chosen = p.ev; break; } }

    return fireEvent(state, chosen);
  }

  function fireEvent(state, ev) {
    state.once[ev.id] = true;
    state.lastFired[ev.id] = state.actionIndex;
    if (ev.setFlags) Object.assign(state.flags, ev.setFlags);

    let desc = ev.desc;
    let effects = ev.effects ? Object.assign({}, ev.effects) : {};
    let gain = ev.gain ? JSON.parse(JSON.stringify(ev.gain)) : null;
    let flags = {};
    let requireChoice = !!ev.choice;

    // outcomes 分支（无选项事件）
    if (!requireChoice && ev.outcomes) {
      const branch = ev.outcomes.find(o => !o.cond || condMatch(o.cond, state)) || ev.outcomes[ev.outcomes.length - 1];
      desc = branch.desc || desc;
      effects = branch.effects ? Object.assign({}, branch.effects) : {};
      gain = branch.gain ? JSON.parse(JSON.stringify(branch.gain)) : null;
      flags = branch.flags || {};
    }

    const deltas = {};
    let fansDelta = 0, cashDelta = 0;
    Object.keys(effects).forEach(k => { deltas[k] = applyBar(state, k, effects[k]); });
    if (gain) Object.keys(gain).forEach(k => {
      const v = randInt(gain[k][0], gain[k][1]);
      if (k === 'fans') fansDelta = applyFans(state, v);
      if (k === 'cash') cashDelta = applyCash(state, v);
    });
    Object.assign(state.flags, flags);

    return {
      id: ev.id, cat: ev.cat, catName: C.eventCatNames[ev.cat],
      title: ev.title, icon: ev.icon, desc,
      deltas, fansDelta, cashDelta,
      requireChoice,
      options: requireChoice ? ev.choice.options.map(o => ({ label: o.label, effect: optionHint(o) })) : null
    };
  }

  function optionHint(opt) {
    const parts = [];
    Object.keys(opt.effects || {}).forEach(k => {
      const def = C.bars.find(b => b.key === k);
      const v = opt.effects[k];
      parts.push((def ? def.name : k) + (v > 0 ? '+' : '') + v);
    });
    if (opt.gain && opt.gain.cash) parts.push('现金+' + opt.gain.cash[0] + '起');
    return parts.join(' · ');
  }

  /* ---------------- 结局判定 ---------------- */
  function endingCondMatch(cond, state) {
    if (!cond) return true;
    if (cond.any) return cond.any.some(c => endingCondMatch(c, state));
    if (cond.min) { for (const k in cond.min) if (state.attrs[k] < cond.min[k]) return false; }
    if (cond.max) { for (const k in cond.max) if (state.attrs[k] > cond.max[k]) return false; }
    if (cond.resMin) { for (const k in cond.resMin) if (state[k] < cond.resMin[k]) return false; }
    if (cond.resMax) { for (const k in cond.resMax) if (state[k] > cond.resMax[k]) return false; }
    if (cond.flags) { for (const f in cond.flags) if (!state.flags[f]) return false; }
    if (cond.counts) { for (const a in cond.counts) if ((state.counts[a] || 0) < cond.counts[a]) return false; }
    if (cond.mcn) {
      const want = Array.isArray(cond.mcn) ? cond.mcn : [cond.mcn];
      if (want.indexOf(mcnStatus(state)) === -1) return false;
    }
    return true;
  }

  function finishGame(state) {
    const hit = C.endings.find(e => endingCondMatch(e.cond, state)) || C.endings[C.endings.length - 1];
    state.finished = true;
    state.endingId = hit.id;
    return hit;
  }

  function evaluate(state) {
    const def = C.endings.find(e => e.id === state.endingId);
    const hl = def.highlight;
    let highlightValue;
    if (hl.key === 'fans') highlightValue = formatFans(state.fans);
    else if (hl.key === 'cash') highlightValue = '¥' + state.cash;
    else highlightValue = state.attrs[hl.key];
    return {
      id: def.id, name: def.name, route: def.route, tagline: def.tagline,
      summary: def.summary, theme: def.theme, image: def.image, hidden: !!def.hidden,
      stats: [
        { label: '最终粉丝', value: formatFans(state.fans) },
        { label: '最终现金', value: '¥' + state.cash },
        { label: hl.label, value: String(highlightValue) }
      ],
      fans: state.fans, cash: state.cash
    };
  }

  function formatFans(n) {
    if (n >= 10000) return (n / 10000).toFixed(n >= 100000 ? 0 : 1) + '万';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return String(n);
  }

  return {
    createState, performAction, chooseOption, settle,
    resolveMcn, mcnOptions, finishGame, evaluate, condMatch,
    formatFans, _internal: { clamp, applyBar, applyFans, applyCash, mcnStatus, C }
  };
});
