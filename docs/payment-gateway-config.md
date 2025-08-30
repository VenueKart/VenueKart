# Payment Gateway Configuration

## Overview
VenueKart integrates Razorpay for secure online payments. Allowed methods: Cards, UPI, and Net Banking. Wallets/EMI/Pay Later are disabled by design.

## Files & Responsibilities
- Client: `client/components/RazorpayPayment.jsx` — loads checkout, configures allowed methods, triggers verify
- Server: `server/routes/payments.js` — creates orders, verifies signatures, tracks status

## Environment Variables
Set in server environment:
```
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

## Checkout Configuration (client)
Allowed methods are explicitly set:
```js
method: {
  netbanking: true,
  card: true,
  upi: true,
  wallet: false,
  emi: false,
  paylater: false
}
```
Blocks and ordering are customized via `config.display` to group Net Banking separately from Cards/UPI.

## API Flow (server)
1) Create order (auth): `POST /api/payments/create-order`
- Validates booking ownership and status
- Creates Razorpay order and stores `razorpay_order_id`

2) Verify payment (auth): `POST /api/payments/verify-payment`
- Verifies HMAC signature with `RAZORPAY_KEY_SECRET`
- Updates booking `payment_status` to `completed`

3) Payment status (auth): `GET /api/payments/status/:bookingId`
- Returns current payment status and identifiers

4) Record failures (auth): `POST /api/payments/payment-failed`
- Stores error description when checkout fails or is cancelled

## Testing
- Test Card: 4111 1111 1111 1111
- Test UPI: success@razorpay
- Use Razorpay test mode credentials

## Security
- HMAC signature verification server-side
- Booking ownership checks on all endpoints
- PCI DSS compliant processing via Razorpay

## Troubleshooting
- 503 "Payment gateway not configured": set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
- Order already exists: a previous order was made for this booking; verify or create new booking
- Script load failure: ensure `https://checkout.razorpay.com/v1/checkout.js` can load and no CSP blocks it
