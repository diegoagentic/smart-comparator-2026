import { Fragment } from 'react'
import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react'
import { CheckCircle2, Sparkles, X } from 'lucide-react'
import { getCatalogStatus, getSuggestionsFor, type ReplacementSuggestion } from './catalogMock'

interface CatalogVerifyPillProps {
    sku: string
    onUseReplacement: (originalSku: string, newSku: string) => void
}

function similarityClasses(pct: number): string {
    if (pct >= 90) return 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300'
    if (pct >= 75) return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300'
    return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-700/40 dark:text-zinc-300'
}

export default function CatalogVerifyPill({ sku, onUseReplacement }: CatalogVerifyPillProps) {
    const status = getCatalogStatus(sku)

    if (status.verified) {
        return (
            <span
                title="Verified in catalog database"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-md bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300"
            >
                <CheckCircle2 className="h-3 w-3" />
                In catalog
            </span>
        )
    }

    const suggestions = getSuggestionsFor(sku)

    return (
        <Popover className="relative inline-block">
            {({ close }) => (
                <>
                    <PopoverButton
                        title="This item is not in the catalog — Strata AI found possible replacements"
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-md bg-brand-300 dark:bg-brand-500 text-zinc-900 hover:brightness-95 transition-all shadow-sm"
                    >
                        <Sparkles className="h-3.5 w-3.5 text-zinc-700" />
                        Sync
                    </PopoverButton>

                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-150"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <PopoverPanel
                            anchor="bottom start"
                            className="z-[210] w-[420px] !mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-4 pb-3 border-b border-border">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <div className="flex items-center gap-1.5">
                                        <Sparkles className="h-3.5 w-3.5 text-foreground" />
                                        <h4 className="text-sm font-bold text-foreground">Item not in catalog</h4>
                                    </div>
                                    <button
                                        onClick={() => close()}
                                        aria-label="Close suggestions"
                                        className="p-1 -m-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    <span className="font-mono font-semibold text-foreground">{sku}</span> is no longer in
                                    your catalog database.{' '}
                                    {suggestions.length > 0
                                        ? `Strata AI found ${suggestions.length} similar items you can use as replacements:`
                                        : 'No replacements found.'}
                                </p>
                            </div>

                            {suggestions.length > 0 && (
                                <ul className="p-2 max-h-[300px] overflow-y-auto">
                                    {suggestions.map((s: ReplacementSuggestion) => (
                                        <li
                                            key={s.sku}
                                            className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/60 transition-colors"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-xs font-mono font-bold text-foreground">{s.sku}</span>
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${similarityClasses(s.similarityPercent)}`}>
                                                        {s.similarityPercent}% match
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground leading-snug">{s.name}</p>
                                            </div>
                                            <button
                                                onClick={() => { onUseReplacement(sku, s.sku); close() }}
                                                className="shrink-0 px-3 py-1.5 text-xs font-bold bg-brand-300 dark:bg-brand-500 text-zinc-900 rounded-md hover:brightness-95 transition-all"
                                            >
                                                Use this
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <div className="px-4 py-2.5 border-t border-border flex items-center justify-end">
                                <button
                                    onClick={() => close()}
                                    className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </PopoverPanel>
                    </Transition>
                </>
            )}
        </Popover>
    )
}
