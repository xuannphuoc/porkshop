# Read PUBLISH_TO_GITHUB.md before running.
$ErrorActionPreference = "Stop"
$sourceDirectory = $PSScriptRoot
$parentDirectory = Split-Path $sourceDirectory -Parent
$targetDirectory = Join-Path $parentDirectory "porkshop-github-reviewed"
$repositoryUrl = "https://github.com/xuannphuoc/porkshop.git"
$branchName = "feature/porkshop-qa-refactor-20261125"

if (Test-Path -LiteralPath $targetDirectory) {
  throw "Thư mục $targetDirectory đã tồn tại. Hãy đổi tên hoặc chọn vị trí khác."
}

Write-Host "Cloning existing repository..."
git clone $repositoryUrl $targetDirectory
if ($LASTEXITCODE -ne 0) { throw "Git clone thất bại." }

Push-Location $targetDirectory
try {
  git switch -c $branchName
  if ($LASTEXITCODE -ne 0) { throw "Không tạo được branch." }

  Write-Host "Copying Pork Shop source files..."
  Get-ChildItem -LiteralPath $sourceDirectory -Force | ForEach-Object {
    if ($_.Name -ne "node_modules" -and $_.Name -ne "dist" -and $_.Name -ne ".git") {
      Copy-Item -LiteralPath $_.FullName -Destination $targetDirectory -Recurse -Force
    }
  }

  # Xóa những file demo của Vite cũ đã được thay thế ở dự án mới.
  $obsoleteFiles = @("src/App.css", "src/assets/react.svg", "src/assets/vite.svg", "src/assets/hero.png", "public/icons.svg")
  foreach ($obsoleteFile in $obsoleteFiles) {
    $obsoletePath = Join-Path $targetDirectory $obsoleteFile
    if (Test-Path -LiteralPath $obsoletePath) {
      Remove-Item -LiteralPath $obsoletePath -Force
    }
  }

  Write-Host "Installing and validating dependencies..."
  npm.cmd install
  if ($LASTEXITCODE -ne 0) { throw "npm install thất bại." }
  npm.cmd run validate:data
  if ($LASTEXITCODE -ne 0) { throw "JSON validation thất bại." }
  npm.cmd run test
  if ($LASTEXITCODE -ne 0) { throw "Unit tests thất bại." }
  npm.cmd run check:imports
  if ($LASTEXITCODE -ne 0) { throw "Import validation thất bại." }
  npm.cmd run lint
  if ($LASTEXITCODE -ne 0) { throw "ESLint thất bại." }
  npm.cmd run build
  if ($LASTEXITCODE -ne 0) { throw "Build thất bại. Không push." }

  git add .
  if ($LASTEXITCODE -ne 0) { throw "Git add thất bại." }
  git commit -m "refactor: test and improve Pork Shop demo"
  if ($LASTEXITCODE -ne 0) { throw "Git commit thất bại." }
  git push -u origin $branchName
  if ($LASTEXITCODE -ne 0) { throw "Git push thất bại." }

  Write-Host "Branch đã được push. Hãy tạo PR trên GitHub: $repositoryUrl"
} finally {
  Pop-Location
}
