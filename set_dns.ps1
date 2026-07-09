# set_dns.ps1
# Configura automaticamente os registros DNS na Vercel para todos os dominios do LandMap.
# Uso:  pwsh set_dns.ps1
#
# O que este script faz (automatizavel via Vercel CLI):
#   - Cria o registro A do apex  -> 76.76.21.21  (Vercel edge)
#   - Cria o CNAME www           -> cname.vercel-dns.com
# para cada dominio abaixo.
#
# IMPORTANTE (passo MANUAL, nao automatizavel por aqui):
#   Para que esses registros facam efeito, os nameservers de CADA dominio devem
#   apontar para a Vercel no painel do respectivo registrador/provider:
#       ns1.vercel-dns.com
#       ns2.vercel-dns.com
#   - landmap.com.br  -> Registro.br (alterar NS de a.auto.dns.br / b.auto.dns.br para os da Vercel)
#   - landmap.us.kg   -> painel nic.us.kg / register.us.kg
#   - getlandmap.app  -> painel do registrar do .app
#   Apos trocar os NS, a Vercel valida e emite o certificado SSL automaticamente.

$ErrorActionPreference = 'Continue'
Set-Location C:\Users\forrydev\Desktop\LandMap

$domains = @('landmap.com.br', 'landmap.us.kg', 'getlandmap.app')
$log = 'set_dns.log'
"" | Set-Content $log
"=== set_dns $(Get-Date) ===" | Add-Content $log

function AddRecord($domain, $name, $type, $value) {
  $out = npx vercel dns add $domain $name $type $value 2>&1 | ForEach-Object { $_ -replace [char]0, '' }
  $out | Add-Content $log
  if ($out -match 'Success') { "  [OK]   $type $name -> $value" | Add-Content $log }
  elseif ($out -match 'already exists' -or $out -match 'duplicate' -or $out -match 'conflict') {
    "  [SKIP] $type $name ja existe" | Add-Content $log
  }
  else { "  [WARN] $type $name -> $out" | Add-Content $log }
}

foreach ($d in $domains) {
  "=== $d ===" | Add-Content $log
  AddRecord $d '@'    A      76.76.21.21
  AddRecord $d 'www'  CNAME  cname.vercel-dns.com
}

"" | Add-Content $log
"ACAO MANUAL REQUERIDA: trocar os nameservers de cada dominio para ns1.vercel-dns.com / ns2.vercel-dns.com no respectivo registrador." | Add-Content $log
"DONE" | Add-Content $log
Write-Host "DNS configurado. Veja set_dns.log. Acao manual: trocar nameservers para a Vercel."
