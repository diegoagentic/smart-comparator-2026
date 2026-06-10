import { Fragment, useMemo, useState } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import {
    X, ExternalLink, AlertTriangle, ChevronRight, ChevronDown, ArrowRight,
    FileText, Box, DollarSign, Truck, Info, Package,
} from 'lucide-react'
import type { OcrDocCardData } from './OcrDocCard'

interface PreflightSyncModalProps {
    isOpen: boolean
    onClose: () => void
    doc: OcrDocCardData | null
    onCreateRecord?: (doc: OcrDocCardData) => void
    onDownloadOriginal?: (doc: OcrDocCardData) => void
}

type FieldStatus = 'ready' | 'required'

interface PreflightField {
    label: string
    value: string
    status: FieldStatus
    special?: 'notes-change'  // renders an OCR + Change row
}

interface PreflightSection {
    title: string
    icon: typeof FileText
    rows: PreflightField[]
}

interface PreflightLineItem {
    seq: number
    product: string
    description: string
    ackQty: number
    unitPrice: string
    status: FieldStatus
}

function buildSections(doc: OcrDocCardData): PreflightSection[] {
    const baseId = doc.id.toUpperCase()
    return [
        {
            title: doc.type === 'Quote' ? 'QUOTE INFO' : 'PO INFO',
            icon: FileText,
            rows: [
                { label: doc.type === 'Quote' ? 'Quote Number' : 'PO Number', value: '4522 - 7162', status: 'ready' },
            ],
        },
        {
            title: 'VENDOR',
            icon: Box,
            rows: [
                { label: 'Vendor Name', value: doc.vendor, status: 'ready' },
                { label: 'Bill to Name', value: 'Continua Interiors of Illinois', status: 'ready' },
                { label: 'Dealer Ship To Address', value: '550 Bond Street, Lincolnshire, Illinois, USA, 60069', status: 'ready' },
                { label: 'Bill To Address', value: '550 Bond Street, Lincolnshire, Illinois, USA, 60069', status: 'ready' },
            ],
        },
        {
            title: 'FINANCIALS',
            icon: DollarSign,
            rows: [],
        },
        {
            title: 'SHIPPING',
            icon: Truck,
            rows: [
                { label: 'Ship To Address', value: '550 Bond Street, Lincolnshire, Illinois, USA, 60069', status: 'ready' },
            ],
        },
        {
            title: 'APPROVALS & NOTES',
            icon: Info,
            rows: [
                { label: 'Notes', value: 'OCR: ""', status: 'required', special: 'notes-change' },
            ],
        },
        {
            title: 'RECORD',
            icon: Info,
            rows: [
                { label: 'Order ID', value: baseId, status: 'ready' },
            ],
        },
    ]
}

function buildLineItems(doc: OcrDocCardData): PreflightLineItem[] {
    const all: PreflightLineItem[] = [
        { seq: 1, product: 'FXT-3072-29-LWH-DLT-W2-S', description: 'Model: Fixed Table, Dining Height, Top Size: 30" x 72" Rectangle', ackQty: 1, unitPrice: 'N/A', status: 'ready' },
        { seq: 2, product: 'M3CMBB-DLT-DLT-36D-L-W2-11M', description: 'Model: M3 pedestal table counter height 36H medium circle base, To...', ackQty: 2, unitPrice: 'N/A', status: 'ready' },
        { seq: 3, product: 'Freight', description: 'Freight Charges (Not subject to discount)', ackQty: 1, unitPrice: 'N/A', status: 'ready' },
    ]
    return all.slice(0, Math.max(1, Math.min(doc.lineItems || all.length, all.length)))
}

const UNMAPPED_FIELDS = [
    { label: 'Original PO Filename', value: 'PO-4522-7162.pdf' },
    { label: 'OCR Page Count', value: '3' },
    { label: 'Detected Currency', value: 'USD' },
    { label: 'Custom Reference', value: '—' },
    { label: 'Source Email', value: 'orders@vendor.com' },
    { label: 'Received At', value: '2026-04-22T10:14:00Z' },
]

function StatusPill({ status }: { status: FieldStatus }) {
    if (status === 'ready') {
        return (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300">
                <span className="h-1.5 w-1.5 rounded-full bg-green-600 dark:bg-green-300" />
                Ready
            </span>
        )
    }
    return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600 dark:bg-red-300" />
            Required
        </span>
    )
}

function ProgressRing({ resolved, total }: { resolved: number; total: number }) {
    const pct = total === 0 ? 0 : resolved / total
    const r = 11
    const c = 2 * Math.PI * r
    const dash = c * pct
    return (
        <span
            title={`${resolved} of ${total} fields resolved`}
            className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-muted text-sm font-bold text-foreground"
        >
            {resolved}/{total}
            <svg width="26" height="26" viewBox="0 0 26 26" className="-mr-0.5">
                <circle cx="13" cy="13" r={r} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2.5" />
                <circle
                    cx="13"
                    cy="13"
                    r={r}
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${c - dash}`}
                    transform="rotate(-90 13 13)"
                />
            </svg>
        </span>
    )
}

export default function PreflightSyncModal({ isOpen, onClose, doc, onCreateRecord, onDownloadOriginal }: PreflightSyncModalProps) {
    const [tab, setTab] = useState<'fields' | 'lineItems'>('fields')
    const [unmappedOpen, setUnmappedOpen] = useState(false)

    const sections = useMemo(() => doc ? buildSections(doc) : [], [doc])
    const lineItems = useMemo(() => doc ? buildLineItems(doc) : [], [doc])

    if (!doc) return null

    const totalFields = sections.reduce((acc, s) => acc + s.rows.length, 0)
    const requiredCount = sections.reduce(
        (acc, s) => acc + s.rows.filter(r => r.status === 'required').length,
        0
    )
    const resolved = totalFields - requiredCount
    const canCreate = requiredCount === 0
    const typeTitle = doc.type === 'Quote' ? 'Quote' : doc.type === 'Acknowledgment' ? 'Acknowledgment' : 'Purchase Order'

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-[200]">
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
                        <DialogPanel className="w-[95vw] max-w-[1600px] h-[95vh] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="flex items-start justify-between p-6 pb-4 border-b border-border">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                                        <Package className="h-5 w-5 text-foreground" />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-xl font-bold text-foreground">{typeTitle} preflight</h2>
                                        <p className="text-sm text-muted-foreground truncate">PO-4522 - 7162 · OCR-{doc.id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {requiredCount > 0 && (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300">
                                            <AlertTriangle className="h-3.5 w-3.5" />
                                            {requiredCount} required
                                        </span>
                                    )}
                                    <ProgressRing resolved={resolved} total={totalFields} />
                                    <button
                                        onClick={() => onDownloadOriginal?.(doc)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground border border-border rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700/60 transition-colors"
                                        title="Open original PDF in new tab"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                        View Original PDF
                                    </button>
                                    <button
                                        onClick={onClose}
                                        aria-label="Close"
                                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="px-6 border-b border-border flex items-center gap-6">
                                <button
                                    onClick={() => setTab('fields')}
                                    className={`relative py-3 text-sm font-bold transition-colors ${
                                        tab === 'fields' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {typeTitle === 'Purchase Order' ? 'PO Fields' : `${typeTitle} Fields`}
                                    {tab === 'fields' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                                </button>
                                <button
                                    onClick={() => setTab('lineItems')}
                                    className={`relative py-3 text-sm font-bold transition-colors ${
                                        tab === 'lineItems' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Line Items
                                    {tab === 'lineItems' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto px-6 py-5">
                                {tab === 'fields' && (
                                    <div className="space-y-6">
                                        {sections.map(section => {
                                            const Icon = section.icon
                                            return (
                                                <div key={section.title}>
                                                    <div className="flex items-center gap-1.5 mb-2">
                                                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                                                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{section.title}</h3>
                                                    </div>
                                                    <div className="border border-border rounded-xl overflow-hidden">
                                                        <div className="grid grid-cols-[220px_1fr_120px] bg-muted/30 border-b border-border px-4 py-2">
                                                            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Field</div>
                                                            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Value</div>
                                                            <div></div>
                                                        </div>
                                                        {section.rows.length === 0 ? (
                                                            <div className="px-4 py-6 text-xs text-muted-foreground text-center">No fields in this section.</div>
                                                        ) : section.rows.map(row => (
                                                            <div key={row.label} className="grid grid-cols-[220px_1fr_120px] items-start px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors gap-3">
                                                                <div className="text-sm text-muted-foreground">{row.label}</div>
                                                                <div className="text-sm text-foreground">
                                                                    {row.special === 'notes-change' ? (
                                                                        <div className="space-y-2">
                                                                            <div className="inline-flex items-center gap-1.5 text-sm text-red-600 dark:text-red-300 bg-red-50/60 dark:bg-red-500/10 px-2 py-1 rounded-md">
                                                                                <AlertTriangle className="h-3.5 w-3.5" />
                                                                                {row.value}
                                                                            </div>
                                                                            <div>
                                                                                <button className="px-3 py-1.5 text-xs font-semibold bg-foreground text-background rounded-md hover:opacity-90 transition-opacity">
                                                                                    Change
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <span>{row.value}</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex justify-end">
                                                                    <StatusPill status={row.status} />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        })}

                                        {/* Unmapped fields collapsible */}
                                        <div className="border-t border-border pt-4">
                                            <button
                                                onClick={() => setUnmappedOpen(o => !o)}
                                                className="w-full flex items-center justify-between gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                                            >
                                                <span className="flex items-center gap-2">
                                                    {unmappedOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                                                    UNMAPPED FIELDS
                                                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-muted text-foreground text-[10px] font-bold">{UNMAPPED_FIELDS.length}</span>
                                                </span>
                                                <span className="text-xs text-muted-foreground normal-case font-medium tracking-normal">Not sent to Orderbahn</span>
                                            </button>
                                            {unmappedOpen && (
                                                <div className="mt-3 border border-border rounded-xl overflow-hidden">
                                                    {UNMAPPED_FIELDS.map((f, i) => (
                                                        <div key={i} className="grid grid-cols-[220px_1fr] px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors">
                                                            <div className="text-sm text-muted-foreground">{f.label}</div>
                                                            <div className="text-sm text-foreground">{f.value}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {tab === 'lineItems' && (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Box className="h-3.5 w-3.5 text-muted-foreground" />
                                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                                {lineItems.length} LINE ITEMS
                                            </h3>
                                        </div>
                                        <div className="border border-border rounded-xl overflow-hidden">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-border bg-muted/30">
                                                        <th className="w-10 px-3 py-3"></th>
                                                        <th className="w-16 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-3">#</th>
                                                        <th className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-3">Product</th>
                                                        <th className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-3">Description</th>
                                                        <th className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-3">Ack Qty</th>
                                                        <th className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-3">Unit Price</th>
                                                        <th className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-3">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {lineItems.map(li => (
                                                        <tr key={li.seq} className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors">
                                                            <td className="px-3 py-3">
                                                                <button aria-label="Expand line" className="text-muted-foreground hover:text-foreground transition-colors">
                                                                    <ChevronRight className="h-4 w-4" />
                                                                </button>
                                                            </td>
                                                            <td className="px-3 py-3 text-sm text-foreground">{li.seq}</td>
                                                            <td className="px-3 py-3 text-sm font-medium text-foreground">{li.product}</td>
                                                            <td className="px-3 py-3 text-sm text-foreground">{li.description}</td>
                                                            <td className="px-3 py-3 text-sm text-foreground">{li.ackQty}</td>
                                                            <td className="px-3 py-3 text-sm text-muted-foreground">{li.unitPrice}</td>
                                                            <td className="px-3 py-3"><StatusPill status={li.status} /></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="border-t border-border px-6 py-4 flex items-center justify-end gap-2">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => { if (canCreate) { onCreateRecord?.(doc); onClose() } }}
                                    disabled={!canCreate}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Create Record
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}
