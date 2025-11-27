## AntBid - Bidding Marketplace (Next.js)

AntBid is a simple responsive bidding marketplace built with **Next.js (App Router)**.  
Users can **sign up / login**, **add products**, and **bid on other products**.  
The **highest bid is always shown on top** for each product.

### Tech stack

- **Frontend**: Next.js 14 (App Router), React 18
- **Backend APIs**: Next.js Route Handlers under `app/api`
- **Database**: Prisma + SQLite
- **Auth**: Custom email/password with JWT in HTTP-only cookie

### Features

- **User auth**: signup, login, logout (JWT stored in cookie)
- **Products**:
  - List all products with highest bid displayed
  - Add new product (title, description, starting bid, optional image URL)
- **Bidding**:
  - Place bids on products (must be higher than current highest / starting bid)
  - Bids list for a product ordered by highest first

### Getting started

1. **Install dependencies**

   ```bash
   cd /Users/sachin/AntBid
   npm install
   ```

2. **Environment variables**

   Create a `.env` file in the project root:

   ```bash
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="a-strong-secret-change-me"
   ```

3. **Set up the database**

   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`.

### Main API endpoints

- **Auth**
  - `POST /api/auth/signup` – `{ name, email, password }`
  - `POST /api/auth/login` – `{ email, password }`
  - `POST /api/auth/logout`
- **Products**
  - `GET /api/products` – list all products + highest bids
  - `POST /api/products` – create product (auth required)
- **Bids**
  - `GET /api/products/:id/bids` – list bids for a product (highest first)
  - `POST /api/products/:id/bids` – place a bid (auth required)

### Main pages

- `/` – marketing-style landing
- `/auth` – login / signup
- `/products` – all products
- `/products/new` – add product
- `/products/[id]` – product details + bidding UI

### Deployment (Vercel)

1. **Database Setup**: For production, you need a PostgreSQL database (SQLite won't work on Vercel).
   - Use services like [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres), [Supabase](https://supabase.com), or [Neon](https://neon.tech)
   - Update `prisma/schema.prisma` to use `provider = "postgresql"` instead of `"sqlite"`
   - Run migrations: `npx prisma migrate deploy`

2. **Environment Variables** (set in Vercel dashboard):
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `JWT_SECRET` - A strong random secret for JWT signing

3. **Build**: The `postinstall` script automatically runs `prisma generate` during deployment.


