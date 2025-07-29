# Stripe CLI Setup for Local Development

## Installation

The Stripe CLI has been installed in your project directory. You can find it at:
- `stripe.exe` - The Stripe CLI executable

## Authentication

The Stripe CLI is already authenticated with your Stripe account:
- **Account**: Slotroster
- **Account ID**: acct_1RlcmlGRjsj6xlVP
- **Expires**: 90 days from installation

## Usage

### 1. Start Webhook Listener

To test webhooks locally, run the provided script:

```powershell
.\start-stripe-webhooks.ps1
```

Or manually:

```powershell
.\stripe.exe listen --forward-to localhost:3000/api/stripe/webhook
```

### 2. Test Webhook Events

The webhook listener will:
- ✅ Forward all Stripe webhook events to your local server
- ✅ Display webhook events in the console
- ✅ Provide a webhook signing secret for verification

### 3. Common Commands

```powershell
# Check version
.\stripe.exe --version

# List all events
.\stripe.exe listen --events *

# Listen to specific events
.\stripe.exe listen --events customer.subscription.created,payment_intent.succeeded

# Get webhook signing secret
.\stripe.exe listen --print-secret

# Re-authenticate (when needed)
.\stripe.exe login
```

### 4. Environment Variables

Make sure your `.env.local` file includes:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... # Get this from the webhook listener
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 5. Testing Flow

1. **Start your Next.js development server**:
   ```bash
   npm run dev
   ```

2. **Start the Stripe webhook listener**:
   ```powershell
   .\start-stripe-webhooks.ps1
   ```

3. **Test webhooks** by creating test events in your Stripe dashboard

4. **Monitor events** in both the Stripe CLI console and your application logs

## Troubleshooting

### Re-authentication
If you get authentication errors, re-authenticate:
```powershell
.\stripe.exe login
```

### Webhook Secret
The webhook signing secret is displayed when you start the listener. Use this in your environment variables.

### Port Conflicts
If port 3000 is in use, change the forward URL:
```powershell
.\stripe.exe listen --forward-to localhost:3001/api/stripe/webhook
```

## Benefits

- ✅ **Local Testing**: Test webhooks without deploying
- ✅ **Real Events**: Receive actual Stripe webhook events
- ✅ **Debugging**: See webhook payloads in real-time
- ✅ **Development**: Faster development cycle
- ✅ **Security**: Test webhook signature verification

## Next Steps

1. Start your development server
2. Run the webhook listener script
3. Test your Stripe integration locally
4. Monitor webhook events in the console 