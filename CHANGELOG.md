# Changelog

本项目的所有重要变更将记录在此文件中。

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [0.3.0] - 2026-08-02

### Added
- 第三批新增 50 家模拟公司：中国大陆 26 家（中国中车、格科微、恒玄科技、古井贡酒、万兴科技等）、美国 12 家（财捷、派拓网络、AppLovin、黑石、KKR、迪尔等）、香港 6 家（蒙牛乳业、申洲国际、银河娱乐等）、韩国 6 家（韩亚金融、大韩航空、首尔半导体等）
- 全库模拟公司覆盖达 658 家
- 部署入口 `demo/index.html` 纳入版本管理

### Fixed
- 修复部署入口 `demo/index.html` 未同步第三批公司数据的问题

## [0.2.0] - 2026-08-02

### Added
- V2 跨市场证券数据平台：全局跨市场搜索（代码/中文/英文/简称）
- 「国家/地区 → 交易市场 → 板块/行业 → 公司数据库」逐层浏览与面包屑导航
- 公司数据档案页六大模块：事件 Timeline、行情与估值、盈利与财务、股东与持仓、财报与公告、对比与历史
- 600+ 家模拟公司（种子一行 + 确定性生成器扩库机制）
- 部署至 Cloudflare Pages：<https://vibe-coding-4vf.pages.dev>

### Changed
- 仓库精简为 `demo/` 目录（mailuo-v1.html / mailuo-v2.html）+ README

## [0.1.0] - 2026-08-02

### Added
- V1 主题式金融研究 Timeline 原型
- 初始版本管理与 GitHub 远程仓库
