// Mock catalog database + replacement suggestions used by CatalogVerifyPill.
// Simulates Strata AI looking up each line item SKU against the dealer's
// catalog. One SKU (MFB5P245-D) is intentionally left as "unverified" so
// the demo can show the lime Sync CTA + popover with suggested replacements.

export interface CatalogStatus {
    verified: boolean
}

export interface ReplacementSuggestion {
    sku: string
    name: string
    similarityPercent: number
}

export const CATALOG_DB: Record<string, CatalogStatus> = {
    'HMBS244-D':       { verified: true },
    'MCTNP488-42-D':   { verified: true },
    'MFB5P245-D':      { verified: false },
    'MST1012-D':       { verified: true },
    'PTRX4230-D':      { verified: true },
}

export const SUGGESTIONS_BY_SKU: Record<string, ReplacementSuggestion[]> = {
    'MFB5P245-D': [
        { sku: 'MFB5P246-D', name: 'Mobile Folding Booth Seating with Table - Package - 60"W x 80"L x 42"H', similarityPercent: 98 },
        { sku: 'MFB4P180-D', name: 'Mobile Folding Booth Seating - Compact - 48"W x 60"L x 40"H',          similarityPercent: 82 },
        { sku: 'MBS2040-D',  name: 'Mobile Booth Seating - Standard Bench - 20"W x 40"L',                   similarityPercent: 65 },
    ],
}

/**
 * Lookup verification status for a SKU. Unknown SKUs default to verified=true
 * so that hand-edited or freshly typed SKUs don't trigger a false "needs sync"
 * state without a known suggestion list.
 */
export function getCatalogStatus(sku: string): CatalogStatus {
    return CATALOG_DB[sku] ?? { verified: true }
}

export function getSuggestionsFor(sku: string): ReplacementSuggestion[] {
    return SUGGESTIONS_BY_SKU[sku] ?? []
}
