# Deployment Guide

## Prerequisites

- **Node.js** v20+
- **pnpm** v9+ (`npm install -g pnpm`)
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier works)
- **Cloudflare R2** account (for media uploads — optional for local dev without media)

---

## Local Development

### 1. Clone and install

```bash
git clone https://github.com/your-username/quizio.git
cd quizio
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/quizio
JWT_SECRET=any-random-string-for-local-dev
CORS_ORIGIN=http://localhost:3000
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=quizio-media
R2_PUBLIC_URL=
WS_PORT=3001
```

> Leave R2 fields empty if you don't need media uploads locally. The upload endpoint will fail but the rest of the app works fine.

### 3. Seed the database

Run once to create the initial admin user (`admin` / `changeme`):

```bash
MONGODB_URI=mongodb://localhost:27017/quizio pnpm --filter socket exec tsx src/scripts/seed.ts
```

Or if you've already set up `.env`:

```bash
dotenv -e .env -- pnpm --filter socket exec tsx src/scripts/seed.ts
```

### 4. Start development servers

```bash
pnpm dev
```

This runs both the socket server (port `3001`) and the Vite dev server (port `3000`) in parallel. The `.env` file is loaded automatically via `dotenv-cli`.

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Admin panel | http://localhost:3000/admin |
| Manager | http://localhost:3000/manager |
| Backend API | http://localhost:3001/api/admin |

**First login:** Go to `/admin` and log in with `admin` / `changeme`. Change your password immediately in Settings.

---

## Environment Variables

All variables are read by the `packages/socket` server. The frontend uses only Vite build-time variables (prefixed `VITE_`).

### Backend (`packages/socket`)

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens. Use a long random string in production. |
| `CORS_ORIGIN` | Yes | Allowed origin for CORS. Set to your frontend URL in production. |
| `WS_PORT` | No | Port the server listens on. Default: `3001` |
| `R2_ACCOUNT_ID` | For media | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | For media | R2 API token key ID |
| `R2_SECRET_ACCESS_KEY` | For media | R2 API token secret |
| `R2_BUCKET_NAME` | For media | R2 bucket name |
| `R2_PUBLIC_URL` | For media | Public base URL for the bucket (e.g. `https://pub-xxx.r2.dev`) |

### Frontend (Vite build-time)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL (e.g. `https://quizio-socket.fly.dev`). Omit in local dev — Vite proxies to `localhost:3001`. |
| `VITE_WS_URL` | Socket.IO server URL (same as `VITE_API_URL`). Omit in local dev. |

Set these in Vercel's environment variable settings (not in `.env`).

---

## Cloudflare R2 Setup

R2 is used to store question media (images, videos, audio). Skip this section if you don't need media uploads.

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **R2 Object Storage** → **Create bucket**
2. Name the bucket (e.g. `quizio-media`)
3. Enable **Public access** for the bucket so uploaded files are publicly readable
4. Copy the **Public bucket URL** (shown as `https://pub-xxx.r2.dev`) → set as `R2_PUBLIC_URL`
5. Go to **Manage R2 API Tokens** → **Create API token**
   - Permissions: **Object Read & Write** on your bucket
   - Copy the **Access Key ID** → `R2_ACCESS_KEY_ID`
   - Copy the **Secret Access Key** → `R2_SECRET_ACCESS_KEY`
6. Find your **Account ID** in the right sidebar of the Cloudflare dashboard → `R2_ACCOUNT_ID`

---

## MongoDB Atlas Setup

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user with read/write access
3. Allow your deployment IP (or `0.0.0.0/0` to allow all)
4. Get the connection string: **Connect** → **Drivers** → copy the `mongodb+srv://...` URI
5. Replace `<password>` and set the database name: `...mongodb.net/quizio`
6. Set this as `MONGODB_URI` in your environment

---

## Production Deployment

Quizio splits the deployment into two separate services:

| Service | Platform | What it does |
|---|---|---|
| Frontend (`packages/web`) | Vercel | Serves the React SPA |
| Backend (`packages/socket`) | Fly.io | Runs the Socket.IO + REST API server |

### Frontend — Vercel

1. Import the repository on [vercel.com](https://vercel.com)
2. Vercel auto-detects `vercel.json` — no additional build config needed:
   - **Build command:** `pnpm --filter web build`
   - **Output directory:** `packages/web/dist`
   - **Install command:** `pnpm install`
3. Add environment variables in **Project Settings → Environment Variables**:
   ```
   VITE_API_URL=https://<your-fly-app>.fly.dev
   VITE_WS_URL=https://<your-fly-app>.fly.dev
   ```
4. Deploy. The `rewrites` rule in `vercel.json` ensures React Router works on direct URL access.

### Backend — Fly.io

#### Initial setup

```bash
# Install Fly CLI
brew install flyctl   # macOS
# or: curl -L https://fly.io/install.sh | sh

# Authenticate
fly auth login
```

#### Launch the app

```bash
# From the repo root
fly launch --no-deploy
```

When prompted, use the existing `fly.toml` config (it already exists in the repo). Set the app name to match the one in `fly.toml` (`quizio-socket` by default — rename to avoid conflicts).

#### Set secrets

```bash
fly secrets set \
  MONGODB_URI="mongodb+srv://..." \
  JWT_SECRET="your-production-secret" \
  CORS_ORIGIN="https://your-app.vercel.app" \
  R2_ACCOUNT_ID="..." \
  R2_ACCESS_KEY_ID="..." \
  R2_SECRET_ACCESS_KEY="..." \
  R2_BUCKET_NAME="quizio-media" \
  R2_PUBLIC_URL="https://pub-xxx.r2.dev"
```

#### Deploy

```bash
fly deploy
```

The `Dockerfile.socket` in the repo root is used. It builds in two stages:
1. **Builder** — installs all dependencies, compiles TypeScript with esbuild
2. **Runtime** — installs production deps only, copies compiled output

#### Seed the database

After first deploy, seed the admin user:

```bash
fly ssh console
# Inside the container:
MONGODB_URI="..." node -e "
const mongoose = require('mongoose');
// Use the seed script via the compiled output or run it separately
"
```

Alternatively, run the seed script locally pointing at Atlas:

```bash
MONGODB_URI="mongodb+srv://..." pnpm --filter socket exec tsx src/scripts/seed.ts
```

#### Verify

```bash
fly status
fly logs
```

The app should be reachable at `https://<your-app>.fly.dev`.

---

## Docker (Self-Hosted)

To self-host both services on a single machine, build the backend image and serve the frontend with any static file server (Nginx, Caddy, etc.).

### Build the backend image

```bash
docker build -f Dockerfile.socket -t quizio-socket .
```

### Run

```bash
docker run -d \
  --name quizio-socket \
  -p 3001:3001 \
  -e MONGODB_URI="..." \
  -e JWT_SECRET="..." \
  -e CORS_ORIGIN="http://localhost:3000" \
  -e R2_ACCOUNT_ID="..." \
  -e R2_ACCESS_KEY_ID="..." \
  -e R2_SECRET_ACCESS_KEY="..." \
  -e R2_BUCKET_NAME="quizio-media" \
  -e R2_PUBLIC_URL="..." \
  quizio-socket
```

### Build the frontend

```bash
VITE_API_URL=http://localhost:3001 VITE_WS_URL=http://localhost:3001 pnpm --filter web build
# Output is in packages/web/dist/ — serve it with any static file server
```

---

## Post-Deployment Checklist

- [ ] Log in to `/admin` with `admin` / `changeme`
- [ ] Change the default password under **Settings → Change Password**
- [ ] Test creating a quiz and running a game end-to-end
- [ ] Confirm media uploads work (if R2 is configured)
- [ ] Set `CORS_ORIGIN` to the exact frontend URL (not `*`) for production security
