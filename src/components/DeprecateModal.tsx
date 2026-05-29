import React, { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '../lib/utils'

interface DeprecateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    vendorName: string;
}

const DEPRECATION_REASONS = [
    'Superseded',
    'Canceled',
    'Duplicated',
    'Manually Archived',
    'Obsolete',
    'Merged',
    'Failed Processing',
    'Vendor Correction',
    'Other'
]

export default function DeprecateModal({ isOpen, onClose, onConfirm, vendorName }: DeprecateModalProps) {
    const [selectedReason, setSelectedReason] = useState<string | null>(null)

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
                onClick={onClose}
            />
            
            {/* Modal Container */}
            <div className="relative w-full max-w-[440px] bg-card rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                <div className="p-8">
                    {/* Header */}
                    <div className="text-center space-y-2 mb-8">
                        <h2 className="text-xl font-bold text-foreground">Deprecate Document?</h2>
                        <p className="text-sm text-muted-foreground">
                            Are you sure you want to send “{vendorName}” to the deprecated section?
                        </p>
                    </div>

                    {/* Reasons Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-foreground">Select a Reason for Deprecation</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {DEPRECATION_REASONS.map((reason) => (
                                <button
                                    key={reason}
                                    onClick={() => setSelectedReason(reason)}
                                    className={cn(
                                        "flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm transition-all duration-200 text-left",
                                        selectedReason === reason
                                            ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900 shadow-md"
                                            : "border-zinc-200 bg-white text-muted-foreground hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-muted-foreground dark:hover:border-zinc-700"
                                    )}
                                >
                                    <div className={cn(
                                        "h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                                        selectedReason === reason
                                            ? "border-white dark:border-zinc-900"
                                            : "border-zinc-300 dark:border-zinc-700"
                                    )}>
                                        {selectedReason === reason && (
                                            <div className="h-2 w-2 rounded-full bg-card" />
                                        )}
                                    </div>
                                    <span className="font-medium truncate">{reason}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-3 mt-10">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3.5 rounded-2xl border border-border text-sm font-bold text-muted-foreground hover:bg-muted dark:hover:bg-zinc-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => selectedReason && onConfirm(selectedReason)}
                            disabled={!selectedReason}
                            className={cn(
                                "flex-1 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-sm active:scale-[0.98]",
                                selectedReason
                                    ? "bg-[#E6F993] hover:bg-[#d6f22e] text-zinc-900"
                                    : "bg-zinc-100 text-muted-foreground cursor-not-allowed dark:bg-zinc-800 dark:text-muted-foreground"
                            )}
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
