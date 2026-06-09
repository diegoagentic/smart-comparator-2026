import { Fragment, useEffect, useMemo, useState } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { X, RefreshCw } from 'lucide-react'
import { type PaneView } from './left-rail/PreflightLeftRail'
import ModalFooter from './footer/ModalFooter'
import SectionNavStepper from './footer/SectionNavStepper'
import HeaderFieldsPane from './panes/HeaderFieldsPane'
import LineItemsPane from './panes/LineItemsPane'
import ExtrasPane from './panes/ExtrasPane'
import KpiCallout from './KpiCallout'
import OrderbahnSyncBanner from './OrderbahnSyncBanner'
import PreflightSummaryPopover from './PreflightSummaryPopover'
import PublishingOverlay from './states/PublishingOverlay'
import PublishedView, { type PublishResult } from './states/PublishedView'
import { getPreflightForDoc } from './mockPreflightData'
import { usePreflight } from './usePreflight'
import { configFor } from './recordTypeConfig'
import type { RecordType, ExtraField } from './types'

export type { RecordType } from './types'

export interface CreateRecordDoc {
    id: string
    name: string
    vendor: string
    type: string
}

interface CreateRecordModalProps {
    isOpen: boolean
    onClose: () => void
    document: CreateRecordDoc | null
    recordType: RecordType
    onCreated?: (recordId: string) => void
}

export default function CreateRecordModal({
    isOpen,
    onClose,
    document,
    recordType,
    onCreated,
}: CreateRecordModalProps) {
    const [view, setView] = useState<PaneView>('header')
    const preflight = useMemo(
        () => (document ? getPreflightForDoc(document) : null),
        [document]
    )
    const preflightSafe = preflight ?? {
        recordType,
        environment: 'qa' as const,
        sections: [],
        lineItems: [],
        extras: [],
    }
    const {
        summary,
        headerCounts,
        lineCounts,
        overrideCount,
        fieldState,
        setFS,
    } = usePreflight(preflightSafe)

    // Extras live in their own local state since users toggle include/edit values.
    // Re-seeded whenever the source preflight changes (= different document).
    const [extras, setExtras] = useState<ExtraField[]>([])
    useEffect(() => {
        if (preflight) setExtras(preflight.extras.map(x => ({ ...x })))
    }, [preflight])

    // Terminal states: publishing spinner → result success view
    const [publishing, setPublishing] = useState(false)
    const [result, setResult] = useState<PublishResult | null>(null)

    // Reset terminal state whenever the modal closes or document changes
    useEffect(() => {
        if (!isOpen) {
            const t = setTimeout(() => {
                setPublishing(false)
                setResult(null)
                setView('header')
            }, 200)
            return () => clearTimeout(t)
        }
    }, [isOpen])

    if (!document || !preflight) return null

    const handleCreate = () => {
        if (publishing) return
        setPublishing(true)
        setTimeout(() => {
            const recordId = `${recordType === 'PO' ? 'PO' : 'ACK'}-${Math.floor(Math.random() * 9000) + 1000}`
            // fields saved = resolved + ai_suggested (committed) + included extras
            const fieldsSaved = summary.resolved + extras.filter(x => x.included).length
            const fieldsDropped = summary.unmapped
            setResult({
                recordId,
                fieldsSaved,
                fieldsDropped,
                lineCount: preflight.lineItems.length,
                environment: preflight.environment,
            })
            setPublishing(false)
        }, 1400)
    }

    const handleViewRecord = () => {
        if (result) onCreated?.(result.recordId)
        onClose()
    }

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[200]" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-md" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-6">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-260" enterFrom="opacity-0 translate-y-2 scale-[0.995]" enterTo="opacity-100 translate-y-0 scale-100"
                            leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-[0.995]"
                        >
                            <DialogPanel className="relative w-full max-w-[1120px] h-[760px] rounded-3xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col">
                                {publishing && <PublishingOverlay />}

                                {result ? (
                                    <PublishedView
                                        result={result}
                                        recordType={recordType}
                                        vendor={document.vendor}
                                        onClose={onClose}
                                        onViewRecord={handleViewRecord}
                                    />
                                ) : (
                                    <>
                                {(() => {
                                    const cfg = configFor(recordType)
                                    return (
                                        <header className="px-6 py-4 flex items-center justify-between border-b border-border shrink-0">
                                            <div className="min-w-0">
                                                <div className="text-[15px] font-semibold text-foreground leading-tight">
                                                    Orderbahn — {cfg.label.charAt(0).toUpperCase() + cfg.label.slice(1)}
                                                </div>
                                                <div className="text-[12px] text-muted-foreground leading-tight mt-0.5">
                                                    {document.vendor} · <span className="font-mono">{document.id}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <PreflightSummaryPopover summary={summary} />
                                                <button
                                                    onClick={onClose}
                                                    title="Close without creating record"
                                                    className="inline-flex items-center justify-center size-7 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                                    aria-label="Close"
                                                >
                                                    <X className="size-4" />
                                                </button>
                                            </div>
                                        </header>
                                    )
                                })()}

                                <OrderbahnSyncBanner
                                    changesCount={2 + (document.id.charCodeAt(document.id.length - 1) % 4)}
                                />

                                <KpiCallout
                                    preflight={preflight}
                                    recordType={recordType}
                                    fieldState={fieldState}
                                />

                                {/* Section navigation row */}
                                <div className="px-6 py-2.5 border-b border-border flex items-center justify-between shrink-0">
                                    <SectionNavStepper
                                        view={view}
                                        setView={setView}
                                        issuesByStep={{
                                            header: headerCounts.issues,
                                            lineItems: lineCounts.issues,
                                        }}
                                    />
                                    <button
                                        onClick={() => {}}
                                        title="Refresh field values from Orderbahn catalog"
                                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card hover:bg-muted px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <RefreshCw className="size-3.5" />
                                        Refresh
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-minimal">
                                    {view === 'header' && (
                                        <HeaderFieldsPane
                                            preflight={preflight}
                                            fieldState={fieldState}
                                            setFS={setFS}
                                        />
                                    )}
                                    {view === 'lineItems' && (
                                        <LineItemsPane
                                            preflight={preflight}
                                            fieldState={fieldState}
                                            setFS={setFS}
                                        />
                                    )}
                                    {view === 'extras' && (
                                        <ExtrasPane
                                            extras={extras}
                                            setExtras={setExtras}
                                        />
                                    )}
                                </div>

                                <ModalFooter
                                    canCreate={summary.valid}
                                    onCancel={onClose}
                                    onCreate={handleCreate}
                                />
                                    </>
                                )}
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
