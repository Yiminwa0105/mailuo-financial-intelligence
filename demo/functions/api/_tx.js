/* 腾讯行情接口共享库（下划线开头，不注册为路由）
   供 quote.js（实时代理）与 snapshot.js（定时快照）复用 */

const TX_URL = 'https://qt.gtimg.cn/q=';
const BATCH = 60;

export function num(s) {
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

/* 站点公司代码 → 腾讯代码（CN: 600519.SH→sh600519 / HK: 0700.HK→hk00700 / US: TSLA→usTSLA） */
export function toTxCode(d) {
  var m;
  if (d.market === 'CN') {
    m = d.code.match(/^(\d{6})\.(SH|SZ|BJ)$/);
    if (!m) return null;
    return (m[2] === 'SH' ? 'sh' : m[2] === 'SZ' ? 'sz' : 'bj') + m[1];
  }
  if (d.market === 'HK') {
    m = d.code.match(/^(\d{4,5})\.HK$/);
    return m ? 'hk' + ('0000' + m[1]).slice(-5) : null;
  }
  if (d.market === 'US') return 'us' + d.code;
  return null; // 韩股无免费源
}

/* 批量抓取腾讯行情，自动按 60 个/批分片，返回 { txCode: quote } */
export async function fetchTxQuotes(codes) {
  var quotes = {};
  for (var i = 0; i < codes.length; i += BATCH) {
    var batch = codes.slice(i, i + BATCH);
    var resp = await fetch(TX_URL + batch.join(','), {
      headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://stockapp.finance.qq.com/' }
    });
    // 腾讯接口返回 GBK 编码
    var text = new TextDecoder('gbk').decode(await resp.arrayBuffer());
    text.split(';').forEach(function (line) {
      var parsed = parseLine(line.trim());
      if (parsed) quotes[parsed[0]] = parsed[1];
    });
  }
  return quotes;
}
