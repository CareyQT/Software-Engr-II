# TermWise 1.0 — Release Notes

**Release:** 1.0  
**Date:** March 2026  
**Live URL:** [https://termwise-474be.web.app/](https://termwise-474be.web.app/)  
**Repository:** [github.com/CareyQT/Software-Engr-II](https://github.com/CareyQT/Software-Engr-II)

---

## How to Install and Run

TermWise is a web-based application hosted on Firebase. No local installation is required to use the app — simply visit the live URL above.

To deploy your own instance of the website and for personal development, follow the instructions in [`SETUP.md`](./SETUP.md)

---

## Working Features in 1.0

The following features are fully implemented and working in this release:

- **Course Search & Filtering** — Search and filter OSU courses by subject, number, credits, or offered term. Course catalog is served live from Firestore.
- **Drag-and-Drop Term Planner** — Drag courses into Fall/Winter/Spring/Summer term columns. Per-term credit totals update in real time.
- **Prerequisite Validation** — Real-time warnings are shown when prerequisites are unmet. The earliest eligible term for a course is highlighted automatically.
- **Plan Save & Reload** — Plans are saved via a two-layer hybrid (localStorage + Firestore cloud sync). Guest users are assigned a UUID so plans persist without an account. Multiple plans (Plan A, Plan B, etc.) are supported.

---

## Known Issues

| # | Feature | Description | Status |
|---|---------|-------------|--------|
| 1 | GPA Calculator | The GPA calculator feature is not functional in this release. Grade entry and GPA estimation are unavailable. | Open |

> **Note:** GitHub issues will be filed for all known bugs. See the [issue tracker](https://github.com/CareyQT/Software-Engr-II/issues) for the most up-to-date status.

---

## Notes & Limitations

- TermWise is **not** a replacement for official OSU registration tools.
- Plan data is tied to Firebase Auth accounts or guest UUIDs. Clearing browser storage without a signed-in account may result in loss of guest plans.
- The prerequisite validation engine is backed by a PostgreSQL database. If the database is unavailable, validation warnings will not appear.
