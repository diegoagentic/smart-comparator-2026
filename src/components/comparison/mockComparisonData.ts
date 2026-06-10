// Mock comparison reports for the demo. Adapted from the UI-Dealer
// mockReports.ts dataset (AIS Furniture / Steelcase) into the shape
// aligned with the Python contract (DerivedStatus, BusinessSeverity,
// LLM analysis text, routing decision, etc).
//
// Three reports cover the three derived-status colors a CEO walkthrough
// is likely to surface: REQUIRES_REVIEW (the main story), CRITICAL_ISSUES
// (escalation case), and EXACT_MATCH (happy path).

import type { ComparisonReport } from './comparisonTypes'

const AIS_REQUIRES_REVIEW: ComparisonReport = {
    report_id: 12345,
    po_number: 'PO-2055',
    ack_id: 'ACK-3099',
    vendor: 'AIS — Affordable Interior Systems',
    derived_status: 'REQUIRES_REVIEW',
    overall_similarity_score: 0.857,
    total_fields_compared: 42,
    run_number: 1,
    is_latest: true,
    summary: {
        what_changed_summary:
            'AIS confirmed your order but two line items shipped short of requested quantity, which pushes the ship date by 12 days and reduces the total amount by $2,095.',
        business_impact: {
            estimated_cost_impact: '-$2,095.39 (-7.6%)',
            timeline_impact: 'Ship date pushed +12 days',
            risk_level: 'MEDIUM',
        },
        recommended_actions: [
            { action: 'Confirm vendor ETA on backordered lounge units', priority: 1, rationale: 'Critical for Dec 1 install at Dallas site' },
            { action: 'Decide on partial acceptance for triple lockers', priority: 2, rationale: '2 of 8 units on allocation, ETA +3 weeks' },
            { action: 'Notify customer of revised total $25,398.72', priority: 3, rationale: '$2,095 delta requires change order acknowledgment' },
        ],
    },
    discrepancies: [
        {
            id: 'd-1',
            field_path: 'lineItems.5.quantity',
            field_label: 'Line 5 · Qty (Lounge 2-Seat)',
            category: 'line_item',
            po_value: 2,
            ack_value: 0,
            business_severity: 'HIGH',
            llm_analysis:
                'AIS confirms both Lounge 2-Seat units are on backorder. Vendor reports stock arriving Nov 27, 2025 — this is a separate shipment from the main delivery. Accepting this discrepancy means the install date for the lounge area moves to early December.',
            recommendation: 'Accept with split shipment',
            recommended_action: 'ACCEPT',
            analysis_status: 'COMPLETED',
            analysis_confidence: 92,
        },
        {
            id: 'd-2',
            field_path: 'lineItems.7.quantity',
            field_label: 'Line 7 · Qty (Triple Locker)',
            category: 'line_item',
            po_value: 8,
            ack_value: 6,
            business_severity: 'HIGH',
            llm_analysis:
                '2 of 8 triple lockers are on allocation. Vendor estimates the remaining units in 3 weeks. Suggest partial acceptance: take the 6 units now, request a follow-up shipment for the remaining 2.',
            recommendation: 'Accept partial — 6 of 8',
            recommended_action: 'REQUEST_REVIEW',
            analysis_status: 'COMPLETED',
            analysis_confidence: 88,
        },
        {
            id: 'd-3',
            field_path: 'financials.totalAmount',
            field_label: 'Total Amount',
            category: 'pricing',
            po_value: '$27,494.11',
            ack_value: '$25,398.72',
            business_severity: 'HIGH',
            llm_analysis:
                'The -$2,095.39 delta is driven entirely by the backordered line items. Once the second shipment arrives, the original total will reconcile. No unit-price changes detected.',
            recommendation: 'Will reconcile on backorder shipment',
            recommended_action: 'ACCEPT',
            analysis_status: 'COMPLETED',
            analysis_confidence: 96,
        },
        {
            id: 'd-4',
            field_path: 'logistics.estimatedShipDate',
            field_label: 'Estimated Ship Date',
            category: 'logistics',
            po_value: 'Nov 15, 2025',
            ack_value: 'Nov 27, 2025',
            business_severity: 'MEDIUM',
            llm_analysis:
                '12-day delay due to the backordered items. Within the tolerance window for the Dec 1 install date, but tight. Worth confirming the lounge backorder ETA before committing.',
            recommendation: 'Confirm vendor ETA',
            recommended_action: 'REQUEST_REVIEW',
            analysis_status: 'COMPLETED',
            analysis_confidence: 90,
        },
        {
            id: 'd-5',
            field_path: 'lineItems.5.finish',
            field_label: 'Line 5 · Finish (Lounge)',
            category: 'line_item',
            po_value: 'Ocean Blue',
            ack_value: 'Azure Blue',
            business_severity: 'LOW',
            llm_analysis:
                'Manufacturer substituted Ocean Blue with Azure Blue — same fabric grade, no price impact. This kind of color sub is common when a specific dye lot is unavailable.',
            recommendation: 'Acceptable color substitution',
            recommended_action: 'ACCEPT',
            analysis_status: 'COMPLETED',
            analysis_confidence: 95,
        },
    ],
    routing: {
        routing_decision: 'SUGGESTED_REVIEW',
        confidence_score: 72,
        rationale: 'Confidence below auto-apply threshold (80%) due to two HIGH-severity quantity changes; manual review recommended but not blocking.',
        suggested_action: 'ACCEPT',
    },
    created_at: '2026-04-10T08:42:00Z',
}

const STEELCASE_CRITICAL: ComparisonReport = {
    report_id: 12346,
    po_number: 'PO-1027',
    ack_id: 'ACK-7839',
    vendor: 'Steelcase',
    derived_status: 'CRITICAL_ISSUES',
    overall_similarity_score: 0.624,
    total_fields_compared: 38,
    run_number: 1,
    is_latest: true,
    summary: {
        what_changed_summary:
            'Steelcase shipped 3 of 12 task chairs and changed the model from Series 2 to Amia, which is a significant downgrade. Pricing is the same. This requires immediate intervention.',
        business_impact: {
            estimated_cost_impact: '$0 (same total)',
            timeline_impact: '+30 days for the missing 9 units',
            risk_level: 'HIGH',
        },
        recommended_actions: [
            { action: 'Reject the model substitution', priority: 1, rationale: 'Amia is one tier below the spec sold to customer' },
            { action: 'Escalate to vendor account manager', priority: 2, rationale: 'Significant short ship and unauthorized substitution' },
        ],
    },
    discrepancies: [
        {
            id: 'd-1',
            field_path: 'lineItems.1.productNumber',
            field_label: 'Line 1 · Product (Task Chair)',
            category: 'line_item',
            po_value: 'Series 2 (442A1B)',
            ack_value: 'Amia (482A1B)',
            business_severity: 'HIGH',
            llm_analysis:
                'Steelcase substituted Series 2 with Amia without prior authorization. Amia is one product tier below Series 2 in their lineup. The customer specced Series 2 specifically for the ergonomic adjustability — Amia lacks the same lumbar support feature.',
            recommendation: 'Reject substitution',
            recommended_action: 'REJECT',
            analysis_status: 'COMPLETED',
            analysis_confidence: 98,
        },
        {
            id: 'd-2',
            field_path: 'lineItems.1.quantity',
            field_label: 'Line 1 · Qty (Task Chair)',
            category: 'line_item',
            po_value: 12,
            ack_value: 3,
            business_severity: 'HIGH',
            llm_analysis:
                'Only 3 of 12 chairs shipped. Steelcase notes the remaining 9 are in production with a 30-day lead time. Combined with the unauthorized model swap, this is a serious vendor compliance issue.',
            recommendation: 'Reject and re-quote',
            recommended_action: 'REJECT',
            analysis_status: 'COMPLETED',
            analysis_confidence: 95,
        },
    ],
    routing: {
        routing_decision: 'MANDATORY_REVIEW',
        confidence_score: 35,
        rationale: 'Two HIGH-severity issues including an unauthorized product substitution. Mandatory user review before any action.',
        suggested_action: 'REJECT',
    },
    created_at: '2026-04-09T14:30:00Z',
}

const ERGOTRON_EXACT: ComparisonReport = {
    report_id: 12347,
    po_number: 'PO-330357',
    ack_id: 'ACK-330357',
    vendor: 'ergotron',
    derived_status: 'EXACT_MATCH',
    overall_similarity_score: 1.0,
    total_fields_compared: 28,
    run_number: 1,
    is_latest: true,
    summary: {
        what_changed_summary:
            'ergotron confirmed all line items, quantities, pricing, and ship date exactly as ordered. Nothing requires your attention — ready to apply.',
        business_impact: {
            estimated_cost_impact: '$0 (exact match)',
            timeline_impact: 'On schedule',
            risk_level: 'LOW',
        },
        recommended_actions: [
            { action: 'Auto-apply ACK to records', priority: 1, rationale: 'No discrepancies detected; vendor confirmation is clean' },
        ],
    },
    discrepancies: [],
    routing: {
        routing_decision: 'AUTO_APPLY_ELIGIBLE',
        confidence_score: 100,
        rationale: 'Perfect match across all 28 fields. Eligible for automatic acceptance.',
        suggested_action: 'ACCEPT',
    },
    created_at: '2026-04-08T11:15:00Z',
}

// Keyed by `${po_number}::${ack_id}` for easy lookup from launchers.
export const MOCK_COMPARISON_REPORTS: Record<string, ComparisonReport> = {
    'PO-2055::ACK-3099': AIS_REQUIRES_REVIEW,
    'PO-1027::ACK-7839': STEELCASE_CRITICAL,
    'PO-330357::ACK-330357': ERGOTRON_EXACT,
}

/** Lookup a mock report by PO+ACK pair. Falls back to AIS for unknown pairs. */
export function getMockComparisonReport(poNumber: string, ackId: string): ComparisonReport {
    const key = `${poNumber}::${ackId}`
    return MOCK_COMPARISON_REPORTS[key] ?? AIS_REQUIRES_REVIEW
}
