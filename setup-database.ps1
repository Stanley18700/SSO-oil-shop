# SSO Oil Shop - Database Setup Script
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  SSO OIL SHOP - Database Setup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Stop backend server
Write-Host "Step 1: Stopping backend server..." -ForegroundColor Yellow
$processes = Get-Process -Name node -ErrorAction SilentlyContinue
if ($processes) {
    $processes | Where-Object { $_.CommandLine -like "*server.js*" } | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "✓ Backend stopped`n" -ForegroundColor Green
    Start-Sleep -Seconds 2
} else {
    Write-Host "✓ Backend not running`n" -ForegroundColor Green
}

# Step 2: Generate Prisma Client
Write-Host "Step 2: Generating Prisma Client..." -ForegroundColor Yellow
Set-Location "C:\Users\Asus\Desktop\SSOapp"
npm run prisma:generate
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Prisma Client generated successfully`n" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to generate Prisma Client" -ForegroundColor Red
    Write-Host "Please check your .env file configuration`n" -ForegroundColor Yellow
    pause
    exit 1
}

# Step 3: Run Migrations
Write-Host "Step 3: Running database migrations..." -ForegroundColor Yellow
Write-Host "(This will create the database and tables)`n" -ForegroundColor Gray
$env:MIGRATION_NAME = "init"
echo "init" | npm run prisma:migrate
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database and tables created successfully`n" -ForegroundColor Green
} else {
    Write-Host "✗ Migration failed" -ForegroundColor Red
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  - Wrong password in .env file" -ForegroundColor Gray
    Write-Host "  - PostgreSQL service not running" -ForegroundColor Gray
    Write-Host "  - Database already exists (this is OK)`n" -ForegroundColor Gray
    
    Write-Host "Continuing anyway..." -ForegroundColor Yellow
}

# Step 4: Seed Database
Write-Host "Step 4: Seeding database with sample data..." -ForegroundColor Yellow
npm run prisma:seed
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database seeded with 5 oils and 1 admin user`n" -ForegroundColor Green
} else {
    Write-Host "⚠ Seeding may have failed or data already exists`n" -ForegroundColor Yellow
}

# Step 5: Test Database
Write-Host "Step 5: Testing database connection..." -ForegroundColor Yellow
npm run test:db
Write-Host ""

# Step 6: Restart Backend
Write-Host "Step 6: Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\Asus\Desktop\SSOapp; Write-Host 'Backend Server Starting...' -ForegroundColor Cyan; npm run dev"
Start-Sleep -Seconds 3
Write-Host "✓ Backend server started`n" -ForegroundColor Green

# Summary
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Your app should now work with data!" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "Backend:  http://localhost:3000`n" -ForegroundColor White

Write-Host "Default Admin Login:" -ForegroundColor Yellow
Write-Host "  Username: admin" -ForegroundColor White
Write-Host "  Password: admin123`n" -ForegroundColor White

Write-Host "Refresh your browser to see the oils!`n" -ForegroundColor Cyan

pause

