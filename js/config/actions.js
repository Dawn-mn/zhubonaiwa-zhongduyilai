/* 六大运营动作配置。
   数值写法：{ base, rand } => 实际变化 = base + rand * random()（rand 可为负）。
   gain：粉丝/现金类派生收益，公式集中在 engine.js 的 GAINS 表中。
   所有动作均复用同一角色形象，仅切换场景与文案。 */
(function (root, factory) {
  const data = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  else { root.NW = root.NW || {}; root.NW.C = root.NW.C || {}; Object.assign(root.NW.C, data); }
})(typeof self !== 'undefined' ? self : this, function () {
  return {
    actions: [
      {
        id: 'video', name: '短视频', icon: '🎬', scene: 'video',
        hint: '热度·粉丝',
        desc: '拍一条整活短视频。质量越高、热度越高，涨粉越快。',
        energy: -10,
        effects: { heat: { base: 6, rand: 6 }, content: { base: 2, rand: 1 } },
        gain: 'videoFans',
        texts: {
          good: [
            '奶蛙对着镜头狂笑十五秒，剪辑师都绷不住了，播放量一路狂飙！',
            '这条视频卡在了奇怪的爽点上，弹幕全是「齁齁齁」！',
            '奶蛙自创的抽象舞步被网友逐帧模仿，账号涨粉涨到手软。'
          ],
          normal: [
            '视频按时发了，数据不温不火，至少混了个脸熟。',
            '奶蛙努力憋笑拍完一条，评论区态度：还行，再观望观望。'
          ],
          bad: [
            '梗没玩明白，视频扑得毫无声响，奶蛙对着数据发呆。',
            '拍到一半奶蛙笑到脱力，成片只能草草收尾。'
          ]
        }
      },
      {
        id: 'live', name: '开直播', icon: '🎙️', scene: 'live',
        hint: '现金·忠诚度',
        desc: '开播和粉丝互动。粉丝越多、热度越高，礼物越多；状态差容易冷场。',
        energy: -14,
        effects: { loyalty: { base: 5, rand: 2 } },
        gain: 'liveCash',
        texts: {
          good: [
            '直播间人气爆棚，礼物刷得像下雨，奶蛙笑到根本停不下来！',
            '连麦效果拉满，粉丝集体刷「保护我方奶蛙」，下播还在涨粉。'
          ],
          normal: [
            '播了两个小时，老粉陪聊，新人三三两两，收入够买几杯奶茶。',
            '奶蛙使出浑身解数，直播间不冷不热，主打一个陪伴。'
          ],
          bad: [
            '全程尬聊，弹幕比蛙还安静，奶蛙提前下播装网卡。',
            '状态太差频频冷场，进来三个人，走了四个。'
          ]
        }
      },
      {
        id: 'train', name: '才艺训练', icon: '🏋️', scene: 'train',
        hint: '内容能力↑',
        desc: '练舞、练表情、学剪辑。短期没流量，长期内容更能打。',
        energy: -7,
        effects: { content: { base: 8, rand: 5 }, heat: { base: -2, rand: 0 } },
        texts: {
          good: [
            '魔鬼训练一天，奶蛙的抽象技艺又精进了，连脚趾头都是戏。',
            '奶蛙对着镜子苦练狂笑一百遍，据说现在笑声有八个音阶。'
          ],
          normal: [
            '上了一天表演课，奶蛙表示脑子会了，身体再说吧。',
            '训练按部就班，虽然没发内容，但功力在悄悄变厚。'
          ],
          bad: [
            '训练强度一般，奶蛙练着练着刷起了别人的视频。',
            '今天状态不在线，才艺没涨多少，瓜倒是吃了不少。'
          ]
        }
      },
      {
        id: 'sponsor', name: '品牌赞助', icon: '💼', scene: 'sponsor',
        hint: '现金·商业',
        desc: '接一条品牌合作。来钱快，但过度恰饭会掉路人缘和粉丝信任。',
        gate: { fans: 800 },
        energy: -8,
        effects: {
          commercial: { base: 7, rand: 3 },
          favor: { base: -4, rand: -3 },
          loyalty: { base: -2, rand: -3 }
        },
        gain: 'sponsorCash',
        texts: {
          good: [
            '品牌爸爸很满意，尾款到账的提示音比奶蛙的笑声还动听。',
            '广告被粉丝评价「竟该死的甜美」，钱和口碑居然都保住了。'
          ],
          normal: [
            '合作顺利完成，钱到手了，评论区有人小声嘀咕。',
            '广告准时上线，数据还行，就是有点伤号。'
          ],
          bad: [
            '广告硬得像块板砖，粉丝直呼「你变了」，掉了一波好感。',
            '品牌方要求太多，奶蛙拍到怀疑蛙生，钱赚得并不轻松。'
          ]
        }
      },
      {
        id: 'rest', name: '躺平休息', icon: '🛏️', scene: 'rest',
        hint: '精力↑ 热度↓',
        desc: '让奶蛙睡个好觉。热度会回落，但不会累垮。',
        energy: 0,
        effects: { energy: { base: 24, rand: 8 }, heat: { base: -3, rand: -2 } },
        texts: {
          good: [
            '奶蛙睡了十二个小时，醒来感觉能再笑一百年。',
            '充电完成！奶蛙满血复活，肚皮都显得更圆润了。'
          ],
          normal: [
            '休息了一天，奶蛙窝在被窝里刷手机，回血效果尚可。',
            '奶蛙给自己放了个小假，互联网暂时没那么需要它。'
          ],
          bad: [
            '说是休息，其实熬夜刷了一宿梗，越歇越累。',
            '躺平一天，奶蛙还是觉得有点虚。'
          ]
        }
      },
      {
        id: 'meme', name: '全网玩梗', icon: '🌀', scene: 'meme',
        hint: '高风险高回报',
        desc: '追热点、发癫、缝合离谱内容。可能一夜爆红，也可能玩火烧身。',
        energy: -9,
        effects: { heat: { base: -4, rand: 29 }, favor: { base: 0, rand: -4 } },
        gain: 'memeFans',
        texts: {
          good: [
            '奶蛙抱着手机随手一发，离谱程度击穿全网笑点，转发爆了！',
            '这个梗被奶蛙玩出了新高度，网友高呼「互联网需要你」！',
            '一条癫作横空出世，奶蛙的笑声成了全网的共同语言。'
          ],
          normal: [
            '热梗蹭了个寂寞，评论区有人笑有人懵，数据平平。',
            '玩梗操作中规中矩，奶蛙决定下次再癫一点。'
          ],
          bad: [
            '梗没玩好还翻了车，评论区开始科普什么叫「尴尬」。',
            '玩梗用力过猛，路人满头问号，热度没涨反掉。'
          ]
        }
      }
    ]
  };
});
