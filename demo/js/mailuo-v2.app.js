/* ============================================================
   脉络 V2 · 应用逻辑层
   依赖 mailuo-v2.data.js 提供的全局数据
   ============================================================ */
(function () {
"use strict";

var state = {
  view: "home",           // home | country | exchange | sector | company
  country: null,
  exchange: null,
  sector: null,
  company: null,          // 当前公司 id
  tab: "timeline",
  marketFilter: "ALL",
  types: {},              // 事件类型开关
  lvFilter: "all",        // 重要性筛选
  range: "all",           // 时间范围
  favs: loadMarks("mailuo_favs"),
  imps: loadMarks("mailuo_imps"),
  marksFilter: "all",     // 收藏页分组筛选：all | fav | imp
  currentDetail: null
};

// 从 localStorage 读回收藏 / 标重要数据
function loadMarks(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch (e) {
    return {};
  }
}

// 将收藏 / 标重要数据写入 localStorage
function persistMarks() {
  try {
    localStorage.setItem("mailuo_favs", JSON.stringify(state.favs));
    localStorage.setItem("mailuo_imps", JSON.stringify(state.imps));
  } catch (e) { /* 存储不可用时忽略，仅保留内存状态 */ }
  updateMarksCount();
}

Object.keys(TYPE_META).forEach(function (t) { state.types[t] = true; });

var NOW = new Date("2026-08-02T16:00:00");
var RANGES = [
  { key: "all", label: "全部时间" },
  { key: "7d", label: "近 7 天", days: 7 },
  { key: "30d", label: "近 30 天", days: 30 },
  { key: "90d", label: "近 90 天", days: 90 }
];

function $(id) { return document.getElementById(id); }

function parseTime(str) { return new Date(str.replace(" ", "T") + ":00"); }

function findCompany(id) {
  for (var i = 0; i < COMPANIES.length; i++) if (COMPANIES[i].id === id) return COMPANIES[i];
  return null;
}

function marketTag(mkt) {
  var m = MARKETS[mkt];
  return "<span class='market-tag " + m.cls + "'>" + m.label + "</span>";
}

/* ================= 实时行情接入（/api/quote 代理腾讯财经，失败回退模拟数据） ================= */

var quoteCache = {};    // txCode -> { time, data }
var QUOTE_TTL = 60000;  // 60s 内复用缓存，同时避免重渲染死循环

function toTxCode(c) {
  var m;
  if (c.market === "CN") {
    m = c.code.match(/^(\d{6})\.(SH|SZ|BJ)$/);
    if (!m) return null;
    return (m[2] === "SH" ? "sh" : m[2] === "SZ" ? "sz" : "bj") + m[1];
  }
  if (c.market === "HK") {
    m = c.code.match(/^(\d{4,5})\.HK$/);
    return m ? "hk" + ("0000" + m[1]).slice(-5) : null;
  }
  if (c.market === "US") return "us" + c.code;
  return null; // 韩股暂无免费行情源，保留模拟数据
}

function fmtPriceReal(n) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtCapReal(curSym, capYi) {
  if (capYi >= 10000) return curSym + (capYi / 10000).toFixed(2) + " 万亿";
  return curSym + Math.round(capYi).toLocaleString("en-US") + " 亿";
}

function applyQuoteToDir(d, q) {
  var m = MARKETS[d.market];
  d.price = fmtPriceReal(q.price);
  d.chg = (q.changePct >= 0 ? "+" : "") + q.changePct.toFixed(2) + "%";
  d.dir = q.changePct >= 0 ? "up" : "down";
  if (q.totalCapYi) d.cap = fmtCapReal(m.curSym, q.totalCapYi);
  d._quoteTime = q.time;
  d._quoteKind = q.snapshotAt ? "收盘快照" : "实时行情";
}

function applyQuoteToProfile(c, q) {
  var m = MARKETS[c.market];
  c.price = fmtPriceReal(q.price);
  c.chgPct = (q.changePct >= 0 ? "+" : "") + q.changePct.toFixed(2) + "%";
  c.chgDir = q.changePct >= 0 ? "up" : "down";
  if (q.totalCapYi) c.marketCap = fmtCapReal(m.curSym, q.totalCapYi);
  if (q.volumeShares != null) c.volume = Math.round(q.volumeShares / 10000).toLocaleString("en-US") + " 万股";
  if (q.turnoverYuan != null) c.turnover = m.curSym + (q.turnoverYuan / 1e8).toFixed(1) + " 亿";
  if (q.high52) c.high52 = fmtPriceReal(q.high52);
  if (q.low52) c.low52 = fmtPriceReal(q.low52);
  if (q.peTtm) c.valuation["PE (TTM)"] = q.peTtm.toFixed(2);
  if (q.pb) c.valuation["PB"] = q.pb.toFixed(2);
  c._quoteTime = q.time;
  c._quoteKind = q.snapshotAt ? "收盘快照" : "实时行情";
}

/* 启动时拉取 D1 收盘快照，一次性水合全站目录的真实价格；
   无快照或失败时静默，后续浏览自动走 /api/quote 实时接口 */
function initQuoteSnapshots() {
  fetch("/api/quotes")
    .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
    .then(function (data) {
      if (!data || !data.quotes || !data.meta.count) return;
      Object.keys(data.quotes).forEach(function (tx) {
        quoteCache[tx] = { time: Date.now(), data: data.quotes[tx] };
      });
      var hit = 0;
      DIRECTORY.forEach(function (d) {
        var tx = toTxCode(d);
        var cached = tx && quoteCache[tx];
        if (cached && cached.data) { applyQuoteToDir(d, cached.data); hit++; }
      });
      if (hit && state.view === "sector") renderSectorView();
      console.info("[quote] 已载入收盘快照 " + hit + " 条（" + data.meta.snapshotTime + "）");
    })
    .catch(function () { /* 无快照时静默，走实时接口 */ });
}

/* pairs: [[dirEntry, txCode], ...]，只拉缓存过期项；失败静默回退模拟数据 */
function fetchQuotesStale(pairs, cb) {
  var now = Date.now();
  var need = pairs.filter(function (p) {
    var hit = quoteCache[p[1]];
    return !hit || now - hit.time > QUOTE_TTL;
  });
  if (!need.length) { cb(null); return; }
  fetch("/api/quote?codes=" + need.map(function (p) { return p[1]; }).join(","))
    .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
    .then(function (data) {
      if (!data || !data.quotes) throw new Error("bad payload");
      need.forEach(function (p) {
        quoteCache[p[1]] = { time: Date.now(), data: data.quotes[p[1]] || null };
      });
      cb(data.quotes);
    })
    .catch(function (e) {
      console.warn("[quote] 实时行情获取失败，回退模拟数据：", e);
      need.forEach(function (p) { quoteCache[p[1]] = { time: Date.now(), data: null }; });
      cb(null);
    });
}

function loadCompanyQuote(id) {
  var d = findDir(id);
  if (!d) return;
  var tx = toTxCode(d);
  if (!tx) return;
  fetchQuotesStale([[d, tx]], function () {
    if (state.view !== "company" || state.company !== id) return;
    var cached = quoteCache[tx];
    var c = findCompany(id);
    if (cached && cached.data) {
      applyQuoteToDir(d, cached.data);
      if (c) applyQuoteToProfile(c, cached.data);
      renderCoHeader();
      renderValuationPanel();
      renderComparePanel();
    } else if (c && !c._quoteTime) {
      c._quoteFailed = true;   // 行情获取失败，头部明示当前为模拟数据
      renderCoHeader();
    }
  });
}

function loadSectorQuotes(list) {
  var pairs = [];
  list.forEach(function (d) {
    var tx = toTxCode(d);
    if (tx) pairs.push([d, tx]);
  });
  if (!pairs.length) return;
  var token = state.country + "/" + state.exchange + "/" + state.sector;
  fetchQuotesStale(pairs, function (quotes) {
    if (!quotes) return;
    if (state.view !== "sector") return;
    if ((state.country + "/" + state.exchange + "/" + state.sector) !== token) return;
    var hit = false;
    pairs.forEach(function (p) {
      var cached = quoteCache[p[1]];
      if (cached && cached.data) { applyQuoteToDir(p[0], cached.data); hit = true; }
    });
    if (hit) renderSectorView();
  });
}

function showToast(msg, kind) {
  var wrap = $("toastWrap");
  var el = document.createElement("div");
  el.className = "toast " + (kind || "info");
  var icon = kind === "fav" ? "★" : kind === "imp" ? "⚑" : "✓";
  el.innerHTML = "<span class='t-icon'>" + icon + "</span><span>" + msg + "</span>";
  wrap.appendChild(el);
  setTimeout(function () { wrap.removeChild(el); }, 2200);
}

function popBtn(btn) {
  btn.classList.remove("pop");
  void btn.offsetWidth;
  btn.classList.add("pop");
}

/* ================= 全局搜索 ================= */

function renderMarketChips() {
  var wrap = $("marketChips");
  var defs = [["ALL", "全部市场"], ["CN", "中国大陆"], ["US", "美国"], ["HK", "香港"], ["KR", "韩国"]];
  wrap.innerHTML = "";
  defs.forEach(function (d) {
    var b = document.createElement("button");
    b.className = "mkt-chip" + (state.marketFilter === d[0] ? " on" : "");
    b.textContent = d[1];
    b.addEventListener("click", function () {
      state.marketFilter = d[0];
      renderMarketChips();
      renderSearchResults();
    });
    wrap.appendChild(b);
  });
}

function matchCompany(c, q) {
  q = q.toLowerCase();
  if (c.code.toLowerCase().indexOf(q) >= 0) return true;
  if (c.name.toLowerCase().indexOf(q) >= 0) return true;
  if (c.nameEn.toLowerCase().indexOf(q) >= 0) return true;
  for (var i = 0; i < c.aliases.length; i++) {
    if (c.aliases[i].toLowerCase().indexOf(q) >= 0) return true;
  }
  return false;
}

function renderSearchResults() {
  var dd = $("searchDropdown");
  var q = $("searchInput").value.trim();
  if (!q) { dd.classList.remove("open"); dd.innerHTML = ""; return; }

  var list = DIRECTORY.filter(function (c) {
    if (state.marketFilter !== "ALL" && c.market !== state.marketFilter) return false;
    return matchCompany(c, q);
  });

  if (list.length === 0) {
    dd.innerHTML = "<div class='sd-empty'>未找到匹配的公司，请尝试代码 / 中文名 / 英文名</div>";
  } else {
    dd.innerHTML = "";
    list.forEach(function (c) {
      var item = document.createElement("div");
      item.className = "sd-item";
      item.innerHTML =
        marketTag(c.market) +
        "<span class='sd-code'>" + c.code + "</span>" +
        "<span class='sd-name'>" + c.name + "<span class='en'>" + c.nameEn + "</span></span>" +
        "<span class='sd-ind'>" + c.sector + "</span>";
      item.addEventListener("mousedown", function (e) {
        e.preventDefault();
        selectCompany(c.id);
      });
      dd.appendChild(item);
    });
  }
  dd.classList.add("open");
}

/* ================= 页面切换 ================= */

function renderHotGrid() {
  var grid = $("hotGrid");
  grid.innerHTML = "";
  COMPANIES.forEach(function (c) {
    var card = document.createElement("div");
    card.className = "hot-card";
    card.innerHTML =
      "<div class='h-top'>" + marketTag(c.market) + "<span class='h-name'>" + c.name + "</span></div>" +
      "<div class='h-code num'>" + c.code + " · " + c.nameEn + "</div>" +
      "<div class='h-ind'>" + c.industry + "</div>";
    card.addEventListener("click", function () { selectCompany(c.id); });
    grid.appendChild(card);
  });
}

function findDir(id) {
  for (var i = 0; i < DIRECTORY.length; i++) if (DIRECTORY[i].id === id) return DIRECTORY[i];
  return null;
}

function selectCompany(id) {
  ensureProfile(id);
  var d = findDir(id);
  if (d) {
    state.country = d.market;
    state.exchange = d.ex;
    state.sector = d.sector;
  }
  state.company = id;
  state.tab = "timeline";
  state.range = "all";
  state.lvFilter = "all";
  Object.keys(state.types).forEach(function (t) { state.types[t] = true; });

  showView("company");
  $("searchInput").value = "";
  $("searchDropdown").classList.remove("open");

  renderCoHeader();
  renderTabs();
  renderAllPanels();
  renderBreadcrumb();
  loadCompanyQuote(id);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ================= 浏览导航 ================= */

function showView(v) {
  state.view = v;
  $("viewHome").style.display = v === "home" ? "block" : "none";
  $("viewCountry").style.display = v === "country" ? "block" : "none";
  $("viewExchange").style.display = v === "exchange" ? "block" : "none";
  $("viewSector").style.display = v === "sector" ? "block" : "none";
  $("viewMarks").style.display = v === "marks" ? "block" : "none";
  $("companyPage").style.display = v === "company" ? "block" : "none";
  $("breadcrumb").style.display = v === "home" ? "none" : "flex";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goHome() {
  state.company = null;
  state.country = state.exchange = state.sector = null;
  showView("home");
}

function goCountry(mkt) {
  state.country = mkt;
  state.exchange = state.sector = null;
  state.company = null;
  renderCountryView();
  showView("country");
  renderBreadcrumb();
}

function goExchange(exId) {
  state.exchange = exId;
  state.sector = null;
  state.company = null;
  renderExchangeView();
  showView("exchange");
  renderBreadcrumb();
}

function goSector(sec) {
  state.sector = sec;
  state.company = null;
  renderSectorView();
  showView("sector");
  renderBreadcrumb();
}

function exchangeName(exId) {
  var exs = COUNTRIES[state.country].exchanges;
  for (var i = 0; i < exs.length; i++) if (exs[i].id === exId) return exs[i].name;
  return exId;
}

function renderBreadcrumb() {
  var bc = $("breadcrumb");
  if (state.view === "home") { bc.style.display = "none"; return; }
  var parts = ["<span class='bc-link' data-nav='home'>首页</span>"];
  if (state.view === "marks") {
    parts.push("<span class='bc-cur'>" + (state.marksFilter === "imp" ? "标记重要" : "我的收藏") + "</span>");
    bc.innerHTML = parts.join("<span class='bc-sep'>/</span>");
    return;
  }
  if (state.country) {
    var cn = COUNTRIES[state.country].name;
    if (state.view === "country") parts.push("<span class='bc-cur'>" + cn + "</span>");
    else parts.push("<span class='bc-link' data-nav='country'>" + cn + "</span>");
  }
  if (state.exchange) {
    var en = exchangeName(state.exchange);
    if (state.view === "exchange") parts.push("<span class='bc-cur'>" + en + "</span>");
    else parts.push("<span class='bc-link' data-nav='exchange'>" + en + "</span>");
  }
  if (state.sector) {
    if (state.view === "sector") parts.push("<span class='bc-cur'>" + state.sector + "</span>");
    else parts.push("<span class='bc-link' data-nav='sector'>" + state.sector + "</span>");
  }
  if (state.view === "company" && state.company) {
    var c = findCompany(state.company);
    if (c) parts.push("<span class='bc-cur'>" + c.name + "</span>");
  }
  bc.innerHTML = parts.join("<span class='bc-sep'>/</span>");
}

$("breadcrumb").addEventListener("click", function (e) {
  var l = e.target.closest("[data-nav]");
  if (!l) return;
  var nav = l.getAttribute("data-nav");
  if (nav === "home") goHome();
  else if (nav === "country") goCountry(state.country);
  else if (nav === "exchange") goExchange(state.exchange);
  else if (nav === "sector") goSector(state.sector);
});

/* ================= 首页（国家/地区入口） ================= */

function renderHome() {
  var grid = $("countryGrid");
  grid.innerHTML = "";
  Object.keys(COUNTRIES).forEach(function (mkt) {
    var ct = COUNTRIES[mkt];
    var cos = DIRECTORY.filter(function (d) { return d.market === mkt; });
    var card = document.createElement("div");
    card.className = "browse-card";
    card.innerHTML =
      "<div class='bc-title'>" + marketTag(mkt) + "<span class='t'>" + ct.name + "</span></div>" +
      "<div class='mini-stats'>" +
        "<div class='mini-stat'><div class='ms-v'>" + cos.length + "</div><div class='ms-l'>覆盖公司</div></div>" +
        "<div class='mini-stat'><div class='ms-v'>" + ct.exchanges.length + "</div><div class='ms-l'>交易市场</div></div>" +
        "<div class='mini-stat'><div class='ms-v pos'>+" + ct.newToday + "</div><div class='ms-l'>今日新增股东/资本事件</div></div>" +
      "</div>" +
      "<div class='card-tag-row'>" + ct.tags.map(function (t) { return "<span class='card-tag'>" + t + "</span>"; }).join("") + "</div>";
    card.addEventListener("click", function () { goCountry(mkt); });
    grid.appendChild(card);
  });
  renderHotGrid();
}

/* ================= 国家/地区详情（交易市场列表） ================= */

function renderCountryView() {
  var ct = COUNTRIES[state.country];
  var cos = DIRECTORY.filter(function (d) { return d.market === state.country; });
  var html = "<div class='view-head'><h2>" + marketTag(state.country) + ct.name + "</h2>" +
    "<p>共覆盖 " + cos.length + " 家上市公司 · " + ct.exchanges.length + " 个交易市场 · 今日新增股东/资本变动事件 +" + ct.newToday + " 起</p></div>" +
    "<div class='ex-grid'>";

  ct.exchanges.forEach(function (ex) {
    var list = DIRECTORY.filter(function (d) { return d.ex === ex.id; });
    var secs = {};
    list.forEach(function (d) { secs[d.sector] = true; });
    var names = list.slice(0, 3).map(function (d) { return d.name; }).join("、");
    html += "<div class='browse-card' data-ex='" + ex.id + "'>" +
      "<div class='bc-title'><span class='t'>" + ex.name + "</span></div>" +
      (names ? "<div class='bc-sub'>代表公司：" + names + (list.length > 3 ? " 等" : "") + "</div>" : "<div class='bc-sub'>覆盖范围持续扩展中</div>") +
      "<div class='mini-stats'>" +
        "<div class='mini-stat'><div class='ms-v'>" + list.length + "</div><div class='ms-l'>覆盖公司</div></div>" +
        "<div class='mini-stat'><div class='ms-v'>" + Object.keys(secs).length + "</div><div class='ms-l'>覆盖板块</div></div>" +
      "</div></div>";
  });
  html += "</div>";

  var el = $("viewCountry");
  el.innerHTML = html;
  Array.prototype.forEach.call(el.querySelectorAll("[data-ex]"), function (card) {
    card.addEventListener("click", function () { goExchange(card.getAttribute("data-ex")); });
  });
}

/* ================= 交易市场 → 板块浏览 ================= */

function renderExchangeView() {
  var exName = exchangeName(state.exchange);
  var html = "<div class='view-head'><h2>" + marketTag(state.country) + exName + "</h2>" +
    "<p>板块/行业分布与近 30 日资本变动概况</p></div><div class='sec-grid'>";

  SECTORS.forEach(function (sec) {
    var list = DIRECTORY.filter(function (d) { return d.ex === state.exchange && d.sector === sec; });
    var empty = list.length === 0;
    var instUp = list.filter(function (d) { return d.instDir === "pos"; }).length;
    var holdDown = list.filter(function (d) { return d.holderDir === "neg"; }).length;
    var hot = list.length ? list[0] : null;

    html += "<div class='browse-card sec-card" + (empty ? " empty" : "") + "'" + (empty ? "" : " data-sec='" + sec + "'") + ">" +
      "<div class='bc-title'><span class='t'>" + sec + "</span></div>" +
      "<div class='mini-stats'>" +
        "<div class='mini-stat'><div class='ms-v'>" + list.length + "</div><div class='ms-l'>覆盖公司</div></div>" +
        "<div class='mini-stat'><div class='ms-v pos'>" + instUp + "</div><div class='ms-l'>30日机构净增持公司</div></div>" +
        "<div class='mini-stat'><div class='ms-v " + (holdDown ? "neg" : "") + "'>" + holdDown + "</div><div class='ms-l'>30日大股东减持事件</div></div>" +
      "</div>" +
      (hot ? "<div class='sec-hot'><div class='lbl'>近期重要资本变动</div>" + hot.name + "：" + hot.event + "（" + hot.disc + "）</div>" : "<div class='sec-hot'><div class='lbl'>近期重要资本变动</div>暂无覆盖公司</div>") +
    "</div>";
  });
  html += "</div>";

  var el = $("viewExchange");
  el.innerHTML = html;
  Array.prototype.forEach.call(el.querySelectorAll("[data-sec]"), function (card) {
    card.addEventListener("click", function () { goSector(card.getAttribute("data-sec")); });
  });
}

/* ================= 板块 → 公司数据库列表 ================= */

function renderSectorView() {
  var list = DIRECTORY.filter(function (d) {
    return d.market === state.country && d.ex === state.exchange && d.sector === state.sector;
  });
  var cur = MARKETS[state.country].currency;

  var rows = "";
  list.forEach(function (d) {
    rows += "<tr data-co='" + d.id + "' style='cursor:pointer;'>" +
      "<td class='num' style='white-space:nowrap;'>" + d.code + "</td>" +
      "<td><strong>" + d.name + "</strong> <span style='font-size:11px;color:var(--graphite-500);'>" + d.nameEn + "</span></td>" +
      "<td>" + marketTag(d.market) + "</td>" +
      "<td style='white-space:nowrap;'>" + exchangeName(d.ex) + "</td>" +
      "<td>" + d.sector + "</td>" +
      "<td class='r num' style='white-space:nowrap;'>" + d.cap + "</td>" +
      "<td class='r num'>" + MARKETS[d.market].curSym + d.price + "</td>" +
      "<td class='r num " + chgCls(d.dir === "up" ? "pos" : "neg") + "'>" + d.chg + "</td>" +
      "<td class='r num " + chgCls(d.instDir) + "'>" + d.inst + "</td>" +
      "<td class='" + chgCls(d.holderDir) + "' style='font-size:12px;'>" + d.holder + "</td>" +
      "<td style='font-size:12px;max-width:220px;'>" + d.event + "</td>" +
      "<td class='num' style='white-space:nowrap;'>" + d.disc + "</td>" +
    "</tr>";
  });

  $("viewSector").innerHTML =
    "<div class='view-head'><h2>" + marketTag(state.country) + state.sector + " · 公司数据库</h2>" +
    "<p>" + COUNTRIES[state.country].name + " / " + exchangeName(state.exchange) + " / " + state.sector + " · 共 " + list.length + " 家 · 币种 " + cur + " · 点击行进入公司数据档案页</p></div>" +
    "<div class='card'><div class='card-body' style='padding:6px 12px;overflow-x:auto;'><table class='data-table'>" +
    "<thead><tr><th>股票代码</th><th>公司名称</th><th>国家/地区</th><th>上市市场</th><th>板块/行业</th>" +
    "<th class='r'>市值</th><th class='r'>最新价</th><th class='r'>涨跌幅</th><th class='r'>机构持仓变化</th><th>大股东变化</th><th>最近资本事件</th><th>披露时间</th></tr></thead>" +
    "<tbody>" + rows + "</tbody></table></div>" +
    srcLine(list.some(function (d) { return d._quoteTime; })
      ? (function () {
          var q = list.filter(function (d) { return d._quoteTime; })[0];
          return "价格 / 涨跌幅 / 市值：腾讯财经 · " + (q._quoteKind || "实时行情") + "（" + q._quoteTime + "）· 其余字段为模拟数据";
        })()
      : "列表字段口径：最近一期公开披露 · 模拟数据") + "</div>";

  Array.prototype.forEach.call($("viewSector").querySelectorAll("[data-co]"), function (tr) {
    tr.addEventListener("click", function () { selectCompany(tr.getAttribute("data-co")); });
  });
  loadSectorQuotes(list);
}

/* ================= 通用公司档案生成器（目录公司无手工档案时调用） ================= */

function hashStr(s) {
  var x = 0;
  for (var i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) % 9973;
  return x;
}

function fmtPrice(n) {
  return n >= 1000 ? Math.round(n).toLocaleString("en-US") : n.toFixed(2);
}

function ensureProfile(id) {
  if (findCompany(id)) return;
  var d = findDir(id);
  if (!d) return;
  var m = MARKETS[d.market];
  var seed = hashStr(id);
  var rv = function (min, max, i, dec) {
    var x = ((seed * (i * 37 + 11)) % 1000) / 1000;
    return (min + (max - min) * x).toFixed(dec === undefined ? 1 : dec);
  };
  var p = parseFloat(d.price.replace(/,/g, ""));
  var sym = m.curSym;

  var profile = {
    id: d.id, name: d.name, nameEn: d.nameEn || d.code, code: d.code, market: d.market,
    industry: d.sector, aliases: d.aliases,
    price: d.price, chgPct: d.chg, chgDir: d.dir,
    marketCap: d.cap,
    volume: rv(200, 9000, 1, 0) + " 万股",
    turnover: sym + rv(2, 120, 2, 1) + " 亿",
    high52: fmtPrice(p * 1.22), low52: fmtPrice(p * 0.64),
    valuation: {
      "PE (TTM)": rv(9, 45, 3), "PB": rv(1, 8, 4), "PS (TTM)": rv(1, 9, 5),
      "股息率": rv(0.2, 3.5, 6, 1) + "%", "EV/EBITDA": rv(6, 28, 7), "PEG": rv(0.6, 2.4, 8, 1)
    },
    financials: {
      "营业收入 (TTM)": sym + rv(80, 4000, 9, 0) + " 亿", "净利润 (TTM)": sym + rv(10, 800, 10, 0) + " 亿",
      "毛利率": rv(18, 65, 11) + "%", "净利率": rv(5, 30, 12) + "%",
      "EPS (TTM)": sym + rv(0.5, 20, 13, 2), "ROE": rv(6, 28, 14) + "%", "ROA": rv(3, 18, 15) + "%",
      "经营现金流": sym + rv(20, 900, 16, 0) + " 亿", "资产负债率": rv(20, 70, 17) + "%"
    },
    history: {
      years: ["2022", "2023", "2024", "2025"],
      revenue: [rv(60, 100, 18, 0) * 10, rv(70, 110, 19, 0) * 10, rv(80, 120, 20, 0) * 10, rv(90, 130, 21, 0) * 10],
      profit: [rv(6, 15, 22, 0) * 10, rv(8, 18, 23, 0) * 10, rv(10, 22, 24, 0) * 10, rv(12, 26, 25, 0) * 10]
    },
    peers: DIRECTORY.filter(function (x) { return x.sector === d.sector && x.id !== d.id; }).slice(0, 3).map(function (x) {
      return { name: x.name, code: x.code, market: x.market, pe: rv(9, 40, 26), pb: rv(1, 7, 27), roe: rv(6, 25, 28) + "%", cap: x.cap };
    }),
    shareholders: [
      { name: d.market === "CN" ? "香港中央结算（北向资金）" : "Vanguard Group", pct: rv(4, 12, 29) + "%", change: d.inst, dir: d.instDir },
      { name: d.market === "CN" ? "控股股东及一致行动人" : "BlackRock", pct: rv(3, 10, 30) + "%", change: d.holder === "—" ? "0" : d.holder, dir: d.holderDir },
      { name: "State Street", pct: rv(2, 5, 31) + "%", change: "0", dir: "neu" },
      { name: d.market === "KR" ? "韩国国民年金公团" : "Geode Capital", pct: rv(1, 4, 32) + "%", change: "0", dir: "neu" },
      { name: "公司管理层合计", pct: rv(0.5, 15, 33) + "%", change: "0", dir: "neu" }
    ],
    inst: { count: rv(200, 2600, 34, 0) + " 家", pct: rv(15, 55, 35) + "%", change: "30 日 " + d.inst, dir: d.instDir },
    mgmtPct: rv(0.5, 20, 36) + "%",
    lockup: d.market === "CN" ? "限售解禁信息：近 12 个月无大规模解禁安排（模拟数据）" : "该市场无锁定期概念；关注大股东及高管持股变动披露（模拟数据）"
  };
  COMPANIES.push(profile);
  EVENTS[id] = genEvents(d, sym);
}

function genEvents(d, sym) {
  function ev(n, type, lv, imp, time, title, brief, sum, srcName, srcType, url, tags) {
    return { id: d.id + "g" + n, type: type, lv: lv, imp: imp, time: time, title: title,
      brief: brief, sum: sum, src: { n: srcName, t: srcType, u: url }, tags: tags };
  }
  var exName = COUNTRIES[d.market].exchanges.filter(function (e) { return e.id === d.ex; })[0].name;
  return [
    ev(1, "earnings", "high", "pos", "2026-07-26 18:00",
      d.name + "披露 2026 年二季度业绩：营收与利润稳健增长",
      "Q2 营收同比 +12%，净利润同比 +15%；近期重点事项：" + d.event + "。",
      d.name + "披露 2026 年二季度业绩（模拟数据）：营业收入同比增长 12%，净利润同比增长 15%，毛利率环比改善。近期重点事项：" + d.event + "。管理层对下半年经营指引维持积极。",
      d.name + "定期报告", "公司公告（模拟）", "https://www.cninfo.com.cn", ["财报", "业绩"]),
    ev(2, "announce", "high", "pos", d.disc + " 17:00",
      "公告：" + d.event,
      d.event + "。公告全文已披露于交易所指定平台。",
      d.name + "发布公告（模拟数据）：" + d.event + "。该事项为公司近期最重要的资本/经营变动，建议结合股东与持仓模块跟踪后续进展。",
      d.name + "公司公告", exName + " 披露平台（模拟）", "https://www.sse.com.cn", ["公告", "资本变动"]),
    ev(3, "institution", "normal", d.instDir === "pos" ? "pos" : "neg", "2026-07-20 16:00",
      "机构持仓更新：近 30 日机构持股比例变动 " + d.inst,
      "持股机构合计比例变动 " + d.inst + "，反映" + (d.instDir === "pos" ? "机构增配意愿上升" : "部分机构获利了结") + "。",
      "最新机构持仓统计（模拟数据）：" + d.name + "近 30 日机构持股比例变动 " + d.inst + "。" + (d.instDir === "pos" ? "主动型基金与指数资金均有增配，反映机构对公司基本面信心增强。" : "部分机构选择获利了结，需跟踪后续披露确认趋势。"),
      "Wind 机构持仓统计（模拟）", "数据供应商", "https://www.wind.com.cn", ["机构持仓", "资金流向"]),
    ev(4, "holder", "normal", d.holderDir === "neg" ? "neg" : "neu", "2026-07-15 08:00",
      "大股东持股变动：" + (d.holder === "—" ? "本期无重大变动" : d.holder),
      d.holder === "—" ? "主要股东本期持股无重大变动，股权结构稳定。" : "主要股东持股变动：" + d.holder + "，详见权益披露。",
      d.name + "大股东持股变动披露（模拟数据）：" + (d.holder === "—" ? "主要股东本期持股无重大变动，公司股权结构保持稳定。" : d.holder + "。投资者可关注该变动与公司治理及后续资本运作的关联。"),
      "交易所权益披露（模拟）", "交易所披露", "https://www.hkex.com.hk", ["股东变动", "权益披露"]),
    ev(5, "price", "normal", d.dir === "up" ? "pos" : "neg", "2026-07-29 14:30",
      "行情异动：单日" + (d.dir === "up" ? "上涨" : "下跌") + " " + d.chg.replace("+", "").replace("-", "") + "，成交显著放大",
      "最新价 " + sym + d.price + "（" + d.chg + "），成交量放大至 20 日均量 1.8 倍。",
      d.name + "近期行情异动（模拟数据）：最新价 " + sym + d.price + "，单日涨跌幅 " + d.chg + "，成交量放大至 20 日均量的 1.8 倍。异动与近期披露事项（" + d.event + "）相关。",
      "交易所行情数据（模拟）", "交易所数据", "https://www.nasdaq.com", ["行情异动", "成交量"]),
    ev(6, "news", "normal", "neu", "2026-07-08 10:00",
      d.sector + "行业动态：" + d.name + "经营进展获媒体关注",
      "财经媒体报道公司近期经营进展：" + d.event + "。",
      "据财经媒体报道（模拟数据），" + d.name + "近期经营进展受到市场关注：" + d.event + "。分析人士认为该进展对公司中期基本面有正面意义，但短期股价已部分反映预期。",
      "财新网（模拟）", "财经媒体", "https://www.caixin.com", ["新闻", d.sector]),
    ev(7, "report", "normal", "pos", "2026-06-28 09:00",
      "券商研报：维持积极评级，关注" + d.sector + "景气度变化",
      "研报认为公司基本面稳健，给予积极评级，提示关注行业景气度与估值匹配度。",
      "券商研究部发布覆盖报告（模拟数据）：认为 " + d.name + " 基本面稳健，" + d.event + "构成近期催化，给予积极评级；同时提示关注" + d.sector + "行业景气度变化与当前估值的匹配度。",
      "券商研究所（模拟）", "券商研报", "https://www.cicc.com", ["研报", "评级"]),
    ev(8, "industry", "normal", "neu", "2026-06-15 11:00",
      d.sector + "板块月度数据发布，行业集中度持续提升",
      "行业协会月度数据显示头部公司份额提升，" + d.name + "位居板块前列。",
      "行业协会发布月度运行数据（模拟数据）：" + d.sector + "板块整体景气度平稳，头部公司市场份额持续提升，" + d.name + "在收入规模与盈利质量指标上位居板块前列。",
      "行业协会（模拟）", "行业数据", "http://www.caam.org.cn", ["行业", "景气度"]),
    ev(9, "macro", "normal", "neu", "2026-06-05 09:30",
      "宏观环境：" + COUNTRIES[d.market].name + "市场流动性与利率环境更新",
      "宏观数据更新对公司所在市场的估值环境构成影响，机构维持中性评估。",
      "宏观环境更新（模拟数据）：" + COUNTRIES[d.market].name + "市场最新流动性与利率数据公布，机构评估对" + d.sector + "板块估值环境整体影响中性，建议结合公司个体基本面判断。",
      "官方统计机构（模拟）", "官方数据", "https://www.stats.gov.cn", ["宏观", "流动性"])
  ];
}

/* ================= 公司头部 ================= */

function renderCoHeader() {
  var c = findCompany(state.company);
  var m = MARKETS[c.market];
  $("coHeader").innerHTML =
    "<div class='co-row1'>" +
      "<span class='co-name'>" + c.name + "</span>" +
      marketTag(c.market) +
      "<span class='co-code'>" + c.code + "</span>" +
      "<span class='co-ind'>" + c.industry + "</span>" +
      "<span class='co-en'>" + c.nameEn + "</span>" +
    "</div>" +
    "<div class='co-row2'>" +
      "<div class='co-price-main'>" +
        "<span class='co-price num " + c.chgDir + "'>" + m.curSym + c.price + "</span>" +
        "<span class='co-chg num " + c.chgDir + "'>" + (c.chgDir === "up" ? "▲" : "▼") + " " + c.chgPct + "</span>" +
      "</div>" +
      "<div class='co-stat'><div class='s-lbl'>市值</div><div class='s-val num'>" + c.marketCap + "</div></div>" +
      "<div class='co-stat'><div class='s-lbl'>成交量</div><div class='s-val num'>" + c.volume + "</div></div>" +
      "<div class='co-stat'><div class='s-lbl'>成交额</div><div class='s-val num'>" + c.turnover + "</div></div>" +
      "<div class='co-stat'><div class='s-lbl'>52 周高 / 低</div><div class='s-val num'>" + m.curSym + c.high52 + " / " + m.curSym + c.low52 + "</div></div>" +
      "<div class='co-update'>币种：" + m.currency + " · 数据更新：" + UPDATE_TIME + "<br>" + DATA_SOURCE +
      (c._quoteTime ? "<br>行情：腾讯财经 · " + (c._quoteKind || "实时行情") + "（" + c._quoteTime + "）"
        : c._quoteFailed ? "<br>⚠ 实时行情不可用（需经 Wrangler/Pages 服务访问），当前显示模拟数据" : "") + "</div>" +
    "</div>";
}

/* ================= 标签页 ================= */

function renderTabs() {
  var btns = $("tabsNav").querySelectorAll(".tab-btn");
  Array.prototype.forEach.call(btns, function (b) {
    b.classList.toggle("on", b.getAttribute("data-tab") === state.tab);
  });
  ["timeline", "valuation", "financials", "holders", "filings", "compare"].forEach(function (t) {
    $("panel-" + t).classList.toggle("on", t === state.tab);
  });
}

function renderAllPanels() {
  renderTimelinePanel();
  renderValuationPanel();
  renderFinancialsPanel();
  renderHoldersPanel();
  renderFilingsPanel();
  renderComparePanel();
}

/* ================= 行情与估值 ================= */

function kvHtml(label, value, dir, delta) {
  return "<div class='kv'><div class='k'>" + label + "</div>" +
    "<div class='v num " + (dir || "") + "'>" + value + "</div>" +
    (delta ? "<div class='d'>" + delta + "</div>" : "") + "</div>";
}

function srcLine(extra) {
  return "<div class='src-line'><span>来源：" + DATA_SOURCE + "</span><span>更新：" + UPDATE_TIME + "</span>" +
    (extra ? "<span>" + extra + "</span>" : "") + "</div>";
}

function renderValuationPanel() {
  var c = findCompany(state.company);
  var m = MARKETS[c.market];
  var kvs = kvHtml("最新价 (" + m.currency + ")", m.curSym + c.price, c.chgDir, "涨跌幅 " + c.chgPct)
    + kvHtml("市值", c.marketCap)
    + kvHtml("52 周区间", m.curSym + c.low52 + " – " + m.curSym + c.high52)
    + kvHtml("成交量 / 成交额", c.volume + " / " + c.turnover);
  Object.keys(c.valuation).forEach(function (k) {
    kvs += kvHtml(k, c.valuation[k]);
  });
  $("panel-valuation").innerHTML =
    "<div class='card'><div class='card-head'><span class='c-title'>行情与估值指标</span>" +
    "<span class='c-note'>币种 " + m.currency + " · 估值口径 TTM</span></div>" +
    "<div class='card-body'><div class='kv-grid'>" + kvs + "</div></div>" +
    srcLine(c._quoteTime ? "价格 / 市值 / 52 周区间 / 成交量额（A股港股含 PE/PB）：腾讯财经 · " + (c._quoteKind || "实时行情") + "（" + c._quoteTime + "）" : null) + "</div>";
}

/* ================= 盈利与财务 ================= */

function barChart(history, unit) {
  var W = 720, H = 220, padL = 46, padB = 26, padT = 14;
  var n = history.years.length;
  var maxV = Math.max.apply(null, history.revenue.concat(history.profit)) * 1.15;
  var plotW = W - padL - 16, plotH = H - padT - padB;
  var slot = plotW / n, bw = Math.min(34, slot / 3);
  var svg = "<svg viewBox='0 0 " + W + " " + H + "' style='width:100%;height:auto;' xmlns='http://www.w3.org/2000/svg'>";
  // 网格线
  for (var g = 0; g <= 4; g++) {
    var y = padT + plotH * g / 4;
    var val = Math.round(maxV * (1 - g / 4));
    svg += "<line x1='" + padL + "' y1='" + y + "' x2='" + (W - 8) + "' y2='" + y + "' stroke='#eef1f5'/>";
    svg += "<text x='" + (padL - 6) + "' y='" + (y + 4) + "' text-anchor='end' font-size='10' fill='#b9c1cc'>" + val + "</text>";
  }
  history.years.forEach(function (yr, i) {
    var cx = padL + slot * i + slot / 2;
    var rh = plotH * history.revenue[i] / maxV;
    var ph = plotH * history.profit[i] / maxV;
    svg += "<rect x='" + (cx - bw - 3) + "' y='" + (padT + plotH - rh) + "' width='" + bw + "' height='" + rh + "' rx='3' fill='#2a4d85'/>";
    svg += "<rect x='" + (cx + 3) + "' y='" + (padT + plotH - ph) + "' width='" + bw + "' height='" + ph + "' rx='3' fill='#2f7d5b'/>";
    svg += "<text x='" + cx + "' y='" + (H - 8) + "' text-anchor='middle' font-size='11' fill='#64707f'>" + yr + "</text>";
  });
  svg += "</svg>";
  return svg;
}

function renderFinancialsPanel() {
  var c = findCompany(state.company);
  var kvs = "";
  Object.keys(c.financials).forEach(function (k) {
    kvs += kvHtml(k, c.financials[k]);
  });
  $("panel-financials").innerHTML =
    "<div class='card'><div class='card-head'><span class='c-title'>核心财务指标</span>" +
    "<span class='c-note'>TTM 口径 · 币种见公司概览</span></div>" +
    "<div class='card-body'><div class='kv-grid'>" + kvs + "</div></div>" + srcLine() + "</div>" +
    "<div class='card'><div class='card-head'><span class='c-title'>营收与净利润历史趋势</span>" +
    "<span class='c-note'>单位：亿元（本币，三星电子为万亿韩元 · 特斯拉为亿美元）</span></div>" +
    "<div class='chart-box'>" + barChart(c.history) + "</div>" +
    "<div class='chart-legend'><span><i style='background:#2a4d85'></i>营业收入</span><span><i style='background:#2f7d5b'></i>净利润</span></div>" +
    srcLine("财报口径：年度合并报表") + "</div>";
}

/* ================= 股东与持仓 ================= */

function chgCls(dir) {
  return dir === "pos" ? "chg-pos" : dir === "neg" ? "chg-neg" : "chg-neu";
}

function renderHoldersPanel() {
  var c = findCompany(state.company);
  var rows = "";
  c.shareholders.forEach(function (s, i) {
    rows += "<tr><td class='r'>" + (i + 1) + "</td><td>" + s.name + "</td>" +
      "<td class='r num'>" + s.pct + "</td>" +
      "<td class='r num " + chgCls(s.dir) + "'>" + s.change + "</td></tr>";
  });
  $("panel-holders").innerHTML =
    "<div class='card'><div class='card-head'><span class='c-title'>前十大股东（前 5 名披露）</span>" +
    "<span class='c-note'>最近披露期：2026Q2</span></div>" +
    "<div class='card-body' style='padding:6px 12px;'><table class='data-table'>" +
    "<thead><tr><th class='r'>#</th><th>股东名称</th><th class='r'>持股比例</th><th class='r'>较上期变动</th></tr></thead>" +
    "<tbody>" + rows + "</tbody></table></div>" + srcLine("股东数据口径：定期报告披露") + "</div>" +

    "<div class='card'><div class='card-head'><span class='c-title'>机构与管理层持股</span></div>" +
    "<div class='card-body'><div class='kv-grid'>" +
      kvHtml("持股机构数量", c.inst.count) +
      kvHtml("机构持股比例", c.inst.pct, c.inst.dir, c.inst.change) +
      kvHtml("管理层 / 实控人持股", c.mgmtPct) +
    "</div></div>" + srcLine() + "</div>" +

    "<div class='card'><div class='card-head'><span class='c-title'>限售与解禁信息</span></div>" +
    "<div class='card-body' style='font-size:13px;color:var(--graphite-700);'>" + c.lockup + "</div>" +
    srcLine() + "</div>";
}

/* ================= 财报与公告 ================= */

function renderFilingsPanel() {
  var list = (EVENTS[state.company] || []).filter(function (ev) {
    return ev.type === "earnings" || ev.type === "announce";
  }).sort(function (a, b) { return parseTime(b.time) - parseTime(a.time); });

  var rows = "";
  list.forEach(function (ev) {
    var tm = TYPE_META[ev.type];
    rows += "<tr>" +
      "<td class='num' style='white-space:nowrap;'>" + ev.time.split(" ")[0] + "</td>" +
      "<td><span class='type-badge " + tm.cls + "'>" + tm.label + "</span></td>" +
      "<td><a href='javascript:void(0)' data-evjump='" + ev.id + "' style='color:var(--navy-800);font-weight:600;text-decoration:none;'>" + ev.title + "</a></td>" +
      "<td style='font-size:12px;color:var(--graphite-500);white-space:nowrap;'>" + ev.src.n + "</td>" +
      "<td class='r'><a href='" + ev.src.u + "' target='_blank' rel='noopener' style='color:var(--navy-600);font-size:12px;font-weight:600;text-decoration:none;'>原文 ↗</a></td>" +
    "</tr>";
  });

  $("panel-filings").innerHTML =
    "<div class='card'><div class='card-head'><span class='c-title'>财报披露与公司公告</span>" +
    "<span class='c-note'>共 " + list.length + " 条 · 点击标题可在 Timeline 中定位</span></div>" +
    "<div class='card-body' style='padding:6px 12px;'><table class='data-table'>" +
    "<thead><tr><th>披露日期</th><th>类型</th><th>事项</th><th>来源</th><th class='r'>原文</th></tr></thead>" +
    "<tbody>" + rows + "</tbody></table></div>" +
    srcLine("覆盖：财报披露 / 业绩预告 / 分红 / 回购 / 融资 / 并购 / 监管公告") + "</div>";
}

/* ================= 对比与历史 ================= */

function renderComparePanel() {
  var c = findCompany(state.company);
  var m = MARKETS[c.market];
  var rows = "<tr style='background:var(--blue-bg);'>" +
    "<td><strong>" + c.name + "</strong> <span style='font-size:11px;color:var(--graphite-500);'>" + c.code + "</span></td>" +
    "<td>" + marketTag(c.market) + "</td>" +
    "<td class='r num'><strong>" + c.valuation["PE (TTM)"] + "</strong></td>" +
    "<td class='r num'><strong>" + c.valuation["PB"] + "</strong></td>" +
    "<td class='r num'><strong>" + c.financials["ROE"] + "</strong></td>" +
    "<td class='r num'><strong>" + c.marketCap + "</strong></td></tr>";
  c.peers.forEach(function (p) {
    rows += "<tr><td>" + p.name + " <span style='font-size:11px;color:var(--graphite-500);'>" + p.code + "</span></td>" +
      "<td>" + marketTag(p.market) + "</td>" +
      "<td class='r num'>" + p.pe + "</td><td class='r num'>" + p.pb + "</td>" +
      "<td class='r num'>" + p.roe + "</td><td class='r num'>" + p.cap + "</td></tr>";
  });

  $("panel-compare").innerHTML =
    "<div class='card'><div class='card-head'><span class='c-title'>同业横向对比</span>" +
    "<span class='c-note'>估值口径 TTM · 各市场本币计价</span></div>" +
    "<div class='card-body' style='padding:6px 12px;'><table class='data-table'>" +
    "<thead><tr><th>公司</th><th>市场</th><th class='r'>PE</th><th class='r'>PB</th><th class='r'>ROE</th><th class='r'>市值</th></tr></thead>" +
    "<tbody>" + rows + "</tbody></table></div>" + srcLine() + "</div>" +

    "<div class='card'><div class='card-head'><span class='c-title'>关键指标历史趋势</span>" +
    "<span class='c-note'>年度 · 本币</span></div>" +
    "<div class='chart-box'>" + barChart(c.history) + "</div>" +
    "<div class='chart-legend'><span><i style='background:#2a4d85'></i>营业收入</span><span><i style='background:#2f7d5b'></i>净利润</span></div>" +
    srcLine("更多历史区间与自定义指标对比将在接入真实数据源后开放") + "</div>";
}

/* ================= 事件 Timeline ================= */

function getFilteredEvents() {
  var rangeDays = null;
  RANGES.forEach(function (r) { if (r.key === state.range) rangeDays = r.days || null; });

  return (EVENTS[state.company] || []).filter(function (ev) {
    if (!state.types[ev.type]) return false;
    if (state.lvFilter === "high" && ev.lv !== "high") return false;
    if (state.lvFilter === "fav" && !state.favs[ev.id]) return false;
    if (state.lvFilter === "imp" && !state.imps[ev.id]) return false;
    if (rangeDays) {
      var diff = (NOW - parseTime(ev.time)) / 86400000;
      if (diff > rangeDays) return false;
    }
    return true;
  }).sort(function (a, b) { return parseTime(b.time) - parseTime(a.time); });
}

function renderTimelinePanel() {
  var c = findCompany(state.company);
  var chips = "";
  Object.keys(TYPE_META).forEach(function (key) {
    chips += "<button class='type-chip" + (state.types[key] ? " on" : "") + "' data-tltype='" + key + "'>" +
      TYPE_META[key].icon + " " + TYPE_META[key].label + "</button>";
  });
  var rangeOpts = "";
  RANGES.forEach(function (r) {
    rangeOpts += "<option value='" + r.key + "'" + (state.range === r.key ? " selected" : "") + ">" + r.label + "</option>";
  });

  var list = getFilteredEvents();
  var itemsHtml = "";
  if (list.length === 0) {
    itemsHtml = "<div class='empty-state'><div class='big'>◌</div><div>当前筛选条件下暂无事件</div>" +
      "<div style='font-size:12px;margin-top:4px;'>请尝试放宽类型、重要性或时间范围</div></div>";
  } else {
    list.forEach(function (ev, idx) {
      var tm = TYPE_META[ev.type];
      var im = IMPACT_META[ev.imp];
      itemsHtml +=
        "<div class='tl-item' style='animation-delay:" + (idx * 0.04) + "s;'>" +
          "<div class='tl-node' style='--node-color:" + tm.color + "'>" + tm.icon + "</div>" +
          "<div class='tl-card" + (state.imps[ev.id] ? " important" : "") + (ev.lv === "high" ? " lv-high" : "") + "' data-id='" + ev.id + "'>" +
            "<div class='tl-meta'>" +
              "<span class='tl-time'>" + ev.time + "</span>" +
              "<span class='type-badge " + tm.cls + "'>" + tm.label + "</span>" +
              "<span class='impact-badge " + im.cls + "'>" + im.label + "</span>" +
              (ev.lv === "high" ? "<span style='font-size:11px;color:var(--red);font-weight:700;'>高重要性</span>" : "") +
              "<span class='imp-flag'>⚑ 已标重要</span>" +
            "</div>" +
            "<div class='tl-title' data-act='detail'>" + ev.title + "</div>" +
            "<div class='tl-summary'>" + ev.brief + "</div>" +
            "<div class='tl-footer'>" +
              "<span class='tl-source'>来源：<a href='" + ev.src.u + "' target='_blank' rel='noopener'>" + ev.src.n + "</a></span>" +
              "<span class='tl-actions'>" +
                "<button class='act-btn" + (state.favs[ev.id] ? " faved" : "") + "' data-act='fav'>" + (state.favs[ev.id] ? "★ 已收藏" : "☆ 收藏") + "</button>" +
                "<button class='act-btn" + (state.imps[ev.id] ? " imped" : "") + "' data-act='imp'>" + (state.imps[ev.id] ? "⚑ 已标重要" : "⚑ 标记重要") + "</button>" +
                "<button class='act-btn' data-act='detail'>详情 →</button>" +
              "</span>" +
            "</div>" +
          "</div>" +
        "</div>";
    });
  }

  $("panel-timeline").innerHTML =
    "<div class='card'>" +
      "<div class='tl-filters'>" +
        "<span class='f-label'>类型</span>" + chips +
        "<span class='f-label' style='margin-left:8px;'>重要性</span>" +
        "<select class='f-select' id='lvSelect'>" +
          "<option value='all'" + (state.lvFilter === "all" ? " selected" : "") + ">全部</option>" +
          "<option value='high'" + (state.lvFilter === "high" ? " selected" : "") + ">仅高重要性</option>" +
          "<option value='fav'" + (state.lvFilter === "fav" ? " selected" : "") + ">已收藏</option>" +
          "<option value='imp'" + (state.lvFilter === "imp" ? " selected" : "") + ">已标重要</option>" +
        "</select>" +
        "<span class='f-label' style='margin-left:8px;'>范围</span>" +
        "<select class='f-select' id='rangeSelect'>" + rangeOpts + "</select>" +
        "<span class='tl-count'>" + c.name + " · 共 " + list.length + " 条</span>" +
      "</div>" +
      "<div class='timeline'>" + itemsHtml + "</div>" +
      srcLine("事件时间以披露时间为准 · 币种 " + MARKETS[c.market].currency) +
    "</div>";

  // 筛选绑定
  Array.prototype.forEach.call($("panel-timeline").querySelectorAll("[data-tltype]"), function (b) {
    b.addEventListener("click", function () {
      var t = b.getAttribute("data-tltype");
      state.types[t] = !state.types[t];
      renderTimelinePanel();
    });
  });
  $("lvSelect").addEventListener("change", function () {
    state.lvFilter = this.value;
    renderTimelinePanel();
  });
  $("rangeSelect").addEventListener("change", function () {
    state.range = this.value;
    renderTimelinePanel();
  });
}

/* ================= 收藏 / 标记重要 ================= */

function findEvent(id) {
  var list = EVENTS[state.company] || [];
  for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
  return null;
}

function toggleFav(id, btn) {
  state.favs[id] = !state.favs[id];
  if (!state.favs[id]) delete state.favs[id];
  var on = !!state.favs[id];
  if (btn) {
    btn.classList.toggle("faved", on);
    btn.textContent = on ? "★ 已收藏" : "☆ 收藏";
    popBtn(btn);
  }
  persistMarks();
  showToast(on ? "已加入收藏" : "已取消收藏", "fav");
}

function toggleImp(id, btn) {
  state.imps[id] = !state.imps[id];
  if (!state.imps[id]) delete state.imps[id];
  var on = !!state.imps[id];
  if (btn) {
    btn.classList.toggle("imped", on);
    btn.textContent = on ? "⚑ 已标重要" : "⚑ 标记重要";
    popBtn(btn);
    var card = btn.closest(".tl-card");
    if (card) card.classList.toggle("important", on);
  }
  persistMarks();
  showToast(on ? "已标记为重要事件" : "已取消重要标记", "imp");
}

/* ================= 我的收藏（跨公司汇总页） ================= */

// 在所有公司中查找事件，返回 { co, ev }
function findEventAnywhere(id) {
  var cos = Object.keys(EVENTS);
  for (var i = 0; i < cos.length; i++) {
    var list = EVENTS[cos[i]] || [];
    for (var j = 0; j < list.length; j++) {
      if (list[j].id === id) return { co: cos[i], ev: list[j] };
    }
  }
  return null;
}

// 更新顶栏入口的计数徽标（收藏 / 标重要分别计数）
function updateMarksCount() {
  $("marksCount").textContent = Object.keys(state.favs).length;
  $("impCount").textContent = Object.keys(state.imps).length;
}

function goMarks(filter) {
  state.company = null;
  state.marksFilter = filter || "all";
  renderMarksView();
  showView("marks");
  renderBreadcrumb();
}

function renderMarksView() {
  var favIds = Object.keys(state.favs);
  var impIds = Object.keys(state.imps);
  var filter = state.marksFilter;
  var showFav = filter !== "imp";
  var showImp = filter !== "fav";
  var total = (showFav ? favIds.length : 0) + (showImp ? impIds.length : 0);

  var chips =
    "<div class='marks-chips'>" +
      "<button class='marks-chip" + (filter === "all" ? " on" : "") + "' data-mfilter='all'>全部</button>" +
      "<button class='marks-chip" + (filter === "fav" ? " on" : "") + "' data-mfilter='fav'>★ 已收藏</button>" +
      "<button class='marks-chip" + (filter === "imp" ? " on" : "") + "' data-mfilter='imp'>⚑ 已标重要</button>" +
    "</div>";

  if (total === 0) {
    $("viewMarks").innerHTML =
      "<div class='card marks-empty'>" +
        "<div class='marks-head'>我的收藏与重要标记</div>" + chips +
        "<div class='empty-state'><div class='big'>" + (filter === "imp" ? "⚑" : "☆") + "</div>" +
        "<div>" + (filter === "imp" ? "还没有标记重要的事件" : filter === "fav" ? "还没有收藏任何事件" : "还没有收藏或标记任何事件") + "</div>" +
        "<div style='font-size:12px;margin-top:4px;'>在公司档案页的事件 Timeline 中点击「☆ 收藏」或「⚑ 标记重要」即可加入</div></div>" +
      "</div>";
  } else {
    $("viewMarks").innerHTML =
      "<div class='card'>" +
        "<div class='marks-head'>我的收藏与重要标记<span class='marks-total'>共 " + total + " 条</span></div>" +
        chips +
        (showFav ? marksSection("★ 已收藏", favIds, "fav") : "") +
        (showImp ? marksSection("⚑ 已标重要", impIds, "imp") : "") +
      "</div>";
  }

  // 分组筛选切换
  Array.prototype.forEach.call($("viewMarks").querySelectorAll("[data-mfilter]"), function (b) {
    b.addEventListener("click", function () {
      state.marksFilter = b.getAttribute("data-mfilter");
      renderMarksView();
      renderBreadcrumb();
    });
  });

  // 事件绑定：查看详情 / 移除
  Array.prototype.forEach.call($("viewMarks").querySelectorAll("[data-mact]"), function (el) {
    el.addEventListener("click", function (e) {
      e.stopPropagation();
      var id = el.getAttribute("data-mid");
      var act = el.getAttribute("data-mact");
      if (act === "open") {
        var hit = findEventAnywhere(id);
        if (!hit) return;
        selectCompany(hit.co);
        openDrawer(id);
      } else if (act === "unfav") {
        toggleFav(id);
        renderMarksView();
      } else if (act === "unimp") {
        toggleImp(id);
        renderMarksView();
      }
    });
  });
}

function marksSection(title, ids, kind) {
  if (ids.length === 0) {
    return "<div class='marks-sec'><div class='marks-sec-title'>" + title + "</div>" +
      "<div class='marks-none'>暂无记录</div></div>";
  }
  // 按时间倒序
  var rows = ids.map(function (id) { return findEventAnywhere(id); })
    .filter(function (h) { return !!h; })
    .sort(function (a, b) { return parseTime(b.ev.time) - parseTime(a.ev.time); });

  var html = "<div class='marks-sec'><div class='marks-sec-title'>" + title +
    "<span class='marks-sec-count'>" + rows.length + "</span></div>";
  rows.forEach(function (h) {
    var ev = h.ev;
    var co = findCompany(h.co);
    var tm = TYPE_META[ev.type];
    var im = IMPACT_META[ev.imp];
    html +=
      "<div class='mark-card' data-mact='open' data-mid='" + ev.id + "'>" +
        "<div class='mark-main'>" +
          "<div class='mark-meta'>" +
            "<span class='mark-co'>" + (co ? co.name : h.co) + "</span>" +
            "<span class='tl-time'>" + ev.time + "</span>" +
            "<span class='type-badge " + tm.cls + "'>" + tm.label + "</span>" +
            "<span class='impact-badge " + im.cls + "'>" + im.label + "</span>" +
          "</div>" +
          "<div class='mark-title'>" + ev.title + "</div>" +
          "<div class='mark-brief'>" + ev.brief + "</div>" +
        "</div>" +
        "<div class='mark-side'>" +
          (kind === "fav"
            ? "<button class='act-btn' data-mact='unfav' data-mid='" + ev.id + "'>✕ 取消收藏</button>"
            : "<button class='act-btn' data-mact='unimp' data-mid='" + ev.id + "'>✕ 取消标记</button>") +
          "<button class='act-btn' data-mact='open' data-mid='" + ev.id + "'>详情 →</button>" +
        "</div>" +
      "</div>";
  });
  return html + "</div>";
}

/* ================= 详情抽屉 ================= */

function openDrawer(id) {
  var ev = findEvent(id);
  if (!ev) return;
  state.currentDetail = id;

  var tm = TYPE_META[ev.type];
  var im = IMPACT_META[ev.imp];

  var dType = $("dType");
  dType.textContent = tm.label;
  dType.className = "type-badge " + tm.cls;

  var dImpact = $("dImpact");
  dImpact.textContent = im.label + (ev.lv === "high" ? " · 高重要性" : "");
  dImpact.className = "impact-badge " + im.cls;

  $("dTime").textContent = ev.time;
  $("dTitle").textContent = ev.title;
  $("dSummary").textContent = ev.sum;
  $("dSourceName").textContent = ev.src.n;
  $("dSourceType").textContent = ev.src.t + " · 数据更新 " + UPDATE_TIME;
  $("dSourceLink").href = ev.src.u;

  $("dTags").innerHTML = ev.tags.map(function (t) {
    return "<span class='d-tag'># " + t + "</span>";
  }).join("");

  syncDrawerBtns();
  $("drawerMask").classList.add("open");
  $("drawer").classList.add("open");
}

function syncDrawerBtns() {
  var id = state.currentDetail;
  if (!id) return;
  var faved = !!state.favs[id];
  var imped = !!state.imps[id];
  $("dFavBtn").classList.toggle("faved", faved);
  $("dFavBtn").textContent = faved ? "★ 已收藏" : "☆ 收藏";
  $("dImpBtn").classList.toggle("imped", imped);
  $("dImpBtn").textContent = imped ? "⚑ 已标重要" : "⚑ 标记重要";
}

function closeDrawer() {
  $("drawerMask").classList.remove("open");
  $("drawer").classList.remove("open");
  state.currentDetail = null;
}

function switchTab(tab) {
  state.tab = tab;
  renderTabs();
}

/* ================= 事件绑定 ================= */

// Timeline 面板委托（按钮 / 详情）
$("panel-timeline").addEventListener("click", function (e) {
  var actEl = e.target.closest("[data-act]");
  if (!actEl) return;
  var card = e.target.closest(".tl-card");
  if (!card) return;
  var id = card.getAttribute("data-id");
  var act = actEl.getAttribute("data-act");
  if (act === "fav") toggleFav(id, actEl);
  else if (act === "imp") toggleImp(id, actEl);
  else if (act === "detail") openDrawer(id);
});

// 财报与公告 → 定位到 Timeline 事件
$("panel-filings").addEventListener("click", function (e) {
  var j = e.target.closest("[data-evjump]");
  if (!j) return;
  e.preventDefault();
  switchTab("timeline");
  openDrawer(j.getAttribute("data-evjump"));
});

// 标签页
$("tabsNav").addEventListener("click", function (e) {
  var b = e.target.closest(".tab-btn");
  if (b) switchTab(b.getAttribute("data-tab"));
});

// 抽屉
$("drawerClose").addEventListener("click", closeDrawer);
$("drawerMask").addEventListener("click", closeDrawer);
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") closeDrawer();
});

$("dFavBtn").addEventListener("click", function () {
  if (!state.currentDetail) return;
  toggleFav(state.currentDetail, this);
  syncDrawerBtns();
  renderTimelinePanel();
});

$("dImpBtn").addEventListener("click", function () {
  if (!state.currentDetail) return;
  toggleImp(state.currentDetail, this);
  syncDrawerBtns();
  renderTimelinePanel();
});

// 跳转关联数据模块
$("dJump").addEventListener("click", function () {
  var ev = findEvent(state.currentDetail);
  if (!ev) return;
  var tab = TYPE_META[ev.type].tab;
  closeDrawer();
  switchTab(tab);
  showToast("已跳转至「" + document.querySelector("[data-tab='" + tab + "']").textContent + "」模块", "info");
});

// 搜索
$("searchInput").addEventListener("input", renderSearchResults);
$("searchInput").addEventListener("focus", renderSearchResults);
$("searchInput").addEventListener("blur", function () {
  setTimeout(function () { $("searchDropdown").classList.remove("open"); }, 150);
});
$("searchInput").addEventListener("keydown", function (e) {
  if (e.key !== "Enter") return;
  var q = this.value.trim();
  if (!q) return;
  var list = DIRECTORY.filter(function (c) {
    if (state.marketFilter !== "ALL" && c.market !== state.marketFilter) return false;
    return matchCompany(c, q);
  });
  if (list.length > 0) selectCompany(list[0].id);
  else showToast("未找到「" + q + "」对应的公司", "info");
});

// 品牌回首页
$("brandHome").addEventListener("click", goHome);

// 我的收藏 / 标记重要入口
$("marksEntry").addEventListener("click", function () { goMarks("fav"); });
$("impEntry").addEventListener("click", function () { goMarks("imp"); });

/* ================= 初始化 ================= */

renderMarketChips();
renderHome();
initQuoteSnapshots();
updateMarksCount();

})();
