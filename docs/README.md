# VenueKart

A comprehensive venue booking platform that simplifies event planning by connecting customers with verified venues through transparent pricing and seamless booking management.

## Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Search & Filters](#search--filters)
- [Payments (Razorpay)](#payments-razorpay)
- [Contact Form (Web3Forms)](#contact-form-web3forms)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## Overview
VenueKart is a full-stack React + Express application with MySQL, Cloudinary image storage, JWT auth, and a modern UI built with TailwindCSS and Radix UI.

## Key Features
- Smart discovery with filters by location, type, capacity, amenities, price
- Venue type categorization across create/edit/listing
- Detailed venue pages with galleries, facilities, and badges
- Booking workflow with status updates and email notifications
- Favorites, dashboards for customers and owners
- Secure JWT auth with refresh rotation and Google OAuth
- Responsive UI with animations and accessibility

## Technology Stack
- Frontend: React 18, React Router 6, Vite, TailwindCSS 3, Radix UI, Framer Motion
- Backend: Node.js, Express.js, MySQL, JWT, bcryptjs, Nodemailer, Cloudinary
- Tooling: TypeScript, Vitest, Prettier, Concurrently, dotenv

## Project Structure
```
client/
  components/
    ui/
    Navigation.jsx
    Footer.jsx
    AddVenueForm.jsx
    EditVenueForm.jsx
    RazorpayPayment.jsx
    TokenExpiredNotice.jsx
  pages/
    Index.jsx
    Venues.jsx
    VenueDetail.jsx
    Contact.jsx
    AdminDashboard.jsx
    UserDashboard.jsx
    SignIn.jsx
    SignUp.jsx
    VerifyOTP.jsx
  contexts/
  hooks/
  services/
  lib/
  constants/
  App.jsx
  global.css
server/
  config/
  routes/
  middleware/
  services/
  utils/
  index.js
  dev-server.js
  node-build.js
```

## Getting Started
1) Install dependencies
```
npm install
```
2) Create database and set environment variables (see below)
3) Start development
```
npm run dev
```
App runs at http://localhost:8080 (API proxied to Express).

## Environment Variables
```
# Database
DB_HOST=localhost
DB_USER=venuekart_user
DB_PASSWORD=secure_password
DB_NAME=venuekart

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
VENUEKART_ADMIN_EMAIL=admin@venuekart.com

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8080/api/auth/google/callback

# App
CLIENT_URL=http://localhost:8080
FRONTEND_URL=http://localhost:8080
COOKIE_SECRET=your_session_secret

# Payments (Razorpay)
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

## Available Scripts
```
# Development
npm run dev
npm run dev:client
npm run dev:server

# Production
npm run build
npm run build:client
npm run build:server
npm start

# Tests & formatting
npm test
npm run format.fix
```

## Search & Filters
- Venue listing uses dynamic filters for Type and Location from `/api/venues/filter-options`.
- Homepage hero search now mirrors filters using dropdown autocomplete for both fields.
- Independent fields navigate to `/venues` with `location` and/or `type` query params.

Files:
- client/pages/Venues.jsx
- client/components/ui/autocomplete-input.jsx
- client/pages/Index.jsx
- server/routes/venues.js (filter-options endpoint)

## Payments (Razorpay)
- Client: `client/components/RazorpayPayment.jsx`
- Server: `server/routes/payments.js`
- Env: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`

Flow:
1) Create order: POST `/api/payments/create-order` (auth required)
2) Open Razorpay Checkout with allowed methods (cards, UPI, netbanking)
3) Verify: POST `/api/payments/verify-payment`
4) Status: GET `/api/payments/status/:bookingId`

See docs/payment-gateway-config.md for detailed configuration and testing.

## Contact Form (Web3Forms)
- Contact page posts to Web3Forms API and shows live status.
- File: `client/pages/Contact.jsx`
- Endpoint: `https://api.web3forms.com/submit`

To change the access key, update the `access_key` value in the form submission.

## API Endpoints
- Auth: `/api/auth/*`
- Venues: `/api/venues`, `/api/venues/filter-options`, `/api/venues/:id`, `/api/venues/owner/*`
- Bookings: `/api/bookings/*`
- Favorites: `/api/favorites/*`
- Upload: `/api/upload/*`
- Payments: `/api/payments/*`

## Deployment
- Frontend: Netlify/Vercel (SPA)
- Backend: Railway/Heroku/DigitalOcean
- Database: PlanetScale/AWS RDS/Cloud SQL
- Images: Cloudinary CDN

Docker:
```
docker build -t venuekart .
docker run -p 8080:8080 venuekart
```

## Contributing
- Follow existing patterns and code style
- Add tests where appropriate
- Update docs when changing APIs or flows
- Ensure venue type and filters continue to work

## License
MIT

## Support
- Open an issue
- Check documentation.md
- For deployment/platform help, use project support channels
