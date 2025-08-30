# VenueKart Technical Documentation 📚

This document provides comprehensive technical documentation for the VenueKart venue booking platform, detailing the architecture, implementation, and functionality of every component in the system.

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Overview](#architecture-overview)
3. [Frontend Documentation](#frontend-documentation)
4. [Backend Documentation](#backend-documentation)
5. [Database Schema](#database-schema)
6. [API Documentation](#api-documentation)
7. [Authentication & Authorization](#authentication--authorization)
8. [File Upload & Image Management](#file-upload--image-management)
9. [Email System](#email-system)
10. [Venue Type System](#venue-type-system)
11. [Recent Bug Fixes](#recent-bug-fixes)
12. [Deployment & Configuration](#deployment--configuration)
13. [Development Guidelines](#development-guidelines)
14. [Payments](#payments)
15. [Contact Form](#contact-form)

---

## 📁 Project Overview

VenueKart is a full-stack venue booking platform built with React and Express.js, featuring a modern SPA frontend and a RESTful API backend with MySQL database integration. The platform supports comprehensive venue management with categorization, image galleries, booking workflows, and real-time notifications.

### Technology Stack Summary

**Frontend**: React 18, Vite, TailwindCSS, Radix UI, Framer Motion, React Router 6  
**Backend**: Node.js, Express.js, MySQL, JWT, Cloudinary, Nodemailer  
**Development**: TypeScript, Vitest, Prettier, Concurrently  
**Deployment**: Netlify (frontend), Railway/Heroku (backend), PlanetScale (database)

---

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   React SPA     │◄──►│  Express API    │◄──►│  MySQL Database │
│   (Port 8080)   │    │   (Port 5000)   │    │                 │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│  TailwindCSS    │    │   Cloudinary    │    │   Email SMTP    │
│  Radix UI       │    │   (Images)      │    │   (Nodemailer)  │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Request Flow
1. Client sends request from React SPA
2. Express validates auth (JWT), processes logic
3. MySQL handles persistence via pooled connections
4. External services (Cloudinary, SMTP, Razorpay) are invoked as needed
5. JSON response returned with consistent error handling

---

## 🎯 Frontend Documentation

### 📄 Application Entry Point — `client/App.jsx`
- React Router 6 routes, protected areas
- Global providers (Auth, QueryClient)
- Error boundaries & UI providers (toast, tooltip)

### 🌍 Global Styles — `client/global.css`
- Poppins & Inter fonts, HSL theme tokens
- Light/dark mode variables
- VenueKart brand palette (indigo, purple, lavender, dark)

### 📁 Pages (`client/pages/`)

#### `Index.jsx` — Homepage
- Hero section with background image and CTAs
- Hero search now uses dropdown autocomplete for both Location and Venue Type
  - Component: `AutocompleteInput`
  - Data source: `/api/venues/filter-options`
  - Navigates to `/venues` with `location` and/or `type`
- Popular Venues with favorites, graceful fallbacks
- How It Works section

#### `Venues.jsx` — Listing & Filters
- Dynamic filter options (type, location, price/capacity ranges)
- Server-side pagination; client range filtering
- Badges show venue type on cards
- Uses `venueService.getFilterOptions()` and `getVenues()`

#### `VenueDetail.jsx`
- Gallery, details, facilities, pricing, type, book CTA

#### `Contact.jsx`
- Integrated Web3Forms submission with status messages
- POST to `https://api.web3forms.com/submit` with access key

### 🧩 Components
- `components/ui/autocomplete-input.jsx`: keyboard-friendly autocomplete
- `components/RazorpayPayment.jsx`: Razorpay checkout orchestration
- `components/Navigation.jsx`, `components/Footer.jsx`, `components/ui/*`

### 🔧 Services
- `services/venueService.js`: venues API, filter-options, pagination

### 🗂️ Constants
- `constants/venueOptions.js`: VENUE_TYPES, areas

---

## ⚙️ Backend Documentation

### Entry — `server/index.js`
- CORS, JSON limits, sessions
- Routes: auth, venues, bookings, upload, favorites, payments
- Database bootstrap on start

### Config — `server/config/*`
- `database.js`: pooled MySQL, schema
- `updateVenuesTable.js`: adds `type` and backfills

### Routes — `server/routes/*`
- `venues.js`: filter-options, type-aware listings and CRUD
- `payments.js`: Razorpay order, verify, status, failure
- `auth.js`, `bookings.js`, `upload.js`, `favorites.js`

---

## 🗃️ Database Schema
- users, venues (with `type`), venue_images, venue_facilities
- bookings, favorites, refresh_tokens, otp_verifications
- Indexes on `type`, `location`, `status` and performance columns

---

## 📡 API Documentation
- Venues: `GET /api/venues`, `GET /api/venues/filter-options`, `GET /api/venues/:id`, CRUD
- Payments: `POST /api/payments/create-order`, `POST /api/payments/verify-payment`, `GET /api/payments/status/:bookingId`
- Auth, Bookings, Favorites, Upload

---

## 🔐 Authentication & Authorization
- Email/password + Google OAuth
- Access (15m) + Refresh (7d) JWTs
- Auto-refresh, secure logout, CORS protections

---

## 🖼️ File Upload & Image Management
- Cloudinary for CDN storage
- Multiple uploads; compression on client; secure server endpoints

---

## ✉️ Email System
- Nodemailer SMTP
- OTP verification, booking notifications, admin alerts

---

## 🏷️ Venue Type System
- `type` column in DB; index for filtering
- Forms and listings read/write venue types throughout

---

## 🐛 Recent Bug Fixes
- Homepage popular venues: fixed response handling (`data.venues || data`)
- Venue type system: added column, endpoints, UI, and badges
- Dynamic filter options: backend endpoint + client consumption
- Hero search autocomplete: mirrored filter behavior with dropdowns
- Contact form: Web3Forms integration with live status

---

## 🚢 Deployment & Configuration
- Frontend: Netlify/Vercel
- Backend: Railway/Heroku/DigitalOcean
- Database: PlanetScale/AWS RDS/Cloud SQL
- Images: Cloudinary
- Docker: `docker build -t venuekart . && docker run -p 8080:8080 venuekart`

---

## 🧑‍💻 Development Guidelines
- Follow existing patterns and code style
- Add tests for critical paths
- Update docs when API or flows change
- Validate venue type and filter behavior

---

## Payments

### Overview
Razorpay is integrated for secure payments after booking confirmation. Only Cards, UPI, and Net Banking are enabled; wallets/EMI/pay-later are disabled.

### Files
- Client: `client/components/RazorpayPayment.jsx`
- Server: `server/routes/payments.js`

### Environment
```
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

### Flow
1. Create order: `POST /api/payments/create-order` (auth)
2. Open Razorpay Checkout (methods restricted)
3. Verify: `POST /api/payments/verify-payment`
4. Status: `GET /api/payments/status/:bookingId`

### Testing
- Test Card: 4111 1111 1111 1111
- Test UPI: success@razorpay

---

## Contact Form

### Overview
The Contact page uses Web3Forms to handle form submissions with real-time status feedback.

### File
- `client/pages/Contact.jsx`

### Endpoint
- `https://api.web3forms.com/submit`

### Notes
- Access key is sent via `FormData` as `access_key`
- On success: shows confirmation and resets form
- On error: shows message from Web3Forms response
