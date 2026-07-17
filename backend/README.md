# Sceneit — Backend API

> **Production-grade REST API** powering the Sceneit platform. Built with Node.js, Express 5, TypeScript, Prisma ORM, PostgreSQL, and Inversify IoC. Engineered for clarity, testability, and long-term maintainability.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Design Principles](#3-design-principles)
4. [Project Structure](#4-project-structure)
5. [Architecture](#5-architecture)
6. [Request Flow](#6-request-flow)
7. [Dependency Injection](#7-dependency-injection)
8. [API Design Conventions](#8-api-design-conventions)
9. [API Response Format](#9-api-response-format)
10. [Error Handling](#10-error-handling)
11. [HTTP Status Codes](#11-http-status-codes)
12. [Authentication & Sessions](#12-authentication--sessions)
13. [Validation](#13-validation)
14. [Database](#14-database)
15. [Security](#15-security)
16. [Feature: Auth Module](#16-feature-auth-module)
17. [Feature: Profile Module](#17-feature-profile-module)
18. [Request DTOs](#18-request-dtos)
19. [Response DTOs](#19-response-dtos)
20. [Environment Variables](#20-environment-variables)
21. [Testing](#21-testing)
22. [Docker](#22-docker)
23. [NPM Scripts](#23-npm-scripts)
24. [Performance Considerations](#24-performance-considerations)
25. [Troubleshooting](#25-troubleshooting)
26. [Contributing](#26-contributing)
27. [License](#27-license)

---

## 1. Project Overview

**Sceneit** is a social platform centered around movies and series. Users discover content, write reviews, follow other users, and build curated lists. This document covers the **backend API only**.

### Purpose

The backend exposes an HTTP REST API consumed by the Sceneit web client, responsible for:

- User account lifecycle (registration, authentication, soft-deletion)
- Session management with rotating refresh tokens
- User profile management (CRUD)
- *(Planned)* Content discovery, reviews, lists, follows, notifications

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         Sceneit Backend                          │
│                                                                  │
│   HTTP Layer      │  Business Layer   │  Data Layer             │
│   ─────────────   │  ───────────────  │  ──────────             │
│   Express Router  │  Services         │  Repositories           │
│   Middleware      │  Domain Logic     │  Prisma ORM             │
│   Controllers     │  Error Handling   │  PostgreSQL             │
│   Validators      │  DI Container     │                          │
└──────────────────────────────────────────────────────────────────┘
```

### Backend Responsibilities

| Responsibility | Description |
|---|---|
| REST API | Serves JSON endpoints consumed by clients |
| Authentication | Issues JWT access tokens and opaque refresh tokens |
| Session Management | Tracks active sessions with device metadata |
| Authorization | Protects resources using JWT middleware |
| Validation | Validates all incoming request bodies via Zod schemas |
| Error Handling | Centralised, structured error responses |
| Data Persistence | Manages all reads and writes to PostgreSQL |
| Business Rules | Enforces domain invariants in the service layer |

---

## 2. Technology Stack

| Technology | Version | Purpose | Why It Was Chosen |
|---|---|---|---|
| **Node.js** | 22+ | JavaScript runtime | Non-blocking I/O, enormous ecosystem, shared language with frontend |
| **Express 5** | ^5.2 | HTTP framework | Minimal, battle-tested; v5 ships native async error forwarding |
| **TypeScript** | ^7.0 | Static type safety | Prevents entire classes of bugs at compile time; superior IDE DX |
| **Prisma** | ^7.8 | ORM + Query Builder | Type-safe queries from schema; excellent migration tooling |
| **PostgreSQL** | 17 | Relational database | ACID compliance, mature, proven at scale |
| **pg** | ^8.22 | PostgreSQL driver | Native `pg.Pool` gives fine-grained connection pool control |
| **@prisma/adapter-pg** | ^7.8 | Prisma adapter | Allows Prisma to share a `pg.Pool` rather than managing its own |
| **Inversify** | ^8.1 | IoC / DI container | Constructor injection, singleton management, full testability |
| **reflect-metadata** | ^0.2 | Decorator metadata | Required polyfill for Inversify and TypeScript decorators |
| **Zod** | ^4.4 | Schema validation | Colocated validation and TypeScript inference; eliminates duplication |
| **jsonwebtoken** | ^9.0 | JWT signing/verification | Industry-standard; `expiresIn`, `jti`, and standard claims |
| **bcrypt** | ^6.0 | Password hashing | Adaptive cost factor; resistant to brute-force attacks |
| **date-fns** | ^4.4 | Date manipulation | Functional, tree-shakeable; used for refresh token expiry |
| **ua-parser-js** | ^2.0 | User-agent parsing | Extracts device metadata from the `User-Agent` header |
| **dotenv** | ^17.4 | Environment loading | Loads `.env` into `process.env` at startup |
| **tsx** | ^4.23 | TypeScript runner | Runs `.ts` files directly in development; no build step |
| **Vitest** | ^4.1 | Test framework | Built-in TypeScript support, Vite-based speed, Vitest globals |
| **Supertest** | ^7.2 | HTTP integration tests | Fires real HTTP requests against the Express app in-process |
| **tsc-alias** | ^1.9 | Path alias rewriting | Rewrites `@/` path aliases in compiled `.js` output |

---

## 3. Design Principles

### 3.1 Separation of Concerns

Every request passes through five distinct layers: **routing → middleware → controller → service → repository**. Each layer has a single, well-defined job. No layer reaches into the concerns of another.

### 3.2 Dependency Injection Over Imports

All stateful classes are instantiated and wired by the **Inversify IoC container**, not by direct `new` expressions across modules:

- Dependencies are declared in constructors, not hard-coded.
- Unit tests can supply mocks without patching module imports.
- The entire object graph is visible in `di/inversify.config.ts`.

### 3.3 Fail Fast with Typed Errors

Every error is an instance of a concrete `AppError` subclass. The global error handler reads `statusCode` and `code` to produce a consistent JSON error envelope. Unhandled errors fall through to a 500 fallback — never silently swallowed.

### 3.4 Rich Service Layer

Service methods contain real business logic (existence checks, banned-user guards, credential verification). Repositories contain only database operations. Controllers contain only HTTP-level concerns.

### 3.5 Schema-First Validation

Zod schemas live next to the route they guard. They are the **authoritative source** for what the API accepts. TypeScript types inferred from schemas are used as DTOs, eliminating duplication.

---

## 4. Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema — single source of truth
│   └── migrations/            # Auto-generated migration SQL files
├── src/
│   ├── app.ts                 # Express app factory — middleware and router mounting
│   ├── server.ts              # Process entry point — binds HTTP server to port
│   ├── config/
│   │   ├── env.ts             # Typed environment variable accessor
│   │   └── prisma.client.ts   # Prisma client singleton via pg connection pool
│   ├── di/
│   │   ├── inversify.config.ts  # IoC container — all class bindings
│   │   └── inversify.types.ts   # Symbol registry for DI tokens
│   ├── generated/
│   │   └── prisma/            # Prisma-generated client types (do not edit manually)
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── api/
│   │   │   │   ├── auth.controller.ts   # HTTP handlers
│   │   │   │   ├── auth.router.ts       # Route + middleware wiring
│   │   │   │   └── auth.response.ts     # JSON response builder
│   │   │   ├── dto/
│   │   │   │   ├── signup.dto.ts
│   │   │   │   ├── login.dto.ts
│   │   │   │   └── refresh-token.dto.ts
│   │   │   ├── entity/session.entity.ts
│   │   │   ├── repository/session.repository.ts
│   │   │   ├── schema/
│   │   │   │   ├── signup.schema.ts
│   │   │   │   ├── login.schema.ts
│   │   │   │   └── refresh-token.schema.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.service.test.ts
│   │   │   └── AuthErrorCode.ts
│   │   └── profile/
│   │       ├── api/
│   │       │   ├── profile.controller.ts
│   │       │   ├── profile.router.ts
│   │       │   └── profile.response.ts
│   │       ├── dto/
│   │       │   ├── profile-create.dto.ts
│   │       │   └── profile-update.dto.ts
│   │       ├── entity/profile.entity.ts
│   │       ├── repository/profile.repository.ts
│   │       ├── schema/
│   │       │   ├── profile-create.schema.ts
│   │       │   └── profile-update.schema.ts
│   │       ├── profile.service.ts
│   │       ├── profile.service.test.ts
│   │       └── ProfileErrorCode.ts
│   └── shared/
│       ├── error/
│       │   ├── AppError.ts
│       │   ├── ErrorCode.ts
│       │   ├── async.catch.ts
│       │   └── errors/
│       │       ├── BadRequestError.ts
│       │       ├── UnAuthorizedError.ts
│       │       ├── ForbiddenError.ts
│       │       ├── NotFoundError.ts
│       │       ├── ConflictError.ts
│       │       ├── UnprocessableEntityError.ts
│       │       ├── RateLimitExceededError.ts
│       │       └── InternalServerError.ts
│       ├── middleware/
│       │   ├── authenticate.middleware.ts
│       │   ├── validate-request-body.middleware.ts
│       │   └── error-handler.middleware.ts
│       └── user/
│           ├── entity/user.entity.ts
│           ├── repository/user.repository.ts
│           ├── user.service.ts
│           ├── user.service.test.ts
│           ├── user.types.ts
│           └── UserErrorCode.ts
├── test/
│   ├── factories/
│   │   ├── user.factory.ts
│   │   ├── session.factory.ts
│   │   └── profile.factory.ts
│   ├── helpers/
│   │   ├── auth.helpers.ts
│   │   └── cleanup.ts
│   └── integration/
│       ├── auth/
│       └── profile/
├── prisma.config.ts
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

### Folder Responsibility Reference

| Folder | Owns | Never Contains |
|---|---|---|
| `api/` | Controllers, routers, response builders | Business logic, DB queries |
| `dto/` | Internal data transfer object interfaces | Validation schemas, Prisma types |
| `entity/` | Domain TypeScript interfaces | Prisma model types, DB adapters |
| `repository/` | Prisma queries | Business rules, HTTP concerns |
| `schema/` | Zod validation schemas | Controllers, services |
| `shared/error/` | Base error class and all subtypes | Module-specific logic |
| `shared/middleware/` | Express middleware functions | Business logic |
| `shared/user/` | Cross-module user domain code | Module-specific logic |
| `config/` | App-level singletons (Prisma, ENV) | Business logic |
| `di/` | Inversify container and token registry | Business logic |
| `test/factories/` | DB row creators for tests | Application logic |
| `test/helpers/` | Reusable test setup utilities | Production code |
| `test/integration/` | End-to-end HTTP tests | Unit test mocks |

---

## 5. Architecture

### 5.1 Feature-First (Modular) Architecture

Code is organized by **domain feature** (`auth`, `profile`), not by technical layer (`controllers/`, `services/`). Each module owns its entire vertical slice.

**Why?** As the project grows, new engineers can understand and work on a feature by reading one directory. It eliminates the cognitive overhead of jumping between `controllers/auth.ts`, `services/auth.ts`, `validators/auth.ts` scattered across the tree.

### 5.2 Dependency Flow

```mermaid
flowchart TD
    Router --> Controller
    Controller --> Service
    Service --> Repository
    Repository --> Prisma
    Prisma --> PostgreSQL

    Service --> SharedService["Shared Service (UserService)"]
    SharedService --> SharedRepo["Shared Repository (UserRepository)"]

    Container["Inversify Container"] -.->|injects| Controller
    Container -.->|injects| Service
    Container -.->|injects| Repository

    Middleware["Middleware (auth, validate)"] --> Controller
```

### 5.3 Module Anatomy

Every domain module follows this identical structure:

```
module/
  api/          ← HTTP layer (router, controller, response builder)
  dto/          ← Service input types
  entity/       ← Domain output types
  repository/   ← DB queries
  schema/       ← Zod validation schemas
  *.service.ts  ← Business logic
  *ErrorCode.ts ← Domain-specific error codes
```

### 5.4 Shared Module

`src/shared/` contains code that crosses module boundaries:

- **`user/`** — `UserService` and `UserRepository` used by both `auth` and `profile`.
- **`error/`** — `AppError`, all error subclasses, and `catchAsync` utility.
- **`middleware/`** — Middleware that applies to multiple routes.

---

## 6. Request Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant R as Router
    participant M as Middleware
    participant Ctrl as Controller
    participant Svc as Service
    participant Repo as Repository
    participant DB as PostgreSQL

    C->>R: HTTP Request
    R->>M: validate / authenticate
    M-->>C: 400 / 401 (if middleware rejects)
    M->>Ctrl: req, res, next
    Ctrl->>Svc: Typed DTO
    Svc->>Repo: Query input
    Repo->>DB: Prisma query
    DB-->>Repo: Row data
    Repo-->>Svc: Entity / null
    Svc-->>Ctrl: Entity or throws AppError
    Ctrl-->>C: JSON Response
    note over Ctrl,C: Global error handler converts AppError to JSON on throw
```

### Layer Responsibilities

| Layer | File(s) | Responsibility |
|---|---|---|
| **Router** | `*.router.ts` | Declares routes, attaches middleware in the correct order |
| **Middleware** | `authenticate.middleware.ts`, `validate-request-body.middleware.ts` | Validates JWT; validates request body against Zod schema |
| **Controller** | `*.controller.ts` | Extracts request data, calls service, sends JSON response |
| **Service** | `*.service.ts` | Enforces business rules, orchestrates repository calls |
| **Repository** | `*.repository.ts` | Executes Prisma queries; owns all DB interaction |
| **Error Handler** | `error-handler.middleware.ts` | Converts `AppError` instances to structured JSON responses |

---

## 7. Dependency Injection

The backend uses **Inversify** — an IoC container for TypeScript — to manage all dependencies.

### Why Inversify?

Without a DI container:
- Modules import each other's `new` instances, creating tight coupling.
- Unit tests require module-level monkey-patching to inject mocks.
- Singleton management is informal and scattered.

With Inversify:
- Every class declares its dependencies via `@inject(TYPES.X)`.
- The container wires the entire object graph at startup.
- Unit tests instantiate services with mock constructor arguments — no patches needed.

### Token Registry (`inversify.types.ts`)

```typescript
const TYPES = {
  JWTUtil:           Symbol.for("JWTUtil"),
  ClientInfoUtil:    Symbol.for("ClientInfoUtil"),
  UserRepository:    Symbol.for("UserRepository"),
  UserService:       Symbol.for("UserService"),
  SessionRepository: Symbol.for("SessionRepository"),
  AuthService:       Symbol.for("AuthService"),
  AuthController:    Symbol.for("AuthController"),
  AuthRouter:        Symbol.for("AuthRouter"),
  ProfileRepository: Symbol.for("ProfileRepository"),
  ProfileService:    Symbol.for("ProfileService"),
  ProfileController: Symbol.for("ProfileController"),
  ProfileRouter:     Symbol.for("ProfileRouter"),
};
```

### Container Configuration

```typescript
// All bindings registered as Singleton — one instance per container lifetime
container.bind(TYPES.JWTUtil).to(JWTUtil).inSingletonScope();
container.bind(TYPES.UserRepository).to(UserRepository).inSingletonScope();
container.bind(TYPES.UserService).to(UserService).inSingletonScope();
// ... and so on for every service, repo, controller, and router
```

`inSingletonScope()` is used for all classes because they hold no per-request state. This avoids re-instantiation overhead on every request.

### Required TypeScript Compiler Options

```json
{
  "experimentalDecorators": true,
  "emitDecoratorMetadata": true
}
```

---

## 8. API Design Conventions

### Base Path

All endpoints are prefixed with `/api`. A version segment (`/v1`) will be introduced when the API surface stabilises.

### Resource Naming

| Convention | Example |
|---|---|
| Plural nouns for collections | `/api/users`, `/api/sessions` |
| Kebab-case for compound resources | `/api/refresh-token` |
| `me` prefix for self-referencing authenticated resources | `/api/me/profile` |

### HTTP Methods

| Method | Semantics | Idempotent |
|---|---|---|
| `GET` | Read a resource or collection | Yes |
| `POST` | Create a resource or trigger an action | No |
| `PATCH` | Partially update a resource | Yes |
| `DELETE` | Remove or soft-delete a resource | Yes |

---

## 9. API Response Format

### Success Envelope

```typescript
interface ApiResponse<T> {
  success: boolean; // Always true on success
  message: string;  // Human-readable description of the outcome
  data: T;          // Response payload — type depends on endpoint
}
```

### Error Envelope

```typescript
interface ApiErrorResponse {
  success: boolean; // Always false on error
  error: {
    code: string;       // Machine-readable error code (enum value)
    message: string;    // Human-readable error description
    details?: unknown;  // Optional: validation issues, extra context
  };
}
```

### Response Examples

**201 Created — Signup / Login**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "session": {
      "id": "3e8e4b2a-91c4-4c3e-a123-000000000001",
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "a1b2c3d4e5f6...128-hex-chars",
      "lastUsedAt": "2026-07-17T10:00:00.000Z"
    },
    "user": {
      "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "username": "peter",
      "email": "peter@gmail.com",
      "isEmailVerified": false,
      "isBanned": false,
      "createdAt": "2026-07-17T10:00:00.000Z"
    }
  }
}
```

**200 OK — Profile Fetch**

```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "fullname": "Peter Parker",
    "bio": "Just your friendly neighbourhood developer.",
    "avatarUrl": "https://cdn.example.com/avatars/peter.webp",
    "bannerUrl": null,
    "followersCount": 0,
    "followingsCount": 0,
    "postsCount": 0,
    "createdAt": "2026-07-17T10:00:00.000Z",
    "updatedAt": "2026-07-17T10:00:00.000Z",
    "user": {
      "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "username": "peter",
      "email": "peter@gmail.com",
      "isEmailVerified": false,
      "createdAt": "2026-07-17T10:00:00.000Z"
    }
  }
}
```

**204 No Content — Logout / Account Deletion**

```
HTTP/1.1 204 No Content
(empty body)
```

**400 Bad Request — Validation Error**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Missing or invalid request body",
    "details": [
      { "field": ["username"], "message": "Username can only contain letters, numbers and underscores" },
      { "field": ["password"], "message": "Password must contain at least one uppercase letter" }
    ]
  }
}
```

**401 Unauthorized — Invalid Credentials**

```json
{ "success": false, "error": { "code": "INVALID_CREDENTIALS", "message": "Invalid email or password" } }
```

**401 Unauthorized — Missing Token**

```json
{ "success": false, "error": { "code": "AUTH_TOKEN_MISSING", "message": "Authorization token is required" } }
```

**403 Forbidden — Banned User**

```json
{ "success": false, "error": { "code": "BANNED_USER", "message": "User account has been suspended" } }
```

**404 Not Found**

```json
{ "success": false, "error": { "code": "PROFILE_NOT_FOUND", "message": "Profile not found" } }
```

**409 Conflict**

```json
{ "success": false, "error": { "code": "EMAIL_ALREADY_EXISTS", "message": "Email already exists" } }
```

**429 Rate Limit Exceeded**

```json
{ "success": false, "error": { "code": "RATE_LIMIT_EXCEEDED", "message": "Too many requests." } }
```

**500 Internal Server Error**

```json
{ "success": false, "error": { "code": "INTERNAL_SERVER", "message": "An unexpected error occurred" } }
```

---

## 10. Error Handling

### Error Class Hierarchy

```
Error (native)
└── AppError                         ← Base class
    ├── BadRequestError              ← 400
    ├── UnAuthorizedError            ← 401
    ├── ForbiddenError               ← 403
    ├── NotFoundError                ← 404
    ├── ConflictError                ← 409
    ├── UnprocessableEntityError     ← 422
    ├── RateLimitExceededError       ← 429
    └── InternalServerError          ← 500
```

### `AppError` Interface

```typescript
class AppError extends Error {
  statusCode: number;     // HTTP status sent in the response
  message: string;        // Human-readable message
  isOperational: boolean; // true = expected domain error; false = programmer error
  code: string;           // Machine-readable enum value
  details?: unknown;      // Extra context (e.g. Zod issues array)
}
```

The `isOperational` flag distinguishes domain errors (user not found, duplicate email) from programmer errors (null pointer, schema mismatch).

### `catchAsync` Wrapper

```typescript
const catchAsync = (fn: Function) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
```

Every controller method is wrapped with `catchAsync`. Any thrown `AppError` is forwarded to Express's error pipeline.

### Global Error Handler

```typescript
export default function errorHandler(error: Error, _: Request, res: Response, next: NextFunction) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: { code: error.code, message: error.message, details: error.details },
    });
  }
  res.status(500).json({
    success: false,
    error: { code: ErrorCode.INTERNAL_SERVER, message: error.message },
  });
}
```

Registered **last** in `app.ts` — after all routers.

### Error Code Enums

| Enum | Location | Values |
|---|---|---|
| `ErrorCode` | `shared/error/ErrorCode.ts` | `INVALID_REQUEST`, `RATE_LIMIT_EXCEEDED`, `INTERNAL_SERVER` |
| `AuthErrorCode` | `modules/auth/AuthErrorCode.ts` | `INVALID_CREDENTIALS`, `INVALID_REFRESH_TOKEN`, `REFRESH_TOKEN_EXPIRED`, `REFRESH_TOKEN_REVOKED`, `AUTH_TOKEN_MISSING`, `INVALID_ACCESS_TOKEN` |
| `UserErrorCode` | `shared/user/UserErrorCode.ts` | `EMAIL_ALREADY_EXISTS`, `USERNAME_ALREADY_EXISTS`, `BANNED_USER`, `USER_NOT_FOUND` |
| `ProfileErrorCode` | `modules/profile/ProfileErrorCode.ts` | `PROFILE_NOT_FOUND`, `PROFILE_ALREADY_EXISTS` |

---

## 11. HTTP Status Codes

| Code | Name | When Returned |
|---|---|---|
| `200` | OK | Successful `GET`, `PATCH`, or non-creating `POST` |
| `201` | Created | Successful `POST` that creates a new resource |
| `204` | No Content | Successful `DELETE` or logout — no body returned |
| `400` | Bad Request | Request body fails Zod schema validation |
| `401` | Unauthorized | Missing/invalid/expired token, revoked session, invalid credentials |
| `403` | Forbidden | Authenticated user is banned or attempts a disallowed action |
| `404` | Not Found | Resource does not exist or has been soft-deleted |
| `409` | Conflict | Unique constraint violation (duplicate email, username, or profile) |
| `422` | Unprocessable Entity | Syntactically valid but semantically invalid request |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unhandled programmer error or unexpected exception |

---

## 12. Authentication & Sessions

### Authentication Model

Sceneit uses a **dual-token model**:

| Token | Type | Lifetime | Purpose |
|---|---|---|---|
| Access Token | Signed JWT | `JWT_ACCESS_EXPIRES_IN` (default `15min`) | Authorizes API calls |
| Refresh Token | Opaque hex (128 chars) | `JWT_REFRESH_EXPIRES_IN` days (default 15) | Generates new access tokens |

**Why two tokens?**
- Short-lived access token limits blast radius if leaked.
- Long-lived refresh token provides seamless UX.
- Refresh token is **never stored in plaintext** — only its SHA-256 hash is persisted.

### Access Token Payload

```typescript
interface JWTPayload {
  sub: string;  // User UUID
  sid: string;  // Session UUID
  jti: string;  // Unique token ID (crypto.randomUUID()) — prevents replay
  iat: number;  // Issued-at (set by jsonwebtoken)
  exp: number;  // Expiry (set by jsonwebtoken)
}
```

### Refresh Token

- Generated: `crypto.randomBytes(64).toString("hex")` (128 hex chars)
- SHA-256 hashed immediately; hash stored in DB; plaintext returned to client once.
- On refresh: client sends plaintext → server hashes → DB lookup → if valid, new token pair issued.

### Session Record

| Field | Description |
|---|---|
| `id` | UUID — embedded in access token as `sid` |
| `userId` | FK to User (cascade delete) |
| `refreshTokenHash` | SHA-256 hash of the current refresh token |
| `expiresAt` | Absolute expiry of the refresh token |
| `lastUsedAt` | Updated on every successful refresh |
| `revokedAt` | Set on logout; `null` = active |
| `deviceName` | Vendor from User-Agent (e.g. "Apple") |
| `deviceType` | Type from User-Agent (e.g. "mobile") |
| `ipAddress` | Client IP from `req.ip` |
| `userAgent` | Raw User-Agent string |

### Full Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant API as API Server
    participant DB as PostgreSQL

    Note over C,DB: Login / Signup
    C->>API: POST /api/auth/login/email {email, password}
    API->>DB: findUser(email)
    DB-->>API: User row
    API->>API: bcrypt.compare(password, hash)
    API->>DB: session.create({refreshTokenHash, expiresAt, ...})
    DB-->>API: Session row
    API->>API: jwt.sign({sub, sid, jti})
    API-->>C: {accessToken, refreshToken, user, session}

    Note over C,DB: Protected Request
    C->>API: GET /api/me/profile  Authorization: Bearer accessToken
    API->>API: jwt.verify(accessToken) extracts {sub, sid}
    API->>DB: profile.findUnique({id: sub})
    DB-->>API: Profile row
    API-->>C: {success, data: profile}

    Note over C,DB: Token Refresh (Rotation)
    C->>API: POST /api/auth/refresh-token {token: refreshToken}
    API->>API: sha256(refreshToken)
    API->>DB: session.findUnique({refreshTokenHash})
    DB-->>API: Session + User
    API->>API: Validate not expired, not revoked, user active
    API->>DB: session.update({refreshTokenHash: newHash, expiresAt: newExpiry})
    API->>API: jwt.sign(new access token)
    API-->>C: {accessToken: new, refreshToken: new}

    Note over C,DB: Logout
    C->>API: POST /api/auth/logout  Authorization: Bearer accessToken
    API->>API: jwt.verify extracts sid
    API->>DB: session.update({revokedAt: now})
    API-->>C: 204 No Content
```

### Authentication Middleware

```typescript
export interface AuthRequest extends Request {
  auth?: JWTPayload; // Attached by middleware after successful verification
}

export default function authenticateUser(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnAuthorizedError("Authorization token is required", AuthErrorCode.AUTH_TOKEN_MISSING);
  }
  const token = authHeader.substring("Bearer ".length).trim();
  try {
    req.auth = jwtUtil.verifyAccessToken(token);
    next();
  } catch {
    throw new UnAuthorizedError("Invalid or expired token", AuthErrorCode.INVALID_ACCESS_TOKEN);
  }
}
```

### Token Rotation Security

Every successful refresh replaces the old refresh token. Replay of an old token after rotation is detectable — a stolen token becomes invalid once the legitimate user next refreshes.

---

## 13. Validation

### Architecture

Validation is handled by **Zod** schemas in each module's `schema/` directory. The `validateRequestBody` middleware applies the schema before the controller runs.

```typescript
export const validateRequestBody =
  (schema: ZodObject<any>) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new BadRequestError(
        "Missing or invalid request body",
        ErrorCode.INVALID_REQUEST,
        result.error.issues.map((issue) => ({ message: issue.message, field: issue.path })),
      );
    }
    req.body = result.data; // Replace with parsed + coerced data
    next();
  };
```

After validation, `req.body` is replaced with Zod's parsed output — strings are trimmed, unknown fields are stripped.

### Schema Reference

#### Signup Validation Rules

| Field | Rules |
|---|---|
| `username` | Required; 3–30 chars; `/^[a-zA-Z0-9_]+$/`; trimmed |
| `email` | Required; valid email; trimmed |
| `password` | Required; min 8 chars; must contain `[a-z]`, `[A-Z]`, `[0-9]`, `[@$!%*?&]`; trimmed |

#### Login Validation (both variants)

| Field | Rules |
|---|---|
| `email` / `username` | Required; non-empty; trimmed |
| `password` | Required; non-empty; trimmed |

Login validation is intentionally less strict than signup to avoid leaking password policy via error messages.

#### Profile Create Validation

| Field | Rules |
|---|---|
| `fullname` | Required; 3–50 chars; trimmed |
| `bio` | Optional; 1–100 chars; trimmed |
| `avatarUrl` | Optional; valid URL |
| `bannerUrl` | Optional; valid URL |

#### Profile Update Validation

All fields from Profile Create become optional via `profileCreateSchema.partial()`. This keeps update validation automatically in sync — adding a field to create automatically exposes it in update.

---

## 14. Database

### Schema

PostgreSQL 17 managed by Prisma. All tables use `snake_case`. All timestamps use `Timestamptz(3)`.

```mermaid
erDiagram
    users {
        UUID id PK
        TEXT email UK
        TEXT username UK
        TEXT password_hash
        BOOL is_email_verified
        BOOL is_banned
        TIMESTAMPTZ deleted_at
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    sessions {
        UUID id PK
        UUID user_id FK
        TEXT refresh_token_hash UK
        TIMESTAMPTZ expires_at
        TIMESTAMPTZ last_used_at
        TIMESTAMPTZ revoked_at
        TEXT device_name
        TEXT device_type
        TEXT ip_address
        TEXT user_agent
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    profiles {
        UUID id PK_FK
        TEXT fullname
        TEXT bio
        TEXT avatar_url
        TEXT banner_url
        INT followers_count
        INT followings_count
        INT posts_count
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    users ||--o{ sessions : "has many"
    users ||--o| profiles : "has one"
```

### Design Decisions

#### User ↔ Profile — Shared Primary Key

`Profile.id = User.id`. Benefits:
- No JOIN needed to associate profile with user.
- No orphaned profiles — cascade delete enforces lifecycle linkage.
- `req.auth.sub` (user ID) is directly the profile ID.

#### Soft Delete on Users

`deletedAt` is set instead of hard-deleting. Preserves audit history. Soft-deleted users are blocked at the service layer for login, token refresh, and profile access. `UserRepository.permanentDelete()` exists for administrative use only.

#### Refresh Token — Hash Only

Only the SHA-256 hash of the refresh token is persisted. A database breach does not expose usable tokens.

#### Indexes

| Table | Columns | Purpose |
|---|---|---|
| `users` | `email`, `username` (composite) | Fast unique lookups during auth |
| `sessions` | `user_id`, `refresh_token_hash` (composite) | Fast session lookup and bulk revocation |
| `profiles` | `fullname` | Future full-name search |

#### Cascade Delete

Deleting a `User` cascades to all `Sessions` and the `Profile`. Enforced via `onDelete: Cascade` in the Prisma schema.

### Prisma Client Setup

```typescript
// src/config/prisma.client.ts
const pool = new pg.Pool({ connectionString: ENV.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
```

`@prisma/adapter-pg` allows Prisma to share the application-managed `pg.Pool` — avoids dual connection pool overhead.

---

## 15. Security

### Password Storage

```typescript
const passwordHash = await bcrypt.hash(password, 10);  // ~100ms on modern hardware
const isMatch      = await bcrypt.compare(plaintext, passwordHash);
```

Cost factor `10` is slow enough to deter brute-force, fast enough for normal latency.

### JWT Security

| Practice | Implementation |
|---|---|
| Short access token lifetime | `JWT_ACCESS_EXPIRES_IN` (default `15min`) |
| Unique token identity | `jti = crypto.randomUUID()` per issuance |
| HMAC-SHA256 signing | `HS256` via `jsonwebtoken` |
| Secret rotation | Changing `JWT_ACCESS_SECRET` invalidates all current access tokens |
| Refresh token hashing | SHA-256 hash stored; plaintext never persisted |

### Input Validation

All request bodies are Zod-validated before reaching the controller. Prevents null/undefined propagation, type confusion attacks, and unknown field injection.

### SQL Injection Prevention

Prisma uses **parameterised queries** exclusively. Raw string interpolation into SQL is never used.

### CORS and Security Headers

> [!IMPORTANT]
> CORS and Helmet (security headers) are **not yet configured** and must be added before exposing the API to untrusted origins:
>
> ```typescript
> import cors from "cors";
> import helmet from "helmet";
> app.use(helmet());
> app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
> ```

---

## 16. Feature: Auth Module

### Purpose

Handles all user identity operations: registration, authentication, token refresh, and logout.

### Business Rules

1. User can register with a unique email **and** unique username.
2. Login supports email+password **or** username+password.
3. Banned user (`isBanned = true`) cannot log in or refresh tokens.
4. Soft-deleted user (`deletedAt != null`) cannot log in or refresh tokens.
5. Credentials verified with bcrypt (constant-time) to prevent timing attacks.
6. Each successful login/signup creates a new `Session` with device metadata.
7. Logout **revokes** the session (`revokedAt` set) — does not delete it.
8. Token refresh issues a new token pair and replaces the old refresh token hash.
9. Expired or revoked refresh token → `401`.

### Route Table

| Method | Path | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | No | Register a new user |
| `POST` | `/api/auth/login/email` | No | Login with email + password |
| `POST` | `/api/auth/login/username` | No | Login with username + password |
| `POST` | `/api/auth/refresh-token` | No | Exchange refresh token for new token pair |
| `POST` | `/api/auth/logout` | **Yes** | Revoke the current session |

---

### POST /api/auth/signup

**Request Body**

```json
{ "username": "peter", "email": "peter@gmail.com", "password": "Peter@1234" }
```

**Validation** — username: 3–30 chars, alphanumeric+underscore; email: valid format; password: min 8 chars with upper, lower, digit, special character.

**Business Rules** — email must be unique; username must be unique; password hashed before storage.

**Success Response** — `201 Created`

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "session": { "id": "...", "accessToken": "eyJ...", "refreshToken": "a1b2...", "lastUsedAt": "..." },
    "user": { "id": "...", "username": "peter", "email": "peter@gmail.com", "isEmailVerified": false, "isBanned": false, "createdAt": "..." }
  }
}
```

**Errors** — `400 INVALID_REQUEST`, `409 EMAIL_ALREADY_EXISTS`, `409 USERNAME_ALREADY_EXISTS`, `500 INTERNAL_SERVER`

---

### POST /api/auth/login/email

**Request Body**

```json
{ "email": "peter@gmail.com", "password": "Peter@1234" }
```

**Business Rules** — User not found, wrong password, soft-deleted user, or banned user all return `401 INVALID_CREDENTIALS` (same error — prevents email enumeration).

**Success Response** — `200 OK` (same shape as signup, `message: "User logged in successfully"`)

**Errors** — `400 INVALID_REQUEST`, `401 INVALID_CREDENTIALS`

---

### POST /api/auth/login/username

**Request Body**

```json
{ "username": "peter", "password": "Peter@1234" }
```

Identical business rules and response shape as email login.

---

### POST /api/auth/refresh-token

**Request Body**

```json
{ "token": "a1b2c3d4...128-hex-chars" }
```

**Internal Flow**

1. SHA-256 hash the incoming token.
2. Look up session by `refreshTokenHash`.
3. Not found → `401 INVALID_REFRESH_TOKEN`.
4. `expiresAt < now` → `401 REFRESH_TOKEN_EXPIRED`.
5. `revokedAt != null` → `401 REFRESH_TOKEN_REVOKED`.
6. User deleted or banned → `401 INVALID_CREDENTIALS`.
7. Generate new token pair; update session hash and expiry; return new tokens.

**Success Response** — `200 OK` (`message: "Token is refreshed successfully"`, same data shape)

**Errors** — `400 INVALID_REQUEST`, `401 INVALID_REFRESH_TOKEN`, `401 REFRESH_TOKEN_EXPIRED`, `401 REFRESH_TOKEN_REVOKED`, `401 INVALID_CREDENTIALS`

---

### POST /api/auth/logout

**Headers** — `Authorization: Bearer <accessToken>`

**Request Body** — None

**Flow** — Middleware verifies JWT, extracts `sid`; service calls `sessionRepo.revoke(sid)` to set `revokedAt = now`.

**Success Response** — `204 No Content` (empty body)

**Errors** — `401 AUTH_TOKEN_MISSING`, `401 INVALID_ACCESS_TOKEN`

---

## 17. Feature: Profile Module

### Purpose

Manages the public identity of a user. Separated from the `User` record to allow richer optional metadata without bloating the auth data model.

### Business Rules

1. A user can have **at most one** profile (`409 PROFILE_ALREADY_EXISTS` on duplicate creation).
2. Profile operations check for active user (not banned, not soft-deleted).
3. `DELETE /api/me/profile` soft-deletes the **User** — this is the primary account-deletion mechanism.
4. Counters (`followersCount`, `followingsCount`, `postsCount`) are platform-managed — never set directly via this API.

### Route Table

| Method | Path | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/me/profile` | **Yes** | Create the authenticated user's profile |
| `GET` | `/api/me/profile` | **Yes** | Fetch the authenticated user's profile |
| `PATCH` | `/api/me/profile` | **Yes** | Partially update the authenticated user's profile |
| `DELETE` | `/api/me/profile` | **Yes** | Soft-delete the authenticated user's account |

---

### POST /api/me/profile

**Headers** — `Authorization: Bearer <accessToken>`

**Request Body**

```json
{
  "fullname": "Peter Parker",
  "bio": "Just your friendly neighbourhood developer.",
  "avatarUrl": "https://cdn.example.com/avatars/peter.webp"
}
```

**Validation** — `fullname`: required, 3–50 chars; `bio`: optional, 1–100 chars; `avatarUrl`/`bannerUrl`: optional, valid URL.

**Business Rules** — `userId` injected from `req.auth.sub` (never from body); profile must not already exist.

**Success Response** — `201 Created`

```json
{
  "success": true,
  "message": "Profile created successfully",
  "data": {
    "id": "a0eebc99-...",
    "fullname": "Peter Parker",
    "bio": "Just your friendly neighbourhood developer.",
    "avatarUrl": "https://cdn.example.com/avatars/peter.webp",
    "bannerUrl": null,
    "followersCount": 0,
    "followingsCount": 0,
    "postsCount": 0,
    "createdAt": "2026-07-17T10:00:00.000Z",
    "updatedAt": "2026-07-17T10:00:00.000Z",
    "user": {
      "id": "a0eebc99-...",
      "username": "peter",
      "email": "peter@gmail.com",
      "isEmailVerified": false,
      "createdAt": "2026-07-17T10:00:00.000Z"
    }
  }
}
```

**Errors** — `400 INVALID_REQUEST`, `401 auth errors`, `409 PROFILE_ALREADY_EXISTS`

---

### GET /api/me/profile

**Returns** the authenticated user's profile with embedded user info.

**Business Rules** — No profile or user soft-deleted → `404 PROFILE_NOT_FOUND`; user banned → `403 BANNED_USER`.

**Success Response** — `200 OK` (same shape as POST)

**Errors** — `401 auth errors`, `403 BANNED_USER`, `404 PROFILE_NOT_FOUND`

---

### PATCH /api/me/profile

**Request Body** (all fields optional)

```json
{ "fullname": "Peter B. Parker", "bio": "Updated bio." }
```

Passing `null` for an optional field clears it. Omitting a field leaves it unchanged. `id` injected from `req.auth.sub`.

**Success Response** — `200 OK` (same shape, updated values)

**Errors** — `400 INVALID_REQUEST`, `401 auth errors`, `403 BANNED_USER`, `404 PROFILE_NOT_FOUND`

---

### DELETE /api/me/profile

**Purpose**: Soft-deletes the authenticated user account. Sets `deletedAt` on the `User` record.

**Business Rules** — Profile must exist and user must not already be deleted; banned user → `403`.

**Success Response** — `204 No Content` (empty body)

**Errors** — `401 auth errors`, `403 BANNED_USER`, `404 PROFILE_NOT_FOUND`

---

## 18. Request DTOs

DTOs are plain TypeScript interfaces used as typed input to service methods — not Prisma types.

### `SignupDto`

```typescript
interface SignupDto {
  username: string;
  email: string;
  password: string;       // Plaintext — hashed inside UserService.createUser()
  client: ClientInfoType;
}
```

### `EmailLoginDto`

```typescript
interface EmailLoginDto {
  email: string;
  password: string;       // Plaintext — verified against stored bcrypt hash
  client: ClientInfoType;
}
```

### `UsernameLoginDto`

```typescript
interface UsernameLoginDto {
  username: string;
  password: string;
  client: ClientInfoType;
}
```

### `RefreshTokenDto`

```typescript
interface RefreshTokenDto {
  token: string;          // Plaintext refresh token (128-char hex)
  client: ClientInfoType;
}
```

### `ClientInfoType`

```typescript
interface ClientInfoType {
  deviceName: string | null;  // Device vendor (e.g. "Apple", "Samsung")
  deviceType: string | null;  // Device type (e.g. "mobile", "tablet")
  ipAddress: string | null;   // Client IP from req.ip
  userAgent: string | null;   // Raw User-Agent string
}
```

### `ProfileCreateDto`

```typescript
interface ProfileCreateDto {
  userId: string;           // Injected from req.auth.sub — NOT from request body
  fullname: string;
  bio?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
}
```

### `ProfileUpdateDto`

```typescript
interface ProfileUpdateDto {
  id: string;               // Injected from req.auth.sub
  fullname?: string;
  bio?: string | null;
  bannerUrl?: string | null;
  avatarUrl?: string | null;
}
```

### `UserCreateInput`

```typescript
interface UserCreateInput {
  username: string;
  email: string;
  password: string;  // Plaintext — hashed inside UserService.createUser()
}
```

---

## 19. Response DTOs

### User Entity

```typescript
interface User {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly passwordHash: string;   // NEVER exposed in API responses
  readonly isEmailVerified: boolean;
  readonly isBanned: boolean;
  readonly deletedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
```

### Session Entity

```typescript
interface Session {
  readonly id: string;
  readonly refreshTokenHash: string; // NEVER exposed in API responses
  accessToken?: string | null;       // Populated in memory after creation/refresh
  refreshToken?: string | null;      // Populated in memory after creation/refresh
  readonly deviceName: string | null;
  readonly deviceType: string | null;
  readonly ipAddress: string | null;
  readonly userAgent: string | null;
  readonly expiresAt: Date;
  readonly revokedAt: Date | null;
  readonly lastUsedAt: Date;
  readonly user: User;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
```

### Profile Entity

```typescript
interface Profile {
  readonly id: string;               // Equals user.id (shared PK)
  readonly fullname: string;
  readonly bio: string | null;
  readonly avatarUrl: string | null;
  readonly bannerUrl: string | null;
  readonly followersCount: number;
  readonly followingsCount: number;
  readonly postsCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly user: User;
}
```

### Auth Response Shape

```typescript
interface AuthResponseData {
  session: {
    id: string;
    accessToken: string;
    refreshToken: string;
    lastUsedAt: Date;
  };
  user: {
    id: string;
    username: string;
    email: string;
    isEmailVerified: boolean;
    isBanned: boolean;
    createdAt: Date;
  };
}
```

### Profile Response Shape

```typescript
interface ProfileResponseData {
  id: string;
  fullname: string;
  bio: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  followersCount: number;
  followingsCount: number;
  postsCount: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    username: string;
    email: string;
    isEmailVerified: boolean;
    createdAt: Date;
  };
}
```

---

## 20. Environment Variables

Create a `.env` file in the `backend/` directory. **Never commit this file.**

| Variable | Description | Required | Example |
|---|---|---|---|
| `PORT` | HTTP port the Express server listens on | Yes | `3000` |
| `DATABASE_URL` | PostgreSQL connection string (URL format) | Yes | `postgresql://user:pass@localhost:5432/sceneit_dev?schema=public` |
| `JWT_ACCESS_SECRET` | Secret key for signing/verifying JWT access tokens | Yes | 64+ random characters |
| `JWT_ACCESS_EXPIRES_IN` | Access token lifetime — passed to `jsonwebtoken` `expiresIn` | Yes | `15min`, `1h` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime in **days** (integer) | Yes | `15` |

**Example `backend/.env`**

```env
DATABASE_URL="postgresql://admin:secret@localhost:5432/sceneit_dev?schema=public"
PORT=3000
JWT_ACCESS_SECRET="replace-with-64-or-more-random-characters-generated-securely"
JWT_ACCESS_EXPIRES_IN="15min"
JWT_REFRESH_EXPIRES_IN=15
```

**Docker Compose `.env.dev` (project root)**

```env
POSTGRES_DB=sceneit_dev
POSTGRES_USER=admin
POSTGRES_PASSWORD=12345678
PGADMIN_DEFAULT_EMAIL=sceneit@gmail.com
PGADMIN_DEFAULT_PASSWORD=12345678
```

> [!CAUTION]
> The `.env.dev` values above are placeholder credentials for local development only. Never use them in staging or production environments.

---

## 21. Testing

### Test Strategy

| Layer | Location | Purpose | Uses Real DB |
|---|---|---|---|
| Unit Tests | `src/**/*.test.ts` | Tests service business logic in isolation with mocks | No |
| Integration Tests | `test/integration/**/*.test.ts` | Tests full HTTP → DB → response flow | Yes |

### Test Runner

**Vitest** with key configuration:

```typescript
export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    globals: true,          // vi, describe, it, expect available globally
    fileParallelism: false, // Tests run sequentially — prevents DB race conditions
    environment: "node",
    include: ["src/**/*.test.ts", "test/**/*.test.ts"],
    coverage: { reporter: ["text", "html"] },
  },
});
```

`fileParallelism: false` is critical — integration tests share a database and must run sequentially.

### Unit Tests — Service Layer

Dependencies are mocked via constructor injection — no module patching needed:

```typescript
const userService = { createUser: vi.fn(), getByEmail: vi.fn(), verifyPassword: vi.fn() };
const sessionRepo = { create: vi.fn(), findByTokenHash: vi.fn(), update: vi.fn(), revoke: vi.fn() };
const jwtUtil     = { generateAccessToken: vi.fn(), generateRefreshToken: vi.fn(),
                      hashToken: vi.fn(), getRefreshTokenExpiry: vi.fn() };

const authService = new AuthService(sessionRepo as any, userService as any, jwtUtil as any);

it("should create a session on signup", async () => {
  userService.createUser.mockResolvedValue(user);
  sessionRepo.create.mockResolvedValue(session);
  jwtUtil.generateRefreshToken.mockReturnValue("refresh-token");
  jwtUtil.generateAccessToken.mockReturnValue("access-token");

  const result = await authService.signup(input);
  expect(result.accessToken).toBe("access-token");
});
```

### Integration Tests — HTTP Layer

```typescript
import app from "@/app";
import request from "supertest";

beforeEach(async () => await resetDb());

it("Should signup successfully", async () => {
  const res = await request(app)
    .post("/api/auth/signup")
    .send({ username: "peter", email: "peter@gmail.com", password: "Peter@1234" })
    .expect(201);

  expect(res.body.success).toBe(true);
  expect(res.body.data.session).toHaveProperty("accessToken");
  expect(res.body.data.session).toHaveProperty("refreshToken");
});
```

### Test Factories

Abstract classes with static methods creating real database rows, bypassing the API:

```typescript
abstract class UserFactory {
  static async createUser(data: Prisma.UserCreateInput): Promise<User>
  static async updateUser(id: string, updates: Prisma.UserUpdateInput): Promise<User>
}

abstract class SessionFactory {
  static async createSession(userId: string, data: ...): Promise<Session>
}

abstract class ProfileFactory {
  static async createProfile(userId: string, data: ...): Promise<Profile>
}
```

### Auth Helper

```typescript
abstract class AuthHelper {
  // Creates user in DB + logs in via API → returns {user, session} with valid tokens
  static async createAuthenticatedUser(): Promise<{ user, session }>
}

// Usage in protected-endpoint tests:
const { session } = await AuthHelper.createAuthenticatedUser();
await request(app).get("/api/me/profile").set("Authorization", `Bearer ${session.accessToken}`);
```

### Database Cleanup

```typescript
// test/helpers/cleanup.ts
export async function resetDb() {
  await prisma.user.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.session.deleteMany();
}
```

Called in `beforeEach` of every integration test suite.

### Running Tests

```powershell
npx vitest run              # All tests (unit + integration)
npx vitest                  # Watch mode (TDD)
npx vitest run --coverage   # With coverage report
```

---

## 22. Docker

### Docker Compose (Infrastructure)

The `docker-compose.yaml` at the **project root** starts PostgreSQL and pgAdmin. The backend application runs on the host.

```yaml
services:
  postgres:
    image: postgres:17
    container_name: sceneit-postgres
    env_file: .env.dev       # Loads POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD
    ports: ["5432:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: sceneit-pgadmin
    ports: ["5050:80"]       # pgAdmin UI at http://localhost:5050
    env_file: .env.dev
    depends_on: [postgres]
```

### Starting Infrastructure

```powershell
# From project root
docker compose up -d
docker compose logs -f postgres    # View logs
docker compose down                # Stop
docker compose down -v             # Stop + destroy volumes (data loss)
```

### Running Migrations

```powershell
# From backend/
npx prisma migrate dev --name <name>  # Development: create + apply
npx prisma migrate deploy             # CI/Production: apply only
npx prisma migrate reset              # Destructive: drop + recreate
npx prisma generate                   # Regenerate client after schema changes
```

### pgAdmin Access

Navigate to `http://localhost:5050`. Log in with `.env.dev` credentials. Add server: `sceneit-postgres` on port `5432`.

---

## 23. NPM Scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `tsx watch src/server.ts` | Start development server with hot-reload |
| `build` | `tsc && tsc-alias` | Compile TypeScript to `dist/`, rewrite path aliases |
| `start` | `node dist/server.js` | Run the compiled production build |
| `test` | *(placeholder)* | Use `npx vitest run` directly |

### Prisma Commands

| Command | Purpose |
|---|---|
| `npx prisma generate` | Regenerate Prisma client after schema changes |
| `npx prisma studio` | Open the Prisma data browser |
| `npx prisma migrate dev` | Create and apply a migration |
| `npx prisma migrate deploy` | Apply pending migrations (CI/prod) |
| `npx prisma migrate reset` | Drop and recreate the database |

---

## 24. Performance Considerations

### Connection Pooling

Prisma uses `pg.Pool` managed at the application level. The pool reuses PostgreSQL connections across requests. Pool size can be tuned via `pg.Pool({ max: N })`.

### Singleton Services

All services, repositories, and utilities are `inSingletonScope()` in Inversify — instantiated once at startup and reused per request.

### Database Indexes

All critical query paths are indexed. Lookups on `email`, `username`, `refreshTokenHash`, and `userId` use indexed paths.

### Future: Redis Caching

Redis can be introduced for:
- **JWT blocklist** — store revoked `jti` values until their `exp` for instant access token invalidation.
- **Session cache** — cache frequently accessed session data.
- **Rate limiting** — Redis-based sliding window counters per IP or user ID.

---

## 25. Troubleshooting

### Database Connection Failed

1. Check Docker is running: `docker ps | findstr sceneit-postgres`
2. Verify `DATABASE_URL` in `backend/.env` matches compose credentials.
3. Check port `5432` is accessible.
4. Test: `npx prisma db push`

### JWT Invalid / Expired

1. Check `JWT_ACCESS_EXPIRES_IN` — if very short (e.g. `1s`), tokens expire immediately.
2. Verify `JWT_ACCESS_SECRET` has not changed since the token was issued.
3. Confirm client sends `Authorization: Bearer <token>` (space after `Bearer`).
4. Decode at [jwt.io](https://jwt.io) and inspect the `exp` claim.

### Migration Failed

1. For local dev: `npx prisma migrate reset` (destructive).
2. Check `_prisma_migrations` table for failed records.
3. Verify `DATABASE_URL` points to the correct database.

### Port Already in Use

```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Or change `PORT` in `backend/.env`.

### `reflect-metadata` Errors

```powershell
npm install reflect-metadata
```

Ensure the package is installed and pulled in by Inversify.

### Path Aliases Not Resolving in Production

Run the full build — `tsc-alias` rewrites `@/` aliases in compiled output:

```powershell
npm run build
```

### Environment Variable Missing at Runtime

1. Ensure `backend/.env` exists and contains the variable.
2. Check for typos — names are case-sensitive.
3. Verify `dotenv.config()` is called before the variable is accessed. `env.ts` calls `config()` at module load time.

---

## 26. Contributing

### Branch Naming

```
feature/<short-description>   # New feature
fix/<short-description>       # Bug fix
chore/<short-description>     # Maintenance, deps, refactors
docs/<short-description>      # Documentation changes
test/<short-description>      # Adding or fixing tests
```

### Commit Convention ([Conventional Commits](https://www.conventionalcommits.org/))

```
feat: add email verification endpoint
fix: handle banned user in refresh token flow
chore: upgrade prisma to v7.9
docs: add session rotation explanation to README
test: add integration tests for profile update
```

### Coding Standards

- **TypeScript strict mode** is on. All `any` usage must be justified with a comment.
- **No inline business logic in controllers** — extract data from `req`, call one service method, send response.
- **No inline DB queries in services** — call repository methods only.
- **Every new error condition** must use an `AppError` subclass — never `throw new Error()`.
- **Every new service method** must have a unit test.
- **Every new route** must have an integration test.
- **Every new module** must define its own `*ErrorCode.ts` enum.

### Adding a New Module

1. Create `src/modules/<feature>/` with the standard module anatomy.
2. Define entity interfaces in `entity/`.
3. Implement repository (Prisma queries only) in `repository/`.
4. Implement service (business rules only) in `<feature>.service.ts`.
5. Define Zod schemas in `schema/`.
6. Define DTOs in `dto/`.
7. Implement controller in `api/<feature>.controller.ts`.
8. Register routes in `api/<feature>.router.ts`.
9. Bind all classes in `di/inversify.config.ts` and register tokens in `di/inversify.types.ts`.
10. Mount the router in `app.ts`.
11. Write unit tests for the service.
12. Write integration tests for all routes.

### Pull Request Process

1. All tests pass: `npx vitest run`.
2. TypeScript compiles cleanly: `npm run build`.
3. Open a PR against `main` with a descriptive title.
4. Request a review from at least one other backend engineer.
5. Squash and merge after approval.

---

## 27. License

This project is proprietary software. All rights reserved.

Unauthorised copying, modification, distribution, or use of this software, via any medium, is strictly prohibited without the express written permission of the project owners.

---

*Documentation authored from a thorough review of the Sceneit backend codebase — July 2026.*

