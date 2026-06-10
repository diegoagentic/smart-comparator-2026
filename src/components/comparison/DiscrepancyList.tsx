import { useState } from 'react'
import { ChevronDown, ChevronRight, Sparkles, ArrowRight, AlertTriangle } from 'lucide-react'
import type { BusinessSeverity, DecisionAction, Discrepancy } from './comparisonTypes'

interface DiscrepancyListProps {
    discrepancies: Discrepancy[]
}

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

function DiscrepancyRow({ d, defaultOpen }: { d: Discrepancy; defaultOpen: boolean }) {
    const [open, setOpen] = useState(defaultOpen)

    return (
        <div className={`rounded-xl border ${severityClasses(d.business_severity).split(' ').filter(c => c.startsWith('border-') || c.startsWith('dark:border-')).join(' ')} bg-card overflow-hidden`}>
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors text-left"
            >
                <div className="shrink-0">
                    {open
                        ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </div>
                <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${severityClasses(d.business_severity)}`}>
                    {d.business_severity}
                </span>
                <span className="text-sm font-semibold text-foreground flex-1 min-w-0 truncate">{d.field_label}</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="font-mono">{d.po_value}</span>
                    <ArrowRight className="h-3 w-3" />
                    <span className="font-mono font-bold text-foreground">{d.ack_value}</span>
                </span>
            </button>

            {open && (
                <div className="px-3 pb-4 pt-1 space-y-3 border-t border-border">
                    {/* Mobile diff (hidden on sm+) */}
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
                    </div>

                    {/* Recommendation row */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Recommended:</span>
                        <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-md ${actionClasses(d.recommended_action)}`}>
                            {actionLabel(d.recommended_action)}
                        </span>
                        <span className="text-xs text-muted-foreground">— {d.recommendation}</span>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function DiscrepancyList({ discrepancies }: DiscrepancyListProps) {
    if (discrepancies.length === 0) {
        return (
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-green-50/30 dark:bg-green-500/5">
                <div className="text-2xl mb-2">✓</div>
                <p className="text-sm font-semibold text-foreground">No discrepancies</p>
                <p className="text-xs text-muted-foreground mt-1">PO and ACK match exactly. Ready to apply.</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-300" />
                <h3 className="text-sm font-bold text-foreground">Discrepancies ({discrepancies.length})</h3>
                <span className="text-xs text-muted-foreground">— click each to see AI analysis</span>
            </div>
            {discrepancies.map((d, idx) => (
                <DiscrepancyRow key={d.id} d={d} defaultOpen={idx === 0 && d.business_severity === 'HIGH'} />
            ))}
        </div>
    )
}
