/* 脉络 · 用户行为上报接口（匿名 UUID 方案）
   POST /api/track
   请求体（JSON）：
     访问上报：{ "uuid": "...", "type": "visit",  "path": "...", "referrer": "..." }
     行为上报：{ "uuid": "...", "type": "event",  "action": "favorite", "targetType": "event", "targetId": "catl" }
   action 可选值：favorite / unfavorite / mark_important / unmark_important / view_company
   说明：uuid 由前端 localStorage 生成并持久化；users 表不存在时自动建档 */

const ALLOWED_ACTIONS = ['favorite', 'unfavorite', 'mark_important', 'unmark_important', 'view_company'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'POST, OPTIONS',
      'cache-control': 'no-store'
    }
  });
}

function err(status, message) {
  return json({ error: { status: status, message: message } }, status);
}

/* 按 uuid 找用户，不存在则建档；返回 user_id，并刷新 last_seen_at */
async function upsertUser(DB, uuid) {
  const row = await DB.prepare('SELECT id FROM users WHERE uuid = ?').bind(uuid).first();
  if (row) {
    await DB.prepare('UPDATE users SET last_seen_at = CURRENT_TIMESTAMP WHERE id = ?').bind(row.id).run();
    return row.id;
  }
  const r = await DB.prepare('INSERT INTO users (uuid) VALUES (?)').bind(uuid).run();
  return r.meta.last_row_id;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return err(400, 'invalid JSON body');
  }

  const uuid = String(body.uuid || '');
  if (!UUID_RE.test(uuid)) return err(400, 'invalid uuid');

  const userId = await upsertUser(env.DB, uuid);

  if (body.type === 'visit') {
    const path = String(body.path || '').slice(0, 500);
    const referrer = String(body.referrer || '').slice(0, 500);
    const ua = (request.headers.get('user-agent') || '').slice(0, 300);
    await env.DB.prepare(
      'INSERT INTO visits (user_id, path, referrer, user_agent) VALUES (?, ?, ?, ?)'
    ).bind(userId, path, referrer, ua).run();
    return json({ ok: true, userId: userId });
  }

  if (body.type === 'event') {
    const action = String(body.action || '');
    const targetType = body.targetType === 'company' ? 'company' : 'event';
    const targetId = String(body.targetId || '').slice(0, 100);
    if (ALLOWED_ACTIONS.indexOf(action) < 0) return err(400, 'invalid action');
    if (!targetId) return err(400, 'missing targetId');

    const stmts = [
      env.DB.prepare(
        'INSERT INTO events (user_id, action, target_type, target_id) VALUES (?, ?, ?, ?)'
      ).bind(userId, action, targetType, targetId)
    ];
    // 同步维护当前收藏状态表
    if (action === 'favorite') {
      stmts.push(env.DB.prepare(
        'INSERT OR IGNORE INTO favorites (user_id, target_type, target_id) VALUES (?, ?, ?)'
      ).bind(userId, targetType, targetId));
    } else if (action === 'unfavorite') {
      stmts.push(env.DB.prepare(
        'DELETE FROM favorites WHERE user_id = ? AND target_type = ? AND target_id = ?'
      ).bind(userId, targetType, targetId));
    }
    await env.DB.batch(stmts);
    return json({ ok: true, userId: userId });
  }

  return err(400, 'type must be "visit" or "event"');
}

export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type'
    }
  });
}
