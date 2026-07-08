$ErrorActionPreference = 'Continue'
Set-Location C:\Users\forrydev\Desktop\LandMap
"=== pnpm packages build ===" | Out-File -Append all_build.log
pnpm -r --filter './packages/*' run build *>> all_build.log
"=== web build ===" | Out-File -Append all_build.log
Set-Location C:\Users\forrydev\Desktop\LandMap\apps\web
pnpm run build *>> C:\Users\forrydev\Desktop\LandMap\all_build.log
"DEPLOY_BUILD_DONE_EXIT_$LASTEXITCODE" | Out-File -Append C:\Users\forrydev\Desktop\LandMap\all_build.log
