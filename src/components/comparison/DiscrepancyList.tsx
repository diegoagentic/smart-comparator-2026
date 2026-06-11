import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, Sparkles, ArrowRight, AlertTriangle, Check, X as XMark, MessageSquareWarning, CheckCircle2, FileSearch } from 'lucide-react'
import type { BusinessSeverity, DecisionAction, Discrepancy } from './comparisonTypes'
import DocTypeChip from '../ocr/DocTypeChip'

interface PreviewDocLike {
    id: string
    name: string
    vendor: string
    type: string
}

interface DiscrepancyListProps {
    discrepancies: Discrepancy[]
    /** Optional preview opener — when set, supporting-evidence doc names
        render as hyperlinks that open the PDF preview modal. */
    onPreviewDoc?: (doc: PreviewDocLike) => void
}

type DiscrepancyDecisionMap = Record<string, DecisionAction | null>

function severityClasses(sev: BusinessSeverity): string {
    switch (sev) {
        case 'LOW':    return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-300 dark:border-green-500/30'
        case 'MEDIUM': return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/15 dark:text-yellow-300 dark:border-yellow-500/30'
        case 'HIGH':   return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30'
    }
}

function actionClasses(action: DecisionAction): string {
    switch (action) {
        case 'ACCEPT':         return 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300'
        case 'REJECT':         return 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300'
        case 'REQUEST_REVIEW': return 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300'
    }
}

function actionLabel(action: DecisionAction): string {
    // Per-discrepancy actions: "Flag" instead of "Review" so the verb
    // matches the result (the row becomes Flagged). The report-level
    // footer button still uses "Review" — that's a different action
    // that assigns the whole report to a reviewer.
    return action === 'REQUEST_REVIEW' ? 'Flag' : action.charAt(0) + action.slice(1).toLowerCase()
}

function decisionPillLabel(action: DecisionAction): string {
    switch (action) {
        case 'ACCEPT':         return 'Accepted'
        case 'REJECT':         return 'Rejected'
        case 'REQUEST_REVIEW': return 'Flagged'
    }
}

/** Pull the field type out of a discrepancy label.
    "Line 1 · Qty (Task Chair)" → "Quantity"
    "Line 5 · Finish (Lounge)"  → "Finish"
    "Total Amount"              → "Total Amount"
    "Estimated Ship Date"       → "Estimated Ship Date" */
function extractFieldType(label: string): string {
    const parts = label.split(' · ')
    let raw = label
    if (parts.length >= 2) {
        const middle = parts[1].replace(/\s*\([^)]+\)\s*$/, '').trim()
        if (middle) raw = middle
    }
    // Expand common abbreviations — columns have plenty of room and full
    // words read more naturally than tabular shorthand.
    const expansions: Record<string, string> = {
        'Qty':  'Quantity',
        'QTY':  'Quantity',
        'Mfg':  'Manufacturer',
        'PO':   'Purchase Order',
        'Ack':  'Acknowledgement',
        'UOM':  'Unit of Measure',
    }
    return expansions[raw] ?? raw
}

function DiscrepancyRow({
    d,
    defaultOpen,
    decision,
    onDecide,
    onPreviewDoc,
}: {
    d: Discrepancy
    defaultOpen: boolean
    decision: DecisionAction | null
    onDecide: (action: DecisionAction) => void
    onPreviewDoc?: (doc: PreviewDocLike) => void
}) {
    const [open, setOpen] = useState(defaultOpen)
    const resolved = decision !== null
    const borderColor = severityClasses(d.business_severity).split(' ').filter(c => c.startsWith('border-') || c.startsWith('dark:border-')).join(' ')

    return (
        <div className={`rounded-xl border ${resolved ? 'border-green-300 dark:border-green-500/40' : borderColor} bg-card overflow-hidden ${resolved ? 'opacity-80' : ''}`}>
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors text-left"
            >
                <div className="shrink-0">
                    {open
                        ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </div>
                {resolved ? (
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${actionClasses(decision!)}`}>
                        <CheckCircle2 className="h-3 w-3" />
                        {decisionPillLabel(decision!)}
                    </span>
                ) : (
                    <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${severityClasses(d.business_severity)}`}>
                        {d.business_severity}
                    </span>
                )}
                <span className={`text-sm font-semibold flex-1 min-w-0 truncate ${resolved ? 'text-muted-foreground line-through decoration-muted-foreground/40' : 'text-foreground'}`}>
                    {d.field_label}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="font-mono">{d.po_value}</span>
                    <ArrowRight className="h-3 w-3" />
                    <span className="font-mono font-bold text-foreground">{d.ack_value}</span>
                </span>
            </button>

            {open && (
                <div className="px-3 pb-4 pt-3 space-y-3 border-t border-border">
                    {/* 3-column layout — Before · After · AI Analysis. Stacks
                        to single column on small screens. The AI column gets
                        more width because it carries the most content. */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1.6fr] gap-2">
                        {/* Col 1 — Purchase Order value */}
                        <div className="rounded-lg border border-border bg-muted/20 p-3 flex flex-col">
                            <div className="flex items-center justify-between gap-2 mb-2">
                                <DocTypeChip type="Purchase Order" size="sm" />
                                <span className="text-[11px] font-semibold text-muted-foreground">{extractFieldType(d.field_label)}</span>
                            </div>
                            <div className="text-sm font-mono font-semibold text-muted-foreground line-through decoration-muted-foreground/40 break-all">
                                {d.po_value}
                            </div>
                        </div>

                        {/* Col 2 — Acknowledgement value */}
                        <div className="rounded-lg border border-red-200 bg-red-50/40 dark:border-red-500/30 dark:bg-red-500/10 p-3 flex flex-col relative">
                            {/* Arrow connector — visible on lg only, points from PO to ACK */}
                            <ArrowRight className="hidden lg:block absolute -left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500 bg-card rounded-full p-0.5 z-10" />
                            <div className="flex items-center justify-between gap-2 mb-2">
                                <DocTypeChip type="Acknowledgment" size="sm" />
                                <span className="text-[11px] font-semibold text-red-700/80 dark:text-red-300/80">{extractFieldType(d.field_label)}</span>
                            </div>
                            <div className="text-sm font-mono font-bold text-red-700 dark:text-red-200 break-all">
                                {d.ack_value}
                            </div>
                        </div>

                        {/* Col 3 — AI Analysis */}
                        <div className="rounded-lg bg-muted/40 p-3 flex flex-col gap-2">
                            <div className="flex items-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5 text-zinc-800 dark:text-zinc-200" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">AI Analysis · {d.analysis_confidence}% confidence</span>
                            </div>

                            {/* Supporting evidence — sits at the TOP of the AI
                                column so the user reads "AI did the homework"
                                BEFORE the analysis bullets. Doc name renders as
                                a hyperlink when a descriptor is provided. */}
                            {d.supporting_evidence && (() => {
                                const ev = d.supporting_evidence
                                const toneText =
                                    ev.tone === 'positive' ? 'text-green-700 dark:text-green-300' :
                                    ev.tone === 'warning'  ? 'text-yellow-700 dark:text-yellow-300' :
                                                             'text-blue-700 dark:text-blue-300'
                                const toneBorder =
                                    ev.tone === 'positive' ? 'border-green-300/60 dark:border-green-500/40' :
                                    ev.tone === 'warning'  ? 'border-yellow-300/60 dark:border-yellow-500/40' :
                                                             'border-blue-300/60 dark:border-blue-500/40'
                                const toneLinkHover =
                                    ev.tone === 'positive' ? 'hover:text-green-800 dark:hover:text-green-200' :
                                    ev.tone === 'warning'  ? 'hover:text-yellow-800 dark:hover:text-yellow-200' :
                                                             'hover:text-blue-800 dark:hover:text-blue-200'
                                return (
                                    <div className={`border-l-2 ${toneBorder} pl-2 py-0.5 space-y-1`}>
                                        <div className="flex items-start gap-1.5 text-[11.5px] leading-snug">
                                            <FileSearch className={`h-3 w-3 shrink-0 mt-0.5 ${toneText}`} />
                                            <span className="text-foreground">
                                                Strata AI found a document that supports the missing items:
                                                {' '}
                                                {ev.doc && onPreviewDoc ? (
                                                    <button
                                                        onClick={() => onPreviewDoc(ev.doc!)}
                                                        title={`Preview ${ev.doc.name}`}
                                                        className={`font-semibold underline underline-offset-2 decoration-dotted hover:decoration-solid transition-all ${toneText} ${toneLinkHover}`}
                                                    >
                                                        {ev.label}
                                                    </button>
                                                ) : (
                                                    <span className={`font-semibold ${toneText}`}>{ev.label}</span>
                                                )}
                                            </span>
                                        </div>
                                        {ev.description && (
                                            <p className="text-[11.5px] text-muted-foreground leading-snug pl-[18px]">{ev.description}</p>
                                        )}
                                    </div>
                                )
                            })()}

                            {d.what_changed && (
                                <div className="text-[11px] font-bold text-foreground leading-snug border-l-2 border-foreground/30 pl-2">
                                    {d.what_changed}
                                </div>
                            )}
                            {d.why_it_matters && d.why_it_matters.length > 0 ? (
                                <ul className="space-y-1">
                                    {d.why_it_matters.map((point, i) => (
                                        <li key={i} className="flex items-start gap-2 text-[12px] text-foreground leading-snug">
                                            <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground/60 shrink-0" />
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-[12px] text-foreground leading-relaxed">{d.llm_analysis}</p>
                            )}
                        </div>
                    </div>

                    {/* Recommendation + Your-call merged onto a single row,
                        right-aligned. Recommended sits on the left of the cluster,
                        Your call on the right, with a divider between them. */}
                    <div className="flex items-center justify-end gap-3 flex-wrap px-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Recommended:</span>
                            <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-md ${actionClasses(d.recommended_action)}`}>
                                {actionLabel(d.recommended_action)}
                            </span>
                            <span className="text-xs text-muted-foreground">— {d.recommendation}</span>
                        </div>
                        <span className="h-4 w-px bg-border hidden sm:block" aria-hidden />
                        <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-1">Your call:</span>
                        <button
                            onClick={() => onDecide('ACCEPT')}
                            title="Approve the ACK value as-is. The field will be applied to your records when you commit the report below."
                            aria-label="Accept this discrepancy — approve the ACK value as-is"
                            className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                                decision === 'ACCEPT'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-transparent text-muted-foreground ring-1 ring-border hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            <Check className="h-3 w-3" />
                            Accept
                        </button>
                        <button
                            onClick={() => onDecide('REQUEST_REVIEW')}
                            title="Flag this item for second-pass review by another team member. The report will route to the review queue."
                            aria-label="Flag this discrepancy for review"
                            className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                                decision === 'REQUEST_REVIEW'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-transparent text-muted-foreground ring-1 ring-border hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            <MessageSquareWarning className="h-3 w-3" />
                            Flag item
                        </button>
                        <button
                            onClick={() => onDecide('REJECT')}
                            title="Discard the ACK value, keep the PO as the source of truth. The vendor will be notified of the rejection."
                            aria-label="Reject this discrepancy — keep PO value, ask vendor to correct"
                            className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                                decision === 'REJECT'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-transparent text-muted-foreground ring-1 ring-border hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            <XMark className="h-3 w-3" />
                            Reject
                        </button>
                        {resolved && (
                            <button
                                onClick={() => onDecide(d.recommended_action)}
                                title="Clear your override and follow the AI's suggestion again"
                                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Reset to AI
                            </button>
                        )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function DiscrepancyList({ discrepancies, onPreviewDoc }: DiscrepancyListProps) {
    const [decisions, setDecisions] = useState<DiscrepancyDecisionMap>({})

    // Reset decisions when the discrepancy set changes (new report opened).
    useEffect(() => {
        setDecisions({})
    }, [discrepancies])

    if (discrepancies.length === 0) {
        return (
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-green-50/30 dark:bg-green-500/5">
                <div className="text-2xl mb-2">✓</div>
                <p className="text-sm font-semibold text-foreground">No discrepancies</p>
                <p className="text-xs text-muted-foreground mt-1">PO and ACK match exactly. Ready to apply.</p>
            </div>
        )
    }

    const resolvedCount = discrepancies.filter(d => decisions[d.id]).length
    const allResolved = resolvedCount === discrepancies.length
    const progressPct = Math.round((resolvedCount / discrepancies.length) * 100)

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-300" />
                    <h3 className="text-sm font-bold text-foreground">Discrepancies ({discrepancies.length})</h3>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                    <span className={`text-xs font-semibold ${allResolved ? 'text-green-700 dark:text-green-300' : 'text-muted-foreground'}`}>
                        {resolvedCount} of {discrepancies.length} resolved
                    </span>
                    <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                            className={`h-full transition-all duration-300 ${allResolved ? 'bg-green-500' : 'bg-yellow-500'}`}
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
                Each row already carries an <span className="font-semibold text-foreground">AI suggestion</span> (highlighted). Use the small inline buttons only to <span className="font-semibold text-foreground">override</span> a single discrepancy. The big <span className="font-semibold text-foreground">Accept / Review / Reject</span> at the bottom is what commits the whole report.
            </p>
            {discrepancies.map((d, idx) => (
                <DiscrepancyRow
                    key={d.id}
                    d={d}
                    defaultOpen={idx === 0 && d.business_severity === 'HIGH'}
                    decision={decisions[d.id] ?? null}
                    onPreviewDoc={onPreviewDoc}
                    onDecide={action => setDecisions(prev => ({ ...prev, [d.id]: action }))}
                />
            ))}
        </div>
    )
}
