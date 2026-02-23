Week 7: Project Implementation and Data Ingestion

Team Report


Goals planned for this week:

Initialize the local development environment on new hardware.

Set up the PostgreSQL database schema based on the established ER diagram.

Initialize the Next.js frontend and create the base UI structure.

Build the initial backend API routes to connect the database to the application.

Team Progress and Issues:

What team did:

Environment Setup: Configured Node.js, PostgreSQL, and pgAdmin 4 to support local development.

Database & Backend (GANDOR): Created the Course, Offering, and Prerequisites tables using a reproducible schema.sql script and began backend integration.

Backend API (Quinn): Completed the initial API layer setup to handle course queries and plan validation.

Frontend (Eduardo): Completed the initial Next.js/React frontend setup, establishing the project structure for the Planner UI.


Data Ingestion: Successfully implemented and executed the seed_courses.js script to populate the database with core CS requirements like CS 161, 162, and 261.
+2

What worked:

The parallel workflow between Database/Backend, Backend API, and Frontend allowed for a faster "Vertical Slice" implementation.

Using .env.local ensured secure database connectivity across different local setups without committing sensitive credentials.

AI-supported documentation streamlined the reporting process, allowing the team to focus more on core technical implementation.

Where team had trouble:

Resolved initial framework configuration and TypeScript module resolution errors during the setup of the Next.js App Router.

Goals planned for next week:

Eduardo and Quinn will commit and push their respective setup branches for peer review.

Integrate the UI Search Box with the GET /courses API endpoint to display real-time data from the database.

Expand the database to include persistence tables like Plan and Plan_term.

2. Contributions of Individual Team Members
Abderrahmane Rhandouri (GANDOR) — Database & Backend

Goals planned for this week: Initialize project implementation and establish the core database.

What team member did:

Created the feat/initial-backend-setup branch and implemented the SQL schema for core project tables.

Developed the seed_courses.js script to automate the ingestion of the Computer Science core course subset from the OSU catalog .

Goals planned for next week: Build the UI search and filter components for the Course Explorer.

Eduardo Balzan — Frontend

Goals planned for this week: Initialize frontend setup and UI planning.

What team member did: Completed the initial Next.js/React project setup and component scaffolding for the planner UI.

Goals planned for next week: Push frontend code to the repository and begin UI integration with the backend.

Quinn Carey — Backend API

Goals planned for this week: Initial backend API setup and smoke testing.

What team member did: Developed the core API structure and established database connection protocols.

Goals planned for next week: Push API setup to the repository and implement unit tests for the course search route.