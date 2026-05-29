import type { FieldResolution } from '../types'

export interface ToneStyles {
    pill: string
    dot: string
    label: string
    border: string
}

export const TONE: Record<FieldResolution, ToneStyles> = {
    resolved: {
        pill: 'bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-400',
        dot: 'bg-green-500 dark:bg-green-400',
        label: 'Ready',
        border: 'border-border',
    },
    ai_suggested: {
        pill: 'bg-brand-300 dark:bg-brand-500 text-zinc-900',
        dot: 'bg-brand-600 dark:bg-brand-700',
        label: 'AI match',
        border: 'border-brand-300/60 dark:border-brand-500/40',
    },
    ai_uncertain: {
        pill: 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400',
        dot: 'bg-amber-500 dark:bg-amber-400',
        label: 'Low confidence',
        border: 'border-amber-200 dark:border-amber-800/60',
    },
    partial: {
        pill: 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400',
        dot: 'bg-amber-500 dark:bg-amber-400',
        label: 'Partial match',
        border: 'border-amber-200 dark:border-amber-800/60',
    },
    unresolved: {
        pill: 'bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-400',
        dot: 'bg-red-500 dark:bg-red-400',
        label: 'Needs choice',
        border: 'border-red-200 dark:border-red-800/60',
    },
    unmapped: {
        pill: 'bg-muted text-muted-foreground',
        dot: 'bg-zinc-400 dark:bg-muted0',
        label: 'Not sent',
        border: 'border-border',
    },
    coercion_error: {
        pill: 'bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-400',
        dot: 'bg-red-500 dark:bg-red-400',
        label: 'Fix value',
        border: 'border-red-200 dark:border-red-800/60',
    },
}
