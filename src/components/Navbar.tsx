import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from 'strata-design-system'
import { useTenant } from '../TenantContext'
import { ScanEye, FileOutput, Banknote, Bell, Moon, Sun, LogOut, ChevronDown, Building2, Check, KeyRound } from 'lucide-react'
import logoLightBrand from '../assets/logo-light-brand.png'
import logoDarkBrand from '../assets/logo-dark-brand.png'
import ChangePasswordModal from './auth/ChangePasswordModal'

type NavTab = 'Transactions' | 'OCR' | 'DocumentConversion'

interface NavbarProps {
    onLogout: () => void;
    activeTab?: NavTab | string;
    onNavigateToWorkspace: () => void;
    onNavigate: (page: any) => void;
}

export default function Navbar({ onLogout, activeTab = 'Transactions', onNavigate }: NavbarProps) {
    const { theme, toggleTheme } = useTheme()
    const { user } = useAuth()
    const { selectedTenants, tenants, toggleTenant, selectAll } = useTenant()
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [showChangePassword, setShowChangePassword] = useState(false)
    const [isTenantOpen, setIsTenantOpen] = useState(false)
    const tenantRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (tenantRef.current && !tenantRef.current.contains(e.target as Node)) {
                setIsTenantOpen(false)
            }
        }
        if (isTenantOpen) document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isTenantOpen])

    const tabs: { name: string; label: string; page: string; icon: any }[] = [
        { name: 'OCR', label: 'OCR', page: 'ocr', icon: ScanEye },
        { name: 'Transactions', label: 'Transactions', page: 'transactions', icon: Banknote },
        { name: 'DocumentConversion', label: 'Document Conversion', page: 'document-conversion', icon: FileOutput },
    ]

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Sara Chen'
    const userRole = 'Account Manager'

    return (
        <>
            {/* Navbar — matches UI-Dealer: rounded-full, top-6, min-w-[60vw], bg-card/80 backdrop-blur-xl */}
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 min-w-[60vw] max-w-fit lg:min-w-0 lg:max-w-7xl lg:w-[80vw]">
                <div className="relative flex items-center lg:justify-between px-3 py-2 rounded-full gap-1 bg-card/80 backdrop-blur-xl border border-border shadow-lg dark:shadow-glow-md">

                    {/* Left: Logo + Brand + Tenant Selector */}
                    <div className="flex items-center gap-1">
                        <div className="px-2 shrink-0">
                            <img src={logoLightBrand} alt="Strata" className="h-8 w-20 object-contain block dark:hidden" />
                            <img src={logoDarkBrand} alt="Strata" className="h-8 w-20 object-contain hidden dark:block" />
                        </div>
                        <div className="w-px h-6 bg-border mx-1"></div>
                        <div className="hidden sm:flex items-center gap-1 px-2" ref={tenantRef}>
                            <div>
                                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-none">SMART COMPARATOR</div>
                                <button
                                    onClick={() => setIsTenantOpen(!isTenantOpen)}
                                    className="flex items-center gap-1.5 text-sm font-bold text-foreground leading-tight hover:text-primary transition-colors"
                                >
                                    {selectedTenants.length === 1 ? selectedTenants[0] : `${selectedTenants.length} Tenants`}
                                    <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${isTenantOpen ? 'rotate-180' : ''}`} />
                                </button>
                            </div>

                            {/* Tenant Dropdown */}
                            {isTenantOpen && (
                                <div className="absolute left-14 top-full mt-2 w-64 bg-card border border-border rounded-xl shadow-lg z-50 p-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-3 py-2 border-b border-border mb-1 flex items-center justify-between">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tenants</span>
                                        <button
                                            onClick={selectAll}
                                            className="text-[10px] font-medium text-primary hover:underline"
                                        >
                                            Select All
                                        </button>
                                    </div>
                                    {tenants.map(tenant => {
                                        const isSelected = selectedTenants.includes(tenant)
                                        return (
                                            <button
                                                key={tenant}
                                                onClick={() => toggleTenant(tenant)}
                                                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
                                            >
                                                <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                                    isSelected
                                                        ? 'bg-primary border-primary'
                                                        : 'border-border'
                                                }`}>
                                                    {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                                                </div>
                                                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                                                <span className={`text-left truncate ${isSelected ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                                    {tenant}
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Center: Nav Tabs */}
                    <div className="flex items-center gap-1 mx-auto">
                        {tabs.map(tab => {
                            const isActive = activeTab === tab.name
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.name}
                                    onClick={() => onNavigate(tab.page)}
                                    className={`relative flex items-center justify-center h-9 px-3 rounded-full transition-all duration-300 group overflow-hidden ${
                                        isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-white/90 dark:hover:bg-zinc-800/90 text-muted-foreground hover:text-foreground hover:shadow-sm'
                                    }`}
                                >
                                    <span className="relative z-10"><Icon className="w-5 h-5" /></span>
                                    <span className={`ml-2 text-sm font-bold whitespace-nowrap transition-all duration-300 ease-in-out ${
                                        isActive ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100'
                                    }`}>
                                        {tab.label}
                                    </span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                        {/* Bell */}
                        <button
                            className="flex items-center justify-center h-9 w-9 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                            title="Notifications"
                        >
                            <Bell className="w-4 h-4" />
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="flex items-center justify-center h-9 w-9 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                        >
                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>

                        {/* Separator */}
                        <div className="w-px h-6 bg-border mx-1"></div>

                        {/* User */}
                        <div className="relative">
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-muted transition-colors"
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face"
                                    alt={displayName}
                                    className="w-8 h-8 rounded-full object-cover border-2 border-border"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                                <div className="w-8 h-8 rounded-full bg-ai flex items-center justify-center text-white text-xs font-bold hidden">
                                    {displayName.charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden md:block text-left">
                                    <div className="text-xs font-semibold text-foreground leading-tight truncate max-w-[100px]">{displayName}</div>
                                    <div className="text-[10px] text-muted-foreground leading-none">{userRole}</div>
                                </div>
                                <ChevronDown className="h-3 w-3 text-muted-foreground hidden md:block" />
                            </button>

                            {isUserMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-50 p-1">
                                        <div className="px-3 py-2 border-b border-border mb-1">
                                            <div className="text-sm font-medium text-foreground">{displayName}</div>
                                            <div className="text-xs text-muted-foreground">{user?.email || 'sara.chen@strata.com'}</div>
                                        </div>
                                        <button
                                            onClick={() => { setIsUserMenuOpen(false); setShowChangePassword(true); }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                                        >
                                            <KeyRound className="h-4 w-4" />
                                            Change Password
                                        </button>
                                        <button
                                            onClick={() => { setIsUserMenuOpen(false); onLogout(); }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error-light dark:hover:bg-error/10 rounded-lg transition-colors"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ChangePasswordModal
                isOpen={showChangePassword}
                onClose={() => setShowChangePassword(false)}
            />
        </>
    )
}
