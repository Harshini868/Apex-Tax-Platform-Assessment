# Demo Script — Apex Tax Platform Prototype

> **Duration**: ~15–20 minutes for full walkthrough. ~8 minutes for abbreviated review.
> Start server with `npm run dev`, open `http://localhost:5173`.

---

## 0. Opening Setup (1 min)

1. Open `http://localhost:5173`
2. The app starts as **Preparer** role (default).
3. Point to the **"Preview as"** role selector in the top-right corner — explains the role-switching mechanism used throughout the demo.

---

## Journey 1 — Preparer Traceability & Verification (5 min)

### 1.1 Field Selection and Source Trace

**Role**: Preparer (default)

1. Navigate to `/return/ret-john-miller-1040?field=f1040-line1z` (or click "John Miller 1040" from the preparer dashboard and select the wages line).
2. **Point out**: The left panel shows the tax form outline. The active field (`Wages`) is highlighted with a purple AI-generated badge.
3. **Point out**: The right panel shows:
   - AI-generated value (`$98,700.00`) with confidence level
   - Source document name (`W-2 Box 1`)
   - Formula breakdown (how the value was calculated from the document)
   - The bounding-box highlight on the simulated document preview

**Challenge coverage**: 01 (Source Traceability), 08 (Clickable vs Editable), 10 (Trustworthy AI)

### 1.2 Correction Workflow

1. Click **"Correct value"** on the wages field panel.
2. Show: the input becomes editable; a "Replaces AI Value" warning badge appears.
3. Enter a different value and a correction reason.
4. Click **"Save correction"** — the badge updates to show "Override" state.

**Challenge coverage**: 08 (Clickable vs Editable), 10 (Trustworthy AI)

### 1.3 Reviewer Lock and Client Read-Only

1. Use the **"Preview as"** selector to switch to **Reviewer**.
2. Navigate to the same John Miller workspace.
3. **Point out**: The header shows "Reviewer Mode — Read Only". Fields are locked and non-editable.
4. Switch to **Client** role — same locked state; no correction button visible.

**Challenge coverage**: 05 (Role-Aware Experience)

---

## Journey 2 — Client Onboarding & Collaboration (5 min)

### 2.1 Client Dashboard — Where to Start

**Role**: Client

1. Switch to **Client** role using the role selector.
2. Navigate to `/dashboard/client`.
3. **Point out**: A single prominent action card at the top of the page — the dominant action directing the client to the active request ("John W-2 document needed").
4. **Point out**: The milestone stepper below the card shows the current position in the filing lifecycle.

**Challenge coverage**: 03 (Where to Start), 06 (Return Status)

### 2.2 Document Request and Submission

1. Click the dominant action card — it navigates to `/onboarding?step=required-information&request=req-john-w2`.
2. **Point out**: The URL contains the step and request parameters — demonstrates deep-linking (Challenge 04).
3. Show the document staging area: select a file (JPEG files are rejected; PNG/PDF accepted).
4. Click **"Submit"** — the request state updates to "Received" and the dashboard progress bar advances.

**Challenge coverage**: 02 (Collaboration), 04 (Getting Lost)

### 2.3 Client Collaboration Thread Isolation

1. Navigate to `/return/ret-rostova-tech-1120s?field=rostova-interest-expense&panel=review`.
2. Switch to **Client** role.
3. Open the collaboration panel — show only the **client-visible thread** is accessible.
4. Switch to **Reviewer** role — both the client thread AND the **firm-internal notes** thread are now visible.

**Challenge coverage**: 02 (Collaboration), 05 (Role-Aware Experience)

---

## Journey 3 — Senior Reviewer Workflow (5 min)

### 3.1 Reviewer Queue and Priority Sorting

**Role**: Reviewer

1. Switch to **Reviewer** and navigate to `/dashboard/reviewer`.
2. **Point out**: Returns are ranked by a priority score combining AI conflict severity, days overdue, and client-blocked status.
3. Use the **scope filter** (My Assigned / Team Queue) and the **status filter** to narrow the list.
4. Use the **search field** to find "Rostova" by client name.

**Challenge coverage**: 07 (Actionable Dashboard)

### 3.2 Dual-Source Evidence Conflict

1. Click the Rostova Tech return — opens `/return/ret-rostova-tech-1120s?field=rostova-interest-expense&panel=evidence`.
2. **Point out**: The Evidence panel shows **two independent source documents** side-by-side:
   - December bank statement
   - 1099-INT interest income certificate
3. Both values are highlighted and the AI explains the conflict between them.

**Challenge coverage**: 09 (Complexity Made Navigable), 10 (Trustworthy AI)

### 3.3 Checklist and Approval Decision

1. Switch to the **Review panel** (`?panel=review`).
2. Show the checklist — items that must be resolved before a decision can be made.
3. Mark checklist items as **"Accept"** one by one.
4. Click **"Approve Unchanged"** once all items are accepted — the return status changes to "Approved".

**Alternate path — Return to Preparer**:
1. Mark one item as **"Needs Correction"** and fill the decision reason text area.
2. Click **"Return to Preparer"** — status changes and the reason is recorded.

**Challenge coverage**: 07 (Actionable Dashboard), 08 (Clickable vs Editable)

---

## Scale Demonstration (3 min)

1. Navigate to `/dashboard/reviewer?dataset=scale` (or select "Scale (300)" from the dataset dropdown on the reviewer dashboard).
2. **Point out**: The queue now shows 300 generated returns with the same priority scoring.
3. Use the **Owner filter** to show only "Other Reviewer" assigned returns.
4. Use the **search** to find returns by client name.
5. Click a generated return — opens the read-only scale fixture view; shows the "Scale Dataset — Read Only" disclosure badge.
6. Navigate to `/return/ret-rostova-tech-1120s/documents?dataset=scale` — the document explorer with 260 linked documents, category accordion, and 5-panel filter system.

**Challenge coverage**: 07 (Actionable Dashboard), 09 (Complexity Made Navigable)

---

## Accessibility and Responsive Quick Note (1 min)

- Press `Tab` from any page — the skip link appears and is the first focus target.
- Resize the browser to 390px wide — the layout stacks to a single-column mobile view without horizontal scrolling.
- All 8 routes pass automated WCAG 2.1 AA axe scans (0 violations); color contrast corrections were applied during the defect-correction milestone.
