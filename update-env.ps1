# Update .env file with PostgreSQL password
$envContent = @"
# Database Connection
DATABASE_URL="postgresql://postgres:Jokermeme159357@localhost:5432/sso_oil_shop?schema=public"

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret
JWT_SECRET=supersecretkey123changethisinproduction

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
"@

$envContent | Out-File -FilePath "C:\Users\Asus\Desktop\SSOapp\.env" -Encoding UTF8 -Force
Write-Host "✓ .env file updated successfully!" -ForegroundColor Green

