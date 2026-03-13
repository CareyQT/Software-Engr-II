# Development Guide
 
This guide covers the project's development workflow, standards, and conventions.
 
---
 
## Table of Contents
 
- [Getting Started](#getting-started)
- [Branching Strategy](#branching-strategy)
- [Commit Structure](#commit-structure)
- [Pull Requests](#pull-requests)
- [Code Standards](#code-standards)
 
---
 
## Getting Started
 
Follow the instructions in the [`SETUP.MD`]
 
---
 
## Branching Strategy
 
This project follows a **trunk-based development** model:
 
- `main` is the only long-lived branch and is always deployable.
- All work happens in short-lived `feature/*` branches cut from `main`.
- Branches should be small in scope and merged quickly via pull request.
 
**Branch naming:**
 
```
feature/<short-description>
fix/<short-description>
chore/<short-description>
```
 
---
 
## Commit Structure
 
> 📄 Full details, examples, and troubleshooting are in [Commit_guide.md](./Commit_guide.md).
 
This project uses **Conventional Commits** for all commit messages.
 
### Format
 
```text
<type>(<scope>): <description>
```
 
### Quick Reference
 
| Type       | When to use                          |
|------------|--------------------------------------|
| `feat`     | New feature                          |
| `fix`      | Bug fix                              |
| `docs`     | Documentation changes                |
| `refactor` | Code restructuring, no behavior change |
| `test`     | Adding or updating tests             |
| `ci`       | CI/CD changes                        |
| `chore`    | Maintenance tasks                    |
 
### Key Rules
 
- Keep `type` and `scope` lowercase.
- Use imperative mood: `add`, `fix`, `update` — not `added` or `fixes`.
- Do not end the description with a period.
- Use specific scope names (`auth`, `viewer`, `deps`).
 
### Example
 
```bash
feat(auth): add oauth login
fix(viewer): prevent null model crash
```
 
For the full commit workflow, allowed types, and troubleshooting, see [Commit_guide.md](./Commit_guide.md).
 
---
 
## Pull Requests

All pull Requests should be reviewed and commented on by fellow developers before merging
 
- Open a PR from your `feature/*` branch into `main`.
- PRs should be small and focused — one concern per PR.
- Ensure all CI checks pass before requesting review.
- Use a descriptive title that mirrors the commit convention (e.g. `feat(auth): add oauth login`).
- Squash commits if the branch history is noisy before merging.
 
---

 
## Code Standards
 
- Follow the formatting rules enforced by the project linter/formatter.
- Do not commit commented-out code or debug statements.
- Write or update tests for any changed behaviour.
- Keep functions small and single-purpose.
- Use Prettier function to improve code structure
