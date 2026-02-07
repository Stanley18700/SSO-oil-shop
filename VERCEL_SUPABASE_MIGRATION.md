# Vercel + Supabase Migration Guide

Complete step-by-step guide to migrate from Railway to Vercel + Supabase (100% Free)

## Phase 1: Setup Supabase Database (15 minutes)

### Step 1.1: Create Supabase Account
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (recommended)
4. Create new organization (free tier)

### Step 1.2: Create Database Project
1. Click "New Project"
2. Enter details:
   - **Name**: `oil-shop-db` (or any name)
   - **Database Password**: Generate strong password (SAVE THIS!)
   - **Region**: Choose closest to your location
3. Wait 2-3 minutes for database creation

### Step 1.3: Get Database Connection String
1. In your project, go to **Settings** (gear icon)
2. Click **Database** in left sidebar
3. Scroll to **Connection string**
4. Select **URI** tab
5. Copy the connection string (looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`)
6. Replace `[YOUR-PASSWORD]` with the password you saved
7. **Save this connection string** - you'll need it!

### Step 1.4: Run Database Migrations
1. Open terminal in your project folder
2. Create a `.env` file in root:
```env
DATABASE_URL="your-supabase-connection-string-here"
```
3. Run migrations:
```bash
npx prisma migrate deploy
```
4. Seed database (optional):
```bash
npx prisma db seed
```

✅ **Checkpoint**: Your database is now live on Supabase!

---

## Phase 2: Restructure Backend for Vercel (30 minutes)

### Step 2.1: Create API Directory Structure
Create new folder structure for Vercel serverless functions:

```
api/
  ├── auth/
  │   ├── login.js
  │   ├── register.js
  │   └── change-password.js
  ├── oils/
  │   ├── index.js
  │   └── [id].js
  ├── sales/
  │   ├── index.js
  │   └── [id].js
  └── reports/
      ├── daily.js
      └── monthly.js
```

### Step 2.2: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2.3: Create vercel.json in Root
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url",
    "JWT_SECRET": "@jwt_secret",
    "NODE_ENV": "production"
  }
}
```

### Step 2.4: Convert Auth Routes

**Create: `api/auth/login.js`**
```javascript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
```

**Create: `api/auth/register.js`**
```javascript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password, role } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: role || 'OWNER'
      }
    });

    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
```

**Create: `api/auth/change-password.js`**
```javascript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Auth middleware
function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.substring(7);
  return jwt.verify(token, process.env.JWT_SECRET);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const decoded = verifyToken(req);
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword }
    });

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
```

### Step 2.5: Convert Oil Routes

**Create: `api/oils/index.js`**
```javascript
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }
  const token = authHeader.substring(7);
  return jwt.verify(token, process.env.JWT_SECRET);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    verifyToken(req);

    if (req.method === 'GET') {
      const oils = await prisma.oil.findMany({
        orderBy: { name: 'asc' }
      });
      return res.status(200).json(oils);
    }

    if (req.method === 'POST') {
      const decoded = verifyToken(req);
      if (decoded.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const oil = await prisma.oil.create({
        data: req.body
      });
      return res.status(201).json(oil);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Oils error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
```

**Create: `api/oils/[id].js`**
```javascript
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }
  const token = authHeader.substring(7);
  return jwt.verify(token, process.env.JWT_SECRET);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const decoded = verifyToken(req);
    const { id } = req.query;

    if (req.method === 'GET') {
      const oil = await prisma.oil.findUnique({
        where: { id: parseInt(id) }
      });
      if (!oil) {
        return res.status(404).json({ error: 'Oil not found' });
      }
      return res.status(200).json(oil);
    }

    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (req.method === 'PUT') {
      const oil = await prisma.oil.update({
        where: { id: parseInt(id) },
        data: req.body
      });
      return res.status(200).json(oil);
    }

    if (req.method === 'DELETE') {
      await prisma.oil.delete({
        where: { id: parseInt(id) }
      });
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Oil operation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
```

### Step 2.6: Convert Sales Routes

**Create: `api/sales/index.js`**
```javascript
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }
  const token = authHeader.substring(7);
  return jwt.verify(token, process.env.JWT_SECRET);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    verifyToken(req);

    if (req.method === 'GET') {
      const sales = await prisma.sale.findMany({
        include: {
          oil: true
        },
        orderBy: { createdAt: 'desc' }
      });
      return res.status(200).json(sales);
    }

    if (req.method === 'POST') {
      const { oilId, quantity, unit, price } = req.body;

      const sale = await prisma.sale.create({
        data: {
          oilId: parseInt(oilId),
          quantity: parseFloat(quantity),
          unit,
          price: parseFloat(price)
        },
        include: {
          oil: true
        }
      });

      return res.status(201).json(sale);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Sales error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
```

**Create: `api/sales/[id].js`**
```javascript
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }
  const token = authHeader.substring(7);
  return jwt.verify(token, process.env.JWT_SECRET);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const decoded = verifyToken(req);
    const { id } = req.query;

    if (req.method === 'DELETE') {
      if (decoded.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      await prisma.sale.delete({
        where: { id: parseInt(id) }
      });
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Sale operation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
```

### Step 2.7: Convert Report Routes

**Create: `api/reports/daily.js`**
```javascript
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }
  const token = authHeader.substring(7);
  return jwt.verify(token, process.env.JWT_SECRET);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    verifyToken(req);

    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        oil: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalSales = sales.reduce((sum, sale) => sum + sale.price, 0);

    res.status(200).json({
      date: targetDate.toISOString().split('T')[0],
      sales,
      totalSales,
      count: sales.length
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Daily report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
```

**Create: `api/reports/monthly.js`**
```javascript
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }
  const token = authHeader.substring(7);
  return jwt.verify(token, process.env.JWT_SECRET);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    verifyToken(req);

    const { year, month } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;

    const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
    const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      include: {
        oil: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalSales = sales.reduce((sum, sale) => sum + sale.price, 0);

    const salesByOil = sales.reduce((acc, sale) => {
      const oilName = sale.oil.name;
      if (!acc[oilName]) {
        acc[oilName] = {
          quantity: 0,
          revenue: 0,
          count: 0
        };
      }
      acc[oilName].quantity += sale.quantity;
      acc[oilName].revenue += sale.price;
      acc[oilName].count += 1;
      return acc;
    }, {});

    res.status(200).json({
      year: targetYear,
      month: targetMonth,
      sales,
      totalSales,
      count: sales.length,
      salesByOil
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Monthly report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
```

---

## Phase 3: Deploy to Vercel (10 minutes)

### Step 3.1: Prepare Root Package.json
Make sure your root `package.json` includes all dependencies:

```json
{
  "dependencies": {
    "@prisma/client": "^5.x.x",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "prisma": "^5.x.x"
  }
}
```

### Step 3.2: Update Prisma Schema
Add this to your `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-1.0.x"]
}
```

### Step 3.3: Deploy Backend
1. Open terminal in project root
2. Login to Vercel:
```bash
vercel login
```
3. Deploy:
```bash
vercel
```
4. Answer prompts:
   - Set up and deploy? **Y**
   - Scope: Choose your account
   - Link to existing project? **N**
   - Project name: `oil-shop-backend` (or any name)
   - Directory: `.` (root)
   - Override settings? **N**

5. Wait for deployment (2-3 minutes)
6. Copy the production URL (e.g., `https://oil-shop-backend.vercel.app`)

### Step 3.4: Add Environment Variables
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:
   - `DATABASE_URL`: Your Supabase connection string
   - `JWT_SECRET`: Generate random string (e.g., `openssl rand -base64 32`)
   - `NODE_ENV`: `production`
5. Click **Save**
6. Redeploy:
```bash
vercel --prod
```

✅ **Checkpoint**: Your backend API is now live!

---

## Phase 4: Deploy Frontend (10 minutes)

### Step 4.1: Update Frontend API URL
Edit `frontend/src/api/api.js`:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'https://your-backend-url.vercel.app/api';
```

### Step 4.2: Create Frontend Vercel Config
Create `frontend/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_API_URL": "@api_url"
  }
}
```

### Step 4.3: Deploy Frontend
1. Open terminal in `frontend` folder:
```bash
cd frontend
```

2. Deploy:
```bash
vercel
```

3. Answer prompts:
   - Set up and deploy? **Y**
   - Scope: Choose your account
   - Link to existing project? **N**
   - Project name: `oil-shop-frontend` (or any name)
   - Directory: `.` (frontend)
   - Override settings? **N**

4. Wait for deployment

5. Add environment variable:
   - Go to Vercel dashboard → Your frontend project
   - Settings → Environment Variables
   - Add `VITE_API_URL`: `https://your-backend-url.vercel.app/api`
   - Redeploy: `vercel --prod`

✅ **Checkpoint**: Your frontend is now live!

---

## Phase 5: Testing (5 minutes)

### Test Checklist:
1. ✅ Open frontend URL
2. ✅ Login with existing credentials
3. ✅ Check if oils load
4. ✅ Create a new sale
5. ✅ View daily report
6. ✅ View monthly report
7. ✅ Test admin functions (if admin user)

### Common Issues:

**Issue: CORS errors**
- Solution: Check CORS headers in API files (already included above)

**Issue: Database connection fails**
- Solution: Verify DATABASE_URL in Vercel environment variables

**Issue: JWT errors**
- Solution: Verify JWT_SECRET is set in Vercel

**Issue: 404 on API routes**
- Solution: Check `vercel.json` routing configuration

---

## Phase 6: Custom Domain (Optional)

### Add Custom Domain:
1. Go to Vercel dashboard
2. Select your frontend project
3. Settings → Domains
4. Add your domain
5. Update DNS records as instructed
6. Wait for SSL certificate (automatic)

---

## Cost Summary

| Service | Free Tier | Your Usage | Cost |
|---------|-----------|------------|------|
| Supabase Database | 500MB, 2GB bandwidth | ~10-50MB | **$0** |
| Vercel Backend | 100GB bandwidth | ~5-10GB | **$0** |
| Vercel Frontend | 100GB bandwidth | ~10-20GB | **$0** |
| **Total** | | | **$0/month** |

---

## Maintenance

### How to Update Code:
1. Make changes locally
2. Test locally
3. Deploy:
```bash
vercel --prod
```

### How to Check Logs:
1. Go to Vercel dashboard
2. Select project
3. Click **Deployments**
4. Click latest deployment
5. View **Functions** logs

### Database Backup:
```bash
# Export database
pg_dump your-supabase-connection-string > backup.sql

# Or use Supabase dashboard
# Project → Database → Backups (available in free tier)
```

---

## Emergency Rollback

If something breaks:
```bash
# List previous deployments
vercel ls

# Promote old deployment
vercel promote <deployment-url>
```

---

## Next Steps

1. Set up monitoring (Vercel Analytics - free)
2. Add custom domain
3. Enable automatic deployments from GitHub
4. Set up staging environment

---

## Support

- Vercel docs: https://vercel.com/docs
- Supabase docs: https://supabase.com/docs
- Prisma on Vercel: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel

---

**Estimated total time: 60-75 minutes**

**Need help?** Ask me at any step!
