import { Fragment, useRef, useState } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { X, Upload, Package, FileText, Clipboard, ChevronLeft, Loader2, CheckCircle2 } from 'lucide-react'
import type { OcrDocType } from './OcrDocCard'

type UploadStep = 'select' | 'dropzone' | 'review' | 'uploading' | 'complete'

interface SelectedFile {
    id: string
    name: string
    sizeBytes: number
    isValid: boolean
    error?: string
}

interface UploadDocumentModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (docType: OcrDocType, files: { name: string; sizeBytes: number }[]) => void
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

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  // 10 MB

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function makeFileEntry(file: File): SelectedFile {
    const isValid = file.size <= MAX_FILE_SIZE_BYTES
    return {
        id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        sizeBytes: file.size,
        isValid,
        error: isValid ? undefined : 'PDF file size must be less than 10MB',
    }
}

export default function UploadDocumentModal({ isOpen, onClose, onConfirm }: UploadDocumentModalProps) {
    const [step, setStep] = useState<UploadStep>('select')
    const [selectedType, setSelectedType] = useState<OcrDocType | null>(null)
    const [files, setFiles] = useState<SelectedFile[]>([])
    const [dragging, setDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const reset = () => {
        setStep('select')
        setSelectedType(null)
        setFiles([])
        setDragging(false)
    }

    const handleClose = () => {
        reset()
        onClose()
    }

    const handleSelectType = (type: OcrDocType) => {
        setSelectedType(type)
        setStep('dropzone')
    }

    const handleBackToSelect = () => {
        setStep('select')
        setSelectedType(null)
    }

    const handleAddFiles = (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return
        const newEntries = Array.from(fileList).map(makeFileEntry)
        setFiles(prev => [...prev, ...newEntries])
        setStep('review')
    }

    const handleRemoveFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id))
    }

    const handleAddMoreFiles = () => {
        fileInputRef.current?.click()
    }

    const validFiles = files.filter(f => f.isValid)

    const handleStartUpload = () => {
        if (validFiles.length === 0 || !selectedType) return
        setStep('uploading')
        // Simulated upload — replace with real upload call when backend is ready.
        setTimeout(() => {
            setStep('complete')
        }, 1500)
    }

    const handleDone = () => {
        if (selectedType) {
            onConfirm(selectedType, validFiles.map(f => ({ name: f.name, sizeBytes: f.sizeBytes })))
        }
        reset()
        onClose()
    }

    const handleUploadMore = () => {
        // Notify parent of the just-uploaded batch, then reset to step 1.
        if (selectedType) {
            onConfirm(selectedType, validFiles.map(f => ({ name: f.name, sizeBytes: f.sizeBytes })))
        }
        reset()
    }

    const subtitle = (() => {
        switch (step) {
            case 'select': return 'Select the document type'
            case 'dropzone': return `Drop PDF files here or click to select · ${selectedType}`
            case 'review': return `Review files · ${selectedType}`
            case 'uploading': return `Uploading ${selectedType} files...`
            case 'complete': return 'Document files have been processed'
        }
    })()

    const title = (() => {
        switch (step) {
            case 'review': return `${files.length} File${files.length === 1 ? '' : 's'} Selected`
            case 'uploading': return `Uploading ${validFiles.length} Document${validFiles.length === 1 ? '' : 's'}`
            case 'complete': return 'Upload Complete'
            default: return 'Upload Document'
        }
    })()

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
                                <div className="flex items-start gap-2">
                                    {step === 'dropzone' && (
                                        <button
                                            onClick={handleBackToSelect}
                                            aria-label="Back to type selection"
                                            className="p-1 -ml-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                    )}
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground">{title}</h2>
                                        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
                                    </div>
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

                            {step === 'dropzone' && selectedType && (
                                <div className="p-6 pt-2">
                                    <div
                                        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                                        onDragLeave={() => setDragging(false)}
                                        onDrop={(e) => {
                                            e.preventDefault()
                                            setDragging(false)
                                            handleAddFiles(e.dataTransfer.files)
                                        }}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                                            dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'
                                        }`}
                                    >
                                        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-base font-bold text-foreground">Drag PDFs here or click to browse</p>
                                        <p className="text-xs text-muted-foreground mt-1">PDF files up to 10MB each</p>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="application/pdf,.pdf"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => handleAddFiles(e.target.files)}
                                    />
                                </div>
                            )}

                            {step === 'review' && selectedType && (
                                <div className="p-6 pt-2 space-y-4">
                                    <button
                                        onClick={handleAddMoreFiles}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium text-muted-foreground border-2 border-dashed border-border rounded-xl hover:border-primary hover:text-foreground hover:bg-muted/30 transition-all"
                                    >
                                        <Upload className="h-4 w-4" />
                                        Add more files
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="application/pdf,.pdf"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => handleAddFiles(e.target.files)}
                                    />

                                    <div className="space-y-2">
                                        {files.map(f => (
                                            <div
                                                key={f.id}
                                                className={`flex items-center gap-3 p-3 rounded-lg border ${
                                                    f.isValid
                                                        ? 'bg-background border-border'
                                                        : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30'
                                                }`}
                                            >
                                                <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                                    <FileText className={`h-4 w-4 ${f.isValid ? 'text-foreground' : 'text-red-600 dark:text-red-300'}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-bold text-foreground truncate">{f.name}</div>
                                                    <div className={`text-xs ${f.isValid ? 'text-muted-foreground' : 'text-red-600 dark:text-red-300'}`}>
                                                        {f.isValid ? formatFileSize(f.sizeBytes) : f.error}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveFile(f.id)}
                                                    aria-label="Remove file"
                                                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleClose}
                                            className="flex-1 px-4 py-3 text-sm font-medium bg-background border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleStartUpload}
                                            disabled={validFiles.length === 0}
                                            className="flex-1 px-4 py-3 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Upload {validFiles.length} file{validFiles.length === 1 ? '' : 's'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 'uploading' && (
                                <div className="p-6 pt-2 space-y-2">
                                    {validFiles.map(f => (
                                        <div key={f.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background">
                                            <Loader2 className="h-5 w-5 text-muted-foreground animate-spin shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-bold text-foreground truncate">{f.name}</div>
                                                <div className="text-xs text-muted-foreground">Uploading...</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {step === 'complete' && (
                                <div className="p-6 pt-2 space-y-5">
                                    <div className="flex flex-col items-center gap-3 py-2">
                                        <div className="h-14 w-14 rounded-full bg-green-50 dark:bg-green-500/15 flex items-center justify-center">
                                            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-300" />
                                        </div>
                                        <p className="text-base font-bold text-foreground text-center">
                                            {validFiles.length} {selectedType} document{validFiles.length === 1 ? '' : 's'} uploaded successfully
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        {validFiles.map(f => (
                                            <div key={f.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background">
                                                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-300 shrink-0" />
                                                <div className="text-sm font-bold text-foreground truncate flex-1">{f.name}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleUploadMore}
                                            className="flex-1 px-4 py-3 text-sm font-medium bg-background border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
                                        >
                                            Upload More
                                        </button>
                                        <button
                                            onClick={handleDone}
                                            className="flex-1 px-4 py-3 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                        >
                                            Done
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
