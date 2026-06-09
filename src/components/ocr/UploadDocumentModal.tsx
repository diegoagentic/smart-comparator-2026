import { Fragment, useState } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { X, Upload, Package, FileText, Clipboard } from 'lucide-react'
import type { OcrDocType } from './OcrDocCard'

interface UploadDocumentModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (docType: OcrDocType) => void
}

interface DocTypeOption {
    type: OcrDocType
    label: string
    description: string
    icon: typeof Package
}

const DOC_TYPES: DocTypeOption[] = [
    { type: 'Purchase Order', label: 'Purchase Order', description: 'PO document from vendor', icon: Package },
    { type: 'Acknowledgment', label: 'Acknowledgment', description: 'ACK confirmation document', icon: FileText },
    { type: 'Quote', label: 'Quote', description: 'Vendor quote document', icon: Clipboard },
]

export default function UploadDocumentModal({ isOpen, onClose, onConfirm }: UploadDocumentModalProps) {
    const [step, setStep] = useState<'select' | 'upload'>('select')
    const [selectedType, setSelectedType] = useState<OcrDocType | null>(null)
    const [dragging, setDragging] = useState(false)

    const reset = () => {
        setStep('select')
        setSelectedType(null)
        setDragging(false)
    }

    const handleClose = () => {
        reset()
        onClose()
    }

    const handleSelectType = (type: OcrDocType) => {
        setSelectedType(type)
        setStep('upload')
    }

    const handleConfirm = () => {
        if (!selectedType) return
        onConfirm(selectedType)
        reset()
        onClose()
    }

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={handleClose} className="relative z-[200]">
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
                        <DialogPanel className="w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
                            <div className="flex items-start justify-between p-6 pb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">Upload Document</h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {step === 'select' ? 'Select the document type' : `Drop your ${selectedType} PDF or browse`}
                                    </p>
                                </div>
                                <button
                                    onClick={handleClose}
                                    aria-label="Close"
                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {step === 'select' && (
                                <div className="p-6 pt-2 space-y-3">
                                    {DOC_TYPES.map(opt => {
                                        const Icon = opt.icon
                                        return (
                                            <button
                                                key={opt.type}
                                                onClick={() => handleSelectType(opt.type)}
                                                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-background hover:border-primary hover:bg-muted/50 transition-all text-left group"
                                            >
                                                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                                                    <Icon className="h-5 w-5 text-foreground" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-base font-bold text-foreground">{opt.label}</div>
                                                    <div className="text-sm text-muted-foreground">{opt.description}</div>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            )}

                            {step === 'upload' && selectedType && (
                                <div className="p-6 pt-2 space-y-4">
                                    <button
                                        onClick={() => setStep('select')}
                                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        ← Change type
                                    </button>
                                    <div
                                        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                                        onDragLeave={() => setDragging(false)}
                                        onDrop={(e) => { e.preventDefault(); setDragging(false); handleConfirm() }}
                                        onClick={handleConfirm}
                                        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                                            dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'
                                        }`}
                                    >
                                        <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                        <p className="text-sm font-semibold text-foreground">Drop your {selectedType} PDF here</p>
                                        <p className="text-xs text-muted-foreground mt-1">or click to browse · simulated upload</p>
                                    </div>
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={handleClose}
                                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleConfirm}
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                        >
                                            <Upload className="h-4 w-4" />
                                            Simulate Upload
                                        </button>
                                    </div>
                                </div>
                            )}
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}
