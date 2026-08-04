/* 脉络开放数据 API · 实时行情代理
   GET /api/quote?codes=sh600519,sz300750,bj835185,hk00700,usTSLA
   服务端代理腾讯财经行情（qt.gtimg.cn），解决浏览器 CORS 限制；
   返回归一化 JSON，覆盖 A股（沪深北）/ 港股 / 美股。韩股无免费源，不支持。 */

import { err, corsPreflight } from './_lib.js';
import { fetchTxQuotes } from './_tx.js';

const MAX_CODES = 60;

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  // 注意：美股代码对大小写敏感（usTSLA / usBRK.B），不能统一转小写
  const raw = url.searchParams.get('codes') || '';
  const codes = raw.split(',')
    .map(function (c) { return c.trim(); })
    .filter(function (c) { return /^(sh|sz|bj|hk|us)[A-Za-z0-9.]{1,12}$/.test(c); })
    .slice(0, MAX_CODES);

  if (codes.length === 0) {
    return err(400, 'missing or invalid codes, e.g. /api/quote?codes=sh600519,hk00700,usTSLA');
  }

  let quotes;
  try {
    quotes = await fetchTxQuotes(codes);
  } catch (e) {
    return err(502, 'upstream quote fetch failed: ' + e.message);
  }

  return new Response(JSON.stringify({
    meta: {
      product: '脉络 Financial Intelligence',
      dataSource: '腾讯财经行情（qt.gtimg.cn）· 真实数据，非模拟',
      updateTime: new Date().toISOString(),
      count: Object.keys(quotes).length
    },
    quotes: quotes
  }, null, 2), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, OPTIONS',
      'cache-control': 'public, max-age=10'
    }
  });
}

export function onRequestOptions() { return corsPreflight(); }
