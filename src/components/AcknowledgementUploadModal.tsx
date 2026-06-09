import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import AckImportFlow, { type AckFormData } from './forms/AckImportFlow'
import AckCreationForm from './forms/AckCreationForm'

interface AcknowledgementUploadModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function AcknowledgementUploadModal({ isOpen, onClose }: AcknowledgementUploadModalProps) {
    const [step, setStep] = useState<'import' | 'form'>('import')
    const [initialFormData, setInitialFormData] = useState<Partial<AckFormData> | undefined>(undefined)

    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                setStep('import')
                setInitialFormData(undefined)
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    const handleImportComplete = (data: AckFormData) => {
        setInitialFormData(data)
        setStep('form')
    }

    const handleFormSubmit = (data: AckFormData) => {
        console.log('Acknowledgement Created:', data)
        setTimeout(() => onClose(), 1500)
    }

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300" enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200" leaveFrom="opacity-100 translate-y-0 sm:scale-100" leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-background text-left shadow-2xl transition-all border border-border w-full sm:max-w-6xl h-[90vh]">
                                {step === 'import' ? (
                                    <AckImportFlow
                                        onImportComplete={handleImportComplete}
                                        onCancel={onClose}
                                    />
                                ) : (
                                    <AckCreationForm
                                        initialData={initialFormData}
                                        onSubmit={handleFormSubmit}
                                        onCancel={() => setStep('import')}
                                    />
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}
