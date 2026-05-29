import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
    XMarkIcon,
    CheckCircleIcon,
    TruckIcon,
    WrenchScrewdriverIcon,
    MapPinIcon,
    CameraIcon,
    DocumentTextIcon,
    UserIcon,
    ClockIcon,
    SparklesIcon,
    ChatBubbleLeftRightIcon,
    PhoneIcon,
    EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export interface TrackingStep {
    id: string;
    title: string;
    description?: string;
    status: 'completed' | 'current' | 'upcoming';
    timestamp?: string;
    location?: string;
    actor?: string; // Who performed the action
    evidence?: {
        type: 'photo' | 'signature' | 'note';
        url?: string; // For photos
        content?: string; // For notes or signature text
        label: string;
    }[];
}

interface TrackingModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    trackingId?: string;
    type: 'movement' | 'maintenance';
    steps: TrackingStep[];
}

export default function TrackingModal({ isOpen, onClose, title, trackingId, type, steps }: TrackingModalProps) {
    const [activeCommentStep, setActiveCommentStep] = React.useState<string | null>(null);
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-card p-6 text-left align-middle shadow-xl transition-all border border-border">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-foreground flex items-center gap-2">
                                            {type === 'movement' ? <TruckIcon className="w-5 h-5 text-blue-500" /> : <WrenchScrewdriverIcon className="w-5 h-5 text-amber-500" />}
                                            Tracking Progress
                                        </Dialog.Title>
                                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                                            <span className="font-semibold text-foreground">{title}</span>
                                            <span>•</span>
                                            <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">{trackingId}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-full text-xs font-medium text-foreground transition-colors">
                                            <PhoneIcon className="w-3.5 h-3.5" />
                                            Contact Team
                                        </button>
                                        <button
                                            onClick={onClose}
                                            className="rounded-full p-1 hover:bg-muted/80 transition-colors"
                                        >
                                            <XMarkIcon className="w-5 h-5 text-muted-foreground" />
                                        </button>
                                    </div>
                                </div>

                                {/* AI Forecast Section */}
                                <div className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 border border-indigo-100 dark:border-indigo-800/30 rounded-xl p-4 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5">
                                        <SparklesIcon className="w-24 h-24 text-indigo-500" />
                                    </div>
                                    <div className="relative z-10 flex items-start gap-3">
                                        <div className="p-2 bg-card rounded-lg shadow-sm border border-indigo-100 dark:border-indigo-800/50">
                                            <SparklesIcon className="w-5 h-5 text-indigo-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-200 mb-1">AI Smart Forecast</h4>
                                            <p className="text-sm text-indigo-700 dark:text-indigo-300">
                                                Based on current traffic and workflow velocity, the team is expected to arrive <span className="font-semibold">15 minutes early</span>.
                                            </p>
                                            <div className="flex items-center gap-4 mt-2">
                                                <div className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                    98% Probability
                                                </div>
                                                <div className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                                                    <ClockIcon className="w-3.5 h-3.5" />
                                                    ETA: 2:45 PM
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative pl-4 sm:pl-8 py-2">
                                    {/* Timeline Line */}
                                    <div className="absolute left-[27px] sm:left-[43px] top-6 bottom-6 w-0.5 bg-zinc-200 dark:bg-zinc-700" />

                                    <div className="space-y-10 relative">
                                        {steps.map((step, stepIdx) => (
                                            <div key={step.id} className="relative flex items-start group">
                                                {/* Dot/Icon */}
                                                <div className={cn(
                                                    "absolute left-0 sm:left-4 -ml-px h-8 w-8 rounded-full flex items-center justify-center border-2 z-10 bg-card",
                                                    step.status === 'completed' ? "border-green-500 text-green-500" :
                                                        step.status === 'current' ? "border-blue-500 text-blue-500 animate-pulse" :
                                                            "border-border text-zinc-300 dark:text-muted-foreground"
                                                )}>
                                                    {step.status === 'completed' ? <CheckCircleIcon className="w-5 h-5" /> :
                                                        step.status === 'current' ? <div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> :
                                                            <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />}
                                                </div>

                                                <div className="ml-12 sm:ml-20 flex-1">
                                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                                        <div>
                                                            <h4 className={cn(
                                                                "text-base font-semibold",
                                                                step.status === 'completed' ? "text-foreground" :
                                                                    step.status === 'current' ? "text-blue-600 dark:text-blue-400" :
                                                                        "text-muted-foreground"
                                                            )}>
                                                                {step.title}
                                                            </h4>
                                                            {step.description && <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>}
                                                        </div>
                                                        {step.timestamp && (
                                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap bg-muted/50 px-2 py-1 rounded border border-border">
                                                                <ClockIcon className="w-3.5 h-3.5" />
                                                                {step.timestamp}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Meta Info (Location/Actor) */}
                                                    {(step.location || step.actor) && (
                                                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                                                            {step.actor && (
                                                                <span className="flex items-center gap-1">
                                                                    <UserIcon className="w-3.5 h-3.5" />
                                                                    {step.actor}
                                                                </span>
                                                            )}
                                                            {step.location && (
                                                                <span className="flex items-center gap-1">
                                                                    <MapPinIcon className="w-3.5 h-3.5" />
                                                                    {step.location}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Evidence Section */}
                                                    {step.evidence && step.evidence.length > 0 && (
                                                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            {step.evidence.map((ev, idx) => (
                                                                <div key={idx} className="bg-muted/50 rounded-lg p-3 border border-border flex items-start gap-3">
                                                                    <div className="shrink-0 mt-0.5">
                                                                        {ev.type === 'photo' && <CameraIcon className="w-4 h-4 text-indigo-500" />}
                                                                        {ev.type === 'signature' && <DocumentTextIcon className="w-4 h-4 text-blue-500" />}
                                                                        {ev.type === 'note' && <DocumentTextIcon className="w-4 h-4 text-amber-500" />}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-xs font-medium text-foreground mb-1">{ev.label}</p>
                                                                        {ev.type === 'photo' && ev.url ? (
                                                                            <div className="relative aspect-video rounded overflow-hidden bg-zinc-200 dark:bg-zinc-700 mt-2">
                                                                                <img src={ev.url} alt="Evidence" className="object-cover w-full h-full hover:scale-105 transition-transform cursor-pointer" />
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-xs text-muted-foreground italic line-clamp-2">"{ev.content}"</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Step Actions (Comment) */}
                                                    {step.status === 'current' && (
                                                        <div className="mt-4">
                                                            {activeCommentStep === step.id ? (
                                                                <div className="bg-card p-3 rounded-lg border border-border shadow-lg animate-in fade-in zoom-in-95 duration-200">
                                                                    <textarea
                                                                        className="w-full text-sm bg-transparent border-none focus:ring-0 p-0 placeholder:text-muted-foreground text-foreground resize-none"
                                                                        placeholder="Add a comment or note..."
                                                                        rows={2}
                                                                        autoFocus
                                                                    />
                                                                    <div className="flex justify-end gap-2 mt-2">
                                                                        <button
                                                                            onClick={() => setActiveCommentStep(null)}
                                                                            className="text-xs px-2 py-1 text-muted-foreground hover:text-muted-foreground dark:text-muted-foreground dark:hover:text-zinc-200"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setActiveCommentStep(null)}
                                                                            className="text-xs px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                                                        >
                                                                            Post
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => setActiveCommentStep(step.id)}
                                                                    className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline"
                                                                >
                                                                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                                                    Add Comment
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
