# Quizio — Project Overview

Quizio is a self-hosted, real-time multiplayer quiz platform inspired by Kahoot. It is designed for educators, teams, and communities who want full control over their data and quiz content.

## Features

- **Real-time multiplayer** — Players join via a 6-digit PIN code, no account required
- **Manager dashboard** — Live game control: start, advance questions, skip, kick players, end game early
- **Admin dashboard** — Full quiz CRUD, media attachments per question, import/export JSON, game history
- **Media support** — Image, video, and audio per question via Cloudflare R2
- **Reconnection** — Both players and manager reconnect automatically after network drops
- **Game history** — All completed games are stored in MongoDB with per-question, per-player breakdown and CSV export
- **Multi-admin** — Multiple admin accounts, each with password management
- **Scoring** — Time-based scoring: faster answers earn more points (max 1000 per question)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, Zustand, Socket.IO client |
| Backend | Node.js, Express 5, Socket.IO 4, Mongoose |
| Database | MongoDB |
| Media storage | Cloudflare R2 (S3-compatible) |
| Auth | JWT (8-hour expiry), bcrypt |
| Monorepo | pnpm workspaces |
| Frontend deploy | Vercel |
| Backend deploy | Fly.io |

## Repository Structure

```
quizio/
├── packages/
│   ├── common/        # Shared TypeScript types and Zod validators
│   ├── socket/        # Node.js backend (Express + Socket.IO)
│   └── web/           # React SPA (Vite)
├── docs/              # This documentation
├── .env.example       # Environment variable template
├── vercel.json        # Vercel deploy config (web)
├── fly.toml           # Fly.io deploy config (socket)
└── Dockerfile.socket  # Docker build for socket server
```

## Monorepo Packages

### `packages/common`
Shared between `web` and `socket`. Contains:
- TypeScript types: `Player`, `Answer`, `Quizz`, `QuizzWithId`, all Socket.IO event types
- Zod validators: `quizSchema`, `questionSchema`, `usernameValidator`, `inviteCodeValidator`
- No runtime code — types and validators only

### `packages/socket`
The backend server. Runs Express and Socket.IO on the same HTTP server (default port `3001`).
- REST API at `/api/admin/*` for admin operations
- Socket.IO at path `/ws` for real-time game events
- MongoDB via Mongoose for quiz, user, and game result persistence
- Cloudflare R2 for media uploads

### `packages/web`
React SPA served by Vite (dev port `3000`). No SSR.
- Game UI: player flow and manager control flow
- Admin UI: quiz management, game history, settings
- Socket.IO client for real-time communication
- Zustand for client-side state management

## Path Aliases

Configured in each `tsconfig.json` and `vite.config.ts`:

```
@quizio/common  →  packages/common/src
@quizio/socket  →  packages/socket/src
@quizio/web     →  packages/web/src
```

## Documentation Index

- [overview.md](./overview.md) — This file
- [architecture.md](./architecture.md) — Technical design: game state machine, backend, frontend, data models
- [api.md](./api.md) — REST API reference and Socket.IO event catalogue
- [deployment.md](./deployment.md) — Local setup, environment variables, and production deployment
