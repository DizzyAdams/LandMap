# set_ns_registrobr.ps1
# Automatiza (GRATUITO) a virada do NS de um dominio .br para a Vercel,
# usando a API de DNS do Registro.br com o Certificado de Acesso (gratuito).
#
# Pre-requisitos (do usuario, 1x, gratuito):
#   1. Solicitar o "Certificado de Acesso" em registro.br -> Desenvolvedor.
#   2. Exportar o certificado para arquivos PEM:
#        - $env:REGISTROBR_CERT  = caminho do certificado publico  (ex.: C:\certs\landmap.crt)
#        - $env:REGISTROBR_KEY   = caminho da chave privada         (ex.: C:\certs\landmap.key)
#   3. Rodar:  pwsh set_ns_registrobr.ps1
#
# O que faz: troca o NS do dominio para ns1.vercel-dns.com / ns2.vercel-dns.com
# (Vercel passa a autorizar e emite SSL sozinho apos a propagacao).

$ErrorActionPreference = 'Continue'
$Domain = 'landmap.com.br'
$Cert   = $env:REGISTROBR_CERT
$Key    = $env:REGISTROBR_KEY

if (-not $Cert -or -not $Key) {
  Write-Host "ERRO: defina as variaveis de ambiente REGISTROBR_CERT e REGISTROBR_KEY (caminhos dos PEM do certificado de acesso do Registro.br)." -ForegroundColor Red
  Write-Host "Como obter (gratuito): registro.br -> Desenvolvedor -> solicitar Certificado de Acesso."
  exit 1
}

# Endpoint da API de DNS do Registro.br (mTLS com o certificado de acesso).
# Ref: https://registro.br/... (documentacao do programador). Ajuste se a rota mudar.
$api = "https://registro.br/v1/domains/$Domain/dns/ns"
$body = @{ ns = @('ns1.vercel-dns.com', 'ns2.vercel-dns.com') } | ConvertTo-Json -Compress

try {
  $r = Invoke-RestMethod -Uri $api -Method Put -ContentType 'application/json' `
        -Body $body -Certificate $Cert -CertificateKey $Key -TimeoutSec 30
  Write-Host "SUCESSO: NS de $Domain atualizado para Vercel." -ForegroundColor Green
  $r | ConvertTo-Json -Depth 5
}
catch {
  Write-Host "FALHA ao chamar API do Registro.br:" -ForegroundColor Red
  Write-Host $_.Exception.Message
  if ($_.Exception.Response) {
    $code = $_.Exception.Response.StatusCode.value__
    Write-Host "HTTP $code"
  }
  exit 1
}
