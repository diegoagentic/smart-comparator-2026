import { useState, Fragment } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel, DialogTitle } from '@headlessui/react'
import { X, AlertTriangle, ChevronDown, ChevronUp, Check, Pencil, Sparkles, Info, ArrowRight } from 'lucide-react'

interface ResolveInconsistencyModalProps {
    isOpen: boolean
    onClose: () => void
    document: {
        id: string
        name: string
        vendor: string
        inconsistencyCount: number
    } | null
    onResolve?: (docId: string) => void
}

const MOCK_ITEMS = [
    {
        ackNumber: 'Acknowledgement-9237',
        vendor: 'AIS',
        linesScanned: 50,
        totalAmount: '$65,439.09',
        lineNumber: 41,
        itemName: 'Steel Hinge Model S-45',
        poSpec: 'Unit Price: $3.50 ea',
        ackStatus: 'Unit Price Missing',
        fields: [
            { name: 'Quantity', value: '150', isMissing: false },
            { name: 'Unit Price', value: '0.00', isMissing: true, aiSuggestion: '3.50' },
        ],
        total: '0.00',
    },
    {
        ackNumber: 'Acknowledgement-7264',
        vendor: 'AIS',
        linesScanned: 50,
        totalAmount: '$65,439.09',
        lineNumber: 28,
        itemName: 'Drawer Slide Kit DS-200',
        poSpec: 'Quantity: 75',
        ackStatus: 'Quantity Mismatch',
        fields: [
            { name: 'Quantity', value: '60', isMissing: false, aiSuggestion: '75' },
            { name: 'Unit Price', value: '12.80', isMissing: false },
        ],
        total: '768.00',
    },
    {
        ackNumber: 'Acknowledgement-1153',
        vendor: 'AIS',
        linesScanned: 50,
        totalAmount: '$65,439.09',
        lineNumber: 15,
        itemName: 'Cabinet Lock Assembly CL-100',
        poSpec: 'SKU: CL-100-CHR',
        ackStatus: 'SKU Missing',
        fields: [
            { name: 'SKU', value: '', isMissing: true, aiSuggestion: 'CL-100-CHR' },
            { name: 'Quantity', value: '200', isMissing: false },
            { name: 'Unit Price', value: '4.25', isMissing: false },
        ],
        total: '850.00',
    },
]

export default function ResolveInconsistencyModal({ isOpen, onClose, document, onResolve }: ResolveInconsistencyModalProps) {
    const [expandedItem, setExpandedItem] = useState<number>(0)
    const [resolvedItems, setResolvedItems] = useState<Set<number>>(new Set())
    const [showWarning, setShowWarning] = useState(true)

    const handleAccept = (idx: number) => {
        setResolvedItems(prev => new Set([...prev, idx]))
    }

    const allResolved = resolvedItems.size === MOCK_ITEMS.length

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <DialogPanel className="w-full max-w-[640px] transform overflow-hidden rounded-2xl bg-card text-left shadow-2xl transition-all border border-border">

                                {/* Header */}
                                <div className="px-6 pt-6 pb-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <DialogTitle as="h3" className="text-xl font-bold text-foreground">
                                                Resolve Item Inconsistency
                                            </DialogTitle>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Review the issue and confirm the correct information
                                            </p>
                                        </div>
                                        <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-muted-foreground dark:hover:text-zinc-300 hover:bg-muted transition-colors" title="Close">
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Scrollable content — thin scrollbar */}
                                <div className="max-h-[65vh] overflow-y-auto px-6 pb-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d4d4d8 transparent' }}>

                                    {/* Warning Banner — pink/salmon like Figma */}
                                    {showWarning && (
                                        <div className="flex items-start gap-3 p-3 mb-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
                                            <Info className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-red-700 dark:text-red-400">Warning</p>
                                                <p className="text-xs text-red-600/70 dark:text-red-400/70">Our AI couldn't confidently extract all data for these items.</p>
                                            </div>
                                            <button onClick={() => setShowWarning(false)} className="p-0.5 text-red-400 hover:text-red-600" title="Dismiss"><X className="h-4 w-4" /></button>
                                        </div>
                                    )}

                                    {/* Inconsistency Items */}
                                    <div className="space-y-3 pb-4">
                                        {MOCK_ITEMS.map((item, idx) => {
                                            const isExpanded = expandedItem === idx
                                            const isResolved = resolvedItems.has(idx)

                                            return (
                                                <div
                                                    key={idx}
                                                    className={`border rounded-xl overflow-hidden transition-all ${
                                                        isResolved
                                                            ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-500/5'
                                                            : 'border-red-300 dark:border-red-700 bg-red-50/30 dark:bg-red-500/5'
                                                    }`}
                                                >
                                                    {/* Accordion Header */}
                                                    <button
                                                        onClick={() => setExpandedItem(isExpanded ? -1 : idx)}
                                                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 dark:hover:bg-white/5 transition-colors"
                                                    >
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-bold text-foreground">{item.ackNumber} — {item.vendor}</span>
                                                                {!isResolved && (
                                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500 text-white flex items-center gap-1">
                                                                        <AlertTriangle className="h-2.5 w-2.5" /> Inconsistency
                                                                    </span>
                                                                )}
                                                                {isResolved && (
                                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-500 text-white flex items-center gap-1">
                                                                        <Check className="h-2.5 w-2.5" /> Resolved
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-0.5">{item.linesScanned} lines scanned | {item.totalAmount}</p>
                                                        </div>
                                                        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                                                    </button>

                                                    {/* Expanded Content */}
                                                    {isExpanded && !isResolved && (
                                                        <div className="px-4 pb-4 space-y-3">
                                                            {/* Line detail — red highlight */}
                                                            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-3">
                                                                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                                                                    Line {item.lineNumber}: {item.itemName}
                                                                </p>
                                                                <div className="flex justify-between mt-1 text-xs">
                                                                    <span className="text-muted-foreground">PO Spec: <strong className="text-foreground">{item.poSpec}</strong></span>
                                                                    <span className="text-red-600 dark:text-red-400 font-medium">Acknowledgement: <strong>{item.ackStatus}</strong></span>
                                                                </div>
                                                            </div>

                                                            {/* Fields */}
                                                            <div className="grid grid-cols-2 gap-3">
                                                                {item.fields.map((field, fIdx) => (
                                                                    <div key={fIdx} className="space-y-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <label className={`text-xs font-medium ${field.isMissing ? 'text-red-500' : 'text-muted-foreground'}`}>
                                                                                {field.name} {field.isMissing && <span className="text-red-500 italic">(Missing)</span>}
                                                                            </label>
                                                                            {field.aiSuggestion && (
                                                                                <span className="text-[10px] text-ai font-medium flex items-center gap-0.5">
                                                                                    <Sparkles className="h-2.5 w-2.5" /> AI Suggestion
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <div className={`flex-1 px-3 py-2 rounded-lg text-sm border ${
                                                                                field.isMissing
                                                                                    ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-500/10 text-foreground'
                                                                                    : 'border-border bg-muted dark:bg-zinc-800 text-foreground'
                                                                            }`}>
                                                                                {field.aiSuggestion && field.isMissing ? (
                                                                                    <span className="flex items-center gap-1.5">
                                                                                        <span className="text-muted-foreground line-through text-xs">$ {field.value}</span>
                                                                                        <span className="text-muted-foreground">→</span>
                                                                                        <span className="font-semibold">$ {field.aiSuggestion}</span>
                                                                                    </span>
                                                                                ) : (
                                                                                    field.value
                                                                                )}
                                                                            </div>
                                                                            {field.aiSuggestion && (
                                                                                <div className="flex gap-1 shrink-0">
                                                                                    <button
                                                                                        onClick={() => handleAccept(idx)}
                                                                                        className="flex items-center gap-1 px-2 py-1.5 text-[11px] font-semibold bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                                                                                    >
                                                                                        <Check className="h-3 w-3" /> Accept
                                                                                    </button>
                                                                                    <button className="flex items-center gap-1 px-2 py-1.5 text-[11px] font-semibold border border-border text-muted-foreground dark:text-zinc-300 rounded-md hover:bg-muted transition-colors">
                                                                                        <Pencil className="h-3 w-3" /> Edit
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        {field.isMissing && <p className="text-[10px] text-red-500 italic">This field is required</p>}
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {/* Total */}
                                                            <div className="space-y-1">
                                                                <label className="text-xs font-medium text-muted-foreground">Total</label>
                                                                <div className="px-3 py-2 rounded-lg text-sm border border-border bg-muted dark:bg-zinc-800 text-foreground">
                                                                    $ {item.total}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Footer — sticky */}
                                <div className="px-6 py-4 border-t border-border bg-muted flex items-center justify-between">
                                    <button
                                        onClick={onClose}
                                        className="text-sm font-bold text-muted-foreground hover:text-zinc-900 dark:text-muted-foreground dark:hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => { onResolve?.(document?.id || ''); onClose(); }}
                                        disabled={!allResolved}
                                        className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all active:scale-[0.97] ${
                                            allResolved
                                                ? 'bg-brand-300 dark:bg-brand-500 text-zinc-900 hover:bg-brand-400 dark:hover:bg-brand-600 shadow-sm'
                                                : 'bg-muted text-muted-foreground dark:text-muted-foreground cursor-not-allowed'
                                        }`}
                                    >
                                        Resolve Inconsistencies
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
