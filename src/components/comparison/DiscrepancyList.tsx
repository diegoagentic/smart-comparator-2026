import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, Sparkles, ArrowRight, AlertTriangle, Check, X as XMark, MessageSquareWarning, CheckCircle2 } from 'lucide-react'
import type { BusinessSeverity, DecisionAction, Discrepancy } from './comparisonTypes'

interface DiscrepancyListProps {
    discrepancies: Discrepancy[]
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
    return action === 'REQUEST_REVIEW' ? 'Review' : action.charAt(0) + action.slice(1).toLowerCase()
}

function DiscrepancyRow({
    d,
    defaultOpen,
    decision,
    onDecide,
}: {
    d: Discrepancy
    defaultOpen: boolean
    decision: DecisionAction | null
    onDecide: (action: DecisionAction) => void
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
                        {actionLabel(decision!)}ed
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
                <div className="px-3 pb-4 pt-1 space-y-3 border-t border-border">
                    {/* Mobile diff */}
                    <div className="sm:hidden flex items-center gap-2 text-sm pt-3">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">PO</span>
                        <span className="font-mono">{d.po_value}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">ACK</span>
                        <span className="font-mono font-bold text-foreground">{d.ack_value}</span>
                    </div>

                    {/* LLM analysis */}
                    <div className="rounded-lg bg-muted/40 p-3">
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-zinc-800 dark:text-zinc-200" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">AI Analysis · {d.analysis_confidence}% confidence</span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{d.llm_analysis}</p>
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Recommended:</span>
                            <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-md ${actionClasses(d.recommended_action)}`}>
                                {actionLabel(d.recommended_action)}
                            </span>
                            <span className="text-xs text-muted-foreground">— {d.recommendation}</span>
                        </div>
                    </div>

                    {/* Per-discrepancy action — subtle inline pills (overrides the AI suggestion).
                        The big report-level buttons in the footer commit all decisions to the report. */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-1">Your call:</span>
                        <button
                            onClick={() => onDecide('ACCEPT')}
                            title="Approve the ACK value as-is. The field will be applied to your records when you commit the report below."
                            aria-label="Accept this discrepancy — approve the ACK value as-is"
                            className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                                decision === 'ACCEPT'
                                    ? 'bg-green-600 text-white'
                                    : d.recommended_action === 'ACCEPT'
                                        ? 'bg-green-50 text-green-700 ring-1 ring-green-200 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-300 dark:ring-green-500/30'
                                        : 'bg-transparent text-muted-foreground ring-1 ring-border hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            <Check className="h-3 w-3" />
                            Accept
                        </button>
                        <button
                            onClick={() => onDecide('REQUEST_REVIEW')}
                            title="Flag this discrepancy for second-pass review by another team member. The report will route to the review queue."
                            aria-label="Request review for this discrepancy"
                            className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                                decision === 'REQUEST_REVIEW'
                                    ? 'bg-blue-600 text-white'
                                    : d.recommended_action === 'REQUEST_REVIEW'
                                        ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/30'
                                        : 'bg-transparent text-muted-foreground ring-1 ring-border hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            <MessageSquareWarning className="h-3 w-3" />
                            Review
                        </button>
                        <button
                            onClick={() => onDecide('REJECT')}
                            title="Discard the ACK value, keep the PO as the source of truth. The vendor will be notified of the rejection."
                            aria-label="Reject this discrepancy — keep PO value, ask vendor to correct"
                            className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                                decision === 'REJECT'
                                    ? 'bg-red-600 text-white'
                                    : d.recommended_action === 'REJECT'
                                        ? 'bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-500/30'
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
            )}
        </div>
    )
}

export default function DiscrepancyList({ discrepancies }: DiscrepancyListProps) {
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
                    onDecide={action => setDecisions(prev => ({ ...prev, [d.id]: action }))}
                />
            ))}
        </div>
    )
}
