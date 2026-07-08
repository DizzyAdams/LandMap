$base = 'https://landmap-dvtu0ooac-dizzys-projects-d5a44b36.vercel.app'
$out = 'validate_1005.log'
"" | Set-Content $out
function Check($method, $path, $body = $null) {
  try {
    $params = @{ Uri = ($base + $path); UseBasicParsing = $true; TimeoutSec = 30; ErrorAction = 'Stop' }
    if ($method -eq 'POST') {
      $params.Method = 'POST'
      $params.ContentType = 'application/json'
      if ($body) { $params.Body = $body }
    }
    $r = Invoke-WebRequest @params
    $snip = ''
    if ($path -like '/api/*' -or $path -like '*/api/*') {
      $snip = '  ' + ($r.Content.Substring(0, [Math]::Min(120, $r.Content.Length)))
    }
    "$($r.StatusCode)  $method  $path$snip" | Out-File -Append $out
  } catch {
    $code = 'ERR'
    if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
    "$code  $method  $path  -> $($_.Exception.Message)" | Out-File -Append $out
  }
}

# Pages (locales + routes)
$pages = @('/', '/pt-BR', '/en-US', '/es-ES',
  '/pt-BR/search', '/pt-BR/map', '/pt-BR/compare', '/pt-BR/favorites',
  '/pt-BR/alerts', '/pt-BR/chat', '/pt-BR/docs', '/pt-BR/pricing',
  '/pt-BR/calculator', '/pt-BR/sales', '/pt-BR/studio', '/pt-BR/status',
  '/pt-BR/live', '/pt-BR/property/1', '/pt-BR/admin')
foreach ($p in $pages) { Check 'GET' $p }

# API GET skills
$apis = @('/api/health', '/api/stats', '/api/cities', '/api/markdowns',
  '/api/compare?ids=1,2', '/api/kpi', '/api/integrations/opendesign/feed',
  '/api/sales/state', '/api/analyze?q=imovel%20curitiba')
foreach ($a in $apis) { Check 'GET' $a }

# API POST skills
Check 'POST' '/api/search' '{"query":"","type":"","modality":"","city":"Curitiba","state":""}'
Check 'POST' '/api/sales/cycle' '{"autonomy":"autopilot"}'

"DONE" | Out-File -Append $out
Get-Content $out