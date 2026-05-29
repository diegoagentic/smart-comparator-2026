import React from 'react';
import type { ArtifactData } from '../../../context/GenUIContext';
import { useGenUI } from '../../../context/GenUIContext';
import ModeSelectionArtifact from './ModeSelectionArtifact';
import ERPSystemSelectorArtifact from './ERPSystemSelectorArtifact';
import ERPSelectorArtifact from './ERPSelectorArtifact';
import QuoteProposalArtifact from './QuoteProposalArtifact';
import OrderCorrectionArtifact from './OrderCorrectionArtifact';
import StockMatrixArtifact from './StockMatrixArtifact';
import WarrantyClaimArtifact from './WarrantyClaimArtifact';
import LayoutProposalArtifact from './LayoutProposalArtifact';
import FieldMappingArtifact from './FieldMappingArtifact';
import ERPConnectModal from './ERPConnectModal';
import ERPPODashboardArtifact from './ERPPODashboardArtifact';
import AssetReviewArtifact from './AssetReviewArtifact';
import QuoteExtractionArtifact from './QuoteExtractionArtifact';
import InventoryCheckArtifact from './InventoryCheckArtifact';
import AnalysisReportArtifact from './AnalysisReportArtifact';
import PricingConfigurationArtifact from './PricingConfigurationArtifact';
import InconsistencyResolverArtifact from './DiscrepancyResolverArtifact';
import OrderSimulationArtifact from './OrderSimulationArtifact';
import QuoteApprovedArtifact from './QuoteApprovedArtifact';
import OrderPlacedArtifact from './OrderPlacedArtifact';

// Artifacts are fully implemented in separate files

const DefaultArtifact = ({ data }: { data: any }) => (
    <div className="p-4 bg-gray-100 rounded-lg text-sm text-muted-foreground">
        {JSON.stringify(data, null, 2)}
    </div>
);

const InconsistencyResolverWrapper = ({ data }: { data: any }) => {
    const { pushSystemArtifact } = useGenUI();
    // Using React.useState here so we don't have to redefine the global imports
    const [issues, setIssues] = React.useState<any[]>(data?.issues || []);
    const hasSent = React.useRef(false);

    React.useEffect(() => {
        if (issues.length === 0 && data?.issues?.length > 0 && !hasSent.current) {
            hasSent.current = true;
            const timeout = setTimeout(() => {
                pushSystemArtifact(
                    "Great, all inconsistencies have been resolved. Now we can review the assets and configure pricing for this quote.",
                    {
                        id: 'art_asset_review_' + Date.now(),
                        type: 'asset_review',
                        data: { totalValue: 245000 }, // Updated Mock total for 40+ workstations
                        source: 'Resolution Complete'
                    }
                );
            }, 800);
            return () => clearTimeout(timeout);
        }
    }, [issues, data, pushSystemArtifact]);

    if (issues.length === 0) {
        return <div className="text-sm font-medium text-green-600 p-4 border border-green-200 bg-green-50 rounded-lg max-w-sm flex items-center gap-2"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> All issues resolved successfully.</div>;
    }

    return (
        <InconsistencyResolverArtifact
            issues={issues}
            onResolve={(id) => setIssues(prev => prev.filter(i => i.id !== id))}
            onClose={() => { }}
        />
    );
};

export default function ArtifactContainer({ artifact }: { artifact: ArtifactData }) {
    const { pushSystemArtifact, navigate } = useGenUI();

    let content = null;
    switch (artifact.type) {
        case 'analysis_report':
            content = <AnalysisReportArtifact data={artifact.data} />;
            break;
        case 'pricing_config':
            content = <PricingConfigurationArtifact data={artifact.data} />;
            break;
        case 'inconsistency_resolver':
            content = <InconsistencyResolverWrapper data={artifact.data} />;
            break;
        case 'mode_selection':
            content = <ModeSelectionArtifact />;
            break;
        case 'quote_extraction':
            content = (
                <div className="min-h-[400px]">
                    <QuoteExtractionArtifact
                        fileName={artifact.data.fileName}
                        onComplete={(extractedData) => {
                            pushSystemArtifact(
                                "I've completed the extraction and mapping process. Please review the analysis below.",
                                {
                                    id: 'art_analysis_report_' + Date.now(),
                                    type: 'analysis_report',
                                    data: extractedData,
                                    source: 'Autonomous Extraction'
                                }
                            );
                        }}
                    />
                </div>
            );
            break;
        case 'erp_system_selector':
            content = <ERPSystemSelectorArtifact />;
            break;
        case 'erp_selector':
            content = <ERPSelectorArtifact />;
            break;
        case 'erp_connect_modal':
            content = <ERPConnectModal data={artifact.data} />;
            break;
        case 'erp_po_dashboard':
            content = <ERPPODashboardArtifact data={artifact.data} />;
            break;
        case 'asset_review':
            content = (
                <div className="w-full max-w-4xl xl:max-w-5xl h-[600px] -ml-2 -mt-2 shadow-lg rounded-2xl overflow-hidden border border-border">
                    <AssetReviewArtifact
                        data={artifact.data}
                        source="upload"
                        onBack={() => {
                            pushSystemArtifact(
                                "Going back to the inconsistency review step. You can re-examine and adjust the items before proceeding.",
                                {
                                    id: 'art_inconsistency_back_' + Date.now(),
                                    type: 'inconsistency_resolver',
                                    data: { issues: [] },
                                    source: 'Back from Asset Review'
                                }
                            );
                        }}
                        onApprove={() => {
                            pushSystemArtifact(
                                "The quote has been validated and approved. You can now generate the Purchase Order or simulate the benefit view.",
                                {
                                    id: 'art_quote_approved_' + Date.now(),
                                    type: 'quote_approved',
                                    data: { client: 'Client Generic', total: '$115,450' },
                                    source: 'Asset Review'
                                }
                            );
                        }}
                    />
                </div>
            );
            break;
        case 'field_mapping_request':
            content = <FieldMappingArtifact data={artifact.data} />;
            break;
        case 'order_correction':
            content = <OrderCorrectionArtifact data={artifact.data} />;
            break;
        case 'inventory_check':
            content = <InventoryCheckArtifact data={artifact.data} />;
            break;
        case 'stock_matrix':
            content = <StockMatrixArtifact data={artifact.data} />;
            break;
        case 'layout_proposal':
            content = <LayoutProposalArtifact data={artifact.data} />;
            break;
        case 'warranty_claim':
            content = <WarrantyClaimArtifact data={artifact.data} />;
            break;
        case 'quote_proposal':
            content = <QuoteProposalArtifact data={artifact.data} />;
            break;
        case 'order_simulation':
            content = (
                <div className="w-full max-w-4xl h-[600px] -ml-2 -mt-2 shadow-lg rounded-2xl overflow-hidden border border-border bg-card">
                    <OrderSimulationArtifact />
                </div>
            );
            break;
        case 'quote_approved':
            content = (
                <div className="w-full max-w-4xl min-h-[450px] -ml-2 -mt-2">
                    <QuoteApprovedArtifact />
                </div>
            );
            break;
        case 'order_placed':
            content = (
                <div className="w-full max-w-4xl h-[450px] -ml-2 -mt-2">
                    <OrderPlacedArtifact />
                </div>
            );
            break;
        default:
            content = <DefaultArtifact data={artifact.data} />;
    }

    return (
        <div className="flex flex-col gap-2">
            {/* Context Source Header */}
            {artifact.source && (
                <div className="flex items-center gap-1.5 px-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-[10px] font-medium text-indigo-500 uppercase tracking-wide">
                        Triggered from {artifact.source}
                    </span>
                </div>
            )}

            {/* The Main Artifact */}
            {content}

            {/* Deep Link Footer */}
            {artifact.link && (
                <div className="flex justify-end pt-2">
                    <button
                        onClick={() => navigate(artifact.link!)}
                        className="text-[10px] font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 border-b border-dashed border-zinc-300 dark:border-zinc-700 pb-0.5 hover:border-primary"
                    >
                        View Permanent Record
                        <span className="font-mono text-[9px] opacity-70">({artifact.link})</span>
                    </button>
                </div>
            )}
        </div>
    );
}
