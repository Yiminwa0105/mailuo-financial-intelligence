/* 收盘快照读取：GET /api/quotes
   返回 D1 中全部公司的最新行情快照，供前端启动时一次性水合 */

import { err, corsPreflight } from './_lib.js';

export async function onRequestGet(context) {
  const { env } = context;
  if (!env.DB) return err(500, 'D1 binding DB 未配置');

  let rows;
  try {
    rows = await env.DB.prepare('SELECT code, market, payload, updated_at FROM quotes').all();
  } catch (e) {
    // 表不存在（尚未跑过快照）时返回空集，前端自动回退实时接口
    return new Response(JSON.stringify({
      meta: { dataSource: 'D1 收盘快照（空）', snapshotTime: null, count: 0 },
      quotes: {}
    }), {
      status: 200,
      headers: { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' }
    });
  }

  const quotes = {};
  let latest = null;
  (rows.results || []).forEach(function (r) {
    try {
      const q = JSON.parse(r.payload);
      q.snapshotAt = r.updated_at;
      quotes[r.code] = q;
      if (!latest || r.updated_at > latest) latest = r.updated_at;
    } catch (e) { /* 忽略坏行 */ }
  });

  return new Response(JSON.stringify({
    meta: {
      product: '脉络 Financial Intelligence',
      dataSource: '腾讯财经行情（D1 收盘快照）· 真实数据，非模拟',
      snapshotTime: latest,
      count: Object.keys(quotes).length
    },
    quotes: quotes
  }), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, OPTIONS',
      'cache-control': 'public, max-age=60'
    }
  });
}

export function onRequestOptions() { return corsPreflight(); }
