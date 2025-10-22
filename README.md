# TraderPro

TraderPro is a minimal crypto trader marketplace skeleton built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and Supabase. It includes authenticated flows for traders and clients, strict RLS policies, RESTful APIs, and a simple UI to explore traders, request bookings, and review trader dashboards.

## Features
- Email/password authentication backed by Supabase Auth
- Profiles with role-based behaviour (`trader` or `client`)
- Public trader directory and detailed trader profile pages with booking requests
- Client area to review personal bookings
- Trader dashboard highlighting revenue, minutes, subscribers, and latest feedback
- REST endpoints for booking creation and dashboard aggregation
- Supabase SQL migrations, RLS policies, and seed utilities for demo content

## Project structure
```
src/
  app/              # Next.js App Router routes (pages + API)
  components/       # Reusable UI components
  lib/              # Supabase clients, validation, and shared types
  styles/           # Global styles consumed by Tailwind
supabase/           # SQL schema, policies, and optional seed data
scripts/            # Service-role seed helper
```

## Prerequisites
- Node.js 18+
- Supabase project (hosted)
- pnpm (recommended) or npm/yarn

## Getting started
1. **Copy env template**
   ```bash
   cp .env.example .env
   ```
   Fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - Optionally `SEED_TRADER_ONE_ID`, `SEED_TRADER_TWO_ID`, `SEED_CLIENT_ONE_ID` for the seed script

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Apply database schema & RLS**
   - In the Supabase SQL editor (or CLI), run `supabase/schema.sql` followed by `supabase/policies.sql`.
   - (Optional) Run `supabase/seed.sql` after replacing the placeholder UUIDs with real `auth.users` IDs.

4. **Create demo users (optional)**
   - Supabase Admin API cannot be used client-side. Create two trader users and one client via the Supabase dashboard or CLI (`supabase auth signups create ...`).
   - Copy the resulting user IDs into `.env` (`SEED_*` variables).
   - Execute the script to populate demo data:
     ```bash
     pnpm seed
     ```

5. **Start the app**
   ```bash
   pnpm dev
   ```
   The site will be available at http://localhost:3000.

## REST endpoints
- `POST /api/bookings` – Authenticated clients create a new booking. Returns `{ id, status, estimated_cost }`.
- `GET /api/trader/:id/dashboard` – Authenticated traders fetch aggregated metrics and latest feedback (uses service-role key internally).
- `GET /api/auth/user` – Returns the current session user and profile metadata.

## RLS overview
- **Profiles** – Users can read/update their own row; public reads allowed when `is_public = true`.
- **Traders** – Public read is limited to traders with public profiles. Traders manage their own records.
- **Bookings** – Clients insert + read their own bookings. Traders can see and manage bookings addressed to them.
- **Subscribers** – Everyone can read counts; users manage their subscriptions.
- **Feedback** – Visible to associated trader/client and anyone when the trader profile is public. Clients can submit feedback only for their completed bookings.

## Testing RLS locally
1. Run `pnpm dev` and sign in as a client to ensure bookings only list your data.
2. Sign in as a trader to verify dashboard metrics and booking visibility.
3. Toggle `profiles.is_public` to `false` in Supabase and confirm the trader disappears from the public directory and feedback becomes hidden from unauthenticated users.

## Supabase notes
- All timestamps are stored as UTC (`timestamptz`). The UI formats using `Intl.DateTimeFormat`, respecting the viewer’s locale.
- Service role access is restricted to server-side route handlers (`/api/trader/[id]/dashboard`) and the optional seed script.

## TODO / Next steps
- Add payment integration for booking deposits
- Build scheduling & calendar integrations
- Introduce admin tooling and moderation dashboards

## License
MIT
