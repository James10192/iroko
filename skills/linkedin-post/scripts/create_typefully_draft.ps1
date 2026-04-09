param(
  [Parameter(Mandatory=$true)][string]$SocialSetId,
  [Parameter(Mandatory=$true)][string]$FilePath,
  [string]$Platform = "linkedin"
)

if (-not (Test-Path $FilePath)) {
  Write-Error "File not found: $FilePath"
  exit 1
}

$text = Get-Content -Raw $FilePath
typefully-cli drafts create $SocialSetId --text $text --platform $Platform
