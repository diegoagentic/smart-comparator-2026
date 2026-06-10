import { Fragment } from 'react'
import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react'
import { CheckCircle2, Sparkles, X, Package, ArrowRight, Database, AlertCircle } from 'lucide-react'
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
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-md bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300 whitespace-nowrap"
            >
                <CheckCircle2 className="h-3 w-3 shrink-0" />
                Verified
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
                            className="z-[210] w-[460px] !mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-4 pb-3 border-b border-border">
                                <div className="flex items-start gap-3">
                                    <div className="h-9 w-9 rounded-lg bg-amber-50 dark:bg-amber-500/15 flex items-center justify-center shrink-0">
                                        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <h4 className="text-sm font-bold text-foreground">Item not in catalog</h4>
                                            <Database className="h-3 w-3 text-muted-foreground" />
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            <span className="font-mono font-semibold text-foreground">{sku}</span> is no longer in your catalog database.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => close()}
                                        aria-label="Close suggestions"
                                        className="p-1 -m-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {/* AI banner */}
                            {suggestions.length > 0 && (
                                <div className="px-4 py-2 bg-brand-300/30 dark:bg-brand-500/15 border-b border-border flex items-center gap-2">
                                    <Sparkles className="h-3.5 w-3.5 text-zinc-700 dark:text-zinc-300 shrink-0" />
                                    <p className="text-[11px] font-semibold text-foreground">
                                        Strata AI found {suggestions.length} similar items you can use as replacements
                                    </p>
                                </div>
                            )}

                            {/* Suggestions */}
                            {suggestions.length > 0 ? (
                                <ul className="p-2 max-h-[320px] overflow-y-auto">
                                    {suggestions.map((s: ReplacementSuggestion) => (
                                        <li
                                            key={s.sku}
                                            className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/60 transition-colors"
                                        >
                                            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                                <Package className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                                    <span className="text-xs font-mono font-bold text-foreground">{s.sku}</span>
                                                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${similarityClasses(s.similarityPercent)}`}>
                                                        <Sparkles className="h-2.5 w-2.5" />
                                                        {s.similarityPercent}% match
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground leading-snug">{s.name}</p>
                                            </div>
                                            <button
                                                onClick={() => { onUseReplacement(sku, s.sku); close() }}
                                                className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-brand-300 dark:bg-brand-500 text-zinc-900 rounded-md hover:brightness-95 transition-all"
                                            >
                                                Use this
                                                <ArrowRight className="h-3 w-3" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="px-4 py-6 text-center">
                                    <p className="text-xs text-muted-foreground">No replacement suggestions available.</p>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="px-4 py-2.5 border-t border-border flex items-center justify-end">
                                <button
                                    onClick={() => close()}
                                    className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="h-3 w-3" />
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
