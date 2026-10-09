/* 阶段配置：5 阶段 × 2 回合 × 2 行动 = 20 次行动。
   dayMap：第 n 次行动对应的游戏内日期（只提供时间感，事件不与天数绑定）。 */
(function (root, factory) {
  const data = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  else { root.NW = root.NW || {}; root.NW.C = root.NW.C || {}; Object.assign(root.NW.C, data); }
})(typeof self !== 'undefined' ? self : this, function () {
  return {
    actionsPerTurn: 2,
    turnsPerPhase: 2,
    dayMap: [1, 2, 3, 3, 4, 5, 6, 7, 8, 10, 12, 14, 15, 17, 19, 21, 22, 24, 27, 30],
    phases: [
      {
        id: 'p1', name: '出道起步', range: '第 1–3 天',
        intro: '奶蛙刚刚注册账号，一切从零开始。先试试不同内容，找找感觉。',
        skip: '三天时间一晃而过……'
      },
      {
        id: 'p2', name: '流量爬升', range: '第 4–7 天',
        intro: '账号有了点动静。要趁热打铁冲流量，还是沉下心练内功？',
        skip: '又过了几天，奶蛙的名字开始被更多人刷到……'
      },
      {
        id: 'p3', name: '加速发展', range: '第 8–14 天',
        intro: '生意上门了。粉丝、商务、舆论一起来，资源得掂量着用。',
        skip: '一周时间飞速过去，奶蛙已经不是那只无人问津的蛙……'
      },
      {
        id: 'p4', name: '命运分岔', range: '第 15–21 天',
        intro: '红与黑只在一线之间。舆论、压力、状态危机，扛过去就是另一条路。',
        skip: '风浪里滚了一周，奶蛙站在了命运的十字路口……'
      },
      {
        id: 'p5', name: '最终冲刺', range: '第 22–30 天',
        intro: '最后九天！把所有筹码压上去，给这段旅程一个结局。',
        skip: ''
      }
    ],
    // 阶段总结文案，按阶段表现分档；{fans} 由界面填充
    phaseSummary: {
      good: [
        '这段时间奶蛙数据猛冲，粉丝涨了 {fans}，评论区全是「齁齁齁」。',
        '热度肉眼可见地往上走，连隔壁账号都来偷师。'
      ],
      normal: [
        '日子不紧不慢，粉丝涨了 {fans}，数据没什么大波澜。',
        '奶蛙还在找属于自己的那条路，经纪人在小本本上盘算下一步。'
      ],
      bad: [
        '这段时间有点低迷，粉丝只涨了 {fans}，奶蛙望着天花板沉思。',
        '热度上不去，要不换个思路？或者——先让蛙睡一觉。'
      ]
    },
    turnTip: {
      good: '本回合表现不错，继续保持！',
      normal: '中规中矩的一个回合。',
      bad: '这回合有点拉胯，调整一下策略？'
    }
  };
});
