// React & NextJS
import { useState } from 'react';
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

    const responseGoogle = async (credentialResponse) => {
        if (typeof window === 'undefined') return;

        try {
            const res = await IrgApi.post(
                '/auth/google-login',
                { credential: credentialResponse.credential, clientId: credentialResponse.clientId },
                {
                    headers: { 'Content-Type': 'application/json' },
                },
            );

            const { token } = res.data;
            const agent = res.data.data.user;

            dispatch(addAgent(agent));
            dispatch(loginUser(token));
            router.push('/dashboard');
            showToast('success', 'Successfully logged in!', 'Login Success');
        } catch (err) {
            showToast('error', 'Login failed. Please try again.', 'Error');
        }
    };

    const onError = () => {
        if (typeof window === 'undefined') return;
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
        </>
    );
};

export default Index;
