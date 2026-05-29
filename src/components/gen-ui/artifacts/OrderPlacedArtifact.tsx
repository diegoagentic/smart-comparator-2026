import { SparklesIcon } from '@heroicons/react/24/outline'
import { useGenUI } from '../../../context/GenUIContext'

export default function OrderPlacedArtifact() {
    const { navigate } = useGenUI()

    return (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-card rounded-2xl border border-border shadow-sm animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <SparklesIcon className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-3xl font-bold font-brand text-foreground mb-4">Order Placed Successfully!</h3>
            <p className="text-muted-foreground text-center max-w-md mb-8">
                PO #ORD-7829 has been generated and sent to the vendor. You can track its status in the Orders tab.
            </p>
            <div className="flex gap-4">
                <button
                    onClick={() => {
                        navigate('dashboard')
                    }}
                    className="px-6 py-2 bg-muted text-foreground font-medium rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                    Back to Dashboard
                </button>
                <button
                    onClick={() => {
                        localStorage.setItem('demo_view_order_id', 'ORD-7829')
                        navigate('order-detail')
                    }}
                    className="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg shadow-sm hover:bg-primary/90 transition-colors"
                >
                    View Order Details
                </button>
            </div>
        </div>
    )
}
