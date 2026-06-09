import { useState } from 'react';
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    DocumentTextIcon,
    ArrowPathIcon,
    ChevronDownIcon,
    PencilSquareIcon,
    BoltIcon,
    SparklesIcon,
    ArrowLongRightIcon,
    ChartBarIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';
import EditAssetModal from './AssetReview/EditAssetModal';
import DiscountStructureWidget from './AssetReview/DiscountStructureWidget';
import MappingField from './AssetReview/MappingField';
import SuggestionModal from './AssetReview/SuggestionModal';
import { type OrderFormData } from '../../forms/OrderCreationForm';

// Reuse AssetType for compatibility
export interface AssetType {
    id: string;
    description: string;
    sku: string;
    qty: number;
    unitPrice: number;
    basePrice: number;
    totalPrice: number;
    status: 'validated' | 'review' | 'suggestion';
    issues?: string[];
    // ... other props
    suggestion?: {
        sku: string;
        price: number;
        reason: string;
    };
}

interface OrderAdaptationArtifactProps {
    initialData: OrderFormData;
    onConfirm: (data: OrderFormData) => void;
    onCancel: () => void;
}

export default function OrderAdaptationArtifact({ initialData, onConfirm, onCancel }: OrderAdaptationArtifactProps) {
    const [currentStep, setCurrentStep] = useState<'map' | 'review' | 'discount' | 'finalize'>('review'); // Start at review normally
    const [filter, setFilter] = useState<'all' | 'attention' | 'validated'>('all');

    // Convert Items to Assets
    const [assets, setAssets] = useState<AssetType[]>(initialData.items.map((item: any) => ({
        ...item,
        sku: item.id, // Fallback
        basePrice: item.unitPrice,
        totalPrice: item.total,
        status: 'validated' // Default to validated for Quote->Order
    })));

    // Mock validation logic - Induce some "Stock Warnings" if qty > 100
    useState(() => {
        setAssets(prev => prev.map(a => {
            if (a.qty > 100) {
                return {
                    ...a,
                    status: 'review',
                    issues: ['Low Stock Warning', 'Verify Lead Time']
                };
            }
            return a;
        }));
    });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<AssetType | null>(null);
    const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
    const [selectedSuggestionAsset, setSelectedSuggestionAsset] = useState<AssetType | null>(null);

    // Filter Logic
    const filteredAssets = assets.filter(a => {
        if (filter === 'all') return true;
        if (filter === 'attention') return a.status === 'review' || a.status === 'suggestion';
        if (filter === 'validated') return a.status === 'validated';
        return true;
    });

    const stats = {
        total: assets.length,
        attention: assets.filter(a => a.status === 'review' || a.status === 'suggestion').length,
        validated: assets.filter(a => a.status === 'validated').length,
        totalValue: assets.reduce((acc, curr) => acc + curr.totalPrice, 0)
    };

    // State for final pricing (post-discounts)
    const [finalOrderTotal, setFinalOrderTotal] = useState(stats.totalValue);

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    const handleEdit = (asset: AssetType) => {
        setEditingAsset(asset);
        setIsEditModalOpen(true);
    };

    const handleSaveAsset = (updatedAsset: AssetType) => {
        setAssets(prev => prev.map(a => a.id === updatedAsset.id ? { ...updatedAsset, status: 'validated', issues: [] } : a));
    };

    const handleConfirm = () => {
        // Convert back to OrderFormData
        const updatedData: OrderFormData = {
            ...initialData,
            // In a real app, we'd distribute the discounts or add a top-level discount field
            // For now, we'll just pass the items through
            items: assets.map(a => ({
                id: a.id,
                description: a.description,
                qty: a.qty,
                unitPrice: a.unitPrice,
                total: a.totalPrice
            }))
        };
        onConfirm(updatedData);
    };

    return (
        <div className="flex flex-col h-full bg-muted/30 overflow-hidden">
            {/* Header */}
            <div className="bg-background border-b border-border p-4 flex justify-between items-center shadow-sm z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onCancel} className="p-1 -ml-1 rounded-lg text-muted-foreground hover:bg-accent transition-colors">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-xl font-bold font-brand text-foreground tracking-tight">Order Adaptation</h2>
                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-full text-[10px] font-semibold uppercase tracking-widest">Editing</span>
                        </div>
                        <p className="text-muted-foreground text-xs">Reviewing {stats.total} items from Quote {initialData.poNumber}</p>
                    </div>
                </div>

                {/* Stepper */}
                <div className="hidden md:flex items-center gap-2 text-sm font-medium bg-muted/50 p-1.5 rounded-full border border-border">
                    <button
                        onClick={() => setCurrentStep('review')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all ${currentStep === 'review' ? 'bg-background shadow-sm text-foreground ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${currentStep === 'review' ? 'bg-primary/10 text-primary' : 'bg-zinc-200 dark:bg-zinc-700 text-muted-foreground'}`}>1</span>
                        Review Assets
                    </button>
                    <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-1"></div>
                    <button
                        onClick={() => setCurrentStep('discount')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all ${currentStep === 'discount' ? 'bg-background shadow-sm text-foreground ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${currentStep === 'discount' ? 'bg-primary/10 text-primary' : 'bg-zinc-200 dark:bg-zinc-700 text-muted-foreground'}`}>2</span>
                        Pricing
                    </button>
                    <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-1"></div>
                    <button
                        onClick={() => setCurrentStep('finalize')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all ${currentStep === 'finalize' ? 'bg-background shadow-sm text-foreground ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${currentStep === 'finalize' ? 'bg-primary/10 text-primary' : 'bg-zinc-200 dark:bg-zinc-700 text-muted-foreground'}`}>3</span>
                        Finalize
                    </button>
                </div>

                <div className="w-24"></div> {/* Spacer */}
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Mode 1: Review List */}
                {currentStep === 'review' && (
                    <>
                        {/* Left Panel: List */}
                        <div className="flex-1 flex flex-col min-w-0 bg-background border-r border-border">
                            {/* Filter Bar */}
                            <div className="p-4 border-b border-border flex justify-between items-center bg-background text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-foreground">Filter:</span>
                                    <div className="flex bg-muted p-1 rounded-lg">
                                        <button
                                            onClick={() => setFilter('all')}
                                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${filter === 'all' ? 'bg-white dark:bg-zinc-700 shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            All ({stats.total})
                                        </button>
                                        <button
                                            onClick={() => setFilter('attention')}
                                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${filter === 'attention' ? 'bg-white dark:bg-zinc-700 shadow-sm text-amber-600 dark:text-amber-500' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                                            Alerts ({stats.attention})
                                        </button>
                                    </div>
                                </div>
                                <span className="text-muted-foreground text-xs">Total: {formatCurrency(stats.totalValue)}</span>
                            </div>

                            {/* List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-micro bg-muted/30">
                                {filteredAssets.map(asset => (
                                    <div key={asset.id} className="bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow group">
                                        <div className="flex gap-4 items-start">
                                            <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${asset.status === 'review' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                                                {asset.status === 'review' ? <ExclamationTriangleIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-semibold text-foreground text-sm truncate">{asset.description}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs text-muted-foreground">SKU: {asset.sku} • Qty: {asset.qty}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-semibold text-foreground text-sm">{formatCurrency(asset.totalPrice)}</div>
                                                        <div className="text-xs text-muted-foreground">{formatCurrency(asset.unitPrice)} ea</div>
                                                    </div>
                                                </div>
                                                {asset.status === 'review' && asset.issues && (
                                                    <div className="mt-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-lg p-2 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
                                                        <ExclamationTriangleIcon className="w-4 h-4" />
                                                        <span>{asset.issues.join(', ')}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleEdit(asset)}
                                                className="px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors flex items-center gap-1"
                                            >
                                                <PencilSquareIcon className="w-3.5 h-3.5" />
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-border bg-background flex justify-end">
                                <button
                                    onClick={() => setCurrentStep('discount')}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                                >
                                    <span className="text-sm">Next: Pricing & Warranties</span>
                                    <ArrowLongRightIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Right Panel: Preview */}
                        <div className="w-1/3 border-l border-border bg-zinc-100 dark:bg-zinc-950 hidden lg:flex flex-col">

                            <div className="p-3 border-b border-border bg-background text-sm font-medium flex items-center gap-2">
                                <DocumentTextIcon className="w-4 h-4" /> Order Summary
                            </div>
                            <div className="flex-1 p-8 overflow-y-auto scrollbar-micro flex justify-center">
                                <div className="bg-white w-full max-w-[300px] min-h-[500px] h-fit shadow-lg rounded-sm border p-6 text-[10px] flex flex-col text-zinc-900">
                                    <div className="font-bold text-lg mb-4 text-center text-zinc-950">ORDER #{initialData.poNumber}</div>
                                    <div className="space-y-1 mb-4 text-muted-foreground">
                                        <div className="flex justify-between"><span>Customer:</span><span className="font-bold text-zinc-900">{initialData.customerId}</span></div>
                                        <div className="flex justify-between"><span>Date:</span><span>{initialData.requestedDate}</span></div>
                                    </div>
                                    <div className="border-t border-b border-zinc-200 py-2 my-2 space-y-2 flex-1 text-zinc-800">
                                        {assets.map(a => (
                                            <div key={a.id} className="flex justify-between">
                                                <span className="truncate flex-1 pr-2">{a.description}</span>
                                                <span className="font-mono text-zinc-900">{formatCurrency(a.totalPrice)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="font-bold text-right pt-2 text-sm text-zinc-950">TOTAL: {formatCurrency(stats.totalValue)}</div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Mode 2: Discount/Pricing */}
                {currentStep === 'discount' && (
                    <div className="flex-1 p-6 bg-muted/30 overflow-y-auto flex justify-center">
                        <div className="w-full max-w-4xl">
                            <DiscountStructureWidget
                                subtotal={stats.totalValue}
                                onApply={(newTotal) => {
                                    setFinalOrderTotal(newTotal);
                                    setCurrentStep('finalize');
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Overlays */}
                {currentStep === 'finalize' && (
                    <div className="absolute inset-0 z-20 bg-background flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center mb-6">
                                <CheckCircleIcon className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Ready to Create?</h3>
                            <p className="text-muted-foreground mb-8">
                                You are about to create an order for <span className="font-bold text-foreground">{stats.total} items</span> totaling <span className="font-bold text-foreground">{formatCurrency(stats.totalValue)}</span>.
                            </p>
                            <div className="flex gap-4 w-full">
                                <button onClick={() => setCurrentStep('review')} className="flex-1 py-3 border border-zinc-200 rounded-xl font-semibold hover:bg-muted">Back</button>
                                <button onClick={handleConfirm} className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg hover:bg-primary/90">Create Order</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Modal Reuse */}
                {isEditModalOpen && editingAsset && (
                    <EditAssetModal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        asset={editingAsset}
                        onSave={(asset) => {
                            handleSaveAsset(asset);
                            setIsEditModalOpen(false);
                        }}
                    />
                )}
            </div>
        </div>
    );
}
