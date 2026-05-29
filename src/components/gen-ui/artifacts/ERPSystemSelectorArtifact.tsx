import { useState } from 'react';
import { useGenUI } from '../../../context/GenUIContext';
import {
    CloudIcon,
    BuildingOffice2Icon,
    ChevronDownIcon,
    BoltIcon,
    CheckCircleIcon,
    CubeIcon
} from '@heroicons/react/24/outline';

const SYSTEMS = [
    {
        id: 'netsuite',
        name: 'NetSuite',
        status: 'Connected',
        icon: CubeIcon,
        color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400'
    },
    {
        id: 'rcp',
        name: 'RCP Core',
        status: 'Available',
        icon: BoltIcon,
        color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400'
    },
    {
        id: 'emanage',
        name: 'EManage One',
        status: 'Available',
        icon: BuildingOffice2Icon,
        color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
    }
];

export default function ERPSystemSelectorArtifact() {
    const { sendMessage } = useGenUI();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedSystem, setSelectedSystem] = useState(SYSTEMS[0]);

    const handleSelect = (system: typeof SYSTEMS[0]) => {
        setSelectedSystem(system);
        setIsOpen(false);
        // Simulate a delay before confirming selection to the chat
        sendMessage(`System Selected: ${system.name}`);
    };

    return (
        <div className="w-full max-w-md mx-auto bg-card rounded-3xl border border-border shadow-xl overflow-hidden font-sans">
            {/* Header Area */}
            <div className="bg-muted/50 dark:bg-zinc-800/30 p-8 flex flex-col items-center justify-center border-b border-zinc-100 dark:border-zinc-800">
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4 transform rotate-3">
                    <CubeIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold font-brand text-foreground tracking-tight">Welcome to Avanto!</h2>
                <p className="text-sm text-muted-foreground mt-2">Your integrated ERP systems</p>

                <p className="text-xs text-muted-foreground mt-6 max-w-[200px] text-center leading-relaxed">
                    How would you like to connect Wells Fargo to your system?
                </p>
            </div>

            {/* Selection Area */}
            <div className="p-6">
                <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Current System :</span>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-full p-3 pl-4 bg-muted dark:bg-zinc-800/50 border border-border rounded-2xl flex items-center justify-between hover:border-indigo-400 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedSystem.color}`}>
                                <selectedSystem.icon className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-foreground text-lg">{selectedSystem.name}</span>
                            {selectedSystem.status === 'Connected' && (
                                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                    Connected
                                </span>
                            )}
                        </div>
                        <ChevronDownIcon className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-2 space-y-1">
                                <div className="px-3 py-2 text-[10px] uppercase font-bold text-muted-foreground">Available Systems</div>
                                {SYSTEMS.map((system) => (
                                    <button
                                        key={system.id}
                                        onClick={() => handleSelect(system)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted dark:hover:bg-zinc-800 transition-colors text-left group"
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${system.color} group-hover:scale-110 transition-transform`}>
                                            <system.icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-foreground">{system.name}</div>
                                            <div className="text-xs text-muted-foreground">Available for connection</div>
                                        </div>
                                        {selectedSystem.id === system.id && (
                                            <CheckCircleIcon className="w-5 h-5 text-primary" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="bg-muted dark:bg-zinc-800/30 p-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-start gap-3 p-3 bg-card rounded-xl border border-border/50 shadow-sm">
                    <div className="mt-0.5">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-foreground">Secure Connection Ready</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                            We found 3 processed sessions matching this client. Select a system above to sync pricing information.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
