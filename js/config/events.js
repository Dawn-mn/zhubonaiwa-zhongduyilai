/* 事件池配置。
   cond 条件 DSL（全部可选）：
     phases: 允许的阶段下标；afterAction: 仅当本动作刚执行；min/max: 属性条件；
     flags: 历史标记；counts: 动作次数下限；resMin/resMax: 粉丝/现金条件；mcn: 签约状态。
   once: 全局只触发一次；gap: 两次之间至少间隔的行动数。
   outcomes: 按顺序取第一个满足 cond 的分支；choice: 玩家选项（option.flagIf 可条件置标记）。 */
(function (root, factory) {
  const data = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  else { root.NW = root.NW || {}; root.NW.C = root.NW.C || {}; Object.assign(root.NW.C, data); }
})(typeof self !== 'undefined' ? self : this, function () {
  return {
    eventCatNames: {
      daily: '日常事件', traffic: '流量事件', business: '商务事件',
      opinion: '舆论事件', status: '状态事件', hidden: '隐藏事件', decision: '关键抉择'
    },
    events: [
      /* ---------------- 日常 ---------------- */
      {
        id: 'video_hit', cat: 'daily', title: '数据小爆', icon: '🎬',
        phases: [0, 1, 2], afterAction: 'video', min: { heat: 20 }, gap: 3, weight: 10,
        desc: '新视频发出两小时，转发量开始不对劲地往上窜，奶蛙紧张地抱住了手机。',
        gain: { fans: [120, 360] }, effects: { heat: 3 }
      },
      {
        id: 'cold_live', cat: 'daily', title: '直播事故', icon: '🥶',
        phases: [0, 1, 2, 3], afterAction: 'live', max: { heat: 35 }, gap: 2, weight: 9,
        desc: '奶蛙讲了个自认为封神的段子，直播间陷入死一般的寂静，连机器人都走了。',
        effects: { energy: -5, heat: -3 }
      },
      {
        id: 'hot_live', cat: 'daily', title: '弹幕刷爆了', icon: '💬',
        phases: [1, 2, 3, 4], afterAction: 'live', min: { heat: 40 }, gap: 3, weight: 10,
        desc: '今晚的奶蛙状态封神，弹幕密到看不见脸，礼物特效卡了三次。',
        gain: { cash: [50, 160], fans: [60, 180] }, effects: { loyalty: 5 }
      },
      {
        id: 'fan_gift', cat: 'daily', title: '榜一的含金量', icon: '🎁',
        phases: [0, 1, 2, 3, 4], afterAction: 'live', gap: 2, weight: 8,
        desc: '一位不愿透露姓名的粉丝连刷十个大礼物，留言只有四个字：多笑点。',
        gain: { cash: [40, 140] }, effects: { loyalty: 2 }
      },
      {
        id: 'inspiration', cat: 'daily', title: '灵感乍现', icon: '💡',
        phases: [0, 1, 2, 3], min: { content: 10 }, gap: 4, weight: 8,
        desc: '奶蛙洗澡时突然想通了一个绝妙的梗，围着浴巾冲出来记在小本本上。',
        effects: { content: 5 }, setFlags: { inspired: true }
      },
      {
        id: 'flat_day', cat: 'daily', title: '互联网今天休息', icon: '🍃',
        phases: [0, 1, 2, 3], gap: 3, weight: 6,
        desc: '今天全网都很安静，奶蛙发的内容只有三个赞，其中一个是它自己点的。',
        effects: { favor: 1 }
      },

      /* ---------------- 流量 ---------------- */
      {
        id: 'major_viral', cat: 'traffic', title: '泼天的流量！', icon: '🚀',
        phases: [1, 2, 3, 4], min: { heat: 40 }, gap: 7, weight: 8,
        desc: '一条内容毫无预兆地炸了！转发、二创、表情包刷屏，#奶蛙# 被顶上热搜，泼天的富贵正中奶蛙脑门。',
        gain: { fans: [5000, 12000] }, effects: { heat: 15, commercial: 4 }, setFlags: { majorViral: true }
      },
      {
        id: 'big_repost', cat: 'traffic', title: '神秘大号转发', icon: '📣',
        phases: [1, 2, 3, 4], min: { heat: 25 }, gap: 5, weight: 9,
        desc: '一个头像是墨镜的百万大号转了奶蛙的视频，配文：「这蛙有点东西」。粉丝蜂拥而至。',
        gain: { fans: [800, 2000] }, effects: { heat: 6 }, setFlags: { reposted: true }
      },
      {
        id: 'heat_fade', cat: 'traffic', title: '热度退潮', icon: '📉',
        phases: [2, 3, 4], min: { heat: 55 }, gap: 4, weight: 8,
        desc: '热搜更新了，奶蛙的名字被新的瓜挤了下去。互联网的爱，来得快去得也快。',
        effects: { heat: -10, favor: 1 }
      },
      {
        id: 'shadow_ban', cat: 'traffic', title: '疑似被限流', icon: '🚧',
        phases: [2, 3, 4], min: { heat: 60 }, gap: 5, weight: 7,
        desc: '新发的内容播放量诡异跳水，运营群里有人说「可能被限流了」，奶蛙听成了「限量」还高兴了一下。',
        effects: { heat: -12 }
      },
      {
        id: 'official_shout', cat: 'traffic', title: '官方号组团玩梗', icon: '🏛️',
        phases: [2, 3, 4], min: { heat: 60, favor: 50 }, once: true, weight: 6,
        desc: '几个蓝 V 官方号居然在评论区用奶蛙的梗互相接歌，网友：甲方比乙方还会玩。',
        gain: { fans: [1000, 2500] }, effects: { heat: 8, commercial: 5 }, setFlags: { officialShout: true }
      },

      /* ---------------- 商务 ---------------- */
      {
        id: 'brand_knock', cat: 'business', title: '品牌爸爸敲门', icon: '💼',
        phases: [1, 2, 3, 4], resMin: { fans: 1000 }, gap: 4, weight: 9,
        desc: '一个小家电品牌私信求合作，预算不高但态度极好，连改八版文案都没生气。',
        gain: { cash: [100, 300] }, effects: { commercial: 4 }
      },
      {
        id: 'risky_pitch', cat: 'business', title: '离谱代言邀约', icon: '🦴',
        phases: [2, 3, 4], min: { commercial: 20 }, once: true, weight: 8,
        desc: '一个叫「猛蛙壮骨粉」的牌子开出天价代言费，但产品口碑在网上一片哀嚎。接，还是不接？',
        choice: {
          options: [
            {
              label: '有钱不赚？接了！',
              effects: { favor: -10, commercial: 6 }, gain: { cash: [600, 900] },
              flags: { riskyAd: true }, result: '尾款到账，奶蛙先笑为敬。评论区已经有人开始叹气了。'
            },
            {
              label: '婉拒，口碑要紧',
              effects: { favor: 6, loyalty: 3 },
              result: '奶蛙删掉了合作邮件。老粉闻讯表示：没白疼这只蛙。'
            }
          ]
        }
      },
      {
        id: 'ad_backfire', cat: 'business', title: '代言翻车了', icon: '💥',
        phases: [2, 3, 4], flags: { riskyAd: true }, once: true, weight: 20,
        desc: '猛蛙壮骨粉被曝质量问题，#奶蛙代言翻车# 冲上热搜，广告里奶蛙的狂笑现在看起来像在苦笑。',
        outcomes: [
          {
            cond: { max: { favor: 30 } },
            effects: { favor: -14, heat: 8, loyalty: -8 }, flags: { controversy: true },
            desc: '路人本来就缘薄，这下直接炸锅。群情激愤，奶蛙被架在火上烤。'
          },
          {
            effects: { favor: -12, heat: 5, loyalty: -4 }, flags: { adFail: true },
            desc: '好在平日里攒了些好感，骂声之外还有人帮着说话，但掉粉还是免不了。'
          }
        ]
      },
      {
        id: 'price_fight', cat: 'business', title: '报价扯皮', icon: '🧾',
        phases: [2, 3, 4], mcn: ['none', 'rejected'], once: true, weight: 7,
        desc: '品牌方压价压到地心，还要求「免费授权肖像一年」。奶蛙握紧了小拳头。',
        choice: {
          options: [
            { label: '硬刚：就这个价，爱签不签', effects: { commercial: 2, favor: -2 }, gain: { cash: [200, 300] }, result: '气势拉满！最后对方居然加价了，奶蛙笑得像个谈判专家。' },
            { label: '妥协：有总比没有强', effects: { energy: -6 }, gain: { cash: [80, 140] }, result: '单子拿下了，但奶蛙总觉得自己亏了，连笑声都便宜了几分。' }
          ]
        }
      },
      {
        id: 'fund_crisis', cat: 'business', title: '余额告急', icon: '💸',
        phases: [1, 2, 3], resMax: { cash: 30 }, once: true, weight: 14,
        desc: '设备、投流、奶茶钱……账户余额发出红色警告。奶蛙翻遍口袋，只翻出半块饼干。',
        choice: {
          options: [
            { label: '先借一笔周转', effects: { heat: -4 }, gain: { cash: [300, 300] }, flags: { loan: true }, result: '钱到账了，奶蛙在小本本上记下「要还的」，压力 +1。' },
            { label: '一分钱难不倒奶蛙', effects: { energy: -8 }, result: '奶蛙靠自来水和意志力又撑了几天，就是走路有点飘。' }
          ]
        }
      },
      {
        id: 'mcn_resources', cat: 'business', title: '公司的资源倾斜', icon: '🎯',
        phases: [2, 3, 4], mcn: ['signed', 'soft'], gap: 4, weight: 10,
        desc: 'MCN 的推荐位如约而至，奶蛙的内容被塞进了无数人的首页，数据团队笑得合不拢嘴。',
        gain: { fans: [500, 1200] }, effects: { commercial: 5 }
      },
      {
        id: 'mcn_pressure', cat: 'business', title: 'KPI 压顶', icon: '📋',
        phases: [3, 4], mcn: ['signed'], gap: 3, weight: 12,
        desc: '群里弹出十六条六十秒语音：本月GMV、日更KPI、三场直播……奶蛙的笑声里第一次带上了疲惫。',
        outcomes: [
          {
            cond: { max: { favor: 30 } },
            effects: { energy: -12, loyalty: -4, heat: 5 }, flags: { controversy: true },
            desc: '高压下接的烂活惹怒了路人，#放过奶蛙# 和 #奶蛙变了# 同时挂在热搜上。'
          },
          {
            effects: { energy: -12, loyalty: -3 },
            desc: '奶蛙咬着牙完成了指标，下播后瘫在椅子上，连笑都笑不出声。'
          }
        ]
      },

      /* ---------------- 舆论 ---------------- */
      {
        id: 'misunderstood', cat: 'opinion', title: '玩梗被误解', icon: '❓',
        phases: [1, 2, 3, 4], afterAction: 'meme', max: { favor: 55 }, gap: 3, weight: 10,
        desc: '本来是整活，却被断章取义截了图，评论区开始上价值：「这蛙什么态度？」',
        outcomes: [
          {
            cond: { max: { favor: 25 } },
            effects: { favor: -9, heat: 6 }, flags: { controversy: true },
            desc: '本来就路人缘稀薄，这下误会变成了声讨，舆论彻底失控。'
          },
          {
            effects: { favor: -8 },
            desc: '奶蛙连夜发了三条解释，看懂的人表示好笑，没看懂的人继续骂。'
          }
        ]
      },
      {
        id: 'pr_win', cat: 'opinion', title: '口碑反转', icon: '🌟',
        phases: [1, 2, 3, 4], min: { content: 35 }, gap: 4, weight: 8,
        desc: '一条认真做内容的视频被翻了出来，网友惊讶：「原来这只癫蛙居然真的有东西？」',
        gain: { fans: [200, 700] }, effects: { favor: 9 }
      },
      {
        id: 'hate_raid', cat: 'opinion', title: '黑评涌入', icon: '🌊',
        phases: [2, 3, 4], min: { heat: 50 }, max: { favor: 40 }, gap: 4, weight: 10,
        desc: '不知道踩了哪个雷点，成群的负面评论涌进评论区，刷屏速度比涨粉还快。',
        choice: {
          options: [
            {
              label: '正面刚，发视频对线',
              effects: { heat: 6, favor: -7, energy: -4 },
              flagIf: { flag: 'controversy', when: { max: { favor: 25 } } },
              result: '对线视频把战火越烧越旺，奶蛙喜提黑红体质——也可能只是黑。'
            },
            {
              label: '冷处理，等风头过去',
              effects: { energy: -6, loyalty: 4 },
              result: '奶蛙憋住没发声，老粉自发帮忙控评。风波慢慢散了，但真的很累。'
            }
          ]
        }
      },
      {
        id: 'meme_out', cat: 'opinion', title: '奶蛙出圈了', icon: '🌈',
        phases: [1, 2, 3, 4], afterAction: 'meme', min: { heat: 50, favor: 45 }, gap: 4, weight: 8,
        desc: '这次的梗破圈了！连不刷短视频的亲戚都在家族群里发奶蛙表情包，并配文「哈哈哈哈」。',
        gain: { fans: [600, 1800] }, effects: { favor: 8, heat: 5 }
      },
      {
        id: 'loyal_defense', cat: 'opinion', title: '粉丝护主', icon: '🛡️',
        phases: [2, 3, 4], flags: { adFail: true }, gap: 3, weight: 12,
        desc: '老粉们带着「奶蛙早期作品合集」冲上前线，逐条解释、反黑、安利，评论区居然稳住了。',
        effects: { loyalty: 8, favor: 3 }
      },

      /* ---------------- 状态 ---------------- */
      {
        id: 'burnout_warn', cat: 'status', title: '过劳预警', icon: '🩺',
        phases: [0, 1, 2, 3, 4], max: { energy: 28 }, gap: 3, weight: 12,
        desc: '奶蛙的眼圈比眼珠还黑，笑着笑着突然放空三秒。体检 App 弹出红字：您的蛙需要休息。',
        choice: {
          options: [
            { label: '听劝，马上休息', effects: { energy: 18, heat: -4 }, result: '奶蛙倒头睡了一整天，梦里没有KPI，只有蚊子。' },
            { label: '再撑一下，忙完这阵就……', effects: { energy: -8 }, flags: { overwork: true }, result: '奶蛙灌下半杯咖啡继续干。经纪人，这只蛙的电量条已经在报警了。' }
          ]
        }
      },
      {
        id: 'block', cat: 'status', title: '灵感枯竭', icon: '🧱',
        phases: [1, 2, 3, 4], afterAction: 'video', max: { energy: 45 }, gap: 4, weight: 9,
        desc: '奶蛙对着空白的剪辑界面坐了两个小时，最后只剪出了一条黑屏和一声叹息。',
        effects: { content: -4, energy: -4 }
      },
      {
        id: 'recharged', cat: 'status', title: '睡饱了就是不一样', icon: '🔋',
        phases: [0, 1, 2, 3, 4], afterAction: 'rest', min: { energy: 70 }, gap: 3, weight: 9,
        desc: '充足的睡眠让奶蛙灵感爆棚，躺平时想到的点子比上班三天还多。',
        effects: { content: 4, loyalty: 3 }
      },
      {
        id: 'fan_letter', cat: 'status', title: '老粉的长信', icon: '💌',
        phases: [2, 3, 4], min: { loyalty: 45 }, gap: 4, weight: 8,
        desc: '一位从第一天就关注的粉丝发来长私信：「看奶蛙笑，我熬过了最难的一周。」奶蛙看了三遍。',
        effects: { loyalty: 8, energy: 4 }
      },

      /* ---------------- 隐藏 ---------------- */
      {
        id: 'awakening', cat: 'hidden', title: '赛博诵经·觉醒', icon: '👁️',
        phases: [1, 2, 3, 4], counts: { meme: 3 }, once: true, weight: 10,
        desc: '在第九十九次玩梗的瞬间，奶蛙的笑声与某个古老的互联网频率共振了。弹幕突然齐齐刷出同一句话：齁——齁——齁——',
        effects: { content: 8, heat: 8, loyalty: 4 }, setFlags: { awakened: true }
      },
      {
        id: 'museum_invite', cat: 'hidden', title: '迷因博物馆的邀请', icon: '🏛️',
        phases: [2, 3, 4], min: { favor: 60, heat: 45 }, once: true, weight: 8,
        desc: '一座专门收藏网络迷因的虚拟博物馆发来联名邀请，想把奶蛙的笑声做成「当代抽象艺术馆藏」。',
        gain: { cash: [400, 900] }, effects: { loyalty: 6, commercial: 3 }, setFlags: { museumInvite: true }
      },
      {
        id: 'doppelganger', cat: 'hidden', title: '平行宇宙的撞脸', icon: '🥚',
        phases: [1, 2, 3], once: true, weight: 6,
        desc: '网上惊现一只和奶蛙九成相似的黄色生物，唯一的区别是它不笑。网友发起了「谁才是本体」投票。',
        gain: { fans: [100, 400] }, effects: { heat: 3 }
      }
    ]
  };
});
