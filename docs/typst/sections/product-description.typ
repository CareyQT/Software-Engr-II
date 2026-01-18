#let product-description = [
  == Goal
  Help OSU students create a valid, term-by-term class plan for an academic year (and beyond) by automatically applying constraints like prerequisites, co-requisites (where supported), and which terms a course is offered. The system should reduce planning mistakes and time spent cross-checking multiple OSU sites.
  
  == Current practice
  Today, students typically plan by manually consulting the OSU catalog for prerequisites, the Schedule of Classes for term offerings, and degree audit tools to estimate progress. This is slow, error-prone, and repetitive—especially when a student changes a plan and must re-check prerequisite chains and course availability across Fall/Winter/Spring/Summer. Existing tools often feel fragmented (catalog here, planner elsewhere, GPA tools elsewhere) and don’t provide immediate “this plan is invalid because…” feedback while building the schedule.
  
  == Novelty
  TermWise combines (1) a planner UI and (2) automated validation against prerequisite rules and term offerings in one place, with fast feedback as students build “what-if” schedules. Instead of searching course pages repeatedly, the app surfaces key constraints directly inside the planning workflow (warnings, unmet prereqs, next eligible term). The project is not trying to replace official registration; it targets the planning step before registration, where students need clarity and iteration speed.
  
  == Effects
  If successful, TermWise will help students:
  - Avoid delaying graduation due to missed prerequisites or missed once-per-year offerings
  - Build more balanced term credit loads and spot overload early
  - Reduce advisor meeting time spent on basic prerequisite/availability lookups
  - Make faster, more confident schedule decisions before registration windows open
  
  == Technical approach
  We will build a web application with:
  - Frontend: React/Next.js planner UI (drag-and-drop term columns, course search, plan summary)
  - Backend: REST API for courses, offerings, and plan validation
  - Database: relational storage (e.g., PostgreSQL) for course metadata, offering terms, and prerequisite structures
  - Data ingestion: a small ETL script that populates course data from public OSU sources (catalog + schedule listings) into our database
  - Validation engine: given a student’s completed courses + planned terms, compute unmet prerequisites and mark courses as eligible/ineligible per term
  
  (Exact tech choices may be adjusted based on team strengths and course expectations, but the architecture remains: UI + API + DB + ingestion + validator.)
  
  == Risks
  The most serious risk is accurately interpreting and validating prerequisite rules at the project scale and within time. OSU prerequisites are sometimes written in complex natural language (OR/AND groups, grade requirements, concurrent enrollment, placement tests).
  Mitigation:
  - Scope the first release to a well-defined subset (e.g., OSU Computer Science core + common electives) with test cases for each prereq pattern we support
  - Store prerequisites in a structured internal format (not only raw text), and manually curate edge cases for the subset
  - Add automated tests using real prerequisite strings from our supported course set to prevent regressions
  
  == Major features (MVP)
  - *Feature 1*: Course explorer and search
    - Search/filter by subject/number, credits, and offered terms (Fall/Winter/Spring/Summer where known)
  - *Feature 2*: Term-by-term planner
    - Drag/drop courses into term columns, see total credits per term, and reorder terms easily
  - *Feature 3*: Prerequisite and eligibility validation
    - Real-time warnings for unmet prerequisites; highlight the earliest eligible term for a selected course
  - *Feature 4*: Saved plans (persistence)
    - Store a user’s plan and completed courses; reload and edit later (basic accounts or local persistence acceptable for MVP)
  - *Feature 5*: Grade/GPA calculator (simple)
    - Let users enter expected grades and compute term GPA and cumulative GPA estimates
  
  == Stretch goals
  - *Stretch 1*: Auto-plan suggestions
    - Given constraints (max credits/term, target graduation term), generate a recommended sequence
  - *Stretch 2*: Degree progress tracking (limited)
    - For one major (starting with Computer Science), show requirement groups and completion status from the user’s plan
  - *Stretch 3*: Share/export
    - Export plan to PDF and/or share a read-only link for advisors/peers
  ]
