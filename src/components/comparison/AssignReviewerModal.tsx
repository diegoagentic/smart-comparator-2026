import { Fragment, useState } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { X, Sparkles, ArrowRight, UserCircle, Check } from 'lucide-react'
import { TEAM_MEMBERS, avatarGradient, type TeamMember } from '../team/teamMembers'
import type { ComparisonReport } from './comparisonTypes'

interface AssignReviewerModalProps {
    isOpen: boolean
    onClose: () => void
    /** Called when the user confirms the assignment. */
    onAssign: (member: TeamMember) => void
    /** Used to derive an AI-recommended reviewer + rationale. */
    report: ComparisonReport | null
}

/**
 * Picks an AI-recommended reviewer based on the report. The logic is mocked
 * but explainable: route critical-severity issues to a senior Expert Hub
 * member, lighter ones to whoever is available. The rationale text is
 * report-specific so the demo doesn't feel canned.
 */
function aiRecommendation(report: ComparisonReport | null): { member: TeamMember; rationale: string } | null {
    if (!report) return null
    const isCritical = report.derived_status === 'CRITICAL_ISSUES'
    // For critical issues, prefer Sarah (Expert Hub senior). For lighter
    // routes, prefer Marcus (Expert Hub mid). Both are deterministic for demo.
    const targetId = isCritical ? 'sarah' : 'marcus'
    const member = TEAM_MEMBERS.find(m => m.id === targetId) ?? TEAM_MEMBERS[1]
    const rationale = isCritical
        ? `Sarah has resolved 4 similar ${report.vendor} escalations this quarter — strongest match for unauthorized product substitutions.`
        : `Marcus is currently available and has handled ${report.vendor} reviews before. Average turn-around: 2.4 hours.`
    return { member, rationale }
}

export default function AssignReviewerModal({ isOpen, onClose, onAssign, report }: AssignReviewerModalProps) {
    const ai = aiRecommendation(report)
    const [selectedId, setSelectedId] = useState<string | null>(ai?.member.id ?? null)

    // Reset selection when modal opens with a different report.
    if (isOpen && selectedId === null && ai) {
        setSelectedId(ai.member.id)
    }

    const selectedMember = TEAM_MEMBERS.find(m => m.id === selectedId)

    const handleConfirm = () => {
        if (!selectedMember) return
        onAssign(selectedMember)
    }

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-[210]">
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="p-5 pb-3 flex items-start justify-between gap-3 border-b border-border">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-500/15 flex items-center justify-center">
                                        <UserCircle className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-foreground">Assign reviewer</h2>
                                        <p className="text-[11px] text-muted-foreground">Flag the report to a teammate for a second look</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    aria-label="Close"
                                    className="p-1.5 -m-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* AI recommendation banner */}
                            {ai && (
                                <button
                                    onClick={() => setSelectedId(ai.member.id)}
                                    className={`w-full text-left p-4 border-b border-border transition-colors ${
                                        selectedId === ai.member.id
                                            ? 'bg-brand-300/20 dark:bg-brand-500/15'
                                            : 'bg-brand-300/10 dark:bg-brand-500/5 hover:bg-brand-300/20 dark:hover:bg-brand-500/10'
                                    }`}
                                >
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <Sparkles className="h-3.5 w-3.5 text-zinc-800 dark:text-zinc-200" />
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Strata AI recommends</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${avatarGradient(ai.member.id)} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                                            {ai.member.initials}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-bold text-foreground truncate">{ai.member.name}</span>
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground uppercase tracking-wider">{ai.member.role}</span>
                                            </div>
                                            <p className="text-[12px] text-muted-foreground leading-relaxed mt-0.5">{ai.rationale}</p>
                                        </div>
                                        {selectedId === ai.member.id && (
                                            <Check className="h-4 w-4 text-foreground shrink-0" />
                                        )}
                                    </div>
                                </button>
                            )}

                            {/* Other team members */}
                            <div className="p-3 max-h-[260px] overflow-y-auto">
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">Other available reviewers</div>
                                <ul className="space-y-1">
                                    {TEAM_MEMBERS
                                        .filter(m => m.id !== ai?.member.id && m.id !== 'me')
                                        .map(m => (
                                            <li key={m.id}>
                                                <button
                                                    onClick={() => setSelectedId(m.id)}
                                                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                                                        selectedId === m.id ? 'bg-muted' : 'hover:bg-muted/60'
                                                    }`}
                                                >
                                                    <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${avatarGradient(m.id)} flex items-center justify-center text-white text-[11px] font-bold shrink-0`}>
                                                        {m.initials}
                                                    </div>
                                                    <div className="flex-1 min-w-0 text-left">
                                                        <div className="text-sm font-semibold text-foreground truncate">{m.name}</div>
                                                        <div className="text-[11px] text-muted-foreground truncate">{m.role}</div>
                                                    </div>
                                                    {selectedId === m.id && <Check className="h-4 w-4 text-foreground shrink-0" />}
                                                </button>
                                            </li>
                                        ))}
                                </ul>
                            </div>

                            {/* Footer */}
                            <div className="border-t border-border p-3 flex items-center gap-2 bg-muted/20">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={!selectedMember}
                                    className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Assign {selectedMember ? `to ${selectedMember.name.split(' ')[0]}` : ''}
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}
