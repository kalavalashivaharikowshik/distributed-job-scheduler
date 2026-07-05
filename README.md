# Distributed Job Scheduler

A production-inspired distributed job scheduling platform built with Node.js, Express, PostgreSQL, Prisma, React, and TypeScript.

The system supports asynchronous background jobs, multiple queues, delayed jobs, scheduled jobs, recurring cron jobs, batch jobs, retry policies, dead letter queue handling, worker heartbeats, execution logs, metrics, and a modern web dashboard.

## Live Links

Frontend: YOUR_VERCEL_FRONTEND_LINK  
Backend API: YOUR_RENDER_BACKEND_LINK  
GitHub Repository: YOUR_GITHUB_REPO_LINK  

## Key Features

- User authentication with JWT
- Organization and project management
- Queue management with priority and concurrency limits
- Queue pause/resume
- Retry policies with fixed, linear, and exponential backoff
- Immediate, delayed, scheduled, recurring, and batch jobs
- Separate worker service
- Atomic job claiming
- Worker heartbeats
- Graceful worker shutdown
- Job execution history
- Job logs
- Dead Letter Queue
- DLQ retry
- Queue statistics
- System metrics
- Worker health monitoring
- Responsive React dashboard
- Global search
- Toast notifications
- Loading skeletons
- Rate limiting
- Basic RBAC
- WebSocket live update support

## Tech Stack

### Backend
- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Socket.IO
- Express Rate Limit

### Worker
- Node.js
- TypeScript
- Prisma
- PostgreSQL polling

### Frontend
- React
- TypeScript
- Vite
- React Router
- Axios
- Recharts
- Lucide Icons
- React Hot Toast
- Socket.IO Client

## Project Structure

```text
distributed-job-scheduler/
│
├── backend/
│   ├── prisma/
│   └── src/
│       ├── modules/
│       ├── middlewares/
│       ├── utils/
│       └── socket.ts
│
├── worker/
│   ├── prisma/
│   └── src/
│       ├── heartbeat.ts
│       ├── job-claimer.ts
│       ├── job-runner.ts
│       └── index.ts
│
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── types/
│
└── README.md

Backend Setup
cd backend
npm install

Create .env:

DATABASE_URL="postgresql://postgres:postgres@localhost:5433/job_scheduler?schema=public"
PORT=5000
JWT_SECRET="super-secret-change-this"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"

Run migrations:

npx prisma migrate dev
npx prisma generate

Start backend:

npm run dev

Health check:

GET http://localhost:5000/health
Worker Setup
cd worker
npm install
npm run prisma:generate

Create .env:

DATABASE_URL="postgresql://postgres:postgres@localhost:5433/job_scheduler?schema=public"
WORKER_NAME="local-worker-1"
QUEUE_ID="your_queue_id"
WORKER_CONCURRENCY=3
POLL_INTERVAL_MS=2000
HEARTBEAT_INTERVAL_MS=10000

Start worker:

npm run dev
Frontend Setup
cd frontend
npm install

Create .env:

VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

Start frontend:

npm run dev
Deployment
Backend deployed on Render as a Web Service.
Worker deployed on Render as a Background Worker.
PostgreSQL deployed on Render PostgreSQL.
Frontend deployed on Vercel.
Job Lifecycle
QUEUED → CLAIMED → RUNNING → COMPLETED

Failure lifecycle:

RUNNING → RETRYING → QUEUED

Permanent failure lifecycle:

RUNNING → DEAD_LETTER
Bonus Features Implemented
Rate limiting using express-rate-limit
Basic role-based access control using organization roles
WebSocket live update support using Socket.IO

Replace these:

```text
YOUR_VERCEL_FRONTEND_LINK
YOUR_RENDER_BACKEND_LINK
YOUR_GITHUB_REPO_LINK

with your real deployed links.
