import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useStore } from 'react-redux';

import IrgApi from '../../../assets/irgApi';
import { addAgent, loginUser } from '../../../store/actions';
import showToast from '../../../utils/showToast';

const GoogleCallbackPage = () => {
    const dispatch = useDispatch();
    const store = useStore();
    const router = useRouter();
    const [status, setStatus] = useState('Signing you in...');
    const [error, setError] = useState(null);

    useEffect(() => {
        const processLogin = async () => {
            // Credential is in the URL hash (set by the API route redirect)
            const hash = window.location.hash.substring(1);
            const params = new URLSearchParams(hash);
            const credential = params.get('credential');

            if (!credential) {
                setError('No credential received from Google.');
                return;
            }

            try {
                setStatus('Verifying your account...');
                const res = await IrgApi.post(
                    '/auth/google-login',
                    { credential },
                    { headers: { 'Content-Type': 'application/json' } },
                );

                const { token } = res.data;
                const agent = res.data.data.user;

                dispatch(addAgent(agent));
                dispatch(loginUser(token));

                // Flush redux-persist to localStorage before navigating
                try {
                    await store.__persistor?.flush();
                } catch (e) {
                    console.warn('[Google Callback] persistor.flush failed:', e);
                }

                showToast('success', 'Successfully logged in!', 'Login Success');
                router.replace('/dashboard');
            } catch (err) {
                const msg = err.response?.data?.message || 'Login failed. Please try again.';
                setError(msg);
            }
        };

        processLogin();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                gap: '16px',
                fontFamily: 'var(--font-inter, sans-serif)',
            }}
        >
            {error ? (
                <>
                    <p style={{ color: '#dc2626', fontSize: '14px' }}>{error}</p>
                    <button
                        type="button"
                        onClick={() => router.replace('/')}
                        style={{
                            padding: '10px 20px',
                            background: '#2563eb',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                        }}
                    >
                        Back to Login
                    </button>
                </>
            ) : (
                <p style={{ fontSize: '14px', color: '#6b7280' }}>{status}</p>
            )}
        </div>
    );
};

export default GoogleCallbackPage;
