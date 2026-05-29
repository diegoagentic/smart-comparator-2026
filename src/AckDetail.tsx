import {
    ChevronRightIcon, MagnifyingGlassIcon, FunnelIcon, ArrowDownTrayIcon,
    PlusIcon, CheckCircleIcon, DocumentTextIcon, CubeIcon,
    ExclamationTriangleIcon, ChevronDownIcon, ChevronUpIcon, EllipsisHorizontalIcon, SunIcon, MoonIcon,
    XMarkIcon, HomeIcon, Squares2X2Icon, ArrowTrendingUpIcon, ClipboardDocumentListIcon,
    UserIcon, CalendarIcon, ChartBarIcon, ExclamationCircleIcon, ArrowRightOnRectangleIcon, PencilSquareIcon, EnvelopeIcon, SparklesIcon, ArrowPathIcon,
    PaperAirplaneIcon, ChatBubbleLeftRightIcon, PhotoIcon, PaperClipIcon, ClockIcon, CheckIcon, PencilIcon, DocumentChartBarIcon
} from '@heroicons/react/24/outline'
import { Transition, TransitionChild, Popover, PopoverButton, PopoverPanel, Tab, TabGroup, TabList, TabPanel, TabPanels, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { Fragment } from 'react'
import { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useTheme } from 'strata-design-system'
import { useTenant } from './TenantContext'
import Navbar from './components/Navbar'
import Breadcrumbs from './components/Breadcrumbs'
import { ACKInputsTab } from './components/InputsTab'

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs))
}

const items = [
    { id: "T-RCR306029HLG2", name: "TBL, REC, 30Dx60Wx29H", category: "Tables", tag: "A", qtyOrd: 4, qtyShip: 4, qtyBO: 0, listPrice: 1261.00, discPct: 62.0, netPrice: 479.18, amount: 1916.72, configs: ["Finish: LG2-Loft Gray", "Edge: SE-Straight Edge"], status: "Confirmed", statusColor: "bg-zinc-100 text-muted-foreground" },
    { id: "X-BBFPFS182812", name: "CBX Full Depth BBF Ped", category: "Storage", tag: "A", qtyOrd: 4, qtyShip: 4, qtyBO: 0, listPrice: 1048.00, discPct: 62.0, netPrice: 398.24, amount: 1592.96, configs: ["Finish: LG2-Loft Gray", "Lock: KA-Keyed Alike"], status: "Confirmed", statusColor: "bg-zinc-100 text-muted-foreground" },
    { id: "W-WS3072", name: "WORKSURFACE RECT 30Dx72W", category: "Worksurfaces", tag: "B", qtyOrd: 6, qtyShip: 6, qtyBO: 0, listPrice: 656.00, discPct: 62.0, netPrice: 249.28, amount: 1495.68, configs: ["Finish: LG2-Loft Gray", "Edge: SE-Straight Edge"], status: "Confirmed", statusColor: "bg-zinc-100 text-muted-foreground" },
    { id: "S-LATJJ2D36", name: 'LATERAL FILE 2 DRAWER 36"', category: "Storage", tag: "C", qtyOrd: 3, qtyShip: 3, qtyBO: 0, listPrice: 1492.00, discPct: 62.0, netPrice: 566.96, amount: 1700.88, configs: ["Finish: LG2-Loft Gray", "Lock: KA-Keyed Alike"], status: "Confirmed", statusColor: "bg-zinc-100 text-muted-foreground" },
    { id: "F-SSC346030C", name: 'LB LOUNGE 2 SEAT 34"H', category: "Seating", tag: "D", qtyOrd: 2, qtyShip: 0, qtyBO: 2, listPrice: 4836.00, discPct: 58.0, netPrice: 2031.12, amount: 4062.24, configs: ["Fabric: CF-6036 Ocean Blue", "Finish: LG2-Loft Gray"], status: "Exception: Finish", statusColor: "bg-amber-50 text-amber-700 ring-amber-600/20", aiStatus: "warning" },
    { id: "7730", name: "AUBURN GRAY CONFERENCE CHAIR", category: "Seating", tag: "D", qtyOrd: 12, qtyShip: 12, qtyBO: 0, listPrice: 1048.00, discPct: 55.0, netPrice: 471.60, amount: 5659.20, configs: ["Fabric: GR-5505 Charcoal", "Arms: ADJ-Adjustable"], status: "Confirmed", statusColor: "bg-zinc-100 text-muted-foreground" },
    { id: "X-LTD661218L", name: "CBX Triple Door Locker", category: "Storage", tag: "E", qtyOrd: 8, qtyShip: 6, qtyBO: 2, listPrice: 1836.00, discPct: 62.0, netPrice: 697.68, amount: 5581.44, configs: ["Finish: LG2-Loft Gray", "Lock: KA-Keyed Alike", "Shelf: 1-One Adjustable"], status: "Exception: Date", statusColor: "bg-amber-50 text-amber-700 ring-amber-600/20", aiStatus: "warning" },
    { id: "P-PN60HBF", name: "PANEL 60Hx48W FABRIC BOTH", category: "Panels", tag: "F", qtyOrd: 10, qtyShip: 10, qtyBO: 0, listPrice: 892.00, discPct: 62.0, netPrice: 338.96, amount: 3389.60, configs: ["Fabric: CF-6036 Ocean Blue", "Frame: LG2-Loft Gray"], status: "Confirmed", statusColor: "bg-zinc-100 text-muted-foreground" },
]

interface Message {
    id: number | string;
    sender: string;
    avatar: string;
    content: React.ReactNode;
    time: string;
    type: 'system' | 'ai' | 'user' | 'action_processing' | 'action_success';
}

const InconsistencyResolutionFlow = () => {
    const { currentStep, nextStep } = ({ isDemoActive: false, currentStep: null, isSidebarCollapsed: false } as any)
    const [status, setStatus] = useState<'initial' | 'requesting' | 'pending' | 'approved' | 'sending' | 'sent'>('initial')
    const [requestText, setRequestText] = useState('')
    const [shipmentResolution, setShipmentResolution] = useState('accept')

    const resolutions = [
        { id: 'accept', label: 'Accept new date (Nov 27, 2025)' },
        { id: 'expedite', label: 'Expedite Shipping (Nov 20, 2025)' },
        { id: 'cancel', label: 'Cancel Backordered Item' }
    ]

    const handleRequest = () => {
        setStatus('pending')
        setTimeout(() => setStatus('approved'), 3000)
    }

    const handleSendUpdate = () => {
        setStatus('sending')
        setTimeout(() => {
            setStatus('sent')
            if (currentStep?.id === '2.3') {
                setTimeout(nextStep, 2000)
            }
        }, 1500)
    }

    if (status === 'initial') {
        return (
            <div data-demo-target="expert-ack-fix" className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium tracking-tight">
                    <SparklesIcon className="w-5 h-5 text-primary" />
                    Found 2 inconsistencies against PO #ORD-2055.
                </div>

                {/* AI Recommendation Banner */}
                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-start gap-3">
                    <SparklesIcon className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                    <div className="flex-1">
                        <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-1">AI Analysis Complete — InconsistencyResolverAgent pre-analyzed both exceptions</p>
                        <div className="flex gap-4 mt-2">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-indigo-600 dark:text-indigo-400">Exception 1:</span>
                                <span className="text-xs font-medium text-ai">AI</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-indigo-600 dark:text-indigo-400">Exception 2:</span>
                                <span className="text-xs font-medium text-ai">AI</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Side-by-Side Comparison UI for Delta 1 */}
                <div className="border border-border/50 rounded-xl overflow-hidden bg-card/50 my-2">
                    <div className="px-3 py-2 bg-muted/30 border-b border-border text-xs font-bold text-foreground flex items-center gap-2">
                        <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
                        Exception 1: Finish Backordered / Substitution Proposed
                    </div>
                    <div className="p-3 grid grid-cols-2 gap-4 text-xs">
                        <div>
                            <span className="block text-[10px] uppercase text-muted-foreground font-semibold mb-1">Original PO (SKU-OFF-2025-003)</span>
                            <div className="bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 p-2 rounded border border-red-100 dark:border-red-900/30 line-through">
                                Finish: Fabric / Navy
                            </div>
                        </div>
                        <div>
                            <span className="block text-[10px] uppercase text-muted-foreground font-semibold mb-1">Manufacturer Acknowledgement</span>
                            <div className="bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 p-2 rounded border border-green-100 dark:border-green-900/30 flex items-center justify-between">
                                <span>Finish: Fabric / Azure</span>
                                <span className="bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 px-1.5 py-0.5 rounded text-[9px] font-bold">IN STOCK</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Note for Exception 1 */}
                <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-500/5 border border-green-200 dark:border-green-800 -mt-1">
                    <SparklesIcon className="w-3.5 h-3.5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                    <span className="text-[10px] text-green-700 dark:text-green-400">Azure is catalog-equivalent to Navy. Same dimensions, price ($89/ea), and lead time. Confidence: 91%</span>
                </div>

                {/* Side-by-Side Comparison UI for Delta 2 */}
                <div className="border border-border/50 rounded-xl overflow-hidden bg-card/50 mb-2">
                    <div className="px-3 py-2 bg-muted/30 border-b border-border text-xs font-bold text-foreground flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-amber-500" />
                        Exception 2: Ship Date Slipped
                    </div>
                    <div className="p-3 grid grid-cols-2 gap-4 text-xs">
                        <div>
                            <span className="block text-[10px] uppercase text-muted-foreground font-semibold mb-1">Original PO (SKU-OFF-2025-006)</span>
                            <div className="bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 p-2 rounded border border-red-100 dark:border-red-900/30 line-through">
                                Ship Date: Nov 15, 2025
                            </div>
                        </div>
                        <div>
                            <span className="block text-[10px] uppercase text-muted-foreground font-semibold mb-1">Manufacturer Acknowledgement</span>
                            <div className="bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 p-2 rounded border border-amber-100 dark:border-amber-900/30 flex items-center justify-between">
                                <span>Ship Date: Nov 27, 2025</span>
                                <span className="text-amber-600 dark:text-amber-400 font-bold text-[10px]">+12 Days</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Note for Exception 2 */}
                <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-800 -mt-1">
                    <SparklesIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <span className="text-[10px] text-amber-700 dark:text-amber-400">12-day slip impacts project timeline. Expedite available at +$800. Consider alternative vendor for faster delivery. Confidence: 76%</span>
                </div>

                <div className="bg-muted/30 p-3 rounded-lg border border-border mt-2 mb-2">
                    <label className="block text-xs font-semibold text-foreground mb-2">Select Resolution for Ship Date Slip:</label>
                    <select
                        className="w-full text-sm p-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-card text-foreground focus:ring-2 ring-primary outline-none"
                        value={shipmentResolution}
                        onChange={(e) => setShipmentResolution(e.target.value)}
                    >
                        {resolutions.map(r => (
                            <option key={r.id} value={r.id}>{r.label}</option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-2 mt-1">
                    <button
                        onClick={handleRequest}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary text-zinc-900 hover:bg-primary/90 hover:shadow-md text-xs font-bold rounded-lg transition-all"
                    >
                        <PaperAirplaneIcon className="w-4 h-4" /> Send Request
                    </button>
                    <button
                        onClick={() => setStatus('requesting')}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 border border-border text-muted-foreground dark:text-zinc-300 text-xs font-medium rounded-lg hover:bg-muted transition-colors"
                    >
                        <PencilIcon className="w-3.5 h-3.5" /> Request Revisions
                    </button>
                </div>
            </div>
        )
    }

    if (status === 'requesting') {
        return (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
                <p className="text-sm font-medium text-foreground">Describe required changes:</p>
                <textarea
                    className="w-full text-sm p-3 rounded-lg border border-border bg-card text-foreground focus:ring-2 ring-primary outline-none transition-all placeholder:text-muted-foreground"
                    rows={3}
                    placeholder="E.g., Update weight for ORD-2054 to 48kg..."
                    value={requestText}
                    onChange={(e) => setRequestText(e.target.value)}
                />
                <div className="flex justify-between items-center">
                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                        <PaperClipIcon className="w-4 h-4" /> Attach File
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setStatus('initial')}
                            className="px-3 py-1.5 text-xs text-muted-foreground hover:text-zinc-900 dark:text-muted-foreground dark:hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleRequest}
                            className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 shadow-sm transition-colors"
                        >
                            Submit Request
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (status === 'pending') {
        return (
            <div className="flex flex-col gap-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-zinc-900 dark:text-primary">
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    <span>Requesting approval from Logistics Manager...</span>
                </div>
            </div>
        )
    }

    if (status === 'approved' || status === 'sending' || status === 'sent') {
        return (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-start gap-2 text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-100 dark:border-green-900/30">
                    <CheckCircleIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                        <p className="text-foreground font-bold mb-1">Exceptions approved. Records updated.</p>
                        <p className="text-muted-foreground">The Delivery Date has been updated to <span className="font-bold underline decoration-green-300 underline-offset-2">{shipmentResolution === 'expedite' ? 'Nov 20, 2025' : shipmentResolution === 'cancel' ? 'N/A' : 'Nov 27, 2025'}</span>.</p>
                    </div>
                </div>

                <div className="bg-card/50 rounded-xl border border-border/50 overflow-hidden shadow-sm">
                    {status === 'sent' ? (
                        <div className="p-6 flex flex-col items-center justify-center gap-2 text-center text-foreground animate-in zoom-in duration-300">
                            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                                <PaperAirplaneIcon className="h-5 w-5" />
                            </div>
                            <p className="font-bold">Client Update Sent</p>
                            <p className="text-xs text-muted-foreground max-w-[280px]">The client has been notified of the adjustments and new estimated delivery date.</p>
                        </div>
                    ) : status === 'sending' ? (
                        <div className="p-10 flex flex-col items-center justify-center gap-3 animate-in fade-in">
                            <ArrowPathIcon className="w-6 h-6 animate-spin text-primary" />
                            <p className="text-sm font-medium text-muted-foreground">Sending Client Update...</p>
                        </div>
                    ) : (
                        <>
                            <div className="px-3 py-2 bg-muted/30 border-b border-border flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                                    <DocumentTextIcon className="w-4 h-4 text-primary" />
                                    Auto-Drafted Client Update
                                </div>
                                <span className="bg-primary/10 text-primary-foreground px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide">Ready to Send</span>
                            </div>
                            <div className="p-3 text-xs text-muted-foreground space-y-2">
                                <p><span className="font-semibold text-foreground">To:</span> client@automanufacture.com</p>
                                <p><span className="font-semibold text-foreground">Subject:</span> Update regarding your recent order #ORD-2055</p>
                                <div className="p-3 bg-muted/50 rounded border border-zinc-100 dark:border-zinc-800 font-serif leading-relaxed italic text-muted-foreground">
                                    "Hi Team, just a quick update on Order #ORD-2055. The manufacturer noted that the Navy fabric for your Conference Room Chairs is currently backordered. We've proactively substituted it with the identical fabric in 'Azure', which is in stock, to ensure no delays. {shipmentResolution === 'expedite' ? "We've also upgraded the shipping to expedite the order, and your estimated ship date is now Nov 20, 2025." : shipmentResolution === 'accept' ? "Also, please note your estimated ship date has been updated to Nov 27, 2025." : "We've removed the backordered Lounge Chair from the order as it was severely delayed."} Let us know if you have any questions!"
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 border border-border hover:bg-muted text-foreground text-xs font-medium rounded transition-all">
                                        <PencilSquareIcon className="w-3.5 h-3.5" /> Edit Draft
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="bg-muted dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/10 p-3 flex items-center gap-3">
                    <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400">
                        <DocumentTextIcon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">ACK_Revised_ORD-2055.pdf</p>
                        <p className="text-xs text-muted-foreground">Updated just now</p>
                    </div>
                </div>
            </div>
        )
    }

    return null
}

const InconsistencyActionCard = ({ msg }: { msg: Message }) => {
    const [isRequesting, setIsRequesting] = useState(false)
    const [requestText, setRequestText] = useState('')
    const [status, setStatus] = useState<'initial' | 'pending' | 'approved'>('initial')

    const handleSubmit = () => {
        setStatus('pending')
        setTimeout(() => {
            setStatus('approved')
            setIsRequesting(false)
        }, 2000)
    }

    if (status === 'pending') {
        return (
            <div className={cn(
                "rounded-2xl p-4 shadow-sm bg-green-50 dark:bg-green-900/20 text-foreground border border-green-100 dark:border-green-800"
            )}>
                <div className="flex items-center gap-2">
                    <ArrowPathIcon className="h-5 w-5 text-green-600 dark:text-green-400 animate-spin" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">Requesting approval from Logistics Manager...</span>
                </div>
            </div>
        )
    }

    if (status === 'approved') {
        return (
            <div className={cn(
                "rounded-2xl p-4 shadow-sm bg-green-50 dark:bg-green-900/20 text-foreground border border-green-100 dark:border-green-800"
            )}>
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-green-700 dark:text-green-400">{msg.sender}</span>
                    <span className="text-xs text-muted-foreground">{msg.time}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">Action Updated</span>
                </div>
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium mb-3">
                    <CheckCircleIcon className="h-5 w-5" />
                    <p>Changes approved. PO updated.</p>
                </div>
                <div className="flex items-center gap-3 bg-card/50 p-3 rounded-xl border border-green-200 dark:border-green-800/50 shadow-sm">
                    <div className="h-10 w-10 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center border border-red-100 dark:border-red-800/30">
                        <DocumentTextIcon className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">PO_Revised_Final.pdf</p>
                        <p className="text-xs text-muted-foreground">2.4 MB • Generated just now</p>
                    </div>
                    <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-muted-foreground transition-colors">
                        <ArrowDownTrayIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className={cn(
            "rounded-2xl p-4 shadow-sm transition-all duration-300",
            isRequesting ? "ring-2 ring-indigo-500/20 bg-card" : "bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800"
        )}>
            {!isRequesting ? (
                <>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-green-700 dark:text-green-400">{msg.sender}</span>
                        <span className="text-xs text-muted-foreground">{msg.time}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">Action Completed</span>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground">{msg.content}</p>

                    <div className="mt-3 space-y-3">
                        {/* PDF File */}
                        <div className="flex items-center gap-3 bg-card/50 p-3 rounded-xl border border-green-200 dark:border-green-800/50 shadow-sm">
                            <div className="h-10 w-10 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center border border-red-100 dark:border-red-800/30">
                                <DocumentTextIcon className="h-5 w-5 text-red-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">PO_ORD-2055_Final.pdf</p>
                                <p className="text-xs text-muted-foreground">2.4 MB • Generated just now</p>
                            </div>
                            <button className="p-2 hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary dark:hover:text-primary-foreground rounded-lg text-muted-foreground transition-colors group">
                                <ArrowDownTrayIcon className="h-5 w-5 group-hover:text-zinc-900" />
                            </button>
                        </div>

                        {/* Attention Selection */}
                        <div className="pl-4 border-l-4 border-amber-500 py-2 my-4">
                            <div className="flex items-start gap-3">
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        <ExclamationTriangleIcon className="h-4 w-4 text-amber-500" />
                                        Attention Needed
                                    </p>
                                    <p className="text-sm text-zinc-900 dark:text-zinc-300 mt-1">
                                        Inconsistency detected for <span className="font-semibold text-foreground">SKU-OFF-2025-003</span>:
                                    </p>
                                    <div className="mt-2 flex items-center gap-4 text-xs font-medium">
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground uppercase tracking-wider text-[10px]">Warehouse</span>
                                            <span className="text-foreground font-mono text-sm bg-muted px-1.5 py-0.5 rounded">42</span>
                                        </div>
                                        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700"></div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground uppercase tracking-wider text-[10px]">Local</span>
                                            <span className="text-foreground font-mono text-sm bg-muted px-1.5 py-0.5 rounded">35</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-2">
                            <button className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold rounded-lg shadow-sm transition-colors">
                                Sync Database
                            </button>
                            <button className="px-4 py-2 bg-white dark:bg-transparent border border-border text-muted-foreground hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary dark:hover:text-primary-foreground text-xs font-medium rounded-lg transition-colors">
                                Resolve Manually
                            </button>
                            <button
                                onClick={() => setIsRequesting(true)}
                                className="px-3 py-2 text-muted-foreground hover:text-zinc-900 dark:hover:text-primary-foreground hover:bg-primary dark:hover:bg-primary rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ml-auto group"
                            >
                                <PencilIcon className="w-3.5 h-3.5" />
                                Request Changes
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-foreground">Describe required changes:</h4>
                        <button onClick={() => setIsRequesting(false)} className="text-muted-foreground hover:text-muted-foreground dark:hover:text-zinc-200">
                            <span className="sr-only">Close</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <textarea
                        className="w-full text-sm bg-muted dark:bg-zinc-800 border-0 rounded-lg p-3 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="E.g., Update weight for ORD-2054 to 48kg..."
                        rows={3}
                        autoFocus
                        value={requestText}
                        onChange={(e) => setRequestText(e.target.value)}
                    />
                    <div className="flex items-center justify-between">
                        <button className="text-xs font-medium text-muted-foreground hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-muted transition-colors">
                            <PaperClipIcon className="w-3.5 h-3.5" />
                            Attach File
                        </button>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsRequesting(false)}
                                className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium rounded-lg shadow-sm transition-colors"
                            >
                                Submit Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}


const documents = [
    { name: "Packing_Slip_2055.pdf", size: "245 KB", uploaded: "Jan 12, 2025" },
    { name: "Invoice_INV-8992.pdf", size: "1.2 MB", uploaded: "Jan 12, 2025" },
]

interface DetailProps {
    onBack: () => void;
    onLogout: () => void;
    onNavigateToWorkspace: () => void;
    onNavigate?: (page: string) => void;
    initialTab?: number;
}

export default function AckDetail({ onBack, onLogout, onNavigateToWorkspace, onNavigate, initialTab }: DetailProps) {
    const { currentStep, isDemoActive, nextStep } = ({ isDemoActive: false, currentStep: null, isSidebarCollapsed: false } as any)
    const activeProfile: any = null
    const isContinua = false
    const showAckSummary = isContinua && currentStep?.id === '2.3'
    const [activeTabIndex, setActiveTabIndex] = useState(initialTab || 0)



    const [selectedItem, setSelectedItem] = useState(items[0])
    const [sections, setSections] = useState({
        quickActions: true,
        productOverview: true,
        lifecycle: true,
        aiSuggestions: true
    })
    const [docPhase, setDocPhase] = useState(2) // 0=Received, 1=Fields Extracted, 2=Under Review, 3=Validated, 4=Reconciled
    const [isPOModalOpen, setIsPOModalOpen] = useState(false)
    const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
    const [isAiDiagnosisOpen, setIsAiDiagnosisOpen] = useState(false)
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false)
    const [isManualFixMode, setIsManualFixMode] = useState(false)
    const [resolutionMethod, setResolutionMethod] = useState<'local' | 'remote' | 'custom'>('remote')
    const [customValue, setCustomValue] = useState('')

    const toggleSection = (key: keyof typeof sections) => {
        setSections(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const { theme, toggleTheme } = useTheme()
    const { currentTenant } = useTenant()

    return (
        <div className="flex flex-col min-h-screen bg-background font-sans text-foreground transition-colors duration-200">
            {/* Floating Info Navbar */}
            <Navbar onLogout={onLogout} activeTab="Inventory" onNavigateToWorkspace={onNavigateToWorkspace} onNavigate={onNavigate || (() => { })} />

            {/* Page Header (moved from original header, adjusted for floating nav) */}
            <div className="pt-24 px-4 pb-4 max-w-7xl mx-auto w-full border-b border-border bg-transparent transition-colors duration-200">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <button onClick={onBack} className="p-1 hover:bg-primary hover:text-primary-foreground dark:hover:text-primary-foreground rounded-md transition-colors">
                        <ChevronRightIcon className="h-4 w-4 rotate-180" />
                    </button>
                    <Breadcrumbs
                        items={[
                            { label: 'Dashboard', onClick: onBack },
                            { label: 'Transactions', onClick: onBack },
                            { label: 'Acknowledgement #ACK-3099', active: true }
                        ]}
                    />
                </div>
            </div>

            <div className="flex flex-col px-4 py-6 gap-6 max-w-7xl mx-auto w-full">
                {/* Collapsible Summary — hidden for demo build */}
                {false && (isSummaryExpanded ? (
                    <>
                        <div className="bg-card p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-white/10 ring-1 ring-black/5 dark:ring-0 transition-all duration-300">
                            <div className="flex justify-end mb-4">
                                <button onClick={() => setIsSummaryExpanded(false)} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-zinc-900 dark:text-muted-foreground dark:hover:text-primary-foreground transition-colors bg-muted hover:bg-primary dark:hover:bg-primary px-2.5 py-1.5 rounded-lg">
                                    Hide Details <ChevronUpIcon className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 animate-in fade-in zoom-in duration-300">
                                {[
                                    { label: 'MATCH RATE', value: '95%' },
                                    { label: 'LINE ITEMS', value: '40' },
                                    { label: 'TOTAL ORDER', value: '$127,880.17' },
                                    { label: 'P.O. REF', value: '#ORD-2055' },
                                    { label: 'SHIP VIA', value: 'Best Way' },
                                    { label: 'EXCEPTIONS', value: '2', color: 'text-amber-600 dark:text-amber-400' },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-muted dark:bg-zinc-800/50 p-4 rounded-xl border border-border">
                                        <p className="text-[10px] font-bold text-muted-foreground dark:text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
                                        <p className={cn("text-2xl font-bold tracking-tight", stat.color || "text-foreground")}>{stat.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Integrated Stepper - Matched to Dashboard */}
                            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-white/10 animate-in fade-in slide-in-from-top-4 duration-500">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 ml-1">Workflow Progress</h4>
                                <div className="relative pb-2">
                                    <div className="absolute top-3 left-0 w-full h-0.5 bg-zinc-200 dark:bg-zinc-700" />
                                    <div className="relative z-10 flex justify-between w-full max-w-4xl mx-auto px-4">
                                        {[
                                            { name: 'Received', status: 'completed' },
                                            { name: 'Matched', status: 'completed' },
                                            { name: 'Exceptions', status: 'current' },
                                            { name: 'Resolved', status: 'pending' },
                                            { name: 'Confirmed', status: 'pending' }
                                        ].map((step, i) => {
                                            const isCompleted = step.status === 'completed';
                                            const isCurrent = step.status === 'current';
                                            // Matching Dashboard logic: Completed & Current (active) use primary/brand colors. 
                                            // Dashboard uses index logic (i <= 1), here we use status.
                                            // Dashboard classes: h-6 w-6 rounded-full flex items-center justify-center
                                            // Active/Completed: bg-primary text-primary-foreground
                                            // Pending: bg-gray-200 dark:bg-zinc-700 text-muted-foreground

                                            // However, for correct visual flow in this context:
                                            // Completed: Primary Background, Check Icon
                                            // Current: Primary Background, Dot
                                            // Pending: Gray Background

                                            return (
                                                <div key={i} className="flex flex-col items-center bg-card px-1 group cursor-default">
                                                    <div className={cn(
                                                        "h-6 w-6 rounded-full flex items-center justify-center transition-all duration-300",
                                                        isCompleted || isCurrent
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-zinc-200 dark:bg-zinc-700 text-muted-foreground'
                                                    )}>
                                                        {isCompleted ? <CheckIcon className="w-4 h-4" /> :
                                                            isCurrent ? <div className="w-2 h-2 rounded-full bg-primary-foreground" /> :
                                                                <div className="w-2 h-2 rounded-full bg-white/50 dark:bg-zinc-600" />}
                                                    </div>
                                                    <span className={cn(
                                                        "mt-2 text-xs font-medium transition-colors duration-300",
                                                        isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground dark:text-muted-foreground'
                                                    )}>
                                                        {step.name.split(' ')[0]}
                                                    </span>
                                                    <p className="text-[10px] text-muted-foreground dark:text-muted-foreground mt-0.5">{step.name.split(' ').slice(1).join(' ')}</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="bg-card p-4 rounded-xl shadow-sm ring-1 ring-zinc-900/5 dark:ring-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
                            {[
                                { label: 'Match Rate', value: '95%' },
                                { label: 'Est. Delivery', value: 'Nov 27, 2025' },
                                { label: 'Exceptions', value: '2', color: 'text-amber-600 dark:text-amber-400' },
                                { label: 'Status', value: 'Review Needed', color: 'text-amber-600 dark:text-amber-400' },
                            ].map((stat, i) => (
                                <Fragment key={i}>
                                    <div className="flex items-center gap-2 whitespace-nowrap">
                                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{stat.label}:</span>
                                        <span className={cn("text-lg font-bold leading-none mt-1", stat.color || "text-foreground")}>{stat.value}</span>
                                    </div>
                                    {i < 3 && <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700 hidden sm:block"></div>}
                                </Fragment>
                            ))}
                        </div>

                        <div className="flex items-center gap-4 ml-auto">
                            {/* Resolution Time Indicator */}
                            <div className="hidden lg:flex flex-col items-end">
                                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Resolution Time</span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <ClockIcon className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-bold text-foreground">Under 10 mins</span>
                                    <span className="text-[10px] text-muted-foreground ml-1">(Industry Avg: 2-3 days)</span>
                                </div>
                            </div>

                            <div className="w-px h-12 bg-zinc-200 dark:bg-zinc-700 hidden lg:block mx-2"></div>

                            {/* Current Phase Indicator */}
                            <div className="flex items-center gap-3 hidden md:flex">
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Current Phase</span>
                                    <span className="text-sm font-bold text-foreground">Reviewing Exceptions</span>
                                </div>
                                <div className="relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-zinc-900 dark:border-white bg-card">
                                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 dark:bg-white" />
                                </div>
                            </div>

                            <div className="w-px h-12 bg-zinc-200 dark:bg-zinc-700 hidden xl:block mx-2"></div>

                            <button
                                onClick={() => setIsSummaryExpanded(true)}
                                className="flex flex-col items-center justify-center gap-1 group p-2 hover:bg-primary dark:hover:bg-primary rounded-lg transition-colors"
                            >
                                <div className="text-muted-foreground group-hover:text-zinc-900 dark:group-hover:text-zinc-900 transition-colors">
                                    <ChevronDownIcon className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-medium text-muted-foreground group-hover:text-zinc-900 dark:group-hover:text-zinc-900 transition-colors">Show Details</span>
                            </button>
                        </div>
                    </div>
                ))}



                {/* ═══ Continua Step 1.3 — ACK Validation Summary ═══ */}
                {showAckSummary && (
                    <div className="px-6 py-4 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        {/* AI Attribution */}
                        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-ai flex items-center justify-center text-white text-xs font-bold">AI</div>
                                <span className="text-xs font-bold text-red-700 dark:text-red-400">
                                    TrackingAgent — Price Inconsistency Detected on Knoll ACK
                                </span>
                            </div>
                            <span className="text-xs font-medium text-ai">AI</span>
                        </div>

                        {/* Validation Summary Card */}
                        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
                            <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
                                        <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-foreground">ACK Validation Report</h3>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">12 POs tracked · 9 ACKs validated · 1 inconsistency</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400">
                                    Dispute Required
                                </span>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Validation Steps */}
                                <div className="space-y-2">
                                    {[
                                        { label: 'PO monitoring active', detail: '12 active purchase orders tracked across 4 manufacturers', ok: true },
                                        { label: '9 ACKs validated', detail: 'Qty, price, delivery dates matched against PO terms', ok: true },
                                        { label: '3 ACKs pending', detail: 'Aging alerts generated — supplier follow-up queued', ok: true },
                                        { label: 'Knoll ACK inconsistency', detail: '+4% price increase on task chairs vs contracted rate', ok: false },
                                    ].map((step, i) => (
                                        <div key={i} className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-lg border",
                                            step.ok
                                                ? "bg-green-50 dark:bg-green-500/5 border-green-200 dark:border-green-500/20"
                                                : "bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20"
                                        )}>
                                            <div className={cn("w-6 h-6 rounded-full text-white flex items-center justify-center shrink-0",
                                                step.ok ? "bg-green-500" : "bg-red-500"
                                            )}>
                                                {step.ok
                                                    ? <CheckIcon className="w-3.5 h-3.5" />
                                                    : <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                                                }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-foreground">{step.label}</p>
                                                <p className="text-[10px] text-muted-foreground">{step.detail}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Dispute Draft Preview */}
                                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20">
                                    <div className="flex items-center gap-2 text-xs mb-2">
                                        <SparklesIcon className="w-3.5 h-3.5 text-amber-600" />
                                        <span className="font-bold text-amber-700 dark:text-amber-400">Auto-Generated Dispute Draft</span>
                                    </div>
                                    <p className="text-[10px] text-amber-700/80 dark:text-amber-400/70">
                                        "Per contract KN-2026-001 Section 4.2, unit price for Task Chair (Model GN-304) is fixed at $1,295.
                                        ACK shows $1,347 (+4.01%). Requesting correction to contracted rate. Supporting documentation attached."
                                    </p>
                                </div>

                                {/* Synced Systems */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] text-muted-foreground font-medium">Synced:</span>
                                    {['Contract DB', 'PO Tracker', 'Vendor Portal', 'Dispute Queue'].map(sys => (
                                        <span key={sys} className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-[10px] font-bold flex items-center gap-1">
                                            <CheckCircleIcon className="w-3 h-3" /> {sys}
                                        </span>
                                    ))}
                                </div>

                                {/* CTA */}
                                <button
                                    onClick={() => { nextStep(); onBack(); }}
                                    className="w-full px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg transition-all shadow-sm hover:scale-[1.01] flex items-center justify-center gap-2"
                                >
                                    Continue to Step 1.4 — Warehouse Receiving
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Area — Document Overview */}
                <div className="flex flex-col">
                    {/* Status Stepper */}
                    <div className="px-6 py-4 border-b border-border bg-background">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-foreground">Document Status</h3>
                        </div>
                        <div className="flex items-center gap-0">
                            {[
                                { label: 'Received' },
                                { label: 'Fields Extracted' },
                                { label: 'Under Review' },
                                { label: 'Validated' },
                                { label: 'Reconciled' },
                            ].map((step, i, arr) => {
                                const status = i < docPhase ? 'done' as const : i === docPhase ? 'current' as const : 'pending' as const;
                                return { ...step, status };
                            }).map((step, i, arr) => (
                                <div key={i} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center gap-1.5 flex-1">
                                        <div className={cn(
                                            "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                                            step.status === 'done' ? 'bg-green-500 border-green-500 text-white' :
                                            step.status === 'current' ? 'bg-brand-300 dark:bg-brand-500 border-brand-400 dark:border-brand-500 text-zinc-900' :
                                            'bg-muted border-border text-muted-foreground'
                                        )}>
                                            {step.status === 'done' ? <CheckCircleIcon className="h-4 w-4" /> : i + 1}
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-medium text-center",
                                            step.status === 'current' ? 'text-foreground font-semibold' : 'text-muted-foreground'
                                        )}>{step.label}</span>
                                    </div>
                                    {i < arr.length - 1 && (
                                        <div className={cn(
                                            "h-0.5 flex-1 -mt-5 mx-1",
                                            step.status === 'done' ? 'bg-green-500' : 'bg-border'
                                        )} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Split Pane: Document Preview + Extracted Fields */}
                    <div className="grid grid-cols-5 min-h-[600px]">
                        {/* Left: Document Preview (3/5) */}
                        <div className="col-span-3 border-r border-border flex flex-col">
                            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between shrink-0">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Document Preview</span>
                                <span className="text-[10px] text-muted-foreground">ACK-7839_Steelcase.pdf</span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 bg-zinc-100 dark:bg-zinc-950" style={{ scrollbarWidth: 'thin' }}>
                                <div className="mx-auto bg-card rounded-lg shadow-lg border border-border p-8 font-mono text-xs leading-relaxed max-w-[560px]">
                                    {/* Document header */}
                                    <div className="flex justify-between items-start mb-6 pb-4 border-b border-border">
                                        <div>
                                            <p className="text-lg font-bold text-foreground font-sans">AIS — Affordable Interior Systems</p>
                                            <p className="text-muted-foreground mt-1">Vendor Acknowledgement</p>
                                            <p className="text-muted-foreground text-[10px] mt-1">555 Industrial Blvd, Lenexa, KS 66215</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-foreground">ACK-3099</p>
                                            <p className="text-muted-foreground">2025-09-16</p>
                                            <p className="text-muted-foreground text-[10px] mt-1">Ref: ORD-2055</p>
                                        </div>
                                    </div>

                                    {/* Vendor & Billing */}
                                    <div className="mb-5">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 font-sans">Vendor & Bill To</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <div className="flex justify-between py-0.5"><span className="text-muted-foreground">Vendor</span><span className="font-medium text-foreground">AIS</span></div>
                                                <div className="flex justify-between py-0.5"><span className="text-muted-foreground">Sales Rep</span><span className="font-medium text-foreground">Sarah Johnson</span></div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between py-0.5"><span className="text-muted-foreground">Bill To</span><span className="font-medium text-foreground">Strata Workplace</span></div>
                                                <div className="flex justify-between py-0.5"><span className="text-muted-foreground">SO #</span><span className="font-medium text-foreground">SO 1151064-B</span></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Line Items */}
                                    <div className="mb-5">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 font-sans">Line Items</p>
                                        <table className="w-full text-[11px]">
                                            <thead>
                                                <tr className="border-b border-border">
                                                    <th className="text-left py-1.5 text-muted-foreground font-medium">Item</th>
                                                    <th className="text-center py-1.5 text-muted-foreground font-medium">Qty</th>
                                                    <th className="text-right py-1.5 text-muted-foreground font-medium">Price</th>
                                                    <th className="text-right py-1.5 text-muted-foreground font-medium">Amount</th>
                                                    <th className="text-center py-1.5 text-muted-foreground font-medium">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.slice(0, 6).map((item) => (
                                                    <tr key={item.id} className="border-b border-zinc-100 dark:border-zinc-700/50">
                                                        <td className="py-1.5 text-foreground">{item.name}</td>
                                                        <td className="py-1.5 text-center text-muted-foreground dark:text-zinc-300">{item.qtyOrd}</td>
                                                        <td className="py-1.5 text-right text-muted-foreground dark:text-zinc-300">${item.netPrice.toFixed(2)}</td>
                                                        <td className="py-1.5 text-right font-medium text-foreground">${item.amount.toFixed(2)}</td>
                                                        <td className="py-1.5 text-center">
                                                            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded",
                                                                item.status === 'Confirmed' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' :
                                                                'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                                                            )}>{item.status}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Shipping & Totals */}
                                    <div className="mb-5">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 font-sans">Shipping & Totals</p>
                                        <div className="space-y-1">
                                            <div className="flex justify-between py-0.5"><span className="text-muted-foreground">Ship To</span><span className="font-medium text-foreground">1200 Commerce Dr, Dallas TX</span></div>
                                            <div className="flex justify-between py-0.5"><span className="text-muted-foreground">Ship Via</span><span className="font-medium text-foreground">AIS Fleet — White Glove</span></div>
                                            <div className="flex justify-between py-0.5"><span className="text-muted-foreground">Freight</span><span className="font-medium text-foreground">Prepaid & Add</span></div>
                                            <div className="flex justify-between py-1 mt-2 border-t border-border">
                                                <span className="font-bold text-foreground">Total</span>
                                                <span className="font-bold text-foreground">$127,880.17</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-border text-center">
                                        <p className="text-muted-foreground text-[10px]">Processed by Smart Comparator OCR Engine · 98.2% confidence</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Extracted Fields (2/5) */}
                        <div className="col-span-2 flex flex-col min-h-0">
                            <div className="px-4 py-3 border-b border-border bg-muted/30 shrink-0">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Extracted Fields</h4>
                                <p className="text-[10px] text-muted-foreground mt-0.5">ACK schema · 7 groups</p>
                            </div>
                            <div className="flex-1 overflow-y-auto scrollbar-micro">
                                <ACKInputsTab />
                            </div>
                            {/* Phase Action Button */}
                            <div className="px-4 py-3 border-t border-border bg-muted/20 shrink-0">
                                {docPhase < 4 ? (
                                    <button
                                        onClick={() => setDocPhase(prev => Math.min(prev + 1, 4))}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-zinc-900 bg-brand-300 dark:bg-brand-500 hover:bg-brand-400 dark:hover:bg-brand-600 rounded-lg transition-colors"
                                    >
                                        <CheckCircleIcon className="h-4 w-4" />
                                        {docPhase === 2 ? 'Approve & Move to Validated' :
                                         docPhase === 3 ? 'Validate & Reconcile' :
                                         'Advance to Next Phase'}
                                    </button>
                                ) : (
                                    <div className="flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-green-700 dark:text-green-400">
                                        <CheckCircleIcon className="h-4 w-4" />
                                        Document Reconciled
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>


            <Transition show={isDocumentModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={setIsDocumentModalOpen}>
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
                    </TransitionChild>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <DialogPanel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-card p-6 text-left align-middle shadow-xl transition-all border border-border">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <DialogTitle as="h3" className="text-lg font-bold leading-6 text-foreground">
                                                Order Document Preview
                                            </DialogTitle>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Previewing Purchase Order #PO-2025-001
                                            </p>
                                        </div>
                                        <button onClick={() => setIsDocumentModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                                            <XMarkIcon className="h-6 w-6" />
                                        </button>
                                    </div>

                                    <div className="bg-white text-black p-10 rounded-lg border border-zinc-200 h-[600px] overflow-auto shadow-sm">
                                        <div className="flex justify-between items-end mb-6 pb-4 border-b-2 border-black">
                                            <h2 className="text-2xl font-bold uppercase">Purchase Order</h2>
                                            <div className="text-right">
                                                <div className="font-bold text-lg">STRATA INC.</div>
                                                <div className="text-sm">123 Innovation Dr., Tech City</div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between mb-8">
                                            <div>
                                                <div className="text-xs font-bold text-muted-foreground mb-1 uppercase">VENDOR</div>
                                                <div className="font-bold">OfficeSupplies Co.</div>
                                                <div className="text-sm">555 Supplier Lane</div>
                                            </div>
                                            <div className="text-right space-y-1">
                                                <div className="flex justify-between w-48">
                                                    <span className="text-sm font-bold text-muted-foreground">PO #:</span>
                                                    <span className="text-sm font-bold">PO-2025-001</span>
                                                </div>
                                                <div className="flex justify-between w-48">
                                                    <span className="text-sm font-bold text-muted-foreground">DATE:</span>
                                                    <span className="text-sm">Jan 12, 2026</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-8">
                                            <div className="flex bg-zinc-100 p-2 font-bold text-sm mb-2">
                                                <div className="flex-grow-[2]">ITEM</div>
                                                <div className="flex-1 text-right">QTY</div>
                                                <div className="flex-1 text-right">UNIT PRICE</div>
                                                <div className="flex-1 text-right">TOTAL</div>
                                            </div>
                                            <div className="flex p-2 border-b border-zinc-100">
                                                <div className="flex-grow-[2]">
                                                    <div className="font-bold text-sm">{selectedItem.name}</div>
                                                    <div className="text-xs text-muted-foreground">{selectedItem.id}</div>
                                                </div>
                                                <div className="flex-1 text-right text-sm">50</div>
                                                <div className="flex-1 text-right text-sm">$45.00</div>
                                                <div className="flex-1 text-right text-sm">$2,250.00</div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <div className="w-64">
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm text-muted-foreground">Subtotal:</span>
                                                    <span className="text-sm font-bold">$2,250.00</span>
                                                </div>
                                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-zinc-100">
                                                    <span className="text-lg font-bold">TOTAL:</span>
                                                    <span className="text-xl font-bold text-foreground">$2,250.00</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-lg border border-transparent bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80 focus:outline-none"
                                            onClick={() => setIsDocumentModalOpen(false)}
                                        >
                                            Close
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-lg border border-transparent bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 focus:outline-none"
                                            onClick={() => { }}
                                        >
                                            Download PDF
                                        </button>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div >
    )
}




function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <button className={cn(
            "relative flex items-center justify-center h-9 px-3 rounded-full transition-all duration-300 group overflow-hidden",
            active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        )}>
            <span className="relative z-10">{icon}</span>
            <span className={cn(
                "ml-2 text-sm font-medium whitespace-nowrap max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 ease-in-out",
                active ? "max-w-xs opacity-100" : ""
            )}>
                {label}
            </span>
        </button>
    )
}
