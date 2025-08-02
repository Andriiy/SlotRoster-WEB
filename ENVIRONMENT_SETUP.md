# Environment Setup Guide

To fix the Supabase configuration errors you're seeing, you need to create a `.env.local` file in the root directory with the following environment variables:

## Required Environment Variables

Create a file called `.env.local` in the root directory with these variables:

```bash
# Supabase Configuration
# Get these values from your Supabase project dashboard
# https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Stripe Configuration
# Get these values from your Stripe dashboard
# https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# Application Configuration
BASE_URL=http://localhost:3000
```

## How to Get These Values

### Supabase Setup
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select an existing one
3. Go to Settings → API
4. Copy the "Project URL" and "anon public" key
5. Replace `your_supabase_url_here` and `your_supabase_anon_key_here` with these values

### Stripe Setup
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to Developers → API Keys
3. Copy the "Secret key" (starts with `sk_test_` or `sk_live_`)
4. For webhook secret, go to Developers → Webhooks and create a webhook endpoint
5. Replace `your_stripe_secret_key_here` and `your_stripe_webhook_secret_here` with these values

## After Setting Up

Once you've created the `.env.local` file with your actual credentials:

1. Stop the development server (Ctrl+C)
2. Restart it with `npm run dev`
3. The Supabase errors should be resolved
4. The hydration mismatch should also be fixed

## Testing the Setup

After setting up the environment variables, you should be able to:
- View the landing page without errors
- Sign up for new accounts
- Access the dashboard
- Test Stripe payments (using test card: 4242 4242 4242 4242) 