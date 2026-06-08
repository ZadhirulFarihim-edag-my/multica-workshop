# Development Guide

This guide defines how engineers and AI agents should work in the Multica Workshop repository.

## Local Setup

Install Node.js 20 LTS or newer. Use the package manager implied by the committed lockfile. Until a lockfile exists, default to npm.

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run tests:

```bash
npm test
```

Run lint and formatting checks:

```bash
npm run lint
npm run format:check
```

If the project has not yet added these scripts, add them as part of the application scaffold before using them as release gates.

## Coding Standards

- Use TypeScript for application code.
- Prefer explicit types at module boundaries.
- Keep route handlers, pages, and components focused.
- Use constructor-style dependency injection or explicit function parameters for server services instead of hidden global coupling.
- Keep shared constants and helpers in `src/lib`.
- Keep feature-owned code in `src/features/<feature>`.
- Do not duplicate validation, API response shaping, or error mapping logic across routes.

## SOLID, DRY, KISS, and YAGNI

Apply these rules pragmatically:

- SOLID: Use clear module boundaries and depend on stable contracts.
- DRY: Centralize repeated validation, error handling, and API response helpers.
- KISS: Prefer straightforward functions and small modules over speculative abstractions.
- YAGNI: Do not add infrastructure, libraries, or patterns for future requirements that are not in scope.

## API Development

Route handlers should follow this flow:

1. Parse and validate input.
2. Call one use case or service function.
3. Map domain results to DTOs.
4. Return a consistent HTTP response.

Keep request and response types near the API contract. Keep persistence models private to the server layer.

Use stable response shapes:

```json
{
  "data": {}
}
```

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

## Frontend Development

- Prefer server components for data loading and static composition.
- Use client components only where interactivity is required.
- Keep accessible labels, keyboard behavior, and focus states in UI components.
- Put feature-specific UI in `src/features/<feature>/components`.
- Put reusable primitives in `src/components/ui`.
- Avoid direct database or server-only imports in client components.

## Environment Configuration

Validate environment variables at startup or first access. Keep secrets out of source control.

Recommended convention:

```text
.env.local        # local developer secrets, not committed
.env.example      # committed list of required keys without secret values
```

Document every required variable in `.env.example` when it is introduced.

## Testing Standards

Add tests for behavior changes, especially:

- Validation rules
- API status codes and response shapes
- Authorization decisions
- Domain use cases
- Important UI interactions

Prefer fast unit and component tests. Add end-to-end tests only for critical user journeys where integration risk is high.

## Validation Before Finishing

Before marking work complete, run the relevant commands:

```bash
npm run lint
npm test
npm run build
```

For documentation-only changes, verify file paths, links, command names, and consistency across docs.

## Commit Guidelines

Use small commits with clear messages:

```text
docs: add architecture and agent guides
feat: add project creation api
fix: handle missing project id
test: cover project validation
```

Do not commit generated files, local IDE settings, dependency caches, or unrelated changes.

After committing repository work, push the branch so reviewers and other agents can access the change. If the push cannot be completed because of authentication, permissions, remote conflicts, or validation failures, report that explicitly in the issue or pull request notes.

## Pull Request Guidelines

Each PR should include:

- What changed.
- Why it changed.
- How it was validated.
- Screenshots for UI changes.
- Any known risks or follow-up work.

Keep PRs focused. If a change touches multiple unrelated areas, split it into separate issues or PRs.
