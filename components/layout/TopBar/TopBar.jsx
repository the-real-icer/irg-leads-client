import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';

import { signOut as nextAuthSignOut } from 'next-auth/react';
import { RESET_STORE } from '../../../store/actions/types';
import useTheme from '../../../hooks/useTheme';
import PropertyQueueDialog from '../../PropertyQueue/PropertyQueueDialog';
import SendToLeadDialog from '../../PropertyQueue/SendToLeadDialog';
import NotificationBell from './NotificationBell';
import TopBarSearch from './TopBarSearch';

const TopBar = ({ onMobileMenuToggle }) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const agent = useSelector((state) => state.agent);
    const selectedHomes = useSelector((state) => state.selectedHomes);
    const { theme, toggleTheme, mounted } = useTheme();

    const [showQueueDialog, setShowQueueDialog] = useState(false);
    const [showSendDialog, setShowSendDialog] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);

    // Close profile dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Close profile dropdown on route change
    useEffect(() => {
        const handleRoute = () => setProfileOpen(false);
        router.events.on('routeChangeStart', handleRoute);
        return () => router.events.off('routeChangeStart', handleRoute);
    }, [router.events]);

    const handleSendClick = () => {
        setShowQueueDialog(false);
        setShowSendDialog(true);
    };

    const handleSignOut = () => {
        setProfileOpen(false);
        dispatch({ type: RESET_STORE });
        // Clean up any lingering next-auth session (defensive)
        nextAuthSignOut({ redirect: false }).catch(() => {});
        router.push('/');
    };

    const queueCount = selectedHomes?.length || 0;

    const getInitials = () => {
        if (!agent?.name) return '?';
        const parts = agent.name.trim().split(' ');
        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        return parts[0][0].toUpperCase();
    };

    return (
        <>
            <header className="sticky top-0 z-[1020] h-[60px] flex items-center justify-between px-4 lg:px-6 bg-surface/80 backdrop-blur-md border-b border-border dark:border-border/50 transition-colors duration-200">
                {/* ── Left: Hamburger + Search ──────────────────────── */}
                <div className="flex items-center gap-3">
                    {/* Mobile hamburger */}
                    <button
                        onClick={onMobileMenuToggle}
                        className="lg:hidden flex items-center justify-center text-foreground-muted hover:text-foreground transition-colors duration-150"
                        aria-label="Toggle menu"
                    >
                        <i className="pi pi-bars text-xl" />
                    </button>

                    {/* Global search */}
                    <TopBarSearch />
                </div>

                {/* ── Right: Queue, Alerts, Avatar, Theme ─────────── */}
                <div className="flex items-center gap-3">
                    {/* Queue */}
                    <button
                        onClick={() => setShowQueueDialog(true)}
                        className="hidden lg:flex relative items-center justify-center text-foreground-muted hover:text-foreground transition-colors duration-150"
                        title="Property Queue"
                    >
                        <i className="pi pi-inbox text-xl" />
                        {queueCount > 0 && (
                            <span className="absolute -top-2 -right-2.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold leading-none">
                                {queueCount}
                            </span>
                        )}
                    </button>

                    {/* Reminders */}
                    <NotificationBell />

                    {/* Profile avatar */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setProfileOpen(!profileOpen)}
                            className="flex items-center justify-center cursor-pointer"
                        >
                            {agent?.image ? (
                                <img
                                    src={agent.image}
                                    alt={agent?.name || 'Profile'}
                                    className="rounded-full object-cover"
                                    style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px' }}
                                />
                            ) : (
                                <div
                                    className="rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold"
                                    style={{ width: '32px', height: '32px', minWidth: '32px', minHeight: '32px' }}
                                >
                                    {getInitials()}
                                </div>
                            )}
                        </button>

                        {/* Dropdown */}
                        {profileOpen && (
                            <div className="absolute right-0 top-full mt-2 w-56 py-1.5 bg-surface rounded-lg shadow-dropdown border border-border z-[1060] animate-slide-down">
                                <div className="px-3 py-2.5 border-b border-border-subtle">
                                    <p className="text-sm font-semibold text-foreground truncate">
                                        {agent?.name}
                                    </p>
                                    <p className="text-xs text-foreground-muted truncate mt-0.5">
                                        {agent?.email}
                                    </p>
                                </div>
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            setProfileOpen(false);
                                            router.push('/profile');
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors duration-100"
                                    >
                                        <i className="pi pi-user text-sm text-foreground-muted" />
                                        My Profile
                                    </button>
                                </div>
                                <div className="border-t border-border-subtle my-1" />
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-colors duration-100"
                                >
                                    <i className="pi pi-sign-out text-sm" />
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Divider — desktop only */}
                    <div className="hidden md:block w-px h-5 bg-border mx-1" />

                    {/* Theme toggle — desktop only (mobile toggle lives in sidebar) */}
                    <button
                        onClick={toggleTheme}
                        className="hidden md:flex items-center justify-center text-foreground-muted hover:text-foreground transition-colors duration-150"
                        title={mounted && theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        aria-label="Toggle theme"
                    >
                        {mounted && (
                            <i className={`pi ${theme === 'dark' ? 'pi-sun' : 'pi-moon'} text-xl`} />
                        )}
                    </button>
                </div>
            </header>

            {/* Dialogs */}
            <PropertyQueueDialog
                visible={showQueueDialog}
                onHide={() => setShowQueueDialog(false)}
                onSendClick={handleSendClick}
            />
            <SendToLeadDialog
                visible={showSendDialog}
                onHide={() => setShowSendDialog(false)}
            />
        </>
    );
};

export default TopBar;
