# Apply pending SQL migrations to your linked Supabase project.
# Prereqs: npm/npx, Supabase CLI (via npx), and `supabase login` + `supabase link` once.

$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")

Push-Location $root
try {
  npx --yes supabase@latest db push
  Write-Host "Done."
} finally {
  Pop-Location
}
