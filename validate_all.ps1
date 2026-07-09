# validate_all.ps1 — bateria completa de validacao (desacoplado)
$ErrorActionPreference = 'Continue'
Set-Location C:\Users\forrydev\Desktop\LandMap
$log = 'validate_all.log'
"" | Set-Content $log
function Section($t){ "===== $t $(Get-Date -Format 'HH:mm:ss') =====" | Add-Content $log; Write-Host $t }

Section 'BUILD'
pnpm -r build > build_all.log 2>&1
"BUILD_EXIT=$LASTEXITCODE" | Add-Content $log

Section 'LINT'
pnpm -r lint > lint_all.log 2>&1
"LINT_EXIT=$LASTEXITCODE" | Add-Content $log

Section 'TYPECHECK'
pnpm -r typecheck > typecheck_all.log 2>&1
"TYPECHECK_EXIT=$LASTEXITCODE" | Add-Content $log

Section 'TEST'
pnpm test > test_all.log 2>&1
"TEST_EXIT=$LASTEXITCODE" | Add-Content $log

Section 'DONE'
"ALL DONE" | Add-Content $log
