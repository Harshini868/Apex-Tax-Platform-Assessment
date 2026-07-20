# Technical Decision Record

Provisional frontend-only stack for this prototype. No application code, package file, or dependency has been installed yet — this record fixes the *intended* choices so implementation starts from a decision, not a scramble.

## 1. Provisional Stack

- Vite
- React
- TypeScript
- React Router (declarative mode)
- Tailwind CSS (via its official Vite plugin)
- Lucide React (icon library — see [[docs/INTERACTION_SYSTEM.md]] §1)
- React Context + `useReducer` for prototype state
- Deterministic TypeScript mock-data generators (curated Layer A + scale Layer B, see [[docs/DEMO_JOURNEYS.md]])
- Vitest
- React Testing Library
- Playwright
- axe integration for automated accessibility checks (see [[docs/FINAL_VALIDATION_REPORT.md]] §2 Accessibility)

**Exact package versions are not selected in this document.** Before scaffolding, run and record:
```
node --version
npm --version
git --version
```
Pick the newest stable versions of the above tools compatible with the reported Node/npm, at scaffold time — not now.

## 2. Dependency Rules

Do NOT:
- Use a backend.
- Use a database.
- Use an authentication provider.
- Use OCR.
- Use a real AI provider.
- Add a global state library (Redux, Zustand, Jotai, etc.) unless React state is demonstrably inadequate.
- Add a table or virtualization library until measurement shows a need.
- Add a broad UI framework (MUI, Ant, Chakra, etc.) solely for visual polish.

DO:
- Use native semantic HTML controls (`<button>`, `<dialog>`, `<input type="file">`, etc.) wherever they meet the interaction requirement.
- Add a focused accessible primitive (e.g., a small hand-rolled tooltip/popover/dialog component) only when implementing that behavior correctly by hand would otherwise consume disproportionate time relative to the deadline.

## 3. Architecture Decision Table

| Decision | Selected Option | Alternatives Rejected | Rationale | Risk | Reconsideration Trigger |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Build tool | Vite | CRA, Next.js | Fast dev server, no SSR complexity needed for a client-only prototype | Low | None expected |
| Language | TypeScript | Plain JS | Catches data-shape errors across the large mock dataset; evaluator-visible code quality | Slightly slower authoring | If deadline pressure makes typing a blocker, drop to loose types (`any` at edges), not to JS |
| Routing | React Router (declarative) | TanStack Router, hash-based routing | Matches deep-link/query-param navigation model in [[docs/INFORMATION_ARCHITECTURE.md]]; team familiarity | Low | None expected |
| Styling | Tailwind CSS (Vite plugin) | CSS Modules, styled-components | Fast iteration on the design tokens in [[docs/INTERACTION_SYSTEM.md]]; no runtime CSS-in-JS cost | Utility-class verbosity | If class lists become unreadable, extract component classes via `@apply` |
| Icons | Lucide React | Emoji, Font Awesome, Heroicons | Tree-shakeable SVGs, consistent stroke style, first-class `aria-label` support | Low | None expected |
| State management | React Context + `useReducer` | Redux, Zustand | Dataset size (300+ returns) fits in-memory; no cross-tab or persistence requirement | Context re-render cost at scale | If Layer B interactions measurably lag, split contexts or memoize before reaching for a library |
| Mock data | Deterministic TS generator functions, fixed seed | `faker.js`/`chance.js` | No dependency needed; reproducible; no real personal information risk | Slightly more upfront code | None expected |
| Testing | Vitest + RTL + Playwright + axe | Jest, Cypress | Vite-native unit testing; Playwright covers real browser + accessibility scans in one tool | Low | None expected |
| Document preview | Styled mock document panel (static image/frame) | pdf.js, react-pdf | Assessment explicitly says OCR/real parsing is out of scope; a styled frame is enough to prove the traceability interaction | Looks less "real" | Only revisit if evaluator feedback specifically asks for real PDF rendering |
| Split-pane layout | Fixed responsive summary/detail panes | Draggable resizer library | Removed because the accessibility cost is disproportionate for a non-required feature; the assessment requires summary-versus-detail, not resizing | Slightly less flexible layout | If evaluator feedback specifically asks for resizing, add a keyboard-operable resizer then |
