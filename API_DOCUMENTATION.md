# API Documentation

## Overview

The Distributed Job Scheduler exposes a RESTful API that allows clients to manage organizations, projects, queues, retry policies, jobs, workers, metrics, and monitoring.

### Base URL

Development

```text
http://localhost:5000/api
```

Production

```text
https://YOUR_RENDER_BACKEND_URL/api
```

---

# Authentication

The API uses **JWT (JSON Web Token)** authentication.

After successful login, include the token in every protected request.

Example:

```http
Authorization: Bearer <JWT_TOKEN>
```

---

# Response Format

## Success Response

```json
{
  "success": true,
  "data": {}
}
```

---

## Error Response

```json
{
  "success": false,
  "message": "Error description"
}
```

---

# Authentication APIs

## Register User

### Endpoint

```http
POST /auth/register
```

### Description

Creates a new user account along with a default organization.

### Request

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "user": {},
    "organization": {},
    "token": "JWT_TOKEN"
  }
}
```

---

## Login

```http
POST /auth/login
```

Authenticates a user and returns a JWT.

---

## Current User

```http
GET /auth/me
```

Returns currently logged-in user details.

---

# Project APIs

## Get Projects

```http
GET /projects
```

Returns all projects belonging to the authenticated organization.

---

## Create Project

```http
POST /projects
```

Creates a new project.

---

## Update Project

```http
PATCH /projects/:id
```

Updates project details.

---

## Delete Project

```http
DELETE /projects/:id
```

Deletes the selected project.

---

# Queue APIs

## Get Queues

```http
GET /queues
```

Returns queues for the selected project.

---

## Create Queue

```http
POST /queues
```

Creates a new processing queue.

---

## Update Queue

```http
PATCH /queues/:id
```

Updates queue properties.

---

## Pause Queue

```http
PATCH /queues/:id/pause
```

Temporarily stops job execution.

---

## Resume Queue

```http
PATCH /queues/:id/resume
```

Resumes processing.

---

## Queue Statistics

```http
GET /queues/:id/details
```

Returns:

- Queue Information
- Job Statistics
- Worker Statistics
- Throughput
- Recent Jobs

---

# Retry Policy APIs

## Get Retry Policies

```http
GET /retry-policies
```

---

## Create Retry Policy

```http
POST /retry-policies
```

Supports:

- Fixed Delay
- Linear Backoff
- Exponential Backoff

---

## Delete Retry Policy

```http
DELETE /retry-policies/:id
```

---

# Job APIs

## Get Jobs

```http
GET /jobs
```

Supports:

- Pagination
- Status filter
- Search

---

## Get Job Details

```http
GET /jobs/:id
```

Returns complete job information.

---

## Create Job

```http
POST /jobs
```

Supports:

- Immediate Jobs
- Delayed Jobs
- Scheduled Jobs
- Recurring Jobs
- Batch Jobs

---

## Cancel Job

```http
PATCH /jobs/:id/cancel
```

Cancels a queued job.

---

# Dead Letter Queue APIs

## List Dead Letter Jobs

```http
GET /dlq
```

Returns permanently failed jobs.

---

## Retry Dead Letter Job

```http
PATCH /dlq/:entryId/retry
```

Moves a dead-letter job back to the queue.

---

# Worker APIs

## Worker Health

```http
GET /workers/health
```

Returns

- Worker Status
- Heartbeat
- Running Jobs
- Health State

---

## Cleanup Workers

```http
POST /workers/cleanup
```

Marks stale workers as OFFLINE.

---

# Metrics APIs

## System Metrics

```http
GET /metrics/system
```

Returns:

- Total Jobs
- Success Rate
- Average Execution Time
- Worker Counts
- Queue Counts

---

## Queue Metrics

```http
GET /metrics/queues/:id
```

Returns queue-specific performance metrics.

---

## Worker Metrics

```http
GET /metrics/workers/:id
```

Returns worker execution statistics.

---

# Job History APIs

## Execution History

```http
GET /jobs/:id/executions
```

Returns every execution attempt.

---

## Job Logs

```http
GET /jobs/:id/logs
```

Returns chronological log entries.

---

# Health API

## Backend Health

```http
GET /health
```

Returns server status.

---

# Authentication & Authorization

The system implements

- JWT Authentication
- Protected Routes
- Organization Membership Validation
- Basic Role-Based Access Control (RBAC)

---

# Rate Limiting

Rate limiting is implemented using Express Rate Limit.

Authentication endpoints:

- 20 requests per 15 minutes

General APIs:

- 300 requests per 15 minutes

---

# WebSocket Events

Implemented using Socket.IO.

Current Events

| Event | Description |
|---------|-------------|
| job:created | Triggered when a new job is created |

---

# HTTP Status Codes

| Code | Description |
|------|-------------|
|200|Success|
|201|Created|
|400|Bad Request|
|401|Unauthorized|
|403|Forbidden|
|404|Not Found|
|409|Conflict|
|500|Internal Server Error|

---

# API Design Principles

The API follows REST principles.

Key characteristics:

- Resource-oriented endpoints
- Stateless communication
- JWT authentication
- Consistent response structure
- Proper HTTP status codes
- Pagination support
- Filtering support
- Modular controllers
- Centralized error handling
