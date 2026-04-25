# Chainew

Chainew is a full-stack news publishing platform built with Next.js App Router, TypeScript, Firestore, Firebase Authentication, and Cloudinary. It includes a public news site, an authenticated admin CMS, structured feeds, and optional NeuraFeed-based AI article ingestion.

## Overview

This project provides:

- A public editorial site with category, tag, latest, and trending views
- A role-aware admin dashboard for managing articles, users, sources, and review workflow
- Firebase Authentication using email/password only, with server-side session cookies for admin access
- Optional daily synchronization from NeuraFeed into published articles
- Automatic Discord notifications when articles are published

## Tech Stack

- Framework: Next.js 16 (App Router)
- Language: TypeScript
- Database: Cloud Firestore (Firebase Admin SDK on server)
- Auth: Firebase Authentication (email/password) + server session cookies
- Media: Cloudinary (signed direct uploads)
- UI: React 19 + Tailwind CSS 4

## Architecture

High-level flow:

1. Public and admin pages are rendered through the Next.js App Router.
2. Route handlers under src/app/api/** implement CRUD and integration endpoints.
3. Data access is centralized in src/lib/firestore.ts and backed by Firestore.
4. Firebase Admin is initialized in src/lib/firebaseAdmin.ts and Firebase client config is in src/lib/firebase.ts.
5. Firebase Auth handles email/password sign-in and the app exchanges the ID token for an HTTP-only session cookie.
6. Cloudinary is configured in src/lib/cloudinary.ts and uploads are performed through a signed direct upload flow using a reusable upload preset.
7. Optional Vercel Cron triggers NeuraFeed sync via POST /api/neurafeed/sync.

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
  lib/                 # Auth, Firestore, Firebase, integrations, helpers
  types/               # Shared TypeScript types
scripts/
  migrate-mongo-to-firestore.ts
firestore.rules
firestore.indexes.json
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Firebase project with Firestore enabled
- Cloudinary account

### Installation

```bash
npm install
```

### Local Development

```bash
npm run dev
```

Open http://localhost:3000.

### Production Build

```bash
npm run lint
npm run build
npm run start
```

## Environment Variables

Create .env.local in the project root:

```env
# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Firebase Client SDK (public)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef123456

# Firebase Admin SDK (server only)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloud-key
CLOUDINARY_API_SECRET=your-cloud-secret
CLOUDINARY_UPLOAD_PRESET=chainew_articles

# Optional integrations
DISCORD_WEBHOOK_URL=
CRON_SECRET=

# Required only for migration script source
MONGODB_URI=
```

Notes:

- Keep escaped newlines in FIREBASE_PRIVATE_KEY; runtime converts \n to real newlines.
- Create a signed Cloudinary upload preset and manage folder/format/transformation settings there.
- CRON_SECRET is required if you want secure automated calls to POST /api/neurafeed/sync.
- MONGODB_URI is only needed if you are running the one-time migration script.

## Auth Flow

The admin login flow uses Firebase Authentication email/password only:

1. The login page signs in against Firebase Auth.
2. The app exchanges the Firebase ID token for an HTTP-only session cookie at POST /api/auth/session.
3. Server routes and layouts read the session cookie via src/app/api/auth/session/route.ts.
4. Sign out clears the Firebase session cookie and signs out the local Firebase client.

## Firestore Security and Indexes

Rules and indexes are included:

- firestore.rules
- firestore.indexes.json

Deploy them with Firebase CLI:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## Available Scripts

- npm run dev: start local development server
- npm run build: create production build
- npm run start: run production server
- npm run lint: run ESLint
- npm run migrate:firestore: run MongoDB to Firestore migration
- npm run migrate:firestore:dry: run migration in dry-run mode

## API Overview

Core endpoints:

- GET /api/articles: list articles (supports page, limit, status, category, search, source)
- POST /api/articles: create article (authenticated)
- PUT /api/articles: update article and store revision (authenticated)
- GET /api/articles/[id]: get article by ID
- DELETE /api/articles/[id]: delete article (admin/editor)
- POST /api/articles/[id]/discord: send a published article to Discord
- GET|POST|PUT|DELETE /api/users: user management (admin-only)
- GET|POST|PUT|DELETE /api/sources: source management
- POST /api/upload/sign: create Cloudinary upload signature (authenticated)
- POST /api/upload: server-side Cloudinary upload fallback (authenticated)
- GET /api/images/[id]: legacy endpoint, returns 410 (retired)
- GET /api/neurafeed/latest: fetch latest NeuraFeed article (admin session)
- GET|POST /api/neurafeed/sync: check/sync latest NeuraFeed article (cron secret or admin session)
- POST /api/auth/session: exchange Firebase ID token for a session cookie
- GET /api/auth/session: read the active Firebase session
- POST /api/auth/logout: clear the Firebase session cookie

## SEO and Feeds

Public machine-readable endpoints:

- /feed/rss.xml
- /feed/atom.xml
- /feed/feed.json
- /sitemap.xml
- /news-sitemap.xml
- /robots.txt

## Deployment

Vercel is the primary deployment target.

1. Add all required environment variables in project settings.
2. Deploy the application.
3. Keep vercel.json cron enabled to trigger NeuraFeed sync at 0 2 * * * UTC.
4. Set CRON_SECRET to protect cron-triggered sync endpoint access.

## Security

- Do not commit .env files or secrets.
- Rotate leaked credentials immediately.
- Keep FIREBASE_PRIVATE_KEY, CLOUDINARY_API_SECRET, CRON_SECRET, and webhook URLs private.

## License

This project is licensed under the MIT License.
See LICENSE for details.

## Additional Documentation

- GUIDE.md: NeuraFeed API integration and payload format details
