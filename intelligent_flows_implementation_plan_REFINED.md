# Intelligent Demo Flows: Refined Implementation Plan

> **Source:** PO Feedback (Intelligent Demo's Flows) + Original Tech Lead Plan
> **Scope:** UI-Dealer + Expert Hub simulation ecosystem
> **Constraints:** Maximum component reuse, Strata Design System (Light Mode), English UI, Sandbox Simulation pattern
> **Status:** REFINED — all gaps from PO feedback addressed

---

## Gap Analysis Summary (Original Plan vs PO Feedback)

### What the original plan gets RIGHT
- Component mapping for existing components (EmailSimulation, DealerMonitorKanban, ExpertHubTransactions, QuoteDetail, OrderDetail, AckDetail, ActionCenter, ServiceNowSimulation)
- Sandbox Simulation architecture (independent namespace, DemoContext, app-level routing)
- Core principles (Status as State, Agent Simulation, Context Switching)
- Two-Pane layout for HITL comparison views

### Critical gaps found

| # | Gap | Impact |
|---|-----|--------|
| G1 | **Flow 1 only has 4 demo steps** but PO describes 8 distinct stages | Missing: Normalization, Quote draft branching, Approval chain trigger, PO generation as separate step, Notification digests |
| G2 | **Flow 2 only has 3 demo steps** but PO describes 7 stages | Missing: Normalization, Auto-fix branching, Backorder generation with traceability, Approval chain, Notifications |
| G3 | **Flow 3 is completely absent** from DemoContext | No demo steps for Invoice/Bills, Shipment, MAC, or Warranty |
| G4 | **NotificationType enum is incomplete** | Missing: `shipment`, `backorder`, `warranty`, `mac`, `quote_update`, `po_created`, `ack_received` |
| G5 | **No agent chain visualization** standardized | Each agent step needs a card/timeline representation showing status transitions |
| G6 | **3-way match UI** not implemented | PO vs ACK vs Invoice side-by-side comparison needed for Flow 3A |
| G7 | **Backorder traceability view** not explicit | Need: what item, how much, ETA, impact on order |
| G8 | **MACRequestForm.tsx and MACOrchestratorDashboard.tsx** referenced but don't exist | MAC.tsx exists with MACRequests component, needs orchestrator extension |
| G9 | **OrderTracking.tsx** referenced but doesn't exist | Shipment timeline/stepper needs to be built or integrated into OrderDetail |
| G10 | **Carrier vs Mfg liability** recommendation UI missing in Warranty flow | WarrantyClaimArtifact exists but needs liability analysis panel |
| G11 | **Notification digests** not differentiated by persona | Dealer vs Expert get same notifications; PO requires priority-based expert digests |
| G12 | **Confidence score per field** not visualized | Normalization step needs field-level confidence indicators |
| G13 | **DocumentClassifierAgent** not mapped to any UI | Need document type detection and routing visualization |

---

## Core Architectural Principles (Unchanged + Additions)

1. **State Management & Orchestration:** Use centralized `DemoContext` to track current step. This state dictates which app context is active.
2. **Context Switching:** Global `Navbar` swaps branding, persona, and navigation based on active flow step.
3. **Status as State (Consequence):** UI statuses derived from simulated agent outputs or HITL actions. **Each agent step emits an event that updates order/quote/ACK status.**
4. **Agent Simulation:** Mock agents as async processes with loading → result transitions.
5. **[NEW] Agent Chain Visualization:** Standardized `AgentPipelineStrip` component showing sequential agent cards with status (pending → running → done → error).
6. **[NEW] Notification Persona Filtering:** ActionCenter must apply persona-based rules — Dealers get lifecycle updates, Experts get only exception/action digests.
7. **[NEW] OCR as Explicit UI Step:** When OCR/extraction runs, show visual progress with extracted fields and confidence overlays.

---

## DemoContext: Complete Step Registry

The current DemoContext has 7 steps across 2 flows. The refined plan requires **20 steps across 3 flows**.

### Updated `DEMO_STEPS` Definition

```typescript
export type SimulationApp =
  | 'dashboard' | 'expert-hub' | 'email-marketplace'
  | 'quote-po' | 'dealer-kanban' | 'service-now'
  | 'catalog' | 'survey' | 'ack-detail' | 'order-detail'
  | 'quote-detail' | 'transactions' | 'mac' | 'inventory';

const DEMO_STEPS: DemoStep[] = [
  // ═══════════════════════════════════════════
  // FLOW 1: Email Intake (RFQ → Quote → PO)
  // ═══════════════════════════════════════════
  {
    id: '1.1', groupId: 1,
    groupTitle: 'Flow 1: Email Intake',
    title: 'Email Ingestion',
    description: 'Dealer sends email with RFQ (text + PDF spec + CSV line items).',
    app: 'email-marketplace',
    role: 'Dealer',
    highlightId: 'email-rfq-incoming'
  },
  {
    id: '1.2', groupId: 1,
    groupTitle: 'Flow 1: Email Intake',
    title: 'AI Extraction & Parsing',
    description: 'OCR/TextExtract processes attachments. Parser extracts line items, quantities, finishes, ship-to, dates.',
    app: 'dealer-kanban',
    role: 'System',
    highlightId: 'kanban-ai-extraction'
  },
  {
    id: '1.3', groupId: 1,
    groupTitle: 'Flow 1: Email Intake',
    title: 'Normalization & Confidence',
    description: 'DataNormalizationAgent unifies data to RFQ/Quote Draft. Shows confidence score per field and missing fields list.',
    app: 'dealer-kanban',
    role: 'System',
    highlightId: 'kanban-normalization'
  },
  {
    id: '1.4', groupId: 1,
    groupTitle: 'Flow 1: Email Intake',
    title: 'Quote Draft Creation',
    description: 'High confidence → auto Quote draft. Low confidence or missing fields → "Needs Attention" task for Expert.',
    app: 'dealer-kanban',
    role: 'System',
    highlightId: 'kanban-quote-draft'
  },
  {
    id: '1.5', groupId: 1,
    groupTitle: 'Flow 1: Email Intake',
    title: 'Expert Review (HITL)',
    description: 'Expert sees discrepancies and missing fields in queue. Approves AI corrections or manually edits fields.',
    app: 'expert-hub',
    role: 'Expert',
    highlightId: 'expert-validation-row'
  },
  {
    id: '1.6', groupId: 1,
    groupTitle: 'Flow 1: Email Intake',
    title: 'Approval Chain',
    description: 'Total exceeds threshold or non-standard discounts detected → approval chain fires.',
    app: 'expert-hub',
    role: 'System',
    highlightId: 'approval-chain-progress'
  },
  {
    id: '1.7', groupId: 1,
    groupTitle: 'Flow 1: Email Intake',
    title: 'PO Generation',
    description: 'Quote approved → POBuilderAgent generates clean PO with mapped line items.',
    app: 'order-detail',
    role: 'Dealer',
    highlightId: 'po-generation'
  },
  {
    id: '1.8', groupId: 1,
    groupTitle: 'Flow 1: Email Intake',
    title: 'Smart Notifications',
    description: 'Dealer: "RFQ recibido, Quote listo, PO aprobado." Expert: only exceptions, digest by priority.',
    app: 'dashboard',
    role: 'Dealer',
    highlightId: 'action-center-notifications'
  },

  // ═══════════════════════════════════════════
  // FLOW 2: ERP Intake (ACK + Comparison)
  // ═══════════════════════════════════════════
  {
    id: '2.1', groupId: 2,
    groupTitle: 'Flow 2: ERP Intake',
    title: 'ERP Event Emission',
    description: 'ERP emits event: "ACK Created/Updated" (or EDI/855 translation by connector).',
    app: 'dashboard',
    role: 'System',
    highlightId: 'erp-ack-event'
  },
  {
    id: '2.2', groupId: 2,
    groupTitle: 'Flow 2: ERP Intake',
    title: 'Normalization & Linking',
    description: 'ACK normalized to standard model. Linked to original PO.',
    app: 'dealer-kanban',
    role: 'System',
    highlightId: 'kanban-ack-normalize'
  },
  {
    id: '2.3', groupId: 2,
    groupTitle: 'Flow 2: ERP Intake',
    title: 'PO vs ACK Delta Engine',
    description: 'Line-by-line comparison: substitutions, price changes, date changes, partial quantities.',
    app: 'dealer-kanban',
    role: 'System',
    highlightId: 'kanban-ack-match'
  },
  {
    id: '2.4', groupId: 2,
    groupTitle: 'Flow 2: ERP Intake',
    title: 'Auto-Fix / Expert Escalation',
    description: 'Within guardrails → auto-resolution proposed. Outside → Expert Hub task with context + recommendation.',
    app: 'expert-hub',
    role: 'Expert',
    highlightId: 'expert-ack-autofix'
  },
  {
    id: '2.5', groupId: 2,
    groupTitle: 'Flow 2: ERP Intake',
    title: 'Guided Correction',
    description: 'Two-Pane comparison (PO Original vs ACK Modified). Actions: Accept Substitute, Reject, Edit.',
    app: 'ack-detail',
    role: 'Expert',
    highlightId: 'expert-ack-fix'
  },
  {
    id: '2.6', groupId: 2,
    groupTitle: 'Flow 2: ERP Intake',
    title: 'Backorder Generation',
    description: 'Partial/delayed items → BackorderAgent creates backorder with traceability (item, qty, ETA, impact).',
    app: 'order-detail',
    role: 'System',
    highlightId: 'backorder-split'
  },
  {
    id: '2.7', groupId: 2,
    groupTitle: 'Flow 2: ERP Intake',
    title: 'Approval & Notifications',
    description: 'Cost/delivery impact → approval chain. Dealer: "ACK received, 2 exceptions, backorder created." Expert: actionable tasks only.',
    app: 'dashboard',
    role: 'Dealer',
    highlightId: 'action-center-ack-notify'
  },

  // ═══════════════════════════════════════════
  // FLOW 3: Document Intake (Post-PO Operations)
  // ═══════════════════════════════════════════
  {
    id: '3.1', groupId: 3,
    groupTitle: 'Flow 3: Document Intake',
    title: 'Document Upload & Classification',
    description: 'Dealer uploads SIF/PDF/CSV/XML/JSON. DocumentClassifierAgent identifies type: Invoice, BOL, ASN, MAC, Claim Evidence.',
    app: 'dealer-kanban',
    role: 'System',
    highlightId: 'doc-classification'
  },
  {
    id: '3.2', groupId: 3,
    groupTitle: 'Flow 3: Document Intake',
    title: 'Invoice / Bills (3-Way Match)',
    description: 'PO vs ACK vs Invoice comparison. Match → auto-create Invoice/Bill for approval. Mismatch → discrepancy + auto-fix proposal.',
    app: 'transactions',
    role: 'Expert',
    highlightId: 'three-way-match'
  },
  {
    id: '3.3', groupId: 3,
    groupTitle: 'Flow 3: Document Intake',
    title: 'Shipment Management',
    description: 'ASN/BOL/packing list parsed. Timeline updated with tracking, delays, partial shipments. Backorders generated if needed.',
    app: 'order-detail',
    role: 'Dealer',
    highlightId: 'shipment-timeline'
  },
  {
    id: '3.4', groupId: 3,
    groupTitle: 'Flow 3: Document Intake',
    title: 'MAC (Move/Add/Change)',
    description: 'MAC request ingested. Validated against inventory and active orders. Plan created with approval for scope/cost impact.',
    app: 'mac',
    role: 'Expert',
    highlightId: 'mac-orchestrator'
  },
  {
    id: '3.5', groupId: 3,
    groupTitle: 'Flow 3: Document Intake',
    title: 'Warranty Claims',
    description: 'Evidence (photos + text) + shipment/order reference. OCR extracts serials. Claim assembled with carrier vs mfg liability recommendation.',
    app: 'service-now',
    role: 'Dealer',
    highlightId: 'warranty-claim-package'
  },
];
```

**Changes from original DemoContext:**
- Flow 1: 4 steps → 8 steps (added Normalization, Quote draft branching, Approval chain, PO generation, Notifications)
- Flow 2: 3 steps → 7 steps (added Normalization/Linking, Auto-fix branching, Backorder generation, Approval & Notifications)
- Flow 3: 0 steps → 5 steps (entire new flow with Document classification, Invoice 3-way match, Shipment, MAC, Warranty)

---

## Flow 1: Email Intake (RFQ → Quote → PO + Approval Chain + Notifications)

### Agent Chain
```
EmailIntakeAgent → OCR/TextExtractAgent → ParserAgent → DataNormalizationAgent → ValidationAgent → QuoteBuilderAgent → POBuilderAgent → ApprovalOrchestratorAgent → NotificationAgent
```

### Step-by-Step Frontend Implementation

| Step | ID | Persona | Component | What to Build / Verify |
|------|-----|---------|-----------|----------------------|
| **Email Ingestion** | 1.1 | Dealer | [EmailSimulation.tsx](src/components/simulations/EmailSimulation.tsx) | **EXISTS.** Render email client UI. User clicks "Send" on RFQ email with PDF/CSV attachments. Fire transition to step 1.2. **Verify:** attachments visually indicate PDF + CSV icons. |
| **AI Extraction & Parsing** | 1.2 | System | [DealerMonitorKanban.tsx](src/components/simulations/DealerMonitorKanban.tsx) | **EXISTS.** Show agent cards (OCR, Parser) transitioning "Pending → In Progress → Done". **NEW:** Add `AgentPipelineStrip` showing `EmailIntakeAgent → OCR/TextExtractAgent → ParserAgent` in sequence. Display extracted payload preview (line items, quantities, finishes, ship-to, dates). |
| **Normalization & Confidence** | 1.3 | System | [DealerMonitorKanban.tsx](src/components/simulations/DealerMonitorKanban.tsx) | **NEW SECTION.** After extraction, show `DataNormalizationAgent` card. Display: (a) unified RFQ/Quote Draft object, (b) **confidence score per field** with color coding (green ≥90%, amber 70-89%, red <70%), (c) **missing fields list** highlighted in red. |
| **Quote Draft Creation** | 1.4 | System | [DealerMonitorKanban.tsx](src/components/simulations/DealerMonitorKanban.tsx) | **NEW SECTION.** Show `QuoteBuilderAgent` card. If confidence high → animate "Quote Draft Created" card with green status. If low → animate "Needs Attention" task card with amber/red status and route to Expert. |
| **Expert Review (HITL)** | 1.5 | Expert | [ExpertHubTransactions.tsx](src/components/simulations/ExpertHubTransactions.tsx) → drill into [QuoteDetail.tsx](src/QuoteDetail.tsx) | **EXISTS but ENHANCE.** ExpertHub shows "Needs Attention" queue entry. Click navigates to QuoteDetail in Expert Hub context. **NEW in QuoteDetail:** Discrepancy resolver panel showing (a) AI-suggested corrections with accept/reject per field, (b) missing fields with inline edit, (c) confidence score badges per field. Navbar switches to Expert Hub branding. |
| **Approval Chain** | 1.6 | System | **NEW: Approval Chain Modal/Panel** in Expert Hub context | **NEW COMPONENT NEEDED** (or extend existing modal). Show: (a) threshold that was exceeded (dollar amount or discount %), (b) sequential approver list with status (pending/approved/rejected), (c) progress bar. Can be a dedicated `ApprovalChainModal.tsx` or a section within the current detail view. |
| **PO Generation** | 1.7 | Dealer | [OrderDetail.tsx](src/OrderDetail.tsx) | **EXISTS.** Transition back to Dealer Portal context. Show generated PO (e.g., `#PO-1029`) with cleanly mapped line items. **Verify:** line items match the RFQ extraction (e.g., "125 Ergonomic Chairs"). Backorder split visible if applicable. |
| **Smart Notifications** | 1.8 | Both | [ActionCenter.tsx](src/components/notifications/ActionCenter.tsx) + Navbar badge | **EXISTS but ENHANCE.** Trigger 3 distinct notifications: (a) Dealer: "RFQ Received" → "Quote Ready for Review" → "PO Approved/Transmitted", (b) Expert: only the exception that was resolved, no spam. **NEW:** Add `quote_update`, `po_created` to `NotificationType`. Add priority-based digest grouping for Expert persona. |

### Capabilities Covered
- Quote/PO Creation
- Approval Chains
- Smart Notifications (persona-differentiated)
- Order Management (RFQ → Quote → PO with status progression)

---

## Flow 2: ERP Intake (eManage ONE / Seradex) → ACK + Comparison & Correction + Backorders

### Agent Chain
```
ERPConnectorAgent → DataNormalizationAgent → ACKIngestionAgent → POvsACKComparisonAgent → DiscrepancyResolverAgent → BackorderAgent → ApprovalOrchestratorAgent → NotificationAgent
```

### Step-by-Step Frontend Implementation

| Step | ID | Persona | Component | What to Build / Verify |
|------|-----|---------|-----------|----------------------|
| **ERP Event Emission** | 2.1 | System | [Dashboard.tsx](src/Dashboard.tsx) | **EXISTS.** Show simulated EDI/855 event in activity feed: "ACK Created/Updated from eManage ONE". **Verify:** event card shows ERP source badge and timestamp. |
| **Normalization & Linking** | 2.2 | System | [DealerMonitorKanban.tsx](src/components/simulations/DealerMonitorKanban.tsx) | **NEW SECTION.** Show `DataNormalizationAgent` + `ACKIngestionAgent` cards. Display: ACK normalized to standard model, linked to original PO (show PO reference #). Highlight: "ACK linked to PO-1029". |
| **PO vs ACK Delta Engine** | 2.3 | System | [DealerMonitorKanban.tsx](src/components/simulations/DealerMonitorKanban.tsx) | **EXISTS (partially).** Show `POvsACKComparisonAgent` running line-by-line comparison. **ENHANCE:** Visually flag each delta type with distinct icon/color: substitution (amber), price change (red), date change (blue), partial qty (indigo). Show delta count summary. |
| **Auto-Fix / Expert Escalation** | 2.4 | Expert | [ExpertHubTransactions.tsx](src/components/simulations/ExpertHubTransactions.tsx) | **NEW SECTION.** Show branching logic: (a) "Within guardrails" deltas → auto-resolved with green checkmark + explanation, (b) "Outside guardrails" deltas → task created in Expert queue with context + AI recommendation. Navigate to Expert Hub context. |
| **Guided Correction** | 2.5 | Expert | [AckDetail.tsx](src/AckDetail.tsx) | **EXISTS.** Two-Pane comparison (PO Original vs ACK Modified). **Verify:** Actions available: "Accept Substitute", "Reject", "Edit Date", "Override Price". Each line shows original vs modified values with diff highlighting. |
| **Backorder Generation** | 2.6 | System | [OrderDetail.tsx](src/OrderDetail.tsx) | **EXISTS (partially).** Show `BackorderAgent` splitting order lines: Fulfilled vs Backordered. **ENHANCE:** For each backordered line, show: (a) item name + SKU, (b) original qty vs fulfilled qty, (c) ETA, (d) impact statement (e.g., "Delays project completion by 5 days"). Add visual split with distinct sections. |
| **Approval & Notifications** | 2.7 | Dealer | [ActionCenter.tsx](src/components/notifications/ActionCenter.tsx) + [Dashboard.tsx](src/Dashboard.tsx) | **ENHANCE.** Dealer notifications: "ACK received", "2 exceptions resolved", "Backorder created for Line 2", "ETA updated to March 15". Expert: only actionable delta tasks. **NEW:** Add `ack_received`, `backorder` to `NotificationType`. |

### Capabilities Covered
- ACK Registration
- PO vs ACK Comparison & Discrepancy Correction
- Backorder Generation (with traceability)
- Approval Chains (cost/delivery impact triggers)
- Smart Notifications
- Order Management (status derived from real work)

---

## Flow 3: Document Intake (SIF/PDF/CSV/XML/JSON) → Invoice/Bills + Shipment + MAC + Warranty

### Agent Chain
```
DocumentIntakeAgent → OCR/TextExtractAgent → StructuredParserAgent → DocumentClassifierAgent → EntityLinkingAgent → [3-way Match Agent | ShipmentAgent | MACOrchestratorAgent | WarrantyAgent] → NotificationAgent
```

### Step 3.1: Document Upload & Classification

| Attribute | Detail |
|-----------|--------|
| **ID** | 3.1 |
| **Persona** | System |
| **Component** | [DealerMonitorKanban.tsx](src/components/simulations/DealerMonitorKanban.tsx) |
| **What to Build** | **NEW SECTION.** Show document upload simulation. `DocumentIntakeAgent` receives file → `OCR/TextExtractAgent` or `StructuredParserAgent` processes it → `DocumentClassifierAgent` identifies type (one of: Invoice, Bill, ASN, BOL, Packing List, Claim Evidence, MAC Request). Show classification result as a card with document type badge and routing indicator (→ "Routed to 3-Way Match", → "Routed to Shipment", etc.). `EntityLinkingAgent` links to Order/PO/Shipment with visual reference trail. |

### Step 3.2: Sub-Flow A — Invoice & Bills (3-Way Match)

| Attribute | Detail |
|-----------|--------|
| **ID** | 3.2 |
| **Persona** | Expert |
| **Component** | [Transactions.tsx](src/Transactions.tsx) (Expert Hub context) |
| **What to Build** | **NEW VIEW within Transactions.** Three-column comparison: PO (left) vs ACK (center) vs Invoice (right). Each column shows line items, amounts, taxes, shipping. Color-coded match indicators: green (match), red (mismatch), amber (partial). Below comparison: (a) if all match → "Invoice/Bill Created" with auto-approval routing, (b) if mismatch → discrepancy panel with auto-fix proposals (e.g., "Tax rounding difference of $0.03 — auto-fix recommended") and manual override option. **Reuse:** `DiscrepancyResolverArtifact` pattern for the mismatch resolution UI. |

### Step 3.3: Sub-Flow B — Shipment Management

| Attribute | Detail |
|-----------|--------|
| **ID** | 3.3 |
| **Persona** | Dealer |
| **Component** | [OrderDetail.tsx](src/OrderDetail.tsx) (Dealer Portal context) |
| **What to Build** | **ENHANCE existing OrderDetail.** Add shipment timeline section (stepper component) with milestones: Order Placed → In Production → Ready to Ship → Shipped → In Transit → Delivered. Parse uploaded BOL/ASN data to populate: tracking number, carrier, package count, expected delivery. `ShipmentAgent` calculates risks and shows: (a) delay warnings (red pill), (b) partial shipment indicators, (c) backorder generation link if partial. **Reuse:** Existing stepper/timeline pattern from OrderDetail's status section. **Note:** If the timeline section is too complex for OrderDetail, extract to an `OrderShipmentPanel.tsx` child component. No need for a separate `OrderTracking.tsx` page. |

### Step 3.4: Sub-Flow C — MAC (Move/Add/Change)

| Attribute | Detail |
|-----------|--------|
| **ID** | 3.4 |
| **Persona** | Expert |
| **Component** | [MAC.tsx](src/MAC.tsx) + [MACRequests.tsx](src/components/MACRequests.tsx) (Expert Hub context) |
| **What to Build** | **ENHANCE existing MAC page.** The MAC.tsx page already has tabs: Requests, Movements, Maintenance, Punch List. **Enhancements:** (a) In "Requests" tab, add an "AI Validated" badge column showing MACOrchestratorAgent results (validated against inventory, active orders, site rules), (b) Add expandable row detail showing: what's being moved, where, site constraints, dates, (c) Add "Plan" action that shows generated movement plan with tasks, (d) Add approval trigger when scope/cost is impacted (reuse ApprovalChainModal from Flow 1). **No need for separate MACRequestForm.tsx or MACOrchestratorDashboard.tsx** — extend existing MAC ecosystem instead. |

### Step 3.5: Sub-Flow D — Warranty Claims

| Attribute | Detail |
|-----------|--------|
| **ID** | 3.5 |
| **Persona** | Dealer (upload) → Expert (review) |
| **Component** | [ServiceNowSimulation.tsx](src/components/simulations/ServiceNowSimulation.tsx) (ITSM Portal context) |
| **What to Build** | **ENHANCE existing ServiceNow simulation.** Show: (a) Dealer uploads damage photos + text description, (b) OCR agent extracts serial numbers, labels, model info, detects damage type, (c) `WarrantyAgent` assembles complete claim package: evidence photos, linked shipment, line item reference, order dates, serial match, (d) **NEW: Liability Panel** — AI recommendation showing "Carrier Responsibility" vs "Manufacturer Responsibility" with confidence % and reasoning, (e) Expert reviews pre-packaged claim and clicks "Submit Claim". **Reuse:** `WarrantyClaimArtifact` for the claim assembly view. **Add:** Liability analysis section with carrier/mfg split indicator. |

### Capabilities Covered
- Invoice and Bills (3-way match: PO vs ACK vs Invoice)
- Shipment Management (timeline, delays, partial shipments)
- Warranty Claims (evidence, liability analysis)
- MAC Management (validation, movement plans)
- Cross-document Comparison & Auto-fix
- Approval Chains and Smart Notifications

---

## New Components Required

### Must Create

| Component | Location | Purpose |
|-----------|----------|---------|
| `AgentPipelineStrip.tsx` | `src/components/simulations/AgentPipelineStrip.tsx` | Horizontal strip showing agent chain with status transitions (pending → running → done). Reused across all 3 flows in DealerMonitorKanban. |
| `ApprovalChainModal.tsx` | `src/components/modals/ApprovalChainModal.tsx` | Shows threshold trigger, sequential approvers with status, progress bar. Used in Flow 1 (step 1.6), Flow 2 (step 2.7), Flow 3 (MAC/Invoice approvals). |
| `ConfidenceScoreBadge.tsx` | `src/components/widgets/ConfidenceScoreBadge.tsx` | Small badge showing confidence % with color (green/amber/red). Used in normalization steps across all flows. |
| `ThreeWayMatchView.tsx` | `src/components/widgets/ThreeWayMatchView.tsx` | Three-column comparison view (PO vs ACK vs Invoice) with match indicators. Used in Flow 3 step 3.2 within Transactions. |
| `BackorderTraceCard.tsx` | `src/components/widgets/BackorderTraceCard.tsx` | Card showing backordered item details: item, qty, ETA, impact. Used in Flow 2 step 2.6 within OrderDetail. |
| `LiabilityAnalysisPanel.tsx` | `src/components/widgets/LiabilityAnalysisPanel.tsx` | Carrier vs Manufacturer liability split with confidence % and reasoning. Used in Flow 3 step 3.5 within ServiceNowSimulation. |

### Extend Existing

| Component | Enhancement |
|-----------|-------------|
| `DealerMonitorKanban.tsx` | Add sections for: Normalization view, Quote draft branching, Document classification, ACK normalization/linking. Integrate `AgentPipelineStrip`. |
| `ExpertHubTransactions.tsx` | Add: "Needs Attention" queue with confidence badges, auto-fix result display, guardrail branching visual. |
| `ActionCenter.tsx` + `types.ts` + `data.ts` | Extend NotificationType enum. Add persona-based filtering. Add new mock notifications for all 3 flows. |
| `OrderDetail.tsx` | Add: Shipment timeline section, backorder traceability panel, fulfilled vs backordered split view. |
| `MAC.tsx` / `MACRequests.tsx` | Add: AI validation badges, expandable detail rows, movement plan view, approval trigger. |
| `ServiceNowSimulation.tsx` | Add: Photo upload simulation, OCR extraction display, claim package assembly, liability panel. |
| `Transactions.tsx` | Add: 3-way match view for Invoice/Bills sub-flow. |
| `QuoteDetail.tsx` | Add: Field-level confidence indicators, AI correction accept/reject per field. |

---

## Notification System Enhancements

### Updated NotificationType

```typescript
export type NotificationType =
  | 'discrepancy' | 'invoice' | 'payment' | 'approval'
  | 'system' | 'announcement' | 'live_chat'
  // NEW types for Intelligent Flows:
  | 'quote_update'    // Quote lifecycle: draft created, needs review, approved
  | 'po_created'      // PO generation events
  | 'ack_received'    // ACK ingestion events
  | 'backorder'       // Backorder creation/update
  | 'shipment'        // Shipment milestones and delays
  | 'warranty'        // Warranty claim events
  | 'mac';            // MAC request events
```

### Persona-Based Notification Rules

| Event | Dealer Sees | Expert Sees |
|-------|-------------|-------------|
| RFQ received | "RFQ received, processing..." | Nothing |
| Quote draft created (high confidence) | "Quote ready for review" | Nothing |
| Quote draft created (low confidence) | Nothing | "Needs Attention: Quote #X — 3 fields below confidence threshold" |
| Quote approved | "Quote #X approved" | "Exception resolved" (only if they were involved) |
| PO generated | "PO #X created and transmitted" | Nothing |
| ACK received | "ACK received for PO #X" | Nothing |
| ACK exceptions found | "2 exceptions found in ACK" | "Review: 2 discrepancies outside guardrails for PO #X" |
| Backorder created | "Backorder created: Item Y, ETA March 15" | Nothing (unless needs approval) |
| Invoice mismatch | Nothing | "3-way match failed: $0.03 tax variance on Invoice #Z" |
| Shipment delay | "Shipment delayed: new ETA April 2" | Nothing |
| Warranty claim ready | "Claim #W assembled — review recommended" | "Warranty claim ready for submission — carrier liability 78%" |
| MAC request validated | "MAC request processed" | "MAC plan ready: 3 movements, $2,400 impact — needs approval" |

---

## App.tsx Routing Updates

### New SimulationApp Entries
Add to `getSimulationConfig()`:

```typescript
case 'transactions':
  return {
    appName: 'Expert Hub',
    customNavigation: [
      { name: 'Home', page: 'dashboard', icon: HomeIcon },
      { name: 'Transactions', page: 'transactions', icon: BanknotesIcon },
      { name: 'Invoices', page: 'transactions', icon: DocumentTextIcon },
      { name: 'Analytics', page: 'dashboard', icon: ChartBarIcon },
    ]
  };
case 'mac':
  return {
    appName: 'Expert Hub',
    customNavigation: [
      { name: 'Home', page: 'dashboard', icon: HomeIcon },
      { name: 'MAC Requests', page: 'mac', icon: WrenchScrewdriverIcon },
      { name: 'Inventory', page: 'inventory', icon: CubeTransparentIcon },
      { name: 'Orders', page: 'order-detail', icon: ClipboardDocumentListIcon },
    ]
  };
case 'quote-detail':
  return {
    appName: 'Expert Hub',
    customNavigation: [
      { name: 'Home', page: 'dashboard', icon: HomeIcon },
      { name: 'Quotes', page: 'quote-detail', icon: DocumentTextIcon },
      { name: 'Orders', page: 'order-detail', icon: ClipboardDocumentListIcon },
      { name: 'Analytics', page: 'dashboard', icon: ChartBarIcon },
    ]
  };
case 'inventory':
  return {
    appName: 'Strata Dealer Portal',
    customNavigation: [
      { name: 'Dashboard', page: 'dashboard', icon: HomeIcon },
      { name: 'Inventory', page: 'inventory', icon: CubeTransparentIcon },
      { name: 'Shipments', page: 'order-detail', icon: TruckIcon },
      { name: 'Projects', page: 'dashboard', icon: FolderIcon },
    ]
  };
```

### New Simulation Renderers in `renderSimulation()`

```typescript
case 'transactions':
  return <Transactions onLogout={handleLogout} onNavigateToDetail={(type) => setCurrentPage(type as any)} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
case 'mac':
  return <MAC onLogout={handleLogout} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
case 'quote-detail':
  return <QuoteDetail onBack={() => setCurrentPage('transactions')} onLogout={handleLogout} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
case 'inventory':
  return <Inventory onLogout={handleLogout} onNavigateToDetail={() => setCurrentPage('detail')} onNavigateToWorkspace={() => setCurrentPage('workspace')} onNavigate={handleNavigate} />;
```

---

## Cross-Cutting Concerns (PO Feedback Adjustments)

### 1. Status as Consequence of Work
Every agent step emits a status event. The mapping:

| Agent Action | Status Update |
|-------------|---------------|
| EmailIntakeAgent processes RFQ | RFQ status: "Received → Processing" |
| OCR/Parser completes | RFQ status: "Processing → Extracted" |
| Normalization completes | Quote status: "Draft Created" |
| Expert approves corrections | Quote status: "Validated" |
| Approval chain passes | Quote status: "Approved" |
| POBuilderAgent generates PO | PO status: "Created" / Order status: "Received" |
| ACKIngestionAgent processes | ACK status: "Received" |
| POvsACKComparisonAgent completes | ACK status: "Matched" or "Discrepancy" |
| DiscrepancyResolver fixes | ACK status: "Resolved" |
| BackorderAgent creates | Order lines status: "Fulfilled" / "Backordered" |
| 3-way Match succeeds | Invoice status: "Matched → Pending Approval" |
| ShipmentAgent updates | Order status: "In Transit" / "Delayed" |
| WarrantyAgent assembles claim | Claim status: "Ready for Review" |
| MACOrchestrator validates | MAC status: "Validated → Pending Approval" |

### 2. OCR as Explicit Orchestrator Component
Show OCR processing as a visible step in the Kanban agent cards:
- Animated progress bar during "extraction"
- Extracted text preview with highlighted fields
- Confidence overlay per extracted region

### 3. HITL in Expert Hub — Queue System
Expert Hub must show a prioritized queue:
- High priority (red badge): confidence < 70%, rule violations, threshold exceeded
- Medium priority (amber badge): missing optional fields, date warnings
- Low priority (green badge): informational, auto-fixed items for review

### 4. Cross-Comparison (Transversal)
The comparison engine is used in multiple flows:
- **Flow 1:** Quote draft vs source email (validation)
- **Flow 2:** PO vs ACK (delta engine)
- **Flow 3A:** PO vs ACK vs Invoice (3-way match)
- Build as a **reusable comparison pattern** that accepts N sources and highlights deltas.

---

## Implementation Priority / Sequence

### Phase 1: Core Infrastructure (Week 1)
1. Update `DemoContext.tsx` with all 20 steps
2. Update `App.tsx` routing for new simulation apps
3. Create `AgentPipelineStrip.tsx`
4. Create `ConfidenceScoreBadge.tsx`
5. Create `ApprovalChainModal.tsx`
6. Extend `NotificationType` and add new mock notifications

### Phase 2: Flow 1 Complete (Week 2)
1. Enhance `DealerMonitorKanban.tsx` — normalization section, confidence display, quote draft branching
2. Enhance `ExpertHubTransactions.tsx` — needs attention queue with priority
3. Enhance `QuoteDetail.tsx` — field-level confidence, AI correction accept/reject
4. Integrate `ApprovalChainModal` into Flow 1
5. Enhance `ActionCenter` — persona-filtered notifications for Flow 1

### Phase 3: Flow 2 Complete (Week 3)
1. Enhance `DealerMonitorKanban.tsx` — ACK normalization/linking, delta engine visualization
2. Enhance `ExpertHubTransactions.tsx` — auto-fix branching, guardrail indicators
3. Verify `AckDetail.tsx` — Two-Pane comparison with all action types
4. Create `BackorderTraceCard.tsx` and integrate into `OrderDetail.tsx`
5. Enhance `ActionCenter` — Flow 2 notifications

### Phase 4: Flow 3 Complete (Week 4)
1. Enhance `DealerMonitorKanban.tsx` — document classification routing
2. Create `ThreeWayMatchView.tsx` and integrate into `Transactions.tsx`
3. Enhance `OrderDetail.tsx` — shipment timeline/stepper
4. Enhance `MAC.tsx` — AI validation, movement plans, approval trigger
5. Create `LiabilityAnalysisPanel.tsx` and enhance `ServiceNowSimulation.tsx`
6. Enhance `ActionCenter` — Flow 3 notifications

### Phase 5: Polish & Integration (Week 5)
1. End-to-end demo walkthrough testing (all 20 steps)
2. Verify Navbar context switching is seamless across all 3 flows
3. Verify notification persona filtering works correctly
4. Visual QA against Strata Design System rules (no forbidden colors, correct brand usage)
5. DemoSidebar updates to show 3 flow groups with sub-steps

---

## Design System Compliance Checklist

All new components MUST follow [DESIGN_SYSTEM_RULES.md](DESIGN_SYSTEM_RULES.md):

- [ ] No `lime-*`, `yellow-*`, `purple-*`, `violet-*`, `orange-*`, `emerald-*`, `cyan-*`, `sky-*`, `pink-*`, `rose-*`, `fuchsia-*`, `teal-*` classes
- [ ] Brand color: `bg-brand-300` (light) / `bg-brand-500` (dark) for primary actions
- [ ] No hardcoded hex colors (except chart configs using Strata token values)
- [ ] Dark mode variants for all color classes
- [ ] Text on brand backgrounds uses `text-zinc-900` or `text-black`
- [ ] Status colors follow mapping: green (success), amber (warning), red (error), blue (info)
- [ ] Run `npm run audit:tokens` with zero violations before committing

### Specific Token Usage for New Components

| Component | Primary Color | Status Colors |
|-----------|--------------|---------------|
| AgentPipelineStrip | `brand-400` for active agent | `green-*` done, `amber-*` running, `zinc-*` pending |
| ConfidenceScoreBadge | N/A | `green-*` ≥90%, `amber-*` 70-89%, `red-*` <70% |
| ApprovalChainModal | `brand-*` for approve action | `green-*` approved, `amber-*` pending, `red-*` rejected |
| ThreeWayMatchView | `zinc-*` neutral columns | `green-*` match, `red-*` mismatch, `amber-*` partial |
| BackorderTraceCard | `zinc-*` card bg | `red-*` delayed, `amber-*` partial, `blue-*` ETA info |
| LiabilityAnalysisPanel | `zinc-*` card bg | `red-*` carrier fault, `amber-*` mfg fault, `blue-*` pending |

---

## Verification Plan

### Per-Step Verification
For each of the 20 demo steps:
1. Navigate via DemoSidebar
2. Verify correct app context (Navbar branding + navigation)
3. Verify highlighted element matches `highlightId`
4. Verify status transitions are animated
5. Verify Next/Previous step navigation works

### Cross-Flow Verification
1. Complete Flow 1 → Flow 2 → Flow 3 sequentially without page reload
2. Verify ActionCenter shows correct accumulated notifications
3. Verify no stale state leaks between flows
4. Test DemoSidebar collapse/expand during flow execution

### Visual Verification
1. Run `npm run audit:tokens` — zero violations
2. Verify Light Mode appearance matches Strata DS guidelines
3. Verify all new components have dark mode variants
4. Check responsive behavior on 1440px (demo target) and 1920px screens
