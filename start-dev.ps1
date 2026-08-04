# 脉络 · 本地开发一键启动（静态页 + Pages Functions 真实行情 API）
# 用法：在仓库根目录执行  powershell -ExecutionPolicy Bypass -File .\start-dev.ps1
# 注意：必须从 demo 目录启动，wrangler 才能识别 demo/functions

$node = (Get-Command node).Source
$wrangler = Join-Path $PSScriptRoot "node_modules\wrangler\bin\wrangler.js"

if (-not (Test-Path $wrangler)) {
  Write-Host "未找到 wrangler，请先执行：npm install -D wrangler" -ForegroundColor Red
  exit 1
}

Set-Location (Join-Path $PSScriptRoot "demo")
& $node $wrangler pages dev . --port 8788 --d1 DB
