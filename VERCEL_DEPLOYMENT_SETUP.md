# Vercel Deployment Setup Guide

## 🚨 Current Issue
Application error: a server-side exception has occurred while loading saas-slotroster-web-git-test-andriyeme-7477s-projects.vercel.app

## 🔧 Root Cause
The Vercel deployment is missing required environment variables, causing the application to crash on startup.

## 📋 Required Environment Variables for Vercel

### **1. Go to Vercel Dashboard:**
1. Visit: https://vercel.com/dashboard
2. Find your project: `saas-slotroster-web-git-test-andriyeme-7477s-projects`
3. Go to **Settings** → **Environment Variables**

### **2. Add These Environment Variables:**

```bash
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://lnedzpnnmmguksvedmim.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Site URLs (REQUIRED)
NEXT_PUBLIC_SITE_URL=https://saas-slotroster-web-git-test-andriyeme-7477s-projects.vercel.app
BASE_URL=https://saas-slotroster-web-git-test-andriyeme-7477s-projects.vercel.app

# Stripe Configuration (if using Stripe)
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_webhook_secret_here
```

### **3. Environment Variable Sources:**

**Supabase Keys:**
- Go to your Supabase Dashboard
- Settings → API
- Copy the URL and keys

**Stripe Keys:**
- Go to Stripe Dashboard
- Developers → API Keys
- Copy the secret key

## 🔍 How to Find Your Values:

### **Supabase Configuration:**
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL**: `https://lnedzpnnmmguksvedmim.supabase.co`
   - **anon public**: Your anon key
   - **service_role secret**: Your service role key

### **Stripe Configuration (if using):**
1. Go to: https://dashboard.stripe.com/apikeys
2. Copy:
   - **Secret key**: `sk_test_...` or `sk_live_...`
   - **Webhook secret**: From webhook settings

## 🚀 Deployment Steps:

### **1. Add Environment Variables:**
- Go to Vercel Dashboard
- Project Settings → Environment Variables
- Add each variable above
- **Important**: Set them for **Production** environment

### **2. Redeploy:**
- Go to Vercel Dashboard
- Click **Redeploy** on your latest deployment
- Or push a new commit to trigger deployment

### **3. Test the Deployment:**
- Visit: `https://saas-slotroster-web-git-test-andriyeme-7477s-projects.vercel.app`
- Should load without server errors

## 🔧 Troubleshooting:

### **If Still Getting Errors:**

1. **Check Vercel Logs:**
   - Go to Vercel Dashboard
   - Click on your latest deployment
   - Check **Functions** tab for error logs

2. **Verify Environment Variables:**
   - Ensure all variables are set
   - Check for typos in variable names
   - Make sure values are correct

3. **Test Locally First:**
   ```bash
   # Create .env.local with the same variables
   cp .env.example .env.local
   # Add your production values
   npm run dev
   ```

## 📝 Quick Fix Checklist:

- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` to Vercel
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel
- [ ] Add `NEXT_PUBLIC_SITE_URL` to Vercel
- [ ] Add `BASE_URL` to Vercel
- [ ] Redeploy the application
- [ ] Test the deployment URL

## 🎯 Expected Result:

After adding the environment variables and redeploying, your Vercel deployment should:
- ✅ Load without server errors
- ✅ Display your application properly
- ✅ Handle OAuth flows correctly

**The server-side exception should be resolved once the environment variables are properly configured!** 