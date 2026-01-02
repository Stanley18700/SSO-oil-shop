# Database Setup Required ⚠️

## Why You're Seeing "No Oils Available"

The frontend is running, but the backend cannot connect to the database because:

1. **PostgreSQL is not installed or not running**
2. **OR the database password in `.env` is incorrect**

---

## Solution: Set Up PostgreSQL

### Option 1: Install PostgreSQL (If Not Installed)

**Step 1: Download PostgreSQL**
- Go to: https://www.postgresql.org/download/windows/
- Download PostgreSQL 16 (or latest version)
- Run the installer

**Step 2: During Installation**
- Remember the password you set for the `postgres` user
- Keep default port: `5432`
- Install pgAdmin (optional but helpful)

**Step 3: After Installation**
- Open `.env` file in `C:\Users\Asus\Desktop\SSOapp\.env`
- Update the password in `DATABASE_URL`:

```env
# Change this:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sso_oil_shop?schema=public"

# To this (replace YOUR_PASSWORD):
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/sso_oil_shop?schema=public"
```

---

### Option 2: If PostgreSQL is Already Installed

**Check if PostgreSQL is Running:**

```powershell
# In PowerShell
Get-Service -Name postgresql*
```

If not running, start it:

```powershell
# Find the service name
Get-Service -Name postgresql*

# Start it (replace with your service name)
Start-Service -Name "postgresql-x64-16"
```

**Update `.env` with Correct Password:**

Open `C:\Users\Asus\Desktop\SSOapp\.env` and change the password in the DATABASE_URL.

---

## After PostgreSQL is Ready

Once PostgreSQL is installed and running with the correct password:

### Run These Commands:

```powershell
# 1. Navigate to project
cd C:\Users\Asus\Desktop\SSOapp

# 2. Generate Prisma Client
npm run prisma:generate

# 3. Create database and run migrations
npm run prisma:migrate
# When asked for migration name, type: init

# 4. Seed the database with sample data
npm run prisma:seed

# 5. Test database connection
npm run test:db
```

### Expected Output:

```
✅ Database connection successful!
✅ Tables verified:
   - oils table: 5 records
   - users table: 1 records
```

---

## Then Refresh Your Browser

After successful database setup:

1. Go to your browser at `http://localhost:5173`
2. Press `Ctrl+R` or `F5` to refresh
3. You should now see 5 oil products:
   - Palm Oil (ထန်းဆီ)
   - Groundnut Oil (မြေပဲဆီ)
   - Sesame Oil (နှမ်းဆီ)
   - Sunflower Oil (နေကြာဆီ)
   - Coconut Oil (အုန်းဆီ)

---

## Quick Test

To verify PostgreSQL is working, try:

```powershell
# Test connection (replace password)
$env:PGPASSWORD='YOUR_PASSWORD'
psql -U postgres -c "SELECT version();"
```

---

## Current Status

✅ **Frontend**: Running on http://localhost:5173  
✅ **Backend**: Running on http://localhost:3000  
❌ **Database**: Not configured yet  

**Next Step**: Install/configure PostgreSQL and update `.env` file

---

## Need Help?

If you continue to have issues:

1. **Check PostgreSQL is installed**: Open pgAdmin or search for PostgreSQL in Start Menu
2. **Check PostgreSQL is running**: Services → Look for postgresql-x64-XX
3. **Verify password**: Try connecting with pgAdmin using your password
4. **Update .env**: Make sure the password in DATABASE_URL matches

---

## Alternative: Use a Quick Script

I can create a setup script that will guide you through the process step-by-step once PostgreSQL is ready. Just let me know!

