Backend Design Decisions
## Backend Design Decisions

### 1. Modular Architecture

The backend is divided by domain modules:

- Auth
- Users
- Projects
- Queues
- Retry Policies
- Jobs
- Scheduler
- Workers
- DLQ
- Dashboard
- Metrics

This keeps the code maintainable and easier to extend.

---

### 2. Separate API and Worker Services

The API server handles HTTP requests, authentication, queue management, and dashboard data.

The worker service runs separately and directly connects to PostgreSQL using Prisma. This allows reliable job polling, atomic claiming, execution, retries, and heartbeats without blocking API requests.

---

### 3. Relational Database Design

PostgreSQL is used because job scheduling needs strong consistency, transactions, indexing, and relational integrity.

Important relations:

```text
Organization → Project → Queue → Job
Queue → RetryPolicy
Worker → Queue
Job → JobExecution
Job → JobLog
Job → DeadLetterQueue
4. Atomic Job Claiming

Workers claim jobs using a transaction and conditional update.

A job is only claimed if its current status is still:

QUEUED

This prevents two workers from executing the same job.

5. Job Lifecycle

Supported lifecycle:

QUEUED → CLAIMED → RUNNING → COMPLETED

Failure lifecycle:

RUNNING → RETRYING → QUEUED

Permanent failure lifecycle:

RUNNING → DEAD_LETTER
6. Retry Strategy

Retry policy supports:

FIXED
LINEAR
EXPONENTIAL

Each queue can have a retry policy. Jobs copy maxAttempts from the queue retry policy when created.

7. Dead Letter Queue

If a job exceeds max retry attempts, it is moved to DEAD_LETTER.

A DLQ entry stores:

job id
queue id
reason
error message
failed timestamp

DLQ jobs can be retried manually.

8. Observability

The system stores:

job logs
job executions
worker heartbeats
duration metrics
retry attempts
queue statistics
worker health
dashboard overview metrics

These are exposed through REST APIs for the frontend dashboard.

9. Graceful Shutdown

Workers handle shutdown signals and mark themselves offline after stopping polling.

This prevents stale worker state and improves operational correctness.

10. Trade-offs

This project uses PostgreSQL polling instead of Redis or Kafka to keep the system simple and focused on database consistency.

Polling is easier to implement and explain, but for very high throughput systems, Redis streams, Kafka, or dedicated queue systems may be better.