# Frontend Features Overview

## 🎨 Pages & Routes

### 1. **Customer View** (`/`)
- **Public access** - No login required
- **Purpose**: Display available oils to customers
- **Features**:
  - Grid of oil cards with images, names, descriptions, prices
  - Language toggle (English/Myanmar)
  - Search/filter oils (visual browsing)
  - Link to Mix Calculator
  - Admin login button (bottom right)

**Design**: Tablet-first with large cards and buttons

---

### 2. **Mix Calculator** (`/calculator`)
- **Public access** - No login required
- **Purpose**: Calculate mixed oil prices by percentage
- **Features**:
  - Select multiple oils via checkbox
  - Input percentage for each selected oil
  - Real-time validation (total must = 100%)
  - Visual progress bar
  - Live price calculation (weighted average)
  - Bilingual support
  - Back to customer view

**Logic**:
```javascript
totalPrice = Σ (oilPrice × percentage / 100)

Example:
- Palm Oil (3500 MMK) × 60% = 2100 MMK
- Sesame Oil (6800 MMK) × 40% = 2720 MMK
Total = 4820 MMK per unit
```

---

### 3. **Login** (`/login`)
- **Public access** - No login required
- **Purpose**: Admin authentication
- **Features**:
  - Username/password form
  - Form validation
  - Error messages
  - Loading state
  - JWT token storage
  - Auto-redirect to admin dashboard
  - Back to customer view link

**Default credentials:**
- Username: `admin`
- Password: `admin123`

---

### 4. **Admin Dashboard** (`/admin`)
- **Protected route** - JWT required
- **Purpose**: Manage oil products (CRUD)
- **Features**:
  - View all oils in table format
  - Create new oil (modal form)
  - Edit existing oil (modal form)
  - Delete oil (soft delete with confirmation)
  - Active/Inactive status indicator
  - Success/error notifications
  - Logout button
  - Link to customer view

**Form fields:**
- Name (English & Myanmar)
- Description (English & Myanmar)
- Price per unit (MMK)
- Image URL (optional)
- Active status (checkbox)

---

## 🔐 Authentication System

### Flow Diagram

```
┌──────────┐
│  Login   │
│  Page    │
└────┬─────┘
     │ Submit credentials
     ▼
┌──────────────────┐
│  API: POST       │
│  /auth/login     │
└────┬─────────────┘
     │ Success: Return JWT
     ▼
┌──────────────────┐
│  Store token in  │
│  localStorage    │
└────┬─────────────┘
     │ Update AuthContext
     ▼
┌──────────────────┐
│  Redirect to     │
│  /admin          │
└──────────────────┘
```

### Components

**AuthContext.jsx**
- Provides authentication state globally
- Methods: `login()`, `logout()`
- State: `isAuthenticated`, `isLoading`

**useAuth.js**
- Custom hook to access auth context
- Usage: `const { isAuthenticated, logout } = useAuth()`

**ProtectedRoute.jsx**
- Wrapper component for protected routes
- Redirects to `/login` if not authenticated
- Shows loading spinner while checking auth

---

## 🧩 Reusable Components

### 1. **OilCard**
**Purpose**: Display oil information in card format

**Props**:
- `oil` - Oil object with data
- `language` - 'en' or 'my'
- `onClick` - Optional click handler
- `showCheckbox` - Show checkbox for selection
- `checked` - Checkbox checked state
- `onCheckChange` - Checkbox change handler

**Features**:
- Bilingual name and description
- Price display with currency
- Image with fallback icon
- Active/Inactive indicator
- Responsive design
- Hover effects

---

### 2. **OilForm**
**Purpose**: Create/edit oil products

**Props**:
- `oil` - Oil object for editing (null for create)
- `onSubmit` - Form submission handler
- `onCancel` - Cancel button handler
- `isLoading` - Loading state

**Features**:
- All required fields with validation
- Real-time error messages
- Bilingual input fields
- Price validation (must be > 0)
- Optional image URL
- Active status checkbox
- Disabled state during submission

---

### 3. **LanguageToggle**
**Purpose**: Switch between English and Myanmar

**Props**:
- `language` - Current language ('en' or 'my')
- `onLanguageChange` - Language change handler

**Features**:
- Two-button toggle design
- Active state styling
- Touch-friendly size
- Smooth transitions

---

## 📱 Responsive Design

### Breakpoints

| Device | Width | Design Focus |
|--------|-------|--------------|
| Mobile | < 640px | Single column, stacked |
| Tablet | 640px - 1024px | 2-3 columns, large buttons |
| Desktop | > 1024px | Multi-column grid |

### Tablet-First Principles

1. **Large Touch Targets**
   - Minimum 48px button height
   - Generous padding
   - Clear visual feedback

2. **Readable Text**
   - Base: 18px (1.125rem)
   - Headings: 24px-32px
   - High contrast colors

3. **Minimal Scrolling**
   - Content fits on screen
   - Sticky headers
   - Large cards visible at once

4. **Clear Visual Hierarchy**
   - Bold headings
   - Ample whitespace
   - Color-coded actions

---

## 🌍 Internationalization

### Supported Languages

- **English** (en)
- **Myanmar** (my)

### Translation Files

**en.json** - English translations  
**my.json** - Myanmar translations

### Structure

```json
{
  "common": {
    "appName": "SSO Oil Shop",
    "login": "Login",
    ...
  },
  "auth": {
    "username": "Username",
    ...
  },
  "customer": {
    "title": "Available Oils",
    ...
  }
}
```

### Usage in Components

```javascript
import enTranslations from '../i18n/en.json';
import myTranslations from '../i18n/my.json';

const [language, setLanguage] = useState('en');
const t = language === 'en' ? enTranslations : myTranslations;

// Use in JSX
<h1>{t.common.appName}</h1>
<button>{t.common.login}</button>
```

---

## 🎨 Styling System

### Tailwind CSS

**Custom Theme** (tailwind.config.js):

```javascript
colors: {
  primary: {
    50: '#fef3e2',   // Lightest
    500: '#f58b02',  // Main brand color
    900: '#311c01',  // Darkest
  }
}

fontSize: {
  'tablet': '1.125rem',    // 18px
  'tablet-lg': '1.5rem',   // 24px
  'tablet-xl': '2rem',     // 32px
}
```

### Custom CSS Classes

**Buttons**:
- `.btn-primary` - Orange, white text
- `.btn-secondary` - Gray, dark text
- `.btn-danger` - Red, white text

**Inputs**:
- `.input-field` - Styled form inputs

**Cards**:
- `.card` - White card with shadow
- `.oil-card` - Specific for oil display

---

## 🔄 State Management

**Approach**: React Hooks only (no Redux)

### Local State (useState)

```javascript
// Component-level state
const [oils, setOils] = useState([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState('');
```

### Global State (useContext)

```javascript
// Authentication state
const AuthContext = createContext();

// Access anywhere
const { isAuthenticated, login, logout } = useAuth();
```

### Why No Redux?

- Application is simple
- Limited global state needs
- Context API is sufficient
- Reduces bundle size
- Easier to understand

---

## 🔌 API Integration

### API Client (api.js)

**Features**:
- Centralized fetch wrapper
- Automatic JWT token handling
- Error handling
- Base URL configuration

**Usage**:

```javascript
import { getOils, createOil } from '../api/api';

// Fetch oils
const oils = await getOils();

// Create oil (auto adds JWT)
await createOil(oilData);
```

### Error Handling

```javascript
try {
  const data = await getOils();
  setOils(data);
} catch (error) {
  setError(error.message);
}
```

---

## ✅ Form Validation

### Client-Side Validation

**OilForm validation:**
- Required fields: names, descriptions, price
- Price must be > 0
- Real-time error display
- Disabled submit during validation errors

**Calculator validation:**
- Percentages must total 100%
- Visual feedback (progress bar)
- Color-coded status (green/orange/red)
- Cannot calculate if invalid

---

## 🎯 User Experience

### Loading States

- Spinner animations
- "Loading..." text
- Disabled buttons during actions
- Skeleton screens (could add)

### Success/Error Messages

- Toast-style notifications
- Auto-dismiss after 3 seconds
- Color-coded (green/red)
- Clear action descriptions

### Confirmations

- Delete confirmation dialog
- Prevent accidental deletions
- Clear warning messages

---

## 🚀 Performance

### Optimizations

1. **Vite HMR**: Instant updates during development
2. **Code Splitting**: React.lazy (not implemented, but possible)
3. **Image Optimization**: Lazy loading (built-in browser)
4. **Minimal Dependencies**: Only what's needed

### Bundle Size

- React + ReactDOM: ~130KB
- React Router: ~10KB
- Tailwind CSS: ~10KB (purged)
- Total: ~150KB (gzipped)

---

## 🧪 Testing Scenarios

### Manual Testing Checklist

**Customer View:**
- [ ] Load page, see oil cards
- [ ] Toggle language EN ↔ MY
- [ ] Click calculator button
- [ ] Select 2+ oils
- [ ] Enter percentages
- [ ] Verify total = 100% validation
- [ ] See calculated price

**Admin Flow:**
- [ ] Click admin button
- [ ] Login (admin/admin123)
- [ ] See dashboard with oils
- [ ] Click "Add New Oil"
- [ ] Fill form, submit
- [ ] See success message
- [ ] See new oil in list
- [ ] Click edit, modify oil
- [ ] Click delete, confirm
- [ ] Oil marked inactive
- [ ] Logout

**Responsive:**
- [ ] Resize to mobile (< 640px)
- [ ] Resize to tablet (768px)
- [ ] Resize to desktop (1920px)
- [ ] Test touch interactions

---

## 📦 Build & Deploy

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
# Output: dist/ folder
```

### Preview Build

```bash
npm run preview
# Test production build locally
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

---

## 🎓 Learning Resources

### React Concepts Used

- Functional components
- Hooks (useState, useEffect, useContext)
- Context API
- Custom hooks
- Props and prop drilling
- Conditional rendering
- List rendering (map)
- Forms and controlled inputs

### Advanced Patterns

- Protected routes
- Authentication flow
- API client abstraction
- Component composition
- State lifting

---

## 🔮 Future Enhancements

Possible additions:

- [ ] User registration (customers)
- [ ] Order history
- [ ] Price history chart
- [ ] Search/filter oils
- [ ] Favorites list
- [ ] Dark mode
- [ ] Print receipt
- [ ] Export data (CSV)
- [ ] Image upload
- [ ] Email notifications

---

**Built with ❤️ using React, Vite, and Tailwind CSS**

