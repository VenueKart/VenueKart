# VenueKart

A comprehensive venue booking platform that simplifies event planning by connecting customers with verified venues through transparent pricing and seamless booking management.

VenueKart is a full-stack React application with an integrated Express server, featuring JWT authentication, MySQL database, Cloudinary integration, email notifications, and a modern responsive UI built with TailwindCSS and Radix UI.

## Tech Stack

- **Frontend**: React 18 + React Router 6 (SPA) + Vite + TailwindCSS 3 + Radix UI
- **Backend**: Express.js + Node.js with MySQL database
- **Authentication**: JWT tokens with refresh token rotation
- **Database**: MySQL with connection pooling and automatic migrations
- **Image Storage**: Cloudinary integration for venue photos
- **Email**: Nodemailer with SMTP for notifications
- **UI**: Radix UI components + TailwindCSS 3 + Lucide React icons
- **State Management**: React Context + React Query for server state
- **Forms**: React Hook Form with validation
- **Animations**: Framer Motion for smooth interactions

## Project Structure

```
client/                          # React SPA frontend
├── pages/                       # Route components
│   ├── Index.jsx               # Homepage with hero and search (FIXED: data.map error)
│   ├── Venues.jsx              # Venue listing with type-based filtering (ENHANCED)
│   ├── VenueDetail.jsx         # Individual venue page with type display
│   ├── AdminDashboard.jsx      # Venue owner dashboard
│   ├── UserDashboard.jsx       # Customer dashboard
│   ├── SignIn.jsx              # Authentication
│   ├── SignUp.jsx              # Registration with OTP
│   ├── VerifyOTP.jsx           # Email verification
│   └── [other pages...]        # About, Contact, FAQ, etc.
├── components/                  # Reusable React components
│   ├── ui/                     # Base UI component library
│   │   ├── badge.jsx           # Venue type badges (ENHANCED)
│   │   ├── autocomplete-input.jsx # Venue type selection (NEW)
│   │   └── [other ui components]
│   ├── Navigation.jsx          # Site navigation
│   ├── Footer.jsx              # Site footer
│   ├── AddVenueForm.jsx        # Venue creation form with type selection (ENHANCED)
│   ├── EditVenueForm.jsx       # Venue editing form with type updates (ENHANCED)
│   └── TokenExpiredNotice.jsx  # Session management
├── contexts/                    # React Context providers
│   └── AuthContext.jsx         # Authentication state
├── hooks/                       # Custom React hooks
│   └── useFavorites.js         # Favorites management
├── services/                    # API service layers
│   ├── authService.js          # Authentication APIs
│   ├── venueService.js         # Venue management APIs (ENHANCED with type support)
│   └── notificationService.js  # Real-time notifications
├── lib/                        # Utility libraries
│   ├── apiClient.js            # HTTP client with auto-refresh
│   ├── utils.js                # General utilities
│   ├── navigation.js           # Navigation helpers
│   ├── priceUtils.js           # Price formatting utilities
│   └── errorMessages.js        # Error handling
├── constants/                   # Application constants
│   └── venueOptions.js         # Venue types and location options (ENHANCED)
├── App.jsx                     # Main app with routing
└── global.css                  # TailwindCSS theme and VenueKart branding

server/                         # Express API backend
├── config/                     # Configuration files
│   ├── database.js             # MySQL setup and schema
│   ├── updateBookingsTable.js  # Booking table migrations
│   └── updateVenuesTable.js    # Venue type column migration (NEW)
├── routes/                     # API route handlers
│   ├── auth.js                 # Authentication endpoints
│   ├── venues.js               # Venue CRUD with type support (ENHANCED)
│   ├── bookings.js             # Booking management
│   ├── upload.js               # Cloudinary image upload
│   ├── favorites.js            # Favorites management
│   └── demo.js                 # Health check endpoints
├── middleware/                 # Express middleware
│   └── auth.js                 # JWT authentication middleware
├── services/                   # Business logic services
│   ├── emailService.js         # Email notifications
│   └── cloudinaryService.js   # Image management
├── utils/                      # Server utilities
│   └── jwt.js                  # JWT token utilities
├── index.js                    # Main server setup
├── dev-server.js               # Development server
└── node-build.js               # Production build

shared/                         # Shared utilities (future)
└── [shared types/constants]    # Cross-platform code
```

## Key Features

### For Customers
- **Smart Venue Discovery**: Search and filter venues by location, venue type, capacity, amenities, and price
- **Venue Type Filtering**: Filter by specific venue categories (Banquet halls, Farmhouses, Hotels & resorts, etc.)
- **Detailed Venue Pages**: Photo galleries, facility lists, pricing, venue type badges, and owner contact
- **Booking System**: Submit inquiries with event details and special requirements
- **Favorites Management**: Save and organize preferred venues
- **User Dashboard**: Track booking history and inquiry status
- **Real-time Notifications**: Email updates on booking status changes

### For Venue Owners
- **Venue Management**: Complete CRUD operations for venue listings with type categorization
- **Venue Type Selection**: Choose appropriate category during venue creation and editing
- **Image Gallery**: Multiple photo upload with Cloudinary integration
- **Booking Dashboard**: Manage inquiries and update booking status
- **Revenue Analytics**: Track bookings, revenue, and performance metrics
- **Real-time Alerts**: Email notifications for new inquiries
- **Profile Management**: Business information and contact details

### Platform Features
- **Authentication System**: Email/password + Google OAuth integration
- **Email Verification**: OTP-based registration and password reset
- **Secure API**: JWT tokens with automatic refresh
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Image Optimization**: Cloudinary CDN with auto-optimization
- **Database Management**: MySQL with automated schema initialization and migrations
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Venue Categorization**: Smart venue type system with database-driven options

## SPA Routing System

The routing system is powered by React Router 6:

- `client/pages/Index.jsx` represents the homepage
- Routes are defined in `client/App.jsx` using `react-router-dom`
- Route files are located in the `client/pages/` directory

```javascript
import { BrowserRouter, Routes, Route } from "react-router-dom";

<Routes>
  <Route path="/" element={<Layout><Index /></Layout>} />
  <Route path="/venues" element={<Layout><Venues /></Layout>} />
  <Route path="/venue/:id" element={<Layout><VenueDetail /></Layout>} />
  <Route path="/signin" element={<AuthLayout><SignIn /></AuthLayout>} />
  <Route path="/admin" element={<AdminDashboard />} />
  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
  <Route path="*" element={<Layout><NotFound /></Layout>} />
</Routes>
```

### Layout Components
- **Layout**: Standard layout with Navigation + Footer for public pages
- **AuthLayout**: Minimal layout for authentication pages
- **No Layout**: Direct component rendering for admin dashboard

## Styling System

- **Primary**: TailwindCSS 3 utility classes with custom VenueKart theme
- **Theme**: Custom color palette with CSS variables in `client/global.css`
- **UI Components**: Radix UI primitives with custom styling
- **Utility**: `cn()` function combines `clsx` + `tailwind-merge`

```javascript
// VenueKart theme colors
:root {
  --primary: 244 62% 32%;     /* venue-indigo #3C3B6E */
  --accent: 246 100% 69%;     /* venue-purple #6C63FF */
  --secondary: 246 100% 95%;  /* venue-lavender #E6E6FA */
}

// Usage example
className={cn(
  "bg-venue-indigo text-white",
  { "hover:bg-venue-purple": isInteractive },
  props.className
)}
```

## Express Server Integration

- **Development**: Single port (8080) for frontend, Express on port 5000
- **Production**: Express serves built React SPA
- **Hot reload**: Both client and server code during development
- **API endpoints**: All prefixed with `/api/`
- **Database**: MySQL connection with automatic table creation and migrations

### Core API Routes

#### Authentication (`/api/auth`)
- `POST /register` - User registration with email verification
- `POST /verify-otp` - Complete email verification
- `POST /login` - Email/password authentication
- `GET /google` - Google OAuth initiation
- `GET /google/callback` - OAuth callback handling
- `GET /me` - Get current authenticated user
- `POST /refresh` - Refresh access token
- `POST /logout` - Invalidate refresh token

#### Venues (`/api/venues`) - ENHANCED
- `GET /` - List venues with filtering and pagination (supports venue type filtering)
- `GET /filter-options` - Get available venue types and locations from database (NEW)
- `GET /:id` - Get venue details with images, facilities, and type
- `POST /` - Create venue with type selection (venue owners only) (ENHANCED)
- `PUT /:id` - Update venue including type (venue owners only) (ENHANCED)
- `DELETE /:id` - Delete venue (venue owners only)
- `GET /owner/my-venues` - Get owner's venues with types

#### Bookings (`/api/bookings`)
- `POST /` - Create booking inquiry
- `GET /owner` - Get bookings for venue owner
- `GET /customer` - Get bookings for customer
- `PUT /:id/status` - Update booking status (owner only)

#### File Upload (`/api/upload`)
- `POST /image` - Upload single image to Cloudinary
- `POST /images` - Upload multiple images (max 10)
- `DELETE /image/:publicId` - Delete image from Cloudinary

#### Favorites (`/api/favorites`)
- `GET /` - List user's favorite venues
- `POST /:venueId` - Add venue to favorites
- `DELETE /:venueId` - Remove venue from favorites

## Database Integration

### MySQL Schema (Enhanced)
The application uses MySQL with automatic table creation and migrations:

- **users**: User accounts with authentication data
- **venues**: Venue listings with owner relationships and venue types (ENHANCED)
- **venue_images**: Photo galleries for venues
- **venue_facilities**: Amenity lists for venues
- **bookings**: Booking inquiries and status tracking
- **favorites**: User-venue favorite relationships
- **refresh_tokens**: JWT refresh token management
- **otp_verifications**: Email verification codes

### Enhanced Venues Table Schema
```sql
CREATE TABLE venues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(100) DEFAULT 'Venue', -- ADDED: Venue type column
  location VARCHAR(255) NOT NULL,
  capacity INT NOT NULL,
  price_per_day DECIMAL(10,2) NOT NULL,
  price_min DECIMAL(10,2),
  price_max DECIMAL(10,2),
  status ENUM('active', 'inactive') DEFAULT 'active',
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_bookings INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_owner (owner_id),
  INDEX idx_location (location),
  INDEX idx_type (type), -- ADDED: Index for venue type filtering
  INDEX idx_status (status)
);
```

### Connection Management
```javascript
// Database connection with pooling
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
});
```

## Authentication & Security

### JWT Token System
- **Access Tokens**: 15-minute expiry for API requests
- **Refresh Tokens**: 7-day expiry stored in database
- **Auto-refresh**: Client automatically renews expired tokens
- **Secure Storage**: Tokens stored in localStorage with proper cleanup

### Security Features
- **Password Hashing**: bcrypt with salt rounds 12
- **Input Validation**: SQL injection prevention
- **CORS Protection**: Configured for specific origins
- **Token Revocation**: Database-stored refresh tokens
- **Session Management**: Automatic token cleanup on logout

## Development Commands

```bash
# Development
npm run dev              # Start dev server (client + server)
npm run dev:client       # Start only client development server
npm run dev:server       # Start only server development server

# Production
npm run build            # Build for production
npm run build:client     # Build only client
npm run build:server     # Build only server
npm start               # Start production server

# Testing & Quality
npm test                # Run tests
npm run format.fix      # Format code with Prettier
```

## Recent Bug Fixes and Enhancements

### 1. Homepage Data Loading Fix (CRITICAL)
**Issue**: `TypeError: data.map is not a function` on homepage when loading popular venues.
**Root Cause**: API response structure mismatch - endpoint returns `{venues: [...], pagination: {...}}` but code expected direct array.
**Fix**: Updated `client/pages/Index.jsx` to properly extract venues array from API response.

```javascript
// Before (Broken)
const data = await apiCall('/api/venues?limit=3');
const formattedVenues = data.map(venue => { ... });

// After (Fixed)
const data = await apiCall('/api/venues?limit=3');
const venues = data.venues || data; // Extract venues array
const formattedVenues = venues.map(venue => { ... });
```

### 2. Venue Type System Implementation (MAJOR ENHANCEMENT)
**Feature**: Complete venue type categorization system allowing customers to filter venues by type and owners to categorize their venues.

**Backend Changes**:
- Added `type` column to venues table via migration script
- Enhanced venue creation/update routes to save venue types
- Added `/api/venues/filter-options` endpoint for dynamic filter options
- Implemented venue type inference for existing venues

**Frontend Changes**:
- Enhanced `AddVenueForm.jsx` with venue type selection dropdown
- Enhanced `EditVenueForm.jsx` with venue type editing capability
- Updated `Venues.jsx` with venue type filtering
- Added venue type badges to venue cards
- Dynamic filter options loading from backend

**Files Modified**:
- `server/routes/venues.js` - Added venue type support to all CRUD operations
- `server/config/updateVenuesTable.js` - Database migration for venue type column
- `client/components/AddVenueForm.jsx` - Added venue type selection
- `client/components/EditVenueForm.jsx` - Added venue type editing
- `client/pages/Venues.jsx` - Enhanced filtering with venue types
- `client/constants/venueOptions.js` - Updated venue type constants

### 3. Badge System Enhancement
**Feature**: Venue cards now display actual venue types instead of generic "Venue" text.
**Implementation**: Badges pull venue type from database and display categories like "Banquet halls", "Farmhouses", "Hotels & resorts", etc.

### 4. Dynamic Filter Options
**Feature**: Filter dropdowns now populate from actual database content instead of static arrays.
**Implementation**: New endpoint `/api/venues/filter-options` returns unique venue types and locations from uploaded venues.

### 5. Hero Search Autocomplete (Homepage)
**Feature**: Homepage hero search now uses dropdown autocomplete for Location and Venue Type, mirroring filter behavior.
**Implementation**: Leveraged `AutocompleteInput` with options from `/api/venues/filter-options`; independent fields navigate to `/venues` with `location` and/or `type` query params.
**Files Modified**: `client/pages/Index.jsx`

### 6. Contact Form via Web3Forms
**Feature**: Contact page now submits via Web3Forms with success/error states.
**Implementation**: Integrated POST to `https://api.web3forms.com/submit` with provided access key; shows live status and resets on success.
**Files Modified**: `client/pages/Contact.jsx`

## Venue Type Categories

The platform supports the following venue types:

```javascript
export const VENUE_TYPES = [
  'Banquet halls',
  'Hotels & resorts', 
  'Lawns/gardens',
  'Farmhouses',
  'Restaurants & cafes',
  'Lounges & rooftops',
  'Stadiums & arenas',
  'Open grounds',
  'Auditoriums'
];
```

### Venue Type Usage

**In Forms**:
- AutocompleteInput component for type-ahead search
- Optional field in AddVenueForm
- Editable field in EditVenueForm

**In Filtering**:
- Dynamic dropdown in venue listing page
- Backend API supports type-based filtering
- URL parameter sync for shareable filtered URLs

**In Display**:
- Badges on venue cards showing venue type
- Venue detail pages display type information
- Admin dashboard shows venue types in listings

## Adding Features

### Add New Venue Type or Amenity

Update `client/constants/venueOptions.js`:
```javascript
export const VENUE_TYPES = [
  'Banquet halls',
  'Hotels & resorts',
  'Lawns/gardens',
  'Farmhouses',
  'Your New Type'  // Add here
];

export const facilities = [
  'Air Conditioning',
  'Parking',
  'Catering',
  'Your New Facility'  // Add here
];
```

The venue type will automatically appear in:
- Venue creation form dropdown
- Venue editing form dropdown
- Venue listing filter dropdown
- Database filter options endpoint

### Add New API Route

1. Create route handler in `server/routes/your-route.js`:
```javascript
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/your-endpoint', authenticateToken, async (req, res) => {
  try {
    // Your logic here
    res.json({ message: 'Success' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

2. Register route in `server/index.js`:
```javascript
import yourRoutes from './routes/your-route.js';

// In createServer function:
app.use('/api/your-route', yourRoutes);
```

### Add New Page Route

1. Create component in `client/pages/YourPage.jsx`:
```javascript
export default function YourPage() {
  return (
    <div>
      <h1>Your New Page</h1>
    </div>
  );
}
```

2. Add route in `client/App.jsx`:
```javascript
import YourPage from './pages/YourPage';

// Add to Routes:
<Route path="/your-page" element={<Layout><YourPage /></Layout>} />
```

### Add Email Template

Update `server/services/emailService.js`:
```javascript
export const sendYourEmail = async (recipientEmail, data) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: 'Your Subject',
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h1>Your Email Content</h1>
        <p>Dynamic data: ${data.message}</p>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
};
```

## Environment Configuration

### Required Environment Variables

```bash
# Database
DB_HOST=localhost
DB_USER=venuekart_user
DB_PASSWORD=secure_password
DB_NAME=venuekart

# JWT Authentication
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
VENUEKART_ADMIN_EMAIL=admin@venuekart.com

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8080/api/auth/google/callback

# Application
CLIENT_URL=http://localhost:8080
FRONTEND_URL=http://localhost:8080
COOKIE_SECRET=your_session_secret
```

## Production Deployment

### Standard Deployment
```bash
# Build application
npm run build

# Start production server
npm start
```

### Docker Deployment
```bash
# Build Docker image
docker build -t venuekart .

# Run container
docker run -p 8080:8080 venuekart
```

### Environment-Specific Deployment
- **Frontend**: Netlify, Vercel (SPA build)
- **Backend**: Railway, Heroku, DigitalOcean
- **Database**: PlanetScale, AWS RDS, Google Cloud SQL
- **Images**: Cloudinary (already integrated)

## Architecture Notes

### Development Architecture
- **Single-port development**: Vite dev server proxies API requests
- **Hot reload**: Both client and server code reload automatically
- **Database initialization**: Tables created automatically on server start
- **Database migrations**: Automatic schema updates via migration scripts
- **Error boundaries**: Comprehensive error handling throughout the app

### Production Architecture
- **SPA serving**: Express serves built React application
- **API routing**: Express handles all `/api/*` routes
- **Static assets**: Built client files served from `/dist/spa/`
- **Database pooling**: MySQL connection pool for optimal performance

### Security Architecture
- **JWT authentication**: Stateless token-based auth with refresh rotation
- **Input sanitization**: SQL injection and XSS prevention
- **CORS protection**: Configured for specific frontend origins
- **Environment isolation**: Sensitive data in environment variables

### Scalability Considerations
- **Database indexing**: Optimized queries with proper indexes including venue type
- **Image CDN**: Cloudinary for global image delivery
- **Connection pooling**: Efficient database connection management
- **Caching strategies**: Future implementation for improved performance
- **API pagination**: Efficient data loading for large datasets

## Testing Guidelines

When testing the application, pay special attention to:

1. **Venue Type Functionality**:
   - Venue creation with type selection
   - Venue editing with type updates
   - Venue type filtering in listings
   - Badge display on venue cards

2. **Data Loading**:
   - Homepage popular venues loading
   - Venue listing with pagination
   - Filter options loading from database

3. **Image Management**:
   - Multiple image upload during venue creation
   - Image compression and Cloudinary integration
   - Image display in galleries and cards

4. **Authentication Flow**:
   - Registration with email verification
   - Login with JWT token management
   - Google OAuth integration
   - Token refresh and session management

5. **Booking Workflow**:
   - Inquiry submission
   - Email notifications
   - Status updates
   - Owner dashboard management

This architecture supports a full-featured venue booking platform with comprehensive venue categorization, robust error handling, and room for growth as business requirements evolve.
