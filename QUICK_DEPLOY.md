# Quick Deploy Guide (5 Minutes)

## 🚀 Fastest Way to Deploy (Railway + Vercel)

### Step 1: Deploy Backend to Railway (2 minutes)

1. **Go to** https://railway.app
2. **Sign up** with GitHub (free)
3. **Click** "New Project" → "Deploy from GitHub repo"
4. **Select** your repository
5. **Add** PostgreSQL:
   - Click "+ New" → "Database" → "Add PostgreSQL"
6. **Add Environment Variables**:
   - Click on your service → "Variables" tab
   - Add:
     ```
     NODE_ENV=production
     JWT_SECRET=SuperSecretKey123!@#
     FRONTEND_URL=https://your-app.vercel.app
     ```
   - DATABASE_URL is auto-added by Railway ✅
7. **Wait for deployment** (~2 minutes)
8. **Copy your Railway URL** (e.g., `https://sso-oil-shop.railway.app`)

---

### Step 2: Deploy Frontend to Vercel (2 minutes)

1. **Go to** https://vercel.com
2. **Sign up** with GitHub (free)
3. **Click** "Add New Project"
4. **Import** your GitHub repository
5. **Configure**:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. **Add Environment Variable**:
   ```
   Name: VITE_API_URL
   Value: https://your-backend.railway.app/api
   ```
   (Replace with your Railway URL from Step 1)
7. **Click** "Deploy"
8. **Wait** (~1 minute)
9. **Copy your Vercel URL** (e.g., `https://sso-oil-shop.vercel.app`)

---

### Step 3: Update Backend CORS (30 seconds)

1. **Go back to Railway**
2. **Click** your backend service → "Variables"
3. **Update** `FRONTEND_URL` to your Vercel URL
4. **Click** "Redeploy"

---

## ✅ Done!

Your app is now live at:
- **Customer View**: `https://your-app.vercel.app`
- **Admin Panel**: `https://your-app.vercel.app/login`

**Share with your father**: Just send him the Vercel URL! 🎉

---

## 📱 Test Your Deployment

1. Open your Vercel URL
2. You should see the oil products
3. Try the calculator
4. Switch languages
5. Login as admin (admin/admin123)

If everything works → **SUCCESS!** 🎊

---

## 🐛 If Something Goes Wrong

### Backend not responding?
- Check Railway logs
- Verify DATABASE_URL is set
- Ensure migrations ran: Check "Deployments" tab

### Frontend shows errors?
- Check browser console
- Verify VITE_API_URL is correct
- Make sure it ends with `/api`

### CORS errors?
- Update FRONTEND_URL in Railway
- Wait for redeploy
- Clear browser cache

---

## 💡 Pro Tips

1. **Custom Domain** (Optional):
   - Vercel: Project Settings → Domains → Add your domain
   - Free SSL certificate included!

2. **Monitor Your App**:
   - Railway: View logs and metrics in dashboard
   - Vercel: Analytics tab shows visitors

3. **Update Your App**:
   - Just push to GitHub
   - Railway & Vercel auto-deploy! 🚀

---

## 🌍 Share with Your Father

Send him:

```
Hi! I built an oil shop app for you.

Customer View: https://your-app.vercel.app
- View oil prices
- Use the calculator
- Switch to Myanmar language (မြန်မာ button)

Admin Login: https://your-app.vercel.app/login
Username: admin
Password: admin123

You can access it from anywhere on any device!
```

---

**Need help?** Let me know which step you're stuck on! 🤝

