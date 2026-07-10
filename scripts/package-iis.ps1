# -----------------------------------------------------------------------------
# Build + package the IIS / Windows Server deployment bundle.
#
#   .\scripts\package-iis.ps1            # npm run build, assemble, zip
#   .\scripts\package-iis.ps1 -SkipBuild # reuse the existing .next build
#   .\scripts\package-iis.ps1 -ResendKey re_xxx   # bake RESEND_API_KEY into the
#       bundle's web.config + start.bat (deploy\ and the zip are git-ignored, so
#       the key never reaches the repo; the tracked templates stay clean)
#
# Output:
#   deploy\kaizen-infotech-iis\      the assembled bundle (git-ignored)
#   ..\kaizen-infotech-iis.zip       the upload artifact  (git-ignored)
#
# The bundle = .next/standalone (server.js + trimmed node_modules) with the two
# folders Next does NOT copy into it (.next/static and public/) added, plus the
# hand-written IIS files from scripts\iis-template\.
# -----------------------------------------------------------------------------
param([switch]$SkipBuild, [string]$ResendKey, [string]$CaptchaSecret)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot   # repo root (parent of scripts\)
Set-Location $root

if (-not $SkipBuild) {
  Write-Host '== npm run build ==' -ForegroundColor Cyan
  npm run build
  if ($LASTEXITCODE -ne 0) { throw "next build failed (exit $LASTEXITCODE)" }
}

$standalone = Join-Path $root '.next\standalone'
if (-not (Test-Path (Join-Path $standalone 'server.js'))) {
  throw ".next\standalone\server.js not found - run without -SkipBuild"
}

$bundle = Join-Path $root 'deploy\kaizen-infotech-iis'
Write-Host "== assembling $bundle ==" -ForegroundColor Cyan
if (Test-Path $bundle) { Remove-Item -Recurse -Force $bundle }
New-Item -ItemType Directory -Force $bundle | Out-Null

# 1. standalone server (server.js, trimmed node_modules, compiled .next/server).
#    NOTE: Next 16 standalone already contains a partial `public\` (traced files
#    like data\blogs.json) — so steps 2/3 must merge CONTENTS into existing dirs,
#    never copy the folder itself (Copy-Item would nest it: public\public\...).
Copy-Item -Recurse -Force "$standalone\*" $bundle
# 2. full static assets — standalone only includes traced files
New-Item -ItemType Directory -Force (Join-Path $bundle '.next\static') | Out-Null
Copy-Item -Recurse -Force "$root\.next\static\*" (Join-Path $bundle '.next\static')
New-Item -ItemType Directory -Force (Join-Path $bundle 'public') | Out-Null
Copy-Item -Recurse -Force "$root\public\*" (Join-Path $bundle 'public')
# 3. hand-written IIS files
$tpl = Join-Path $root 'scripts\iis-template'
Copy-Item (Join-Path $tpl 'web.config')        $bundle
Copy-Item (Join-Path $tpl 'start.bat')         $bundle
Copy-Item (Join-Path $tpl 'README-DEPLOY.txt') $bundle
Copy-Item (Join-Path $tpl '.env.example')      $bundle
New-Item -ItemType Directory -Force (Join-Path $bundle 'logs') | Out-Null
Copy-Item (Join-Path $tpl 'logs-README.txt') (Join-Path $bundle 'logs\README.txt')

# 3b. optional: bake the Resend key into the BUNDLE copies only (never the templates)
if ($ResendKey) {
  Write-Host '== injecting RESEND_API_KEY into bundle web.config + start.bat ==' -ForegroundColor Cyan
  $wc = Join-Path $bundle 'web.config'
  (Get-Content $wc -Raw) -replace '<environmentVariable name="NODE_ENV" value="production" />',
    ("<environmentVariable name=`"NODE_ENV`" value=`"production`" />`r`n        <environmentVariable name=`"RESEND_API_KEY`" value=`"$ResendKey`" />") |
    Set-Content $wc -NoNewline
  $sb = Join-Path $bundle 'start.bat'
  (Get-Content $sb -Raw) -replace 'REM set RESEND_API_KEY=\.\.\.', "set RESEND_API_KEY=$ResendKey" |
    Set-Content $sb -NoNewline
}

# 3c. optional: random captcha-token signing secret (default is public in the repo,
#     so production should always override it — pass e.g. two concatenated GUIDs)
if ($CaptchaSecret) {
  Write-Host '== injecting CAPTCHA_SECRET into bundle web.config + start.bat ==' -ForegroundColor Cyan
  $wc = Join-Path $bundle 'web.config'
  (Get-Content $wc -Raw) -replace '<environmentVariable name="NODE_ENV" value="production" />',
    ("<environmentVariable name=`"NODE_ENV`" value=`"production`" />`r`n        <environmentVariable name=`"CAPTCHA_SECRET`" value=`"$CaptchaSecret`" />") |
    Set-Content $wc -NoNewline
  $sb = Join-Path $bundle 'start.bat'
  (Get-Content $sb -Raw) -replace 'REM set CAPTCHA_SECRET=\.\.\.', "set CAPTCHA_SECRET=$CaptchaSecret" |
    Set-Content $sb -NoNewline
}

# Sanity: every /images/blog/* path referenced by blogs.json must be in the bundle.
$blogsJson = Join-Path $bundle 'public\data\blogs.json'
$missing = @()
if (Test-Path $blogsJson) {
  $refs = [regex]::Matches((Get-Content $blogsJson -Raw), '/images/blog/[A-Za-z0-9_./-]+\.(png|jpe?g|webp|gif|svg)') |
    ForEach-Object { $_.Value } | Sort-Object -Unique
  $missing = $refs | Where-Object { -not (Test-Path (Join-Path $bundle ('public' + ($_ -replace '/', '\')))) }
  Write-Host ("blog image check: {0} referenced, {1} missing" -f $refs.Count, $missing.Count)
} else {
  Write-Warning 'public\data\blogs.json missing from bundle!'
}
if ($missing) { $missing | ForEach-Object { Write-Warning "missing: $_" }; throw 'bundle is incomplete' }

# 4. zip (top-level folder inside the zip = kaizen-infotech-iis)
$zip = Join-Path (Split-Path -Parent $root) 'kaizen-infotech-iis.zip'
Write-Host "== zipping to $zip ==" -ForegroundColor Cyan
if (Test-Path $zip) { Remove-Item -Force $zip }
& "$env:SystemRoot\System32\tar.exe" -a -cf $zip -C (Join-Path $root 'deploy') 'kaizen-infotech-iis'
if ($LASTEXITCODE -ne 0) { throw "zip failed (exit $LASTEXITCODE)" }

Write-Host ("DONE  {0}  ({1:N0} MB)" -f $zip, ((Get-Item $zip).Length / 1MB)) -ForegroundColor Green
Write-Host 'Smoke-test the bundle:  cd deploy\kaizen-infotech-iis; .\start.bat  ->  http://localhost:3000'
