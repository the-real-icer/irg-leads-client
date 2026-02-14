// React & NextJS
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import dynamic from 'next/dynamic';

// Dynamically import PrimeReact components
const Button = dynamic(() => import('primereact/button').then((mod) => mod.Button), { ssr: false });

// API & Utils
import IrgApi from '../assets/irgApi';
import showToast from '../utils/showToast';

/**
 * GoogleConnectButton Component
 * Allows agents to connect/disconnect their Google account for Calendar, Gmail, and Contacts integration
 */
const GoogleConnectButton = () => {
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Check connection status on mount
    useEffect(() => {
        checkConnectionStatus();
    }, [isLoggedIn]);

    // Check if Google account is connected
    const checkConnectionStatus = async () => {
        if (!isLoggedIn) return;

        try {
            const response = await IrgApi.get('/google/status', {
                headers: { Authorization: `Bearer ${isLoggedIn}` }
            });

            if (response.data.status === 'success') {
                setIsConnected(response.data.data.connected);
            }
        } catch (error) {
            console.error('Error checking Google connection:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle Google Connect
    const handleConnect = async () => {
        setProcessing(true);

        try {
            // Get authorization URL
            const response = await IrgApi.get('/google/auth-url', {
                headers: { Authorization: `Bearer ${isLoggedIn}` }
            });

            if (response.data.status === 'success') {
                const authUrl = response.data.data.authUrl;

                // Open OAuth popup
                const width = 600;
                const height = 700;
                const left = window.screenX + (window.outerWidth - width) / 2;
                const top = window.screenY + (window.outerHeight - height) / 2;

                const popup = window.open(
                    authUrl,
                    'Google Authorization',
                    `width=${width},height=${height},left=${left},top=${top}`
                );

                // Poll for popup closure and check connection status
                const pollInterval = setInterval(() => {
                    if (popup.closed) {
                        clearInterval(pollInterval);
                        setProcessing(false);

                        // Check if connection was successful
                        setTimeout(() => {
                            checkConnectionStatus();
                        }, 1000);
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

    if (loading) {
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
                <div style={{
                    padding: '1rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    color: '#6c757d'
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
            )}
        </div>
    );
};

export default GoogleConnectButton;
