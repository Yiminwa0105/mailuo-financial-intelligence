import { loadData, json, err, meta, slimEvent, corsPreflight } from './_lib.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  let D;
  try {
    D = await loadData(env, url.origin);
  } catch (e) {
    return err(500, 'failed to load site data: ' + e.message);
  }

  const company = url.searchParams.get('company') || 'catl';
  const type = url.searchParams.get('type');
  const lv = url.searchParams.get('lv');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10) || 20, 100);

  let list;
  if (company === 'all') {
    list = [];
    Object.keys(D.EVENTS).forEach(function (k) { list = list.concat(D.EVENTS[k]); });
  } else {
    if (!D.EVENTS[company]) {
      return err(404, 'no curated events for company: ' + company + '（精编事件覆盖 catl/moutai/tsla/tencent/samsung，或用 company=all）');
    }
    list = D.EVENTS[company].slice();
  }
  if (type) list = list.filter(function (ev) { return ev.type === type; });
  if (lv) list = list.filter(function (ev) { return ev.lv === lv; });
  list.sort(function (a, b) { return b.time < a.time ? -1 : 1; });

  const items = list.slice(0, limit).map(function (ev) { return slimEvent(ev, D); });
  return json({
    meta: meta(D),
    query: { company: company, type: type, lv: lv, limit: limit },
    total: list.length, count: items.length, items: items
  });
}

export function onRequestOptions() { return corsPreflight(); }
