// Font
import { Inter } from 'next/font/google';
import { useEffect, useRef } from 'react';

// Redux & Connect
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { wrapper } from '../store';

// API
import { setupAuthInterceptor } from '../assets/irgApi';

// Prop-Types
import PropTypes from 'prop-types';

// React-Toastify
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Google Login
import { GoogleOAuthProvider } from '@react-oauth/google';

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

const MyApp = ({ Component, ...rest }) => {
    // _________________________________Constants________________________\\
    // Redux STORE
    const { store, props } = wrapper.useWrappedStore(rest);
    const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
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
                    <GoogleOAuthProvider clientId={CLIENT_ID}>
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
                    </GoogleOAuthProvider>
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
