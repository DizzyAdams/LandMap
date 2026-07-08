$ErrorActionPreference = 'Continue'
Set-Location C:\Users\forrydev\Desktop\LandMap
"=== deploy final start $(Get-Date) ===" | Out-File -Append deploy_final.log
try {
  npx vercel deploy --prod --yes *>> deploy_final.log
  "EXITCODE=$LASTEXITCODE" | Out-File -Append deploy_final.log
} catch {
  "DEPLOY_ERROR: $_" | Out-File -Append deploy_final.log
}
"=== deploy final end $(Get-Date) ===" | Out-File -Append deploy_final.log
