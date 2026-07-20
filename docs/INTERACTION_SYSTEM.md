# Interaction System & Affordance Specification

This document defines the visual design system tokens, behavioral language, state indicators, and accessibility principles to ensure consistent usability across all application screens.

## 1. Visual & Behavioral Indicators (No Color Alone)

To support accessibility (**WCAG 2.2 Level AA as an engineering objective** — targeted throughout implementation and checked with automated + manual passes per [[docs/QUALITY_GATES.md]]; not claimed as certified conformance before that testing occurs) and clarity, all states use a combination of **Color (Border/Background)**, **Icon (SVG, from a single consistent icon library — Lucide React, per [[docs/TECHNICAL_DECISIONS.md]])**, and **Text Labels**. Emoji characters are never used as production interface icons; every entry below names the SVG icon that replaces the emoji placeholder used in earlier drafts, and every icon-only control carries an accessible name (`aria-label` or adjacent visually-hidden text).

| State | Background / Border | Icon (SVG, Lucide) | Text Label / Tooltip | Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **Clickable** | Hover: Subtle outline change, shadow lift | Icon indicating target, per context | Tooltip on delay (hover) **and** on keyboard focus | Pointer changes to `pointer`; element is in tab order |
| **Editable** | Solid white background, light gray border | `Pencil` inside right of field | Tooltip: "Click to edit" | Standard text input focus |
| **Read-Only** | Solid light gray background | No icon | Visible label: "Read only field" | Selection copy only; still keyboard-focusable |
| **Locked** | Slate gray background, dotted border | `Lock` | Always-visible text "Locked" + reviewer name + verification timestamp (never tooltip-only); `aria-describedby` links to full explanation | Read-only semantics (not `disabled`); keyboard-focusable; a focusable info control reveals the full explanation on hover, focus, or activation |
| **AI-Generated** | Soft lavender background, light purple border | `Sparkles` | Badge: "AI Extracted" | Click, or keyboard Enter/Space, highlights source document |
| **Low-Confidence** | Light orange background, dashed border | `TriangleAlert` | Badge: "Low Confidence AI" | Triggers trace panel with explanation |
| **Verified** | Plain white background, thin green border | `CircleCheck` | Badge: "Verified" | Prevents auto-overwrite by AI |
| **Awaiting Review**| Soft yellow background, double border | `Clock` | Tooltip: "Awaiting Reviewer approval" | Editable only by Reviewers |
| **Requires Approval**| Soft amber background | `AlertCircle` | Tooltip: "Edits require manager approval"| Input blocked, requests approval log |
| **Client-Visible** | Transparent, standard styles | `Eye` | Tooltip: "Visible to client" | Standard chat/note input |
| **Internal-Only** | Soft teal outline/background | `EyeOff` | Badge: "Firm Internal Note" | Restricted to firm staff |
| **Blocked** | Soft red background, red left border | `Ban` | Badge: "Blocked: Waiting on Client" | Halts process; alerts user |
| **Completed** | Clean white / transparent | `CheckCheck` | Label: "Completed" | Success checklist checkmark |
| **Destructive** | Red text/outline on hover | `Trash2` | Tooltip: "Delete permanently" | Single clear confirmation dialog (see §4 — no typed-word confirmation; the prototype holds no real destructive data) |
| **Loading** | Shimmer animation (skeleton loader) | `LoaderCircle` (spin) | Text: "Loading document data..." | Block interactions during load; `aria-busy="true"` |
| **Empty State** | Dashed layout grid container | `FolderOpen` | Text: "No documents uploaded yet." | Display "Upload File" CTA button |
| **Error State** | Solid pink background, thick red border | `OctagonX` | Badge: "Calculation Error" | Prevent navigation until corrected |

### 1a. Tooltip & Popover Availability
Every tooltip and popover in this system (AI explanation, locked-field explanation, warning detail, etc.) must be reachable through **all three**: pointer hover, keyboard focus, and click/activation where the content also serves as a button. A tooltip is never the *only* source of information required to use the product — the state's badge/label text (see table above) always carries the minimum required meaning on its own; the tooltip/popover adds detail, it doesn't gate access to it.

### 1b. Focus Visibility
Focus outlines must remain visible at all times and must never be obscured by sticky headers, side drawers, or open dialogs. Sticky/fixed elements use `scroll-margin-top`/`scroll-padding-top` and z-index ordering that keeps the currently focused element's outline unobstructed and, where scrolled, brought into view.

### 1c. Dialog Focus Management
Every dialog (unsaved-changes warning, destructive-action confirmation, context-switch confirmation) must: move focus to the first focusable element inside the dialog on open; trap focus within the dialog while open; close on `Escape` where doing so is safe (not while an irreversible action is mid-flight); and restore focus to the control that opened it on close.

---

## 2. Dynamic Micro-Animations

- **Field Selection**: Smooth transition (`all 0.15s ease-in-out`) when clicking return fields. The side pane slides open from the right edge with a gentle ease-out effect.
- **Save Feedback**: When a value is verified or edited, the field shows a brief green highlight fade-out, accompanied by a checkmark badge transition.
- **Locking Animation**: Locking a field triggers a padlock icon rotate-in, and the input field opacity reduces smoothly.

---

## 3. Keyboard Navigation and Focus Behavior

To support keyboard-only operators (CPAs doing rapid entries):
- **Tab Focus**: Standard `tab` index traversal across editable cells in logical order (top-to-bottom, left-to-right).
- **AI Highlight Focus**: Focusing an AI-generated field using the keyboard triggers the side-by-side Trace Panel document zoom automatically.
- **Shortcuts**:
  - `Ctrl + Enter`: Save and verify current field.
  - `Ctrl + Shift + L`: Lock/Unlock field (Reviewers only).
  - `Esc`: Close trace panel or close open dialog modal.
  - `Ctrl + K`: Open Global Command search bar.

---

## 4. Confirmation Requirements

- **Destructive Actions** (e.g., deleting a client document or rejecting an overwrite): Displays a modal dialog (focus-managed per §1c) with a single clear confirm/cancel choice. No typed-word ("DELETE") confirmation — the prototype holds no real destructive data to justify that friction; reconsider only if a future scope adds genuinely irreversible, high-stakes data loss.
- **Unsaved Changes**: Navigating away from a form with unsaved overrides, or switching role/context (see [[docs/INFORMATION_ARCHITECTURE.md]]), triggers a blocking alert dialog requesting confirmation, focus-managed per §1c.
- **File Upload**: Drag-and-drop upload zones always expose a standard, keyboard-operable file-picker button alongside the drop target; drag-and-drop is never the only way to attach a file.

---

## 5. Accessibility (A11y) Design Rules

Target: **WCAG 2.2 Level AA**, treated as an engineering objective driving implementation and the checks in [[docs/QUALITY_GATES.md]] Gate 5 — not asserted as a certified conformance claim ahead of that testing.

1. **Contrast Ratio**: Text colors maintain at least a **4.5:1** contrast ratio against backgrounds (verified via CSS tooling).
2. **Aria Attributes**: All interactive icons have `aria-label` tags (e.g., `<Lock aria-label="Locked field" />`), never bare emoji.
3. **Screen Readers**: Layout tables use proper header scoping (`<th scope="col">`), and status warnings utilize `role="alert"` for direct notification.
4. **No color-only state**: every state in §1's table communicates through icon + text label in addition to color/border.
5. **Tooltip/popover reachability**: per §1a — hover, keyboard focus, and click/activation all work; no required information is hover-only.
6. **Focus visibility**: per §1b — never obscured by sticky headers, drawers, or dialogs.
7. **Dialog focus management**: per §1c — focus moves in, is trapped, closes on `Escape` where safe, and restores to the invoking control.
8. **Locked-field accessibility**: locked fields use read-only semantics (not `disabled`), remain keyboard-focusable, and expose their explanation via a focusable control with `aria-describedby` — never a hover-only tooltip on an inert element.
9. **File upload accessibility**: drag-and-drop always ships with a standard file-picker button (§4).
