# SSO Oil Shop Displayer

A local oil shop platform that displays daily oil prices, descriptions, and allows customers to calculate mixed oil prices by percentage.

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT with bcrypt

## Features

- ✅ Display oil products with bilingual support (English & Myanmar)
- ✅ Admin authentication system
- ✅ CRUD operations for oil products (admin only)
- ✅ Soft delete functionality
- ✅ Public API for viewing active oils
- ✅ RESTful API design

## Project Structure

```
SSOapp/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.js             # Sample data seeding script
├── src/
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   └── oilController.js     # Oil CRUD operations
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   └── oilRoutes.js         # Oil endpoints
│   ├── services/
│   │   └── prisma.js            # Prisma client singleton
│   ├── app.js                   # Express app configuration
│   └── server.js                # Server entry point
├── .env                         # Environment variables (create this)
├── .env.example                 # Environment template
├── package.json
└── README.md
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

## Installation & Setup

### 1. Clone and Install Dependencies

```bash
# Navigate to project directory
cd SSOapp

# Install dependencies
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database Connection
DATABASE_URL="postgresql://username:password@localhost:5432/sso_oil_shop?schema=public"

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret (generate a strong random string for production)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Admin Credentials (for initial setup)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

**Important**: Replace `username` and `password` in `DATABASE_URL` with your PostgreSQL credentials.

### 3. Set Up PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE sso_oil_shop;

# Exit PostgreSQL
\q
```

### 4. Run Prisma Migrations

```bash
# Generate Prisma Client
npm run prisma:generate

# Create database tables
npm run prisma:migrate
```

When prompted for a migration name, you can use: `init`

### 5. Seed the Database

```bash
# Populate database with sample data
npm run prisma:seed
```

This will create:
- 1 admin user (username: `admin`, password: `admin123`)
- 5 sample oil products

### 6. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start at `http://localhost:3000`

## API Endpoints

### Authentication

#### Login (Admin)
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

### Oils

#### Get All Active Oils (Public)
```http
GET /api/oils

Response:
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "name_en": "Palm Oil",
      "name_my": "ထန်းဆီ",
      "description_en": "Pure refined palm oil...",
      "description_my": "သန့်စင်ထားသော ထန်းဆီ...",
      "price_per_unit": "3500.00",
      "image_url": "https://example.com/images/palm-oil.jpg",
      "is_active": true,
      "created_at": "2026-01-02T10:00:00.000Z",
      "updated_at": "2026-01-02T10:00:00.000Z"
    }
  ]
}
```

#### Create Oil (Admin Only)
```http
POST /api/oils
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name_en": "Olive Oil",
  "name_my": "သံလွင်ဆီ",
  "description_en": "Premium quality olive oil",
  "description_my": "အရည်အသွေးမြင့် သံလွင်ဆီ",
  "price_per_unit": 8500.00,
  "image_url": "https://example.com/images/olive-oil.jpg"
}

Response:
{
  "success": true,
  "message": "Oil created successfully",
  "data": { ... }
}
```

#### Update Oil (Admin Only)
```http
PUT /api/oils/:id
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "price_per_unit": 9000.00,
  "is_active": true
}

Response:
{
  "success": true,
  "message": "Oil updated successfully",
  "data": { ... }
}
```

#### Delete Oil (Admin Only - Soft Delete)
```http
DELETE /api/oils/:id
Authorization: Bearer YOUR_JWT_TOKEN

Response:
{
  "success": true,
  "message": "Oil deleted successfully (soft delete)",
  "data": { ... }
}
```

## Testing the API

### Using cURL

```bash
# 1. Login to get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 2. Get all oils (public)
curl http://localhost:3000/api/oils

# 3. Create oil (admin - use token from login)
curl -X POST http://localhost:3000/api/oils \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"name_en":"Test Oil","name_my":"စမ်းသပ်ဆီ","description_en":"Test","description_my":"စမ်းသပ်","price_per_unit":1000}'
```

### Using Postman

1. Import the API endpoints
2. Login to get JWT token
3. Add token to Authorization header for protected routes
4. Test CRUD operations

## Database Schema

### Oils Table
- `id` - Auto-increment primary key
- `name_en` - English name
- `name_my` - Myanmar name
- `description_en` - English description
- `description_my` - Myanmar description
- `price_per_unit` - Decimal price (10,2)
- `image_url` - Optional image URL
- `is_active` - Boolean for soft delete
- `created_at` - Timestamp
- `updated_at` - Auto-updated timestamp

### Users Table
- `id` - Auto-increment primary key
- `username` - Unique username
- `password_hash` - Bcrypt hashed password
- `role` - User role (default: 'admin')
- `created_at` - Timestamp

## Security Notes

⚠️ **Important for Production:**

1. Change `JWT_SECRET` to a strong, random string
2. Update default admin password immediately
3. Use HTTPS in production
4. Enable rate limiting
5. Add input validation middleware
6. Set up proper CORS configuration
7. Use environment-specific configurations
8. Never commit `.env` file to version control

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running: `pg_isready`
- Check credentials in `.env` file
- Ensure database exists: `psql -l`

### Migration Errors
- Reset migrations: `npx prisma migrate reset`
- Generate client: `npm run prisma:generate`

### Port Already in Use
- Change `PORT` in `.env` file
- Or kill process: `lsof -ti:3000 | xargs kill` (Mac/Linux)

## Future Enhancements

- [ ] Image upload functionality
- [ ] Mixed oil price calculator API
- [ ] Admin dashboard frontend
- [ ] Customer mobile app
- [ ] Price history tracking
- [ ] Multi-language support expansion

## License

ISC

## Contact

For questions or support, please contact the development team.

