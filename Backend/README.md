# Algerie Post Backend

Backend API for the Algerie Post E-Commerce Platform built with TypeScript, Node.js, Express, and PostgreSQL using TypeORM.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp ENV_TEMPLATE.md .env
```

Edit `.env` with your configuration:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=algerie_post

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

3. Create the PostgreSQL database:
```bash
createdb algerie_post
```

4. Run the database schema:
```bash
psql -U postgres -d algerie_post -f ../DB/schema.sql
```

## Development

Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

Build for production:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Sign up new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify` - Verify email with code
- `POST /api/auth/resend-verification` - Resend verification code
- `GET /api/auth/me` - Get current user (requires auth)

### User Management (Admin Only)

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id/status` - Update user account status
- `DELETE /api/users/:id` - Delete user

## Authentication Flow

### Regular User Signup:
1. User signs up → Account created with `pending` status
2. Verification code sent to email (first 6 digits of SHA256 hash)
3. User enters code → Account status changes to `active`
4. User receives JWT token

### Admin Signup:
1. First user to sign up becomes admin automatically
2. Admin account is immediately `active` (no verification needed)
3. Admin receives JWT token immediately

## Admin Features

The first user created is automatically an admin with special privileges:
- View all users
- Update user account status (active, inactive, pending, suspended)
- Delete users
- Cannot delete or modify their own admin status

## Email Verification

Verification codes are generated using SHA256 hash of user information:
- First 6 digits of the hash are sent via email
- Code expires in 15 minutes
- User must enter code to activate account

## Database Schema

The database schema includes 18 tables covering all aspects of the e-commerce platform.

## Project Structure

```
Backend/
├── src/
│   ├── config/
│   │   ├── database.ts      # Database connection
│   │   └── ormconfig.ts     # TypeORM CLI config
│   ├── entities/            # TypeORM entities
│   ├── services/            # Business logic
│   │   ├── auth.service.ts
│   │   └── email.service.ts
│   ├── controllers/         # Request handlers
│   │   ├── auth.controller.ts
│   │   └── user.controller.ts
│   ├── routes/              # API routes
│   │   ├── auth.routes.ts
│   │   └── user.routes.ts
│   ├── middleware/          # Middleware functions
│   │   └── auth.middleware.ts
│   ├── app.ts               # Express app setup
│   └── index.ts             # Application entry point
├── .env                     # Environment variables (not in git)
├── package.json
├── tsconfig.json
└── README.md
```

## TypeORM Commands

- Generate migration: `npm run migration:generate -- src/migrations/MigrationName`
- Run migrations: `npm run migration:run`
- Revert migration: `npm run migration:revert`
- Create empty migration: `npm run migration:create -- src/migrations/MigrationName`

## Notes

- **Never use `synchronize: true` in production** - Always use migrations
- All entities are located in `src/entities/`
- Database connection is configured in `src/config/database.ts`
- The schema includes automatic `updated_at` triggers for PostgreSQL
- JWT tokens are used for authentication
- Admin is determined by being the first user (lowest ID)

## License

ISC
