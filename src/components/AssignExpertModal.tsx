import React from 'react'
import { cn } from '../lib/utils'
import { Popover, PopoverButton, PopoverPanel, Transition, Portal } from '@headlessui/react'
import { Fragment } from 'react'

export interface TeamMember {
    id: string;
    name: string;
    initials: string;
    role: string;
    color: string;
    photo?: string;
    isMe?: boolean;
    isOnline?: boolean;
}

export const TEAM_MEMBERS: TeamMember[] = [
    { id: 'me', name: 'Demo User', initials: 'SC', role: 'Account Manager', color: 'bg-indigo-600', isMe: true, isOnline: true },
    { id: 'sarah', name: 'Sarah Johnson', initials: 'SJ', role: 'Expert Hub', color: 'bg-orange-500', photo: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { id: 'marcus', name: 'Marcus Webb', initials: 'MW', role: 'Expert Hub', color: 'bg-orange-500', photo: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { id: 'priyah', name: 'Priyah Shah', initials: 'PS', role: 'Expert Hub', color: 'bg-blue-600' },
    { id: 'daniel', name: 'Daniel Okafor', initials: 'DO', role: 'Expert Hub', color: 'bg-blue-600' },
    { id: 'elena', name: 'Elena Martinez', initials: 'EM', role: 'Account Manager', color: 'bg-green-600' },
]

interface AssignExpertPopoverProps {
    onAssign: (member: TeamMember) => void;
    children: React.ReactNode;
    align?: 'left' | 'right';
}

export default function AssignExpertPopover({ onAssign, children, align = 'right' }: AssignExpertPopoverProps) {
    const me = TEAM_MEMBERS.find(m => m.isMe)
    const team = TEAM_MEMBERS.filter(m => !m.isMe)

    return (
        <Popover className="relative inline-block">
            {({ open, close }) => (
                <>
                    <PopoverButton as={Fragment}>
                        {children}
                    </PopoverButton>

                    <Portal>
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="opacity-0 translate-y-1"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-150"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 translate-y-1"
                        >
                            <PopoverPanel
                                anchor={align === 'right' ? "bottom end" : "bottom start"}
                                className="z-[110] mt-2 w-[240px] bg-card rounded-[20px] shadow-2xl border border-zinc-100 dark:border-zinc-800 focus:outline-none overflow-hidden scrollbar-none"
                            >
                            <div className="p-4">
                                {/* Assign to Me Section */}
                                <div className="space-y-2">
                                    <div className="pb-1 border-b border-zinc-100 dark:border-zinc-800">
                                        <h2 className="text-[9px] font-bold text-muted-foreground dark:text-muted-foreground uppercase tracking-wider">Assign Document</h2>
                                    </div>
                                    
                                    {me && (
                                        <button
                                            onClick={() => {
                                                onAssign(me);
                                                close();
                                            }}
                                            className="w-full flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-muted dark:hover:bg-zinc-800 transition-colors text-left group"
                                        >
                                            <div className={cn("relative h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-[10px] shadow-sm", me.color)}>
                                                {me.initials}
                                                {me.isOnline && (
                                                    <div className="absolute bottom-0 right-0 h-2 w-2 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-bold text-[13px] text-foreground truncate">Assign to me</span>
                                                    <span className="text-[8px] font-bold bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 px-1 py-0.5 rounded-md uppercase">You</span>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground truncate">{me.name} · {me.role}</p>
                                            </div>
                                        </button>
                                    )}
                                </div>

                                {/* Team Members Section */}
                                <div className="mt-4 space-y-2">
                                    <div className="pb-1 border-b border-zinc-100 dark:border-zinc-800">
                                        <h2 className="text-[9px] font-bold text-muted-foreground dark:text-muted-foreground uppercase tracking-wider">Team Members</h2>
                                    </div>
                                    
                                    <div className="space-y-0.5 max-h-[240px] overflow-y-auto pr-1 -mr-1 custom-scrollbar">
                                        {team.map((member) => (
                                            <button
                                                key={member.id}
                                                onClick={() => {
                                                    onAssign(member);
                                                    close();
                                                }}
                                                className="w-full flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-muted dark:hover:bg-zinc-800 transition-colors text-left group"
                                            >
                                                <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-[10px] shadow-sm overflow-hidden", member.color)}>
                                                    {member.photo ? (
                                                        <img src={member.photo} alt={member.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        member.initials
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="block font-bold text-[13px] text-foreground truncate">{member.name}</span>
                                                    <p className="text-[10px] text-muted-foreground truncate">{member.role}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </PopoverPanel>
                    </Transition>
                </Portal>
                </>
            )}
        </Popover>
    )
}
