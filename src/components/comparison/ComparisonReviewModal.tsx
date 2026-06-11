import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { X, ArrowLeftRight, Loader2, CheckCircle2, XCircle, MessageSquareWarning, GitCompare, Check, X as XMark, FileText } from 'lucide-react'
import type { ComparisonReport, DecisionAction } from './comparisonTypes'
import type { TeamMember } from '../team/teamMembers'
import DerivedStatusBadge from './DerivedStatusBadge'
import AckSummaryCard from './AckSummaryCard'
import DiscrepancyList from './DiscrepancyList'
import AssignReviewerModal from './AssignReviewerModal'
import PdfPreviewModal from './PdfPreviewModal'

interface PreviewDoc {
    id: string
    name: string
    vendor: string
    type: string
}

interface ComparisonReviewModalProps {
    isOpen: boolean
    onClose: () => void
    /** null while processing. */
    report: ComparisonReport | null
    /** When true, render the spinner instead of the report. */
    processing: boolean
    /** Reviewer is populated only when action === 'REQUEST_REVIEW' and the
        user picked a teammate to assign the report to. */
    onDecision?: (action: DecisionAction, reviewer?: TeamMember) => void
}

function routingLabel(routing: ComparisonReport['routing']): string {
    switch (routing.routing_decision) {
        case 'MANDATORY_REVIEW':   return 'Mandatory Review'
        case 'SUGGESTED_REVIEW':   return 'Suggested Review'
        case 'AUTO_APPLY_ELIGIBLE': return 'Auto-apply Eligible'
    }
}

function actionButtonClasses(action: DecisionAction, suggested?: DecisionAction): string {
    const isSuggested = action === suggested
    if (action === 'ACCEPT') {
        return isSuggested
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'bg-background border border-border text-foreground hover:bg-muted'
    }
    if (action === 'REJECT') {
        return isSuggested
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-background border border-border text-foreground hover:bg-muted'
    }
    return isSuggested
        ? 'bg-blue-600 text-white hover:bg-blue-700'
        : 'bg-background border border-border text-foreground hover:bg-muted'
}

type ReviewTab = 'summary' | 'fields' | 'lineItems'

function MatchedPill({ matched }: { matched: boolean }) {
    if (matched) {
        return (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300 whitespace-nowrap">
                <Check className="h-3 w-3" />
                Match
            </span>
        )
    }
    return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300 whitespace-nowrap">
            <XMark className="h-3 w-3" />
            Differs
        </span>
    )
}

export default function ComparisonReviewModal({ isOpen, onClose, report, processing, onDecision }: ComparisonReviewModalProps) {
    const [tab, setTab] = useState<ReviewTab>('summary')
    const [showAssignReviewer, setShowAssignReviewer] = useState(false)
    const [previewDoc, setPreviewDoc] = useState<PreviewDoc | null>(null)

    // Reset to Summary every time the modal re-opens (avoid sticky tabs across reports).
    useEffect(() => {
        if (isOpen) {
            setTab('summary')
            setShowAssignReviewer(false)
            setPreviewDoc(null)
        }
    }, [isOpen, report?.report_id])

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-[200]">
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-[95vw] max-w-[1400px] h-[90vh] max-h-[920px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col">

                            {/* Processing state */}
                            {processing && (
                                <div className="p-12 flex flex-col items-center justify-center text-center">
                                    <div className="h-14 w-14 rounded-full bg-brand-300/30 dark:bg-brand-500/20 flex items-center justify-center mb-4">
                                        <Loader2 className="h-7 w-7 text-zinc-800 dark:text-zinc-200 animate-spin" />
                                    </div>
                                    <h2 className="text-lg font-bold text-foreground mb-1">Comparing documents…</h2>
                                    <p className="text-sm text-muted-foreground">Strata AI is validating a Purchase Order against an Acknowledgement — checking fields, line items, quantities, and pricing.</p>
                                </div>
                            )}

                            {/* Report state */}
                            {!processing && report && (
                                <>
                                    {/* Header */}
                                    <div className="p-5 border-b border-border">
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <GitCompare className="h-4 w-4 text-muted-foreground" />
                                                <h2 className="text-base font-bold text-foreground">Compare linked documents</h2>
                                                <DerivedStatusBadge status={report.derived_status} size="sm" />
                                            </div>
                                            <button
                                                onClick={onClose}
                                                aria-label="Close"
                                                className="p-1.5 -m-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap overflow-x-auto">
                                            <span className="text-muted-foreground">Purchase Order:</span>
                                            <span className="font-mono font-semibold text-foreground">{report.po_number}</span>
                                            <ArrowLeftRight className="h-3 w-3 shrink-0" />
                                            <span className="text-muted-foreground">Acknowledgement:</span>
                                            <span className="font-mono font-semibold text-foreground">{report.ack_id}</span>
                                            <span>·</span>
                                            <span>{report.vendor}</span>
                                            <span>·</span>
                                            <span>{Math.round(report.overall_similarity_score * 100)}% match</span>
                                            <span>·</span>
                                            <span>Run #{report.run_number}</span>
                                        </div>
                                    </div>

                                    {/* Tabs — Review (priority) + Fields + Line Items */}
                                    {(() => {
                                        const isCritical = report.derived_status === 'CRITICAL_ISSUES'
                                        const isReviewNeeded = report.derived_status === 'REQUIRES_REVIEW'
                                        const isClean = report.derived_status === 'EXACT_MATCH' || report.derived_status === 'VERIFIED_WITH_MINOR_CHANGES'
                                        const reviewLabel = isCritical
                                            ? 'Action Required'
                                            : isReviewNeeded
                                                ? 'Needs Review'
                                                : isClean
                                                    ? 'AI Review'
                                                    : 'Review'
                                        const dotClass = isCritical
                                            ? 'bg-red-500 animate-pulse'
                                            : isReviewNeeded
                                                ? 'bg-yellow-500 animate-pulse'
                                                : isClean
                                                    ? 'bg-green-500'
                                                    : 'bg-zinc-400'
                                        const activeBg = isCritical
                                            ? 'bg-red-50 dark:bg-red-500/10'
                                            : isReviewNeeded
                                                ? 'bg-yellow-50 dark:bg-yellow-500/10'
                                                : 'bg-brand-300/20 dark:bg-brand-500/10'
                                        return (
                                            <div className="px-5 border-b border-border flex items-center gap-1 flex-wrap">
                                                <button
                                                    onClick={() => setTab('summary')}
                                                    className={`relative py-2.5 px-3 my-1 text-sm font-bold inline-flex items-center gap-2 rounded-md transition-colors ${
                                                        tab === 'summary'
                                                            ? `${activeBg} text-foreground`
                                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                                    }`}
                                                >
                                                    <span className={`h-2 w-2 rounded-full ${dotClass}`} />
                                                    {reviewLabel}
                                                    {tab === 'summary' && <span className="absolute -bottom-1 left-2 right-2 h-0.5 bg-primary rounded-t-full" />}
                                                </button>
                                                <button
                                                    onClick={() => setTab('fields')}
                                                    className={`relative py-2.5 px-3 my-1 text-sm font-bold inline-flex items-center gap-2 rounded-md transition-colors ${
                                                        tab === 'fields' ? 'text-foreground bg-muted' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                                    }`}
                                                >
                                                    Fields
                                                    <span className="text-[10px] font-bold bg-card border border-border text-muted-foreground px-1.5 py-0.5 rounded-full">{report.validated_fields?.length ?? 0}</span>
                                                    {tab === 'fields' && <span className="absolute -bottom-1 left-2 right-2 h-0.5 bg-primary rounded-t-full" />}
                                                </button>
                                                <button
                                                    onClick={() => setTab('lineItems')}
                                                    className={`relative py-2.5 px-3 my-1 text-sm font-bold inline-flex items-center gap-2 rounded-md transition-colors ${
                                                        tab === 'lineItems' ? 'text-foreground bg-muted' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                                    }`}
                                                >
                                                    Line Items
                                                    <span className="text-[10px] font-bold bg-card border border-border text-muted-foreground px-1.5 py-0.5 rounded-full">{report.validated_line_items?.length ?? 0}</span>
                                                    {tab === 'lineItems' && <span className="absolute -bottom-1 left-2 right-2 h-0.5 bg-primary rounded-t-full" />}
                                                </button>

                                                {/* View originals — pushed to the right of the tabs row */}
                                                <div className="ml-auto flex items-center gap-1.5 my-1">
                                                    <button
                                                        onClick={() => setPreviewDoc({
                                                            id: report.po_number,
                                                            name: `${report.po_number}.pdf`,
                                                            vendor: report.vendor,
                                                            type: 'Purchase Order',
                                                        })}
                                                        title={`Preview the original Purchase Order ${report.po_number}`}
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
                                                    >
                                                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                                        <span className="hidden md:inline">Purchase Order:</span>
                                                        <span className="font-mono">{report.po_number}</span>
                                                    </button>
                                                    <button
                                                        onClick={() => setPreviewDoc({
                                                            id: report.ack_id,
                                                            name: `${report.ack_id}.pdf`,
                                                            vendor: report.vendor,
                                                            type: 'Acknowledgement',
                                                        })}
                                                        title={`Preview the original Acknowledgement ${report.ack_id}`}
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
                                                    >
                                                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                                                        <span className="hidden md:inline">Acknowledgement:</span>
                                                        <span className="font-mono">{report.ack_id}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })()}

                                    {/* Body — tab content */}
                                    <div className="flex-1 overflow-y-auto p-5">
                                        {tab === 'summary' && (
                                            <div className="space-y-5">
                                                <AckSummaryCard summary={report.summary} discrepancies={report.discrepancies} />
                                                <DiscrepancyList discrepancies={report.discrepancies} onPreviewDoc={setPreviewDoc} />
                                            </div>
                                        )}
                                        {tab === 'fields' && (
                                            <div className="border border-border rounded-xl overflow-hidden">
                                                <div className="grid grid-cols-[1.4fr_1fr_1fr_80px] bg-muted/30 border-b border-border px-4 py-2.5">
                                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Field</div>
                                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">PO value</div>
                                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">ACK value</div>
                                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Status</div>
                                                </div>
                                                {(report.validated_fields ?? []).length === 0 ? (
                                                    <div className="px-4 py-8 text-center text-xs text-muted-foreground">No fields validated.</div>
                                                ) : (report.validated_fields ?? []).map((f, idx) => (
                                                    <div key={idx} className={`grid grid-cols-[1.4fr_1fr_1fr_80px] gap-2 px-4 py-3 items-center border-b border-border last:border-b-0 ${f.matched ? '' : 'bg-red-50/30 dark:bg-red-500/5'}`}>
                                                        <div>
                                                            <div className="text-sm font-medium text-foreground">{f.field_label}</div>
                                                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{f.category.replace('_', ' ')}</div>
                                                        </div>
                                                        <div className={`text-sm font-mono ${f.matched ? 'text-foreground' : 'text-muted-foreground line-through decoration-red-400/60'}`}>{f.po_value}</div>
                                                        <div className={`text-sm font-mono ${f.matched ? 'text-foreground' : 'text-red-700 dark:text-red-300 font-semibold'}`}>{f.ack_value}</div>
                                                        <div className="flex justify-end"><MatchedPill matched={f.matched} /></div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {tab === 'lineItems' && (
                                            <div className="border border-border rounded-xl overflow-x-auto">
                                                <table className="w-full min-w-[760px]">
                                                    <thead>
                                                        <tr className="border-b border-border bg-muted/30">
                                                            <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-2.5">#</th>
                                                            <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-2.5">Product</th>
                                                            <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-2.5">Description</th>
                                                            <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-2.5">PO Qty</th>
                                                            <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-2.5">ACK Qty</th>
                                                            <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-2.5">Unit Price</th>
                                                            <th className="text-right text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-2.5">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(report.validated_line_items ?? []).length === 0 ? (
                                                            <tr><td colSpan={7} className="px-3 py-8 text-center text-xs text-muted-foreground">No line items validated.</td></tr>
                                                        ) : (report.validated_line_items ?? []).map(li => (
                                                            <tr key={li.line} className={`border-b border-border last:border-b-0 ${li.matched ? '' : 'bg-red-50/30 dark:bg-red-500/5'}`}>
                                                                <td className="px-3 py-3 text-sm font-mono text-muted-foreground">{li.line}</td>
                                                                <td className="px-3 py-3 text-sm font-mono font-semibold text-foreground">{li.product_number}</td>
                                                                <td className="px-3 py-3 text-sm text-foreground">{li.description}</td>
                                                                <td className={`px-3 py-3 text-sm font-mono ${li.matched ? 'text-foreground' : 'text-muted-foreground line-through decoration-red-400/60'}`}>{li.po_quantity}</td>
                                                                <td className={`px-3 py-3 text-sm font-mono ${li.matched ? 'text-foreground' : 'text-red-700 dark:text-red-300 font-bold'}`}>{li.ack_quantity}</td>
                                                                <td className="px-3 py-3 text-sm font-mono text-foreground">{li.po_unit_price}</td>
                                                                <td className="px-3 py-3 text-right"><MatchedPill matched={li.matched} /></td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer — decision row */}
                                    <div className="border-t border-border p-4 bg-muted/20">
                                        <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="text-muted-foreground">Routing:</span>
                                                <span className="font-bold text-foreground">{routingLabel(report.routing)}</span>
                                                <span className="text-muted-foreground hidden sm:inline">·</span>
                                                <span className="text-muted-foreground hidden sm:inline">{report.routing.confidence_score}% confidence</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                onClick={() => onDecision?.('ACCEPT')}
                                                className={`inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-bold rounded-lg transition-colors ${actionButtonClasses('ACCEPT', report.routing.suggested_action)}`}
                                            >
                                                <CheckCircle2 className="h-4 w-4" />
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => setShowAssignReviewer(true)}
                                                title="Assign this report to a teammate for a second look"
                                                className={`inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-bold rounded-lg transition-colors ${actionButtonClasses('REQUEST_REVIEW', report.routing.suggested_action)}`}
                                            >
                                                <MessageSquareWarning className="h-4 w-4" />
                                                Review
                                            </button>
                                            <button
                                                onClick={() => onDecision?.('REJECT')}
                                                className={`inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-bold rounded-lg transition-colors ${actionButtonClasses('REJECT', report.routing.suggested_action)}`}
                                            >
                                                <XCircle className="h-4 w-4" />
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>

            <AssignReviewerModal
                isOpen={showAssignReviewer}
                onClose={() => setShowAssignReviewer(false)}
                report={report}
                onAssign={member => {
                    setShowAssignReviewer(false)
                    onDecision?.('REQUEST_REVIEW', member)
                }}
            />

            <PdfPreviewModal
                isOpen={previewDoc !== null}
                onClose={() => setPreviewDoc(null)}
                doc={previewDoc}
            />
        </Transition>
    )
}
