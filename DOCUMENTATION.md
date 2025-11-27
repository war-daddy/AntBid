# AntBid - Complete Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Backend Documentation](#backend-documentation)
6. [Frontend Documentation](#frontend-documentation)
7. [Database Schema](#database-schema)
8. [Authentication System](#authentication-system)
9. [API Reference](#api-reference)
10. [Setup & Installation](#setup--installation)
11. [Development Guide](#development-guide)

---

## Overview

**AntBid** is a modern bidding marketplace application built with Next.js 14 (App Router). It allows users to:
- Create accounts and authenticate securely
- List products for auction with starting bids
- Place bids on products (must be higher than current highest bid)
- View all products with real-time highest bid information
- Track bidding history for each product

The application follows a full-stack architecture with server-side rendering, API routes, and a SQLite database managed through Prisma ORM.

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Browser                        │
│  (React Components, Next.js Pages, Client-side State)   │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTP Requests
                     │
┌────────────────────▼────────────────────────────────────┐
│              Next.js Application Server                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Server Components (SSR)                   │  │
│  │  - Layout, Home Page, Product Detail Pages       │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │         API Route Handlers                       │  │
│  │  - /api/auth/* (signup, login, logout)          │  │
│  │  - /api/products (GET, POST)                     │  │
│  │  - /api/products/[id]/bids (GET, POST)           │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Library Functions                        │  │
│  │  - auth.ts (JWT, bcrypt, cookie management)     │  │
│  │  - prisma.ts (Database client)                  │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Prisma ORM
                     │
┌────────────────────▼────────────────────────────────────┐
│                  SQLite Database                         │
│  - Users, Products, Bids tables                         │
└─────────────────────────────────────────────────────────┘
```

### Request Flow

1. **Page Request**: User navigates to a route → Next.js Server Component renders → Fetches data from Prisma → Returns HTML
2. **API Request**: Client makes fetch request → API Route Handler → Validates auth (if needed) → Queries/Updates database → Returns JSON
3. **Authentication**: Login/Signup → JWT token generated → Stored in HTTP-only cookie → Subsequent requests include cookie → Server validates token

---

## Tech Stack

### Frontend
- **Next.js 14.2.3** - React framework with App Router
- **React 18.3.1** - UI library
- **TypeScript 5.6.2** - Type safety
- **Tailwind CSS 3.4.18** - Utility-first CSS framework

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma 5.20.0** - ORM for database management
- **SQLite** - Database (via Prisma)

### Authentication & Security
- **JWT (jsonwebtoken 9.0.2)** - Token-based authentication
- **bcryptjs 2.4.3** - Password hashing
- **HTTP-only Cookies** - Secure token storage

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

---

## Project Structure

```
AntBid/
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   ├── dev.db                 # SQLite database file
│   └── migrations/            # Database migration files
│
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── api/               # API route handlers
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── logout/route.ts
│   │   │   │   └── signup/route.ts
│   │   │   └── products/
│   │   │       ├── route.ts
│   │   │       └── [id]/bids/route.ts
│   │   ├── auth/page.tsx      # Login/Signup page
│   │   ├── products/
│   │   │   ├── page.tsx       # Products listing page
│   │   │   ├── new/page.tsx   # Create product page
│   │   │   └── [id]/
│   │   │       ├── page.tsx   # Product detail page (server)
│   │   │       └── product-bid-client.tsx  # Bidding UI (client)
│   │   ├── layout.tsx         # Root layout with header/footer
│   │   ├── page.tsx           # Home/landing page
│   │   └── globals.css        # Global styles & Tailwind config
│   │
│   ├── components/
│   │   └── LogoutButton.tsx   # Logout button component
│   │
│   └── lib/
│       ├── auth.ts            # Authentication utilities
│       └── prisma.ts          # Prisma client singleton
│
├── package.json
├── next.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── README.md
```

---

## Backend Documentation

### Core Libraries

#### `src/lib/prisma.ts`

**Purpose**: Provides a singleton Prisma client instance to prevent multiple database connections in development.

**Key Features**:
- Uses global variable to reuse client in development
- Logs errors and warnings
- Prevents connection pool exhaustion

**Code Structure**:
```typescript
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn']
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

---

#### `src/lib/auth.ts`

**Purpose**: Handles all authentication-related operations including user registration, login, logout, and token management.

**Key Functions**:

1. **`registerUser(name, email, password)`**
   - Validates email uniqueness
   - Hashes password with bcrypt (10 rounds)
   - Creates user in database
   - Returns user data (without password)

2. **`loginUser(email, password)`**
   - Validates credentials
   - Compares password hash
   - Generates JWT token (7-day expiration)
   - Sets HTTP-only cookie with token
   - Returns user data

3. **`logoutUser()`**
   - Deletes authentication cookie

4. **`getCurrentUserFromCookie()`**
   - Extracts JWT from cookie
   - Verifies token signature
   - Returns decoded payload or null

5. **`getCurrentUser()`**
   - Gets user from cookie
   - Fetches full user data from database
   - Returns user object or null

**Security Features**:
- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens signed with secret key
- HTTP-only cookies prevent XSS attacks
- Secure flag enabled in production
- SameSite: 'lax' prevents CSRF attacks

**Environment Variables**:
- `JWT_SECRET` - Secret key for signing JWT tokens (required)

---

### API Routes

#### Authentication Endpoints

##### `POST /api/auth/signup`

**Purpose**: Register a new user account.

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response** (Success - 200):
```json
{
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Response** (Error - 400):
```json
{
  "error": "Email already in use"
}
```

**Implementation**: `src/app/api/auth/signup/route.ts`

---

##### `POST /api/auth/login`

**Purpose**: Authenticate user and create session.

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response** (Success - 200):
```json
{
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Response** (Error - 400):
```json
{
  "error": "Invalid credentials"
}
```

**Cookies Set**:
- `antbid_token` - HTTP-only JWT token (7-day expiration)

**Implementation**: `src/app/api/auth/login/route.ts`

---

##### `POST /api/auth/logout`

**Purpose**: End user session.

**Request Body**: None

**Response** (Success - 200):
```json
{
  "success": true
}
```

**Cookies Deleted**:
- `antbid_token` - Removed from client

**Implementation**: `src/app/api/auth/logout/route.ts`

---

#### Product Endpoints

##### `GET /api/products`

**Purpose**: Retrieve all products with their highest bids.

**Authentication**: Not required

**Response** (Success - 200):
```json
{
  "products": [
    {
      "id": 1,
      "title": "Vintage Camera",
      "description": "A beautiful vintage camera",
      "startingBid": 100.00,
      "imageUrl": "https://example.com/image.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "owner": {
        "id": 1,
        "name": "John Doe"
      },
      "highestBid": {
        "id": 5,
        "amount": 150.00,
        "user": {
          "id": 2,
          "name": "Jane Smith"
        }
      }
    }
  ]
}
```

**Notes**:
- Products ordered by creation date (newest first)
- Each product includes highest bid (if exists)
- If no bids, `highestBid` is `null`

**Implementation**: `src/app/api/products/route.ts`

---

##### `POST /api/products`

**Purpose**: Create a new product listing.

**Authentication**: Required (JWT token in cookie)

**Request Body**:
```json
{
  "title": "Vintage Camera",
  "description": "A beautiful vintage camera in excellent condition",
  "startingBid": 100.00,
  "imageUrl": "https://example.com/image.jpg"  // Optional
}
```

**Response** (Success - 201):
```json
{
  "product": {
    "id": 1,
    "title": "Vintage Camera",
    "description": "A beautiful vintage camera in excellent condition",
    "startingBid": 100.00,
    "imageUrl": "https://example.com/image.jpg",
    "ownerId": 1,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response** (Error - 401):
```json
{
  "error": "Unauthorized"
}
```

**Response** (Error - 400):
```json
{
  "error": "Missing fields"
}
```

**Validation**:
- `title` - Required, string
- `description` - Required, string
- `startingBid` - Required, number
- `imageUrl` - Optional, string

**Implementation**: `src/app/api/products/route.ts`

---

#### Bid Endpoints

##### `GET /api/products/[id]/bids`

**Purpose**: Retrieve all bids for a specific product, ordered by highest first.

**Authentication**: Not required

**URL Parameters**:
- `id` - Product ID (number)

**Response** (Success - 200):
```json
{
  "bids": [
    {
      "id": 5,
      "amount": 150.00,
      "user": {
        "id": 2,
        "name": "Jane Smith"
      }
    },
    {
      "id": 4,
      "amount": 120.00,
      "user": {
        "id": 3,
        "name": "Bob Johnson"
      }
    }
  ]
}
```

**Response** (Error - 400):
```json
{
  "error": "Invalid product id"
}
```

**Notes**:
- Bids ordered by amount (descending)
- Includes bidder information

**Implementation**: `src/app/api/products/[id]/bids/route.ts`

---

##### `POST /api/products/[id]/bids`

**Purpose**: Place a bid on a product.

**Authentication**: Required (JWT token in cookie)

**URL Parameters**:
- `id` - Product ID (number)

**Request Body**:
```json
{
  "amount": 150.00
}
```

**Response** (Success - 201):
```json
{
  "bid": {
    "id": 5,
    "amount": 150.00,
    "userId": 2,
    "productId": 1,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response** (Error - 401):
```json
{
  "error": "Unauthorized"
}
```

**Response** (Error - 400):
```json
{
  "error": "Bid must be higher than current highest (100.00)"
}
```

**Validation Rules**:
- `amount` must be a positive number
- `amount` must be higher than current highest bid (or starting bid if no bids)
- Product must exist

**Implementation**: `src/app/api/products/[id]/bids/route.ts`

---

## Frontend Documentation

### Pages

#### Root Layout (`src/app/layout.tsx`)

**Type**: Server Component

**Purpose**: Provides the root HTML structure, global navigation, and authentication-aware header.

**Features**:
- Fetches current user on server-side
- Displays user name and logout button if authenticated
- Shows login/signup link if not authenticated
- Consistent header/footer across all pages
- Dark theme styling

**Key Elements**:
- Header with navigation links (Home, Products)
- User status indicator (green dot + name)
- Logout button (if authenticated)
- Footer with copyright

---

#### Home Page (`src/app/page.tsx`)

**Type**: Server Component

**Purpose**: Landing page with product preview and marketing content.

**Features**:
- Fetches top 6 products (newest first)
- Shows highest bid for each product
- Displays bid count
- Responsive grid layout
- Call-to-action buttons

**Data Fetched**:
- Products with owner info
- Highest bid for each product
- Total bid count per product

**UI Sections**:
1. Hero section with title and description
2. Feature cards (List products, Real-time ranking, Simple flows)
3. Live bidding preview sidebar

---

#### Authentication Page (`src/app/auth/page.tsx`)

**Type**: Client Component

**Purpose**: Unified login and signup interface.

**Features**:
- Toggle between login and signup modes
- Form validation
- Error handling
- Loading states
- Redirects to `/products` on success

**Form Fields**:
- **Signup**: Name, Email, Password (min 6 chars)
- **Login**: Email, Password

**API Calls**:
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Authenticate

**State Management**:
- `mode` - 'login' | 'signup'
- `loading` - Request in progress
- `error` - Error message display

---

#### Products Listing Page (`src/app/products/page.tsx`)

**Type**: Client Component

**Purpose**: Display all available products in a grid layout.

**Features**:
- Fetches products on mount
- Shows starting bid and highest bid
- Clickable cards linking to product details
- "Add product" button
- Loading and error states
- Empty state message

**API Calls**:
- `GET /api/products` - Fetch all products

**UI Layout**:
- Responsive grid (1 col mobile, 2 cols tablet, 3 cols desktop)
- Product cards with:
  - Title and description
  - Starting bid
  - Highest bid (or "No bids yet")
  - Hover effects

---

#### New Product Page (`src/app/products/new/page.tsx`)

**Type**: Client Component

**Purpose**: Form to create a new product listing.

**Features**:
- Form validation
- Error handling
- Loading states
- Redirects to product detail page on success
- Requires authentication (enforced by API)

**Form Fields**:
- Title (required)
- Description (required)
- Starting bid (required, number, min 0)
- Image URL (optional)

**API Calls**:
- `POST /api/products` - Create product

**Validation**:
- All required fields must be filled
- Starting bid must be a valid number
- Shows error if not authenticated

---

#### Product Detail Page (`src/app/products/[id]/page.tsx`)

**Type**: Server Component

**Purpose**: Server-side rendering of product information.

**Features**:
- Fetches product data on server
- Includes owner and highest bid information
- Passes data to client component for interactivity
- Handles invalid product IDs

**Data Fetched**:
- Product details
- Owner information
- Highest bid (if exists)

**Rendering**:
- Delegates UI to `BiddingClient` component
- Handles 404 case

---

#### Product Bidding Client (`src/app/products/[id]/product-bid-client.tsx`)

**Type**: Client Component

**Purpose**: Interactive bidding interface for a product.

**Features**:
- Displays product information
- Shows current highest bid
- Bid placement form
- Real-time bid list (fetched on mount and after bid)
- Bid validation (must be higher than current)
- Error handling

**API Calls**:
- `GET /api/products/[id]/bids` - Fetch all bids
- `POST /api/products/[id]/bids` - Place new bid

**State Management**:
- `bids` - Array of bid objects
- `amount` - Current bid input value
- `loading` - Request in progress
- `error` - Error message

**UI Layout**:
- Product card with title, description, starting/highest bid
- Two-column layout:
  - Left: Bid placement form
  - Right: Bids list (highest first)

---

### Components

#### Logout Button (`src/components/LogoutButton.tsx`)

**Type**: Client Component

**Purpose**: Reusable logout button with loading state.

**Features**:
- Calls logout API
- Redirects to home page on success
- Refreshes router to update auth state
- Loading state during request
- Error handling

**API Calls**:
- `POST /api/auth/logout` - End session

**Styling**:
- Matches header button style
- Disabled state during loading

---

### Styling

#### Global Styles (`src/app/globals.css`)

**Purpose**: Global CSS with Tailwind configuration and custom component classes.

**Custom Classes**:

1. **`.card`**
   - Rounded corners, border, shadow
   - Gradient background overlay
   - Used for content containers

2. **`.btn-primary`**
   - Gradient button (indigo → cyan → pink)
   - Hover effects (lift, shadow)
   - Active state (press down)
   - Disabled state

3. **`.input`**
   - Form input styling
   - Dark theme
   - Focus states with indigo ring
   - Placeholder styling

4. **`.input--error`**
   - Error state for inputs
   - Red border and focus ring

5. **`.chip`**
   - Small badge/tag component
   - Rounded, bordered

**Theme**:
- Dark background (slate-950)
- Gradient accents (indigo, cyan, pink)
- System font stack
- Responsive design

---

## Database Schema

### Prisma Schema (`prisma/schema.prisma`)

**Database**: SQLite

**Models**:

#### User
```prisma
model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  password  String
  name      String
  createdAt DateTime  @default(now())
  products  Product[]
  bids      Bid[]
}
```

**Fields**:
- `id` - Primary key, auto-increment
- `email` - Unique identifier for login
- `password` - Hashed password (bcrypt)
- `name` - Display name
- `createdAt` - Account creation timestamp
- `products` - One-to-many relation to Product
- `bids` - One-to-many relation to Bid

---

#### Product
```prisma
model Product {
  id          Int       @id @default(autoincrement())
  title       String
  description String
  startingBid Float
  imageUrl    String?
  owner       User      @relation(fields: [ownerId], references: [id])
  ownerId     Int
  bids        Bid[]
  createdAt   DateTime  @default(now())
}
```

**Fields**:
- `id` - Primary key, auto-increment
- `title` - Product name
- `description` - Product details
- `startingBid` - Minimum bid amount
- `imageUrl` - Optional image URL
- `ownerId` - Foreign key to User
- `owner` - Many-to-one relation to User
- `bids` - One-to-many relation to Bid
- `createdAt` - Listing creation timestamp

---

#### Bid
```prisma
model Bid {
  id        Int      @id @default(autoincrement())
  amount    Float
  user      User     @relation(fields: [userId], references: [id])
  userId    Int
  product   Product  @relation(fields: [productId], references: [id])
  productId Int
  createdAt DateTime @default(now())
}
```

**Fields**:
- `id` - Primary key, auto-increment
- `amount` - Bid amount (must be > current highest)
- `userId` - Foreign key to User (bidder)
- `user` - Many-to-one relation to User
- `productId` - Foreign key to Product
- `product` - Many-to-one relation to Product
- `createdAt` - Bid timestamp

**Relations**:
- User → Product (one-to-many)
- User → Bid (one-to-many)
- Product → Bid (one-to-many)

---

## Authentication System

### Flow Diagram

```
┌─────────────┐
│   Signup    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│ Validate email unique   │
│ Hash password (bcrypt)   │
│ Create user in DB        │
└─────────────────────────┘

┌─────────────┐
│   Login     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│ Find user by email      │
│ Compare password hash   │
│ Generate JWT token      │
│ Set HTTP-only cookie    │
└─────────────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Subsequent Requests     │
│ Extract token from cookie│
│ Verify JWT signature    │
│ Get user from DB        │
└─────────────────────────┘
```

### Token Structure

**JWT Payload**:
```json
{
  "userId": 1,
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1235173890
}
```

**Cookie Settings**:
- Name: `antbid_token`
- HTTP-only: Yes (prevents XSS)
- Secure: Yes (in production, HTTPS only)
- SameSite: 'lax' (prevents CSRF)
- Path: '/'
- Max-Age: 7 days

### Security Considerations

1. **Password Hashing**: bcrypt with 10 salt rounds
2. **Token Storage**: HTTP-only cookies (not localStorage)
3. **Token Expiration**: 7 days
4. **CSRF Protection**: SameSite cookie attribute
5. **XSS Protection**: HTTP-only flag prevents JavaScript access
6. **Secret Key**: Must be strong and kept secret (environment variable)

---

## API Reference

### Base URL
- Development: `http://localhost:3000`
- Production: (configure in deployment)

### Authentication

All authenticated endpoints require a valid JWT token in the `antbid_token` cookie.

### Response Format

**Success Response**:
```json
{
  "data": { ... }
}
```

**Error Response**:
```json
{
  "error": "Error message"
}
```

### Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `404` - Not Found

### Endpoints Summary

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/signup` | No | Register new user |
| POST | `/api/auth/login` | No | Authenticate user |
| POST | `/api/auth/logout` | No | End session |
| GET | `/api/products` | No | List all products |
| POST | `/api/products` | Yes | Create product |
| GET | `/api/products/[id]/bids` | No | List bids for product |
| POST | `/api/products/[id]/bids` | Yes | Place bid |

---

## Setup & Installation

### Prerequisites

- Node.js 18+ and npm
- Git (optional)

### Step-by-Step Setup

1. **Clone or navigate to project directory**
   ```bash
   cd /Users/sachin/AntBid
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   Create `.env` in project root:
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   JWT_SECRET="your-super-secret-key-change-this-in-production"
   ```

4. **Set up database**
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   ```
   Or manually:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open browser**
   Navigate to `http://localhost:3000`

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | SQLite database path | Yes | - |
| `JWT_SECRET` | Secret for signing JWT tokens | Yes | - |
| `NODE_ENV` | Environment (development/production) | No | `development` |

### Production Deployment

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET` (generate with: `openssl rand -base64 32`)
3. Consider using PostgreSQL instead of SQLite
4. Update `DATABASE_URL` to production database
5. Run migrations: `npx prisma migrate deploy`
6. Build: `npm run build`
7. Start: `npm start`

---

## Development Guide

### Available Scripts

```bash
# Development
npm run dev          # Start dev server (port 3000)

# Production
npm run build        # Build for production
npm start            # Start production server

# Database
npm run prisma:migrate    # Run migrations
npm run prisma:generate   # Generate Prisma client

# Code Quality
npm run lint         # Run ESLint
```

### Database Management

**View database**:
```bash
npx prisma studio
```

**Create migration**:
```bash
npx prisma migrate dev --name migration_name
```

**Reset database** (⚠️ deletes all data):
```bash
npx prisma migrate reset
```

### Code Structure Guidelines

1. **Server Components**: Use for data fetching, SEO, initial render
2. **Client Components**: Use for interactivity, state, browser APIs
3. **API Routes**: Keep thin, delegate business logic to lib functions
4. **Type Safety**: Use TypeScript interfaces for all data structures
5. **Error Handling**: Always handle errors in API routes and client components

### Adding New Features

1. **New API Endpoint**:
   - Create route file in `src/app/api/`
   - Export async functions (GET, POST, etc.)
   - Use `getCurrentUserFromCookie()` for auth
   - Return `NextResponse.json()`

2. **New Page**:
   - Create page file in `src/app/`
   - Use Server Component if possible
   - Add 'use client' if needed for interactivity

3. **New Database Model**:
   - Update `prisma/schema.prisma`
   - Run `npx prisma migrate dev --name add_model`
   - Generate client: `npx prisma generate`

### Testing Considerations

- Test authentication flows (login, signup, logout)
- Test bid validation (must be higher than current)
- Test product creation (requires auth)
- Test error handling (invalid IDs, missing fields)
- Test responsive design (mobile, tablet, desktop)

---

## Troubleshooting

### Common Issues

1. **Database connection error**
   - Check `DATABASE_URL` in `.env`
   - Ensure `prisma/dev.db` exists
   - Run `npx prisma generate`

2. **Authentication not working**
   - Check `JWT_SECRET` is set
   - Verify cookie is being set (check browser DevTools)
   - Check token expiration

3. **Build errors**
   - Run `npx prisma generate`
   - Clear `.next` folder: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

4. **Type errors**
   - Run `npx prisma generate` after schema changes
   - Restart TypeScript server in IDE

---

## Future Enhancements

Potential improvements for the application:

1. **Real-time Updates**: WebSocket integration for live bid updates
2. **Bid History**: User dashboard showing all bids placed
3. **Product Management**: Edit/delete products (owner only)
4. **Search & Filters**: Search products, filter by category
5. **Image Upload**: Direct image upload instead of URL
6. **Email Notifications**: Notify when outbid
7. **Auction End Times**: Time-based auction closing
8. **Payment Integration**: Stripe/PayPal for actual transactions
9. **User Profiles**: Public profiles with bid history
10. **Admin Panel**: Admin dashboard for moderation

---

## License

This project is private and proprietary.

---

## Support

For issues or questions, refer to the codebase or contact the development team.

---

**Last Updated**: 2024
**Version**: 1.0.0

