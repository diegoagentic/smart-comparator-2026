import type { PreflightField, FieldState } from '../types'
import ResolutionPill from './ResolutionPill'
import FieldBody from './FieldBody'

interface FieldRowProps {
    field: PreflightField
    state?: FieldState
    setState: (patch: FieldState) => void
    compact?: boolean
}

export default function FieldRow({ field, state, setState, compact }: FieldRowProps) {
    const effective = state?.effectiveResolution || field.resolution
    const isLocked = !!state?.locked

    return (
        <div className={`rounded-xl border bg-card transition-colors ${
            isLocked
                ? 'border-green-200 dark:border-green-700/60'
                : 'border-border'
        } hover:bg-muted/40`}>
            <div className={`${compact ? 'px-3 pt-2.5 pb-1.5' : 'px-4 pt-3.5 pb-2'} flex items-start justify-between gap-4`}>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13.5px] font-medium text-foreground truncate">
                            {field.displayName}
                        </span>
                        {field.required && (
                            <span title="This field must be valid before the record can be created" className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-500/15 border border-red-200 dark:border-red-500/20 px-2 py-0.5 text-[10px] font-medium text-red-600 dark:text-red-400">Required</span>
                        )}
                    </div>
                </div>
                <ResolutionPill resolution={effective} />
            </div>

            <div className={compact ? 'px-3 pb-2.5' : 'px-4 pb-3'}>
                <FieldBody field={field} state={state} setState={setState} effective={effective} />
            </div>
        </div>
    )
}
