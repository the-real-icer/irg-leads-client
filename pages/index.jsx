// React & NextJS
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import showToast from '../utils/showToast';
import isMobile from '../utils/deviceDetect';

// Redux
import { useDispatch } from 'react-redux';

// Third Party Components
const GoogleLogin = dynamic(() => import('@react-oauth/google').then((mod) => mod.GoogleLogin), {
    ssr: false,
});

import MainHead from '../components/layout/MainHead/MainHead';

// IRG API - HOOKS - INFO - UTILS
import IrgApi from '../assets/irgApi';
import { addAgent, loginUser } from '../store/actions';

const Index = () => {
    // _____________________Hooks_____________________\\
    const router = useRouter();
    const dispatch = useDispatch();
    const [loginAttempted, setLoginAttempted] = useState(false);
    const [debugLog, setDebugLog] = useState([]);

    const addLog = (msg) => {
        setDebugLog((prev) => [...prev, `${new Date().toISOString().slice(11, 19)} ${msg}`]);
        console.log(msg); // eslint-disable-line
    };

    useEffect(() => {
        addLog('[Google Auth] Component mounted');
        addLog(`[Google Auth] NEXT_PUBLIC_GOOGLE_CLIENT_ID: ${
            process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
                ? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID.substring(0, 20) + '...'
                : 'MISSING — env var not set'
        }`);
        addLog(`[Google Auth] Window location: ${window.location.href}`);
        addLog(`[Google Auth] User agent: ${navigator.userAgent}`);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const responseGoogle = async (credentialResponse) => {
        // Guard client-side operations
        if (typeof window === 'undefined') return;

        addLog('[Google Auth] Google returned credential');
        addLog(`[Google Auth] Credential present: ${!!credentialResponse?.credential}`);
        addLog(`[Google Auth] Credential length: ${credentialResponse?.credential?.length}`);
        addLog(`[Google Auth] Client ID present: ${!!credentialResponse?.clientId}`);

        addLog('[Google Auth] Sending credential to backend...');

        try {
            const res = await IrgApi.post(
                '/auth/google-login',
                { credential: credentialResponse.credential, clientId: credentialResponse.clientId },
                {
                    headers: { 'Content-Type': 'application/json' },
                },
            );

            addLog('[Google Auth] Backend response received');
            addLog(`[Google Auth] Response status: ${res.status}`);
            addLog(`[Google Auth] Token present: ${!!res.data?.token}`);
            addLog(`[Google Auth] User present: ${!!res.data?.data?.user}`);

            const { token } = res.data;
            const agent = res.data.data.user;

            dispatch(addAgent(agent));
            dispatch(loginUser(token));
            router.push('/dashboard');
            showToast('success', 'Successfully logged in!', 'Login Success');
        } catch (err) {
            addLog('[Google Auth] Backend call failed');
            addLog(`[Google Auth] Error status: ${err.response?.status}`);
            addLog(`[Google Auth] Error message: ${err.response?.data?.message || err.message}`);
            addLog(`[Google Auth] Full error response: ${JSON.stringify(err.response?.data)}`);
            addLog(`[Google Auth] Request URL: ${err.config?.url}`);
            showToast('error', 'Login failed. Please try again.', 'Error');
        }
    };

    const onError = (error) => {
        if (typeof window === 'undefined') return;
        addLog('[Google Auth] Google returned error');
        addLog(`[Google Auth] Error object: ${JSON.stringify(error)}`);
        addLog(`[Google Auth] Error type: ${typeof error}`);
        addLog(`[Google Auth] Window origin: ${window.location.origin}`);
        if (loginAttempted) {
            showToast('error', 'Google login failed. Please try again.', 'Error');
        } else {
            console.warn('Google GIS background error (non-critical)'); // eslint-disable-line
        }
    };

    return (
        <>
            <MainHead />
            <div className="login__page">
                <div className="login__page__form">
                    <img
                        src="/IRG-Main-Logo.png"
                        alt="Ice Realty Group Logo"
                        className="login__page__form__logo"
                    />
                    <div className="login__page__form__form" onClick={() => setLoginAttempted(true)}>
                        <GoogleLogin
                            onSuccess={responseGoogle}
                            onError={onError}
                            ux_mode={isMobile() ? 'redirect' : 'popup'}
                            login_uri={
                                isMobile()
                                    ? `${window.location.origin}/api/auth/google-callback`
                                    : undefined
                            }
                        />
                    </div>
                </div>
            </div>
            {debugLog.length > 0 && (
                <div style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    maxHeight: '40vh',
                    overflowY: 'auto',
                    background: 'rgba(0,0,0,0.9)',
                    color: '#00ff00',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    padding: '8px',
                    zIndex: 99999,
                    borderTop: '1px solid #333',
                }}>
                    {debugLog.map((log, i) => (
                        <div key={i}>{log}</div>
                    ))}
                </div>
            )}
        </>
    );
};

export default Index;
