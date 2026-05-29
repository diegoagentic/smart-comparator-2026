import { useState } from 'react'
import {
    ChevronDown, ChevronUp, Check, Sparkles,
    FileText, DollarSign, Truck, ClipboardList, Zap, Info, Edit
} from 'lucide-react'

interface FieldReviewModalProps {
    isOpen?: boolean
    document: {
        id: string
        name: string
        vendor: string
        inconsistencyCount?: number
    } | null
    onResolve?: (docId: string) => void
    onClose: () => void
    initialFields?: ReviewField[]
}

interface ReviewField {
    id: string
    name: string
    category: 'header' | 'line_item' | 'pricing' | 'logistics'
    extractedValue: string
    expectedValue?: string
    aiSuggestion?: string
    confidence: number
    status: 'valid' | 'inconsistent' | 'missing'
    reason?: string
}

const CATEGORY_META: Record<string, { label: string; icon: typeof FileText; color: string }> = {
    header: { label: 'Header Fields', icon: FileText, color: 'text-blue-600 dark:text-blue-400' },
    line_item: { label: 'Line Items', icon: ClipboardList, color: 'text-indigo-600 dark:text-indigo-400' },
    pricing: { label: 'Pricing', icon: DollarSign, color: 'text-green-600 dark:text-green-400' },
    logistics: { label: 'Logistics', icon: Truck, color: 'text-amber-600 dark:text-amber-400' },
}

const MOCK_FIELDS: ReviewField[] = [
    // Header
    { id: 'f1', name: 'Vendor Name', category: 'header', extractedValue: 'AIS Furniture', confidence: 99, status: 'valid' },
    { id: 'f2', name: 'Document Number', category: 'header', extractedValue: 'ACK-7839', confidence: 97, status: 'valid' },
    { id: 'f3', name: 'Reference PO', category: 'header', extractedValue: '', expectedValue: 'ORD-2055', aiSuggestion: 'ORD-2055', confidence: 91, status: 'missing', reason: 'Field not found in extracted data. AI matched by vendor + date correlation.' },
    { id: 'f4', name: 'ACK Date', category: 'header', extractedValue: '2026-01-13', confidence: 98, status: 'valid' },
    // Line Items
    { id: 'f5', name: 'Line 1: Product SKU', category: 'line_item', extractedValue: '', expectedValue: 'T-RCR306029HLG2', aiSuggestion: 'T-RCR306029HLG2', confidence: 85, status: 'missing', reason: 'SKU field blank in scan. AI inferred from product description "TBL, REC, 30Dx60Wx29H".' },
    { id: 'f6', name: 'Line 1: Quantity', category: 'line_item', extractedValue: '4', confidence: 99, status: 'valid' },
    { id: 'f7', name: 'Line 1: Unit Price', category: 'line_item', extractedValue: '479.18', confidence: 96, status: 'valid' },
    { id: 'f8', name: 'Line 2: Product SKU', category: 'line_item', extractedValue: 'X-BBFPFS182812', confidence: 97, status: 'valid' },
    { id: 'f9', name: 'Line 2: Quantity', category: 'line_item', extractedValue: '6', expectedValue: '4', aiSuggestion: '4', confidence: 88, status: 'inconsistent', reason: 'OCR extracted "6" but PO specifies qty 4. Possible scan error on handwritten correction.' },
    { id: 'f10', name: 'Line 3: Finish Code', category: 'line_item', extractedValue: 'LG2', expectedValue: 'LG2-Loft Gray', aiSuggestion: 'LG2-Loft Gray', confidence: 95, status: 'inconsistent', reason: 'Abbreviated code extracted. AI mapped to full finish name from vendor catalog.' },
    // Pricing
    { id: 'f11', name: 'Subtotal', category: 'pricing', extractedValue: '$25,398.72', confidence: 94, status: 'valid' },
    { id: 'f12', name: 'Tax Amount', category: 'pricing', extractedValue: '', expectedValue: '$2,095.39', aiSuggestion: '$2,095.39', confidence: 82, status: 'missing', reason: 'Tax line not parsed. AI calculated from subtotal × 8.25% (TX rate).' },
    { id: 'f13', name: 'Discount %', category: 'pricing', extractedValue: '62%', confidence: 97, status: 'valid' },
    // Logistics
    { id: 'f14', name: 'Ship To Address', category: 'logistics', extractedValue: '1200 Commerce Dr, Suite 400, Dallas, TX 75201', confidence: 96, status: 'valid' },
    { id: 'f15', name: 'Expected Ship Date', category: 'logistics', extractedValue: '', expectedValue: '2026-02-15', aiSuggestion: '2026-02-15', confidence: 78, status: 'missing', reason: 'Ship date not found in document. AI estimated from vendor standard lead time (4 weeks).' },
    { id: 'f16', name: 'Freight Terms', category: 'logistics', extractedValue: 'Prepaid', expectedValue: 'Prepaid & Add', aiSuggestion: 'Prepaid & Add', confidence: 90, status: 'inconsistent', reason: 'Partial match — OCR missed "& Add" portion. Common truncation in scanned PDFs.' },
]

export default function FieldReviewModal({ document, onResolve, onClose, initialFields }: FieldReviewModalProps) {
    const [fields, setFields] = useState<ReviewField[]>(initialFields || MOCK_FIELDS)
    const [resolvedFields, setResolvedFields] = useState<Set<string>>(new Set())
    const [expandedField, setExpandedField] = useState<string | null>('f5') // Default open Line 1 Product SKU for demo
    const [activeCategory, setActiveCategory] = useState<string>('all')
    const [isEditing, setIsEditing] = useState<Record<string, boolean>>({})

    const issueFields = fields.filter(f => f.status !== 'valid')
    const totalIssues = issueFields.length
    const resolvedCount = resolvedFields.size
    const allResolved = resolvedCount >= totalIssues

    const displayFields = activeCategory === 'all'
        ? fields
        : fields.filter(f => f.category === activeCategory)

    const handleAccept = (fieldId: string) => {
        setResolvedFields(prev => new Set([...prev, fieldId]))
        setExpandedField(null)
    }

    const handleUpdateExtractedValue = (fieldId: string, newValue: string) => {
        setFields(prev => prev.map(f => f.id === fieldId ? { ...f, extractedValue: newValue } : f))
    }

    const handleAutoValidate = () => {
        const remaining = issueFields.filter(f => !resolvedFields.has(f.id))
        remaining.forEach((f, i) => {
            setTimeout(() => {
                setResolvedFields(prev => new Set([...prev, f.id]))
            }, i * 150)
        })
    }

    const handleResolveAll = () => {
        onResolve?.(document?.id || '')
        onClose()
    }

    return (
        <div className="flex flex-col h-full bg-card shrink-0 min-h-0 border-l border-border">
            {/* Title Area */}
            <div className="bg-[#EBECEE] dark:bg-zinc-900 px-6 py-4 border-b border-border shrink-0">
                <h4 className="text-[14px] font-bold text-[#7A8C9E] dark:text-slate-400 uppercase tracking-widest font-['Inter']">
                    FIELD REVIEW
                </h4>
                <p className="text-[12px] text-[#9BA9BA] dark:text-muted-foreground mt-1 font-['Inter']">
                    Validate field review
                </p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="px-6 pt-4 pb-2">
                    {/* Progress Bar with Right Text */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center relative">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden mr-4 relative">
                                <div
                                    className="h-full bg-zinc-200 dark:bg-zinc-700 rounded-full transition-all duration-700"
                                    style={{ width: '100%' }}
                                />
                                <div
                                    className="h-full bg-green-500 rounded-full transition-all duration-700 absolute top-0 left-0"
                                    style={{ width: `${totalIssues > 0 ? (resolvedCount / totalIssues) * 100 : 100}%` }}
                                />
                            </div>
                            <span className="text-[11px] font-bold text-muted-foreground whitespace-nowrap">
                                {resolvedCount}/{totalIssues} resolved
                            </span>
                        </div>
                    </div>

                    {/* Status Pills + Auto-resolve */}
                    <div className="mt-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-green-500" />
                                <span className="text-xs font-bold text-muted-foreground">{fields.filter(f => f.status === 'valid').length}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-amber-500" />
                                <span className="text-xs font-bold text-muted-foreground">{fields.filter(f => f.status === 'inconsistent').length}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-red-500" />
                                <span className="text-xs font-bold text-muted-foreground">{fields.filter(f => f.status === 'missing').length}</span>
                            </div>
                        </div>
                        <button
                            onClick={handleAutoValidate}
                            className="flex items-center gap-1.5 text-[11px] font-black text-foreground hover:opacity-70 transition-all uppercase tracking-wider"
                        >
                            <Zap className="h-3.5 w-3.5 fill-zinc-900 dark:fill-white" /> AUTO-RESOLVE
                        </button>
                    </div>

                    {/* Custom Tabs Style */}
                    <div className="mt-6 flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                        <button
                            onClick={() => setActiveCategory('all')}
                            className={`px-4 py-2 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap flex items-center gap-2 ${activeCategory === 'all' ? 'bg-[#FAFAFA] dark:bg-zinc-800 text-foreground shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700' : 'text-muted-foreground hover:text-muted-foreground dark:hover:text-zinc-300'}`}
                        >
                            All ({fields.length})
                        </button>
                        {Object.entries(CATEGORY_META).map(([key, meta]) => {
                            const count = fields.filter(f => f.category === key).length
                            const issues = fields.filter(f => f.category === key && f.status !== 'valid').length
                            return (
                                <button
                                    key={key}
                                    onClick={() => setActiveCategory(key)}
                                    className={`px-3 py-2 text-[11px] font-bold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${activeCategory === key ? 'bg-[#FAFAFA] dark:bg-zinc-800 text-foreground shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700' : 'text-muted-foreground hover:text-muted-foreground dark:hover:text-zinc-300'}`}
                                >
                                    <meta.icon className="h-3.5 w-3.5 opacity-40" />
                                    <span>{meta.label}</span>
                                    {issues > 0 && <span className="text-[10px] text-red-500 ml-1">{issues}</span>}
                                </button>
                            )
                        })}
                    </div>
                </div>



                {/* Field list */}
                <div className="px-6 py-4">
                    <div className="space-y-4 pb-4">
                    {displayFields.map(field => {
                        const isExpanded = expandedField === field.id
                        const isResolved = resolvedFields.has(field.id)
                        const isIssue = field.status !== 'valid'
                        
                        return (
                            <div
                                key={field.id}
                                className={`border rounded-xl transition-all ${
                                    isExpanded 
                                        ? 'border-red-200 dark:border-red-900/50 bg-card shadow-sm' 
                                        : isResolved 
                                            ? 'border-green-100 dark:border-green-900/30 bg-green-50/10 dark:bg-green-500/5' 
                                            : 'border-zinc-100 dark:border-zinc-800'
                                }`}
                            >
                                {/* Field row */}
                                <button
                                    onClick={() => isIssue && !isResolved ? setExpandedField(isExpanded ? null : field.id) : null}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-left ${isIssue && !isResolved ? 'cursor-pointer' : 'cursor-default'}`}
                                >
                                    <div className="relative">
                                        <span className={`h-2 w-2 rounded-full block ${isResolved ? 'bg-green-500' : statusDot(field.status)}`} />
                                        {isExpanded && <div className="absolute inset-0 h-2 w-2 rounded-full bg-red-500 animate-ping opacity-40" />}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[13px] font-bold text-foreground truncate">{field.name}</span>
                                            {field.status === 'missing' && !isResolved && (
                                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#FF4D4D] text-white uppercase tracking-tighter">MISSING</span>
                                            )}
                                            {field.status === 'inconsistent' && !isResolved && (
                                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500 text-white uppercase tracking-tighter">MISMATCH</span>
                                            )}
                                            {isResolved && (
                                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-green-500 text-white uppercase tracking-tighter">RESOLVED</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={`text-[11px] font-medium font-mono ${field.extractedValue ? 'text-muted-foreground' : 'text-red-400 italic'}`}>
                                                {field.extractedValue || 'empty'}
                                            </span>
                                        </div>
                                    </div>
                                    {isIssue && !isResolved && (
                                        <div className="text-muted-foreground">
                                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </div>
                                    )}
                                </button>

                                {/* Expanded detail */}
                                {isExpanded && !isResolved && (
                                    <div className="px-4 pb-4 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                        
                                        {/* Extracted Value box */}
                                        <div className="space-y-2">
                                            <p className="text-[14px] font-semibold text-foreground">Extracted Value</p>
                                            <div className={`rounded-xl border transition-colors ${isEditing[field.id] ? 'bg-card border-blue-400 ring-4 ring-blue-500/10' : 'bg-[#EAECEE] dark:bg-zinc-800/50 border-[#D1D5DB] dark:border-zinc-700'}`}>
                                                <input 
                                                    type="text"
                                                    value={field.extractedValue}
                                                    onChange={(e) => handleUpdateExtractedValue(field.id, e.target.value)}
                                                    placeholder="Not found"
                                                    disabled={!isEditing[field.id]}
                                                    className={`w-full bg-transparent border-none px-4 py-2.5 text-[14px] focus:ring-0 placeholder:italic ${field.extractedValue ? 'text-foreground font-mono' : 'text-muted-foreground italic'} disabled:opacity-100`}
                                                />
                                            </div>
                                        </div>

                                        {/* AI Info Box */}
                                        {field.reason && (
                                            <div className="flex items-start gap-2 p-3.5 bg-[#F4F9FF] dark:bg-blue-500/5 border border-[#BDE0FF] dark:border-blue-500/20 rounded-xl">
                                                <div className="shrink-0 mt-0.5">
                                                    <Info className="h-5 w-5 text-[#2E71D3]" />
                                                </div>
                                                <p className="text-[13px] text-[#2E71D3] dark:text-blue-300 leading-relaxed">
                                                    {field.reason}
                                                </p>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center gap-3 pt-1">
                                            <button
                                                onClick={() => {
                                                    handleAccept(field.id)
                                                    if (isEditing[field.id]) {
                                                        setIsEditing(prev => ({ ...prev, [field.id]: false }))
                                                    }
                                                }}
                                                className="px-4 py-2 text-[14px] font-medium bg-[#16A34A] text-white rounded-lg hover:bg-[#15803D] transition-colors shadow-sm"
                                            >
                                                {isEditing[field.id] ? 'Save' : 'Accept Extracted Value'}
                                            </button>
                                            {!isEditing[field.id] ? (
                                                <button
                                                    onClick={() => setIsEditing(prev => ({ ...prev, [field.id]: true }))}
                                                    className="flex items-center gap-2 px-4 py-2 text-[14px] font-medium border border-border text-muted-foreground bg-card rounded-lg hover:bg-muted dark:hover:bg-zinc-800 transition-colors shadow-sm"
                                                >
                                                    <Edit className="h-4 w-4" /> Edit
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setIsEditing(prev => ({ ...prev, [field.id]: false }))}
                                                    className="flex items-center gap-2 px-4 py-2 text-[14px] font-medium border border-border text-muted-foreground bg-card rounded-lg hover:bg-muted dark:hover:bg-zinc-800 transition-colors shadow-sm"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 border-t border-border bg-card shrink-0">
                <div className="text-[11px] text-muted-foreground font-bold text-center mb-4 uppercase tracking-widest">
                    {fields.length} fields · {totalIssues} need review
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 text-xs font-black border border-border text-foreground rounded-xl hover:bg-muted dark:hover:bg-zinc-800 transition-all uppercase tracking-widest"
                    >
                        SAVE
                    </button>
                    <button
                        onClick={handleResolveAll}
                        disabled={!allResolved}
                        className={`flex-1 py-3 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${
                            allResolved
                                ? 'bg-[#D1D4D8] text-zinc-900 hover:opacity-80 shadow-sm'
                                : 'bg-[#E5E7EB] dark:bg-zinc-800 text-zinc-300 dark:text-muted-foreground cursor-not-allowed opacity-50'
                        }`}
                    >
                        VALIDATE
                    </button>
                </div>
            </div>
        </div>
    )
}

function statusDot(s: ReviewField['status']) {
    if (s === 'valid') return 'bg-green-500'
    if (s === 'inconsistent') return 'bg-amber-500'
    return 'bg-red-500'
}
