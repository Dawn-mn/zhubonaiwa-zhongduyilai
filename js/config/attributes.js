/* 属性配置：初值、上下限、展示信息。所有数值结算仅由 engine.js 执行。 */
(function (root, factory) {
  const data = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  else { root.NW = root.NW || {}; root.NW.C = root.NW.C || {}; Object.assign(root.NW.C, data); }
})(typeof self !== 'undefined' ? self : this, function () {
  return {
    // 0–100 的六条属性条
    bars: [
      { key: 'heat',       name: '热度',     icon: '🔥', initial: 10, min: 0, max: 100 },
      { key: 'content',    name: '内容能力', icon: '🎯', initial: 15, min: 0, max: 100 },
      { key: 'favor',      name: '路人缘',   icon: '🙂', initial: 50, min: 0, max: 100 },
      { key: 'loyalty',    name: '忠诚度',   icon: '💛', initial: 20, min: 0, max: 100 },
      { key: 'energy',     name: '精力',     icon: '🔋', initial: 80, min: 0, max: 100 },
      { key: 'commercial', name: '商业价值', icon: '💼', initial: 5,  min: 0, max: 100 }
    ],
    // 数值型资源
    resources: {
      fans: { initial: 128 },
      cash: { initial: 200, min: -9999 }
    },
    // 全局调节常量（平衡调参集中在这里）
    tuning: {
      eventBaseChance: 0.58,        // 每次行动触发普通事件的基础概率
      eventChancePerPhase: 0.03,    // 每往后一阶段增加的概率
      lowEnergyLine: 25,            // 低精力阈值
      lowEnergyGainMult: 0.65,      // 低精力时正面收益系数
      tiredEventWeightBonus: 14,    // 低精力时疲劳类事件额外权重
      sponsorFansGate: 800,         // 品牌赞助解锁粉丝门槛
      mcnFansGate: 1800,            // MCN 主动邀约的粉丝门槛
      mcnSponsorBonus: 1.3,         // 签约后赞助/直播收益系数
      mcnEnergyExtra: 5,            // 签约后行动额外精力消耗
      phaseRestEnergy: 16,          // 阶段之间时间跳跃恢复的精力
      phaseHeatDecay: 4             // 阶段之间热度自然衰减
    }
  };
});
