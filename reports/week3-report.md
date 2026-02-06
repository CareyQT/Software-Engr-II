# Week 3: Requirements Elicitation
- Team report
  1. Goals planned for this week: None (since this is the first week).
  2. Team progress and issues:
     1. What team did:
        - Prepared the first presentation slides (problem, solution, features).
        - Conducted requirements elicitation and documented core needs.
        - Captured early technical constraints to guide architecture.
          - Validation needs deterministic rule evaluation, pushing toward a service boundary:
            - prerequisite checks must be reproducible across UI and API, so we avoid embedding logic in the UI.
          - Course data is relational (courses, offerings, prerequisites), suggesting a relational schema:
            - offerings and prerequisites reference courses by ID; data integrity matters for accurate validation.
          - Planner requires fast feedback during edits:
            - supports client–server split where UI stays responsive and server handles heavy validation.
     2. What worked:
        - Aligning early on problem scope and user needs.
     3. What team learned:
        - Clear requirements reduce rework in later design steps.
     4. Where team had trouble and where team is stuck:
        - Translating complex prereq rules into simple requirements language.
  3. Goals planned for next week:
     1. Draft software architecture outline (2 days).
     2. Draft software design outline (2 days).
     3. Expand process description and risks (2 days).

- Contributions of individual team members
  1. Abderrahmane Rhandouri
     1. Goals planned for this week: None (since this is the first week).
     2. Team progress and issues:
        1. What team member did:
           - Drafted presentation slides for problem, solution, and UX.
        - Noted UI needs for fast feedback during plan changes.
          - Implication: frontend must render validation results incrementally and keep course cards stateful.
          - Implication: UI needs a stable API contract for validation payloads and responses.
        2. What worked:
           - Rapid feedback on slide flow and visuals.
        3. What team member learned:
           - Keeping requirements user-focused improves clarity.
        4. Where team member had trouble and where team member is stuck:
           - Defining UI scope without overpromising.
     3. Goals planned for next week:
        1. Draft UI component outline (2 days).
        2. Refine user stories/use cases (1 day).

  2. Eduardo Balzan
     1. Goals planned for this week: None (since this is the first week).
     2. Team progress and issues:
        1. What team member did:
           - Led requirements elicitation and summarized technical constraints.
        - Highlighted data integrity requirements for prereq and offerings data.
          - Implication: enforce referential integrity and structured rule storage.
          - Implication: store raw prereq text to audit parsing accuracy.
        2. What worked:
           - Early alignment on architecture direction.
        3. What team member learned:
           - Need to separate MVP requirements from stretch ideas.
        4. Where team member had trouble and where team member is stuck:
           - Estimating prereq parsing complexity.
     3. Goals planned for next week:
        1. Draft architecture components and interfaces (2 days).
        2. Outline data model candidates (2 days).

  3. Quinn Carey
     1. Goals planned for this week: None (since this is the first week).
     2. Team progress and issues:
        1. What team member did:
           - Captured requirements notes and potential risks.
        - Identified testing implications from requirements (validation correctness, data drift).
          - Implication: need automated tests against known prereq cases and fixtures for offerings changes.
        2. What worked:
           - Structuring requirements by features and constraints.
        3. What team member learned:
           - Risks help guide testing priorities early.
        4. Where team member had trouble and where team member is stuck:
           - Determining the right level of requirement detail.
     3. Goals planned for next week:
        1. Draft initial test plan outline (2 days).
        2. Identify integration risks (1 day).
