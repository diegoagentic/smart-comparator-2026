import { useState } from 'react'
import { ScanEye, FileText, AlertTriangle, CheckCircle2, Upload, Eye, MoreHorizontal, Sparkles, Search, LayoutGrid, List, ChevronDown, ChevronUp, X, FilePlus2, Archive, Loader2, Flame, Trash2, Download } from 'lucide-react'
import { exportOcrPdf } from './utils/exportOcrPdf'
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
import { isUnsupportedDocType } from './components/deprecated/types'
import type { DeprecatedDoc, DeprecationReason, ActiveStatus } from './components/deprecated/types'
import AssignPopover from './components/team/AssignPopover'
import { getTeamMember, CURRENT_USER_ID } from './components/team/teamMembers'

interface OcrDoc {
    id: string
    name: string
    vendor: string
    type: string
    pages: number
    fields: number
    date: string
    status: 'identified' | 'capturing' | 'inconsistencies' | 'in_progress' | 'processed'
    confidence: number | null
    inconsistencyCount: number
    /** Team member id who owns this document (any active human-action stage). */
    assigneeId?: string
    // In-progress only — populated when an Expert Hub member claimed the doc
    expertName?: string
    expertInitials?: string
    workstream?: string
    startedRelative?: string
    resolvedCount?: number
    etaMinutes?: number
}

const OCR_DOCUMENTS: OcrDoc[] = [
    { id: 'OCR-001', name: 'ACK-7842_AIS.pdf', vendor: 'AIS Furniture', type: 'Acknowledgment', pages: 3, fields: 50, date: 'Today, 2:30 PM', status: 'identified', confidence: null, inconsistencyCount: 0 },
    { id: 'OCR-002', name: 'PO-1029_ApexFurniture.pdf', vendor: 'Apex Furniture', type: 'Purchase Order', pages: 5, fields: 82, date: 'Today, 1:15 PM', status: 'capturing', confidence: 72, inconsistencyCount: 0 },
    { id: 'OCR-003', name: 'ACK-7839_Steelcase.pdf', vendor: 'Steelcase', type: 'Acknowledgment', pages: 2, fields: 35, date: 'Yesterday', status: 'inconsistencies', confidence: 83, inconsistencyCount: 3 },
    { id: 'OCR-004', name: 'INV-4521_HermanMiller.pdf', vendor: 'Herman Miller', type: 'Invoice', pages: 4, fields: 61, date: 'Yesterday', status: 'inconsistencies', confidence: 88, inconsistencyCount: 5 },
    { id: 'OCR-005', name: 'ACK-7835_Knoll.pdf', vendor: 'Knoll', type: 'Acknowledgment', pages: 2, fields: 28, date: '2 days ago', status: 'processed', confidence: 99, inconsistencyCount: 0 },
    { id: 'OCR-006', name: 'PO-1025_Haworth.pdf', vendor: 'Haworth', type: 'Purchase Order', pages: 3, fields: 45, date: '2 days ago', status: 'processed', confidence: 97, inconsistencyCount: 0 },
    { id: 'OCR-007', name: 'ACK-7831_9to5.pdf', vendor: '9to5 Seating', type: 'Acknowledgment', pages: 1, fields: 12, date: '3 days ago', status: 'processed', confidence: 100, inconsistencyCount: 0 },
    // In-progress — Expert Hub members actively resolving inconsistencies
    { id: 'OCR-008', name: 'ACK-7855_Knoll.pdf', vendor: 'Knoll', type: 'Acknowledgment', pages: 2, fields: 32, date: 'Today, 10:42 AM', status: 'in_progress', confidence: 86, inconsistencyCount: 8,
      assigneeId: 'sarah', expertName: 'Sarah Johnson', expertInitials: 'SJ', workstream: 'Pricing review', startedRelative: '12m ago', resolvedCount: 5, etaMinutes: 15 },
    { id: 'OCR-009', name: 'PO-1031_ApexFurniture.pdf', vendor: 'Apex Furniture', type: 'Purchase Order', pages: 4, fields: 47, date: 'Today, 11:08 AM', status: 'in_progress', confidence: 81, inconsistencyCount: 12,
      assigneeId: 'marcus', expertName: 'Marcus Webb', expertInitials: 'MW', workstream: 'Catalog match', startedRelative: '4m ago', resolvedCount: 3, etaMinutes: 30 },
    { id: 'OCR-010', name: 'PO-1027_Steelcase.pdf', vendor: 'Steelcase', type: 'Purchase Order', pages: 3, fields: 41, date: 'Today, 9:15 AM', status: 'in_progress', confidence: 94, inconsistencyCount: 9,
      assigneeId: 'priya', expertName: 'Priya Shah', expertInitials: 'PS', workstream: 'Vendor mapping', startedRelative: '38m ago', resolvedCount: 7, etaMinutes: 5 },
]

const COLUMNS = [
    { id: 'identified', label: 'Ingesting', icon: FileText, color: 'text-info', bg: 'bg-info-light dark:bg-info/10', border: 'border-info/20' },
    { id: 'capturing', label: 'Needs Attention', icon: ScanEye, color: 'text-ai', bg: 'bg-ai-light dark:bg-ai/10', border: 'border-ai/20' },
    { id: 'inconsistencies', label: 'Awaiting Expert', icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning-light dark:bg-warning/10', border: 'border-warning/20' },
    { id: 'in_progress', label: 'In-progress', icon: Loader2, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-200 dark:border-indigo-500/20' },
    { id: 'processed', label: 'Reconciled', icon: CheckCircle2, color: 'text-success', bg: 'bg-success-light dark:bg-success/10', border: 'border-success/20' },
]

interface OCRTrackingProps {
    onLogout: () => void;
    onNavigate: (page: string) => void;
    onConvertDocument?: (doc: { id: string; vendor: string; name: string; type: 'po' | 'ack'; tab: 'orders' | 'acknowledgments' }) => void;
}

export default function OCRTracking({ onLogout, onNavigate, onConvertDocument }: OCRTrackingProps) {
    const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
    const [showUpload, setShowUpload] = useState(false)
    const [processingDoc, setProcessingDoc] = useState<string | null>(null)
    const [createRecordDoc, setCreateRecordDoc] = useState<typeof OCR_DOCUMENTS[0] | null>(null)
    const [previewDoc, setPreviewDoc] = useState<typeof OCR_DOCUMENTS[0] | null>(null)
    const [deprecationTarget, setDeprecationTarget] = useState<typeof OCR_DOCUMENTS[0] | null>(null)
    const [documents, setDocuments] = useState(OCR_DOCUMENTS)
    const [deprecatedDocs, setDeprecatedDocs] = useState<DeprecatedDoc[]>(DEPRECATED_DOCS)
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState<'all' | 'identified' | 'capturing' | 'inconsistencies' | 'in_progress' | 'processed' | 'deprecated'>('all')
    const [deprecatedFilter, setDeprecatedFilter] = useState('All')
    const [timeFilter, setTimeFilter] = useState('All Time')
    const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false)
    const [downloadingId, setDownloadingId] = useState<string | null>(null)
    const { toasts, addToast, dismissToast } = useToast()

    const handleDownload = async (e: React.MouseEvent, doc: typeof OCR_DOCUMENTS[0]) => {
        e.stopPropagation()
        if (downloadingId) return
        setDownloadingId(doc.id)
        try {
            await exportOcrPdf({ id: doc.id, name: doc.name, vendor: doc.vendor, type: doc.type, fields: doc.fields, confidence: doc.confidence, status: doc.status })
        } finally {
            setDownloadingId(null)
        }
    }

    const handleResolve = (docId: string) => {
        setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'processed', inconsistencyCount: 0, confidence: 99 } : d))
    }

    const handleAssign = (docId: string, memberId: string | null) => {
        setDocuments(prev => prev.map(d => {
            if (d.id !== docId) return d
            const next = { ...d, assigneeId: memberId ?? undefined }
            // Keep denormalized expert fields in sync for in-progress cards
            if (d.status === 'in_progress') {
                const member = getTeamMember(memberId)
                if (member) {
                    next.expertName = member.name
                    next.expertInitials = member.initials
                } else {
                    next.expertName = undefined
                    next.expertInitials = undefined
                }
            }
            return next
        }))

        const doc = documents.find(d => d.id === docId)
        if (memberId === CURRENT_USER_ID) {
            addToast('success', `${docId} assigned to you`)
        } else if (memberId === null) {
            addToast('info', `${docId} unassigned${doc ? ` · ${doc.vendor}` : ''}`)
        } else {
            const member = getTeamMember(memberId)
            if (member) addToast('success', `${docId} assigned to ${member.name}`)
        }
    }

    const recordTypeFromDoc = (doc: typeof OCR_DOCUMENTS[0]): RecordType =>
        doc.type === 'Acknowledgment' ? 'ACK' : 'PO'

    const handleCreateRecord = (doc: typeof OCR_DOCUMENTS[0]) => {
        const preflight = getPreflightForDoc(doc)
        if (preflightHasInconsistencies(preflight)) {
            setCreateRecordDoc(doc)
            return
        }
        const recordId = `${recordTypeFromDoc(doc) === 'PO' ? 'PO' : 'ACK'}-${Math.floor(Math.random() * 9000) + 1000}`
        addToast('success', `Record ${recordId} created · ${doc.vendor}`)
    }

    // Deprecation flow: open modal from preview
    const openDeprecation = (doc: typeof OCR_DOCUMENTS[0]) => {
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
            pages: original.pages,
            fields: original.fields,
            date: original.date,
            status: 'deprecated',
            confidence: original.confidence,
            inconsistencyCount: original.inconsistencyCount,
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
        // Adapt DeprecatedDoc → preview-doc shape (subset of fields preview needs)
        setPreviewDoc({
            id: doc.id,
            name: doc.name,
            vendor: doc.vendor,
            type: doc.type,
            pages: doc.pages ?? 0,
            fields: doc.fields,
            date: doc.date ?? doc.deprecatedAt,
            status: 'deprecated',
            confidence: doc.confidence,
            inconsistencyCount: doc.inconsistencyCount,
        } as unknown as typeof OCR_DOCUMENTS[0])
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
        deprecated: deprecatedDocs.length,
    }

    return (
        <div className="min-h-screen bg-background font-sans text-foreground pb-10">

            <Navbar onLogout={onLogout} activeTab="OCR" onNavigateToWorkspace={() => onNavigate('transactions')} onNavigate={onNavigate} />

            {/* Main Content — same structure as Transactions: pt-24 px-4 max-w-7xl mx-auto */}
            <div className="pt-24 px-4 max-w-7xl mx-auto space-y-6">

                {/* Breadcrumbs */}
                <div className="mb-4">
                    <Breadcrumbs items={[
                        { label: 'Smart Comparator', onClick: () => onNavigate('transactions') },
                        { label: 'OCR Tracking' }
                    ]} />
                </div>

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
                                <div className="hidden sm:block w-px h-6 bg-border mx-2"></div>
                                {/* Tabs — funnel stages + Deprecated archive (separated by divider) */}
                                <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit overflow-x-auto max-w-full">
                                    {[
                                        { id: 'all', label: 'All', count: counts.all, hint: 'All documents currently in the OCR pipeline' },
                                        { id: 'identified', label: 'Ingesting', count: counts.identified, hint: 'Newly uploaded documents being scanned and classified' },
                                        { id: 'capturing', label: 'Needs Attention', count: counts.capturing, hint: 'Fields extracted with low confidence — manual review suggested' },
                                        { id: 'inconsistencies', label: 'Awaiting Expert', count: counts.inconsistencies, hint: 'Inconsistencies detected — needs Expert Hub resolution' },
                                        { id: 'in_progress', label: 'In-progress', count: counts.in_progress, hint: 'An Expert Hub member is actively resolving inconsistencies on these documents' },
                                        { id: 'processed', label: 'Validated', count: counts.processed, hint: 'Reconciled documents ready to create as Orderbahn records' },
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

                            {/* Bottom Row: Search + View Toggle + Actions */}
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="relative flex-1 max-w-sm">
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
                                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                                    <button onClick={() => setViewMode('list')} title="List view" aria-label="List view" className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
                                        <List className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => setViewMode('kanban')} title="Board view" aria-label="Board view" className={`p-2 transition-colors ${viewMode === 'kanban' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
                                        <LayoutGrid className="h-4 w-4" />
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

                        {/* Kanban View */}
                        {activeTab !== 'deprecated' && viewMode === 'kanban' && (
                            <div className="grid grid-cols-5 gap-3">
                                {COLUMNS.map(column => {
                                    const docs = filteredDocs.filter(d => d.status === column.id)
                                    const Icon = column.icon
                                    return (
                                        <div key={column.id} className="space-y-3">
                                            {/* Column Header */}
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-sm font-semibold ${column.color}`}>{column.label}</span>
                                                <span className="text-xs font-bold bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md">{docs.length}</span>
                                                <button className="ml-auto p-1 text-muted-foreground hover:text-foreground" title="Column options"><MoreHorizontal className="h-4 w-4" /></button>
                                            </div>
                                            {/* Cards */}
                                            <div className="space-y-3">
                                                {docs.map(doc => (
                                                    <div
                                                        key={doc.id}
                                                        className={`group relative bg-card dark:bg-zinc-800 rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col ${
                                                            selectedDoc === doc.id
                                                                ? 'border-brand-400/50 ring-1 ring-brand-400/20 shadow-lg'
                                                                : 'border-border shadow-sm hover:shadow-md'
                                                        }`}
                                                    >
                                                        <div className="p-4">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div className="flex items-center gap-2">
                                                                    <div title={
                                                                        doc.status === 'processed' ? 'Validated · ready to create record' :
                                                                        doc.status === 'in_progress' ? `In-progress · ${doc.expertName ?? 'Expert Hub member'} resolving inconsistencies` :
                                                                        doc.status === 'inconsistencies' ? 'Awaiting Expert · inconsistencies detected' :
                                                                        doc.status === 'capturing' ? 'Needs Attention · low-confidence fields' :
                                                                        'Ingesting · scanning and extracting'
                                                                    }
                                                                        className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                                                                            doc.status === 'processed' ? 'bg-green-600 text-white' :
                                                                            doc.status === 'in_progress' ? 'bg-indigo-600 text-white' :
                                                                            doc.status === 'inconsistencies' ? 'bg-amber-600 text-white' :
                                                                            doc.status === 'capturing' ? 'bg-ai text-white' :
                                                                            'bg-blue-600 text-white'
                                                                        }`}>
                                                                        <Icon className={`h-4 w-4 ${doc.status === 'in_progress' ? 'animate-spin' : ''}`} />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-bold text-foreground">{doc.vendor}</p>
                                                                        <p className="text-[10px] text-muted-foreground font-mono">{doc.id}</p>
                                                                    </div>
                                                                </div>
                                                                {/* Assignee chip / Assign button — only for human-action stages */}
                                                                {(doc.status === 'inconsistencies' || doc.status === 'in_progress' || doc.status === 'processed') && (
                                                                    <AssignPopover
                                                                        assigneeId={doc.assigneeId}
                                                                        onAssign={(memberId) => handleAssign(doc.id, memberId)}
                                                                        triggerLabel={
                                                                            doc.status === 'inconsistencies' ? 'Assign expert' :
                                                                            doc.status === 'processed' ? 'Assign owner' :
                                                                            'Assign'
                                                                        }
                                                                        filterRoles={doc.status === 'inconsistencies' || doc.status === 'in_progress' ? ['Expert Hub', 'Account Manager'] : undefined}
                                                                        hoverContent={
                                                                            doc.status === 'in_progress' && doc.workstream ? (
                                                                                <div className="space-y-2">
                                                                                    <div className="flex justify-between text-[11.5px]">
                                                                                        <span className="text-muted-foreground">Workstream</span>
                                                                                        <span className="font-medium text-foreground">{doc.workstream}</span>
                                                                                    </div>
                                                                                    {doc.startedRelative && (
                                                                                        <div className="flex justify-between text-[11.5px]">
                                                                                            <span className="text-muted-foreground">Started</span>
                                                                                            <span className="font-medium text-foreground">{doc.startedRelative}</span>
                                                                                        </div>
                                                                                    )}
                                                                                    {doc.resolvedCount != null && doc.inconsistencyCount > 0 && (
                                                                                        <div>
                                                                                            <div className="flex justify-between text-[11.5px] mb-1">
                                                                                                <span className="text-muted-foreground">Progress</span>
                                                                                                <span className="font-mono font-semibold text-foreground">{doc.resolvedCount}/{doc.inconsistencyCount} ({Math.round((doc.resolvedCount / doc.inconsistencyCount) * 100)}%)</span>
                                                                                            </div>
                                                                                            <div className="h-1 rounded-full overflow-hidden bg-muted">
                                                                                                <div
                                                                                                    className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full"
                                                                                                    style={{ width: `${Math.round((doc.resolvedCount / doc.inconsistencyCount) * 100)}%` }}
                                                                                                />
                                                                                            </div>
                                                                                        </div>
                                                                                    )}
                                                                                    {doc.etaMinutes != null && (
                                                                                        <div className="flex justify-between text-[11.5px]">
                                                                                            <span className="text-muted-foreground">ETA</span>
                                                                                            <span className="font-medium text-indigo-700 dark:text-indigo-300">~{doc.etaMinutes} min</span>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            ) : doc.status === 'inconsistencies' ? (
                                                                                <div className="text-[11.5px] text-muted-foreground">
                                                                                    Awaiting kickoff — the expert hasn't started resolving inconsistencies yet.
                                                                                </div>
                                                                            ) : doc.status === 'processed' ? (
                                                                                <div className="text-[11.5px] text-muted-foreground">
                                                                                    Owns the next step: turning this validated document into an Orderbahn record.
                                                                                </div>
                                                                            ) : null
                                                                        }
                                                                    />
                                                                )}
                                                            </div>

                                                            <div className="space-y-2 mb-3">
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-muted-foreground">Document</span>
                                                                    <span title={doc.name} className="font-medium text-foreground truncate ml-2 max-w-[140px]">{doc.name}</span>
                                                                </div>
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-muted-foreground">Fields</span>
                                                                    <span title="Fields extracted by OCR from this document" className="font-medium text-foreground">{doc.fields} fields</span>
                                                                </div>
                                                            </div>

                                                            {doc.inconsistencyCount > 0 && (
                                                                <div title="Fields with inconsistencies — require resolution before record creation" className="flex items-center gap-1.5 text-xs text-error font-medium bg-error-light dark:bg-error/10 px-2 py-1 rounded-md mb-3">
                                                                    <AlertTriangle className="h-3 w-3" />{doc.inconsistencyCount} inconsistencies
                                                                </div>
                                                            )}

                                                            {isUnsupportedDocType(doc.type) && (
                                                                <div
                                                                    title={`${doc.type}s aren't processed in this phase. Recommended action: archive (Mark as Deprecated → Out of scope).`}
                                                                    className="flex items-center gap-1.5 text-[11px] text-orange-700 dark:text-orange-300 font-medium bg-orange-50 dark:bg-orange-500/10 ring-1 ring-inset ring-orange-200 dark:ring-orange-500/20 px-2 py-1 rounded-md mb-3"
                                                                >
                                                                    <Archive className="h-3 w-3" />
                                                                    {doc.type}s out of scope · archive suggested
                                                                </div>
                                                            )}


                                                            {/* Status + Date + Actions — matches Transactions card footer */}
                                                            <div className="pt-3 border-t border-border flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    {doc.confidence ? (
                                                                        <span title="Confidence Score" className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                                                            doc.confidence > 90 ? 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300 ring-1 ring-inset ring-green-600/20 dark:ring-green-400/30' :
                                                                            doc.confidence >= 75 ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 ring-1 ring-inset ring-amber-600/20 dark:ring-amber-400/30' :
                                                                            'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300 ring-1 ring-inset ring-red-600/20 dark:ring-red-400/30'
                                                                        }`}>
                                                                            <Flame className="h-3 w-3 fill-current" />{doc.confidence}%
                                                                        </span>
                                                                    ) : doc.status === 'identified' ? (
                                                                        <select
                                                                            value={doc.type}
                                                                            onChange={(e) => setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, type: e.target.value } : d))}
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            title="Select document type"
                                                                            className="text-[10px] font-medium text-muted-foreground bg-muted border border-border rounded-md px-1.5 py-0.5 hover:bg-background focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer"
                                                                        >
                                                                            <option value="Purchase Order">Purchase Order</option>
                                                                            <option value="Acknowledgment">Acknowledgment</option>
                                                                            <option value="Invoice">Invoice</option>
                                                                            <option value="Quote">Quote</option>
                                                                        </select>
                                                                    ) : (
                                                                        <span title="Document type detected by OCR" className="text-[10px] font-medium text-muted-foreground">{doc.type}</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    {doc.status !== 'identified' && (
                                                                        <>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setPreviewDoc(doc);
                                                                                }}
                                                                                className="p-1.5 rounded-md text-muted-foreground hover:text-ai hover:bg-ai/10 transition-all"
                                                                                title="Preview document and review extracted fields"
                                                                                aria-label="Preview document"
                                                                            >
                                                                                <Eye className="h-4 w-4" />
                                                                            </button>
                                                                            <button
                                                                                onClick={(e) => handleDownload(e, doc)}
                                                                                disabled={downloadingId === doc.id}
                                                                                className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 disabled:opacity-50 transition-all"
                                                                                title="Download OCR report as PDF"
                                                                                aria-label="Download PDF"
                                                                            >
                                                                                {downloadingId === doc.id
                                                                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                                                                    : <Download className="h-4 w-4" />}
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            openDeprecation(doc);
                                                                        }}
                                                                        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                                                                        title="Mark as Deprecated — move to archive"
                                                                        aria-label="Deprecate document"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                    {(doc.status === 'identified' || doc.status === 'processed') && (
                                                                        <button
                                                                            onClick={() => setSelectedDoc(selectedDoc === doc.id ? null : doc.id)}
                                                                            title={selectedDoc === doc.id ? 'Collapse details' : 'Show actions and details'}
                                                                            aria-label={selectedDoc === doc.id ? 'Collapse details' : 'Show details'}
                                                                            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                                                                        >
                                                                            {selectedDoc === doc.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Expanded detail */}
                                                        {selectedDoc === doc.id && (
                                                            <div className="px-4 pb-4 pt-0 space-y-2 border-t border-border">
                                                                {doc.status === 'identified' && (
                                                                    <div className="space-y-2.5 py-1">
                                                                        <span className="text-xs text-muted-foreground font-medium">Ingesting document...</span>
                                                                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                                            <div className="h-full bg-info rounded-full animate-[ingestProgress_3s_ease-out_forwards]" />
                                                                        </div>
                                                                        <style>{`@keyframes ingestProgress { from { width: 5%; } to { width: 60%; } }`}</style>
                                                                        <p className="text-[10px] text-muted-foreground">Scanning pages and extracting fields...</p>
                                                                    </div>
                                                                )}
                                                                {doc.status === 'processed' && (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleCreateRecord(doc); }}
                                                                        title={`Create an Orderbahn ${recordTypeFromDoc(doc) === 'PO' ? 'Purchase Order' : 'Acknowledgement'} record from this document`}
                                                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium bg-brand-300 dark:bg-brand-500 text-zinc-900 rounded-lg transition-colors hover:bg-brand-400 dark:hover:bg-brand-600/50"
                                                                    >
                                                                        <FilePlus2 className="h-3.5 w-3.5" />
                                                                        Create Record
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
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
                                            <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Confidence</th>
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
                                                            <div className="text-[10px] text-muted-foreground">{doc.id} · {doc.pages} pages · {doc.fields} fields</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-foreground">{doc.vendor}</td>
                                                <td className="px-4 py-3"><span className="text-xs font-medium px-2 py-1 rounded-md bg-muted text-muted-foreground">{doc.type}</span></td>
                                                <td className="px-4 py-3">
                                                    <span title={
                                                        doc.status === 'processed' ? 'Reconciled · ready to create record' :
                                                        doc.status === 'in_progress' ? `In-progress · ${doc.expertName ?? 'expert'} resolving inconsistencies` :
                                                        doc.status === 'inconsistencies' ? 'Awaiting Expert Hub resolution of inconsistencies' :
                                                        doc.status === 'capturing' ? 'Needs Attention · low-confidence fields' :
                                                        'Ingesting · scanning and extracting'
                                                    } className={`text-xs font-semibold px-2 py-1 rounded-md ${
                                                        doc.status === 'processed' ? 'bg-success-light text-success' :
                                                        doc.status === 'in_progress' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400' :
                                                        doc.status === 'inconsistencies' ? 'bg-error-light text-error' :
                                                        doc.status === 'capturing' ? 'bg-ai-light text-ai' :
                                                        'bg-info-light text-info'
                                                    }`}>
                                                        {doc.status === 'identified' ? 'Ingesting' : doc.status === 'capturing' ? 'Needs Attention' : doc.status === 'inconsistencies' ? 'Awaiting Expert' : doc.status === 'in_progress' ? 'In-progress' : 'Reconciled'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {doc.confidence ? (
                                                        <span title="Confidence Score" className={`text-sm font-medium flex items-center gap-1 ${doc.confidence > 90 ? 'text-success' : doc.confidence >= 75 ? 'text-warning' : 'text-error'}`}>
                                                            <Sparkles className="h-3 w-3" />{doc.confidence}%
                                                        </span>
                                                    ) : <span className="text-xs text-muted-foreground">—</span>}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">{doc.date}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                                            onClick={() => setPreviewDoc(doc)}
                                                                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                                                            title="Review Document"
                                                                            aria-label="Review document"
                                                                        >
                                                                            <Eye className="h-4 w-4" />
                                                                        </button>
                                                    </div>
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
                document={previewDoc ? { id: previewDoc.id, name: previewDoc.name, vendor: previewDoc.vendor, type: previewDoc.type, fields: previewDoc.fields, confidence: previewDoc.confidence, status: previewDoc.status, inconsistencyCount: previewDoc.inconsistencyCount } : null}
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
