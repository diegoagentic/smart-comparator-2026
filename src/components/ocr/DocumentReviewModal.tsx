import { Fragment, useState, useMemo, useEffect } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { X, ExternalLink, CheckCircle2, ChevronDown, Download, FileText, Pencil, Plus, Trash2, Box, Info } from 'lucide-react'
import type { OcrDocCardData } from './OcrDocCard'
import CatalogVerifyPill from './CatalogVerifyPill'
import AITrainingConsentModal from './AITrainingConsentModal'

interface DocumentReviewModalProps {
    isOpen: boolean
    onClose: () => void
    doc: OcrDocCardData | null
    onSave?: (doc: OcrDocCardData) => void
    onDownloadOriginal?: (doc: OcrDocCardData) => void
}

interface FieldRow {
    label: string
    value: string
    editable?: boolean
}

interface Section {
    title: string
    rows: FieldRow[]
}

interface LineItem {
    id: string
    productNumber: string
    description: string
    catalogCode?: string
    manufacturerCode?: string
    quantity: number
    uom: string
    listPrice: number
    sellPrice: number
    productCost: number
    discount: number
}

// Mock factory — generates plausible header sections per document.
// In a real build these would come from the OCR pipeline.
function buildHeaderSections(doc: OcrDocCardData): Section[] {
    const baseLabel = doc.type === 'Quote' ? 'Quote' : doc.type === 'Purchase Order' ? 'PO' : 'Document'
    const isQuote = doc.type === 'Quote'
    return [
        {
            title: `${baseLabel.toUpperCase()} INFO`,
            rows: [
                { label: `${baseLabel} Number`, value: doc.name.replace(/\.[^.]+$/, '').replace(/[_]/g, '-').slice(0, 16) || 'S-QUO017792', editable: true },
                { label: `${baseLabel} Date`, value: 'Feb 10, 2026', editable: true },
                ...(isQuote ? [{ label: 'Expiration Date', value: 'May 11, 2026', editable: true }] : []),
            ],
        },
        {
            title: 'VENDOR',
            rows: [
                { label: 'Vendor Name', value: doc.vendor, editable: true },
                { label: 'Vendor Address', value: '600 Eagle Drive, Bensenville, IL 60106, USA', editable: true },
            ],
        },
        {
            title: 'DEALER',
            rows: [
                { label: 'Dealer Name', value: 'Custer Inc.', editable: true },
                { label: 'Dealer Address', value: '217 Grandville Ave. SW, Grand Rapids, MI 49503, USA', editable: true },
            ],
        },
        {
            title: 'SHIPPING',
            rows: [
                { label: 'Freight Included', value: 'No', editable: true },
            ],
        },
        {
            title: 'PROJECT',
            rows: [
                { label: 'Project Name', value: 'MATTAWAN MIDDLE SCHOOLS', editable: true },
            ],
        },
        {
            title: 'FINANCIALS',
            rows: [
                { label: `${baseLabel} Total`, value: '$161,571.02' },
                { label: 'Subtotal', value: '$155,111.02' },
                { label: 'Product Subtotal', value: '$155,111.02' },
                { label: 'D&I Subtotal', value: '$0.00', editable: true },
                { label: 'Tax Subtotal', value: '$0.00', editable: true },
                { label: 'Tax Rate', value: '0.00%', editable: true },
                { label: 'Sales Tax', value: '$0.00', editable: true },
                { label: 'Shipping Total', value: '$6,460.00', editable: true },
                { label: 'Payment Terms', value: 'Net 30', editable: true },
                { label: 'Currency', value: 'USD ($) - US Dollar' },
            ],
        },
    ]
}

function buildLineItems(doc: OcrDocCardData): LineItem[] {
    const all: LineItem[] = [
        { id: 'li-1', productNumber: 'HMBS244-D', description: 'Mobile Booth Seating - Half Circle - 24"W x 92"L', quantity: 4, uom: 'EA', listPrice: 29410, sellPrice: 9094.31, productCost: 9094.31, discount: 0 },
        { id: 'li-2', productNumber: 'MCTNP488-42-D', description: 'Mobile Conversation Table - Open Sides - 48"W x 96"L x 42"H', quantity: 5, uom: 'EA', listPrice: 10163, sellPrice: 3142.65, productCost: 3142.65, discount: 0 },
        { id: 'li-3', productNumber: 'MFB5P245-D', description: 'Mobile Folding Booth Seating with Table - Package - 60"W x 80"L x 40"H', quantity: 8, uom: 'EA', listPrice: 28909, sellPrice: 8939.39, productCost: 8939.39, discount: 0 },
        { id: 'li-4', productNumber: 'MST1012-D', description: 'Mobile Stool Table - Rectangle - 30"W x 10"L - 12 Stools', quantity: 11, uom: 'EA', listPrice: 8183, sellPrice: 2530.39, productCost: 2530.39, discount: 0 },
        { id: 'li-5', productNumber: 'PTRX4230-D', description: 'Social Table - Round - 42" Diameter x 30"H', quantity: 4, uom: 'EA', listPrice: 2968, sellPrice: 917.78, productCost: 917.78, discount: 0 },
    ]
    return all.slice(0, Math.max(1, Math.min(doc.lineItems || all.length, all.length)))
}

function formatCurrency(n: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function EditableValue({ value, editable, onChange }: { value: string; editable?: boolean; onChange?: (v: string) => void }) {
    const [isEditing, setIsEditing] = useState(false)
    const [draft, setDraft] = useState(value)
    if (!editable) return <span className="text-sm text-foreground">{value}</span>
    if (isEditing) {
        return (
            <input
                value={draft}
                autoFocus
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => { setIsEditing(false); onChange?.(draft) }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') { setIsEditing(false); onChange?.(draft) }
                    if (e.key === 'Escape') { setIsEditing(false); setDraft(value) }
                }}
                className="text-sm bg-background border border-primary rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/30 w-full max-w-md"
            />
        )
    }
    return (
        <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 text-sm text-foreground hover:bg-muted rounded-md px-2 py-1 -my-1 -mx-2 transition-colors group"
        >
            <span>{value}</span>
            <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
    )
}

export default function DocumentReviewModal({ isOpen, onClose, doc, onSave, onDownloadOriginal }: DocumentReviewModalProps) {
    const [tab, setTab] = useState<'header' | 'lineItems'>('header')
    const [exportOpen, setExportOpen] = useState(false)

    const sections = useMemo(() => doc ? buildHeaderSections(doc) : [], [doc])
    // Local mutable copy so users can replace a SKU via the catalog verify popover.
    const [lineItems, setLineItems] = useState<LineItem[]>([])
    // Change tracking — drives whether the consent modal opens on Save.
    const [editedCount, setEditedCount] = useState(0)
    const [replacedCount, setReplacedCount] = useState(0)
    const [showConsent, setShowConsent] = useState(false)

    useEffect(() => {
        setLineItems(doc ? buildLineItems(doc) : [])
        setEditedCount(0)
        setReplacedCount(0)
        setShowConsent(false)
    }, [doc])

    const trackEdit = () => setEditedCount(c => c + 1)

    const handleReplaceSku = (originalSku: string, newSku: string) => {
        setLineItems(prev => prev.map(li => li.productNumber === originalSku ? { ...li, productNumber: newSku } : li))
        setReplacedCount(c => c + 1)
    }

    if (!doc) return null

    const isReviewed = doc.status === 'processed' || doc.status === 'completed'
    const confidence = 92

    const totals = lineItems.reduce(
        (acc, li) => ({
            qty: acc.qty + li.quantity,
            list: acc.list + li.listPrice,
            sell: acc.sell + li.sellPrice,
            cost: acc.cost + li.productCost,
        }),
        { qty: 0, list: 0, sell: 0, cost: 0 }
    )

    const finalizeSave = () => {
        onSave?.(doc)
        onClose()
    }

    const handleSave = () => {
        // Only open the consent modal if the user actually changed something
        // during this session — pure-read sessions skip the prompt.
        if (editedCount + replacedCount > 0) {
            setShowConsent(true)
        } else {
            finalizeSave()
        }
    }

    const handleConsentAccept = () => {
        setShowConsent(false)
        finalizeSave()
    }

    const handleConsentDecline = () => {
        setShowConsent(false)
        finalizeSave()
    }

    const handleConsentCancel = () => {
        setShowConsent(false)
        // Stay on the review modal, keep counters / edits intact.
    }

    const handleExportSif = () => {
        setExportOpen(false)
        // Simulated SIF export — real impl would download a .sif file.
        const blob = new Blob([JSON.stringify({ doc: doc.name, sections, lineItems }, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${doc.vendor.replace(/\s+/g, '-')}-${doc.id}.sif`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <>
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
                                        <svg viewBox="0 0 24 24" className="h-5 w-5 text-foreground" fill="currentColor"><path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z"/></svg>
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-xl font-bold text-foreground">Document Review</h2>
                                        <p className="text-sm text-muted-foreground truncate">{doc.vendor} · {doc.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => onDownloadOriginal?.(doc)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                        View Original PDF
                                    </button>
                                    {isReviewed ? (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300">
                                            <CheckCircle2 className="h-3.5 w-3.5" /> Reviewed
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md bg-yellow-50 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300">
                                            <CheckCircle2 className="h-3.5 w-3.5" /> Pending Review
                                        </span>
                                    )}
                                    <button
                                        onClick={onClose}
                                        aria-label="Close"
                                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Tabs row */}
                            <div className="px-6 border-b border-border flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <button
                                        onClick={() => setTab('header')}
                                        className={`relative py-3 text-sm font-bold transition-colors ${
                                            tab === 'header' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        Header Fields
                                        {tab === 'header' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                                    </button>
                                    <button
                                        onClick={() => setTab('lineItems')}
                                        className={`relative py-3 text-sm font-bold inline-flex items-center gap-2 transition-colors ${
                                            tab === 'lineItems' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        Line Items
                                        <span className="text-[10px] font-bold bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{lineItems.length}</span>
                                        {tab === 'lineItems' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                                    </button>
                                </div>
                                {/* Export dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setExportOpen(o => !o)}
                                        onBlur={() => setTimeout(() => setExportOpen(false), 150)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
                                    >
                                        Export
                                        <ChevronDown className="h-3.5 w-3.5" />
                                    </button>
                                    {exportOpen && (
                                        <div className="absolute right-0 mt-1 w-60 bg-card border border-border rounded-xl shadow-xl z-10 p-1.5">
                                            <button
                                                onClick={handleExportSif}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700/60 rounded-lg transition-colors"
                                            >
                                                <Download className="h-4 w-4 text-muted-foreground" />
                                                Export to SIF
                                            </button>
                                            <button
                                                onClick={() => { setExportOpen(false); onDownloadOriginal?.(doc) }}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700/60 rounded-lg transition-colors"
                                            >
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                Download Original PDF
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto px-6 py-5">
                                {tab === 'header' && (
                                    <div className="space-y-6">
                                        {sections.map(section => (
                                            <div key={section.title}>
                                                <div className="flex items-center gap-1.5 mb-2">
                                                    <Box className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{section.title}</h3>
                                                </div>
                                                <div className="border border-border rounded-xl overflow-hidden">
                                                    <div className="grid grid-cols-[200px_1fr] bg-muted/30 border-b border-border px-4 py-2">
                                                        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Field</div>
                                                        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Value</div>
                                                    </div>
                                                    {section.rows.map(row => (
                                                        <div key={row.label} className="grid grid-cols-[200px_1fr] px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors">
                                                            <div className="text-sm text-muted-foreground">{row.label}</div>
                                                            <EditableValue value={row.value} editable={row.editable} onChange={trackEdit} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {tab === 'lineItems' && (
                                    <div className="border border-border rounded-xl overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-[1340px]">
                                                <thead>
                                                    <tr className="border-b border-border bg-muted/30">
                                                        <th className="px-3 py-3 w-10">
                                                            <button title="Add row" className="h-7 w-7 rounded-full bg-foreground/90 text-background flex items-center justify-center hover:bg-foreground transition-colors">
                                                                <Plus className="h-4 w-4" />
                                                            </button>
                                                        </th>
                                                        <th className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-3">Product Number</th>
                                                        <th className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-3">Description</th>
                                                        <th
                                                            className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-3"
                                                            title={
                                                                'Catalog verification — each SKU is checked against the Strata Catalog Database (vendor catalogs + historical orders + replacement catalogs). ' +
                                                                'Verified = the SKU exists and is active. Sync = the SKU is not in the catalog; click for AI-suggested replacements. ' +
                                                                'Source: Strata internal catalog + vendor feed (last refreshed 12h ago).'
                                                            }
                                                        >
                                                            <span className="inline-flex items-center gap-1 cursor-help">
                                                                Verification
                                                                <Info className="h-3 w-3 text-muted-foreground/70" />
                                                            </span>
                                                        </th>
                                                        <th className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-3">Catalog<br/>Code</th>
                                                        <th className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-3">Manufacturer<br/>Code</th>
                                                        <th className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-3">Quantity</th>
                                                        <th className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-3">UOM</th>
                                                        <th className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-3">List Price</th>
                                                        <th className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-3">Sell Price</th>
                                                        <th className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-3">Product Cost</th>
                                                        <th className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-3">Discount</th>
                                                        <th className="px-3 py-3 w-10"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {lineItems.map(li => (
                                                        <tr key={li.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                                                            <td className="px-3 py-3"></td>
                                                            <td className="px-3 py-3"><EditableValue value={li.productNumber} editable onChange={trackEdit} /></td>
                                                            <td className="px-3 py-3"><EditableValue value={li.description} editable onChange={trackEdit} /></td>
                                                            <td className="px-3 py-3"><CatalogVerifyPill sku={li.productNumber} onUseReplacement={handleReplaceSku} /></td>
                                                            <td className="px-3 py-3"><EditableValue value={li.catalogCode || '—'} editable onChange={trackEdit} /></td>
                                                            <td className="px-3 py-3"><EditableValue value={li.manufacturerCode || '—'} editable onChange={trackEdit} /></td>
                                                            <td className="px-3 py-3"><EditableValue value={String(li.quantity)} editable onChange={trackEdit} /></td>
                                                            <td className="px-3 py-3"><EditableValue value={li.uom} editable onChange={trackEdit} /></td>
                                                            <td className="px-3 py-3"><EditableValue value={formatCurrency(li.listPrice)} editable onChange={trackEdit} /></td>
                                                            <td className="px-3 py-3"><EditableValue value={formatCurrency(li.sellPrice)} editable onChange={trackEdit} /></td>
                                                            <td className="px-3 py-3"><EditableValue value={formatCurrency(li.productCost)} editable onChange={trackEdit} /></td>
                                                            <td className="px-3 py-3"><EditableValue value={`${li.discount.toFixed(2)}%`} editable onChange={trackEdit} /></td>
                                                            <td className="px-3 py-3 text-right">
                                                                <button aria-label="Remove line" className="p-1 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-500/15 transition-colors">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    <tr className="bg-muted/20 font-bold">
                                                        <td className="px-3 py-3"></td>
                                                        <td className="px-3 py-3"></td>
                                                        <td className="px-3 py-3"></td>
                                                        <td className="px-3 py-3"></td>
                                                        <td className="px-3 py-3"></td>
                                                        <td className="px-3 py-3"></td>
                                                        <td className="px-3 py-3 text-sm text-foreground">{totals.qty}</td>
                                                        <td className="px-3 py-3"></td>
                                                        <td className="px-3 py-3 text-sm text-foreground">{formatCurrency(totals.list)}</td>
                                                        <td className="px-3 py-3 text-sm text-foreground">{formatCurrency(totals.sell)}</td>
                                                        <td className="px-3 py-3 text-sm text-foreground">{formatCurrency(totals.cost)}</td>
                                                        <td className="px-3 py-3 text-sm text-foreground">0.00</td>
                                                        <td></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="border-t border-border px-6 py-4 flex items-center justify-between">
                                <span className="text-xs text-muted-foreground font-medium">{confidence}% confidence</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                    >
                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                                            <polyline points="17 21 17 13 7 13 7 21"/>
                                            <polyline points="7 3 7 8 15 8"/>
                                        </svg>
                                        Save
                                    </button>
                                </div>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>

        <AITrainingConsentModal
            isOpen={showConsent}
            editedCount={editedCount}
            replacedCount={replacedCount}
            onAccept={handleConsentAccept}
            onDecline={handleConsentDecline}
            onCancel={handleConsentCancel}
        />
        </>
    )
}
