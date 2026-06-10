import { Fragment } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { Sparkles, Pencil, FileText, ShieldCheck } from 'lucide-react'

interface AITrainingConsentModalProps {
    isOpen: boolean
    onAccept: () => void
    onDecline: () => void
    onCancel: () => void
    editedCount: number
    replacedCount: number
}

export default function AITrainingConsentModal({
    isOpen,
    onAccept,
    onDecline,
    onCancel,
    editedCount,
    replacedCount,
}: AITrainingConsentModalProps) {
    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={onCancel} className="relative z-[210]">
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
                        <DialogPanel className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="p-6 pb-4">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="h-10 w-10 rounded-xl bg-brand-300/40 dark:bg-brand-500/20 flex items-center justify-center shrink-0">
                                        <Sparkles className="h-5 w-5 text-zinc-800 dark:text-zinc-200" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-lg font-bold text-foreground">Help train Strata AI?</h2>
                                        <p className="text-xs text-muted-foreground mt-0.5">Your input improves future suggestions</p>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Your edits help our AI understand documents like yours. With your permission, we'll use this session's changes anonymously to improve future suggestions.
                                </p>
                            </div>

                            {/* What's shared */}
                            <div className="px-6 pb-4">
                                <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                                        <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">What we'd share</h3>
                                    </div>
                                    {editedCount > 0 && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Pencil className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                            <span className="text-foreground">
                                                <span className="font-bold">{editedCount}</span> field{editedCount === 1 ? '' : 's'} you edited
                                            </span>
                                        </div>
                                    )}
                                    {replacedCount > 0 && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Sparkles className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                            <span className="text-foreground">
                                                <span className="font-bold">{replacedCount}</span> SKU{replacedCount === 1 ? '' : 's'} you replaced via AI suggestions
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-sm">
                                        <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                        <span className="text-foreground">Anonymized document metadata (vendor, type, line count)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="px-6 pb-5 space-y-2">
                                <button
                                    onClick={onAccept}
                                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    <Sparkles className="h-4 w-4" />
                                    Yes, help train AI
                                </button>
                                <button
                                    onClick={onDecline}
                                    className="w-full px-4 py-3 text-sm font-medium bg-background border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
                                >
                                    No, just save
                                </button>
                                <button
                                    onClick={onCancel}
                                    className="w-full px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Cancel — back to review
                                </button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}
