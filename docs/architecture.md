# Architecture

## High-Level Diagram

```
Browser (Player / Manager)          Browser (Admin)
        │                                  │
        │  WebSocket (/ws)                 │  HTTP REST (/api/admin/*)
        │                                  │
        ▼                                  ▼
┌─────────────────────────────────────────────────┐
│              Node.js Server (port 3001)          │
│                                                  │
│   ┌──────────────┐     ┌──────────────────────┐  │
│   │  Socket.IO   │     │  Express REST API    │  │
│   │  Game Engine │     │  /api/admin/*        │  │
│   └──────┬───────┘     └──────────┬───────────┘  │
│          │                        │               │
│   ┌──────▼────────────────────────▼───────────┐  │
│   │              Mongoose / MongoDB            │  │
│   │   Collections: quizzes, users, gameresults │  │
│   └────────────────────────────────────────────┘  │
│                                                  │
│   ┌────────────────────────────────────────────┐  │
│   │         Cloudflare R2 (media files)        │  │
│   └────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

In development, Vite proxies `/ws` and `/api` to `localhost:3001`.
In production, the frontend (Vercel) points directly to the Fly.io backend URL via `VITE_API_URL` and `VITE_WS_URL`.

---

## Game State Machine

The server is the single source of truth for game state. It drives all transitions by emitting `game:status` events containing a `name` (status constant) and a typed `data` payload. The frontend renders different components based on the received status.

### Status Flow

```
Manager creates game
        │
   SHOW_ROOM          ← Players join via PIN code
        │  manager:startGame
   SHOW_START         ← Countdown before first question
        │  (auto)
   SHOW_PREPARED      ← "Question N incoming" screen
        │  (auto)
   SHOW_QUESTION      ← Question text shown, cooldown timer
        │  (auto)
   SELECT_ANSWER      ← Answers revealed, players can respond
        │  (timer ends or all answered)
   SHOW_RESULT        ← Each player sees their own result
        │  (auto, sent per-player)
   SHOW_RESPONSES     ← Manager sees answer distribution + table
        │  manager:showLeaderboard
   SHOW_LEADERBOARD   ← Animated leaderboard
        │  manager:nextQuestion  (if rounds remain)
        │─────────────────────────────► SHOW_PREPARED (loop)
        │
        │  (last question)
   FINISHED           ← Podium screen, results saved to DB
```

### Status Data Shapes

Each `game:status` event carries a `data` payload typed by status name:

| Status | Data Fields |
|---|---|
| `SHOW_ROOM` | `text`, `inviteCode` |
| `SHOW_START` | `time` (countdown seconds), `subject` |
| `SHOW_PREPARED` | `totalAnswers`, `questionNumber` |
| `SHOW_QUESTION` | `question`, `image?`, `cooldown` |
| `SELECT_ANSWER` | `question`, `answers[]`, `image?`, `video?`, `audio?`, `time`, `totalPlayer` |
| `SHOW_RESULT` | `correct`, `message`, `points`, `myPoints`, `rank`, `aheadOfMe?` |
| `SHOW_RESPONSES` | `question`, `answers[]`, `responses{}`, `correct`, `players[]` |
| `SHOW_LEADERBOARD` | `leaderboard[]`, `oldLeaderboard[]` |
| `FINISHED` | `subject`, `top[]` (top 3 players) |

---

## Backend Architecture

### Entry Point — `packages/socket/src/index.ts`

Single HTTP server hosts both Express and Socket.IO:

```typescript
const app = express();
const httpServer = http.createServer(app);
const io = new ServerIO(httpServer, { path: "/ws" });

app.use("/api/admin", adminRouter);    // REST API
io.on("connection", handler);          // Socket.IO
```

### `Game` Class — `services/game.ts`

Each active game is an instance of `Game`. Key properties:

| Property | Type | Description |
|---|---|---|
| `gameId` | `string` | UUID, also the Socket.IO room name |
| `inviteCode` | `string` | 6-digit numeric PIN |
| `manager` | `{ id, clientId, connected }` | Manager's socket info |
| `players` | `Player[]` | All joined players |
| `leaderboard` | `Player[]` | Sorted by points |
| `round` | `{ currentQuestion, playersAnswers, startTime }` | Current round state |
| `roundHistory` | `RoundRecord[]` | Per-question results, saved to DB |
| `quizz` | `Quizz` | The quiz data |
| `started` | `boolean` | Whether game has begun |

Key methods:

| Method | Description |
|---|---|
| `join(socket, username)` | Validates username, adds player to room |
| `start(socket)` | Begins game, emits `SHOW_START` |
| `selectAnswer(socket, answerKey)` | Records player answer, checks if all answered |
| `nextRound(socket)` | Advances to next question |
| `showLeaderboard()` | Shows leaderboard; saves result if last round |
| `saveResult()` | Persists game result to MongoDB |
| `abortRound(socket)` | Skips current answer phase |
| `kickPlayer(socket, playerId)` | Removes a player |
| `reconnect(socket)` | Restores manager or player session |

### Scoring Formula

```typescript
// utils/game.ts
timeToPoint(startTime, seconds):
  points = 1000 - (1000 / seconds) * elapsedSeconds
  return Math.max(0, points)
```

Maximum 1000 points for an instant answer, 0 points if time runs out.

### `Registry` — `services/registry.ts`

Singleton managing all active `Game` instances.

- `addGame(game)` — registers a new game
- `getGameById(gameId)` — look up by UUID
- `getGameByInviteCode(code)` — look up by PIN
- `markGameAsEmpty(game)` — called when manager disconnects during active game
- Auto-cleanup: games with no manager are deleted after **5 minutes**

### Database — `db/`

MongoDB via Mongoose. Three collections:

#### `users`
```typescript
{
  username: string,       // unique
  passwordHash: string,   // bcrypt
  role: "admin",
  createdAt: Date,
  updatedAt: Date
}
```

#### `quizzes`
```typescript
{
  subject: string,
  questions: [{
    question: string,
    answers: string[],    // 2–4 answers
    solution: number,     // index of correct answer
    cooldown: number,     // seconds before answers are shown
    time: number,         // seconds to answer
    image?: string,       // URL
    video?: string,       // URL
    audio?: string        // URL
  }],
  createdBy: ObjectId,    // ref: users
  createdAt: Date,
  updatedAt: Date
}
```

#### `gameresults`
```typescript
{
  quizzId: ObjectId,
  quizzSubject: string,
  playedAt: Date,
  totalPlayers: number,
  createdBy: string,      // manager username
  players: [{
    username: string,
    totalPoints: number,
    rank: number
  }],
  questions: [{
    questionIndex: number,
    questionText: string,
    correctAnswerIndex: number,
    answers: string[],
    playerResults: [{
      username: string,
      answerId: number | null,
      correct: boolean,
      points: number
    }]
  }]
}
```

### Media Uploads — `services/r2Service.ts`

Files are uploaded to Cloudflare R2 via the AWS S3-compatible SDK. Each file is assigned a UUID-based key (`<uuid><ext>`). The returned URL is the public R2 URL stored directly on the quiz question.

---

## Frontend Architecture

### Routing

Managed by React Router v7 with `createBrowserRouter`:

```
/                      → PlayerAuthPage   (enter PIN)
/manager               → ManagerAuthPage  (enter credentials, select quiz)
/party/:gameId         → PlayerGamePage   (live game, player view)
/party/manager/:gameId → ManagerGamePage  (live game, manager view)
/admin                 → → /admin/dashboard
/admin/login           → AdminLoginPage
/admin/dashboard       → AdminDashboardPage
/admin/quiz/new        → AdminQuizNewPage
/admin/quiz/:id        → AdminQuizEditPage
/admin/settings        → AdminSettingsPage
/admin/game-history    → GameHistoryPage
/admin/game-history/:id→ GameDetailPage
```

### Layout Tree

```
GameLayout (SocketProvider)
  └── AuthLayout            — PIN entry, manager login
  └── PlayerGamePage        — live player view
  └── ManagerGamePage       — live manager view

AdminLayoutPage
  └── AdminLoginPage
  └── AdminDashboardPage
  └── AdminQuizNewPage / AdminQuizEditPage
  └── AdminSettingsPage
  └── GameHistoryPage / GameDetailPage
```

### Socket Context — `contexts/socketProvider.tsx`

Wraps the entire game section. Creates a Socket.IO client with:
- `autoConnect: false` — explicit `connect()` call required
- `reconnection: true`, `reconnectionAttempts: Infinity`
- Auth payload: `{ clientId }` — a UUID persisted to `localStorage` for reconnection

Exposes via context: `socket`, `isConnected`, `clientId`, `connect()`, `disconnect()`, `reconnect()`

The `useEvent(event, callback)` hook registers/deregisters socket listeners safely via `useEffect`.

### State Management — Zustand Stores

#### `stores/manager.tsx`
| Field | Type | Description |
|---|---|---|
| `gameId` | `string \| null` | Active game UUID |
| `status` | `Status \| null` | Current game status + data |
| `players` | `Player[]` | All players in game |
| `answeredPlayers` | `{ playerId, username }[]` | Who answered current question |

#### `stores/player.tsx`
| Field | Description |
|---|---|
| `player` | `{ username, points }` or null |
| `gameId` | Active game UUID |
| `status` | Current game status + data |

#### `stores/question.tsx`
| Field | Description |
|---|---|
| `questionStates` | `{ current, total }` — question counter for the badge |

#### `stores/admin.ts`
| Field | Description |
|---|---|
| `token` | JWT string (persisted to `localStorage`) |
| `user` | `{ username, role }` (persisted to `localStorage`) |
| `quizzes` | Cached quiz list |

### Game Components — `features/game/components/states/`

Each component handles one game status:

| Component | Status | Shown to |
|---|---|---|
| `Room` | `SHOW_ROOM` | Manager |
| `Start` | `SHOW_START` | Both |
| `Prepared` | `SHOW_PREPARED` | Both |
| `Question` | `SHOW_QUESTION` | Both |
| `Answers` | `SELECT_ANSWER` | Player |
| `ManagerSelectAnswer` | `SELECT_ANSWER` | Manager |
| `Result` | `SHOW_RESULT` | Player |
| `Responses` | `SHOW_RESPONSES` | Manager |
| `Leaderboard` | `SHOW_LEADERBOARD` | Both |
| `Podium` | `FINISHED` | Manager |
| `Wait` | `WAIT` | Player |

### Admin API Client — `features/admin/api/client.ts`

Module-level `tokenGetter` defaults to reading from `localStorage("admin_token")` before `configureApiClient()` is called. This ensures API calls work on page refresh without a race condition.

The `onUnauthorized` handler (calls `logout()` + `navigate("/admin/login")`) is configured in `AdminLayout`'s `useEffect`.

### Styling

Tailwind CSS v4 via the `@tailwindcss/vite` plugin. There is **no `tailwind.config.js`** — all theme customisation happens in `src/index.css` via `@theme {}` blocks.

Custom design tokens:
- `--color-primary: #ff9900` (orange — buttons, accents)
- `--color-secondary: #1a140b` (dark brown — game background)

> **Note:** shadcn/ui components are included but configured differently from the standard setup due to Tailwind v4 incompatibilities. Custom primitives from `@base-ui/react` are also used.
