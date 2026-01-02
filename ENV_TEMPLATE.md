# Environment Variables Template

Create a `.env` file in the root directory with the following content:

```env
# Database Connection
# Replace 'username' and 'password' with your PostgreSQL credentials
DATABASE_URL="postgresql://username:password@localhost:5432/sso_oil_shop?schema=public"

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret (generate a strong random string for production)
# You can generate one using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Admin Credentials (for initial setup)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

## Notes:

1. **DATABASE_URL**: Update with your actual PostgreSQL credentials
   - Default PostgreSQL port: 5432
   - Database name: `sso_oil_shop`

2. **JWT_SECRET**: 
   - MUST be changed for production
   - Generate a strong secret using: `openssl rand -base64 32`

3. **Admin Credentials**:
   - Used by seed script to create initial admin user
   - Change password immediately after first login in production

4. **Security**:
   - Never commit `.env` file to version control
   - `.env` is already in `.gitignore`

