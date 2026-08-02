/* ============================================================
   脉络 Financial Intelligence · 开放数据 API（Cloudflare Pages Functions）
   只读 JSON 接口，开放 CORS；数据来自站点模拟数据层 js/mailuo-v2.data.js
   路由：
     GET /api                      接口文档
     GET /api/stats                全站覆盖统计
     GET /api/markets              国家/交易所/板块结构与计数
     GET /api/companies            公司列表（market/ex/sector/q/limit/offset）
     GET /api/company/:id          公司详情（含精编档案与事件，如有）
     GET /api/events               事件 Timeline（company/type/lv/limit）
   ============================================================ */

let cache = null;

async function loadData(env, origin) {
  if (cache) return cache;
  const res = await env.ASSETS.fetch(new URL('/js/mailuo-v2.data.js', origin));
  if (!res.ok) throw new Error('data asset not found: ' + res.status);
  const src = await res.text();
  const factory = new Function(
    src +
    '\n;return { TYPE_META: TYPE_META, IMPACT_META: IMPACT_META, MARKETS: MARKETS,' +
    ' DATA_SOURCE: DATA_SOURCE, UPDATE_TIME: UPDATE_TIME, COMPANIES: COMPANIES,' +
    ' EVENTS: EVENTS, COUNTRIES: COUNTRIES, SECTORS: SECTORS, DIRECTORY: DIRECTORY };'
  );
  cache = factory();
  return cache;
}

function json(data, status) {
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

function err(status, message) {
  return json({ error: { status: status, message: message } }, status);
}

function slimCompany(d, D) {
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

function slimEvent(ev, D) {
  const tm = D.TYPE_META[ev.type] || {};
  return {
    id: ev.id, type: ev.type, typeLabel: tm.label || ev.type,
    importance: ev.lv, impact: ev.imp,
    time: ev.time, title: ev.title, brief: ev.brief, summary: ev.sum,
    source: { name: ev.src.n, type: ev.src.t, url: ev.src.u },
    tags: ev.tags
  };
}

function matchQ(c, q) {
  q = q.toLowerCase();
  if (c.code.toLowerCase().indexOf(q) >= 0) return true;
  if (c.name.toLowerCase().indexOf(q) >= 0) return true;
  if ((c.nameEn || '').toLowerCase().indexOf(q) >= 0) return true;
  return (c.aliases || []).some(function (a) { return a.toLowerCase().indexOf(q) >= 0; });
}

export async function onRequestGet(context) {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const segs = params.path || [];
  let D;
  try {
    D = await loadData(env, url.origin);
  } catch (e) {
    return err(500, 'failed to load site data: ' + e.message);
  }

  const meta = {
    product: '脉络 Financial Intelligence',
    site: 'https://vibe-coding-4vf.pages.dev',
    dataSource: D.DATA_SOURCE,
    updateTime: D.UPDATE_TIME
  };

  // GET /api —— 接口文档
  if (segs.length === 0) {
    return json({
      meta: meta,
      endpoints: [
        { path: '/api/stats', desc: '全站覆盖统计（公司/市场/板块/事件数量）' },
        { path: '/api/markets', desc: '国家/地区 → 交易所 → 板块结构与计数' },
        { path: '/api/companies?market=CN&sector=半导体&q=腾讯&limit=50&offset=0', desc: '公司数据库列表' },
        { path: '/api/company/catl', desc: '单个公司详情（精编公司含估值/财务/股东/事件）' },
        { path: '/api/events?company=catl&type=earnings&lv=high&limit=20', desc: '公司事件 Timeline' }
      ],
      note: '全部为模拟数据，仅用于原型演示，不构成投资建议'
    });
  }

  // GET /api/stats
  if (segs[0] === 'stats') {
    const byMarket = {};
    Object.keys(D.COUNTRIES).forEach(function (m) {
      byMarket[m] = D.DIRECTORY.filter(function (d) { return d.market === m; }).length;
    });
    const evCount = Object.keys(D.EVENTS).reduce(function (n, k) { return n + D.EVENTS[k].length; }, 0);
    return json({
      meta: meta,
      stats: {
        companies: D.DIRECTORY.length,
        companiesByMarket: byMarket,
        markets: Object.keys(D.COUNTRIES).length,
        exchanges: Object.keys(D.COUNTRIES).reduce(function (n, m) { return n + D.COUNTRIES[m].exchanges.length; }, 0),
        sectors: D.SECTORS.length,
        curatedProfiles: D.COMPANIES.length,
        curatedEvents: evCount
      }
    });
  }

  // GET /api/markets
  if (segs[0] === 'markets') {
    const markets = Object.keys(D.COUNTRIES).map(function (m) {
      const ct = D.COUNTRIES[m];
      return {
        market: m, name: ct.name, tags: ct.tags,
        companies: D.DIRECTORY.filter(function (d) { return d.market === m; }).length,
        exchanges: ct.exchanges.map(function (ex) {
          const list = D.DIRECTORY.filter(function (d) { return d.ex === ex.id; });
          const secs = {};
          list.forEach(function (d) { secs[d.sector] = (secs[d.sector] || 0) + 1; });
          return { id: ex.id, name: ex.name, companies: list.length, sectors: secs };
        })
      };
    });
    return json({ meta: meta, sectors: D.SECTORS, markets: markets });
  }

  // GET /api/companies
  if (segs[0] === 'companies') {
    const market = url.searchParams.get('market');
    const ex = url.searchParams.get('ex');
    const sector = url.searchParams.get('sector');
    const q = url.searchParams.get('q');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10) || 50, 200);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10) || 0;

    let list = D.DIRECTORY.slice();
    if (market) list = list.filter(function (d) { return d.market === market.toUpperCase(); });
    if (ex) list = list.filter(function (d) { return d.ex === ex.toUpperCase(); });
    if (sector) list = list.filter(function (d) { return d.sector === sector; });
    if (q) list = list.filter(function (d) { return matchQ(d, q); });

    const total = list.length;
    const items = list.slice(offset, offset + limit).map(function (d) { return slimCompany(d, D); });
    return json({
      meta: meta,
      query: { market: market, ex: ex, sector: sector, q: q, limit: limit, offset: offset },
      total: total, count: items.length, items: items
    });
  }

  // GET /api/company/:id
  if (segs[0] === 'company' && segs[1]) {
    const id = segs[1];
    const d = D.DIRECTORY.find(function (x) { return x.id === id; });
    if (!d) return err(404, 'company not found: ' + id);
    const profile = D.COMPANIES.find(function (c) { return c.id === id; }) || null;
    const events = (D.EVENTS[id] || []).map(function (ev) { return slimEvent(ev, D); });
    return json({
      meta: meta,
      company: slimCompany(d, D),
      profile: profile ? {
        valuation: profile.valuation,
        financials: profile.financials,
        history: profile.history,
        shareholders: profile.shareholders,
        institution: profile.inst,
        managementPct: profile.mgmtPct,
        lockup: profile.lockup,
        peers: profile.peers
      } : null,
      profileNote: profile ? null : '该公司为生成器补全档案（站点前端动态生成），此处仅提供列表级字段',
      events: events
    });
  }

  // GET /api/events
  if (segs[0] === 'events') {
    const company = url.searchParams.get('company') || 'catl';
    const type = url.searchParams.get('type');
    const lv = url.searchParams.get('lv');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10) || 20, 100);

    let list;
    if (company === 'all') {
      list = [];
      Object.keys(D.EVENTS).forEach(function (k) { list = list.concat(D.EVENTS[k]); });
    } else {
      if (!D.EVENTS[company]) return err(404, 'no curated events for company: ' + company + '（精编事件仅覆盖部分公司，可尝试 catl/moutai/tsla/tencent/samsung 或 company=all）');
      list = D.EVENTS[company].slice();
    }
    if (type) list = list.filter(function (ev) { return ev.type === type; });
    if (lv) list = list.filter(function (ev) { return ev.lv === lv; });
    list.sort(function (a, b) { return b.time < a.time ? -1 : 1; });

    const items = list.slice(0, limit).map(function (ev) { return slimEvent(ev, D); });
    return json({
      meta: meta,
      query: { company: company, type: type, lv: lv, limit: limit },
      total: list.length, count: items.length, items: items
    });
  }

  return err(404, 'unknown endpoint: /api/' + segs.join('/'));
}

export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, OPTIONS',
      'access-control-allow-headers': 'content-type'
    }
  });
}
