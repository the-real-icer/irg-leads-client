// Font
import { Inter } from 'next/font/google';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Redux & Connect
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { wrapper } from '../store';

// API
import IrgApi, { COOKIE_AUTH_FALLBACK, setupAuthInterceptor } from '../assets/irgApi';
import { addAgent, loginUser } from '../store/actions';

// Prop-Types
import PropTypes from 'prop-types';

// React-Toastify
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth
import { SessionProvider } from 'next-auth/react';

// Design System
import '../styles/design-tokens.css';
import '../styles/tailwind.css';

// Component Style (PrimeReact + PrimeFlex — will phase out during overhaul)
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import '../sass/main.scss';

// Fancybox Lightbox (global import required for Next.js)
import '@fancyapps/ui/dist/fancybox/fancybox.css';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
});

const AuthBootstrap = () => {
    const dispatch = useDispatch();
    const isLoggedIn = useSelector((state) => state.isLoggedIn);
    const hasCheckedAuth = useRef(false);

    useEffect(() => {
        if (isLoggedIn || hasCheckedAuth.current) {
            return;
        }

        hasCheckedAuth.current = true;

        IrgApi.get('/auth/check-auth')
            .then((response) => {
                const agent = response.data?.data;
                if (!agent) return;

                dispatch(addAgent(agent));
                dispatch(loginUser(COOKIE_AUTH_FALLBACK));
            })
            .catch(() => {});
    }, [dispatch, isLoggedIn]);

    return null;
};

const MyApp = ({ Component, ...rest }) => {
    // _________________________________Constants________________________\\
    // Redux STORE
    const { store, props } = wrapper.useWrappedStore(rest);
    const interceptorSet = useRef(false);

    // Set up 401 interceptor once on mount
    useEffect(() => {
        if (!interceptorSet.current) {
            setupAuthInterceptor(store);
            interceptorSet.current = true;
        }
    }, [store]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className={`${inter.variable} font-sans`}>
            <Provider store={store}>
                <PersistGate persistor={store.__persistor}>
                    <SessionProvider
                        session={props.pageProps.session}
                        refetchInterval={0}
                        refetchOnWindowFocus={false}
                    >
                        <AuthBootstrap />
                        <ToastContainer
                            position="top-left"
                            autoClose={4000}
                            hideProgressBar={false}
                            newestOnTop
                            closeOnClick={false}
                            rtl={false}
                            pauseOnFocusLoss
                            draggable={false}
                            pauseOnHover
                        />
                        <Component {...props.pageProps} />
                    </SessionProvider>
                </PersistGate>
            </Provider>
        </div>
    );
};

MyApp.propTypes = {
    Component: PropTypes.elementType.isRequired,
    pageProps: PropTypes.object, // Optional, as pages may not pass props
};

export default MyApp;
