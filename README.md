# TaskDock

TaskDock is a full-stack task management application that helps teams and individuals organize, track, and manage their tasks efficiently. It features secure authentication with JWT (RS256) and OTP verification, a robust REST API, and a modern Next.js frontend with Redux state management.

## Demo

https://taskdockapp.vercel.app

## API Documentation (Swagger)

https://taskdock-tgsd.onrender.com/api-docs/

## Run Locally

Clone the project

```bash
git clone https://github.com/Priyanshu-web-tech/TaskDock.git
```

Go to the project directory

```bash
cd TaskDock
```

### Backend Setup

Go to the server directory

```bash
cd server
```

Install dependencies

```bash
npm install
```

Generate RSA key pair (required for JWT RS256 signing)

```bash
openssl genrsa -out private.key 2048
openssl rsa -in private.key -pubout -out public.key
```

Create a `.env` file by copying the example and filling in your values

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on (default `3001`) |
| `NODE_ENV` | `development` or `production` |
| `COOKIE_SECRET` | Random secret used to sign cookies |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins |
| `SERVER_REDIRECT_URI` | Base URI used for server redirects and Swagger docs |
| `SECRET_KEY` | Secret key for OTP token signing |
| `JWT_ALGO` | JWT algorithm — must be `RS256` |
| `JWT_ISSUER` | JWT issuer claim (e.g. `TASKDOCK`) |
| `TOKEN_EXPIRES_IN` | Access token lifetime (e.g. `1d`) |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token lifetime (e.g. `7d`) |
| `OTP_DIGIT` | Number of OTP digits (e.g. `6`) |
| `OTP_EXPIRES_IN` | OTP validity window (e.g. `15m`) |
| `OTP_BYPASS` | Set `true` in dev to skip real OTP sending |
| `OTP` | Static OTP value used when `OTP_BYPASS` is `true` |
| `DB_HOST` | PostgreSQL host (default `localhost`) |
| `DB_DATABASE` | PostgreSQL database name |
| `DB_USERNAME` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_SSL` | Enable SSL for PostgreSQL (`true`/`false`) |
| `DB_DIALECT` | Database dialect — must be `postgres` |
| `DB_POOL_MAX` | Maximum pool connections |
| `DB_POOL_MIN` | Minimum pool connections |
| `DB_ACQUIRE` | Max time (ms) to wait for a connection |
| `DB_IDLE` | Max time (ms) a connection can be idle |
| `BREVO_API_KEY` | Brevo (Sendinblue) API key for sending emails |
| `BREVO_SENDER_EMAIL` | Verified sender email address in Brevo |
| `SALT_ROUND` | bcrypt salt rounds (e.g. `10`) |

Run database migrations

```bash
npm run migration:run
```

*(Optional)* Seed the database

```bash
npm run seed:run
```

Start the server

```bash
npm run dev
```

### Frontend Setup

Open a new terminal and go to the client directory

```bash
cd client
```

Install dependencies

```bash
npm install
```

Create a `.env` file by copying the example and filling in your values

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_BASE_URL` | Backend API base URL path prefix (e.g. `/api/v1/`) |
| `API_URL` | Backend server origin (e.g. `http://localhost:3001`) |

Start the client

```bash
npm run dev
```

## Tech Stack

**Client:** Next.js, React, Redux Toolkit, TailwindCSS, TypeScript

**Server:** Node.js, Express

**Database:** PostgreSQL with Sequelize ORM

**Auth:** JWT (RS256), HTTP-only cookies, OTP via Brevo email API
