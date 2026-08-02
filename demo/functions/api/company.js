import { loadData, json, err, meta, slimCompany, slimEvent, corsPreflight } from './_lib.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  let D;
  try {
    D = await loadData(env, url.origin);
  } catch (e) {
    return err(500, 'failed to load site data: ' + e.message);
  }

  const id = url.searchParams.get('id');
  if (!id) return err(400, 'missing query param: id（示例 /api/company?id=catl）');

  const d = D.DIRECTORY.find(function (x) { return x.id === id; });
  if (!d) return err(404, 'company not found: ' + id);

  const profile = D.COMPANIES.find(function (c) { return c.id === id; }) || null;
  const events = (D.EVENTS[id] || []).map(function (ev) { return slimEvent(ev, D); });

  return json({
    meta: meta(D),
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

export function onRequestOptions() { return corsPreflight(); }
