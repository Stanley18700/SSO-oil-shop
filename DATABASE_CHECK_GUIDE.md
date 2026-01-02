# Database Check Guide

This guide will help you verify that your PostgreSQL database is working correctly.

## ✅ Method 1: Quick Database Test (Recommended)

I've created a test script for you. Simply run:

```bash
npm run test:db
```

This will:
- ✅ Test database connection
- ✅ Verify tables exist
- ✅ Show record counts
- ✅ Display sample data

**Expected Output:**
```
🔍 Checking database connection...

✅ Database connection successful!
✅ Tables verified:
   - oils table: 5 records
   - users table: 1 records

✅ Sample oil data:
   - Palm Oil (ထန်းဆီ)
   - Price: 3500.00 MMK

✅ Sample user data:
   - Username: admin
   - Role: admin

🎉 Database is working perfectly!
```

---

## ✅ Method 2: Check PostgreSQL Service (Windows)

### Check if PostgreSQL is running:

**Option A: Services Manager**
1. Press `Win + R`
2. Type: `services.msc`
3. Look for "postgresql-x64-XX" (where XX is version number)
4. Status should be "Running"

**Option B: Command Line**
```powershell
Get-Service -Name postgresql*
```

**Option C: Task Manager**
1. Press `Ctrl + Shift + Esc`
2. Go to "Services" tab
3. Look for "postgresql"

---

## ✅ Method 3: Check Database Exists

### Using pgAdmin (GUI):
1. Open **pgAdmin**
2. Expand "Servers" → "PostgreSQL"
3. Look for database named **"sso_oil_shop"**

### Using psql (Command Line):
```bash
# List all databases
psql -U postgres -l

# Or connect directly
psql -U postgres -d sso_oil_shop
```

Inside psql:
```sql
-- List all tables
\dt

-- Check oils table
SELECT * FROM oils;

-- Check users table
SELECT * FROM users;

-- Exit
\q
```

---

## ✅ Method 4: Test via API

### Step 1: Start the server
```bash
npm run dev
```

### Step 2: Test endpoints

**Health Check:**
```bash
curl http://localhost:3000/health
```

**Get Oils (tests database read):**
```bash
curl http://localhost:3000/api/oils
```

**Expected Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "name_en": "Palm Oil",
      "name_my": "ထန်းဆီ",
      "price_per_unit": "3500.00",
      ...
    }
  ]
}
```

---

## ✅ Method 5: Prisma Studio (Visual Database Browser)

```bash
npx prisma studio
```

This opens a web interface at `http://localhost:5555` where you can:
- View all tables
- Browse records
- Edit data directly
- See relationships

---

## 🛠️ Common Issues & Solutions

### Issue 1: "Connection refused"
```
❌ Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**
1. PostgreSQL is not running
   ```bash
   # Start PostgreSQL service
   net start postgresql-x64-XX
   ```

2. Wrong port (default is 5432)
   - Check your `DATABASE_URL` in `.env`

---

### Issue 2: "Database does not exist"
```
❌ Error: database "sso_oil_shop" does not exist
```

**Solutions:**
```bash
# Create the database
psql -U postgres -c "CREATE DATABASE sso_oil_shop;"

# Or using createdb
createdb -U postgres sso_oil_shop
```

---

### Issue 3: "Password authentication failed"
```
❌ Error: password authentication failed for user "postgres"
```

**Solutions:**
1. Check your password in `.env` file
2. Update `DATABASE_URL`:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_CORRECT_PASSWORD@localhost:5432/sso_oil_shop"
   ```

---

### Issue 4: "Table does not exist"
```
❌ Error: relation "oils" does not exist
```

**Solutions:**
```bash
# Run migrations to create tables
npm run prisma:generate
npm run prisma:migrate

# Then seed the database
npm run prisma:seed
```

---

## 📊 Database Schema Check

To view your current database schema:

```bash
# Show Prisma schema
cat prisma/schema.prisma

# Or view in database
psql -U postgres -d sso_oil_shop -c "\d oils"
psql -U postgres -d sso_oil_shop -c "\d users"
```

---

## 🔧 Reset Database (if needed)

If things go wrong and you want to start fresh:

```bash
# Reset migrations and database
npx prisma migrate reset

# This will:
# 1. Drop the database
# 2. Recreate it
# 3. Run all migrations
# 4. Run seed script (if configured)

# Or manually:
psql -U postgres -c "DROP DATABASE sso_oil_shop;"
psql -U postgres -c "CREATE DATABASE sso_oil_shop;"
npm run prisma:migrate
npm run prisma:seed
```

---

## ✅ Quick Checklist

Before starting development, verify:

- [ ] PostgreSQL service is running
- [ ] Database `sso_oil_shop` exists
- [ ] `.env` file is configured correctly
- [ ] Prisma migrations have been run
- [ ] Database has been seeded
- [ ] Test script passes: `npm run test:db`
- [ ] API endpoints return data
- [ ] Can login as admin

---

## 🎯 Summary

**Easiest way to check everything:**

```bash
# 1. Test database connection
npm run test:db

# 2. Start the server
npm run dev

# 3. In another terminal, test the API
curl http://localhost:3000/api/oils
```

If all three work, your database is perfectly configured! 🎉

