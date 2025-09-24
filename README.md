# BrowGen Web App

A responsive, production-ready learning and community platform for students and youth. Built as a monorepo with:

- Frontend: Next.js (TypeScript) + Tailwind CSS
- Backend: Node.js + Express + PostgreSQL (pg)
- Database: SQL schema and seed scripts
- Hosting: Render (render.yaml included for multi-service deploy)

## Repo Structure

```
BrowGen/
  frontend/            # Next.js + Tailwind app (TS)
  backend/             # Express API server (Node.js)
  database/            # SQL schema + seed
  render.yaml          # Render multi-service deployment config
```

## Quick Start (Local)

1) Backend
- Copy `backend/.env.example` to `backend/.env` and set values.
- Ensure PostgreSQL is running and `DATABASE_URL` is reachable.
- From `backend/`, install and run:

```
npm install
npm run migrate
npm run seed
npm run dev
```

API will start on `http://localhost:4000` by default.

2) Frontend
- Copy `frontend/.env.example` to `frontend/.env.local` and set `NEXT_PUBLIC_API_URL` to your backend URL.
- From `frontend/`, install and run:

```
npm install
npm run dev
```

Frontend will start on `http://localhost:3000`.

## Deploy on Render

- Push this repo to GitHub.
- Render will read `render.yaml` and provision:
  - A Web Service for `backend/`
  - A Web Service for `frontend/` (Next.js SSR)
  - A PostgreSQL instance (manually create in Render and link `DATABASE_URL` env var)

Follow inline comments in `render.yaml` and set environment variables in Render dashboard.

## Database

- Schemas defined in `database/schema.sql`
- Example seed data in `database/seed.sql`

## Authentication

- Email/password signup & login using bcrypt + JWT
- Password reset endpoints are scaffolded (no email provider wired). Add Email provider (e.g., Resend/SendGrid) later.

## API Overview

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me` (requires `Authorization: Bearer <token>`)
- `GET /api/courses` | `GET /api/courses/:id` | `GET /api/courses/:id/modules`
- `GET /api/mentors`
- `GET /api/blog` | `GET /api/testimonials`
- `GET /api/progress` | `POST /api/progress`

Each route includes comments and Zod validation where appropriate.

## Notes

- This is a starter scaffold with dummy data and structure to expand.
- All pages are responsive via Tailwind.
- The `dashboard` page demonstrates fetching protected data using a JWT stored in `localStorage`.
