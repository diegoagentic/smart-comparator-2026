import { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel, DialogTitle } from '@headlessui/react'
import { X, Sparkles, FileText, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react'

interface ConvertDocumentModalProps {
    isOpen: boolean
    onClose: () => void
    document: {
        id: string
        name: string
        vendor: string
        type: string
    } | null
    onConvert: (docId: string, convertTo: 'po' | 'ack') => void
}

type ConversionStep = 'confirm' | 'processing' | 'complete'

const PROCESSING_STEPS = [
    { label: 'Validating extracted fields...', duration: 800 },
    { label: 'Matching vendor catalog data...', duration: 600 },
    { label: 'Verifying line item integrity...', duration: 700 },
    { label: 'Generating document structure...', duration: 500 },
    { label: 'Applying business rules...', duration: 400 },
    { label: 'Finalizing...', duration: 300 },
]

export default function ConvertDocumentModal({ isOpen, onClose, document, onConvert }: ConvertDocumentModalProps) {
    const [step, setStep] = useState<ConversionStep>('confirm')
    const [processingIdx, setProcessingIdx] = useState(0)
    const [processingComplete, setProcessingComplete] = useState(false)

    const convertTo: 'po' | 'ack' = document?.type === 'Acknowledgment' ? 'ack' : 'po'
    const typeLabel = convertTo === 'po' ? 'Purchase Order' : 'Acknowledgment'

    useEffect(() => {
        if (isOpen) {
            setStep('confirm')
            setProcessingIdx(0)
            setProcessingComplete(false)
        }
    }, [isOpen])

    useEffect(() => {
        if (step !== 'processing') return
        if (processingIdx >= PROCESSING_STEPS.length) {
            setProcessingComplete(true)
            const t = setTimeout(() => setStep('complete'), 600)
            return () => clearTimeout(t)
        }
        const t = setTimeout(() => setProcessingIdx(prev => prev + 1), PROCESSING_STEPS[processingIdx].duration)
        return () => clearTimeout(t)
    }, [step, processingIdx])

    const handleConvert = () => {
        setStep('processing')
        setProcessingIdx(0)
    }

    const handleFinish = () => {
        onConvert(document?.id || '', convertTo)
        onClose()
    }

    const generatedId = convertTo === 'po'
        ? `PO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`
        : `ACK-${Math.floor(Math.random() * 9000) + 1000}`

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-card text-left shadow-2xl transition-all border border-border">

                                {/* Step 1: Confirm */}
                                {step === 'confirm' && (
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <DialogTitle className="text-lg font-bold text-foreground">Move to Transactions</DialogTitle>
                                                <p className="text-sm text-muted-foreground mt-1">This document will be created as a {typeLabel} in Transactions.</p>
                                            </div>
                                            <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-muted-foreground dark:hover:text-zinc-300 hover:bg-muted" title="Close">
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>

                                        {/* Document Info */}
                                        <div className="bg-muted dark:bg-zinc-800 rounded-xl p-4 mb-5">
                                            <div className="flex items-center gap-3 mb-3">
                                                <FileText className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">{document?.name}</p>
                                                    <p className="text-xs text-muted-foreground">{document?.vendor}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div><span className="text-muted-foreground">Type:</span> <span className="text-foreground font-medium">{typeLabel}</span></div>
                                                <div><span className="text-muted-foreground">Source:</span> <span className="text-foreground font-medium">{document?.type}</span></div>
                                            </div>
                                        </div>

                                        {/* AI Note */}
                                        <div className="bg-ai-light dark:bg-ai/10 border border-ai/20 rounded-xl p-3 mb-6 flex items-start gap-2">
                                            <Sparkles className="h-4 w-4 text-ai mt-0.5 shrink-0" />
                                            <p className="text-xs text-muted-foreground">
                                                AI detected this as {document?.type === 'Acknowledgment' ? 'an Acknowledgment' : 'a Purchase Order'} and will create the corresponding record with all extracted fields.
                                            </p>
                                        </div>

                                        <button
                                            onClick={handleConvert}
                                            className="w-full py-3 text-sm font-bold bg-brand-300 dark:bg-brand-500 text-zinc-900 rounded-xl hover:bg-brand-400 dark:hover:bg-brand-600/50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                        >
                                            Move to Transactions
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}

                                {/* Step 2: Processing */}
                                {step === 'processing' && (
                                    <div className="p-6">
                                        <div className="text-center mb-6">
                                            <div className="w-16 h-16 rounded-2xl bg-ai/10 flex items-center justify-center mx-auto mb-4">
                                                <Sparkles className={`h-8 w-8 text-ai ${!processingComplete ? 'animate-pulse' : ''}`} />
                                            </div>
                                            <h3 className="text-lg font-bold text-foreground">
                                                {processingComplete ? 'Transfer Complete' : 'Moving to Transactions...'}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {processingComplete ? `${typeLabel} created successfully` : 'Processing document data'}
                                            </p>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            {PROCESSING_STEPS.map((ps, i) => (
                                                <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                                                    i < processingIdx ? 'bg-success-light dark:bg-success/10' : i === processingIdx ? 'bg-ai-light dark:bg-ai/10' : 'opacity-40'
                                                }`}>
                                                    {i < processingIdx ? (
                                                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                                    ) : i === processingIdx ? (
                                                        <Loader2 className="h-4 w-4 text-ai shrink-0 animate-spin" />
                                                    ) : (
                                                        <div className="h-4 w-4 rounded-full border border-border shrink-0" />
                                                    )}
                                                    <span className={`text-xs font-medium ${
                                                        i < processingIdx ? 'text-success' : i === processingIdx ? 'text-ai' : 'text-muted-foreground'
                                                    }`}>{ps.label}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-ai rounded-full transition-all duration-300"
                                                style={{ width: `${(processingIdx / PROCESSING_STEPS.length) * 100}%` }} />
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Complete */}
                                {step === 'complete' && (
                                    <div className="p-6">
                                        <div className="text-center mb-6">
                                            <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                                                <CheckCircle2 className="h-8 w-8 text-success" />
                                            </div>
                                            <h3 className="text-lg font-bold text-foreground">{typeLabel} Created</h3>
                                            <p className="text-sm text-muted-foreground mt-1">Document is now available in Transactions</p>
                                        </div>

                                        <div className="bg-muted dark:bg-zinc-800 rounded-xl p-4 mb-6 border border-border">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="h-10 w-10 rounded-xl bg-brand-300 dark:bg-brand-500 text-zinc-900 flex items-center justify-center">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-foreground">{generatedId}</p>
                                                    <p className="text-xs text-muted-foreground">{document?.vendor}</p>
                                                </div>
                                                <span className="ml-auto text-[10px] font-bold px-2 py-1 rounded-full bg-success-light text-success">Active</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div><span className="text-muted-foreground">Source:</span> <span className="text-foreground font-medium">{document?.name}</span></div>
                                                <div><span className="text-muted-foreground">Type:</span> <span className="text-foreground font-medium">{typeLabel}</span></div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleFinish}
                                            className="w-full py-3 text-sm font-bold bg-brand-300 dark:bg-brand-500 text-zinc-900 rounded-xl hover:bg-brand-400 dark:hover:bg-brand-600/50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                        >
                                            View in Transactions
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
