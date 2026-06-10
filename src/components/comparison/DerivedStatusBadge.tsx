import { CheckCircle2, CheckCircle, AlertTriangle, AlertOctagon, XOctagon } from 'lucide-react'
import type { DerivedStatus } from './comparisonTypes'

interface DerivedStatusBadgeProps {
    status: DerivedStatus
    size?: 'sm' | 'md'
}

interface BadgeStyle {
    label: string
    icon: typeof CheckCircle2
    classes: string
    iconColor: string
}

function styleFor(status: DerivedStatus): BadgeStyle {
    switch (status) {
        case 'EXACT_MATCH':
            return {
                label: 'Exact Match',
                icon: CheckCircle2,
                classes: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-200',
                iconColor: 'text-green-600 dark:text-green-300',
            }
        case 'VERIFIED_WITH_MINOR_CHANGES':
            return {
                label: 'Verified · Minor Changes',
                icon: CheckCircle,
                classes: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300',
                iconColor: 'text-green-600 dark:text-green-400',
            }
        case 'REQUIRES_REVIEW':
            return {
                label: 'Requires Review',
                icon: AlertTriangle,
                classes: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300',
                iconColor: 'text-yellow-600 dark:text-yellow-300',
            }
        case 'CRITICAL_ISSUES':
            return {
                label: 'Critical Issues',
                icon: AlertOctagon,
                classes: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
                iconColor: 'text-red-600 dark:text-red-300',
            }
        case 'PROCESSING_FAILED':
            return {
                label: 'Processing Failed',
                icon: XOctagon,
                classes: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-700/40 dark:text-zinc-300',
                iconColor: 'text-zinc-600 dark:text-zinc-400',
            }
    }
}

export default function DerivedStatusBadge({ status, size = 'md' }: DerivedStatusBadgeProps) {
    const s = styleFor(status)
    const Icon = s.icon
    const sizing = size === 'sm'
        ? 'text-[10px] px-1.5 py-0.5 gap-1 [&_svg]:h-3 [&_svg]:w-3'
        : 'text-xs px-2.5 py-1 gap-1.5 [&_svg]:h-3.5 [&_svg]:w-3.5'
    return (
        <span className={`inline-flex items-center font-semibold rounded-md uppercase tracking-wide ${sizing} ${s.classes}`}>
            <Icon className={s.iconColor} />
            {s.label}
        </span>
    )
}
