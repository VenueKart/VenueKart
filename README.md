# 🏷️ VenueKart

> Discover, manage, and book venues with ease.

## 🧩 Description
VenueKart is a full‑stack platform for venue discovery and booking. Customers can explore venues, inquire with owners, and confirm bookings with secure payments. Venue owners can list venues, manage inquiries, track bookings, and monitor performance with dashboards. The project simplifies venue selection, reduces coordination friction, and provides an end‑to‑end booking experience.

## 🚀 Features
- 🔐 Authentication: Email OTP verification, password login, and Google OAuth 2.0
- 🧭 Discovery: Search, filter by location/type, and price/capacity ranges with pagination
- ⭐ Favorites: Save and manage favorite venues for quick access
- 📨 Inquiries: Email notifications to venue owners and admins on customer inquiries
- 📅 Bookings: Create bookings, owner approval flow, and status updates (pending/confirmed/cancelled)
- 💳 Payments: Razorpay order creation and server‑side signature verification
- 🖼️ Media: Cloudinary uploads (single/multiple) and secure delete by public ID
- 📊 Dashboard: Owner metrics (venues, bookings, revenue, recent activity)
- 🛡️ Security: JWT‑based auth with refresh token rotation and protected routes
- ⚡ Performance: Vite + React, Tailwind CSS, Radix UI components, and React Query
- 🔔 Notifications: Customer inquiry status updates and unread counts

## 🛠️ Tech Stack
- **Frontend**: React, Vite, React Router, Tailwind CSS, Radix UI, TanStack Query
- **Backend**: Node.js, Express, JWT, Nodemailer, Mongoose
- **Database**: MongoDB (MongoDB Atlas recommended)
- **APIs/Services**: Google OAuth 2.0, Razorpay, Cloudinary, SMTP (Nodemailer)
- **Hosting/CDN**: Frontend and Backend (AWS), Database (MongoDB Atlas)

## 📂 Folder Structure
```
.
├── client/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── accordion.jsx
│   │   │   ├── alert.jsx
│   │   │   ├── badge.jsx
│   │   │   ├── button.jsx
│   │   │   ├── calendar.jsx
│   │   │   ├── card.jsx
│   │   │   ├── input.jsx
│   │   │   ├── toaster.jsx
│   │   │   └── sonner.jsx
│   │   ├── AddVenueForm.jsx
│   │   ├── EditVenueForm.jsx
│   │   ├── ErrorDialog.jsx
│   │   ├── Footer.jsx
│   │   ├── Navigation.jsx
│   │   ├── RazorpayPayment.jsx
│   │   └── TokenExpiredNotice.jsx
│   ├── constants/venueOptions.js
│   ├── contexts/AuthContext.jsx
│   ├── hooks/useFavorites.js
│   ├── lib/
│   │   ├── apiClient.js
│   │   ├── errorMessages.js
│   │   ├── navigation.js
│   │   └── priceUtils.js
│   ├── pages/
│   │   ├── About.jsx
│   │   ├── AccountSettings.jsx
│   │   ├── AddVenue.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── Blog.jsx
│   │   ├── Careers.jsx
│   │   ├── Contact.jsx
│   │   ├── Developers.jsx
│   │   └── ... more pages
│   ├── public/
│   │   ├── privacy-policy.pdf
│   │   ├── robots.txt
│   │   └── terms-and-conditions.pdf
│   ├── App.jsx
│   ├── global.css
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Booking.js
│   │   ├── Favorite.js
│   │   ├── OtpVerification.js
│   │   ├── RefreshToken.js
│   │   ├── User.js
│   │   └── Venue.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── bookings.js
│   │   ├── demo.js
│   │   ├── favorites.js
│   │   ├── payments.js
│   │   ├── upload.js
│   │   └── venues.js
│   ├── services/
│   │   ├── cloudinaryService.js
│   │   └── emailService.js
│   ├── utils/
│   │   └── jwt.js
│   ├── dev-server.js
│   ├── index.js
│   ├── node-build.js
│   ├── package.json
│   └── vite.config.server.js
└── README.md
```

## ⚙️ Installation & Setup
Prerequisites: Node.js LTS, npm, MongoDB instance (Atlas recommended).

1) Clone repository
```
git clone <your-repo-url>
cd <your-repo-folder>
```

2) Local development (recommended single command)
```
cd client
npm install
npm run dev
```
- Launches Vite at http://localhost:5173 and the API at http://localhost:5001 via proxy.
- API requests from the frontend go to /api and are proxied to the server.

3) Alternative: start backend independently
```
cd server
npm install
npm run dev
# Server default: http://localhost:5000
```

4) Environment files
- Create server/.env and client/.env (see Environment Variables below) before running.
- Ensure MONGO_URI is reachable (whitelist your IP in Atlas).

5) Building for production
- Frontend only
```
cd client
npm run build:client
```
- Backend (server build only)
```
cd server
npm run build
npm start
```
- Full build from client (builds SPA and server bundle)
```
cd client
npm run build
```

6) Running tests
```
cd client && npm test
cd server && npm test
```

7) Formatting
```
cd client && npm run format.fix
cd server && npm run format.fix
```

Notes:
- For Google OAuth, configure authorized redirect URI: <backend>/api/auth/google/callback
- For Razorpay, use test keys during development; verify signature server‑side.
- For Cloudinary, provide base64 data URLs to /api/upload endpoints.

## 🌐 Deployment
- Frontend (Live): https://<your-frontend-domain>
- Backend (Live API): https://<your-backend-domain>

Guidelines:
- Set client VITE_BACKEND_URL to your backend URL for production cross‑origin calls.
- On the backend, set CORS_ALLOWED_ORIGINS, CLIENT_URL, and FRONTEND_URL to your deployed frontend origins.
- Use environment variables (never commit secrets). Configure MongoDB Atlas network access for your deploy target.

## 📘 API Endpoints
Base URL: /api

| Endpoint | Method | Description |
|---|---|---|
| /ping | GET | Health check |
| /demo | GET | Demo endpoint |
| /auth/register | POST | Register with OTP email flow |
| /auth/verify-otp | POST | Verify OTP and issue tokens |
| /auth/resend-otp | POST | Resend verification OTP |
| /auth/login | POST | Password login |
| /auth/refresh | POST | Refresh access token |
| /auth/logout | POST | Invalidate refresh token |
| /auth/me | GET | Get current user (JWT) |
| /auth/google | GET | Start Google OAuth 2.0 |
| /auth/google/callback | GET | OAuth callback (browser flow) |
| /venues/filter-options | GET | Filter facets (types, locations, ranges) |
| /venues | GET | List venues (search/filter/paginate) |
| /venues/:id | GET | Get venue by id |
| /venues/owner/my-venues | GET | Owner’s venues (JWT) |
| /venues | POST | Create venue (JWT) |
| /venues/:id | PUT | Update venue (JWT) |
| /venues/:id | DELETE | Delete venue (JWT) |
| /venues/owner/dashboard-stats | GET | Owner stats (JWT) |
| /bookings/owner | GET | Owner bookings (JWT) |
| /bookings/customer | GET | Customer bookings (JWT) |
| /bookings | POST | Create booking (JWT) |
| /bookings/:id/status | PUT | Update booking status (owner, JWT) |
| /bookings/owner/recent | GET | Recent bookings (JWT) |
| /bookings/owner/inquiry-count | GET | Pending inquiry count (JWT) |
| /bookings/owner/inquiries | GET | Pending inquiries (JWT) |
| /bookings/inquiry | POST | Send inquiry (JWT) |
| /bookings/customer/notifications | GET | Inquiry updates (JWT) |
| /bookings/customer/notification-count | GET | Unread updates count (JWT) |
| /favorites | GET | Get favorites (JWT) |
| /favorites/:venueId | POST | Add favorite (JWT) |
| /favorites/:venueId | DELETE | Remove favorite (JWT) |
| /favorites/check/:venueId | GET | Check if favorite (JWT) |
| /favorites/ids | GET | List favorite venue ids (JWT) |
| /upload/image | POST | Upload one image (JWT) |
| /upload/images | POST | Upload multiple images (JWT) |
| /upload/image/:publicId | DELETE | Delete image by public id (JWT) |
| /payments/create-order | POST | Create Razorpay order (JWT) |
| /payments/verify-payment | POST | Verify Razorpay signature (JWT) |
| /payments/status/:bookingId | GET | Payment status (JWT) |
| /payments/payment-failed | POST | Record failed payment (JWT) |

Usage notes:
- Authenticated endpoints require header: `Authorization: Bearer <accessToken>`
- On 401, the frontend refreshes the token via /auth/refresh using the stored refresh token.

## 🧾 Environment Variables
Create two .env files and fill all keys below.

server/.env
```
# App
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173

# Database
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority

# JWT
JWT_ACCESS_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<strong-random-secret>

# Google OAuth
GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret>

# Email (SMTP)
EMAIL_HOST=<smtp-host>
EMAIL_PORT=587
EMAIL_USER=<smtp-username>
EMAIL_PASS=<smtp-password>

# Cloudinary
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>

# Razorpay
RAZORPAY_KEY_ID=<razorpay-key-id>
RAZORPAY_KEY_SECRET=<razorpay-key-secret>
```

client/.env
```
# For production builds calling a different-origin backend
VITE_BACKEND_URL=https://<your-backend-domain>

# Optional: override dev API proxy target used by Vite
API_PORT=5001
```

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Install dependencies and run the app locally (see setup)
4. Follow existing patterns and styles; write tests when adding features
5. Commit: `git commit -m "feat: add your feature"`
6. Push: `git push origin feat/your-feature`
7. Open a Pull Request with a clear title, description, and context

## 📜 License
MIT License — include a LICENSE file or adapt to your preferred license.

## 💬 Contact / Credits
Developed with ❤️ by:
- Abhishek Kushwaha
- Anurag Yadav
- Deepti Rathore
- Sanchali Singh