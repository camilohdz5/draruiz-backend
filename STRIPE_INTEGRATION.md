# Stripe Integration Guide

## Overview
This backend includes a complete Stripe integration for subscription management with the following features:

- ✅ Create checkout sessions for subscriptions
- ✅ Handle Stripe webhooks
- ✅ Customer portal for subscription management
- ✅ Subscription plan management
- ✅ Payment processing and status tracking

## Setup

### 1. Environment Variables
Add these variables to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 2. Get Stripe Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to Developers > API keys
3. Copy your **Secret key** (starts with `sk_test_` for test mode)
4. For webhook secret, go to Developers > Webhooks and create a new endpoint

### 3. Seed Subscription Plans
Run the following command to create sample subscription plans:

```bash
npm run seed:plans
```

This will create:
- Basic Plan: $9.99/month
- Pro Plan: $19.99/month  
- Enterprise Plan: $49.99/month

## API Endpoints

### Public Endpoints

#### GET `/api/stripe/plans`
Get all available subscription plans.

**Query Parameters:**
- `platform` (optional): Filter by platform (`web` or `mobile`)

**Response:**
```json
{
  "success": true,
  "plans": [
    {
      "id": "uuid",
      "name": "Basic Plan",
      "price": "9.99",
      "currency": "USD",
      "interval": "month",
      "features": ["feature1", "feature2"]
    }
  ]
}
```

#### POST `/api/stripe/webhook`
Stripe webhook endpoint (no authentication required).

### Protected Endpoints (Require JWT Token)

#### POST `/api/stripe/create-checkout-session`
Create a Stripe checkout session for subscription.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Body:**
```json
{
  "planId": "uuid",
  "successUrl": "https://yourdomain.com/success",
  "cancelUrl": "https://yourdomain.com/cancel"
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

#### POST `/api/stripe/create-portal-session`
Create a customer portal session for subscription management.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Body:**
```json
{
  "returnUrl": "https://yourdomain.com/account"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://billing.stripe.com/..."
}
```

#### GET `/api/stripe/subscription`
Get current user's subscription status.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "subscription": {
    "id": "uuid",
    "status": "active",
    "plan": {
      "name": "Pro Plan",
      "price": "19.99"
    }
  }
}
```

## Webhook Events Handled

The integration handles these Stripe webhook events:

- `checkout.session.completed` - Updates user subscription status
- `customer.subscription.created` - Logs new subscription
- `customer.subscription.updated` - Updates subscription details
- `customer.subscription.deleted` - Marks subscription as canceled
- `invoice.payment_succeeded` - Logs successful payment
- `invoice.payment_failed` - Logs failed payment

## Testing

### 1. Test Cards
Use these test card numbers in Stripe checkout:

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **Requires Authentication:** `4000 0025 0000 3155`

### 2. Test Webhooks
Use Stripe CLI to test webhooks locally:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:4000/api/stripe/webhook
```

## Database Schema

The integration uses these Prisma models:

### SubscriptionPlan
```prisma
model SubscriptionPlan {
  id                    String   @id @default(uuid())
  name                  String
  price                 Decimal  @db.Decimal(10,2)
  currency              String
  interval              String
  platform_availability String[]
  features              String[]
  subscriptions         UserSubscription[]
}
```

### UserSubscription
```prisma
model UserSubscription {
  id                   String   @id @default(uuid())
  user_id              String
  plan_id              String
  status               SubscriptionStatus
  current_period_start DateTime
  current_period_end   DateTime
  cancel_at_period_end Boolean  @default(false)
  platform_source      String
  user                 User     @relation(fields: [user_id], references: [id])
  plan                 SubscriptionPlan @relation(fields: [plan_id], references: [id])
}
```

## Frontend Integration

### 1. Create Checkout Session
```javascript
const response = await fetch('/api/stripe/create-checkout-session', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    planId: 'plan-uuid',
    successUrl: 'https://yourdomain.com/success',
    cancelUrl: 'https://yourdomain.com/cancel'
  })
});

const { url } = await response.json();
window.location.href = url; // Redirect to Stripe checkout
```

### 2. Manage Subscription
```javascript
const response = await fetch('/api/stripe/create-portal-session', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    returnUrl: 'https://yourdomain.com/account'
  })
});

const { url } = await response.json();
window.location.href = url; // Redirect to customer portal
```

## Security Considerations

1. **Webhook Verification:** All webhooks are verified using Stripe signatures
2. **Authentication:** Protected endpoints require valid JWT tokens
3. **Input Validation:** All inputs are validated using Zod schemas
4. **Error Handling:** Comprehensive error handling and logging

## Troubleshooting

### Common Issues

1. **Webhook Signature Verification Failed**
   - Check that `STRIPE_WEBHOOK_SECRET` is correct
   - Ensure webhook endpoint is using raw body parsing

2. **Checkout Session Creation Failed**
   - Verify `STRIPE_SECRET_KEY` is correct
   - Check that plan ID exists in database
   - Ensure user is authenticated

3. **Portal Session Creation Failed**
   - Verify user has an active subscription
   - Check that `platform_source` contains valid Stripe customer ID

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
```

## Support

For issues related to:
- **Stripe API:** Check [Stripe Documentation](https://stripe.com/docs)
- **Integration:** Check server logs and webhook events
- **Database:** Verify Prisma schema and migrations 