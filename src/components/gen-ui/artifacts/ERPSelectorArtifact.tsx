import React from 'react';
import { useGenUI } from '../../../context/GenUIContext';
import { DocumentTextIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const MOCK_ERP_ORDERS = [
    { id: 'PO-2024-001', client: 'Acme Corp', amount: 12450.00, items: 15, date: '2024-02-01', status: 'Pending' },
    { id: 'PO-2024-002', client: 'Stellar Tech', amount: 8200.50, items: 8, date: '2024-01-28', status: 'Approved' },
    { id: 'PO-2024-003', client: 'Global Logistics', amount: 45000.00, items: 42, date: '2024-01-25', status: 'Pending' },
];

export default function ERPSelectorArtifact() {
    const { sendMessage } = useGenUI();

    return (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm w-full">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-muted/50 dark:bg-zinc-800/50">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    NetSuite Connector: Open Orders
                </h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted dark:bg-zinc-800/50 text-muted-foreground font-medium">
                        <tr>
                            <th className="px-4 py-3">PO Number</th>
                            <th className="px-4 py-3">Client</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3 text-right">Value</th>
                            <th className="px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {MOCK_ERP_ORDERS.map((order) => (
                            <tr key={order.id} className="hover:bg-muted dark:hover:bg-zinc-800/50 transition-colors group">
                                <td className="px-4 py-3 font-medium text-foreground">{order.id}</td>
                                <td className="px-4 py-3 text-muted-foreground dark:text-zinc-300">{order.client}</td>
                                <td className="px-4 py-3 text-muted-foreground">{order.date}</td>
                                <td className="px-4 py-3 text-right font-medium text-foreground">
                                    ${order.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => sendMessage(`Selected ERP Order: ${order.id}`)}
                                        className="text-xs bg-primary/10 text-primary hover:bg-primary hover:text-white px-3 py-1.5 rounded-md font-medium transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
                                    >
                                        Select
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-muted dark:bg-zinc-800/50 text-xs text-center text-muted-foreground">
                Displaying 3 recent open orders from NetSuite ERP
            </div>
        </div>
    );
}
