/* ============================================================
   脉络 V2 · 数据层（全部模拟数据）
   常量 / 公司档案 / Timeline 事件 / 市场目录 / 种子与展开器
   顶层 var 为全局变量，供 mailuo-v2.app.js 使用
   ============================================================ */

function hashStr(s) {
  var x = 0;
  for (var i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) % 9973;
  return x;
}

/* ================= 常量 ================= */

var TYPE_META = {
  earnings:    { label: "财报",     icon: "▤", color: "#2a4d85", cls: "t-earnings",    tab: "filings" },
  announce:    { label: "公告",     icon: "▣", color: "#2c6e74", cls: "t-announce",    tab: "filings" },
  holder:      { label: "股东变动", icon: "♟", color: "#9a6b1f", cls: "t-holder",      tab: "holders" },
  institution: { label: "机构持仓", icon: "▦", color: "#4a3d78", cls: "t-institution", tab: "holders" },
  price:       { label: "行情异动", icon: "↯", color: "#a8433f", cls: "t-price",       tab: "valuation" },
  news:        { label: "新闻",     icon: "◉", color: "#64707f", cls: "t-news",        tab: "timeline" },
  report:      { label: "研报",     icon: "▥", color: "#2f7d5b", cls: "t-report",      tab: "compare" },
  macro:       { label: "宏观",     icon: "◈", color: "#5a4d8a", cls: "t-macro",       tab: "timeline" },
  industry:    { label: "行业",     icon: "⌬", color: "#2c5f7c", cls: "t-industry",    tab: "compare" }
};

var IMPACT_META = {
  pos: { label: "偏利好", cls: "impact-pos" },
  neg: { label: "偏利空", cls: "impact-neg" },
  neu: { label: "中性",   cls: "impact-neu" }
};

var MARKETS = {
  CN: { label: "中国大陆", cls: "mkt-CN", currency: "CNY", curSym: "¥" },
  US: { label: "美国",     cls: "mkt-US", currency: "USD", curSym: "$" },
  HK: { label: "香港",     cls: "mkt-HK", currency: "HKD", curSym: "HK$" },
  KR: { label: "韩国",     cls: "mkt-KR", currency: "KRW", curSym: "₩" }
};

var DATA_SOURCE = "模拟数据源 · MockData Provider（原型演示，非真实行情）";
var UPDATE_TIME = "2026-08-02 16:00 (UTC+8)";

/* ================= 公司档案数据 ================= */

var COMPANIES = [
  {
    id: "catl", name: "宁德时代", nameEn: "CATL", code: "300750.SZ", market: "CN",
    industry: "动力电池 / 新能源", aliases: ["ningdeshidai", "catl", "300750", "宁德"],
    price: "268.50", chgPct: "+2.35%", chgDir: "up",
    marketCap: "¥1.18 万亿", volume: "4,215 万股", turnover: "¥112.6 亿",
    high52: "289.00", low52: "152.30",
    valuation: { "PE (TTM)": "21.8", "PB": "4.6", "PS (TTM)": "2.9", "股息率": "1.9%", "EV/EBITDA": "13.5", "PEG": "0.8" },
    financials: {
      "营业收入 (TTM)": "¥4,021 亿", "净利润 (TTM)": "¥542 亿", "毛利率": "26.8%", "净利率": "13.5%",
      "EPS (TTM)": "¥12.32", "ROE": "21.4%", "ROA": "9.8%", "经营现金流": "¥986 亿", "资产负债率": "62.3%"
    },
    history: {
      years: ["2022", "2023", "2024", "2025"],
      revenue: [3286, 4009, 3620, 3980], profit: [307, 441, 507, 553]
    },
    peers: [
      { name: "比亚迪", code: "002594.SZ", market: "CN", pe: "18.2", pb: "3.9", roe: "19.8%", cap: "¥8,940 亿" },
      { name: "LG新能源", code: "373220.KS", market: "KR", pe: "32.5", pb: "1.8", roe: "6.2%", cap: "₩68.4 万亿" },
      { name: "亿纬锂能", code: "300014.SZ", market: "CN", pe: "24.1", pb: "2.7", roe: "11.5%", cap: "¥1,120 亿" }
    ],
    shareholders: [
      { name: "曾毓群（实际控制人）", pct: "23.3%", change: "0", dir: "neu" },
      { name: "香港中央结算（北向资金）", pct: "11.8%", change: "+0.6pct", dir: "pos" },
      { name: "黄世霖", pct: "10.6%", change: "0", dir: "neu" },
      { name: "宁波联合创新新能源", pct: "6.8%", change: "-0.2pct", dir: "neg" },
      { name: "李平", pct: "4.6%", change: "0", dir: "neu" }
    ],
    inst: { count: "1,284 家", pct: "34.2%", change: "+2.1pct 季度环比", dir: "pos" },
    mgmtPct: "38.5%", lockup: "下一次大规模解禁：2027-06-11，约 2.1 亿股（占总股本 4.8%）"
  },
  {
    id: "moutai", name: "贵州茅台", nameEn: "Kweichow Moutai", code: "600519.SH", market: "CN",
    industry: "白酒 / 消费品", aliases: ["guizhoumaotai", "maotai", "moutai", "600519", "茅台"],
    price: "1,486.00", chgPct: "-0.82%", chgDir: "down",
    marketCap: "¥1.87 万亿", volume: "312 万股", turnover: "¥46.4 亿",
    high52: "1,798.00", low52: "1,245.00",
    valuation: { "PE (TTM)": "22.4", "PB": "8.1", "PS (TTM)": "10.6", "股息率": "3.4%", "EV/EBITDA": "15.2", "PEG": "1.6" },
    financials: {
      "营业收入 (TTM)": "¥1,762 亿", "净利润 (TTM)": "¥834 亿", "毛利率": "91.9%", "净利率": "47.3%",
      "EPS (TTM)": "¥66.42", "ROE": "34.6%", "ROA": "26.1%", "经营现金流": "¥912 亿", "资产负债率": "18.4%"
    },
    history: {
      years: ["2022", "2023", "2024", "2025"],
      revenue: [1276, 1506, 1741, 1902], profit: [627, 747, 862, 934]
    },
    peers: [
      { name: "五粮液", code: "000858.SZ", market: "CN", pe: "15.8", pb: "3.6", roe: "22.9%", cap: "¥5,120 亿" },
      { name: "泸州老窖", code: "000568.SZ", market: "CN", pe: "14.2", pb: "4.1", roe: "28.7%", cap: "¥2,260 亿" },
      { name: "山西汾酒", code: "600809.SH", market: "CN", pe: "17.5", pb: "5.2", roe: "31.2%", cap: "¥2,480 亿" }
    ],
    shareholders: [
      { name: "中国贵州茅台酒厂（集团）", pct: "54.1%", change: "0", dir: "neu" },
      { name: "香港中央结算（北向资金）", pct: "6.9%", change: "-0.4pct", dir: "neg" },
      { name: "贵州省国有资本运营", pct: "4.5%", change: "0", dir: "neu" },
      { name: "中国证券金融", pct: "1.8%", change: "0", dir: "neu" },
      { name: "中央汇金资产管理", pct: "0.9%", change: "0", dir: "neu" }
    ],
    inst: { count: "1,842 家", pct: "22.6%", change: "-0.8pct 季度环比", dir: "neg" },
    mgmtPct: "0.02%", lockup: "国资控股，近 12 个月无大规模解禁安排"
  },
  {
    id: "tsla", name: "特斯拉", nameEn: "Tesla, Inc.", code: "TSLA", market: "US",
    industry: "电动汽车 / 自动驾驶", aliases: ["tesla", "tsla", "tesila", "特斯拉"],
    price: "248.60", chgPct: "+3.12%", chgDir: "up",
    marketCap: "$7,950 亿", volume: "9,820 万股", turnover: "$244.1 亿",
    high52: "299.30", low52: "167.40",
    valuation: { "PE (TTM)": "62.8", "PB": "9.4", "PS (TTM)": "7.9", "股息率": "—", "EV/EBITDA": "41.6", "PEG": "2.4" },
    financials: {
      "营业收入 (TTM)": "$1,006 亿", "净利润 (TTM)": "$126 亿", "毛利率": "18.2%", "净利率": "12.5%",
      "EPS (TTM)": "$3.96", "ROE": "15.8%", "ROA": "8.4%", "经营现金流": "$152 亿", "资产负债率": "41.2%"
    },
    history: {
      years: ["2022", "2023", "2024", "2025"],
      revenue: [815, 968, 977, 1042], profit: [126, 150, 71, 118]
    },
    peers: [
      { name: "丰田汽车", code: "TM", market: "US", pe: "8.4", pb: "1.2", roe: "13.6%", cap: "$2,860 亿" },
      { name: "比亚迪", code: "002594.SZ", market: "CN", pe: "18.2", pb: "3.9", roe: "19.8%", cap: "¥8,940 亿" },
      { name: "Rivian", code: "RIVN", market: "US", pe: "亏损", pb: "2.1", roe: "-38.2%", cap: "$148 亿" }
    ],
    shareholders: [
      { name: "Elon Musk（CEO）", pct: "12.9%", change: "-0.3pct", dir: "neg" },
      { name: "Vanguard Group", pct: "7.6%", change: "+0.2pct", dir: "pos" },
      { name: "BlackRock", pct: "5.9%", change: "+0.1pct", dir: "pos" },
      { name: "State Street", pct: "3.4%", change: "0", dir: "neu" },
      { name: "Geode Capital", pct: "1.9%", change: "0", dir: "neu" }
    ],
    inst: { count: "3,412 家", pct: "46.8%", change: "+1.4pct 季度环比", dir: "pos" },
    mgmtPct: "13.4%", lockup: "美股无锁定期概念；关注高管 10b5-1 减持计划披露"
  },
  {
    id: "tencent", name: "腾讯控股", nameEn: "Tencent Holdings", code: "0700.HK", market: "HK",
    industry: "互联网 / 游戏与社交", aliases: ["tencent", "tengxun", "0700", "700", "腾讯"],
    price: "512.00", chgPct: "+1.05%", chgDir: "up",
    marketCap: "HK$4.70 万亿", volume: "2,140 万股", turnover: "HK$109.2 亿",
    high52: "548.00", low52: "362.40",
    valuation: { "PE (TTM)": "19.6", "PB": "3.8", "PS (TTM)": "5.4", "股息率": "0.9%", "EV/EBITDA": "14.8", "PEG": "1.2" },
    financials: {
      "营业收入 (TTM)": "¥7,102 亿", "净利润 (TTM)": "¥1,986 亿", "毛利率": "52.8%", "净利率": "28.0%",
      "EPS (TTM)": "HK$26.12", "ROE": "19.4%", "ROA": "12.6%", "经营现金流": "¥2,420 亿", "资产负债率": "38.6%"
    },
    history: {
      years: ["2022", "2023", "2024", "2025"],
      revenue: [5546, 6090, 6603, 7280], profit: [1156, 1180, 1580, 1940]
    },
    peers: [
      { name: "阿里巴巴", code: "9988.HK", market: "HK", pe: "16.8", pb: "2.4", roe: "11.8%", cap: "HK$2.1 万亿" },
      { name: "网易", code: "9999.HK", market: "HK", pe: "14.2", pb: "3.1", roe: "22.4%", cap: "HK$5,860 亿" },
      { name: "美团", code: "3690.HK", market: "HK", pe: "24.6", pb: "4.2", roe: "16.9%", cap: "HK$7,420 亿" }
    ],
    shareholders: [
      { name: "Prosus / Naspers", pct: "24.9%", change: "-0.4pct", dir: "neg" },
      { name: "马化腾（董事会主席）", pct: "8.4%", change: "0", dir: "neu" },
      { name: "香港中央结算（南向资金）", pct: "9.8%", change: "+0.7pct", dir: "pos" },
      { name: "Vanguard Group", pct: "2.6%", change: "+0.1pct", dir: "pos" },
      { name: "BlackRock", pct: "2.2%", change: "0", dir: "neu" }
    ],
    inst: { count: "2,186 家", pct: "52.4%", change: "+1.8pct 季度环比", dir: "pos" },
    mgmtPct: "8.6%", lockup: "港股无锁定期概念；关注大股东 Prosus 长期减持计划"
  },
  {
    id: "samsung", name: "三星电子", nameEn: "Samsung Electronics", code: "005930.KS", market: "KR",
    industry: "半导体 / 消费电子", aliases: ["samsung", "sanxing", "005930", "三星"],
    price: "68,500", chgPct: "-1.20%", chgDir: "down",
    marketCap: "₩408.7 万亿", volume: "1,846 万股", turnover: "₩1.26 万亿",
    high52: "86,200", low52: "53,800",
    valuation: { "PE (TTM)": "12.4", "PB": "1.3", "PS (TTM)": "1.3", "股息率": "2.6%", "EV/EBITDA": "5.8", "PEG": "0.9" },
    financials: {
      "营业收入 (TTM)": "₩318.2 万亿", "净利润 (TTM)": "₩32.9 万亿", "毛利率": "36.4%", "净利率": "10.3%",
      "EPS (TTM)": "₩5,522", "ROE": "10.8%", "ROA": "7.9%", "经营现金流": "₩58.4 万亿", "资产负债率": "27.5%"
    },
    history: {
      years: ["2022", "2023", "2024", "2025"],
      revenue: [302, 259, 301, 326], profit: [55.5, 15.5, 34.5, 39.8]
    },
    peers: [
      { name: "SK海力士", code: "000660.KS", market: "KR", pe: "9.8", pb: "2.6", roe: "28.4%", cap: "₩168.2 万亿" },
      { name: "台积电", code: "TSM", market: "US", pe: "24.6", pb: "6.8", roe: "27.2%", cap: "$9,860 亿" },
      { name: "美光科技", code: "MU", market: "US", pe: "11.2", pb: "2.2", roe: "19.6%", cap: "$1,240 亿" }
    ],
    shareholders: [
      { name: "三星物产等关联方合计", pct: "21.2%", change: "0", dir: "neu" },
      { name: "韩国国民年金公团", pct: "8.1%", change: "-0.2pct", dir: "neg" },
      { name: "外资合计（托管行口径）", pct: "51.8%", change: "+0.9pct", dir: "pos" },
      { name: "BlackRock", pct: "5.0%", change: "+0.1pct", dir: "pos" },
      { name: "三星生命保险", pct: "3.1%", change: "0", dir: "neu" }
    ],
    inst: { count: "1,968 家", pct: "56.3%", change: "+0.9pct 季度环比", dir: "pos" },
    mgmtPct: "21.2%（家族及关联方）", lockup: "韩股无锁定期概念；关注遗产税相关家族持股变动"
  }
];

/* ================= Timeline 事件数据 =================
   字段: type 类型 / lv 重要性(high|normal) / imp 影响(pos|neg|neu)
   time 时间 / title 标题 / brief 摘要(卡片) / sum 摘要(详情) / src 来源 / tags 标签 */

var EVENTS = {
catl: [
  { id:"c01", type:"earnings", lv:"high", imp:"pos", time:"2026-07-28 19:30",
    title:"2026 中报：净利润 305 亿元同比 +28%，储能收入翻倍",
    brief:"上半年营收 ¥1,892 亿 (+16%)，归母净利润 ¥305 亿 (+28%)；储能收入 ¥412 亿 (+103%)，毛利率 26.8% 环比 +1.5pct，全年出货指引上调至 580GWh。",
    sum:"宁德时代发布 2026 年半年度报告：上半年实现营业收入 1,892 亿元，同比 +16%；归母净利润 305 亿元，同比 +28%，超出市场一致预期约 5%。储能电池收入 412 亿元，同比 +103%，成为第二增长曲线。综合毛利率 26.8%，环比提升 1.5pct，主要受益于碳酸锂成本下行与神行 Pro 电池放量。管理层在业绩会上将全年出货指引由 540GWh 上调至 580GWh。",
    src:{ n:"宁德时代 2026 年半年度报告", t:"公司公告 · 巨潮资讯", u:"https://www.cninfo.com.cn" },
    tags:["中报","储能","毛利率","出货指引"] },
  { id:"c02", type:"price", lv:"normal", imp:"pos", time:"2026-07-29 10:24",
    title:"盘中涨逾 5% 创 52 周新高，成交额突破 150 亿元",
    brief:"中报超预期催化，股价盘中最高触及 ¥282.40 (+5.2%) 创 52 周新高，半日成交额 ¥152 亿，北向资金净买入 8.6 亿元。",
    sum:"受中报业绩超预期催化，宁德时代 7 月 29 日高开高走，盘中最高触及 282.40 元，涨幅 5.2%，创 52 周新高；半日成交额 152 亿元，为近三个月最大。沪深港通数据显示北向资金当日净买入 8.6 亿元，融资余额同步上升 3.2%。",
    src:{ n:"深交所行情数据 / 沪深港通", t:"交易所数据", u:"https://www.szse.cn" },
    tags:["52周新高","北向资金","成交额"] },
  { id:"c03", type:"announce", lv:"high", imp:"pos", time:"2026-07-22 08:15",
    title:"公告：匈牙利工厂二期投产，欧洲本地化产能达 60GWh",
    brief:"匈牙利德布勒森基地二期投产，新增 28GWh，欧洲总产能 60GWh，配套奔驰、宝马长单，2027 年欧洲收入占比预计达 25%。",
    sum:"公司公告匈牙利德布勒森基地二期产线正式投产，新增产能 28GWh，欧洲总产能提升至 60GWh。基地主要配套奔驰、宝马与 Stellantis 的长期订单，本地化交付可规避欧盟碳关税与本地化率要求，预计 2027 年欧洲收入占比将提升至 25%。",
    src:{ n:"宁德时代海外产能进展公告", t:"深交所公告", u:"https://www.szse.cn" },
    tags:["欧洲产能","出海","匈牙利基地"] },
  { id:"c04", type:"holder", lv:"normal", imp:"pos", time:"2026-07-20 17:00",
    title:"北向资金连续 5 日增持，持股比例升至 11.8%",
    brief:"香港中央结算持股比例由 11.2% 升至 11.8%，单周增持约 2,600 万股；公司前十大股东其余席位无变动。",
    sum:"沪深港通持股数据显示，北向资金连续 5 个交易日净增持宁德时代，香港中央结算（陆股通）持股比例由 11.2% 升至 11.8%，累计增持约 2,600 万股，对应市值约 68 亿元。公司其余前十大股东本期持股无变动。",
    src:{ n:"香港交易所中央结算系统", t:"交易所持股数据", u:"https://www.hkex.com.hk" },
    tags:["北向资金","股东持股","增持"] },
  { id:"c05", type:"institution", lv:"normal", imp:"pos", time:"2026-07-18 16:30",
    title:"Q2 机构持仓：公募重仓比例 +2.1pct，重回第一大重仓股",
    brief:"二季度末 1,284 家机构合计持股 34.2%，环比 +2.1pct；公募基金重仓市值重回全市场第一。",
    sum:"基金二季报披露完毕，宁德时代二季度末获 1,284 家机构合计持股 34.2%，环比提升 2.1pct；公募基金重仓持有市值达 1,420 亿元，超越贵州茅台重回全市场第一大重仓股。主动权益基金加仓幅度居新能源板块首位。",
    src:{ n:"Wind 机构持仓统计（模拟）", t:"数据供应商", u:"https://www.wind.com.cn" },
    tags:["机构持仓","公募重仓","加仓"] },
  { id:"c06", type:"report", lv:"normal", imp:"pos", time:"2026-07-18 10:00",
    title:"中金研报：上调目标价至 ¥320，储能业务估值体系重构",
    brief:"中金认为储能应按类公用事业估值，单独给予 25x PE，目标价上调至 ¥320，维持“跑赢行业”评级。",
    sum:"中金公司发布深度报告，认为市场仍按制造业逻辑定价宁德时代，忽视其储能系统集成的类公用事业属性。报告将储能业务单独给予 25x PE 估值，上调 12 个月目标价至 320 元，对应 2027 年 22 倍市盈率，维持“跑赢行业”评级。",
    src:{ n:"中金公司研究部", t:"券商研报", u:"https://www.cicc.com" },
    tags:["目标价","储能估值","中金"] },
  { id:"c07", type:"macro", lv:"high", imp:"neg", time:"2026-07-15 09:45",
    title:"欧盟对华电动车反补贴税终裁落地，平均税率 21.3%",
    brief:"欧盟终裁平均税率 21.3%，短期压制电池出口预期；中长期利好已有欧洲本地产能的头部厂商。",
    sum:"欧盟委员会公布对华电动车反补贴税终裁结果，平均税率 21.3%。虽然直接征税对象为整车，但市场担忧欧盟后续将本地化要求延伸至电池环节，短期对动力电池直接出口形成压制；中长期看，已在欧洲建成 60GWh 本地产能的宁德时代反而具备相对优势。",
    src:{ n:"欧盟委员会官方公报", t:"监管机构", u:"https://ec.europa.eu" },
    tags:["欧盟关税","反补贴","本地化"] },
  { id:"c08", type:"industry", lv:"normal", imp:"neu", time:"2026-07-10 14:20",
    title:"碳酸锂期货跌破 9.5 万元/吨，创近三年新低",
    brief:"碳酸锂年内 -18%：成本下行改善电池厂盈利，但引发行业需求增速担忧。",
    sum:"广期所碳酸锂主力合约盘中跌破 9.5 万元/吨，年内跌幅扩大至 18%。上游锂盐厂减产挺价，但盐湖提锂新增供给持续释放。对电池厂而言，原材料成本下行改善盈利，但也引发市场对行业需求增速的担忧。",
    src:{ n:"财新网", t:"财经媒体", u:"https://www.caixin.com" },
    tags:["碳酸锂","原材料","成本"] },
  { id:"c09", type:"news", lv:"normal", imp:"pos", time:"2026-06-19 11:05",
    title:"与特斯拉续约：2027-2030 年北美储能电芯长单约 120GWh",
    brief:"签署 2027-2030 储能电芯框架协议约 120GWh，配套 Megapack，采用技术授权+电芯供应混合模式规避 IRA 限制。",
    sum:"据外媒报道，宁德时代与特斯拉签署 2027-2030 年储能电芯供应框架协议，供应规模约 120GWh，主要配套 Megapack 产线。协议采用技术授权+电芯供应的混合模式，规避美国 IRA 法案对 FEOC（受关注外国实体）的限制。",
    src:{ n:"路透社", t:"国际媒体", u:"https://www.reuters.com" },
    tags:["特斯拉","储能长单","IRA"] },
  { id:"c10", type:"announce", lv:"normal", imp:"neu", time:"2026-06-27 18:00",
    title:"公告：拟发行不超过 50 亿元绿色公司债，投向换电网络",
    brief:"募集资金投向“骐骥换电”扩建与电池银行运营；已建成换电站 1,200 座，2027 年底目标 3,000 座。",
    sum:"公司拟发行绿色公司债券不超过 50 亿元，期限 5 年，募集资金主要投向“骐骥换电”网络扩建及电池银行运营。截至 6 月底，公司已建成换电站 1,200 座，计划 2027 年底达到 3,000 座。",
    src:{ n:"宁德时代董事会公告", t:"深交所公告", u:"https://www.szse.cn" },
    tags:["绿色债券","换电","融资"] },
  { id:"c11", type:"industry", lv:"normal", imp:"pos", time:"2026-06-12 09:30",
    title:"5 月新能源渗透率首破 55%，以旧换新政策延续至 2027 年",
    brief:"中汽协：5 月渗透率 55.3%；全年新能源车销量预期 1,550 万辆 (+22%)，支撑动力电池需求。",
    sum:"中汽协数据显示，5 月国内新能源汽车零售渗透率达 55.3%，首次突破 55% 关口。发改委表示汽车以旧换新补贴资金已使用过半，政策将延续至 2027 年，预计全年新能源车销量 1,550 万辆，同比 +22%，对动力电池需求形成坚实支撑。",
    src:{ n:"中汽协 / 国家发改委", t:"行业数据 / 监管机构", u:"http://www.caam.org.cn" },
    tags:["渗透率","以旧换新","需求"] },
  { id:"c12", type:"report", lv:"normal", imp:"neg", time:"2026-05-30 15:40",
    title:"摩根士丹利：警惕储能价格战，下调行业盈利预测 8%",
    brief:"储能中标价降至 0.62 元/Wh (-35%)，大摩下调行业盈利预测 8%，但强调宁德盈利韧性强于同业，维持增持。",
    sum:"摩根士丹利报告指出，国内储能系统集成中标价格已降至 0.62 元/Wh，同比下跌 35%，行业进入微利竞争阶段。报告下调 2027 年全行业储能业务盈利预测 8%，但强调宁德时代凭借直流侧系统能力与海外订单结构，盈利韧性显著强于同业，维持“增持”评级。",
    src:{ n:"Morgan Stanley Research", t:"外资研报", u:"https://www.morganstanley.com" },
    tags:["储能价格战","盈利预测","大摩"] }
],
moutai: [
  { id:"m01", type:"earnings", lv:"high", imp:"pos", time:"2026-07-31 19:00",
    title:"2026 中报：营收 ¥910 亿 (+9.8%)，系列酒增速放缓引关注",
    brief:"上半年营收 ¥910 亿 (+9.8%)，净利润 ¥468 亿 (+11.2%)；茅台酒稳健，系列酒增速降至 +4%，预收账款环比 +12%。",
    sum:"贵州茅台发布 2026 年中报：上半年实现营业收入 910 亿元，同比 +9.8%；归母净利润 468 亿元，同比 +11.2%。茅台酒收入 782 亿元 (+11.5%)，保持双位数增长；系列酒收入 128 亿元 (+4.0%)，增速明显放缓。合同负债（预收款）环比增长 12%，渠道打款意愿仍强。",
    src:{ n:"贵州茅台 2026 年半年度报告", t:"公司公告 · 巨潮资讯", u:"https://www.cninfo.com.cn" },
    tags:["中报","系列酒","预收款"] },
  { id:"m02", type:"announce", lv:"high", imp:"pos", time:"2026-07-25 18:30",
    title:"公告：2025 年度分红每 10 股派 276.24 元，分红率 75%",
    brief:"合计派现约 ¥347 亿，分红率维持 75%；同时公告 2026-2028 年分红回报规划，承诺分红率不低于 75%。",
    sum:"公司公告 2025 年度利润分配方案：每 10 股派发现金红利 276.24 元（含税），合计派现约 347 亿元，分红率 75%。同时发布 2026-2028 年股东回报规划，承诺每年现金分红比例不低于当年归母净利润的 75%，强化高股息属性。",
    src:{ n:"贵州茅台分红公告", t:"上交所公告", u:"https://www.sse.com.cn" },
    tags:["分红","股东回报","高股息"] },
  { id:"m03", type:"price", lv:"normal", imp:"neg", time:"2026-07-22 14:05",
    title:"盘中跌破 ¥1,450 创近 8 个月新低，白酒板块集体走弱",
    brief:"批价下行担忧发酵，股价盘中最低 ¥1,442 (-3.8%)；北向资金当日净卖出 5.2 亿元。",
    sum:"受飞天茅台批价跌破 2,100 元/瓶的市场传闻影响，白酒板块集体走弱，贵州茅台盘中最低触及 1,442 元，跌幅 3.8%，创近 8 个月新低。北向资金当日净卖出 5.2 亿元。公司盘后回应：目前渠道库存良性，批价波动在合理区间。",
    src:{ n:"上交所行情数据", t:"交易所数据", u:"https://www.sse.com.cn" },
    tags:["批价","北向资金","板块调整"] },
  { id:"m04", type:"holder", lv:"normal", imp:"neg", time:"2026-07-15 17:20",
    title:"北向资金持股比例降至 6.9%，连续 3 周净减持",
    brief:"香港中央结算持股由 7.3% 降至 6.9%，三周累计减持约 500 万股；集团及国资股东持股无变动。",
    sum:"沪深港通数据显示，北向资金连续 3 周净减持贵州茅台，香港中央结算（陆股通）持股比例由 7.3% 降至 6.9%，累计减持约 500 万股。茅台集团及贵州省国资股东持股无变动，股权结构保持稳定。",
    src:{ n:"香港交易所中央结算系统", t:"交易所持股数据", u:"https://www.hkex.com.hk" },
    tags:["北向资金","减持","股东持股"] },
  { id:"m05", type:"industry", lv:"high", imp:"neg", time:"2026-07-08 10:30",
    title:"飞天茅台批价跌破 2,100 元，渠道去库存周期拉长",
    brief:"散瓶批价降至 2,080 元/瓶，年内 -12%；经销商库存周转升至 2.5 个月，行业进入深度调整期。",
    sum:"第三方报价平台显示，53 度飞天茅台散瓶批价跌破 2,100 元/瓶至 2,080 元，年内下跌 12%。经销商调研显示渠道库存周转天数升至 2.5 个月，为 2016 年以来高位。行业分析认为白酒正进入深度调整期，高端酒价格体系重构将影响板块估值中枢。",
    src:{ n:"今日酒价 / 酒业家", t:"行业数据平台", u:"https://www.jiushuizhijia.com" },
    tags:["批价","渠道库存","行业调整"] },
  { id:"m06", type:"report", lv:"normal", imp:"neu", time:"2026-06-30 09:00",
    title:"中信证券：下调目标价至 ¥1,700，等待批价企稳信号",
    brief:"中信认为短期批价承压但品牌护城河未变，下调目标价 8% 至 ¥1,700，维持“买入”，建议关注中秋动销。",
    sum:"中信证券食品饮料团队报告认为，茅台短期受批价下行与需求疲软压制，但品牌护城河与直销占比提升逻辑未变。下调目标价 8% 至 1,700 元，对应 2027 年 22 倍 PE，维持“买入”评级，建议跟踪中秋旺季动销与批价企稳信号。",
    src:{ n:"中信证券研究部", t:"券商研报", u:"https://www.citics.com" },
    tags:["目标价","批价","中信证券"] },
  { id:"m07", type:"institution", lv:"normal", imp:"neg", time:"2026-06-25 16:00",
    title:"Q2 机构持仓：主动权益基金减配白酒，重仓比例降至五年低位",
    brief:"公募基金白酒重仓比例降至 4.2%，为 2021 年以来最低；茅台机构持股比例 22.6%，环比 -0.8pct。",
    sum:"基金二季报显示，主动权益基金白酒板块重仓比例降至 4.2%，为 2021 年以来最低水平。贵州茅台机构持股比例 22.6%，环比下降 0.8pct，部分消费主题基金将仓位切换至高股息与科技板块。",
    src:{ n:"Wind 机构持仓统计（模拟）", t:"数据供应商", u:"https://www.wind.com.cn" },
    tags:["机构持仓","基金减配","白酒"] },
  { id:"m08", type:"news", lv:"normal", imp:"pos", time:"2026-06-12 20:00",
    title:"i 茅台数字营销平台 GMV 突破 ¥600 亿，直销占比升至 46%",
    brief:"i 茅台上半年 GMV ¥612 亿 (+18%)，直销渠道收入占比升至 46%，吨价提升逻辑持续兑现。",
    sum:"据公司披露及媒体测算，i 茅台数字营销平台上半年 GMV 达 612 亿元，同比 +18%；直销渠道收入占比升至 46%，较 2023 年提升 8pct。直销占比提升持续拉动吨价上行，成为茅台在批价波动期稳定盈利的关键抓手。",
    src:{ n:"证券时报", t:"财经媒体", u:"https://www.stcn.com" },
    tags:["i茅台","直销","渠道改革"] },
  { id:"m09", type:"macro", lv:"normal", imp:"neu", time:"2026-05-20 09:30",
    title:"4 月社零餐饮收入同比 +4.2%，商务宴请需求仍偏弱",
    brief:"社零数据：餐饮收入增速连续 3 个月低于 5%，高端白酒商务需求恢复慢于预期。",
    sum:"国家统计局数据：4 月社会消费品零售总额中餐饮收入同比 +4.2%，增速连续 3 个月低于 5%。机构调研显示商务宴请场景恢复慢于预期，高端白酒需求仍以礼赠与收藏为主，消费属性切换过程中估值逻辑面临重构。",
    src:{ n:"国家统计局", t:"官方数据", u:"https://www.stats.gov.cn" },
    tags:["社零","餐饮","需求"] },
  { id:"m10", type:"announce", lv:"normal", imp:"neu", time:"2026-05-09 18:00",
    title:"公告：选举新任董事，管理层平稳过渡",
    brief:"董事会补选 2 名董事并聘任新副总，分管生产与营销；公司治理结构保持稳定。",
    sum:"公司公告董事会补选 2 名董事，并聘任新任副总经理分管生产与营销体系。市场分析认为此次调整为常规管理层轮换，公司经营战略与渠道政策预计保持连续性。",
    src:{ n:"贵州茅台董事会公告", t:"上交所公告", u:"https://www.sse.com.cn" },
    tags:["管理层","公司治理"] },
  { id:"m11", type:"earnings", lv:"normal", imp:"pos", time:"2026-04-25 19:30",
    title:"一季报：Q1 净利润 ¥268 亿 (+12.6%)，开门红符合预期",
    brief:"Q1 营收 ¥514 亿 (+10.4%)，净利润 ¥268 亿 (+12.6%)；毛利率 92.1%，现金流健康。",
    sum:"2026 年一季报：营业收入 514 亿元，同比 +10.4%；归母净利润 268 亿元，同比 +12.6%，符合市场预期。毛利率 92.1%，同比 +0.2pct；经营活动现金流净额 302 亿元，渠道回款质量良好。",
    src:{ n:"贵州茅台 2026 年第一季度报告", t:"公司公告 · 巨潮资讯", u:"https://www.cninfo.com.cn" },
    tags:["一季报","毛利率","现金流"] },
  { id:"m12", type:"news", lv:"normal", imp:"pos", time:"2026-03-28 15:00",
    title:"茅台 1935 单品年营收突破 ¥150 亿，系列酒结构升级加速",
    brief:"茅台 1935 成为系列酒首个百亿大单品，带动系列酒吨价 +9%，千元价格带卡位成功。",
    sum:"年报经营数据显示，茅台 1935 单品年营收突破 150 亿元，成为系列酒首个百亿级大单品，带动系列酒整体吨价提升 9%。分析认为公司在千元价格带卡位成功，系列酒从“量的补充”转向“价的贡献”。",
    src:{ n:"上海证券报", t:"财经媒体", u:"https://www.cnstock.com" },
    tags:["茅台1935","系列酒","结构升级"] }
],
tsla: [
  { id:"t01", type:"earnings", lv:"high", imp:"pos", time:"2026-07-23 20:00",
    title:"Q2 财报：能源业务营收 +68% 创纪录，汽车毛利率回升至 17.8%",
    brief:"Q2 营收 $268 亿 (+12%)，能源发电与储能收入 $48 亿 (+68%)；汽车毛利率 17.8% 环比 +1.4pct，盘后涨 6%。",
    sum:"特斯拉发布 2026Q2 财报：营收 268 亿美元，同比 +12%；GAAP 净利润 32 亿美元。能源发电与储能业务收入 48 亿美元，同比 +68% 创单季纪录，Megapack 装机 11.2GWh。汽车业务毛利率 17.8%，环比回升 1.4pct，降价压力边际缓解。财报后股价盘后上涨 6%。",
    src:{ n:"Tesla Investor Relations (10-Q)", t:"公司财报 · SEC", u:"https://ir.tesla.com" },
    tags:["财报","储能","毛利率"] },
  { id:"t02", type:"price", lv:"normal", imp:"pos", time:"2026-07-24 21:30",
    title:"财报后跳空高开收涨 7.4%，成交量放大至日均 2.3 倍",
    brief:"股价收报 $252.10 (+7.4%)，成交 2.1 亿股为期权到期周最大；空头回补与能源业务重估共振。",
    sum:"财报超预期叠加管理层对 Robotaxi 进展的积极表态，特斯拉跳空高开，收盘 252.10 美元，涨 7.4%，成交量 2.1 亿股，为 20 日均量的 2.3 倍。期权市场数据显示看涨期权未平仓量创年内新高，空头回补明显。",
    src:{ n:"NASDAQ 行情数据", t:"交易所数据", u:"https://www.nasdaq.com" },
    tags:["财报行情","空头回补","成交量"] },
  { id:"t03", type:"news", lv:"high", imp:"pos", time:"2026-07-15 22:00",
    title:"Robotaxi 在奥斯汀扩大运营范围，无安全员测试获准",
    brief:"得州监管部门批准无安全员 Robotaxi 路测，运营区域扩大 3 倍；公司计划年底前进驻 5 个新城市。",
    sum:"特斯拉宣布 Robotaxi 服务在奥斯汀的运营范围扩大 3 倍，并获得得州监管部门批准开展无安全员随车测试。马斯克在社交平台表示，计划 2026 年底前将 Robotaxi 服务扩展至 5 个新城市。投行测算 Robotaxi 中期可贡献 20% 以上估值权重。",
    src:{ n:"彭博社", t:"国际媒体", u:"https://www.bloomberg.com" },
    tags:["Robotaxi","自动驾驶","监管"] },
  { id:"t04", type:"announce", lv:"normal", imp:"neu", time:"2026-07-08 21:00",
    title:"8-K 公告：得州超级工厂扩建获批，新增 4680 电池与储能产线",
    brief:"获批投资 $36 亿扩建得州工厂，新增 4680 电池产能 30GWh 与 Megapack 产线，2027 年投产。",
    sum:"特斯拉向 SEC 提交 8-K 文件并同步公告：得州超级工厂扩建项目获当地政府批准，总投资 36 亿美元，新增 4680 电池产能 30GWh 及 Megapack 组装产线，预计 2027 年陆续投产。",
    src:{ n:"Tesla 8-K 文件", t:"SEC 公告", u:"https://www.sec.gov" },
    tags:["4680电池","Megapack","产能扩张"] },
  { id:"t05", type:"holder", lv:"normal", imp:"neg", time:"2026-06-30 21:00",
    title:"Form 4：高管按 10b5-1 计划减持 120 万股，套现约 $2.9 亿",
    brief:"CFO 等 3 名高管按预设计划合计减持 120 万股；马斯克持股 12.9%，本期无变动。",
    sum:"SEC Form 4 文件显示，公司 CFO 等 3 名高管依据预先设定的 10b5-1 交易计划合计减持 120 万股，套现约 2.9 亿美元。此类减持属计划内操作，马斯克本人持股 12.9%，本期无变动。",
    src:{ n:"SEC Form 4 披露", t:"监管披露", u:"https://www.sec.gov" },
    tags:["高管减持","Form4","10b5-1"] },
  { id:"t06", type:"institution", lv:"normal", imp:"pos", time:"2026-06-28 16:00",
    title:"13F 季报：Vanguard 与 BlackRock 合计增持 1,800 万股",
    brief:"Q2 两大指数基金合计增持 1,800 万股；机构持股比例升至 46.8%，ARK 同期减仓 8%。",
    sum:"最新 13F 持仓报告显示，Vanguard 与 BlackRock 二季度合计增持特斯拉 1,800 万股，主要源于指数再平衡与科技股权重上调；机构整体持股比例升至 46.8%。与之相对，ARK 旗下基金减仓约 8%，主动资金分歧加大。",
    src:{ n:"SEC 13F 持仓报告（模拟汇总）", t:"监管披露", u:"https://www.sec.gov" },
    tags:["13F","机构持仓","指数基金"] },
  { id:"t07", type:"macro", lv:"normal", imp:"neg", time:"2026-06-18 02:00",
    title:"美联储暗示利率维持高位更久，高估值成长股承压",
    brief:"FOMC 点阵图显示年内降息次数预期由 3 次降至 2 次，纳指回调，特斯拉单日 -2.8%。",
    sum:"美联储 6 月会议点阵图显示，委员们预计年内降息次数由 3 次降至 2 次，利率将在高位维持更久。高估值成长股普遍承压，纳斯达克指数回调 1.5%，特斯拉单日下跌 2.8%。分析师指出其 60 倍以上 PE 对利率路径高度敏感。",
    src:{ n:"Federal Reserve / 华尔街日报", t:"央行公告 · 媒体", u:"https://www.federalreserve.gov" },
    tags:["美联储","利率","估值压力"] },
  { id:"t08", type:"industry", lv:"normal", imp:"neg", time:"2026-06-10 09:00",
    title:"美国 5 月电动车渗透率 11.2% 环比下滑，补贴退坡效应显现",
    brief:"IRA 部分车型补贴到期，5 月美国 EV 渗透率环比 -0.8pct；行业价格战延续，平均成交价 -4%。",
    sum:"行业数据显示，受 IRA 法案部分车型税收抵免到期影响，美国 5 月电动车渗透率 11.2%，环比下降 0.8pct。行业平均成交价同比下跌 4%，价格战延续。特斯拉 Model 3/Y 仍为销量前二，但份额被现代、通用新车型稀释。",
    src:{ n:"Cox Automotive / 路透社", t:"行业数据 · 媒体", u:"https://www.coxautoinc.com" },
    tags:["电动车渗透率","补贴退坡","价格战"] },
  { id:"t09", type:"report", lv:"normal", imp:"pos", time:"2026-05-28 10:00",
    title:"摩根士丹利：能源与 AI 业务被低估，目标价 $310",
    brief:"大摩将能源业务单独估值 $80/股，Robotaxi 期权价值 $60/股，综合目标价 $310，维持“增持”。",
    sum:"摩根士丹利报告采用分部估值法：汽车制造业务 $170/股，能源业务单独估值 $80/股，Robotaxi 与 FSD 期权价值 $60/股，综合目标价 310 美元，维持“增持”评级。报告认为市场尚未充分定价储能业务 50% 以上的复合增速。",
    src:{ n:"Morgan Stanley Research", t:"外资研报", u:"https://www.morganstanley.com" },
    tags:["目标价","分部估值","储能"] },
  { id:"t10", type:"news", lv:"normal", imp:"pos", time:"2026-05-12 07:30",
    title:"与宁德时代签署 2027-2030 储能电芯框架协议约 120GWh",
    brief:"长单配套 Megapack 扩产，采用技术授权+电芯供应混合模式以符合 IRA 本土化要求。",
    sum:"据外媒报道，特斯拉与宁德时代签署 2027-2030 年储能电芯供应框架协议，规模约 120GWh，主要配套 Megapack 产线扩产。协议采用技术授权+电芯供应混合模式，以满足 IRA 法案本土化比例要求。",
    src:{ n:"路透社", t:"国际媒体", u:"https://www.reuters.com" },
    tags:["宁德时代","Megapack","供应链"] },
  { id:"t11", type:"earnings", lv:"normal", imp:"neg", time:"2026-04-22 20:00",
    title:"Q1 财报：汽车交付 38.6 万辆低于预期，毛利率 16.4% 承压",
    brief:"Q1 交付 38.6 万辆 (-8%)，为 2023 年来首次同比下滑；营收 $213 亿 (-9%)，自由现金流转负。",
    sum:"2026Q1：交付 38.6 万辆，同比 -8%，为 2023 年以来首次年度同比下滑；营收 213 亿美元，同比 -9%；汽车毛利率 16.4%，同比 -1.9pct；自由现金流 -8 亿美元转负。管理层将全年交付指引调整为“温和增长”，并强调低成本车型与 Robotaxi 为下半年重心。",
    src:{ n:"Tesla Investor Relations (10-Q)", t:"公司财报 · SEC", u:"https://ir.tesla.com" },
    tags:["交付量","毛利率","现金流"] },
  { id:"t12", type:"announce", lv:"normal", imp:"neu", time:"2026-03-05 21:00",
    title:"8-K 公告：董事会批准新一轮股权激励计划，与市值目标挂钩",
    brief:"新激励方案分 12 期归属，与市值及运营里程碑挂钩，最高规模约占股本 4%。",
    sum:"特斯拉提交 8-K 文件：董事会批准新一轮 CEO 股权激励计划，分 12 期归属，与市值及运营里程碑挂钩，若全部达标的最高规模约占总股本 4%。该方案将提交年度股东大会表决，代理投票顾问机构已表态反对。",
    src:{ n:"Tesla 8-K 文件", t:"SEC 公告", u:"https://www.sec.gov" },
    tags:["股权激励","公司治理","8-K"] }
],
tencent: [
  { id:"tc01", type:"earnings", lv:"high", imp:"pos", time:"2026-07-29 17:00",
    title:"Q2 财报：营收 ¥1,892 亿 (+11%)，游戏与广告双引擎超预期",
    brief:"Q2 营收 ¥1,892 亿 (+11%)，Non-IFRS 净利润 ¥652 亿 (+18%)；本土游戏 +16%，视频号广告 +42%，毛利率 54.2% 创新高。",
    sum:"腾讯控股发布 2026Q2 业绩：营收 1,892 亿元，同比 +11%；Non-IFRS 归母净利润 652 亿元，同比 +18%，超出市场预期 6%。本土市场游戏收入 +16%（《王者荣耀》新资料片拉动），视频号广告收入 +42%，金融科技与企业服务 +9%。毛利率 54.2% 创历史新高，AI 提效带动内容与带宽成本率下降。",
    src:{ n:"腾讯控股 2026Q2 业绩公告", t:"港交所公告", u:"https://www.hkexnews.hk" },
    tags:["财报","游戏","视频号广告"] },
  { id:"tc02", type:"announce", lv:"high", imp:"pos", time:"2026-07-20 17:30",
    title:"公告：上调 2026 年回购规模至 HK$1,200 亿，已完成 58%",
    brief:"年度回购计划由 HK$1,000 亿上调至 HK$1,200 亿，年内已回购 1.42 亿股；同时宣派中期股息每股 HK$4.50。",
    sum:"公司公告将 2026 年度股份回购计划规模由 1,000 亿港元上调至 1,200 亿港元，年内已累计回购 1.42 亿股，完成进度 58%。同时宣派中期股息每股 4.50 港元，同比 +12.5%。管理层表示回购与分红并举的股东回报政策将长期延续。",
    src:{ n:"腾讯控股回购及股息公告", t:"港交所公告", u:"https://www.hkexnews.hk" },
    tags:["回购","股息","股东回报"] },
  { id:"tc03", type:"holder", lv:"normal", imp:"neg", time:"2026-07-10 08:00",
    title:"Prosus 再度减持 3,200 万股，持股比例降至 24.9%",
    brief:"Prosus 场内减持约 HK$162 亿用于自身回购；南向资金连续 4 周净流入承接，持股比例升至 9.8%。",
    sum:"港交所权益披露显示，大股东 Prosus 场内减持腾讯 3,200 万股，持股比例由 25.2% 降至 24.9%，套现约 162 亿港元，继续用于其自身回购计划。南向资金同期连续 4 周净流入，港股通持股比例升至 9.8%，部分对冲了大股东减持压力。",
    src:{ n:"港交所披露易", t:"交易所权益披露", u:"https://di.hkex.com.hk" },
    tags:["Prosus","大股东减持","南向资金"] },
  { id:"tc04", type:"price", lv:"normal", imp:"pos", time:"2026-07-30 10:15",
    title:"绩后大涨 4.8% 突破 HK$530，创 52 周新高",
    brief:"Q2 超预期叠加回购上调，股价创 52 周新高；卖空比例降至 8.2%，为近一年低位。",
    sum:"受 Q2 业绩超预期及回购规模上调提振，腾讯高开高走，盘中突破 530 港元创 52 周新高，收涨 4.8%。港交所数据显示卖空成交占比降至 8.2%，为近一年最低水平，市场情绪显著回暖。",
    src:{ n:"港交所行情数据", t:"交易所数据", u:"https://www.hkex.com.hk" },
    tags:["52周新高","卖空比例","业绩行情"] },
  { id:"tc05", type:"institution", lv:"normal", imp:"pos", time:"2026-07-05 16:00",
    title:"Q2 机构持仓：南向资金持仓市值创纪录，外资长线基金回流",
    brief:"南向资金持仓市值突破 HK$4,600 亿创历史纪录；EPFR 数据显示海外长线基金连续 2 月净买入中国互联互网龙头。",
    sum:"二季度南向资金持有腾讯市值突破 4,600 亿港元，创历史纪录。EPFR 资金流向数据显示，海外长线基金（Long-only）连续 2 个月净买入中国互联网龙头，低配幅度收窄至 -1.2pct，为 2023 年以来最低。",
    src:{ n:"Wind / EPFR（模拟汇总）", t:"数据供应商", u:"https://www.wind.com.cn" },
    tags:["南向资金","外资回流","机构持仓"] },
  { id:"tc06", type:"news", lv:"normal", imp:"pos", time:"2026-06-26 19:00",
    title:"混元 3.0 大模型发布，全面接入微信搜一搜与广告系统",
    brief:"混元 3.0 推理成本下降 60%，AI 广告素材生成渗透率已达 45%，带动广告 CTR 提升 12%。",
    sum:"腾讯发布混元 3.0 大模型，官方称推理成本较上代下降 60%，已全面接入微信搜一搜、广告投放系统与企业微信。业绩会上披露 AI 生成广告素材渗透率达 45%，带动广告点击率平均提升 12%，AI 正成为广告业务的核心增长驱动。",
    src:{ n:"腾讯新闻 / 一线", t:"公司发布 · 媒体", u:"https://www.tencent.com" },
    tags:["混元","AI","广告提效"] },
  { id:"tc07", type:"report", lv:"normal", imp:"pos", time:"2026-06-18 09:30",
    title:"高盛：AI 兑现度最高的中国互联网标的，目标价 HK$620",
    brief:"高盛上调 2026-2028 年盈利预测 5-8%，目标价由 HK$580 上调至 HK$620，列入亚太确信买入名单。",
    sum:"高盛报告认为腾讯是中国互联网板块中 AI 商业化兑现度最高的标的：广告 CTR 提升、游戏研发提效与云推理收入三线并进。上调 2026-2028 年盈利预测 5-8%，目标价由 580 港元上调至 620 港元，列入亚太确信买入名单（Conviction Buy）。",
    src:{ n:"Goldman Sachs Research", t:"外资研报", u:"https://www.goldmansachs.com" },
    tags:["目标价","AI","高盛"] },
  { id:"tc08", type:"macro", lv:"normal", imp:"pos", time:"2026-06-06 10:00",
    title:"美联储降息预期升温，港股流动性环境改善",
    brief:"HIBOR 回落，南向+外资共振，恒指重上 24,000 点；互联网板块估值修复弹性居首。",
    sum:"随着美国降息预期升温，港元流动性边际宽松，1 个月 HIBOR 回落至 3.6%。南向资金与外资形成共振，恒生指数重上 24,000 点。机构指出港股互联网板块对全球流动性敏感度最高，估值修复弹性居各板块之首。",
    src:{ n:"香港金管局 / 彭博社", t:"监管机构 · 媒体", u:"https://www.hkma.gov.hk" },
    tags:["流动性","HIBOR","港股"] },
  { id:"tc09", type:"industry", lv:"normal", imp:"pos", time:"2026-05-22 14:00",
    title:"5 月国产游戏版号发放 118 款，常态化节奏延续",
    brief:"腾讯《无畏契约》手游版号获批；年内版号发放节奏稳定在每月 100+ 款，行业政策面持续友好。",
    sum:"国家新闻出版署 5 月发放国产网络游戏版号 118 款，腾讯《无畏契约》手游在列。年内版号发放节奏稳定在每月 100 款以上，行业政策面持续友好。机构预计该作上线首年流水可达 50 亿元级别。",
    src:{ n:"国家新闻出版署", t:"监管机构", u:"https://www.nppa.gov.cn" },
    tags:["版号","游戏","监管"] },
  { id:"tc10", type:"earnings", lv:"normal", imp:"pos", time:"2026-05-14 17:00",
    title:"Q1 财报：营收 ¥1,800 亿 (+10%)，视频号广告收入同比 +38%",
    brief:"Q1 Non-IFRS 净利润 ¥612 亿 (+16%)；微信生态广告加载率仍仅为同行一半，货币化空间充足。",
    sum:"2026Q1：营收 1,800 亿元，同比 +10%；Non-IFRS 净利润 612 亿元，同比 +16%。视频号广告收入同比 +38%，管理层强调微信生态广告加载率仍仅为同行一半，货币化空间充足；国际游戏收入 +14%。",
    src:{ n:"腾讯控股 2026Q1 业绩公告", t:"港交所公告", u:"https://www.hkexnews.hk" },
    tags:["一季报","视频号","广告"] },
  { id:"tc11", type:"announce", lv:"normal", imp:"neu", time:"2026-04-10 17:00",
    title:"公告：完成发行 80 亿美元等值多币种债券，利率创公司新低",
    brief:"含美元债与点心债，加权票面利率 3.1%；募资用于一般公司用途与存量债务置换。",
    sum:"公司公告完成发行合计 80 亿美元等值的多币种债券，包含美元债与离岸人民币点心债，加权平均票面利率 3.1%，创公司发债成本新低。募集资金用于一般公司用途及存量高息债务置换。",
    src:{ n:"腾讯控股债券发行公告", t:"港交所公告", u:"https://www.hkexnews.hk" },
    tags:["发债","融资成本","点心债"] },
  { id:"tc12", type:"news", lv:"normal", imp:"neg", time:"2026-03-18 21:00",
    title:"未成年人游戏时长再收紧，公司称收入影响不足 1%",
    brief:"新规将未成年人节假日游戏时长压缩至每日 1 小时；腾讯披露未成年人流水占比已降至 0.8%。",
    sum:"监管部门进一步收紧未成年人网络游戏时长限制，节假日每日不超过 1 小时。腾讯回应称未成年人流水占比已降至 0.8%，预计对整体收入影响不足 1%，市场反应平淡。",
    src:{ n:"财新网", t:"财经媒体", u:"https://www.caixin.com" },
    tags:["未成年人保护","游戏监管","影响有限"] }
],
samsung: [
  { id:"s01", type:"earnings", lv:"high", imp:"neg", time:"2026-07-31 09:00",
    title:"Q2 财报：营业利润 ₩9.8 万亿低于预期，HBM 份额被 SK海力士挤压",
    brief:"Q2 营收 ₩82.4 万亿 (+6%)，营业利润 ₩9.8 万亿 (-12%) 低于预期；DS 部门 HBM3E 良率爬坡缓慢，盘后跌 3.1%。",
    sum:"三星电子发布 2026Q2 业绩：营收 82.4 万亿韩元，同比 +6%；营业利润 9.8 万亿韩元，同比 -12%，低于市场一致预期 9%。DS（半导体）部门营业利润 4.1 万亿韩元，HBM3E 良率爬坡缓慢，在高带宽存储市场的份额被 SK海力士进一步挤压；DX（消费电子）部门表现平稳。业绩发布后股价下跌 3.1%。",
    src:{ n:"Samsung Electronics IR", t:"公司财报 · 韩交所", u:"https://www.samsung.com/global/ir" },
    tags:["财报","HBM","营业利润"] },
  { id:"s02", type:"industry", lv:"high", imp:"pos", time:"2026-07-24 11:00",
    title:"HBM4 标准落地：三大原厂扩产竞赛开启，2027 年供需或反转",
    brief:"JEDEC 发布 HBM4 最终标准；三星、SK海力士、美光合计宣布超 $400 亿扩产计划，机构警告 2027 年供给过剩风险。",
    sum:"JEDEC 正式发布 HBM4 最终标准，堆叠层数与接口带宽翻倍。三星、SK海力士、美光合计宣布超过 400 亿美元的 HBM 扩产计划。TrendForce 警告若 AI 服务器需求增速放缓，2027 年 HBM 市场可能出现供需反转，价格周期下行风险上升。",
    src:{ n:"JEDEC / TrendForce", t:"行业标准组织 · 数据供应商", u:"https://www.jedec.org" },
    tags:["HBM4","扩产","供需"] },
  { id:"s03", type:"news", lv:"normal", imp:"pos", time:"2026-07-18 08:30",
    title:"传三星获英伟达 HBM3E 大单认证，12 层产品进入最终验证",
    brief:"外媒：三星 12 层 HBM3E 通过英伟达中间验证，若 Q4 量产落地，2027 年 HBM 收入有望翻倍。",
    sum:"据韩媒及彭博社报道，三星电子 12 层 HBM3E 产品已通过英伟达中间验证，进入最终认证阶段。若四季度实现量产供货，机构预计三星 2027 年 HBM 收入有望同比翻倍，HBM 市场份额从当前约 25% 回升至 35%。",
    src:{ n:"彭博社 / 韩国经济日报", t:"国际媒体", u:"https://www.bloomberg.com" },
    tags:["HBM3E","英伟达","认证"] },
  { id:"s04", type:"announce", lv:"normal", imp:"pos", time:"2026-07-10 09:00",
    title:"公告：启动 ₩10 万亿特别回购计划，并提高季度分红 10%",
    brief:"年内回购注销规模提升至 ₩15 万亿；季度分红提高 10%，回应“韩国价值提升计划”。",
    sum:"三星电子公告启动 10 万亿韩元特别股份回购计划，年内回购注销总规模提升至 15 万亿韩元，同时将季度分红提高 10%。公司表示此举旨在回应韩国政府“价值提升计划”（Value-up Program），提升资本回报效率。",
    src:{ n:"三星电子董事会公告 · 韩交所 KIND", t:"交易所公告", u:"https://kind.krx.co.kr" },
    tags:["回购","分红","价值提升计划"] },
  { id:"s05", type:"holder", lv:"normal", imp:"neg", time:"2026-07-02 15:00",
    title:"国民年金减持 0.2pct 至 8.1%，连续两季下调韩股权重",
    brief:"韩国国民年金公团 Q2 减持三星电子约 1,200 万股；外资持股比例回升至 51.8%。",
    sum:"韩交所披露数据显示，韩国国民年金公团（NPS）二季度减持三星电子约 1,200 万股，持股比例由 8.3% 降至 8.1%，连续两个季度下调韩股权重。同期外资（托管行口径）持股比例回升至 51.8%，买卖力量出现切换。",
    src:{ n:"韩交所 KIND 权益披露", t:"交易所披露", u:"https://kind.krx.co.kr" },
    tags:["国民年金","减持","外资"] },
  { id:"s06", type:"price", lv:"normal", imp:"neg", time:"2026-06-27 14:30",
    title:"单日下跌 4.2% 跌破 ₩70,000，外资净卖出创年内纪录",
    brief:"HBM 订单传闻落空叠加韩元走弱，外资单日净卖出 ₩8,900 亿创年内纪录，股价失守 7 万韩元关口。",
    sum:"市场传闻的英伟达 HBM 大单未能如期落地，叠加韩元兑美元走弱至 1,420，外资单日净卖出三星电子 8,900 亿韩元，创年内最大单日净卖出纪录。股价收跌 4.2%，失守 70,000 韩元整数关口。",
    src:{ n:"韩交所行情数据", t:"交易所数据", u:"https://www.krx.co.kr" },
    tags:["外资卖出","韩元","破位"] },
  { id:"s07", type:"institution", lv:"normal", imp:"pos", time:"2026-06-20 16:00",
    title:"13F 与外资流向：美资长线基金 Q2 增持韩股半导体，三星为首选",
    brief:"EPFR：亚洲半导体基金连续 8 周净流入；BlackRock 增持 0.1pct 至 5.0%，三星为外资韩股第一大持仓。",
    sum:"EPFR 数据显示亚洲半导体主题基金连续 8 周净流入，三星电子为外资在韩股市场第一大持仓。BlackRock 二季度增持 0.1pct 至 5.0%。机构认为三星当前 1.3 倍 PB 处于十年估值区间下沿，周期反转期权价值显著。",
    src:{ n:"EPFR / SEC 13F（模拟汇总）", t:"数据供应商 · 监管披露", u:"https://www.sec.gov" },
    tags:["外资流向","BlackRock","估值"] },
  { id:"s08", type:"report", lv:"normal", imp:"neu", time:"2026-06-12 09:00",
    title:"野村证券：存储超级周期进入下半场，下调至“中性”，目标价 ₩75,000",
    brief:"野村认为 DRAM 合约价环比涨幅已连续 2 季收窄，周期进入下半场；三星 HBM 进展是关键变量。",
    sum:"野村证券报告认为，DRAM 合约价环比涨幅已连续两个季度收窄，存储超级周期进入下半场。三星电子的核心变量在于 HBM3E 认证与 HBM4 预研进度，在订单落地前维持“中性”评级，目标价 75,000 韩元。",
    src:{ n:"Nomura Research", t:"外资研报", u:"https://www.nomura.com" },
    tags:["存储周期","目标价","野村"] },
  { id:"s09", type:"macro", lv:"normal", imp:"neg", time:"2026-06-05 10:30",
    title:"韩元兑美元跌破 1,420 创半年新低，出口企业汇兑损益分化",
    brief:"美元指数走强叠加半导体出口环比 -6%，韩元承压；机构测算韩元每贬 1% 三星营业利润 +0.8%，但外资流出抵消利好。",
    sum:"美元指数走强背景下，韩元兑美元跌破 1,420 创半年新低。韩国关税厅数据显示 5 月半导体出口环比 -6%。机构测算韩元每贬值 1% 约增厚三星营业利润 0.8%，但外资因汇率对冲成本上升而加速流出，股价层面抵消了汇兑利好。",
    src:{ n:"韩国银行 / 韩国关税厅", t:"央行 · 官方数据", u:"https://www.bok.or.kr" },
    tags:["韩元","汇率","出口"] },
  { id:"s10", type:"earnings", lv:"normal", imp:"pos", time:"2026-04-30 09:00",
    title:"Q1 财报：营业利润 ₩11.2 万亿 (+45%)，存储涨价红利兑现",
    brief:"Q1 营收 ₩79.8 万亿 (+12%)；DRAM 合约价环比 +15% 带动 DS 部门利润翻倍，符合预期。",
    sum:"2026Q1：营收 79.8 万亿韩元，同比 +12%；营业利润 11.2 万亿韩元，同比 +45%，符合市场预期。DS 部门营业利润 6.8 万亿韩元，同比翻倍，主要受益于 DRAM 合约价环比上涨 15%；旗舰手机 Galaxy S26 系列首销表现稳健。",
    src:{ n:"Samsung Electronics IR", t:"公司财报 · 韩交所", u:"https://www.samsung.com/global/ir" },
    tags:["一季报","DRAM","涨价"] },
  { id:"s11", type:"news", lv:"normal", imp:"pos", time:"2026-04-08 08:00",
    title:"Galaxy S26 Edge 首月销量破 800 万台，超薄机型拉动 ASP 提升",
    brief:"S26 系列首月全球销量 800 万台 (+22%)，Edge 超薄机型占比 35%，移动部门 ASP 提升 8%。",
    sum:"据供应链及运营商数据，Galaxy S26 系列首月全球销量突破 800 万台，同比 +22%，其中超薄机型 S26 Edge 占比达 35%，拉动移动部门平均售价（ASP）提升 8%，高端化策略持续兑现。",
    src:{ n:"Counterpoint Research / 韩联社", t:"行业数据 · 媒体", u:"https://www.counterpointresearch.com" },
    tags:["Galaxy S26","ASP","手机"] },
  { id:"s12", type:"announce", lv:"normal", imp:"neu", time:"2026-03-02 09:00",
    title:"公告：平泽 P4 晶圆厂二期设备搬入，聚焦 HBM4 与先进制程",
    brief:"P4 二期启动设备搬入，规划 HBM4 专用产能与 2nm 代工产线，资本开支指引维持 ₩55 万亿。",
    sum:"公司公告平泽 P4 晶圆厂二期启动设备搬入，规划 HBM4 专用后段产能与 2nm 代工产线，维持全年 55 万亿韩元资本开支指引不变。管理层表示 HBM4 样品将于 2026 年底送样主要客户。",
    src:{ n:"三星电子公告 · 韩交所 KIND", t:"交易所公告", u:"https://kind.krx.co.kr" },
    tags:["平泽P4","HBM4","资本开支"] }
]
};

/* ================= 市场目录（国家 → 交易所 → 板块 → 公司） ================= */

var COUNTRIES = {
  CN: { name: "中国大陆", newToday: 14, tags: ["上交所", "深交所", "北交所"],
    exchanges: [
      { id: "SH_MAIN", name: "上交所 · 主板" },
      { id: "SH_STAR", name: "上交所 · 科创板" },
      { id: "SZ_MAIN", name: "深交所 · 主板" },
      { id: "SZ_GEM",  name: "深交所 · 创业板" },
      { id: "BSE",     name: "北交所" }
    ] },
  US: { name: "美国", newToday: 22, tags: ["NYSE", "NASDAQ", "AMEX"],
    exchanges: [
      { id: "NYSE",   name: "NYSE 纽约证券交易所" },
      { id: "NASDAQ", name: "NASDAQ 纳斯达克" },
      { id: "AMEX",   name: "AMEX 美国证券交易所" }
    ] },
  HK: { name: "香港", newToday: 9, tags: ["港交所主板", "GEM"],
    exchanges: [
      { id: "HK_MAIN", name: "港交所 · 主板" },
      { id: "HK_GEM",  name: "港交所 · GEM" }
    ] },
  KR: { name: "韩国", newToday: 11, tags: ["KOSPI", "KOSDAQ", "KONEX"],
    exchanges: [
      { id: "KOSPI",  name: "KOSPI 主板" },
      { id: "KOSDAQ", name: "KOSDAQ 科斯达克" },
      { id: "KONEX",  name: "KONEX 中小企业板" }
    ] }
};

var SECTORS = ["信息技术", "半导体", "消费", "医疗健康", "金融", "工业", "能源与公用事业", "原材料", "通信服务", "房地产"];

/* 公司列表数据。字段：ex 交易所 / sector 板块 / cap 市值 / price 最新价 / chg 涨跌幅 /
   inst 机构持仓近期变化 / holder 大股东持股近期变化 / event 最近资本事件 / disc 最新披露时间 */
var DIRECTORY = [
  /* ---------- 中国大陆 ---------- */
  { id:"catl", name:"宁德时代", nameEn:"CATL", code:"300750.SZ", market:"CN", ex:"SZ_GEM", sector:"工业",
    aliases:["ningde","catl","300750"], cap:"¥1.18 万亿", price:"268.50", chg:"+2.35%", dir:"up",
    inst:"+2.1pct", instDir:"pos", holder:"—", holderDir:"neu", event:"中报净利润 +28%，储能收入翻倍", disc:"2026-07-28" },
  { id:"moutai", name:"贵州茅台", nameEn:"Kweichow Moutai", code:"600519.SH", market:"CN", ex:"SH_MAIN", sector:"消费",
    aliases:["maotai","moutai","600519","茅台"], cap:"¥1.87 万亿", price:"1,486.00", chg:"-0.82%", dir:"down",
    inst:"-0.8pct", instDir:"neg", holder:"—", holderDir:"neu", event:"2025 年度分红率 75%，派现 ¥347 亿", disc:"2026-07-25" },
  { id:"smic", name:"中芯国际", nameEn:"SMIC", code:"688981.SH", market:"CN", ex:"SH_STAR", sector:"半导体",
    aliases:["zhongxin","smic","688981","中芯"], cap:"¥6,820 亿", price:"85.60", chg:"+1.64%", dir:"up",
    inst:"+1.2pct", instDir:"pos", holder:"大基金 -0.3pct", holderDir:"neg", event:"公告 14nm 产能扩建二期", disc:"2026-07-21" },
  { id:"wuxi", name:"药明康德", nameEn:"WuXi AppTec", code:"603259.SH", market:"CN", ex:"SH_MAIN", sector:"医疗健康",
    aliases:["yaoming","wuxi","603259","药明"], cap:"¥2,340 亿", price:"81.20", chg:"-1.12%", dir:"down",
    inst:"+0.6pct", instDir:"pos", holder:"—", holderDir:"neu", event:"Q2 营收 +14%，在手订单创新高", disc:"2026-07-30" },
  { id:"cmb", name:"招商银行", nameEn:"China Merchants Bank", code:"600036.SH", market:"CN", ex:"SH_MAIN", sector:"金融",
    aliases:["zhaoshang","cmb","600036","招行"], cap:"¥9,860 亿", price:"39.10", chg:"+0.54%", dir:"up",
    inst:"+0.4pct", instDir:"pos", holder:"—", holderDir:"neu", event:"中期分红方案：每 10 股派 2.0 元", disc:"2026-07-18" },
  { id:"kingsoft", name:"金山办公", nameEn:"Kingsoft Office", code:"688111.SH", market:"CN", ex:"SH_STAR", sector:"信息技术",
    aliases:["jinshan","kingsoft","688111","金山"], cap:"¥1,420 亿", price:"308.00", chg:"+2.86%", dir:"up",
    inst:"+1.8pct", instDir:"pos", holder:"高管减持计划披露", holderDir:"neg", event:"AI 订阅收入 +52%", disc:"2026-07-26" },
  { id:"btr", name:"贝特瑞", nameEn:"BTR New Material", code:"835185.BJ", market:"CN", ex:"BSE", sector:"原材料",
    aliases:["beiterui","btr","835185"], cap:"¥286 亿", price:"25.40", chg:"-0.78%", dir:"down",
    inst:"+0.3pct", instDir:"pos", holder:"—", holderDir:"neu", event:"负极材料海外基地扩产公告", disc:"2026-07-12" },
  /* ---------- 美国 ---------- */
  { id:"tsla", name:"特斯拉", nameEn:"Tesla, Inc.", code:"TSLA", market:"US", ex:"NASDAQ", sector:"消费",
    aliases:["tesla","tsla","特斯拉"], cap:"$7,950 亿", price:"248.60", chg:"+3.12%", dir:"up",
    inst:"+1.4pct", instDir:"pos", holder:"高管减持 120 万股", holderDir:"neg", event:"Q2 能源业务营收 +68%", disc:"2026-07-23" },
  { id:"nvda", name:"英伟达", nameEn:"NVIDIA Corp.", code:"NVDA", market:"US", ex:"NASDAQ", sector:"半导体",
    aliases:["yingweida","nvidia","nvda"], cap:"$4.20 万亿", price:"172.40", chg:"+1.85%", dir:"up",
    inst:"+0.9pct", instDir:"pos", holder:"—", holderDir:"neu", event:"Blackwell Ultra 开始量产出货", disc:"2026-07-27" },
  { id:"aapl", name:"苹果", nameEn:"Apple Inc.", code:"AAPL", market:"US", ex:"NASDAQ", sector:"信息技术",
    aliases:["pingguo","apple","aapl"], cap:"$3.60 万亿", price:"236.80", chg:"-0.42%", dir:"down",
    inst:"+0.3pct", instDir:"pos", holder:"—", holderDir:"neu", event:"WWDC 发布端侧 AI 战略", disc:"2026-06-09" },
  { id:"jpm", name:"摩根大通", nameEn:"JPMorgan Chase", code:"JPM", market:"US", ex:"NYSE", sector:"金融",
    aliases:["mogen","jpmorgan","jpm"], cap:"$7,680 亿", price:"272.30", chg:"+0.68%", dir:"up",
    inst:"+0.5pct", instDir:"pos", holder:"—", holderDir:"neu", event:"Q2 净利息收入超预期", disc:"2026-07-14" },
  { id:"lly", name:"礼来", nameEn:"Eli Lilly", code:"LLY", market:"US", ex:"NYSE", sector:"医疗健康",
    aliases:["lilai","lilly","lly"], cap:"$8,420 亿", price:"905.60", chg:"+1.24%", dir:"up",
    inst:"+0.7pct", instDir:"pos", holder:"—", holderDir:"neu", event:"GLP-1 新适应症获 FDA 批准", disc:"2026-07-19" },
  { id:"nee", name:"新纪元能源", nameEn:"NextEra Energy", code:"NEE", market:"US", ex:"NYSE", sector:"能源与公用事业",
    aliases:["xinjiyuan","nextera","nee"], cap:"$1,580 亿", price:"76.90", chg:"-0.36%", dir:"down",
    inst:"+0.2pct", instDir:"pos", holder:"—", holderDir:"neu", event:"签署 3GW 数据中心供电协议", disc:"2026-07-16" },
  /* ---------- 香港 ---------- */
  { id:"tencent", name:"腾讯控股", nameEn:"Tencent Holdings", code:"0700.HK", market:"HK", ex:"HK_MAIN", sector:"通信服务",
    aliases:["tengxun","tencent","0700","腾讯"], cap:"HK$4.70 万亿", price:"512.00", chg:"+1.05%", dir:"up",
    inst:"+1.8pct", instDir:"pos", holder:"Prosus -0.4pct", holderDir:"neg", event:"回购规模上调至 HK$1,200 亿", disc:"2026-07-20" },
  { id:"baba", name:"阿里巴巴", nameEn:"Alibaba Group", code:"9988.HK", market:"HK", ex:"HK_MAIN", sector:"消费",
    aliases:["ali","alibaba","9988","阿里"], cap:"HK$2.10 万亿", price:"112.40", chg:"+2.12%", dir:"up",
    inst:"+1.1pct", instDir:"pos", holder:"—", holderDir:"neu", event:"云智能收入 +26%，AI 产品三位数增长", disc:"2026-07-25" },
  { id:"meituan", name:"美团", nameEn:"Meituan", code:"3690.HK", market:"HK", ex:"HK_MAIN", sector:"消费",
    aliases:["meituan","3690"], cap:"HK$7,420 亿", price:"121.80", chg:"-1.32%", dir:"down",
    inst:"-0.4pct", instDir:"neg", holder:"—", holderDir:"neu", event:"即时零售日订单量破 1.5 亿单", disc:"2026-07-08" },
  { id:"aia", name:"友邦保险", nameEn:"AIA Group", code:"1299.HK", market:"HK", ex:"HK_MAIN", sector:"金融",
    aliases:["youbang","aia","1299"], cap:"HK$9,860 亿", price:"88.50", chg:"+0.42%", dir:"up",
    inst:"+0.3pct", instDir:"pos", holder:"—", holderDir:"neu", event:"中期新业务价值 +18%", disc:"2026-07-29" },
  { id:"hkex", name:"香港交易所", nameEn:"HKEX", code:"0388.HK", market:"HK", ex:"HK_MAIN", sector:"金融",
    aliases:["gangjiaosuo","hkex","0388"], cap:"HK$4,120 亿", price:"324.60", chg:"+0.94%", dir:"up",
    inst:"+0.5pct", instDir:"pos", holder:"—", holderDir:"neu", event:"日均成交额突破 HK$2,000 亿", disc:"2026-07-30" },
  { id:"hansoh", name:"翰森制药", nameEn:"Hansoh Pharma", code:"3692.HK", market:"HK", ex:"HK_MAIN", sector:"医疗健康",
    aliases:["hansen","hansoh","3692"], cap:"HK$1,680 亿", price:"28.30", chg:"+1.76%", dir:"up",
    inst:"+0.8pct", instDir:"pos", holder:"—", holderDir:"neu", event:"ADC 管线授权出海，首付 $1.8 亿", disc:"2026-07-17" },
  /* ---------- 韩国 ---------- */
  { id:"samsung", name:"三星电子", nameEn:"Samsung Electronics", code:"005930.KS", market:"KR", ex:"KOSPI", sector:"半导体",
    aliases:["sanxing","samsung","005930","三星"], cap:"₩408.7 万亿", price:"68,500", chg:"-1.20%", dir:"down",
    inst:"+0.9pct", instDir:"pos", holder:"国民年金 -0.2pct", holderDir:"neg", event:"启动 ₩10 万亿特别回购", disc:"2026-07-10" },
  { id:"skhynix", name:"SK海力士", nameEn:"SK Hynix", code:"000660.KS", market:"KR", ex:"KOSPI", sector:"半导体",
    aliases:["hailishi","hynix","000660"], cap:"₩168.2 万亿", price:"231,000", chg:"+2.40%", dir:"up",
    inst:"+1.3pct", instDir:"pos", holder:"—", holderDir:"neu", event:"HBM4 样品送样英伟达", disc:"2026-07-28" },
  { id:"naver", name:"NAVER", nameEn:"NAVER Corp.", code:"035420.KS", market:"KR", ex:"KOSPI", sector:"通信服务",
    aliases:["naver","035420"], cap:"₩36.4 万亿", price:"221,500", chg:"+0.82%", dir:"up",
    inst:"+0.4pct", instDir:"pos", holder:"—", holderDir:"neu", event:"AI 搜索广告商业化上线", disc:"2026-07-22" },
  { id:"samsungbio", name:"三星生物制剂", nameEn:"Samsung Biologics", code:"207940.KS", market:"KR", ex:"KOSPI", sector:"医疗健康",
    aliases:["sanxingshengwu","biologics","207940"], cap:"₩62.8 万亿", price:"878,000", chg:"+1.15%", dir:"up",
    inst:"+0.6pct", instDir:"pos", holder:"—", holderDir:"neu", event:"第 5 工厂投产，CMO 产能全球第一", disc:"2026-07-15" },
  { id:"kakaobank", name:"KakaoBank", nameEn:"KakaoBank Corp.", code:"323410.KS", market:"KR", ex:"KOSDAQ", sector:"金融",
    aliases:["kakao","323410"], cap:"₩14.2 万亿", price:"29,800", chg:"-0.92%", dir:"down",
    inst:"-0.3pct", instDir:"neg", holder:"—", holderDir:"neu", event:"用户数突破 2,500 万", disc:"2026-07-09" },
  { id:"ecopro", name:"EcoPro", nameEn:"EcoPro Co.", code:"086520.KQ", market:"KR", ex:"KOSDAQ", sector:"工业",
    aliases:["ecopro","086520"], cap:"₩12.6 万亿", price:"48,200", chg:"+3.05%", dir:"up",
    inst:"+0.8pct", instDir:"pos", holder:"—", holderDir:"neu", event:"正极材料欧洲工厂动工", disc:"2026-07-24" }
];

/* ================= 批量公司种子（名称, 代码, 交易所, 板块） =================
   市值 / 价格 / 涨跌 / 机构与股东变动 / 资本事件等字段由确定性生成器补全 */

var SEEDS = [
  /* ---------- 上交所 · 主板 ---------- */
  ["工商银行","601398","SH_MAIN","金融"],["中国平安","601318","SH_MAIN","金融"],
  ["中信证券","600030","SH_MAIN","金融"],["中金公司","601995","SH_MAIN","金融"],
  ["华泰证券","601688","SH_MAIN","金融"],["中国银河","601881","SH_MAIN","金融"],
  ["长江电力","600900","SH_MAIN","能源与公用事业"],["中国神华","601088","SH_MAIN","能源与公用事业"],
  ["中国石油","601857","SH_MAIN","能源与公用事业"],["中国核电","601985","SH_MAIN","能源与公用事业"],
  ["万华化学","600309","SH_MAIN","原材料"],["恒力石化","600346","SH_MAIN","原材料"],
  ["宝丰能源","600989","SH_MAIN","原材料"],["华鲁恒升","600426","SH_MAIN","原材料"],
  ["紫金矿业","601899","SH_MAIN","原材料"],["洛阳钼业","603993","SH_MAIN","原材料"],
  ["北方稀土","600111","SH_MAIN","原材料"],["恒瑞医药","600276","SH_MAIN","医疗健康"],
  ["片仔癀","600436","SH_MAIN","医疗健康"],["复星医药","600196","SH_MAIN","医疗健康"],
  ["三一重工","600031","SH_MAIN","工业"],["国电南瑞","600406","SH_MAIN","工业"],
  ["隆基绿能","601012","SH_MAIN","工业"],["通威股份","600438","SH_MAIN","工业"],
  ["明阳智能","601615","SH_MAIN","工业"],["华友钴业","603799","SH_MAIN","工业"],
  ["璞泰来","603659","SH_MAIN","工业"],["京沪高铁","601816","SH_MAIN","工业"],
  ["中国建筑","601668","SH_MAIN","工业"],["中国移动","600941","SH_MAIN","通信服务"],
  ["中国电信","601728","SH_MAIN","通信服务"],["工业富联","601138","SH_MAIN","信息技术"],
  ["韦尔股份","603501","SH_MAIN","半导体"],["闻泰科技","600745","SH_MAIN","半导体"],
  ["兆易创新","603986","SH_MAIN","半导体"],["汇顶科技","603160","SH_MAIN","半导体"],
  ["长电科技","600584","SH_MAIN","半导体"],["士兰微","600460","SH_MAIN","半导体"],
  ["中国中免","601888","SH_MAIN","消费"],["海天味业","603288","SH_MAIN","消费"],
  ["伊利股份","600887","SH_MAIN","消费"],["海尔智家","600690","SH_MAIN","消费"],
  ["山西汾酒","600809","SH_MAIN","消费"],["上汽集团","600104","SH_MAIN","消费"],
  ["长城汽车","601633","SH_MAIN","消费"],["保利发展","600048","SH_MAIN","房地产"],
  /* ---------- 上交所 · 科创板 ---------- */
  ["中微公司","688012","SH_STAR","半导体"],["澜起科技","688008","SH_STAR","半导体"],
  ["寒武纪","688256","SH_STAR","半导体"],["海光信息","688041","SH_STAR","半导体"],
  ["华润微","688396","SH_STAR","半导体"],["沪硅产业","688126","SH_STAR","半导体"],
  ["芯原股份","688521","SH_STAR","半导体"],["纳芯微","688052","SH_STAR","半导体"],
  ["思特威","688213","SH_STAR","半导体"],["晶合集成","688249","SH_STAR","半导体"],
  ["华海清科","688120","SH_STAR","半导体"],["拓荆科技","688072","SH_STAR","半导体"],
  ["盛美上海","688082","SH_STAR","半导体"],["中科飞测","688361","SH_STAR","半导体"],
  ["芯源微","688037","SH_STAR","半导体"],["长川科技","688604","SH_STAR","半导体"],
  ["传音控股","688036","SH_STAR","信息技术"],["虹软科技","688088","SH_STAR","信息技术"],
  ["中控技术","688777","SH_STAR","信息技术"],["光峰科技","688007","SH_STAR","信息技术"],
  ["百济神州","688235","SH_STAR","医疗健康"],["联影医疗","688271","SH_STAR","医疗健康"],
  ["天合光能","688599","SH_STAR","工业"],["晶科能源","688223","SH_STAR","工业"],
  ["大全能源","688303","SH_STAR","工业"],["阿特斯","688472","SH_STAR","工业"],
  ["固德威","688390","SH_STAR","工业"],["派能科技","688063","SH_STAR","工业"],
  ["天奈科技","688116","SH_STAR","原材料"],["容百科技","688005","SH_STAR","原材料"],
  ["嘉元科技","688388","SH_STAR","原材料"],["西部超导","688122","SH_STAR","原材料"],
  ["中无人机","688297","SH_STAR","工业"],["石头科技","688169","SH_STAR","消费"],
  /* ---------- 深交所 · 主板 ---------- */
  ["五粮液","000858","SZ_MAIN","消费"],["泸州老窖","000568","SZ_MAIN","消费"],
  ["洋河股份","002304","SZ_MAIN","消费"],["美的集团","000333","SZ_MAIN","消费"],
  ["格力电器","000651","SZ_MAIN","消费"],["比亚迪","002594","SZ_MAIN","消费"],
  ["双汇发展","000895","SZ_MAIN","消费"],["牧原股份","002714","SZ_MAIN","消费"],
  ["万科A","000002","SZ_MAIN","房地产"],["招商蛇口","001979","SZ_MAIN","房地产"],
  ["中兴通讯","000063","SZ_MAIN","信息技术"],["京东方A","000725","SZ_MAIN","信息技术"],
  ["立讯精密","002475","SZ_MAIN","信息技术"],["歌尔股份","002241","SZ_MAIN","信息技术"],
  ["海康威视","002415","SZ_MAIN","信息技术"],["大华股份","002236","SZ_MAIN","信息技术"],
  ["紫光股份","000938","SZ_MAIN","信息技术"],["浪潮信息","000977","SZ_MAIN","信息技术"],
  ["TCL科技","000100","SZ_MAIN","信息技术"],["分众传媒","002027","SZ_MAIN","通信服务"],
  ["平安银行","000001","SZ_MAIN","金融"],["宁波银行","002142","SZ_MAIN","金融"],
  ["顺丰控股","002352","SZ_MAIN","工业"],["中航光电","002179","SZ_MAIN","工业"],
  ["金风科技","002202","SZ_MAIN","工业"],["恩捷股份","002812","SZ_MAIN","工业"],
  ["荣盛石化","002493","SZ_MAIN","原材料"],["天赐材料","002709","SZ_MAIN","原材料"],
  ["赣锋锂业","002460","SZ_MAIN","原材料"],["天齐锂业","002466","SZ_MAIN","原材料"],
  ["盐湖股份","000792","SZ_MAIN","原材料"],["中矿资源","002738","SZ_MAIN","原材料"],
  ["藏格矿业","000408","SZ_MAIN","原材料"],["永兴材料","002756","SZ_MAIN","原材料"],
  ["盛新锂能","002240","SZ_MAIN","原材料"],["雅化集团","002497","SZ_MAIN","原材料"],
  /* ---------- 深交所 · 创业板 ---------- */
  ["中际旭创","300308","SZ_GEM","信息技术"],["新易盛","300502","SZ_GEM","信息技术"],
  ["天孚通信","300394","SZ_GEM","信息技术"],["太辰光","300570","SZ_GEM","信息技术"],
  ["光库科技","300620","SZ_GEM","信息技术"],["博创科技","300548","SZ_GEM","信息技术"],
  ["汇川技术","300124","SZ_GEM","工业"],["阳光电源","300274","SZ_GEM","工业"],
  ["亿纬锂能","300014","SZ_GEM","工业"],["欣旺达","300207","SZ_GEM","工业"],
  ["先导智能","300450","SZ_GEM","工业"],["锦浪科技","300763","SZ_GEM","工业"],
  ["鹏辉能源","300438","SZ_GEM","工业"],["捷佳伟创","300724","SZ_GEM","工业"],
  ["迈为股份","300751","SZ_GEM","工业"],["东方财富","300059","SZ_GEM","金融"],
  ["同花顺","300033","SZ_GEM","金融"],["温氏股份","300498","SZ_GEM","消费"],
  ["智飞生物","300122","SZ_GEM","医疗健康"],["爱尔眼科","300015","SZ_GEM","医疗健康"],
  ["迈瑞医疗","300760","SZ_GEM","医疗健康"],["圣邦股份","300661","SZ_GEM","半导体"],
  ["卓胜微","300782","SZ_GEM","半导体"],["华大九天","301269","SZ_GEM","半导体"],
  ["中科创达","300496","SZ_GEM","信息技术"],["蓝思科技","300433","SZ_GEM","信息技术"],
  ["软通动力","301236","SZ_GEM","信息技术"],["润泽科技","300442","SZ_GEM","信息技术"],
  ["德方纳米","300769","SZ_GEM","原材料"],["当升科技","300073","SZ_GEM","原材料"],
  ["新宙邦","300037","SZ_GEM","原材料"],["星源材质","300568","SZ_GEM","原材料"],
  ["天华新能","300390","SZ_GEM","原材料"],["融捷股份","002192","SZ_GEM","原材料"],
  /* ---------- 北交所 ---------- */
  ["吉林碳谷","836077","BSE","原材料"],["连城数控","835368","BSE","工业"],
  ["曙光数创","872808","BSE","信息技术"],["并行科技","839493","BSE","信息技术"],
  /* ---------- 美国 · NASDAQ ---------- */
  ["微软","MSFT","NASDAQ","信息技术"],["谷歌","GOOGL","NASDAQ","通信服务"],
  ["亚马逊","AMZN","NASDAQ","消费"],["Meta","META","NASDAQ","通信服务"],
  ["博通","AVGO","NASDAQ","半导体"],["超威半导体","AMD","NASDAQ","半导体"],
  ["英特尔","INTC","NASDAQ","半导体"],["美光科技","MU","NASDAQ","半导体"],
  ["高通","QCOM","NASDAQ","半导体"],["德州仪器","TXN","NASDAQ","半导体"],
  ["亚德诺","ADI","NASDAQ","半导体"],["应用材料","AMAT","NASDAQ","半导体"],
  ["泛林集团","LRCX","NASDAQ","半导体"],["科磊","KLAC","NASDAQ","半导体"],
  ["迈威尔科技","MRVL","NASDAQ","半导体"],["恩智浦","NXPI","NASDAQ","半导体"],
  ["微芯科技","MCHP","NASDAQ","半导体"],["安森美","ON","NASDAQ","半导体"],
  ["格芯","GFS","NASDAQ","半导体"],["Coherent","COHR","NASDAQ","半导体"],
  ["Lumentum","LITE","NASDAQ","半导体"],["Fabrinet","FN","NASDAQ","半导体"],
  ["Arista网络","ANET","NASDAQ","信息技术"],["思科","CSCO","NASDAQ","信息技术"],
  ["Adobe","ADBE","NASDAQ","信息技术"],["Salesforce","CRM","NASDAQ","信息技术"],
  ["Palantir","PLTR","NASDAQ","信息技术"],["CrowdStrike","CRWD","NASDAQ","信息技术"],
  ["Datadog","DDOG","NASDAQ","信息技术"],["奈飞","NFLX","NASDAQ","通信服务"],
  ["好市多","COST","NASDAQ","消费"],["百事","PEP","NASDAQ","消费"],
  ["星巴克","SBUX","NASDAQ","消费"],["爱彼迎","ABNB","NASDAQ","消费"],
  ["福泰制药","VRTX","NASDAQ","医疗健康"],["再生元","REGN","NASDAQ","医疗健康"],
  ["安进","AMGN","NASDAQ","医疗健康"],["直觉外科","ISRG","NASDAQ","医疗健康"],
  ["Moderna","MRNA","NASDAQ","医疗健康"],["星座能源","CEG","NASDAQ","能源与公用事业"],
  /* ---------- 美国 · NYSE ---------- */
  ["伯克希尔哈撒韦","BRK.B","NYSE","金融"],["美国银行","BAC","NYSE","金融"],
  ["富国银行","WFC","NYSE","金融"],["高盛","GS","NYSE","金融"],
  ["摩根士丹利","MS","NYSE","金融"],["Visa","V","NYSE","金融"],
  ["万事达","MA","NYSE","金融"],["联合健康","UNH","NYSE","医疗健康"],
  ["强生","JNJ","NYSE","医疗健康"],["辉瑞","PFE","NYSE","医疗健康"],
  ["默沙东","MRK","NYSE","医疗健康"],["艾伯维","ABBV","NYSE","医疗健康"],
  ["波士顿科学","BSX","NYSE","医疗健康"],["埃克森美孚","XOM","NYSE","能源与公用事业"],
  ["雪佛龙","CVX","NYSE","能源与公用事业"],["卡特彼勒","CAT","NYSE","工业"],
  ["波音","BA","NYSE","工业"],["GE航空航天","GE","NYSE","工业"],
  ["霍尼韦尔","HON","NYSE","工业"],["伊顿","ETN","NYSE","工业"],
  ["沃尔玛","WMT","NYSE","消费"],["宝洁","PG","NYSE","消费"],
  ["可口可乐","KO","NYSE","消费"],["麦当劳","MCD","NYSE","消费"],
  ["耐克","NKE","NYSE","消费"],["家得宝","HD","NYSE","消费"],
  ["甲骨文","ORCL","NYSE","信息技术"],["ServiceNow","NOW","NYSE","信息技术"],
  ["Snowflake","SNOW","NYSE","信息技术"],["优步","UBER","NYSE","信息技术"],
  ["AT&T","T","NYSE","通信服务"],["威瑞森","VZ","NYSE","通信服务"],
  ["迪士尼","DIS","NYSE","通信服务"],["林德","LIN","NYSE","原材料"],
  ["自由港麦克莫兰","FCX","NYSE","原材料"],["陶氏","DOW","NYSE","原材料"],
  ["安博","PLD","NYSE","房地产"],["美国铁塔","AMT","NYSE","房地产"],
  ["Coupang","CPNG","NYSE","消费"],
  /* ---------- 香港 · 主板 ---------- */
  ["小米集团","1810.HK","HK_MAIN","信息技术"],["百度集团","9888.HK","HK_MAIN","信息技术"],
  ["商汤科技","0020.HK","HK_MAIN","信息技术"],["金蝶国际","0268.HK","HK_MAIN","信息技术"],
  ["地平线机器人","9660.HK","HK_MAIN","信息技术"],["京东集团","9618.HK","HK_MAIN","消费"],
  ["比亚迪股份","1211.HK","HK_MAIN","消费"],["理想汽车","2015.HK","HK_MAIN","消费"],
  ["小鹏汽车","9868.HK","HK_MAIN","消费"],["安踏体育","2020.HK","HK_MAIN","消费"],
  ["李宁","2331.HK","HK_MAIN","消费"],["农夫山泉","9633.HK","HK_MAIN","消费"],
  ["网易","9999.HK","HK_MAIN","通信服务"],["快手","1024.HK","HK_MAIN","通信服务"],
  ["哔哩哔哩","9626.HK","HK_MAIN","通信服务"],["中国移动","0941.HK","HK_MAIN","通信服务"],
  ["汇丰控股","0005.HK","HK_MAIN","金融"],["中银香港","2388.HK","HK_MAIN","金融"],
  ["药明生物","2269.HK","HK_MAIN","医疗健康"],["信达生物","1801.HK","HK_MAIN","医疗健康"],
  ["康方生物","9926.HK","HK_MAIN","医疗健康"],["华虹半导体","1347.HK","HK_MAIN","半导体"],
  ["中创新航","3931.HK","HK_MAIN","工业"],["中国海洋石油","0883.HK","HK_MAIN","能源与公用事业"],
  ["华润置地","1109.HK","HK_MAIN","房地产"],["龙湖集团","0960.HK","HK_MAIN","房地产"],
  /* ---------- 香港 · GEM ---------- */
  ["中国有赞","8083.HK","HK_GEM","信息技术"],["环球数码创意","8271.HK","HK_GEM","信息技术"],
  /* ---------- 韩国 · KOSPI ---------- */
  ["LG化学","051910.KS","KOSPI","原材料"],["LG新能源","373220.KS","KOSPI","工业"],
  ["三星SDI","006400.KS","KOSPI","工业"],["POSCO控股","005490.KS","KOSPI","原材料"],
  ["现代汽车","005380.KS","KOSPI","消费"],["起亚","000270.KS","KOSPI","消费"],
  ["KB金融","105560.KS","KOSPI","金融"],["新韩金融","055550.KS","KOSPI","金融"],
  ["Celltrion","068270.KS","KOSPI","医疗健康"],["SK电讯","017670.KS","KOSPI","通信服务"],
  ["韩国电力","015760.KS","KOSPI","能源与公用事业"],["LG电子","066570.KS","KOSPI","信息技术"],
  ["Krafton","259960.KS","KOSPI","通信服务"],["POSCO未来M","003670.KS","KOSPI","原材料"],
  /* ---------- 韩国 · KOSDAQ ---------- */
  ["Pearl Abyss","263750.KQ","KOSDAQ","通信服务"],["Alteogen","196170.KQ","KOSDAQ","医疗健康"],
  ["HLB","028300.KQ","KOSDAQ","医疗健康"],["L&F","066970.KQ","KOSDAQ","原材料"],
  ["DB HiTek","000990.KQ","KOSDAQ","半导体"],["LEENO工业","058470.KQ","KOSDAQ","半导体"],
  /* ---------- 上交所 · 主板（第二批） ---------- */
  ["浦发银行","600000","SH_MAIN","金融"],["兴业银行","601166","SH_MAIN","金融"],
  ["民生银行","600016","SH_MAIN","金融"],["交通银行","601328","SH_MAIN","金融"],
  ["邮储银行","601658","SH_MAIN","金融"],["光大银行","601818","SH_MAIN","金融"],
  ["中信建投","601066","SH_MAIN","金融"],["国泰君安","601211","SH_MAIN","金融"],
  ["招商证券","600999","SH_MAIN","金融"],["海通证券","600837","SH_MAIN","金融"],
  ["中国人寿","601628","SH_MAIN","金融"],["中国太保","601601","SH_MAIN","金融"],
  ["新华保险","601336","SH_MAIN","金融"],["中国人保","601319","SH_MAIN","金融"],
  ["陕西煤业","601225","SH_MAIN","能源与公用事业"],["兖矿能源","600188","SH_MAIN","能源与公用事业"],
  ["华能国际","600011","SH_MAIN","能源与公用事业"],["国电电力","600795","SH_MAIN","能源与公用事业"],
  ["国投电力","600886","SH_MAIN","能源与公用事业"],["三峡能源","600905","SH_MAIN","能源与公用事业"],
  ["华能水电","600025","SH_MAIN","能源与公用事业"],["川投能源","600674","SH_MAIN","能源与公用事业"],
  ["中国铝业","601600","SH_MAIN","原材料"],["海螺水泥","600585","SH_MAIN","原材料"],
  ["中国巨石","600176","SH_MAIN","原材料"],["宝钢股份","600019","SH_MAIN","原材料"],
  ["包钢股份","600010","SH_MAIN","原材料"],["南山铝业","600219","SH_MAIN","原材料"],
  ["桐昆股份","601233","SH_MAIN","原材料"],["新凤鸣","603225","SH_MAIN","原材料"],
  ["白云山","600332","SH_MAIN","医疗健康"],["天士力","600535","SH_MAIN","医疗健康"],
  ["青岛啤酒","600600","SH_MAIN","消费"],["重庆啤酒","600132","SH_MAIN","消费"],
  ["东鹏饮料","605499","SH_MAIN","消费"],["安井食品","603345","SH_MAIN","消费"],
  ["千禾味业","603027","SH_MAIN","消费"],["中炬高新","600872","SH_MAIN","消费"],
  ["春秋航空","601021","SH_MAIN","工业"],["中国国航","601111","SH_MAIN","工业"],
  ["南方航空","600029","SH_MAIN","工业"],["上海机场","600009","SH_MAIN","工业"],
  ["中远海控","601919","SH_MAIN","工业"],["上港集团","600018","SH_MAIN","工业"],
  ["大秦铁路","601006","SH_MAIN","工业"],["恒生电子","600570","SH_MAIN","信息技术"],
  ["用友网络","600588","SH_MAIN","信息技术"],["宝信软件","600845","SH_MAIN","信息技术"],
  ["三六零","601360","SH_MAIN","信息技术"],["中科曙光","603019","SH_MAIN","信息技术"],
  ["中国软件","600536","SH_MAIN","信息技术"],
  /* ---------- 上交所 · 科创板（第二批） ---------- */
  ["复旦微电","688385","SH_STAR","半导体"],["龙芯中科","688047","SH_STAR","半导体"],
  ["安路科技","688107","SH_STAR","半导体"],["艾为电子","688798","SH_STAR","半导体"],
  ["唯捷创芯","688153","SH_STAR","半导体"],["时代电气","688187","SH_STAR","半导体"],
  ["华峰测控","688200","SH_STAR","半导体"],["奥特维","688516","SH_STAR","工业"],
  ["高测股份","688556","SH_STAR","工业"],["禾迈股份","688032","SH_STAR","工业"],
  ["昱能科技","688348","SH_STAR","工业"],["珠海冠宇","688772","SH_STAR","工业"],
  ["孚能科技","688567","SH_STAR","工业"],["天能股份","688819","SH_STAR","工业"],
  ["杭可科技","688006","SH_STAR","工业"],["利元亨","688499","SH_STAR","工业"],
  ["威胜信息","688100","SH_STAR","信息技术"],["道通科技","688208","SH_STAR","信息技术"],
  ["奇安信","688561","SH_STAR","信息技术"],["安恒信息","688023","SH_STAR","信息技术"],
  ["云从科技","688327","SH_STAR","信息技术"],["海天瑞声","688787","SH_STAR","信息技术"],
  ["奥比中光","688322","SH_STAR","信息技术"],["华大智造","688114","SH_STAR","医疗健康"],
  ["诺唯赞","688105","SH_STAR","医疗健康"],["君实生物","688180","SH_STAR","医疗健康"],
  ["康希诺","688185","SH_STAR","医疗健康"],["荣昌生物","688331","SH_STAR","医疗健康"],
  ["泽璟制药","688266","SH_STAR","医疗健康"],["微芯生物","688321","SH_STAR","医疗健康"],
  ["艾力斯","688578","SH_STAR","医疗健康"],["中复神鹰","688295","SH_STAR","原材料"],
  /* ---------- 深交所 · 主板（第二批） ---------- */
  ["广发证券","000776","SZ_MAIN","金融"],["申万宏源","000166","SZ_MAIN","金融"],
  ["龙源电力","001289","SZ_MAIN","能源与公用事业"],["中信特钢","000708","SZ_MAIN","原材料"],
  ["云铝股份","000807","SZ_MAIN","原材料"],["神火股份","000933","SZ_MAIN","原材料"],
  ["东方盛虹","000301","SZ_MAIN","原材料"],["卫星化学","002648","SZ_MAIN","原材料"],
  ["凯莱英","002821","SZ_MAIN","医疗健康"],["华东医药","000963","SZ_MAIN","医疗健康"],
  ["云南白药","000538","SZ_MAIN","医疗健康"],["以岭药业","002603","SZ_MAIN","医疗健康"],
  ["涪陵榨菜","002507","SZ_MAIN","消费"],["北新建材","000786","SZ_MAIN","原材料"],
  ["东方雨虹","002271","SZ_MAIN","工业"],["太极股份","002368","SZ_MAIN","信息技术"],
  ["北方华创","002371","SZ_MAIN","半导体"],["三花智控","002050","SZ_MAIN","工业"],
  ["德赛西威","002920","SZ_MAIN","信息技术"],["四维图新","002405","SZ_MAIN","信息技术"],
  ["千方科技","002373","SZ_MAIN","信息技术"],["广联达","002410","SZ_MAIN","信息技术"],
  ["石基信息","002153","SZ_MAIN","信息技术"],["启明星辰","002439","SZ_MAIN","信息技术"],
  ["三七互娱","002555","SZ_MAIN","通信服务"],["完美世界","002624","SZ_MAIN","通信服务"],
  ["世纪华通","002602","SZ_MAIN","通信服务"],["恺英网络","002517","SZ_MAIN","通信服务"],
  ["万达电影","002739","SZ_MAIN","消费"],["新希望","000876","SZ_MAIN","消费"],
  ["苏泊尔","002032","SZ_MAIN","消费"],["老板电器","002508","SZ_MAIN","消费"],
  /* ---------- 深交所 · 创业板（第二批） ---------- */
  ["泰格医药","300347","SZ_GEM","医疗健康"],["康龙化成","300759","SZ_GEM","医疗健康"],
  ["义翘神州","301047","SZ_GEM","医疗健康"],["深信服","300454","SZ_GEM","信息技术"],
  ["昆仑万维","300418","SZ_GEM","信息技术"],["光线传媒","300251","SZ_GEM","通信服务"],
  ["华策影视","300133","SZ_GEM","通信服务"],["北京君正","300223","SZ_GEM","半导体"],
  ["全志科技","300458","SZ_GEM","半导体"],["富瀚微","300613","SZ_GEM","半导体"],
  ["景嘉微","300474","SZ_GEM","半导体"],["扬杰科技","300373","SZ_GEM","半导体"],
  ["捷捷微电","300623","SZ_GEM","半导体"],["菲利华","300395","SZ_GEM","原材料"],
  ["光威复材","300699","SZ_GEM","原材料"],["钢研高纳","300034","SZ_GEM","工业"],
  ["三角防务","300775","SZ_GEM","工业"],["爱乐达","300696","SZ_GEM","工业"],
  ["机器人","300024","SZ_GEM","工业"],["盛弘股份","300693","SZ_GEM","工业"],
  ["英杰电气","300820","SZ_GEM","工业"],["上能电气","300827","SZ_GEM","工业"],
  ["南都电源","300068","SZ_GEM","工业"],["震裕科技","300953","SZ_GEM","工业"],
  ["赢合科技","300457","SZ_GEM","工业"],["曼恩斯特","301325","SZ_GEM","工业"],
  ["长盈精密","300115","SZ_GEM","信息技术"],["安克创新","300866","SZ_GEM","消费"],
  ["致欧科技","301376","SZ_GEM","消费"],["乐歌股份","300729","SZ_GEM","消费"],
  ["赛维时代","301381","SZ_GEM","消费"],["斯莱克","300382","SZ_GEM","工业"],
  /* ---------- 北交所（第二批） ---------- */
  ["奥迪威","832491","BSE","信息技术"],["惠丰钻石","839725","BSE","原材料"],
  ["凯德石英","835179","BSE","原材料"],["华岭股份","430139","BSE","半导体"],
  /* ---------- 美国 · NASDAQ（第二批） ---------- */
  ["阿斯麦","ASML","NASDAQ","半导体"],["Arm","ARM","NASDAQ","半导体"],
  ["Astera Labs","ALAB","NASDAQ","半导体"],["Credo","CRDO","NASDAQ","半导体"],
  ["Rambus","RMBS","NASDAQ","半导体"],["SiTime","SITM","NASDAQ","半导体"],
  ["Impinj","PI","NASDAQ","半导体"],["新思科技","SNPS","NASDAQ","信息技术"],
  ["铿腾电子","CDNS","NASDAQ","信息技术"],["Workday","WDAY","NASDAQ","信息技术"],
  ["Atlassian","TEAM","NASDAQ","信息技术"],["MongoDB","MDB","NASDAQ","信息技术"],
  ["Zscaler","ZS","NASDAQ","信息技术"],["Okta","OKTA","NASDAQ","信息技术"],
  ["Veeva","VEEV","NASDAQ","医疗健康"],["德康医疗","DXCM","NASDAQ","医疗健康"],
  ["爱德士","IDXX","NASDAQ","医疗健康"],["隐适美","ALGN","NASDAQ","医疗健康"],
  ["Insulet","PODD","NASDAQ","医疗健康"],["GE医疗","GEHC","NASDAQ","医疗健康"],
  ["渤健","BIIB","NASDAQ","医疗健康"],["吉利德科学","GILD","NASDAQ","医疗健康"],
  ["Apellis","APLS","NASDAQ","医疗健康"],["Rivian","RIVN","NASDAQ","消费"],
  ["Lucid","LCID","NASDAQ","消费"],["Robinhood","HOOD","NASDAQ","金融"],
  ["Coinbase","COIN","NASDAQ","金融"],["DraftKings","DKNG","NASDAQ","消费"],
  ["DoorDash","DASH","NASDAQ","消费"],["Booking","BKNG","NASDAQ","消费"],
  ["MercadoLibre","MELI","NASDAQ","消费"],["拼多多","PDD","NASDAQ","消费"],
  ["京东","JD","NASDAQ","消费"],["百度","BIDU","NASDAQ","信息技术"],
  ["网易","NTES","NASDAQ","通信服务"],["携程集团","TCOM","NASDAQ","消费"],
  ["理想汽车","LI","NASDAQ","消费"],["小鹏汽车","XPEV","NASDAQ","消费"],
  ["哔哩哔哩","BILI","NASDAQ","通信服务"],["富途控股","FUTU","NASDAQ","金融"],
  /* ---------- 美国 · NYSE（第二批） ---------- */
  ["台积电","TSM","NYSE","半导体"],["丰田汽车","TM","NYSE","消费"],
  ["阿里巴巴","BABA","NYSE","消费"],["蔚来","NIO","NYSE","消费"],
  ["腾讯音乐","TME","NYSE","通信服务"],["IBM","IBM","NYSE","信息技术"],
  ["埃森哲","ACN","NYSE","信息技术"],["SAP","SAP","NYSE","信息技术"],
  ["戴尔科技","DELL","NYSE","信息技术"],["惠普","HPQ","NYSE","信息技术"],
  ["ABB","ABB","NYSE","工业"],["3M","MMM","NYSE","工业"],
  ["洛克希德马丁","LMT","NYSE","工业"],["RTX","RTX","NYSE","工业"],
  ["诺斯罗普格鲁曼","NOC","NYSE","工业"],["通用动力","GD","NYSE","工业"],
  ["联合包裹","UPS","NYSE","工业"],["联邦快递","FDX","NYSE","工业"],
  ["达美航空","DAL","NYSE","工业"],["西南航空","LUV","NYSE","工业"],
  ["希尔顿酒店","HLT","NYSE","消费"],["百胜中国","YUMC","NYSE","消费"],
  ["塔吉特","TGT","NYSE","消费"],["劳氏","LOW","NYSE","消费"],
  ["高露洁","CL","NYSE","消费"],["雅诗兰黛","EL","NYSE","消费"],
  ["菲利普莫里斯","PM","NYSE","消费"],["史赛克","SYK","NYSE","医疗健康"],
  ["美敦力","MDT","NYSE","医疗健康"],["赛默飞世尔","TMO","NYSE","医疗健康"],
  ["丹纳赫","DHR","NYSE","医疗健康"],["Elevance健康","ELV","NYSE","医疗健康"],
  ["美国运通","AXP","NYSE","金融"],["贝莱德","BLK","NYSE","金融"],
  ["嘉信理财","SCHW","NYSE","金融"],["花旗集团","C","NYSE","金融"],
  ["穆迪","MCO","NYSE","金融"],["标普全球","SPGI","NYSE","金融"],
  ["MSCI","MSCI","NYSE","金融"],["洲际交易所","ICE","NYSE","金融"],
  /* ---------- 香港 · 主板（第二批） ---------- */
  ["舜宇光学科技","2382.HK","HK_MAIN","信息技术"],["瑞声科技","2018.HK","HK_MAIN","信息技术"],
  ["比亚迪电子","0285.HK","HK_MAIN","信息技术"],["联想集团","0992.HK","HK_MAIN","信息技术"],
  ["中兴通讯","0763.HK","HK_MAIN","信息技术"],["金山软件","3888.HK","HK_MAIN","信息技术"],
  ["微盟集团","2013.HK","HK_MAIN","信息技术"],["第四范式","6682.HK","HK_MAIN","信息技术"],
  ["京东健康","6618.HK","HK_MAIN","医疗健康"],["阿里健康","0241.HK","HK_MAIN","医疗健康"],
  ["平安好医生","1833.HK","HK_MAIN","医疗健康"],["石药集团","1093.HK","HK_MAIN","医疗健康"],
  ["中国生物制药","1177.HK","HK_MAIN","医疗健康"],["再鼎医药","9688.HK","HK_MAIN","医疗健康"],
  ["诺诚健华","9969.HK","HK_MAIN","医疗健康"],["荣昌生物","9995.HK","HK_MAIN","医疗健康"],
  ["华润啤酒","0291.HK","HK_MAIN","消费"],["青岛啤酒股份","0168.HK","HK_MAIN","消费"],
  ["海底捞","6862.HK","HK_MAIN","消费"],["泡泡玛特","9992.HK","HK_MAIN","消费"],
  ["名创优品","9896.HK","HK_MAIN","消费"],["特步国际","1368.HK","HK_MAIN","消费"],
  ["波司登","3998.HK","HK_MAIN","消费"],["周大福","1929.HK","HK_MAIN","消费"],
  ["新秀丽","1910.HK","HK_MAIN","消费"],["中通快递","2057.HK","HK_MAIN","工业"],
  ["京东物流","2618.HK","HK_MAIN","工业"],["中国铁塔","0788.HK","HK_MAIN","通信服务"],
  ["香港电讯","6823.HK","HK_MAIN","通信服务"],["保诚","2378.HK","HK_MAIN","金融"],
  ["渣打集团","2888.HK","HK_MAIN","金融"],["恒生银行","0011.HK","HK_MAIN","金融"],
  ["长实集团","1113.HK","HK_MAIN","房地产"],["新鸿基地产","0016.HK","HK_MAIN","房地产"],
  ["中国海外发展","0688.HK","HK_MAIN","房地产"],
  /* ---------- 韩国 · KOSPI（第二批） ---------- */
  ["三星物产","028260.KS","KOSPI","工业"],["三星生命","032830.KS","KOSPI","金融"],
  ["三星火灾海上","000810.KS","KOSPI","金融"],["现代摩比斯","012330.KS","KOSPI","工业"],
  ["LG显示","034220.KS","KOSPI","信息技术"],["三星电机","009150.KS","KOSPI","信息技术"],
  ["SK创新","096770.KS","KOSPI","能源与公用事业"],["S-Oil","010950.KS","KOSPI","能源与公用事业"],
  ["韩华航空航天","012450.KS","KOSPI","工业"],["HD现代","267250.KS","KOSPI","工业"],
  ["HD现代重工","329180.KS","KOSPI","工业"],["韩华海洋","042660.KS","KOSPI","工业"],
  ["三星重工","010140.KS","KOSPI","工业"],["乐天化学","011170.KS","KOSPI","原材料"],
  ["韩华思路信","009830.KS","KOSPI","原材料"],["高丽亚铅","010130.KS","KOSPI","原材料"],
  ["LG生活健康","051900.KS","KOSPI","消费"],["爱茉莉太平洋","090430.KS","KOSPI","消费"],
  ["KT","030200.KS","KOSPI","通信服务"],["Kakao","035720.KS","KOSPI","通信服务"],
  ["HYBE","352820.KS","KOSPI","通信服务"],
  /* ---------- 韩国 · KOSDAQ（第二批） ---------- */
  ["EcoPro BM","247540.KQ","KOSDAQ","工业"],["Hugel","145020.KQ","KOSDAQ","医疗健康"],
  ["Seegene","096530.KQ","KOSDAQ","医疗健康"],["Celltrion Pharm","068760.KQ","KOSDAQ","医疗健康"],
  ["Wemade","112040.KQ","KOSDAQ","通信服务"],["Neowiz","095660.KQ","KOSDAQ","通信服务"],
  ["NHN","181710.KQ","KOSDAQ","通信服务"],["Com2uS","078340.KQ","KOSDAQ","通信服务"],
  ["韩美半导体","042700.KQ","KOSDAQ","半导体"],["HPSP","403870.KQ","KOSDAQ","半导体"],
  ["ISC","095340.KQ","KOSDAQ","半导体"],["EO Technics","039030.KQ","KOSDAQ","半导体"],
  ["Wonik IPS","240810.KQ","KOSDAQ","半导体"],["Jusung工程","036930.KQ","KOSDAQ","半导体"],
  ["KoMiCo","183300.KQ","KOSDAQ","半导体"],
  /* ---------- 第三批 · 上交所主板 ---------- */
  ["中国中车","601766","SH_MAIN","工业"],["中国船舶","600150","SH_MAIN","工业"],
  ["中国电建","601669","SH_MAIN","工业"],["大唐发电","601991","SH_MAIN","能源与公用事业"],
  ["浙能电力","600023","SH_MAIN","能源与公用事业"],["福耀玻璃","600660","SH_MAIN","消费"],
  ["今世缘","603369","SH_MAIN","消费"],["上海医药","601607","SH_MAIN","医疗健康"],
  /* ---------- 第三批 · 上交所科创板 ---------- */
  ["格科微","688728","SH_STAR","半导体"],["恒玄科技","688608","SH_STAR","半导体"],
  ["晶晨股份","688099","SH_STAR","半导体"],["乐鑫科技","688018","SH_STAR","半导体"],
  ["概伦电子","688206","SH_STAR","半导体"],["南芯科技","688484","SH_STAR","半导体"],
  ["柏楚电子","688188","SH_STAR","工业"],["绿的谐波","688017","SH_STAR","工业"],
  /* ---------- 第三批 · 深交所主板/创业板 ---------- */
  ["古井贡酒","000596","SZ_MAIN","消费"],["深圳能源","000027","SZ_MAIN","能源与公用事业"],
  ["河钢股份","000709","SZ_MAIN","原材料"],["科伦药业","002422","SZ_MAIN","医疗健康"],
  ["丽珠集团","000513","SZ_MAIN","医疗健康"],["万兴科技","300624","SZ_GEM","信息技术"],
  ["拓尔思","300229","SZ_GEM","信息技术"],["卫宁健康","300253","SZ_GEM","信息技术"],
  ["新产业","300832","SZ_GEM","医疗健康"],["万孚生物","300482","SZ_GEM","医疗健康"],
  /* ---------- 第三批 · 美国 ---------- */
  ["财捷","INTU","NASDAQ","信息技术"],["自动数据处理","ADP","NASDAQ","信息技术"],
  ["派拓网络","PANW","NASDAQ","信息技术"],["飞塔信息","FTNT","NASDAQ","信息技术"],
  ["MicroStrategy","MSTR","NASDAQ","金融"],["AppLovin","APP","NASDAQ","信息技术"],
  ["黑石集团","BX","NYSE","金融"],["KKR","KKR","NYSE","金融"],
  ["美国合众银行","USB","NYSE","金融"],["迪尔","DE","NYSE","工业"],
  ["宣伟","SHW","NYSE","原材料"],["艺康集团","ECL","NYSE","原材料"],
  /* ---------- 第三批 · 香港 ---------- */
  ["蒙牛乳业","2319.HK","HK_MAIN","消费"],["康师傅控股","0322.HK","HK_MAIN","消费"],
  ["恒安国际","1044.HK","HK_MAIN","消费"],["申洲国际","2313.HK","HK_MAIN","消费"],
  ["银河娱乐","0027.HK","HK_MAIN","消费"],["中国旺旺","0151.HK","HK_MAIN","消费"],
  /* ---------- 第三批 · 韩国 ---------- */
  ["韩亚金融","086790.KS","KOSPI","金融"],["友利金融","316140.KS","KOSPI","金融"],
  ["现代制铁","004020.KS","KOSPI","原材料"],["大韩航空","003490.KS","KOSPI","工业"],
  ["首尔半导体","046890.KQ","KOSDAQ","半导体"],["Partron","091700.KQ","KOSDAQ","信息技术"]
];

/* ================= 种子展开：补全目录字段（确定性伪随机，全部标注模拟） ================= */

(function expandSeeds() {
  var TPL = {
    "信息技术": ["云与 AI 相关业务收入增速超 40%，订阅占比持续提升", "新一代产品发布，机构预计年内订单能见度改善"],
    "半导体": ["先进制程产能爬坡顺利，晶圆出货量环比 +12%", "获大客户新平台认证，明年份额预期上调"],
    "消费": ["季度同店销售增速转正，渠道库存回落至健康水位", "发布渠道改革与产品升级方案，聚焦高端化"],
    "医疗健康": ["核心管线 III 期临床达到主要终点，拟提交上市申请", "海外授权（License-out）落地，首付款到账"],
    "金融": ["中期业绩：净息差企稳，不良率环比下降", "拟提高中期分红比例，资本充足率保持高位"],
    "工业": ["新增大额订单公告，排产计划上调至满产", "海外产能基地投产，本地化交付能力增强"],
    "能源与公用事业": ["月度运营数据创新高，股息率维持吸引力区间", "与大型数据中心签署长期供电协议"],
    "原材料": ["主力产品价格环比上涨，库存去化加速", "海外资源项目投产，权益产量同比 +18%"],
    "通信服务": ["用户 ARPU 环比提升，云/AI/内容新业务贡献增量", "发布新一代自研模型，商业化进程超预期"],
    "房地产": ["核心城市土拍补库，销售降幅连续收窄", "完成债务展期与融资置换，现金流压力缓解"]
  };
  var CN_SUFFIX = { SH_MAIN: ".SH", SH_STAR: ".SH", SZ_MAIN: ".SZ", SZ_GEM: ".SZ", BSE: ".BJ" };

  function exMarket(exId) {
    var keys = Object.keys(COUNTRIES);
    for (var i = 0; i < keys.length; i++) {
      var exs = COUNTRIES[keys[i]].exchanges;
      for (var j = 0; j < exs.length; j++) if (exs[j].id === exId) return keys[i];
    }
    return "CN";
  }

  SEEDS.forEach(function (s, idx) {
    var name = s[0], code = s[1], exId = s[2], sector = s[3];
    var mkt = exMarket(exId);
    var m = MARKETS[mkt];
    if (mkt === "CN" && code.indexOf(".") < 0) code += CN_SUFFIX[exId];

    var id = "s" + idx;
    var seed = hashStr(id + code);
    var rv = function (min, max, k) {
      var x = ((seed * (k * 53 + 7)) % 1000) / 1000;
      return min + (max - min) * x;
    };

    var price = mkt === "KR"
      ? Math.round(rv(6000, 380000, 1)).toLocaleString("en-US")
      : rv(6, mkt === "CN" ? 380 : 880, 1).toFixed(2);
    var pNum = parseFloat(String(price).replace(/,/g, ""));

    var chgV = rv(-3.2, 3.2, 2);
    var dirUp = chgV >= 0;

    var capV = pNum * rv(0.4, 6, 3);
    var cap = capV >= 10000
      ? m.curSym + (capV / 10000).toFixed(2) + " 万亿"
      : m.curSym + Math.round(capV).toLocaleString("en-US") + " 亿";

    var instV = rv(0.1, 1.6, 4);
    var instPos = rv(0, 1, 5) < 0.72;

    var holderRoll = rv(0, 1, 6);
    var holder = "—", holderDir = "neu";
    if (holderRoll < 0.20) { holder = "主要股东 -" + rv(0.1, 0.9, 7).toFixed(1) + "pct"; holderDir = "neg"; }
    else if (holderRoll < 0.28) { holder = "控股股东增持 +" + rv(0.1, 0.6, 8).toFixed(1) + "pct"; holderDir = "pos"; }

    var tpl = TPL[sector];
    var evText = tpl[Math.floor(rv(0, tpl.length - 0.001, 9))];

    var month = rv(0, 1, 10) < 0.7 ? "07" : "06";
    var day = String(1 + Math.floor(rv(0, 27.9, 11)));
    if (day.length < 2) day = "0" + day;

    var digits = code.replace(/[^0-9]/g, "");

    DIRECTORY.push({
      id: id, name: name, nameEn: "", code: code, market: mkt, ex: exId, sector: sector,
      aliases: digits ? [digits] : [code.toLowerCase().replace(".", "")],
      cap: cap, price: String(price),
      chg: (dirUp ? "+" : "") + chgV.toFixed(2) + "%", dir: dirUp ? "up" : "down",
      inst: (instPos ? "+" : "-") + instV.toFixed(1) + "pct", instDir: instPos ? "pos" : "neg",
      holder: holder, holderDir: holderDir,
      event: evText, disc: "2026-" + month + "-" + day
    });
  });
})();

/* ES Module 导出：供浏览器 module 脚本与 Pages Functions 复用 */
export { TYPE_META, IMPACT_META, MARKETS, DATA_SOURCE, UPDATE_TIME, COMPANIES, EVENTS, COUNTRIES, SECTORS, DIRECTORY };

