import { useState } from 'react'
import {
    ShieldExclamationIcon,
    EnvelopeIcon,
    ClipboardDocumentIcon,
    CheckIcon,
    ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline'

export const SUPPORT_EMAIL = 'access@strata.com'

interface NoAccessModalProps {
    isOpen: boolean
    /** Email the user tried to use — shown back to them and prefilled in the support mailto. */
    email?: string
    onClose: () => void
}

export default function NoAccessModal({ isOpen, email, onClose }: NoAccessModalProps) {
    const [copied, setCopied] = useState(false)

    if (!isOpen) return null

    const subject = encodeURIComponent('Access request — Smart Comparator')
    const body = encodeURIComponent(
        `Hi Strata team,\n\nI'd like to request access to Smart Comparator.\n\nEmail used: ${email ?? '(not provided)'}\nReason: \n\nThanks.`
    )
    const mailto = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(SUPPORT_EMAIL)
            setCopied(true)
            setTimeout(() => setCopied(false), 1800)
        } catch {
            /* clipboard unavailable — silent */
        }
    }

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="noaccess-title"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
            <div className="w-full max-w-md mx-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-8 pt-8 pb-4 text-center">
                    <div className="mx-auto w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/15 flex items-center justify-center mb-4">
                        <ShieldExclamationIcon className="w-7 h-7 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 id="noaccess-title" className="text-xl font-bold text-zinc-900 dark:text-white">
                        Access Not Authorized
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        Your email isn't part of an authorized organization for Smart Comparator.
                    </p>
                </div>

                {/* Body */}
                <div className="px-8">
                    {email && (
                        <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 px-4 py-3 mb-5 text-sm">
                            <span className="text-zinc-500 dark:text-zinc-400">Email used: </span>
                            <span className="font-medium text-zinc-900 dark:text-white break-all">{email}</span>
                        </div>
                    )}
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
                        If you believe you should have access, contact our support team and we'll review your
                        request.
                    </p>

                    <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-500/10 dark:to-transparent px-4 py-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
                            <EnvelopeIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                Strata Support
                            </p>
                            <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                                {SUPPORT_EMAIL}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleCopy}
                            title={copied ? 'Copied' : 'Copy email'}
                            aria-label={copied ? 'Email copied' : 'Copy email to clipboard'}
                            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
                        >
                            {copied ? (
                                <CheckIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                            ) : (
                                <ClipboardDocumentIcon className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                    <div className="h-4 mt-1">
                        {copied && (
                            <p className="text-xs text-green-600 dark:text-green-400 text-center">
                                Email copied to clipboard
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-5 flex items-center justify-center gap-3 border-t border-zinc-100 dark:border-white/10">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg border border-zinc-300 dark:border-white/20 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                    >
                        Try a different email
                    </button>
                    <a
                        href={mailto}
                        className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-colors flex items-center gap-2"
                    >
                        Contact Support
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </div>
    )
}
