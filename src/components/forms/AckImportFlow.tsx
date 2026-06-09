import { useState, useEffect } from 'react'
import {
    CloudArrowUpIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ArrowRightIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

export interface AckFormData {
    ackNumber: string
    ackDate: string
    poNumber: string
    orderNumber: string
    shipDate: string
    vendorName: string
    vendorAddress: string
    billToName: string
    billToAddress: string
    shipTo: string
    shipVia: string
    freightTerms: string
    salesRep: string
    salesEmail: string
    notes: string
    items: { id: string; description: string; qty: number; unitPrice: number; total: number; status: string }[]
}

interface AckImportFlowProps {
    onImportComplete: (data: AckFormData) => void
    onCancel: () => void
}

const MOCK_EXTRACTED_ACK: AckFormData = {
    ackNumber: 'ACK-3102',
    ackDate: '2026-01-15',
    poNumber: 'ORD-2055',
    orderNumber: 'SO 1151064-C',
    shipDate: '2026-02-10',
    vendorName: 'AIS — Affordable Interior Systems',
    vendorAddress: '555 Industrial Blvd, Lenexa, KS 66215',
    billToName: 'Strata Workplace Solutions',
    billToAddress: '3400 Pegasus Park Dr, Dallas, TX 75247',
    shipTo: '1200 Commerce Dr, Suite 400, Dallas, TX 75201',
    shipVia: 'AIS Fleet — White Glove',
    freightTerms: 'Prepaid & Add',
    salesRep: 'Sarah Johnson',
    salesEmail: 'sjohnson@ais-furniture.com',
    notes: 'Imported from vendor acknowledgement file',
    items: [
        { id: 'ack-1', description: 'TBL, REC, 30Dx60Wx29H', qty: 4, unitPrice: 479.18, total: 1916.72, status: 'Confirmed' },
        { id: 'ack-2', description: 'CBX Full Depth BBF Ped', qty: 4, unitPrice: 398.24, total: 1592.96, status: 'Confirmed' },
        { id: 'ack-3', description: 'WORKSURFACE RECT 30Dx72W', qty: 6, unitPrice: 249.28, total: 1495.68, status: 'Confirmed' },
        { id: 'ack-4', description: 'LB LOUNGE 2 SEAT 34"H', qty: 2, unitPrice: 2031.12, total: 4062.24, status: 'Exception: Finish' },
    ]
}

export default function AckImportFlow({ onImportComplete, onCancel }: AckImportFlowProps) {
    const [status, setStatus] = useState<'upload' | 'processing' | 'review'>('upload')
    const [progress, setProgress] = useState(0)
    const [dragActive, setDragActive] = useState(false)
    const [fileName, setFileName] = useState('')

    useEffect(() => {
        if (status === 'processing') {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval)
                        setStatus('review')
                        return 100
                    }
                    return prev + 4
                })
            }, 80)
            return () => clearInterval(interval)
        }
    }, [status])

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
        else if (e.type === 'dragleave') setDragActive(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFileName(e.dataTransfer.files[0].name)
            setStatus('processing')
        }
    }

    const handleFileSelect = () => {
        setFileName('AIS_Acknowledgement_SO1151064C.pdf')
        setStatus('processing')
    }

    const confirmedCount = MOCK_EXTRACTED_ACK.items.filter(i => i.status === 'Confirmed').length
    const exceptionCount = MOCK_EXTRACTED_ACK.items.filter(i => i.status.startsWith('Exception')).length

    return (
        <div className="h-[600px] flex flex-col bg-muted/30">
            <div className="px-8 py-6 border-b border-border bg-background flex items-center gap-4">
                <button onClick={onCancel} className="p-2 -ml-2 rounded-lg hover:bg-accent transition-colors">
                    <ArrowRightIcon className="w-5 h-5 rotate-180 text-muted-foreground" />
                </button>
                <div>
                    <h2 className="text-xl font-brand font-bold text-foreground">Import Acknowledgement</h2>
                    <p className="text-sm text-muted-foreground">Upload a PDF or SIF file to auto-parse vendor acknowledgement data.</p>
                </div>
            </div>

            <div className="flex-1 p-8 overflow-y-auto">
                {status === 'upload' && (
                    <div className="h-full flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div
                            className={clsx(
                                "w-full max-w-xl p-12 rounded-3xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer",
                                dragActive
                                    ? "border-primary bg-primary/5 scale-[1.02]"
                                    : "border-input hover:border-primary/50 hover:bg-accent/50"
                            )}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={handleFileSelect}
                        >
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                                <CloudArrowUpIcon className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">Drop your file here to upload</h3>
                            <p className="text-muted-foreground mb-4 max-w-sm">
                                Support for vendor acknowledgement PDFs and SIF (Standard Industry Format) files. We'll automatically extract line items and match against existing POs.
                            </p>
                            <div className="flex items-center gap-3 mb-6">
                                <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium">PDF</span>
                                <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-medium">SIF</span>
                                <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">EDI 855</span>
                            </div>
                            <button className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-sm">
                                Select File
                            </button>
                        </div>
                    </div>
                )}

                {status === 'processing' && (
                    <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
                        <div className="w-full max-w-md space-y-8">
                            <div className="relative w-24 h-24 mx-auto">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-200 dark:text-zinc-800" />
                                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                                        strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * progress / 100)}
                                        className="text-primary transition-all duration-300 ease-linear" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-primary">{progress}%</div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-foreground mb-2">Parsing Acknowledgement...</h3>
                                <p className="text-sm text-muted-foreground mb-1">{fileName || 'Uploaded file'}</p>
                                <p className="text-muted-foreground animate-pulse">
                                    {progress < 30 ? 'Extracting vendor data and order references...' :
                                     progress < 60 ? 'Matching line items against PO records...' :
                                     progress < 90 ? 'Detecting inconsistencies and exceptions...' :
                                     'Finalizing analysis...'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {status === 'review' && (
                    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden mb-6">
                            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                                        <DocumentTextIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-foreground">Analysis Complete</h4>
                                        <p className="text-xs text-muted-foreground">Extracted {MOCK_EXTRACTED_ACK.items.length} items from "{fileName || 'AIS_Acknowledgement_SO1151064C.pdf'}"</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {exceptionCount > 0 && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium">
                                            <ExclamationTriangleIcon className="w-4 h-4" />
                                            {exceptionCount} Exception{exceptionCount > 1 ? 's' : ''}
                                        </span>
                                    )}
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                                        <CheckCircleIcon className="w-4 h-4" />
                                        {confirmedCount} Confirmed
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">Acknowledgement</label>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-muted-foreground">ACK #:</span>
                                        <span className="font-medium text-foreground">{MOCK_EXTRACTED_ACK.ackNumber}</span>
                                    </div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-muted-foreground">Reference PO:</span>
                                        <span className="font-medium text-foreground">{MOCK_EXTRACTED_ACK.poNumber}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Ship Date:</span>
                                        <span className="font-medium text-foreground">{MOCK_EXTRACTED_ACK.shipDate}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">Vendor</label>
                                    <div className="font-medium text-foreground text-sm">{MOCK_EXTRACTED_ACK.vendorName}</div>
                                    <div className="text-sm text-muted-foreground">{MOCK_EXTRACTED_ACK.vendorAddress}</div>
                                    <div className="text-sm text-muted-foreground mt-1">{MOCK_EXTRACTED_ACK.salesRep} · {MOCK_EXTRACTED_ACK.salesEmail}</div>
                                </div>
                            </div>

                            <div className="border-t border-border">
                                <div className="bg-muted/50 px-6 py-2 text-xs font-semibold text-muted-foreground uppercase flex">
                                    <div className="flex-1">Item Description</div>
                                    <div className="w-16 text-center">Qty</div>
                                    <div className="w-24 text-right">Net Price</div>
                                    <div className="w-24 text-right">Total</div>
                                    <div className="w-28 text-center">Status</div>
                                </div>
                                <div className="divide-y divide-border">
                                    {MOCK_EXTRACTED_ACK.items.map((item) => (
                                        <div key={item.id} className="px-6 py-3 flex items-center text-sm group hover:bg-accent/50 transition-colors">
                                            <div className="flex-1 font-medium text-foreground">{item.description}</div>
                                            <div className="w-16 text-center text-muted-foreground">{item.qty}</div>
                                            <div className="w-24 text-right text-muted-foreground">${item.unitPrice.toFixed(2)}</div>
                                            <div className="w-24 text-right font-medium text-foreground">${item.total.toFixed(2)}</div>
                                            <div className="w-28 flex justify-center">
                                                {item.status === 'Confirmed' ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                                                        <CheckCircleIcon className="w-3.5 h-3.5" /> Confirmed
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium">
                                                        <ExclamationTriangleIcon className="w-3.5 h-3.5" /> Exception
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button onClick={() => { setStatus('upload'); setProgress(0) }}
                                className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors font-medium text-sm">
                                Try Different File
                            </button>
                            <button onClick={() => onImportComplete(MOCK_EXTRACTED_ACK)}
                                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-sm shadow-lg shadow-primary/20 flex items-center gap-2">
                                Continue to Review
                                <ArrowRightIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
