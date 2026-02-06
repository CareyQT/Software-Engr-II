# Week 4: Architecture, Design, and Process Update
- Team report
  1. Goals planned for this week:
     1. Draft software architecture section (2 days).
     2. Draft software design section (2 days).
     3. Update process description with risks/schedule/tests/docs (2 days).
  2. Team progress and issues:
     1. What team did:
        - Defined modular client–server architecture with a validation boundary.
          - Rationale: separates UI concerns from validation/data logic, enabling independent scaling and testing of the validation engine, and reducing coupling so UI changes don't impact data rules.
          - Rationale: REST boundary provides stable contracts for future clients (mobile/CLI) and simplifies caching of course/offering data.
        - Selected Next.js + React for the frontend.
          - Rationale: supports server rendering for faster initial load, file-based routing for predictable structure, and component-driven UI for planner interactions.
        - Selected TypeScript for the codebase.
          - Rationale: static typing reduces runtime errors in complex plan/validation payloads and improves maintainability of API contracts.
        - Selected a relational database (PostgreSQL).
          - Rationale: course/offering/prereq data is highly relational and benefits from joins, constraints, and migrations; supports consistent referential integrity.
        - Chose structured prerequisite rules stored as JSON AST alongside raw text.
          - Rationale: machine-evaluable rules enable deterministic validation while preserving original catalog text for traceability.
        - Documented components, interfaces, and data storage with a diagram.
        - Mapped software design to concrete modules and responsibilities.
        - Added coding guidelines and Conventional Commits reference.
        - Expanded process description (risks, schedule, team structure, tests, docs).
     2. What worked:
        - Dividing sections by ownership and reviewing together.
     3. What team learned:
        - Need for explicit data schema text alongside diagrams.
     4. Where team had trouble and where team is stuck:
        - Ensuring feedback is captured clearly and concisely.
  3. Goals planned for next week:
     1. Finalize DB diagram placement and schema text (1 day).
     2. Verify schedule table formatting in Typst (1 day).
     3. Prepare presentation speaking plan (2 days).

- Contributions of individual team members
  1. Abderrahmane Rhandouri
     1. Goals planned for this week:
        1. Draft UI-focused component breakdown (2 days).
     2. Team progress and issues:
        1. What team member did:
           - Drafted planner/search component responsibilities.
        2. What worked:
           - Clear mapping from use cases to UI components.
        3. What team member learned:
           - Needed tighter scope for MVP UI.
        4. Where team member had trouble and where team member is stuck:
           - Balancing detail vs brevity in design text.
     3. Goals planned for next week:
        1. Review DB diagram placement and captions (1 day).
        2. Prepare Database section for Week 6 presentation (2 days).

  2. Eduardo Balzan
     1. Goals planned for this week:
        1. Draft architecture and data storage content (2 days).
     2. Team progress and issues:
        1. What team member did:
           - Documented architecture decisions and alternatives.
        2. What worked:
           - Aligning API and validation boundaries early.
        3. What team member learned:
           - Need explicit data schema summary in text.
        4. Where team member had trouble and where team member is stuck:
           - Keeping process section concise while complete.
     3. Goals planned for next week:
        1. Verify schema text and diagram match (1 day).
        2. Prepare UI Design section for Week 6 presentation (2 days).

  3. Quinn Carey
     1. Goals planned for this week:
        1. Draft testing/process updates (2 days).
     2. Team progress and issues:
        1. What team member did:
           - Wrote test plan and documentation plan bullets.
        2. What worked:
           - Using risks to inform test coverage.
        3. What team member learned:
           - Clear linking of risks to mitigation improves readability.
        4. Where team member had trouble and where team member is stuck:
           - Ensuring all required risk fields were covered.
     3. Goals planned for next week:
        1. Review risks section for completeness (1 day).
        2. Prepare software architeture section for Week 6 presentation (2 days).
