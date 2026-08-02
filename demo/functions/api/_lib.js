/* 脉络开放数据 API · 共享库（下划线开头，不注册为路由）
   直接以 ES Module 复用站点数据层（Workers 禁止 eval/new Function） */

import * as DATA from '../../js/mailuo-v2.data.js';

export async function loadData() {
  return DATA;
}

export function json(data, status) {
  return new Response(JSON.stringify(data, null, 2), {
    status: status || 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, OPTIONS',
      'cache-control': 'public, max-age=300'
    }
  });
}

export function err(status, message) {
  return json({ error: { status: status, message: message } }, status);
}

export function meta(D) {
  return {
    product: '脉络 Financial Intelligence',
    site: 'https://vibe-coding-4vf.pages.dev',
    dataSource: D.DATA_SOURCE,
    updateTime: D.UPDATE_TIME
  };
}

export function slimCompany(d, D) {
  const exName = (D.COUNTRIES[d.market].exchanges.find(function (e) { return e.id === d.ex; }) || {}).name || d.ex;
  return {
    id: d.id, name: d.name, nameEn: d.nameEn || null, code: d.code,
    market: d.market, marketLabel: D.MARKETS[d.market].label,
    exchange: exName, sector: d.sector,
    marketCap: d.cap, price: D.MARKETS[d.market].curSym + d.price,
    changePct: d.chg, direction: d.dir,
    institutionChange30d: d.inst, holderChange: d.holder,
    latestEvent: d.event, discloseDate: d.disc
  };
}

export function slimEvent(ev, D) {
  const tm = D.TYPE_META[ev.type] || {};
  return {
    id: ev.id, type: ev.type, typeLabel: tm.label || ev.type,
    importance: ev.lv, impact: ev.imp,
    time: ev.time, title: ev.title, brief: ev.brief, summary: ev.sum,
    source: { name: ev.src.n, type: ev.src.t, url: ev.src.u },
    tags: ev.tags
  };
}

export function matchQ(c, q) {
  q = q.toLowerCase();
  if (c.code.toLowerCase().indexOf(q) >= 0) return true;
  if (c.name.toLowerCase().indexOf(q) >= 0) return true;
  if ((c.nameEn || '').toLowerCase().indexOf(q) >= 0) return true;
  return (c.aliases || []).some(function (a) { return a.toLowerCase().indexOf(q) >= 0; });
}

export function corsPreflight() {
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, OPTIONS',
      'access-control-allow-headers': 'content-type'
    }
  });
}
