# API Reference

Quizio exposes two communication interfaces:

1. **REST API** — for admin operations (quiz management, user management, game history)
2. **Socket.IO** — for real-time game events (players, manager, game state)

---

## REST API

Base path: `/api/admin`

All routes except `/api/admin/auth` require a JWT Bearer token:

```
Authorization: Bearer <token>
```

Tokens are obtained via the login endpoint and expire after **8 hours**.

---

### Authentication

#### `POST /api/admin/auth`

Login with username and password.

**Request body:**
```json
{
  "username": "admin",
  "password": "changeme"
}
```

**Response `200`:**
```json
{
  "token": "<jwt>",
  "user": {
    "username": "admin",
    "role": "admin"
  }
}
```

**Error responses:**
- `400` — missing username or password
- `401` — invalid credentials

---

#### `POST /api/admin/auth/refresh`

Refresh a valid (non-expired) JWT token.

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**
```json
{
  "token": "<new-jwt>"
}
```

**Error responses:**
- `401` — missing or invalid token

---

### Quizzes

All quiz routes require authentication.

#### `GET /api/admin/quizzes`

List quizzes with optional search and sort.

**Query parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `search` | string | — | Case-insensitive substring match on `subject` |
| `sort` | `updatedAt` \| `name` | `updatedAt` | Sort order |

**Response `200`:**
```json
[
  {
    "id": "64abc...",
    "subject": "World Geography",
    "questionCount": 10,
    "createdBy": "admin",
    "createdAt": "2026-03-18T00:00:00.000Z",
    "updatedAt": "2026-03-18T00:00:00.000Z"
  }
]
```

---

#### `GET /api/admin/quizzes/:id`

Get a single quiz with full question data.

**Response `200`:**
```json
{
  "_id": "64abc...",
  "subject": "World Geography",
  "questions": [
    {
      "question": "What is the capital of France?",
      "answers": ["London", "Paris", "Berlin", "Rome"],
      "solution": 1,
      "cooldown": 3,
      "time": 20,
      "image": "https://pub-xxx.r2.dev/abc.jpg"
    }
  ]
}
```

**Error responses:**
- `404` — quiz not found

---

#### `POST /api/admin/quizzes`

Create a new quiz.

**Request body:**
```json
{
  "subject": "World Geography",
  "questions": [
    {
      "question": "What is the capital of France?",
      "answers": ["London", "Paris", "Berlin", "Rome"],
      "solution": 1,
      "cooldown": 3,
      "time": 20,
      "image": "https://pub-xxx.r2.dev/abc.jpg",
      "video": "",
      "audio": ""
    }
  ]
}
```

**Validation rules:**
- `subject`: 1–100 characters
- `questions`: 1–50 items
- `answers`: 2–4 items per question
- `solution`: valid index within `answers`
- `cooldown`: 1–30 seconds
- `time`: 5–120 seconds
- `image`, `video`, `audio`: valid URL or empty string (optional)

**Response `201`:** Full quiz object (same as `GET /:id`)

**Error responses:**
- `400` — validation failed (with details)

---

#### `PUT /api/admin/quizzes/:id`

Update an existing quiz. Same body and validation as `POST`.

**Response `200`:** Updated quiz object

**Error responses:**
- `400` — validation failed
- `404` — quiz not found

---

#### `DELETE /api/admin/quizzes/:id`

Delete a quiz permanently.

**Response `200`:**
```json
{ "success": true }
```

**Error responses:**
- `404` — quiz not found

---

#### `GET /api/admin/quizzes/:id/export`

Download the quiz as a JSON file (without MongoDB metadata — only `subject` and `questions`).

**Response:** `application/json` file download

---

#### `POST /api/admin/quizzes/import`

Import a quiz from a previously exported JSON file. Same validation as `POST /api/admin/quizzes`.

**Response `201`:** Created quiz object

---

### Media Uploads

#### `POST /api/admin/uploads`

Upload a media file to Cloudflare R2. Returns the public URL to store on a question.

**Request:** `multipart/form-data` with field `file`

**Accepted types:** `image/*`, `video/*`, `audio/*`

**Size limit:** 50 MB

**Response `200`:**
```json
{
  "url": "https://pub-xxx.r2.dev/3f8a1b2c.jpg"
}
```

**Error responses:**
- `400` — no file uploaded or unsupported file type
- `500` — upload to R2 failed

---

### Settings (User Management)

#### `GET /api/admin/settings/users`

List all admin users.

**Response `200`:**
```json
[
  {
    "id": "64abc...",
    "username": "admin",
    "role": "admin",
    "createdAt": "2026-03-18T00:00:00.000Z"
  }
]
```

---

#### `POST /api/admin/settings/users`

Create a new admin user.

**Request body:**
```json
{
  "username": "teacher1",
  "password": "strongpassword"
}
```

**Response `201`:**
```json
{
  "id": "64abc...",
  "username": "teacher1",
  "role": "admin"
}
```

**Error responses:**
- `400` — missing fields, or username already exists

---

#### `DELETE /api/admin/settings/users/:id`

Delete an admin user. Cannot delete yourself.

**Response `200`:**
```json
{ "success": true }
```

**Error responses:**
- `400` — attempting to delete yourself
- `404` — user not found

---

#### `PUT /api/admin/settings/password`

Change the currently logged-in user's password.

**Request body:**
```json
{
  "currentPassword": "old-password",
  "newPassword": "new-password"
}
```

**Response `200`:**
```json
{ "success": true }
```

**Error responses:**
- `401` — current password incorrect
- `404` — user not found

---

#### `PUT /api/admin/settings/users/:id/password`

Reset another admin user's password (no current password required).

**Request body:**
```json
{
  "newPassword": "new-password"
}
```

**Response `200`:**
```json
{ "success": true }
```

**Error responses:**
- `400` — missing newPassword
- `404` — user not found

---

### Game Results

#### `GET /api/admin/game-results`

List game results with optional filtering.

**Query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `quizzId` | string | Filter by quiz ID |
| `from` | ISO date string | Filter by start date |
| `to` | ISO date string | Filter by end date |
| `page` | number | Page number (default: 1) |

**Response `200`:**
```json
[
  {
    "_id": "64abc...",
    "quizzSubject": "World Geography",
    "playedAt": "2026-03-18T10:00:00.000Z",
    "totalPlayers": 4,
    "createdBy": "admin",
    "players": [
      { "username": "alice", "totalPoints": 2800, "rank": 1 }
    ],
    "questions": [...]
  }
]
```

---

#### `GET /api/admin/game-results/:id`

Get a single game result with full per-question, per-player breakdown.

**Response `200`:** Full game result object

**Error responses:**
- `404` — result not found

---

#### `GET /api/admin/game-results/:id/export`

Download the game result as a CSV file.

**CSV columns:** `Username`, `Q1 (correct/wrong)`, `Q1 points`, ..., `Total points`, `Rank`

**Response:** `text/csv` file download (UTF-8 BOM included for Excel compatibility)

---

## Socket.IO Events

Socket.IO server is mounted at path `/ws`.

Connection auth:
```javascript
const socket = io(SERVER_URL, {
  path: "/ws",
  auth: { clientId: "<uuid>" }  // persisted in localStorage
});
```

The `clientId` is used to identify reconnecting clients.

---

### Server → Client Events

These are emitted from the server to one or more clients.

---

#### `game:status`

The primary event driving the game UI. Sent when game state changes.

```typescript
{
  name: Status,          // e.g. "SELECT_ANSWER"
  data: StatusDataMap[Status]
}
```

See [architecture.md — Status Data Shapes](./architecture.md#status-data-shapes) for `data` types per status.

---

#### `game:reset`

Sent to all players in a game room when the game is aborted, the manager disconnects, or the game ends unexpectedly.

```typescript
message: string   // e.g. "Manager disconnected", "Game ended by manager"
```

The client should navigate to the home screen when this is received.

---

#### `game:successRoom`

Sent to a player after entering a valid invite code. Contains the `gameId` to navigate to.

```typescript
data: string   // gameId
```

---

#### `game:totalPlayers`

Sent to all clients in a game room when the player count changes.

```typescript
count: number
```

---

#### `game:errorMessage`

Sent to a single client when an operation fails (e.g. invalid invite code, wrong game state).

```typescript
message: string
```

---

#### `game:startCooldown` / `game:cooldown`

Sent during the cooldown phase before answers are revealed.

```typescript
// game:cooldown
count: number   // current countdown value
```

---

#### `game:updateQuestion`

Sent when the question counter changes (new question starting).

```typescript
{
  current: number,
  total: number
}
```

---

#### `game:playerAnswer`

Sent to the manager to update the live answered-count during `SELECT_ANSWER`.

```typescript
count: number   // total answers received so far
```

---

#### `manager:quizzList`

Sent to manager after successful authentication. Contains all available quizzes.

```typescript
quizzList: QuizzWithId[]
```

---

#### `manager:gameCreated`

Sent to manager after a game is created.

```typescript
{
  gameId: string,
  inviteCode: string
}
```

---

#### `manager:newPlayer`

Sent to manager when a player joins the waiting room.

```typescript
player: Player   // { id, clientId, username, points, connected }
```

---

#### `manager:removePlayer`

Sent to manager when a player disconnects before the game starts.

```typescript
playerId: string
```

---

#### `manager:playerKicked`

Sent to manager after a player is kicked.

```typescript
playerId: string
```

---

#### `manager:playerAnswered`

Sent to manager each time a player submits an answer during `SELECT_ANSWER`.

```typescript
{
  playerId: string,
  username: string,
  answeredCount: number,
  totalPlayers: number
}
```

---

#### `manager:errorMessage`

Sent to manager when authentication or game creation fails.

```typescript
message: string
```

---

#### `manager:successReconnect`

Sent to manager after a successful reconnection. Restores full game state.

```typescript
{
  gameId: string,
  status: { name: Status, data: StatusDataMap[Status] },
  players: Player[],
  currentQuestion: { current: number, total: number }
}
```

---

#### `player:successReconnect`

Sent to a player after a successful reconnection. Restores player state.

```typescript
{
  gameId: string,
  status: { name: Status, data: StatusDataMap[Status] },
  player: { username: string, points: number },
  currentQuestion: { current: number, total: number }
}
```

---

#### `player:updateLeaderboard`

Sent to a player to update the leaderboard display.

```typescript
{
  leaderboard: Player[]
}
```

---

### Client → Server Events

These are emitted by the client (player or manager) to the server.

---

#### `manager:auth`

Authenticate as manager using admin credentials. On success, the server responds with `manager:quizzList`.

```typescript
{
  username: string,
  password: string
}
```

---

#### `game:create`

Create a new game session with the selected quiz. Requires prior `manager:auth`.

```typescript
quizzId: string   // MongoDB ObjectId of the quiz
```

**Server responds with:** `manager:gameCreated`

---

#### `player:join`

Attempt to join a game using a 6-digit invite code.

```typescript
inviteCode: string   // exactly 6 digits
```

**Server responds with:** `game:successRoom` (with gameId) or `game:errorMessage`

---

#### `player:login`

Enter the game with a chosen username after joining a game room.

```typescript
{
  gameId: string,
  data: { username: string }
}
```

**Validation:** 4–20 characters. Usernames must be unique within the game.

---

#### `player:selectedAnswer`

Submit an answer during the `SELECT_ANSWER` phase.

```typescript
{
  gameId: string,
  data: { answerKey: number }   // 0-indexed answer index
}
```

---

#### `manager:startGame`

Start the game (transition from `SHOW_ROOM`).

```typescript
{ gameId: string }
```

---

#### `manager:nextQuestion`

Advance from `SHOW_LEADERBOARD` to the next question.

```typescript
{ gameId: string }
```

---

#### `manager:showLeaderboard`

Advance from `SHOW_RESPONSES` to `SHOW_LEADERBOARD`.

```typescript
{ gameId: string }
```

---

#### `manager:abortQuiz`

Skip the current answer phase (ends `SELECT_ANSWER` early).

```typescript
{ gameId: string }
```

---

#### `manager:endGame`

End the game immediately. If at least one question was answered, the result is saved to the database before ending.

```typescript
{ gameId: string }
```

All players receive `game:reset` with message `"Game ended by manager"`.

---

#### `manager:kickPlayer`

Remove a player from the waiting room (only before the game starts).

```typescript
{
  gameId: string,
  playerId: string   // player's socket ID
}
```

---

#### `manager:reconnect`

Attempt to reconnect to an existing game as manager.

```typescript
{ gameId: string }
```

**Server responds with:** `manager:successReconnect` or `game:reset`

---

#### `player:reconnect`

Attempt to reconnect to an existing game as player.

```typescript
{ gameId: string }
```

**Server responds with:** `player:successReconnect` or `game:reset`
