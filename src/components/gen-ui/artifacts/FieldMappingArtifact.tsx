import { useState } from 'react';
import { ArrowRightIcon, CheckCircleIcon, ExclamationTriangleIcon, DocumentMagnifyingGlassIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useGenUI } from '../../../context/GenUIContext';

interface FieldItem {
    name: string;
    confidence: number;
    text?: string;
    match?: string;
    status: 'auto' | 'review' | 'confirmed';
}

export default function FieldMappingArtifact({ data }: { data: any }) {
    const { sendMessage } = useGenUI();
    const [reviewFields, setReviewFields] = useState<FieldItem[]>(
        data.reviewFields.map((f: any) => ({ ...f, status: 'review' }))
    );
    const [isProcessing, setIsProcessing] = useState(false);

    const handleConfirm = (index: number) => {
        const newFields = [...reviewFields];
        newFields[index].status = 'confirmed';
        setReviewFields(newFields);
    };

    const handleProcess = () => {
        setIsProcessing(true);
        setTimeout(() => {
            sendMessage("System: Mapping confirmed. Extracting line items and generating Quote #QT-3001...");
        }, 1200);
    };

    const allConfirmed = reviewFields.every(f => f.status === 'confirmed');

    return (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden w-full max-w-lg">
            {/* Header */}
            <div className="bg-muted dark:bg-zinc-800/50 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                        <DocumentMagnifyingGlassIcon className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-foreground">Field Mapping Analysis</h4>
                        <p className="text-[10px] text-muted-foreground">{data.fileName}</p>
                    </div>
                </div>
                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-full">
                    {reviewFields.filter(f => f.status === 'review').length} Needs Review
                </span>
            </div>

            <div className="p-4 space-y-6">
                {/* Auto Detected Section */}
                <div className="space-y-2">
                    <p className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1.5">
                        <CheckCircleIcon className="w-3.5 h-3.5" />
                        Auto-Detected (High Confidence)
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {data.detectedFields.map((field: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                                <span className="text-[10px] font-medium text-muted-foreground">{field.name}</span>
                                <span className="text-[9px] font-bold text-green-600 dark:text-green-400">{(field.confidence * 100).toFixed(0)}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Needs Mapping Section */}
                <div className="space-y-3">
                    <p className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                        Needs Verification
                    </p>
                    <div className="space-y-2">
                        {reviewFields.map((field, idx) => (
                            <div
                                key={idx}
                                className={`p-3 rounded-lg border transition-all ${field.status === 'confirmed'
                                    ? 'bg-muted dark:bg-zinc-800/30 border-border opacity-75'
                                    : 'bg-card border-amber-200 dark:border-amber-900/50 shadow-sm'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-1.5 h-1.5 rounded-full ${field.status === 'confirmed' ? 'bg-green-500' : 'bg-amber-500'}`} />
                                        <span className="text-xs font-semibold text-foreground">{field.name}</span>
                                    </div>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${field.status === 'confirmed' ? 'bg-zinc-100 text-muted-foreground' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {(field.confidence * 100).toFixed(0)}% Match
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted dark:bg-zinc-800 p-2 rounded border border-zinc-100 dark:border-zinc-700/50">
                                    <span className="font-mono text-[10px] truncate max-w-[120px]">{field.text}</span>
                                    <ArrowRightIcon className="w-3 h-3 text-zinc-300" />
                                    <span className="font-medium text-foreground flex items-center gap-1">
                                        <SparklesIcon className="w-3 h-3 text-indigo-400" />
                                        {field.match}
                                    </span>
                                </div>

                                {field.status !== 'confirmed' && (
                                    <button
                                        onClick={() => handleConfirm(idx)}
                                        className="mt-2 w-full py-1.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors"
                                    >
                                        Confirm Mapping
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Action */}
                <button
                    onClick={handleProcess}
                    disabled={!allConfirmed || isProcessing}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                    {isProcessing ? 'Processing...' : 'Continue to Asset Processing'}
                    {!isProcessing && <ArrowRightIcon className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
}
