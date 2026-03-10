

# TermWise — OSU Course Planner

> A web application that helps Oregon State University students build valid, term-by-term academic plans with automatic prerequisite validation and course scheduling.
> 
## About the Project

Planning courses at OSU today means juggling the course catalog, the Schedule of Classes, and degree audit tools — all separately. TermWise offers a streamlined experience to all osu students. Instead of cross-examining a ton of tabs to create a plan, use TermWise to create your academic plan

Students can:
- Search for courses and drag them into Fall/Winter/Spring/Summer term columns
- Get real-time warnings when prerequisites aren't met or a course isn't offered in a given term
- Save and reload their plans
- Track credit load and estimate GPA

TermWise is **not** a replacement for official OSU registration, btw

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** v18 or higher — [nodejs.org](https://nodejs.org)
- **npm** v9 or higher (comes with Node)
- **Git**

Verify your versions:
```bash
node --version
npm --version
```

---

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/CareyQT/Software-Engr-II.git
cd Software-Engr-II
```

**2. Install dependencies**
```bash
npm install
```

---

### Running the App

**Development mode** (with hot reload):
```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

> **Troubleshooting port conflicts:** If port 3000 is in use, Next.js will automatically try 3001, 3002, etc. To explicitly set a port: `npm run dev -- -p 3001`

**Production build:**
```bash
npm run build
npm run start
```

**Run linter:**
```bash
npm run lint
```

**Run tests:**
```bash
npm run test
```
---


### Features
- **Course Explorer & Search** — Search and filter courses by subject, number, credits, or offered term
- **Drag-and-Drop Term Planner** — Arrange courses across Fall/Winter/Spring/Summer columns and see per-term credit totals
- **Prerequisite & Eligibility Validation** — Real-time warnings for unmet prerequisites; highlights the earliest eligible term for any course
- **Plan Persistence** — Save your plan and reload it later; supports multiple plans (Plan A, Plan B, etc.)
- **GPA Calculator** — Enter expected grades to estimate term and cumulative GPA

### Team

| Name | Role |
|---|---|
| Abderrahmane Rhandouri | DB lead and manager |
| Eduardo Balzan | FrontEnd Lead |
| Quinn Carey | Backend + QA/DevOps Lead |

- **Repo:** [github.com/CareyQT/Software-Engr-II](https://github.com/CareyQT/Software-Engr-II)
---

