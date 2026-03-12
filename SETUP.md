# Setup & Deployment

This document is intended for developers who want to run or deploy TermWise locally.

## Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- A PostgreSQL database available via `DATABASE_URL`

## 1. Clone the Repository

```bash
git clone https://github.com/CareyQT/Software-Engr-II.git
cd Software-Engr-II
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Configure Environment Variables

Create a `.env.local` file in the root of the project with the PostgreSQL connection string:

```
DATABASE_URL=postgres://user:password@localhost:5432/termwise
```

## 4. Run Locally

```bash
npm run dev
```

The app will be available at http://localhost:3000 or another port if 3000 is busy

## 5. Deployment

Build the application for your target platform:

```bash
npm run build
```

Apply the schema from [`src/schemas/postgres.sql`](src/schemas/postgres.sql) before using PostgreSQL-backed plan persistence.
