# Authentication Guide - SlotRoster

## 🔐 Overview

This document explains the authentication process, troubleshooting steps, and solutions for the SlotRoster application.

## 🏗️ Architecture

### Authentication Flow
1. **User clicks "Continue with Google"** → Client-side OAuth initiation
2. **Google OAuth redirect** → User authenticates with Google
3. **Callback to `/auth/callback`** → Server processes OAuth code
4. **Supabase session creation** → User authenticated in `auth.users`
5. **Redirect to `/dashboard`** → User lands on dashboard

### Key Components

#### Client-Side Authentication (`app/(login)/login.tsx`)
```typescript
// Uses client-side Supabase to avoid server component errors
const { supabase } = await import('@/lib/supabase/client');

const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: redirectUrl,
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    }
  }
});
```

#### OAuth Callback (`app/auth/callback/route.ts`)
```typescript
// Processes OAuth code and creates session
const { data, error } = await supabase.auth.exchangeCodeForSession(code);

// Redirects to dashboard (no air club check)
return NextResponse.redirect(new URL('/dashboard', baseUrl));
```

## 🔧 Environment Variables

### Required Variables
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application Configuration
BASE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### How to Get Supabase Credentials
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy **Project URL** and **anon public** key

## 🚨 Common Issues & Solutions

### Issue 1: "Continue with Google" Button Not Working
**Symptoms:** Button click does nothing, no error visible

**Root Cause:** Server-side Supabase client failing in server components

**Solution:**
```typescript
// ❌ Don't use server actions for OAuth
onClick={() => signInWithGoogle()}

// ✅ Use client-side Supabase
onClick={async () => {
  const { supabase } = await import('@/lib/supabase/client');
  // ... OAuth logic
}}
```

### Issue 2: OAuth Redirecting to Wrong URL
**Symptoms:** Redirects to production URL instead of localhost

**Root Cause:** Environment variables not set for local development

**Solution:**
```typescript
// Detect localhost and use appropriate URL
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const siteUrl = isLocalhost ? 'http://localhost:3000' : (process.env.NEXT_PUBLIC_SITE_URL || 'https://slotroster.com');
```

### Issue 3: "profile_creation_error" in OAuth Callback
**Symptoms:** OAuth fails with database constraint errors

**Root Cause:** Trying to insert into `profiles` table with non-existent columns

**Solution:**
```typescript
// ❌ Don't use profiles table for authentication
// Only use auth.users (handled automatically by Supabase)

// ✅ Remove all profiles table usage from OAuth callback
// OAuth authentication is complete - auth.users is automatically created by Supabase
```

### Issue 4: Server Component Errors in Production
**Symptoms:** "An error occurred in the Server Components render"

**Root Cause:** Server-side Supabase client failing in production builds

**Solution:**
- Use client-side Supabase for OAuth initiation
- Keep server-side Supabase only for callback processing

## 🔍 Debugging Steps

### 1. Check Environment Variables
```typescript
console.log('Environment Check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
```

### 2. Check OAuth Configuration
- **Supabase Dashboard** → Authentication → Providers → Google
- **Google Cloud Console** → APIs & Services → Credentials
- **Redirect URLs** must match exactly

### 3. Check Network Requests
- Open browser DevTools → Network tab
- Look for OAuth requests and responses
- Check for CORS errors

### 4. Check Console Logs
- Look for error messages in browser console
- Check server logs for callback errors

## 🛠️ Configuration Checklist

### Supabase Setup
- [ ] Google OAuth provider enabled
- [ ] Redirect URL: `http://localhost:3000/auth/callback` (dev)
- [ ] Redirect URL: `https://slotroster.com/auth/callback` (prod)
- [ ] Environment variables set in `.env.local`

### Google Cloud Console
- [ ] OAuth 2.0 client created
- [ ] Authorized JavaScript origins: `http://localhost:3000`
- [ ] Authorized redirect URIs: `http://localhost:3000/auth/callback`
- [ ] Production URLs configured for live site

### Application Code
- [ ] Client-side OAuth initiation (not server actions)
- [ ] Proper localhost detection for redirects
- [ ] No profiles table usage in OAuth callback
- [ ] Error handling in place

## 📝 Key Rules

### Rule 1: Authentication Only Uses `auth.users`
- **NEVER** use `profiles` table for authentication
- Supabase automatically creates `auth.users` entries
- `profiles` table is for business logic, not auth

### Rule 2: Client-Side for OAuth Initiation
- **ALWAYS** use client-side Supabase for OAuth buttons
- Server actions fail in production builds
- Only use server-side for callback processing

### Rule 3: Environment Detection
- **ALWAYS** detect localhost vs production
- Use appropriate URLs for redirects
- Check `NODE_ENV` for server-side logic

### Rule 4: Error Handling
- **ALWAYS** wrap OAuth calls in try/catch
- Log errors for debugging
- Provide user-friendly error messages

## 🚀 Quick Fix Commands

### Restart Development Server
```bash
# Stop current server
taskkill /F /IM node.exe

# Restart with fresh environment
npm run dev
```

### Check Environment Variables
```bash
# Windows
dir | findstr env

# Verify .env.local exists and has correct values
```

### Clear Browser Cache
- Clear cookies and cache for localhost:3000
- Try incognito/private browsing mode

## 📚 Related Files

- `app/(login)/login.tsx` - OAuth button implementation
- `app/auth/callback/route.ts` - OAuth callback processing
- `lib/supabase/client.ts` - Client-side Supabase setup
- `lib/supabase/server.ts` - Server-side Supabase setup
- `.env.local` - Environment variables

## 🔄 Future Maintenance

When making changes to authentication:

1. **Test in development first**
2. **Check environment variables**
3. **Verify OAuth configuration**
4. **Test both localhost and production**
5. **Update this guide if needed**

---

**Last Updated:** February 2025  
**Version:** 1.0  
**Status:** Production Ready ✅ 