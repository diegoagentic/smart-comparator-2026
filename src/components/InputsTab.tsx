import { useState } from 'react'
import {
    FileText, Building2, Truck, Package, DollarSign, MapPin, Users, Mail,
    Calendar, Hash, CreditCard, ClipboardList, CheckCircle2, AlertCircle,
    ChevronDown, ChevronRight, Armchair, Settings, StickyNote
} from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs))
}

interface FieldDef {
    name: string
    label: string
    value: string
    required?: boolean
    status?: 'filled' | 'empty' | 'warning'
}

interface FieldGroup {
    id: string
    label: string
    icon: React.ReactNode
    fields: FieldDef[]
}

// ─── PO Schema ────────────────────────────────────────────────
const poFieldGroups: FieldGroup[] = [
    {
        id: 'poInfo',
        label: 'PO Information',
        icon: <FileText className="h-4 w-4" />,
        fields: [
            { name: 'poNumber', label: 'PO Number', value: 'ORD-2055', required: true, status: 'filled' },
            { name: 'poDate', label: 'PO Date', value: '2025-09-14', required: true, status: 'filled' },
            { name: 'orderStatus', label: 'Order Status', value: 'Confirmed', required: true, status: 'filled' },
            { name: 'expectedDeliveryDate', label: 'Expected Delivery', value: '2025-11-15', required: true, status: 'filled' },
            { name: 'paymentTerms', label: 'Payment Terms', value: 'Net 30', required: false, status: 'filled' },
        ]
    },
    {
        id: 'vendor',
        label: 'Vendor',
        icon: <Building2 className="h-4 w-4" />,
        fields: [
            { name: 'vendorName', label: 'Company Name', value: 'AIS — Affordable Interior Systems', required: true, status: 'filled' },
            { name: 'vendorAddress', label: 'Address', value: '555 Industrial Blvd, Lenexa, KS 66215', required: true, status: 'filled' },
            { name: 'vendorContact', label: 'Contact', value: 'Sarah Johnson', required: false, status: 'filled' },
            { name: 'vendorEmail', label: 'Email', value: 'sjohnson@ais-furniture.com', required: false, status: 'filled' },
            { name: 'vendorPhone', label: 'Phone', value: '(913) 555-0142', required: false, status: 'filled' },
        ]
    },
    {
        id: 'shipping',
        label: 'Shipping',
        icon: <Truck className="h-4 w-4" />,
        fields: [
            { name: 'shipToAddress', label: 'Ship To', value: '1200 Commerce Dr, Suite 400, Dallas, TX 75201', required: true, status: 'filled' },
            { name: 'shippingTerms', label: 'Shipping Terms', value: 'FOB Destination', required: false, status: 'filled' },
            { name: 'freightTerms', label: 'Freight Terms', value: 'Prepaid & Add', required: false, status: 'filled' },
        ]
    },
    {
        id: 'lineItems',
        label: 'Line Items',
        icon: <Package className="h-4 w-4" />,
        fields: [
            { name: 'totalLines', label: 'Total Lines', value: '8', required: true, status: 'filled' },
            { name: 'productNumber', label: 'Product Number', value: 'T-RCR306029HLG2 (first)', required: true, status: 'filled' },
            { name: 'quantity', label: 'Total Quantity', value: '49 units', required: true, status: 'filled' },
            { name: 'productCost', label: 'List Price Range', value: '$656.00 – $4,836.00', required: true, status: 'filled' },
            { name: 'discountPct', label: 'Discount Range', value: '55% – 62%', required: false, status: 'filled' },
        ]
    },
    {
        id: 'project',
        label: 'Project',
        icon: <ClipboardList className="h-4 w-4" />,
        fields: [
            { name: 'projectName', label: 'Project Name', value: 'Dallas HQ Renovation — Phase 2', required: false, status: 'filled' },
            { name: 'projectCode', label: 'Project Code', value: 'PRJ-4820', required: false, status: 'filled' },
            { name: 'projectManager', label: 'Project Manager', value: 'Mike Torres', required: false, status: 'filled' },
        ]
    },
    {
        id: 'financials',
        label: 'Financials',
        icon: <DollarSign className="h-4 w-4" />,
        fields: [
            { name: 'subtotal', label: 'Subtotal', value: '$25,398.72', required: true, status: 'filled' },
            { name: 'taxRate', label: 'Tax Rate', value: '8.25%', required: false, status: 'filled' },
            { name: 'taxAmount', label: 'Tax Amount', value: '$2,095.39', required: false, status: 'filled' },
            { name: 'totalAmount', label: 'Total Amount', value: '$27,494.11', required: true, status: 'filled' },
        ]
    },
]

// ─── ACK Schema ───────────────────────────────────────────────
const ackFieldGroups: FieldGroup[] = [
    {
        id: 'ackInfo',
        label: 'Acknowledgement Info',
        icon: <FileText className="h-4 w-4" />,
        fields: [
            { name: 'acknowledgementNumber', label: 'ACK Number', value: 'ACK-3099', required: true, status: 'filled' },
            { name: 'acknowledgementDate', label: 'ACK Date', value: '2025-09-16', required: true, status: 'filled' },
            { name: 'acknowledgedShipDate', label: 'Acknowledged Ship Date', value: '2025-11-12', required: true, status: 'filled' },
            { name: 'poNumber', label: 'Reference PO', value: 'ORD-2055', required: true, status: 'filled' },
            { name: 'orderNumber', label: 'Sales Order #', value: 'SO 1151064-B', required: true, status: 'filled' },
            { name: 'ackStatus', label: 'Status', value: '2 Exceptions', required: true, status: 'warning' },
        ]
    },
    {
        id: 'vendorAndBillTo',
        label: 'Vendor & Bill To',
        icon: <Building2 className="h-4 w-4" />,
        fields: [
            { name: 'vendorName', label: 'Vendor', value: 'AIS — Affordable Interior Systems', required: true, status: 'filled' },
            { name: 'vendorAddress', label: 'Vendor Address', value: '555 Industrial Blvd, Lenexa, KS 66215', required: true, status: 'filled' },
            { name: 'billToName', label: 'Bill To', value: 'Strata Workplace Solutions', required: true, status: 'filled' },
            { name: 'billToAddress', label: 'Bill To Address', value: '3400 Pegasus Park Dr, Dallas, TX 75247', required: true, status: 'filled' },
        ]
    },
    {
        id: 'contactAndEmails',
        label: 'Contacts & Emails',
        icon: <Mail className="h-4 w-4" />,
        fields: [
            { name: 'salesRep', label: 'Sales Rep', value: 'Sarah Johnson', required: false, status: 'filled' },
            { name: 'salesEmail', label: 'Sales Email', value: 'sjohnson@ais-furniture.com', required: false, status: 'filled' },
            { name: 'buyerContact', label: 'Buyer Contact', value: 'Diego Zuluaga', required: false, status: 'filled' },
            { name: 'buyerEmail', label: 'Buyer Email', value: 'diego.zuluaga@strata.com', required: false, status: 'filled' },
        ]
    },
    {
        id: 'productAndFurniture',
        label: 'Product & Furniture',
        icon: <Armchair className="h-4 w-4" />,
        fields: [
            { name: 'totalLines', label: 'Total Lines', value: '40', required: true, status: 'filled' },
            { name: 'confirmedLines', label: 'Confirmed Lines', value: '38', required: false, status: 'filled' },
            { name: 'exceptionLines', label: 'Exception Lines', value: '2', required: false, status: 'warning' },
            { name: 'totalQuantity', label: 'Total Quantity', value: '49 units', required: true, status: 'filled' },
        ]
    },
    {
        id: 'processing',
        label: 'Processing',
        icon: <Settings className="h-4 w-4" />,
        fields: [
            { name: 'matchRate', label: 'Match Rate', value: '95%', required: false, status: 'filled' },
            { name: 'ocrConfidence', label: 'OCR Confidence', value: '98.2%', required: false, status: 'filled' },
            { name: 'processedAt', label: 'Processed At', value: '2025-09-16 08:42 AM', required: false, status: 'filled' },
            { name: 'processingMethod', label: 'Method', value: 'EDI 855', required: false, status: 'filled' },
        ]
    },
    {
        id: 'locationAndShipping',
        label: 'Location & Shipping',
        icon: <MapPin className="h-4 w-4" />,
        fields: [
            { name: 'shipTo', label: 'Ship To', value: '1200 Commerce Dr, Suite 400, Dallas, TX 75201', required: true, status: 'filled' },
            { name: 'shipVia', label: 'Ship Via', value: 'AIS Fleet — White Glove', required: false, status: 'filled' },
            { name: 'freightTerms', label: 'Freight Terms', value: 'Prepaid & Add', required: false, status: 'filled' },
            { name: 'installSchedule', label: 'Install Schedule', value: '2025-11-18 – 2025-11-20', required: false, status: 'filled' },
        ]
    },
    {
        id: 'approvalsAndNotes',
        label: 'Approvals & Notes',
        icon: <StickyNote className="h-4 w-4" />,
        fields: [
            { name: 'approvalStatus', label: 'Approval Status', value: 'Pending Review', required: true, status: 'warning' },
            { name: 'approver', label: 'Approver', value: 'Mike Torres', required: false, status: 'filled' },
            { name: 'notes', label: 'Notes', value: 'Finish substitution on lounge seating pending client approval', required: false, status: 'filled' },
        ]
    },
]

// ─── Reusable group component ─────────────────────────────────
function FieldGroupCard({ group, defaultOpen = false }: { group: FieldGroup; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen)
    const filledCount = group.fields.filter(f => f.status === 'filled').length
    const warningCount = group.fields.filter(f => f.status === 'warning').length
    const totalCount = group.fields.length

    return (
        <div className="border border-border rounded-xl bg-card overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
            >
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                    {group.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-foreground">{group.label}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">{filledCount}/{totalCount} fields</span>
                        {warningCount > 0 && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                                <AlertCircle className="h-3 w-3" /> {warningCount} warning{warningCount > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </div>
                {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </button>
            {open && (
                <div className="border-t border-border divide-y divide-border/50">
                    {group.fields.map((field) => (
                        <div key={field.name} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-muted-foreground">{field.label}</span>
                                    {field.required && (
                                        <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">req</span>
                                    )}
                                </div>
                                <p className="text-sm font-medium text-foreground truncate mt-0.5">{field.value}</p>
                            </div>
                            {field.status === 'filled' && (
                                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                            )}
                            {field.status === 'warning' && (
                                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                            )}
                            {field.status === 'empty' && (
                                <div className="h-4 w-4 rounded-full border-2 border-border shrink-0" />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Summary bar ──────────────────────────────────────────────
function SummaryBar({ groups }: { groups: FieldGroup[] }) {
    const totalFields = groups.reduce((s, g) => s + g.fields.length, 0)
    const filledFields = groups.reduce((s, g) => s + g.fields.filter(f => f.status === 'filled').length, 0)
    const warningFields = groups.reduce((s, g) => s + g.fields.filter(f => f.status === 'warning').length, 0)
    const pct = Math.round((filledFields / totalFields) * 100)

    return (
        <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-xs font-medium text-foreground">{filledFields} filled</span>
                </div>
                {warningFields > 0 && (
                    <div className="flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        <span className="text-xs font-medium text-foreground">{warningFields} warning{warningFields > 1 ? 's' : ''}</span>
                    </div>
                )}
                <span className="text-xs text-muted-foreground">{totalFields} total fields</span>
            </div>
            <div className="flex items-center gap-2" title="Document Progress">
                <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                    />
                </div>
                <span className="text-xs font-semibold text-foreground">{pct}%</span>
            </div>
        </div>
    )
}

// ─── Main export ──────────────────────────────────────────────
export function POInputsTab() {
    return (
        <div className="flex flex-col">
            <SummaryBar groups={poFieldGroups} />
            <div className="p-6 space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto">
                {poFieldGroups.map((group, i) => (
                    <FieldGroupCard key={group.id} group={group} defaultOpen={i === 0} />
                ))}
            </div>
        </div>
    )
}

export function ACKInputsTab() {
    return (
        <div className="flex flex-col">
            <SummaryBar groups={ackFieldGroups} />
            <div className="p-6 space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto">
                {ackFieldGroups.map((group, i) => (
                    <FieldGroupCard key={group.id} group={group} defaultOpen={i === 0} />
                ))}
            </div>
        </div>
    )
}
