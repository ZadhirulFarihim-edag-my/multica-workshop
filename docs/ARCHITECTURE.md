# Architecture

This document defines the target architecture for the Multica Workshop application. The repository is still a starter workspace, so implementation should use these standards as the baseline unless a future issue explicitly changes them.

## Architecture Goals

- Keep the application simple enough for workshop delivery.
- Preserve clear boundaries between routing, UI, validation, business logic, and data access.
- Make changes safe for multiple AI agents working in parallel.
- Support production-ready validation, error handling, observability, and testing.

## Next.js App Router Structure

Use `src/app` for route segments, layouts, loading states, error boundaries, and API route handlers.

```text
src/app/
  layout.tsx
  page.tsx
  <route>/
    page.tsx
    loading.tsx
    error.tsx
  api/
    <resource>/
      route.ts
```

Pages should assemble data and compose feature components. They should not contain reusable domain logic, database access, or large client-side workflows.

Prefer server components by default. Use client components only for browser-only behavior such as local state, event handlers, form interactions, or browser APIs.

## Frontend Component Structure

Use a layered component structure:

```text
src/components/
  ui/        # Reusable low-level primitives
  layout/    # Shell, navigation, page frames
src/features/
  <feature>/
    components/
    hooks/
    services/
    types.ts
```

Guidelines:

- Shared visual primitives belong in `src/components/ui`.
- Feature-specific components stay inside the owning feature folder.
- Hooks should be specific and named by behavior, such as `useProjectFilters`.
- Do not put API calls directly inside generic UI components.
- Keep props typed and explicit.

## Backend API Route Structure

Use Next.js route handlers under `src/app/api`. Route handlers should be thin adapters:

1. Read request input.
2. Validate request data.
3. Call a service or use case.
4. Convert the result into a response DTO.
5. Return a consistent HTTP response.

Example target shape:

```text
src/app/api/projects/route.ts
src/server/use-cases/create-project.ts
src/server/services/project-service.ts
src/server/repositories/project-repository.ts
src/lib/validation/project-schemas.ts
src/lib/errors/http-errors.ts
```

Do not place business decisions directly in `route.ts`. Keep route files small enough that agents can reason about request handling without reading the entire domain.

## Data Access Layer

Keep persistence concerns behind repositories in `src/server/repositories`.

Recommended rules:

- Route handlers must not query the database directly.
- Services and use cases depend on repository interfaces or small repository modules.
- Repository methods return domain-safe objects, not raw driver internals.
- Keep transaction boundaries in service or use-case code when multiple writes must succeed together.
- Avoid N+1 query patterns and unbounded list queries.

If the project later adopts Prisma, Drizzle, or another ORM, place database clients in `src/lib/db` and keep schema-specific logic out of UI and route handlers.

## Validation Approach

Validate all external input at the boundary:

- API request bodies
- Query parameters
- Route parameters
- Form submissions
- Environment variables

Use shared schemas where practical, but do not over-couple frontend forms to backend persistence models. Prefer DTO schemas that describe the API contract.

Validation failures should return `400 Bad Request` with a predictable response shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": []
  }
}
```

## Error Handling Approach

Use consistent error boundaries and HTTP responses.

Frontend:

- Add route-level `error.tsx` files for user-facing failures.
- Use `loading.tsx` for slow server-rendered routes.
- Avoid exposing internal exception details in the UI.

Backend:

- Convert known domain errors to explicit HTTP status codes.
- Return `401` for unauthenticated requests and `403` for unauthorized requests.
- Return `404` when a requested resource is not visible to the caller.
- Return `409` for version or uniqueness conflicts.
- Log internal errors with context, but return a generic `500` message to the caller.

## Testing Strategy

Use a test pyramid that keeps most coverage fast and local:

- Unit tests for utility functions, validation, repositories with mocked drivers, and use cases.
- Component tests for important UI behavior.
- API route tests for request validation and response contracts.
- End-to-end tests only for critical workflows.

Recommended validation before a pull request:

```bash
npm run lint
npm test
npm run build
```

Add targeted tests when changing behavior. Documentation-only changes should still be reviewed for broken links and command accuracy.

## Pull Request Rules

Every pull request should include:

- Clear summary of the change.
- Issue reference.
- Validation commands and results.
- Screenshots for visible UI changes.
- Known limitations or follow-up work.

Pull requests should be small enough to review in one pass. Avoid mixing unrelated refactors, UI changes, and backend behavior changes.

## Task Delegation Workflow

For multi-agent work:

1. Split work by bounded responsibility, such as one feature, one API resource, or one document.
2. Assign each task to a single owner.
3. Document branch names, PR URLs, and blockers in the issue thread.
4. Avoid two agents editing the same file unless explicitly coordinated.
5. Merge only after validation is complete and reviewer feedback is addressed.

When in doubt, create smaller follow-up issues instead of expanding the scope of the current issue.

