import { Fragment, useEffect, useMemo, useState } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel, DialogTitle } from '@headlessui/react'
import { Archive, X, AlertTriangle, Info } from 'lucide-react'
import type { DeprecationReason, ActiveStatus } from './deprecated/types'
import { DEPRECATION_REASON_META, REASONS_BY_STATUS, isUnsupportedDocType } from './deprecated/types'
import ReplacementDocPicker, { type ReplacementCandidate } from './deprecated/ReplacementDocPicker'

// Reasons that semantically imply a "replacement" doc exists somewhere.
// For these we surface the picker; for the rest we hide it (keeps the modal lean).
const REASONS_WITH_REPLACEMENT: DeprecationReason[] = [
    'superseded',
    'vendor_correction',
    'duplicate',
    'merged',
]

interface DocumentDeprecationModalProps {
    isOpen: boolean
    onClose: () => void
    /** Required to filter the available reason list and to show context-aware warning. */
    document: {
        id: string
        name: string
        vendor: string
        type: string
        status: ActiveStatus
    } | null
    /** Other active documents that could be the replacement. */
    candidates?: ReplacementCandidate[]
    onConfirm: (payload: {
        docId: string
        reason: DeprecationReason
        customReason?: string
        replacementId?: string
    }) => void
}

const STATUS_WARNING: Record<ActiveStatus, string | null> = {
    identified: 'OCR processing for this document will be aborted.',
    capturing: 'Field extraction in progress will be discarded.',
    inconsistencies: 'Expert Hub work in progress will be archived.',
    processed: 'This document was ready to create an Orderbahn record.',
}

export default function DocumentDeprecationModal({
    isOpen,
    onClose,
    document,
    candidates = [],
    onConfirm,
}: DocumentDeprecationModalProps) {
    const [reason, setReason] = useState<DeprecationReason | null>(null)
    const [customReason, setCustomReason] = useState('')
    const [replacementId, setReplacementId] = useState<string | null>(null)

    // Reset state on close
    useEffect(() => {
        if (!isOpen) {
            const t = setTimeout(() => {
                setReason(null)
                setCustomReason('')
                setReplacementId(null)
            }, 200)
            return () => clearTimeout(t)
        }
    }, [isOpen])

    const isUnsupported = !!document && isUnsupportedDocType(document.type)

    // Auto-select 'unsupported_type' when modal opens for unsupported doc types
    useEffect(() => {
        if (isOpen && isUnsupported && reason === null) {
            setReason('unsupported_type')
        }
    }, [isOpen, isUnsupported, reason])

    // Clear replacement when reason switches to one that doesn't support it
    useEffect(() => {
        if (reason && !REASONS_WITH_REPLACEMENT.includes(reason)) {
            setReplacementId(null)
        }
    }, [reason])

    // Reorder reasons so 'unsupported_type' appears first when applicable.
    const availableReasons = useMemo<DeprecationReason[]>(() => {
        if (!document) return ['other']
        const base = REASONS_BY_STATUS[document.status] ?? ['other']
        if (!isUnsupported) return base
        const reordered = base.filter(r => r !== 'unsupported_type')
        return ['unsupported_type', ...reordered]
    }, [document, isUnsupported])

    if (!document) return null

    const warning = STATUS_WARNING[document.status]
    const isOther = reason === 'other'
    const showReplacementPicker = reason !== null && REASONS_WITH_REPLACEMENT.includes(reason)
    const customReasonValid = !isOther || customReason.trim().length > 0
    const canConfirm = reason !== null && customReasonValid

    const handleConfirm = () => {
        if (!canConfirm || !reason) return
        onConfirm({
            docId: document.id,
            reason,
            customReason: isOther ? customReason.trim() : undefined,
            replacementId: replacementId ?? undefined,
        })
    }

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[210]" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-zinc-900/50 backdrop-blur-md" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-200" enterFrom="opacity-0 translate-y-2 scale-[0.98]" enterTo="opacity-100 translate-y-0 scale-100"
                            leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-[0.98]"
                        >
                            <DialogPanel className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col">
                                {/* Header */}
                                <div className="px-5 py-4 border-b border-border flex items-start gap-3">
                                    <div className="flex items-center justify-center size-9 rounded-lg bg-muted text-muted-foreground dark:text-zinc-300 shrink-0">
                                        <Archive className="size-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <DialogTitle as="h3" className="text-[16px] font-semibold text-foreground">
                                            Mark as Deprecated
                                        </DialogTitle>
                                        <p className="text-[12.5px] text-muted-foreground mt-0.5">
                                            <span className="font-mono">{document.id}</span> · {document.vendor}
                                        </p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        title="Close without archiving"
                                        aria-label="Close"
                                        className="size-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
                                    >
                                        <X className="size-4" />
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="px-5 py-4 space-y-4">
                                    {/* Phase-policy hint when doc type is unsupported */}
                                    {isUnsupported && (
                                        <div className="flex items-start gap-2 rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 px-3 py-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
                                            <Info className="size-4 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                                            <div className="text-[12.5px] text-orange-900 dark:text-orange-200 leading-relaxed">
                                                <span className="font-semibold">{document.type}s aren't processed in this phase.</span>{' '}
                                                <span className="text-orange-800/90 dark:text-orange-200/80">
                                                    We've pre-selected <span className="font-medium">Out of scope</span> as the recommended reason — change it if a different one fits better.
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                                        This document will move to the archive. It won't appear in the active funnel anymore — but you'll still be able to find it in the <span className="font-medium text-foreground/80">Deprecated</span> tab.
                                    </p>

                                    {/* Reason picker */}
                                    <div>
                                        <div className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-2">
                                            Reason <span className="text-red-600 dark:text-red-400">*</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {availableReasons.map(r => {
                                                const meta = DEPRECATION_REASON_META[r]
                                                const active = reason === r
                                                const isRecommended = isUnsupported && r === 'unsupported_type'
                                                return (
                                                    <div key={r} className="relative group/reason">
                                                        <button
                                                            onClick={() => setReason(r)}
                                                            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left transition-colors ${
                                                                active
                                                                    ? 'border-foreground bg-muted/60'
                                                                    : isRecommended
                                                                        ? 'border-orange-200 dark:border-orange-500/30 bg-orange-50/50 dark:bg-orange-500/5 hover:bg-orange-50 dark:hover:bg-orange-500/10'
                                                                        : 'border-border hover:bg-muted/40'
                                                            }`}
                                                        >
                                                            <span className={`size-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                                                active ? 'border-foreground' : 'border-zinc-400 dark:border-zinc-600'
                                                            }`}>
                                                                {active && <span className="size-1.5 rounded-full bg-foreground" />}
                                                            </span>
                                                            <span className="text-[12.5px] font-medium text-foreground leading-tight">
                                                                {meta.label}
                                                                {isRecommended && (
                                                                    <span className="ml-1.5 text-[9px] font-semibold tracking-[0.08em] uppercase px-1 py-0.5 rounded bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300">
                                                                        Rec.
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </button>
                                                        {/* Tooltip on hover */}
                                                        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-max max-w-[180px] rounded-md bg-zinc-900 dark:bg-zinc-100 px-2.5 py-1.5 text-[11px] text-white dark:text-zinc-900 shadow-lg opacity-0 group-hover/reason:opacity-100 transition-opacity duration-150 z-10 text-center leading-snug">
                                                            {meta.description}
                                                            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-100" />
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Custom reason field — appears when "Other" is selected */}
                                    {isOther && (
                                        <div className="animate-in fade-in slide-in-from-top-1 duration-150">
                                            <label className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-muted-foreground block mb-2">
                                                Custom reason <span className="text-red-600 dark:text-red-400">*</span>
                                            </label>
                                            <textarea
                                                autoFocus
                                                value={customReason}
                                                onChange={(e) => setCustomReason(e.target.value)}
                                                placeholder="Describe why this document is being deprecated…"
                                                rows={3}
                                                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-colors resize-none"
                                            />
                                        </div>
                                    )}

                                    {/* Replacement picker — appears for reasons that imply a newer/canonical doc */}
                                    {showReplacementPicker && (
                                        <div className="animate-in fade-in slide-in-from-top-1 duration-150">
                                            <ReplacementDocPicker
                                                candidates={candidates}
                                                vendorPriority={document.vendor}
                                                excludeId={document.id}
                                                selectedId={replacementId}
                                                onChange={setReplacementId}
                                            />
                                        </div>
                                    )}

                                    {/* Status-specific warning */}
                                    {warning && (
                                        <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-3 py-2">
                                            <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                            <div className="text-[12px] text-amber-800 dark:text-amber-200 leading-relaxed">
                                                {warning}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer actions */}
                                <div className="px-5 py-3 border-t border-border bg-muted/30 flex items-center justify-end gap-2">
                                    <button
                                        onClick={onClose}
                                        title="Close without archiving"
                                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card hover:bg-muted px-4 py-2 text-[13px] font-medium text-foreground transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        disabled={!canConfirm}
                                        onClick={handleConfirm}
                                        title={canConfirm ? 'Move document to the archive' : 'Pick a reason first'}
                                        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${
                                            canConfirm
                                                ? 'bg-foreground text-background hover:opacity-90'
                                                : 'bg-muted text-muted-foreground cursor-not-allowed'
                                        }`}
                                    >
                                        <Archive className="size-3.5" />
                                        Mark as Deprecated
                                    </button>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
