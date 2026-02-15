// React & NextJS
import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// Dynamically import PrimeReact components
const Button = dynamic(() => import('primereact/button').then((mod) => mod.Button), { ssr: false });
const Checkbox = dynamic(() => import('primereact/checkbox').then((mod) => mod.Checkbox), { ssr: false });

// API & Utils
import IrgApi from '../assets/irgApi';
import showToast from '../utils/showToast';

/**
 * GoogleConnectButton Component
 * Allows agents to connect/disconnect their Google account for Calendar, Gmail, and Contacts integration
 */
const GoogleConnectButton = () => {
    const router = useRouter();
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const hasHandledCallback = useRef(false);

    // Calendar selection state
    const [calendars, setCalendars] = useState([]);
    const [selectedCalendarIds, setSelectedCalendarIds] = useState(['primary']);
    const [loadingCalendars, setLoadingCalendars] = useState(false);
    const [savingCalendars, setSavingCalendars] = useState(false);

    // Ensure component is mounted (client-side only)
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Handle OAuth callback on mount
    useEffect(() => {
        if (!isMounted || !isLoggedIn) return;

        const { google_auth } = router.query;

        // Check if we just completed OAuth flow (from localStorage flag)
        const oauthInProgress = typeof window !== 'undefined' && window.localStorage.getItem('google_oauth_in_progress');

        if (google_auth === 'success') {
            if (!hasHandledCallback.current) {
                hasHandledCallback.current = true;
                showToast('success', 'Google account connected successfully!', 'Connected');
                checkConnectionStatus();

                // Clean up URL and localStorage
                if (typeof window !== 'undefined') {
                    window.localStorage.removeItem('google_oauth_in_progress');
                }
                router.replace('/profile', undefined, { shallow: true });
            }
        } else if (google_auth === 'failed') {
            if (!hasHandledCallback.current) {
                hasHandledCallback.current = true;
                showToast('error', 'Failed to connect Google account. Please try again.', 'Connection Failed');

                // Clean up localStorage
                if (typeof window !== 'undefined') {
                    window.localStorage.removeItem('google_oauth_in_progress');
                }
                router.replace('/profile', undefined, { shallow: true });
            }
        } else if (oauthInProgress && !google_auth) {
            // OAuth was in progress but no callback received - clean up
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem('google_oauth_in_progress');
            }
        }
    }, [isMounted, isLoggedIn, router.query.google_auth]); // eslint-disable-line

    // Check connection status on mount
    useEffect(() => {
        if (!isMounted || !isLoggedIn) return;
        checkConnectionStatus();
    }, [isMounted, isLoggedIn]); // eslint-disable-line

    // Listen for messages from OAuth popup/redirect
    useEffect(() => {
        if (!isMounted) return;

        const handleMessage = (event) => {
            // Verify message origin for security
            const allowedOrigins = [
                window.location.origin,
                process.env.NEXT_PUBLIC_IRG_API_URL,
                'http://localhost:2000',
                'http://localhost:4000'
            ];

            if (!allowedOrigins.some(origin => event.origin.includes(origin))) {
                return;
            }

            // Handle OAuth callback message
            if (event.data.type === 'google_oauth_success') {
                if (!hasHandledCallback.current) {
                    hasHandledCallback.current = true;
                    showToast('success', 'Google account connected successfully!', 'Connected');
                    setProcessing(false);
                    checkConnectionStatus();
                }
            } else if (event.data.type === 'google_oauth_failed') {
                if (!hasHandledCallback.current) {
                    hasHandledCallback.current = true;
                    showToast('error', 'Failed to connect Google account. Please try again.', 'Connection Failed');
                    setProcessing(false);
                }
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [isMounted]); // eslint-disable-line

    // Check if Google account is connected
    const checkConnectionStatus = async () => {
        if (!isLoggedIn) return;

        try {
            const response = await IrgApi.get('/google/status', {
                headers: { Authorization: `Bearer ${isLoggedIn}` }
            });

            if (response.data.status === 'success') {
                const connected = response.data.data.connected;
                setIsConnected(connected);

                // Fetch calendars if connected
                if (connected) {
                    fetchCalendars();
                }
            }
        } catch (error) {
            console.error('Error checking Google connection:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch available calendars
    const fetchCalendars = async () => {
        if (!isLoggedIn) return;

        setLoadingCalendars(true);
        try {
            const response = await IrgApi.get('/google/calendar/list', {
                headers: { Authorization: `Bearer ${isLoggedIn}` }
            });

            if (response.data.status === 'success') {
                setCalendars(response.data.data);

                // Get agent's selected calendars (will be updated on first save)
                // For now, default to primary
                const primaryCalendar = response.data.data.find(cal => cal.primary);
                if (primaryCalendar && selectedCalendarIds.length === 1 && selectedCalendarIds[0] === 'primary') {
                    setSelectedCalendarIds([primaryCalendar.id]);
                }
            }
        } catch (error) {
            console.error('Error fetching calendars:', error);
        } finally {
            setLoadingCalendars(false);
        }
    };

    // Save selected calendars
    const handleSaveCalendars = async () => {
        if (!isLoggedIn || selectedCalendarIds.length === 0) return;

        setSavingCalendars(true);
        try {
            const response = await IrgApi.post(
                '/google/calendar/select',
                { calendarIds: selectedCalendarIds },
                { headers: { Authorization: `Bearer ${isLoggedIn}` } }
            );

            if (response.data.status === 'success') {
                showToast('success', 'Calendar selection saved!', 'Success');
            }
        } catch (error) {
            console.error('Error saving calendars:', error);
            showToast('error', 'Failed to save calendar selection', 'Error');
        } finally {
            setSavingCalendars(false);
        }
    };

    // Toggle calendar selection
    const handleToggleCalendar = (calendarId) => {
        setSelectedCalendarIds(prev => {
            if (prev.includes(calendarId)) {
                // Don't allow deselecting all calendars
                if (prev.length === 1) {
                    showToast('warn', 'At least one calendar must be selected', 'Warning');
                    return prev;
                }
                return prev.filter(id => id !== calendarId);
            } else {
                return [...prev, calendarId];
            }
        });
    };

    // Detect if user is on mobile device
    const isMobileDevice = () => {
        if (typeof window === 'undefined') return false;
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    };

    // Handle Google Connect
    const handleConnect = async () => {
        // Reset callback handler for new OAuth flow
        hasHandledCallback.current = false;
        setProcessing(true);

        try {
            // Get authorization URL
            const response = await IrgApi.get('/google/auth-url', {
                headers: { Authorization: `Bearer ${isLoggedIn}` }
            });

            if (response.data.status === 'success') {
                const authUrl = response.data.data.authUrl;

                // On mobile or if popup is not supported, use redirect flow
                if (isMobileDevice()) {
                    // Set flag in localStorage to track OAuth flow
                    if (typeof window !== 'undefined') {
                        window.localStorage.setItem('google_oauth_in_progress', 'true');
                    }

                    // Redirect to Google OAuth (same tab)
                    window.location.href = authUrl;
                    return;
                }

                // Desktop: Use popup flow
                const width = 600;
                const height = 700;
                const left = window.screenX + (window.outerWidth - width) / 2;
                const top = window.screenY + (window.outerHeight - height) / 2;

                const popup = window.open(
                    authUrl,
                    'Google Authorization',
                    `width=${width},height=${height},left=${left},top=${top}`
                );

                // Check if popup was blocked
                if (!popup || popup.closed || typeof popup.closed === 'undefined') {
                    // Popup was blocked, fall back to redirect flow
                    showToast('warn', 'Popup blocked. Redirecting to Google...', 'Notice');

                    if (typeof window !== 'undefined') {
                        window.localStorage.setItem('google_oauth_in_progress', 'true');
                    }

                    setTimeout(() => {
                        window.location.href = authUrl;
                    }, 1500);
                    return;
                }

                // Poll for popup closure with timeout
                let pollCount = 0;
                const maxPolls = 600; // 5 minutes (600 * 500ms = 300s)

                const pollInterval = setInterval(() => {
                    pollCount++;

                    // Check if polling has timed out
                    if (pollCount >= maxPolls) {
                        clearInterval(pollInterval);
                        setProcessing(false);
                        showToast('warn', 'Authorization timed out. Please try again.', 'Timeout');
                        if (popup && !popup.closed) {
                            popup.close();
                        }
                        return;
                    }

                    // Check if popup is closed or no longer accessible
                    try {
                        if (!popup || popup.closed) {
                            clearInterval(pollInterval);
                            setProcessing(false);

                            // Check if connection was successful after a short delay
                            setTimeout(() => {
                                checkConnectionStatus();
                            }, 1000);
                        }
                    } catch (e) {
                        // Cross-origin access error means popup navigated to Google - this is expected
                        // Continue polling
                    }
                }, 500);
            }
        } catch (error) {
            console.error('Error connecting to Google:', error);
            showToast('error', 'Failed to connect to Google', 'Error');
            setProcessing(false);
        }
    };

    // Handle Google Disconnect
    const handleDisconnect = async () => {
        setProcessing(true);

        try {
            const response = await IrgApi.post(
                '/google/disconnect',
                {},
                { headers: { Authorization: `Bearer ${isLoggedIn}` } }
            );

            if (response.data.status === 'success') {
                setIsConnected(false);
                showToast('success', 'Google account disconnected successfully', 'Success');
            }
        } catch (error) {
            console.error('Error disconnecting Google:', error);
            showToast('error', 'Failed to disconnect Google account', 'Error');
        } finally {
            setProcessing(false);
        }
    };

    // Don't render until component is mounted on client
    if (!isMounted || loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="pi pi-spin pi-spinner" style={{ fontSize: '1rem' }}></i>
                <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Loading...</span>
            </div>
        );
    }

    return (
        <div style={{
            padding: '1.5rem',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        }}>
            <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#2c3e50', marginBottom: '0.5rem' }}>
                    Google Integration
                </h3>
                <p style={{ color: '#6c757d', fontSize: '0.9rem', margin: 0 }}>
                    Connect your Google account to sync calendar events, send emails through Gmail, and add leads to your contacts.
                </p>
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                backgroundColor: isConnected ? '#d4edda' : '#f8f9fa',
                borderRadius: '6px',
                marginBottom: '1rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <i
                        className={isConnected ? 'pi pi-check-circle' : 'pi pi-times-circle'}
                        style={{
                            fontSize: '1.5rem',
                            color: isConnected ? '#28a745' : '#6c757d'
                        }}
                    ></i>
                    <div>
                        <div style={{ fontWeight: '600', color: '#2c3e50', fontSize: '0.95rem' }}>
                            {isConnected ? 'Connected' : 'Not Connected'}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                            {isConnected ? 'Your Google account is connected' : 'Connect to enable integrations'}
                        </div>
                    </div>
                </div>

                {isConnected ? (
                    <Button
                        label="Disconnect"
                        icon="pi pi-times"
                        className="p-button-danger p-button-outlined"
                        onClick={handleDisconnect}
                        disabled={processing}
                        loading={processing}
                    />
                ) : (
                    <Button
                        label="Connect Google"
                        icon="pi pi-google"
                        className="p-button-primary"
                        onClick={handleConnect}
                        disabled={processing}
                        loading={processing}
                    />
                )}
            </div>

            {isConnected && (
                <>
                    <div style={{
                        padding: '1rem',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        color: '#6c757d',
                        marginBottom: '1rem'
                    }}>
                        <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#2c3e50' }}>
                            Active Integrations:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                            <li>Google Calendar (events will appear in your CRM calendar)</li>
                            <li>Gmail (send emails to leads through your Gmail)</li>
                            <li>Google Contacts (add leads to your contacts with one click)</li>
                        </ul>
                    </div>

                    {/* Calendar Selection */}
                    <div style={{
                        padding: '1rem',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '6px',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ fontWeight: '600', color: '#2c3e50', fontSize: '0.95rem' }}>
                                Calendar Selection
                            </div>
                            <Button
                                label="Save"
                                icon="pi pi-check"
                                className="p-button-sm p-button-success"
                                onClick={handleSaveCalendars}
                                disabled={savingCalendars || loadingCalendars}
                                loading={savingCalendars}
                            />
                        </div>

                        {loadingCalendars ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem' }}>
                                <i className="pi pi-spin pi-spinner" style={{ fontSize: '1rem' }}></i>
                                <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Loading calendars...</span>
                            </div>
                        ) : calendars.length === 0 ? (
                            <div style={{ padding: '1rem', color: '#6c757d', fontSize: '0.85rem' }}>
                                No calendars found
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {calendars.map((calendar) => (
                                    <div
                                        key={calendar.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '0.75rem',
                                            backgroundColor: 'white',
                                            borderRadius: '4px',
                                            border: '1px solid #dee2e6'
                                        }}
                                    >
                                        <Checkbox
                                            inputId={calendar.id}
                                            checked={selectedCalendarIds.includes(calendar.id)}
                                            onChange={() => handleToggleCalendar(calendar.id)}
                                        />
                                        <label
                                            htmlFor={calendar.id}
                                            style={{
                                                flex: 1,
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                color: '#2c3e50',
                                                fontWeight: calendar.primary ? '600' : '400'
                                            }}
                                        >
                                            {calendar.summary}
                                            {calendar.primary && (
                                                <span style={{
                                                    marginLeft: '0.5rem',
                                                    fontSize: '0.75rem',
                                                    color: '#667eea',
                                                    fontWeight: '600'
                                                }}>
                                                    (Primary)
                                                </span>
                                            )}
                                        </label>
                                        {calendar.description && (
                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: '#6c757d',
                                                marginTop: '0.25rem'
                                            }}>
                                                {calendar.description}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: '#6c757d',
                                    marginTop: '0.5rem'
                                }}>
                                    Select which calendars to sync with your CRM. Click "Save" to apply changes.
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default GoogleConnectButton;
