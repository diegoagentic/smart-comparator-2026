import { useMemo, useState } from 'react'
import { Archive } from 'lucide-react'
import type { DeprecatedDoc, DeprecationReason } from './types'
import DeprecatedCard from './DeprecatedCard'

interface DeprecatedGridProps {
    docs: DeprecatedDoc[]
    onPreview: (doc: DeprecatedDoc) => void
    onRestore?: (doc: DeprecatedDoc) => void
    onDownloadOriginal?: (doc: DeprecatedDoc) => void
}

type ReasonCategory = 'all' | 'manually_archived' | 'duplicated' | 'other' | 'failed'
type TimePreset = '7d' | '30d' | '90d' | 'all'

// Map raw reason → display category used by the sub-tabs.
function reasonToCategory(reason: DeprecationReason): ReasonCategory {
    if (reason === 'manually_archived') return 'manually_archived'
    if (reason === 'duplicate') return 'duplicated'
    if (reason === 'failed_processing') return 'failed'
    return 'other'
}

const REASON_TABS: { id: ReasonCategory; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'manually_archived', label: 'Manually Archived' },
    { id: 'duplicated', label: 'Duplicated' },
    { id: 'other', label: 'Other' },
    { id: 'failed', label: 'Failed' },
]

const TIME_TABS: { id: TimePreset; label: string; days: number | null }[] = [
    { id: '7d', label: 'Last 7 days', days: 7 },
    { id: '30d', label: 'Last 30 days', days: 30 },
    { id: '90d', label: 'Last 90 days', days: 90 },
    { id: 'all', label: 'All Time', days: null },
]

export default function DeprecatedGrid({ docs, onPreview, onRestore, onDownloadOriginal }: DeprecatedGridProps) {
    const [reasonTab, setReasonTab] = useState<ReasonCategory>('all')
    const [timeTab, setTimeTab] = useState<TimePreset>('all')

    const filtered = useMemo(() => {
        const time = TIME_TABS.find(t => t.id === timeTab)
        const cutoff = time?.days ? new Date(Date.now() - time.days * 24 * 60 * 60 * 1000) : null
        return docs.filter(d => {
            if (reasonTab !== 'all' && reasonToCategory(d.deprecationReason) !== reasonTab) return false
            if (cutoff) {
                const dt = new Date(d.deprecatedAt)
                if (!isNaN(dt.getTime()) && dt < cutoff) return false
            }
            return true
        })
    }, [docs, reasonTab, timeTab])

    return (
        <div className="space-y-4">
            {/* Tabs row — reason + time, separated by a soft divider */}
            <div className="flex items-center gap-1 flex-wrap">
                {REASON_TABS.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setReasonTab(t.id)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                            reasonTab === t.id
                                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
                <span aria-hidden="true" className="w-px h-5 bg-border mx-2" />
                {TIME_TABS.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTimeTab(t.id)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                            timeTab === t.id
                                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center">
                    <Archive className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground mb-1">No archived documents</p>
                    <p className="text-xs text-muted-foreground">
                        {docs.length === 0
                            ? 'No documents have been deprecated yet.'
                            : 'No archived documents match the active filters.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map(d => (
                        <DeprecatedCard
                            key={d.id}
                            doc={d}
                            onPreview={onPreview}
                            onRestore={onRestore}
                            onDownloadOriginal={onDownloadOriginal}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
