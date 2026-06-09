import { useState, useEffect } from 'react'
import { EyeIcon, EyeSlashIcon, LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'
import { validatePassword } from '../../lib/auth-utils'

interface Props {
    isOpen: boolean
    onClose: () => void
}

const PasswordCheck = ({ met, label }: { met: boolean; label: string }) => (
    <li className="flex items-center gap-2">
        {met ? (
            <svg className="w-3 h-3 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
        ) : (
            <svg className="w-3 h-3 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
        )}
        <span className={met ? 'text-green-400' : 'text-muted-foreground'}>{label}</span>
    </li>
)

export default function ChangePasswordModal({ isOpen, onClose }: Props) {
    const { changePassword } = useAuth()

    const [phase, setPhase] = useState<'form' | 'success'>('form')
    const [currentPassword, setCurrentPassword] = useState('StrataDemo2026!')
    const [newPassword, setNewPassword] = useState('StrataDemo2027!')
    const [confirmPassword, setConfirmPassword] = useState('StrataDemo2027!')
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [currentError, setCurrentError] = useState<string | null>(null)
    const [confirmError, setConfirmError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const pwValidation = validatePassword(newPassword)
    const confirmMismatch = confirmPassword.length > 0 && confirmPassword !== newPassword
    const canSubmit = currentPassword.length > 0 && pwValidation.isValid && confirmPassword === newPassword && confirmPassword.length > 0

    // Auto-close after success
    useEffect(() => {
        if (phase === 'success') {
            const t = setTimeout(() => { handleClose() }, 1500)
            return () => clearTimeout(t)
        }
    }, [phase])

    const handleClose = () => {
        setPhase('form')
        setCurrentPassword('StrataDemo2026!')
        setNewPassword('StrataDemo2027!')
        setConfirmPassword('StrataDemo2027!')
        setShowCurrent(false)
        setShowNew(false)
        setShowConfirm(false)
        setCurrentError(null)
        setConfirmError(null)
        setIsSubmitting(false)
        onClose()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setCurrentError(null)
        setConfirmError(null)

        if (!currentPassword) {
            setCurrentError('Please enter your current password.')
            return
        }
        if (confirmPassword !== newPassword) {
            setConfirmError('Passwords do not match.')
            return
        }

        setIsSubmitting(true)
        const result = await changePassword(currentPassword, newPassword)
        setIsSubmitting(false)

        if (!result.success) {
            setCurrentError(result.error ?? 'Failed to update password.')
        } else {
            setPhase('success')
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-md mx-4 rounded-2xl bg-card border border-zinc-200 dark:border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-8 pt-8 pb-4 text-center">
                    <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${phase === 'success' ? 'bg-green-100 dark:bg-green-500/20' : 'bg-primary/20'}`}>
                        {phase === 'success'
                            ? <CheckCircleIcon className="w-7 h-7 text-green-500 dark:text-green-400" />
                            : <LockClosedIcon className="w-7 h-7 text-foreground" />
                        }
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                        {phase === 'success' ? 'Password Updated' : 'Change Password'}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        {phase === 'success'
                            ? 'Your password has been updated successfully.'
                            : 'Enter your current password and choose a new one.'}
                    </p>
                </div>

                {/* Body */}
                <div className="px-8 pb-8">
                    {phase === 'success' ? (
                        <div className="flex flex-col items-center py-4 gap-3">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center">
                                <CheckCircleIcon className="w-8 h-8 text-green-500 dark:text-green-400" />
                            </div>
                            <p className="text-green-700 dark:text-green-300 text-sm font-medium">Redirecting...</p>
                        </div>
                    ) : (
                        <form className="space-y-4 mt-2" onSubmit={handleSubmit}>
                            {/* Current password */}
                            <div>
                                <label className="text-muted-foreground text-sm font-medium mb-1.5 block">Current Password</label>
                                <div className="relative">
                                    <input
                                        type={showCurrent ? 'text' : 'password'}
                                        value={currentPassword}
                                        onChange={(e) => { setCurrentPassword(e.target.value); setCurrentError(null) }}
                                        placeholder="Enter current password"
                                        className={`w-full bg-muted dark:bg-white/5 border text-foreground rounded-lg h-12 px-4 pr-10 placeholder:text-muted-foreground dark:placeholder:text-muted-foreground outline-none transition-colors ${currentError ? 'border-red-400 dark:border-red-500/50' : 'border-zinc-200 dark:border-white/15 focus:border-zinc-400 dark:focus:border-white/30'}`}
                                    />
                                    <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                                        className="absolute right-3 top-3.5 text-muted-foreground hover:text-muted-foreground dark:hover:text-zinc-300 transition-colors">
                                        {showCurrent ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                    </button>
                                </div>
                                {currentError && <p className="text-xs text-red-500 mt-1">{currentError}</p>}
                            </div>

                            {/* New password */}
                            <div>
                                <label className="text-muted-foreground text-sm font-medium mb-1.5 block">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showNew ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        className="w-full bg-muted dark:bg-white/5 border border-zinc-200 dark:border-white/15 text-foreground rounded-lg h-12 px-4 pr-10 placeholder:text-muted-foreground dark:placeholder:text-muted-foreground outline-none focus:border-zinc-400 dark:focus:border-white/30 transition-colors"
                                    />
                                    <button type="button" onClick={() => setShowNew(!showNew)}
                                        className="absolute right-3 top-3.5 text-muted-foreground hover:text-muted-foreground dark:hover:text-zinc-300 transition-colors">
                                        {showNew ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                    </button>
                                </div>
                                {newPassword.length > 0 && (
                                    <div className={`mt-2 rounded-lg p-3 border text-xs ${pwValidation.isValid ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20' : 'bg-muted dark:bg-white/5 border-zinc-200 dark:border-white/10'}`}>
                                        <ul className="space-y-1 ml-1">
                                            <PasswordCheck met={pwValidation.hasMinLength} label="Minimum 8 characters" />
                                            <PasswordCheck met={pwValidation.hasUppercase} label="At least one uppercase letter" />
                                            <PasswordCheck met={pwValidation.hasNumber} label="At least one number" />
                                            <PasswordCheck met={pwValidation.hasSpecialChar} label="At least one special character" />
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Confirm password */}
                            <div>
                                <label className="text-muted-foreground text-sm font-medium mb-1.5 block">Confirm New Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => { setConfirmPassword(e.target.value); setConfirmError(null) }}
                                        placeholder="Repeat new password"
                                        className={`w-full bg-muted dark:bg-white/5 border text-foreground rounded-lg h-12 px-4 pr-10 placeholder:text-muted-foreground dark:placeholder:text-muted-foreground outline-none transition-colors ${
                                            confirmMismatch || confirmError
                                                ? 'border-red-400 dark:border-red-500/50'
                                                : confirmPassword.length > 0 && confirmPassword === newPassword
                                                    ? 'border-green-400 dark:border-green-500/50'
                                                    : 'border-zinc-200 dark:border-white/15 focus:border-zinc-400 dark:focus:border-white/30'
                                        }`}
                                    />
                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-3.5 text-muted-foreground hover:text-muted-foreground dark:hover:text-zinc-300 transition-colors">
                                        {showConfirm ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                    </button>
                                </div>
                                {(confirmMismatch || confirmError) && (
                                    <p className="text-xs text-red-500 mt-1">{confirmError ?? 'Passwords do not match.'}</p>
                                )}
                            </div>

                            {/* Footer buttons */}
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-white/20 text-sm font-semibold text-muted-foreground hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!canSubmit || isSubmitting}
                                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                                        canSubmit && !isSubmitting
                                            ? 'bg-primary text-primary-foreground hover:opacity-90'
                                            : 'bg-zinc-200 dark:bg-white/10 text-muted-foreground dark:text-muted-foreground cursor-not-allowed'
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                    ) : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
