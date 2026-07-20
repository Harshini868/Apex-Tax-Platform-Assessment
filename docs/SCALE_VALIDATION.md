# Scale Validation

This document records the independently verified evidence for the scale dataset: what was measured, which command or test produced the evidence, and which claims remain unverified.

## 1. Generator Identity

| Property | Value | Evidence |
| :-- | :-- | :-- |
| Seed | `20260720` | `src/mock/scaleDataset.ts` (`scaleSeed`), consumed by `generateScaleDataset(scaleSeed)` |
| Generator version | `1.0.0` | `metadata.generatorVersion` in `src/mock/generateScaleDataset.ts` |
| Algorithm | Seeded linear congruential generator (`createRandom`) | `src/mock/generateScaleDataset.ts`; no `Math.random`, `crypto.randomUUID`, `Date.now`, `new Date()`, or third-party fake-data package used anywhere in the generator |
| Instantiation | Module-level constant, computed once at import | `src/mock/scaleDataset.ts` — `generateScaleDataset` runs exactly once when the module first loads, not per render |

## 2. Exact Generated Counts

| Entity | Required | Actual | Evidence |
| :-- | :-- | :-- | :-- |
| Returns | 300 | 300 | `scaleGenerator.test.ts` test 1 (`dataset.returns.length`) |
| Documents | 500 | 500 | same test (`dataset.documents.length`) |
| Tasks | 300 | 300 | same test (`dataset.tasks.length`) |
| Requests | 200 | 200 | same test (`dataset.requests.length`) |
| Messages | 300 | 300 | same test (`dataset.messages.length`) |
| Combined activities (tasks+requests+messages) | 800 | 800 | same test (`metadata.totalActivityCount`) |
| Documents linked to curated Rostova return | ≥260 | 260 (exact) | `scaleGenerator.test.ts` test 18 |

All `ScaleDatasetMetadata` fields (`returnCount`, `documentCount`, `taskCount`, `requestCount`, `messageCount`, `totalActivityCount`) are computed from `.length` of the actual generated arrays at the end of `generateScaleDataset`, not separately hardcoded — verified by reading `src/mock/generateScaleDataset.ts` directly.

## 3. Determinism

| Check | Result | Evidence |
| :-- | :-- | :-- |
| Same seed → deeply equal output | PASS | `scaleGenerator.test.ts` test 2 (`toEqual` deep-equality on two independent full generation runs) |
| Different seed → different output | PASS | test 3 (`generateScaleDataset(999999)` produces a different `clientName` at index 0) |
| No `Math.random` | CONFIRMED | source inspection + test 19 (two `createRandom(42)` instances produce identical sequences, proving it's not wall-clock/entropy-seeded) |
| No `Date.now()`/`new Date()` influencing values | CONFIRMED | source inspection — all dates are string-templated from loop indices against a fixed `2026-07-` base; `generatedAtLabel` is the literal `'2026-07-20T11:47:00Z'` |
| No third-party fake-data package | CONFIRMED | `generateScaleDataset.ts` imports only local domain types; `package.json` has no `faker`/`chance`/`casual` dependency |
| Unique IDs (returns, documents, all activities) | PASS | `scaleGenerator.test.ts` tests 4-6 (`Set` size equals array length in each case) |
| Curated Journey 1-3 fixtures untouched | PASS | test 20 (`initialReviewQueue.length === 7`, `initialCuratedReturn.clientName === 'John Miller'`); confirmed by inspection that `generateScaleDataset` never imports curated fixture modules |

## 4. Referential Integrity

| Relationship | Result | Evidence |
| :-- | :-- | :-- |
| `document.returnId` resolves (curated Rostova or a real generated return) | PASS | test 7 |
| `return.linkedDocumentIds` all resolve | PASS | test 8 |
| `return.linkedTaskIds` / `linkedRequestIds` / `linkedMessageIds` all resolve | PASS | tests 9-11 |
| `task.owner` / `request.owner` within valid enum | PASS | tests 12-13 |
| `message.visibility` within valid enum | PASS | test 14 |
| No generated document falsely links into curated Journey 1 field data | PASS | test 21 |

## 5. Required Distributions

| Distribution | Required minimum | Actual | Evidence |
| :-- | :-- | :-- | :-- |
| Reviewer-actionable returns | ≥100 | 105 | test 16 |
| Client-blocked returns | ≥40 | 45 | test 16 |
| Approved/completed returns | ≥30 | 35 | test 16 |
| Returns assigned to another reviewer | ≥20 | 45 (fixed — was 25, all client-blocked; see S7-02) | test 16 |
| Returns both reviewer-actionable AND assigned to another reviewer | (not independently required, but needed to prove Task 9's "labelled accurately" behavior) | ≥20 | test 22 (fixed — see S7-02) |
| All five warning severities present | required | CRITICAL, HIGH, MEDIUM, LOW, NONE all present | test 17 |
| All three stages present | required | Preparation, Review, Completed all present | test 15 |

## 6. Scale-Mode Product Surfaces

| Surface | Route | Verified behavior |
| :-- | :-- | :-- |
| Scale-mode reviewer queue | `/dashboard/reviewer?dataset=scale` | Operates on all 300 returns; filters (scope, status, severity, **owner** — added, see S7-04) and search run before pagination; 25 rows/page max; priority scoring shared with the guided queue (see S7-03) |
| Document explorer | `/return/ret-rostova-tech-1120s/documents?dataset=scale` | Operates on the 260 linked documents; five filters (search, category, review status, evidence state, **document type** — added, see S7-05) run before 25-row pagination; category hierarchy with accessible disclosure; connected-object trail to tasks/requests/messages |
| Generated return detail | `/return/scale-ret-####?dataset=scale` | Read-only; no Approve/Correct/Lock/Return-to-preparer controls exist in the component; explicit scale-fixture disclosure |
| Dual-source evidence (Rostova) | `/return/ret-rostova-tech-1120s?field=rostova-interest-expense&panel=evidence` | Both the December bank statement and the 1099-INT render as independent, data-driven, visually highlighted previews (fixed — see S7-07; previously unimplemented) |

## 7. Performance Evidence (honest, structural — not a measured claim)

Per the audit brief's explicit instruction not to infer user-perceived responsiveness from build time, gzip size, or passing jsdom tests, this section records only what was actually measured or is structurally true:

- 300 returns and 500 documents exist in memory as plain JS arrays (`scaleDataset.returns`/`.documents`), generated once at module load.
- The reviewer queue renders at most 25 rows per page (`PAGE_SIZE = 25` in `DashboardPage.tsx`); the document explorer renders at most 25 rows per page (`DOC_PAGE_SIZE = 25` in `DocumentExplorerPage.tsx`).
- Filtering, scoring, sorting, and pagination all run as plain synchronous `Array.filter`/`.map`/`.sort`/`.slice` calls against the in-memory arrays — no network request, no artificial delay, no external service.
- Source arrays (`scaleDataset.returns`/`.documents`/etc.) are never mutated by filtering — every filter/sort step returns a new array.
- Production build succeeds; bundle size after this audit's changes: `465.85 kB` JS (gzip `121.95 kB` before this audit's fixes) / no Vite chunk-size warning at any point in this session (default 500 kB threshold not reached; the threshold itself was not modified).
- No real-browser timing measurement was recorded during this validation; therefore, real-browser performance timing is not claimed as measured.

## 8. Test Suite Summary

- Tests before this audit: 122 (7 files).
- Tests after this audit: 130 (7 files, same file set — no new test files were needed; fixes and new tests were added to existing generator/integration test files).
- `npm run lint`: PASS. `npm run test:run`: PASS (130/130). `npm run build`: PASS. `npm audit --omit=dev`: PASS (0 vulnerabilities). No dependency changes.
