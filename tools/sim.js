/* Node 数值平衡模拟：node tools/sim.js [每策略局数]
   不接入页面，仅用于检查结局分布、边界安全与策略差异。 */
const path = require('path');
const Engine = require(path.join(__dirname, '..', 'js', 'engine.js'));

const ACTIONS = ['video', 'live', 'train', 'sponsor', 'rest', 'meme'];

const STRATEGIES = {
  random(s) {
    const opts = ACTIONS.filter(a => a !== 'sponsor' || s.fans >= 1500);
    return opts[Math.floor(Math.random() * opts.length)];
  },
  // 狂发短视频：少量训练和休息
  videoGrinder(s) {
    const r = Math.random();
    if (s.attrs.energy < 20) return 'rest';
    if (r < 0.68) return 'video';
    if (r < 0.8) return 'train';
    if (r < 0.92) return 'live';
    return 'rest';
  },
  // 商业流：前期拍视频攒粉，中后期赞助+直播，签约倾向
  business(s) {
    const r = Math.random();
    if (s.attrs.energy < 18) return 'rest';
    if (s.fans < 800) return r < 0.75 ? 'video' : 'live';
    if (r < 0.45) return 'sponsor';
    if (r < 0.78) return 'live';
    if (r < 0.92) return 'video';
    return 'train';
  },
  // 玩梗流：高频玩梗+直播，拒绝训练
  memeLord(s) {
    const r = Math.random();
    if (s.attrs.energy < 15) return 'rest';
    if (r < 0.55) return 'meme';
    if (r < 0.75) return 'video';
    if (r < 0.92) return 'live';
    return 'rest';
  },
  // 直播流：高频直播攒忠诚，偶尔拍视频引流，绝不得罪粉丝
  streamer(s) {
    const r = Math.random();
    if (s.attrs.energy < 22) return 'rest';
    if (r < 0.6) return 'live';
    if (r < 0.82) return 'video';
    if (r < 0.92) return 'train';
    return 'meme';
  },
  // 养老流：多休息、适度内容、不商务
  laidBack(s) {
    const r = Math.random();
    if (r < 0.4) return 'rest';
    if (r < 0.7) return 'train';
    return 'video';
  }
};

function runGame(strategyName) {
  const s = Engine.createState();
  const pick = STRATEGIES[strategyName];
  let guard = 0;
  while (!s.finished && guard++ < 200) {
    if (s.pending && s.pending.type === 'mcn') {
      const opts = Engine.mcnOptions(s).map(o => o.key);
      // 商业流偏接受，养老/玩梗流偏拒绝，其余随机
      let choice;
      if (strategyName === 'business') choice = opts.includes('accept') ? 'accept' : opts[0];
      else if (strategyName === 'memeLord' || strategyName === 'streamer') choice = opts.includes('reject') ? 'reject' : opts[0];
      else choice = opts[Math.floor(Math.random() * opts.length)];
      Engine.resolveMcn(s, choice);
      continue;
    }
    const actionId = pick(s);
    const rec = Engine.performAction(s, actionId);
    if (rec.error) continue;
    if (rec.event && rec.event.requireChoice) {
      const idx = Math.floor(Math.random() * (rec.event.options.length));
      const r2 = Engine.chooseOption(s, idx);
      if (r2.error) throw new Error(r2.error);
      if (r2.after && r2.after.finished) break;
      if (r2.after && r2.after.mcnOffer) {
        const opts = Engine.mcnOptions(s).map(o => o.key);
        Engine.resolveMcn(s, opts[Math.floor(Math.random() * opts.length)]);
      }
      continue;
    }
    if (rec.after) {
      if (rec.after.finished) break;
      if (rec.after.mcnOffer) {
        const opts = Engine.mcnOptions(s).map(o => o.key);
        const choice = strategyName === 'business' && opts.includes('accept') ? 'accept'
          : opts[Math.floor(Math.random() * opts.length)];
        Engine.resolveMcn(s, choice);
      }
    }
  }
  if (!s.finished) throw new Error('对局未正常结束');
  // 边界安全检查
  const bars = s.attrs;
  for (const k in bars) {
    if (typeof bars[k] !== 'number' || Number.isNaN(bars[k])) throw new Error('属性 NaN: ' + k);
    if (bars[k] < 0 || bars[k] > 100) throw new Error('属性越界: ' + k + '=' + bars[k]);
  }
  if (!s.endingId) throw new Error('缺少结局');
  return { endingId: s.endingId, fans: s.fans, cash: s.cash, attrs: bars, counts: s.counts, mcn: s.flags.mcn || 'none' };
}

const N = parseInt(process.argv[2] || '1000', 10);
const summary = {};
const endingNames = {};
require(path.join(__dirname, '..', 'js', 'config', 'endings.js')).endings.forEach(e => { endingNames[e.id] = e.name; });

Object.keys(STRATEGIES).forEach(name => {
  const dist = {};
  let fansSum = 0, cashSum = 0;
  for (let i = 0; i < N; i++) {
    const r = runGame(name);
    dist[r.endingId] = (dist[r.endingId] || 0) + 1;
    fansSum += r.fans;
    cashSum += r.cash;
  }
  summary[name] = { dist, avgFans: Math.round(fansSum / N), avgCash: Math.round(cashSum / N) };
});

console.log('每策略局数:', N, '\n');
Object.keys(summary).forEach(name => {
  const r = summary[name];
  console.log('【' + name + '】 平均粉丝 ' + r.avgFans + ' / 平均现金 ¥' + r.avgCash);
  Object.keys(r.dist)
    .sort((a, b) => r.dist[b] - r.dist[a])
    .forEach(id => console.log('   ' + (r.dist[id] / N * 100).toFixed(1).padStart(5) + '%  ' + id.padEnd(10) + ' ' + endingNames[id]));
  console.log('');
});

// 汇总可达性
const reachable = new Set();
Object.values(summary).forEach(r => Object.keys(r.dist).forEach(id => reachable.add(id)));
const all = Object.keys(endingNames);
const missing = all.filter(id => !reachable.has(id));
console.log('结局可达性: ' + reachable.size + '/' + all.length + (missing.length ? '  缺失: ' + missing.join(', ') : '  全部可达 ✔'));
