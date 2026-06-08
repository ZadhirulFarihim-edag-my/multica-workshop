# AI Agent Guide

This guide defines how AI agents should collaborate on the Multica Workshop repository.

## Read Requirements First

Before editing files:

1. Read the assigned issue description.
2. Read issue comments and metadata.
3. Inspect the relevant files in the repository.
4. Identify acceptance criteria and validation commands.
5. Check `git status --short` so user or agent changes are not overwritten.

Do not assume the issue body contains all context. Later comments may refine scope or identify blockers.

## Branch Naming

Use a branch name that identifies the issue and purpose:

```text
agent/<role>/<issue-key>-<short-topic>
```

Examples:

```text
agent/senior-architect/task-11-docs-guidelines
agent/frontend/task-21-dashboard-ui
agent/backend/task-34-project-api
```

If Multica checks out a branch automatically, continue on that branch unless the task explicitly requires a different one.

## Editing Rules

- Edit only files needed for the assigned task.
- Do not revert or overwrite unrelated user changes.
- Avoid broad refactors unless required for the issue.
- Keep generated artifacts, caches, and local IDE files out of commits.
- Prefer existing project patterns over new abstractions.
- Keep documentation and code aligned when behavior changes.

If another agent has modified the same file, read the file carefully and preserve their work.

## Commit Rules

Commit only intentional changes.

Before committing:

```bash
git status --short
git diff
```

Use concise commit messages:

```text
docs: define development workflow
feat: add task list route
fix: return 404 for missing task
```

Do not include secrets, tokens, local environment files, or unrelated workspace files.

## Pull Request Rules

When opening a PR, include:

- Issue key or issue link.
- Summary of changes.
- Validation commands and results.
- Screenshots or recordings for UI changes.
- Known risks, limitations, or follow-up items.

Do not mark the PR ready if validation failed unless the failure is unrelated and clearly explained.

## Validation Before Finishing

Run the smallest sufficient validation set for the change.

For code changes:

```bash
npm run lint
npm test
npm run build
```

For documentation-only changes:

```bash
git diff --check
```

Also read the edited docs once after writing them to catch broken links, inconsistent terminology, and stale commands.

## Avoid Unrelated File Changes

Agents must protect the working tree:

- Never run destructive git commands such as `git reset --hard` unless the user explicitly asks.
- Never delete files only because they are untracked.
- Do not format the whole repository unless formatting is the assigned task.
- Do not change lockfiles unless dependency changes require it.
- Do not edit IDE settings or local configuration unless requested.

If unrelated changes block the task, leave a concise issue comment explaining the conflict and ask for direction.

## Multi-Agent Collaboration

Use clear ownership:

- One agent owns one issue or sub-issue.
- Split large work into sub-issues by feature, API resource, or document.
- Avoid assigning two agents to the same file at the same time.
- Report blockers in the issue thread.
- Share PR URLs and validation results in comments.

When delegating, describe the exact expected output and constraints. Avoid vague requests such as "clean this up" without acceptance criteria.

## Task Delegation Workflow

Recommended flow:

1. Break the parent task into independent units.
2. Create sub-issues for parallel work when files and responsibilities do not overlap.
3. Keep dependent work in backlog until prerequisites are complete.
4. Have each agent post a concise result comment.
5. Review and merge one PR at a time when changes touch shared contracts.

Use issue metadata only for durable facts that future agents will repeatedly need, such as PR URLs, deploy URLs, external ticket links, or persistent blockers.

