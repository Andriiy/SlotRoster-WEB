# Production Stripe Setup for slotroster.com

This guide will help you configure Stripe to work properly on slotroster.com.

## 🔧 **Environment Variables Required**

Add these to your production environment (Vercel, Netlify, etc.):

```bash
# Production URLs
BASE_URL=https://slotroster.com
NEXT_PUBLIC_SITE_URL=https://slotroster.com

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_... # Your live Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_... # Your webhook secret

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 🌐 **Stripe Dashboard Configuration**

### 1. **Webhook Endpoint**
Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks) and:

1. **Add endpoint**: `https://slotroster.com/api/stripe/webhook`
2. **Select events**:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### 2. **OAuth Redirect URLs**
In your Supabase project settings:

1. Go to **Authentication > URL Configuration**
2. Set **Site URL**: `https://slotroster.com`
3. Set **Redirect URLs**:
   - `https://slotroster.com/auth/callback`
   - `https://slotroster.com/dashboard`

### 3. **Google OAuth Configuration**
In your Google Cloud Console:

1. Add **Authorized redirect URIs**:
   - `https://slotroster.com/auth/callback`

## 🧪 **Testing Production Stripe**

### 1. **Test Webhook**
```bash
# Test webhook locally (for development)
stripe listen --forward-to localhost:3000/api/stripe/webhook

# For production, use Stripe CLI to test
stripe trigger customer.subscription.created
```

### 2. **Test Checkout Flow**
1. Go to `https://slotroster.com/dashboard/products`
2. Select a plan and click Subscribe
3. Complete test payment
4. Verify webhook receives events

## 🔍 **Troubleshooting**

### **Common Issues**

1. **Webhook Not Receiving Events**
   - Check webhook endpoint URL is correct
   - Verify webhook secret in environment
   - Check Stripe dashboard for failed webhooks

2. **OAuth Redirect Issues**
   - Verify redirect URLs in Supabase
   - Check Google OAuth configuration
   - Ensure `NEXT_PUBLIC_SITE_URL` is set

3. **Checkout Session Issues**
   - Verify `BASE_URL` environment variable
   - Check Stripe secret key is live (not test)
   - Ensure products/prices exist in Stripe

### **Debug Steps**

1. **Check Environment Variables**
   ```bash
   # Verify these are set in production
   echo $BASE_URL
   echo $STRIPE_SECRET_KEY
   echo $STRIPE_WEBHOOK_SECRET
   ```

2. **Test Stripe Connection**
   ```javascript
   // Add this to a test API route
   const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
   const products = await stripe.products.list();
   console.log('Products:', products.data.length);
   ```

3. **Check Webhook Logs**
   - Go to Stripe Dashboard > Webhooks
   - Click on your webhook endpoint
   - Check "Recent deliveries" for errors

## 📋 **Production Checklist**

- [ ] Environment variables set correctly
- [ ] Stripe webhook endpoint configured
- [ ] OAuth redirect URLs updated
- [ ] Google OAuth configured
- [ ] Test payment flow works
- [ ] Webhook events received
- [ ] Database updates correctly
- [ ] Error handling in place

## 🚀 **Deployment**

1. **Set Environment Variables** in your hosting platform
2. **Deploy the application**
3. **Test the complete flow**
4. **Monitor webhook events**
5. **Verify database updates**

## 📞 **Support**

If issues persist:
1. Check Stripe Dashboard logs
2. Verify environment variables
3. Test webhook endpoint manually
4. Check application logs for errors 