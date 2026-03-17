# Quizio

A self-hosted Kahoot-style quiz game platform with admin dashboard.

## Features

- **Real-time multiplayer quiz game** — players join via PIN code
- **Admin dashboard** — create/edit/import/export quizzes, manage admin accounts
- **Media support** — image, video, audio per question (via Cloudflare R2)
- **Live game monitoring** — manager sees who answered in real-time during a game
- **Post-game reports** — full history with per-player, per-question breakdown + CSV export
- **Multi-admin accounts** — unlimited admin users with JWT auth

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, shadcn/ui, Zustand, Socket.IO client
- **Backend**: Node.js, Express, Socket.IO, MongoDB (Mongoose), Cloudflare R2
- **Deploy**: Vercel (frontend) + Fly.io (backend)

## Getting Started

### Prerequisites

- Node.js 22+
- PNPM
- MongoDB Atlas account (free M0 tier)
- Cloudflare R2 bucket (optional, for media uploads)

### Local Development

1. Install dependencies:

```bash
pnpm install
```

2. Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

3. Seed the first admin account:

```bash
pnpm --filter socket tsx src/scripts/seed.ts
# Creates: admin / changeme — change password after first login
```

4. Start development servers:

```bash
pnpm dev
```

- Frontend: http://localhost:3000
- Backend API + Socket: http://localhost:3001

## Environment Variables

See `.env.example` for all required variables:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `CORS_ORIGIN` | Frontend URL (production) |
| `R2_ACCOUNT_ID` | Cloudflare R2 account ID |
| `R2_ACCESS_KEY_ID` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 secret key |
| `R2_BUCKET_NAME` | R2 bucket name |
| `R2_PUBLIC_URL` | Public URL for R2 files |

## Deployment

### Backend → Fly.io

```bash
fly launch
fly secrets set MONGODB_URI="..." JWT_SECRET="..."
fly deploy
```

### Frontend → Vercel

Push to GitHub, import in Vercel, set environment variables:

```
VITE_API_URL=https://<your-app>.fly.dev
VITE_WS_URL=https://<your-app>.fly.dev
```

## Usage

- **Player**: Go to `/` → enter PIN code → enter username → play
- **Manager**: Go to `/manager` → login with admin credentials → select quiz → start game
- **Admin dashboard**: Go to `/admin` → login → manage quizzes, users, view game history
