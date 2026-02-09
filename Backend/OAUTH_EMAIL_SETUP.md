# OAuth & Email Setup Guide

This guide will help you configure Google OAuth, Facebook OAuth, and real email verification for your Algerie Poste e-commerce platform.

## 📧 Email Configuration (Gmail)

### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Name it "Algerie Poste Backend"
4. Click "Generate"
5. Copy the 16-character password

### Step 3: Update .env File
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # The 16-char app password
EMAIL_FROM=Algerie Poste <noreply@algerieposte.dz>
```

## 🔐 Google OAuth Setup

### Step 1: Create Google Cloud Project
1. Go to https://console.cloud.google.com/
2. Click "Select a project" → "New Project"
3. Name: "Algerie Poste"
4. Click "Create"

### Step 2: Enable Google+ API
1. Go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click "Enable"

### Step 3: Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Configure consent screen if prompted:
   - User Type: External
   - App name: Algerie Poste
   - User support email: your-email@gmail.com
   - Developer contact: your-email@gmail.com
4. Application type: "Web application"
5. Name: "Algerie Poste Web"
6. Authorized redirect URIs:
   - http://localhost:3000/api/auth/google/callback
   - http://10.0.2.2:3000/api/auth/google/callback (for Android emulator)
7. Click "Create"
8. Copy Client ID and Client Secret

### Step 4: Update .env File
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

## 📘 Facebook OAuth Setup

### Step 1: Create Facebook App
1. Go to https://developers.facebook.com/
2. Click "My Apps" → "Create App"
3. Select "Consumer" → "Next"
4. App name: "Algerie Poste"
5. App contact email: your-email@gmail.com
6. Click "Create App"

### Step 2: Add Facebook Login
1. In your app dashboard, click "Add Product"
2. Find "Facebook Login" → Click "Set Up"
3. Select "Web"
4. Site URL: http://localhost:3000
5. Click "Save" → "Continue"

### Step 3: Configure OAuth Settings
1. Go to "Facebook Login" → "Settings"
2. Valid OAuth Redirect URIs:
   - http://localhost:3000/api/auth/facebook/callback
   - http://10.0.2.2:3000/api/auth/facebook/callback
3. Click "Save Changes"

### Step 4: Get App Credentials
1. Go to "Settings" → "Basic"
2. Copy "App ID" and "App Secret"

### Step 5: Update .env File
```env
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:3000/api/auth/facebook/callback
```

## 🌐 Frontend URL Configuration

Update the frontend URL in .env:
```env
FRONTEND_URL=http://localhost:8081
```

For production, change to your actual domain:
```env
FRONTEND_URL=https://yourdomain.com
```

## 🧪 Testing

### Test Email Verification
1. Sign up with a real email address
2. Check your inbox for verification code
3. Enter the code in the app

### Test Google OAuth
1. Click "Continue with Google" in the app
2. Select your Google account
3. Grant permissions
4. You should be redirected back and logged in

### Test Facebook OAuth
1. Click "Continue with Facebook" in the app
2. Log in to Facebook if needed
3. Grant permissions
4. You should be redirected back and logged in

## 🔒 Security Notes

### For Production:
1. **Never commit .env file** - It's in .gitignore
2. **Use environment variables** in production (Heroku, AWS, etc.)
3. **Enable HTTPS** - OAuth requires secure connections
4. **Update redirect URIs** to production URLs
5. **Restrict API keys** to your domain only
6. **Use strong SESSION_SECRET** - Generate with: `openssl rand -base64 32`

### OAuth Redirect URIs for Production:
```
https://yourdomain.com/api/auth/google/callback
https://yourdomain.com/api/auth/facebook/callback
```

## 📝 Troubleshooting

### Email not sending?
- Check SMTP credentials are correct
- Verify 2FA is enabled on Gmail
- Ensure app password is generated correctly
- Check firewall isn't blocking port 587

### Google OAuth not working?
- Verify redirect URI matches exactly (including http/https)
- Check Google+ API is enabled
- Ensure OAuth consent screen is configured
- Add test users if app is in testing mode

### Facebook OAuth not working?
- Verify app is not in development mode (or add test users)
- Check redirect URI matches exactly
- Ensure Facebook Login product is added
- Verify app domain is configured

## 🎉 Done!

Once configured, your app will have:
- ✅ Real email verification with Gmail
- ✅ Google OAuth sign-in
- ✅ Facebook OAuth sign-in
- ✅ Secure authentication flow
