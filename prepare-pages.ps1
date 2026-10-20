$ErrorActionPreference = 'Stop'
$siteRoot = $PSScriptRoot
$siteOutput = Join-Path $siteRoot 'dist'
$allowedFiles = @('index.html', 'app.js', 'data-protection.js', '_headers')

# Publish only browser assets; never upload repository backups or database exports.
if (Test-Path -LiteralPath $siteOutput) {
    $unexpected = Get-ChildItem -LiteralPath $siteOutput -Force |
        Where-Object { $_.PSIsContainer -or $_.Name -notin $allowedFiles }
    if ($unexpected) { throw 'Unexpected files in dist. Inspect them before preparing a deployment.' }
} else {
    New-Item -ItemType Directory -Path $siteOutput | Out-Null
}

$pageText = Get-Content -LiteralPath (Join-Path $siteRoot 'index.html') -Raw
if ($pageText -notmatch 'data-protection.js') { throw 'Protection script is missing from index.html.' }
foreach ($name in @('index.html', 'app.js', 'data-protection.js')) {
    Copy-Item -LiteralPath (Join-Path $siteRoot $name) -Destination (Join-Path $siteOutput $name)
    $sourceHash = (Get-FileHash -LiteralPath (Join-Path $siteRoot $name) -Algorithm SHA256).Hash
    $outputHash = (Get-FileHash -LiteralPath (Join-Path $siteOutput $name) -Algorithm SHA256).Hash
    if ($sourceHash -ne $outputHash) { throw "Asset copy verification failed: $name" }
}

@'
/*
  Cache-Control: no-cache
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
'@ | Set-Content -LiteralPath (Join-Path $siteOutput '_headers') -Encoding utf8

Write-Output 'Prepared verified browser assets for gyeonggi-edu-lms only.'
