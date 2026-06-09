import { useState } from 'react'
import { ScanEye, FileText, CheckCircle2, AlertTriangle, Upload, Search, LayoutGrid, List, X, Archive, Sparkles, Loader2, MoreHorizontal, ChevronDown } from 'lucide-react'
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

const OCR_DOCUMENTS: OcrDoc[] = [
    { id: 'OCR-001', name: 'ACK-7842_AIS.pdf', vendor: 'AIS Furniture', type: 'Acknowledgment', date: 'Today, 2:30 PM', status: 'identified', lineItems: 4 },
    { id: 'OCR-002', name: 'PO-1029_ApexFurniture.pdf', vendor: 'Apex Furniture', type: 'Purchase Order', date: 'Today, 1:15 PM', status: 'capturing', lineItems: 7 },
    { id: 'OCR-003', name: 'ACK-7839_Steelcase.pdf', vendor: 'Steelcase', type: 'Acknowledgment', date: 'Yesterday', status: 'inconsistencies', lineItems: 3 },
    { id: 'OCR-004', name: 'INV-4521_HermanMiller.pdf', vendor: 'Herman Miller', type: 'Invoice', date: 'Yesterday', status: 'inconsistencies', lineItems: 5 },
    { id: 'OCR-005', name: 'ACK-7835_Knoll.pdf', vendor: 'Knoll', type: 'Acknowledgment', date: '2 days ago', status: 'processed', lineItems: 2 },
    { id: 'OCR-006', name: 'PO-1025_Haworth.pdf', vendor: 'Haworth', type: 'Purchase Order', date: '2 days ago', status: 'processed', lineItems: 4 },
    { id: 'OCR-007', name: 'ACK-7831_9to5.pdf', vendor: '9to5 Seating', type: 'Acknowledgment', date: '3 days ago', status: 'processed', lineItems: 1 },
    { id: 'OCR-008', name: 'ACK-7855_Knoll.pdf', vendor: 'Knoll', type: 'Acknowledgment', date: 'Today, 10:42 AM', status: 'in_progress', lineItems: 3, assigneeId: 'sarah' },
    { id: 'OCR-009', name: 'PO-1031_ApexFurniture.pdf', vendor: 'Apex Furniture', type: 'Purchase Order', date: 'Today, 11:08 AM', status: 'in_progress', lineItems: 6, assigneeId: 'marcus' },
    { id: 'OCR-010', name: 'PO-1027_Steelcase.pdf', vendor: 'Steelcase', type: 'Purchase Order', date: 'Today, 9:15 AM', status: 'in_progress', lineItems: 4, assigneeId: 'priya' },
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

                {/* Upload Zone (conditional) */}
                {showUpload && (
                    <div className="border-2 border-dashed border-ai/30 dark:border-ai/20 bg-ai-light/30 dark:bg-ai/5 rounded-2xl p-8 text-center transition-all relative">
                        <button onClick={() => setShowUpload(false)} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-muted text-muted-foreground" title="Close"><X className="h-4 w-4" /></button>
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-ai/10 flex items-center justify-center"><Upload className="h-7 w-7 text-ai" /></div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">Drop your document here or click to browse</p>
                                <p className="text-xs text-muted-foreground mt-1">Supports PDF, CSV, Excel — PO, ACK, or Invoice documents</p>
                            </div>
                            <button onClick={() => { setShowUpload(false); setProcessingDoc('OCR-NEW'); setTimeout(() => setProcessingDoc(null), 3000); }}
                                className="mt-2 px-6 py-2.5 bg-ai text-white rounded-lg text-sm font-medium hover:bg-ai/90 transition-colors flex items-center gap-2">
                                <Sparkles className="h-4 w-4" /> Simulate Upload & Process
                            </button>
                        </div>
                    </div>
                )}

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

                        {/* List View */}
                        {activeTab !== 'deprecated' && viewMode === 'list' && (
                            <div className="overflow-hidden rounded-xl border border-border">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/30">
                                            <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Document</th>
                                            <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Vendor</th>
                                            <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Type</th>
                                            <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                                            <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Line Items</th>
                                            <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Date</th>
                                            <th className="text-right text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDocs.map(doc => (
                                            <tr key={doc.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                                        <div>
                                                            <div className="text-sm font-medium text-foreground">{doc.name}</div>
                                                            <div className="text-[10px] text-muted-foreground font-mono">{doc.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-foreground">{doc.vendor}</td>
                                                <td className="px-4 py-3"><span className="text-xs font-medium px-2 py-1 rounded-md bg-muted text-muted-foreground">{doc.type}</span></td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                                                        doc.status === 'processed' || doc.status === 'completed' ? 'bg-success-light text-success' :
                                                        doc.status === 'in_progress' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400' :
                                                        doc.status === 'inconsistencies' ? 'bg-error-light text-error' :
                                                        doc.status === 'capturing' ? 'bg-ai-light text-ai' :
                                                        'bg-info-light text-info'
                                                    }`}>
                                                        {doc.status === 'identified' ? 'Ingesting' :
                                                         doc.status === 'capturing' ? 'Needs Attention' :
                                                         doc.status === 'inconsistencies' ? 'Awaiting Expert' :
                                                         doc.status === 'in_progress' ? 'In-progress' :
                                                         doc.status === 'completed' ? 'Completed' :
                                                         'Reconciled'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-foreground">{doc.lineItems} line items</td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">{doc.date}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={() => setPreviewDoc(doc)}
                                                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                                        title="Review Fields"
                                                        aria-label="Review document fields"
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
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

            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </div>
    )
}
