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
