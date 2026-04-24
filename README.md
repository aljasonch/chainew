# Chainew

Chainew is a full-stack news publishing platform built with Next.js App Router, MongoDB, and NextAuth. It includes a public news site, an authenticated admin CMS, structured feeds (RSS/Atom/JSON), and optional NeuraFeed-based AI article ingestion.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Overview](#api-overview)
- [SEO and Feeds](#seo-and-feeds)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)
- [Additional Documentation](#additional-documentation)

## Overview

This project provides:

- A public editorial site with category, tag, latest, and trending views
- A role-aware admin dashboard for managing articles, users, sources, and review workflow
- Credential-based authentication using NextAuth JWT sessions
- Optional daily synchronization from NeuraFeed into published articles
- Automatic Discord notifications when articles are published

## Features

- Public pages: home, article details, latest, trending, categories, tags, about, contact
- Admin pages: dashboard, articles, users, sources, review queue, revisions, NeuraFeed sync panel
- Article workflow statuses: `draft`, `review`, `published`
- Revision logging for article updates
- Built-in media upload and image serving API
- Structured feed outputs: RSS, Atom, and JSON Feed
- SEO endpoints: `sitemap.xml`, `news-sitemap.xml`, `robots.txt`

## Tech Stack

- Framework: Next.js 16 (App Router)
- Language: TypeScript
- Database: MongoDB via Mongoose
- Auth: NextAuth (credentials provider + JWT strategy)
- UI: React 19 + Tailwind CSS 4
- Validation and utilities: Zod, date-fns, clsx, tailwind-merge

## Architecture

High-level flow:

1. Public and admin pages are rendered through the Next.js App Router.
2. Route Handlers under `src/app/api/**` implement CRUD and integration endpoints.
3. Data is stored in MongoDB using Mongoose models (`Article`, `User`, `Source`, `Revision`, `Image`, `View`).
4. NextAuth credentials sessions protect admin routes.
5. Optional Vercel Cron triggers NeuraFeed sync via `POST /api/neurafeed/sync`.

## Project Structure

```text
src/
	app/
		(public)/          # Public-facing pages
		admin/             # CMS/admin pages
		api/               # Route handlers
		feed/              # RSS/Atom/JSON feed routes
		sitemap.xml/       # Sitemap route
		news-sitemap.xml/  # Google News sitemap route
		robots.txt/        # Robots route
	components/          # Reusable UI and feature components
	lib/                 # Auth, DB, integrations, helpers
	models/              # Mongoose schemas/models
	types/               # Shared TypeScript types
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- MongoDB instance (local or managed)

### Installation

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

Open `http://localhost:3000`.

### Build for Production

```bash
npm run build
npm run start
```

## Environment Variables

Create `.env.local` in the project root.

```env
# Required
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>
NEXTAUTH_SECRET=replace-with-a-long-random-secret

# Recommended
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional integrations
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
CRON_SECRET=replace-with-shared-secret-for-cron
```

Notes:

- `NEXT_PUBLIC_SITE_URL` is used for canonical links, sitemaps, and feeds.
- `CRON_SECRET` is required if you want secure automated calls to `POST /api/neurafeed/sync`.
- `VERCEL_URL` is automatically provided by Vercel and used as a fallback in server utilities.

## Available Scripts

- `npm run dev`: start local development server
- `npm run build`: create production build
- `npm run start`: run production server
- `npm run lint`: run ESLint
- `npm run seed`: execute `npx tsx src/lib/seed.ts` (ensure this file exists before using)

## API Overview

Core endpoints:

- `GET /api/articles`: list articles (supports `page`, `limit`, `status`, `category`, `search`, `source`)
- `POST /api/articles`: create article (authenticated)
- `PUT /api/articles`: update article and store revision (authenticated)
- `GET /api/articles/[id]`: get article by ID
- `DELETE /api/articles/[id]`: delete article (admin/editor)
- `POST /api/articles/[id]/discord`: send a published article to Discord
- `GET|POST|PUT|DELETE /api/users`: user management (admin-only)
- `GET|POST|PUT|DELETE /api/sources`: source management
- `POST /api/upload`: upload image (authenticated)
- `GET /api/images/[id]`: serve uploaded image by ID
- `GET /api/neurafeed/latest`: fetch latest NeuraFeed article (admin session)
- `GET|POST /api/neurafeed/sync`: check/sync latest NeuraFeed article (cron secret or admin session)
- `GET|POST /api/auth/[...nextauth]`: NextAuth handlers

## SEO and Feeds

Public machine-readable endpoints:

- `/feed/rss.xml`
- `/feed/atom.xml`
- `/feed/feed.json`
- `/sitemap.xml`
- `/news-sitemap.xml`
- `/robots.txt`

## Deployment

Vercel is the primary deployment target.

1. Add all required environment variables in project settings.
2. Deploy the application.
3. Keep `vercel.json` cron enabled to trigger NeuraFeed sync at `0 2 * * *` UTC.
4. Set `CRON_SECRET` to protect cron-triggered sync endpoint access.

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Run lint and verify local behavior.
4. Open a pull request with clear context and test notes.

Recommended before opening a PR:

- Run `npm run lint`
- Confirm core flows: login, article create/update, publish, and public article rendering

## Security

- Do not commit `.env*` files or secrets.
- Rotate leaked credentials immediately.
- Keep `NEXTAUTH_SECRET`, `CRON_SECRET`, and webhook URLs private.

## License

This project is licensed under the MIT License.
See [LICENSE](LICENSE) for details.

## Additional Documentation

- `GUIDE.md`: NeuraFeed API integration and payload format details
