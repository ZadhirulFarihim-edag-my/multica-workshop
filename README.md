# Multica Workshop

Multica Workshop is intended to be a Next.js App Router application used for workshop-style product and agent collaboration exercises. The repository is currently a starter workspace, so this README defines the project conventions future implementation work should follow.

## Expected Stack

- Next.js with the App Router
- React and TypeScript
- Node.js 20 LTS or newer
- npm as the default package manager unless the project later commits a different lockfile
- Backend endpoints implemented with Next.js route handlers
- Validation at API boundaries with a schema library such as Zod

## Getting Started

When the application scaffold exists, install dependencies from the repository root:

```bash
npm install
```

Run the local development server:

```bash
npm run dev
```

Build the production bundle:

```bash
npm run build
```

Run tests:

```bash
npm test
```

Run linting and formatting checks:

```bash
npm run lint
npm run format:check
```

If a command is not available yet, add the missing script before relying on it in CI or handoff notes.

## Recommended Project Structure

```text
src/
  app/
    layout.tsx
    page.tsx
    api/
      <resource>/
        route.ts
  components/
    ui/
    layout/
  features/
    <feature>/
      components/
      hooks/
      services/
      types.ts
  lib/
    api/
    auth/
    db/
    errors/
    validation/
  server/
    repositories/
    services/
    use-cases/
  tests/
docs/
  ARCHITECTURE.md
  DEVELOPMENT_GUIDE.md
  AI_AGENT_GUIDE.md
```

Keep feature-specific code inside `src/features/<feature>` and shared infrastructure inside `src/lib` or `src/server`. Avoid placing domain logic directly in pages or route handlers.

## Development Workflow

1. Read the issue, comments, metadata, and relevant code before editing.
2. Create a branch from the latest main branch using the naming rules in [docs/AI_AGENT_GUIDE.md](docs/AI_AGENT_GUIDE.md).
3. Make small, focused changes that match the existing architecture.
4. Run validation commands before finishing.
5. Open a pull request with a concise summary, testing notes, and any known risks.

## Technical References

- [Architecture](docs/ARCHITECTURE.md)
- [Development Guide](docs/DEVELOPMENT_GUIDE.md)
- [AI Agent Guide](docs/AI_AGENT_GUIDE.md)

