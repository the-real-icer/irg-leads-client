// React & NextJS
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import showToast from '../utils/showToast';

// Redux
import { useDispatch, useStore, useSelector } from 'react-redux';

// Auth
import { signIn, useSession, signOut } from 'next-auth/react';

import MainHead from '../components/layout/MainHead/MainHead';

// IRG API - HOOKS - INFO - UTILS
import IrgApi from '../assets/irgApi';
import { addAgent, loginUser } from '../store/actions';

const Index = () => {
    // _____________________Hooks_____________________\\
    const router = useRouter();
    const dispatch = useDispatch();
    const store = useStore();
    const isLoggedIn = useSelector((state) => state.isLoggedIn);

    // next-auth session — only used to capture the Google id_token
    const { data: session, status } = useSession();

    const [isProcessing, setIsProcessing] = useState(false);
    const [hasProcessed, setHasProcessed] = useState(false);

    // If user is already logged in (Redux), redirect to dashboard
    useEffect(() => {
        if (isLoggedIn) {
            router.replace('/dashboard');
        }
    }, [isLoggedIn, router]);

    /**
     * Core login flow:
     * When next-auth session has a googleIdToken, POST it to the CRM
     * backend for verification + agent lookup. This is the same payload
     * the backend already expects — zero backend changes needed.
     */
    const processLogin = useCallback(
        async (googleIdToken) => {
            if (isProcessing || hasProcessed) return;
            setIsProcessing(true);

            try {
                const res = await IrgApi.post(
                    '/auth/google-login',
                    { credential: googleIdToken },
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
                    console.warn('[Auth] persistor.flush failed:', e);
                }

                setHasProcessed(true);

                // Navigate first, then clean up next-auth session
                router.push('/dashboard');
                showToast('success', 'Successfully logged in!', 'Login Success');

                // Destroy next-auth session — its job is done, real auth is in Redux
                signOut({ redirect: false }).catch(() => {});
            } catch (err) {
                const msg =
                    err.response?.data?.message || 'Login failed. Please try again.';
                showToast('error', msg, 'Error');

                // Clear next-auth session so user can retry
                await signOut({ redirect: false }).catch(() => {});
                setIsProcessing(false);
            }
        },
        [isProcessing, hasProcessed, dispatch, store, router],
    );

    // Watch for next-auth session with Google id_token
    useEffect(() => {
        if (
            status === 'authenticated' &&
            session?.googleIdToken &&
            !isProcessing &&
            !hasProcessed &&
            !isLoggedIn
        ) {
            processLogin(session.googleIdToken);
        }
    }, [status, session, isProcessing, hasProcessed, isLoggedIn, processLogin]);

    // Handle next-auth errors passed via query param (?error=...)
    useEffect(() => {
        const { error } = router.query;
        if (error) {
            const messages = {
                OAuthSignin: 'Could not start Google sign-in.',
                OAuthCallback: 'Google sign-in was cancelled or failed.',
                OAuthCreateAccount: 'Could not create account.',
                Callback: 'Sign-in callback error.',
                Default: 'An authentication error occurred.',
            };
            showToast('error', messages[error] || messages.Default, 'Sign-In Error');
            // Clean the error from the URL
            router.replace('/', undefined, { shallow: true });
        }
    }, [router.query.error]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleGoogleLogin = () => {
        signIn('google', { callbackUrl: '/' });
    };

    // Show loading while processing the CRM login after Google auth returns
    const showLoading = isProcessing || (status === 'authenticated' && !hasProcessed);

    return (
        <>
            <MainHead title="Login" />
            <div className="login__page">
                <div className="login__page__form">
                    <img
                        src="/IRG-Main-Logo.png"
                        alt="Ice Realty Group Logo"
                        className="login__page__form__logo"
                    />
                    <div className="login__page__form__form">
                        {showLoading ? (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 24px',
                                    fontSize: '14px',
                                    color: '#6b7280',
                                }}
                            >
                                Signing you in...
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                disabled={status === 'loading'}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '10px 24px',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    fontFamily:
                                        "'Google Sans', Roboto, Arial, sans-serif",
                                    color: '#1f1f1f',
                                    backgroundColor: '#fff',
                                    border: '1px solid #dadce0',
                                    borderRadius: '4px',
                                    cursor:
                                        status === 'loading'
                                            ? 'not-allowed'
                                            : 'pointer',
                                    height: '40px',
                                    minWidth: '220px',
                                    justifyContent: 'center',
                                }}
                            >
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 18 18"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fill="#4285F4"
                                        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                                    />
                                </svg>
                                Sign in with Google
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Index;
