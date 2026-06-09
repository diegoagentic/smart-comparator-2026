import { useState } from 'react'
import { ScanEye, FileText, CheckCircle2, AlertTriangle, Upload, Search, LayoutGrid, List, X, Archive, Sparkles, Loader2, MoreHorizontal, ChevronDown, Send, Trash2 } from 'lucide-react'
import Navbar from './components/Navbar'
import Breadcrumbs from './components/Breadcrumbs'
import DocumentPreviewModal from './components/DocumentPreviewModal'
import CreateRecordModal, { type RecordType } from './components/create-record/CreateRecordModal'
import { getPreflightForDoc } from './components/create-record/mockPreflightData'
import { preflightHasInconsistencies } from './components/create-record/usePreflight'
import { ToastContainer, useToast } from './components/AuthToast'
import DeprecatedGrid from './components/deprecated/DeprecatedGrid'
import DocumentDeprecationModal from './components/DocumentDeprecationModal'
import { DEPRECATED_DOCS } from './components/deprecated/mockData'
import type { DeprecatedDoc, DeprecationReason, ActiveStatus } from './components/deprecated/types'
import OcrDocCard, { type OcrDocStatus, type OcrDocType } from './components/ocr/OcrDocCard'
import UploadDocumentModal from './components/ocr/UploadDocumentModal'
import { TEAM_MEMBERS, avatarGradient } from './components/team/teamMembers'

interface OcrDoc {
    id: string
    name: string
    vendor: string
    type: OcrDocType
    date: string
    status: OcrDocStatus
    lineItems: number
    /** Team member id who owns this document (drives the top-right avatar). */
    assigneeId?: string
}

// Mock seed sized to match prod counts (All 21 · In-Progress 6 · Reconciled 15).
// Literal cards from prod screenshot 2026-06-09: ergotron, Better Source,
// AmTab, Magnuson Group, Leland Furniture. Rest is filler.
const OCR_DOCUMENTS: OcrDoc[] = [
    // ── In-Progress (6) ──
    { id: 'OCR-001', name: '330357 - 1.pdf', vendor: 'ergotron', type: 'Quote', date: '21 days ago', status: 'in_progress', lineItems: 3, assigneeId: 'noah' },
    { id: 'OCR-002', name: 'Custer - Func.pdf', vendor: 'Better Source', type: 'Quote', date: '21 days ago', status: 'in_progress', lineItems: 2, assigneeId: 'noah' },
    // filler — not from prod screenshot
    { id: 'OCR-003', name: 'PO-1027_Steelcase.pdf', vendor: 'Steelcase', type: 'Purchase Order', date: 'today', status: 'in_progress', lineItems: 4, assigneeId: 'marcus' },
    { id: 'OCR-004', name: 'ACK-7855_Knoll.pdf', vendor: 'Knoll', type: 'Acknowledgment', date: 'yesterday', status: 'in_progress', lineItems: 3, assigneeId: 'sarah' },
    { id: 'OCR-005', name: 'QT-2891_HermanMiller.pdf', vendor: 'Herman Miller', type: 'Quote', date: 'today', status: 'in_progress', lineItems: 5, assigneeId: 'priya' },
    { id: 'OCR-006', name: 'PO-1031_ApexFurniture.pdf', vendor: 'Apex Furniture', type: 'Purchase Order', date: '3 days ago', status: 'in_progress', lineItems: 6, assigneeId: 'daniel' },

    // ── Reconciled (15) ──
    { id: 'OCR-007', name: 'S-QUO017792.pdf', vendor: 'AmTab', type: 'Quote', date: '21 days ago', status: 'processed', lineItems: 5, assigneeId: 'noah' },
    { id: 'OCR-008', name: 'QT007508.pdf', vendor: 'Magnuson Group', type: 'Quote', date: '21 days ago', status: 'processed', lineItems: 2, assigneeId: 'noah' },
    { id: 'OCR-009', name: '852078cb.pdf', vendor: 'Leland Furniture', type: 'Purchase Order', date: '3 days ago', status: 'processed', lineItems: 3, assigneeId: 'me' },
    // filler — not from prod screenshot
    { id: 'OCR-010', name: 'ACK-7835_Knoll.pdf', vendor: 'Knoll', type: 'Acknowledgment', date: '5 days ago', status: 'processed', lineItems: 2 },
    { id: 'OCR-011', name: 'PO-1025_Haworth.pdf', vendor: 'Haworth', type: 'Purchase Order', date: '6 days ago', status: 'processed', lineItems: 4 },
    { id: 'OCR-012', name: 'ACK-7831_9to5.pdf', vendor: '9to5 Seating', type: 'Acknowledgment', date: '7 days ago', status: 'processed', lineItems: 1 },
    { id: 'OCR-013', name: 'QT-5523_HON.pdf', vendor: 'HON', type: 'Quote', date: '8 days ago', status: 'processed', lineItems: 6 },
    { id: 'OCR-014', name: 'PO-2103_Allsteel.pdf', vendor: 'Allsteel', type: 'Purchase Order', date: '9 days ago', status: 'processed', lineItems: 3 },
    { id: 'OCR-015', name: 'ACK-9087_KI.pdf', vendor: 'KI Furniture', type: 'Acknowledgment', date: '10 days ago', status: 'processed', lineItems: 4 },
    { id: 'OCR-016', name: 'INV-3354_Global.pdf', vendor: 'Global Furniture', type: 'Invoice', date: '12 days ago', status: 'processed', lineItems: 5 },
    { id: 'OCR-017', name: 'QT-7741_OFS.pdf', vendor: 'OFS Brands', type: 'Quote', date: '14 days ago', status: 'processed', lineItems: 2 },
    { id: 'OCR-018', name: 'PO-4490_SitOnIt.pdf', vendor: 'SitOnIt Seating', type: 'Purchase Order', date: '15 days ago', status: 'processed', lineItems: 3 },
    { id: 'OCR-019', name: 'ACK-8821_Teknion.pdf', vendor: 'Teknion', type: 'Acknowledgment', date: '17 days ago', status: 'processed', lineItems: 2 },
    { id: 'OCR-020', name: 'QT-1102_Kimball.pdf', vendor: 'Kimball', type: 'Quote', date: '19 days ago', status: 'processed', lineItems: 4 },
    { id: 'OCR-021', name: 'PO-6678_NationalOffice.pdf', vendor: 'National Office Furniture', type: 'Purchase Order', date: '20 days ago', status: 'processed', lineItems: 6 },
]

const COLUMNS = [
    { id: 'identified', label: 'Ingesting', icon: FileText, color: 'text-info', bg: 'bg-info-light dark:bg-info/10', border: 'border-info/20' },
    { id: 'capturing', label: 'Needs Attention', icon: ScanEye, color: 'text-ai', bg: 'bg-ai-light dark:bg-ai/10', border: 'border-ai/20' },
    { id: 'inconsistencies', label: 'Awaiting Expert', icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning-light dark:bg-warning/10', border: 'border-warning/20' },
    { id: 'in_progress', label: 'In-progress', icon: Loader2, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-200 dark:border-indigo-500/20' },
    { id: 'processed', label: 'Reconciled', icon: CheckCircle2, color: 'text-success', bg: 'bg-success-light dark:bg-success/10', border: 'border-success/20' },
    { id: 'completed', label: 'Completed', icon: CheckCircle2, color: 'text-success', bg: 'bg-success-light dark:bg-success/10', border: 'border-success/20' },
]

interface OCRTrackingProps {
    onLogout: () => void;
    onNavigate: (page: string) => void;
    onConvertDocument?: (doc: { id: string; vendor: string; name: string; type: 'po' | 'ack'; tab: 'orders' | 'acknowledgments' }) => void;
}

export default function OCRTracking({ onLogout, onNavigate, onConvertDocument }: OCRTrackingProps) {
    const [showUpload, setShowUpload] = useState(false)
    const [processingDoc, setProcessingDoc] = useState<string | null>(null)
    const [createRecordDoc, setCreateRecordDoc] = useState<typeof OCR_DOCUMENTS[0] | null>(null)
    const [previewDoc, setPreviewDoc] = useState<typeof OCR_DOCUMENTS[0] | null>(null)
    const [deprecationTarget, setDeprecationTarget] = useState<typeof OCR_DOCUMENTS[0] | null>(null)
    const [documents, setDocuments] = useState(OCR_DOCUMENTS)
    const [deprecatedDocs, setDeprecatedDocs] = useState<DeprecatedDoc[]>(DEPRECATED_DOCS)
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState<'all' | 'identified' | 'capturing' | 'inconsistencies' | 'in_progress' | 'processed' | 'completed' | 'deprecated'>('all')
    const { toasts, addToast, dismissToast } = useToast()

    const handleResolve = (docId: string) => {
        setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'processed' } : d))
    }

    const recordTypeFromDoc = (doc: OcrDoc): RecordType =>
        doc.type === 'Acknowledgment' ? 'ACK' : 'PO'

    const handleCreateRecord = (doc: OcrDoc) => {
        const preflight = getPreflightForDoc(doc as unknown as Parameters<typeof getPreflightForDoc>[0])
        if (preflightHasInconsistencies(preflight)) {
            setCreateRecordDoc(doc)
            return
        }
        const recordId = `${recordTypeFromDoc(doc) === 'PO' ? 'PO' : 'ACK'}-${Math.floor(Math.random() * 9000) + 1000}`
        addToast('success', `Record ${recordId} created · ${doc.vendor}`)
    }

    const openDeprecation = (doc: OcrDoc) => {
        setDeprecationTarget(doc)
    }

    const handleConfirmDeprecation = (payload: {
        docId: string
        reason: DeprecationReason
        customReason?: string
        replacementId?: string
    }) => {
        const original = documents.find(d => d.id === payload.docId)
        if (!original) return

        const archived: DeprecatedDoc = {
            id: original.id,
            name: original.name,
            vendor: original.vendor,
            type: original.type,
            pages: 0,
            fields: 0,
            date: original.date,
            status: 'deprecated',
            confidence: null,
            inconsistencyCount: 0,
            deprecationReason: payload.reason,
            deprecationCustomReason: payload.customReason,
            replacementId: payload.replacementId,
            deprecatedAt: new Date().toISOString().slice(0, 10),
            deprecatedBy: 'demo.user@example.com',
            originalStatus: original.status as ActiveStatus,
        }

        setDocuments(prev => prev.filter(d => d.id !== payload.docId))
        setDeprecatedDocs(prev => [archived, ...prev])
        setDeprecationTarget(null)
        setPreviewDoc(null)

        const reasonLabel = payload.reason === 'other' && payload.customReason
            ? payload.customReason
            : payload.reason.replace('_', ' ')
        const linkSuffix = payload.replacementId ? ` → ${payload.replacementId}` : ''
        addToast('info', `${original.id} archived as "${reasonLabel}"${linkSuffix}`, {
            label: 'Undo',
            onClick: () => {
                setDeprecatedDocs(prev => prev.filter(d => d.id !== original.id))
                setDocuments(prev => [original, ...prev])
            },
        })
    }

    const handlePreviewDeprecated = (doc: DeprecatedDoc) => {
        setPreviewDoc({
            id: doc.id,
            name: doc.name,
            vendor: doc.vendor,
            type: doc.type as OcrDocType,
            date: doc.date ?? doc.deprecatedAt,
            status: 'deprecated',
            lineItems: 0,
        })
    }

    const filteredDocs = documents.filter(d => {
        const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.vendor.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesTab = activeTab === 'all' || d.status === activeTab
        return matchesSearch && matchesTab
    })

    const counts = {
        all: documents.length,
        identified: documents.filter(d => d.status === 'identified').length,
        capturing: documents.filter(d => d.status === 'capturing').length,
        inconsistencies: documents.filter(d => d.status === 'inconsistencies').length,
        in_progress: documents.filter(d => d.status === 'in_progress').length,
        processed: documents.filter(d => d.status === 'processed').length,
        completed: documents.filter(d => d.status === 'completed').length,
        deprecated: deprecatedDocs.length,
    }

    return (
        <div className="min-h-screen bg-background font-sans text-foreground pb-10">

            {/* Breadcrumb hoisted above navbar — matches prod top-left position */}
            <div className="fixed top-2 left-6 z-50 text-xs opacity-80 hover:opacity-100 transition-opacity pointer-events-auto">
                <Breadcrumbs items={[
                    { label: 'Smart Comparator', onClick: () => onNavigate('transactions') },
                    { label: 'OCR Tracking', active: true }
                ]} />
            </div>

            <Navbar onLogout={onLogout} activeTab="OCR" onNavigateToWorkspace={() => onNavigate('transactions')} onNavigate={onNavigate} />

            {/* Main Content — wider container to fit 8 tabs without horizontal scroll */}
            <div className="pt-24 px-4 max-w-screen-2xl mx-auto space-y-6">

                {/* Processing Indicator */}
                {processingDoc && (
                    <div className="bg-ai-light dark:bg-ai/10 border border-ai/20 rounded-xl p-4 flex items-center gap-3 animate-pulse">
                        <div className="w-8 h-8 rounded-lg bg-ai flex items-center justify-center"><ScanEye className="h-4 w-4 text-white animate-spin" /></div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">Processing document...</p>
                            <p className="text-xs text-muted-foreground">OCR extraction in progress — extracting fields and validating data</p>
                        </div>
                    </div>
                )}

                {/* ═══ Main Card Container — SAME as Transactions ═══ */}
                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">

                    {/* Header inside card — title + tabs + search + actions */}
                    <div className="p-6 border-b border-border">
                        <div className="flex flex-col gap-6">
                            {/* Top Row: Title + Tabs */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 whitespace-nowrap">
                                    Smart Comparator
                                </h3>
                                {/* Tabs — funnel stages + Deprecated archive (separated by divider) */}
                                <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit overflow-x-auto max-w-full">
                                    {[
                                        { id: 'all', label: 'All', count: counts.all, hint: 'All documents currently in the OCR pipeline' },
                                        { id: 'identified', label: 'Ingesting', count: counts.identified, hint: 'Newly uploaded documents being scanned and classified' },
                                        { id: 'capturing', label: 'Needs Attention', count: counts.capturing, hint: 'Fields extracted with low confidence — manual review suggested' },
                                        { id: 'inconsistencies', label: 'Awaiting Expert', count: counts.inconsistencies, hint: 'Inconsistencies detected — needs Expert Hub resolution' },
                                        { id: 'in_progress', label: 'In-progress', count: counts.in_progress, hint: 'An Expert Hub member is actively resolving inconsistencies on these documents' },
                                        { id: 'processed', label: 'Reconciled', count: counts.processed, hint: 'Reconciled documents ready to create as Orderbahn records' },
                                        { id: 'completed', label: 'Completed', count: counts.completed, hint: 'Documents fully processed and turned into Orderbahn records' },
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            title={tab.hint}
                                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 outline-none whitespace-nowrap ${
                                                activeTab === tab.id
                                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                                    : 'text-muted-foreground hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:text-foreground'
                                            }`}
                                        >
                                            {tab.label}
                                            <span title={`${tab.count} document${tab.count === 1 ? '' : 's'} in this stage`} className={`text-xs px-1.5 py-0.5 rounded-full transition-colors ${
                                                activeTab === tab.id ? 'bg-primary-foreground/10 text-primary-foreground' : 'bg-background text-muted-foreground'
                                            }`}>{tab.count}</span>
                                        </button>
                                    ))}
                                    {/* Visual divider — separates active funnel from archive */}
                                    <span aria-hidden="true" className="self-center w-px h-5 bg-border mx-1.5" />
                                    <button
                                        onClick={() => setActiveTab('deprecated')}
                                        title="Archived documents — no longer in the active pipeline (superseded, cancelled, duplicates, etc.)"
                                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 outline-none whitespace-nowrap ${
                                            activeTab === 'deprecated'
                                                ? 'bg-zinc-700 dark:bg-zinc-200 text-white dark:text-zinc-900 shadow-sm'
                                                : 'text-muted-foreground hover:bg-zinc-300/40 dark:hover:bg-zinc-700/40 hover:text-foreground'
                                        }`}
                                    >
                                        Deprecated
                                        <span title={`${counts.deprecated} archived document${counts.deprecated === 1 ? '' : 's'}`} className={`text-xs px-1.5 py-0.5 rounded-full transition-colors ${
                                            activeTab === 'deprecated' ? 'bg-white/15 dark:bg-zinc-900/15 text-white dark:text-zinc-900' : 'bg-background text-muted-foreground'
                                        }`}>{counts.deprecated}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Bottom Row: Search · Filter · Avatar group · spacer · View toggle · Upload */}
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="relative flex-1 max-w-sm min-w-[200px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search documents..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        title="Search by document name or vendor"
                                        className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
                                    />
                                </div>

                                {/* Filter dropdown (placeholder — matches prod "All" pill) */}
                                <button
                                    title="Filter documents (placeholder)"
                                    className="flex items-center gap-2 px-3 py-2 text-sm bg-background border border-input rounded-lg text-foreground hover:bg-muted transition-colors min-w-[110px]"
                                >
                                    <span className="text-muted-foreground">All</span>
                                    <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto" />
                                </button>

                                {/* Avatar group — team members with access (CC CM DP DZ JV JV +6 style) */}
                                <div className="flex items-center -space-x-2">
                                    {TEAM_MEMBERS.slice(0, 6).map(m => (
                                        <div
                                            key={m.id}
                                            title={`${m.name} · ${m.role}`}
                                            className={`h-8 w-8 rounded-full bg-gradient-to-br ${avatarGradient(m.id)} ring-2 ring-card flex items-center justify-center text-white text-[10px] font-bold`}
                                        >
                                            {m.initials}
                                        </div>
                                    ))}
                                    {TEAM_MEMBERS.length > 6 && (
                                        <div
                                            title={`${TEAM_MEMBERS.length - 6} more team members`}
                                            className="h-8 w-8 rounded-full bg-muted ring-2 ring-card flex items-center justify-center text-foreground text-[10px] font-bold"
                                        >
                                            +{TEAM_MEMBERS.length - 6}
                                        </div>
                                    )}
                                </div>

                                <div className="ml-auto flex items-center gap-2">
                                    {/* View toggle */}
                                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                                        <button onClick={() => setViewMode('list')} title="List view" aria-label="List view" className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
                                            <List className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => setViewMode('kanban')} title="Board view" aria-label="Board view" className={`p-2 transition-colors ${viewMode === 'kanban' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
                                            <LayoutGrid className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Upload Document — prominent lime brand button */}
                                    <button
                                        onClick={() => setShowUpload(true)}
                                        title="Upload a new document"
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                                    >
                                        <Upload className="h-4 w-4" />
                                        Upload Document
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content area inside the card */}
                    <div className="p-6">
                        {/* Deprecated archive — replaces kanban/list when active */}
                        {activeTab === 'deprecated' && (
                            <DeprecatedGrid
                                docs={deprecatedDocs}
                                onPreview={handlePreviewDeprecated}
                            />
                        )}

                        {/* Kanban View — flex horizontal scroll, fixed-width columns to match prod card width */}
                        {activeTab !== 'deprecated' && viewMode === 'kanban' && (
                            <div className="flex gap-4 overflow-x-auto pb-3 -mx-2 px-2">
                                {COLUMNS.map(column => {
                                    const docs = filteredDocs.filter(d => d.status === column.id)
                                    return (
                                        <div key={column.id} className="space-y-3 min-w-[300px] flex-shrink-0">
                                            {/* Column Header */}
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-sm font-semibold ${column.color}`}>{column.label}</span>
                                                <span className="text-xs font-bold bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md">{docs.length}</span>
                                                <button className="ml-auto p-1 text-muted-foreground hover:text-foreground" title="Column options"><MoreHorizontal className="h-4 w-4" /></button>
                                            </div>
                                            {/* Cards */}
                                            <div className="space-y-3">
                                                {docs.map(doc => (
                                                    <OcrDocCard
                                                        key={doc.id}
                                                        doc={doc}
                                                        onPreview={() => setPreviewDoc(doc)}
                                                        onResolve={() => handleResolve(doc.id)}
                                                        onSend={() => handleCreateRecord(doc)}
                                                        onDeprecate={() => openDeprecation(doc)}
                                                    />
                                                ))}
                                                {docs.length === 0 && (
                                                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                                                        <p className="text-xs text-muted-foreground">No documents</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* List View — matches prod: Document hash + line items / Vendor + type pill / Status / Review Status / Date / Actions */}
                        {activeTab !== 'deprecated' && viewMode === 'list' && (
                            <div className="overflow-hidden rounded-xl border border-border">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/30">
                                            <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Document</th>
                                            <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Vendor</th>
                                            <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                                            <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Review Status</th>
                                            <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Date</th>
                                            <th className="text-right text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDocs.map(doc => {
                                            const isReconciledLike = doc.status === 'processed' || doc.status === 'completed'
                                            const isProcessing = doc.status === 'identified' || doc.status === 'capturing'
                                            const assignee = doc.assigneeId ? TEAM_MEMBERS.find(m => m.id === doc.assigneeId) : null
                                            return (
                                                <tr key={doc.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                                            <div>
                                                                <div className="text-sm font-bold text-foreground font-mono">{doc.id}</div>
                                                                <div className="text-[11px] text-muted-foreground">{doc.lineItems > 0 ? `${doc.lineItems} line items` : '—'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="text-sm font-bold text-foreground">{doc.vendor}</div>
                                                        <div className="mt-0.5">
                                                            <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide ${
                                                                doc.type === 'Quote' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300' :
                                                                doc.type === 'Purchase Order' ? 'bg-muted text-muted-foreground' :
                                                                doc.type === 'Acknowledgment' ? 'bg-muted text-muted-foreground' :
                                                                'bg-muted text-muted-foreground'
                                                            }`}>{doc.type}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                                                            isReconciledLike ? 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300' :
                                                            doc.status === 'in_progress' ? 'bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300' :
                                                            doc.status === 'inconsistencies' ? 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300' :
                                                            isProcessing ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' :
                                                            'bg-muted text-muted-foreground'
                                                        }`}>
                                                            {isReconciledLike ? 'Validated' :
                                                             doc.status === 'in_progress' ? 'In Progress' :
                                                             doc.status === 'inconsistencies' ? 'Awaiting Expert' :
                                                             isProcessing ? 'Processing' : doc.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {isReconciledLike ? (
                                                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300">
                                                                <CheckCircle2 className="h-3 w-3" /> Reviewed
                                                            </span>
                                                        ) : isProcessing ? (
                                                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                                                                <Loader2 className="h-3 w-3 animate-spin" /> Calculating…
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-yellow-50 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300">
                                                                <AlertTriangle className="h-3 w-3" /> Pending For Review
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-muted-foreground">{doc.date}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                onClick={() => setPreviewDoc(doc)}
                                                                className="p-1.5 rounded-md text-foreground hover:bg-muted transition-colors"
                                                                title="Review Fields"
                                                                aria-label="Review document fields"
                                                            >
                                                                <FileText className="h-4 w-4" />
                                                            </button>
                                                            {isReconciledLike && (
                                                                <button
                                                                    onClick={() => handleCreateRecord(doc)}
                                                                    className="p-1.5 rounded-md text-green-600 bg-green-50 dark:text-green-300 dark:bg-green-500/15 hover:brightness-95 transition-all"
                                                                    title="Send"
                                                                    aria-label="Send to Orderbahn"
                                                                >
                                                                    <Send className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => openDeprecation(doc)}
                                                                className="p-1.5 rounded-md text-red-600 bg-red-50 dark:text-red-300 dark:bg-red-500/15 hover:brightness-95 transition-all"
                                                                title="Deprecate"
                                                                aria-label="Deprecate document"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                            {assignee && (
                                                                <div
                                                                    title={assignee.name}
                                                                    className={`h-7 w-7 rounded-full bg-gradient-to-br ${avatarGradient(assignee.id)} flex items-center justify-center text-white text-[10px] font-bold ml-1`}
                                                                >
                                                                    {assignee.initials}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Document Preview Modal */}
            <DocumentPreviewModal
                isOpen={!!previewDoc}
                onClose={() => setPreviewDoc(null)}
                document={previewDoc ? { id: previewDoc.id, name: previewDoc.name, vendor: previewDoc.vendor, type: previewDoc.type, fields: 0, confidence: null, status: previewDoc.status, inconsistencyCount: 0 } : null}
                onResolve={handleResolve}
                onMarkDeprecated={(_docId) => {
                    if (previewDoc) openDeprecation(previewDoc)
                }}
            />

            {/* Mark-as-Deprecated reason picker */}
            <DocumentDeprecationModal
                isOpen={!!deprecationTarget}
                onClose={() => setDeprecationTarget(null)}
                document={deprecationTarget ? {
                    id: deprecationTarget.id,
                    name: deprecationTarget.name,
                    vendor: deprecationTarget.vendor,
                    type: deprecationTarget.type,
                    status: deprecationTarget.status as ActiveStatus,
                } : null}
                candidates={documents.map(d => ({
                    id: d.id,
                    vendor: d.vendor,
                    name: d.name,
                    type: d.type,
                    date: d.date,
                }))}
                onConfirm={handleConfirmDeprecation}
            />

            {/* Create Record Modal (Fase 1: stub shell) */}
            <CreateRecordModal
                isOpen={!!createRecordDoc}
                onClose={() => setCreateRecordDoc(null)}
                document={createRecordDoc}
                recordType={createRecordDoc ? recordTypeFromDoc(createRecordDoc) : 'PO'}
                onCreated={(recordId) => {
                    const doc = createRecordDoc
                    setCreateRecordDoc(null)
                    if (doc) addToast('success', `Record ${recordId} created · ${doc.vendor}`)
                }}
            />

            {/* Upload Document Modal — 5-step flow: select → dropzone → review → uploading → complete */}
            <UploadDocumentModal
                isOpen={showUpload}
                onClose={() => setShowUpload(false)}
                onConfirm={(docType, uploadedFiles) => {
                    if (uploadedFiles.length === 0) return
                    // Each uploaded file becomes a new doc in 'identified' status (Processing in UI).
                    const newDocs: OcrDoc[] = uploadedFiles.map(f => ({
                        id: Math.random().toString(36).slice(2, 10),
                        name: f.name,
                        vendor: 'Unknown Vendor',
                        type: docType,
                        date: 'today',
                        status: 'identified' as const,
                        lineItems: 0,
                        assigneeId: 'me',
                    }))
                    setDocuments(prev => [...newDocs, ...prev])
                    setProcessingDoc(newDocs[0].id)
                    addToast('success', `Processing new file${newDocs.length === 1 ? '' : 's'}…`)
                    setTimeout(() => setProcessingDoc(null), 3000)
                }}
            />

            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </div>
    )
}
