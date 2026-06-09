# Multica Workshop

Multica Workshop is a TypeScript workshop repository for a collaboration domain built around projects, tasks, team members, comments, and activity logs. The codebase currently centers on API contracts, validation, service/repository boundaries, and Prisma-backed persistence rather than a finished UI.

## Current State

- API handlers are organized under `src/app/api` using a Next.js App Router-style folder layout.
- The runtime stack is TypeScript, Prisma 7, SQLite, `better-sqlite3`, Zod, and Vitest.
- The repository already contains seeded demo data tooling, database schema and migrations, validation schemas, and service-layer tests.
- `npm run dev` currently runs TypeScript in watch mode. It is not a web server.

## Domain Overview

The current data model covers:

- `Project`
- `Task`
- `TeamMember`
- `TaskComment`
- `ActivityLog`

The API surface in `src/app/api` includes handlers for:

- `dashboard`
- `projects`
- `tasks`
- `team-members`
- `comments`
- `activity-logs`

Projects, tasks, comments, and team members have collection and item routes. `dashboard` provides an aggregated snapshot, and `activity-logs` exposes event history for the seeded workshop data.

## Tech Stack

- Node.js 20+
- TypeScript
- Prisma Client with generated output in `src/generated/prisma`
- SQLite via `better-sqlite3`
- Zod for request validation
- Vitest for unit and validation tests

## Getting Started

Install dependencies:

```bash
npm install
```

The example environment config points Prisma at the local SQLite database:

```bash
DATABASE_URL="file:./dev.db"
```

Generate the Prisma client after schema changes:

```bash
npm run db:generate
```

Apply local migrations:

```bash
npm run db:migrate
```

Seed the demo dataset written to `data/demo-database.json`:

```bash
npm run db:seed
```

Run the TypeScript watcher used during development:

```bash
npm run dev
```

Run validation and tests:

```bash
npm run build
npm run lint
npm test
```

Inspect the SQLite database in Prisma Studio:

```bash
npm run db:studio
```

## Project Structure

```text
.
+-- data/                     Seeded workshop dataset output
+-- docs/                     Architecture, development, and agent guides
+-- prisma/
|   +-- migrations/          Prisma migration history
|   \-- schema.prisma        Domain schema for SQLite
+-- scripts/
|   +-- run-tests.mjs        Test bootstrap helper
|   \-- seed-demo-data.mjs   Demo data generator
+-- src/
|   +-- app/api/             Route handlers grouped by resource
|   +-- generated/prisma/    Generated Prisma client artifacts
|   +-- lib/
|   |   +-- db/              Prisma client setup
|   |   +-- utils/           Shared API response/error helpers
|   |   +-- validation/      Generic request parsing helpers
|   |   \-- validations/     Zod schemas for resources and queries
|   \-- server/
|       +-- repositories/    Database access modules
|       +-- services/        Business logic and orchestration
|       \-- utils/           HTTP, ID, and pagination helpers
+-- tests/                    Vitest coverage for schemas and services
+-- .env.example
+-- package.json
\-- tsconfig.json
```

## Architecture Notes

The codebase follows a thin-route, service-oriented backend shape:

1. Route handlers parse request input and query params.
2. Zod schemas validate the contract.
3. Services enforce business rules and coordinate repository calls.
4. Repositories isolate Prisma access.
5. Shared helpers normalize success, validation, and error responses.

This keeps the route files small and makes the domain logic testable without depending on the transport layer.

## Useful Commands

```bash
npm run build            # Type-check once
npm run dev              # Type-check in watch mode
npm test                 # Run helper script + Vitest suite
npm run test:validation  # Run Vitest directly
npm run db:generate      # Regenerate Prisma client
npm run db:migrate       # Apply local migrations
npm run db:seed          # Regenerate demo data JSON
npm run db:studio        # Open Prisma Studio
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Development Guide](docs/DEVELOPMENT_GUIDE.md)
- [AI Agent Guide](docs/AI_AGENT_GUIDE.md)

## Gaps and Follow-Up

The repository still has a mismatch between some documentation and the current implementation. The source tree already provides an API/domain backbone, but the docs in `docs/` still describe parts of the project as future or planned work. If you want, the next cleanup step is to align those documents with the code in the same way this README now does.
