/* 收盘快照：批量抓取全站可映射公司的腾讯行情，写入 D1
   触发方式：GitHub Actions 定时（工作日收盘后）或手动 GET/POST /api/snapshot
   防护：可选 SNAPSHOT_TOKEN 环境变量 + 最小间隔 10 分钟 */

import { json, err, corsPreflight } from './_lib.js';
import * as DATA from '../../js/mailuo-v2.data.js';
import { toTxCode, fetchTxQuotes } from './_tx.js';

const MIN_INTERVAL_MS = 10 * 60 * 1000;

async function ensureSchema(DB) {
  await DB.prepare('CREATE TABLE IF NOT EXISTS quotes (' +
    'code TEXT PRIMARY KEY, market TEXT, payload TEXT, updated_at TEXT)').run();
  await DB.prepare('CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT)').run();
}

async function handle(context) {
  const { request, env } = context;
  if (!env.DB) return err(500, 'D1 binding DB 未配置');

  // 可选令牌保护：Pages 环境变量 SNAPSHOT_TOKEN 设置后需 ?token= 匹配
  const url = new URL(request.url);
  if (env.SNAPSHOT_TOKEN && url.searchParams.get('token') !== env.SNAPSHOT_TOKEN) {
    return err(401, 'invalid token');
  }

  await ensureSchema(env.DB);

  // 防频繁触发（幂等，豁免令牌检查外的滥用）
  const last = await env.DB.prepare("SELECT v FROM meta WHERE k = 'last_run'").first();
  const now = Date.now();
  if (last && now - Date.parse(last.v) < MIN_INTERVAL_MS) {
    return json({ ok: false, skipped: true, reason: '距上次快照不足 10 分钟', lastRun: last.v });
  }

  // 全站可映射代码（韩股无免费源，跳过）
  const marketByTx = {};
  const txCodes = [];
  DATA.DIRECTORY.forEach(function (d) {
    const tx = toTxCode(d);
    if (tx && !marketByTx[tx]) {
      marketByTx[tx] = d.market;
      txCodes.push(tx);
    }
  });

  let quotes;
  try {
    quotes = await fetchTxQuotes(txCodes);
  } catch (e) {
    return err(502, 'upstream quote fetch failed: ' + e.message);
  }

  const ts = new Date().toISOString();
  const stmts = Object.keys(quotes).map(function (tx) {
    return env.DB.prepare(
      'INSERT INTO quotes (code, market, payload, updated_at) VALUES (?, ?, ?, ?) ' +
      'ON CONFLICT(code) DO UPDATE SET market = excluded.market, payload = excluded.payload, updated_at = excluded.updated_at'
    ).bind(tx, marketByTx[tx] || null, JSON.stringify(quotes[tx]), ts);
  });
  for (let i = 0; i < stmts.length; i += 100) {
    await env.DB.batch(stmts.slice(i, i + 100));
  }
  await env.DB.prepare(
    "INSERT INTO meta (k, v) VALUES ('last_run', ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v"
  ).bind(ts).run();

  return json({ ok: true, requested: txCodes.length, updated: Object.keys(quotes).length, time: ts });
}

export async function onRequestGet(context) { return handle(context); }
export async function onRequestPost(context) { return handle(context); }
export function onRequestOptions() { return corsPreflight(); }
