import { useState, Fragment } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel, DialogTitle } from '@headlessui/react'
import {
    X, FileText, Building2, Truck, Package, DollarSign, MapPin,
    ChevronDown, ChevronRight, CheckCircle2, AlertCircle, Sparkles, ZoomIn, ZoomOut,
    Archive, Download, Loader2
} from 'lucide-react'
import FieldReviewModal from './FieldReviewModal'
import OrderbahnSyncBanner from './create-record/OrderbahnSyncBanner'
import { exportOcrPdf } from '../utils/exportOcrPdf'

// ─── Types ────────────────────────────────────────────────
interface DocumentPreviewModalProps {
    isOpen: boolean
    onClose: () => void
    document: {
        id: string
        name: string
        vendor: string
        type: string
        fields: number
        confidence: number | null
        status?: string
        inconsistencyCount?: number
    } | null
    onResolve?: (id: string) => void
    /** Opens the Deprecation modal in the parent. Hidden when doc is already deprecated. */
    onMarkDeprecated?: (id: string) => void
}

interface ExtractedField {
    name: string
    value: string
    confidence: number
    status: 'valid' | 'inconsistent' | 'missing'
    highlight?: boolean
}

interface FieldGroup {
    id: string
    label: string
    icon: typeof FileText
    fields: ExtractedField[]
}

// ─── Mock extracted fields per document type ──────────────────
const ACK_FIELDS: FieldGroup[] = [
    {
        id: 'header', label: 'Document Header', icon: FileText,
        fields: [
            { name: 'ACK Number', value: 'ACK-7839', confidence: 99, status: 'valid' },
            { name: 'ACK Date', value: '2026-01-13', confidence: 97, status: 'valid' },
            { name: 'Reference PO', value: '', confidence: 0, status: 'missing', highlight: true },
            { name: 'Sales Order #', value: 'SO 1151064-B', confidence: 94, status: 'valid' },
            { name: 'Document Type', value: 'Acknowledgment', confidence: 98, status: 'valid' },
        ]
    },
    {
        id: 'vendor', label: 'Vendor Information', icon: Building2,
        fields: [
            { name: 'Vendor Name', value: 'Steelcase', confidence: 99, status: 'valid' },
            { name: 'Vendor Address', value: '901 44th St SE, Grand Rapids, MI', confidence: 93, status: 'valid' },
            { name: 'Sales Rep', value: 'Mark Thompson', confidence: 88, status: 'valid' },
            { name: 'Rep Email', value: 'mthompson@steelcase.com', confidence: 85, status: 'valid' },
            { name: 'Rep Phone', value: '', confidence: 0, status: 'missing', highlight: true },
        ]
    },
    {
        id: 'line_items', label: 'Line Items', icon: Package,
        fields: [
            { name: 'Line 1: Description', value: 'Gesture Task Chair', confidence: 96, status: 'valid' },
            { name: 'Line 1: SKU', value: 'GES-442-BLK', confidence: 94, status: 'valid' },
            { name: 'Line 1: Quantity', value: '8', confidence: 97, status: 'valid' },
            { name: 'Line 1: Unit Price', value: '$1,242.00', confidence: 95, status: 'valid' },
            { name: 'Line 2: Description', value: 'Migration SE Desk', confidence: 92, status: 'valid' },
            { name: 'Line 2: SKU', value: '', confidence: 0, status: 'missing', highlight: true },
            { name: 'Line 2: Quantity', value: '12', confidence: 98, status: 'valid' },
            { name: 'Line 2: Unit Price', value: '$1,895.00', confidence: 91, status: 'inconsistent', highlight: true },
            { name: 'Line 3: Description', value: 'Think V2 Stool', confidence: 89, status: 'valid' },
            { name: 'Line 3: Quantity', value: '6', confidence: 96, status: 'valid' },
        ]
    },
    {
        id: 'pricing', label: 'Pricing & Totals', icon: DollarSign,
        fields: [
            { name: 'Subtotal', value: '$47,826.00', confidence: 93, status: 'valid' },
            { name: 'Discount', value: '38%', confidence: 90, status: 'valid' },
            { name: 'Tax', value: '', confidence: 0, status: 'missing', highlight: true },
            { name: 'Total', value: '$29,651.92', confidence: 88, status: 'inconsistent', highlight: true },
        ]
    },
    {
        id: 'logistics', label: 'Shipping & Delivery', icon: Truck,
        fields: [
            { name: 'Ship To', value: '1200 Commerce Dr, Suite 400, Dallas TX', confidence: 95, status: 'valid' },
            { name: 'Ship Via', value: 'Steelcase Fleet', confidence: 91, status: 'valid' },
            { name: 'Expected Ship Date', value: '2026-02-20', confidence: 87, status: 'valid' },
            { name: 'Freight Terms', value: 'Prepaid', confidence: 84, status: 'inconsistent', highlight: true },
        ]
    },
]

const PO_FIELDS: FieldGroup[] = [
    {
        id: 'header', label: 'Document Header', icon: FileText,
        fields: [
            { name: 'PO Number', value: 'PO-1029', confidence: 99, status: 'valid' },
            { name: 'PO Date', value: '2025-12-15', confidence: 98, status: 'valid' },
            { name: 'Order Status', value: 'Active', confidence: 96, status: 'valid' },
            { name: 'Payment Terms', value: 'Net 30', confidence: 94, status: 'valid' },
        ]
    },
    {
        id: 'vendor', label: 'Vendor', icon: Building2,
        fields: [
            { name: 'Vendor Name', value: 'Apex Furniture', confidence: 99, status: 'valid' },
            { name: 'Contact', value: 'Lisa Chen', confidence: 91, status: 'valid' },
            { name: 'Email', value: '', confidence: 0, status: 'missing', highlight: true },
            { name: 'Phone', value: '(469) 555-0188', confidence: 87, status: 'valid' },
        ]
    },
    {
        id: 'line_items', label: 'Line Items', icon: Package,
        fields: [
            { name: 'Line 1: Ergonomic Task Chair', value: 'Qty: 125 @ $376.75', confidence: 96, status: 'valid' },
            { name: 'Line 1: SKU', value: 'SKU-OFF-2025-002', confidence: 98, status: 'valid' },
            { name: 'Line 2: Standing Desk 60x30', value: 'Qty: 50 @ $892.00', confidence: 94, status: 'valid' },
            { name: 'Line 2: SKU', value: '', confidence: 0, status: 'missing', highlight: true },
            { name: 'Line 3: Monitor Arm Dual', value: 'Qty: 125 @ $189.00', confidence: 93, status: 'valid' },
        ]
    },
    {
        id: 'pricing', label: 'Pricing', icon: DollarSign,
        fields: [
            { name: 'Subtotal', value: '$117,518.75', confidence: 95, status: 'valid' },
            { name: 'Discount', value: '45%', confidence: 88, status: 'inconsistent', highlight: true },
            { name: 'Total', value: '$64,635.31', confidence: 90, status: 'valid' },
        ]
    },
    {
        id: 'logistics', label: 'Shipping', icon: Truck,
        fields: [
            { name: 'Ship To', value: '800 W Campbell Rd, Richardson TX', confidence: 97, status: 'valid' },
            { name: 'Expected Delivery', value: '2026-01-30', confidence: 85, status: 'valid' },
            { name: 'Freight Terms', value: 'FOB Destination', confidence: 92, status: 'valid' },
        ]
    },
]

// ─── Document Mock Preview ────────────────────────────────────
function DocumentMockPreview({ fields, vendor, docName, docType, onExport, exporting }: {
    fields: FieldGroup[]
    vendor: string
    docName: string
    docType: string
    onExport: () => void
    exporting: boolean
}) {
    const [zoom, setZoom] = useState(100)
    const allFields = fields.flatMap(g => g.fields)
    const validCount = allFields.filter(f => f.status === 'valid').length
    const totalCount = allFields.length

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted dark:bg-zinc-800/50 shrink-0">
                <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground truncate max-w-[180px]">{docName}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        <button onClick={() => setZoom(z => Math.max(80, z - 10))} title="Zoom out" aria-label="Zoom out" className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-muted-foreground"><ZoomOut className="h-3.5 w-3.5" /></button>
                        <span title="Current zoom level" className="text-[10px] font-mono text-muted-foreground w-8 text-center">{zoom}%</span>
                        <button onClick={() => setZoom(z => Math.min(150, z + 10))} title="Zoom in" aria-label="Zoom in" className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-muted-foreground"><ZoomIn className="h-3.5 w-3.5" /></button>
                    </div>
                    <button
                        onClick={onExport}
                        disabled={exporting}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 disabled:opacity-60 transition-all"
                        title="Download branded PDF"
                    >
                        {exporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                        {exporting ? 'Generating…' : 'Export PDF'}
                    </button>
                </div>
            </div>

            {/* Simulated Document */}
            <div className="flex-1 overflow-y-auto p-6 bg-zinc-100 dark:bg-zinc-950 scrollbar-minimal">
                <div className="mx-auto bg-card rounded-xl shadow-lg border border-border overflow-hidden"
                     style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', maxWidth: '520px' }}>

                    {/* Brand bar */}
                    <div className="h-1.5 bg-gradient-to-r from-primary to-[#C3E433]" />

                    {/* Document header */}
                    <div className="px-7 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between">
                        <div>
                            <span className="inline-block text-[9px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded mb-2">{docType}</span>
                            <p className="text-xl font-extrabold text-foreground leading-tight">{vendor}</p>
                            <p className="text-xs font-mono text-muted-foreground mt-1">{docName}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-extrabold text-foreground">{allFields.find(f => f.name.includes('Number'))?.value || '—'}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{allFields.find(f => f.name.includes('Date'))?.value || ''}</div>
                        </div>
                    </div>

                    {/* Stats mini row */}
                    <div className="grid grid-cols-3 border-b border-zinc-100 dark:border-zinc-800">
                        {[
                            { label: 'Valid', value: validCount, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10' },
                            { label: 'Issues', value: totalCount - validCount, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                            { label: 'Total', value: totalCount, color: 'text-muted-foreground', bg: 'bg-muted dark:bg-zinc-800/50' },
                        ].map((s, i) => (
                            <div key={i} className={`${s.bg} px-4 py-2.5 ${i < 2 ? 'border-r border-zinc-100 dark:border-zinc-800' : ''}`}>
                                <div className={`text-base font-extrabold ${s.color}`}>{s.value}</div>
                                <div className="text-[9px] text-muted-foreground uppercase tracking-wide">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Render each group */}
                    <div className="px-7 py-5 space-y-5">
                        {fields.map(group => (
                            <div key={group.id}>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1 h-3 bg-primary rounded-full" />
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{group.label}</p>
                                    <div className="flex-1 h-px bg-muted" />
                                </div>
                                <div className="rounded-lg overflow-hidden border border-zinc-100 dark:border-zinc-800">
                                    {group.fields.map((field, i) => (
                                        <div key={i} className={`flex items-center justify-between py-1.5 px-3 text-[11px] ${
                                            i % 2 === 0 ? '' : 'bg-muted dark:bg-zinc-800/40'
                                        } ${field.status === 'missing' ? '!bg-red-50 dark:!bg-red-500/10' : field.status === 'inconsistent' ? '!bg-amber-50 dark:!bg-amber-500/10' : ''}`}>
                                            <div className="flex items-center gap-2">
                                                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${field.status === 'valid' ? 'bg-green-500' : field.status === 'inconsistent' ? 'bg-amber-500' : 'bg-red-500'}`} />
                                                <span className="text-muted-foreground">{field.name}</span>
                                            </div>
                                            <span className={`font-semibold ${
                                                field.status === 'missing' ? 'text-red-400 italic' :
                                                field.status === 'inconsistent' ? 'text-amber-600 dark:text-amber-400' :
                                                'text-foreground'
                                            }`}>
                                                {field.value || '—'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="mx-7 mb-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <div className="h-4 w-4 bg-zinc-900 dark:bg-white rounded flex items-center justify-center">
                                <span className="text-[8px] font-extrabold text-primary">S</span>
                            </div>
                            <span className="text-[9px] text-muted-foreground">Smart Comparator OCR</span>
                        </div>
                        <span className="text-[9px] text-zinc-300 dark:text-muted-foreground">Confidential</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Main Modal ───────────────────────────────────────────────
export default function DocumentPreviewModal({ isOpen, onClose, document, onResolve, onMarkDeprecated }: DocumentPreviewModalProps) {
    const [showExportToast, setShowExportToast] = useState(false)
    const [exporting, setExporting] = useState(false)

    if (!document) return null

    const isAck = document.type === 'Acknowledgment'
    const fieldGroups = isAck ? ACK_FIELDS : PO_FIELDS
    const allFields = fieldGroups.flatMap(g => g.fields)
    const validCount = allFields.filter(f => f.status === 'valid').length
    const totalCount = allFields.length
    const pct = Math.round((validCount / totalCount) * 100)
    const confidence = document.confidence ?? pct

    const handleExport = async () => {
        if (exporting) return
        setExporting(true)
        try {
            await exportOcrPdf({ id: document.id, name: document.name, vendor: document.vendor, type: document.type, fields: document.fields, confidence: document.confidence, status: document.status })
            setShowExportToast(true)
            setTimeout(() => setShowExportToast(false), 4000)
        } catch (err) {
            console.error('PDF export failed:', err)
        } finally {
            setExporting(false)
        }
    }

    return (
        <>
            <Transition show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={onClose}>
                    <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                    </TransitionChild>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <DialogPanel className="w-full max-w-6xl h-[85vh] transform overflow-hidden rounded-2xl bg-card text-left shadow-2xl transition-all border border-border flex flex-col">

                                {/* Header */}
                                <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-ai/10 flex items-center justify-center">
                                            <Sparkles className="h-5 w-5 text-ai" />
                                        </div>
                                        <div>
                                            <DialogTitle as="h3" className="text-lg font-bold text-foreground">
                                                Document Review
                                            </DialogTitle>
                                            <p className="text-sm text-muted-foreground">
                                                {document.vendor} — {document.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-3 text-xs">
                                            <span title={`${validCount} fields extracted with high confidence`} className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> {validCount} valid</span>
                                            <span title={`${totalCount - validCount} fields need review (low confidence, missing, or inconsistent)`} className="flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5 text-amber-500" /> {totalCount - validCount} issues</span>
                                        </div>
                                        <div className="flex items-center gap-2" title="Document Progress">
                                            <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                            </div>
                                            <span className="text-xs font-bold text-muted-foreground">{pct}%</span>
                                        </div>
                                        {onMarkDeprecated && document.status !== 'deprecated' && (
                                            <button
                                                onClick={() => onMarkDeprecated(document.id)}
                                                title="Move this document to the archive (Deprecated tab)"
                                                aria-label="Mark document as deprecated"
                                                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card hover:bg-muted dark:hover:bg-zinc-700 px-3 py-1.5 text-[12px] font-medium text-muted-foreground dark:text-zinc-200 transition-colors"
                                            >
                                                <Archive className="w-3.5 h-3.5" />
                                                Mark as Deprecated
                                            </button>
                                        )}
                                        <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-muted-foreground dark:hover:text-zinc-300 hover:bg-muted transition-colors" title="Close">
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Orderbahn sync banner */}
                                <OrderbahnSyncBanner
                                    changesCount={2 + (document.id.charCodeAt(document.id.length - 1) % 4)}
                                />

                                {/* Split Pane */}
                                <div className="flex-1 grid grid-cols-5 min-h-0">
                                    {/* Left: Document Preview (3/5) */}
                                    <div className="col-span-3 border-r border-border flex flex-col min-h-0">
                                        <DocumentMockPreview
                                            fields={fieldGroups}
                                            vendor={document.vendor}
                                            docName={document.name}
                                            docType={document.type}
                                            onExport={handleExport}
                                            exporting={exporting}
                                        />
                                    </div>

                                    {/* Right: Field Review (2/5) */}
                                    <div className="col-span-2 flex flex-col min-h-0 bg-card border-l border-border">
                                        <FieldReviewModal
                                            document={{ id: document.id, name: document.name, vendor: document.vendor, inconsistencyCount: document.inconsistencyCount ?? 0 }}
                                            onResolve={onResolve}
                                            onClose={onClose}
                                        />
                                    </div>
                                </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>

                {/* Export Success Toast */}
                {showExportToast && (
                    <div className="fixed bottom-8 right-8 z-[200] flex items-center gap-4 px-6 py-4 bg-[#ECFDF5] border-l-4 border-green-600 shadow-2xl rounded-sm animate-in slide-in-from-right fade-in duration-500">
                        <div className="h-6 w-6 rounded-full border-2 border-green-600 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-green-900">PDF exported successfully</p>
                            <p className="text-xs text-green-700 mt-0.5">{document.name.replace(/\.pdf$/i, '')}_OCR-Report.pdf</p>
                        </div>
                        <button onClick={() => setShowExportToast(false)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-green-800/60 hover:text-green-900 transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </Transition>
        </>
    )
}
