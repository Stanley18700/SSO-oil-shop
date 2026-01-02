# SSO Oil Shop Displayer - Full Stack Setup Guide

Complete guide to run both backend and frontend together.

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ **Node.js** v16+ ([Download](https://nodejs.org/))
- ✅ **PostgreSQL** v12+ ([Download](https://www.postgresql.org/download/))
- ✅ **Git** (optional)
- ✅ A code editor (VS Code recommended)

## 🚀 Quick Start (10 minutes)

### Step 1: Set Up Database

**Option A - Using psql:**
```bash
# Open PostgreSQL command line
psql -U postgres

# Create database
CREATE DATABASE sso_oil_shop;

# Exit
\q
```

**Option B - Using pgAdmin:**
1. Open pgAdmin
2. Right-click on "Databases" → Create → Database
3. Name: `sso_oil_shop`
4. Click "Save"

---

### Step 2: Set Up Backend

```bash
# Navigate to project root
cd SSOapp

# Install dependencies
npm install

# Create .env file
# Copy this content to .env:
```

Create `.env` file with:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/sso_oil_shop?schema=public"
PORT=3000
NODE_ENV=development
JWT_SECRET=supersecretkey123
```

⚠️ **Replace `yourpassword` with your actual PostgreSQL password!**

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
# When prompted for name, type: init

# Seed database with sample data
npm run prisma:seed

# Test database connection
npm run test:db

# Start backend server
npm run dev
```

**Backend is now running at:** `http://localhost:3000`

✅ Test it: Open browser → `http://localhost:3000/health`

---

### Step 3: Set Up Frontend

**Open a NEW terminal window** (keep backend running):

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start frontend dev server
npm run dev
```

**Frontend is now running at:** `http://localhost:5173`

Browser should auto-open. If not, go to: `http://localhost:5173`

---

## 🎉 You're Done!

### Test the Application

#### 1. **Customer View** (Public)
- ✅ View oil products with prices
- ✅ Switch language (English ↔ Myanmar)
- ✅ Click "Mix Calculator" button
- ✅ Select oils, enter percentages (must total 100%)
- ✅ See calculated price

#### 2. **Admin Panel**
- ✅ Click "Admin" button (bottom right)
- ✅ Login with:
  - Username: `admin`
  - Password: `admin123`
- ✅ Create new oil
- ✅ Edit existing oil
- ✅ Delete oil (soft delete)
- ✅ Logout

---

## 📁 Project Structure

```
SSOapp/
├── backend files (Express + Prisma)
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── auth/
    │   ├── components/
    │   ├── pages/
    │   └── i18n/
    ├── package.json
    └── README.md
```

---

## 🔧 Development Workflow

### Running Both Servers

You need **2 terminal windows**:

**Terminal 1 - Backend:**
```bash
cd SSOapp
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd SSOapp/frontend
npm run dev
```

### Stopping Servers

Press `Ctrl+C` in each terminal.

---

## 🛠️ Common Commands

### Backend Commands

```bash
# Start backend
npm run dev

# Check database
npm run test:db

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View database in browser
npx prisma studio
```

### Frontend Commands

```bash
cd frontend

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🐛 Troubleshooting

### ❌ Backend: "Connection refused"

**Problem:** Can't connect to PostgreSQL

**Solution:**
1. Check if PostgreSQL is running:
   - Windows: Services → postgresql-x64-XX
   - Mac: `brew services list`
2. Verify password in `.env`
3. Ensure database exists: `psql -l`

---

### ❌ Backend: "Port 3000 already in use"

**Solution:**

**Option A** - Change port in `.env`:
```env
PORT=3001
```

**Option B** - Kill process on port 3000:
- Windows: `netstat -ano | findstr :3000` then `taskkill /PID <PID> /F`
- Mac/Linux: `lsof -ti:3000 | xargs kill`

---

### ❌ Frontend: Can't fetch oils

**Problem:** "Failed to fetch oils" error

**Solution:**
1. Ensure backend is running on `http://localhost:3000`
2. Check backend terminal for errors
3. Test: `http://localhost:3000/api/oils` in browser
4. Verify CORS is enabled (already done in `src/app.js`)

---

### ❌ Frontend: Login doesn't work

**Problem:** Invalid credentials

**Solution:**
1. Use correct credentials: `admin` / `admin123`
2. Ensure backend `/api/auth/login` is working
3. Check browser console for errors
4. Verify backend seed ran successfully

---

### ❌ Prisma: Migration errors

**Solution:**
```bash
# Reset everything (WARNING: deletes data)
npx prisma migrate reset

# Re-generate client
npm run prisma:generate

# Migrate again
npm run prisma:migrate

# Seed data
npm run prisma:seed
```

---

## 📊 Database Management

### View Data with Prisma Studio

```bash
# In backend directory
npx prisma studio
```

Opens at `http://localhost:5555` - visual database editor!

### Direct PostgreSQL Access

```bash
# Connect to database
psql -U postgres -d sso_oil_shop

# View oils
SELECT * FROM oils;

# View users
SELECT * FROM users;

# Exit
\q
```

---

## 🌐 API Endpoints Reference

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/oils` | Get all active oils |
| GET | `/health` | Health check |

### Admin Endpoints (Require JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login |
| POST | `/api/oils` | Create oil |
| PUT | `/api/oils/:id` | Update oil |
| DELETE | `/api/oils/:id` | Delete oil (soft) |

---

## 📱 Responsive Testing

### Test on Different Devices

**Chrome DevTools:**
1. Press `F12`
2. Click device toolbar icon (Ctrl+Shift+M)
3. Select device: iPad, iPad Pro, etc.
4. Test touch interactions

**Recommended Test Devices:**
- iPad Pro 12.9" (tablet view)
- iPhone 12 Pro (mobile view)
- Desktop (1920x1080)

---

## 🔐 Security Notes

**⚠️ For Development Only:**

The current setup is for **local development**. For production:

1. Change JWT secret in `.env`
2. Change admin password after first login
3. Use HTTPS
4. Enable rate limiting
5. Add input sanitization
6. Use environment-specific configs
7. Never commit `.env` to Git

---

## 🚀 Production Deployment

### Backend Deployment

**Options:**
- Heroku
- Railway
- DigitalOcean
- AWS EC2

**Steps:**
1. Set up PostgreSQL on hosting
2. Update `DATABASE_URL` for production
3. Run migrations on production database
4. Deploy Node.js app

### Frontend Deployment

**Options:**
- Vercel (recommended)
- Netlify
- AWS S3 + CloudFront

**Steps:**
1. Update API URL in `frontend/src/api/api.js`
2. Build: `npm run build`
3. Deploy `dist/` folder

---

## 📚 Additional Resources

### Backend Documentation
- [Prisma Docs](https://www.prisma.io/docs/)
- [Express Docs](https://expressjs.com/)
- [JWT Guide](https://jwt.io/introduction)

### Frontend Documentation
- [React Docs](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Router](https://reactrouter.com/)

---

## 🎯 Feature Checklist

### Implemented Features

**Backend:**
- ✅ PostgreSQL database with Prisma
- ✅ RESTful API endpoints
- ✅ JWT authentication
- ✅ Admin login
- ✅ CRUD operations for oils
- ✅ Soft delete
- ✅ Seed script with sample data

**Frontend:**
- ✅ React + Vite + Tailwind CSS
- ✅ Responsive tablet-first design
- ✅ Authentication flow
- ✅ Protected routes
- ✅ Admin dashboard
- ✅ Customer view (public)
- ✅ Oil mix calculator
- ✅ Bilingual support (EN/MY)
- ✅ Language toggle
- ✅ Form validation

---

## 🆘 Getting Help

### If You're Stuck

1. **Check the logs:**
   - Backend: Look at terminal running backend
   - Frontend: Check browser console (F12)

2. **Test individually:**
   - Backend: `http://localhost:3000/api/oils`
   - Database: `npm run test:db`

3. **Review documentation:**
   - Backend: `README.md` in root
   - Frontend: `frontend/README.md`
   - Database: `DATABASE_CHECK_GUIDE.md`

4. **Common fixes:**
   - Restart both servers
   - Clear browser cache
   - Check all services are running

---

## 🎊 Success Indicators

You know everything is working when:

✅ Backend health check returns OK  
✅ Frontend opens at localhost:5173  
✅ You see oil cards on home page  
✅ Language toggle works  
✅ Calculator validates percentages  
✅ Admin login succeeds  
✅ Can create/edit/delete oils  
✅ Changes reflect immediately  

---

## 📞 Summary - Two Terminals

```bash
# Terminal 1 - Backend (Port 3000)
cd SSOapp
npm install
# Create .env file
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev

# Terminal 2 - Frontend (Port 5173)
cd SSOapp/frontend
npm install
npm run dev
```

**That's it! Happy coding! 🎉**

