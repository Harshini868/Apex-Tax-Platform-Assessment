# Demonstration Journeys and Fictional Environment

This document defines the fictional demo environment, characters, database state, and the walkthrough journeys for the prototype.

## 1. Fictional Environment Setup

### Fictional Accounting Firm
- **Name**: Apex Tax Solutions LLP
- **Target Clientele**: High-growth startups, small-to-medium businesses, and individual tech workers.

### Fictional Personas
1. **Firm Administrator (Sarah Jenkins)**: Manages firm setup, user roles, routing assignments, and overall system status.
2. **Tax Preparer (David Chen)**: Enters data, reviews AI extractions, communicates with clients, and performs initial calculations.
3. **Reviewer (Marcus Vance)**: Senior CPA who reviews David's work, resolves complex warnings, locks verified values, and signs off.
4. **Seasonal Staff Member (Emily Foster)**: Performs high-volume data entry, gathers missing client documents, and logs basic client answers.
5. **Individual Taxpayer (John Miller)**: W-2 employee with simple stock portfolios, first-time user of the online portal.
6. **Business-Owner Client (Elena Rostova)**: CEO of Rostova Tech Inc., owns multiple entities, has complex returns and many requests.

### Fictional Returns (At least Six)
1. **Return #1**: Rostova Tech Inc. (Form 1120-S) — **Stage**: Review (Status: Awaiting Reviewer Approval). Locked and verified elements present.
2. **Return #2**: Elena Rostova Personal (Form 1040) — **Stage**: Preparation (Status: Blocked by Client Action). Waiting on K-1.
3. **Return #3**: John Miller (Form 1040) — **Stage**: Preparation (Status: In Progress). Needs verification of AI W-2 extraction.
4. **Return #4**: Acme Retail LLC (Form 1065) — **Stage**: Onboarding (Status: Onboarding - Not Started).
5. **Return #5**: Zenith Properties (Form 1065) — **Stage**: Review (Status: Verification Warning). Name mismatch flags.
6. **Return #6**: Vanguard Logistics (Form 1120) — **Stage**: Completed (Status: Filed). Fully locked and signed off.

### Dataset Layers

This environment uses two dataset layers, not one:

- **A. Curated demo data** (below): 6-10 named returns, 8-15 named documents, authored personas, hand-written AI findings, messages, requests, blockers and edge cases. Used for Journeys 1-3 and the edge cases in Section 3.
- **B. Deterministic scale data**: at least 300 returns, 500 documents, and 800 combined tasks/requests/messages, with varied stages, owners, deadlines, risk states, and AI states. Generated synchronously in the browser from deterministic TypeScript functions on a fixed seed (no third-party fake-data package, no real personal information, no backend). Used to demonstrate Challenge 07 (dashboard at hundreds-of-returns scale) and Challenge 09 (document hierarchy/search/filter at hundreds-of-documents scale) so those flows are proven against real volume, not just the curated set.

### Fictional Source Documents (At least Eight)
1. `W2_John_Miller_2025.pdf` - (John Miller's main income document, clean extraction)
2. `1099B_John_Miller_Brokerage.pdf` - (John Miller's stock trades, multi-page, low-confidence extraction)
3. `1120S_Rostova_Tech_P1.pdf` - (Elena's corporate return primary financials, verified)
4. `Bank_Statement_Elena_Dec2025.pdf` - (Elena's personal bank statement, used as calculation evidence)
5. `K1_Elena_Rostova_Partnership.pdf` - (Elena's partnership income, missing initially)
6. `1099INT_Elena_Chase.pdf` - (Elena's interest income, matches bank records)
7. `W2_Emily_Foster_Seasonal.pdf` - (Emily's personal return W-2, test case for seasonal staff dual-identity)
8. `1098_Elena_Mortgage_Interest.pdf` - (Elena's home mortgage interest statements, conflicting name warnings)

---

## 2. Primary Demonstration Journeys

### Journey 1: CPA Prep & Trace (David Chen)
1. **Start**: David Chen logs into Apex Action Dashboard. Finds John Miller's return flagged "Preparation - Urgent" (filing deadline close).
2. **Open Workspace**: David clicks the return. The Workspace opens.
3. **Examine AI Field**: Under Wages (Form 1040, Line 1z), David spots a light-purple highlighted field showing `$152,500.00`. It is flagged as AI-extracted.
4. **Trace Source**: David clicks the wages field. Side-by-side splitscreen displays W-2 PDF preview on the right, automatically scrolling to W-2 Box 1, drawing a yellow bounding box around the value.
5. **Examine Calc**: David clicks "Formula Details" in the Trace Panel. UI shows: `W2_John_Miller_2025.pdf Box 1 ($152,500.00) = Wages ($152,500.00)`.
6. **Verify Value**: David clicks the green "Verify Value" button. The field background changes to white with a green checkmark badge, shifting status to "Verified".

### Journey 2: Client Onboarding & Navigation (John Miller)
1. **Start**: John Miller receives an email invitation and clicks the link. Logs in for the very first time.
2. **Onboarding Banner**: On screen, a clean banner displays: "Welcome John! Your preparer David needs 1 action to start your return." A giant button says "Provide Missing W-2 & Answer 1 Question."
3. **Navigate to Task**: John clicks the button. In 5 seconds, he is guided to the Task pane. The left pane shows the request details; the right shows a file uploader supporting both drag-and-drop and a standard keyboard-operable file-picker button (the drop zone is never the only way to attach a file).
4. **Respond Contextually**: Below the uploader is a question: "Did you hold crypto in 2025?" with a linked message thread from David. John selects "No" and uploads `W2_John_Miller_2025.pdf`.
5. **Verify Context Preservation**: Throughout the flow, the breadcrumbs at the top clearly read `Onboarding ⮞ Document Request #1 ⮞ Messaging`. John never feels lost.

### Journey 3: Reviewer Role Swap & Approval (Marcus Vance)
1. **Start**: Marcus Vance logs in. He sees a preparer's dashboard.
2. **Role Swap**: Marcus clicks the dropdown in the header and switches from "Preparer View" to "Reviewer View". The persistent role label in the header updates to "Reviewer", the sidebar navigation and permission-summary banner update accordingly, and the dashboard shows "Pending Review" returns. The product's color theme does not change; role is communicated through the label, nav, and permission summary, not by re-theming the shell.
3. **Inspect Blocked/Flagged Return**: Marcus clicks Rostova Tech Inc. The return has a yellow warning panel on "Interest Expense".
4. **Examine Internal Notes**: Marcus opens the Collaboration side panel. Under the "Firm Internal" tab (client cannot see this), David left a note: *"Elena claims bank fees are included in interest, needs verification. Client-visible chat says fees are separate. Check W-2/1099."*
5. **Review AI Uncertainty**: Marcus clicks the AI warning icon on the field. The AI popover states: *"Uncertainty: Value is 12% higher than interest reported in 1099INT."*
6. **Approve Correction**: Marcus reviews the bank statement, makes an override correction to the field to `$14,200.00`, and signs off the return. The field locks (cannot be edited by David).

---

## 3. Edge-Case Journeys (Evaluator-Focused)

### Edge Case 1: Conflicting Source Documents
- **Scenario**: Elena uploads two W-2s from the same employer with different totals. The AI flags a high-priority warning icon on the salary input. David clicks it and sees: *"Conflict: Value in Employer Copy ($98k) does not match Client Scan ($102k)."* David must message client directly from the field.

### Edge Case 2: Permission-Restricted Firm Note
- **Scenario**: Marcus Vance logs in as Client (Elena). He checks the Collaboration side panel. The "Firm Internal" tab is completely hidden, and any API requests targeting internal messages return a mockup authorization warning. No internal firm notes leak.

### Edge Case 3: Locked Verified Value
- **Scenario**: David Chen (preparer) attempts to edit the Rostova Tech "Interest Expense" field after Marcus (reviewer) has verified and locked it. The field is read-only (not a disabled control), shows visible "Locked" text with Marcus Vance's name and the verification timestamp, and exposes a keyboard-focusable info control (`aria-describedby`) that any pointer, keyboard, or screen-reader user can activate to read: *"Locked: Field verified by Marcus Vance on 2026-07-17. Edits require Manager override."*

### Edge Case 4: Unsaved Correction Attempt
- **Scenario**: David edits an AI-extracted field value. Before clicking "Save", he clicks "Back to Dashboard". The system intercepts the route, showing a modal warning: *"Unsaved Changes: You have unverified edits on Form 1040 Line 1. Discard or Save?"*

### Edge Case 5: Blocked Return Waiting on Client Action
- **Scenario**: David opens Zenith Properties. The header status reads "Blocked". Clicking the status displays a red indicator pointing to the "Client Tasks" sidebar: *"Zenith Properties 1099-B is missing."* The CPA dashboard shows this item as "Blocked - Action Owned by Client", preventing staff from wasting time on it.
