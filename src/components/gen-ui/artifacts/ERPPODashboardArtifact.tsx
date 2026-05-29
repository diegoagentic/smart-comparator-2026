import { useState } from 'react';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    ReceiptPercentIcon,
    CurrencyDollarIcon,
    CubeIcon,
    ChevronDownIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useGenUI } from '../../../context/GenUIContext';

interface POItem {
    id: string;
    number: string;
    vendor: string;
    status: 'Approved' | 'In Progress' | 'Completed';
    value: number;
    items: number;
    date: string;
}

export default function ERPPODashboardArtifact({ data }: { data: any }) {
    const { sendMessage } = useGenUI();
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data if not provided
    const purchases: POItem[] = data?.orders || [
        { id: '1', number: 'PO-AT-0004732', vendor: 'Herman Miller Enterprise Solutions', status: 'Approved', value: 285670.50, items: 127, date: '2025-01-15' },
        { id: '2', number: 'KT2131.001.01', vendor: 'Steelcase Business Solutions', status: 'In Progress', value: 458920.80, items: 203, date: '2025-01-20' },
        { id: '3', number: 'PO-6402', vendor: 'Knoll Corporate Services', status: 'Completed', value: 167340.25, items: 89, date: '2024-12-10' },
        { id: '4', number: 'PO-6391', vendor: 'Humanscale Enterprise', status: 'Completed', value: 124580.90, items: 156, date: '2024-11-05' },
        { id: '5', number: 'PO-6358', vendor: 'Teknion Business Interiors', status: 'Approved', value: 389750.00, items: 245, date: '2025-02-01' },
    ];

    const filteredPOs = purchases.filter(po =>
        po.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.vendor.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    const handleSelect = (po: POItem) => {
        sendMessage(`System: Processing PO ${po.number}... Fetching line items for validation.`);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full p-4 overflow-hidden">
            {/* Main Content - List */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">

                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
                    <div className="relative w-full sm:w-96">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by PO number, vendor, or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                    </div>
                    <div className="flex gap-2">
                        <span className="text-sm font-medium text-muted-foreground self-center">
                            {filteredPOs.length} Available POs
                        </span>
                        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 mx-2 self-center"></div>
                        <span className="text-sm font-semibold text-green-600 dark:text-green-500 self-center">
                            {formatCurrency(filteredPOs.reduce((acc, curr) => acc + curr.value, 0))} Total Value
                        </span>
                    </div>
                </div>

                {/* PO List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                    {filteredPOs.map((po) => (
                        <div key={po.id} className="group bg-card p-4 rounded-xl border border-border hover:border-primary/50 dark:hover:border-primary/50 transition-all shadow-sm hover:shadow-md flex flex-col sm:flex-row gap-4 items-center justify-between">

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h4 className="font-semibold text-foreground truncate">{po.number}</h4>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${po.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                                        po.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' :
                                            'bg-zinc-100 text-muted-foreground border-zinc-200 dark:bg-zinc-800 dark:text-muted-foreground dark:border-zinc-700'
                                        }`}>
                                        {po.status}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground truncate">{po.vendor}</p>
                            </div>

                            {/* Metrics */}
                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                <p className="font-semibold text-foreground w-24 text-right">{formatCurrency(po.value)}</p>
                                <div className="flex items-center gap-1.5 w-16 text-right justify-end">
                                    <CubeIcon className="w-4 h-4" />
                                    <span>{po.items}</span>
                                </div>
                            </div>

                            {/* Action */}
                            <button
                                onClick={() => handleSelect(po)}
                                className="w-full sm:w-auto px-4 py-2 bg-card border border-border hover:bg-muted dark:hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 group-hover:border-primary/30 group-hover:text-primary"
                            >
                                Select
                                <ChevronDownIcon className="w-3 h-3 -rotate-90" />
                            </button>
                        </div>
                    ))}

                    {filteredPOs.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            No Purchase Orders found matching your search.
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar Stats */}
            <div className="w-full lg:w-72 flex flex-col gap-4">
                <div className="bg-card p-5 rounded-xl border border-border shadow-sm">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <ArrowRightIcon className="w-4 h-4 -rotate-45 text-primary" />
                        Purchase Orders Overview
                    </h3>

                    <div className="space-y-4">
                        <div className="p-3 bg-muted dark:bg-zinc-800/50 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <ReceiptPercentIcon className="w-4 h-4 text-blue-500" />
                                Total Orders
                            </div>
                            <span className="font-bold text-foreground">12</span>
                        </div>
                        <div className="p-3 bg-muted dark:bg-zinc-800/50 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CurrencyDollarIcon className="w-4 h-4 text-green-500" />
                                Total Value
                            </div>
                            <span className="font-bold text-green-600 dark:text-green-500">$3.2M</span>
                        </div>
                        <div className="p-3 bg-muted dark:bg-zinc-800/50 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CubeIcon className="w-4 h-4 text-indigo-500" />
                                Total Items
                            </div>
                            <span className="font-bold text-foreground">1971</span>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs text-muted-foreground flex items-center gap-1.5">
                        <ArrowRightIcon className="w-3 h-3 text-amber-500" />
                        Avg. Order Value <span className="font-semibold text-foreground">$269.9K</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
