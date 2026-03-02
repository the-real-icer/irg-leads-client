// React & NextJS
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import showToast from '../utils/showToast';

// Redux
import { useDispatch, useStore } from 'react-redux';

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
    const store = useStore();
    const [loginAttempted, setLoginAttempted] = useState(false);

    // Client-side device detection — runs after hydration to avoid SSR window access
    const [authConfig, setAuthConfig] = useState({
        uxMode: 'popup',
        loginUri: undefined,
        ready: false,
    });

    useEffect(() => {
        const mobile =
            /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent,
            ) ||
            // iPadOS 13+ reports desktop Safari UA — detect via touch support
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

        setAuthConfig({
            uxMode: mobile ? 'redirect' : 'popup',
            loginUri: mobile
                ? `${window.location.origin}/api/auth/google-callback`
                : undefined,
            ready: true,
        });

        console.log('[Google Auth] Device detection:', {
            mobile,
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            maxTouchPoints: navigator.maxTouchPoints,
        });
    }, []);

    const responseGoogle = async (credentialResponse) => {
        try {
            const res = await IrgApi.post(
                '/auth/google-login',
                { credential: credentialResponse.credential },
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
                console.warn('[Google Auth] persistor.flush failed:', e);
            }

            router.push('/dashboard');
            showToast('success', 'Successfully logged in!', 'Login Success');
        } catch (err) {
            showToast('error', 'Login failed. Please try again.', 'Error');
        }
    };

    const onError = () => {
        if (loginAttempted) {
            showToast('error', 'Google login failed. Please try again.', 'Error');
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
                        {authConfig.ready ? (
                            <GoogleLogin
                                onSuccess={responseGoogle}
                                onError={onError}
                                ux_mode={authConfig.uxMode}
                                login_uri={authConfig.loginUri}
                            />
                        ) : (
                            <div style={{ height: '44px', width: '220px' }} />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Index;
