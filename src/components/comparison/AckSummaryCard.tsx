import { Sparkles, DollarSign, Clock, ShieldAlert, ArrowUpRight } from 'lucide-react'
import type { AckLevelSummary, BusinessSeverity, Discrepancy, OverallSeverity } from './comparisonTypes'

interface AckSummaryCardProps {
    summary: AckLevelSummary
    discrepancies: Discrepancy[]
}

function riskClasses(risk: OverallSeverity): string {
    switch (risk) {
        case 'LOW':      return 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300'
        case 'MEDIUM':   return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300'
        case 'HIGH':     return 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300'
        case 'CRITICAL': return 'bg-red-100 text-red-800 dark:bg-red-500/25 dark:text-red-200'
    }
}

function severityClasses(sev: BusinessSeverity): string {
    switch (sev) {
        case 'LOW':    return 'bg-green-500'
        case 'MEDIUM': return 'bg-yellow-500'
        case 'HIGH':   return 'bg-red-500'
    }
}

function countBy(discrepancies: Discrepancy[], sev: BusinessSeverity): number {
    return discrepancies.filter(d => d.business_severity === sev).length
}

export default function AckSummaryCard({ summary, discrepancies }: AckSummaryCardProps) {
    const high = countBy(discrepancies, 'HIGH')
    const med = countBy(discrepancies, 'MEDIUM')
    const low = countBy(discrepancies, 'LOW')

    return (
        <div className="rounded-2xl border border-border bg-gradient-to-br from-brand-300/15 via-card to-card dark:from-brand-500/10 dark:via-card overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-border">
                <div className="flex items-center gap-2 mb-3">
                    <div className="h-7 w-7 rounded-md bg-brand-300/40 dark:bg-brand-500/20 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-zinc-800 dark:text-zinc-200" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground">AI Summary</h3>
                        <p className="text-[11px] text-muted-foreground">Strata AI · Ack-level overview</p>
                    </div>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{summary.what_changed_summary}</p>
            </div>

            {/* Business impact chips */}
            <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-border">
                <div className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="min-w-0">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Cost impact</div>
                        <div className="text-sm font-semibold text-foreground">{summary.business_impact.estimated_cost_impact}</div>
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="min-w-0">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Timeline</div>
                        <div className="text-sm font-semibold text-foreground">{summary.business_impact.timeline_impact}</div>
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <ShieldAlert className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="min-w-0">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Risk</div>
                        <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-md ${riskClasses(summary.business_impact.risk_level)}`}>
                            {summary.business_impact.risk_level}
                        </span>
                    </div>
                </div>
            </div>

            {/* Severity overview */}
            <div className="px-5 py-3 border-b border-border flex items-center gap-4 flex-wrap">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Severity overview</div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${severityClasses('HIGH')}`} />
                        <span className="text-xs font-semibold text-foreground">{high} HIGH</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${severityClasses('MEDIUM')}`} />
                        <span className="text-xs font-semibold text-foreground">{med} MED</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${severityClasses('LOW')}`} />
                        <span className="text-xs font-semibold text-foreground">{low} LOW</span>
                    </div>
                </div>
            </div>

            {/* Recommended actions */}
            {summary.recommended_actions.length > 0 && (
                <div className="px-5 py-4">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Recommended actions</div>
                    <ul className="space-y-2">
                        {summary.recommended_actions.map(a => (
                            <li key={a.priority} className="flex items-start gap-2">
                                <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-muted text-[10px] font-bold text-muted-foreground shrink-0 mt-0.5">
                                    {a.priority}
                                </span>
                                <div className="min-w-0">
                                    <div className="text-sm font-medium text-foreground inline-flex items-center gap-1">
                                        {a.action}
                                        <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                                    </div>
                                    <div className="text-[11px] text-muted-foreground leading-relaxed">{a.rationale}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
