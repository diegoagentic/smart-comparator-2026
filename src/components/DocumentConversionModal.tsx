import { Fragment, useState, useEffect, useMemo } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
    XMarkIcon, ArrowRightIcon, ArrowLeftIcon, CheckCircleIcon, XCircleIcon,
    ExclamationTriangleIcon, SparklesIcon, ShoppingCartIcon, ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline'

// ── Types ──────────────────────────────────────────────────────

interface DocumentConversionModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'quote-to-order' | 'order-to-ack';
    triggerToast: (title: string, description: string, type: 'success' | 'error' | 'info') => void;
}

type ConversionStep = 'select' | 'compare' | 'review' | 'confirm';

interface DocItem {
    id: string;
    customer: string;
    project: string;
    amount: string;
    status: string;
    date: string;
    initials: string;
}

interface ComparisonField {
    field: string;
    category: 'header' | 'line-item' | 'pricing' | 'logistics';
    docValue: string;
    sourceValue: string;
    status: 'match' | 'mismatch' | 'partial';
    autoFixSuggestion?: string;
    confidence?: number;
    severity?: 'low' | 'medium' | 'high';
}

// ── Mock Data ──────────────────────────────────────────────────

const ELIGIBLE_QUOTES: DocItem[] = [
    { id: 'QT-1020', customer: 'Summit Healthcare', project: 'Clinic Furniture', amount: '$68,200', status: 'Ready', date: 'Dec 15, 2025', initials: 'SH' },
    { id: 'QT-1022', customer: 'Redwood School District', project: 'Classroom Refresh', amount: '$150,000', status: 'Approved', date: 'Dec 28, 2025', initials: 'RS' },
    { id: 'QT-1025', customer: 'Apex Furniture', project: 'New HQ Buildout', amount: '$43,750', status: 'Negotiating', date: 'Jan 12, 2026', initials: 'AF' },
    { id: 'QT-1028', customer: 'FinServe Corp', project: 'Branch Rollout', amount: '$890,000', status: 'Approved', date: 'Jan 08, 2026', initials: 'FS' },
    { id: 'QT-1033', customer: 'BioLife Inc', project: 'Lab Expansion', amount: '$540,000', status: 'Draft', date: 'Jan 10, 2026', initials: 'BL' },
    { id: 'QT-1039', customer: 'Urban Living Inc.', project: 'Lobby Renovation', amount: '$112,000', status: 'Sent', date: 'Feb 01, 2026', initials: 'UL' },
];

const ELIGIBLE_ORDERS: DocItem[] = [
    { id: '#ORD-2056', customer: 'Summit Healthcare', project: 'Clinic Furniture', amount: '$68,200', status: 'Ready', date: 'Dec 18, 2025', initials: 'SH' },
    { id: '#ORD-2055', customer: 'AutoManfacture Co.', project: 'Office Renovation', amount: '$385,000', status: 'Order Received', date: 'Dec 20, 2025', initials: 'AC' },
    { id: '#ORD-2054', customer: 'TechDealer Solutions', project: 'HQ Upgrade', amount: '$62,500', status: 'In Production', date: 'Nov 15, 2025', initials: 'TS' },
    { id: '#ORD-2053', customer: 'Urban Living Inc.', project: 'Lobby Refresh', amount: '$112,000', status: 'Ready to Ship', date: 'Oct 30, 2025', initials: 'UL' },
    { id: '#ORD-2051', customer: 'City Builders', project: 'City Center Phase 2', amount: '$120,000', status: 'Order Received', date: 'Jan 05, 2026', initials: 'CB' },
    { id: '#ORD-2049', customer: 'Meridian Group', project: 'Regional Office', amount: '$98,400', status: 'In Transit', date: 'Feb 10, 2026', initials: 'MG' },
];

const QUOTE_COMPARISON: ComparisonField[] = [
    { field: 'Customer Name', category: 'header', docValue: 'Redwood School District', sourceValue: 'Redwood School District', status: 'match' },
    { field: 'PO Reference', category: 'header', docValue: 'PO-2026-042', sourceValue: 'PO-2026-042', status: 'match' },
    { field: 'Ship-To Address', category: 'logistics', docValue: '200 Redwood Blvd, Portland, OR', sourceValue: '200 Redwood Blvd, Portland, OR', status: 'match' },
    { field: 'Line 1: Qty (Classroom Desk 24x48)', category: 'line-item', docValue: '120', sourceValue: '120', status: 'match' },
    { field: 'Line 1: Unit Price', category: 'pricing', docValue: '$485.00', sourceValue: '$485.00', status: 'match' },
    { field: 'Line 2: Qty (Teacher Station 30x60)', category: 'line-item', docValue: '24', sourceValue: '22', status: 'mismatch', autoFixSuggestion: 'Use manufacturer confirmed quantity (22). Quote had pre-order estimate.', confidence: 94, severity: 'medium' },
    { field: 'Line 2: Unit Price', category: 'pricing', docValue: '$1,247.00', sourceValue: '$1,189.00', status: 'mismatch', autoFixSuggestion: 'Apply SPA pricing from Avanto contract #SPA-2025-089. Manufacturer confirmed lower cost.', confidence: 98, severity: 'high' },
    { field: 'Line 3: Finish (Storage Cabinet)', category: 'line-item', docValue: 'Walnut Veneer', sourceValue: 'Walnut Veneer - Natural', status: 'partial', autoFixSuggestion: 'Minor naming variance. Maps to same manufacturer SKU SC-WVN.', confidence: 96, severity: 'low' },
    { field: 'Delivery Date', category: 'logistics', docValue: 'Mar 15, 2026', sourceValue: 'Mar 28, 2026', status: 'partial', autoFixSuggestion: 'Manufacturer lead time shifted +13 days. Within 21-day guardrail — auto-acceptable.', confidence: 88, severity: 'medium' },
    { field: 'Freight Terms', category: 'logistics', docValue: 'FOB Origin', sourceValue: 'FOB Origin', status: 'match' },
    { field: 'Discount Structure', category: 'pricing', docValue: '62% / 5%', sourceValue: '62% / 5%', status: 'match' },
    { field: 'Total Net', category: 'pricing', docValue: '$105,240.00', sourceValue: '$103,890.00', status: 'mismatch', autoFixSuggestion: 'Recalculated based on corrected qty and SPA pricing. Delta: -$1,350.00', confidence: 97, severity: 'high' },
];

const ORDER_COMPARISON: ComparisonField[] = [
    { field: 'Vendor', category: 'header', docValue: 'AutoManfacture Co.', sourceValue: 'AutoManfacture Co.', status: 'match' },
    { field: 'PO Number', category: 'header', docValue: '#ORD-2055', sourceValue: '#ORD-2055', status: 'match' },
    { field: 'Ship-To Address', category: 'logistics', docValue: '450 Commerce Blvd, Suite 300, Austin TX', sourceValue: '450 Commerce Blvd, Suite 300, Austin TX', status: 'match' },
    { field: 'Line 1: Qty (Ergonomic Task Chair)', category: 'line-item', docValue: '20', sourceValue: '18', status: 'mismatch', autoFixSuggestion: 'Manufacturer acknowledged 18 units. 2 units on backorder — expected Apr 10, 2026.', confidence: 95, severity: 'medium' },
    { field: 'Line 1: Unit Price', category: 'pricing', docValue: '$89.00', sourceValue: '$89.00', status: 'match' },
    { field: 'Line 2: Standing Desk 60x30', category: 'line-item', docValue: '15', sourceValue: '15', status: 'match' },
    { field: 'Line 2: Unit Price', category: 'pricing', docValue: '$245.00', sourceValue: '$245.00', status: 'match' },
    { field: 'Line 3: Finish (Monitor Arm)', category: 'line-item', docValue: 'Matte Black', sourceValue: 'Black Matte', status: 'partial', autoFixSuggestion: 'Naming convention difference. Same manufacturer finish code MB-01.', confidence: 97, severity: 'low' },
    { field: 'Line 3: Qty (Monitor Arm)', category: 'line-item', docValue: '8', sourceValue: '6', status: 'mismatch', autoFixSuggestion: 'Manufacturer confirmed 6 units. Shortfall of 2 — contact vendor for availability.', confidence: 92, severity: 'high' },
    { field: 'Estimated Ship Date', category: 'logistics', docValue: 'Mar 10, 2026', sourceValue: 'Mar 18, 2026', status: 'partial', autoFixSuggestion: 'Vendor lead time shifted +8 days. Within tolerance window.', confidence: 90, severity: 'medium' },
    { field: 'Freight Terms', category: 'logistics', docValue: 'FOB Destination', sourceValue: 'FOB Destination', status: 'match' },
    { field: 'Total Net', category: 'pricing', docValue: '$41,150.00', sourceValue: '$40,460.00', status: 'mismatch', autoFixSuggestion: 'Adjusted for qty changes. Delta: -$690.00 (2 chairs + 2 monitor arms).', confidence: 96, severity: 'high' },
];

const CLEAN_COMPARISON: ComparisonField[] = [
    { field: 'Customer Name', category: 'header', docValue: 'Summit Healthcare', sourceValue: 'Summit Healthcare', status: 'match' },
    { field: 'PO Reference', category: 'header', docValue: 'PO-2025-118', sourceValue: 'PO-2025-118', status: 'match' },
    { field: 'Ship-To Address', category: 'logistics', docValue: '900 Medical Dr, Denver, CO', sourceValue: '900 Medical Dr, Denver, CO', status: 'match' },
    { field: 'Line 1: Qty (Exam Table)', category: 'line-item', docValue: '12', sourceValue: '12', status: 'match' },
    { field: 'Line 1: Unit Price', category: 'pricing', docValue: '$2,450.00', sourceValue: '$2,450.00', status: 'match' },
    { field: 'Line 2: Qty (Patient Chair)', category: 'line-item', docValue: '24', sourceValue: '24', status: 'match' },
    { field: 'Line 2: Unit Price', category: 'pricing', docValue: '$890.00', sourceValue: '$890.00', status: 'match' },
    { field: 'Line 3: Qty (Storage Unit)', category: 'line-item', docValue: '8', sourceValue: '8', status: 'match' },
    { field: 'Delivery Date', category: 'logistics', docValue: 'Feb 20, 2026', sourceValue: 'Feb 20, 2026', status: 'match' },
    { field: 'Freight Terms', category: 'logistics', docValue: 'FOB Destination', sourceValue: 'FOB Destination', status: 'match' },
    { field: 'Discount Structure', category: 'pricing', docValue: '55% / 10%', sourceValue: '55% / 10%', status: 'match' },
    { field: 'Total Net', category: 'pricing', docValue: '$68,200.00', sourceValue: '$68,200.00', status: 'match' },
];

// ── Status helpers ─────────────────────────────────────────────

const statusIcon = (s: 'match' | 'mismatch' | 'partial') => {
    if (s === 'match') return <CheckCircleIcon className="w-5 h-5 text-green-500 dark:text-green-400" />;
    if (s === 'mismatch') return <XCircleIcon className="w-5 h-5 text-red-500 dark:text-red-400" />;
    return <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 dark:text-amber-400" />;
};

const statusRowBg = (s: 'match' | 'mismatch' | 'partial') => {
    if (s === 'match') return '';
    if (s === 'mismatch') return 'bg-red-50/40 dark:bg-red-500/5';
    return 'bg-amber-50/40 dark:bg-amber-500/5';
};

const severityColor = (sev?: 'low' | 'medium' | 'high') => {
    if (sev === 'high') return 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-500/5';
    if (sev === 'medium') return 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-500/5';
    return 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-500/5';
};

const severityBadge = (sev?: 'low' | 'medium' | 'high') => {
    if (sev === 'high') return <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400">High</span>;
    if (sev === 'medium') return <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">Medium</span>;
    return <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">Low</span>;
};

// ── Component ──────────────────────────────────────────────────

export default function DocumentConversionModal({ isOpen, onClose, mode, triggerToast }: DocumentConversionModalProps) {
    const [step, setStep] = useState<ConversionStep>('select');
    const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanComplete, setScanComplete] = useState(false);
    const [inconsistencyFixes, setInconsistencyFixes] = useState<Record<number, 'accept' | 'reject'>>({});

    // Config by mode
    const config = useMemo(() => mode === 'quote-to-order'
        ? {
            title: 'Convert Quote to Order',
            sourceLabel: 'Quote',
            targetLabel: 'Purchase Order',
            TargetIcon: ShoppingCartIcon,
            eligibleStatuses: ['Ready', 'Approved'],
            documents: ELIGIBLE_QUOTES,
            comparison: QUOTE_COMPARISON,
            newId: '#ORD-2060',
            newStatus: 'Order Placed',
        }
        : {
            title: 'Convert Order to Acknowledgment',
            sourceLabel: 'Order',
            targetLabel: 'Acknowledgment',
            TargetIcon: ClipboardDocumentCheckIcon,
            eligibleStatuses: ['Ready', 'Order Received'],
            documents: ELIGIBLE_ORDERS,
            comparison: ORDER_COMPARISON,
            newId: 'ACK-8845',
            newStatus: 'Pending',
        }, [mode]);

    // Reset on close
    useEffect(() => {
        if (!isOpen) {
            const t = setTimeout(() => {
                setStep('select');
                setSelectedDoc(null);
                setScanProgress(0);
                setScanComplete(false);
                setInconsistencyFixes({});
            }, 300);
            return () => clearTimeout(t);
        }
    }, [isOpen]);

    // Scanning animation
    useEffect(() => {
        if (step !== 'compare') return;
        setScanProgress(0);
        setScanComplete(false);
        const interval = setInterval(() => {
            setScanProgress(prev => {
                const next = prev + Math.random() * 12 + 6;
                if (next >= 100) {
                    clearInterval(interval);
                    setScanComplete(true);
                    return 100;
                }
                return next;
            });
        }, 180);
        return () => clearInterval(interval);
    }, [step]);

    // Use clean comparison for "Ready" docs, regular comparison for "Approved"/"Order Received"
    const isCleanDoc = selectedDoc?.status === 'Ready';
    const activeComparison = isCleanDoc ? CLEAN_COMPARISON : config.comparison;

    // Auto-advance to confirm for clean docs (no inconsistencies)
    useEffect(() => {
        if (step === 'compare' && scanComplete && isCleanDoc) {
            const t = setTimeout(() => setStep('confirm'), 1200);
            return () => clearTimeout(t);
        }
    }, [step, scanComplete, isCleanDoc]);

    // Derived data
    const inconsistencies = useMemo(() =>
        activeComparison.filter(f => f.status !== 'match'),
        [activeComparison]
    );

    const matchedCount = activeComparison.filter(f => f.status === 'match').length;
    const allDecided = inconsistencies.every((_, i) => inconsistencyFixes[i] !== undefined);
    const acceptedCount = Object.values(inconsistencyFixes).filter(v => v === 'accept').length;

    const adjustedAmount = useMemo(() => {
        const totalField = activeComparison.find(f => f.field === 'Total Net');
        if (!totalField) return selectedDoc?.amount || '';
        return acceptedCount > 0 ? totalField.sourceValue : totalField.docValue;
    }, [activeComparison, acceptedCount, selectedDoc]);

    const handleComplete = () => {
        onClose();
        triggerToast(
            'Conversion Complete',
            `${selectedDoc?.id} successfully converted to ${config.newId}`,
            'success'
        );
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[200]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto scrollbar-minimal">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-background text-left shadow-2xl transition-all border border-border w-full sm:max-w-4xl">
                                {/* ──── Step 1: Select Document ──── */}
                                {step === 'select' && (
                                    <div className="p-6 sm:p-8">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <Dialog.Title as="h3" className="text-xl font-brand font-bold text-foreground mb-1">
                                                    {config.title}
                                                </Dialog.Title>
                                                <p className="text-sm text-muted-foreground">
                                                    Select a {config.sourceLabel.toLowerCase()} to convert. "Ready" documents convert directly. "Approved" documents require validation review.
                                                </p>
                                            </div>
                                            <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Close">
                                                <XMarkIcon className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-minimal pr-1">
                                            {config.documents.map(doc => {
                                                const eligible = config.eligibleStatuses.includes(doc.status);
                                                const selected = selectedDoc?.id === doc.id;
                                                return (
                                                    <button
                                                        key={doc.id}
                                                        onClick={() => eligible && setSelectedDoc(doc)}
                                                        disabled={!eligible}
                                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                                            selected
                                                                ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-2 ring-primary/20'
                                                                : eligible
                                                                    ? 'border-border hover:border-primary/40 hover:shadow-sm bg-card cursor-pointer'
                                                                    : 'border-border bg-muted/30 opacity-50 cursor-not-allowed'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                                                                selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                                            }`}>
                                                                {doc.initials}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-0.5">
                                                                    <span className="text-sm font-bold text-foreground">{doc.id}</span>
                                                                    <span className="text-[10px] text-muted-foreground">-</span>
                                                                    <span className="text-sm text-foreground truncate">{doc.customer}</span>
                                                                </div>
                                                                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                                                                    <span>{doc.project}</span>
                                                                    <span className="text-muted-foreground/50">|</span>
                                                                    <span className="font-semibold text-foreground">{doc.amount}</span>
                                                                    <span className="text-muted-foreground/50">|</span>
                                                                    <span>{doc.date}</span>
                                                                </div>
                                                            </div>
                                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                                                                doc.status === 'Ready'
                                                                    ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
                                                                    : eligible
                                                                        ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                                                                        : 'bg-muted text-muted-foreground'
                                                            }`}>
                                                                {doc.status === 'Ready' ? 'Ready — No Review' : doc.status}
                                                            </span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <button
                                            onClick={() => setStep('compare')}
                                            disabled={!selectedDoc}
                                            className={`w-full mt-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                                                selectedDoc
                                                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'
                                                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                                            }`}
                                        >
                                            Continue to Validation
                                            <ArrowRightIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                {/* ──── Step 2: Compare & Validate ──── */}
                                {step === 'compare' && (
                                    <div className="p-6 sm:p-8">
                                        <div className="flex justify-between items-start mb-5">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => setStep('select')} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Back">
                                                    <ArrowLeftIcon className="w-4 h-4" />
                                                </button>
                                                <div>
                                                    <h3 className="text-lg font-brand font-bold text-foreground">Comparing {selectedDoc?.id}</h3>
                                                    <p className="text-[11px] text-muted-foreground">Against manufacturer database & Avanto ecosystem</p>
                                                </div>
                                            </div>
                                            <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Close">
                                                <XMarkIcon className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* AI Agent Banner */}
                                        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 mb-5 flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
                                                <SparklesIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold text-indigo-900 dark:text-indigo-200">ConversionValidatorAgent</span>
                                                <span className="text-sm text-indigo-700 dark:text-indigo-300">
                                                    {scanComplete
                                                        ? isCleanDoc
                                                            ? ` — All ${matchedCount} fields matched. No inconsistencies — converting directly.`
                                                            : ` — Scan complete. ${matchedCount}/${activeComparison.length} fields matched, ${inconsistencies.length} inconsistencies found.`
                                                        : ` — Scanning ${selectedDoc?.id} against manufacturer database & Avanto ecosystem...`
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        {!scanComplete && (
                                            <div className="mb-6">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[11px] text-muted-foreground">Validating fields...</span>
                                                    <span className="text-[11px] font-bold text-foreground">{Math.min(100, Math.round(scanProgress))}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full transition-all duration-200"
                                                        style={{ width: `${Math.min(100, scanProgress)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Comparison Table */}
                                        {scanComplete && (
                                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                                {/* Summary badges */}
                                                <div className="flex items-center gap-3 mb-4">
                                                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400">
                                                        {matchedCount} Matched
                                                    </span>
                                                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400">
                                                        {inconsistencies.filter(d => d.status === 'mismatch').length} Mismatch
                                                    </span>
                                                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">
                                                        {inconsistencies.filter(d => d.status === 'partial').length} Partial
                                                    </span>
                                                </div>

                                                <div className="border border-border rounded-xl overflow-hidden">
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="bg-muted/50">
                                                                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Field</th>
                                                                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{config.sourceLabel} Value</th>
                                                                <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Source of Truth</th>
                                                                <th className="text-center px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-16">Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-border">
                                                            {activeComparison.map((row, i) => (
                                                                <tr key={i} className={statusRowBg(row.status)}>
                                                                    <td className="px-4 py-2.5 text-[12px] text-foreground font-medium">{row.field}</td>
                                                                    <td className={`px-4 py-2.5 text-[12px] ${row.status === 'mismatch' ? 'text-red-600 dark:text-red-400 line-through' : 'text-foreground'}`}>
                                                                        {row.docValue}
                                                                    </td>
                                                                    <td className={`px-4 py-2.5 text-[12px] ${row.status === 'mismatch' ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-foreground'}`}>
                                                                        {row.sourceValue}
                                                                    </td>
                                                                    <td className="px-4 py-2.5 text-center">{statusIcon(row.status)}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                <button
                                                    onClick={() => setStep('review')}
                                                    className="w-full mt-5 py-3 rounded-xl text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all flex items-center justify-center gap-2"
                                                >
                                                    Review Inconsistencies ({inconsistencies.length})
                                                    <ArrowRightIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ──── Step 3: Review Inconsistencies ──── */}
                                {step === 'review' && (
                                    <div className="p-6 sm:p-8">
                                        <div className="flex justify-between items-start mb-5">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => setStep('compare')} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Back">
                                                    <ArrowLeftIcon className="w-4 h-4" />
                                                </button>
                                                <div>
                                                    <h3 className="text-lg font-brand font-bold text-foreground">Review Inconsistencies</h3>
                                                    <p className="text-[11px] text-muted-foreground">{inconsistencies.length} items require your decision</p>
                                                </div>
                                            </div>
                                            <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Close">
                                                <XMarkIcon className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* KPI Strip */}
                                        <div className="grid grid-cols-4 gap-3 mb-5">
                                            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-800 text-center">
                                                <span className="text-lg font-bold text-green-700 dark:text-green-400">{matchedCount}</span>
                                                <span className="text-[10px] text-green-600 dark:text-green-300 block font-medium">Matched</span>
                                            </div>
                                            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800 text-center">
                                                <span className="text-lg font-bold text-red-700 dark:text-red-400">{inconsistencies.length}</span>
                                                <span className="text-[10px] text-red-600 dark:text-red-300 block font-medium">Inconsistencies</span>
                                            </div>
                                            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-800 text-center">
                                                <span className="text-lg font-bold text-indigo-700 dark:text-indigo-400">{acceptedCount}</span>
                                                <span className="text-[10px] text-indigo-600 dark:text-indigo-300 block font-medium">Accepted</span>
                                            </div>
                                            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-800 text-center">
                                                <span className="text-lg font-bold text-blue-700 dark:text-blue-400">
                                                    {Math.round(inconsistencies.reduce((sum, d) => sum + (d.confidence || 90), 0) / inconsistencies.length)}%
                                                </span>
                                                <span className="text-[10px] text-blue-600 dark:text-blue-300 block font-medium">Avg Confidence</span>
                                            </div>
                                        </div>

                                        {/* Inconsistency Cards */}
                                        <div className="space-y-3 max-h-[380px] overflow-y-auto scrollbar-minimal pr-1">
                                            {inconsistencies.map((disc, i) => {
                                                const fixed = inconsistencyFixes[i];
                                                return (
                                                    <div
                                                        key={i}
                                                        className={`p-4 rounded-xl border-2 transition-all ${
                                                            fixed === 'accept'
                                                                ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-500/5'
                                                                : fixed === 'reject'
                                                                    ? 'border-border bg-muted/30'
                                                                    : severityColor(disc.severity)
                                                        }`}
                                                    >
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="flex items-center gap-2">
                                                                {fixed === 'accept'
                                                                    ? <CheckCircleIcon className="w-5 h-5 text-green-500 dark:text-green-400" />
                                                                    : fixed === 'reject'
                                                                        ? <XCircleIcon className="w-5 h-5 text-muted-foreground" />
                                                                        : statusIcon(disc.status)
                                                                }
                                                                <span className="text-sm font-bold text-foreground">{disc.field}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {severityBadge(disc.severity)}
                                                                {disc.confidence && (
                                                                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400">
                                                                        {disc.confidence}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Values comparison */}
                                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                                            <div className="p-2.5 rounded-lg bg-card border border-border">
                                                                <span className="text-[9px] font-semibold text-muted-foreground uppercase block mb-1">{config.sourceLabel}</span>
                                                                <span className={`text-sm font-medium ${fixed === 'accept' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                                                    {disc.docValue}
                                                                </span>
                                                            </div>
                                                            <div className="p-2.5 rounded-lg bg-card border border-border">
                                                                <span className="text-[9px] font-semibold text-muted-foreground uppercase block mb-1">Source of Truth</span>
                                                                <span className={`text-sm font-medium ${fixed === 'accept' ? 'text-green-600 dark:text-green-400 font-bold' : 'text-foreground'}`}>
                                                                    {disc.sourceValue}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* AI Suggestion */}
                                                        {disc.autoFixSuggestion && (
                                                            <div className="p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 mb-3 flex items-start gap-2">
                                                                <SparklesIcon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 mt-0.5 shrink-0" />
                                                                <span className="text-[11px] text-indigo-700 dark:text-indigo-300">{disc.autoFixSuggestion}</span>
                                                            </div>
                                                        )}

                                                        {/* Action buttons */}
                                                        {fixed === undefined && (
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => setInconsistencyFixes(prev => ({ ...prev, [i]: 'accept' }))}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors"
                                                                >
                                                                    <CheckCircleIcon className="w-3.5 h-3.5" />
                                                                    Accept Fix
                                                                </button>
                                                                <button
                                                                    onClick={() => setInconsistencyFixes(prev => ({ ...prev, [i]: 'reject' }))}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
                                                                >
                                                                    Keep Original
                                                                </button>
                                                            </div>
                                                        )}
                                                        {fixed !== undefined && (
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-[11px] font-semibold ${fixed === 'accept' ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                                                                    {fixed === 'accept' ? 'Fix applied' : 'Original kept'}
                                                                </span>
                                                                <button
                                                                    onClick={() => setInconsistencyFixes(prev => {
                                                                        const next = { ...prev };
                                                                        delete next[i];
                                                                        return next;
                                                                    })}
                                                                    className="text-[10px] text-muted-foreground hover:text-foreground underline transition-colors"
                                                                >
                                                                    Undo
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <button
                                            onClick={() => setStep('confirm')}
                                            disabled={!allDecided}
                                            className={`w-full mt-5 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                                                allDecided
                                                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'
                                                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                                            }`}
                                        >
                                            Confirm & Convert
                                            <ArrowRightIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                {/* ──── Step 4: Confirmation ──── */}
                                {step === 'confirm' && (
                                    <div className="p-6 sm:p-8 text-center">
                                        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Close">
                                            <XMarkIcon className="w-5 h-5" />
                                        </button>

                                        {/* Success icon */}
                                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                                            <CheckCircleIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
                                        </div>

                                        <h3 className="text-xl font-brand font-bold text-foreground mb-1">Conversion Complete</h3>
                                        <p className="text-sm text-muted-foreground mb-6">
                                            {selectedDoc?.id} has been successfully converted to {config.targetLabel}
                                        </p>

                                        {/* Conversion Summary Card */}
                                        <div className="bg-card border border-border rounded-xl p-5 mb-5 text-left max-w-md mx-auto">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-muted-foreground">{selectedDoc?.id}</span>
                                                    <ArrowRightIcon className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-bold text-green-600 dark:text-green-400">{config.newId}</span>
                                                </div>
                                                <config.TargetIcon className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                            <div className="space-y-2 text-[12px]">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Type</span>
                                                    <span className="font-semibold text-foreground">{config.targetLabel}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Customer</span>
                                                    <span className="font-semibold text-foreground">{selectedDoc?.customer}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Project</span>
                                                    <span className="font-semibold text-foreground">{selectedDoc?.project}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Amount</span>
                                                    <span className="font-semibold text-foreground">{adjustedAmount}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Status</span>
                                                    <span className="font-semibold text-green-600 dark:text-green-400">{config.newStatus}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Created</span>
                                                    <span className="font-semibold text-foreground">Mar 17, 2026</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* AI Summary */}
                                        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 mb-6 flex items-start gap-3 text-left max-w-md mx-auto">
                                            <SparklesIcon className="w-4 h-4 text-indigo-500 dark:text-indigo-400 mt-0.5 shrink-0" />
                                            <span className="text-[11px] text-indigo-700 dark:text-indigo-300">
                                                {isCleanDoc
                                                    ? `All ${matchedCount} fields validated — zero inconsistencies. Direct conversion completed and synced to eManage ecosystem.`
                                                    : `${inconsistencies.length} inconsistencies resolved. ${acceptedCount} auto-fixed, ${inconsistencies.length - acceptedCount} kept as original. All changes synced to eManage ecosystem.`
                                                }
                                            </span>
                                        </div>

                                        <button
                                            onClick={handleComplete}
                                            className="w-full max-w-md py-3 rounded-xl text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all"
                                        >
                                            Done
                                        </button>
                                    </div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
