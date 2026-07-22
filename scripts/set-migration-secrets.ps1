# Sets GitHub Actions secrets for automatic Supabase migrations.
# Get token: https://supabase.com/dashboard/account/tokens
# Get DB password: Supabase project → Settings → Database (reset if needed)

param(
  [Parameter(Mandatory = $true)]
  [string]$SupabaseAccessToken,
  [Parameter(Mandatory = $true)]
  [string]$SupabaseDbPassword,
  [string]$SupabaseProjectId = "slqdwrrzlemnacbffhhd",
  [string]$Repo = "belcho/the-daily-donna"
)

$ErrorActionPreference = "Stop"
$gh = "C:\Program Files\GitHub CLI\gh.exe"
if (-not (Test-Path $gh)) {
  $gh = "gh"
}

& $gh secret set SUPABASE_ACCESS_TOKEN --body $SupabaseAccessToken -R $Repo
& $gh secret set SUPABASE_DB_PASSWORD --body $SupabaseDbPassword -R $Repo
& $gh secret set SUPABASE_PROJECT_ID --body $SupabaseProjectId -R $Repo

Write-Host "Set SUPABASE_ACCESS_TOKEN, SUPABASE_DB_PASSWORD, and SUPABASE_PROJECT_ID on $Repo"
Write-Host "Optional: run workflow 'Supabase migrations' from Actions tab, or push a migration file."
