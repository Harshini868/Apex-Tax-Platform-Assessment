# Quality Gates

Each gate below must be walked in order before proceeding to the next phase. A gate that fails stops forward progress until the stop condition is resolved.

## Gate 0 — Environment
- **Check**: `node --version`, `npm --version`, `git --version`; `git status` clean; confirm `assessment/` and `*.pdf` are listed in `.gitignore` and `git status` shows them ignored; `git ls-files | grep -i pdf` returns nothing tracked; no `.env`/secret files tracked.
- **Evidence**: terminal output of each command.
- **Pass criterion**: versions recorded in [[docs/TECHNICAL_DECISIONS.md]]; working tree clean; PDF and any secrets absent from tracked files.
- **Stop condition**: confidential PDF appears in `git status` or `git ls-files` — do not proceed; fix `.gitignore` / unstage before any commit.

## Gate 1 — Foundation
- **Check**: `tsc --noEmit`; lint script; `npm run build`; load each route in the dev server; load a nonexistent route.
- **Evidence**: clean TypeScript/lint/build output; screenshot or manual note of each route rendering.
- **Pass criterion**: zero type errors, zero lint errors, build succeeds, all routes render, invalid routes show a usable fallback (not a blank screen).
- **Stop condition**: build fails — do not move to journey work until fixed.

## Gate 2 — Primary Journeys
- **Check**: manually walk Journeys 1-3 from [[docs/DEMO_JOURNEYS.md]] by mouse, then again by keyboard only; refresh the browser mid-journey; open devtools console.
- **Evidence**: notes on what state persisted/reset on refresh (intentional, documented behavior either way); console log.
- **Pass criterion**: all three journeys complete by pointer and by keyboard; every state change is visibly reflected in the UI; refresh behavior is a deliberate, documented choice; no uncaught console errors.
- **Stop condition**: a journey cannot be completed by keyboard alone.

## Gate 3 — Ten-Challenge Coverage
- **Check**: walk [[docs/REQUIREMENTS_TRACEABILITY.md]] row by row; for each challenge, trigger its primary interaction and its edge/failure state.
- **Evidence**: a completed pass/fail note per requirement ID.
- **Pass criterion**: every requirement has visible UI evidence; every challenge (01-10) has at least one working interaction and one non-happy-path state demonstrated.
- **Stop condition**: any challenge has only a static display with no working interaction.

## Gate 4 — Scale
- **Check**: confirm the Layer B generator (see [[docs/DEMO_JOURNEYS.md]]) produces 300+ returns and 500+ documents on load; use the dashboard filters (owner/status/urgency) and document search against that dataset while watching frame timing/input responsiveness; switch the selected item in the document hierarchy and navigate away/back.
- **Evidence**: recorded count of generated records; note on filter/search responsiveness; note on whether selected context survived navigation.
- **Pass criterion**: 300+ returns and 500+ documents actually rendered; filter and search interactions stay responsive (no dropped input, no multi-second stalls); selected context does not reset unexpectedly.
- **Stop condition**: filtering/searching the scale dataset visibly stalls — measure before reaching for virtualization/pagination (see [[docs/TECHNICAL_DECISIONS.md]]), don't add it speculatively.

## Gate 5 — Accessibility
- **Check**: full keyboard-only walkthrough of all three journeys; visual check that focus is always visible, including under sticky headers/drawers/dialogs; open every dialog and confirm focus moves in, traps, closes on `Escape`, and restores; run an automated axe scan (Playwright + axe integration).
- **Evidence**: keyboard walkthrough notes; axe scan report/output.
- **Pass criterion**: keyboard walkthrough passes; focus always visible; dialog focus behavior correct; axe reports zero serious/critical violations; no state anywhere is communicated by color alone.
- **Stop condition**: any serious/critical axe violation, or any required information reachable only by hover.

## Gate 6 — Deployment
- **Check**: clean-clone the repo to a fresh directory and run the documented install/build/run commands exactly as written in the README; load the hosted deployment's routes directly (not just via in-app navigation); run `git log --all --full-history -- "*.pdf"` and `git ls-files` on the repo to confirm the confidential PDF never entered history.
- **Evidence**: terminal transcript of the clean-clone run; list of directly-loaded hosted routes and their result; PDF-history check output.
- **Pass criterion**: clean install succeeds, production build succeeds, hosted routes load directly (no 404 on refresh), README commands work as written, PDF is absent from repository history.
- **Stop condition**: the confidential PDF appears anywhere in `git log`/`git ls-files` history — treat as critical; do not publish the repository link until resolved (rewriting history or starting a clean repo, per candidate's judgment).
