// React & NextJS
import React, { useRef } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import showToast from '../utils/showToast';

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
// import './Login.scss';

// Dynamically import client-side-only components
// const Toast = dynamic(() => import('react-toastify').then((mod) => mod.Toast), { ssr: false });

const Index = () => {
    // _____________________Hooks_____________________\\
    const router = useRouter();
    const dispatch = useDispatch();

    const toastLogin = useRef(null);

    const responseGoogle = async (response) => {
        // Guard client-side operations
        if (typeof window === 'undefined') return;

        try {
            window.localStorage.setItem('googleCredential', JSON.stringify(response.credential));
            // console.log('Google response received:', response); // Debug: Confirm Google auth succeedss
            // console.log('Making API call to backend...'); // Debug: Before API
            const res = await IrgApi.post(
                '/auth/google-login',
                { credential: response.credential, clientId: response.clientId },
                {
                    headers: { 'Content-Type': 'application/json' },
                },
            );
            // console.log('API response:', res); // Debug: After API
            const { token } = res.data;
            const agent = res.data.data.user;

            dispatch(addAgent(agent));
            dispatch(loginUser(token));
            router.push('/dashboard');
            showToast('success', 'Successfully logged in!', 'Login Success');
        } catch (err) {
            if (toastLogin.current) {
                if (err.message === 'Request failed with status code 401') {
                    toastLogin.current.show({
                        severity: 'error',
                        summary: 'Invalid Credentials',
                        detail: 'Your email or password is incorrect. Please try again.',
                        life: 3000,
                    });
                } else {
                    toastLogin.current.show({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Something went wrong. Please try again.',
                        life: 3000,
                    });
                }
            }
            showToast('error', 'Login failed. Please try again.', 'Error');
        }
    };

    const onError = () => {
        if (typeof window === 'undefined') return;
        if (toastLogin.current) {
            toastLogin.current.show({
                severity: 'error',
                summary: 'Login Failed',
                detail: 'Google login failed. Please try again.',
                life: 3000,
            });
        }
        showToast('error', 'Google login failed.', 'Error');
    };

    return (
        <React.Fragment>
            <MainHead />
            <div className="login__page">
                {/* <Toast
                    ref={toastLogin}
                    style={{ fontSize: '1.7rem', width: '35rem' }}
                    position="top-right"
                    baseZIndex={200000000}
                /> */}
                <div className="login__page__form">
                    <img
                        src="/IRG-Main-Logo.png"
                        alt="Ice Realty Group Logo"
                        className="login__page__form__logo"
                    />
                    <div className="login__page__form__form">
                        <GoogleLogin
                            onSuccess={responseGoogle}
                            onError={onError}
                            useOneTap // Optional: Enables one-tap sign-in (new protocol feature)
                            auto_select
                            scope="openid email profile"
                        />
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default Index;
