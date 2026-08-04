/* ============================================================
   脉络 V2 · 行为上报层（匿名 UUID 方案）
   - 首次访问生成 UUID 存入 localStorage，作为匿名用户标识
   - 模块加载时自动上报一次 visit（页面访问）
   - 暴露全局 MailuoTrack.event()，供 app.js 在收藏/标重要时调用
   - 上报失败静默忽略，绝不影响页面功能
   ============================================================ */
(function () {
"use strict";

var UID_KEY = "mailuo_uid";
var ENDPOINT = "/api/track";

// 读取或生成匿名 UUID
function getUUID() {
  try {
    var id = localStorage.getItem(UID_KEY);
    if (id) return id;
    id = (crypto.randomUUID ? crypto.randomUUID() : fallbackUUID());
    localStorage.setItem(UID_KEY, id);
    return id;
  } catch (e) {
    return null; // localStorage 不可用（隐私模式等），放弃上报
  }
}

// crypto.randomUUID 不可用时的降级生成器
function fallbackUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function send(payload) {
  var uuid = getUUID();
  if (!uuid) return;
  payload.uuid = uuid;
  try {
    fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true // 页面跳转/关闭时仍尽量发出
    }).catch(function () { /* 静默失败 */ });
  } catch (e) { /* 静默失败 */ }
}

// 行为上报：action 见 functions/api/track.js 的 ALLOWED_ACTIONS
function trackEvent(action, targetType, targetId) {
  send({ type: "event", action: action, targetType: targetType, targetId: String(targetId) });
}

// 访问上报：模块加载即执行一次
function trackVisit() {
  send({
    type: "visit",
    path: location.pathname + location.search,
    referrer: document.referrer || ""
  });
}

globalThis.MailuoTrack = { event: trackEvent, visit: trackVisit };
trackVisit();
})();
