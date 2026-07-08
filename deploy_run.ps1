$ErrorActionPreference = 'Continue'
Set-Location C:\Users\forrydev\Desktop\LandMap
"=== deploy 1005 start $(Get-Date) ===" | Out-File -Append deploy_1005.log
try {
  npx vercel deploy --prod --yes *>> deploy_1005.log
  "EXITCODE=$LASTEXITCODE" | Out-File -Append deploy_1005.log
} catch {
  "DEPLOY_ERROR: $_" | Out-File -Append deploy_1005.log
}
"=== deploy 1005 end $(Get-Date) ===" | Out-File -Append deploy_1005.log
