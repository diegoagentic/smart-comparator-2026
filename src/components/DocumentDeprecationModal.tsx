import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { X } from 'lucide-react'
import type { DeprecationReason, ActiveStatus } from './deprecated/types'
import type { ReplacementCandidate } from './deprecated/ReplacementDocPicker'

interface DocumentDeprecationModalProps {
    isOpen: boolean
    onClose: () => void
    document: {
        id: string
        name: string
        vendor: string
        type: string
        status: ActiveStatus
    } | null
    /** Kept for backwards compat with caller; not surfaced in the simplified flow. */
    candidates?: ReplacementCandidate[]
    onConfirm: (payload: {
        docId: string
        reason: DeprecationReason
        customReason?: string
        replacementId?: string
    }) => void
}

type SimpleReason = 'manually_archived' | 'duplicate' | 'other'

const REASON_OPTIONS: { id: SimpleReason; label: string }[] = [
    { id: 'manually_archived', label: 'Manually Archived' },
    { id: 'duplicate', label: 'Duplicated' },
    { id: 'other', label: 'Other' },
]

export default function DocumentDeprecationModal({
    isOpen,
    onClose,
    document,
    onConfirm,
}: DocumentDeprecationModalProps) {
    const [reason, setReason] = useState<SimpleReason | null>(null)
    const [isDeprecating, setIsDeprecating] = useState(false)

    useEffect(() => {
        if (!isOpen) {
            const t = setTimeout(() => {
                setReason(null)
                setIsDeprecating(false)
            }, 200)
            return () => clearTimeout(t)
        }
    }, [isOpen])

    if (!document) return null

    const handleConfirm = () => {
        if (!reason || isDeprecating) return
        setIsDeprecating(true)
        // Brief "Deprecating..." state before firing the confirm, so the user
        // sees the button transition (matches prod feedback).
        setTimeout(() => {
            onConfirm({
                docId: document.id,
                reason: reason as DeprecationReason,
            })
        }, 700)
    }

    const canConfirm = !!reason && !isDeprecating

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={() => { if (!isDeprecating) onClose() }} className="relative z-[200]">
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
                        <DialogPanel className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
                            <div className="p-6 pb-4">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <h2 className="text-xl font-bold text-foreground">Deprecate Document?</h2>
                                    <button
                                        onClick={onClose}
                                        disabled={isDeprecating}
                                        aria-label="Close"
                                        className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Are you sure you want to send <span className="font-semibold text-foreground">"{document.vendor || document.name}"</span> to the deprecated section?
                                </p>
                            </div>

                            <div className="px-6 pt-2 pb-4">
                                <h3 className="text-base font-bold text-foreground mb-3">Select a Reason for Deprecation</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {REASON_OPTIONS.slice(0, 2).map(opt => (
                                        <label
                                            key={opt.id}
                                            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                                                reason === opt.id
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border hover:bg-muted'
                                            } ${isDeprecating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <input
                                                type="radio"
                                                name="deprecation-reason"
                                                value={opt.id}
                                                checked={reason === opt.id}
                                                disabled={isDeprecating}
                                                onChange={() => setReason(opt.id)}
                                                className="h-4 w-4 accent-primary"
                                            />
                                            <span className="text-sm text-foreground">{opt.label}</span>
                                        </label>
                                    ))}
                                    <label
                                        className={`col-span-2 sm:col-span-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors w-fit min-w-[140px] ${
                                            reason === 'other'
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:bg-muted'
                                        } ${isDeprecating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="deprecation-reason"
                                            value="other"
                                            checked={reason === 'other'}
                                            disabled={isDeprecating}
                                            onChange={() => setReason('other')}
                                            className="h-4 w-4 accent-primary"
                                        />
                                        <span className="text-sm text-foreground">Other</span>
                                    </label>
                                </div>
                            </div>

                            <div className="px-6 py-4 flex items-center gap-3">
                                <button
                                    onClick={onClose}
                                    disabled={isDeprecating}
                                    className="flex-1 px-4 py-3 text-sm font-bold text-foreground border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={!canConfirm}
                                    className={`flex-1 px-4 py-3 text-sm font-bold rounded-lg transition-colors ${
                                        canConfirm
                                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                            : isDeprecating
                                                ? 'bg-primary/30 text-primary-foreground/70 cursor-wait'
                                                : 'bg-primary/20 text-primary-foreground/50 cursor-not-allowed'
                                    }`}
                                >
                                    {isDeprecating ? 'Deprecating…' : 'Confirm'}
                                </button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}
