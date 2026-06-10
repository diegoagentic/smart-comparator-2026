import { Fragment } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { X, ArrowLeftRight, Loader2, CheckCircle2, XCircle, MessageSquareWarning, GitCompare } from 'lucide-react'
import type { ComparisonReport, DecisionAction } from './comparisonTypes'
import DerivedStatusBadge from './DerivedStatusBadge'
import AckSummaryCard from './AckSummaryCard'
import DiscrepancyList from './DiscrepancyList'

interface ComparisonReviewModalProps {
    isOpen: boolean
    onClose: () => void
    /** null while processing. */
    report: ComparisonReport | null
    /** When true, render the spinner instead of the report. */
    processing: boolean
    onDecision?: (action: DecisionAction) => void
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

export default function ComparisonReviewModal({ isOpen, onClose, report, processing, onDecision }: ComparisonReviewModalProps) {
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
                        <DialogPanel className="w-full max-w-2xl max-h-[90vh] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col">

                            {/* Processing state */}
                            {processing && (
                                <div className="p-12 flex flex-col items-center justify-center text-center">
                                    <div className="h-14 w-14 rounded-full bg-brand-300/30 dark:bg-brand-500/20 flex items-center justify-center mb-4">
                                        <Loader2 className="h-7 w-7 text-zinc-800 dark:text-zinc-200 animate-spin" />
                                    </div>
                                    <h2 className="text-lg font-bold text-foreground mb-1">Comparing PO and ACK…</h2>
                                    <p className="text-sm text-muted-foreground">Strata AI is analyzing the documents and computing discrepancies.</p>
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
                                                <h2 className="text-base font-bold text-foreground">PO vs ACK comparison</h2>
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
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                                            <span className="font-mono font-semibold text-foreground">{report.po_number}</span>
                                            <ArrowLeftRight className="h-3 w-3" />
                                            <span className="font-mono font-semibold text-foreground">{report.ack_id}</span>
                                            <span>·</span>
                                            <span>{report.vendor}</span>
                                            <span>·</span>
                                            <span>{Math.round(report.overall_similarity_score * 100)}% match</span>
                                            <span>·</span>
                                            <span>Run #{report.run_number}</span>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="flex-1 overflow-y-auto p-5 space-y-5">
                                        <AckSummaryCard summary={report.summary} discrepancies={report.discrepancies} />
                                        <DiscrepancyList discrepancies={report.discrepancies} />
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
                                                onClick={() => onDecision?.('REQUEST_REVIEW')}
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
        </Transition>
    )
}
