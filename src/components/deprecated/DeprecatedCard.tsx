import { Eye, Sparkles, ArrowRight } from 'lucide-react'
import { DocumentTextIcon } from '@heroicons/react/24/outline'
import type { DeprecatedDoc } from './types'
import { DEPRECATION_REASON_META, ORIGINAL_STATUS_LABEL } from './types'
import { formatRelativeDate } from './mockData'

interface DeprecatedCardProps {
    doc: DeprecatedDoc
    onPreview: (doc: DeprecatedDoc) => void
}

export default function DeprecatedCard({ doc, onPreview }: DeprecatedCardProps) {
    const reason = DEPRECATION_REASON_META[doc.deprecationReason]
    const reasonLabel = doc.deprecationReason === 'other' && doc.deprecationCustomReason
        ? doc.deprecationCustomReason
        : reason.label

    return (
        <div
            className="relative bg-card/70 dark:bg-zinc-800/40 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md transition-all overflow-hidden flex flex-col"
        >
            <div className="p-4 flex-1 flex flex-col">
                {/* Header — muted avatar + vendor */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <div
                            title={`Archived document — ${reasonLabel}`}
                            className="h-8 w-8 rounded-full flex items-center justify-center bg-zinc-200 dark:bg-zinc-700 text-muted-foreground shrink-0"
                        >
                            <DocumentTextIcon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-foreground/80 truncate">{doc.vendor}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{doc.id}</p>
                        </div>
                    </div>
                </div>

                {/* Reason badge — top-prominent */}
                <div
                    title={reason.description}
                    className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold mb-3 ${reason.badge}`}
                >
                    {reasonLabel}
                </div>

                {/* Document meta */}
                <div className="space-y-1.5 mb-3">
                    <div className="flex justify-between text-[12px]">
                        <span className="text-muted-foreground">Document</span>
                        <span title={doc.name} className="font-medium text-foreground/80 truncate ml-2 max-w-[150px]">{doc.name}</span>
                    </div>
                    <div className="flex justify-between text-[12px]">
                        <span className="text-muted-foreground">Type</span>
                        <span className="font-medium text-foreground/80">{doc.type}</span>
                    </div>
                    <div className="flex justify-between text-[12px]">
                        <span className="text-muted-foreground">Fields</span>
                        <span title="Fields extracted by OCR" className="font-medium text-foreground/80">{doc.fields}</span>
                    </div>
                </div>

                {/* Replacement link if applicable */}
                {doc.replacementId && (
                    <div
                        title="The document that replaced this one"
                        className="flex items-center gap-1 text-[11px] text-blue-700 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-500/10 px-2 py-1 rounded-md mb-3 w-fit"
                    >
                        <ArrowRight className="h-3 w-3" />
                        <span className="font-mono font-medium">{doc.replacementId}</span>
                    </div>
                )}

                {/* Spacer to push footer down */}
                <div className="flex-1" />

                {/* Footer: original status + deprecated time + preview action */}
                <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between gap-2">
                    <div className="flex flex-col min-w-0">
                        <span title={`Original pipeline stage before being archived`} className="text-[10px] font-medium text-muted-foreground truncate">
                            {ORIGINAL_STATUS_LABEL[doc.originalStatus]}
                        </span>
                        <span title={`Archived on ${doc.deprecatedAt}`} className="text-[10px] text-muted-foreground/70">
                            Archived {formatRelativeDate(doc.deprecatedAt)}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        {doc.confidence != null && (
                            <span
                                title="OCR confidence at archive time"
                                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                                    doc.confidence > 90 ? 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300' :
                                    doc.confidence >= 75 ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' :
                                    'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300'
                                }`}
                            >
                                <Sparkles className="h-2.5 w-2.5" />{doc.confidence}%
                            </span>
                        )}
                        <button
                            onClick={() => onPreview(doc)}
                            title="Preview the archived document (read-only)"
                            aria-label="Preview document"
                            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                            <Eye className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
