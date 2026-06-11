import { FileText, AlertCircle, CheckCircle2, CheckSquare, Send, Trash2, GitCompare } from 'lucide-react'
import { getTeamMember, avatarGradient } from '../team/teamMembers'
import DocTypeChip from './DocTypeChip'

export type OcrDocStatus = 'identified' | 'capturing' | 'inconsistencies' | 'in_progress' | 'processed' | 'completed' | 'deprecated'
export type OcrDocType = 'Purchase Order' | 'Acknowledgment' | 'Invoice' | 'Quote'

export interface OcrDocCardData {
    id: string
    name: string
    vendor: string
    type: OcrDocType
    status: OcrDocStatus
    lineItems: number
    date: string
    assigneeId?: string
    /** Linked counterpart doc id — if set, the card shows a Compare action. */
    relatedDocId?: string
}

interface OcrDocCardProps {
    doc: OcrDocCardData
    onPreview: () => void
    onMarkCompleted: () => void
    onPreflightSync: () => void
    onDeprecate: () => void
    /** Opens the PO vs ACK comparison flow. Only shown when defined. */
    onCompare?: () => void
}

// Best-effort relative time. Accepts seed strings ("Today, 2:30 PM",
// "Yesterday", "2 days ago") and ISO dates, returns "21 days ago" form.
function formatRelativeTime(input: string): string {
    if (!input) return '—'
    const lower = input.toLowerCase()
    if (lower.startsWith('today')) return 'today'
    if (lower.startsWith('yesterday')) return 'yesterday'
    const daysMatch = lower.match(/^(\d+)\s+days?\s+ago/)
    if (daysMatch) return `${daysMatch[1]} days ago`
    const parsed = new Date(input)
    if (!isNaN(parsed.getTime())) {
        const days = Math.max(0, Math.floor((Date.now() - parsed.getTime()) / 86_400_000))
        if (days === 0) return 'today'
        if (days === 1) return 'yesterday'
        return `${days} days ago`
    }
    return input
}

export default function OcrDocCard({ doc, onPreview, onMarkCompleted, onPreflightSync, onDeprecate, onCompare }: OcrDocCardProps) {
    const assignee = getTeamMember(doc.assigneeId)
    // For non-Reconciled/Completed states the 4 icons default to In-Progress mapping
    // (per Diego decision 2026-06-09 — confirm with prod for other states later).
    const isReconciled = doc.status === 'processed' || doc.status === 'completed'

    return (
        <div className="group bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-foreground truncate">{doc.vendor}</span>
                                <DocTypeChip type={doc.type} size="sm" />
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono truncate">{doc.id}</div>
                        </div>
                    </div>
                    {assignee && (
                        <div
                            title={assignee.name}
                            className={`h-7 w-7 rounded-full bg-gradient-to-br ${avatarGradient(assignee.id)} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}
                        >
                            {assignee.initials}
                        </div>
                    )}
                </div>

                <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Filename</span>
                        <span title={doc.name} className="font-semibold text-foreground truncate ml-2 max-w-[180px]">{doc.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Line Items</span>
                        <span className="font-semibold text-foreground">{doc.lineItems} line items</span>
                    </div>
                </div>

                {onCompare && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onCompare() }}
                        title="Compare linked documents"
                        aria-label="Compare linked documents"
                        className="mb-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md bg-brand-300/30 text-foreground border border-brand-300/50 hover:bg-brand-300/50 dark:bg-brand-500/15 dark:border-brand-500/40 dark:hover:bg-brand-500/25 transition-colors"
                    >
                        <GitCompare className="h-3.5 w-3.5" />
                        Compare linked documents
                    </button>
                )}

                <div className="border-t border-border pt-3 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{formatRelativeTime(doc.date)}</span>
                    <div className="flex items-center gap-1">
                        {/* Action icons — colors use Tailwind raw to match prod (yellow/green/red).
                            DS semantic tokens (warning/success/destructive) skew orange-ish here. */}
                        {isReconciled ? (
                            <span
                                title="Reviewed"
                                className="p-1.5 rounded-md text-green-600 bg-green-50 dark:text-green-300 dark:bg-green-500/15 inline-flex"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                            </span>
                        ) : (
                            <span
                                title="Pending For Review"
                                className="p-1.5 rounded-md text-yellow-600 bg-yellow-50 dark:text-yellow-300 dark:bg-yellow-500/15 inline-flex"
                            >
                                <AlertCircle className="h-4 w-4" />
                            </span>
                        )}
                        <button
                            onClick={(e) => { e.stopPropagation(); onPreview() }}
                            title="Review Fields"
                            aria-label="Review document fields"
                            className="p-1.5 rounded-md text-foreground hover:bg-muted transition-colors"
                        >
                            <FileText className="h-4 w-4" />
                        </button>
                        {isReconciled && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onPreflightSync() }}
                                title="Preflight Sync"
                                aria-label="Preflight Sync"
                                className="p-1.5 rounded-md text-green-600 bg-green-50 dark:text-green-300 dark:bg-green-500/15 hover:brightness-95 transition-all"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        )}
                        {isReconciled ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); onMarkCompleted() }}
                                title="Mark as Completed"
                                aria-label="Mark as Completed"
                                className="p-1.5 rounded-md text-green-700 bg-green-100 dark:text-green-200 dark:bg-green-500/25 hover:brightness-95 transition-all"
                            >
                                <CheckSquare className="h-4 w-4" />
                            </button>
                        ) : (
                            <span
                                title="Mark as Reviewed first"
                                aria-label="Mark as Reviewed first (disabled — review first)"
                                className="p-1.5 rounded-md text-green-400 bg-green-50/60 dark:text-green-500 dark:bg-green-500/10 inline-flex cursor-not-allowed opacity-70"
                            >
                                <CheckSquare className="h-4 w-4" />
                            </span>
                        )}
                        <button
                            onClick={(e) => { e.stopPropagation(); onDeprecate() }}
                            title="Deprecate"
                            aria-label="Deprecate document"
                            className="p-1.5 rounded-md text-red-600 bg-red-50 dark:text-red-300 dark:bg-red-500/15 hover:brightness-95 transition-all"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
