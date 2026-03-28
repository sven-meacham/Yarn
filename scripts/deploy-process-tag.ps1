# Deploy the process-tag Edge Function to Supabase (Windows PowerShell)
#
# Before running:
#   1) npx supabase login          # once — opens browser
#   2) Set your secrets for THIS shell session:
#        $env:SUPABASE_DB_PASSWORD = "your Supabase database password"
#        $env:OPENAI_API_KEY       = "sk-...your OpenAI key"
#
# Then from repo root:
#   .\scripts\deploy-process-tag.ps1
#
# Or run the three commands at the bottom manually in PowerShell.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$projectRef = "hvvvetseyahygscgixqr"

if (-not $env:SUPABASE_DB_PASSWORD) {
  Write-Host "Missing env: SUPABASE_DB_PASSWORD (Postgres password from when you created the Supabase project)" -ForegroundColor Red
  exit 1
}
if (-not $env:OPENAI_API_KEY) {
  Write-Host "Missing env: OPENAI_API_KEY" -ForegroundColor Red
  exit 1
}

Write-Host "Linking project $projectRef ..." -ForegroundColor Cyan
npx supabase link --project-ref $projectRef --password $env:SUPABASE_DB_PASSWORD --yes

Write-Host "Setting OPENAI_API_KEY secret on Supabase ..." -ForegroundColor Cyan
npx supabase secrets set "OPENAI_API_KEY=$($env:OPENAI_API_KEY)"

Write-Host "Deploying process-tag ..." -ForegroundColor Cyan
npx supabase functions deploy process-tag

Write-Host "Done. Check Dashboard -> Edge Functions -> process-tag" -ForegroundColor Green
