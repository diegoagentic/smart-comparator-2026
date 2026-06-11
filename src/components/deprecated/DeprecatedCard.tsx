import { FileText, Info, RotateCcw, Download, AlertTriangle, AlertOctagon, Copy, Archive } from 'lucide-react'
import type { DeprecatedDoc, DeprecationReason } from './types'
import { formatRelativeDate } from './mockData'
import DocTypeChip from '../ocr/DocTypeChip'
import type { OcrDocType } from '../ocr/OcrDocCard'

interface DeprecatedCardProps {
    doc: DeprecatedDoc
    onPreview: (doc: DeprecatedDoc) => void
    onRestore?: (doc: DeprecatedDoc) => void
    onDownloadOriginal?: (doc: DeprecatedDoc) => void
}

// Map raw deprecation reasons to the display category and visual style.
// Quarantined = unsupported_type, Failed = failed_processing,
// Duplicated = duplicate, Manually Archived = manually_archived,
// Other = everything else.
type DisplayCategory = 'Quarantined' | 'Failed' | 'Duplicated' | 'Manually Archived' | 'Other'

interface CategoryStyle {
    label: DisplayCategory
    icon: typeof FileText
    classes: string
    iconColor: string
}

function categorize(reason: DeprecationReason): CategoryStyle {
    switch (reason) {
        case 'unsupported_type':
            return {
                label: 'Quarantined',
                icon: AlertTriangle,
                classes: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
                iconColor: 'text-amber-600 dark:text-amber-300',
            }
        case 'failed_processing':
            return {
                label: 'Failed',
                icon: AlertTriangle,
                classes: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
                iconColor: 'text-red-600 dark:text-red-300',
            }
        case 'duplicate':
            return {
                label: 'Duplicated',
                icon: Copy,
                classes: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
                iconColor: 'text-blue-600 dark:text-blue-300',
            }
        case 'manually_archived':
            return {
                label: 'Manually Archived',
                icon: Archive,
                classes: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-700/40 dark:text-zinc-300',
                iconColor: 'text-zinc-600 dark:text-zinc-300',
            }
        default:
            return {
                label: 'Other',
                icon: Info,
                classes: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-700/40 dark:text-zinc-300',
                iconColor: 'text-zinc-500 dark:text-zinc-400',
            }
    }
}

export default function DeprecatedCard({ doc, onPreview, onRestore, onDownloadOriginal }: DeprecatedCardProps) {
    const cat = categorize(doc.deprecationReason)
    const CatIcon = cat.icon
    const reasonHover =
        doc.deprecationReason === 'other' && doc.deprecationCustomReason
            ? doc.deprecationCustomReason
            : `${cat.label} · ${doc.deprecationReason.replace(/_/g, ' ')}`

    return (
        <div className="group bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-foreground truncate">{doc.vendor || 'Unknown Vendor'}</p>
                            <p className="text-[11px] text-muted-foreground font-mono truncate">{doc.id}</p>
                        </div>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onRestore?.(doc) }}
                        title="Restore document"
                        aria-label="Restore document"
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </button>
                </div>

                {/* Reason badge + info */}
                <div className="flex items-center gap-2 mb-4">
                    <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md ${cat.classes}`}
                    >
                        <CatIcon className={`h-3 w-3 ${cat.iconColor}`} />
                        {cat.label}
                    </span>
                    <button
                        title={reasonHover}
                        aria-label="Why was this archived?"
                        className="p-0.5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Info className="h-3.5 w-3.5" />
                    </button>
                </div>

                {/* Document meta */}
                <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Document Type</span>
                        <DocTypeChip type={doc.type as OcrDocType} size="sm" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Filename</span>
                        <span title={doc.name} className="font-semibold text-foreground truncate ml-2 max-w-[180px]">{doc.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Line Items</span>
                        <span className="font-semibold text-muted-foreground">—</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-border pt-3 flex items-center justify-between">
                    <button
                        onClick={() => onPreview(doc)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors text-left"
                        title="Preview document"
                    >
                        Deprecated {formatRelativeDate(doc.deprecatedAt)}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDownloadOriginal?.(doc) }}
                        title="Download original PDF"
                        aria-label="Download original PDF"
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <Download className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
