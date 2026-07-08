$ErrorActionPreference = 'Continue'
Set-Location C:\Users\forrydev\Desktop\LandMap
"" | Out-File domains_inspect.log
foreach ($d in @('landmap.com.br','landmap.us.kg','getlandmap.app')) {
  "===== $d =====" | Out-File -Append domains_inspect.log
  npx vercel domains inspect $d *>> domains_inspect.log
  "" | Out-File -Append domains_inspect.log
}
"DONE" | Out-File -Append domains_inspect.log
