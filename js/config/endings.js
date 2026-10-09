/* 十个结局配置：按数组顺序做优先级判定，第一个满足条件的胜出，最后一个为兜底。
   条件 DSL 同事件：min/max 属性、resMin/resMax 资源、flags 标记、counts 动作次数、
   mcn 签约状态；any 表示多个条件满足其一。 */
(function (root, factory) {
  const data = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  else { root.NW = root.NW || {}; root.NW.C = root.NW.C || {}; Object.assign(root.NW.C, data); }
})(typeof self !== 'undefined' ? self : this, function () {

  const CHAR = 'cute glossy 3D cartoon illustration, a chubby yellow pear-shaped frog mascot with bulging round eyes, pale green eye whites, tiny black dot pupils, big cream-white round belly, small dark olive arms and feet, wide open mouth laughing maniacally';
  const STYLE = 'soft cinematic lighting, vibrant saturated colors, playful internet meme aesthetic, highly detailed, no text, no watermark';
  function img(prompt) {
    return 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt='
      + encodeURIComponent(CHAR + ', ' + prompt + ', ' + STYLE)
      + '&image_size=landscape_16_9';
  }

  return {
    endings: [
      {
        id: 'burnout', route: '疲惫路线', theme: 'theme-burnout', hidden: false,
        name: '电量耗尽', tagline: '笑到最后，先没电的是自己。',
        highlight: { key: 'energy', label: '最终精力' },
        summary: '连续高强度的运营榨干了奶蛙的最后一格电。在一个再普通不过的凌晨，它对着还在直播的手机缓缓倒下，被经纪人强制送进了休养所。网上还在循环它的笑声，只是笑声的主人终于睡着了。休息，从来不是浪费时间。',
        cond: { any: [ { flags: { overwork: true }, max: { energy: 20 } }, { max: { energy: 5 } } ] },
        image: img('lying face down exhausted on a desk cluttered with a ring light microphone and phone late at night, dark messy room, dizzy spiral eyes, Zzz'),
        hint: '听说，它最近总是不肯睡觉。'
      },
      {
        id: 'scandal', route: '争议路线', theme: 'theme-scandal', hidden: false,
        name: '黑红也是红', tagline: '全网都在讨论它，只是没几句好话。',
        highlight: { key: 'heat', label: '最高热度' },
        summary: '争议像滚雪球一样失控，奶蛙的每一条动态都被拿着放大镜解读。热度是真的，谩骂也是真的。它站在流量的火海中央狂笑，没人分得清那是节目效果还是破防。黑红也是红——但火，是会烫蛙的。',
        cond: { flags: { controversy: true }, min: { heat: 55 }, max: { favor: 30 } },
        image: img('surrounded by floating angry red speech bubbles and dark storm clouds, shadows of pointing fingers, dramatic red lighting, nervous awkward laugh'),
        hint: '热搜上的事，谁说得准呢。'
      },
      {
        id: 'memegod', route: '隐藏 · 梗王路线', theme: 'theme-memegod', hidden: true,
        name: '永恒的齁齁齁', tagline: '它不再使用互联网，它就是互联网本身。',
        highlight: { key: 'loyalty', label: '信徒数量（忠诚度）' },
        summary: '当第一万条二创发出时，奶蛙的笑声穿透了屏幕的边界。人们不再讨论它是哪只蛙，只需要打出三个「齁」，彼此就能心领神会。它成了一个时代的抽象图腾——互联网会老，但大笑不会。',
        cond: { counts: { meme: 6 }, flags: { majorViral: true }, min: { loyalty: 35, heat: 50 } },
        image: img('floating meditating like a golden deity in cosmic cyberspace made of glowing chat bubbles, memes and stars, ethereal purple halo, worshipping tiny frog silhouettes below'),
        hint: '据说当玩梗到某种境界，笑声会与古老的频率共振……'
      },
      {
        id: 'hermit', route: '隐藏 · 归隐路线', theme: 'theme-hermit', hidden: true,
        name: '田园归隐蛙', tagline: '互联网很好，但田里的风更好。',
        highlight: { key: 'favor', label: '路人好感' },
        summary: '在触手可及的爆红面前，奶蛙选择了关机。它戴着草帽蹲在田埂上晒太阳，偶尔给邻居的小孩表演一个标准狂笑。没有数据，没有KPI，蚊子比黑粉多。路过的网友拍下它，配文：这是我见过最松弛的网红。',
        cond: { counts: { rest: 6 }, max: { heat: 35 }, min: { favor: 60 } },
        image: img('relaxing happily in a sunny green rice paddy field wearing a small straw hat, holding a cup of tea, butterflies, peaceful countryside, warm afternoon light'),
        hint: '也许它想要的，从来都不是红。'
      },
      {
        id: 'top', route: '顶流路线', theme: 'theme-top', hidden: false,
        name: '万蛙之上', tagline: '这个月的互联网，姓奶蛙。',
        highlight: { key: 'fans', label: '巅峰粉丝' },
        summary: '演唱会级别的舞台、亮瞎眼的奖杯、齐声高喊它名字的人海——奶蛙站在聚光灯的正中心，以一个标准的狂笑回应整个时代。从无人问津的黄色小怪，到全网瞩目的顶流，这三十天像一场荒诞又真实的梦。经纪人，我们做到了。',
        cond: { resMin: { fans: 12000 }, min: { heat: 70, content: 55, favor: 40 } },
        image: img('standing proudly on a giant concert stage under golden spotlight and falling confetti, huge crowd of adoring fan silhouettes, holding a golden trophy, fireworks'),
        hint: '站上最高点的蛙，会看见怎样的风景？'
      },
      {
        id: 'business', route: '商业路线', theme: 'theme-business', hidden: false,
        name: '蛙布斯榜', tagline: '它的笑声，现在按秒计费。',
        highlight: { key: 'cash', label: '账上现金' },
        summary: '代言、联名、直播带货……奶蛙的商业版图像滚雪球一样扩张。它戴着小墨镜坐在金币堆成的王座上，笑容依旧抽象，眼神却已经是甲方。《蛙布斯》杂志封面给它的标题是：一只能下金蛋的蛙。',
        cond: { resMin: { cash: 2400 }, min: { commercial: 55 }, counts: { sponsor: 2 } },
        image: img('wearing tiny gold sunglasses and a gold chain, sitting confidently on a throne made of gold coins, gift boxes and money bags, luxurious green and gold interior'),
        hint: '资本的味道，奶蛙好像很懂。'
      },
      {
        id: 'loyal', route: '忠粉路线', theme: 'theme-loyal', hidden: false,
        name: '自己人', tagline: '热度会退潮，但自己人永远在。',
        highlight: { key: 'loyalty', label: '粉丝忠诚度' },
        summary: '它没有成为全网的顶流，却拥有一群最铁的自己人。数据起伏时他们在，争议发生时他们也在，每条动态下面都有熟悉的 ID 准时报到。奶蛙对着镜头鞠了一躬：别人笑我太疯癫，我的粉丝陪我癫。',
        cond: { min: { loyalty: 60 }, resMin: { fans: 3000 } },
        image: img('hugging a small diverse group of cute smiling fan characters of different animals with floating hearts, warm cozy fan-meet room, banners and handmade gifts'),
        hint: '比起全世界，它更在意那一小群人。'
      },
      {
        id: 'viral', route: '意外爆红路线', theme: 'theme-viral', hidden: false,
        name: '泼天富贵', tagline: '一条视频，改写了一整只蛙的命运。',
        highlight: { key: 'heat', label: '爆红热度' },
        summary: '没有精心策划，没有资本助推，甚至没有一条完整的剧本——它就那么随手一发，然后世界炸了。泼天的流量正中脑门，奶蛙在人生巅峰上狂笑不止，经纪人激动得把计算器按出了火星子。',
        cond: { flags: { majorViral: true }, min: { heat: 55 }, resMin: { fans: 5000 } },
        image: img('riding an exploding red rocket through giant floating phone screens showing play buttons and trending arrows, dynamic motion, shocked and laughing expression'),
        hint: '一条视频，真的能改变命运吗？'
      },
      {
        id: 'steady', route: '平稳路线', theme: 'theme-steady', hidden: false,
        name: '小有所成', tagline: '没有大红大紫，但稳稳地站住了。',
        highlight: { key: 'content', label: '内容功力' },
        summary: '三十天过去，奶蛙没有一飞冲天，但它有了一批稳定的观众、一笔够用的积蓄，和一门越来越熟练的手艺。更新日有人催，直播间有人等，日子像早晨的咖啡一样冒着温乎的热气。小有所成，何尝不是一种大成？',
        cond: { any: [ { resMin: { fans: 2000 } }, { resMin: { cash: 600 } }, { min: { loyalty: 45 } } ] },
        image: img('sitting at a tidy small office desk with a laptop showing a frog channel page, a coffee cup and a healthy potted plant, calm warm morning sunlight, content smile'),
        hint: '不惊艳，但踏实。'
      },
      {
        id: 'forgotten', route: '普通结局', theme: 'theme-forgotten', hidden: false,
        name: '互联网没有记忆', tagline: '它来过，笑过，然后被划走了。',
        highlight: { key: 'fans', label: '最终粉丝' },
        summary: '奶蛙的出道之旅结束得悄无声息。最后一条视频停在那个普通的夜晚，评论区停在一个「哈哈」。新的热点每天都在诞生，黄色的影子很快被淹没在信息洪流里。互联网没有记忆——但至少，它曾经让一些人真心笑过。',
        cond: {},
        image: img('a small blurry lone frog figure walking away into foggy gray mist on an empty wet street, faint neon signs fading behind, melancholic but cute mood'),
        hint: '……你，还记得它吗？'
      }
    ]
  };
});
