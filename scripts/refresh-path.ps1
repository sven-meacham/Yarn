# Reload PATH from registry into this terminal (use after changing PATH, or if node/npm are "not recognized").
$m = [Environment]::GetEnvironmentVariable('Path', 'Machine')
$u = [Environment]::GetEnvironmentVariable('Path', 'User')
$env:Path = (@($m, $u) | Where-Object { $_ }) -join ';'
Write-Host "PATH refreshed. Try: node -v"
