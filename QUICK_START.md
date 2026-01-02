# Quick Start Guide

## Step-by-Step Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database

**Option A: Using PostgreSQL CLI**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE sso_oil_shop;

# Exit
\q
```

**Option B: Using pgAdmin**
- Open pgAdmin
- Right-click on Databases → Create → Database
- Name: `sso_oil_shop`

### 3. Configure Environment

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/sso_oil_shop?schema=public"
PORT=3000
NODE_ENV=development
JWT_SECRET=change_this_to_a_random_secret_key_in_production
```

**Update `DATABASE_URL`** with your PostgreSQL username and password!

### 4. Run Migrations

```bash
# Generate Prisma Client
npm run prisma:generate

# Create tables
npm run prisma:migrate
```

When asked for migration name, type: `init`

### 5. Seed Database

```bash
npm run prisma:seed
```

This creates:
- ✅ Admin user (username: `admin`, password: `admin123`)
- ✅ 5 sample oil products

### 6. Start Server

```bash
npm run dev
```

Server runs at: `http://localhost:3000`

---

## Test the API

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. View All Oils (Public)
```bash
curl http://localhost:3000/api/oils
```

### 3. Admin Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Copy the `token` from the response.

### 4. Create New Oil (Admin)
```bash
curl -X POST http://localhost:3000/api/oils \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name_en": "Olive Oil",
    "name_my": "သံလွင်ဆီ",
    "description_en": "Extra virgin olive oil",
    "description_my": "အရည်အသွေးမြင့် သံလွင်ဆီ",
    "price_per_unit": 8500
  }'
```

---

## Common Issues

### "Connection refused" error
- ✅ Make sure PostgreSQL is running
- ✅ Check credentials in `.env`

### "Port 3000 already in use"
- ✅ Change `PORT=3001` in `.env`
- ✅ Or kill the process using port 3000

### "Prisma Client not found"
- ✅ Run `npm run prisma:generate`

### Database doesn't exist
- ✅ Create it: `createdb sso_oil_shop` (Mac/Linux)
- ✅ Or use SQL: `CREATE DATABASE sso_oil_shop;`

---

## Next Steps

1. ✨ Test all API endpoints with Postman or cURL
2. 🔐 Change admin password after first login
3. 🎨 Build frontend to consume the API
4. 📱 Implement mixed oil calculator feature
5. 🚀 Deploy to production server

---

## Project Structure

```
SSOapp/
├── src/
│   ├── controllers/        # Business logic
│   ├── routes/            # API endpoints
│   ├── middleware/        # Auth & validation
│   ├── services/          # Database connection
│   ├── app.js            # Express setup
│   └── server.js         # Entry point
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.js          # Sample data
├── .env                  # Your config (create this)
├── package.json
└── README.md
```

Happy coding! 🎉

