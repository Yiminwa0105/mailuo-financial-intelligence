/* 脉络开放数据 API · 实时行情代理
   GET /api/quote?codes=sh600519,sz300750,bj835185,hk00700,usTSLA
   服务端代理腾讯财经行情（qt.gtimg.cn），解决浏览器 CORS 限制；
   返回归一化 JSON，覆盖 A股（沪深北）/ 港股 / 美股。韩股无免费源，不支持。 */

import { err, corsPreflight } from './_lib.js';

const TX_URL = 'https://qt.gtimg.cn/q=';
const MAX_CODES = 60;

function num(s) {
  if (s === undefined || s === null || s === '') return null;
  var n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function fmtTimeA(t) {
  // A股时间格式 YYYYMMDDHHMMSS → YYYY-MM-DD HH:MM:SS
  if (!t || t.length < 14) return t || null;
  return t.slice(0, 4) + '-' + t.slice(4, 6) + '-' + t.slice(6, 8) + ' ' +
    t.slice(8, 10) + ':' + t.slice(10, 12) + ':' + t.slice(12, 14);
}

/* A股（sh / sz / bj，88 字段，字段位置实测校准） */
function parseA(p) {
  return {
    name: p[1] || null,
    price: num(p[3]),
    prevClose: num(p[4]),
    change: num(p[31]),
    changePct: num(p[32]),
    high: num(p[33]),
    low: num(p[34]),
    volumeShares: num(p[36]) !== null ? num(p[36]) * 100 : null,   // 手 → 股
    turnoverYuan: num(p[37]) !== null ? num(p[37]) * 1e4 : null,   // 万元 → 元
    peTtm: num(p[39]),
    pb: num(p[46]),
    totalCapYi: Math.max(num(p[44]) || 0, num(p[45]) || 0) || null, // 亿元
    high52: num(p[67]),
    low52: num(p[68]),
    currency: p[82] || 'CNY',
    time: fmtTimeA(p[30])
  };
}

/* 港股（hk，78 字段） */
function parseHK(p) {
  return {
    name: p[1] || null,
    price: num(p[3]),
    prevClose: num(p[4]),
    change: num(p[31]),
    changePct: num(p[32]),
    high: num(p[33]),
    low: num(p[34]),
    volumeShares: num(p[6]),        // 股
    turnoverYuan: num(p[37]),       // 元
    peTtm: num(p[39]),
    pb: num(p[58]),
    totalCapYi: Math.max(num(p[44]) || 0, num(p[45]) || 0) || null, // 亿港币
    high52: num(p[48]),
    low52: num(p[49]),
    currency: p[75] || 'HKD',
    time: p[30] ? p[30].replace(/\//g, '-') : null
  };
}

/* 美股（us，71 字段；PE/PB 字段不可靠，置空由前端回退） */
function parseUS(p) {
  return {
    name: p[1] || null,
    price: num(p[3]),
    prevClose: num(p[4]),
    change: num(p[31]),
    changePct: num(p[32]),
    high: num(p[33]),
    low: num(p[34]),
    volumeShares: num(p[6]),        // 股
    turnoverYuan: num(p[37]),       // 美元
    peTtm: null,
    pb: null,
    totalCapYi: Math.max(num(p[44]) || 0, num(p[45]) || 0) || null, // 亿美元
    high52: num(p[48]),
    low52: num(p[49]),
    currency: p[35] || 'USD',
    time: p[30] || null
  };
}

function parseLine(line) {
  // v_sh600519="1~贵州茅台~...";
  var m = line.match(/^v_([a-z]{2}[A-Za-z0-9.]+)="(.*)";?$/);
  if (!m || !m[2]) return null;
  var code = m[1];
  var p = m[2].split('~');
  if (p.length < 50 || !p[1]) return null;
  var prefix = code.slice(0, 2);
  var q = null;
  if (prefix === 'sh' || prefix === 'sz' || prefix === 'bj') q = parseA(p);
  else if (prefix === 'hk') q = parseHK(p);
  else if (prefix === 'us') q = parseUS(p);
  if (!q || q.price === null) return null;
  q.dir = (q.changePct || 0) >= 0 ? 'up' : 'down';
  return [code, q];
}

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

  let text;
  try {
    const resp = await fetch(TX_URL + codes.join(','), {
      headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://stockapp.finance.qq.com/' }
    });
    // 腾讯接口返回 GBK 编码
    text = new TextDecoder('gbk').decode(await resp.arrayBuffer());
  } catch (e) {
    return err(502, 'upstream quote fetch failed: ' + e.message);
  }

  const quotes = {};
  text.split(';').forEach(function (line) {
    const parsed = parseLine(line.trim());
    if (parsed) quotes[parsed[0]] = parsed[1];
  });

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
