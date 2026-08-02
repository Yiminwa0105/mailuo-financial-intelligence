import { loadData, json, err, meta, corsPreflight } from './_lib.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  let D;
  try {
    D = await loadData(env, new URL(request.url).origin);
  } catch (e) {
    return err(500, 'failed to load site data: ' + e.message);
  }
  const byMarket = {};
  Object.keys(D.COUNTRIES).forEach(function (m) {
    byMarket[m] = D.DIRECTORY.filter(function (d) { return d.market === m; }).length;
  });
  const evCount = Object.keys(D.EVENTS).reduce(function (n, k) { return n + D.EVENTS[k].length; }, 0);
  return json({
    meta: meta(D),
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

export function onRequestOptions() { return corsPreflight(); }
