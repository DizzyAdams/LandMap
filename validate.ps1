$base = "https://landmap-dizzys-projects-d5a44b36.vercel.app"
$gets = @("/", "/pt-BR", "/en-US", "/es-ES", "/pt-BR/search", "/pt-BR/map", "/pt-BR/compare", "/pt-BR/favorites", "/pt-BR/alerts", "/pt-BR/chat", "/pt-BR/docs", "/pt-BR/pricing", "/pt-BR/calculator", "/pt-BR/sales", "/pt-BR/property/1", "/api/health", "/api/stats", "/api/cities", "/api/markdowns", "/api/compare?ids=1,2", "/api/sales/state")
foreach ($p in $gets) {
  try {
    $r = Invoke-WebRequest -Uri ($base + $p) -UseBasicParsing -TimeoutSec 20 -ErrorAction Stop
    $snip = ""
    if ($p -like "/api/*") { $snip = "  " + ($r.Content.Substring(0, [Math]::Min(110, $r.Content.Length))) }
    "$($r.StatusCode)  GET  $p$snip" | Out-File -Append validate.log
  } catch {
    $code = "ERR"
    if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
    "$code  GET  $p  -> $($_.Exception.Message)" | Out-File -Append validate.log
  }
}
# POST /api/search
try {
  $r = Invoke-WebRequest -Uri ($base + "/api/search") -Method POST -ContentType "application/json" -Body '{"query":"","type":"","modality":"","city":"","state":""}' -UseBasicParsing -TimeoutSec 20 -ErrorAction Stop
  "POST /api/search -> $($r.StatusCode)  " + ($r.Content.Substring(0, [Math]::Min(110, $r.Content.Length))) | Out-File -Append validate.log
} catch {
  $code = "ERR"
  if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
  "POST /api/search -> $code  -> $($_.Exception.Message)" | Out-File -Append validate.log
}
# POST /api/sales/cycle — run one autonomous agent cycle
try {
  $r = Invoke-WebRequest -Uri ($base + "/api/sales/cycle") -Method POST -ContentType "application/json" -Body '{"autonomy":"autopilot"}' -UseBasicParsing -TimeoutSec 20 -ErrorAction Stop
  "POST /api/sales/cycle -> $($r.StatusCode)" | Out-File -Append validate.log
} catch {
  $code = "ERR"
  if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
  "POST /api/sales/cycle -> $code  -> $($_.Exception.Message)" | Out-File -Append validate.log
}
"DONE" | Out-File -Append validate.log
