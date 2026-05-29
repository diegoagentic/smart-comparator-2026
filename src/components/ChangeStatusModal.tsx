import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, TagIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

const STATUS_OPTIONS = [
    'Available',
    'In Use',
    'Under Maintenance',
    'Reserved',
    'In Consignment',
    'Sold',
    'Write-off'
];

interface ChangeStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedCount: number;
    onConfirm: (data: any) => void;
    currentStatus?: string; // Optional, for single select pre-fill
}

export default function ChangeStatusModal({ isOpen, onClose, selectedCount, onConfirm, currentStatus }: ChangeStatusModalProps) {
    const [status, setStatus] = useState<string>('Available');
    const [notes, setNotes] = useState('');
    const [consignmentLocation, setConsignmentLocation] = useState('');

    useEffect(() => {
        if (isOpen) {
            setStatus(currentStatus || 'Available');
            setNotes('');
            setConsignmentLocation('');
        }
    }, [isOpen, currentStatus]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm({
            status,
            notes,
            consignmentLocation,
            count: selectedCount
        });
        onClose();
    };

    return (
        <Transition show={isOpen} as={React.Fragment}>
            <Dialog onClose={onClose} className="relative z-50">
                <Transition.Child
                    as={React.Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Transition.Child
                        as={React.Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Dialog.Panel className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
                            <div className="flex items-center justify-between p-4 border-b border-border">
                                <Dialog.Title className="text-lg font-semibold text-foreground flex items-center gap-2">
                                    <ArrowPathIcon className="w-5 h-5 text-muted-foreground" />
                                    Change Status
                                </Dialog.Title>
                                <button onClick={onClose} className="p-1 rounded-full hover:bg-muted text-muted-foreground transition-colors" title="Close">
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Updating status for <span className="font-medium text-foreground">{selectedCount}</span> item{selectedCount !== 1 ? 's' : ''}.
                                </p>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">New Status</label>
                                    <div className="relative">
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)} // Type assertion here if needed, but string is fine
                                            className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all pl-9 appearance-none"
                                        >
                                            {STATUS_OPTIONS.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                        <TagIcon className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                </div>

                                {status === 'In Consignment' && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="block text-sm font-medium text-foreground mb-1">Consignee / Location</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Downtown Gallery, Partner Showroom"
                                            value={consignmentLocation}
                                            onChange={(e) => setConsignmentLocation(e.target.value)}
                                            className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            This will update the item's location and set its type to 'Consignment'.
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Notes (Optional)</label>
                                    <textarea
                                        rows={3}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                                        placeholder="Reason for status change..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>

                                <div className="flex items-center gap-3 pt-4 border-t border-border">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm shadow-primary/25"
                                    >
                                        Update Status
                                    </button>
                                </div>
                            </form>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}
