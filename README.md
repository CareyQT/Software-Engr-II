# TermWise — OSU Course Planner

> A web application that helps Oregon State University students build valid, term-by-term academic plans with automatic prerequisite validation and course scheduling.

## About the Project

Planning courses at OSU today means juggling the course catalog, the Schedule of Classes, and degree audit tools — all separately. TermWise offers a streamlined experience to all OSU students. Instead of cross-examining a ton of tabs to create a plan, use TermWise to create your academic plan.

Students can:

- Search for courses and drag them into Fall/Winter/Spring/Summer term columns
- Get real-time warnings when prerequisites aren't met or a course isn't offered in a given term
- Save and reload their plans
- Track credit load and estimate GPA

> TermWise is **not** a replacement for official OSU registration.

---

## Getting Started

For end users, no installation is required — just visit:

**[https://termwise-474be.web.app/](https://termwise-474be.web.app/)**

For setup and local development instructions, see:

- [`INSTALL.md`](./INSTALL.md) — How to access and use the app
- [`SETUP.md`](./SETUP.md) — How to run or deploy the project locally(For Developers)

---

## Features

- **Course Explorer & Search** — Search and filter courses by subject, number, credits, or offered term
- **Drag-and-Drop Term Planner** — Arrange courses across Fall/Winter/Spring/Summer columns and see per-term credit totals
- **Prerequisite & Eligibility Validation** — Real-time warnings for unmet prerequisites; highlights the earliest eligible term for any course
- **Plan Persistence** — Save your plan and reload it later; supports multiple plans (Plan A, Plan B, etc.)
- **GPA Calculator** — Enter expected grades to estimate term and cumulative GPA

---

## Persistence Strategy

Plans are saved using a **two-layer hybrid approach**:

1. **localStorage (primary)** — Plans are written locally first for instant availability and offline support
2. **Firestore (cloud sync)** — Plans are simultaneously synced to the cloud so they persist across devices and browser clears
3. **Guest ID bridge** — If a user hasn't signed in, a UUID is generated and stored in `localStorage` to tag their Firestore plans. Plans are preserved even without an account, and can later be associated with a real user upon sign-up

### Course Catalog

The OSU course catalog and majors list live in **Firestore collections**, enabling real-time search directly from the cloud database without requiring a local ETL run.

**Firebase Auth** handles user sessions. **PostgreSQL** remains the source of truth for the prerequisite validation engine.

---

## Tech Stack

| Layer              | Technology                                             |
| ------------------ | ------------------------------------------------------ |
| Frontend           | Next.js 16 (React, TypeScript)                         |
| Styling            | Tailwind CSS v4, shadcn/ui                             |
| Authentication     | Firebase Auth                                          |
| Cloud Database     | Google Cloud Firestore (plans, course catalog, majors) |
| Local Persistence  | `localStorage` (offline-first, Guest ID bridge)        |
| Legacy / Server DB | PostgreSQL (prerequisite validation engine)            |
| ORM / Query        | `pg` (node-postgres connection pool)                   |
| Data Access Layer  | `plannerService.ts`, `persistenceService.ts`           |
| Validation         | Custom prerequisite engine (TypeScript)                |
| CI/CD              | GitHub Actions                                         |

---

## Team

| Name                   | Role                     |
| ---------------------- | ------------------------ |
| Abderrahmane Rhandouri | DB Lead and Manager      |
| Eduardo Balzan         | Frontend Lead            |
| Quinn Carey            | Backend + QA/DevOps Lead |

- **Repo:** [github.com/CareyQT/Software-Engr-II](https://github.com/CareyQT/Software-Engr-II)
