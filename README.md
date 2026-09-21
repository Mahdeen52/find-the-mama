# Find The Mama (ফাইন্ড দা মামা)

A mobile-first, bilingual community platform for discovering and supporting fuchkawalas across 10 zones of Dhaka. Built with Next.js 14, TypeScript, Tailwind CSS, React Query, React Hook Form, Zod, Leaflet/OpenStreetMap, PostgreSQL, Prisma, JWT cookie sessions and Cloudinary-ready uploads.

Live site: [find-the-mama.vercel.app](https://find-the-mama.vercel.app)

## Features

- Location-first map and list discovery with search, filters, sorting and nearby results
- 40 seeded Dhaka fuchka stalls across 10 areas with fuchka-stall-only photography
- Fuchka Club featured as Gulshan's highest-rated listing
- Vendor details, galleries, varied weekly hours, calling, directions and sharing
- Mock OTP login using `1234` and secure HttpOnly JWT sessions
- Five-step vendor contribution flow with map picker, hours, price, photos and final review
- Ratings for taste, hygiene and value, photo uploads and community reports
- Points, badges, contribution statistics, progress and recent activity profiles
- Live “I'm on my way” presence using durable events and polling
- Bangla and English interface
- Admin statistics and vendor management

## Requirements

- Node.js 20+
- pnpm 11+
- PostgreSQL 15+ or Neon

## Local setup

```bash
pnpm install
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Set `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `JWT_SECRET` and `NEXT_PUBLIC_SITE_URL` in `.env.local`, then run:

```bash
pnpm prisma migrate deploy
pnpm prisma db seed
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Use any valid Bangladeshi mobile number with demo OTP `1234`.

## Team database access

The shared Neon project has two long-lived branches:

- `main` is the production database used by the deployed site.
- `development` is the team development database. It was created from `main` with the current data and schema and does not auto-delete.

After accepting the Neon project invitation, select the `development` branch in the Neon Console and open **Connect**. Copy the pooled connection string into `DATABASE_URL`, then disable connection pooling and copy the direct connection string into `DIRECT_URL` in your local `.env.local`:

```env
DATABASE_URL="postgresql://...-pooler..."
DIRECT_URL="postgresql://..."
JWT_SECRET="use-a-separate-local-development-secret"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

Then start the project:

```bash
pnpm install
pnpm prisma generate
pnpm dev
```

Use `pnpm db:migrate` only while connected to the `development` branch when creating a schema migration. Commit the generated files under `prisma/migrations/`; production applies committed migrations with `pnpm db:deploy`. Do not commit `.env`, `.env.local`, `.neon`, database URLs, passwords, or API keys. The development branch already contains demo data, so do not run the seed command unless the team intentionally wants to refresh that data.

## Validation

```bash
pnpm typecheck
pnpm build
```

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Pooled PostgreSQL URL used by the application |
| `DATABASE_URL_UNPOOLED` | Yes | Direct PostgreSQL URL used by Prisma migrations |
| `JWT_SECRET` | Yes | Long random secret used to sign sessions |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical site URL |
| `CLOUDINARY_CLOUD_NAME` | Optional | Cloudinary cloud name for persistent uploads |
| `CLOUDINARY_API_KEY` | Optional | Server-only Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Optional | Server-only Cloudinary secret |

Without Cloudinary, development uploads under 1 MB use a data-URL fallback. Configure Cloudinary for a production upload workflow.

## Database and deployment

The Prisma schema and migration are in `prisma/`. The seed is idempotent and can be rerun to refresh demo listings without deleting community users or contributions.

For deployment:

1. Create or connect a Neon Postgres database.
2. Add the pooled URL as `DATABASE_URL` and direct URL as `DIRECT_URL`.
3. Add the environment variables to Vercel.
4. Run `pnpm prisma migrate deploy` and `pnpm prisma db seed` from a trusted environment.
5. Import the GitHub repository into Vercel and deploy it as a Next.js project.

The map uses OpenStreetMap tiles and requires no map token.

## API conventions

Endpoints return either `{ "success": true, "data": ... }` or `{ "success": false, "error": "..." }`. Protected mutations validate the signed session server-side, and request payloads are validated with Zod.

## Architecture notes

The MVP uses indexed latitude and longitude columns with Haversine distance calculations. See [docs/POSTGIS.md](docs/POSTGIS.md) for a future PostGIS migration path.

“I'm on my way” uses a durable database event plus polling so it works in a serverless Vercel deployment without a long-running Socket.io process.
