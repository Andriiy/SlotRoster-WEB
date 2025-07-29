# OAuth Setup Guide for www.slotroster.com

## 🔧 **Step 1: Supabase Configuration**

### **1.1 Update Site URL**
1. Go to your Supabase Dashboard → Authentication → Settings
2. Set **Site URL** to: `https://www.slotroster.com`

### **1.2 Configure Redirect URLs**
Add these redirect URLs in Supabase Authentication → Settings:

```
https://www.slotroster.com/auth/callback
https://www.slotroster.com/dashboard
https://www.slotroster.com/sign-in
https://www.slotroster.com/sign-up
```

## 🔧 **Step 2: Vercel Environment Variables**

Add these environment variables in your Vercel project settings:

### **Required Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SITE_URL=https://www.slotroster.com
```

### **Optional OAuth Providers:**

#### **Google OAuth:**
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### **GitHub OAuth:**
```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## 🔧 **Step 3: OAuth Provider Setup**

### **Google OAuth Setup:**

1. **Go to Google Cloud Console**
   - Visit [console.cloud.google.com](https://console.cloud.google.com)
   - Create a new project or select existing one

2. **Enable Google+ API**
   - Go to APIs & Services → Library
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials**
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Authorized redirect URIs: `https://www.slotroster.com/auth/callback`

4. **Add to Supabase**
   - Go to Supabase → Authentication → Providers
   - Enable Google provider
   - Add your Google Client ID and Client Secret

### **GitHub OAuth Setup:**

1. **Go to GitHub Developer Settings**
   - Visit [github.com/settings/developers](https://github.com/settings/developers)
   - Click "New OAuth App"

2. **Configure OAuth App**
   - Application name: "SlotRoster"
   - Homepage URL: `https://www.slotroster.com`
   - Authorization callback URL: `https://www.slotroster.com/auth/callback`

3. **Add to Supabase**
   - Go to Supabase → Authentication → Providers
   - Enable GitHub provider
   - Add your GitHub Client ID and Client Secret

## 🔧 **Step 4: Test OAuth Flow**

### **Testing Steps:**
1. Visit `https://www.slotroster.com/sign-in`
2. Click on Google/GitHub sign-in button
3. Complete OAuth flow
4. Verify redirect to dashboard works
5. Check user profile creation

## 🔧 **Step 5: Security Considerations**

### **Additional Security Settings:**
1. **Enable Email Confirmations** (if needed)
2. **Set Session Timeout** (recommended: 24 hours)
3. **Configure Password Policy** (if using email/password)
4. **Set up Webhook Endpoints** (for real-time updates)

### **CORS Configuration:**
Make sure your Supabase project allows requests from:
```
https://www.slotroster.com
```

## 🔧 **Step 6: Production Checklist**

- [ ] Site URL configured in Supabase
- [ ] Redirect URLs added
- [ ] Environment variables set in Vercel
- [ ] OAuth providers configured
- [ ] Test OAuth flow works
- [ ] User profile creation works
- [ ] Dashboard access works after OAuth
- [ ] Error handling tested

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **"Invalid redirect URI"**
   - Check redirect URLs in Supabase settings
   - Ensure exact match with OAuth provider settings

2. **"OAuth callback error"**
   - Verify environment variables in Vercel
   - Check Supabase project URL and keys

3. **"User profile not created"**
   - Check database schema
   - Verify `profiles` table exists
   - Check callback route logic

4. **"Session not persisting"**
   - Verify cookie settings
   - Check domain configuration
   - Ensure HTTPS is used

## 🔧 **Support**

If you encounter issues:
1. Check Supabase logs in dashboard
2. Check Vercel deployment logs
3. Verify all environment variables are set
4. Test with a fresh browser session 