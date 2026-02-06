Week 5: Presentation Planning
- Team report
  1. Goals planned for this week:
     1. Define Week 6 presentation outline (1 day).
     2. Assign speaking roles and transitions (1 day).
     3. Identify content gaps (1 day).
  2. Team progress and issues:
     1. What team did:
        - Defined speaker responsibilities for Week 6.
        - Agreed on presentation flow and handoffs.
        - Identified areas needing extra slides or visuals.
        - Aligned on technical narrative for architecture and stack decisions.
          - Client–server: separate planner UI from validation/data so the validator can be unit-tested with pure inputs, reused by future clients, and scaled independently from UI rendering.
          - REST API: stable contracts for plan validation and course queries; supports caching on read-heavy endpoints like `GET /courses`.
          - Next.js: server rendering reduces time-to-first-content for large course lists; file-based routing keeps planner/search/plan views consistent.
          - TypeScript: enforces schema correctness for plan payloads and validation responses; prevents runtime shape mismatches across UI/API.
          - Relational DB (PostgreSQL): many-to-many relationships (courses ↔ offerings ↔ prerequisites) require joins and referential integrity; constraints prevent orphaned prerequisite rows.
          - Structured prereq rules (JSON AST + raw text): AST enables deterministic evaluation; raw text preserves traceability to catalog sources.
     2. What worked:
        - Quick alignment by mapping speakers to sections.
     3. What team learned:
        - Transitions need explicit ownership to stay on time.
     4. Where team had trouble and where team is stuck:
        - Balancing depth of content with time constraints.
  3. Goals planned for next week:
     1. Draft slides per speaker segment (2 days).
     2. Run a short rehearsal and adjust timing (1 day).
     3. Finalize visuals and diagrams (2 days).

- Contributions of individual team members
  1. Abderrahmane Rhandouri
     1. Goals planned for this week:
        1. Draft UX/presentation flow outline (1 day).
     2. Team progress and issues:
        1. What team member did:
           - Claimed UX and planner flow segment.
        2. What worked:
           - Clear mapping of UI features to slides.
        3. What team member learned:
           - Shorter demos keep attention.
        4. Where team member had trouble and where team member is stuck:
           - Choosing which UI details to omit.
     3. Goals planned for next week:
        1. Draft UX slides and speaker notes (2 days).
        2. Collect screenshots or mockups (1 day).

  2. Eduardo Balzan
     1. Goals planned for this week:
        1. Draft architecture/design segment outline (1 day).
     2. Team progress and issues:
        1. What team member did:
           - Claimed architecture and data model segment.
        2. What worked:
           - Reusing architecture diagram and schema summary.
        3. What team member learned:
           - Need concise explanation of tradeoffs.
        4. Where team member had trouble and where team member is stuck:
           - Prioritizing which decisions to highlight.
     3. Goals planned for next week:
        1. Draft architecture slides and speaker notes (2 days).
        2. Verify diagram readability in slides (1 day).

  3. Quinn Carey
     1. Goals planned for this week:
        1. Draft testing/process segment outline (1 day).
     2. Team progress and issues:
        1. What team member did:
           - Claimed testing/process and risk summary segment.
        2. What worked:
           - Using risk items to justify test coverage.
        3. What team member learned:
           - Time-boxed walkthroughs improve clarity.
        4. Where team member had trouble and where team member is stuck:
           - Condensing process details into a few slides.
     3. Goals planned for next week:
        1. Draft testing/process slides and speaker notes (2 days).
        2. Rehearse timing with team (1 day).