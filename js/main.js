/* 主控：启动游戏、串联 行动→事件→阶段→结局 的界面流程。 */
(function (root) {
  'use strict';
  const { Engine, UI, Storage, Card, C } = root.NW;
  const $ = id => document.getElementById(id);

  let state = null;
  let busy = false;
  let endingInfo = null;

  /* ---------------- 开局 ---------------- */
  function startGame() {
    state = Engine.createState();
    endingInfo = null;
    busy = false;
    UI.setLastScene('neutral');
    UI.showScreen('screen-game');
    UI.setScene('neutral', state.attrs.energy < C.tuning.lowEnergyLine ? 'tired' : '');
    UI.renderHUD(state);
    UI.renderActions(state, handleAction);
    UI.showResult('<b>第 1–3 天 · 出道起步</b><br>' + C.phases[0].intro);
  }

  /* ---------------- 行动流程 ---------------- */
  async function handleAction(actionId) {
    if (busy || !state || state.finished || state.pending) return;
    busy = true;
    UI.renderActions(state, handleAction);

    const rec = Engine.performAction(state, actionId);
    if (rec.error) {
      UI.toast(rec.error);
      busy = false;
      UI.renderActions(state, handleAction);
      return;
    }

    // 场景与结果
    UI.setLastScene(rec.scene);
    UI.renderHUD(state);
    UI.floatDeltas(rec);
    UI.pulseScene(moodFor(rec, state), state.attrs.energy);
    UI.showResult(rec.resultText);
    await UI.sleep(650);

    // 事件
    if (rec.event) {
      const ev = rec.event;
      if (ev.requireChoice) {
        const idx = await UI.modalEvent(ev);
        const chosen = Engine.chooseOption(state, idx);
        if (!chosen.error) {
          UI.renderHUD(state);
          UI.floatDeltas({ deltas: chosen.deltas, fansDelta: chosen.fansDelta, cashDelta: chosen.cashDelta });
          UI.showResult('📌 ' + chosen.resultText);
          await UI.modalEventResult(ev.title, ev.icon, ev.catName, chosen.resultText);
        }
        await handleAfter(chosen.after);
      } else {
        await UI.modalEvent(ev);
        UI.showResult('📣 <span class="hl">' + ev.title + '</span><br>' + ev.desc);
        await handleAfter(rec.after);
      }
    } else {
      await handleAfter(rec.after);
    }

    busy = false;
    UI.renderHUD(state);
    UI.renderActions(state, handleAction);
  }

  function moodFor(rec, st) {
    if (rec.event && (rec.event.id === 'hate_raid' || rec.event.id === 'misunderstood'
      || rec.event.id === 'ad_backfire')) return 'shock';
    if (st.attrs.energy < C.tuning.lowEnergyLine) return 'tired';
    if (rec.bucket === 'good' || rec.fansDelta >= 500) return 'happy';
    return '';
  }

  /* ---------------- 回合 / 阶段 / 结局 ---------------- */
  async function handleAfter(after) {
    if (!after) {
      if (state.actionsLeft === 0) {
        // 普通回合结束（同阶段内）
        UI.toast('第 ' + state.day + ' 天 · 新的回合开始了', 1400);
      }
      return;
    }

    if (after.phaseAdvance) {
      await UI.modalPhase(after.phaseAdvance);
    }
    if (after.mcnOffer) {
      const opts = Engine.mcnOptions(state);
      const key = await UI.modalMCN(opts);
      const r = Engine.resolveMcn(state, key);
      if (!r.error) {
        UI.renderHUD(state);
        UI.floatDeltas({ deltas: r.deltas, cashDelta: r.cashDelta, fansDelta: r.fansDelta });
        await UI.modalEventResult('MCN 抉择结果', '📣', C.eventCatNames.decision, r.resultText);
      }
    }
    if (after.turnDone) {
      UI.toast('第 ' + state.day + ' 天 · 新的回合开始了', 1400);
    }
    if (after.finished) {
      await UI.sleep(500);
      finishGame();
    }
  }

  function finishGame() {
    endingInfo = Engine.evaluate(state);
    const res = Storage.unlock(endingInfo.id, { fans: endingInfo.fans, cash: endingInfo.cash });
    UI.updateGalleryCount();
    UI.showEnding(endingInfo);
    if (res === 'failed') UI.toast('图鉴保存失败：当前环境不支持本地存储', 3200);
  }

  /* ---------------- 图鉴与分享 ---------------- */
  function openGallery() {
    UI.renderGallery();
    $('overlay-gallery').hidden = false;
  }
  function closeGallery() { $('overlay-gallery').hidden = true; }

  async function shareEnding() {
    if (!endingInfo) return;
    UI.toast('正在生成结局卡……', 1500);
    const r = await Card.share(endingInfo);
    if (r === 'downloaded') UI.toast('结局卡已保存到下载，截图发给朋友吧！');
    else if (r === 'shared') UI.toast('分享成功！');
    else if (r === 'cancelled') {/* 用户取消 */}
    else UI.toast('分享失败，可以直接截图保存哦');
  }

  /* ---------------- 绑定 ---------------- */
  function init() {
    $('btn-start').onclick = startGame;
    $('btn-replay').onclick = startGame;
    $('btn-gallery-home').onclick = openGallery;
    $('btn-gallery-ending').onclick = openGallery;
    $('btn-gallery-close').onclick = closeGallery;
    $('btn-gallery-start').onclick = () => { closeGallery(); startGame(); };
    $('btn-share').onclick = shareEnding;

    if (Storage.available) {
      $('storage-note').hidden = true;
    } else {
      $('storage-note').hidden = false;
      $('storage-note').textContent = '⚠️ 当前浏览器环境不支持本地存储，图鉴进度将无法保存。';
    }
    UI.updateGalleryCount();
  }

  // 只读调试钩子（不参与游戏逻辑）
  root.__naiwa = { get state() { return state; }, get ending() { return endingInfo; }, start: startGame };

  document.addEventListener('DOMContentLoaded', init);
})(window);
