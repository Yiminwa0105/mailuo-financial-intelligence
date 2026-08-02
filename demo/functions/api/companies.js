import { loadData, json, err, meta, slimCompany, matchQ, corsPreflight } from './_lib.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  let D;
  try {
    D = await loadData(env, url.origin);
  } catch (e) {
    return err(500, 'failed to load site data: ' + e.message);
  }

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
    meta: meta(D),
    query: { market: market, ex: ex, sector: sector, q: q, limit: limit, offset: offset },
    total: total, count: items.length, items: items
  });
}

export function onRequestOptions() { return corsPreflight(); }
