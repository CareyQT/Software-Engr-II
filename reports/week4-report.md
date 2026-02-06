# Meeting Report: Architecture/Design Update

## Date

2026-01-29

## Attendees

- Abderrahmane Rhandouri
- Eduardo Balzan
- Quinn Carey

## Agenda

- Review new architecture section
- Review software design breakdown
- Confirm coding guidelines and commit standards
- Confirm process updates (risks, schedule, tests, docs)

## Discussion Summary

- Architecture defined as modular client–server with a validation boundary to keep data model decoupled from UI.
- Components clarified: Planner UI, REST API, validation engine, PostgreSQL database, ETL ingestion.
- Interfaces documented: UI ↔ API, API ↔ validator, API ↔ DB, ETL ↔ DB.
- Data model documented with high-level schema and diagram (courses, offerings, prerequisites, plans).
- Two architecture decisions and alternatives recorded (REST vs GraphQL, PostgreSQL vs document store).
- Design section mapped to concrete modules (planner/search components, API routes, validation parser/evaluator/explain, ETL schema/import/normalize).
- Coding guidelines confirmed:
  - TypeScript/JavaScript: TypeScript ESLint + Prettier
  - SQL: SQL Style Guide
  - Python (ETL): PEP 8
  - Commit messages: Conventional Commits v1.0.0
- Process description expanded:
  - Five risks with likelihood/impact/evidence/detection/mitigation and changes since requirements
  - Week 6–10 schedule in Typst table
  - Team structure, test plan, and documentation plan
  - Feedback incorporated: narrowed scope to curated course subset; added ETL data freshness checks

## Decisions

- Adopt client–server architecture with separate validation boundary.
- Use REST API and PostgreSQL for MVP.
- Enforce Conventional Commits for commit messages.

## Action Items

- Verify Typst rendering of schedule table and DB diagram.
- Confirm feedback text matches TA comments.
- Ensure report is ready for submission deadline.
