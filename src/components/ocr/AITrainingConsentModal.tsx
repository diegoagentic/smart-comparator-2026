import { Fragment } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { Sparkles } from 'lucide-react'

interface AITrainingConsentModalProps {
    isOpen: boolean
    onAccept: () => void
    onDecline: () => void
    onCancel: () => void
    /** Kept for caller compatibility; the modal no longer surfaces specifics
        about what is shared — it just asks for consent. */
    editedCount?: number
    replacedCount?: number
}

export default function AITrainingConsentModal({
    isOpen,
    onAccept,
    onDecline,
    onCancel,
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
                                        <p className="text-xs text-muted-foreground mt-0.5">Make Strata smarter with every review</p>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Your review helps Strata get better at understanding documents like yours, so future suggestions need less manual work.
                                </p>
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
