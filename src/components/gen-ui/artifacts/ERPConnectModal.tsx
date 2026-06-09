import { useState } from 'react';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { BuildingOfficeIcon, CloudIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useGenUI } from '../../../context/GenUIContext';

export default function ERPConnectModal({ data }: { data: any }) {
    const { sendMessage } = useGenUI();
    const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const systems = [
        { id: 'netsuite', name: 'NetSuite', icon: <BuildingOfficeIcon className="w-6 h-6" />, color: 'bg-blue-600' },
        { id: 'quickbooks', name: 'QuickBooks', icon: <CloudIcon className="w-6 h-6" />, color: 'bg-green-600' },
        { id: 'sap', name: 'SAP S/4HANA', icon: <ArrowPathIcon className="w-6 h-6" />, color: 'bg-blue-900' },
    ];

    const handleConnect = () => {
        if (!selectedSystem) return;
        setIsConnecting(true);
        // Simulate connection delay
        setTimeout(() => {
            setIsConnecting(false);
            setIsConnected(true);
            // After 1s, trigger the next step automatically
            setTimeout(() => {
                sendMessage(`System: Successfully connected to ${selectedSystem}. Fetching open Purchase Orders...`);
            }, 1000);
        }, 2000);
    };

    if (isConnected) {
        return (
            <div className="bg-card rounded-xl border border-border p-8 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-500 mb-2">
                    <CheckCircleIcon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Successfully Connected!</h3>
                <p className="text-muted-foreground max-w-xs">
                    Your {selectedSystem} integration is now active. We are syncing your product catalog and pricing rules.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden flex flex-col max-w-2xl w-full mx-auto shadow-lg">
            {/* Header */}
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-muted/50 dark:bg-zinc-800/50 flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-600 rounded-lg">
                            <CloudIcon className="w-5 h-5 text-white" />
                        </div>
                        Connect ERP Integration
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Select your ERP provider to sync orders, inventory, and pricing.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {systems.map((sys) => (
                        <button
                            key={sys.id}
                            onClick={() => setSelectedSystem(sys.id)}
                            className={`
                                relative p-4 rounded-xl border-2 text-left transition-all duration-200 flex flex-col gap-3 group
                                ${selectedSystem === sys.id
                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/10 ring-1 ring-indigo-600/20'
                                    : 'border-border hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-muted dark:hover:bg-zinc-800/50'
                                }
                            `}
                        >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm ${sys.color}`}>
                                {sys.icon}
                            </div>
                            <div>
                                <h4 className={`font-semibold ${selectedSystem === sys.id ? 'text-indigo-700 dark:text-indigo-400' : 'text-foreground'}`}>
                                    {sys.name}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Full Sync Available
                                </p>
                            </div>
                            {selectedSystem === sys.id && (
                                <div className="absolute top-3 right-3 text-indigo-600">
                                    <CheckCircleIcon className="w-5 h-5" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4 flex gap-3 text-sm text-amber-800 dark:text-amber-200">
                    <BuildingOfficeIcon className="w-5 h-5 flex-shrink-0" />
                    <p>
                        <strong>Secure Connection:</strong> All credentials are encrypted. We only access product catalog and pricing information needed for quoting.
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-muted/50 dark:bg-zinc-800/50 flex justify-end gap-3">
                <button
                    onClick={() => sendMessage("Cancel ERP connection.")}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleConnect}
                    disabled={!selectedSystem || isConnecting}
                    className={`
                        px-6 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition-all flex items-center gap-2
                        ${!selectedSystem || isConnecting ? 'bg-zinc-300 dark:bg-zinc-700 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}
                    `}
                >
                    {isConnecting ? (
                        <>
                            <ArrowPathIcon className="w-4 h-4 animate-spin" />
                            Connecting...
                        </>
                    ) : (
                        'Connect System'
                    )}
                </button>
            </div>
        </div>
    );
}
