import { Fragment } from 'react'
import { ChevronRight } from 'lucide-react'
import type { PaneView } from '../left-rail/PreflightLeftRail'

interface SectionNavStepperProps {
    view: PaneView
    setView: (v: PaneView) => void
    /** Number of unresolved issues per step. 0 = no badge. */
    issuesByStep?: Partial<Record<PaneView, number>>
}

const STEPS: Array<{ id: PaneView; label: string; hint: string }> = [
    { id: 'header', label: 'Header', hint: 'Header fields — vendor, dates, amounts, etc.' },
    { id: 'lineItems', label: 'Line items', hint: 'Per-product rows in the document' },
    { id: 'extras', label: 'Extras', hint: 'Catalog fields outside the standard schema' },
]

export default function SectionNavStepper({ view, setView, issuesByStep }: SectionNavStepperProps) {
    const currentIdx = STEPS.findIndex(s => s.id === view)

    return (
        <div className="flex items-center gap-1">
            {STEPS.map((s, i) => {
                const isActive = s.id === view
                const isPast = i < currentIdx
                const issues = issuesByStep?.[s.id] ?? 0

                return (
                    <Fragment key={s.id}>
                        <button
                            onClick={() => setView(s.id)}
                            title={s.hint + (issues > 0 ? ` · ${issues} field${issues === 1 ? '' : 's'} need${issues === 1 ? 's' : ''} review` : '')}
                            className={`relative inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition ${
                                isActive
                                    ? 'bg-brand-300 dark:bg-brand-500 text-zinc-900 shadow-[0_4px_14px_-4px_rgba(198,228,51,0.55)]'
                                    : isPast
                                        ? 'text-foreground/80 hover:bg-muted font-medium'
                                        : 'text-muted-foreground hover:bg-muted font-medium'
                            }`}
                        >
                            <span className={`size-4 inline-flex items-center justify-center rounded-full text-[10px] font-bold ${
                                isActive
                                    ? 'bg-zinc-900 text-brand-300 dark:text-brand-500'
                                    : 'bg-muted text-muted-foreground'
                            }`}>
                                {i + 1}
                            </span>
                            {s.label}
                            {issues > 0 && (
                                <span
                                    title={`${issues} unresolved issue${issues === 1 ? '' : 's'} in ${s.label}`}
                                    className={`inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[9.5px] font-bold ${
                                        isActive
                                            ? 'bg-zinc-900 text-red-400'
                                            : 'bg-red-50 dark:bg-red-500/15 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400'
                                    }`}
                                >
                                    {issues}
                                </span>
                            )}
                        </button>
                        {i < STEPS.length - 1 && (
                            <ChevronRight className="size-3 text-muted-foreground/40" />
                        )}
                    </Fragment>
                )
            })}
        </div>
    )
}
