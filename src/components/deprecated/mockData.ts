import type { DeprecatedDoc } from './types'

// Today is assumed to be 2026-04-23 for relative-time labels.
// Dates chosen to demonstrate all 4 date-filter buckets (7d / 30d / 90d / all).
export const DEPRECATED_DOCS: DeprecatedDoc[] = [
    {
        id: 'OCR-901', name: 'ACK-7842_Steelcase_v1.pdf', vendor: 'Steelcase', type: 'Acknowledgment',
        pages: 2, fields: 35, status: 'deprecated', confidence: 96, inconsistencyCount: 0,
        deprecationReason: 'superseded',
        deprecatedAt: '2026-04-20', deprecatedBy: 'system',
        replacementId: 'ACK-7843', originalStatus: 'processed',
    },
    {
        id: 'OCR-902', name: 'PO-1018_Knoll.pdf', vendor: 'Knoll', type: 'Purchase Order',
        pages: 4, fields: 42, status: 'deprecated', confidence: 87, inconsistencyCount: 4,
        deprecationReason: 'cancelled',
        deprecatedAt: '2026-04-16', deprecatedBy: 'demo.user@example.com',
        originalStatus: 'inconsistencies',
    },
    {
        id: 'OCR-903', name: 'ACK-7820_AIS.pdf', vendor: 'AIS Furniture', type: 'Acknowledgment',
        pages: 2, fields: 28, status: 'deprecated', confidence: 78, inconsistencyCount: 0,
        deprecationReason: 'duplicate',
        deprecatedAt: '2026-04-09', deprecatedBy: 'demo.user@example.com',
        originalStatus: 'capturing',
    },
    {
        id: 'OCR-904', name: 'INV-4520_HermanMiller.pdf', vendor: 'Herman Miller', type: 'Invoice',
        pages: 4, fields: 61, status: 'deprecated', confidence: 92, inconsistencyCount: 0,
        deprecationReason: 'vendor_correction',
        deprecatedAt: '2026-04-19', deprecatedBy: 'system',
        replacementId: 'INV-4622', originalStatus: 'processed',
    },
    {
        id: 'OCR-905', name: 'PO-0998_Haworth.pdf', vendor: 'Haworth', type: 'Purchase Order',
        pages: 1, fields: 0, status: 'deprecated', confidence: 31, inconsistencyCount: 0,
        deprecationReason: 'failed_processing',
        deprecatedAt: '2026-03-23', deprecatedBy: 'system',
        originalStatus: 'identified',
    },
    {
        id: 'OCR-906', name: 'ACK-7700_9to5.pdf', vendor: '9to5 Seating', type: 'Acknowledgment',
        pages: 1, fields: 12, status: 'deprecated', confidence: 99, inconsistencyCount: 0,
        deprecationReason: 'obsolete',
        deprecatedAt: '2025-10-23', deprecatedBy: 'system',
        originalStatus: 'processed',
    },
    // filler — extends to 23 entries to match prod Deprecated count (Diego, 2026-06-09).
    {
        id: 'OCR-907', name: 'QT-3320_HON.pdf', vendor: 'HON', type: 'Quote',
        pages: 2, fields: 18, status: 'deprecated', confidence: 81, inconsistencyCount: 2,
        deprecationReason: 'superseded',
        deprecatedAt: '2026-04-12', deprecatedBy: 'system',
        replacementId: 'QT-3321', originalStatus: 'inconsistencies',
    },
    {
        id: 'OCR-908', name: 'INV-2210_Allsteel.pdf', vendor: 'Allsteel', type: 'Invoice',
        pages: 3, fields: 41, status: 'deprecated', confidence: 88, inconsistencyCount: 0,
        deprecationReason: 'cancelled',
        deprecatedAt: '2026-04-05', deprecatedBy: 'demo.user@example.com',
        originalStatus: 'processed',
    },
    {
        id: 'OCR-909', name: 'PO-2287_Teknion.pdf', vendor: 'Teknion', type: 'Purchase Order',
        pages: 5, fields: 73, status: 'deprecated', confidence: 79, inconsistencyCount: 6,
        deprecationReason: 'duplicate',
        deprecatedAt: '2026-03-30', deprecatedBy: 'demo.user@example.com',
        originalStatus: 'capturing',
    },
    {
        id: 'OCR-910', name: 'ACK-7715_Kimball.pdf', vendor: 'Kimball', type: 'Acknowledgment',
        pages: 2, fields: 22, status: 'deprecated', confidence: 94, inconsistencyCount: 0,
        deprecationReason: 'vendor_correction',
        deprecatedAt: '2026-03-25', deprecatedBy: 'system',
        replacementId: 'ACK-7716', originalStatus: 'processed',
    },
    {
        id: 'OCR-911', name: 'QT-5990_OFS.pdf', vendor: 'OFS Brands', type: 'Quote',
        pages: 1, fields: 8, status: 'deprecated', confidence: 22, inconsistencyCount: 0,
        deprecationReason: 'failed_processing',
        deprecatedAt: '2026-03-18', deprecatedBy: 'system',
        originalStatus: 'identified',
    },
    {
        id: 'OCR-912', name: 'PO-1140_SitOnIt.pdf', vendor: 'SitOnIt Seating', type: 'Purchase Order',
        pages: 3, fields: 38, status: 'deprecated', confidence: 90, inconsistencyCount: 1,
        deprecationReason: 'superseded',
        deprecatedAt: '2026-03-12', deprecatedBy: 'system',
        replacementId: 'PO-1141', originalStatus: 'processed',
    },
    {
        id: 'OCR-913', name: 'INV-1003_Global.pdf', vendor: 'Global Furniture', type: 'Invoice',
        pages: 4, fields: 55, status: 'deprecated', confidence: 76, inconsistencyCount: 3,
        deprecationReason: 'cancelled',
        deprecatedAt: '2026-03-04', deprecatedBy: 'demo.user@example.com',
        originalStatus: 'inconsistencies',
    },
    {
        id: 'OCR-914', name: 'QT-7702_NationalOffice.pdf', vendor: 'National Office Furniture', type: 'Quote',
        pages: 2, fields: 19, status: 'deprecated', confidence: 84, inconsistencyCount: 0,
        deprecationReason: 'duplicate',
        deprecatedAt: '2026-02-28', deprecatedBy: 'demo.user@example.com',
        originalStatus: 'processed',
    },
    {
        id: 'OCR-915', name: 'PO-8821_Steelcase.pdf', vendor: 'Steelcase', type: 'Purchase Order',
        pages: 6, fields: 88, status: 'deprecated', confidence: 65, inconsistencyCount: 8,
        deprecationReason: 'vendor_correction',
        deprecatedAt: '2026-02-22', deprecatedBy: 'system',
        replacementId: 'PO-8822', originalStatus: 'inconsistencies',
    },
    {
        id: 'OCR-916', name: 'ACK-7641_Knoll.pdf', vendor: 'Knoll', type: 'Acknowledgment',
        pages: 2, fields: 30, status: 'deprecated', confidence: 97, inconsistencyCount: 0,
        deprecationReason: 'obsolete',
        deprecatedAt: '2026-02-10', deprecatedBy: 'system',
        originalStatus: 'processed',
    },
    {
        id: 'OCR-917', name: 'QT-4421_HermanMiller.pdf', vendor: 'Herman Miller', type: 'Quote',
        pages: 1, fields: 0, status: 'deprecated', confidence: 18, inconsistencyCount: 0,
        deprecationReason: 'failed_processing',
        deprecatedAt: '2026-02-02', deprecatedBy: 'system',
        originalStatus: 'identified',
    },
    {
        id: 'OCR-918', name: 'PO-6654_Haworth.pdf', vendor: 'Haworth', type: 'Purchase Order',
        pages: 5, fields: 68, status: 'deprecated', confidence: 83, inconsistencyCount: 0,
        deprecationReason: 'superseded',
        deprecatedAt: '2026-01-26', deprecatedBy: 'system',
        replacementId: 'PO-6655', originalStatus: 'processed',
    },
    {
        id: 'OCR-919', name: 'INV-1188_AIS.pdf', vendor: 'AIS Furniture', type: 'Invoice',
        pages: 3, fields: 47, status: 'deprecated', confidence: 91, inconsistencyCount: 1,
        deprecationReason: 'cancelled',
        deprecatedAt: '2026-01-15', deprecatedBy: 'demo.user@example.com',
        originalStatus: 'processed',
    },
    {
        id: 'OCR-920', name: 'QT-2298_KI.pdf', vendor: 'KI Furniture', type: 'Quote',
        pages: 2, fields: 24, status: 'deprecated', confidence: 88, inconsistencyCount: 0,
        deprecationReason: 'duplicate',
        deprecatedAt: '2025-12-22', deprecatedBy: 'demo.user@example.com',
        originalStatus: 'processed',
    },
    {
        id: 'OCR-921', name: 'PO-5571_9to5.pdf', vendor: '9to5 Seating', type: 'Purchase Order',
        pages: 4, fields: 52, status: 'deprecated', confidence: 80, inconsistencyCount: 2,
        deprecationReason: 'vendor_correction',
        deprecatedAt: '2025-12-10', deprecatedBy: 'system',
        replacementId: 'PO-5572', originalStatus: 'inconsistencies',
    },
    {
        id: 'OCR-922', name: 'ACK-7501_Teknion.pdf', vendor: 'Teknion', type: 'Acknowledgment',
        pages: 1, fields: 14, status: 'deprecated', confidence: 100, inconsistencyCount: 0,
        deprecationReason: 'obsolete',
        deprecatedAt: '2025-11-18', deprecatedBy: 'system',
        originalStatus: 'processed',
    },
    {
        id: 'OCR-923', name: 'QT-9990_Kimball.pdf', vendor: 'Kimball', type: 'Quote',
        pages: 2, fields: 26, status: 'deprecated', confidence: 73, inconsistencyCount: 0,
        deprecationReason: 'superseded',
        deprecatedAt: '2025-09-12', deprecatedBy: 'system',
        replacementId: 'QT-9991', originalStatus: 'processed',
    },
]

// Format an ISO date as a friendly relative string. Falls back to absolute.
export function formatRelativeDate(iso: string, now: Date = new Date()): string {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    const diffMs = now.getTime() - d.getTime()
    const day = 24 * 60 * 60 * 1000
    const days = Math.floor(diffMs / day)
    if (days < 0) return iso
    if (days === 0) return 'today'
    if (days === 1) return 'yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) {
        const w = Math.floor(days / 7)
        return `${w} week${w === 1 ? '' : 's'} ago`
    }
    if (days < 365) {
        const m = Math.floor(days / 30)
        return `${m} month${m === 1 ? '' : 's'} ago`
    }
    const y = Math.floor(days / 365)
    return `${y} year${y === 1 ? '' : 's'} ago`
}
