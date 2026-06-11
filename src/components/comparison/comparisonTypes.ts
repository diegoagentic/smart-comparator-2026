// Types aligned with the ai-python-strata-ack-comparison v2.1.0 contract.
// Demo-only: nothing here hits a real backend, but the shapes mirror the
// Python service so the UI maps 1:1 when integration happens later.

// --- Enums --------------------------------------------------------

/** Headline status badge — drives top-of-page color and copy. */
export type DerivedStatus =
    | 'EXACT_MATCH'
    | 'VERIFIED_WITH_MINOR_CHANGES'
    | 'REQUIRES_REVIEW'
    | 'CRITICAL_ISSUES'
    | 'PROCESSING_FAILED'

/** IN-199 LLM-derived business severity for a single discrepancy. */
export type BusinessSeverity = 'LOW' | 'MEDIUM' | 'HIGH'

/** Ack-level overall severity. */
export type OverallSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

/** What the routing engine recommends for the report as a whole. */
export type RoutingDecision = 'MANDATORY_REVIEW' | 'SUGGESTED_REVIEW' | 'AUTO_APPLY_ELIGIBLE'

/** Per-discrepancy LLM analysis status. */
export type AnalysisStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'SKIPPED'

/** User-facing decision on a comparison report. */
export type DecisionAction = 'ACCEPT' | 'REJECT' | 'REQUEST_REVIEW'

/** Email draft state machine. */
export type EmailDraftStatus = 'draft' | 'edited' | 'sent' | 'failed' | 'cancelled'

/** Field categories used to group discrepancies in the UI. */
export type DiscrepancyCategory = 'header' | 'line_item' | 'pricing' | 'logistics' | 'terms'

// --- Core data shapes ---------------------------------------------

export interface Discrepancy {
    id: string
    field_path: string          // e.g. "lineItems.5.quantity"
    field_label: string         // human label, e.g. "Line 5 Qty (Lounge)"
    category: DiscrepancyCategory
    po_value: string | number
    ack_value: string | number
    business_severity: BusinessSeverity
    llm_analysis: string        // LLM paragraph explaining what changed and why (fallback)
    /** One-line summary of what changed. Renders as the visual diff caption. */
    what_changed?: string
    /** 1-3 bullet points explaining the business impact. Bullets render as a
        list instead of the long llm_analysis paragraph. */
    why_it_matters?: string[]
    /** Supporting evidence the AI located while analyzing the docs — e.g.
        a back-order acknowledgement, a substitution memo, a revised quote.
        Shown at the top of the AI Analysis column with a one-line headline,
        a contextual sentence, and an optional link to the source document. */
    supporting_evidence?: {
        /** Short doc reference rendered as a hyperlink. e.g. "BO-7839A" */
        label: string
        /** Optional one-line context — what this evidence proves or contains.
            e.g. "covers the 9 remaining units with ETA Nov 25" */
        description?: string
        tone: 'positive' | 'warning' | 'info'
        /** Optional doc descriptor — when present, clicking the label opens
            the same floating PDF preview the View-originals buttons use. */
        doc?: {
            id: string
            name: string
            vendor: string
            type: string
        }
    }
    recommendation: string      // one-liner like "Backordered — accept partial"
    recommended_action: DecisionAction
    analysis_status: AnalysisStatus
    analysis_confidence: number // 0-100
}

export interface AckLevelSummary {
    what_changed_summary: string
    business_impact: {
        estimated_cost_impact: string   // "+$180 (2.2% increase)" or "-$2,095 (backorder)"
        timeline_impact: string         // "No impact" / "+12 days delay"
        risk_level: OverallSeverity
    }
    recommended_actions: Array<{
        action: string
        priority: number
        rationale: string
    }>
}

export interface ComparisonReport {
    report_id: number
    po_number: string
    ack_id: string
    vendor: string
    derived_status: DerivedStatus
    overall_similarity_score: number    // 0-1, render as %
    total_fields_compared: number
    run_number: number
    is_latest: boolean
    summary: AckLevelSummary
    discrepancies: Discrepancy[]
    /** Header-level fields the comparator inspected. Drives the "Fields" tab. */
    validated_fields?: ValidatedField[]
    /** Line items the comparator inspected. Drives the "Line Items" tab. */
    validated_line_items?: ValidatedLineItem[]
    routing: {
        routing_decision: RoutingDecision
        confidence_score: number        // 0-100
        rationale: string
        suggested_action?: DecisionAction
    }
    created_at: string                  // ISO 8601
}

// --- Validated detail panes -------------------------------------
// Surfaced through the "Fields" and "Line Items" tabs of the Review modal —
// these are the rows the comparator already verified (regardless of whether
// they ended up matched or as a discrepancy). For each item the UI shows
// PO value vs ACK value + a ✓/✗ marker so the user can audit at field level.

export interface ValidatedField {
    field_label: string
    category: DiscrepancyCategory
    po_value: string
    ack_value: string
    matched: boolean
}

export interface ValidatedLineItem {
    line: number
    product_number: string
    description: string
    po_quantity: number
    ack_quantity: number
    po_unit_price: string
    ack_unit_price: string
    matched: boolean
}

export interface EmailDraft {
    draft_id: number
    report_id: number
    subject: string
    body_text: string
    recipient_email: string
    recipient_type: 'manufacturer' | 'dealer'
    status: EmailDraftStatus
    include_discrepancy_ids: string[]
}
