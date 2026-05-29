import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
    CubeIcon,
    BoltIcon, // Using BoltIcon as a placeholder for a 'Core' system icon
    BuildingOffice2Icon,
    CheckCircleIcon,
    XMarkIcon,
    ArrowPathIcon,
    ShieldCheckIcon,
    UserIcon,
    LockClosedIcon,
    KeyIcon
} from '@heroicons/react/24/outline'; // Outline icons for general UI
import { CheckIcon } from '@heroicons/react/24/solid'; // Solid check for selection

const SYSTEMS = [
    {
        id: 'netsuite',
        name: 'NetSuite',
        status: 'Connected',
        icon: CubeIcon,
        color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
        borderColor: 'hover:border-blue-400'
    },
    {
        id: 'rcp',
        name: 'RCP Core',
        status: 'Available',
        icon: BoltIcon,
        color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
        borderColor: 'hover:border-amber-400'
    },
    {
        id: 'emanage',
        name: 'EManage One',
        status: 'Available',
        icon: BuildingOffice2Icon,
        color: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
        borderColor: 'hover:border-green-400'
    }
];

export default function ERPSyncModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [step, setStep] = useState<'selection' | 'login' | 'connecting' | 'success'>('selection');
    const [selectedSystem, setSelectedSystem] = useState<typeof SYSTEMS[0] | null>(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setStep('selection');
            setSelectedSystem(null);
            setIsLoggingIn(false);
        }
    }, [isOpen]);

    const simulateConnection = () => {
        setTimeout(() => {
            setStep('success');
        }, 2500);
    };

    const handleConnect = (system: typeof SYSTEMS[0]) => {
        setSelectedSystem(system);

        if (system.status === 'Connected') {
            setStep('connecting');
            simulateConnection();
        } else {
            setStep('login');
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);

        // Simulate auth check
        setTimeout(() => {
            setIsLoggingIn(false);
            setStep('connecting');
            simulateConnection();
        }, 1500);
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-50">
                {/* Backdrop */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-[2px]" />
                </Transition.Child>

                {/* Modal Container */}
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95 translate-y-4"
                        enterTo="opacity-100 scale-100 translate-y-0"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100 translate-y-0"
                        leaveTo="opacity-0 scale-95 translate-y-4"
                    >
                        <Dialog.Panel className="w-full max-w-lg bg-card rounded-3xl shadow-2xl overflow-hidden border border-border flex flex-col max-h-[90vh]">

                            {/* Header / Brand Area */}
                            <div className="relative bg-muted/30 p-6 text-center border-b border-border">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700/50 text-muted-foreground transition-colors"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>

                                <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-3 transform rotate-3">
                                    <CubeIcon className="w-6 h-6 text-white" />
                                </div>
                                <Dialog.Title className="text-xl font-bold font-brand text-foreground">
                                    Connect ERP
                                </Dialog.Title>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Sync your inventory and orders with Avanto
                                </p>
                            </div>

                            {/* Content Area */}
                            <div className="p-6 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-200 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-800 hover:[&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-zinc-700">
                                {step === 'selection' && (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Select System</p>
                                        {SYSTEMS.map((system) => (
                                            <button
                                                key={system.id}
                                                onClick={() => handleConnect(system)}
                                                className={`w-full flex items-center gap-4 p-4 rounded-2xl border bg-card shadow-sm transition-all group text-left ${system.status === 'Connected'
                                                    ? 'border-green-200 dark:border-green-900/30 ring-1 ring-green-500/20'
                                                    : 'border-border hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md'
                                                    }`}
                                            >
                                                {/* Icon */}
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${system.color}`}>
                                                    <system.icon className="w-6 h-6" />
                                                </div>

                                                {/* Text Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-foreground truncate">{system.name}</h3>
                                                        {system.status === 'Connected' && (
                                                            <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                                <CheckIcon className="w-3 h-3" /> Connected
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {system.status === 'Connected' ? 'Last synced 5 mins ago' : 'Available for connection'}
                                                    </p>
                                                </div>

                                                {/* Arrow / Action */}
                                                <div className="text-zinc-300 dark:text-muted-foreground group-hover:text-indigo-500 transition-colors">
                                                    {system.status === 'Connected' ? (
                                                        <ArrowPathIcon className="w-5 h-5 hover:rotate-180 transition-transform duration-500" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-indigo-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20">
                                                            <div className="w-2 h-2 rounded-full bg-current" />
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {step === 'login' && selectedSystem && (
                                    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                                        <div className="flex items-center gap-4 mb-6 p-4 bg-muted/50 rounded-2xl border border-border">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${selectedSystem.color}`}>
                                                <selectedSystem.icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-foreground">Login to {selectedSystem.name}</h3>
                                                <p className="text-xs text-muted-foreground">Enter your credentials to authorize access.</p>
                                            </div>
                                        </div>

                                        <form onSubmit={handleLogin} className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Client ID / URL</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <KeyIcon className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        className="block w-full pl-10 pr-3 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors text-sm"
                                                        placeholder={`e.g. ${selectedSystem.name.toLowerCase()}.app.com`}
                                                        defaultValue="acme-corp-global"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Username</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        className="block w-full pl-10 pr-3 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors text-sm"
                                                        defaultValue="jdoe@acmecorp.com"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Password</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <LockClosedIcon className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <input
                                                        type="password"
                                                        className="block w-full pl-10 pr-3 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors text-sm"
                                                        defaultValue="password123"
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-4 flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setStep('selection')}
                                                    className="flex-1 py-2.5 px-4 bg-muted text-muted-foreground rounded-xl font-semibold hover:bg-muted/80 transition-colors"
                                                >
                                                    Back
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={isLoggingIn}
                                                    className="flex-[2] py-2.5 px-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    {isLoggingIn ? (
                                                        <>
                                                            <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                                            Authenticating...
                                                        </>
                                                    ) : (
                                                        'Connect & Sync'
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {step === 'connecting' && selectedSystem && (
                                    <div className="flex flex-col items-center justify-center py-8 animate-in fade-in zoom-in-95 duration-300">
                                        <div className="relative w-20 h-20 mb-6">
                                            <div className="absolute inset-0 rounded-full border-4 border-zinc-100 dark:border-zinc-800" />
                                            <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <selectedSystem.icon className="w-8 h-8 text-indigo-500 animate-pulse" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-foreground">
                                            Connecting to {selectedSystem.name}...
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-2 text-center max-w-xs">
                                            Verifying credentials and establishing secure tunnel.
                                        </p>
                                    </div>
                                )}

                                {step === 'success' && selectedSystem && (
                                    <div className="flex flex-col items-center justify-center py-6 animate-in fade-in zoom-in-95 duration-500">
                                        <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/20">
                                            <ShieldCheckIcon className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-foreground">Sync Complete!</h3>
                                        <p className="text-sm text-muted-foreground mt-2 mb-8 text-center max-w-xs">
                                            Successfully synchronized 1,245 items from {selectedSystem.name}.
                                        </p>

                                        <button
                                            onClick={onClose}
                                            className="w-full py-3 px-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-semibold hover:opacity-90 transition-opacity"
                                        >
                                            Done
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Footer for Trust */}
                            {step !== 'success' && (
                                <div className="p-4 bg-muted/30 border-t border-border text-center">
                                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                                        <ShieldCheckIcon className="w-3.5 h-3.5" />
                                        End-to-end encrypted connection
                                    </p>
                                </div>
                            )}

                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}
