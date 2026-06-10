import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { X, FileText, ExternalLink, Loader2 } from 'lucide-react'
import { generateOriginalMockPdfUrl, openOriginalMockPdf } from '../../utils/viewOriginalMockPdf'

interface PdfPreviewDoc {
    id: string
    name: string
    vendor: string
    type: string
}

interface PdfPreviewModalProps {
    isOpen: boolean
    onClose: () => void
    /** Doc descriptor to render. When null the modal stays closed. */
    doc: PdfPreviewDoc | null
}

/**
 * Floating PDF preview that renders the mock document inside an iframe,
 * filling most of the viewport. Keeps the comparison flow inside one
 * window — no new tabs, no losing context. The user can still pop out
 * via "Open in new tab" if they need the browser's PDF UI.
 */
export default function PdfPreviewModal({ isOpen, onClose, doc }: PdfPreviewModalProps) {
    const [url, setUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    // Generate the PDF blob URL whenever the doc changes. Revoke when
    // the doc closes or the component unmounts so we don't leak blobs.
    useEffect(() => {
        if (!isOpen || !doc) {
            return
        }
        let cancelled = false
        let createdUrl: string | null = null
        setLoading(true)
        setUrl(null)
        generateOriginalMockPdfUrl(doc).then(u => {
            if (cancelled) {
                URL.revokeObjectURL(u)
                return
            }
            createdUrl = u
            setUrl(u)
            setLoading(false)
        })
        return () => {
            cancelled = true
            if (createdUrl) URL.revokeObjectURL(createdUrl)
        }
    }, [isOpen, doc])

    const docLabel = doc ? `${doc.id} · ${doc.type}` : ''

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-[220]">
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 flex items-center justify-center p-3">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-[96vw] h-[94vh] max-w-[1400px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border bg-muted/30">
                                <div className="flex items-center gap-2 min-w-0">
                                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="font-mono text-sm font-semibold text-foreground truncate">{docLabel}</span>
                                    {doc && (
                                        <span className="text-xs text-muted-foreground truncate">· {doc.vendor}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        onClick={() => doc && openOriginalMockPdf(doc)}
                                        title="Open this document in a new browser tab"
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                        <span className="hidden sm:inline">Open in new tab</span>
                                    </button>
                                    <button
                                        onClick={onClose}
                                        aria-label="Close preview"
                                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* PDF body — fills remaining space */}
                            <div className="flex-1 bg-muted/40 relative">
                                {loading && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted/40">
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">Generating document…</span>
                                    </div>
                                )}
                                {url && (
                                    <iframe
                                        src={url}
                                        title={`Original document ${docLabel}`}
                                        className="w-full h-full border-0"
                                    />
                                )}
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}
