-- 脉络 · 用户行为数据层（匿名 UUID 方案）
-- 执行：npx wrangler d1 execute mailuo-quotes --remote --file=./schema.sql

-- 用户表：现在存匿名访客，以后注册时回填 username/email，历史数据自动归属
CREATE TABLE IF NOT EXISTS users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid         TEXT UNIQUE NOT NULL,              -- 浏览器生成的匿名 UUID
  username     TEXT UNIQUE,                       -- 预留，注册时填
  email        TEXT UNIQUE,                       -- 预留，注册时填
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP, -- 首次访问
  last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP  -- 最近活跃
);

-- 访问记录：匿名方案下以"会话"代替"登录"，visited_at 即"几点来的"
CREATE TABLE IF NOT EXISTS visits (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  visited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  path       TEXT,        -- 访问页面，如 /mailuo-v2.html?company=catl
  referrer   TEXT,        -- 来源
  user_agent TEXT         -- 设备/浏览器
);

-- 行为流水：收藏/取消收藏/标重要/查看详情，每次行为留痕
CREATE TABLE IF NOT EXISTS events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id),
  action      TEXT NOT NULL,   -- 'favorite' / 'unfavorite' / 'mark_important' / 'unmark_important' / 'view_company'
  target_type TEXT NOT NULL,   -- 'event' / 'company'
  target_id   TEXT NOT NULL,   -- 事件 ID 或公司 ID，如 'catl'
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 当前收藏状态（冗余表，查询"现在收藏了什么"不用扫流水）
-- 收藏时写入，取消收藏时删除
CREATE TABLE IF NOT EXISTS favorites (
  user_id    INTEGER NOT NULL REFERENCES users(id),
  target_type TEXT NOT NULL DEFAULT 'event',
  target_id  TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, target_type, target_id)
);

-- 常用查询索引
CREATE INDEX IF NOT EXISTS idx_visits_user   ON visits(user_id, visited_at);
CREATE INDEX IF NOT EXISTS idx_visits_date   ON visits(visited_at);
CREATE INDEX IF NOT EXISTS idx_events_user   ON events(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_events_target ON events(target_type, target_id);
