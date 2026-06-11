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
            'AIS confirmed your order but two line items will ship short of the requested quantity, which pushes the ship date by 12 days and reduces the total amount by $2,095.',
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
            what_changed: 'Both lounge units dropped to 0 — backorder confirmed by vendor',
            why_it_matters: [
                'Vendor reports restock arriving Nov 27, 2025 (separate shipment)',
                'Install for the lounge area moves to early December',
                'Main delivery is unaffected — split shipment',
            ],
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
            what_changed: '2 of 8 lockers held on allocation — partial fulfillment',
            why_it_matters: [
                'Remaining 2 units ETA: +3 weeks per vendor',
                'You can take the 6 ready units now without delaying install',
                'Backorder is a known supply issue, not a vendor error',
            ],
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
            what_changed: 'Total drops $2,095.39 — entirely driven by upcoming short shipments',
            why_it_matters: [
                'No unit-price changes detected — vendor honored quoted prices',
                'Backorder shipment will reconcile the delta to original total',
                'Customer change-order acknowledgment recommended',
            ],
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
            what_changed: 'Ship date pushed +12 days — Nov 15 → Nov 27',
            why_it_matters: [
                'Still inside Dec 1 install tolerance — but tight',
                'Lounge backorder is the root cause',
                'Confirm vendor ETA before locking the new date',
            ],
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
            what_changed: 'Color swap — Ocean Blue → Azure Blue, same fabric grade',
            why_it_matters: [
                'No price impact — same fabric tier',
                'Common substitution when a dye lot is unavailable',
                'Visually close — customer is unlikely to notice',
            ],
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
    validated_fields: [
        { field_label: 'Vendor Name',         category: 'header',    po_value: 'AIS Furniture',              ack_value: 'AIS Furniture',              matched: true  },
        { field_label: 'PO Number',           category: 'header',    po_value: 'PO-2055',                    ack_value: 'PO-2055',                    matched: true  },
        { field_label: 'Customer / Bill To',  category: 'header',    po_value: 'Custer Inc.',                ack_value: 'Custer Inc.',                matched: true  },
        { field_label: 'Ship-To Address',     category: 'logistics', po_value: '550 Bond St, Lincolnshire',  ack_value: '550 Bond St, Lincolnshire',  matched: true  },
        { field_label: 'Estimated Ship Date', category: 'logistics', po_value: 'Nov 15, 2025',               ack_value: 'Nov 27, 2025',               matched: false },
        { field_label: 'Payment Terms',       category: 'terms',     po_value: 'Net 30',                     ack_value: 'Net 30',                     matched: true  },
        { field_label: 'Subtotal',            category: 'pricing',   po_value: '$26,012.50',                 ack_value: '$24,235.15',                 matched: false },
        { field_label: 'Total Amount',        category: 'pricing',   po_value: '$27,494.11',                 ack_value: '$25,398.72',                 matched: false },
    ],
    validated_line_items: [
        { line: 1, product_number: 'AIS-DESK-72',  description: 'Desk · 72" Laminate',          po_quantity: 4,  ack_quantity: 4,  po_unit_price: '$420.00',  ack_unit_price: '$420.00',  matched: true  },
        { line: 2, product_number: 'AIS-CHAIR-A1', description: 'Task Chair · Ergonomic Mesh',  po_quantity: 6,  ack_quantity: 6,  po_unit_price: '$315.00',  ack_unit_price: '$315.00',  matched: true  },
        { line: 5, product_number: 'AIS-LOUNGE-2', description: 'Lounge 2-Seat · Ocean Blue',   po_quantity: 2,  ack_quantity: 0,  po_unit_price: '$890.00',  ack_unit_price: '$890.00',  matched: false },
        { line: 7, product_number: 'AIS-LOCK-T3',  description: 'Triple Locker · Steel',        po_quantity: 8,  ack_quantity: 6,  po_unit_price: '$680.00',  ack_unit_price: '$680.00',  matched: false },
        { line: 9, product_number: 'AIS-RUG-08',   description: 'Area Rug · 8x10',              po_quantity: 1,  ack_quantity: 1,  po_unit_price: '$1,250.00', ack_unit_price: '$1,250.00', matched: true  },
    ],
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
            'Steelcase will ship 3 of 12 task chairs now (delivery pushed +9 days due to carrier reassignment, CC-3318 attached) and committed the remaining 9 on back-order (BO-7839A, +30 days) — both partial fulfillment and the date shift are documented and acceptable. However, the model was switched from Series 2 to Amia without authorization, which is the critical issue.',
        business_impact: {
            estimated_cost_impact: '$0 (same total)',
            timeline_impact: 'Delivery +9 days for the immediate 3, +30 days for the back-ordered 9',
            risk_level: 'HIGH',
        },
        recommended_actions: [
            { action: 'Reject the model substitution', priority: 1, rationale: 'Amia is one tier below the spec sold to customer' },
            { action: 'Accept the back-order on quantity', priority: 2, rationale: 'BO-7839A is attached — vendor commitment is documented' },
            { action: 'Accept the delivery date shift', priority: 3, rationale: 'CC-3318 carrier confirmation documents the new dock slot' },
            { action: 'Escalate the model swap to vendor account manager', priority: 4, rationale: 'Unauthorized substitutions need to be flagged at the relationship level' },
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
            what_changed: 'Unauthorized model swap — Series 2 → Amia (one tier down)',
            why_it_matters: [
                'Customer specced Series 2 for ergonomic adjustability',
                'Amia lacks the lumbar support feature Series 2 has',
                'No authorization was given to substitute',
            ],
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
                'Steelcase does not have all 12 chairs in stock today. The ACK ships 3 now and the vendor attached back-order BO-7839A committing the remaining 9 for Nov 25 (+30 days). Because the back-order document is in place, the partial fulfillment is contractually binding — this is the normal pattern for split shipments and can be accepted. If the vendor had short-shipped without the back-order doc, this would warrant a rejection.',
            what_changed: 'Partial fulfillment — 3 now + 9 on back-order',
            why_it_matters: [
                'Back-order BO-7839A attached to the ACK — vendor commitment is documented and binding',
                'Remaining 9 units ETA Nov 25 (+30 days)',
                'Without a back-order doc this would be a rejection — but the doc is in place',
            ],
            supporting_evidence: {
                label: 'BO-7839A',
                description: 'Back-order acknowledgement covering the remaining 9 chairs — vendor commits to ship them on Nov 25 (+30 days). Same product line, same unit price.',
                tone: 'positive',
                doc: {
                    id: 'BO-7839A',
                    name: 'BO-7839A.pdf',
                    vendor: 'Steelcase',
                    type: 'Acknowledgement',
                },
            },
            recommendation: 'Accept — back-order commitment is documented',
            recommended_action: 'ACCEPT',
            analysis_status: 'COMPLETED',
            analysis_confidence: 92,
        },
        {
            id: 'd-3',
            field_path: 'logistics.estimatedDeliveryDate',
            field_label: 'Estimated Delivery Date',
            category: 'logistics',
            po_value: 'Oct 30, 2025',
            ack_value: 'Nov 8, 2025',
            business_severity: 'MEDIUM',
            llm_analysis:
                'Delivery for the immediate 3 chairs shifted by 9 days because Steelcase\'s preferred carrier had no slot in the original window. They reassigned to XPO Logistics and attached carrier confirmation CC-3318 with the new dock slot. Install date for this partial batch still has buffer.',
            what_changed: 'Delivery pushed +9 days due to carrier reassignment — Oct 30 → Nov 8',
            why_it_matters: [
                'Carrier confirmation CC-3318 documents the new dock slot and timing',
                'Affects only the immediate 3 chairs — back-order 9 keep the Nov 25 commitment',
                'Customer should be notified of the new ETA for the partial delivery',
            ],
            supporting_evidence: {
                label: 'CC-3318',
                description: 'Carrier confirmation from XPO Logistics — new dock slot Nov 8, 9am-1pm. Doc explicitly references PO-1027 and the rescheduled lane for the immediate 3-chair batch.',
                tone: 'positive',
                doc: {
                    id: 'CC-3318',
                    name: 'CC-3318_XPO.pdf',
                    vendor: 'XPO Logistics',
                    type: 'Acknowledgement',
                },
            },
            recommendation: 'Accept — carrier confirmation is documented',
            recommended_action: 'ACCEPT',
            analysis_status: 'COMPLETED',
            analysis_confidence: 93,
        },
    ],
    routing: {
        routing_decision: 'MANDATORY_REVIEW',
        confidence_score: 35,
        rationale: 'Quantity is on a documented back-order and the delivery date is covered by a carrier confirmation — both acceptable. But the unauthorized model substitution (Series 2 → Amia) is a HIGH-severity issue that requires manual review before any action.',
        suggested_action: 'REJECT',
    },
    validated_fields: [
        { field_label: 'Vendor Name',             category: 'header',    po_value: 'Steelcase',                 ack_value: 'Steelcase',                  matched: true  },
        { field_label: 'PO Number',               category: 'header',    po_value: 'PO-1027',                   ack_value: 'PO-1027',                    matched: true  },
        { field_label: 'Estimated Ship Date',     category: 'logistics', po_value: 'Oct 25, 2025',              ack_value: 'Nov 25, 2025',               matched: false },
        { field_label: 'Estimated Delivery Date', category: 'logistics', po_value: 'Oct 30, 2025',              ack_value: 'Nov 8, 2025',                matched: false },
        { field_label: 'Carrier',                 category: 'logistics', po_value: 'Steelcase Logistics',       ack_value: 'XPO Logistics',              matched: false },
        { field_label: 'Total Amount',            category: 'pricing',   po_value: '$8,652.00',                 ack_value: '$8,652.00',                  matched: true  },
    ],
    validated_line_items: [
        { line: 1, product_number: 'Series 2 (442A1B)', description: 'Task Chair · Ergonomic Series 2',  po_quantity: 12, ack_quantity: 3, po_unit_price: '$721.00', ack_unit_price: '$721.00', matched: false },
        { line: 2, product_number: 'STC-DESK-66',        description: 'Adjustable Desk · 66" White',      po_quantity: 4,  ack_quantity: 4, po_unit_price: '$0.00',   ack_unit_price: '$0.00',   matched: true  },
        { line: 3, product_number: 'STC-MON-32',         description: 'Monitor Arm · Dual',               po_quantity: 4,  ack_quantity: 4, po_unit_price: '$0.00',   ack_unit_price: '$0.00',   matched: true  },
    ],
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
    validated_fields: [
        { field_label: 'Vendor Name',         category: 'header',    po_value: 'ergotron',           ack_value: 'ergotron',           matched: true },
        { field_label: 'PO Number',           category: 'header',    po_value: 'PO-330357',          ack_value: 'PO-330357',          matched: true },
        { field_label: 'Customer / Bill To',  category: 'header',    po_value: 'Continua Interiors', ack_value: 'Continua Interiors', matched: true },
        { field_label: 'Ship-To Address',     category: 'logistics', po_value: '550 Bond St',        ack_value: '550 Bond St',        matched: true },
        { field_label: 'Estimated Ship Date', category: 'logistics', po_value: 'Sep 20, 2025',       ack_value: 'Sep 20, 2025',       matched: true },
        { field_label: 'Payment Terms',       category: 'terms',     po_value: 'Net 30',             ack_value: 'Net 30',             matched: true },
        { field_label: 'Total Amount',        category: 'pricing',   po_value: '$3,420.00',          ack_value: '$3,420.00',          matched: true },
    ],
    validated_line_items: [
        { line: 1, product_number: 'WORKFIT-LX',  description: 'WorkFit-LX · Standing Desk Conv.', po_quantity: 3, ack_quantity: 3, po_unit_price: '$795.00', ack_unit_price: '$795.00', matched: true },
        { line: 2, product_number: 'LX-DUAL-ARM', description: 'LX Dual Monitor Arm · Aluminum',   po_quantity: 3, ack_quantity: 3, po_unit_price: '$345.00', ack_unit_price: '$345.00', matched: true },
        { line: 3, product_number: 'WORKFIT-MAT', description: 'WorkFit Anti-Fatigue Mat',         po_quantity: 3, ack_quantity: 3, po_unit_price: '$120.00', ack_unit_price: '$120.00', matched: true },
    ],
    created_at: '2026-04-08T11:15:00Z',
}

const KNOLL_DATE_SHIFT: ComparisonReport = {
    report_id: 12348,
    po_number: 'PO-4501',
    ack_id: 'ACK-7855',
    vendor: 'Knoll',
    derived_status: 'REQUIRES_REVIEW',
    overall_similarity_score: 0.91,
    total_fields_compared: 32,
    run_number: 1,
    is_latest: true,
    summary: {
        what_changed_summary:
            'Knoll confirmed the order with a 7-day shift in the delivery date due to a carrier reassignment. The vendor attached a carrier confirmation (CC-2284) with the new dock slot and timeline. Install still has buffer, but the new ETA should be confirmed with the customer.',
        business_impact: {
            estimated_cost_impact: '+$120 (carrier surcharge)',
            timeline_impact: 'Delivery pushed +7 days (Oct 15 → Oct 22)',
            risk_level: 'MEDIUM',
        },
        recommended_actions: [
            { action: 'Confirm the new delivery date with the customer', priority: 1, rationale: 'Install team needs the new ETA before locking the calendar' },
            { action: 'Accept the carrier reassignment', priority: 2, rationale: 'CC-2284 is attached — change is documented and binding' },
            { action: 'Update install calendar to Oct 24', priority: 3, rationale: 'Keep the 2-day buffer between delivery and install' },
        ],
    },
    discrepancies: [
        {
            id: 'd-1',
            field_path: 'logistics.estimatedDeliveryDate',
            field_label: 'Estimated Delivery Date',
            category: 'logistics',
            po_value: 'Oct 15, 2026',
            ack_value: 'Oct 22, 2026',
            business_severity: 'HIGH',
            llm_analysis:
                'Knoll shifted the delivery date by 7 days because their preferred carrier had no available dock slot in the original window. They moved the shipment to XPO Logistics and attached carrier confirmation CC-2284 with the new dock slot (Oct 22, 10am-2pm). The new date still gives the install crew a 2-day buffer before Oct 24 — within tolerance.',
            what_changed: 'Delivery pushed +7 days due to carrier reassignment — Oct 15 → Oct 22',
            why_it_matters: [
                'Carrier confirmation CC-2284 documents the new dock slot and timing',
                'Install date Oct 24 still has a 2-day buffer — within tolerance',
                'Customer should be notified of the new ETA before applying',
            ],
            supporting_evidence: {
                label: 'CC-2284',
                description: 'Carrier confirmation from XPO Logistics — new dock slot Oct 22, 10am-2pm. Doc explicitly references PO-4501 and the rescheduled lane.',
                tone: 'positive',
                doc: {
                    id: 'CC-2284',
                    name: 'CC-2284_XPO.pdf',
                    vendor: 'XPO Logistics',
                    type: 'Acknowledgement',
                },
            },
            recommendation: 'Accept — carrier confirmation is documented',
            recommended_action: 'ACCEPT',
            analysis_status: 'COMPLETED',
            analysis_confidence: 94,
        },
        {
            id: 'd-2',
            field_path: 'logistics.estimatedShipDate',
            field_label: 'Estimated Ship Date',
            category: 'logistics',
            po_value: 'Oct 8, 2026',
            ack_value: 'Oct 13, 2026',
            business_severity: 'MEDIUM',
            llm_analysis:
                'Ship date moved +5 days to align with the new carrier slot. No production delay — this is purely a logistics rescheduling and is consistent with the new delivery commitment.',
            what_changed: 'Ship date moved +5 days to align with the new carrier window',
            why_it_matters: [
                'Ripple effect from the delivery date shift — not a production issue',
                'Still inside vendor\'s standard 3-week production cycle',
                'Once the delivery is accepted, this is automatic',
            ],
            recommendation: 'Accept — logistics alignment',
            recommended_action: 'ACCEPT',
            analysis_status: 'COMPLETED',
            analysis_confidence: 96,
        },
        {
            id: 'd-3',
            field_path: 'logistics.carrier',
            field_label: 'Carrier',
            category: 'logistics',
            po_value: 'Knoll Logistics',
            ack_value: 'XPO Logistics',
            business_severity: 'LOW',
            llm_analysis:
                'Knoll switched carriers because their preferred lane had no capacity in the original window. XPO is a tier-1 freight provider with no historical service issues for Knoll orders. The $120 surcharge is passed through and documented in the ACK.',
            what_changed: 'Carrier swap — Knoll Logistics → XPO Logistics (+$120 surcharge)',
            why_it_matters: [
                'XPO is tier-1 — no service-quality risk',
                '$120 surcharge is documented in the ACK line items',
                'Common substitution when the preferred lane has no slot',
            ],
            recommendation: 'Accept the carrier swap',
            recommended_action: 'ACCEPT',
            analysis_status: 'COMPLETED',
            analysis_confidence: 92,
        },
    ],
    routing: {
        routing_decision: 'SUGGESTED_REVIEW',
        confidence_score: 78,
        rationale: 'Delivery date shifted by 7 days but is fully documented by a binding carrier confirmation (CC-2284). Recommended to review the new ETA with the customer\'s install team before applying.',
        suggested_action: 'ACCEPT',
    },
    validated_fields: [
        { field_label: 'Vendor Name',             category: 'header',    po_value: 'Knoll',              ack_value: 'Knoll',              matched: true  },
        { field_label: 'PO Number',               category: 'header',    po_value: 'PO-4501',            ack_value: 'PO-4501',            matched: true  },
        { field_label: 'Customer / Bill To',      category: 'header',    po_value: 'Custer Inc.',        ack_value: 'Custer Inc.',        matched: true  },
        { field_label: 'Ship-To Address',         category: 'logistics', po_value: '217 Grandville Ave', ack_value: '217 Grandville Ave', matched: true  },
        { field_label: 'Estimated Ship Date',     category: 'logistics', po_value: 'Oct 8, 2026',        ack_value: 'Oct 13, 2026',       matched: false },
        { field_label: 'Estimated Delivery Date', category: 'logistics', po_value: 'Oct 15, 2026',       ack_value: 'Oct 22, 2026',       matched: false },
        { field_label: 'Carrier',                 category: 'logistics', po_value: 'Knoll Logistics',    ack_value: 'XPO Logistics',      matched: false },
        { field_label: 'Payment Terms',           category: 'terms',     po_value: 'Net 30',             ack_value: 'Net 30',             matched: true  },
        { field_label: 'Subtotal',                category: 'pricing',   po_value: '$18,420.00',         ack_value: '$18,420.00',         matched: true  },
        { field_label: 'Freight',                 category: 'pricing',   po_value: '$485.00',            ack_value: '$605.00',            matched: false },
        { field_label: 'Total Amount',            category: 'pricing',   po_value: '$18,905.00',         ack_value: '$19,025.00',         matched: false },
    ],
    validated_line_items: [
        { line: 1, product_number: 'KNL-GENERATION', description: 'Generation Task Chair · Mesh',     po_quantity: 8, ack_quantity: 8, po_unit_price: '$1,290.00', ack_unit_price: '$1,290.00', matched: true },
        { line: 2, product_number: 'KNL-DIVIDE',     description: 'Divide Panel System · 60"',         po_quantity: 4, ack_quantity: 4, po_unit_price: '$1,850.00', ack_unit_price: '$1,850.00', matched: true },
        { line: 3, product_number: 'KNL-ANTENNA',    description: 'Antenna Workspace Desk · 60x30',    po_quantity: 6, ack_quantity: 6, po_unit_price: '$140.00',   ack_unit_price: '$140.00',   matched: true },
    ],
    created_at: '2026-06-10T16:20:00Z',
}

// Keyed by `${po_number}::${ack_id}` for easy lookup from launchers.
export const MOCK_COMPARISON_REPORTS: Record<string, ComparisonReport> = {
    'PO-2055::ACK-3099': AIS_REQUIRES_REVIEW,
    'PO-1027::ACK-7839': STEELCASE_CRITICAL,
    'PO-330357::ACK-330357': ERGOTRON_EXACT,
    'PO-4501::ACK-7855': KNOLL_DATE_SHIFT,
}

/** Lookup a mock report by PO+ACK pair. Falls back to AIS for unknown pairs. */
export function getMockComparisonReport(poNumber: string, ackId: string): ComparisonReport {
    const key = `${poNumber}::${ackId}`
    return MOCK_COMPARISON_REPORTS[key] ?? AIS_REQUIRES_REVIEW
}
