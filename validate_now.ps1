$base = 'https://landmap-kxx71uxnv-dizzys-projects-d5a44b36.vercel.app'
$out = 'validate_now.log'
"" | Set-Content $out

$pages = @('/', '/pt-BR', '/en-US', '/es-ES',
  '/pt-BR/search', '/pt-BR/map', '/pt-BR/compare', '/pt-BR/favorites',
  '/pt-BR/alerts', '/pt-BR/chat', '/pt-BR/docs', '/pt-BR/pricing',
  '/pt-BR/calculator', '/pt-BR/sales', '/pt-BR/studio', '/pt-BR/status',
  '/pt-BR/live', '/pt-BR/property/1', '/pt-BR/admin', '/pt-BR/nao-existe')

$apis = @('/api/health', '/api/stats', '/api/cities', '/api/markdowns',
  '/api/compare?ids=1,2', '/api/kpi', '/api/integrations/opendesign/feed',
  '/api/sales/state', '/api/analyze?q=imovel%20curitiba')

function Check($method, $path, $body) {
  $url = $base + $path
  try {
    $r = if ($method -eq 'POST') {
      Invoke-WebRequest -Uri $url -Method POST -ContentType 'application/json' -Body $body -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop
    } else {
      Invoke-WebRequest -Uri $url -Method GET -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop
    }
    "$method $path -> $($r.StatusCode)" | Out-File -Append $out
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    "$method $path -> ERR $code ($($_.Exception.Message))" | Out-File -Append $out
  }
}

foreach ($p in $pages) { Check 'GET' $p $null }
foreach ($p in $apis) { Check 'GET' $p $null }
Check 'POST' '/api/search' '{"query":"","type":"","modality":"","city":"Curitiba","state":""}'
Check 'POST' '/api/sales/cycle' '{"autonomy":"autopilot"}'

Write-Host "=== RESULTADOS (base $base) ==="
Get-Content $out
$ok = (Get-Content $out | Where-Object { $_ -match '-> 2' }).Count
$err = (Get-Content $out | Where-Object { $_ -match 'ERR' }).Count
Write-Host "=== 2xx: $ok | ERROS: $err ==="
