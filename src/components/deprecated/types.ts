export type DeprecationReason =
    | 'superseded'
    | 'cancelled'
    | 'duplicate'
    | 'vendor_correction'
    | 'merged'
    | 'failed_processing'
    | 'unsupported_type'
    | 'manually_archived'
    | 'obsolete'
    | 'other'

// Document types that are NOT processed in the current phase.
// When a doc has one of these types, the deprecation modal will
// recommend the 'unsupported_type' reason and pre-select it.
// Add types here when their support is dropped or postponed.
export const UNSUPPORTED_DOC_TYPES: ReadonlyArray<string> = ['Invoice']

export function isUnsupportedDocType(docType: string | undefined | null): boolean {
    if (!docType) return false
    return UNSUPPORTED_DOC_TYPES.includes(docType)
}

// Active funnel statuses (everything except 'deprecated')
export type ActiveStatus = 'identified' | 'capturing' | 'inconsistencies' | 'processed'

export interface DeprecatedDoc {
    id: string
    name: string
    vendor: string
    type: string
    pages?: number
    fields: number
    date?: string
    status: 'deprecated'
    confidence: number | null
    inconsistencyCount: number
    deprecationReason: DeprecationReason
    deprecationCustomReason?: string
    deprecatedAt: string // ISO date 'YYYY-MM-DD'
    deprecatedBy: string
    replacementId?: string
    originalStatus: ActiveStatus
}

export interface ReasonMeta {
    label: string
    description: string
    badge: string
    icon: string // lucide name (avoids importing icons in shared file)
}

export const DEPRECATION_REASON_META: Record<DeprecationReason, ReasonMeta> = {
    superseded: {
        label: 'Superseded',
        description: 'Replaced by a newer version',
        badge: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 ring-1 ring-inset ring-blue-600/20 dark:ring-blue-400/30',
        icon: 'Replace',
    },
    cancelled: {
        label: 'Cancelled',
        description: 'Order was cancelled',
        badge: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400 ring-1 ring-inset ring-red-600/20 dark:ring-red-400/30',
        icon: 'Ban',
    },
    duplicate: {
        label: 'Duplicate',
        description: 'Duplicate of another document',
        badge: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 ring-1 ring-inset ring-amber-600/20 dark:ring-amber-400/30',
        icon: 'Copy',
    },
    vendor_correction: {
        label: 'Vendor correction',
        description: 'Vendor sent a corrected version',
        badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400 ring-1 ring-inset ring-indigo-600/20 dark:ring-indigo-400/30',
        icon: 'FileSignature',
    },
    merged: {
        label: 'Merged',
        description: 'Merged with another document',
        badge: 'bg-purple-50 text-purple-700 dark:bg-ai/15 dark:text-purple-400 ring-1 ring-inset ring-purple-600/20 dark:ring-purple-400/30',
        icon: 'GitMerge',
    },
    failed_processing: {
        label: 'Failed processing',
        description: 'OCR could not extract reliable data',
        badge: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400 ring-1 ring-inset ring-red-600/20 dark:ring-red-400/30',
        icon: 'AlertOctagon',
    },
    unsupported_type: {
        label: 'Out of scope',
        description: 'Document type not processed in this phase (e.g. Bills)',
        badge: 'bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400 ring-1 ring-inset ring-orange-600/20 dark:ring-orange-400/30',
        icon: 'XOctagon',
    },
    manually_archived: {
        label: 'Manually archived',
        description: 'Archived by a user',
        badge: 'bg-zinc-100 text-muted-foreground dark:bg-zinc-700/40 dark:text-zinc-300 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700',
        icon: 'Archive',
    },
    obsolete: {
        label: 'Obsolete',
        description: 'Auto-archived per retention policy',
        badge: 'bg-zinc-100 text-muted-foreground dark:bg-zinc-700/40 dark:text-zinc-300 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700',
        icon: 'Clock',
    },
    other: {
        label: 'Other',
        description: 'Custom reason',
        badge: 'bg-zinc-100 text-muted-foreground dark:bg-zinc-700/40 dark:text-zinc-300 ring-1 ring-inset ring-zinc-300 dark:ring-zinc-700',
        icon: 'MessageSquare',
    },
}

// Reasons offered to user when deprecating from a given status.
// 'unsupported_type' is included everywhere (it's an always-valid policy reason);
// the modal will surface it FIRST when the doc.type is in UNSUPPORTED_DOC_TYPES.
// 'other' is always last and always available.
export const REASONS_BY_STATUS: Record<ActiveStatus, DeprecationReason[]> = {
    identified: ['duplicate', 'failed_processing', 'unsupported_type', 'manually_archived', 'other'],
    capturing: ['superseded', 'cancelled', 'duplicate', 'vendor_correction', 'merged', 'failed_processing', 'unsupported_type', 'manually_archived', 'other'],
    inconsistencies: ['superseded', 'cancelled', 'duplicate', 'vendor_correction', 'merged', 'unsupported_type', 'manually_archived', 'other'],
    processed: ['superseded', 'cancelled', 'duplicate', 'vendor_correction', 'merged', 'unsupported_type', 'manually_archived', 'other'],
}

// Original status display labels (for cards in the grid)
export const ORIGINAL_STATUS_LABEL: Record<ActiveStatus, string> = {
    identified: 'Was Ingesting',
    capturing: 'Was Needs Attention',
    inconsistencies: 'Was Awaiting Expert',
    processed: 'Was Reconciled',
}

// Date filter presets
export type DatePreset = 'all' | '7d' | '30d' | '90d'

export const DATE_PRESETS: Array<{ id: DatePreset; label: string; days: number | null }> = [
    { id: '7d', label: 'Last 7 days', days: 7 },
    { id: '30d', label: 'Last 30 days', days: 30 },
    { id: '90d', label: 'Last 90 days', days: 90 },
    { id: 'all', label: 'All time', days: null },
]
