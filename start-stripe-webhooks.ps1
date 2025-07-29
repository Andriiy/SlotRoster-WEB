# Stripe Webhook Listener Script
# This script starts the Stripe CLI webhook listener for local development

Write-Host "Starting Stripe webhook listener..." -ForegroundColor Green
Write-Host "This will forward webhook events to your local development server." -ForegroundColor Yellow
Write-Host "Make sure your Next.js development server is running on http://localhost:3000" -ForegroundColor Yellow
Write-Host ""

# Start the Stripe webhook listener
# This will forward webhook events to your local development server
.\stripe.exe listen --forward-to localhost:3000/api/stripe/webhook

Write-Host ""
Write-Host "Webhook listener stopped." -ForegroundColor Red 