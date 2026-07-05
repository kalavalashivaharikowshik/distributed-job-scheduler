# Design Decisions & Engineering Trade-offs

## Project Overview

The Distributed Job Scheduler was designed with the objective of providing a reliable, scalable, and maintainable platform for background job execution. During development, several architectural decisions were made to balance simplicity, performance, scalability, and reliability.

---

# 1. Monolithic Backend with Separate Worker

## Decision

The API server and Worker Service were implemented as two independent processes.

```
Frontend
      │
      ▼
Backend API
      │
 PostgreSQL
      ▲
      │
Worker Service
```

## Why?

Keeping the worker separate allows background job execution without blocking API requests.

## Trade-off

Pros

- Better scalability
- Independent deployment
- Independent failure recovery
- Easier horizontal scaling

Cons

- Slightly more deployment complexity
- Additional worker monitoring required

---

# 2. PostgreSQL as the Primary Database

## Decision

PostgreSQL was selected instead of MongoDB.

## Why?

The scheduler requires:

- Transactions
- Foreign key relationships
- ACID guarantees
- Complex filtering
- Reliable concurrent updates

These requirements are naturally supported by PostgreSQL.

## Trade-off

Pros

- Strong consistency
- Excellent relational modeling
- Transaction support

Cons

- More rigid schema than NoSQL databases

---

# 3. Prisma ORM

## Decision

Prisma ORM was used instead of writing raw SQL.

## Why?

Prisma provides:

- Type safety
- Schema migrations
- Better developer productivity
- Auto-generated TypeScript types

## Trade-off

Pros

- Reduced boilerplate
- Improved maintainability
- Safer database queries

Cons

- Slight abstraction overhead compared to raw SQL

---

# 4. Polling Worker Architecture

## Decision

Workers periodically poll the database for available jobs.

## Why?

Polling is easier to implement and sufficient for medium-scale systems.

## Trade-off

Pros

- Simple implementation
- Easy debugging
- Reliable execution

Cons

- Slight latency before job pickup
- Higher database query frequency

Future enhancement:

Replace polling with event-driven messaging.

---

# 5. Atomic Job Claiming

## Decision

Workers claim jobs using database transactions.

## Why?

Without atomic claiming, multiple workers could execute the same job.

## Benefits

- Prevents duplicate execution
- Supports concurrent workers
- Ensures consistency

---

# 6. Retry Policy Design

## Decision

Retry behavior is configurable.

Supported strategies

- Fixed Delay
- Linear Backoff
- Exponential Backoff

## Why?

Different workloads require different retry strategies.

Example

API failures benefit from exponential backoff, while temporary delays may only require fixed retries.

---

# 7. Dead Letter Queue

## Decision

Jobs exceeding maximum retries are moved to a dedicated Dead Letter Queue.

## Why?

Permanent failures should not block normal queue processing.

## Benefits

- Failure isolation
- Easier debugging
- Manual retry capability

---

# 8. Execution History

## Decision

Every execution attempt is stored separately.

## Why?

A single job may execute multiple times due to retries.

Execution history provides:

- Attempt number
- Duration
- Worker
- Error message
- Completion status

This improves observability and debugging.

---

# 9. Job Logs

## Decision

Separate Job Logs were implemented instead of storing log messages within the Job table.

## Why?

Logging grows rapidly.

Keeping logs in a dedicated table improves normalization and query performance.

---

# 10. Metrics Module

## Decision

System metrics are computed from database state instead of maintaining separate counters.

## Benefits

- Always accurate
- No synchronization issues

Trade-off

Slightly higher query cost.

---

# 11. Authentication

## Decision

JWT authentication was selected.

## Why?

JWT enables stateless authentication.

Benefits

- No server session storage
- Easy frontend integration
- Scalable deployment

---

# 12. Organization-Based Multi-tenancy

## Decision

Users belong to organizations.

Projects belong to organizations.

Queues belong to projects.

This hierarchy isolates customer data.

```
Organization
      │
 Projects
      │
 Queues
      │
 Jobs
```

---

# 13. Frontend Architecture

## Decision

React was structured using feature-based pages.

```
Pages
Components
API
Context
Types
```

Benefits

- Modular
- Easy maintenance
- Reusable components

---

# 14. Loading Skeletons

## Decision

Skeleton screens were used instead of simple loading text.

Why?

Improves perceived performance and user experience.

---

# 15. Responsive Design

Responsive layouts were implemented using CSS Grid and media queries.

Benefits

- Desktop support
- Tablet support
- Mobile support

---

# 16. Global Search

A unified search interface was implemented instead of individual searches.

Benefits

- Better usability
- Faster navigation
- Improved user experience

---

# 17. Bonus Features

The following enhancements were implemented beyond the core requirements.

### Rate Limiting

Implemented using Express Rate Limit.

Purpose

- Prevent abuse
- Protect authentication endpoints

---

### Basic Role-Based Access Control (RBAC)

Organization roles are enforced for protected operations.

Benefits

- Improved security
- Better authorization

---

### WebSocket Live Updates

Implemented using Socket.IO.

Purpose

Provide real-time notifications for selected events.

---

# Scalability Considerations

The current architecture supports future enhancements including:

- Workflow dependencies
- Queue sharding
- Distributed locking
- Event-driven execution
- AI-generated failure summaries
- Horizontal worker scaling
- Redis-backed queues

---

# Conclusion

The design prioritizes reliability, maintainability, modularity, and scalability over unnecessary complexity. Each architectural decision was made by balancing implementation effort with production-oriented engineering practices.
