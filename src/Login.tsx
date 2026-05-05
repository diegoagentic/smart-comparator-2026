import { useState, useRef, useEffect, useCallback } from 'react'
import { EyeIcon, EyeSlashIcon, ArrowRightIcon, CheckCircleIcon, EnvelopeIcon, ArrowLeftIcon, DevicePhoneMobileIcon, ShieldCheckIcon, ChevronRightIcon, ChevronLeftIcon, MagnifyingGlassIcon, QrCodeIcon, XMarkIcon, KeyIcon } from '@heroicons/react/24/outline'
import logoLightBrand from './assets/logo-light-brand.png'
import logoDarkBrand from './assets/logo-dark-brand.png'
import { useAuth } from './context/AuthContext'
import { validatePassword, getDomainError, isAllowedDomain } from './lib/auth-utils'
import type { PasswordValidation } from './lib/auth-utils'
import { useToast, ToastContainer } from './components/AuthToast'
import NoAccessModal from './components/auth/NoAccessModal'

type ViewMode = 'login' | 'register' | 'forgot-password';

export default function Login() {
    const { signIn, validateCredentials, completeMfaLogin, signUp, resetPassword, clearError } = useAuth()
    const { toasts, addToast, dismissToast } = useToast()

    const [viewMode, setViewMode] = useState<ViewMode>('login')
    const [showNoAccess, setShowNoAccess] = useState(false)
    const [noAccessEmail, setNoAccessEmail] = useState<string | undefined>(undefined)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [domainError, setDomainError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>(
        validatePassword('')
    )

    // MFA state
    type MfaPhase = 'welcome' | 'method-select' | 'phone' | 'sending' | 'code' | 'totp-setup' | 'totp-qr' | 'verifying' | 'success';
    const [showMfa, setShowMfa] = useState(false)
    const [mfaPhase, setMfaPhase] = useState<MfaPhase>('welcome')
    const [mfaEmail, setMfaEmail] = useState('')
    const [showAppList, setShowAppList] = useState(false)
    const [showSecretKey, setShowSecretKey] = useState(false)

    const MFA_PHONE = '+1 (832) ***-4582'
    const MFA_CODE = ['8', '3', '1', '9', '0', '7']
    const TOTP_CODE = ['4', '7', '2', '9', '1', '5']
    const TOTP_SECRET = 'JBSWY3DPEHPK3PXP'
    const COMPATIBLE_APPS = ['Twilio Authy Authenticator', 'Duo Mobile', 'Microsoft Authenticator', 'Google Authenticator', 'Symantec VIP']

    // Access selection state (tenant → role)
    type AccessPhase = 'tenants' | 'roles';
    const [showAccess, setShowAccess] = useState(false)
    const [accessPhase, setAccessPhase] = useState<AccessPhase>('tenants')
    const [selectedTenant, setSelectedTenant] = useState<string | null>(null)
    const [selectedRole, setSelectedRole] = useState<string | null>(null)
    const [tenantSearch, setTenantSearch] = useState('')
    const [roleSearch, setRoleSearch] = useState('')

    const TENANTS = [
        { name: 'A New Tenant', description: 'New tenant environment' },
        { name: 'AIS', description: 'AIS Partners LLC' },
        { name: 'Hartford Office Interiors', description: 'Testing purposes' },
        { name: 'Tangram Interiors', description: 'Tangram Interiors Corp.' },
    ]

    const TENANT_ROLES: Record<string, string[]> = {
        'A New Tenant': ['Administrator'],
        'AIS': ['Administrator', 'Sales Representative'],
        'Hartford Office Interiors': ['Administrator', 'Project Manager', 'Viewer'],
        'Tangram Interiors': ['Administrator', 'cApital Duplicated 2'],
    }

    const filteredTenants = TENANTS.filter(t =>
        t.name.toLowerCase().includes(tenantSearch.toLowerCase())
    )
    const currentRoles = selectedTenant ? (TENANT_ROLES[selectedTenant] || []) : []
    const filteredRoles = currentRoles.filter(r =>
        r.toLowerCase().includes(roleSearch.toLowerCase())
    )

    const handleTenantSelect = (name: string) => {
        setSelectedTenant(name)
        setSelectedRole(null)
        setRoleSearch('')
        setAccessPhase('roles')
    }

    const handleAccessBack = () => {
        if (accessPhase === 'roles') {
            setAccessPhase('tenants')
            setSelectedRole(null)
            setRoleSearch('')
        } else {
            setShowAccess(false)
            setSelectedTenant(null)
            setSelectedRole(null)
            setTenantSearch('')
        }
    }

    const handleAccessLogin = () => {
        setShowAccess(false)
        startMfaFlow()
    }

    const startMfaFlow = useCallback(() => {
        setMfaPhase('welcome')
        setShowAppList(false)
        setShowSecretKey(false)
        setShowMfa(true)
    }, [])

    const handleMfaSkip = useCallback(() => {
        setShowMfa(false)
        completeMfaLogin(mfaEmail)
        addToast('success', 'Logged in successfully!')
    }, [completeMfaLogin, mfaEmail, addToast])

    const handleMfaSendCode = useCallback(() => {
        setMfaPhase('sending')
        setTimeout(() => setMfaPhase('code'), 2000)
    }, [])

    const handleMfaVerify = useCallback(() => {
        setMfaPhase('verifying')
        setTimeout(() => setMfaPhase('success'), 1500)
    }, [])

    const handleMfaComplete = useCallback(() => {
        setShowMfa(false)
        completeMfaLogin(mfaEmail)
        addToast('success', 'Multi-factor authentication verified successfully!')
    }, [completeMfaLogin, mfaEmail, addToast])

    // Auto-verify code after appearing (SMS and TOTP)
    useEffect(() => {
        if (mfaPhase === 'code' || mfaPhase === 'totp-qr') {
            const timer = setTimeout(() => handleMfaVerify(), 2500)
            return () => clearTimeout(timer)
        }
        if (mfaPhase === 'success') {
            const timer = setTimeout(() => handleMfaComplete(), 1500)
            return () => clearTimeout(timer)
        }
    }, [mfaPhase, handleMfaVerify, handleMfaComplete])

    const emailInputRef = useRef<HTMLInputElement>(null)

    // Reset state when switching views
    useEffect(() => {
        setSuccessMessage(null)
        setDomainError(null)
        clearError()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewMode])

    // Dev/QA: open the NoAccess modal via `?preview=noaccess[&email=foo@bar.com]`
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        if (params.get('preview') === 'noaccess') {
            setNoAccessEmail(params.get('email') ?? 'unauthorized@example.com')
            setShowNoAccess(true)
        }
    }, [])

    // Real-time password validation
    const handlePasswordChange = (value: string) => {
        setPassword(value)
        setPasswordValidation(validatePassword(value))
    }

    // Domain validation on blur
    const handleEmailBlur = () => {
        if (email && email.includes('@')) {
            const error = getDomainError(email)
            setDomainError(error)
        } else {
            setDomainError(null)
        }
    }

    const handleEmailChange = (value: string) => {
        setEmail(value)
        if (domainError) {
            setDomainError(null)
        }
    }

    // --- Handlers ---

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()

        // Authorization check (domain) is distinct from credential validation:
        // unauthorized email → blocking modal with support contact, not a toast.
        if (email && email.includes('@') && !isAllowedDomain(email)) {
            setNoAccessEmail(email)
            setShowNoAccess(true)
            return
        }

        setIsSubmitting(true)

        // Validate credentials first without logging in
        const check = validateCredentials(email, password)
        setIsSubmitting(false)

        if (!check.valid) {
            addToast('error', check.error ?? 'Login failed')
            return
        }

        // Credentials valid — show access selection (tenant → role → MFA)
        setMfaEmail(email)
        setShowAccess(true)
        setAccessPhase('tenants')
        setSelectedTenant(null)
        setSelectedRole(null)
        setTenantSearch('')
        setRoleSearch('')
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!fullName.trim()) {
            addToast('error', 'Full name is required.')
            return
        }

        if (email && email.includes('@') && !isAllowedDomain(email)) {
            setNoAccessEmail(email)
            setShowNoAccess(true)
            return
        }

        const domainErr = getDomainError(email)
        if (domainErr) {
            addToast('error', domainErr)
            return
        }

        if (!passwordValidation.isValid) {
            addToast('error', 'Please meet all password requirements.')
            return
        }

        setIsSubmitting(true)
        const result = await signUp(email, password, fullName.trim())
        setIsSubmitting(false)

        if (!result.success) {
            addToast('error', result.error ?? 'Registration failed')
        } else if (result.needsVerification) {
            setSuccessMessage('Account created! Please check your email to verify your account before logging in.')
            addToast('success', 'Account created! Check your email to verify your account.')
        }
    }

    const handleMicrosoftLogin = async () => {
        setIsSubmitting(true)
        // Microsoft auto-uses goavanto account — show access selection
        setMfaEmail('test@goavanto.com')
        setIsSubmitting(false)
        setShowAccess(true)
        setAccessPhase('tenants')
        setSelectedTenant(null)
        setSelectedRole(null)
        setTenantSearch('')
        setRoleSearch('')
    }

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email) {
            addToast('error', 'Please enter your email address.')
            return
        }

        if (!isAllowedDomain(email)) {
            setNoAccessEmail(email)
            setShowNoAccess(true)
            return
        }

        setIsSubmitting(true)
        const result = await resetPassword(email)
        setIsSubmitting(false)

        if (!result.success) {
            addToast('error', result.error ?? 'Failed to send reset email')
        } else {
            setSuccessMessage('Password reset email sent! Check your inbox for the reset link.')
            addToast('success', 'Password reset email sent! Check your inbox.')
        }
    }

    const switchView = (mode: ViewMode) => {
        setViewMode(mode)
        setPassword('')
        setFullName('')
        setShowPassword(false)
        setPasswordValidation(validatePassword(''))
    }

    // --- Password Requirement Item ---
    const PasswordCheck = ({ met, label }: { met: boolean; label: string }) => (
        <li className="flex items-center gap-2">
            {met ? (
                <svg className="w-3 h-3 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            ) : (
                <svg className="w-3 h-3 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
            )}
            <span className={met ? 'text-green-400' : 'text-zinc-500'}>{label}</span>
        </li>
    )

    // --- Spinner Component ---
    const Spinner = () => (
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    )

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-sans bg-background transition-colors duration-300">
            {/* Toast Notifications */}
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />

            {/* No-Access Modal (unauthorized organization domain) */}
            <NoAccessModal
                isOpen={showNoAccess}
                email={noAccessEmail}
                onClose={() => {
                    setShowNoAccess(false)
                    setNoAccessEmail(undefined)
                }}
            />

            {/* Dev harness: only visible during `vite dev`. Lets devs/QA preview
                auth modals without needing a real unauthorized email. */}
            {import.meta.env.DEV && (
                <div className="fixed bottom-3 left-3 z-[200] flex items-center gap-2 rounded-full bg-zinc-900/80 dark:bg-white/10 backdrop-blur px-3 py-1.5 text-[11px] font-mono text-white shadow-lg pointer-events-auto">
                    <span className="opacity-70">dev:</span>
                    <button
                        type="button"
                        onClick={() => {
                            setNoAccessEmail('unauthorized@example.com')
                            setShowNoAccess(true)
                        }}
                        className="rounded-full bg-white/20 hover:bg-white/30 px-2 py-0.5 transition-colors"
                    >
                        Preview NoAccess
                    </button>
                </div>
            )}

            {/* Access Selection Modal (Tenant → Role) */}
            {showAccess && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-md mx-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="px-8 pt-8 pb-2">
                            <h3 className="text-2xl font-brand font-bold text-zinc-900 dark:text-white mb-1">Access</h3>
                            {accessPhase === 'tenants' ? (
                                <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Tenants</p>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleAccessBack}
                                        className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
                                    >
                                        <ChevronLeftIcon className="w-4 h-4" />
                                    </button>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                        {selectedTenant} <span className="mx-1">{'>'}</span> <span className="font-bold text-zinc-700 dark:text-zinc-300">Roles</span>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Search */}
                        <div className="px-8 py-3">
                            <div className="relative">
                                <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Find in list"
                                    value={accessPhase === 'tenants' ? tenantSearch : roleSearch}
                                    onChange={(e) => accessPhase === 'tenants' ? setTenantSearch(e.target.value) : setRoleSearch(e.target.value)}
                                    className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/15 text-zinc-900 dark:text-white rounded-lg h-10 pl-9 pr-4 text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:border-zinc-400 dark:focus:border-white/30 transition-colors"
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div className="px-8 pb-2 max-h-[260px] overflow-y-auto scrollbar-minimal">
                            {accessPhase === 'tenants' ? (
                                <div className="space-y-1">
                                    {filteredTenants.map(tenant => (
                                        <button
                                            key={tenant.name}
                                            onClick={() => handleTenantSelect(tenant.name)}
                                            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors group text-left"
                                        >
                                            <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                                                selectedTenant === tenant.name
                                                    ? 'border-indigo-500 bg-indigo-500'
                                                    : 'border-zinc-300 dark:border-zinc-600'
                                            }`}>
                                                {selectedTenant === tenant.name && (
                                                    <div className="w-2 h-2 rounded-full bg-white" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-sm text-zinc-900 dark:text-white font-medium">{tenant.name}</span>
                                                <span className="text-sm text-zinc-400 dark:text-zinc-500"> — {tenant.description}</span>
                                            </div>
                                            <ChevronRightIcon className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors shrink-0" />
                                        </button>
                                    ))}
                                    {filteredTenants.length === 0 && (
                                        <p className="text-sm text-zinc-400 text-center py-6">No tenants found</p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {filteredRoles.map(role => (
                                        <button
                                            key={role}
                                            onClick={() => setSelectedRole(role)}
                                            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors text-left"
                                        >
                                            <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                                                selectedRole === role
                                                    ? 'border-indigo-500 bg-indigo-500'
                                                    : 'border-zinc-300 dark:border-zinc-600'
                                            }`}>
                                                {selectedRole === role && (
                                                    <div className="w-2 h-2 rounded-full bg-white" />
                                                )}
                                            </div>
                                            <span className="text-sm text-zinc-900 dark:text-white font-medium">{role}</span>
                                        </button>
                                    ))}
                                    {filteredRoles.length === 0 && (
                                        <p className="text-sm text-zinc-400 text-center py-6">No roles found</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-5 flex items-center justify-center gap-3 border-t border-zinc-100 dark:border-white/10">
                            <button
                                onClick={handleAccessBack}
                                className="px-6 py-2.5 rounded-lg border border-zinc-300 dark:border-white/20 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleAccessLogin}
                                disabled={accessPhase === 'tenants' ? !selectedTenant : !selectedRole}
                                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                                    (accessPhase === 'tenants' ? selectedTenant : selectedRole)
                                        ? 'bg-primary text-primary-foreground hover:opacity-90'
                                        : 'bg-zinc-200 dark:bg-white/10 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
                                }`}
                            >
                                Login
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MFA Modal */}
            {showMfa && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-md mx-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="px-8 pt-8 pb-4 text-center">
                            {mfaPhase !== 'welcome' && mfaPhase !== 'totp-setup' && (
                                <div className="mx-auto w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center mb-4">
                                    {mfaPhase === 'success' ? (
                                        <ShieldCheckIcon className="w-7 h-7 text-green-500 dark:text-green-400" />
                                    ) : (mfaPhase === 'totp-qr' || mfaPhase === 'method-select') ? (
                                        <QrCodeIcon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                                    ) : (
                                        <DevicePhoneMobileIcon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                                    )}
                                </div>
                            )}
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                                {mfaPhase === 'welcome' ? 'Welcome!' : mfaPhase === 'method-select' ? 'Choose Verification Method' : mfaPhase === 'totp-setup' ? '' : mfaPhase === 'totp-qr' ? 'Set up MFA' : mfaPhase === 'success' ? 'Verification Complete' : 'Multi-Factor Authentication'}
                            </h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                {mfaPhase === 'welcome' && ''}
                                {mfaPhase === 'method-select' && 'Select how you want to verify your identity.'}
                                {mfaPhase === 'phone' && 'Verify your identity with a one-time code sent to your phone.'}
                                {mfaPhase === 'sending' && 'Sending verification code...'}
                                {mfaPhase === 'code' && 'Enter the 6-digit code sent to your phone.'}
                                {mfaPhase === 'totp-setup' && ''}
                                {mfaPhase === 'totp-qr' && ''}
                                {mfaPhase === 'verifying' && 'Verifying your code...'}
                                {mfaPhase === 'success' && 'Your identity has been verified successfully.'}
                            </p>
                        </div>

                        {/* Body */}
                        <div className="px-8 pb-8">
                            {/* Welcome phase */}
                            {mfaPhase === 'welcome' && (
                                <div className="space-y-6 mt-2">
                                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                                        To enhance the security of your account, we require an extra layer of protection. This additional step ensures that only you can access your account. Thank you for helping us keep your information safe and secure! Let us help you setting up your <span className="font-semibold text-zinc-900 dark:text-white">Multi-Factor Authentication (MFA)</span>.
                                    </p>
                                    <button
                                        onClick={() => setMfaPhase('method-select')}
                                        className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        Continue
                                    </button>
                                    <button
                                        onClick={handleMfaSkip}
                                        className="w-full text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white underline underline-offset-2 transition-colors"
                                    >
                                        Skip MFA for now
                                    </button>
                                </div>
                            )}

                            {/* Method select phase */}
                            {mfaPhase === 'method-select' && (
                                <div className="space-y-4 mt-2">
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">Choose your preferred verification method</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setMfaPhase('phone')}
                                            className="p-5 rounded-xl border-2 border-zinc-200 dark:border-white/15 hover:border-primary dark:hover:border-primary bg-zinc-50 dark:bg-white/5 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all text-center group"
                                        >
                                            <DevicePhoneMobileIcon className="w-8 h-8 mx-auto mb-3 text-zinc-400 group-hover:text-primary transition-colors" />
                                            <div className="text-sm font-bold text-zinc-900 dark:text-white mb-1">Text Message (SMS)</div>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">Receive a one-time code via SMS to your phone</p>
                                        </button>
                                        <button
                                            onClick={() => setMfaPhase('totp-setup')}
                                            className="p-5 rounded-xl border-2 border-zinc-200 dark:border-white/15 hover:border-primary dark:hover:border-primary bg-zinc-50 dark:bg-white/5 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all text-center group"
                                        >
                                            <QrCodeIcon className="w-8 h-8 mx-auto mb-3 text-zinc-400 group-hover:text-primary transition-colors" />
                                            <div className="text-sm font-bold text-zinc-900 dark:text-white mb-1">Authenticator App</div>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">Use an app to generate time-based codes</p>
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleMfaSkip}
                                        className="w-full text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white underline underline-offset-2 transition-colors"
                                    >
                                        Skip MFA for now
                                    </button>
                                </div>
                            )}

                            {/* TOTP setup phase — step 1: install app */}
                            {mfaPhase === 'totp-setup' && (
                                <div className="space-y-6 mt-2">
                                    <div className="text-lg font-bold text-zinc-900 dark:text-white">Set up MFA</div>

                                    {/* Vertical stepper */}
                                    <div className="space-y-0">
                                        {/* Step 1 — active */}
                                        <div className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">1</div>
                                                <div className="w-0.5 flex-1 bg-zinc-200 dark:bg-white/20 my-1" />
                                            </div>
                                            <div className="pb-5">
                                                <p className="text-sm text-zinc-900 dark:text-white font-medium leading-relaxed">
                                                    Install the compatible app on your mobile device or computer. Or select an already installed one.
                                                </p>
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                                                    Select an MFA App from the{' '}
                                                    <button onClick={() => setShowAppList(true)} className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                                                        list of compatible applications
                                                    </button>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Step 2 — dimmed */}
                                        <div className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-white/15 text-zinc-500 dark:text-zinc-400 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                                                <div className="w-0.5 flex-1 bg-zinc-200 dark:bg-white/20 my-1" />
                                            </div>
                                            <div className="pb-5">
                                                <p className="text-sm text-zinc-400 dark:text-zinc-500">Use your MFA App and your device's camera to scan the QR code</p>
                                            </div>
                                        </div>

                                        {/* Step 3 — dimmed */}
                                        <div className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-white/15 text-zinc-500 dark:text-zinc-400 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                                            </div>
                                            <div>
                                                <p className="text-sm text-zinc-400 dark:text-zinc-500">Type the MFA Code displayed in the App</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setMfaPhase('totp-qr')}
                                        className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        Continue
                                    </button>
                                    <button
                                        onClick={handleMfaSkip}
                                        className="w-full text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white underline underline-offset-2 transition-colors"
                                    >
                                        Skip MFA for now
                                    </button>

                                    {/* Compatible apps modal */}
                                    {showAppList && (
                                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 rounded-2xl">
                                            <div className="w-full max-w-sm mx-6 bg-white dark:bg-zinc-800 rounded-xl shadow-2xl border border-zinc-200 dark:border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                <div className="px-5 pt-5 pb-3 flex items-start justify-between">
                                                    <div>
                                                        <h4 className="text-base font-bold text-zinc-900 dark:text-white">List of compatible Apps</h4>
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">Click on the app you will be using. A barcode will be displayed on the next screen that you will use to complete the process.</p>
                                                    </div>
                                                    <button onClick={() => setShowAppList(false)} className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors shrink-0 ml-2" title="Close">
                                                        <XMarkIcon className="w-5 h-5 text-zinc-400" />
                                                    </button>
                                                </div>
                                                <div className="px-5 pb-5 space-y-1">
                                                    {COMPATIBLE_APPS.map(app => (
                                                        <button
                                                            key={app}
                                                            onClick={() => { setShowAppList(false); setMfaPhase('totp-qr'); }}
                                                            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                                                        >
                                                            {app}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TOTP QR phase — steps 2+3: scan QR + enter code */}
                            {mfaPhase === 'totp-qr' && (
                                <div className="space-y-5 mt-2">
                                    {/* Step 2 header */}
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                                        <span className="text-sm font-medium text-zinc-900 dark:text-white">Use your MFA App and your device's camera to scan the QR code</span>
                                    </div>

                                    {/* QR code placeholder */}
                                    <div className="flex justify-center">
                                        <div className="p-3 bg-white rounded-xl border border-zinc-200 dark:border-zinc-300 inline-block">
                                            <svg width="160" height="160" viewBox="0 0 160 160" className="block">
                                                {/* QR-like pattern */}
                                                {(() => {
                                                    const size = 8;
                                                    const grid = 20;
                                                    const pattern = [
                                                        [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
                                                        [1,0,0,0,0,0,1,0,0,1,0,1,0,0,1,0,0,0,0,0,1],
                                                        [1,0,1,1,1,0,1,0,1,1,0,0,1,0,1,0,1,1,1,0,1],
                                                        [1,0,1,1,1,0,1,0,0,1,1,0,0,0,1,0,1,1,1,0,1],
                                                        [1,0,1,1,1,0,1,0,1,0,1,1,0,0,1,0,1,1,1,0,1],
                                                        [1,0,0,0,0,0,1,0,0,0,1,0,1,0,1,0,0,0,0,0,1],
                                                        [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
                                                        [0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0,0,0,0,0],
                                                        [1,0,1,1,0,1,1,1,0,0,1,0,1,1,0,1,1,0,1,0,1],
                                                        [0,1,0,1,1,0,0,1,1,0,0,1,0,1,1,0,1,1,0,1,0],
                                                        [1,0,1,0,1,1,1,0,1,1,0,0,1,0,1,0,0,1,1,0,1],
                                                        [0,1,1,0,0,1,0,1,0,1,1,0,0,1,0,1,1,0,1,1,0],
                                                        [1,1,0,1,1,0,1,0,1,0,0,1,1,0,1,0,1,1,0,0,1],
                                                        [0,0,0,0,0,0,0,0,1,0,1,1,0,0,1,1,0,1,0,1,0],
                                                        [1,1,1,1,1,1,1,0,0,1,0,0,1,0,1,0,1,0,1,0,1],
                                                        [1,0,0,0,0,0,1,0,1,1,1,0,0,1,0,1,1,0,0,1,0],
                                                        [1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,0,0,1,1,0,1],
                                                        [1,0,1,1,1,0,1,0,0,1,0,1,0,1,1,1,0,1,0,1,0],
                                                        [1,0,1,1,1,0,1,0,1,1,0,0,1,0,0,1,1,0,1,0,1],
                                                        [1,0,0,0,0,0,1,0,0,0,1,1,0,1,0,0,1,1,0,1,0],
                                                        [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,0,1,0,1,0,1],
                                                    ];
                                                    const rects: React.ReactNode[] = [];
                                                    pattern.forEach((row, y) => {
                                                        row.forEach((cell, x) => {
                                                            if (cell && x < grid && y < grid) {
                                                                rects.push(<rect key={`${x}-${y}`} x={x * size} y={y * size} width={size} height={size} fill="black" />);
                                                            }
                                                        });
                                                    });
                                                    return rects;
                                                })()}
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Secret key toggle */}
                                    <div className="text-center">
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                            <span className="underline decoration-dotted">Alternatively</span>, you can type the secret key.
                                        </p>
                                        <button
                                            onClick={() => setShowSecretKey(!showSecretKey)}
                                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium mt-0.5"
                                        >
                                            {showSecretKey ? 'Hide secret key' : 'Show secret key.'}
                                        </button>
                                        {showSecretKey && (
                                            <div className="mt-2 flex items-center justify-center gap-2">
                                                <div className="px-3 py-2 bg-zinc-100 dark:bg-white/10 rounded-lg border border-zinc-200 dark:border-white/20">
                                                    <code className="text-sm font-mono font-bold text-zinc-900 dark:text-white tracking-wider">{TOTP_SECRET}</code>
                                                </div>
                                                <KeyIcon className="w-4 h-4 text-zinc-400" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Step 3 — code entry */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">3</div>
                                            <span className="text-sm font-medium text-zinc-900 dark:text-white">Type the MFA Code displayed in the App</span>
                                        </div>
                                        <div className="flex gap-2 justify-center">
                                            {TOTP_CODE.map((digit, i) => (
                                                <input
                                                    key={i}
                                                    type="text"
                                                    value={digit}
                                                    readOnly
                                                    className="w-12 h-14 text-center text-xl font-bold bg-zinc-50 dark:bg-white/10 border border-zinc-200 dark:border-white/20 text-zinc-900 dark:text-white rounded-lg outline-none cursor-default"
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleMfaVerify}
                                        className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        Continue
                                    </button>
                                    <button
                                        onClick={handleMfaSkip}
                                        className="w-full text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white underline underline-offset-2 transition-colors"
                                    >
                                        Skip MFA for now
                                    </button>
                                </div>
                            )}

                            {/* Phone phase */}
                            {mfaPhase === 'phone' && (
                                <div className="space-y-5 mt-2">
                                    <div>
                                        <label className="text-zinc-700 dark:text-zinc-300 text-sm font-medium mb-1.5 block">Mobile Phone Number</label>
                                        <input
                                            type="text"
                                            value={MFA_PHONE}
                                            readOnly
                                            className="w-full bg-zinc-50 dark:bg-white/10 border border-zinc-200 dark:border-white/20 text-zinc-900 dark:text-white rounded-lg h-12 px-4 outline-none cursor-default"
                                        />
                                        <p className="text-xs text-zinc-500 mt-1.5">A verification code will be sent via SMS to this number.</p>
                                    </div>
                                    <button
                                        onClick={handleMfaSendCode}
                                        className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        Send Verification Code
                                    </button>
                                </div>
                            )}

                            {/* Sending phase */}
                            {mfaPhase === 'sending' && (
                                <div className="flex flex-col items-center py-6 gap-4">
                                    <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    <p className="text-zinc-600 dark:text-zinc-300 text-sm">Sending SMS to {MFA_PHONE}...</p>
                                </div>
                            )}

                            {/* Code phase */}
                            {mfaPhase === 'code' && (
                                <div className="space-y-5 mt-2">
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
                                        <CheckCircleIcon className="w-5 h-5 text-green-500 dark:text-green-400 shrink-0" />
                                        <p className="text-sm text-green-700 dark:text-green-300">Code sent to {MFA_PHONE}</p>
                                    </div>
                                    <div>
                                        <label className="text-zinc-700 dark:text-zinc-300 text-sm font-medium mb-2 block">Verification Code</label>
                                        <div className="flex gap-2 justify-center">
                                            {MFA_CODE.map((digit, i) => (
                                                <input
                                                    key={i}
                                                    type="text"
                                                    value={digit}
                                                    readOnly
                                                    className="w-12 h-14 text-center text-xl font-bold bg-zinc-50 dark:bg-white/10 border border-zinc-200 dark:border-white/20 text-zinc-900 dark:text-white rounded-lg outline-none cursor-default"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleMfaVerify}
                                        className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        Verify Code
                                    </button>
                                </div>
                            )}

                            {/* Verifying phase */}
                            {mfaPhase === 'verifying' && (
                                <div className="flex flex-col items-center py-6 gap-4">
                                    <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    <p className="text-zinc-600 dark:text-zinc-300 text-sm">Verifying code...</p>
                                </div>
                            )}

                            {/* Success phase */}
                            {mfaPhase === 'success' && (
                                <div className="flex flex-col items-center py-4 gap-3">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center">
                                        <CheckCircleIcon className="w-8 h-8 text-green-500 dark:text-green-400" />
                                    </div>
                                    <p className="text-green-700 dark:text-green-300 text-sm font-medium">Authentication successful. Redirecting...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Left Side - Branding */}
            <div className="relative overflow-hidden flex flex-col justify-center p-12 lg:p-20 bg-sidebar text-sidebar-foreground transition-colors duration-300">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-sidebar-accent/50 to-sidebar/50 pointer-events-none" />

                <div className="relative z-10 max-w-lg space-y-8">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="mb-4">
                            <img src={logoLightBrand} alt="Strata" className="h-20 w-auto block dark:hidden" />
                            <img src={logoDarkBrand} alt="Strata" className="h-20 w-auto hidden dark:block" />
                        </div>
                    </div>

                    <h1 className="text-5xl font-brand font-bold leading-tight text-sidebar-foreground">
                        Transform your workflow with Strata
                    </h1>

                    <p className="text-sidebar-foreground/70 text-lg leading-relaxed">
                        At Strata, we provide comprehensive solutions for contract dealers and manufacturers, combining sales enablement, financial services, and expert consulting with cutting-edge technology to optimize operations and drive business growth.
                    </p>

                    <div className="flex gap-4 pt-4">
                        <button className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:opacity-90 transition-opacity flex items-center gap-2">
                            Talk to an Expert <ArrowRightIcon className="w-4 h-4" />
                        </button>
                        <button className="px-6 py-3 bg-transparent text-sidebar-foreground font-semibold rounded-full hover:bg-sidebar-accent transition-colors border border-sidebar-border">
                            Browse all Services
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center p-8 relative overflow-hidden bg-[url('/login-bg.jpg')] bg-cover bg-center">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

                <div className="w-full max-w-[440px] p-8 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl relative z-10 transition-all duration-300">
                    <div className="space-y-6">

                        {/* Success Message */}
                        {successMessage ? (
                            <div className="space-y-6 text-center">
                                <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                                    <CheckCircleIcon className="w-8 h-8 text-green-400" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold text-white">Check Your Email</h2>
                                    <p className="text-sm text-zinc-300 leading-relaxed">{successMessage}</p>
                                </div>
                                <button
                                    onClick={() => { setSuccessMessage(null); switchView('login') }}
                                    className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-bold text-base shadow-lg shadow-black/10 transition-all flex items-center justify-center gap-2"
                                >
                                    <ArrowLeftIcon className="w-4 h-4" />
                                    Back to Login
                                </button>
                            </div>
                        ) : viewMode === 'forgot-password' ? (
                            /* Forgot Password View */
                            <div className="space-y-6">
                                <div className="space-y-2 text-center lg:text-left">
                                    <h2 className="text-3xl font-bold text-white">Reset Password</h2>
                                    <p className="text-sm text-zinc-300">Enter your email and we'll send you a link to reset your password.</p>
                                </div>

                                <form className="space-y-4" onSubmit={handleForgotPassword}>
                                    <div>
                                        <label className="text-zinc-200 text-sm font-medium mb-1 block">Email</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => handleEmailChange(e.target.value)}
                                                onBlur={handleEmailBlur}
                                                placeholder="you@company.com"
                                                className="w-full bg-white/10 border border-white/20 text-white focus:border-white/40 focus:ring-0 rounded-lg h-12 px-4 pl-10 placeholder:text-zinc-500 outline-none transition-colors"
                                            />
                                            <EnvelopeIcon className="w-5 h-5 text-zinc-400 absolute left-3 top-3.5" />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-bold text-base shadow-lg shadow-black/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? <Spinner /> : 'Send Reset Link'}
                                    </button>
                                </form>

                                <div className="text-center">
                                    <button
                                        onClick={() => switchView('login')}
                                        className="text-sm font-medium text-zinc-300 hover:text-white transition-colors flex items-center gap-1 mx-auto"
                                    >
                                        <ArrowLeftIcon className="w-3.5 h-3.5" />
                                        Back to Login
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Login / Register View */
                            <>
                                <div className="space-y-2 text-center lg:text-left">
                                    <h2 className="text-3xl font-bold text-white">
                                        {viewMode === 'register' ? 'Create Account' : 'Welcome Back!'}
                                    </h2>
                                    <div className="flex flex-wrap gap-1 text-sm text-zinc-200 justify-center lg:justify-start">
                                        <span>{viewMode === 'register' ? 'Already have an account?' : "Don't have an account?"}</span>
                                        <button
                                            onClick={() => switchView(viewMode === 'register' ? 'login' : 'register')}
                                            className="font-medium text-white hover:underline decoration-white/50 underline-offset-4"
                                        >
                                            {viewMode === 'register' ? 'Login now' : 'Create a new account now,'}
                                        </button>
                                        {viewMode === 'login' && <span>it's FREE! Takes less than a minute.</span>}
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    {viewMode === 'login' && (
                                        <>
                                            <button
                                                onClick={handleMicrosoftLogin}
                                                disabled={isSubmitting}
                                                className="w-full h-12 flex items-center justify-center gap-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50"
                                            >
                                                <svg className="w-5 h-5" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg"><path fill="#f25022" d="M1 1h9v9H1z" /><path fill="#7fba00" d="M11 1h9v9h-9z" /><path fill="#00a4ef" d="M1 11h9v9H1z" /><path fill="#ffb900" d="M11 11h9v9h-9z" /></svg>
                                                Login with Microsoft
                                            </button>

                                            <div className="relative">
                                                <div className="absolute inset-0 flex items-center">
                                                    <span className="w-full border-t border-white/20" />
                                                </div>
                                                <div className="relative flex justify-center text-xs uppercase">
                                                    <span className="bg-transparent px-2 text-zinc-300 font-medium tracking-wider">Or login with email</span>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <form className="space-y-4" onSubmit={viewMode === 'register' ? handleRegister : handleLogin}>
                                        {/* Full Name (Register only) */}
                                        {viewMode === 'register' && (
                                            <div>
                                                <label className="text-zinc-200 text-sm font-medium mb-1 block">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    placeholder="John Doe"
                                                    className="w-full bg-white/10 border border-white/20 text-white focus:border-white/40 focus:ring-0 rounded-lg h-12 px-4 placeholder:text-zinc-500 outline-none transition-colors"
                                                />
                                            </div>
                                        )}

                                        {/* Email */}
                                        <div>
                                            <label className="text-zinc-200 text-sm font-medium mb-1 block">
                                                {viewMode === 'register' ? 'Work Email' : 'Email'}
                                            </label>
                                            <input
                                                ref={emailInputRef}
                                                type="email"
                                                value={email}
                                                onChange={(e) => handleEmailChange(e.target.value)}
                                                onBlur={handleEmailBlur}
                                                placeholder="you@company.com"
                                                className={`w-full bg-white/10 border text-white focus:border-white/40 focus:ring-0 rounded-lg h-12 px-4 placeholder:text-zinc-500 outline-none transition-colors ${
                                                    domainError ? 'border-red-500/50' : 'border-white/20'
                                                }`}
                                            />
                                            <p className="text-xs text-zinc-500 mt-1">
                                                Access restricted to @agenticdream.com and @goavanto.com
                                            </p>
                                        </div>

                                        {/* Password */}
                                        <div>
                                            <label className="text-zinc-200 text-sm font-medium mb-1 block">Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={password}
                                                    onChange={(e) => handlePasswordChange(e.target.value)}
                                                    placeholder="Enter your password"
                                                    className="w-full bg-white/10 border border-white/20 text-white focus:border-white/40 focus:ring-0 rounded-lg h-12 px-4 pr-10 placeholder:text-zinc-500 outline-none transition-colors"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-3.5 text-zinc-300 hover:text-white transition-colors"
                                                >
                                                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Password Requirements (Register only) */}
                                        {viewMode === 'register' && (
                                            <div className={`rounded-lg p-4 border ${
                                                passwordValidation.isValid
                                                    ? 'bg-green-500/10 border-green-500/20'
                                                    : 'bg-white/5 border-white/10'
                                            }`}>
                                                <div className="text-xs">
                                                    <p className={`font-medium mb-2 ${passwordValidation.isValid ? 'text-green-200' : 'text-zinc-300'}`}>
                                                        Password requirements:
                                                    </p>
                                                    <ul className="space-y-1 ml-1">
                                                        <PasswordCheck met={passwordValidation.hasMinLength} label="Minimum 8 characters" />
                                                        <PasswordCheck met={passwordValidation.hasUppercase} label="At least one uppercase letter" />
                                                        <PasswordCheck met={passwordValidation.hasNumber} label="At least one number" />
                                                        <PasswordCheck met={passwordValidation.hasSpecialChar} label="At least one special character" />
                                                    </ul>
                                                </div>
                                            </div>
                                        )}

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-bold text-base shadow-lg shadow-black/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <Spinner />
                                            ) : (
                                                viewMode === 'register' ? 'Create Account' : 'Login Now'
                                            )}
                                        </button>
                                    </form>

                                    {/* Forgot Password Link */}
                                    {viewMode === 'login' && (
                                        <div className="text-center">
                                            <button
                                                onClick={() => switchView('forgot-password')}
                                                className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                                            >
                                                Forget password? <span className="text-white underline decoration-zinc-400 underline-offset-4">Click here</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
