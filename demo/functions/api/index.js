import { loadData, json, err, meta, corsPreflight } from './_lib.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  let D;
  try {
    D = await loadData(env, new URL(request.url).origin);
  } catch (e) {
    return err(500, 'failed to load site data: ' + e.message);
  }
  return json({
    meta: meta(D),
    endpoints: [
      { path: '/api/stats', desc: '全站覆盖统计（公司/市场/板块/事件数量）' },
      { path: '/api/markets', desc: '国家/地区 → 交易所 → 板块结构与计数' },
      { path: '/api/companies?market=CN&sector=半导体&q=腾讯&limit=50&offset=0', desc: '公司数据库列表' },
      { path: '/api/company?id=catl', desc: '单个公司详情（精编公司含估值/财务/股东/事件）' },
      { path: '/api/events?company=catl&type=earnings&lv=high&limit=20', desc: '公司事件 Timeline' }
    ],
    note: '全部为模拟数据，仅用于原型演示，不构成投资建议'
  });
}

export function onRequestOptions() { return corsPreflight(); }
