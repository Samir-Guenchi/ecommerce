# Environment Variables Template

Copy this content to a `.env` file in the Backend directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password_here
DB_NAME=algerie_post
DB_SSL=false

# Application Configuration
NODE_ENV=development
PORT=3000

# JWT Configuration (for authentication)
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Server Configuration
API_URL=http://localhost:3000

# Email Configuration (for verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password_here
```

## Setup Instructions

1. Create a `.env` file in the `Backend` directory
2. Copy the content above into the `.env` file
3. Replace the placeholder values with your actual configuration:
   - `DB_PASSWORD`: Your PostgreSQL password
   - `JWT_SECRET`: A strong random string for JWT token signing
   - Adjust other values as needed for your environment

## Security Notes

- Never commit the `.env` file to version control
- Use strong, unique values for production
- Consider using environment-specific files (`.env.development`, `.env.production`)



