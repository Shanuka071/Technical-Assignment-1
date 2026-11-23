# Taskboard – Full-Stack Task Management Application

A task manager built with **Next.js (App Router) + React Query** on the frontend and
**Node.js + Express + Prisma + PostgreSQL** on the backend, written in TypeScript.

**Features:** dashboard with live statistics · full CRUD · search, filter, sort and pagination
(state kept in the URL) · validated forms with server-side error mapping · double-submit
protection · Kanban board with drag-and-drop · optimistic status updates · dark/light theme ·
responsive, accessible UI · backend unit and API tests.

---

## 1. Quick start

**Prerequisites:** Node.js 18.18+ (20 recommended), npm, Docker (or any local PostgreSQL 14+).

```bash
# 1. Database
docker compose up -d                     # PostgreSQL on localhost:5432

# 2. Backend  (http://localhost:4000)
cd backend
cp .env.example .env
npm install
npx prisma migrate deploy                # applies the committed migration
npm run db:seed                          # optional: 12 sample tasks (incl. overdue ones)
npm run dev

# 3. Frontend (http://localhost:3000) - in a second terminal
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Without Docker, create a database yourself and put its connection string in
`backend/.env` (`DATABASE_URL`).

### Useful commands

| Where | Command | Purpose |
|---|---|---|
| backend | `npm test` | Run unit + API tests (no database needed) |
| backend | `npm run typecheck` | Type-check (run `npx prisma generate` first) |
| backend | `npm run build && npm start` | Production build / run |
| backend | `npx prisma migrate dev` | Create a new migration after editing the schema |
| backend | `npx prisma studio` | Browse the database |
| frontend | `npm run build && npm start` | Production build / run |
| frontend | `npm run lint` / `npm run typecheck` | Lint / type-check |

### Environment variables

| File | Variable | Default | Description |
|---|---|---|---|
| `backend/.env` | `DATABASE_URL` | – (required) | PostgreSQL connection string |
| | `PORT` | `4000` | API port |
| | `NODE_ENV` | `development` | `development` \| `test` \| `production` |
| | `CORS_ORIGIN` | `http://localhost:3000` | Comma-separated allowed origins |
| `frontend/.env.local` | `NEXT_PUBLIC_API_URL` | `http://localhost:4000/api/v1` | Base URL of the API |

The backend validates its environment on start-up and exits with a clear message if it is invalid.

---

## 2. Project structure

```
.
├── docker-compose.yml
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma                 # Data model, enums, indexes
│   │   ├── migrations/                   # SQL migration (committed)
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/        env.ts          # Validated, typed configuration
│   │   ├── domain/        task.entity.ts  # ORM-independent types and enums
│   │   ├── routes/                        # Endpoint definitions
│   │   ├── controllers/                   # HTTP in / HTTP out only
│   │   ├── services/                      # Business logic
│   │   ├── repositories/                  # The ONLY code that touches Prisma
│   │   ├── dtos/                          # Request/response contracts
│   │   ├── mappers/                       # DTO <-> entity <-> response
│   │   ├── schemas/                       # Zod schemas (request shapes + constraints)
│   │   ├── validations/                   # validate() middleware
│   │   ├── middlewares/                   # Central error handling
│   │   ├── errors/                        # AppError, NotFoundError, ValidationError
│   │   ├── utils/                         # apiResponse, asyncHandler, dates, sanitize
│   │   ├── app.ts                         # Express app factory (dependencies injected)
│   │   └── server.ts                      # Composition root + graceful shutdown
│   └── tests/                             # Vitest: service tests + Supertest API tests
└── frontend/src/
    ├── app/               # Routes (pages), layout, providers, error/not-found
    ├── components/
    │   ├── ui/            # Button, Pagination, ConfirmDialog, FormField, states …
    │   ├── layout/        # Navbar
    │   ├── dashboard/     # StatCard, DistributionCard, DashboardView
    │   └── tasks/         # TaskTable, TaskCard, TaskForm, TaskFilters, KanbanBoard …
    ├── hooks/             # useTasks (React Query + optimistic mutation), useDebounce
    ├── services/          # apiClient (fetch wrapper) + taskService (endpoints)
    ├── context/           # Theme and toast providers
    ├── lib/               # constants, formatting, zod form schema, URL param helpers
    ├── types/             # Shared TypeScript types
    └── config/            # Environment access
```

---

## 3. Architectural decisions

### Backend

* **Layering and responsibilities.** `routes → controllers → services → repositories`.
  Controllers only translate HTTP; services hold business rules (not-found handling, pagination
  maths, overdue/statistics logic); the repository is the only file that imports Prisma.
* **SOLID / dependency inversion.** The service depends on the `ITaskRepository` interface,
  not on Prisma. Concrete classes are wired once in `server.ts` (composition root), and
  `createApp(service)` receives its dependency, which is why the whole API can be tested with an
  in-memory repository and no database.
* **Domain types are independent of the ORM** (`domain/task.entity.ts`), so services, mappers
  and tests never import `@prisma/client`.
* **DTOs and validation.** Zod schemas are the single source of truth: request DTO types are
  derived with `z.infer`, so types and runtime validation cannot drift apart. A `validate()`
  middleware replaces the raw request part with the parsed, trimmed, defaulted value.
* **Mappers** convert request DTOs (string dates) to persistence data, entities to response
  DTOs (ISO strings + computed `isOverdue`), and aggregates to the dashboard response.
* **Consistent responses and errors.** Success: `{ success: true, data, meta? }`.
  Failure: `{ success: false, error: { code, message, details? } }`. One error middleware maps
  `AppError` subclasses, malformed JSON (400), oversized bodies (413), Prisma "record not found"
  (404) and unknown errors (500, message hidden in production). Validation failures return
  **422** with per-field messages the UI shows next to the right input.
* **Security.** Helmet, CORS allow-list, rate limiting, 100 kB body limit, UUID-validated ids,
  HTML tags and control characters stripped from text, Prisma parameterised queries,
  no stack traces in production, validated environment.
* **Database design.** Native PostgreSQL enums for status/priority, `VARCHAR(150)` title,
  `NOT NULL` constraints, and indexes on `status`, `priority`, `dueDate`, `createdAt` and
  `(status, dueDate)` – matching the filters, sort options and overdue query. List queries add `id`
  as a sort tie-breaker so pagination is stable.
* **Overdue definition.** A task is overdue when its due date is *before today (UTC)* and it is
  not `COMPLETED`. Tasks due today are not overdue. Computed on the server for both the list
  (`isOverdue`) and dashboard so they always agree.

### Frontend

* **Server state vs. client state.** TanStack Query owns server data (caching, de-duplication,
  invalidation, `keepPreviousData` while paging). Local UI state stays in components; the list
  filters, sort and page live **in the URL**, so refresh, back/forward and sharing work.
* **API layer.** Components never call `fetch`. `apiClient` handles base URL, JSON, network
  failures and error normalisation (`ApiError`); `taskService` exposes typed endpoint functions;
  `hooks/useTasks` wraps them for the UI.
* **Forms.** React Hook Form + Zod for client validation; server-side 422 details are mapped back
  onto the matching fields (`setError`), other errors show in a banner. Duplicate submissions are
  prevented by a disabled/loading submit button *and* a synchronous in-flight guard.
* **Optimistic UI.** Changing a status (table, card, detail page or Kanban drag) updates every
  cached list immediately, rolls back with a toast if the request fails, and re-syncs afterwards.
* **UX and accessibility.** Loading, empty and error states everywhere; labelled controls,
  `aria-invalid`/`aria-describedby` on fields, `role="alert"` for errors, focus-visible rings,
  skip link, keyboard-friendly status menus (a non-drag alternative to Kanban), accessible
  confirm dialog (Escape, focus), reduced-motion support.
* **Responsive.** Table on tablet/desktop, cards on mobile; the Kanban board stacks on small
  screens.
* **Rendering.** Pages are server components that mount small client components only where
  interactivity is needed; theme is applied by an inline script before first paint (no flash).
* **Theme.** Tailwind `dark` class strategy with persisted preference and system default.

### Trade-offs / known limitations

* No authentication (not in the brief); the API is open apart from rate limiting.
* The Kanban board loads the 100 tasks due soonest (API max page size) and says so when more exist.
* Due date is a calendar date stored as UTC midnight; "overdue" is evaluated in UTC.
* `PUT /tasks/:id` replaces all editable fields; `PATCH /tasks/:id/status` is the partial update.

---

## 4. Database schema

```prisma
enum TaskStatus { TODO  IN_PROGRESS  COMPLETED }
enum Priority   { LOW   MEDIUM       HIGH }

model Task {
  id          String     @id @default(uuid())
  title       String     @db.VarChar(150)
  description String?    @db.Text
  status      TaskStatus @default(TODO)
  priority    Priority   @default(MEDIUM)
  dueDate     DateTime
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([status])  @@index([priority])  @@index([dueDate])
  @@index([createdAt])  @@index([status, dueDate])
  @@map("tasks")
}
```

Migration SQL: `backend/prisma/migrations/20261123000000_init/migration.sql`.

---

## 5. API documentation

Base URL: `http://localhost:4000/api/v1` · Health check: `GET /health`

| Method | Endpoint | Description | Success |
|---|---|---|---|
| GET | `/tasks` | List tasks (search, filter, sort, paginate) | 200 + `meta` |
| GET | `/tasks/stats` | Dashboard statistics | 200 |
| GET | `/tasks/:id` | Task details | 200 |
| POST | `/tasks` | Create a task | 201 |
| PUT | `/tasks/:id` | Update a task | 200 |
| PATCH | `/tasks/:id/status` | Update only the status | 200 |
| DELETE | `/tasks/:id` | Delete a task | 204 |

**`GET /tasks` query parameters**

| Param | Values | Default |
|---|---|---|
| `page` | integer ≥ 1 | `1` |
| `limit` | 1–100 | `10` |
| `search` | text (matches title, case-insensitive) | – |
| `status` | `TODO` \| `IN_PROGRESS` \| `COMPLETED` | – |
| `priority` | `LOW` \| `MEDIUM` \| `HIGH` | – |
| `sortBy` | `createdAt` \| `dueDate` | `createdAt` |
| `order` | `asc` \| `desc` | `desc` |

**`POST /tasks` and `PUT /tasks/:id` body**

```json
{
  "title": "Prepare sprint demo",
  "description": "Optional, max 2000 chars",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2026-12-01"
}
```
`title` and `dueDate` are required; `status` defaults to `TODO`, `priority` to `MEDIUM`.

**Responses**

```jsonc
// 200 GET /tasks
{ "success": true,
  "data": [ { "id": "…", "title": "…", "description": null, "status": "TODO", "priority": "HIGH",
              "dueDate": "2026-12-01T00:00:00.000Z", "isOverdue": false,
              "createdAt": "…", "updatedAt": "…" } ],
  "meta": { "page": 1, "limit": 10, "total": 12, "totalPages": 2 } }

// 200 GET /tasks/stats
{ "success": true,
  "data": { "total": 12, "completed": 3, "inProgress": 3, "pending": 6, "overdue": 2,
            "completionRate": 25,
            "byStatus":   { "TODO": 6, "IN_PROGRESS": 3, "COMPLETED": 3 },
            "byPriority": { "LOW": 3, "MEDIUM": 4, "HIGH": 5 } } }

// 422 validation error
{ "success": false,
  "error": { "code": "VALIDATION_ERROR", "message": "Validation failed",
             "details": [ { "field": "title", "message": "Title is required" } ] } }
```

| Status | Code | When |
|---|---|---|
| 400 | `INVALID_JSON` | Malformed JSON body |
| 404 | `NOT_FOUND` / `ROUTE_NOT_FOUND` | Unknown task / route |
| 413 | `PAYLOAD_TOO_LARGE` | Body over 100 kB |
| 422 | `VALIDATION_ERROR` | Invalid body, query or id |
| 429 | – | Rate limit exceeded |
| 500 | `INTERNAL_ERROR` | Unexpected error |

---

## 6. Testing

`cd backend && npm test` runs 17 tests with Vitest:

* **Service tests** – CRUD, not-found handling, filtering, sorting, pagination metadata, overdue
  and dashboard calculations.
* **API tests (Supertest)** – status codes, validation messages, sanitisation, malformed JSON,
  id validation, query validation, update/status/stats/delete flow, JSON 404.

Both use an in-memory repository, so they need no database.

---

## 7. Screenshots

Place screenshots in `docs/screenshots/` and link them here:

* Dashboard · Task list (filters + pagination) · Create/edit form with validation errors ·
  Task details · Kanban board · Dark mode · Mobile layout
