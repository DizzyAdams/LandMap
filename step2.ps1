$base = 'https://landmap-dizzys-projects-d5a44b36.vercel.app'

Write-Host '=== CHAMADA 1: POST /api/search city=Curitiba type=apartamento ==='
$body1 = @{ city='Curitiba'; type='apartamento' } | ConvertTo-Json
try {
    $r = Invoke-WebRequest -Uri "$base/api/search" -Method POST -ContentType 'application/json; charset=utf-8' -Body $body1 -UseBasicParsing -ErrorAction Stop
    Write-Host ('STATUS: ' + $r.StatusCode)
    Write-Host ('BODY: ' + $r.Content)
} catch {
    Write-Host ('STATUS_ERR: ' + $_.Exception.Response.StatusCode.Value__)
    Write-Host ('BODY: ' + $_.ErrorDetails.Message)
}

Write-Host ''
Write-Host '=== CHAMADA 2: POST /api/search type=xyz-invalid (entrada invalida) ==='
$body2 = @{ type='xyz-invalid' } | ConvertTo-Json
try {
    $r = Invoke-WebRequest -Uri "$base/api/search" -Method POST -ContentType 'application/json' -Body $body2 -UseBasicParsing -ErrorAction Stop
    Write-Host ('STATUS_OK: ' + $r.StatusCode)
    Write-Host ('BODY: ' + $r.Content)
} catch {
    Write-Host ('STATUS_ERR: ' + $_.Exception.Response.StatusCode.Value__)
    Write-Host ('BODY: ' + $_.ErrorDetails.Message)
}
