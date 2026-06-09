import { useState } from 'react'
import { Sparkles, Check, RefreshCw, X } from 'lucide-react'

type SyncState = 'pending' | 'syncing' | 'synced' | 'dismissed'

interface OrderbahnSyncBannerProps {
    /** How many catalog updates the AI claims to have detected. */
    changesCount: number
    /** Optional callback fired once sync completes (for downstream effects). */
    onSynced?: () => void
    /** Milliseconds the spinner shows. Default 1100. */
    syncDurationMs?: number
    /** Auto-dismiss delay after success. Set 0 to keep visible. Default 3000. */
    autoDismissMs?: number
}

export default function OrderbahnSyncBanner({
    changesCount,
    onSynced,
    syncDurationMs = 1100,
    autoDismissMs = 3000,
}: OrderbahnSyncBannerProps) {
    const [state, setState] = useState<SyncState>('pending')

    if (state === 'dismissed') return null

    const handleSync = () => {
        setState('syncing')
        setTimeout(() => {
            setState('synced')
            onSynced?.()
            if (autoDismissMs > 0) {
                setTimeout(() => setState('dismissed'), autoDismissMs)
            }
        }, syncDurationMs)
    }

    return (
        <div className="px-6 py-2.5 border-b border-amber-200/60 dark:border-amber-500/20 bg-amber-50/70 dark:bg-amber-500/10 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center gap-2.5 min-w-0">
                {state === 'syncing' ? (
                    <RefreshCw className="size-4 text-amber-600 dark:text-amber-400 animate-spin shrink-0" />
                ) : state === 'synced' ? (
                    <span className="flex items-center justify-center size-5 rounded-full bg-green-500 dark:bg-green-400 text-white shrink-0">
                        <Check className="size-3" strokeWidth={3} />
                    </span>
                ) : (
                    <Sparkles className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
                )}
                <div className="text-[12.5px] leading-tight min-w-0">
                    {state === 'pending' && (
                        <>
                            <span className="font-semibold text-amber-900 dark:text-amber-200">
                                Orderbahn detected {changesCount} catalog change{changesCount === 1 ? '' : 's'}
                            </span>{' '}
                            <span className="text-amber-700/90 dark:text-amber-300/80">
                                since this preview opened. Sync to apply latest values before creating.
                            </span>
                        </>
                    )}
                    {state === 'syncing' && (
                        <span className="text-amber-700 dark:text-amber-300">
                            Syncing with Orderbahn database…
                        </span>
                    )}
                    {state === 'synced' && (
                        <span className="font-medium text-green-700 dark:text-green-400">
                            Synced with Orderbahn · {changesCount} change{changesCount === 1 ? '' : 's'} applied · just now
                        </span>
                    )}
                </div>
            </div>

            {state === 'pending' && (
                <button
                    onClick={handleSync}
                    title="Pull the latest catalog and vendor data from Orderbahn"
                    aria-label="Sync with Orderbahn database"
                    className="inline-flex items-center gap-1.5 rounded-full bg-amber-600 dark:bg-amber-500 hover:bg-amber-700 dark:hover:bg-amber-600 text-white px-3 py-1.5 text-[12px] font-semibold transition-colors shrink-0"
                >
                    <RefreshCw className="size-3" />
                    Sync now
                </button>
            )}
            {state === 'synced' && (
                <button
                    onClick={() => setState('dismissed')}
                    className="text-muted-foreground hover:text-foreground p-1 rounded shrink-0"
                    aria-label="Dismiss"
                >
                    <X className="size-3.5" />
                </button>
            )}
        </div>
    )
}
