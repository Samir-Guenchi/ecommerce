$env:Path += ";C:\Program Files\PostgreSQL\17\bin"
$env:PGPASSWORD = "postgres"
Write-Host "Wrapper: Added PostgreSQL bin to PATH."
Write-Host "Wrapper: Set PGPASSWORD environment variable."
.\quick-setup.ps1
