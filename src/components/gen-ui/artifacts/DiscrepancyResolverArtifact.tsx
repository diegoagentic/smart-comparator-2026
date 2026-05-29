import { useState, useEffect } from 'react';
import {
    CheckCircleIcon,
    XCircleIcon,
    ArrowRightIcon,
    SparklesIcon,
    ShieldExclamationIcon,
    ArrowPathIcon,
    BoltIcon,
    DocumentTextIcon,
    ScaleIcon
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

// Unified Inconsistency Type
export interface InconsistencyItem {
    id: string;
    type: 'header' | 'rule' | 'line_item';
    title: string;
    description?: string;
    severity: 'high' | 'medium' | 'low';

    original: {
        label: string;
        value: string | number;
        subText?: string;
    };

    suggestion: {
        label: string;
        value: string | number;
        subText?: string;
        reason: string;
        confidence: number;
    };

    // For line items specifically (keeping strict typing optional or via metadata)
    metadata?: any;
}

interface InconsistencyResolverProps {
    issues: InconsistencyItem[];
    onResolve: (id: string, action: 'accept' | 'keep' | 'manual', data?: any) => void;
    onClose: () => void;
    title?: string;
}

export default function InconsistencyResolverArtifact({ issues, onResolve, onClose, title }: InconsistencyResolverProps) {
    const [initialTotal, setInitialTotal] = useState(issues.length);
    const [processedCount, setProcessedCount] = useState(0);
    const [isAutoFixing, setIsAutoFixing] = useState(false);
    const [selectedValue, setSelectedValue] = useState<string>('');

    const isSubstitution = title === 'Review Substitutions';

    // Sync initial total if issues array grows unexpectedly (optional safety)
    useEffect(() => {
        if (issues.length > initialTotal) {
            setInitialTotal(issues.length + processedCount);
        }
    }, [issues.length, initialTotal, processedCount]);

    // Close if no issues remaining
    useEffect(() => {
        if (issues.length === 0 && !isAutoFixing) {
            onClose();
        }
    }, [issues, onClose, isAutoFixing]);

    // Always take the first item as the list shrinks on resolve
    const currentIssue = issues[0];

    useEffect(() => {
        if (currentIssue?.metadata?.options && currentIssue.metadata.options.length > 0) {
            setSelectedValue(currentIssue.metadata.options[0].sku);
        } else {
            setSelectedValue('');
        }
    }, [currentIssue]);

    // Safety check for render
    if (!currentIssue) return null;

    const confidence = currentIssue.suggestion?.confidence || 0;
    const progressIndex = processedCount + 1;

    const handleAction = (action: 'accept' | 'keep') => {
        const hasOptions = currentIssue.metadata?.options && currentIssue.metadata.options.length > 0;
        onResolve(currentIssue.id, action, hasOptions ? selectedValue : undefined);
        // Increment processed count for UI progress
        setProcessedCount(prev => prev + 1);
        // Do NOT increment index, as the resolved item is removed from the array
    };

    const handleBatchFix = async () => {
        setIsAutoFixing(true);
        // Simulate batch processing
        const remaining = [...issues];
        let count = 0;
        for (const issue of remaining) {
            await new Promise(r => setTimeout(r, 200));
            onResolve(issue.id, 'accept');
            count++;
        }
        setProcessedCount(prev => prev + count);
        setIsAutoFixing(false);
        onClose(); // Handled by effect but good to be explicit
    };

    // Helper to render type icon
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'header': return <DocumentTextIcon className="w-5 h-5 text-blue-500" />;
            case 'rule': return <ScaleIcon className="w-5 h-5 text-indigo-500" />;
            case 'line_item': return <BoltIcon className="w-5 h-5 text-amber-500" />;
            default: return <BoltIcon className="w-5 h-5" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'header': return 'Context Inconsistency';
            case 'rule': return 'Business Rule Warning';
            case 'line_item': return 'Asset Data Mismatch';
            default: return 'Inconsistency';
        }
    };

    const formatCurrency = (val: string | number) => {
        if (typeof val === 'number') return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
        return val;
    };

    return (
        <div className="relative w-full max-w-2xl bg-card rounded-2xl shadow-sm border border-border flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in duration-300 my-auto">

            {/* Header */}
            <div className={`shrink-0 p-6 border-b flex justify-between items-center z-10 ${isSubstitution ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800/50' : 'bg-card border-zinc-100 dark:border-zinc-800'}`}>
                <div>
                    <h2 className="text-xl font-bold font-brand flex items-center gap-2 text-foreground">
                        {isSubstitution ? <SparklesIcon className="w-6 h-6 text-indigo-500" /> : getTypeIcon(currentIssue.type)}
                        {title || 'Review Inconsistency'}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Issue {progressIndex} of {initialTotal} • <span className={isSubstitution ? "text-indigo-600 font-medium" : "text-amber-600 font-medium"}>Resolution Required</span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-300 ${isSubstitution ? 'bg-indigo-500' : 'bg-amber-500'}`}
                            style={{ width: `${(progressIndex / initialTotal) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8 scrollbar-micro bg-muted/50 dark:bg-black/10">

                {isAutoFixing ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-12">
                        <SparklesIcon className="w-12 h-12 text-indigo-500 animate-pulse mb-4" />
                        <h3 className="text-xl font-semibold">Auto-Resolving Remaining Issues...</h3>
                        <p className="text-muted-foreground">Applying AI recommendations with high confidence.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-8 h-full">
                        {/* Original */}
                        <div className="space-y-4">
                            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <ShieldExclamationIcon className="w-4 h-4" /> Original {currentIssue.type === 'header' ? 'Context' : 'Value'}
                            </div>
                            <div className="bg-card/50 p-6 rounded-xl border border-border/50 h-full flex flex-col">
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <label className="text-xs text-muted-foreground">{currentIssue.title}</label>
                                        <div className="font-medium text-foreground text-lg mt-1">{currentIssue.description}</div>
                                    </div>

                                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                        <label className="text-xs text-muted-foreground">{currentIssue.original.label}</label>
                                        <div className="font-mono text-sm bg-muted p-2 rounded border border-border mt-1">
                                            {String(currentIssue.original.value)}
                                        </div>
                                        {currentIssue.original.subText && (
                                            <div className="text-xs text-muted-foreground mt-1">{currentIssue.original.subText}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/10 p-2 rounded inline-block">
                                        {getTypeLabel(currentIssue.type)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI Suggestion */}
                        <div className="space-y-4">
                            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                                <SparklesIcon className="w-4 h-4" /> {currentIssue.metadata?.options ? 'Manual Substitution Required' : 'AI Recommendation'}
                                <span className="ml-auto text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                                    {confidence}% Confidence
                                </span>
                            </div>
                            <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/10 dark:to-zinc-900 p-6 rounded-xl border border-indigo-200 dark:border-indigo-800 shadow-sm h-full relative overflow-hidden flex flex-col">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>

                                <div className="flex-1 space-y-4 relative z-10">
                                    <div>
                                        <label className="text-xs text-indigo-600/70 dark:text-indigo-400/70">Analysis</label>
                                        <div className="text-sm font-medium text-indigo-900 dark:text-indigo-100 mt-2 space-y-2">
                                            {currentIssue.suggestion.reason.split(',').map((criteria, idx) => (
                                                <div key={idx} className="flex items-start gap-2">
                                                    <CheckCircleIcon className="w-4 h-4 mt-0.5 shrink-0 text-indigo-500" />
                                                    <span className="leading-snug">{criteria.trim()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-indigo-100 dark:border-indigo-800">
                                        <label className="text-xs text-indigo-600/70 dark:text-indigo-400/70">Proposed {currentIssue.suggestion.label}</label>

                                        {currentIssue.metadata?.options ? (
                                            <div className="mt-2 space-y-2 relative z-20">
                                                <select
                                                    value={selectedValue}
                                                    onChange={e => setSelectedValue(e.target.value)}
                                                    className="w-full text-sm bg-card p-2.5 rounded-lg border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                >
                                                    {currentIssue.metadata.options.map((opt: any) => (
                                                        <option key={opt.sku} value={opt.sku}>
                                                            {opt.name} - {formatCurrency(opt.price)} ({opt.subText})
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-900/10 px-2 py-1 rounded">
                                                    Action Needed: Select an alternative SKU
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="font-mono text-sm bg-card p-2 rounded border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-sm flex items-center gap-2 mt-1">
                                                    {String(currentIssue.suggestion.value)}
                                                    <CheckCircleIcon className="w-4 h-4 text-green-500 ml-auto" />
                                                </div>
                                                {currentIssue.suggestion.subText && (
                                                    <div className="text-xs text-green-600 font-medium mt-1">{currentIssue.suggestion.subText}</div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Controls */}
            <div className="shrink-0 p-6 border-t border-zinc-100 dark:border-zinc-800 bg-card flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-xs text-muted-foreground italic w-full sm:w-auto text-center sm:text-left">
                    Resolution required to proceed.
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
                    {issues.length > 0 && (
                        <button
                            onClick={handleBatchFix}
                            disabled={isAutoFixing}
                            className={`mr-2 px-3 py-2 text-xs font-bold uppercase tracking-wide disabled:opacity-50 whitespace-nowrap flex items-center gap-1 rounded-lg transition-colors ${isSubstitution ? 'text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30' : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30'}`}
                        >
                            <SparklesIcon className="w-4 h-4" />
                            Auto-Fix ({issues.length})
                        </button>
                    )}

                    {!isSubstitution && (
                        <button
                            onClick={() => handleAction('keep')}
                            disabled={isAutoFixing}
                            className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-border text-muted-foreground font-medium hover:bg-muted dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            <XCircleIcon className="w-4 h-4" />
                            Keep Original
                        </button>
                    )}
                    <button
                        onClick={() => handleAction('accept')}
                        disabled={isAutoFixing}
                        className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-white font-bold transition-colors shadow-sm flex items-center justify-center gap-2 whitespace-nowrap ${isSubstitution ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-indigo-900/20' : 'bg-amber-600 hover:bg-amber-700 shadow-amber-200 dark:shadow-amber-900/20'}`}
                    >
                        <CheckCircleIcon className="w-4 h-4" />
                        Accept & Next
                    </button>
                </div>
            </div>

        </div>
    );
}
