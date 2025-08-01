# OAuth Production Setup Guide

## 🚨 Current Issue
OAuth Application error: a server-side exception has occurred while loading www.slotroster.com

## 🔧 Root Cause
The OAuth redirect URLs are not properly configured for the production domain `www.slotroster.com`.

## 📋 Required Environment Variables

### 1. Update your production environment variables:

```bash
# Production URLs
NEXT_PUBLIC_SITE_URL=https://www.slotroster.com
BASE_URL=https://www.slotroster.com

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

## 🔗 OAuth Redirect URLs Configuration

### 2. Supabase Dashboard Configuration

Go to your Supabase Dashboard → Authentication → URL Configuration:

**Site URL:**
```
https://www.slotroster.com
```

**Redirect URLs:**
```
https://www.slotroster.com/auth/callback
https://www.slotroster.com/dashboard
https://www.slotroster.com/setup
```

### 3. Google OAuth Configuration

Go to Google Cloud Console → APIs & Services → Credentials:

**Authorized JavaScript origins:**
```
https://www.slotroster.com
https://slotroster.com
```

**Authorized redirect URIs:**
```
https://www.slotroster.com/auth/callback
```

## 🛠️ Code Fixes

### 4. Update OAuth callback to handle production URLs

The current callback route should work, but ensure these environment variables are set correctly.

### 5. Verify the signInWithGoogle function

The function in `app/(login)/actions.ts` is correctly using:
```typescript
redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
```

## 🧪 Testing Steps

### 6. Test OAuth Flow

1. **Clear browser cache and cookies**
2. **Visit:** `https://www.slotroster.com`
3. **Click "Sign in with Google"**
4. **Verify redirect to Google OAuth**
5. **Complete OAuth flow**
6. **Verify redirect back to dashboard**

## 🔍 Troubleshooting

### Common Issues:

1. **Environment Variables Not Set**
   - Ensure all environment variables are set in your production environment
   - Check your hosting platform (Vercel, Netlify, etc.) environment settings

2. **Redirect URL Mismatch**
   - Verify exact URL matches between Google OAuth and Supabase
   - No trailing slashes unless specified

3. **HTTPS Required**
   - Production OAuth requires HTTPS
   - Ensure SSL certificate is properly configured

4. **Domain Verification**
   - Ensure `www.slotroster.com` is verified in Google Cloud Console
   - Add both `slotroster.com` and `www.slotroster.com` to authorized origins

## 📝 Production Checklist

- [ ] Environment variables set correctly
- [ ] Supabase redirect URLs configured
- [ ] Google OAuth redirect URLs configured
- [ ] SSL certificate active
- [ ] Domain verified in Google Cloud Console
- [ ] Test OAuth flow end-to-end

## 🚀 Deployment

After making these changes:

1. **Deploy to production**
2. **Verify environment variables**
3. **Test OAuth flow**
4. **Monitor server logs for errors**

## 📞 Support

If issues persist:
1. Check server logs for specific error messages
2. Verify all URLs match exactly (no typos)
3. Ensure HTTPS is working properly
4. Test with a fresh browser session 