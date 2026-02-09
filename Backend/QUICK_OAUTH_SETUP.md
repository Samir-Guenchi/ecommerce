# Quick OAuth Setup Guide

## ✅ Current Status

Your OAuth implementation is **READY** and working! The routes are configured and the backend is running successfully.

**What's working:**
- ✅ OAuth routes are active (`/api/auth/google`, `/api/auth/facebook`)
- ✅ TypeScript compilation successful
- ✅ Backend server running on port 3000
- ✅ Passport.js configured correctly
- ✅ Email verification service ready

**What you need to do:**
- ⏳ Configure OAuth credentials (Google & Facebook)
- ⏳ Configure Gmail for email verification

---

## 🚀 Quick Setup (15 minutes)

### Step 1: Gmail App Password (5 minutes)

1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification" if not already enabled
3. Go to https://myaccount.google.com/apppasswords
4. Create app password:
   - App: Mail
   - Device: Other (Custom name) → "Algerie Poste Backend"
5. Copy the 16-character password
6. Update `.env`:
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx
   ```

### Step 2: Google OAuth (5 minutes)

1. Go to https://console.cloud.google.com/
2. Create new project: "Algerie Poste"
3. Enable Google+ API:
   - APIs & Services → Library → Search "Google+ API" → Enable
4. Create OAuth credentials:
   - APIs & Services → Credentials → Create Credentials → OAuth client ID
   - Configure consent screen (if prompted):
     - User Type: External
     - App name: Algerie Poste
     - Email: your-email@gmail.com
   - Application type: Web application
   - Name: Algerie Poste Web
   - Authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/google/callback
     http://10.0.2.2:3000/api/auth/google/callback
     ```
5. Copy Client ID and Client Secret
6. Update `.env`:
   ```env
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

### Step 3: Facebook OAuth (5 minutes)

1. Go to https://developers.facebook.com/
2. Create app:
   - My Apps → Create App → Consumer
   - App name: Algerie Poste
   - Email: your-email@gmail.com
3. Add Facebook Login:
   - Dashboard → Add Product → Facebook Login → Set Up → Web
   - Site URL: http://localhost:3000
4. Configure OAuth:
   - Facebook Login → Settings
   - Valid OAuth Redirect URIs:
     ```
     http://localhost:3000/api/auth/facebook/callback
     http://10.0.2.2:3000/api/auth/facebook/callback
     ```
5. Get credentials:
   - Settings → Basic → Copy App ID and App Secret
6. Update `.env`:
   ```env
   FACEBOOK_APP_ID=your-app-id
   FACEBOOK_APP_SECRET=your-app-secret
   ```

### Step 4: Restart Backend

```bash
cd Backend
# Stop current process (Ctrl+C)
npm run dev
```

---

## 🧪 Testing

### Test Email Verification
1. Sign up with your real email
2. Check inbox for 6-digit code
3. Enter code in app

### Test Google OAuth
1. Click "Continue with Google"
2. Select Google account
3. Grant permissions
4. Should redirect back logged in

### Test Facebook OAuth
1. Click "Continue with Facebook"
2. Log in to Facebook
3. Grant permissions
4. Should redirect back logged in

---

## 📝 Current .env Template

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
EMAIL_FROM=Algerie Poste <noreply@algerieposte.dz>

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Facebook OAuth
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:3000/api/auth/facebook/callback

# Frontend URL
FRONTEND_URL=http://localhost:8081
```

---

## ⚠️ Important Notes

1. **OAuth won't work until you add real credentials** - The placeholder values in `.env` need to be replaced
2. **Email verification won't work until you add Gmail app password**
3. **For production**: Update all URLs to HTTPS and your domain
4. **Security**: Never commit `.env` file (it's already in `.gitignore`)

---

## 🎉 Once Configured

Your app will have:
- ✅ Real email verification with 6-digit codes
- ✅ Google OAuth sign-in
- ✅ Facebook OAuth sign-in
- ✅ Secure JWT authentication
- ✅ Professional user experience

---

## 🆘 Troubleshooting

**"Route not found" error?**
- Backend is not running → Run `npm run dev` in Backend folder

**"501 Not Implemented" error?**
- OAuth credentials not configured → Follow steps above

**Email not sending?**
- Check SMTP credentials are correct
- Verify 2FA is enabled on Gmail
- Ensure app password is generated correctly

**Google OAuth not working?**
- Verify redirect URI matches exactly
- Check Google+ API is enabled
- Ensure OAuth consent screen is configured

**Facebook OAuth not working?**
- Verify app is not in development mode (or add test users)
- Check redirect URI matches exactly
- Ensure Facebook Login product is added
