param(
  [Parameter(Mandatory = $true)]
  [string]$SupabaseUrl,
  [Parameter(Mandatory = $true)]
  [string]$AnonKey,
  [string]$HouseholdId = ""
)

$ErrorActionPreference = "Stop"

if (-not $HouseholdId) {
  $HouseholdId = [guid]::NewGuid().ToString()
  Write-Host "Generated household ID: $HouseholdId"
}

$envContent = @"
VITE_SUPABASE_URL=$SupabaseUrl
VITE_SUPABASE_ANON_KEY=$AnonKey
VITE_HOUSEHOLD_ID=$HouseholdId
"@

Set-Content -Path (Join-Path $PSScriptRoot "..\.env") -Value $envContent -Encoding utf8
Write-Host "Wrote .env (local only, gitignored)"

gh secret set VITE_SUPABASE_URL --body $SupabaseUrl -R belcho/the-daily-donna
gh secret set VITE_SUPABASE_ANON_KEY --body $AnonKey -R belcho/the-daily-donna
gh secret set VITE_HOUSEHOLD_ID --body $HouseholdId -R belcho/the-daily-donna
Write-Host "GitHub Actions secrets updated."

gh workflow run "Deploy to GitHub Pages" -R belcho/the-daily-donna
Write-Host "Triggered GitHub Pages deploy."

Write-Host "Next: Apply database migrations — see README (supabase db push or GitHub Supabase migrations workflow)."
Write-Host "Household ID for this app: $HouseholdId"
