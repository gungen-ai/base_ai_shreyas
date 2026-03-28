# SignalWave Admin Portal

## Overview

Admin portal for SignalWave customer support, powered by base_ai.

---

## Tech Stack

- **Next.js** — framework
- **TypeScript** — language
- **Drizzle ORM** — database queries and migrations
- **Supabase (Postgres)** — database
- **Clerk** — authentication
- **Tailwind CSS** — styling

---

## Accounts You Need to Create

### Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once the project is ready, go to **Project Settings → Database → Connection string → URI**
3. Copy the URI and replace `[YOUR-PASSWORD]` with your database password
4. This is your `DATABASE_URL`

### Clerk

1. Go to [clerk.com](https://clerk.com) and create a new application
2. Go to **API Keys** in the sidebar
3. Copy the **Publishable key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
4. Copy the **Secret key** → `CLERK_SECRET_KEY`

---

## Setup Steps

```bash
# 1. Clone the repo
git clone <repo-url>
cd base_ai_shreyas

# 2. Install dependencies
pnpm install

# 3. Configure environment variables
cp .env.local.example .env.local
# Fill in all values in .env.local

# 4. Create the database tables
pnpm drizzle-kit push

# 5. Start the dev server
pnpm dev
```

The app will be running at `http://localhost:3000`.

---

## Connecting to n8n

- **Base URL:** your Vercel deployment URL (e.g. `https://your-app.vercel.app`)
- **Create a ticket** by sending a POST request to `/api/tickets`:

```json
POST /api/tickets
Content-Type: application/json

{
  "merchantId": "<your-merchant-id>",
  "rawQuery": "Where is my order?",
  "channel": "widget",
  "customerIdentifier": "customer@example.com"
}
```

- `merchantId` can be found in your Supabase dashboard under the `merchants` table — it will be populated after you first log in to the admin portal
- This route is public and does not require authentication, so n8n can call it directly

---

## Deploying to Vercel

1. Push the repo to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. In the Vercel project settings, go to **Environment Variables** and add all four values from your `.env.local`:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_APP_URL` (set this to your Vercel deployment URL)
4. Deploy
