import { loadData, json, err, meta, corsPreflight } from './_lib.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  let D;
  try {
    D = await loadData(env, new URL(request.url).origin);
  } catch (e) {
    return err(500, 'failed to load site data: ' + e.message);
  }
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
  return json({ meta: meta(D), sectors: D.SECTORS, markets: markets });
}

export function onRequestOptions() { return corsPreflight(); }
