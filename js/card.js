/* 结局卡：canvas 绘制 1080×1440 可分享图片；AI 图加载失败时用主题渐变兜底。 */
(function (root) {
  'use strict';

  const THEME_COLORS = {
    'theme-burnout': ['#5b5470', '#2f2a3d'],
    'theme-scandal': ['#7a2e2e', '#c94a3d'],
    'theme-memegod': ['#3b2a6b', '#b98fe8'],
    'theme-hermit': ['#a8d98f', '#5fa05a'],
    'theme-top': ['#ffd23e', '#ff8a3d'],
    'theme-business': ['#d9a012', '#8a6d1f'],
    'theme-loyal': ['#ffadd0', '#ef5d96'],
    'theme-viral': ['#ff7a59', '#ffb347'],
    'theme-steady': ['#a8d8c6', '#6fa8c9'],
    'theme-forgotten': ['#b8b4a8', '#7d7a70']
  };
  const ENDING_EMOJI = {
    burnout: '😵', scandal: '🌊', memegod: '👁️', hermit: '🌾',
    top: '🏆', business: '💰', loyal: '💛', viral: '🚀',
    steady: '☕', forgotten: '🌫️'
  };

  function loadImage(url) {
    return new Promise(resolve => {
      let done = false;
      const finish = v => { if (!done) { done = true; resolve(v); } };
      const timer = setTimeout(() => finish(null), 6000);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => { clearTimeout(timer); finish(img); };
      img.onerror = () => { clearTimeout(timer); finish(null); };
      img.src = url;
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function wrapText(ctx, text, maxWidth) {
    const lines = [];
    let line = '';
    for (const ch of text) {
      if (ch === '\n') { lines.push(line); line = ''; continue; }
      if (ctx.measureText(line + ch).width > maxWidth && line) {
        lines.push(line);
        line = ch;
      } else line += ch;
    }
    if (line) lines.push(line);
    return lines;
  }

  async function draw(info) {
    const W = 1080, H = 1440;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    // 背景
    ctx.fillStyle = '#fffdf5';
    ctx.fillRect(0, 0, W, H);

    // 顶部图区
    const imgH = 620;
    const img = await loadImage(info.image);
    if (img) {
      const scale = Math.max(W / img.width, imgH / img.height);
      const dw = img.width * scale, dh = img.height * scale;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, W, imgH);
      ctx.clip();
      ctx.drawImage(img, (W - dw) / 2, (imgH - dh) / 2, dw, dh);
      ctx.restore();
    } else {
      const c = THEME_COLORS[info.theme] || ['#e0c070', '#b8902f'];
      const g = ctx.createLinearGradient(0, 0, W, imgH);
      g.addColorStop(0, c[0]); g.addColorStop(1, c[1]);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, imgH);
      ctx.font = '240px serif';
      ctx.textAlign = 'center';
      ctx.fillText(ENDING_EMOJI[info.id] || '🐸', W / 2, imgH / 2 + 90);
    }
    // 图下沿过渡
    ctx.fillStyle = 'rgba(0,0,0,.28)';
    ctx.fillRect(0, imgH - 90, W, 90);
    ctx.fillStyle = '#ffe9a8';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'left';
    roundRect(ctx, 40, 40, 300, 56, 28);
    ctx.fill();
    ctx.fillStyle = '#5b4513';
    ctx.fillText(info.route, 70, 79);

    // 名称与口号
    ctx.fillStyle = '#c98a12';
    ctx.font = 'bold 76px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText(info.name, 54, imgH + 110);
    ctx.fillStyle = '#e06a20';
    ctx.font = 'bold 34px "PingFang SC","Microsoft YaHei",sans-serif';
    wrapText(ctx, info.tagline, W - 108).forEach((l, i) => ctx.fillText(l, 54, imgH + 172 + i * 46));

    // 总结
    ctx.fillStyle = '#4a3c1e';
    ctx.font = '30px "PingFang SC","Microsoft YaHei",sans-serif';
    const lines = wrapText(ctx, info.summary, W - 108).slice(0, 7);
    let y = imgH + 268;
    lines.forEach(l => { ctx.fillText(l, 54, y); y += 44; });

    // 关键数据
    const cellW = (W - 108 - 32) / 3;
    info.stats.forEach((st, i) => {
      const x = 54 + i * (cellW + 16);
      ctx.fillStyle = '#fff4d2';
      roundRect(ctx, x, 1150, cellW, 130, 18);
      ctx.fill();
      ctx.fillStyle = '#d97a12';
      ctx.font = 'bold 40px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(st.value), x + cellW / 2, 1205);
      ctx.fillStyle = '#8a7648';
      ctx.font = '24px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.fillText(st.label, x + cellW / 2, 1250);
      ctx.textAlign = 'left';
    });

    // 品牌与邀请
    ctx.fillStyle = '#8a7648';
    ctx.font = 'bold 30px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('《奶蛙出道计划》', W / 2, 1345);
    ctx.font = '24px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('来玩一把，看看你能带出什么结局 →', W / 2, 1390);

    return canvas;
  }

  function toBlob(canvas) {
    return new Promise(resolve => canvas.toBlob(b => resolve(b), 'image/jpeg', 0.92));
  }

  async function share(info) {
    const canvas = await draw(info);
    let blob = null;
    try { blob = await toBlob(canvas); } catch (e) { blob = null; }
    if (!blob) return 'failed';

    // 系统分享（移动端体验最好）；9 秒未完成则自动降级，绝不卡在分享弹窗
    if (navigator.canShare) {
      const file = new File([blob], 'naiwa-ending.jpg', { type: 'image/jpeg' });
      const shareData = {
        title: '《奶蛙出道计划》· ' + info.name,
        text: '我的奶蛙结局是「' + info.name + '」——' + info.tagline,
        files: [file]
      };
      if (navigator.canShare(shareData)) {
        try {
          await Promise.race([
            navigator.share(shareData),
            new Promise((_, rej) => setTimeout(() => rej(new Error('share-timeout')), 9000))
          ]);
          return 'shared';
        } catch (e) {
          if (e && e.name === 'AbortError') return 'cancelled';
          // 超时或其它失败：继续走下载降级
        }
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '奶蛙结局-' + info.name + '.jpg';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return 'downloaded';
  }

  root.NW = root.NW || {};
  root.NW.Card = { draw, share, toBlob };
})(typeof self !== 'undefined' ? self : this);
