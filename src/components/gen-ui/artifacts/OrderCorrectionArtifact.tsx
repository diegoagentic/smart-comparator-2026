import { ArrowRightIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useGenUI } from '../../../context/GenUIContext';

export default function OrderCorrectionArtifact({ data }: { data: any }) {
    const [applied, setApplied] = useState(false);
    const { sendMessage } = useGenUI();

    const handleApply = () => {
        setApplied(true);
        // Simulate system response after action
        setTimeout(() => {
            sendMessage("System: Order #402 updated successfully. Notification sent to logistics.");
        }, 500);
    };

    if (applied) {
        return (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 flex items-start gap-3 animate-in fade-in zoom-in duration-300">
                <div className="p-1 bg-green-100 dark:bg-green-900/40 rounded-full text-green-600 dark:text-green-400">
                    <CheckCircleIcon className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-semibold text-green-900 dark:text-green-100 text-sm">Correction Applied</h4>
                    <p className="text-xs text-green-800 dark:text-green-200 mt-1">Order #{data.orderId} updated to "{data.suggestion}".</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-amber-50 dark:bg-amber-900/20 px-4 py-3 border-b border-amber-100 dark:border-amber-800 flex items-center gap-2">
                <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                <h4 className="font-semibold text-amber-900 dark:text-amber-100 text-sm">Potential Error Detected</h4>
            </div>

            <div className="p-4 space-y-4">
                {/* Context Info */}
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Order <strong>#{data.orderId}</strong></span>
                    <span>Client: Herman Miller Dealer</span>
                </div>

                {/* Diff View */}
                <div className="bg-muted/50 rounded-lg p-3 grid grid-cols-[1fr,auto,1fr] gap-2 items-center text-sm border border-border">
                    <div className="space-y-1 opacity-50">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Original</p>
                        <div className="font-medium text-muted-foreground line-through decoration-red-500 decoration-2">{data.issue}</div>
                        <div className="text-xs text-muted-foreground">Standard Carpet</div>
                    </div>

                    <ArrowRightIcon className="w-4 h-4 text-zinc-300" />

                    <div className="space-y-1">
                        <p className="text-xs text-green-600 dark:text-green-400 uppercase tracking-wider font-semibold">Correction</p>
                        <div className="font-bold text-green-700 dark:text-green-400">{data.suggestion}</div>
                        <div className="text-xs text-muted-foreground">Hard Floor (C7)</div>
                    </div>
                </div>

                {/* AI Reasoning */}
                <p className="text-xs text-muted-foreground italic">
                    "Project scope specifies 'Polished Concrete' floors throughout the office. Standard casters will slip."
                </p>

                <button
                    onClick={handleApply}
                    className="w-full py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                    <CheckCircleIcon className="w-4 h-4" />
                    Apply Correction
                </button>
            </div>
        </div>
    );
}
