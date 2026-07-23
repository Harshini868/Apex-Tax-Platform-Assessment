# Apex Tax Platform — AI-Powered Tax Review Prototype

> **Simulation Disclaimer**: This is an in-memory, simulated assessment prototype and is not a production-ready tax platform. All documents, returns, client data, and AI reasoning outputs are synthesised mock fixtures. No real tax engine, database, OCR service, or AI inference is used.

---

## Overview

This prototype demonstrates a multi-role, AI-assisted tax return review platform for the Apex Tax technical assessment. It covers ten challenge areas across three curated user journeys (Preparer, Client, Senior Reviewer) and a scalability demonstration with a 300-return generated dataset.

---

## Live Demo

**Production Deployment**: [https://apex-tax-platform-assessment.pages.dev/](https://apex-tax-platform-assessment.pages.dev/)

All identities, documents, tax data, uploaded-file metadata, and AI outputs shown in this prototype are fictional and simulated.

### Direct Workflow Links

- **Client dashboard**: [https://apex-tax-platform-assessment.pages.dev/dashboard/client](https://apex-tax-platform-assessment.pages.dev/dashboard/client)
- **Client onboarding**: [https://apex-tax-platform-assessment.pages.dev/onboarding?step=required-information&request=req-john-w2](https://apex-tax-platform-assessment.pages.dev/onboarding?step=required-information&request=req-john-w2)
- **Preparer traceability**: [https://apex-tax-platform-assessment.pages.dev/return/ret-john-miller-1040?field=f1040-line1z](https://apex-tax-platform-assessment.pages.dev/return/ret-john-miller-1040?field=f1040-line1z)
- **Reviewer workflow**: [https://apex-tax-platform-assessment.pages.dev/dashboard/reviewer](https://apex-tax-platform-assessment.pages.dev/dashboard/reviewer)
- **Scale dashboard**: [https://apex-tax-platform-assessment.pages.dev/dashboard/reviewer?dataset=scale](https://apex-tax-platform-assessment.pages.dev/dashboard/reviewer?dataset=scale)
- **Document Explorer**: [https://apex-tax-platform-assessment.pages.dev/return/ret-rostova-tech-1120s/documents?dataset=scale](https://apex-tax-platform-assessment.pages.dev/return/ret-rostova-tech-1120s/documents?dataset=scale)
- **Dual-source evidence**: [https://apex-tax-platform-assessment.pages.dev/return/ret-rostova-tech-1120s?field=rostova-interest-expense&panel=evidence](https://apex-tax-platform-assessment.pages.dev/return/ret-rostova-tech-1120s?field=rostova-interest-expense&panel=evidence)

---

## Quick Start

**Prerequisites**: Node.js ≥ 20 LTS, npm ≥ 10.

```bash
# 1 — Clean install
npm ci

# 2 — Start dev server (http://localhost:5173)
npm run dev

# 3 — Run all checks
npm run lint          # oxlint — 0 warnings, 0 errors expected
npm run test:run      # Vitest — 130/130 expected
npm run test:e2e      # Playwright — 23/23 expected
npm run test:a11y     # Playwright + axe — 8/8 routes expected

# 4 — Production build
npm run build

# 5 — Preview production bundle
npm run preview       # http://localhost:4173
```

---

## Application Entry Point

The app launches at `http://localhost:5173` in development. Use the **"Preview as"** role selector in the top navigation bar to switch between:

| Role | Description |
| :--- | :--- |
| **Preparer** | Edits and verifies fields; sees AI-generated values with source trace |
| **Client** | Reads onboarding status; submits documents; isolated from firm-internal notes |
| **Reviewer** | Approves, corrects, or returns cases; locks fields during review |

---

## Challenge Coverage

| # | Challenge | Prototype Feature | Routes |
| :-- | :--- | :--- | :--- |
| 01 | Source Traceability | Per-field AI reasoning panel with source document name, highlight bbox, and formula breakdown | `/return/ret-john-miller-1040` |
| 02 | Collaboration | Thread-based messages separated by visibility (client vs. firm-internal); in-memory request status updates | `/return/ret-rostova-tech-1120s`, `/onboarding` |
| 03 | Where to Start | Role-specific dashboard with dominant action card routing to active onboarding step | `/dashboard/client` |
| 04 | Getting Lost | Deep-link URL params (`?field=`, `?panel=`, `?step=`, `?request=`); document selection trail with connected-object breadcrumb | `/return/...`, `/onboarding` |
| 05 | Role-Aware Experience | Role-specific navigation and restricted controls, locked-field explanation, client tab isolation, and role-preview selector | All dashboards and workspaces |
| 06 | Return Status | Milestone stepper with next-action owner; client-facing timeline hides internal audit logs | `/dashboard/client` |
| 07 | Actionable Dashboard | Priority-scored reviewer queue with scope/status/severity/owner filters, search, and 25-row pagination | `/dashboard/reviewer` |
| 08 | Clickable vs Editable | AI-generated field badges; Reviewer lock state; approval/correction decision workflow with checklist | `/return/ret-john-miller-1040`, `/return/ret-rostova-tech-1120s` |
| 09 | Complexity Made Navigable | 260-document categorised explorer with search, five filters, hierarchy accordion, and 25-row pagination | `/return/ret-rostova-tech-1120s/documents` |
| 10 | Trustworthy AI | Explicit AI confidence, reasoning explanation, dual-source evidence comparison, and correction override badge | `/return/ret-rostova-tech-1120s?panel=evidence` |
| ∞ | Scale (bonus) | Seeded, deterministic 300-return / 500-document dataset; same quality gates; read-only generated detail | `/dashboard/reviewer?dataset=scale` |

---

## Key Routes

| Route | Description |
| :--- | :--- |
| `/dashboard/client` | Client's personalised home — active onboarding requests |
| `/dashboard/preparer` | Preparer's return list |
| `/dashboard/reviewer` | Reviewer's priority-sorted queue |
| `/dashboard/reviewer?dataset=scale` | Scale mode — 300-return paginated queue |
| `/onboarding?step=required-information&request=req-john-w2` | Client onboarding questionnaire with direct deep link |
| `/return/ret-john-miller-1040?field=f1040-line1z` | John Miller wages field — AI trace, correction workflow |
| `/return/ret-rostova-tech-1120s?field=rostova-interest-expense&panel=evidence` | Rostova dual-source AI evidence conflict |
| `/return/ret-rostova-tech-1120s?field=rostova-interest-expense&panel=review` | Reviewer checklist, approve/return-to-preparer decision |
| `/return/ret-rostova-tech-1120s/documents?dataset=scale` | Scale document explorer — 260 Rostova documents |

---

## Test Suite Summary

| Suite | Command | Result |
| :--- | :--- | :--- |
| Lint | `npm run lint` | 0 warnings, 0 errors (72 files, 95 rules) |
| Vitest unit | `npm run test:run` | 130 / 130 passed |
| Playwright E2E | `npm run test:e2e` | 23 / 23 passed |
| Playwright axe | `npm run test:a11y` | 8 / 8 routes — 0 automated violations for the selected WCAG 2.1 A/AA rules |
| Keyboard & responsive | Included in E2E | 5 viewports, skip link, focus order |

---

## Architecture Notes

- **Framework**: React 19, React Router 8, Tailwind CSS 4, Vite 8
- **State**: Context + `useReducer` (`AppContext` / `appReducer.ts`) — resets on reload
- **Routing**: `createBrowserRouter` with nested layouts for `preparer`, `reviewer`, `client`, and `scale` views
- **Data**: All fixtures are static TypeScript modules; no network requests at runtime
- **Scale generator**: Deterministic linear-congruential generator seeded at `20260720` (`src/mock/generateScaleDataset.ts`)
- **Accessibility**: Automated axe scans passed on 8 representative routes; keyboard, focus, and responsive smoke tests were also completed. This is not a formal WCAG conformance claim.

---

## Simulated Limitations

The following capabilities are intentionally out of scope for this prototype:

- No real tax calculation engine or IRS API integration
- No persistent database; state is lost on page reload
- No authentication or session management
- No real AI model — reasoning and confidence values are mock fixtures
- No real document upload, OCR, or file processing
- No real-time collaboration — messages are mock data
- Scale dataset returns are read-only (no approve/return-to-preparer actions)

---

## Project Structure

```
src/
  components/      # Shared UI components (workspace panels, collaboration, etc.)
  context/         # AppContext + appReducer — global state
  mock/            # Curated fixtures and scale dataset generator
  pages/           # Route-level page components
  types/           # TypeScript domain types
e2e/               # Playwright E2E and axe specs
docs/              # Requirements, validation reports, and screenshot evidence
docs/evidence/final/  # 12 required screenshot PNGs
```

---

## Evidence

- **Validation report**: [`docs/FINAL_VALIDATION_REPORT.md`](docs/FINAL_VALIDATION_REPORT.md)
- **Requirements audit**: [`docs/FINAL_REQUIREMENTS_AUDIT.md`](docs/FINAL_REQUIREMENTS_AUDIT.md)
- **Screenshots**: [`docs/evidence/final/`](docs/evidence/final/)
- **Scale validation**: [`docs/SCALE_VALIDATION.md`](docs/SCALE_VALIDATION.md)

## Known Limitations

- Secondary Client navigation is not gated until onboarding is complete; the primary guided onboarding action is fully interactive.
- Request, question, and thread context is URL-backed, but a universal side-drawer navigation pattern across all workspaces is not implemented.
- The connected-object trail is implemented in the scale Document Explorer but is not yet a universal navigation pattern throughout the application.
- A combined firm-employee and personal-return identity switch is not implemented; the available role selector is a prototype preview control.
- Role-specific navigation and action restrictions are implemented, but there is no universal permission-summary banner explicitly stating read-only or read-write access on every workspace.
- Client progress milestones are read-only and do not open a per-milestone audit history.
- AI conflict evidence is available through the evidence panel, but a separate warning-badge instruction popover is not implemented.
