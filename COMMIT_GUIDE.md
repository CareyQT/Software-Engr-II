# Commit Guide

## Purpose

This guide defines commit conventions and how commits fit into the trunk-based workflow.

## Workflow Context

- `main` is the only long-lived branch.
- All work happens in short-lived `feature/*` branches.
- Changes land through PRs to `main`.

## Commit Message Format

Use Conventional Commits:

```text
<type>(<scope>): <description>
```

Examples:

```bash
feat(auth): add oauth login
fix(viewer): prevent null model crash
docs(readme): update setup section
ci(actions): add pr checks workflow
```

## Allowed Types

- `feat`: new feature
- `fix`: bug fix
- `docs`: documentation changes
- `style`: formatting/style-only changes
- `refactor`: code restructuring without behavior change
- `perf`: performance improvement
- `test`: tests added/updated
- `build`: build/tooling changes
- `ci`: CI/CD changes
- `chore`: maintenance tasks
- `revert`: revert previous commit

## Practical Rules

1. Keep `type` and `scope` lowercase.
2. Use imperative description (`add`, `fix`, `update`).
3. Do not end description with a period.
4. Prefer specific scope names (`auth`, `viewer`, `ci`, `deps`).

## Typical Developer Flow

```bash
# 1) Branch from main
git checkout main
git pull origin main
git checkout -b feature/your-change

# 2) Commit with conventional format
git add .
git commit -m "feat(viewer): add section filters"

# 3) Push and open PR
git push -u origin feature/your-change
```

## Troubleshooting

### Invalid commit message

Use the required format:

```text
type(scope): description
```

### Committed to wrong branch

Prefer safe history-preserving fixes:

- `git cherry-pick` to move commit
- `git revert` to undo shared commits
- Avoid `git reset --hard` on shared branches
