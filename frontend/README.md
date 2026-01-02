# SSO Oil Shop Displayer - Frontend

Modern, responsive React frontend for the SSO Oil Shop platform with tablet-first design.

## 🚀 Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Fetch API
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Authentication**: JWT tokens (localStorage)

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── api.js                  # API client with all backend calls
│   ├── auth/
│   │   ├── AuthContext.jsx         # Authentication context provider
│   │   ├── useAuth.js              # Custom auth hook
│   │   └── ProtectedRoute.jsx      # Route protection wrapper
│   ├── components/
│   │   ├── LanguageToggle.jsx      # EN/MY language switcher
│   │   ├── OilCard.jsx             # Oil display card component
│   │   └── OilForm.jsx             # Create/Edit oil form
│   ├── pages/
│   │   ├── Login.jsx               # Admin login page
│   │   ├── AdminDashboard.jsx      # Admin CRUD interface
│   │   ├── CustomerView.jsx        # Public oil listing (tablet-friendly)
│   │   └── MixCalculator.jsx       # Oil mix calculator with percentages
│   ├── i18n/
│   │   ├── en.json                 # English translations
│   │   └── my.json                 # Myanmar translations
│   ├── App.jsx                     # Main app with routing
│   ├── main.jsx                    # App entry point
│   └── index.css                   # Tailwind + custom styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## ⚙️ Setup & Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on `http://localhost:3000`

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### 3. Build for Production

```bash
npm run build
```

Built files will be in the `dist/` folder.

### 4. Preview Production Build

```bash
npm run preview
```

## 🎯 Features

### 1. **Authentication Flow**

- ✅ JWT-based authentication
- ✅ Login page with validation
- ✅ Protected admin routes
- ✅ Auto-redirect on logout
- ✅ Token stored in localStorage

**Default admin credentials:**
- Username: `admin`
- Password: `admin123`

### 2. **Admin Dashboard**

- ✅ View all oils in a table
- ✅ Create new oil products
- ✅ Edit existing oils
- ✅ Soft delete (deactivate) oils
- ✅ Form validation
- ✅ Success/error notifications
- ✅ Modal-based forms

### 3. **Customer View (Tablet-Friendly)**

- ✅ Responsive grid layout
- ✅ Large, touch-friendly cards
- ✅ Bilingual support (EN/MY)
- ✅ Language toggle button
- ✅ Shows only active oils
- ✅ Clean, minimal design

### 4. **Oil Mix Calculator**

- ✅ Select multiple oils
- ✅ Input percentage for each oil
- ✅ Real-time percentage validation
- ✅ Must total 100%
- ✅ Live price calculation
- ✅ Visual progress indicator
- ✅ Weighted average pricing

## 🌐 API Integration

The frontend connects to the backend API at `http://localhost:3000/api`

### Endpoints Used

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/auth/login` | No | Admin login |
| GET | `/oils` | No | Get all active oils |
| POST | `/oils` | Yes | Create new oil |
| PUT | `/oils/:id` | Yes | Update oil |
| DELETE | `/oils/:id` | Yes | Soft delete oil |

### API Configuration

To change the backend URL, edit `frontend/src/api/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

For production, you might want to use environment variables:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
```

Then create a `.env` file:

```env
VITE_API_URL=https://your-production-api.com/api
```

## 🎨 Styling & Design

### Tailwind Configuration

Custom colors and sizes in `tailwind.config.js`:

- **Primary Color**: Orange/Yellow theme
- **Tablet Text Sizes**: 18px, 24px, 32px
- **Touch-friendly**: Minimum 48px button height

### Custom CSS Classes

Defined in `src/index.css`:

- `.btn-primary` - Primary action button
- `.btn-secondary` - Secondary button
- `.btn-danger` - Delete/destructive button
- `.input-field` - Form input styling
- `.card` - Card container
- `.oil-card` - Specific oil card styling

### Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

Design is **tablet-first** with larger touch targets.

## 🌍 Internationalization (i18n)

Two languages supported:

- **English** (`en.json`)
- **Myanmar** (`my.json`)

### Using Translations

```javascript
import enTranslations from '../i18n/en.json';
import myTranslations from '../i18n/my.json';

const t = language === 'en' ? enTranslations : myTranslations;

// Use in JSX
<h1>{t.common.appName}</h1>
```

### Adding New Translations

Edit `src/i18n/en.json` and `src/i18n/my.json`:

```json
{
  "your": {
    "newKey": "Translation text"
  }
}
```

## 🔒 Authentication

### How It Works

1. User enters credentials on `/login`
2. API returns JWT token
3. Token stored in `localStorage`
4. Token sent in `Authorization` header for protected requests
5. On logout, token is removed

### Protected Routes

Use `ProtectedRoute` wrapper:

```jsx
<Route
  path="/admin"
  element={
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
```

### Auth Hook

```javascript
import { useAuth } from './auth/useAuth';

function MyComponent() {
  const { isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return <button onClick={logout}>Logout</button>;
}
```

## 🧮 Mix Calculator Logic

### How It Works

1. User selects oils by checking boxes
2. Each selected oil gets a percentage input
3. System validates total = 100%
4. If valid, calculates weighted average price:

```javascript
totalPrice = Σ (oilPrice × percentage / 100)
```

### Example

- Palm Oil: 3500 MMK × 50% = 1750 MMK
- Groundnut Oil: 5200 MMK × 50% = 2600 MMK
- **Total**: 4350 MMK per unit

## 📱 Tablet-Friendly Design

### Key Features

- ✅ Large buttons (min 48px height)
- ✅ Bigger fonts (18px base, 24px headings)
- ✅ Touch-friendly spacing
- ✅ Minimal scrolling
- ✅ Clear visual hierarchy
- ✅ High contrast colors
- ✅ Large tap targets

### Testing on Tablets

1. Chrome DevTools (F12)
2. Toggle device toolbar
3. Select "iPad" or "iPad Pro"
4. Test touch interactions

## 🛠️ Development Tips

### Hot Module Replacement

Vite provides instant HMR - changes reflect immediately without full reload.

### VS Code Extensions

Recommended:

- ESLint
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets

### Debugging

```javascript
// Add console logs in components
console.log('Oils:', oils);

// React DevTools browser extension
// Inspect component props and state
```

## 🚨 Common Issues

### 1. Backend Connection Failed

**Error**: "Failed to fetch oils"

**Solution**:
- Ensure backend is running on `http://localhost:3000`
- Check backend logs
- Verify CORS is enabled on backend

### 2. Login Doesn't Work

**Error**: "Invalid credentials"

**Solution**:
- Check default credentials: `admin` / `admin123`
- Verify backend auth endpoint
- Check browser console for errors

### 3. Images Not Showing

**Issue**: Oil images not displaying

**Solution**:
- Verify `image_url` is a valid URL
- Check image URL is accessible
- Images have fallback icon SVG

### 4. Styles Not Applied

**Issue**: Tailwind classes not working

**Solution**:
```bash
# Restart dev server
npm run dev
```

## 📦 Production Deployment

### Build Checklist

- [ ] Update API URL for production
- [ ] Test all features
- [ ] Check mobile/tablet responsiveness
- [ ] Verify authentication flow
- [ ] Test with production backend
- [ ] Optimize images
- [ ] Enable minification (automatic with Vite)

### Deployment Options

**Vercel** (Recommended):
```bash
npm install -g vercel
vercel --prod
```

**Netlify**:
```bash
npm run build
# Upload dist/ folder to Netlify
```

**Static hosting** (Nginx, Apache):
```bash
npm run build
# Copy dist/ contents to web server
```

### Environment Variables

For production, set:

```env
VITE_API_URL=https://api.yourdomain.com/api
```

## 🧪 Testing Guide

### Manual Testing Checklist

**Public Routes:**
- [ ] View oils on customer page
- [ ] Switch language EN/MY
- [ ] Open mix calculator
- [ ] Select oils and input percentages
- [ ] Verify total = 100% validation
- [ ] Check price calculation

**Admin Routes:**
- [ ] Login with credentials
- [ ] View oils list
- [ ] Create new oil
- [ ] Edit existing oil
- [ ] Delete oil (soft delete)
- [ ] Logout

**Responsive:**
- [ ] Test on mobile (< 640px)
- [ ] Test on tablet (768px)
- [ ] Test on desktop (1024px+)

## 📞 Support

For issues or questions:

1. Check browser console for errors
2. Verify backend is running
3. Check network tab in DevTools
4. Review this README

## 🎉 Quick Start Summary

```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Make sure backend is running
# Backend should be at http://localhost:3000

# 3. Start frontend
npm run dev

# 4. Open browser
# http://localhost:5173

# 5. Test customer view
# Navigate through oil cards and calculator

# 6. Test admin panel
# Click "Admin" → Login (admin/admin123)
# Create, edit, delete oils
```

## 📝 License

ISC

---

**Enjoy building with SSO Oil Shop! 🛢️✨**

