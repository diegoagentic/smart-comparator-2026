import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
    XMarkIcon,
    UserGroupIcon,
    CalendarIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    MapPinIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface AssignTeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: any) => void;
    item: any; // Can be MovementRequest or MaintenanceTask
    type: 'movement' | 'maintenance';
}

export default function AssignTeamModal({ isOpen, onClose, onConfirm, item, type }: AssignTeamModalProps) {
    const [assignedTeam, setAssignedTeam] = useState('');
    const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [notes, setNotes] = useState('');

    const teams = [
        'Team Alpha (Logistics)',
        'Team Beta (Installers)',
        'Team Gamma (Movers)',
        'Team Delta (Specialists)',
        'External Provider'
    ];

    const handleSubmit = () => {
        onConfirm({
            ...item,
            assignedTeam,
            priority,
            scheduledDate: `${scheduledDate} at ${scheduledTime}`,
            status: 'Scheduled' // Or 'Assigned', depending on logic
        });
        onClose();
    };

    if (!item) return null;

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
                                <Dialog.Title
                                    as="div"
                                    className="flex items-center justify-between border-b border-border pb-4 mb-6"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <UserGroupIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-foreground">
                                                Assign {type === 'movement' ? 'Movement' : 'Maintenance'} Team & Schedule
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Assign a team, set priority, and schedule the {type} for "{item.assetName}"
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-1 rounded-full hover:bg-muted transition-colors"
                                    >
                                        <XMarkIcon className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                </Dialog.Title>

                                <div className="space-y-6">
                                    {/* Context Card */}
                                    <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                                                    {type === 'movement' ? 'Movement Details' : 'Task Details'}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50 uppercase">
                                                        {item.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-blue-700 dark:text-blue-300">Order Date: {item.requestDate || item.scheduledDate}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Asset</p>
                                                <p className="font-semibold text-foreground">{item.assetName}</p>
                                                <p className="text-muted-foreground text-xs">{item.assetType || item.issueType}</p>
                                            </div>
                                            {type === 'movement' ? (
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">From</p>
                                                        <p className="text-foreground">{item.fromLocation}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">To</p>
                                                        <p className="text-foreground">{item.toLocation}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Issue Description</p>
                                                    <p className="text-foreground line-clamp-2">{item.description}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Assignment Form */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-1">
                                                Assigned Team <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={assignedTeam}
                                                    onChange={(e) => setAssignedTeam(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none"
                                                >
                                                    <option value="">Select a team to handle this {type}</option>
                                                    {teams.map(team => (
                                                        <option key={team} value={team}>{team}</option>
                                                    ))}
                                                </select>
                                                <UserGroupIcon className="w-5 h-5 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                Priority Level
                                            </label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    { value: 'Low', icon: CheckCircleIcon, color: 'text-green-600', border: 'peer-checked:border-green-500 peer-checked:bg-green-50 dark:peer-checked:bg-green-900/20' },
                                                    { value: 'Medium', icon: ClockIcon, color: 'text-amber-600', border: 'peer-checked:border-amber-500 peer-checked:bg-amber-50 dark:peer-checked:bg-amber-900/20' },
                                                    { value: 'High', icon: ExclamationTriangleIcon, color: 'text-red-600', border: 'peer-checked:border-red-500 peer-checked:bg-red-50 dark:peer-checked:bg-red-900/20' }
                                                ].map((p) => (
                                                    <label key={p.value} className="cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="priority"
                                                            value={p.value}
                                                            checked={priority === p.value}
                                                            onChange={(e) => setPriority(e.target.value as any)}
                                                            className="peer sr-only"
                                                        />
                                                        <div className={cn(
                                                            "flex items-center justify-center gap-2 p-3 rounded-lg border border-border hover:bg-muted transition-all",
                                                            p.border
                                                        )}>
                                                            <p.icon className={cn("w-5 h-5", p.color)} />
                                                            <span className="font-medium text-sm">{p.value}</span>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-1">
                                                    Scheduled Date <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="date"
                                                        value={scheduledDate}
                                                        onChange={(e) => setScheduledDate(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                    />
                                                    <CalendarIcon className="w-5 h-5 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-1">
                                                    Scheduled Time <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="time"
                                                        value={scheduledTime}
                                                        onChange={(e) => setScheduledTime(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                    />
                                                    <ClockIcon className="w-5 h-5 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-1">
                                                Additional Notes
                                            </label>
                                            <textarea
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                placeholder="Enter any specific instructions for the team..."
                                                className="w-full p-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[80px]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex items-center justify-end gap-3 border-t border-border pt-4">
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!assignedTeam || !scheduledDate || !scheduledTime}
                                        className="px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        <CheckCircleIcon className="w-4 h-4" />
                                        Assign & Schedule
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
