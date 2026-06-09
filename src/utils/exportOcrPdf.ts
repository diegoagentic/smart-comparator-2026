import logoLight from '../assets/logo-light-brand.png'

// ─── Types ────────────────────────────────────────────────────
interface OcrDocument {
    id: string
    name: string
    vendor: string
    type: string
    fields: number
    confidence: number | null
    status?: string
    inconsistencyCount?: number
    assignee?: { name: string }
}

interface FieldEntry {
    name: string
    value: string
    confidence: number
    status: 'valid' | 'inconsistent' | 'missing'
}

interface FieldGroup {
    id: string
    label: string
    fields: FieldEntry[]
}

// ─── Status helpers ───────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
    identified: 'Ingesting', capturing: 'Needs Attention',
    inconsistencies: 'Awaiting Expert', in_progress: 'In Progress',
    processed: 'Reconciled', deprecated: 'Deprecated',
}

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    identified:      { bg: '#f0f9ff', border: '#bae6fd', text: '#0369a1', dot: '#38bdf8' },
    capturing:       { bg: '#fffbeb', border: '#fde68a', text: '#92400e', dot: '#f59e0b' },
    inconsistencies: { bg: '#fff7ed', border: '#fed7aa', text: '#9a3412', dot: '#f97316' },
    in_progress:     { bg: '#faf5ff', border: '#e9d5ff', text: '#6b21a8', dot: '#a855f7' },
    processed:       { bg: '#f0fdf4', border: '#bbf7d0', text: '#14532d', dot: '#22c55e' },
    deprecated:      { bg: '#fef2f2', border: '#fecaca', text: '#7f1d1d', dot: '#ef4444' },
}

const STATUS_MSG: Record<string, (doc: OcrDocument) => string> = {
    identified:      () => 'Document is being ingested — field extraction in progress',
    capturing:       (d) => `OCR in progress · ${d.fields} fields detected · Analysis pending`,
    inconsistencies: (d) => `${d.inconsistencyCount ?? 0} inconsistencies detected — expert review required`,
    in_progress:     (d) => `Expert review in progress${d.assignee ? ' · Assigned to ' + d.assignee.name : ''}`,
    processed:       () => 'Document reconciled — all fields validated successfully',
    deprecated:      () => 'This document has been deprecated and is no longer active',
}

// ─── Mock data ────────────────────────────────────────────────
const ACK_FIELDS: FieldGroup[] = [
    { id: 'header', label: 'Document Header', fields: [
        { name: 'ACK Number',    value: 'ACK-7839',               confidence: 99, status: 'valid' },
        { name: 'ACK Date',      value: '2026-01-13',              confidence: 97, status: 'valid' },
        { name: 'Reference PO',  value: '',                        confidence: 0,  status: 'missing' },
        { name: 'Sales Order #', value: 'SO 1151064-B',            confidence: 94, status: 'valid' },
        { name: 'Document Type', value: 'Acknowledgment',          confidence: 98, status: 'valid' },
    ]},
    { id: 'vendor', label: 'Vendor Information', fields: [
        { name: 'Vendor Name',    value: 'Steelcase',                        confidence: 99, status: 'valid' },
        { name: 'Vendor Address', value: '901 44th St SE, Grand Rapids, MI', confidence: 93, status: 'valid' },
        { name: 'Sales Rep',      value: 'Mark Thompson',                    confidence: 88, status: 'valid' },
        { name: 'Rep Email',      value: 'mthompson@steelcase.com',          confidence: 85, status: 'valid' },
        { name: 'Rep Phone',      value: '',                                  confidence: 0,  status: 'missing' },
    ]},
    { id: 'line_items', label: 'Line Items', fields: [
        { name: 'Line 1 — Description', value: 'Gesture Task Chair',  confidence: 96, status: 'valid' },
        { name: 'Line 1 — SKU',         value: 'GES-442-BLK',         confidence: 94, status: 'valid' },
        { name: 'Line 1 — Quantity',    value: '8',                   confidence: 97, status: 'valid' },
        { name: 'Line 1 — Unit Price',  value: '$1,242.00',           confidence: 95, status: 'valid' },
        { name: 'Line 2 — Description', value: 'Migration SE Desk',   confidence: 92, status: 'valid' },
        { name: 'Line 2 — SKU',         value: '',                    confidence: 0,  status: 'missing' },
        { name: 'Line 2 — Quantity',    value: '12',                  confidence: 98, status: 'valid' },
        { name: 'Line 2 — Unit Price',  value: '$1,895.00',           confidence: 91, status: 'inconsistent' },
        { name: 'Line 3 — Description', value: 'Think V2 Stool',      confidence: 89, status: 'valid' },
        { name: 'Line 3 — Quantity',    value: '6',                   confidence: 96, status: 'valid' },
    ]},
    { id: 'pricing', label: 'Pricing & Totals', fields: [
        { name: 'Subtotal', value: '$47,826.00', confidence: 93, status: 'valid' },
        { name: 'Discount', value: '38%',        confidence: 90, status: 'valid' },
        { name: 'Tax',      value: '',           confidence: 0,  status: 'missing' },
        { name: 'Total',    value: '$29,651.92', confidence: 88, status: 'inconsistent' },
    ]},
    { id: 'logistics', label: 'Shipping & Delivery', fields: [
        { name: 'Ship To',            value: '1200 Commerce Dr, Suite 400, Dallas TX', confidence: 95, status: 'valid' },
        { name: 'Ship Via',           value: 'Steelcase Fleet',                         confidence: 91, status: 'valid' },
        { name: 'Expected Ship Date', value: '2026-02-20',                              confidence: 87, status: 'valid' },
        { name: 'Freight Terms',      value: 'Prepaid',                                 confidence: 84, status: 'inconsistent' },
    ]},
]

const PO_FIELDS: FieldGroup[] = [
    { id: 'header', label: 'Document Header', fields: [
        { name: 'PO Number',     value: 'PO-1029',    confidence: 99, status: 'valid' },
        { name: 'PO Date',       value: '2025-12-15', confidence: 98, status: 'valid' },
        { name: 'Order Status',  value: 'Active',     confidence: 96, status: 'valid' },
        { name: 'Payment Terms', value: 'Net 30',     confidence: 94, status: 'valid' },
    ]},
    { id: 'vendor', label: 'Vendor', fields: [
        { name: 'Vendor Name', value: 'Apex Furniture',  confidence: 99, status: 'valid' },
        { name: 'Contact',     value: 'Lisa Chen',        confidence: 91, status: 'valid' },
        { name: 'Email',       value: '',                 confidence: 0,  status: 'missing' },
        { name: 'Phone',       value: '(469) 555-0188',  confidence: 87, status: 'valid' },
    ]},
    { id: 'line_items', label: 'Line Items', fields: [
        { name: 'Line 1 — Ergonomic Task Chair', value: 'Qty: 125 @ $376.75', confidence: 96, status: 'valid' },
        { name: 'Line 1 — SKU',                  value: 'SKU-OFF-2025-002',   confidence: 98, status: 'valid' },
        { name: 'Line 2 — Standing Desk 60x30',  value: 'Qty: 50 @ $892.00',  confidence: 94, status: 'valid' },
        { name: 'Line 2 — SKU',                  value: '',                    confidence: 0,  status: 'missing' },
        { name: 'Line 3 — Monitor Arm Dual',     value: 'Qty: 125 @ $189.00', confidence: 93, status: 'valid' },
    ]},
    { id: 'pricing', label: 'Pricing', fields: [
        { name: 'Subtotal', value: '$117,518.75', confidence: 95, status: 'valid' },
        { name: 'Discount', value: '45%',         confidence: 88, status: 'inconsistent' },
        { name: 'Total',    value: '$64,635.31',  confidence: 90, status: 'valid' },
    ]},
    { id: 'logistics', label: 'Shipping', fields: [
        { name: 'Ship To',           value: '800 W Campbell Rd, Richardson TX', confidence: 97, status: 'valid' },
        { name: 'Expected Delivery', value: '2026-01-30',                       confidence: 85, status: 'valid' },
        { name: 'Freight Terms',     value: 'FOB Destination',                  confidence: 92, status: 'valid' },
    ]},
]

// ─── HTML builders ────────────────────────────────────────────

/** A single field section — pure editorial table, no rounded corners */
function sectionHtml(group: FieldGroup): string {
    const issueCount = group.fields.filter(f => f.status !== 'valid').length
    const rows = group.fields.map((field, i) => {
        const last = i === group.fields.length - 1
        const dotColor  = field.status === 'valid' ? '#16a34a' : field.status === 'inconsistent' ? '#d97706' : '#dc2626'
        const valColor  = field.status === 'missing' ? '#dc2626' : field.status === 'inconsistent' ? '#d97706' : '#111827'
        const statusLbl = field.status === 'valid' ? 'Valid' : field.status === 'inconsistent' ? 'Inconsistent' : 'Missing'
        const rowBg     = field.status === 'missing' ? '#fffafa' : field.status === 'inconsistent' ? '#fffdf5' : '#ffffff'
        const confColor = field.confidence >= 90 ? '#16a34a' : field.confidence >= 75 ? '#d97706' : '#dc2626'
        return `<tr style="background:${rowBg};${!last ? 'border-bottom:1px solid #ebebeb;' : ''}">
            <td style="padding:8px 12px;font-size:10.5px;color:#4b5563;width:40%;vertical-align:middle;">
                <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${dotColor};margin-right:8px;vertical-align:middle;flex-shrink:0;"></span>${field.name}
            </td>
            <td style="padding:8px 10px;font-size:10.5px;font-weight:600;color:${valColor};font-style:${field.status === 'missing' ? 'italic' : 'normal'};vertical-align:middle;">
                ${field.value || '— Not found'}
            </td>
            <td style="padding:8px 10px;font-size:9.5px;color:${confColor};text-align:right;white-space:nowrap;vertical-align:middle;font-variant-numeric:tabular-nums;">
                ${field.confidence > 0 ? field.confidence + '%' : '—'}
            </td>
            <td style="padding:8px 16px 8px 6px;font-size:9px;color:${dotColor};text-align:right;text-transform:uppercase;letter-spacing:0.07em;white-space:nowrap;vertical-align:middle;">
                ${statusLbl}
            </td>
        </tr>`
    }).join('')

    return `<div style="margin-bottom:24px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:7px;">
            <div style="width:3px;height:12px;background:#C3E433;flex-shrink:0;"></div>
            <span style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.13em;color:#9ca3af;">${group.label}</span>
            ${issueCount > 0 ? `<span style="font-size:8px;color:#d97706;">${issueCount} issue${issueCount > 1 ? 's' : ''}</span>` : ''}
            <div style="flex:1;height:1px;background:#e5e7eb;"></div>
        </div>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e0e0e0;font-family:inherit;">
            <thead><tr style="background:#f7f7f7;border-bottom:1px solid #ddd;">
                <th style="padding:5px 12px;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;text-align:left;">Field</th>
                <th style="padding:5px 10px;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;text-align:left;">Extracted Value</th>
                <th style="padding:5px 10px;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;text-align:right;">Conf.</th>
                <th style="padding:5px 16px 5px 6px;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#9ca3af;text-align:right;">Status</th>
            </tr></thead>
            <tbody>${rows}</tbody>
        </table>
    </div>`
}

/** Shared page wrapper: 794×1123px, white bg */
const PAGE_WRAP_OPEN = `<div style="width:794px;height:1123px;background:#ffffff;font-family:Inter,-apple-system,'Helvetica Neue',Arial,sans-serif;color:#111827;box-sizing:border-box;overflow:hidden;position:relative;">`
const PAGE_WRAP_CLOSE = `</div>`

/** Slim page header shown on pages 2+ */
function continuationHeader(doc: OcrDocument, page: number, total: number): string {
    return `
    <div style="padding:14px 48px 12px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e5e7eb;">
        <div style="display:flex;align-items:center;gap:12px;">
            <img src="${logoLight}" style="height:18px;object-fit:contain;" />
            <div style="width:1px;height:16px;background:#d1d5db;"></div>
            <span style="font-size:10px;font-weight:700;color:#111827;">${doc.vendor}</span>
            <span style="font-size:9px;font-family:'Courier New',monospace;color:#6b7280;">${doc.name}</span>
        </div>
        <span style="font-size:8.5px;color:#9ca3af;">Page ${page} of ${total}</span>
    </div>`
}

/** Full first-page header */
function page1Header(doc: OcrDocument, allFields: FieldEntry[], total: number): string {
    const validCount = allFields.filter(f => f.status === 'valid').length
    const inconsistentCount = allFields.filter(f => f.status === 'inconsistent').length
    const missingCount = allFields.filter(f => f.status === 'missing').length
    const totalCount = allFields.length
    const confidence = doc.confidence ?? Math.round((validCount / totalCount) * 100)
    const confColor = confidence >= 90 ? '#16a34a' : confidence >= 75 ? '#d97706' : '#dc2626'
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const docNumber = allFields.find(f => f.name.includes('Number'))?.value || doc.name
    const docDate = allFields.find(f => f.name.includes('Date'))?.value || ''

    const key = doc.status ?? 'identified'
    const c = STATUS_COLORS[key] ?? STATUS_COLORS['identified']
    const msg = STATUS_MSG[key]?.(doc) ?? ''

    return `
    <div style="padding:22px 48px 16px;display:flex;align-items:flex-start;justify-content:space-between;border-bottom:1px solid #e5e7eb;">
        <div style="display:flex;align-items:center;gap:14px;">
            <img src="${logoLight}" style="height:22px;object-fit:contain;" />
            <div style="width:1px;height:18px;background:#d1d5db;"></div>
            <div>
                <div style="font-size:7.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:#9ca3af;">Smart Comparator</div>
                <div style="font-size:13px;font-weight:700;color:#111827;margin-top:1px;letter-spacing:-0.01em;">OCR Extraction Report</div>
            </div>
        </div>
        <div style="text-align:right;">
            <div style="font-size:7.5px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;">Generated</div>
            <div style="font-size:9.5px;color:#374151;margin-top:2px;">${today}</div>
            <div style="font-size:8px;color:#9ca3af;margin-top:2px;">Page 1 of ${total}</div>
        </div>
    </div>

    <div style="padding:16px 48px;display:flex;align-items:flex-start;justify-content:space-between;border-bottom:1px solid #e5e7eb;background:#fafafa;">
        <div>
            <div style="font-size:7.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#9ca3af;margin-bottom:5px;">${doc.type}</div>
            <div style="font-size:20px;font-weight:800;color:#0a0a0a;letter-spacing:-0.02em;line-height:1.1;">${doc.vendor}</div>
            <div style="font-size:9px;font-family:'Courier New',monospace;color:#6b7280;margin-top:5px;">${doc.name}</div>
            ${docDate ? `<div style="font-size:9px;color:#9ca3af;margin-top:2px;">${docDate}</div>` : ''}
        </div>
        <div style="text-align:right;">
            <div style="font-size:7.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#9ca3af;margin-bottom:3px;">Document No.</div>
            <div style="font-size:13px;font-weight:700;font-family:'Courier New',monospace;color:#111827;">${docNumber}</div>
        </div>
    </div>

    <div style="padding:12px 48px;border-bottom:2px solid #111827;display:flex;align-items:center;">
        ${[
            { label: 'Valid Fields',    value: validCount,        color: '#16a34a' },
            { label: 'Inconsistencies', value: inconsistentCount, color: '#d97706' },
            { label: 'Missing',         value: missingCount,      color: '#dc2626' },
            { label: 'Total Fields',    value: totalCount,        color: '#374151' },
        ].map((s, i) => `
            <div style="${i > 0 ? 'padding-left:20px;border-left:1px solid #e5e7eb;margin-left:20px;' : ''}">
                <div style="font-size:17px;font-weight:800;color:${s.color};line-height:1;">${s.value}</div>
                <div style="font-size:7.5px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;margin-top:2px;">${s.label}</div>
            </div>`).join('')}
        <div style="margin-left:auto;padding-left:20px;border-left:1px solid #e5e7eb;text-align:right;">
            <div style="font-size:17px;font-weight:800;color:${confColor};line-height:1;">${confidence}%</div>
            <div style="font-size:7.5px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;margin-top:2px;">OCR Confidence</div>
            <div style="margin-top:4px;width:72px;height:2px;background:#e5e7eb;margin-left:auto;"><div style="height:2px;background:${confColor};width:${confidence}%;"></div></div>
        </div>
    </div>

    <div style="margin:16px 48px 0;padding:9px 14px;background:${c.bg};border:1px solid ${c.border};display:flex;align-items:center;gap:9px;">
        <div style="width:6px;height:6px;border-radius:50%;background:${c.dot};flex-shrink:0;"></div>
        <span style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:${c.text};">${STATUS_LABELS[key] ?? key}</span>
        <span style="font-size:9.5px;color:${c.text};margin-left:6px;">${msg}</span>
    </div>`
}

/** Shared page footer (inline, always at bottom of page) */
function pageFooter(): string {
    return `
    <div style="position:absolute;bottom:0;left:0;right:0;padding:10px 48px;border-top:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;background:#fafafa;">
        <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:8.5px;font-weight:600;color:#374151;">Smart Comparator</span>
            <span style="font-size:8.5px;color:#d1d5db;">·</span>
            <span style="font-size:8.5px;color:#9ca3af;">Strata Experience</span>
        </div>
        <div style="font-size:7.5px;color:#9ca3af;">Confidential · For internal use only · © 2026 Strata</div>
    </div>`
}

// ─── Measure section heights off-screen ──────────────────────
async function measureSectionHeights(sectionHtmls: string[]): Promise<number[]> {
    const container = document.createElement('div')
    container.style.cssText = 'position:fixed;left:-9999px;top:0;width:698px;visibility:hidden;pointer-events:none;'
    document.body.appendChild(container)

    const heights: number[] = []
    for (const html of sectionHtmls) {
        container.innerHTML = html
        await new Promise(r => requestAnimationFrame(r))
        heights.push(container.offsetHeight)
    }

    document.body.removeChild(container)
    return heights
}

// ─── Distribute sections into pages ─────────────────────────
function distributeToPages(
    sectionHeights: number[],
    page1FixedH: number,
    pageNFixedH: number,
    contentH: number, // total usable content height per page (excl. absolute footer)
): number[][] {
    const pages: number[][] = []
    let currentPage: number[] = []
    let usedH = 0 // tracks section heights only on the current page

    for (let i = 0; i < sectionHeights.length; i++) {
        const available = pages.length === 0 ? contentH - page1FixedH : contentH - pageNFixedH
        if (currentPage.length > 0 && usedH + sectionHeights[i] > available) {
            pages.push(currentPage)
            currentPage = [i]
            usedH = sectionHeights[i]
        } else {
            currentPage.push(i)
            usedH += sectionHeights[i]
        }
    }
    if (currentPage.length > 0) pages.push(currentPage)
    return pages
}

// ─── Capture an HTML element to canvas ───────────────────────
async function captureEl(html: string): Promise<HTMLCanvasElement> {
    const wrap = document.createElement('div')
    wrap.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;'
    wrap.innerHTML = html
    document.body.appendChild(wrap)
    await new Promise(r => requestAnimationFrame(r))
    const el = wrap.firstElementChild as HTMLElement
    const { default: html2canvas } = await import('html2canvas')
    const canvas = await html2canvas(el, {
        scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false,
    })
    document.body.removeChild(wrap)
    return canvas
}

// ─── Main export ──────────────────────────────────────────────
export async function exportOcrPdf(doc: OcrDocument): Promise<void> {
    const isAck = doc.type === 'Acknowledgment'
    const groups = isAck ? ACK_FIELDS : PO_FIELDS
    const allFields = groups.flatMap(g => g.fields)

    // Build section HTML strings
    const sectionHtmls = groups.map(g => sectionHtml(g))

    // Measure each section rendered at 698px (794 - 96px horizontal padding)
    const sectionHeights = await measureSectionHeights(sectionHtmls)

    // Page geometry (CSS px, before scale=2)
    const PAGE_H      = 1123   // A4 height
    const FOOTER_H    = 40     // position:absolute footer height
    const CONTENT_H   = PAGE_H - FOOTER_H  // 1083 available rows

    // Fixed heights: header rows + padding before first section (no brand bar)
    // Page1: 60 + 88 + 61 + 50 (status banner) + 20 (section top pad) = ~279
    const PAGE1_HEADER_H = 279
    // PageN: 44 (slim header) + 20 (section top pad) = ~64
    const PAGEN_HEADER_H = 64


    const pageGroups = distributeToPages(
        sectionHeights,
        PAGE1_HEADER_H,
        PAGEN_HEADER_H,
        CONTENT_H,
    )
    const totalPages = pageGroups.length

    const { default: jsPDF } = await import('jspdf')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' })
    const pdfW = pdf.internal.pageSize.getWidth()

    for (let p = 0; p < totalPages; p++) {
        const sectionsForPage = pageGroups[p].map(i => sectionHtmls[i]).join('')
        const header = p === 0
            ? page1Header(doc, allFields, totalPages)
            : continuationHeader(doc, p + 1, totalPages)

        const pageHtml = `${PAGE_WRAP_OPEN}
            ${header}
            <div style="padding:20px 48px 52px;">${sectionsForPage}</div>
            ${pageFooter()}
        ${PAGE_WRAP_CLOSE}`

        const canvas = await captureEl(pageHtml)

        if (p > 0) pdf.addPage()
        const imgH = (canvas.height * pdfW) / canvas.width
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdfW, imgH)
    }

    const filename = doc.name.replace(/\.pdf$/i, '') + '_OCR-Report.pdf'
    pdf.save(filename)
}
