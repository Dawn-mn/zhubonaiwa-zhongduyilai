/* 场景配置：动作/事件舞台的背景与道具组合（角色图统一复用，不重绘奶蛙）。
   同时承担 PRD 要求的素材来源与授权登记。 */
(function (root, factory) {
  const data = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  else { root.NW = root.NW || {}; root.NW.C = root.NW.C || {}; Object.assign(root.NW.C, data); }
})(typeof self !== 'undefined' ? self : this, function () {

  // —— 素材登记（来源、发布者、授权状态）。授权不明确的仅限原型验证，禁止商用 ——
  const ASSETS = {
    'frog-main': {
      file: 'assets/frog-main.jpg',
      sourceUrl: 'https://aka.doubaocdn.com/s/wK38Nv1doi',
      fromPage: 'https://milkyfrog.com/',
      publisher: '奶蛙 Milky Frog 官网（网友共创迷因收录站）',
      license: '网络迷因二创素材，无单一作者，授权状态：待确认',
      usage: '原型验证使用，未获商用授权；公开发布前需替换为明确授权素材',
      fetchedAt: '2026-10-09'
    },
    'frog-face': {
      file: 'assets/frog-face.png',
      sourceUrl: 'https://milkyfrog.com/assets/mf-logo-41a42318.png',
      fromPage: 'https://milkyfrog.com/',
      publisher: '奶蛙 Milky Frog 官网',
      license: '网络迷因二创素材，授权状态：待确认',
      usage: '原型验证使用，未获商用授权',
      fetchedAt: '2026-10-09'
    },
    'ending-ai': {
      source: 'Trae text_to_image 接口生成',
      license: 'AI 生成场景图，角色特征参照公开迷因形象；如商用需再次评估',
      note: '结局场景图，URL 直连，浏览器加载时由图像服务生成'
    }
  };

  // —— 运营动作舞台：背景主题 + CSS/SVG(emoji) 道具 ——
  const SCENES = {
    neutral: {
      bg: 'bg-neutral',
      props: [{ icon: '✨', x: 78, y: 16, s: 26 }, { icon: '🌟', x: 12, y: 24, s: 20 }]
    },
    video: {
      bg: 'bg-video',
      props: [
        { icon: '💡', x: 14, y: 10, s: 34 },
        { icon: '📱', x: 80, y: 52, s: 30 },
        { icon: '🎬', x: 10, y: 58, s: 28 }
      ]
    },
    live: {
      bg: 'bg-live',
      props: [
        { icon: '💖', x: 16, y: 16, s: 26 },
        { icon: '🎙️', x: 82, y: 14, s: 30 },
        { icon: '💬', x: 10, y: 52, s: 26 },
        { icon: '⭐', x: 86, y: 56, s: 24 }
      ]
    },
    train: {
      bg: 'bg-train',
      props: [
        { icon: '🏋️', x: 12, y: 18, s: 32 },
        { icon: '📚', x: 84, y: 56, s: 28 },
        { icon: '🎵', x: 80, y: 14, s: 22 }
      ]
    },
    sponsor: {
      bg: 'bg-sponsor',
      props: [
        { icon: '💼', x: 14, y: 22, s: 32 },
        { icon: '💰', x: 84, y: 18, s: 30 },
        { icon: '🤝', x: 82, y: 58, s: 26 }
      ]
    },
    rest: {
      bg: 'bg-rest',
      props: [
        { icon: '🛏️', x: 14, y: 56, s: 34 },
        { icon: '🌙', x: 82, y: 12, s: 28 },
        { icon: '💤', x: 70, y: 30, s: 24 }
      ]
    },
    meme: {
      bg: 'bg-meme',
      props: [
        { icon: '📱', x: 82, y: 52, s: 32 },
        { icon: '🤪', x: 12, y: 18, s: 28 },
        { icon: '⁉️', x: 80, y: 12, s: 24 },
        { icon: '🌀', x: 10, y: 54, s: 24 }
      ]
    }
  };

  // —— 事件图标（事件类 → 舞台 prop 图标在 events.js 内单独指定）——
  const EVENT_ICONS = {
    daily: '📅', traffic: '📈', business: '💼',
    opinion: '🗣️', status: '🩺', hidden: '👁️', decision: '📣'
  };

  return { ASSETS, SCENES, EVENT_ICONS };
});
