# Free Deployment Guide - SSO Oil Shop

Deploy your application **completely FREE** so anyone can access it from anywhere in the world! 🌍

## 🎯 Deployment Strategy

We'll use these **FREE** services:

1. **Frontend (React)**: Vercel - Unlimited free hosting
2. **Backend (Node.js)**: Railway or Render - Free tier
3. **Database (PostgreSQL)**: Included with Railway/Render - Free

**Total Cost**: $0/month 💰

---

## 📦 Option 1: Deploy with Railway (Recommended - Easiest)

Railway provides **everything in one place** - backend, database, and automatic deployments.

### Step 1: Prepare Your Backend for Deployment

Create a `railway.json` file in your project root:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run prisma:migrate && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Update your `package.json` scripts:

```json
"scripts": {
  "start": "node src/server.js",
  "build": "npm install && npx prisma generate"
}
```

### Step 2: Deploy Backend to Railway

1. **Sign up for Railway**:
   - Go to https://railway.app
   - Click "Start a New Project"
   - Sign up with GitHub (free)

2. **Create New Project**:
   - Click "Deploy from GitHub repo"
   - Connect your GitHub account
   - Select your repository (or upload code)

3. **Add PostgreSQL Database**:
   - In your Railway project
   - Click "+ New"
   - Select "Database" → "PostgreSQL"
   - Railway auto-creates and connects it!

4. **Set Environment Variables**:
   - Click on your backend service
   - Go to "Variables" tab
   - Add these:
     ```
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     PORT=3000
     NODE_ENV=production
     JWT_SECRET=your_super_secret_key_change_this
     ```
   - Railway automatically injects the database URL!

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes
   - Copy your public URL (e.g., `https://your-app.railway.app`)

### Step 3: Deploy Frontend to Vercel

1. **Update Frontend API URL**:
   
   Edit `frontend/src/api/api.js`:
   ```javascript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend.railway.app/api';
   ```

2. **Create `vercel.json`** in `frontend/` folder:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

3. **Deploy to Vercel**:
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository
   - Select the `frontend` folder
   - Add environment variable:
     ```
     VITE_API_URL=https://your-backend.railway.app/api
     ```
   - Click "Deploy"
   - Done! Get your URL (e.g., `https://your-app.vercel.app`)

---

## 📦 Option 2: Deploy with Render (Alternative)

Render is another great free option.

### Backend on Render

1. Go to https://render.com
2. Sign up (free)
3. Click "New +" → "Web Service"
4. Connect your GitHub repo
5. Configure:
   - **Name**: sso-oil-shop-backend
   - **Environment**: Node
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npx prisma migrate deploy && npm start`
   - **Add PostgreSQL** (free tier)

6. Environment variables:
   ```
   DATABASE_URL=<auto-provided>
   PORT=10000
   NODE_ENV=production
   JWT_SECRET=your_secret_key
   ```

### Frontend on Render

1. New → "Static Site"
2. Connect repo
3. Configure:
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Environment Variable**: 
     ```
     VITE_API_URL=https://your-backend.onrender.com/api
     ```

---

## 🚀 Quick Setup Scripts

I'll create deployment preparation scripts for you:

### For Railway Deployment

Create `prepare-railway.sh`:
```bash
#!/bin/bash
echo "Preparing for Railway deployment..."

# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up

echo "✅ Backend deployed!"
echo "Copy your Railway URL and update frontend API_BASE_URL"
```

### For Vercel Deployment

Create `prepare-vercel.sh`:
```bash
#!/bin/bash
echo "Preparing for Vercel deployment..."

# Install Vercel CLI
npm i -g vercel

# Navigate to frontend
cd frontend

# Deploy
vercel --prod

echo "✅ Frontend deployed!"
echo "Your app is now live!"
```

---

## 🔧 Pre-Deployment Checklist

Before deploying, make sure:

- [ ] Push all code to GitHub
- [ ] Update `DATABASE_URL` in production to use environment variable
- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Update CORS settings in backend to allow your frontend domain
- [ ] Test locally one more time
- [ ] Remove any console.logs (optional)

---

## 🌐 Update CORS for Production

Edit `src/app.js`:

```javascript
const cors = require('cors');

// Allow your frontend domain
app.use(cors({
  origin: [
    'https://your-app.vercel.app',
    'http://localhost:5173' // Keep for local development
  ],
  credentials: true
}));
```

---

## 💾 Alternative Free Database Options

If you need a separate database:

### Option A: Neon (Serverless Postgres)
- Go to https://neon.tech
- Sign up (free)
- Create project
- Get connection string
- Use in your backend

### Option B: Supabase
- Go to https://supabase.com
- Create project (free tier)
- Get Postgres connection string
- Use in DATABASE_URL

---

## 📱 Share with Your Father

Once deployed, share:

**Customer View**: `https://your-app.vercel.app`

He can:
- ✅ View all oils
- ✅ Switch language (English/Myanmar)
- ✅ Use mix calculator
- ✅ Access from any device, anywhere

**Admin Panel**: `https://your-app.vercel.app/login`
- Username: admin
- Password: admin123 (change this!)

---

## 🔐 Security Tips for Production

1. **Change Admin Password**:
   - Login to admin panel
   - Create new admin with strong password
   - Delete default admin

2. **Update JWT_SECRET**:
   - Generate strong secret:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - Use in environment variables

3. **Enable HTTPS**: 
   - Both Vercel and Railway provide HTTPS automatically ✅

---

## 💰 Cost Breakdown

| Service | Free Tier | Limits |
|---------|-----------|--------|
| **Railway** | $5 credit/month | ~500 hours (enough for 24/7) |
| **Vercel** | Unlimited | 100GB bandwidth/month |
| **Render** | 750 hours/month | Spins down after 15 min inactive |

**Verdict**: Railway is best for 24/7 uptime, Render is good if you don't mind brief startup delays.

---

## 🐛 Troubleshooting

### "Cannot connect to database"
- Check DATABASE_URL is set correctly
- Ensure Postgres is running on Railway/Render
- Check database connection in Railway dashboard

### "CORS Error"
- Update CORS settings in `src/app.js`
- Add your Vercel domain to allowed origins

### "App not loading"
- Check build logs on Railway/Render
- Ensure all environment variables are set
- Check if migrations ran successfully

---

## 🎉 Success!

Your app is now:
- ✅ Live on the internet
- ✅ Accessible from anywhere
- ✅ Running 24/7 (Railway) or on-demand (Render)
- ✅ Completely FREE
- ✅ Secure with HTTPS

**Your father can now access it from any country!** 🌏

Share the URL with him and he can:
- View oil prices
- Use the calculator
- See everything in Myanmar language

---

## 📞 Need Help?

If you get stuck:
1. Check Railway/Vercel build logs
2. Verify all environment variables
3. Test API endpoints manually
4. Check database connection

---

**Ready to deploy?** Let me know and I'll help you through each step! 🚀

